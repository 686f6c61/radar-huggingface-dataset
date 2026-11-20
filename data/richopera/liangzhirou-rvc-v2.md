# Richopera/LiangZhirou-rvc-v2

## Resumen

LiangZhirou-rvc-v2 es un modelo de conversión de voz (voice conversion) basado en la arquitectura RVC v2 (Retrieval-based Voice Conversion), entrenado con Applio y publicado por el usuario Richopera. Convierte una grabación vocal existente, ya sea habla o canto, en la voz del personaje Liang Zhirou (梁芷柔) del videojuego *Migrant*, interpretado en chino por la actriz de doblaje 酒儿. No es un modelo de texto a voz: requiere un audio de entrada con contenido vocal aislado y modifica su timbre.

El modelo emplea pesos preentrenados oficiales de RVC v2 a 40 kHz con vocoder HiFi-GAN, extracción de tono mediante RMVPE y características de contenido extraídas con ContentVec. El repositorio ocupa 2,2 GB e incluye 20 checkpoints (uno cada 10 épocas, de 10e a 200e) y dos índices de recuperación de características, uno completo de 1,04 GB y otro comprimido de 31,6 MB. Está pensado para *song covers* y doblaje de personaje en chino.

Su relevancia es acotada: se trata de un fine-tune de personaje, no de un modelo fundacional. Resulta útil para quien necesite una voz concreta en un pipeline de conversión vocal y trabaje con Applio, pero no aporta capacidades generales de generación ni de razonamiento. La licencia es personalizada (richopera-voice-model-license-v2.0) y conviene revisarla antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2, 40 kHz, vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | richopera-voice-model-license-v2.0 (etiquetada como "other") |
| Formato de pesos | checkpoints `.pth` (20 archivos, ~55 MB cada uno) e índices `.index` (completo 1,04 GB, comprimido 31,6 MB) |

## Arquitectura y entrenamiento

RVC v2 es una arquitectura de conversión de voz que separa el contenido lingüístico del timbre. Las características de contenido se extraen con ContentVec, el tono (F0) se estima con RMVPE y un decoder con vocoder HiFi-GAN a 40 kHz reconstruye la señal con el timbre objetivo. El modelo parte de los pesos preentrenados oficiales de RVC v2 y se ha afinado con la herramienta Applio.

El entrenamiento se realizó durante 200 épocas (87.200 pasos, batch size 8) sobre 1.820 archivos fuente que suman 110,9 minutos y 3.493 segmentos tras el troceado. La mayor parte del material proviene de diálogos del personaje; aproximadamente el 2 % de los segmentos corresponden a la canción temática del juego, cantada por 酒儿, lo que según el autor mejora el sostenimiento de notas largas y la fluidez en pasajes con melismas. La fecha de entrenamiento indicada es el 19 de septiembre de 2026 y la versión es la v1.0.0. El tono mediano del audio de entrenamiento es de 247 Hz, con percentiles 10 y 90 de 185 Hz y 364 Hz respectivamente.

## Capacidades

- Conversión de voz de habla a la voz de Liang Zhirou en chino.
- Conversión de canto (*singing voice conversion*), incluyendo notas sostenidas y vocal runs.
- Cambio de timbre preservando el contenido lingüístico y la melodía del audio de entrada.
- Ajuste de tono en semitonos para adaptar voces de distinta tesitura.
- Selección entre 20 checkpoints para equilibrar fidelidad y naturalidad según la fuente.
- Dos modos de índice de características: completo (mayor calidad) o comprimido (carga rápida, más artefactos).
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto.
- No es texto a voz: no acepta texto como entrada.

## Casos de uso

- **Song covers de aficionado:** extraer el stem vocal con UVR o MSST, convertir con un checkpoint como 200e o 150e, ajustar el tono en semitonos y mezclar con la instrumentación. El modelo está entrenado parcialmente con canto, lo que ayuda en notas largas.
- **Doblaje de personaje en proyectos derivados:** sustituir la voz de un actor por la de Liang Zhirou en mods o cortometrajes de fans, siempre que la licencia lo permita y se cuente con permiso del titular de los derechos.
- **Prototipado de voces para narrativa interactiva:** generar variantes de diálogo de un personaje concreto para maquetas de videojuego antes de contratar doblaje final.
- **Localización de contenido al chino con voz consistente:** aplicar una única identidad vocal a locuciones traducidas, manteniendo coherencia de personaje a lo largo de una serie de clips.
- **Investigación en conversión vocal:** servir como caso de estudio de fine-tune RVC v2 con proporción reducida de canto en el dataset y evaluar el efecto en la calidad de notas sostenidas.
- **Generación de material para comparativas de timbre:** usar los 20 checkpoints y los dos índices para estudiar el compromiso entre épocas, tamaño de índice y artefactos en transiciones.
- **Creación de contenido para comunidades de fans:** producir clips de audio con la voz del personaje para vídeos o podcasts no comerciales, respetando los términos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; RVC v2 a 40 kHz suele operar en el rango de pocos GB, pero no hay cifras publicadas para este modelo concreto.
- GPU recomendadas: no disponible. Al ser un modelo de conversión de voz de tamaño reducido (checkpoints de ~55 MB), es previsible que funcione en GPU de gama media, aunque no hay datos confirmados.
- Cabe en GPU de consumo: no disponible con cifras verificadas; el índice completo de 1,04 GB condiciona el uso de memoria y almacenamiento.
- Opciones de despliegue: Applio (WebUI oficial recomendada por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 2,2 GB; para inferencia basta con los checkpoints deseados y uno de los índices.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano / contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiangZhirou-rvc-v2 | RVC v2, conversión de voz y canto | 20 checkpoints de ~55 MB; índice 1,04 GB / 31,6 MB | zh | richopera-voice-model-license-v2.0 | Hugging Face (Richopera) |
| LiangZhirou-zh-gpt-sovits-v2proplus | GPT-SoVITS, texto a voz | no disponible | zh | no disponible | Hugging Face (Richopera) |
| Applio (base) | Framework RVC | no disponible | multilingüe según dataset | no disponible | GitHub (IAHispano) |

La comparación más directa es con el modelo GPT-SoVITS del mismo autor: aquel genera voz a partir de texto, mientras que este exige un audio de entrada. No se dispone de datos de benchmarks que permitan comparar calidad objetiva entre ambos.

## Limitaciones y advertencias

- Solo admite chino; no hay soporte multilingüe declarado.
- Requiere audio vocal aislado y seco: usar una mezcla con acompañamiento degrada el resultado.
- El índice comprimido puede introducir artefactos en vocal runs y transiciones; el completo exige más almacenamiento y memoria.
- El checkpoint final (200e) no es necesariamente el mejor para toda canción; hay que comparar por oído.
- Los desplazamientos extremos de tono degradan la calidad; el autor recomienda moverse en torno a ±1-2 semitonos respecto al valor probado.
- Riesgo de alucinación no aplica en el sentido textual, pero sí de artefactos y sonidos espurios en la señal convertida.
- Sesgos: la voz está limitada a un personaje y a una actriz concretos; puede reproducir características del material de entrenamiento (ruido, respiraciones, particularidades de dicción).
- Licencia personalizada (richopera-voice-model-license-v2.0): es imprescindible leer `LICENSE.md` antes de cualquier uso comercial o redistribución.
- Riesgo legal y ético por suplantación de voz y derechos del videojuego y de la actriz; se requiere consentimiento y cumplimiento normativo.
- Creado y actualizado en noviembre de 2026 según los metadatos; sin descargas ni likes en el momento de la consulta, por lo que no hay validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/LiangZhirou-rvc-v2
- Modelo GPT-SoVITS del mismo autor: https://huggingface.co/Richopera/LiangZhirou-zh-gpt-sovits-v2proplus
- Applio (software de entrenamiento e inferencia): https://github.com/IAHispano/Applio
- Página del videojuego *Migrant* en Steam: https://store.steampowered.com/app/1765350
- Ejemplo de audio, voces aisladas (Тонкий снег, −2): https://img.imgbed.dev/file/1795179207688_thin_snow_zhirou_minus2_vocals.m4a
- Ejemplo de audio, mezcla (Тонкий снег, −2): https://img.imgbed.dev/file/1795179206106_thin_snow_zhirou_minus2_mix.m4a
- Ejemplo de audio, voces aisladas (Riding a White Horse, −3): https://img.imgbed.dev/file/1795179193926_riding_a_white_horse_zhirou_minus3_vocals.m4a
- Ejemplo de audio, mezcla (Riding a White Horse, −3): https://img.imgbed.dev/file/1795179198577_riding_a_white_horse_zhirou_minus3_mix.m4a
- Ejemplo de audio, voces aisladas (Mom's Cooking, +8): https://img.imgbed.dev/file/1795179199520_moms_cooking_zhirou_plus8_vocals.m4a
- Ejemplo de audio, voces aisladas (Mom's Cooking, +9): https://img.imgbed.dev/file/1795179200739_moms_cooking_zhirou_plus9_vocals.m4a
- Ejemplo de audio, mezcla (Mom's Cooking, +8 y +9): https://img.imgbed.dev/file/1795179198692_moms_cooking_zhirou_mix.m4a
- Ejemplo de audio, voces aisladas (裂心, 0): https://img.imgbed.dev/file/1795179195142_lie_xin_zhirou_0_vocals.m4a
- Ejemplo de audio, mezcla (裂心, 0): https://img.imgbed.dev/file/1795179062203_lie_xin_zhirou_0_mix.m4a
- Ejemplo de audio, voces aisladas (她的梦, −2): https://img.imgbed.dev/file/1795179203851_ta_de_meng_zhirou_minus2_vocals.m4a
