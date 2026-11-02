# rohday/smai-a4-ioc-nn

## Resumen

SMAI A4 Q1: IOC-NN on CIFAR-10 es un modelo neuronal de tipo perceptron multicapa (MLP) entrenado sobre el conjunto de datos CIFAR-10, publicado por el usuario rohday en HuggingFace. No se trata de un modelo de lenguaje ni de un modelo generativo: es un clasificador de imagenes de 10 clases con una arquitectura muy reducida de tres capas (3072 entradas, 128 unidades ocultas y 10 salidas). El modelo se enmarca en el contexto de un trabajo academico o de asignatura (la nomenclatura "SMAI A4" sugiere "Statistical Methods in AI, Assignment 4"), y su interes es fundamentalmente didactico.

El modelo resuelve la tarea de clasificacion de imagenes de CIFAR-10 alcanzando una precision de test de 0,4797 (47,97 %), un resultado modesto pero coherente con una red de una sola capa oculta entrenada con SGD plano durante 100 epocas. La innovacion tecnica declarada es una restriccion sobre los pesos negativos de las capas a partir de la segunda, que se sustituyen por la funcion exponencial exp(w - 5) tras cada paso de optimizacion.

Es relevante unicamente como referencia educativa o como caso de estudio de entrenamiento basico de redes neuronales con restricciones sobre los pesos. No dispone de model card convencional, licencia declarada, idiomas ni pipeline asociado, y el repositorio tiene un tamano de 0,0 GB, lo que sugiere que los pesos no estan realmente alojados o son de tamano despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) de 3 capas: 3072 -> 128 -> 10 |
| Parametros totales | 3072 x 128 + 128 + 128 x 10 + 10 = 394.634 (calculado a partir de la arquitectura declarada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; clasificador de imagenes) |
| Licencia | no disponible |
| Formato de pesos | weights.npz (arrays NumPy: W{i} con forma (n_in, n_out) y b{i}) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa completamente conectado con dos transformaciones lineales: una capa oculta de 128 unidades con activacion ELU y una capa de salida de 10 logits con activacion identidad, optimizada mediante entropia cruzada con softmax. La entrada son imagenes de CIFAR-10 aplanadas a 3072 valores (32 x 32 x 3 en orden HWC), normalizadas dividiendo por 255 y restando la media y dividiendo por la desviacion tipica calculadas sobre las 50.000 imagenes de entrenamiento (parametros almacenados en preprocessing.npz).

El entrenamiento se realizo durante 100 epocas con SGD plano, learning rate 0,02, tamano de lote 64 y sin acumulacion de gradientes, usando etiquetas verdaderas (p = 0, es decir, sin label smoothing). La innovacion declarada es una restriccion aplicada tras cada paso de optimizacion: los pesos negativos de las capas a partir de la segunda se sustituyen por exp(w - 5). No se mencionan datos sobre inicializacion, regularizacion, aumentado de datos ni uso de RLHF/DPO (no aplicable en este contexto).

## Capacidades

- Clasificacion de imagenes de CIFAR-10 en 10 categorias (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Entrada exclusivamente de imagenes de 32 x 32 x 3 en formato aplanado HWC.
- Salida de 10 logits interpretables como probabilidades tras aplicar softmax.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni ninguna capacidad multimodal mas alla de la clasificacion de imagenes de 32 x 32.
- No es un modelo generativo: no produce texto ni imagenes.

## Casos de uso

- Docencia y aprendizaje: sirve como ejemplo minimo y reproducible de un MLP entrenado desde cero con NumPy, util para explicar retropropagacion, normalizacion de entradas y restricciones sobre pesos en un curso de aprendizaje automatico.
- Reproduccion de experimentos academicos: permite replicar el resultado de 47,97 % de precision en CIFAR-10 y comparar el efecto de la restriccion exp(w - 5) frente a un MLP sin restriccion.
- Baseline de clasificacion de imagenes de baja resolucion: util como referencia inferior para comparar con CNN u otros modelos mas potentes en tareas de juguete con CIFAR-10.
- Estudio de estabilidad numerica: la restriccion sobre pesos negativos puede analizarse como caso de estudio de como afecta al entrenamiento y a la convergencia en redes pequenas.
- Integracion en pipelines de investigacion sobre regularizacion de pesos: el codigo y los pesos en formato .npz son faciles de cargar con NumPy para experimentar con variantes del entrenamiento.
- Prototipado rapido en entornos sin GPU: al ser un modelo de 394.634 parametros, puede ejecutarse en CPU en milisegundos, lo que lo hace adecuado para pruebas de integracion o demos educativas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| CIFAR-10 test accuracy | 0,4797 (47,97 %) | Unica metrica publicada en la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, y estos no aplican a un clasificador de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable (menos de 10 MB para los pesos en float32; 394.634 parametros x 4 bytes ≈ 1,6 MB).
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. Funciona en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) sin aprovecharla.
- Cabe en cualquier GPU consumer y en practicamente cualquier dispositivo con Python y NumPy.
- Opciones de despliegue: carga directa con NumPy (weights.npz) y una implementacion manual del forward pass; no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la inferencia por muestra seria del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMAI A4 Q1 IOC-NN | 394.634 | Imagen 32x32x3 | 47,97 % | no disponible | HuggingFace (repo vacio, 0,0 GB) |
| MLP estandar CIFAR-10 (referencia tipica) | ~400.000 | Imagen 32x32x3 | ~50-55 % (tipico) | variable | Multiples implementaciones publicas |
| LeNet-5 (CNN clasica) | ~60.000 | Imagen 32x32x3 | ~70 % (tipico) | variable | Multiples implementaciones publicas |
| ResNet-18 (CNN profunda) | ~11 millones | Imagen 32x32x3 | ~93-95 % (tipico) | variable | torchvision, timm |

Los valores de referencia de modelos comparables son aproximados y no proceden de la informacion proporcionada; se incluyen solo como orientacion de categoria. No se dispone de datos oficiales de comparacion directa con este modelo concreto.

## Limitaciones y advertencias

- Precision limitada: 47,97 % en CIFAR-10, muy por debajo de las CNN modernas; no es adecuado para aplicaciones reales de vision.
- Ambito restringido: solo clasifica imagenes de 32 x 32 x 3 de las 10 clases de CIFAR-10; no generaliza a otras resoluciones, dominios ni tareas.
- Sin licencia declarada: no se especifican terminos de uso comercial, por lo que no debe asumirse permiso para uso en produccion.
- Repositorio de 0,0 GB: es posible que los pesos no esten realmente alojados o que el repositorio este incompleto; conviene verificar la disponibilidad de weights.npz y preprocessing.npz antes de usarlo.
- Sin model card convencional: no hay informacion sobre sesgos, composicion del dataset mas alla de CIFAR-10, ni evaluaciones adicionales.
- Riesgo de alucinacion: no aplica (no es un modelo generativo), pero si existe riesgo de sobreconfianza en las predicciones por la baja precision del clasificador.
- Restriccion sobre pesos poco documentada: el efecto de la sustitucion exp(w - 5) sobre los pesos negativos no esta analizado en la informacion disponible; puede introducir sesgos sistematicos en el entrenamiento.
- Sin soporte de herramientas de despliegue estandar: requiere implementacion manual del forward pass en NumPy.

## Enlaces

- HuggingFace: https://huggingface.co/rohday/smai-a4-ioc-nn
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
