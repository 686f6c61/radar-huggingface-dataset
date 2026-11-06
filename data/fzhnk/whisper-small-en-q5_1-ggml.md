# fzhnk/whisper-small.en-q5_1-ggml

## Resumen

Este repositorio no es un modelo nuevo, sino un espejo (mirror) byte-idéntico del fichero `ggml-small.en-q5_1.bin` procedente del repositorio oficial `ggerganov/whisper.cpp` de Hugging Face. El modelo subyacente es Whisper `small.en` de OpenAI, un modelo de reconocimiento automático de habla (ASR) con 244 millones de parámetros, especializado exclusivamente en inglés, convertido y cuantizado a 5 bits (q5_1) mediante las herramientas del proyecto whisper.cpp de Georgi Gerganov.

La razón de ser de este mirror es puramente operativa: el autor (fzhnk) lo mantiene para que las instalaciones de su herramienta "interview-bro" puedan descargar siempre exactamente el mismo fichero binario contra el que fueron compiladas, garantizando reproducibilidad mediante el hash SHA-256 publicado. Esto es una práctica habitual en despliegues de producción, donde un cambio silencioso en el fichero original podría romper la compatibilidad.

Con un tamaño de unos 190 MB, la versión cuantizada q5_1 es adecuada para ejecutarse en CPU y en equipos de consumo sin GPU dedicada, lo que lo hace idóneo para transcripción local de audio en inglés dentro de aplicaciones de escritorio o pipelines ligeros. Al tratarse de la variante `.en`, su rendimiento en inglés es superior al del modelo multilingüe equivalente, pero no soporta traducción ni otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 244 M (Whisper small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento en Whisper) |
| Tipos de cuantizacion | q5_1 (GGML/GGUF) |
| Idiomas soportados | Ingles (variante .en) |
| Licencia | MIT (pesos originales de OpenAI y conversion whisper.cpp) |
| Formato de pesos | GGML binario (`ggml-small.en-q5_1.bin`, 190.098.681 bytes, SHA-256 `bfdff4894dcb76bbf647d56263ea2a96645423f1669176f4844a1bf8e478ad30`) |

## Arquitectura y entrenamiento

Whisper es una arquitectura transformer encoder-decoder entrenada por OpenAI para reconocimiento de habla. El encoder procesa representaciones log-Mel del audio (en ventanas de 30 segundos) y el decoder genera los tokens de texto de forma autoregresiva. La variante `small` cuenta con 244 millones de parametros y fue entrenada (junto al resto de la familia Whisper) sobre aproximadamente 680.000 horas de audio multilingue; la version `small.en` es el punto de control especializado unicamente en ingles, lo que mejora su precision en transcripcion en ese idioma y elimina la tarea de traduccion.

El fichero de este repositorio no es el punto de control original, sino una conversion al formato GGML realizada por el proyecto whisper.cpp, con cuantizacion q5_1 (5 bits con bloque de escala). Esta cuantizacion reduce el tamaño de unos 465 MB del modelo en fp16 a unos 190 MB, con una perdida de precision minima en la transcripcion, a cambio de una ejecucion mucho mas ligera en CPU. No hay datos publicados en la model card sobre entrenamiento adicional, fine-tuning ni RLHF: el repositorio se limita a distribuir los pesos convertidos sin modificaciones (byte-identical).

## Capacidades

- Transcripcion automatica de habla en ingles (speech-to-text), tarea para la que fue diseñado Whisper small.en.
- Puntuacion y capitalizacion automaticas: Whisper genera texto con formato, sin necesidad de postproceso basico.
- Deteccion de silencios y segmentacion por ventanas de 30 segundos gestionada por whisper.cpp.
- Ejecucion local y offline en CPU gracias al formato GGML y a la cuantizacion q5_1.
- No soporta traduccion (esa capacidad esta reservada a los modelos multilingues de Whisper).
- No soporta idiomas distintos del ingles al ser la variante `.en`.
- No tiene capacidades de tool calling, agentes, razonamiento ni generacion de texto general: es un modelo ASR puro.

## Casos de uso

- Transcripcion local en aplicaciones de escritorio: con 190 MB de pesos y ejecucion en CPU, es adecuado para integrar dictado o subtitulado offline sin depender de la nube; de hecho, el propio mirror existe para abastecer a la herramienta "interview-bro".
- Subtitulado de videos en ingles: whisper.cpp procesa ficheros de audio y video y genera salida en formato SRT/VTT, util en pipelines de produccion de contenido.
- Procesamiento por lotes de grabaciones (entrevistas, podcasts, reuniones): al correr en CPU, puede procesar volumenes grandes de audio sin coste de GPU.
- Entornos con privacidad estricta (consultorias, legal, sanitario): al ser ejecucion 100% local, el audio nunca sale de la maquina.
- Reproducibilidad en despliegues: al fijar el binario por SHA-256, equipos de ingenieria pueden garantizar que todos los nodos usan exactamente el mismo modelo, evitando regresiones silenciosas.
- Dispositivos de recursos limitados (mini-PC, Raspberry Pi de gama alta): la cuantizacion q5_1 reduce la huella de memoria a menos de la mitad respecto a fp16.
- Preprocesamiento de audio para otros modelos: transcribir grabaciones en ingles para alimentar posteriormente LLMs de resumen o analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia cualitativa (sin cifras verificadas en este repositorio), Whisper small.en ocupa una posicion intermedia en la familia Whisper entre `base.en` y `medium.en` en precision WER sobre datasets como LibriSpeech; para numeros concretos, consultar el paper original de OpenAI y los tests de whisper.cpp.

## Requisitos de hardware

- VRAM/RAM: el fichero pesa 190.098.681 bytes (~181 MiB); en CPU se recomienda disponer de al menos 1 GB de RAM libre para inferencia comoda (memoria de trabajo del runtime incluida).
- GPU: no necesaria; whisper.cpp esta optimizado para CPU. Existe soporte opcional de aceleracion via CUDA, Metal, Vulkan o OpenCL si se desea menor latencia.
- Consumer GPUs: cabe sobradamente en cualquier GPU moderna (incluso de 4 GB) si se usa aceleracion; en CPU puro funciona en equipos modestos.
- Despliegue: el formato GGML esta pensado para whisper.cpp (binario CLI o libreria C/C++). Alternativas: Ollama no da soporte directo a Whisper en este formato; para servidores ASR se suele usar whisper.cpp server, faster-whisper (formato CTranslate2, no compatible con este fichero) o bindings como pywhispercpp.
- Rendimiento: whisper.cpp reporta transcripcion en tiempo real o mejor en CPUs de escritorio modernas para el modelo small; la cifra exacta depende del hardware y no esta publicada en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| whisper-small.en q5_1 (este repo) | 244 M | Ingles | q5_1 GGML (~190 MB) | MIT | Mirror byte-identico para reproducibilidad |
| whisper-small (multilingue, whisper.cpp) | 244 M | ~99 idiomas + traduccion | q5_1 GGML (~190 MB) | MIT | Menor precision en ingles, anade traduccion |
| whisper-base.en | 74 M | Ingles | q5_1 GGML (~60 MB) | MIT | Mas rapido y ligero, menor precision |
| whisper-medium.en | 769 M | Ingles | q5_1 GGML (~580 MB) | MIT | Mejor WER, requiere mas RAM/CPU |

## Limitaciones y advertencias

- Solo ingles: la variante `.en` no transcribe otros idiomas ni traduce; usar el modelo multilingue si se necesita eso.
- Ventana de 30 segundos: audios largos se procesan por segmentos, lo que puede provocar errores de contexto en cortes abruptos.
- Alucinaciones tipicas de Whisper: en silencios largos, musica o audio de baja calidad, el modelo puede inventar texto repetitivo o frases sin relacion; whisper.cpp implementa filtros (thresholds de entropia, `--no-fallback`) que mitigan pero no eliminan el problema.
- Cuantizacion q5_1: introduce una ligera degradacion de precision frente a fp16, generalmente aceptable pero medible en WER.
- Rendimiento en CPU variable: en maquinas antiguas la latencia puede superar el tiempo real; medir en el hardware objetivo.
- Licencia MIT: sin restricciones para uso comercial, pero conviene verificar los terminos de los pesos originales de OpenAI Whisper (tambien MIT) en usos sensibles.
- Procedencia: es un mirror de terceros (fzhnk), no el repositorio oficial; verificar siempre el SHA-256 publicado antes de usar el binario en produccion.

## Enlaces

- Repositorio del modelo (mirror): https://huggingface.co/fzhnk/whisper-small.en-q5_1-ggml
- Repositorio original de whisper.cpp en Hugging Face: https://huggingface.co/ggerganov/whisper.cpp
- Proyecto whisper.cpp (GitHub): https://github.com/ggerganov/whisper.cpp
- Paper original de Whisper (OpenAI): https://arxiv.org/abs/2212.04356
- Pesos originales de OpenAI: https://github.com/openai/whisper
