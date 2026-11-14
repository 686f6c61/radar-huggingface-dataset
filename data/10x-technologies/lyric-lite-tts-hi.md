# 10X-Technologies/lyric-lite-tts-hi

## Resumen

Lyric Lite — Hindi es un modelo de síntesis de voz (text-to-speech) monolingüe en hindi desarrollado por 10X Technologies. Con 109,5 millones de parámetros, es la variante compacta de la familia Lyric, destilada a partir de Lyric Voice (336M) para conservar la precisión del modelo grande con un tercio del tamano. Su objetivo es claro: llevar TTS de calidad a dispositivos sin GPU y sin conexión, como teléfonos Android de gama baja, portátiles y ordenadores pequenos.

El modelo destaca por su eficiencia: según la model card, genera audio 3,2 veces más rápido que el tiempo real en un teléfono Android económico y 1,8 veces más rápido que el tiempo real en un solo hilo de CPU. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors. La salida de audio es a 24 kHz.

Es relevante ahora porque cubre un nicho poco atendido: TTS neuronal de calidad para hindi en inferencia on-device, con una tasa de error de caracteres del 2,08 % medida con AI4Bharat IndicConformer 600M, ligeramente mejor que la del modelo mayor (2,94 %). La licencia es la Lyric Community License, que no es de código abierto estándar y debe revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz; no se detalla en la información proporcionada) |
| Parametros totales | 109.502.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi), monolingüe |
| Licencia | lyric-community-license (licencia comunitaria propia, marcada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de red, mecanismo de atención, componentes de vocoder o tokenizador acústico). Se sabe que es un modelo de TTS destilado de Lyric Voice, el modelo de 336M parámetros de la misma familia, reducido a aproximadamente un tercio de su tamano manteniendo la precisión. La model card indica que ambos modelos se evaluaron con las mismas frases reservadas, las mismas semillas, el mismo clip de voz y el mismo código, lo que permite una comparación directa.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o ajuste fino con preferencias. Tampoco se detallan innovaciones técnicas concretas más allá de la propia destilación y de la optimización para inferencia en CPU. El modelo incluye una voz predefinida llamada Ahana (`voices/ahana.wav`) que se usa por defecto.

## Capacidades

- Síntesis de voz en hindi a partir de texto en escritura devanagari.
- Generación de audio a 24 kHz con inferencia en CPU, sin GPU ni conexión a internet.
- Manejo de palabras en inglés siempre que estén escritas en devanagari; el inglés en alfabeto latino no está soportado.
- Segmentación automática de texto largo por puntuación (`।`, `.`, `?`, `!`) y por comas en frases muy largas.
- Limpieza automática de caracteres invisibles y aviso de caracteres no pronunciables.
- Soporte de lectura de números únicamente si se escriben como palabras; los dígitos no están soportados.
- Voz predefinida (Ahana) incluida en el repositorio.
- No se documentan en la información disponible capacidades de clonación de voz, control de emociones, tool calling ni razonamiento multi-paso.

## Casos de uso

- **Asistentes de voz on-device en hindi**: integración en aplicaciones Android para leer notificaciones, mensajes o respuestas de un asistente sin depender de la nube, aprovechando la velocidad de 3,2 veces el tiempo real en un teléfono económico.
- **Accesibilidad para personas con discapacidad visual**: lectura de contenido en hindi (artículos, correos, interfaces) directamente en el dispositivo, con latencia baja y sin coste de API.
- **Aprendizaje de idiomas**: generación de pronunciaciones de ejemplo en hindi para aplicaciones educativas offline, útil en zonas con conectividad limitada.
- **Lectura de noticias y contenidos largos**: el modelo segmenta párrafos y frases largas automáticamente, lo que permite narrar artículos o documentos extensos de forma fluida.
- **Sistemas de navegación y avisos por voz**: indicaciones habladas en hindi en entornos embebidos o de automoción con recursos de cómputo limitados.
- **Audioguías y contenido turístico offline**: generación de narraciones en hindi para museos, monumentos o aplicaciones de viaje que deben funcionar sin internet.
- **Prototipado rápido de productos de voz**: al necesitar solo CPU y un repositorio de 0,4 GB, permite validar ideas de TTS en hindi en portátiles convencionales sin infraestructura GPU.

## Benchmarks y rendimiento

Los datos de evaluación publicados en la model card comparan Lyric Lite con Lyric Voice sobre 254 clips por modelo, con las mismas frases reservadas, semillas, clip de voz y código:

| Medida | Lyric Lite | Lyric Voice |
|---|---|---|
| Tasa de error de caracteres (frases) | 2,08 % | 2,94 % |
| Tasa de error de caracteres (párrafos de 17 frases) | 1,7 % | no disponible |
| Fallos del modelo (palabras omitidas, finales cortados, ráfagas, bucles) | 0,4 % (1 de 254 clips) | no disponible |
| Velocidad en CPU (un hilo) | 1,8× tiempo real | no disponible |
| Velocidad relativa en CPU | 3,1× más rápido que Lyric Voice | referencia |
| Velocidad en teléfono Android económico | 3,2× tiempo real | no disponible |
| Tamano | 418 MB | aproximadamente 3× mayor |

La tasa de error de caracteres se midió transcribiendo el audio generado con AI4Bharat IndicConformer 600M (CTC, greedy, sin modelo de lenguaje) e incluye los errores propios del reconocedor. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de TTS.

## Requisitos de hardware

- **VRAM estimada**: no aplica para inferencia en CPU; el modelo está disenado para ejecutarse sin GPU. En caso de usar GPU, no se especifica el consumo de memoria en la información disponible.
- **Memoria RAM**: la primera ejecución carga aproximadamente 420 MB de pesos, por lo que basta con menos de 1 GB de RAM libre para la inferencia.
- **GPU recomendadas**: no se requieren; el modelo está optimizado para CPU. No se documentan requisitos ni rendimiento en GPU.
- **Compatibilidad con GPU de consumo**: no aplica, ya que el caso de uso principal es CPU y dispositivos móviles.
- **Opciones de despliegue**: el repositorio incluye `inference.py` y `requirements.txt` para ejecución directa con Python 3.10 o superior. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- **Latencia y throughput**: 1,8 veces más rápido que el tiempo real en un solo hilo de CPU y 3,2 veces más rápido que el tiempo real en un teléfono Android económico, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Tamano | Licencia | Enfoque |
|---|---|---|---|---|---|
| Lyric Lite — Hindi | 109,5M | hindi | 418 MB | lyric-community-license | TTS on-device en CPU |
| Lyric Voice — Hindi | 336M | hindi | aproximadamente 3× Lyric Lite | lyric-community-license | TTS de mayor expresividad con más cómputo |
| Lyric Lite — Telugu | no disponible | telugu | no disponible | lyric-community-license | TTS on-device en CPU |
| Lyric Lite — Tamil | no disponible | tamil | no disponible | lyric-community-license | TTS on-device en CPU |

Dentro de la información disponible no se identifican modelos de terceros comparables con especificaciones verificables. La comparación más directa es con Lyric Voice, de la misma familia: Lyric Lite ofrece una tasa de error de caracteres ligeramente mejor (2,08 % frente a 2,94 %) con un tercio del tamano y mayor velocidad en CPU, a costa de una expresividad presumiblemente menor, según la propia model card.

## Limitaciones y advertencias

- **Monolingüe**: solo soporta hindi; no se debe esperar calidad en otros idiomas.
- **Escritura restringida**: solo acepta devanagari. El inglés en alfabeto latino no está soportado y los dígitos numéricos tampoco; deben escribirse como palabras.
- **Puntuación necesaria**: el texto sin puntuación debe segmentarse manualmente antes de pasarlo al modelo; de lo contrario, la calidad puede degradarse.
- **Riesgo de fallos de síntesis**: la model card reporta un 0,4 % de clips con fallos (palabras omitidas, finales cortados, ráfagas o bucles), lo que exige validación en producción.
- **Licencia restrictiva**: la Lyric Community License no es una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial o redistribución.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado con una voz concreta (Ahana), la diversidad de voces es limitada.
- **Alucinación acústica**: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos, especialmente con texto ambiguo o mal puntuado.
- **Información técnica incompleta**: no se detallan arquitectura interna, datos de entrenamiento ni opciones de cuantización, lo que dificulta auditorías técnicas profundas.
- **Madurez**: el repositorio registra 2 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy temprana y poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-lite-tts-hi
- Lyric Voice — Hindi (modelo mayor de la familia): https://huggingface.co/10X-Technologies/lyric-voice-tts-hi
- Lyric Lite — Telugu: https://huggingface.co/10X-Technologies/lyric-lite-tts-te
- Lyric Lite — Tamil: https://huggingface.co/10X-Technologies/lyric-lite-tts-ta
- Lyric Lite — Malayalam: https://huggingface.co/10X-Technologies/lyric-lite-tts-ml
- Lyric Lite — Kannada: https://huggingface.co/10X-Technologies/lyric-lite-tts-kn
- Licencia (Lyric Community License): https://huggingface.co/10X-Technologies/lyric-lite-tts-hi/blob/main/LICENSE
