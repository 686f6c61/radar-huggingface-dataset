# ifire/Qwen3-VL-Embedding-2B-GGUF

## Resumen

El repositorio `ifire/Qwen3-VL-Embedding-2B-GGUF` contiene una conversión a formato GGUF del modelo de embeddings multimodales `Qwen/Qwen3-VL-Embedding-2B`, desarrollado por el equipo de Qwen (Alibaba). El modelo base está diseñado para tareas de recuperación de información y similitud semántica combinando texto e imágenes, y esta conversión permite ejecutarlo con `llama.cpp` en entornos con CPU, GPU NVIDIA, Apple Silicon, entre otros. La relevancia de esta conversión radica en que facilita el despliegue local y la integración en aplicaciones de producción que usan el ecosistema GGUF (Ollama, llama-server, etc.) sin depender de PyTorch.

La arquitectura del modelo se basa en el modelo fundacional Qwen3-VL, con aproximadamente 1.720 millones de parámetros (2B nominales). La conversión incluye tanto el modelo de lenguaje como la torre de visión (`mmproj`), y produce embeddings de 2048 dimensiones normalizados L2. Según la model card, la versión GGUF ofrece una latencia 1.71 veces inferior a la referencia PyTorch en un Apple M2 Pro, manteniendo una similitud coseno de 0.999997 en el texto. No se indica la longitud de contexto en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (multimodal, transformer con encoder de visión) |
| Parametros totales | 1.720.574.976 (1.72 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo f16 (GGUF) en este repositorio; otros repos pueden ofrecer Q8_0, Q4_K_M |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivos `Qwen3-VL-Embedding-2B-f16.gguf` y `mmproj-Qwen3-VL-Embedding-2B-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-Embedding-2B es un modelo de embeddings multimodales construido sobre la arquitectura Qwen3-VL, que combina un transformer de lenguaje con un encoder de visión. Está diseñado para producir representaciones vectoriales de texto, imágenes, capturas de pantalla y vídeos, con un pooling de último token (configurado en `pooling_mode_lasttoken`). No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset en la documentación de la conversión.

La conversión a GGUF fue realizada con `convert_hf_to_gguf.py` de llama.cpp, incluyendo la opción `--sentence-transformers-dense-modules` para preservar las capas densas posteriores al pooling. La torre de visión (`mmproj`) se incluye completa, con los 18 tensores de `deepstack` correspondientes a los índices visuales `[5, 11, 17]`. La verificación del autor indica que la representación de texto alcanza una similitud cosines de 0.999997 respecto a PyTorch, mientras que la de imágenes se sitúa en 0.967420 de media, atribuida a diferencias de preprocesamiento (resize e interpolación) entre `Qwen3VLImageProcessor` y el pipeline de llama.cpp.

## Capacidades

- Generación de embeddings de texto e imágenes en un espacio de 2048 dimensiones, ya normalizados L2.
- Similitud semántica y búsqueda de recuperación multimodal (texto-texto, imagen-imagen, texto-imagen).
- Compatible con el protocolo de embeddings de OpenAI (`/v1/embeddings`) en `llama-server`.
- Soporte para procesamiento de imágenes a través de la torre de visión incluida (`mmproj`).
- Ejecución eficiente en CPU y GPU mediante llama.cpp, con aceleración Metal en Apple Silicon.
- Integración con el ecosistema GGUF: Ollama, llama.cpp, TGI (si se configura), entre otros.

## Casos de uso

- **Búsqueda semántica multimodal en catálogos de productos**: permite indexar imágenes y descripciones de productos y recuperar resultados relevantes combinando consultas de texto con imágenes de referencia.
- **Sistema de recomendación de contenido visual**: comparando embeddings de imágenes de artículos o vídeos para sugerir elementos similares en plataformas de medios.
- **Deduplicación y detección de duplicados en bases de datos**: uso de embeddings para encontrar imágenes o documentos casi idénticos mediante la distancia cosines.
- **Análisis de capturas de pantalla en automatización**: embeddings de capturas de pantalla para clasificar o comparar interfaces de usuario en pruebas de software.
- **Chatbot de atención al cliente con búsqueda en documentos técnicos**: indexar manuales con texto e imágenes y recuperar la sección más relevante a partir de consultas multimodales.
- **Filtrado y moderación de contenido visual**: clasificar imágenes por similitud con ejemplos de referencia para detectar contenido no deseado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo de embeddings en la información disponible. Sin embargo, la model card incluye una verificación de rendimiento propia comparando el GGUF con la referencia PyTorch en un Apple M2 Pro (32 GB, macOS) con diez textos cortos:

| Metric | GGUF (llama.cpp Metal f16) | PyTorch float16 (MPS) |
|---|---|---|
| Cosine vs torch | 0.999997 media, 0.999995 mínima | 1.0 por definición |
| Latencia p50 | 29.9 ms | 51.2 ms |

Para imágenes, la similitud cosines media es de 0.967420 (mínima 0.951388), con una correlación positiva de 0.730 entre el tamaño de la imagen y el cosines, lo que sugiere una diferencia de preprocesamiento.

## Requisitos de hardware

- **VRAM estimada**: el modelo f16 (3.21 GB) más la torre de visión (0.76 GB) suman ~4 GB; con overhead de ejecución se recomienda al menos 5-6 GB de VRAM para GPU.
- **GPU compatibles**: cualquier GPU con soporte CUDA (NVIDIA), Metal (Apple Silicon), o SYCL (Intel). Se puede ejecutar también en CPU pura.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4090, A100, etc., aunque el modelo es ligero y funciona en tarjetas de gama media.
- **Opciones de despliegue**: `llama-server` de llama.cpp, integración con Ollama (si se copia el GGUF), o cualquier framework que soporte GGUF.
- **Latencia**: en la verificación, 29.9 ms p50 en Apple M2 Pro (Metal) para texto. La latencia real depende del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de embeddings multimodales en la información proporcionada. Se podría comparar con la versión PyTorch original, pero no es un modelo distinto. No hay información sobre alternativas como `CLIP` o `SigLIP` en el contexto de esta conversión.

## Limitaciones y advertencias

- **Imagenes no alcanzan paridad con PyTorch**: la similitud cosines es de 0.967 en lugar de 0.9999, lo que puede afectar a aplicaciones de recuperación de imágenes críticas.
- **Preprocesamiento diferente**: el pipeline de imágenes de llama.cpp (clip) difiere del `Qwen3VLImageProcessor`, y la diferencia se agrava con imágenes pequeñas.
- **Footguns de la API**: usar `multimodal_data` en lugar de `image_data` para embeddings; `image_data` se ignora silenciosamente y devuelve vectores solo de texto. El formato `image_url` de OpenAI devuelve HTTP 500 (hasta el PR #18665).
- **Pooling obligatorio**: es necesario usar `--pooling last`; el pooling medio produce vectores incorrectos sin aviso.
- **Idiomas**: la etiqueta indica solo inglés (`en`), aunque el modelo base podría soportar más idiomas; no se confirma.
- **Licencia**: Apache-2.0 permite uso comercial, pero los pesos son de Qwen; el repositorio solo aporta la conversión.
- **Sin datos de contexto**: no se especifica la longitud de contexto soportada, por lo que hay que probar en cada caso.

## Enlaces

- Repositorio HuggingFace: [ifire/Qwen3-VL-Embedding-2B-GGUF](https://huggingface.co/ifire/Qwen3-VL-Embedding-2B-GGUF)
- Modelo base en HuggingFace: [Qwen/Qwen3-VL-Embedding-2B](https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B)
- Repositorio oficial de Qwen3-VL-Embedding: [GitHub - QwenLM/Qwen3-VL-Embedding](https://github.com/QwenLM/Qwen3-VL-Embedding)
- Repositorio de Qwen3-VL: [GitHub - QwenLM/Qwen3-VL](https://github.com/QwenLM/Qwen3-VL)
- PR #18665 en llama.cpp: [https://github.com/ggml-org/llama.cpp/pull/18665](https://github.com/ggml-org/llama.cpp/pull/18665)
