# Beagledata/Turn-Detection-Jev

## Resumen

Turn-Detection-Jev es un modelo de deteccion de turno de habla (turn-taking) desarrollado por Beagledata, obtenido mediante fine-tuning del modelo multimodal Qwen3-Omni-30B-A3B-Instruct. Su funcion no es generar texto conversacional, sino clasificar el estado de la interaccion de voz en un asistente: determinar si el usuario ha terminado de hablar, si sigue hablando, si ha interrumpido o si emite feedback breve (backchannel). Resuelve un problema critico en asistentes de voz: decidir cuando el sistema debe tomar la palabra y cuando debe esperar, evitando cortes prematuros o silencios incomodos.

El modelo parte de una arquitectura MoE (Mixture of Experts) de Qwen3-Omni con 31.719.205.488 parametros totales y aproximadamente 3.000 millones de parametros activos por token (segun la nomenclatura A3B del modelo base). Se distribuye como un fine-tuning LoRA sobre el modelo base, con pesos en formato safetensors y un repositorio de 63,5 GB. La licencia es Apache-2.0, lo que permite uso comercial con atribucion al modelo base.

Su relevancia actual radica en que aborda una de las tareas mas dificiles en sistemas de voz interactivos: la deteccion semantica de fin de turno condicionada por el estado de reproduccion del asistente. A diferencia de detectores basados solo en silencio o prosodia, este modelo usa la comprension audio-texto de Qwen3-Omni para distinguir intenciones semanticas en cinco acciones y siete etiquetas de estado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (Qwen3-Omni), fine-tuning LoRA |
| Parametros totales | 31.719.205.488 |
| Parametros activos | Aproximadamente 3.000 millones (nomenclatura A3B del modelo base) |
| Longitud de contexto | No disponible (la evaluacion usa ventanas de audio de hasta 8 segundos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-Omni-30B-A3B-Instruct |
| Tarea (pipeline) | audio-classification |
| Libreria | transformers |
| Tamano del repositorio | 63,5 GB |
| Metodo de entrenamiento | LoRA con ms-swift |
| Datasets de entrenamiento | ASLP-lab/Easy-Turn-Trainset, pipecat-ai/smart-turn-data-v3.2-train |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-Omni-30B-A3B-Instruct, un transformer multimodal con arquitectura Mixture of Experts que procesa audio y texto. El fine-tuning se realizo mediante LoRA usando el framework ms-swift, adaptando el modelo base para una tarea de clasificacion de estados de turno en lugar de generacion libre. La inferencia es de un solo forward pass: el modelo lee los logits de tokens candidatos de respuesta sin generar explicaciones, lo que reduce la latencia frente a enfoques generativos.

El entrenamiento utiliza dos datasets: ASLP-lab/Easy-Turn-Trainset y pipecat-ai/smart-turn-data-v3.2-train. La evaluacion se realiza con audio mono a 16 kHz en PCM16, reteniendo como maximo los ultimos 8 segundos de audio. El modelo es condicionado por estado: recibe el estado de reproduccion del asistente (`assistant_speaking` activado o desactivado) y puntua solo las etiquetas validas para ese estado (tres etiquetas de escucha o cuatro de habla). No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion exacta del dataset ni uso de RLHF/DPO.

## Capacidades

- Deteccion de fin de turno: distingue entre habla completada (`listen_complete`), habla incompleta (`listen_incomplete`) y ruido de fondo (`listen_background`) cuando el asistente esta en silencio.
- Deteccion de interrupcion y backchannel: durante la reproduccion del asistente, clasifica interrupciones completadas (`speak_interrupt`), feedback breve (`speak_backchannel`), habla incompleta (`speak_incomplete`) y ruido de fondo (`speak_background`).
- Puntuacion condicionada por estado: usa tres etiquetas de escucha o cuatro de habla segun el estado de reproduccion proporcionado por la aplicacion.
- Prediccion en un solo forward pass: lee logits de tokens candidatos sin generar texto explicativo.
- Integracion en aplicaciones: el runtime de GitHub ofrece inferencia por CLI y una API HTTP que devuelve etiquetas y probabilidades.
- Procesamiento de audio: entrada de audio mono a 16 kHz en PCM16, con ventana de hasta 8 segundos.
- Pesos abiertos: licencia Apache-2.0 con atribucion al modelo base Qwen3-Omni.

## Casos de uso

- Asistentes de voz en atencion al cliente: el modelo decide si el usuario ha terminado de hablar antes de que el asistente responda, evitando interrupciones prematuras en conversaciones multi-turno. Su capacidad de distinguir habla incompleta es clave para usuarios que dudan o hacen pausas.
- Agentes telefonicos automatizados: integrado en un pipeline de telefonia, clasifica en tiempo real si el usuario ha cedido el turno o si sigue hablando, permitiendo respuestas mas naturales y reduciendo el numero de repeticiones.
- Deteccion de interrupciones en asistentes de altavoz: cuando el asistente esta reproduciendo una respuesta, el modelo distingue entre una interrupcion real ("para, quiero otra cosa") y un backchannel ("ya, vale"), evitando que el sistema se detenga ante feedback breve.
- Filtrado de ruido de fondo en entornos ruidosos: las etiquetas `listen_background` y `speak_background` permiten descartar conversaciones de terceros, television o eco de reproduccion, mejorando la precision del sistema en hogares y oficinas.
- Sistemas de transcripcion y diarizacion en tiempo real: el modelo puede actuar como modulo de segmentacion de turnos para decidir cuando cerrar un segmento de transcripcion y cuando mantenerlo abierto, mejorando la calidad de las actas automaticas.
- Integracion en frameworks de agentes conversacionales: mediante la API HTTP del runtime, se puede incorporar como componente de decision en plataformas como Pipecat u otros orquestadores de voz, sustituyendo detectores basados en silencio por deteccion semantica.
- Evaluacion de calidad de sistemas de voz: sus etiquetas y probabilidades permiten auditar conversaciones grabadas para medir cuantos turnos se cerraron correctamente y cuantos sufrieron interrupciones erroneas.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (ejecucion nativa en Transformers, temperatura T=1, calibracion desactivada):

| Dataset | Muestras | Correctas | Accuracy | Macro-F1 semantico |
|---|---:|---:|---:|---:|
| Easy-Turn | 800 | 789 | 98,625% | 99,00% |
| Smart-Test-4000 | 4.000 | 3.871 | 96,775% | 96,81% |

Comparativa en muestras compartidas (etiquetas semanticas originales):

| Dataset | Modelo | N | Accuracy | Macro precision | Macro recall | Macro-F1 |
|---|---|---:|---:|---:|---:|---:|
| easyturn | TurnSense 1.1 GPU | 600 | 96,17% | 96,19% | 96,17% | 96,17% |
| easyturn | Smart-Turn 3.2 CPU | 600 | 76,00% | 78,21% | 76,00% | 75,52% |
| easyturn | Smart-Turn 3.2 GPU | 600 | 77,17% | 78,26% | 77,17% | 76,94% |
| easyturn | Qwen3-Omni-30B-A3B-Instruct | 600 | 92,33% | 93,40% | 92,33% | 92,53% |
| easyturn | Turn-Detection-Jev | 600 | 98,17% | 98,33% | 98,17% | 98,25% |
| smart-test | TurnSense 1.1 GPU | 4.000 | 26,28% | 75,97% | 26,28% | 38,86% |
| smart-test | Smart-Turn 3.2 CPU | 4.000 | 92,50% | 92,59% | 92,50% | 92,50% |
| smart-test | Smart-Turn 3.2 GPU | 4.000 | 93,88% | 93,89% | 93,88% | 93,87% |
| smart-test | Qwen3-Omni-30B-A3B-Instruct | 4.000 | 69,40% | 80,43% | 69,40% | 66,35% |
| smart-test | Turn-Detection-Jev | 4.000 | 96,78% | 96,87% | 96,78% | 96,81% |

Condiciones de evaluacion: resultados condicionados por estado en ventana unica, con estado de reproduccion construido mediante reglas de etiquetas y hashes de identificadores de muestra. El audio es mono a 16 kHz PCM16, reteniendo como maximo los ultimos 8 segundos. Las medias macro cubren solo etiquetas con soporte en el ground truth. Easy-Turn cubre cinco etiquetas de estado y Smart-Test tres; ninguno incluye ground truth de ruido de fondo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 31.719 millones de parametros totales y pesos en safetensors de 63,5 GB, la inferencia en precision completa requiere aproximadamente 64 GB de VRAM solo para pesos, mas memoria para activaciones y audio.
- GPU recomendadas: para precision completa, GPU de 80 GB como A100 80GB o H100 80GB. No se dispone de informacion sobre cuantizaciones que permitan reducir requisitos.
- Viabilidad en GPU de consumo: no confirmada. El tamano del repositorio (63,5 GB) y la ausencia de cuantizaciones documentadas hacen improbable su ejecucion en GPU consumer de 24 GB (RTX 4090) sin cuantizacion adicional no documentada.
- Opciones de despliegue: la model card menciona inferencia nativa en Transformers, CLI y una API HTTP del runtime de GitHub. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la model card menciona una seccion de "Client request latency" pero no se incluyen valores numericos en la informacion disponible. El diseno de un solo forward pass sin generacion de texto busca reducir latencia frente a enfoques generativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy Easy-Turn | Accuracy Smart-Test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Turn-Detection-Jev | 31,7 B (MoE, ~3 B activos) | No disponible (ventana de 8 s) | 98,17% | 96,78% | Apache-2.0 | Hugging Face |
| Qwen3-Omni-30B-A3B-Instruct | 31,7 B (MoE) | No disponible | 92,33% | 69,40% | No disponible en la informacion | Hugging Face |
| Smart-Turn 3.2 (GPU) | No disponible | No disponible | 77,17% | 93,88% | No disponible | No disponible |
| TurnSense 1.1 (GPU) | No disponible | No disponible | 96,17% | 26,28% | No disponible | No disponible |

Turn-Detection-Jev supera al modelo base Qwen3-Omni en ambas tareas de deteccion de turno, lo que confirma el efecto del fine-tuning LoRA. Frente a Smart-Turn 3.2, mejora en Easy-Turn pero es ligeramente inferior en Smart-Test (96,78% frente a 93,88% en GPU y 92,50% en CPU; el modelo de Beagledata obtiene 96,78% frente al 93,88% de Smart-Turn 3.2 GPU). TurnSense 1.1 muestra un rendimiento muy bajo en Smart-Test (26,28%), lo que sugiere falta de generalizacion en ese conjunto.

## Limitaciones y advertencias

- Requiere que la aplicacion proporcione el estado real de reproduccion del asistente (`assistant_speaking`). Un estado incorrecto invalida la seleccion de etiquetas y la prediccion.
- Las mismas palabras pueden expresar intenciones distintas segun el contexto; los ejemplos de la model card son ilustrativos, no predicciones medidas.
- La evaluacion se limita a ventanas de hasta 8 segundos de audio; no se documenta comportamiento con contextos mas largos.
- Los conjuntos de evaluacion no incluyen ground truth de ruido de fondo, por lo que el rendimiento en las etiquetas `listen_background` y `speak_background` no esta validado cuantitativamente.
- El modelo esta entrenado para clasificacion de estados de turno, no para generacion de texto conversacional; no debe usarse como sustituto del modelo base para otras tareas.
- No se dispone de informacion sobre sesgos, idiomas soportados ni robustez ante acentos o ruidos especificos.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener la atribucion al modelo base Qwen3-Omni-30B-A3B-Instruct.
- El modelo tiene muy pocas descargas (26) y un solo like en el momento de la consulta, lo que indica validacion limitada por parte de la comunidad.
- El repositorio incluye enlaces de GitHub con marcadores de posicion (`YOUR_GITHUB_ORG`, `YOUR_HF_ORG`) que no apuntan a recursos reales, lo que puede dificultar la reproducibilidad.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware de gama media.
- El modelo base es un MoE de 31,7 B de parametros; el coste de memoria en inferencia es elevado aunque los parametros activos sean aproximadamente 3 B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Beagledata/Turn-Detection-Jev
- Modelo base Qwen3-Omni-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Dataset ASLP-lab/Easy-Turn-Trainset: https://huggingface.co/datasets/ASLP-lab/Easy-Turn-Trainset
- Dataset pipecat-ai/smart-turn-data-v3.2-train: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- Codigo en GitHub: https://github.com/YOUR_GITHUB_ORG/Turn-Detection-Jev/tree/main (marcador de posicion en la model card)
- Framework ms-swift: no disponible enlace directo en la informacion proporcionada
- README en chino: README_zh.md (referenciado en la model card, sin URL absoluta disponible)
