# Jens-Duttke/Sharp-ONNX-HighPerf

## Resumen

SHARP es un modelo de Apple que convierte una única fotografía en una escena 3D representada mediante gaussianas (3D Gaussian Splatting) en una sola pasada hacia delante. Esta ficha describe la conversión independiente a ONNX realizada por Jens Duttke, que re-exporta los pesos PyTorch originales a opset 21 con precisión float16 de extremo a extremo, sin operadores contrib y con una huella de memoria muy reducida. El modelo original, `apple/ml-sharp`, utiliza un backbone de estimación de profundidad (Depth Pro) y genera 1.179.648 gaussianas por imagen a una resolución fija de 1536x1536 píxeles. La conversión ONNX optimizada permite ejecutar el modelo en hardware con tan solo 8 GiB de VRAM, algo inviable con la versión original en PyTorch. Es relevante para aplicaciones de síntesis de nuevas vistas, realidad aumentada, captura 3D a partir de fotos y cualquier flujo que necesite reconstrucción 3D rápida desde una sola imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de profundidad (Depth Pro) y cabecera de regresión de gaussianas; sin detalles adicionales en la documentación |
| Parametros totales | 702 M |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | float16 (fp16) únicamente; se descartó una variante de 4 bits por ser 3,6 veces más lenta |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | Apple Machine Learning Research Model License (apple-amlr) - uso exclusivo para investigación, sin fines comerciales |
| Formato de pesos | ONNX (safetensors no aplica; el archivo es `sharp_1536x1536_bs1_fp16_opset21_optimized.onnx`, 1318 MB) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentación proporcionada, pero se sabe que el modelo base es `apple/ml-sharp`, que combina un estimador de profundidad (Depth Pro) con una red que predice parámetros de gaussianas (posiciones, escalas, cuaterniones, colores y opacidades) a partir de una imagen. La conversión ONNX se realizó re-trazando el grafo desde los pesos PyTorch originales, no mediante conversión directa del grafo existente. El resultado es un grafo con 2422 nodos (frente a los 8517 de la conversión previa de `pearsonkyle/Sharp-onnx`), con una única operación de `Cast` y salidas con nombres documentados. No se dispone de información sobre los datos de entrenamiento, número de tokens o proceso de alineación (RLHF/DPO), ya que no se incluye en la documentación pública. La entrada es una imagen RGB de 1536x1536 píxeles en float16, junto con un factor de disparidad (`focal_length / image_width`), y la salida son 1.179.648 gaussianas organizadas en dos capas sobre una rejilla de 768x768. Las posiciones se emiten en coordenadas proyectivas, no en espacio de cámara, lo que requiere una transformación posterior para su uso en renderizado.

## Capacidades

- Conversión de una única imagen a una escena 3D de gaussianas en una sola pasada.
- Generación de 1.179.648 gaussianas por imagen, con atributos de posición (proyectiva), escala, rotación (cuaternión), color RGB lineal y opacidad activada.
- No incluye armónicos esféricos; solo color DC.
- Soporte de inferencia en ONNX Runtime con cualquier proveedor de ejecución (CPU, CUDA, WebGPU, DirectML, etc.) gracias a que no requiere operadores contrib.
- Precisión float16 de extremo a extremo, lo que reduce el consumo de memoria y acelera la inferencia en hardware compatible.
- El modelo está diseñado para síntesis de nuevas vistas (novel view synthesis) y reconstrucción 3D a partir de fotografías.

## Casos de uso

- Reconstrucción 3D a partir de fotos de producto: una sola imagen de un objeto permite generar una escena 3D que puede visualizarse desde distintos ángulos, útil para catálogos interactivos o configuradores de producto.
- Realidad aumentada: integrar el modelo en dispositivos móviles o web (vía WebGPU) para capturar un objeto del entorno y generar una representación 3D que se pueda superponer en la escena real.
- Síntesis de nuevas vistas en fotografía: dado un único punto de vista, generar imágenes simuladas desde cámaras ligeramente desplazadas, útil para efectos cinematográficos o previsualización.
- Automatización de escaneado 3D en entornos industriales: convertir fotografías de piezas en modelos 3D para inspección visual o documentación técnica, sin necesidad de equipos de escaneo especializados.
- Generación de datasets sintéticos para entrenamiento de otros modelos: las gaussianas generadas pueden renderizarse en múltiples vistas para crear datos etiquetados de forma barata.
- Prototipado rápido en diseño 3D: un diseñador puede fotografiar un boceto físico o una maqueta y obtener una base 3D editable antes de modelar manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como PSNR, SSIM, LPIPS) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento comparativas con la conversión previa de `pearsonkyle/Sharp-onnx`:

| Métrica | `pearsonkyle/Sharp-onnx` | este build |
|---|---|---|
| Opset | 15 | 21 |
| Nodos | 8517 | 2422 |
| Nodos `Cast` | 2313 | 1 |
| I/O dtype | float32 | float16 |
| Tiempo de creación de sesión | 2,26 s | 1,65 s |
| Tiempo de inferencia | 1,80 s | 1,13 s |
| Pico de VRAM | 15,1 GiB | 6,7 GiB |

Además, se compararon las salidas de ambos modelos en tres imágenes; la desviación absoluta media por tensor se mantiene entre 0,011 % y 0,687 % del rango del tensor, atribuible al redondeo de float16. No hay datos de benchmarks académicos (MMLU, etc.) porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada: 6,8 GiB de pico durante la inferencia, 1,3 GiB residentes entre ejecuciones (medido con AMD Radeon RX 7900 XTX y ONNX Runtime 1.23 con WebGPU EP).
- GPU recomendadas: tarjetas con al menos 8 GiB de VRAM pueden ejecutar el modelo con margen (queda 1,4 GiB libres en una GPU de 8 GiB). En GPUs de 10 GiB quedan 3,5 GiB libres, y en las de 12 GiB, 5,5 GiB.
- Es compatible con GPUs NVIDIA, AMD e Intel mediante ONNX Runtime con los proveedores de ejecución adecuados (CUDA, ROCm, WebGPU, DirectML, etc.).
- Opciones de despliegue: ONNX Runtime (>= 1.20) con cualquier EP; no requiere operadores contrib. Se puede usar en CPU, aunque la inferencia será más lenta. También se puede servir a través de frameworks que soporten ONNX (Triton, FastAPI, etc.).
- Latencia y throughput: en la configuración medida (RX 7900 XTX, WebGPU) la inferencia tarda 1,13 s por imagen. No se proporcionan datos de throughput en batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución entrada | Formato | VRAM pico | Licencia |
|---|---|---|---|---|---|
| `Jens-Duttke/Sharp-ONNX-HighPerf` | 702 M | 1536x1536 | ONNX fp16 opset21 | 6,7 GiB | apple-amlr (solo investigación) |
| `pearsonkyle/Sharp-onnx` | 702 M | 1536x1536 | ONNX fp32 opset15 | 15,1 GiB | apple-amlr (solo investigación) |
| `apple/ml-sharp` (original PyTorch) | 702 M | 1536x1536 | PyTorch | no disponible | apple-amlr (solo investigación) |

No se dispone de comparativas con otros modelos de image-to-3D como LGM, One-2-3-45 o TriplaneGaussian, ya que no se encontraron datos en la documentación.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo la Apple Machine Learning Research Model License, que limita su uso exclusivamente a fines de investigación y prohíbe explícitamente cualquier explotación comercial, desarrollo de productos o uso en servicios comerciales. Además, la licencia es revocable.
- Las posiciones de salida están en coordenadas proyectivas, no en espacio de cámara. Es necesario aplicar la transformación `focal_ndc = 2 * f / w` y dividir los dos primeros componentes por ese valor antes de usar las gaussianas en un renderizador. No hacerlo produce una escena visualmente plausible pero geométricamente incorrecta.
- La entrada debe ser una imagen cuadrada de exactamente 1536x1536 píxeles. La model card advierte que no es posible re-exportar el modelo a resoluciones menores (por ejemplo, 1152 o 768) porque el trazado falla dentro de la pirámide de parches de Depth Pro. Cualquier imagen no cuadrada debe recortarse y redimensionarse antes de la inferencia.
- El número de gaussianas de salida es fijo (1.179.648) e independiente del contenido de la imagen, lo que puede limitar la fidelidad en escenas muy complejas o muy simples.
- No se incluyen armónicos esféricos, por lo que los colores son solo DC; esto puede afectar a la calidad del renderizado bajo iluminación variable.
- El modelo está pensado para una sola imagen; no soporta entrada de múltiples vistas.
- No hay información sobre sesgos o alucinaciones específicas, pero al ser un modelo de visión, puede fallar en condiciones de iluminación extremas, texturas repetitivas u objetos con superficies reflectantes.
- La conversión ONNX no está afiliada ni respaldada por Apple; es un trabajo independiente del autor.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Jens-Duttke/Sharp-ONNX-HighPerf
- Repositorio oficial de Apple SHARP: https://github.com/apple/ml-sharp
- Conversión ONNX previa de Kyle Pearson: https://huggingface.co/pearsonkyle/Sharp-onnx
- Perfil de HuggingFace del autor (Jens Duttke): https://huggingface.co/Jens-Duttke
- GitHub del autor: https://github.com/jens-duttke
- Modelo relacionado del autor (DepthPro ONNX): https://huggingface.co/Jens-Duttke/DepthPro-ONNX-HighPerf
