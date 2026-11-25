# arthursilvadantas/NotavelAI

## Resumen

NotavelAI es un clasificador de imágenes basado en MobileNetV2, afinado completamente mediante transfer learning, que identifica billetes del real brasileño (R$ 2, 5, 10, 20, 50, 100 y 200) más una clase `fundo` que representa la ausencia de billete. Lo desarrolla el grupo DreamTeam del autor arthursilvadantas en el marco de la asignatura de Programación Móvil de la UFMS (Brasil) durante 2026, y su propósito es servir de motor de visión a una aplicación Android de asistencia para personas ciegas o con baja visión que anuncia en voz alta el valor del billete fotografiado, funcionando de forma totalmente offline en el dispositivo.

El modelo no es un LLM ni un transformer generativo: es una CNN de clasificación de imágenes de 8 clases, exportada a TensorFlow Lite float32 (8,9 MB en dispositivo) y a formato Keras. Su relevancia radica en el despliegue on-device con LiteRT en Android, en la inclusión explícita de una clase de rechazo (`fundo`) y en un umbral de confianza del 70 % por debajo del cual el sistema responde "no estoy seguro", una decisión de diseño crítica en tecnología asistencial, donde un falso positivo es peor que una abstención.

El repositorio ocupa 0,1 GB, acumula 290 descargas y se distribuye bajo licencia de uso exclusivamente académico y de investigación. Las cifras de precisión declaradas por el autor alcanzan el 95,6 % en fotos reales no vistas, aunque caen al 79,2 % en el conjunto más exigente de fotos tomadas con teléfono en escenas retenidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (preentrenada en ImageNet) con global average pooling, dropout 0.3 y capa densa softmax de 8 salidas; fine-tuning completo |
| Parametros totales | no disponible (MobileNetV2 estándar, sin cifra publicada en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada fija de 224×224×3) |
| Tipos de cuantizacion | float32 (TensorFlow Lite); no se documentan variantes int8 o float16 |
| Idiomas soportados | en, pt (etiquetas y documentación); la salida es una clase, no texto |
| Licencia | academic-use (uso académico y de investigación únicamente) |
| Formato de pesos | TensorFlow Lite float32 (`.tflite`) y Keras (`.keras`) |

Otras especificaciones relevantes: entrada `[1, 224, 224, 3]` en RGB float32 con valores 0–255 sin normalizar (la escala a [-1, 1] está dentro del modelo); salida `[1, 8]` de probabilidades en el orden `2, 5, 10, 20, 50, 100, 200, fundo`; tamaño en dispositivo de 8,9 MB.

## Arquitectura y entrenamiento

La arquitectura es una CNN de clasificación con backbone MobileNetV2 preentrenado en ImageNet y adaptado a 224×224. El entrenamiento se realizó en dos fases: una primera con el backbone congelado y solo la cabeza entrenable (Adam, learning rate 1e-3, parada en la época 23 con mejor época 17) y una segunda de fine-tuning de toda la red (learning rate 2e-5, parada en la época 24 con mejor época 18). Se aplicó early stopping con paciencia 6 conservando el menor `val_loss`, batch de 32, pesos de clase para compensar el desequilibrio y aumento de datos (rotación, zoom, volteo horizontal, brillo y contraste), que no forma parte del modelo exportado.

El conjunto de entrenamiento consta de 2.713 imágenes de seis fuentes: 1.142 del dataset Cédulas do Real de Kaggle (MIT), 500 del repositorio banknoteBrazil, 480 composites generados pegando recortes de billetes sobre escenas, 427 del BRL Dataset de Roboflow Universe (CC BY 4.0), 120 imágenes de la clase `fundo` (monedas, regiones vacías y COCO 2017) y 44 fotos tomadas y etiquetadas a mano por el grupo, incluyendo billetes de dólar estadounidense como `fundo`. Los splits de test definidos por los autores de Kaggle se mantuvieron fuera del entrenamiento, reservando la mitad de su test para validación.

La innovación técnica principal no está en la arquitectura, sino en el pipeline de decisión: preprocesado determinista (corrección de rotación EXIF, límite de 1024 px, recorte del cuadrado central, redimensionado bilineal sin antialias tipo `smart_resize`) y una política de abstención que solo anuncia un valor si la probabilidad supera el 70 % y la clase no es `fundo`.

## Capacidades

- Clasificación de imágenes en 8 clases: R$ 2, 5, 10, 20, 50, 100, 200 y `fundo` (sin billete de real).
- Detección implícita de ausencia de billete mediante la clase `fundo`, entrenada con monedas, fondos vacíos y billetes de otra divisa.
- Inferencia on-device y offline en Android mediante TensorFlow Lite / LiteRT, sin conexión de red.
- Abstención controlada: umbral de confianza del 70 % con respuesta "no estoy seguro" por debajo del mismo.
- Ejecución en Python con Keras para reentrenamiento, fine-tuning y evaluación.
- No soporta tool calling, agentes, razonamiento multi-step, generación de texto, visión general, audio ni modo thinking; es exclusivamente un clasificador cerrado de 8 clases.

## Casos de uso

- Asistencia a personas ciegas o con baja visión: la app captura una foto, el modelo clasifica el billete y el dispositivo anuncia el valor en voz alta; el tamaño de 8,9 MB y la inferencia local permiten funcionar sin conectividad, requisito habitual en entornos de accesibilidad.
- Verificación rápida de efectivo en comercios de pequeño tamaño: integrado en un TPV Android o en una app de mostrador, permite al personal confirmar el valor de un billete recibido sin depender de la red.
- Módulo de accesibilidad en apps bancarias o de pago: el clasificador puede incrustarse como componente LiteRT en una aplicación existente para añadir lectura de billetes a funciones de accesibilidad ya presentes.
- Educación y alfabetización financiera: aplicaciones didácticas que practican el reconocimiento de denominaciones del real con feedback inmediato y tolerancia a la abstención.
- Investigación en tecnología asistencial: el repositorio incluye `evaluation.csv`, `phone_predictions.csv` y curvas de entrenamiento, lo que facilita reproducir el pipeline y comparar con otras aproximaciones de clasificación de divisas.
- Prototipado de clasificación de billetes en regiones con divisas similares: el esquema de transfer learning sobre MobileNetV2 con clase de rechazo es reutilizable para otras monedas sustituyendo el dataset y las etiquetas.
- Filtro previo en pipelines de visión documental: la clase `fundo` permite descartar imágenes que no contienen billetes antes de pasarlas a un OCR o a un modelo mayor.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Tarea | Conjunto de evaluación | Split | Métrica | Resultado |
|---|---|---|---|---|
| Clasificación de billetes | Cédulas do Real (Kaggle), mitad retenida del test de los autores | test | Accuracy | 0,956 (129/135) |
| Clasificación de billetes | Cédulas do Real (Kaggle), conjunto extra de test de los autores | validation | Accuracy | 0,939 (62/66) |
| Clasificación de billetes | Fotos de teléfono propias de NotavelAI (escenas retenidas) | test | Accuracy | 0,792 (19/24) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje en la información disponible, dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del artefacto (8,9 MB en float32) y la arquitectura MobileNetV2 a 224×224, la huella es del orden de decenas de MB, apta para GPUs de gama baja y para CPU.
- GPU recomendadas: no se especifican; el caso de uso objetivo es la inferencia en el propio teléfono Android mediante LiteRT, no en servidor.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y también en CPU y en dispositivos móviles; el despliegue previsto es on-device.
- Opciones de despliegue: TensorFlow Lite / LiteRT en Android (formato usado por la app), Keras en Python para reentrenamiento y evaluación; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento se indica como no disponible. A continuación se comparan características estructurales con alternativas genéricas de la misma categoría (clasificación de imágenes on-device):

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NotavelAI | no disponible (MobileNetV2) | 224×224×3 | 95,6 % / 93,9 % / 79,2 % en sus tres conjuntos (declarado por el autor) | academic-use | Hugging Face, 290 descargas |
| MobileNetV2 ImageNet (base) | ~3,5 M (cifra estándar de la arquitectura) | 224×224×3 | no aplica a billetes (1000 clases ImageNet) | Apache 2.0 (upstream) | TensorFlow/Keras |
| EfficientNet-Lite0 | no disponible en la información | 224×224×3 | no disponible | Apache 2.0 (upstream) | TensorFlow Lite |
| ResNet-50 | no disponible en la información | 224×224×3 | no disponible | Apache 2.0 (upstream) | TensorFlow/Keras |

Las cifras de parámetros de los modelos base se incluyen solo como referencia arquitectónica; no se han publicado comparaciones directas de NotavelAI frente a estos modelos en la tarea de clasificación de billetes.

## Limitaciones y advertencias

- El propio autor califica el modelo como prototipo académico y advierte de que no es fiable como único método para comprobar dinero.
- La precisión cae al 79,2 % en el conjunto de fotos de teléfono en escenas retenidas, muy por debajo del 95,6 % del conjunto de test de Kaggle; el rendimiento en condiciones reales de uso es sensiblemente inferior.
- Licencia `academic-use`: queda restringido el uso comercial; cualquier despliegue en producción requeriría autorización expresa del autor.
- Riesgo de falsos positivos y confusiones entre denominaciones; el umbral del 70 % mitiga parte del problema mediante abstención, pero no lo elimina.
- La clase `fundo` se entrenó con un conjunto limitado (120 imágenes más 44 fotos propias), por lo que la detección de ausencia de billete puede generalizar mal ante fondos, divisas o condiciones de iluminación no representadas.
- El preprocesado es parte del contrato del modelo: recorte del cuadrado central, redimensionado bilineal sin antialias y valores 0–255 sin normalizar; desviarse de este pipeline degrada la precisión.
- El billete debe ocupar el centro de la foto; el modelo no está diseñado para detección ni localización de múltiples billetes en una escena.
- Sesgos conocidos: no se documentan análisis de sesgo por tipo de piel, iluminación, calidad de cámara ni condición del billete (arrugado, roto, desgastado); el dataset de entrenamiento procede mayoritariamente de fuentes brasileñas y de fotos de teléfono.
- Idiomas: la documentación está en inglés y portugués; la salida es una etiqueta de clase, sin generación de texto multilingüe.
- No se han publicado evaluaciones independientes que verifiquen las cifras del model-index (marcadas como `verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arthursilvadantas/NotavelAI
- Dataset Cédulas do Real (Kaggle, MIT): https://www.kaggle.com/datasets/karenalmeida340/cdulas-do-real
- Repositorio banknoteBrazil: https://github.com/joaofracasso/banknoteBrazil
- BRL Dataset (Roboflow Universe, CC BY 4.0): no disponible (enlace no incluido en la información proporcionada)
- COCO 2017: https://cocodataset.org/
- Licencia del modelo: archivo `LICENSE` dentro del repositorio de Hugging Face
