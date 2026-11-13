# Noor-Khan/bird-species-prediction

## Resumen

Bird Species Prediction es una red neuronal convolucional (CNN) desarrollada por Noorullah Zamindar (usuario Noor-Khan en Hugging Face) como proyecto de aprendizaje. El modelo resuelve una tarea de clasificación de imágenes multiclase restringida a seis especies de aves: jilguero americano, lechuza común, abejaruco carmesí, pico velloso, pingüino emperador y flamenco. Con solo 338.038 parámetros, es un modelo deliberadamente pequeño, orientado a demostrar un flujo completo de entrenamiento y despliegue más que a competir con sistemas de visión de propósito general.

La arquitectura es una CNN secuencial construida con Keras y TensorFlow: tres bloques convolucionales con 8, 16 y 32 filtros respectivamente, seguidos de una capa densa de 32 unidades y una capa de salida softmax de 6 clases. Las imágenes de entrada se redimensionan a 224×224 píxeles y se normalizan al rango [0, 1]. El modelo se entrenó durante 50 épocas con el optimizador Adam (tasa de aprendizaje 0,0005) y pérdida de entropía cruzada categórica.

Su relevancia es limitada en el panorama actual de IA, pero resulta útil como referencia didáctica: la model card documenta con transparencia el proceso de reconstrucción del entrenamiento, las discrepancias respecto al cuaderno original y las métricas medidas sobre el conjunto de datos público. Alcanza una precisión del 89,85 % en el conjunto de test, aunque con signos claros de sobreajuste (precisión de entrenamiento del 100 % frente a validación del 87,26 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial (Conv2D + MaxPool + Dense) |
| Parametros totales | 338.038 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada fija de 224×224 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada de imágenes, no texto) |
| Licencia | MIT |
| Formato de pesos | `.keras` (Keras v3) y `.h5` (pesos originales en el repositorio fuente) |

## Arquitectura y entrenamiento

La red es una CNN secuencial con la siguiente estructura: Conv2D de 8 filtros (3×3, ReLU, padding "same") + MaxPool 3×3; Conv2D de 16 filtros (3×3, ReLU, padding "same") + MaxPool 2×2; Conv2D de 32 filtros (3×3, ReLU, padding "same") + MaxPool 2×2; aplanado (Flatten); capa densa de 32 unidades con ReLU; y capa de salida densa de 6 unidades con softmax. El optimizador es Adam con tasa de aprendizaje 0,0005, la pérdida es entropía cruzada categórica y el entrenamiento se extendió durante 50 épocas con un tamaño de lote de 32.

Los datos de entrenamiento proceden del conjunto público "Bird Species" de gpiosenka (espejo en Hugging Face: `chriamue/bird-species-dataset`), del que se agruparon las particiones de entrenamiento, validación y test para las seis clases, sumando 986 imágenes: 143 de jilguero americano, 168 de lechuza común, 172 de abejaruco carmesí, 167 de pico velloso, 162 de pingüino emperador y 174 de flamenco. La partición final fue de 632 imágenes de entrenamiento, 157 de validación y 197 de test, mediante barajado con semilla 10 y posterior división 80/20 con semilla 42. Cabe señalar que la clase "FLAMINGO" se entrenó únicamente con imágenes de flamenco americano (*Phoenicopterus ruber*), ya que el conjunto público no incluye una clase genérica de flamenco. No se aplicaron técnicas de RLHF, DPO ni aumentación de datos documentada; tampoco se emplearon innovaciones como decodificación especulativa o atención lineal, por tratarse de una CNN convencional.

## Capacidades

- Clasificación de imágenes de aves en seis especies predefinidas: jilguero americano, lechuza común, abejaruco carmesí, pico velloso, pingüino emperador y flamenco.
- Entrada de imagen RGB redimensionada a 224×224 píxeles y normalizada al rango [0, 1].
- Salida de probabilidades softmax sobre las seis clases, lo que permite obtener el nivel de confianza de la predicción.
- Integración con una aplicación web Django (repositorio fuente) para subir una foto y obtener una predicción.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras modalidades.

## Casos de uso

- Clasificación rápida de fotos de aves en aplicaciones educativas: el modelo identifica una de las seis especies con una precisión del 89,85 % en test, suficiente para actividades de aprendizaje o demostraciones en aulas.
- Prototipo de aplicación web de identificación de aves: el repositorio fuente incluye una app Django que recibe una imagen subida por el usuario y devuelve la especie predicha junto con la probabilidad, lo que sirve como plantilla para proyectos similares.
- Filtrado preliminar en conjuntos de imágenes de biodiversidad: para las seis especies cubiertas, el modelo puede etiquetar automáticamente imágenes en lotes y reducir el trabajo manual de revisión, siempre con verificación humana posterior.
- Proyecto de aprendizaje de visión por computador: al ser un modelo pequeño (338.038 parámetros) y con script de entrenamiento reproducible (`train.py`), es adecuado para que estudiantes comprendan el ciclo completo de una CNN, desde la carga de datos hasta la evaluación.
- Demostración de despliegue de modelos Keras en producción: sirve para ejemplificar la integración de un modelo `.keras` en un servicio web con TensorFlow 2.16 o superior, numpy y pillow.
- Clasificación en dispositivos con recursos limitados: por su reducido tamaño, puede ejecutarse en CPU sin necesidad de GPU, lo que facilita su uso en entornos de desarrollo modestos o en el navegador mediante conversiones adicionales no documentadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test | 0,8985 (89,85 %; 177 de 197 imágenes correctas) |
| Perdida en test | 0,4196 |
| Precision final en validacion | 0,8726 (157 imágenes) |
| Precision final en entrenamiento | 1,0000 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K ni métricas estándar de visión como ImageNet top-1) en la información disponible. Las métricas anteriores son las medidas por el propio autor en su reentrenamiento sobre el conjunto de datos público, no sobre el conjunto original del cuaderno, que no se conserva.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 338.038 parámetros y las activaciones para una imagen de 224×224 son mínimas, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU con al menos 1 GB de memoria es suficiente. Una RTX 4090, A100 o H100 están sobredimensionadas para este modelo.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) y en CPU sin problemas.
- Opciones de despliegue: TensorFlow/Keras (carga directa del modelo `.keras`), aplicación Django incluida en el repositorio fuente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de milisegundos por imagen en CPU y aún menor en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un proyecto de aprendizaje con un alcance muy restringido (seis clases, 338.038 parámetros), por lo que las alternativas habituales serían CNN preentrenadas de propósito general (ResNet, EfficientNet, MobileNet) ajustadas a la misma tarea, pero no se han incluido datos de comparación en la información disponible.

| Modelo | Parametros | Contexto/entrada | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bird Species Prediction (este modelo) | 338.038 | 224×224 píxeles | 89,85 % en test (6 clases) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo reconoce seis especies: cualquier foto de un ave fuera de ese conjunto se clasificará erróneamente como una de las seis clases, sin opción de "desconocido".
- Entrenado con fotos limpias de un único ave; el rendimiento cae con fondos desordenados, múltiples aves, aves en vuelo a distancia, poca luz o plumaje juvenil o no reproductivo.
- Sobreajuste evidente: precisión de entrenamiento del 100 % frente a validación del 87,26 %, por lo que la precisión real en producción será inferior al 89,85 % del test.
- La clase "FLAMINGO" se entrenó solo con flamenco americano; otras especies de flamenco pueden reconocerse con menor fiabilidad.
- No debe usarse como única base para identificación de especies en investigación o conservación; requiere verificación por expertos.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de copyright y la licencia original.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo de visión sobre especies, el riesgo principal es la confusión entre clases y la generalización limitada a condiciones de imagen distintas de las de entrenamiento.
- El conjunto de datos original del cuaderno no se conserva; las métricas corresponden a un reentrenamiento sobre un conjunto público distinto, lo que introduce incertidumbre sobre la reproducibilidad exacta del modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noor-Khan/bird-species-prediction
- Repositorio fuente (aplicación Django y pesos originales): https://github.com/NoorullahZamindar-007/Bird-Species-Prediction-App
- Conjunto de datos público (espejo): https://huggingface.co/datasets/chriamue/bird-species-dataset
- Conjunto de datos original de gpiosenka: no disponible como enlace directo en la información proporcionada
- Cuaderno original de entrenamiento: no disponible (no se conserva en el repositorio)
