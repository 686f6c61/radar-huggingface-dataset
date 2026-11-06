# Mahanthhh/smai-iocnn-cifar10

## Resumen

smai-iocnn-cifar10 es una red neuronal convexa de entrada-salida (IOC-NN, Input-Output Convex Neural Network) desarrollada por el usuario Mahanthhh como entrega de la asignatura SMAI (Assignment 4, Monsoon 2026, roll number 2024101017). El modelo resuelve una tarea de clasificación de imágenes sobre el conjunto de datos CIFAR-10, con 10 clases de salida y entradas de 32x32x3 píxeles aplanadas en un vector de 3072 dimensiones.

La relevancia de esta ficha no reside en su rendimiento, sino en su valor como ejemplo docente de una arquitectura con restricción de convexidad: las capas a partir de la segunda imponen pesos no negativos, de modo que la función aprendida es convexa respecto a la entrada. Se trata de un modelo de 402.250 parámetros, con dos capas ocultas de 128 y 64 neuronas y activación ELU, entrenado desde cero sobre CIFAR-10.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0.0 GB y no incluye licencia ni información sobre idiomas. No se han publicado resultados de benchmarks ni detalles sobre el proceso de entrenamiento (épocas, optimizador, aumentación de datos) más allá del preprocesado indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con restricción de convexidad IOC-NN; entrada 3072 → 128 → 64 → 10 |
| Parametros totales | 402.250 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; clasificación de imágenes de 32x32x3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card menciona PyTorch; no se detalla el formato de los ficheros) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa que aplana la imagen de entrada (32x32x3 = 3072 valores) y la pasa por dos capas ocultas de 128 y 64 neuronas con activación ELU, seguidas de una capa de salida lineal de 10 logits correspondientes a las clases de CIFAR-10. La innovación técnica es la restricción de convexidad IOC-NN: los pesos de las capas a partir de la segunda se fuerzan a ser no negativos, lo que garantiza que la salida sea una función convexa de la entrada. Esto aporta interpretabilidad y estabilidad teórica, a costa de capacidad expresiva frente a una MLP sin restricciones.

El preprocesado descrito en la model card escala los píxeles por 1/255.0 a float64 y estandariza cada columna usando la media y la desviación típica calculadas sobre el conjunto de entrenamiento. No se especifican en la información disponible el número de épocas, el optimizador, la función de pérdida, el tamaño de batch, si hubo aumentación de datos ni la composición exacta del dataset más allá de ser CIFAR-10. Tampoco se indica si se aplicó regularización adicional (weight decay, dropout) ni el esquema de inicialización de pesos compatible con la restricción de no negatividad.

## Capacidades

- Clasificación de imágenes en 10 clases sobre CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada exclusivamente de imágenes de 32x32x3 píxeles; no admite otras resoluciones sin reentrenamiento o adaptación.
- Salida de 10 logits lineales; requiere softmax externo para obtener probabilidades.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni otras modalidades.
- No hay evidencia de soporte para clasificación fuera de CIFAR-10.

## Casos de uso

- Docencia y demostración de convexidad en redes neuronales: el modelo sirve para ilustrar en clase cómo la restricción de pesos no negativos en capas ocultas produce una función convexa respecto a la entrada, y para comparar su comportamiento con una MLP estándar de tamaño similar.
- Reproducción de prácticas académicas: permite a estudiantes de la asignatura SMAI reproducir el flujo completo de preprocesado (escalado 1/255 y estandarización por columna) y evaluar el efecto de la restricción IOC-NN sobre CIFAR-10.
- Baseline ligero de clasificación de imágenes de bajo coste: con 402.250 parámetros, puede ejecutarse en CPU o en GPUs de gama baja para experimentos rápidos de clasificación de 10 clases.
- Estudio de robustez e interpretabilidad: la convexidad respecto a la entrada facilita análisis de gradientes, atribuciones y comportamiento frente a perturbaciones en un modelo pequeño y controlado.
- Prototipado de pipelines de preprocesado: sirve como banco de pruebas para validar la normalización por media y desviación típica del conjunto de entrenamiento antes de escalar a modelos mayores.
- Comparación de arquitecturas restringidas frente a no restringidas: útil en investigación educativa para medir la pérdida de precisión que introduce la restricción de convexidad en una tarea de visión estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (402.250 parámetros × 4 bytes ≈ 1,6 MB de pesos, más activaciones y overhead del runtime); en float64, el doble para los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4060 y similares; también funciona en CPU sin problema.
- Opciones de despliegue: PyTorch nativo (el framework citado en la model card); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput muy alto en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-iocnn-cifar10 | 402.250 | 32x32x3 | Clasificación CIFAR-10 | no disponible | Hugging Face (0 descargas) |
| MLP estándar para CIFAR-10 | no disponible | 32x32x3 | Clasificación CIFAR-10 | no disponible | No se ha identificado un modelo comparable concreto en la información disponible |
| CNN pequeña para CIFAR-10 | no disponible | 32x32x3 | Clasificación CIFAR-10 | no disponible | No se ha identificado un modelo comparable concreto en la información disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas; no se han identificado en la información proporcionada modelos comparables con parámetros, contexto y licencia verificables.

## Limitaciones y advertencias

- Modelo de propósito exclusivamente académico, desarrollado como entrega de una asignatura; no está pensado para producción.
- Licencia no especificada: no se puede asumir permiso para uso comercial ni para redistribución.
- La restricción de convexidad limita la capacidad expresiva y probablemente reduce la precisión frente a una MLP o CNN sin restricciones en CIFAR-10 (no hay cifras publicadas que lo confirmen).
- Entrada fija de 32x32x3 píxeles y salida fija de 10 clases; no generaliza a otras resoluciones ni a otros conjuntos de datos sin reentrenamiento.
- No hay información sobre sesgos del dataset CIFAR-10 ni sobre el impacto de la restricción en clases concretas.
- Riesgo de sobreajuste y de calibración deficiente no evaluado; no se documentan métricas de validación ni de test.
- El repositorio tiene 0 descargas y 0 likes, sin señales de uso o validación por parte de la comunidad.
- No se especifica el formato exacto de los pesos ni si el checkpoint es cargable directamente con PyTorch sin código adicional.
- El preprocesado depende de la media y desviación típica del conjunto de entrenamiento original; reutilizar el modelo con otra normalización producirá predicciones incorrectas.

## Enlaces

- Hugging Face: https://huggingface.co/Mahanthhh/smai-iocnn-cifar10
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
