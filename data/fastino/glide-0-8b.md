# fastino/GLiDE-0.8B

## Resumen

GLiDE-0.8B es un modelo de decisión desarrollado por Fastino Labs que, dado un estado (texto o JSON) y una o varias preguntas tipadas, devuelve una distribución de probabilidad sobre las opciones de cada pregunta. No es un modelo generativo: no produce texto, sino que lee probabilidades de una cabeza de decisión de 255 vías en un único forward pass por pregunta. Con 752 millones de parámetros (0,75 B) y pesos en bf16 (1,53 GB en disco), está pensado para tareas de clasificación, enrutamiento y puntuación donde la latencia y la calibración importan más que la generación libre.

El modelo se presenta junto al artículo arXiv:2611.26509, "GLiDE: A Fast, Calibrated Decision Model Distilled from Reasoning Teachers", y se distribuye con la licencia comunitaria `fastino-community`. Según la model card, alcanza 54,32 en la suite pública Decision Index 0.3.1 con una latencia mediana de 19,3 ms por petición en una RTX PRO 6000, y admite contextos de hasta 40.000 tokens por pregunta.

Su relevancia actual radica en la sustitución de pipelines de razonamiento generativo por un clasificador calibrado y determinista en coste: una sola pasada, sin decodificación autoregresiva, con soporte de lote para preguntas concurrentes y con salidas probabilísticas directamente utilizables en sistemas de enrutamiento, moderación o triaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal (tag `qwen3_5`), cabeza de decisión de 255 vías |
| Parametros totales | 752.393.024 (0,75 B); de ellos 254 M en embeddings de tokens y 0,26 M en el readout de decisión |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 40.000 tokens por prompt de pregunta (estado, pregunta y opciones) por defecto |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | `fastino-community` (licencia "other" con enlace a LICENSE en el repo) |
| Formato de pesos | safetensors (bf16), 1,53 GB en disco |

## Arquitectura y entrenamiento

La model card describe un modelo de lenguaje de 0,75 B de parámetros con tag de arquitectura `qwen3_5`, que combina capas de atención lineal con atención estándar; el paquete opcional `flash-linear-attention` proporciona kernels rápidos para esas capas lineales, y sin él transformers recurre a una implementación PyTorch mucho más lenta que no formó parte de la validación. Sobre el tronco del modelo se sitúa un readout de decisión de 255 vías (0,26 M de parámetros) del que se leen directamente las probabilidades de cada opción, sin generación autoregresiva. El modelo no incluye codificador de visión: las peticiones con imágenes se rechazan.

El entrenamiento se basa en destilación a partir de "reasoning teachers" (profesores de razonamiento), según el título del artículo; la model card no detalla el número de tokens, la composición del dataset ni si se emplearon RLHF o DPO. La innovación principal es el formato de decisión tipada: tres tipos de pregunta (`choice` con hasta 255 opciones nombradas, `noul` que devuelve P(sí) y `score` con niveles ordenados), todas las preguntas de una petición puntuadas conjuntamente en micro-lotes y un único forward pass por pregunta.

## Capacidades

- Decisiones tipadas: `choice` (una entre hasta 255 opciones con nombre), `noul` (sí/no, devuelve P(sí)) y `score` (niveles ordenados con nivel esperado).
- Salida de probabilidades para todas las opciones de todas las preguntas, con campo de confianza por respuesta.
- Acepta estados en texto plano o en cualquier valor JSON (por ejemplo, tickets con metadatos estructurados).
- Contexto largo de hasta 40.000 tokens por pregunta, suficiente para documentos o historiales extensos.
- Procesamiento por lotes: `decide_batch` puntúa varias peticiones juntas y devuelve un resultado o un `RequestError` por petición.
- Interfaces de Python (`glide.Glide`) y servidor HTTP compatible con el formato System One (`POST /v1/systemone`).
- Sin capacidades generativas, de visión, audio ni tool calling: el modelo solo clasifica y puntúa.

## Casos de uso

- Triaje de tickets de soporte: el ejemplo de la model card clasifica intención (`refund`, `cancel`, `track`, `other`), decide si escalar hoy (`noul`) y asigna prioridad (`score`) sobre un estado JSON con el texto del ticket y el nivel del cliente; el contexto de 40.000 tokens permite incluir el historial completo de la conversación.
- Enrutamiento de consultas en un sistema multiagente: con una pregunta `choice` sobre el agente o herramienta adecuada, el modelo devuelve la distribución de probabilidad que el orquestador usa para seleccionar destino o pedir confirmación cuando la confianza es baja.
- Moderación de contenido: preguntas `noul` y `score` sobre un texto devuelven probabilidades calibradas que permiten fijar umbrales explícitos en lugar de depender de la salida de un modelo generativo.
- Puntuación de relevancia en búsqueda o recomendación: el tipo `score` con niveles ordenados produce un nivel esperado y su distribución, utilizable directamente como señal de ranking.
- Extracción de etiquetas estructuradas en pipelines de datos: dado un documento como estado, varias preguntas `choice` en una sola petición etiquetan campos (categoría, sentimiento, urgencia) con coste de una pasada y sin decodificación.
- Clasificación de alto rendimiento en producción: con 19,3 ms de latencia mediana y 2,75 GB de pico de VRAM en la prueba de latencia, encaja en servicios que necesitan miles de decisiones por segundo con GPU única.
- Evaluación automática de respuestas: el tipo `score` permite puntuar calidad de salidas de otros modelos con niveles definidos y probabilidades asociadas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto de medida |
|---|---|---|
| Decision Index 0.3.1 (suite pública) | 54,32 | Kit oficial, una RTX PRO 6000, pesos bf16 |
| Latencia mediana por petición | 19,3 ms | RTX PRO 6000 Blackwell Server Edition, mezcla de peticiones de la prueba de latencia |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM: 1,53 GB tras la carga de pesos en bf16; 2,75 GB de pico en la prueba de latencia con peticiones mixtas.
- GPU probada: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB); el modelo es lo bastante pequeño para caber en cualquier GPU consumer con al menos 3 GB de VRAM libre, aunque no se han publicado pruebas en esas tarjetas.
- Carga: 6 s desde almacenamiento en red, con copia tensor a tensor a la GPU para mantener bajo el uso de memoria host.
- Despliegue: paquete Python `glide` incluido en el repositorio, más servidor HTTP con el formato System One (`POST /v1/systemone`); también disponible mediante la API alojada de Fastino (`POST https://api.fastino.ai/v1/systemone`, modelo `fastino/GLiDE`).
- Entorno validado: Python 3.12, `torch==2.14.0` (CUDA 13.0), `triton==3.8.0`, `transformers==5.17.0` y, recomendado, `flash-linear-attention==0.5.2`.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI; el modelo no es generativo y requiere el paquete `glide` para interpretar el readout de decisión.
- Throughput: no disponible más allá de la latencia mediana por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE-0.8B | 0,75 B | 40.000 tokens por pregunta | Decisión tipada con probabilidades | `fastino-community` | Pesos en HF y API alojada |
| Clasificadores BERT-base fine-tuneados | ~0,11 B | típicamente 512 tokens | Clasificación de una etiqueta | según checkpoint | Amplia en HF |
| LLM generativos pequeños (p. ej. ~0,5-1 B) usados como clasificadores | ~0,5-1 B | variable | Generación con prompt de clasificación | variable | Amplia en HF |

No se dispone de datos de rendimiento de estos modelos comparables en la información proporcionada para establecer una comparación numérica con GLiDE-0.8B.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni razonamiento explícito; solo devuelve probabilidades sobre opciones predefinidas.
- Sin codificador de visión: las peticiones con imágenes se rechazan.
- La model card no documenta sesgos conocidos, composición del dataset de entrenamiento ni idiomas soportados, lo que dificulta evaluar su comportamiento fuera del inglés o en dominios sensibles.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento; la confianza devuelta debe validarse con datos propios antes de fijar umbrales en producción.
- La licencia `fastino-community` es una licencia "other" con condiciones no resumidas en la información disponible; es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial.
- El rendimiento medido (19,3 ms, 54,32 en Decision Index) corresponde a una RTX PRO 6000 con `flash-linear-attention` instalado; sin ese paquete la implementación PyTorch de las capas lineales es mucho más lenta y no fue validada.
- Dependencia de versiones muy concretas de `torch`, `transformers` y `triton`; la compatibilidad con otros entornos no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiDE-0.8B
- Artículo: https://arxiv.org/abs/2611.26509
- Licencia: https://huggingface.co/fastino/GLiDE-0.8B/blob/main/LICENSE
- Web de Fastino: https://fastino.ai
- Documentación de la API de inferencia: https://docs.fastino.ai/inference/systemone
- Inicio rápido de la API: https://docs.fastino.ai/quickstart
- Alta y clave de API: https://agent.fastino.ai
