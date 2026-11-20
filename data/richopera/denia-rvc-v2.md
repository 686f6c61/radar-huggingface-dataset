# Richopera/Denia-rvc-v2

## Resumen

Denia-rvc-v2 es un modelo de conversión de voz (voice conversion) basado en la arquitectura RVC v2 (Retrieval-based Voice Conversion), entrenado por el usuario Richopera mediante la herramienta Applio. Convierte grabaciones vocales existentes —canto o habla— al timbre del personaje Denia (达妮娅) del videojuego *Wuthering Waves*, con la voz en chino de la actriz 戈昕宇. No es un modelo texto-a-voz: requiere un audio de entrada y transforma su timbre, no genera voz desde texto.

El modelo se distribuye como un fine-tune del checkpoint base IAHispano/Applio, con pesos RVC v2 a 40 kHz y vocoder HiFi-GAN, extracción de tono mediante RMVPE y características de contenido ContentVec. El repositorio ocupa 1,6 GB e incluye 20 checkpoints (uno cada 10 épocas, de 10e a 200e) junto con un índice de recuperación de características de 487 MB y 154.306 frames.

Es relevante en el nicho de conversión de voz para doblaje, covers musicales y experimentación con personajes, un ámbito donde los modelos RVC siguen siendo el estándar de facto por su bajo coste de entrenamiento (unas 3 horas en una RTX 4090) y su inferencia ligera. Su licencia personalizada restringe el uso comercial y la redistribución de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2, 40 kHz, vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo audio-audio, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | Richopera Voice Model License v2.0 (uso personal no comercial) |
| Formato de pesos | .pth (checkpoints RVC) + .index (índice de recuperación) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RVC v2, un sistema de conversión de voz que combina un extractor de características de contenido (ContentVec), un extractor de tono (RMVPE) y un decoder con vocoder HiFi-GAN a 40 kHz. Sobre los pesos preentrenados oficiales de RVC v2, se realizó un fine-tune con la herramienta Applio. El índice `Denia.index` contiene 154.306 frames y permite la recuperación de características para mejorar la fidelidad del timbre objetivo.

El entrenamiento se ejecutó durante 200 épocas, 42.200 pasos, con batch size 8, en una instancia UCloud con RTX 4090 (24 GB), AMD EPYC de 16 vCPUs y 62 GB de RAM, con una duración aproximada de 3 horas y 11 minutos y un `loss_gen` final de 33,584. El dataset se compuso de 548 archivos fuente (59,1 minutos) extraídos de diálogos de historia, líneas de combate y perfiles de personaje del juego, excluyendo clips con reverberación excesiva, y se segmentó en 1.675 fragmentos. Los datos son exclusivamente de habla, por lo que el rendimiento en canto depende del modelo base RVC v2. El tono mediano del audio de entrenamiento fue de 252 Hz (percentiles 10 y 90: 197 Hz y 365 Hz).

## Capacidades

- Conversión de voz audio-a-audio: transforma el timbre de una grabación vocal al de Denia, tanto en habla como en canto.
- Conversión de voz cantada con ajuste de tono en semitonos (pitch shift) para adaptar voces masculinas o femeninas al registro objetivo.
- Extracción de tono mediante RMVPE, robusta en voces cantadas y con vibrato.
- Uso de índice de recuperación de características para mejorar la similitud del timbre.
- Soporte de audio largo mediante la opción Split Audio de Applio.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto.
- No es un modelo texto-a-voz: no genera voz desde texto.
- Capacidad multilingüe limitada: el modelo está entrenado sobre voz en chino; la conversión de timbre es independiente del idioma de entrada en la práctica, pero no se documenta soporte explícito para otros idiomas.

## Casos de uso

- Covers musicales de carácter personal: se toma una pista vocal aislada, se separa con UVR o MSST y se convierte al timbre de Denia ajustando el pitch en semitonos según el registro de la canción. El modelo está pensado exactamente para este flujo.
- Doblaje amateur de contenido del juego: conversión de líneas de voz propias a la voz del personaje para vídeos de fans, con la advertencia de que la licencia solo permite uso no comercial con atribución.
- Experimentación con voces de personaje en investigación de TTS/VC: sirve como caso de estudio de fine-tune RVC v2 sobre un dataset pequeño (59 minutos) y su impacto en la calidad.
- Creación de demos y prototipos de audio para proyectos personales: la inferencia es ligera y cabe en GPU de consumo, lo que permite iterar rápidamente entre checkpoints (200e, 150e, 100e, 120e).
- Comparación de checkpoints y ajuste de parámetros: el repositorio incluye 20 checkpoints para evaluar el compromiso entre sobreajuste y fidelidad, útil para estudiar dinámicas de entrenamiento en RVC.
- Producción de contenido para comunidades de fans del juego: clips de audio cortos con acompañamiento añadido después de la conversión, respetando la licencia no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; los modelos RVC v2 de este tamaño suelen ejecutarse con pocos GB de VRAM, pero no se documenta una cifra concreta.
- GPU recomendadas: el entrenamiento se realizó en una RTX 4090 (24 GB); para inferencia se espera que GPU de consumo sean suficientes, aunque no se especifica.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 y modelos inferiores, si bien no hay datos oficiales de VRAM mínima.
- Opciones de despliegue: Applio (flujo documentado por el autor), con extracción de pitch RMVPE y selección de checkpoint e índice. No se documentan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El entrenamiento completo tardó unas 3 horas y 11 minutos en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano repo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Denia-rvc-v2 (este) | RVC v2, conversión de voz | 1,6 GB | no aplica | Richopera Voice Model License v2.0 (no comercial) | Hugging Face |
| Denia-gpt-sovits-v2proplus | GPT-SoVITS, texto-a-voz | no disponible | no aplica | no disponible | Hugging Face (Richopera) |
| IAHispano/Applio (base) | RVC v2 base | no disponible | no aplica | no disponible | Hugging Face |

La comparación más directa es con el modelo GPT-SoVITS del mismo autor, que cubre la tarea complementaria (texto-a-voz) y se recomienda para humming o generación desde texto. Frente al checkpoint base Applio, este modelo añade el timbre específico del personaje. No se dispone de datos de benchmarks para comparar rendimiento objetivo entre ellos.

## Limitaciones y advertencias

- Requiere voces secas y aisladas: acompañamiento o reverberación en la entrada introducen ruido y distorsionan el timbre objetivo.
- Las notas muy agudas pueden sonar tensas o con zumbido, y parte del timbre del cantante original puede filtrarse.
- Las vocalizaciones densas y el vibrato reducen la inteligibilidad; las baladas lentas funcionan mejor.
- El humming a boca cerrada suena apagado; el autor recomienda el modelo GPT-SoVITS para ese caso.
- Bajar el tono puede hacer más prominentes las respiraciones; conviene reducir el ruido de respiración antes de la conversión.
- El dataset de entrenamiento es solo de habla, por lo que el canto depende del modelo base RVC v2.
- Licencia restrictiva: solo permite uso personal no comercial y publicación no comercial de audio convertido con atribución; la redistribución de pesos originales o derivados requiere permiso escrito previo.
- La licencia no concede derechos sobre las grabaciones originales, la imagen del personaje ni la interpretación vocal; el usuario debe verificar los derechos del audio de entrada y de la pista de acompañamiento.
- Modelo no oficial, sin afiliación con los desarrolladores del juego ni con la actriz de voz.
- Riesgo de uso indebido de la voz de una persona real (suplantación); no se documentan mecanismos de mitigación.
- El idioma de entrenamiento es el chino; no hay garantías documentadas para otros idiomas de entrada.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/Denia-rvc-v2
- Modelo GPT-SoVITS del mismo autor: https://huggingface.co/Richopera/Denia-gpt-sovits-v2proplus
- Modelo base: https://huggingface.co/IAHispano/Applio
- Repositorio Applio: https://github.com/IAHispano/Applio
- Licencia (inglés): LICENSE_en.md (en el repositorio)
- Licencia (chino): LICENSE.md (en el repositorio)
- README en chino: README_zh.md (en el repositorio)
- Página del juego *Wuthering Waves*: https://wutheringwaves.kurogames.com/en/main/
- Ejemplo de audio (world.execute(me);, −1): https://img.imgbed.dev/file/1795201632051_world_execute_me_denia_minus1_mix.m4a
- Ejemplo de audio (小小, −1): https://img.imgbed.dev/file/1795201624013_xiao_xiao_denia_minus1_mix.m4a
- Ejemplo de audio (Strangers, −2, voces aisladas): https://img.imgbed.dev/file/1795201622841_jia_yi_bing_ding_denia_minus2_vocals.m4a
- Ejemplo de audio (她的梦, 0, voces aisladas): https://img.imgbed.dev/file/1795201623405_ta_de_meng_denia_0_vocals.m4a
- Ejemplo de audio (梦想天空, +2, voces aisladas): https://img.imgbed.dev/file/1795201620265_meng_xiang_tian_kong_denia_plus2_vocals.m4a
