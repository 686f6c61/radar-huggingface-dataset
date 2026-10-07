# SDoyez/AttentionUnet_5

## Resumen

AttentionUnet_5 es un modelo de segmentación semántica de imágenes basado en la arquitectura Attention U-Net, publicado por el usuario SDoyez en HuggingFace. El modelo está entrenado sobre el dataset Augmented_Dubai-Satellite_Image_segmentation, orientado a la segmentación de imágenes satelitales de la región de Dubái. La arquitectura Attention U-Net incorpora puertas de atención en las conexiones de salto (skip connections) del clásico U-Net, lo que permite al decodificador ponderar qué características del encoder son más relevantes en cada región de la imagen antes de reconstruir la máscara de segmentación.

El modelo se entrenó utilizando OpenML-core, un framework personal desarrollado por el propio autor como envoltorio (wrapper) sobre PyTorch. El repositorio incluye el código fuente en PyTorch (model.py) y los pesos exportados en formato ONNX, lo que facilita su despliegue en entornos de inferencia independientes del ecosistema PyTorch. El tamaño total del repositorio es de 0,1 GB, coherente con un modelo de segmentación de tamaño moderado.

Se trata de un modelo de visión por computador, no de un modelo de lenguaje, por lo que conceptos como longitud de contexto o capacidades multilingües no resultan aplicables. Su relevancia reside en el ámbito de la teledetección y el análisis geoespacial, donde la segmentación automática de coberturas del suelo (agua, carreteras, edificios) a partir de imágenes satelitales tiene aplicaciones directas en planificación urbana y monitorización medioambiental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Attention U-Net (encoder-decoder con skip connections y puertas de atencion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagenes) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y codigo PyTorch) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | ONNX; codigo fuente PyTorch en model.py |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura Attention U-Net, una variante del U-Net original en la que cada conexión de salto incorpora un módulo de atención (attention gate). Este mecanismo genera mapas de pesos que atenúan las activaciones irrelevantes del encoder antes de concatenarlas en el decoder, lo que mejora la localización de estructuras de forma y tamaño variable. Es una arquitectura habitual en segmentación médica y de teledetección.

El entrenamiento se realizó sobre el dataset Augmented_Dubai-Satellite_Image_segmentation, que contiene imágenes satelitales de Dubái con anotaciones de varias clases. La model card menciona explícitamente un desbalanceo de clases que afecta a agua (clase 0), carreteras (clase 2) y edificios (clase 3). El autor empleó OpenML-core, su propio framework de entrenamiento construido como envoltorio de PyTorch. No se especifican en la información disponible el número de épocas, la resolución de entrada, la estrategia de aumento de datos ni el número de imágenes del dataset.

## Capacidades

- Segmentación semántica de imágenes satelitales en múltiples clases (entre ellas agua, carreteras y edificios).
- Generación de máscaras de segmentación densas a nivel de píxel.
- Inferencia mediante formato ONNX, lo que permite despliegue en runtimes compatibles con ONNX Runtime.
- Reentrenamiento o fine-tuning a partir del código PyTorch incluido en el repositorio.
- No dispone de soporte de tool calling, function calling ni agentes.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión general, audio ni modo de pensamiento.
- No dispone de capacidades multilingües (no aplica).

## Casos de uso

- Segmentación de coberturas del suelo en imágenes satelitales: el modelo puede clasificar píxeles en categorías como agua, carreteras y edificios, útil para cartografía automática a partir de imágenes de satélite.
- Monitorización de expansión urbana: al detectar edificios y carreteras, permite comparar imágenes de distintas fechas y cuantificar el crecimiento de la superficie construida en una región.
- Análisis de masas de agua: la segmentación de la clase agua facilita el seguimiento de costas, embalses o inundaciones sobre imágenes satelitales de Dubái.
- Planificación de infraestructuras viarias: la detección de la clase carretera permite extraer redes viarias para estudios de movilidad y planificación.
- Preprocesado para sistemas GIS: las máscaras generadas pueden integrarse en flujos de trabajo de sistemas de información geográfica como capa vectorial o ráster.
- Base para fine-tuning en dominios similares: dado que el código PyTorch está disponible, el modelo puede reentrenarse sobre otros datasets de segmentación con esquema de clases equivalente.
- Prototipado en investigación de segmentación: sirve como referencia reproducible de Attention U-Net entrenado con OpenML-core para comparar con otras variantes.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el dataset Augmented_Dubai-Satellite_Image_segmentation (configuración «Modèle V1»):

| Modelo / Configuracion | Accuracy | IoU | Precision | Recall | F1-Score |
|---|---|---|---|---|---|
| Modèle V1 (Dubai dataset) | 0.9306 | 0.4971 | 0.7725 | 0.7417 | 0.7494 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K y similares no aplican a un modelo de segmentación de imágenes).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al desconocerse el número de parámetros y la resolución de entrada, no puede estimarse con rigor.
- GPU recomendadas: no disponible. Para un modelo de segmentación de tamaño moderado cabe esperar que una GPU consumer moderna sea suficiente, pero no hay datos confirmados.
- Compatibilidad con GPU consumer: probablemente sí, dado el tamaño del repositorio (0,1 GB), pero no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (formato ONNX incluido) y PyTorch (código model.py incluido). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (U-Net estándar, DeepLabV3+, SegFormer u otras variantes de segmentación) sobre el mismo dataset, por lo que no puede establecerse una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AttentionUnet_5 (SDoyez) | no disponible | no aplica | IoU 0.4971 en Dubai dataset | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor declara desbalanceo de clases (agua, carreteras, edificios), lo que puede penalizar el rendimiento en las clases minoritarias; el IoU global de 0,4971 sugiere margen de mejora en la delimitación precisa de objetos.
- El modelo está entrenado sobre un dataset específico de imágenes satelitales de Dubái; su generalización a otras regiones geográficas, sensores o condiciones de iluminación no está validada ni documentada.
- No se documentan sesgos concretos, pero al depender de un dataset único y localizado, cabe esperar sesgo geográfico y de dominio.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en las máscaras de segmentación, especialmente en clases infrarrepresentadas.
- Licencia MIT, que permite uso comercial y modificación siempre que se conserve el aviso de copyright y la licencia; conviene verificar las condiciones del dataset de entrenamiento, no especificadas en la información disponible.
- No se documentan detalles de entrenamiento (épocas, resolución, aumentos, partición train/val/test), lo que dificulta la reproducibilidad y la evaluación rigurosa.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SDoyez/AttentionUnet_5
- Repositorio del framework OpenML-core: https://github.com/sebastien-doyez2812/OpenML-core
