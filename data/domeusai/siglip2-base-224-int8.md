# Domeusai/siglip2-base-224-int8

## Resumen

Domeusai/siglip2-base-224-int8 es una exportación a ONNX y cuantización a int8 del codificador de imágenes de google/siglip2-base-patch16-224, el modelo multimodal SigLIP 2 publicado por Google en febrero de 2025. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión de formato y precisión pensada para ejecutar la extracción de características visuales en CPU con un coste de memoria y cómputo reducido. El resultado es un único fichero ONNX de 109 MB que acepta tensores de imagen de 224x224 y devuelve embeddings de 768 dimensiones.

El interés de esta ficha radica en su utilidad práctica como componente de pipelines de visión: al ser un encoder aislado (no el modelo completo imagen-texto), se puede emplear para indexación de imágenes, búsqueda visual o como extractor de características en sistemas de recuperación, sin necesidad de GPU. La cuantización dinámica a int8 reduce el peso del modelo respecto al original en float32 y acelera la inferencia en CPU mediante ONNX Runtime.

Conviene subrayar que este repositorio no incluye el codificador de texto ni las cabezas de proyección imagen-texto del SigLIP 2 original, por lo que no sirve por sí solo para tareas de clasificación zero-shot con prompts de texto ni para generación multimodal. Su alcance es estrictamente la extracción de embeddings visuales. El modelo base está bajo licencia Apache 2.0 y la conversión conserva esa misma licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) tipo SigLIP 2, patch size 16, resolución 224x224 |
| Parametros totales | no disponible (el fichero ONNX int8 pesa 109 MB; el modelo base es la variante "base" de SigLIP 2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | int8 dinámica (QInt8, per channel) sobre pesos; activaciones en float32; MatMul de layers.5/mlp/fc2 se mantiene en float32 |
| Idiomas soportados | no disponible (encoder visual, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fichero siglip2_b224_q_l5.onnx, 109 MB) |

## Arquitectura y entrenamiento

El modelo subyacente es el codificador visual de SigLIP 2 (paper arXiv:2502.14786), una evolución de la familia SigLIP que combina un ViT con patch size 16 y resolución de entrada 224x224. La exportación se realizó con `torch.onnx.export` en opset 17, con eje de batch dinámico, tomando como salida el `pooler_output` del `SiglipVisionModel`. Posteriormente se aplicó `onnxruntime.quantization.quantize_dynamic` con pesos QInt8, cuantización por canal y limitada a operadores MatMul y Gemm, dejando explícitamente en float32 el MatMul de `layers.5/mlp/fc2`.

No hay entrenamiento adicional ni ajuste fino: los pesos provienen íntegramente de google/siglip2-base-patch16-224. La innovación técnica de esta conversión es puramente de despliegue: reducir el tamaño y permitir inferencia en CPU sin GPU, manteniendo la salida del pooler en float32 para preservar la calidad del embedding. El preprocesado documentado es RGB, redimensionado bicúbico a 224x224, división por 255 y normalización `(x - 0.5) / 0.5` con canales en primer eje, seguido de normalización L2 del embedding de salida.

## Capacidades

- Extracción de embeddings de imagen: entrada `pixel_values` float32 `[n, 3, 224, 224]`, salida `emb` float32 `[n, 768]`.
- Soporte de batch dinámico gracias al eje de batch dinámico en la exportación ONNX.
- Inferencia en CPU mediante ONNX Runtime, sin requisito de GPU.
- Base para búsqueda visual y recuperación de imágenes por similitud (con normalización L2 del embedding).
- Uso como extractor de características congelado en pipelines de clasificación, clustering o deduplicación de imágenes.
- No incluye codificador de texto, por lo que no soporta zero-shot con prompts textuales ni generación multimodal.
- No soporta tool calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- Capacidades multilingües: no aplica.

## Casos de uso

- Búsqueda visual en catálogos de producto: indexar las imágenes de un catálogo con este encoder y recuperar por similitud vectorial las más parecidas a una imagen de consulta, aprovechando que el embedding de 768 dimensiones se normaliza con L2 y funciona bien con índices tipo FAISS.
- Deduplicación de imágenes en repositorios: calcular embeddings de un lote de imágenes y agrupar por distancia coseno para detectar duplicados o near-duplicates en pipelines de datos de entrenamiento.
- Moderación y filtrado de contenido visual: usar los embeddings como entrada a un clasificador ligero entrenado sobre ellos, ejecutando el encoder en CPU en servidores sin GPU.
- Extracción de características para clasificación downstream: congelar el encoder y entrenar una cabeza lineal sobre los embeddings de 768 dimensiones para tareas específicas de dominio con pocos datos etiquetados.
- Preprocesado en pipelines de visión por lotes: procesar grandes volúmenes de imágenes en CPU con ONNX Runtime, con batch dinámico, en entornos donde el coste de GPU es prohibitivo.
- Componente de sistemas de recuperación multimodal: combinar estos embeddings visuales con embeddings de texto de otro modelo para construir un espacio conjunto de búsqueda imagen-texto, siempre que se gestione la alineación entre espacios.
- Prototipado y experimentación en local: al pesar 109 MB y ejecutarse en CPU, permite probar ideas de visión en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad del embedding ni comparaciones con el modelo original en float32, por lo que no es posible cuantificar la pérdida de precisión introducida por la cuantización int8.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU, el fichero ONNX de 109 MB ocupa del orden de 0,1 GB de memoria, más el espacio de activaciones según el tamaño de batch.
- GPU recomendadas: cualquiera con soporte de ONNX Runtime (RTX 4090, A100, H100) si se desea acelerar, aunque el diseño del modelo está orientado a CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; es un modelo de 109 MB ejecutable en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con posibilidad de integración en servicios Python; no está pensado para vLLM, llama.cpp, Ollama ni TGI, que no soportan este tipo de encoder visual ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Domeusai/siglip2-base-224-int8 | no disponible (109 MB int8) | no aplica | ONNX int8 | Apache 2.0 | Encoder visual cuantizado para CPU |
| google/siglip2-base-patch16-224 | no disponible | no aplica | safetensors (PyTorch) | Apache 2.0 | Modelo original completo imagen-texto, requiere GPU o CPU con PyTorch |
| Otros encoders visuales ONNX int8 | no disponible | no aplica | ONNX int8 | variable | Alternativas de la misma categoría no identificadas en la información disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Solo incluye el codificador de imagen: no hay codificador de texto ni cabezas de proyección, por lo que no sirve para zero-shot con prompts textuales ni para tareas imagen-texto del SigLIP 2 original.
- La cuantización int8 puede degradar ligeramente la calidad del embedding respecto al modelo en float32; no se han publicado métricas que cuantifiquen esa pérdida.
- El preprocesado debe replicarse exactamente (resize bicúbico a 224x224, normalización `(x - 0.5) / 0.5`, canales primero, normalización L2 de la salida); desviarse de él degrada los resultados.
- Riesgo de sesgos heredados del dataset de entrenamiento original de SigLIP 2, no evaluados en esta conversión.
- No apto para generación de texto ni razonamiento: es un extractor de características, no un modelo generativo.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original de Google.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni garantías de mantenimiento.
- El fichero incluye un sha256 documentado; conviene verificarlo antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Domeusai/siglip2-base-224-int8
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
