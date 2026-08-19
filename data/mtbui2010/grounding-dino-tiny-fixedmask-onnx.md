# mtbui2010/grounding-dino-tiny-fixedmask-ONNX

## Resumen

`grounding-dino-tiny-fixedmask-ONNX` es un re-export en formato ONNX del modelo de detección de objetos open-vocabulary `IDEA-Research/grounding-dino-tiny`, publicado por el usuario mtbui2010. El objetivo principal de esta versión es corregir un defecto presente en el export comunitario más difundido (`onnx-community/grounding-dino-tiny-ONNX`): la máscara de atención de texto se construía de forma incorrecta cuando el prompt contenía varias frases de clase separadas por puntos, lo que provocaba que solo la primera clase recibiera atención y las demás se ignoraran silenciosamente. Este re-export reconstruye la máscara de atención de forma vectorizada e independiente de los datos, permitiendo que un prompt multi-clase se procese correctamente en una única pasada.

El modelo mantiene la misma arquitectura que el original: un transformer de detección DINO con un codificador de texto BERT y atención deformable. El archivo ONNX pesa 694,8 MB en precisión fp32, con opset 17, y es compatible como reemplazo directo del export comunitario, ya que conserva los mismos nombres de entradas y salidas. Está pensado para entornos de producción que usan ONNX Runtime y necesitan inferencia de detección de objetos con vocabulario abierto sin depender de la implementación de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DINO con codificador de texto BERT y atención deformable |
| Parametros totales | no disponible (archivo fp32 de 694,8 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens de texto (max_text_len) |
| Tipos de cuantizacion | no disponible (solo fp32) |
| Idiomas soportados | no disponible (tokenizer BERT-base-uncased, orientado a inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, pesos embebidos en el grafo) |

## Arquitectura y entrenamiento

El modelo es un re-export del checkpoint `IDEA-Research/grounding-dino-tiny`, que implementa la arquitectura Grounding DINO: un detector de objetos basado en transformer que combina un backbone visual (Swin-T en la versión tiny) con un codificador de texto BERT. La rama de texto genera una máscara de atención en bloques para que los tokens de una frase de clase no atiendan a los de otra. En el export original de Hugging Face, esa máscara se construye dentro del modelo mediante un bucle Python sobre los tokens especiales, y al exportar a ONNX el bucle queda horneado con un número fijo de iteraciones (tres, correspondientes a un prompt de una sola clase). Este re-export sustituye esa función por una versión vectorizada sin bucles, de modo que la máscara se calcula correctamente para cualquier número de frases. Además, se corrige la promoción de tipos float64 a float32 en el cálculo de los puntos de referencia de la atención deformable, que impedía la carga del grafo en ONNX Runtime.

No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). El autor del re-export no ha modificado los pesos, solo el grafo de exportación.

## Capacidades

- Detección de objetos open-vocabulary: el modelo puede localizar y clasificar objetos a partir de descripciones textuales arbitrarias, sin necesidad de entrenamiento específico para cada clase.
- Zero-shot object detection: funciona con clases no vistas durante el entrenamiento, siempre que el texto sea comprensible para el codificador BERT.
- Soporte multi-clase en una sola pasada: gracias a la corrección de la máscara de atención, un prompt como `"chair. tv. vase."` se procesa correctamente en una única inferencia, sin necesidad de ejecutar el modelo varias veces.
- Compatibilidad con ONNX Runtime: el grafo es cargable por ORT y puede integrarse en pipelines de producción sin dependencias de PyTorch.
- Entrada de imagen fija: acepta imágenes de 800x800 píxeles normalizadas con ImageNet, y una máscara de píxeles opcional.
- Salida estructurada: devuelve logits por consulta y token, y cajas delimitadoras en formato cxcywh normalizado.

## Casos de uso

- Inspección visual en entornos industriales: el modelo puede detectar defectos o piezas específicas descritas en lenguaje natural, por ejemplo `"grieta. mancha. tornillo suelto."`, en imágenes de líneas de producción, sin necesidad de reentrenar para cada variante.
- Moderación de contenido en plataformas sociales: se puede usar para localizar objetos no deseados (armas, drogas, etc.) descritos textualmente, adaptando el prompt dinámicamente según las políticas de la plataforma.
- Búsqueda visual por texto en bases de datos de imágenes: permite consultar imágenes por descripción, como `"perro. gato. pájaro."`, y obtener las regiones donde aparecen esos objetos, útil para motores de búsqueda o sistemas de archivado.
- Asistencia a personas con discapacidad visual: integrado en una aplicación móvil, puede describir la escena detectando objetos relevantes a partir de comandos de voz convertidos a texto.
- Automatización de inventario en almacenes: detectar productos o contenedores etiquetados con texto, por ejemplo `"caja azul. palé. carretilla."`, para sistemas de gestión de almacenes.
- Análisis de imágenes médicas o científicas: localizar estructuras o artefactos descritos en informes, como `"nódulo. calcificación."`, aunque el modelo no está específicamente entrenado para dominios médicos y requiere validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de precisión (mAP, etc.) ni comparaciones con otros modelos en esta ficha.

## Requisitos de hardware

- El archivo ONNX pesa 694,8 MB en fp32, por lo que se necesitan al menos 1 GB de VRAM para cargar el modelo en memoria, más espacio para las activaciones durante la inferencia.
- Es adecuado para GPUs de consumo con 4 GB o más de VRAM, como una NVIDIA GTX 1650 o superior, aunque el rendimiento dependerá de la resolución de entrada (fija a 800x800).
- Para despliegue en CPU, ONNX Runtime puede ejecutar el modelo, pero la latencia será significativamente mayor; se recomienda GPU para uso en tiempo real.
- Opciones de despliegue: ONNX Runtime (C++ o Python), o cualquier framework que soporte ONNX (TensorRT, OpenVINO, etc.). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Formato | Corrección multi-clase | Tamaño | Licencia |
|---|---|---|---|---|
| `mtbui2010/grounding-dino-tiny-fixedmask-ONNX` | ONNX (fp32) | Sí, máscara vectorizada | 694,8 MB | Apache-2.0 |
| `onnx-community/grounding-dino-tiny-ONNX` | ONNX (fp32) | No, solo primera clase | ~695 MB (estimado) | Apache-2.0 |
| `IDEA-Research/grounding-dino-tiny` (PyTorch) | PyTorch | Sí, pero requiere ejecutar el modelo en Python | ~700 MB (checkpoint) | Apache-2.0 |

La principal diferencia es la corrección de la máscara de atención: el export comunitario falla con prompts de múltiples clases, mientras que este re-export lo resuelve. El modelo original de PyTorch funciona correctamente, pero no es directamente desplegable en entornos ONNX sin conversión.

## Limitaciones y advertencias

- El modelo es la versión "tiny" de Grounding DINO, por lo que su precisión es inferior a la de modelos más grandes (como Grounding DINO Swin-B o Swin-L). Para tareas exigentes puede ser necesario un modelo mayor.
- La entrada de imagen es fija a 800x800 píxeles; no se soportan resoluciones dinámicas en este export.
- El texto está limitado a 256 tokens, lo que restringe la longitud de las descripciones de clase.
- No se proporcionan cuantizaciones (INT8, FP16), por lo que el uso en dispositivos con poca memoria puede ser problemático.
- El modelo puede alucinar detecciones en imágenes con objetos ambiguos o fuera de distribución; se recomienda validar con umbrales de confianza adecuados (el autor sugiere 0.3 para cajas y texto).
- La licencia Apache-2.0 permite uso comercial, pero los pesos originales provienen de IDEA Research; se debe verificar si hay restricciones adicionales en el modelo base.
- No se han publicado evaluaciones de sesgos o robustez para este export específico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mtbui2010/grounding-dino-tiny-fixedmask-ONNX
- Modelo base: https://huggingface.co/IDEA-Research/grounding-dino-tiny
- Documentación de Grounding DINO en Transformers: https://huggingface.co/docs/transformers/model_doc/grounding-dino
- Repositorio oficial de Grounding DINO: https://github.com/IDEA-Research/GroundingDINO
- Export comunitario mencionado: https://huggingface.co/onnx-community/grounding-dino-tiny-ONNX
