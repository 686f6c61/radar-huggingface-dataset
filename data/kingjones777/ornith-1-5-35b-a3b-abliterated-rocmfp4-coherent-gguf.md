# kingjones777/Ornith-1.5-35B-A3B-Abliterated-ROCmFP4-COHERENT-GGUF

## Resumen

Ornith-1.5-35B-A3B-Abliterated-ROCmFP4-COHERENT-GGUF es una cuantización GGUF del modelo base ornith-ai/Ornith-1.5-35B-A3B, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con aproximadamente 35 mil millones de parámetros totales y unos 3 mil millones de parámetros activos por token. El modelo original fue desarrollado por DeepReinforce (publicado bajo licencia MIT en agosto de 2026) y forma parte de la familia Ornith-1.5, que emplea un bucle de auto-mejora en el que el propio modelo propone tareas, genera andamiajes (scaffolds) y produce soluciones.

Este repositorio concreto, creado por kingjones777, aplica dos transformaciones al modelo base: una ablación de la resistencia (abliteration) que elimina ciertos filtros de seguridad, y una cuantización ROCmFP4 en formato GGUF, optimizada específicamente para hardware AMD Strix Halo (APU Ryzen AI Max+ 395 con GPU Radeon 8060S). El archivo resultante pesa 18,5 GiB, usa 4,58 bits por peso y protege tanto la capa de salida como las embeddings de tokens con cuantización q6_K.

La relevancia de este modelo reside en su rendimiento en hardware AMD de consumo: alcanza 64,51 tokens por segundo en decodificación mediante Vulkan y 395 tokens por segundo en prefill mediante ROCm, lo que lo convierte en una opción práctica para ejecutar modelos de 35B en equipos con memoria unificada, sin necesidad de GPUs dedicadas de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones (segun fuentes externas) |
| Longitud de contexto | No disponible (probado con 32K tokens) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (ftype 102) con capa de salida y embeddings en q6_K; otros tiers disponibles en repositorios hermanos (Q8, Q6) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (repositorio); el modelo base usa MIT |
| Formato de pesos | GGUF con tipos tensoriales ROCmFP4 (ggml tipos 100-119) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer disperso tipo Mixture-of-Experts que activa aproximadamente 3 mil millones de parámetros por token, lo que reduce el coste computacional de inferencia frente a un modelo denso de tamaño equivalente. Segun la informacion disponible, el entrenamiento sigue un bucle de auto-mejora extendido del marco de auto-andamiaje introducido en Ornith-1.0: el modelo propone nuevas tareas, genera andamiajes especificos para cada tarea y produce rollouts de soluciones, un enfoque dirigido a construir modelos fundacionales mediante auto-mejora de extremo a extremo.

Este repositorio concreto no reentrena el modelo, sino que lo cuantiza a partir del GGUF BF16 oficial del modelo base (sin reconversion desde safetensors). La cuantizacion ROCmFP4 introduce tipos tensoriales propietarios (ggml tipos 100-119) que requieren un runtime especifico, el fork ROCmFPX de llama.cpp. La variante "COHERENT" (ftype 102) protege tanto la cabeza de salida (`output.weight`) como las embeddings de tokens (`token_embd.weight`) con cuantizacion q6_K, una decision verificada por lectura posterior de los tensores. El proceso de ablacion (abliteration) elimina capas de rechazo del modelo, lo que elimina ciertos filtros de seguridad pero tambien puede reducir la alineacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, con soporte para plantillas Jinja (flag `--jinja` en llama-server).
- Razonamiento y ejecucion de tareas de agente: el README menciona explicitamente cargas de trabajo "agentic" y bucles de agente, con recomendaciones de parametros para evitar bucles de repeticion.
- Generacion de JSON estructurado: las mediciones de rendimiento incluyen un prompt de tipo JSON, lo que sugiere capacidad de salida estructurada.
- Generacion de codigo y prosa: los benchmarks de rendimiento del repositorio distinguen entre tareas de codigo, prosa, razonamiento y JSON.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- El proceso de ablacion elimina filtros de rechazo, lo que permite respuestas sin censura (etiqueta "uncensored"), con los riesgos asociados.

## Casos de uso

- Despliegue local en equipos AMD Strix Halo: el modelo esta optimizado para APUs Ryzen AI Max+ con GPU Radeon 8060S, permitiendo ejecutar un LLM de 35B en un equipo de consumo con memoria unificada, sin GPU dedicada. Es adecuado para desarrolladores que trabajan en portatiles o mini-PCs con esta plataforma.
- Chatbots y asistentes conversacionales: con 64,51 tok/s de decodificacion en Vulkan, puede mantener conversaciones fluidas en tiempo real. La cuantizacion de 4 bits con cabeza protegida en q6_K reduce la degradacion de calidad en la generacion.
- Agentes autonomos y bucles de razonamiento: el modelo soporta tareas de agente multi-paso, y el README proporciona configuracion especifica (repeticion penalizada) para evitar bucles infinitos en este tipo de cargas.
- Generacion de codigo asistida: con capacidad de razonamiento y generacion de texto, puede usarse como autocompletado o asistente de codigo en entornos locales, especialmente en hardware AMD donde otros modelos grandes no caben.
- Extraccion y generacion de JSON estructurado: las mediciones muestran rendimiento consistente en tareas JSON, por lo que puede integrarse en pipelines que requieran salida estructurada para automatizacion o integracion con APIs.
- Investigacion y experimentacion con modelos ablacionados: al ser una version sin filtros de seguridad, es util para estudiar el comportamiento del modelo sin alineacion, siempre que se respeten las advertencias de uso responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona mediciones de rendimiento de inferencia en hardware concreto, que se resumen a continuacion.

Mediciones realizadas en Ryzen AI Max+ 395 (Strix Halo), Radeon 8060S gfx1151, 128 GB de memoria unificada, ROCm 7.2.4, Ubuntu 24.04, con contexto de 32K tokens, cache de teclas/valores en q8_0, 4 prompts fijos, temperatura 0, top_k 1, 400 tokens generados, mediana de 3 ejecuciones.

| Backend | Decode codigo (tok/s) | Decode prosa (tok/s) | Decode razonamiento (tok/s) | Decode JSON (tok/s) | Prefill (tok/s) | GTT |
|---|---:|---:|---:|---:|---:|---:|
| Vulkan0 | 64,51 | 62,63 | 64,27 | 64,03 | 249 | 20 GiB |
| ROCm0 | 56,38 | 56,28 | 56,15 | 56,32 | 395 | 21 GiB |

Comparativa con otros tiers del mismo repositorio familiar (todos medidos en el mismo hardware):

| Tier | ftype | Tamano | Decode Vulkan (tok/s) | Decode ROCm (tok/s) | Prefill ROCm (tok/s) |
|---|---:|---:|---:|---:|---:|
| COHERENT (este repo) | 102 | 18,5 GiB | 64,51 | 56,38 | 395 |
| STRIX_LEAN | 106 | 17,5 GiB | 62,69 | 56,59 | 423 |
| FAST | 103 | 17,4 GiB | 62,30 | 57,35 | 426 |
| Q8_ROCMFPX | 111 | 33,4 GiB | 46,82 | 42,28 | 331 |
| Q8_ROCMFPX_AGENT | 115 | 33,9 GiB | 46,17 | 41,67 | 337 |
| Q6_ROCMFPX_AGENT | 114 | 30,1 GiB | 43,19 | 42,00 | 199 |

## Requisitos de hardware

- VRAM estimada: entre 20 y 21 GiB de memoria unificada (GTT) con contexto de 32K tokens y cache en q8_0. En sistemas con memoria unificada (APU Strix Halo), esta memoria se comparte con el sistema.
- GPU recomendadas: AMD Radeon 8060S (gfx1151) integrada en Ryzen AI Max+ 395. No hay soporte oficial para GPUs NVIDIA o Intel en este repositorio, ya que los tipos ROCmFP4 requieren el runtime ROCmFPX.
- No cabe en GPUs de consumo tipicas de 8-16 GB sin cuantizaciones mas agresivas (no incluidas en este repositorio). Con 20-21 GiB de uso, se necesitaria al menos una GPU de 24 GB (como RTX 4090) si se adaptara el runtime, lo que no esta soportado.
- Opciones de despliegue: llama-server del fork ROCmFPX (https://github.com/charlie12345/ROCmFPX.git) con compilacion habilitando tanto HIP/ROCm como Vulkan. El mismo archivo binario puede usar ambos backends mediante el flag `-dev`.
- Latencia y throughput: decodificacion entre 56 y 65 tok/s segun backend y carga; prefill entre 249 y 395 tok/s. El backend Vulkan es mas rapido en decodificacion (+14,4 %), mientras que ROCm es un 59 % mas rapido en prefill.
- Requisitos de compilacion: se necesita ROCm 7.2.4 (o compatible), glslc para Vulkan, y evitar Ninja (usar Unix Makefiles). El proceso de compilacion se detalla en el README.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la informacion proporcionada. El modelo base Ornith-1.5-35B-A3B pertenece a la familia Ornith-1.5, que incluye una variante de 397B (MoE) y otra de 9B. Como referencia de la categoria, existen otros MoE de tamano similar como Qwen3-30B-A3B (30B totales, 3B activos) o DeepSeek-V3-Lite (16B totales, 2,4B activos), pero no se han publicado comparaciones de rendimiento ni de calidad en las fuentes disponibles. La tabla siguiente resume las caracteristicas conocidas del modelo base frente a alternativas genericas de la misma categoria, sin datos de benchmarks.

| Modelo | Parametros totales | Parametros activos | Licencia | Contexto | Disponibilidad de cuantizaciones GGUF |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 34,66B | ~3B | MIT | No disponible | Si, multiples tiers ROCmFP4 |
| Qwen3-30B-A3B (referencia) | 30B | 3B | Apache 2.0 | 32K (ampliable) | Si, GGUF estandar |
| DeepSeek-V3-Lite (referencia) | 16B | 2,4B | MIT | 32K | Si, GGUF estandar |

Nota: los datos de Qwen3 y DeepSeek son de conocimiento general y no provienen de la informacion proporcionada; deben verificarse antes de usar esta comparativa.

## Limitaciones y advertencias

- La cuantizacion ROCmFP4 requiere un runtime especifico (fork ROCmFPX de llama.cpp). El llama.cpp estandar no puede cargar este archivo y devolvera un error de tipo invalido. Esto limita su portabilidad a sistemas con este runtime compilado.
- El proceso de ablacion elimina filtros de seguridad, lo que puede producir respuestas ofensivas, sesgadas o peligrosas. No debe usarse en aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de bucles de repeticion: con los parametros por defecto (repeat_penalty=1.0, dry_multiplier=0.0), una decodificacion greedy puede entrar en un bucle infinito en tareas de agente. El autor recomienda `--repeat-penalty 1.05 --repeat-last-n 256`.
- El muestreo DRY puede corromper tareas de verificacion de integridad (por ejemplo, reproducir un hash sha256). No usar DRY en tareas que requieran exactitud byte a byte.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo ni de tasa de alucinacion para esta cuantizacion. Como modelo de 35B con solo 3B activos, puede tener limitaciones en razonamiento complejo frente a modelos densos de mayor tamano.
- Idioma: no se confirman los idiomas soportados; el modelo base fue entrenado probablemente con datos multilingues, pero no hay garantia.
- La licencia Apache 2.0 del repositorio permite uso comercial, pero el modelo base usa MIT, que tambien es permisiva. No obstante, el proceso de ablacion puede implicar cuestiones legales o eticas en algunos contextos.
- El rendimiento medido es especifico del hardware Strix Halo; en otros equipos AMD o en configuraciones con menos memoria unificada, los resultados pueden variar significativamente.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/kingjones777/Ornith-1.5-35B-A3B-Abliterated-ROCmFP4-COHERENT-GGUF
- Repositorio hermano con la familia completa de tiers: https://huggingface.co/kingjones777/Ornith-1.5-35B-A3B-ROCmFP4-COHERENT-GGUF
- Modelo base (ornith-ai/Ornith-1.5-35B-A3B): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio del runtime ROCmFPX: https://github.com/charlie12345/ROCmFPX.git
- Pagina oficial de Ornith AI: https://ornith.ai/
- Ficha del modelo en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-35b-a3b
- Ficha del modelo en Atomic Chat: https://atomic.chat/models/ornith-1-5-35b-a3b
