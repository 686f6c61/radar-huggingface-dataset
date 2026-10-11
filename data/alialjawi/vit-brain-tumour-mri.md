# AliAljawi/vit-brain-tumour-mri

## Resumen

AliAljawi/vit-brain-tumour-mri es un modelo de clasificacion de imagenes medicas obtenido mediante fine-tuning de google/vit-base-patch16-224 sobre el conjunto de datos Kaynaaf/Brain-Tumour-MRI. El modelo clasifica una resonancia magnetica cerebral en cuatro clases: glioma, meningioma, ausencia de tumor y tumor hipofisario. Lo desarrolla AliAljawi en el marco del curso MAAI901 Deep Learning for Visual Data (taller CNN2ViT), por lo que se trata de un proyecto educativo y no de una herramienta clinica.

Se apoya en la arquitectura Vision Transformer en su variante base, con 85.801.732 parametros y parches de 16x16 sobre entradas de 224x224 pixeles. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0. El modelo se publica con 0 descargas y 0 me gusta en el momento de redactar esta ficha, lo que refleja su caracter reciente y experimental.

Su relevancia es doble: por un lado sirve como ejemplo didactico de transferencia de aprendizaje desde vision general a imagen medica; por otro, su model card documenta de forma inusualmente honesta los sesgos del conjunto de datos y las trampas metodologicas (copias casi identicas entre train y test, atajos por tamano y formato de color), lo que lo convierte en un caso util para discutir evaluacion rigurosa en IA medica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolucion 224x224) |
| Parametros totales | 85.801.732 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes; entrada de 224x224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/vit-base-patch16-224 |
| Tarea (pipeline) | image-classification |
| Tamano del repositorio | 0,3 GB |
| Clases de salida | glioma, meningioma, no tumour, pituitary tumour |
| Dataset de entrenamiento | Kaynaaf/Brain-Tumour-MRI |
| Fecha de publicacion | 2026-10-11 |

## Arquitectura y entrenamiento

El modelo parte de google/vit-base-patch16-224, un Vision Transformer base preentrenado sobre ImageNet. La imagen de entrada se divide en parches de 16x16 pixeles que se proyectan linealmente y se procesan con atencion multi-cabeza, generando finalmente una distribucion sobre las cuatro clases objetivo. No se ha modificado la columna de clasificacion mas alla del ajuste a cuatro categorias.

El fine-tuning se realizo sobre el dataset Kaynaaf/Brain-Tumour-MRI, compuesto por 4.855 imagenes de entrenamiento, 857 de validacion y 1.311 de test. Se entrenaron 5 epocas con tamano de lote 32, tasa de aprendizaje 5e-5 con un 10% de calentamiento y precision mixta. Se aplico aumento de datos ligero (volteo horizontal y rotacion de hasta 10 grados) y se conservo la epoca con mejor exactitud de validacion. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo logico en un clasificador de vision. Tampoco se especifican innovaciones arquitectonicas propias: es una transferencia de aprendizaje estandar.

## Capacidades

- Clasificacion de imagenes de resonancia magnetica cerebral en cuatro categorias: glioma, meningioma, no tumour y pituitary tumour.
- Salida de probabilidades por clase a partir de una unica imagen de 224x224 px.
- Transferencia de representaciones visuales genericas de ImageNet al dominio de imagen medica.
- Integracion sencilla en pipelines de Hugging Face Transformers mediante AutoModelForImageClassification.
- Ejecucion en CPU o GPU sin requisitos de memoria elevados.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision multimodal, audio ni tool calling.
- No soporta multi-turno ni agentes: es un clasificador de una sola pasada.
- No incluye modo de pensamiento ni decodificacion especulativa.

## Casos de uso

- Docencia en vision por computador: reproduccion del taller CNN2ViT como ejemplo guiado de fine-tuning de un ViT sobre un dataset medico pequeno, con discusion de la evaluacion y de los atajos del dataset.
- Prototipado de demos con Gradio: el propio autor incluye una app web en el cuaderno de Colab que permite subir una imagen y obtener la clase predicha, util para presentaciones academicas.
- Investigacion sobre sesgo de dataset: el modelo y su model card sirven para estudiar como las copias casi identicas entre train y test inflan las metricas (98,9% frente a 98,4%) y para disenar metodologias de deduplicacion.
- Analisis de mapas de atencion: permite visualizar en que regiones se fija el transformer, y el autor documenta que a veces lo hace en el craneo o los ojos en lugar del tumor, lo que resulta util para investigar explicabilidad.
- Baseline comparativo en trabajos academicos: sirve como referencia inicial para nuevos clasificadores de tumores cerebrales antes de invertir en arquitecturas mas costosas o datasets mas limpios.
- Aprendizaje activo y curacion de datos: al revelar dependencias de artefactos de imagen (tamano y formato de color), ayuda a priorizar tareas de limpieza y balanceo del corpus antes de reentrenar.
- No se recomienda su uso en triaje clinico, diagnostico ni en cualquier flujo con pacientes reales, dado su caracter educativo y la falta de validacion externa.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test de Kaynaaf/Brain-Tumour-MRI:

| Conjunto de evaluacion | Numero de imagenes | Exactitud |
|---|---|---|
| Test completo | 1.311 | 98,9% |
| Test sin copias casi identicas de entrenamiento | 864 | 98,4% |

No se han publicado resultados en la informacion disponible para benchmarks estandar de imagen medica (por ejemplo, accuracy por clase, F1, AUC o validacion cruzada externa), ni comparaciones cuantitativas con otros modelos sobre el mismo test.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 en torno a 350 MB de pesos mas activaciones; en fp16 aproximadamente 175 MB. Con un lote pequeno, menos de 1 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona sin problemas en NVIDIA GTX 1050 Ti o superior, RTX 3060, RTX 4090, A100 y H100, aunque estas ultimas estan sobredimensionadas para un ViT-Base.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de consumo e incluso en CPU para inferencia puntual.
- Opciones de despliegue: Hugging Face Transformers (pipeline de image-classification), TorchScript, ONNX Runtime, TensorRT o un endpoint de Inferentia. No es compatible con llama.cpp, Ollama ni vLLM, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible. En una GPU de gama media se espera una latencia de decenas de milisegundos por imagen, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AliAljawi/vit-brain-tumour-mri | 85.801.732 | Imagen 224x224 px | Clasificacion de tumores cerebrales (4 clases) | Apache 2.0 | Hugging Face, 0 descargas |
| google/vit-base-patch16-224 | ~86 M | Imagen 224x224 px | Clasificacion ImageNet-1k (1.000 clases) | Apache 2.0 | Hugging Face, ampliamente usado |
| google/vit-large-patch16-224 | ~307 M | Imagen 224x224 px | Clasificacion ImageNet-1k (1.000 clases) | Apache 2.0 | Hugging Face |
| Clasificadores CNN de referencia (por ejemplo ResNet-50) | ~25 M | Imagen 224x224 px | Clasificacion de imagen general | BSD / Apache segun implementacion | Amplia disponibilidad |

Los dos ViT de Google son modelos genericos de vision, no especializados en imagen medica; se incluyen como referencia de arquitectura y escala. No se ha encontrado en la informacion proporcionada una comparativa cuantitativa de este modelo con otras soluciones especificas de clasificacion de tumores cerebrales sobre el mismo conjunto de test.

## Limitaciones y advertencias

- Proyecto exclusivamente educativo. El propio autor advierte que no debe usarse para diagnostico medico.
- Contaminacion de datos: 447 de las 1.311 imagenes de test tienen una copia practicamente identica en entrenamiento, lo que infla la exactitud publicada (98,9%). Sin esas copias la cifra baja a 98,4%.
- Posible dependencia de atajos: las clases proceden de fuentes distintas y un modelo simple basado solo en tamano y formato de color de la imagen identifica el 99% de los casos "no tumour" sin ver pixeles cerebrales, por lo que el clasificador puede estar apoyandose en senales espurias.
- Mapas de atencion no siempre centrados en el tumor: en ocasiones el modelo atiende al craneo o a los ojos.
- Falta de validacion externa: no se ha probado con exploraciones de otros hospitales ni de otros escaneres, por lo que no se conoce su generalizacion fuera de la distribucion del dataset original.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si existe riesgo de falsos negativos y positivos con alta confianza, especialmente en imagenes fuera de dominio.
- Sesgos conocidos: derivados de la composicion del dataset Kaynaaf/Brain-Tumour-MRI y de la mezcla de fuentes para cada clase.
- Licencia Apache 2.0, que permite uso comercial del codigo y los pesos, pero no exime de responsabilidad legal ni clinica al desplegarlo en contextos regulados.
- Limitaciones de idioma no aplicables: el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AliAljawi/vit-brain-tumour-mri
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaynaaf/Brain-Tumour-MRI
- Repositorio de pesos en safetensors: incluido en el repositorio del modelo.
- Demo Gradio: dentro del cuaderno de Colab del proyecto (no se proporciona URL directa en la informacion disponible).
- Paper o publicacion asociada: no disponible.
- Repositorio de codigo: no disponible.
