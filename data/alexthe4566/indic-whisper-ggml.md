# alexthe4566/indic-whisper-ggml

## Resumen

`alexthe4566/indic-whisper-ggml` es una colección de pesos de Whisper convertidos al formato ggml para su uso con whisper.cpp, orientados al reconocimiento automático de voz (ASR) en 11 lenguas de la India y en Hinglish. No se trata de un modelo entrenado por el autor del repositorio: cada archivo proviene de un modelo Whisper ya afinado por terceros (Vasista Sai Lodagala, Oriserve, Mohammed Rakib, Ali Khawaja y AI4Bharat), que el autor ha convertido de PyTorch/safetensors a ggml y cuantizado a q5_1 o q5_0. La relevancia práctica está en que empaqueta en un único repositorio variantes listas para inferencia en dispositivo (on-device) con whisper.cpp v1.9.5, algo que normalmente exige realizar la conversión manualmente.

La colección cubre distintos tamaños de la familia Whisper: `base`, `small`, `medium` y `large-v3-turbo`, según el idioma. La mayoría de las lenguas (hindi, gujarati, tamil, telugu, kannada, bengalí, urdu) usan la variante `small` con cuantización q5_1; punjabi, malayalam, marathi y odia usan `medium` con q5_0; el Hinglish dispone de una variante `base` (q5_1) y otra `large-v3-turbo` (q5_0). El repositorio no aporta datos de entrenamiento propios, benchmarks ni métricas de calidad: solo los artefactos convertidos y cuantizados.

Es un repositorio con licencia mixta: Apache-2.0 para la mayoría de archivos y MIT para los cuatro derivados de AI4Bharat (punjabi, malayalam, marathi, odia), además de la licencia MIT original de OpenAI Whisper que subyace a todos ellos. Por su naturaleza es un recurso de despliegue, no un modelo de investigación: sirve para integrar ASR multilingüe indio en aplicaciones locales o de borde sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de Whisper (variantes base, small, medium y large-v3-turbo), convertido a ggml |
| Parametros totales | Depende del archivo: base (~74 M), small (~244 M), medium (~769 M), large-v3-turbo (~809 M); no disponible como cifra única en el repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (Whisper trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | q5_1 (hindi, gujarati, tamil, telugu, kannada, bengali, urdu, Hinglish base) y q5_0 (punjabi, malayalam, marathi, odia, Hinglish turbo) |
| Idiomas soportados | hi, gu, bn, ta, te, kn, ml, mr, pa, or, ur, en (Hinglish se decodifica como `en`) |
| Licencia | Mixta: Apache-2.0 (mayoría) y MIT (punjabi, malayalam, marathi, odia); pesos base de OpenAI Whisper bajo MIT |
| Formato de pesos | ggml (`.bin`), para whisper.cpp |

## Arquitectura y entrenamiento

Cada archivo es un modelo Whisper estándar (transformer encoder-decoder con atención, procesamiento de audio en ventanas de 30 segundos y tokenización multilingüe) que ha sido convertido de PyTorch/safetensors a ggml y cuantizado. El autor declara explícitamente que los pesos no se han modificado más allá de la conversión de formato y la cuantización. Por tanto, las decisiones de arquitectura, datos de entrenamiento, número de tokens y cualquier etapa de ajuste fino corresponden a los autores originales, no a este repositorio.

Los modelos de origen son: `vasista22/whisper-{hindi,gujarati,tamil,telugu,kannada}-small` (entrenados por Vasista Sai Lodagala en el Speech Lab del IIT Madras, con cómputo financiado por el proyecto Bhashini del MeitY, Gobierno de la India); `Oriserve/Whisper-Hindi2Hinglish-Swift` (base) y `Oriserve/Whisper-Hindi2Hinglish-Apex` (large-v3-turbo) para Hinglish; `Rakib/whisper-small-bn-crblp` para bengalí; `khawajaaliarshad/whisper-small-urdu` para urdu; y los modelos IndicWhisper de AI4Bharat (`AI4Bharat/vistaar`) para punjabi, malayalam, marathi y odia. No se detallan en la información disponible los volúmenes de datos de entrenamiento, la composición de los corpus ni si hubo etapas de RLHF o ajuste por preferencias en los modelos de origen.

La innovación técnica de este repositorio es operativa, no algorítmica: la cuantización q5_0/q5_1 reduce el tamaño de los pesos (por ejemplo, el `small` q5_1 ocupa 190.085.487 bytes y el `medium` q5_0 539.212.467 bytes) para permitir inferencia en CPU y dispositivos de borde mediante whisper.cpp. Se indica compatibilidad y pruebas con whisper.cpp v1.9.5.

## Capacidades

- Reconocimiento automático de voz (transcripción) en hindi, gujarati, bengalí, tamil, telugu, kannada, malayalam, marathi, punjabi, odia, urdu e inglés.
- Transcripción de voz en hindi con salida en Hinglish romanizado (variantes base y large-v3-turbo).
- Ejecución local en CPU mediante whisper.cpp, sin necesidad de GPU ni de servicios en la nube.
- Soporte de cuantización q5_0 y q5_1 para reducir huella de memoria y disco.
- Odia se decodifica utilizando el código de idioma `hi` según las notas del autor.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling ni agentes; es exclusivamente un modelo ASR.

## Casos de uso

- Subtitulado en dispositivo de vídeo en lenguas indias: integrar los archivos `small`/`medium` en una aplicación de escritorio o móvil con whisper.cpp para generar subtítulos sin enviar audio a la nube, aprovechando que los pesos cuantizados caben en memoria modesta.
- Transcripción de reuniones y notas de voz en hindi o gujarati: usar `ggml-hindi-small-q5_1.bin` o `ggml-gujarati-small-q5_1.bin` en un pipeline local de dictado, con la ventaja de que el modelo `small` cuantizado ocupa unos 190 MB.
- Procesamiento de audio en Hinglish para atención al cliente: la variante `ggml-hinglish-turbo-q5_0.bin` (large-v3-turbo) transcribe habla hindi y la emite en Hinglish romanizado, útil para analítica de llamadas y generación de transcripciones legibles para equipos que trabajan en ese registro mixto.
- Investigación lingüística en lenguas de bajos recursos: emplear los modelos `medium` de punjabi, malayalam, marathi u odia (derivados de IndicWhisper de AI4Bharat) para corpus de habla en estas lenguas, con licencia MIT que facilita su reutilización académica.
- Accesibilidad y asistentes de voz offline: desplegar transcripción en tamil, telugu, kannada o bengalí en dispositivos sin conectividad, usando las variantes `small` q5_1 para mantener latencia y consumo bajos.
- Archivado y búsqueda de audio en bibliotecas multimedia: transcribir lotes de grabaciones en urdu o bengalí con los modelos `small` y construir índices de texto para búsqueda, dado el reducido tamaño de los pesos y la facilidad de ejecución en CPU.
- Prototipado rápido de ASR multilingüe: al reunir varias lenguas y tamaños en un solo repositorio con formato ggml, permite comparar variantes `base`, `small`, `medium` y `large-v3-turbo` sin conversiones manuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU con whisper.cpp; en GPU, el `small` q5_1 (~190 MB de pesos) requiere muy poca memoria, el `medium` q5_0 (~539 MB) y el `large-v3-turbo` q5_0 (~574 MB) también caben en GPUs de consumo, aunque no se aportan cifras oficiales de VRAM.
- GPU recomendadas: no disponible en la informacion proporcionada; al ser formatos ggml para whisper.cpp, el uso previsto es CPU.
- ¿Cabe en GPU de consumo? Sí, por el tamaño de los archivos (entre ~60 MB y ~574 MB), aunque no se documentan requisitos oficiales.
- Opciones de despliegue: whisper.cpp v1.9.5 (versión probada por el autor); no se indica compatibilidad con vLLM, TGI, Ollama o llama.cpp.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| indic-whisper-ggml (este repo) | base/small/medium/large-v3-turbo según archivo | Ventanas de 30 s (Whisper) | 11 lenguas indias + en | Apache-2.0 / MIT | ggml |
| openai/whisper-small | ~244 M | Ventanas de 30 s | Multilingüe amplio | MIT | safetensors, ggml (conversión manual) |
| AI4Bharat IndicWhisper (vistaar) | small/medium | Ventanas de 30 s | Lenguas indias | MIT | safetensors (origen) |
| vasista22/whisper-*-small | ~244 M | Ventanas de 30 s | Una lengua por modelo | Apache-2.0 | safetensors (origen) |

No se dispone de métricas comparativas de calidad (WER) en la información proporcionada para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del repositorio: los pesos provienen de terceros y solo se han convertido y cuantizado; cualquier mérito o defecto de entrenamiento corresponde a los autores originales.
- No se publican métricas de calidad (WER, CER) ni benchmarks, por lo que no hay evidencia cuantitativa del rendimiento de estas conversiones frente a los modelos originales en safetensors.
- La cuantización q5_0/q5_1 puede introducir una degradación menor de precisión respecto a los pesos originales; no se documenta su magnitud.
- Licencia mixta: Apache-2.0 para la mayoría de archivos y MIT para punjabi, malayalam, marathi y odia; es necesario revisar la licencia de cada archivo antes de uso comercial. Todos derivan de OpenAI Whisper (MIT).
- Odia requiere decodificar con el código de idioma `hi`, lo que puede afectar a la selección automática de idioma en pipelines genéricos.
- Riesgo de alucinación típico de Whisper en audio ruidoso, silencios o segmentos musicales; no se documentan mitigaciones específicas.
- Cobertura limitada a las lenguas listadas; no se indica soporte para otras lenguas indias ni para variantes dialectales.
- Sin datos sobre sesgos demográficos, acentos o calidad en habla espontánea; conviene evaluar en el dominio objetivo antes de producción.
- Compatibilidad declarada con whisper.cpp v1.9.5; versiones distintas pueden requerir verificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alexthe4566/indic-whisper-ggml
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Modelos de origen (hindi, gujarati, tamil, telugu, kannada): https://huggingface.co/vasista22/whisper-hindi-small, https://huggingface.co/vasista22/whisper-gujarati-small, https://huggingface.co/vasista22/whisper-tamil-small, https://huggingface.co/vasista22/whisper-telugu-small, https://huggingface.co/vasista22/whisper-kannada-small
- Hinglish (Oriserve): https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Swift, https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex
- Bengalí: https://huggingface.co/Rakib/whisper-small-bn-crblp
- Urdu: https://huggingface.co/khawajaaliarshad/whisper-small-urdu
- IndicWhisper (AI4Bharat): https://github.com/AI4Bharat/vistaar
- OpenAI Whisper: https://github.com/openai/whisper
