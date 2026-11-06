# keras/devstral_small_2_24b_instruct_2512_en

## Resumen

`keras/devstral_small_2_24b_instruct_2512_en` es una conversión a KerasHub del modelo Devstral Small 2 (24B) en su variante instruct, publicada por el equipo de Keras. Se trata de un modelo causal de generación de texto con capacidad multimodal (visión), construido sobre la arquitectura Mistral 3 que KerasHub implementa de forma nativa. La relevancia de esta ficha radica en que permite ejecutar un modelo de 24B con encoder visual desde JAX, TensorFlow o PyTorch usando una única API de Keras, lo que simplifica el despliegue multiplataforma.

El repositorio ocupa 48,9 GB, coherente con pesos en bfloat16 de un modelo de aproximadamente 24B de parámetros más un encoder visual de 24 capas. La model card es automática y no aporta información sobre datos de entrenamiento, benchmarks, licencia o idiomas soportados, por lo que muchos apartados de esta ficha quedan marcados como no disponibles. El nombre sugiere una ventana de contexto extendida mediante RoPE con escalado YaRN (factor 48 sobre 8192 posiciones originales), aunque el valor efectivo no se declara explícitamente.

La fecha de creación del repositorio (2026-11-04) y la ausencia de descargas o likes indican que se trata de una publicación reciente y sin validación comunitaria. Cualquier evaluación de producción debe hacerse con cautela y verificando el comportamiento real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 3) con encoder visual y proyector multimodal |
| Parametros totales | no disponible (repo de 48,9 GB; el nombre indica 24B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible explícitamente; `original_max_position_embeddings` = 8192 con `rope_scaling_factor` = 48 (YaRN), lo que sugiere contexto extendido |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (el sufijo `_en` sugiere orientación a inglés) |
| Licencia | no disponible |
| Formato de pesos | KerasHub (no safetensors/GGUF estándar); ejecutable con backends JAX, TensorFlow y PyTorch |

Parámetros de configuración relevantes:

| Parametro | Valor |
|---|---|
| `vocabulary_size` | 131072 |
| `num_layers` | 40 |
| `num_query_heads` | 32 |
| `num_key_value_heads` | 8 (GQA) |
| `head_dim` | 128 |
| `hidden_dim` | 5120 |
| `intermediate_dim` | 32768 |
| `rope_type` | yarn |
| `rope_max_wavelength` | 100000000.0 |
| `sliding_window` | None |
| `tie_word_embeddings` | False |
| `image_token_index` | 10 |
| `llama_4_scaling_beta` | 0.1 |
| Vision encoder | 24 capas, hidden 1024, 16 cabezas, patch 14, image_size 1540 |
| Proyector multimodal | vision 1024 → text 5120, spatial_merge_size 2, activación GELU |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Mistral 3 con 40 capas, atención con 32 cabezas de consulta y 8 cabezas de clave/valor (GQA), dimensión oculta de 5120 y dimensión intermedia de 32768. Usa RoPE con tipo YaRN, `rope_max_wavelength` de 1e8 y factor de escalado 48 sobre 8192 posiciones originales, lo que apunta a una extensión de contexto significativa. No hay sliding window activa (`sliding_window: None`), por lo que la atención es global en todas las capas. El vocabulario es de 131072 tokens y los embeddings de entrada y salida no están atados.

El componente multimodal consta de un encoder visual de 24 capas con dimensión oculta 1024, 16 cabezas, parches de 14x14 sobre imágenes de 1540x1540 y activación SiLU, conectado al espacio de texto mediante un proyector con `spatial_merge_size` 2 y activación GELU. El token de imagen es el índice 10. La inclusión de `llama_4_scaling_beta` sugiere la aplicación de la técnica de escalado de atención introducida en Llama 4.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición, ni sobre si se aplicaron fases de RLHF, DPO o instruction tuning específicas. La model card es autogenerada y no documenta el proceso.

## Capacidades

- Generación de texto causal en modo instruct.
- Procesamiento de imágenes mediante encoder visual integrado (entrada multimodal imagen + texto).
- Razonamiento y generación de código, dado el linaje Devstral (orientado a tareas de ingeniería de software).
- Soporte multilingüe: no confirmado; el sufijo `_en` sugiere foco en inglés.
- Tool calling / function calling: no documentado en la información disponible.
- Modo de razonamiento extendido (thinking): no documentado.
- Ejecución multi-backend (JAX, TensorFlow, PyTorch) a través de KerasHub.
- Capacidades de agente multi-paso: no documentadas explícitamente.

## Casos de uso

- **Asistencia a la programación en IDE**: el modelo puede integrarse en extensiones de editor para autocompletado, refactorización y explicación de código, aprovechando su linaje Devstral y su ventana de contexto extendida vía YaRN para manejar repositorios grandes.
- **Análisis de capturas de pantalla y diagramas**: gracias al encoder visual, puede procesar imágenes de interfaces, diagramas de arquitectura o capturas de errores y generar explicaciones o parches de código asociados.
- **Revisión de código en pipelines de CI/CD**: desplegado con KerasHub sobre backend JAX o PyTorch, puede analizar diffs y generar comentarios automáticos en pull requests, siempre que se valide su calidad real.
- **Generación de documentación técnica**: a partir de código fuente e imágenes de diagramas, puede producir documentación estructurada combinando entradas textuales y visuales.
- **Prototipado multiplataforma**: investigadores que necesiten el mismo modelo en JAX para entrenamiento y en PyTorch para inferencia pueden usar una única definición KerasHub, reduciendo la duplicación de código.
- **Extracción de información de documentos con figuras**: puede procesar páginas escaneadas o PDFs renderizados como imagen junto con texto para responder preguntas sobre su contenido.
- **Experimentación académica con modelos multimodales de 24B**: útil como base para fine-tuning en entornos con infraestructura de GPU de gama alta y necesidad de portabilidad entre backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada en bfloat16**: aproximadamente 49 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 60-80 GB para inferencia cómoda con contexto largo.
- **GPU recomendadas**: A100 80GB, H100 80GB, o configuraciones multi-GPU (2x A100 40GB con sharding). No cabe en una RTX 4090 de 24 GB sin cuantización agresiva.
- **Consumer GPU**: no es viable en GPUs de consumo sin cuantización a 4 bits (no se ofrecen pesos GGUF en este repositorio).
- **Opciones de despliegue**: KerasHub con backend JAX, TensorFlow o PyTorch. No se proporcionan pesos en formatos vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| keras/devstral_small_2_24b_instruct_2512_en | ~24B (no confirmado) | extendido vía YaRN (no confirmado) | Sí | no disponible | KerasHub |
| Devstral Small original (Mistral AI) | ~24B | no disponible | no disponible | no disponible | safetensors |
| Mistral Small 3 (Mistral AI) | ~24B | no disponible | no disponible | no disponible | safetensors |
| Qwen2.5-VL 32B | ~32B | no disponible | Sí | no disponible | safetensors |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a características estructurales conocidas o inferidas del nombre del modelo.

## Limitaciones y advertencias

- **Licencia no declarada**: no se puede confirmar si el uso comercial está permitido; es un bloqueante para producción hasta verificarlo con el autor.
- **Model card autogenerada**: no documenta datos de entrenamiento, sesgos, ni evaluación de seguridad.
- **Riesgo de alucinación**: inherente a modelos causales de este tamaño; sin benchmarks publicados no hay evidencia de mitigación.
- **Idiomas no confirmados**: el sufijo `_en` sugiere un rendimiento óptimo en inglés; el comportamiento en castellano no está validado.
- **Formato no estándar**: los pesos en KerasHub no son directamente compatibles con ecosistemas como vLLM, llama.cpp u Ollama, lo que limita las opciones de despliegue optimizado.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- **Contexto efectivo no confirmado**: aunque la configuración de RoPE sugiere extensión, no se declara la longitud máxima soportada ni se han publicado pruebas de recuperación en contexto largo.
- **Requisitos de hardware elevados**: 49 GB de pesos en bf16 excluyen su uso en GPUs de consumo sin cuantización, que no se ofrece en este repositorio.

## Enlaces

- [Hugging Face: keras/devstral_small_2_24b_instruct_2512_en](https://huggingface.co/keras/devstral_small_2_24b_instruct_2512_en)
- [Documentación de Mistral3 en KerasHub](https://keras.io/api/keras_hub/models/mistral3)
- [Keras: librería multi-backend](https://keras.io/)
- [Keras 3: multi-backend deep learning](https://keras.io/keras_3/)
- [Keras en Wikipedia](https://en.wikipedia.org/wiki/Keras)
- [Keras en Wikipedia (francés)](https://fr.wikipedia.org/wiki/Keras)
- [What is Keras? - GeeksforGeeks](https://www.geeksforgeeks.org/deep-learning/what-is-keras/)
