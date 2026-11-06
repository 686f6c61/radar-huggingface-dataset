# aloxaf/dinov3-small-onnx

## Resumen

DINOv3 ViT-S/16 ONNX es una exportación a formato ONNX del modelo de extracción de características visuales DINOv3 ViT-S/16 desarrollado por Meta. El modelo original se entrenó con auto-supervisión sobre el conjunto LVD-1689M y este repositorio, mantenido por el usuario aloxaf, ofrece los pesos convertidos a ONNX Runtime para inferencia en CPU en precisión FP32, sin cuantización. No se trata de un modelo afinado, sino de una conversión directa del checkpoint preentrenado.

El modelo está pensado para extracción de características de imágenes (*image feature extraction*): recibe un tensor de píxeles de tamaño fijo 224×224 y devuelve 196 tokens de parche de dimensión 384, sin incluir el token CLS ni los cuatro tokens de registro. Es relevante para desarrolladores que necesitan un backbone visual ligero y desplegable sin GPU, con un grafo ONNX validado y reproducible, ya que elimina la dependencia de PyTorch en producción.

La exportación fija el tamaño espacial de entrada (aunque permite batch dinámico), usa opset 18 y se ha validado con ONNX Runtime 1.28 sobre CPUExecutionProvider con lotes de 1, 8 y 3. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo la licencia DINOv3, que es una licencia propia de Meta distinta de las licencias de código abierto habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/16) con auto-supervisión DINOv3 |
| Parametros totales | no disponible (variante "small", ViT-S; cifra exacta no publicada en la información) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada fija 224×224 píxeles |
| Tipos de cuantizacion | no disponible; el export es FP32 sin cuantizar |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades de texto) |
| Licencia | dinov3-license (licencia propia de Meta, ver LICENSE.md) |
| Formato de pesos | ONNX (opset 18), FP32 |

## Arquitectura y entrenamiento

El modelo subyacente es un Vision Transformer de tamaño "small" con parches de 16×16 (ViT-S/16), entrenado por Meta mediante el método de auto-supervisión DINOv3 sobre el corpus de imágenes LVD-1689M. DINOv3 produce representaciones visuales densas y de propósito general sin necesidad de etiquetas, lo que lo hace adecuado como backbone para tareas downstream (clasificación, segmentación, recuperación, etc.) mediante transferencia.

La exportación a ONNX mantiene la arquitectura intacta: entrada `pixel_values` de tipo float32 con forma `[batch, 3, 224, 224]` (batch dinámico, tamaño espacial fijo) y salida `patch_tokens` de forma `[batch, 196, 384]`, correspondientes a los tokens de parche normalizados, excluyendo CLS y los cuatro tokens de registro. El grafo no incluye el pooling adaptativo; el autor documenta que para la representación espacial probada hay que reorganizar los tokens en 14×14, aplicar adaptive average pooling a 4×4 y normalizar L2 cada una de las 16 celdas. El preprocesado previsto es RGB, redimensionado del lado corto a 256 con interpolación bicúbica, recorte central a 224 y normalización con media y desviación típica de ImageNet, lo que difiere del redimensionado completo a 256 por defecto del modelo original.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo auto-supervisado de visión). El autor documenta en `source.json` la revisión del checkpoint original, el checksum, las versiones de dependencias de exportación y la validación numérica.

## Capacidades

- Extracción de características visuales densas: genera 196 tokens de parche de dimensión 384 por imagen.
- Representaciones de propósito general entrenadas con auto-supervisión, útiles como backbone para transferencia.
- Soporte de batch dinámico en la entrada (validado con lotes de 1, 8 y 3).
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No incluye cabecera de clasificación ni tareas específicas: es un extractor de características.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades multilingües ni de generación de texto: no es un modelo de lenguaje.
- Sin capacidades de audio ni de vídeo nativas (aunque los tokens pueden usarse en pipelines de vídeo por frame).

## Casos de uso

- Búsqueda visual y recuperación de imágenes: usar los tokens de parche (o su versión pooled 4×4 normalizada) como embedding para indexar imágenes y recuperar similares por similitud coseno, sin necesidad de GPU.
- Deduplicación de imágenes en pipelines de datos: calcular embeddings y agrupar imágenes casi idénticas antes de entrenar otros modelos, aprovechando el coste reducido de la inferencia en CPU.
- Backbone para clasificación downstream: congelar el extractor y entrenar una cabeza lineal o un clasificador ligero sobre las características de 384 dimensiones.
- Segmentación y detección asistida: usar la rejilla 14×14 de tokens como mapa espacial denso para tareas de segmentación semántica o localización.
- Preprocesado de pipelines de visión en producción: al ser ONNX puro, se integra en servicios sin PyTorch, reduciendo el tamaño del contenedor y la superficie de dependencias.
- Análisis de storyboards y fotogramas de vídeo: el autor menciona un pipeline de storyboard validado; los tokens por frame permiten construir descriptores temporales en CPU.
- Prototipado en entornos sin GPU: portátiles, CI o dispositivos edge donde ONNX Runtime CPU es la única opción viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta validación numérica del export ONNX frente al checkpoint original (registrada en `source.json`), no métricas de calidad downstream.

## Requisitos de hardware

- VRAM estimada: no aplica en la ruta principal; el export está pensado para CPUExecutionProvider en FP32.
- GPU recomendadas: no especificadas; al ser un modelo "small" con entrada 224×224, cabría en GPUs consumer, pero no hay datos de rendimiento publicados.
- ¿Cabe en GPU consumer? No hay datos publicados; por tamaño (repo de 0,1 GB) es plausible, pero no confirmado en la información.
- Opciones de despliegue: ONNX Runtime (validado con la versión 1.28 y CPUExecutionProvider). No se documentan otras rutas como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| aloxaf/dinov3-small-onnx | ViT-S (cifra no disponible) | 224×224 fija, batch dinámico | dinov3-license | ONNX FP32 | Export CPU sin cuantizar |
| facebook/dinov3-vits16-pretrain-lvd1689m | ViT-S/16 | 224×224 (configurable en el original) | dinov3-license | PyTorch (safetensors) | Modelo fuente original de Meta |
| Otros exports ONNX de DINOv3 | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

## Limitaciones y advertencias

- Licencia DINOv3 propia de Meta: no es una licencia de código abierto estándar; es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial.
- El export es FP32 sin cuantizar: no se ofrecen variantes INT8 ni FP16 en este repositorio.
- Tamaño espacial de entrada fijo (224×224): no admite resoluciones arbitrarias sin reexportar el grafo.
- El pooling adaptativo 4×4 no está incluido en el grafo ONNX; debe implementarse fuera.
- El preprocesado documentado difiere del redimensionado por defecto del modelo original (256 completo), lo que puede afectar a la comparabilidad con resultados upstream.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling.
- Riesgo de sesgos heredados del corpus LVD-1689M, no cuantificado en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria amplia.
- El autor declara que el repositorio no contiene muestras de entrenamiento ni credenciales, pero la trazabilidad del checkpoint pasa por una redistribución en ModelScope (`ciqiangxu/DINOv3`), no directamente por Meta.

## Enlaces

- Hugging Face: https://huggingface.co/aloxaf/dinov3-small-onnx
- Modelo original: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Implementación oficial: https://github.com/facebookresearch/dinov3
- Redistribución del checkpoint en ModelScope: https://modelscope.cn/models/ciqiangxu/DINOv3
