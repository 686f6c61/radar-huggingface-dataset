# showlab/Show-Harness-VLMs

## Resumen

Show-Harness VLMs es una colección de seis adaptadores LoRA publicados por el laboratorio showlab que convierten un modelo de vision-lenguaje (VLM) en un controlador de robot. La interfaz es deliberadamente mínima: el modelo recibe dos vistas de cámara y emite un único token semántico de acción perteneciente a un vocabulario de solo nueve tokens. Cada unidad de acción equivale a una traslación de 2 cm idéntica en todos los montajes, de modo que los datos reales y los simulados pueden mezclarse sin reescalado.

El paquete incluye cinco adaptadores entrenados con datos de robot real que solo se diferencian en el backbone (Qwen3.5-0.8B, 2B, 4B y 9B, más gemma-4-E4B-it), lo que lo convierte en una comparativa limpia de escalado de modelo: mismos datos, mismos hiperparámetros. El sexto adaptador es una política de simulación única que cubre simultáneamente los simuladores RoboLab y ManiSkill, en lugar de una política por simulador.

El interés actual del proyecto radica en su planteamiento de "solo un agente VLM puede jugar con robots": no se entrena una arquitectura específica de visión-lenguaje-acción, sino que se adapta un VLM genérico mediante LoRA para producir tokens de acción. El repositorio de adaptadores ocupa 1,3 GB, se distribuye bajo licencia Apache-2.0 (salvo el adaptador derivado de Gemma) y requiere el repositorio Show-Harness para el servicio y el despliegue en bucle cerrado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre modelos vision-language transformer; el backbone lo aporta el modelo base |
| Parámetros totales | No aplica al adaptador: pesos LoRA de 87 MB a 346 MB sobre modelos base de 0,8B a 9B (ver tabla de adaptadores) |
| Parámetros activos | No disponible; no se documenta que los modelos base sean MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; solo se distribuyen adaptadores en safetensors, sin variantes GGUF, AWQ ni GPTQ documentadas |
| Idiomas soportados | No disponible; la salida está restringida a un vocabulario de 9 tokens de acción |
| Licencia | Apache-2.0 en los cinco adaptadores Qwen3.5; `gemma4_e4b` se rige por los Gemma Terms of Use |
| Formato de pesos | safetensors (adaptadores LoRA), librería `peft` |
| Tamaño del repositorio | 1,3 GB |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 0 descargas, 9 likes |
| Fecha de creación / actualización | 2026-09-01 / 2026-09-10 |

Adaptadores incluidos:

| Carpeta | Modelo base | Corpus | Épocas | Tamaño | Licencia |
|---|---|---|---|---|---|
| `qwen3_5_0_8b` | Qwen/Qwen3.5-0.8B | real | 40 | 87 MB | Apache-2.0 |
| `qwen3_5_2b` | Qwen/Qwen3.5-2B | real | 40 | 135 MB | Apache-2.0 |
| `qwen3_5_4b` | Qwen/Qwen3.5-4B | real | 40 | 260 MB | Apache-2.0 |
| `qwen3_5_9b` | Qwen/Qwen3.5-9B | real | 40 | 346 MB | Apache-2.0 |
| `gemma4_e4b` | google/gemma-4-E4B-it | real | 40 | 311 MB | Gemma Terms of Use |
| `qwen3_5_2b_sim` | Qwen/Qwen3.5-2B | sim | 30 | 135 MB | Apache-2.0 |

## Arquitectura y entrenamiento

Los adaptadores no modifican la arquitectura del backbone: se aplica LoRA con r=64, alpha=128, dropout 0,05 y target en todas las capas, manteniendo congelada la torre de visión. La receta es idéntica en los seis adaptadores: learning rate 1e-4 con scheduler coseno y warmup ratio 0,1, precisión bf16, DeepSpeed ZeRO-2 y batch efectivo de 32. El entrenamiento se realizó con LLaMA-Factory. La salida es un único token semántico sobre un vocabulario de solo nueve tokens, por lo que todos los backbones ajustan sobradamente el conjunto de entrenamiento y la comparación entre ellos debe hacerse por tasa de éxito en bucle cerrado, no por curvas de entrenamiento.

El corpus real consta de 7.933 muestras (5.070 de Franka y 2.863 de AgileX) repetidas durante 40 épocas, lo que da 9.920 pasos. El corpus de simulación consta de 13.753 muestras (7.813 de RoboLab y 5.940 de ManiSkill) durante 30 épocas, es decir 12.900 pasos. Las demostraciones de origen están en Show-Harness-Data: 164 episodios reales (Franka y AgileX, 17 tareas) y 230 simulados (RoboLab y ManiSkill), con cada observación emparejada exactamente con un token de acción. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

El proyecto hace explícitos dos contratos que fallan en silencio. El primero es la plantilla de chat: cada carpeta incluye un `chat_template.jinja` que reproduce lo que se renderizó durante el entrenamiento, no la plantilla oficial del modelo base; la plantilla oficial de Qwen3.5 emite un bloque de pensamiento vacío tras el turno del asistente incluso con `enable_thinking=false`, mientras que la de entrenamiento no emite nada, de modo que servir la plantilla equivocada mantiene las respuestas pero las saca de distribución. El segundo es la convención de dirección: todas las direcciones siguen la vista cenital exocéntrica del montaje Franka, y como el montaje AgileX observa en primera persona, desplegar allí exige intercambiar `MV_FWD` y `MV_BACK`; Franka y simulación no necesitan conversión.

## Capacidades

- Percepción visual con dos vistas de cámara simultáneas como entrada.
- Salida de un único token semántico de acción, con un vocabulario de solo nueve tokens.
- Control de robot con unidades de acción normalizadas: cada unidad equivale a 2 cm de traslación en todos los montajes.
- Ejecución de políticas en bucle cerrado sobre robot real en los montajes Franka y AgileX.
- Una única política de simulación que cubre ambos simuladores, RoboLab y ManiSkill.
- Transferencia simulación-a-realidad sin reescalado de acciones, gracias a la unidad común de 2 cm.
- Escalado de backbone documentado de 0,8B a 9B parámetros con datos e hiperparámetros idénticos.
- Servicio multi-adaptador sobre un mismo modelo base (Qwen3.5-2B tiene variantes real y sim).
- No se documentan en la información disponible: tool calling o function calling, razonamiento multi-paso orientado a agentes de texto, generación de texto general, capacidades multilingües, visión general, audio ni modo de pensamiento.

## Casos de uso

- Manipulación robótica real con brazo Franka: el adaptador `qwen3_5_2b` o `qwen3_5_9b` se sirve con vLLM y se conecta a `scripts/run_real_mvtoken.py` con `configs/robot_franka_ft.yaml` para ejecutar tareas de las 17 documentadas (5.070 muestras de entrenamiento proceden de este montaje).
- Despliegue en el montaje AgileX: al observar en primera persona, requiere intercambiar `MV_FWD` y `MV_BACK` respecto de la convención Franka antes de enviar las acciones al robot.
- Evaluación en simulación: una sola política (`qwen3_5_2b_sim`) cubre RoboLab y ManiSkill, lo que evita mantener una política por simulador en pipelines de validación.
- Estudio de escalado de backbone: los cinco adaptadores reales comparten corpus e hiperparámetros, de modo que sirven para medir cómo varía la tasa de éxito en bucle cerrado entre 0,8B, 2B, 4B, 9B y gemma-4-E4B.
- Mezcla sim-to-real en un mismo entrenamiento: la normalización de 2 cm por unidad permite combinar demostraciones reales y simuladas sin reescalar las acciones, útil cuando faltan episodios reales de una tarea.
- Servicio de inferencia con vLLM: el script `scripts/serve_vlm.sh` permite levantar el modelo base con uno o varios adaptadores LoRA cargados, seleccionando la política con `--model` y la versión de prompt `--version v3`.
- Recolección de datos y etiquetado de demostraciones: cada observación debe quedar emparejada con exactamente un token de acción, lo que simplifica la anotación frente a esquemas de acción continua.
- Investigación sobre VLM como política: permite estudiar si un backbone de propósito general adaptado con LoRA puede sustituir a arquitecturas específicas de visión-lenguaje-acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la comparación entre adaptadores debe hacerse por tasa de éxito en bucle cerrado (closed-loop success rate) y no por curvas de entrenamiento, pero no incluye cifras de esa métrica ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- El adaptador en sí es pequeño: entre 87 MB y 346 MB en safetensors. El coste real de memoria lo determina el modelo base, que debe cargarse junto al adaptador.
- Estimación de VRAM para inferencia en bf16 (sin cuantizar el backbone, incluyendo torre de visión y caché KV): en torno a 4-6 GB para el backbone de 0,8B, 8-10 GB para el de 2B, 12-16 GB para el de 4B y 22-28 GB para el de 9B. Son estimaciones por tamaño de parámetros, no cifras publicadas por el autor.
- `gemma4_e4b` no permite estimar VRAM con los datos disponibles, ya que no se documenta el total de parámetros del modelo base.
- GPU de consumo: los adaptadores de 0,8B y 2B son viables en tarjetas de 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4070); el de 4B encaja en 16-24 GB (RTX 4080, RTX 4090); el de 9B requiere 24 GB o cuantización.
- GPU de centro de datos: A100, H100 o L40S para servir varios adaptadores en paralelo sobre la misma instancia del modelo base.
- Despliegue: el proyecto usa vLLM como ruta de servicio (`scripts/serve_vlm.sh` activa un entorno `.venv-vllm`), con PEFT/LoRA para los adaptadores. No se documentan rutas oficiales para llama.cpp, Ollama ni TGI; usar esos motores exigiría convertir los adaptadores a GGUF, algo no soportado explícitamente en la información disponible.
- Latencia y throughput: no disponibles. Como dato cualitativo, la generación se reduce a un único token de acción sobre un vocabulario de nueve tokens, lo que limita el coste de decodificación por paso.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada: no hay cifras de benchmarks ni de rendimiento de otras propuestas de visión-lenguaje-acción con las que contrastar. La comparativa posible con los datos disponibles es interna al propio repositorio, ya que cinco adaptadores reales comparten corpus e hiperparámetros y solo cambian de backbone.

| Adaptador | Modelo base | Corpus | Épocas | Pasos | Tamaño | Licencia |
|---|---|---|---|---|---|---|
| `qwen3_5_0_8b` | Qwen3.5-0.8B | real (7.933 muestras) | 40 | 9.920 | 87 MB | Apache-2.0 |
| `qwen3_5_2b` | Qwen3.5-2B | real (7.933 muestras) | 40 | 9.920 | 135 MB | Apache-2.0 |
| `qwen3_5_4b` | Qwen3.5-4B | real (7.933 muestras) | 40 | 9.920 | 260 MB | Apache-2.0 |
| `qwen3_5_9b` | Qwen3.5-9B | real (7.933 muestras) | 40 | 9.920 | 346 MB | Apache-2.0 |
| `gemma4_e4b` | gemma-4-E4B-it | real (7.933 muestras) | 40 | 9.920 | 311 MB | Gemma Terms of Use |
| `qwen3_5_2b_sim` | Qwen3.5-2B | sim (13.753 muestras) | 30 | 12.900 | 135 MB | Apache-2.0 |

## Limitaciones y advertencias

- No es un VLM de propósito general: la salida está restringida a nueve tokens de acción y el modelo está entrenado para control robótico, no para conversación ni generación de texto.
- Riesgo de fallo silencioso por plantilla de chat: usar la plantilla oficial de Qwen3.5 en lugar del `chat_template.jinja` incluido introduce un bloque de pensamiento vacío tras el turno del asistente y desplaza la distribución, sin que la inferencia falle de forma visible.
- Riesgo de fallo silencioso por convención de dirección: en el montaje AgileX hay que intercambiar `MV_FWD` y `MV_BACK`; omitirlo produce movimientos invertidos sin error aparente.
- Compatibilidad de prompt: todos los adaptadores se entrenaron con el prompt unificado v3, por lo que deben servirse con `--version v3`.
- Cobertura de datos limitada: 164 episodios reales en 17 tareas y dos montajes (Franka y AgileX), más 230 episodios simulados en RoboLab y ManiSkill. El comportamiento fuera de esa distribución de tareas y montajes no está documentado.
- Sesgos conocidos: no se documentan análisis de sesgo, pero la política hereda las limitaciones y los sesgos visuales de los datasets de demostración y del backbone VLM subyacente.
- Riesgo de alucinación: aunque la salida se restringe a tokens de acción, no se documenta ningún mecanismo de verificación de seguridad o de detección de acciones inválidas antes de enviarlas al robot.
- Licencia: los cinco adaptadores Qwen3.5 son Apache-2.0, pero `gemma4_e4b` deriva de `google/gemma-4-E4B-it` y se rige por los Gemma Terms of Use. La etiqueta de licencia a nivel de repositorio no puede expresar ambas, por lo que hay que comprobar la licencia del adaptador concreto antes de un uso comercial.
- Idiomas, longitud de contexto y tipos de cuantización no están documentados, lo que dificulta planificar despliegues con requisitos concretos de contexto o de memoria.
- Validación externa escasa: el repositorio registra 0 descargas y 9 likes, por lo que no hay evidencia de uso independiente en el momento de redactar esta ficha.
- El despliegue en bucle cerrado depende del repositorio Show-Harness, que es quien aporta la ruta de lanzamiento con vLLM, el ensamblado del prompt y el mapeo de tokens a movimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/showlab/Show-Harness-VLMs
- Paper (arXiv:2609.10522): https://arxiv.org/abs/2609.10522
- Código: https://github.com/showlab/Show-Harness
- Dataset: https://huggingface.co/datasets/showlab/Show-Harness-Data
- Página del proyecto: https://showlab.github.io/Show-Harness/
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base gemma-4-E4B-it: https://huggingface.co/google/gemma-4-E4B-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
