# kingjones777/Granite-4.1-30B-ROCmFP4-GGUF

## Resumen

Granite-4.1-30B-ROCmFP4-GGUF es una cuantización GGUF del modelo denso IBM Granite 4.1 de 30B parámetros, adaptada específicamente al hardware AMD con soporte nativo para los tipos de tensor ROCmFP4 y ROCmFPX. La publica el usuario kingjones777 y constituye la primera conversión de este modelo a dichos formatos, construida directamente a partir de los shards BF16 oficiales de IBM sin reconversión intermedia desde safetensors. El objetivo es permitir ejecutar el modelo a alta velocidad en la APU AMD Strix Halo (gfx1151), como la Ryzen AI MAX+ 395, aprovechando la memoria unificada y el ancho de banda de ~256 GB/s de esa plataforma.

El modelo base, Granite 4.1 30B, es un transformer decoder-only denso de 64 capas, con 28 865 millones de parámetros, contexto nativo de 131 072 tokens y vocabulario de 100 352 entradas. Está entrenado sobre aproximadamente 15 billones de tokens y destaca por sus capacidades de tool calling, generación estructurada JSON, razonamiento matemático y soporte multilingüe. Esta cuantización no modifica las capacidades funcionales del modelo original, pero introduce restricciones importantes de compatibilidad: los ficheros requieren una compilación de llama.cpp con el fork ROCmFPX y no cargan en las versiones estándar de llama.cpp, Ollama o LM Studio.

La relevancia de esta publicación radica en que ofrece una alternativa de despliegue local de un modelo de 30B en hardware AMD de gama alta, con mediciones reales de rendimiento (no estimadas) que alcanzan hasta 13.07 tokens por segundo en decodificación y 292.81 tokens por segundo en prefill para la variante de 4 bits. Además, documenta con detalle el proceso de cuantización y verificación, incluyendo advertencias específicas sobre la ausencia de tensor `output.weight` en el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (64 capas, hidden 4096, FFN 32768, GQA 32/8 cabezas) |
| Parametros totales | 28 865 728 512 (28.87B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT, Q6_0_ROCMFPX_AGENT, Q8_0_ROCMFPX, Q8_0_ROCMFPX_AGENT |
| Idiomas soportados | No disponible (el modelo base soporta multilingue, pero la cuantizacion no especifica lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tipos de tensor ROCmFP4/ROCmFPX propietarios del fork ROCmFPX) |

## Arquitectura y entrenamiento

Esta publicacion no es un modelo entrenado desde cero, sino una cuantizacion del modelo IBM Granite 4.1 30B. El modelo original es un transformer denso con 64 capas, dimension oculta de 4096, FFN de 32768, atencion GQA con 32 cabezas de consulta y 8 cabezas de clave/valor, y un vocabulario de 100 352 tokens. Fue entrenado sobre aproximadamente 15 billones de tokens segun la documentacion de IBM, con extension de contexto hasta 512K tokens en la fase de entrenamiento largo, aunque el contexto nativo publicado es de 131 072 tokens.

La cuantizacion se realizo a partir de los shards BF16 GGUF oficiales de IBM (5 ficheros) utilizando el fork ROCmFPX de llama.cpp, que anade tipos de tensor FP4 y FP8 nativos para AMD. El proceso emplea `llama-quantize` con flags especificos: `--output-tensor-type` es un no-op silencioso en este modelo porque `tie_word_embeddings = true` y no existe `output.weight`; solo `--token-embedding-type` protege realmente la capa de embeddings. Los cuatro ficheros resultantes varian en tamano (15.23 a 28.19 GiB) y en el nivel de precision de los tensores de atencion (las variantes AGENT mantienen mas tensores de salida de atencion en mayor precision, lo que favorece tool calling pero reduce ligeramente la velocidad).

La verificacion se hizo cargando cada fichero con `-ngl 999 -c 4096 -fa on -fit off` y comprobando tres respuestas correctas (17×23=391, capital de Japon=Tokyo, dias en 2024=366). Ademas, se audito el tamano de cada fichero contra la proyeccion `--dry-run` para confirmar que no hubo truncamiento.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Granite 4.1 30B es capaz de tareas de lenguaje natural complejas, incluyendo razonamiento logico y matematico.
- Tool calling y function calling: soporte nativo para invocar herramientas externas, con mejoras especificas en las variantes AGENT de esta cuantizacion que mantienen mayor precision en los tensores de atencion de salida.
- Generacion estructurada JSON: el modelo base esta entrenado para producir salidas JSON validas, util para integraciones con APIs.
- RAG (retrieval-augmented generation): soporta recuperacion de informacion externa gracias a su largo contexto de 131K tokens.
- Capacidades multilingues: el modelo base declara soporte multilingue, aunque la cuantizacion no especifica la lista de idiomas.
- Despliegue en hardware AMD ROCm: esta cuantizacion esta optimizada para ejecutarse en APUs AMD con gfx1151 (Strix Halo) y ROCm 7.2.4, aprovechando tipos de tensor FP4/FP8 nativos que no existen en llama.cpp estandar.

## Casos de uso

- Inferencia local en AMD Strix Halo: la variante Q4_0_ROCMFP4_COHERENT (15.23 GiB) permite ejecutar un modelo de 30B en una APU con 128 GB de memoria unificada a 13 t/s de decodificacion, adecuado para asistentes conversacionales locales sin dependencia de la nube.
- Desarrollo de agentes con tool calling: las variantes AGENT (Q6_0_ROCMFPX_AGENT y Q8_0_ROCMFPX_AGENT) mantienen mayor precision en los tensores de atencion de salida, lo que mejora la fiabilidad en escenarios donde el modelo debe invocar funciones externas de forma repetida y precisa.
- Generacion de codigo asistida en entornos AMD: con 8.25 BPW en la variante Q8_0_ROCMFPX, se puede usar para autocompletado y generacion de codigo en entornos de desarrollo locales sin enviar datos a servidores externos.
- Procesamiento de documentos largos: el contexto de 131K tokens permite resumir o analizar documentos extensos (por ejemplo, contratos o informes tecnicos) en una sola pasada, ejecutable en hardware AMD con memoria suficiente.
- Servicio de chatbot multilingue autoalojado: el modelo base soporta multiples idiomas, y esta cuantizacion permite desplegarlo en un servidor local con ROCm para atender conversaciones multilingue sin costes de API.
- Prototipado de pipelines RAG: al combinar el largo contexto con la generacion estructurada JSON, se puede construir un sistema de preguntas y respuestas sobre una base de conocimiento corporativa, ejecutado en una maquina AMD Strix Halo.

## Benchmarks y rendimiento

La model card proporciona mediciones reales de rendimiento obtenidas con `llama-bench -n 300 -p 512 -r 3` en hardware AMD Ryzen AI MAX+ 395 (Strix Halo, gfx1151) con 128 GB unificados y ROCm 7.2.4. Los valores son medianas de tres ejecuciones:

| Cuantizacion | Tamano (GiB) | BPW | Decodificacion (t/s) | Prefill pp512 (t/s) | Ancho de banda efectivo (GB/s) | % del pico (~256 GB/s) |
|---|---|---|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 15.23 | 4.53 | 13.07 | 292.81 | 213.7 | 83.5% |
| Q6_0_ROCMFPX_AGENT | 24.98 | 7.43 | 7.73 | 210.63 | 207.3 | 81.0% |
| Q8_0_ROCMFPX | 27.74 | 8.25 | 7.05 | 297.23 | 210.0 | 82.0% |
| Q8_0_ROCMFPX_AGENT | 28.19 | 8.39 | 6.87 | 309.14 | 208.0 | 81.2% |

La relacion de velocidad entre 4-bit y 8-bit (1.85×) coincide con la relacion inversa de tamano (1.82×), lo que confirma que el rendimiento esta limitado por el ancho de banda de memoria y no por cuellos de botella de computacion. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta cuantizacion especifica; los datos de calidad corresponden al modelo base IBM Granite 4.1 30B, que no se detallan en esta ficha.

## Requisitos de hardware

- VRAM estimada: 15.23 GiB para la variante de 4 bits, 24.98-28.19 GiB para las de 8 bits. En la plataforma objetivo (Strix Halo) se usa memoria unificada, no VRAM dedicada.
- GPU recomendada: AMD Ryzen AI MAX+ 395 (gfx1151) con 128 GB de memoria unificada y ROCm 7.2.4. Tambien compatible con otras APUs Strix Halo con suficiente memoria.
- No cabe en GPUs consumer convencionales (RTX 4090, etc.) porque los tipos de tensor ROCmFP4/ROCmFPX no estan soportados en hardware NVIDIA y el modelo requiere ROCm.
- Opciones de despliegue: exclusivamente llama.cpp compilado con el fork ROCmFPX (https://github.com/charlie12345/ROCmFPX). No compatible con llama.cpp estandar, Ollama ni LM Studio.
- Latencia y throughput: medidos en la tabla de benchmarks (13.07 t/s de decodificacion en 4-bit, 292-309 t/s de prefill en 8-bit).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite-4.1-30B-ROCmFP4-GGUF (este) | 28.87B | 131K | Apache 2.0 | GGUF con ROCmFP4/FPX | Requiere fork ROCmFPX, optimizado para AMD Strix Halo |
| ibm-granite/granite-4.1-30b (original) | 28.87B | 131K | Apache 2.0 | safetensors / BF16 | Modelo base, sin cuantizacion |
| unsloth/granite-4.1-30b-GGUF | 28.87B | 131K | Apache 2.0 | GGUF estandar | Cuantizaciones clasicas (Q4_K_M, Q8_0, etc.) compatibles con llama.cpp/Ollama |
| kingjones777/Granite-4.1-3B-ROCmFP4-GGUF | ~3B | no disponible | Apache 2.0 | GGUF con ROCmFP4 | Version reducida del mismo autor para Strix Halo |

La principal diferencia frente a las cuantizaciones estandar de unsloth es la compatibilidad: los ficheros de este repo solo funcionan con el fork ROCmFPX, mientras que los de unsloth son universales. La ventaja de esta publicacion es que esta especificamente calibrada para el hardware AMD Strix Halo y ofrece mediciones verificadas de rendimiento en esa plataforma.

## Limitaciones y advertencias

- Los ficheros GGUF requieren una compilacion especifica de llama.cpp con el fork ROCmFPX; no cargaran en llama.cpp estandar, Ollama ni LM Studio. Esto limita su uso a entornos donde se pueda compilar ese fork.
- El modelo base tiene `tie_word_embeddings = true`, por lo que no existe `output.weight`. Cualquier intento de cuantizar el modelo uno mismo con `--output-tensor-type` sera un no-op silencioso; solo `--token-embedding-type` protege la capa de embeddings.
- La variante Q6_0_ROCMFPX_AGENT no es un punto intermedio real: con 7.43 BPW rinde como las versiones de 8 bits, por lo que no es adecuada si se busca ahorro de tamano.
- No se han publicado evaluaciones de calidad (MMLU, HumanEval, etc.) para esta cuantizacion concreta. El rendimiento funcional puede variar ligeramente respecto al modelo BF16 original debido a la perdida de precision.
- El soporte de idiomas no esta documentado en la cuantizacion; se hereda del modelo base, que declara capacidades multilingues pero sin lista detallada.
- La licencia Apache 2.0 permite uso comercial, pero el fork ROCmFPX es un proyecto de terceros con su propia licencia que debe revisarse antes de un despliegue en produccion.
- El rendimiento medido se obtuvo en una configuracion especifica (Strix Halo, ROCm 7.2.4, memoria 128 GB). Otros hardware AMD con gfx1151 pueden ofrecer resultados diferentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Granite-4.1-30B-ROCmFP4-GGUF
- Modelo base IBM Granite 4.1 30B: https://huggingface.co/ibm-granite/granite-4.1-30b
- Documentacion oficial de IBM Granite 4.1: https://www.ibm.com/granite/docs/models/granite4-1
- Repositorio ROCmFPX (fork de llama.cpp): https://github.com/charlie12345/ROCmFPX
- Repositorio de modelos Granite 4.1 en GitHub: https://github.com/ibm-granite/granite-4.1-language-models
- Cuantizacion GGUF estandar de unsloth para el mismo modelo: https://huggingface.co/unsloth/granite-4.1-30b-GGUF
- Ficha de OpenModels sobre Granite 4.1 30B: https://www.openmodels.run/models/granite-4-1-30b
- Version 3B del mismo autor: https://huggingface.co/kingjones777/Granite-4.1-3B-ROCmFP4-GGUF
