# MetallicBond/smai-a4-cifar10-iocnn

## Resumen

`smai-a4-cifar10-iocnn` es un repositorio de artefactos academicos publicado por el usuario MetallicBond en HuggingFace, correspondiente a la cuarta practica (pregunta 1) de una asignatura denominada SMAI. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un conjunto de clasificadores de imagenes para el dataset CIFAR-10 cuyos pesos se almacenan como ficheros `.npz`. El repositorio tiene 0 descargas y 0 likes, y un tamano practicamente nulo (0.0 GB), lo que sugiere que contiene unicamente ficheros de pesos de un perceptron multicapa de muy baja capacidad.

El unico artefacto documentado en la model card es `iocnn_torch_p0`: una red neuronal de dos capas (una oculta y una de salida) implementada en PyTorch, con 789.258 parametros, activacion ELU en la capa oculta y 10 logits de salida para las clases de CIFAR-10. Se entreno durante 100 epocas sobre las 50.000 imagenes de entrenamiento de CIFAR-10 con etiquetas verdaderas (p = 0), usando SGD plano con tasa de aprendizaje 0,02 y tamano de lote 64.

Su relevancia es exclusivamente pedagogica: ilustra una variante de red con restricciones de no negatividad en los pesos de las capas a partir de la segunda (IOC-NN, Input-Output Convex Neural Network), donde los pesos negativos se sustituyen por `exp(w - 5)` tras cada paso de optimizacion. No esta pensado para uso en produccion ni como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) de 2 capas con activacion ELU oculta; variante IOC-NN con restriccion de no negatividad en pesos de capas >= 2 |
| Parametros totales | 789.258 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes de 32x32x3) |
| Tipos de cuantizacion | no disponible (pesos en `.npz`, presumiblemente float64 segun el preprocesado descrito) |
| Idiomas soportados | no aplica (clasificacion de imagenes; clases de CIFAR-10) |
| Licencia | no disponible |
| Formato de pesos | `.npz` (ficheros NumPy); el autor menciona implementacion en PyTorch |

Dimensiones de la red segun la model card: `widths = [3072, 256, 10]`, con `W{i}` de forma `(n_in, n_out)` y `b{i}` de forma `(n_out,)`, calculando `z = h @ W + b`. Preprocesado: aplanado de la imagen 32x32x3 en orden HWC a un vector de 3072, conversion a float64, division por 255 y estandarizacion por columna (media y desviacion tipica tomadas de un fichero de preprocesado). Entrenamiento: `lr = 0.02`, `batch_size = 64`, `grad_accumulation_steps = 1`, optimizador SGD plano, semilla 14017.

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas totalmente conectadas: entrada de 3072 dimensiones (la imagen CIFAR-10 aplanada), capa oculta de 256 neuronas con activacion ELU y capa de salida de 10 neuronas con activacion identidad que produce logits, sobre los que se aplica softmax y perdida de entropia cruzada. La innovacion declarada es la restriccion IOC: los pesos de las capas a partir de la segunda deben ser no negativos, y tras cada paso del optimizador cualquier peso negativo `w` se reemplaza por `exp(w - 5)`, lo que mantiene la convexidad de la salida respecto a la entrada bajo ciertas condiciones.

El entrenamiento se realizo durante 100 epocas sobre las 50.000 imagenes de entrenamiento de CIFAR-10 con etiquetas verdaderas (el autor lo denota como p = 0, en referencia presumiblemente a un porcentaje de ruido de etiqueta nulo). No se documenta el uso de data augmentation, regularizacion, validacion cruzada, ni de tecnicas de RLHF/DPO (no aplicables a este tipo de modelo). Tampoco se especifica el numero total de tokens ni composicion de dataset mas alla de CIFAR-10 estandar.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia sobre un unico ejemplo por paso, con preprocesado manual (aplanado HWC, normalizacion float64, estandarizacion por columna).
- Entrenamiento reproducible gracias a la semilla fijada (14017) y a la configuracion de SGD documentada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de vision general: solo clasificacion de imagenes CIFAR-10.
- No dispone de modo "thinking", vision general, audio ni ninguna capacidad generativa.

## Casos de uso

- Docencia y practicas de aprendizaje automatico: el repositorio sirve como referencia reproducible para estudiar redes con restricciones de convexidad (IOC-NN) sobre un benchmark clasico como CIFAR-10, con hiperparametros y semilla documentados.
- Reproduccion de experimentos academicos: permite volver a entrenar o evaluar el clasificador con la misma configuracion (SGD, lr 0.02, batch 64, 100 epocas) y comparar el efecto de la restriccion IOC frente a un MLP sin restricciones.
- Baseline de clasificacion de imagenes de baja resolucion: util como punto de partida minimo (789.258 parametros) para comparar arquitecturas mas complejas (CNN, ViT) en tareas de juguete.
- Verificacion de implementaciones de restricciones de pesos: el mecanismo `exp(w - 5)` para forzar no negatividad puede reutilizarse como test unitario en librerias de investigacion sobre redes convexes.
- Analisis de robustez y calibracion: al ser un modelo pequeno y rapido de entrenar, sirve para estudiar curvas de calibracion, sobreajuste y sensibilidad al preprocesado en CIFAR-10.
- Educacion en despliegue de artefactos: el formato `.npz` con pesos y metadatos JSON permite practicar la carga de modelos y la reproducibilidad de pipelines de inferencia en entornos docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precision en test de CIFAR-10, matriz de confusion, perdida final ni comparaciones con otros clasificadores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (789.258 parametros); el modelo cabe en cualquier GPU consumer, CPU o incluso en memoria de un microcontrolador.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Una RTX 4090 o A100 estarian enormemente sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en cualquier GPU con soporte CUDA (por ejemplo, GTX 1050, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: carga directa con NumPy (`.npz`) o reimplementacion en PyTorch segun la descripcion de la model card; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un coste despreciable por inferencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-cifar10-iocnn (este) | 789.258 | Imagen 32x32x3 (3072) | Clasificacion CIFAR-10 | no disponible | HuggingFace, 0 descargas |
| MLP estandar sobre CIFAR-10 | del orden de 10^5-10^6 | Imagen 32x32x3 | Clasificacion CIFAR-10 | variable | Multiples implementaciones publicas |
| CNN tipo ResNet-18 sobre CIFAR-10 | ~11 M | Imagen 32x32x3 | Clasificacion CIFAR-10 | variable (MIT en implementaciones comunes) | Ampliamente disponible |
| Vision Transformer pequeno (ViT) sobre CIFAR-10 | ~5-10 M | Imagen 32x32x3 con parches | Clasificacion CIFAR-10 | variable | Disponible en repositorios de investigacion |

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparacion cuantitativa con las alternativas no es posible.

## Limitaciones y advertencias

- Modelo de proposito exclusivamente academico: no es un modelo de lenguaje ni un modelo fundacional, y no debe evaluarse como tal.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribucion ni modificacion; debe contactarse con el autor antes de cualquier uso fuera del ambito docente.
- Sin metricas publicadas: no hay evidencia documentada de precision, recall ni exactitud en el conjunto de test de CIFAR-10.
- Capacidad muy limitada: un MLP de dos capas con 789.258 parametros sobre imagenes aplanadas no aprovecha la estructura espacial y probablemente queda muy por debajo de arquitecturas convolucionales en la misma tarea.
- Preprocesado fragil: depende de un fichero de medias y desviaciones tipicas por columna no incluido en la descripcion; un preprocesado distinto invalida las predicciones.
- Riesgo de sobreajuste: 100 epocas con SGD plano y sin regularizacion documentada sobre 50.000 imagenes.
- Restriccion IOC: la sustitucion `exp(w - 5)` puede degradar la capacidad de ajuste y no se documenta su impacto en la precision.
- Sin soporte multilingue, generativo, de agentes ni de tool calling; no aplica a casos de uso de IA generativa.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/MetallicBond/smai-a4-cifar10-iocnn
- Dataset CIFAR-10 (referencia del benchmark): https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
