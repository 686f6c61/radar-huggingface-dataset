# JackHsieh/8B-base.8B-gpnp-rl-step1664-kv-tags-thought-thoughts.iid-40M-full.stride-1.dcp-step-637

## Resumen

Este repositorio contiene un checkpoint intermedio de entrenamiento del proyecto **prestar**, desarrollado por el usuario JackHsieh. No es un modelo final ni un modelo listo para producción: es una copia de seguridad del estado de entrenamiento en el paso 637 de 812 de una ejecución de *continued pre-training* (re-CPT) sobre **Qwen3-8B-Base**. El checkpoint se ha subido sin modificar para poder reanudar el entrenamiento si se pierde la copia local.

La ejecución parte de Qwen3-8B-Base, un transformer denso de 8.000 millones de parámetros, y lo entrena de nuevo sobre el subconjunto `train[:9728]` del dataset `JackHsieh/statML-arxiv-iid-160M-20M` (la ventana iid completa de 40M), con "thoughts" del modelo `JackHsieh/8B-gpnp-rl-step1664.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought` antepuestos a cada fragmento con stride 1. El objetivo declarado del proyecto es el estudio de pensamiento latente y razonamiento mediante RL sobre modelos base.

Su relevancia es fundamentalmente de investigación: permite reproducir o reanudar una ejecución de re-CPT concreta y estudiar la dinámica de entrenamiento intermedia. No está pensado para inferencia directa, ya que el formato de pesos es DCP (Distributed Checkpoint) de FSDP2 con pesos maestros en fp32, no un checkpoint de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B-Base) |
| Parametros totales | 8.000 millones (aproximado, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en fp32 / DCP) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | DCP (FSDP2, 8 shards, pesos maestros fp32); requiere conversion a HF para uso con Transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B-Base, un transformer denso de aproximadamente 8.000 millones de parámetros. Sobre esa base, el proyecto prestar aplica *continued pre-training* (re-CPT) con el dataset `JackHsieh/statML-arxiv-iid-160M-20M`, restringido a `train[:9728]` (la ventana iid completa de 40M), y antepone "thoughts" del modelo `JackHsieh/8B-gpnp-rl-step1664.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought` a cada fragmento con stride 1.

El checkpoint corresponde al paso 637 de 812 (ordinal 1595) de la ejecución registrada en W&B con el identificador `ccni1oz6`. El entrenamiento usa FSDP2 con pesos maestros en fp32, estado del optimizador AdamW, estados de RNG por rango y estado del planificador y del orden de datos. El repositorio incluye `config.yaml` con la configuración resuelta de la ejecución. No se documentan en la información disponible detalles sobre el número total de tokens procesados, la composición exacta del dataset ni si hubo fases de RLHF o DPO en esta ejecución concreta.

## Capacidades

- No es un modelo final: las capacidades no están validadas ni documentadas por el autor.
- Al derivar de Qwen3-8B-Base, se espera que conserve las capacidades del modelo base (generación de texto, razonamiento, código y matemáticas), pero no hay evaluación publicada de este checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: no disponibles; el proyecto se orienta a investigación sobre pensamiento latente y RL.

## Casos de uso

- Reanudación de la ejecución de entrenamiento: descargar el checkpoint en `<checkpointing.directory>/latest/step-000637/`, escribir un `latest/LATEST.json` con `{"dir": "step-000637", "step": 637, "ordinal": 1595}` y relanzar con `checkpointing.resume.mode=auto`. Es el uso principal declarado por el autor.
- Estudio de la dinámica de re-CPT: analizar el estado intermedio del modelo para comparar representaciones y pérdidas en el paso 637 frente a pasos anteriores o posteriores.
- Extracción de pesos para evaluación: convertir el checkpoint a formato Hugging Face con `python -m prestar.cpt.tools.convert_cpt_checkpoint to-hf --checkpoint <dir> --output <hf_dir> --add-special-tokens "<|note|>" "<|/note|>"` y evaluar el modelo resultante en tareas de razonamiento.
- Reproducibilidad de experimentos: servir como artefacto verificable para replicar la ejecución `ccni1oz6` en otro entorno de cómputo.
- Investigación sobre pensamiento latente: estudiar cómo influyen los "thoughts" antepuestos en el preentrenamiento sobre el comportamiento del modelo base.
- Auditoría de configuraciones de entrenamiento: inspeccionar `config.yaml` y `checkpoint_meta.json` para documentar hiperparámetros y estado del planificador en un punto intermedio de la ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este checkpoint; al ser DCP con pesos maestros fp32, el estado completo ocupa aproximadamente 98,3 GB en el repositorio.
- GPU recomendadas: no disponibles para este checkpoint; el entrenamiento se realizó con FSDP2 sobre 8 rangos (world size 8), lo que sugiere un nodo de 8 GPU.
- ¿Cabe en GPU de consumo? No en su formato actual; tras conversión a Hugging Face y cuantización podría evaluarse, pero no hay datos publicados.
- Opciones de despliegue: no aplica directamente; requiere conversión a formato Hugging Face antes de usar con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (prestar, paso 637) | ~8B | no disponible | apache-2.0 | Checkpoint DCP intermedio | No es modelo final; requiere conversión |
| Qwen/Qwen3-8B-Base | ~8B | no disponible en la informacion | apache-2.0 | Pesos Hugging Face | Modelo base del que deriva |
| JackHsieh/8B-gpnp-rl-step1664.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought | no disponible | no disponible | no disponible | Pesos Hugging Face | Fuente de los "thoughts" antepuestos |

## Limitaciones y advertencias

- No es un modelo final: es un checkpoint intermedio en el paso 637 de 812, subido como copia de seguridad; no debe usarse en producción.
- El formato DCP de FSDP2 no es compatible con Transformers; es necesaria una conversión explícita antes de cualquier uso con herramientas estándar.
- El repositorio incluye estado del optimizador, RNG y planificador, lo que incrementa el tamaño (98,3 GB) y no aporta valor para inferencia.
- No hay evaluación publicada de sesgos, alucinación ni calidad de generación para este checkpoint.
- No se documentan los idiomas soportados ni la longitud de contexto efectiva tras el re-CPT.
- La licencia apache-2.0 permite uso comercial, pero el estado intermedio y la falta de validación desaconsejan cualquier uso en producción.
- El dataset y los "thoughts" antepuestos pueden introducir sesgos específicos del dominio statML/arXiv que no han sido analizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JackHsieh/8B-base.8B-gpnp-rl-step1664-kv-tags-thought-thoughts.iid-40M-full.stride-1.dcp-step-637
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Modelo fuente de los "thoughts": https://huggingface.co/JackHsieh/8B-gpnp-rl-step1664.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought
- Ejecución W&B: https://wandb.ai/latent-thoughts/prestar/runs/ccni1oz6
