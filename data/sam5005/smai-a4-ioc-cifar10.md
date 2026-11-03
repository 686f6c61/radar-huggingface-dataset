# Sam5005/smai-a4-ioc-cifar10

## Resumen

`Sam5005/smai-a4-ioc-cifar10` es un modelo neuronal de clasificación de imágenes entrenado sobre el conjunto de datos CIFAR-10, publicado en HuggingFace por el usuario Sam5005 en el contexto de la asignatura SMAI (A4). No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un perceptrón multicapa (MLP) clásico con tres capas ocultas que recibe imágenes aplanadas de 32x32x3 píxeles y produce 10 logits correspondientes a las clases de CIFAR-10. El repositorio tiene un tamaño de 0.0 GB y, en el momento de la consulta, no registra descargas ni likes.

La relevancia de este artefacto es fundamentalmente académica y didáctica: ilustra el entrenamiento de una red con una restricción poco habitual (todos los pesos de las capas a partir de la segunda se mantienen no negativos), lo que lo convierte en un ejemplo de estudio sobre optimización con restricciones de signo. No está pensado para uso en producción ni para tareas generales de visión por computador.

Al carecer de model card extendida, de licencia declarada y de datos de benchmarks comparativos, la ficha se limita a documentar lo que el autor especifica explícitamente en el README y a marcar como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) 3072 -> 512 -> 256 -> 128 -> 10, activación oculta ELU, salida identidad |
| Parametros totales | no disponible (calculable a partir de las dimensiones: ~1.7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 32x32x3) |
| Tipos de cuantizacion | no disponible (pesos en NumPy `.npz`, sin versiones GGUF ni safetensors) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | `model.npz` (NumPy, layout W con forma (in, out); logits = h @ W + b) |

## Arquitectura y entrenamiento

La red es un MLP completamente conectado con tres capas ocultas de 512, 256 y 128 neuronas respectivamente, activación ELU en las capas ocultas y capa de salida lineal con 10 logits (identidad). La entrada es la imagen CIFAR-10 aplanada en orden HWC a un vector de 3072 dimensiones, normalizada dividiendo por 255 y aplicando media y desviación típica almacenadas en `preprocessing.npz`.

El entrenamiento emplea SGD con learning rate 0.02, tamaño de lote 64, 100 épocas y semilla 2013, sobre etiquetas limpias (sin label smoothing ni aumentación declarada). La innovación técnica destacable es la restricción de no negatividad sobre los pesos de las capas a partir de la segunda: tras cada paso de actualización, cualquier peso negativo `w < 0` se transforma mediante `exp(w - 5)`, manteniéndolo en el rango positivo. La inicialización sigue un esquema diferenciado: primera capa con N(0, 2/n_in) (estilo ReLU), capas posteriores con Uniform(0, 2/n_in) para respetar la restricción de signo, y sesgos a cero. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de imágenes.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada fija de 32x32x3 píxeles aplanada a 3072 dimensiones; no admite otras resoluciones sin reentrenamiento.
- Salida de 10 logits crudos (sin capa softmax incluida en los pesos; debe aplicarse externamente).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni multimodalidad más allá de la clasificación de imágenes fijas.
- Restricción estructural de pesos no negativos en capas >= 2, que puede aprovecharse como caso de estudio de interpretabilidad y optimización restringida.

## Casos de uso

- Docencia y prácticas de aprendizaje profundo: sirve como referencia para comparar un MLP restringido frente a un MLP estándar o una CNN en CIFAR-10, midiendo el impacto de la restricción de signo en la precisión (0.3968 en test).
- Estudio de optimización con restricciones: el mecanismo `w < 0 -> exp(w - 5)` puede analizarse como ejemplo de proyección suave sobre el ortante no negativo y compararse con ReLU o weight clipping.
- Reproducción de experimentos académicos: la semilla 2013, los hiperparámetros y el preprocesado están documentados, lo que permite replicar el entrenamiento y validar resultados.
- Baseline de bajo coste en CIFAR-10: al ser un MLP pequeño (~1.7 M de parámetros), puede ejecutarse en CPU para pruebas rápidas de pipelines de evaluación antes de pasar a modelos mayores.
- Análisis de robustez y sesgos en clasificación de imágenes: útil para estudiar cómo un modelo sin convoluciones ni aumentación se comporta ante clases visualmente similares (gato/perro, ciervo/caballo).
- Ejemplo de empaquetado de pesos en NumPy: el formato `model.npz` con layout (in, out) sirve para demostrar la carga manual de pesos sin frameworks de deep learning, útil en entornos embebidos o educativos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy CIFAR-10 (10.000 imágenes) | 0.3968 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un clasificador de imágenes y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB con los pesos en float32 (~1.7 M de parámetros, ~7 MB); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; una CPU moderna es suficiente. Cualquier GPU (RTX 3060, RTX 4090, A100, H100) ejecutaría la inferencia de forma trivial.
- Cabe en cualquier GPU consumer e incluso en dispositivos embebidos con pocos cientos de MB de RAM.
- Opciones de despliegue: carga directa con NumPy (`np.load`), o exportación a ONNX, PyTorch o TensorFlow para integración en pipelines existentes. No hay versiones GGUF ni soporte nativo en vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera del orden de microsegundos por muestra en CPU y menor en GPU, aunque no se ha medido ni publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sam5005/smai-a4-ioc-cifar10 | ~1.7 M (MLP) | 32x32x3 fija | 0.3968 | no disponible | HuggingFace |
| MLP estándar CIFAR-10 (referencia típica) | ~1.7 M | 32x32x3 fija | típicamente ~0.50-0.55 | variable | múltiples implementaciones |
| CNN pequeña tipo LeNet/VGG-mini | ~0.1-1 M | 32x32x3 fija | típicamente ~0.70-0.80 | variable | múltiples implementaciones |
| ResNet-18 adaptada a CIFAR-10 | ~11 M | 32x32x3 fija | típicamente ~0.93-0.95 | variable | torchvision, timm |

No se dispone de comparaciones oficiales publicadas por el autor; los rangos de referencia de los modelos alternativos son orientativos y corresponden a resultados habituales en la literatura, no a mediciones realizadas en esta ficha.

## Limitaciones y advertencias

- Precisión baja: 0.3968 en test, muy por debajo de una CNN básica en CIFAR-10, lo que refleja la limitación del MLP y de la restricción de pesos no negativos.
- Sesgos conocidos: no documentados por el autor; al entrenar solo con CIFAR-10, hereda los sesgos de composición y etiquetado de ese dataset.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí puede producir clasificaciones erróneas con alta confianza en clases visualmente próximas.
- Limitación de entrada: solo acepta imágenes de 32x32x3; no admite otras resoluciones ni formatos sin preprocesado específico.
- Sin licencia declarada: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Sin idiomas soportados: no procesa texto, por lo que no puede emplearse en tareas de NLP.
- Ausencia de model card extendida, benchmarks comparativos y documentación de evaluación más allá de la accuracy global; no hay matriz de confusión ni métricas por clase.
- Formato de pesos propietario en NumPy: requiere código de carga manual; no es directamente compatible con frameworks estándar sin conversión.
- Repositorio de 0.0 GB: conviene verificar que los pesos se hayan subido correctamente antes de intentar cargarlos.

## Enlaces

- HuggingFace: https://huggingface.co/Sam5005/smai-a4-ioc-cifar10
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
