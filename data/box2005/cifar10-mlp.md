# Box2005/cifar10-mlp

## Resumen

CIFAR-10 MLP es un modelo de red neuronal completamente conectada (multilayer perceptron) entrenado para clasificación de imágenes del conjunto CIFAR-10 en 10 categorías. Lo publica el usuario Box2005 en HuggingFace y su propósito es didáctico o de referencia: se trata de un clasificador pequeño, con 402.250 parámetros, que sirve como línea base para comparar con arquitecturas convolucionales sobre el mismo dataset.

El modelo recibe imágenes de 32x32x3 píxeles, las aplana a un vector de 3072 valores, las normaliza (división por 255 y estandarización por columna con media y desviación típica del conjunto de entrenamiento) y las pasa por dos capas ocultas de 128 y 64 neuronas con activación ReLU, seguidas de una capa de salida de 10 logits. No incorpora mecanismos de atención ni capas convolucionales; es un MLP puro.

Su relevancia es limitada en producción: la precisión de test declarada es de 0,4658, muy por debajo de lo que alcanzan redes convolucionales o transformers de visión sobre CIFAR-10. Resulta útil como ejemplo educativo de pipeline de clasificación, como baseline en experimentos y como caso de estudio de las limitaciones de los MLP para datos de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) denso: 3072 -> 128 -> 64 -> 10, ReLU en capas ocultas, salida sin activacion (logits) |
| Parametros totales | 402.250 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model_mlp_p0.pt`), mas `preprocessing.npz` con media y desviacion tipica |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa con tres capas densas: una entrada de 3072 dimensiones (32x32x3 aplanado), dos capas ocultas de 128 y 64 neuronas con activacion ReLU y una capa de salida de 10 neuronas sin activacion, que produce logits. El preprocesamiento consiste en dividir los valores de pixel por 255 y estandarizar cada columna con la media y la desviacion tipica del conjunto de entrenamiento, almacenadas en `preprocessing.npz`; las columnas con desviacion cero usan desviacion 1 para evitar divisiones por cero.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset mas alla de CIFAR-10, ni sobre tecnicas de regularizacion, aumento de datos, optimizador, tasa de aprendizaje o numero de epocas. Tampoco se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional. La model card solo aporta la arquitectura, el recuento de parametros, el procedimiento de preprocesamiento, la forma de carga y la precision de test.

## Capacidades

- Clasificacion de imagenes de 32x32x3 píxeles en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Salida de logits por clase, apta para aplicar softmax y obtener probabilidades.
- Inferencia ligera en CPU o GPU de gama baja por su reducido tamano (402.250 parametros).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de texto.
- No dispone de modo thinking, vision avanzada ni audio; la vision se limita a la clasificacion de imagenes de 32x32.

## Casos de uso

- Baseline educativo en cursos de aprendizaje profundo: sirve para ilustrar el pipeline completo de clasificacion (carga de datos, preprocesamiento, entrenamiento, evaluacion) y comparar despues con CNN, mostrando la brecha de precision entre un MLP y una red convolucional.
- Comparacion de arquitecturas en experimentos academicos: al ser un modelo pequeno y reproducible, se puede usar como referencia inferior en estudios sobre aumento de datos, normalizacion o regularizacion aplicados a CIFAR-10.
- Pruebas de infraestructura de inferencia: por su tamano minimo, permite validar pipelines de carga de pesos PyTorch, preprocesamiento con `preprocessing.npz` y servicio de prediccion sin consumir recursos de GPU.
- Prototipado rapido de clasificadores de imagenes de baja resolucion: en entornos donde la precision no es critica, puede servir como punto de partida para tareas de clasificacion simple antes de migrar a modelos convolucionales.
- Docencia sobre preprocesamiento: el uso de media y desviacion tipica por columna con proteccion ante desviacion cero es un ejemplo concreto para explicar la estandarizacion de caracteristicas.
- Benchmark de latencia en hardware modesto: al requerir solo 402.250 parametros, permite medir el coste de inferencia de un MLP en CPU, Raspberry Pi o GPUs de gama de entrada, sirviendo de referencia para estimar el sobrecoste de modelos mayores.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Precisión en test CIFAR-10 | 0,4658 | Dato declarado en la model card |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precision FP32 (402.250 parametros x 4 bytes, mas las activaciones de una imagen), por lo que cabe en cualquier GPU o incluso en CPU.
- GPU recomendadas: cualquier GPU moderna; no se requiere una A100, H100 ni RTX 4090. Una GPU integrada o una CPU convencional es suficiente.
- Cabe en cualquier GPU de consumo, incluidas las de gama de entrada y las integradas.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load`), exportacion a ONNX o TorchScript para servir con ONNX Runtime o TorchServe. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia por imagen sera del orden de microsegundos a milisegundos en CPU y aun menor en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIFAR-10 MLP (Box2005) | 402.250 | Imagen 32x32x3 | 0,4658 (test) | no disponible | HuggingFace |
| ResNet-20 (referencia habitual) | ~0,27 M | Imagen 32x32x3 | no disponible en esta ficha | varía según implementacion | Multiples repositorios |
| VGG-11 (referencia habitual) | ~9,2 M | Imagen 32x32x3 | no disponible en esta ficha | varía según implementacion | Multiples repositorios |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada; la comparativa se limita a parametros y tipo de entrada.

## Limitaciones y advertencias

- Precision de test baja (0,4658) para CIFAR-10; insuficiente para la mayoria de aplicaciones reales de clasificacion de imagenes.
- Al ser un MLP sin convoluciones, no explota la estructura espacial de la imagen y generaliza peor que las CNN.
- No se documenta el conjunto de validacion, la semilla, el numero de epocas ni el optimizador, lo que dificulta la reproducibilidad.
- Riesgo de sesgos y de alucinacion no aplicable en el sentido de los modelos de lenguaje; el modelo solo produce logits de clase.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas no aplicables; el modelo no procesa texto.
- Limitacion de entrada fija a imagenes de 32x32x3; no admite otras resoluciones sin reentrenamiento o redimensionado.
- El repositorio ocupa 0,0 GB y no se documentan demos, papers ni repositorios adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/Box2005/cifar10-mlp
