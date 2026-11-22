# dronefreak/esanet-r34-nbt1d-cityscapes-half

## Resumen

ESANet (ResNet34-NBt1D) es una red neuronal convolucional para segmentación semántica RGB-D, es decir, recibe simultáneamente una imagen en color y su mapa de profundidad y asigna una clase semántica a cada píxel. La arquitectura fue desarrollada por el grupo de Neuroinformática y Robótica Cognitiva de la TU Ilmenau (Daniel Seichter et al.) y presentada en el artículo "Efficient RGB-D Semantic Segmentation for Indoor Scene Analysis" (ICRA 2021). El modelo aquí descrito es un espejo no oficial de los pesos originales publicados en Google Drive, redistribuidos en Hugging Face junto con una copia en formato safetensors y un archivo de configuración.

El checkpoint concreto corresponde a la variante entrenada sobre Cityscapes con resolución mitad (1024x512) y 19 clases semánticas, partiendo de dos codificadores ResNet34-NBt1D preentrenados en ImageNet (uno para RGB y otro para profundidad) y una etapa de fusión basada en atención. Cuenta con 46.962.760 parámetros (aproximadamente 47 millones) y un tamaño de repositorio de 0,4 GB.

Su relevancia actual es la de un baseline ligero y bien documentado para percepción de escenas en robótica móvil y sistemas embebidos, donde el coste computacional importa tanto como la precisión. No es un modelo generativo ni un LLM: es un segmentador denso de propósito específico, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESANet: dos codificadores ResNet34-NBt1D (RGB y profundidad) con fusión basada en atención y decodificador de segmentación |
| Parametros totales | 46.962.760 (aprox. 47,0 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1024x512 en la variante "half") |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; al ser PyTorch estándar admite cuantización posterior con herramientas genéricas, sin garantías de precisión) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), PyTorch (`r34_NBt1D_half.pth`), y encoder ImageNet (`pretrained/imagenet_r34_NBt1D.pth`) |

## Arquitectura y entrenamiento

ESANet es una red totalmente convolucional con codificador dual. Cada modalidad (RGB y profundidad) se procesa con un ResNet34 modificado con normalización por lotes y activación t1D (NBt1D), inicializado desde pesos de ImageNet. Las características de ambos flujos se combinan mediante módulos de fusión con atención, que ponderan la información de color y de profundidad antes de alimentar un decodificador que recupera la resolución espacial y produce el mapa de segmentación denso con 19 clases.

El entrenamiento se realizó sobre Cityscapes con profundidad (dataset `cityscapes-with-depth`), en la configuración de resolución mitad (1024x512). La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino adicionales más allá del preentrenamiento en ImageNet; esos datos deben consultarse en el artículo y en el repositorio oficial. La innovación principal del trabajo es precisamente la eficiencia: lograr una fusión RGB-D competitiva con un coste computacional bajo, adecuado para plataformas robóticas.

## Capacidades

- Segmentación semántica densa de imágenes RGB-D en 19 clases de Cityscapes (carretera, acera, edificio, vegetación, cielo, persona, vehículo, etc.).
- Fusión multimodal RGB + profundidad mediante atención, lo que mejora la delimitación de objetos frente a segmentadores solo RGB.
- Inferencia a resolución 1024x512 (configuración "half"), pensada para un compromiso entre precisión y velocidad.
- Integración con el código oficial de evaluación (`eval.py`) y con el factory de modelos del repositorio TUI-NICR/ESANet.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente perceptivo.
- No dispone de modo "thinking", visión generativa, audio ni capacidades multilingües.

## Casos de uso

- Robótica móvil indoor: el modelo proporciona un mapa semántico por píxel a partir del par RGB + profundidad de una cámara RGB-D (por ejemplo, RealSense), lo que permite a un robot distinguir suelo transitable, obstáculos y personas en tiempo real.
- Navegación asistida y sillas de ruedas autónomas: la segmentación densa a 1024x512 alimenta planificadores de trayectoria que necesitan conocer la clase de cada región del entorno.
- Análisis de escenas de interior para automatización: inventariado de superficies (suelo, pared, mobiliario) en imágenes de vigilancia o de domótica, aprovechando la profundidad para separar objetos solapados.
- Evaluación comparativa de investigación: sirve como baseline reproducible de segmentación RGB-D con licencia Apache-2.0 y pesos verificables, útil para comparar nuevas arquitecturas de fusión.
- Prototipado en sistemas embebidos: con 47 M de parámetros y una variante a media resolución, es viable en GPUs de consumo y en plataformas con presupuesto térmico limitado, donde modelos más grandes no caben.
- Preetiquetado de datos: generar máscaras semánticas automáticas sobre nuevos datasets de interior para su posterior revisión y corrección manual, reduciendo el coste de anotación.
- Docencia y reproducción de resultados: el par de pesos originales más la copia safetensors permiten reproducir la métrica publicada sin depender de enlaces a Google Drive.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los reportados por los autores para esta variante:

| Metrica | Valor |
|---|---|
| mIoU (Cityscapes val, media resolucion 1024x512) | 75,22 |

No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, NYUv2, SUN RGB-D) ni comparativas numéricas con otros modelos en esta ficha. Las tablas completas de resultados y velocidades de inferencia están en el README del repositorio oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 47 M de parámetros en FP32, los pesos ocupan aproximadamente 188 MB; el consumo real depende del tamaño de lote y de las activaciones a 1024x512, por lo que se recomienda al menos 2-4 GB de VRAM para lotes pequeños.
- GPU recomendadas: cualquier GPU con soporte CUDA moderna. Para evaluación a resolución completa se recomiendan A100, H100 o RTX 4090; para la variante "half" bastan GPUs de gama media.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores, aunque no se han publicado mediciones oficiales de VRAM para esta variante.
- Opciones de despliegue: PyTorch nativo con el código oficial de TUI-NICR/ESANet; exportación a ONNX o TensorRT no está documentada en la información disponible. No es compatible con vLLM, llama.cpp ni Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; deben consultarse las tablas del repositorio oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mIoU Cityscapes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESANet R34-NBt1D (este) | 47,0 M | 1024x512 (half) | 75,22 (val) | Apache-2.0 | Hugging Face (espejo) y GitHub oficial |
| Otras variantes ESANet (R34/R50, resoluciones completas) | no disponible en esta ficha | no disponible | no disponible | Apache-2.0 | GitHub oficial |
| Segmentadores RGB-D alternativos (por ejemplo, familia SA-Gate, CMX) | no disponible en esta ficha | no disponible | no disponible | variable | variable |

La información proporcionada no incluye datos numéricos de modelos competidores, por lo que la comparativa cuantitativa con alternativas queda como no disponible. Cualquier comparación rigurosa debe hacerse contra las tablas del artículo original y de los repositorios de cada modelo.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos a los originales, pero la publicación no está avalada por los autores; para citas y soporte debe acudirse al repositorio TUI-NICR/ESANet.
- Entrenado exclusivamente en Cityscapes: el dominio son escenas urbanas de conducción. Su uso en interiores, aunque el artículo se oriente a análisis de escenas indoor, requiere validación propia, ya que la distribución de datos difiere.
- Requiere profundidad alineada con la imagen RGB; sin un sensor de profundidad o un modelo de estimación monocular fiable, el rendimiento se degrada y la fusión por atención pierde su ventaja.
- Las 19 clases de Cityscapes son fijas: no detecta categorías fuera de ese conjunto y no ofrece segmentación abierta.
- Riesgo de errores en píxeles ambiguos (bordes, objetos pequeños, oclusiones) y sensibilidad a condiciones de iluminación y a la calidad del mapa de profundidad.
- No se documentan sesgos demográficos ni geográficos específicos, pero al entrenarse con un dataset de ciudades europeas puede generalizar peor en entornos con arquitectura o vegetación distintas.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y atribución; conviene revisar también las condiciones de uso del dataset Cityscapes.
- No es un modelo de lenguaje: no debe emplearse para tareas de texto, razonamiento o generación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria sobre este espejo concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/esanet-r34-nbt1d-cityscapes-half
- Repositorio oficial de código y pesos: https://github.com/TUI-NICR/ESANet
- Tablas de resultados oficiales: https://github.com/TUI-NICR/ESANet#results--weights
- Artículo (arXiv): https://arxiv.org/abs/2011.06961
- Publicación ICRA 2021: Seichter, D., Köhler, M., Lewandowski, B., Wengefeld, T., Gross, H.-M., "Efficient RGB-D Semantic Segmentation for Indoor Scene Analysis", IEEE ICRA 2021, pp. 13525-13531.
