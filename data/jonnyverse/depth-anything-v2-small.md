# JONNYVERSE/depth-anything-v2-small

## Resumen

JONNYVERSE/depth-anything-v2-small es una conversión a formato ONNX del modelo Depth-Anything-V2-Small, desarrollado originalmente por el equipo Depth Anything. Su propósito es hacer compatible el modelo de estimación de profundidad monocular con la librería Transformers.js, permitiendo ejecutar inferencias directamente en el navegador o en entornos JavaScript sin necesidad de un backend de Python. El modelo base, Depth-Anything-V2-Small, es un modelo de estimación de profundidad que utiliza un encoder ViT-small y fue entrenado sobre 595 000 imágenes sintéticas etiquetadas y más de 62 millones de imágenes reales sin etiquetar, lo que le proporciona una gran robustez y capacidad de generalización.

Esta versión ONNX mantiene la misma arquitectura y pesos que el modelo original, pero empaquetados en un formato optimizado para la web. El repositorio tiene un tamaño de 0,3 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en aplicaciones de código abierto. La relevancia de este modelo radica en que permite llevar la estimación de profundidad en tiempo real a aplicaciones web, con un coste computacional reducido gracias al tamaño pequeño del encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-small (encoder) con decodificador DPT (Dense Prediction Transformer) |
| Parametros totales | no disponible (el modelo base Depth-Anything-V2-Small tiene aproximadamente 24,8 M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa imagenes) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX, no se especifican cuantizaciones) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (compatible con Transformers.js) |

## Arquitectura y entrenamiento

El modelo base Depth-Anything-V2-Small emplea un encoder ViT-small (Vision Transformer) con 64 características y canales de salida [48, 96, 192, 384], seguido de un decodificador DPT que produce mapas de profundidad densos a partir de una sola imagen. El entrenamiento se realizó en dos fases: primero con 595 000 imágenes sintéticas etiquetadas (con profundidad real) y después con más de 62 millones de imágenes reales sin etiquetar, utilizando técnicas de autoformación y consistencia temporal. Esta combinación permite al modelo capturar detalles finos y ser robusto ante variaciones de iluminación, textura y escenas complejas.

La conversión a ONNX se realizó mediante la herramienta Optimum de Hugging Face, manteniendo la arquitectura original y los pesos entrenados. No se introdujeron cambios en el modelo subyacente; únicamente se adaptó el formato para que pueda ser cargado por Transformers.js en entornos JavaScript. El repositorio incluye los pesos ONNX en una subcarpeta `onnx`, siguiendo las recomendaciones de Hugging Face para modelos web-ready.

## Capacidades

- Estimación de profundidad monocular: genera un mapa de profundidad por píxel a partir de una única imagen RGB.
- Inferencia en navegador: gracias al formato ONNX y a Transformers.js, puede ejecutarse directamente en JavaScript sin servidor dedicado.
- Procesamiento de imágenes de alta resolución: el modelo maneja imágenes de entrada variables, aunque el tamaño óptimo depende del encoder ViT-small.
- Robustez ante escenas complejas: entrenado con datos sintéticos y reales, muestra buen rendimiento en interiores, exteriores, objetos y texturas variadas.
- Compatibilidad con pipelines de Hugging Face: se integra con el pipeline `depth-estimation` de Transformers.js, facilitando su uso.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.

## Casos de uso

- Realidad aumentada en web: el modelo puede calcular la profundidad de la escena capturada por la cámara del dispositivo y usarla para colocar objetos virtuales de forma coherente con la perspectiva, todo en tiempo real dentro del navegador.
- Fotografía computacional: aplicaciones de edición de imágenes que necesitan separar el fondo del primer plano o aplicar efectos de desenfoque (bokeh) basados en profundidad, ejecutándose localmente en el cliente.
- Robótica educativa y prototipos: proyectos de robótica que requieren percepción de profundidad para evitar obstáculos o navegar, y que prefieren una solución ligera ejecutable en dispositivos con recursos limitados.
- Accesibilidad: herramientas que ayudan a personas con discapacidad visual a interpretar la distancia de los objetos, procesando la imagen de la cámara en el propio dispositivo sin enviar datos a un servidor.
- Automatización industrial ligera: inspección visual de piezas o medición de distancias en líneas de montaje, donde la estimación de profundidad puede integrarse en un panel de control basado en web.
- Investigación y prototipado rápido: investigadores que necesitan validar algoritmos de profundidad en el navegador o comparar resultados con otros modelos sin configurar un entorno Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de esta conversión ONNX no incluye métricas de rendimiento, y la model card original de Depth-Anything-V2-Small tampoco se ha proporcionado en detalle. Se recomienda consultar el repositorio oficial del modelo base para obtener datos comparativos (por ejemplo, en el conjunto de datos KITTI o NYUv2).

## Requisitos de hardware

- Al ser un modelo pequeño (encoder ViT-small), puede ejecutarse en CPU sin problemas, aunque la inferencia será más lenta que en GPU.
- Para uso en navegador, se recomienda un dispositivo con WebGL o WebGPU para acelerar la inferencia de ONNX mediante la librería ONNX Runtime Web.
- No se especifica VRAM mínima en la información disponible, pero por el tamaño del modelo (0,3 GB) y su arquitectura ligera, cabe en GPUs de consumo como una NVIDIA GTX 1060 o superior, e incluso en iGPUs modernas.
- Opciones de despliegue: Transformers.js (navegador o Node.js), ONNX Runtime Web, o cualquier runtime compatible con ONNX (por ejemplo, ONNX Runtime en Python).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del tamaño de la imagen de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Formato | Licencia | Uso web |
|---|---|---|---|---|---|
| JONNYVERSE/depth-anything-v2-small (este) | ViT-small + DPT | ~24,8 M (estimado) | ONNX | Apache 2.0 | Sí (Transformers.js) |
| depth-anything/Depth-Anything-V2-Small (original) | ViT-small + DPT | ~24,8 M | PyTorch | Apache 2.0 | No directo (requiere servidor) |
| Intel/dpt-large (MiDaS) | ViT-large + DPT | ~345 M | PyTorch | MIT | No directo |

La comparativa se basa en datos públicos del modelo base y de MiDaS, pero no se dispone de benchmarks comparativos en la información proporcionada. La principal ventaja de esta versión ONNX es su compatibilidad inmediata con el ecosistema JavaScript, mientras que el original requiere un backend Python.

## Limitaciones y advertencias

- El modelo es una conversión ONNX del original; no se han realizado pruebas adicionales de calidad sobre esta versión, por lo que podría haber pequeñas diferencias numéricas respecto al modelo PyTorch original.
- La estimación de profundidad es relativa, no absoluta: el modelo produce mapas de profundidad normalizados, no distancias métricas exactas.
- Puede fallar en condiciones extremas de iluminación, superficies reflectantes o texturas repetitivas, como cualquier modelo de profundidad monocular.
- No se proporcionan datos sobre sesgos o alucinaciones específicas, pero al ser un modelo visual, no genera texto y su riesgo de alucinación se limita a errores en la estimación de profundidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original por si hubiera restricciones adicionales.
- El repositorio indica que esta versión ONNX es una solución temporal hasta que WebML tenga más adopción; es posible que en el futuro se recomiende otro formato.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/depth-anything-v2-small
- Modelo base original: https://huggingface.co/depth-anything/Depth-Anything-V2-Small
- Repositorio GitHub de Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Herramienta Optimum para conversión ONNX: https://huggingface.co/docs/optimum/index
