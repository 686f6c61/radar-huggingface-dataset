# siddharthmb/2026.TA.l1c_headline_2026-10_n_nmse0_tc8192_decb_l1w0.001_fp32_tarbb_lb2_ln0_dr40000_sl17824465

## Resumen

Este repositorio contiene un adaptador de tipo transcoder disperso (sparse transcoder adapter) construido sobre el modelo congelado google/gemma-2-2b. No es un modelo de lenguaje autonomo, sino una rama adicional ReLU de la forma `dec(relu(enc(x)))` insertada en cada bloque MLP del modelo base. La rama se entrena en modo *bridging* para que la combinacion de base mas rama reproduzca el comportamiento del modelo ajustado google/gemma-2-2b-it. El objetivo es que las caracteristicas aprendidas durante el ajuste queden aisladas, dispersas e inspeccionables.

Lo desarrolla el usuario siddharthmb en el marco del proyecto transcoder-adapters, asociado al articulo "Transcoder Adapters for Reasoning-Model Diffing" (arXiv:2602.20904) y a un repositorio publico en GitHub. La relevancia es metodologica: en lugar de diffing de pesos opacos, ofrece una representacion dispersa y atribuible de la diferencia funcional entre un modelo base y su version instruida, con 8192 caracteristicas por capa MLP.

El checkpoint ocupa 9,2 GB y declara 3.596.141.824 parametros totales (modelo base mas ramas transcoder). Se distribuye en formato safetensors, es compatible con transformers y con text-generation-inference, y no declara licencia ni idiomas de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma2 (transformer decoder) con ramas transcoder ReLU anadidas en cada MLP |
| Parametros totales | 3.596.141.824 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (heredada de google/gemma-2-2b) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en fp32 |
| Idiomas soportados | no disponible en la ficha; hereda los de google/gemma-2-2b |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 9,2 GB); requiere las clases del repositorio para cargar la rama |

## Arquitectura y entrenamiento

La arquitectura base es Gemma 2 en su variante de 2B parametros: un transformer decoder con atencion alternando entre atencion global y local por capas, normalizacion RMSNorm y activaciones GeGLU en los MLP. Sobre ese esqueleto congelado se anade, en cada MLP, una rama transcoder compuesta por un encoder lineal, una no linealidad ReLU y un decoder lineal con sesgo (`dec_bias: True`), con `n_features` de 8192 caracteristicas por capa. El entrenamiento se realiza en modo *bridging*: el modelo base mas la rama debe aproximar la distribucion de salida de google/gemma-2-2b-it, de modo que la rama absorbe la diferencia funcional introducida por el ajuste de instrucciones.

Los hiperparametros declarados incluyen `l1_weight: 0.001` (regularizacion de dispersidad sobre las caracteristicas), tasa de aprendizaje 0.0008, tamano de lote 4, una sola epoca, warmup ratio 0,05 y funcion de perdida KL. La combinacion de perdidas usa `lambda_adapt: 1.0`, `lambda_bridge: 2.0` y `lambda_nmse: 0`. El backbone objetivo es `target` (las MLP originales se sustituyen por las ramas durante el bridge) y `n_cutoffs: 1`. El entrenamiento se lanzo mediante `python -m training.train` del repositorio transcoder-adapters sobre el dataset siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits, derivado de LMSYS-Chat-1M, como job Slurm 17824465 en jagupard32.stanford.edu el 2026-10-12. El tokenizador empleado es el de google/gemma-2-2b-it.

## Capacidades

- Generacion de texto condicionada al modelo base google/gemma-2-2b, con la rama transcoder reproduciendo el comportamiento del modelo instruido.
- Reproduccion parcial del ajuste de instrucciones: sobre las filas de evaluacion retenidas alcanza una coincidencia de top-1 de 0,85695 frente a gemma-2-2b-it.
- Inspeccion de caracteristicas dispersas: cada una de las 8192 caracteristicas por MLP puede consultarse y editarse individualmente.
- Steering por caracteristica: la CLI admite `--steer CANTOR_ID:STRENGTH` para modular una caracteristica concreta por su identificador de Cantor.
- Generacion de grafos de atribucion mediante `analysis.attribution.graphs.build_graphs`, con soporte para GemmaScope y presupuestos configurables.
- Conmutacion de modo: `set_transcoders_enabled(False)` desactiva las ramas y recupera un modelo hibrido con las MLP base y la atencion y embeddings del modelo de referencia.
- Interaccion conversacional a traves de `analysis.chat.cli`.
- No se declaran capacidades de tool calling, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion de interpretabilidad mecanistica: analizar que caracteristicas dispersas de cada MLP codifican el comportamiento aprendido por gemma-2-2b-it, comparando la rama activa con el modelo base congelado.
- Diffing de modelos: aislar la diferencia funcional entre un modelo base y su variante instruida sin recurrir a comparaciones directas de pesos, usando las metricas KL y de acuerdo top-1 como medida cuantitativa.
- Grafos de atribucion: construir grafos de atribucion sobre el adaptador para trazar que caracteristicas contribuyen a una prediccion concreta, integrable con GemmaScope.
- Steering controlado: modular una caracteristica concreta mediante `--steer` para estudiar su efecto causal sobre la generacion, util en experimentos de edicion de comportamiento.
- Formacion y docencia en interpretabilidad: el repositorio ofrece un ejemplo reproducible (config, comando exacto y manifiesto de ejecucion) para ensenar tecnicas de transcoders y adaptacion dispersa.
- Reproduccion de experimentos: reentrenar desde el `train_config.yaml` publicado para validar resultados o variar hiperparametros como `n_features` o `l1_weight`.
- Chat exploratorio con control de caracteristicas: usar la CLI de chat para conversar y, en paralelo, observar o intervenir sobre caracteristicas especificas del adaptador.

## Benchmarks y rendimiento

El autor solo publica metricas de tokens frente al modelo de referencia sobre filas retenidas del benchmark lmsys_chat. No hay MMLU, HumanEval, GSM8K ni resultados comparables.

| Metrica | Valor |
|---|---|
| kl_mean | 0,1669507473707199 |
| kl_mean_interesting | 0,292151 |
| top1_agreement | 0,85695 |
| top1_agreement_interesting | 0,702664 |
| n_interesting | 15464 |
| n_samples | 200 |
| n_tokens | 34100 |

Las variantes `*_interesting` consideran unicamente las posiciones en las que el modelo base y el de referencia discrepan, es decir, donde la rama debe hacer el trabajo. Un KL menor y un acuerdo mayor indican que la rama reproduce mejor el ajuste de instrucciones.

## Requisitos de hardware

- VRAM estimada en fp32: el checkpoint completo ronda los 9,2 GB en disco; cargado en memoria en fp32 los 3,6B parametros requieren aproximadamente 14,4 GB, a los que se suman activaciones y cache KV.
- La carga del checkpoint se realiza con `device_map="auto"`, lo que permite repartir el modelo entre varias GPU si no cabe en una sola.
- GPU de gama profesional recomendadas: A100 40/80 GB, H100, L40S. Una unica RTX 4090 de 24 GB puede alojar el modelo si se reduce a bf16 o fp16, dado el limite de memoria frente al fp32 del checkpoint.
- Cabe en GPU de consumo (RTX 3090, 4090) si se convierte a precision reducida; en fp32 es ajustado incluso en 24 GB.
- Opciones de despliegue: transformers (libreria declarada) y text-generation-inference (`endpoints_compatible`). No se documentan integraciones con llama.cpp, Ollama ni vLLM, y la naturaleza del adaptador (clases propias del repositorio) complica el uso con motores genericos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador transcoder | 3,6B (base + ramas) | 8192 tokens | top1_agreement 0,857 vs gemma-2-2b-it | no disponible | HuggingFace, requiere clases propias |
| google/gemma-2-2b | ~2,6B | 8192 tokens | base sin ajuste de instrucciones | Gemma Terms | HuggingFace, uso amplio |
| google/gemma-2-2b-it | ~2,6B | 8192 tokens | modelo de referencia instruido | Gemma Terms | HuggingFace, uso amplio |
| LoRA/adaptadores densos tipicos | ~10-100M | segun base | ajuste end-to-end opaco | variable | HuggingFace, ecosistema estandar |

Frente a un LoRA convencional, la diferencia clave no es de rendimiento sino de interpretabilidad: el adaptador expone caracteristicas dispersas editables e inspeccionables, a costa de un repositorio mucho mayor y de una carga no estandar. No se dispone de comparativas publicadas con otros transcoders sobre el mismo benchmark.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base google/gemma-2-2b y las clases personalizadas del repositorio para cargarse; no funciona con un `AutoModelForCausalLM` estandar.
- El objetivo no es superar al modelo de referencia, sino aproximarlo: el acuerdo top-1 es 0,857 global y 0,703 en las posiciones donde base y referencia discrepan, lo que implica que no reproduce completamente el ajuste.
- Riesgo de alucinacion no documentado; al heredar el comportamiento del modelo base y de gemma-2-2b-it, arrastra sus sesgos y errores.
- Sesgos conocidos: no disponibles en la informacion proporcionada. El dataset de entrenamiento (LMSYS-Chat-1M) puede introducir sesgos propios de conversaciones reales.
- La licencia no esta declarada, lo que impide determinar si se permite uso comercial; ademas, el modelo base Gemma 2 esta sujeto a los terminos de uso de Google.
- Idiomas soportados no especificados; conviene asumir el comportamiento del modelo base, con dominio principal del ingles.
- Compatibilidad con cuantizacion y con motores de inferencia genericos no documentada.
- Fecha de creacion 2026-10-12, con 0 descargas y 0 likes: modelo de investigacion sin validacion externa ni adopcion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.l1c_headline_2026-10_n_nmse0_tc8192_decb_l1w0.001_fp32_tarbb_lb2_ln0_dr40000_sl17824465
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Paper "Transcoder Adapters for Reasoning-Model Diffing": https://arxiv.org/abs/2602.20904
- Pagina del proyecto: https://transcoder-adapters.github.io/
- Codigo: https://github.com/Sid-MB/transcoder-adapters
- Run de W&B: https://wandb.ai/siddharth-stanford/sparse-adaptation/runs/u2w0k2hz
- Config de entrenamiento: train_config.yaml (en el repositorio del modelo)
