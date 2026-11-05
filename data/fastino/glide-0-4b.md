# fastino/GLiDE-0.4B

## Resumen

GLiDE-0.4B es un modelo de decisión (decision model) desarrollado por Fastino, distribuido en HuggingFace bajo el identificador `fastino/GLiDE-0.4B`. No es un modelo generativo: es un encoder de tipo ModernBERT con 394.781.696 parámetros (aproximadamente 0,40 B) que, dado un estado (texto o JSON) y una o varias preguntas tipadas, devuelve una distribución de probabilidad sobre cada opción de cada pregunta. Resuelve tareas de clasificación, enrutamiento y scoring sin generar texto, con una sola pasada forward por pregunta.

La propuesta diferencial es la eficiencia y la determinación: frente a un LLM generativo que produce etiquetas como texto, GLiDE lee directamente una cabeza de decisión de 255 vías y devuelve probabilidades calibradas para cada opción. Soporta tres tipos de pregunta: `choice` (una entre hasta 255 opciones nombradas), `noul` (sí/no, devuelve P(yes)) y `score` (niveles ordenados con nivel esperado). El modelo puntúa 51,10 en la suite pública Decision Index 0.3.1 y reporta una latencia mediana de 6,9 ms por petición en una RTX PRO 6000, con pesos en bf16.

Es relevante ahora porque cubre el hueco de los sistemas de decisión deterministas y de baja latencia en pipelines de agentes y automatización: enrutamiento de tickets, moderación, triaje o scoring estructurado donde un LLM generativo sería más caro, más lento y menos auditable. El modelo se sirve mediante el paquete `glide` incluido en el repositorio, con API Python y servidor HTTP compatible con el formato System One.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT), con cabeza de decisión de 255 vías |
| Parametros totales | 394.781.696 (0,40 B; 0,39 B encoder, de los cuales 52 M son embeddings de tokens; 0,26 M de readout de decisión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 7.999 tokens por prompt de pregunta (estado, pregunta y opciones); los prompts más largos se recortan conservando los primeros 1.024 tokens y el final |
| Tipos de cuantizacion | No disponible (pesos y cómputo en bf16) |
| Idiomas soportados | No disponible |
| Licencia | fastino-community (licencia `other`, enlace a LICENSE en el repo) |
| Formato de pesos | safetensors (bf16, 0,81 GB en disco) |

## Arquitectura y entrenamiento

GLiDE-0.4B es un encoder transformer basado en ModernBERT. La arquitectura se compone de un encoder de 0,39 B parámetros (con 52 M dedicados a embeddings de tokens) y una cabeza de decisión (readout) de 255 vías con solo 0,26 M parámetros. El modelo no genera tokens: cada pregunta se resuelve con una única pasada forward que produce probabilidades sobre las opciones disponibles. Las preguntas de una misma petición, y las de peticiones concurrentes, se agrupan en micro-lotes para su scoring conjunto.

El estado de entrada puede ser una cadena de texto o cualquier valor JSON, lo que permite alimentar estructuras como tickets, registros de cliente o payloads de API. El modelo no dispone de codificador de visión y rechaza peticiones con imágenes. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es el esquema de decisión tipada con probabilidades por opción, que evita la generación autoregresiva y permite latencias de milisegundos.

## Capacidades

- Clasificación tipada con `choice`: selección de una opción entre hasta 255 alternativas nombradas, con probabilidad para cada una.
- Decisión binaria con `noul`: devuelve P(yes) para preguntas de sí/no.
- Scoring ordenado con `score`: asigna niveles ordenados y calcula el nivel esperado a partir de las probabilidades.
- Entrada multimodad de estado: acepta texto plano o cualquier valor JSON (objetos, listas, estructuras anidadas).
- Procesamiento por lotes: `decide_batch` puntúa varias peticiones conjuntamente y devuelve un resultado por petición.
- Servidor HTTP con formato System One (`POST /v1/systemone`) y endpoint `/health`.
- Sin capacidad de generación de texto, visión, audio ni tool calling: es un modelo de decisión, no un LLM generativo.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y metadatos del cliente como estado JSON y devuelve la intención (`refund`, `cancel`, `track`, `other`) con probabilidades, lo que permite dirigir cada caso al equipo adecuado con una latencia de milisegundos.
- Triaje y priorización: combinando preguntas `noul` (¿debe escalarse hoy?) y `score` (prioridad baja/media/alta), se obtiene una puntuación de urgencia auditable y calibrada para colas de atención.
- Moderación de contenido: clasificación de textos o payloads en categorías de riesgo mediante preguntas `choice`, con distribución de probabilidad que permite fijar umbrales de revisión humana.
- Scoring estructurado en pipelines de datos: evaluación de registros JSON (por ejemplo, calidad de leads o elegibilidad de solicitudes) con niveles ordenados y nivel esperado, integrable en procesos ETL.
- Decisión dentro de agentes: el modelo actúa como componente de enrutamiento o selección de herramienta en un sistema multi-agente, resolviendo qué acción tomar a partir del estado de la conversación sin coste de generación.
- Clasificación de intenciones en asistentes conversacionales: determinación de la intención del usuario en cada turno con contexto de hasta 7.999 tokens, adecuada para conversaciones multi-turno con historial largo.
- Automatización de back-office: categorización de documentos o correos en flujos de aprobación, con salida probabilística que permite derivar casos ambiguos a revisión manual.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Decision Index 0.3.1 (suite pública) | 51,10 | Medido con el kit oficial en una RTX PRO 6000, pesos bf16 |
| Latencia mediana por petición | 6,9 ms | RTX PRO 6000, mezcla de peticiones del test de latencia |

No se han publicado en la información disponible resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,79 GB tras la carga; 1,77 GB de pico con la mezcla de peticiones del test de latencia.
- Pesos en disco: 0,81 GB en bf16.
- GPU probada: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB).
- Cabe holgadamente en GPU de consumo: cualquier GPU con al menos 2 GB de VRAM libre puede ejecutarlo en bf16 (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- Tiempo de carga: 16 s desde almacenamiento en red; los pesos se copian a la GPU tensor a tensor, manteniendo bajo el uso de memoria host.
- Opciones de despliegue: paquete `glide` incluido en el repositorio (API Python y servidor HTTP con `uvicorn glide.server:app` o `python -m glide.server`); compatible con `transformers` 5.17.0 y `torch` 2.14.0 (ruedas CUDA 13.0), Python 3.12.
- Alternativa gestionada: API alojada de Fastino (`POST https://api.fastino.ai/v1/systemone`, modelo `fastino/GLiDE`).
- Throughput: no disponible; la latencia reportada es de 6,9 ms medianos por petición en RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE-0.4B (Fastino) | 0,40 B | 7.999 tokens por pregunta | Encoder de decisión con readout de 255 vías | fastino-community | HuggingFace y API Fastino |
| LLM generativo pequeño (p. ej. clase 0,5-1 B) | ~0,5-1 B | Variable según modelo | Generación autoregresiva con etiquetas en texto | Variable | HuggingFace |
| Clasificador BERT clásico | ~0,1-0,3 B | Típicamente 512 tokens | Clasificación con cabeza fija por tarea | Variable | HuggingFace |

No se dispone en la información proporcionada de resultados comparativos directos con alternativas concretas; la comparación anterior es categórica y no incluye cifras de rendimiento de terceros.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, código ni razonamiento en lenguaje natural; solo devuelve probabilidades sobre opciones predefinidas.
- Sin codificador de visión: las peticiones con imágenes se rechazan.
- Límite de contexto de 7.999 tokens por prompt de pregunta; los prompts más largos se recortan conservando los primeros 1.024 tokens y el final, lo que puede perder información intermedia.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- Riesgo de calibración y sesgo: al ser un clasificador, las probabilidades pueden reflejar sesgos del dataset de entrenamiento; no se han publicado detalles sobre la composición de los datos ni evaluaciones de sesgo.
- Licencia `fastino-community` (categoría `other`): es necesario revisar el texto de la licencia en el repositorio antes de un uso comercial; no se confirma aquí si permite uso comercial sin restricciones.
- Dependencia de versiones concretas: probado con Python 3.12, `torch` 2.14.0 y `transformers` 5.17.0; otras combinaciones no están validadas.
- Sin datos publicados de benchmarks estándar de NLP, lo que dificulta la comparación con modelos generativos en tareas de razonamiento o conocimiento.
- Para producción, conviene monitorizar la confianza devuelta y derivar a revisión humana los casos con distribuciones planas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fastino/GLiDE-0.4B
- Licencia: https://huggingface.co/fastino/GLiDE/blob/main/LICENSE
- Proveedor (Fastino): https://fastino.ai
- Documentación de la API de inferencia: https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Creación de cuenta y API key: https://agent.fastino.ai
