# joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-218-full-ft-2k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política robótica (policy model) desarrollado por NVIDIA como parte de la familia Cosmos3, orientado a la generación de acciones de manipulación a partir de observaciones visuales e instrucciones en lenguaje natural. Este repositorio concreto es un ajuste fino completo del generador realizado por el usuario joonyeongs sobre el checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID`, entrenado específicamente para seis tareas del entorno RoboLab con énfasis en la prevención de fallos.

El modelo parte de una arquitectura Cosmos3 Omni (etiquetada como `cosmos3_omni`), con 3.859.003.312 parámetros totales en formato safetensors y un tamaño de repositorio de 9,2 GB. El ajuste fino se realizó sobre 218 episodios de demostración exitosa distribuidos en seis tareas (Toy, Canned Food, Red Items, Cartons, Bottles y Stack), con 138.865 ventanas de inicio elegibles y 2.000 pasos de entrenamiento.

Su relevancia radica en que demuestra un flujo completo de especialización de un modelo de política generalista de NVIDIA hacia un conjunto reducido de tareas de manipulación robótica, incluyendo datos dirigidos a evitar modos de fallo. No obstante, el propio autor advierte que no se ha evaluado el éxito en bucle cerrado (closed-loop success) en RoboLab, por lo que las métricas publicadas corresponden únicamente a una comprobación de exportación y no a una evaluación de política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 Omni (policy model; generador de difusión con torre de comprensión congelada) |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (layout del checkpoint base, `transformer/diffusion_pytorch_model-0000{1,2}-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del generador sobre `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`). Se entrenaron todos los pesos del lado del generador: atención, MLP y normas del generador, `vae2llm`, `llm2vae`, el embedder temporal, las fronteras de acción DROID y el embedding de modalidad. La torre de comprensión y `k_norm_und_for_gen` permanecieron congeladas, con K/V de texto en caché. El modelo utiliza el VAE Wan2.2 (`Wan-AI/Wan2.2-TI2V-5B`) durante la inferencia, igual que el modelo base.

El entrenamiento se realizó sobre el dataset `joonyeongs/cosmos3-edge-failure-prevention-six-task-round1-round2-218` (revisión `1b58e11c7a`), compuesto por 218 episodios completos exitosos en seis tareas de RoboLab: el subconjunto de 150 episodios de la ronda 1 de `cosmos3-edge-failure-prevention-200` (revisión corregida `15b96ff`) más 68 demostraciones de la ronda 2 dirigidas a fallos (Toy 35, Canned Food 38, Red Items 38, Cartons 50, Bottles 25, Stack 32). Drill y Spoons quedan excluidos. Cada inicio emplea 32 fotogramas y acciones futuras, con 138.865 inicios elegibles.

La configuración de entrenamiento fue: 2.000 pasos (checkpoint `iter_000002000`, aproximadamente 0,92 pasadas sobre los inicios elegibles), batch global de 64 (2 GPUs × 32 × grad-accum 1), learning rate 2e-5 con warmup lineal de 100 pasos y decaimiento lineal a 0, optimizador FusedAdam, precisión BF16, FSDP de 2 vías, checkpointing selectivo de activaciones y `torch.compile`. El entrenamiento se ejecutó en 2× A100-80GB durante 13,2 horas. El código está disponible en la rama `robolab-droid-train-edge-privileged-phases` (commit `95bad15`) del repositorio `joonyeongs/cosmos-framework`, con la receta `examples/toml/sft_config/robolab_droid_edge_full.toml`.

## Capacidades

- Generación de políticas de acción robótica: predice fragmentos (chunks) de 32 pasos de posiciones articulares conjuntas a partir de observaciones visuales e instrucciones de tarea.
- Condicionamiento a 15 fps y dominio `droid_lerobot`, según los metadatos de política heredados del modelo base.
- Control de pinza con convención DROID (0=abierto, 1=cerrado), con inversión interna del lector; debe servirse con el flip de pinza por defecto (sin `--no-flip-gripper`).
- Integración con el servidor de evaluación RoboLab mediante `cosmos_framework.scripts.action_policy_server_robolab`.
- Soporte de guiado por intervalos (`--guidance-interval 960 1001`) y formato de prompt JSON (`--format-prompt-as-json True`).
- Especialización en seis tareas de manipulación: Toy, Canned Food, Red Items, Cartons, Bottles y Stack.
- Capacidades multimodales de texto e imagen heredadas de la arquitectura Cosmos3 Omni (torre de comprensión congelada), aunque no se detallan en la información disponible.
- No se documentan capacidades de tool calling, agentes multi-paso ni thinking mode en la información proporcionada.

## Casos de uso

- Evaluación de políticas de manipulación en RoboLab: el modelo se sirve con `action_policy_server_robolab` en el puerto 8000 y se consulta con el servidor de evaluación `RobolabPolicyService` para generar chunks de 32 acciones articulares por observación.
- Investigación en prevención de fallos: el ajuste incorpora 68 demostraciones de la ronda 2 dirigidas específicamente a modos de fallo en seis tareas, lo que permite estudiar si el modelo evita trayectorias problemáticas en entornos con objetos como latas, cartones o botellas.
- Especialización de modelos generalistas: sirve como referencia reproducible de un flujo de fine-tuning completo del generador (receta TOML, FSDP, BF16, `torch.compile`) sobre un checkpoint base de NVIDIA con 2× A100-80GB en 13,2 horas.
- Comparación de recetas de entrenamiento: al compartir receta con `cosmos3-edge-policy-droid-failure-prevention-six-task-full-ft-2k` y diferir solo en el dataset, permite aislar el efecto de los datos (ronda 1 frente a ronda 1 + ronda 2) y del número de pasos (1k frente a 2k).
- Validación de exportación de checkpoints: el autor emplea el modelo para comprobar que los pesos exportados cargan correctamente en el servidor de evaluación y producen salidas finitas, comparando los chunks predichos con las acciones demostradas (MAE medio de 0,1015 rad).
- Base para ajustes posteriores en tareas concretas: al conservar el layout exacto del checkpoint base y solo modificar los dos safetensors del transformer, puede reutilizarse como punto de partida para nuevos fine-tunings sobre subconjuntos de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito de tarea en la información disponible. El autor indica explícitamente que el éxito en bucle cerrado en RoboLab no se ha evaluado todavía. La única tabla publicada es una comprobación de exportación (no una evaluación de política), que compara los chunks predichos de 32 pasos con las acciones demostradas en fotogramas del dataset `cosmos3-edge-harness-privileged-phases-150` (episodios no usados en el entrenamiento), en radianes:

| Episodio | Fotograma | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the canned food in the grey bin | 0,0416 |
| 0 | 154 | Put the canned food in the grey bin | 0,0846 |
| 25 | 0 | Put the lizard away in the bin | 0,0817 |
| 25 | 139 | Put the lizard away in the bin | 0,0359 |
| 50 | 0 | Put all the red things in the grey bin | 0,1826 |
| 50 | 326 | Put all the red things in the grey bin | 0,1370 |
| 75 | 0 | Put the cartons that can be recycled in the vertical crate | 0,1671 |
| 75 | 442 | Put the cartons that can be recycled in the vertical crate | 0,0816 |
| | | **Media** | **0,1015** |

Todas las salidas fueron finitas. No se dispone de comparaciones con MMLU, HumanEval, GSM8K ni métricas de éxito robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.859.003.312 parámetros en BF16 el peso ronda los 7,7 GB, además del VAE Wan2.2 que se descarga durante la inferencia y de las activaciones del servidor.
- GPU de entrenamiento utilizadas: 2× A100-80GB, con FSDP de 2 vías y checkpointing selectivo de activaciones, en 13,2 horas para 2.000 pasos.
- GPU recomendadas para servir: no se especifican; por tamaño de pesos, una GPU con al menos 16-24 GB de VRAM podría alojar el modelo en BF16, aunque no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta cuantización ni despliegue en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: servidor propio de Cosmos Framework (`python -m cosmos_framework.scripts.action_policy_server_robolab`) y cliente `RobolabPolicyService` para evaluación. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dataset de ajuste | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`...six-task-218-full-ft-2k`) | 3.859.003.312 | no disponible | 218 episodios (ronda 1 + ronda 2), 6 tareas | 2.000 | OpenMDW-1.1 | Hugging Face, 0 descargas |
| `joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-full-ft-2k` | no disponible (misma receta) | no disponible | mismo dataset de referencia (receta idéntica) | 2.000 | OpenMDW-1.1 | Hugging Face |
| `joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-218-full-ft-1k` | no disponible (misma receta) | no disponible | 218 episodios, 6 tareas | 1.000 | OpenMDW-1.1 | Hugging Face |
| `nvidia/Cosmos3-Edge-Policy-DROID` (base) | no disponible en la información | no disponible | DROID (modelo base) | no aplica | OpenMDW-1.1 | Hugging Face (NVIDIA) |

No se dispone de datos de rendimiento comparativo entre estos modelos; la comparativa se limita a receta, datos y número de pasos.

## Limitaciones y advertencias

- El éxito en bucle cerrado en RoboLab no se ha evaluado; la tabla publicada es una comprobación de exportación y no una medida de éxito de tarea.
- El modelo está especializado en seis tareas concretas (Toy, Canned Food, Red Items, Cartons, Bottles y Stack); no se ha validado su generalización a otras tareas ni a Drill o Spoons, excluidas del dataset.
- Solo se han modificado `transformer/diffusion_pytorch_model-0000{1,2}-of-00002.safetensors` respecto al checkpoint base; el resto del repositorio replica el layout del base.
- La convención de pinza del dataset es 0=abierto, 1=cerrado (DROID), con inversión interna del lector; servir sin `--no-flip-gripper` para evitar un comportamiento incorrecto.
- La inferencia descarga el VAE Wan2.2 (`Wan-AI/Wan2.2-TI2V-5B`), lo que añade dependencia externa y tráfico de red en el primer uso.
- Licencia OpenMDW-1.1 heredada del modelo base; deben revisarse sus términos para uso comercial, ya que la model card la etiqueta como `license: other`.
- No se documentan sesgos, riesgos de alucinación, idiomas soportados ni limitaciones de contexto en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el 2026-11-17; no hay evidencia de validación por terceros.
- El autor advierte que el commit local `ea28694` (solo para comprobación de lanzador) no está publicado; el código de entrenamiento reproducible es el commit `95bad15`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-218-full-ft-2k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de ajuste: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-failure-prevention-six-task-round1-round2-218
- Dataset de comprobación de exportación: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-harness-privileged-phases-150
- Dataset de referencia ronda 1: `joonyeongs/cosmos3-edge-failure-prevention-200` (revisión `15b96ff`)
- Variante 1k: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-218-full-ft-1k
- Variante de receta compartida: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-full-ft-2k
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- VAE Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
