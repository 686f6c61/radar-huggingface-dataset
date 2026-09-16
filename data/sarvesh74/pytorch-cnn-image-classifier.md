# sarvesh74/pytorch-cnn-image-classifier

## Resumen
`sarvesh74/pytorch-cnn-image-classifier` es una implementación modular de una red neuronal convolucional (CNN) en PyTorch, publicada en Hugging Face con pipeline de `image-classification`. No es un modelo de lenguaje: se trata de un clasificador de imágenes de 10 clases entrenable desde cero sobre CIFAR-10, con aproximadamente 1,2 millones de parámetros (estimación calculada a partir de la arquitectura descrita en la model card). Su interés no está en el rendimiento bruto, sino en que el repositorio empaqueta el ciclo completo de un proyecto de visión por computador: arquitectura, script de entrenamiento, pipeline de inferencia, suite de tests, aplicación web con Gradio y fichero de configuración con el mapeo `id2label` de las 10 clases.

El autor es el usuario `sarvesh74` y la licencia es MIT, lo que permite uso comercial sin restricciones prácticas. El repositorio se creó y actualizó en septiembre de 2026 y acumula 0 descargas y 0 "likes", por lo que no tiene validación alguna por parte de la comunidad y no se han publicado métricas de precisión ni pesos entrenados verificables.

Es relevante ahora como plantilla docente y como esqueleto de referencia para pipelines de clasificación de bajo coste: con ~1,2 M de parámetros en float32 los pesos ocupan del orden de 4,8 MB, de modo que la inferencia es viable en CPU, en dispositivos edge y en cualquier GPU, incluso integrada. Su utilidad real es como base para transfer learning ligero, para pruebas de infraestructura MLOps y como ejemplo canónico de arquitectura convolucional con Batch Normalization y pooling adaptativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN convolucional secuencial (3 bloques convolucionales + cabeza de clasificación), implementada en PyTorch |
| Parámetros totales | ~1,2 M (estimación calculada a partir de las capas descritas en la model card) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; no procesa secuencias de texto) |
| Tipos de cuantización | no disponibles; no se documenta ninguna. Con ~4,8 MB en float32, la cuantización no aporta ventajas prácticas |
| Idiomas soportados | en (etiqueta del repositorio); el modelo no procesa texto, solo devuelve etiquetas en inglés |
| Licencia | MIT |
| Formato de pesos | no disponible; el script de entrenamiento exporta el mejor checkpoint a `best_model.pth` (state_dict de PyTorch), pero no se confirma que el repositorio incluya pesos preentrenados |

## Arquitectura y entrenamiento
La red se compone de tres bloques convolucionales. El bloque 1 aplica `Conv2d` (kernel 3×3, padding 1) seguido de Batch Normalization y ReLU, un segundo par `Conv2d`+BN+ReLU, MaxPool 2×2 y Dropout, produciendo 32 canales. El bloque 2 repite el esquema con 64 canales de salida y el bloque 3 usa una única convolución que eleva a 128 canales. A continuación, un `AdaptiveAvgPool2d((4, 4))` fija la salida espacial en 128×4×4 = 2048 elementos, que alimentan una cabeza clasificadora `Linear(2048, 512) → BN → ReLU → Dropout(0.5) → Linear(512, 10)`.

El entrenamiento se realiza desde cero sobre CIFAR-10 mediante `train.py`, con aumento de datos, optimizador con tasa de aprendizaje configurable (por defecto 0,001), planificación Cosine Annealing y guardado automático del mejor checkpoint según precisión de validación. La model card no indica el número de tokens ni de ejemplos de entrenamiento efectivamente usados, ni si existe un checkpoint ya entrenado con el que se hayan obtenido resultados. Tampoco se documenta ningún tipo de ajuste por preferencias (RLHF, DPO) ni ninguna innovación técnica más allá del diseño modular y el uso de *adaptive pooling* para desacoplar la arquitectura del tamaño de entrada.

## Capacidades
- Clasificación de imágenes en 10 clases de CIFAR-10: `airplane`, `automobile`, `bird`, `cat`, `deer`, `dog`, `frog`, `horse`, `ship`, `truck` (según el mapeo `id2label` de `config.json`).
- Inferencia con probabilidades ordenadas *top-k*, accesible tanto por línea de comandos como por API de Python (`ImageClassifier.predict(image, top_k=3)`).
- Modo de demostración sintética (`predict.py --demo`) para validar el pipeline sin necesidad de disponer de una imagen real.
- Entrenamiento y validación desde cero sobre CIFAR-10 con aumento de datos, Cosine Annealing y checkpointing automático del mejor modelo.
- Interfaz web local con Gradio (`app.py`) para subir imágenes y ver la clasificación en el navegador, habitualmente en `http://127.0.0.1:7860`.
- Suite de tests unitarios (`test_pipeline.py`) que verifica la *forward pass*, la resolución de variables, el flujo de retropropagación de gradientes y el guardado/carga de checkpoints.
- No soporta *tool calling* ni *function calling*: es un clasificador de imágenes, no un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso, generación de texto, matemáticas, visión-lenguaje, audio ni modo de razonamiento explícito.
- No tiene capacidades multilingües: no procesa lenguaje natural, y las únicas cadenas de texto que maneja son las etiquetas de clase en inglés.

## Casos de uso
- Docencia y aprendizaje de visión por computador: el repositorio incluye arquitectura, entrenamiento, inferencia y tests en un único lugar, de modo que un estudiante puede recorrer el ciclo completo y experimentar con hiperparámetros sobre CIFAR-10 sin escribir el andamiaje.
- Pruebas de infraestructura MLOps: por su tamaño (~4,8 MB de pesos en float32) es ideal para validar de extremo a extremo un pipeline de empaquetado, registro de modelos, endpoints de inferencia o integración continua, sin consumir recursos de GPU significativos.
- Inferencia en edge o en CPU: al requerir menos de 1 GB de memoria incluso con lotes moderados, puede desplegarse en una Raspberry Pi, en un portátil o en un contenedor sin GPU para clasificar imágenes de 32×32 píxeles en tiempo real.
- Base para transfer learning ligero: la cabeza clasificadora `Linear(2048, 512) → Linear(512, 10)` puede sustituirse por otra de salida distinta para adaptar el modelo a un dataset propio de bajo número de clases y pocos miles de imágenes.
- Etapa de triaje o prefiltrado: dentro de un sistema mayor, puede descartar rápidamente candidatos evidentes antes de invocar un modelo de visión de mayor coste, reduciendo el gasto computacional total del pipeline.
- Demo interactiva y validación con usuarios: la interfaz Gradio permite que personas no técnicas suban imágenes y vean las probabilidades *top-k*, útil para revisiones de producto o sesiones de etiquetado asistido.
- Comparación controlada de técnicas de aumento de datos: el script de entrenamiento permite repetir experimentos con distintas configuraciones de *augmentation*, tasa de aprendizaje o planificador y comparar la precisión de validación sobre un dataset estandarizado.
- Prototipado rápido de clasificadores de 10 clases en dominios con imágenes de baja resolución, como sensores industriales de baja resolución o recortes pequeños de un pipeline previo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de precisión de validación o de test sobre CIFAR-10, ni resultados de MMLU, HumanEval, GSM8K u otros (que, por otra parte, no aplicarían a un modelo de visión). El repositorio indica que el script de entrenamiento registra la precisión de validación por época, pero no publica ninguno de esos valores ni un checkpoint entrenado con cifras asociadas.

## Requisitos de hardware
- VRAM estimada: menos de 1 GB para inferencia en float32, incluyendo pesos (~4,8 MB) y activaciones con lotes pequeños de imágenes de 32×32. Con resoluciones de entrada mucho mayores y lotes grandes, el consumo crece por activaciones, pero sigue siendo muy reducido.
- GPU recomendadas: no se requiere GPU dedicada. Cualquier GPU NVIDIA con CUDA (por ejemplo, RTX 3060 o superior) es más que suficiente; también es viable en GPU integradas compatibles con PyTorch.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual y en la mayoría de generaciones anteriores. También funciona exclusivamente en CPU.
- Coste computacional estimado: del orden de 60 MFLOPs por imagen a 32×32 píxeles (cálculo derivado de las capas descritas), lo que sitúa la inferencia en el rango de fracciones de milisegundo en una CPU moderna. No hay mediciones publicadas de latencia ni de throughput.
- Opciones de despliegue: PyTorch nativo (`predict.py`, `app.py` con Gradio), exportación a TorchScript o ONNX Runtime para servir sin dependencia de Python completo. Las herramientas orientadas a modelos de lenguaje (llama.cpp, Ollama, vLLM, TGI) no aplican a este modelo.
- Entrenamiento: el pipeline de CIFAR-10 puede ejecutarse en CPU, aunque una GPU única acelera notablemente el ciclo de 20 épocas propuesto por defecto en el README.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada / contexto | Rendimiento publicado (CIFAR-10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sarvesh74/pytorch-cnn-image-classifier` | ~1,2 M (estimado) | 32×32 nativa; adaptable por *adaptive pooling* | no disponible en la información proporcionada | MIT | Repositorio Hugging Face, 0 descargas, sin pesos confirmados |
| ResNet-18 (torchvision) | ~11,7 M | 224×224 nativa; adaptable | no disponible en la información proporcionada | BSD-3-Clause (torchvision) | Pesos preentrenados en ImageNet distribuidos con torchvision |
| MobileNetV2 (torchvision) | ~3,5 M | 224×224 nativa; adaptable | no disponible en la información proporcionada | BSD-3-Clause (torchvision) | Pesos preentrenados en ImageNet distribuidos con torchvision |
| VGG-11 (torchvision) | ~132 M | 224×224 nativa | no disponible en la información proporcionada | BSD-3-Clause (torchvision) | Pesos preentrenados en ImageNet distribuidos con torchvision |

Nota: los recuentos de parámetros de ResNet-18, MobileNetV2 y VGG-11 corresponden a las arquitecturas estándar conocidas, no a datos publicados en la model card analizada. No se dispone de cifras de precisión para ninguno de los modelos comparados dentro de la información proporcionada, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias
- El modelo está limitado a las 10 clases de CIFAR-10; cualquier imagen fuera de esas categorías se asignará forzosamente a una de ellas.
- No se confirma que el repositorio incluya pesos entrenados. La model card describe el script que exporta `best_model.pth`, pero el flujo documentado parte de entrenar desde cero, y el repositorio registra 0 descargas y 0 "likes", por lo que no hay evidencia de uso ni de validación por terceros.
- No hay métricas de precisión publicadas: es imposible saber si el modelo, una vez entrenado, generaliza correctamente o si sufre sobreajuste.
- Las imágenes de CIFAR-10 son de 32×32 píxeles y muy baja resolución; el modelo no ha sido diseñado ni validado para fotografías de alta resolución, dominios médicos, industriales o de vigilancia.
- CIFAR-10 es un dataset equilibrado, pero de composición muy específica; un modelo entrenado con él heredará sus sesgos de representación (por ejemplo, predominio de ciertos animales y vehículos en poses y fondos muy concretos).
- Riesgo de sobreconfianza: la salida es una distribución softmax de 10 clases sin mecanismo de abstención, de modo que una predicción incorrecta puede presentarse con probabilidad alta. No existe noción de "no lo sé".
- La confianza mostrada no debe interpretarse como calibración fiable en producción sin un análisis específico de calibración sobre el dominio objetivo.
- El término "alucinación" no aplica en sentido generativo, pero sí el equivalente en clasificación: asignación segura de una clase errónea ante entradas fuera de distribución.
- Limitación de idioma: las etiquetas y toda la documentación están en inglés; el modelo no procesa texto en ningún idioma.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. No hay restricciones de uso adicionales documentadas.
- Antes de usar en producción es imprescindible entrenar y evaluar el modelo sobre datos representativos del caso real; el repositorio, tal cual, es un esqueleto de código, no un clasificador listo para desplegar.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/sarvesh74/pytorch-cnn-image-classifier
- Repositorio clonable indicado en la model card (misma URL, vía `git clone`): https://huggingface.co/sarvesh74/pytorch-cnn-image-classifier
- Dataset de entrenamiento por defecto: CIFAR-10 (descargado automáticamente por `train.py`); no se proporciona enlace explícito en la información disponible.
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada: los resultados devueltos corresponden a contenidos no relacionados con el modelo.
