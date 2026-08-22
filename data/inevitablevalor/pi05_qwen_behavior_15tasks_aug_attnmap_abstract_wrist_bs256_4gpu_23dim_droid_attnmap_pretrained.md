# Inevitablevalor/pi05_qwen_behavior_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained

## Resumen

Este repositorio contiene los checkpoints de entrenamiento (pasos 90.000 a 120.000) de un modelo de visión-lenguaje-acción (VLA) para control robótico, desarrollado sobre la arquitectura π₀.5 (pi0.5) de Physical Intelligence. El modelo, denominado `pi05_qwen_behavior_15tasks_aug_attnmap_abstract_wrist`, está especializado en 15 tareas de manipulación del benchmark Behavior y añade una innovación clave respecto a variantes anteriores: cada vista RGB de la cámara de muñeca se acompaña de su imagen infrarroja (IR) correspondiente, duplicando el número de imágenes por paso de 4 a 6. Esta configuración permite al modelo utilizar simultáneamente información visual de profundidad y térmica en el mismo marco de referencia, lo que mejora la percepción de objetos y la robustez en entornos con iluminación variable.

El modelo se construye sobre un backbone Qwen (preentrenado en DROID) y utiliza una arquitectura de flujo (flow-matching) para generar acciones continuas. El repositorio incluye cuatro checkpoints completos (90k, 100k, 110k y 120k), cada uno con pesos en formato `safetensors` (9,79 GB), optimizador y estadísticas de normalización. La pérdida final alcanza 0,0492 tras 140.000 pasos de entrenamiento, con un coste de 1,67 s/iteración en 4 GPUs. Este modelo es relevante porque demuestra la viabilidad de integrar señales IR en VLA para tareas de manipulación de alta precisión, un paso hacia la generalización en entornos industriales y domésticos con condiciones de visión adversas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow-based VLA (π₀.₅) con backbone Qwen, atención de mapas y entrada multi-imagen (6 imágenes: 4 RGB + 2 IR de muñeca) |
| Parámetros totales | 4.838 millones (trainable: 0.299B, frozen: 4.539B) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 448 tokens (320 base + 64 por imagen añadida) |
| Tipos de cuantización | No disponible (pesos en bf16 en el checkpoint) |
| Idiomas soportados | No aplica (modelo de acción robótica, sin procesamiento de lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (model.safetensors), además de `optimizer.pt` y `metadata.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de π₀.₅ (pi0.5) descrita en el paper "π0.5: A Vision-Language-Action Model with Open-World Generalization". Es un modelo de flujo (flow-matching) que aprende a predecir acciones continuas a partir de observaciones visuales y, opcionalmente, instrucciones de lenguaje. La base es un transformer multimodal (Qwen) que procesa las imágenes mediante un ViT compartido, y añade tokens de acción a través de un decodificador de flujo. La novedad de este checkpoint es la inclusión de imágenes infrarrojas de las cámaras de muñeca izquierda y derecha (6 imágenes en total), que se concatenan a las vistas RGB antes de pasar por el ViT, sin añadir parámetros nuevos.

El entrenamiento se realizó sobre el dataset `behavior_15tasks_aug`, que incluye el delta `videos_wrist_attn` con 5.532 episodios y 2.479.937 frames. Se partió de un warm start del checkpoint `pi05_qwen_droid_pretrain_bs256_23dim_attnmap` en el paso 100.000, con un tamaño de batch efectivo de 256 y un scheduler de LR estándar. La pérdida descendió de 2.5538 (paso 0) a 0.0602 (paso 100k) y finalmente 0.0492 (paso 140k). El entrenamiento se dividió en dos trabajos encadenados debido a un límite de 48 horas por trabajo; el segundo reanudó desde el paso 100.000 y completó los 140.000 en 18,5 horas. La velocidad de entrenamiento fue 1,67 s/iteración, un 42% más lenta que la variante de 4 imágenes (1,18 s/it), lo que se correlaciona con el aumento de tokens de 320 a 448.

## Capacidades

- Control robótico de 15 tareas de manipulación del benchmark Behavior, incluyendo tareas de ensamblaje, traslación y uso de herramientas.
- Percepción multimodal con 6 imágenes: 4 RGB (cámara principal y muñecas) + 2 IR de muñeca, lo que permite operar en condiciones de iluminación variable y con objetos que presentan firma térmica.
- Predicción de acciones continuas de 23 dimensiones (posiciones, orientaciones, fuerzas y estados de pinza).
- Integración con el sistema `openpi-spatialvla` para despliegue en robots reales mediante servidor de inferencia.
- Soporte de `tool calling` no aplicable: no procesa lenguaje natural; las instrucciones se codifican como "abstract prompts" (prompts abstractos) que representan la tarea a ejecutar.
- Capacidad de razonamiento multi-paso implícito: el modelo aprende a planificar secuencias de acciones a través del entrenamiento en episodios completos.

## Casos de uso

- Manipulación robótica en líneas de montaje: el modelo puede ejecutar tareas como insertar, apilar o atornillar con precisión gracias a su ventana de contexto de 448 tokens que le permite procesar 6 imágenes simultáneamente, incluyendo IR de muñeca para verificar contacto térmico.
- Recogida y colocación en entornos con iluminación adversa: la entrada IR permite detectar objetos calientes o superficies reflectantes donde la cámara RGB falla, útil en almacenes o cocinas.
- Tareas de cirugía o intervención quirúrgica asistida: el uso de cámaras de muñeca con IR puede ayudar a visualizar tejidos con contraste térmico, aunque se requiere validación clínica.
- Inspección y mantenimiento en entornos industriales: el modelo puede guiar un brazo robótico para inspeccionar componentes con cámaras IR y RGB, detectando anomalías térmicas.
- Investigación en VLA: sirve como base para experimentos de fine-tuning en nuevas tareas, dado que el checkpoint permite reanudar el entrenamiento desde pasos intermedios (90k-120k).
- Evaluación de políticas de control en simulación o real: el formato de checkpoint con `metadata.pt` y `norm_stats.json` permite cargar el modelo en el entorno de evaluación estándar de `openpi` para comparar rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo incluye la curva de pérdida de entrenamiento (ver tabla en la sección de arquitectura) y una verificación de carga del modelo (0 missing / 0 unexpected keys). No hay métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4.798 millones de parámetros en bf16 (~9,6 GB), por lo que una GPU con al menos 24 GB de VRAM es necesaria para inferencia sin cuantización. Con cuantización a 8 bits (~5 GB) podría caber en GPUs de 16 GB, pero no se proporcionan configuraciones de cuantización.
- GPU recomendadas: NVIDIA A100 (80 GB) o H100 para entrenamiento; para inferencia, RTX 4090 (24 GB) o A6000 (48 GB) pueden ejecutar el modelo sin problemas.
- Si cabe en consumer GPU: sí, en RTX 4090 o RTX 3090 (24 GB) con espacio suficiente para el modelo y los tensores de inferencia.
- Opciones de despliegue: el modelo se usa con el servidor de inferencia de `openpi-spatialvla` (comando `run_server.sh`). Requiere `WITH_WRIST_IR=1` tanto en el servidor como en el cliente. También se puede integrar con vLLM o TGI si se exporta el modelo a un formato compatible, aunque no está documentado.
- Latencia y throughput estimados: no se dispone de datos de latencia. El entrenamiento consumía 1,67 s/iteración, pero la inferencia será significativamente más rápida. Se estima una latencia de decenas de milisegundos por paso de acción en una GPU moderna, sin cifras exactas.

## Comparativa con modelos similares

| Modelo | Parámetros | Imágenes por paso | Contexto (tokens) | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| Este modelo (6 imágenes, IR) | 4.798 M | 6 (4 RGB + 2 IR) | 448 | 140k pasos, pérdida 0.049 | No disponible |
| Variante 4 imágenes (misma familia) | 4.798 M | 4 RGB | 320 | 140k pasos, pérdida 0.0602 (aprox.) | No disponible |
| π0.5 base (Physical Intelligence) | ~4.8 M (estimado) | 4 RGB | 320 | 150k pasos | Apache 2.0 (según paper) |

La comparativa se basa en la información de la propia model card. La variante con IR añade 2 imágenes más, lo que aumenta el contexto a 448 tokens y produce una pérdida final ligeramente menor (0.0492 vs 0.0602 del 4-imágenes). No se dispone de comparaciones con otros modelos VLA como OpenVLA o RT-2 en este repositorio.

## Limitaciones y advertencias

- El modelo requiere obligatoriamente la entrada de imágenes IR de muñeca en tiempo de inferencia. Si el servidor o el cliente no activan `WITH_WRIST_IR=1`, se produce un `KeyError` y el sistema se bloquea.
- La licencia no está especificada en el repositorio, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- No se han publicado evaluaciones en tareas reales ni benchmarks estándar, por lo que el rendimiento en entornos nuevos no está garantizado.
- El entrenamiento se realizó con datos de Behavior (15 tareas), lo que puede limitar la generalización a otras tareas o entornos no representados.
- La arquitectura de flujo (flow-matching) requiere un proceso de inferencia iterativo (denoising), lo que aumenta la latencia comparado con modelos autoregresivos.
- El checkpoint ocupa 44.8 GB en total (4 checkpoints), lo que puede ser un problema de almacenamiento en despliegues con recursos limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Inevitablevalor/pi05_qwen_behavior_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained
- Variante 4 imágenes (hermana): https://huggingface.co/Inevitablevalor/pi05_qwen_behavior_15tasks_aug_attnmap_abstract_train_bs256_4gpu_23dim_droid_attnmap_pretrained
- Repositorio `openpi` de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Repositorio `openpi_qwen` (código de entrenamiento): https://github.com/moon-fall/openpi_qwen
- Paper de π0.5: https://arxiv.org/pdf/2504.16054
