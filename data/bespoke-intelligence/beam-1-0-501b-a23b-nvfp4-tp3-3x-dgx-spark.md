# Bespoke-Intelligence/Beam-1.0-501B-A23B-NVFP4-TP3-3x-DGX-Spark

## Resumen

Beam-1.0-501B-A23B-NVFP4-TP3-3x-DGX-Spark es una redistribucion no oficial del modelo Reflection Beam-1.0-501B-A23B-NVFP4, publicada por Bespoke-Intelligence. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 526.623.491.064 parametros totales y 23.000 millones de parametros activos por token (segun el sufijo A23B del nombre), cuantizado en NVFP4 y modificado mediante relleno de ceros para que vLLM pueda repartirlo de forma exacta entre tres GPUs con tensor parallelism 3.

El objetivo del autor no es mejorar el modelo base, sino hacerlo desplegable en un cluster de tres nodos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada uno) interconectados en anillo con cables QSFP. Para ello se anaden ceros en las dimensiones de atencion y de las capas feed-forward densas y de expertos, de modo que todas las divisiones por 3 sean exactas, sin alterar ningun valor original de los pesos. El repositorio incluye scripts de lanzamiento, un verificador de checksums y una prueba de equivalencia frente al modelo original.

Es relevante ahora porque demuestra que un modelo MoE de 501B cuantizado a 4 bits puede servirse en hardware de escritorio de gama alta (tres DGX Spark) con una ventana de contexto de 131.072 tokens, una piscina de KV cache de 524.552 tokens y un rendimiento de unos 18 tokens/s por peticion. La version v2 del recetario de servicio anade mejoras notables de latencia en cargas con prompts largos, como reducir de 51,2 s a 0,5 s la respuesta a una nueva pregunta sobre un documento de 100K tokens ya cacheado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 49 capas con 256 expertos, cuantizacion NVFP4 con escalas de bloque FP8 |
| Parametros totales | 526.623.491.064 |
| Parametros activos | 23.000 millones (aproximado, segun el sufijo A23B del nombre) |
| Longitud de contexto | 131.072 tokens (262.144 tokens tambien funciona con los ajustes de la v2) |
| Tipos de cuantizacion | NVFP4 (4 bits) con escalas FP8 por bloque; el repositorio se etiqueta como 8-bit por el almacenamiento de escalas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (53 shards, unos 309 GB) |
| Modelo base | reflection/Beam-1.0-501B-A23B (revision 3bd1dccf13c8f7aa3d6732c5aaa48ba107a2c086 del repositorio NVFP4) |
| Cabezas de atencion (query / key-value) | 54 / 9 (original: 48 / 8; rellenadas con ceros) |
| Ancho feed-forward denso (capas 0-2) | 20.736 (original: 20.480) |
| Ancho feed-forward por experto | 2.688 (original: 2.560) |
| Vocabulario | 151.936 (sin cambios; padding de vLLM ajustado a 192) |
| Libreria de inferencia | vLLM con tensor parallelism 3 |
| Hardware objetivo | 3 x NVIDIA DGX Spark (GB10, 128 GB de memoria unificada por nodo) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture-of-Experts con 49 capas de expertos y 256 expertos por capa, mas tres capas iniciales con feed-forward denso. La atencion usa 54 cabezas de query y 9 cabezas key-value (originalmente 48 y 8), lo que implica grouped-query attention con una relacion de 6:1. Los pesos de los expertos estan cuantizados en NVFP4 con escalas de bloque en FP8, y la compuerta de salida de atencion con su sesgo por cabeza tambien fue rellenada para mantener la coherencia dimensional.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base en la documentacion proporcionada: no se detalla el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo que si esta documentado es el proceso de modificacion: se anadieron ceros para que las dimensiones de cabezas de atencion (54/3 = 18), el ancho feed-forward denso (20.736/3 = 6.912) y el ancho por experto (2.688/3 = 896) fueran divisibles por 3, permitiendo a vLLM repartir el modelo en tres rangos de tensor parallelism sin desbalance. Solo se modificaron cuatro campos de `config.json` y ningun valor original de los pesos fue alterado.

La validacion incluyo comparacion a nivel de byte de los 151.262 tensores frente al modelo fuente, verificacion de los 63 archivos originales contra los hashes del Hub y una prueba de equivalencia documentada en el repositorio de GitHub. El archivo `PADDING_MANIFEST.json` registra la version del padder, sus argumentos, el SHA-256 de cada shard y los cambios de configuracion. La receta v2 de servicio anade ademas una funcion de motor parcheada en el nodo que sirve la API para evitar que un prompt largo bloquee peticiones nuevas.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de razonamiento multi-turno.
- Procesamiento de contextos largos de hasta 131.072 tokens, con una piscina de KV cache de 524.552 tokens que permite mantener cuatro peticiones completas de 131K en memoria.
- Razonamiento sobre documentos extensos: la v2 mantiene el documento en cache tras una respuesta larga mediante checkpoints de ventana deslizante, reduciendo a 0,5 s una nueva pregunta sobre un documento de 100K tokens ya procesado.
- Servicio concurrente: con los ajustes v2, las peticiones que ya estan escribiendo mantienen 3,97 tokens/s cada una mientras se lee un prompt de 100K tokens, frente a 1,08 tokens/s en la v1.
- Uso como agente privado en entornos legales: el autor lo ha probado como agente legal privado sobre el Legal Agent Benchmark de Harvey.
- Capacidades de tool calling y function calling: no disponibles en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es exclusivamente text-generation.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Agente legal privado: el autor documenta el uso del modelo como agente legal privado sobre el Legal Agent Benchmark de Harvey, aprovechando el despliegue on-premise en tres DGX Spark para mantener la confidencialidad de los documentos. La ventana de 131K tokens permite introducir expedientes completos sin fragmentacion.
- Analisis de contratos y documentacion extensa: con la piscina de KV cache de 524.552 tokens y los checkpoints de ventana deslizante de la v2, un mismo despacho puede mantener varios contratos largos en memoria y hacer preguntas de seguimiento con latencias de menos de un segundo.
- Asistencia conversacional de contexto largo: el modelo sostiene dialogos multi-turno sobre documentos de mas de 100K tokens, con un rendimiento estable de unos 18 tokens/s por peticion independientemente de la longitud del contexto.
- Procesamiento por lotes de resumenes y extraccion de informacion: con cuatro peticiones cortas concurrentes el cluster alcanza unos 32 tokens/s agregados, adecuado para tareas de extraccion estructurada sobre corpus de documentos.
- Despliegue en entornos con requisitos de soberania del dato: al ejecutarse en tres nodos DGX Spark locales sin dependencia de la nube, encaja en organizaciones que no pueden enviar datos a APIs externas, como administraciones publicas o departamentos juridicos.
- Investigacion sobre cuantizacion y serving distribuido: el repositorio sirve como referencia reproducible para estudiar tensor parallelism no potencia de dos, relleno de dimensiones en modelos MoE y optimizacion de KV cache en vLLM.
- Prototipado de agentes multi-paso: la combinacion de contexto largo y serving concurrente permite encadenar pasos de razonamiento sobre un mismo estado de conversacion sin recargar el prompt completo en cada turno.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de serving realizadas por el autor en su cluster de tres DGX Spark, no benchmarks academicos de calidad del modelo.

| Metrica | v1 | v2 |
|---|---|---|
| Piscina de KV cache | aprox. 180.000 tokens (1,4 peticiones de 131K) | 524.552 tokens (4 peticiones de 131K); tambien funciona contexto de 262.144 |
| Nueva pregunta sobre documento de 100K tokens ya visto | 51,2 s (relectura completa) | 0,5 s |
| Pregunta de una linea tras un prompt de 100K tokens | 49,4 s | 4,6 s |
| Throughput de peticiones en escritura durante lectura de prompt de 100K | 1,08 tokens/s cada una | 3,97 tokens/s cada una |
| Arranque y parada | tres terminales; reinicio tras parar | un comando cada uno; parada ordenada sin reinicio |

| Metrica de serving | Valor |
|---|---|
| Velocidad con una peticion | aprox. 18 tokens/s a cualquier longitud de contexto |
| Velocidad con 4 peticiones cortas concurrentes | aprox. 32 tokens/s en total |
| Tiempo de arranque | 17-18 minutos (7 lanzamientos cronometrados) |
| Tamano del checkpoint | aprox. 309 GB en 53 shards |
| Memoria por nodo | copia completa del checkpoint y aprox. 103 GB en memoria |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo requiere tres nodos con 128 GB de memoria unificada cada uno; cada nodo necesita la copia completa del checkpoint (unos 309 GB en disco) y aproximadamente 103 GB de ella en memoria. No cabe en una sola GPU convencional.
- GPUs recomendadas: exclusivamente NVIDIA DGX Spark (GB10) en configuracion de tres nodos, segun el diseno del autor. No se documenta compatibilidad con A100, H100 ni RTX 4090.
- GPU de consumo: no es viable en ninguna GPU de consumo individual por el tamano total del modelo y la necesidad de tensor parallelism 3.
- Opciones de despliegue: vLLM con tensor parallelism 3, una imagen de serving construida desde el `Dockerfile` del repositorio y una imagen de scheduler adicional en el nodo 0. Los scripts `start_all_v1_0_1.sh`, `launch_node_v0_2_1.sh`, `smoke_test_v0_1_1.sh` y `stop_all_v1_0_1.sh` automatizan el ciclo de vida.
- Red: anillo sin switch de tres cables QSFP entre los tres nodos.
- Latencia y throughput: aproximadamente 18 tokens/s por peticion a cualquier contexto y unos 32 tokens/s agregados con cuatro peticiones cortas; arranque de 17-18 minutos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| Beam-1.0-501B-A23B-NVFP4-TP3-3x-DGX-Spark | 526,6B | 23B (aprox.) | 131.072 (262.144 con v2) | Apache-2.0 | vLLM, TP3 en 3 x DGX Spark |
| reflection/Beam-1.0-501B-A23B-NVFP4 (base) | 501B (segun nombre) | 23B (aprox.) | no disponible | Apache-2.0 | vLLM; requiere reparto divisible entre GPUs |
| reflection/Beam-1.0-501B-A23B (original sin cuantizar) | 501B (segun nombre) | 23B (aprox.) | no disponible | no disponible | no disponible |

La comparativa se limita al linaje del propio modelo, ya que la informacion proporcionada no incluye datos de rendimiento de alternativas de la misma categoria. No se dispone de benchmarks de calidad que permitan comparar con otros modelos MoE de tamano similar.

## Limitaciones y advertencias

- Es una redistribucion no oficial: no esta afiliada ni respaldada por Reflection AI ni por NVIDIA, y el autor lo indica explicitamente en la model card.
- Solo soporta ingles segun la etiqueta de idioma; no se documentan capacidades multilingues.
- No se han publicado benchmarks de calidad del modelo (razonamiento, codigo, matematicas); el rendimiento medido es exclusivamente de serving.
- El despliegue esta atado a una configuracion de hardware muy concreta: tres DGX Spark en anillo QSFP y una imagen de vLLM parcheada. Cualquier cambio de topologia o de version de vLLM puede romper la receta.
- La v2 requiere parchear una funcion del motor en el nodo que sirve la API, lo que anade riesgo operativo y de mantenimiento frente a una imagen estandar.
- El relleno de dimensiones anade ceros a los pesos; aunque el autor documenta equivalencia a nivel de byte y una prueba formal, cualquier consumidor debe verificar los checksums publicados (`9f57e87b492a27c3fa3cea11b0e45e1f4784069a35ee05ea2b3e0f1c100cd5dd` para `SHA256SUMS`) antes de usar el checkpoint.
- El arranque tarda 17-18 minutos y cada nodo necesita unos 309 GB de disco para el checkpoint completo.
- Riesgo de alucinacion y sesgos: no disponibles en la informacion proporcionada; deben evaluarse sobre el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero al ser una modificacion conviene conservar el aviso `NOTICE` y la atribucion al modelo base.
- El numero de descargas (81) y de likes (2) es bajo, lo que sugiere poca validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bespoke-Intelligence/Beam-1.0-501B-A23B-NVFP4-TP3-3x-DGX-Spark
- Repositorio con instrucciones, padder, prueba de equivalencia y scripts: https://github.com/Bespoke-Legal-Intelligence/Beam-1.0-501B-A23B-NVFP4-TP3-3x-DGX-Spark
- Modelo base cuantizado: https://huggingface.co/reflection/Beam-1.0-501B-A23B-NVFP4
- Modelo base sin cuantizar: https://huggingface.co/reflection/Beam-1.0-501B-A23B
