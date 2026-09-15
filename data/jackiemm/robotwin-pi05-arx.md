# JackieMM/robotwin-pi05-arx

## Resumen

`JackieMM/robotwin-pi05-arx` no es un modelo de lenguaje al uso, sino un repositorio de código que documenta y automatiza el flujo completo para llevar la política visión-lenguaje-acción (VLA) pi0.5 de OpenPI desde la simulación RoboTwin hasta un robot real ARX X5 de doble brazo. El autor, JackieMM, publica scripts, manifiestos de configuración y guías operativas, pero no aloja pesos, datos reales, claves SSH ni credenciales: todo el estado variable (rutas de servidor, IP, GPU, checkpoints) se inyecta mediante ficheros de entorno.

La cadena descrita es: captura ROS con cámaras RealSense en una RTX 4090, conversión al formato HDF5 oficial de RoboTwin, transformación a LeRobot, cálculo de estadísticas de normalización, ajuste fino con LoRA en una RTX 5090 y, finalmente, reproducción offline e inferencia en el robot real en modo de solo lectura. El repositorio fija un ABI concreto de 14 dimensiones de estado y acción, tres claves de cámara y una configuración oficial de RoboTwin (`pi05_base_aloha_full_sim_arx-x5_seed_0`).

Su relevancia actual es práctica: ofrece un camino reproducible y con barreras de seguridad explícitas para adaptar un modelo fundacional de robótica a hardware concreto, e incluye resultados de smoke tests reales (una pérdida de 1,8683 en el paso 0 y una inferencia offline de 14,1 s para un chunk de 50×14 acciones). No se publican parámetros, licencia ni idiomas del modelo base, y no se han ejecutado aún publicación de acciones por ROS ni control CAN sobre el robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) pi0.5 de OpenPI, ajustada con LoRA; no se detalla el backbone en la información proporcionada |
| Parametros totales | no disponible (el repositorio no publica pesos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no se documenta ventana de texto); horizonte de acción observado de 50 pasos, con chunk de salida de forma (50, 14) |
| Tipos de cuantizacion | no disponible (el ajuste se realiza con LoRA; no se documentan formatos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoints Orbax (JAX/Flax) para entrenamiento; los pesos no se distribuyen en el repositorio. Datos en HDF5 de RoboTwin y LeRobotDataset v2.1/v3.0 |
| Dimension del estado/accion | 14: `[left_joint_0..5, left_gripper, right_joint_0..5, right_gripper]` |
| Claves de camara | `cam_high`, `cam_left_wrist`, `cam_right_wrist` (RealSense RGB-only, 640x480, sin profundidad) |
| Configuracion oficial de referencia | `pi05_base_aloha_full_sim_arx-x5_seed_0` (RoboTwin) |
| Checkpoint base | `pi05_droid` (openpi-assets), solo válido para smoke test en software |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo, solo el procedimiento de ajuste. Según la información disponible, se parte del checkpoint DROID de pi0.5 (`pi05_droid`) y se aplica un ajuste fino con LoRA sobre un único dispositivo, con `batch-size 1` y `fsdp-devices 1`. El uso del checkpoint DROID se limita explícitamente a pruebas de humo en software: la documentación advierte que no puede emplearse para accionar directamente el ARX X5.

El pipeline de datos es estricto respecto al ABI: captura ROS en la 4090, conversión al HDF5 oficial de RoboTwin, conversión a LeRobot, cálculo de estadísticas de normalización y entrenamiento. Entrenamiento, evaluación offline y despliegue deben compartir el mismo orden de características, la misma tasa de refresco, la misma calibración de pinza y las mismas estadísticas de normalización. OpenPI usa `AlohaInputs`, que ante la ausencia de la cámara de muñeca izquierda genera automáticamente una imagen negra y marca `image_mask=false`, de modo que el entrenamiento con dos cámaras no duplica la imagen del brazo izquierdo.

El dataset real empleado en el último entrenamiento documentado procede de `LQ_20260915_1_LeRobotDatasetV3.0/trainable`, con 71 episodios y 25 920 fotogramas; se seleccionaron los episodios 0 a 49 (50 episodios, 18 191 fotogramas) conservando solo `camera_h` y `camera_r`. El ajuste se lanzó en la GPU1 de la 4090 con `XLA_PYTHON_CLIENT_ALLOCATOR=platform`, CUDA 12.1 y `--xla_gpu_enable_triton_gemm=false`. También se validó el flujo con un dataset público de ARX X5 (`heyuan1993/record-test-arxx5_bimanual`, 1 episodio, 1734 fotogramas, 30 Hz, 14 dimensiones y 4 vídeos RGB de 640x480).

## Capacidades

- Generación de acciones motoras de doble brazo en 14 dimensiones, con horizonte de acción de 50 pasos y salida de forma (50, 14).
- Política visomotora: consume observaciones de hasta tres cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) y estado proprioceptivo de 14 dimensiones.
- Ajuste fino eficiente con LoRA sobre un único dispositivo, con verificación de checkpoint Orbax tras cada paso.
- Inferencia offline reproducible: conversión de un fotograma LeRobot a HDF5 mediante `scripts/lerobot_frame_to_hdf5.py` y ejecución sobre un checkpoint cargado.
- Herramientas de validación de datos: `scripts/validate_public_arx.py` comprueba finitud de `observation.state` y `action`, decodifica vídeo y calcula la diferencia máxima absoluta entre acción y estado.
- Modo de observación de solo lectura (`run_pi05_live.py --observe-only`) que recoge observaciones y acciones sin enviar comandos al robot.
- Captura y recolección interactiva con control de episodios (`collect N` sin sobrescribir episodios previos) y teclas de control 3/4/1 (iniciar/guardar/descartar) y 2 (GO_HOME, prohibido durante captura e inferencia).
- Soporte de tool calling, agentes, multi-step reasoning, visión general, audio y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Ajuste fino de políticas VLA en hardware de gama alta para robótica manipulativa: el repositorio documenta el ciclo completo desde la captura ROS hasta el checkpoint LoRA, con parámetros como `--steps`, `--batch-size` y `--fsdp-devices` explícitos.
- Investigación en imitación bimanual: el ABI de 14 dimensiones (12 articulaciones más dos pinzas) y las tres cámaras fijas permiten entrenar políticas de doble brazo con un contrato de datos estable y verificable.
- Validación de datasets antes de entrenar: la herramienta `validate_public_arx.py` detecta problemas como acciones no finitas o discrepancias grandes entre acción y estado (0,32998 de diferencia máxima absoluta en el dataset público probado).
- Conversión de pipelines simulados a reales: el script `install_robotwin_official.sh` fija el commit oficial de RoboTwin y del submódulo XPolicyLab, lo que permite reproducir el entorno de simulación antes de tocar hardware.
- Despliegue con barreras de seguridad en robots industriales: el orden obligatorio `doctor`, `validate-ros`, `convert`, `stats`, `offline`, `observe` actúa como puerta de seguridad antes de habilitar cualquier acción física.
- Pruebas de humo de bajo coste en una sola GPU consumer: el ajuste LoRA con `batch-size 1` y el uso de `XLA_PYTHON_CLIENT_ALLOCATOR=platform` permiten verificar memoria y forma de los tensores en una RTX 4090 sin OOM.
- Evaluación offline de políticas antes del despliegue: el paso de inferencia offline genera un chunk de acciones completo y verifica que todos los valores son finitos, lo que permite descartar checkpoints defectuosos sin riesgo físico.
- Estandarización de equipos de laboratorio: la configuración mediante `config/arx.env` y `topic_manifest.yaml` evita incrustar IP, GPU o credenciales en el código, algo útil en entornos con direcciones cambiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos aportados son métricas de smoke test, no comparables con MMLU, HumanEval o GSM8K por tratarse de una política robótica:

| Metrica | Valor |
|---|---|
| Pérdida en el paso 0 (checkpoint DROID, batch 1) | 1,8683 |
| Norma del gradiente en el paso 0 | 11,8023 |
| Checkpoint guardado | Orbax en `.../ARX-public-real-smoke-lora-platform/0` |
| Inferencia offline (una pasada, 4090 GPU1) | ~14,1 s para un chunk de acciones (50, 14), todos finitos |
| Diferencia máxima absoluta acción-estado (dataset público ARX X5) | ~0,32998 |
| Episodios y fotogramas del dataset real | 50 episodios, 18 191 fotogramas (de 71 episodios y 25 920 fotogramas totales) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; en el smoke test se ejecutó con `CUDA_VISIBLE_DEVICES=1` en una RTX 4090 y fue necesario `XLA_PYTHON_CLIENT_ALLOCATOR=platform` para evitar OOM en el primer intento.
- GPU empleadas: RTX 4090 (24 GB) para captura ROS, validación, smoke de entrenamiento e inferencia offline; RTX 5090 prevista para el entrenamiento LoRA formal.
- Entrenamiento: `batch-size 1`, `fsdp-devices 1`; el repositorio advierte que el índice de GPU de la máquina de entrenamiento (5090) no es necesariamente 2 y debe configurarse con `TRAIN_GPU` tras ejecutar `nvidia-smi`.
- Cabe en GPU consumer: sí, al menos en RTX 4090 con el asignador XLA configurado; el repositorio no documenta requisitos para GPUs de menor VRAM.
- Opciones de despliegue: JAX/OpenPI con checkpoints Orbax, entorno virtual `$OPENPI/.venv`, RoboTwin oficial como simulador, ROS 2 (domain 195, contenedor `arx-can-safety`, raíz `/opt/arx/ARX_X5`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ~14,1 s por inferencia offline de un chunk de 50×14 en la 4090 GPU1. No se documenta throughput en bucle cerrado.
- Red: para el bucle cerrado real se exige conexión cableada estable o 5 GHz fiable, además de pruebas de watchdog del botón 1, tiempos de espera y recorte de acciones.
- Entorno CUDA: CUDA 12.1 con `XLA_FLAGS="--xla_gpu_cuda_data_dir=/usr/local/cuda-12.1 --xla_gpu_enable_triton_gemm=false"`; los controladores antiguos de OpenPI requieren el `ptxas` de CUDA 12.1.

## Comparativa con modelos similares

La información disponible no incluye parámetros, licencia ni métricas de modelos alternativos, por lo que la comparación se limita a los artefactos citados en el propio repositorio:

| Alternativa | Parametros | Contexto | Licencia | Uso descrito |
|---|---|---|---|---|
| `JackieMM/robotwin-pi05-arx` (este repositorio) | no disponible | no disponible | no disponible | Ajuste LoRA de pi0.5 sobre ARX X5 real |
| Checkpoint base `pi05_droid` (openpi-assets) | no disponible | no disponible | no disponible | Solo smoke test en software; no puede accionar el ARX X5 |
| Configuración RoboTwin `pi05_base_aloha_full_sim_arx-x5_seed_0` | no disponible | no disponible | no disponible | Entrenamiento en simulación antes del traslado a real |
| Dataset público `heyuan1993/record-test-arxx5_bimanual` | no aplica | no aplica | no disponible | 1 episodio, 1734 fotogramas, 30 Hz, 14 dimensiones, 4 cámaras RGB 640x480 |

Comparativas con otros modelos VLA (por ejemplo, familias tipo OpenVLA o GR00T) no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, por lo que el uso comercial queda sin base jurídica explícita.
- El repositorio no contiene pesos ni datos reales; sin los checkpoints y datasets externos no es reproducible por sí solo.
- El checkpoint DROID solo sirve para smoke test: la documentación prohíbe explícitamente usarlo para accionar el ARX X5.
- No se ha ejecutado control real: no se han realizado publicación de acciones por ROS, control CAN ni bucle cerrado con el robot; `observe` sigue siendo una puerta de solo lectura.
- Calibración de pinza obligatoria: los valores `closed/open` de `topic_manifest.example.yaml` son marcadores de posición y no pueden usarse en captura formal sin medición en el puesto.
- Desajuste de frecuencias: los datos antiguos de «bread» mostraron problemas de pocas muestras, pinzas desequilibradas y desajuste entre entrenamiento a 50 Hz y ejecución a 20 Hz.
- Tamaño de dataset insuficiente: con los 10 episodios antiguos el resultado fue deficiente; se recomienda un mínimo de 50 episodios y reservar de 5 a 10 para validación.
- Infraestructura frágil: las direcciones IP de los servidores no son permanentes (`10.10.10.172`, `172.16.32.191`, `169.254.152.125` son históricas), hay que verificar red y autorización SSH y no reutilizar claves temporales.
- Dependencia de red en el entrenamiento: OpenPI consulta referencias de datasets de Hugging Face; sin salida a internet en la máquina de entrenamiento el proceso falla, por lo que hay que precalentar la caché local.
- Restricciones de red física: en bus USB2 no debe recuperarse la configuración `1280x720@30` con profundidad; la configuración validada es triple RGB-only a 640x480 sin depth.
- Formato de las acciones del dataset público: las dimensiones 7 y 14 (pinzas) están en el rango bruto aproximado 0 a 3,5, no normalizadas a `[0,1]`, por lo que no pueden alimentar directamente `convert_pi05_hdf5.py` ni la política real sin calibración de campo.
- Riesgo de fallo visomotor: al tratarse de una política de acción y no de un modelo generativo de texto, el modo de fallo relevante no es la alucinación lingüística sino la emisión de acciones incorrectas; de ahí la exigencia de watchdog, tiempos de espera y recorte de acciones antes del bucle cerrado.
- Sesgos conocidos y limitaciones de idioma: no disponible en la información proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JackieMM/robotwin-pi05-arx
- Dataset de entrenamiento: https://huggingface.co/datasets/JackieMM/LQ-20260915-1-first50-2cam
- Dataset público de validación (ARX X5, citado en la model card): `heyuan1993/record-test-arxx5_bimanual` en Hugging Face
- Documentación interna citada en el repositorio, no enlazada públicamente: `server/arx_direct_control/ARX_ROBOTWIN_STANDARD_PIPELINE.md`, `server/arx_direct_control/ARX_ROBOTWIN_COLLECTION_GUIDE.md`, `server/arx_direct_control/ROBOTWIN_OFFICIAL_ARX_PLAN.md`, `server/ARX_PI05_SERVER_SETUP.md`
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos corresponden a un servicio de correo electrónico no relacionado).
