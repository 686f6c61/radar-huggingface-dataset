# rimoKR/cifar10-mlp-p0

## Resumen

Este modelo es un perceptrón multicapa (MLP) entrenado para clasificar imágenes del conjunto de datos CIFAR-10, desarrollado por el usuario rimoKR como entrega de la tarea 1.4.2 de una asignatura de métodos estadísticos de inteligencia artificial (SMAI Assignment 4). No es un modelo de lenguaje, sino un clasificador de imágenes muy pequeño, con apenas 789.258 parámetros, entrenado con etiquetas verdaderas del dataset (p = 0, es decir, sin ruido en las etiquetas).

El modelo resuelve el problema clásico de clasificación en 10 categorías (aviones, coches, pájaros, gatos, ciervos, perros, ranas, caballos, barcos y camiones) a partir de imágenes de 32x32 píxeles en color. Su relevancia es principalmente didáctica: sirve como línea base (baseline) para comparar el rendimiento de arquitecturas más complejas, o para estudiar el efecto del ruido en las etiquetas dentro de un experimento controlado, dado que la nomenclatura "p = 0" sugiere que forma parte de una serie de modelos entrenados con distintos niveles de corrupción de etiquetas.

Está implementado en PyTorch y se distribuye como un `state_dict` junto con los parámetros de preprocesamiento (media y desviación típica) necesarios para replicar exactamente la normalización aplicada durante el entrenamiento. No utiliza convoluciones, por lo que su precisión esperada en CIFAR-10 es notablemente inferior a la de una CNN, algo habitual y esperado en este tipo de ejercicios académicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa), capas [3072, 256, 10] |
| Parámetros totales | 789.258 |
| Parámetros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (modelo de visión, no de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`mlp-p0.pt`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un MLP sencillo con dos capas lineales: la entrada es una imagen CIFAR-10 aplanada a un vector de 3.072 dimensiones (32x32x3), seguida de una capa oculta de 256 neuronas con activación ReLU, y una capa de salida de 10 logits sin activación final (la función de pérdida de entropía cruzada de PyTorch aplica softmax internamente). La inicialización de pesos sigue la recomendación de Kaiming/He para capas con ReLU: distribución normal N(0, 2/n_in) en la capa oculta y N(0, 1/n_in) en la de salida, con sesgos inicializados a cero.

El entrenamiento se realizó con las 50.000 imágenes de entrenamiento de CIFAR-10 con sus etiquetas verdaderas (sin ruido, p = 0), usando descenso de gradiente estocástico (SGD) puro sin momento ni planificación de tasa de aprendizaje, con lr = 0,01, tamaño de batch de 64, acumulación de gradientes de 1 y 100 épocas completas sin parada temprana. El preprocesamiento consistió en aplanar la imagen, convertir a flotante dividiendo entre 255 y estandarizar cada columna con la media y desviación típica calculadas sobre el conjunto de entrenamiento; estos estadísticos se guardan en `preprocessing.npz` (sustituyendo por 1 las desviaciones típicas nulas para evitar divisiones por cero). No hay ninguna innovación técnica destacable: es un experimento de referencia deliberadamente simple.

## Capacidades

- Clasificación de imágenes en las 10 clases de CIFAR-10 (avión, coche, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia determinista y ligera: dada una imagen aplanada y normalizada, devuelve 10 logits.
- No soporta generación de texto, razonamiento, código, matemáticas, audio ni vision-language.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- Utilidad especial como baseline académico: permite comparar el efecto del ruido de etiquetas (versiones con p > 0) frente a entrenamiento con etiquetas limpias.

## Casos de uso

- Baseline didáctico en cursos de machine learning: sirve como punto de referencia para medir cuánto mejora una CNN o una red residual sobre un MLP puro en CIFAR-10, un ejercicio habitual en asignaturas de visión por computador.
- Experimentos sobre ruido en etiquetas: al formar parte de una serie (p = 0), permite comparar con modelos hermanos entrenados con etiquetas corruptas para estudiar la robustez al ruido de las etiquetas.
- Prueba de integración en pipelines de PyTorch: su pequeño tamaño y formato `state_dict` lo hacen ideal para tests unitarios de código de carga, inferencia y exportación de modelos.
- Enseñanza del preprocesamiento reproducible: los ficheros `preprocessing.npz` ilustran cómo guardar y reutilizar estadísticos de normalización para que inferencia y entrenamiento sean coherentes.
- Ejecución en hardware mínimo: al tener menos de 1 millón de parámetros, puede ejecutarse en CPU sin GPU, útil para entornos educativos sin aceleradores.
- Estudio de la inicialización de pesos: permite verificar empíricamente el efecto de la inicialización de Kaiming para ReLU en un modelo suficientemente pequeño para entrenarse en segundos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye precisión (accuracy) en el conjunto de test de CIFAR-10 ni ninguna otra métrica de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; con 789.258 parámetros en float32 el modelo ocupa unos 3 MB de memoria. No se necesita GPU.
- GPU recomendadas: no se necesita ninguna GPU; cualquier CPU moderna es suficiente. Si se desea reentrenar (100 épocas sobre 50.000 imágenes), también es viable en CPU en pocos minutos.
- Consumer GPUs: cabe sobradamente en cualquier GPU, incluidas integradas; el modelo es demasiado pequeño para que la GPU suponga una ventaja significativa.
- Opciones de despliegue: PyTorch nativo (cargando `mlp-p0.pt` con `torch.load` y reconstruyendo el `nn.Sequential` correspondiente). No es compatible directamente con llama.cpp, Ollama, vLLM o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible; por el tamaño del modelo, la inferencia por imagen en CPU está en el orden de microsegundos a milisegundos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rimoKR/cifar10-mlp-p0 | MLP [3072, 256, 10] | 789.258 | Clasificación CIFAR-10 | MIT | Hugging Face |
| LeNet-5 (referencia clásica) | CNN (2 conv + 2 FC) | ~62.000 | Clasificación CIFAR-10/MNIST | no aplicable (implementaciones variadas) | Implementaciones públicas |
| ResNet-18 (CIFAR-10) | CNN residual | ~11,2 millones | Clasificación CIFAR-10 | MIT (implementación torchvision) | torchvision |

Un MLP sin capas convolucionales obtiene en CIFAR-10 una precisión típicamente muy inferior a la de arquitecturas convolucionales (LeNet-5 y ResNet suelen superar el 70-90 % de accuracy, mientras que un MLP de este tamaño ronda valores mucho más bajos). No se han publicado cifras concretas para este modelo, por lo que la comparativa es cualitativa.

## Limitaciones y advertencias

- Al ser un MLP sin convoluciones, no explota la estructura espacial de las imágenes: la precisión esperada en CIFAR-10 es baja comparada con una CNN, y el modelo no debe usarse en aplicaciones reales de visión.
- No hay métricas de evaluación publicadas: no se conoce su accuracy en test, ni su curva de entrenamiento, ni si sufre sobreajuste tras 100 épocas sin early stopping.
- El preprocesamiento es crítico: la inferencia debe aplicar exactamente la misma estandarización (media y std de `preprocessing.npz`); usar otra normalización degradará los resultados.
- Riesgo de alucinación: no aplicable (no es un modelo generativo).
- Licencia MIT: sin restricciones para uso comercial, pero al tratarse de un ejercicio académico no hay garantías de calidad ni soporte.
- Sesgos conocidos: no documentados; hereda los sesgos del dataset CIFAR-10 (imágenes pequeñas, de baja resolución y con clases limitadas).
- Formato de pesos no estándar en la industria (`state_dict` de PyTorch en lugar de safetensors), lo que requiere confiar en el fichero tal cual y reconstruir la arquitectura manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rimoKR/cifar10-mlp-p0
- Dataset CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado enlaces adicionales (paper, blog, repositorio de código o demo) en la información disponible.
