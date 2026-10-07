# mradermacher/OneDecision-VisionGuard-9B-SFT-GGUF

## Resumen

OneDecision-VisionGuard-9B-SFT-GGUF es la version cuantizada en formato GGUF del modelo prithivMLmods/OneDecision-VisionGuard-9B-SFT, un clasificador multimodal (vision y texto) orientado a seguridad de contenido y moderacion. La cuantizacion la publica mradermacher, autor especializado en convertir modelos de HuggingFace a GGUF, e incluye tanto los pesos del modelo en distintos niveles de compresion como los ficheros mmproj necesarios para procesar imagenes.

El modelo base fue afinado mediante SFT sobre el dataset prithivMLmods/ImageShield-OneDecision-Classification y esta etiquetado por sus autores como safety-classifier, guardrail y multimodal-content-filter. Su funcion principal no es la generacion de texto libre, sino emitir decisiones de clasificacion (salida en JSON) sobre si un contenido visual o multimodal resulta seguro o no, lo que lo situa en la misma categoria que otros clasificadores de guardarraíl como Llama Guard 3 Vision o ShieldGemma.

Con 8.953.803.264 parametros (unos 8,95 B) y licencia Apache 2.0, el modelo es relevante porque permite desplegar un filtro de seguridad multimodal en local, sin depender de APIs externas, en GPUs de consumo cuando se usan las cuantizaciones Q4 o Q5. El repositorio GGUF ocupa 83 GB en total al incluir todas las variantes de cuantizacion, desde Q2_K hasta f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Modelo multimodal (vision-lenguaje) segun las etiquetas y los ficheros mmproj del repositorio |
| Parametros totales | 8.953.803.264 (aprox. 8,95 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta version); el modelo base se distribuye en safetensors/PyTorch |
| Modelo base | prithivMLmods/OneDecision-VisionGuard-9B-SFT |
| Dataset de entrenamiento | prithivMLmods/ImageShield-OneDecision-Classification |
| Pipeline declarado | image-classification |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Tamano del repositorio | 83,0 GB (todas las cuantizaciones juntas) |
| Descargas / likes (metadata) | 200 / 0 |
| Fecha de creacion (metadata) | 2026-10-07 |
| Ultima actualizacion (metadata) | 2026-10-07 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. Los metadatos indican que es un modelo multimodal, con soporte de vision confirmado por la presencia de los ficheros complementarios mmproj (en Q8_0 y f16), necesarios para inyectar las representaciones visuales en el modelo de lenguaje. El pipeline declarado en HuggingFace es image-classification, pero las etiquetas del repositorio tambien incluyen text-generation-inference y SFT, lo que sugiere que el modelo genera una salida estructurada (JSON) a partir de la cual se deriva la clasificacion.

El entrenamiento se realizo mediante Supervised Fine-Tuning (SFT) sobre el dataset prithivMLmods/ImageShield-OneDecision-Classification. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases posteriores de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documentan innovaciones tecnicas especificas mas alla del pipeline de cuantizacion aplicado por mradermacher (cuantizacion estatica de tensores de salida, version 2 del proceso).

## Capacidades

- Clasificacion de seguridad de contenido visual y multimodal: el modelo evalua imagenes (y potencialmente pares imagen-texto) y emite una decision sobre su adecuacion.
- Moderacion de contenido (content moderation) y funcion de guardarraíl (guardrail): integrable como filtro previo o posterior a otros sistemas generativos.
- Salida en JSON: las etiquetas del repositorio indican que el modelo produce respuestas estructuradas en formato JSON, lo que facilita el parseo automatico en pipelines.
- Procesamiento de imagenes: requiere el fichero mmproj correspondiente (Q8_0 o f16) para la parte visual.
- Generacion de texto conversacional: el modelo esta etiquetado como conversational y con soporte de text-generation-inference, aunque su proposito principal es la clasificacion.
- Soporte multilingue: limitado al ingles (en) segun los metadatos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.
- Etiquetado como "uncensored": el modelo se presenta sin el filtrado adicional que otros modelos aplican a sus propias salidas, algo coherente con su funcion de clasificador.

## Casos de uso

- Moderacion de imagenes enviadas por usuarios en plataformas UGC: el modelo clasifica cada imagen contra las politicas de la plataforma y devuelve una decision en JSON que el backend puede registrar o usar para bloquear la publicacion. Al ejecutarse en local con cuantizaciones Q4 o Q5, evita enviar contenido sensible a APIs de terceros.
- Filtrado previo (pre-filter) en pipelines de generacion de imagen: antes de mostrar o almacenar una imagen generada, VisionGuard actua como guardarraíl y descarta las salidas que incumplen la politica, reduciendo el coste frente a revisiones humanas.
- Filtrado de datasets de entrenamiento: procesamiento por lotes de grandes colecciones de imagenes para eliminar contenido no deseado antes de usarlas en el entrenamiento de otros modelos, aprovechando el formato GGUF para ejecutar en GPU de consumo o incluso en CPU.
- Capa de seguridad en asistentes multimodales: integracion como modulo de clasificacion en paralelo a un VLM conversacional, de modo que cada entrada con imagen se valida antes de llegar al modelo principal.
- Moderacion en comunidades y foros con contenido visual: clasificacion automatica de adjuntos y avatares, con umbrales configurables por categoria y registro de decisiones para auditoria.
- Revision asistida por humanos (human-in-the-loop): el clasificador prioriza la cola de revision, enviando a los moderadores unicamente los casos dudosos o marcados como inseguros, con el JSON de salida como contexto de la decision.
- Cumplimiento normativo y trazabilidad: generacion de un registro estructurado de decisiones de moderacion para auditorias internas o requisitos regulatorios sobre contenido publicado.
- Investigacion en seguridad multimodal: uso como linea base reproducible (licencia Apache 2.0, pesos abiertos) para comparar tecnicas de moderacion visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del tamano de cada fichero GGUF; no incluyen la cache KV, cuyo tamano depende de una longitud de contexto que no se especifica. A los pesos hay que sumar el fichero mmproj (0,7 GB en Q8_0 o 1,0 GB en f16) para el procesamiento de imagenes.

| Cuantizacion | Tamano de pesos (GB) | VRAM estimada (GB) | Notas |
|---|---|---|---|
| Q2_K | 3,9 | ~ 5 | Perdida de calidad apreciable |
| Q3_K_S | 4,4 | ~ 6 | |
| Q3_K_M | 4,7 | ~ 6 | Calidad inferior segun el autor |
| Q3_K_L | 5,0 | ~ 6-7 | |
| IQ4_XS | 5,3 | ~ 7 | |
| Q4_K_S | 5,5 | ~ 7 | Rapida, recomendada por el autor |
| Q4_K_M | 5,7 | ~ 7 | Rapida, recomendada por el autor |
| Q5_K_S | 6,4 | ~ 8 | |
| Q5_K_M | 6,6 | ~ 8 | |
| Q6_K | 7,5 | ~ 9-10 | Muy buena calidad segun el autor |
| Q8_0 | 9,6 | ~ 11-12 | Rapida, mejor calidad |
| f16 | 18,0 | ~ 20 | 16 bits por peso, innecesaria en la practica |

- Cabe en GPU de consumo: si. Las variantes Q4_K_S/Q4_K_M (5,5-5,7 GB de pesos) entran en GPUs de 8 GB o mas, sumando el mmproj. Las variantes Q5 y Q6 encajan en GPUs de 10-12 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4080, RTX 4090 (24 GB, permite Q8_0 o f16 con holgura), A100 y H100 para despliegues con concurrencia alta; con cuantizaciones Q4 tambien es viable en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) para el formato GGUF; el modelo esta etiquetado con text-generation-inference y transformers, por lo que el modelo base puede servirse con TGI o vLLM en su version safetensors. Para inferencia multimodal en llama.cpp/LM Studio hay que cargar tambien el fichero mmproj.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad para estas cuantizaciones.
- Nota del autor: no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion, solo las estaticas listadas.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de su documentacion publica y pueden variar; no se han publicado benchmarks comparativos en la informacion disponible para este modelo.

| Modelo | Parametros | Modalidad | Licencia | Contexto | Benchmarks |
|---|---|---|---|---|---|
| OneDecision-VisionGuard-9B-SFT (este modelo, en GGUF) | 8,95 B | Texto + vision | Apache 2.0 | No disponible | No disponible |
| Llama Guard 3 11B Vision | 11 B (aprox.) | Texto + vision | Licencia comunitaria de Llama 3.2 | No disponible en esta ficha | No disponible en esta ficha |
| ShieldGemma 9B | 9 B (aprox.) | Texto | Terminos de uso de Gemma | No disponible en esta ficha | No disponible en esta ficha |
| Qwen2.5-VL / clasificadores derivados | Variable | Texto + vision | Variable segun el modelo base | Variable | No disponible en esta ficha |

Diferencias principales frente a las alternativas: VisionGuard se distribuye bajo Apache 2.0 (mas permisiva que las licencias comunitarias de Llama o los terminos de Gemma), esta disponible en GGUF con multiples niveles de cuantizacion y los autores lo etiquetan explicitamente como "uncensored". A cambio, no publica resultados de benchmarks y solo declara soporte de ingles.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay datos de MMLU, precision/recall de moderacion ni tasas de falsos positivos/negativos que permitan estimar su fiabilidad antes de desplegarlo.
- Riesgo de alucinacion y de clasificacion incorrecta: como clasificador generativo con salida JSON, puede producir etiquetas inconsistentes o malformadas; conviene validar el esquema de salida en el pipeline.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos culturales, raciales o de representacion en las decisiones de moderacion.
- Idioma: solo se declara soporte de ingles. Su comportamiento con contenido en castellano u otros idiomas no esta documentado.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita la planificacion de memoria y el diseno de pipelines con historial.
- Etiqueta "uncensored": implica que el modelo no aplica filtros adicionales sobre sus propias salidas. Es coherente con su funcion de clasificador, pero exige revisar las salidas antes de exponerlas a usuarios finales.
- Cuantizaciones de baja precision: Q2_K y Q3_K pueden degradar notablemente la calidad de clasificacion; para produccion se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de otro modelo conviene revisar la licencia y condiciones del modelo base (prithivMLmods/OneDecision-VisionGuard-9B-SFT) y del dataset utilizado.
- Despliegue multimodal: requiere cargar el fichero mmproj ademas de los pesos; omitirlo deja el modelo sin capacidad de procesar imagenes.
- Metadatos de fecha: la fecha de creacion y actualizacion indicadas en la metadata (2026-10-07) son las que reporta HuggingFace; conviene verificarlas en la pagina del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OneDecision-VisionGuard-9B-SFT-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/OneDecision-VisionGuard-9B-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/prithivMLmods/ImageShield-OneDecision-Classification
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#OneDecision-VisionGuard-9B-SFT-GGUF
- Preguntas frecuentes y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre el uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que financia las cuantizaciones (nethype GmbH): https://www.nethype.de/
