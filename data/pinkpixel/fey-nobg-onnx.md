# PinkPixel/fey-nobg-onnx

## Resumen

PinkPixel/fey-nobg-onnx es un modelo ONNX autocontenido para eliminación de fondo y matting suave (soft-alpha) de imágenes, desarrollado por Feyn Inc y exportado por PinkPixel a partir del modelo original `feyninc/FeyNobg`. El modelo utiliza una arquitectura BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation) optimizada para flujos de trabajo de producción, y resuelve el problema de aislar el primer plano de una imagen generando una máscara de transparencia continua, en lugar de un recorte binario. Esto permite manejar con precisión elementos difíciles como cabello suelto, vidrio, piel translúcida o tejidos finos.

La relevancia de este modelo radica en su formato ONNX autocontenido: los pesos se ejecutan directamente con ONNX Runtime en CPU, GPU (CUDA, DirectML) y runtimes de borde (CoreML, WebGPU), sin necesidad de PyTorch, `transformers` ni la librería `nobg`. El archivo `model.onnx` pesa aproximadamente 1.1 GB y trabaja a una resolución nativa de 1024x1024, lo que lo hace adecuado para integración en aplicaciones de producción, pipelines de procesamiento por lotes y entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica contexto de texto) |
| Tipos de cuantizacion | No disponible (modelo en Float32) |
| Idiomas soportados | no disponible (modelo de imagen, no depende de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) |
| Resolucion nativa | 1024x1024 |
| Tamano del archivo | ~1.1 GB |
| Tensor de entrada | `image`: `[1, 3, 1024, 1024]`, Float32, RGB normalizado con estadisticas de ImageNet |
| Tensor de salida | `alpha`: `[1, 1, 1024, 1024]`, Float32, activacion Sigmoid, rango `[0.0, 1.0]` |
| Execution providers soportados | CPU, CUDA, DirectML, CoreML, WebGPU |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BiRefNet, un enfoque de segmentación dicotómica de alta resolución que utiliza referencias bilaterales para mejorar la precisión en bordes y detalles finos. La arquitectura fue presentada en el artículo "Bilateral Reference for High-Resolution Dichotomous Image Segmentation" (arXiv:2401.03407) por Zheng et al. (2024). FeyNobg incorpora esta base y la optimiza para la tarea específica de eliminación de fondo y extracción de máscaras alfa suaves en entornos de producción.

No se han proporcionado datos sobre el conjunto de datos de entrenamiento, el número de tokens (al ser un modelo de visión, no aplica) ni sobre procesos de RLHF/DPO. La información disponible indica que el modelo está afinado para e-commerce, retratos de estudio, diseño de recortes y condiciones de iluminación difíciles. La innovación técnica destacable de este repositorio es que los pesos se exportan a un único grafo ONNX autocontenido, lo que elimina la dependencia del framework original y permite ejecutar el modelo con ONNX Runtime en múltiples plataformas, incluyendo entornos de borde.

## Capacidades

- Eliminación de fondo de imágenes con máscaras alfa continuas (soft-alpha), no binarias.
- Matting de bordes finos: cabello suelto, piel translúcida, vidrio, fibras y tejidos finos.
- Generación de recortes con transparencia real (formato RGBA) a partir de imágenes RGB.
- Ejecución directa con ONNX Runtime en CPU, CUDA, DirectML, CoreML y WebGPU.
- Inferencia sin necesidad de PyTorch, `transformers` ni la librería `nobg`.
- Procesamiento por lotes (batch) de imágenes mediante la utilidad CLI incluida (`infer.py`).
- Redimensionado automático de la máscara de salida a las dimensiones originales de la imagen de entrada.
- Soporte para guardar únicamente la máscara de alfa en escala de grises (`--mask-only`).

## Casos de uso

- Fotografía de producto para e-commerce: el modelo permite generar recortes con transparencia limpia de artículos como ropa, calzado o accesorios, manteniendo bordes suaves en tejidos y materiales reflectantes. Se integraría en un pipeline de edición automática que sustituya el fondo por un color o escena personalizada.
- Retratos con cabello suelto para diseño gráfico: gracias al matting de alfa suave, el modelo aísla el cabello fino y los contornos complejos sin cortes duros, lo que resulta adecuado para carteles, campañas publicitarias y composiciones de estudio.
- Automatización de recortes en plataformas de impresión bajo demanda: el procesamiento por lotes de la CLI permite transformar cientos de imágenes de catálogo en PNG con fondo transparente de forma desatendida, reduciendo el tiempo de edición manual.
- Integración en aplicaciones móviles o de escritorio mediante CoreML o DirectML: el formato ONNX permite ejecutar el modelo en dispositivos Apple o en Windows con aceleración por GPU, sin necesidad de infraestructura de servidor, para funciones de recorte en tiempo real o edición local.
- Composición de vídeo y VFX: la máscara alfa continua facilita el matting de elementos translúcidos como vasos, botellas o telas finas, permitiendo integrarlos en escenas con otros fondos manteniendo la opacidad natural.
- Generación de máscaras de alfa para flujos de trabajo de fotografía creativa: el modo `--mask-only` produce una imagen en escala de grises que puede utilizarse como canal alfa en herramientas de edición como Photoshop, GIMP o Affinity Photo, ofreciendo control manual adicional.
- Preprocesamiento para modelos generativos o sistemas de visión: el recorte con fondo transparente puede alimentar modelos de difusión o clasificación que requieren un primer plano limpio y aislado, mejorando la calidad de las entradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque el blog oficial de Feyn Inc menciona que FeyNoBg "supera o iguala a los líderes actuales en ocho benchmarks", no se proporcionan cifras concretas en la documentación de este repositorio. Por tanto, no es posible presentar una tabla comparativa de rendimiento sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo pesa ~1.1 GB en Float32, por lo que se necesita al menos esa cantidad de memoria en GPU, más el overhead de ejecución de ONNX Runtime. En CPU, la memoria RAM requerida será similar.
- GPU recomendadas: no disponible. El modelo puede ejecutarse en cualquier GPU compatible con CUDA o DirectML, aunque no se especifican modelos concretos de GPU.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño del archivo, pero no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: ONNX Runtime en Python o C++, con execution providers de CPU, CUDA, DirectML, CoreML o WebGPU. También puede utilizarse la CLI incluida (`infer.py`) para inferencia por lotes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo es un export ONNX del modelo original `feyninc/FeyNobg`, por lo que su rendimiento debería ser equivalente al de ese modelo, pero no se ofrecen cifras de parámetros, benchmarks ni comparaciones con alternativas como rembg (U2-Net) o el BiRefNet original. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada. Como modelo de visión, su rendimiento puede variar según la distribución de las imágenes de entrada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir máscaras incorrectas en imágenes con fondos complejos, múltiples sujetos o elementos que se confunden con el primer plano.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo de imagen.
- Restricciones de licencia: la licencia del repositorio es Apache 2.0, que permite uso comercial. Sin embargo, se recomienda verificar también la licencia del modelo base `feyninc/FeyNobg` y de la arquitectura BiRefNet.
- El grafo ONNX no incluye el preprocesamiento completo (normalización, redimensionado) ni el postprocesado (resize de la máscara, composición RGBA); el usuario debe implementarlos según la documentación.
- La resolución nativa es 1024x1024. Si la imagen de entrada tiene una resolución muy superior, el modelo la redimensiona, lo que puede perder detalle en bordes finos.
- El modelo puede requerir ajustes en imágenes con iluminación extrema o fondos que comparten color con el sujeto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/PinkPixel/fey-nobg-onnx
- Modelo original de Feyn Inc: https://huggingface.co/feyninc/FeyNobg
- Librería `nobg`: https://github.com/feyninc/nobg
- Blog técnico de FeyNoBg: https://usefeyn.com/blog/feynobg/
- Anuncio en Hugging Face: https://huggingface.co/blog/feyninc/feynobg
- Repositorio de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Paper de BiRefNet: https://arxiv.org/abs/2401.03407
