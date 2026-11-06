# cuongduongok/TITAN

## Resumen

TITAN es un modelo preentrenado de conversión de voz (voice conversion, VC) basado en la arquitectura RVC v2 (Retrieval-based Voice Conversion) con guiado de tono (pitch guidance). Lo desarrolla el autor identificado como Blaise (blaise-tk) y esta pensado como punto de partida para el entrenamiento de modelos de clonación de voz: en lugar de entrenar desde cero, el usuario hace fine-tuning sobre TITAN con su propio dataset de hablante. La variante documentada, Titan-Medium, se distribuye en tres frecuencias de muestreo (32k, 40k y 48k) y transforma las características vocales de un hablante de origen en las de un hablante objetivo.

El modelo se entrenó sobre Applio v3.1.1 con un dataset de 11,15 horas derivado del corpus Expresso, y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje: es un modelo de audio-a-audio (pipeline `audio-to-audio`) que opera sobre representaciones acústicas intermedias, no sobre tokens de texto. Su relevancia practica esta en reducir el coste de entrenamiento para proyectos de clonación de voz y doblaje, ofreciendo un checkpoint base robusto que evita partir de cero.

La ficha describe la variante Titan-Medium; el autor anuncia una Titan-Large de la que no se han publicado detalles. El repositorio de Hugging Face `cuongduongok/TITAN` es una redistribución del modelo original de `blaise-tk/TITAN`, con 4,3 GB de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion) con pitch guidance; no es un transformer de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa segmentos de audio, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 4,3 GB; habitualmente checkpoints `.pth` en el ecosistema RVC) |

## Arquitectura y entrenamiento

TITAN se basa en la arquitectura RVC v2, que combina un extractor de características de contenido (típicamente HuBERT o similar en el ecosistema RVC), un codificador de tono (pitch) y un decoder generativo que sintetiza la forma de onda del hablante objetivo. El modelo base declarado es `lj1995/VoiceConversionWebUI`, el checkpoint de referencia del proyecto Retrieval-based Voice Conversion WebUI. El entrenamiento se realizó con Applio v3.1.1 sobre una RTX 3060 Ti, con batch size de 8 y una duración de 3 semanas.

Los detalles de entrenamiento publicados por el autor son: para la variante de 48 kHz, 1.018.660 pasos y 530 épocas; para 40 kHz, 1.010.588 pasos y 467 épocas; para 32 kHz, 1.001.469 pasos y 463 épocas. El dataset de fine-tuning son 11,15 horas procedentes del corpus Expresso (arxiv 2308.05725), disponible como `blaise-tk/TITAN-Medium`. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de conversión de voz. La innovación principal es precisamente el checkpoint preentrenado multiuso: un punto de partida que el autor presenta como robusto y de alta calidad para reducir el esfuerzo de entrenamiento por hablante.

## Capacidades

- Conversión de voz de hablante a hablante (voice-to-voice) preservando el contenido lingüístico y el tono.
- Clonación de voz mediante fine-tuning con un dataset reducido del hablante objetivo.
- Soporte de tres frecuencias de muestreo: 32 kHz, 40 kHz y 48 kHz.
- Guiado de tono (pitch guidance) para conservar la entonación del audio de entrada.
- Procesamiento de audio en ingles (único idioma declarado).
- Integración con el ecosistema RVC y Applio para entrenamiento e inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni texto: es exclusivamente un modelo de audio.

## Casos de uso

- Clonación de voz personalizada: el usuario hace fine-tuning de TITAN con 10-30 minutos de audio de un hablante y obtiene un modelo capaz de convertir cualquier audio de entrada a esa voz, aprovechando el checkpoint preentrenado para reducir épocas y tiempo de entrenamiento.
- Doblaje y localización de contenido: convertir la voz de un actor original a la voz de un actor de doblaje manteniendo prosodia y tono, con la variante de 48 kHz para máxima fidelidad.
- Producción de audiolibros y podcast: generar versiones de un mismo contenido con distintas voces sin regrabar, usando el modelo como capa de conversión sobre el audio ya locutado.
- Prototipado de personajes para videojuegos y animación: crear voces consistentes para personajes a partir de pocas muestras, entrenando variantes sobre TITAN-Medium.
- Anonimización de voz en investigación: transformar la identidad vocal de grabaciones manteniendo inteligibilidad, útil en datasets de habla que requieren privacidad.
- Restauración y adaptación de archivos históricos: convertir grabaciones de baja calidad o de hablantes fallecidos a una voz de referencia para reconstrucciones documentales.
- Investigación en conversión de voz: servir como baseline preentrenado para comparar técnicas de VC, dado que el autor publica los pasos, épocas y dataset empleados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (MOS, similitud de hablante, WER) en la informacion disponible. El autor incluye muestras de audio comparativas de Titan-Medium frente a Ov2 y Ov2.1 en la model card, pero sin metricas numericas asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el ecosistema RVC suele operar en el rango de 4-8 GB para inferencia en tiempo real, pero no hay dato confirmado para TITAN.
- GPU de entrenamiento documentada: RTX 3060 Ti (batch size 8, 3 semanas para el preentrenamiento completo).
- GPU recomendadas para fine-tuning: no disponible; por el volumen de entrenamiento documentado, se requiere una GPU consumer de gama media-alta o superior.
- Cabe en GPU consumer: si, segun el entorno de entrenamiento declarado (RTX 3060 Ti); la inferencia es presumiblemente mas ligera.
- Opciones de despliegue: Applio v3.1.1 y RVC WebUI (Retrieval-based Voice Conversion WebUI); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencias | Dataset de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TITAN (Titan-Medium) | RVC v2 preentrenado | 32k, 40k, 48k | Expresso, 11,15 h | Apache 2.0 | Hugging Face |
| Ov2 | RVC preentrenado | no disponible | no disponible | no disponible | referenciado en la model card |
| Ov2.1 | RVC preentrenado | no disponible | no disponible | no disponible | referenciado en la model card |
| lj1995/VoiceConversionWebUI | RVC base | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

La comparativa se limita a los modelos citados por el autor; no se dispone de especificaciones detalladas de Ov2 ni Ov2.1 mas alla de las muestras de audio comparativas.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado.
- Riesgo de uso indebido: la clonación de voz permite suplantación de identidad y fraude; es responsabilidad del usuario cumplir la normativa de protección de datos y obtener consentimiento.
- No se han publicado metricas objetivas de calidad (MOS, similitud de hablante, inteligibilidad), por lo que la evaluacion cualitativa depende de las muestras del autor.
- El entrenamiento se realizó en una unica GPU consumer con un dataset de 11,15 horas; el autor no documenta evaluaciones de robustez fuera de dominio (ruido, acentos, emociones).
- La variante Titan-Large esta anunciada pero sin detalles publicados.
- El repositorio `cuongduongok/TITAN` es una redistribucion con 0 descargas y 0 likes; conviene verificar la integridad de los pesos frente al repositorio original `blaise-tk/TITAN`.
- La licencia Apache 2.0 permite uso comercial, pero no exime de las obligaciones legales sobre derechos de voz e imagen de terceros.
- No aplica como modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face (redistribucion): https://huggingface.co/cuongduongok/TITAN
- Modelo original del autor: https://huggingface.co/blaise-tk/TITAN
- Dataset de entrenamiento: https://huggingface.co/datasets/blaise-tk/TITAN-Medium
- Modelo base: https://huggingface.co/lj1995/VoiceConversionWebUI
- Repositorio RVC WebUI: https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI/
- Applio: https://github.com/IAHispano/Applio
- Paper del corpus Expresso: https://arxiv.org/abs/2308.05725
