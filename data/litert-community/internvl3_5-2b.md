# litert-community/InternVL3_5-2B

## Resumen

InternVL3_5-2B en formato LiteRT-LM es una conversión del modelo visión-lenguaje InternVL3.5-2B de OpenGVLab, empaquetado por la comunidad litert-community para inferencia local en dispositivos (on-device) mediante el runtime LiteRT-LM de Google. El modelo combina un codificador visual InternViT con un decodificador de lenguaje Qwen3-1.7B, unido por pixel-shuffle y un proyector MLP, y se distribuye como un único fichero `.litertlm` de aproximadamente 1,61 GB con cuantización int8 para la torre visual e int4 para el decodificador.

La relevancia de esta conversión radica en que permite ejecutar un modelo multimodal imagen-texto en hardware de consumo sin conexión a la nube: el bundle funciona en macOS, Linux, Windows, Android e iOS a través de LiteRT-LM, con backend CPU o GPU (Metal en Apple). El contexto de caché KV está limitado a 2048 tokens y la imagen de entrada se redimensiona a 448×448, generando 256 tokens visuales por imagen.

El modelo base es Apache-2.0 y está pensado para tareas de VQA de imagen única, descripción de imágenes y razonamiento visual ligero en el borde. Su tamaño compacto (2B parámetros totales) lo sitúa en la categoría de VLMs pequeños para despliegue en móvil y portátil, aunque con limitaciones claras de contexto y de manejo multi-imagen en el backend GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM: codificador InternViT + pixel-shuffle + proyector MLP + decodificador Qwen3-1.7B (transformer) |
| Parámetros totales | 2B (aproximado, según nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (caché KV del bundle) |
| Tipos de cuantización | Visión: int8; decodificador: int4 (simétrico, blockwise-32 + OCTAV optimal-clipping); embedding de entrada: INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors |
| Cómputo | entero (integer) |
| Entrada de imagen | redimensionada a 448×448, normalización ImageNet integrada en el codificador visual |
| Tamaño del bundle | ~1,61 GB (`model.litertlm`) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón de InternVL3.5: un codificador visual InternViT que procesa una imagen de 448×448, seguido de pixel-shuffle y un proyector MLP que transforma la salida visual en 256 tokens de imagen, que se inyectan en el decodificador de lenguaje Qwen3-1.7B. La diferencia respecto a la variante InternVL3-2B previa es precisamente el backbone de lenguaje: Qwen3-1.7B en lugar de Qwen2.5-1.5B. El bundle ejecuta esta pila mediante la ruta multimodal `fast_vlm` de LiteRT-LM.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La conversión a LiteRT-LM aplica cuantización int8 a la torre visual con paridad float casi exacta (correlación extremo a extremo ≈ 1,0, diferencia absoluta máxima ~1e-4) y cuantización int4 blockwise-32 + OCTAV al decodificador, una receta que en el build hermano Ministral-3-3B-Reasoning alcanza un 90,7 % en GSM8K. La innovación destacable es la conversión bit-fiel de la torre visual sin operaciones de fallback FLEX/CUSTOM, lo que preserva el grounding visual.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales (VQA) y razonamiento visual básico.
- Procesamiento de una imagen por consulta en el backend GPU; multi-imagen en el backend CPU.
- Entrada de imagen redimensionada a 448×448 con normalización ImageNet integrada.
- Chat interactivo multi-turno mediante `litert-lm run` sin `--prompt`.
- Adjuntar varias imágenes con `--attachment` repetido (funcional en CPU; limitado en GPU).
- Servidor local con API compatible con OpenAI mediante `litert-lm serve`.
- Ejecución totalmente on-device en macOS, Linux, Windows, Android e iOS.
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes en el dispositivo: el modelo genera pies de foto en una sola pasada (por ejemplo, "Two tabby cats are sleeping on a pink couch, with remote controls nearby" sobre la imagen de muestra de COCO), adecuado para aplicaciones de accesibilidad o catalogación offline.
- Asistencia visual para personas con discapacidad visual: un móvil con el bundle puede describir escenas capturadas por la cámara sin enviar datos a la nube, gracias a la ejecución on-device con backend GPU en Android (Samsung Galaxy S26 validado) e iOS.
- VQA de imagen única en aplicaciones móviles: preguntas y respuestas sobre una foto concreta (por ejemplo, identificar objetos o leer contexto visual) usando el contexto de 2048 tokens, suficiente para una imagen (256 tokens) más una conversación corta.
- Moderación y etiquetado de imágenes en el borde: clasificación y descripción de contenido visual en pipelines locales donde la latencia de red o la privacidad impiden usar APIs remotas.
- Prototipado de asistentes multimodales en portátil: con `litert-lm serve` se expone una API compatible con OpenAI para integrar el modelo en aplicaciones de escritorio sin infraestructura de servidor.
- Verificación visual en campo (inspección, inventario): capturas con cámara y consultas descriptivas en dispositivos sin conectividad, aprovechando el tamaño de 1,61 GB del bundle y el rendimiento de 137,2 tok/s de decodificación en GPU Metal de un M4 Max.
- Educación y demos interactivas: chat con imágenes en el aula o en ferias sin depender de servicios externos, usando el backend CPU para soportar varias imágenes en la misma conversación.

## Benchmarks y rendimiento

Rendimiento medido con `litert-lm benchmark` (litert-lm 0.15.0) en Apple M4 Max, `-p 256 -d 256 --runs 3`, max-num-tokens 4096, warm-up descartado, máquina en reposo. Las cifras cubren la ruta de texto; el codificador visual no está incluido.

| Dispositivo | Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 138 tok/s | 31,9 tok/s | 2,04 s |
| Apple M4 Max (macOS) | GPU (Metal) | 1831 tok/s | 137,2 tok/s | 0,15 s |

En Samsung Galaxy S26 (SM-S942Q / SM8850, Android 16) con `litert_lm_advanced_main` de litert-lm 0.16.0, `--backend=gpu --sampler_backend=cpu`, prompt "What is the capital of France?": el bundle ejecuta 3840 / 3840 operaciones en 3 subgrafos sobre LiteRT GPU, con pico de memoria de 859 MB (VmHWM). No se publican cifras de velocidad en este dispositivo porque el backend GPU gana en prefill pero no en decode y no existe fila CPU comparable.

Rendimiento on-device esperado (no medido para este build concreto): ~20 tok/s en CPU y ~45 tok/s en GPU en iPhone 17 Pro para VQA de imagen única, en línea con el build InternVL3-2B sobre el mismo runtime.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) para este bundle en la información disponible; la referencia a 90,7 % en GSM8K corresponde al build hermano Ministral-3-3B-Reasoning con la misma receta de cuantización int4, no a este modelo.

## Requisitos de hardware

- Tamaño del bundle: ~1,61 GB (`model.litertlm`), lo que permite almacenarlo en móviles y portátiles sin problema de espacio.
- Pico de memoria medido en Samsung Galaxy S26 con backend GPU: 859 MB.
- VRAM estimada para inferencia: no disponible de forma explícita; el pico de memoria del proceso en Android GPU es de 859 MB, referencia útil para GPUs integradas y móviles.
- GPU recomendadas: Apple Silicon con Metal (M4 Max validado), GPU Android vía LiteRT GPU (Galaxy S26 validado). GPU de escritorio dedicadas (A100, H100, RTX 4090): no disponible en la información proporcionada.
- Cabe en GPU de consumo: sí, según el pico de 859 MB en móvil y la ejecución validada en Apple Silicon; no se detallan modelos concretos de RTX.
- Opciones de despliegue: LiteRT-LM (`litert-lm run`, `litert-lm serve` con API compatible con OpenAI, `litert-lm benchmark`), runtime Swift de LiteRT-LM para iPhone/macOS, `litert_lm_advanced_main` en Android. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: TTFT de 0,15 s (GPU Metal) y 2,04 s (CPU) en M4 Max; decode de 137,2 tok/s (GPU) y 31,9 tok/s (CPU) en el mismo equipo; ~20 tok/s CPU y ~45 tok/s GPU estimados en iPhone 17 Pro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InternVL3_5-2B (LiteRT-LM) | 2B | 2048 (KV) | `.litertlm` / LiteRT-LM | Apache-2.0 | Hugging Face (litert-community) |
| InternVL3-2B (LiteRT-LM) | 2B | no disponible | `.litertlm` / LiteRT-LM | Apache-2.0 (modelo base) | Hugging Face (litert-community) |
| FastVLM-0.5B (LiteRT-LM) | 0,5B | no disponible | `.litertlm` / LiteRT-LM | no disponible | Hugging Face (litert-community) |
| Ministral-3-3B-Reasoning (LiteRT-LM) | 3B | no disponible | `.litertlm` / LiteRT-LM | no disponible | Hugging Face (litert-community) |

La comparación se limita a builds del mismo ecosistema LiteRT-LM, ya que no se dispone de datos de benchmarks cruzados con otros VLMs pequeños (por ejemplo, Qwen2.5-VL o SmolVLM) en la información proporcionada.

## Limitaciones y advertencias

- Una sola imagen por conversación en el backend GPU (Metal): una segunda imagen en el mismo chat trunca la respuesta. Es una limitación del delegado GPU del runtime, reproducible también con FastVLM-0.5B; para multi-imagen hay que usar el backend CPU.
- Contexto de caché KV limitado a 2048 tokens: restringe conversaciones largas y el número de imágenes acumuladas en el historial.
- Resolución de imagen fija a 448×448: puede perder detalle en imágenes de alta resolución o con texto pequeño.
- No hay datos publicados de benchmarks de calidad para este bundle; las cifras de GSM8K citadas pertenecen a otro modelo con la misma receta de cuantización.
- La cuantización int4 del decodificador puede degradar ligeramente el razonamiento frente al modelo base en precisión completa; no se han publicado evaluaciones comparativas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplicable el riesgo general de los VLMs pequeños en descripciones detalladas.
- Idiomas soportados: no disponible; no se garantiza un rendimiento multilingüe más allá de lo que ofrezca el backbone Qwen3.
- Licencia Apache-2.0 en el modelo base, lo que permite uso comercial; conviene verificar los términos del runtime LiteRT-LM por separado.
- El rendimiento on-device citado para iPhone 17 Pro es una expectativa basada en el build InternVL3-2B, no una medición de este build; se recomienda medir antes de comprometer cifras en producción.
- En Android, la validación publicada cubre la creación del motor y la ruta de texto; la ruta visual en GPU no está medida en ese dispositivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/InternVL3_5-2B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-2B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Build hermano FastVLM-0.5B: https://huggingface.co/litert-community/FastVLM-0.5B
- Build hermano Ministral-3-3B-Reasoning: https://huggingface.co/litert-community/Ministral-3-3B-Reasoning-2512
- Guía de GPU en Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Imagen de muestra COCO: https://huggingface.co/huggingface/documentation-images/blob/main/coco_sample.png
