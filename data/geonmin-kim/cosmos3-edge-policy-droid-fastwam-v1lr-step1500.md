# geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v1lr-step1500

## Resumen

Este modelo es un checkpoint intermedio (iteración 1500 de 25000, un 6% del plan) de un proceso de destilación a un paso del modelo `nvidia/Cosmos3-Edge-Policy-DROID`, desarrollado por `geonmin-kim`. El objetivo es convertir la política robótica original, que requiere 4 pasos de muestreo UniPC con CFG de 2 ramas (8 pasadas por el tower de difusión, 233 ms de latencia extremo a extremo en B200), en un generador de un solo paso que ejecuta directamente la función desplegada con `num_inference_steps=1`. Esto reduce la latencia de inferencia a 1-2 pasadas y, según los resultados reportados en SO-101, puede incluso mejorar la precisión al eliminar la desviación de distribución introducida por el CFG.

Se trata de una política VLA (Vision-Language-Action) basada en el modelo omnimodal Cosmos3-Edge de NVIDIA, con 3,37 mil millones de parámetros, diseñada para control robótico en tiempo real sobre hardware edge de la familia NVIDIA Thor. El checkpoint se exporta con pesos EMA, sin estado de entrenamiento, y mantiene la secuencia completa de tokens de video (full WAM), por lo que no es un artefacto final sino una instantánea de evaluación. La relevancia actual reside en que demuestra la viabilidad de destilar políticas de difusión robótica a un paso para despliegue en tiempo real con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basado en Cosmos3-Edge-Policy-DROID (modelo omnimodal de mundo con VAE Wan2.2) |
| Parametros totales | 3.369.657.024 (3,37 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (2 shards + index.json), config.json, checkpoint.json, tokenizer/processor, vision_encoder |

## Arquitectura y entrenamiento

El modelo es una destilación por drift (objetivo de destilación con sigma fijo en 1) de la política `nvidia/Cosmos3-Edge-Policy-DROID`, que a su vez es una variante post-entrenada del modelo de fundación Cosmos3-Edge (aproximadamente 4 B de parámetros en su forma completa). El entrenamiento congela el backbone VLM y el VAE, y solo actualiza el experto generador y las capas de puente (`moe_gen`, `*2llm`, `llm2*`, `time_embedder`). Se usa el subconjunto de éxito del dataset `nvidia/Cosmos3-DROID` (3.332 episodios de entrenamiento, con 128 de validación retenidos), con una pérdida de drift ponderada con peso 10.0 y 4 generaciones por etiqueta (temperaturas 0.02, 0.05, 0.2). El optimizador es FusedAdamW (lr 1e-5, weight decay 0.05), con scheduler LambdaLR (warmup 250, f_max 1.0 → f_min 0.1), paralelización FSDP con 4 shards en 4×B200 y batch 4 por rank. La acción se define como chunk de 32 pasos, 15 fps, joint_pos de 8 dimensiones con `concat_view`.

## Capacidades

- Generación de acciones robóticas (action chunks) para robots de tipo DROID: 32 pasos de 8 dimensiones de posición articular a 15 fps.
- Acepta instrucciones en lenguaje natural, observaciones de cámara y estado del robot, y genera el chunk de acciones completo.
- Inferencia de difusión en un solo paso (`num_inference_steps=1`), con `guidance_scale=1.0` (sin CFG), lo que reduce el coste computacional a 1-2 pasadas por el tower.
- Mantiene la secuencia completa de video tokens (WAM), lo que permite al modelo aprovechar el contexto visual completo sin eliminación de tokens.
- Capacidad de ser servido como servidor de políticas (policy server) con cliente RoboLab en Isaac Sim (requiere GPU RTX).
- La destilación elimina la desviación de distribución introducida por el CFG, lo que en SO-101 mejoró el MAE de 26.96 a 5.45.

## Casos de uso

- Control robótico en tiempo real en plataformas edge: gracias a la reducción a 1 paso de difusión, la latencia extremo a extremo puede caer desde los 233 ms del baseline hasta un rango adecuado para la operación en robots con recursos limitados (NVIDIA Thor). Se desplegaría con el servidor de políticas del framework Cosmos.
- Manipulación robótica en entornos domésticos o industriales: el modelo acepta instrucciones de lenguaje y observaciones visuales, y genera 32 pasos de acciones articulares, lo que permite tareas de agarre y manipulación con planificación de movimiento.
- Evaluación de políticas en simulación: mediante el cliente RoboLab (Isaac Sim), se pueden ejecutar múltiples entornos en paralelo (10+) y medir la tasa de éxito de tareas, con el checkpoint como instantánea de evaluación intermedia.
- Investigación en destilación de modelos de difusión para robótica: este checkpoint permite estudiar el comportamiento de la destilación drift en el dominio DROID, comparando el rendimiento del modelo 1-step contra el baseline de 4-step.
- Sistema de teleoperación asistida: la baja latencia de inferencia permite que el modelo genere acciones en bucle cerrado sobre la base de observaciones actuales, útil en escenarios de teleoperación con feedback visual.
- Benchmarking de políticas generalistas: el modelo se puede comparar contra otras políticas DROID (Nano, Edge baseline) en tareas de RoboLab, para medir el impacto de la destilación en precisión y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los valores de open-loop MAE y RoboLab success rate para este checkpoint están "por medir" (medición esperada). Como referencia del proceso de destilación, en el dominio SO-101 la misma técnica mejoró el open-loop MAE de 26.96 a 5.45, pero no hay datos para DROID en este punto.

| Metrica | Baseline (4-step) | Este checkpoint (1-step) |
|---|---|---|
| Pasadas por el toro | 8 | 1-2 |
| Latencia E2E (B200) | 233 ms | por medir |
| Open-loop MAE | 0.1108 | por medir |
| RoboLab success rate | por medir | por medir |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (los pesos safetensors ocupan 7.7 GB en bf16; la memoria total con VAE y activaciones no está especificada).
- GPU recomendadas: el entrenamiento usó 4×B200 con FSDP shard 4; para inferencia se requiere GPU RTX para el cliente RoboLab (Isaac Sim).
- En consumer GPU: no hay datos de prueba con GPUs consumer, pero el tamaño de pesos (3.37 B) sugiere que podría caber en una RTX 3090/4090 con cuantización, aunque no hay información de cuantización disponible.
- Opciones de despliegue: cosmos-framework (commit `5e67049`) con parches del repositorio `geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM`; servidor de políticas con `action_policy_server_robolab`; cliente RoboLab en Isaac Sim.
- Latencia y throughput: baseline 233 ms E2E en B200 (4-step); para este checkpoint está por medir, pero se espera una reducción significativa al pasar de 8 a 1-2 pasadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Cosmos3-Edge-Policy-DROID (baseline)** | ~4 B (general) | no disponible | 4-step UniPC × CFG 2 ramas (8 pasadas) | nvidia-open-model-license | Hugging Face |
| **Cosmos3-Edge-Policy-DROID-Drift-step1500 (este)** | 3.37 B | no disponible | 1-step (sin CFG) | nvidia-open-model-license | Hugging Face |
| **Cosmos3-Nano-Policy-DROID** | ~1-2 B (no confirmado) | no disponible | 4-step (probable) | nvidia-open-model-license | Hugging Face |

La comparativa con otros VLA robóticos de 1 paso (p. ej., modelos de difusión destilados en otros dominios) no está disponible en la informacion aportada. La destilación a 1 paso es la innovación principal frente al baseline.

## Limitaciones y advertencias

- Checkpoint intermedio: es el 6% del plan de entrenamiento (iter 1500 de 25000), por lo que el rendimiento puede ser sustancialmente inferior al resultado final esperado.
- No es un modelo final: el autor indica explícitamente que es una instantánea de evaluación, no un artefacto de producción.
- Requiere configuración exacta de inferencia: debe ejecutarse con `num_inference_steps=1` y `guidance_scale=1.0`; usar otros valores anula la destilación y degrada el rendimiento.
- No soporta `--drop-generated-vision`: el modelo se entrenó con la secuencia completa de WAM, por lo que eliminar tokens de video rompería la entrada.
- Dependencia de software específico: necesita el framework de NVIDIA con un commit concreto y parches externos, lo que complica la reproducibilidad.
- Licencia: NVIDIA Open Model License, con restricciones que deben revisarse para uso comercial (no se detalla en la model card).
- Sesgos y alucinación: no hay datos sobre sesgos; al ser un modelo robótico, el riesgo de alucinación se manifiesta en acciones erróneas, pero no hay información al respecto.
- Idioma: no se especifican idiomas soportados para las instrucciones de lenguaje.
- Sin benchmarks públicos: no hay números de rendimiento validados para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v1lr-step1500
- Repositorio con parches de inferencia: https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Referencia del modelo Cosmos3 (NVIDIA): https://docs.nvidia.com/cosmos/latest/cosmos3/model_reference.html
- Blog explicativo de Cosmos 3 Edge: https://www.physicalaifield.com/blog/nvidia-cosmos-3-edge-on-device-physical-ai/
- Cookbook oficial para ejecutar políticas (GitHub): https://github.com/NVIDIA/cosmos/blob/main/cookbooks/cosmos3/generator/action/run_policy_with_cosmos_framework.md
