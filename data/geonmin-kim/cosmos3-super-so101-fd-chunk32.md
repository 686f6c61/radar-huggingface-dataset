# geonmin-kim/cosmos3-super-so101-fd-chunk32

## Resumen

Cosmos3-Super SO-101 Forward Dynamics (chunk_length=32) es un modelo de mundo condicionado por acciones, post-entrenado a partir de nvidia/Cosmos3-Super (64B) mediante LoRA, especializado en la predicción de vídeo para el brazo robótico SO-101. El modelo recibe un frame de cámara real y una secuencia de acciones candidatas, y genera el vídeo del robot ejecutándolas, lo que permite evaluar políticas y analizar fallos sin necesidad de operar el robot físico.

Esta variante concreta, publicada por el autor geonmin-kim, es un checkpoint intermedio (iteración 4500) de un experimento controlado que aumenta la ventana de entrenamiento de 16 a 32 pasos de acción, con el objetivo de abordar el fallo de horizonte observado en la evaluación de la iteración 4000: el modelo degrada su calidad cuando se alimenta de su propia salida en modo autorregresivo. El checkpoint se distribuye en formato Distributed Checkpoint (DCP) de PyTorch, no en safetensors, y requiere el framework de NVIDIA Cosmos para cargarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Super (64B, MoT) con adaptación LoRA rank 16 / alpha 32 |
| Parametros totales | 64B (base) + 21.1M adaptados (LoRA + pathway de acción) |
| Parametros activos | no disponible (MoE, pero no se especifica número de expertos activos) |
| Longitud de contexto | 32 pasos de acción (33 frames a 30 fps, ~1.07 s por chunk) |
| Tipos de cuantizacion | no disponible (entrenado en bf16 con master fp32; no se documentan cuantizaciones para inferencia) |
| Idiomas soportados | no disponible (modelo orientado a vídeo y acciones, no a texto) |
| Licencia | openmdw-1.1 |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP) — no safetensors |

## Arquitectura y entrenamiento

El modelo se basa en nvidia/Cosmos3-Super, un modelo de mundo omni-modal de 64B con arquitectura MoT (Mixture of Transformers) que integra comprensión, generación y simulación de vídeo, imágenes, audio y acciones. La adaptación específica para el SO-101 añade una LoRA de rank 16 sobre las proyecciones `q/k/v/o_proj_moe_gen` y desbloquea un pathway de acción (21.1M parámetros) para condicionar la generación de vídeo con secuencias de acciones del efector final (10 dimensiones: posición, rotación 6D y gripper), normalizadas con cuantiles.

El entrenamiento se realizó sobre el dataset `geonmin-kim/so101_merged_v2` (1444 episodios, 486k frames, 33 tareas) con paralelismo FSDP de 4 ranks en 4× A100 80GB, batch efectivo de 24000 tokens tras empaquetado. Esta variante retoma el checkpoint de chunk_length=16 (iteración 4000) y entrena 500 iteraciones adicionales con ventanas de 32 pasos de acción. El experimento se diseña deliberadamente con `cond_noise_std=0.0` para aislar el efecto de la longitud de chunk sobre la degradación autorregresiva, antes de añadir ruido en los frames de condicionamiento.

## Capacidades

- Predicción de vídeo condicionada por acciones: genera el vídeo del robot SO-101 ejecutando una secuencia de acciones dada, a partir de un frame real de la cámara.
- Evaluación de políticas robóticas sin ejecución física: permite probar políticas candidatas en simulación visual antes de desplegarlas en el robot real.
- Análisis de fallos: puede reproducir y visualizar errores de ejecución, ayudando a diagnosticar problemas en el control del brazo robótico.
- Generación autorregresiva y con teacher forcing: soporta ambos modos de rollout para comparar la calidad de la generación con contexto propio frente a contexto real.
- Condicionamiento multimodal: integra visión (frames de cámara) y acciones (10-D) en un modelo de mundo unificado.
- Entrenamiento por LoRA: adaptación eficiente sobre un modelo base de 64B con solo 21.1M de parámetros entrenables.

## Casos de uso

- Evaluación de políticas robóticas sin robot físico: se alimenta el modelo con un frame real y la secuencia de acciones de una política candidata, y se genera el vídeo de la ejecución para validar visualmente si la política es correcta o falla.
- Diagnóstico de fallos en tareas de manipulación: al comparar el vídeo generado con la ejecución real grabada, se pueden identificar discrepancias (por ejemplo, el brazo no alcanza el objeto) y determinar si el problema es de la política, del controlador o de la percepción.
- Generación de datos sintéticos de entrenamiento: los vídeos generados pueden usarse como aumentación de datos para entrenar otras políticas de visión y control.
- Optimización de hiperparámetros de control: se pueden evaluar variaciones de un controlador (por ejemplo, distintos gains) simulando sus efectos visuales sin ejecutar el robot.
- Validación de seguridad en entornos de manipulación: antes de desplegar una política en un entorno con objetos frágiles, se puede simular su comportamiento para descartar movimientos peligrosos.
- Investigación en modelos de mundo robóticos: sirve como punto de partida para estudiar la degradación autorregresiva en modelos de mundo condicionados por acciones, especialmente el efecto de la longitud de la ventana de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint específico (iteración 4500, chunk_length=32). La model card indica que, al momento de la exportación, no se había ejecutado una evaluación dedicada para esta variante. Se proporcionan valores de referencia de la iteración anterior (chunk_length=16, iter 4000):

| Metrica | Valor |
|---|---|
| PSNR / SSIM (autorregresivo) | 18.8 dB / 0.844 |
| Motion ratio (1.0 = coincide con la realidad) | 0.87 |
| Correlación de movimiento | 0.50 |
| Separación de ejes (≈90° es el techo) | 86° (modelo base: 32°) |

Además, la evaluación de la iteración 4000 mostró que el modelo mantiene la calidad en modo teacher-forced (PSNR 31.1 → 34.4) pero colapsa en modo autorregresivo (31.1 → 18.0), lo que motivó el experimento de chunk_length=32.

## Requisitos de hardware

- VRAM estimada: no disponible para el checkpoint completo; el entrenamiento se realizó con 4× A100 80GB (FSDP 4-way shard, bf16).
- GPU recomendadas: 4× A100 80GB para entrenamiento. Para inferencia, se requiere al menos una GPU con suficiente memoria para el modelo de 64B con LoRA; se recomienda una GPU con 80GB o más, o usar cuantización si estuviera disponible (no se documenta).
- No cabe en GPU consumer: el modelo base es de 64B, por lo que no es viable en GPUs de consumo como RTX 4090 sin cuantización extrema (no disponible).
- Opciones de despliegue: se usa el framework de Cosmos (cosmos-framework) con el overlay específico para SO-101. No se menciona soporte para vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos de mundo robóticos. Se puede mencionar que el modelo base, nvidia/Cosmos3-Super, es el punto de referencia, pero no se han documentado comparaciones con alternativas como modelos de predicción de vídeo basados en transformers de otras empresas. La información disponible se centra en la variante específica y su evolución interna.

## Limitaciones y advertencias

- Degradación autorregresiva: el modelo colapsa cuando se alimenta de su propia salida (PSNR de 31.1 a 18.0 en la iteración 4000). Esta variante intenta mitigarlo aumentando el chunk_length, pero no hay resultados de evaluación que confirmen una mejora.
- Dependencia de la normalización de acciones: el checkpoint requiere obligatoriamente el archivo `so101_stats_stride1_v2.json` incluido en el repo. Usar estadísticas v1 puede descalibrar las acciones hasta un 19% de error silencioso.
- Formato de checkpoint no estándar: no es safetensors ni compatible con Hugging Face Transformers. Solo se puede cargar con cosmos-framework (commit `5e67049`) y el overlay de SO-101.
- Licencia openmdw-1.1: licencia específica de NVIDIA, puede tener restricciones de uso comercial. Se debe revisar el texto completo en https://openmdw.org/.
- Sin evaluación completa de este checkpoint: solo 500 iteraciones de entrenamiento adicionales respecto a la baseline; los resultados de benchmarks no están disponibles.
- Limitación de idioma: el modelo no procesa texto, solo vídeo y acciones; no es útil para tareas de lenguaje.
- Entrenamiento con una sola vista de cámara: solo cámara superior (`top` view) a 480p; la generalización a otros puntos de vista no está probada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geonmin-kim/cosmos3-super-so101-fd-chunk32
- Dataset usado: https://huggingface.co/datasets/geonmin-kim/so101_merged_v2
- Checkpoint anterior (chunk16, iter 4000): https://huggingface.co/geonmin-kim/cosmos3-super-so101-fd-chunk16
- Repositorio de simulación SO-101: https://github.com/nota-github/xpu-cosmos3-simulator (branch `feat/so101-a100-port-and-action-pathway`)
- Framework de Cosmos: https://github.com/NVIDIA/cosmos-framework (pinned a commit `5e67049`)
- Página de Cosmos 3 de NVIDIA: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Documentación de modelos de Cosmos: https://docs.nvidia.com/cosmos/latest/cosmos3/model_reference.html
- Licencia openmdw-1.1: https://openmdw.org/
