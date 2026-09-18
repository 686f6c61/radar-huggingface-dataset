# microperceptron/NVIDIA-Nemotron-3-Nano-30B-A3B-FP8

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B-FP8 es una version cuantizada a FP8 del modelo Nemotron-Nano-3-30B-A3B desarrollado por NVIDIA Corporation. Se trata de un LLM entrenado desde cero, disenado como modelo unificado para tareas de razonamiento y de no razonamiento: puede generar una traza de razonamiento intermedia (thinking) antes de dar la respuesta final, o desactivarla mediante un flag de la plantilla de chat para responder directamente, con una ligera perdida de exactitud en peticiones dificiles. Esta pensado para construir agentes especializados con un coste de inferencia reducido.

La arquitectura es hibrida: combina capas Mamba-2 con capas de Mixture-of-Experts (MoE) y un pequeno numero de capas de atencion clasica. Cada capa MoE contiene 128 expertos mas 1 experto compartido, activando 6 expertos por token, lo que da un total de unos 30B parametros con solo 3,5B activos. El repositorio concreto que se analiza aqui es una publicacion de la comunidad (autor microperceptron) que redistribuye los pesos FP8 del modelo base nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16.

Su relevancia actual radica en la relacion capacidad/coste: al activar unicamente 3,5B parametros por token, ofrece resultados competitivos en razonamiento matematico (87,7 en AIME25 sin herramientas), codigo (67,6 en LiveCodeBench) y tareas agenticas (TauBench V2), con soporte de seis idiomas y uso comercial permitido bajo la NVIDIA Nemotron Open Model License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 + MoE + atencion (tipo `nemotron_h`): 23 capas Mamba-2/MoE y 6 capas de atencion |
| Parametros totales | 31.577.946.256 segun los safetensors del repositorio (la model card indica 30B) |
| Parametros activos | 3,5B (MoE con 128 expertos + 1 compartido, 6 expertos activados por token) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 (este repositorio); modelo base en BF16; no se detallan otras cuantizaciones |
| Idiomas soportados | ingles, espanol, frances, aleman, japones, italiano |
| Licencia | NVIDIA Nemotron Open Model License (`license: other`); la model card indica que esta listo para uso comercial |
| Formato de pesos | safetensors (FP8), libreria transformers con `custom_code` |
| Tamano del repositorio | 32,7 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (relacion: quantized) |
| Desarrollador | NVIDIA Corporation (publicacion de la comunidad por microperceptron) |
| Fechas de corte de datos | preentrenamiento: 25 de junio de 2025; post-entrenamiento: 28 de noviembre de 2025 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida poco habitual: 23 capas que combinan Mamba-2 con Mixture-of-Experts, mas 6 capas de atencion tradicional, segun se detalla en la model card. El componente MoE usa 128 expertos enrutados mas 1 experto compartido, con 6 expertos activados por token, de ahi la denominacion A3B (aproximadamente 3B parametros activos) frente a los 30B totales. Esta combinacion busca reducir el coste computacional por token manteniendo la capacidad de un modelo de mayor tamano.

Los datos de preentrenamiento provienen de la coleccion de datasets abiertos de NVIDIA, entre ellos Nemotron-CC-v2, Nemotron-CC-v2.1, Nemotron-CC-Math-v1, Nemotron-CC-Code-v1, Nemotron-Pretraining-Code-v1 y v2, Nemotron-Pretraining-Specialized-v1, Nemotron-Math-v2, Nemotron-Math-Proofs-v1, Nemotron-Competitive-Programming-v1, Nemotron-Science-v1, Nemotron-Agentic-v1 y Nemotron-Instruction-Following-Chat-v1. Para la fase de post-entrenamiento se cita el blend Nemotron-3-Nano-RL-Training-Blend, lo que indica un proceso de aprendizaje por refuerzo, aunque los detalles de hiperparametros, numero exacto de tokens y composicion porcentual no estan disponibles en la informacion proporcionada. La model card menciona de forma generica que el modelo se mejoro "using Qwen", sin mas detalle tecnico. El modelo se distribuye junto con los datasets de preentrenamiento y post-entrenamiento en colecciones publicas de HuggingFace.

## Capacidades

- Generacion de texto conversacional en seis idiomas (ingles, espanol, frances, aleman, japones, italiano).
- Razonamiento configurable: la traza de razonamiento puede activarse o desactivarse mediante un flag de la plantilla de chat; desactivarla reduce la latencia pero baja la exactitud en tareas dificiles.
- Razonamiento matematico de competicion: 89,1 en AIME25 en la version BF16 y 87,7 en esta version FP8, sin herramientas.
- Uso de herramientas (tool calling) en razonamiento: los mismos benchmarks suben a 99,2 (BF16) y 98,8 (FP8) en AIME25 con herramientas, y a 75,0 / 73,4 en GPQA con herramientas.
- Generacion de codigo: evaluada en LiveCodeBench (67,6 en FP8) y SciCode subtask (31,9 en FP8).
- Capacidades agenticas multi-paso: evaluado en TauBench V2 en los dominios de aerolinea, retail y telecom.
- Razonamiento cientifico: evaluado en GPQA y SciCode.
- No se documentan capacidades de vision ni de audio en la informacion proporcionada.

## Casos de uso

- Atencion al cliente multilingue automatizada: al cubrir espanol, frances, aleman, italiano, ingles y japones, un mismo despliegue puede atender usuarios de mercados distintos sin modelos separados; el modo sin razonamiento permite respuestas rapidas en consultas sencillas y se puede activar el modo razonamiento en reclamaciones complejas.
- Agentes de resolucion de tareas con herramientas: el modelo esta evaluado especificamente en escenarios agenticos (TauBench V2 en aerolinea, retail y telecom), por lo que encaja en asistentes que consultan APIs de reservas, sistemas de pedidos o CRM mediante function calling.
- Asistente de programacion en produccion: con 67,6 en LiveCodeBench v6, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests o explicacion de errores de compilacion, apoyandose en tool calling para consultar repositorios.
- Tutoria y resolucion de problemas matematicos: la puntuacion de 87,7 en AIME25 sin herramientas y 98,8 con herramientas lo hace adecuado para asistentes educativos que resuelven paso a paso y pueden verificar resultados con un interprete de calculo.
- Apoyo a investigacion cientifica y analisis de documentacion tecnica: el rendimiento en GPQA (72,5 sin herramientas) y SciCode permite usarlo como asistente de lectura de papers, resumen de evidencia y comprobacion de razonamientos, con margen limitado en conocimiento de frontera.
- Procesamiento de documentos y extraccion estructurada: en modo no razonamiento y con salida guiada por plantilla, sirve para clasificar, resumir y extraer campos de contratos o informes en varios idiomas a un coste por token bajo gracias a los 3,5B parametros activos.
- Backend de bajo coste para alto throughput: la activacion de solo 6 expertos por token reduce el coste computacional por peticion, lo que resulta util en servicios con mucho trafico y poca tolerancia a latencia (chat, autocompletado, moderacion).
- Agentes de automatizacion de back-office: combinando razonamiento multi-paso y llamadas a herramientas, puede orquestar flujos como conciliacion de datos, validacion de formularios o generacion de informes a partir de varias fuentes.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando la version BF16 con esta version FP8:

| Tarea | Nemotron-3-Nano-30B-A3B-BF16 | Nemotron-3-Nano-30B-A3B-FP8 |
|---|---|---|
| MMLU-Pro (conocimiento general) | 78,3 | 78,1 |
| AIME25 (sin herramientas) | 89,1 | 87,7 |
| AIME25 (con herramientas) | 99,2 | 98,8 |
| GPQA (sin herramientas) | 73,0 | 72,5 |
| GPQA (con herramientas) | 75,0 | 73,4 |
| LiveCodeBench (v6 2025-08 a 2025-05) | 68,3 | 67,6 |
| SciCode (subtask) | 33,0 | 31,9 |
| HLE (sin herramientas) | 10,2 | 10,3 |
| HLE (con herramientas) | 15,5 | 14,3 |
| TauBench V2 (Airline) | 48,0 | 44,8 |
| TauBench V2 (Retail) | 56,9 | 55,6 |
| TauBench V2 (Telecom) | 42,2 | 40,8 |
| TauBench V2 (media) | no disponible (dato truncado en la informacion) | no disponible (dato truncado en la informacion) |

No se han publicado en la informacion disponible resultados adicionales (por ejemplo, MMLU clasico, HumanEval o GSM8K) ni comparaciones con modelos de otros fabricantes.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 32,7 GB (tamano del repositorio), por lo que se necesitan del orden de 33-40 GB de VRAM solo para pesos, mas el espacio de la cache KV. Estas cifras son estimaciones derivadas del tamano del repositorio, no datos publicados.
- GPU recomendadas: NVIDIA H100 o A100 de 80 GB para servir el modelo completo en una sola GPU en FP8; tambien encaja en H200 o B200. Para FP8 nativo es preferible hardware Hopper o posterior (o Ada), ya que las arquitecturas anteriores no aceleran FP8 por hardware.
- GPU de consumo: no cabe en GPUs de 24 GB (RTX 4090, RTX 3090) sin tecnicas de offloading a CPU o reparto entre varias tarjetas; dos GPU de 24 GB podrian alojar los pesos con reparto por capas, aunque no hay datos publicados de rendimiento en esa configuracion.
- Opciones de despliegue: al ser un modelo de transformers con `custom_code`, requiere una version de transformers con soporte de la arquitectura `nemotron_h`. No se confirma en la informacion proporcionada soporte para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles. El diseno MoE con 3,5B parametros activos sugiere un coste por token inferior al de un modelo denso de 30B, pero no se aportan medidas de tokens por segundo.

## Comparativa con modelos similares

En la informacion proporcionada no se incluyen resultados de benchmarks de modelos de terceros, por lo que la unica comparacion con datos verificables es entre las dos variantes del propio modelo:

| Modelo | Parametros | Activos | Precision | MMLU-Pro | AIME25 (sin herramientas) | LiveCodeBench | Licencia |
|---|---|---|---|---|---|---|---|
| Nemotron-3-Nano-30B-A3B-BF16 | 30B | 3,5B | BF16 | 78,3 | 89,1 | 68,3 | NVIDIA Nemotron Open Model License |
| Nemotron-3-Nano-30B-A3B-FP8 (este repositorio) | 30B (31,58B en safetensors) | 3,5B | FP8 | 78,1 | 87,7 | 67,6 | NVIDIA Nemotron Open Model License |

Comparativa con alternativas de otros fabricantes (por ejemplo, modelos densos de 7B-14B o MoE de tamano similar): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo en conocimiento de frontera: los resultados en HLE son de 10,3 sin herramientas y 14,3 con herramientas, lo que indica una capacidad limitada en preguntas de maxima dificultad.
- Riesgo de alucinacion: como cualquier LLM, puede generar afirmaciones plausibles pero incorrectas; la propia model card recomienda permitir la traza de razonamiento cuando la tarea es dificil, ya que desactivarla reduce la exactitud.
- Perdida de precision por cuantizacion: frente a la version BF16, esta variante FP8 baja en varios benchmarks (AIME25 de 89,1 a 87,7; LiveCodeBench de 68,3 a 67,6; TauBench V2 Airline de 48,0 a 44,8; SciCode de 33,0 a 31,9). La degradacion es modesta pero medible en tareas agenticas y cientificas.
- Idiomas limitados: solo se declaran seis idiomas (ingles, espanol, frances, aleman, japones, italiano); no hay datos sobre el resto.
- Longitud de contexto no documentada en la informacion disponible: no se debe asumir una ventana concreta para cargas de contexto largo sin verificarlo en la documentacion oficial.
- Restricciones de licencia: el uso se rige por la NVIDIA Nemotron Open Model License, que es una licencia propia (`license: other`) y no una licencia open source estandar; conviene revisar sus terminos completos antes de un despliegue comercial, aunque la model card indique que el modelo esta listo para uso comercial.
- Procedencia del repositorio: se trata de una publicacion de la comunidad (microperceptron) con 0 descargas y 0 likes, no del repositorio oficial de NVIDIA. En produccion es recomendable usar los pesos del repositorio oficial o verificar la integridad de los ficheros safetensors.
- Requisitos de software: la arquitectura `nemotron_h` con `custom_code` exige versiones recientes de transformers y puede no ser compatible con todos los motores de inferencia; no se confirma soporte para llama.cpp, Ollama o vLLM en la informacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad en la informacion proporcionada.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/microperceptron/NVIDIA-Nemotron-3-Nano-30B-A3B-FP8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Paper 1: https://arxiv.org/abs/2512.20848
- Paper 2: https://arxiv.org/abs/2512.20856
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Pagina de producto en NVIDIA Build: https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b
- Pagina de desarrolladores Nemotron: https://developer.nvidia.com/nemotron
- Coleccion de datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Coleccion de datasets de post-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo (los resultados obtenidos correspondian a paginas de banca online sin relacion con el contenido).
