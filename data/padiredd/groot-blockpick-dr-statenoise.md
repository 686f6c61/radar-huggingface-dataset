# padiredd/groot-blockpick-dr-statenoise

## Resumen

groot-blockpick-dr-statenoise es un ajuste fino del modelo vision-language-action (VLA) GR00T N1.7-3B de NVIDIA, publicado por el usuario padiredd. El modelo resuelve una tarea concreta de robótica manipulativa: el picking cenital de un bloque verde lima con el brazo izquierdo de un robot ROBOTIS FFW SG2 simulado en Isaac Lab. El ajuste se ha realizado sobre un conjunto de 500 demostraciones con domain randomization (fondos, iluminacion, montajes de camara, color del bloque y tiempos variables), lo que busca mejorar la robustez frente a variaciones visuales y de estado.

El modelo hereda la arquitectura de GR00T N1.7, que combina un backbone Cosmos-Reason2-2B congelado con un proyector y una cabeza de accion de difusion, sumando 1,62 mil millones de parametros entrenables. La relevancia actual reside en que se publican cinco checkpoints intermedios (step-20000 a step-100000) de un proceso de fine-tuning con ruido gaussiano de 1 grado inyectado en las articulaciones del brazo izquierdo durante el entrenamiento, una tecnica que busca aumentar la tolerancia del modelo al ruido de estado en despliegues reales.

El repositorio ocupa 42,9 GB e incluye pesos en fp32 por checkpoint (12,6 GB por carpeta), configuracion, estadisticas de normalizacion y metadatos de entrenamiento. No se han publicado resultados de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en GR00T N1.7: backbone Cosmos-Reason2-2B congelado + proyector + cabeza de accion de difusion |
| Parametros totales | 3B (modelo base GR00T N1.7-3B); 1,62B entrenables en el fine-tune |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (instruccion en ingles: "pick up the lime green block with the left arm") |
| Licencia | other |
| Formato de pesos | safetensors (shards fp32 de 12,6 GB por checkpoint) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone de razonamiento visual-linguistico Cosmos-Reason2-2B que permanece congelado durante el fine-tune, conectado mediante un proyector a una cabeza de accion basada en difusion. En este ajuste se entrenan unicamente el proyector y la cabeza de accion, sumando 1,62B de parametros entrenables. La entrada de estado se compone de 8 dimensiones para el brazo izquierdo y 8 para el derecho; la salida de accion son 16 objetivos articulares absolutos con un chunk de 16 pasos. La tarea se especifica mediante la instruccion de lenguaje "pick up the lime green block with the left arm".

El entrenamiento se realizo sobre el conjunto pick-cube-topdown-25cm-dr-500-3cam, con 500 demostraciones, 84.111 frames, 3 camaras a 240x240, pose inicial fija y bloque uniformemente distribuido en x 0,23-0,48 m / y 0,065-0,315 m. Se aplico domain randomization por episodio (fondo, apariencia de mesa, luces, montajes de camara, color del bloque y tiempos de demostracion variables). La receta incluye 100.000 pasos planificados con batch global 32, checkpoint cada 20k, optimizador AdamW con lr 1e-4 coseno, warmup del 5 %, weight decay 1e-5 y pesos en fp32. Como innovacion destacable, se inyecto ruido gaussiano de 1 grado en las 7 articulaciones del brazo izquierdo durante el entrenamiento (hook propio) y se mantuvo el state dropout de 0,2 por defecto del repositorio. La augmentacion de imagen incluye color jitter (brillo 0,4, contraste 0,4, saturacion 0,5, tono 0,1), rotacion aleatoria de 5 grados y random crop del repositorio. El entrenamiento se ejecuto en una A100 80 GB con un tiempo de aproximadamente 0,68 s/paso.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce 16 objetivos articulares absolutos por chunk a partir de observaciones visuales (3 camaras a 240x240), estado de 16 dimensiones e instruccion de lenguaje.
- Control visomotor de picking cenital: especializado en la tarea de recoger un bloque verde lima con el brazo izquierdo.
- Robustez a domain randomization: entrenado con variacion de fondos, iluminacion, montajes de camara, color del bloque y tiempos.
- Tolerancia al ruido de estado: el ruido gaussiano de 1 grado inyectado en las articulaciones del brazo izquierdo busca mejorar la estabilidad ante perturbaciones.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante un prompt de texto.
- Integracion con Isaac-GR00T: compatible con la API Gr00tPolicy y el servidor groot_server.py del fork de ROBOTIS.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Modo thinking, vision adicional o audio: no disponible.

## Casos de uso

- Evaluacion de politicas de picking en simulacion: el modelo se carga con Gr00tPolicy(embodiment_tag="new_embodiment", model_path=<carpeta>) tras registrar la configuracion de modalidad ffw_bg2_pick_cube_3cam_config.py, y se ejecuta con data_collection/rollout_policy.py --policy groot contra groot_server.py para medir tasas de exito en 50 picks.
- Estudio de robustez frente a domain randomization: al haberse entrenado con fondos, luces y camaras variables, sirve para analizar como afectan estas variaciones a la tasa de exito en simulacion.
- Analisis del efecto del ruido de estado: los cinco checkpoints (20k a 100k) permiten comparar curvas de aprendizaje y estabilidad bajo ruido de 1 grado en las articulaciones.
- Baseline para transferencia sim-a-real: al usar una tarea estandarizada (bloque verde lima, pose inicial fija, distribucion conocida), puede servir como referencia para estudiar la brecha sim-a-real en robots ROBOTIS FFW SG2.
- Comparacion con politicas de difusion: el autor menciona el protocolo de evaluacion de padiredd/dp-blockpick-*, lo que permite contrastar el VLA con politicas de difusion clasicas sobre la misma tarea.
- Prototipado de pipelines de control con chunk de 16: util para validar infraestructura de inferencia (servidor groot_server.py, cliente de rollout) antes de escalar a otras tareas.
- Investigacion en VLA con backbone congelado: permite estudiar el rendimiento de ajustar solo proyector y cabeza de accion (1,62B entrenables) sobre un backbone Cosmos-Reason2-2B congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las evaluaciones en simulacion (50 picks, mismo protocolo que las politicas de difusion de padiredd/dp-blockpick-*) se iran anadiendo conforme esten disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en fp32 con 12,6 GB por checkpoint; se requiere al menos esa cantidad mas el overhead del runtime (no se especifica el total exacto).
- GPU recomendadas: A100 80 GB para entrenamiento (usada por el autor, ~0,68 s/paso con batch global 32); para inferencia no se especifica una GPU concreta.
- Cabe en consumer GPU: no disponible; el tamano fp32 de 12,6 GB sugiere que podria requerir GPUs de gama alta con 16 GB o mas, pero no se confirma en la informacion.
- Opciones de despliegue: ROBOTIS fork de Isaac-GR00T (omkarpatil18/Isaac-GR00T-n1.7 en e81d02b) mediante Gr00tPolicy y groot_server.py. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia; solo se conoce el tiempo de entrenamiento (~0,68 s/paso en A100 80 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot-blockpick-dr-statenoise | 3B (1,62B entrenables) | no disponible | Picking cenital de bloque con FFW SG2 | other | Hugging Face (padiredd) |
| nvidia/GR00T-N1.7-3B | 3B | no disponible | VLA generalista de robotica | no disponible | Hugging Face (NVIDIA) |
| padiredd/dp-blockpick-* | no disponible | no disponible | Picking de bloque (politicas de difusion) | no disponible | Hugging Face (padiredd) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para una unica tarea (picking cenital de bloque verde lima con brazo izquierdo) en un robot concreto (ROBOTIS FFW SG2) y no se ha validado en otras tareas.
- Sin resultados de evaluacion publicados: la model card indica que los resultados de simulacion se anadiran mas adelante; no hay evidencia cuantitativa de tasa de exito.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial requiere revisar la licencia del modelo base nvidia/GR00T-N1.7-3B y del fork de Isaac-GR00T.
- Dependencia de un fork especifico: requiere el fork omkarpatil18/Isaac-GR00T-n1.7 en el commit e81d02b y el registro de la configuracion de modalidad ffw_bg2_pick_cube_3cam_config.py; no es compatible directamente con la libreria upstream sin adaptacion.
- Solo simulacion: el entrenamiento y la evaluacion se realizan en Isaac Lab; no hay evidencia de transferencia a hardware real.
- Estados de optimizador, scheduler y RNG no subidos: no es posible reanudar el entrenamiento exactamente desde los checkpoints.
- Riesgo de alucinacion y sesgos: no disponible; al ser un modelo de accion, el riesgo principal es la generacion de trayectorias invalidas o inestables.
- Idiomas: no disponible; la instruccion de entrenamiento esta en ingles.
- Pesos en fp32: el repositorio de 42,9 GB y los 12,6 GB por checkpoint implican un coste de almacenamiento y memoria elevado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/groot-blockpick-dr-statenoise
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Fork de Isaac-GR00T usado: https://github.com/omkarpatil18/Isaac-GR00T-n1.7 (commit e81d02b)
- Repositorio de politicas de difusion del autor: https://huggingface.co/padiredd/dp-blockpick- (referencia en la model card; URL exacta no disponible)
