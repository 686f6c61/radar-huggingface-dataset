# samttran/dinov3-vitl16-pretrain-lvd1689m

## Resumen

DINOv3 ViT-L/16 (LVD-1689M) es un modelo fundacional de visión por computador desarrollado por Meta AI, publicado originalmente bajo el identificador `facebook/dinov3-vitl16-pretrain-lvd1689m`. La ficha que nos ocupa, `samttran/dinov3-vitl16-pretrain-lvd1689m`, es una copia sin modificaciones de los pesos oficiales (`config.json`, `model.safetensors` y `preprocessor_config.json`) redistribuida bajo la DINOv3 License. No se trata de un modelo nuevo ni de un fine-tuning: es un espejo del checkpoint original de Meta.

El modelo es un Vision Transformer (ViT) de tipo "large" con parches de 16x16 píxeles, con 303.129.600 parámetros totales, entrenado con el método de auto-supervisión DINOv3 sobre el dataset LVD-1689M. Su propósito es la extracción de características visuales densas de alta calidad, que sirven como base para tareas de visión sin necesidad de fine-tuning específico. Se usa como codificador de imagen en pipelines de terceros; la model card indica explícitamente que es el encoder visual sobre el que condiciona TRELLIS.2 de Microsoft y que lo descarga Idea Maker AI Desktop para su herramienta TRELLIS (imagen a 3D en Mac).

La relevancia de esta copia concreta es de disponibilidad y trazabilidad: al ser un espejo no modificado, permite a proyectos que dependen del checkpoint de Meta referenciarlo desde un repositorio alternativo, siempre bajo los términos de la DINOv3 License. No aporta mejoras de rendimiento ni cambios de arquitectura respecto al original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/16), auto-supervisión DINOv3 |
| Parámetros totales | 303.129.600 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución de entrada según preprocesador, no disponible en detalle) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades lingüísticas) |
| Licencia | DINOv3 License (`dinov3-license`, categoría `other`) |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `preprocessor_config.json` |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de escala "large" con patch size de 16, es decir, divide la imagen de entrada en parches de 16x16 píxeles y los procesa con atención global. El entrenamiento sigue el paradigma DINOv3 de Meta AI, un método de aprendizaje auto-supervisado que produce representaciones visuales densas sin etiquetas. El dataset de preentrenamiento es LVD-1689M, que da nombre al checkpoint.

La información disponible no detalla el número exacto de tokens de entrenamiento, la composición interna del dataset LVD-1689M, ni si hubo fases de ajuste posteriores (RLHF/DPO no aplican a un encoder visual). Tampoco se documentan innovaciones específicas de decodificación o atención en esta ficha; la model card del espejo se limita a declarar que es una copia sin modificaciones del checkpoint de Meta. Para detalles técnicos del método DINOv3 conviene consultar la documentación y el paper oficiales de Meta AI (enlazados más abajo).

## Capacidades

- Extracción de características visuales densas por parche, adecuadas para tareas downstream de segmentación, detección y correspondencia.
- Generación de embeddings globales de imagen (clase CLS) para clasificación y recuperación.
- Base para modelos condicionados por imagen, como TRELLIS.2 de Microsoft en pipelines de imagen a 3D.
- Funciona como backbone congelado: la model card destaca que DINOv3 rinde sin fine-tuning en un amplio rango de tareas.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo de texto.
- No tiene capacidades multilingües ni de generación de lenguaje.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá del procesamiento de imagen.

## Casos de uso

- Imagen a 3D con TRELLIS.2: el modelo actúa como encoder visual que condiciona el generador 3D de Microsoft; se integra en herramientas de escritorio como Idea Maker AI Desktop para convertir una imagen en malla 3D en Mac.
- Segmentación semántica e instancias: usar los mapas de características densas por parche como entrada a cabezas ligeras de segmentación, aprovechando que DINOv3 está diseñado para rendir sin fine-tuning del backbone.
- Recuperación de imágenes (image retrieval): extraer el embedding global de cada imagen y construir un índice vectorial para búsqueda por similitud en catálogos o archivos fotográficos.
- Clasificación de imágenes con pocas etiquetas: entrenar un clasificador lineal o una cabeza pequeña sobre las características congeladas, útil cuando no hay presupuesto para reentrenar un backbone completo.
- Correspondencia y emparejamiento denso entre imágenes: usar las características por parche para tareas de matching, registro o detección de cambios entre pares de imágenes.
- Control de calidad visual en pipelines industriales: alimentar un clasificador de defectos basado en las características del encoder, con la ventaja de que el backbone no requiere ajuste por dominio.
- Preprocesado para modelos generativos condicionados por imagen: sustituir o estandarizar el encoder visual en pipelines de difusión o generación 3D que esperen las características de DINOv3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye métricas y la información de búsqueda solo menciona de forma cualitativa que DINOv3 supera al estado del arte especializado sin fine-tuning, sin cifras concretas. Para números verificables debe consultarse la documentación oficial de Meta AI.

## Requisitos de hardware

- VRAM estimada para inferencia: con 303,1 M de parámetros en fp32, los pesos ocupan aproximadamente 1,2 GB; en fp16/bf16, unos 0,6 GB. A ello hay que sumar activaciones, que dependen de la resolución de entrada y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para lotes pequeños en fp16; A100/H100 para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090. Incluso GPUs con 8 GB son suficientes para inferencia en fp16 con lotes moderados.
- Opciones de despliegue: `transformers` (librería declarada en la model card), con pipeline `image-feature-extraction`; también es viable exportarlo a ONNX o TensorRT para producción, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| samttran/dinov3-vitl16-pretrain-lvd1689m (este) | 303,1 M | ViT-L/16, DINOv3, copia espejo | DINOv3 License | Hugging Face |
| facebook/dinov3-vitl16-pretrain-lvd1689m | 303,1 M | ViT-L/16, DINOv3, original | DINOv3 License | Hugging Face (oficial) |
| tao-hunter/dinov3-vitl16-pretrain-lvd1689m | no disponible | ViT-L/16, DINOv3, copia espejo | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; al ser copias del mismo checkpoint, se espera un comportamiento idéntico en inferencia. Para alternativas de otros tamaños o familias (por ejemplo, otros ViT auto-supervisados) no hay información en la búsqueda proporcionada.

## Limitaciones y advertencias

- Es una copia no oficial: la autoridad sobre los pesos y su licencia recae en Meta AI, no en el redistribuidor. Para producción conviene referenciar el repositorio oficial.
- La licencia DINOv3 License es de tipo `other`; no es una licencia permisiva estándar (Apache, MIT). Es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial.
- No es un modelo generativo: no produce texto, código ni respuestas; solo características visuales.
- Sin datos de benchmarks publicados en esta ficha, no se puede verificar el rendimiento en tareas concretas sin evaluarlo uno mismo.
- El rendimiento en dominios muy alejados de los datos de preentrenamiento (imágenes médicas, satelitales especializadas) puede degradarse; la información disponible no documenta evaluaciones por dominio.
- Riesgo de sesgos presentes en el dataset LVD-1689M: no se detalla su composición, por lo que no se puede auditar la representatividad demográfica o geográfica.
- No hay garantía de mantenimiento ni soporte por parte del redistribuidor; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/samttran/dinov3-vitl16-pretrain-lvd1689m
- Modelo original de Meta AI: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Otra copia espejo encontrada en la búsqueda: https://huggingface.co/tao-hunter/dinov3-vitl16-pretrain-lvd1689m
- Licencia DINOv3: https://huggingface.co/samttran/dinov3-vitl16-pretrain-lvd1689m/blob/main/LICENSE.md
