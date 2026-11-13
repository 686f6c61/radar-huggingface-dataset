# joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-lora-r32-a64-2k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para robótica desarrollado por NVIDIA, diseñado para generar secuencias de acciones de control a partir de observaciones visuales e instrucciones en lenguaje natural. Este repositorio concreto, publicado por el usuario joonyeongs, es un ajuste fino mediante LoRA del checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID`, orientado específicamente a la prevención de fallos en seis tareas del entorno de evaluación RoboLab sobre el conjunto de datos DROID.

El ajuste se ha realizado sobre 150 episodios de demostración (25 por tarea) extraídos del dataset `joonyeongs/cosmos3-edge-failure-prevention-200`, cubriendo las tareas Toy, Canned Food, Red Items, Cartons, Bottles y Stack. Se excluyen explícitamente `ToolsPickingDrillTask` y `SpoonsInPotTask`. El entrenamiento consistió en 2.000 pasos con LoRA de rango 32 y alpha 64 sobre el generador del modelo base, con los adaptadores fusionados en los pesos exportados.

El modelo tiene 3.859.003.312 parámetros y un tamaño de repositorio de 9,2 GB. Es relevante para investigadores en robótica que necesiten un punto de partida afinado para políticas de manipulación con prevención de fallos, aunque conviene subrayar que no se ha publicado evaluación de éxito en bucle cerrado (closed-loop) y que el autor solo reporta una comprobación de exportación con error absoluto medio de 0,0826 rad en la predicción de chunks de acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de política basado en Cosmos3 (difusión, `cosmos3_omni`); LoRA fusionado sobre el generador del checkpoint base |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible; condicionamiento con chunk de acciones de 32 pasos a 15 fps |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente BF16 por el entrenamiento, no confirmado) |
| Idiomas soportados | no disponible (instrucciones en inglés en los ejemplos de tareas) |
| Licencia | openmdw1.1-license (heredada del modelo base) |
| Formato de pesos | safetensors (`transformer/diffusion_pytorch_model-0000{1,2}-of-00002.safetensors`), layout idéntico al base |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`), un policy model de difusión para robótica que combina un transformer generador con un VAE (Wan2.2 TI2V-5B) para la codificación visual. La inferencia descarga dicho VAE de `Wan-AI/Wan2.2-TI2V-5B`. El ajuste se aplicó como LoRA de rango 32 y alpha 64 (escala 2,0) sobre las proyecciones q/k/v/o del generador, las capas MLP up/down, los módulos `vae2llm` y `llm2vae`, y las fronteras de acción DROID. Los adaptadores se fusionaron en los pesos base para la exportación mediante `W += (alpha/rank) · B @ A`, de modo que no se requiere carga PEFT.

El entrenamiento utilizó 6 tareas × 25 episodios con 32 frames/acciones futuras por inicio, totalizando 92.009 inicios elegibles, durante 2.000 pasos (checkpoint `iter_000002000`), lo que equivale a aproximadamente 1,39 pasadas sobre los inicios elegibles. Se empleó batch global de 64 (2 GPUs × 32), tasa de aprendizaje 1e-4 con warmup lineal de 100 pasos y decaimiento lineal a 0, FusedAdam, precisión BF16, FSDP de 2 vías, checkpointing selectivo de activaciones y `torch.compile`. El cómputo total fue de 13,2 horas en 2× A100-80GB. El código está disponible en la rama `robolab-droid-train-edge-privileged-phases` (commit `20ccacf`) del repositorio `joonyeongs/cosmos-framework`, con la receta `examples/toml/sft_config/robolab_droid_edge_lora.toml`.

## Capacidades

- Generación de chunks de acciones de 32 pasos de posiciones articulares conjuntas a partir de observaciones visuales e instrucciones de tarea.
- Condicionamiento multimodal: entrada de imágenes (frames de cámara) más instrucción en lenguaje natural.
- Control robótico de manipulación orientado a prevención de fallos en tareas de recogida y clasificación de objetos.
- Especialización en seis tareas concretas de RoboLab: Toy, Canned Food, Red Items, Cartons, Bottles y Stack.
- Integración con el servidor de evaluación RoboLab (`action_policy_server_robolab`) mediante protocolo de servicio.
- Dominio `droid_lerobot` con condicionamiento a 15 fps, heredado del modelo base.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; es un modelo de política robótica, no un LLM conversacional.

## Casos de uso

- Evaluación de políticas de manipulación en RoboLab: servir el checkpoint con `action_policy_server_robolab` en el puerto 8000 y consultarlo con frames del entorno para medir éxito en bucle cerrado en las seis tareas afinadas.
- Investigación en prevención de fallos: el ajuste se entrenó con demostraciones dirigidas a evitar fallos, útil para estudiar cómo el fine-tuning con ejemplos negativos o correctivos afecta a la robustez de la política.
- Baseline para comparativas de fine-tuning: al compartir receta con la variante de 8 tareas, permite aislar el efecto del subconjunto de tareas y de la exclusión de `ToolsPickingDrillTask` y `SpoonsInPotTask`.
- Prototipado de control de brazo robótico en simulación: los chunks de 32 pasos a 15 fps permiten generar trayectorias de posición articular para tareas de pick-and-place en entornos tipo DROID.
- Estudio de eficiencia de LoRA en políticas de difusión: el repositorio documenta rango, alpha, pasos y hardware, lo que facilita reproducir y variar la configuración (rango, alpha, número de pasos) sobre el mismo dataset.
- Verificación de pipelines de exportación: el script de comprobación de exportación con MAE sobre posiciones articulares sirve para validar que un checkpoint fusionado carga y produce salidas finitas antes de lanzar evaluaciones costosas.
- Docencia y divulgación: ejemplo completo y reproducible de ajuste fino de un policy model con FSDP, BF16 y `torch.compile` en 2× A100-80GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito en tarea (closed-loop) en la información disponible. El autor indica explícitamente que la comprobación de exportación no es una medida de éxito. Se reproduce a continuación la tabla de error absoluto medio (MAE, en radianes) de los chunks predichos frente a las acciones demostradas, sobre episodios no usados en el entrenamiento:

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the canned food in the grey bin | 0,0538 |
| 0 | 154 | Put the canned food in the grey bin | 0,0844 |
| 25 | 0 | Put the lizard away in the bin | 0,0696 |
| 25 | 139 | Put the lizard away in the bin | 0,0298 |
| 50 | 0 | Put all the red things in the grey bin | 0,1029 |
| 50 | 326 | Put all the red things in the grey bin | 0,0721 |
| 75 | 0 | Put the cartons that can be recycled in the vertical crate | 0,1620 |
| 75 | 442 | Put the cartons that can be recycled in the vertical crate | 0,0865 |
| | | **Media** | **0,0826** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,86 mil millones de parámetros, en BF16 los pesos ocupan aproximadamente 7,7 GB; en FP16 lo mismo; en cuantización de 8 bits, unos 3,9 GB; en 4 bits, unos 1,9 GB (estimaciones teóricas, no confirmadas por el autor). A ello hay que sumar el VAE Wan2.2 TI2V-5B que se descarga en inferencia.
- GPU recomendadas: el autor entrenó en 2× A100-80GB; para inferencia no se especifica. Una GPU con al menos 16-24 GB de VRAM debería ser suficiente para los pesos en BF16 más el VAE, aunque no está verificado.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 24 GB (RTX 3090, RTX 4090) para los pesos del transformer, pero el VAE adicional y el servidor RoboLab pueden elevar el requisito; no confirmado.
- Opciones de despliegue: servidor oficial `python -m cosmos_framework.scripts.action_policy_server_robolab` con `--checkpoint-path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un policy model de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (6 tareas, LoRA r32/a64, 2k) | 3.859.003.312 | chunk de 32 acciones a 15 fps | 6 tareas RoboLab | openmdw1.1-license | Hugging Face, 0 descargas |
| `nvidia/Cosmos3-Edge-Policy-DROID` (base) | 3.859.003.312 (mismo layout) | chunk de 32 acciones a 15 fps | DROID general | openmdw1.1-license | Hugging Face (NVIDIA) |
| Variante de 8 tareas del mismo autor (failure-prevention 2k) | 3.859.003.312 | chunk de 32 acciones a 15 fps | 8 tareas RoboLab | openmdw1.1-license | Hugging Face (joonyeongs) |
| Otros policy models de manipulación (p. ej. RT-2, OpenVLA) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de la misma categoría fuera del ecosistema Cosmos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado (closed-loop) en RoboLab; la única métrica publicada es el MAE de exportación, que no mide éxito de tarea.
- El ajuste cubre solo seis tareas; no generaliza a `ToolsPickingDrillTask` ni a `SpoonsInPotTask`, excluidas deliberadamente del entrenamiento.
- Dataset pequeño: 150 episodios, 25 por tarea, con 92.009 inicios elegibles y solo ~1,39 pasadas sobre los datos; riesgo de sobreajuste a las condiciones de las demostraciones.
- El MAE de exportación varía notablemente entre episodios (de 0,0298 a 0,1620 rad), lo que sugiere sensibilidad a la fase de la tarea y a la escena.
- No se documentan sesgos conocidos ni evaluación de robustez ante cambios de iluminación, posición de cámara u objetos no vistos.
- Riesgo de alucinación de acciones no aplicable en el sentido de LLM, pero sí de generar trayectorias inválidas fuera de la distribución de entrenamiento.
- Licencia OpenMDW-1.1 heredada del base; conviene revisar sus términos para uso comercial antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-13), lo que indica falta de validación por parte de la comunidad.
- La inferencia requiere descargar el VAE Wan2.2 TI2V-5B, lo que añade dependencia externa y consumo de disco y VRAM.
- No se especifican idiomas soportados; las instrucciones de tarea están en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-lora-r32-a64-2k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-failure-prevention-200
- Dataset de verificación de exportación: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-harness-privileged-phases-150
- Código de entrenamiento (rama): https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Receta de entrenamiento: `examples/toml/sft_config/robolab_droid_edge_lora.toml` (en el repositorio anterior)
- VAE utilizado en inferencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
