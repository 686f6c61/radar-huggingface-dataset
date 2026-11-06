# Noctis12138/turbovla-rokae-block-cup

## Resumen

TurboVLA Rokae v3 es un modelo de política visomotora (VLA, Vision-Language-Action) para control robótico bimanual, publicado por el usuario Noctis12138 en Hugging Face. Está entrenado específicamente para una única tarea de manipulación con dos brazos Rokae AR5 equipados con pinzas paralelas: colocar un bloque dentro de una taza con el brazo izquierdo y luego depositar la taza sobre un plato con el brazo derecho. El modelo forma parte de una familia de checkpoints del mismo autor (turbovla-rokae-toothbrush, turbovla-rokae-6task) que comparten receta de entrenamiento y paquete de despliegue, variando únicamente el conjunto de datos de la tarea.

El checkpoint se distribuye como un único archivo `.pth` de aproximadamente 1,8 GB que contiene pesos, configuración y estadísticas de normalización. La arquitectura combina un backbone visual DINOv3-L (ViT-L/16, inicializado desde `dinov3-vitl16-pretrain-lvd1689m`), codificación de instrucciones con BERT (congelado durante el entrenamiento) y una cabeza de acción denominada ActionMap que predice chunks de 50 pasos de acciones relativas a la pose medida. El modelo está pensado para inferencia en tiempo real sobre el robot real, con un consumo de VRAM de aproximadamente 3 GB.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un checkpoint de investigación de un solo task, entrenado con 51 demostraciones, con validación únicamente offline (error medio de posición de 2,4 mm sobre ventanas de entrenamiento) y que, según la propia model card, **no ha sido probado todavía en el robot real**. No dispone de descargas ni likes en el momento de la consulta y su licencia es "other", con restricciones heredadas de la licencia de DINOv3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con backbone visual DINOv3-L (ViT-L/16) + codificador de texto BERT + cabeza de acción ActionMap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (instrucción de texto única, no conversacional) |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en precisión de entrenamiento, `.pth`) |
| Idiomas soportados | no disponible (prompt de tarea en inglés, fijo y literal) |
| Licencia | other (DINOv3 License para el backbone visual; BERT Apache-2.0; terceros en `code/third_party/licenses/`) |
| Formato de pesos | `.pth` (PyTorch, checkpoint único `checkpoints/turbovla_step_10000.pth`, ~1,8 GB) |

## Arquitectura y entrenamiento

El modelo sigue un esquema VLA clásico de dos torres de entrada y una cabeza de acción. La percepción visual se apoya en DINOv3-L (ViT-L/16) inicializado desde el checkpoint `dinov3-vitl16-pretrain-lvd1689m` y ajustado durante el entrenamiento; la instrucción de lenguaje se codifica con BERT, que permanece congelado. La cabeza ActionMap predice un chunk de 50 acciones relativas a la pose medida actual del robot, con normalización por paso de predicción usando percentiles 0,1 %/99,9 % calculados exclusivamente sobre las estadísticas de esta tarea (`checkpoints/stats.json`). La entrada incluye tres cámaras (cabeza y dos muñecas) y el estado articular medido.

El entrenamiento utiliza 51 demostraciones de la tarea `dual_arm_block_cup_placement` extraídas del dataset `rokae_bimanual_6task`, con aumento de imagen al estilo pi0.5 (recorte y rotación en cámara de cabeza, color jitter) y relleno al final de los episodios. Se entrenó con batch global 64 (2 GPUs × 4 por GPU × acumulación de gradientes 8) durante 10 000 pasos, con 300 pasos de warmup y learning rate constante de 5e-5. La model card indica que GroundingDINO se usa como inicialización, sin más detalle sobre su rol exacto en el pipeline. No se documenta el número de tokens de entrenamiento ni la composición completa del dataset más allá de las 51 demostraciones de esta tarea.

## Capacidades

- Control robótico bimanual de manipulación: genera comandos de acción para dos brazos Rokae AR5 con pinzas paralelas en una tarea concreta de pick-and-place en dos fases.
- Predicción de chunks de acción de 50 pasos relativos a la pose medida, lo que permite ejecución con control de horizonte y suavizado (el paquete de despliegue incluye un runner "ensemble hybrid smooth").
- Condicionamiento por instrucción de lenguaje: acepta un prompt de tarea fijo y literal (`place the block into the cup with the left arm, then place the cup onto the plate with the right arm`), almacenado en `deploy/task_prompts.json`.
- Percepción multivista: consume flujo de tres cámaras (cabeza y dos muñecas) junto con el estado articular medido.
- Inferencia en tiempo real vía servicio de política local (servidor de modelo + verificación de servicio en el paquete de despliegue).
- No soporta tool calling, function calling, agentes multi-paso genéricos, razonamiento simbólico, matemáticas, generación de código ni diálogo multilingüe. Es un modelo de política, no un LLM de propósito general.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales fuera del pipeline robótico descrito.

## Casos de uso

- **Validación de una tarea bimanual concreta en laboratorio**: ejecutar la secuencia bloque → taza → plato sobre dos Rokae AR5 con el prompt fijo y el runner `11_run_policy_autonomous_ensemble_hybrid_smooth.sh`, comparando contra la línea base de 6 tareas del 27-10 con idéntica configuración de pinza y `MAX_STEPS=0`.
- **Recolección de datos de evaluación real**: el paquete de despliegue está diseñado para grabar tres flujos de vídeo más `*.csv`, `*.joints.csv` y `*.json` por episodio, lo que permite construir un conjunto de evaluación reproducible de al menos 10 intentos por condición.
- **Punto de partida para fine-tuning de tareas de pick-and-place**: al compartir receta y código con `turbovla-rokae-toothbrush` y `turbovla-rokae-6task`, sirve como plantilla para entrenar variantes con nuevas instrucciones y demostraciones sobre el mismo hardware.
- **Pruebas de integración del stack de despliegue**: los scripts `00_check_environment.sh`, `05_offline_tests.sh`, `01_start_model_server.sh` y `04_verify_policy_service.sh` permiten validar el entorno (Python ≥ 3.10, torch, transformers ≥ 4.56, ~3 GB de VRAM) antes de tocar el robot.
- **Investigación en normalización por paso de predicción**: el uso de estadísticas por paso con percentiles 0,1 %/99,9 % y chunks de 50 acciones es un diseño reproducible que se puede estudiar o comparar frente a alternativas de normalización global.
- **Banco de pruebas de condicionamiento por lenguaje en robótica**: el prompt literal y la congelación de BERT permiten aislar el efecto del backbone visual (DINOv3-L ajustado) frente al componente lingüístico en el rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes de robótica como LIBERO o CALVIN) en la información disponible. El único dato de rendimiento reportado es una autoevaluación offline en la máquina de entrenamiento, sobre 32 ventanas aleatorias del propio conjunto de entrenamiento, alimentando frames crudos y estado medido directamente a `TurboPolicy.infer`:

| Metrica (autochequeo offline) | TurboVLA Rokae block-cup (10k pasos) | TurboVLA Rokae toothbrush (10k pasos) |
|---|---|---|
| Error medio de posición en chunk de 50 pasos | 2,4 mm | 3,8 mm |
| Coincidencia de apertura/cierre de pinza con la demostración | 99,8 % | 99,8 % |

Estos valores miden ajuste al conjunto de entrenamiento y verifican que el checkpoint y el cargador del paquete de despliegue funcionan; el autor indica explícitamente que **no representan la tasa de éxito en el robot real**, que aún no se ha medido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB según la model card, en el formato de checkpoint distribuido (`.pth`, sin cuantización documentada).
- GPU recomendadas: no se especifican modelos concretos; el entrenamiento se realizó con 2 GPUs (batch 4 por GPU y acumulación 8). Para inferencia, cualquier GPU con ≥ 4 GB de VRAM libre debería ser suficiente en teoría, pero no hay datos publicados de latencia ni throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 4 GB o más (p. ej. GTX 1650 4 GB, RTX 3050, RTX 4060), aunque no está verificado por el autor.
- Opciones de despliegue: paquete propio `deploy/` con servidor de modelo (`01_start_model_server.sh`), verificación de servicio (`04_verify_policy_service.sh`) y runner de política (`11_run_policy_autonomous_ensemble_hybrid_smooth.sh`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Entorno: Python ≥ 3.10, torch, `transformers>=4.56` (por soporte de DINOv3), numpy, scipy, pillow, torchvision.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TurboVLA Rokae block-cup (este) | VLA bimanual, single-task | no disponible (~1,8 GB checkpoint) | no aplica | 1 tarea, 51 demos | other (DINOv3) | Hugging Face, 0 descargas |
| TurboVLA Rokae toothbrush | VLA bimanual, single-task | mismo stack | no aplica | 1 tarea (cepillado) | other (DINOv3) | Hugging Face, mismo autor |
| TurboVLA Rokae 6task | VLA bimanual, multi-task | mismo stack | no aplica | 6 tareas | other (DINOv3) | Hugging Face, mismo autor |

No se dispone de información sobre benchmarks comparativos frente a otros modelos VLA de la literatura (π0, π0.5, OpenVLA, RT-2) en los materiales proporcionados; la receta de aumento de imagen se inspira en π0.5, pero no se aportan métricas cruzadas.

## Limitaciones y advertencias

- **Sin validación en robot real**: el autor declara explícitamente "尚未上真机" (aún no probado en el robot físico). El único dato disponible es el ajuste offline sobre el propio conjunto de entrenamiento, que no predice la tasa de éxito real.
- **Sobreajuste esperable**: 51 demostraciones y 10 000 pasos de entrenamiento sobre una única tarea implican un riesgo alto de sobreajuste y de baja generalización ante cambios de posición de objetos, iluminación o cámaras. La model card insiste en no mover la escena ni las cámaras para mantener la comparabilidad.
- **Prompt rígido**: la instrucción debe coincidir literalmente con la cadena entrenada; no hay evidencia de robustez ante paráfrasis.
- **Sesgos**: no documentados. Al entrenarse con un dataset propio y reducido, puede heredar sesgos de las demostraciones (posiciones, velocidades, estrategias de agarre del operador).
- **Alucinación en el sentido robótico**: riesgo de generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento; el paquete de despliegue mitiga parcialmente con confirmación de pinza (`GRIPPER_CONFIRM_STEPS`, `GRIPPER_COMMIT_*`) y parada manual (`MAX_STEPS=0`).
- **Licencia restrictiva**: licencia "other" con herencia de la DINOv3 License sobre el backbone visual. Es imprescindible revisar `code/assets/dinov3-vitl16-pretrain-lvd1689m/LICENSE.md` y `code/third_party/licenses/` antes de cualquier uso comercial. Los datos de entrenamiento no se distribuyen.
- **Reproducibilidad**: el dataset `rokae_bimanual_6task` no está incluido en el repositorio, por lo que no es posible reproducir el entrenamiento a partir del checkpoint publicado.
- **Idioma**: no hay soporte multilingüe declarado; el prompt está en inglés y el modelo no es conversacional.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el 2026-10-29, sin historial de uso comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/Noctis12138/turbovla-rokae-block-cup
- Modelo hermano (single-task, cepillo de dientes): https://huggingface.co/Noctis12138/turbovla-rokae-toothbrush
- Modelo hermano (6 tareas): https://huggingface.co/Noctis12138/turbovla-rokae-6task
- Licencia DINOv3 (referenciada en el repo): `code/assets/dinov3-vitl16-pretrain-lvd1689m/LICENSE.md`
- Licencias de terceros (referenciadas en el repo): `code/third_party/licenses/`
- Paquete de despliegue (referenciado en el repo): `deploy/README.md`
- Script de entrenamiento (referenciado en el repo): `code/train_1019.sh`
