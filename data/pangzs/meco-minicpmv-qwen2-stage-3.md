# pangzs/MeCo-MiniCPMV-Qwen2-Stage-3

## Resumen

MeCo-MiniCPMV-Qwen2-Stage-3 es el checkpoint final (Stage-3) de MeCo, un modelo de lenguaje y vision para video orientado a la localizacion temporal (video temporal localization). Lo desarrolla el autor identificado como pangzs y se presenta en el articulo "Measure Twice, Cut Once: A Semantic-Oriented Approach to Video Temporal Localization with Video LLMs" (arXiv:2503.09027, aceptado en ICLR 2026). El problema que aborda es la localizacion precisa de intervalos temporales en video a partir de una consulta en lenguaje natural, una tarea mas estricta que la simple descripcion o el resumen de video.

El modelo parte del backbone MiniCPM-V 2.6, que integra un LLM Qwen2 de 7B con un codificador visual, y suma 8.820.170.240 parametros totales segun los pesos en safetensors (17,6 GB en el repositorio). La etapa Stage-3 entrena el agregador, el proyector y el LLM mediante LoRA sobre el dataset ET-Instruct-164K, incorporando las anotaciones de tokens estructurales y de captioning centrado en la consulta (query-focused captioning) propuestas por MeCo.

Es relevante ahora porque la localizacion temporal en video es una capacidad critica para agentes que deben razonar sobre clips largos y responder con marcas de tiempo exactas, y porque el checkpoint se distribuye como fine-tune abierto sobre una base ampliamente utilizada. La model card no detalla licencia propia ni idiomas soportados, y remite a la licencia de MiniCPM-V 2.6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video LLM basado en MiniCPM-V 2.6 (codificador visual + LLM Qwen2-7B); agregador, proyector y LLM ajustados con LoRA en Stage-3 |
| Parametros totales | 8.820.170.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la model card; los pesos derivan de MiniCPM-V 2.6 y quedan sujetos a la licencia de MiniCPM-V |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

MeCo sigue el esquema de los video LLM: un codificador visual que procesa los fotogramas del video, un proyector que alinea las representaciones visuales con el espacio del LLM y un LLM Qwen2-7B como decodificador. Sobre esta base, MeCo introduce un agregador y una estrategia de "tokens estructurales" para representar de forma explicita los limites temporales de los eventos, junto con anotaciones de captioning centrado en la consulta. El Stage-3 se inicializa desde el checkpoint Stage-2 (pangzs/MeCo-MiniCPMV-Qwen2-Stage-2) y entrena el agregador, el proyector y el LLM mediante LoRA sobre ET-Instruct-164K, un conjunto de instrucciones para localizacion temporal en video.

El articulo propone un enfoque semantico ("measure twice, cut once") en el que el modelo primero interpreta semanticamente la consulta y el contenido del video y despues delimita el intervalo temporal, reduciendo el error de localizacion respecto a los enfoques que predicen directamente marcas de tiempo. No se dispone en la informacion proporcionada del numero total de tokens de entrenamiento, de la composicion completa del dataset ni de detalles sobre RLHF o DPO; la model card solo cita ET-Instruct-164K y las anotaciones propias de MeCo.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre video (pipeline video-text-to-text).
- Localizacion temporal de eventos en video a partir de consultas en lenguaje natural, con salida de intervalos o marcas de tiempo.
- Grounding temporal (temporal grounding) apoyado en tokens estructurales y captioning centrado en la consulta.
- Comprension de video combinada con el LLM Qwen2-7B para responder preguntas sobre el contenido.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el backbone Qwen2 es multilingue, pero la model card no lo declara).
- Modo thinking, vision, audio u otras capacidades especiales: no disponible salvo la entrada de video.

## Casos de uso

- Indexado y busqueda de video por lenguaje natural: dado un archivo largo, el modelo recibe la consulta y devuelve el intervalo temporal donde ocurre el evento, lo que permite construir un buscador semantico sobre bibliotecas de video.
- Generacion automatica de capitulos y marcas de tiempo: usar la localizacion temporal para segmentar un video en secciones coherentes y etiquetarlas, util en plataformas de formacion y streaming.
- Edicion y postproduccion asistida: localizar planos o acciones concretas ("el momento en que aparece el coche rojo") para generar cortes automaticos en un pipeline de edicion.
- Moderacion y auditoria de contenido audiovisual: localizar en que instantes del video ocurre un evento de interes para revision humana, reduciendo el tiempo de visionado.
- Analisis de video de vigilancia o deportivo: extraer intervalos de eventos (una jugada, una intrusion) a partir de una descripcion textual y alimentar sistemas de alerta.
- Anotacion asistida de datasets de video: el modelo propone intervalos temporales que un anotador humano valida, acelerando la creacion de datos para otros modelos.
- Investigacion en video LLM: servir como checkpoint de referencia para reproducir los resultados del articulo y comparar estrategias de localizacion temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (por ejemplo, mIoU o R@1 en tareas de localizacion temporal) para este checkpoint; los resultados del metodo deben consultarse en el articulo arXiv:2503.09027.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.820.170.240 parametros, en FP16 se requieren aproximadamente 17,6 GB solo para pesos, mas el coste del codificador visual y de la cache KV para multiples fotogramas; en cuantizacion de 8 bits, en torno a 9-10 GB, y en 4 bits, en torno a 5-6 GB, aunque estas cifras son estimaciones y no estan publicadas en la model card.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar y contextos de video largos; RTX 4090 (24 GB) para FP16 ajustado o cuantizacion de 8 bits.
- GPU de consumo: puede caber en RTX 4090 con cuantizacion y en GPUs de 24 GB o mas; en GPUs de 12-16 GB solo con cuantizacion agresiva y limitando el numero de fotogramas.
- Opciones de despliegue: transformers (libreria declarada) y, previsiblemente, vLLM o TGI para servir el LLM, aunque la model card no confirma compatibilidad; llama.cpp/Ollama no estan confirmados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MeCo-MiniCPMV-Qwen2-Stage-3 | 8.820.170.240 | no disponible | Video LLM para localizacion temporal | Sujeta a MiniCPM-V 2.6 | Hugging Face (pangzs) |
| MiniCPM-V 2.6 (base) | no disponible en la informacion | no disponible | Video/imagen LLM generalista | Licencia MiniCPM-V | Hugging Face (openbmb) |
| Modelos de localizacion temporal de video comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card no ofrece comparativas con otros modelos de localizacion temporal; para una comparacion cuantitativa debe consultarse el articulo arXiv:2503.09027.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de MiniCPM-V 2.6 y Qwen2-7B, puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: como todo LLM, puede generar intervalos temporales o descripciones no respaldados por el video; la localizacion debe validarse en produccion.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados; el rendimiento fuera del ingles no esta garantizado.
- Restricciones de licencia: la model card no declara una licencia propia y remite a la licencia de MiniCPM-V 2.6; es imprescindible revisarla antes de un uso comercial.
- Caveat de produccion: el modelo es un checkpoint de investigacion (Stage-3 de un pipeline de entrenamiento) con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia publica de robustez en despliegues reales.
- Dependencia del pipeline: requiere el codigo del repositorio GitHub de MeCo para instalacion e inferencia; no se garantiza funcionamiento directo con todas las herramientas estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pangzs/MeCo-MiniCPMV-Qwen2-Stage-3
- Checkpoint previo (Stage-2): https://huggingface.co/pangzs/MeCo-MiniCPMV-Qwen2-Stage-2
- Articulo: https://arxiv.org/abs/2503.09027
- Repositorio GitHub: https://github.com/pangzss/MeCo
- Modelo base MiniCPM-V 2.6: https://huggingface.co/openbmb/MiniCPM-V-2_6
