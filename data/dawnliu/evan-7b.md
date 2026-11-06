# DawnLiu/EVAN-7B

## Resumen

EVAN-7B es un modelo multimodal de tipo imagen-texto desarrollado por DawnLiu (Chenxi Liu, Tianyi Xiong, Yanshuo Chen y Heng Huang) y presentado en el paper de NeurIPS 2026 *Grounding Multimodal Reasoning with Evidence-Ablated Negatives*. Se trata de un ajuste por aprendizaje por refuerzo del modelo base Qwen2.5-VL-7B-Instruct, orientado a mejorar el razonamiento visual y matematico multimodal. El problema que aborda es concreto: las recompensas de RLVR (RL con verificacion) suelen comprobar solo la respuesta final, de modo que el modelo puede acertar apoyandose en sesgos del lenguaje o atajos del dataset en lugar de en la evidencia visual de la imagen.

La innovacion del metodo EVAN consiste en enmascarar la evidencia visual que una pregunta necesita, dejar que la politica actual responda sin ella y penalizar las respuestas plausibles pero incorrectas que produce bajo la imagen limpia. El entrenamiento se realiza con DAPO sobre el dataset ViRL39K. El resultado es un modelo de 8.292.166.656 parametros (aproximadamente 8,3 mil millones) con licencia Apache 2.0, misma que su base.

Es relevante ahora porque demuestra que es posible mejorar el anclaje visual de un VLM de 7B sin aumentar el tamano del modelo ni el volumen de datos, superando tanto al base como a una receta DAPO equivalente en nueve benchmarks de razonamiento multimodal, con una media de 57,9 % frente a 41,3 % del base y 56,5 % de DAPO. El modelo esta pensado para investigacion y para tareas de razonamiento visual que exigen justificar la respuesta a partir de la imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basada en Qwen2.5-VL; ajuste por RL (DAPO + EVAN) |
| Parametros totales | 8.292.166.656 (8,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el repo no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; repo de 16,6 GB) |

## Arquitectura y entrenamiento

EVAN-7B parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal con codificador visual y modelo de lenguaje, y no modifica la arquitectura: el ajuste se aplica exclusivamente sobre los pesos mediante aprendizaje por refuerzo. El entrenamiento usa DAPO sobre el dataset ViRL39K (TIGER-Lab), un conjunto de tareas de razonamiento visual verificables. La innovacion tecnica es el esquema de recompensas EVAN: para cada pregunta se enmascara la evidencia visual necesaria, se permite que la politica responda sin esa evidencia y se penalizan las respuestas plausibles pero erroneas que el modelo produce con la imagen limpia. Asi se evita que la recompensa premie aciertos obtenidos por priors del lenguaje o atajos del dataset.

El modelo incorpora un modo de razonamiento explicito: se le instruye a generar un monologo interno de razonamiento entre etiquetas `<think> </think>` y a entregar la respuesta final dentro de `\boxed{}`. El `generation_config.json` del repositorio fija los parametros de muestreo usados en evaluacion (temperatura 1.0). Respecto al base, los cambios se limitan a los pesos por RL, la configuracion de generacion y el re-guardado de configuracion, tokenizer y processor, con `dtype` fijado a `bfloat16` en `config.json`. No se documenta en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset mas alla de ViRL39K.

## Capacidades

- Razonamiento visual multimodal: responde preguntas sobre imagenes con un monologo de razonamiento previo a la respuesta final.
- Matematicas visuales y geometria: resolucion de problemas tipo Geo3K, MathVista, MathVerse, We-Math, DynaMath y MathVision.
- Razonamiento logico y de conocimiento multimodal: LogicVista, MMMU-Pro y MMK12.
- Generacion de texto conversacional multi-turno (pipeline image-text-to-text).
- Modo de razonamiento explicito con etiquetas `<think>` y respuesta final en `\boxed{}`.
- Ajuste fino por refuerzo orientado al anclaje en la evidencia visual (grounding).
- Capacidades del modelo base Qwen2.5-VL-7B-Instruct (vision, OCR, grounding de objetos) potencialmente conservadas, aunque no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso mas alla del monologo interno: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Evaluacion de investigacion en RLVR multimodal: utilizar EVAN-7B como referencia o baseline para comparar recetas de recompensa (DAPO frente a EVAN) en tareas de razonamiento visual verificable, replicando los experimentos del paper.
- Tutoria de matematicas con imagenes: el modelo recibe una foto de un problema de geometria o aritmetica y genera un razonamiento paso a paso antes de la respuesta final, adecuado para entornos educativos que exigen justificacion.
- Analisis de graficos y tablas en documentos: interpretar figuras, diagramas y tablas dentro de imagenes y responder preguntas cuantitativas, apoyandose en su entrenamiento en MathVista y MathVerse.
- Verificacion de razonamiento visual en pipelines de QA: integrar el modelo en un sistema que compruebe si una respuesta se sostiene en la imagen, aprovechando el anclaje visual inducido por EVAN.
- Prototipado de asistentes visuales en ingles: construir demos de conversacion imagen-texto con `transformers` y `AutoModelForImageTextToText`, usando el prompt de razonamiento documentado.
- Investigacion sobre alucinacion y atajos de dataset: emplear el modelo y el codigo del repositorio GitHub para estudiar como las recompensas basadas solo en la respuesta final inflan metricas sin grounding real.
- Evaluacion comparativa de VLMs de 7B: usar EVAN-7B como punto de comparacion frente a Qwen2.5-VL-7B-Instruct y otros modelos del mismo tamano en benchmarks de razonamiento multimodal.

## Benchmarks y rendimiento

Resultados de precision (%) de la Tabla 1 del paper, con muestreo a temperatura 1.0. DAPO usa los mismos datos y receta de entrenamiento sin EVAN.

| Modelo | Geo3K | MathVista | MathVerse | We-Math | DynaMath | MathVision | MMK12 | MMMU-Pro | LogicVista | Media |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct | 36,1 | 63,9 | 38,6 | 46,6 | 56,1 | 18,6 | 43,4 | 25,9 | 42,8 | 41,3 |
| DAPO | 45,5 | 66,2 | **69,2** | 68,4 | 65,8 | 29,0 | 81,9 | 37,0 | 45,8 | 56,5 |
| **EVAN-7B** | **46,0** | **69,0** | 69,1 | **69,7** | **66,5** | **31,3** | **82,2** | **38,8** | **48,8** | **57,9** |

EVAN-7B supera al base en los nueve benchmarks y a DAPO en ocho de nueve (cede solo 0,1 puntos en MathVerse). La mejora media respecto al base es de 16,6 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,6 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB de VRAM para comodidad.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bfloat16; GPU consumer de 16 GB quedan al limite y requieren cuantizacion, no publicada en el repo.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bfloat16; en GPUs de 16 GB seria necesario cuantizar, pero el autor no publica variantes GGUF/AWQ/GPTQ.
- Opciones de despliegue: `transformers>=4.57` con `accelerate` y `torchvision` (metodo documentado); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. vLLM, llama.cpp y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el modo de razonamiento genera un monologo interno antes de la respuesta, lo que incrementa el numero de tokens generados y, por tanto, la latencia frente a una respuesta directa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en 9 benchmarks de razonamiento multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EVAN-7B | 8,3 B | no disponible | 57,9 % | Apache 2.0 | Hugging Face (DawnLiu/EVAN-7B) |
| Qwen2.5-VL-7B-Instruct | ~8 B (base) | no disponible en esta ficha | 41,3 % | Apache 2.0 | Hugging Face (Qwen/Qwen2.5-VL-7B-Instruct) |
| DAPO (misma receta sin EVAN) | 8,3 B | no disponible | 56,5 % | no disponible | no disponible como checkpoint publico en la informacion proporcionada |
| EVAN-3B | no disponible | no disponible | no disponible | Apache 2.0 (presumible, no confirmado) | Hugging Face (DawnLiu/EVAN-3B) |
| EVAN-8B | no disponible | no disponible | no disponible | Apache 2.0 (presumible, no confirmado) | Hugging Face (DawnLiu/EVAN-8B) |

La comparacion directa mas solida es con el modelo base y con la variante DAPO, ambas incluidas en el paper. No se dispone de datos de benchmarks frente a otros VLMs de 7B ajenos a la familia Qwen2.5-VL en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan analisis de sesgos en la informacion disponible; al derivar de Qwen2.5-VL-7B-Instruct, hereda los sesgos de su base y de los datos de entrenamiento.
- Riesgo de alucinacion: el propio metodo EVAN existe para reducir respuestas no ancladas en la imagen, lo que implica que el modelo base y las recetas RLVR convencionales presentan ese problema; EVAN lo mitiga pero no se garantiza su eliminacion.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Contexto: la longitud de contexto no se especifica en la ficha; conviene consultar la del modelo base antes de usarlo con imagenes de alta resolucion o conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen2.5-VL-7B-Instruct y de los datos ViRL39K.
- Advertencia de produccion: el modelo esta orientado a investigacion; su adopcion en produccion exige validacion propia, ya que los benchmarks publicados son de razonamiento multimodal academico y no cubren dominios industriales.
- El prompt de razonamiento (`<think>` y `\boxed{}`) debe anadirse tras la pregunta, tal como en entrenamiento; omitirlo puede degradar el rendimiento.
- Requiere `transformers>=4.57`; versiones anteriores pueden no cargar correctamente el modelo.
- Popularidad muy baja en el momento de la ficha (80 descargas, 0 likes), lo que limita la comunidad y el soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DawnLiu/EVAN-7B
- Paper (arXiv): https://arxiv.org/abs/2610.39237
- Codigo y scripts de entrenamiento: https://github.com/DawnLIU35/EVAN
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/TIGER-Lab/ViRL39K
- EVAN-3B: https://huggingface.co/DawnLiu/EVAN-3B
- EVAN-8B: https://huggingface.co/DawnLiu/EVAN-8B
- Licencia: https://huggingface.co/DawnLiu/EVAN-7B/blob/main/LICENSE
