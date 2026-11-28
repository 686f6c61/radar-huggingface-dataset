# Harsha001/Groot-19B-A3B-261023-ROCmFPX

## Resumen

Groot-19B-A3B-261023 es un modelo de razonamiento multimodal con arquitectura de mezcla de expertos (MoE) que parte de Qwen3.6-35B-A3B. Desarrollado por GrootTeam, combina 19.000 millones de parametros totales con aproximadamente 3.000 millones activos por token, distribuidos en 128 expertos con 8 activos por token. Procesa imagenes, utiliza herramientas y, por defecto, razona antes de responder, con una ventana de contexto de 256K tokens.

El repositorio de Harsha001 que nos ocupa no es el modelo original, sino una cuantizacion en formato ROCmFPX, un fork de llama.cpp orientado a GPU AMD (Vulkan y HIP/ROCm) con tipos de peso de baja precision. Incluye cuatro variantes de cuantizacion del modelo de texto (8 bits, 6 bits, y dos de 4 bits) mas dos codificadores de vision en F16 y Q8_0. El objetivo es ejecutar el modelo en hardware AMD, en particular equipos con memoria unificada como Strix Halo.

La relevancia actual radica en la escasez de opciones de cuantizacion optimizadas para ROCm frente al ecosistema CUDA, y en que este repositorio ofrece una alternativa con escalas por tensor que mejora la fidelidad respecto a las cuantizaciones estandar de llama.cpp en el mismo tamano. No obstante, el autor advierte de que los ficheros no se han probado aun en hardware AMD y requieren una build especifica del fork.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 128 expertos, 8 activos por token; derivada de Qwen3.6-35B-A3B |
| Parametros totales | 18.985.738.950 (~19B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Q8_0 (ROCmFPX), Q6_K (ROCmFPX, pesos Q6_0_ROCMFPX), Q4_0 ROCmFP4 STRIX_O8, Q4_0 ROCmFP4 FAST; codificador de vision en F16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variantes ROCmFPX y ROCmFP4), mas mmproj GGUF para vision |

## Arquitectura y entrenamiento

El modelo base es una arquitectura transformer con mezcla de expertos: 128 expertos con 8 activos por token, lo que da unos 3.000 millones de parametros activos sobre un total de 19.000 millones. Segun la model card, Groot parte de Qwen3.6-35B-A3B, lo que sugiere un proceso de adaptacion o continuacion de entrenamiento sobre ese modelo. El modelo razona antes de responder por defecto (modo thinking activable o desactivable mediante `enable_thinking`) y admite entrada de imagenes a traves de un codificador de vision independiente empaquetado como fichero `mmproj`.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones de atencion mas alla de la ventana de 256K. En cuanto a la cuantizacion, la aportacion tecnica del repositorio es el uso de escalas por tensor: cada matriz de pesos se multiplica por una potencia de dos antes de cuantizar y la inversa se almacena como `<nombre>.scale`, que el fork vuelve a aplicar tras el producto matricial. Esto evita que los pesos pequenos queden atrapados en la escala de bloque minima de ROCmFPX. Las mediciones de calidad se hicieron con `llama-perplexity --kl-divergence` frente a la conversion BF16 de los pesos originales, sobre 40 fragmentos de 512 tokens de wikitext-2 en CPU.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y desactivable.
- Razonamiento matematico (evaluado en GSM8K) y resolucion de problemas paso a paso.
- Comprension de imagenes: pipeline `image-text-to-text`, con descripcion de imagenes verificada por el autor.
- Uso de herramientas (tool calling) segun la model card del modelo base.
- Capacidades conversacionales multi-turno con contexto de hasta 256K tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).

## Casos de uso

- Razonamiento sobre documentos extensos: con 256K tokens de contexto, el modelo puede procesar contratos, informes o bases de codigo completas y responder preguntas que requieren cruzar informacion de multiples secciones.
- Analisis de imagenes en flujos documentales: gracias al codificador de vision, puede describir y extraer informacion de capturas, frontales de periodico o formularios escaneados, como verifico el autor con una imagen de prueba.
- Asistente de razonamiento matematico: los resultados en GSM8K (98/100 en BF16 y hasta 99/100 en la variante FAST) lo hacen adecuado para tutoria o verificacion de calculos paso a paso.
- Despliegue en estaciones de trabajo AMD: las variantes ROCmFP4 estan pensadas para ejecutarse en equipos con memoria unificada (por ejemplo, Strix Halo de 128 GB), donde un modelo de 19B en 4 bits (10-11 GB) deja margen para contexto largo y el codificador de vision.
- Prototipado de agentes con tool calling: el modelo puede integrarse en pipelines que requieran llamadas a funciones y razonamiento multi-paso, con la ventaja del bajo numero de parametros activos (~3B) para reducir coste por token.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye metricas de KL, coincidencia de token superior y perplejidad, lo que lo convierte en un banco de pruebas util para estudiar el impacto de la cuantizacion de baja precision en modelos MoE multimodales.

## Benchmarks y rendimiento

Calidad de cuantizacion frente a BF16 (perplejidad BF16 de referencia: 11,60 sobre el mismo texto):

| Fichero | Tamano | KL a BF16 | Mismo token superior | PPL |
|---|---:|---:|---:|---:|
| Q8_0 ROCmFPX | 19,6 GB | 0,0100 | 95,0% | 11,64 |
| Q6_K ROCmFPX | 15,7 GB | 0,0127 | 94,4% | 11,64 |
| Q4_0 ROCmFP4 STRIX_O8 | 10,4 GB | 0,0623 | 86,6% | 12,05 |
| Q4_0 ROCmFP4 FAST | 10,1 GB | 0,0663 | 86,1% | 12,10 |
| Q8_0 estandar (referencia) | 20,2 GB | 0,0075 | 96,1% | 11,60 |
| Q6_K estandar (referencia) | 15,6 GB | 0,0141 | 94,0% | 11,63 |
| Q4_K_M estandar (referencia) | 11,7 GB | 0,0319 | 90,8% | 11,76 |

Prueba de matematicas (GSM8K, primeras 100 preguntas, thinking desactivado, decodificacion greedy):

| Fichero | Aciertos (de 100) |
|---|---:|
| BF16 | 98 |
| Q4_K_M estandar | 97 |
| Q8_0 ROCmFPX | 96 |
| Q4_0 ROCmFP4 STRIX_O8 | 98 |
| Q4_0 ROCmFP4 FAST | 99 |

En 200 preguntas, BF16 obtuvo 192, Q4_K_M estandar 191 y el fichero de 8 bits 190. El fichero de 6 bits acerto 36 de sus primeras 37 preguntas antes de detener la ejecucion por lentitud en la CPU de prueba.

Velocidad medida en CPU ARM (DGX Spark, 20 nucleos; `llama-bench`, prompt de 512 tokens, 128 generados, 20 hilos):

| Fichero | Prompt (tok/s) | Generacion (tok/s) |
|---|---:|---:|
| Q4_K_M estandar | 108,9 | 24,7 |
| Q8_0 ROCmFPX | 99,1 | 19,3 |
| Q6_K ROCmFPX | 2,9 | 0,8 |
| Q4_0 ROCmFP4 STRIX_O8 | 22,9 | 2,3 |
| Q4_0 ROCmFP4 FAST | 22,3 | 2,2 |

No hay cifras de velocidad en GPU AMD: el autor indica que los ficheros se generaron y probaron en una maquina ARM, no en hardware AMD.

## Requisitos de hardware

- VRAM/memoria estimada segun fichero: Q8_0 ~19,6 GB; Q6_K ~15,7 GB; Q4_0 STRIX_O8 ~10,4 GB; Q4_0 FAST ~10,1 GB; mas el codificador de vision (0,6 GB en Q8_0 o 0,9 GB en F16) y el espacio de contexto KV.
- GPU objetivo: AMD con soporte ROCm/HIP o Vulkan; el repositorio esta orientado a Strix Halo (memoria unificada de 128 GB) y a GPU AMD en general.
- No cabe en GPU de consumo con 8-12 GB en las variantes de 8 bits o 6 bits; las variantes de 4 bits (~10 GB) podrian caber en GPU de 12-16 GB, aunque no se han validado en AMD.
- Opciones de despliegue: exclusivamente el fork HarshaVardhan3002/ROCmFPX de llama.cpp, build del 29 de octubre de 2026 o posterior (commit `642acd395`). llama.cpp estandar, LM Studio, Ollama y otras builds de ROCmFPX pueden no cargar estos ficheros.
- Latencia y throughput: solo disponibles en CPU ARM (ver tabla de velocidad); en GPU AMD, no disponibles.
- En CPU, el autor recomienda usar el fichero de 8 bits o un fichero estandar, dado que el codigo del fork para los tipos de 6 y 4 bits es muy lento en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---:|---:|---|---|---|
| Groot-19B-A3B-261023 (este repo, ROCmFPX) | 19B | ~3B | 256K | Apache 2.0 | GGUF ROCmFPX/ROCmFP4 | Optimizado para AMD, no probado en GPU AMD |
| Groot-19B-A3B-261023 (GGUF estandar de GrootTeam) | 19B | ~3B | 256K | Apache 2.0 | GGUF estandar | Mayor fidelidad a BF16 en 4 bits (KL 0,0319 vs 0,0623) |
| Qwen3.6-35B-A3B (modelo de partida) | 35B | ~3B | no disponible | no disponible | safetensors/GGUF | Base del modelo; mayor numero de parametros totales |

La comparacion cuantitativa con otras familias (por ejemplo, modelos MoE de rango similar de otros fabricantes) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Los ficheros no se han probado en hardware AMD; el rendimiento real en ROCm es desconocido.
- Requieren una build concreta del fork ROCmFPX (commit `642acd395` o posterior); no cargan en llama.cpp estandar, LM Studio ni Ollama.
- En CPU, las variantes de 6 y 4 bits son extremadamente lentas (0,8-2,3 tok/s de generacion).
- Las variantes de 4 bits se alejan mas de BF16 que un Q4_K_M estandar (KL 0,0623-0,0663 frente a 0,0319) a cambio de menor tamano y mayor velocidad en AMD.
- El modelo base es una adaptacion no oficial de Qwen3.6-35B-A3B; no se detallan sesgos conocidos ni composicion del dataset de entrenamiento.
- Riesgo de alucinacion inherente a los modelos generativos, no cuantificado en la informacion disponible.
- Idiomas soportados no especificados; el comportamiento multilingue no esta documentado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.6 conviene verificar las condiciones de la licencia del modelo base original.
- Las pruebas de calidad se hicieron con thinking desactivado y decodificacion greedy; el comportamiento con thinking activo puede diferir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Groot-19B-A3B-261023-ROCmFPX
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- GGUF oficial del modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023-GGUF
- Fork ROCmFPX (repositorio del autor): https://github.com/HarshaVardhan3002/ROCmFPX
- Fork ROCmFPX (referencia alternativa): https://github.com/charlie12345/ROCmFPX
- Cuantizacion destacada del autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
