# ByteOtter/Gemma-4-12B-it-CADA-Q3_K_S

## Resumen

Este modelo es una cuantizacion GGUF experimental del modelo instructivo Gemma 4 12B de Google, producida por ByteOtter mediante la herramienta QLAB. A diferencia de una cuantizacion uniforme Q3_K_S, esta version aplica precision mixta por tensor: mantiene el tipo estandar en la mayoria de los tensores y reasigna 22 de ellos bajo un presupuesto de bytes equivalente al de un Q3_K_S, con el objetivo de preservar mejor las capacidades de razonamiento del modelo original. El artefacto resultante pesa 5,155 GiB, un 76,78 % menos que el archivo BF16 de origen, y mantiene una ventana de contexto de 262 144 tokens.

La relevancia de este lanzamiento radica en su metodologia de evaluacion independiente: el laboratorio MLAB comparo cuatro artefactos del mismo origen (BF16, Q3_K_S estandar sin matriz de importancia, Q3_K_S con matriz de importancia de razonamiento, y esta asignacion mixta) sobre 128 items pareados. El resultado principal es una mejora de +18,750 puntos en la puntuacion de razonamiento frente al Q3_K_S estandar, con un intervalo de confianza bootstrap del 95 % entre +4,225 y +40,196. La mayor parte de esa ganancia se atribuye a la matriz de importancia (+17,188), mientras que la asignacion por tensor aporta +1,562 puntos adicionales, aunque este ultimo efecto no es estadisticamente significativo por separado.

Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribucion adicionales. Es un archivo unico en formato GGUF v3, pensado para su uso con llama.cpp y servidores compatibles con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 Unified 12B, instruction-tuned (transformer denso) |
| Parametros totales | 11 907 350 576 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (embebida en el GGUF) |
| Tipos de cuantizacion | Q3_K_S con precision mixta por tensor (22 tensores reasignados) |
| Idiomas soportados | Multilingue (no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

La arquitectura base es la de Gemma 4 12B, un transformer denso de 12 000 millones de parametros aproximadamente, afinado para instrucciones por Google. No se dispone de detalles internos adicionales (numero de capas, dimensiones de atencion, etc.) en la informacion proporcionada. El artefacto aqui presentado no es un entrenamiento nuevo, sino una cuantizacion del archivo `gemma-4-12b-it-BF16.gguf` de 22,195 GiB, realizada con QLAB.

La cuantizacion sigue un esquema de precision mixta: la mayoria de los tensores conservan el tipo Q3_K_S estandar, pero 22 tensores se reasignan a otros tipos dentro del mismo presupuesto de bytes. Ademas, se utilizo una matriz de importancia (imatrix) especifica para la categoria de razonamiento, que prioriza la preservacion de los pesos mas relevantes para tareas de inferencia logica y matematica. El GGUF incluye la plantilla de chat de Gemma 4 y los valores de muestreo por defecto del modelo original: temperatura 1.0, top-k 64 y top-p 0.95.

No se proporciona informacion sobre el dataset de entrenamiento del modelo base, ni sobre el uso de RLHF o DPO. La unica innovacion tecnica destacable es la combinacion de imatrix dirigida a razonamiento con asignacion por tensor, evaluada de forma independiente.

## Capacidades

- Generacion de texto conversacional con plantilla de chat integrada (Jinja).
- Razonamiento logico y matematico: la evaluacion MLAB muestra una puntuacion de 77,344 en la suite de razonamiento, frente a 58,594 del Q3_K_S estandar.
- Generacion de codigo: puntuacion de 35,938 en la suite de coding, frente a 13,281 del stock sin imatrix.
- Conocimiento general y QA: 73,438 en knowledge QA.
- Seguimiento de instrucciones: 25,000 en instruction following.
- Resumen y extraccion de informacion: 59,375 en summarization/extraction.
- Salida estructurada: 64,062 en structured output.
- Soporte de tool calling y function calling: no se menciona explicitamente en la documentacion, aunque la arquitectura Gemma 4 IT podria soportarlo; no hay evidencia en este artefacto.
- Capacidades de agente y multi-step reasoning: no evaluadas ni documentadas.
- Multilingue: la model card indica "multilingual", pero no se detallan los idiomas.
- Sin soporte de vision ni audio: los proyectores multimodales no estan incluidos en este archivo.

## Casos de uso

- Despliegue de un asistente de razonamiento en entornos con memoria limitada: con solo 5,155 GiB, el modelo cabe en GPUs de consumo de 8 GB, permitiendo ejecutar tareas de logica y matematica que normalmente requieren cuantizaciones mas ligeras o modelos mas pequenos.
- Chat conversacional con contexto muy largo: la ventana de 262 144 tokens permite mantener conversaciones extensas o procesar documentos completos sin truncamiento, util para atencion al cliente o analisis de historiales.
- Generacion de codigo en pipelines de CI/CD: aunque la puntuacion de coding es modesta (35,938), supera ampliamente al Q3_K_S estandar y puede integrarse en herramientas de autocompletado o revision de codigo cuando el presupuesto de VRAM es ajustado.
- Extraccion y resumen de documentos legales o tecnicos: la suite de summarization muestra una mejora de +17,188 puntos frente al stock ordinario, con un intervalo que no cruza cero, lo que sugiere una ventaja fiable en esta tarea.
- Sistemas de preguntas y respuestas sobre conocimiento interno: con 73,438 en knowledge QA, puede servir como base para un chatbot corporativo que responda sobre documentacion, siempre que se combine con recuperacion aumentada (RAG) para reducir alucinaciones.
- Prototipado rapido de aplicaciones de texto: al ser un unico archivo GGUF compatible con llama.cpp y servidores OpenAI, es facil de integrar en entornos de desarrollo locales o en la nube sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

Los resultados provienen de la evaluacion independiente de MLAB sobre 128 items pareados para la suite de razonamiento y 384 para las suites secundarias. Se comparan cuatro artefactos del mismo origen.

| Artefacto | Bytes | Razonamiento | Salidas validas |
|---|---:|---:|---:|
| BF16 fuente | 23 832 066 656 | 75,000 | 128/128 |
| Stock Q3_K_S sin imatrix | 5 528 230 496 | 58,594 | 128/128 |
| Stock Q3_K_S con imatrix de razonamiento | 5 528 230 848 | 75,781 | 128/128 |
| Este modelo (precision mixta) | 5 534 805 216 | **77,344** | 128/128 |

| Comparacion de razonamiento | Estimacion | Intervalo bootstrap 95 % | Items pareados |
|---|---:|---:|---:|
| Producto: este modelo − stock ordinario | **+18,750** | **+4,225 a +40,196** | 128 |
| Imatrix: stock con imatrix − stock ordinario | **+17,188** | **+2,113 a +40,196** | 128 |
| Asignacion: este modelo − stock con misma imatrix | +1,562 | -4,348 a +6,667 | 128 |
| Referencia fuente: este modelo − BF16 | +2,344 | -13,462 a +24,359 | 128 |

Suites secundarias (diagnosticos, no objetivos de optimizacion):

| Suite | BF16 | Stock ordinario | Stock con imatrix | Este modelo | Delta producto (95 % IC) | Delta asignacion (95 % IC) |
|---|---:|---:|---:|---:|---:|---:|
| Coding | 46,875 | 13,281 | 32,812 | 35,938 | +22,656 (+15,625, +30,469) | +3,125 (-3,125, +9,375) |
| Math | 45,312 | 28,906 | 35,156 | 34,375 | +5,469 (-1,587, +12,500) | -0,781 (-5,217, +3,269) |
| Knowledge QA | 71,875 | 64,062 | 71,875 | 73,438 | +9,375 (-5,882, +27,273) | +1,562 (-4,545, +18,182) |
| Instruction following | 35,938 | 21,875 | 23,438 | 25,000 | +3,125 (-6,250, +12,500) | +1,562 (-4,688, +7,812) |
| Summarization / extraction | 60,938 | 42,188 | 53,125 | 59,375 | +17,188 (+6,250, +29,688) | +6,250 (0,000, +14,062) |
| Structured output | 62,500 | 62,500 | 64,062 | 64,062 | +1,562 (-3,125, +7,812) | 0,000 (0,000, 0,000) |

El modelo alcanza el 103,12 % de la puntuacion BF16 en razonamiento, pero el intervalo de la comparacion con BF16 cruza cero, por lo que no hay evidencia de superioridad sobre el modelo sin cuantizar.

## Requisitos de hardware

- Tamano del archivo: 5,155 GiB. La VRAM necesaria para inferencia es aproximadamente ese tamano mas el overhead de ejecucion y la cache KV.
- Para contexto corto (hasta 8K tokens), cabe en GPUs de consumo con 8 GB de VRAM, como una RTX 3060, RTX 4060 o RTX 3050.
- Para contexto largo (por ejemplo, 32K tokens o mas), la cache KV crece considerablemente; se recomienda al menos 16 GB de VRAM (RTX 4080, RTX 4090, A10G) o el uso de tecnicas de atencion con ventana deslizante si la aplicacion lo permite.
- El contexto completo de 262 144 tokens requeriria una cantidad de memoria muy superior (del orden de 100 GB o mas solo para la cache KV), por lo que en la practica no es alcanzable en hardware de consumo.
- Opciones de despliegue: llama.cpp (llama-cli o llama-server), compatible con el formato GGUF y la plantilla Jinja. Tambien puede usarse con Ollama, LM Studio o cualquier servidor que soporte GGUF.
- Latencia y throughput: no se proporcionan mediciones. Como referencia, un modelo de 12B en Q3 en una GPU moderna (RTX 4090) suele generar entre 20 y 40 tokens por segundo, pero depende del contexto y de la implementacion.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La comparacion mas directa es con las otras cuantizaciones del mismo modelo base:

| Modelo | Tamano | Contexto | Razonamiento | Licencia |
|---|---:|---:|---:|---|
| Gemma 4 12B IT (BF16) | 22,195 GiB | 262 144 | 75,000 | Apache 2.0 |
| Gemma 4 12B IT (Q3_K_S estandar) | 5,155 GiB | 262 144 | 58,594 | Apache 2.0 |
| Gemma 4 12B IT (Q3_K_S con imatrix) | 5,155 GiB | 262 144 | 75,781 | Apache 2.0 |
| Este modelo (precision mixta) | 5,155 GiB | 262 144 | **77,344** | Apache 2.0 |

Frente a otros modelos de tamano similar (por ejemplo, Llama 3.1 8B o Qwen 2.5 7B en cuantizaciones Q4), no hay datos en la documentacion para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Cuantizacion agresiva: al ser una Q3, la perdida de precision es notable en tareas de alta sensibilidad numerica. La puntuacion de math (34,375) es inferior a la del BF16 (45,312) y no muestra una ventaja clara sobre el stock con imatrix.
- Sin soporte multimodal: este artefacto no incluye los proyectores de imagen o audio del modelo Gemma 4 original. Solo se evaluo generacion de texto.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de conocimiento abierto. La puntuacion de knowledge QA (73,438) indica un rendimiento moderado, no perfecto.
- Sesgos: no se ha realizado una auditoria de sesgos en este artefacto. El modelo base puede reflejar sesgos presentes en sus datos de entrenamiento.
- Contexto largo limitado en la practica: aunque el GGUF declara 262 144 tokens, la memoria necesaria para la cache KV hace inviable usar el contexto completo en hardware de consumo. En la practica, se recomienda limitar el contexto a 8K-32K tokens.
- Efecto de asignacion no confirmado: la mejora atribuible a la asignacion por tensor (+1,562 puntos) tiene un intervalo de confianza que incluye valores negativos, por lo que no hay evidencia estadistica de que esta asignacion sea superior a usar solo la imatrix.
- Dependencia de la version de llama.cpp: se requiere una version reciente con soporte de plantillas Jinja. Versiones antiguas pueden no cargar el archivo correctamente.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 esta sujeto a los terminos de uso de Google; se recomienda revisar la politica de uso aceptable de Google para Gemma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ByteOtter/Gemma-4-12B-it-CADA-Q3_K_S
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia arxiv citada en los tags: https://arxiv.org/abs/2607.02770 (no se ha podido verificar el contenido)
