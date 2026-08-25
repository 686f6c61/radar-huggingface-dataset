# geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v1-step25000

## Resumen

Este modelo es un checkpoint intermedio (iteración 25000) de un proceso de destilación a un solo paso del modelo `nvidia/Cosmos3-Edge-Policy-DROID`, desarrollado por el usuario geonmin-kim. El objetivo es reducir la latencia de inferencia de una política robótica de visión-lenguaje-acción (VLA) de 8 pasadas hacia adelante (4-step UniPC con CFG) a 1 o 2 pasadas, manteniendo o mejorando la precisión. Se basa en la arquitectura Cosmos3 de NVIDIA, concretamente en la variante Edge (4B parámetros), y está especializado en el control de robots DROID.

La relevancia de este checkpoint radica en que la destilación a un paso permite ejecutar la política en tiempo real en hardware edge (como NVIDIA Thor), algo crítico para aplicaciones robóticas embebidas. El modelo se entrena con un objetivo de deriva (drift) que optimiza directamente el generador de un paso, corrigiendo además el desvío de distribución introducido por el guidance classifier-free (CFG). El checkpoint no es un producto final, sino una instantánea de evaluación dentro de un proceso de entrenamiento en curso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en Cosmos3, con VLM + VAE (Wan2.2), destilada a 1 paso |
| Parametros totales | 3.369.657.024 (3,37B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | No disponible (modelo robótico; instrucciones probablemente en inglés, no especificado) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (2 shards) + index, config.json, checkpoint.json, tokenizer/processor, vision_encoder |

## Arquitectura y entrenamiento

El modelo parte del checkpoint de política liberado por NVIDIA (`nvidia/Cosmos3-Edge-Policy-DROID`) y lo destila a un generador de un solo paso mediante un objetivo de deriva (drift) con σ=1 fijo. La arquitectura combina un VLM (modelo de lenguaje y visión) con un VAE (Wan2.2) y un "gen expert" que genera chunks de acción. Durante el entrenamiento se congelan el VLM y el VAE, y solo se actualizan el gen expert y los módulos de puente (`moe_gen`, `*2llm`, `llm2*`, `time_embedder`). Se utiliza el subconjunto de éxito del dataset DROID (3.332 episodios, excluyendo 128 de validación) con un chunk de acción de 32 pasos a 15 fps y 8 grados de libertad (joint_pos). El optimizador es FusedAdamW con lr 1e-5, weight decay 0.05 y betas (0.9, 0.99). El entrenamiento se realizó con FSDP en 4×B200, bf16, batch 4 por rank, y un scheduler LambdaLinear con warmup de 250 iteraciones. La destilación no solo reduce el número de pasos de muestreo, sino que también mitiga el desvío de distribución causado por el CFG, como se observó en un experimento previo con SO-101 donde el MAE open-loop mejoró de 26.96 a 5.45.

## Capacidades

- Generación de acciones robóticas (chunks de 32 pasos, 8-D joint positions) a partir de instrucciones de lenguaje, observaciones de cámara y estado del robot.
- Inferencia de un solo paso (destilado), lo que reduce drásticamente la latencia frente al baseline de 4 pasos.
- Soporte para el framework RoboLab (simulación con Isaac Sim) y para robots DROID reales.
- Integración con el policy server de cosmos-framework para despliegue en tiempo real.
- No es un modelo de propósito general; está especializado exclusivamente en control robótico DROID.

## Casos de uso

- Control de robots manipuladores en tareas de DROID (recoger, colocar, apilar, etc.) con instrucciones en lenguaje natural.
- Evaluación de políticas en simulación mediante RoboLab, permitiendo pruebas masivas con múltiples entornos en paralelo.
- Despliegue en tiempo real en hardware edge (NVIDIA Thor) gracias a la inferencia de un solo paso, habilitando robots autónomos con baja latencia.
- Investigación en destilación de modelos de difusión para robótica, sirviendo como referencia para técnicas de reducción de pasos de muestreo.
- Integración en pipelines de robótica con policy server, donde el modelo recibe observaciones y devuelve acciones de forma continua.
- Benchmarking de políticas en entornos simulados para comparar el rendimiento de diferentes estrategias de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint en la información disponible. La model card menciona que el baseline (4-step) tiene un MAE open-loop de 0.1108 y una latencia E2E de 233 ms en B200, pero no proporciona mediciones para este modelo destilado (indica "medición prevista"). Tampoco hay datos de RoboLab success rate. En un experimento relacionado con SO-101, la destilación mejoró el MAE open-loop de 26.96 a 5.45, pero no es un dato de este modelo.

## Requisitos de hardware

- Entrenamiento: 4×B200 con FSDP shard 4, bf16, batch 4 por rank.
- Inferencia: requiere una GPU RTX para ejecutar RoboLab (Isaac Sim). No se especifica VRAM mínima; al ser un modelo de ~3,4B parámetros, podría caber en GPUs consumer con cuantización, pero no hay datos confirmados.
- Opciones de despliegue: cosmos-framework con policy server (comando `action_policy_server_robolab`), cliente RoboLab en Isaac Sim.
- Latencia y throughput: no disponibles para este checkpoint; el baseline tiene 233 ms E2E en B200, pero la destilación busca reducirlo a 1-2 pasadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Cosmos3-Edge-Policy-DROID (base) | ~4B | No disponible | nvidia-open-model-license | Política original de NVIDIA, 4-step UniPC × CFG (8 forward passes) |
| Cosmos3-Edge-Policy-DROID-FastWAM-v1-step25000 (este) | 3,37B | No disponible | nvidia-open-model-license | Destilado a 1 paso, checkpoint intermedio |
| Cosmos3-Nano-Policy-DROID | ~16B | No disponible | nvidia-open-model-license | Variante más grande de NVIDIA para DROID |

No se dispone de datos de rendimiento comparativos (MAE, success rate) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (iter 25000 de un plan de 25000), no un producto final; el entrenamiento puede continuar y el rendimiento puede variar en versiones posteriores.
- Requiere el framework específico (cosmos-framework commit `5e67049`) y parches adicionales disponibles en el repositorio del autor.
- La inferencia debe realizarse con `num_inference_steps=1` y `guidance_scale=1.0`; usar otros valores degrada el rendimiento porque el modelo está optimizado para esa configuración.
- No se debe usar la opción `--drop-generated-vision` con este checkpoint, ya que fue entrenado con secuencias WAM completas (sin eliminación de video tokens).
- La licencia NVIDIA open model puede tener restricciones para uso comercial; es necesario revisar los términos.
- El modelo está limitado al dominio DROID y no es adecuado para tareas de propósito general.
- No hay datos sobre sesgos o alucinaciones, pero al ser un modelo robótico, los errores pueden manifestarse como acciones incorrectas o fallos de ejecución.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v1-step25000)
- [Repositorio del autor con parches de inferencia (FastWAM)](https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM)
- [Checkpoint init SO-101 del autor](https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-SO101-init)
- [Documentación de NVIDIA Cosmos 3 - Model Reference](https://docs.nvidia.com/cosmos/latest/cosmos3/model_reference.html)
- [Cookbook de NVIDIA para ejecutar políticas con cosmos-framework](https://github.com/NVIDIA/cosmos/blob/main/cookbooks/cosmos3/generator/action/run_policy_with_cosmos_framework.md)
- [Blog sobre Cosmos 3 Edge](https://www.physicalaifield.com/blog/nvidia-cosmos-3-edge-on-device-physical-ai/)
