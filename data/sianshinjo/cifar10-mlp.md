# sianshinjo/cifar10-mlp

## Resumen

`sianshinjo/cifar10-mlp` es un modelo de clasificacion de imagenes de muy pequeno tamano publicado en HuggingFace por el usuario `sianshinjo`. Se trata de un perceptron multicapa (MLP) con arquitectura `[3072, 128, 10]`, disenado para clasificar imagenes del conjunto de datos CIFAR-10 en sus 10 categorias estandar. El modelo se presenta como parte de un ejercicio academico ("assignment Q1") y no como un modelo de proposito general.

El modelo no es un modelo de lenguaje ni un transformer: es una red neuronal densa que recibe imagenes aplanadas de 32x32x3 píxeles (3072 valores) y produce 10 logits, uno por clase de CIFAR-10. El autor menciona tambien una variante denominada "IOC-NN" con activacion ELU y pesos no negativos en las capas a partir de la segunda, lo que sugiere un ejercicio comparativo entre dos configuraciones de red.

La relevancia de esta ficha es limitada en terminos practicos: se trata de un artefacto educativo con 0 descargas, 0 likes, sin licencia declarada, sin model card extendida y sin benchmarks publicados. Su interes es principalmente didactico, como ejemplo de pipeline de clasificacion de imagenes con preprocesado estandarizado sobre CIFAR-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP denso `[3072, 128, 10]` (variante IOC-NN con ELU y pesos no negativos en capas >= 2) |
| Parametros totales | no disponible (estimacion teorica: 3072x128 + 128 + 128x10 + 10 = 394.506) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el autor menciona ficheros `preprocessing_*.npz` para estadisticas de preprocesado) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa completamente conectado con una capa de entrada de 3072 unidades (32x32x3 aplanado), una capa oculta de 128 unidades con activacion ReLU y una capa de salida de 10 logits correspondientes a las clases de CIFAR-10. El autor describe una segunda variante, IOC-NN, que emplea activacion ELU y restringe los pesos a valores no negativos en las capas a partir de la segunda, presumiblemente como ejercicio de comparacion de dinamicas de entrenamiento.

El preprocesado consiste en aplanar la imagen, convertir a `float64`, dividir por 255 y estandarizar por columna restando la media y dividiendo por la desviacion tipica calculadas sobre el conjunto de entrenamiento (almacenadas en ficheros `preprocessing_*.npz`). El entrenamiento se realizo con descenso de gradiente estocastico (SGD), tasa de aprendizaje 0.05, tamano de lote 64 y semilla 1135. No se especifica el numero de epocas, el numero de tokens (no aplica) ni la composicion exacta del dataset mas alla de CIFAR-10. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de clasificacion.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en 10 categorias (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Salida de 10 logits crudos, sin capa softmax explicita en la descripcion.
- Variante IOC-NN con pesos no negativos en capas profundas, orientada a experimentacion academica.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision mas alla de la clasificacion de 32x32.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Docencia y practicas de aprendizaje automatico: el modelo sirve como referencia minima para ilustrar un pipeline completo de clasificacion de imagenes con preprocesado, entrenamiento con SGD y evaluacion sobre CIFAR-10.
- Comparacion de funciones de activacion: la variante IOC-NN con ELU y pesos no negativos permite estudiar en un entorno controlado el efecto de restricciones sobre los pesos en una red pequena.
- Prototipado rapido de clasificadores de bajo coste: al tener menos de 400.000 parametros, puede ejecutarse en CPU en milisegundos, lo que lo hace util para pruebas de integracion de pipelines de inferencia.
- Reproducibilidad de experimentos academicos: la semilla 1135 y los hiperparametros documentados permiten reproducir el entrenamiento y verificar resultados.
- Ejemplo de estandarizacion por columna en vision: el uso de estadisticas del conjunto de entrenamiento guardadas en `.npz` es un patron reutilizable en cursos de preprocesado.
- Base para experimentos de regularizacion: la restriccion de pesos no negativos en IOC-NN puede servir como punto de partida para estudiar tecnicas de regularizacion estructural en redes densas.
- Benchmark de juguete para comparar frameworks: por su tamano minimo, es util para validar diferencias numericas entre implementaciones (PyTorch, NumPy, etc.) en tareas de clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB con pesos en `float32` (menos de 400.000 parametros), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) ejecutaria la inferencia de forma trivial, pero no aporta ventaja frente a CPU para un modelo de este tamano.
- Cabe en GPU consumer: si, en cualquier GPU consumer, e incluso en entornos sin GPU.
- Opciones de despliegue: no se especifican en la model card; al ser un MLP, requeriria exportacion a un formato de inferencia (por ejemplo, ONNX o TorchScript) no documentada por el autor.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, se espera latencia de microsegundos a milisegundos en CPU para un unico ejemplo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sianshinjo/cifar10-mlp | ~394.506 (estimado) | no aplica | no disponible | HuggingFace, 0 descargas |
| LeNet-5 (CIFAR-10) | ~60.000 | no aplica | variable | Implementaciones multiples |
| ResNet-18 (CIFAR-10) | ~11,2 M | no aplica | variable | Implementaciones multiples |
| VGG-11 (CIFAR-10) | ~9,2 M | no aplica | variable | Implementaciones multiples |

La comparativa se limita a arquitecturas clasicas de clasificacion de CIFAR-10; no se dispone de datos de rendimiento del modelo evaluado ni de los alternativos en la informacion proporcionada, por lo que no es posible comparar precision.

## Limitaciones y advertencias

- Modelo academico sin documentacion extendida: la model card es minima y no incluye resultados de evaluacion, numero de epocas ni curvas de aprendizaje.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si su uso comercial esta permitido.
- Sin benchmarks publicados: no hay evidencia de precision en CIFAR-10 ni de comparacion con lineas base.
- Capacidad limitada a clasificacion de imagenes de 32x32x3 en 10 clases; no es un modelo de proposito general.
- Riesgo de sobreajuste y sesgos del dataset CIFAR-10: las clases estan balanceadas en el dataset original, pero el modelo puede heredar sesgos de las imagenes de entrenamiento.
- Sin soporte declarado de cuantizacion ni formatos de despliegue estandar (GGUF, safetensors, ONNX), lo que dificulta su integracion en produccion.
- El autor menciona ficheros `preprocessing_*.npz` pero no detalla su contenido ni garantiza su disponibilidad en el repositorio (tamano del repo: 0.0 GB).
- No apto para tareas de generacion de texto, razonamiento, codigo ni agentes.
- Fecha de creacion futura (2026-11-02) en los metadatos de HuggingFace, lo que puede indicar metadatos inconsistentes.

## Enlaces

- HuggingFace: https://huggingface.co/sianshinjo/cifar10-mlp
- Dataset CIFAR-10 (referencia): https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
