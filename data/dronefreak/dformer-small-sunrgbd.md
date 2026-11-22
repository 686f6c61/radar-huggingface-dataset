# dronefreak/dformer-small-sunrgbd

## Resumen

DFormer-S es un modelo de segmentación semántica RGB-D desarrollado por el grupo VCIP de la Universidad de Nankai (Bowen Yin, Xuying Zhang, Zhong-Yu Li, Li Liu, Ming-Ming Cheng y Qibin Hou), presentado en el artículo "DFormer: Rethinking RGBD Representation Learning for Semantic Segmentation" (ICLR 2024). El modelo resuelve el problema de la comprensión de escenas interiores combinando información de color (RGB) y profundidad (D) para asignar una clase semántica a cada píxel de la imagen.

La variante publicada en este repositorio es DFormer-S (Small), con 18,75 millones de parámetros, entrenada sobre el conjunto de datos SUN RGB-D. Se trata de un espejo no oficial (community mirror) de los pesos originales: el autor del repositorio redistribuye los pesos sin modificar y añade una copia en formato `safetensors` junto con un `config.json` que documenta arquitectura, dataset y procedencia.

Su relevancia radica en que ofrece un encoder RGB-D preentrenado en ImageNet-1K con profundidad y una cabeza decodificadora ligera, lo que lo hace adecuado para tareas de segmentación en robótica, realidad aumentada y análisis de interiores con requisitos computacionales moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFormer (encoder RGB-D + decoder ligero) |
| Parametros totales | 18.752.229 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (.pth, .pth.tar) |

## Arquitectura y entrenamiento

DFormer es una arquitectura específicamente diseñada para segmentación semántica RGB-D. El modelo combina un encoder preentrenado en ImageNet-1K con información de profundidad y una cabeza decodificadora ligera que produce el mapa de segmentación por píxel. La variante Small (DFormer-S) cuenta con 18,75 millones de parámetros totales, lo que la sitúa en el rango de modelos compactos para visión.

El modelo se ha entrenado sobre el dataset SUN RGB-D, un conjunto de escenas interiores con anotaciones semánticas densas. El encoder incluido en `pretrained/DFormer_Small.pth.tar` fue preentrenado con RGB-D sobre ImageNet-1K. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a segmentación semántica). El artículo original (arXiv:2309.09668) contiene los detalles completos del procedimiento de entrenamiento.

## Capacidades

- Segmentación semántica densa de escenas interiores a partir de pares RGB-D.
- Comprensión de escenas interiores (indoor scene understanding) con clases semánticas por píxel.
- Procesamiento conjunto de información de color y profundidad.
- Encoder RGB-D preentrenado en ImageNet-1K reutilizable para otras tareas de visión.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Segmentación de escenas interiores en robótica móvil: el modelo permite a un robot identificar suelo, paredes, muebles y obstáculos a partir de su cámara RGB-D, facilitando la navegación y la planificación de trayectorias en entornos domésticos.
- Realidad aumentada y virtual: la segmentación precisa de superficies y objetos permite anclar contenido virtual sobre elementos reales de una habitación, aprovechando la información de profundidad para mejorar la oclusión.
- Análisis de imágenes de interior para inmobiliaria: identificación automática de estancias y mobiliario en fotografías con profundidad para generar descripciones o planos semánticos.
- Preprocesado para modelos de reconstrucción 3D: el mapa de segmentación por píxel sirve como entrada para pipelines de reconstrucción y modelado tridimensional de interiores.
- Investigación en visión por computador: el encoder RGB-D preentrenado puede servir como inicialización para tareas downstream como detección de objetos o estimación de profundidad.
- Sistemas de asistencia a personas con discapacidad visual: descripción semántica del entorno doméstico a partir de sensores RGB-D para alertar sobre obstáculos y localizar objetos.
- Automatización de inventario en interiores: identificación de categorías de objetos y superficies en almacenes o viviendas mediante cámaras de profundidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| mIoU (SUN RGB-D, escala unica) | 50.0 |

Este resultado es el reportado por los autores originales para la variante DFormer-S sobre SUN RGB-D. No se dispone en la información proporcionada de comparaciones con otros modelos ni de resultados en otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: con 18,75 millones de parámetros, el modelo en precisión FP32 ocupa aproximadamente 75 MB de pesos; en FP16, unos 37 MB. La VRAM total necesaria depende del tamaño de la imagen de entrada y del batch, pero es modesta (típicamente por debajo de 2-4 GB para imágenes estándar).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090. Para entrenamiento o fine-tuning se recomienda al menos una RTX 3090 o A100.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: el modelo requiere el código oficial de DFormer (https://github.com/VCIP-RGBD/DFormer) para construir la red y cargar los pesos. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo). Es posible exportar a TorchScript u ONNX, aunque no se documenta en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de segmentación semántica RGB-D (parámetros, contexto, rendimiento, licencia y disponibilidad). La model card únicamente reporta el resultado propio (mIoU 50.0 en SUN RGB-D) sin tabla comparativa con alternativas.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos se redistribuyen sin modificar bajo licencia MIT, pero no constituyen una release oficial de los autores.
- El modelo está especializado en escenas interiores de SUN RGB-D; su rendimiento en escenas exteriores u otros dominios no está documentado.
- Requiere entrada RGB-D; sin el canal de profundidad, su funcionamiento no está garantizado ni documentado.
- Riesgo de degradación en condiciones de iluminación adversas, oclusiones o clases no representadas en el dataset de entrenamiento.
- No se han documentado sesgos específicos, pero al entrenarse sobre un dataset concreto puede heredar los sesgos de composición de SUN RGB-D.
- La licencia MIT permite uso comercial, pero se recomienda citar el trabajo original y verificar los términos del código oficial de DFormer.
- El checkpoint `.pth.tar` del encoder almacena argumentos de entrenamiento y debe cargarse con `weights_only=False`, lo que implica riesgos de seguridad al deserializar archivos pickle de origen no verificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del espejo.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/dformer-small-sunrgbd
- Paper (arXiv): https://arxiv.org/abs/2309.09668
- Repositorio oficial de código: https://github.com/VCIP-RGBD/DFormer
- Dataset SUN RGB-D (espejo en Hub): https://huggingface.co/datasets/dronefreak/SUN-RGBD
