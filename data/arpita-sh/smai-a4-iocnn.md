# arpita-sh/smai-a4-iocnn

## Resumen

`arpita-sh/smai-a4-iocnn` es un modelo de red neuronal completamente conectada (MLP) entrenado para clasificación de imágenes sobre el conjunto de datos CIFAR-10. Lo desarrolla el usuario de HuggingFace `arpita-sh` en el contexto de una asignatura de *Statistical Methods in Artificial Intelligence* (SMAI), como indica el propio nombre del repositorio, y parece tratarse de un artefacto académico más que de un modelo destinado a producción.

La arquitectura es una MLP de tres capas con dimensiones 3072-256-128-10: la entrada son las 32x32x3 píxeles de CIFAR-10 aplanadas en un vector de 3072 elementos, seguidas de dos capas ocultas de 256 y 128 neuronas con activación ELU, y una capa de salida de 10 clases. El entrenamiento emplea entropía cruzada, descenso de gradiente estocástico con tasa de aprendizaje 0,05, tamaño de lote 64 y 100 épocas, con etiquetas verdaderas (sin ruido de etiquetas, p = 0).

Su relevancia práctica es limitada: no hay pesos publicados en formatos estándar de inferencia, no se declara licencia, no se especifican idiomas (no aplica, es un clasificador de imágenes) y el repositorio tiene 0 GB de tamaño según los metadatos, lo que sugiere que el contenido puede no estar disponible o ser meramente descriptivo. Resulta útil únicamente como referencia educativa de una implementación básica de MLP sobre CIFAR-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) densa, 3072-256-128-10, activación ELU en capas ocultas |
| Parametros totales | 819.722 (calculado: 3072×256 + 256 + 256×128 + 128 + 128×10 + 10) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; clasificador de imágenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card menciona un archivo `.npz` con `W{i}`, `b{i}`, `mean` y `std`, pero no se confirma su presencia en el repo) |

## Arquitectura y entrenamiento

La red es una MLP puramente densa sin componentes convolucionales ni mecanismos de atención. La entrada se obtiene aplanando cada imagen de CIFAR-10 de 32x32x3 a un vector de 3072 dimensiones, dividiéndola por 255 y estandarizándola con la media y la desviación típica calculadas sobre las 50.000 imágenes de entrenamiento (ambos valores se almacenan en el `.npz` como `mean` y `std`). Las dos capas ocultas usan activación ELU y la salida tiene 10 unidades, una por clase de CIFAR-10.

El entrenamiento se realizó con pérdida de entropía cruzada, SGD con tasa de aprendizaje 0,05, tamaño de lote 64 y 100 épocas, usando etiquetas verdaderas (p = 0, es decir, sin inyección de ruido en las etiquetas). La model card no documenta técnicas de aumento de datos, regularización (dropout, weight decay), inicialización, scheduler de learning rate ni validación cruzada. Tampoco se indica el número total de tokens ni composición de dataset más allá de las 50.000 imágenes de entrenamiento de CIFAR-10. No hay evidencia de RLHF, DPO ni ajuste fino posterior.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada exclusivamente de imágenes de 32x32 píxeles RGB; no admite otras resoluciones sin remuestreo externo.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo *thinking*, visión general, audio ni multimodalidad más allá de la clasificación de imágenes fijas.
- No se documentan capacidades de extracción de características o embeddings intermedios, aunque técnicamente la capa oculta de 128 unidades podría usarse como representación, sin que el autor lo especifique.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: el modelo sirve como ejemplo mínimo de MLP entrenada desde cero sobre CIFAR-10 para ilustrar el flujo completo de preprocesado (aplanado, normalización con media y desviación típica), definición de capas, función de pérdida y bucle de entrenamiento con SGD.
- Reproducción de experimentos académicos: permite replicar la configuración 3072-256-128-10 con ELU, SGD lr 0,05, batch 64 y 100 épocas para comparar frente a variantes con ReLU, Adam u otras tasas de aprendizaje en un entorno controlado.
- Referencia de línea base para comparativas: al ser una MLP sin convoluciones, puede usarse como *baseline* de baja complejidad frente a CNN y Vision Transformers en CIFAR-10, evidenciando la brecha de rendimiento entre arquitecturas densas y convolucionales.
- Estudio de preprocesado: el archivo `.npz` incluye `mean` y `std` de las 50.000 imágenes de entrenamiento, lo que facilita analizar el impacto de la estandarización en la convergencia de una MLP.
- Prototipado educativo de despliegue: dado su reducido tamaño (menos de un millón de parámetros), puede cargarse y ejecutarse en CPU para demostrar el ciclo de inferencia de un clasificador de imágenes en un cuaderno o script docente.
- Análisis de sensibilidad al ruido de etiquetas: la model card especifica p = 0 (etiquetas verdaderas), por lo que el modelo puede servir como punto de partida para experimentos que introduzcan ruido controlado y midan la degradación de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precisión de entrenamiento, validación ni test sobre CIFAR-10, ni comparaciones con otras arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 para los 819.722 parámetros (aproximadamente 3,3 MB de pesos más buffers de activación mínimos). Cabe holgadamente en cualquier GPU, incluida una GTX 1050 o incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer (GTX serie 10 en adelante, RTX 20/30/40) es más que suficiente. Para entrenamiento, una GPU modesta acelera las 100 épocas, aunque el modelo es entrenable en CPU en tiempos razonables.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en sistemas embebidos con suficiente memoria para el runtime de NumPy o PyTorch.
- Opciones de despliegue: el formato `.npz` sugiere carga con NumPy y cálculo manual de las multiplicaciones matriciales; también podría reimplementarse en PyTorch o TensorFlow. No hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de microsegundos a milisegundos por imagen en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arpita-sh/smai-a4-iocnn | MLP 3072-256-128-10, ELU | 819.722 | Imagen 32x32x3 fija | no disponible | Repo HuggingFace, 0 GB, sin pesos confirmados |
| LeNet-5 (referencia histórica) | CNN con 2 capas convolucionales y 3 densas | ~60.000 | Imagen 32x32 | pública (referencia académica) | Implementaciones múltiples |
| ResNet-20 (CIFAR-10) | CNN residual | ~270.000 | Imagen 32x32 | pública (referencia académica) | Implementaciones múltiples |
| ViT pequeño para CIFAR-10 | Transformer con parches | millones | Imagen 32x32 | variable según implementación | Implementaciones múltiples |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con estas alternativas; la comparativa se limita a arquitectura, tamaño y disponibilidad.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe considerarse restringido hasta aclaración del autor.
- El repositorio figura con 0 GB de tamaño y no se confirma la presencia de los pesos en formato utilizable; la model card describe un `.npz` con `W{i}`, `b{i}`, `mean` y `std`, pero no hay garantía de que esté subido.
- No hay métricas de precisión publicadas, ni de entrenamiento ni de test, lo que impide evaluar su calidad real sobre CIFAR-10.
- La arquitectura MLP sin convoluciones ni atención tiene capacidad limitada para capturar estructura espacial; se espera un rendimiento muy inferior al de CNN y transformers en CIFAR-10.
- Entrada fija de 32x32x3: no admite imágenes de otras resoluciones sin un remuestreo externo que puede degradar el rendimiento.
- Riesgo de sobreajuste no documentado: no se especifican dropout, weight decay ni aumento de datos, y 100 épocas con SGD lr 0,05 sobre 50.000 imágenes puede sobreajustar sin regularización.
- No aplica a tareas de lenguaje, agentes, tool calling ni multimodalidad general; su uso está acotado a clasificación de imágenes de CIFAR-10.
- Sesgos conocidos: no documentados por el autor; CIFAR-10 es un conjunto académico de baja resolución con posibles sesgos de representación, pero no se aporta análisis al respecto.
- Riesgo de alucinación: no aplica en sentido estricto al ser un clasificador, pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- No hay información sobre el proceso de validación ni sobre posibles fugas entre entrenamiento y test.

## Enlaces

- HuggingFace: https://huggingface.co/arpita-sh/smai-a4-iocnn
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
