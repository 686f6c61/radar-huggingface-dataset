# JONNYVERSE/depth-anything-small-hf

## Resumen

JONNYVERSE/depth-anything-small-hf es una conversión a formato ONNX del modelo Depth Anything V1 Small (LiheYoung/depth-anything-small-hf), diseñada específicamente para ser compatible con la librería Transformers.js. El modelo realiza estimación de profundidad monocular, es decir, predice un mapa de profundidad relativa a partir de una única imagen RGB, sin necesidad de cámaras estéreo ni sensores LiDAR. El repositorio tiene un tamaño de 0,4 GB e incluye los pesos ONNX en una subcarpeta `onnx`, siguiendo las recomendaciones oficiales de Hugging Face para despliegue web.

La relevancia de esta conversión radica en que permite ejecutar estimación de profundidad directamente en el navegador o en entornos Node.js, eliminando la dependencia de Python y de infraestructura de servidor. El modelo original, desarrollado por el equipo de Depth Anything (Lihe Yang et al.), utiliza una arquitectura DPT (Dense Prediction Transformer) con backbone ViT-S de aproximadamente 24,8 millones de parámetros, lo que lo hace adecuado para hardware de consumo y aplicaciones en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DPT (Dense Prediction Transformer) con backbone ViT-S |
| Parametros totales | ~24,8 millones (modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | ONNX fp32 (conversión directa sin cuantizar) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible en el repositorio; el modelo base usa Apache 2.0 |
| Formato de pesos | ONNX (compatible con Transformers.js) |

## Arquitectura y entrenamiento

El modelo base Depth Anything V1 Small emplea una arquitectura DPT (Dense Prediction Transformer) con un backbone ViT-S preentrenado con DINOv2. El decodificador DPT combina características de múltiples capas del transformer para producir un mapa de profundidad denso a resolución arbitraria. El entrenamiento del modelo original se realizó sobre un conjunto de 1,5 millones de imágenes con pseudo-etiquetas de profundidad generadas por modelos profesores, seguido de un ajuste fino en datasets de alta calidad como KITTI y NYUv2, tal como se describe en el artículo arXiv:2401.10891.

Esta conversión específica no modifica los pesos del modelo; simplemente los exporta a formato ONNX mediante la herramienta Optimum de Hugging Face, manteniendo la arquitectura y el comportamiento original. El repositorio está estructurado con los pesos ONNX en una subcarpeta `onnx`, siguiendo las recomendaciones oficiales para compatibilidad con Transformers.js. El ejemplo de uso incluido en la model card muestra la creación de un pipeline de `depth-estimation` y la generación tanto de un tensor de profundidad como de una imagen visualizable del mapa de profundidad.

## Capacidades

- Estimación de profundidad monocular: predice mapas de profundidad relativa a partir de una única imagen RGB.
- Inferencia en el navegador: gracias a la conversión ONNX y Transformers.js, el modelo puede ejecutarse en el cliente sin servidor.
- Inferencia en Node.js: compatible con entornos JavaScript del lado del servidor.
- Salida dual: genera tanto un tensor de profundidad (`predicted_depth`) como una imagen del mapa de profundidad (`depth`) lista para visualizar o guardar.
- Procesamiento a resolución variable: acepta imágenes de distintas dimensiones y produce mapas de profundidad a resolución proporcional.
- Ejecución en CPU: no requiere GPU, aunque el rendimiento mejora con aceleración WebGPU o WebGL.

## Casos de uso

- Edición de imágenes en el navegador: aplicaciones web de fotografía que necesitan desenfoque de fondo (efecto bokeh) o separación de planos, ejecutando la estimación de profundidad localmente en el cliente sin enviar imágenes a un servidor.

- Realidad aumentada web: experiencias AR basadas en navegador que requieren comprender la geometría de la escena para colocar objetos virtuales de forma realista sobre superficies detectadas.

- Visión robótica con Node.js: robots o drones que ejecutan JavaScript en su sistema de control y necesitan estimar distancias a obstáculos a partir de cámaras monoculares.

- Automatización de fotografía de producto: herramientas de post-procesado que generan automáticamente máscaras de sujeto o fondos reemplazables a partir del mapa de profundidad.

- Accesibilidad: aplicaciones que ayudan a personas con discapacidad visual a comprender la disposición espacial de su entorno mediante descripciones generadas a partir de mapas de profundidad.

- Prototipado rápido de sistemas de visión: investigadores que necesitan validar algoritmos de estimación de profundidad en JavaScript antes de migrar a implementaciones en Python o C++.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión ONNX en la información disponible. El modelo base Depth Anything V1 Small publicó resultados en los conjuntos KITTI y NYUv2 en el artículo original (arXiv:2401.10891), pero esta conversión no incluye datos de rendimiento propios.

## Requisitos de hardware

- Tamaño del repositorio: 0,4 GB (incluye pesos ONNX y posiblemente los pesos originales en safetensors).
- VRAM estimada: los pesos del modelo (~25 millones de parámetros en fp32) ocupan aproximadamente 100 MB, más el overhead de activaciones que depende de la resolución de entrada. En total, se estima entre 200 y 500 MB de memoria.
- GPU recomendadas: no se requiere una GPU específica; el modelo puede ejecutarse en CPU. Para aceleración en navegador, se recomienda WebGPU o WebGL.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño para ejecutarse en cualquier GPU consumer (GTX 1060 o superior) e incluso en CPU.
- Opciones de despliegue: Transformers.js en navegador o Node.js. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que es un modelo de visión y no un LLM.
- Latencia estimada: no disponible en la información proporcionada. Dependerá del hardware y del tamaño de la imagen de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Uso en navegador |
|---|---|---|---|---|
| JONNYVERSE/depth-anything-small-hf | ~24,8 M | ONNX | no disponible | Sí (Transformers.js) |
| Depth-Anything-V2-Small-hf | ~24,8 M | Safetensors | Apache 2.0 | No directamente |
| MiDaS (variante small) | ~21 M | Safetensors | MIT | No directamente |

El modelo base Depth Anything V1 Small es la primera versión de la serie Depth Anything. La versión V2 (Depth-Anything-V2-Small-hf) ofrece mejoras en detalle y robustez, pero no está disponible en formato ONNX para Transformers.js en este repositorio. MiDaS es una alternativa clásica para estimación de profundidad monocular, pero con menor precisión en escenas complejas.

## Limitaciones y advertencias

- La licencia del repositorio no está especificada, aunque el modelo base usa Apache 2.0. Se recomienda verificar los términos de uso antes de un despliegue comercial.
- El modelo estima profundidad relativa, no absoluta. Las distancias no son métricas y requieren calibración adicional para aplicaciones que necesiten mediciones exactas.
- Puede producir errores en imágenes con superficies reflectantes, transparentes o con patrones repetitivos.
- La conversión ONNX puede introducir ligeras diferencias numéricas respecto al modelo original en PyTorch debido al redondeo de operaciones.
- No se proporcionan datos de rendimiento específicos para esta conversión, por lo que se recomienda realizar pruebas de validación propias antes de usarlo en producción.
- El modelo no soporta video directamente; cada frame debe procesarse de forma independiente.
- La model card incluye un ejemplo de uso que referencia el repositorio `Xenova/depth-anything-small-hf` en lugar del repositorio actual, lo que puede causar confusión al seguir las instrucciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/depth-anything-small-hf
- Modelo base: https://huggingface.co/LiheYoung/depth-anything-small-hf
- Depth Anything V2 Small: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Artículo Depth Anything V1: https://arxiv.org/abs/2401.10891
- Artículo Depth Anything V2: https://arxiv.org/abs/2406.09414
- Documentación Transformers.js: https://huggingface.co/docs/transformers.js
- Optimum (conversión ONNX): https://huggingface.co/docs/optimum/index
