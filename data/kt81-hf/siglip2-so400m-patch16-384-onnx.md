# kt81-hf/siglip2-so400m-patch16-384-onnx

## Resumen

SigLIP 2 SO400M patch16-384 ONNX es una conversión al formato ONNX del modelo SigLIP 2, un codificador visión-lenguaje desarrollado originalmente por Google (equipo de investigación de Google DeepMind) y publicado en 2025 como sucesor de SigLIP. Este repositorio concreto, alojado por el usuario `kt81-hf`, empaqueta los pesos del modelo SigLIP 2 en su variante "shape-optimized" de 400 millones de parámetros, con parches de 16x16 píxeles y resolución de entrada de 384x384, en formato ONNX para su despliegue en entornos de inferencia sin dependencia de PyTorch.

El modelo resuelve el problema de alineamiento entre imagen y texto mediante una función de pérdida sigmoidea (sigmoide loss) en lugar de la softmax contrastiva usada en CLIP, lo que permite entrenar con pares imagen-texto ruidosos y mejora la calidad de los embeddings. SigLIP 2 añade capacidades de localización, descripción densa y comprensión multimodal, y es la base habitual de pipelines de búsqueda visual, clasificación zero-shot y sistemas de visión-lenguaje (VLM) que lo usan como torre visual.

La relevancia de esta ficha radica en que se trata de una conversión comunitaria a ONNX, con licencia Apache 2.0, lo que facilita su integración en runtimes como ONNX Runtime, TensorRT o navegadores vía WebGPU/WebNN. No obstante, la información publicada en el repositorio es mínima (solo la licencia), por lo que muchos datos técnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT) con encoder de texto, alineamiento SigLIP (pérdida sigmoidea) |
| Parametros totales | ~400 M (variante SO400M, según nomenclatura del nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; el encoder de texto SigLIP 2 admite secuencias de hasta 64 tokens según la familia, no confirmado en esta conversión) |
| Tipos de cuantizacion | no disponible (formato ONNX; se puede cuantizar a int8/fp16 con herramientas ONNX Runtime, no confirmado por el autor) |
| Idiomas soportados | no disponible (el encoder de texto original está entrenado principalmente en inglés; no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

SigLIP 2 sigue la arquitectura de la familia SigLIP: un codificador de imágenes tipo Vision Transformer (ViT) y un codificador de texto transformer, entrenados conjuntamente con una pérdida sigmoidea sobre pares imagen-texto. La variante SO400M ("shape-optimized", 400 M de parámetros) usa parches de 16x16 píxeles y resolución de 384x384, lo que produce 576 tokens visuales por imagen (24x24 parches). El entrenamiento original de SigLIP 2 combina objetivos de alineamiento contrastivo, captioning, localización y descripción densa, e incorpora datos multilingües y de mayor calidad que la primera versión.

Esta conversión concreta a ONNX no documenta el proceso de exportación, la opset utilizada, ni si se ha validado numéricamente frente al modelo original. Tampoco se especifica si incluye solo la torre visual, solo la torre de texto o ambas, ni si se ha aplicado alguna optimización (fusión de operadores, cuantización). Toda esta información se considera no disponible.

## Capacidades

- Extracción de embeddings de imagen y de texto para búsqueda y recuperación multimodal.
- Clasificación zero-shot de imágenes mediante prompts de texto.
- Similitud imagen-texto para filtrado, moderación y deduplicación.
- Base para pipelines de visión-lenguaje (torre visual de VLM).
- Localización y descripción densa (capacidades heredadas de SigLIP 2, no verificadas en esta conversión ONNX).
- Soporte de tool calling: no disponible (no es un modelo generativo de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles / no confirmadas.

## Casos de uso

- Búsqueda visual en catálogos de producto: indexar embeddings de imágenes con la torre visual y consultar con texto; el formato ONNX permite desplegar en servidores sin GPU dedicada mediante ONNX Runtime.
- Moderación de contenido: clasificación zero-shot de imágenes frente a categorías definidas por prompts, con latencia baja al ejecutarse en CPU o GPU consumer.
- Deduplicación y clustering de imágenes: calcular embeddings de 384x384 y agrupar por similitud coseno en pipelines de datos.
- Filtrado de datasets de entrenamiento: puntuar pares imagen-texto por alineamiento para descartar muestras ruidosas antes de entrenar otros modelos.
- Torre visual de un VLM: integrar el encoder ONNX como extractor de características congelado en un sistema de captioning o VQA.
- Despliegue en navegador o edge: al estar en ONNX, puede ejecutarse con WebGPU/WebNN u ONNX Runtime Mobile para búsqueda visual local sin enviar imágenes a la nube.
- Análisis de imágenes médicas o industriales: embeddings para recuperación de casos similares, siempre con validación específica del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~1,6 GB en fp32 para los ~400 M de parámetros; ~0,8 GB en fp16; ~0,4 GB en int8 (estimación teórica, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; RTX 3060/4060, RTX 4090, A100 o H100 para lotes grandes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO, WebGPU/WebNN en navegador; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SigLIP 2 SO400M patch16-384 (este) | ~400 M | 384x384, parches 16 | ONNX | Apache 2.0 | Hugging Face (conversión comunitaria) |
| SigLIP 2 SO400M original (Google) | ~400 M | 384x384, parches 16 | safetensors / PyTorch | Apache 2.0 (según familia) | Hugging Face (google/siglip2-so400m-patch16-384) |
| CLIP ViT-L/14 | ~428 M | 224x224, parches 14 | safetensors / PyTorch | MIT (OpenAI) | Hugging Face |
| SigLIP base (v1) | ~400 M | 384x384 | safetensors / PyTorch | Apache 2.0 | Hugging Face |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Repositorio sin model card técnica: no se documenta el proceso de exportación a ONNX, la opset, ni la validación numérica frente al modelo original.
- Sin métricas de rendimiento publicadas: no hay evidencia de que la conversión preserve la calidad del SigLIP 2 original.
- Sesgos: heredados del dataset de entrenamiento original de SigLIP 2 (no documentados en este repositorio).
- Riesgo de alucinación: bajo en tareas de embedding, pero los prompts zero-shot pueden producir clasificaciones erróneas en dominios alejados del entrenamiento.
- Limitaciones de idioma: el encoder de texto original está orientado al inglés; el soporte multilingüe no está confirmado en esta conversión.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin descargas ni likes: repositorio sin validación comunitaria; se recomienda verificar los pesos antes de usarlos en producción.
- Fecha de creación futura (2026-11-13) en los metadatos: posible inconsistencia que conviene contrastar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kt81-hf/siglip2-so400m-patch16-384-onnx
- Modelo original SigLIP 2 (Google): https://huggingface.co/google/siglip2-so400m-patch16-384
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Paper SigLIP original: https://arxiv.org/abs/2303.15343
- ONNX Runtime: https://onnxruntime.ai/
