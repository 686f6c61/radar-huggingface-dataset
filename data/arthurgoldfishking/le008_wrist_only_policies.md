# ArthurGoldFishKing/le008_wrist_only_policies

## Resumen

`le008_wrist_only_policies` es un repositorio de politicas visuomotoras para robotica entrenadas con LeRobot sobre el conjunto de datos `MISLab-MiiSLab/Le-008_head`. Contiene tres politicas independientes —ACT, Diffusion Policy y ACT-JEPA— para la tarea real "pick up the fan by its handle", entrenadas exclusivamente con las camaras de muneca (RGB y profundidad), sin usar la camara de cabeza. El autor es ArthurGoldFishKing y el repositorio tiene 1,6 GB.

El interes tecnico del artefacto es que forma parte de una ablacion controlada de camaras: todas las configuraciones de entrenamiento son identicas a las de `ArthurGoldFishKing/le008_policies`, que si empleaba la camara de cabeza, de modo que comparar ambos repos permite aislar el efecto de la informacion visual de la camara de cabeza frente a la de muneca en el aprendizaje de politicas de manipulacion.

Se trata de un artefacto de investigacion, no de un modelo fundacional de lenguaje: no hay pesos de lenguaje, tokenizador, ventana de contexto ni capacidades de generacion de texto. Cada politica consume dos imagenes de 256x256 (RGB de muneca y profundidad de muneca) y un estado de 7 dimensiones, y produce acciones de 7 dimensiones por paso. Ninguna de las tres politicas ha sido evaluada aun en el robot real; solo se publican perdidas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres politicas visuomotoras: ACT (transformer con VAE y encoder ResNet-18), Diffusion Policy (DDIM, encoder separado por camara) y ACT-JEPA (transformer con encoder ResNet-18 compartido) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; horizonte de accion de 16-20 pasos segun politica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa) |
| Idiomas soportados | no aplica (modelo de robotica, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints de LeRobot `pretrained_model` y checkpoints de ACT-JEPA); export adicional para ROS 2 |

## Arquitectura y entrenamiento

Las tres politicas se entrenaron sobre el dataset `MISLab-MiiSLab/Le-008_head` (robot real, 200 episodios, 13.238 fotogramas a 10 fps), con split fijo de 190 episodios de entrenamiento y 10 de validacion (episodios 10, 66, 77, 98, 103, 107, 122, 124, 130 y 194). Cada una se entreno durante 50.000 pasos con batch size 32 usando solo `observation.images.wrist` (RGB 256x256) y `observation.images.depth` (profundidad de muneca en escala de grises, codificacion en `depth_info.json`); las claves `observation.images.head` y `observation.images.head_depth` no se utilizaron. La entrada de estado es de 7 dimensiones (6 articulaciones y pinza) y la salida son deltas de accion de 7 dimensiones (dx, dy, dz, drx, dry, drz, gripper).

ACT usa AdamW con lr 1e-5 y weight decay 1e-4, schedule coseno con 500 pasos de warmup, chunk de accion de 20 (2 s) ejecutando 5, VAE con kl weight 10 y encoder ImageNet ResNet-18. Diffusion Policy usa Adam con lr 1e-4, schedule coseno con 500 de warmup, horizonte 16 con 2 pasos de observacion y ejecucion de 8, DDIM con 10 pasos de inferencia, recorte aleatorio 240x240 y un encoder separado por camara. ACT-JEPA usa AdamW con lr 3e-4 y weight decay 0,1, schedule coseno con 4% de warmup, chunk de 20, normalizacion mean/std de estado y accion, pinza oculta del estado de contexto y ResNet-18 compartido. En ninguna de las tres se empleo EMA de los pesos ni aumento de color.

## Capacidades

- Control visuomotor de manipulacion robotica: genera deltas de accion de 7 dimensiones a partir de imagenes de muneca y estado articular.
- Percepcion multimodal limitada a RGB de muneca y profundidad de muneca a 256x256.
- Politicas de accion por chunks: ACT y ACT-JEPA con horizonte de 20 pasos, Diffusion Policy con horizonte de 16.
- Tres alternativas de modelado entrenadas sobre los mismos datos y ajustes, utiles para comparar familias de politicas (imitation learning determinista, difusion y JEPA).
- Export para inferencia en ROS 2 mediante `ros2_policy_inference` (carpeta `act_jepa/ros_export_50k/`), con pesos, normalizacion, configuracion de ResNet y `parity.npz` para verificacion de paridad.
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general, audio ni capacidades multilingues.

## Casos de uso

- Investigacion en imitation learning: comparar ACT, Diffusion Policy y ACT-JEPA con presupuesto de entrenamiento y datos identicos para aislar diferencias entre familias de politicas.
- Ablacion de camaras: emparejar este repositorio con `ArthurGoldFishKing/le008_policies` (con camara de cabeza) para medir el efecto de la vista de cabeza frente a la de muneca en la misma tarea.
- Manipulacion robotica de recogida por el asa: la tarea entrenada ("pick up the fan by its handle") sirve como base para experimentos de grasping guiado por vision de muneca y profundidad.
- Despliegue en ROS 2: el export `ros_export_50k` permite integrar la politica ACT-JEPA en un stack ROS 2 mediante `ros2_policy_inference`, con normalizacion y comprobacion de paridad incluidas.
- Reproduccion de pipelines LeRobot: los checkpoints de ACT y Diffusion son `pretrained_model` completos de LeRobot 0.6.2, con preprocesadores y postprocesadores, utiles para validar flujos de entrenamiento e inferencia.
- Estudio de politicas con entrada de profundidad: el uso de profundidad de muneca en escala de grises permite analizar el impacto de la modalidad de profundidad en tareas de agarre.
- Base para evaluacion sim-to-real o real-robot: al no haberse evaluado aun en el robot, sirve como punto de partida para protocolos de evaluacion en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Solo se reportan perdidas de entrenamiento, que miden objetivos distintos y no son comparables entre si:

| Politica | Perdida de entrenamiento final | Perdida de validacion |
|---|---|---|
| ACT | 0,014 | no disponible |
| Diffusion Policy | 0,007 | no disponible |
| ACT-JEPA | 0,045 | 0,0959 en el paso 50.000 (minimo; entre 0,096 y 0,105 desde el paso 12.500) |

Con camara de cabeza, ACT-JEPA alcanzo 0,0983 en el mejor punto y 0,1016 en el paso 50.000. Ninguna politica se ha evaluado en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio ocupa 1,6 GB e incluye tres politicas y checkpoints, por lo que cada politica individual es de escala pequena (encoders ResNet-18 y transformers de accion), apta previsiblemente para GPU de consumo, aunque no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano de los encoders (ResNet-18) es plausible en GPUs consumer, pero no hay datos publicados.
- Opciones de despliegue: LeRobot 0.6.2 (`ACTPolicy.from_pretrained`, `DiffusionPolicy.from_pretrained`), codigo `act-jepa` para la politica JEPA y `ros2_policy_inference` para el export ROS 2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Familia | Entrada | Horizonte de accion | Evaluacion en robot | Licencia |
|---|---|---|---|---|---|
| le008_wrist_only_policies (ACT) | ACT | RGB muneca + profundidad muneca, estado 7-D | chunk 20, ejecutar 5 | no | no disponible |
| le008_wrist_only_policies (Diffusion) | Diffusion Policy | RGB muneca + profundidad muneca, estado 7-D | horizonte 16, ejecutar 8 | no | no disponible |
| le008_wrist_only_policies (ACT-JEPA) | ACT-JEPA | RGB muneca + profundidad muneca, estado 7-D | chunk 20 | no | no disponible |
| le008_policies (referencia del autor) | ACT, Diffusion, ACT-JEPA | RGB y profundidad de muneca y de cabeza | identico | no | no disponible |

No se dispone de datos de rendimiento comparativo con otras politicas publicas en la informacion proporcionada.

## Limitaciones y advertencias

- Ninguna de las tres politicas ha sido evaluada en el robot real; solo existen perdidas de entrenamiento, insuficientes para inferir exito en tarea.
- Las perdidas de las tres politicas corresponden a objetivos distintos y no son comparables entre si.
- Entrenadas con solo 200 episodios y una unica tarea ("pick up the fan by its handle"); no hay evidencia de generalizacion a otras tareas, objetos o entornos.
- Dependencia de la camara de muneca y de la profundidad; el rendimiento fuera de esa configuracion de sensores no esta caracterizado.
- Dataset y modelo de dominio muy especifico (un robot, un montaje); riesgo alto de sobreajuste al entorno de recogida.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Las rutas de las configuraciones de ACT-JEPA son relativas al proyecto de entrenamiento y requieren ajuste.
- No hay informacion sobre sesgos, alucinacion o comportamiento en produccion porque no es un modelo generativo de lenguaje; los riesgos relevantes son de seguridad fisica en robotica (fallos de agarre, colisiones) y deben mitigarse con limites de par, paradas de emergencia y validacion en banco.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArthurGoldFishKing/le008_wrist_only_policies
- Repositorio de referencia con camara de cabeza: https://huggingface.co/ArthurGoldFishKing/le008_policies
- Dataset: https://huggingface.co/datasets/MISLab-MiiSLab/Le-008_head
- Codigo ACT-JEPA: https://github.com/act-jepa/act-jepa
- LeRobot: https://github.com/huggingface/lerobot
