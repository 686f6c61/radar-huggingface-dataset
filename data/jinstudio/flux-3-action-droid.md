# Jinstudio/flux-3-action-droid

## Resumen

FLUX 3 Action DROID es un modelo de acción y mundo ("world action model", WAM) de pesos abiertos con 6.947.058.944 parámetros (etiquetado como 7B por el autor) desarrollado por Black Forest Labs. La ficha analizada, `Jinstudio/flux-3-action-droid`, es un espejo sin gating del repositorio oficial `black-forest-labs/flux-3-action-droid`, publicado por un tercero y sin descargas ni valoraciones en el momento de la consulta. El modelo parte del checkpoint base `black-forest-labs/flux-3-action-base` y está afinado sobre el dataset robótico DROID.

A diferencia de un VLA clásico, que emite acciones directamente desde un modelo visión-lenguaje, FLUX 3 Action predice de forma conjunta los fotogramas de vídeo futuros y el bloque de acciones siguiente. La entrada es una instrucción de texto, el estado del robot (siete posiciones articulares en radianes más la fracción de cierre de la pinza) y tres cámaras RGB (muñeca, izquierda y derecha); la salida son comandos articulares absolutos más la fracción de cierre de la pinza, en bloques de 32 acciones a 15 Hz.

Su relevancia actual radica en el resultado declarado en el benchmark RoboLab-120 (120 tareas de sobremesa en Isaac Sim sobre una Franka estilo DROID), donde alcanza un 42,92 % de éxito con 7B de parámetros, por delante de Cosmos3-Nano-Policy (36,8 %, 16B) y de π0.5 (28,0 %, 3,3B). El modelo se distribuye bajo la FLUX Kommunity License, con restricción de uso comercial y requisitos explícitos de supervisión humana en aplicaciones de control de maquinaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de tipo world action model (WAM); muestreo con Cosmos UniPC |
| Parametros totales | 6.947.058.944 (~6,95B; el autor lo comercializa como 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (checkpoint DiT nativo) y FP8r (variantes con cuantizacion de rango flotante) |
| Idiomas soportados | No disponible (las instrucciones de tarea se suministran como texto; no se documenta cobertura multilingue) |
| Licencia | FLUX Kommunity License (`license: other`, `license_name: flux-kommunity-license`), uso no comercial |
| Formato de pesos | safetensors (libreria declarada: lerobot) |

Otros datos operativos: tamano del repositorio 63,0 GB; pipeline declarado `robotics`; fecha de creacion y ultima actualizacion 2026-10-16; descargas 0; likes 0.

## Arquitectura y entrenamiento

FLUX 3 Action es un modelo de difusion con backbone transformer (DiT) que descompone el problema en dos modalidades acopladas: genera los fotogramas de video futuros y el bloque de acciones dentro del mismo proceso de denoising. El muestreo recomendado por el autor es de cuatro pasos de Cosmos UniPC con `shift` 5, `video guidance` 4 y `action guidance` 1. El checkpoint contiene tensores en BF16, y el repositorio ofrece seis paquetes de pesos segun el compromiso entre calidad y coste de inferencia: base con 4 pasos y guidance (`root`), destilado por guidance con 4 pasos (`variants/gd`), destilado por pasos con 1 paso (`variants/sd`) y las versiones FP8r de cada uno (`variants/fp8r`, `variants/gd-fp8r`, `variants/sd-fp8r`).

El modelo esta afinado sobre DROID, un dataset de manipulacion robotica a gran escala. No se especifica en la informacion disponible el numero de tokens, la composicion exacta del dataset de entrenamiento ni si se aplicaron etapas de RLHF o DPO (no aplicables de forma estandar en este dominio). La innovacion destacable es el enfoque WAM frente al enfoque VLA: la prediccion conjunta de video y acciones aporta una senal de supervision densa sobre la dinamica del entorno, lo que el autor situa por delante de las politicas VLA de escala comparable en la tabla de RoboLab-120.

El contrato de observacion y accion es estricto: las imagenes llegan como flotantes CHW 3x360x640 en el rango [0,1], compuestas en un lienzo de 544x736; el estado incluye siete posiciones articulares en radianes y la fraccion de cierre de la pinza; las acciones son comandos articulares absolutos seguidos de la fraccion de cierre (0 abierto, 1 cerrado), con 32 acciones a 15 Hz, normalizacion identidad, inversion de pinza y escala de accion 2 aplicadas dentro del propio modelo. El texto se codifica automaticamente desde el repositorio base fijado, junto con el VAE.

## Capacidades

- Generacion de acciones roboticas: produce bloques de 32 comandos articulares absolutos a 15 Hz, es decir, aproximadamente 2,13 segundos de trayectoria por inferencia.
- Prediccion de video futuro: genera de forma conjunta los fotogramas siguientes a la observacion actual, lo que permite visualizar rollouts antes de ejecutarlos.
- Condicionamiento por instruccion en lenguaje natural: la tarea se suministra como texto (`task`) y el modelo la sigue durante la generacion.
- Fusion multimodal de tres camaras: consume vistas de muneco, lateral izquierda y lateral derecha, mapeadas al contrato original de LeRobot (`observation.images.wrist_image_left`, `observation.images.exterior_image_1_left`, `observation.images.exterior_image_2_left`).
- Entrada de propriocepcion: integra estado articular de siete grados de libertad y estado de pinza.
- Control de pinza: salida explicita de fraccion de cierre entre 0 y 1.
- Integracion con LeRobot: `Flux3Policy` y `make_pre_post_processors`, con soporte de subcarpetas y revisiones de Hub mediante la integracion FLUX3.
- Variantes de inferencia acelerada: recetas destiladas por guidance y por pasos, incluida una de un solo paso.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso simbolico, audio, vision general de imagenes o dialogo multilingue; se trata de un modelo de politica robotica, no de un asistente de proposito general.

## Casos de uso

- Manipulacion de sobremesa con Franka: el modelo esta afinado sobre DROID, que emplea una configuracion Franka, y sus salidas son comandos articulares absolutos directamente aplicables a ese brazo, con un bloque de 32 acciones por inferencia que reduce la frecuencia de consulta al modelo.
- Fine-tuning con demostraciones propias: el repositorio incluye una receta de entrenamiento de LoRA de tarea para LeRobot (`lora.json`) y documentacion especifica de fine-tuning, lo que permite adaptar la politica a una celda de trabajo concreta sin reentrenar desde cero.
- Investigacion en world models y sim-to-real: al predecir fotogramas futuros junto con las acciones, sirve para estudiar la coherencia entre la dinamica imaginada y la ejecucion real, y para comparar rollouts en simulador antes de desplegar en hardware.
- Evaluacion comparativa de politicas roboticas: la metrica RoboLab-120 (120 tareas, 10 ensayos cada una, exito solo si la tarea se completa segun la instruccion) ofrece un protocolo reproducible frente a otras politicas de la misma categoria.
- Automatizacion de pick-and-place y clasificacion de objetos: con instrucciones textuales y tres vistas de camara, el modelo puede gestionar tareas de recogida y colocacion en entornos de laboratorio o lineas piloto.
- Despliegue en estaciones de trabajo con GPU de 24 GB: la combinacion `--quantize fp8 --offload-text-encoder` permite ejecutar el modelo en tarjetas de gama alta de consumo o profesional, habilitando prototipos fuera de clusters.
- Generacion de datos sinteticos de trayectoria: los fotogramas predichos y los bloques de accion pueden emplearse para aumentar datasets de imitacion o para preentrenar controladores auxiliares.
- Validacion previa a produccion: la prediccion de video permite inspeccionar visualmente cual sera el resultado esperado antes de enviar comandos al robot, util en revisiones de seguridad y en depuracion de politicas.

## Benchmarks y rendimiento

| Modelo | Tipo | Exito en RoboLab-120 | Parametros |
|---|---|---|---|
| FLUX 3 Action | WAM | 42,92 % | 7B |
| Cosmos3-Nano-Policy | WAM | 36,8 % | 16B |
| π0.5 | VLA | 28,0 % | 3,3B |

RoboLab-120 consta de 120 tareas de sobremesa en Isaac Sim, con 10 ensayos por tarea sobre una configuracion Franka estilo DROID; un ensayo se considera exitoso solo si la tarea se completa tal y como se instruye. La tabla completa esta publicada en el leaderboard de RoboLab. No se han facilitado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje en la informacion disponible, y no procede extrapolarlos a un modelo de politica robotica.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 32 GB en una NVIDIA H200, segun el autor.
- VRAM con optimizacion: con `--quantize fp8 --offload-text-encoder` el modelo cabe en tarjetas de 24 GB.
- GPU recomendadas: H200 para la configuracion BF16 de referencia; para la configuracion cuantizada en FP8, tarjetas de 24 GB como la RTX 4090, L4 o A10G son suficientes en cuanto a memoria, aunque el rendimiento real no esta documentado.
- Almacenamiento: el repositorio ocupa 63,0 GB, por lo que conviene prever espacio en disco y, si solo se usa una variante, descargar unicamente la subcarpeta correspondiente.
- Opciones de despliegue: LeRobot (`Flux3Policy`), integracion FLUX3 con soporte de subcarpetas y revisiones, y el exportador independiente de FLUX Action, que requiere soportar el fichero de configuracion nativo `config.native.json` (los paquetes FP8r nativos requieren FLUX Action; los BF16 incluyen configuraciones de LeRobot).
- Entorno validado: Python 3.12, CUDA 12.8, torch 2.10.0 y transformers 5.16.1.
- Latencia y throughput: no disponibles. Como referencia operativa, la politica emite 32 acciones a 15 Hz, lo que equivale a unos 2,13 segundos de trayectoria por bloque generado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Exito en RoboLab-120 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Action DROID | WAM | 7B | 42,92 % | FLUX Kommunity License (no comercial) | Pesos abiertos en HuggingFace, codigo en GitHub |
| Cosmos3-Nano-Policy | WAM | 16B | 36,8 % | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| π0.5 | VLA | 3,3B | 28,0 % | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

La comparacion se limita al benchmark RoboLab-120 y al recuento de parametros, ya que la informacion disponible no incluye contexto, licencia ni requisitos de hardware de los dos modelos alternativos.

## Limitaciones y advertencias

- Las salidas son objetivos articulares: nada en el modelo acota la velocidad, la fuerza ni el espacio de trabajo. La aplicacion debe imponer esos limites y mantener un paro de hardware accesible.
- Riesgo fisico: el autor exige validar en simulador o con los limites de seguridad del brazo activados antes de operar cerca de personas.
- Uso no comercial: la FLUX Kommunity License restringe el uso comercial; el espejo analizado incluye `LICENSE.md` y `NOTICE.md`, y cualquier derecho de uso lo concede directamente Black Forest Labs.
- Usos fuera de alcance declarados por el autor: vulnerar la legislacion aplicable; controlar una maquina de forma que ponga en peligro a personas sin supervision humana ni medio de parada; toma de decisiones totalmente automatizada o aplicaciones de alto riesgo que afecten a derechos legales o generen obligaciones vinculantes. La lista completa aparece truncada en el material disponible.
- Este repositorio es un espejo no oficial: no es una publicacion de Black Forest Labs y no debe citarse como fuente primaria.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al estar afinado sobre DROID, el comportamiento esta condicionado por la distribucion de tareas, objetos, iluminacion y configuracion de camaras de ese dataset.
- Riesgo de alucinacion o de prediccion incoherente: no se documenta, pero en modelos de difusion aplicados a control existe el riesgo de generar trayectorias o fotogramas futuros plausibles pero fisicamente invalidos.
- Idiomas: no se especifica soporte multilingue; las instrucciones se han de tratar como texto corto de tarea, presumiblemente en ingles.
- Longitud de contexto: no disponible, lo que impide planificar tareas de horizonte largo sobre una sola ventana.
- Reproducibilidad: no se documenta el numero de tokens de entrenamiento ni la composicion del dataset, lo que limita la auditoria del modelo.
- Los checkpoints de optimizacion son opcionales y deben descargarse explicitamente; la carga por defecto de LeRobot no trae ningun peso de variante.
- Advertencia de integracion: LeRobot lee `config.json` y FLUX Action lee `config.native.json` cuando esta presente; el cargador de exportacion independiente debe soportar ese nombre de fichero nativo.

## Enlaces

- Espejo analizado: https://huggingface.co/Jinstudio/flux-3-action-droid
- Repositorio original: https://huggingface.co/black-forest-labs/flux-3-action-droid
- Repositorio base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Coleccion FLUX 3 Action: https://huggingface.co/collections/black-forest-labs/flux-3-action-6ab25aef555dd30ab86567f8
- Documentacion general: https://docs.bfl.ai/flux_3/flux3_action_overview
- Guia de ejecucion: https://docs.bfl.ai/flux_3/flux3_action_inference
- Guia de fine-tuning: https://docs.bfl.ai/flux_3/flux3_action_finetuning
- Codigo de entrenamiento e inferencia: https://github.com/black-forest-labs/flux-action
- Pull request del exportador independiente: https://github.com/black-forest-labs/flux-action/pull/3
- Dataset DROID: https://droid-dataset.github.io/
- Leaderboard de RoboLab: https://research.nvidia.com/labs/srl/projects/robolab/leaderboard.html
- Demo en video: https://huggingface.co/black-forest-labs/flux-3-action-droid/resolve/main/assets/flux-3-action-demo.mp4
- Licencia y aviso legal: `LICENSE.md` y `NOTICE.md` dentro del repositorio

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces obtenidos pertenecian a un sitio de compraventa de segunda mano sin relacion con el tema, por lo que se han descartado.
