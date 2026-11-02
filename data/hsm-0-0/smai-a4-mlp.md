# HSM-0-0/smai-a4-mlp

## Resumen

`smai-a4-mlp` es una red neuronal de tipo perceptrón multicapa (MLP) publicada por el usuario HSM-0-0 en HuggingFace como parte de la asignatura SMAI (Assignment 4). Se trata de un modelo de clasificación de imágenes entrenado sobre el conjunto de datos CIFAR-10, con una arquitectura simple de tres capas (3072-256-10) y un total de 787.000 parámetros. No es un modelo de lenguaje ni un transformer: es un clasificador de imágenes de 32x32 píxeles en 10 categorías.

El modelo se entrenó con descenso de gradiente estocástico (SGD) durante 100 épocas sobre las 50.000 imágenes de entrenamiento de CIFAR-10, y reporta una precisión de test de 0,5047. El autor lo describe explícitamente como la "baseline" (línea base) del trabajo, lo que sitúa su relevancia en el ámbito educativo y de comparación de arquitecturas, no en el de producción.

Su interés es limitado fuera del contexto académico: sirve como referencia para evaluar mejoras posteriores (mayor profundidad, regularización, optimizadores más avanzados) en tareas de clasificación de imágenes de baja resolución. La información disponible sobre licencia, idiomas y benchmarks adicionales es escasa o nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con capas 3072-256-10 |
| Parametros totales | 787.000 (3072×256 + 256 + 256×10 + 10) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato NumPy `.npz`) |
| Idiomas soportados | no disponible (clasificación de imágenes, sin texto) |
| Licencia | no disponible |
| Formato de pesos | `.npz` (NumPy), con `W0`, `W1`, `b0`, `b1`, `arch`, `acts` |

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas ocultas efectivas: una capa de entrada de 3072 dimensiones (32×32×3 píxeles aplanados), una capa oculta de 256 neuronas y una capa de salida de 10 clases. Cada capa calcula `x @ W + b`. El modelo incluye un fichero de preprocesado (`preproc.npz`) con la media y la desviación típica por columna calculadas sobre el conjunto de entrenamiento, que se aplican tras dividir los píxeles por 255.

El entrenamiento se realizó con SGD "plain" (sin momentum ni optimizadores adaptativos) durante 100 épocas sobre las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas. No se menciona el uso de data augmentation, regularización (dropout, weight decay) ni técnicas de inicialización específicas. El autor indica que este modelo es la línea base del Assignment 4, presumiblemente para comparar con variantes posteriores. No se detalla el tamaño del batch, la tasa de aprendizaje ni la composición exacta del dataset más allá de CIFAR-10.

## Capacidades

- Clasificación de imágenes de 32×32 píxeles en 10 categorías de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia sobre imágenes preprocesadas con la media y desviación típica del conjunto de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión avanzada, audio ni otras capacidades especiales.
- No es un modelo generativo: solo produce logits de clasificación.

## Casos de uso

- **Línea base académica para comparación de arquitecturas**: sirve como referencia de precisión (0,5047) para evaluar si variantes más profundas, con dropout o con optimizadores adaptativos mejoran el rendimiento en CIFAR-10.
- **Docencia en fundamentos de deep learning**: útil para explicar el flujo completo de un MLP (aplanado de imágenes, normalización, forward pass, cálculo de pérdida y backpropagation) sin la complejidad de una CNN.
- **Prototipado rápido de pipelines de clasificación**: al ser un modelo pequeño (787.000 parámetros) y con pesos en `.npz`, se puede cargar en cualquier entorno con NumPy y ejecutar en CPU sin dependencias de frameworks pesados.
- **Pruebas de integración en sistemas de inferencia**: adecuado para validar el preprocesado (media/desviación típica) y el formato de entrada antes de migrar a modelos mayores.
- **Experimentos de cuantización o compresión**: su reducido tamaño permite probar técnicas de poda o cuantización con bajo coste computacional.
- **Reproducción de resultados de un assignment**: permite verificar la precisión reportada (0,5047) y el proceso de entrenamiento descrito en la model card.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CIFAR-10 test accuracy | 0,5047 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un modelo de lenguaje. No se proporcionan comparaciones con otras arquitecturas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 (787.000 parámetros × 4 bytes ≈ 3,1 MB, más buffers intermedios).
- GPU recomendadas: no requiere GPU; funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos de baja potencia.
- Opciones de despliegue: carga directa con NumPy (`.npz`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; al ser un MLP de 787.000 parámetros, la inferencia en CPU es del orden de microsegundos por imagen, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-mlp | 787.000 | no aplica | 0,5047 | no disponible | HuggingFace |
| LeNet-5 (referencia histórica) | ~60.000 | no aplica | ~0,70 (con entrenamiento típico) | no disponible | Implementaciones públicas |
| ResNet-18 (referencia) | ~11,7 M | no aplica | ~0,93 | no disponible | Implementaciones públicas |

No se dispone de información sobre modelos comparables directos publicados en HuggingFace con la misma configuración exacta. Los valores de LeNet-5 y ResNet-18 son referencias históricas habituales en la literatura de CIFAR-10 y no provienen de la información proporcionada, por lo que deben tomarse con cautela.

## Limitaciones y advertencias

- **Precisión limitada**: 0,5047 en test es bajo para CIFAR-10; un MLP sin convoluciones ni regularización no captura bien la estructura espacial de las imágenes.
- **Sin información sobre sesgos**: no se han documentado sesgos conocidos, pero al entrenarse solo con CIFAR-10, hereda los sesgos y limitaciones de ese dataset.
- **Riesgo de alucinación**: no aplica (no es un modelo generativo), pero puede producir clasificaciones erróneas con alta confianza en imágenes ambiguas.
- **Limitaciones de contexto o idioma**: no aplica; solo procesa imágenes de 32×32 píxeles y no maneja texto.
- **Restricciones de licencia**: la licencia no está disponible, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- **Caveat para producción**: no es adecuado para aplicaciones reales de clasificación de imágenes; su uso previsto es educativo y como línea base.
- **Dependencia del preprocesado**: requiere aplicar exactamente la media y desviación típica de `preproc.npz`; de lo contrario, el rendimiento puede degradarse.

## Enlaces

- [HuggingFace: HSM-0-0/smai-a4-mlp](https://huggingface.co/HSM-0-0/smai-a4-mlp)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
