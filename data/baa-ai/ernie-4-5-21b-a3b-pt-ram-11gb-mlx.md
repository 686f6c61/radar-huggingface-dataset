# baa-ai/ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX

## Resumen

ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX es una cuantizacion de precision mixta del modelo baidu/ERNIE-4.5-21B-A3B-PT, un transformer de tipo mezcla de expertos (MoE) desarrollado por Baidu. La version que nos ocupa la publica baa-ai (Black Sheep AI) mediante su metodo propietario "Black Sheep AI", orientado a reducir el peso en memoria de modelos de razonamiento sin destruir su capacidad. El resultado ocupa 11,1 GB en disco, con una media de 3,5 bits por peso, y se distribuye en formato MLX para su ejecucion en hardware Apple Silicon.

El modelo base tiene 21.825.436.160 parametros totales (unos 21,8 mil millones), de los cuales solo una fraccion se activa por token al tratarse de una arquitectura MoE. La cuantizacion esta pensada como el "punto de rodilla" de RAM: el menor presupuesto de memoria que el sondeo interno de baa-ai estima antes de que la calidad caiga de forma acusada. Segun la model card, conserva el 96,5 % del rendimiento en MMLU respecto al modelo en BF16 (75,00 % frente a 77,75 %), aunque queda 5,25 puntos por debajo de una cuantizacion uniforme de 4 bits.

Su relevancia practica es doble: por un lado, permite ejecutar un MoE de 21,8 mil millones de parametros en equipos con memoria unificada modesta (Mac con 16-24 GB); por otro, ilustra el compromiso entre tamano y calidad en la cuantizacion de modelos grandes. La licencia es Apache 2.0, lo que facilita su uso comercial, y el pipeline declarado es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (ernie4_5_moe) |
| Parametros totales | 21.825.436.160 (~21,8 mil millones) |
| Parametros activos | no disponible (el identificador A3B sugiere ~3 mil millones activos, dato no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta, media de 3,5 bits por peso (formato MLX) |
| Idiomas soportados | no disponible (la model card menciona comportamiento multilingue, con respuestas en chino ante prompts sin system prompt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de Baidu, identificado en los tags como `ernie4_5_moe`. La variante aqui descrita no reentrena el modelo: aplica una cuantizacion de precision mixta sobre los pesos originales en BF16, con una media de 3,5 bits por peso, mediante un metodo propietario de baa-ai. El repositorio resultante pesa 11,1 GB frente a los 43,9 GB del BF16 y los 12,3 GB de una cuantizacion uniforme de 4 bits.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo RLHF o DPO. La model card indica que ERNIE "no usa una fase de pensamiento" (thinking phase): sus respuestas libres promedian unos 90 tokens. La innovacion tecnica destacable de esta version es precisamente el esquema de cuantizacion de precision mixta, que asigna distintos niveles de bits a distintas partes del modelo para minimizar la perdida de calidad a un presupuesto de memoria dado.

## Capacidades

- Generacion de texto conversacional y continuacion de prompts.
- Razonamiento aritmetico: 93 % en GSM8K (100 preguntas) y 85 % en MMLU-Pro math (60 preguntas).
- Razonamiento multi-paso: 31,7 % en cadenas de 4 a 6 saltos con respuesta libre (hasta 3072 tokens) y 98,9 % en sumas multi-paso de 4 a 6 terminos.
- Respuesta a preguntas de conocimiento general (MMLU 75,00 % en el conjunto de 400 preguntas).
- Lectura de documentos en tareas de recuperacion aumentada (RAG): 30,0 % de acierto en preguntas sobre manuales del Boeing 787 donde la respuesta debe contener el valor esperado.
- Comportamiento multilingue: responde en chino ante prompts escuetos sin system prompt; un system prompt en ingles mantiene las respuestas en ingles.
- No se documenta soporte de tool calling, function calling ni capacidades de vision o audio en la informacion disponible.

## Casos de uso

- Asistente conversacional local en Mac: con 11,1 GB en formato MLX, el modelo cabe en equipos Apple Silicon de 16-24 GB de memoria unificada, lo que permite desplegar un chatbot privado sin conexion a servicios externos.
- Razonamiento aritmetico en entornos educativos o financieros: su 93 % en GSM8K lo hace adecuado para resolver problemas de palabras y explicar el calculo paso a paso.
- Lectura de documentacion tecnica con RAG: integrado como "lector" de una consola de recuperacion aumentada, responde preguntas sobre manuales extensos (el caso documentado usa manuales del Boeing 787), aunque con un acierto del 30 % que limita su uso a tareas de baja criticidad.
- Extraccion y calculo sobre tablas y datos estructurados: las sumas multi-paso de 4 a 6 terminos alcanzan el 98,9 %, util para agregaciones y verificaciones numericas en pipelines de datos.
- Prototipado de agentes de razonamiento en local: permite experimentar con cadenas de razonamiento multi-paso y evaluar su viabilidad antes de migrar a infraestructura mayor, dado su bajo coste de memoria.
- Generacion de texto y resumenes en ingles con system prompt explicito: al fijar el idioma mediante system prompt se evita la deriva al chino observada en prompts sin instrucciones.
- Despliegue en Mac Studio o entornos aislados (air-gapped): la combinacion de tamano reducido y licencia Apache 2.0 facilita su uso en instalaciones sin acceso a internet.

## Benchmarks y rendimiento

| Modelo | Tamano | MMLU | MMLU % de BF16 |
|---|---|---|---|
| BF16 (original) | 43,9 GB | 77,75 % | 100 % |
| Cuantizacion uniforme 4 bits | 12,3 GB | 80,25 % | 103,2 % |
| RAM 11GB (esta version) | 11,1 GB | 75,00 % | 96,5 % |

| Prueba | Resultado |
|---|---|
| MMLU (400 preguntas) | 75,00 % |
| MMLU vs cuantizacion uniforme 4 bits | -5,25 puntos |
| Document Q&A, manuales Boeing 787 (150 preguntas) | 30,0 % |
| GSM8K (100 preguntas) | 93 % |
| MMLU-Pro math (60 preguntas) | 85 % |
| Cadenas multi-hop de 4 a 6 saltos (126), respuesta libre hasta 3072 tokens | 31,7 % |
| Sumas multi-hop de 4 a 6 terminos (90), respuesta libre | 98,9 % |
| Cadenas multi-hop, respuesta escueta de una palabra, 220 tokens, thinking off | 1,6 % |
| Sumas multi-hop, respuesta escueta, 220 tokens, thinking off | 88,9 % |

La model card senala que la cuantizacion uniforme de 4 bits, con 1,2 GB mas, obtiene mejor puntuacion en MMLU (responde correctamente 34 preguntas que esta version falla, frente a 13 en sentido contrario), por lo que es preferible si el presupuesto de memoria lo permite.

## Requisitos de hardware

- VRAM/memoria estimada: 11,1 GB de pesos; se recomienda al menos 16 GB de memoria unificada en Apple Silicon para dejar margen a la cache KV y al contexto.
- Hardware objetivo: equipos Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra) con memoria unificada de 16 GB o superior; la model card menciona Mac Studio como plataforma de despliegue.
- GPU dedicadas: al estar en formato MLX, no esta pensado para GPUs NVIDIA; no se documenta soporte para A100, H100 ni RTX 4090 en esta version.
- Cabe en GPU de consumo: si, en el ecosistema Apple Silicon; en equipos con 16 GB de memoria unificada el margen es ajustado, por lo que 24 GB o mas es lo recomendable.
- Opciones de despliegue: `mlx_lm` (libreria oficial de MLX); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX (esta version) | 21,8 B (MoE) | no disponible | 75,00 % | Apache 2.0 | MLX safetensors |
| ERNIE-4.5-21B-A3B-PT en BF16 | 21,8 B (MoE) | no disponible | 77,75 % | Apache 2.0 | safetensors |
| ERNIE-4.5-21B-A3B-PT cuantizacion uniforme 4 bits | 21,8 B (MoE) | no disponible | 80,25 % | Apache 2.0 | safetensors |

No se dispone de datos de otros modelos de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada, por lo que la comparativa se limita a las tres variantes del mismo modelo base documentadas en la model card.

## Limitaciones y advertencias

- Perdida de calidad frente al original: 96,5 % del rendimiento en MMLU respecto a BF16 y 5,25 puntos por debajo de la cuantizacion uniforme de 4 bits; si hay memoria suficiente, la version de 4 bits uniforme es mejor opcion para conocimiento general.
- Deriva de idioma: en pruebas con prompts escuetos sin system prompt ("Say OK.") el modelo respondio en chino; es necesario fijar el idioma con un system prompt explicito.
- Debilidad en cadenas de relaciones largas: 31,7 % en cadenas multi-hop de 4 a 6 saltos con respuesta libre y solo 1,6 % con respuesta escueta y thinking off.
- RAG limitado: 30,0 % de acierto en preguntas sobre manuales tecnicos extensos; la model card atribuye el resultado a que las busquedas en tablas largas favorecen a lectores de mayor tamano.
- Sin fase de pensamiento: ERNIE no dispone de thinking phase, lo que limita el razonamiento extendido en tareas que requieran cadenas largas de deduccion.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de veracidad; como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en conocimiento factual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original de Baidu por si anaden terminos adicionales.
- Plataforma: el formato MLX limita su ejecucion a hardware Apple; no es directamente portable a CUDA sin reconversion.
- Idiomas soportados: no se detalla la lista oficial; el comportamiento observado sugiere ingles y chino como principales, sin garantias para otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/baa-ai/ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX
- Modelo base: https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-PT
- Sitio del autor (Black Sheep AI): https://baa.ai
- Producto Ram (capa de razonamiento): https://baa.ai/compression.html
- Producto Paddock (plano de conocimiento): https://baa.ai/paddock.html
- Producto Watchman (capa GRC): https://baa.ai/watchman.html
- Producto Shepherd (despliegue): https://baa.ai/shepherd.html
