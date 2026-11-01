# myllmbox/bge-m3-GGUF

## Resumen

bge-m3-GGUF es una conversión a formato GGUF del modelo de embeddings densos BAAI/bge-m3, publicada por el usuario myllmbox. El modelo original lo desarrolla el Beijing Academy of Artificial Intelligence (BAAI) y se ha consolidado como una referencia en recuperación de información multilingüe. Esta versión GGUF permite ejecutar el modelo con llama.cpp, lo que facilita su despliegue en entornos sin PyTorch y en hardware de consumo.

El modelo genera embeddings densos de 1024 dimensiones con una ventana de contexto de 8192 tokens y cobertura de más de 100 idiomas. La conversión se ha realizado a precisión F16 mediante un cast directo desde el checkpoint FP32 original, sin cuantización adicional, empleando la herramienta `convert_hf_to_gguf.py` de llama.cpp en su versión b11703.

Es relevante porque reduce la fricción de despliegue de un modelo de embeddings de calidad probada: un único fichero de 1,16 GB y un servidor llama.cpp con endpoint compatible con la API de OpenAI (`/v1/embeddings`) permiten montar un servicio de búsqueda semántica o RAG sin dependencias de CUDA ni de la pila de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-like, modelo base BAAI/bge-m3) |
| Parametros totales | 566.703.104 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | F16 (cast desde FP32, sin cuantizacion adicional) |
| Idiomas soportados | 100+ idiomas (segun model card del autor) |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero `bge-m3-f16.gguf`, 1,16 GB) |
| Dimension de embedding | 1024 |
| Pooling | CLS |
| Cabeceras incluidas | Solo densa (sin sparse ni ColBERT) |

## Arquitectura y entrenamiento

El modelo subyacente es BAAI/bge-m3, un encoder transformer derivado de la familia XLM-RoBERTa con 566 millones de parametros. Está entrenado para producir representaciones densas de frases y pasajes, con soporte nativo de recuperación multilingüe y de contexto largo (hasta 8192 tokens). El modelo original incorpora tres tipos de salida (densa, sparse y multi-vector estilo ColBERT); esta conversión GGUF incluye únicamente la cabeza densa con pooling CLS.

La conversión no implica reentrenamiento: se trata de un cast de FP32 a F16 con la herramienta oficial de llama.cpp (b11703). El autor reporta una fidelidad muy alta respecto al modelo original: sobre 18 textos de prueba (consultas cortas, frases y páginas de ~600 tokens en inglés, lituano, alemán y francés), el coseno mínimo entre vectores es 0,99968 en CUDA (GB10) y 0,99954 en Vulkan (Radeon 780M), con vecinos más cercanos idénticos en ambos backends. No se dispone de detalles sobre el dataset de entrenamiento original ni sobre las fases de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para textos y consultas.
- Recuperación semántica multilingüe en más de 100 idiomas.
- Procesamiento de documentos largos gracias a la ventana de 8192 tokens.
- Búsqueda híbrida conceptual (el modelo original soporta dense, sparse y ColBERT; esta versión solo densa).
- Servicio compatible con la API de OpenAI mediante `llama-server` (`/v1/embeddings`).
- Ejecución en CPU, CUDA (NVIDIA) y Vulkan (AMD) a través de llama.cpp.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un modelo de extracción de características.

## Casos de uso

- Búsqueda semántica en bases documentales: indexar pasajes de hasta 8192 tokens y recuperar por similitud coseno; adecuado por su contexto largo y su calidad multilingüe.
- RAG (retrieval-augmented generation): generar embeddings de chunks de documentación para alimentar un pipeline de recuperación antes de la generación con un LLM.
- Búsqueda multilingüe transfronteriza: consultar en castellano un corpus en inglés, alemán o lituano sin traducción intermedia, gracias a la cobertura de 100+ idiomas.
- Deduplicación y clustering de textos: agrupar documentos o tickets similares calculando distancias entre embeddings de 1024 dimensiones.
- Clasificación zero-shot por similitud: comparar embeddings de textos contra descripciones de categorías para etiquetado sin entrenamiento adicional.
- Despliegue en hardware de consumo: servir un endpoint de embeddings en una RTX 50xx o en una iGPU Radeon mediante las imágenes Docker publicadas, sin necesidad de PyTorch.
- Filtrado previo en pipelines de moderación o recomendación: calcular similitud entre contenidos y perfiles para ordenar candidatos antes de etapas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, etc.) en la información disponible. El autor únicamente reporta métricas de fidelidad respecto al modelo original:

| Backend | Coseno mínimo | Coseno medio | Vecinos más cercanos |
|---|---|---|---|
| CUDA, GB10 | 0,99968 | 0,99994 | idénticos |
| Vulkan, Radeon 780M | 0,99954 | 0,99989 | idénticos |
| CUDA vs Vulkan | 0,99962 | 0,99994 | idénticos |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB para los pesos en F16; con overhead de contexto de 8192 tokens, el consumo total se mantiene por debajo de 2-3 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 50xx según el autor, además de A100/H100 por compatibilidad general de llama.cpp) o Vulkan (Radeon iGPU 780M verificada).
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-3 GB de VRAM; también funciona en CPU.
- Opciones de despliegue: `llama-server` de llama.cpp (b11703), imágenes Docker `myllmbox/bge-m3-llamacpp:v1-nvidia` (CUDA, arm64 y amd64) y `myllmbox/bge-m3-llamacpp:v1-amd` (Vulkan, amd64).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Formato |
|---|---|---|---|---|---|
| myllmbox/bge-m3-GGUF | 566 M | 8192 | 1024 | MIT | GGUF |
| BAAI/bge-m3 (original) | 566 M | 8192 | 1024 | MIT | safetensors (FP32) |
| BAAI/bge-large-en-v1.5 | ~335 M | 512 | 1024 | MIT | safetensors |
| intfloat/multilingual-e5-large | ~560 M | 512 | 1024 | MIT | safetensors |

La ventaja principal frente al original es la portabilidad (llama.cpp, sin PyTorch) y el menor peso en disco (1,16 GB frente al checkpoint FP32). Frente a alternativas como bge-large-en-v1.5 o multilingual-e5-large, ofrece un contexto cuatro veces mayor y cobertura multilingüe más amplia, aunque esta conversión pierde las salidas sparse y ColBERT del bge-m3 original.

## Limitaciones y advertencias

- Solo incluye la cabeza densa con pooling CLS; no reproduce las capacidades sparse ni ColBERT del modelo original.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento agéntico.
- La fidelidad reportada se basa en una muestra reducida de 18 textos; no hay evaluación exhaustiva sobre MTEB u otros benchmarks públicos en esta conversión.
- Riesgo de sesgos heredados del corpus de entrenamiento original de BAAI/bge-m3, no evaluado en esta ficha.
- La ventana de 8192 tokens debe configurarse explícitamente en llama.cpp (`-c 8192 -b 8192 -ub 8192`); con valores menores se truncan documentos largos.
- Licencia MIT, lo que permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia y condiciones del modelo base BAAI/bge-m3.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- HuggingFace (esta conversión): https://huggingface.co/myllmbox/bge-m3-GGUF
- Modelo base: https://huggingface.co/BAAI/bge-m3
- llama.cpp: https://github.com/ggml-org/llama.cpp
