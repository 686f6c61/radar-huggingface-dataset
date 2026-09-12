# Solstice-AI/DeepSeek-V4.1-Flash-GGUF

## Resumen

DeepSeek-V4.1-Flash-GGUF es una distribucion de pesos en formato GGUF del modelo deepseek-ai/DeepSeek-V4.1-Flash, empaquetada por el usuario Solstice-AI y cuantizada por vcruz305. Se trata de un decoder causal de aproximadamente 748.494 millones de parametros que incorpora mecanismos poco habituales: tablas de busqueda n-grama (engram), hyper-connections y atencion dispersa (sparse attention). El nombre de arquitectura interno es `deepseek41` (DeepseekV41ForCausalLM), distinto de V4-Flash-0731.

Su relevancia actual es doble. Por un lado, es una de las primeras conversiones a GGUF de un modelo de esta escala y arquitectura; por otro, sus ficheros todavia no funcionan en llama.cpp oficial: la conversion esta abierta como PR ggml-org/llama.cpp#28696, y el runtime solo esta parcialmente implementado en la rama `runtime/deepseek41` de un fork de vcruz305 (loader, tablas engram y hyper-connections verificados; la atencion dispersa sigue pendiente).

El repositorio ocupa 1670,3 GB e incluye escalones de cuantizacion Q2_K, Q3_K_M y Q4_K_M (este ultimo pendiente en la fecha de los datos). La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder causal con tablas de busqueda n-grama (engram), hyper-connections y atencion dispersa; clase `DeepseekV41ForCausalLM`, cadena de arquitectura `deepseek41` |
| Parametros totales | 748.494.684.784 (~748,5 B) |
| Parametros activos | no disponible (el modelo usa expertos enrutados en MXFP4, lo que sugiere un esquema MoE, pero el numero de parametros activos no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M y Q4_K_M (pendiente); Q5_K_M descartado; existe un staging Q8_0 intermedio |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), dividido en multiples shards por superar el limite de tamano por fichero de HuggingFace |

## Arquitectura y entrenamiento

La arquitectura es un decoder causal con tres componentes destacados. El primero son las tablas de busqueda n-grama ("engram"), que entre ambas suman aproximadamente 196,6 B de parametros y constituyen la mayor parte del fichero: segun el escalon de cuantizacion, cada tabla ocupa entre 99.611 y 40.284 MiB (rango de q8_0 a q3_K). El segundo son las hyper-connections, que ya estan implementadas y verificadas contra la implementacion de referencia en el fork de runtime. El tercero es un mecanismo de atencion dispersa (sparse attention), que es la pieza que aun no esta resuelta en el runtime. Los expertos enrutados llegan en formato MXFP4, a 4,25 bits por peso, lo que condiciona la escalera de cuantizacion: Q3_K_M queda en 0,684 del fichero de staging Q8_0, y por eso Q5_K_M se descarta por aportar poco valor.

En cuanto al entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO), no se ha proporcionado informacion en los materiales disponibles. La unica referencia a datos es la indicacion de que los pesos provienen de DeepSeek y que la licencia upstream es Apache/MIT.

## Capacidades

- Generacion de texto y uso conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Razonamiento, codigo, matematicas y vision: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el repositorio no declara idiomas).
- Capacidades especiales (modo thinking, audio, etc.): no disponible. Lo unico reseñable a nivel tecnico es la presencia de tablas engram y atencion dispersa en la arquitectura.
- Estado de ejecucion: los ficheros no funcionan todavia en llama.cpp upstream; requieren el runtime en desarrollo de la rama `runtime/deepseek41`.

## Casos de uso

- Inferencia autoalojada a gran escala: el modelo se sirve en nodos con multiples GPU (DGX, clusters H100) para generacion de texto en produccion, dado que su huella en Q2_K supera los 246 GiB y no cabe en hardware de consumo.
- Investigacion sobre arquitecturas con tablas engram: permite reproducir y estudiar el comportamiento de las lookup tables n-grama, que concentran ~196,6 B de parametros, comparando el efecto de distintos escalones de cuantizacion.
- Experimentos de cuantizacion extrema: los escalones Q2_K y Q3_K_M sirven para medir la degradacion de calidad al reducir a 2-3 bits un modelo con expertos en MXFP4, y para validar la estrategia de no incluir Q5_K_M.
- Desarrollo del runtime llama.cpp: los ficheros actuan como material de prueba para el PR #28696 y para la rama `runtime/deepseek41`, especialmente en la implementacion pendiente de la atencion dispersa.
- Evaluacion comparativa de cuantizaciones: el script de la receta del autor permite reconstruir la escalera y contrastar tamano real de tensores frente a calidad, util en laboratorios de compresion de modelos.
- Generacion de texto conversacional en entornos controlados con licencia MIT: al heredar licencia permisiva, el modelo puede integrarse en productos propietarios siempre que se resuelvan antes las dependencias de runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (carga completa de pesos, sin overhead de KV cache): Q2_K ~246,3 GiB de payload tensorial; Q3_K_M ~323,4 GiB; Q4_K_M pendiente de medicion.
- GPU recomendadas: para Q2_K se necesitan al menos 4x H100 80 GB (320 GB) o 8x A100 40 GB; para Q3_K_M, 5x H100 80 GB (400 GB) o superior. El staging Q8_0 requiere aun mas memoria.
- No cabe en GPU de consumo: ni en RTX 4090 (24 GB) ni en configuraciones multi-GPU de gama consumer convencionales. Se trata de un modelo de clase centro de datos.
- Opciones de despliegue: llama.cpp mediante el fork con la rama `runtime/deepseek41` (el runtime upstream todavia no lo soporta). No hay soporte confirmado en vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponible.
- Nota sobre sharding: los ficheros GGUF estan divididos en partes porque cada uno supera el limite de fichero unico de HuggingFace; la carga requiere soportar GGUF multi-shard.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-GGUF (este) | ~748,5 B | no disponible | GGUF (Q2_K, Q3_K_M, Q4_K_M pendiente) | MIT | Repo propio; runtime en desarrollo |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | ~748,5 B | no disponible | safetensors | MIT/Apache segun upstream | Modelo de referencia |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | Variante distinta, segun el autor |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Estado de ejecucion incompleto: los ficheros no arrancan en llama.cpp upstream. Hasta que se complete la atencion dispersa en la rama `runtime/deepseek41`, no son utilizables en produccion.
- Riesgo de conversion incompleta: la model card indica que los pesos convertidos antes del 2026-09-10 llevan `general.architecture = deepseek4` y estan siendo rehechos como `deepseek41`; usar ficheros antiguos puede provocar fallos de carga.
- Correccion de metadatos: el 2026-09-11 se detectaron 4 claves Engram KV (`head_count`, `key_length`, `max_ngram_size`, `layer_ids`) escritas con el prefijo incorrecto `deepseek4.engram.*`; se corrigieron in situ via reescritura solo de KV. Conviene verificar que la copia descargada incluye el arreglo.
- Coste de hardware muy elevado: incluso la cuantizacion mas pequena ronda los 246 GiB, lo que excluye cualquier despliegue en hardware de consumo o en una unica GPU.
- Riesgo de alucinacion y sesgos: no disponible (no se ha publicado informacion al respecto).
- Limitaciones de contexto e idioma: no disponible.
- Licencia: MIT, permisiva y apta para uso comercial, pero conviene confirmar la cadena de licencias del modelo base upstream antes de explotarlo en producto.
- Trazabilidad: el repositorio registra 0 descargas y 0 likes en los datos disponibles, por lo que no hay validacion comunitaria del empaquetado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Solstice-AI/DeepSeek-V4.1-Flash-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- PR de conversion en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/28696
- Fork de runtime con la rama `runtime/deepseek41`: https://github.com/vcruz305/llama.cpp
- Receta de compilacion y servicio (DGX Spark): https://github.com/vcruz305/DeepSeek-V4.1-Flash-GGUF-DGX-Spark-recipe
