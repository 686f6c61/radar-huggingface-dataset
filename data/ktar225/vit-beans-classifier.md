# Ktar225/vit-beans-classifier

## Resumen

vit-beans-classifier es un modelo de clasificación de imágenes publicado por el usuario Ktar225 en HuggingFace. Se trata de un ajuste fino (fine-tuning) del checkpoint google/vit-base-patch16-224-in21k, un Vision Transformer de tipo base con parches de 16x16 píxeles y resolución de entrada de 224x224, preentrenado originalmente sobre ImageNet-21k. El modelo resultante cuenta con 85.800.963 parámetros y se distribuye bajo licencia Apache-2.0 en formato safetensors.

El modelo resuelve una tarea concreta de clasificación de imágenes, presumiblemente relacionada con judías o alubias (beans) a juzgar por su identificador, aunque la model card no documenta el conjunto de datos de entrenamiento ni la taxonomía de clases. El autor declara una precisión de 0,9531 y una pérdida de 0,1742 sobre el conjunto de evaluación, con un mejor resultado intermedio de 0,9850 de accuracy en la segunda época.

Su relevancia es limitada y muy acotada: es un experimento de ajuste fino sin documentación, con cero descargas y cero "likes" en el momento de la consulta, y sin resultados de benchmarks publicados. Resulta útil como ejemplo de pipeline de fine-tuning de ViT con la librería Transformers (versión 5.16.1) y como punto de partida reproducible para tareas de clasificación de imágenes con pocas clases, pero no como modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base/16), transformer de codificador puro sobre parches de imagen |
| Parametros totales | 85.800.963 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; entrada de imagen de 224x224 píxeles RGB (parches de 16x16) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se declaran versiones cuantizadas) |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | google/vit-base-patch16-224-in21k |
| Tarea (pipeline) | image-classification |
| Dataset de entrenamiento | No disponible (la model card indica "unknown dataset") |
| Metrica declarada | accuracy |
| Fecha de publicacion | 2026-09-15 (según metadatos de HuggingFace) |
| Ultima actualizacion | 2026-09-15 |
| Tamano del repositorio | 1,4 GB |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de configuración base: la imagen de entrada se divide en parches de 16x16 píxeles, cada parche se proyecta linealmente a un espacio de dimensión 768 y se añade codificación posicional, tras lo cual una pila de bloques transformer procesa la secuencia resultante. El checkpoint de partida, google/vit-base-patch16-224-in21k, fue preentrenado sobre ImageNet-21k (aproximadamente 14 millones de imágenes y más de 21.000 clases) con el objetivo de clasificación, y después se le sustituye la cabeza de clasificación por una nueva adaptada al problema concreto. El recuento total de 85,8 millones de parámetros es coherente con una cabeza de clasificación de pocas clases.

El ajuste fino se realizó durante 3 épocas con un tamaño de lote de 16 tanto en entrenamiento como en evaluación, tasa de aprendizaje inicial de 5e-05, planificador lineal y el optimizador AdamW en su variante fused (betas 0,9 y 0,999, epsilon 1e-08), con semilla fijada a 42. El conjunto de datos de entrenamiento no está documentado: la model card indica explícitamente "unknown dataset" y no se especifica ni la composición, ni el número de muestras, ni el número de clases, ni si se aplicó aumento de datos. Tampoco se declara ninguna innovación técnica adicional (no hay decodificación especulativa, atención lineal ni mecanismos híbridos). Las versiones de framework empleadas fueron Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificación de imágenes: asigna una etiqueta de clase a una imagen RGB de 224x224 píxeles.
- Extracción de características visuales: al derivar de un ViT-Base preentrenado, el backbone puede reutilizarse para representaciones visuales y para otras tareas con ajuste posterior.
- Inferencia por lotes: admite procesamiento por lotes a través de la API de transformers (pipeline de image-classification).
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión aumentada, audio ni modalidades adicionales más allá de la imagen de entrada.
- El número de clases de salida y su significado no están documentados.

## Casos de uso

- Clasificación automatizada de imágenes de judías o alubias en agricultura de precisión: si el modelo se ha entrenado sobre imágenes de hojas o granos, podría integrarse en una aplicación móvil o web para que un agricultor reciba una etiqueta de diagnóstico al fotografiar un cultivo. Es adecuado por su tamaño reducido (85,8 M de parámetros) y su coste de inferencia bajo, aunque la falta de documentación del dataset obliga a validar previamente la taxonomía de clases.
- Control de calidad en líneas de envasado: clasificar imágenes de producto tomadas por una cámara industrial, descartando unidades defectuosas. La resolución fija de 224x224 y la latencia baja en GPU permiten integrarlo en un bucle de inspección en tiempo real.
- Prototipado rápido de clasificadores de imágenes con pocas clases: sirve como plantilla reproducible de fine-tuning de ViT con Transformers, reutilizable cambiando el dataset y la cabeza de clasificación.
- Etiquetado asistido de conjuntos de datos: preanotar lotes de imágenes para después revisarlas manualmente, reduciendo el coste de anotación en proyectos de visión por computador.
- Investigación académica sobre transferencia de aprendizaje: comparar el comportamiento de un ViT-Base preentrenado en ImageNet-21k frente a alternativas con arquitecturas convolucionales en un dominio pequeño y especializado.
- Extracción de embeddings visuales para búsqueda por similitud: usar las representaciones internas del backbone como vector de características para recuperar imágenes similares en un catálogo.
- Filtrado previo en sistemas de monitorización de cultivos: descartar o priorizar imágenes antes de enviarlas a un modelo más grande o a un revisor humano, reduciendo coste computacional en despliegues con recursos limitados.
- Docencia y demostración de pipelines de HuggingFace: ejemplo mínimo de uso de Trainer, safetensors y del pipeline de image-classification.

## Benchmarks y rendimiento

El índice de modelo (model-index) publicado por el autor no contiene ningún resultado, por lo que no hay benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) disponibles. Los únicos datos de rendimiento son las métricas de evaluación declaradas en la model card, correspondientes al conjunto de evaluación del propio autor (no público):

| Metrica | Valor declarado |
|---|---|
| Accuracy (evaluación final) | 0,9531 |
| Loss (evaluación final) | 0,1742 |

Evolución durante el entrenamiento (datos declarados por el autor):

| Epoca | Paso | Validation loss | Accuracy |
|---|---|---|---|
| 1,0 | 65 | 0,1810 | 0,9699 |
| 2,0 | 130 | 0,0914 | 0,9850 |
| 3,0 | 195 | 0,1146 | 0,9699 |

Estos valores proceden exclusivamente de la model card; no se han publicado resultados de benchmarks independientes en la información disponible. Nótese que la mejor época según accuracy (la segunda) no coincide con la época final, lo que sugiere un posible sobreajuste leve en la tercera época.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 0,35 GB solo para los pesos (85,8 M de parámetros), más el coste de activaciones; en la práctica menos de 1 GB en inferencia por lotes pequeños.
- VRAM estimada en FP16/BF16: aproximadamente 0,18 GB para los pesos, más activaciones.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de portátil con 4 GB o más de VRAM.
- Puede ejecutarse en CPU con latencias aceptables para uso no crítico (del orden de decenas de milisegundos por imagen en procesadores modernos, dependiendo del número de hilos).
- GPU de centro de datos (A100, H100, L40S) innecesarias para este tamaño; solo tendrían sentido si se procesan lotes masivos en paralelo.
- Opciones de despliegue: pipeline nativo de transformers, TorchScript/torch.compile, ONNX Runtime, TensorRT, y servidores de inferencia como vLLM (con soporte de visión limitado), TGI o Triton Inference Server. No se publican pesos GGUF, por lo que llama.cpp/Ollama no son aplicables de forma directa.
- Latencia y throughput: no disponibles (el autor no publica mediciones). Con un ViT-Base a 224x224, es razonable esperar varios centenares de imágenes por segundo en una GPU moderna con lotes grandes, pero se trata de una estimación orientativa, no de un dato medido.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparativos para este ajuste fino, de modo que la comparación se limita a características estructurales y de licencia. Los datos de los modelos alternativos corresponden a especificaciones públicas conocidas de sus respectivos checkpoints base.

| Modelo | Parametros | Resolucion de entrada | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ktar225/vit-beans-classifier | 85,8 M | 224x224 | Fine-tuning de google/vit-base-patch16-224-in21k | Apache-2.0 | HuggingFace |
| google/vit-base-patch16-224-in21k | ~86 M (cabeza de 21.843 clases) | 224x224 | ImageNet-21k | Apache-2.0 | HuggingFace |
| google/vit-base-patch16-224 | ~86 M | 224x224 | ImageNet-1k | Apache-2.0 | HuggingFace |
| microsoft/resnet-50 | 25,6 M | 224x224 | ImageNet-1k | Apache-2.0 | HuggingFace |

Comparativa de rendimiento: no disponible, ya que no existen métricas públicas comparables entre estos modelos sobre el dominio concreto de vit-beans-classifier.

## Limitaciones y advertencias

- Dataset no documentado: la model card indica "unknown dataset"; se desconoce el número de clases, la composición, el origen de las imágenes y si existe desequilibrio entre clases. Esto hace imposible evaluar la validez del modelo fuera de su dominio original.
- Métricas no verificables: los valores de accuracy (0,9531) proceden únicamente del autor y no hay un conjunto de evaluación público que permita reproducirlos.
- Riesgo de sobreajuste: la accuracy cae de 0,9850 en la época 2 a 0,9699 en la época 3, lo que apunta a un posible sobreajuste y a que el checkpoint final no es el mejor según la métrica declarada.
- Riesgo de alucinación de clase: como cualquier clasificador, siempre devolverá una de las etiquetas aprendidas con una probabilidad asociada, incluso ante imágenes fuera de distribución (por ejemplo, de otras especies vegetales), sin mecanismo de rechazo explícito.
- Sesgos potenciales: al desconocerse el dataset, no se pueden evaluar sesgos de iluminación, fondo, cámara, variedad de cultivo o geografía. Un clasificador agrícola entrenado con imágenes de un único entorno suele degradarse con condiciones de captura distintas.
- Ausencia de multilingüismo y de capacidades de lenguaje: no es un modelo de texto, por lo que no debe compararse con LLM ni usarse para tareas generativas.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y las atribuciones correspondientes. El modelo base google/vit-base-patch16-224-in21k también se distribuye bajo Apache-2.0, lo que no añade restricciones adicionales.
- Madurez: cero descargas y cero valoraciones, sin documentación de uso previsto ni guía de limitaciones. No es recomendable para producción sin una validación propia exhaustiva.
- Higiene de despliegue: los 1,4 GB del repositorio son considerablemente mayores que el tamaño de los pesos en FP32 (unos 0,35 GB), lo que sugiere la presencia de checkpoints de entrenamiento u otros artefactos; conviene revisar el contenido antes de descargarlo en entornos con almacenamiento limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ktar225/vit-beans-classifier
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Paper original de Vision Transformer (An image is worth 16x16 words): https://arxiv.org/abs/2010.11929
- Documentación del pipeline de clasificación de imágenes de Transformers: https://huggingface.co/docs/transformers/main/en/tasks/image_classification

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a páginas de ayuda de YouTube y a hilos de foros sin relación con el modelo.
