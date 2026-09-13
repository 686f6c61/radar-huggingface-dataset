# experimentalmachines/Qwen2.5-0.5B-Instruct-ExecuTorch

## Resumen

Qwen2.5-0.5B-Instruct-ExecuTorch es un conjunto de exportaciones a ExecuTorch del modelo Qwen/Qwen2.5-0.5B-Instruct, publicadas por el usuario experimentalmachines para ejecutar inferencia de texto directamente en dispositivos Android con CPU arm64. No es un modelo entrenado desde cero, sino un derivado cuantizado del modelo instruct de 0,5 mil millones de parametros de la familia Qwen2.5, convertido al formato `.pte` que consume el runtime de ExecuTorch 1.4.0.

El problema que resuelve es el de la inferencia local en movil sin GPU y sin conexion: los ficheros usan el backend XNNPACK con cuantizacion 8da4w (activaciones dinamicas de 8 bits, pesos de 4 bits en grupos de 32) y embeddings int8 por canal, lo que reduce el peso del modelo a 0,42 GB por fichero. Cada fichero lleva fijada en su interior la ventana de contexto, porque el runtime reserva la cache KV completa al cargar.

Su relevancia actual es doble: por un lado, permite integrar un modelo de lenguaje en aplicaciones Android mediante la app openweights o cualquier runtime ExecuTorch 1.4.0; por otro, sirve como referencia de exportacion reproducible para quien quiera empaquetar modelos pequenos para edge. Como contrapartida, el repositorio no tenia descargas ni valoraciones en el momento de la consulta y no publica resultados de benchmarks mas alla de un smoke test.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredado del modelo base Qwen2.5-0.5B-Instruct; la model card no detalla numero de capas, cabezas ni dimension oculta |
| Parametros totales | 0,5 mil millones (heredados del modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | El runner exporta ventanas de 2.048 a 32.768 tokens; los ficheros `.pte` publicados en el repositorio corresponden a 2.048, 4.096 y 8.192 tokens, y la ventana queda fijada dentro del fichero |
| Tipos de cuantizacion | 8da4w: activaciones dinamicas de 8 bits, pesos de 4 bits en grupos de 32, embeddings int8 por canal, cache KV en fp32 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (derivado cuantizado del modelo base, se distribuye en los mismos terminos; se incluyen los ficheros de licencia originales sin modificar) |
| Formato de pesos | `.pte` (programa de ExecuTorch); tokenizer en `tokenizer.json` |

Otros datos del repositorio: tamano total de 1,3 GB, pipeline `text-generation`, libreria `executorch`, etiquetas `android`, `executorch`, `on-device`, `openweights`, `xnnpack`. Creado el 13 de septiembre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni el proceso de entrenamiento: no se indican numero de capas, dimensiones, tipo de atencion, numero de tokens de entrenamiento, composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico documentado es que se trata de un derivado cuantizado de Qwen/Qwen2.5-0.5B-Instruct (revision `7ae557604adf`), un modelo de la familia Qwen2.5 orientado a instrucciones.

La innovacion tecnica de esta publicacion esta en el pipeline de exportacion, no en el entrenamiento. Se uso la herramienta `export_llm` de ExecuTorch 1.4.0 con backend XNNPACK y operadores extendidos, prefill en trozos de 2.048 tokens, cuantizacion 8da4w (8 bits en activaciones, 4 bits en pesos agrupados de 32 en 32), embeddings int8 por canal y cache KV en fp32. Cada variante de ventana se exporta como un fichero independiente y el repositorio incluye, por carpeta de backend, un `config.json` con los metadatos de cada variante, el campo `fits_phone_budget` (estimacion contra un presupuesto de 5 GB) y un `export-report-<ventana>.json` con el registro completo de la exportacion. El proceso esta automatizado mediante GitHub Actions en el repositorio executorch-model-exporter.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Inferencia completamente local en dispositivos arm64 (Android), sin necesidad de GPU ni de conexion de red.
- Soporte de ventanas de contexto largas para su tamano: hasta 8.192 tokens en los ficheros publicados y hasta 32.768 tokens en las exportaciones que el runner puede generar.
- Ejecucion a traves de la app openweights para Android o de cualquier runtime ExecuTorch 1.4.0 compatible.
- Integracion con operadores extendidos de XNNPACK para aprovechar aceleracion SIMD en CPU arm64.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Asistente de texto sin conexion en aplicaciones Android: el fichero de 2.048 tokens ocupa 0,42 GB y necesita unos 50 MB adicionales de cache KV, por lo que cabe en moviles de gama media y permite responder consultas sin enviar datos a un servidor.
- Procesamiento de texto con requisitos de privacidad: al ejecutarse en el propio dispositivo, el contenido del usuario no sale del terminal, lo que encaja en aplicaciones de notas, diarios o mensajeria con requisitos de cumplimiento estrictos.
- Resumen de documentos locales: con la variante de 8.192 tokens se pueden resumir correos, articulos o notas de varias paginas manteniendo todo el contexto en memoria.
- Clasificacion y extraccion de entidades en el borde: el modelo puede etiquetar o estructurar texto antes de decidir si merece la pena enviarlo a un servicio en la nube, reduciendo coste y trafico.
- Borradores y autocompletado en aplicaciones de productividad: generacion de respuestas sugeridas o reescritura de frases dentro de una app movil, con latencia local y sin cuota de API.
- Moderacion previa en el dispositivo: filtrado de texto ofensivo o spam en el propio terminal antes de subirlo a un backend, usando respuestas cortas y plantillas de prompt fijas.
- Prototipado y validacion de pipelines ExecuTorch: el repositorio incluye los informes de exportacion y los `config.json`, por lo que sirve como caso de referencia para verificar que una exportacion 8da4w funciona en un dispositivo antes de escalar a modelos mayores.
- Pruebas de integracion en CI para aplicaciones Android: un modelo de 0,42 GB es lo bastante pequeno para incluirlo en pruebas automatizadas de un runner arm64 y validar el flujo completo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta un smoke test superado para cada fichero XNNPACK, con la respuesta "Paris", sin detallar la pregunta exacta ni la configuracion de decodificacion. Tampoco se publican cifras de latencia, tokens por segundo ni consumo energetico.

## Requisitos de hardware

| Ventana | Peso del fichero | Cache KV (fp32) | Memoria total estimada |
|---|---|---|---|
| 2.048 tokens | 0,42 GB | 50.331.648 bytes (24.576 bytes por token) | ~0,47 GB |
| 4.096 tokens | 0,42 GB | 100.663.296 bytes (24.576 bytes por token) | ~0,52 GB |
| 8.192 tokens | 0,42 GB | 201.326.592 bytes (24.576 bytes por token) | ~0,62 GB |

- No requiere GPU: el backend publicado es XNNPACK sobre CPU arm64, valido para cualquier dispositivo arm64.
- Si cabe en hardware de consumo: si, en practicamente cualquier movil Android moderno. El propio repositorio incluye el campo `fits_phone_budget`, que compara cada variante contra un presupuesto de 5 GB.
- La cache KV se asigna completa al cargar el modelo, no de forma incremental, por lo que el pico de memoria se produce en el arranque.
- Opciones de despliegue: runtime de ExecuTorch 1.4.0 y la aplicacion openweights para Android. Los ficheros `.pte` no son compatibles con vLLM, llama.cpp, Ollama ni TGI, que trabajan con otros formatos de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de pesos | Licencia | Ejecucion |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-ExecuTorch (este modelo) | 0,5 mil millones | 2.048 a 32.768 tokens segun el fichero; publicados 2.048, 4.096 y 8.192 | `.pte` (ExecuTorch) | apache-2.0 | CPU arm64 con XNNPACK, sin GPU |
| Qwen2.5-0.5B-Instruct (modelo base) | 0,5 mil millones | Ventanas de hasta 32.768 tokens segun las exportaciones realizadas | No disponible | apache-2.0 | Requiere stack de inferencia en Python o equivalente; no disponible en la informacion proporcionada |
| Qwen2.5-1.5B-Instruct | 1,5 mil millones (hermano mayor de la misma familia) | No disponible | No disponible | No disponible | No disponible |
| Exportaciones ExecuTorch de otros modelos pequenos | No disponible | No disponible | `.pte` | No disponible | No disponible |

La comparacion con alternativas de la misma categoria (otros modelos de menos de 1.000 millones de parametros empaquetados para movil) no puede completarse con la informacion proporcionada: no se han encontrado en la busqueda web datos de modelos equivalentes ni resultados de benchmarks que permitan situar este modelo frente a otros.

## Limitaciones y advertencias

- Tamano muy reducido: con 0,5 mil millones de parametros, la calidad de razonamiento, la coherencia en cadenas largas y el conocimiento factual son limitados en comparacion con modelos de 7B o mas.
- Riesgo elevado de alucinacion: no se ha publicado ninguna evaluacion de factualidad, y el unico smoke test documentado es la respuesta "Paris".
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede estimar su rendimiento relativo antes de desplegarlo.
- Contexto fijo por fichero: la ventana se decide en el momento de la exportacion y no se puede ampliar en tiempo de ejecucion. Si se necesita mas contexto hay que usar otro fichero, con el consiguiente aumento de memoria.
- Reserva completa de la cache KV al cargar: el modelo puede provocar picos de memoria en el arranque, especialmente problematicos en dispositivos con poca RAM libre.
- Perdida de precision por cuantizacion: la combinacion 8da4w (pesos de 4 bits en grupos de 32) degrada la calidad respecto a los pesos originales, de forma mas acusada en un modelo ya de por si pequeno.
- Idiomas no documentados: la model card no especifica la cobertura linguistica, por lo que no se puede garantizar un comportamiento correcto en castellano sin pruebas propias.
- Alcance limitado a texto: el pipeline declarado es `text-generation`, sin soporte documentado de vision, audio, tool calling ni agentes.
- Plataforma restringida: los ficheros estan pensados para arm64 y ExecuTorch 1.4.0; no son directamente utilizables en x86, en CUDA ni en los frameworks de servidor habituales.
- Adopcion nula y validacion externa inexistente: el repositorio registraba 0 descargas y 0 likes en el momento de la consulta y fue creado en septiembre de 2026, por lo que no hay retroalimentacion de la comunidad.
- Licencia: se distribuye bajo apache-2.0, la misma del modelo base, lo que en principio permite uso comercial; conviene revisar igualmente los terminos del modelo original de Qwen incluidos en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/experimentalmachines/Qwen2.5-0.5B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
- Aplicacion openweights para Android: https://github.com/alpharomercoma/openweights
- Repositorio del exportador y ejecucion de compilacion: https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34749101435
- Ficheros del repositorio: `xnnpack/Qwen2.5-0.5B-Instruct-8da4w-2k.pte`, `xnnpack/Qwen2.5-0.5B-Instruct-8da4w-4k.pte`, `xnnpack/Qwen2.5-0.5B-Instruct-8da4w-8k.pte`, `tokenizer.json`, `config.json` y `export-report-<ventana>.json` por cada backend.

Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (correspondian a la plataforma de juego Bridge Base Online y a paginas de la Federacion Francesa de Bridge), por lo que no se han incluido como fuentes.
