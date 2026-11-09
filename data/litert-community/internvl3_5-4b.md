# litert-community/InternVL3_5-4B

## Resumen

InternVL3_5-4B en formato LiteRT-LM es una conversión del modelo visión-lenguaje InternVL3.5-4B de OpenGVLab, empaquetada por la comunidad litert-community para inferencia totalmente local en dispositivos de borde mediante el runtime LiteRT-LM de Google. El modelo combina un codificador visual InternViT con un decodificador de lenguaje Qwen3-4B, unidos por pixel-shuffle y un proyector MLP, y se distribuye cuantizado (int8 en visión, int4 en el decodificador) en un único fichero `model.litertlm` de aproximadamente 2,99 GB.

El problema que resuelve es la ejecución de un VLM competente sin depender de la nube: el bundle está pensado para macOS, Linux, Windows, Android e iOS, con backend CPU o GPU (Metal en Apple, LiteRT GPU en Android). Frente a la build previa basada en InternVL3-2B (que usaba Qwen2.5-1.5B como decodificador), esta versión actualiza el backbone lingüístico a Qwen3-4B, lo que mejora la calidad del razonamiento textual manteniendo un tamaño manejable.

Es relevante ahora porque permite prototipar asistentes multimodales privados y de baja latencia en hardware de consumo, con una licencia Apache-2.0 heredada del modelo base y una ruta de despliegue estandarizada (`litert-lm run`, `litert-lm serve` con API compatible con OpenAI).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador InternViT + pixel-shuffle + proyector MLP + decodificador Qwen3-4B (transformer denso) |
| Parametros totales | no disponible (decodificador de 4B según nomenclatura; total exacto no publicado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens de KV cache (según bundle LiteRT-LM) |
| Tipos de cuantizacion | Visión int8; decodificador int4 simétrico (blockwise-32 + OCTAV optimal-clipping); embedding de entrada int8 externalizado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors vía OpenGVLab/InternVL3_5-4B |

## Arquitectura y entrenamiento

La arquitectura es un VLM de dos torres: un codificador visual InternViT que procesa una imagen de 448×448 píxeles (con normalización ImageNet integrada en el propio codificador), seguido de pixel-shuffle y un proyector MLP que produce 256 tokens de imagen; estos se concatenan con el prompt textual y alimentan un decodificador Qwen3-4B. El contexto de KV cache del bundle es de 2048 tokens. La conversión a LiteRT-LM emplea el camino multimodal `fast_vlm` del runtime.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. La conversión declara que la torre de visión se convierte de forma bit-faithful respecto a la referencia (correlación extremo a extremo en CPU float ≈ 1,0, diferencia absoluta máxima ~1e-4) y sin operadores de fallback FLEX/CUSTOM. El decodificador usa la receta int4 blockwise-32 + OCTAV, la misma que en la build hermana Ministral-3-3B-Reasoning alcanza un 90,7 % en GSM8K, aunque ese dato corresponde al modelo hermano y no a este.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción, respuesta a preguntas visuales (VQA) y captioning detallado.
- Comprensión de una imagen por consulta en el caso de uso principal; en backend CPU admite varias imágenes por conversación (ver limitaciones).
- Razonamiento textual y matemáticas heredadas del decodificador Qwen3-4B (sin datos de benchmark publicados para este bundle).
- Ejecución totalmente local y offline: sin llamadas a servicios externos.
- Interfaz de chat interactiva y modo one-shot mediante CLI (`litert-lm run`).
- Servidor local con API compatible con OpenAI (`litert-lm serve`).
- Soporte de múltiples adjuntos de imagen en CLI mediante `--attachment` repetido (sujeto a la limitación de backend GPU).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistencia visual offline en escritorio: un usuario ejecuta `litert-lm run` con una foto y una pregunta y obtiene una descripción o respuesta sin conexión; adecuado por el tamaño de ~3 GB y el soporte de macOS, Linux y Windows.
- Moderación y etiquetado de imágenes en local: procesar lotes de imágenes en una máquina de oficina con backend CPU para clasificar o describir contenido sin enviar datos a terceros, gracias a la licencia Apache-2.0 y a la inferencia local.
- Prototipado de apps móviles multimodales: integrar el bundle en Android (backend LiteRT GPU, huella de memoria de pico medida de 1289 MB en Galaxy S26) o iOS para VQA de una imagen por conversación.
- Accesibilidad: describir imágenes para usuarios con discapacidad visual en un dispositivo de borde, con latencia de TTFT de 0,37 s en GPU Metal (M4 Max) en el camino de texto.
- Servicio local compatible con OpenAI: levantar `litert-lm serve` en una estación de trabajo y consumir el modelo desde herramientas que ya hablan la API de OpenAI, útil para pruebas de integración sin coste de API.
- Análisis de documentos escaneados o capturas: extraer descripciones y responder preguntas sobre una imagen concreta en flujos de una sola imagen por chat, aprovechando los 256 tokens visuales por imagen.
- Demo educativa de VLMs en el aula: ejecutar el modelo en portátiles con GPU de consumo o CPU para ilustrar arquitecturas visión-lenguaje sin infraestructura de servidor.

## Benchmarks y rendimiento

Rendimiento de inferencia publicado en la model card (`litert-lm benchmark` 0.15.0, Apple M4 Max, `-p 256 -d 256 --runs 3`, max-num-tokens 4096; camino de texto, sin codificador visual):

| Dispositivo | Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 57 tok/s | 21,3 tok/s | 4,89 s |
| Apple M4 Max (macOS) | GPU (Metal) | 736 tok/s | 86,5 tok/s | 0,37 s |

Despliegue en Android (Samsung Galaxy S26, SM-S942Q / SM8850, Android 16, litert-lm 0.16.0, `--backend=gpu --sampler_backend=cpu`, prompt sin imagen):

| Fichero | Backend GPU | Delegación | Pico de memoria |
|---|---|---|---:|
| `model.litertlm` | ejecuta | 4944 / 4944 ops en 3 subgrafos sobre `LiteRT GPU` | 1289 MB |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) para este bundle en la información disponible. La model card cita un 90,7 % en GSM8K para la build hermana Ministral-3-3B-Reasoning con la misma receta de cuantización, pero no es un resultado de este modelo.

## Requisitos de hardware

- Tamaño del bundle: ~2,99 GB (`model.litertlm`), con el embedding externalizado para respetar el límite de mmap de iOS; el repositorio completo ocupa 15,0 GB.
- Memoria en Android: pico de proceso medido de 1289 MB en Galaxy S26 con backend GPU (camino de texto).
- Cabe en hardware de consumo: sí; validado en Apple M4 Max (CPU y GPU Metal) y en Samsung Galaxy S26 (LiteRT GPU). La model card estima ~20 tok/s en CPU y ~45 tok/s en GPU en iPhone 17 Pro para VQA de una imagen, si bien recomienda medir en el dispositivo concreto antes de citar cifras.
- Backends soportados: CPU (XNNPACK) y GPU (Metal en Apple, LiteRT GPU en Android); cómputo entero (int8/int4).
- Despliegue: runtime `litert-lm` (pip), CLI `litert-lm run`, servidor `litert-lm serve` (API compatible con OpenAI) y `litert_lm_advanced_main` para control de backend.
- No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato `.litertlm`.
- Latencia de referencia: TTFT de 0,37 s y decode de 86,5 tok/s en M4 Max con GPU Metal; 4,89 s de TTFT y 21,3 tok/s en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/InternVL3_5-4B | 4B (decodificador Qwen3-4B) | 2048 | `.litertlm` / LiteRT-LM | Apache-2.0 | Este modelo; int4 decodificador, int8 visión |
| litert-community/FastVLM-0.5B | 0,5B | no disponible | `.litertlm` / LiteRT-LM | no disponible | VLM mucho más pequeño del mismo runtime; comparte la limitación de truncado multi-imagen en GPU |
| InternVL3-2B (build previa LiteRT-LM) | 2B (decodificador Qwen2.5-1.5B) | no disponible | `.litertlm` / LiteRT-LM | no disponible | Predecesor en el mismo runtime; ~20 tok/s CPU y ~45 tok/s GPU en iPhone 17 Pro según estimación |
| OpenGVLab/InternVL3_5-4B | 4B | no disponible | safetensors (modelo base) | Apache-2.0 | Modelo original sin cuantizar; referencia de calidad frente a la que se mide la conversión |

No se dispone de datos de calidad comparativos (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- En el backend GPU (Metal), una segunda imagen en la misma conversación trunca la respuesta; hay que usar una imagen por chat. Es una limitación del delegado GPU del runtime, no del modelo, y se reproduce también con FastVLM-0.5B. En CPU el multi-imagen funciona.
- El contexto de KV cache es de solo 2048 tokens, lo que limita conversaciones largas y prompts con muchas imágenes.
- La imagen se redimensiona a 448×448 y produce 256 tokens visuales; detalles finos en imágenes grandes pueden perderse.
- La model card no publica benchmarks de calidad para este bundle; las cifras de GSM8K citadas pertenecen a un modelo hermano y no deben atribuirse a este.
- Las cifras de rendimiento en iPhone son estimaciones del autor, no mediciones independientes de esta build; se recomienda validar en el dispositivo objetivo.
- No se documentan idiomas soportados; el comportamiento multilingüe no está garantizado por la información disponible.
- Riesgo de alucinación inherente a los VLM: las descripciones pueden inventar detalles no presentes en la imagen; conviene validación humana en usos críticos.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar el modelo base, arrastra los de sus datos de entrenamiento (no publicados aquí).
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base OpenGVLab/InternVL3_5-4B y de las dependencias del runtime LiteRT-LM.
- El formato `.litertlm` limita el despliegue a LiteRT-LM; no es directamente compatible con vLLM, llama.cpp u Ollama.
- El embedding externalizado implica que el bundle depende de secciones separadas; la gestión de ficheros debe respetar la estructura del paquete.

## Enlaces

- Hugging Face (este bundle): https://huggingface.co/litert-community/InternVL3_5-4B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-4B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Build hermana Ministral-3-3B-Reasoning: https://huggingface.co/litert-community/Ministral-3-3B-Reasoning-2512
- Build hermana FastVLM-0.5B: https://huggingface.co/litert-community/FastVLM-0.5B
- Guía de GPU en Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Imagen de ejemplo COCO: https://huggingface.co/huggingface/documentation-images/blob/main/coco_sample.png
