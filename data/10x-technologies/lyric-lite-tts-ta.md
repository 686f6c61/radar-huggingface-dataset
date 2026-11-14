# 10X-Technologies/lyric-lite-tts-ta

## Resumen

Lyric Lite — Tamil es un modelo de síntesis de voz (text-to-speech) monolingüe para tamil desarrollado por 10X Technologies. Con 109,5 millones de parámetros, es la variante compacta de la familia Lyric, destilada a partir de Lyric Voice (336M) manteniendo una precisión equivalente: 2,77 % de tasa de error de caracteres frente al 3,06 % del modelo grande. Está diseñado explícitamente para inferencia en dispositivo ("on-device"), sin GPU ni conexión a internet.

El modelo resuelve el problema de la síntesis de voz de calidad en hardware de gama baja: según la model card, genera audio 2,0 veces más rápido que tiempo real en un solo hilo de CPU y 3,2 veces más rápido que tiempo real en un teléfono Android económico. El repositorio ocupa 0,4 GB y los pesos se cargan en unos 420 MB en la primera ejecución, con salida de audio a 24 kHz.

Es relevante en el contexto de las tecnologías del habla para lenguas indias: ofrece una alternativa local, sin dependencia de la nube, para una lengua con más de 80 millones de hablantes, dentro de un ecosistema (Lyric Lite) que cubre también telugu, hindi, malayalo y kannada. La licencia es la Lyric Community License, no estándar, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos en safetensors) |
| Parámetros totales | 109.502.146 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | tamil (ta); palabras inglesas solo si se escriben en escritura tamil |
| Licencia | Lyric Community License (license_name: lyric-community-license, categoría "other") |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 24 kHz |
| Tamaño del repositorio | 0,4 GB (carga ~420 MB de pesos) |
| Voces incluidas | Ahana (voices/ahana.wav) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (no se especifica si es un transformer autorregresivo, un modelo difusor o un esquema híbrido acústico-vocoder). Lo que sí se documenta es el proceso de destilación: Lyric Lite se obtiene destilando Lyric Voice, el modelo de 336M parámetros de la misma familia, a un tercio de su tamaño y conservando la precisión. No se publican datos sobre el número de tokens de entrenamiento, la composición del corpus ni si hubo ajuste por RLHF o DPO.

La innovación técnica destacable es la eficiencia en CPU: el modelo está optimizado para ejecutarse en un solo hilo a velocidad superior al tiempo real, lo que lo hace apto para despliegue en teléfonos de gama baja y ordenadores pequeños. La evaluación se realizó sobre 254 clips por modelo, con las mismas semillas, clip de voz y código, transcribiendo el audio generado con AI4Bharat IndicConformer 600M (CTC, greedy, sin modelo de lenguaje) para calcular la tasa de error de caracteres.

## Capacidades

- Síntesis de voz monolingüe en tamil a partir de texto en escritura tamil.
- Pronunciación de palabras inglesas de uso común siempre que estén transcritas en escritura tamil (por ejemplo, préstamos léxicos integrados en el habla cotidiana).
- Generación de audio a 24 kHz con una voz incluida (Ahana).
- Manejo de frases cortas (reacciones), habla cotidiana y narración de formato largo (se incluyen muestras de 5, 15 y 45 segundos).
- Segmentación automática de texto largo por puntuación (`. ? !`) y por comas en frases muy largas dentro de `inference.py`.
- Limpieza automática de caracteres invisibles y aviso sobre caracteres no pronunciables.
- Inferencia en CPU sin GPU y sin conexión a internet.
- No soporta tool calling, agentes, visión, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de noticias y artículos en tamil en aplicaciones móviles: el modelo convierte texto periodístico en audio a 24 kHz en el propio dispositivo, sin enviar contenido a servidores externos, lo que reduce costes de infraestructura y preserva la privacidad del usuario.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla Android que necesitan latencia baja y funcionamiento offline; los 420 MB de pesos y la velocidad de 3,2× tiempo real en un teléfono económico permiten una respuesta fluida sin GPU.
- Asistentes de voz para atención al cliente en tamil: el modelo puede sintetizar respuestas multi-frase generadas por un LLM, con segmentación automática por puntuación para mantener la naturalidad en turnos conversacionales.
- Narración de audiolibros y contenido educativo largo: las muestras de narración de 45 segundos y la tasa de error de caracteres del 3,3 % en párrafos de 17 frases lo hacen adecuado para lectura de material didáctico y cuentos.
- Aprendizaje de idiomas: generación de pronunciaciones de referencia en tamil para aplicaciones de autoaprendizaje, con la limitación de que solo acepta escritura tamil y números escritos como palabras.
- Sistemas de megafonía y avisos locales en entornos con conectividad limitada (estaciones, comercios, administraciones locales): el despliegue en CPU sin internet permite generar avisos pregrabados o dinámicos en hardware de bajo coste.
- Integración en pipelines de generación de contenido: producción por lotes de audio para vídeos, pódcast o materiales de marketing en tamil, usando `inference.py` como componente de un script mayor.

## Benchmarks y rendimiento

| Medida | Lyric Lite | Lyric Voice |
|---|---|---|
| Tasa de error de caracteres, frases | 2,77 % | 3,06 % |
| Tasa de error de caracteres, párrafos de 17 frases | 3,3 % | no disponible |
| Fallos del modelo (palabras omitidas, finales cortados, ráfagas, bucles) | 0,0 % (0 de 254 clips) | ver model card de Lyric Voice |
| Velocidad en CPU | 3,2× más rápido que Lyric Voice; 2,0× tiempo real en un hilo | referencia |
| Velocidad en teléfono Android económico | 3,2× tiempo real | no disponible |
| Tamaño | 418 MB | aproximadamente 3× mayor |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para ejecutarse en CPU. En caso de forzar GPU, los 420 MB de pesos caben holgadamente en cualquier GPU con más de 1 GB de memoria, aunque no se documenta soporte GPU.
- GPU recomendadas: no disponibles; el modelo no las requiere.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) por su tamaño reducido, pero el caso de uso previsto es CPU.
- Despliegue: `inference.py` incluido en el repositorio (Python 3.10 o superior, dependencias en `requirements.txt`), descarga vía `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,0× tiempo real en un solo hilo de CPU; 3,2× tiempo real en un teléfono Android económico. La primera ejecución carga unos 420 MB de pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Lyric Lite — Tamil | 109,5 M | tamil | Lyric Community License | On-device, CPU | Hugging Face |
| Lyric Voice — Tamil | 336 M | tamil | no disponible en la información | Mayor expresividad, más cómputo | Hugging Face |
| Lyric Lite — Telugu | no disponible | telugu | Lyric Community License | On-device, CPU | Hugging Face |
| Lyric Lite — Hindi | no disponible | hindi | Lyric Community License | On-device, CPU | Hugging Face |
| Lyric Lite — Malayalam | no disponible | malayalam | Lyric Community License | On-device, CPU | Hugging Face |
| Lyric Lite — Kannada | no disponible | kannada | Lyric Community License | On-device, CPU | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos TTS de otros desarrolladores (por ejemplo, sistemas de la familia IndicTTS o modelos multilingües comerciales) en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo admite tamil. El inglés en letras latinas no está soportado; las palabras inglesas deben transcribirse en escritura tamil.
- Los dígitos numéricos no están soportados: los números deben escribirse como palabras.
- El texto sin puntuación debe dividirse manualmente antes de pasarlo al modelo; de lo contrario, la segmentación automática no puede aplicarse.
- Riesgo de alucinación acústica limitado según la evaluación del autor (0 fallos en 254 clips), pero la evaluación la realiza el propio desarrollador y no se ha verificado de forma independiente.
- La licencia Lyric Community License es una licencia no estándar de categoría "other"; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones de explotación comercial no se detallan en la información disponible.
- No se documentan sesgos lingüísticos, de género o de acento; la única voz incluida es Ahana, lo que limita la diversidad de hablantes.
- El modelo se publicó con fecha de creación del 13 de noviembre de 2026 y cuenta con 2 descargas y 0 likes, por lo que la validación por parte de la comunidad es prácticamente inexistente.
- No hay información sobre el rendimiento con texto muy largo, cambios de dominio (técnico, jurídico, literario) ni con variedades dialectales del tamil.
- No se especifican requisitos de atribución ni restricciones de redistribución más allá de la referencia a la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-lite-tts-ta
- Modelo Lyric Voice — Tamil: https://huggingface.co/10X-Technologies/lyric-voice-tts-ta
- Lyric Lite — Telugu: https://huggingface.co/10X-Technologies/lyric-lite-tts-te
- Lyric Lite — Hindi: https://huggingface.co/10X-Technologies/lyric-lite-tts-hi
- Lyric Lite — Malayalam: https://huggingface.co/10X-Technologies/lyric-lite-tts-ml
- Lyric Lite — Kannada: https://huggingface.co/10X-Technologies/lyric-lite-tts-kn
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/10X-Technologies/lyric-lite-tts-ta/blob/main/LICENSE
- Transcripción de evaluación AI4Bharat IndicConformer 600M: no disponible como enlace en la información proporcionada
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
