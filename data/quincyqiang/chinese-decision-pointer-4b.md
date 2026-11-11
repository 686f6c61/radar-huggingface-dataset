# quincyqiang/chinese-decision-pointer-4b

## Resumen

Chinese Decision Pointer 4B es un modelo de decisión derivado por fine-tuning de Qwen3.5-4B, desarrollado por el usuario quincyqiang. Su propósito no es generar texto, sino devolver, en una única pasada forward, una probabilidad calibrada para cada uno de los candidatos propuestos por el usuario ante un estado y una o varias preguntas. Resuelve el problema de la selección entre opciones discretas con incertidumbre cuantificable, algo que los modelos generativos abordan de forma indirecta mediante la generación de letras o etiquetas.

La innovación principal es un mecanismo de *pointer readout*: se inserta un marcador tras cada candidato y otro al final de cada pregunta, y una cabeza de puntero de 256 dimensiones puntúa cada par pregunta-candidato. Esto elimina el límite de 26 opciones del enfoque basado en letras de su predecesor y permite responder varias preguntas sobre un mismo estado en una sola secuencia. El modelo tiene 4.207.067.905 parámetros (4B) y se distribuye en formato safetensors BF16 con licencia Apache-2.0.

Es relevante ahora porque ofrece una primitiva de decisión calibrada y de baja latencia (mediana de 64 ms en A800) para pipelines de agentes, clasificación zero-shot y enrutamiento, sin coste de generación autoregresiva. En la suite pública Decision Index 0.3 obtiene una puntuación de 61,69 sobre 140.178 peticiones completas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-4B con capas de atención completa y lineal, más cabeza de puntero de 256 dimensiones |
| Parámetros totales | 4.207.067.905 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fichero único `model.safetensors`, BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y se ajusta con LoRA de rango 64, que posteriormente se fusiona en pesos BF16. La arquitectura conserva las capas de atención completa y lineal del base, pero introduce dos modificaciones: atención bidireccional dentro del prompt en las capas de atención completa (las lineales permanecen causales), de modo que los candidatos pueden verse entre sí; y un mecanismo de pointer readout en el que cada candidato se delimita con `<|object_ref_end|>` y cada pregunta con `<|object_ref_start|>`, y una cabeza de 256 dimensiones puntúa los pares decisión-candidato antes de aplicar softmax. La calibración se realiza en un split independiente, fijando una temperatura T = 1,538 registrada en `decision_config.json`.

El entrenamiento se organiza en varias fases. La primera (v2) parte de decision-mix-v2, compuesto por los splits de entrenamiento de 76 datasets públicos (aproximadamente 1,12 millones de preguntas) más CJ-Dataset de decisión en chino, con una época y pérdida CE combinada con RLCD. La segunda fase añade generadores propios con etiquetas calculadas programáticamente (control de domótica, escalera causal, reconocimiento de acordes, predicción de salida de Python, puzzles estilo BIG-Bench) y splits de entrenamiento de VAST, ACOS, Habermas Machine, iSarcasmEval (sin la tarea A en inglés) y MetaMathQA. Finalmente, se promedian los pesos de las rondas 2 y 4 mediante un promedio exacto de LoRA con rango 128 y se fusionan para la exportación. Se aplicó descontaminación comparando fragmentos de 13 unidades de palabra contra el conjunto público de Decision Index 0.3, eliminando las coincidencias.

## Capacidades

- Decisión entre candidatos con probabilidad calibrada en una sola pasada forward, sin generación de texto.
- Soporte de múltiples preguntas sobre un mismo estado en una única secuencia.
- Clasificación zero-shot (pipeline declarado: `zero-shot-classification`).
- Enrutamiento y selección de herramientas o acciones en pipelines de agentes.
- Evaluación de opciones en dominios de conocimiento, razonamiento, comprensión del lenguaje, recuperación, clasificación, herramientas y automatización, y gusto artístico (según los ejes de Decision Index).
- Capacidades multilingües limitadas a chino e inglés.
- No soporta tool calling generativo, agentes multi-paso ni modos de pensamiento: su función es exclusivamente la selección entre candidatos proporcionados por el llamante.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: dado un mensaje y un conjunto de intenciones o departamentos candidatos, el modelo devuelve la probabilidad de cada uno en una sola pasada, lo que permite umbrales de confianza y derivación a humano cuando la probabilidad máxima es baja.
- Clasificación zero-shot de tickets o documentos: se enumeran las categorías como candidatos y se obtiene una distribución calibrada sin necesidad de entrenar un clasificador específico.
- Selección de herramientas en un agente: el orquestador propone varias herramientas o acciones y el modelo puntúa cada una según el estado actual, sirviendo como paso de decisión de baja latencia (mediana de 64 ms en A800).
- Control de domótica: los generadores de entrenamiento incluyen peticiones de hogar inteligente, por lo que el modelo puede elegir entre acciones candidatas (encender, apagar, ajustar) a partir de una instrucción y el estado del sistema.
- Filtrado y moderación con calibración: al devolver probabilidades calibradas, permite fijar umbrales operativos y estimar tasas de error esperadas en producción.
- Evaluación de opciones en sistemas de recomendación o encuestas: dado un estado y varias alternativas, se obtiene una distribución de preferencia que puede agregarse o compararse entre candidatos.
- Preguntas múltiples sobre un mismo contexto: en un formulario o cuestionario, todas las preguntas sobre un estado se responden en una sola secuencia, reduciendo el coste frente a llamadas independientes.

## Benchmarks y rendimiento

Resultados en la suite pública Decision Index 0.3 (140.178 peticiones, completas; `debias="reverse"`, BF16, una GPU):

| Dominio | Puntuación (corregida por oportunidad) |
|---|---:|
| Knowledge & Reasoning | 40,8 |
| Language Understanding | 63,2 |
| Retrieval & Classification | 70,6 |
| Tools & Automation | 85,2 |
| Arts & Human Taste | 50,7 |
| **Índice público** | **61,69** (raw 71,01) |

Latencia en NVIDIA A800, un proceso por GPU, 4 shards en paralelo: mediana 64 ms, media 147 ms, p95 386 ms por petición.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,4 GB de pesos, más overhead de activaciones y de la cabeza de puntero; se recomienda al menos 12-16 GB para margen operativo.
- GPU recomendadas: A800 (configuración medida por el autor), A100 y H100 para despliegue de alto throughput; RTX 4090 (24 GB) es suficiente para BF16 en una sola tarjeta.
- Cabe en GPU de consumo con 16 GB o más en BF16; en tarjetas de 8-12 GB sería necesario cuantizar, aunque el autor no publica variantes cuantizadas.
- Opciones de despliegue: el autor documenta uso mediante `transformers` con las clases `DecisionModel` y `DecisionProcessor` del repositorio `chinese-decision`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 64 ms, media de 147 ms y p95 de 386 ms por petición en A800 con 4 shards en paralelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chinese Decision Pointer 4B | 4,21B | no disponible | Pointer readout calibrado, sin generación | Apache-2.0 | Hugging Face |
| chinese-decision-4b | no disponible | no disponible | Readout por letras, límite de 26 opciones | no disponible | Hugging Face |
| Qwen3.5-4B (base) | 4B | no disponible | Generación de texto autoregresiva | Apache-2.0 (según base) | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo elige entre candidatos proporcionados por el llamante; no genera texto ni puede abstenerse.
- Las tareas que requieren razonamiento multi-paso (problemas matemáticos, ejecución de código, ajedrez) siguen siendo claramente inferiores a modelos de mayor tamaño, según el propio autor.
- Tras el fine-tuning el modelo tiende a ser sobreconfiado; la calibración depende de la temperatura T = 1,538 fijada en la exportación, y modificarla altera la escala de probabilidades.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano.
- Los datos de entrenamiento incluyen fuentes con licencias no comerciales o solo de investigación; el modelo no concede derechos de redistribución sobre esos datos.
- No se publican datos sobre sesgos específicos ni sobre longitud de contexto soportada.
- El uso comercial de los pesos está amparado por Apache-2.0 del modelo base, pero las condiciones de los datos de entrenamiento deben revisarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quincyqiang/chinese-decision-pointer-4b
- Modelo predecesor (lectura por letras): https://huggingface.co/quincyqiang/chinese-decision-4b
- Código: https://github.com/yanqiangmiffy/chinese-decision/tree/c16450b
- Resultados de evaluación: https://huggingface.co/datasets/quincyqiang/chinese-decision-index-results/tree/main/runs/chinese-decision-pointer-4b
- Decision Index: https://github.com/apolinario/decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
