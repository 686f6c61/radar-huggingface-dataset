# mojonk/yu-yu-hakusho-rvc

## Resumen

Yu Yu Hakusho voice models (RVC v2, 40k) es una coleccion de modelos de conversion de voz (voice conversion, no text-to-speech) entrenados con la tecnica Retrieval-based Voice Conversion (RVC) en su version 2, a una frecuencia de muestreo de 40 kHz. El autor, identificado en Hugging Face como `mojonk`, los entrena a partir del doblaje en ingles de la serie de animacion Yu Yu Hakusho, cubriendo 29 episodios. El repositorio, de 1,5 GB, se publico en noviembre de 2026 y contiene un archivo comprimido por personaje con los pesos del modelo (`.pth`) y su indice de caracteristicas (`.index`).

El problema que resuelve es acotado pero especifico: permitir convertir una locucion hablada (por ejemplo, una toma generada con un TTS como Chatterbox) a la timbrica de un personaje concreto de la serie, manteniendo el contenido linguistico y la prosodia del audio de entrada. No es un modelo de lenguaje ni un generador de texto: es un pipeline de voz-a-voz que se carga en RVC WebUI o en cualquier herramienta compatible con RVC v2.

Su relevancia es de nicho: sirve para doblaje aficionado, mods, videos fan y experimentos de clonacion de voz sobre personajes de ficcion. No hay datos publicados de benchmarks, pipeline declarado ni idiomas soportados en la metadata de Hugging Face, y las descargas y likes son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion), 40k; no es un transformer de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de voz, no de texto) |
| Tipos de cuantizacion | no disponible (pesos `.pth` en precision original) |
| Idiomas soportados | no disponible en la metadata; el dataset de entrenamiento es doblaje en ingles |
| Licencia | other |
| Formato de pesos | `.pth` (modelo) + `.index` (indice de caracteristicas), empaquetados en ZIP por personaje |

## Arquitectura y entrenamiento

Se trata de un conjunto de modelos RVC v2 a 40 kHz, una arquitectura de conversion de voz basada en representaciones auto-supervisadas (tipicamente HuBERT o ContentVec para extraer caracteristicas de contenido) combinada con un decoder generativo y un indice de recuperacion de caracteristicas (`.index`) que mejora la fidelidad timbrica durante la inferencia. El autor no detalla la arquitectura interna ni la funcion de perdida en la model card.

El entrenamiento se realizo en GPUs alquiladas en RunPod en noviembre de 2026, con el siguiente desglose por personaje: Yusuke (578 clips, 24,8 minutos, 250 epocas en RTX 4090), Kurama (387 clips, 17,9 minutos, 250 epocas en RTX 4090), Hiei (174 clips, 8,6 minutos, 250 epocas en RTX 4090) y Jin (87 clips, 2,7 minutos, 300 epocas en RTX 3090). El autor advierte que el dataset de Jin es pequeno y que su voz suena "un poco mas goofy" que la original; para su acento irlandes, la toma TTS de referencia se genero primero con un actor de acento irlandes y luego se convirtio con el modelo. No se menciona el uso de RLHF, DPO ni tecnicas de alineamiento, algo esperable en un modelo de voz.

## Capacidades

- Conversion de voz a voz (speech-to-speech) hacia la timbrica de un personaje concreto, preservando el contenido linguistico de la entrada.
- Ajuste de tono mediante el parametro `pitch` (configurado a 0 en los ajustes recomendados para dialogo).
- Control de la mezcla entre el indice de recuperacion y el decoder mediante `index rate` (0,75 recomendado) y `protect` (0,33 recomendado).
- Seguimiento de tono con RMVPE, el extractor de pitch recomendado por el autor para estos modelos.
- Uso sobre locuciones generadas por TTS: el autor indica que se han empleado tomas de Chatterbox TTS convertidas a cada voz.
- Cantar (singing) no esta probado segun la model card.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues: no documentadas; el entrenamiento es sobre doblaje en ingles.

## Casos de uso

- Doblaje aficionado de fan projects: convertir las lineas de un actor de doblaje o de un TTS a la voz de Yusuke, Kurama, Hiei o Jin para cortos animados o parodias, cargando el `.pth` y el `.index` en RVC WebUI.
- Mods de videojuegos: sustituir las voces de personajes en mods de PC o emuladores por las de la serie, usando el modelo como etapa de conversion sobre las lineas originales del juego.
- Creacion de contenido para redes: generar narraciones o sketches con la voz de un personaje a partir de un guion leido por el creador o sintetizado con Chatterbox TTS y convertido despues.
- Prototipado de personajes virtuales: integrar el modelo en un pipeline TTS + RVC para un VTuber o asistente de voz con la timbrica de un personaje de ficcion.
- Investigacion sobre clonacion de voz con pocos datos: los tamanos de dataset (desde 2,7 minutos para Jin hasta 24,8 minutos para Yusuke) permiten estudiar el efecto del volumen de datos y las epocas en la calidad de la conversion.
- Experimentos de estilo y acento: el caso de Jin documenta un flujo de trabajo para transferir un acento (irlandes) mediante una referencia TTS intermedia antes de la conversion, replicable para otros acentos.
- Restauracion o recreacion de escenas: convertir lineas nuevas a las voces clasicas para proyectos de preservacion o homenaje, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; los modelos RVC v2 de un solo hablante suelen ejecutarse en GPUs de consumo con pocos GB, pero no hay dato confirmado para este repositorio.
- GPU recomendadas: el autor entreno con RTX 4090 y RTX 3090; para inferencia no especifica requisitos.
- Cabe en GPU de consumo: previsiblemente si, dado el formato RVC v2, aunque no se confirma en la model card.
- Opciones de despliegue: RVC WebUI o cualquier herramienta compatible con RVC v2; requiere cargar conjuntamente el `.pth` y el `.index`.
- Latencia y throughput: no disponibles.
- Espacio en disco: el repositorio completo ocupa 1,5 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yu Yu Hakusho RVC (mojonk) | RVC v2, 40k, 4 personajes | no disponible | no aplica | other | Hugging Face |
| RVC v2 generico (proyecto RVC-Project) | RVC v2 | no disponible | no aplica | MIT (segun proyecto original) | GitHub / Hugging Face |
| Chatterbox TTS | TTS (texto a voz) | no disponible | no aplica | no disponible | no disponible |
| Modelos de voz de PixAI (tag Yu Yu Hakusho) | Modelos de arte, no de voz | no aplica | no aplica | no disponible | PixAI |

La comparativa es limitada porque no hay datos publicados de rendimiento ni de parametros para este repositorio. La diferencia principal frente a un RVC generico es que aqui los pesos ya estan entrenados sobre voces concretas de la serie, lo que evita tener que entrenar uno mismo; frente a Chatterbox TTS, la diferencia es de tarea (conversion de voz frente a sintesis desde texto).

## Limitaciones y advertencias

- Dataset pequeno por personaje, especialmente Jin (2,7 minutos), lo que el propio autor reconoce que degrada la similitud de la voz.
- Solo se ha probado sobre habla; el canto no esta validado.
- Entrenado exclusivamente con el doblaje en ingles; el comportamiento con otros idiomas o acentos no esta documentado.
- Riesgo de artefactos y perdida de naturalidad en entradas con ruido, prosodia atipica o registros alejados del dataset.
- La licencia es "other" y no se detallan sus terminos: no se puede asumir uso comercial sin consultar al autor.
- Las voces derivan de interpretaciones de actores reales y de una obra con derechos: existen riesgos legales y eticos por derechos de imagen, derechos de doblaje y propiedad intelectual de la serie.
- Riesgo de uso indebido para suplantacion de voz o deepfakes; no hay salvaguardas documentadas.
- Sin pipeline declarado, sin benchmarks y con cero descargas: la validacion por parte de la comunidad es nula por ahora.
- El autor anuncia que anadira mas personajes (Toguro, Sensui, Raizen, Narrador, Kuwabara, Genkai, Botan, Koenma, Keiko) cuando los entrene, por lo que la coleccion es incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/mojonk/yu-yu-hakusho-rvc
- Galeria de modelos Yu Yu Hakusho en PixAI (arte, no voz): https://pixai.art/en/tags/model/yu_yu_hakusho
