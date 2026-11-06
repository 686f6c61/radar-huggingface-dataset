# armboss200/smai-assignment-4-mlp

## Resumen

El modelo `smai-assignment-4-mlp` es un clasificador de imágenes de tipo perceptrón multicapa (MLP) entrenado por el usuario armboss200 para la asignatura SMAI (Assignment 4, Q1). No se trata de un modelo de lenguaje ni de un modelo fundacional: es un experimento académico que opera directamente sobre píxeles crudos de CIFAR-10 (32x32x3), aplanados en un vector de 3.072 características. El modelo final se entrenó durante 100 épocas sobre las 50.000 imágenes originales de entrenamiento de CIFAR-10, sin selección de épocas basada en test, y distingue entre 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión).

La relevancia de este modelo es exclusivamente docente y metodológica: sirve como línea base "clean-label" (p=0) para comparar en la sección 1.5 del trabajo frente a variantes con etiquetas manipuladas. El autor advierte explícitamente en la model card que se trata de "un experimento de asignatura, no un clasificador de imágenes de producción". Los pesos se distribuyen en formato NPZ (NumPy), con matrices en orientación entrada-por-salida y todos los arrays en `float64`, lo que refleja un enfoque de precisión numérica inusual en inferencia práctica.

El repositorio tiene un tamaño de 0,0 GB y registra 0 descargas y 0 likes en el momento de la consulta. La licencia no está especificada, lo que impide determinar condiciones de reutilización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) sobre píxeles crudos aplanados; profundidad y anchuras definidas en `config.json` (valores concretos no disponibles en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes, entrada fija de 3.072 características) |
| Tipos de cuantizacion | no disponible; los pesos se publican en `float64` |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | NPZ de NumPy (`model.npz`, `numpy_mlp_selected.npz`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa que recibe como entrada un vector de 3.072 dimensiones resultante de aplanar en orden row-major cada imagen RGB de 32x32x3, normalizada dividiendo entre 255 y aplicando una estandarización con media y escala calculadas exclusivamente sobre las 50.000 imágenes de entrenamiento. La función de activación, la profundidad, las anchuras de capa, la tasa de aprendizaje, el tamaño de lote y los pasos de acumulación de gradiente se almacenan en `config.json` y en los metadatos embebidos del NPZ, pero sus valores concretos no se detallan en la información disponible. La pérdida empleada es entropía cruzada categórica (CCE) y el entrenamiento se realizó en PyTorch mediante la clase `TorchClassifier` del paquete `ioc_torch`.

El entrenamiento consistió en 100 épocas sobre el conjunto de entrenamiento original de CIFAR-10, sin usar el conjunto de test para seleccionar épocas, lo que el autor presenta como garantía de una línea base limpia. El NPZ incluye todas las matrices de pesos y sesgos, con orientación entrada-por-salida, y el cargador verifica las formas de la arquitectura antes de modificar parámetros. Adicionalmente, `numpy_mlp_selected.npz` conserva un modelo NumPy distinto, seleccionado en la sección 1.2.5 con un split propio de 36.000/12.000/12.000 y sus propias estadísticas de preprocesado. No se documenta uso de RLHF, DPO ni técnicas de aumento de datos más allá del preprocesado descrito.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases cerradas: airplane, automobile, bird, cat, deer, dog, frog, horse, ship y truck.
- Inferencia sobre píxeles crudos sin extractor de características convolucional ni backbone preentrenado.
- Salida de probabilidades por clase mediante `softmax` sobre los logits del modelo.
- Carga verificada de pesos con comprobación de formas de la arquitectura.
- Preprocesado autocontenido: media y escala embebidas en el NPZ, calculadas solo con datos de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni modo "thinking".
- No dispone de capacidades multilingües ni de generación de lenguaje.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: el modelo sirve como referencia reproducible para comparar arquitecturas MLP frente a CNN en CIFAR-10, con un pipeline de carga y preprocesado documentado paso a paso.
- Estudio de robustez frente a etiquetas corruptas: al ser la variante clean-label (p=0) del Assignment 4, permite medir la degradación de accuracy de variantes entrenadas con etiquetas manipuladas en el mismo protocolo.
- Reproducción de resultados académicos: los ficheros NPZ incluyen pesos, sesgos y metadatos de configuración, lo que facilita verificar cifras de la sección 1.5 sin reentrenar.
- Análisis de precisión numérica: al usar `float64` en todos los arrays, es útil para estudiar el efecto de la precisión en la estabilidad del entrenamiento y la inferencia de MLP pequeños.
- Comparación de particiones de datos: la coexistencia de `model.npz` (50.000 imágenes) y `numpy_mlp_selected.npz` (split 36.000/12.000/12.000) permite analizar el impacto del esquema de validación en el rendimiento final.
- Ejercicio de implementación de cargadores: el código de ejemplo con `ioc_torch.TorchClassifier` y la verificación de formas sirve como plantilla para prácticas de serialización de modelos en NumPy y PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al ser un MLP sobre 3.072 entradas y pesos en `float64`, el modelo es de tamaño reducido y probablemente inferior a 1 GB en memoria, pero no se especifican parámetros totales ni dimensiones de capa.
- GPU recomendadas: cualquier GPU con soporte PyTorch es suficiente; no se requiere A100, H100 ni RTX 4090 para este modelo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, aunque no se aportan cifras de latencia ni throughput.
- Opciones de despliegue: inferencia directa en PyTorch o NumPy mediante el cargador documentado; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-assignment-4-mlp | no disponible | 3.072 características (32x32x3) | no disponible | no disponible | Hugging Face (0 descargas) |
| LeNet-5 (referencia histórica CIFAR-10) | ~60.000 | 32x32x3 | ~60% accuracy en CIFAR-10 (referencia habitual de la literatura, no verificada en esta ficha) | variable | implementaciones múltiples |
| ResNet-18 (CIFAR-10) | ~11,2 M | 32x32x3 | ~93-95% accuracy con aumento de datos (referencia habitual, no verificada) | MIT (implementación torchvision) | torchvision |
| ViT-B/16 (CIFAR-10 fine-tuning) | ~86 M | 32x32x3 | ~98% con preentrenamiento a gran escala (referencia habitual, no verificada) | Apache 2.0 (implementación) | Hugging Face/timm |

Las cifras de los modelos comparables son referencias generales de la literatura y no se han verificado contra los artefactos de este repositorio; el modelo analizado no publica métricas propias, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo académico: el propio autor lo describe como "un experimento de asignatura, no un clasificador de imágenes de producción".
- Sin métricas publicadas: no hay accuracy, pérdida ni curvas de entrenamiento en la información disponible, lo que impide evaluar su calidad real.
- Sesgos desconocidos: no se documenta análisis de sesgo por clase ni de equilibrio del dataset más allá de CIFAR-10 estándar.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de clasificaciones erróneas con alta confianza en clases visualmente ambiguas (p. ej., gato vs. perro, ciervo vs. caballo).
- Limitación de dominio: solo reconoce las 10 clases de CIFAR-10; cualquier imagen fuera de ese conjunto se forzará a una de esas clases.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar uso comercial ni redistribución.
- Formato no estándar: los pesos en NPZ con `float64` no son compatibles directamente con pipelines de producción habituales (safetensors, GGUF, ONNX) sin conversión.
- Dependencia de `ioc_torch`: el código de carga hace referencia a un paquete no estándar que puede no estar disponible públicamente.
- Idiomas: no aplica, pero conviene señalar que no es un modelo de lenguaje y no debe evaluarse con criterios de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/armboss200/smai-assignment-4-mlp
- Dataset CIFAR-10 en Hugging Face: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
