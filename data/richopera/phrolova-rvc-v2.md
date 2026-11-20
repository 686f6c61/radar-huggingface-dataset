# Richopera/phrolova-rvc-v2

## Resumen

Phrolova RVC v2 es un modelo de conversión de voz (voice conversion) entrenado con la arquitectura RVC v2 (Retrieval-based Voice Conversion) que transforma una grabación vocal existente, cantada o hablada, en el timbre del personaje Phrolova (弗洛洛) del videojuego *Wuthering Waves*, con la voz en chino de la actriz 张琦. Lo desarrolla el usuario Richopera y se distribuye como un fine-tune del proyecto Applio (IAHispano/Applio), que a su vez implementa el pipeline estándar de RVC v2 con pesos preentrenados oficiales.

No es un modelo texto-a-voz: no genera audio desde texto, sino que recibe audio de entrada y modifica su timbre preservando la interpretación original (prosodia, afinación, ritmo). El caso de uso canónico es el *cover* musical: se aísla la pista vocal de una canción y se convierte a la voz del personaje. El modelo opera a 40 kHz con vocoder HiFi-GAN, extracción de tono mediante RMVPE y características de contenido con ContentVec, y se entrenó durante 200 épocas (39.200 pasos) sobre 55,8 minutos de audio procedente de 564 archivos fuente.

El repositorio pesa 1,6 GB e incluye 20 checkpoints (uno cada 10 épocas, de 10e a 200e) de unos 55 MB cada uno, más un índice de recuperación de características de 473 MB con 149.767 frames. La licencia es propietaria (`richopera-voice-model-license-v2.0`), lo que condiciona su uso comercial. El modelo está etiquetado únicamente para chino y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion) con vocoder HiFi-GAN, extractor de tono RMVPE y encoder de contenido ContentVec |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio-audio, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en checkpoints `.pth` de precisión completa, sin variantes cuantizadas publicadas) |
| Idiomas soportados | chino (zh) |
| Licencia | `richopera-voice-model-license-v2.0` (propietaria, definida en `LICENSE.md`) |
| Formato de pesos | `.pth` (20 checkpoints) + `.index` (índice de recuperación de características) |
| Frecuencia de muestreo | 40.000 Hz |
| Vocoder | HiFi-GAN |
| Extracción de tono | RMVPE |
| Características de contenido | ContentVec |
| Modelo base | IAHispano/Applio (fine-tune) |
| Software de entrenamiento | Applio |
| Tamaño del repositorio | 1,6 GB |
| Índice de características | 473 MB, 149.767 frames |
| Entrenamiento | 200 épocas, 39.200 pasos, batch size 8 |
| Datos de entrenamiento | 564 archivos fuente, 55,8 minutos, 1.581 segmentos tras segmentado automático |
| Fecha de entrenamiento | 18 de septiembre de 2026 |
| Versión | v1.0.0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RVC v2, un esquema de conversión de voz que desacopla el contenido lingüístico/fonético del timbre. La señal de entrada se procesa con ContentVec para extraer representaciones de contenido independientes del hablante, mientras que la curva de tono (F0) se extrae con RMVPE, un extractor basado en aprendizaje profundo más robusto que alternativas previas como CREPE o Harvest en material cantado. El decoder genera la forma de onda a 40 kHz mediante un vocoder HiFi-GAN. La componente "retrieval-based" proviene del índice de características: durante la inferencia se recuperan frames del entrenamiento para condicionar la generación, lo que estabiliza el timbre resultante.

El entrenamiento se realizó con Applio sobre los pesos preentrenados oficiales de RVC v2, durante 200 épocas y 39.200 pasos con batch size 8, en una NVIDIA RTX 4090 (24 GB) con 16 vCPUs AMD EPYC y 62 GB de RAM, en aproximadamente 3 horas y 46 minutos. La pérdida final del generador (`loss_gen`) fue de 29,838. El corpus se compuso de voces en seco de alta calidad recopiladas por jugadores y material de Wuthering Waves Pioneer Radio, cubriendo diálogo de historia, líneas de combate y perfiles de personaje; tras el segmentado automático quedaron 1.581 segmentos. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación por preferencias, algo esperable en un modelo de conversión de voz.

## Capacidades

- Conversión de voz cantada (*singing voice conversion*): transforma la pista vocal de una canción al timbre de Phrolova preservando melodía, ritmo y expresión.
- Conversión de voz hablada: aplica el mismo timbre a grabaciones de habla.
- Preservación de la interpretación original: al ser audio-a-audio, mantiene la prosodia y la afinación de la fuente, a diferencia de un TTS.
- Extracción de tono robusta en material musical gracias a RMVPE.
- Control de tono por semitonos para adaptar la conversión al registro de la fuente (masculino, femenino, infantil).
- Ajuste de la relación de recuperación de características (*Search Feature Ratio*) para equilibrar fidelidad al timbre y naturalidad.
- Segmentado de audio para grabaciones largas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de audio-audio.
- Capacidad multilingüe: no disponible; etiquetado solo para chino.

## Casos de uso

- **Cover musical de canciones en chino**: se aísla la pista vocal con UVR o MSST y se convierte con el checkpoint 200e o 150e; el modelo está entrenado específicamente para voces cantadas en chino y preserva la interpretación del intérprete original.
- **Doblaje de personaje para contenido de fans**: convertir grabaciones de voz de un actor a la voz de Phrolova para vídeos, fan films o mods, manteniendo la sincronía labial porque la duración y el ritmo no cambian.
- **Producción de audio para mods de *Wuthering Waves***: generar líneas de voz alternativas para el personaje en proyectos de modding, usando el índice compartido y seleccionando el checkpoint que mejor se adapte a cada línea.
- **Prototipado rápido de voces para animación**: evaluar cómo suena un guion locutado en la voz del personaje antes de contratar una locución final, con un coste de inferencia muy bajo en una GPU de consumo.
- **Investigación en conversión de voz**: servir como caso de estudio de fine-tuning de RVC v2 con Applio, con un dataset pequeño (55,8 minutos) y resultados documentados de pérdida y configuración, útil para reproducir pipelines.
- **Generación de contenido para redes sociales**: producir versiones cantadas con una voz reconocible de personaje para vídeos cortos, usando los ajustes de tono ya probados por el autor (por ejemplo, −1 semitono para voces masculinas graves, +3 para voces más agudas).
- **Pruebas de robustez de RVC en material cantado**: comparar checkpoints intermedios (100e, 120e, 150e, 200e) sobre la misma entrada para estudiar cómo evoluciona la calidad con el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: `loss_gen` final de 29,838 tras 200 épocas y 39.200 pasos, sin comparación con otros modelos ni evaluaciones subjetivas cuantificadas (MOS, similitud de hablante, etc.).

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial; por las características de RVC v2 (checkpoints de 55 MB), la inferencia cabe holgadamente en GPUs de consumo. El entrenamiento se realizó en una RTX 4090 de 24 GB, pero la inferencia requiere bastante menos.
- **GPU recomendadas**: NVIDIA RTX 4090, RTX 3090, RTX 4080 o superiores para conversión rápida; GPUs de gama media (RTX 3060 12 GB, RTX 4060) suficientes para inferencia; también es posible ejecutar en CPU con latencia mayor.
- **Cabe en GPU de consumo**: sí, con cualquier GPU NVIDIA con al menos 6-8 GB de VRAM para inferencia; el cuello de botella real es el índice de 473 MB y el procesado de audio, no los pesos.
- **Opciones de despliegue**: Applio (WebUI oficial del proyecto base, recomendado por el autor), y en general los entornos compatibles con RVC v2. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que son frameworks de modelos de lenguaje y no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. El autor reporta 3 h 46 min para el entrenamiento completo, pero no cifras de inferencia. La conversión de una canción completa requiere extraer primero la pista vocal con UVR o MSST.

## Comparativa con modelos similares

| Modelo | Tipo | Arquitectura | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Richopera/phrolova-rvc-v2 | Conversión de voz (audio-audio) | RVC v2 + HiFi-GAN | 40 kHz | Propietaria (`richopera-voice-model-license-v2.0`) | Hugging Face, 0 descargas |
| Richopera/Phrolova-zh-gpt-sovits-v2proplus | Texto-a-voz | GPT-SoVITS | no disponible | no disponible | Hugging Face |
| IAHispano/Applio | Framework/base para RVC | RVC v2 | configurable | no disponible | GitHub y Hugging Face |
| RVC v2 oficial (pesos preentrenados) | Conversión de voz | RVC v2 | configurable | no disponible | Repositorios del proyecto RVC |

La comparación relevante es con el modelo GPT-SoVITS del mismo autor: aquel genera voz desde texto, mientras que este convierte audio existente, por lo que son complementarios y no sustitutos. Frente a los pesos preentrenados oficiales de RVC v2, este modelo aporta el timbre específico del personaje y un índice de recuperación entrenado, pero hereda las limitaciones del pipeline. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas de calidad.

## Limitaciones y advertencias

- **Requiere voces en seco y aisladas**: el autor advierte explícitamente que la instrumentación o la reverberación introducen ruido evidente; es imprescindible separar la pista vocal con UVR o MSST antes de la conversión.
- **Solo chino**: el modelo está etiquetado exclusivamente para chino; no hay evidencia de soporte para otros idiomas y la calidad en castellano u otras lenguas no está documentada.
- **No es un TTS**: no acepta texto como entrada; si se necesita generar voz desde texto hay que usar el modelo GPT-SoVITS del mismo autor.
- **Riesgo de artefactos**: la model card menciona ruido y artefactos de conversión; el autor recomienda escuchar versiones con ±1-2 semitonos de diferencia para elegir el ajuste.
- **Selección de checkpoint no trivial**: el checkpoint final (200e) no es necesariamente el mejor para toda canción; hay que comparar 200e, 150e, 100e y 120e, manteniendo siempre el mismo índice.
- **Licencia propietaria**: la licencia `richopera-voice-model-license-v2.0` condiciona el uso comercial y la redistribución; es obligatorio revisar `LICENSE.md` antes de cualquier uso en producción. No se detallan aquí sus términos porque no están incluidos en la información disponible.
- **Sesgos**: no documentados en la información disponible; al derivar de las voces de un personaje de videojuego y de un corpus pequeño (55,8 minutos), el timbre puede no generalizar bien fuera del registro y estilo del material de entrenamiento.
- **Riesgo de alucinación**: no aplica en el sentido de texto, pero sí existe riesgo de que el modelo "invente" detalles tímbricos o inestabilidad en notas extremas; el autor recomienda ajustar el tono por semitonos para mitigarlo.
- **Advertencia legal sobre voces de personajes**: el timbre pertenece a un personaje con derechos de autor de Kuro Games y a la actriz de voz 张琦; el uso comercial o la suplantación pueden infringir derechos de imagen o de propiedad intelectual, independientemente de la licencia del modelo.
- **Metadatos inconsistentes**: la fecha de creación indicada (2026-11-20) es posterior a la fecha de entrenamiento declarada (18 de septiembre de 2026) y ambas son futuras; conviene verificar la procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/phrolova-rvc-v2
- Modelo GPT-SoVITS del mismo autor: https://huggingface.co/Richopera/Phrolova-zh-gpt-sovits-v2proplus
- Modelo base Applio en Hugging Face: https://huggingface.co/IAHispano/Applio
- Repositorio Applio en GitHub: https://github.com/IAHispano/Applio
- Sitio oficial de *Wuthering Waves*: https://wutheringwaves.kurogames.com/en/main/
- Ejemplo de audio con acompañamiento (Tsai Chin, 0 semitonos): https://s1.tuoguanyun.cn/autoupload/gtrwt/20261104/FuZB/CaiQin_GeiDianYingRenDeQingShu_Phrolova_0_automix.m4a
- Ejemplo de audio con acompañamiento (Mao Buyi, +7 semitonos): https://s1.tuoguanyun.cn/autoupload/gtrwt/20261104/yKVO/MaoBuyi_YiHunYiSu_Phrolova_%2B7.m4a
- Ejemplo de vocal aislada (City of Stars, −1 semitono): https://s1.tuoguanyun.cn/autoupload/gtrwt/20261104/7PoA/CityOfStars_Humming_-1_1m22-1m47.m4a
- Ejemplo de vocal aislada (Vae Xu, +1 semitono): https://s1.tuoguanyun.cn/autoupload/gtrwt/20261104/czYS/XuSong_QianchengSijin_%2B1_200e_0m21-1m30.m4a
- Ejemplo de vocal aislada (Khalil Fong, +6 semitonos): https://s1.tuoguanyun.cn/autoupload/gtrwt/20261104/RhvM/FangDatong_%2B6_0m30-1m09.m4a
