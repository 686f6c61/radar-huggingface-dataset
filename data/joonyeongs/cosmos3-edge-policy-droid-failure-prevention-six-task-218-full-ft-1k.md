# joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-218-full-ft-1k

## Resumen

Cosmos3-Edge-Policy-DROID es un fine-tuning completo del generador del modelo de política robótica nvidia/Cosmos3-Edge-Policy-DROID, desarrollado por el usuario joonyeongs sobre la base de NVIDIA. El modelo parte de un transformer de difusión multimodal orientado a la generación de acciones robóticas (action policy) y se ha especializado en seis tareas de manipulación del entorno RoboLab, con énfasis en la prevención de fallos mediante demostraciones dirigidas a errores concretos. Cuenta con 3.859.003.312 parámetros y un repositorio de 9,2 GB en formato safetensors.

El ajuste se realizó sobre un conjunto de 218 episodios exitosos completos (35 de Toy, 38 de Canned Food, 38 de Red Items, 50 de Cartons, 25 de Bottles y 32 de Stack), combinando la ronda 1 de seis tareas con 68 demostraciones de la ronda 2 orientadas a fallos. Se entrenaron 1.000 pasos con un batch global de 64 en 2 GPU A100-80GB durante 6,6 horas, lo que equivale a aproximadamente 0,46 pasadas sobre los inicios elegibles.

Su relevancia radica en que demuestra un flujo reproducible de fine-tuning completo de un modelo de política de difusión para robótica, con receta de entrenamiento, código y dataset publicados. No obstante, el propio autor advierte de que la evaluación en bucle cerrado de éxito de tarea en RoboLab aún no se ha realizado; solo se ha verificado la exportación mediante error absoluto medio de las acciones predichas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión multimodal (Cosmos3, generador + torre de comprensión congelada) |
| Parámetros totales | 3.859.003.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en BF16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (2 shards: `diffusion_pytorch_model-00001-of-00002` y `-00002-of-00002`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo del generador de Cosmos3-Edge-Policy-DROID, un transformer de difusión para generación de acciones robóticas. Se entrenaron todos los pesos del lado del generador: atención, MLP y normalizaciones del generador, `vae2llm`, `llm2vae`, el time embedder, y los límites de acción DROID y el embedding de modalidad. La torre de comprensión y `k_norm_und_for_gen` permanecieron congeladas, usando K/V de texto en caché. El modelo base emplea un VAE Wan2.2 (Wan-AI/Wan2.2-TI2V-5B) que se descarga en inferencia.

El entrenamiento usó 218 episodios de seis tareas RoboLab, con ventanas de trayectoria completa de 32 frames/acciones futuras por inicio (138.865 inicios elegibles). Se ejecutaron 1.000 pasos (~0,46 pasadas) con batch global 64 (2 GPU × 32), LR 2e-5 con warmup lineal de 50 pasos y decaimiento lineal a 0, FusedAdam, BF16, FSDP de 2 vías, activation checkpointing selectivo y `torch.compile`. El hardware fueron 2× A100-80GB durante 6,6 horas. La convención de gripper del dataset es 0=abierto, 1=cerrado (DROID), que el lector invierte internamente; debe servirse con el flip por defecto (sin `--no-flip-gripper`).

## Capacidades

- Generación de acciones robóticas: predice chunks de 32 pasos de posiciones articulares conjuntas a partir de observaciones visuales e instrucciones de tarea.
- Control de políticas de manipulación en el entorno RoboLab, con dominio `droid_lerobot` y condicionamiento a 15 fps.
- Prevención de fallos: el dataset de entrenamiento incluye demostraciones dirigidas a errores concretos en seis tareas.
- Fine-tuning completo del generador con torre de comprensión congelada y K/V de texto en caché.
- Integración con el servidor de evaluación RoboLab (`RobolabPolicyService`) y con `action_policy_server_robolab`.
- Soporte de guiado por intervalo (`--guidance-interval 960 1001`) y formato de prompt JSON.
- Capacidades multimodales heredadas del modelo base Cosmos3 (visión y texto), aunque no se detallan en la información disponible.
- No se documentan tool calling, function calling, agentes multi-paso ni modo thinking en la información disponible.

## Casos de uso

- Manipulación robótica en RoboLab: el modelo sirve como política para las seis tareas entrenadas (Toy, Canned Food, Red Items, Cartons, Bottles, Stack), generando chunks de 32 acciones a 15 fps mediante el servidor `action_policy_server_robolab`.
- Prevención de fallos en tareas de recogida y clasificación: las 68 demostraciones de la ronda 2 están orientadas a errores, lo que permite al modelo aprender a evitar fallos en la colocación de objetos en contenedores.
- Investigación en fine-tuning de modelos de política: la receta completa (dataset, código, configuración TOML, script de lanzamiento) permite reproducir el entrenamiento y adaptarlo a nuevos conjuntos de tareas.
- Evaluación de políticas de difusión: el checkpoint se puede cargar con `RobolabPolicyService` para comparar predicciones de acciones con demostraciones mediante MAE, como hace el autor en su verificación de exportación.
- Desarrollo de pipelines de robótica con DROID: la convención de gripper DROID y el dominio `droid_lerobot` facilitan la integración con infraestructuras basadas en DROID/LeRobot.
- Base para fine-tuning en tareas específicas: al ser un full fine-tuning del generador, sirve como punto de partida para especializar aún más el modelo en tareas de manipulación concretas.
- Prototipado de control robótico en investigación: permite experimentar con políticas de difusión multimodales sin partir del modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito de tarea en la información disponible. El autor incluye una verificación de exportación (no una evaluación de política) con error absoluto medio (MAE) de las acciones predichas frente a las demostradas, en radianes, sobre episodios no usados en entrenamiento:

| Episodio | Frame | Tarea | MAE |
|---|---|---|---|
| 0 | 0 | Put the canned food in the grey bin | 0,0409 |
| 0 | 154 | Put the canned food in the grey bin | 0,0879 |
| 25 | 0 | Put the lizard away in the bin | 0,0712 |
| 25 | 139 | Put the lizard away in the bin | 0,0332 |
| 50 | 0 | Put all the red things in the grey bin | 0,1219 |
| 50 | 326 | Put all the red things in the grey bin | 0,0995 |
| 75 | 0 | Put the cartons that can be recycled in the vertical crate | 0,1393 |
| 75 | 442 | Put the cartons that can be recycled in the vertical crate | 0,0768 |
| | | **Media** | **0,0838** |

Todos los outputs fueron finitos. El autor indica explícitamente que esto no es una medida de éxito de tarea y que el éxito en bucle cerrado en RoboLab no se ha evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 2× A100-80GB con BF16, FSDP y activation checkpointing selectivo.
- GPU recomendadas: A100-80GB o superior para entrenamiento; para inferencia no se especifica, pero el tamaño de 3,86B parámetros en BF16 (~7,7 GB de pesos) sugiere que podría caber en GPU consumer de gama alta con suficiente VRAM, aunque no está confirmado en la información disponible.
- Cabe en GPU consumer: no confirmado; los pesos en BF16 ocupan aproximadamente 7,7 GB, más el VAE Wan2.2 que se descarga en inferencia.
- Opciones de despliegue: servidor `action_policy_server_robolab` del paquete `cosmos_framework`, con `--checkpoint-path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`. También `RobolabPolicyService` para evaluación. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-218-full-ft-1k | 3.859.003.312 | no disponible | OpenMDW-1.1 | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible | no disponible | OpenMDW-1.1 | Hugging Face |
| joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-full-ft-2k | no disponible | no disponible | no disponible | Hugging Face |

El modelo base y la variante de 2k pasos son las alternativas más directas. La variante de 2k pasos usa la misma receta salvo dataset, número de pasos y warmup. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el éxito de tarea en bucle cerrado en RoboLab; la única verificación es el MAE de exportación, que no mide éxito.
- El modelo está entrenado únicamente en seis tareas de RoboLab; no generaliza a otras tareas no presentes en el dataset (Drill y Spoons están excluidos).
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero al ser un modelo de política entrenado con 218 episodios, la cobertura es limitada.
- Restricciones de licencia: OpenMDW-1.1 heredada del modelo base; deben revisarse los términos en https://openmdw.ai/license/1-1/ para uso comercial.
- La convención de gripper debe servirse con el flip por defecto; pasar `--no-flip-gripper` produciría acciones incorrectas.
- El modelo requiere descargar el VAE Wan2.2 (Wan-AI/Wan2.2-TI2V-5B) en inferencia, lo que añade dependencias y latencia.
- Solo difieren del base los shards `transformer/diffusion_pytorch_model-00001-of-00002.safetensors` y `-00002-of-00002.safetensors`; el resto del layout es idéntico al base.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- No se dispone de información sobre idiomas soportados ni sobre cuantizaciones, lo que limita el despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-218-full-ft-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-failure-prevention-six-task-round1-round2-218
- Dataset de verificación de exportación: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-harness-privileged-phases-150
- Variante de 2k pasos: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-full-ft-2k
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
