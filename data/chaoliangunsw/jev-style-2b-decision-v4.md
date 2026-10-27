# chaoliangUNSW/Jev-Style-2B-Decision-v4

## Resumen

Jev-Style-2B-Decision-v4 es un modelo de decisión: recibe un estado (texto, JSON e imágenes) y una pregunta tipada, y devuelve en una sola pasada una probabilidad calibrada para cada opción planteada. No genera texto libre ni puede responder fuera del conjunto de opciones que se le entrega, lo que lo convierte en una pieza orientada a enrutado, guardarraíles y clasificación con incertidumbre explícita. Lo desarrolla chaoliangUNSW y se publica con pesos abiertos bajo licencia Apache-2.0.

Técnicamente es un fine-tune de Qwen/Qwen3.5-2B que conserva la torre de visión del modelo base, con 2.213.241.664 parámetros totales (2,21B) y un repositorio de 4,4 GB en safetensors. Admite tres tipos de pregunta: elección entre N opciones con nombre, binaria sí/no y puntuación sobre 2 a 10 niveles ordenados. La ventana de contexto es de 32.768 tokens por llamada, frente a los 25.600 de la versión v3.

La novedad principal de esta versión es la entrada multimodal: el estado puede incluir fotos, capturas, recibos, gráficos o formularios escaneados mediante marcadores `<|image_1|>` … `<|image_n|>`. Según el autor, cada imagen consume del orden de 440 tokens y la latencia mediana es de 16 ms por petición en una A100 en bfloat16 con CUDA graphs, lo que sitúa al modelo en la categoría de componentes rápidos para preprocesado y políticas de decisión dentro de pipelines mayores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5) con torre de visión, ajustado como cabecera de decisión sobre opciones; etiquetado por el autor como "system-one" |
| Parámetros totales | 2.213.241.664 (2,21B, incluida la torre de visión) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por llamada (v3: 25.600) |
| Tipos de cuantización | no disponible; el runtime de referencia ejecuta en float32 y los benchmarks se declaran en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 4,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B (relación `finetune` declarada en la model card) y mantiene la torre de visión del modelo base, de ahí que el recuento de parámetros (2,21B) incluya componentes visuales. La función aprendida no es la generación de texto sino la puntuación de opciones: el estado se codifica una vez y la cabeza produce una distribución de probabilidad sobre las alternativas de la pregunta, con una temperatura de calibración distinta por tipo de pregunta (elección, binaria o escala). El runtime agrupa varias preguntas sobre un mismo estado en una sola llamada (`decide_many`), de forma que el estado se lee una única vez y las preguntas comparten el coste de codificación.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La model card tampoco documenta innovaciones de atención (atención lineal, decodificación especulativa) más allá del etiquetado "system-one", que sugiere una inferencia de un solo paso sin cadena de razonamiento. Sí se documenta el mecanismo de decisión tipado, la calibración por temperatura y el modo por lotes con reutilización del estado compartido.

## Capacidades

- Clasificación con opciones con nombre (`choice`): devuelve la opción más probable y la distribución completa sobre N alternativas.
- Decisión binaria sí/no: devuelve `{"false": p, "true": p}` con probabilidad calibrada.
- Puntuación ordinal (`score`): distribución sobre 2 a 10 niveles ordenados, útil para urgencia, severidad o calidad.
- Entrada multimodal: imágenes dentro del estado (fotos, capturas, recibos, gráficos, formularios escaneados) mediante marcadores `<|image_1|>` … `<|image_n|>`; aproximadamente 440 tokens por imagen.
- Estado heterogéneo: acepta texto plano, JSON estructurado o una mezcla de ambos junto con imágenes.
- Múltiples preguntas por estado en una sola llamada, con una sola lectura del estado y cálculo compartido.
- Salidas instrumentadas: `probabilities`, `scores` en crudo, `temperature` aplicada, `top_probability`, `entropy_concentration`, recuento de tokens (`input_tokens`, `state_tokens`, `head_tokens`, `image_tokens`), `blocks`, `catalogue_overflow`, `model` y `backend`.
- Modo por lotes vía JSONL (`--jsonl file|-`), con reutilización del cálculo de estado para filas consecutivas con el mismo estado e imágenes.
- Verificación de integridad con `--verify`, que comprueba pesos, tokenizador, configuraciones, runtime y código de referencia contra un manifiesto sha256.
- No soporta generación de texto libre ni respuesta fuera del catálogo de opciones proporcionado.

## Casos de uso

- Enrutado de tickets de soporte: con el estado compuesto por el mensaje del cliente y las descripciones de cada equipo, el modelo devuelve la probabilidad de asignación a facturación, técnico o ventas; en el ejemplo de la model card la opción "billing" obtiene 0,994, lo que permite aplicar umbrales y escalar a revisión humana los casos con entropía alta.
- Aplicación de políticas de negocio: recibiendo el pedido en JSON, el texto de la política y el mensaje del cliente, responde a preguntas binarias del tipo "¿se puede cancelar sin coste?" con probabilidad calibrada (0,912 en el ejemplo publicado), lo que encaja en motores de decisión que necesitan un valor de confianza y no una frase generada.
- Clasificación de gastos con visión: a partir de la imagen de un recibo y una política de aprobación, decide si requiere aprobación de un responsable (0,884 para "true" con un recibo de 66,90 EUR) y asigna categoría de gasto (comidas, viaje, alojamiento, material de oficina) con distribución completa.
- Guardarraíles y moderación: evaluación de afirmaciones sobre una entrada (por ejemplo, si un contenido cumple una política) como pregunta binaria, aprovechando que el modelo no puede producir texto libre y por tanto no expone superficie de inyección de salida.
- Enrutado de LLM (`llm-routing`): decidir qué modelo, herramienta o agente debe atender una consulta, usando la distribución de probabilidad como señal para umbrales de coste y escalado.
- Triage de urgencia: preguntas de tipo `score` sobre 2 a 10 niveles para priorizar colas de atención, con la ventaja de una latencia mediana de 16 ms por petición en A100 que permite evaluar cada elemento de una cola sin coste apreciable.
- Preetiquetado por lotes para anotación: ejecución JSONL sobre miles de registros con estado compartido, generando probabilidades que luego se filtran por `top_probability` o `entropy_concentration` para revisión humana.

## Benchmarks y rendimiento

Resultados declarados por el autor y ejecutados por él mismo ("self-run, complete"):

| Benchmark | Jev-Style 2B v4 | Jev-Style 2B v3 |
|---|---:|---:|
| Decision Index 0.3, índice público | 44,37 | 34,05 |
| Decision Index Vision, índice público | 57,55 | sin entrada de imagen |
| JevBench v1.4.1, ítems públicos (231) | 74,9 % | 73,6 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con modelos de terceros. Las cifras anteriores proceden del autor y no de una evaluación independiente.

## Requisitos de hardware

- VRAM estimada: en float32 (modo por defecto del runtime de referencia) los 2,21B parámetros ocupan del orden de 8,9 GB, por lo que conviene contar con 10-12 GB de VRAM; en bfloat16 los pesos bajan a unos 4,4 GB, que con cachés y activaciones se sitúan en torno a 6-8 GB.
- GPU de referencia: el autor reporta latencia mediana de 16 ms por petición en una A100 en bfloat16 con CUDA graphs, con una petición simultánea.
- GPU recomendadas: A100 o H100 para el modo de referencia; RTX 4090 y GPUs consumer de 12-24 GB para float32 sin problemas; GPUs de 8 GB viables solo en bfloat16.
- Cabe en GPU consumer: sí, en tarjetas de 8 GB o más si se ejecuta en bfloat16; en float32 se recomienda 12 GB o más.
- Opciones de despliegue: runtime propio `jev_style_decision.py` con `requirements.txt` (torch 2.14.1, torchvision 0.29.1, transformers 5.17.0, tokenizers 0.23.3, pillow); interfaz Python `JevStyleDecision`, CLI con `--state`/`--state-json`/`--question`/`--options`/`--image` y modo por lotes `--jsonl`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Throughput: no disponible; la latencia publicada corresponde a una petición a la vez. El modo por lotes con estado compartido reduce el coste cuando varias preguntas recaen sobre el mismo estado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto por llamada | Entrada de imagen | Decision Index 0.3 | JevBench v1.4.1 | Licencia |
|---|---|---:|---|---:|---:|---|
| Jev-Style-2B-Decision-v4 (este modelo) | 2,21B | 32.768 | Sí | 44,37 | 74,9 % | Apache-2.0 |
| Jev-Style-2B-Decision-v3 | 2B (cifra exacta no disponible) | 25.600 | No | 34,05 | 73,6 % | no disponible |
| Jev-Style-0.8B-Decision-v3 | 0,8B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen/Qwen3.5-2B (modelo base) | 2B (cifra exacta no disponible) | no disponible | Sí (torre de visión) | no disponible | no disponible | no disponible |

La comparación con modelos de propósito general no es directa: v4 no genera texto, sino que puntúa opciones, por lo que su alternativa natural son clasificadores y enrutadores, no LLM generativos.

## Limitaciones y advertencias

- No genera texto libre: solo puede responder dentro del catálogo de opciones recibido; cualquier necesidad de explicación o justificación queda fuera de su alcance.
- El catálogo de opciones está acotado; la salida incluye el campo `catalogue_overflow` para señalar desbordamientos, pero un exceso de opciones degrada la tarea.
- Los benchmarks publicados son auto-evaluados por el autor sobre índices propios (Decision Index 0.3, Decision Index Vision, JevBench v1.4.1) sin verificación independiente.
- No se documentan idiomas soportados; no hay garantía explícita de comportamiento en castellano ni en otros idiomas distintos del inglés de los ejemplos.
- Riesgo de calibración defectuosa fuera de distribución: las probabilidades son calibradas por tipo de pregunta, pero no se documenta su fiabilidad ante dominios, longitudes o idiomas alejados de los datos de ajuste.
- Cada imagen consume del orden de 440 tokens del presupuesto de 32.768, por lo que estados con muchas imágenes reducen el espacio disponible para texto.
- El uso de imágenes exige colocar cada marcador `<|image_1|>` … `<|image_n|>` exactamente una vez en el estado y pasar las imágenes en el mismo orden; un desajuste invalida la petición.
- El runtime de referencia requiere versiones muy concretas del stack (torch 2.14.1, transformers 5.17.0, tokenizers 0.23.3, torchvision 0.29.1), lo que puede complicar la integración en entornos existentes.
- No se detallan sesgos conocidos, composición del dataset de ajuste ni evaluación de seguridad en la información disponible.
- Licencia Apache-2.0: permite uso comercial y modificación con obligaciones de atribución y conservación del aviso de licencia; no se especifican restricciones adicionales de uso aceptable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4
- Sitio web del proyecto: https://jevstyle.com
- Repositorio GitHub: https://github.com/lawrence3699/jev-style
- Versión v1 (2B, GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Versión v2 (2B): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2
- Versión v3 (0.8B): https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Versión v3 (2B): https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
