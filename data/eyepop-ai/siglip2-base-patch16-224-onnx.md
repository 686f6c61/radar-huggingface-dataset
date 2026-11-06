# eyepop-ai/siglip2-base-patch16-224-onnx

## Resumen

SigLIP 2 base patch16 224 ONNX es una exportación del modelo multimodal de Google SigLIP 2, publicada por eyepop-ai para su uso dentro de la capacidad `eyepop.siglip2.classify`. Se trata de un modelo de visión-lenguaje entrenado con objetivo SigLIP (Sigmoid Loss for Language-Image Pre-training), diseñado para tareas de clasificación de imágenes zero-shot y alineamiento imagen-texto. El repositorio contiene únicamente los grafos ONNX de los codificadores de texto y de visión, sin cabezas de clasificación específicas.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue en producción: los grafos almacenan los pesos en float16 pero computan en float32, lo que evita el fallo de carga que onnxruntime 1.27 presenta con los grafos float16 nativos de onnx-community en el execution provider de CPU. No hay reentrenamiento ni fine-tuning: es una conversión directa del export float32 de onnx-community con los pesos redondeados a float16.

El modelo base es `google/siglip2-base-patch16-224`, con arquitectura transformer de dos torres (visión y texto), parches de 16x16 sobre imágenes de 224x224 y embeddings de 768 dimensiones. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres (codificador de visión ViT + codificador de texto), objetivo SigLIP |
| Parámetros totales | no disponible (modelo base "base", sin cifra exacta en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (input `input_ids` con forma `[B, 64]`) |
| Tipos de cuantización | Pesos en float16 almacenados con Cast a float32; cómputo en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`text_model.onnx`, `vision_model.onnx`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SigLIP 2 de Google: un codificador de visión tipo ViT con parches de 16x16 sobre entradas de 224x224 píxeles (normalizadas a rango -1..1) y un codificador de texto independiente. Ambos producen un `pooler_output` de 768 dimensiones que se emplea para calcular similitudes imagen-texto. La entrada de texto está fijada a 64 tokens (`input_ids` int64 `[B, 64]`). El objetivo de entrenamiento es SigLIP, una variante de contraste imagen-texto con pérdida sigmoide en lugar de softmax, que permite clasificación zero-shot mediante comparación de embeddings.

Esta exportación concreta no introduce cambios arquitectónicos ni de entrenamiento: parte del export float32 de `onnx-community/siglip2-base-patch16-224-ONNX` y redondea los pesos a float16, manteniendo un Cast a float32 antes de cada operación. El resultado es un grafo que computa en float32 en cualquier execution provider con el mismo tamaño de descarga que los grafos float16 nativos. Según la model card, los embeddings pooled coinciden con los grafos float32 con una similitud coseno de al menos 0,999999 en CPU y CUDA, y OpenVINO sobre GPU Intel coincide con CPU con al menos 0,99995. No se documentan datos de entrenamiento (número de tokens, composición del dataset) ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Clasificación de imágenes zero-shot mediante comparación de embeddings imagen-texto.
- Generación de embeddings de imagen (`pooler_output` de 768 dimensiones) y de texto (`pooler_output` de 768 dimensiones).
- Alineamiento multimodal imagen-lenguaje para búsqueda y recuperación.
- Inferencia en CPU, CUDA y OpenVINO (GPU Intel) con onnxruntime.
- Entrada de texto limitada a 64 tokens por muestra.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión generativa, audio ni generación de texto libre.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación zero-shot de imágenes en producción: se comparan los embeddings de la imagen con los de un conjunto de etiquetas textuales y se elige la de mayor similitud, sin necesidad de reentrenar por cada nueva taxonomía.
- Moderación de contenido visual: clasificación de imágenes contra categorías textuales definidas por política, aprovechando el cómputo en float32 para estabilidad numérica en CPU.
- Búsqueda y recuperación multimodal: indexación de embeddings de imagen y texto para motores de búsqueda que recuperan imágenes a partir de consultas en lenguaje natural.
- Etiquetado automático de catálogos de producto: asignación de categorías a imágenes de e-commerce mediante prompts textuales, con la ventaja de que el modelo cabe en infraestructura CPU.
- Filtrado y deduplicación de datasets visuales: agrupación de imágenes por similitud de embeddings para limpiar corpus de entrenamiento.
- Despliegue en entornos sin GPU: al computar en float32 y cargar correctamente en onnxruntime 1.27 con el execution provider de CPU, es adecuado para servicios en contenedores sin acelerador dedicado.
- Integración en pipelines de EyePop: uso directo como capacidad `eyepop.siglip2.classify` dentro de la plataforma del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 2,3 GB (pesos float16 almacenados, cómputo float32).
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo, el modelo completo ronda los 2,3 GB en memoria, aunque el consumo real en ejecución depende del batch y del execution provider.
- GPU recomendadas: no especificadas en la información; el modelo está validado en CPU, CUDA y OpenVINO sobre GPU Intel.
- Cabe en GPU consumer: sí, por tamaño (2,3 GB) es compatible con GPUs consumer con al menos 4 GB de memoria, aunque no se documenta una lista concreta.
- Opciones de despliegue: onnxruntime (CPU, CUDA, OpenVINO); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto texto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eyepop-ai/siglip2-base-patch16-224-onnx | no disponible (base) | 64 tokens | ONNX (float16 almacenado, cómputo float32) | Apache 2.0 | Hugging Face |
| google/siglip2-base-patch16-224 | no disponible (base) | no disponible | safetensors (modelo original) | Apache 2.0 | Hugging Face |
| onnx-community/siglip2-base-patch16-224-ONNX | no disponible (base) | 64 tokens | ONNX (float32 y float16) | Apache 2.0 | Hugging Face |

La diferencia principal frente al export de onnx-community es la estrategia de precisión: los grafos float16 nativos fallan al cargar en onnxruntime 1.27 con el execution provider de CPU en el nivel de optimización por defecto, mientras que esta versión almacena float16 y computa en float32, manteniendo el mismo tamaño de descarga y una similitud coseno de al menos 0,999999 con los grafos float32.

## Limitaciones y advertencias

- Solo contiene los codificadores de texto y visión; no incluye cabezas de clasificación, por lo que el usuario debe implementar la lógica de comparación de embeddings.
- La entrada de texto está fijada a 64 tokens, lo que limita prompts y etiquetas largas.
- No se documentan sesgos conocidos ni evaluaciones de robustez en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la clasificación zero-shot puede asignar etiquetas incorrectas ante imágenes fuera de distribución o prompts ambiguos.
- Idiomas soportados no documentados; el tokenizador proviene de onnx-community sin cambios.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribución a Google, onnx-community y eyepop-ai.
- El modelo está validado contra onnxruntime 1.27; versiones distintas pueden requerir verificación de compatibilidad.
- No hay métricas de latencia ni throughput publicadas para dimensionar producción.

## Enlaces

- Hugging Face: https://huggingface.co/eyepop-ai/siglip2-base-patch16-224-onnx
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Export ONNX original: https://huggingface.co/onnx-community/siglip2-base-patch16-224-ONNX
