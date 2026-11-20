# AX1Y2JP/recognize-anything-plus-model-ONNX

## Resumen

RAM++ (Recognize Anything Plus) es un modelo de etiquetado y reconocimiento de imágenes desarrollado originalmente por Xinyu1205 (equipo de Recognize Anything) y publicado en Hugging Face como `xinyu1205/recognize-anything-plus-model`. Esta ficha describe la exportación a ONNX realizada por el usuario AX1Y2JP, que convierte los pesos originales `ram_plus_swin_large_14m.pth` a formato ONNX para su despliegue con ONNX Runtime.

El modelo resuelve el problema del etiquetado de imágenes de vocabulario abierto (open-vocabulary tagging) y la clasificación zero-shot: dado un vector de embeddings de etiquetas, produce puntuaciones de afinidad para cada una de las 4585 etiquetas estándar predefinidas por el autor original. Se apoya en un backbone Swin-Large de 14 millones de parpíxeles de resolución de entrenamiento y combina alineamiento imagen-texto con reconocimiento de etiquetas.

La relevancia de esta versión concreta es práctica: ofrece tres variantes de cuantización (fp32, fp16 e int8 con `MatMulNBits`) y expone los embeddings de etiquetas como entrada del grafo, lo que permite filtrar subconjuntos de etiquetas sin recalcular el modelo completo. Es útil para pipelines de visión en producción donde se requiere inferencia ligera y portable fuera de PyTorch. No se dispone de información sobre el número exacto de parámetros totales ni sobre el contexto de entrenamiento en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone Swin-Large (transformer visual jerárquico) con cabeza de alineamiento imagen-etiqueta; exportación ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 384×384 píxeles) |
| Tipos de cuantización | fp32, fp16 (pesos fp16 con E/S float32), int8 (weight-only `MatMulNBits`) |
| Idiomas soportados | en (etiquetas en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 23, requiere ONNX Runtime 1.22+); pesos originales en `.pth` |

## Arquitectura y entrenamiento

El modelo original RAM++ emplea un backbone Swin-Large como extractor visual, entrenado según el autor original con un esquema de reconocimiento de etiquetas a gran escala sobre un vocabulario de 4585 etiquetas estándar. La innovación principal de RAM++ frente a RAM es la capacidad de reconocer etiquetas de vocabulario abierto mediante alineamiento con embeddings de texto, lo que permite clasificación zero-shot sobre categorías no vistas durante el entrenamiento supervisado.

La exportación ONNX conserva el cómputo del modelo original, con dos cambios documentados por el autor de la exportación: la normalización ImageNet se ha integrado dentro del grafo y los embeddings de las 4585 etiquetas estándar se han precalculado y expuesto como una entrada adicional (`label_embed`). Esto permite pasar un subconjunto de filas de `tag_embeddings.npy` para puntuar solo un conjunto reducido de etiquetas, sin modificar el grafo. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de la exportación no los detalla.

## Capacidades

- Clasificación zero-shot de imágenes contra un vocabulario de etiquetas configurable.
- Etiquetado de imágenes con las 4585 etiquetas estándar del modelo original, con umbrales por etiqueta incluidos en `ram_tag_list_threshold.txt`.
- Filtrado de subconjunto de etiquetas pasando únicamente las filas correspondientes de `tag_embeddings.npy` como entrada `label_embed`.
- Inferencia en CPU y GPU mediante ONNX Runtime (`CPUExecutionProvider` y `CUDAExecutionProvider`).
- Soporte de cuantización fp16 e int8 para reducir requisitos de memoria y acelerar la inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de clasificación/etiquetado.
- Capacidades multilingües limitadas al inglés en las etiquetas estándar.

## Casos de uso

- Moderación y etiquetado automático de imágenes en plataformas UGC: el modelo puntúa cada imagen contra las 4585 etiquetas estándar y permite filtrar contenido por categorías (por ejemplo, armas, desnudos, violencia) aplicando umbrales por etiqueta.
- Búsqueda y organización de bibliotecas de imágenes: generar etiquetas para un catálogo fotográfico y habilitar búsqueda por palabras clave en inglés sin necesidad de un modelo generativo.
- Enriquecimiento de metadatos en pipelines de DAM (Digital Asset Management): clasificación por lotes con ONNX Runtime en CPU, integrable en servicios backend sin dependencia de PyTorch.
- Detección de atributos en imágenes de producto para e-commerce: usar un subconjunto de etiquetas relevantes (colores, materiales, tipos de objeto) pasando solo esas filas de `tag_embeddings.npy`, lo que reduce el coste de cómputo.
- Clasificación zero-shot de dominios personalizados: definir etiquetas propias mediante embeddings de texto compatibles con el espacio del modelo y puntuar imágenes contra ellas.
- Preetiquetado para anotación humana: generar candidatos de etiqueta con sus puntuaciones y umbrales para acelerar el trabajo de anotadores en proyectos de visión.
- Despliegue en dispositivos con recursos limitados: la variante int8 con `MatMulNBits` permite ejecutar el modelo en CPU o en GPUs de gama baja dentro de aplicaciones de escritorio o edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 2,0 GB e incluye las tres variantes (fp32, fp16, int8). La variante fp16 e int8 reducen sustancialmente el peso en memoria frente a fp32.
- GPU recomendadas: no especificadas por el autor; al ser un Swin-Large, se espera que quepa en GPUs consumer modernas (RTX 3060 en adelante) con la variante fp16 o int8, aunque no se confirma en la documentación.
- Cabe en GPU consumer: probablemente sí con fp16/int8, sin cifras oficiales.
- Opciones de despliegue: ONNX Runtime 1.22+ con `CUDAExecutionProvider` o `CPUExecutionProvider`; compatible con cualquier runtime que soporte opset 23.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Etiquetas | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAM++ ONNX (esta ficha) | Swin-Large + alineamiento | 4585 estándar + personalizadas | Imagen 384×384 | apache-2.0 | ONNX en HF |
| RAM++ original (`xinyu1205/recognize-anything-plus-model`) | Swin-Large | 4585 estándar + personalizadas | Imagen 384×384 | apache-2.0 | PyTorch en HF |
| CLIP (ViT-L/14) | ViT + transformer texto | Vocabulario abierto vía texto | Imagen + texto | MIT (variantes) | PyTorch/ONNX |
| OpenCLIP | ViT + transformer texto | Vocabulario abierto vía texto | Imagen + texto | MIT/Apache según variante | PyTorch/ONNX |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente visual: no genera texto, no razona y no soporta tool calling ni agentes.
- Etiquetas estándar en inglés; el soporte multilingüe requiere embeddings de texto adicionales no incluidos.
- Riesgo de falsos positivos y negativos en etiquetas con umbrales mal calibrados; los umbrales por etiqueta incluidos son los del autor original y pueden no ajustarse a dominios concretos.
- El rendimiento en dominios muy alejados del entrenamiento original (imágenes médicas, satelitales, etc.) no está documentado.
- La exportación ONNX es una conversión de terceros (AX1Y2JP) sin validación oficial publicada; conviene verificar la equivalencia numérica frente al modelo original antes de usarla en producción.
- La variante int8 requiere ONNX Runtime con soporte de `MatMulNBits` y opset 23; puede no ser portable a todos los runtimes.
- Licencia apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original y las condiciones de los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/AX1Y2JP/recognize-anything-plus-model-ONNX
- Modelo base original: https://huggingface.co/xinyu1205/recognize-anything-plus-model
- Repositorio Recognize Anything (GitHub): no disponible en la información proporcionada
- Paper de RAM++: no disponible en la información proporcionada
- Demo oficial: no disponible en la información proporcionada
