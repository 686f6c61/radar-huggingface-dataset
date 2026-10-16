# ahmedandaloes/Vela-2.0-0.3B-CoreAI

## Resumen

Vela-2.0-0.3B-CoreAI es una compilación en formato Core AI (`.aimodel`) del modelo fundacional abierto de enrutamiento `vllm-sr/Vela-2.0-0.3B`, publicada por el usuario ahmedandaloes. El modelo original es un encoder de enrutamiento basado en un tronco ModernBERT de 309,1 millones de parámetros (0,3 B) con cabezas de lectura cosine y MLP y una cabeza de spans. Esta versión concreta no es un reentrenamiento ni un ajuste fino: es una exportación del mismo grafo de cálculo a un formato ejecutable en inferencia on-device sobre Apple Silicon.

El problema que resuelve es de despliegue. El repositorio original distribuye pesos en PyTorch y no ofrece ninguna compilación para Core AI, por lo que no puede ejecutarse de forma nativa en el runtime de Apple sin una conversión previa. Este bundle aporta exactamente esa conversión, manteniendo intacta la lógica de host (ensamblado de esquema, tokenización, ventaneo y decodificación de spans) que sigue viviendo en Python en el motor `vela2_inference.py` del proyecto original.

Su relevancia es acotada pero clara: cubre el hueco de ejecución local en Mac y dispositivos Apple Silicon para una tarea de enrutamiento y clasificación de baja latencia, con un modelo de 0,3 B que cabe holgadamente en memoria unificada. El autor verifica equivalencia aritmética frente al cargador oficial con diferencias máximas del orden de 1e-06, aunque no se aporta ninguna métrica de calidad, F1 ni accuracy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco ModernBERT (encoder transformer) con cabezas de lectura cosine y MLP y cabeza de spans |
| Parametros totales | 309,1 M (0,3 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens, capacidad fija del grafo: secuencia 512, q 8, opt 16, unit 128, ent 16 |
| Tipos de cuantizacion | no disponible (el bundle es un grafo de forma fija; el repositorio ocupa 1,2 GB) |
| Idiomas soportados | en, ar |
| Licencia | apache-2.0 |
| Formato de pesos | `.aimodel` (Core AI); el modelo base upstream usa PyTorch |
| Tarea declarada (pipeline) | text-classification |
| Modelo base | vllm-sr/Vela-2.0-0.3B |
| Tamano del repositorio | 1,2 GB |
| Runtime objetivo | Core AI sobre Apple Silicon |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer ModernBERT de 309,1 millones de parámetros que actúa como tronco, sobre el que se montan dos tipos de cabezas de lectura: una lectura cosine y una lectura MLP que producen `opt_logits`, una puntuación por cada fila `[O]`/`[ABS]` del esquema; y una cabeza de spans que produce `span_logits`, una matriz de unidades de palabra por etiquetas `[E]`. El bundle exportado contiene únicamente la matemática de tensores de ese conjunto, no la lógica de esquema.

Los grafos de Core AI tienen forma fija, por lo que todas las entradas se rellenan (padding) hasta una capacidad predefinida: `input_ids` y `attention_mask` como `int32[1,512]`, `q_index` como `int32[8,4]`, `opt_index` como `int32[16,3]`, `unit_index` como `int32[128,2]` y `ent_index` como `int32[16,2]`. El autor especifica que una petición que no encaje en esa capacidad debe lanzar un error, no truncarse silenciosamente. El runtime no preserva los nombres de las claves del diccionario de salida y nombra los tensores según su última operación (`add_94`, `div_6`), de modo que la selección de salidas se hace por forma: `(16,)` corresponde a `opt_logits` y `(128, 16)` a `span_logits`.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, la composición de los datos ni si hubo etapas de RLHF o DPO. Tampoco hay datos sobre innovaciones de decodificación o atención en el modelo original más allá de lo que implica el uso de ModernBERT como tronco. Esta publicación es exclusivamente una exportación de formato: no documenta ningún entrenamiento adicional.

## Capacidades

- Enrutamiento y puntuación de opciones: genera una puntuación por cada fila `[O]`/`[ABS]` del esquema de entrada (tensor `opt_logits` de forma `(16,)`).
- Etiquetado a nivel de span: produce `span_logits` de forma `(128, 16)`, es decir, puntuaciones por unidad de palabra para cada etiqueta `[E]`.
- Clasificación de texto: el pipeline declarado en HuggingFace es `text-classification`.
- Extracción de entidades y tramos relevantes a partir de índices de unidad, siempre que el host decodifique los spans.
- Cobertura bilingüe limitada: inglés y árabe según los metadatos del repositorio.
- Ejecución on-device: el grafo está compilado para el runtime Core AI en Apple Silicon, sin dependencia de PyTorch en tiempo de inferencia.
- No se documentan capacidades de generación de texto libre, razonamiento multi-paso, tool calling ni function calling.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito ("thinking mode").

## Casos de uso

- Enrutamiento de consultas en asistentes locales: el modelo puntúa las opciones `[O]`/`[ABS]` de un esquema para decidir qué rama de un flujo conversacional debe activarse, con la ventaja de ejecutarse íntegramente en el dispositivo sin enviar la consulta a un servidor.
- Clasificación de intenciones en aplicaciones iOS y macOS: integrado mediante el runtime Core AI, permite etiquetar la intención de una frase de hasta 512 tokens en local, con latencia reducida y sin coste de API.
- Extracción de entidades en pipelines de documentos: la cabeza de spans (`span_logits`, 128 unidades × 16 etiquetas) permite marcar tramos relevantes dentro de un texto, siempre que el host realice el ensamblado de esquema y la decodificación de spans.
- Preprocesado de texto en árabe e inglés: útil para aplicaciones bilingües que necesiten una primera capa de clasificación o segmentación antes de un modelo mayor, por ejemplo en indexación de correo o notas.
- Componente de un router de modelos: al ser un modelo de 0,3 B, puede actuar como primera etapa que decide qué modelo mayor invocar, reduciendo el coste de inferencia en pipelines con varios modelos disponibles.
- Filtrado y moderación previa en el dispositivo: clasificación rápida de entradas de usuario antes de procesarlas en backend, aprovechando que el modelo no requiere conectividad ni GPU dedicada.
- Prototipado de investigación en enrutamiento: el bundle permite reproducir decisiones del modelo upstream en un runtime distinto, útil para validar portabilidad de grafos con un coste de memoria bajo (repositorio de 1,2 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (F1, accuracy, MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica explícitamente que no hay benchmark de calidad, ni F1, ni accuracy, ni comparación con las cifras reportadas por el proyecto upstream.

El único dato empírico disponible es la verificación de equivalencia aritmética entre el grafo exportado y el cargador oficial del repositorio (`Vela2SchemaEncoder.from_pretrained`, con `strict=True`), ejecutados sobre entradas idénticas:

| Salida | Diferencia absoluta maxima | Magnitud de la salida | Diferencia relativa |
|---|---|---|---|
| `opt_logits` (16,) | 8,166e-06 | 3,79 | 2,15e-06 |
| `span_logits` (128,16) | 2,503e-06 | 1,70 | 1,48e-06 |

Ambas diferencias corresponden a redondeo en float32. Las entradas utilizadas fueron índices de esquema sintéticos, que ejercitan el padding y las cabezas, pero no demuestran una decisión de enrutamiento real.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo no está pensado para GPU con memoria dedicada, sino para memoria unificada de Apple Silicon. Como referencia de tamaño, el repositorio ocupa 1,2 GB, coherente con 309,1 M de parámetros en precisión de 32 bits.
- GPU recomendadas: no aplica; el formato `.aimodel` está orientado al runtime Core AI sobre Apple Silicon. No se documentan GPUs NVIDIA o AMD compatibles.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon (familias M1, M2, M3, M4 y equivalentes), dado el tamaño de 0,3 B y la ventana fija de 512 tokens.
- Opciones de despliegue: runtime Core AI con el bundle `.aimodel`; el modelo base upstream se carga en PyTorch mediante `Vela2SchemaEncoder.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este bundle.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Vela-2.0-0.3B-CoreAI | 309,1 M | 512 tokens | Enrutamiento / clasificacion de spans | apache-2.0 | `.aimodel` para Core AI | Build de terceros, sin benchmarks de calidad |
| vllm-sr/Vela-2.0-0.3B (upstream) | 309,1 M | no disponible | Enrutamiento / clasificacion de spans | no disponible en la informacion proporcionada | PyTorch | Referencia oficial del bundle |
| ModernBERT-base (answerdotai) | 149 M | 8192 tokens | Encoder de proposito general | apache-2.0 | safetensors, PyTorch | Arquitectura de tronco comparable; no es un router y no se ha comparado con Vela |
| ModernBERT-large (answerdotai) | 395 M | 8192 tokens | Encoder de proposito general | apache-2.0 | safetensors, PyTorch | Mayor tamano y contexto; no hay datos comparativos de rendimiento frente a Vela |

No se dispone de comparaciones de rendimiento publicadas entre Vela-2.0-0.3B y alternativas, por lo que la tabla anterior solo contrasta parametros, contexto, licencia y formato, no calidad.

## Limitaciones y advertencias

- Ausencia total de métricas de calidad: no hay F1, accuracy ni comparación con las cifras del proyecto upstream. La equivalencia verificada es aritmética, no funcional.
- Las pruebas de equivalencia se hicieron con índices de esquema sintéticos, que ejercitan el padding y las cabezas, pero no reproducen una decisión de enrutamiento real.
- Ventana de contexto muy corta: 512 tokens como capacidad fija del grafo. Una petición que exceda la capacidad debe lanzar un error; el diseño prohíbe el truncado silencioso, por lo que el host debe gestionar el ventaneo.
- Capacidades de esquema limitadas y fijas: 8 consultas, 16 opciones, 128 unidades y 16 entidades. Cualquier esquema mayor requiere ventaneo en el host.
- El bundle no implementa la lógica de host: ensamblado de esquema, tokenización, ventaneo y decodificación de spans siguen dependiendo de Python (`vela2_inference.py`). Sustituir el bundle sin ese motor no produce resultados utilizables.
- El runtime no conserva los nombres de las salidas del diccionario (`add_94`, `div_6`); la selección debe hacerse por forma, lo que hace frágil el código si cambia el grafo.
- Idiomas limitados a inglés y árabe según los metadatos; no hay evaluación de calidad en ninguno de los dos.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo, toxicidad o equidad.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo produce puntuaciones de clasificación y no texto libre; el riesgo relevante es de clasificación errónea o de enrutamiento incorrecto.
- Licencia apache-2.0, que en principio permite uso comercial, pero se hereda del modelo base y no se documenta la licencia del upstream en la información proporcionada; conviene verificarla antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes, sin comunidad ni validación externa conocida.
- En la búsqueda web realizada no se han encontrado papers, blogs ni repositorios relevantes sobre este modelo; los resultados devueltos no guardan relación con el tema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedandaloes/Vela-2.0-0.3B-CoreAI
- Modelo base upstream: https://huggingface.co/vllm-sr/Vela-2.0-0.3B
- Perfil del autor: https://huggingface.co/ahmedandaloes
- Sitio del autor (encargos de conversión de formato): https://ahmedandaloes.com
- Papers, blogs y repositorios adicionales: no disponible (la busqueda web no devolvio resultados relevantes)
