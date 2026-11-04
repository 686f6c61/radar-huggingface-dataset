# Aayushk05/smai-a4-cifar10-ioc-p0

## Resumen

El modelo `smai-a4-cifar10-ioc-p0`, publicado por el usuario Aayushk05 en HuggingFace, es una red neuronal completamente conectada (MLP) de tres capas diseñada para clasificación de imágenes del conjunto CIFAR-10. Se trata de un artefacto académico correspondiente a la asignatura SMAI (Statistical Methods for Artificial Intelligence), concretamente al apartado Q1.5 de la Assignment 4, y su propósito es demostrar experimentalmente el concepto de red neuronal con salida convexa respecto a la entrada (IOC-NN, Input-Output Convex Neural Network).

La arquitectura es deliberadamente sencilla: una capa de entrada de 3072 unidades (la imagen CIFAR-10 aplanada en orden HWC), una capa oculta de 128 neuronas con activación ELU y una capa de salida de 10 logits correspondientes a las clases del dataset. La restricción IOC se implementa forzando que todos los pesos de las capas a partir de la segunda sean no negativos, lo que garantiza que cada logit sea una función convexa de la entrada. El entrenamiento se realizó con SGD plano sobre las 50.000 imágenes limpias de entrenamiento durante 100 épocas.

El interés de esta ficha es limitado desde el punto de vista de producción: no es un modelo de lenguaje, no soporta generación de texto ni tool calling, y sus pesos se distribuyen en formato NumPy (`.npz`) en lugar de safetensors o GGUF. Su relevancia es exclusivamente didáctica y de investigación sobre propiedades de convexidad en redes neuronales. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) totalmente conectado: 3072-128-10 |
| Parametros totales | 394.752 (3072×128 + 128 + 128×10 + 10) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (layout `W{k}` (in, out) y `b{k}`), más `preprocessing.npz` y `config.json` |

## Arquitectura y entrenamiento

La red es un MLP de tres capas con activación ELU en la capa oculta. La entrada es una imagen CIFAR-10 de 32×32×3 aplanada en orden HWC a 3072 valores, normalizada dividiendo por 255 y aplicando estandarización con la media y desviación típica de los píxeles de entrenamiento (almacenadas en `preprocessing.npz`). La capa de salida produce 10 logits, uno por clase.

La innovación técnica es la restricción IOC-NN: los pesos de todas las capas a partir de la segunda se mantienen no negativos, de modo que cada logit es una función convexa de la entrada. Esto convierte al modelo en una herramienta para estudiar propiedades de convexidad entrada-salida, no en un clasificador de propósito general. El entrenamiento usó SGD plano con lr 0.01 y batch 64 durante 100 épocas sobre las 50.000 imágenes limpias de entrenamiento de CIFAR-10. No se menciona aumento de datos, regularización adicional, RLHF ni DPO (no aplicables a este tipo de modelo).

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Salida convexa respecto a la entrada por diseño (restricción IOC-NN), útil para análisis de robustez y propiedades teóricas.
- Preprocesado específico incluido: aplanado HWC, escalado a [0,1] y estandarización con media y desviación del conjunto de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la clasificación de imágenes de 32×32.

## Casos de uso

- Docencia y prácticas de asignatura: reproducir el experimento de la Assignment 4 de SMAI para comparar el rendimiento de una red estándar frente a una IOC-NN en CIFAR-10, usando `config.json` para replicar la configuración exacta.
- Investigación sobre convexidad entrada-salida: analizar cómo la restricción de pesos no negativos afecta a la precisión (0.4879 en test) frente a una MLP sin restricción, sirviendo como línea base controlada.
- Estudio de robustez adversarial: al ser una función convexa por logit, permite explorar propiedades teóricas de ataques y certificación de robustez en un modelo pequeño y totalmente inspeccionable.
- Prototipado rápido en NumPy: al distribuirse en `.npz`, puede cargarse sin frameworks de deep learning y ejecutarse en cualquier entorno con NumPy, útil para entornos docentes con dependencias mínimas.
- Evaluación de pipelines de preprocesado: el archivo `preprocessing.npz` permite verificar implementaciones de normalización de CIFAR-10 contra una referencia concreta y reproducible.
- Análisis de límites de capacidad: con 394.752 parámetros y una sola capa oculta de 128 neuronas, sirve para ilustrar el techo de rendimiento de arquitecturas muy limitadas en CIFAR-10 (48,79 % de accuracy) frente a CNN.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Test accuracy (CIFAR-10) | 0.4879 |
| Final training accuracy | 0.8027 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y estos no serían aplicables al tratarse de un clasificador de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos (394.752 parámetros en float32 ≈ 1,6 MB) más el overhead de la imagen de entrada; cabe en cualquier GPU o incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) ejecuta el modelo sin problema.
- Cabe en cualquier GPU consumer, incluida la gama integrada, y también en Raspberry Pi.
- Opciones de despliegue: carga directa con NumPy (`np.load` sobre `model.npz`), o conversión manual a PyTorch/TensorFlow si se desea integrar en un pipeline existente. No hay soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera inferencia en el orden de microsegundos por imagen en CPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (MLP con restricción IOC sobre CIFAR-10) ni datos de referencia frente a los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Precisión limitada: 48,79 % en test, lejos de clasificadores CNN modernos sobre CIFAR-10; no apto para aplicaciones reales de visión.
- Restricción IOC: la no negatividad de los pesos a partir de la segunda capa limita la expresividad del modelo y probablemente contribuye a la brecha entre training (80,27 %) y test (48,79 %), lo que sugiere sobreajuste.
- Sesgos conocidos: no documentados en la model card; al entrenarse solo con CIFAR-10, hereda los sesgos y limitaciones de ese dataset (clases balanceadas, imágenes de baja resolución, dominios muy acotados).
- Riesgo de alucinación: no aplicable (no genera texto), pero sí riesgo de clasificaciones erróneas fuera de la distribución de CIFAR-10.
- Limitaciones de contexto o idioma: entrada fija de 32×32×3 píxeles; no admite otras resoluciones ni modalidades.
- Restricciones de licencia: la licencia no está especificada en la información disponible, por lo que no puede asumirse uso comercial sin consultar al autor.
- Caveat para producción: repositorio con 0 descargas y 0 likes, sin pipeline declarado ni documentación más allá de la model card; los pesos en `.npz` requieren implementación manual de la inferencia y del preprocesado.

## Enlaces

- HuggingFace: https://huggingface.co/Aayushk05/smai-a4-cifar10-ioc-p0
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
