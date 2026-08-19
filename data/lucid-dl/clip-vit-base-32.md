# lucid-dl/clip-vit-base-32

## Resumen

`lucid-dl/clip-vit-base-32` es un port del modelo CLIP ViT-B/32 de OpenAI (`openai/clip-vit-base-patch32`) al framework Lucid, desarrollado por el autor `lucid-dl`. CLIP (Contrastive Language-Image Pre-training) es un modelo multimodal de doble codificador que aprende a relacionar imágenes y texto mediante entrenamiento contrastivo sobre pares imagen-texto. El modelo fue entrenado sobre el dataset WIT-400M (WebImageText) con 400 millones de pares, tal y como se describe en el artículo "Learning Transferable Visual Models From Natural Language Supervision" (arxiv:2103.00020).

La relevancia de este port reside en que ofrece los pesos originales de OpenAI convertidos al formato nativo de Lucid (safetensors), lo que permite cargar el modelo directamente con la librería `lucid` sin dependencias adicionales ni conversiones manuales. El modelo está pensado para extracción de características (feature extraction) y tareas de visión multimodal, con un tamaño de repositorio de 0.6 GB y pesos de 577,11 MB en precisión completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/32 (codificador de imagen) + Transformer (codificador de texto), doble encoder contrastivo |
| Parametros totales | No disponible en la model card; el original `openai/clip-vit-base-patch32` tiene ~151 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens para texto; 224x224 píxeles para imagen |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrenado principalmente con datos en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (Lucid-native) |

## Arquitectura y entrenamiento

CLIP ViT-B/32 es un modelo de doble codificador: el codificador de imagen es un Vision Transformer (ViT) con parches de 32x32 píxeles (patch size 32) y el codificador de texto es un Transformer con máscara de atención. Ambos encoders se entrenan conjuntamente mediante una función de pérdida contrastiva (InfoNCE) que maximiza la similitud coseno entre pares de imagen-texto correctos y minimiza la de pares incorrectos, sobre un lote de pares. El modelo fue entrenado con el dataset WIT-400M (WebImageText), con 400 millones de pares imagen-texto extraídos de la web, sin anotaciones manuales. La innovación clave de CLIP es que permite transferencia zero-shot a tareas de clasificación visual sin entrenamiento específico, simplemente comparando la imagen con las descripciones de texto de las clases candidatas.

En esta variante, los pesos se han convertido desde el repositorio original de OpenAI mediante la herramienta `tools.convert_weights` de Lucid, verificando la paridad numérica con los pesos de origen. No se ha realizado ningún reentrenamiento ni ajuste adicional.

## Capacidades

- Extracción de características multimodales: genera embeddings de imagen y texto en un espacio común de 512 dimensiones.
- Clasificación de imágenes zero-shot: permite clasificar imágenes sin entrenamiento previo, describiendo las clases en lenguaje natural.
- Búsqueda imagen-texto y texto-imagen: recuperación de imágenes a partir de descripciones textuales y viceversa.
- Similitud multimodal: calcula la similitud coseno entre cualquier par imagen-texto.
- Generación de embeddings para tareas downstream: los embeddings pueden usarse como entrada para clasificadores lineales o modelos de aprendizaje automático posteriores.
- No es un modelo generativo: no genera texto ni imágenes; es exclusivamente un extractor de características y similitud.

## Casos de uso

- **Clasificación de imágenes zero-shot**: el modelo puede clasificar imágenes en categorías arbitrarias sin entrenamiento previo, escribiendo las categorías como texto y comparando los embeddings. Adecuado para prototipos rápidos y dominios cambiantes donde el reentrenamiento no es viable.

- **Búsqueda multimodal**: implementar un sistema de búsqueda de imágenes por texto en una base de datos, precomputando los embeddings de las imágenes y comparándolos con la consulta textual. Su latencia es baja (una pasada por imagen y por texto) y escala bien con FAISS o similar.

- **Moderación de contenido visual**: detectar contenido inapropiado describiendo categorías de riesgo en texto (violencia, desnudez, etc.) y comparando con las imágenes. Permite actualizar las reglas de moderación sin reentrenar el modelo.

- **Sistemas de recomendación visual**: recomendar productos o contenidos basados en la similitud entre la imagen de un ítem y las imágenes de otros ítems, o entre la descripción textual del usuario y el catálogo.

- **Extracción de características para aprendizaje supervisado**: usar los embeddings como entrada para un clasificador lineal o un MLP en tareas específicas con pocos datos etiquetados. El modelo preentrenado actúa como un buen extractor de features generales.

- **Análisis de similitud de imágenes**: detectar duplicados o imágenes casi duplicadas en grandes colecciones calculando la distancia coseno entre embeddings. Útil en limpieza de datasets o detección de plagio de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación. El modelo hereda el comportamiento del original `openai/clip-vit-base-patch32`, cuyos resultados se documentan en el artículo de referencia (zero-shot top-1 en ImageNet, entre otros), pero no se reproducen aquí al no estar incluidos en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: el peso completo en fp32 es de 577,11 MB, por lo que la inferencia requiere aproximadamente 1-1,5 GB de VRAM con overhead de activaciones y buffers. Cabe cómodamente en cualquier GPU consumer con 4 GB o más.
- **GPUs recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.). También funciona en CPU sin problemas, con mayor latencia.
- **Despliegue**: el modelo está diseñado para la librería `lucid` (github.com/ChanLumerico/lucid). Puede integrarse en pipelines de Python con `lucid.models.clip_vit_base_32(pretrained=True)`.
- **Latencia**: para una imagen de 224x224, la inferencia típica en una GPU consumer es del orden de milisegundos (no se dispone de datos exactos en la model card). La latencia en CPU será significativamente mayor (del orden de cientos de milisegundos).
- **Throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `lucid-dl/clip-vit-base-32` | ~151M (heredado) | 77 tokens texto | MIT | safetensors (Lucid) | Hugging Face |
| `openai/clip-vit-base-patch32` | ~151M | 77 tokens texto | MIT | PyTorch (pytorch_model.bin) | Hugging Face |
| `openai/clip-vit-large-patch14` | ~428M | 77 tokens texto | MIT | PyTorch | Hugging Face |
| `openai/clip-vit-base-patch16` | ~151M | 77 tokens texto | MIT | PyTorch | Hugging Face |

El modelo de Lucid es funcionalmente idéntico al original de OpenAI, con la diferencia de que el formato de pesos es safetensors nativo de Lucid y la carga se realiza a través de la API de `lucid`. Las variantes `patch16` y `large-patch14` ofrecen mayor precisión a costa de más cómputo y memoria.

## Limitaciones y advertencias

- **No es un modelo generativo**: no produce texto ni imágenes; solo embeddings y similitudes. No debe usarse para tareas de generación.
- **Sesgos de los datos**: el entrenamiento se realizó sobre datos de WIT-400M extraídos de la web, que pueden contener sesgos culturales, geográficos y demográficos. El modelo puede reflejar estos sesgos en sus representaciones.
- **Alucinación no aplica**: al no ser generativo, no hay riesgo de alucinación en el sentido clásico, pero sí de clasificaciones erróneas en escenarios de zero-shot.
- **Longitud de texto limitada**: el codificador de texto acepta hasta 77 tokens; textos más largos se truncan, lo que puede degradar el rendimiento en descripciones largas.
- **Idioma**: el modelo fue entrenado principalmente con texto en inglés; el rendimiento en otros idiomas es significativamente menor y no está garantizado.
- **Licencia MIT**: permite uso comercial sin restricciones, pero el modelo original está sujeto a los términos de OpenAI (MIT), por lo que no hay restricciones adicionales conocidas.
- **Dependencia de Lucid**: para cargar los pesos, es necesario instalar la librería `lucid`, que no es un framework tan extendido como PyTorch. Para usarlo en otros entornos, habría que convertir los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucid-dl/clip-vit-base-32
- Repositorio original de OpenAI: https://huggingface.co/openai/clip-vit-base-patch32
- Paper original: https://arxiv.org/abs/2103.00020
- Repositorio de Lucid: https://github.com/ChanLumerico/lucid
- Variante ViT-B/32 (repositorio espejo): https://github.com/antoniodeepblue/huggingface.co-openai-clip-vit-base-patch32
- Documentación de CLIP-ViT en FusionBench: https://tanganke.github.io/fusion_bench/modelpool/clip_vit/
- Ficha técnica en Inferbase: https://inferbase.ai/models/openai-clip-vit-base-patch32
