# 10X-Technologies/lyric-lite-v1-kn

## Resumen

Lyric Lite es un modelo de síntesis de voz (text-to-speech) monolingüe para kannada, desarrollado por 10X Technologies. Se trata de la variante compacta de la familia Lyric, destilada a partir de Lyric Voice (336M parámetros) hasta un tercio de su tamaño, con 109,5 millones de parámetros y un repositorio de 0,4 GB. Su objetivo es llevar la síntesis de voz en kannada a dispositivos sin GPU y sin conexión a internet, como teléfonos Android de gama baja, portátiles y ordenadores pequeños.

El modelo mantiene una precisión prácticamente idéntica a la de su predecesor (1,30 % de tasa de error de caracteres frente a 1,41 % de Lyric Voice) y ofrece una velocidad de 3,2 veces el tiempo real en un teléfono Android económico, además de 1,9 veces el tiempo real en un solo hilo de CPU. Genera audio a 24 kHz e incluye una voz predefinida llamada Ahana.

Su relevancia actual reside en la combinación de tamaño reducido, inferencia en CPU y licencia comunitaria específica, lo que lo hace adecuado para aplicaciones de accesibilidad, lectura de contenido y asistentes de voz en entornos con recursos limitados y conectividad intermitente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz; no se detalla la arquitectura interna) |
| Parámetros totales | 109.502.146 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el modelo se distribuye listo para inferencia en CPU) |
| Idiomas soportados | kannada (kn) |
| Licencia | lyric-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo en la documentación disponible. Se sabe que es un modelo de texto a voz destilado de Lyric Voice (336M parámetros) y que conserva la precisión del modelo original pese a reducir su tamaño a un tercio. El modelo base es `10X-Technologies/lyric-voice-v1-kn`, y la destilación se orientó explícitamente a la inferencia en CPU y en dispositivos móviles.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. La evaluación se realizó sobre 254 clips por modelo, con las mismas semillas, el mismo clip de voz y el mismo código, lo que permite una comparación directa entre Lyric Lite y Lyric Voice.

## Capacidades

- Síntesis de voz en kannada a partir de texto escrito en alfabeto kannada, con salida de audio a 24 kHz.
- Manejo de palabras inglesas cuando se escriben en alfabeto kannada; no admite inglés en caracteres latinos.
- Lectura de números únicamente cuando se escriben como palabras; los dígitos no están soportados.
- Segmentación automática de textos largos en los signos `.`, `?` y `!`, y división de frases muy largas en comas.
- Limpieza automática de caracteres invisibles provenientes de texto copiado de la web o de teclados, con advertencia sobre caracteres no pronunciables.
- Voz predefinida Ahana incluida en el repositorio (`voices/ahana.wav`), usada por defecto.
- Inferencia en CPU sin GPU y sin conexión a internet.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido web y noticias en kannada: el modelo convierte artículos y textos largos en audio, con segmentación automática por puntuación, adecuado para aplicaciones de lectura por voz en navegadores y agregadores.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla y aplicaciones móviles que funcionan sin conexión, gracias a la inferencia en CPU y al tamaño de 418 MB.
- Asistentes de voz sin conexión en teléfonos Android de gama baja: el modelo alcanza 3,2 veces el tiempo real en hardware económico, lo que permite respuestas habladas fluidas sin depender de la nube.
- Aprendizaje de kannada: generación de audio de pronunciación para aplicaciones educativas, con la voz Ahana como referencia consistente.
- Sistemas de anuncios y avisos automatizados: lectura de comunicaciones breves en entornos con conectividad limitada, como quioscos o terminales de atención al público.
- Prototipado de interfaces de voz: al ejecutarse en CPU con un script de inferencia sencillo (`inference.py`), facilita la experimentación en equipos de desarrollo sin GPU.
- Localización de contenido para el mercado de kannada: conversión de textos corporativos o institucionales en audio para distribución en dispositivos móviles.

## Benchmarks y rendimiento

| Medida | Lyric Lite | Lyric Voice |
|---|---|---|
| Tasa de error de caracteres, frases | 1,30 % | 1,41 % |
| Tasa de error de caracteres, párrafos de 17 frases | 1,3 % | no disponible |
| Fallos del modelo (palabras omitidas, finales cortados, ráfagas, bucles) | 1,2 % (3 de 254 clips) | no disponible en esta ficha |
| Similitud de voz con el prompt Ahana (ECAPA) | 0,663 | no disponible |
| Velocidad en CPU | 3,2 veces más rápida que Lyric Voice; 1,9 veces el tiempo real en un solo hilo | referencia |
| Velocidad en teléfono Android económico | 3,2 veces el tiempo real | no disponible |
| Tamaño | 418 MB | aproximadamente tres veces mayor |

La evaluación se realizó sobre 254 clips por modelo, con las mismas semillas, el mismo clip de voz y el mismo código. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de texto a voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU.
- Memoria necesaria: aproximadamente 420 MB de pesos en la primera carga.
- GPU recomendadas: no son necesarias; no se documenta soporte de GPU.
- Cabe en GPU de consumo: no aplica, ya que la inferencia es en CPU.
- Despliegue: script `inference.py` incluido en el repositorio, con dependencias instaladas desde `requirements.txt` (incluye la librería Pocket TTS, instalada desde GitHub). Requiere Python 3.10 o superior y git.
- Latencia y throughput: 1,9 veces el tiempo real en un solo hilo de CPU y 3,2 veces el tiempo real en un teléfono Android económico.
- Salida de audio: WAV a 24 kHz.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Tamaño | Velocidad | Licencia |
|---|---|---|---|---|---|
| Lyric Lite — Kannada | 109,5 M | kannada | 418 MB | 3,2 veces el tiempo real en Android económico; 1,9 veces en CPU de un hilo | lyric-community-license |
| Lyric Voice — Kannada | 336 M | kannada | aproximadamente 3 veces mayor | referencia, más lenta | no disponible en esta ficha |
| Lyric Lite — Telugu | no disponible | telugu | no disponible | no disponible | lyric-community-license |
| Lyric Lite — Hindi | no disponible | hindi | no disponible | no disponible | lyric-community-license |
| Lyric Lite — Tamil | no disponible | tamil | no disponible | no disponible | lyric-community-license |
| Lyric Lite — Malayalam | no disponible | malayalam | no disponible | no disponible | lyric-community-license |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo admite kannada; no procesa otros idiomas.
- No admite inglés escrito en caracteres latinos; las palabras inglesas deben transcribirse en alfabeto kannada.
- No admite dígitos; los números deben escribirse como palabras.
- El texto sin puntuación debe dividirse manualmente antes de pasarlo al modelo; el script solo segmenta en `.`, `?` y `!`, y en comas para frases muy largas.
- Puede contener caracteres invisibles provenientes de texto copiado de la web o de determinados teclados; el script los limpia y advierte, pero no garantiza la pronunciación correcta de todos ellos.
- Tasa de fallos del 1,2 % (3 de 254 clips), con casos de palabras omitidas, finales cortados, ráfagas y bucles.
- Riesgo de alucinación acústica y de pronunciación incorrecta en textos atípicos o sin puntuación.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia lyric-community-license es de tipo "other"; deben revisarse sus términos en el archivo LICENSE antes de cualquier uso comercial.
- El modelo está pensado para inferencia en CPU; no se documentan requisitos ni rendimiento en GPU.
- La voz incluida por defecto es Ahana; no se documentan otras voces en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-lite-v1-kn
- Modelo base Lyric Voice — Kannada: https://huggingface.co/10X-Technologies/lyric-voice-v1-kn
- Lyric Lite — Telugu: https://huggingface.co/10X-Technologies/lyric-lite-v1-te
- Lyric Lite — Hindi: https://huggingface.co/10X-Technologies/lyric-lite-v1-hi
- Lyric Lite — Tamil: https://huggingface.co/10X-Technologies/lyric-lite-v1-ta
- Lyric Lite — Malayalam: https://huggingface.co/10X-Technologies/lyric-lite-v1-ml
- Licencia (Lyric Community License): https://huggingface.co/10X-Technologies/lyric-lite-v1-kn/blob/main/LICENSE
- Banner del modelo: https://huggingface.co/10X-Technologies/lyric-lite-v1-kn/resolve/main/assets/lyric-lite-banner.jpg
