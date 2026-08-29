# skblv/resnet50-cholect50-verbs

## Resumen

El modelo `skblv/resnet50-cholect50-verbs` es un clasificador de imágenes basado en la arquitectura ResNet-50, desarrollado por el usuario skblv como línea base supervisada para el reconocimiento de verbos (acciones) en fotogramas del dataset quirúrgico CholecT50. Este dataset, publicado en el artículo arXiv:2109.03223, contiene vídeos de colecistectomía laparoscópica anotados con tripletes `<instrumento, verbo, objetivo>`. El modelo resuelve una tarea de clasificación multi-etiqueta de 10 clases, identificando la acción actual (verbo) en cada imagen individual.

Se trata de un modelo de investigación, entrenado como referencia para un leaderboard de comprensión de vídeo quirúrgico desarrollado en colaboración entre SDSC y Chicago Booth. Su relevancia radica en servir como punto de partida para sistemas más complejos de análisis de vídeo médico, aunque no está diseñado para uso clínico. La arquitectura es una ResNet-50 estándar, con un tamaño de repositorio de 0,1 GB, y no se especifica una longitud de contexto al tratarse de un modelo de visión puro.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN residual) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (formato de archivo no especificado) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ResNet-50, una red neuronal convolucional residual de 50 capas que utiliza conexiones de atajo para mitigar el problema del desvanecimiento del gradiente. En su variante v1.5, el stride de 2 se aplica en la convolución 3×3 de los bloques de downsampling, lo que mejora ligeramente la precisión respecto a la versión original. La entrada son fotogramas individuales de vídeo quirúrgico, y la salida es una distribución de probabilidad sobre 10 verbos (acciones) mediante una activación sigmoide para permitir la clasificación multi-etiqueta.

El entrenamiento se realizó de forma supervisada sobre el dataset CholecT50, que incluye vídeos de colecistectomía laparoscópica. No se especifican en la información disponible el número de fotogramas de entrenamiento, la composición exacta del split ni el uso de técnicas como aumento de datos o regularización. Tampoco se mencionan procesos de ajuste fino con RLHF o DPO, ya que no es un modelo generativo. La evaluación se realizó sobre un split de validación de 19.923 fotogramas, con intervalos de confianza bootstrap al 95%.

## Capacidades

- Clasificación multi-etiqueta de 10 verbos quirúrgicos en fotogramas individuales de vídeo de colecistectomía laparoscópica.
- Reconocimiento de acciones como "disecar", "cortar", "clipar", "coagular", entre otras, a partir de una imagen estática.
- Procesamiento de imágenes médicas de endoscopia, con capacidad para distinguir patrones visuales propios del campo operatorio.
- Inferencia rápida al ser un modelo ligero (ResNet-50), adecuado para aplicaciones en tiempo real sobre hardware modesto.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto, al ser un clasificador discriminativo puro.
- No tiene capacidades multilingües ni de procesamiento de audio o vídeo secuencial; opera sobre fotogramas independientes.

## Casos de uso

- Análisis de vídeo quirúrgico para investigación: el modelo puede utilizarse para etiquetar automáticamente fotogramas de colecistectomía, facilitando la creación de conjuntos de datos anotados o el estudio de patrones de actuación quirúrgica.
- Línea base para modelos de comprensión de escena quirúrgica: al ser un baseline publicado, sirve como referencia para comparar arquitecturas más complejas, como transformers de vídeo o modelos multimodales, en la misma tarea de reconocimiento de verbos.
- Desarrollo de sistemas de asistencia en quirófano (entornos de investigación): combinado con un detector de instrumentos y objetivos, podría contribuir a un sistema de tripletes completo, aunque su uso clínico está descartado por las limitaciones declaradas.
- Evaluación de técnicas de aumento de datos o regularización: investigadores pueden usar este modelo para probar métodos de mejora de generalización en dominios médicos con pocos datos.
- Formación y educación quirúrgica: en entornos académicos, el modelo puede emplearse para demostrar conceptos de visión por computador aplicados a la medicina, como la clasificación multi-etiqueta en dominios especializados.
- Benchmarking de eficiencia computacional: al ser un modelo pequeño, es útil para medir el rendimiento de frameworks de inferencia (PyTorch, ONNX, TensorRT) en GPUs de consumo o incluso CPU.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados sobre el split de validación completo de 19.923 fotogramas, con intervalos de confianza bootstrap al 95%:

| Metrica | Valor |
|---|---|
| Exact match | 52,9% (52,3–53,6) |
| Micro-averaged F1 | 75,2% (74,8–75,6) |

No se han publicado resultados comparativos con otros modelos en la información disponible. El modelo se presenta como línea base, por lo que estos valores sirven de referencia para futuras comparaciones.

## Requisitos de hardware

- Al ser una ResNet-50, el modelo tiene aproximadamente 25,6 millones de parámetros (dato estándar de la arquitectura, aunque no se confirma en la ficha). El tamaño del repositorio es de 0,1 GB, lo que indica que los pesos ocupan alrededor de 100 MB en precisión float32.
- VRAM estimada: no disponible en la información proporcionada. Sin embargo, por el tamaño del modelo, una GPU con 4 GB de VRAM es suficiente para inferencia en lotes pequeños. En CPU también es viable para uso no interactivo.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3060 o superior. Para entrenamiento, se recomienda una GPU con 8 GB o más, aunque no se especifica en la documentación.
- El modelo es compatible con PyTorch, por lo que puede desplegarse con TorchServe, ONNX Runtime o directamente en scripts Python. También puede convertirse a otros formatos como TensorRT si se requiere baja latencia.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una inferencia de decenas de milisegundos por imagen en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea y con el mismo tamaño dentro de los resultados de búsqueda. Existe un modelo multimodal grande, `nvidia/Qwen2.5-VL-7B-Surg-CholecT50`, que también se fine-tunea sobre CholecT50, pero su arquitectura (LLM con visión) y su tamaño (7B parámetros) lo hacen incomparable en términos de eficiencia y enfoque. No se han encontrado otros baselines de ResNet-50 específicos para verbos en CholecT50 con métricas publicadas.

## Limitaciones y advertencias

- El modelo es exclusivamente una línea base de investigación. La model card indica explícitamente: "Research baseline only. Not a medical device." No debe utilizarse en entornos clínicos ni para la toma de decisiones médicas.
- Al procesar fotogramas individuales, no captura la información temporal del vídeo, lo que limita su capacidad para distinguir acciones que dependen del contexto dinámico.
- El dataset CholecT50 se centra únicamente en colecistectomía laparoscópica, por lo que el modelo no generaliza a otros procedimientos quirúrgicos o modalidades de imagen.
- No se especifican sesgos potenciales del dataset, pero al ser un dominio médico especializado, es probable que existan desequilibrios de clases entre los 10 verbos, lo que puede afectar a la precisión por clase.
- No se proporcionan detalles sobre el preprocesado de imágenes (tamaño de entrada, normalización, etc.), lo que dificulta la reproducibilidad exacta.
- La licencia Apache-2.0 permite uso comercial, pero las limitaciones de uso médico y la falta de validación clínica restringen su aplicación práctica en producción sanitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/resnet50-cholect50-verbs
- Repositorio del dataset CholecT50 (GitHub): https://github.com/CAMMA-public/cholect50
- Paper de CholecT50 (arXiv:2109.03223): https://arxiv.org/abs/2109.03223
- Leaderboard de comprensión de vídeo quirúrgico (mencionado en la model card): https://github.com/skblv/neurosurgery-video-eval-website
- Dataset CholecT50 en Hugging Face (Voxel51): https://huggingface.co/datasets/Voxel51/cholect50
- Modelo multimodal relacionado (NVIDIA Qwen2.5-VL-7B-Surg-CholecT50): https://huggingface.co/nvidia/Qwen2.5-VL-7B-Surg-CholecT50
