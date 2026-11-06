# fastino/GLiDE-2B

## Resumen

GLiDE-2B es un modelo de decisión desarrollado por Fastino que, a diferencia de los modelos generativos convencionales, no produce texto: recibe un estado (texto libre o cualquier valor JSON) junto con una o varias preguntas tipadas y devuelve una distribución de probabilidad sobre cada opción de cada pregunta. Con 1.881.825.088 parámetros totales (1,88 B, de los cuales 509 M corresponden a embeddings de tokens y solo 0,52 M al readout de decisión), está diseñado para tareas de clasificación, enrutamiento y puntuación donde se necesita una salida probabilística calibrada en lugar de una secuencia generada.

El modelo emplea una arquitectura derivada de `qwen3_5` con capas de atención lineal (compatible con los kernels de `flash-linear-attention`), y se distribuye en bf16 con un peso en disco de 3,78 GB. Su rasgo diferencial es el readout de 255 vías que permite puntuar hasta 255 opciones nombradas por pregunta, resolviendo cada cuestión en un único forward pass y agrupando en micro-lotes todas las preguntas de una petición y las peticiones concurrentes.

Es relevante ahora porque cubre un nicho poco atendido por los LLM generativos: decisiones deterministas y de baja latencia (17,8 ms de mediana por petición en una RTX PRO 6000) con contexto largo de hasta 40.000 tokens por pregunta, lo que lo hace apto para enrutamiento de agentes, triaje de tickets o scoring estructurado sin el coste ni la variabilidad de un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de `qwen3_5` con capas de atención lineal; readout de decisión de 255 vías |
| Parametros totales | 1.881.825.088 (1,88 B); 509 M en embeddings de tokens y 0,52 M en el readout de decisión |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 40.000 tokens por prompt de pregunta (estado, pregunta y opciones) por defecto |
| Tipos de cuantizacion | No disponible (los pesos publicados son bf16) |
| Idiomas soportados | No disponible |
| Licencia | `fastino-community` (licencia `other`, enlace a LICENSE en el repo `fastino/GLiDE`) |
| Formato de pesos | safetensors (bf16, 3,78 GB en disco) |

## Arquitectura y entrenamiento

GLiDE-2B es un modelo de decisión construido sobre una arquitectura derivada de `qwen3_5`, con capas de atención lineal para las que se recomienda instalar `flash-linear-attention==0.5.2`; sin ese paquete, transformers recurre a una implementación PyTorch mucho más lenta que no formó parte de la validación del autor. El modelo no genera tokens: sustituye la cabeza de lenguaje por un readout de decisión de 255 vías del que se leen las probabilidades de cada opción, y resuelve cada pregunta en un único forward pass, agrupando en micro-lotes todas las preguntas de una petición y las peticiones concurrentes.

El modelo soporta tres tipos de pregunta: `choice` (una entre hasta 255 opciones nombradas), `noul` (sí/no, devuelve P(sí)) y `score` (niveles ordenados, con nivel esperado y distribución de probabilidad). El estado puede ser una cadena de texto o cualquier valor JSON. No dispone de codificador de visión: las peticiones con imágenes se rechazan, pese a que la etiqueta de pipeline del Hub figure como `image-text-to-text`. No se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Decisiones tipadas con salida probabilística: `choice`, `noul` y `score`, con probabilidad para cada opción.
- Clasificación y enrutamiento sobre estados en texto libre o JSON arbitrario.
- Contexto largo de hasta 40.000 tokens por pregunta, suficiente para incluir estado, instrucciones y criterios extensos.
- Procesamiento por lotes: `decide_batch` puntúa varias peticiones juntas y devuelve una respuesta por petición o un `RequestError` para las no servibles.
- Interfaz Python (`glide.Glide`) y servidor HTTP compatible con el formato System One (`POST /v1/systemone`).
- Endpoint `GET /health` para comprobaciones de disponibilidad en despliegues.
- Sin capacidades generativas: `output_tokens` es siempre 0 y no produce texto libre.
- Sin capacidades multimodales: las peticiones con imágenes se rechazan.
- Soporte de tool calling, agentes multi-step, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y metadatos (por ejemplo, `customer_tier`) como estado JSON y devuelve la intención (`refund`, `cancel`, `track`, `other`), la urgencia como `noul` y la prioridad como `score` en una sola llamada, con probabilidades calibradas para umbralizar escalados automáticos.
- Enrutamiento de agentes: dado el estado de la conversación y la lista de herramientas o subagentes disponibles como opciones `choice`, el modelo selecciona el destino con una distribución de probabilidad, lo que permite aplicar umbrales de confianza y derivar a revisión humana cuando la confianza es baja.
- Moderación y clasificación de contenido: puntuación de textos contra criterios ordenados (`score`) para asignar niveles de riesgo o severidad, aprovechando el contexto de 40.000 tokens para incluir políticas completas en el prompt de la pregunta.
- Scoring de candidatos en pipelines de selección: evaluación de respuestas abiertas o currículos JSON contra rúbricas definidas como niveles ordenados, con `expected_level` como métrica agregada.
- Extracción de señales estructuradas en ETL: clasificación de registros JSON heterogéneos en categorías predefinidas antes de persistirlos, con una latencia de decenas de milisegundos por petición que permite procesar flujos de alto volumen.
- Decisión en sistemas de recomendación o pricing: puntuación de pares estado/opciones para elegir entre alternativas discretas (planes, segmentos, acciones) con probabilidades por opción en lugar de una generación de texto.
- Despliegue local en una sola GPU: con 3,76 GB tras la carga y 5,11 GB de pico en el test de latencia del autor, cabe en GPUs de consumo con suficiente VRAM y permite servir la API HTTP (`uvicorn glide.server:app`) en infraestructura propia.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Decision Index 0.3.1 (suite pública) | 60,65 | Kit oficial, una RTX PRO 6000, bf16 |
| Latencia mediana por petición | 17,8 ms | RTX PRO 6000, peticiones mixtas del test de latencia |
| Memoria GPU tras carga | 3,76 GB | RTX PRO 6000 |
| Memoria GPU pico | 5,11 GB | Peticiones mixtas del test de latencia |
| Tiempo de carga | 5 s | Desde almacenamiento en red |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,76 GB tras la carga y 5,11 GB de pico medidos en el test de latencia del autor, con pesos en bf16.
- GPU probada: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB).
- Cabe en GPU de consumo con al menos ~6 GB de VRAM libres; no se especifican modelos concretos validados más allá de la RTX PRO 6000.
- Despliegue: API Python (`glide.Glide`) y servidor HTTP con `uvicorn glide.server:app` o `python -m glide.server`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Dependencias fijadas: Python 3.12, `torch==2.14.0` (CUDA 13.0), `triton==3.8.0`, `transformers==5.17.0`; `flash-linear-attention==0.5.2` es opcional pero recomendado (sin él, la atención lineal usa una implementación PyTorch mucho más lenta no validada).
- Latencia y throughput: 17,8 ms de mediana por petición en RTX PRO 6000; el procesamiento por micro-lotes de preguntas y peticiones concurrentes mejora el rendimiento agregado, sin cifras de throughput publicadas.
- La carga copia los pesos a la GPU tensor a tensor, manteniendo bajo el uso de memoria host.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de decisión ni con LLM generativos de tamaño similar, y no se dispone de datos de benchmarks comparables (MMLU, HumanEval, GSM8K) para GLiDE-2B.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera salida en lenguaje natural necesita un modelo generativo adicional.
- No dispone de codificador de visión; las peticiones con imágenes se rechazan, aunque la etiqueta de pipeline del Hub indique `image-text-to-text`.
- La licencia `fastino-community` es de tipo `other`; deben revisarse los términos del archivo LICENSE del repo `fastino/GLiDE` antes de un uso comercial.
- No se han publicado datos sobre idiomas soportados, sesgos conocidos ni tasas de alucinación o calibración fuera del Decision Index.
- El límite de 40.000 tokens por prompt de pregunta es un valor por defecto; no se documenta si es configurable.
- El rendimiento validado depende de `flash-linear-attention`; sin ese paquete la inferencia es mucho más lenta y no está validada.
- El aviso de transformers sobre `causal_conv1d` no instalado es esperado y no requiere acción, pero conviene verificar la versión exacta de las dependencias fijadas.
- Solo se ha validado en una RTX PRO 6000; el comportamiento en otras GPU, incluidos modelos de consumo, no está documentado.
- El modelo tiene 16 descargas y 0 likes en el Hub en el momento de la consulta, lo que indica una adopción todavía muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiDE-2B
- Licencia: https://huggingface.co/fastino/GLiDE/blob/main/LICENSE
- Web de Fastino: https://fastino.ai
- Documentación de la API (System One): https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Registro y API key: https://agent.fastino.ai
