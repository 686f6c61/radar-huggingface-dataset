# dharmask/smai-a4-mlp

## Resumen

smai-a4-mlp es un modelo neuronal de tipo perceptrón multicapa (MLP) entrenado para clasificación de imágenes sobre el conjunto de datos CIFAR-10. Lo desarrolla el usuario dharmask y se publica como artefacto asociado a una asignatura (el repositorio de referencia se menciona como "assignment repository" y el modelo aparece etiquetado como "final clean-label model"). No es un modelo de lenguaje ni un modelo generativo: es un clasificador de imágenes de 10 clases con una arquitectura totalmente conectada de tres capas y 10 salidas (logits).

La arquitectura es explícita en la model card: 3072-64-32-10, es decir, una entrada aplanada de 3072 valores (32x32x3 píxeles RGB), dos capas ocultas de 64 y 32 neuronas y una capa de salida de 10 logits correspondientes a las clases de CIFAR-10. Los pesos se almacenan en float64 y el entrenamiento finaliza en la época 100. El repositorio incluye los pesos en formato PyTorch (`state_dict.pt`) y NumPy (`weights.npz`), un `config.json` con metadatos de arquitectura, etiquetas, semillas y entrenamiento, un `preprocessing.npz` con media, desviación típica y escala calculadas solo sobre el conjunto de entrenamiento oficial, y un script `inference.py`.

Su relevancia es limitada fuera del contexto académico: sirve como referencia reproducible de un clasificador pequeño de CIFAR-10 con preprocesado documentado y pesos en dos formatos, útil para estudiar limpieza de etiquetas ("clean-label"), reproducibilidad de semillas y comparación de implementaciones entre PyTorch y NumPy. No debe confundirse con un modelo de propósito general: no procesa texto, no soporta tool calling ni agentes, y su única tarea es clasificar imágenes de 32x32 píxeles en una de diez categorías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado, 3072-64-32-10 (tres capas densas, activaciones no especificadas en la model card) |
| Parametros totales | No disponible de forma explícita; según la arquitectura 3072-64-32-10 serían 3072x64 + 64 + 64x32 + 32 + 32x10 + 10 = 198.890 parámetros (cálculo derivado, no confirmado por el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificador de imágenes; entrada fija de 3072 valores) |
| Tipos de cuantizacion | No disponible; pesos en float64 según la model card |
| Idiomas soportados | No aplica (modelo de visión, no de texto) |
| Licencia | No disponible |
| Formato de pesos | `state_dict.pt` (PyTorch) y `weights.npz` (NumPy, pesos en formato row-vector); metadatos en `config.json` y preprocesado en `preprocessing.npz` |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa clásico con entrada aplanada de 3072 dimensiones (imágenes CIFAR-10 de 32x32x3), dos capas ocultas de 64 y 32 unidades y una capa de salida de 10 logits, uno por clase. Los pesos se guardan en precisión float64, lo que sugiere un entrenamiento y una inferencia orientados a reproducibilidad numérica más que a eficiencia. La model card indica que se trata de la época final 100 de entrenamiento y que el modelo es "clean-label", lo que en la literatura de CIFAR-10 suele referirse a entrenamiento sin etiquetas corruptas o a un protocolo de etiquetado controlado, aunque el autor no detalla el procedimiento exacto.

El repositorio incluye un fichero `preprocessing.npz` con media, desviación típica y escala calculadas exclusivamente sobre el conjunto de entrenamiento oficial, lo que evita fuga de información del conjunto de test. El `config.json` contiene la arquitectura, las etiquetas, las semillas y metadatos de entrenamiento. No se documentan en la información disponible el número de épocas totales más allá de la época final, el optimizador, la función de pérdida, el tamaño de lote, el uso de aumentación de datos ni si hubo regularización (dropout, weight decay). Tampoco se especifica si el entrenamiento se realizó desde cero o con inicialización concreta más allá de la semilla indicada en la configuración.

No hay innovaciones técnicas destacables: no emplea atención, no es un transformer, no hay decodificación especulativa ni mecanismos híbridos. La única particularidad reseñable es la doble implementación (PyTorch y NumPy) con preprocesado compartido y la mención a una "garantía de convexidad IOC" aplicable a los logits, un detalle del contexto académico del autor que no se desarrolla en la model card.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión, según las etiquetas estándar del conjunto).
- Inferencia en NumPy puro mediante `predict(raw_uint8_rgb_minibatch, '.')`, que acepta minilotes de imágenes RGB en uint8 y devuelve clases y logits.
- Inferencia en PyTorch recargando `state_dict.pt` con la función `fresh_model` del repositorio de la asignatura, aplicando el preprocesado guardado antes del forward.
- Salida de logits (el softmax es opcional según la model card).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión de alta resolución, audio ni otras modalidades.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: el modelo sirve como referencia completa de un flujo de entrenamiento y evaluación sobre CIFAR-10, con configuración, preprocesado y pesos en dos formatos, lo que facilita comparar implementaciones en PyTorch y NumPy en un mismo ejercicio.
- Estudio de protocolos clean-label: al estar etiquetado como "final clean-label model", permite reproducir experimentos sobre el efecto de etiquetas limpias frente a etiquetas ruidosas en un clasificador pequeño, usando las semillas y metadatos del `config.json`.
- Verificación de preprocesado y reproducibilidad: el `preprocessing.npz` calculado solo con el conjunto de entrenamiento oficial permite auditar que no hay fuga de información y comprobar que las métricas reportadas son comparables entre implementaciones.
- Baseline de clasificación de imágenes de bajo coste: con unos 199.000 parámetros y entrada de 3072 valores, se puede ejecutar en CPU en milisegundos, lo que lo hace útil como línea base en experimentos donde el coste computacional es una restricción.
- Pruebas de integración de pipelines de inferencia: el script `inference.py` con interfaz `predict(minibatch, ruta)` es un ejemplo mínimo para validar el conexionado entre carga de datos, preprocesado y salida de logits antes de sustituir el modelo por uno mayor.
- Comparación de formatos de pesos: la disponibilidad de `state_dict.pt` y `weights.npz` permite verificar la equivalencia numérica entre la implementación de PyTorch y la de NumPy, útil para validar conversiones de pesos en proyectos de portabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud en test, matriz de confusión ni comparación con otras arquitecturas sobre CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en float64 (unos 199.000 parámetros x 8 bytes ≈ 1,6 MB si se cuentan todos los pesos y sesgos); cabe holgadamente en cualquier GPU, incluida una iGPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. En GPU, cualquier modelo desde una GTX 1050 en adelante ejecuta la inferencia sin problema.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales y en la mayoría de sistemas embebidos con Python y NumPy.
- Opciones de despliegue: inferencia directa con NumPy (`inference.py`) o con PyTorch (`state_dict.pt`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia por minilote en CPU debería ser del orden de microsegundos a pocos milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smai-a4-mlp (dharmask) | MLP 3072-64-32-10 | ~199.000 (derivado) | 3072 valores (32x32x3) | Clasificación CIFAR-10 | No disponible | Hugging Face |
| LeNet-5 clásico | CNN 2 conv + 3 densas | ~60.000 | 32x32x1 o 32x32x3 | Clasificación CIFAR-10 | Dominio público / variable | Múltiples implementaciones |
| ResNet-18 | CNN residual | ~11,2 millones | 224x224x3 (adaptable a 32x32) | Clasificación de imágenes | BSD-3 / MIT en implementaciones comunes | torchvision, timm |
| VGG-11 | CNN | ~132 millones | 224x224x3 | Clasificación de imágenes | Variable según implementación | torchvision, timm |

La comparación es orientativa: no se dispone de métricas de precisión del modelo de dharmask, por lo que no es posible establecer una comparación cuantitativa de rendimiento con las alternativas. La diferencia principal es de escala y propósito: smai-a4-mlp es un artefacto académico mínimo, mientras que LeNet-5, ResNet-18 y VGG-11 son arquitecturas de referencia ampliamente implementadas y con licencias conocidas.

## Limitaciones y advertencias

- No se especifica licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso en producción.
- No hay métricas publicadas de exactitud ni de robustez, por lo que no es posible evaluar su calidad real sobre CIFAR-10 a partir de la información disponible.
- El modelo solo clasifica imágenes de 32x32 píxeles en 10 clases; no admite otras resoluciones ni otras taxonomías sin reentrenamiento.
- Al ser un MLP sin convoluciones, es previsible que su rendimiento sea inferior al de arquitecturas convolucionales en la misma tarea, aunque no hay datos que lo confirmen.
- Riesgo de sesgo heredado del conjunto CIFAR-10, que contiene categorías desequilibradas y estereotipadas; la model card no documenta análisis de sesgo.
- La model card menciona una "garantía de convexidad IOC" para los logits sin desarrollarla; no debe interpretarse como una garantía de calibración probabilística.
- El preprocesado debe aplicarse exactamente como se guarda en `preprocessing.npz` antes de un forward directo en PyTorch; omitirlo produce resultados incorrectos.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB reportado, lo que sugiere que los ficheros podrían no estar completamente subidos o que el repositorio es de muy reciente creación; conviene verificar la integridad de los artefactos antes de usarlos.
- No hay soporte documentado de mantenimiento, issues ni hoja de ruta; es un artefacto académico sin garantías de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dharmask/smai-a4-mlp
- Repositorio de la asignatura: no disponible como enlace directo en la información proporcionada (la model card lo menciona como "assignment repository")
- Paper, blog o demo: no disponibles en la información proporcionada
