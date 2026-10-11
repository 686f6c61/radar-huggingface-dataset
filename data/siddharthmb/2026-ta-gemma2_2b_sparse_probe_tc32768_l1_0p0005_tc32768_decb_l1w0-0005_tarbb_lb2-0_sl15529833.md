# siddharthmb/2026.TA.gemma2_2b_sparse_probe_tc32768_l1_0p0005_tc32768_decb_l1w0.0005_tarbb_lb2.0_sl15529833

## Resumen

El modelo `siddharthmb/2026.TA.gemma2_2b_sparse_probe_tc32768_l1_0p0005_tc32768_decb_l1w0.0005_tarbb_lb2.0_sl15529833` es un adaptador de transcoders dispersos (sparse transcoder adapter) construido sobre `google/gemma-2-2b` y publicado por el usuario siddharthmb en HuggingFace. No se trata de un modelo de lenguaje generalista, sino de un artefacto de investigacion en interpretabilidad mecanistica: sustituye o complementa las capas MLP del backbone Gemma 2 mediante diccionarios dispersos de 32.768 caracteristicas entrenados en modo "bridging" contra el modelo de referencia `google/gemma-2-2b-it`.

El checkpoint ocupa 13,1 GB y declara 6.541.122.304 parametros en safetensors, muy por encima de los aproximadamente 2,6 B del backbone Gemma 2 2B, lo que indica que el recuento incluye los parametros de los transcoders ademas del modelo base. El entrenamiento es de escala reducida (1 epoca, batch size 1, learning rate 8e-4, perdida KL con `lambda_bridge=2.0` y `lambda_adapt=1.0`) sobre `fineweb-1m-sample` y un split de LMSYS-Chat-1M, por lo que debe interpretarse como una sonda de investigacion y no como un modelo listo para produccion.

Su relevancia actual es doble: por un lado permite estudiar adaptacion dispersa y transcoders sobre un transformer moderno con atencion y embeddings del modelo de referencia; por otro, habilita herramientas concretas de analisis como el steering de caracteristicas individuales por `cantor id` y la construccion de grafos de atribucion, con soporte para GemmaScope. Con solo 12 descargas y sin licencia declarada en el repositorio, es un recurso nicho orientado a equipos de interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma2 (transformer decoder-only) con adaptadores de transcoders dispersos |
| Parametros totales | 6.541.122.304 (safetensors; incluye backbone y transcoders) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en el repositorio; el modelo base google/gemma-2-2b declara 8192 tokens |
| Tipos de cuantizacion | No se documentan cuantizaciones; el repositorio solo publica pesos safetensors |
| Idiomas soportados | No disponibles |
| Licencia | No disponible en el repositorio; al derivar de google/gemma-2-2b le aplican los terminos de la licencia Gemma de Google |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-2-2b |
| Modelo de referencia | google/gemma-2-2b-it |
| Tokenizer | google/gemma-2-2b-it |
| Modo de entrenamiento | bridging |
| Tamano del repositorio | 13,1 GB |
| Libreria | transformers |
| Descargas / likes | 12 / 0 |
| Fecha de creacion | 2026-05-22 |
| Ultima actualizacion | 2026-10-11 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 2, un transformer decoder-only con atencion alternada entre ventana local y atencion global completa, normalizacion RMSNorm y activaciones GeGLU. Sobre ese backbone, este checkpoint anade adaptadores de transcoders dispersos: diccionarios de 32.768 caracteristicas por capa (`n_features: 32768`) con sesgo de decodificacion activado (`dec_bias: True`) y regularizacion L1 de 0.0005. Los transcoders son una tecnica de interpretabilidad cercana a los autoencoders dispersos, que aproximan la computacion de una capa MLP mediante una representacion latente dispersa y facilitan identificar caracteristicas interpretables. El checkpoint se entrena en modo "bridging" contra `google/gemma-2-2b-it`, es decir, emparejando el comportamiento del adaptador con el del modelo de referencia mientras se conservan la atencion y los embeddings del backbone.

Los hiperparametros de entrenamiento documentados son: learning rate 8e-4, batch size 1, 1 epoca, warmup ratio 0.05, funcion de perdida KL, `lambda_adapt=1.0`, `lambda_bridge=2.0`, `lambda_nmse=1`, `n_cutoffs=1` y `backbone: target`. Los datos de entrenamiento son `science-of-finetuning/fineweb-1m-sample` y `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits`, una muestra de 1M de documentos de FineWeb combinada con conversaciones de LMSYS-Chat-1M. No se documenta RLHF, DPO ni ajuste por preferencias en la informacion disponible. El autor publica ademas la posibilidad de desactivar los transcoders con `set_transcoders_enabled(False)` para obtener un modelo hibrido con las MLP base y la atencion y embeddings del modelo de referencia.

## Capacidades

- Generacion de texto autoregresiva heredada del backbone Gemma 2 2B y del tokenizer de `google/gemma-2-2b-it`.
- Steering de caracteristicas individuales mediante identificador `cantor id`: `--steer CANTOR_ID:STRENGTH` permite amplificar o atenuar una caracteristica concreta del transcoder.
- Analisis de atribucion: soporte para construir grafos de atribucion con `analysis.attribution.graphs.build_graphs`, con integracion de GemmaScope y control de presupuesto.
- Interfaz de chat por linea de comandos para inspeccion cualitativa del adaptador.
- Modo hibrido conmutable: desactivar los transcoders devuelve el comportamiento del backbone con las MLP base.
- Analisis de divergencia entre el modelo base `google/gemma-2-2b` y el de referencia `google/gemma-2-2b-it` mediante la perdida KL de entrenamiento.
- Capacidades multilingues: no disponibles (no se documenta ningun conjunto de idiomas).
- Tool calling, function calling, agentes y razonamiento multi-paso: no documentados.
- Vision, audio y modo "thinking": no soportados segun la informacion del repositorio.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: el modelo permite analizar como se representan caracteristicas concretas en las MLP de Gemma 2 2B sustituyendolas por diccionarios dispersos de 32.768 elementos, lo que facilita identificar unidades semanticamente coherentes.
- Steering controlado de caracteristicas: mediante `--steer CANTOR_ID:STRENGTH` un investigador puede amplificar o suprimir un rasgo concreto y observar el efecto en la generacion, util para validar hipotesis sobre circuitos internos.
- Construccion de grafos de atribucion: los scripts del repositorio generan grafos que trazan que caracteristicas contribuyen a una prediccion, aplicables a estudios de causalidad y a la localizacion de comportamientos concretos.
- Auditoria comparativa base vs. instrucciones: el modo bridging contra `google/gemma-2-2b-it` permite medir que caracteristicas aparecen al pasar de un modelo preentrenado a uno alineado por instrucciones.
- Reproduccion de experimentos de adaptacion dispersa: con el `training-config.yaml`, el run de W&B y los datasets publicados, otro equipo puede replicar el entrenamiento y comparar variantes de `l1_weight`, `lambda_bridge` o numero de caracteristicas.
- Docencia y divulgacion tecnica: el CLI de chat y las herramientas de visualizacion permiten demostrar en clase como se inspecciona y se manipula la representacion interna de un transformer pequeno en una GPU de consumo.
- Base para experimentos de edicion de modelos: al ser un adaptador separado del backbone, sirve como punto de partida para probar sustituciones parciales de MLP sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas tipo MMLU, HumanEval o GSM8K, y el run de W&B referenciado corresponde al entrenamiento (perdida KL, NMSE y terminos de regularizacion), no a evaluaciones de capacidad. Cualquier cifra de rendimiento del backbone deberia consultarse en la model card oficial de `google/gemma-2-2b` y no es atribuible a este adaptador.

## Requisitos de hardware

- VRAM estimada en fp16: alrededor de 13 GB solo para pesos (6.541.122.304 parametros x 2 bytes), mas memoria para activaciones, cache KV y el tokenizer, por lo que conviene reservar 16 GB o mas.
- VRAM estimada en int8: en torno a 6,5 GB si se aplica cuantizacion de 8 bits; en int4, en torno a 3,3 GB. No se documenta soporte oficial de cuantizacion para estos adaptadores, por lo que estas cifras son estimaciones teoricas sobre el recuento de parametros.
- GPU compatibles: cabe con holgura en A100 40 GB, A100 80 GB, H100 y L40S. En consumer, es viable en RTX 4090, RTX 3090 y RTX 4080 (24 GB y 16 GB respectivamente) en fp16; en GPUs de 8-12 GB requeriria cuantizacion no documentada.
- Despliegue: el repositorio exige cargar el modelo con sus propias clases (`from models.auto import load_tokenizer, load_transcoder_model`), no con `AutoModelForCausalLM` estandar. Por tanto, vLLM, llama.cpp, Ollama o TGI no son utilizables directamente sin adaptacion, pese a que la etiqueta `text-generation-inference` aparezca en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (transcoder Gemma 2 2B) | 6.541.122.304 (con transcoders) | No especificado (base: 8192) | Adaptador de transcoders dispersos sobre gemma2 | No disponible en el repositorio | HuggingFace, requiere codigo propio |
| google/gemma-2-2b | Aprox. 2,6 B (dato publico del modelo base) | 8192 tokens (dato publico del modelo base) | Transformer decoder-only preentrenado | Licencia Gemma de Google | HuggingFace |
| google/gemma-2-2b-it | Aprox. 2,6 B (dato publico del modelo base) | 8192 tokens (dato publico del modelo base) | Transformer decoder-only ajustado por instrucciones | Licencia Gemma de Google | HuggingFace |

Nota: los datos de las filas de `google/gemma-2-2b` y `google/gemma-2-2b-it` proceden de informacion publica sobre esos modelos base y no del repositorio analizado. No se dispone de una comparativa de rendimiento porque no hay benchmarks publicados para el adaptador.

## Limitaciones y advertencias

- No es un modelo de proposito general: es un artefacto de investigacion en interpretabilidad, con 12 descargas y ninguna validacion externa documentada.
- Entrenamiento de escala muy reducida: 1 epoca, batch size 1 y una muestra de 1M de documentos, lo que limita la fidelidad de los transcoders aprendidos.
- Requiere codigo propietario del repositorio (`models.auto`, `analysis.chat.cli`, `analysis.attribution.graphs`) y no funciona con las clases estandar de transformers, a pesar de las etiquetas del repositorio.
- Licencia no declarada en la propia ficha: existe incertidumbre legal sobre el uso comercial. Al derivar de `google/gemma-2-2b`, son aplicables los terminos de la licencia Gemma de Google, pero el repositorio no los explicita.
- Idiomas soportados no documentados: se desconoce la cobertura multilingue real del adaptador.
- Riesgo de alucinacion y sesgos: heredados del backbone Gemma 2 2B y del dataset LMSYS-Chat-1M, sin evaluaciones de seguridad ni de sesgo publicadas para este checkpoint.
- Almacenamiento elevado: 13,1 GB de repositorio para un modelo base de aproximadamente 2,6 B de parametros, por el peso anadido de los transcoders.
- Compatibilidad de cuantizacion no garantizada: no se documenta ninguna via oficial para reducir la precision, lo que complica el despliegue en GPUs de gama media o baja.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre el proyecto de transcoder adapters; las fuentes utiles se limitan a los enlaces del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_sparse_probe_tc32768_l1_0p0005_tc32768_decb_l1w0.0005_tarbb_lb2.0_sl15529833
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia y tokenizer: https://huggingface.co/google/gemma-2-2b-it
- Repositorio GitHub del proyecto: https://github.com/Sid-MB/transcoder-adapters
- Run de Weights & Biases: https://wandb.ai/siddharth-stanford/sparse-adaptation/runs/qcmlsi5f
- Dataset FineWeb 1M sample: https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Dataset LMSYS-Chat-1M splits: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Resultados de busqueda web: sin resultados relevantes para este modelo.
