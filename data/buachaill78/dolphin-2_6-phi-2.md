# buachaill78/dolphin-2_6-phi-2

## Resumen

Dolphin 2.6 Phi-2 es un ajuste fino (fine-tune) del modelo Phi-2 de Microsoft, desarrollado originalmente por Eric Hartford y Fernando Fernandes dentro de la familia Dolphin de Cognitive Computations. El objetivo es convertir un modelo base de 2,78 mil millones de parametros, entrenado por Microsoft para razonamiento y codigo, en un asistente conversacional sin censura, capaz de seguir instrucciones complejas y de responder a peticiones que los modelos alineados suelen rechazar. La model card indica explicitamente que el dataset fue filtrado para eliminar capas de alineamiento y sesgo, y que el usuario debe implementar su propia capa de alineamiento antes de exponerlo como servicio.

Tecnicamente se trata de un transformer decoder-only denso de 2.783.124.480 parametros, con el mismo tokenizador y la misma ventana de contexto que Phi-2 (2.048 tokens). El ajuste se realizo con qLoRA y Axolotl durante 2 dias y 3 epocas sobre 4 GPU A100, partiendo de una mezcla de datasets de instrucciones: dolphin, airoboros-2.2.1, dolphin-coder, openhermes, Magicoder-OSS-Instruct-75K, Magicoder-Evol-Instruct-110K y Capybara. La version 2.6 corrige un problema de configuracion de entrenamiento respecto a 2.5, recupera datos de empatia basados en Samantha y sustituye Synthia y Pure-Dove por Capybara.

La relevancia de esta ficha concreta es limitada: el repositorio `buachaill78/dolphin-2_6-phi-2` es una republicacion del modelo original, con 0 descargas y 0 likes en el momento de la consulta, y con metadatos de licencia contradictorios entre la ficha de HuggingFace y la propia model card. Se documenta aqui como referencia tecnica del modelo subyacente, pero para uso en produccion conviene acudir al repositorio original de Cognitive Computations.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-2 de Microsoft); requiere `custom_code` y `trust_remote_code=True` |
| Parametros totales | 2.783.124.480 (2,78 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens segun el modelo base Phi-2; no se explicita en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos se publican sin cuantizar. El entrenamiento se hizo con qLoRA, pero eso no afecta al formato de pesos publicado |
| Idiomas soportados | en (ingles) |
| Licencia | Contradictoria: la ficha de HuggingFace indica `microsoft-research-license`, mientras que la model card declara `license: mit` y a la vez `license_name: microsoft-research-license` |
| Formato de pesos | safetensors y pytorch (bin); tamano del repositorio 11,1 GB |
| Formato de prompt | ChatML (`<|im_start|>system ... <|im_end|>`) |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura es la de Phi-2: un transformer decoder-only denso de 2,78 mil millones de parametros, sin atencion lineal, sin mezcla de expertos y sin mecanismos de estado recurrente. Microsoft entreno Phi-2 sobre un corpus filtrado de libros de texto y datos sinteticos orientados a razonamiento, y doto al modelo de capacidades notables de codigo y matematicas para su tamano. Dolphin 2.6 no modifica la arquitectura ni el tokenizador: solo sustituye la capa de comportamiento mediante un ajuste supervisado sobre instrucciones. El modelo exige cargar codigo remoto de HuggingFace, lo que implica ejecutar codigo del repositorio al instanciar el modelo.

El entrenamiento se realizo con qLoRA y el framework Axolotl, sobre 4 GPU A100 y durante 2 dias, con 3 epocas sobre la mezcla de datasets ya citada (dolphin, airoboros-2.2.1, dolphin-coder, openhermes, Magicoder-OSS-Instruct-75K, Magicoder-Evol-Instruct-110K y Capybara). No se menciona en la informacion disponible el uso de RLHF, DPO u otra fase de preferencias: se trata de un SFT sobre datos filtrados para eliminar alineamiento y sesgo. La model card atribuye la mejora de calidad de la version 2.6 principalmente a la correccion de un problema de configuracion de entrenamiento, no a cambios de datos a gran escala.

## Capacidades

- Generacion de texto conversacional multi-turno con formato ChatML y rol de sistema configurable.
- Razonamiento basico y respuesta a preguntas de conocimiento general: MMLU de 55,38 en la evaluacion publicada por el autor.
- Matematicas de nivel escolar: GSM8K de 58,07 en 5-shot.
- Generacion de codigo, reforzada por los datasets Magicoder-OSS-Instruct-75K, Magicoder-Evol-Instruct-110K y dolphin-coder. No se publica resultado de HumanEval en la informacion disponible.
- Seguimiento de instrucciones detalladas, incluida la produccion de planes paso a paso (el ejemplo de la model card genera una guia estructurada de ocho puntos).
- Empatia conversacional, reintroducida en 2.6 mediante datos basados en Samantha.
- Capacidad de respuesta a peticiones que otros modelos rechazan, al haber sido entrenado sobre datos sin capa de alineamiento.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, vision ni audio.
- Capacidades multilingues: no disponibles; el modelo esta declarado unicamente para ingles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: con 2,78 mil millones de parametros cabe en una GPU de consumo y permite iterar sobre prompt de sistema y formato ChatML sin coste de infraestructura elevado.
- Generacion de codigo en entornos de desarrollo local: el ajuste sobre Magicoder y dolphin-coder lo hace util para autocompletar funciones o explicar fragmentos, ejecutandose en una estacion de trabajo con 8-12 GB de VRAM.
- Tareas de reescritura y resumen de documentacion tecnica en ingles, donde la ventana de 2.048 tokens es suficiente para articulos cortos o secciones de manual.
- Generacion de datos sinteticos para aumentar datasets de entrenamiento: su naturaleza poco restrictiva permite producir continuaciones variadas que luego se filtran con criterios propios.
- Investigacion sobre alineamiento y seguridad: sirve como contrapunto de control frente a modelos alineados al estudiar como se comporta un modelo sin capa de rechazo.
- Evaluacion comparativa de tecnicas de ajuste eficiente: al ser un fine-tune qLoRA sobre un base abierto, es un caso de estudio reproducible de como un SFT de 3 epocas altera los resultados de un modelo base.
- Asistente de matematicas de nivel secundaria: el 58,07 en GSM8K lo sitúa como opcion viable para resolver problemas aritmeticos de varios pasos con verificacion humana posterior.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con lm-evaluation-harness v0.4.1:

| Metrica | Valor |
|---|---|
| Media (Avg.) | 61,7 |
| ARC (25-shot) | 59,81 |
| HellaSwag (10-shot) | 74,65 |
| MMLU (5-shot) | 55,38 |
| TruthfulQA (0-shot) | 47,39 |
| Winogrande (5-shot) | 74,90 |
| GSM8K (5-shot) | 58,07 |

No se han publicado en la informacion disponible resultados de HumanEval, MBPP, MT-Bench ni comparaciones directas con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 2.783.124.480 parametros: aproximadamente 5,6 GB en fp16, 2,8 GB en int8 y 1,6-2 GB en 4 bits, mas el overhead de activaciones y cache KV (que crece con la ventana de 2.048 tokens).
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 en fp16 sin problema; en 4 bits funciona tambien en GPU de 4-6 GB.
- Para entrenamiento o inferencia por lotes con alta concurrencia, el autor reporta el uso de 4x A100 durante 2 dias para el ajuste qLoRA. No se publican cifras de latencia ni throughput.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via directa. vLLM y TGI pueden servir el modelo si soportan la arquitectura Phi-2 con codigo remoto; no se confirma en la informacion disponible. llama.cpp y Ollama requieren convertir los pesos a GGUF, y el repositorio no incluye ficheros GGUF.
- El repositorio ocupa 11,1 GB, un tamano desproporcionado para un modelo de 2,78 mil millones de parametros en fp16, lo que sugiere la presencia de copias redundantes de pesos en varios formatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de benchmark en esta informacion |
|---|---|---|---|---|
| Dolphin 2.6 Phi-2 (este) | 2,78 mil millones | 2.048 tokens | Contradictoria (MIT vs microsoft-research-license) | Avg. 61,7; MMLU 55,38; GSM8K 58,07 |
| Phi-2 (base de Microsoft) | 2,7 mil millones | 2.048 tokens | MIT | no disponible en la informacion proporcionada |
| TinyLlama-1.1B-Chat | 1,1 mil millones | 2.048 tokens | Apache 2.0 | no disponible en la informacion proporcionada |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens segun su model card | Apache 2.0 | no disponible en la informacion proporcionada |

La comparativa se limita a parametros, contexto y licencia, que son datos verificables; no se incluyen cifras de rendimiento de los alternativas porque no forman parte de la informacion proporcionada y no deben inferirse.

## Limitaciones y advertencias

- El modelo es explicitamente "uncensored": el autor advierte que responde a practicamente cualquier peticion, incluidas las poco eticas, y recomienda implementar una capa de alineamiento propia antes de exponerlo como servicio.
- Riesgo elevado de contenido danino, sesgos, lenguaje ofensivo y respuestas factualmente incorrectas. La puntuacion de TruthfulQA (47,39) es la mas baja de su tabla de evaluacion, lo que indica una fiabilidad limitada en veracidad.
- Riesgo de alucinacion relevante para cualquier uso en produccion, especialmente en dominios especializados y en tareas que exigen precision factual.
- Ventana de contexto de solo 2.048 tokens: inadecuada para documentos largos, conversaciones extensas o analisis de repositorios de codigo completos.
- Solo ingles declarado. No debe asumirse un rendimiento aceptable en castellano u otros idiomas.
- Metadatos de licencia contradictorios: la ficha de HuggingFace declara `microsoft-research-license`, la model card declara MIT en el encabezado y `license_name: microsoft-research-license` en los campos. Antes de un uso comercial es imprescindible resolver esta ambiguedad con el autor y revisar el fichero LICENSE, ya que la licencia de investigacion de Microsoft impone restricciones que la MIT no tiene.
- `trust_remote_code=True` es obligatorio, lo que implica ejecutar codigo del repositorio: hay que auditar ese codigo antes de cargarlo en un entorno de produccion.
- El repositorio consultado tiene 0 descargas y 0 likes y no es el repositorio original de Eric Hartford, por lo que la procedencia de los pesos y su integridad no estan garantizadas por la fuente original.
- No se documenta soporte de tool calling ni de agentes, por lo que no es una eleccion adecuada para pipelines que dependan de llamadas a funciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/buachaill78/dolphin-2_6-phi-2
- Modelo base Phi-2 de Microsoft: https://huggingface.co/microsoft/phi-2
- Blog del autor sobre modelos sin censura: https://erichartford.com/uncensored-models
- Discord de Cognitive Computations: https://discord.gg/tCMkMDDHwm
- Patrocinador del entrenamiento, Convai: https://www.convai.com/
- Framework de entrenamiento Axolotl: https://github.com/OpenAccess-AI-Collective/axolotl
- Papel Orca de Microsoft, citado como inspiracion: no se incluye URL en la informacion proporcionada
- Datasets citados: `ehartford/dolphin`, `jondurbin/airoboros-2.2.1`, `ehartford/dolphin-coder`, `teknium/openhermes`, `ise-uiuc/Magicoder-OSS-Instruct-75K`, `ise-uiuc/Magicoder-Evol-Instruct-110K`, `LDJnr/Capybara`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos pertenecen a software escolar no relacionado.
