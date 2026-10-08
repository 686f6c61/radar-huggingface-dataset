# jacobbeckdev/trigon-qwen3-4b-lms-agents

## Resumen

trigon qwen3-4b-lms-agents v1 es un adaptador LoRA de tipo "decision tipada" construido sobre el backbone congelado Qwen/Qwen3-4B (commit 1cfa9a7208912126459214e8b04321603b3df60c, licencia Apache-2.0). Lo desarrolla el autor jacobbeckdev y su proposito no es generar texto libre, sino recibir un estado y un mapa de preguntas tipadas (eleccion multiple, si/no, puntuacion) y devolver, en un unico pase de prefill, una distribucion calibrada por pregunta. El paquete publicado contiene unicamente el adaptador LoRA (rank 16) y un modulo de lectura de respuestas (adapter.pt); el backbone se descarga desde su repositorio original y nunca se redistribuye aqui.

La relevancia del modelo esta en su enfoque de calibracion: en lugar de confiar en la probabilidad bruta del modelo, cada respuesta se puntua como continuacion del propio backbone mediante la formula `w * log p(answer) + residual`, con `w` = 0.303 para preguntas de eleccion y `w` = 0.482 para preguntas de si/no. Esto lo orienta a casos donde la fiabilidad del score importa tanto como la etiqueta: enrutado de soporte, moderacion de contenido, clasificacion de intenciones y acciones web.

El entrenamiento fue corto (1 epoca, lr 0.0001, semilla 0, 3.0 horas en CUDA) sobre una mezcla de corpus publicos mayoritariamente de nivel "green-tier". El repo ocupa 0.1 GB, no tiene descargas ni likes registrados y su model card no declara pipeline, idiomas ni licencia a nivel de ficha de HuggingFace (la licencia Apache-2.0 se indica en el texto de la model card para el bundle).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 16) sobre backbone transformer Qwen3-4B |
| Parametros totales | Backbone Qwen3-4B (~4.000M) mas adaptador LoRA rank 16 (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del backbone Qwen/Qwen3-4B) |
| Tipos de cuantizacion | No disponible (el paquete se distribuye como adapter.pt en PyTorch) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (segun el texto de la model card); el campo de licencia de la ficha de HuggingFace figura como no disponible |
| Formato de pesos | adapter.pt (PyTorch) mas ficheros SHA256SUMS para verificacion |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado desde cero, sino un adaptador LoRA de rank 16 acoplado a Qwen/Qwen3-4B, que permanece congelado. La innovacion tecnica reside en el modulo de lectura de respuestas: cada opcion candidata se puntua como continuacion del backbone segun `w * log p(answer) + residual`, con pesos de escala distintos para preguntas de eleccion (0.303) y de si/no (0.482). De este modo, una sola pasada de prefill produce una distribucion calibrada por pregunta, y no una unica etiqueta. El build identificado por el autor es `trigon-lm-score-qwen3-4b-qwen3-4b-lms-agents-s0+lm-score-v1`, servido por la puerta de enlace "trigon gateway" con backend torch.

El entrenamiento consistio en 1 epoca con learning rate 0.0001 y semilla 0, ejecutada en CUDA durante 3.0 horas. Los corpus de entrenamiento incluyen conjuntos etiquetados de intencion bancaria, emociones, instrucciones de ayuda, discurso de odio, deteccion de jailbreak y prompt injection, seguridad de contenido, inferencia de lenguaje natural y acciones web. La model card distingue explicitamente entre corpus de entrenamiento y corpus de calibracion: la calibracion se ajusto sobre 4.140 casos retenidos procedentes de banking77, goemotions, helpsteer2, measuring_hate_speech, hatexplain, mind2web-train, wanli, jailbreak-train, prompt-injections-train y aegis2-train, y las etiquetas generadas por profesores (teacher-workflows, teacher-local, teacher-agents) nunca se usan como evidencia de calibracion, solo para cobertura. Los corpus retenidos por completo son clinc150, boolq y circa, y las webs de la evaluacion de acciones web se excluyen de mind2web-train.

Resumen de corpus de entrenamiento:

| Corpus | Casos | Casos de calibracion | Licencia |
|---|---:|---:|---|
| banking77 | 1.500 | 500 | CC BY 4.0 |
| goemotions | 1.238 | 412 | Apache-2.0 |
| helpsteer2 | 844 | 281 | CC BY 4.0 |
| measuring_hate_speech | 844 | 281 | CC BY 4.0 |
| hatexplain | 1.107 | 368 | MIT (la dataset card indica CC BY 4.0) |
| teacher-workflows | 1.400 | 0 | Apache-2.0 |
| teacher-local | 1.120 | 0 | Apache-2.0 |
| mind2web-train | 1.202 | 400 | CC BY 4.0 |
| wanli | 1.500 | 500 | CC BY 4.0 |
| jailbreak-train | 1.199 | 399 | Apache-2.0 |
| prompt-injections-train | 410 | 136 | Apache-2.0 |
| aegis2-train | 1.500 | 500 | CC BY 4.0 |
| teacher-agents | 2.426 | 0 | Apache-2.0 |

## Capacidades

- Decision tipada multiples: dado un estado y un mapa de preguntas (eleccion multiple, si/no, puntuacion), devuelve una distribucion calibrada por pregunta en un unico pase de prefill.
- Clasificacion de intenciones: entrenado sobre banking77 y evaluado en banking77 (declarado, con cambio de distribucion, con opciones renombradas) y clinc150.
- Respuesta si/no: evaluado sobre boolq con 0.866 de exactitud.
- Puntuacion de sentimiento y emociones: corpus goemotions y helpsteer2.
- Moderacion de contenido: measuring_hate_speech, hatexplain y Aegis 2.0 (seguridad de contenido).
- Deteccion de jailbreak y de prompt injection: corpus jailbreak-train y prompt-injections-train.
- Inferencia de lenguaje natural: corpus WANLI.
- Acciones web: prediccion de operacion, elemento y paso siguiente, evaluada sobre Mind2Web con webs no vistas en entrenamiento.
- Calibracion explicita: el modelo expone ECE (Expected Calibration Error) y "order agreement" en su evaluacion, no solo exactitud.
- No se declaran capacidades de tool calling generativo, agentes multi-paso, vision, audio ni modo de razonamiento explicito mas alla del enrutado a preguntas tipadas.

## Casos de uso

- Enrutado de tickets de soporte bancario: el modelo recibe el texto del ticket y un mapa de intenciones tipadas y devuelve una distribucion por intencion con ECE bajo (0.028 en banking77/declared), lo que permite umbralizar por confianza antes de derivar a un humano.
- Moderacion de contenido en plataformas: clasificacion de mensajes contra categorias de odio o seguridad con corpus como measuring_hate_speech, hatexplain y Aegis 2.0, aprovechando el score calibrado para decidir entre accion automatica y revision.
- Deteccion de jailbreak y prompt injection en pasarelas de LLM: al devolver si/no calibrado, puede actuar como filtro previo de entrada (pre-guardrail) en un gateway que sirve otros modelos.
- Automatizacion de formularios y agentes web: prediccion de la operacion, el elemento y el paso siguiente sobre paginas no vistas (0.605 de exito por paso en Mind2Web), utilizable como cabecera de decision en pipelines de navegacion.
- Clasificacion de emociones para analitica de producto: uso de la distribucion calibrada de goemotions para ponderar volumen y severidad de quejas en paneles de voz del cliente.
- Inferencia de lenguaje natural para normalizacion de datos: uso sobre pares tipo WANLI para etiquetar relaciones entre frases como parte de una fase de preprocesado.
- Encuestas y anotacion asistida: al recibir preguntas tipo "escala" o "si/no", el modelo puede preetiquetar respuestas y dejar que un humano corrija solo los casos con score bajo.
- Evaluacion de calidad de datasets: su ECE y su "order agreement" (0.924 en banking77/order) permiten usarlo como referencia para medir si un conjunto de etiquetas es coherente o si las opciones presentadas al modelo influyen en el resultado.

## Benchmarks y rendimiento

Generality (`scripts/generality.py`, 1.000 casos por tarea, semilla fija):

| Tarea | Exactitud | Azar | ECE | ECE suelo p95 | Order agreement |
|---|---:|---:|---:|---:|---:|
| banking77/declared | 0.793 | 0.013 | 0.028 | 0.045 |  |
| banking77/shift | 0.847 | 0.020 | 0.031 | 0.037 |  |
| banking77/renamed | 0.836 | 0.020 | 0.029 | 0.035 |  |
| clinc150 | 0.926 | 0.020 | 0.115 | 0.039 |  |
| boolq | 0.866 | 0.500 | 0.046 | 0.027 |  |
| banking77/order | 0.851 | 0.020 | 0.032 | 0.035 | 0.924 |

Acciones web (`scripts/webact.py`, Mind2Web, webs no vistas en entrenamiento):

| Pasos | Operacion | Elemento | Exito por paso | ECE (suelo p95) |
|---:|---:|---:|---:|---|
| 600 | 0.885 | 0.685 | 0.605 | 0.066 (0.053) |

El autor advierte que se trata de "una medicion, no una certificacion" por usar una unica semilla. No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores.

## Requisitos de hardware

- El paquete publicado es un adaptador LoRA; para inferencia hay que cargar el backbone Qwen/Qwen3-4B completo (aproximadamente 4.000 millones de parametros) mas el adaptador rank 16.
- VRAM estimada para el backbone de 4B: en torno a 8-9 GB en fp16/bf16, 4-5 GB en int8 y 2,5-3 GB en cuantizacion de 4 bits (estimaciones basadas en el tamano del backbone, no publicadas por el autor).
- GPU recomendadas: con 8-9 GB de VRAM para fp16, caben tarjetas consumer como RTX 3060 de 12 GB, RTX 4070/4080/4090 y RTX 4060 Ti de 16 GB; para batching amplio y menor latencia tienen sentido A100 y H100.
- Si cabe en GPU consumer: si, siempre que se cuantice o se use un modelo de 12 GB o mas de VRAM; en tarjetas de 8 GB seria necesario recurrir a cuantizacion de 8 o 4 bits.
- Opciones de despliegue: el autor indica servirlo con "trigon serve --backend torch --weights adapter.pt" y con las variables TRIGON_*_PATH para los calibradores; vLLM, llama.cpp, Ollama o TGI no se mencionan en la model card como soportados para este bundle.
- Latencia y throughput: no disponibles (el autor solo informa de 3.0 horas de entrenamiento en CUDA; no hay datos de inferencia).
- Almacenamiento: el repo ocupa 0.1 GB, correspondiente al adaptador y a los ficheros SHA256SUMS; el backbone se descarga aparte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trigon qwen3-4b-lms-agents | Backbone ~4B + LoRA rank 16 | No disponible | Decision tipada con calibracion | Apache-2.0 (segun model card) | Repo de 0.1 GB en HuggingFace |
| Qwen/Qwen3-4B | ~4B | No disponible en esta informacion | Generacion generalista | Apache-2.0 | HuggingFace |
| Clasificadores encoder dedicados (por ejemplo, BERT-base para banking77) | ~0,1-0,3B | 512 tokens tipicos | Clasificacion de etiqueta unica | Variable (segun modelo) | HuggingFace |

No se dispone de comparativas de benchmark publicadas en la informacion proporcionada entre trigon qwen3-4b-lms-agents y alternativas de la misma categoria; cualquier comparacion de rendimiento frente a otros modelos seria una extrapolacion no verificada. La ventaja declarada del modelo es la calibracion y la exposicion de varias preguntas tipadas en un solo pase, frente a la generacion libre del backbone sin adaptar.

## Limitaciones y advertencias

- Sesgos: los corpus de entrenamiento incluyen measuring_hate_speech, hatexplain, Aegis 2.0, banking77 y goemotions, por lo que el modelo hereda los sesgos de anotacion de estas fuentes. La model card no documenta un analisis de sesgos especifico.
- Riesgo de alucinacion: al tratarse de un modelo de decision tipada, el riesgo no es la invencion de texto, sino la asignacion de una etiqueta incorrecta con un score aparentemente calibrado. La evaluacion se realizo con una unica semilla, por lo que el autor advierte que es "una medicion, no una certificacion".
- Calibracion desigual entre tareas: el ECE de clinc150 (0.115) supera con claridad el suelo p95 (0.039), mientras que banking77 y boolq quedan por debajo de su suelo. La fiabilidad del score depende, por tanto, de la tarea y del formato de opciones.
- Limitaciones de dominio: en acciones web (Mind2Web) el exito por paso es 0.605 y el ECE (0.066) queda por encima del suelo p95 (0.053), lo que limita su uso en navegacion autonoma sin supervision.
- Idiomas: no disponibles; toda la evaluacion y los corpus citados estan en ingles.
- Contexto: no disponible en la ficha; conviene consultar las especificaciones del backbone Qwen3-4B antes de usarlo con entradas largas.
- Licencia: la model card indica Apache-2.0 para el bundle, pero el campo de licencia de la ficha de HuggingFace figura como no disponible. Los corpus de entrenamiento tienen licencias variadas (CC BY 4.0, Apache-2.0 y MIT), aunque el autor afirma que todos son "green-tier" y que los corpus share-alike o de solo investigacion no se usan para entrenar.
- Formato del paquete: se distribuye exclusivamente como adaptador (`adapter.pt`); no es un modelo autónomo y requiere el backbone original. Se recomienda verificar los ficheros con SHA256SUMS tras la descarga.
- Dependencia de herramienta: el uso indicado asume la puerta de enlace "trigon" con backend torch y variables TRIGON_*_PATH para los calibradores; sin esa infraestructura no esta documentada una via de despliegue alternativa.
- Sin adopcion registrada: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/jacobbeckdev/trigon-qwen3-4b-lms-agents
- Backbone original: https://huggingface.co/Qwen/Qwen3-4B (commit 1cfa9a7208912126459214e8b04321603b3df60c)
- Banking77: https://github.com/PolyAI-LDN/task-specific-datasets
- GoEmotions: https://github.com/google-research/google-research/tree/master/goemotions
- HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Measuring Hate Speech: https://huggingface.co/datasets/ucberkeley-dlab/measuring-hate-speech
- HateXplain: https://github.com/punyajoy/HateXplain
- Qwen2.5-7B-Instruct (profesor): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Qwen3.6-35B-A3B (profesor): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Mind2Web: https://huggingface.co/datasets/osunlp/Mind2Web
- WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- jailbreak-classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Aegis 2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Documentacion interna citada pero no enlazada: `docs/self-host.md`, `docs/data.md`, `CLAUDE.md`, `scripts/generality.py`, `scripts/webact.py` (no disponibles como enlaces publicos en la informacion proporcionada)
