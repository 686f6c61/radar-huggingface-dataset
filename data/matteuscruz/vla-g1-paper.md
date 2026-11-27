# matteuscruz/vla-g1-paper

## Resumen

`matteuscruz/vla-g1-paper` es una coleccion de 14 checkpoints de politicas vision-language-action (VLA) para el robot humanoide Unitree G1 equipado con pinzas Dex1. No es un modelo unico, sino el material experimental de un articulo cientifico en preparacion: una comparacion factorial controlada de tres arquitecturas VLA (π0.5, DM0.5 y VLA-JEPA) fine-tuneadas sobre exactamente los mismos datos y el mismo protocolo de entrenamiento. El autor es `matteuscruz` y el repositorio se publica bajo la libreria LeRobot.

La tarea concreta es un pick-and-place de un cilindro: cogerlo con la mano izquierda, pasarlo a la derecha y soltarlo en una cesta. El diseno experimental es un factorial 2 × 3: tres modelos, cada uno con dos regimenes de congelacion (solo el modulo de accion entrenado, con el VLM congelado, o VLM y experto de accion entrenados conjuntamente), mas un tercer brazo para VLA-JEPA que anade el modelo del mundo latente. Cada combinacion se entrena dos veces, una por cada esquema de particion train/test, totalizando 14 checkpoints a 20.000 pasos.

Su relevancia es metodologica: ofrece un banco de pruebas reproducible para medir cuanto aporta descongelar el VLM en tareas roboticas de pocos datos, y publica resultados en bucle cerrado en MuJoCo con intervalos de confianza. El repo pesa 115,9 GB, esta etiquetado como `pipeline_tag: robotics` y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (tres familias: π0.5, DM0.5 y VLA-JEPA) sobre LeRobot |
| Parametros totales | No disponible (se publican parametros entrenables por brazo: 0,16 B a 4,49 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenamiento y evaluacion en bf16/fp32) |
| Idiomas soportados | No disponible (instruccion unica en ingles: "Pick up the cylinder and place it into the basket.") |
| Licencia | `other`, con `license_name: base-model-licenses` (heredada de los modelos base) |
| Formato de pesos | safetensors, dentro de carpetas de politica LeRobot (`runs/<run>/checkpoints/020000/pretrained_model`) |

## Arquitectura y entrenamiento

Los tres modelos son politicas VLA con un backbone vision-language y un experto de accion separado. π0.5 y DM0.5 siguen el esquema de LeRobot con un VLM y un modulo de accion; DM0.5 incorpora ademas prefill de real-time chunking, con un prefijo de d ∈ [0, 10] acciones limpias muestreado por muestra. VLA-JEPA anade un modelo del mundo latente que se desactiva al congelar el VLM. En todos los casos las proyecciones de estado y accion se re-inicializaron para un vector de 16 dimensiones (14 articulaciones de brazo y 2 pinzas; la pinza Dex1 va de 0 = cerrada a 5,4 = abierta).

Los datos son 302 episodios a 30 fps del dataset `matteuscruz/g1-dex1-cylinder-isaac-mujoco`: los episodios 0-203 son demostraciones de Isaac Lab de Unitree y los 204-301 son replays en MuJoCo de las demostraciones de entrenamiento. La normalizacion usa cuantiles calculados solo sobre los episodios de entrenamiento de Isaac Lab. El protocolo es identico en los 14 brazos: 20.000 pasos × batch 32 en una H200 con pesos bf16, schedule coseno con warmup de 666 pasos, chunk de accion de 50 pasos (1,67 s), tres camaras (cabeza, muneca izquierda y muneca derecha) y semilla 1000. Los learning rates y weight decay son los por defecto de LeRobot por modelo: π0.5 2,5e-5 / 0,01; DM0.5 2,5e-5 / 1e-10; VLA-JEPA 1e-4 / 1e-8. Dos ejecuciones declaran desviaciones: `vla_jepa-full-par-20k` se entreno hasta el paso 15.500 en el HPC Eldorado y se termino en una H200 de Modal, y `dm05-rtc-par-20k` se reanudo tras un fallo por disco lleno.

## Capacidades

- Control robotico visuomotor: genera chunks de 50 acciones a partir de tres vistas de camara y del estado de 16 dimensiones del robot.
- Manipulacion bimanual: la tarea evaluada requiere pasar el objeto de la mano izquierda a la derecha antes de soltarlo.
- Seguimiento de instrucciones en lenguaje natural, aunque el conjunto de datos solo contiene una instruccion fija.
- Razonamiento visual-lenguaje subyacente heredado de los modelos base π0.5, DM0.5 y VLA-JEPA (no documentado en esta model card).
- Prediccion en un modelo del mundo latente, exclusivamente en los checkpoints de VLA-JEPA que no congelan el VLM.
- Tool calling, function calling, agentes multi-paso, capacidades multilingues, thinking mode, vision general, audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion comparativa de arquitecturas VLA: usar los 14 checkpoints como linea base reproducible para medir el efecto de congelar o descongelar el VLM en una tarea de manipulacion con 302 episodios.
- Reproduccion de resultados: descargar un checkpoint concreto via `snapshot_download` y evaluarlo en MuJoCo con el mismo protocolo (20 episodios × 3 semillas, chunks de 50 pasos sin solapamiento, fp32) para verificar las cifras publicadas.
- Estudio de esquemas de particion de datos: comparar los pares episode-level y pair-wise para cuantificar la fuga de informacion entre episodios gemelos y replays de simulador.
- Analisis del modelo del mundo: contrastar `vla_jepa-full-20k` (con world model) frente a `vla_jepa-full-nowm-20k` (sin el) para aislar su contribucion al exito de la tarea.
- Transferencia a un G1 real: los checkpoints son carpetas de politica LeRobot estandar, por lo que sirven como punto de partida para fine-tuning con datos del robot fisico, siempre que se respete la normalizacion guardada en el checkpoint.
- Docencia y divulgacion: el diseno factorial 2 × 3 con intervalos de confianza al 95% es un ejemplo didactico de evaluacion rigurosa en robotica aprendida, util en cursos de aprendizaje por imitacion.
- Optimizacion de coste de entrenamiento: los datos de memoria pico por brazo (22 a 114 GiB) permiten planificar presupuestos de GPU para experimentos similares.

## Benchmarks y rendimiento

Evaluacion en bucle cerrado en MuJoCo, 20 episodios de test × 3 semillas = 60 rollouts por checkpoint, camaras del simulador, chunks de 50 pasos sin solapamiento y fp32. La referencia de replay de las acciones grabadas alcanza la cesta en 12 de 20 episodios.

| Modelo | Brazo | Cesta, split por episodios [IC 95%] | Cesta, split por pares [IC 95%] | Agarre (ep. / par) | Memoria pico GPU (GiB) |
|---|---|---|---|---|---|
| π0.5 | Experto | 22/60 [26, 49] | 22/60 [26, 49] | 40 / 36 | 22 |
| π0.5 | VLM y experto | 46/60 [65, 86] | 48/60 [68, 88] | 51 / 53 | 46 |
| DM0.5 | Experto | 1/60 [0, 9] | 1/60 [0, 9] | 16 / 17 | 45 |
| DM0.5 | VLM y experto | 42/60 [57, 80] | 41/60 [56, 79] | 45 / 46 | 83 |
| VLA-JEPA | Experto | 42/60 [57, 80] | 47/60 [66, 87] | 45 / 50 | 26 |
| VLA-JEPA | VLM y experto | 52/60 [76, 93] | 52/60 [76, 93] | 53 / 53 | 86 |
| VLA-JEPA | + modelo del mundo | 49/60 [70, 89] | 49/60 [70, 89] | 51 / 51 | 114 |

Los checkpoints base sin fine-tuning alcanzan la cesta en 0/60 (π0.5), 0/44 (DM0.5) y 1/60 (VLA-JEPA) rollouts. Los resultados por rollout y las trazas de la evaluacion episode-level estan en `sim_eval/<run>/`.

## Requisitos de hardware

- Entrenamiento: una H200 por brazo, batch 32 sin acumulacion de gradientes, pesos bf16.
- Memoria pico en entrenamiento segun brazo: 22 GiB (π0.5 experto), 26 GiB (VLA-JEPA experto), 45 GiB (DM0.5 experto), 46 GiB (π0.5 completo), 83 GiB (DM0.5 completo), 86 GiB (VLA-JEPA VLM y experto) y 114 GiB (VLA-JEPA con modelo del mundo).
- Inferencia: no se publica VRAM de inferencia; la evaluacion se hizo en fp32 en H200 y en GPUs de Modal, sin detallar el modelo concreto.
- GPU consumer: no disponible. Los brazos completos superan los 80 GiB en entrenamiento, fuera del alcance de una RTX 4090 (24 GiB); los brazos de solo experto (22-45 GiB) quedan tambien por encima en su mayoria.
- Despliegue: el formato es una carpeta de politica LeRobot (`pretrained_model`), cargable con la clase de politica del modelo correspondiente. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros entrenables (B) | Contexto | Exito en cesta (mejor brazo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 (aqui) | 0,69 / 4,14 | no disponible | 48/60 | base-model-licenses | 2 checkpoints en este repo |
| DM0.5 (aqui) | 0,86 / 4,49 | no disponible | 42/60 | base-model-licenses | 2 checkpoints en este repo |
| VLA-JEPA (aqui) | 0,16 / 2,28 / 2,77 | no disponible | 52/60 | base-model-licenses | 4 checkpoints en este repo |

La comparacion es intrinseca al repositorio: los tres modelos se entrenaron con datos, pasos, batch y semilla identicos, lo que permite atribuir las diferencias de rendimiento a la arquitectura y al regimen de congelacion. No se dispone de comparacion con modelos externos en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy estrecho: una sola tarea (pick-and-place de cilindro) y una sola instruccion en ingles; no hay evidencia de generalizacion a otras tareas u objetos.
- Evaluacion exclusivamente en simulacion (MuJoCo); no se reportan pruebas en el robot Unitree G1 fisico.
- El split episode-level puede inflar resultados por fuga de informacion: el dataset de Isaac Lab graba cada trayectoria dos veces con acciones identicas, y el split por pares corrige parcialmente este efecto.
- La referencia de replay solo alcanza 12/20 episodios, lo que acota el techo practico de la tarea en el simulador.
- Los checkpoints base sin fine-tuning obtienen 0-1 exitos de 60, de modo que estos pesos no son utilizables sin el ajuste correspondiente.
- Licencia `other` con `license_name: base-model-licenses`: las condiciones concretas dependen de los modelos base (π0.5, DM0.5, VLA-JEPA) y deben revisarse antes de cualquier uso comercial.
- Dos ejecuciones tienen desviaciones declaradas (cambio de hardware a mitad de entrenamiento y reanudacion tras fallo de disco), lo que introduce heterogeneidad menor entre brazos.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; en un modelo de accion el fallo se manifiesta como trayectorias invalidas, no como texto incorrecto.
- El repositorio pesa 115,9 GB y contiene 14 checkpoints; conviene descargar solo la carpeta necesaria con `allow_patterns`.
- Es imprescindible usar los normalizadores guardados en cada checkpoint y la version de LeRobot indicada: commit `eb7a54c6` para π0.5 y VLA-JEPA, y `fea7153a` (PR #4721) para DM0.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matteuscruz/vla-g1-paper
- Dataset de entrenamiento: https://huggingface.co/datasets/matteuscruz/g1-dex1-cylinder-isaac-mujoco
- Replays en MuJoCo: https://huggingface.co/datasets/matteuscruz/g1-dex1-cylinder-mujoco
- Dataset original de Unitree: https://huggingface.co/datasets/unitreerobotics/G1_Dex1_PickPlaceCylinder_Dataset_Sim
- Modelo base π0.5: https://huggingface.co/lerobot/pi05_base
- Modelo base DM0.5: https://huggingface.co/lerobot/dm05_base
- Modelo base VLA-JEPA: https://huggingface.co/lerobot/VLA-JEPA-Pretrain
- Articulo cientifico: en preparacion, sin enlace disponible
- Repositorio de codigo, blog o demo: no disponibles en la informacion proporcionada
