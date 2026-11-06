# an1sh15/smai-a4-mlp-p0

## Resumen

smai-a4-mlp-p0 es un perceptrón multicapa (MLP) muy pequeno publicado en Hugging Face por el usuario an1sh15 como parte de la asignación 4 de un curso de SMAI (Statistical Methods in Artificial Intelligence). El modelo resuelve una tarea de clasificación de imágenes sobre el conjunto de datos CIFAR-10, que consta de 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión) con imágenes de 32x32 píxeles en color.

La arquitectura es deliberadamente simple: una red fully-connected de dos capas (`Linear(3072, 128) -> ReLU -> Linear(128, 10)`) con 394.634 parámetros totales. No incorpora convoluciones ni mecanismos de atención, por lo que funciona como línea base académica más que como modelo de producción. El contexto no aplica en el sentido de los modelos de lenguaje: la entrada es un vector fijo de 3072 valores (la imagen aplanada y estandarizada).

Su relevancia es limitada fuera del ámbito docente. No obstante, resulta útil como referencia para comparar el rendimiento de una MLP frente a CNN o transformers de visión en CIFAR-10, y como ejemplo mínimo de pipeline de preprocesado y entrenamiento reproducible en PyTorch.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP fully-connected: `Linear(3072, 128) -> ReLU -> Linear(128, 10)` |
| Parametros totales | 394.634 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes de 32x32x3) |
| Tipos de cuantizacion | no disponible (pesos en float64; sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch `state_dict`), `model.npz` (NumPy con `W0, b0, W1, b1`) y `preprocessing.npz` (media y desviación típica) |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa de dos capas lineales separadas por una activación ReLU. La capa de entrada recibe 3072 valores (resultado de aplanar la imagen de 32x32x3) y proyecta a 128 unidades ocultas; la capa de salida produce 10 logits, uno por clase, que se interpretan mediante entropía cruzada softmax. El preprocesado divide los píxeles entre 255 y estandariza cada columna con la media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento de CIFAR-10 (las columnas con desviación cero usan 1).

El entrenamiento emplea SGD con tasa de aprendizaje 0,01, tamaño de lote 64, acumulación de gradiente 1 y 100 épocas sin parada temprana, en precisión float64. La inicialización usa `torch.manual_seed(seed + 1)`. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional; el modelo corresponde a la variante con etiquetas verdaderas y `p = 0` de la sección 1.4.2 del enunciado de la asignación.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en color en una de las 10 clases de CIFAR-10.
- Salida de 10 logits por imagen, apta para calcular probabilidades con softmax.
- Preprocesado reproducible incluido (`preprocessing.npz`) para estandarizar nuevas imágenes con la misma media y desviación que el entrenamiento.
- Exportación de pesos en dos formatos: PyTorch (`model.pt`) y NumPy (`model.npz`), lo que facilita su uso fuera de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general, audio o modo thinking.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como ejemplo mínimo y reproducible de un pipeline completo (carga de datos, preprocesado, entrenamiento con SGD y evaluación) para estudiantes que se inician en PyTorch.
- Línea base de comparación en CIFAR-10: permite medir cuánto mejora una CNN o un transformer de visión respecto a una MLP simple; su precisión de test de 0,4665 fija una referencia concreta.
- Verificación de implementaciones: al incluir pesos en NumPy y las matrices de preprocesado, se puede usar para validar que una implementación propia de forward pass y estandarización reproduce los resultados esperados.
- Pruebas de infraestructura de inferencia: por su tamano (menos de 400.000 parámetros), es útil para probar pipelines de despliegue, serialización o conversión de formatos sin coste computacional apreciable.
- Experimentos de sensibilidad al preprocesado: al estar la estandarización documentada y separada en `preprocessing.npz`, permite estudiar el efecto de la normalización sobre un clasificador lineal.
- Demostraciones educativas de limitaciones de las MLP en visión: ilustra de forma cuantitativa la brecha entre un modelo fully-connected y arquitecturas con sesgo inductivo espacial en una tarea de imágenes.

## Benchmarks y rendimiento

Resultados reportados por el autor tras 100 épocas sobre CIFAR-10:

| Métrica | Valor |
|---|---|
| Precisión de entrenamiento | 0,8229 |
| Precisión de test | 0,4665 |
| Pérdida de entrenamiento | 0,5434 |
| Pérdida de test | 2,9111 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en cualquier formato; los pesos en float64 ocupan aproximadamente 3,2 MB (394.634 parámetros x 8 bytes) y el estado completo del modelo es del orden de unos pocos megabytes.
- GPU recomendadas: cualquier GPU, incluida una integrada; el modelo cabe holgadamente en tarjetas consumer como GTX 1050, RTX 3050 o superiores. No requiere A100 ni H100.
- Cabe en cualquier GPU consumer y también se ejecuta en CPU sin problema.
- Opciones de despliegue: PyTorch nativo (carga de `model.pt`), NumPy con `model.npz`, o exportación a TorchScript/ONNX. No se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamano del modelo se espera una latencia de microsegundos a milisegundos por imagen en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados por el mismo autor ni de resultados de referencia en la documentación proporcionada. Como referencia cualitativa, una CNN pequena típica para CIFAR-10 (por ejemplo, una LeNet o una CNN de 2-3 capas convolucionales) suele superar el 60-70 % de precisión de test con un número de parámetros del mismo orden, frente al 46,65 % de esta MLP, aunque no se aportan cifras verificadas en la información disponible.

| Modelo | Parámetros | Contexto/entrada | Precisión test CIFAR-10 | Licencia |
|---|---|---|---|---|
| smai-a4-mlp-p0 | 394.634 | 32x32x3 aplanado | 0,4665 | no disponible |
| CNN de referencia | no disponible | 32x32x3 | no disponible | no disponible |

## Limitaciones y advertencias

- Precisión de test baja (0,4665) y brecha grande respecto a la de entrenamiento (0,8229), indicativa de sobreajuste; no es adecuado para uso en producción.
- Al aplanar la imagen se pierde toda la estructura espacial, lo que limita severamente la capacidad del modelo frente a arquitecturas convolucionales.
- No es un modelo de lenguaje: no procesa texto, no soporta contexto largo ni generación, y no debe evaluarse con métricas de LLM.
- Licencia no especificada: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ámbito académico.
- El modelo está entrenado únicamente con CIFAR-10 (10 clases fijas); cualquier otra tarea requiere reentrenamiento.
- Posible riesgo de sobreajuste a las estadísticas de preprocesado de CIFAR-10; nuevas imágenes deben estandarizarse con el `preprocessing.npz` incluido para mantener coherencia.
- No hay información sobre sesgos, robustez adversarial ni evaluación fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/an1sh15/smai-a4-mlp-p0
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
