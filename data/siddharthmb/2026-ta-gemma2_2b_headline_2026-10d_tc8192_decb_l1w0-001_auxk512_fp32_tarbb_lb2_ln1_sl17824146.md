# siddharthmb/2026.TA.gemma2_2b_headline_2026-10d_tc8192_decb_l1w0.001_auxk512_fp32_tarbb_lb2_ln1_sl17824146

## Resumen

Este repositorio contiene un adaptador transcoder disperso (sparse transcoder adapter) construido sobre google/gemma-2-2b, desarrollado por el usuario siddharthmb en el marco del proyecto transcoder-adapters. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es una rama ReLU de la forma `dec(relu(enc(x)))` insertada en cada bloque MLP del modelo base, que permanece congelado. La rama se entrena en modo bridging para que el modelo base mas la rama reproduzca el comportamiento de google/gemma-2-2b-it, de modo que las features aprendidas constituyen el fine-tuning, pero de forma dispersa e inspeccionable.

El checkpoint declara 3.596.141.824 parametros totales (unos 3,6 mil millones) segun los pesos en safetensors, sobre un modelo base de arquitectura Gemma 2. El repositorio ocupa 9,2 GB. El entrenamiento se realizo en fp32, con 8.192 features por transcoder, sesgo de decodificacion activado, peso L1 de 0,001, learning rate de 8e-4, batch size de 4 y una sola epoca, con funcion de perdida KL y una combinacion de terminos `lambda_adapt=1.0`, `lambda_bridge=2.0` y `lambda_nmse=1`.

Su relevancia es fundamentalmente de investigacion: proporciona una via para diferenciar (diffing) modelos, auditar que cambia un fine-tuning respecto al modelo base y construir grafos de atribucion, en lugar de ofrecer un modelo de generacion de texto de proposito general. El repositorio no registra descargas ni likes en el momento de redactar esta ficha y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (modelo base congelado) + rama transcoder ReLU `dec(relu(enc(x)))` en cada MLP |
| Parametros totales | 3.596.141.824 |
| Parametros activos | No aplica (no es un modelo MoE). La rama transcoder es dispersa: 8.192 features por transcoder con regularizacion L1 de 0,001 |
| Longitud de contexto | no disponible (no se especifica en la model card; heredada del modelo base google/gemma-2-2b) |
| Tipos de cuantizacion | no disponible. El entrenamiento se realizo en fp32 (el identificador del run incluye `fp32`); no se publican cuantizaciones alternativas |
| Idiomas soportados | no disponible (tokenizer de google/gemma-2-2b-it) |
| Licencia | no disponible (la model card no declara licencia; debe verificarse ademas la licencia del modelo base) |
| Formato de pesos | safetensors (libreria transformers, con clases de modelo propias del repositorio) |

## Arquitectura y entrenamiento

La arquitectura parte de google/gemma-2-2b con todos sus pesos congelados. Sobre cada una de las capas MLP se anade una rama transcoder compuesta por un encoder, una no linealidad ReLU y un decoder con sesgo (`dec_bias: True`), configurada con 8.192 features (`n_features: 8192`). El modelo resultante se carga con las clases propias del proyecto (`models.auto.load_transcoder_model`), y existe un modo hibrido que desactiva los transcoders mediante `set_transcoders_enabled(False)`, dejando los MLP del modelo base junto con la atencion y los embeddings del modelo de referencia.

El entrenamiento se realizo en modo bridging: el objetivo no es imitar la salida del modelo base, sino que base mas rama igualen la distribucion de google/gemma-2-2b-it. La perdida combina un termino KL (`loss_type: kl`), un termino de adaptacion (`lambda_adapt: 1.0`), un termino de puenteo (`lambda_bridge: 2.0`) y un termino NMSE (`lambda_nmse: 1`), con `n_cutoffs: 1` y `backbone: target`. Los hiperparametros incluyen learning rate 8e-4, batch size 4, una epoca, warmup ratio 0,05 y regularizacion L1 de 0,001 sobre las activaciones. El run se lanzo mediante Slurm (job `17824146`, iniciado el 2026-10-12) con el comando `uv run python -m training.train --config training/configs/gemma2_2b.yaml training/configs/headline_2026-10d.yaml --resume=latest`, sobre el dataset siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits, derivado de LMSYS-Chat-1M. La innovacion central es que el fine-tuning queda expresado como features dispersas y etiquetables por identificador cantor, lo que permite intervenirlas individualmente (`--steer CANTOR_ID:STRENGTH`) y generar grafos de atribucion sobre el adaptador.

## Capacidades

- Generacion de texto conversacional: el modelo se puede usar directamente en modo chat mediante el CLI del proyecto, condicionado por el comportamiento aprendido del modelo de referencia gemma-2-2b-it.
- Reproduccion aproximada de un fine-tuning: el adaptador aproxima la distribucion de gemma-2-2b-it sin modificar los pesos del modelo base.
- Inspeccion de features: las 8.192 features por transcoder son identificables y consultables, lo que permite analizar que representaciones se activan ante una entrada dada.
- Steering de features: es posible intervenir una feature concreta por su identificador cantor y una intensidad determinada, modificando la generacion de forma dirigida.
- Construccion de grafos de atribucion: el repositorio incluye herramientas (`analysis.attribution.graphs.build_graphs`) compatibles con GemmaScope y con control de presupuesto para trazar la contribucion de componentes internos.
- Diferenciacion de modelos (model diffing): permite aislar las diferencias funcionales entre gemma-2-2b y gemma-2-2b-it en forma de features dispersas.
- Modo hibrido: con `set_transcoders_enabled(False)` se obtiene un modelo intermedio con los MLP del base y la atencion y embeddings del modelo de referencia.
- Tool calling, function calling, agentes, vision, audio o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Interpretabilidad mecanistica de Gemma 2 2B: el adaptador permite identificar y etiquetar features concretas responsables de comportamientos aprendidos, ya que cada feature tiene un identificador cantor y se puede activar o desactivar de forma aislada.
- Diffing de fine-tunings: comparar que cambia exactamente entre un modelo base y su version instruct, expresando la diferencia como un conjunto de features dispersas en lugar de como una diferencia opaca de pesos.
- Auditoria de comportamiento y seguridad: los grafos de atribucion permiten rastrear que componentes internos contribuyen a una prediccion concreta, lo que resulta util para estudiar comportamientos indeseados antes de desplegar un modelo similar.
- Steering controlado en experimentos: mediante `--steer CANTOR_ID:STRENGTH` se puede amplificar o suprimir una caracteristica concreta y medir el efecto sobre la generacion, un escenario tipico en estudios de alineacion y control.
- Reproduccion de resultados academicos: el repositorio publica la configuracion exacta, el comando de entrenamiento, el run de W&B y el manifiesto del job de Slurm, lo que permite replicar el experimento descrito en el paper de transcoder adapters.
- Investigacion sobre sparse adaptation: sirve como caso de estudio para evaluar si una rama dispersa puede sustituir total o parcialmente a un fine-tuning denso, comparando el KL frente al modelo de referencia.
- Generacion de corpus anotados internamente: las features activadas por cada token permiten construir conjuntos de datos con anotaciones a nivel de representacion, utiles para entrenar clasificadores o sondas posteriores.
- Docencia y formacion tecnica: al ser un modelo pequeno con ramas inspeccionables, es adecuado para demostrar tecnicas de transcoders y atribucion en cursos de interpretabilidad.

## Benchmarks y rendimiento

Los unicos datos publicados son metricas de token frente al modelo de referencia sobre filas reservadas (held-out) del split de LMSYS-Chat-1M. Se evaluaron 200 muestras y 34.100 tokens, de los cuales 15.464 corresponden a posiciones "interesting" (aquel las en que el modelo base y el de referencia discrepan y, por tanto, la rama debe hacer el trabajo).

| Metrica | Valor |
|---|---|
| kl_mean | 0,1254049688577652 |
| kl_mean_interesting | 0,226146 |
| top1_agreement | 0,871935 |
| top1_agreement_interesting | 0,728337 |
| n_samples | 200 |
| n_tokens | 34.100 |
| n_interesting | 15.464 |
| per_benchmark/lmsys_chat/kl_mean | 0,1254049688577652 |
| per_benchmark/lmsys_chat/top1_agreement | 0,871935 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.596.141.824 parametros, en bf16 o fp16 los pesos ocupan aproximadamente 7,2 GB; en fp32, aproximadamente 14,4 GB. Hay que sumar el coste de activaciones y del cache KV, que depende de la longitud de contexto.
- El repositorio ocupa 9,2 GB, consistente con pesos en precision de 16 bits mas ficheros auxiliares.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo cabe con holgura en una A100 de 40 GB, una H100 de 80 GB o una L40S de 48 GB, y de forma ajustada en GPUs de 16 GB a 24 GB en bf16.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 3090 y RTX 4080 (16 GB) en bf16, siempre que se use `device_map="auto"` y se limite la longitud de contexto. En fp32 requiere al menos 16 GB solo para pesos, por lo que seria necesario repartir entre GPU y CPU.
- Opciones de despliegue: el checkpoint requiere las clases propias del repositorio (`models.auto.load_transcoder_model`) y el codigo de github.com/Sid-MB/transcoder-adapters. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Existe integracion marcada como `endpoints_compatible` en los tags, pero no se detalla su alcance.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (siddharthmb) | 3.596.141.824 | no disponible | kl_mean 0,1254 y top1_agreement 0,8719 frente a gemma-2-2b-it en LMSYS-Chat-1M | no disponible | Pesos en safetensors; 0 descargas y 0 likes |
| google/gemma-2-2b (modelo base) | no disponible en la informacion proporcionada | no disponible | Referencia sobre la que se mide la divergencia | no disponible en la informacion proporcionada | Publico en HuggingFace |
| google/gemma-2-2b-it (modelo de referencia) | no disponible en la informacion proporcionada | no disponible | Objetivo de la aproximacion; se usa como referencia para KL y acuerdo top-1 | no disponible en la informacion proporcionada | Publico en HuggingFace |

No se dispone de datos publicados que permitan comparar este adaptador con otros esquemas de adaptacion dispersa, SAEs o transcoders sobre Gemma 2 en terminos de paridad de rendimiento en tareas estandar.

## Limitaciones y advertencias

- No es un modelo de proposito general: esta disenado como herramienta de analisis y no se ha evaluado en tareas de generacion, razonamiento o codigo.
- Divergencia residual respecto al modelo de referencia: el KL medio es 0,1254 y sube a 0,2261 en las posiciones donde base y referencia discrepan; el acuerdo top-1 cae del 87,2 por ciento global al 72,8 por ciento en esas posiciones. La rama no reproduce el fine-tuning de forma exacta.
- Evaluacion limitada: las metricas proceden de 200 muestras y 34.100 tokens de un unico benchmark (LMSYS-Chat-1M), por lo que la generalizacion a otros dominios no esta demostrada.
- Sesgos: el entrenamiento usa LMSYS-Chat-1M, un corpus de conversaciones con sesgos propios de su procedencia, que pueden reflejarse en las features aprendidas.
- Alucinacion: al heredar el comportamiento del modelo base y del de referencia, mantiene su propension a generar contenido incorrecto con apariencia plausible.
- Licencia no declarada: la model card no indica licencia. Ademas, el modelo se deriva de google/gemma-2-2b, por lo que hay que verificar las condiciones de uso comercial del modelo base antes de cualquier explotacion.
- Dependencia de codigo externo: la carga requiere el repositorio transcoder-adapters y sus clases personalizadas; no funciona con el cargador estandar de transformers sin ese codigo.
- Idiomas: no se documenta que idiomas soporta el adaptador; el tokenizer proviene de gemma-2-2b-it.
- Madurez: 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- Naturaleza del artefacto: no es un MoE, por lo que no debe interpretarse la dispersion de features como parametros activos reducidos en el sentido habitual.
- Reproducibilidad atada al entorno: la configuracion original apunta a rutas de cluster (`/nlp/scr/siddharth/...`) y a un job de Slurm concreto, por lo que hay que sobrescribir `output_dir` y `wandb_run_name` para reentrenar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_headline_2026-10d_tc8192_decb_l1w0.001_auxk512_fp32_tarbb_lb2_ln1_sl17824146
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia: https://huggingface.co/google/gemma-2-2b-it
- Tokenizer: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Paper: https://arxiv.org/abs/2602.20904
- Pagina del proyecto: https://transcoder-adapters.github.io/
- Codigo: https://github.com/Sid-MB/transcoder-adapters
- Run de W&B: https://wandb.ai/siddharth-stanford/sparse-adaptation/runs/u60xfvxu
