# marcorez8/GLM-5.3-Flash-Abliterated-Heretic-V2-UD-IQ4_XS

## Resumen

Este repositorio publica un GGUF autónomo listo para ejecutar de GLM-5.3-Flash, el modelo MoE de zai-org con 320 759 404 382 parámetros totales y 18B parámetros activos según la model card, con licencia MIT y pesos en cuantización UD-IQ4_XS. La particularidad es que el LoRA Heretic Abliterated V2 de MorinoNushi (`glm-5.3-heretic-lora-v5.gguf`) ya está fusionado dentro de los pesos: no hay que cargar ningún adaptador aparte, basta con apuntar llama.cpp al primer shard.

El autor, marcorez8, plantea este merge como sucesor de su V1, cambiando la estrategia: en lugar de almacenar las 78 matrices modificadas en F16 (lo que daba ~186,3 GB), se desquantizan a FP32, se fusionan con `W_base + (B × A) × alpha / rank` y se requantizan al formato original (54 tensores en Q8_0 y 24 en IQ4_XS). El resultado ocupa ~156,8 GB, idéntico shard por shard al UD-IQ4_XS de Unsloth, con 1 334 tensores copiados byte a byte.

Es relevante ahora por dos motivos. Primero, porque demuestra que es viable fusionar un LoRA sobre un MoE cuantizado de 320B sin reconstruir el modelo completo y sin duplicar el espacio en disco. Segundo, porque es una pieza pensada explícitamente para investigación de seguridad, red-teaming y evaluación de filtros de rechazo: el aviso de contenido del propio autor advierte de que el modelo obedecerá peticiones que el original rechaza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); cadena de arquitectura GGUF `glm5next` / `glm5-next` |
| Parametros totales | 320 759 404 382 (≈320,8B) |
| Parametros activos | 18B (segun la model card del merge) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-IQ4_XS (Unsloth Dynamic 3.0) en la mayor parte de los tensores; 54 tensores requantizados en Q8_0 y 24 en IQ4_XS; proyector de vision en F16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF en 5 shards (00001-of-00005 a 00005-of-00005) + `mmproj-F16.gguf`; carpeta alternativa `Shard_Rewrite/` |

Datos adicionales del repositorio: tamano total del repo 159,1 GB; peso de los ficheros GGUF ~156,8 GB (9,4 MB + 50,0 GB + 49,6 GB + 49,5 GB + 7,7 GB); 0 descargas y 1 like en el momento de la consulta; creado y actualizado el 17 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del GLM-5.3-Flash de zai-org: un transformer con mezcla de expertos (MoE) de 320,8B parametros totales y 18B activos por token, segun la model card del merge. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento en el modelo base, mas alla de lo que declare el repositorio original de zai-org. El modelo es multimodal de forma experimental: el repo incluye `mmproj-F16.gguf`, un proyector de vision de 1,1 GB en F16 heredado de Unsloth.

Lo especifico de este repositorio no es el entrenamiento sino el post-procesado. El LoRA V2 de MorinoNushi tiene rango 1 y alpha 1, y se aplico con escala 1.0 sobre 78 matrices concretas: proyecciones de salida de atencion y down-projections de los expertos MoE. El proceso se hizo tensor a tensor, desquantizando a FP32, aplicando `W_base + (B × A) × alpha / rank`, y requantizando sin importance matrix con las rutinas de llama.cpp build b10819 (con `gguf-py` 0.19.0 y NumPy). Los 1 334 tensores restantes se copiaron literalmente. La diferencia respecto a V1 es precisamente esa requantizacion: V1 evitaba la perdida de redondeo guardando las matrices en F16 a cambio de ~30 GB extra; V2 prioriza el tamano compacto asumiendo un redondeo que, en las pruebas locales del autor, no altera de forma perceptible la inferencia.

Un detalle operativo relevante: el PR de soporte de `glm5next` en llama.cpp renombro claves de metadatos GGUF (de `glm5next` a `glm5-next`). Los ficheros de la raiz llevan los metadatos originales de Unsloth y funcionan con builds de revisiones antiguas del PR; `Shard_Rewrite/` contiene el shard 1 y el mmproj reescritos para el esquema nuevo. Los shards 2 a 5 son compartidos.

## Capacidades

- Generacion de texto conversacional en ingles y chino, el caso de uso declarado en el pipeline (`text-generation`).
- Razonamiento y generacion de codigo, heredados del modelo base GLM-5.3-Flash; el autor afirma que el comportamiento conversacional y de programacion se mantiene intacto tras el merge.
- Vision experimental mediante el proyector `mmproj-F16.gguf` incluido en el repositorio.
- Ejecucion de tareas sin capa de rechazo: el modelo responde a peticiones que el GLM-5.3-Flash original deniega, incluidas las daninas, ofensivas o ilegales, tal como advierte el propio autor.
- Compatibilidad con runtimes basados en llama.cpp, incluidos los que consumen GGUF directamente (`llama.cpp`, y por extension servidores compatibles con su API).
- Capacidad de servir como sujeto de estudio para tecnicas de abliteration, fusion de LoRA sobre cuantizaciones y redondeo de requantizacion.
- No se documenta soporte explicito de tool calling, function calling ni flujos de agentes multi-paso en la informacion disponible.

## Casos de uso

- Red-teaming de sistemas de moderacion: se puede usar como generador adversario para comprobar si un clasificador de contenido detecta respuestas daninas que este modelo si produce, aprovechando que el rechazo esta suprimido.
- Investigacion sobre abliteration y seguridad: permite comparar la tasa de rechazo y la degradacion de capacidades frente al GLM-5.3-Flash original y frente al LoRA V2 sin fusionar, en un mismo entorno de inferencia.
- Estudio de tecnicas de merge y cuantizacion: reproduce el pipeline de desquantizacion a FP32, fusion `B × A` y requantizacion sobre 78 matrices de un MoE de 320B, util para validar metodologias equivalentes en otros modelos.
- Evaluacion de pipelines de inferencia GGUF a gran escala: sirve para medir carga por shards, resolucion automatica de shards 2 a 5, consumo de RAM/VRAM y comportamiento del offload en un modelo de ~157 GB.
- Asistente conversacional local en ingles y chino: en entornos aislados o con requisitos de privacidad, se puede desplegar como chat autoalojado sin dependencia de APIs externas, siempre que la ausencia de filtros sea aceptable para el contexto.
- Generacion de codigo en local: el modelo hereda la capacidad de programacion del base y puede integrarse en editores con backend llama.cpp, con la salvedad de que no hay benchmarks publicados que cuantifiquen la degradacion tras el merge.
- Pruebas de estres de contexto largo: util para medir como se comporta un MoE de 320B con 18B activos cuando el KV cache crece, aunque la longitud de contexto soportada no esta documentada.
- Analisis de imagenes en laboratorio: con el mmproj F16 se puede explorar el comportamiento multimodal del base en tareas sencillas de descripcion o VQA, siempre con caracter experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se volvio a ejecutar ninguna prueba formal de tasa de rechazo ni de divergencia KL sobre los pesos fusionados, y que las cifras que pudieran citarse son las publicadas por el autor del LoRA para el adaptador aplicado en tiempo de ejecucion sobre la misma base UD-IQ4_XS. No hay datos de MMLU, HumanEval, GSM8K ni equivalentes en el material proporcionado para este merge ni para el modelo base.

| Benchmark | Este merge | Modelo base | Notas |
|---|---|---|---|
| Tasa de rechazo / KL | no disponible | no disponible | El autor no re-ejecuto las pruebas tras el merge |
| MMLU, HumanEval, GSM8K | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Requisitos de hardware

- VRAM/RAM para los pesos: al menos ~157 GB de memoria agregada, segun el tamano real de los cinco shards (9,4 MB + 50,0 GB + 49,6 GB + 49,5 GB + 7,7 GB) mas `mmproj-F16.gguf` (1,1 GB) si se usa vision.
- VRAM adicional para el KV cache: no cuantificable con precision porque la longitud de contexto del modelo no esta documentada; en un MoE de este tamano el KV cache es el factor que decide si hace falta una GPU mas.
- GPU de datacenter: 3-4 unidades de 80 GB (A100, H100, H200) para mantener todos los pesos en VRAM con margen para el KV cache. Dos H100 de 80 GB (160 GB) quedan demasiado justas una vez se anade cache y buffers.
- Consumer GPU: no cabe en ninguna GPU de consumo por si sola. Una RTX 4090 (24 GB) obligaria a descargar la mayor parte del modelo a RAM del sistema, con un coste de latencia muy alto.
- Alternativa con memoria unificada: equipos Apple Silicon con 192 GB de memoria unificada pueden alojar los pesos si el runtime lo permite, con rendimiento limitado por ancho de banda.
- Despliegue: llama.cpp (builds que soporten la arquitectura `glm5-next`, build b10819 o posterior segun el esquema de metadatos elegido), y cualquier runtime que consuma GGUF sobre llama.cpp. vLLM y TGI no se citan en la informacion disponible para este repositorio.
- Seleccion de metadatos: hay que comprobar si la build de llama.cpp espera `glm5next` o `glm5-next`. Si falla con un error de arquitectura desconocida o clave ausente, se cambia entre la raiz y `Shard_Rewrite/`.
- Latencia y throughput: no disponible. Al ser un MoE con 18B parametros activos, el coste de computo por token es mucho menor que el de un denso de 320B, pero el cuello de botella real sera el ancho de banda de memoria al leer expertos.

## Comparativa con modelos similares

No hay informacion sobre otros modelos abliterated de la misma categoria (320B MoE, 18B activos) en el material proporcionado. La comparacion mas util es entre las variantes del propio linaje, todas ellas documentadas en la model card.

| Version | Formato y tamano | Licencia | Ventaja principal | Inconveniente |
|---|---|---|---|---|
| Este merge (V2, UD-IQ4_XS) | GGUF ~156,8 GB, 5 shards iguales a Unsloth | MIT | Un solo fichero, sin adaptador, mismo tamano que el quant original | Redondeo por requantizacion de los 78 tensores modificados |
| Merge V1 (UD-IQ4_XS-F16) | GGUF ~186,3 GB, re-dividido en 1 + 4 | MIT | Sin perdida por requantizacion en las matrices fusionadas | ~30 GB extra y layout de shards distinto |
| LoRA V2 de MorinoNushi | Adaptador GGUF, ~86 MB | MIT (heredada del repo base) | Opcion sin perdida; permite activar y desactivar el efecto | Requiere cargar base + adaptador por separado |
| Unsloth GLM-5.3-Flash-GGUF (UD-IQ4_XS) | GGUF, base sin abliterar | MIT | Modelo de referencia con filtros intactos | No permite estudiar comportamiento sin rechazo |
| zai-org/GLM-5.3-Flash | Pesos originales, formato no disponible | MIT | Referencia canonica, sin post-procesado | No es un GGUF listo para llama.cpp |

## Limitaciones y advertencias

- El rechazo del modelo base esta suprimido de forma deliberada. El modelo cumplira peticiones daninas, ofensivas o ilegales; el propio autor lo restringe a investigacion personal, red-teaming y evaluacion.
- No se ha medido formalmente la tasa de rechazo ni la divergencia KL de los pesos fusionados. La afirmacion de que la requantizacion no degrada el resultado es una observacion cualitativa del autor, no un resultado verificado.
- La requantizacion de los 78 tensores modificados sin importance matrix introduce error de redondeo y, en principio, puede atenuar ligeramente el efecto del LoRA.
- Riesgo de alucinacion y de degradacion de capacidades tras el merge no cuantificado: no hay benchmarks comparativos con el base.
- Soporte de idiomas limitado a ingles y chino; no hay datos sobre el rendimiento en castellano.
- Longitud de contexto no documentada, lo que impide planificar despliegues con requisitos de contexto largo.
- Incompatibilidad potencial con builds de llama.cpp por el renombrado de metadatos `glm5next` a `glm5-next`; exige elegir entre la raiz y `Shard_Rewrite/`.
- La vision es experimental y depende del `mmproj-F16.gguf` heredado de Unsloth; no hay evaluacion propia de calidad multimodal en este repositorio.
- Licencia MIT: permite uso comercial desde el punto de vista del copyright, pero no exime de responsabilidad legal por el contenido generado. Conviene revisar si el modelo base y el LoRA anaden condiciones adicionales.
- Validacion comunitaria practicamente nula: 0 descargas y 1 like en el momento de la consulta, con el repositorio publicado y actualizado el mismo dia.
- Requisitos de memoria (~157 GB) hacen inviable su despliegue en infraestructura de consumo sin offload masivo a RAM.
- El plan de despliegue debe asumir que los cinco shards son obligatorios y que el primero se referencia explicitamente; los demas se resuelven de forma automatica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marcorez8/GLM-5.3-Flash-Abliterated-Heretic-V2-UD-IQ4_XS
- Merge V1 del mismo autor: https://huggingface.co/marcorez8/GLM-5.3-Flash-Abliterated-Heretic-V1-UD-IQ4_XS-F16
- Modelo base zai-org: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizacion de Unsloth (UD-IQ4_XS): https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF/tree/main/UD-IQ4_XS
- LoRA Heretic Abliterated V2 de MorinoNushi: https://huggingface.co/MorinoNushi/GLM-5.3-Flash-Heretic-Abliterated-LoRA-V2-GGUF
- Paper, blog o repositorio adicional: no disponible
- Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (corresponden a manuales de una camara Nikon D3300), por lo que no se han incorporado enlaces de esa busqueda.
