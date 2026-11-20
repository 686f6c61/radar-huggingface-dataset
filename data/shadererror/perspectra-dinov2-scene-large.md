# ShaderError/perspectra-dinov2-scene-large

## Resumen

Perspectra-dinov2-scene-large es una conversión a ONNX de los pesos de segmentación semántica de DINOv2 entrenados sobre el conjunto ADE20K, publicada por el usuario ShaderError bajo el paraguas del proyecto Perspectra. No se trata de un modelo de lenguaje ni de un modelo generativo: es un codificador visual DINOv2 (variante ViT-L/14) con una cabeza lineal de segmentación que clasifica cada píxel de una imagen en una de las 150 categorías de ADE20K. El repositorio contiene únicamente los artefactos ONNX listos para inferencia, con un tamaño total de 1,2 GB.

El modelo resuelve una tarea concreta y bien delimitada: segmentación semántica densa de escenas (interiores, exteriores, objetos cotidianos) a partir de una imagen RGB normalizada con estadísticas de ImageNet. La entrada esperada es un tensor float32 de forma [1, 3, 512, 512] y la salida es un mapa de puntuaciones [1, 150, 128, 128] en orden de clases basado en cero, lo que permite integrarlo directamente en pipelines de visión por computador sin dependencias de PyTorch.

Su relevancia actual es la de ofrecer una alternativa empaquetada en ONNX de los pesos oficiales de DINOv2 para ADE20K, lo que facilita el despliegue en entornos con ONNX Runtime (CPU, GPU o aceleradores) y en aplicaciones donde no se quiere arrastrar el stack completo de PyTorch. La licencia Apache 2.0 y la atribución a Meta Platforms son los puntos clave a tener en cuenta antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-L/14 (DINOv2) con cabeza lineal de segmentacion |
| Parametros totales | no disponible (el repositorio solo publica los pesos ONNX; el backbone ViT-L/14 de DINOv2 ronda los 300 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 512x512) |
| Tipos de cuantizacion | no disponible (solo se publican pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es DINOv2 en su variante ViT-L/14, un transformer de vision con parches de 14x14 píxeles y autoratención global, preentrenado por Meta con objetivos de autosupervisión (DINO + iBOT) sobre un corpus de imágenes a gran escala. Sobre ese backbone, el modelo original de Meta incluye una cabeza lineal de segmentación entrenada de forma supervisada sobre ADE20K, que es la que se ha convertido a ONNX en este repositorio. La información proporcionada no detalla el número exacto de tokens de entrenamiento, la composición del dataset más allá de ADE20K, ni si hubo etapas de ajuste fino adicionales.

La innovación técnica relevante aquí no está en el entrenamiento, sino en el empaquetado: la conversión a ONNX elimina la dependencia de PyTorch en tiempo de inferencia y permite ejecutar el modelo con ONNX Runtime. La resolución de entrada está fijada en 512x512 y la salida se reduce a 128x128, lo que implica un factor de submuestreo de 4x respecto a la entrada y obliga a reescalar las máscaras si se necesita resolución nativa. No se documentan en la información disponible técnicas como decodificación especulativa, atención lineal ni variantes híbridas.

## Capacidades

- Segmentación semántica densa de escenas en 150 clases de ADE20K (interiores, exteriores, mobiliario, vegetación, vehículos, personas, etc.).
- Extracción de características visuales de alta calidad gracias al backbone DINOv2 ViT-L/14, reutilizable para tareas aguas abajo (clasificación, retrieval, detección) si se accede a las activaciones intermedias.
- Inferencia en formato ONNX, ejecutable con ONNX Runtime en CPU, GPU CUDA, TensorRT o aceleradores compatibles.
- Entrada estandarizada: imagen RGB float32 normalizada con media y desviación típica de ImageNet, forma [1, 3, 512, 512].
- Salida estandarizada: tensor [1, 150, 128, 128] con puntuaciones por clase en orden basado en cero, listo para argmax y postprocesado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual y discriminativo.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Segmentación de escenas en interiores para realidad aumentada: el modelo clasifica paredes, suelo, muebles y objetos en una imagen 512x512, lo que permite anclar elementos virtuales sobre superficies detectadas en tiempo real con ONNX Runtime en el dispositivo.
- Etiquetado automático de datasets de visión: se puede ejecutar en lote sobre un corpus de imágenes para generar máscaras semánticas preliminares que luego se revisan manualmente, reduciendo el coste de anotación en proyectos de conducción autónoma o robótica.
- Preprocesado para pipelines de robótica móvil: la máscara de 150 clases permite distinguir suelo transitable, obstáculos y personas antes de pasarla a un planificador de navegación, con la ventaja de que el modelo ONNX se integra en stacks ROS 2 sin PyTorch.
- Moderación y análisis de contenido visual: detección de categorías sensibles (personas, vehículos, armas si estuvieran en ADE20K) en imágenes subidas por usuarios, usando la salida [1,150,128,128] para calcular proporciones de área por clase.
- Segmentación en aplicaciones de edición fotográfica: generación de máscaras por clase para sustituir fondos, aplicar desenfoque selectivo o ajustes de color por región, aprovechando que el modelo ya está entrenado sobre ADE20K con clases de mobiliario y exteriores.
- Extracción de características para búsqueda visual: usando las activaciones del backbone DINOv2 antes de la cabeza de segmentación, se pueden generar embeddings para sistemas de recuperación de imágenes por similitud sin necesidad de un modelo adicional.
- Control de calidad en agricultura o inspección industrial: segmentación de vegetación, suelo y estructuras en imágenes aéreas o de planta para estimar cobertura vegetal o detectar anomalías, siempre que las clases relevantes estén presentes en ADE20K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un ViT-L/14 en fp32 con entrada 512x512 requiere del orden de varios GB de memoria; el repositorio ONNX de 1,2 GB sugiere pesos en fp32 o fp16, pero no se confirma el tipo exacto.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del backbone, una GPU con al menos 8-16 GB de VRAM es un punto de partida razonable, pero no está confirmado por el autor.
- ¿Cabe en GPU consumer? No confirmado. Un ViT-L/14 en fp16 podría caber en GPUs consumer de gama alta (RTX 3090, RTX 4090, RTX 4080), pero no hay datos oficiales en la información disponible.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT, OpenVINO y cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Perspectra-dinov2-scene-large (este) | no disponible (ViT-L/14) | 512x512 fijo | Segmentacion semantica ADE20K (150 clases) | Apache 2.0 | ONNX |
| DINOv2 ViT-L/14 original (Meta) | ~300 M (no confirmado) | variable | Backbone visual + cabeza ADE20K | Apache 2.0 (con atribucion) | PyTorch |
| Segment Anything (SAM) | no disponible | variable | Segmentacion promptable (no semantica) | Apache 2.0 | PyTorch/ONNX |
| DeepLabv3+ (varias implementaciones) | variable | variable | Segmentacion semantica | variable | PyTorch/ONNX |

La comparación directa más justa es con el DINOv2 ViT-L/14 original de Meta, del que este repositorio es una conversión: misma arquitectura, mismos pesos de segmentación, pero empaquetado en ONNX. Frente a SAM, la diferencia clave es que SAM segmenta con prompts y no asigna clases semánticas, mientras que este modelo produce directamente 150 etiquetas ADE20K. Frente a DeepLabv3+, la ventaja es el backbone DINOv2, más moderno, aunque no hay benchmarks publicados en la información disponible que permitan cuantificar la diferencia.

## Limitaciones y advertencias

- Modelo puramente visual y discriminativo: no genera texto, no razona, no soporta agentes ni tool calling. Cualquier expectativa de un LLM es incorrecta.
- Resolución de entrada fija de 512x512 y salida de 128x128: las máscaras requieren reescalado para aplicaciones que necesiten resolución nativa, lo que introduce artefactos en bordes finos.
- El orden de clases es basado en cero y específico de ADE20K; un uso incorrecto del índice desplaza todas las etiquetas.
- Sesgos conocidos: los hereda de ADE20K y de DINOv2 (posible sesgo hacia escenas y objetos sobrerrepresentados en el dataset, menor cobertura de contextos no occidentales o poco frecuentes). No hay documentación específica en la información disponible.
- Riesgo de alucinación en sentido estricto no aplica (no es generativo), pero sí puede producir segmentaciones erróneas o confundir clases visualmente similares en imágenes fuera de dominio.
- Licencia Apache 2.0 con atribución explícita a Meta Platforms, Inc. y affiliates: es obligatorio conservar el aviso de copyright y la referencia al repositorio original de DINOv2 al redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad ni de mantenimiento continuo.
- No se documentan cuantizaciones oficiales ni versiones fp16/int8, lo que limita el despliegue en hardware con poca memoria.
- Al ser una conversión de terceros, no hay garantía de que los pesos ONNX reproduzcan exactamente el comportamiento del modelo PyTorch original; conviene validar numéricamente antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ShaderError/perspectra-dinov2-scene-large
- Modelos originales y licencia de DINOv2 (Meta): https://github.com/facebookresearch/dinov2/tree/7764ea0f912e53c92e82eb78a2a1631e92725fc8
- Repositorio principal de DINOv2: https://github.com/facebookresearch/dinov2
