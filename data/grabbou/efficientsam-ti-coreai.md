# grabbou/EfficientSAM-Ti-CoreAI

## Resumen

EfficientSAM-Ti-CoreAI es la exportación del modelo EfficientSAM ViT-Tiny (aproximadamente 10 millones de parámetros) al formato Apple Core AI, realizada por el desarrollador grabbou. EfficientSAM es un modelo de segmentación de imágenes desarrollado por Y. Xiong et al. que aprovecha el preentrenamiento con imágenes enmascaradas (masked image pretraining) para obtener un segmentador del estilo Segment Anything (SAM) con un coste computacional muy reducido. Este repositorio concreto no modifica los pesos originales: se limita a empaquetarlos para su ejecución nativa en iOS 27 y macOS 27 mediante la librería `coreai-models` de Apple.

El modelo resuelve la tarea de generación de máscaras (mask generation) a partir de un punto (un clic) o de una caja delimitadora sobre una imagen, devolviendo una máscara por prompt. Su relevancia actual reside en que permite llevar segmentación de imágenes tipo SAM a dispositivos Apple sin depender de infraestructura en la nube, con un bundle de solo 39 MB en float32 y forma estática, y con integración directa en aplicaciones React Native mediante `@react-native-ai/core-ai` o en Swift a través de `CoreAISegmentation`.

Es importante subrayar que se trata de un artefacto de despliegue, no de un modelo entrenado de nuevo: la arquitectura, el entrenamiento y las capacidades heredan íntegramente de EfficientSAM-Ti de yunyangx, mientras que este repositorio aporta únicamente el formato de pesos y el pipeline de exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientSAM ViT-Tiny (segmentador tipo SAM con encoder ViT-Tiny) |
| Parametros totales | aproximadamente 10 millones (según model card del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | float32 (único formato exportado, forma estática) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | bundle Core AI (`metadata.json` + modelo exportado); no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 0.0 GB (según Hugging Face); bundle del segmentador de 39 MB |
| Pipeline | mask-generation |
| Libreria | coreai |
| Modelo base | yunyangx/EfficientSAM |
| Plataformas | iOS 27, macOS 27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es EfficientSAM en su variante ViT-Tiny, un segmentador inspirado en Segment Anything que emplea un encoder de visión transformer de tamaño reducido. EfficientSAM se apoya en la técnica de masked image pretraining (SAMI, según el paper arXiv:2312.00863) para destilar las representaciones de un SAM de mayor tamaño en un modelo compacto, de modo que el segmentador resultante conserva buena parte de la calidad de SAM con una fracción del coste. El modelo acepta como prompt un punto o una caja y produce una máscara por prompt.

Este repositorio no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos detalles corresponden al modelo original y no se detallan en la model card proporcionada. La innovación técnica de esta ficha es puramente de despliegue: la exportación a Apple Core AI se realizó con el recipe de `apple/coreai-models` en el commit `09ff139` usando `coreai-core` 1.0.0b3, generando un modelo de forma estática en float32 que admite hasta dos puntos por prompt. No se mencionan técnicas como decodificación especulativa ni atención lineal, ajenas al dominio de segmentación.

## Capacidades

- Segmentación de imágenes por prompt de punto: el usuario indica un clic y el modelo devuelve la máscara del objeto correspondiente.
- Segmentación por caja delimitadora: se pasa un `box` con coordenadas y dimensiones y el modelo genera la máscara del objeto contenido.
- Hasta dos puntos por prompt en una misma consulta, según la configuración del bundle exportado.
- Una máscara por prompt, sin generación de múltiples máscaras candidatas por consulta.
- Ejecución nativa en iOS 27 y macOS 27 mediante `ImageSegmenter` de `CoreAISegmentation`.
- Integración en aplicaciones React Native a través de `@react-native-ai/core-ai` con la tarea `segmentation`.
- Integración en Swift mediante la API `ImageSegmenter(resourcesAt:)` y el método `segment(image:pointQuery:)`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por ser un modelo de visión especializado.

## Casos de uso

- Edición fotográfica en apps iOS: el usuario toca un objeto en la foto y la aplicación genera la máscara para recortarlo o aplicar ajustes locales, aprovechando la inferencia en dispositivo y el bundle de 39 MB.
- Eliminación de fondos en macOS: integrado en una app de escritorio, el modelo segmenta el sujeto a partir de una caja o un clic para sustituir el fondo sin subir la imagen a un servidor.
- Anotación asistida en herramientas de etiquetado: un anotador hace clic sobre un objeto y el modelo pregenera la máscara, reduciendo el tiempo de etiquetado en pipelines de datos para visión por computador.
- Funciones de realidad aumentada en iOS: segmentar en tiempo real el objeto seleccionado por el usuario para superponer efectos o mediciones, gracias a la ejecución local en el dispositivo.
- Aplicaciones React Native multiplataforma: usar `@react-native-ai/core-ai` para ofrecer segmentación interactiva en apps híbridas sin escribir código nativo específico de segmentación.
- Recorte selectivo en herramientas de diseño: permitir a un diseñador aislar un elemento de una captura o maqueta mediante un clic, con la máscara devuelta por el modelo.
- Procesamiento por lotes en macOS: segmentar objetos en lotes de imágenes locales con un script Swift que invoque `ImageSegmenter`, evitando costes de API en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de IoU, latencia ni comparaciones cuantitativas con otros segmentadores.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de GPU dedicada; el modelo está pensado para ejecutarse en el hardware unificado de dispositivos Apple (iPhone, iPad, Mac con chip Apple Silicon).
- El bundle ocupa 39 MB en float32, por lo que el consumo de memoria en inferencia es reducido y apto para dispositivos móviles.
- GPU recomendadas: no disponibles; el modelo se ejecuta a través del runtime Core AI de Apple, no mediante CUDA.
- No es compatible con GPU NVIDIA (A100, H100, RTX 4090) a través de este repositorio, ya que el formato de pesos es específico de Core AI.
- Opciones de despliegue: `coreai-models` (producto `CoreAISegmentation`), `@react-native-ai/core-ai` en React Native y la API Swift `ImageSegmenter`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientSAM-Ti-CoreAI | ~10 M | no aplica | Segmentación por punto/caja | Apache-2.0 | Hugging Face (bundle Core AI) |
| EfficientSAM (original, yunyangx) | ~10 M (variante Ti) | no aplica | Segmentación por punto/caja | Apache-2.0 | Hugging Face, GitHub |
| Segment Anything (SAM) | no disponible en la información | no aplica | Segmentación por prompt | Apache-2.0 (según versión) | Meta AI, Hugging Face |
| MobileSAM | no disponible en la información | no aplica | Segmentación por prompt | no disponible | Hugging Face, GitHub |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de exportación: no incorpora mejoras de entrenamiento ni ajuste fino respecto a EfficientSAM original; cualquier limitación del modelo base se hereda.
- Una sola máscara por prompt: no ofrece máscaras candidatas alternativas como otros segmentadores tipo SAM.
- Límite de hasta dos puntos por prompt en el bundle exportado, lo que restringe prompts con múltiples clics.
- Forma estática y float32: no hay versiones cuantizadas ni de forma dinámica en este repositorio.
- Dependencia de plataformas Apple: requiere iOS 27 o macOS 27 y el runtime Core AI; no es desplegable en Linux, Windows ni servidores con CUDA.
- Sin información sobre sesgos del dataset de entrenamiento original ni sobre su comportamiento en dominios alejados de las imágenes naturales.
- Riesgo de segmentación imprecisa en objetos ambiguos, oclusivos o de bajo contraste, inherente a los segmentadores por prompt.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias (`coreai-models`, `@react-native-ai/core-ai`) antes de distribuirlo en producción.
- El repositorio figura con 0 descargas y 0 likes, y un tamaño reportado de 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que el artefacto es de reciente publicación; conviene comprobar la disponibilidad de los ficheros antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/grabbou/EfficientSAM-Ti-CoreAI
- Modelo base: https://huggingface.co/yunyangx/EfficientSAM
- Repositorio EfficientSAM: https://github.com/yformer/EfficientSAM
- Paper EfficientSAM: https://arxiv.org/abs/2312.00863
- Repositorio apple/coreai-models: https://github.com/apple/coreai-models
- Librería React Native: https://github.com/callstackincubator/ai
