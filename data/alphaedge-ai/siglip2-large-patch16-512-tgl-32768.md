# alphaedge-ai/siglip2-large-patch16-512-tgl-32768

## Resumen

`siglip2-large-patch16-512-tgl-32768` es una variante "trimmed" (podada) del codificador vision-lenguaje SigLIP 2 de Google, publicada por el usuario `alphaedge-ai`. El modelo original `google/siglip2-large-patch16-512` se ha reducido mediante la tecnica de *trimming* de vocabulario, que consiste en eliminar del tokenizador los tokens no utilizados en un idioma concreto (en este caso, tagalo) y recortar en consecuencia las matrices de embedding correspondientes. El resultado es un modelo un 25,91 % mas pequeno (653.723.650 parametros frente a 882.313.218 del original), con un vocabulario de 32.768 tokens frente a los 256.000 del SigLIP 2 original (una reduccion del 87,20 %).

El modelo conserva la arquitectura SigLIP 2 (ViT con atencion SigLIP, entrenamiento contrastivo imagen-texto) y esta pensado para tareas de clasificacion zero-shot de imagenes y similitud texto-imagen en tagalo. La poda del vocabulario reduce el uso de memoria y acelera la inferencia, a costa de perder cobertura linguistica fuera del tagalo. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia practica es doble: por un lado, demuestra el flujo de trabajo de *trimming* aplicado a modelos multimodales; por otro, ofrece una alternativa ligera para pipelines de vision-lenguaje en tagalo donde el SigLIP 2 completo resulta demasiado pesado. El modelo es pequeno (2,6 GB en safetensors) y cabe en GPUs de consumo, aunque su adopcion real es muy baja (3 descargas, 0 likes en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (ViT + encoder de texto, entrenamiento contrastivo imagen-texto) |
| Parametros totales | 653.723.650 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | tl (tagalo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,6 GB |
| Vocabulario | 32.768 tokens (original: 256.000) |
| Resolucion de parche | patch16, 512 px |
| Modelo base | google/siglip2-large-patch16-512 |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SigLIP 2 (Tschannen et al., 2025), un codificador vision-lenguaje que combina un Vision Transformer con un encoder de texto y se entrena con una funcion de perdida contrastiva tipo SigLIP (sigmoid loss). La innovacion de esta publicacion concreta no esta en la arquitectura, sino en el proceso de *trimming*: se analiza un corpus de 110.351 textos en tagalo extraidos del dataset `lbourdois/fineweb-2-trimming`, se identifican los tokens del tokenizador realmente utilizados y se conservan solo esos (mas los tokens especiales), recortando las matrices de embedding de texto en consecuencia.

El resultado es un vocabulario de 32.768 tokens (frente a 256.000) y una reduccion de 228.589.568 parametros. No se han publicado detalles sobre el reentrenamiento posterior al recorte, por lo que se asume que los pesos de las capas no afectadas se mantienen congelados desde el modelo base. No hay informacion disponible sobre el numero de tokens de entrenamiento del SigLIP 2 original ni sobre el uso de RLHF/DPO en esta variante.

## Capacidades

- Clasificacion zero-shot de imagenes: permite etiquetar imagenes contra un conjunto de etiquetas candidatas en tagalo sin entrenamiento adicional.
- Similitud texto-imagen: genera embeddings de imagen y de texto comparables mediante `SentenceTransformer`, utiles para busqueda y recuperacion multimodal.
- Extraccion de caracteristicas visuales y textuales: el modelo puede usarse como backbone de embeddings.
- Capacidades multilingues: limitadas al tagalo; el vocabulario recortado elimina tokens de otros idiomas.
- No dispone de generacion de texto, tool calling, agentes ni modos de razonamiento extendido: es un encoder, no un modelo generativo.
- No se documentan capacidades de vision densa (segmentacion, deteccion) ni audio.

## Casos de uso

- Moderacion de contenido visual en plataformas en tagalo: clasificacion zero-shot de imagenes contra etiquetas de politica (por ejemplo, "contenido violento", "desnudo", "seguro") usando el pipeline `zero-shot-image-classification` con etiquetas en tagalo.
- Etiquetado automatico de catalogos de producto: asignar categorias a imagenes de e-commerce comparandolas contra etiquetas en tagalo, sin necesidad de entrenar un clasificador especifico.
- Busqueda multimodal texto-a-imagen: indexar un corpus de imagenes con embeddings y permitir consultas en tagalo mediante similitud coseno, usando `SentenceTransformer.encode`.
- Organizacion de archivos fotograficos: agrupar y filtrar imagenes por descripcion textual en tagalo en aplicaciones de gestion de fotos.
- Filtrado de datasets de vision: usar el modelo como clasificador debil para preetiquetar grandes colecciones de imagenes y reducir el coste de anotacion manual.
- Despliegue en dispositivos con recursos limitados: al ser un 25,91 % mas pequeno que SigLIP 2 large, puede ejecutarse en GPUs de consumo o incluso en CPU para tareas de clasificacion por lotes, donde el SigLIP 2 completo no cabria con comodidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de tamano (parametros y vocabulario) y no incluye evaluaciones de precision (por ejemplo, ImageNet zero-shot, retrieval o clasificacion en tagalo) frente al modelo base ni frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,6 GB solo para pesos, mas activaciones; en la practica, entre 4 y 6 GB para lotes pequenos.
- VRAM estimada en fp16/bf16: aproximadamente 1,3-1,5 GB para pesos, mas activaciones; cabe en GPUs de 4 GB en adelante.
- GPU recomendadas: RTX 3060/4060, RTX 4090, A100, H100; el modelo es lo bastante pequeno para ejecutarse en cualquier GPU consumer moderna.
- Compatibilidad con GPU consumer: si, incluida la serie GTX 16xx y RTX 20xx en adelante; tambien puede ejecutarse en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` (pipeline `zero-shot-image-classification`), `sentence-transformers`, y servidores de inferencia compatibles con safetensors (por ejemplo, TGI o vLLM, aunque no se documenta soporte explicito). No hay pesos GGUF publicados, por lo que `llama.cpp` y `Ollama` no estan disponibles de serie.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-large-patch16-512-tgl-32768 | 653.723.650 | 32.768 | no disponible | apache-2.0 | Variante podada para tagalo |
| google/siglip2-large-patch16-512 | 882.313.218 | 256.000 | no disponible | apache-2.0 | Modelo base original, multilingue |
| google/siglip2-base-patch16-512 | no disponible en la informacion | no disponible | no disponible | apache-2.0 | Variante base de SigLIP 2, menor capacidad |
| openai/clip-vit-large-patch14 | no disponible en la informacion | no disponible | no disponible | MIT | Alternativa contrastiva clasica, menos moderna que SigLIP 2 |

La comparativa se limita a datos publicos; no se dispone de evaluaciones de rendimiento comparadas entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura linguistica restringida: el vocabulario recortado elimina tokens no usados en tagalo, por lo que el rendimiento en otros idiomas (incluido el castellano) sera previsiblemente pobre o nulo.
- Riesgo de alucinacion: el modelo es un encoder contrastivo, no genera texto; el riesgo se traslada a falsos positivos en clasificacion y a similitudes espurias en retrieval.
- Sesgos: heredados del dataset de entrenamiento de SigLIP 2 y del corpus de minado `lbourdois/fineweb-2-trimming`; no se documentan evaluaciones de sesgo para esta variante.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar el cumplimiento de las condiciones del modelo base y de los datasets utilizados.
- Adopcion muy baja (3 descargas, 0 likes): no hay evidencia de uso en produccion ni de validacion por terceros.
- Sin benchmarks publicados: no es posible afirmar que el rendimiento se mantiene respecto al original, mas alla de la afirmacion generica de la model card.
- Sin pesos GGUF ni variantes cuantizadas publicadas: el despliegue en entornos con `llama.cpp` u `Ollama` requeriria conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-large-patch16-512-tgl-32768
- Modelo base: https://huggingface.co/google/siglip2-large-patch16-512
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
