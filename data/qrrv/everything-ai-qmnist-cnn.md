# QRRV/everything-ai-qmnist-cnn

## Resumen

Everything AI QMNIST CNN es una red neuronal convolucional minúscula publicada por el autor QRRV en el marco del curso "Everything AI". Su única función es leer dígitos manuscritos: recibe una imagen en escala de grises de 28x28 píxeles (dígito blanco sobre fondo negro, valores normalizados entre 0 y 1) y devuelve 10 logits, uno por cada dígito del 0 al 9. La clase que la define se llama `DigitCNN` y su implementación completa aparece en la propia model card.

El modelo tiene 51.648 parámetros repartidos en 10 tensores y una arquitectura muy sencilla: dos convoluciones de 3x3 (8 y 16 canales) con ReLU y max pooling de 2x2, una capa oculta de 64 neuronas, una capa de embedding de 2 dimensiones (pensada para poder dibujar cada imagen como un punto en un mapa durante las lecciones) y una capa de salida de 10 logits. Se distribuye como un `state_dict` de PyTorch en el fichero `model.pt`.

Su relevancia es fundamentalmente docente y de prototipado: sirve como ejemplo canónico de CNN entrenada desde cero, como baseline reproducible para prácticas y como pieza de sustitución en pipelines de imagen ya segmentados. No compite con modelos de visión modernos ni con sistemas de OCR completos: se entrenó con solo 6.000 imágenes del conjunto QMNIST y acierta 929 de las primeras 1.000 imágenes de test, es decir, un 92,9%. Además, el repositorio no tiene descargas ni likes, y sus metadatos de fecha (creado el 2026-10-16) resultan sospechosos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN feedforward: 2 convoluciones 3x3 (8 y 16 canales) + ReLU + max pooling 2x2, capa densa de 64 neuronas, embedding de 2 dimensiones y capa de salida de 10 logits (clase `DigitCNN`) |
| Parámetros totales | 51.648, en 10 tensores |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de visión con entrada fija de 28x28 píxeles; no procesa secuencias de texto) |
| Tipos de cuantización | No disponible (el autor solo publica pesos en FP32 dentro de `model.pt`; no se documentan versiones GGUF, GPTQ, AWQ ni similares) |
| Idiomas soportados | No aplicable (clasificador de imágenes; no procesa texto) |
| Licencia | CC BY 4.0, atribuida a "Everything AI contributors" |
| Formato de pesos | PyTorch `state_dict` en `model.pt` (carga con `torch.load("model.pt", weights_only=True)`) |
| Entrada | Tensor de forma (n, 784) o (n, 1, 28, 28); píxeles de 0 a 1; dígito blanco sobre negro |
| Salida | 10 logits (no se aplica softmax en el modelo) |
| Dataset de entrenamiento | Primeras 6.000 imágenes de entrenamiento de QMNIST (Yadav y Bottou, 2019; licencia BSD-3-Clause, Copyright (c) Facebook, Inc. and its affiliates) |
| Precisión reportada | 929 de las primeras 1.000 imágenes de test de QMNIST (92,9%) |
| Formato de distribución | `model.pt` (tamaño del repositorio: 0,0 GB) |
| Pipeline en HuggingFace | `image-classification` |

## Arquitectura y entrenamiento

La red es una CNN clásica de tipo LeNet simplificada. La entrada se reordena a (n, 1, 28, 28); sigue una convolución de 3x3 con padding 1 y 8 canales, activación ReLU y max pooling 2x2; después una segunda convolución de 3x3 con padding 1 y 16 canales, también con ReLU y max pooling 2x2, lo que deja un mapa de 16x7x7 = 784 valores; a continuación una capa densa de 784 a 64 neuronas con ReLU, luego la capa `embed` que proyecta esos 64 valores a 2 dimensiones, y finalmente la capa `out` que produce los 10 logits. No hay normalización por lotes, dropout ni conexiones residuales, y el modelo no aplica softmax: devuelve logits en crudo.

El entrenamiento usó las primeras 6.000 imágenes de entrenamiento de QMNIST, presentadas en el mismo formato que MNIST. El optimizador fue Adam con tasa de aprendizaje 0,003, 30 épocas, minilotes de 64, semilla 2 y ejecución en un solo hilo con PyTorch (la model card indica la versión 2.14.1, conviene verificar la compatibilidad al cargar el `state_dict`). El autor indica que el script `data/tools/train_course_cnn.py` del curso reproduce el mismo fichero con la misma versión de PyTorch, lo que hace el resultado replicable. No se documenta ningún proceso de ajuste fino adicional, RLHF, DPO ni destilación.

## Capacidades

- Clasificación de imágenes de un único dígito manuscrito en formato MNIST o QMNIST (28x28, un canal, blanco sobre negro, dígito centrado).
- Salida de 10 logits, uno por dígito del 0 al 9, aptos para `argmax` directo.
- Soporte de procesamiento por lotes: la entrada admite la forma (n, 784) o (n, 1, 28, 28).
- Exposición del embedding de 2 dimensiones (`self.embed`) como representación intermedia, útil para visualizar la distribución de las imágenes en un plano.
- Reentrenamiento y ajuste sencillos: con 51.648 parámetros, el modelo se puede reentrenar en CPU en un tiempo reducido.
- No soporta generación de texto ni razonamiento.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo "thinking", ni de entrada de audio, ni de visión general: la única modalidad soportada son imágenes de un dígito de 28x28 píxeles.

## Casos de uso

- Material didáctico en cursos de deep learning: el modelo es un ejemplo completo y reproducible de CNN (convoluciones, pooling, capa densa y embedding) con un script de entrenamiento asociado, adecuado para que el alumnado entienda el flujo de datos de 28x28 a 10 logits y lo modifique a voluntad.
- Baseline de referencia en experimentos académicos: al tener 51.648 parámetros y una precisión conocida (92,9% sobre 1.000 imágenes de test), sirve como punto de comparación para medir si una arquitectura o un preprocesado alternativo mejora el resultado.
- Clasificación de dígitos en formularios ya segmentados: en un pipeline de digitalización de documentos donde un paso previo recorta cada casilla (por ejemplo, códigos postales, cantidades manuscritas o respuestas numéricas en hojas de lectura óptica), el modelo puede actuar como clasificador final de cada recorte si este se normaliza a 28x28 en blanco sobre negro.
- Etiquetado asistido de conjuntos de dígitos propios: dado un conjunto de recortes normalizados al formato MNIST, el modelo puede preetiquetarlos y dejar solo la revisión manual de los casos de baja confianza, reduciendo el coste de anotación.
- Pieza de pruebas en pipelines de despliegue: por su tamaño (menos de 0,25 MB en FP32) es útil como carga de trabajo de prueba para validar infraestructura de inferencia, versionado de artefactos y procesos de CI/CD antes de mover modelos grandes.
- Inferencia en dispositivos muy limitados: al requerir únicamente CPU y una huella de memoria mínima, puede ejecutarse en Raspberry Pi, contenedores pequeños o funciones serverless sin acelerador, siempre que el error del 7% sea aceptable.
- Visualización de espacios latentes en docencia: la capa de embedding de 2 dimensiones permite proyectar cada imagen de test como un punto y discutir en clase la separación entre clases, aunque el autor advierte que 2 dimensiones es una proyección muy reducida para esta tarea.

## Benchmarks y rendimiento

| Benchmark | Resultado | Observaciones |
|---|---|---|
| QMNIST, primeras 1.000 imágenes de test | 929 aciertos sobre 1.000 (92,9%) | Único dato de rendimiento publicado en la model card; imágenes no vistas en entrenamiento |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No disponible | No aplicables: el modelo no procesa texto |
| Comparación con otros modelos en benchmarks de dígitos | No disponible | La información proporcionada no incluye resultados de terceros medidos en las mismas condiciones |

No se han publicado más resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en FP32 ocupan aproximadamente 207 KB (51.648 parámetros x 4 bytes); el resto del consumo corresponde al propio marco de ejecución.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte de PyTorch sirve, pero es innecesaria. El modelo está pensado para CPU.
- Compatibilidad con GPU de consumo: cabe con enorme margen en cualquier GPU de consumo, e incluso se ejecuta en CPU de un solo núcleo y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: PyTorch es el único formato documentado por el autor (`torch.load` sobre `model.pt`). No se documentan pesos GGUF, ni integración con llama.cpp, Ollama, vLLM o TGI, que además no aplican a este tipo de modelo. Convertir el modelo a TorchScript u ONNX es técnicamente viable, pero no está documentado ni verificado en la información disponible.
- Latencia y throughput: no hay mediciones publicadas. Por el tamaño del modelo, la inferencia por imagen en CPU debería situarse en el orden de los microsegundos o pocos milisegundos, pero se trata de una estimación no verificada, no de un dato del autor.
- Memoria de sistema: el modelo completo y sus pesos caben holgadamente en cualquier entorno con unas decenas de megabytes libres.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La tabla siguiente recoge únicamente una comparación estructural; las cifras de los modelos de referencia proceden de la literatura general y no han sido verificadas con las fuentes aportadas.

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QRRV/everything-ai-qmnist-cnn | 51.648 | 28x28, 1 canal | Clasificación de dígitos (10 clases) | CC BY 4.0 | HuggingFace (0 descargas, 0 likes) |
| LeNet-5 (referencia histórica) | Cifra de la literatura, no verificada aquí | 32x32, 1 canal | Clasificación de dígitos | No disponible | Múltiples implementaciones |
| Otros clasificadores de dígitos tipo MLP sobre MNIST | No disponible | 784 valores | Clasificación de dígitos | No disponible | Repositorios diversos |
| Rendimiento comparado (precisión en test) | No disponible para todos los casos | — | — | — | — |

## Limitaciones y advertencias

- Solo funciona con dígitos en el formato exacto de QMNIST y MNIST: un dígito por imagen, blanco sobre negro, centrado y de 28x28 píxeles. El propio autor advierte de que una fotografía de un dígito, un dígito negro sobre papel blanco o una letra se leerán igualmente como algún dígito.
- Alto riesgo de falsos positivos por diseño: la capa de salida siempre produce 10 logits, de modo que cualquier entrada fuera de distribución se clasificará como un dígito aunque no lo sea. No hay umbral de rechazo ni clase "desconocido".
- Los logits no están normalizados: el modelo no aplica softmax, así que no ofrece directamente probabilidades calibradas. Cualquier umbral de confianza exige aplicar softmax o calibrar el modelo por separado.
- Precisión limitada: 6.000 imágenes de entrenamiento son pocas y el autor cifra el error en unos 7 de cada 100 dígitos de test. Es un margen demasiado alto para la mayoría de sistemas de producción que dependan de la exactitud del dígito.
- Sin evaluación amplia: la única métrica publicada es sobre las primeras 1.000 imágenes de test de QMNIST; no hay validación cruzada, ni análisis por clase, ni estudio de sesgos por estilo de escritura.
- Posibles sesgos de datos: el entrenamiento se hace con un subconjunto pequeño de QMNIST, derivado de MNIST, con la distribución de escritura de ese corpus. No se documenta análisis de equilibrio entre dígitos ni de sesgo demográfico o cultural en los estilos de escritura.
- Sin información sobre robustez: no se documentan pruebas con ruido, rotaciones, desplazamientos, cambios de grosor de trazo ni otras perturbaciones.
- Licencia: CC BY 4.0 permite uso, modificación y explotación comercial, incluida la venta, siempre que se atribuya a "Everything AI contributors", se enlace a la licencia y se indique qué se ha cambiado. Además, el corpus de entrenamiento QMNIST está bajo BSD-3-Clause, condición que conviene respetar en caso de redistribuir datos derivados.
- Repositorio sin tracción: 0 descargas y 0 likes, sin señales de mantenimiento ni de uso en producción por terceros.
- Metadatos anómalos: las fechas de creación y actualización del repositorio (2026-10-16) y la versión de PyTorch citada (2.14.1) conviene verificarlas antes de dar por buena la reproducibilidad del entrenamiento.
- Despliegue limitado: no hay pesos en formatos optimizados ni guías de integración con servidores de inferencia habituales, por lo que su uso en producción exige escribir el código de carga y preprocesado a mano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QRRV/everything-ai-qmnist-cnn
- Repositorio del curso en GitHub: https://github.com/QRRV/everything-ai
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Referencia del corpus de entrenamiento: Chhavi Yadav y Léon Bottou, QMNIST (2019); el enlace al artículo no está incluido en los resultados de búsqueda disponibles.
- Documentación general sobre redes convolucionales: https://en.wikipedia.org/wiki/Convolutional_neural_network
- Introducción a las CNN (GeeksforGeeks): https://www.geeksforgeeks.org/machine-learning/introduction-convolution-neural-network/
- Redes convolucionales en deep learning (GeeksforGeeks): https://www.geeksforgeeks.org/deep-learning/convolutional-neural-network-cnn-in-machine-learning/
- Redes neuronales (Wikipedia): https://en.wikipedia.org/wiki/Neural_network_(machine_learning)
