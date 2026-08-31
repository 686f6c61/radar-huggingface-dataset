# rdo1/euro-dashcam-vehicle-classifier

## Resumen

El modelo `rdo1/euro-dashcam-vehicle-classifier` es un clasificador de imágenes basado en visión por computador, desarrollado por el autor rdo1, que identifica la marca, modelo y generación de vehículos europeos a partir de recortes de imágenes obtenidos de dashcams (cámaras de salpicadero). Está diseñado para funcionar completamente offline, con un enfoque en la privacidad, ya que el sistema completo difumina matrículas por defecto (cumpliendo con el RGPD). El modelo utiliza una arquitectura ConvNeXt-Tiny con 28 millones de parámetros, entrenado desde cero con un conjunto de datos mixto de imágenes reales de dashcam y web. Su relevancia actual radica en ofrecer una solución de reconocimiento de vehículos específica para el mercado europeo, con 646 clases que incluyen generaciones, y con un rendimiento medido de forma honesta mediante un holdout de intersección para evitar contaminación en la evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (28M params) |
| Parametros totales | 28 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (solo se menciona PyTorch, sin cuantización explícita) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (state_dict en archivo .pt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ConvNeXt-Tiny, una variante moderna de red neuronal convolucional que incorpora mejoras como normalización por capas, kernels grandes y diseños de bloques inspirados en transformers, pero manteniendo la eficiencia de las CNN. Se entrena desde cero (no se usa transfer learning) con un conjunto de datos de aproximadamente 21,300 recortes reales de dashcam de ciudades europeas y 10,800 imágenes web, con un sobremuestreo de 5x. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de clasificación supervisada. La innovación principal es la metodología de evaluación: se utiliza un holdout de intersección (597 recortes reales de dashcam que ningún modelo ha visto) para evitar la contaminación en las comparaciones entre versiones.

## Capacidades

- Clasificación de vehículos europeos: identifica marca, modelo y generación entre 646 clases.
- Entrada de imagen: recibe un recorte RGB de 224×224 píxeles de un vehículo.
- Salida: logits de clase convertidos a probabilidades softmax.
- Funcionamiento offline: no requiere conexión a internet, ideal para entornos con restricciones de privacidad.
- Integración con sistema de privacidad: el sistema completo difumina matrículas en tiempo real y en grabaciones (GDPR).
- Test-time augmentation: se puede aplicar aumento de datos en inferencia (volteo horizontal y promediado de escala) para ganar ~1 punto de precisión.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente discriminativo de visión.

## Casos de uso

- Sistemas de peaje automático: el modelo puede identificar el tipo de vehículo (marca y modelo) a partir de imágenes de cámaras de tráfico, permitiendo tarifas diferenciadas sin intervención humana.
- Gestión de flotas de vehículos: en empresas de alquiler o logística, se puede usar para verificar automáticamente que el vehículo que entra en un parking corresponde al registrado, comparando la clasificación con la base de datos.
- Vigilancia de aparcamientos: integrado en cámaras de seguridad, detecta y clasifica vehículos para control de acceso o detección de vehículos no autorizados.
- Análisis de tráfico urbano: permite estudiar la composición del parque automovilístico de una ciudad (proporción de marcas, modelos, generaciones) a partir de grabaciones de dashcam, sin necesidad de procesar matrículas.
- Aplicaciones de seguros: en la gestión de siniestros, se puede usar para verificar el vehículo implicado a partir de fotos del asegurado, ayudando a detectar fraudes.
- Investigación académica en visión por computador: sirve como punto de partida para estudios sobre reconocimiento de vehículos en condiciones reales de dashcam (iluminación variable, oclusiones, etc.).

## Benchmarks y rendimiento

El autor proporciona una evaluación honesta sobre un holdout de intersección de 597 recortes reales de dashcam. Los resultados son los siguientes:

| Modelo | Top-1 | Top-5 |
|---|---|---|
| v19 (este modelo) | 57.2% | 79.7% |
| v20 | 56.5% | 79.4% |
| v21 | 54.7% | 77.9% |
| v22 | 53.7% | 79.9% |

Se indica que la aplicación de test-time augmentation (volteo horizontal + promediado de escala) añade aproximadamente +1 punto porcentual. No se proporcionan resultados en benchmarks estándar como ImageNet o CIFAR, ni comparaciones con otros modelos de clasificación de vehículos.

## Requisitos de hardware

- El modelo tiene 28 millones de parámetros, lo que en precisión FP32 ocupa aproximadamente 112 MB (28M × 4 bytes). Con cuantización a FP16 o INT8, el tamaño se reduce a ~56 MB o ~28 MB respectivamente.
- Es adecuado para ejecutarse en GPU de consumo como NVIDIA RTX 3060 o superiores, así como en Apple Silicon (el autor menciona que funciona offline en Apple Silicon, probablemente con Core ML o PyTorch MPS).
- También puede ejecutarse en CPU, aunque la inferencia será más lenta; para aplicaciones en tiempo real se recomienda GPU.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX, Core ML (para Apple), o mediante frameworks de inferencia como TensorRT o OpenVINO.
- No se proporcionan datos de latencia o throughput específicos, pero al ser una red ConvNeXt-Tiny, se espera una inferencia rápida (del orden de milisegundos en GPU moderna).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos de clasificación de vehículos europeos. Existen alternativas como `Jordo23/vehicle-classifier` (EfficientNet-B4, 8,949 clases de marca/modelo/año, entrenado en VMMRdb) o modelos genéricos de clasificación de objetos, pero no se han encontrado datos comparativos de rendimiento en el mismo conjunto de evaluación. La metodología de holdout de intersección es particular de este modelo, lo que dificulta la comparación directa con otros que usan splits aleatorios.

## Limitaciones y advertencias

- El rendimiento es moderado (57.2% Top-1 en el holdout), lo que indica que en condiciones reales de dashcam (oclusiones, baja iluminación, ángulos variados) puede fallar en una proporción significativa de casos.
- La evaluación se realizó solo sobre 597 imágenes, lo que limita la significancia estadística de los resultados.
- El modelo está entrenado específicamente para vehículos europeos; su rendimiento en vehículos de otras regiones (EE. UU., Asia) puede ser deficiente.
- No se proporcionan detalles sobre la composición exacta del dataset ni sobre posibles sesgos (por ejemplo, desbalance entre marcas o condiciones climáticas).
- La licencia MIT permite uso comercial, pero el autor no especifica si los datos de entrenamiento tienen restricciones adicionales; se remite a la dataset card para la procedencia y licencias.
- No se menciona soporte para otras tareas más allá de la clasificación de imagen; no es un modelo multimodal ni de generación.

## Enlaces

- HuggingFace: https://huggingface.co/rdo1/euro-dashcam-vehicle-classifier
- Dataset card (referenciada en la model card, no se proporciona URL directa)
- No se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.
