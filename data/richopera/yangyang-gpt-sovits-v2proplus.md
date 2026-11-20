# Richopera/Yangyang-gpt-sovits-v2proplus

## Resumen

Yangyang-gpt-sovits-v2proplus es un modelo de síntesis de voz (text-to-speech) entrenado con el framework GPT-SoVITS v2ProPlus por el usuario Richopera. Reproduce la voz del personaje Yangyang (秧秧) del videojuego *Wuthering Waves*, en su versión china doblada por la actriz de voz 虫虫. No se trata de un modelo de lenguaje generalista, sino de un par de checkpoints (GPT y SoVITS) que se cargan conjuntamente en un entorno GPT-SoVITS para clonar una voz concreta a partir de un clip de referencia.

El modelo se distribuye como un fine-tuning del paquete base lj1995/GPT-SoVITS-windows-package y está pensado para inferencia few-shot: en el momento de la generación se le proporciona un audio de referencia de 3 a 10 segundos junto con su transcripción exacta, y el modelo utiliza ese material para guiar el timbre y la dicción de la voz sintetizada. El entrenamiento se realizó sobre 1.773 clips de audio de alta calidad recopilados por jugadores, con un total de 114 minutos y 10,498 segundos de voz.

Es relevante en el ámbito del doblaje y la creación de contenido por su bajo coste de entrenamiento (unos 45 minutos en una GPU de portátil de 8 GB) y por su licencia restrictiva, que limita el uso a fines no comerciales y exige atribución. El repositorio ocupa 0,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (componente GPT + componente SoVITS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh); capacidad nativa de síntesis cruzada entre idiomas heredada de GPT-SoVITS |
| Licencia | richopera-voice-model-license-v2.0 (uso personal no comercial con atribución) |
| Formato de pesos | checkpoints `.ckpt` (GPT) y `.pth` (SoVITS) |
| Tamano del repositorio | 0,8 GB |
| Checkpoint GPT | `秧秧pro-e15.ckpt` (148 MiB, 15 épocas) |
| Checkpoint SoVITS | `秧秧pro_e8_s3480.pth` (165 MiB, 8 épocas, paso 3.480) |
| Modelo base | lj1995/GPT-SoVITS-windows-package (fine-tuning) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GPT-SoVITS v2ProPlus, que combina un componente GPT (modelo autorregresivo que modela la secuencia de tokens acústicos a partir del texto y una referencia de voz) con un componente SoVITS (modelo generativo de voz basado en VITS que convierte esos tokens en la forma de onda final). Esta separación permite la clonación de voz few-shot: el componente GPT captura el estilo y la prosodia a partir del clip de referencia, mientras que SoVITS sintetiza el audio con el timbre objetivo.

El entrenamiento se realizó con la configuración por defecto de GPT-SoVITS v2ProPlus. El componente GPT se entrenó durante 15 épocas y el componente SoVITS durante 8 épocas, alcanzando el paso 3.480. El conjunto de datos consta de 1.773 clips de audio de alta calidad recopilados por jugadores, con una duración total de 114 minutos y 10,498 segundos. El entrenamiento se ejecutó el 25 de septiembre de 2026, entre las 11:32 y las 12:17 (aproximadamente 45 minutos), en un equipo con CPU Intel Core Ultra 9 275HX a 2,70 GHz, 32 GB de RAM y una GPU NVIDIA GeForce RTX 5070 Laptop de 8 GB. No se documentan detalles sobre el dataset de preentrenamiento del modelo base ni sobre el uso de RLHF o DPO, que no aplican a este tipo de modelo TTS.

## Capacidades

- Síntesis de voz (text-to-speech) en chino a partir de texto de entrada.
- Clonación de voz few-shot: utiliza un clip de referencia de 3 a 10 segundos y su transcripción exacta para guiar el timbre y la dicción.
- Síntesis cruzada entre idiomas (cross-lingual) heredada de GPT-SoVITS, aunque el modelo se entrenó únicamente con voz en chino.
- Reproducción del timbre y estilo del personaje Yangyang tal como lo interpreta la actriz de voz 虫虫.
- Soporte de clips de referencia auxiliares para reforzar el timbre y la entrega.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada más allá del clip de referencia.

## Casos de uso

- Doblaje de contenido de fans: generación de líneas de diálogo para vídeos, cómics o animaciones amateur del personaje Yangyang, usando un clip de referencia limpio y su transcripción para mantener el timbre.
- Creación de audiolibros o narraciones no comerciales: el modelo puede sintetizar textos largos en chino con una voz consistente, encadenando fragmentos con la misma referencia para preservar la coherencia tímbrica.
- Modding y proyectos de preservación de voz: integración en herramientas de GPT-SoVITS para reemplazar o ampliar líneas de voz en proyectos de la comunidad, siempre que se respete la licencia no comercial.
- Investigación en clonación de voz few-shot: el modelo sirve como caso de estudio de fine-tuning con pocos datos (114 minutos) y recursos modestos (GPU de 8 GB), útil para comparar metodologías de entrenamiento.
- Prototipado de asistentes conversacionales en chino: generación de respuestas habladas con una voz concreta para demos y pruebas de concepto no comerciales.
- Producción de contenido para redes sociales: creación de clips de audio con la voz del personaje para publicaciones con atribución, respetando las condiciones de la licencia.
- Evaluación de pipelines TTS: prueba de integración de checkpoints v2ProPlus en WebUI de GPT-SoVITS y verificación de compatibilidad entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se completó con una GPU de 8 GB, por lo que la inferencia debería caber en GPUs consumer con 8 GB o más.
- GPU recomendadas: NVIDIA GeForce RTX 5070 Laptop (8 GB) o superior; no se documentan pruebas con A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, según el hardware de entrenamiento documentado (RTX 5070 Laptop de 8 GB).
- Opciones de despliegue: WebUI de GPT-SoVITS que soporte checkpoints v2ProPlus; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Contexto / referencia |
|---|---|---|---|---|---|
| Yangyang-gpt-sovits-v2proplus | TTS few-shot (GPT-SoVITS v2ProPlus) | zh | richopera-voice-model-license-v2.0 (no comercial) | `.ckpt` + `.pth` | Clip de referencia de 3-10 s |
| GPT-SoVITS base (lj1995/GPT-SoVITS-windows-package) | TTS few-shot | multiidioma | según proyecto GPT-SoVITS | paquete Windows | Clip de referencia |
| Otros fine-tunes de GPT-SoVITS | TTS few-shot | variable | variable | `.ckpt` + `.pth` | Clip de referencia |

No se dispone de datos de benchmarks ni de parámetros totales para establecer una comparación cuantitativa con alternativas. La comparación se limita a aspectos de licencia, formato y tipo de tarea.

## Limitaciones y advertencias

- Licencia restrictiva: Richopera Voice Model License v2.0 solo permite uso personal no comercial y publicación no comercial del audio generado con atribución; la redistribución de pesos originales o derivados requiere permiso escrito previo.
- La licencia no otorga derechos sobre las grabaciones originales, la imagen del personaje ni la interpretación vocal; el modelo es no oficial y no está afiliado a Kuro Games ni a la actriz de voz.
- Riesgo de alucinación y artefactos acústicos: como todo modelo TTS, puede generar pronunciaciones incorrectas, ruidos o inestabilidad prosódica, especialmente con textos largos o fuera de dominio.
- Dependencia de la calidad de la referencia: clips con música de fondo, reverberación o múltiples hablantes degradan el resultado; se recomienda voz limpia y seca de un solo hablante.
- Compatibilidad estricta de versión: los checkpoints solo funcionan en entornos GPT-SoVITS que soporten v2ProPlus; mezclarlos con checkpoints de otras versiones provoca fallos de carga.
- Cobertura lingüística limitada: entrenado solo con voz en chino; la síntesis cruzada entre idiomas puede presentar acentos o degradación en idiomas distintos del chino.
- Sesgos: no se documentan sesgos específicos, pero al reproducir una voz concreta puede perpetuar características prosódicas del corpus de entrenamiento.
- Sin datos de benchmarks ni de rendimiento objetivo: no es posible evaluar su calidad de forma cuantitativa frente a alternativas.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/Yangyang-gpt-sovits-v2proplus
- Proyecto GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS
- Guía en chino de GPT-SoVITS: https://www.yuque.com/baicaigongchang1145haoyuangong/ib3g1e
- Modelo base: https://huggingface.co/lj1995/GPT-SoVITS-windows-package
- Wuthering Waves (sitio oficial): https://wutheringwaves.kurogames.com/en/main/
- Perfil de 花儿不哭 en Bilibili: https://space.bilibili.com/5760446
- Perfil de 虫虫 en Bilibili: https://space.bilibili.com/1981409
- Contacto del autor: richopera@outlook.com
