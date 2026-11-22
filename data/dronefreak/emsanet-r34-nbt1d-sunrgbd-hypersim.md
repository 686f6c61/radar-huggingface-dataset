# dronefreak/emsanet-r34-nbt1d-sunrgbd-hypersim

## Resumen

EMSANet (ResNet34-NBt1D) es una red neuronal para análisis multi-tarea de escenas RGB-D en interiores, desarrollada por el grupo de Neuroinformática y Robótica Cognitiva de la TU Ilmenau (Daniel Seichter et al.) y publicada en IJCNN 2022. Este repositorio concreto es un espejo no oficial de los pesos originales, que se distribuían vía Google Drive, y añade una copia en formato `safetensors` junto con un `config.json` que documenta la procedencia. Los pesos son idénticos a los oficiales.

El modelo resuelve simultáneamente cinco tareas sobre una misma escena: segmentación semántica, segmentación de instancias, segmentación panóptica, estimación de orientación de instancias y clasificación de escena. Lo hace a partir de dos modalidades de entrada (RGB y profundidad), combinando dos codificadores ResNet34-NBt1D mediante fusión basada en atención. Cuenta con 64,3 millones de parámetros y está entrenado sobre SUN RGB-D con 37 clases semánticas, partiendo de un preentrenamiento en ImageNet y posteriormente en Hypersim.

Su relevancia actual radica en que es una referencia compacta y eficiente para percepción 3D en interiores, un componente habitual en pipelines de robótica móvil, realidad aumentada y domótica. Al estar ahora disponible en el Hub con pesos en `safetensors`, se simplifica su integración en entornos de investigación que no pueden depender de descargas manuales desde Google Drive.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EMSANet: dos codificadores ResNet34-NBt1D (RGB y profundidad) con fusión basada en atención y cabezas multi-tarea |
| Parametros totales | 64.305.658 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica ventana de tokens; entrada de imagen RGB-D) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; admite pesos en FP32) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), PyTorch `.pth` (`r34_NBt1D_pre.pth`), checkpoints de preentrenamiento en `pretrained/` |

## Arquitectura y entrenamiento

EMSANet es una arquitectura de segmentación multi-tarea compuesta por dos ramas de codificación independientes, una para RGB y otra para profundidad, ambas basadas en ResNet34-NBt1D (una variante de ResNet34 adaptada para mapas de profundidad de un solo canal). Las características de ambas ramas se combinan mediante un mecanismo de fusión basado en atención, y sobre la representación fusionada se disponen cabezas específicas para cada tarea: semántica, instancias, panóptica, orientación de instancias y clasificación de escena. El diseño busca un equilibrio entre precisión y eficiencia computacional, adecuado para plataformas robóticas con recursos limitados.

El entrenamiento sigue una cadena de preentrenamiento en tres etapas: primero ImageNet sobre el codificador ResNet34-NBt1D, después Hypersim (dataset sintético de interiores fotorrealistas) sobre el conjunto EMSANet, y finalmente un ajuste fino sobre SUN RGB-D con 37 clases semánticas. El repositorio incluye los checkpoints intermedios (`pretrained/imagenet_r34_NBt1D.pth` y `pretrained/hypersim_r34_NBt1D_used_for_sunrgbd.pth`), lo que permite reproducir la cadena completa. No se documentan en la información disponible detalles sobre el número exacto de tokens o épocas, ni sobre el uso de RLHF/DPO (no aplicable a un modelo de visión).

## Capacidades

- Segmentación semántica densa de escenas interiores en 37 clases (suelo, pared, silla, mesa, cama, etc.).
- Segmentación de instancias: separa objetos individuales dentro de una misma clase.
- Segmentación panóptica: combina semántica e instancias en una única predicción coherente.
- Estimación de orientación de instancias (ángulo de rotación en el plano de la imagen).
- Clasificación de escena a nivel de imagen (tipo de habitación o entorno).
- Procesamiento conjunto de RGB y profundidad (RGB-D) con fusión por atención.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Robótica móvil de interior: el modelo proporciona un mapa semántico e instancias de los objetos del entorno a partir del par RGB-D de la cámara, lo que permite a un robot doméstico identificar obstáculos, muebles y superficies transitables con una sola pasada.
- Realidad aumentada: la segmentación panóptica y la orientación de instancias permiten anclar objetos virtuales sobre superficies reales (mesas, suelos) con orientación coherente, usando la predicción de orientación para alinear el contenido.
- Domótica y asistencia: clasificación de escena y segmentación semántica para inferir el tipo de habitación y los objetos presentes, habilitando automatizaciones contextuales (por ejemplo, encender luces de salón al detectar una escena de salón).
- Análisis de inventario en interiores: la segmentación de instancias permite contar y localizar objetos concretos (sillas, monitores, libros) en una estancia para tareas de auditoría o logística de almacén.
- Generación de datasets y anotación automática: el modelo puede preanotar imágenes RGB-D con máscaras semánticas y de instancias, reduciendo el coste de etiquetado manual en nuevos dominios antes del ajuste fino.
- Navegación asistida: combinado con un sistema de planificación, la salida semántica de suelo y obstáculos permite trazar rutas seguras en interiores para sillas de ruedas o robots de reparto.
- Investigación en percepción 3D: al incluir los checkpoints de preentrenamiento en ImageNet e Hypersim, sirve como punto de partida reproducible para experimentos de transferencia a otros datasets RGB-D de interiores.

## Benchmarks y rendimiento

Resultados reportados por los autores para este checkpoint (SUN RGB-D, 37 clases):

| Metrica | Valor |
|---|---|
| mIoU (semantica) | 48,47 |
| PQ (panoptica) | 52,84 |
| RQ | 60,67 |
| SQ | 86,01 |
| MAAE de orientacion | 14,10 |
| bAcc de escena | 57,22 |

No se han publicado en la información disponible resultados comparativos adicionales frente a otros modelos, ni curvas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 1-2 GB para los 64,3 M de parámetros más las activaciones de dos codificadores ResNet34 a resolución de imagen; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060/4060 o superiores para tiempo real; A100/H100 no son necesarias por el reducido tamaño del modelo, aunque pueden usarse para procesar lotes grandes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: el código oficial de TUI-NICR/EMSANet sobre PyTorch es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo). Es posible exportar a ONNX o TensorRT, pero no se documenta en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; el paper remite a las tablas de velocidad de inferencia del README oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EMSANet R34-NBt1D (este) | 64,3 M | RGB-D | Semantica, instancias, panoptica, orientacion, escena | Apache-2.0 | Hugging Face (espejo) y GitHub oficial |
| EMSANet R50-NBt1D (variante oficial) | no disponible en esta ficha | RGB-D | Las mismas | Apache-2.0 | GitHub oficial |
| Otros modelos de segmentacion RGB-D de interior | no disponible | RGB-D | Variable | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de alternativas comparables para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos a los originales, pero la integridad y el mantenimiento dependen del autor del mirror, no de TU Ilmenau.
- Entrenado exclusivamente en SUN RGB-D (37 clases de interiores): el rendimiento puede degradarse en dominios distintos (exteriores, escenas industriales, iluminación atípica).
- Requiere entrada RGB-D alineada; sin mapa de profundidad de calidad, la rama de profundidad y la fusión por atención pierden eficacia.
- Riesgo de confusión entre clases semánticamente próximas y de errores en objetos ocluidos o de pequeño tamaño, habitual en segmentación densa.
- No es un modelo generativo: no produce texto, no razona y no soporta agentes ni tool calling.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda citar el paper original y conservar los avisos de atribución a los autores.
- No se documentan sesgos específicos más allá de los derivados de la distribución del dataset de entrenamiento (entornos domésticos y de oficina occidentales).
- Para producción se recomienda validar en el dominio objetivo y, si es posible, ajustar fino con datos propios.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/dronefreak/emsanet-r34-nbt1d-sunrgbd-hypersim
- Paper (IJCNN 2022): https://arxiv.org/abs/2207.04526
- Codigo oficial: https://github.com/TUI-NICR/EMSANet
- Resultados y pesos oficiales: https://github.com/TUI-NICR/EMSANet#results--weights
- Dataset SUN RGB-D (espejo en el Hub): https://huggingface.co/datasets/dronefreak/SUN-RGBD
