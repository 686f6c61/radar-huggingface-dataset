# allencbzhang/Mr.DETR

## Resumen

Mr. DETR es un modelo de detección de objetos basado en transformers, desarrollado por Chang-Bin Zhang, Yujie Zhong y Kai Han, de la Universidad de Hong Kong y Meituan Inc. Fue aceptado en CVPR 2025 y presentado en el paper "Mr. DETR: Instructive Multi-Route Training for Detection Transformers" (arXiv:2412.10028). El modelo aborda una limitación clave en el entrenamiento de detection transformers: la necesidad de incorporar asignaciones auxiliares one-to-many durante el entrenamiento para mejorar la convergencia sin afectar la inferencia.

La propuesta central trata el modelo como un marco multi-tarea que realiza simultáneamente predicciones one-to-one y one-to-many. El hallazgo empírico principal es que cualquier componente independiente del decoder (self-attention, cross-attention o feed-forward network) puede aprender ambas tareas simultáneamente, incluso compartiendo el resto de componentes. Esto conduce a un mecanismo de entrenamiento multi-ruta con una ruta primaria para predicción one-to-one y dos rutas auxiliares para one-to-many, que se eliminan durante la inferencia sin impacto en la arquitectura ni el coste de cómputo.

La implementación publicada en HuggingFace corresponde a la variante con backbone ResNet-50, entrenada durante 12 épocas con 900 queries, y el repositorio pesa 15,6 GB. El modelo se distribuye bajo licencia MIT y utiliza la librería detectron2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (Detection Transformer) con backbone ResNet-50 y decoder con atención multi-ruta |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

Mr. DETR se basa en la arquitectura DETR (Detection Transformer) estándar, compuesta por un backbone convolutional (ResNet-50 en la variante publicada) y un transformer decoder que opera sobre queries de objeto. La innovación principal reside en el mecanismo de entrenamiento multi-ruta: durante el entrenamiento, el modelo se trata como un marco multi-tarea que ejecuta simultáneamente predicciones one-to-one (la ruta primaria) y one-to-many (dos rutas auxiliares). Los autores investigaron sistemáticamente el papel de cada componente del decoder —self-attention, cross-attention y feed-forward network— en estas dos tareas, demostrando que cualquier componente puede aprender ambas de forma independiente.

El entrenamiento incorpora una self-attention instructiva novedosa que guía dinámicamente las queries de objeto para la predicción one-to-many. Las rutas auxiliares se eliminan por completo durante la inferencia, de modo que la arquitectura final y el coste computacional son idénticos a un DETR estándar. El modelo se entrenó sobre el dataset COCO 2017 val, según indica el badge de Papers With Code, aunque el número exacto de épocas para todas las variantes puede variar; la versión publicada en HuggingFace corresponde a 12 épocas con 900 queries. No se especifica si se emplearon técnicas adicionales como entrenamiento con datos aumentados o estrategias de escalado.

## Capacidades

- Detección de objetos en imágenes: localización y clasificación de objetos mediante bounding boxes.
- Segmentación de instancias: el proyecto anuncia soporte para segmentación de instancias desde abril de 2025, con código y pesos pre-entrenados disponibles.
- Entrenamiento multi-ruta: capacidad de entrenar con asignaciones one-to-one y one-to-many simultáneamente, mejorando la convergencia sin coste adicional en inferencia.
- Inferencia eficiente: la arquitectura en producción es idéntica a un DETR estándar, sin rutas auxiliares.
- Escalabilidad: el mecanismo de entrenamiento es agnóstico al backbone y se ha validado sobre varios baselines de DETR.

## Casos de uso

- Detección de objetos en escenas densas y concurridas: el modelo muestra mejoras consistentes en escenarios con alta densidad de objetos, como demuestran los vídeos de demostración publicados para escenas de calle y multitudes. Puede aplicarse a videovigilancia, análisis de tráfico o conteo de personas.
- Inspección visual en entornos industriales: la detección precisa de defectos o componentes en líneas de producción se beneficia de la mejora en convergencia y precisión que aporta el entrenamiento multi-ruta, sin incrementar la latencia en producción.
- Robótica y navegación autónoma: la detección de obstáculos y objetos relevantes en tiempo real es crítica; Mr. DETR ofrece precisión competitiva con coste de inferencia equivalente a DETR estándar, lo que facilita su integración en sistemas embebidos.
- Análisis de imágenes médicas: la detección de estructuras anatómicas o anomalías en radiografías, tomografías o resonancias magnéticas puede beneficiarse de la mejora en precisión media (AP) sobre COCO, aunque se requiere validación específica en el dominio médico.
- Búsqueda visual y organización de archivos: la detección de objetos en bibliotecas de imágenes permite etiquetado automático, indexación y recuperación por contenido, útil en gestión de activos digitales o redes sociales.
- Investigación en detección de objetos: al ser un método de entrenamiento agnóstico al modelo, sirve como base para investigar mejoras en convergencia de detection transformers y puede integrarse en pipelines de investigación sobre COCO u otros datasets.

## Benchmarks y rendimiento

La model card no publica resultados numéricos de benchmarks en la información disponible. El badge de Papers With Code enlaza a la tabla de estado del arte en object detection on COCO 2017 val, lo que indica que el modelo tiene resultados registrados en esa competición, pero los valores concretos no se incluyen en el README. No se dispone de comparaciones numéricas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible en la información publicada. Como referencia orientativa, un DETR con backbone ResNet-50 y 900 queries requiere típicamente entre 6 y 12 GB de VRAM en FP32 dependiendo del batch size, pero este dato no está confirmado para Mr. DETR.
- GPU recomendadas: no especificadas por los autores. Para entrenamiento se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090/4090, A100). Para inferencia, GPUs con 8-16 GB de VRAM deberían ser suficientes.
- Compatibilidad con GPU de consumo: probablemente sí para inferencia en GPUs de gama media-alta (RTX 3070 o superior), aunque no está confirmado oficialmente.
- Opciones de despliegue: el modelo se distribuye en formato PyTorch (.pth) con detectron2, por lo que el despliegue requiere el framework detectron2. No hay soporte nativo para vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerán del hardware y del batch size utilizado.

## Comparativa con modelos similares

| Modelo | Backbone | Queries | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mr. DETR (R50, 12ep) | ResNet-50 | 900 | no aplicable | MIT | HuggingFace, GitHub |
| DETR (original) | ResNet-50 | 100 | no aplicable | Apache 2.0 | GitHub oficial |
| Deformable DETR | ResNet-50 | 300 | no aplicable | Apache 2.0 | GitHub oficial |
| DINO | ResNet-50 | 900 | no aplicable | Apache 2.0 | GitHub oficial |

La comparativa se limita a la arquitectura base y disponibilidad, ya que no se dispone de resultados numéricos de Mr. DETR en la información proporcionada. La ventaja principal de Mr. DETR es su mecanismo de entrenamiento multi-ruta, que puede aplicarse sobre cualquiera de estos baselines para mejorar su convergencia sin coste adicional en inferencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre sesgos en los datos de entrenamiento. Como cualquier modelo entrenado en COCO, heredará los sesgos de ese dataset (distribución de objetos, contextos occidentales predominantes, etc.).
- Riesgo de alucinación: en detección de objetos, el riesgo equivalente son falsos positivos o bounding boxes incorrectamente localizados. No se han publicado tasas específicas de error.
- Limitaciones de contexto: al ser un modelo de visión, no procesa texto ni mantiene contexto conversacional. Su "contexto" se limita a la resolución de imagen de entrada.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, incluida la modificación y redistribución, siempre que se mantenga el aviso de copyright.
- Advertencias para producción: el modelo se distribuye en formato .pth de PyTorch, lo que requiere detectron2 para su uso. No se incluyen scripts de conversión a otros formatos (ONNX, TensorRT) en la información disponible. Los pesos publicados corresponden a una variante específica (R50, 12 épocas, 900 queries); otras configuraciones requieren consultar el repositorio de GitHub.
- El repositorio de HuggingFace contiene un único archivo de pesos (MrDETR_align_r50_12ep_900q.pth), sin código de inferencia ni documentación adicional en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allencbzhang/Mr.DETR
- Paper en arXiv: https://arxiv.org/abs/2412.10028
- Paper en HuggingFace: https://huggingface.co/papers/2412.10028
- Página del proyecto: https://visual-ai.github.io/mrdetr/
- Repositorio de código: https://github.com/Visual-AI/Mr.DETR
- Papers With Code (COCO 2017 val): https://paperswithcode.com/sota/object-detection-on-coco-2017-val?p=mr-detr-instructive-multi-route-training-for
- Vídeo demo (escena de calle): https://www.bilibili.com/video/BV1ThZnYxE5G/
- Vídeo demo (escena densa y concurrida): https://www.zhihu.com/zvideo/1890060966391153546
