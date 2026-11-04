# notplato/smai-a4-mlp

## Resumen

`smai-a4-mlp` es un perceptrón multicapa (MLP) de dos capas entrenado sobre CIFAR-10 por el usuario `notplato`, publicado en HuggingFace como entrega de la asignatura SMAI (Assignment 4, Q1, secciones 1.4/1.5). No se trata de un modelo de lenguaje ni de un modelo fundacional: es una red neuronal densa de clasificación de imágenes de 32x32 píxeles en 10 clases, implementada con NumPy y distribuida como ficheros `.npz` en lugar de safetensors o GGUF.

La arquitectura es explícita y minimalista: una capa de entrada de 3072 unidades (32 x 32 x 3 aplanado en orden HWC), una capa oculta de 256 neuronas con activación ReLU y una capa de salida de 10 logits correspondientes a las clases de CIFAR-10. El modelo se inicializa con distribución normal de varianza 2/n_in y sesgos a cero, y se entrena con descenso de gradiente estocástico (SGD), tasa de aprendizaje 0,02, tamaño de lote 64 y 100 épocas, con semilla 1146.

Su relevancia es exclusivamente pedagógica: sirve como referencia reproducible de un pipeline de entrenamiento y evaluación de un clasificador sencillo, con preprocesado estandarizado (media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento) y pesos cargables desde un cuaderno `mlp.ipynb`. No hay información publicada sobre licencia, idiomas, benchmarks ni pipeline de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP denso: 3072 -> 256 (ReLU) -> 10 (logits) |
| Parámetros totales | 3072 x 256 + 256 + 256 x 10 + 10 = 789.002 (calculado a partir de las dimensiones declaradas) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificador de imágenes, sin contexto textual) |
| Tipos de cuantización | No disponible (pesos en `model.npz` en precisión nativa de NumPy) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `.npz` (NumPy: W0, b0, W1, b1), más `preprocessing.npz` y `config.json` |

## Arquitectura y entrenamiento

La red es un MLP de dos capas completamente conectadas. La entrada es una imagen CIFAR-10 de 32x32x3 aplanada en orden HWC a 3072 valores, dividida por 255 y estandarizada con la media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento (valores almacenados en `preprocessing.npz`). Las matrices de pesos tienen forma `n_in x n_out`, y la activación de la capa oculta es ReLU.

El entrenamiento usa SGD con tasa de aprendizaje 0,02, tamaño de lote 64, 100 épocas, etiquetas verdaderas y semilla 1146 para reproducibilidad. La inicialización es normal con varianza 2/n_in y sesgos a cero. No se documenta uso de aumento de datos, regularización, optimizadores adaptativos, RLHF/DPO ni ninguna innovación técnica adicional; se trata de un ejercicio básico de descenso de gradiente sobre un clasificador lineal con una capa oculta.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia en NumPy puro mediante `Model.load_from("model.npz")` con activación ReLU.
- Reproducibilidad del preprocesado gracias a `preprocessing.npz` (media y desviación típica de entrenamiento).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Docencia y material de referencia: sirve como ejemplo mínimo y reproducible de un pipeline completo de clasificación de imágenes (carga, preprocesado, entrenamiento con SGD y evaluación) para asignaturas de aprendizaje automático.
- Verificación de implementaciones propias: al estar los pesos en `.npz` con formas documentadas, permite comprobar que una implementación de forward pass en NumPy produce los logits esperados.
- Baseline de comparación: un MLP de 789.002 parámetros sobre CIFAR-10 es un punto de partida útil para medir la mejora de arquitecturas convolucionales o transformers de visión en el mismo conjunto de datos.
- Pruebas de preprocesado: el fichero `preprocessing.npz` permite validar rutinas de estandarización (media/desviación típica sobre 50.000 imágenes) en otros proyectos.
- Experimentos de inicialización y optimización: la configuración declarada (init normal con varianza 2/n_in, SGD con lr 0,02, batch 64, 100 épocas) permite reproducir y variar hiperparámetros para estudiar su efecto.
- Integración en entornos educativos sin GPU: al ser NumPy puro y de tamaño reducido (repo de 0,0 GB), se puede ejecutar en CPU en cualquier portátil para demostraciones en clase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye precisión en CIFAR-10 (ni en entrenamiento ni en test), matrices de confusión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; los pesos ocupan del orden de unos pocos megabytes en `model.npz` (789.002 parámetros más los vectores de preprocesado).
- GPU recomendadas: no requiere GPU; funciona en CPU con NumPy.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa con NumPy mediante `Model.load_from("model.npz")` del cuaderno `mlp.ipynb`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de rendimiento ni detalles de otros clasificadores sobre CIFAR-10 que permitan una comparación rigurosa (parámetros, contexto, licencia y disponibilidad). Como referencia cualitativa, un MLP de este tamaño es sustancialmente más simple que arquitecturas convolucionales o transformers de visión empleadas habitualmente en CIFAR-10, pero no se dispone de cifras para cuantificar la diferencia.

## Limitaciones y advertencias

- Modelo puramente pedagógico: no está pensado para uso en producción ni para tareas distintas de la clasificación de imágenes de 32x32 píxeles en las 10 clases de CIFAR-10.
- Sin licencia declarada: no se especifican condiciones de uso comercial ni de redistribución; debe contactarse con el autor antes de cualquier uso más allá del académico.
- Sin métricas publicadas: no hay precisión de test ni validación reportada, por lo que se desconoce su calidad real.
- Sesgos potenciales: al entrenarse solo con CIFAR-10, hereda los sesgos y limitaciones de ese conjunto (clases balanceadas, imágenes de baja resolución, dominio muy restringido).
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Dependencia de implementación: requiere cargar los pesos con el código del cuaderno `mlp.ipynb` y respetar el orden HWC y la estandarización con `preprocessing.npz`; cualquier desviación en el preprocesado invalida los resultados.
- Repositorio de 0,0 GB y sin descargas ni likes: la disponibilidad y el mantenimiento a largo plazo no están garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/notplato/smai-a4-mlp
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
