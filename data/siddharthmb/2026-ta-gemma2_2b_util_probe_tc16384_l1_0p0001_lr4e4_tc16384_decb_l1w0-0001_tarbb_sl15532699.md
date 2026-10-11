# siddharthmb/2026.TA.gemma2_2b_util_probe_tc16384_l1_0p0001_lr4e4_tc16384_decb_l1w0.0001_tarbb_sl15532699

## Resumen

El modelo `2026.TA.gemma2_2b_util_probe_tc16384_l1_0p0001_lr4e4_tc16384_decb_l1w0.0001_tarbb_sl15532699` es un adaptador de transcoder disperso (sparse transcoder adapter) construido sobre `google/gemma-2-2b` por el usuario de HuggingFace siddharthmb, dentro de una coleccion de artefactos de adaptacion dispersa publicada en 2026. No es un modelo de chat convencional: es un checkpoint de interpretabilidad mecanicista que sustituye las MLP del transformer por transcoders entrenados para reconstruir activaciones y exponer caracteristicas interpretables de forma dispersa. Su pipeline declarado es `transformers`, con pesos en `safetensors`.

El checkpoint pesa 9,2 GB e incorpora 4.577.762.048 parametros en total segun los safetensors, una cifra muy superior a los aproximadamente 2.610 millones del Gemma 2 2B original. La diferencia corresponde a las matrices de los transcoders: con 16.384 caracteristicas por capa y un modelo de 2.304 dimensiones ocultas, cada capa anade del orden de 75 millones de parametros, lo que suma en torno a 1.960 millones adicionales repartidos por las capas. La arquitectura base es `gemma2`, con decodificacion autoregresiva y la alternancia de atencion local y global propia de esta familia.

Su relevancia es de nicho pero clara para el publico de interpretabilidad: permite hacer steering a nivel de caracteristica mediante identificadores de cantor, generar grafos de atribucion y comparar el comportamiento del modelo hibrido (MLP originales con atencion y embeddings del modelo de referencia) frente al modelo con transcoders activos. El entrenamiento se hizo en modo *bridging* contra `google/gemma-2-2b-it` como modelo de referencia, usando `fineweb-1m-sample` y un split de LMSYS-Chat-1M. Con 3 descargas y 0 likes en el momento de redactar esta ficha, se trata de un artefacto de investigacion practicamente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma2 (transformer decoder-only) con adaptadores de transcoder dispersos |
| Parametros totales | 4.577.762.048 (segun safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens, heredada de la arquitectura Gemma 2 del modelo base; no se declara explicitamente en la model card |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponibles (el tokenizer es el de `google/gemma-2-2b-it`, multilingue, pero el autor no declara cobertura) |
| Licencia | no disponible en la model card; el modelo base `google/gemma-2-2b` se distribuye bajo los Gemma Terms of Use |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | google/gemma-2-2b |
| Modelo de referencia | google/gemma-2-2b-it |
| Modo de entrenamiento | bridging |
| n_features del transcoder | 16.384 |
| dec_bias | True |
| l1_weight | 0,0001 |
| Tamano del repositorio | 9,2 GB |
| Descargas / likes | 3 / 0 |

## Arquitectura y entrenamiento

El artefacto parte de Gemma 2 2B, un transformer decoder-only de 26 capas con atencion por grupos (GQA) y atencion local y global intercaladas, tal y como se describe en el informe tecnico "Gemma 2: Improving Open Language Models at a Practical Size" (arXiv:2408.00118). Sobre esa columna vertebral, el adaptador introduce transcoders de 16.384 caracteristicas con sesgo de decodificador (`dec_bias: True`) y una penalizacion L1 de 0,0001 sobre las activaciones, lo que fuerza representaciones dispersas y, en teoria, mas interpretables. El checkpoint conserva dos modos de ejecucion: con los transcoders activados se obtiene el modelo adaptado, y llamando a `set_transcoders_enabled(False)` se recupera un modelo hibrido en el que las MLP vuelven a ser las originales pero la atencion y los embeddings provienen del modelo de referencia (`gemma-2-2b-it`).

El entrenamiento se hizo en modo *bridging*, es decir, alineando el adaptador contra las activaciones de un modelo de referencia instruct, con backbone marcado como `target` y un unico corte (`n_cutoffs: 1`). Los hiperparametros declarados son: learning rate 4e-4, batch size 2, una epoca, warmup ratio 0,05, funcion de perdida KL, `lambda_adapt: 1.0`, `lambda_bridge: 2.0`, `lambda_nmse: 1` y `l1_weight: 0.0001`. Los datos de entrenamiento son `science-of-finetuning/fineweb-1m-sample` y `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits`, una mezcla de texto web y conversaciones, coherente con el objetivo de cubrir tanto activaciones de lenguaje general como de dialogo. No se documentan tecnicas de RLHF ni DPO, ni decodificacion especulativa, ni mecanismos de atencion lineal.

## Capacidades

- Extraccion de caracteristicas interpretables: los transcoders exponen 16.384 caracteristicas por capa con penalizacion L1, pensadas para analisis de circuitos y representaciones.
- Steering a nivel de caracteristica: el CLI del repositorio admite `--steer CANTOR_ID:STRENGTH` para modular una caracteristica concreta identificada por su id de cantor.
- Generacion de texto: el checkpoint incluye la cabeza de generacion y puede usarse para chat mediante `python -m analysis.chat.cli`.
- Grafos de atribucion: el repositorio incluye `analysis.attribution.graphs.build_graphs`, con soporte de GemmaScope y limites de presupuesto, para trazar la contribucion de componentes a una prediccion.
- Modo hibrido conmutable: `set_transcoders_enabled(False)` permite comparar el comportamiento con MLP originales frente al adaptado sin recargar otro checkpoint.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (etiquetas del repositorio), aunque la carga documentada requiere las clases propias del proyecto.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles; no se declaran en la model card y son ajenos al proposito del artefacto.
- Vision, audio y modo thinking: no disponibles.
- Capacidades multilingues: no declaradas; el tokenizer heredado de `gemma-2-2b-it` es multilingue, pero no hay evaluacion publicada.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: usar los transcoders de 16.384 caracteristicas para analizar que caracteristicas se activan ante entradas concretas y como se componen en circuitos, algo que con las MLP densas de Gemma 2 no es directamente observable.
- Steering controlado de comportamientos: aplicar `--steer CANTOR_ID:STRENGTH` para amplificar o atenuar una caracteristica y medir el efecto causal sobre la salida, una tecnica habitual para localizar representaciones de toxicidad, refusal o estilo.
- Generacion de grafos de atribucion: ejecutar `build_graphs` con las banderas de prompt y presupuesto para construir grafos que atribuyan predicciones a componentes concretos, utiles para auditar el modelo de cara a publicaciones o revisiones internas.
- Comparacion de modos de adaptacion dispersa: dado que el checkpoint es parte de una coleccion con variantes (por ejemplo, configuraciones con 8.192 caracteristicas y valores de L1 distintos), sirve para estudiar el compromiso entre numero de caracteristicas, dispersidad y fidelidad de reconstruccion.
- Analisis de dialogo multilingue: al haberse entrenado parcialmente sobre splits de LMSYS-Chat-1M, permite estudiar caracteristicas asociadas a turnos conversacionales y a cambios de idioma dentro de una conversacion.
- Docencia y divulgacion de interpretabilidad: el modo hibrido conmutable y el CLI de chat facilitan demostraciones en las que se muestra la diferencia entre el comportamiento del modelo original y el del modelo con transcoders activos.
- Depuracion de fallos del modelo base: identificar caracteristicas responsables de alucinaciones o de sesgos concretos en `gemma-2-2b` como paso previo a tecnicas de edicion de modelo.
- Validacion de pipelines de transcoders: servir de caso de prueba para el repositorio `Sid-MB/transcoder-adapters`, comprobando carga, inferencia, steering y construccion de grafos en un checkpoint de 16.384 caracteristicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta hiperparametros de entrenamiento (learning rate 4e-4, batch size 2, una epoca, perdida KL, `lambda_bridge` 2.0, `lambda_nmse` 1) y el enlace a la ejecucion de Weights & Biases, pero no incluye cifras de MMLU, HumanEval, GSM8K, evaluaciones de reconstruccion NMSE ni metricas de interpretabilidad comparables. Tampoco se ofrecen resultados frente a las otras variantes de la coleccion de transcoder adapters.

## Requisitos de hardware

- Pesos completos en precisión de entrenamiento: el repositorio ocupa 9,2 GB, por lo que se necesita al menos ese espacio en VRAM o en disco y una GPU con 12-16 GB para cargar en bf16/fp16 con margen para activaciones.
- Estimacion de VRAM para inferencia: en bf16/fp16 en torno a 10-12 GB incluyendo cache de activaciones; en fp32 alrededor de 19-20 GB; las cuantizaciones a 8 y 4 bits (aproximadamente 5 GB y 2,5 GB de pesos) son teoricamente posibles pero no se distribuyen de forma oficial.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para experimentos con grafos de atribucion y analisis por lotes; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 y para steering interactivo.
- GPU de consumo: cabe en tarjetas de 24 GB sin problemas; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) es ajustado pero viable en bf16 sin lotes grandes; en 8-12 GB requeriria cuantizacion no publicada.
- Opciones de despliegue: la carga documentada usa las clases propias del repositorio (`models.auto.load_transcoder_model` y `load_tokenizer`), no una carga estandar de `AutoModelForCausalLM`. El repositorio declara compatibilidad con text-generation-inference y endpoints, pero no se documenta una ruta de despliegue con vLLM, llama.cpp, Ollama o TGI lista para usar.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion para ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (gemma2_2b, tc16384) | 4.577.762.048 | 8.192 (heredado) | Adaptador de transcoder disperso para interpretabilidad | no disponible en la model card | 3 descargas, 0 likes |
| google/gemma-2-2b | ~2,6 mil millones | 8.192 | LLM decoder-only de proposito general | Gemma Terms of Use | Ampliamente descargado y desplegado |
| google/gemma-2-2b-it | ~2,6 mil millones | 8.192 | LLM decoder-only ajustado a instrucciones | Gemma Terms of Use | Ampliamente descargado y desplegado |
| siddharthmb/2026.TA.gemma2_2b_tc8192_decb_l1w0.001_... | no disponible | 8.192 (heredado) | Variante de la misma coleccion con 8.192 caracteristicas y L1 0,001 | no disponible | no disponible |

La comparacion directa con Gemma 2 2B solo es util en terminos de columna vertebral: el adaptador no persigue mejores resultados en tareas de lenguaje, sino exponer representaciones interpretables. Frente a las tecnicas basadas en autoencoders dispersos, como las publicadas en el ecosistema GemmaScope que el propio repositorio menciona como dependencia opcional para los grafos de atribucion, la diferencia es el uso de transcoders que reconstruyen la salida de una capa en lugar de solo su activacion, con un coste adicional de parametros. No hay datos publicados que permitan comparar rendimiento entre estas aproximaciones con este checkpoint concreto.

## Limitaciones y advertencias

- Sesgos: no hay ninguna evaluacion de sesgo publicada para este checkpoint. Al heredar la columna vertebral y el tokenizer de Gemma 2 2B y entrenarse parcialmente sobre FineWeb y conversaciones de LMSYS-Chat-1M, es esperable que arrastre los sesgos de esas fuentes, pero no estan cuantificados.
- Alucinacion: es un modelo base de 2B ajustado indirectamente mediante alineacion de activaciones, no un modelo instruido con RLHF especifico para este adaptador, por lo que la tasa de alucinacion no esta caracterizada y puede diferir de `gemma-2-2b-it`.
- Proposito real: es un artefacto de investigacion sobre adaptacion dispersa, no un modelo listo para produccion. Solo 3 descargas y 0 likes indican ausencia de validacion por parte de terceros.
- Dependencia de codigo externo: la carga requiere las clases del repositorio `Sid-MB/transcoder-adapters` (`models.auto`). No hay garantia de que funcione con versiones futuras de `transformers` ni de que los tags de text-generation-inference y endpoints compatibles se correspondan con un despliegue estandar probado.
- Licencia: la model card no declara licencia propia. Cualquier uso comercial queda condicionado por los Gemma Terms of Use del modelo base y por lo que el autor decida, algo que conviene aclarar antes de integrarlo en un producto.
- Contexto limitado: la ventana heredada de 8.192 tokens es corta para tareas de contexto largo; el sufijo `tc16384` del nombre hace referencia al numero de caracteristicas del transcoder, no a la longitud de contexto, un error de lectura facil de cometer.
- Interpretabilidad no garantizada: un transcoder con 16.384 caracteristicas y L1 muy baja (0,0001) tiende a producir representaciones menos dispersas que variantes con L1 mas alta, lo que puede reducir la legibilidad de las caracteristicas. No se publican metricas de dispersidad ni de fidelidad de reconstruccion.
- Idiomas: no se declara cobertura linguistica ni se han publicado evaluaciones por idioma; el rendimiento fuera del ingles es incierto.
- Reproducibilidad: los datos de entrenamiento combinan un split propio del autor y un sample de FineWeb; sin la configuracion exacta y el estado de las semillas no es trivial reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_util_probe_tc16384_l1_0p0001_lr4e4_tc16384_decb_l1w0.0001_tarbb_sl15532699
- Repositorio de codigo: https://github.com/Sid-MB/transcoder-adapters
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/siddharth-stanford/sparse-adaptation/runs/jmvln7gz
- Coleccion 2026 Transcoder Adapters: https://huggingface.co/collections/siddharthmb/2026-transcoder-adapters
- Variante de la coleccion con 8.192 caracteristicas: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_dr10000_lr3e-04_bs4_sl14701500
- Artefacto de caracteristicas asociado: https://huggingface.co/siddharthmb/2026.TA.features_2026.TA.gemma2_2b_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_dr20000_lr_ha43539c2ed71
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento (FineWeb 1M sample): https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Dataset de entrenamiento (LMSYS-Chat-1M splits): https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Biblioteca oficial de Gemma: https://github.com/google-deepmind/gemma
- Informe tecnico de Gemma 2 (arXiv): https://arxiv.org/abs/2408.00118
- Informe tecnico de Gemma 2 (PDF): https://arxiv.org/pdf/2408.00118
