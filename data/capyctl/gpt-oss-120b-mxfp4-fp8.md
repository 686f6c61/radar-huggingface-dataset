# capyctl/gpt-oss-120b-MXFP4-FP8

## Resumen

capyctl/gpt-oss-120b-MXFP4-FP8 es una cuantizacion derivada del modelo abierto gpt-oss-120b de OpenAI, publicada por el usuario capyctl bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos que conserva la arquitectura y el tokenizador del original y modifica unicamente el formato numerico de determinados tensores para reducir el ancho de banda de lectura durante la inferencia. El repositorio ocupa 64,3 GB y declara 59.498.263.872 parametros en safetensors.

El cambio principal afecta a las 144 matrices de atencion Q/K/V/O, que pasan a FP8 E4M3 con una escala multiplicativa FP32 por canal de salida, mientras que los expertos MXFP4, las escalas E8M0 y los sesgos de experto se preservan en un layout Quark reversible por experto. El resto de componentes (cabeza de salida BF16, embeddings, routers, normas, sinks y otros sesgos) queda intacto. No hay calibracion ni fine-tuning: es una conversion puramente numerica.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica concreta de cuantizacion mixta (FP8 denso + MXFP4 en expertos) aplicada a un modelo MoE de gran tamano. Por otro lado, el autor publica mediciones de rendimiento y calidad comparadas con el checkpoint original de OpenAI, lo que permite evaluar el coste real de la conversion en terminos de velocidad y de degradacion en tareas de recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gpt_oss), segun modelo base openai/gpt-oss-120b |
| Parametros totales | 59.498.263.872 (safetensors) |
| Parametros activos | no disponible en la informacion proporcionada |
| Longitud de contexto | 131.072 tokens (receta de despliegue probada) |
| Tipos de cuantizacion | MXFP4 en expertos (E8M0 scales), FP8 E4M3 en matrices de atencion Q/K/V/O, BF16 en cabeza, embeddings, routers y normas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout Quark por experto), libreria vLLM |

## Arquitectura y entrenamiento

El modelo base es gpt-oss-120b de OpenAI, un transformer con mezcla de expertos (MoE) cuyos expertos ya venian cuantizados en MXFP4 en el checkpoint original. Esta derivacion no reentrena ni ajusta el modelo: mantiene la arquitectura, el tokenizador y el template Harmony originales. La intervencion consiste en reempaquetar los expertos MXFP4 en un layout Quark reversible por experto (preservando pesos, escalas E8M0 y sesgos) y en convertir las 144 matrices de atencion Q/K/V/O a FP8 E4M3 con una escala FP32 por canal de salida.

El procedimiento de cuantizacion de atencion es determinista: la escala se calcula como `max(abs(weight))/448`, se clampea a un valor positivo FP32 minimo, los pesos se dividen por la escala, se clampean a [-448, 448] y se castean a E4M3. El autor reporta una auditoria exhaustiva en CPU sobre 687 tensores de origen y 28.263 tensores de salida: los 216 tensores de experto (peso, escala y sesgo empaquetados) se reconstruyen de forma byte-identica, los tensores retenidos quedan sin cambios y los bytes y escalas de atencion cumplen la regla de conversion. El payload total de tensores es de 64.294.452.864 bytes.

La innovacion tecnica declarada es la reduccion del ancho de banda de lectura de pesos seleccionados por token, que pasa de 5.003 a 4.049 GB/token (de 5.002.907.904 a 4.048.545.024 bytes/token), un 19,076% menos. Esta cifra es una estimacion derivada de formas, no una medida de ancho de banda real ni una prediccion de velocidad. No se documenta uso de RLHF, DPO ni datos de entrenamiento adicionales, porque no los hay: es una conversion de pesos.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base gpt-oss-120b.
- Razonamiento con niveles de esfuerzo configurables (el autor menciona "low reasoning effort" en sus pruebas de generacion greedy).
- Tool calling y function calling, mediante los parsers de herramientas de OpenAI GPT-OSS y el template Harmony.
- Razonamiento multi-paso y uso como agente, sujeto a las capacidades del modelo base.
- Generacion de codigo, evaluada con HumanEval en la model card.
- Razonamiento matematico, evaluado con GSM8K en la model card.
- Recuperacion y copia literal sobre documentos largos, evaluada con pruebas especificas a 111k tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada (los tags de Hugging Face no listan idiomas).
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia de alto rendimiento en vLLM: el modelo esta empaquetado para vLLM 0.32.0 con lineales densos Quark FP8 y expertos Marlin MXFP4, lo que permite desplegarlo con la receta probada por el autor (contexto 131.072, ocho secuencias, pool KV FP8 E4M3 de 8 GiB). Es adecuado cuando se busca reducir lecturas de pesos por token en un MoE grande sin cambiar el modelo base.
- Atencion al cliente multi-turno con contexto largo: la ventana de 131.072 tokens permite mantener historiales extensos y documentos de referencia en la misma sesion, con decodificacion sostenida de unos 31,7 tokens/s a 110k tokens de contexto en la configuracion medida.
- Generacion de codigo en pipelines: la evaluacion HumanEval (157/164 en ambos checkpoints) y el soporte de tool calling permiten integrarlo en flujos de asistencia a programacion y automatizacion de tareas de desarrollo.
- Razonamiento matematico asistido: la puntuacion GSM8K (239/250) respalda su uso en resolucion de problemas aritmeticos y de varios pasos, siempre con verificacion posterior.
- Recuperacion sobre documentos largos: las pruebas de retrieval a 111k tokens muestran 47/48 observaciones y 143/144 codigos correctos, con una regresion conocida en una de seis peticiones de una linea a 111k. Util para resumen y extraccion sobre corpus extensos, asumiendo esa limitacion.
- Agentes con herramientas: el uso de los parsers de herramientas de OpenAI y del template Harmony facilita la integracion en orquestadores de agentes que ya soporten gpt-oss.
- Despliegue en entornos con memoria unificada limitada: la receta con `expandable_segments:True` y carga lazy de safetensors alcanzo readiness en 480,64 segundos con un minimo de MemAvailable de 39.686.987.776 bytes, frente a 529,67 segundos y 25.940.623.360 bytes del checkpoint original en la misma configuracion.

## Benchmarks y rendimiento

Rendimiento medido por el autor (tokens/s; c1 es decodificacion tras el primer token, c2/c4/c8 son agregados; las columnas largas son decodificacion de un solo flujo tras el primer token):

| Configuracion | c1 corto | c2 | c4 | c8 | 8k | 32k | 64k | 110k |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| CapyCTL, vLLM 0.32 | 45,345 | 66,911 | 88,191 | 112,054 | 43,848 | 40,259 | 35,882 | 31,735 |
| OpenAI, vLLM 0.32 | 34,796 | 57,685 | 79,736 | 104,849 | 33,874 | 31,721 | 29,242 | 26,123 |
| OpenAI publicado, vLLM 0.30 | 34,591 | 58,534 | 80,504 | 105,733 | 33,153 | 29,393 | 25,493 | 21,472 |

Las filas de vLLM 0.32 usan expandable segments, carga lazy, contexto 131.072, ocho secuencias, pool KV FP8 E4M3 de 8 GiB, expertos Marlin, sin drafter, sin prefix caching y LMCache desactivado. Las ganancias declaradas son 30,3% en c1 corto, 6,9% en agregado c8 y 21,5% en decodificacion a 110k. El barrido de 28 celdas de longitud y concurrencia esta en `bench/final-matrix.json`; todas las celdas agregadas emparejadas del candidato son superiores, entre un 5,3% y un 29,6%. Son observaciones finitas, no cotas de incertidumbre.

Calidad comparada (ambos checkpoints, misma configuracion):

| Prueba | CapyCTL | OpenAI |
|---|---:|---:|
| GSM8K | 239/250 | 239/250 |
| Tools | 30/30 | 30/30 |
| HumanEval | 157/164 | 157/164 |
| Retrieval (observaciones) | 47/48 | 48/48 |
| Retrieval (codigos) | 143/144 | 144/144 |
| Copia estricta | 100/100 | 100/100 |

La receta publicada de vLLM 0.30 solo dispone de un cribado de calidad 50/30/50: GSM8K 48/50, tools 30/30 y HumanEval 49/50. El autor advierte que esa fila es una comparacion de configuracion de servicio, no un experimento aislado de version de motor, y que su TTFT en documentos largos incluye aciertos de cache y no debe compararse con prefill sin cache en 0.32.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor no publica una cifra de VRAM dedicada; reporta un minimo de memoria disponible del sistema de 39.686.987.776 bytes durante la ejecucion completa con el checkpoint candidato y un minimo de 41.606.955.008 bytes hasta alcanzar readiness. El repo en disco ocupa 64,3 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. La receta usa expertos Marlin MXFP4 y lineales Quark FP8, lo que requiere soporte de estas rutas en vLLM 0.32.0.
- Cabe en consumer GPU: no disponible. El autor no documenta ejecucion en GPUs de consumo; su receta usa memoria unificada y expandable segments.
- Opciones de despliegue: vLLM 0.32.0 con lineales densos Quark FP8 y expertos Marlin MXFP4; requiere `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`, carga lazy de safetensors y registro del motor con `--approve-env PYTORCH_CUDA_ALLOC_CONF`. No se documentan otras rutas (llama.cpp, Ollama, TGI).
- Latencia y throughput: decodificacion de 45,345 tokens/s en c1 corto y 31,735 tokens/s a 110k tokens de contexto en la configuracion medida. Readiness de 480,64 segundos con carga lazy y expandable segments. La carga eager por fichero y la lazy por defecto fallaron durante la lectura de shards antes de la asignacion de KV, chocando con el guard de 3 GiB de memoria disponible; las minimas retenidas fueron 2.867.150.848 y 1.277.296.640 bytes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| capyctl/gpt-oss-120b-MXFP4-FP8 | 59.498.263.872 | 131.072 (receta probada) | MXFP4 expertos + FP8 atencion, safetensors | Apache-2.0 | Conversion de pesos; +30,3% c1 corto y +21,5% a 110k frente al original en la misma configuracion |
| openai/gpt-oss-120b | no disponible | no disponible | MXFP4 expertos, safetensors | Apache-2.0 | Modelo base; referencia de calidad y velocidad en las tablas del autor |
| Alternativas de mismo tamano o tarea | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos comparables en la informacion disponible |

## Limitaciones y advertencias

- Regresion de recuperacion conocida: 47/48 observaciones y 143/144 codigos frente a 48/48 y 144/144 del original. El fallo se concentra en una de seis peticiones de una linea a 111k tokens (5/6, 17/18 codigos); ambos checkpoints pasan las seis pruebas de documento original a 111k y las 100/100 de copia estricta.
- Las cifras de mejora de velocidad son observaciones finitas en un hardware y configuracion concretos, no cotas de incertidumbre ni una prediccion universal de rendimiento.
- La reduccion de lectura de pesos (19,076%) es una estimacion derivada de formas que excluye trafico de KV y activaciones, padding, reutilizacion y cache; no es ancho de banda medido.
- La receta de vLLM 0.30 publicada por OpenAI tiene prefix caching activado y KV automatico no confirmado como FP8, por lo que su comparacion con 0.32 no aisla la version del motor.
- La ejecucion desde ruta local paso, pero el aprovisionamiento desde el Hub en la revision `628e2ca15177aaea61dfe8cb4fbe1be9737129dc` no se ha ejercitado.
- La carga por defecto y la eager por fichero fallan por fragmentacion del allocator de CUDA; es necesario mantener expandable segments y carga lazy, y no eliminar la variable de entorno solo porque el checkpoint quepa en disco.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base gpt-oss-120b.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplican las advertencias generales de los modelos de lenguaje.
- Idiomas soportados: no disponibles; los tags de Hugging Face no listan idiomas, por lo que no se puede confirmar cobertura multilingue mas alla de la del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero el derivado conserva las obligaciones de atribucion y aviso de la licencia original.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-22; no hay validacion independiente de las mediciones del autor.

## Enlaces

- Hugging Face: https://huggingface.co/capyctl/gpt-oss-120b-MXFP4-FP8
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Revision del modelo base citada: `b5c939de8f754692c1647ca79fbf85e8c1e70f8a`
- Revision de pesos citada: `628e2ca15177aaea61dfe8cb4fbe1be9737129dc`
- Matriz de benchmarks del autor: `bench/final-matrix.json` (referenciada en la model card, no enlazada)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
