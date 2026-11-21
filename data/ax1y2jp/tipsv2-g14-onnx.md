# AX1Y2JP/tipsv2-g14-ONNX

## Resumen

tipsv2-g14-ONNX es la exportación a formato ONNX del modelo google/tipsv2-g14, un codificador dual imagen-texto de tipo CLIP entrenado con aprendizaje contrastivo. Lo publica el usuario AX1Y2JP y su propósito es facilitar el despliegue del modelo original de Google en entornos de inferencia basados en ONNX Runtime, sin dependencia de PyTorch. El pipeline declarado es zero-shot-image-classification, aunque el modelo también sirve como extractor de características para búsqueda o recuperación multimodal.

El modelo original es un transformer de visión (ViT) con parche de 14 píxeles, de ahí el sufijo "g14", y una torre de texto asociada que proyecta ambas modalidades a un espacio latente común mediante similitud coseno escalada por un parámetro logit_scale. La exportación separa los dos grafos (visión y texto) y mantiene el comportamiento numérico del original, con la única modificación de hacer dinámica la interpolación de embeddings posicionales para admitir resoluciones de entrada variables.

Su relevancia práctica está en que permite ejecutar clasificación zero-shot y extracción de embeddings multimodales con ONNX Runtime en CPU o GPU, con variantes fp32, fp16 e int8, lo que reduce los requisitos de memoria y simplifica el despliegue en producción frente a una pila PyTorch completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual (ViT imagen + encoder de texto), aprendizaje contrastivo tipo CLIP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (texto truncado a 64 tokens en el ejemplo de uso) |
| Tipos de cuantizacion | fp32, fp16 (pesos fp16 con E/S float32), int8 (weight-only MatMulNBits, embedding de tokens int8 por filas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 23, requiere ONNX Runtime 1.22+) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de dos torres: un codificador de imagen basado en Vision Transformer con parches de 14x14 y un codificador de texto, ambos proyectando a un espacio compartido. El entrenamiento es contrastivo (image-text contrastive learning), de forma que pares imagen-texto relacionados quedan próximos en el espacio de embeddings. El parámetro logit_scale, equivalente a la inversa de la temperatura, se almacena en los metadatos ONNX para reconstruir los logits de similitud.

La exportación divide el modelo en dos grafos independientes, vision_model y text_model, y modifica la interpolación de embeddings posicionales para que se ejecute siempre, permitiendo entradas de cualquier altura y anchura múltiplo de 14 hasta 1792 píxeles; en 448x448 la operación es la identidad y el cómputo coincide con el original. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste fino preferencial.

## Capacidades

- Clasificación de imágenes zero-shot mediante comparación de embeddings con etiquetas textuales.
- Extracción de embeddings de imagen y de texto de forma independiente.
- Recuperación multimodal imagen-texto (búsqueda por texto sobre un índice de imágenes y viceversa).
- Similitud imagen-texto escalada por logit_scale para ranking de candidatos.
- Entrada de imagen con resolución dinámica (múltiplos de 14 hasta 1792).
- Ejecución en CPU y GPU vía ONNX Runtime con proveedores CUDA y CPU.
- No se documentan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo de representación, no generativo.

## Casos de uso

- Clasificación zero-shot de imágenes en catálogos: se codifican las imágenes una vez y se comparan contra descripciones textuales de categorías, permitiendo añadir clases nuevas sin reentrenar.
- Moderación de contenido visual: se puntúa la similitud entre imágenes subidas y un conjunto de descripciones de políticas para priorizar revisiones humanas.
- Búsqueda semántica de imágenes: se indexan embeddings de imagen y se consultan con texto libre, útil en gestores de activos digitales o bibliotecas fotográficas.
- Etiquetado automático de datasets: se generan etiquetas candidatas por similitud con un vocabulario controlado para acelerar el etiquetado manual.
- Filtrado y deduplicación de corpus multimodales: se calculan embeddings y se detectan pares imagen-texto mal alineados por baja similitud antes del entrenamiento.
- Despliegue en entornos sin PyTorch: al estar en ONNX, se integra en servicios con ONNX Runtime en CPU o GPU, con variantes int8 para reducir memoria en servidores modestos.
- Verificación de coherencia imagen-texto en pipelines de publicación: se comprueba que la imagen destacada de un artículo se corresponde con su titular o pie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 10,9 GB, que incluye las variantes fp32, fp16 e int8 de ambos grafos.
- VRAM estimada: no disponible de forma oficial; la variante int8 es la más adecuada para GPUs con memoria limitada y la fp16 para GPUs con al menos varias decenas de GB si se cargan ambos grafos.
- GPU recomendadas: no disponible; al ejecutarse con ONNX Runtime, admite cualquier GPU compatible con CUDAExecutionProvider.
- Cabe en GPU de consumo: probablemente con la variante int8, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto texto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tipsv2-g14-ONNX | ViT + encoder texto, contrastivo | truncado a 64 tokens en el ejemplo | Apache 2.0 | ONNX | Exportación del modelo de Google |
| google/tipsv2-g14 | ViT + encoder texto, contrastivo | no disponible | Apache 2.0 | PyTorch (safetensors presumiblemente) | Modelo base original |
| CLIP (OpenAI) | ViT + transformer texto, contrastivo | 77 tokens | MIT (variantes abiertas) | PyTorch, ONNX en conversiones de la comunidad | Referencia clásica de zero-shot |
| SigLIP | ViT + encoder texto, sigmoide | variable | Apache 2.0 en variantes abiertas | PyTorch, ONNX | Alternativa con pérdida sigmoide |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de representación: no genera texto ni mantiene conversaciones; no debe usarse para tareas generativas.
- Riesgo de sesgos heredados del corpus de entrenamiento original de Google, no documentados en esta ficha.
- La clasificación zero-shot depende fuertemente de la formulación de las etiquetas textuales; pequeñas variaciones pueden alterar las probabilidades.
- El truncado a 64 tokens en el ejemplo limita las descripciones textuales largas.
- El rendimiento en idiomas distintos del inglés no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base google/tipsv2-g14.
- Requiere ONNX Runtime 1.22 o superior por el uso de opset 23; versiones anteriores no cargarán los grafos.
- La variante int8 usa cuantización weight-only, con posible pérdida de precisión no cuantificada en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria del export.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AX1Y2JP/tipsv2-g14-ONNX
- Modelo base: https://huggingface.co/google/tipsv2-g14
- ONNX Runtime: https://onnxruntime.ai/
- Repositorio ONNX: https://github.com/onnx/onnx
