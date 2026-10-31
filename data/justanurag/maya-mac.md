# justanurag/maya-mac

## Resumen

maya-mac es un port de inferencia para Apple Silicon del modelo de síntesis de voz maya-research/maya2-native, publicado por el usuario justanurag en Hugging Face. El modelo base es un sistema text-to-speech (TTS) que cubre 12 lenguas indicas (asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, oriya, panyabí, tamil, telugu) además de inglés, con 21 voces predefinidas y soporte de clonación de voz zero-shot. El paquete oficial maya3 requiere GPU NVIDIA por su uso de kernels Triton y CUDA graphs; maya-mac reescribe la ruta de inferencia sobre MLX con kernels Metal personalizados, manteniendo un motor PyTorch MPS como alternativa.

El problema que resuelve es claro: ejecutar un TTS multilingüe indic de calidad en Macs sin GPU NVIDIA. El resultado es notablemente eficiente: en un M5 Pro alcanza un factor de tiempo real de ~0,32 en fp16 (unos 3x más rápido que el audio en tiempo real) y ~0,23 con pesos a 8 bits. Además de la CLI y la librería Python, incluye un servidor con endpoint compatible con OpenAI y streaming por WebSocket, lo que lo hace útil para integraciones de producción en entornos macOS. El repo no contiene pesos: estos (~5,5 GB) se descargan de los repos originales de maya-research en la primera ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS generativo (arquitectura interna no detallada en la model card; modelo base maya2-native) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (TTS) |
| Tipos de cuantizacion | fp16 (por defecto) y 8 bits (`--bits 8` / `backbone_bits=8, depth_bits=8`) |
| Idiomas soportados | as, bn, en, gu, hi, kn, ml, mr, or, pa, ta, te (12 lenguas indicas + ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Descargados de los repos originales (~5,5 GB, cache de Hugging Face); el repo solo contiene codigo (wheel Python) |

## Arquitectura y entrenamiento

maya-mac no es un modelo entrenado, sino una reimplementacion del camino de inferencia de maya2-native para Apple Silicon. Ofrece dos motores: uno basado en MLX con kernels Metal personalizados (el predeterminado en Apple Silicon) y otro en PyTorch sobre MPS como fallback. El paquete original maya3 dependia de kernels Triton y CUDA graphs, exclusivos de NVIDIA, lo que motivo esta reescritura.

Sobre el modelo base maya2-native, esta model card no detalla arquitectura interna, numero de parametros ni datos de entrenamiento; para esa informacion debe consultarse la model card original de maya-research/maya2-native (enlazada al final). El sistema incluye componentes auxiliares (`maya2-native/`, `mimi/` y `ecapa/`), lo que sugiere un tokenizador de audio tipo Mimi y un extractor de embeddings de hablante tipo ECAPA para la clonacion de voz, aunque esto no se confirma explicitamente. La salida es audio float32 mono a 24 kHz, y la generacion admite muestreo con `temperature`, `top_k`, `top_p` y `repetition_penalty`, lo que indica una etapa de generacion autorregresiva sobre tokens de audio.

## Capacidades

- Sintesis de texto a voz en 12 lenguas indicas (asames, bengali, guyarati, hindi, canares, malayalam, marati, oriya, punyabi, tamil, telugu) e ingles.
- 21 voces integradas, seleccionables por nombre (por ejemplo Ahana, Vaidehi, Kayal).
- Clonacion de voz zero-shot a partir de un wav de referencia con su transcripcion (`--ref-audio` / `--ref-text`, o `register_voice` en Python).
- Clonacion cruzada de idiomas: la voz de referencia y el idioma de salida pueden ser distintos (registrar una voz en ingles y generar en hindi).
- Normalizacion de texto: expansion de numeros, monedas, fechas, URLs y formas escritas similares a texto hablado (`normalize=True`).
- Streaming: generacion en trozos de ~240 ms desde Python, y streaming PCM de baja latencia por WebSocket con varios contextos por socket.
- Control de muestreo: `seed`, `temperature`, `top_k`, `top_p`, `repetition_penalty`.
- Servidor con endpoint compatible con OpenAI (`POST /v1/audio/speech`) con formatos wav, pcm, mp3, opus (streamed) y flac, y deteccion de idioma a partir del guion si no se especifica.
- Cuantizacion a 8 bits opcional para mayor velocidad y menor consumo de RAM.

## Casos de uso

- Atencion al cliente automatizada en la India: puede generar avisos de pedido o respuestas de IVR en hindi u otras lenguas indicas con voces naturales; el ejemplo de la documentacion genera «नमस्ते, आपका ऑर्डर कल पहुँच जाएगा।» con la voz Ahana.
- Servidor TTS autoalojado para aplicaciones: el endpoint compatible con OpenAI (`/v1/audio/speech`) permite sustituir la API de OpenAI por un servidor local en un Mac sin cambiar los clientes existentes.
- Locucion de contenido educativo regional: generacion de audiolibros o material didactico en tamil, telugu o bengali, con normalizacion automatica de numeros, fechas y monedas.
- Asistentes de voz con marca: clonacion de la voz de un locutor (con su permiso) para generar mensajes coherentes en varias lenguas indicas sin regrabar cada idioma.
- Streaming de baja latencia para agentes conversacionales: el WebSocket con trozos de ~240 ms y cancelacion permite interrupciones y respuestas en tiempo casi real.
- Prototipado local en MacBook: con ~8,5 GB de RAM en fp16, cabe en portatiles de 16 GB, lo que permite desarrollar sin GPU en la nube.
- Pipelines de accesibilidad: lectura de textos en lenguas indicas con poca cobertura en TTS comerciales, como asames u oriya.

## Benchmarks y rendimiento

No se han publicado benchmarks tipo MMLU, HumanEval o GSM8K (no aplicables a un TTS). La model card si incluye mediciones de velocidad en un M5 Pro (24 GB, bateria en modo High Power). Factor de tiempo real (RTF) = tiempo de generacion / duracion del audio; menor es mejor.

| Metrica | torch MPS | MLX fp16 (por defecto) | MLX 8 bits |
|---|---|---|---|
| RTF, parrafo de 21 s | 0,77 | 0,32 | 0,23 |
| RTF, frases cortas | 0,77–0,80 | 0,33 | 0,23 |
| Tiempo por frame de 80 ms | ~63 ms | 26,4 ms | 18,8 ms |
| Primer audio | 0,31–0,39 s | 0,16–0,18 s | no disponible |

No hay comparaciones de calidad de audio (MOS) en la informacion disponible.

## Requisitos de hardware

- Mac con Apple Silicon (M1 o posterior), macOS 14 o superior; Python 3.10–3.12; ~6 GB de disco libre (los pesos ocupan ~5,5 GB).
- RAM: probado en 24 GB; el motor MLX alcanza un pico de ~8,5 GB en fp16 y ~7 GB con pesos a 8 bits, por lo que los Macs de 16 GB deberian funcionar.
- No requiere GPU NVIDIA: los kernels Triton/CUDA del paquete oficial maya3 se sustituyen por kernels Metal personalizados.
- Cabe en portatiles Apple Silicon de gama media (M1/M2/M3 con 16 GB); no hay mediciones publicadas para chips anteriores al M5 Pro, por lo que las velocidades concretas en M1/M2 no estan disponibles.
- Despliegue: CLI (`maya`), libreria Python (`maya_mac.MayaTTS`) o servidor (`maya-server`) con endpoint OpenAI-compatible y WebSocket. No aplican vLLM, llama.cpp, Ollama ni TGI (no es un LLM).
- Latencia: primer audio de ~0,16–0,18 s con el motor MLX en M5 Pro; trozos de streaming de ~240 ms. El servidor procesa las peticiones de una en una (sin batching), con rechazo 503 si supera `--max-pending` (4 por defecto) o el plazo de `--queue-deadline-ms` (30 s por defecto).

## Comparativa con modelos similares

| | maya-mac (maya2-native en MLX) | maya3 oficial (maya-research) | XTTS v2 (Coqui) |
|---|---|---|---|
| Plataforma | Apple Silicon (MLX/Metal, fallback MPS) | GPU NVIDIA (Triton, CUDA graphs) | Multiplataforma (CUDA/CPU) |
| Idiomas | 12 lenguas indicas + ingles | 12 lenguas indicas + ingles | 17 idiomas, sin cobertura indic profunda |
| Clonacion de voz | Zero-shot, cross-lingue | Si | Zero-shot |
| Voces integradas | 21 | 21 | no disponible |
| RTF | 0,32 (fp16) / 0,23 (8 bits) en M5 Pro | no disponible | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 (segun model card original) | Licencia Coqui (no totalmente permisiva) |
| Servidor compatible OpenAI | Si | Si (mismo protocolo) | No nativo |

Alternativas adicionales en la categoria de TTS para lenguas indicas: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El servidor no hace batching: procesa una peticion cada vez, por lo que no es adecuado para cargas concurrentes altas; rechaza peticiones con 503 cuando la cola se satura.
- No hay comparacion directa de velocidad con el paquete oficial maya3 en GPU NVIDIA en los datos disponibles.
- La clonacion de voz conlleva riesgos de suplantacion: la propia documentacion exige contar con el permiso del hablante y remite a las restricciones de uso de la model card original de maya2-native.
- Esta model card no documenta parametros, datos de entrenamiento ni sesgos del modelo base; deben consultarse en la ficha de maya-research/maya2-native.
- Riesgo de alucinacion no aplicable tal cual a TTS, pero errores de pronunciacion en lenguas indicas de baja dotacion (asames, oriya) son posibles y no hay evaluaciones publicadas por idioma.
- `pip install git+https://huggingface.co/...` no funciona con este repo (el servidor git de Hugging Face rechaza el clon parcial que usan versiones recientes de pip); hay que usar la URL del wheel o uv.
- La calidad del clon depende de la transcripcion exacta del audio de referencia (`ref_text`); referencias mal transcritas degradan el resultado.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre el uso etico de la clonacion de voz recae en el usuario.

## Enlaces

- Repo del modelo (maya-mac): https://huggingface.co/justanurag/maya-mac
- Modelo base (maya2-native): https://huggingface.co/maya-research/maya2-native
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Wheel precompilada: https://huggingface.co/justanurag/maya-mac/resolve/main/dist/maya_mac-0.3.0-py3-none-any.whl

Otros enlaces (paper, demos): no disponibles en la informacion proporcionada.
