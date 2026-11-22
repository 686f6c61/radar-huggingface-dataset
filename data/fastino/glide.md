# fastino/GLiDE

## Resumen

GLiDE 27B es un modelo de decisión desarrollado por Fastino Labs que, a diferencia de los LLM generativos convencionales, no produce texto: dado un estado (texto, JSON o imágenes) y una o varias preguntas tipadas, devuelve una distribución de probabilidad sobre las opciones de cada pregunta en un único forward pass. Está construido sobre una arquitectura híbrida de atención (etiqueta `qwen3_5` en Hugging Face) con 26.085 millones de parámetros en bf16 y un cabezal de lectura de decisión de 255 vías.

El modelo se distingue por su enfoque de "System One": razonamiento rápido, calibrado y determinista, destilado de profesores de razonamiento según el paper asociado (arXiv:2611.26509). Soporta tres tipos de decisión: `choice` (una entre hasta 255 opciones nombradas), `noul` (probabilidad de sí/no) y `score` (niveles ordenados con nivel esperado). Admite contextos de hasta 40.000 tokens por pregunta e integra un codificador visual de 0,92 GB para estados multimodales.

Su relevancia actual radica en que ofrece una alternativa de baja latencia (112 ms de mediana por petición en una RTX PRO 6000) para tareas de clasificación, enrutamiento y scoring donde un LLM generativo sería sobredimensionado, lento o menos calibrado. Se distribuye con licencia comunitaria `fastino-community` y también mediante API alojada de Fastino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal (etiqueta `qwen3_5`), codificador visual y cabezal de decisión de 255 vías |
| Parametros totales | 26.085.330.160 (26,1 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 40.000 tokens por prompt de pregunta (estado, pregunta, opciones y tokens de imagen) por defecto |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | `fastino-community` (licencia "other", enlace a LICENSE en el repo) |
| Formato de pesos | safetensors (bf16, 52,2 GB en disco: 51,2 GB LM + 0,92 GB vision encoder + 2,6 MB readout) |

## Arquitectura y entrenamiento

GLiDE combina un language model de 51,2 GB en bf16 con un vision encoder de 0,92 GB y un pequeño cabezal de lectura de 2,6 MB que produce la distribución sobre 255 opciones. La arquitectura es híbrida: incluye capas de atención lineal para las que se recomienda el paquete `flash-linear-attention==0.5.2` (sin él, transformers cae a una implementación PyTorch mucho más lenta no validada). El modelo no genera tokens: cada pregunta se resuelve en un único forward pass, y las preguntas de una petición (y de peticiones concurrentes) se agrupan en micro-lotes para su scoring conjunto.

Según el título del paper, el modelo se obtiene por destilación a partir de "reasoning teachers", es decir, profesores con capacidad de razonamiento que generan las etiquetas o distribuciones de las que aprende el estudiante. El objetivo es un modelo calibrado (las probabilidades devueltas son interpretables como confianza) y rápido. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La inferencia está validada con Python 3.12, `torch==2.14.0` y `transformers==5.17.0`.

## Capacidades

- Decisiones tipadas: `choice` (una opción entre hasta 255 nombradas), `noul` (probabilidad de sí) y `score` (niveles ordenados con nivel esperado y distribución).
- Probabilidades calibradas para cada opción, leídas de un readout de 255 vías; no hay generación de texto (output_tokens = 0).
- Estados multimodales: texto plano, cualquier valor JSON, o listas de partes de texto e imagen (PIL, rutas, bytes, base64 o data URLs).
- Contexto largo: hasta 40.000 tokens por pregunta, incluyendo tokens de imagen.
- Procesamiento en micro-lotes de preguntas y peticiones concurrentes en un solo forward pass por pregunta.
- Interfaces: API Python (`glide.Glide`) y servidor HTTP compatible con el formato System One (`POST /v1/systemone`).
- No soporta tool calling, agentes multi-step ni generación de código de forma nativa, dado que no es un modelo generativo.

## Casos de uso

- Clasificación de tickets de soporte: el modelo recibe el texto del ticket y un JSON de metadatos como estado, y devuelve la intención (`choice`), la urgencia (`noul`) y la prioridad (`score`) en una sola llamada, como muestra el ejemplo de la model card con confianzas de 0,96, 0,85 y 0,90 respectivamente.
- Enrutamiento de peticiones en pipelines de agentes: usar `choice` para decidir qué herramienta, modelo o cola debe atender una consulta, con la ventaja de una latencia mediana de 112 ms que permite intercalarlo en flujos interactivos.
- Moderación y scoring de contenido: evaluar textos o imágenes contra criterios ordenados (`score`) y obtener el nivel esperado y la distribución completa para fijar umbrales de revisión humana.
- Triaje multimodal en atención al cliente: adjuntar fotos de producto o capturas junto al texto del estado y preguntar por categoría, defecto o gravedad, aprovechando el codificador visual integrado.
- Extracción de señales en formularios y documentos JSON: puntuar estados estructurados (por ejemplo, datos de pedido o de cliente) con preguntas tipadas sin necesidad de prompts generativos largos.
- Evaluación automática de respuestas o pares preferidos: usar `noul` o `score` para asignar probabilidades a criterios de calidad, útil en pipelines de anotación o de filtrado de datos.
- Detección de intención en asistentes de voz o chat: clasificación rápida y calibrada de la intención del usuario con contexto conversacional largo (hasta 40.000 tokens).

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto de medida |
|---|---|---|
| Decision Index 0.3.1 (suite pública) | 72,49 | Kit oficial, una RTX PRO 6000, pesos bf16 |
| Latencia mediana por petición | 112 ms | RTX PRO 6000, muestra de 750 peticiones |

No se han publicado en la información disponible resultados de benchmarks generativos (MMLU, HumanEval, GSM8K) ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM: 52,2 GB tras la carga en bf16; pico de 56,4 GB medido sobre la muestra de 750 peticiones de latencia.
- GPU: una GPU con 80 GB o más. Probada en NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB). No cabe en GPUs de consumo tipo RTX 4090 (24 GB) en bf16.
- Tiempo de carga: 10 s desde caché local en caliente; más desde almacenamiento en red. Los pesos se copian a la GPU tensor a tensor, manteniendo bajo el uso de memoria host. El preprocesado de imágenes corre en CPU.
- Despliegue: paquete `glide/` en la raíz del repositorio (API Python) y servidor HTTP con formato System One (`POST /v1/systemone`). También disponible mediante API alojada de Fastino (`POST https://api.fastino.ai/v1/systemone`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Dependencias: Python 3.12, `torch==2.14.0`, `transformers==5.17.0`; `flash-linear-attention==0.5.2` opcional pero recomendado (todas las cifras se midieron con él instalado). El aviso de `causal_conv1d` no instalado es esperado y no afecta a la configuración validada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. A modo estructural, GLiDE se diferencia de los LLM generativos del mismo orden de parámetros en que no genera texto y en que devuelve probabilidades calibradas en un solo forward pass; sin embargo, no hay cifras publicadas para comparar con alternativas concretas.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE 27B | 26,1 B | 40.000 tokens por pregunta | Probabilidades sobre opciones tipadas | `fastino-community` | Pesos en HF + API Fastino |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre, código ni razonamiento encadenado; solo puntúa opciones predefinidas. No sustituye a un LLM conversacional.
- Requiere definir explícitamente las opciones y criterios de cada pregunta; la calidad de las decisiones depende del diseño de las etiquetas y de las instrucciones.
- Licencia `fastino-community` (categoría "other"): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no se confirma en la información disponible si el uso comercial está permitido.
- Idiomas soportados no declarados: no hay garantía documentada de rendimiento multilingüe más allá del inglés de los ejemplos.
- Riesgo de calibración fuera de dominio: las probabilidades son calibradas según el paper, pero no se documentan evaluaciones de robustez ante distribuciones de entrada distintas a las de entrenamiento.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Huella de hardware elevada: 52,2 GB en bf16 y requisito de GPU de 80 GB o más; no hay versiones cuantizadas publicadas.
- La inferencia óptima depende de `flash-linear-attention`; sin él, el rendimiento cae a una implementación PyTorch no validada.
- No se especifican límites de concurrencia ni throughput máximo más allá del dato de latencia mediana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiDE
- Paper (arXiv:2611.26509): https://arxiv.org/abs/2611.26509
- Licencia: https://huggingface.co/fastino/GLiDE/blob/main/LICENSE
- Web de Fastino: https://fastino.ai
- Documentación de la API de inferencia: https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Alta y API key: https://agent.fastino.ai
