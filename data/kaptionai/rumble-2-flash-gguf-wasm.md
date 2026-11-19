# kaptionai/Rumble-2-Flash-GGUF-wasm

## Resumen

Rumble-2-Flash-GGUF-wasm es una distribución en formato GGUF del modelo de reconocimiento automático del habla Reson8/Rumble-2-Flash, empaquetada por kaptionai para su ejecución en el navegador mediante una compilación WebAssembly de llama.cpp con libmtmd. El modelo base es un fine-tune de Qwen/Qwen3-ASR-0.6B con el decodificador recortado a 14 capas y el vocabulario reducido a 99.630 tokens, lo que da un total de 322.255.360 parámetros y un repositorio de 0,6 GB.

El paquete incluye dos ficheros GGUF: el decodificador en cuantización Q8_0 (copia sin modificar del trabajo de AtomicChat) y un proyector multimodal convertido por Kaption que transforma tres tensores convolucionales de F16 a Q8_0 para que el runtime WASM pueda ejecutarlos como im2col más multiplicación de matrices int8. Esta modificación es necesaria porque llama.cpp estándar espera pesos 4-D y no ejecuta este proyector.

Su relevancia radica en que permite transcripción multilingüe (45 idiomas) directamente en el cliente, sin backend, con un peso total de 550 MB y kernels SIMD int8 optimizados para WebAssembly. Está pensado para aplicaciones web de dictado, subtitulado o accesibilidad donde enviar audio a un servidor no es viable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (derivado de Qwen3-ASR-0.6B), decodificador recortado a 14 capas, proyector multimodal con convoluciones 2-D |
| Parametros totales | 322.255.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (decodificador y proyector); el proyector usa `--mat q8_0 --conv q8_0` |
| Idiomas soportados | 45: af, ar, bn, bs, ca, ceb, cs, da, de, el, en, es, eu, fa, fi, fil, fr, hi, hr, hu, id, is, it, ja, ko, lt, lv, mk, ms, mt, nb, nl, pl, pt, ro, ru, sq, sr, sv, th, tr, uk, vi, yue, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: decodificador y mmproj) |

## Arquitectura y entrenamiento

El modelo base Reson8/Rumble-2-Flash es un fine-tune de Qwen/Qwen3-ASR-0.6B (Apache 2.0) en el que se ha recortado el decodificador a 14 capas y se ha reducido el vocabulario a 99.630 tokens. La arquitectura es la de Qwen3-ASR: un encoder de audio que alimenta un decodificador transformer autorregresivo, con un proyector multimodal que alinea las representaciones acústicas con el espacio del decodificador. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La contribución específica de este repositorio es de ingeniería de despliegue, no de entrenamiento. Kaption convierte tres tensores del proyector (`a.conv2d.2.weight`, `a.conv2d.3.weight` y `a.conv_out.weight`) de F16 a Q8_0, reformando las convoluciones 3x3 de 480 canales de 4-D a una matriz 2-D `[4320, 480]` en orden row-major equivalente al de las columnas de im2col. El script `retype-mmproj.py` reproduce el fichero de forma determinista (mismo SHA-256). La decodificación es greedy y el prompt requiere los tokens de control `<digits><nofiller><verbatim>` de Reson8 en el turno de sistema.

## Capacidades

- Reconocimiento automático del habla (ASR) en 45 idiomas, incluidos español, inglés, portugués, chino, árabe, hindi, japonés y cantonés.
- Transcripción con control de formato mediante tokens de sistema: `<digits>` (dígitos), `<nofiller>` (sin muletillas) y `<verbatim>` (transcripción literal).
- Ejecución en navegador en CPU mediante WebAssembly, sin GPU ni backend.
- Procesamiento de audio como turno multimodal dentro de una conversación con el chat template embebido en el GGUF.
- No soporta timestamps por palabra: la salida es solo texto.
- No soporta hebreo; el conjunto de idiomas es exactamente el listado en los metadatos.
- No se documentan tool calling, function calling ni razonamiento multi-paso; el pipeline es exclusivamente ASR.

## Casos de uso

- Dictado en aplicaciones web: integrar el par de GGUF en una app de notas o editor para transcribir voz a texto en el propio cliente, sin enviar audio a un servidor, gracias a los 550 MB totales y a los kernels SIMD int8 de WebAssembly.
- Subtitulado en tiempo real de vídeo en el navegador: procesar segmentos de audio de una etiqueta `<video>` o de WebRTC y generar texto en el idioma detectado, útil en plataformas de formación y accesibilidad.
- Transcripción multilingüe de reuniones: con 45 idiomas y control `<verbatim>`, adecuado para actas literales en entornos corporativos con participantes de distintos países.
- Accesibilidad para personas con discapacidad auditiva: transcripción local en páginas web y aplicaciones de videollamada, sin coste de infraestructura y con privacidad por diseño al no salir el audio del dispositivo.
- Procesamiento por lotes de archivos de audio en el cliente: transcripción de entrevistas, podcasts o notas de voz subidas a una web, usando el modelo en un Web Worker para no bloquear la interfaz.
- Aplicaciones offline o de campo: PWA instalable que transcribe en dispositivos sin conectividad una vez cacheado el modelo, útil en inspecciones, sanidad rural o periodismo de campo.
- Normalización de cifras y formato: el token `<digits>` permite obtener números en dígitos en lugar de palabras, útil para extracción de datos en formularios por voz.

## Benchmarks y rendimiento

Datos medidos por Kaption en su runtime WebAssembly, según la model card:

| Prueba | Conjunto | Rumble-2-Flash | Qwen3-ASR-0.6B |
|---|---|---|---|
| CER chino | FLEURS, 15 clips | 7,4 | 6,6 |
| CER chino | Test nativo Kaption, 40 clips | 7,4 | 5,4 |
| WER inglés/español/portugués | FLEURS, 48 clips | 4,30 | 6,35 |
| WER clips cortos sin corrección de padding | 106 clips | 56,8 | no disponible |
| WER clips cortos con corrección de padding | 106 clips | 25,1 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM: no aplica; el runtime objetivo es CPU en navegador. El paquete completo ocupa 550 MB (346 MB decodificador + 204 MB proyector).
- GPU recomendadas: no aplica para el runtime WASM; no se documentan requisitos de GPU.
- Caben en cualquier equipo con navegador moderno y suficiente memoria para cargar 550 MB de pesos más el runtime WASM.
- Opciones de despliegue: compilación WebAssembly de llama.cpp + libmtmd con el parche de Kaption para convoluciones 2-D. Con llama.cpp estándar deben usarse los ficheros de AtomicChat, no el proyector de este repositorio.
- Navegadores probados: Chrome y Edge. Otros navegadores no fueron testeados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| Rumble-2-Flash-GGUF-wasm (este) | 322 M | 45 | GGUF Q8_0 + mmproj | Apache 2.0 | Si, WASM con parche |
| Qwen3-ASR-0.6B | 0,6 B (aprox.) | no disponible | safetensors, GGUF | Apache 2.0 | Via Qwen3-ASR-0.6B-GGUF-wasm de Kaption |
| AtomicChat/Rumble-2-Flash-GGUF | 322 M | 45 | GGUF | Apache 2.0 | No (requiere llama.cpp estándar) |
| Whisper (variantes pequenas) | 39 M - 244 M | ~99 | safetensors, GGUF | MIT | Posible via whisper.cpp WASM |

Este paquete mejora a Qwen3-ASR-0.6B en inglés, español y portugués (WER 4,30 frente a 6,35 en FLEURS) pero empeora en chino (CER 7,4 frente a 5,4 en el test nativo de Kaption). Frente a la distribución de AtomicChat, la diferencia es la viabilidad de ejecución en WASM gracias al proyector reconvertido.

## Limitaciones y advertencias

- El chino es más débil que en Qwen3-ASR-0.6B: CER 7,4 frente a 5,4 en el test nativo de 40 clips de Kaption.
- Alucina texto sobre silencio digital: en 36 clips sintéticos sin voz escribió frases en bucle en 10 de ellos, con hasta 28 repeticiones de una misma frase. Es obligatorio anteponer un detector de actividad de voz (VAD).
- Los clips cortos requieren la corrección de padding de llama.cpp: sin ella, clips de 1 a 3 s terminan con palabras no pronunciadas (WER 56,8 sin corrección frente a 25,1 con ella en 106 clips).
- No soporta hebreo; los idiomas son exactamente los 45 de los metadatos.
- No genera timestamps por palabra; solo texto.
- El proyector de este repositorio no funciona con llama.cpp estándar; requiere el parche de Kaption para convoluciones 2-D. Con llama.cpp estándar hay que usar los ficheros de AtomicChat.
- Solo probado en Chrome y Edge; otros navegadores no han sido validados.
- Riesgo de sesgos y alucinaciones inherente a un modelo ASR entrenado sobre datos no documentados en la model card; no se detalla la composición del dataset.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está avalado por Reson8, AtomicChat ni Alibaba Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaptionai/Rumble-2-Flash-GGUF-wasm
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- GGUF de AtomicChat: https://huggingface.co/AtomicChat/Rumble-2-Flash-GGUF
- Modelo original Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Paquete WASM de referencia de Kaption: https://huggingface.co/kaptionai/Qwen3-ASR-0.6B-GGUF-wasm
