# Baqnur/LaMa-ONNX

## Resumen

LaMa-ONNX es una conversión a formato ONNX del modelo big-lama original, un sistema de inpainting de imágenes basado en redes neuronales con arquitectura de campos receptivos rápidos (Fast Fourier Convolution, FFC). El modelo original fue desarrollado por Samsung AI Center Moscow y publicado en el repositorio advimman/lama; esta versión ONNX ha sido portada por el usuario Baqnur y se distribuye bajo licencia Apache 2.0. Su propósito es eliminar regiones de una imagen (objetos, marcas de agua, personas) y rellenarlas de forma coherente con el contexto circundante.

La relevancia de esta ficha radica en que ofrece el modelo en un formato portable e independiente del framework de PyTorch, lo que facilita su integración en pipelines de producción basados en ONNX Runtime, TensorRT o cualquier runtime compatible con ONNX. El paquete incluye dos variantes: `lama_fp32.onnx`, recomendada y exportada con `torch.onnx.export` y opset 17, y `lama.onnx`, exportada con `torch.onnx.dynamo_export` y opset 18, que el autor desaconseja por su lentitud.

El repositorio ocupa 0,4 GB y no registra descargas ni interacciones en el momento de la consulta. La entrada de imagen está fijada a 512x512 píxeles en ambas variantes, y el modelo solo declara soporte para inglés en los metadatos, aunque al ser una tarea de visión esta etiqueta tiene relevancia limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con Fast Fourier Convolution (FFC); port del modelo big-lama original |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 512x512 píxeles) |
| Tipos de cuantizacion | fp32 (única variante publicada) |
| Idiomas soportados | en (según metadatos; tarea de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17 en `lama_fp32.onnx`, opset 18 en `lama.onnx`) |

## Arquitectura y entrenamiento

LaMa (Large Mask Inpainting) emplea una arquitectura de red generativa con Fast Fourier Convolutions, que permiten al modelo capturar dependencias globales de la imagen mediante operaciones en el dominio de la frecuencia. Esta elección arquitectónica le permite rellenar máscaras grandes de forma coherente sin necesidad de aumentar excesivamente la profundidad de la red. El modelo original fue entrenado por el equipo de Samsung AI Center Moscow y el detalle de su dataset y proceso de entrenamiento no se recoge en la información disponible de esta ficha.

La conversión a ONNX presenta dos particularidades técnicas. En primer lugar, se ha implementado una versión personalizada de `FourierUnitJIT` para poder exportar las operaciones de Fourier a ONNX sin sobrecarga adicional, manteniendo resultados idénticos al modelo original. En segundo lugar, la forma de entrada está fijada a 512x512 píxeles porque las funciones `irfft` y `rfftn` requerirían resolver el padding dinámico para admitir resoluciones variables. La variante `lama_fp32.onnx` es exportable a TensorRT; para otras resoluciones, el autor remite a un notebook de Colab del repositorio Carve-Photos/lama.

## Capacidades

- Inpainting de imágenes: elimina regiones enmascaradas y las rellena de forma coherente con el contexto.
- Entrada fija de 512x512 píxeles; no admite resoluciones dinámicas en las variantes publicadas.
- Procesamiento imagen a imagen (pipeline `image-to-image`).
- Compatible con ONNX Runtime y exportable a TensorRT.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión general, audio ni capacidades agénticas.
- Capacidades multilingües no aplicables (modelo de visión).

## Casos de uso

- Eliminación de objetos no deseados en fotografías: se proporciona una máscara binaria sobre el objeto y el modelo rellena la región con el fondo circundante, útil en edición fotográfica automatizada.
- Borrado de marcas de agua y logotipos: en pipelines de preprocesado de imágenes para entrenamiento de otros modelos, donde se requiere limpiar contenido superpuesto.
- Restauración de fotografías antiguas: relleno de zonas dañadas o rasgadas tras generar la máscara correspondiente, con resultado coherente gracias a las FFC.
- Limpieza de imágenes para datasets: eliminación de personas o elementos identificativos antes de publicar conjuntos de datos, reduciendo riesgos de privacidad.
- Integración en aplicaciones web o móviles: al estar en ONNX, puede ejecutarse con ONNX Runtime en entornos sin PyTorch, incluyendo despliegues en el navegador o en dispositivos con recursos limitados.
- Aceleración con TensorRT: la variante `lama_fp32.onnx` puede compilarse a TensorRT para inferencia de baja latencia en GPUs NVIDIA en servicios de edición de imagen.
- Preprocesado en pipelines de visión por computador: eliminación de regiones ruidosas o irrelevantes antes de tareas de detección o segmentación posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio pesa 0,4 GB y la variante publicada es fp32, por lo que el peso de los parámetros es acotado.
- GPU recomendadas: no disponible; al ser exportable a TensorRT, se beneficia de GPUs NVIDIA (A100, H100, RTX 4090, etc.), pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probable por el tamaño reducido del repositorio, pero no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime, TensorRT y cualquier runtime compatible con ONNX (opset 17 o 18).
- Latencia y throughput: no disponibles; el autor indica que `lama.onnx` funciona lentamente por problemas de `torch.onnx.dynamo_export` y de optimización del modelo ONNX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LaMa-ONNX (esta ficha) | no disponible | 512x512 fijo | ONNX | Apache 2.0 | Hugging Face |
| big-lama (original) | no disponible | flexible (PyTorch) | PyTorch | Apache 2.0 | GitHub advimman/lama |
| Otros modelos de inpainting | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas adicionales no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrada fija a 512x512 píxeles: no admite resoluciones variables sin reexportar el modelo.
- La variante `lama.onnx` (opset 18) es lenta y el propio autor la desaconseja.
- Solo se publica la variante fp32; no hay versiones cuantizadas (int8, fp16) en el repositorio.
- Riesgo de resultados inconsistentes en máscaras muy grandes o en regiones con texturas complejas, inherente a los modelos de inpainting.
- La etiqueta de idioma "en" no refleja capacidades lingüísticas reales al tratarse de un modelo de visión.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo original big-lama y de sus dependencias.
- El repositorio no registra descargas ni validación comunitaria, por lo que la calidad de la conversión no está contrastada de forma independiente.
- No apto para tareas de generación de texto, razonamiento, código ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Baqnur/LaMa-ONNX
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Carve/LaMa-Demo-ONNX
- Repositorio original: https://github.com/advimman/lama
- Repositorio con implementación exportable: https://github.com/Carve-Photos/lama
- Notebook de exportación a ONNX: https://colab.research.google.com/github/Carve-Photos/lama/blob/main/export_LaMa_to_onnx.ipynb
- Implementación de FourierUnitJIT: https://github.com/Carve-Photos/lama/blob/main/saicinpainting/training/modules/ffc.py
