# boyanbiji/Qwen3.5-4B-DR-SFT-2.5k

## Resumen

Qwen3.5-4B-DR-SFT-2.5k es un ajuste fino de parámetros completos (full-parameter SFT) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario boyanbiji en HuggingFace. El objetivo del ajuste es especializar al modelo en tareas de *deep research*: trayectorias de agente en las que el modelo invoca repetidamente herramientas de búsqueda y visita web a lo largo de múltiples turnos y, finalmente, redacta un informe extenso con citas verificables. El modelo conserva la modalidad image-text-to-text del modelo base, aunque el entrenamiento se centra en el flujo de investigación textual con uso de herramientas.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio ocupa 9,1 GB. El ajuste se realizó sobre 2.518 trayectorias de investigación profunda (138,4 millones de tokens en total, con un máximo de 131.072 tokens por fila), generadas por un modelo profesor de mayor tamaño (Qwen3.5-122B-A10B) y posteriormente revisadas mediante rúbricas y validación de formato de citas.

La relevancia de esta ficha radica en que ejemplifica una tendencia actual: destilar capacidades de agente de investigación desde modelos grandes hacia modelos pequeños desplegables en hardware asequible. El autor publica además variantes con distintos volúmenes de datos (1k, 5k y 8k trayectorias), lo que permite estudiar el efecto del tamaño del conjunto de entrenamiento en el rendimiento final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, modalidad image-text-to-text); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 131.072 tokens por fila de entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en precision original) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de tipo image-text-to-text. Sobre esa base se aplicó un ajuste fino supervisado (SFT) de parámetros completos, sin indicios de RLHF ni DPO en la información disponible. El entrenamiento se ejecutó con FSDP2 sobre 2 GPUs H200, con paralelismo de secuencia 2, batch global de 32, learning rate de 1e-5 y 3 épocas (234 pasos en total). El checkpoint publicado corresponde al paso 234, es decir, al final de la tercera época.

Los datos de entrenamiento consisten en 2.518 filas de entrenamiento (más 50 de validación) con 138,4 millones de tokens en total y un máximo de 131.072 tokens por fila. Cada trayectoria muestra un agente que llama a herramientas de búsqueda y visita en múltiples turnos y luego redacta un informe con citas. Las trayectorias fueron generadas por el modelo profesor Qwen3.5-122B-A10B ejecutándose en un harness de tipo *lookahead*, y los informes se revisaron con rúbricas y se validaron en formato (0 violaciones estrictas de formato de cita). Las fuentes son 888 filas de `quest-lookahead1-qwen122b-revised-v1` y 1.630 filas de `quest-ev10k-lookahead-revised-v1`. Como innovación técnica destacable, el uso de un profesor grande con harness de lookahead y revisión por rúbricas permite obtener trayectorias de alta calidad con citas correctas sin intervención humana masiva.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos orientado a investigación.
- Uso de herramientas (tool calling / function calling): llamadas a herramientas de búsqueda y visita web en varios turnos.
- Comportamiento de agente: planificación de consultas, lectura de fuentes y síntesis final.
- Redacción de informes extensos con citas en formato validado.
- Procesamiento de imagen y texto (image-text-to-text), heredado del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos de pensamiento explícito (thinking mode) ni capacidades de audio.

## Casos de uso

- Investigación automatizada con fuentes web: el modelo puede encadenar búsquedas y visitas a páginas, extraer información relevante y redactar un informe final con citas, gracias a su entrenamiento específico en trayectorias de deep research.
- Generación de informes técnicos con trazabilidad: útil en equipos que necesitan documentos con referencias verificables, ya que el ajuste incluye validación estricta de formato de cita (0 violaciones en el conjunto de entrenamiento).
- Asistentes de análisis competitivo: el agente puede consultar múltiples fuentes sobre un mercado o producto y sintetizar hallazgos en un documento estructurado.
- Automatización de revisiones bibliográficas: con contexto de hasta 131.072 tokens por trayectoria, puede procesar y resumir conjuntos amplios de documentos en una sola sesión.
- Integración en pipelines de agentes con herramientas: al soportar tool calling multi-turno, encaja en frameworks de orquestación que expongan APIs de búsqueda y navegación.
- Despliegue en hardware modesto para prototipado: con 4,5 mil millones de parámetros y licencia Apache 2.0, es viable para pruebas internas y productos comerciales sin coste de licencia.
- Procesamiento de documentos con imágenes: al conservar la modalidad image-text-to-text, puede incorporar capturas o figuras en el flujo de investigación.

## Benchmarks y rendimiento

Evaluación en ResearchRubrics (101 preguntas, harness react, presence_penalty 0, max_tokens 16384, juez LLM idéntico para ambas filas):

| Modelo | Puntuación RR |
|---|---|
| Qwen3.5-4B (base) | 0.4351 |
| Qwen3.5-4B-DR-SFT-2.5k | 0.4782 (+0,043; t pareada = 3,72) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,54 mil millones de parámetros, en FP16 se requieren aproximadamente 9 GB solo para pesos, más memoria para KV cache y overhead.
- GPU recomendadas: el entrenamiento se realizó en 2×H200; para inferencia, GPUs con al menos 16-24 GB de VRAM son un punto de partida razonable, aunque no hay datos oficiales.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) en FP16 y en GPUs de 12-16 GB con cuantización, aunque el repositorio no incluye pesos cuantizados.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento RR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-DR-SFT-2.5k | 4,54 B | 131.072 tokens por fila de entrenamiento | 0.4782 | Apache 2.0 | HuggingFace |
| Qwen3.5-4B (base) | ~4 B (no confirmado) | No disponible | 0.4351 | No disponible en esta ficha | HuggingFace |
| Qwen3.5-4B-DR-SFT-1k | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |
| Qwen3.5-4B-DR-SFT-5k | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |

Las variantes 1k, 5k y 8k del mismo autor permiten comparar el efecto del volumen de datos, pero no se han publicado sus puntuaciones en la información disponible.

## Limitaciones y advertencias

- La pérdida de validación es mínima tras la primera época y aumenta después; el propio autor señala que un checkpoint anterior podría rendir mejor. El checkpoint publicado (época 3) no es necesariamente el óptimo.
- El ajuste se realizó sobre solo 2.518 trayectorias, lo que puede limitar la generalización a dominios o formatos de herramientas distintos de los vistos en entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje; aunque el entrenamiento refuerza el formato de citas, no garantiza que las citas sean correctas o que las fuentes existan.
- Idiomas soportados no documentados; el rendimiento fuera del inglés (si el entrenamiento fue en inglés) es incierto.
- El modelo está especializado en deep research; su rendimiento en tareas generales puede degradarse respecto al modelo base.
- No se han publicado evaluaciones de sesgos, seguridad o robustez.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio no incluye pesos cuantizados, lo que puede dificultar el despliegue en hardware limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-2.5k
- Variante 1k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-1k
- Variante 5k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-5k
- Variante 8k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-8k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
