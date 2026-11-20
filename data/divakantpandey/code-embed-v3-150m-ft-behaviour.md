# divakantpandey/code-embed-v3-150m-ft-behaviour

## Resumen

`code-embed-v3-150m-ft-behaviour` es un modelo de embeddings de código derivado de `Alibaba-NLP/gte-modernbert-base` mediante fine-tuning. Lo desarrolla el autor independiente `divakantpandey` como artefacto de investigación para el paper *Does Execution-Verified Near-Miss Training Teach Code Embeddings to Prefer Working Code? A Negative Result*. No es un modelo orientado a producción: su propósito es reproducir los resultados del estudio, no mejorar la búsqueda de código.

El modelo parte de la arquitectura ModernBERT (familia de encoders transformer con attention eficiente y contexto extendido) con 149.014.272 parámetros y embeddings de 768 dimensiones, con soporte de Matryoshka hasta 64 dimensiones. Se ha entrenado sobre 240.054 filas, de las cuales un 11,0 % son pares *near-miss* verificados por ejecución en sandbox (mutantes y reescrituras de CodeContests, y pares bug/fix de SWE-smith).

Su relevancia es metodológica: el autor declara explícitamente que "no es un mejor embedder de código que su base" y que los datos near-miss producen una mejora pequeña y no significativa en ExecRetrieval, además de provocar el colapso de AppsRetrieval (de 57,67 a 18,87). La ficha resulta útil para investigadores que quieran auditar el experimento o entender por qué no conviene desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), CLS pooling, embeddings normalizados |
| Parametros totales | 149.014.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (evaluación); entrenamiento a 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en, code |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT con pooling CLS y salida normalizada de 768 dimensiones, con truncamiento Matryoshka a 512, 256, 128 y 64 dimensiones. Se inicializa desde `Alibaba-NLP/gte-modernbert-base` y se fine-tunea con pérdida de ranking multi-negativos con caché, temperatura 0,015, objetivo Matryoshka, learning rate 2e-5, batch 16, una época, 14.995 pasos y pesos maestros en float32 con una única semilla. Los datos ascienden a 240.054 filas (11,0 % near-miss), con una fuente por batch, y están descontaminados contra MTEB(Code, v1), CoIR, CoREB(v1), ExecRetrieval y CoQuIR.

La innovación técnica del experimento es el uso de pares *near-miss* verificados por ejecución: mutantes y reescrituras de CodeContests comprobados en sandbox, más gemelos bug/fix de SWE-smith. Las consultas llevan un prompt de tarea (`nl2code`, `code2code`, `code2nl`, `text2sql`, etc., definidos en `config_sentence_transformers.json`) y los documentos no llevan prompt. Los números del paper comparan embeddings en float32; MTEB(Code) se puntuó en float16 para ambos fine-tunes.

## Capacidades

- Extracción de features y generación de embeddings de texto y código para similitud semántica.
- Búsqueda de código (code search) y recuperación de fragmentos relevantes a partir de consultas en lenguaje natural.
- Tareas de correspondencia nl2code, code2code, code2nl y text2sql mediante prompts de tarea.
- Embeddings truncables por Matryoshka (768, 512, 256, 128 y 64 dimensiones), útil para indexación con menor coste de almacenamiento.
- Compatible con text-embeddings-inference y con la librería sentence-transformers.
- Soporte de contexto hasta 8.192 tokens en evaluación.
- Idiomas: inglés y código; no se declaran otras lenguas naturales.

## Casos de uso

- Reproducción del experimento del paper: cargar el modelo junto con el control `code-embed-v3-150m-ft-control` y recalcular las métricas ExecRetrieval, CoQuIR pairwise, MTEB(Code, v1) y AppsRetrieval para verificar los resultados publicados.
- Auditoría metodológica de entrenamiento con datos near-miss: comparar este modelo con el control para aislar el efecto de los pares verificados por ejecución frente al mix de replay.
- Estudio del colapso en AppsRetrieval: analizar por qué la incorporación de near-miss degrada AppsRetrieval de 57,67 a 18,87 y documentar el fenómeno en trabajos sobre robustez de embeddings de código.
- Evaluación de embeddings Matryoshka en código: probar el rendimiento relativo de las dimensiones truncadas (512, 256, 128, 64) en tareas de recuperación sobre el corpus de evaluación del paper.
- Análisis de prompts de tarea: verificar el efecto de los prompts `nl2code`, `code2code`, `code2nl` y `text2sql` en la similitud entre consulta y documento.
- Base para ablaciones de datos: reutilizar el pipeline del repositorio `code-embed-v3` con los datasets `code-embed-v3-data` y `code-embed-v3-synth` para entrenar variantes con distintas proporciones de near-miss.
- No se recomienda su uso en producción para búsqueda de código; para ese fin el autor remite al modelo base.

## Benchmarks y rendimiento

Resultados publicados en la model card (misma máquina, float32, 8.192 tokens; MTEB(Code) en float16 para los fine-tunes):

| Modelo | exec@1 | beats_paired | CoQuIR pairwise | MTEB(Code, v1) | AppsRetrieval |
|---|---|---|---|---|---|
| gte-modernbert-base (base) | 0.0927 | 0.0990 | 0.5528 | 71.78 | 57.67 |
| replay-only control | 0.0852 | 0.0905 | 0.5588 | 69.75 | 53.89 |
| near-miss pilot (este modelo) | 0.0990 | 0.1054 | 0.5527 | 66.02 | 18.87 |

Comparaciones pareadas pilot vs control sobre consultas: exec@1 +0,014 (McNemar p = 0,21), beats_paired +0,015 (p = 0,18), CoQuIR pairwise -0,006 (bootstrap p = 0,043). El fine-tuning sobre el mix de replay por sí solo cuesta aproximadamente 2 puntos de MTEB(Code).

## Requisitos de hardware

- VRAM estimada: alrededor de 0,6 GB en float32 para los 149 millones de parámetros; aproximadamente 0,3 GB en float16. El tamaño del repositorio (14,3 GB) incluye artefactos adicionales, no solo los pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para inferencia; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, incluidas GTX 1650, RTX 3060, RTX 4090 y similares.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (el modelo está marcado como compatible con endpoints), y frameworks de inferencia estándar para encoders (por ejemplo, vLLM con soporte de embedding, ONNX Runtime o Hugging Face TEI).
- Latencia y throughput: no disponibles en la información proporcionada. El contexto de 8.192 tokens en ModernBERT abarata el coste de attention frente a transformers clásicos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| code-embed-v3-150m-ft-behaviour | 149 M | 8.192 | apache-2.0 | Artefacto de investigación; MTEB(Code) 66,02; AppsRetrieval 18,87 |
| Alibaba-NLP/gte-modernbert-base | 149 M (aprox., misma base) | 8.192 | apache-2.0 | Modelo base recomendado por el autor para code search; MTEB(Code) 71,78; AppsRetrieval 57,67 |
| divakantpandey/code-embed-v3-150m-ft-control | 149 M | 8.192 | apache-2.0 | Control replay-only del mismo experimento; MTEB(Code) 69,75; AppsRetrieval 53,89 |

No se dispone de datos de otros embedders de código de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- El autor declara que el modelo no supera a su base y que se publica únicamente para reproducir el paper; no debe usarse como embedder de código en producción.
- Degradación severa en AppsRetrieval (18,87 frente a 57,67 del base), atribuida por el autor a los datos near-miss.
- Caída de MTEB(Code, v1) hasta 66,02 frente a 71,78 del base, en parte por el propio fine-tuning sobre el mix de replay (unos 2 puntos) y en parte por los near-miss.
- Una sola semilla de entrenamiento por modelo, lo que limita la significancia estadística de las diferencias observadas.
- Las 939 consultas de ExecRetrieval no permiten resolver diferencias de un punto.
- Solo se estudió un modelo base, lo que restringe la generalización de las conclusiones.
- Idiomas limitados a inglés y código; no se declaran capacidades multilingües en lenguaje natural.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de recuperaciones irrelevantes en búsqueda; no hay evaluación de sesgos publicada.
- Licencia apache-2.0 permite uso comercial, pero el autor desaconseja el despliegue por los motivos de rendimiento anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-behaviour
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Modelo control (replay-only): https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-control
- Dataset de filas replay: https://huggingface.co/datasets/divakantpandey/code-embed-v3-data
- Dataset de filas near-miss: https://huggingface.co/datasets/divakantpandey/code-embed-v3-synth
- Salidas de evaluación, tests pareados y logs: https://huggingface.co/divakantpandey/code-embed-v3-src
- Repositorio con receta, log de investigación y drivers: https://github.com/divakantpandey/code-embed-v3
