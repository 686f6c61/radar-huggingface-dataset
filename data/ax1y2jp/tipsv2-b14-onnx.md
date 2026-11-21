# AX1Y2JP/tipsv2-b14-ONNX

## Resumen

tipsv2-b14-ONNX es la exportación a formato ONNX del modelo vision-lenguaje google/tipsv2-b14, desarrollado originalmente por Google. Se trata de un modelo contrastivo de tipo dual-encoder (una torre de visión y una torre de texto) entrenado con aprendizaje contrastivo para alinear representaciones de imágenes y texto en un espacio compartido. Este repositorio, publicado por el usuario AX1Y2JP, no entrena un modelo nuevo: convierte los pesos originales a grafos ONNX separados para inferencia optimizada.

El modelo resuelve tareas de clasificación de imágenes zero-shot, extracción de características multimodales y búsqueda imagen-texto, sin necesidad de fine-tuning sobre las clases objetivo. Su relevancia práctica radica en el formato de despliegue: al estar exportado a ONNX con variantes fp32, fp16 e int8, permite ejecutar inferencia en CPU o GPU mediante ONNX Runtime sin depender del stack de PyTorch, lo que facilita su integración en servicios ligeros y pipelines de producción.

La arquitectura es la de un transformer dual-encoder con parcheado de 14x14 píxeles (el sufijo "b14" indica base con patch size 14), resolución de entrada flexible en múltiplos de 14 hasta 1792 píxeles y contexto de texto truncado a 64 tokens en el ejemplo de uso. El repositorio ocupa 1,4 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual-encoder (vision + texto) con aprendizaje contrastivo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (truncado en el ejemplo); imagen de hasta 1792 px en múltiplos de 14 |
| Tipos de cuantizacion | fp32, fp16 (pesos fp16 con E/S float32), int8 (weight-only `MatMulNBits`, embedding de tokens int8 por filas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 23, requiere ONNX Runtime 1.22+) |

## Arquitectura y entrenamiento

El modelo subyacente, google/tipsv2-b14, es un dual-encoder contrastivo: un codificador de imagen basado en Vision Transformer con parches de 14x14 y un codificador de texto transformer independiente. Ambos proyectan sus salidas a un espacio latente compartido donde la similitud coseno entre embeddings de imagen y texto se escala por un parámetro `logit_scale` (inverso de la temperatura, almacenado en los metadatos ONNX) para producir logits de clasificación. El parcheado de 14 permite resoluciones de entrada flexibles en múltiplos de 14, hasta 1792 píxeles.

La exportación a ONNX introduce cambios respecto al modelo original: los codificadores de imagen y texto se separan en grafos independientes, y la interpolación de embeddings posicionales se ejecuta siempre para permitir tamaños de entrada dinámicos (es una identidad a 448x448). El cómputo es idéntico al original. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación de imágenes zero-shot: compara el embedding de una imagen con embeddings de etiquetas textuales arbitrarias y devuelve probabilidades vía softmax sobre los logits escalados.
- Extracción de características multimodales: genera embeddings normalizados de imagen y de texto por separado, reutilizables para búsqueda, clustering o recuperación.
- Búsqueda imagen-texto y texto-imagen: al compartir espacio latente, permite recuperación cruzada por similitud coseno.
- Inferencia en CPU y GPU mediante ONNX Runtime con los execution providers CUDA y CPU.
- Entrada de imagen dinámica: acepta cualquier altura y anchura múltiplo de 14 hasta 1792 píxeles.
- Tres variantes de precisión (fp32, fp16, int8) para adaptar el coste computacional al hardware.
- No se documentan capacidades de tool calling, agentes, generación de texto libre, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes entrantes contra un conjunto de etiquetas de política (por ejemplo, "contenido violento", "desnudo", "seguro") sin entrenar un clasificador específico, aprovechando la clasificación zero-shot.
- Etiquetado automático de catálogos de e-commerce: generar etiquetas de producto a partir de una taxonomía textual y puntuar cada imagen contra ellas, útil cuando el catálogo cambia con frecuencia y no conviene reentrenar.
- Búsqueda visual en bibliotecas de assets: indexar embeddings de imagen y consultar por descripciones textuales, usando los codificadores separados exportados a ONNX para precalcular vectores en lote.
- Filtrado y deduplicación de datasets: calcular embeddings de imagen para agrupar o detectar duplicados cercanos por similitud coseno antes de entrenar otros modelos.
- Despliegue en entornos sin PyTorch: servicios en contenedores ligeros o edge con ONNX Runtime en CPU, donde la variante int8 reduce el coste de memoria y cómputo.
- Clasificación de imágenes médicas o industriales asistida por texto: definir clases descriptivas en lenguaje natural y puntuar imágenes de inspección, siempre con validación humana dado el riesgo de error.
- Prototipado rápido de interfaces de búsqueda multimodal: usar la variante fp16 en GPU para latencias bajas durante la fase de validación de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio pesa 1,4 GB, por lo que la variante fp16 ronda la mitad de ese tamaño en pesos y la int8 aproximadamente un cuarto, más activaciones y memoria de contexto.
- GPU recomendadas: cualquier GPU con soporte de CUDAExecutionProvider en ONNX Runtime; para fp16 se recomienda una GPU con soporte nativo de fp16 (por ejemplo, series A100, H100 o RTX con Tensor Cores).
- GPU de consumo: cabe en GPUs de consumo con suficiente VRAM para el grafo fp16 o int8; la variante int8 está pensada para reducir requisitos y puede ejecutarse en CPU.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA) con opset 23 y versión 1.22 o superior; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto texto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tipsv2-b14-ONNX (este) | Dual-encoder ViT patch 14 | 64 tokens (ejemplo) | Apache 2.0 | ONNX (fp32/fp16/int8) | Exportación de google/tipsv2-b14; imagen hasta 1792 px |
| google/tipsv2-b14 | Dual-encoder ViT patch 14 | no disponible | Apache 2.0 | PyTorch (safetensors/bin) | Modelo original del que deriva esta exportación |
| CLIP ViT-B/14 | Dual-encoder ViT patch 14 | 77 tokens | MIT (variantes OpenAI) | PyTorch, ONNX disponible en la comunidad | Referencia clásica de clasificación zero-shot |
| SigLIP base patch 14 | Dual-encoder ViT con pérdida sigmoide | 64 tokens | Apache 2.0 (variantes Google) | PyTorch, ONNX en la comunidad | Alternativa contrastiva con pérdida sigmoide en lugar de softmax |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la comparación se limita a arquitectura, licencia y formatos.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento ni evaluaciones en la información disponible; no se puede garantizar la calidad en dominios específicos sin validación propia.
- El truncado a 64 tokens de texto limita las etiquetas o descripciones largas; textos más extensos se recortan.
- Riesgo de sesgo heredado del dataset de entrenamiento original de google/tipsv2-b14, no documentado en esta ficha.
- La clasificación zero-shot es sensible a la formulación de las etiquetas (prompt engineering); pequeñas variaciones textuales pueden alterar las probabilidades.
- La variante int8 requiere ONNX Runtime y usa `MatMulNBits` weight-only, lo que puede degradar ligeramente la precisión frente a fp16.
- Requiere ONNX Runtime 1.22+ por el opset 23; versiones anteriores no cargarán los grafos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base google/tipsv2-b14 y de los datos de entrenamiento originales.
- Repositorio con 0 descargas y 0 likes: no hay evidencia comunitaria de validación en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AX1Y2JP/tipsv2-b14-ONNX
- Modelo base: https://huggingface.co/google/tipsv2-b14
