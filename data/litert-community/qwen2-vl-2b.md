# litert-community/Qwen2-VL-2B

## Resumen

Qwen2-VL-2B de litert-community es una conversión del modelo visión-lenguaje Qwen2-VL-2B-Instruct de Alibaba al formato LiteRT-LM, el runtime de inferencia on-device de Google (antes TensorFlow Lite). El paquete empaqueta un encoder visual ViT de 32 capas y 1280 dimensiones con un decodificador de lenguaje Qwen2-1.5B de 28 capas, cuantizado a int8 el encoder y a int4 el decodificador, en un único fichero de aproximadamente 1,78 GB. El objetivo es claro: ejecutar un VLM multimodal completo en teléfonos y dispositivos de borde sin conexión a la nube.

La relevancia de esta conversión radica en que demuestra que un modelo visión-lenguaje de 2B parámetros puede correr en hardware móvil con latencias utilizables: 46,3 tokens/s de decodificación y 657 tokens/s de prefill en la GPU de un Galaxy S26, y 139,1 tokens/s de decodificación en la GPU de un Apple M4 Max. Frente al modelo original en PyTorch/Transformers, que requiere GPUs de escritorio o servidores, esta versión prioriza portabilidad y consumo sobre precisión absoluta.

El modelo conserva las capacidades del Qwen2-VL-2B-Instruct original: descripción de imágenes, VQA, lectura de documentos y OCR, con una ventana de contexto de 4096 tokens para la KV cache y una entrada de imagen fija de 672×672 píxeles que se traduce en 576 tokens visuales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: encoder ViT (Qwen2-VL ViT, 32 capas, 1280 dim, atención completa) + adaptador PatchMerger + decodificador transformer Qwen2-1.5B (28 capas, hidden 1536, GQA kv2) |
| Parametros totales | ~2B (1.5B decodificador + encoder visual) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 (KV cache) |
| Tipos de cuantizacion | int8 (encoder visual y adaptador), int4 simétrica blockwise-32 + OCTAV (decodificador), embedder externo int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, fichero único de ~1,78 GB) |

## Arquitectura y entrenamiento

La arquitectura es un VLM de dos torres: un encoder visual ViT de 32 capas y 1280 dimensiones con atención completa que procesa la imagen a resolución estática de 672×672 píxeles, generando 2304 parches que tras un merge 2×2 se reducen a 576 tokens de imagen. Un adaptador PatchMerger (LayerNorm, agrupación 2×2 y MLP) proyecta esos tokens a la dimensión oculta del texto (1536). El decodificador es Qwen2-1.5B con 28 capas, hidden size 1536 y GQA con 2 cabezas KV, cuantizado a int4.

No se dispone de información sobre el dataset de entrenamiento ni sobre si hubo RLHF o DPO en esta conversión; el modelo base Qwen2-VL-2B-Instruct es el que aporta el entrenamiento original de Alibaba. La innovación técnica de esta ficha es la conversión a LiteRT-LM mediante `litert-torch`, con un grafo de prefill/decode reescrito para GPU y la ruta multimodal `fast_vlm` del runtime. La normalización OpenAI-CLIP está integrada en el encoder.

## Capacidades

- Generación de texto e imagen-a-texto (image-text-to-text).
- Descripción detallada de imágenes con grounding espacial (posiciones relativas de objetos).
- VQA (visual question answering) sobre fotografías y escenas.
- OCR y lectura de documentos: transcripción de texto, cifras, correos y teléfonos en páginas sintéticas.
- Lectura de tablas y conteo de elementos (por ejemplo, contar productos listados).
- Conversación multi-turno con imágenes adjuntas (el CLI acepta múltiples `--attachment`).
- Inferencia completamente on-device, sin conexión a la nube.
- API local compatible con OpenAI mediante `litert-lm serve`.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Descripción automática de imágenes en aplicaciones móviles: el modelo procesa una foto y devuelve una frase descriptiva con objetos y contexto; su tamaño de 1,78 GB y su decodificación a 46,3 tokens/s en un Galaxy S26 lo hacen viable para apps Android sin backend.
- Accesibilidad para personas con discapacidad visual: la app captura una imagen con la cámara y el modelo genera una descripción hablada con posiciones relativas de los objetos, gracias a su grounding espacial verificado en Pixel 8a.
- Digitalización de documentos en el dispositivo: OCR de facturas, informes o tarjetas de visita con transcripción de cifras y contactos, sin enviar datos sensibles a servidores externos.
- Asistente de compras o inventario: lectura de tablas de productos y conteo de elementos en estanterías o listados, con la limitación conocida de que el ranking de celdas entre filas es su punto débil.
- Chat multimodal local en escritorio: con `litert-lm serve` se expone una API compatible con OpenAI en macOS, Linux y Windows, útil para prototipos de asistentes que combinan texto e imagen sin depender de la nube.
- Moderación de contenido visual en el borde: clasificación y descripción de imágenes en el propio dispositivo antes de subirlas, reduciendo ancho de banda y preservando privacidad.
- Educación y lectura asistida: el modelo puede leer y explicar el contenido de una página de libro o pizarra capturada con la cámara, con contexto de 4096 tokens suficiente para una página completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). Los únicos datos de rendimiento son de inferencia:

| Dispositivo | Backend | Prefill (256 tokens) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 141 tok/s | 42,7 tok/s | 1,96 s |
| Apple M4 Max (macOS) | GPU (Metal) | 1753 tok/s | 139,1 tok/s | 0,16 s |
| Galaxy S26 | GPU | 657 tok/s (prefill 1024 tokens) | 46,3 tok/s | no disponible |

Nota: las cifras de M4 Max corresponden a un fichero anterior y cubren solo la ruta de texto; el encoder visual se ejecuta una vez por imagen y no está incluido.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero `.litertlm` ocupa ~1,78 GB; se recomienda al menos 2-3 GB de memoria libre para cargar el modelo y la KV cache de 4096 tokens.
- GPU recomendadas: GPU integradas de móviles de gama alta (Galaxy S26 verificado), GPU Metal en Apple Silicon (M4 Max verificado), GPU de escritorio compatible con LiteRT.
- Cabe en hardware consumer: sí, en teléfonos Android de gama alta y en Macs con Apple Silicon; también en CPU de escritorio (42,7 tok/s en M4 Max CPU).
- Opciones de despliegue: `litert-lm` (CLI `run` y `serve`), Google AI Edge Gallery en Android; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para el formato `.litertlm`.
- Latencia y throughput: TTFT de 0,16 s en GPU Metal y 1,96 s en CPU (M4 Max); decodificación de 139,1 tok/s en GPU y 42,7 tok/s en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/Qwen2-VL-2B (esta ficha) | ~2B | 4096 | `.litertlm` | Apache-2.0 | Hugging Face, on-device |
| Qwen/Qwen2-VL-2B-Instruct (base) | ~2B | no disponible en la información | safetensors (Transformers) | Apache-2.0 | Hugging Face |
| Otros VLM de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos ni de otras alternativas on-device verificadas en la información proporcionada.

## Limitaciones y advertencias

- El ranking de celdas entre filas en tablas es el punto débil documentado del modelo.
- La entrada de imagen es fija a 672×672 píxeles; imágenes de otra resolución se reescalan, lo que puede perder detalle en documentos de alta resolución.
- La ventana de contexto es de 4096 tokens, insuficiente para documentos muy largos o conversaciones extensas.
- No se documentan los idiomas soportados; el comportamiento multilingüe no está verificado en esta conversión.
- Riesgo de alucinación inherente a modelos de 2B, especialmente en OCR de documentos complejos o imágenes ambiguas.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las limitaciones y sesgos del modelo base Qwen2-VL-2B-Instruct.
- El CLI de litert-lm (0.14.0 a 0.19.2) puede reutilizar descargas incompletas del caché sin verificar su tamaño; es necesario borrar el fichero y volver a descargar si hay errores de bus o `too large for file size`.
- El fichero publicado antes del 2026-11-14 (11:21 UTC) fue reemplazado; hay que eliminar la copia antigua del caché para evitar ejecutar la versión previa.
- El formato `.litertlm` está atado al runtime LiteRT-LM; no es portable a otros motores de inferencia sin reconversión.

## Enlaces

- [Hugging Face: litert-community/Qwen2-VL-2B](https://huggingface.co/litert-community/Qwen2-VL-2B)
- [Modelo base: Qwen/Qwen2-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct)
- [Repositorio LiteRT-LM](https://github.com/google-ai-edge/litert-lm)
- [Medición de LiteRT en Galaxy S26](https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md)
