# OsaurusAI/Nemotron-3-Nano-Omni-30B-A3B-JANG_6M

## Resumen

Nemotron-3-Nano-Omni-30B-A3B-JANG_6M es un port a Apple MLX del modelo omni-modal de NVIDIA Nemotron-3-Nano-Omni-30B-A3B-Reasoning, cuantizado por OsaurusAI con una receta mixta de 6 y 8 bits calibrada con Hessian, imatrix y AWQ. El modelo original de NVIDIA es un LLM híbrido de arquitectura Mamba-2 + attention + mixture-of-experts (MoE) con 31B parámetros totales y unos 3B activos, que añade torres de visión (RADIO ViT), audio (Parakeet) y video (EVS) para ofrecer comprensión completa de texto, imagen, vídeo y voz en un único modelo.

La variante JANG_6M mantiene las torres de visión y audio en fp16 sin cuantizar, de modo que todas las modalidades funcionan de forma nativa en hardware Apple Silicon. El modelo se distribuye en formato MLX (safetensors) y está pensado para ejecutarse con el runtime Osaurus/vMLX o directamente con `mlx_lm` para la parte LLM. Su relevancia reside en ofrecer un modelo omni-modal de razonamiento con eficiencia de parámetros activos (A3B) optimizado para equipos Apple con memoria unificada, algo poco habitual en el ecosistema de modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + Attention + Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 31B según el autor (los safetensors registran 8.489.433.174 parámetros, probablemente solo la parte LLM; las torres de visión y audio no están cuantizadas) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | no disponible (la calibración menciona long-context; el presupuesto de razonamiento por defecto es 16.384 tokens) |
| Tipos de cuantizacion | Mixta 6-bit/8-bit (JANG_6M): expertos enrutados a 6-bit, atención y shared expert a 8-bit, torres de visión/audio y proyectores a fp16. Variantes de la familia: JANG_4M y MXFP4 |
| Idiomas soportados | en (inglés; la calibración incluye corpus multilingüe, pero la model card declara solo inglés) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron-3-Nano-Omni-30B-A3B-Reasoning, combina bloques de atención clásica con capas Mamba-2 (state space model) y una capa de mezcla de expertos con un experto compartido, lo que permite activar solo ~3B de los 30B totales por token. La versión omni añade un vision tower RADIO (ViT con tiles de 512px y thumbnail), un encoder de audio Parakeet de 24 capas Conformer y un módulo de video con muestreo de frames y pruning EVS. NVIDIA incorpora además técnicas de reducción de tokens multimodales para reducir latencia y aumentar throughput frente a modelos de tamaño similar.

La cuantización JANG_6M es una asignación de precisión mixta calibrada post-training: los expertos enrutados (`switch_mlp.fc1`/`fc2`, el 93% de los parámetros) se fijan en 6 bits, mientras que el shared expert, la atención y el `lm_head` van a 8 bits, y las torres de visión y audio permanecen en fp16 sin tocar. La calibración se realiza contra activaciones medidas de un corpus ponderado por dominio (código, agente/tool, razonamiento, general, multilingüe, contexto largo) usando imatrix, AWQ y una matriz Hessiana capturada por capa MoE. No se ofrece variante de 2 bits porque la capa de expertos del MoE es demasiado sensible a la baja cuantización. El modelo se distribuye con `generation_config.json` que activa el modo de razonamiento por defecto (`enable_thinking`).

## Capacidades

- Razonamiento de texto con modo thinking activado por defecto (presupuesto de razonamiento de 16.384 tokens y `max_tokens` de 20.480).
- Comprensión de imágenes mediante el vision tower RADIO ViT con tiles de 512px y thumbnail.
- Comprensión de video con muestreo de frames y pruning EVS.
- Reconocimiento de voz y transcripción (ASR) con el encoder Parakeet de 24 capas Conformer.
- Tool calling / function calling en formato XML `<tool_call><function=...>` para casos de uso agénticos.
- Soporte de agentes y razonamiento multi-paso gracias al presupuesto de tokens de razonamiento.
- Capacidad multilingüe limitada: la model card declara solo inglés, aunque la calibración incluye corpus multilingüe.
- Modo instruct no-thinking con sampling determinista (temperature 0.2, top_k 1).
- Ejecución nativa en Apple Silicon a través de MLX.

## Casos de uso

- Asistente multimodal local en Apple Silicon: el modelo puede responder preguntas sobre imágenes, audio y texto con razonamiento activado, ideal para equipos que quieren un asistente de IA privado sin depender de la nube.
- Transcripción de audio y vídeo: gracias al encoder Parakeet, se puede convertir grabaciones, reuniones o podcasts a texto con un solo modelo, sin pipelines separados de ASR.
- Análisis de vídeo para vigilancia o revisión de contenido: el muestreo de frames con EVS permite resumir secuencias largas y extraer eventos relevantes sin necesidad de procesar cada frame.
- Agentes con tool calling: el formato XML `<tool_call>` permite integrar el modelo en pipelines de automatización que necesitan invocar funciones externas (APIs, bases de datos, etc.) desde un entorno local.
- Comprensión de documentos con imágenes: al combinar la visión RADI con el razonamiento, se pueden procesar facturas, informes o capturas de pantalla y responder preguntas sobre su contenido.
- Prototipado de aplicaciones omni-modales en desarrollo: al ser MLX nativo y cargar con `mlx_lm`, es adecuado para iterar rápidamente en entornos de desarrollo con Macs, sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de NVIDIA "Nemotron 3 Nano Omni: Efficient and Open Multimodal Intelligence" (arXiv:2604.24954) describe mejoras de latencia y throughput frente a modelos de tamaño similar, pero no se incluyen cifras concretas en esta ficha.

## Requisitos de hardware

- Requiere Apple Silicon con memoria unificada de al menos 32 GB (los pesos MLX ocupan 29.1 GB en disco y la carga completa necesita RAM suficiente).
- El autor reporta ~110 tokens/s de decode en un chip M5 Max.
- No es apto para GPU NVIDIA o AMD: el formato MLX es exclusivo de Apple Silicon.
- Se ejecuta con el runtime Osaurus (https://github.com/dinoki-ai/osaurus) o vMLX, que incluyen el stack NemotronHOmni completo (RADIO vision, Parakeet audio, EVS video).
- La parte LLM también carga directamente con `mlx_lm` (`load`/`generate`), aunque en ese caso las torres de visión y audio no estarán disponibles.
- No hay soporte para vLLM, llama.cpp u Ollama en este formato; el despliegue está pensado para el ecosistema MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 (NVIDIA) | 30B total / ~3B activo | no disponible | texto, imagen, video, audio | NVIDIA Open Model License | Hugging Face (BF16) |
| OsaurusAI JANG_6M (esta ficha) | 31B total / ~3B activo (8.5B en safetensors) | no disponible | texto, imagen, video, audio | NVIDIA Open Model License | Hugging Face (MLX) |
| OsaurusAI JANG_4M y MXFP4 | 31B total / ~3B activo | no disponible | texto, imagen, video, audio | NVIDIA Open Model License | Hugging Face (MLX) |

No se dispone de benchmarks comparativos con otros modelos multimodales de tamaño similar (por ejemplo, Qwen2.5-VL o Pixtral) en la información consultada.

## Limitaciones y advertencias

- La model card declara solo inglés como idioma soportado, aunque la calibración incluye corpus multilingüe; el rendimiento en otros idiomas no está garantizado.
- El modo de razonamiento está activado por defecto y desactivarlo genera un prefijo de ` thinking` vacío en lugar de omitirlo, lo que puede afectar a la salida si se cambia la configuración.
- El token EOS es `[2, 11]`: si se elimina el token 11 del vocabulario, el modelo nunca deja de generar.
- No existe variante de 2 bits: el autor indica que la MLP del MoE es demasiado sensible a la baja cuantización, por lo que las opciones de compresión son limitadas.
- La licencia NVIDIA Open Model License puede imponer restricciones de uso comercial; hay que revisar sus términos antes de desplegar en producción.
- El modelo es reciente y tiene 0 descargas y 0 likes en Hugging Face: no hay validación comunitaria ni soporte a largo plazo garantizado.
- El tamaño del repo (29.1 GB) lo hace inviable para equipos con menos de 32 GB de RAM unificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/Nemotron-3-Nano-Omni-30B-A3B-JANG_6M
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Variante JANG_4M: https://huggingface.co/OsaurusAI/Nemotron-3-Nano-Omni-30B-A3B-JANG_4M
- Variante MXFP4: https://huggingface.co/OsaurusAI/Nemotron-3-Nano-Omni-30B-A3B-MXFP4
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning/modelcard
- Página de Nemotron de NVIDIA Developer: https://developer.nvidia.com/topics/ai/nemotron
- Paper arXiv: https://arxiv.org/html/2604.24954
- Repositorio Osaurus: https://github.com/dinoki-ai/osaurus
