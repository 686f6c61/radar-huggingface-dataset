# arpita-sh/smai-a4-mlp

## Resumen

`smai-a4-mlp` es un modelo de red neuronal de tipo perceptrón multicapa (MLP) publicado en Hugging Face por el usuario `arpita-sh`. Se trata de un artefacto académico correspondiente a la asignación 4 de la asignatura SMAI (Statistical Methods in Artificial Intelligence). No es un modelo de lenguaje: es un clasificador de imágenes entrenado sobre CIFAR-10, con una arquitectura fully-connected de tres capas (3072-256-128-10) y activación ReLU en las capas ocultas.

El modelo resuelve una tarea de clasificación de imágenes en 10 clases (las clases de CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión). Su relevancia es exclusivamente educativa: sirve como referencia de implementación de un MLP desde cero con SGD, cross-entropy y normalización de entradas, no como componente para producción.

El repositorio tiene un tamaño de 0,0 GB según Hugging Face, lo que es coherente con un MLP pequeño (los pesos de una red 3072-256-128-10 ocupan del orden de 820.000 parámetros en float32, unos 3,3 MB). No dispone de descargas ni likes, y la model card es extremadamente escueta: solo describe la arquitectura y el preprocesado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP fully-connected, 3072-256-128-10, activación ReLU en capas ocultas |
| Parámetros totales | Aproximadamente 820.000 (calculado: 3072×256 + 256×128 + 128×10 + sesgos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible (pesos presumiblemente en float32 dentro de un `.npz`) |
| Idiomas soportados | No aplica |
| Licencia | No disponible |
| Formato de pesos | `.npz` de NumPy con arrays `W{i}`, `b{i}`, `mean` y `std` |
| Entrada | Imagen 32×32×3 aplanada a 3072, dividida por 255 y estandarizada |
| Salida | 10 logits (una por clase de CIFAR-10) |
| Dataset de entrenamiento | CIFAR-10, 50.000 imágenes de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa clásico con tres capas densas: una capa de entrada de 3072 unidades (32×32×3 píxeles aplanados), dos capas ocultas de 256 y 128 unidades con activación ReLU, y una capa de salida de 10 unidades. Los pesos se almacenan con la convención `W{i}` de forma `(n_in, n_out)` y sesgos `b{i}` de forma `(n_out,)`, lo que implica una multiplicación `x @ W + b` en la implementación de referencia.

El entrenamiento se realizó con descenso de gradiente estocástico (SGD) puro, sin momento ni Adam, con tasa de aprendizaje 0,05, tamaño de lote 64 y 100 épocas. La función de pérdida es cross-entropy y el autor indica explícitamente "true labels (p = 0)", es decir, sin label smoothing ni ruido en las etiquetas. El preprocesado consiste en aplanar la imagen, dividir por 255 y estandarizar con la media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento, valores que se guardan en el propio `.npz` como `mean` y `std`. No se menciona aumento de datos, regularización (dropout, weight decay) ni validación cruzada.

## Capacidades

- Clasificación de imágenes de 32×32×3 en 10 clases de CIFAR-10.
- Inferencia determinista mediante una única pasada hacia adelante (forward pass) con NumPy.
- Reutilización del preprocesado: el `.npz` incluye `mean` y `std` para estandarizar nuevas imágenes de forma consistente con el entrenamiento.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo thinking, visión avanzada ni audio; la "visión" se limita a clasificación de imágenes de baja resolución.

## Casos de uso

- Docencia y prácticas de deep learning: sirve como ejemplo canónico de MLP implementado desde cero para explicar forward pass, backpropagation y SGD en clase.
- Verificación de pipelines de preprocesado: el par `mean`/`std` incluido permite comprobar que una implementación de estandarización reproduce exactamente la del autor.
- Baseline de clasificación en CIFAR-10: útil como referencia mínima (MLP sin convoluciones) frente a la que comparar CNNs y otros modelos.
- Reproducción de experimentos académicos: permite replicar el entrenamiento con SGD lr=0,05, batch 64 y 100 épocas para estudiar curvas de convergencia.
- Pruebas de integración en frameworks de inferencia en NumPy: al ser pesos en `.npz`, se puede cargar sin dependencias pesadas y usar en tests unitarios de serving.
- Ejemplo de serialización de pesos: sirve para ilustrar convenciones de almacenamiento (`W{i}`, `b{i}`) en cursos de ingeniería de ML.
- No es adecuado para aplicaciones de producción reales: su precisión esperada en CIFAR-10 con esta arquitectura es baja en comparación con CNNs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye precisión de entrenamiento, precisión de test, matriz de confusión ni curvas de pérdida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; los pesos ocupan aproximadamente 3,3 MB en float32.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3050, RTX 4090, etc.) e incluso en dispositivos embebidos.
- Opciones de despliegue: NumPy directamente (carga del `.npz`), o exportación manual a ONNX/TensorFlow si se desea. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia por lote en CPU debería ser del orden de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smai-a4-mlp | MLP 3072-256-128-10 | ~820.000 | No aplica | No disponible | No disponible | Hugging Face |
| LeNet-5 | CNN | ~60.000 | No aplica | No disponible (referencia histórica) | No disponible | Múltiples implementaciones |
| ResNet-18 | CNN | ~11,2 M | No aplica | ~93-95 % típico en CIFAR-10 | MIT (implementaciones comunes) | torchvision |
| VGG-11 | CNN | ~132 M | No aplica | ~92-93 % típico en CIFAR-10 | No disponible | torchvision |

La comparación directa es difícil porque `smai-a4-mlp` no publica métricas. Frente a CNNs como ResNet-18 o VGG-11, un MLP de tres capas sobre píxeles aplanados pierde toda la información espacial y suele quedarse en el entorno del 50-55 % de precisión en CIFAR-10, aunque este dato no está confirmado por el autor.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para generación de texto, código, razonamiento ni tareas de NLP.
- No publica métricas de rendimiento, por lo que no se puede evaluar su calidad sin reentrenarlo o evaluarlo uno mismo.
- Licencia no especificada: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Sin información sobre sesgos: al entrenarse en CIFAR-10, hereda los sesgos y desequilibrios de ese dataset (clases balanceadas, pero imágenes de baja resolución y contextos limitados).
- Riesgo de sobreajuste: 100 épocas con SGD lr=0,05 y sin regularización explícita en un MLP de ~820.000 parámetros sobre 50.000 imágenes es propenso a overfitting; no se documenta validación.
- Limitación de entrada: solo acepta imágenes de 32×32×3; no hay redimensionado ni aumento de datos en la inferencia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de mantenimiento.
- El tamaño del repo indicado por Hugging Face (0,0 GB) sugiere que los pesos pueden no estar subidos o que el redondeo oculta un tamaño muy pequeño; conviene verificar los archivos antes de confiar en la disponibilidad del `.npz`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arpita-sh/smai-a4-mlp
- Dataset CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
