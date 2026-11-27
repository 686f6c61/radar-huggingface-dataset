# gnumanth/swanada

## Resumen

Swanada (स्वनद, "corriente acústica resonante" en sánscrito) es una suite de reconocimiento automático del habla (ASR) multilingüe para 16 kHz, diseñada para ejecutarse íntegramente en el navegador, Node.js y Python sin dependencias de nube. La desarrolla el autor independiente gnumanth (hemanth) y se publica bajo licencia MIT. Cubre sánscrito clásico, inglés indio y diez lenguas índicas (hindi, kannada, maratí, bengalí, tamil, telugu, malayalo, guyaratí, panyabí y odia) con una arquitectura Conformer-CTC cuantizada a INT8 en formato ONNX.

Su rasgo diferencial es una arquitectura de dos niveles enrutada por capacidad: un nivel Mobile de 25,35 MiB (Conformer de 14 capas, dimensión 256, 23,56 M de parámetros) para móviles y un nivel Studio de 177,4 MiB (17 capas, dimensión 512, 115,2 M de parámetros) para escritorio y servidores. Ambos comparten cabezas por idioma de 515 KiB más una cabeza de identificación automática de idioma (LID) de 396 KiB, lo que permite enrutar el audio entre las 12 lenguas en una sola pasada del codificador.

Es relevante ahora porque demuestra ASR multilingüe de calidad razonable con huella mínima y latencia muy baja (RTF de 0,009x en Mobile y 0,021x en Studio) sobre CPU, sin GPU ni servidor, lo que habilita reconocimiento de voz privado y offline en dispositivos de gama baja y aplicaciones web con WebAssembly y WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (encoder compartido + cabezas CTC por idioma + cabeza LID) |
| Parametros totales | 23,56 M (Mobile, 14 capas, d=256); 115,2 M (Studio, 17 capas, d=512) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio de 16 kHz; ventana de inferencia no especificada) |
| Tipos de cuantizacion | INT8 (ONNX); se menciona una linea base FP32 para comparacion |
| Idiomas soportados | sa, en (indio), hi, kn, mr, bn, ta, te, ml, gu, pa, or |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder INT8) + cabezas binarias `.bin` por idioma y `lid.bin` |

## Arquitectura y entrenamiento

El modelo emplea un codificador Conformer compartido entre idiomas, seguido de cabezas CTC específicas por lengua y una cabeza de identificación automática de idioma. La LID usa *attentive statistics pooling* (media y desviación típica) sobre los estados ocultos del Conformer (capa `layer_norm_84`), fusionada con la certeza acústica de la CTC, y resuelve las 12 lenguas en una única pasada del codificador. Existe además un modo de code-switching (`code_switch_en`) que proyecta simultáneamente los estados a través de la cabeza índica detectada y la cabeza inglesa, preservando palabras técnicas en inglés en script latino y el resto en script brahmico nativo.

Los datos de entrenamiento provienen de `ai4bharat/IndicVoices`, `ai4bharat/vistaar`, `mozilla-foundation/common_voice_17_0` y `prathoshap/sushrota-sanskrit-asr`. No se especifican en la información disponible el número total de horas, la composición exacta del dataset ni si hubo etapas de ajuste fino supervisado adicionales. Destaca un mecanismo de compuerta de no-habla multietapa (espectral, de modulación y de formantes) que garantiza cero alucinaciones en clips silenciosos, con 0 palabras inventadas sobre 100 clips de silencio, zumbido y ruido térmico.

## Capacidades

- Transcripción de voz a texto en 16 kHz para sánscrito, inglés indio y diez lenguas índicas.
- Identificación automática de idioma entre 12 lenguas en menos de 1 ms (100,0 % de acierto en Studio, 95,42 % en Mobile sobre 240 clips no vistos).
- Code-switching índico-inglés con preservación de script (latino para inglés, brahmico para índico).
- Detección de no-habla y supresión de alucinaciones en silencio y ruido.
- Ejecución en navegador mediante ONNX Runtime Web (WebAssembly y WebGPU), en Node.js y en Python.
- Soporte de caché offline en móvil vía CacheStorage.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Subtitulado en directo en navegador: el nivel Mobile (25,35 MiB) permite transcribir audio en tiempo real en iOS Safari y Android Chrome con RTF de 0,009x, sin enviar audio a ningún servidor.
- Asistentes de voz privados para lenguas índicas: la LID automática con 100 % de acierto en Studio elimina la selección manual de idioma en aplicaciones de dictado y asistentes para usuarios de hindi, tamil, telugu o bengalí.
- Transcripción de sánscrito para investigación y educación: con CER del 4,50 % y WER del 24,95 % en el nivel Studio, es adecuado para digitalizar recitaciones y material docente en devanagari.
- Reuniones técnicas con code-switching: el modo `code_switch_en` mantiene los términos técnicos en inglés y el resto en script índico, útil en equipos de ingeniería de India que mezclan idiomas.
- Aplicaciones de accesibilidad sin conexión: la ejecución en WebAssembly con caché offline permite dictado por voz en dispositivos sin conectividad o con políticas de privacidad estrictas.
- Procesamiento por lotes en Python o Node.js: con RTF de 0,0227x en CPU, se pueden transcribir grandes volúmenes de audio en servidores sin GPU.
- Filtrado de audio no verbal en pipelines: la compuerta de no-habla con 0 palabras inventadas en 100 clips silenciosos evita falsos positivos en sistemas de monitorización y grabación continua.

## Benchmarks y rendimiento

Resultados publicados en la model card (N = 1.600 clips de test no vistos; intervalos de confianza bootstrap del 95 %):

| Benchmark / metrica | Swanada Studio (177,4 MiB) | Swanada Mobile (25,35 MiB) | Shruti (Udgam Labs, 356,2 MB) |
|---|---|---|---|
| WER medio 10 lenguas índicas (FLEURS test) | 24,18 % | 50,15 % | 32,20 % |
| CER 12 lenguas (FLEURS + Wild, n=1.200) | 8,25 % [7,41; 9,29] | 19,23 % [18,16; 20,41] | No disponible |
| CER global 16 suites (n=1.600) | 10,44 % [9,62; 11,30] | 22,14 % [21,13; 23,11] | No disponible |
| LibriSpeech test-clean CER / WER | 5,90 % / 13,90 % | 14,30 % / 33,75 % | — / 5,95 % |
| GLOBE multiacento CER / WER | 9,89 % / 23,76 % | 21,92 % / 47,81 % | — / 22,47 % |
| Precision LID automática (n=240) | 100,00 % | 95,42 % | No disponible |
| Palabras inventadas en 100 clips silenciosos | 0 | 0 | 0 |

Resultados por idioma en el conjunto retenido (480 enunciados, nivel Studio INT8):

| Idioma | Script | CER (%) | WER (%) |
|---|---|---|---|
| Sánscrito (sa) | Devanagari | 4,50 | 24,95 |
| Inglés indio (en) | Latino | 3,94 | 9,42 |
| Hindi (hi) | Devanagari | 2,55 | 9,72 |
| Kannada (kn) | Kannada | 6,09 | 34,28 |
| Maratí (mr) | Devanagari | 5,82 | No disponible (truncado en la informacion) |

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está pensada para CPU. El nivel Mobile ocupa 25,35 MiB más 515 KiB de cabeza; el Studio, 177,4 MiB más 515 KiB.
- GPU recomendadas: no aplica; WebGPU se menciona como backend de ONNX Runtime Web, pero no se especifican modelos de GPU.
- GPU de consumo: irrelevante para el despliegue previsto; cabe en cualquier dispositivo con navegador moderno, incluidos móviles de gama baja.
- Despliegue: ONNX Runtime Web (WebAssembly y WebGPU), Node.js y Python; el repositorio incluye SDKs multi-runtime.
- Latencia y throughput: RTF de 0,009x (Mobile) y 0,021x (Studio) en CPU; TTFT p50 de 28,6 ms en ambos niveles; sin *committed churn* (0,00 % en 72 casos).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Huella | CER / WER destacado | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|---|
| Swanada Studio | 115,2 M | 12 | 177,4 MiB | 5,35 % CER / 25,08 % WER (retenido) | MIT | Si (ONNX Runtime Web) |
| Swanada Mobile | 23,56 M | 12 | 25,35 MiB | 18,58 % CER / 59,11 % WER (retenido) | MIT | Si |
| Shruti (Udgam Labs) | No disponible | 12 | 356,2 MB | 32,20 % WER medio índico; 5,95 % WER LibriSpeech | No disponible | No disponible |
| Whisper (OpenAI) | No disponible en la informacion | Multilingue | No disponible | No disponible en la informacion | MIT | Parcial (via ONNX) |

La información proporcionada solo incluye datos comparativos frente a Shruti; no se detallan parámetros ni contexto de Whisper u otros modelos, por lo que la comparación con alternativas adicionales queda como no disponible.

## Limitaciones y advertencias

- El WER en varias lenguas índicas es alto: kannada 34,28 %, sánscrito 24,95 % y maratí sin dato completo; la calidad es muy variable entre idiomas.
- El nivel Mobile degrada notablemente la precisión (WER medio índico del 50,15 % frente al 24,18 % de Studio), por lo que no es apto para transcripción de calidad.
- El contexto de audio y la longitud máxima de utterance no se especifican; podría haber degradación en grabaciones largas o con ruido.
- No se documentan sesgos demográficos, de acento o de género; el rendimiento en acentos no representados en los datasets de entrenamiento es incierto.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia y licencias de los datasets de entrenamiento (Common Voice, IndicVoices) antes de uso en producción.
- El repositorio pesa 8,9 GB, aunque los modelos activos son mucho menores; conviene descargar solo los artefactos necesarios.
- No hay datos publicados sobre tool calling, agentes ni otras capacidades más allá del ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gnumanth/swanada
- Repositorio GitHub y SDKs: https://github.com/hemanth/swanada
- Playground en GitHub Pages: https://hemanth.github.io/swanada/
- AI Studio del autor: https://h3manth.com/ai/swanada/
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset Vistaar: https://huggingface.co/datasets/ai4bharat/vistaar
- Dataset Common Voice 17: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Dataset Sushrota Sanskrit ASR: https://huggingface.co/datasets/prathoshap/sushrota-sanskrit-asr
