# dronefreak/dformer-large-sunrgbd

## Resumen

DFormer-L es un modelo de segmentación semántica RGB-D desarrollado por el grupo VCIP de la Universidad de Nankai (Bowen Yin, Xuying Zhang, Zhong-Yu Li, Li Liu, Ming-Ming Cheng y Qibin Hou), presentado en el artículo "DFormer: Rethinking RGBD Representation Learning for Semantic Segmentation" (ICLR 2024). El modelo resuelve la tarea de segmentación semántica de interiores combinando información de color (RGB) y profundidad (D) para asignar una clase semántica a cada píxel de una escena.

La variante alojada en este repositorio es un espejo no oficial (`community-mirror`) de los pesos oficiales publicados en el repositorio GitHub de VCIP-RGBD. Concretamente, se trata del checkpoint DFormer-L entrenado sobre el conjunto de datos SUN RGB-D, con 39.036.389 parámetros totales (39,0 M) y un mIoU de 52,5 a escala única reportado por los autores. Los pesos son idénticos a los originales; el repositorio añade únicamente una copia en formato `safetensors` y un `config.json` con metadatos de procedencia.

El modelo resulta relevante para quienes trabajan en comprensión de escenas de interior, robótica móvil, realidad aumentada o análisis de imágenes con sensores de profundidad, ya que ofrece un backbone RGB-D preentrenado en ImageNet-1K con profundidad más una cabeza decodificadora ligera, con licencia MIT y pesos redistribuibles. Al ser un modelo de visión y no un LLM, no dispone de ventana de contexto textual ni de soporte multilingüe en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFormer (DFormer-L): encoder RGB-D preentrenado en ImageNet-1K con profundidad + decodificador ligero |
| Parametros totales | 39.036.389 (39,0 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen RGB-D) |
| Tipos de cuantizacion | no disponible (pesos en FP32/FP16 según checkpoint; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (solo pesos), `SUNRGBD_DFormer_Large.pth` (checkpoint original) y `pretrained/DFormer_Large.pth.tar` (encoder) |

## Arquitectura y entrenamiento

DFormer es una arquitectura de segmentación semántica RGB-D que reformula el aprendizaje de representaciones a partir de pares RGB-profundidad. El modelo combina un encoder preentrenado en ImageNet-1K enriquecido con información de profundidad y un decodificador ligero que produce el mapa de segmentación por píxel. La variante Large (DFormer-L) es la de mayor capacidad de la familia y totaliza 39,0 M de parámetros.

El entrenamiento de esta variante se realiza sobre SUN RGB-D, un conjunto de datos de escenas de interior con anotaciones semánticas densas. El repositorio incluye además el encoder DFormer-L preentrenado en ImageNet-1K con profundidad (`pretrained/DFormer_Large.pth.tar`), que sirve como inicialización. No se detallan en la información disponible el número exacto de tokens de imagen, la composición completa del dataset ni si se aplicaron etapas de ajuste fino con RLHF/DPO (no aplicable en un modelo de visión). La innovación principal del trabajo es el diseño de representación RGB-D que aprovecha la profundidad como señal estructural para la segmentación.

## Capacidades

- Segmentación semántica densa de escenas de interior a partir de pares RGB-D (imagen de color + mapa de profundidad).
- Comprensión de escenas de interior: asignación de clases semánticas por píxel (suelo, pared, muebles, objetos, etc.).
- Aprovechamiento de la profundidad como modalidad complementaria al RGB para mejorar la delimitación de objetos.
- Backbone RGB-D preentrenado en ImageNet-1K con profundidad, reutilizable como extractor de características para otras tareas de visión.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).
- No dispone de modo "thinking", visión generativa, audio ni generación de texto.

## Casos de uso

- Segmentación de escenas de interior en robótica móvil: el modelo permite a un robot equipado con cámara RGB-D identificar suelo, paredes, muebles y obstáculos a nivel de píxel, facilitando la navegación y la planificación de trayectorias en entornos domésticos.
- Realidad aumentada y virtual: la segmentación densa RGB-D posibilita la oclusión correcta de objetos virtuales por elementos reales (por ejemplo, colocar un mueble virtual detrás de una mesa real) gracias a la información de profundidad.
- Análisis de imágenes de escáneres 3D y sensores de profundidad: integración en pipelines de reconstrucción de interiores para etiquetar semánticamente nubes de puntos proyectadas a vistas RGB-D.
- Automatización de inventario y análisis de espacios: identificación de categorías de objetos y superficies en fotografías de interiores para aplicaciones inmobiliarias o de facility management.
- Investigación en visión por computador: uso como baseline o modelo de referencia para experimentos de segmentación RGB-D, aprovechando el encoder preentrenado incluido en el repositorio.
- Preentrenamiento y transferencia: el encoder DFormer-L (`pretrained/DFormer_Large.pth.tar`) puede inicializar modelos para tareas relacionadas como detección de objetos o estimación de profundidad en interiores.
- Prototipado rápido en entornos con recursos limitados: con 39,0 M de parámetros, el modelo es ligero y puede ejecutarse en GPUs de consumo, lo que facilita pruebas y despliegues en estaciones de trabajo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| mIoU en SUN RGB-D (escala única) | 52,5 |

Este es el único resultado reportado por los autores en la información disponible. No se han publicado en la información proporcionada resultados comparativos adicionales (por ejemplo, frente a otros modelos RGB-D) ni métricas por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 39,0 M de parámetros, los pesos en FP32 ocupan aproximadamente 156 MB y en FP16 unos 78 MB; la VRAM total dependerá de la resolución de entrada y del tamaño de las activaciones, pero es previsible que quepa holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales.
- Opciones de despliegue: el modelo se carga con el código oficial de VCIP-RGBD/DFormer (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo). Es posible exportarlo a ONNX o TensorRT por cuenta del usuario, aunque no se proporcionan scripts en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mIoU SUN RGB-D | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFormer-L (este) | 39,0 M | Imagen RGB-D | 52,5 | MIT | Hugging Face (espejo) y GitHub oficial |
| DFormer-S / DFormer-B | no disponible | Imagen RGB-D | no disponible | MIT | GitHub oficial |
| Otros modelos RGB-D de segmentación | no disponible | Imagen RGB-D | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos comparables, por lo que la comparativa cuantitativa con otras arquitecturas RGB-D no está disponible.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos a los originales, pero el repositorio no está mantenido por los autores; para soporte o cambios debe acudirse al repositorio oficial de VCIP-RGBD.
- Modelo especializado en segmentación semántica de interiores: no es un modelo de propósito general y no genera texto, código ni razonamiento.
- Dependencia de la calidad de la profundidad: el rendimiento puede degradarse si el mapa de profundidad es ruidoso o proviene de sensores de baja calidad.
- Dominio limitado: entrenado sobre SUN RGB-D (escenas de interior); su generalización a exteriores u otras distribuciones no está garantizada.
- Riesgo de alucinación en el sentido de predicciones erróneas de clase en píxeles ambiguos u oclusiones; no se documentan métricas de calibración.
- Licencia MIT: permite uso comercial y redistribución, pero debe citarse el trabajo original y respetarse la atribución a los autores.
- El checkpoint `.pth.tar` del encoder almacena argumentos de entrenamiento y requiere cargarse con `weights_only=False`, lo que implica precauciones de seguridad al cargar pesos de terceros.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dronefreak/dformer-large-sunrgbd
- Repositorio oficial de código: https://github.com/VCIP-RGBD/DFormer
- Artículo (arXiv): https://arxiv.org/abs/2309.09668
- Dataset SUN RGB-D (espejo en el Hub): https://huggingface.co/datasets/dronefreak/SUN-RGBD
