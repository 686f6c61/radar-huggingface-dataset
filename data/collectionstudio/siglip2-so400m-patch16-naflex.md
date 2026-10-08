# CollectionStudio/siglip2-so400m-patch16-naflex

## Resumen

SigLIP 2 So400m es un codificador visión-lenguaje desarrollado por Google (el repositorio analizado, `CollectionStudio/siglip2-so400m-patch16-naflex`, es una copia del checkpoint original `google/siglip2-so400m-patch16-naflex`). Se trata de un modelo contrastivo que empareja una torre de visión con una torre de texto y que está pensado para tareas como clasificación de imágenes zero-shot y recuperación imagen-texto, así como para actuar de codificador visual dentro de modelos visión-lenguaje (VLM) más grandes.

La variante `naflex` introduce resolución flexible nativa: el modelo procesa imágenes con distintas proporciones y resoluciones sin reescalarlas todas a una cuadrícula fija, lo que mejora la localización y la calidad de las representaciones densas. Cuenta con aproximadamente 1.135 millones de parámetros totales (pesos en safetensors, repositorio de 4,6 GB) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial.

Es relevante porque la familia SigLIP 2 unifica en una sola receta varias mejoras de entrenamiento (pérdida de decodificador, pérdida de predicción global-local y enmascarada, adaptabilidad de resolución y proporción) sobre el objetivo original de SigLIP, y se entrena sobre el dataset WebLI con hasta 2048 chips TPU-v5e. El modelo se publica con integración nativa en `transformers`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (torre de visión + torre de texto con objetivo contrastivo sigmoide); variante NaFlex de resolución nativa flexible |
| Parametros totales | 1.135.670.962 (aprox. 1,14 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (codificador de imagen/texto, no un modelo de contexto de tokens declarado) |
| Tipos de cuantizacion | no disponible en la informacion (el repositorio solo publica pesos safetensors en precisión completa) |
| Idiomas soportados | no disponible en los metadatos; el paper de SigLIP 2 lo describe como multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SigLIP 2 es una evolución del objetivo de preentrenamiento de SigLIP (una pérdida contrastiva de tipo sigmoide, en lugar del softmax usado por CLIP). Sobre esa base añade tres componentes: una pérdida de decodificador, una pérdida de predicción global-local y enmascarada, y adaptabilidad de proporción de aspecto y resolución. La variante `patch16-naflex` usa parches de 16 píxeles con manejo flexible de la resolución de entrada.

El modelo se preentrena sobre el dataset WebLI (Chen et al., 2023) y el cómputo de entrenamiento empleó hasta 2048 chips TPU-v5e. No se indica en la información disponible si se aplicaron etapas de ajuste por preferencias (RLHF/DPO); al ser un modelo de representación contrastiva, el ajuste típico es de tipo supervisado/contrastivo y no de alineación generativa. La información de entrenamiento procede de la model card y del paper asociado (arXiv:2502.14786).

## Capacidades

- Clasificación de imágenes zero-shot: asigna una imagen a etiquetas de texto candidatas sin entrenamiento específico por clase.
- Recuperación imagen-texto (image-text retrieval) bidireccional.
- Generación de embeddings de imagen (a través de la torre de visión), útiles como características densas para otras tareas visuales.
- Uso como codificador visual (vision encoder) dentro de modelos visión-lenguaje.
- Comprensión semántica y localización mejoradas respecto a SigLIP 1 gracias a las pérdidas densas y global-local.
- Adaptabilidad a proporciones de aspecto y resoluciones variables (NaFlex).
- Capacidad multilingüe según la descripción del paper, si bien no está cuantificada en la información proporcionada.
- No incluye generación de texto, tool calling ni razonamiento multi-paso: es un codificador, no un modelo generativo conversacional.

## Casos de uso

- Clasificación automática de imágenes por etiquetas textuales: se pasan etiquetas candidatas en lenguaje natural y el modelo devuelve la probabilidad relativa, útil para moderación de contenido o etiquetado masivo sin entrenar clasificadores por clase.
- Búsqueda semántica de imágenes en un catálogo: generar embeddings de imagen y de consultas de texto para construir un índice vectorial y recuperar las imágenes más afines.
- Organización de bibliotecas multimedia: agrupar y filtrar fotos o vídeos por descripciones textuales sin metadatos previos.
- Componente visual de un VLM: usar la torre de visión como extractor de características congelado y conectar un decodificador de lenguaje para tareas de captioning o VQA.
- Filtrado y deduplicación de datasets: calcular similitud imagen-texto para detectar pares mal emparejados o duplicados en corpus de entrenamiento.
- Comercio electrónico: vinculación automática entre fotos de producto y descripciones del catálogo para mejorar la relevancia de las búsquedas.
- Accesibilidad: selección o descripción de imágenes relevantes a partir de consultas textuales para sistemas de apoyo a personas con discapacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una tabla de evaluación del paper de SigLIP 2 presentada como imagen, sin cifras textuales, por lo que no se reproducen números concretos.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos según el tamaño de ~1,14 mil millones de parámetros):
  - Precisión completa (fp32): aproximadamente 4,5-5 GB de pesos más memoria de activaciones.
  - Media precisión (fp16/bf16): aproximadamente 2,3 GB de pesos.
  - Cuantización int8: aproximadamente 1,2 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue a escala; RTX 4090, RTX 3090 o RTX A6000 para uso intensivo en una sola tarjeta.
- Cabe en GPU de consumo: sí. Con fp16 cabe holgadamente en tarjetas de 8-12 GB (RTX 3070/3080/4070/4080/4090); incluso en fp32 cabe en GPUs de 8 GB.
- Opciones de despliegue: `transformers` (pipeline `zero-shot-image-classification`), y por su naturaleza de codificador puede servirse mediante frameworks de embeddings; el soporte de vLLM, llama.cpp, Ollama o TGI no está indicado en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SigLIP 2 So400m NaFlex (este) | ~1,14 mil millones | resolución flexible (NaFlex) | Apache 2.0 | HuggingFace (copia de CollectionStudio) | Mejoras densas y multilingües sobre SigLIP 1 |
| SigLIP 1 So400m | no disponible | parches fijos | Apache 2.0 | HuggingFace (Google) | Objetivo contrastivo original de SigLIP |
| CLIP ViT-L/14 | no disponible | 224 px fijos | Licencia de investigación (MIT/Apache según variante) | HuggingFace (OpenAI) | Referente clásico de clasificación zero-shot |

Los datos cuantitativos de rendimiento de estos modelos no están disponibles en la información proporcionada, por lo que no se incluye comparación numérica.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni responde a instrucciones; solo calcula similitudes entre imagen y texto.
- Riesgo de sesgo heredado del dataset WebLI, que puede reflejar desequilibrios culturales, geográficos o demográficos.
- Posible degradación en dominios muy distintos al de entrenamiento (imágenes médicas, técnicas o de baja calidad).
- Aunque el paper lo describe como multilingüe, el grado real de cobertura por idioma no está cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia del dataset WebLI para usos sensibles.
- Este repositorio concreto es una copia (autor `CollectionStudio`, con 0 descargas y 0 likes a fecha de creación); para producción se recomienda usar el checkpoint canónico `google/siglip2-so400m-patch16-naflex` y verificar la integridad de los pesos.
- No se documentan en la información disponible los tipos de cuantización soportados ni el comportamiento en despliegues de baja precisión.

## Enlaces

- Repositorio analizado: https://huggingface.co/CollectionStudio/siglip2-so400m-patch16-naflex
- Checkpoint canónico (Google): https://huggingface.co/google/siglip2-so400m-patch16-naflex
- Paper SigLIP 2 (arXiv:2502.14786): https://arxiv.org/abs/2502.14786
- Paper SigLIP (arXiv:2303.15343): https://arxiv.org/abs/2303.15343
- Dataset WebLI / SigLIP (arXiv:2209.06794): https://arxiv.org/abs/2209.06794
- Documentación de SigLIP 2 en transformers: https://huggingface.co/transformers/main/model_doc/siglip2.html
