# kwondw/reranker-Qwen3.5-0.8B-doodles-any-to-any

## Resumen

El modelo `kwondw/reranker-Qwen3.5-0.8B-doodles-any-to-any` es un cross-encoder de reranking afinado a partir de `Qwen/Qwen3.5-0.8B` mediante la librería sentence-transformers. Está especializado en puntuar la relevancia entre pares de entradas heterogéneas —texto, imagen, vídeo y mensajes estructurados— para tareas de búsqueda semántica y reranking. El caso de uso principal es la recuperación de imágenes a partir de descripciones textuales y viceversa, empleando el dataset de capturas manuales de doodles `julianmoraes/doodles-captions-manual`.

El modelo se entrenó con 9000 muestras utilizando BinaryCrossEntropyLoss, y su arquitectura interna combina un transformer condicional de tipo Qwen3.5 con una cabeza de puntuación logit que compara los tokens de verdadero y falso. Aunque su tamaño es reducido (0.8B parámetros), soporta una ventana de contexto de hasta 262 144 tokens. El repositorio no declara licencia ni idiomas soportados de forma explícita.

La relevancia de este modelo reside en su enfoque "any-to-any": no se limita a texto, sino que acepta entradas multimodales, lo que lo hace interesante para pipelines de búsqueda que combinan distintos tipos de contenido. Sin embargo, al ser un modelo reciente con cero descargas y sin licencia declarada, su uso en producción requiere verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en Qwen3.5ForConditionalGeneration (Qwen/Qwen3.5-0.8B) |
| Parametros totales | 0.8B (aproximadamente, derivado del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (a traves de sentence-transformers) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Qwen3.5ForConditionalGeneration, un transformer condicional multimodal que acepta texto, imagen, vídeo y mensajes estructurados. La cabeza de puntuación es un módulo `LogitScore` que compara los logits correspondientes a los tokens de verdadero (`true_token_id: 16`) y falso (`false_token_id: 15`) para producir una puntuación de relevancia entre 0 y 1. Esta configuración permite que el modelo procese pares de entradas de distinta modalidad y devuelva una puntuación de similitud.

El entrenamiento se realizó sobre el dataset `julianmoraes/doodles-captions-manual`, que contiene capturas manuales de doodles en dos direcciones: image_to_text y text_to_image. Se utilizó la función de pérdida BinaryCrossEntropyLoss con 9000 muestras. El entrenamiento se llevó a cabo con la librería sentence-transformers y el proceso se generó mediante `generated_from_trainer`. No se mencionan técnicas adicionales como RLHF o DPO en la información disponible.

## Capacidades

- Reranking de pares de entradas heterogéneas: puntúa la relevancia entre texto e imagen, vídeo o mensajes estructurados.
- Búsqueda semántica bidireccional: puede evaluar tanto consultas de imagen a texto como de texto a imagen.
- Soporte multimodal: acepta entradas de tipo texto, imagen, vídeo y mensaje estructurado según la configuración de modalidad del transformer.
- Generación de puntuaciones de relevancia normalizadas entre 0 y 1, adecuadas para umbrales de filtrado.
- Compatible con la API de sentence-transformers `CrossEncoder`, lo que facilita su integración en pipelines existentes.

## Casos de uso

- Recuperación de imágenes por descripción textual: el modelo puede puntuar la relevancia entre una consulta en texto y un conjunto de imágenes candidatas, permitiendo ordenar los resultados de un buscador visual.
- Búsqueda inversa de texto a imagen: dado un doodle o ilustración, el modelo puede identificar qué descripciones textuales le corresponden mejor, útil para catalogar archivos visuales.
- Filtrado de resultados en motores de búsqueda multimodales: integrar el cross-encoder como etapa de reranking tras una primera recuperación con un modelo bi-encoder, mejorando la precisión de los resultados finales.
- Sistemas de recomendación de contenido visual: puntuar la afinidad entre perfiles de usuario descritos en texto y piezas de contenido gráfico o audiovisual.
- Moderación y organización de bibliotecas de assets: clasificar automáticamente imágenes o vídeos según su descripción textual más probable, facilitando la gestión de grandes repositorios.
- Evaluación de coherencia imagen-texto: puntuar pares generados por modelos de texto a imagen para detectar descripciones incorrectas o alucinaciones en la generación.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card, evaluados con `CrossEncoderRerankingEvaluator` con `at_k=10`:

| Metrica | doodles-image-to-text-eval | doodles-text-to-image-eval |
|---|---|---|
| MAP | 0.9825 | 0.7550 |
| MRR@10 | 0.9825 | 0.7550 |
| NDCG@10 | 0.9869 | 0.8167 |

Estos resultados indican un rendimiento muy alto en la dirección imagen-a-texto y notablemente inferior en la dirección texto-a-imagen. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 0.8B parámetros en precisión fp16, se estima un consumo de aproximadamente 2-3 GB de VRAM, aunque el procesamiento de imágenes puede incrementar el uso de memoria.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia básica. Se recomienda una RTX 3060 o superior para mayor comodidad.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo como la RTX 3060, RTX 4070 o similares.
- Opciones de despliegue: al usar sentence-transformers, puede servirse con la librería directamente, o mediante servidores de inferencia compatibles con esta API. No se menciona soporte explícito para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Al ser un cross-encoder, la latencia es proporcional al número de pares a puntuar, ya que cada par requiere una pasada completa por el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| kwondw/reranker-Qwen3.5-0.8B-doodles-any-to-any | 0.8B | 262 144 | Cross-encoder multimodal any-to-any | no disponible |
| tomaarsen/reranker-Qwen3.5-0.8B-doodles-image-text-to-text | 0.8B | 262 144 | Cross-encoder imagen-texto | no disponible |
| Qwen3-Reranker (serie oficial) | 0.6B, 4B, 8B | no disponible | Reranker denso para texto | no disponible |

El modelo de kwondw se distingue de los de tomaarsen por su capacidad "any-to-any" (acepta más modalidades), mientras que la serie oficial Qwen3-Reranker está orientada a texto puro. No hay datos comparativos de rendimiento entre estas opciones en la información disponible.

## Limitaciones y advertencias

- No se declara licencia, lo que impide conocer las restricciones de uso comercial y redistribución.
- Los idiomas soportados no están especificados; el entrenamiento se realizó presumiblemente sobre capturas en inglés, por lo que el rendimiento en otros idiomas es incierto.
- El modelo está especializado en doodles y capturas de ese dataset concreto; su rendimiento en otros dominios visuales o textuales puede degradarse significativamente.
- Riesgo de alucinación en las puntuaciones: al ser un cross-encoder, las puntuaciones no son probabilidades calibradas y pueden variar fuera del rango esperado para entradas fuera de distribución.
- La ventana de contexto de 262 144 tokens es teórica; en la práctica, el procesamiento de imágenes consume una parte significativa de ese presupuesto.
- El modelo tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad.
- Los benchmarks declarados no están verificados y solo cubren dos conjuntos de evaluación muy específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kwondw/reranker-Qwen3.5-0.8B-doodles-any-to-any
- Dataset de entrenamiento: https://huggingface.co/datasets/julianmoraes/doodles-captions-manual
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Documentación de sentence-transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de sentence-transformers: https://github.com/huggingface/sentence-transformers
- Modelos relacionados de tomaarsen: https://huggingface.co/tomaarsen/reranker-Qwen3.5-0.8B-doodles-image-text-to-text
