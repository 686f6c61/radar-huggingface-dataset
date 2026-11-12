# joonyeongs/cosmos3-edge-policy-droid-privileged-phases-lora-r32-a64-500

## Resumen

Cosmos3-Edge-Policy-DROID con adaptadores LoRA fusionados es un ajuste fino del modelo de política robótica `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`), desarrollado por el usuario joonyeongs. El modelo parte de la familia Cosmos3 de NVIDIA, orientada a la generación de acciones y vídeo para robótica, y se especializa en la generación de fases privilegiadas dentro del entorno de evaluación RoboLab, partiendo del conjunto de datos DROID.

El ajuste se realizó sobre el dataset `joonyeongs/cosmos3-edge-harness-privileged-phases-150`, compuesto por 25 episodios exitosos de RoboLab para cada una de seis tareas, restringiendo el inicio de los clips de entrenamiento únicamente a los intervalos de código privilegiado. De las seis tareas, dos (Canned Food y Toy) tienen rangos vacíos, por lo que solo cuatro (Red Items, Cartons, Bottles y Stack) aportan las 37.516 muestras de inicio elegibles.

El resultado es un checkpoint de aproximadamente 3.859 millones de parámetros (3,86 B) con los adaptadores LoRA ya fusionados en los pesos base, de modo que no requiere carga PEFT. Su relevancia es acotada: se trata de un artefacto de investigación reproducido con receta abierta, no de un modelo de propósito general, y su evaluación de éxito en bucle cerrado en RoboLab aún no se ha llevado a cabo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de política Cosmos3 (familia Cosmos de NVIDIA, pipeline `diffusers` con transformer de difusión y VAE Wan2.2) |
| Parámetros totales | 3.859.003.312 (≈3,86 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; entrenamiento en BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (`transformer/diffusion_pytorch_model-0000{1,2}-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID`: un modelo de política de la familia Cosmos3 que combina un transformer de difusión (cargado vía `diffusers`) con un VAE externo, en este caso `Wan-AI/Wan2.2-TI2V-5B`, que se descarga en tiempo de inferencia. La metadata de política del checkpoint base (`checkpoint.json`) define un chunk de acción de 32 pasos, condicionamiento a 15 fps y dominio `droid_lerobot`, y se mantiene sin cambios en este ajuste.

El entrenamiento consistió en un ajuste LoRA de rango 32 y alpha 64 (escala 2.0) aplicado sobre las proyecciones q/k/v/o y las capas MLP up/down del generador, además de los módulos `vae2llm`, `llm2vae` y las fronteras de acción DROID. Los adaptadores se fusionaron en los pesos base para la exportación mediante `W += (alpha/rank) · B @ A`. Se usaron 37.516 inicios elegibles (32 fotogramas/acciones futuras por clip), 500 pasos (checkpoint `iter_000000500`, ≈0,85 pasadas sobre los datos), batch global de 64 (2 GPU × 32 × grad-accum 1), LR 1e-4 con warmup lineal de 25 pasos y decaimiento lineal hasta 0, precisión BF16, FSDP a 2 vías, activation checkpointing selectivo y `torch.compile`. El cómputo total fue de 3,3 horas en 2× A100-80GB. El código y la receta están disponibles en la rama `robolab-droid-train-edge-privileged-phases` del repositorio `joonyeongs/cosmos-framework`.

## Capacidades

- Generación de trayectorias de acción robótica: produce chunks de 32 pasos de posiciones articulares (joint positions) condicionados por fotogramas de observación, con condicionamiento temporal a 15 fps.
- Generación de fases privilegiadas: el ajuste está especializado en iniciar clips dentro de los intervalos de código privilegiado del harness RoboLab, lo que permite generar datos de entrenamiento en esos segmentos.
- Integración con el servidor de evaluación RoboLab: se sirve mediante `cosmos_framework.scripts.action_policy_server_robolab` con formato de prompt JSON y un intervalo de guía de 960–1001.
- Dominio DROID: opera sobre el dominio `droid_lerobot`, con la metadata de política heredada del modelo base.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general ni audio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de políticas: el modelo produce chunks de 32 acciones articulares a partir de observaciones, lo que permite aumentar el volumen de trayectorias en las fases privilegiadas de RoboLab sin necesidad de teleoperación adicional.
- Aumento de datos en tareas de manipulación concreta: para las tareas Red Items, Cartons, Bottles y Stack, el ajuste permite generar inicios de episodio dentro de los intervalos privilegiados, cubriendo segmentos que el modelo base no prioriza.
- Evaluación de políticas en bucle cerrado: sirviéndolo con `action_policy_server_robolab` en el puerto 8000, se puede conectar al harness de evaluación RoboLab para medir el éxito de tarea (aún pendiente de ejecutar por el autor).
- Reproducción de experimentos de ajuste LoRA en robótica: la receta abierta (`robolab_droid_edge_lora.toml`) y la guía `docs/robolab_droid_edge_privileged_phases.md` permiten replicar el pipeline con 2× A100-80GB en aproximadamente 3,3 horas.
- Investigación sobre fases privilegiadas en entornos simulados: el modelo sirve como referencia para estudiar cómo el filtrado de inicios por intervalos de código privilegiado afecta a la distribución de acciones generadas.
- Base para ajustes posteriores en otras tareas DROID: al tener los adaptadores fusionados y mantener el layout exacto del checkpoint base, puede servir como punto de partida para nuevos LoRA sobre tareas adicionales del dominio `droid_lerobot`.
- Validación de exportación de checkpoints: el script de comprobación de exportación (comparación de chunks predichos con acciones demostradas, MAE en radianes) es reutilizable para verificar que un checkpoint fusionado produce salidas finitas antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito de tarea en la información disponible. El autor indica explícitamente que la evaluación de éxito en bucle cerrado en RoboLab no se ha realizado todavía. La única métrica publicada es una comprobación de exportación (no una evaluación de política) que compara chunks de 32 pasos de posiciones articulares predichas con las acciones demostradas, en radianes:

| Episodio | Fotograma | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the canned food in the grey bin | 0,1154 |
| 0 | 154 | Put the canned food in the grey bin | 0,0364 |
| 25 | 0 | Put the lizard away in the bin | 0,0915 |
| 25 | 139 | Put the lizard away in the bin | 0,0376 |
| 50 | 0 | Put all the red things in the grey bin | 0,0736 |
| 50 | 326 | Put all the red things in the grey bin | 0,0904 |
| 75 | 0 | Put the cartons that can be recycled in the vertical crate | 0,0812 |
| 75 | 442 | Put the cartons that can be recycled in the vertical crate | 0,0756 |
| | | **Media** | **0,0752** |

Todas las salidas fueron finitas. El autor subraya que esta tabla no mide éxito de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,86 B parámetros en BF16, el peso de los pesos ronda los 7,7 GB; en FP16/FP32 la cifra sería mayor. A ello hay que sumar el VAE Wan2.2-TI2V-5B que se descarga en inferencia, cuyo consumo adicional no se detalla.
- GPU recomendadas: el entrenamiento se realizó en 2× A100-80GB (3,3 h). Para inferencia no se especifica una GPU mínima; por tamaño de pesos, una GPU con 16-24 GB de VRAM podría alojar los pesos en precisión reducida, aunque el VAE adicional puede elevar el requisito.
- ¿Cabe en GPU de consumo? No confirmado. Por el tamaño de pesos (≈7,7 GB en BF16) cabría en GPUs de consumo con 16 GB o más, pero el VAE Wan2.2 y el pipeline de difusión pueden requerir más memoria; no hay datos publicados al respecto.
- Opciones de despliegue: servidor específico `cosmos_framework.scripts.action_policy_server_robolab` (puerto 8000, `--format-prompt-as-json True`, `--guidance-interval 960 1001`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LoRA fusionado sobre Cosmos3-Edge-Policy-DROID) | 3,86 B | no disponible | Política robótica (difusión) | OpenMDW-1.1 | Hugging Face |
| `nvidia/Cosmos3-Edge-Policy-DROID` (base) | no disponible | no disponible | Política robótica (difusión) | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas robóticas de difusión para DROID/RoboLab) en la documentación proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- El ajuste cubre solo cuatro de las seis tareas del dataset (Red Items, Cartons, Bottles y Stack); Canned Food y Toy tienen rangos privilegiados vacíos y no aportan datos de entrenamiento, por lo que el comportamiento en esas tareas no está respaldado por el ajuste.
- Solo se realizaron 500 pasos (≈0,85 pasadas sobre los datos elegibles), lo que puede implicar un ajuste limitado y riesgo de sobreajuste a los 37.516 inicios concretos.
- No se ha evaluado el éxito de tarea en bucle cerrado en RoboLab; la única métrica publicada es una comprobación de exportación con MAE media de 0,0752 rad, que no equivale a rendimiento real.
- La comprobación de exportación se hizo sobre fotogramas del propio dataset de entrenamiento, no sobre datos held-out, por lo que no mide generalización.
- El modelo depende de la descarga del VAE externo `Wan-AI/Wan2.2-TI2V-5B` en inferencia, lo que añade una dependencia de red y de licencia adicional.
- Licencia OpenMDW-1.1 heredada del modelo base; conviene revisar sus términos antes de un uso comercial, ya que se etiqueta como `license: other`.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación en el sentido textual, al tratarse de un modelo de política y no de un modelo de lenguaje.
- La metadata de política (chunk de 32 pasos, 15 fps, dominio `droid_lerobot`) es la del modelo base y no se ha revalidado específicamente para este ajuste.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-privileged-phases-lora-r32-a64-500
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de ajuste: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-harness-privileged-phases-150
- Repositorio de código (rama de entrenamiento): https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- VAE Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
