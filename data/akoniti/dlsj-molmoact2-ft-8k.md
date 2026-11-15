# akoniti/dlsj-molmoact2-ft-8k

## Resumen

`akoniti/dlsj-molmoact2-ft-8k` es un fine-tune mediante LoRA del modelo `allenai/MolmoAct2-SO100_101`, un modelo de vision-lenguaje-accion (VLA) orientado a robótica. Lo desarrolla el usuario akoniti y está pensado para una tarea concreta de manipulación con el brazo robótico SO-101: recoger un bloque Duplo, llevarlo a una cámara de inspección y colocarlo en un cuenco según su color. No es un modelo de propósito general, sino un artefacto de despliegue muy especializado.

El modelo parte de la arquitectura MolmoAct2 de AI2, que combina un LLM con un codificador visual (ViT) y un "action expert" que genera trayectorias de acciones mediante flow matching. El checkpoint publicado corresponde al paso 8000 de un entrenamiento planificado de 12000 pasos sobre 95.656 fotogramas de episodios de robot a 30 Hz, con 4 GPUs en Modal y precisión bf16 mixta.

Es relevante ahora porque ejemplifica el flujo de trabajo moderno de "physical AI": fine-tuning con LoRA de un VLA sobre un robot de bajo coste, exportación a OpenVINO INT8 con RTC para ejecución en el propio robot, y publicación del checkpoint completo junto con la configuración de entrenamiento y despliegue. El repositorio ocupa 22,4 GB y contiene pesos en fp32 en formato de checkpoint Lightning, no safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA MolmoAct2 (LLM + ViT + action expert con flow matching) |
| Parametros totales | 5.589 B (5.589.000.000 aprox., según state_dict del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exportación OpenVINO INT8 + RTC documentada en el repo; el checkpoint se distribuye en fp32 |
| Idiomas soportados | no disponible (prompts de instrucción en inglés, cerrados a tres plantillas) |
| Licencia | other (heredada del modelo base `allenai/MolmoAct2-SO100_101`) |
| Formato de pesos | checkpoint Lightning `.ckpt` (state_dict fp32, 1889 tensores), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base MolmoAct2 es un VLA que combina un transformer de lenguaje con un codificador visual ViT y un módulo "action expert" que predice secuencias de acciones mediante flow matching (10 pasos de integración en inferencia). El fine-tune aplica LoRA de rango 64, alpha 16 y dropout 0,05 sobre las capas de atención y MLP del LLM (`att_proj`, `attn_out`, `ff_proj`, `ff_out`) y sobre el ViT (`wq`, `wk`, `wv`, `wo`, `w1`, `w2`), mientras que el action expert y el proyector visual se entrenan por completo. Los adaptadores LoRA suman 146,6 M parámetros y se distribuyen sin fusionar con los pesos base.

El entrenamiento se realizó sobre el dataset `molmoact2-cal2-456-3stage-20261114`: 453 episodios de 0 a 455 (se descartaron los episodios 77, 131 y 284), 409 de entrenamiento y 44 de validación, 105.382 fotogramas a 30 Hz. Se usó AdamW (0,9/0,95), LR 5e-5 con multiplicador x10 para LoRA, warmup de 200 pasos, grad clip 1,0, `use_random_input_noise=True` y aumento de imagen `Ai2Augment`. El entrenamiento se detuvo en el paso 8000 de 12000 planificados (aproximadamente 2,7 épocas).

## Capacidades

- Generación de acciones de robot de 6 dimensiones (5 articulaciones en grados LeRobot más pinza 0-100) en chunks de 30 acciones.
- Condicionamiento por instrucción de texto, limitado a tres plantillas cerradas: `pick up the {color} brick`, `bring the brick to the inspection camera` y `place the brick in the {color} bowl`.
- Percepción visual con dos cámaras: `wrist` y `top`, a 640x480, con recorte de la cámara superior a 560x480 y redimensionado a 378x378.
- Ejecución en tiempo real con RTC (horizonte 15, guidance 3, máximo 4 grados por tick a 30 Hz).
- Normalización por cuantiles de estado y acción, con buffers q01/q99 incluidos en el checkpoint.
- No soporta tool calling, agentes multi-paso, matemáticas, código ni capacidades multilingües: es un modelo de política robótica, no un LLM de propósito general.

## Casos de uso

- Clasificación de bloques Duplo por color en línea de montaje: el modelo recibe la instrucción de recogida con el color objetivo y genera la trayectoria de aproximación y agarre con la pinza.
- Inspección visual previa a la clasificación: tras la instrucción `bring the brick to the inspection camera`, el modelo posiciona el bloque frente a la cámara superior para su verificación.
- Clasificación por destino en cuencos: con `place the brick in the {orange|purple|yellow} bowl`, el modelo ejecuta la colocación en el recipiente correspondiente.
- Demostración de pipeline completo de physical AI: sirve como referencia para reproducir un flujo de fine-tuning LoRA, exportación a OpenVINO INT8 y despliegue en un SO-101 real.
- Simulación en gemelo digital Isaac: el cliente `MolmoAct2Client` permite validar la política en simulación antes de llevarla al robot físico.
- Investigación en adaptación de VLAs a tareas concretas: el repo incluye `plan.json`, `training-config.json` y los prompts, lo que facilita estudiar el efecto del fine-tuning sobre un VLA base.
- Pruebas de robustez de control en tiempo real: la configuración RTC con límite de 4 grados por tick permite evaluar estabilidad de la política bajo restricciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repo no incluye métricas de éxito de la tarea, tasas de acierto ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 22,4 GB solo para pesos, más activaciones; se recomienda al menos 40 GB para trabajar con holgura.
- GPU recomendadas: A100 40/80 GB o H100 para el checkpoint fp32; el entrenamiento se realizó con 4 GPUs en Modal en bf16 mixto.
- En consumer GPU: no cabe en fp32 en una RTX 4090 (24 GB) sin cuantización; la exportación OpenVINO INT8 documentada en el repo reduce el requisito y está pensada para ejecución en el robot.
- Opciones de despliegue: Physical AI Studio (`deploy/molmoact2/export.py`), cliente Isaac para simulación, y exportación OpenVINO INT8 + RTC según `openvino_rtc_int8_manifest.json`. No hay soporte documentado para vLLM, llama.cpp ni Ollama (no es un LLM de texto).
- Latencia y throughput: no disponibles; la política está diseñada para ejecutarse a 30 Hz con RTC horizonte 15.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `akoniti/dlsj-molmoact2-ft-8k` | 5,589 B (LoRA 146,6 M) | no disponible | Manipulación SO-101 (pick/inspect/sort) | other | Hugging Face, repo 22,4 GB |
| `allenai/MolmoAct2-SO100_101` (base) | no disponible en la información | no disponible | VLA general para SO-100/101 | other | Hugging Face (AI2) |
| `allenai/MolmoAct2` (tokenizer/base general) | no disponible en la información | no disponible | VLA general | other | Hugging Face (AI2) |

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo altamente especializado: solo responde a tres plantillas de prompt exactas y a una tarea concreta; fuera de ese dominio su comportamiento no está garantizado.
- Dependencia de calibración: los resultados dependen de la calibración del seguidor (sha256 `8a3e5e04...`) y de la pose de reposo (26,3; -51,8; 30,1; 73,1; 15,9; 37,7); cambios en el robot pueden degradar la política.
- Checkpoint en fp32 de 22,4 GB en formato Lightning, no safetensors: requiere el modelo base en la caché de HF y el flujo de exportación de Physical AI Studio para cargarse.
- Licencia `other` heredada del modelo base: es necesario revisar los términos de `allenai/MolmoAct2-SO100_101` antes de cualquier uso comercial.
- Riesgo de alucinación de acciones: como política generativa, puede producir trayectorias no válidas; el límite de 4 grados por tick y la pose de reposo son salvaguardas, pero no eliminan el riesgo.
- Entrenamiento incompleto: 8000 de 12000 pasos planificados (~2,7 épocas), por lo que puede no haber convergido del todo.
- El repo se describe como privado y "copiado sin cambios del portátil del robot"; no hay validación pública ni métricas de éxito publicadas.
- Idiomas: no se documenta soporte multilingüe; los prompts están en inglés.

## Enlaces

- Hugging Face: https://huggingface.co/akoniti/dlsj-molmoact2-ft-8k
- Modelo base: https://huggingface.co/allenai/MolmoAct2-SO100_101
- Tokenizer/base general: https://huggingface.co/allenai/MolmoAct2
