# fastino/GLiDE-0.4B

## Resumen

GLiDE-0.4B es un modelo de decisión desarrollado por Fastino Labs, presentado en el paper arXiv:2611.26509 ("GLiDE: A Fast, Calibrated Decision Model Distilled from Reasoning Teachers"). No es un modelo generativo: es un encoder de arquitectura ModernBERT que, dado un estado (texto o JSON) y una o varias preguntas tipadas, devuelve una distribución de probabilidad sobre las opciones de cada pregunta en un único forward pass. Con 394.781.696 parámetros reales (0,39 B corresponden al encoder y 0,26 M a la cabeza de decisión), está pensado para tareas de clasificación, enrutamiento y puntuación donde la latencia y la calibración importan más que la generación libre.

El modelo se distingue por tres decisiones de diseño: soporta tres tipos de pregunta (`choice` con hasta 255 opciones nombradas, `noul` con salida P(yes) y `score` con niveles ordenados), procesa todas las preguntas de una petición en micro-lotes compartidos y rechaza explícitamente entradas con imágenes. Su ventana de contexto es de 7.999 tokens por prompt de pregunta; si se excede, se conservan los primeros 1.024 tokens y el final (pregunta y opciones) para no perder la parte decisiva.

La relevancia actual del modelo radica en su rendimiento medido: 51,10 en el Decision Index 0.3.1 con el kit oficial sobre una RTX PRO 6000, con una latencia mediana de 6,9 ms por petición en esa GPU. Con pesos en bf16 que ocupan 0,81 GB en disco y 0,79 GB en VRAM tras la carga (1,77 GB de pico en el test mixto), es desplegable en hardware de gama alta consumer y en entornos de servidor modestos. La licencia es `fastino-community`, no estándar, lo que exige revisión antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT) con cabeza de decisión de 255 vías |
| Parametros totales | 394.781.696 (0,40 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 7.999 tokens por prompt de pregunta; si se excede, se conservan los primeros 1.024 tokens y el final |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen y ejecutan en bf16) |
| Idiomas soportados | No disponible |
| Licencia | `fastino-community` (licencia "other", enlace en el repositorio) |
| Formato de pesos | safetensors (bf16), 0,81 GB en disco |

## Arquitectura y entrenamiento

GLiDE-0.4B es un encoder ModernBERT de 0,39 B parámetros (de los cuales 52 M corresponden a embeddings de tokens) acoplado a una cabeza de decisión de 0,26 M parámetros que produce una lectura de 255 vías. Cada pregunta se resuelve en un único forward pass: el modelo no genera tokens, sino que lee probabilidades directamente de la cabeza de decisión. Las peticiones concurrentes y las múltiples preguntas de una misma petición se agrupan en micro-lotes para maximizar el uso de la GPU.

Según el título del paper, el modelo se destila a partir de "reasoning teachers" y está calibrado, es decir, sus probabilidades de salida están pensadas para ser interpretables como confianza real y no solo como ranking. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; esa información no está disponible en el material proporcionado. La innovación técnica destacable es el readout de 255 opciones combinado con los tres tipos de pregunta tipada (`choice`, `noul`, `score`), que permite cubrir clasificación multiclase, binaria y ordinal con el mismo cabezal.

## Capacidades

- Clasificación tipada con hasta 255 opciones nombradas por pregunta (`choice`), devolviendo probabilidad para cada opción y la opción ganadora con su confianza.
- Decisión binaria (`noul`) que devuelve P(yes) y una medida de confianza derivada.
- Puntuación ordinal (`score`) sobre niveles ordenados, con nivel predicho, nivel esperado y distribución de probabilidad por nivel.
- Entrada multimodal de estado: acepta tanto cadenas de texto como cualquier valor JSON (objetos, listas, anidamientos), lo que facilita pasar tickets, registros o payloads estructurados.
- Procesamiento por lotes: `decide_batch` puntúa varias peticiones juntas y devuelve un resultado por petición, con errores aislados por petición (`glide.RequestError`).
- Servidor HTTP compatible con el formato System One (`POST /v1/systemone`), además de API Python.
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio: es un modelo de decisión de un solo paso y rechaza peticiones con imágenes.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y metadatos como `customer_tier` en JSON y devuelve en una sola pasada la intención (`refund`, `cancel`, `track`, `other`), la urgencia binaria y la prioridad ordinal. La latencia de 6,9 ms permite enrutar en línea sin cola perceptible.
- Moderación y clasificación de contenido: con la pregunta `choice` de hasta 255 opciones se pueden definir taxonomías finas de categorías de contenido y obtener la distribución completa, útil para umbrales ajustables en producción.
- Puntuación de leads y riesgo: usando `score` con niveles ordenados (por ejemplo, bajo/medio/alto) y `expected_level`, se obtiene una señal calibrada y ordenada que se integra directamente en reglas de negocio o en un scoring posterior.
- Extracción de decisiones sobre JSON estructurado: al aceptar cualquier valor JSON como estado, encaja en pipelines que ya trabajan con registros (pedidos, facturas, eventos) sin necesidad de serializar a texto plano previamente.
- Clasificación por lotes en backoffice: `decide_batch` permite procesar grandes volúmenes de registros históricos en micro-lotes compartidos, con un pico de 1,77 GB de VRAM en el test mixto, lo que abarata el reprocesamiento masivo.
- Enrutamiento en agentes y sistemas multi-modelo: el modelo puede actuar como "portero" que decide a qué modelo grande o herramienta derivar cada petición, aprovechando su coste bajo y su latencia de milisegundos frente a un LLM generativo.
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperación, si es respondible con caché o si debe escalar a un humano, con probabilidades interpretables para fijar umbrales.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto de medida |
|---|---|---|
| Decision Index 0.3.1 (suite pública) | 51,10 | Kit oficial, 1× RTX PRO 6000 |
| Latencia mediana por petición | 6,9 ms | RTX PRO 6000, peticiones mixtas del test |
| VRAM tras carga | 0,79 GB | Pesos bf16 |
| VRAM pico (test mixto) | 1,77 GB | Peticiones mixtas concurrentes |
| Tiempo de carga | 16 s | Desde almacenamiento en red |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: 0,79 GB tras la carga en bf16 y 1,77 GB de pico en el test mixto publicado; el repo ocupa 0,81 GB en disco.
- GPU probada oficialmente: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), con 6,9 ms de latencia mediana por petición.
- Cabe holgadamente en GPU consumer: cualquier tarjeta con 4 GB o más de VRAM debería alojar los pesos y el pico documentado; no se han publicado medidas en RTX 4090, RTX 3090 u otras consumer.
- Despliegue: paquete `glide` incluido en el repositorio (API Python y servidor HTTP con formato System One en `POST /v1/systemone`), más la API hospedada de Fastino (`POST https://api.fastino.ai/v1/systemone`, modelo `fastino/GLiDE`).
- Dependencias probadas: Python 3.12, `torch==2.14.0` (wheels CUDA 13.0) y `transformers==5.17.0`; el pin de `flash-linear-attention` no se usa en este modelo y puede omitirse.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el serving oficial es el paquete `glide` o la API de Fastino.
- Throughput: no disponible más allá de la latencia mediana por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE-0.4B | 0,40 B | 7.999 tokens por pregunta | Encoder de decisión (no generativo) | `fastino-community` | Hugging Face + API Fastino |
| Alternativas de clasificación tipo BERT | No disponible | No disponible | Encoder de clasificación | No disponible | No disponible |
| LLMs generativos pequeños para clasificación | No disponible | No disponible | Decoder generativo | No disponible | No disponible |

No se dispone en la información proporcionada de resultados de benchmarks ni de especificaciones de modelos comparables de la misma categoría, por lo que la comparación numérica no está disponible. La diferencia cualitativa frente a un LLM generativo es que GLiDE no genera texto: devuelve probabilidades calibradas en un solo forward pass, con latencia de milisegundos y sin coste de decodificación.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades sobre opciones predefinidas; no sirve para resúmenes, redacción ni diálogo abierto.
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio; las peticiones con imágenes se rechazan explícitamente.
- Contexto limitado a 7.999 tokens por pregunta; al excederse se trunca conservando solo los primeros 1.024 tokens y el final, lo que puede eliminar información intermedia relevante.
- Idiomas soportados no documentados: no hay garantía publicada de rendimiento multilingüe más allá de lo que indique el paper.
- Licencia `fastino-community` (categoría "other"): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no es una licencia open source estándar.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente fuera de la distribución de entrenamiento; la confianza devuelta debe validarse en el dominio concreto antes de fijar umbrales en producción.
- Sesgos conocidos: no documentados en la información disponible.
- El rendimiento publicado (51,10 en Decision Index 0.3.1 y 6,9 ms) se midió en una única GPU (RTX PRO 6000); no hay datos de latencia o throughput en otras GPU.
- Dependencias muy específicas (`torch==2.14.0`, `transformers==5.17.0`) que pueden complicar la integración en stacks existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiDE-0.4B
- Paper: https://arxiv.org/abs/2611.26509
- Licencia: https://huggingface.co/fastino/GLiDE-0.4B/blob/main/LICENSE
- Web de Fastino: https://fastino.ai
- Documentación de la API de inferencia: https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Alta y API key: https://agent.fastino.ai
