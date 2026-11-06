# imradhe/smai-a4-cifar10-iocnn

## Resumen

`smai-a4-cifar10-iocnn` es un artefacto de investigación publicado por el usuario `imradhe` en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo generativo, sino de un `state_dict` de PyTorch correspondiente a una red neuronal fully-connected (MLP) denominada Input-Output Convex Neural Network (IOC-NN), entrenada sobre el conjunto de datos CIFAR-10 con etiquetas limpias (parámetro `p=0`). Forma parte de un ejercicio académico (SMAI A4, Task 1.5) orientado a comparar el comportamiento de una MLP convencional frente a una variante con restricciones de convexidad en la salida.

La arquitectura declarada es `[3072, 256, 128, 10]`, con activación `elu` en las capas ocultas. La entrada es una imagen CIFAR-10 aplanada a 3072 valores float, normalizada dividiendo entre 255 y estandarizada por columna con la media y desviación típica del conjunto de entrenamiento. La precisión reportada en test es de 0,4950 para la MLP y 0,4118 para la IOC-NN.

Su relevancia es exclusivamente didáctica y experimental: sirve como referencia reproducible para estudiar cómo las restricciones de convexidad input-output afectan a la capacidad de ajuste de una red pequeña en una tarea de clasificación de imágenes de 10 clases. No está pensado para producción ni para uso como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP fully-connected con restricción Input-Output Convex (IOC-NN), capas `[3072, 256, 128, 10]`, activación oculta `elu` |
| Parámetros totales | no disponible (estimable en torno a 820.000 a partir de las dimensiones de capa, sin confirmación del autor) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, entrada fija de 3072 floats) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `state_dict` de PyTorch (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La red es una MLP de tres capas transformadoras con dimensiones 3072 → 256 → 128 → 10 y activación `elu` en las capas ocultas. La variante IOC-NN impone una restricción de convexidad en la relación entrada-salida, lo que en la práctica limita la expresividad del modelo y explica la brecha de precisión observada frente a la MLP sin restricción (0,4118 frente a 0,4950 en test). El repositorio incluye dos ficheros auxiliares: `iocnn_preprocessing.json`, con los vectores `col_mean` y `col_std` calculados sobre el conjunto de entrenamiento, e `iocnn_architecture.json`, con la descripción completa de la arquitectura.

El entrenamiento se realizó sobre CIFAR-10 con etiquetas limpias (`p=0`), es decir, sin inyección de ruido en las etiquetas. No se especifican en la model card el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de batch ni si hubo aumentación de datos. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste fino posterior, algo esperable dado que no es un modelo generativo.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada fija: imagen aplanada de 3072 valores float, normalizada y estandarizada por columna.
- Salida: vector de 10 logits, uno por clase.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos académicos: cargar el `state_dict` junto con `iocnn_preprocessing.json` e `iocnn_architecture.json` para replicar los resultados de la Task 1.5 y verificar la brecha MLP vs IOC-NN.
- Estudio de restricciones de convexidad: comparar el comportamiento de la IOC-NN frente a una MLP equivalente para analizar cómo la convexidad input-output penaliza la precisión en clasificación de imágenes naturales.
- Material docente en cursos de aprendizaje automático: ilustrar el efecto de las restricciones arquitectónicas sobre la capacidad de generalización en un dataset estándar y de pequeño tamaño.
- Baseline de referencia en experimentos con etiquetas ruidosas: al estar entrenado con `p=0`, sirve como punto de comparación frente a variantes entrenadas con ruido en las etiquetas.
- Pruebas de pipelines de preprocesado: validar implementaciones de normalización por columna (media/desviación típica del train set) usando los parámetros publicados en el JSON.
- Ejercicios de ingeniería de modelos: analizar el impacto del tamaño de capas ocultas (256, 128) y de la activación `elu` en una tarea de 10 clases con entrada de alta dimensión.

## Benchmarks y rendimiento

| Modelo | Precisión en test (CIFAR-10, p=0) |
|---|---|
| MLP `[3072, 256, 128, 10]`, activación `elu` | 0,4950 |
| IOC-NN `[3072, 256, 128, 10]`, activación `elu` | 0,4118 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo es una MLP de menos de un millón de parámetros y una entrada de 3072 floats.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; funciona también en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (carga directa del `state_dict`), TorchScript o exportación a ONNX. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput muy alto y latencias de microsegundos a milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Precisión test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smai-a4-cifar10-iocnn` (IOC-NN) | no disponible (~820k estimados) | 3072 floats | 0,4118 | no disponible | Hugging Face |
| MLP equivalente del mismo autor | no disponible | 3072 floats | 0,4950 | no disponible | Referenciada en la model card, no publicada como artefacto separado |
| Otras MLP sobre CIFAR-10 | no disponible | 3072 floats | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- Precisión limitada: 0,4118 en test, muy por debajo de arquitecturas convolucionales estándar en CIFAR-10; no es adecuado para aplicaciones reales de visión.
- Restricción de convexidad: la IOC-NN sacrifica expresividad frente a la MLP equivalente, con una caída de aproximadamente 8 puntos porcentuales en precisión.
- Entrada rígida: solo acepta imágenes CIFAR-10 de 32×32 píxeles aplanadas y preprocesadas con los parámetros exactos de `iocnn_preprocessing.json`; cualquier otro formato requiere reimplementar el preprocesado.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial queda en un limbo legal y no se recomienda sin aclaración previa del autor.
- Sin documentación de sesgos: no se detallan sesgos conocidos, pero al entrenarse solo con CIFAR-10 hereda los desequilibrios y sesgos de ese dataset.
- Riesgo de sobreajuste no documentado: no se publican curvas de entrenamiento ni métricas de validación.
- Artefacto de investigación: sin pipeline declarado, sin descargas ni likes, y con fecha de creación futura (2026-11-01) en los metadatos, lo que sugiere que el repositorio puede ser un ejercicio académico sin mantenimiento.
- No apto para producción: no es un modelo de lenguaje ni un clasificador de propósito general; su uso se limita a experimentación y docencia.

## Enlaces

- Hugging Face: https://huggingface.co/imradhe/smai-a4-cifar10-iocnn
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
