# keptn/nemotron-3.5-bolt-74b-w4a8

## Resumen

Nemotron 3.5 Bolt 74B-A9B W4A8 es una cuantización comunitaria del modelo multimodal NVIDIA-Nemotron-3.5-Bolt-74B-A9B, publicada por el usuario keptn en Hugging Face. El checkpoint original de NVIDIA es un modelo de 74B parámetros totales con 9B activos (arquitectura MoE, según la denominación A9B), con capacidades de visión (image-text-to-text) y un contexto de 262.144 tokens. Esta versión redistribuye el modelo en un único archivo de 42,99 GiB optimizado para el motor de inferencia radiance sobre GPU AMD RDNA4.

El objetivo del release es resolver un problema concreto: ejecutar un modelo MoE de 74B con calidad cercana al original bf16 pero con una huella de memoria que quepa en 2 o 4 tarjetas AMD de 32 GB. Para ello, los expertos enrutados se cuantizan a 4 bits (round-to-nearest, una escala por cada 64 pesos) y el resto de capas lineales a FP8 en bloques, sin datos de calibración. El paquete incluye además el drafter LiLiCorr de NVIDIA para decodificación especulativa con 7 tokens de borrador, y la torre de visión RADIO.

La relevancia de esta ficha radica en el ecosistema: es uno de los pocos empaquetados de este modelo para hardware AMD (ROCm/RDNA4, probado en Radeon AI PRO R9700), con mediciones de velocidad y de divergencia KL frente al original publicadas por el propio autor. La versión cuantizada mantiene un 97,9 % de coincidencia en el token superior y un ratio de perplejidad ×1,000 respecto al bf16 en MT-Bench.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto e imagen), con torre de visión RADIO y drafter LiLiCorr |
| Parámetros totales | 74B |
| Parámetros activos | 9B (MoE, según denominación A9B del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Expertos a 4 bits (round-to-nearest, tabla w4nl64, una escala por 64 pesos); resto de capas lineales FP8 en bloques; sin datos de calibración |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (other) |
| Formato de pesos | Archivo único `.rad` de 42,99 GiB (formato propio del motor radiance; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA-Nemotron-3.5-Bolt-74B-A9B, un transformer con mezcla de expertos (MoE) de 74B parámetros totales y 9B activos por token. Es un modelo multimodal que acepta texto e imagen: incorpora la torre de visión RADIO de NVIDIA y soporta un modo de razonamiento ("thinking") activable por petición. El contexto máximo es de 262.144 tokens. Los detalles sobre el corpus de preentrenamiento (número de tokens, composición del dataset) y sobre el post-entrenamiento (RLHF, DPO) no están disponibles en la información proporcionada.

Esta variante no modifica el entrenamiento: es una conversión de checkpoint. El proceso del autor consistió en descargar el original bf16 (revisión e09a4ced) y el drafter LiLiCorr de 24 GB (revisión 449d2414), y convertir el checkpoint con la receta `nemotron-3.5-bolt-74b-w4a8`: los expertos enrutados se redondean al valor más próximo a 4 bits (una escala por cada 64 pesos) y todas las demás capas lineales pasan a FP8 en bloques. El autor probó GPTQ para los expertos y descartó el método porque no superó al redondeo simple en calidad global. La decodificación especulativa se configura con 7 tokens de borrador, la profundidad que NVIDIA usa en sus recetas, y el muestreo recomendado es temperature 1,0 y top_p 0,95.

## Capacidades

- Generación de texto y razonamiento, con modo de rthinking activable por petición (`enable_thinking: true` en la plantilla de chat)
- Comprensión de imágenes (pipeline image-text-to-text) mediante la torre de visión RADIO; el autor valida contra DocVQA y AI2D
- Contexto muy largo: hasta 262.144 tokens (con limitaciones de memoria según número de tarjetas y secuencias concurrentes)
- Decodificación especulativa con el drafter LiLiCorr (7 tokens de borrador) para acelerar el decode
- Despliegue como servidor OpenAI-compatible vía radiance (puerto 8000, parámetros `--max-num-seqs`, `--max-model-len`)
- Soporte de tool calling / function calling: no disponible en la información proporcionada
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada
- Capacidades multilingües: no disponible en la información proporcionada

## Casos de uso

- Procesamiento de documentos extensos con imágenes: con 262.144 tokens de contexto y entrada de imagen, es adecuado para analizar documentación técnica, informes o contratos escaneados completos en una sola pasada (en 4 tarjetas, con `--max-model-len 262144 --max-num-seqs 2`)
- Servidores de inferencia autoalojados sobre hardware AMD: el empaquetado está probado específicamente en Radeon AI PRO R9700 (RDNA4) con ROCm, útil para organizaciones que no quieren depender de GPU NVIDIA
- Chatbot de alto throughput: con 2 tarjetas alcanza 207 tokens/s en decode de un stream y 351 tokens/s agregados en 4 streams concurrentes, suficiente para un servicio multiusuario de tamaño moderado
- RAG sobre corpus grandes: el prefill de 24k tokens a 5.272 tokens/s (2 tarjetas) permite indexar y procesar contextos recuperados largos con latencia baja
- Asistente de análisis visual: clasificación y respuesta a preguntas sobre imágenes (tipo DocVQA y AI2D) integrada en el mismo endpoint de texto
- Experimentación con cuantización W4A8: el model card documenta metodología, KL frente al original y decisiones (GPTQ vs. round-to-nearest), lo que lo hace útil como referencia para quien cuantice modelos MoE
- Despliegue en contenedores: el repositorio incluye archivos compose y comandos Docker listos para producción con aislamiento de dispositivos (`/dev/kfd`, `/dev/dri`)

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este checkpoint en la información disponible. El autor publica métricas propias de velocidad y de fidelidad de cuantización:

Velocidad (Radeon AI PRO R9700 a 215 W, radiance PR #339, KV bf16, 7 draft tokens, thinking off, temperature 0,7; tokens/s mediana):

| Métrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | no cabe | 207,0 | 284,3 |
| Prefill a 24k tokens | no cabe | 5.272 | 6.111 |
| 4 streams, total | no cabe | 351 | 495 |

Fidelidad frente al bf16 original (80 preguntas de MT-Bench, ambas rondas, 41.586 tokens de respuesta):

| Checkpoint | KL media | KL percentil 99 | Token superior igual | Ratio de perplejidad |
|---|---|---|---|---|
| Este archivo (W4A8) | 0,00503 | 0,0602 | 97,9 % | ×1,000 |
| keptn/nemotron-3.5-bolt-74b-fp8 | 0,00301 | 0,0361 | 98,4 % | ×1,000 |

## Requisitos de hardware

- VRAM estimada: el archivo pesa 42,99 GiB; con 1 tarjeta de 32 GB no cabe, se necesitan 2 o 4 tarjetas de 32 GB (probado en Radeon AI PRO R9700). El KV pool a contexto completo (262.144 tokens, KV bf16) permite 524.288 tokens totales con 2 tarjetas y hasta 2.097.328 tokens con 4
- GPU recomendadas: Radeon AI PRO R9700 (RDNA4, gfx1201) en configuraciones de 2 o 4 tarjetas; requiere ROCm y soporte RDNA4 en el motor radiance
- Consumer GPU: no hay datos de compatibilidad con GPUs consumer; el model card solo documenta la Radeon AI PRO R9700. GPUs NVIDIA no están soportadas por este empaquetado (radiance va dirigido a AMD RDNA4)
- Opciones de despliegue: exclusivamente el motor radiance, y además se requiere la versión de PR #339 (aún sin release oficial). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que usa el formato propio `.rad`
- Latencia y throughput: 207 tokens/s en decode con un stream (2 tarjetas), 284,3 con 4; prefill de 5.272–6.111 tokens/s a 24k tokens; 351–495 tokens/s agregados con 4 streams
- Despliegue vía Docker con acceso a dispositivos KFD/DRI, grupos `video` y `render`, y variables `ROCR_VISIBLE_DEVICES` para seleccionar tarjetas

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|---|
| keptn/nemotron-3.5-bolt-74b-w4a8 (este) | 74B (9B activos) | W4A8 (expertos 4-bit, resto FP8) | 262.144 | `.rad` (radiance) | AMD RDNA4 (2–4 × 32 GB) | openmdw-1.1 |
| keptn/nemotron-3.5-bolt-74b-fp8 | 74B (9B activos) | FP8 | no disponible | `.rad` (radiance) | AMD RDNA4 | no disponible |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74B (9B activos) | BF16 (sin cuantizar) | 262.144 | Checkpoint HF | NVIDIA / HF transformers | no disponible |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr | no disponible | no disponible | no disponible | Checkpoint HF (drafter) | no disponible | no disponible |

En calidad, la variante FP8 del mismo autor es ligeramente más fiel al original (KL media 0,00301 frente a 0,00503; 98,4 % de coincidencia de token superior frente a 97,9 %), a costa de un mayor consumo de memoria. La variante W4A8 es la opción cuando la VRAM disponible limita a 2 tarjetas de 32 GB.

## Limitaciones y advertencias

- Requiere radiance con PR #339, que todavía no está en ninguna release oficial: hay que compilar desde el branch del pull request, lo que añade fragilidad al despliegue
- Formato propietario `.rad`: no funciona con vLLM, llama.cpp, Ollama ni TGI; la portabilidad del checkpoint queda limitada al ecosistema radiance sobre AMD RDNA4
- Con 1 tarjeta de 32 GB el modelo no cabe; el mínimo documentado son 2 tarjetas
- El contexto completo de 262.144 tokens reduce drásticamente las secuencias concurrentes (2 secuencias con 4 tarjetas según la configuración recomendada)
- Sin datos de calibración en la cuantización: aunque la KL medida es baja, la evaluación se limita a MT-Bench (80 preguntas) y a un conjunto fijo de imágenes; no hay benchmarks estándar independientes
- Sesgos conocidos: no disponible; hereda los del modelo base NVIDIA, que no se documentan en la información proporcionada
- Riesgo de alucinación: no disponible específicamente; como todo LLM generativo, puede producir contenido incorrecto, especialmente en modo thinking desactivado
- Idiomas soportados: no disponible; verificar antes de usar en producción en castellano u otros idiomas
- Licencia openmdw-1.1 (tipo "other"): revisar el texto de la licencia en el repositorio antes de uso comercial; no se detalla aquí
- Descargas: 0 en el momento de la ficha, lo que indica adopción mínima y ausencia de validación comunitaria
- La tabla de validación de imágenes del model card aparece vacía: la comparativa multimodal contra el original no tiene resultados publicados

## Enlaces

- Ficha del modelo: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-w4a8
- Modelo base bf16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Modelo base LiLiCorr (drafter): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Variante FP8 del mismo autor: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-fp8
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- PR #339 de radiance (requerido): https://codeberg.org/StillDeadcode/radiance/pulls/339
- Framework de model cards del autor: https://codeberg.org/keptn42/radiance-model-cards-framework
