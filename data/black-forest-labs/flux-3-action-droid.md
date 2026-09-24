# black-forest-labs/flux-3-action-droid

## Resumen

FLUX 3 Action DROID es un modelo de accion robotica (world action model, WAM) de pesos abiertos desarrollado por Black Forest Labs, distribuido a traves de LeRobot. Parte del modelo base black-forest-labs/flux-3-action-base y esta afinado sobre el conjunto de datos DROID para operar en montajes tipo Franka. Recibe fotogramas de tres camaras RGB, el estado del robot y una instruccion en lenguaje natural, y devuelve un chunk de 32 acciones absolutas de articulacion a 15 Hz, destiladas conjuntamente con los siguientes fotogramas de video.

Con 6.947.058.944 parametros (aproximadamente 7B) y un checkpoint DiT en BF16, el modelo ocupa una posicion poco habitual: no es un LLM ni un VLM de proposito general, sino un generador de comandos motores que ademas modela el futuro visual de la escena. El repositorio pesa 63,0 GB porque incluye varias recetas de optimizacion (base, destilada por guia, destilada por pasos) en BF16 y FP8r.

Su relevancia actual es doble. Por un lado, encabeza el benchmark RoboLab-120 con un 42,92% de exito en tarea, por delante de Cosmos3-Nano-Policy (36,8%, 16B) y de pi-0.5 (28,0%, 3,3B). Por otro, su licencia flux-kommunity-license impone restricciones de uso explicitas en entornos con personas, lo que condiciona cualquier despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con VAE y codificador de texto cargados desde el repositorio base; world action model que denoisa acciones y fotogramas futuros de forma conjunta |
| Parametros totales | 6.947.058.944 (aproximadamente 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible / no aplica (modelo de accion robotica, no acepta contexto de texto arbitrario) |
| Tipos de cuantizacion | BF16 (checkpoint DiT); variantes FP8r opt-in en subcarpetas; soporte de `--quantize fp8` en inferencia |
| Idiomas soportados | no disponible (acepta instruccion de texto; el idioma de entrenamiento no se especifica en la informacion disponible) |
| Licencia | flux-kommunity-license (license: other) |
| Formato de pesos | safetensors (BF16); configuracion LeRobot en config.json y configuracion nativa en config.native.json; lora.json es una receta de entrenamiento sin pesos de adaptador |
| Parametros de muestreo | 4 pasos de Cosmos UniPC, shift 5, video guidance 4, action guidance 1 |
| Contrato de observacion | `task`, `state` y tres camaras RGB: `images.wrist`, `images.left`, `images.right`; imagenes CHW 3x360x640 en float [0,1], compuestas en un lienzo de 544x736 |
| Contrato de accion | 7 posiciones articulares en radianes mas fraccion de cierre de pinza; salida de 32 acciones absolutas a 15 Hz; normalizacion identidad, inversion de pinza y escala de accion 2 aplicadas dentro del modelo |
| Modelo base | black-forest-labs/flux-3-action-base |
| Descargas y likes | 33 descargas, 13 likes (segun metadatos del repositorio) |
| Publicacion | 22 de septiembre de 2026; ultima actualizacion el 23 de septiembre de 2026 (segun metadatos del repositorio) |
| Tamano del repositorio | 63,0 GB |

## Arquitectura y entrenamiento

El nucleo es un DiT cuyos tensores estan en BF16. La generacion sigue un esquema de difusion con muestreo Cosmos UniPC en cuatro pasos y guia separada para video (4) y accion (1), de modo que el modelo denoisa simultaneamente el chunk de acciones y los fotogramas de video futuros. El VAE y el codificador de texto se cargan automaticamente desde el repositorio base fijado (flux-3-action-base), con soporte de subcarpeta y revision compartidas en el Hub mediante la integracion FLUX3. Este repositorio es un fine-tune sobre DROID del modelo base, no un entrenamiento desde cero.

Black Forest Labs distribuye tres recetas de optimizacion opt-in, cada una en BF16 y FP8r: la base (4 pasos con guia, en la raiz y en variants/fp8r), la destilada por guia (4 pasos, variants/gd y variants/gd-fp8r) y la destilada por pasos (1 paso, variants/sd y variants/sd-fp8r). La carga por defecto de LeRobot no descarga ninguna de estas variantes. Los paquetes BF16 incluyen ademas configuraciones de LeRobot, mientras que los paquetes nativos FP8r requieren FLUX Action. Se incluye un lora.json que define una receta de task-LoRA de LeRobot, pero no contiene pesos de adaptador. No se detalla en la informacion disponible el numero de tokens, la composicion del dataset de entrenamiento ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de comandos motores: produce chunks de 32 acciones absolutas de articulacion a 15 Hz a partir de observaciones visuales y de estado.
- Modelado de mundo: predice, junto con las acciones, los fotogramas de video siguientes de la escena sobre la que actua.
- Condicionamiento por lenguaje natural: acepta una instruccion de tarea (`task`) que guia el comportamiento.
- Entrada multi-camara: consume tres vistas RGB (muneca y dos exteriores) compuestas en un lienzo de 544x736.
- Entrada de estado proprioceptivo: 7 posiciones articulares en radianes mas la fraccion de cierre de la pinza.
- Control de pinza: salida de fraccion de cierre entre 0 (abierta) y 1 (cerrada), con inversion aplicada internamente.
- Ajuste fino sobre datos propios: la receta task-LoRA incluida permite adaptar el modelo a nuevas tareas.
- Variantes destiladas: ejecucion en 4 pasos o en 1 solo paso segun la receta elegida.
- No soporta tool calling, function calling, agentes multi-paso ni dialogo multi-turno: no genera texto.
- No se documentan capacidades de vision general (VQA, OCR, captioning), audio ni modo de razonamiento explicito.

## Casos de uso

- Manipulacion de escritorio sobre Franka: el modelo esta afinado en DROID y validado en un montaje Franka de estilo DROID con tres camaras, por lo que se puede desplegar directamente para tareas tabletop con instruccion textual.
- Automatizacion de pick-and-place en laboratorio: con 32 acciones por chunk a 15 Hz, permite ejecutar secuencias de agarre y colocacion sin reentrenamiento y con latencia de control razonable.
- Investigacion en world models: como predice fotogramas futuros ademas de acciones, sirve para estudiar planificacion y representaciones visuales en entornos controlados con Isaac Sim.
- Evaluacion comparativa de politicas: utilizar la politica como referencia contra otros WAM o VLA en tareas de RoboLab-120 o en suites propias, aprovechando que el checkpoint BF16 esta validado para DROID.
- Adaptacion a tareas especificas mediante task-LoRA: la receta lora.json permite ajustar el modelo a nuevas instrucciones o utillajes con coste de entrenamiento reducido, partiendo de un modelo ya competente en manipulacion.
- Despliegue en estaciones de trabajo de 24 GB: con `--quantize fp8 --offload-text-encoder` el modelo cabe en GPUs de 24 GB, lo que habilita prototipos en laboratorio sin acceso a H200.
- Generacion de datos sinteticos y aumentacion: los fotogramas futuros predichos pueden emplearse como material de aumento para entrenar otras politicas o para inspeccion visual de trayectorias antes de ejecutarlas.
- Validacion de seguridad previa a hardware real: ejecutar la politica en simulador con el arm safety limits activado para verificar trayectorias antes de habilitar el brazo fisico.

## Benchmarks y rendimiento

RoboLab-120 consta de 120 tareas tabletop en Isaac Sim, con 10 ensayos por tarea sobre un montaje Franka de estilo DROID; un ensayo solo cuenta como exito si la tarea se completa tal y como se ha instruido. El tablero completo esta en el leaderboard de RoboLab.

| Modelo | Tipo | Exito en RoboLab-120 | Parametros |
|---|---|---|---|
| FLUX 3 Action | WAM | 42,92% | 7B |
| Cosmos3-Nano-Policy | WAM | 36,8% | 16B |
| pi-0.5 | VLA | 28,0% | 3,3B |

WAM: predice fotogramas futuros y acciones de forma conjunta. VLA: modelo de vision-lenguaje que emite acciones directamente. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, dado que el modelo no genera texto.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 32 GB en una NVIDIA H200, segun el autor.
- VRAM en cuantizacion FP8: con `--quantize fp8 --offload-text-encoder` el modelo cabe en tarjetas de 24 GB.
- GPU recomendadas: NVIDIA H200 para BF16; cualquier GPU de 24 GB o mas para el modo FP8 con descarga del codificador de texto. No se especifican modelos concretos adicionales.
- GPU de consumo: cabe en tarjetas consumer de 24 GB (por ejemplo, RTX 4090) solo en modo FP8 con offload; en BF16 no cabe en GPUs consumer habituales.
- Entorno validado: Python 3.12, CUDA 12.8, torch 2.10.0 y transformers 5.16.1.
- Opciones de despliegue: LeRobot mediante Flux3Policy y make_pre_post_processors, y el paquete standalone FLUX Action (flux-action), que soporta los seis paquetes de variantes. Los paquetes nativos FP8r requieren FLUX Action.
- Compatibilidad de configuracion: LeRobot lee config.json; FLUX Action lee config.native.json cuando existe y, en caso contrario, config.json. El cargador standalone debe soportar ese nombre de configuracion nativa.
- Latencia y throughput: no disponibles. Se conocen los parametros de muestreo (4 pasos de Cosmos UniPC, shift 5, guia de video 4, guia de accion 1) y la frecuencia de salida de 15 Hz con 32 acciones por chunk, pero no se publican cifras de latencia ni de throughput.
- vLLM, llama.cpp, Ollama y TGI no aparecen como opciones soportadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Exito en RoboLab-120 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Action DROID | WAM (acciones y fotogramas futuros) | 7B | 42,92% | flux-kommunity-license | Pesos abiertos en HuggingFace, via LeRobot |
| Cosmos3-Nano-Policy | WAM | 16B | 36,8% | no disponible | no disponible |
| pi-0.5 | VLA (acciones directas desde vision-lenguaje) | 3,3B | 28,0% | no disponible | no disponible |

La comparacion se limita a la categoria de politica robotica evaluada en RoboLab-120. No se dispone de datos de contexto, licencia ni canales de distribucion de las dos alternativas en la informacion proporcionada. Destaca que FLUX 3 Action alcanza el mejor resultado con menos de la mitad de parametros que Cosmos3-Nano-Policy.

## Limitaciones y advertencias

- Ausencia de limites fisicos: nada en el modelo acota la velocidad articular, la fuerza ni el espacio de trabajo. La aplicacion debe imponer esos limites y mantener un boton de parada de hardware al alcance.
- Riesgo en presencia de personas: la licencia prohibe controlar una maquina de forma que ponga en peligro a personas sin supervision humana y sin un medio de detencion.
- Alucinacion de acciones y de video: como modelo generativo, puede producir comandos plausibles pero incorrectos y fotogramas futuros que no se correspondan con la escena real; no debe interpretarse la prediccion visual como una medicion.
- Validacion limitada: las cifras de exito proceden de simulacion (Isaac Sim) sobre tareas tabletop y un montaje Franka de estilo DROID; no se documenta la transferencia a hardware real ni a otras morfologias.
- Contrato de observacion rigido: exige tres camaras con nombres y resolucion concretos (CHW 3x360x640 en [0,1], lienzo 544x736) y un estado de 7 articulaciones mas pinza; desviarse de ese formato requiere adaptacion.
- Restricciones de licencia: la flux-kommunity-license prohibe usos ilegales, el control peligroso de maquinas sin supervision, la toma de decisiones totalmente automatizadas o de alto riesgo que afecten a derechos legales o creen obligaciones vinculantes, el acoso y la explotacion de menores. Conviene revisar LICENSE.md antes de cualquier uso comercial.
- Idiomas: no se especifica que idiomas acepta la instruccion de texto ni como se comporta con instrucciones fuera del idioma de entrenamiento.
- Dependencia de infraestructura: el modo BF16 requiere alrededor de 32 GB de VRAM; el modo que cabe en 24 GB exige cuantizacion FP8 y descarga del codificador de texto, con la perdida de precision que ello implica.
- Componentes externos fijados: el VAE y el codificador de texto se cargan desde el repositorio base, por lo que la disponibilidad de ese repositorio es un requisito operativo.
- El repositorio incluye varias recetas de optimizacion; usar la variante equivocada (por ejemplo, la destilada a 1 paso cuando se espera calidad de 4 pasos) cambia el comportamiento sin aviso explicito en la carga por defecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/black-forest-labs/flux-3-action-droid
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Coleccion FLUX 3 Action: https://huggingface.co/collections/black-forest-labs/flux-3-action-6ab25aef555dd30ab86567f8
- Vision general de FLUX 3 Action: https://docs.bfl.ai/flux_3/flux3_action_overview
- Guia de inferencia: https://docs.bfl.ai/flux_3/flux3_action_inference
- Guia de ajuste fino: https://docs.bfl.ai/flux_3/flux3_action_finetuning
- Repositorio flux-action en GitHub: https://github.com/black-forest-labs/flux-action
- Pull request del exportador standalone: https://github.com/black-forest-labs/flux-action/pull/3
- Dataset DROID: https://droid-dataset.github.io/
- Leaderboard de RoboLab: https://research.nvidia.com/labs/srl/projects/robolab/leaderboard.html
- Demo en video: https://huggingface.co/black-forest-labs/flux-3-action-droid/resolve/main/assets/flux-3-action-demo.mp4
- Las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo.
