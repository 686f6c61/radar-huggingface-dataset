# bbbegemot/alexnet-cifar100

## Resumen

AlexNet · CIFAR-100 es una implementación ligera de la arquitectura AlexNet adaptada a la clasificación de imágenes de 32x32 píxeles del conjunto CIFAR-100. Lo desarrolla el usuario de Hugging Face bbbegemot y se distribuye bajo licencia MIT. El modelo resuelve una tarea de clasificación de imágenes en 100 categorías, con una precisión top-1 del 63,01% en el conjunto de test. Se trata de un modelo de visión por computador puro, no de un modelo de lenguaje, por lo que no dispone de capacidades de generación de texto, tool calling ni razonamiento multi-paso.

La arquitectura es una AlexNet modificada: cinco capas convolucionales con kernel 3x3, BatchNorm2d y ReLU tras cada convolución, y una cabeza clasificadora con dos capas ocultas y dos capas de Dropout(0.5). El modelo cuenta con 7.025.316 parámetros (aproximadamente 7,03 M), lo que lo sitúa en la categoría de modelos muy pequeños, aptos para entrenamiento e inferencia en hardware modesto. La entrada está fijada a tensores RGB de 3x32x32 normalizados con las medias y desviaciones estándar de CIFAR-100.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo de implementación manual de AlexNet con adaptaciones modernas (BatchNorm, Dropout) para un dataset de baja resolución, y como punto de partida para experimentos de clasificación de imágenes a pequeña escala. No está pensado para producción ni para tareas de visión general fuera del dominio CIFAR-100.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN tipo AlexNet adaptada (5 capas convolucionales + 3 capas fully connected) |
| Parámetros totales | 7.025.316 (aprox. 7,03 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 3x32x32) |
| Tipos de cuantización | no disponible (pesos en `best_model.pth`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`, checkpoint con `model_state_dict`, `epoch` y `test_acc`) |

## Arquitectura y entrenamiento

La red sigue una AlexNet simplificada con cinco capas convolucionales de kernel 3x3, stride 1 y padding 1: 3→64→192→384→256→256 canales. Cada convolución va seguida de `BatchNorm2d` y `ReLU`. Se aplica max pooling 2x2 tras los bloques primero, segundo y quinto, reduciendo la resolución espacial de 32→16→8→4. La salida convolucional se aplana a 256×4×4 = 4096 dimensiones y pasa por una cabeza fully connected de 4096→1024→512→100, con dos capas de Dropout(0.5) intercaladas.

El entrenamiento se realizó sobre CIFAR-100 durante 40 épocas, con batch size 128, optimizador SGD (momentum 0,9, weight decay 5e-4), learning rate inicial 0,01 y scheduler StepLR (step_size 15, gamma 0,1). Se aplicó data augmentation con `RandomCrop(32, padding=4)` y `RandomHorizontalFlip`, y se fijó la semilla 42. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión. La mejor precisión top-1 en test fue del 63,01%, alcanzada en la época 36.

## Capacidades

- Clasificación de imágenes en 100 categorías de CIFAR-100 (logits de salida de dimensión 100).
- Procesamiento de imágenes RGB de 32x32 píxeles con normalización específica de CIFAR-100.
- Inferencia en CPU y GPU sin requisitos de memoria elevados (modelo de ~7 M de parámetros).
- Entrenamiento reproducible a partir de `model.py` y la configuración documentada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión de alta resolución, audio ni otras modalidades.

## Casos de uso

- Docencia y aprendizaje de visión por computador: el modelo sirve como ejemplo completo y reproducible de una CNN con BatchNorm y Dropout entrenada desde cero sobre CIFAR-100, útil en cursos de deep learning para ilustrar el flujo de entrenamiento, data augmentation y evaluación.
- Baseline para experimentos de clasificación de imágenes de baja resolución: investigadores pueden usar el 63,01% top-1 como referencia para comparar arquitecturas más modernas (ResNet, ViT) sobre el mismo dataset y configuración.
- Prototipado rápido en entornos con recursos limitados: al tener solo ~7 M de parámetros, se puede entrenar y ejecutar en una GPU consumer o incluso en CPU, lo que facilita pruebas de concepto sin infraestructura dedicada.
- Pruebas de integración de pipelines PyTorch: el checkpoint y `model.py` permiten validar flujos de carga de pesos, normalización de entrada y post-procesado de logits en sistemas de MLOps.
- Demostraciones interactivas: el Space asociado (`bbbegemot/alexnet-cifar100-demo`) permite mostrar clasificación de imágenes CIFAR-100 en un navegador, útil para divulgación o validación visual del modelo.
- Investigación sobre calibración y robustez en datasets pequeños: CIFAR-100 tiene solo 500 imágenes por clase, lo que lo convierte en un banco de pruebas para estudiar sobreajuste, regularización y sensibilidad a augmentations.

## Benchmarks y rendimiento

| Métrica | Valor | Notas |
|---|---|---|
| CIFAR-100 top-1 accuracy | 63,01% | Mejor resultado, época 36, conjunto de test |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es de visión y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB (modelo de ~7 M de parámetros en fp32, aproximadamente 28 MB de pesos, más activaciones de una imagen 3x32x32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1050, RTX 3050, RTX 4090, A100 o H100 sin problemas.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia individual.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load` y `model.load_state_dict`), exportación a TorchScript u ONNX no documentada pero viable; no se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU moderna y throughput alto en batch, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Precisión CIFAR-100 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bbbegemot/alexnet-cifar100 | ~7,03 M | 3x32x32 | 63,01% top-1 | MIT | Hugging Face |
| AlexNet original (2012) | ~60 M | 3x224x224 | no aplica a CIFAR-100 directamente | no disponible | Referencia académica |
| ResNet-18 adaptada a CIFAR-100 | ~11 M | 3x32x32 | típicamente >75% top-1 (referencia habitual, no verificada en esta ficha) | varía | Múltiples implementaciones |
| VGG-11 adaptada a CIFAR-100 | ~9 M (versión reducida) | 3x32x32 | típicamente >70% top-1 (referencia habitual, no verificada en esta ficha) | varía | Múltiples implementaciones |

Las cifras de ResNet-18 y VGG-11 son orientativas y no proceden de la información proporcionada; se incluyen solo como contexto cualitativo. No se dispone de comparativas oficiales publicadas por el autor.

## Limitaciones y advertencias

- Entrada fija de 32x32: imágenes reales de mayor resolución deben reducirse, con pérdida severa de detalle y degradación de la precisión.
- Entrenado exclusivamente con CIFAR-100 (500 imágenes por clase), lo que limita la generalización a dominios distintos.
- Clases visualmente similares (por ejemplo, distintos tipos de árbol) provocan confusiones frecuentes.
- Precisión top-1 del 63,01%, notablemente inferior a arquitecturas modernas como ResNet en el mismo dataset.
- No apto para escenarios de seguridad crítica; el autor indica que las salidas son solo para demostración.
- Sesgos conocidos: no documentados por el autor; al entrenarse solo con CIFAR-100, hereda los sesgos de composición y etiquetado de ese dataset.
- Riesgo de alucinación no aplica (no genera texto), pero sí de clasificaciones erróneas con alta confianza en clases ambiguas.
- Licencia MIT permite uso comercial, pero la ausencia de garantías y la baja precisión desaconsejan su uso en producción real.
- No hay versiones cuantizadas ni formatos alternativos publicados, lo que limita su integración en runtimes no PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bbbegemot/alexnet-cifar100
- Repositorio GitHub: https://github.com/Wait4theWind/alexnet-cifar100
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/bbbegemot/alexnet-cifar100-demo
