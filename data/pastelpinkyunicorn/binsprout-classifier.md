# pastelpinkyunicorn/binsprout-classifier

## Resumen

BinSprout Classifier es un clasificador de imágenes de pequeño tamaño desarrollado por el usuario pastelpinkyunicorn como parte de BinSprout, un proyecto de IA para el bien social orientado a reducir el desperdicio alimentario entre estudiantes. El modelo identifica ocho clases de ingredientes y objetos de cocina (banana, pan, huevo, lechuga, cebolla, patata, tomate y una clase "no comida") y se distribuye en formato TensorFlow.js para su ejecución directa en el navegador.

Técnicamente se trata de un MobileNet preentrenado en ImageNet y ajustado mediante transfer learning con Google Teachable Machine, sin que se especifiquen el número de parámetros ni la longitud de contexto (no aplicable en clasificación de imágenes). El repositorio ocupa 0,0 GB y no registra descargas en el momento de la consulta, lo que refleja su carácter de prototipo académico más que de modelo listo para producción.

Su relevancia es limitada fuera del ámbito educativo: sirve como ejemplo práctico de transfer learning con un conjunto de datos muy reducido (unas 515 fotos, aproximadamente 65 por clase) y de despliegue en cliente mediante TensorFlow.js. No obstante, la propia model card reconoce que el modelo desplegado aún no tiene métricas de validación publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNet (ImageNet) ajustado con transfer learning mediante Google Teachable Machine |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada 224x224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | TensorFlow.js (`model.json`, `metadata.json`, `weights.bin`) |

## Arquitectura y entrenamiento

El modelo desplegado es una red convolucional MobileNet preentrenada en ImageNet y reentrenada con la herramienta Google Teachable Machine (proyecto de imagen) sobre ocho clases. La entrada es una imagen RGB de 224x224 píxeles, redimensionada automáticamente por la librería `tmImage`, y la salida es un vector de probabilidades por clase. No se detallan la profundidad de la red, el número de parámetros ni la estrategia de aumento de datos empleada en la versión desplegada.

Paralelamente, el equipo entrenó un modelo de comparación en Google Colab con arquitectura MobileNetV2 (pesos de ImageNet congelados) seguido de global average pooling, dropout de 0,2 y una capa densa softmax de 8 salidas. Se aplicó aumento de datos (volteo aleatorio, rotación, zoom y brillo) y se entrenó durante 12 épocas con tamaño de lote 32 y optimizador Adam. Este modelo alcanzó un 94,1 % de precisión de validación (96 de 102 imágenes) y en torno al 97,6 % en entrenamiento, pero no se desplegó porque el conversor de TensorFlow.js era incompatible con las versiones de TensorFlow y NumPy de Colab en ese momento. Los datos de entrenamiento consisten en aproximadamente 515 fotos (unas 65 por clase) tomadas por el equipo con móviles en distintas condiciones, complementadas con datasets públicos y fotos de stock, con un reparto 80/20 entre entrenamiento y validación.

## Capacidades

- Clasificación de imágenes en ocho clases cerradas: banana, bread, egg, lettuce, non-food, onion, potato y tomato.
- Detección de "no comida" para evitar asignar un ingrediente cuando la imagen no contiene ninguno de los objetos reconocidos.
- Inferencia en el navegador del cliente mediante TensorFlow.js, sin necesidad de backend.
- Entrada de una única imagen RGB de 224x224 píxeles por inferencia.
- Salida de probabilidades por clase, apta para umbrales de confianza personalizados en la aplicación.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Aplicación web educativa de reducción de desperdicio: el modelo se carga con `tmImage.load()` en el navegador y clasifica fotos de ingredientes que el estudiante tiene en casa para sugerir recetas, sin enviar imágenes a un servidor.
- Prototipo de inventario doméstico: captura de fotos de la nevera o despensa para etiquetar ingredientes individuales y alimentar una lista de existencias.
- Demostración docente de transfer learning: ejemplo completo de ajuste de MobileNet con Teachable Machine y despliegue en TensorFlow.js para cursos introductorios de visión por computador.
- Prueba de concepto de clasificación en el borde (edge): validación de que un clasificador de 8 clases puede ejecutarse íntegramente en el cliente sin infraestructura de inferencia.
- Filtro previo en una aplicación de recetas: descarte rápido de imágenes que no contienen comida (clase "non-food") antes de invocar un modelo mayor o un servicio externo.
- Experimentación con umbrales de confianza: al devolver probabilidades por clase, permite calibrar en la interfaz cuándo pedir al usuario que repita la foto.

## Benchmarks y rendimiento

| Modelo | Precision | Notas |
|---|---|---|
| Teachable Machine (desplegado) | Pendiente de evaluar tras el entrenamiento | Sin métricas publicadas |
| Colab MobileNetV2 (comparación) | 94,1 % | 96 de 102 imágenes de validación correctas; ~97,6 % en entrenamiento |
| Prueba en condiciones reales (modelo de comparación) | 94 % (9,4 de 10) | 60-70 fotos nuevas por clase tomadas con móvil, no usadas en entrenamiento |

Los errores más frecuentes del modelo de comparación fueron imágenes de "non-food" clasificadas como pan o huevo (4 de 16 imágenes de esa clase) y confusiones mutuas entre pan y huevo. Banana, lechuga, cebolla, patata y tomate se clasificaron correctamente en la validación. No hay resultados de benchmarks publicados para el modelo desplegado en Teachable Machine.

## Requisitos de hardware

- Inferencia en el navegador del cliente mediante TensorFlow.js; no requiere GPU de servidor.
- VRAM estimada en servidor: no disponible (el modelo se distribuye únicamente en formato TensorFlow.js).
- GPU recomendadas: no aplica para el despliegue previsto; cualquier equipo capaz de ejecutar un navegador moderno con WebGL puede ejecutar la inferencia.
- Compatible con hardware de consumo, incluidos portátiles y móviles, al tratarse de un MobileNet.
- Opciones de despliegue: TensorFlow.js en web (librería `tmImage`); no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BinSprout Classifier | no disponible | Imagen 224x224 RGB, 8 clases | Sin métricas del modelo desplegado; 94,1 % en el modelo de comparación | no disponible | Hugging Face, TensorFlow.js |
| MobileNetV2 (ImageNet, original) | ~3,5 M (no confirmado en la información disponible) | Imagen 224x224 RGB, 1000 clases | Métricas estándar de ImageNet publicadas por sus autores | Apache 2.0 (según la información habitual del modelo original; no confirmado en esta ficha) | TensorFlow Hub, Keras, TF.js |
| Modelos de Teachable Machine de otros proyectos | no disponible | Imagen, número de clases variable | Depende del dataset de cada proyecto | no disponible | Exportación TF.js, TF Lite, SavedModel |

La comparación con alternativas de la misma categoría es limitada porque la model card no aporta datos de parámetros, licencia ni métricas del modelo desplegado. Cualquier clasificador de imágenes ajustado con MobileNet sobre un dataset propio sería directamente comparable en enfoque, pero no se dispone de cifras verificables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy pequeño (unas 515 fotos, ~65 por clase), lo que limita la generalización a fondos, iluminaciones y dispositivos no vistos.
- Las fotos de validación provienen de las mismas sesiones que las de entrenamiento, por lo que la precisión real en condiciones nuevas será probablemente inferior a la reportada.
- Solo reconoce ocho clases; cualquier otro objeto se asignará a una de ellas, con especial confusión en la clase "non-food", que es la más heterogénea.
- Clasifica un único elemento por imagen; no detecta múltiples ingredientes en una misma foto.
- El modelo desplegado no tiene métricas de validación publicadas; la cifra del 94,1 % corresponde al modelo de comparación entrenado en Colab, no al que se distribuye.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- No es una herramienta de seguridad alimentaria; la propia model card advierte de que, ante la duda, se debe desechar el alimento.
- Riesgo de sesgo derivado de la composición del dataset (fotos de stock y de un equipo reducido), que puede no representar la variedad de ingredientes, envases o contextos culturales.
- No dispone de información sobre idiomas ni sobre sesgos demográficos, al no procesar texto ni personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pastelpinkyunicorn/binsprout-classifier
- Código del proyecto BinSprout: https://github.com/imannajihahyuzli-stack/BinSprout.git
- Google Teachable Machine: https://teachablemachine.withgoogle.com/
- Documentación de TensorFlow.js: https://www.tensorflow.org/js
