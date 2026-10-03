# lylybig8/routing-analysis-anvil-six-models

## Resumen

`lylybig8/routing-analysis-anvil-six-models` es un artefacto de investigacion publicado en HuggingFace por el usuario lylybig8, no un modelo de inferencia unico y listo para produccion. Se trata de una instantanea (snapshot) que preserva pesos, checkpoints reanudables, codigo de entrenamiento y evaluacion, registros y resultados crudos de LightEval correspondientes a una serie de experimentos de adaptacion linguistica al hausa y al yoruba, realizados sobre el modelo base `AIDC-AI/Marco-Nano-Base`.

El objetivo del repositorio es reproducir y auditar experimentos de adaptacion guiada por enrutamiento (routing-guided) en un modelo de arquitectura de mezcla de expertos (mixture-of-experts, MoE). Incluye tres modelos completos (hausa 100k full fine-tuning, yoruba 50k full fine-tuning y una variante de yoruba con top-8 expertos entrenada solo sobre el corpus de preentrenamiento de yoruba) y tres ejecuciones parciales reanudables (hausa 500K top-8, yoruba 100K full fine-tuning y yoruba 50K LoRA de rango 64 con top-8).

El repositorio pesa aproximadamente 1032,2 GB (cerca de 1,03 TiB), y la mayor parte del volumen corresponde a estados del optimizador y checkpoints intermedios conservados deliberadamente. Por su propia model card, esta pensado como artefacto de investigacion, no como un modelo plano de inferencia, por lo que su relevancia actual es metodologica (reproducibilidad, evaluacion multilingue y estudio del enrutamiento de expertos) mas que como modelo desplegable directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (mixture-of-experts) sobre `AIDC-AI/Marco-Nano-Base`; no se detalla la arquitectura interna |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el repositorio menciona configuraciones top-8 expertos, sin cifra de parametros) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Entrenamiento y evaluacion centrados en hausa (`hau_Latn`) y yoruba (`yor_Latn`); paneles de retencion multilingue de 34 idiomas (Belebele) y 23 idiomas (GlobalMMLU) |
| Licencia | no disponible en el repositorio; los datos de origen usan ODC-By 1.0 (FineWeb-2) y Apache-2.0 (Wura, Marco-Nano-Base) |
| Formato de pesos | safetensors (checkpoints de entrenamiento con estado del optimizador, estado del trainer y ficheros de tokenizer) |

## Arquitectura y entrenamiento

La informacion disponible indica que los experimentos parten de `AIDC-AI/Marco-Nano-Base`, un modelo con arquitectura de mezcla de expertos, y que las adaptaciones se realizaron mediante preentrenamiento continuado (continual-pretraining), ajuste fino completo (full-finetuning) y LoRA. El estudio se centra en el enrutamiento de expertos: varias configuraciones seleccionan explicitamente los top-8 expertos, e incluyen una variante de yoruba entrenada unicamente sobre el corpus de preentrenamiento de yoruba con esa seleccion de expertos.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento por ejecucion (mas alla de los identificadores 100k, 50k y 500K que acompanan a los checkpoints), la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. Los datos de entrenamiento provienen de FineWeb-2 (`HuggingFaceFW/fineweb-2`, ODC-By 1.0, sujeto tambien a los terminos de Common Crawl) y de Wura (`castorini/wura`, Apache-2.0). El repositorio incluye los splits, manifiestos y la instantanea del modelo base compartida, ademas de un manifiesto de artefactos con recuentos exactos de bytes, inventario de ficheros, sumas de comprobacion y un informe de validacion generado antes de la subida al Hub.

La evaluacion se realizo con LightEval v0.10.0, con definiciones de tareas especificas del modelo y un runner reanudable compartido, sobre Belebele (panel fijo de retencion de 34 idiomas mas la tarea objetivo de hausa o yoruba) y GlobalMMLU (panel fijo de retencion de 23 idiomas mas la tarea objetivo). Los resultados crudos en JSON, los ficheros Parquet de detalles, registros y marcadores de finalizacion se conservan bajo las rutas originales `reproduce/`.

## Capacidades

- Generacion de texto y modelado del lenguaje en hausa y yoruba tras la adaptacion, partiendo de un modelo base multilingue.
- Estudio del enrutamiento de expertos: seleccion explicita de top-8 expertos en varias ejecuciones.
- Adaptacion linguistica de bajo recurso mediante preentrenamiento continuado y ajuste fino completo.
- Ajuste eficiente mediante LoRA (rango 64 en una de las ejecuciones de yoruba).
- Evaluacion multilingue con paneles de retencion (34 idiomas en Belebele, 23 en GlobalMMLU) para medir el olvido catastrofico.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con la libreria `transformers`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en adaptacion linguistica: usar los modelos completos de hausa y yoruba para estudiar como se comporta un MoE al adaptarse a idiomas de bajo recurso, comparando full fine-tuning frente a LoRA.
- Analisis de olvido catastrofico: emplear los paneles de retencion de Belebele y GlobalMMLU para medir cuanto se degrada el rendimiento en otros idiomas tras la adaptacion.
- Estudio de enrutamiento de expertos: reproducir las ejecuciones top-8 para analizar que expertos se activan al procesar hausa o yoruba y como cambia el enrutamiento con el preentrenamiento continuado.
- Reproducibilidad de resultados: reanudar checkpoints parciales (hausa 500K top-8 en el paso 1682 de 7813, yoruba 100K full-FT en el 519 de 1563, yoruba 50K LoRA en el 335 de 782) usando los scripts, el modelo base y el entorno registrados en el repositorio.
- Auditoria de pipelines de entrenamiento: inspeccionar manifiestos, sumas de comprobacion e informes de validacion para verificar procedencia de datos y artefactos.
- Benchmarking multilingue con LightEval: reutilizar las definiciones de tareas v0.10.0 y el runner reanudable para evaluar modelos adaptados a hausa y yoruba.
- Base para futuros ajustes: partir de un modelo completo de hausa o yoruba como punto de inicio para tareas posteriores de generacion de texto en esos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye resultados crudos de LightEval (Belebele y GlobalMMLU) y ficheros Parquet de detalles, pero las cifras concretas no se recogen en la informacion proporcionada, por lo que no se presentan valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (faltan el numero de parametros totales y activos del modelo base y de las adaptaciones).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; no puede determinarse sin conocer el tamano del modelo.
- Espacio en disco: el repositorio completo ocupa aproximadamente 1032,2 GB (cerca de 1,03 TiB), en gran parte por estados del optimizador y checkpoints intermedios; para inferencia debe seleccionarse un unico directorio de modelo completo, de tamano no especificado.
- Opciones de despliegue: el repositorio es compatible con `transformers` y con endpoints (`endpoints_compatible`); la evaluacion usa LightEval v0.10.0. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de parametros que permitan una comparacion cuantitativa. El unico punto de referencia documentado es el modelo base del que parten los experimentos:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lylybig8/routing-analysis-anvil-six-models` | Objeto de esta ficha | no disponible | no disponible | no disponible | HuggingFace |
| `AIDC-AI/Marco-Nano-Base` | Modelo base de los experimentos | no disponible | no disponible | Apache-2.0 (segun su model card) | HuggingFace |

No se identifican en la informacion disponible otras alternativas comparables de la misma categoria.

## Limitaciones y advertencias

- El repositorio no es un modelo de inferencia unico: es un artefacto de investigacion con multiples directorios; para inferir hay que elegir un directorio de modelo completo.
- Los checkpoints parciales deben reanudarse con los scripts, el modelo base, los datos y el entorno correspondientes; no son utilizables directamente como modelos finales.
- Sesgos conocidos: no documentados en la informacion disponible; al tratarse de datos de FineWeb-2 y Wura, heredaria los sesgos de esas fuentes.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto; la adaptacion se centra en hausa y yoruba, y los paneles de evaluacion buscan precisamente medir el posible olvido en otros idiomas.
- Licencia: no se especifica licencia del repositorio, lo que supone una incertidumbre importante para cualquier uso comercial. Los componentes de origen tienen licencias ODC-By 1.0 y Apache-2.0.
- Uso comercial: no puede confirmarse sin una licencia explicita.
- Fecha de creacion y actualizacion registradas como 2026-10-03, posterior a la fecha habitual de publicacion; conviene verificar la vigencia del repositorio.
- El repositorio tiene 0 descargas y 1 like, por lo que no cuenta con validacion de la comunidad.
- El gran tamano (aproximadamente 1,03 TiB) dificulta su descarga y almacenamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lylybig8/routing-analysis-anvil-six-models
- Modelo base: `AIDC-AI/Marco-Nano-Base` (referenciado en la model card; sin URL explicita en la informacion proporcionada)
- Dataset FineWeb-2: `HuggingFaceFW/fineweb-2` (referenciado en la model card)
- Dataset Wura: `castorini/wura` (referenciado en la model card)
- Dataset relacionado: https://huggingface.co/datasets/lylybig/routing_analysis-code-data
- Dataset relacionado: https://huggingface.co/datasets/lylybig8/routing_analysis-marco_nano-kat_Geor-checkpoints/tree/main
- LightEval v0.10.0 (herramienta de evaluacion usada en el repositorio; sin URL explicita en la informacion proporcionada)
- Resultado de busqueda, repositorio Anvil: https://github.com/jakerusso100-ai/Anvil
- Resultado de busqueda, model routing: https://github.com/yenanjing/awesome-model-routing
- Resultado de busqueda, Artificial Analysis: https://artificialanalysis.ai/
