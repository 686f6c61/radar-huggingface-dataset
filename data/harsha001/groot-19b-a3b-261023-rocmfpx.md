# Harsha001/Groot-19B-A3B-261023-ROCmFPX

## Resumen

Groot-19B-A3B-261023-ROCmFPX es una cuantizacion en formato GGUF del modelo Groot-19B-A3B-261023, desarrollado por GrootTeam y distribuida por el usuario Harsha001. El modelo original es un transformer de mezcla de expertos (MoE) con 18.985.738.950 parametros totales y aproximadamente 3.000 millones activos por token, construido a partir de Qwen3.6-35B-A3B. Es un modelo de razonamiento multimodal que procesa imagenes, utiliza herramientas, razona antes de responder por defecto y dispone de una ventana de contexto de 256K tokens.

La particularidad de esta publicacion no reside en el modelo base, sino en el formato de cuantizacion: ROCmFPX, un fork de llama.cpp que incorpora tipos de peso de bajo bit optimizados para GPUs AMD mediante Vulkan y HIP/ROCm. Se ofrecen cuatro variantes que van desde 8 bits (19,6 GB) hasta 4 bits (10,1 GB), ademas de dos encoders de vision independientes en F16 y Q8_0.

El interes practico es doble: por un lado, permite ejecutar un modelo MoE multimodal de ~19B parametros con contexto de 256K en hardware AMD con requisitos de memoria reducidos; por otro, documenta de forma transparente las metricas de degradacion por cuantizacion (KL respecto a BF16, coincidencia de token superior, perplejidad y resultados en GSM8K) para cada variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 128 expertos, 8 activos por token; basado en Qwen3.6-35B-A3B |
| Parametros totales | 18.985.738.950 (~19B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | ROCmFPX Q8_0 (8 bits), ROCmFPX Q6_0 (6 bits), ROCmFP4 4 bits (receta Strix Halo y FAST); encoder de vision en F16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variantes ROCmFPX); encoder de vision en GGUF mmproj |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos y 8 activos por token, lo que resulta en aproximadamente 3.000 millones de parametros activos sobre un total de ~19.000 millones. Deriva de Qwen3.6-35B-A3B e incorpora una capa de prediccion multi-token (MTP), que los archivos de esta publicacion conservan aunque el fork ROCmFPX todavia no la utiliza y la omite al cargar. El pipeline declarado es image-text-to-text, lo que confirma la presencia de un encoder de vision integrado, distribuido aqui como archivo mmproj separado.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La innovacion tecnica destacable de esta publicacion es el formato de cuantizacion: todos los archivos incorporan escalas por tensor (cada matriz de pesos se multiplica por una potencia de dos antes de cuantizar y la inversa se almacena como `<nombre>.scale`), lo que evita que los pesos pequenos queden atrapados en la escala de bloque minima de ROCmFPX. La capa de embeddings de tokens utiliza tipos estandar de llama.cpp en la mayoria de variantes (Q8_0 o Q6_K), salvo en el archivo FAST, que la mantiene en ROCmFP4 por velocidad.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activado por defecto, configurable mediante `enable_thinking`.
- Comprension de imagenes (image-text-to-text) mediante el encoder de vision incluido en los archivos mmproj.
- Uso de herramientas y function calling.
- Razonamiento multi-paso y flujos de agente.
- Capacidades matematicas verificadas en GSM8K (hasta 99/100 en la variante FAST con thinking desactivado).
- Contexto largo de 256K tokens para documentos extensos y conversaciones multi-turno.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento sobre documentacion extensa: la ventana de 256K tokens permite cargar manuales tecnicos, expedientes o bases de codigo completas y formular preguntas que requieran correlacionar secciones distantes sin fragmentacion por chunking.
- Analisis de imagenes en entornos AMD: con el encoder de vision en Q8_0 (0,6 GB) o F16 (0,9 GB), el modelo puede describir capturas, diagramas o documentos escaneados en estaciones de trabajo con GPU AMD y memoria limitada, donde otras alternativas no caben.
- Agentes con tool calling en produccion: el soporte de function calling y razonamiento multi-paso permite construir agentes que consulten APIs, ejecuten calculos y encadenen acciones, con la variante de 8 bits como opcion de maxima fidelidad.
- Asistente de matematicas y analisis cuantitativo: los resultados en GSM8K (96-99 sobre 100 segun variante) lo hacen adecuado para resolucion de problemas aritmeticos y verificacion de calculos en pipelines automatizados.
- Despliegue en hardware de consumo AMD: las variantes de 4 bits (10,1-10,4 GB) permiten ejecutar el modelo en equipos con 16 GB de VRAM o en configuraciones tipo Strix Halo con memoria unificada, a costa de una mayor deriva respecto a BF16.
- Prototipado e investigacion de cuantizacion: las metricas publicadas (KL, coincidencia de token superior, perplejidad, GSM8K) convierten este repositorio en una referencia util para estudiar el impacto de formatos de bajo bit en modelos MoE multimodales.
- Procesamiento por lotes en CPU con la variante de 8 bits: es la unica con rendimiento aceptable en CPU segun las pruebas del autor (99,1 tok/s de prompt y 19,3 tok/s de generacion), adecuada para tareas offline donde no hay GPU disponible.

## Benchmarks y rendimiento

Calidad de cuantizacion medida con `llama-perplexity --kl-divergence` frente a BF16, sobre 40 fragmentos de 512 tokens de wikitext-2:

| Archivo | Tamano | KL a BF16 | Mismo token superior | PPL |
|---|---:|---:|---:|---:|
| BF16 (referencia) | no disponible | 0 | 100% | 11,60 |
| Q8_0 ROCmFPX | 19,6 GB | 0,0100 | 95,0% | 11,64 |
| Q6_K ROCmFPX | 15,7 GB | 0,0127 | 94,4% | 11,64 |
| Q4_0 ROCmFP4 STRIX_O8 | 10,4 GB | 0,0623 | 86,6% | 12,05 |
| Q4_0 ROCmFP4 FAST | 10,1 GB | 0,0663 | 86,1% | 12,10 |
| Stock Q8_0 | 20,2 GB | 0,0075 | 96,1% | 11,60 |
| Stock Q6_K | 15,6 GB | 0,0141 | 94,0% | 11,63 |
| Stock Q4_K_M | 11,7 GB | 0,0319 | 90,8% | 11,76 |

GSM8K (primeras 100 preguntas, thinking desactivado, decodificacion greedy, maximo 1024 tokens):

| Archivo | Correctas (de 100) |
|---|---:|
| BF16 | 98 |
| Stock Q4_K_M | 97 |
| Q8_0 ROCmFPX | 96 |
| Q4_0 ROCmFP4 STRIX_O8 | 98 |
| Q4_0 ROCmFP4 FAST | 99 |

En 200 preguntas, BF16 obtuvo 192, stock Q4_K_M 191 y el archivo de 8 bits 190. El archivo de 6 bits acerto 36 de sus primeras 37 preguntas antes de detener la prueba por lentitud en CPU.

Rendimiento en CPU (llama-bench, prompt de 512 tokens, 128 generados, 20 hilos, DGX Spark):

| Archivo | Prompt (tok/s) | Generacion (tok/s) |
|---|---:|---:|
| Stock Q4_K_M | 108,9 | 24,7 |
| Q8_0 ROCmFPX | 99,1 | 19,3 |
| Q6_K ROCmFPX | 2,9 | 0,8 |
| Q4_0 ROCmFP4 STRIX_O8 | 22,9 | 2,3 |
| Q4_0 ROCmFP4 FAST | 22,3 | 2,2 |

No hay mediciones de velocidad en GPU AMD: el autor indica explicitamente que los archivos no se han probado en hardware AMD.

## Requisitos de hardware

- VRAM estimada para inferencia: 19,6 GB (Q8_0), 15,7 GB (Q6_K), 10,4 GB (Q4_0 STRIX_O8), 10,1 GB (Q4_0 FAST), mas 0,6-0,9 GB del encoder de vision si se usa entrada multimodal.
- GPU recomendadas: el formato esta disenado para GPUs AMD mediante Vulkan y HIP/ROCm; el autor no especifica modelos concretos ni publica cifras de rendimiento en AMD.
- Cabe en GPU de consumo: las variantes de 4 bits (10,1-10,4 GB) caben en GPUs con 12-16 GB de VRAM; la de 8 bits requiere 24 GB o memoria unificada. No confirmado en hardware AMD por falta de pruebas del autor.
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp (build del 29 de octubre de 2026 o posterior, commit `642acd395`). llama.cpp estandar, LM Studio, Ollama y otras builds de ROCmFPX pueden no cargar estos archivos.
- Latencia y throughput: solo disponibles en CPU (ver tabla de benchmarks). En CPU, el archivo de 6 bits y los de 4 bits son muy lentos con el codigo del fork (0,8-2,3 tok/s de generacion); el autor recomienda usar el archivo de 8 bits o un archivo estandar si se ejecuta en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---:|---:|---|---|---|
| Groot-19B-A3B-261023 (ROCmFPX) | ~19B | ~3B | 256K | Apache 2.0 | GGUF ROCmFPX | Optimizado para AMD, requiere fork |
| Groot-19B-A3B-261023 (GGUF oficial) | ~19B | ~3B | 256K | Apache 2.0 | GGUF estandar (Q4_K_M) | Mayor fidelidad a BF16 a 4 bits (KL 0,0319 frente a 0,0623), compatible con llama.cpp estandar |
| Qwen3.6-35B-A3B (modelo de origen) | ~35B | ~3B | no disponible | no disponible | no disponible | Base del que deriva Groot; el autor no detalla diferencias de entrenamiento |

La comparacion directa mas relevante es contra los GGUF estandar del mismo modelo: a 6 bits, el archivo ROCmFPX iguala o supera ligeramente la fidelidad del Q6_K estandar (KL 0,0127 frente a 0,0141) con practicamente el mismo tamano; a 8 bits, el Q8_0 estandar es algo mas fiel (KL 0,0075 frente a 0,0100) siendo 0,6 GB mas grande; a 4 bits, el Q4_K_M estandar es claramente superior en fidelidad (KL 0,0319 frente a 0,0623-0,0663) por 1,3-1,6 GB mas de tamano.

## Limitaciones y advertencias

- Los archivos no se han probado en hardware AMD; todas las mediciones de velocidad proceden de una CPU ARM (DGX Spark). El rendimiento real en GPU AMD es desconocido.
- Requieren un fork especifico de llama.cpp (ROCmFPX, build del 29 de octubre de 2026 o posterior); no cargan en llama.cpp estandar, LM Studio, Ollama ni otras builds.
- Las variantes de 4 bits presentan una deriva notable respecto a BF16 (KL 0,0623-0,0663, coincidencia de token superior del 86%) y son inferiores en fidelidad al Q4_K_M estandar del mismo modelo.
- El archivo de 6 bits es extremadamente lento en CPU con el codigo actual del fork (0,8 tok/s de generacion); no es apto para inferencia en CPU.
- La capa MTP se conserva pero el fork la omite al cargar, por lo que no aporta aceleracion.
- No es una release oficial de GrootTeam; la responsabilidad del mantenimiento recae en el publicador del repositorio.
- No hay informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica del modelo base en la documentacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero las condiciones del modelo base deben verificarse en su repositorio original.
- El repo ocupa 57,5 GB e incluye todas las variantes; descargar solo el archivo necesario.
- Solo 209 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Groot-19B-A3B-261023-ROCmFPX
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- GGUF oficial del modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023-GGUF
- Fork ROCmFPX (repositorio del autor): https://github.com/HarshaVardhan3002/ROCmFPX
- Fork ROCmFPX (referencia en la model card): https://github.com/charlie12345/ROCmFPX
