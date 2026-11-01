# imradhe/smai-a4-cifar10-mlp

## Resumen

`smai-a4-cifar10-mlp` es un `state_dict` de PyTorch publicado por el usuario imradhe en HuggingFace, correspondiente a un perceptrón multicapa (MLP) entrenado sobre CIFAR-10 con etiquetas limpias (p=0). No es un modelo de lenguaje ni un modelo generativo: es un artefacto de un ejercicio académico de la asignatura SMAI (presumiblemente "Statistical Methods for Artificial Intelligence" o similar), identificado como "Task 1.5" de una práctica A4. El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta, lo que indica que se trata de un artefacto de uso personal o docente sin distribución pública significativa.

La arquitectura es un MLP de tres capas con dimensiones `[3072, 256, 128, 10]`: entrada de 3072 valores (imágenes CIFAR-10 aplanadas de 32x32x3), dos capas ocultas de 256 y 128 neuronas con activación ReLU, y una capa de salida de 10 clases. El preprocesado consiste en aplanar la imagen, dividir entre 255 y estandarizar cada columna con la media y desviación típica del conjunto de entrenamiento, valores almacenados en `mlp_preprocessing.json`. La precisión reportada en test es 0,4950 para el MLP y 0,4118 para una variante IOC-NN (probablemente "Input Output Convex Neural Network" o similar, un clasificador con restricciones de convexidad).

Su relevancia es limitada fuera del contexto docente: sirve como referencia reproducible de un clasificador básico de CIFAR-10 y como material de comparación frente a variantes con restricciones (IOC-NN). No debe confundirse con un modelo de propósito general ni con un modelo de lenguaje: no procesa texto, no tiene tokenizador, no soporta tool calling ni generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con capas `[3072, 256, 128, 10]` y activación ReLU |
| Parametros totales | No disponible en la información proporcionada (estimables en ~822.000 a partir de las dimensiones, pero no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes, sin contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `state_dict` de PyTorch (fichero `.pt`/`.pth` presumiblemente; no confirmado) |

## Arquitectura y entrenamiento

El modelo es un MLP estándar de tres capas densas con activación ReLU en las capas ocultas y salida de 10 unidades (una por clase de CIFAR-10). La entrada es un vector de 3072 dimensiones obtenido al aplanar cada imagen RGB de 32x32 píxeles. El preprocesado aplicado es: aplanado, división entre 255 para normalizar a [0,1] y estandarización por columna usando la media y desviación típica del conjunto de entrenamiento, cuyos valores se guardan en `mlp_preprocessing.json`. La arquitectura completa se describe en `mlp_architecture.json`.

El entrenamiento se realizó sobre CIFAR-10 con etiquetas limpias (p=0), es decir, sin ruido de etiqueta inyectado. El autor reporta una precisión de test de 0,4950 para el MLP y 0,4118 para una variante denominada IOC-NN. No se especifican en la información disponible el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de batch ni si se aplicó regularización (dropout, weight decay) o data augmentation. Tampoco se indica si el modelo se entrenó desde cero o con inicialización preentrenada. No hay innovaciones técnicas destacables: es un baseline docente de clasificación de imágenes.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada exclusivamente vectorial de 3072 floats; no acepta imágenes en bruto sin el preprocesado descrito.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No tiene modo "thinking", visión nativa, audio ni generación de texto.
- Únicamente inferencia hacia delante (forward pass) para clasificación.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como baseline reproducible para comparar MLP frente a CNN u otros clasificadores en CIFAR-10, con la precisión de referencia (0,4950) ya reportada.
- Estudio de preprocesado: el par `mlp_preprocessing.json` y `mlp_architecture.json` permite reproducir exactamente el pipeline de normalización y estandarización, útil para analizar el impacto del preprocesado en la precisión.
- Comparación de variantes con restricciones: la variante IOC-NN (0,4118) frente al MLP (0,4950) permite estudiar el coste en precisión de imponer restricciones de convexidad o estructura.
- Reproducción de experimentos: al ser un `state_dict` de PyTorch, se puede cargar con `torch.load` y evaluar sobre el split de test de CIFAR-10 para verificar resultados.
- Análisis de ruido de etiquetas: el modelo con p=0 sirve como referencia limpia frente a variantes entrenadas con ruido (p>0), si el autor las publica.
- Prototipado rápido de pipelines de clasificación: por su tamaño reducido, se puede ejecutar en CPU sin GPU, lo que facilita pruebas en entornos sin acelerador.

## Benchmarks y rendimiento

| Modelo | Dataset | Precisión en test |
|---|---|---|
| MLP `[3072, 256, 128, 10]` (p=0) | CIFAR-10 | 0,4950 |
| IOC-NN (variante del autor) | CIFAR-10 | 0,4118 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), ni comparaciones con modelos de referencia de la literatura como ResNet o VGG sobre CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos en FP32 (el modelo tiene del orden de 800.000 parámetros), por lo que no requiere GPU.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (GTX 1050, RTX 3060, etc.) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y también en CPU sin problema.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + `model.load_state_dict`); no se ha publicado integración con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, la inferencia por lote en CPU debería ser del orden de microsegundos a milisegundos por muestra, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `smai-a4-cifar10-mlp` (este) | MLP | ~800.000 (estimado) | No aplica | 0,4950 | No disponible | HuggingFace (0 descargas) |
| IOC-NN (variante del mismo autor) | Red con restricciones | No disponible | No aplica | 0,4118 | No disponible | No confirmada |
| ResNet-18 (referencia literatura) | CNN | ~11,2 M | No aplica | ~0,93-0,95 (literatura) | Varía (MIT en torchvision) | Amplia |
| VGG-11 (referencia literatura) | CNN | ~132 M | No aplica | ~0,91-0,92 (literatura) | Varía | Amplia |

Las cifras de ResNet-18 y VGG-11 son referencias habituales de la literatura sobre CIFAR-10 y no proceden de la información proporcionada; se incluyen solo como orientación de magnitud. No se dispone de comparaciones publicadas por el autor frente a estos modelos.

## Limitaciones y advertencias

- Precisión modesta (0,4950) muy por debajo de CNN modernas (~0,93+), por lo que no es adecuado para producción real de clasificación de imágenes.
- No es un modelo de lenguaje: no procesa texto, no genera, no soporta instrucciones ni diálogo.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor; el repositorio no declara términos.
- Sin model card completa: faltan datos de entrenamiento (épocas, optimizador, aumentación de datos), lo que dificulta la reproducibilidad exacta.
- Riesgo de sobreajuste no documentado: no se reportan curvas de entrenamiento ni precisión en validación.
- Dependencia estricta del preprocesado: usar una normalización distinta a la de `mlp_preprocessing.json` degradará la precisión de forma significativa.
- Sesgos: al entrenarse solo con CIFAR-10, hereda los sesgos y desequilibrios de ese dataset (clases balanceadas, pero imágenes de baja resolución y contextos limitados).
- Alucinación: no aplica en el sentido de modelos generativos, pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Sin soporte de imágenes de otra resolución o formato distinto a 32x32x3 sin reescalado previo.

## Enlaces

- HuggingFace: https://huggingface.co/imradhe/smai-a4-cifar10-mlp
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
