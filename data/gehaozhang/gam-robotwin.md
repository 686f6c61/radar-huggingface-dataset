# gehaozhang/gam-robotwin

## Resumen

GAM-RoboTwin es el paquete de pesos y artefactos de evaluacion del modelo GAM (Grounded Action Model), desarrollado por el autor gehaozhang y publicado en HuggingFace. GAM aborda la manipulacion robotica bimanual condicionada por lenguaje: un detector 3D de vocabulario abierto (WildDet3D) localiza los objetos nombrados en la instruccion y los convierte en cajas 3D, nubes de puntos y tokens de imagen; despues, un transformer de flow-matching predice trozos de accion (action chunks) para el robot. Este repositorio concreto contiene todo lo necesario para ejecutar GAM sobre el benchmark RoboTwin 2.0: el detector ajustado a RoboTwin, un experto de accion por tarea y la cache de entrenamiento precomputada de cada tarea.

La relevancia del lanzamiento esta en el enfoque monocular: el detector trabaja unicamente con RGB (profundidad cero), la geometria del objeto procede de su caja 3D predicha y la nube de puntos se reproyecta desde la profundidad estimada por el propio modelo. No se utiliza profundidad ni estado de objeto del simulador ni en entrenamiento ni en evaluacion, y cada objeto se ancla desde su nombre en cada fotograma (grounding de texto). Esto reduce la dependencia de sensores privilegiados y acerca el pipeline a un montaje real.

El repositorio ocupa 45,6 GB e incluye el detector `wilddet3d_robotwin.pt` (4,7 GB) y siete expertos de accion `gam_policy_<task>.pt` (1,2 GB cada uno, pesos EMA). No se publican en la informacion disponible el numero de parametros, la longitud de contexto ni resultados numericos de benchmarks. Las tareas cubiertas son `grab_roller`, `click_bell`, `beat_block_hammer`, `place_can_basket`, `stack_bowls_two`, `handover_block` y `shake_bottle`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos componentes: detector 3D de vocabulario abierto con backbone SAM3 (WildDet3D) + experto de accion con transformer de flow-matching |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (no es un LLM; los chunks de accion son de 50 pasos, de los que se ejecutan 15 por consulta en el ajuste `replan`) |
| Tipos de cuantizacion | no disponible; el detector se ejecuta en bf16 en evaluacion y en fp32 en entrenamiento |
| Idiomas soportados | no disponible (el detector acepta indicaciones de texto; no se especifica el conjunto de idiomas) |
| Licencia | other |
| Formato de pesos | PyTorch (`checkpoints/wilddet3d_robotwin.pt`, `checkpoints/gam_policy_<task>.pt`); cache de entrenamiento en `.npz` con `meta.json` |

## Arquitectura y entrenamiento

El sistema se compone de un detector y un actor. El detector parte de los pesos publicos `wilddet3d_alldata_all_prompt_v1.0` y se ajusta sobre 50 tareas de RoboTwin 2.0 en sus variantes limpia y aleatorizada, con 50 episodios experto por tarea, camara de cabeza HD1K_D435 a 1024x768 y 10 fotogramas por episodio, sobre el robot aloha-agilex. Las etiquetas son las poses de objeto del simulador expresadas como cajas 3D orientadas en el sistema de la camara mas sus proyecciones 2D. El entrenamiento del detector congela los 4 bloques mas bajos de los 32 del backbone SAM3 (con tasa de aprendizaje x0,2), entrena el codificador de texto, entrena la cabeza de profundidad manteniendo congelado el codificador de geometria, usa un peso L1 de 4 para la profundidad de objeto, precision fp32 y un schedule coseno con lr 5e-5. Las cajas que comparten un mismo texto en una imagen forman una unica consulta multi-positiva.

Los pesos liberados corresponden a un "refresh monocular": entrada con profundidad cero al 100 %, con indicaciones de texto y de clic al 50/50, y se usan con `detector_depth: zero`. La convencion de ejes de las extensiones es `[w, h, l]` (`box_whl_perm: [0, 1, 2]`) y las imagenes no cuadradas se letterboxean antes de entrar al detector. El experto de accion se entrena por tarea: la cache precomputada contiene 50 episodios experto por tarea con los fotogramas estaticos eliminados, y el repositorio describe los modos de entrenamiento sobre cache, con precomputo previo o extremo a extremo con detector congelado. El modelo card disponible aparece truncado en la seccion que describe el formato exacto de la cache, por lo que ese detalle no puede confirmarse.

## Capacidades

- Grounding 3D de vocabulario abierto: localiza objetos a partir de su nombre en la instruccion y los representa como caja 3D orientada, nube de puntos y tokens de imagen.
- Generacion de acciones roboticas bimanuales en forma de chunks, con transformer de flow-matching.
- Operacion puramente monocular: solo RGB, con profundidad cero como entrada al detector; la nube de puntos se reproyecta desde la profundidad estimada por el modelo.
- Anclaje por texto en cada fotograma (`grounding: text`), es decir, re-deteccion del objeto nombrado en cada paso.
- Prompts mixtos de texto y clic en el detector ajustado (50/50), heredados del detector base.
- Ejecucion de chunks con tres esquemas seleccionables: `replan` (15 de 50 pasos por consulta, con mezcla en las juntas), `tempens` (ensamblado temporal) y `rtc` (real-time chunking).
- Evaluacion en escenas limpias y aleatorizadas, 20 episodios por configuracion en el script de evaluacion.
- Capacidades multilingues: no disponible. Soporte de tool calling o function calling: no aplicable / no disponible. Vision: si (entrada RGB de camara de cabeza a 1024x768). Audio: no disponible.

## Casos de uso

- Evaluacion reproducible en RoboTwin 2.0: el script `benchmarks/robotwin/eval.py` permite medir los expertos liberados en escenas limpias y aleatorizadas con 20 episodios por configuracion, sirviendo como linea base para comparar metodos de imitacion bimanual.
- Entrenamiento de nuevos expertos sin montar la pila de percepcion: la cache `hf://gehaozhang/gam-robotwin/cache/<task>/` incluye los anclajes ya precomputados, de modo que un equipo puede entrenar su propio actor sobre `configs/robotwin/<task>.yaml` evitando el coste de ejecutar el detector.
- Investigacion en grounding 3D de vocabulario abierto: el detector ajustado `wilddet3d_robotwin.pt` puede reutilizarse para estudiar deteccion de cajas 3D orientadas en monoculo, con extensiones en orden `[w, h, l]` y letterboxing en imagenes no cuadradas.
- Analisis de estrategias de ejecucion de chunks: las opciones `replan`, `tempens` y `rtc` permiten estudiar el compromiso entre reactividad y suavidad en politicas que predicen horizonte de 50 pasos.
- Investigacion en sim-to-real de politicas monoculares: al no usar profundidad ni estado de objeto del simulador, el pipeline es un candidato para estudiar la transferencia de politicas entrenadas en simulacion a montajes con una sola camara RGB.
- Desarrollo de demostraciones y material audiovisual: la bandera `--overlay` genera videos con la camara de cabeza y las cajas 3D predichas, utiles para depurar el anclaje por paso o para comunicar resultados.
- Fine-tuning de detectores con datos propios: la receta documentada (congelar los 4 bloques mas bajos de SAM3, entrenar el codificador de texto y la cabeza de profundidad con el codificador de geometria congelado) sirve como punto de partida para ajustar el detector a nuevos dominios roboticos.
- Integracion en entornos mixtos: el script permite apuntar a un entorno Python distinto para RoboTwin con `--sim-python` y a checkpoints propios con `--ckpt`, lo que facilita desplegar el modelo dentro de un laboratorio con simulador aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card unicamente incluye rollouts de evaluacion en formato GIF para las tareas `click_bell`, `shake_bottle`, `beat_block_hammer`, `handover_block`, `grab_roller` (aleatorizada), `stack_bowls_two` (aleatorizada) y `place_can_basket`, sin tasas de exito ni metricas numericas asociadas.

## Requisitos de hardware

- VRAM de inferencia: no disponible. Como referencia de tamano de artefactos, el detector pesa 4,7 GB y cada experto de accion 1,2 GB; el modelo card no publica el consumo de memoria en inferencia.
- VRAM de entrenamiento medida en una NVIDIA L40S: lote 48 -> 34 GB, lote 32 -> 24 GB, lote 16 -> 14 GB.
- Configuracion en tarjeta de 24 GB: `--batch-size 16 --grad-accum 3`.
- GPU recomendadas: no se enumeran en la documentacion. La unica GPU mencionada explicitamente es la L40S para las medidas de entrenamiento; no se indica compatibilidad con A100, H100 o RTX 4090.
- GPU de consumo: no confirmado. Con 14 GB para lote 16 en entrenamiento y pesos de 4,7 GB (detector) mas 1,2 GB (experto), una GPU de 24 GB parece el minimo razonable segun los datos publicados, pero no hay confirmacion oficial para inferencia en tarjetas de gama de consumo.
- Opciones de despliegue: scripts de Python sobre PyTorch (`benchmarks/robotwin/eval.py`, `python -m GAM.train`, `python -m GAM.precompute`), con entorno conda propio (Python 3.11) creado mediante `scripts/install.sh --robotwin`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; no aplicables a este tipo de modelo.
- Precision en evaluacion: el detector se ejecuta en bf16 (`eval.precision`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. Los unicos modelos relacionados identificados son los del mismo autor y familia.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gehaozhang/gam-robotwin | Detector ajustado a RoboTwin 2.0 y expertos por tarea (7 tareas) | no disponible | no disponible | other | HuggingFace, 45,6 GB |
| gehaozhang/gam-wilddet3d | Detector general mas cabeza de span universal, base del detector ajustado | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| gehaozhang/gam-libero-pro | Variante de GAM para el benchmark LIBERO-PRO | no disponible | no disponible | no disponible en la informacion | HuggingFace |

## Limitaciones y advertencias

- Cobertura funcional limitada: solo se liberan expertos para siete tareas (`grab_roller`, `click_bell`, `beat_block_hammer`, `place_can_basket`, `stack_bowls_two`, `handover_block`, `shake_bottle`) y cada experto es especifico de su tarea; no hay un actor general.
- Dependencia del detector: cualquier error en la caja 3D o en la profundidad estimada se propaga directamente a la politica, ya que no se usa profundidad real ni estado de objeto del simulador.
- Procedencia de los datos de entrenamiento: las etiquetas del detector provienen de poses de objeto del simulador RoboTwin 2.0 (aloha-agilex, camara HD1K_D435), por lo que el comportamiento fuera de ese dominio no esta caracterizado y la brecha sim-to-real es desconocida.
- Restricciones de licencia: la licencia es `other`, sin texto de licencia incluido en la informacion disponible. El uso comercial no puede asumirse y requiere revision de los terminos del autor.
- Idiomas: no se especifica que idiomas admite el codificador de texto ni si las instrucciones pueden formularse fuera del conjunto de prompts de entrenamiento.
- Adopcion nula verificable: el repositorio registra 0 descargas y 0 likes con fecha de actualizacion de octubre de 2026, por lo que no existe validacion de la comunidad ni informes independientes de reproducibilidad.
- Documentacion incompleta: la model card disponible esta truncada en la descripcion del formato de la cache y de los expertos de accion, lo que impide confirmar detalles del pipeline de precomputo.
- Riesgo de alucinacion: no aplicable en el sentido de generacion de texto libre, pero si en el de detecciones espurias: el detector puede producir cajas para objetos no presentes si el prompt lo sugiere.
- Evaluacion: las metricas publicadas son unicamente rollouts en video; no hay tasas de exito ni comparaciones numericas con lineas base, de modo que no es posible cuantificar su rendimiento a partir de la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gehaozhang/gam-robotwin
- Codigo: https://github.com/GehaoZhang6/Grounding-Action-Model
- Modelo relacionado (GAM-LIBERO-PRO): https://huggingface.co/gehaozhang/gam-libero-pro
- Modelo relacionado (GAM-WildDet3D, detector general mas cabeza de span universal): https://huggingface.co/gehaozhang/gam-wilddet3d
- Ficheros de tareas (GAM-LIBERO-PRO assets): https://huggingface.co/datasets/gehaozhang/gam-libero-pro-assets
