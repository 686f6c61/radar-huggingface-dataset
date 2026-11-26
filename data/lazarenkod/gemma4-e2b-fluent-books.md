# lazarenkod/gemma4-e2b-fluent-books

## Resumen

Gemma 4 E2B Fluent Books es un ajuste fino mediante LoRA del modelo google/gemma-4-E2B-it, desarrollado por el usuario lazarenkod para el asistente integrado en la aplicacion de lectura Fluent Books, un lector de ingles dirigido a hablantes de ruso. El modelo resuelve tareas concretas de traduccion y comprension lectora: traduccion de frases en ingles a ruso, eleccion del sentido correcto de una palabra dentro de su contexto, explicacion breve de vocabulario o de gramatica, extraccion del sujeto y el verbo principal de una oracion larga y verificacion booleana de si una expresion aparece en una frase.

Tecnicamente, parte de la arquitectura Gemma 4 E2B (2.296.946.211 parametros totales), recorta el vocabulario de 262.144 a 40.000 tokens y se distribuye como un unico archivo GGUF cuantizado en Q4_K_M con matriz de importancia (imatrix), pensado para ejecutarse en llama.cpp sobre dispositivos con 8 GB de memoria o mas, consumiendo unos 520 MB en funcionamiento. El archivo pesa 1.350.381.280 bytes (unos 1,35 GB).

Su relevancia radica en el enfoque de producto: un modelo pequeno, cuantizado y de un solo archivo que la aplicacion descarga directamente, entrenado con prompts reales de la app y con un mecanismo de contexto de novela (las dos frases anteriores) para resolver ambiguedades que una sola oracion no permite, como el genero gramatical del hablante o del interlocutor. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B), ajuste fino LoRA, cuantizado a GGUF |
| Parametros totales | 2.296.946.211 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el autor no publica la ventana numerica; el prompt incluye un bloque de contexto con las dos frases anteriores) |
| Tipos de cuantizacion | Q4_K_M, con la tabla de embeddings por capa en Q3_K y matriz de importancia (imatrix) |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA del base google/gemma-4-E2B-it, con rango 32 y alpha 64 aplicados a las proyecciones de atencion y MLP de todas las capas. El vocabulario se recorto a los 40.000 tokens mas utiles, seleccionados por frecuencia sobre el conjunto de entrenamiento, texto de Project Gutenberg y Wikipedia en ingles y ruso, manteniendo la tokenizacion exacta de cada token conservado. El entrenamiento duro 2 epocas (6.306 pasos), con tasa de aprendizaje 1e-4, batch 16, perdida solo sobre la respuesta, precision bf16 y una GPU H200 durante aproximadamente 1,6 horas. El resultado se fusiono y cuantizo a Q4_K_M con imatrix.

El conjunto de entrenamiento consta de 50.444 ejemplos: 13.752 frases ordinarias EN→RU procedentes de novelas de dominio publico con traducciones generadas por agentes Claude Sonnet 5.5; 1.974 casos de genero, 1.644 de «you» dirigido a varias personas y 3.466 de nombres que son palabras; 7.352 expresiones reales y 1.982 falsas; 2.160 trampas de traduccion por tipo (pasiva, modal perfecto, inversion, cleft, clausula de participio, sujeto gerundio, modismos, falsos amigos); 6.292 pares alineados de traducciones humanas de dominio publico (Twain/Engelhardt, Swift/Frankovsky, Wells/Pimenova, Wells/Morozov, Haggard/Bekertova-Krasnova, London/Vershinina) alineados con LaBSE a confianza 0,70 o superior; 7.851 de eleccion de sentido de diccionario; 962 de explicacion de palabra, 728 de gramatica y 590 de esqueleto oracional; 1.183 de verificacion de expresion (0/1); y 550 pares sinteticos de contraste con dos contextos y dos traducciones que difieren en genero. De los ejemplos de traduccion, 9.793 incluyen el bloque de contexto con las dos frases anteriores. Se excluyeron fuentes de libros de texto, conjuntos de evaluacion, «The Picture of Dorian Gray» y los libros reservados del test de expresiones, verificando por coincidencia exacta y por solapamiento de 8 palabras.

## Capacidades

- Traduccion de frases del ingles al ruso, con soporte de un bloque de contexto de novela que aporta las dos frases anteriores para resolver genero y referencias.
- Eleccion del sentido de diccionario de una palabra dentro de su oracion, con salida JSON `{"ru": "...", "sense": N}`.
- Explicacion breve en ruso de una palabra o de un punto gramatical.
- Extraccion del sujeto y el verbo principal de una oracion larga.
- Verificacion booleana (salida "0"/"1") de si una expresion inglesa se usa en una oracion.
- Manejo de casos dificiles: genero del hablante y del interlocutor, «you» dirigido a varias personas, nombres propios que coinciden con palabras comunes, pasiva, modal perfecto, inversion, cleft, clausulas de participio, sujeto gerundio, modismos y falsos amigos.
- Formato de prompt Gemma 4 sin bloque de pensamiento (`<bos><|turn>system ... <turn|>` etc.), tal como lo envia la aplicacion.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente de lectura integrado en aplicacion movil: el modelo traduce al ruso la frase seleccionada por el usuario y aprovecha el bloque de contexto con las dos frases anteriores para decidir el genero del «yo» narrador o del «tu» interpelado; su tamano de 1,35 GB y consumo de unos 520 MB lo hacen viable en dispositivos con 8 GB de memoria.
- Diccionario contextual: dada una palabra y su oracion, devuelve el sentido correcto en JSON con el indice de acepcion, util para sustituir definiciones genericas por la acepcion que encaja en el texto leido.
- Explicacion de vocabulario y gramatica para estudiantes: genera una explicacion breve en ruso de una palabra o de una estructura gramatical, adecuada para un lector de nivel A2 que necesita aclaraciones puntuales sin salir de la app.
- Analisis sintactico ligero: extrae sujeto y verbo principal de oraciones largas para ayudar al lector a descomponer pasajes complejos de novela.
- Deteccion de expresiones idiomaticas: comprueba con salida binaria si una secuencia de palabras funciona como expresion en la oracion, lo que permite marcar modismos reales frente a falsos positivos.
- Traduccion por lotes de dominio publico: dado su entrenamiento con pares alineados de traducciones humanas de Gutenberg y Wikisource, puede emplearse para pretraducir fragmentos de narrativa clasica antes de la revision humana, siempre que se asuma su menor calidad en texto general (chrF++ 41,2 frente a 43,2 del base en WMT24++).
- Distribucion como archivo unico en llama.cpp: el formato GGUF Q4_K_M con SHA-256 publicado permite que la aplicacion descargue y verifique el modelo en el primer arranque, sin infraestructura de servidor.

## Benchmarks y rendimiento

Evaluacion con jueces ciegos sobre conjuntos propios del autor (3 de noviembre de 2026, el archivo tal como lo ejecuta la app). Recuento estricto: una traduccion es correcta solo si dos jueces ciegos coinciden.

| Prueba | Este modelo | Apple Translation | Qwen3.5-2B v3 (modelo anterior de la app) |
|---|---|---|---|
| 120 frases trampa (genero, «you», nombres, pasiva, modismos), de 120 | 115 | 112 | 103 |
| 223 trampas extendidas, de 223 | 185 | 149 | 166 |
| Traduccion de expresiones, de 100 | 87 | 76 | 78 |
| Eleccion de sentido de diccionario, de 462 | 386 | – | 377 |
| Comparacion por pares con Apple en 138 frases (modelo : Apple : empate) | 73 : 20 : 45 | – | 46 : 46 : 46 |
| Nombres que son palabras / «you» a varios / genero (de 40 cada uno) | 35 / 40 / 40 | 33 / 40 / 39 | 28 / 39 / 36 |

Contexto (60 pares con dos contextos que deciden la forma rusa; 20 pares por el sexo del «yo», el sexo del interlocutor y el genero de «it»): con el bloque de contexto el modelo acierta 39 pares en ambos contextos (19 / 11 / 9); sin el, 0. El Gemma 4 E2B base obtiene 32 con el bloque y el ajuste fino anterior de Fluent Books (sin contexto en su entrenamiento) 17. El conjunto es sintetico y pequeno; «it» es el tipo mas debil.

Texto general (WMT24++ ingles→ruso, 960 segmentos con postedicion profesional, fuera del dominio del modelo): chrF++ 41,2 (Gemma 4 E2B base 43,2); COMET (wmt22-comet-da) 0 (dato truncado en la model card).

## Requisitos de hardware

- Memoria: dispositivo con 8 GB de memoria o mas; unos 520 MB en funcionamiento durante la inferencia.
- Tamano del archivo: 1.350.381.280 bytes (Q4_K_M con embeddings por capa en Q3_K e imatrix).
- GPU: no se especifican modelos recomendados; el entrenamiento se realizo en una H200, pero la inferencia esta pensada para ejecucion local en llama.cpp.
- GPU de consumo: cabe en cualquier GPU de consumo con 8 GB o mas de VRAM, asi como en CPU y en dispositivos moviles con 8 GB de memoria, dado el tamano del archivo.
- Despliegue: llama.cpp; la aplicacion descarga el archivo unico y lo ejecuta localmente. No se documentan integraciones con vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B Fluent Books (este modelo) | 2.296.946.211 | no disponible | 115/120 trampas, 87/100 expresiones, 386/462 sentidos, chrF++ 41,2 en WMT24++ | Apache 2.0 | GGUF en Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible (familia E2B) | no disponible | 32 pares de contexto con bloque; chrF++ 43,2 en WMT24++ | Apache 2.0 | Hugging Face |
| Qwen3.5-2B v3 (ajuste fino anterior de la app) | no disponible | no disponible | 103/120 trampas, 78/100 expresiones, 377/462 sentidos | no disponible | no disponible |
| Apple Translation | no disponible (servicio del sistema) | no disponible | 112/120 trampas, 76/100 expresiones | propietaria | integrado en el sistema Apple |

## Limitaciones y advertencias

- El modelo esta especializado en el dominio de la app (traduccion de narrativa EN→RU y tareas de lectura); en texto general rinde peor que el base (chrF++ 41,2 frente a 43,2 en WMT24++).
- La evaluacion se realizo sobre conjuntos propios y pequenos, con jueces que son modelos de lenguaje y no evaluadores humanos; el conjunto de contexto es sintetico y el caso de «it» es el mas debil.
- Solo soporta ingles y ruso; no se documentan otros idiomas.
- El recorte de vocabulario a 40.000 tokens puede degradar el rendimiento en textos fuera del dominio cubierto por el vocabulario conservado.
- Riesgo de alucinacion en las tareas generativas (explicaciones de vocabulario y gramatica, esqueleto oracional), ya que las respuestas de entrenamiento para esas tareas proceden de agentes Claude Sonnet 5.5 sin verificacion humana documentada.
- La eleccion de sentido de diccionario y la verificacion de expresiones se entrenaron con respuestas en las que Gemma 4 26B-A4B y 31B coincidian con probabilidad 0,9 o superior, lo que hereda los sesgos de esos modelos.
- Licencia Apache 2.0 permite uso comercial, pero el copyright del modelo base es de Google; debe conservarse el aviso de licencia.
- El prompt debe respetar el formato Gemma 4 sin bloque de pensamiento tal como lo envia la app; otros formatos no estan validados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lazarenkod/gemma4-e2b-fluent-books
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
