# 88plug/Gemma4-E2B-it-W8A16

## Resumen

Gemma4-E2B-it-W8A16 es una cuantización INT8 post-entrenamiento (W8A16) del modelo multimodal google/gemma-4-e2b-it, publicada por el laboratorio 88plug. El modelo base es un Mixture-of-Experts (MoE) disperso de Google DeepMind con 128 expertos, unos 5.100 millones de parámetros totales y aproximadamente 2.000 millones de parámetros activos por token (de ahí la denominación "E2B"), que combina atención híbrida deslizante y global con un codificador visual SigLIP para tareas de imagen-a-texto.

La relevancia de esta ficha concreta es el formato de despliegue: los pesos están empaquetados en compressed-tensors, lo que permite cargarlos nativamente en vLLM 0.21 o superior sin flag de cuantización, con un tamaño aproximado de 2,5 GB que cabe en cualquier GPU consumer de 8 GB (RTX 3080, RTX 4070). Es el primer checkpoint W8A16 en ese formato para la familia Gemma4-E2B según el autor.

La cuantización es de tipo RTN (round-to-nearest) sin corpus de calibración, marcada por el autor como "provisional" a la espera de una recalibración AutoRound. Se mantienen en BF16 el torre de visión, el proyector multimodal y las capas de Per-Layer Embeddings (PLE) para evitar pérdida catastrófica de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (128 expertos) con atención híbrida deslizante + global y codificador visual SigLIP; cuantización W8A16 sobre compressed-tensors |
| Parametros totales | 5.104.297.539 (~5,1 B) |
| Parametros activos | ~2 B (denominación E2B del modelo base) |
| Longitud de contexto | 32.768 tokens (configurado en los ejemplos de despliegue del autor) |
| Tipos de cuantizacion | INT8 W8A16 (RTN data-free); capas de visión, proyector multimodal y PLE en BF16. El modelo base admite además GGUF Q4_K_M, Q8_0 e IQ4_XS vía llama.cpp |
| Idiomas soportados | en (inglés, según model card y metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en compressed-tensors (pack-quantized / int-quantized); conversión a GGUF posible vía llama.cpp |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-e2b-it es un transformer con mezcla de expertos dispersa de 128 expertos y unos 2.000 millones de parámetros activos por token, sobre un total de ~5,1 B. Incorpora atención híbrida que combina ventanas deslizantes con atención global, y un torre de visión SigLIP acoplado mediante un proyector multimodal, lo que le permite procesar entradas de imagen y texto de forma conjunta. Las capas de Per-Layer Embeddings (PLE) son una innovación propia de la familia Gemma4 que el autor preserva explícitamente en BF16 durante la cuantización.

Sobre el proceso de cuantización: 88plug aplica RTN (round-to-nearest) data-free, sin corpus de calibración, sobre las capas `language_model.*`, y mantiene en BF16 el torre de visión, el proyector multimodal y `embed_tokens_per_layer` / `per_layer_model_projection`. La herramienta empleada es llmcompressor y el formato resultante es compressed-tensors. No se han publicado detalles sobre el dataset de entrenamiento del modelo base, número de tokens, ni si hubo RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto conversacional e instrucciones (modelo "-it", ajustado a instrucciones).
- Procesamiento multimodal imagen-a-texto mediante el codificador SigLIP: descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Razonamiento y matemáticas básicas, herencia del modelo base Gemma4-E2B.
- Soporte multilingüe limitado: la model card declara únicamente inglés (`en`).
- Capacidad de ejecución en GPUs consumer de 8 GB gracias a la cuantización INT8.
- Compatibilidad nativa con vLLM 0.21+ (detección automática de compressed-tensors) y con SGLang.
- Conversión a GGUF para despliegue en llama.cpp, incluyendo modo VLM con mmproj.
- No se documenta explícitamente soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Asistente visual en local para desarrolladores: desplegar el modelo en una RTX 4070 de 8 GB con vLLM y usarlo como servicio de imagen-a-texto para prototipos, sin depender de APIs externas.
- Descripción automática de imágenes en pipelines de accesibilidad: generar textos alternativos para catálogos de imágenes aprovechando el torre SigLIP y el contexto de 32.768 tokens para lotes largos.
- Moderación de contenido visual: clasificar y describir imágenes subidas por usuarios en una aplicación web, ejecutando el modelo en un único servidor con GPU consumer.
- Extracción de información de documentos escaneados: combinar OCR previo con el modelo para responder preguntas sobre capturas o diagramas, con contexto suficiente para varias páginas.
- Prototipado de agentes multimodales: usar el endpoint compatible con OpenAI de vLLM para integrar el modelo en frameworks de agentes que necesiten entrada visual, con throughput declarado de ~6.000 tok/s en configuraciones de prompt corto.
- Evaluación de cuantizaciones en investigación: servir como referencia W8A16 para comparar calidad frente a BF16 y GGUF Q8_0 en tareas de visión y texto.
- Despliegue en entornos con restricciones de memoria: servir el modelo en una RTX 3080 de 10 GB con `--kv-cache-dtype fp8` y `--max-model-len 32768` para aplicaciones de chat con imágenes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Throughput total (in2048_out512) | 6.483 tok/s (prompt + salida) |
| Throughput total (in512_out256) | 6.232 tok/s (prompt + salida) |
| Throughput total (in8192_out512) | 5.976 tok/s (prompt + salida) |

Datos medidos por el autor con vLLM v0.21.0 y lm-evaluation-harness. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible; el autor declara objetivos de recuperación de MMLU ≥ 99,7 % y divergencia KL < 0,005 frente a BF16, pero no reporta valores medidos.

## Requisitos de hardware

- VRAM estimada: ~2,5 GB de pesos en W8A16, más caché KV; con `--kv-cache-dtype fp8` y contexto de 32.768 tokens el consumo se mantiene holgado en 8 GB.
- GPU mínima declarada por el autor: 1× RTX 3080 de 10 GB o RTX 4070 de 8 GB.
- GPU recomendadas: RTX 4070 / 4080 / 4090, A100, H100; cualquier Ampere o superior con al menos 8 GB.
- Cabe en GPU consumer: sí, en RTX 3080, RTX 4070 y superiores; también en GPUs de 8 GB de generaciones posteriores.
- Opciones de despliegue: vLLM ≥ 0.21 (preferido, detección automática de compressed-tensors, sin flag `--quantization`), SGLang v0.5.8, transformers con compressed-tensors (soporte multimodal puede requerir código personalizado), llama.cpp vía conversión a GGUF con mmproj para visión.
- No soportado: Text Generation Inference (TGI) no carga este formato CT; el widget de inferencia de Hugging Face suele fallar.
- Latencia y throughput: ~6.000-6.500 tok/s totales según la configuración de entrada/salida reportada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 88plug Gemma4-E2B-it-W8A16 (este) | ~5,1 B totales / ~2 B activos | 32.768 | compressed-tensors INT8 | apache-2.0 | Hugging Face, vLLM nativo |
| google/gemma-4-e2b-it (BF16) | ~5,1 B totales / ~2 B activos | 32.768 | safetensors BF16 (~4,5 GB) | apache-2.0 | Hugging Face |
| GGUF Q4_K_M de la comunidad | ~5,1 B totales / ~2 B activos | 32.768 | GGUF (~2,5 GB) | apache-2.0 | Hugging Face, llama.cpp |
| GGUF Q8_0 de la comunidad | ~5,1 B totales / ~2 B activos | 32.768 | GGUF (~4,5 GB) | apache-2.0 | Hugging Face, llama.cpp |

No se dispone de datos de benchmarks de calidad comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El torre de visión SigLIP permanece en BF16: la cuantización INT8 no se aplica a los componentes visuales, por lo que el ahorro de memoria se limita al modelo de lenguaje.
- Las capas PLE (`embed_tokens_per_layer`, `per_layer_model_projection`) se mantienen en BF16 para evitar pérdida catastrófica de calidad.
- Cuantización RTN data-free: no se usó corpus de calibración; el autor la marca como "provisional" y tiene prevista una recalibración AutoRound. Los objetivos de calidad (KL < 0,005, MMLU ≥ 99,7 %) no están verificados con mediciones publicadas.
- Benchmark de calidad pendiente: solo se reportan métricas de throughput, no de exactitud.
- Idioma: únicamente inglés declarado; el rendimiento en castellano no está garantizado.
- TGI no es compatible con este formato; desplegar por esa vía produce errores opacos de worker/carga.
- El widget de inferencia de Hugging Face suele fallar con estos pesos; es necesario servir localmente con vLLM.
- Riesgo de alucinación inherente a modelos de ~2 B activos, especialmente en tareas de razonamiento complejo o matemáticas avanzadas.
- Licencia apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base de Google por si imponen condiciones adicionales no reflejadas en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/88plug/Gemma4-E2B-it-W8A16
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Perfil del autor: https://huggingface.co/88plug
- Informe técnico citado (Gemma 4 Technical Report, Google DeepMind, 2025): https://huggingface.co/google/gemma-4-e2b-it
