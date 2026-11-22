# dronefreak/esanet-r34-nbt1d-nyuv2-scenenet

## Resumen

ESANet (ResNet34-NBt1D) es una red neuronal convolucional para segmentación semántica de escenas interiores a partir de imágenes RGB-D. La desarrolló el grupo de Neuroinformática y Robótica Cognitiva de la TU Ilmenau (Daniel Seichter, Mona Köhler, Benjamin Lewandowski, Tim Wengefeld y Horst-Michael Gross) y se presentó en ICRA 2021 bajo el título "Efficient RGB-D Semantic Segmentation for Indoor Scene Analysis". El modelo combina dos codificadores ResNet34-NBt1D independientes, uno para la imagen en color y otro para el mapa de profundidad, fusionados mediante atención, y produce una segmentación densa sobre 40 clases semánticas de interiores.

Este repositorio concreto es un espejo no oficial de los pesos originales publicados por la TU Ilmenau en Google Drive. Los pesos son idénticos a los oficiales; el espejo añade una copia bit a bit en formato `safetensors` y un `config.json` con la procedencia. El checkpoint incluido corresponde al modelo entrenado sobre NYUv2 tras un preentrenamiento en ImageNet y un ajuste intermedio sobre SceneNet RGB-D, con 47.006.272 parámetros (47,0 M) y un mIoU reportado de 51,58 en el test de NYUv2.

Su relevancia actual es la de un modelo de referencia ligero y eficiente para percepción de interiores en robótica móvil y sistemas embebidos, donde el coste computacional importa tanto como la precisión. No es un modelo generativo ni un LLM: es un segmentador denso especializado, pensado para ejecutarse sobre imágenes RGB-D alineadas en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESANet: dos codificadores ResNet34-NBt1D (RGB y profundidad) con fusión por atención, decodificador de segmentación |
| Parametros totales | 47.006.272 (47,0 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto; procesa imágenes RGB-D de resolución fija según el pipeline de evaluación) |
| Tipos de cuantizacion | no disponible en la información proporcionada; al ser PyTorch estándar admite cuantización post-entrenamiento (FP16, INT8) mediante herramientas genéricas, pero no se documentan variantes publicadas |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`) y PyTorch (`r34_NBt1D_scenenet.pth`); incluye `pretrained/imagenet_r34_NBt1D.pth` |

## Arquitectura y entrenamiento

ESANet es una red totalmente convolucional con una topología de dos ramas. Cada rama emplea un codificador ResNet34 con bloques NBt1D (una variante de normalización por lotes con convoluciones 1D), uno para la modalidad RGB y otro para la profundidad. Las características de ambas ramas se combinan en un módulo de fusión basado en atención que pondera la información de cada modalidad antes de alimentar el decodificador, que reconstruye la segmentación a resolución completa. Esta separación de codificadores permite que cada modalidad aprenda representaciones propias antes de fusionarse, lo que mejora la precisión frente a la concatenación temprana de canales.

El entrenamiento sigue tres etapas: preentrenamiento del codificador sobre ImageNet, ajuste sobre SceneNet RGB-D (dataset sintético de interiores a gran escala) y ajuste final sobre NYUv2 con 40 clases semánticas. El checkpoint de este repositorio corresponde a esa última etapa. No se documentan en la información disponible detalles sobre el número exacto de tokens o imágenes de entrenamiento, la composición del dataset ni el uso de RLHF o DPO (no aplicable a un modelo de visión). La innovación principal es la eficiencia: el diseño busca un equilibrio entre precisión y velocidad de inferencia para su uso en robótica, con un coste de 47 M de parámetros.

## Capacidades

- Segmentación semántica densa de escenas interiores a partir de pares RGB-D alineados, con 40 clases de NYUv2.
- Fusión multimodal RGB + profundidad mediante atención, lo que mejora la delimitación de objetos y superficies frente a modelos solo RGB.
- Percepción de interiores orientada a robótica: suelo, paredes, muebles, objetos de uso doméstico y estructuras de la escena.
- Inferencia eficiente apta para hardware con recursos limitados, gracias a su tamaño contenido (47 M de parámetros).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de procesamiento de lenguaje.
- No incluye modo thinking, visión generativa, audio ni otras capacidades especiales más allá de la segmentación.

## Casos de uso

- Navegación de robots móviles en interiores: el modelo segmenta suelo, paredes, obstáculos y muebles a partir del par RGB-D del robot, proporcionando un mapa semántico denso que alimenta la planificación de trayectorias y la evitación de obstáculos en tiempo real.
- Asistencia a personas con movilidad reducida: en plataformas robóticas de asistencia, la segmentación de la escena permite identificar superficies transitables y objetos relevantes, mejorando la seguridad de la navegación autónoma.
- Reconstrucción y modelado semántico de interiores: integrado en pipelines de fotogrametría o SLAM denso, el modelo etiqueta cada píxel de la escena para generar mapas 3D semánticos de viviendas u oficinas.
- Realidad aumentada y virtual: la segmentación RGB-D permite insertar objetos virtuales con oclusión correcta respecto a la escena real, usando la profundidad para delimitar superficies.
- Automatización de tareas domésticas: un manipulador equipado con cámara RGB-D puede usar la segmentación para localizar la superficie de apoyo y los objetos a manipular antes de planificar el agarre.
- Análisis de accesibilidad de espacios: procesar imágenes de interiores para detectar barreras arquitectónicas (escalones, obstáculos) y evaluar la transitabilidad de rutas en edificios.
- Investigación en percepción RGB-D: como línea base reproducible y ligera para comparar arquitecturas de fusión multimodal en benchmarks de segmentación de interiores.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los reportados por los autores para el checkpoint de NYUv2:

| Metrica | Valor |
|---|---|
| mIoU (NYUv2 test) | 51,58 |

No se han publicado en la información disponible resultados comparativos adicionales (por clase, por velocidad de inferencia o frente a otros modelos) más allá de la tabla completa que el autor remite al README oficial del repositorio TUI-NICR/ESANet.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 47 M de parámetros; en FP32 ocupa aproximadamente 188 MB de pesos, y en FP16 alrededor de 94 MB. Sumando activaciones y buffers de inferencia, cabe holgadamente en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; para despliegue en producción se recomiendan NVIDIA RTX 3060/4060 o superiores, así como A100/H100 si se procesan muchos flujos en paralelo. También es viable en GPUs integradas o Jetson (Nano, Xavier, Orin) por su bajo coste computacional.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el código oficial es PyTorch; puede exportarse a TorchScript u ONNX para servir con ONNX Runtime, TensorRT o Triton Inference Server. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el README oficial del repositorio de la TU Ilmenau incluye tablas de velocidad de inferencia que no se recogen aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | mIoU NYUv2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESANet (ResNet34-NBt1D, este repo) | 47,0 M | RGB-D | 51,58 | Apache-2.0 | Hugging Face (espejo) y GitHub oficial |
| Alternativas de segmentación RGB-D de interiores | no disponible | RGB-D | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables de otros modelos comparables (parámetros, contexto, rendimiento o licencia) para construir una comparativa rigurosa. Se recomienda consultar las tablas del README oficial de ESANet para comparaciones con otras arquitecturas evaluadas por los autores.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación semántica de interiores; no es un modelo de lenguaje ni generativo, y no debe evaluarse con métricas de texto.
- El mIoU de 51,58 en NYUv2 es moderado: la segmentación de clases minoritarias u objetos pequeños puede ser imprecisa.
- Depende de la calidad y alineación del par RGB-D; descalibraciones entre cámara de color y de profundidad degradan el rendimiento.
- Entrenado sobre NYUv2 y SceneNet RGB-D, con dominio de interiores; el rendimiento en exteriores u otras distribuciones no está garantizado.
- Riesgo de sesgo de dominio: escenas, iluminación y mobiliario sobrerrepresentados en los datasets de entrenamiento pueden sesgar las predicciones.
- Es un espejo no oficial: los pesos son idénticos a los originales, pero la responsabilidad de mantenimiento y soporte recae en el autor del espejo, no en la TU Ilmenau.
- Licencia Apache-2.0, que permite uso comercial y modificación con atribución; conviene revisar los términos del repositorio oficial y citar el paper de ICRA 2021 según solicita el autor.
- No se documentan en la información disponible sesgos específicos medidos, tasas de alucinación (no aplicable) ni límites de idioma.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/dronefreak/esanet-r34-nbt1d-nyuv2-scenenet
- Código oficial de ESANet (TU Ilmenau): https://github.com/TUI-NICR/ESANet
- Paper (arXiv): https://arxiv.org/abs/2011.06961
- Dataset NYUv2 (espejo en el Hub): https://huggingface.co/datasets/dronefreak/NYUv2
- Resultados y pesos oficiales: https://github.com/TUI-NICR/ESANet#results--weights
