# oddadmix/Nabra-7M-Distill-ONNX

## Resumen

Nabra-7M-Distill-ONNX es la exportacion a formato ONNX de Nabra-7M-Distill, un modelo de sintesis de voz (text-to-speech) para arabe estandar moderno (MSA) desarrollado por el usuario oddadmix. Con 7,48 millones de parametros, es un modelo deliberadamente compacto, disenado para ejecutarse integramente en el cliente (navegador o dispositivo) sin necesidad de servidor de inferencia. La exportacion esta pensada para ONNX Runtime Web con aceleracion WebGPU o WASM, y es la que consume el paquete npm `nabra-tts`.

El modelo sigue la estirpe de StyleTTS2 (etiquetado como `styletts2` y `kokoro` en HuggingFace), con un vocoder ISTFTNet que genera audio a 24 kHz en mono. La entrada no es texto crudo, sino identificadores de tokens de fonemas obtenidos mediante espeak-ng en su variante `ar`, seguidos de un paso de limpieza (`clean_phonemes`) definido en `arabic_g2p.py` del repositorio fuente. La salida incluye tanto la forma de onda como las duraciones predichas por token, lo que permite auditar el alineamiento temporal.

Su relevancia actual es doble. Por un lado, cubre un nicho poco poblado: TTS arabe de licencia Apache 2.0 y con un peso inferior a 31 MB en fp32, que cabe en cualquier dispositivo. Por otro, demuestra un flujo de trabajo de destilacion mas exportacion ONNX verificada contra PyTorch, con una degradacion medida de solo 0,010 en distancia log-espectral media respecto al piso de ruido del propio modelo original. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS no autorregresivo estilo StyleTTS2 con vocoder ISTFTNet (etiquetas `styletts2` y `kokoro`) |
| Parametros totales | 7,48 millones (7.48M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; secuencia de fonemas de entrada limitada a T ≤ 512 tokens |
| Tipos de cuantizacion | fp32 (`model.onnx`, 30,5 MB) y fp16 (`model_fp16.onnx`, 16,0 MB, pesos fp16 con entradas/salidas fp32). La cuantizacion dinamica int8 se probo y se descarto |
| Idiomas soportados | arabe estandar moderno (MSA), codigo `ar` |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX; incluye `config.json` y pack de voz `voices/af_msa.bin` (float32 little-endian, forma [510, 256]) |
| Frecuencia de muestreo | 24 kHz, mono |
| Entradas | `input_ids` int64 [1, T] (tokens de fonemas, envueltos en 0 … 0), `style` float32 [1, 256] (fila `len(phonemes) - 1` del pack de voz), `speed` float32 [1] |
| Salidas | `waveform` float32 [N], `durations` int64 [T] |
| Voces disponibles | una unica voz, `af_msa` |
| Tamano del repositorio | 0,0 GB segun HuggingFace (los ficheros ONNX suman ~46,5 MB) |
| Modelo base | oddadmix/Nabra-7M-Distill |

## Arquitectura y entrenamiento

La informacion disponible no detalla la composicion del dataset ni el numero de tokens de entrenamiento. Lo que si se documenta es la topologia de inferencia: un modelo de sintesis no autorregresivo de la familia StyleTTS2, con un decodificador ISTFTNet que reconstruye la forma de onda a 24 kHz. El pipeline completo parte de fonemas generados por espeak-ng (`ar`) y normalizados con la funcion `clean_phonemes` de `arabic_g2p.py`, con dos mapeos explicitos de simbolos foneticos: ʕ y ħ corresponden a los identificadores de token 7 y 8 respectivamente. Existe un condicionamiento de estilo de 256 dimensiones, que se selecciona tomando la fila `len(phonemes) - 1` del pack de voz, y un parametro escalar de velocidad donde 1.0 equivale a velocidad normal.

El nombre indica un proceso de destilacion respecto a un modelo mayor, aunque la informacion proporcionada no especifica el profesor, la estrategia de destilacion ni si hubo fases de RLHF o DPO (en TTS estos objetivos no son habituales; el ajuste suele ser de reconstruccion espectral y adversarial). La innovacion tecnica documentada es la propia exportacion: el vocoder ISTFTNet inyecta ruido aleatorio, de modo que las muestras nunca coinciden bit a bit con PyTorch. El autor resuelve la validacion con una distancia log-espectral media y establece un piso de ruido ejecutando PyTorch dos veces. Los resultados, con duraciones de salida identicas, son 0,350 para la reejecucion en PyTorch, 0,350 para `model.onnx` y 0,360 para `model_fp16.onnx`. Se probo cuantizacion dinamica int8, pero solo reducia el tamano un 27% y degradaba el audio de forma audible, por lo que se descarto.

## Capacidades

- Sintesis de voz en arabe estandar moderno (MSA) a partir de fonemos, no de texto directo: el consumidor debe aportar la conversion grafema-fonemo (espeak-ng `ar` mas limpieza).
- Generacion de audio a 24 kHz en mono, en una sola pasada, sin bucle autorregresivo.
- Control de velocidad de habla mediante el parametro `speed`, con 1.0 como valor neutro.
- Control de estilo e identidad de voz mediante un vector de 256 dimensiones extraido del pack `af_msa`.
- Devolucion de duraciones por token (`durations`, int64 [T]), util para alineamiento, subtitulado o sincronizacion.
- Ejecucion integra en el cliente: el paquete `nabra-tts` corre con ONNX Runtime Web sobre WebGPU o WASM, sin backend.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, vision, audio de entrada ni capacidades de agente; es exclusivamente un modelo de sintesis de voz.
- No se documenta capacidad multilingue mas alla del arabe.

## Casos de uso

- Lectura por voz en aplicaciones web arabes sin backend: el modelo se carga en el navegador via `nabra-tts` y ONNX Runtime Web, de modo que la sintesis ocurre en el dispositivo del usuario y el texto no sale del cliente, lo que simplifica el cumplimiento de privacidad y elimina costes de inferencia en servidor.
- Accesibilidad para usuarios arabohablantes: conversion de articulos, documentacion o mensajes a audio en pantallas pequenas o en contextos de baja vision, con un coste de red de 16 MB en fp16 para el modelo mas 0,5 MB del pack de voz.
- Aplicaciones de escritorio y moviles con recursos limitados: al ser un modelo de 7,48M de parametros, cabe en entornos embebidos o en runtimes WASM donde alternativas de cientos de millones de parametros no son viables.
- Generacion de avisos y notificaciones dinamicas: mensajes de estado, confirmaciones o alertas que deben leerse en voz alta y varian en tiempo de ejecucion, con control de velocidad para adaptarse a distintos contextos.
- Audiolibros y contenido narrado de dominio acotado: la unica voz (`af_msa`) limita la variedad, pero sirve para narracion monovoz en MSA; las duraciones por token permiten generar subtitulos alineados o resaltado sincronizado.
- Prototipado y ensenanza de TTS: el repositorio incluye un script de exportacion ONNX verificable, lo que lo convierte en un caso de estudio util para reproducir un pipeline completo de destilacion, exportacion y validacion con piso de ruido.
- Integracion en asistentes de voz del lado del cliente: aunque no soporta tool calling, puede actuar como capa de salida de un asistente cuyo razonamiento ocurra en otro componente, aportando la locucion final dentro del navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de TTS (MOS, CMOS, WER de reconocimiento inverso) en la informacion disponible. El unico dato cuantitativo publicado es la validacion de la exportacion frente a PyTorch, que mide el error de reconstruccion espectral y no la calidad perceptual:

| Metrica (distancia log-espectral media) | Valor |
|---|---:|
| Reejecucion en PyTorch (piso de ruido) | 0,350 |
| `onnx/model.onnx` (fp32) | 0,350 |
| `onnx/model_fp16.onnx` | 0,360 |

Las longitudes de salida (duraciones) son identicas entre las tres ejecuciones. El autor indica que la cuantizacion dinamica int8 ahorraba unicamente un 27% de tamano y degradaba el audio de forma audible.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en fp32 y en torno a 50-60 MB en fp16, contando pesos y activaciones (estimacion propia a partir de los 30,5 MB y 16,0 MB de los ficheros; el autor no publica cifras de VRAM).
- GPU: cualquier GPU con soporte WebGPU sirve; no requiere A100, H100 ni tarjetas de gama alta. Funciona tambien sin GPU mediante el backend WASM de ONNX Runtime Web.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3060, integradas modernas e incluso telefonos, dado el tamano del modelo.
- Opciones de despliegue documentadas: ONNX Runtime Web (WebGPU o WASM) a traves del paquete npm `nabra-tts`. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo real, RTF ni tokens de audio por segundo en la informacion proporcionada.

## Comparativa con modelos similares

Los modelos de referencia de la misma categoria son Kokoro (misma familia arquitectonica, segun las etiquetas del repositorio), StyleTTS2 y Piper. La informacion proporcionada no incluye datos de estos sistemas, por lo que los campos no verificables se marcan como no disponibles:

| Modelo | Parametros | Idiomas | Licencia | Formato de pesos | Rendimiento publicado |
|---|---|---|---|---|---|
| Nabra-7M-Distill-ONNX | 7,48M | arabe (MSA) | Apache 2.0 | ONNX | Solo validacion log-espectral (0,350 fp32) |
| Kokoro | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| StyleTTS2 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Piper | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La diferenciacion objetiva de Nabra frente a estas alternativas, segun los datos disponibles, es el enfoque en arabe MSA, su tamano de 7,48M de parametros y la disponibilidad de una exportacion ONNX lista para el navegador con una unica voz.

## Limitaciones y advertencias

- Cobertura idiomatica limitada a arabe estandar moderno; no se documentan dialectos arabes ni otras lenguas. El campo `language` del repositorio es unicamente `ar`.
- Una sola voz (`af_msa`): no hay variedad de hablantes ni clonacion de voz en la informacion disponible.
- La entrada no es texto: exige un paso previo de fonemizacion con espeak-ng (`ar`) y la limpieza de `arabic_g2p.py`. Un fallo en ese preprocesado degrada directamente la salida.
- Limite duro de T ≤ 512 tokens de fonemas por inferencia; los textos largos deben trocearse y reensamblarse, lo que puede introducir discontinuidades prosodicas en las uniones.
- El vocoder ISTFTNet inyecta ruido aleatorio, por lo que la salida no es determinista ni reproducible bit a bit entre ejecuciones. Cualquier test de regresion debe basarse en metricas perceptuales o espectrales, no en igualdad exacta.
- Riesgo de alucinacion acustica: como en cualquier TTS, la fonemizacion incorrecta o una secuencia de entrada fuera de distribucion puede producir pronunciaciones erroneas o artefactos sonoros, sin que el modelo senale incertidumbre.
- La cuantizacion int8 esta explicitamente desaconsejada por el autor: ahorra solo un 27% de tamano y degrada el audio de forma audible.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y aviso de cambios. No se documentan restricciones adicionales, pero tampoco condiciones de uso responsable mas alla de la licencia.
- Madurez y soporte: el repositorio registra 0 descargas y 0 likes, y el modelo base es de un autor individual. No hay garantias de mantenimiento, y no se publican evaluaciones perceptuales con oyentes nativos.
- No apto para usos donde la suplantacion de identidad o la sintesis no consentida de voces sea un riesgo: al ser una voz unica y publica, la trazabilidad es mayor, pero conviene declarar que el audio es sintetico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oddadmix/Nabra-7M-Distill-ONNX
- Modelo base: https://huggingface.co/oddadmix/Nabra-7M-Distill
- Paquete npm `nabra-tts`: https://www.npmjs.com/package/nabra-tts
- Script de exportacion ONNX: https://github.com/oddadmix/nabra-tts/blob/main/export/export_onnx.py
- Repositorio GitHub `nabra-tts`: https://github.com/oddadmix/nabra-tts
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las busquedas devolvieron exclusivamente contenido no relacionado con el modelo.
