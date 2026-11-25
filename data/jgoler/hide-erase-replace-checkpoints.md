# jgoler/hide-erase-replace-checkpoints

## Resumen

Hide, Erase, or Replace? Checkpoints es una coleccion de checkpoints de politicas de difusion (Diffusion Policy) publicada por el autor jgoler (Goler, Patel, Pan y Song, Stanford University, 2026) como material de respaldo del articulo *Hide, Erase, or Replace? An Empirical Study of Cross-Gripper Policy Transfer*. El repositorio no contiene un modelo generativo de lenguaje, sino pesos de control motor entrenados por imitacion para tareas roboticas de manipulacion, con el objetivo de estudiar la transferencia de politicas entre distintos efectores finales (pinzas o grippers).

Cada checkpoint corresponde a una variante experimental concreta: la politica preentrenada en el gripper de origen, la misma ajustada con 25 demostraciones del gripper objetivo, un control entrenado desde cero con esas 25 demostraciones y las politicas oracle entrenadas con el conjunto completo de un solo gripper. La arquitectura es una Diffusion Policy basada en UNet condicionada por imagen, con horizonte de accion configurable mediante Hydra, y los pesos se distribuyen en formato PyTorch Lightning (`.ckpt`) junto con `config.yaml`, `overrides.yaml` y `normalizer.pkl`.

Su relevancia es metodologica: permite reproducir el estudio de transferencia cruzada entre grippers y reutilizar los normalizadores y configuraciones exactas de cada ejecucion. El repositorio ocupa 79,3 GB y agrupa 22 checkpoints de entre 1,91 y 3,12 GiB cada uno. La licencia esta pendiente de aprobacion (`license-pending`), por lo que no se permite uso comercial hasta que el autor la declare.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy con UNet, condicionada por imagen, horizonte de accion configurable via Hydra |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje); horizonte de accion configurable en `config.yaml` |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch Lightning en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo de robotica) |
| Licencia | other / `license-pending` (sin licencia declarada, compartido de forma privada a la espera de aprobacion del laboratorio) |
| Formato de pesos | PyTorch Lightning `.ckpt`, acompanado de `config.yaml`, `overrides.yaml` y `normalizer.pkl` |
| Tamano del repositorio | 79,3 GB (22 checkpoints de 1,91 a 3,12 GiB) |
| Pipeline | robotics |
| Tareas cubiertas | Cup saucer, Push-T, Drawer opening, Cup to lid, Cup saucer (estudio de camara GoPro a iPhone), Recycling |
| Datos de demostracion | Publicados en `jgoler/hide-erase-replace` (dataset) |

## Arquitectura y entrenamiento

Cada checkpoint es una Diffusion Policy: un modelo de difusion que genera secuencias de acciones roboticas condicionadas por observaciones visuales, implementado con una UNet y entrenado con PyTorch Lightning. El horizonte de accion y el resto de hiperparametros quedan fijados en el `config.yaml` resuelto de cada ejecucion, y las ejecuciones incluyen los `overrides.yaml` de Hydra empleados en la linea de comandos, lo que permite reconstruir la configuracion exacta. Los normalizadores de accion y observacion (`normalizer.pkl`) se ajustaron sobre los datos de entrenamiento de cada variante.

El entrenamiento es por imitacion supervisada sobre demostraciones teleoperadas, sin datos in-the-wild. El diseno experimental compara cuatro regimenes: preentrenamiento en el gripper de origen (Default UMI + UMI-FT, con 592 demostraciones en Cup saucer y 1.572 en Push-T), ajuste fino con 25 demostraciones del gripper objetivo (UMI-Air, UMI-FT o iPhUMI segun la tarea), entrenamiento desde cero con esas mismas 25 demostraciones, y politicas oracle entrenadas con el conjunto completo de un solo gripper (por ejemplo, 469 demostraciones UMI-Air en Cup saucer). El estudio tambien incluye transferencia entre camaras (GoPro a iPhone, 286 demostraciones de origen) y entre morfologias de mano (mano humana a XHand, 142 demostraciones). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Control motor por imitacion en tareas de manipulacion robotica: Cup saucer, Push-T, apertura de cajones, Cup to lid y Recycling.
- Generacion de secuencias de accion multimodales mediante difusion, adecuada para tareas con ambiguedad en la trayectoria.
- Transferencia cruzada entre grippers: politicas preentrenadas en un efector final y adaptadas a otro con solo 25 demostraciones.
- Transferencia cruzada de camara: variante GoPro a iPhone en la tarea Cup saucer.
- Transferencia cruzada de morfologia: politica preentrenada con demostraciones de mano humana para su uso con la mano robotica XHand.
- Politicas zero-shot a partir del preentrenamiento en el gripper de origen (checkpoint `push_t/pretrain/` en la epoca 60).
- Reproducibilidad completa: configuracion Hydra resuelta, overrides y normalizadores incluidos por checkpoint.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico ni capacidades multilingues, por no ser un modelo de lenguaje.

## Casos de uso

- Reproduccion del estudio de transferencia entre grippers: cargar los checkpoints `pretrain`, `finetune-25`, `scratch-25` y `oracle-*` de cada tarea para replicar las comparaciones del articulo con los mismos normalizadores y configuraciones.
- Evaluacion de estrategias de adaptacion con pocos datos: comparar el ajuste fino con 25 demostraciones frente al entrenamiento desde cero en las mismas 25 demostraciones para medir la ganancia real del preentrenamiento.
- Punto de partida para nuevas tareas de manipulacion: reutilizar la politica preentrenada en Default UMI + UMI-FT (592 o 1.572 demostraciones) como inicializacion y ajustar con las demostraciones propias del nuevo gripper.
- Investigacion en transferencia de dominio visual: emplear la variante `cup_saucer_gopro` para estudiar el efecto del cambio de camara (GoPro a iPhone) en politicas de difusion.
- Estudio de transferencia de morfologia mano-robot: usar `recycling/pretrain/` (142 demostraciones de mano humana) como base para experimentos con la XHand.
- Analisis de robustez y limites del preentrenamiento cruzado: el conjunto de checkpoints oracle y from-scratch permite aislar cuanto del rendimiento proviene de los datos de origen y cuanto del ajuste fino.
- Docencia y formacion en robotica de imitacion: los ficheros `config.yaml` y `overrides.yaml` sirven como referencia practica de configuracion de Diffusion Policy con Hydra y PyTorch Lightning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia los resultados del articulo *Hide, Erase, or Replace? An Empirical Study of Cross-Gripper Policy Transfer* (Goler, Patel, Pan, Song; Stanford University, 2026), pero no incluye cifras numericas de exito, MSE ni comparativas en el texto proporcionado. Los unicos valores numericos disponibles son las perdidas de entrenamiento anotadas en el nombre de cada checkpoint (por ejemplo, `train_loss=0.010` en `cup_saucer/finetune-25/` o `val_action_mse_error_all=0.001` en `push_t/pretrain/`), que no constituyen benchmarks de rendimiento en tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; cada checkpoint pesa entre 1,91 y 3,12 GiB, por lo que la inferencia en precision de entrenamiento requiere al menos esa cantidad de memoria mas el coste del grafo de la UNet y de las observaciones visuales.
- GPU recomendadas: no especificadas por el autor. Por el tamano de los checkpoints, una GPU consumer con 8-12 GB de VRAM (por ejemplo, RTX 3060, 4070) es un punto de partida razonable para inferencia; para entrenamiento o ajuste fino conviene una GPU de datacenter (A100, H100) o una consumer de gama alta con 24 GB (RTX 4090).
- Cabe en GPU consumer: probablemente si, dado el tamano de los pesos (1,91-3,12 GiB), aunque no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: los checkpoints son de PyTorch Lightning y se cargan con el codigo de Diffusion Policy; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hide, Erase, or Replace? Checkpoints | Diffusion Policy (UNet) para robotica | no disponible | no aplica | `license-pending` | Hugging Face, 22 checkpoints |
| Diffusion Policy (original, Cheng et al.) | Diffusion Policy (UNet) para robotica | no disponible | no aplica | MIT (repositorio de referencia) | Codigo y pesos en el repositorio oficial |
| ACT (Action Chunking Transformer) | Transformer para imitacion robotica | no disponible | no aplica | MIT (repositorio de referencia) | Codigo y pesos en el repositorio oficial |
| OpenVLA | VLA basado en LLM | 7B | no disponible | permisiva (modelo abierto) | Hugging Face |

La comparacion cuantitativa de rendimiento no esta disponible en la informacion proporcionada. La diferencia principal de esta coleccion frente a Diffusion Policy original es el enfasis en transferencia cruzada de gripper, camara y morfologia, con variantes controladas (pretrain, finetune-25, scratch-25, oracle) que no suelen publicarse juntas.

## Limitaciones y advertencias

- Licencia pendiente: `license-pending` sin licencia declarada; el autor indica que se comparte de forma privada a la espera de aprobacion del laboratorio, por lo que no hay permiso claro para uso comercial ni para redistribucion.
- Sesgo de dominio: los datasets no contienen datos in-the-wild; las politicas se entrenaron con las tareas, escenas, camaras y grippers concretos del estudio y pueden tener eficacia limitada en escenas de despliegue nuevas.
- Riesgo de sobreajuste al entorno de entrenamiento: el rendimiento fuera de las condiciones de laboratorio no esta caracterizado en la informacion disponible.
- Sin datos de benchmarks publicados en la model card: no es posible estimar la tasa de exito en tarea a partir de la informacion proporcionada.
- Los checkpoints son especificos de cada gripper y camara; reutilizarlos con otro hardware requiere ajuste fino y recalibracion del normalizador.
- No apto para tareas de lenguaje, razonamiento o generacion de texto: es un modelo de control motor.
- Algunas carpetas no incluyen todos los ficheros auxiliares (por ejemplo, `push_t/oracle-default-umi/` solo trae `config.yaml`), lo que puede complicar la reproduccion exacta de esas ejecuciones.
- El repositorio ocupa 79,3 GB, lo que exige planificar el almacenamiento antes de la descarga completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jgoler/hide-erase-replace-checkpoints
- Dataset de demostraciones: https://huggingface.co/datasets/jgoler/hide-erase-replace
- Articulo de referencia: *Hide, Erase, or Replace? An Empirical Study of Cross-Gripper Policy Transfer* (Goler, Patel, Pan, Song; Stanford University, 2026); no se proporciona URL en la informacion disponible.
- Repositorio de Diffusion Policy: no disponible en la informacion proporcionada.
- Demo o blog del autor: no disponible en la informacion proporcionada.
