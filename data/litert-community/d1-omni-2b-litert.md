# litert-community/d1-Omni-2B-LiteRT

## Resumen

d1-Omni-2B-LiteRT es la conversion a LiteRT del modelo d1-Omni-2B de Liquid AI, un modelo de decision multimodal que procesa texto, imagenes y audio. A diferencia de los modelos generativos convencionales, no produce tokens de salida: recibe un estado (cadena, valor JSON o nada), medios (imagenes y clips de audio) y una o varias preguntas con nombre, y devuelve respuestas tipadas con sus probabilidades en un unico forward pass. Entre los tipos de respuesta que soporta estan si/no (`noul`), eleccion entre opciones (`choice`), niveles ordenados (`score`), texto, numeros o fechas con su span, estimaciones con intervalo y deteccion de objetos (`box`, `boxes`).

El modelo base, LiquidAI/d1-Omni-2B, se construye sobre LFM3-Omni-2B y sigue la interfaz `system_one()` y `system_one_batch()` del proveedor. Esta version LiteRT esta pensada para ejecucion on-device: incluye grafos de decision en formato TFLite para secuencias de hasta 128, 256, 512, 1.024, 2.048, 4.096 y 6.144 tokens, un grafo que procesa ocho secuencias de hasta 128 tokens en una sola llamada, y un fichero que agrupa los ocho grafos sobre una unica copia de los pesos. Cuatro de los grafos de decision estan compilados ahead-of-time para la NPU del Qualcomm SM8850 (Galaxy S26).

La relevancia de este repositorio radica en su enfoque de despliegue: no requiere PyTorch en el host, incluye un host en Python para escritorio, siete ficheros de torre para convertir imagenes en tokens (uno por forma de lienzo) y cuatro ficheros de audio para clips de hasta 504, 1.000, 2.000 y 3.000 frames de caracteristicas. Las latencias medidas son de 89,0 ms para una pregunta sobre un clip de audio de 10 segundos en un Apple M4 Max con Metal a float32, y de 67,0 ms por llamada de grafo en la NPU de un Galaxy S26.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LFM3-Omni-2B; conversion a LiteRT con grafos TFLite) |
| Parametros totales | 2B (segun nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 6.144 tokens (grafo maximo); grafos para 128, 256, 512, 1.024, 2.048, 4.096 y 6.144 tokens |
| Tipos de cuantizacion | fp16fc (fully connected en fp16); atencion en bloques de consulta de 1.024 para los grafos de 4.096 y 6.144 tokens |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (licencia personalizada, `license: other`) |
| Formato de pesos | TFLite (LiteRT), con tokenizer, tabla de embeddings y scripts de conversion incluidos |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base LiquidAI/d1-Omni-2B, construido sobre LFM3-Omni-2B de Liquid AI. Se trata de un modelo de decision multimodal que no genera tokens de forma autoregresiva: en su lugar, realiza un unico forward pass que produce respuestas tipadas con probabilidades. El grafo de decision recibe los embeddings de los tokens de una secuencia y dos tablas pequenas que indican que posiciones ven a cuales, y devuelve los hidden states tras la normalizacion final. Los pesos de las capas fully connected estan en fp16, mientras que los grafos de mayor longitud (4.096 y 6.144 tokens) emplean atencion en bloques de consulta de 1.024.

La conversion se realizo con litert-torch 0.10.0 para la API CompiledModel de ai-edge-litert 2.3.0. El repositorio incluye el tokenizer, la tabla de embeddings, fixtures de test y los scripts de conversion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La validacion se realizo contra el codigo del proveedor en float32 sobre CPU como referencia: los ficheros superaron todas las comprobaciones en 523 peticiones de texto e imagen y 67 peticiones de audio, con probabilidades dentro de 1,32e-5 de la referencia en texto e imagenes y dentro de 0,000198 con audio.

## Capacidades

- Procesamiento multimodal de texto, imagenes y audio en un unico modelo.
- Respuestas tipadas con probabilidades: si/no (`noul`), eleccion entre opciones (`choice`), nivel ordenado (`score`), texto, numero o fecha con span (`text`, `number`, `date`), estimacion con intervalo (`number` con `range`) y deteccion de objetos (`box`, `boxes`).
- Procesamiento de multiples preguntas con nombre en una sola llamada, tanto escritas como habladas.
- Procesamiento por lotes: grafo para ocho secuencias de hasta 128 tokens en una sola llamada.
- Ejecucion on-device sin PyTorch, con host en Python para escritorio.
- Aceleracion por NPU en Qualcomm SM8850 (Galaxy S26) con grafos compilados ahead-of-time.
- Aceleracion por GPU Metal en Apple M4 Max a precision float32.
- No genera tokens de salida: las respuestas se leen directamente de las probabilidades del forward pass.

## Casos de uso

- Clasificacion de audio en tiempo real: el modelo puede responder preguntas como "¿hay alguien hablando en esta grabacion?" o "¿cuantos pitidos hay?" sobre clips de hasta 10 segundos con latencias de 89,0 ms en Apple M4 Max, adecuado para aplicaciones de monitorizacion continua.
- Deteccion de objetos en imagenes: mediante las respuestas tipo `box` y `boxes`, el modelo puede localizar uno o todos los objetos de una imagen, util para sistemas de vision embebidos en dispositivos moviles.
- Extraccion estructurada de datos: el modelo puede leer texto, numeros o fechas de un estado JSON y devolver el valor con su span, lo que facilita la conversion de documentos no estructurados en datos tabulares.
- Decisiones binarias automatizadas: con respuestas tipo `noul` y sus probabilidades asociadas, el modelo puede integrarse en pipelines de decision donde se requiera un umbral de confianza calibrado.
- Estimaciones con intervalo: la capacidad de devolver un numero con un rango (por ejemplo, "entre 3 y 4 pitidos") permite cuantificar incertidumbre en tareas de conteo o medicion.
- Asistencia en dispositivos moviles: al ejecutarse en la NPU del Qualcomm SM8850 con 67,0 ms por llamada de grafo, el modelo puede habilitar asistentes locales que respondan a preguntas sobre audio e imagen sin conexion a la nube.
- Procesamiento por lotes en servidor: el grafo de ocho secuencias de hasta 128 tokens permite procesar multiples peticiones cortas en una sola llamada, adecuado para servicios de clasificacion de alta concurrencia.
- Analisis de tickets de soporte: segun la model card, el modelo puede procesar el ticket de soporte del modelo base en 40,9 ms, lo que sugiere su uso en sistemas de triaje automatico de incidencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento proporcionados son mediciones de latencia y validacion numerica contra el modelo de referencia:

| Medicion | Valor |
|---|---|
| Latencia, audio de 10 s, Apple M4 Max Metal float32 | 89,0 ms (mediana) |
| Latencia, ticket de soporte, Apple M4 Max Metal float32 | 40,9 ms (mediana) |
| Latencia, una pregunta, NPU Qualcomm SM8850 (Galaxy S26) | 67,0 ms |
| Latencia, una pregunta, GPU Pixel 11 Pro float32 | 733,6 ms |
| Diferencia maxima vs. referencia, texto e imagenes | 1,32e-5 |
| Diferencia maxima vs. referencia, audio | 0,000198 |
| Diferencia maxima en P(yes), ejemplo de pitidos | 8,6e-7 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los ficheros de decision ocupan entre 2,93 GB y 2,96 GB cada uno, y el fichero multi-grafo 2,99 GB. La torre de imagen ocupa 377,9 MB. El repositorio completo ocupa 42,7 GB.
- GPU recomendadas: Apple M4 Max (Metal, float32) para escritorio; Qualcomm SM8850 (NPU, Galaxy S26) para movil; Pixel 11 Pro (GPU, float32) como alternativa mas lenta.
- Compatibilidad con consumer GPU: no se especifica, pero los ficheros de ~3 GB por grafo son manejables en GPUs de consumo con suficiente memoria.
- Opciones de despliegue: LiteRT (ai-edge-litert 2.3.0) con la API CompiledModel; host en Python para escritorio sin PyTorch; ejecucion en Android mediante LiteRT 2.2.0.
- Latencia: 89,0 ms para una pregunta sobre audio de 10 s en M4 Max; 40,9 ms para el ticket de soporte; 67,0 ms en NPU SM8850; 733,6 ms en GPU Pixel 11 Pro.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-Omni-2B-LiteRT | 2B | Hasta 6.144 tokens | Texto, imagen, audio | lfm1.0 | LiteRT, on-device |
| LiquidAI/d1-Omni-2B | 2B | No disponible | Texto, imagen, audio | lfm1.0 | Pesos originales (PyTorch) |
| litert-community/d1-2B-LiteRT | 2B | No disponible | Texto | lfm1.0 | LiteRT, on-device |

No se dispone de informacion sobre modelos comparables de otros proveedores en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no genera tokens de salida: solo produce respuestas tipadas con probabilidades, lo que limita su uso a tareas de decision y clasificacion, no a generacion de texto libre.
- La licencia lfm1.0 es personalizada (`license: other`), por lo que se deben revisar los terminos exactos antes de cualquier uso comercial.
- No se dispone de informacion sobre los idiomas soportados, lo que impide garantizar un rendimiento multilingue.
- No se han publicado benchmarks estandar, por lo que no es posible comparar su rendimiento con otros modelos en tareas convencionales.
- La validacion se realizo contra el codigo del proveedor en float32 sobre CPU; las diferencias con audio son mayores (hasta 0,000198) que con texto e imagenes.
- El modelo base es una version cuantizada de LiquidAI/d1-Omni-2B, lo que puede introducir perdidas de precision adicionales.
- La ejecucion en NPU esta limitada al Qualcomm SM8850 (Galaxy S26) con grafos compilados especificamente; otros dispositivos requeriran los grafos genericos.
- El repositorio ocupa 42,7 GB, lo que puede ser un obstaculo para su descarga y despliegue en entornos con almacenamiento limitado.
- No se dispone de informacion sobre sesgos conocidos ni riesgo de alucinacion en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/d1-Omni-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Modelo LFM3-Omni-2B: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Blog post de Liquid AI: https://www.liquid.ai/blog/open-d1
- Version LiteRT de d1-2B: https://huggingface.co/litert-community/d1-2B-LiteRT
- Licencia: LICENSE (incluida en el repositorio)
