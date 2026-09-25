# after2400/qmd-query-expansion-1.7B-mlx-4bit

## Resumen

qmd-query-expansion-1.7B-mlx-4bit es una conversion a formato MLX en 4 bits del modelo de expansion de consultas que acompana a qmd, una herramienta de busqueda. El modelo original es un ajuste fino de Qwen3-1.7B publicado por el usuario tobil en formato GGUF, y esta version la ha generado el usuario after2400 para que funcione como modelo de expansion por defecto de pyqmd, el port a Python y MLX de qmd.

Su funcion es muy concreta: dada una consulta de busqueda, devuelve tres lineas tipadas que alimentan una busqueda hibrida. La linea "hyde" contiene un pasaje hipotetico que responderia a la consulta, la linea "lex" agrupa variaciones de palabras clave utiles para busqueda lexica tipo BM25 y la linea "vec" ofrece una reformulacion en lenguaje natural pensada para busqueda vectorial. Es, por tanto, un componente de infraestructura de recuperacion de informacion, no un modelo conversacional de proposito general.

El interes actual de esta ficha es doble. Por un lado, documenta un patron de uso muy habitual en pipelines RAG: emplear un modelo pequeno y especializado para reescribir la consulta antes de recuperar. Por otro, ilustra una ruta de conversion poco frecuente (GGUF f16 a MLX bf16 y de ahi a 4 bits con mlx-lm) y advierte de un problema real de procedencia, ya que revisiones anteriores del repositorio contenian un merge defectuoso del modelo base. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Qwen3 (config y tokenizer tomados de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit MLX affine con group size 64 (unica cuantizacion de este repo); el modelo upstream ofrece GGUF f16 |
| Idiomas soportados | No disponible en la informacion proporcionada (los ejemplos de prompt y salida estan en ingles) |
| Licencia | MIT (el modelo base Qwen/Qwen3-1.7B se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors para MLX (repo de 1,9 GB) |
| Libreria | mlx (mlx-lm 0.31.3 durante la conversion) |
| Modelo base | tobil/qmd-query-expansion-1.7B-gguf |
| Pipeline | text-generation |
| Tamano del repositorio | 1,9 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3-1.7B, un transformer decoder-only denso. Esta version no introduce cambios estructurales: la configuracion y el tokenizer se tomaron de Qwen/Qwen3-1.7B en la revision 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e, mientras que los pesos proceden del fichero qmd-query-expansion-1.7B-f16.gguf de tobil/qmd-query-expansion-1.7B-gguf en la revision 7816de0b72572c6c860ca1eddf97ba9e7fb8cc65.

La conversion se realizo con el script scripts/convert_expand_gguf.py de pyqmd, que mapea los nombres de tensores del GGUF al layout de Qwen3 y los deja en bf16; despues se aplico mlx_lm.convert para obtener la cuantizacion 4-bit con group size 64. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si el ajuste fino uso RLHF, DPO u otra tecnica de alineamiento. La innovacion funcional del modelo es el formato de salida: en lugar de texto libre, responde con lineas tipadas (hyde, lex, vec) que un motor de busqueda puede consumir directamente, y admite el prefijo /no_think de la plantilla de chat de Qwen3 para desactivar el razonamiento explicito y reducir la latencia.

## Capacidades

- Expansion de consultas de busqueda en tres formatos simultaneos: pasaje hipotetico (hyde), variaciones de palabras clave (lex) y reformulacion en lenguaje natural (vec).
- Generacion de texto autorregresiva con la plantilla de chat de Qwen3, incluyendo el control /no_think para omitir el bloque de razonamiento.
- Salida estructurada y predecible, pensada para ser parseada por software y no para lectura humana.
- Integracion directa con la libreria mlx_lm mediante load y generate, segun el ejemplo de la model card.
- Soporte de conversacion multi-turno segun el tag conversational del repositorio.
- Capacidades multilingues: no disponible.
- Tool calling o function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado; el modelo esta disenado para una unica tarea de reescritura.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Busqueda hibrida en pipelines RAG: el modelo genera en una sola pasada las tres representaciones de la consulta, de modo que el recuperador puede lanzar en paralelo una busqueda BM25 con los terminos de "lex", una busqueda densa con el texto de "vec" y una busqueda por similitud con el pasaje hipotetico de "hyde", y fusionar los resultados por reciprocal rank fusion.
- Motores de busqueda local en linea de comandos: es el modelo de expansion por defecto de pyqmd, el port a Python y MLX de qmd, por lo que encaja en flujos de trabajo de busqueda sobre repositorios locales de documentos ejecutados en un Mac.
- Preprocesado de consultas en asistentes documentales: antes de consultar un indice vectorial, el sistema reescribe la pregunta del usuario en un pasaje hipotetico, lo que suele mejorar el recall cuando la consulta original es muy corta o ambigua.
- Busqueda sobre documentacion tecnica interna: consultas como "auth config" se expanden a variantes lexicas y a una formulacion completa, lo que ayuda a cubrir terminologia que los documentos usan de forma distinta a la del usuario.
- Recuperacion en corpus de codigo y ficheros de configuracion: el ejemplo de la model card usa precisamente "auth config", un caso tipico de busqueda de fragmentos de configuracion donde los terminos exactos importan para la parte lexica.
- Componente de un agente de recuperacion: la reescritura de la consulta puede insertarse como primer paso de un bucle de agente que decide despues si necesita recuperar mas informacion.
- Evaluacion de estrategias de expansion de consultas: al disponer de las tres variantes en una misma respuesta, sirve para comparar experimentalmente el rendimiento de HyDE frente a la expansion lexica en un mismo corpus.
- Despliegue en portatiles Apple Silicon: al ocupar 1,9 GB en el repositorio y no requerir GPU dedicada, permite ejecutar expansion de consultas en local sin enviar las consultas a un servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en 4 bits de un modelo de 1,72 mil millones de parametros: aproximadamente 1 GB de pesos, con un consumo total estimado de 1,5 a 2,5 GB de memoria durante la inferencia, incluyendo el estado de la cache KV y el overhead del runtime.
- El repo pesa 1,9 GB en disco, un tamano superior al de los pesos cuantizados por los ficheros de configuracion y tokenizer.
- El formato es MLX, por lo que la ejecucion nativa requiere un Mac con Apple Silicon (familias M1, M2, M3 o M4) y memoria unificada; cabe sin problemas en configuraciones de 8 GB o superiores.
- No hay soporte CUDA en este repositorio concreto. Para GPU NVIDIA o AMD hay que recurrir al GGUF upstream (tobil/qmd-query-expansion-1.7B-gguf) con llama.cpp u Ollama.
- Opciones de despliegue: mlx_lm en macOS (ruta documentada en la model card), llama.cpp, Ollama o servidores compatibles con GGUF a partir del modelo upstream. vLLM y TGI no estan documentados para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. El ejemplo de la model card fija max_tokens en 400, lo que da una idea del orden de magnitud de la salida esperada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| after2400/qmd-query-expansion-1.7B-mlx-4bit | 1,72 mil millones | safetensors MLX 4-bit (group 64) | no disponible | MIT | Conversion MLX de la tarea de expansion; requiere Apple Silicon |
| tobil/qmd-query-expansion-1.7B-gguf | 1,72 mil millones | GGUF (incluye f16) | no disponible | MIT | Modelo upstream del ajuste fino; funciona en llama.cpp y Ollama |
| Qwen/Qwen3-1.7B | 1,72 mil millones | safetensors | no disponible en la informacion proporcionada | Apache-2.0 | Modelo base sin ajustar; proposito general, no especializado en expansion de consultas |
| tobil/qmd-query-expansion-1.7B | 1,72 mil millones | safetensors | no disponible | MIT | Merge defectuoso segun la model card de esta ficha: corresponde mayoritariamente al modelo base sin entrenar y no produce el formato de salida esperado |

## Limitaciones y advertencias

- Es un modelo de tarea unica. Fuera de la expansion de consultas con el formato hyde, lex y vec, su comportamiento no esta documentado ni evaluado, y la model card no recomienda usarlo como asistente general.
- El pasaje hipotetico de la linea "hyde" es texto generado: puede contener afirmaciones plausibles pero falsas. Si se usa para recuperar documentos, conviene validar los resultados con las otras dos vias de busqueda.
- La cuantizacion a 4 bits introduce una perdida de precision frente al f16 del GGUF upstream. No se ha publicado ninguna evaluacion comparativa entre ambas versiones.
- No hay datos sobre idiomas soportados. Tanto el prompt de ejemplo como las salidas esperadas estan en ingles, por lo que el rendimiento en castellano es una incognita.
- No hay benchmarks publicados, ni evaluacion de calidad de la expansion, ni comparacion con alternativas como reescritura con un modelo mayor.
- El repositorio tiene cero descargas y cero valoraciones, por lo que no existe validacion independiente por parte de la comunidad.
- Advertencia de procedencia importante: las revisiones anteriores del repositorio contenian una conversion del fichero model.safetensors de tobil/qmd-query-expansion-1.7B, que segun la propia model card es un merge roto (mayoritariamente el modelo base sin entrenar) y no produce el formato de tres lineas. Hay que usar la revision actual.
- Restricciones de licencia: el modelo se distribuye bajo MIT, pero el modelo base Qwen/Qwen3-1.7B es Apache-2.0. Al redistribuir o modificar conviene conservar ambas atribuciones.
- Dependencia de plataforma: este formato concreto solo se ejecuta con MLX en Apple Silicon. En produccion sobre Linux con GPU hay que desplegar el GGUF upstream.
- Las fechas de creacion y actualizacion del repositorio (24 y 30 de septiembre de 2026) resultan incoherentes con el resto de la informacion disponible; conviene verificar la metadata antes de fijar una revision en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/after2400/qmd-query-expansion-1.7B-mlx-4bit
- Modelo upstream en GGUF: https://huggingface.co/tobil/qmd-query-expansion-1.7B-gguf
- Modelo upstream en safetensors (merge defectuoso segun la model card): https://huggingface.co/tobil/qmd-query-expansion-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de qmd: https://github.com/tobi/qmd
- Repositorio de pyqmd, port a Python y MLX: https://github.com/after2400/pyqmd
- Busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo, unicamente paginas de ayuda de YouTube sin relacion con el contenido de la ficha.
