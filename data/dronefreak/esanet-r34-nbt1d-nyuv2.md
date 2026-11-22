# dronefreak/esanet-r34-nbt1d-nyuv2

## Resumen

ESANet (Efficient Semantic Segmentation for Indoor Scene Analysis) es una red neuronal convolucional para segmentación semántica de escenas de interior a partir de imágenes RGB-D (color más profundidad). La arquitectura, publicada en ICRA 2021 por Daniel Seichter y colaboradores del laboratorio de Neuroinformática y Robótica Cognitiva de la TU Ilmenau, emplea dos codificadores ResNet34-NBt1D paralelos (uno para RGB y otro para profundidad) combinados mediante un módulo de fusión basado en atención. El modelo resuelve la tarea de asignar una etiqueta semántica a cada píxel de una escena interior, con 40 clases definidas por el dataset NYUv2.

El repositorio `dronefreak/esanet-r34-nbt1d-nyuv2` es un espejo no oficial de los pesos originales, que el equipo de la TU Ilmenau distribuía en Google Drive. Los pesos son idénticos a los publicados por los autores; el espejo añade una copia en formato `safetensors` y un `config.json` con metadatos de procedencia. Esto facilita la descarga reproducible vía `huggingface_hub` y la integración en pipelines que evitan dependencias de almacenamiento externo.

El modelo tiene 47.006.272 parámetros (aproximadamente 47 M) y un tamaño de repositorio de 0,6 GB. Su relevancia actual radica en que sigue siendo una referencia ligera y eficiente para percepción RGB-D en robótica móvil e interior, con licencia Apache-2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESANet: dos codificadores ResNet34-NBt1D (RGB y profundidad) con fusión por atención |
| Parametros totales | 47.006.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors`, `.pth` (PyTorch) |

## Arquitectura y entrenamiento

ESANet es una red totalmente convolucional con codificador-decodificador. El codificador está formado por dos ramas independientes ResNet34-NBt1D, una para la imagen RGB y otra para el mapa de profundidad. NBt1D hace referencia a la variante de bloques residuales con normalización por lotes y convoluciones 1D empleada en la implementación original. Las características de ambas ramas se combinan mediante un módulo de fusión basado en atención (attention-based fusion) que pondera la contribución de cada modalidad antes de pasar al decodificador, que reconstruye la segmentación a resolución completa. Los codificadores se inicializan con pesos preentrenados en ImageNet (incluidos en el repositorio como `pretrained/imagenet_r34_NBt1D.pth`).

El entrenamiento se realiza sobre NYUv2, un dataset de escenas interiores con 40 clases semánticas, usando las imágenes RGB y los mapas de profundidad correspondientes. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino posteriores como RLHF o DPO (no aplicables en un modelo de segmentación). La innovación técnica principal es la fusión multimodal por atención con un coste computacional contenido, orientada a despliegue en robótica. El paper reporta un mIoU de 50,30 en el conjunto de test de NYUv2.

## Capacidades

- Segmentación semántica densa de imágenes RGB-D de interiores con 40 clases (suelo, pared, muebles, objetos, etc.).
- Fusión multimodal RGB + profundidad mediante atención, lo que mejora la delimitación de objetos frente a modelos solo RGB.
- Inferencia eficiente: arquitectura ligera (47 M de parámetros) adecuada para sistemas embebidos y robótica.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa texto).
- Sin modo de razonamiento (thinking), visión general, audio ni otras capacidades fuera de la segmentación.

## Casos de uso

- Navegación de robots móviles en interiores: el modelo proporciona un mapa semántico por píxel que permite al robot distinguir suelo transitable, obstáculos y mobiliario, usando la fusión RGB-D para robustez ante iluminación variable.
- Asistencia a personas con movilidad reducida: integrado en sillas de ruedas autónomas, identifica superficies y obstáculos en tiempo real gracias a su bajo coste computacional.
- Reconstrucción y etiquetado de escenas 3D: las segmentaciones por fotograma se proyectan sobre nubes de puntos para generar mapas semánticos de viviendas u oficinas.
- Análisis de entornos domésticos para domótica: detecta tipos de superficie y objetos para activar rutinas (por ejemplo, identificar el suelo de la cocina frente al del salón).
- Preetiquetado de datasets de interior: acelera el etiquetado manual de nuevas imágenes RGB-D generando máscaras semánticas iniciales que un humano revisa.
- Investigación en percepción multimodal: sirve como baseline reproducible (pesos en `safetensors` vía Hub) para comparar nuevas arquitecturas de fusión RGB-D en NYUv2.
- Despliegue en hardware de borde: al tener 47 M de parámetros, puede ejecutarse en GPUs de consumo o aceleradores embebidos para tareas de percepción en tiempo real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| mIoU (NYUv2 test) | 50,30 |

El dato procede de la model card del espejo, que lo atribuye a los autores originales. No se han publicado en la información disponible resultados adicionales (por clase, latencia o comparativas numéricas con otros modelos).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 47 M de parámetros en FP32 el peso ronda los 190 MB, por lo que la VRAM necesaria es modesta (del orden de 1-2 GB incluyendo activaciones, estimación no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo está pensado para eficiencia, por lo que GPUs de consumo como RTX 3060/4090 son suficientes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 4 GB o más (estimación, no dato oficial).
- Opciones de despliegue: PyTorch con el código oficial de `TUI-NICR/ESANet`; exportación a ONNX o TensorRT no documentada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mIoU NYUv2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESANet (R34-NBt1D) | 47 M | no aplica | 50,30 | Apache-2.0 | Hugging Face (espejo) y GitHub oficial |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos numéricos de otros modelos de segmentación RGB-D para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos a los originales, pero la procedencia y el mantenimiento dependen del autor del espejo, no de la TU Ilmenau.
- El modelo está entrenado exclusivamente en NYUv2 (escenas interiores); su rendimiento fuera de ese dominio (exteriores, otros sensores) no está garantizado.
- Requiere pares RGB-D alineados; no funciona solo con RGB si se usa la configuración de dos ramas.
- No se documentan sesgos específicos, pero al entrenarse en un dataset académico de interiores puede reflejar la distribución de escenas y geografías de NYUv2.
- Riesgo de alucinación no aplica en el sentido de lenguaje, pero sí puede producir segmentaciones erróneas en clases poco representadas o con oclusiones.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda citar el paper original y respetar las condiciones de los pesos preentrenados en ImageNet.
- Para producción, conviene validar el modelo en el dominio objetivo y considerar el reentrenamiento con datos propios.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/esanet-r34-nbt1d-nyuv2
- Paper (arXiv): https://arxiv.org/abs/2011.06961
- Repositorio oficial: https://github.com/TUI-NICR/ESANet
- Dataset NYUv2 (espejo en Hub): https://huggingface.co/datasets/dronefreak/NYUv2
- Tabla de resultados oficial: https://github.com/TUI-NICR/ESANet#results--weights
