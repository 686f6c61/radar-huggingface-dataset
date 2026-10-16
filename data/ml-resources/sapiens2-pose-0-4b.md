# ml-resources/sapiens2-pose-0.4b

## Resumen

Sapiens2-0.4B-Pose es un modelo de estimación de pose humana (keypoint detection) desarrollado por Meta, distribuido aquí como espejo no oficial en el repositorio `ml-resources/sapiens2-pose-0.4b`. Se trata de un Vision Transformer de 24 capas, dimensión de embedding 1024 y 16 cabezas de atención, con 398 millones de parámetros en el backbone y 425.677.380 parámetros totales contando la cabeza de estimación de pose. La entrada se procesa a una resolución fija de 1024 × 768 píxeles con parches de 16 × 16, y el coste declarado es de 1,260 TFLOPs por imagen.

El modelo resuelve la detección de 308 puntos clave por persona, con una granularidad poco habitual: 274 keypoints faciales detallados más puntos de manos y pies, siguiendo el formato de keypoints de Sociopticon. Es un modelo *top-down*, es decir, requiere bounding boxes previas generadas por un detector de personas (la referencia oficial es RTMDet), y no realiza detección de personas por sí mismo.

Su relevancia radica en que forma parte de la familia Sapiens2, que escala desde 0,4 B hasta 5 B de parámetros manteniendo la misma tarea, lo que permite elegir el punto de equilibrio entre precisión y coste computacional. Al estar finetuneado desde el backbone preentrenado `facebook/sapiens2-pretrain-0.4b`, es directamente utilizable para investigación en visión centrada en humanos, animación sin marcadores, análisis deportivo o ergonomía, aunque su licencia personalizada (Sapiens2 License) condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Sapiens2 ViT backbone + cabeza de estimación de pose) |
| Parámetros totales | 425.677.380 (backbone: 0,398 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de resolución fija 1024 × 768) |
| Tipos de cuantización | no disponible (solo se distribuye safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni INT8) |
| Idiomas soportados | no aplica (modelo de visión; no procesa texto) |
| Licencia | Sapiens2 License (`license: other`), texto en el repositorio oficial |
| Formato de pesos | safetensors (`sapiens2_0.4b_pose.safetensors`, repo de 1,7 GB) |

Datos adicionales declarados en la model card: dimensión de embedding 1024, 24 capas, 16 cabezas de atención, patch size 16, resolución de inferencia 1024 × 768 (alto × ancho), FLOPs del backbone 1,260 T, tarea `pose`, pipeline `keypoint-detection`, librería `sapiens2`, modelo base `facebook/sapiens2-pretrain-0.4b`.

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión puro (ViT) con parches de 16 × 16, 24 bloques y dimensión oculta de 1024, al que se añade una cabeza específica de estimación de pose. A diferencia de los enfoques *bottom-up*, este checkpoint es *top-down*: recibe recortes de persona definidos por un detector externo (RTMDet en la configuración de referencia) y predice sobre cada recorte los 308 keypoints en el formato Sociopticon, que incluye 274 puntos faciales, además de manos y pies. El checkpoint se obtiene por finetuning del backbone preentrenado Sapiens2-0.4B sobre la tarea de pose.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (técnicas no aplicables a un modelo de visión de este tipo) ni sobre innovaciones de inferencia como decodificación especulativa. Tampoco se documentan en la información proporcionada detalles del preentrenamiento del backbone original ni técnicas de atención lineal o híbrida. La model card únicamente especifica el pipeline de finetuning (partiendo de `facebook/sapiens2-pretrain-0.4b`) y los requisitos de la demo oficial.

## Capacidades

- Estimación de pose humana *top-down* con 308 keypoints por persona, incluyendo 274 keypoints faciales detallados, manos y pies.
- Salida en el formato de keypoints de Sociopticon (`keypoints308.py` del repositorio oficial).
- Procesamiento de imagen a resolución 1024 × 768 con parches de 16 × 16.
- Integración con detectores de personas externos, con RTMDet como opción de referencia para generar las bounding boxes.
- Inferencia sobre imágenes de personas en escenarios de visión centrada en humanos.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades de generación de texto, código o matemáticas: no aplica.
- Modo de razonamiento explícito (*thinking mode*), visión general, audio: no disponible; el modelo está especializado exclusivamente en keypoints corporales/faciales.

## Casos de uso

- Animación y captura de movimiento sin marcadores: a partir de vídeo monocámara, el modelo extrae esqueletos con detalle facial y de manos, lo que permite conducir rigs de personajes sin trajes de captura; el nivel de detalle facial de 274 puntos es el principal valor diferencial frente a modelos de pose corporal estándar.
- Análisis deportivo y biomecánico: el modelo permite reconstruir la postura de atletas fotograma a fotograma para calcular ángulos articulares, simetrías y trayectorias; su resolución de entrada de 1024 × 768 favorece la precisión en extremidades y manos en gestos rápidos.
- Ergonomía y prevención de riesgos laborales: combinado con un detector de personas y una cámara fija en puesto de trabajo, permite estimar posturas (tronco, brazos, cuello) y generar alertas cuando se mantienen posiciones de riesgo durante un tiempo umbral.
- Teleoperación y robótica: los keypoints de manos y pies sirven como señal de entrada para retargeting hacia manos robóticas o avatares, con la ventaja de requerir solo una cámara RGB convencional.
- Realidad aumentada y avatares en tiempo real: el modelo puede alimentar la reconstrucción de un avatar articulado en aplicaciones de videollamada, filtros o entornos XR, siempre que se acepte el coste de un detector *top-down* previo.
- Producción audiovisual y VFX: sustitución o asistencia al rotoscoping mediante la generación automática de trayectorias de keypoints que después se refinan en el programa de composición.
- Rehabilitación y seguimiento clínico asistido: medición objetiva de rangos de movimiento en sesiones de fisioterapia, con la advertencia de que no es un dispositivo médico y requiere validación clínica antes de cualquier uso diagnóstico.
- Investigación en visión centrada en humanos: al ser un checkpoint abierto (con licencia propia), sirve como base para experimentos de finetuning en dominios específicos o como punto de comparación dentro de la familia Sapiens2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 425.677.380 parámetros: aproximadamente 1,70 GB en FP32, 0,85 GB en FP16/BF16, 0,43 GB en INT8 y 0,21 GB en INT4 (estas dos últimas no están documentadas oficialmente para este checkpoint).
- A la memoria de pesos hay que sumar las activaciones: 24 capas con dimensión 1024 y 3072 tokens de parche por imagen a 1024 × 768 generan un pico adicional estimado de 1 a 3 GB según el tamaño de lote; se recomienda reservar entre 6 y 8 GB de VRAM en FP16 para trabajar con lotes pequeños.
- Cabe en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 y RTX 4090 de 24 GB son suficientes; una GPU de 8 GB puede ser viable en FP16 con lote 1, y una de 4 a 6 GB requeriría cuantización no documentada.
- GPUs profesionales: A100, H100, L40S y similares no son necesarias por capacidad, pero resultan útiles para procesar vídeo a gran escala o lotes grandes.
- Opciones de despliegue: la vía documentada es el repositorio oficial `facebookresearch/sapiens2` (`pip install -e .`) con el script `./scripts/demo/keypoints308.sh`; no se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni exportación a ONNX/TensorRT en la información disponible.
- Latencia y throughput: no disponible. El único dato cuantitativo de coste es 1,260 TFLOPs por imagen a 1024 × 768, que sitúa el orden de magnitud en decenas de milisegundos por imagen en GPUs de gama alta, sin cifras oficiales publicadas.

## Comparativa con modelos similares

Comparativa dentro de la familia Sapiens2-Pose, según los datos de la model card:

| Modelo | Parámetros | FLOPs | Embed dim | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B-Pose (este) | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B-Pose | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B-Pose | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-5B-Pose | 5,071 B | 15,722 T | 2432 | 56 | 32 |

No se dispone de datos comparativos con alternativas externas de estimación de pose (por ejemplo, otros modelos *top-down* de la literatura) dentro de la información proporcionada, ni de métricas de precisión que permitan establecer una comparación cuantitativa entre variantes. La elección entre los cuatro tamaños debe basarse por tanto en el presupuesto de cómputo (de 1,260 T a 15,722 TFLOPs por imagen) y no en cifras de precisión publicadas.

## Limitaciones y advertencias

- Modelo *top-down*: no detecta personas por sí mismo. Requiere obligatoriamente un detector de bounding boxes externo (RTMDet en la referencia oficial); un fallo del detector implica una persona no procesada.
- Sesgos conocidos: no disponible. No se documenta la composición demográfica del dataset de entrenamiento ni evaluaciones de equidad, un aspecto crítico en modelos de pose facial y corporal.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el fenómeno análogo de predicción de keypoints plausibles en oclusiones o recortes parciales, especialmente en la región facial con 274 puntos, donde el modelo puede inferir posiciones no observables.
- Resolución de entrada fija de 1024 × 768: las personas pequeñas en la imagen o los recortes de baja resolución pueden degradar la precisión; no se documenta soporte para entradas de distinta relación de aspecto.
- Limitaciones de idioma: no aplica, el modelo no procesa texto.
- Licencia: Sapiens2 License (`license: other`), una licencia personalizada y no una licencia de código abierto estándar reconocida por la OSI. Las condiciones exactas de uso comercial no se detallan en la información disponible y deben verificarse en el texto enlazado antes de cualquier despliegue en producción.
- Repositorio espejo: `ml-resources/sapiens2-pose-0.4b` no es una publicación oficial de Meta. Los créditos corresponden a los autores originales y el repositorio declara mantener la licencia sin cambios, pero conviene usar `facebook/sapiens2-pose-0.4b` como fuente canónica.
- Uso previsto declarado: investigación en visión centrada en humanos y estimación de pose sobre imágenes de personas. No se declara apto para uso clínico, diagnóstico, vigilancia ni identificación biométrica de individuos.
- Riesgo de privacidad: al tratarse de un modelo de análisis de personas sobre imágenes o vídeo, su despliegue en producción debe cumplir el RGPD y la normativa aplicable en materia de videovigilancia y datos biométricos.
- Advertencia de fecha: los metadatos del repositorio indican fechas de creación en 2026 y un identificador de arXiv (2604.21681); no se ha podido contrastar esta información con fuentes independientes en la búsqueda realizada.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/ml-resources/sapiens2-pose-0.4b
- Repositorio oficial del checkpoint: https://huggingface.co/facebook/sapiens2-pose-0.4b
- Backbone preentrenado base: https://huggingface.co/facebook/sapiens2-pretrain-0.4b
- Colección Sapiens2 en HuggingFace: https://huggingface.co/collections/facebook/sapiens2
- Paper: https://arxiv.org/pdf/2604.21681
- Página del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Código fuente: https://github.com/facebookresearch/sapiens2
- Guía de estimación de pose: https://github.com/facebookresearch/sapiens2/blob/main/docs/POSE.md
- Configuración del formato de 308 keypoints: https://github.com/facebookresearch/sapiens2/blob/main/sapiens/pose/configs/_base_/keypoints308.py
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Detector RTMDet (referencia para bounding boxes): https://github.com/open-mmlab/mmdetection/tree/main/configs/rtmdet
