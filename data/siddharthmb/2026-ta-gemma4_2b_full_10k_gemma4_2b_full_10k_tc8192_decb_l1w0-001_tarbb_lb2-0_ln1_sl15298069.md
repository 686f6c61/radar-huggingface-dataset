# siddharthmb/2026.TA.gemma4_2b_full_10k_gemma4_2b_full_10k_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_sl15298069

## Resumen

El modelo `2026.TA.gemma4_2b_full_10k_gemma4_2b_full_10k_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_sl15298069` es un adaptador transcoder disperso (sparse transcoder adapter) publicado por el usuario siddharthmb sobre el modelo base `google/gemma-4-E2B`, con `google/gemma-4-E2B-it` como modelo de referencia. No es un modelo de lenguaje entrenado desde cero ni un ajuste fino convencional: es un artefacto de interpretabilidad mecanicista que sustituye las MLP del backbone por un transcoder disperso de 8192 caracteristicas, entrenado en modo *bridging*, y que conserva la atencion y los embeddings del modelo de referencia.

El checkpoint completo pesa 5.509.713.699 parametros en safetensors (11,1 GB de repositorio) e incluye la rama del adaptador. Su proposito principal es el analisis de circuitos internos: permite generar grafos de atribucion, activar o desactivar los transcoders (`set_transcoders_enabled`) y modular caracteristicas concretas mediante *steering* a partir de su identificador cantor, ademas de mantener una interfaz de chat de linea de comandos.

Es relevante ahora porque el modelo se enmarca en la linea de investigacion de transcoder adapters y adaptacion dispersa, una alternativa a los SAE clasicos para descomponer y controlar representaciones internas. Con solo 2 descargas y 0 likes, es un artefacto de investigacion con difusion practicamente nula, y su uso esta condicionado a cargar las clases de modelo propias del repositorio GitHub del autor, no las de `transformers` estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (transformer decoder-only) con adaptadores transcoder dispersos |
| Parametros totales | 5.509.713.699 (safetensors, checkpoint completo) |
| Parametros activos | no disponible (la nomenclatura E2B del modelo base sugiere del orden de 2B activos, sin confirmar en la informacion) |
| Longitud de contexto | no disponible (el sufijo `tc8192` del nombre corresponde a `n_features` del transcoder, no a la ventana de contexto) |
| Tipos de cuantizacion | no disponible (no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | google/gemma-4-E2B |
| Modelo de referencia | google/gemma-4-E2B-it |
| Tokenizer | google/gemma-4-E2B-it |
| Modo de entrenamiento | bridging |
| n_features del transcoder | 8192 |
| dec_bias | True |
| l1_weight | 0.001 |
| Tamano del repositorio | 11,1 GB |
| Fecha de creacion | 2026-05-07 |
| Ultima actualizacion | 2026-10-11 |

## Arquitectura y entrenamiento

La arquitectura declarada es `gemma4`, con la etiqueta adicional `gemma4_text`, y el checkpoint contiene dos ramas: el backbone del modelo de referencia (atencion y embeddings) y la rama del transcoder disperso. El transcoder se define con 8192 caracteristicas (`n_features`), bias de decodificador activado (`dec_bias: True`) y un peso de regularizacion L1 de 0.001 (`l1_weight: 0.001`), valor coherente con el sufijo `l1w0.001` del identificador. El modo de entrenamiento es *bridging*, con `lambda_bridge: 2.0` y `backbone: target`, de forma que la adaptacion se ancla al backbone objetivo. La funcion de perdida empleada es KL (`loss_type: kl`), junto con `lambda_adapt: 1.0` y `lambda_nmse: 1`.

El entrenamiento se realizo durante una unica epoca, con batch size de 1, learning rate de 0.0008, warmup ratio de 0.05 y `n_cutoffs: 1`. Los datos de entrenamiento provienen de dos fuentes: `science-of-finetuning/fineweb-1m-sample` y `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits` (una particion de LMSYS-Chat-1M), lo que combina texto general web con conversaciones de chat. No se especifica el numero total de tokens procesados ni la composicion exacta del dataset, y no se documenta uso de RLHF, DPO ni fases de alineacion adicionales. La innovacion destacable es precisamente el esquema de adaptador: los transcoders se pueden conmutar en tiempo de ejecucion, de modo que el modelo puede operar con las MLP sustituidas por la rama dispersa o como modelo hibrido con las MLP base.

## Capacidades

- Analisis de interpretabilidad: sustitucion de MLP por transcoders dispersos para descomponer activaciones en caracteristicas interpretables.
- Generacion de grafos de atribucion mediante el modulo `analysis.attribution.graphs.build_graphs` del repositorio, con flags para prompt, GemmaScope y presupuesto.
- Steering de caracteristicas individuales por identificador cantor, con la sintaxis `--steer CANTOR_ID:STRENGTH`.
- Conmutacion de la rama de transcoders en tiempo de ejecucion (`set_transcoders_enabled(False)`), permitiendo comparar el comportamiento con y sin adaptadores.
- Chat interactivo mediante una CLI propia (`analysis.chat.cli`) que consume el checkpoint.
- Capacidades generativas heredadas del backbone gemma-4-E2B: generacion de texto y respuesta conversacional, en la medida en que el adaptador preserva atencion y embeddings del modelo de referencia.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni otras modalidades en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Analisis de circuitos internos: el modelo permite generar grafos de atribucion sobre prompts concretos, lo que facilita trazar que componentes contribuyen a una prediccion y validar hipotesis sobre circuitos en un backbone Gemma.
- Steering de comportamiento en investigacion: identificando una caracteristica concreta mediante su cantor id, se puede aumentar o reducir su intensidad con `--steer` para observar el efecto causal en la salida, un patron habitual en estudios de seguridad y alineacion.
- Comparacion interpretabilidad frente a rendimiento: al poder desactivar los transcoders con `set_transcoders_enabled(False)`, se puede medir cuanto degrada o mejora la rama dispersa respecto a las MLP originales en tareas de lenguaje.
- Estudio de la diferencia entre modelo base e instruct: dado que el backbone ancla es `gemma-4-E2B` y el modelo de referencia es `gemma-4-E2B-it`, el adaptador sirve para analizar como cambian las representaciones internas cuando se aplica ajuste por instrucciones.
- Extraccion de caracteristicas para pipelines de analisis: los 8192 features del transcoder pueden registrarse como representaciones de baja dimension para clasificacion, deteccion de conceptos o auditoria de contenido en investigacion.
- Analisis de conversaciones: al haberse entrenado parcialmente con particiones de LMSYS-Chat-1M, resulta adecuado para estudiar representaciones internas en dialogos multi-turno de dominio conversacional.
- Reproduccion de experimentos de adaptacion dispersa: el repositorio incluye `training-config.yaml`, lo que permite replicar la configuracion exacta (l1_weight, lambdas, loss KL) en otros backbones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en precision completa: con 5.509.713.699 parametros, los pesos en bf16/fp16 ocupan aproximadamente 11 GB, lo que concuerda con el tamano de repositorio de 11,1 GB.
- VRAM estimada para inferencia en bf16/fp16: en torno a 13-16 GB considerando pesos, cache KV y activaciones (estimacion propia; no confirmada por el autor).
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 6-7 GB; con 4 bits, aproximadamente 3,5-4,5 GB. Son estimaciones orientativas, ya que no se publican cuantizaciones oficiales ni tipos soportados.
- GPU de consumo: cabe en bf16 en tarjetas de 24 GB (RTX 3090, RTX 4090); en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) el margen es muy ajustado y probablemente requiera cuantizacion.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 y L40S son opciones holgadas para el checkpoint completo.
- Despliegue: el modelo requiere las clases propias del repositorio GitHub del autor (`from models.auto import load_tokenizer, load_transcoder_model`), por lo que no es cargable directamente con `AutoModelForCausalLM`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Modo de uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (gemma4_2b_full_10k...tc8192) | 5.509.713.699 | no disponible | Adaptador transcoder disperso; requiere clases propias | no disponible | HuggingFace, 2 descargas |
| google/gemma-4-E2B | no disponible | no disponible | Modelo base preentrenado | no disponible | Modelo base referenciado |
| google/gemma-4-E2B-it | no disponible | no disponible | Modelo ajustado por instrucciones, usado como referencia | no disponible | Modelo de referencia |
| Otras librerias de SAE o adaptadores dispersos | no disponible | no disponible | Analisis de caracteristicas | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a la relacion de dependencia entre el adaptador y sus modelos base y de referencia.

## Limitaciones y advertencias

- Artefacto de investigacion con 2 descargas y 0 likes: no hay validacion externa, ni resultados publicados, ni garantia de mantenimiento.
- Licencia no especificada: la ausencia de licencia explicita impide asumir permisos de uso comercial. Ademas, al derivar de `google/gemma-4-E2B`, quedaria sujeta a los terminos del modelo base, que no se detallan en la informacion disponible.
- Carga no estandar: no funciona con `AutoModelForCausalLM` de `transformers`; exige las clases `models.auto` del repositorio GitHub del autor, lo que complica su integracion en stacks de produccion.
- Idiomas soportados no documentados: se desconoce la cobertura multilingue real del checkpoint.
- Longitud de contexto no documentada: se desconoce la ventana efectiva, y el sufijo `tc8192` no debe interpretarse como contexto (corresponde a `n_features`).
- Riesgo de alucinacion: no evaluado; no hay benchmarks de fidelidad, veracidad ni tasas de error.
- Sesgos: no documentados. El uso de `fineweb-1m-sample` y de particiones de LMSYS-Chat-1M implica heredar los sesgos de esas fuentes, sin que se hayan publicado analisis al respecto.
- Estabilidad del steering: la modificacion de caracteristicas por cantor id puede degradar la coherencia de la salida si se aplican intensidades altas; no se documentan rangos seguros.
- Sin cuantizaciones oficiales ni soporte GGUF: desplegarlo en hardware limitado requiere cuantizacion manual, con riesgo de perdida de fidelidad en la rama del transcoder.
- Entrenamiento de una sola epoca con batch size 1: la robustez del adaptador fuera del dominio de entrenamiento no esta caracterizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.gemma4_2b_full_10k_gemma4_2b_full_10k_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_sl15298069
- Repositorio GitHub: https://github.com/Sid-MB/transcoder-adapters
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Modelo de referencia: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento 1: https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Dataset de entrenamiento 2: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Configuracion de entrenamiento: https://huggingface.co/siddharthmb/2026.TA.gemma4_2b_full_10k_gemma4_2b_full_10k_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_sl15298069/blob/main/training-config.yaml
- Paper, blog o demo adicionales: no disponibles en la busqueda web realizada.
