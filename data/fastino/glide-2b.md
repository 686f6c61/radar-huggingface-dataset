# fastino/GLiDE-2B

## Resumen

GLiDE-2B es un modelo de decisión desarrollado por Fastino Labs que, dado un estado (texto o JSON) y una o varias preguntas tipadas, devuelve probabilidades calibradas para cada opción de cada pregunta. No es un modelo generativo al uso: no produce texto libre, sino que ejecuta una única pasada forward por pregunta y lee la distribución de probabilidad desde un cabezal de decisión de 255 vías. Con 1.881.825.088 parámetros (1,88 B, de los cuales 509 M corresponden a embeddings de tokens y solo 0,52 M al readout de decisión), está pensado para tareas de clasificación, enrutamiento y puntuación donde la latencia y la calibración importan más que la generación.

El modelo se presenta como un "decision model" destilado de profesores de razonamiento, según el paper arXiv:2611.26509. Soporta tres tipos de decisión: `choice` (una entre hasta 255 opciones nombradas), `noul` (sí/no, devuelve P(yes)) y `score` (niveles ordenados con nivel esperado). Acepta estados en texto plano o JSON y contextos de hasta 40.000 tokens por pregunta.

Su relevancia actual radica en la latencia: 17,8 ms de mediana por petición en una RTX PRO 6000, con 3,76 GB de VRAM tras la carga. Esto lo posiciona como alternativa a pipelines de clasificación basados en LLM generativos, donde cada decisión requeriría decodificación autoregresiva y decenas o cientos de milisegundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención lineal (qwen3_5), cabezal de decisión de 255 vías; sin codificador de visión |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 40.000 tokens por prompt de pregunta (estado, pregunta y opciones) |
| Tipos de cuantizacion | bf16 (único formato publicado; no se indican otras cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | fastino-community (license: other) |
| Formato de pesos | safetensors (repo de 3,8 GB; pesos bf16 de 3,78 GB en disco) |

## Arquitectura y entrenamiento

GLiDE-2B es un transformer de 1,88 B parámetros con capas de atención lineal, identificado en los tags de Hugging Face como `qwen3_5`. El modelo incorpora un cabezal de decisión ("decision readout") de 255 vías y solo 0,52 M parámetros, desde el cual se leen las probabilidades de cada opción. No dispone de codificador de visión: las peticiones con imágenes se rechazan explícitamente. La inferencia se realiza en una única pasada forward por pregunta, agrupando todas las preguntas de una petición (y de peticiones concurrentes) en micro-lotes.

Según el paper, el modelo se destila a partir de profesores de razonamiento, lo que explica su orientación a producir decisiones calibradas en lugar de texto generado. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se especifica que los pesos y el cómputo son en bf16, y que la implementación validada usa `flash-linear-attention==0.5.2` para los kernels de atención lineal; sin ese paquete, transformers recurre a una implementación PyTorch mucho más lenta que no formó parte de la validación.

## Capacidades

- Decisiones tipadas: `choice` (una de hasta 255 opciones nombradas), `noul` (sí/no con P(yes)) y `score` (niveles ordenados con nivel esperado y distribución de probabilidad).
- Probabilidades calibradas para cada opción de cada pregunta, leídas del readout de 255 vías; no hay generación de texto.
- Una pasada forward por pregunta, con micro-batching conjunto de todas las preguntas de una petición y de peticiones concurrentes.
- Estados de entrada en texto plano o cualquier valor JSON.
- Contextos largos: hasta 40.000 tokens por prompt de pregunta (estado, pregunta y opciones).
- Interfaz Python (`model.decide`, `model.decide_batch`) y servidor HTTP compatible con el formato System One (`POST /v1/systemone`).
- Sin capacidades de visión: las peticiones con imágenes se rechazan.
- No se documentan capacidades de tool calling, agentes ni multilingüismo.

## Casos de uso

- Clasificación de tickets de soporte: el modelo recibe el texto del ticket y el nivel del cliente como estado JSON y devuelve, en una sola pasada, la intención (`choice`), la urgencia (`noul`) y la prioridad (`score`), como muestra el ejemplo de la model card. Adecuado por su latencia de 17,8 ms y su calibración probabilística.
- Enrutamiento de peticiones en pipelines de agentes: dado el estado de la conversación, decidir a qué herramienta o sub-agente derivar cada turno mediante una pregunta `choice` con las opciones disponibles.
- Moderación y filtrado de contenido: usar preguntas `noul` para determinar si un texto cumple una política concreta, aprovechando la probabilidad devuelta como umbral ajustable en lugar de una respuesta binaria opaca.
- Puntuación de calidad o riesgo: con preguntas `score` de niveles ordenados (por ejemplo, bajo/medio/alto), obtener el nivel esperado y la distribución completa para integrarlos en un sistema de scoring downstream.
- Extracción de señales estructuradas de JSON: al aceptar cualquier valor JSON como estado, puede evaluar registros de telemetría, eventos o payloads de API y emitir decisiones de clasificación sobre ellos sin preprocesado adicional.
- Despliegue de bajo coste en producción: con 3,76 GB de VRAM tras la carga y 5,11 GB de pico en el test de latencia, cabe en GPUs de consumo y permite servir clasificación a gran volumen sin infraestructura de LLM generativo.
- Evaluación de decisiones en lote: `decide_batch` permite puntuar varios estados y conjuntos de preguntas juntos, útil para reprocesar históricos o para evaluación offline de políticas de enrutamiento.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decision Index 0.3.1 (suite pública) | 60,64 |
| Latencia mediana por petición | 17,8 ms |
| GPU de medida | NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) |
| Precisión | bf16 |
| Kit de medida | Kit oficial del Decision Index 0.3.1 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM: 3,76 GB tras la carga; 5,11 GB de pico sobre las peticiones mixtas del test de latencia.
- GPU probada: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), con la que se midieron los 17,8 ms de mediana.
- Cabe en GPU de consumo: con menos de 4 GB de pesos en bf16, es compatible con tarjetas de 8 GB o más; no se han publicado medidas en GPU de consumo.
- Tiempo de carga: 5 s desde almacenamiento en red; los pesos se copian a la GPU tensor a tensor, manteniendo bajo el uso de memoria host.
- Despliegue: paquete Python `glide` incluido en el repositorio, más servidor HTTP con formato System One (`POST /v1/systemone`). También disponible mediante la API alojada de Fastino (`POST https://api.fastino.ai/v1/systemone`, modelo `fastino/GLiDE`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Entorno validado: Python 3.12, `torch==2.14.0` (ruedas CUDA 13.0), `triton==3.8.0`, `transformers==5.17.0`, y opcional pero recomendado `flash-linear-attention==0.5.2`. Sin este último, el rendimiento cae a una implementación PyTorch no validada.
- Throughput: no disponible; solo se publica la latencia mediana por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE-2B (Fastino) | 1,88 B | 40.000 tokens por pregunta | Modelo de decisión con probabilidades calibradas, una pasada forward | fastino-community | Pesos en Hugging Face y API alojada |
| LLM generativo de ~2 B (clasificación vía prompting) | ~2 B | Variable según modelo | Generación autoregresiva; la clasificación se obtiene parseando la salida | Variable | Amplia |
| Clasificadores encoder dedicados (tipo BERT) | 0,1-0,5 B típicamente | 512-8.192 tokens típicamente | Clasificación supervisada por tarea, sin preguntas tipadas ni JSON | Variable | Amplia |

No se dispone en la información proporcionada de comparaciones numéricas con alternativas concretas; la tabla recoge únicamente diferencias de enfoque y especificaciones.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo devuelve probabilidades sobre opciones predefinidas.
- Sin visión: las peticiones con imágenes se rechazan.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Licencia `fastino-community` (license: other): es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial.
- La model card no detalla datos de entrenamiento, composición del dataset ni procesos de alineación, lo que dificulta evaluar sesgos conocidos.
- La calibración de las probabilidades está medida sobre el Decision Index 0.3.1; no hay garantías de calibración en dominios distintos.
- El rendimiento depende de `flash-linear-attention==0.5.2`; sin ese paquete, la implementación de respaldo no fue validada y es mucho más lenta.
- Las versiones de dependencias están fijadas (torch 2.14.0, transformers 5.17.0, triton 3.8.0); desviarse de ellas puede romper la compatibilidad.
- El paquete `glide/` vive en la raíz del repositorio: hay que ejecutar desde ese directorio o añadirlo a `PYTHONPATH`.
- No se publican datos de throughput ni de latencia en GPU de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiDE-2B
- Paper (arXiv:2611.26509): https://arxiv.org/abs/2611.26509
- Licencia: https://huggingface.co/fastino/GLiDE-2B/blob/main/LICENSE
- Fastino Labs: https://fastino.ai
- Documentación de la API de inferencia: https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Alta y API key: https://agent.fastino.ai
