# litert-community/InternVL3_5-1B

## Resumen

InternVL3_5-1B en formato LiteRT-LM es una conversión del modelo vision-language compacto InternVL3.5-1B de OpenGVLab al formato `.litertlm`, empaquetado por la comunidad litert-community para inferencia local en dispositivos (on-device) mediante el runtime LiteRT-LM de Google. El modelo combina un codificador visual InternViT con un decodificador de lenguaje Qwen3-0.6B, lo que permite responder preguntas sobre imágenes sin conexión a servicios en la nube.

El bundle ocupa aproximadamente 0,82 GB y aplica cuantización agresiva: pesos int8 en el codificador visual y int4 (blockwise-32 con OCTAV) en el decodificador, además de embeddings de entrada en INT8. Está pensado para ejecutarse en CPU y GPU (Metal en Apple, LiteRT GPU en Android) en portátiles, móviles y equipos de escritorio, con una ventana de contexto de 2048 tokens y entrada de imagen fija a 448×448 píxeles.

Su relevancia actual radica en que demuestra que un VLM funcional puede desplegarse íntegramente en hardware de consumo y dispositivos móviles con licencia Apache-2.0, manteniendo la fidelidad del codificador visual (correlación ≈ 1.0 frente a la referencia en float) y un rendimiento de decodificación de 176 tok/s en GPU Metal sobre un Apple M4 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: InternViT (encoder) + pixel-shuffle + proyector MLP + Qwen3-0.6B (decoder) |
| Parametros totales | no disponible (el decoder es Qwen3-0.6B; el encoder InternViT no se cuantifica en el nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (KV cache) |
| Tipos de cuantizacion | Vision: int8; decoder: int4 simetrico blockwise-32 + OCTAV; input embedding: INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors |
| Tamano del bundle | ~0,82 GB (`model.litertlm`) |
| Entrada de imagen | 448×448, normalizacion ImageNet integrada; 256 tokens de imagen |
| Computo | entero (integer) |
| Modelo base | OpenGVLab/InternVL3_5-1B |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura InternVL: un codificador visual InternViT procesa una única imagen de 448×448, aplica pixel-shuffle para reducir la secuencia espacial y un proyector MLP que alinea los tokens visuales (256) con el espacio del decodificador. El decodificador es Qwen3-0.6B, sustituyendo al Qwen2.5-1.5B de la generación InternVL3-2B, lo que reduce el coste computacional manteniendo capacidad de razonamiento textual. La conversión a LiteRT-LM usa la ruta `fast_vlm` del runtime, con pesos int8 en visión e int4 en el decodificador.

No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset ni si hubo RLHF/DPO); esos datos corresponden al modelo base OpenGVLab/InternVL3_5-1B y no se reproducen aquí. La innovación técnica destacable es la conversión bit-fiel del codificador visual (correlación extremo a extremo ≈ 1.0, diferencia máxima absoluta ~1e-4, sin operaciones FLEX/CUSTOM de respaldo) y la receta de cuantización int4 blockwise-32 + OCTAV, que en el build hermano Ministral-3-3B-Reasoning alcanza 90,7% en GSM8K.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción, respuesta a preguntas visuales (VQA) y grounding básico.
- Procesamiento de una imagen de 448×448 por consulta, con normalización ImageNet integrada en el encoder.
- Soporte de múltiples imágenes por conversación en el backend CPU (el backend GPU limita a una imagen por chat).
- Chat interactivo multi-turno mediante el runtime LiteRT-LM.
- API local compatible con OpenAI a través de `litert-lm serve`.
- Ejecución multiplataforma: macOS, Linux y Windows con el mismo fichero; Swift runtime para iPhone/macOS.
- Capacidades de razonamiento y matemáticas heredadas del decodificador Qwen3-0.6B (no verificadas de forma independiente en este bundle).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Soporte multilingüe: no disponible en la información proporcionada.
- Modo thinking, audio: no disponible.

## Casos de uso

- Descripción automática de imágenes en local: el modelo genera descripciones de una frase o detalladas (por ejemplo, "Two tabby cats are lying on a pink couch, with remote controls nearby") sin enviar datos a la nube, adecuado para aplicaciones de privacidad estricta.
- Asistencia a personas con discapacidad visual: un móvil Android o iPhone ejecuta el bundle y responde a preguntas sobre el entorno capturado por la cámara, con latencia de primera token de 0,08 s en GPU Metal.
- Etiquetado y moderación de contenido visual en pipelines de ingestión: clasificación y descripción de imágenes a gran escala en servidores sin GPU dedicada, gracias al backend CPU con 338 tok/s de prefill.
- Prototipado de aplicaciones VLM en portátiles: desarrolladores que validan flujos de image-text-to-text con `litert-lm run` y la API OpenAI-compatible antes de invertir en infraestructura.
- Procesamiento de documentos escaneados o capturas: extracción de información textual a partir de imágenes de formularios, tickets o pantallas, con contexto de 2048 tokens suficiente para preguntas y respuestas cortas.
- Aplicaciones de campo sin conectividad: inspección visual en entornos remotos (agricultura, mantenimiento industrial) donde el dispositivo no tiene red y se requiere inferencia íntegramente local.
- Educación y accesibilidad en dispositivos de gama media: integración en apps móviles mediante el runtime Swift de LiteRT-LM para responder preguntas sobre material visual didáctico.

## Benchmarks y rendimiento

Rendimiento de inferencia medido con `litert-lm benchmark` (litert-lm 0.15.0) en Apple M4 Max, `-p 256 -d 256 --runs 3`, max-num-tokens 4096, warm-up descartado, máquina inactiva. Solo ruta de texto; el encoder visual no está incluido.

| Dispositivo | Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 338 tok/s | 43,7 tok/s | 0,84 s |
| Apple M4 Max (macOS) | GPU (Metal) | 3878 tok/s | 176,2 tok/s | 0,08 s |

Prueba en Samsung Galaxy S26 (SM-S942Q / SM8850, Android 16) con `litert_lm_advanced_main` de litert-lm 0.16.0, `--backend=gpu --sampler_backend=cpu`, prompt "What is the capital of France?": el bundle ejecuta en GPU con delegación 3840/3840 operaciones en 3 subgrafos sobre LiteRT GPU y pico de memoria de 628 MB. No se publican cifras de velocidad para este dispositivo.

Rendimiento esperado on-device (no medido de forma independiente para este build): ~20 tok/s en CPU y ~45 tok/s en GPU en iPhone 17 Pro para VQA de una imagen, en línea con el build InternVL3-2B.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) específicos para este bundle en la información disponible. La model card cita 90,7% en GSM8K para el build hermano Ministral-3-3B-Reasoning con la misma receta de cuantización int4, no para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle pesa ~0,82 GB; el pico de memoria medido en Samsung Galaxy S26 con backend GPU es de 628 MB. En CPU se requiere al menos ~1 GB libre para pesos y estado del runtime.
- GPU recomendadas: Apple Silicon con Metal (M4 Max medido), GPU integradas en Android compatibles con LiteRT GPU (Samsung Galaxy S26 medido). No se especifican modelos NVIDIA/AMD; el runtime LiteRT-LM está orientado a edge.
- Cabe en GPU de consumo: sí, en Apple Silicon y móviles Android de gama alta; no se documenta soporte para RTX 4090, A100 o H100.
- Opciones de despliegue: `litert-lm run` (CLI), `litert-lm serve` (API local compatible con OpenAI), runtime Swift de LiteRT-LM para iPhone/macOS, `litert_lm_advanced_main` en Android.
- Latencia y throughput: TTFT de 0,08 s (GPU Metal) y 0,84 s (CPU) en M4 Max; decode de 176,2 tok/s (GPU) y 43,7 tok/s (CPU); prefill de 3878 tok/s (GPU) y 338 tok/s (CPU).
- Almacenamiento: ~0,82 GB para el fichero `model.litertlm`; el repo completo ocupa 4,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/InternVL3_5-1B | Decoder Qwen3-0.6B + InternViT | 2048 | `.litertlm` | Apache-2.0 | Bundle on-device con int4/int8; GPU Metal y LiteRT GPU |
| litert-community/FastVLM-0.5B | no disponible | no disponible | `.litertlm` | no disponible | Mismo runtime; reproduce la truncación multi-imagen en GPU |
| OpenGVLab/InternVL3_5-1B | no disponible | no disponible | safetensors | Apache-2.0 | Modelo base sin cuantizar; requiere runtime estándar (transformers) |
| InternVL3-2B (build previo) | Decoder Qwen2.5-1.5B + InternViT | no disponible | `.litertlm` | no disponible | Generación anterior; ~20 tok/s CPU y ~45 tok/s GPU en iPhone 17 Pro |

No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- En el backend GPU (Metal), una segunda imagen en la misma conversación trunca la respuesta; es una limitación del runtime `fast_vlm` en GPU, no del modelo. Para multi-imagen fiable, usar el backend CPU.
- Contexto limitado a 2048 tokens de KV cache, insuficiente para conversaciones largas o documentos extensos.
- Entrada de imagen fija a 448×448; imágenes de alta resolución pierden detalle tras el redimensionado.
- No hay información sobre idiomas soportados; el comportamiento multilingüe no está verificado.
- Riesgo de alucinación inherente a modelos de 0,6B de decodificador en tareas de razonamiento complejo o VQA con imágenes ambiguas.
- Sesgos conocidos: no documentados en la información disponible.
- La cuantización int4 del decodificador puede degradar tareas de matemáticas y razonamiento frente al modelo base en float; no se han publicado evaluaciones específicas.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia y condiciones del modelo base OpenGVLab/InternVL3_5-1B y de los datos de entrenamiento.
- El soporte de tool calling, agentes y modo thinking no está documentado; no asumir su disponibilidad en producción.
- Las cifras de rendimiento on-device para este build concreto no se han medido de forma independiente; la model card recomienda verificación antes de citar números exactos.

## Enlaces

- Hugging Face (bundle LiteRT-LM): https://huggingface.co/litert-community/InternVL3_5-1B
- Ficheros del repositorio: https://huggingface.co/litert-community/InternVL3_5-1B/tree/main
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-1B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Build hermano Ministral-3-3B-Reasoning: https://huggingface.co/litert-community/Ministral-3-3B-Reasoning-2512
- Guía GPU para Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Modelo de referencia del runtime: https://huggingface.co/litert-community/FastVLM-0.5B
