# khb2439/capstone-gr00t-n1d7-lelab-subtask-30k-orin

## Resumen

Este repositorio contiene un conjunto de 15 checkpoints (cada 2.000 pasos) resultantes de un fine-tuning del modelo fundacional de robótica `nvidia/GR00T-N1.7-3B` sobre un dataset propio de manipulación con un robot Piper (tarea "lelab sub-task", 371 episodios, 115.784 frames). Lo desarrolla el usuario `khb2439` como proyecto de fin de máster (capstone) y su interés principal no es el modelo en sí, sino el empaquetado: cada checkpoint incluye pesos en safetensors y los siete grafos ONNX necesarios para compilar motores TensorRT en una Jetson AGX Orin.

El modelo pertenece a la familia GR00T N1.7 de NVIDIA, un modelo visión-lenguaje-acción (VLA) que combina un backbone VLM (en este caso `nvidia/Cosmos-Reason2-2B`) con un cabezal de difusión (DiT) que genera chunks de acciones. El fine-tuning congela el LLM y el ViT, y solo entrena el proyector, el modelo de difusión y la capa de adaptación, lo que explica que los ONNX de backbone sean idénticos entre los 15 checkpoints.

Es relevante porque documenta con detalle un flujo de despliegue edge completo: exportación ONNX, compilación TensorRT en Jetson, servidor de política ZeroMQ y verificación numérica contra PyTorch (coseno ≥ 0,999997 en todos los checkpoints). Es un artefacto muy específico, sin benchmarks de tarea publicados, útil como referencia de ingeniería más que como modelo reutilizable fuera de su embodiment.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone VLM (Cosmos-Reason2-2B) + cabezal de difusión (DiT) + encoders de estado/acción; exportado como 7 subgrafos ONNX (ViT, LLM, VL self-attention, state encoder, action encoder, DiT, action decoder) |
| Parametros totales | 3B (heredados de `nvidia/GR00T-N1.7-3B`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada: instrucción de subtarea en lenguaje natural, 2 cámaras 480×640, estado de 6 dimensiones) |
| Tipos de cuantizacion | BF16 (LLM y resto del pipeline), FP32 (ViT); sin cuantización en la exportación |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés, p. ej. `pick up the barley tea bottle`) |
| Licencia | no disponible en la ficha de HF; derivada de `nvidia/GR00T-N1.7-3B`, cuya licencia se hereda sin modificar |
| Formato de pesos | safetensors (6,9 GB por checkpoint) + ONNX (6,5 GB por checkpoint) + TensorRT `.engine` generado en destino |

## Arquitectura y entrenamiento

El modelo es un VLA de dos etapas: un backbone visión-lenguaje (`nvidia/Cosmos-Reason2-2B`, repositorio con acceso restringido/gated) procesa las dos cámaras y la instrucción de subtarea, y un cabezal de difusión (DiT) genera un chunk de 16 acciones. La salida interna es relativa para `arm_1` (3 DoF) y `arm_2` (2 DoF) y absoluta para `gripper` (1 DoF); el servidor de política reconstruye valores absolutos sumando el estado actual. El embodiment tag es `NEW_EMBODIMENT`.

El fine-tuning se hizo sobre `nvidia/GR00T-N1.7-3B` durante 30.000 pasos con batch 512 en 2 GPU, learning rate 1e-4 con schedule coseno y warmup del 5 %, AdamW con weight decay 1e-5 y state dropout 0,2. Solo se entrenaron el proyector, el modelo de difusión y la capa VLLN; el LLM y el ViT quedaron congelados. El dataset son 371 episodios y 115.784 frames del robot Piper (cámaras `external_camera` y `wrist_camera` a 480×640). Una modificación destacable respecto al checkpoint original: se cambió `letter_box_transform` de `false` a `true` en `config.json` y `processor_config.json` para que el preprocesado del Isaac-GR00T actual coincida con el del código de entrenamiento (padding cuadrado antes de reducir a 256×256); con ello las acciones coinciden con coseno 0,999999.

## Capacidades

- Generación de chunks de acción de 16 pasos para control de un robot manipulador Piper de 6 DoF (dos brazos + pinza).
- Comprensión de instrucciones de subtarea en lenguaje natural en inglés (p. ej. `pick up the barley tea bottle`).
- Fusión de dos vistas de cámara (`external_camera`, `wrist_camera`) con estado propioceptivo para producir acciones.
- Inferencia edge vía TensorRT en Jetson AGX Orin (motores compilados in situ, batch fijo 1, dos cámaras).
- Servidor de política ZeroMQ con protocolo msgpack (`ping`, `reset`, `get_action`, `get_modality_config`) compatible con el cliente `GrootClient` del proyecto capstone.
- No soporta tool calling, agentes multi-paso, visión general, audio ni thinking mode: es un modelo de política robótica, no un LLM conversacional.

## Casos de uso

- Manipulación robótica de pick-and-place: el modelo recibe la instrucción de subtarea y las dos cámaras y devuelve un chunk de 16 acciones absolutas que el controlador del Piper ejecuta; es su caso de uso nativo.
- Despliegue en robot de borde con Jetson AGX Orin: los motores TensorRT se compilan en el propio dispositivo con `build_engines.py` y se sirven con `serve_policy.py` a través de ZeroMQ, sin depender de un servidor x86.
- Investigación en fine-tuning de VLA: los 15 checkpoints cada 2.000 pasos permiten estudiar la evolución del aprendizaje y elegir el punto óptimo según la tarea, reutilizando los motores de backbone entre checkpoints.
- Verificación de pipelines de exportación ONNX→TensorRT: el script `verify_engines.py` compara salidas PyTorch y TensorRT sobre `reference/observation.npz` con coseno y diferencia máxima, útil como test de regresión de despliegue.
- Prototipado de tareas de recogida con instrucciones de subtarea cortas: el modelo fue validado con instrucciones de distinta longitud (cortas y largas) en `checkpoint-30000`.
- Base para un segundo fine-tuning en otro embodiment: al estar los pesos en safetensors y seguir el formato Isaac-GR00T (commit `708617f5`), sirve como punto de partida con `NEW_EMBODIMENT` para un robot distinto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (tasa de éxito, MMLU, HumanEval, GSM8K) en la información disponible. Lo único documentado es la verificación numérica ONNX frente a PyTorch sobre una observación fija:

| Checkpoint | Resultado | Coseno | Diferencia máxima |
|---|---|---|---|
| checkpoint-2000 | PASS | 0,999997 | 0,53 |
| checkpoint-4000 | PASS | 0,999999 | 0,20 |
| checkpoint-6000 | PASS | 0,999999 | 0,24 |
| checkpoint-8000 | PASS | 0,999999 | 0,26 |
| checkpoint-10000 | PASS | 0,999999 | 0,26 |
| checkpoint-12000 | PASS | 0,999999 | 0,38 |
| checkpoint-14000 | PASS | 0,999999 | 0,35 |
| checkpoint-16000 | PASS | 1,000000 | 0,26 |
| checkpoint-18000 | PASS | 0,999999 | 0,19 |
| checkpoint-20000 | PASS | 0,999999 | 0,23 |
| checkpoint-22000 | PASS | 0,999999 | 0,23 |
| checkpoint-24000 | PASS | 0,999999 | 0,24 |
| checkpoint-26000 | PASS | 0,999999 | 0,24 |
| checkpoint-28000 | PASS | 1,000000 | 0,23 |
| checkpoint-30000 | PASS | 1,000000 | 0,24 |

La diferencia máxima se mide sobre valores de acción en un rango aproximado de ±100. La verificación se hizo en x86 con RTX PRO 6000 Blackwell y TensorRT 10.15.1.29; la ejecución real en Jetson AGX Orin no fue validada por el autor en el momento de publicar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo completo ocupa 43,8 GB y cada checkpoint 13,4 GB (6,9 GB de pesos + 6,5 GB de ONNX), lo que da una idea del espacio en disco necesario.
- Plataforma objetivo: Jetson AGX Orin con JetPack 7.2 (Jetson Linux 39.2); JetPack 6.x no está soportado por Isaac-GR00T para Orin.
- GPU de validación: RTX PRO 6000 Blackwell (x86) para compilar y verificar los motores.
- No cabe en GPU de consumo convencional con los pesos completos en BF16/FP32; no se documenta una variante cuantizada para consumer.
- Despliegue: TensorRT (motores compilados con `jetson/build_engines.py`), servidor ZeroMQ (`serve_policy.py`); requiere Isaac-GR00T en el commit `708617f5716c63fc0a327391492ea2b91977ae90`.
- Latencia y throughput: no disponibles; `verify_engines.py` mide latencia en Jetson, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 Piper) | 3B | no disponible | derivada de GR00T N1.7 | repo público, 0 descargas |
| nvidia/GR00T-N1.7-3B | 3B | no disponible | la del repo base | gated en HF |
| nvidia/Cosmos-Reason2-2B | 2B | no disponible | gated | backbone del VLM |
| Otros VLA (p. ej. OpenVLA, π0) | no disponible en la información | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado para un robot Piper concreto, embodiment `NEW_EMBODIMENT`, dos cámaras y 6 DoF; no es un modelo general.
- Sin benchmarks de tasa de éxito en la tarea; la única validación es numérica (ONNX vs PyTorch), no funcional.
- La ejecución en Jetson AGX Orin no fue verificada por el autor; solo se validó en x86 con RTX PRO 6000.
- Requiere acceso gated a `nvidia/Cosmos-Reason2-2B` y `hf auth login` con la cuenta autorizada.
- Dependencia estricta de versiones: JetPack 7.2 y commit concreto de Isaac-GR00T; los motores TensorRT solo funcionan en la máquina y versión donde se compilan.
- Los motores están fijos a batch 1 y dos cámaras; el ViT asume parches 16×16 sobre 256×256.
- Licencia no disponible en la ficha; los pesos derivan de GR00T N1.7 y heredan su licencia sin modificar, por lo que el uso comercial depende de los términos del modelo base.
- Riesgo de alucinación de acciones: al ser un modelo generativo de acciones, puede producir trayectorias inválidas ante observaciones fuera de distribución; no se documentan salvaguardas.
- Idiomas: solo se documentan instrucciones en inglés; no hay soporte multilingüe declarado.
- Repo de 43,8 GB (201 GB si se descargan todos los checkpoints); conviene descargar solo el checkpoint y los ficheros necesarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/khb2439/capstone-gr00t-n1d7-lelab-subtask-30k-orin
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Backbone VLM: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T (commit `708617f5716c63fc0a327391492ea2b91977ae90`)
