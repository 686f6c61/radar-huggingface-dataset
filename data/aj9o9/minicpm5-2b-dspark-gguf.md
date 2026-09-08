# aj9o9/MiniCPM5-2B-DSpark-GGUF

## Resumen

El modelo `aj9o9/MiniCPM5-2B-DSpark-GGUF` es una conversión a formato GGUF del modelo draft `openbmb/MiniCPM5-2B-DSpark`, creada por el usuario aj9o9 para su uso en llama.cpp. No es un modelo de chat autónomo, sino un modelo auxiliar diseñado para decodificación especulativa: se empareja con el modelo objetivo `MiniCPM5-2B` para acelerar la generación de texto. La arquitectura del draft es DFlash con cabeza Markov (denominada `dflash` en el GGUF), compuesta por aproximadamente 324 millones de parámetros y 5 capas, con un tamaño de bloque de 7 tokens.

El modelo se distribuye en dos cuantizaciones: F16 (~623 MB) y Q8_0 (~334 MB), ambas con licencia Apache 2.0. El tokenizer procede del modelo objetivo MiniCPM5-2B, con un vocabulario de 130.560 tokens. El autor ha publicado mediciones en una RTX 3090 que muestran un aumento de velocidad de generación de hasta 1,66× en comparación con la ejecución sin draft, aunque el rendimiento depende de la longitud del contexto y de la calidad del draft.

La relevancia de este modelo radica en que ofrece una vía para acelerar la inferencia de MiniCPM5-2B en entornos locales y de servidor sin necesidad de hardware adicional, aprovechando la decodificación especulativa nativa de llama.cpp. Sin embargo, es importante tener en cuenta que el draft fue entrenado con una secuencia máxima de 12.288 tokens, por lo que su eficacia se reduce en contextos largos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash + Markov head (draft para decodificación especulativa) |
| Parametros totales | 323.776.001 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (draft entrenado con max seq 12.288) |
| Tipos de cuantizacion | F16, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original es safetensors BF16) |

## Arquitectura y entrenamiento

El draft `MiniCPM5-2B-DSpark` es un modelo pequeño de 5 capas y ~324 millones de parámetros, diseñado para predecir los siguientes tokens del modelo objetivo `MiniCPM5-2B` y así reducir el número de pasos de decodificación. En el GGUF, la arquitectura se identifica como `dflash`, que corresponde a DFlash más una cabeza Markov. El config.json original del draft declara la arquitectura `Qwen3DSparkModel`, aunque el modelo objetivo es un `LlamaForCausalLM`; llama.cpp se encarga de mapear esta diferencia.

El draft fue entrenado por OpenBMB para emparejarse exactamente con MiniCPM5-2B, utilizando las capas ocultas `[1, 10, 20, 30, 39]` del modelo objetivo (almacenadas en el GGUF como `[2, 11, 21, 31, 40]`). El tokenizer se toma del modelo objetivo, con un tamaño de vocabulario de 130.560. Según la documentación del autor, el draft se entrenó con una secuencia máxima de 12.288 tokens. No se han publicado detalles sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO.

## Capacidades

- Aceleración de la decodificación especulativa: el draft predice hasta 7 tokens (tamaño de bloque) por paso, lo que permite al modelo objetivo validarlos y aceptarlos en lote.
- Compatibilidad con llama.cpp: requiere una versión reciente que soporte `--spec-type draft-dspark` y `--spec-draft-n-max 7`.
- Accept length medido: ~5,5 tokens a temperatura 0 y ~4,1 a temperatura 1,0 en prompts in-distribution.
- No es un modelo de chat autónomo: no puede usarse solo para generar texto.
- No se dispone de soporte de tool calling, visión, audio ni razonamiento multi-paso; estas capacidades dependen del modelo objetivo.

## Casos de uso

- Despliegue de asistentes conversacionales locales: al emparejar el draft con MiniCPM5-2B en llama.cpp, se puede alcanzar hasta 181,78 tokens/s en una RTX 3090 con contexto de 8K, lo que permite respuestas casi instantáneas en aplicaciones de chat en tiempo real.
- Servidores de inferencia con llama.cpp: usando `llama-server` con los flags `-md` y `--spec-type draft-dspark`, se puede servir el modelo objetivo con mayor throughput sin necesidad de cambiar el hardware, ideal para entornos de producción con alta carga.
- Reducción de costes en despliegue: la variante Q8_0 del draft añade solo ~334 MB de VRAM, lo que permite mantener el consumo total por debajo de 9 GB y desplegar el sistema en GPUs de 12 GB como la RTX 4070 Ti.
- Investigación en decodificación especulativa: el modelo permite estudiar el impacto del accept length en diferentes profundidades de contexto (8K, 16K, 32K, 64K) y comparar con otros métodos de aceleración.
- Generación de texto en aplicaciones de borde: en dispositivos con GPU modesta, el draft Q8_0 puede acelerar la generación de respuestas largas sin comprometer la calidad del modelo objetivo.
- Automatización de pruebas de rendimiento: los datos de llama-benchy publicados por el autor sirven como referencia para validar configuraciones de llama.cpp en distintos hardware.

## Benchmarks y rendimiento

Los siguientes datos fueron medidos por el autor del modelo en una RTX 3090 de 24 GB, con llama.cpp en su rama master, usando el modelo objetivo `MiniCPM5-2B-F16.gguf`, KV cache en Q8_0 y el draft en F16. Las pruebas se realizaron con `llama-benchy`, con prefijo de 2048 tokens (pp2048) y generación de 256 tokens (tg256) a distintas profundidades de contexto.

| Prueba | Baseline (t/s) | Con DSpark (t/s) | Speedup |
|---|---|---|---|
| tg256 @ d8192 | 109,54 | 181,78 | ~1,66× |
| tg256 @ d16384 | 90,62 | 134,47 | ~1,48× |
| tg256 @ d32766 | 70,18 | 85,03 | ~1,21× |
| tg256 @ d65536 | 46,22 | 69,96 | ~1,51× |

El procesamiento de prefijo (pp2048) es ligeramente más lento con el draft cargado: 7.751,67 t/s frente a 8.383,10 t/s en d8192. El tiempo hasta el primer token (ttfr) también aumenta de 1.221,89 ms a 1.321,36 ms. El consumo de VRAM pasó de 8.317 MB en baseline a 10,1 GB con el draft F16. El autor también reporta un accept length agregado de ~5,5 a temperatura 0 y ~4,1 a temperatura 1,0 en prompts in-distribution, que se reduce a ~1,6 en contextos de 32K o 64K.

## Requisitos de hardware

- VRAM estimada: 8.317 MB para el modelo objetivo sin draft; 10,1 GB con el draft F16; no medido para el draft Q8_0, que añade ~334 MB al consumo base.
- GPU recomendadas: RTX 3090 24 GB (usada por el autor), o cualquier GPU con al menos 10 GB de VRAM para la configuración F16.
- Compatibilidad con GPU de consumo: sí, en GPUs de 12 GB como RTX 4070 Ti o 16 GB como RTX 4080, especialmente con el draft Q8_0.
- Opciones de despliegue: llama.cpp (llama-server, llama-benchy). No se menciona soporte para vLLM, Ollama ni TGI.
- Latencia y throughput: en la prueba de 8K, el ttfr con draft es ligeramente mayor (1.321 ms vs 1.221 ms), pero el throughput de generación mejora de 109,54 a 181,78 tokens/s.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría, ya que este es un draft model específico para MiniCPM5-2B. La alternativa más cercana es el modelo original `openbmb/MiniCPM5-2B-DSpark` en formato safetensors BF16, del cual este GGUF es una conversión. No existen otros draft models públicos para este modelo objetivo.

## Limitaciones y advertencias

- El modelo no es funcional por sí solo: debe emparejarse con un GGUF del modelo objetivo MiniCPM5-2B. Ejecutarlo de forma independiente producirá resultados incorrectos o fallos.
- El accept length se degrada significativamente en contextos largos (32K o más), ya que el draft fue entrenado con una secuencia máxima de 12.288 tokens. El speedup en esos rangos es menor (~1,21× a 32K).
- Los benchmarks publicados son mediciones del autor en una RTX 3090 con llama.cpp master; los resultados pueden variar en otros entornos.
- No hay información disponible sobre sesgos, riesgos de alucinación o idiomas soportados, ya que se trata de un modelo auxiliar y no de un modelo de chat.
- La cuantización Q8_0 del draft puede introducir una ligera pérdida de precisión en las predicciones, lo que podría reducir el accept length en comparación con la versión F16.
- Se requiere una versión reciente de llama.cpp que soporte `--spec-type draft-dspark`; versiones antiguas no reconocerán el archivo.

## Enlaces

- Repositorio del modelo GGUF: https://huggingface.co/aj9o9/MiniCPM5-2B-DSpark-GGUF
- Modelo original DSpark (BF16): https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Modelo objetivo MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- GGUF oficial del modelo objetivo: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Runtime llama.cpp: https://github.com/ggml-org/llama.cpp
- Contacto del autor: https://x.com/ItsmeAjayKV
