# lucid-dl/clip-vit-base-16

## Resumen

`lucid-dl/clip-vit-base-16` es una conversión al formato nativo de la librería [Lucid](https://github.com/ChanLumerico/lucid) del modelo CLIP ViT-B/16 original de OpenAI, disponible en [openai/clip-vit-base-patch16](https://huggingface.co/openai/clip-vit-base-patch16). CLIP (Contrastive Language-Image Pre-training) es un modelo multimodal que aprende representaciones conjuntas de imágenes y texto mediante aprendizaje contrastivo, entrenado sobre 400 millones de pares imagen-texto del dataset WIT-400M. Este port no modifica los pesos originales, sino que los convierte a safetensors nativos de Lucid, garantizando paridad numérica con el modelo de referencia. Su relevancia radica en ofrecer una implementación ligera y reproducible del modelo para investigación y desarrollo en tareas de visión por computador y procesamiento de lenguaje natural multimodal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16) con codificador de texto Transformer (CLIP) |
| Parametros totales | 149,6M (aproximadamente) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 77 tokens (texto) / 224x224 píxeles (imagen) |
| Tipos de cuantizacion | no disponible (solo safetensors FP32/FP16) |
| Idiomas soportados | Inglés (entrenado con datos de WIT-400M) |
| Licencia | MIT |
| Formato de pesos | safetensors (nativo Lucid) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura CLIP de OpenAI, compuesta por dos encoders: un vision transformer (ViT-B/16) que procesa imágenes de 224x224 píxeles en parches de 16x16, y un transformer de texto con 12 capas y 512 unidades ocultas. Ambos encoders proyectan sus representaciones a un espacio común de 512 dimensiones, donde se optimiza la similitud coseno entre pares imagen-texto. El entrenamiento se realizó sobre 400M de pares (subset WIT-400M) con pérdida contrastiva, sin capas de clasificación adicionales. La conversión a Lucid se realizó mediante la herramienta `tools.convert_weights` y se verificó la paridad numérica con el modelo original de OpenAI. No se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Generación de representaciones multimodales: obtiene vectores de características para imágenes y textos en un espacio común.
- Zero-shot classification: clasifica imágenes en categorías arbitrarias sin entrenamiento adicional, comparando similitud entre el embedding de la imagen y los embeddings de los textos candidatos.
- Búsqueda de imágenes por texto: recupera las imágenes más relevantes para una consulta textual.
- Búsqueda de texto por imagen: encuentra descripciones textuales correspondientes a una imagen.
- Feature extraction: extrae características de alto nivel para tareas downstream (clasificación, clustering, etc.).
- Soporte de tool calling: no aplicable (modelo de embedding, no generativo).
- Capacidades multilingües: limitado a inglés, aunque puede funcionar con otras lenguas en menor medida.

## Casos de uso

- Clasificación de imágenes zero-shot: usar el modelo para clasificar imágenes en categorías definidas por texto sin entrenamiento previo, por ejemplo en sistemas de moderación de contenido.
- Búsqueda multimodal en bases de datos: indexar imágenes y textos en un espacio vectorial y usar CLIP para consultas semánticas, por ejemplo en un buscador de fotos.
- Generación de descripciones de imágenes: combinar con un modelo generativo para producir texto a partir de la representación visual.
- Feature extraction para transfer learning: usar los embeddings como entrada para un clasificador lineal o MLP en tareas específicas de visión.
- Sistema de recomendación visual: recomendar productos o contenido basado en similitud semántica entre imágenes y descripciones.
- Evaluación de alineación texto-imagen: medir la coherencia entre un texto y una imagen, útil en validación de datasets o detección de errores de etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión específica. El modelo original CLIP ViT-B/16 reporta en el paper (Radford et al., 2021) los siguientes resultados en zero-shot (para referencia, no son datos de esta versión):

| Dataset | Top-1 accuracy (zero-shot) |
|---|---|
| ImageNet | 68,3 % |
| CIFAR-100 | 68,3 % |
| Birdsnap | 53,0 % |
| SUN397 | 63,0 % |

Estos valores son del modelo original de OpenAI, no de esta conversión.

## Requisitos de hardware

- VRAM estimada: ~2 GB para inferencia en FP16 con batch 1 (modelo de 149M params).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 2060, GTX 1080 Ti, etc.). Para producción con alto throughput, se recomienda A100 o H100.
- Compatible con consumer GPUs: sí, cabe en GPUs de gama media (RTX 3060, 4060, etc.) en FP16.
- Opciones de despliegue: se puede usar directamente con la librería Lucid, o exportar a ONNX para entornos de inferencia estándar (vLLM, llama.cpp, Ollama no son compatibles con modelos de embedding; se recomienda usar HuggingFace Transformers o el propio Lucid).
- Latencia: típicamente <10 ms por imagen en GPU moderna, aunque depende del batch y la GPU.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lucid-dl/clip-vit-base-16 | 149,7M | 77 tokens | MIT | Hugging Face |
| openai/clip-vit-base-patch16 | 149,7M | 77 tokens | MIT | Hugging Face |
| openai/clip-vit-large-patch14 | 428M | 77 tokens | MIT | Hugging Face |
| laion/CLIP-ViT-B-32-laion2B-s34B-b79K | 151M | 77 tokens | MIT | Hugging Face |

La principal diferencia es el formato de pesos y la integración con Lucid; el rendimiento es idéntico al modelo original de OpenAI.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado con datos de internet (WIT-400M), por lo que puede reflejar sesgos de género, raza o cultura presentes en esos datos.
- Riesgo de alucinación: no aplica (no es generativo), pero la clasificación zero-shot puede ser incorrecta en categorías ambiguas o fuera de distribución.
- Limitaciones de contexto: la ventana de texto es de 77 tokens, insuficiente para descripciones largas.
- Limitaciones de idioma: optimizado para inglés; otros idiomas pueden tener rendimiento degradado.
- Restricciones de licencia: licencia MIT permite uso comercial y modificación sin restricciones.
- Caveat de producción: al ser una conversión, es recomendable verificar la paridad numérica con el modelo original antes de desplegarlo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/lucid-dl/clip-vit-base-16
- Modelo original de OpenAI: https://huggingface.co/openai/clip-vit-base-patch16
- Paper CLIP: https://arxiv.org/abs/2103.00020
- Repositorio Lucid: https://github.com/ChanLumerico/lucid
- Model card de OpenAI: https://github.com/openai/CLIP/blob/main/model-card.md
- Guía de optimización para AMD NPU: https://github.com/amd/RyzenAI-SW/tree/main/WinML/Transformers/clip-vit-base-patch16
