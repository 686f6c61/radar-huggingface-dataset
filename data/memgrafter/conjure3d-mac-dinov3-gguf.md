# memgrafter/conjure3d-mac-dinov3-gguf

## Resumen

`conjure3d-mac-dinov3-gguf` es una conversión a formato GGUF del modelo de visión `facebook/dinov3-vitl16-pretrain-lvd1689m`, publicada por el usuario memgrafter bajo el identificador `memgrafter/conjure3d-mac-dinov3-gguf`. No se trata de un modelo de lenguaje generativo, sino de un codificador de imágenes (image encoder) de la familia DINOv3, empaquetado específicamente para su ejecución en Apple Silicon mediante el runtime GGUF. El repositorio tiene un tamaño de 0,6 GB y un total de 303.151.104 parámetros según los metadatos de safetensors del modelo base.

El interés de esta ficha radica en que DINOv3 es un modelo de representación visual auto-supervisado de Meta, y esta variante GGUF facilita su despliegue en hardware de Apple sin necesidad de PyTorch completo. Sin embargo, la información pública disponible sobre esta conversión concreta es muy limitada: cero descargas, cero likes, sin pipeline declarado, sin idiomas especificados y sin resultados de benchmarks propios. El acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

La licencia es `dinov3-license`, una licencia específica de Meta para la familia DINOv3 que impone restricciones adicionales al uso comercial. Cualquier evaluación de producción debe revisar sus términos antes de integrar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/16), codificador de imágenes DINOv3 |
| Parametros totales | 303.151.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles en la información proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | dinov3-license |
| Formato de pesos | GGUF (repo de 0,6 GB); modelo base en safetensors |
| Modelo base | facebook/dinov3-vitl16-pretrain-lvd1689m |
| Tamano del repositorio | 0,6 GB |
| Acceso | restringido (gated) |
| Libreria | gguf |
| Tags | gguf, dinov3, apple-silicon |

## Arquitectura y entrenamiento

El modelo subyacente es `facebook/dinov3-vitl16-pretrain-lvd1689m`, un Vision Transformer de la familia DINOv3 con parche de 16x16 y variante "L" (large), con 303 millones de parámetros. DINOv3 se entrena con aprendizaje auto-supervisado (self-supervised learning) sobre grandes corpus de imágenes, sin etiquetas, produciendo representaciones visuales densas útiles para tareas downstream como clasificación, segmentación, detección o recuperación. El sufijo `lvd1689m` hace referencia al conjunto de datos de preentrenamiento utilizado por Meta (LVD-1689M), según la convención de nombres de la familia DINOv3.

Esta ficha concreta es una conversión a GGUF orientada a Apple Silicon. No se dispone de información sobre el proceso de cuantización aplicado (qué niveles GGUF se generaron, si se usó `llama.cpp` u otra herramienta de conversión), ni sobre si se realizó algún ajuste fino posterior. Tampoco hay datos publicados sobre el número exacto de tokens de imagen vistos durante el preentrenamiento, la composición del dataset LVD-1689M ni si se aplicaron etapas de RLHF/DPO (no aplicables en un codificador visual auto-supervisado). Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Extracción de características visuales densas a partir de imágenes, gracias a la arquitectura ViT-L/16 de DINOv3.
- Generación de embeddings de imagen útiles para tareas de recuperación (image retrieval), clustering y búsqueda por similitud.
- Soporte para tareas downstream de visión por computador mediante fine-tuning o uso como backbone congelado: clasificación, segmentación semántica, detección de objetos, estimación de profundidad, entre otras.
- Capacidad de segmentación densa (dense feature maps) al estilo DINOv3, adecuada para tareas que requieren representaciones por píxel o por parche.
- Ejecución en Apple Silicon mediante el runtime GGUF (tag `apple-silicon`).
- No dispone de tool calling, function calling, razonamiento multi-paso ni generación de texto: es un codificador visual, no un modelo de lenguaje.
- Capacidades multilingües: no aplica (modelo sin entrada/salida textual).
- Capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda visual y recuperación de imágenes: usar los embeddings del encoder para indexar un catálogo de imágenes y realizar búsquedas por similitud vectorial en un motor como FAISS o Milvus. Adecuado por la calidad de las representaciones densas de DINOv3 y por el reducido tamaño del GGUF (0,6 GB), que permite ejecutarlo en un Mac.
- Prototipado en local sobre Apple Silicon: desarrolladores que trabajan en un Mac pueden cargar el GGUF y experimentar con extracción de características sin depender de CUDA ni de un entorno PyTorch completo.
- Segmentación semántica como backbone congelado: conectar las características del encoder a una cabeza ligera de segmentación y entrenar solo esa cabeza sobre un dataset propio, aprovechando la calidad de las representaciones DINOv3.
- Clasificación de imágenes con pocos datos: usar los embeddings como entrada a un clasificador lineal o k-NN para tareas de clasificación con pocas muestras etiquetadas.
- Detección de duplicados y near-duplicates en pipelines de datos: calcular embeddings de un corpus de imágenes y agrupar por distancia coseno para deduplicar datasets de entrenamiento.
- Análisis de imágenes médicas o industriales en entornos con hardware Apple: usar el encoder como extractor de características en un pipeline de inspección visual, siempre que la licencia lo permita y se valide el dominio.
- Integración en aplicaciones de escritorio macOS: empaquetar el GGUF en una app nativa que necesite comparar o clasificar imágenes localmente sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas propias, y no se dispone de datos de latencia o throughput para esta conversión GGUF concreta. Los benchmarks del modelo base DINOv3 ViT-L/16 deberían consultarse en la documentación oficial de Meta y en la model card de `facebook/dinov3-vitl16-pretrain-lvd1689m`, pero no se reproducen aquí al no estar incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio GGUF ocupa 0,6 GB, por lo que la inferencia requiere un orden de magnitud similar en memoria unificada, más overhead del runtime. Una estimación conservadora sitúa el uso en torno a 1-2 GB de RAM en Apple Silicon.
- GPU recomendadas: el tag `apple-silicon` indica que está pensado para chips Apple M1/M2/M3/M4. No hay información sobre soporte CUDA.
- Cabe en GPU consumer: sí, en cualquier Mac con Apple Silicon; también debería caber en GPUs consumer con suficiente VRAM si el runtime GGUF lo soporta, aunque no se confirma en la información disponible.
- Opciones de despliegue: runtime GGUF (presumiblemente `llama.cpp` o una variante compatible con Apple Silicon); no se confirman otros backends como vLLM, TGI u Ollama para este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| conjure3d-mac-dinov3-gguf (esta ficha) | 303 M | ViT-L/16 DINOv3, GGUF | GGUF | dinov3-license | Gated, 0 descargas |
| facebook/dinov3-vitl16-pretrain-lvd1689m | 303 M | ViT-L/16 DINOv3, original | safetensors | dinov3-license | Público en HF |
| facebook/dinov2-large | ~300 M | ViT-L/14 DINOv2 | safetensors | Apache 2.0 (DINOv2) | Público en HF |
| openai/clip-vit-large-patch14 | ~428 M | CLIP ViT-L/14 | safetensors | MIT (CLIP) | Público en HF |

La comparación con DINOv2-large y CLIP ViT-L/14 es orientativa por tamaño y categoría (encoders visuales), pero no se dispone de métricas comparativas en la información proporcionada. La principal diferencia práctica de esta ficha frente al modelo base es el formato GGUF y la orientación a Apple Silicon; frente a DINOv2 y CLIP, la licencia es más restrictiva (`dinov3-license` frente a Apache 2.0 y MIT respectivamente).

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo representaciones visuales. No debe evaluarse con benchmarks de lenguaje.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede bloquear pipelines automatizados.
- Licencia `dinov3-license`: impone condiciones específicas de Meta para DINOv3; es imprescindible revisar los términos de uso comercial antes de integrarlo en producción. No es una licencia permisiva tipo Apache o MIT.
- Repositorio con cero descargas y cero likes: no hay evidencia de comunidad, validación ni mantenimiento. La conversión GGUF no está auditada públicamente.
- Sin información sobre los niveles de cuantización aplicados: la pérdida de precisión respecto al modelo base es desconocida.
- Sin idiomas declarados: al no procesar texto, la dimensión lingüística no aplica, pero tampoco hay información sobre sesgos en los datos de imagen de preentrenamiento.
- Riesgo de sesgos visuales heredados del dataset LVD-1689M y del preentrenamiento de DINOv3: no se documentan en esta ficha.
- No se dispone de información sobre latencia, throughput ni compatibilidad con backends distintos del runtime GGUF para Apple Silicon.
- El tamaño del repo (0,6 GB) sugiere una cuantización agresiva o un empaquetado parcial; conviene verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/memgrafter/conjure3d-mac-dinov3-gguf
- Modelo base: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Repositorio oficial de DINOv3 (Meta): no disponible en la información proporcionada
- Paper de DINOv3: no disponible en la información proporcionada
- Documentación de la licencia dinov3-license: no disponible en la información proporcionada
