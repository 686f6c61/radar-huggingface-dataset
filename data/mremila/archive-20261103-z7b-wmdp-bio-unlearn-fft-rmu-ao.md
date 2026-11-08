# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-ao

## Resumen

Este modelo es un fine-tuning de HuggingFaceH4/zephyr-7b-beta publicado por el usuario mremila bajo el identificador `archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-ao`. Por su nomenclatura y por la configuracion de entrenamiento recogida en la model card, se trata de un artefacto experimental de investigacion sobre desaprendizaje (machine unlearning) en el dominio de biologia, no de un modelo de proposito general pensado para produccion. El sufijo `wmdp-bio` remite al corpus WMDP (Weapons of Mass Destruction Proxy) en su subconjunto de biologia, y `rmu` a la tecnica Representation Misdirection for Unlearning, aplicada aqui con un trainer personalizado (`RMUAOTrainer`) sobre Axolotl 0.18.0.

El modelo parte de Zephyr-7B-beta, un transformer decoder-only de 7.241.732.096 parametros (segun los safetensors del repositorio) afinado con DPO sobre Mistral-7B. El fine-tuning aqui realizado congela practicamente toda la red y solo actualiza los pesos `mlp.down_proj` de las capas 5, 6 y 7, lo que lo convierte en un experimento de edicion minima de representaciones internas mas que en un reentrenamiento completo.

La relevancia es acotada y metodologica: sirve como evidencia reproducible de un pipeline de unlearning con coeficientes de retencion y direccionamiento de capas concretos, y como referencia para estudiar la resistencia a la manipulacion (el proyecto de W&B se llama `lp-tamper-resistance`). No hay resultados de evaluacion publicados, ni licencia declarada, ni idiomas especificados, por lo que su uso fuera de un contexto de investigacion no esta justificado con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral-7B via Zephyr-7B-beta) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso `sequence_len: 512` |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican GGUF ni quantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 15.0 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Zephyr-7B-beta, un decoder-only basado en Mistral-7B con atencion por ventanas deslizantes y RoPE, afinado originalmente con DPO. Sobre esa base, este artefacto aplica un fine-tuning supervisado de muy baja intervencion: segun la configuracion de Axolotl, solo se descongelan los pesos `model.layers.5.mlp.down_proj.weight`, `model.layers.6.mlp.down_proj.weight` y `model.layers.7.mlp.down_proj.weight`. El resto del modelo permanece congelado, lo que limita el cambio de comportamiento a tres proyecciones de bajada dentro del bloque MLP.

El entrenamiento usa el trainer `RMUAOTrainer` con `reference_model_name_or_path: HuggingFaceH4/zephyr-7b-beta`, `retain_coefficient: 600.0`, `steering_coefficient: 6.5`, `target_layer: 7`, `target_layers: [5, 6, 7]` y `activation_orthogonality_coefficient: 0.01`. Los datos combinan `cais/wmdp-bio-forget-corpus` (split train) con `Salesforce/wikitext` (wikitext-2-raw-v1, split test), procesados con `data.authors_documents` y `shuffle_merged_datasets: false`. Hiperparametros: `learning_rate: 5.0e-5`, `optimizer: adamw_torch`, `lr_scheduler: constant`, `warmup_steps: 0`, `max_grad_norm: 0.0`, `max_steps: 150`, `micro_batch_size: 8`, `gradient_accumulation_steps: 1`, `bf16: true`, `attn_implementation: eager`, `seed: 42` y `data_seed: 42`. El `device_map` reparte el modelo en cuatro GPUs (capas 0-7 en GPU 0, 8-15 en GPU 1, 16-23 en GPU 2, 24-31 mas `norm` y `lm_head` en GPU 3), lo que indica un entrenamiento multi-GPU con sharding manual.

No se documenta numero total de tokens de entrenamiento, composicion porcentual del dataset ni si hubo etapas adicionales de RLHF o DPO sobre este artefacto. La innovacion tecnica declarada es el uso de RMU con ortogonalidad de activaciones y un coeficiente de retencion muy alto (600.0), orientado a preservar capacidades generales mientras se suprime informacion del dominio objetivo.

## Capacidades

- Generacion de texto conversacional: hereda el formato de chat de Zephyr-7B-beta (prompt con `system`, `user` y `assistant`), aunque la model card no documenta plantilla propia.
- Razonamiento y conocimiento general: preservado de forma parcial por el termino de retencion sobre wikitext, sin evaluacion publicada.
- Codigo y matematicas: capacidades heredadas de Zephyr-7B-beta, no verificadas en este artefacto.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas no estan declarados.
- Capacidades especiales: el artefacto esta disenado especificamente para desaprendizaje del dominio de biologia (WMDP-bio), no para una capacidad nueva.
- Vision y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Investigacion en machine unlearning: el modelo sirve como punto de comparacion reproducible para estudiar el efecto de RMU con `target_layers: [5, 6, 7]` y `retain_coefficient: 600.0` frente a otras tecnicas como NPO o gradient difference, usando el corpus WMDP-bio como conjunto de olvido.
- Evaluacion de resistencia a la manipulacion: el proyecto W&B `lp-tamper-resistance` sugiere su uso para medir si el olvido persiste tras reentrenamientos o fine-tunings posteriores (relearning), comparandolo con artefactos hermanos del mismo autor.
- Analisis de edicion minima de pesos: al modificar solo tres matrices `down_proj`, permite estudiar hasta que punto un cambio localizado en capas 5-7 altera el comportamiento global del modelo.
- Reproduccion de pipelines Axolotl: la configuracion completa publicada en la model card sirve como referencia para replicar entrenamientos con `RMUAOTrainer` y `custom_trainer_args` en entornos multi-GPU.
- Estudio de trade-off olvido-retencion: el par de datasets (WMDP-bio forget + wikitext retain) permite analizar como varia la perplejidad en wikitext al aumentar la supresion de informacion biologica.
- Docencia y formacion: util como ejemplo didactico de fine-tuning selectivo con `unfrozen_parameters` y de configuracion de `device_map` manual en cuatro GPUs.

## Benchmarks y rendimiento

La model card declara un `model-index` con nombre `artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu-ao` y `results: []`, es decir, sin entradas de benchmark. No hay resultados de MMLU, HumanEval, GSM8K, WMDP ni de ninguna otra evaluacion publicados en la informacion disponible. Tampoco se reportan metricas de olvido (accuracy en WMDP-bio) ni de retencion (perplejidad en wikitext) tras el entrenamiento.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14,5 GB solo para pesos (7.241.732.096 parametros × 2 bytes), mas overhead de activaciones y cache KV; en la practica, en torno a 16-18 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 4-5 GB (estimaciones teoricas, no se publican quantizaciones oficiales).
- GPU recomendadas: el `device_map` de entrenamiento usa cuatro GPUs (reparto en capas 0-7, 8-15, 16-23 y 24-31 + `norm` + `lm_head`), lo que sugiere A100/H100 de 40-80 GB para entrenamiento. Para inferencia, una sola A100 40 GB, H100 o L40S es suficiente en bf16.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado, y en RTX 3090/4080 con cuantizacion de 8 bits; en GPUs de 8-12 GB requeriria cuantizacion de 4 bits y contextos reducidos.
- Opciones de despliegue: al estar en formato safetensors y con tag `text-generation-inference` y `endpoints_compatible`, es compatible con TGI y con `transformers`; para llama.cpp/Ollama habria que convertir los pesos a GGUF, lo que no se ha publicado. vLLM es viable si se anade configuracion de chat y se valida el tokenizer de Zephyr.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-ao | 7.241.732.096 | no disponible | no disponible | Hugging Face (0 descargas) | Artefacto de unlearning RMU sobre Zephyr-7B-beta |
| HuggingFaceH4/zephyr-7b-beta | 7.000 millones (aprox.) | 32.768 tokens (declarado por el autor original) | MIT (según el modelo base original) | Hugging Face, ampliamente adoptado | Modelo base; DPO sobre Mistral-7B |
| mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft | no disponible | no disponible | no disponible | Hugging Face | Variante del mismo autor con NPO y etapa de relearning |
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied | no disponible | no disponible | no disponible | Hugging Face | Variante del mismo autor con gradient difference |

La comparacion con modelos de proposito general no es significativa: este artefacto comparte arquitectura y pesos base con Zephyr-7B-beta, pero su valor esta en la intervencion de unlearning, no en el rendimiento bruto. Frente a las variantes hermanas del mismo autor, la diferencia es la tecnica aplicada (RMU con ortogonalidad frente a NPO o gradient difference) y la presencia o no de una etapa de relearning.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar Zephyr-7B-beta, arrastra los sesgos del modelo base y de sus datos de entrenamiento, sin que se haya realizado una evaluacion de sesgo sobre este artefacto.
- Riesgo de alucinacion: no evaluado; el fine-tuning selectivo de tres matrices `down_proj` no elimina la tendencia generativa a inventar contenido.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni idiomas; el entrenamiento uso `sequence_len: 512`, lo que no garantiza buen comportamiento mas alla de esa longitud.
- Restricciones de licencia: la licencia figura como "no disponible"; hasta que el autor la declare, no hay base clara para uso comercial. Ademas, la licencia del modelo base (Zephyr-7B-beta) impone sus propios terminos, que deben verificarse por separado.
- Caveat de proposito: el sufijo `archive-20261103` y la ausencia de descargas y likes indican un artefacto de archivo experimental, no un modelo mantenido. No hay model card completada (secciones "More information needed").
- Caveat de evaluacion: no se publican metricas de olvido ni de retencion, por lo que no se puede afirmar que el desaprendizaje haya sido efectivo ni que las capacidades generales se hayan preservado.
- Caveat de reproducibilidad: la configuracion depende de un plugin externo (`axolotl_plugins.custom_trainer_args.CustomTrainerArgsPlugin`) y de un trainer (`trainers.rmu.RMUAOTrainer`) que no se distribuyen en el repositorio, lo que dificulta replicar el entrenamiento tal cual.
- Caveat de seguridad: al tratarse de un experimento sobre el corpus WMDP-bio, cualquier uso debe considerar que el olvido puede revertirse con fine-tuning posterior (relearning), como sugiere la existencia de variantes hermanas con etapa de relearning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-ao
- Modelo base Zephyr-7B-beta: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Dataset WMDP-bio forget corpus: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset Wikitext: https://huggingface.co/datasets/Salesforce/wikitext
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Variante hermana con NPO y relearning: https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft
- Variante hermana con gradient difference: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied
