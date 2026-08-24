# RobertEcker/earshot-perch-v2

## Resumen

Earshot Perch v2 es una conversión a formato ONNX en precisión fp16 del clasificador de vocalizaciones de aves Perch 2.0 desarrollado por Google Research. El modelo original, presentado en el artículo "Perch 2.0: The Bittern Lesson for Bioacoustics" (arXiv:2508.04665), amplía el alcance del Perch original —entrenado exclusivamente con especies de aves— a un conjunto de datos multi-taxa que incluye aves, sonidos de arrecifes de coral y audio general. Este repositorio concreto, publicado por RobertEcker, empaqueta el modelo como artefacto para la aplicación Earshot, con un verificador de tamaño y SHA256 que fija los bytes exactos del archivo.

El modelo clasifica ventanas de audio de 5 segundos a una frecuencia de muestreo de 32 kHz, cubriendo 14.795 clases de vocalizaciones. Su relevancia radica en que ofrece tanto clasificación directa como embeddings transferibles para tareas de bioacústica, y su formato ONNX fp16 lo hace adecuado para despliegue en dispositivos con recursos limitados, como aplicaciones móviles o sistemas embebidos. La licencia Apache-2.0 permite uso comercial y modificación, lo que facilita su integración en proyectos de conservación e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Perch 2.0 de Google, encoder de audio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (ventana de audio de 5 segundos) |
| Tipos de cuantizacion | fp16 (ONNX) |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp16) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se detalla en la información proporcionada. Según el paper de Perch 2.0, el modelo se entrena mediante auto-destilación (self-distillation) sobre un conjunto de datos multi-taxa que combina vocalizaciones de aves, sonidos de arrecifes de coral y audio general. El modelo original de Google está disponible en Kaggle Models y fue diseñado para proporcionar clasificación supervisada de miles de especies vocalizadoras, además de embeddings robustos para aprendizaje por transferencia. La conversión a ONNX fp16 preserva la funcionalidad del modelo original, pero reduce el tamaño del archivo a aproximadamente 0.2 GB, lo que sugiere un modelo compacto apto para inferencia en dispositivos de baja capacidad.

## Capacidades

- Clasificación de vocalizaciones de aves en 14.795 clases, cubriendo una amplia gama de especies.
- Generación de embeddings de audio para tareas de aprendizaje por transferencia en bioacústica.
- Soporte para clasificación multi-taxa, incluyendo aves, sonidos de arrecifes de coral y audio general.
- Procesamiento de ventanas de audio de 5 segundos a 32 kHz, adecuado para grabaciones de campo.
- Formato ONNX fp16 optimizado para inferencia eficiente en CPU y GPU de baja potencia.
- Compatible con pipelines de audio-classification estándar de HuggingFace.

## Casos de uso

- Monitoreo automatizado de biodiversidad: el modelo puede procesar grabaciones de campo continuas para detectar y clasificar especies de aves presentes, facilitando censos de población y estudios de distribución sin intervención humana.
- Investigación ecológica y conservación: los embeddings generados por el modelo permiten entrenar clasificadores específicos para especies raras o regionales con pocos datos etiquetados, acelerando estudios de impacto ambiental.
- Aplicaciones móviles de identificación de aves: gracias a su formato ONNX fp16 y su tamaño reducido (~0.2 GB), el modelo puede integrarse en apps de campo que funcionan sin conexión, ofreciendo identificación en tiempo real a partir de micrófonos de smartphone.
- Análisis de audio ambiental en proyectos de ciencia ciudadana: plataformas como BirdNET pueden beneficiarse de este modelo para mejorar la precisión en la clasificación de vocalizaciones, especialmente en entornos con múltiples especies solapadas.
- Detección temprana de especies invasoras o en peligro: el modelo puede configurarse para alertar sobre la presencia de especies objetivo en grabaciones de larga duración, apoyando programas de gestión de hábitats.
- Evaluación de la salud de ecosistemas acuáticos: la capacidad de clasificar sonidos de arrecifes de coral permite monitorizar la actividad biológica de estos ecosistemas mediante hidrófonos, complementando los estudios de aves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original de Perch 2.0 reporta métricas de rendimiento en tareas de clasificación de vocalizaciones y transferencia de aprendizaje, pero no se incluyen cifras concretas en esta ficha. Se recomienda consultar el artículo arXiv para obtener datos comparativos.

## Requisitos de hardware

- El archivo ONNX fp16 ocupa aproximadamente 0.2 GB, por lo que la memoria necesaria para cargar el modelo en RAM/VRAM es de unos 200 MB, más overhead de inferencia.
- Puede ejecutarse en CPU (por ejemplo, un procesador moderno de portátil) con latencia aceptable para procesamiento por lotes de clips de 5 segundos.
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, Jetson Nano) puede manejar la inferencia sin problemas.
- Es adecuado para dispositivos edge como Raspberry Pi 4 o 5, siempre que se utilice una runtime ONNX optimizada (ONNX Runtime, OpenVINO).
- Opciones de despliegue: ONNX Runtime, TensorRT (para NVIDIA), OpenVINO (para Intel), o integración en aplicaciones móviles mediante CoreML (tras conversión) o ML Kit.
- No se dispone de datos de latencia o throughput específicos, pero al ser un modelo compacto, se espera una inferencia en el rango de decenas de milisegundos en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de clasificación de audio de aves (por ejemplo, BirdNET, BirdVox). Se recomienda consultar el paper de Perch 2.0 para comparaciones con modelos previos de Google y alternativas de la literatura.

## Limitaciones y advertencias

- El modelo está entrenado para ventanas de audio de 5 segundos a 32 kHz; grabaciones con otras duraciones o frecuencias de muestreo requerirán preprocesamiento.
- Aunque el entrenamiento incluye múltiples taxa, el enfoque principal sigue siendo las aves; la precisión en otros grupos (corales, mamíferos marinos) puede ser menor.
- El modelo puede presentar sesgos hacia especies con mayor representación en los datos de entrenamiento, lo que podría infravalorar especies raras o con vocalizaciones poco frecuentes.
- La clasificación directa está limitada a las 14.795 clases predefinidas; para especies fuera de este conjunto se recomienda utilizar los embeddings y entrenar un clasificador propio.
- No se garantiza un rendimiento óptimo en condiciones de grabación con alto ruido de fondo o baja relación señal-ruido, típicas en entornos naturales.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original de Google (disponible en Kaggle) por si hubiera restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RobertEcker/earshot-perch-v2
- GitHub de Google Research (Perch): https://github.com/google-research/perch
- Paper "Perch 2.0: The Bittern Lesson for Bioacoustics": https://arxiv.org/abs/2508.04665
- Página de Google Research sobre el paper: https://research.google/pubs/perch-20-the-bittern-lesson-for-bioacoustics/
- Artículo en HackerNoon: https://hackernoon.com/perch-20-bioacoustics-model-for-species-identification
- Discusión en BirdNET-Go sobre Perch v2: https://github.com/tphakala/birdnet-go/discussions/1110
