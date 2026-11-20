# Richopera/Yangyang-rvc-v2

## Resumen

Yangyang-rvc-v2 es un modelo de conversión de voz (voice conversion) basado en la arquitectura RVC v2 (Retrieval-based Voice Conversion), publicado por el usuario Richopera en Hugging Face. Convierte grabaciones vocales existentes a la voz de Yangyang, personaje del videojuego Wuthering Waves, cuya actriz de doblaje en chino es 虫虫. No genera voz a partir de texto: su entrada es audio, y su salida es ese mismo audio con el timbre del personaje, lo que lo sitúa en la categoría de audio-to-audio y de conversión de voz cantada (SVC).

El modelo se ha entrenado con el framework Applio sobre los pesos preentrenados oficiales de RVC v2, con un vocoder HiFi-GAN a 40 kHz, extracción de tono mediante RMVPE y embeddings de contenido ContentVec. El repositorio ocupa 2,1 GB e incluye 20 checkpoints (uno cada 10 épocas, de 10e a 200e) y dos índices de recuperación: uno completo de 991 MB con 313.847 frames y otro comprimido de 31,6 MB con 10.000 centroides.

Su relevancia es acotada pero concreta: es un modelo de nicho para aficionados al doblaje y a la creación de covers, con una licencia propia restrictiva (Richopera Voice Model License v2.0) que limita el uso a fines no comerciales. No compite con modelos fundacionales de voz, sino que cubre una tarea muy específica de clonación de timbre sobre audio ya existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion) con vocoder HiFi-GAN a 40 kHz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo audio-to-audio, no procesa texto) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato .pth, sin variantes cuantizadas publicadas) |
| Idiomas soportados | zh (chino) |
| Licencia | Richopera Voice Model License v2.0 (uso personal no comercial) |
| Formato de pesos | .pth (checkpoints) e índices .index |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RVC v2, un esquema de conversión de voz basado en recuperación (retrieval-based) que combina un extractor de características de contenido (ContentVec), un extractor de tono (RMVPE) y un decoder con vocoder HiFi-GAN que sintetiza la forma de onda a 40 kHz. El índice de recuperación actúa como memoria de timbre: almacena representaciones del hablante objetivo y las recupera en tiempo de inferencia para mejorar la fidelidad de la conversión. Se inicializó desde los pesos preentrenados oficiales de RVC v2 y se afinó con Applio.

El entrenamiento se realizó sobre 1.269 archivos de audio (119,6 minutos, aproximadamente 3.294 clips tras segmentación automática), procedentes de diálogos de historia y perfiles de personaje del videojuego. Se ejecutaron 200 épocas y 82.400 pasos con batch size de 8, el 22 de septiembre de 2026, en una instancia cloud con RTX 5090 (24 GB), en unas 3 horas y 20 minutos. La pérdida final del generador fue de 25,572, con un mínimo de 16,473 en la época 80. El conjunto de datos es exclusivamente de habla, no de canto: la capacidad de cantar proviene del modelo preentrenado RVC v2, lo que limita el rendimiento en notas sostenidas y agudas.

## Capacidades

- Conversión de voz audio-to-audio: transforma una pista vocal aislada al timbre de Yangyang manteniendo el contenido lingüístico y la melodía.
- Conversión de voz cantada (SVC): permite crear covers a partir de voces aisladas, con control de tono en semitonos.
- Extracción de tono con RMVPE, con un rango medido en el conjunto de entrenamiento de 188–310 Hz (p10–p90) y mediana de 238 Hz.
- Embeddings de contenido ContentVec para preservar la inteligibilidad del habla original.
- Dos modos de índice: completo (mayor calidad) y comprimido (carga más rápida, con posibles artefactos).
- 20 checkpoints intermedios que permiten comparar resultados entre épocas (recomendado comparar 200e, 150e y 80e).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente de audio.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente para chino.

## Casos de uso

- Creación de covers de canciones: se aísla la pista vocal, se convierte con el checkpoint 200e y el índice completo, y después se mezcla con la instrumentación original. El ajuste de tono se calibra por oído (por ejemplo, −4 semitonos para voces femeninas medias o +5 a +8 para masculinas).
- Doblaje amateur de contenido de Wuthering Waves: se convierte el audio de un actor de doblaje aficionado al timbre de Yangyang para vídeos de fans, manteniendo la interpretación original.
- Prototipado de voces para mods y proyectos de fangame: el modelo permite generar líneas de voz del personaje a partir de grabaciones propias, útil en fases de preproducción no comercial.
- Comparación de checkpoints para investigación de calidad: los 20 checkpoints permiten estudiar la relación entre pérdida de entrenamiento y calidad perceptual (el mínimo de pérdida en 80e no coincide necesariamente con el mejor resultado auditivo).
- Evaluación de pipelines RVC/Applio: sirve como caso de prueba realista para medir el efecto del índice completo frente al comprimido en artefactos y transiciones.
- Educación y divulgación sobre conversión de voz: permite demostrar en talleres cómo funcionan ContentVec, RMVPE y la recuperación por índice sin necesidad de entrenar un modelo desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de entrenamiento: pérdida final del generador de 25,572, mínimo de 16,473 en la época 80, 200 épocas, 82.400 pasos y batch size 8. No hay datos de MMLU, HumanEval, GSM8K ni de métricas de calidad de voz como MOS o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; cada checkpoint ocupa aproximadamente 55 MB y el índice completo 991 MB, por lo que el grueso del consumo proviene del índice cargado en memoria y del proceso de inferencia de Applio.
- GPU recomendadas: el entrenamiento se realizó en una RTX 5090 (24 GB); para inferencia, una GPU consumer de gama media-alta con al menos 8 GB de VRAM es un punto de partida razonable, aunque no hay cifras oficiales.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, 4060, 4070 o superiores; el índice comprimido de 31,6 MB reduce el uso de memoria en previsualizaciones.
- Opciones de despliegue: Applio (WebUI oficial, con carpeta `logs/Yangyang/`), y por extensión el ecosistema RVC. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El tiempo de entrenamiento fue de aproximadamente 1 minuto por época en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yangyang-rvc-v2 (Richopera) | RVC v2, audio-to-audio | Audio | zh | Richopera Voice Model License v2.0 (no comercial) | Hugging Face |
| Yangyang-gpt-sovits-v2proplus (Richopera) | GPT-SoVITS, text-to-speech | Texto | zh | no disponible en la informacion proporcionada | Hugging Face |
| RVC v2 preentrenado oficial | RVC v2, base | Audio | no disponible | no disponible en la informacion proporcionada | Repositorio RVC-Project |

La comparación directa con modelos de la misma categoría (otros RVC v2 de personajes) no está disponible en la información proporcionada. La diferencia clave frente al modelo GPT-SoVITS del mismo autor es la modalidad: aquel parte de texto y este de audio, por lo que no son intercambiables.

## Limitaciones y advertencias

- Distribución de tono estrecha: el rango p10–p90 de 188–310 Hz es más limitado que el de la mayoría de modelos del proyecto, lo que reduce la naturalidad fuera de esa banda.
- Poco margen en notas agudas: los pasajes muy por encima de 310 Hz pueden sonar tensos o metálicos; en el análisis de *Riding a White Horse*, entre el 17 % y el 33 % de los frames superaban 310 Hz con −2 o −3 semitonos. Las notas graves pueden sonar apagadas o con crujido.
- Requiere voces secas y aisladas: la instrumentación o la reverberación intensa en la entrada provocan ruido y roturas del timbre convertido.
- Los pasajes densos y el vibrato pueden reducir la inteligibilidad; las baladas lentas funcionan mejor.
- Entrenado solo con habla: la capacidad de canto depende del preentrenado RVC v2, lo que limita las notas sostenidas y agudas.
- Riesgo de alucinación acústica: el modelo puede introducir artefactos o sonidos no presentes en la entrada, especialmente con el índice comprimido.
- Licencia restrictiva: la Richopera Voice Model License v2.0 permite uso personal no comercial y publicación no comercial de obras generadas con atribución obligatoria; la redistribución del modelo original está restringida. El uso comercial requiere consultar los términos del archivo LICENSE.md.
- Implicaciones de derechos de imagen y voz: el modelo replica la voz de un personaje de un videojuego comercial y de su actriz de doblaje; su uso público debe respetar los derechos de Kuro Games y de la intérprete.
- Sin datos de sesgo lingüístico más allá del chino: no se ha evaluado su comportamiento con entradas en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/Yangyang-rvc-v2
- Modelo GPT-SoVITS del mismo autor: https://huggingface.co/Richopera/Yangyang-gpt-sovits-v2proplus
- Repositorio Applio: https://github.com/IAHispano/Applio
- Repositorio RVC-Project: https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- RMVPE (DDSP-SVC): https://github.com/yxlllc/DDSP-SVC
- Página del personaje en Wuthering Waves: https://wutheringwaves.kurogames.com/en/main/
- Perfil de la actriz de doblaje 虫虫 en Bilibili: https://space.bilibili.com/1981409
- Hilo de la comunidad AI Hobbyist: https://www.ai-hobbyist.com/thread-160090-1-1.html
- Espejo en ModelScope: https://modelscope.cn/models/Richopera/Yangyang-rvc-v2
- Ejemplo de audio (voces aisladas): https://img.imgbed.dev/file/1795205693456_riding_a_white_horse_yangyang_minus4_vocals.m4a
