# rabbitarii/densenet121-brain-tumor-detection

## Resumen

El modelo `rabbitarii/densenet121-brain-tumor-detection` es un clasificador de imágenes basado en la arquitectura DenseNet121, ajustado (fine-tuned) sobre el Brain Tumor Detection Dataset, un conjunto de 5.249 imágenes de resonancia magnética (MRI) anotadas con cuatro clases de tejido cerebral: glioma, meningioma, notumor y pituitary. El autor, rabbitarii, parte de los pesos preentrenados en ImageNet de `torchvision` y reemplaza la capa final para adaptarla a la clasificación de tumores. El modelo se distribuye como un `state_dict` de PyTorch en formato `.safetensors`, no como un modelo de `transformers`, por lo que requiere reconstruir la arquitectura manualmente para cargarlo.

Con 7.041.604 parámetros, es un modelo ligero y de inferencia rápida, pensado para entornos de investigación y educación en imagen médica. Su relevancia radica en ofrecer una solución accesible y reproducible para la clasificación automática de tumores cerebrales, con una precisión reportada del 97,38% en el conjunto de test. No obstante, el autor advierte explícitamente que no es un dispositivo médico y no debe usarse para diagnóstico clínico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet121 (red convolucional densa) |
| Parametros totales | 7.041.604 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificacion de imagenes, no procesamiento de secuencias) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | No disponible |
| Formato de pesos | safetensors (state_dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en DenseNet121, una red neuronal convolucional que conecta cada capa con todas las capas anteriores mediante conexiones densas, lo que favorece la reutilizacion de caracteristicas y reduce el numero de parametros en comparacion con arquitecturas equivalentes. La capa final se sustituye por una capa lineal con 4 salidas, correspondientes a las clases de tumor. El entrenamiento se realizo sobre el Brain Tumor Detection Dataset, que contiene 5.249 imagenes MRI con anotaciones YOLO, aunque solo se utilizaron las etiquetas de clase a nivel de imagen, ignorando las bounding boxes. No se menciona el uso de tecnicas de RLHF o DPO, ya que no es un modelo de lenguaje. El preprocesamiento requiere redimensionar las imagenes a 224x224 píxeles y normalizar con media `[0.485, 0.456, 0.406]` y desviacion estandar `[0.229, 0.224, 0.225]`, los valores estandar de ImageNet.

## Capacidades

- Clasificacion de imagenes MRI en cuatro categorias: glioma, meningioma, notumor y pituitary.
- Inferencia rapida gracias a su tamano reducido (7M parametros).
- Compatible con el ecosistema PyTorch y safetensors.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- No es multimodal: solo procesa imagenes, sin entrada de texto o audio.
- No dispone de modo de pensamiento (thinking mode) ni capacidades de vision general mas alla de la clasificacion especifica.

## Casos de uso

- Investigacion academica en imagen medica: el modelo puede servir como punto de partida para estudios comparativos de tecnicas de clasificacion de tumores cerebrales, permitiendo reproducir resultados y evaluar mejoras sobre una base solida.
- Desarrollo de prototipos educativos: en cursos de deep learning aplicado a salud, los estudiantes pueden cargar el modelo y experimentar con la clasificacion de MRI, comprendiendo el flujo completo de preprocesamiento, inferencia y evaluacion.
- Validacion de pipelines de preprocesamiento: al ser un modelo ligero, es util para probar tuberias de normalizacion, aumento de datos o segmentacion antes de escalar a modelos mas grandes.
- Generacion de explicaciones con Grad-CAM: aunque el modelo no incluye herramientas de interpretabilidad, puede combinarse con bibliotecas como Grad-CAM para visualizar las regiones de la imagen que influyen en la clasificacion, util en investigacion de explicabilidad.
- Benchmarking en entornos con recursos limitados: su bajo consumo de memoria permite ejecutarlo en CPUs o GPUs de gama baja, sirviendo como referencia de rendimiento para comparar con arquitecturas mas pesadas.
- Integracion en sistemas de triage no clinico: en contextos de investigacion o simulacion, puede usarse para priorizar imagenes que requieran revision humana, siempre con supervision experta y sin valor diagnostico.

## Benchmarks y rendimiento

El autor reporta en la model card los siguientes resultados sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9738 |
| Loss | 0,0783 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Los articulos encontrados en la busqueda web (Springer, ACM) describen arquitecturas DenseNet121 modificadas para diagnostico de tumores cerebrales, pero no proporcionan metricas directamente comparables con este modelo especifico.

## Requisitos de hardware

- VRAM estimada: al tener 7.041.604 parametros, en FP32 ocupa aproximadamente 28 MB; en FP16, unos 14 MB. Cabe en cualquier GPU moderna, incluso en las mas basicas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050, RTX 2060 o superiores funcionan sin problemas. Tambien puede ejecutarse en CPU con un tiempo de inferencia de unos pocos milisegundos por imagen.
- Compatibilidad con consumer GPU: si, es totalmente viable en GPUs de consumo.
- Opciones de despliegue: al ser un modelo PyTorch estandar, puede servirse con TorchServe, ONNX Runtime, o integrarse en aplicaciones web mediante FastAPI. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales, pero por su tamano se espera una latencia inferior a 10 ms por imagen en GPU moderna y un throughput de cientos de imagenes por segundo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de clasificacion de tumores cerebrales. Existen en Hugging Face otros modelos basados en DenseNet121 o ResNet50 para la misma tarea, pero no se han encontrado datos publicos de sus parametros, rendimiento o licencias en la informacion proporcionada. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo no es un dispositivo medico y no debe utilizarse para diagnostico clinico real ni para tomar decisiones de tratamiento.
- El entrenamiento se realizo sobre un dataset limitado (5.249 imagenes), lo que puede introducir sesgos en la generalizacion a otros hospitales, equipos de MRI o poblaciones.
- Solo clasifica cuatro tipos de tejido; no detecta otros tipos de tumores o anomalias.
- No se proporcionan datos sobre la distribucion de clases ni sobre posibles desequilibrios, lo que podria afectar a la precision en clases minoritarias.
- La licencia no esta especificada, por lo que el uso comercial es incierto y se recomienda contactar con el autor antes de cualquier despliegue productivo.
- El codigo de ejemplo en la model card contiene un error tipografico (`densenet50` en lugar de `densenet121`), lo que puede causar confusion al reproducir el modelo.
- No se incluyen herramientas de interpretabilidad ni explicaciones de las predicciones, lo que limita su uso en entornos donde se requiera trazabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rabbitarii/densenet121-brain-tumor-detection
- Articulo relacionado en Springer: https://link.springer.com/article/10.1007/s00521-025-11150-4
- PDF del articulo en Springer: https://link.springer.com/content/pdf/10.1007/s00521-025-11150-4.pdf
- Articulo en ACM: https://dl.acm.org/doi/10.1007/s00521-025-11150-4
- Repositorio de analisis de tumores cerebrales con DenseNet-121 e InceptionV3: https://github.com/rbsvd/Brain_Tumor_MRI_Analysis--Classification_and_Segmentation
- Repositorio de clasificacion de tumores con DenseNet-121: https://github.com/SHAH-MEER/BrainTumor-DenseNet-121
