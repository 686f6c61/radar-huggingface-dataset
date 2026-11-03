# brunopaiva15/iris

## Resumen

Iris 10 es un identificador offline de especies vegetales diseñado para ejecutarse en teléfonos móviles. Lo desarrolla brunopaiva15 como modelo independiente de la aplicación de cuidado de plantas Auxine, y se publica en Hugging Face para que pueda medirse y auditarse fuera de dicha aplicación. Resuelve un problema concreto: clasificar 1.567 especies de plantas a partir de una fotografía sin realizar ninguna llamada de red, con un coste de inferencia de aproximadamente 55 ms por imagen en un teléfono reciente.

Técnicamente no es un único modelo, sino una fusión de dos redes TensorFlow Lite. La primera, denominada Iris 9, es un clasificador MobileNetV3-Large con cabeza softmax de 1.569 salidas. La segunda es un codificador botánico FastViT-SA12 de 11,6 M de parámetros, destilado de BioCLIP 2.5, que proyecta cada imagen a un vector unitario de 1.024 dimensiones y lo compara contra una matriz de 2.404 vectores de referencia. La respuesta final combina ambas señales mediante la regla `p9^0.5 · p10^0.5` renormalizada.

Su relevancia actual radica en el despliegue en dispositivo: el paquete completo ocupa 37 MB, emplea pesos float16 y no requiere conectividad. Frente a soluciones basadas en API, elimina la latencia de red y los costes por consulta, a costa de una precisión inferior a la de los modelos vision-language de gran escala. La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusión de FastViT-SA12 (codificador) + MobileNetV3-Large (clasificador softmax) |
| Parametros totales | 11,6 M en el codificador FastViT-SA12; parámetros de MobileNetV3-Large no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada 320 × 320 × 3) |
| Tipos de cuantizacion | Pesos float16 en TFLite (no se documentan otras variantes) |
| Idiomas soportados | No disponible (las salidas son identificadores de especie y vectores) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | TFLite float16 (`iris10.tflite`, `plants.tflite`) + matriz de referencias binaria float16 little-endian |

## Arquitectura y entrenamiento

El sistema combina dos rutas de inferencia sobre la misma fotografía. La ruta del codificador emplea FastViT-SA12, una arquitectura híbrida de convoluciones y atención con 11,6 M de parámetros, seguida de un proyector lineal que produce un vector unitario de 1.024 dimensiones. Este codificador se destiló a partir de BioCLIP 2.5, un modelo de visión-lenguaje especializado en biología, lo que transfiere representaciones semánticas botánicas a una red lo bastante pequeña para móvil. La clasificación se realiza por comparación del vector con 2.404 vectores de referencia (al menos uno por especie) mediante similitud, no mediante una cabeza softmax entrenada de forma supervisada clásica.

La ruta del clasificador es un MobileNetV3-Large (Iris 9) con cabeza softmax de 1.569 salidas, entrenado de forma supervisada; su código de entrenamiento está publicado en el repositorio de GitHub del autor. Ambas redes reciben entradas de 320 × 320 × 3 pero con recetas distintas: el codificador espera valores en 0–1 y el clasificador en 0–255 con normalización interna en el grafo. La fusión aplica una máscara de contexto por especie y suma sinónimos (dos pares fusionados, de 1.569 a 1.567 especies). El peso de fusión (0,5) se eligió de forma idéntica en ambas mitades del benchmark. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO, dado que no es un modelo generativo.

## Capacidades

- Clasificación de imágenes de plantas en 1.567 especies, con identificadores internos mapeados a nombres científicos.
- Extracción de características visuales: el codificador produce un embedding de 1.024 dimensiones reutilizable para búsqueda por similitud o clustering.
- Fusión de dos señales independientes (softmax y recuperación por referencia) con umbral de aceptación configurable.
- Funcionamiento completamente offline, sin llamadas de red, adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Inferencia en dispositivo con latencia de aproximadamente 55 ms por fotografía en un teléfono reciente.
- Mecanismo de reserva: si los ficheros del codificador faltan o no superan la comprobación de control, Iris 9 responde solo con su propio umbral.
- No soporta tool calling, agentes, razonamiento multi-paso, ni modalidades de texto, audio o vídeo.

## Casos de uso

- Aplicaciones móviles de cuidado de plantas: integración del par de ficheros TFLite en una app iOS o Android para identificar la especie fotografiada y consultar cuidados asociados, sin coste de API ni latencia de red.
- Identificación en campo sin cobertura: uso en jardines botánicos, reservas naturales o agricultura extensiva donde no hay conectividad, gracias a los 37 MB de paquete y la inferencia local.
- Catalogación de colecciones botánicas: procesamiento por lotes de fotografías de herbario o invernadero para preetiquetar especies antes de la revisión humana, usando el umbral de aceptación para derivar los casos dudosos.
- Búsqueda visual por similitud: reutilización del embedding de 1.024 dimensiones para construir un índice vectorial de imágenes de plantas y recuperar ejemplares visualmente parecidos.
- Educación y divulgación: apps de aprendizaje botánico que identifican especies en tiempo real y muestran información asociada, con funcionamiento privado al no enviar imágenes a servidores.
- Filtrado previo en pipelines de biodiversidad: descarte o clasificación preliminar de imágenes de cámaras trampa o drones antes de un análisis más costoso con modelos mayores.
- Control de calidad en viveros: verificación de que la especie etiquetada en un lote coincide con la fotografía, con la comprobación de control del codificador como salvaguarda ante ficheros corruptos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el benchmark Iris de septiembre de 2026: 1.127 imágenes de plantas de interior y 2.000 de exterior, con máscara de contexto aplicada y sinónimos sumados.

| Top-1 | Interior | Exterior |
|---|---|---|
| Iris 9 solo | 0,8119 | 0,7620 |
| Codificador Iris 10 solo, sin máscara | 0,8429 | 0,8285 |
| Codificador Iris 10 solo, con máscara de contexto | 0,8598 | 0,8310 |
| Fusión, con máscara de contexto | 0,8651 | 0,8570 |

El autor advierte que estas cifras no son comparables con el 0,6876 top-1 publicado para Iris 9 solo, medido sobre 30.954 imágenes de plantas mayoritariamente silvestres y sin máscara, un benchmark distinto. Las mediciones se realizaron sobre el fichero float16 exportado, con una diferencia máxima de 0,05 puntos respecto a los pesos de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está pensado para ejecución en CPU móvil. El codificador ocupa 23,4 MB y el clasificador 9,0 MB en float16, más 4,9 MB de referencias.
- GPU recomendadas: no se documentan; el despliegue objetivo es CPU de teléfono mediante el intérprete LiteRT (antes TensorFlow Lite).
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso; puede ejecutarse en cualquier equipo con CPU moderna a través de LiteRT.
- Opciones de despliegue: `ai-edge-litert` (intérprete de LiteRT) en Python, Android e iOS; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TFLite de visión.
- Latencia y throughput: aproximadamente 55 ms por fotografía en un teléfono reciente, según el autor; no se publican cifras de throughput por lote ni de latencia en otros hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Especies | Despliegue | Licencia |
|---|---|---|---|---|---|
| Iris 10 | FastViT-SA12 + MobileNetV3-Large, fusión | 11,6 M (codificador) | 1.567 | TFLite en dispositivo | CC-BY-4.0 |
| BioCLIP 2.5 (modelo fuente de la destilación) | Modelo visión-lenguaje biológico | No disponible | Amplio dominio biológico | Servidor/GPU | No disponible en la información |
| Iris 9 | MobileNetV3-Large | No disponible | 1.569 salidas | TFLite en dispositivo | CC-BY-4.0 |

No se dispone en la información proporcionada de datos de benchmarks de BioCLIP 2.5 ni de otros identificadores de plantas comparables que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El benchmark es propio y de tamaño reducido (3.127 imágenes en total); la generalización a otras condiciones de iluminación, cámaras o regiones geográficas no está documentada.
- Cobertura limitada a 1.567 especies; las plantas fuera de ese conjunto se forzarán a la clase más cercana salvo que el umbral de aceptación las rechace.
- Riesgo de confusión entre especies visualmente similares, especialmente en exterior (0,857 frente a 0,865 en interior).
- Sin capacidades generativas ni de razonamiento: no puede explicar la identificación ni responder preguntas en lenguaje natural.
- La licencia CC-BY-4.0 exige atribución en usos comerciales; no se documentan restricciones adicionales, pero conviene revisar los términos antes de producción.
- Dependencia de la receta de entrada exacta: valores 0–1 para el codificador y 0–255 para el clasificador; un preprocesado incorrecto degrada silenciosamente la precisión.
- No se documentan sesgos demográficos ni geográficos del dataset de entrenamiento, lo que impide evaluar su comportamiento en floras no representadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brunopaiva15/iris
- Repositorio de código e inferencia de ejemplo: https://github.com/brunopaiva15/iris
- Aplicación Auxine: https://vergasta.ch/auxine/en/
