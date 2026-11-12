# Noor-Khan/plant-disease-prediction

## Resumen

Plant Disease Prediction es una red neuronal convolucional (CNN) desarrollada por Noorullah Zamindar (usuario Noor-Khan en Hugging Face) como proyecto de aprendizaje. El modelo clasifica fotografías de hojas de plantas en tres categorías concretas: maíz con roya común, patata con tizón temprano y tomate con mancha bacteriana. Se distribuye en formato Keras/TensorFlow con licencia MIT y está pensado como ejemplo didáctico más que como herramienta de producción.

Arquitectónicamente es una CNN secuencial muy sencilla: dos capas convolucionales, dos capas de max pooling, una capa densa de 64 unidades y una capa de salida softmax de 3 clases, con 7.244.995 parámetros totales. Trabaja con imágenes redimensionadas a 256×256 píxeles y valores de píxel normalizados a [0, 1]. No es un modelo de lenguaje ni un transformer: es un clasificador de imágenes de propósito muy restringido.

Su relevancia es limitada y de carácter educativo. El propio autor documenta que el modelo se entrenó sobre solo 900 imágenes de PlantVillage, que solo reconoce tres enfermedades de tres cultivos y que devolverá una de esas tres etiquetas para cualquier foto de hoja, incluidas las sanas. Es útil como referencia para quienes quieran reproducir un pipeline básico de clasificación de imágenes con Keras, no como sistema de diagnóstico agrícola.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial (Conv2D 32 → MaxPool 3×3 → Conv2D 64 → MaxPool 2×2 → Flatten → Dense 64 → Dense 3 softmax) |
| Parametros totales | 7.244.995 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada 256×256×3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de imágenes) |
| Licencia | MIT |
| Formato de pesos | Keras (`.keras`), con script `train.py` para reproducir el entrenamiento |
| Tarea | Clasificación de imágenes multi-clase (3 clases) |
| Numero de clases | 3 (maíz con roya común, patata con tizón temprano, tomate con mancha bacteriana) |
| Optimizador | Adam (lr 0.0001) |
| Funcion de perdida | Categorical cross-entropy |
| Epocas de entrenamiento | 10 |
| Tamano de lote | 32 |
| Framework | Keras / TensorFlow (>= 2.16) |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial clásica construida en Keras: una primera convolución de 32 filtros 3×3 con ReLU y padding "same" seguida de max pooling 3×3; una segunda convolución de 64 filtros 3×3 con ReLU y padding "same" seguida de max pooling 2×2; y finalmente un aplanado, una capa densa de 64 unidades con ReLU y una capa de salida de 3 unidades con softmax. Se entrenó con el optimizador Adam a una tasa de aprendizaje de 0.0001 y pérdida de entropía cruzada categórica durante 10 épocas.

Los datos de entrenamiento proceden del dataset público PlantVillage (Mohanty, Hughes y Salathé, 2016). El autor reconstruyó las tres clases tomando los primeros 300 ficheros alfabéticamente por clase de la carpeta `raw/color/` del repositorio de PlantVillage, lo que da 900 imágenes balanceadas (300/300/300). El split fue 80% entrenamiento / 20% test con semilla 10, y a su vez el conjunto de entrenamiento se dividió 80/20 en entrenamiento/validación con semilla 42: 576 imágenes de entrenamiento, 144 de validación y 180 de test. No se aplicaron técnicas de aumento de datos, RLHF, DPO ni ninguna innovación arquitectónica destacable; el valor del repositorio está en la reproducibilidad (incluye `train.py` y `metrics.json`).

## Capacidades

- Clasificación de imágenes de hojas de plantas en exactamente tres clases: maíz con roya común, patata con tizón temprano y tomate con mancha bacteriana.
- Devuelve una distribución de probabilidad softmax sobre las tres clases, de modo que puede consultarse la confianza de la predicción con `np.max(probs)`.
- Preprocesado de entrada fijo: redimensionado a 256×256 y normalización de píxeles a [0, 1].
- Reproducibilidad completa del entrenamiento mediante el script `train.py` incluido en el repositorio.
- Integración con una aplicación web Flask de demostración (subida de foto y obtención de predicción) disponible en el repositorio de GitHub del autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni visión general. No es multilingüe porque no procesa lenguaje.

## Casos de uso

- Docencia y aprendizaje de visión por computador: sirve como ejemplo mínimo y reproducible de un pipeline de clasificación de imágenes con Keras, desde la carga de datos hasta la inferencia, útil en cursos introductorios.
- Prototipo de aplicación agrícola de demostración: la app Flask del repositorio permite mostrar en una demo cómo se integraría un clasificador de hojas en una interfaz web sencilla.
- Prueba de concepto de clasificación de enfermedades en cultivos específicos: para validar la viabilidad de PlantVillage como fuente de datos en un contexto de maíz, patata y tomate.
- Referencia para comparativas de preprocesado: permite contrastar el efecto de normalizar a /255.0 frente a otros valores y de variar el tamaño de lote en un entrenamiento corto.
- Base para experimentos de fine-tuning: al ser una CNN pequeña (7,2 M de parámetros) y con licencia MIT, se puede reentrenar o ampliar con nuevas clases en hardware modesto.
- Generación de material docente sobre limitaciones de los datasets controlados: el propio modelo ilustra bien el gap entre precisión en PlantVillage y rendimiento en campo.

## Benchmarks y rendimiento

Resultados medidos por el autor en el reentrenamiento publicado (conjunto de test de 180 imágenes):

| Metrica | Valor |
|---|---|
| Precision en test | 0.9944 (179/180 correctas) |
| Perdida en test | 0.0179 |
| Precision final en validacion | 1.0000 (144 imágenes) |
| Precision final en entrenamiento | 1.0000 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor advierte explícitamente que estas cifras casi perfectas reflejan lo limpio y separable del subconjunto de PlantVillage utilizado y que la precisión en condiciones reales será inferior.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 7,2 M de parámetros en float32 el modelo ocupa aproximadamente 29 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con soporte CUDA (por ejemplo, una RTX 3060 o superior) acelera la inferencia, pero no es necesaria.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: TensorFlow/Keras (`keras.models.load_model`), servidor Flask propio del autor, o exportación a TensorFlow Lite o TensorFlow.js si se necesita despliegue en móvil o navegador (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo se espera latencia de milisegundos por imagen en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, el modelo se sitúa en la categoría de CNN pequeñas entrenadas sobre PlantVillage, un tipo de modelo muy común en repositorios educativos, pero no se han encontrado comparaciones publicadas con alternativas concretas.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Plant Disease Prediction (Noor-Khan) | 7.244.995 | Imagen 256×256×3 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo reconoce tres enfermedades de tres cultivos; no identifica otras plantas ni otras enfermedades.
- Devuelve siempre una de las tres etiquetas, incluso para hojas sanas o imágenes que no correspondan a ninguna de las tres clases, sin mecanismo de rechazo ni clase "desconocida".
- Entrenado con fotos de PlantVillage: hojas aisladas sobre fondo liso y con iluminación controlada. El rendimiento cae con fotos de campo, fondos con ruido, varias hojas en la imagen, mala iluminación u otras etapas de crecimiento.
- Solo 900 imágenes de entrenamiento; las métricas casi perfectas reflejan la separabilidad del subconjunto, no la robustez real.
- La aplicación Flask del repositorio de GitHub usa etiquetas de marcador de posición (`Disease_A`, `Disease_B`, `Healthy`) en `app.py`; deben sustituirse por los nombres reales de clase de `metrics.json`.
- No es una herramienta de diagnóstico: el autor advierte explícitamente que no debe usarse como única base para decisiones de tratamiento de cultivos.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no hay garantías ni soporte.
- No se documentan sesgos demográficos ni de otro tipo porque el modelo no procesa personas ni texto; el sesgo relevante es el de dominio (dataset controlado).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noor-Khan/plant-disease-prediction
- Repositorio de código fuente y app Flask: https://github.com/NoorullahZamindar-007/Plant-Disease-Prediction-Web-App
- Dataset PlantVillage (repositorio original): https://github.com/spMohanty/PlantVillage-Dataset
- Paper de PlantVillage (Mohanty, Hughes, Salathé, 2016): no disponible como enlace directo en la información proporcionada
