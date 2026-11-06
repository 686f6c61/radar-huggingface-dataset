# siddharthmb/2026.TA.gemma2_2b_headline_2026-10g_tc8192_decb_l1w0.0003_auxk512_ctr_fp32_tarbb_lb2_sl18197693

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo al uso, sino un adaptador de transcoder disperso (sparse transcoder adapter) construido sobre `google/gemma-2-2b`. El autor, siddharthmb, añade una rama ReLU `dec(relu(enc(x)))` sobre cada MLP del modelo base congelado y la entrena en modo *bridging* para que el conjunto base más rama reproduzca el comportamiento de `google/gemma-2-2b-it`. El objetivo es hacer que el ajuste fino sea disperso e inspeccionable: las features de la rama constituyen la adaptación.

El checkpoint corresponde a una ejecución concreta (job de Slurm 18197693, 6 de noviembre de 2026) dentro del proyecto transcoder-adapters, asociado al paper *Transcoder Adapters for Reasoning-Model Diffing* (arXiv:2602.20904). La arquitectura subyacente es Gemma 2, con 3.596.141.824 parámetros totales según safetensors (base más rama), 8192 features por transcoder y un vocabulario y tokenizador heredados de `gemma-2-2b-it`.

Su relevancia es metodológica más que de producto: permite estudiar qué cambia entre un modelo base y su versión instruida, atribuir comportamiento a features concretas y aplicar *steering* por identificador de feature (cantor id), además de generar grafos de atribución. No es un modelo pensado para desplegar en producción como generador de texto, sino una herramienta de interpretabilidad y análisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformer decoder-only) con rama transcoder ReLU sobre cada MLP; modo bridging |
| Parametros totales | 3.596.141.824 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Gemma 2; no especificada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Features por transcoder | 8192 |
| Modelo base | google/gemma-2-2b |
| Modelo de referencia | google/gemma-2-2b-it |
| Tokenizador | google/gemma-2-2b-it |
| Dataset de entrenamiento | siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits |
| Tamaño del repo | 9,2 GB |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-2b` congelado y añade, en cada capa MLP, una rama transcoder compuesta por un encoder lineal, una activación ReLU y un decoder lineal con sesgo (`dec_bias: True`), con 8192 features latentes. El entrenamiento se realiza en modo *bridging*: la rama debe hacer que el modelo híbrido (base más rama) iguale la distribución de siguiente token de `google/gemma-2-2b-it`, que actúa como referencia. El backbone de atención y embeddings proviene del modelo objetivo.

Los hiperparámetros documentados son: `l1_weight` 0.0003, learning rate 0.0003, batch size 4, una época, warmup ratio 0.05, pérdida de tipo KL con `lambda_adapt` 1.0, `lambda_bridge` 2.0 y `lambda_nmse` 1, `n_cutoffs` 1 y `auxk` 512. El entrenamiento se lanzó con `python -m training.train` desde el repositorio transcoder-adapters (commit `c7e5420dd964`) en un nodo de Stanford (`jagupard35.stanford.edu`). El nombre completo del run incluye `ln1_drall_lr3e-04_bs4`, truncado en el identificador del Hub.

La innovación principal es la separación entre el ajuste fino y su representación: en lugar de un LoRA o un fine-tuning denso, la adaptación queda codificada en features dispersas inspeccionables, lo que permite atribución y manipulación directa.

## Capacidades

- Generación de texto conversacional, heredada del modelo base y alineada con `gemma-2-2b-it` mediante la rama bridging.
- Reproducción aproximada del comportamiento del modelo instruido: `top1_agreement` de 0,8909 sobre el conjunto de evaluación.
- Inspección de features: cada una de las 8192 features por transcoder es identificable y analizable.
- *Steering* por feature mediante `--steer CANTOR_ID:STRENGTH` en la CLI de chat del proyecto.
- Generación de grafos de atribución con el módulo `analysis.attribution.graphs.build_graphs`, con soporte de GemmaScope y presupuestos configurables.
- Modo híbrido con `set_transcoders_enabled(False)`, que devuelve los MLP del base con atención y embeddings del modelo de referencia.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Análisis de diferencias entre modelo base e instruido: el adaptador permite comparar la distribución de siguiente token de `gemma-2-2b` más rama frente a `gemma-2-2b-it` y localizar qué features explican la divergencia.
- Interpretabilidad mecanística: con 8192 features por MLP y grafos de atribución, se puede rastrear qué circuitos internos contribuyen a una predicción concreta en tareas de chat.
- *Steering* controlado: modificar una feature por su cantor id y medir el efecto sobre la generación, útil para experimentos de control de comportamiento sin reentrenar el modelo.
- Investigación en adaptación dispersa: sirve como punto de partida para reproducir el pipeline con otras configuraciones (`l1_weight`, número de features, épocas) y comparar la fidelidad de la destilación KL.
- Docencia y divulgación: el modo híbrido y la CLI de chat permiten demostrar cómo un adaptador pequeño reproduce el alineamiento de un modelo instruido.
- Auditoría de alineamiento: al aislar las features responsables de la diferencia entre base e instruido, se pueden estudiar sesgos o comportamientos adquiridos durante el ajuste instruccional.
- Base para *diffing* de modelos de razonamiento: el paper asociado propone esta técnica para comparar modelos de razonamiento, por lo que el checkpoint sirve como referencia reproducible en ese marco.

## Benchmarks y rendimiento

Métricas de tokens del adaptador frente al modelo de referencia sobre filas reservadas (200 muestras, 34.100 tokens, 15.464 posiciones "interesting" donde la probabilidad top de la referencia es como máximo 0,8):

| Metrica | Valor |
|---|---|
| kl_mean | 0,08876831829547882 |
| kl_mean_interesting | 0,162966 |
| top1_agreement | 0,890938 |
| top1_agreement_interesting | 0,765714 |
| n_samples | 200 |
| n_tokens | 34100 |
| n_interesting | 15464 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo ocupa 9,2 GB en safetensors, por lo que en fp32 se necesita aproximadamente esa cifra más overhead, y en fp16/bf16 alrededor de la mitad.
- GPU recomendadas: no especificadas; por tamaño, una GPU con 16-24 GB (RTX 4090, A10G, L4) debería bastar para fp16, y una A100 o H100 para experimentos con grafos de atribución y GemmaScope.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y en tarjetas de 16 GB con cuantización, aunque no se documentan recetas de cuantización.
- Opciones de despliegue: el autor indica `transformers` con las clases propias del repo (`load_transcoder_model`, `load_tokenizer`), CLI de chat (`analysis.chat.cli`) y generación de grafos (`analysis.attribution.graphs.build_graphs`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, pese a la etiqueta `text-generation-inference` del Hub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (gemma2_2b transcoder) | 3.596.141.824 | no disponible | Adaptador disperso bridging sobre Gemma 2 2B | no disponible | Hugging Face, 0 descargas |
| google/gemma-2-2b | no disponible en la información | no disponible | Modelo base denso | Gemma Terms of Use (según el modelo original) | Hugging Face |
| google/gemma-2-2b-it | no disponible en la información | no disponible | Modelo instruido denso | Gemma Terms of Use (según el modelo original) | Hugging Face |
| siddharthmb/2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_ctr_fp32_tarbb_lb2_sl17862630 | no disponible | no disponible | Variante del mismo pipeline con `l1_weight` 0.001 | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de propósito general: su función es reproducir el comportamiento del modelo instruido y exponer features, no sustituirlo en producción.
- La fidelidad es parcial: `kl_mean` de 0,0888 y `top1_agreement` de 0,8909 implican que aproximadamente un 11 % de las posiciones no coinciden con la referencia, y en posiciones "interesting" la coincidencia baja al 76,6 %.
- Requiere código propio del repositorio transcoder-adapters; no se carga con `AutoModelForCausalLM` estándar pese a la librería `transformers`.
- Licencia no declarada en el Hub: no se puede confirmar el uso comercial, y la licencia del base Gemma 2 puede imponer condiciones adicionales.
- Idiomas no declarados; el comportamiento multilingüe depende del base y del dataset LMSYS-Chat-1M empleado.
- Riesgo de alucinación y sesgos heredados de `gemma-2-2b` y de `gemma-2-2b-it`, sin evaluación específica publicada.
- Contexto máximo no documentado en esta ficha; conviene consultar la configuración del base antes de usarlo con prompts largos.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria ni informes de terceros.
- El identificador del repo está truncado respecto al nombre completo del run, lo que puede complicar la trazabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_headline_2026-10g_tc8192_decb_l1w0.0003_auxk512_ctr_fp32_tarbb_lb2_sl18197693
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia: https://huggingface.co/google/gemma-2-2b-it
- Tokenizador: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Paper: https://arxiv.org/abs/2602.20904
- Página del proyecto: https://transcoder-adapters.github.io/
- Código: https://github.com/Sid-MB/transcoder-adapters
- Run de W&B: https://wandb.ai/siddharth-stanford/sparse-adaptation/runs/6wgth1jj
- Variante relacionada (10e, l1 0.001): https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_ctr_fp32_tarbb_lb2_sl17862630
- Checkpoints del run: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_headline_2026-10g_tc8192_decb_l1w0.0003_auxk512_ctr_sl18197693_checkpoints
