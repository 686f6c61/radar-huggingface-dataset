# padiredd/groot-blockpick-varied-timing-statenoise

## Resumen

`groot-blockpick-varied-timing-statenoise` es un ajuste fino (fine-tune) del modelo fundacional de robotica NVIDIA GR00T N1.7-3B, publicado por el usuario padiredd en HuggingFace. Se trata de un modelo vision-language-action (VLA) especializado en una unica tarea de manipulacion: recoger un bloque verde lima con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2 en el simulador Isaac Lab, partiendo de una pose inicial fija y con el bloque colocado de forma uniforme en una region del plano de trabajo.

El modelo parte del backbone Cosmos-Reason2-2B (congelado) y entrena unicamente el proyector y la cabeza de accion de difusion, lo que supone 1,62 B de parametros entrenables sobre los 3 B totales. El ajuste se ha realizado sobre un conjunto de 500 demos con temporizacion variable por episodio (83.472 fotogramas, 3 camaras a 240x240) e incluye ruido gaussiano de 1 grado sobre las articulaciones del brazo izquierdo y un dropout de estado de 0,2 para mejorar la robustez frente a perturbaciones en la observacion.

Su relevancia es acotada y experimental: es un artefacto de investigacion publicado con 0 descargas y 0 likes, orientado a reproducir el pipeline de entrenamiento y evaluacion de politicas de imitacion en simulacion. No es un modelo de proposito general ni esta pensado para desplegarse fuera del entorno Isaac Lab con el fork especifico de Isaac-GR00T.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en GR00T N1.7: backbone Cosmos-Reason2-2B congelado + proyector + cabeza de accion de difusion |
| Parametros totales | 3 B (modelo base GR00T-N1.7-3B) |
| Parametros activos | 1,62 B entrenables (proyector + cabeza de accion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | no disponible (instruccion de lenguaje fija en ingles: "pick up the lime green block with the left arm") |
| Licencia | other |
| Formato de pesos | safetensors (fp32, 12,6 GB por checkpoint) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de NVIDIA GR00T N1.7, un VLA que combina un backbone de razonamiento vision-lenguaje (Cosmos-Reason2-2B) con una cabeza de accion de difusion que genera chunks de 16 acciones. En este fine-tune el backbone permanece congelado y solo se ajustan el proyector y la cabeza de accion, con 1,62 B de parametros entrenables. La observacion de estado se compone de 8 dimensiones por brazo (arm_left 8 + arm_right 8) y la accion son 16 objetivos articulares absolutos por chunk.

El entrenamiento se planifico a 100.000 pasos con batch global de 32, optimizador AdamW con lr 1e-4, schedule coseno, warmup del 5 % y weight decay 1e-5, en fp32 sobre una A100 de 80 GB (~0,68 s/paso). Los datos son 500 demos del conjunto `pick-cube-topdown-20x25-rt-500-3cam` en Isaac Lab con el robot ROBOTIS FFW SG2, 83.472 fotogramas de 3 camaras a 240x240 y bloque uniforme en x 0,28-0,48 m / y 0,065-0,315 m. Como innovaciones destacables: aumentacion de imagen (color jitter, rotacion aleatoria de 5 grados y random crop), ruido gaussiano de 1 grado sobre las 7 articulaciones del brazo izquierdo y state dropout de 0,2. Se publican cinco checkpoints (step-20000 a step-100000); no se suben estados de optimizador, scheduler ni RNG.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce chunks de 16 objetivos articulares absolutos (16 dimensiones) condicionados por observaciones visuales y de estado.
- Percepcion visual multi-camara: procesa 3 camaras a 240x240 como entrada.
- Seguimiento de instrucciones en lenguaje natural: condicionado por la instruccion fija "pick up the lime green block with the left arm".
- Ejecucion de una tarea especifica: pick top-down de un bloque verde lima con el brazo izquierdo desde una pose inicial fija.
- Robustez a ruido de estado: entrenado con ruido gaussiano de 1 grado en las articulaciones y state dropout de 0,2.
- No soporta tool calling, function calling, agentes multi-paso, vision general, audio ni modo thinking; sus capacidades quedan circunscritas a la politica de imitacion entrenada.

## Casos de uso

- Investigacion en imitacion robotica: servir como checkpoint de referencia para reproducir el pipeline de fine-tune de GR00T N1.7 sobre tareas de pick en Isaac Lab y comparar recetas de entrenamiento.
- Evaluacion de robustez a perturbaciones: el ruido de estado y el state dropout permiten estudiar como afectan las perturbaciones en la observacion a la tasa de exito en simulacion.
- Benchmarking de politicas de difusion: el autor lo compara con sus propias politicas de difusion `padiredd/dp-blockpick-*` bajo el mismo protocolo de 50 picks, por lo que sirve como baseline VLA frente a diffusion policies.
- Estudio de temporizacion variable: el conjunto de demos con timing variado por episodio permite analizar la sensibilidad de la politica a la velocidad de ejecucion.
- Desarrollo de forks de Isaac-GR00T: el modelo se carga con el fork `omkarpatil18/Isaac-GR00T-n1.7` registrando una configuracion de modalidad concreta, lo que lo hace util para validar integraciones del stack.
- Docencia y prototipado en simulacion: ejemplo completo de fine-tune VLA con backbone congelado y cabeza de accion entrenable, reproducible en una sola A100 de 80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los rollouts en simulacion (50 picks, mismo protocolo que las diffusion policies `padiredd/dp-blockpick-*`) se ejecutan con `data_collection/rollout_policy.py --policy groot` contra `groot_server.py` y que los resultados se anadiran a medida que esten disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; cada checkpoint ocupa 12,6 GB en fp32, por lo que se necesita al menos esa cantidad de memoria mas el overhead del runtime.
- GPU recomendadas: A100 80 GB para entrenamiento (hardware declarado, ~0,68 s/paso con batch global 32). Para inferencia no se especifica.
- Cabe en GPU de consumo: no confirmado; con 12,6 GB en fp32 un checkpoint podria cargar en GPUs de 16 GB o mas, pero no se ha validado ni se documentan cuantizaciones.
- Opciones de despliegue: fork `omkarpatil18/Isaac-GR00T-n1.7` (commit e81d02b) mediante `Gr00tPolicy(embodiment_tag="new_embodiment", model_path=<folder>)` tras registrar `modality_config/ffw_bg2_pick_cube_3cam_config.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot-blockpick-varied-timing-statenoise | 3 B (1,62 B entrenables) | no disponible | Pick top-down de bloque en Isaac Lab | other | HuggingFace, 0 descargas |
| nvidia/GR00T-N1.7-3B (base) | 3 B | no disponible | VLA fundacional generalista | no disponible en la informacion | HuggingFace (NVIDIA) |
| padiredd/dp-blockpick-* | no disponible | no disponible | Pick de bloque (diffusion policy) | no disponible | HuggingFace (mismo autor) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo ejecuta la tarea de pick top-down de un bloque verde lima con el brazo izquierdo desde una pose inicial fija; no generaliza a otras tareas, objetos ni poses.
- Entrenado exclusivamente en simulacion (Isaac Lab); no hay evidencia de transferencia a robot real (sim-to-real no validado).
- Dependencia de un fork concreto de Isaac-GR00T (`omkarpatil18/Isaac-GR00T-n1.7` en e81d02b) y de una configuracion de modalidad especifica; la compatibilidad con otras versiones no esta garantizada.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial requiere revisar las condiciones del modelo base NVIDIA GR00T N1.7-3B y del autor.
- Riesgo de sobreajuste al dominio visual limpio del simulador y a la region acotada del bloque (x 0,28-0,48 m, y 0,065-0,315 m).
- Sin resultados de evaluacion publicados en el momento de la ficha; el rendimiento real es desconocido.
- Artefacto experimental con 0 descargas y 0 likes; no hay comunidad ni soporte documentado.
- No se publican estados de optimizador, scheduler ni RNG, lo que limita la reanudacion exacta del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/groot-blockpick-varied-timing-statenoise
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Fork de Isaac-GR00T usado: https://github.com/omkarpatil18/Isaac-GR00T-n1.7 (commit e81d02b)
- Politicas de difusion del mismo autor (referencia de evaluacion): https://huggingface.co/padiredd/dp-blockpick-*
