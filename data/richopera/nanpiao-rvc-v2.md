# Richopera/nanpiao-rvc-v2

## Resumen

nanpiao-rvc-v2 es un modelo de conversión de voz a voz (voice-to-voice, pipeline `audio-to-audio`) basado en la arquitectura RVC v2 (Retrieval-based Voice Conversion) y entrenado con el framework Applio. Lo desarrolla el usuario Richopera y reproduce la voz del personaje masculino Rover (男漂泊者) del videojuego *Wuthering Waves*, doblado al chino por 马洋. No es un modelo de texto a voz: recibe una pista vocal ya existente y la transforma al timbre del personaje, por lo que su uso principal es la conversión de voz cantada (SVC) para hacer covers.

El modelo parte de los pesos preentrenados oficiales de RVC v2 y se afina sobre un corpus propio de 103,1 minutos (1.507 archivos, 3.098 clips) extraído de diálogos de historia, líneas de combate y perfiles del personaje. Trabaja a 40 kHz con vocoder HiFi-GAN, extracción de tono RMVPE y embeddings de contenido ContentVec, y se distribuye como 20 checkpoints `.pth` de unos 55 MB cada uno más dos índices de recuperación (completo de 856 MB y comprimido de 31,6 MB).

Su relevancia es acotada pero clara: es un ejemplo de fine-tuning de RVC v2 sobre una única voz con documentación inusualmente detallada de hiperparámetros, rango de tono y limitaciones. El repositorio ocupa 2,0 GB y acumula 15 descargas, con licencia propia no estándar (`richopera-voice-model-license-v2.0`), lo que condiciona seriamente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion) con vocoder HiFi-GAN a 40 kHz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; segmentación manual con "Split Audio") |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints `.pth` en precisión de entrenamiento) |
| Idiomas soportados | chino (zh) |
| Licencia | richopera-voice-model-license-v2.0 (categoría "other") |
| Formato de pesos | `.pth` (20 checkpoints, ~55 MB cada uno) + índices `.index` (completo 856 MB, comprimido 31,6 MB) |

## Arquitectura y entrenamiento

RVC v2 es una arquitectura de conversión de voz basada en recuperación: un extractor de contenido (ContentVec) obtiene representaciones lingüísticas independientes del hablante, un extractor de tono (RMVPE) modela el F0 y un decoder con vocoder HiFi-GAN sintetiza la onda a 40 kHz. El índice de recuperación (`nanzhu.index`, 270.847 frames) permite sustituir features del input por las más cercanas del corpus de entrenamiento, lo que mejora la fidelidad al timbre objetivo a costa de memoria. El modelo se inicializa desde los pesos preentrenados oficiales de RVC v2 y se afina con Applio.

El entrenamiento se realizó el 2026-09-19 durante 200 épocas y 77.800 pasos con batch size 8, sobre 1.507 archivos (103,1 minutos, 3.098 clips tras segmentación automática) de audio curado por el jugador, excluyendo clips con reverberación intensa. La pérdida final del generador fue 33,62. El hardware empleado fue una RTX 4090 (24 GB) en UCloud con AMD EPYC de 16 vCPUs y 62 GB de RAM, con un tiempo total de unas 5,3 horas. No se documenta uso de RLHF ni DPO, algo esperable en este tipo de modelos.

## Capacidades

- Conversión de voz a voz (SVC): transforma una pista vocal aislada al timbre del personaje, incluyendo voz cantada.
- Conversión de habla: al estar entrenado solo con datos de habla, también convierte locución, aunque su rendimiento en canto proviene del preentrenado.
- Control de tono por semitonos, con guía documentada por rango de F0 (mediana de entrenamiento ~100 Hz, p10–p90 de 90–142 Hz).
- Ajuste de "Search Feature Ratio" (0,50–0,75) para equilibrar fidelidad y naturalidad.
- Selección entre 20 checkpoints (10e a 200e) para elegir el equilibrio deseado.
- Dos índices de recuperación intercambiables: completo (calidad) y comprimido (carga rápida, 10.000 centroides).
- No soporta tool calling, agentes, razonamiento multi-step ni entrada de texto; no es multimodal más allá del audio.

## Casos de uso

- Covers musicales de voz masculina: convertir una pista vocal aislada de un tema con mediana vocal entre 110 y 160 Hz al timbre del personaje, ajustando el pitch entre 0 y −2 semitonos según el tema. Es el caso principal documentado por el autor, con ejemplos como *Requiem* (pitch 0) y *City of Stars* (pitch −1).
- Doblaje amateur de contenido de *Wuthering Waves*: sustituir la voz de un actor por la del personaje en clips de fan-made, siempre que la pista de voz esté limpia y sin acompañamiento.
- Producción de mods y contenido para la comunidad: generar líneas de voz consistentes con el personaje para vídeos, animaciones o narrativa derivada.
- Prototipado de pipelines SVC: servir como referencia reproducible de un fine-tuning RVC v2 con hiperparámetros y métricas de entrenamiento públicas para quienes quieran replicar el proceso con Applio.
- Investigación en conversión de voz: estudiar el efecto del índice de recuperación (completo frente a comprimido) y del checkpoint en la calidad percibida, con una guía de escucha comparativa ya publicada.
- Previsualización rápida en entornos con recursos limitados: usar el índice comprimido de 31,6 MB y checkpoints de ~55 MB para iterar sin cargar el índice completo de 856 MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta métricas de entrenamiento (pérdida final del generador de 33,62, 200 épocas, 77.800 pasos) y mediciones de rango de tono del conjunto de entrenamiento (mediana ~100 Hz, p10–p90 de 90–142 Hz, techo práctico estimado de 178 Hz), sin comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó con una RTX 4090 de 24 GB, pero la inferencia de RVC v2 es mucho más ligera y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; una RTX 4090 es suficiente tanto para entrenamiento como para inferencia. Para inferencia bastan GPUs de gama media.
- Cabe en GPU de consumo: sí; el tamaño de los checkpoints (~55 MB) y del índice comprimido (31,6 MB) es reducido. El índice completo de 856 MB incrementa el uso de memoria.
- Opciones de despliegue: Applio (WebUI oficial del framework), con inferencia local. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor solo indica que el índice comprimido carga más rápido que el completo a costa de más artefactos.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto/rango | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nanpiao-rvc-v2 | RVC v2 (SVC) | Audio | F0 práctico 90–178 Hz | richopera-voice-model-license-v2.0 | Hugging Face, 15 descargas |
| nanpiao-gpt-sovits-v2proplus | GPT-SoVITS (TTS) | Texto | no disponible | no disponible | Hugging Face (mismo autor) |
| RVC v2 preentrenado oficial | RVC v2 (SVC) | Audio | no disponible | licencia del proyecto RVC | Repositorio RVC-Project |
| Applio (framework base) | Framework RVC | Audio | no disponible | licencia del proyecto Applio | GitHub IAHispano/Applio |

La comparación más directa es con el modelo GPT-SoVITS del mismo autor: aquel acepta texto como entrada y el autor lo recomienda para tarareo, mientras que este exige audio y está optimizado para covers de voz masculina grave. Frente al RVC v2 preentrenado genérico, este modelo está especializado en un único timbre y documenta su rango tonal, lo que facilita decidir si encaja en una canción concreta.

## Limitaciones y advertencias

- Rango vocal bajo: la mayoría de voces femeninas y tenores altos encajan mal; las voces femeninas suelen requerir desplazamientos de −12 semitonos o más, con degradación severa.
- Poco margen en graves: notas por debajo de 90 Hz suenan crujientes o débiles, y los desplazamientos descendentes grandes lo agravan.
- Exige voces secas: acompañamiento o reverberación intensa en la entrada provocan ruido y rotura del timbre convertido.
- No apto para tarareo: el tarareo a boca cerrada suena apagado y débil en todos los ajustes probados.
- Pasajes rápidos y vibrato reducen la inteligibilidad; las baladas lentas funcionan mejor.
- Datos de entrenamiento solo de habla: la capacidad de canto depende del preentrenado RVC v2, lo que limita notas sostenidas y agudas.
- Riesgo de alucinación no aplica en el sentido textual, pero sí de artefactos y ruidos generados en la conversión, especialmente con el índice comprimido.
- Licencia no estándar (`richopera-voice-model-license-v2.0`): es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial; además, la voz reproduce a un actor real (马洋) y a un personaje con derechos de Kuro Games, lo que añade riesgo legal por derechos de imagen y de propiedad intelectual.
- Solo idioma chino en los metadatos; no se documenta soporte multilingüe.
- Advertencia de producción: el autor recomienda comparar 200e y 150e (y probar 100e o 120e) porque el checkpoint final no siempre suena mejor; no debe asumirse que el último es el óptimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/nanpiao-rvc-v2
- Modelo GPT-SoVITS del mismo autor: https://huggingface.co/Richopera/nanpiao-gpt-sovits-v2proplus
- Dataset de voz: https://huggingface.co/datasets/Richopera/nanpiao-voice
- Applio (framework de entrenamiento e inferencia): https://github.com/IAHispano/Applio
- RVC-Project (Retrieval-based Voice Conversion WebUI): https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- RMVPE (extracción de tono): https://github.com/yxlllc/DDSP-SVC
- Wuthering Waves (Kuro Games): https://wutheringwaves.kurogames.com/en/main/
- Perfil del actor de doblaje 马洋 en Bilibili: https://space.bilibili.com/29043144
- Ejemplo de audio (Requiem, pitch 0): https://img.imgbed.dev/file/1795206810675_Serge_Liberovsky_Requiem_nanzhu_0_automix.m4a
