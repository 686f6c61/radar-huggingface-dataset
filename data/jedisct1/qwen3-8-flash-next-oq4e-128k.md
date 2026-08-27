# jedisct1/Qwen3.8-Flash-Next-oQ4e-128k

## Resumen

Qwen3.8-Flash-Next-oQ4e-128k es una cuantizacion dinamica comunitaria del modelo Qwen/Qwen3.8-Flash-Next-FP8, creada por jedisct1 para ejecutarse en Apple Silicon mediante el runtime oMLX. El modelo base es un MoE multimodal de 125.000 millones de parametros con 6.000 millones activos por token, complementado por un banco de n-gramas PLE de 51.000 millones de parametros, basado en la nueva arquitectura Qwen4. Esta conversion elimina el encoder de vision y la cabeza MTP, quedando como un modelo exclusivamente de texto.

La cuantizacion emplea el esquema oQ4e de oMLX con matrices de importancia, asignando precisiones mixtas: 4-bit affine con group size 128 para la mayoria de pesos, 8-bit para atencion y expertos compartidos, y 2-bit/3-bit para los shards del banco PLE. El resultado es un checkpoint de 86,6 GiB en 18 shards safetensors, validado para una ventana de contexto de 131.072 tokens en un Mac con 128 GiB de memoria unificada. No es un lanzamiento oficial de Qwen y requiere una version experimental de oMLX con soporte Qwen4.

La relevancia de este modelo radica en que permite ejecutar localmente un modelo de 125B parametros con razonamiento avanzado y tool calling en hardware Apple, algo que de otra forma seria inviable por requisitos de memoria. Su licencia qwen-community-1.0 permite uso comercial con restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4 (GDN + QSA hibrida, MoE) |
| Parametros totales | 26.023.138.355 (checkpoint cuantizado); modelo base: 125B + 51B PLE |
| Parametros activos | 6B por token (modelo base) |
| Longitud de contexto | 131.072 tokens (validado); arquitectura nativa soporta 262.144 |
| Tipos de cuantizacion | 4-bit affine group-size 128 (default), 8-bit floors en atencion, 2-bit/3-bit en PLE, BF16 en control |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (18 shards), MLX |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next-FP8 emplea la arquitectura Qwen4, que introduce una atencion hibrida GDN (Gated Delta Network) y QSA (Quadratic Self-Attention), junto con mejoras en residuales, embeddings y optimizacion. Es un MoE con 125B parametros totales y 6B activos por token, complementado por un banco de n-gramas PLE de 51B parametros que se mantiene en shards separados. Esta conversion no implica entrenamiento adicional: es una cuantizacion post-entrenamiento realizada con oMLX, utilizando una matriz de importancia recopilada de 1.024 muestras multilingues con uso intensivo de tool calling a longitud de secuencia 512.

La cuantizacion asigna precision por familia de tensores: embeddings y cabeza de lenguaje en 4-bit affine, pesos lineales grandes y expertos enrutados con precision mixta guiada por importancia, matrices de atencion y expertos compartidos con pisos de 8-bit, y tensores de control (routers, estado recurrente, convoluciones, normalizacion) en BF16. El banco PLE se divide en 128 shards: los shards 0-3 usan 2-bit affine group-size 32, y los shards 4-127 usan 3-bit affine group-size 32. Se eliminan el encoder de vision y la cabeza MTP, por lo que el modelo es solo texto.

## Capacidades

- Generacion de texto y razonamiento avanzado con modo thinking habilitado por defecto (temperatura 1.0, top_p 0.95, top_k 20).
- Tool calling / function calling mediante protocolo XML incluido en la plantilla de chat, con soporte para llamadas estructuradas, continuacion tras resultado de herramienta y flujos multi-turno.
- Soporte para agentes multi-paso: se recomienda preservar `reasoning_content` entre turnos de herramienta y mantener `preserve_thinking` activado.
- Contexto largo de hasta 131.072 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidades multilingues (idiomas concretos no especificados en la informacion disponible).
- Sin soporte de vision: la conversion elimina el encoder de imagen y video.

## Casos de uso

- Agentes conversacionales con tool calling: el modelo puede gestionar flujos multi-turno donde debe invocar herramientas externas (APIs, bases de datos) y procesar sus resultados, gracias a su protocolo XML de tool calls y su modo thinking. Es adecuado para asistentes que necesitan razonar antes de actuar.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, puede analizar manuales tecnicos, contratos o codebases completos en una sola pasada, extrayendo informacion y respondiendo preguntas sobre el contenido.
- Generacion de codigo asistida: aunque no se especifican benchmarks de codigo, su capacidad de razonamiento y tool calling permite integrarlo en entornos de desarrollo para generar, revisar y depurar codigo, con la posibilidad de ejecutar comandos de verificacion.
- Investigacion y analisis de datos: puede procesar grandes volumenes de texto, resumir articulos cientificos, extraer conclusiones y estructurar resultados, aprovechando su ventana de contexto amplia.
- Asistencia en entornos empresariales: despliegue local en Mac con 128 GiB de RAM para tareas de redaccion, traduccion y analisis de informes, sin depender de servicios en la nube.
- Prototipado de agentes autonomos: su soporte para tool calling y razonamiento multi-paso permite construir pipelines de automatizacion donde el modelo decide que herramientas invocar y como combinar sus resultados, con validacion externa de las acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K u otros tests estandar. La unica validacion reportada es tecnica: 18 shards legibles, 2.854 tensores sin errores, y una prueba de contexto maximo de 131.071 tokens de prompt que genero un token sin fallos en un M5 Max con 128 GiB.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 86,6 GiB en disco; en ejecucion, el modelo SSD-backed PLE cargo 63,30 GB de arrays Metal en un M5 Max con 128 GiB de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (probado en M5 Max con 128 GiB). No es compatible con GPUs NVIDIA o AMD.
- No cabe en GPUs de consumo tipicas (RTX 4090, etc.) por su tamaño y por requerir el runtime MLX.
- Opciones de despliegue: oMLX 0.6.3rc3 con MLX 0.32.1 y mlx-metal 0.32.1, usando el wrapper incluido en `omlx_support/serve`. No es compatible con Transformers, MLX-LM estandar ni vLLM.
- Latencia y throughput: no disponibles. La configuracion permite una peticion concurrente, con cache de prompt en SSD y memory-mapping de los safetensors PLE.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos. Como referencia estructural, el modelo base Qwen3.8-Flash-Next-FP8 (125B MoE, 6B activos, 262K contexto) se puede comparar con:

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8 (base) | 125B + 51B PLE | 6B | 262K | qwen-community-1.0 | HuggingFace |
| Qwen3.8-Flash-Next-oQ4e-128k (esta conversion) | 26B cuantizados | 6B (base) | 131K | qwen-community-1.0 | HuggingFace |
| Qwen3.8-Flash (version original) | no disponible | no disponible | 1M | no disponible | QwenCloud |

La comparativa directa con otras cuantizaciones de Qwen3.8-Flash-Next no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no soporta entradas de imagen ni video, a diferencia del modelo base multimodal.
- MTP (decodificacion especulativa) no soportada en este checkpoint.
- Contexto operativo limitado a 131.072 tokens, aunque la arquitectura nativa soporta 262.144. El presupuesto de contexto incluye entrada y salida, por lo que prompts muy largos reducen el espacio para generacion.
- Solo validado en Apple Silicon con oMLX experimental; no funciona con stacks estandar como Transformers o vLLM.
- La cuantizacion puede degradar la calidad respecto al modelo FP8 original, especialmente en tareas que requieren alta precision numerica.
- Riesgo de alucinacion y generacion de contenido incorrecto, como cualquier modelo de lenguaje.
- Tool calling estocastico: en pruebas sinteticas, 17 de 18 llamadas correctas con PLE residente y 16 de 18 con PLE en SSD; se observaron llamadas duplicadas. Se recomienda validacion externa de las acciones y rechazo de llamadas duplicadas.
- La licencia qwen-community-1.0 tiene restricciones de uso comercial que deben revisarse antes de desplegar en produccion.
- El modelo hereda las limitaciones y consideraciones de uso del modelo upstream Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-oQ4e-128k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Pull request oMLX #3161: https://github.com/jundot/omlx/pull/3161
- Pull request oMLX #3163: https://github.com/jundot/omlx/pull/3163
