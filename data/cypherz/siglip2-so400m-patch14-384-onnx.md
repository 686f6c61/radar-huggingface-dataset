# cypherz/siglip2-so400m-patch14-384-onnx

## Resumen

SigLIP 2 So400m (patch 14, 384 px) es un modelo de vision-lenguaje desarrollado originalmente por Google, diseñado para tareas de clasificación de imágenes zero-shot y alineamiento imagen-texto mediante una arquitectura dual de codificadores (uno visual y otro textual). Esta ficha concreta corresponde a una exportación a ONNX realizada por el usuario cypherz, que separa el codificador de imagen y el codificador de texto en dos ficheros independientes, pensada para su uso en herramientas de búsqueda de imágenes local (GravityWell). Los pesos son idénticos a los del modelo original; solo cambia el formato de empaquetado.

El modelo base emplea la arquitectura SigLIP 2, que sustituye la función de pérdida softmax por una pérdida sigmoidea sobre pares imagen-texto, lo que permite un entrenamiento más eficiente y un mejor rendimiento en tareas de recuperación y clasificación zero-shot. Con 400 millones de parámetros en la variante So400m y una resolución de entrada de 384×384 píxeles con parches de 14×14, el modelo genera embeddings alineados de 1152 dimensiones tanto para imágenes como para texto.

La relevancia de esta exportación radica en que permite ejecutar el modelo sin dependencia de PyTorch, usando ONNX Runtime, lo que facilita el despliegue en entornos de producción ligeros y en aplicaciones de escritorio. Al mantener la licencia Apache 2.0 del original, es apta para uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (codificadores duales transformer: vision + texto, pérdida sigmoidea) |
| Parametros totales | ~400 M (variante So400m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision-lenguaje, no generativo de texto largo) |
| Tipos de cuantizacion | no disponible (exportación ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`visual.onnx`, `textual.onnx`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base google/siglip2-so400m-patch14-384 es un modelo de visión-lenguaje con dos codificadores transformer independientes: un Vision Transformer (ViT) que procesa imágenes de 384×384 píxeles divididas en parches de 14×14, y un codificador de texto que procesa las descripciones textuales. Ambos producen embeddings de 1152 dimensiones en un espacio latente compartido. La innovación principal de la familia SigLIP 2 frente a CLIP es el uso de una pérdida sigmoidea por pares en lugar de una softmax global sobre el lote, lo que mejora la eficiencia del entrenamiento y la calidad de los embeddings.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de alineamiento imagen-texto). La exportación ONNX mantiene los pesos sin cambios y separa los dos codificadores en ficheros independientes (`visual.onnx` y `textual.onnx`), cada uno con salidas de estado oculto final y embedding pooled de 1152 dimensiones.

## Capacidades

- Clasificación de imágenes zero-shot: asignar etiquetas textuales arbitrarias a imágenes sin entrenamiento específico.
- Recuperación imagen-texto y texto-imagen mediante similitud de embeddings en espacio compartido.
- Generación de embeddings visuales de 1152 dimensiones para indexación y búsqueda semántica.
- Generación de embeddings textuales de 1152 dimensiones alineados con los visuales.
- Búsqueda local de imágenes (caso de uso declarado por el autor de la exportación).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso (no es un modelo generativo).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Búsqueda de imágenes local: indexar una biblioteca de imágenes generando embeddings con `visual.onnx` y consultar con descripciones textuales procesadas por `textual.onnx`, todo con ONNX Runtime sin PyTorch.
- Clasificación automática de imágenes en pipelines de datos: etiquetar grandes volúmenes de imágenes con categorías definidas en texto, sin entrenamiento adicional.
- Moderación de contenido visual: comparar embeddings de imágenes con descripciones de contenido no deseado para filtrar de forma zero-shot.
- Organización de archivos multimedia personales: agrupar y buscar fotos por descripción semántica en aplicaciones de escritorio con recursos limitados.
- Enriquecimiento de catálogos de e-commerce: asignar categorías y atributos textuales a imágenes de producto mediante similitud de embeddings.
- Detección de duplicados y near-duplicates visuales: comparar embeddings pooled de 1152 dimensiones para identificar imágenes similares.
- Despliegue en entornos sin PyTorch: integración en servicios ligeros o aplicaciones embebidas gracias al formato ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 3,2 GB (incluye ambos ficheros ONNX en precisión original).
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los pesos (~400 M de parámetros en FP32) se puede inferir un consumo en torno a 1,6-2 GB para los pesos, más el overhead de activaciones.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; el tamaño reducido del modelo sugiere que puede ejecutarse en GPUs de consumo, pero no hay datos verificados.
- Opciones de despliegue: ONNX Runtime (formato nativo); también puede cargarse con herramientas compatibles con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cypherz/siglip2-so400m-patch14-384-onnx | ~400 M | 384×384 | ONNX | Apache 2.0 | Hugging Face |
| google/siglip2-so400m-patch14-384 | ~400 M | 384×384 | safetensors/PyTorch | Apache 2.0 | Hugging Face |
| CLIP ViT-L/14 | ~428 M | 224×224 | PyTorch | MIT (variantes) | Hugging Face / OpenAI |

La comparativa se limita a señalar diferencias de formato y disponibilidad; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni razonamiento; su uso se limita a embeddings y clasificación.
- Riesgo de sesgos heredados del dataset de entrenamiento original de Google, no documentados en esta ficha.
- Posible degradación en dominios visuales alejados de la distribución de entrenamiento (zero-shot puede fallar en categorías muy específicas).
- Sin información sobre cobertura idiomática del codificador de texto.
- La exportación ONNX no documenta cuantizaciones ni optimizaciones; el rendimiento puede diferir del modelo PyTorch original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria de la exportación.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base original de Google.
- No se documentan limitaciones específicas de contexto ni de longitud de texto de entrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cypherz/siglip2-so400m-patch14-384-onnx
- Modelo base: https://huggingface.co/google/siglip2-so400m-patch14-384
- Paper de SigLIP 2: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
