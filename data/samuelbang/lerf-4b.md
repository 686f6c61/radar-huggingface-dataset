# SamuelBang/LeRF-4B

## Resumen

LeRF-4B es un modelo vision-language (VLM) de 4,54 mil millones de parametros desarrollado por SamuelBang (Bang Xiao y colaboradores de la University of Illinois Urbana-Champaign, Shanghai Jiao Tong University, UC Merced y Amazon AGI) y publicado en HuggingFace bajo licencia Apache 2.0. Se construye mediante fine-tuning sobre el modelo base Qwen/Qwen3.5-4B y esta especializado en una tarea muy concreta: la toma de perspectiva espacial, es decir, responder preguntas sobre relaciones espaciales desde el punto de vista de otra entidad o de un observador imaginado, en lugar de hacerlo desde el punto de vista de la camara.

El problema que aborda es conocido: los VLM tienden a responder con la referencia de la camara incluso cuando la pregunta exige adoptar otra referencia. La innovacion de LeRF es entrenar al modelo para que construya y utilice un sistema de referencia explicito centrado en una entidad (*reference frame*). Dado una imagen y una pregunta de eleccion multiple, el modelo decide primero si necesita un marco de referencia; si lo necesita, invoca la herramienta `draw_reference_frame` y predice el origen proyectado y los ejes frontal, izquierdo y superior en coordenadas normalizadas. Un renderizador ligero dibuja ese marco sobre la imagen y, en un segundo turno, el modelo razona sobre la imagen anotada y emite la respuesta.

Su relevancia actual radica en que consigue resultados competitivos en tareas de razonamiento espacial y toma de perspectiva con solo 4,54 B de parametros, superando a modelos abiertos mayores en varios conjuntos de evaluacion (OmniSpatial-PT, 3DSRBench, ViewSpatial-Bench), sin recurrir a modelos externos de percepcion ni a reconstruccion 3D. El modelo esta pensado para usarse junto con un cliente de dos turnos y una herramienta de renderizado externas, no como un VLM generico de un solo paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model derivado de Qwen/Qwen3.5-4B; la configuracion interna no se detalla en la informacion disponible |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 32.768 tokens en la configuracion de despliegue documentada (`--max-model-len 32768`); la longitud nativa del modelo base no se especifica. Presupuesto de razonamiento recomendado: 10.240 tokens dentro de un turno de respuesta de 12.288 tokens |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 9,1 GB) |

## Arquitectura y entrenamiento

LeRF-4B es un ajuste fino del VLM Qwen3.5-4B, por lo que hereda su arquitectura multimodal (encoder visual mas decoder de lenguaje). Sobre esa base, el entrenamiento se organiza en dos etapas. La etapa I es un SFT con LoRA gestionado mediante LLaMA-Factory, en el que el modelo aprende a localizar la entidad de referencia y a predecir el marco proyectado (origen y ejes) a partir de conjuntos de datos de pose: ImageNet3D, Omni6DPose-SOPE y BEDLAM. Aproximadamente el 20 % de los datos de esta etapa son ejemplos sin llamada a herramienta, con el objetivo de ensenar un uso selectivo de la misma.

La etapa II es un entrenamiento por refuerzo con GRPO implementado con verl, realizado sobre los conjuntos MultihopSpatial y SpatialReasoner-RL con una recompensa binaria basada en la respuesta final. Un detalle tecnico relevante es que el turno de prediccion del marco queda excluido del gradiente de politica, de modo que solo el turno de razonamiento y respuesta recibe la ventaja. La inferencia es de dos turnos: en el primero, con el modo thinking desactivado, el modelo emite o bien una unica llamada `draw_reference_frame` (con `reference_object` en texto y los puntos `origin`, `axis_front`, `axis_left` y `axis_up` como coordenadas `[x, y]` normalizadas en `[0, 1000]`), o bien la cadena literal `NO_TOOL_CALL`; un renderizador dibuja el marco sobre la imagen (rojo = frontal, verde = izquierdo, azul = superior, con marcador de profundidad `⊙`/`⊗` cuando un eje esta muy escorzado) y, en el segundo turno, con thinking activado, el modelo razona sobre la imagen renderizada y responde dentro de `\boxed{}`. El modelo no ve las coordenadas numericas en el segundo turno, solo la imagen anotada.

## Capacidades

- Razonamiento espacial y toma de perspectiva: responde preguntas de eleccion multiple sobre relaciones espaciales adoptando el punto de vista de otra persona u observador imaginado (categorias ego, alocentrica e hipotetica).
- Construccion explicita de sistemas de referencia centrados en entidades: predice el origen proyectado y los ejes frontal, izquierdo y superior en coordenadas normalizadas `[0, 1000]`.
- Uso selectivo de herramientas (*tool calling*): decide entre invocar `draw_reference_frame` o devolver `NO_TOOL_CALL` cuando la pregunta puede responderse desde la vista de la camara.
- Razonamiento en dos turnos con modo thinking: turno 1 sin thinking para la decision de herramienta, turno 2 con thinking para el razonamiento y la respuesta final.
- Comprension de imagen anotada: interpreta la imagen con el marco de referencia renderizado encima como senal visual para el razonamiento.
- Formato de salida estructurado: respuesta final delimitada en `\boxed{}`.
- Entrada multimodal: imagen mas pregunta espacial de eleccion multiple, con soporte de hasta dos imagenes por prompt en la configuracion de vLLM documentada (`--limit-mm-per-prompt '{"image": 2}'`).
- Multilingue: solo ingles.
- No se documentan capacidades de audio, video, generacion de imagen ni codigo.

## Casos de uso

- Robótica e interaccion con entornos fisicos: el modelo puede responder a ordenes del tipo "que objeto esta a la izquierda del operador" traduciendo la instruccion a un sistema de referencia de la entidad relevante, lo que resulta util para interfaces humano-robot que deben razonar en el marco del usuario y no en el de la camara.
- Asistencia a personas con discapacidad visual: descripcion de escenas que exige adopcion de perspectiva ("que hay delante de la persona que sostiene la bandeja"), aprovechando el marco de referencia centrado en entidad y la salida en eleccion multiple.
- Analisis de imagenes de vigilancia o deporte: interpretacion de relaciones espaciales entre multiples sujetos desde el punto de vista de uno de ellos, escenario donde los VLM genericos suelen recaer en la vista de camara.
- Evaluacion y auditoria de modelos de razonamiento espacial: LeRF-4B sirve como referencia abierta de 4,54 B para comparar con modelos mayores en OmniSpatial-PT, 3DSRBench y ViewSpatial-Bench, y para estudiar el efecto de la construccion explicita de marcos de referencia.
- Investigacion en razonamiento multimodal con herramientas: el esquema de dos turnos con `draw_reference_frame` es reutilizable como plantilla para pipelines en los que el modelo invoca una herramienta de anotacion visual y luego razona sobre el resultado, con el patron de entrenamiento GRPO excluyendo el turno de prediccion del gradiente.
- Generacion de datos anotados de pose y referencia: las predicciones de origen y ejes pueden usarse para producir marcos de referencia sobre imagenes propias, utiles como preanotacion en conjuntos de datos espaciales.
- Asistente para navegacion en interiores con camaras fijas: dado un fotograma y una pregunta sobre hacia donde debe girar una persona para alcanzar un objeto, el modelo puede razonar en el sistema de referencia del usuario en lugar de en el de la camara.

## Benchmarks y rendimiento

Resultados de precision (%) en OmniSpatial perspectiva (Ego / Allo / Hypo), 3DSRBench (Orientation / Multi-Object) y ViewSpatial-Bench (person-perspective Object View Orientation / Relative Direction). La negrita marca el mejor resultado abierto segun el autor de la model card.

| Metodo | Ego | Allo | Hypo | 3DSR Ori | 3DSR M-Obj | VS P-Obj | VS P-Rel |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| *Propietarios* | | | | | | | |
| GPT-5.6-Luna (medium) | 83,33 | 49,73 | 45,78 | 60,04 | 55,34 | 46,99 | 70,07 |
| GPT-5.6-Terra (medium) | 81,37 | 55,85 | 53,01 | 63,32 | 56,39 | 45,08 | 77,20 |
| Claude Sonnet 5 (medium) | 80,39 | 42,55 | 49,40 | 34,94 | 44,77 | 51,31 | 51,43 |
| Claude Sonnet 5 (high) | 84,31 | 48,14 | 45,78 | 43,15 | 46,81 | 51,51 | 60,10 |
| *Abiertos* | | | | | | | |
| Qwen3.5-4B | 74,71 | 42,55 | 44,34 | 42,28 | 43,26 | 51,01 | 57,43 |
| Qwen3.5-9B | **80,20** | 47,13 | 44,58 | 48,17 | 48,66 | 56,23 | 65,51 |
| Qwen3.5-9B + APC | 42,16 | 27,66 | 30,12 | 44,98 | 33,22 | 59,34 | 37,53 |
| SpatialReasoner | 40,39 | 35,11 | 35,66 | 52,05 | **50,64** | 42,37 | 45,61 |
| *Este trabajo* | | | | | | | |
| LeRF-4B (este modelo) | 72,35 | 49,36 | 46,75 | 45,88 | 44,55 | 56,26 | 67,85 |
| LeRF-9B | 74,31 | **54,04** | **55,66** | **53,76** | 50,29 | **61,91** | **74,23** |

El autor remite al paper para mas baselines, precision de estimacion del marco de referencia y ablaciones. No se han publicado resultados de latencia ni de throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, 4,54 B, y del tamano del repositorio, 9,1 GB, que corresponde a pesos en bf16/fp16): aproximadamente 10-12 GB en bf16 contando pesos, encoder visual, activaciones y cache KV; alrededor de 6-7 GB en cuantizacion de 8 bits y unos 4-5 GB en 4 bits, si bien no se publican checkpoints cuantizados.
- GPU recomendadas: A100, H100 y L40S para despliegue en servidor con vLLM; RTX 4090 (24 GB) permite inferencia en bf16 con margen.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 16 GB en bf16 con lotes pequenos; en GPUs de 12 GB (RTX 3060, RTX 4070) requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: vLLM con API compatible con OpenAI es el unico camino documentado, incluyendo `--served-model-name lerf --max-model-len 32768 --limit-mm-per-prompt '{"image": 2}' --trust-remote-code`. No se documentan soporte en llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Requiere ademas el cliente de dos turnos y el renderizador del repositorio GitHub, mas el system prompt y el esquema de herramienta en `tool/system_prompt.txt` y `tool/prompts.py`.
- Entorno probado por el autor: Python 3.12, CUDA 13.0, PyTorch 2.11, vLLM 0.24.0 y transformers 5.10.4.
- Ajustes de inferencia recomendados: temperatura 0,6, imagenes reescaladas a un maximo de 1 megapixel y presupuesto de thinking de 10.240 tokens dentro de un turno de respuesta de 12.288 tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Ego | Allo | Hypo | 3DSR Ori |
|---|---|---|---|---|---|---|---|
| LeRF-4B | 4,54 B | 32.768 tokens en el despliegue documentado | Apache 2.0 | 72,35 | 49,36 | 46,75 | 45,88 |
| LeRF-9B | no disponible | no disponible | no disponible en la informacion | 74,31 | 54,04 | 55,66 | 53,76 |
| Qwen3.5-4B (base) | ~4 B (nominal) | no disponible | no disponible en la informacion | 74,71 | 42,55 | 44,34 | 42,28 |
| Qwen3.5-9B | ~9 B (nominal) | no disponible | no disponible en la informacion | 80,20 | 47,13 | 44,58 | 48,17 |
| SpatialReasoner | no disponible | no disponible | no disponible en la informacion | 40,39 | 35,11 | 35,66 | 52,05 |

Frente a su modelo base Qwen3.5-4B, LeRF-4B mejora de forma clara en las categorias alocentrica (49,36 frente a 42,55), hipotetica (46,75 frente a 44,34), 3DSR Orientation (45,88 frente a 42,28) y ViewSpatial-Bench (56,26 frente a 51,01 en P-Obj y 67,85 frente a 57,43 en P-Rel), pero cede en la categoria ego (72,35 frente a 74,71), coherente con que el modelo esta especializado en desplazar el punto de vista fuera de la camara. La variante LeRF-9B rinde mejor en casi todas las columnas, a costa de un tamano mayor. Los datos de licencia y contexto de las alternativas no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo muy especializado: solo responde preguntas de eleccion multiple sobre relaciones espaciales; no es un asistente de proposito general ni un modelo de chat.
- Salida condicionada al formato: turno 1 con `draw_reference_frame` o `NO_TOOL_CALL`, turno 2 con razonamiento y respuesta en `\boxed{}`. No se documenta un modo de conversacion abierta.
- Dependencia de infraestructura externa: el modelo no funciona de forma autonoma, necesita el cliente de dos turnos y el renderizador del repositorio GitHub, ademas del system prompt y el esquema de herramienta correctos.
- Solo ingles: no hay soporte multilingue declarado.
- Riesgo de alucinacion en la prediccion del marco de referencia: si el origen o los ejes se estiman de forma incorrecta, el razonamiento del segundo turno parte de una senal visual erronea. No se publican en la informacion disponible cifras de precision de estimacion del marco (el autor remite al paper).
- Uso selectivo de herramienta no garantizado: la decision `NO_TOOL_CALL` frente a invocacion puede fallar; solo el 20 % de los datos de SFT ensenan este comportamiento.
- No se publican evaluaciones de sesgo, robustez ni comportamiento en dominios fuera de los conjuntos de pose y razonamiento espacial empleados en el entrenamiento.
- No se documentan cuantizaciones oficiales, por lo que el despliegue en hardware limitado depende de conversiones no verificadas por el autor.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio del modelo; conviene revisarlo antes de desplegarlo en produccion.
- La licencia del modelo es Apache 2.0, lo que permite uso comercial, pero la informacion disponible no detalla las condiciones de la licencia del modelo base Qwen3.5-4B ni de los conjuntos de datos de entrenamiento (ImageNet3D, Omni6DPose-SOPE, BEDLAM, MultihopSpatial, SpatialReasoner-RL), que conviene verificar de forma independiente antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe aun validacion comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SamuelBang/LeRF-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante de 9B: https://huggingface.co/SamuelBang/LeRF-9B
- Coleccion LeRF en HuggingFace: https://huggingface.co/collections/SamuelBang/lerf
- Pagina del proyecto: https://lerf-project.github.io/
- Codigo y cliente de inferencia: https://github.com/bangx7/LeRF
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
