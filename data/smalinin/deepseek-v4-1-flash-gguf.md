# smalinin/DeepSeek-V4.1-Flash-GGUF

## Resumen

Este repositorio contiene una distribucion en formato GGUF del modelo DeepSeek-V4.1-Flash, publicada por el usuario smalinin y cuantizada por Victor Cruz (vcruz305). Se trata de un paquete de pesos para llama.cpp, no de un modelo entrenado desde cero: el modelo de referencia es deepseek-ai/DeepSeek-V4.1-Flash, un decoder causal de tipo DeepseekV41ForCausalLM que incorpora tablas de busqueda de n-gramas (engram), hiper-conexiones y atencion dispersa. Los pesos del modelo base suman 748.494.684.784 parametros (unos 748,5 B) y el repositorio ocupa 1670,3 GB en total.

Su relevancia es doble. Por un lado, es una de las primeras conversiones a GGUF de esta arquitectura concreta, con tres escalones de cuantizacion medidos (Q2_K, 246,3 GiB de tensores; Q3_K_M, 323,4 GiB; Q4_K_M pendiente). Por otro, es un caso de uso eminentemente experimental: el propio autor advierte que los ficheros no funcionan todavia en llama.cpp upstream, que la conversion esta abierta como pull request y que el runtime (loader, tablas engram e hiper-conexiones) vive en una rama especifica de un fork, con la atencion dispersa como pieza pendiente.

El dato mas destacable de la receta de cuantizacion es que aproximadamente 196,6 B de parametros corresponden a las dos tablas engram, que dominan el tamano del fichero, y que los expertos enrutados llegan en MXFP4 a 4,25 bits por peso, por lo que los escalones altos (Q5_K_M) se descartan por falta de valor anadido. El modelo se publica bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder causal DeepseekV41ForCausalLM con tablas de busqueda de n-gramas (engram), hiper-conexiones y atencion dispersa; cadena de arquitectura GGUF `deepseek41` |
| Parametros totales | 748.494.684.784 (~748,5 B), dato de los safetensors del modelo base |
| Parametros activos | no disponible (la model card menciona expertos enrutados y "mixture", pero no indica cuantos parametros se activan por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M y Q4_K_M (esta ultima pendiente de publicacion); Q5_K_M descartado por el autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF, dividido en varias partes por el limite de tamano de fichero del Hub |
| Tamano de los ficheros | Q2_K: 264.514.761.248 bytes (246,3 GiB); Q3_K_M: 347.270.954.112 bytes (323,4 GiB) |
| Parametros en tablas engram | ~196,6 B entre las dos tablas (99.611 MiB cada una en q8_0 y 40.284 MiB en q3_K) |
| Cuantizacion de expertos enrutados | MXFP4, 4,25 bits por peso, en los pesos de origen |
| Tamano del repositorio | 1670,3 GB |
| Descargas y likes | 0 descargas y 0 likes en el momento de la consulta |
| Fecha de creacion | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card describe el modelo base como un decoder causal con tres elementos diferenciales: tablas de busqueda de n-gramas (engram), hiper-conexiones y atencion dispersa. Las tablas engram son, con diferencia, el componente mas pesado del fichero: alrededor de 196,6 B de parametros entre las dos, que se cuantizan junto con el resto al bajar de escalon (de 99.611 MiB a 40.284 MiB por tabla entre q8_0 y q3_K). El resto de la mezcla de expertos enrutados ya llega en MXFP4 a 4,25 bits por peso, lo que explica que Q3_K_M se quede en 0,684 del fichero de staging en Q8_0 y que Q5_K_M se considere mal negocio: quedaria demasiado cerca de Q8_0 en tamano sin ganancia proporcional.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco sobre el numero de parametros activos por token ni la longitud de contexto. Lo que si documenta el autor es el estado de la ingenieria de conversion: los ficheros no se cargan en llama.cpp upstream, la conversion esta abierta como pull request en ggml-org/llama.cpp#28696, y el runtime se desarrolla en la rama `runtime/deepseek41` del fork de vcruz305, donde el loader, las tablas engram y las hiper-conexiones ya estan verificados contra la implementacion de referencia y solo falta la atencion dispersa. La cadena de arquitectura sigue la convencion de llama.cpp de eliminar el `_v` (`deepseek_v2` a `deepseek2`, `deepseek_v3.2` a `deepseek32`), de ahi `deepseek41`.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el repositorio incluye la etiqueta `conversational`, pero no hay model card con detalles de capacidades.
- Razonamiento, codigo y matematicas: no hay informacion especifica para esta version en la informacion disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas aparece vacio en la ficha del Hub).
- Capacidades especiales: la arquitectura incorpora tablas engram de busqueda de n-gramas, hiper-conexiones y atencion dispersa, que son innovaciones estructurales, pero no se documenta ningun modo especial de inferencia (thinking mode, vision o audio).
- Compatibilidad de despliegue: pensado para llama.cpp, con la salvedad de que requiere el fork y la rama de runtime indicados, no la version upstream.

## Casos de uso

- Investigacion sobre atencion dispersa y tablas engram: el paquete permite reproducir la implementacion de referencia y validar el loader, las tablas engram y las hiper-conexiones frente a los pesos originales, que es justo lo que el autor afirma haber verificado en su fork.
- Evaluacion del impacto de la cuantizacion en arquitecturas MoE con componentes no-MLP: al publicar escalones Q2_K y Q3_K_M del mismo modelo, permite medir la degradacion atribuible a cuantizar agresivamente las tablas engram (que concentran ~196,6 B de parametros) frente a los expertos enrutados, que ya vienen en MXFP4.
- Desarrollo y prueba del runtime de llama.cpp: sirve como caso de prueba de gran tamano para el pull request ggml-org/llama.cpp#28696 y para la rama `runtime/deepseek41`, incluyendo pruebas de carga dividida en multiples shards.
- Inferencia local en nodos de gran memoria: con 246,3 GiB (Q2_K) o 323,4 GiB (Q3_K_M) de tensores, es viable en servidores con memoria agregada suficiente, por ejemplo configuraciones multi-GPU de 80 GB o nodos con gran cantidad de RAM y offload parcial a GPU mediante llama.cpp.
- Generacion sintetica de datos a gran escala en entornos controlados: un modelo de ~748,5 B en cuantizacion baja puede emplearse para producir corpus etiquetados o respuestas de referencia en lotes, siempre que el coste de memoria del nodo este justificado.
- Analisis de coste de propiedad de modelos frontera en abierto: la tabla de tamanos publicada permite calcular requisitos de almacenamiento y de memoria por escalon antes de comprometer infraestructura, algo util para equipos que evaluan servir un modelo de este orden de magnitud.
- Reproducibilidad de artefactos GGUF: el historial de correcciones (reescritura de las 4 claves KV de Engram el 11 de septiembre de 2026, con verificacion por SHA-256) lo convierte en un ejemplo documentado de mantenimiento de metadatos en ficheros GGUF divididos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y las busquedas web realizadas no devolvieron resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM o memoria agregada estimada para Q2_K: al menos 246,3 GiB solo para tensores, mas overhead de contexto y buffers, por lo que conviene reservar por encima de 250 GB.
- VRAM o memoria agregada estimada para Q3_K_M: al menos 323,4 GiB de tensores, con margen adicional para el runtime.
- Q4_K_M: pendiente de publicacion, por lo que no hay medida disponible; el autor descarta Q5_K_M.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni configuraciones de 2 o 4 GPU de 24-48 GB pueden alojar ningun escalon de esta distribucion.
- GPU de centro de datos: se necesitan nodos con memoria agregada muy alta, como 8xH100 80 GB (640 GB) o 8xH200, o bien esquemas hibridos con offload a RAM del sistema.
- Despliegue: llama.cpp con el fork vcruz305 en la rama `runtime/deepseek41`; upstream no es compatible todavia. No hay confirmacion de soporte en vLLM, TGI, Ollama ni otros servidores.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 1670,3 GB, y cada escalon esta dividido en varias partes por el limite de fichero del Hub.

## Comparativa con modelos similares

La comparativa se limita al propio paquete GGUF y a su modelo base, ya que no se proporcionaron datos de alternativas equivalentes. Los datos de DeepSeek-V3 proceden de informacion publica de ese modelo y no de la informacion proporcionada en esta consulta.

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smalinin/DeepSeek-V4.1-Flash-GGUF (Q2_K, Q3_K_M) | 748,5 B (base) | no disponible | no disponible | Q2_K, Q3_K_M, Q4_K_M pendiente | MIT | Publicado; requiere fork de llama.cpp |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 748.494.684.784 | no disponible | no disponible | no disponible (pesos completos) | MIT segun el paquete GGUF | Publicado en el Hub |
| DeepSeek-V3 (generacion anterior) | 671 B | 37 B | 128.000 tokens | multiples | MIT | Publicado; soporte amplio en llama.cpp y vLLM |

## Limitaciones y advertencias

- Los ficheros no se ejecutan en llama.cpp upstream. Requieren el fork de vcruz305 y la rama `runtime/deepseek41`, y la atencion dispersa sigue sin completarse, por lo que no hay garantia de inferencia correcta.
- El repositorio esta publicado por el usuario smalinin, pero la model card atribuye la cuantizacion a vcruz305. Conviene verificar la cadena de custodia del artefacto antes de usarlo en produccion.
- Conversiones anteriores al 10 de septiembre de 2026 llevan `general.architecture = deepseek4` y estan siendo rehechas como `deepseek41`; mezclar shards de ambas generaciones puede dar lugar a ficheros inconsistentes.
- El 11 de septiembre de 2026 se corrigieron las 4 claves KV de Engram (`head_count`, `key_length`, `max_ngram_size`, `layer_ids`), que estaban escritas con el prefijo fijo `deepseek4.engram.*` en lugar de `deepseek41.engram.*`. Si se descarga una copia anterior a esa fecha, el loader puede no encontrar la configuracion de Engram.
- No hay informacion sobre sesgos, comportamiento multilingue, tasa de alucinacion ni evaluacion de seguridad. Es un riesgo relevante para cualquier uso en produccion.
- La licencia del paquete es MIT, lo que en principio permite uso comercial, pero el autor indica que la licencia procede de upstream (Apache/MIT) sin detallar terminos adicionales del modelo base.
- El coste de hardware es prohibitivo para entornos de consumo: ningun escalon cabe en GPU de 24-48 GB y el Q3_K_M exige mas de 320 GiB de memoria para tensores.
- Con 0 descargas y 0 likes, el artefacto carece de validacion por parte de la comunidad.
- El contexto maximo soportado no esta documentado, por lo que no se puede planificar su uso en tareas de contexto largo.
- La informacion de busqueda web disponible no contiene ningun resultado relacionado con el modelo; los enlaces devueltos corresponden a servicios de firma electronica y no son pertinentes.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/smalinin/DeepSeek-V4.1-Flash-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Receta de compilacion y despliegue del cuantizador: https://github.com/vcruz305/DeepSeek-V4.1-Flash-GGUF-DGX-Spark-recipe
- Pull request de conversion en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/28696
- Fork de llama.cpp con el runtime: https://github.com/vcruz305/llama.cpp (rama `runtime/deepseek41`)
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
