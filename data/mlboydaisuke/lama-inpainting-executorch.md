# mlboydaisuke/LaMa-Inpainting-ExecuTorch

## Resumen

LaMa-Inpainting-ExecuTorch es una conversión del modelo de inpainting de imágenes LaMa (Large Mask Inpainting) al formato ExecuTorch con backend XNNPACK, diseñado para ejecución on-device en dispositivos con recursos limitados. El modelo original, desarrollado por Samsung Research y publicado en WACV 2022, utiliza convoluciones de Fourier para lograr un campo receptivo grande y rellenar regiones enmascaradas de forma robusta incluso con máscaras de gran tamaño. Esta variante concreta, publicada por mlboydaisuke, toma como entrada una imagen RGB de 512×512 y una máscara binaria de la misma resolución, y devuelve la imagen completada con la región enmascarada rellenada.

La relevancia de este modelo radica en su capacidad para ejecutarse en dispositivos móviles y edge sin necesidad de GPU dedicada, gracias a la optimización con ExecuTorch y XNNPACK. El repositorio incluye únicamente la variante fp32 (204.8 MB) con una paridad casi perfecta respecto al modelo eager original (correlación 1.0), mientras que la versión int8 fue descartada por degradación visible (22 dB de pérdida). El modelo está pensado para aplicaciones de edición de imágenes en tiempo real, eliminación de objetos y restauración de fotografías directamente en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaMa con convoluciones de Fourier (feed-forward, un solo paso) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 512×512) |
| Tipos de cuantizacion | fp32 (no se incluye int8 por degradacion visible) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch .pte (tambien disponible el modelo original en PyTorch) |

## Arquitectura y entrenamiento

LaMa es un modelo feed-forward de un solo paso, basado en una arquitectura de convoluciones de Fourier (Fourier Convolutions) introducidas en NeurIPS 2020. Esta técnica permite operar en el dominio de la frecuencia, logrando un campo receptivo global sin necesidad de apilar muchas capas convolucionales. El modelo original fue entrenado por Samsung Research con un enfoque de resolución robusta, capaz de manejar máscaras de gran tamaño y de generalizar a resoluciones superiores a las del entrenamiento. En esta conversión a ExecuTorch, la transformada inversa de Fourier (irfftn) se reemplaza por una multiplicación matricial real, ya que ExecuTorch no puede bajar la operación `torch.fft.irfftn`. El tamaño espacial queda fijo a 512×512 porque esas matrices se construyen por tamaño. El proceso de conversión sigue el flujo `torch.export -> to_edge_transform_and_lower(XnnpackPartitioner) -> .pte`, con scripts disponibles en el repositorio `executorch-models`. No se dispone de información detallada sobre el dataset de entrenamiento ni el número de tokens (no aplica al ser un modelo de visión).

## Capacidades

- Inpainting de imágenes: rellena regiones enmascaradas de forma realista, manteniendo coherencia con el contexto circundante.
- Robustez a máscaras grandes: gracias a las convoluciones de Fourier, puede manejar áreas extensas sin artefactos severos.
- Resolución fija de entrada: acepta imágenes RGB de 512×512 y máscaras binarias de 512×512 (1 indica la región a rellenar).
- Salida compuesta: devuelve la imagen ya fusionada con la región no enmascarada, lista para usar.
- Ejecución on-device: optimizado para CPU mediante XNNPACK, sin necesidad de GPU.
- Paridad numérica: la variante fp32 tiene una correlación de 1.0 con el modelo eager original (diferencia máxima de 7.5e-06).
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Eliminación de objetos no deseados en fotografías: el usuario selecciona un objeto (persona, vehículo, etc.) con una máscara y el modelo lo rellena con el fondo circundante. Adecuado para aplicaciones de edición fotográfica móvil.
- Restauración de imágenes antiguas: rellena zonas dañadas, rasgaduras o manchas en escaneos de fotos históricas, preservando la textura y el color del entorno.
- Edición de imágenes en tiempo real en dispositivos móviles: al ser un modelo ligero (204.8 MB) y ejecutarse en CPU, puede integrarse en apps de cámara o galería para eliminar elementos no deseados al instante.
- Preprocesamiento para visión por computador: limpieza de imágenes antes de alimentar otros modelos (detección de objetos, segmentación) eliminando regiones irrelevantes o ruido.
- Creación de contenido para redes sociales: los usuarios pueden borrar marcas de agua, textos o elementos distractores de sus fotos antes de publicarlas.
- Automatización de flujos de diseño gráfico: integración en herramientas de diseño para retocar imágenes de producto, eliminando fondos o elementos no deseados de forma programática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye métricas de verificación de paridad frente al modelo eager:

| Metrica | Valor |
|---|---|
| max_abs_diff (fp32 vs eager) | 7.510e-06 |
| Correlacion (fp32 vs eager) | 1.000000 |
| Cobertura del delegate XNNPACK | 49.8% (2020/4056 ops) |
| Mediana de latencia en Mac arm64 (fp32) | 833.8 ms (referencia, no dispositivo final) |

No se proporcionan resultados de MMLU, HumanEval u otros benchmarks típicos de modelos de lenguaje, ya que se trata de un modelo de visión.

## Requisitos de hardware

- Almacenamiento: aproximadamente 204.8 MB para el archivo `.pte` (fp32).
- Memoria RAM: no se especifica, pero al ser un modelo de 512×512 con fp32, se estima que requiere al menos 1-2 GB de RAM para la inferencia (no confirmado).
- GPU: no necesaria; el modelo está optimizado para CPU mediante XNNPACK, pensado para dispositivos móviles y edge.
- Dispositivos compatibles: smartphones, tablets, Raspberry Pi y otros dispositivos con soporte para ExecuTorch y XNNPACK.
- Opciones de despliegue: integración directa en apps mediante ExecuTorch runtime; también se puede usar el modelo original en PyTorch para entornos con GPU.
- Latencia: la mediana en Mac arm64 (CPU) es de 833.8 ms para una imagen de 512×512, lo que sugiere que en dispositivos móviles podría rondar 1-2 segundos, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Resolucion | Licencia | Notas |
|---|---|---|---|---|---|
| LaMa-Inpainting-ExecuTorch (este) | ExecuTorch .pte | 204.8 MB | 512×512 fija | Apache-2.0 | Optimizado para CPU, on-device |
| LaMa original (advimman/lama) | PyTorch | ~200 MB (aprox.) | Variable (resolucion robusta) | Apache-2.0 | Requiere GPU para inferencia rapida |
| Stable Diffusion Inpainting | PyTorch / ONNX | ~2-4 GB | Variable (tipicamente 512×512) | CreativeML Open RAIL | Generativo, iterativo, mejor para contenido semantico complejo |

La comparativa se basa en información pública; no se dispone de benchmarks estandarizados que comparen directamente estos modelos en las mismas condiciones.

## Limitaciones y advertencias

- Tamaño de entrada fijo: el modelo solo acepta imágenes de 512×512; no se puede cambiar la resolución sin reconvertir el modelo (las matrices de FFT se construyen por tamaño).
- Sin soporte para int8: la versión cuantizada a int8 fue descartada por degradación visible (22 dB de pérdida), por lo que solo se ofrece fp32, lo que limita la eficiencia en dispositivos muy restringidos.
- Reemplazo de FFT: la transformada inversa de Fourier se implementa como multiplicación matricial, lo que puede introducir pequeñas diferencias numéricas (aunque la correlación es 1.0 en fp32).
- Modelo feed-forward: no genera contenido semántico complejo (como caras u objetos nuevos) de forma realista; para eso se necesitan modelos generativos como difusión.
- Sin capacidades de texto ni agentes: es exclusivamente un modelo de visión para inpainting.
- Sesgos y alucinaciones: al ser un modelo de visión, puede rellenar regiones con texturas o patrones que no coinciden exactamente con el contexto, especialmente en áreas con estructuras repetitivas o detalles finos.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda verificar los términos del modelo original (advimman/lama) y los pesos de smartywu/big-lama.

## Enlaces

- HuggingFace: https://huggingface.co/mlboydaisuke/LaMa-Inpainting-ExecuTorch
- Repositorio original de LaMa: https://github.com/advimman/lama
- Scripts de conversión ExecuTorch: https://github.com/john-rocky/executorch-models
- Paper de LaMa (WACV 2022): https://arxiv.org/abs/2109.07161 (no verificado en la búsqueda, pero es la referencia estándar)
