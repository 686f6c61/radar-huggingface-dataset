# maximazzik/easy_sign-s3d-slovo

## Resumen

El modelo `maximazzik/easy_sign-s3d-slovo` es un conjunto de pesos ONNX de la arquitectura S3D (Separable 3D CNN) especializado en la clasificación de vídeo para el reconocimiento de lengua de signos rusa (RSL). Fue desarrollado originalmente por el equipo ai-forever dentro del proyecto open source [easy_sign](https://github.com/ai-forever/easy_sign), y posteriormente reempaquetado por el usuario maximazzik al dejar de estar disponibles los enlaces originales de almacenamiento. El repositorio incluye dos variantes: una demo con 1598 gestos (la misma que se distribuye en el repositorio easy_sign) y tres modelos entrenados sobre el dataset [Slovo](https://github.com/hukenovs/slovo) con 1001 clases, que aceptan secuencias de 32, 48 o 64 fotogramas.

La relevancia de este modelo radica en que permite realizar reconocimiento de gestos de lengua de signos rusa en tiempo real sobre CPU, gracias a su tamaño reducido (alrededor de 35 MB por archivo) y su formato ONNX, que facilita la integración en aplicaciones de accesibilidad, educación y traducción automática. Al ser de código abierto con licencia CC BY-SA 4.0, puede utilizarse y adaptarse libremente siempre que se mantenga la misma licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | S3D (Separable 3D CNN) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Lengua de signos rusa (RSL) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura S3D (Separable 3D CNN) es una red neuronal convolucional tridimensional que factoriza las convoluciones 3D en combinaciones de convoluciones espaciales y temporales, reduciendo el coste computacional respecto a las CNN 3D convencionales. Está diseñada para procesar clips de vídeo de entrada con forma `1×3×T×224×224`, donde `T` es el número de fotogramas (32, 48 o 64 según la variante). Los modelos se entrenaron sobre el dataset Slovo, que contiene 1001 clases de gestos de la lengua de signos rusa, y la versión demo se entrenó con 1598 gestos. No se dispone de información detallada sobre el proceso de entrenamiento (número de épocas, optimizador, aumentos de datos, etc.) en la documentación proporcionada.

## Capacidades

- Clasificación de vídeo para reconocimiento de gestos de lengua de signos rusa.
- Soporte de tres longitudes de secuencia de entrada: 32, 48 y 64 fotogramas, lo que permite ajustar el equilibrio entre precisión y latencia.
- Inferencia en CPU mediante ONNX Runtime u OpenVINO, sin necesidad de GPU.
- Salida de probabilidades sobre un vocabulario cerrado de gestos (1001 o 1598 clases según el modelo).
- Formato ONNX estándar, compatible con múltiples frameworks y entornos de despliegue.

## Casos de uso

- **Traducción automática de lengua de signos a texto**: el modelo puede procesar secuencias de vídeo capturadas por una cámara y transcribir los gestos a texto en tiempo real, facilitando la comunicación entre personas sordas y oyentes.
- **Subtitulado de vídeos con contenido en lengua de signos**: integrado en un pipeline de procesamiento de vídeo, permite generar subtítulos automáticos para vídeos que contienen interpretación en RSL.
- **Aplicaciones educativas para el aprendizaje de RSL**: un tutor interactivo puede evaluar si el alumno ejecuta correctamente un gesto comparando la salida del modelo con la clase esperada.
- **Sistemas de accesibilidad en servicios públicos**: quioscos o aplicaciones de atención al ciudadano pueden incorporar reconocimiento de gestos para que personas sordas puedan navegar menús o realizar peticiones sin necesidad de teclado.
- **Análisis de vídeo para investigación lingüística**: los investigadores pueden utilizar el modelo para anotar automáticamente corpus de vídeo en RSL, acelerando el estudio de la variación dialectal o la frecuencia de uso de gestos.
- **Entrenamiento de intérpretes**: el modelo puede servir como herramienta de autoevaluación para estudiantes de interpretación, proporcionando retroalimentación sobre la precisión de sus gestos.

## Benchmarks y rendimiento

La model card reporta la precisión media (mean accuracy) de los tres modelos entrenados sobre Slovo, evaluados presumiblemente en un conjunto de validación del mismo dataset. No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estándar de clasificación de vídeo.

| Modelo | Fotogramas (T) | Mean accuracy (%) |
|---|---|---|
| S3Dx32x1x1001 | 32 | 44.22 |
| S3Dx48x1x1001 | 48 | 52.28 |
| S3Dx64x1x1001 | 64 | 55.86 |

## Requisitos de hardware

- Los archivos ONNX tienen un tamaño de aproximadamente 34-37 MB, por lo que caben en cualquier dispositivo con almacenamiento básico.
- Inferencia en CPU: el modelo demo (32 fotogramas) está diseñado para ejecutarse en CPU con OpenVINO u ONNX Runtime, por lo que no requiere GPU.
- Puede desplegarse en dispositivos de bajo consumo como Raspberry Pi, ordenadores de sobremesa o servidores sin acelerador gráfico.
- Para las variantes de 48 y 64 fotogramas, el coste computacional aumenta ligeramente, pero sigue siendo viable en CPU moderna.
- Opciones de despliegue: ONNX Runtime, OpenVINO, o cualquier framework que soporte ONNX (TensorRT, etc.). No se han reportado latencias ni throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, en el ámbito del reconocimiento de lengua de signos existen otras propuestas como I3D, SlowFast o modelos basados en transformers de vídeo, pero no se han encontrado datos de comparación directa con este modelo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la lengua de signos rusa; no es aplicable a otras lenguas de signos sin reentrenamiento.
- El vocabulario es cerrado: solo reconoce las clases presentes en el dataset de entrenamiento (1001 o 1598 gestos). Gestos no incluidos serán clasificados erróneamente.
- La precisión media es moderada (máximo 55.86% en la variante de 64 fotogramas), lo que puede generar errores en entornos ruidosos o con variaciones de iluminación, vestimenta o velocidad de ejecución.
- No se han documentado sesgos específicos, pero al estar entrenado sobre un dataset concreto, puede presentar menor rendimiento con hablantes de diferentes regiones o estilos de signado.
- La licencia CC BY-SA 4.0 obliga a que cualquier obra derivada se distribuya bajo la misma licencia, lo que puede ser restrictivo para integraciones comerciales propietarias.
- No se proporcionan garantías de soporte ni mantenimiento; el repositorio original (easy_sign) es la fuente principal de actualizaciones.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/maximazzik/easy_sign-s3d-slovo)
- [Repositorio GitHub de easy_sign](https://github.com/ai-forever/easy_sign)
- [Artículo en Habr (en ruso)](https://habr.com/ru/companies/sberbank/articles/775688/)
- [Dataset Slovo en GitHub](https://github.com/hukenovs/slovo)
