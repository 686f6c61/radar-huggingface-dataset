# liwy26/lingbot-vla-v2-6b-robotwin-aloha-agilex

## Resumen

LingBot-VLA 2.0 (6B) — RoboTwin 2.0 / Aloha-AgileX es un ajuste fino supervisado de parámetros completos del modelo base `robbyant/lingbot-vla-v2-6b`, un modelo de visión-lenguaje-acción (VLA) de 6.000 millones de parámetros construido sobre un backbone Qwen3-VL-4B al que se añade un "action expert". Lo publica el usuario `liwy26` en Hugging Face bajo licencia Apache-2.0 y está especializado en manipulación robótica bimanual con el robot Aloha-AgileX dentro del simulador RoboTwin 2.0.

El modelo resuelve el problema de traducir instrucciones en lenguaje natural más observaciones visuales (tres vistas RGB) y el estado del robot (14 dimensiones) en secuencias de acciones motrices: concretamente, chunks de 50 pasos de acciones conjuntas y de pinza de 14 dimensiones. Es relevante porque ofrece un checkpoint listo para usar con el stack de inferencia LingBot-VLA-v2 y porque publica resultados de éxito medidos sobre las 50 tareas del benchmark RoboTwin 2.0, lo que permite evaluar su viabilidad en tareas de manipulación antes de desplegarlo en hardware real.

El ajuste se ha realizado únicamente sobre demostraciones "clean" (50 tareas × 50 demostraciones), lo que se traduce en un rendimiento notablemente superior en escenarios limpios (50,50 % de éxito) que en escenarios con aleatorización visual fuerte (27,40 %). El checkpoint se distribuye en BF16 con 1.708 tensores repartidos en tres shards safetensors que suman aproximadamente 12,77 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); backbone Qwen3-VL-4B + action expert |
| Parametros totales | 6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint publicado); FP32 soportado en el stack de inferencia para comprobaciones de paridad |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards, 1.708 tensores, BF16, ~12,77 GB) |

## Arquitectura y entrenamiento

El modelo es un VLA que combina un backbone de visión-lenguaje Qwen3-VL-4B con un módulo "action expert" que genera las acciones. La entrada está compuesta por tres vistas RGB (`camera_top`, `camera_wrist_left`, `camera_wrist_right`; en el simulador `cam_high`, `cam_left_wrist`, `cam_right_wrist`), un vector de estado del robot de 14 dimensiones y una instrucción en lenguaje natural. La salida es un chunk de 50 pasos de acciones de 14 dimensiones (articulaciones y pinza del Aloha-AgileX), generado mediante 10 pasos de denoising, lo que sugiere un esquema de generación tipo difusión o flow matching para la cabeza de acción.

El entrenamiento consiste en un ajuste fino supervisado de parámetros completos sobre el split "clean" de RoboTwin 2.0 Aloha-AgileX (50 tareas × 50 demostraciones). No se documenta en la información disponible el uso de RLHF, DPO ni el volumen total de tokens. El checkpoint conserva en `config.json` campos de la fase de entrenamiento (`post_training: true` y ajustes de teacher/alignment), pero la configuración autoritativa para inferencia es `lingbotvla_cli.yaml`, que se carga con `post_training: false` y `align_params: {}`. El repositorio incluye estadísticas de normalización de acciones y estado en `assets/norm_stats/robotwin.json` y el mapeo de claves en `configs/robot_configs/robotwin.yaml`.

## Capacidades

- Generación de acciones robóticas bimanuales: produce chunks de 50 pasos de acciones de 14 dimensiones para el robot Aloha-AgileX.
- Percepción multi-vista: procesa simultáneamente tres cámaras RGB (vista superior y dos muñecas).
- Comprensión de instrucciones en lenguaje natural para condicionar la política de control.
- Integración de estado propioceptivo del robot (14 dimensiones) junto con la observación visual.
- Ejecución de tareas de manipulación en el simulador RoboTwin 2.0 (50 tareas evaluadas).
- Servido como política remota mediante servidor WebSocket (`deploy/websocket_policy_server.py`) con cliente de referencia incluido.
- Inferencia en BF16 y FP32 (esta última para comprobaciones de paridad numérica).
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso explícito, agentes, audio ni modo "thinking".

## Casos de uso

- Evaluación de políticas VLA en simulación: el checkpoint se puede cargar directamente en el launcher de RoboTwin (`experiment/robotwin/start_robotwin_infer_and_eval.sh`) apuntando `--model_path` al directorio del modelo, lo que permite reproducir los resultados publicados y comparar variantes sobre las 50 tareas.
- Investigación en manipulación bimanual: sirve como punto de partida para estudiar el efecto de la aleatorización visual, ya que el propio autor reporta la brecha entre el split `clean` (50,50 %) y `randomized` (27,40 %).
- Ajuste fino posterior (fine-tuning) sobre dominios propios: al ser un ajuste de parámetros completos con licencia Apache-2.0, se puede reentrenar sobre demostraciones específicas de un robot o de un conjunto de tareas concreto.
- Desarrollo de stacks de inferencia remota: el servidor WebSocket incluido permite separar el cómputo del modelo del bucle de simulación o del controlador del robot, útil para prototipos cliente-servidor.
- Verificación de integridad de checkpoints en pipelines MLOps: el repositorio incluye `SHA256SUMS` y `examples/checkpoint_check.py` para validar los pesos antes de desplegarlos.
- Comparación de precisión numérica: la posibilidad de ejecutar en BF16 y FP32 permite medir el impacto de la precisión en el éxito de la política, algo que el autor señala como materialmente distinto entre ambas configuraciones.
- Base para conversión a otros formatos: existen conversiones comunitarias a LeRobot (`lerobot/lingbot_vla_v2_robotwin`, `miracle-techlink/lingbot-vla-v2-6b-lerobot-robotwin`), lo que facilita integrar el modelo en ecosistemas de entrenamiento y evaluación alternativos.

## Benchmarks y rendimiento

Resultados autodeclarados sobre las 50 tareas de RoboTwin 2.0 Aloha-AgileX (BF16, sin truncamiento, 20 episodios por tarea y setting, semillas 100000–100019):

| Setting | Éxito | Episodios |
|---|---:|---:|
| `clean` | 50,50 % | 505 / 1000 |
| `randomized` | 27,40 % | 274 / 1000 |
| Global | 38,95 % | 779 / 2000 |

Advertencias del propio autor sobre el protocolo: se trata de un autotest de 20 episodios por tarea, no del protocolo de 100 episodios por tarea usado en las publicaciones de RoboTwin, por lo que los números no son directamente comparables con resultados publicados. El subconjunto de cinco episodios de la ejecución de 20 episodios obtuvo un 45,80 % global, mientras que una ejecución separada de cinco episodios obtuvo un 41,60 %; 69 de los 100 pares tarea-setting difirieron en 1–2 episodios, por lo que cabe esperar una variación de unos pocos puntos entre ejecuciones con este tamaño de muestra.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 12,77 GB en pesos, por lo que se necesita al menos esa cantidad más el overhead de activaciones y del backbone Qwen3-VL-4B; una GPU de 24 GB (RTX 3090/4090) es el mínimo razonable para BF16, y 16 GB solo sería viable con cuantización, no documentada en la información disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para BF16; para FP32 se requiere el doble de memoria de pesos, lo que descarta GPUs de consumo de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en BF16, siempre que el resto del stack (Qwen3-VL-4B como tokenizer/processor y el servidor de política) quepa junto con las activaciones.
- Opciones de despliegue: stack oficial LingBot-VLA-v2 (`python -m deploy.lingbot_vla_v2_policy`), servidor WebSocket incluido (`deploy/websocket_policy_server.py`), y conversiones comunitarias a LeRobot. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El modelo usa 10 pasos de denoising por chunk de 50 acciones, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liwy26/lingbot-vla-v2-6b-robotwin-aloha-agilex | 6B | no disponible | 50,50 % clean / 27,40 % randomized (autotest 20 ep/tarea) | Apache-2.0 | Hugging Face |
| robbyant/lingbot-vla-v2-6b (base) | 6B | no disponible | no disponible en la información proporcionada | Apache-2.0 | Hugging Face |
| lerobot/lingbot_vla_v2_robotwin | 6B | no disponible | pesos upstream sin cambios (fp32) | no disponible | Hugging Face |
| miracle-techlink/lingbot-vla-v2-6b-lerobot-robotwin | 6B | no disponible | no disponible | no disponible | Hugging Face |

Las tres alternativas son variantes o conversiones del mismo modelo base, no modelos independientes; no se dispone de datos de rendimiento de las conversiones ni de otros VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo con demostraciones "clean": el rendimiento cae de 50,50 % a 27,40 % bajo aleatorización visual fuerte, por lo que no es adecuado para entornos reales con iluminación, texturas o posiciones muy variables sin un ajuste adicional.
- Los resultados son un autotest de 20 episodios por tarea y no son comparables con el protocolo estándar de 100 episodios de RoboTwin; la varianza entre ejecuciones es de varios puntos.
- Diferencia material entre BF16 y FP32 reportada por el autor: las comprobaciones de paridad pueden requerir FP32, lo que duplica los requisitos de memoria.
- `config.json` conserva campos de entrenamiento (`post_training: true`, ajustes de teacher/alignment); la configuración autoritativa es `lingbotvla_cli.yaml`. Cargar el checkpoint con `config.json` puede producir un comportamiento incorrecto.
- Las rutas de `lingbotvla_cli.yaml`, `assets/` y `configs/` son relativas al directorio de trabajo: el servidor debe lanzarse desde la raíz del checkpoint.
- Dependencia de un tokenizer/processor externo (Qwen3-VL-4B-Instruct) que debe descargarse por separado y referenciarse con `QWEN3VL_PATH`.
- Especializado en el robot Aloha-AgileX y en el simulador RoboTwin 2.0; no se documenta su transferencia a hardware real ni a otras morfologías.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación específicos; al ser un modelo de acción, el riesgo principal es la ejecución de acciones erróneas en el robot.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y las dependencias (Qwen3-VL) deben verificarse por separado.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liwy26/lingbot-vla-v2-6b-robotwin-aloha-agilex
- Modelo base: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Código del stack de inferencia: https://github.com/Robbyant/lingbot-vla-v2
- Dataset RoboTwin 2.0: https://huggingface.co/datasets/TianxingChen/RoboTwin2.0
- Conversión LeRobot (lerobot): https://huggingface.co/lerobot/lingbot_vla_v2_robotwin
- Conversión LeRobot (miracle-techlink): https://huggingface.co/miracle-techlink/lingbot-vla-v2-6b-lerobot-robotwin
- Tokenizer/processor Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
