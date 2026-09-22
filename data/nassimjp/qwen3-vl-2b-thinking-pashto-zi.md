# nassimjp/Qwen3-VL-2B-Thinking-Pashto-Zi

## Resumen

Qwen3-VL-2B-Thinking-Pashto-Zi es una adaptacion del modelo multimodal Qwen/Qwen3-VL-2B-Thinking publicada por el usuario nassimjp en HuggingFace. No se trata de un fine-tuning de conocimiento ni de instrucciones: es una intervencion sobre el tokenizador y la matriz de embeddings (lo que el autor denomina token surgery) que anade 31 tokens nuevos al vocabulario original para cubrir caracteres del alfabeto arabe extendido que el tokenizador de Qwen partia en fragmentos de bytes. Entre los caracteres anadidos hay letras especificas del sindhi y del balochi, los diez digitos arabe-indicos orientales (۰-۹), controles bidi y varias harakat.

El punto de partida, Qwen3-VL-2B-Thinking, es un modelo vision-lenguaje de la familia Qwen3-VL con modo de razonamiento explicito (thinking) y una torre de vision que no esta indexada por vocabulario. La extension afecta unicamente al embedding del modelo de lenguaje: el vocabulario pasa de 151.669 a 151.700 entradas, con vectores de embedding de 2048 dimensiones inicializados de forma independiente con rango 0.02. Las embeddings de entrada y salida comparten almacenamiento (tied embeddings) y la torre de vision se deja intacta.

La relevancia de esta ficha es doble. Por un lado, documenta un caso practico de cirugia de tokenizador para lenguas de bajos recursos escritas en arabe extendido (pastun, sindhi, balochi, urdu, persa), donde la fragmentacion de caracteres encarece cada secuencia. Por otro, es un ejemplo de repositorio experimental: cero descargas, cero likes, sin benchmarks publicados y sin validacion independiente en el momento de redactar esta ficha, por lo que debe tratarse como material de investigacion y no como un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3-VL: torre de vision mas decoder causal de lenguaje, con modo thinking |
| Parametros totales | 2.127.048.704 (2,13 mil millones), segun los pesos safetensors del repositorio |
| Parametros activos | No aplica: los datos disponibles no indican que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors (transformers) y no incluye variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Pastun (پښتو), urdu (اردو), persa (فارسی), sindhi (سنڌي) y balochi (بلوچی) en lo que respecta a la extension del tokenizador; el modelo base es multilingue pero no se detalla la lista completa |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, arquitectura qwen3_vl) |
| Tamano del vocabulario | 151.700 entradas (151.669 originales mas 31 nuevas, IDs 151669-151699) |
| Dimension de embedding | 2048 |
| Embeddings atados | Si: entrada y salida comparten almacenamiento |
| Tamano del repositorio | 4,3 GB |
| Fecha de publicacion | 2026-09-22 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-VL-2B-Thinking: un transformer multimodal con una torre de vision para entrada de imagen y un decoder causal de lenguaje con modo de razonamiento explicito. El autor no modifica ninguno de los componentes preentrenados salvo la matriz de embeddings del lenguaje. La torre de vision no esta indexada por vocabulario, por lo que no se toca. El model card indica explicitamente que no hay entrenamiento adicional: los 31 tokens nuevos reciben filas de embedding independientes inicializadas aleatoriamente con rango de inicializacion 0.02, en lugar de copiar o promediar filas existentes. La matriz original tenia forma (151936, 2048) y tras el redimensionado pasa a (151700, 2048), manteniendo el atado entre embeddings de entrada y de salida.

La innovacion tecnica es la propia auditoria del tokenizador. Se auditaron 175 atomos unicos (181 entradas con duplicados intencionales) del alfabeto arabe extendido: 144 ya eran tokens unicos en Qwen3-VL y 31 se partian en pares de bytes de reserva. Para justificar la intervencion, el autor compara con LiquidAI/LFM2.5-2.6B, donde la misma operacion requirio 56 tokens nuevos porque su tokenizador cubria menos caracteres. La verificacion forense incluida en el model card afirma que no hay filas de embedding duplicadas (la similitud coseno maxima entre pares de embeddings nuevos es 0,075313299894, correspondiente al par ۲ y ٔ), que no hay corrupcion de indices y que el modelo y el tokenizador se guardaron correctamente. La distribucion de las filas nuevas (media 0,0000779270; desviacion tipica 0,0200125575; norma media 0,90553617) es mas estrecha que la del vocabulario original (media -0,0000267930; desviacion tipica 0,0322032236; norma media 1,43841958), una decision deliberada para que un preentrenamiento continuado las integre en la distribucion preexistente. No hay RLHF, DPO ni ninguna fase de ajuste con preferencias documentada en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento paso a paso en modo thinking, heredados del modelo base Qwen3-VL-2B-Thinking.
- Comprension de imagen y texto conjuntamente (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas sobre imagenes y lectura de documentos visuales.
- Tokenizacion de un solo token para caracteres previamente fragmentados: ٽ, ڇ, ڏ, ڙ, ڦ, ڻ, ۏ y los diez digitos arabe-indicos orientales.
- Manejo explicito de controles bidi (U+200D, U+200F, U+202A-U+202E) y de harakat adicionales (IDs 151694-151699), util para texto arabe con direccionalidad mixta.
- Cobertura multilingue centrada en lenguas de escritura arabe extendida: pastun, sindhi, balochi, urdu y persa.
- Soporte conversacional multi-turno segun las etiquetas del repositorio (conversational).
- Compatibilidad con endpoints de HuggingFace (etiqueta endpoints_compatible).
- No se documenta soporte de tool calling, function calling ni uso agentico especifico en la informacion proporcionada; tampoco capacidades de audio.

## Casos de uso

- Preprocesado de corpus en pastun y sindhi: el tokenizador extendido convierte caracteres que antes se partian en dos o mas fragmentos de bytes en un unico token, lo que reduce la longitud de secuencia efectiva en corpus que contienen ٽ, ڇ, ڏ, ڙ, ڦ, ڻ o ۏ. Es util en pipelines de indexacion, busqueda y analisis morfologico sobre lenguas de bajos recursos.
- Digitalizacion de documentos con OCR multimodal: al combinar torre de vision y decoder, el modelo puede procesar formularios, actas o documentos escaneados en escritura arabe extendida; los diez digitos arabe-indicos con token propio evitan la fragmentacion de cifras en tablas y campos numericos.
- Normalizacion de texto RTL: los tokens de control bidi y las harakat anadidas permiten tratar explicitamente la direccionalidad y la vocalizacion en herramientas de edicion o conversion de formatos para texto arabe, en lugar de depender de secuencias de bytes de reserva.
- Investigacion sobre eficiencia de tokenizadores: el repositorio sirve como caso de estudio reproducible para medir la tasa de compresion (caracteres por token) antes y despues de la cirugia, y para comparar la cobertura de Qwen3-VL frente a otros tokenizadores como el de LFM2.5.
- Asistente conversacional en pastun con razonamiento visible: el modo thinking permite generar cadenas de razonamiento antes de la respuesta final, util en tutoria o asistencia tecnica en lenguas con pocos recursos, siempre que se asuma la limitacion de los embeddings sin entrenar.
- Traduccion asistida pastun-urdu-persa: al compartir escritura arabe extendida sobre un vocabulario comun, el modelo puede emplearse como base para prototipos de traduccion con contexto visual (por ejemplo, traducir el texto de una imagen o un cartel).
- Punto de partida para preentrenamiento continuado: dado que los nuevos embeddings estan inicializados pero no entrenados, el repositorio es un punto de partida razonable para un continued pretraining sobre corpus pastun, sindhi o balochi antes de cualquier despliegue real.
- Clasificacion y moderacion de contenido en lenguas de bajos recursos: el modelo puede ajustarse posteriormente para tareas de etiquetado de texto donde la tokenizacion fragmentada degradaba la calidad de las representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y la busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo (los resultados obtenidos correspondian a portales administrativos sin relacion con el repositorio). El unico dato cuantitativo de rendimiento disponible es interno a la cirugia del tokenizador: la auditoria de 175 atomos unicos, de los cuales 144 ya eran tokens unicos y 31 requerían entrada nueva.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16 o float16: aproximadamente 4,3 GB solo para los pesos (2,127 mil millones de parametros a 2 bytes), mas activaciones, cache KV y la torre de vision. En la practica, entre 6 y 8 GB para contexto corto o moderado.
- VRAM estimada con cuantizacion de 8 bits: en torno a 2,3 GB de pesos. Con cuantizacion de 4 bits: en torno a 1,3 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor, ya que el repositorio no incluye variantes cuantizadas.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bfloat16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Para servicio con lotes grandes o contexto largo, A100 40/80 GB o H100.
- Cabe en GPU de consumo: si. Con 8 GB de VRAM se puede ejecutar en bfloat16 con contexto moderado; con 6 GB es necesario cuantizar.
- Opciones de despliegue: transformers es la via soportada de forma nativa (library_name: transformers, arquitectura qwen3_vl). Para servidores de alto rendimiento, vLLM o TGI si soportan la arquitectura qwen3_vl en la version instalada. Ollama y llama.cpp requieren una conversion a GGUF que el repositorio no proporciona.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni en el model card ni en fuentes externas localizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modo thinking | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| nassimjp/Qwen3-VL-2B-Thinking-Pashto-Zi | 2,13 B | No disponible | Si (heredado) | Apache-2.0 | safetensors | Vocabulario extendido a 151.700 entradas; 31 tokens nuevos para arabe extendido |
| Qwen/Qwen3-VL-2B-Thinking (modelo base) | No disponible en la informacion proporcionada | No disponible | Si | Apache-2.0 | safetensors | Vocabulario original de 151.669 entradas; sin los 31 caracteres adicionales |
| LiquidAI/LFM2.5-2.6B | 2,6 B (segun el model card del repositorio) | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | La misma cirugia requirio 56 tokens nuevos, frente a 31 en Qwen3-VL, por menor cobertura inicial del arabe extendido |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas. La comparacion se limita a cobertura de tokenizador, licencia y disponibilidad.

## Limitaciones y advertencias

- Los 31 embeddings nuevos estan inicializados aleatoriamente (rango 0.02) y no han sido entrenados. El modelo no ha aprendido ninguna representacion para esos tokens, de modo que el comportamiento sobre ellos puede ser peor o equivalente al del byte-fallback original hasta que se realice un preentrenamiento continuado.
- No es un fine-tuning de instrucciones ni de conocimiento: no mejora la comprension del pastun, el sindhi o el balochi mas alla del plano de la tokenizacion.
- Discrepancia de datos a verificar: el model card declara un vocabulario original de 151.669 entradas, pero la forma de la matriz de embeddings original era (151936, 2048). El primer ID nuevo asignado es 151669, lo que sugiere que la matriz tenia 151.936 filas. Conviene comprobar el tokenizador antes de integrarlo en produccion.
- Ausencia total de validacion: cero descargas y cero likes en el momento de redactar la ficha, sin benchmarks, sin evaluacion de terceros y con creacion y ultima actualizacion el mismo dia (2026-09-22).
- Riesgo de alucinacion y sesgos inheridos del modelo base Qwen3-VL-2B-Thinking, sobre el que no se ha aplicado ningun ajuste de alineacion adicional.
- Longitud de contexto no documentada en la informacion disponible; no se puede garantizar el comportamiento en secuencias largas.
- La licencia Apache-2.0 permite uso comercial, pero obliga a conservar los avisos de copyright y atribucion del modelo base. Al derivar de Qwen3-VL-2B-Thinking, conviene revisar tambien las condiciones del repositorio original de Qwen.
- El repositorio solo publica safetensors: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos de bajos recursos sin conversion manual.
- No se documenta soporte de tool calling ni de flujos agenticos; cualquier uso en ese sentido requeriria validacion propia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/nassimjp/Qwen3-VL-2B-Thinking-Pashto-Zi
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Thinking
- Modelo de referencia para la comparacion de tokenizadores citado en el model card: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Paper, blog o demo especificos de esta adaptacion: no disponibles en la informacion proporcionada.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los enlaces obtenidos correspondian a portales administrativos ajenos al proyecto.
