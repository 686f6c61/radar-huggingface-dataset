# mradermacher/Qwen3.8-27B-Optimal-Ablit-Heretic-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo sci4ai/Qwen3.8-27B-Optimal-Ablit-Heretic, generadas por mradermacher mediante cuantización con imatrix (etiquetadas como i1). Se trata, por tanto, de una redistribución en formato GGUF de un modelo base de aproximadamente 26,9 mil millones de parámetros, no de un modelo entrenado desde cero. El autor del repositorio, mradermacher, es conocido por publicar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles.

El modelo base se presenta con las etiquetas "heretic", "abliterated", "uncensored" y "decensored", lo que indica que ha sido sometido a un proceso de abliteración: la remoción o supresión de las direcciones de activación asociadas al rechazo de peticiones, con el objetivo de eliminar los mecanismos de negativa del modelo. El nombre comercial "Qwen3.8-27B" no corresponde a ninguna denominación oficial conocida de la familia Qwen, por lo que la procedencia exacta del entrenamiento y la arquitectura subyacente no pueden confirmarse a partir de la información disponible. La model card del cuantizador afirma además que se trata de un modelo de visión, con ficheros mmproj (si existen) alojados en el repositorio estático.

La relevancia de esta publicación es doble: por un lado, permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones de 10,1 a 16,6 GB; por otro, sirve como material de estudio para investigación en seguridad y alineación, ya que los modelos abliterados se utilizan habitualmente para evaluar la robustez de los mecanismos de rechazo y medir el impacto de la eliminación de alineación sobre las capacidades generales. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación comunitaria de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere una base tipo Qwen3, sin confirmar en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M (10,1 GB), i1-Q2_K (10,8 GB), i1-IQ3_XXS (11,3 GB), i1-IQ3_M (12,7 GB), i1-Q3_K_M (13,4 GB), i1-Q4_K_S (15,7 GB), i1-Q4_K_M (16,6 GB); en el repositorio estatico tambien Q2_K_S, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XS, IQ3_S, IQ3_L, Q3_K_S, Q3_K_L, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); incluye fichero imatrix de 0,1 GB para crear cuantizaciones propias |
| Tamano del repositorio | 157,1 GB |
| Modelo base | sci4ai/Qwen3.8-27B-Optimal-Ablit-Heretic |
| Etiquetas | heretic, uncensored, decensored, abliterated, imatrix, conversational |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del modelo base en la informacion proporcionada. El repositorio es exclusivamente una publicacion de cuantizaciones: la model card documenta el proceso de cuantizacion (imatrix, version de quantize 2, tensor quantised, conversion a HF), los tipos de cuantizacion ofrecidos y las herramientas de referencia, pero no describe la arquitectura subyacente, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o similares.

Lo unico documentado sobre el entrenamiento es el proceso de modificacion posterior: el modelo base ha sido "abliterated" (eliminacion de la direccion de rechazo en el espacio de activaciones) y se etiqueta como "heretic" y "decensored". Este tipo de intervenciones suele aplicarse sobre un modelo ya alineado y consiste en identificar las direcciones de activacion responsables de las negativas y restarlas de los pesos, sin reentrenamiento completo. No se especifica en la informacion disponible que se hayan realizado ajustes adicionales despues de la abliteracion ni como se ha evaluado el impacto sobre las capacidades del modelo. Tampoco se confirma la existencia de ficheros mmproj en el repositorio estatico, pese a que la model card del cuantizador afirma que se trata de un modelo de vision.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y su uso previsto en llama.cpp y herramientas GGUF es el de asistente de texto multi-turno.
- Generacion de codigo: no documentada explicitamente en la informacion proporcionada; debe verificarse empiricamente.
- Razonamiento y matematicas: no documentados; no hay benchmarks ni declaraciones del autor al respecto.
- Vision: la model card del cuantizador afirma que es un modelo de vision, pero no confirma que existan ficheros mmproj para esta cuantizacion. La funcionalidad multimodal queda pendiente de verificacion.
- Tool calling / function calling: no disponible; no se menciona en la model card ni en las etiquetas.
- Capacidades de agente y razonamiento multi-paso: no disponibles; no se documentan.
- Capacidades multilingues: solo se declara ingles (en). No hay soporte declarado de castellano ni de otros idiomas.
- Modo "thinking": no documentado.
- Ausencia de rechazos: por el proceso de abliteracion, el modelo no aplica los mecanismos de negativa tipicos de un modelo alineado. Esto es una caracteristica buscada, no una capacidad de calidad.

## Casos de uso

- Ejecucion local de un asistente de ~27B en una unica GPU de 24 GB: con la cuantizacion i1-Q4_K_M (16,6 GB) o i1-Q4_K_S (15,7 GB) el modelo cabe completo en VRAM en una RTX 3090 o RTX 4090 junto con la cache KV para contextos moderados, lo que permite un asistente de escritorio sin conexion a internet.
- Investigacion en seguridad y alineacion: el modelo sirve como objeto de estudio para medir que ocurre cuando se eliminan las direcciones de rechazo, comparar la tasa de cumplimiento de peticiones daninas frente al modelo original y evaluar si la abliteracion degrada capacidades generales como coherencia o razonamiento.
- Red-teaming y evaluacion de filtros: al ser un modelo sin negativas, es util para generar prompts adversarios y contenido sensible de forma controlada en un entorno aislado, con el objetivo de probar clasificadores de seguridad y sistemas de moderacion.
- Generacion de datos sinteticos en dominios delicados: para construir datasets de entrenamiento de clasificadores (por ejemplo, deteccion de discurso danino o de contenido para adultos) se necesita un generador que no rechace la tarea; este modelo encaja, siempre con revision humana y trazabilidad del dataset.
- Prototipado en estaciones de trabajo Apple Silicon: con cuantizaciones de 10 a 13 GB (i1-IQ2_M a i1-Q3_K_M) puede ejecutarse en Macs con 16-24 GB de memoria unificada mediante llama.cpp u Ollama, util para pruebas de concepto y comparaciones de calidad entre niveles de cuantizacion.
- Creacion de cuantizaciones propias: el repositorio incluye el fichero imatrix (0,1 GB), de modo que un equipo puede generar sus propios GGUF con llama.cpp adaptados a su presupuesto de memoria, en lugar de descargar una cuantizacion predefinida.
- Estudio comparativo de degradacion por cuantizacion: al ofrecer desde IQ2_M hasta Q6_K sobre el mismo modelo base, permite medir la perdida de perplejidad y de calidad en tareas concretas segun el numero de bits, algo relevante para decidir el punto de equilibrio en produccion.
- Analisis de documentos e imagenes (condicionado): si el repositorio estatico incluye ficheros mmproj validos, el modelo podria emplearse para descripcion de imagenes o extraccion de informacion de documentos escaneados; sin esa verificacion, el caso no es aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y las busquedas web realizadas no devolvieron resultados relacionados con el modelo (los resultados obtenidos correspondian a contenidos no relacionados sobre la constante de los gases ideales). Tampoco se han publicado mediciones de perplejidad especificas para estas cuantizaciones, mas alla de la referencia generica al grafico comparativo de tipos de cuantizacion enlazado por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso del fichero mas la cache KV. Para i1-Q4_K_M (16,6 GB) se estiman aproximadamente 18-20 GB en GPU con contextos de 8-16K; para i1-Q4_K_S (15,7 GB), unos 17-19 GB; para i1-Q3_K_M (13,4 GB), unos 15-17 GB; para i1-IQ2_M (10,1 GB), unos 11-13 GB. Estas cifras son estimaciones a partir del tamano de fichero y no estan confirmadas por el autor.
- GPU recomendadas en servidor: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB. Con estas tarjetas el modelo cabe en Q4_K_M o superior sin offload y permite mayor paralelismo y contexto.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) ejecutan Q4_K_M y Q4_K_S completos en GPU; RTX 4080/4070 Ti y tarjetas de 16 GB requieren cuantizaciones Q3 o IQ3 junto con offload parcial a CPU; tarjetas de 12 GB necesitan IQ2/IQ3 con offload de capas.
- Apple Silicon: viable con memoria unificada de 16 GB (cuantizaciones IQ2/IQ3) y recomendable a partir de 32 GB para Q4_K_M con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui (loader llama.cpp), Jan. Para el modelo sin cuantizar, vLLM o TGI, aunque este repositorio concreto solo distribuye GGUF. La funcionalidad de vision requiere mmproj y un frontend compatible (por ejemplo, llama.cpp con soporte multimodal).
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de su documentacion publica y deben verificarse antes de un uso en produccion. Para el modelo de esta ficha, los campos no documentados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Multimodal | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Optimal-Ablit-Heretic (i1-GGUF) | 26,9 B | no disponible | apache-2.0 | declarado por el cuantizador, mmproj no confirmado | GGUF (i1, imatrix) | Sin benchmarks; version abliterada; 0 descargas en el momento de la consulta |
| Qwen3-32B | 32,8 B | 32.768 tokens nativos, 131.072 con YaRN | apache-2.0 | no | safetensors, GGUF (terceros) | Modelo oficial de la familia Qwen3, solo texto |
| Mistral Small 3.1 24B | 24 B | 128.000 tokens | apache-2.0 | si (vision) | safetensors, GGUF (terceros) | Alternativa europea con licencia permisiva y vision nativa |
| Gemma 3 27B | 27 B | 128.000 tokens | Gemma Terms of Use | si (vision) | safetensors, GGUF (terceros) | Tamano comparable; licencia con condiciones de uso adicionales |

## Limitaciones y advertencias

- Riesgo de contenido danino: el modelo esta explicitamente abliterado y desensurado. No aplica negativas ante peticiones peligrosas, ilegales o daninas, por lo que no debe exponerse a usuarios finales sin una capa externa de moderacion.
- Perdida de alineacion sin evaluar: no se documenta ninguna evaluacion del impacto de la abliteracion sobre la utilidad, la coherencia ni la veracidad. Es habitual que estos procesos degraden ligeramente el rendimiento general, pero no hay datos que lo confirmen o desmientan en este caso.
- Alucinacion: al no haber benchmarks ni evaluaciones publicadas, no puede estimarse la tasa de alucinacion. En tareas factuales debe tratarse como no verificado.
- Contexto desconocido: no se indica la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- Idioma: solo se declara ingles. El uso en castellano no esta soportado oficialmente y su calidad es impredecible.
- Vision no confirmada: aunque la model card del cuantizador afirma que es un modelo de vision, no se confirma la existencia de ficheros mmproj. No conviene disenar productos que dependan de esta capacidad sin comprobarlo.
- Procedencia ambigua: el nombre "Qwen3.8-27B" no corresponde a ninguna denominacion oficial conocida de Qwen. Antes de un uso comercial conviene auditar el modelo base y sus terminos, mas alla de la etiqueta apache-2.0 declarada.
- Cuantizaciones de muy baja precision: las variantes IQ2_M, Q2_K e IQ3_XXS (10-11 GB) implican una perdida de calidad notable. El propio autor indica que IQ3_XXS es "lower quality" y que Q3_K_M puede ser peor que IQ3_S. Para produccion se recomienda Q4_K_M o superior.
- Sin validacion comunitaria: el repositorio presenta 0 descargas y 0 "likes", sin issues ni evaluaciones de terceros. Es un artefacto recien publicado y sin contrastar.
- Licencia y responsabilidad: apache-2.0 permite uso comercial, pero la licencia cubre el artefacto publicado, no exime de responsabilidad por el contenido generado ni de las obligaciones derivadas del modelo base original.
- Formato GGUF: no es compatible directamente con vLLM o TGI sin conversion. Para alto throughput en servidor hay que partir del modelo base en safetensors.

## Enlaces

- Repositorio HuggingFace (i1-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-Optimal-Ablit-Heretic-i1-GGUF
- Repositorio estatico de cuantizaciones: https://huggingface.co/mradermacher/Qwen3.8-27B-Optimal-Ablit-Heretic-GGUF
- Modelo base: https://huggingface.co/sci4ai/Qwen3.8-27B-Optimal-Ablit-Heretic
- Fichero imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Optimal-Ablit-Heretic-i1-GGUF/resolve/main/Qwen3.8-27B-Optimal-Ablit-Heretic.imatrix.gguf
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Optimal-Ablit-Heretic-i1-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
