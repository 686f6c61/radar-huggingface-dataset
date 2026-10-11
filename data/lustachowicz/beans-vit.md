# lustachowicz/beans-vit

## Resumen

beans-vit es un modelo de clasificacion de imagenes obtenido mediante fine-tuning de google/vit-base-patch16-224 sobre el conjunto de datos AI-Lab-Makerere/beans, que contiene fotografias de hojas de judia (Phaseolus vulgaris) etiquetadas con tres clases: angular_leaf_spot (mancha angular), bean_rust (roya) y healthy (sana). El autor es el usuario de HuggingFace lustachowicz y el modelo se desarrollo como parte del Laboratorio 1 de la asignatura Przetwarzanie Danych w Chmurze (procesamiento de datos en la nube).

Se trata de un transformer de vision (ViT) denso de aproximadamente 85,8 millones de parametros, derivado de la arquitectura ViT-Base con parches de 16x16 y resolucion de entrada de 224x224. El modelo resuelve una tarea concreta de clasificacion multiclase (3 clases) orientada a la deteccion temprana de enfermedades foliares en cultivos, un caso de uso habitual en agricultura de precision.

Su relevancia es limitada y acotada: no es un modelo de proposito general ni un modelo fundacional, sino un clasificador especializado de bajo coste computacional. Resulta util como ejemplo reproducible de fine-tuning de ViT con seguimiento de experimentos en MLflow y como componente de un sistema mayor de diagnostico fitosanitario. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base), parches de 16x16, resolucion 224x224 |
| Parametros totales | 85.800.963 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Modelo base | google/vit-base-patch16-224 |
| Dataset de ajuste | AI-Lab-Makerere/beans |
| Numero de clases | 3 (angular_leaf_spot, bean_rust, healthy) |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estandar de tipo ViT-Base: la imagen de entrada de 224x224 se divide en parches de 16x16, cada parche se proyecta linealmente a un embedding, se anaden embeddings de posicion y la secuencia resultante pasa por un encoder transformer con atencion multi-cabeza. La cabeza de clasificacion se sustituye para producir tres logits, correspondientes a las clases angular_leaf_spot, bean_rust y healthy.

El entrenamiento consistio en un fine-tuning del checkpoint google/vit-base-patch16-224 durante 3 epochs, con tasa de aprendizaje 5e-05 y tamano de lote 16, ejecutado en CPU. Los experimentos se registraron con MLflow. No se especifican en la informacion disponible el numero total de tokens de imagen procesados ni la composicion exacta del dataset mas alla de su identificador (AI-Lab-Makerere/beans). No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo coherente con una tarea de clasificacion supervisada. Tampoco se detallan tecnicas de aumento de datos, aunque son habituales en este tipo de ajuste.

## Capacidades

- Clasificacion de imagenes de hojas de judia en tres categorias: angular_leaf_spot, bean_rust y healthy.
- Devuelve puntuaciones de probabilidad por clase, lo que permite umbrales de confianza y analisis de incertidumbre.
- Funciona con el pipeline `image-classification` de la libreria transformers, lo que facilita su integracion en flujos existentes.
- Compatible con endpoints de HuggingFace (etiqueta endpoints_compatible).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No tiene capacidades multilingues ni de generacion de texto, codigo o matematicas.
- No dispone de modo de razonamiento (thinking mode), vision adicional, audio ni otras capacidades especiales.
- El parametro `top_k` del pipeline permite recuperar las tres probabilidades ordenadas por clase.

## Casos de uso

- Diagnostico fitosanitario asistido en campo: una aplicacion movil captura una foto de la hoja de judia y el modelo devuelve la clase mas probable junto con la confianza, orientando al agricultor sobre si aplicar tratamiento.
- Triaje previo en laboratorio agronomo: el modelo preclasifica lotes de imagenes de hojas para que un especialista humano revise unicamente los casos dudosos o de baja confianza, reduciendo el coste de inspeccion manual.
- Monitorizacion de cultivos con drones o robots agricolas: las imagenes capturadas periodicamente se pasan por el clasificador para detectar brotes de roya o mancha angular de forma temprana.
- Etiquetado asistido de datasets: dado que solo hay tres clases bien definidas, el modelo puede usarse para preanotar grandes volumenes de imagenes que despues se corrigen manualmente.
- Sistemas de alerta temprana: integrado en un backend que procesa imagenes enviadas por sensores, el clasificador dispara avisos cuando la proporcion de hojas con enfermedad supera un umbral en una parcela.
- Docencia y experimentacion con ViT: sirve como ejemplo de referencia reproducible de fine-tuning de un transformer de vision, incluyendo registro de metricas con MLflow.
- Componente de un pipeline mayor de agricultura de precision: sus salidas pueden alimentar un modelo de recomendacion de tratamiento o un sistema de trazabilidad de la parcela.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test del dataset AI-Lab-Makerere/beans:

| Metrica global | Valor |
|---|---|
| Accuracy | 0,9688 |
| Macro F1 | 0,9691 |

| Clase | Precision | Recall | F1-score | Soporte |
|---|---|---|---|---|
| angular_leaf_spot | 0,9762 | 0,9535 | 0,9647 | 43 |
| bean_rust | 0,9333 | 0,9767 | 0,9545 | 43 |
| healthy | 1,0000 | 0,9762 | 0,9880 | 42 |

El autor incluye una matriz de confusion en `assets/confusion_matrix.png`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria de benchmarks generales, ya que el modelo no es un modelo de lenguaje. No hay comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en FP32 (85,8 M de parametros x 4 bytes) y unos 175 MB en FP16/BF16, mas el coste de las activaciones, en cualquier caso inferior a 1 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU.
- El propio autor realizo el entrenamiento en CPU, lo que confirma que la inferencia es viable sin GPU dedicada.
- GPUs de datacenter (A100, H100) no son necesarias para este modelo; solo tendrian sentido para servir lotes masivos en paralelo.
- Opciones de despliegue: pipeline de transformers, endpoints de HuggingFace (etiqueta endpoints_compatible), TorchServe, ONNX Runtime o conversion a TensorRT. No se mencionan soportes especificos de vLLM, llama.cpp ni Ollama, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El tamano del modelo sugiere latencias de pocos milisegundos por imagen en GPU moderna y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales conocidas.

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lustachowicz/beans-vit | 85,8 M | Clasificacion de 3 clases de hojas de judia | Imagen 224x224 | no disponible | HuggingFace |
| google/vit-base-patch16-224 (modelo base) | 85,8 M | Clasificacion de imagenes en ImageNet (1000 clases) | Imagen 224x224 | Apache 2.0 (segun el modelo original) | HuggingFace |
| Otros clasificadores de enfermedades foliares | no disponible | Clasificacion de enfermedades en hojas | no disponible | no disponible | no disponible |

La comparacion directa con alternativas especializadas en el mismo dataset no es posible con los datos disponibles. El modelo base google/vit-base-patch16-224 es el punto de referencia natural, ya que beans-vit es un fine-tuning suyo.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo solo distingue tres clases de hojas de judia. No clasifica otras especies, otras enfermedades ni estados de la planta, y probablemente producira predicciones poco fiables fuera de ese dominio.
- Riesgo de sobreajuste al dataset de ajuste: solo se entrenaron 3 epochs sobre un conjunto reducido (el dataset beans tiene alrededor de 1300 imagenes), con 43 a 42 ejemplos por clase en test. Las metricas de 0,9688 de accuracy deben interpretarse con cautela por el tamano muestral.
- Riesgo de clasificacion erronea en condiciones de campo reales: iluminacion, fondo, angulo, resolucion o presencia de otras especies pueden degradar el rendimiento respecto a las imagenes del dataset.
- No hay informacion sobre sesgos demograficos (no aplica) ni sobre sesgos de dominio geografico de las imagenes de entrenamiento; el dataset AI-Lab-Makerere procede de un contexto concreto de recoleccion, lo que puede limitar la generalizacion.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor, lo que constituye un riesgo legal relevante para produccion.
- Idiomas no aplicables: es un clasificador de imagenes, no procesa texto ni lenguaje natural.
- Sin mantenimiento conocido: el repositorio registra 0 descargas y 0 likes, con fecha de actualizacion en 2026-10-11. No hay garantias de soporte, versionado ni correccion de errores.
- No debe usarse como unico criterio de diagnostico fitosanitario en produccion agricola sin validacion previa y supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lustachowicz/beans-vit
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Dataset de fine-tuning: https://huggingface.co/datasets/AI-Lab-Makerere/beans
- Matriz de confusion: assets/confusion_matrix.png (incluida en el repositorio del modelo)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
