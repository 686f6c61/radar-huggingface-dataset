# kaptionai/Rumble-2-Flash-GGUF

## Resumen

Rumble-2-Flash-GGUF es un espejo no oficial, mantenido por kaptionai, de la conversión a formato GGUF del modelo de reconocimiento automático del habla Rumble-2-Flash, desarrollado originalmente por Reson8. El modelo base es un ajuste fino de Qwen3-ASR-0.6B (Alibaba Qwen) en el que se ha recortado el decodificador a 14 capas y el vocabulario a 99.630 tokens, lo que reduce el tamaño total a unos 322 millones de parámetros. La conversión y cuantización original corresponde a AtomicChat, y este repositorio se limita a replicar dos ficheros byte a byte idénticos a los del upstream, con nombres distintos, para garantizar una fuente de descarga estable.

El modelo resuelve el problema de transcripción de audio a texto en 45 idiomas, con un enfoque práctico: empaquetado en dos ficheros GGUF (un decodificador de texto cuantizado Q5_K_M de 283 MB y un codificador de audio más proyector en Q8_0 de 214 MB) que se ejecutan con llama.cpp y la librería libmtmd, tanto en CPU como en GPU. Es relevante porque permite desplegar ASR multilingüe en hardware modesto, incluidos equipos de escritorio con Windows, sin depender de infraestructura en la nube.

La arquitectura subyacente es la de Qwen3-ASR, un modelo encoder-decoder con codificador de audio y decodificador transformer, adaptado aquí mediante ajuste fino y poda de capas. La licencia Apache 2.0 facilita su uso comercial, aunque el espejo no está respaldado por Reson8, AtomicChat ni Alibaba Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder basada en Qwen3-ASR (codificador de audio + decodificador transformer recortado a 14 capas) |
| Parámetros totales | 322.255.360 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Decodificador de texto en Q5_K_M; codificador de audio y proyector en Q8_0 |
| Idiomas soportados | 45 idiomas: af, ar, bn, bs, ca, ceb, cs, da, de, el, en, es, eu, fa, fi, fil, fr, hi, hr, hu, id, is, it, ja, ko, lt, lv, mk, ms, mt, nb, nl, pl, pt, ro, ru, sq, sr, sv, th, tr, uk, vi, yue, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: decodificador de texto y mmproj de audio) |

## Arquitectura y entrenamiento

El modelo base Reson8/Rumble-2-Flash es un ajuste fino de Qwen/Qwen3-ASR-0.6B, un modelo de reconocimiento automático del habla con arquitectura encoder-decoder: un codificador procesa la señal de audio y un decodificador transformer genera la transcripción. En este ajuste fino se ha recortado el decodificador a 14 capas y el vocabulario a 99.630 tokens, lo que explica que el total de parámetros (322 millones) sea inferior al del modelo original de 0,6 mil millones.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a GGUF y la cuantización fueron realizadas por AtomicChat; el repositorio de kaptionai es un espejo sin modificaciones. El runtime emplea llama.cpp con libmtmd, que aporta soporte para la entrada de audio de Qwen3-ASR, y el par de ficheros está pensado para ejecutarse con decodificación greedy (temperatura 0) y pasando el idioma de forma explícita para evitar que la salida comience con el prefijo `language <Name><asr_text>`.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 45 idiomas, incluidos español, inglés, portugués, chino, árabe, hindi, japonés, coreano y cantonés (yue).
- Procesamiento de audio mediante codificador dedicado empaquetado en el fichero mmproj.
- Ejecución en CPU o GPU a través de llama.cpp con libmtmd.
- Salida de texto plano, sin marcas de tiempo por palabra.
- Selección explícita de idioma en la invocación para evitar prefijos no deseados en la salida.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Transcripción de reuniones y notas de voz en equipos de escritorio: el par de ficheros GGUF se ejecuta con llama-server en CPU o GPU, lo que permite transcribir audio localmente sin enviar datos a servicios externos, algo adecuado para entornos con requisitos de privacidad.
- Subtitulado y accesibilidad en aplicaciones de escritorio: al soportar 45 idiomas y funcionar en hardware de consumo, puede integrarse en herramientas de subtitulado en tiempo casi real para vídeos y podcasts.
- Procesamiento por lotes de archivos de audio multilingües: la licencia Apache 2.0 y el tamaño reducido (menos de 500 MB en total) permiten desplegar el modelo en pipelines de transcripción masiva sin costes de licencia.
- Asistentes de voz para atención al cliente: la transcripción local en el dispositivo reduce la latencia y evita depender de APIs externas, aunque requiere un control de actividad de voz previo para no enviar silencios al modelo.
- Investigación en ASR multilingüe: al ser un ajuste fino de Qwen3-ASR con decodificador recortado, sirve como punto de partida para estudiar el equilibrio entre tamaño y precisión en modelos pequeños.
- Integración en aplicaciones de Windows: el par de ficheros está pensado para llama.cpp en equipos de escritorio con Windows, lo que facilita su incorporación en utilidades nativas de dictado o transcripción.
- Evaluación comparativa de cuantizaciones: los ficheros Q5_K_M y Q8_0 permiten medir el impacto de la cuantización en la tasa de error de palabras en distintos idiomas.

## Benchmarks y rendimiento

Los datos disponibles son mediciones realizadas por kaptionai, no benchmarks estándar publicados por el autor original.

| Prueba | Conjunto | Métrica | Rumble-2-Flash | Qwen3-ASR-0.6B (Q4_K_M) |
|---|---|---|---|---|
| Chino | FLEURS, 40 clips, Apple silicon con encoder Core ML | Tasa de error de caracteres | 7,4 | 5,4 |
| Inglés, español y portugués | FLEURS, 240 clips, llama.cpp en Metal | Tasa de error de palabras | 3,9 | 5,6 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en total para el par de ficheros (283 MB del decodificador Q5_K_M más 214 MB del mmproj Q8_0), más el overhead del runtime y del búfer de audio.
- GPU recomendadas: cualquier GPU compatible con llama.cpp; el modelo cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060 o RTX 4090. También se ha probado en Apple silicon con Metal y con encoder Core ML.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre; también funciona en CPU.
- Opciones de despliegue: llama.cpp con libmtmd mediante `llama-server`; el comando recomendado es `llama-server -m Rumble-2-Flash.AD-Q5_K_M.gguf --mmproj Rumble-2-Flash.mmproj-Q8_0.gguf -ngl 99`.
- Latencia y throughput: no disponibles de forma cuantificada en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Rumble-2-Flash (este espejo GGUF) | 322 M | No disponible | 45 | Apache 2.0 | GGUF |
| Qwen3-ASR-0.6B | 0,6 B | No disponible | No disponible | Apache 2.0 | Pesos originales |
| Whisper (variantes pequeñas) | No disponible en la información | No disponible | No disponible | No disponible | No disponible |

La comparación directa con Qwen3-ASR-0.6B es la más relevante: Rumble-2-Flash reduce el decodificador a 14 capas y el vocabulario a 99.630 tokens, y en las mediciones de kaptionai mejora la tasa de error de palabras en inglés, español y portugués (3,9 frente a 5,6) pero empeora en chino (7,4 frente a 5,4 en tasa de error de caracteres). No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El chino es más débil que en Qwen3-ASR-0.6B: tasa de error de caracteres de 7,4 frente a 5,4 en las mediciones de kaptionai sobre FLEURS.
- El modelo inventa texto ante silencio digital: en clips sintéticos sin habla genera frases en bucle. Es necesario colocar una puerta de detección de actividad de voz antes del modelo y no enviarle silencios.
- Los clips cortos requieren la corrección de padding: llama.cpp estándar pasa el relleno de ceros al final del clip como si fuera sonido, y los clips cortos terminan con palabras que nunca se dijeron. La model card de AtomicChat describe la corrección.
- No soporta hebreo; los 45 idiomas son los listados en los metadatos.
- No genera marcas de tiempo por palabra; la salida es solo texto.
- Es un espejo no oficial: no está respaldado por Reson8, AtomicChat ni Alibaba Qwen, y los nombres de fichero difieren de los del upstream.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de la conversión original antes de desplegarlo en producción.
- Riesgo de alucinación en audio con ruido o sin voz clara, dado el comportamiento observado ante silencio.

## Enlaces

- Repositorio del espejo: https://huggingface.co/kaptionai/Rumble-2-Flash-GGUF
- Repositorio upstream de la conversión GGUF: https://huggingface.co/AtomicChat/Rumble-2-Flash-GGUF
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
