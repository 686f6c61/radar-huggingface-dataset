# mojonk/king-of-the-hill-rvc

## Resumen

King of the Hill voice models es una colección de cinco modelos de conversión de voz (RVC v2, 40k) entrenados por el usuario mojonk a partir de episodios de la serie animada *King of the Hill*. Cada modelo reproduce la voz de un personaje distinto (Peggy Hill, Cotton Hill, Buck Strickland, Kahn Souphanousinphone y Minh Souphanousinphone) y se distribuye como un archivo `.pth` junto con su índice de características `.index`, pensado para cargarse en RVC WebUI o cualquier herramienta compatible con RVC v2.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es un conjunto de pesos de conversión de voz (voice-to-voice) de tipo RVC, una arquitectura de inferencia de voz basada en HuBERT/ContentVec para la extracción de características y un decoder tipo VITS, con un sample rate de 40 kHz. El repositorio ocupa 1,7 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia es acotada: sirve como ejemplo de fine-tuning de RVC sobre un corpus pequeño (entre 4,8 y 17,8 minutos por personaje) y de las decisiones prácticas de entrenamiento (epochs, selección de checkpoint por escucha, limitaciones de generalización). No hay información publicada sobre benchmarks, idiomas ni pipeline en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (conversion de voz, sample rate 40k) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de voz, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datasets son lineas de doblaje en ingles) |
| Licencia | other |
| Formato de pesos | `.pth` (modelo) + `.index` (indice de caracteristicas) |

## Arquitectura y entrenamiento

Cada uno de los cinco modelos es un checkpoint RVC v2 a 40 kHz, entrenado con la herramienta RVC WebUI sobre clips extraidos de episodios de la serie. El entrenamiento se realizo en GPUs alquiladas en RunPod entre octubre y noviembre de 2026: RTX 3090 para Peggy Hill y Cotton Hill, y RTX A4000 para Buck Strickland, Kahn Souphanousinphone y Minh Souphanousinphone. Los tamanos de dataset y las epochs varian por personaje:

| Personaje | Dataset | Entrenamiento | Checkpoint |
|---|---|---|---|
| Peggy Hill | 264 clips, 11,7 min | 300 epochs, RTX 3090 | e250 (elegido por escucha en canciones) |
| Cotton Hill | 392 clips, 17,8 min | 100 epochs, RTX 3090 | e100 |
| Buck Strickland | 215 lineas, 9,4 min | 250 epochs, RTX A4000 | e200 (mejor que e250 segun el autor) |
| Kahn Souphanousinphone | 449 lineas, 16,4 min | 250 epochs, RTX A4000 | e250 |
| Minh Souphanousinphone | 123 lineas, 4,8 min | 250 epochs, RTX A4000 | e250 |

La model card no detalla la composicion exacta del dataset (fuente de los clips, limpieza, separacion de voces) ni hiperparametros como batch size, learning rate o funcion de perdida. Tampoco indica si se aplico aumento de datos o filtrado de silencios. La seleccion de checkpoint se hizo de forma subjetiva ("picked by ear"), no mediante metricas objetivas.

## Capacidades

- Conversion de voz (voice-to-voice) de una fuente hablada o cantada hacia la voz del personaje entrenado.
- Peggy Hill: uso validado tanto en habla como en canto; el autor recomienda pitch 0 e index rate 0,95 como punto de partida para canciones.
- Cotton Hill, Buck Strickland, Kahn Souphanousinphone y Minh Souphanousinphone: entrenados para lineas habladas (TTS convertidos a cada voz); el canto no esta probado.
- Integracion con RVC WebUI y otras herramientas compatibles con RVC v2 cargando el `.pth` y el `.index`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni procesamiento de texto: es exclusivamente un modelo de audio.
- Capacidades multilingues: no documentadas; los datos de entrenamiento son lineas en ingles.

## Casos de uso

- Doblaje amateur y fan films: convertir la voz de un actor o de una sintesis TTS a la de un personaje concreto para escenas de parodia o proyectos no comerciales, cargando el `.pth` y el `.index` en RVC WebUI.
- Modding de videojuegos: sustituir lineas de audio de personajes en mods de PC o emuladores, usando los modelos de habla (Cotton, Buck, Kahn, Minh) para dialogos y el de Peggy para canciones.
- Produccion de contenido para redes: generar voces de personaje para sketches, podcasts o videos cortos, con la advertencia de que la calidad depende de la limpieza del audio de entrada.
- Investigacion sobre clonacion de voz con pocos datos: los tamanos de dataset (4,8 a 17,8 minutos) permiten estudiar el efecto del numero de clips y epochs en la calidad percibida, replicando la seleccion de checkpoint por escucha.
- Pruebas de pipeline RVC: validar la carga de `.pth` + `.index`, el ajuste de pitch y el index rate en distintas herramientas compatibles antes de entrenar modelos propios.
- Demostraciones educativas de conversion de voz: ilustrar el funcionamiento de RVC v2 con personajes reconocibles en talleres o clases, siempre con material no comercial y respetando los derechos de la serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye valoraciones subjetivas del autor sobre la calidad percibida (por ejemplo, que Buck Strickland con e200 "sonaba mejor" que con e250) y advertencias cualitativas sobre la perdida de consonantes finales en Cotton Hill.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el repositorio pesa 1,7 GB, lo que sugiere que la inferencia cabe en GPUs de consumo, pero no hay cifras oficiales.
- GPU de entrenamiento documentadas: RTX 3090 (24 GB) y RTX A4000 (16 GB), alquiladas en RunPod.
- GPU recomendadas para inferencia: no especificadas; por el tipo de modelo (RVC v2) es habitual que funcione en GPUs consumer, pero no se confirma en la informacion disponible.
- Opciones de despliegue: RVC WebUI y "cualquier herramienta RVC v2" segun el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Sample rate | Epochs | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| King of the Hill voice models (mojonk) | RVC v2 | 40k | 100-300 | 4,8-17,8 min por personaje | other | Hugging Face |
| Hank Hill - Mike Judge (voice-models.com) | RVC v2 | 48k | 1200 | no disponible | no disponible | voice-models.com / EasyAIVoice |

La busqueda web solo devuelve un modelo comparable (la voz de Hank Hill en voice-models.com), del que no se detallan parametros, licencia ni composicion del dataset. No hay informacion suficiente para comparar rendimiento objetivo entre ambos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un unico personaje de ficcion, la voz resultante puede no generalizar fuera del dominio de la serie.
- Riesgo de artefactos: el autor advierte que en Cotton Hill se pierden consonantes duras al final de las palabras y que el canto no esta probado en Cotton, Buck, Kahn ni Minh.
- Contaminacion del dataset: el dataset de Minh puede incluir algo de Connie (misma actriz de doblaje), lo que puede filtrar rasgos de otra voz.
- Licencia "other": no se especifican los terminos; es imprescindible revisar las condiciones antes de cualquier uso comercial. Ademas, las voces derivan de una serie con derechos de autor, lo que restringe el uso comercial y la distribucion.
- Idiomas: no documentados; los datos son lineas en ingles, por lo que el rendimiento en otros idiomas no esta validado.
- Seleccion de checkpoint subjetiva: los checkpoints se eligieron por escucha, sin metricas objetivas, lo que limita la reproducibilidad.
- Sin benchmarks ni evaluacion formal: no hay datos de calidad objetiva (MOS, similitud de hablante) en la informacion disponible.
- Repositorio sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mojonk/king-of-the-hill-rvc
- Modelo comparable (Hank Hill, RVC v2, 1200 epochs, RMVPE, 48k): https://voice-models.com/model/1lX884Hqc7V
