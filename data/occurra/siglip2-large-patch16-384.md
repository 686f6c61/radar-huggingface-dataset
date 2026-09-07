# occurra/siglip2-large-patch16-384

## Resumen

El modelo `occurra/siglip2-large-patch16-384` es una exportación en formato ONNX del modelo `google/siglip2-large-patch16-384`, desarrollado por Google. Esta versión ha sido preparada por el usuario `occurra` y está liberada bajo licencia Apache-2.0. Se trata de un modelo de tipo visión-lenguaje orientado a la clasificación de imágenes sin entrenamiento (zero-shot). Su función principal es producir embeddings de imagen y de texto que comparten un espacio de representación conjunta de 1024 dimensiones, lo que permite comparar una imagen con descripciones textuales.

La exportación divide el modelo original en dos torres separadas: una para procesar imágenes (tamaño 1.2 GB) y otra para procesar texto (2.1 GB con un blob de datos externo). Además, incluye un tokenizer en formato JSON. Esta arquitectura modular facilita el despliegue con ONNX Runtime, tanto en CPU como en GPU, y permite usar cada torre de forma independiente si la aplicación solo necesita una de las modalidades. La relevancia de esta exportación radica en que ofrece una vía de integración más flexible para entornos de producción que ya utilizan ONNX como formato estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres ONNX separadas (imagen y texto); arquitectura interna no especificada en la documentación disponible |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Texto: 64 tokens (fijo); imagen: 384x384 píxeles |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (metadata sin idiomas declarados) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (imagen y texto como archivos separados), tokenizer JSON |

## Arquitectura y entrenamiento

La exportación mantiene la arquitectura del modelo original de Google, pero no se ofrecen detalles sobre su composición interna en la documentación proporcionada. Lo que sí se especifica es que las torres de imagen y texto se han separado en dos archivos ONNX, de modo que la inferencia puede ejecutarse de manera independiente. La torre de imagen es autocontenida, mientras que la torre de texto depende de un archivo de datos externo (`siglip2-large-patch16-384_text.onnx_data`) que debe situarse junto al archivo `.onnx` correspondiente.

El texto de entrada se limita a un máximo de 64 tokens, que es la longitud fija utilizada durante el entrenamiento del modelo SigLIP2. En cuanto a los datos de entrenamiento, no se ha publicado información sobre la composición del dataset, el número de tokens o si se aplicaron técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Clasificación de imágenes zero-shot: puede comparar el embedding de una imagen con los embeddings de varias descripciones textuales para asignar la etiqueta más probable.
- Embeddings conjuntos imagen-texto: ambas torres devuelven vectores de 1024 dimensiones en un espacio de representación común.
- Procesamiento de imágenes de 384x384 píxeles con normalización SigLIP.
- Procesamiento de texto de hasta 64 tokens mediante el tokenizador incluido.
- No es un modelo generativo: no produce texto ni respuestas, solo representaciones vectoriales.
- No soporta tool calling, function calling ni construcción de agentes, al tratarse de un modelo de embeddings y no de un modelo de lenguaje generativo.

## Casos de uso

- Clasificación automática de imágenes en un catálogo: se definen categorías como "mueble", "juguete" o "ropa" y se utiliza la similitud entre la imagen y las descripciones para asignar la categoría sin necesidad de reentrenar.
- Búsqueda semántica en bancos de imágenes: las consultas en lenguaje natural se transforman en embeddings de texto y se comparan con los embeddings de imágenes almacenados para recuperar resultados relevantes.
- Moderación de contenido visual: se pueden etiquetar imágenes con descripciones como "contenido violento", "desnudo" o "texto publicitario" para filtrar material inapropiado en plataformas.
- Recomendación de productos: a partir de una imagen de referencia, se pueden buscar productos similares comparando embeddings de imagen y de texto en una base de datos de fichas de producto.
- Clasificación de imágenes en documentos: en procesos de digitalización, se pueden identificar tipos de imágenes (gráficos, retratos, diagramas) mediante comparación con descripciones textuales predefinidas.
- Control de calidad visual: en una línea de producción, se pueden clasificar imágenes de piezas defectuosas o correctas utilizando descripciones textuales de los estados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Estimación orientativa basada en el tamaño de los archivos: la torre de imagen en FP32 pesa 1.2 GB y la de texto 2.1 GB. Para cargar ambas simultáneamente en GPU se necesitaría al menos 3.3 GB de VRAM, más overhead de ejecución.
- Se recomienda una GPU con al menos 8 GB de VRAM para trabajar con ambas torres sin problemas, por ejemplo una RTX 3060, RTX 4060, T4 o A10G.
- En CPU es posible ejecutar cada torre por separado, aunque la latencia será mayor.
- El despliegue se realiza con ONNX Runtime, utilizando los providers de CUDA o CPU. No es aplicable a vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput estimados no están disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tarea | Licencia | Observaciones |
|---|---|---|---|---|
| occurra/siglip2-large-patch16-384 | ONNX | Zero-shot image classification | Apache-2.0 | Exportación con torres separadas |
| google/siglip2-large-patch16-384 | PyTorch (transformers) | Zero-shot image classification | Apache-2.0 | Modelo original; incluye implementación completa en Transformers |
| No se dispone de otros modelos comparables en la información proporcionada. |

No se dispone de datos de rendimiento que permitan comparar este modelo con CLIP u otros modelos de clasificación zero-shot.

## Limitaciones y advertencias

- La longitud de texto está restringida a 64 tokens, lo que puede ser insuficiente para descripciones largas o contextos extensos.
- La imagen de entrada debe ajustarse a 384x384 píxeles; imágenes con composiciones distintas pueden perder información o requerir preprocesamiento adicional.
- No es un modelo generativo: no puede producir descripciones en lenguaje natural ni responder preguntas de forma abierta.
- No se han documentado sesgos específicos en la información disponible, pero al heredar el modelo original puede presentar sesgos presentes en sus datos de entrenamiento.
- La exportación ONNX depende de que el archivo de datos externo esté presente en la ruta correcta; si no se coloca, la carga de la torre de texto fallará.
- Los idiomas soportados no están declarados. Es posible que el tokenizer funcione con varios idiomas, pero no hay confirmación en la documentación disponible.
- La licencia Apache-2.0 permite el uso comercial, siempre que se respeten las condiciones de la licencia.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/occurra/siglip2-large-patch16-384
- Modelo original de Google: https://huggingface.co/google/siglip2-large-patch16-384
