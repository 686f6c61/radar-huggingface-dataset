# Purino/resnet50-chest-pneumonia-256x256

## Resumen

resnet50-chest-pneumonia-256x256 es un clasificador binario de imagenes de radiografia de torax desarrollado por el usuario Purino y publicado en HuggingFace. Se trata de un ajuste fino de microsoft/resnet-50, una red neuronal convolucional ResNet-50 de 23.565.250 parametros, sobre el conjunto de datos chest-pneumonia-256x256 (thomasdubail/chest-pneumonia-256x256), con dos clases objetivo: normal y pneumonia. El modelo resuelve una tarea de clasificacion de imagen medica, no de generacion de texto.

Su relevancia es acotada y de caracter experimental: el propio autor lo etiqueta como material de investigacion y uso educativo, no como dispositivo medico ni validado clinicamente. El repositorio tiene 0 descargas y 0 likes, un tamano de 0,1 GB y se distribuye bajo licencia Apache-2.0. Frente a modelos multimodales grandes, su interes esta en el extremo opuesto: un clasificador convolucional pequeno, entrenable y desplegable en hardware modesto, util como linea base reproducible en experimentos de imagen medica.

La ficha se basa exclusivamente en la model card y los metadatos de HuggingFace. Los resultados de busqueda web disponibles no contienen informacion relevante sobre el modelo: los enlaces recuperados corresponden a transductores de presion Danfoss AKS 32 y AKS 33, sin relacion alguna con este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (red neuronal convolucional, CNN) |
| Parametros totales | 23.565.250 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen redimensionada a 224x224) |
| Tipos de cuantizacion | no disponible (no se documentan; el repositorio solo contiene pesos safetensors) |
| Idiomas soportados | no disponible / no aplica (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | microsoft/resnet-50 |
| Tarea (pipeline) | image-classification |
| Clases de salida | 2: normal, pneumonia |
| Tamano del repositorio | 0,1 GB |
| Dataset de ajuste | thomasdubail/chest-pneumonia-256x256 |
| Metricas declaradas | accuracy, precision, recall, f1, roc_auc |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 |
| Fecha de actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-50 clasica: una CNN con bloques residuales y conexiones de atajo, adaptada a una cabeza de clasificacion de dos clases en lugar de las 1000 clases de ImageNet del checkpoint base. La entrada son imagenes de radiografia de torax de 256x256 en escala de grises, convertidas a RGB de 3 canales, redimensionadas a 224x224 y normalizadas con las estadisticas del checkpoint base (media (0.485, 0.456, 0.406), desviacion (0.229, 0.224, 0.225)). El conjunto de datos tiene 4211 imagenes de entrenamiento, 3452 de validacion y 624 de test.

El entrenamiento se realizo en dos fases con AdamW y precision mixta. En la primera se congelo el backbone y se entreno solo la cabeza durante 3 epocas con learning rate 0,001. En la segunda se entreno la red completa durante 7 epocas, con learning rate 1e-05 para el backbone y 0,0001 para la cabeza, aplicando cosine annealing. Se uso tamano de lote 32, weight decay 0,0001, label smoothing 0,05 y semilla 42. El checkpoint publicado es el de mejor macro-F1 en validacion. Como aumento de datos en entrenamiento se aplicaron recorte aleatorio (escala 0,85-1,0), rotacion de mas/menos 8 grados, jitter de brillo y contraste de 0,15, random erasing con probabilidad 0,2 y volteo horizontal desactivado (p=0,0). El desbalance de clases se trato con un muestreador aleatorio ponderado. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion, que no aplican a un clasificador.

## Capacidades

- Clasificacion binaria de imagenes de radiografia de torax en dos etiquetas: normal y pneumonia.
- Salida de logits para dos clases, mapeables mediante id2label del config del modelo.
- Extraccion de caracteristicas visuales de la CNN subyacente (utilizable como backbone para otras tareas de imagen medica previo reajuste de la cabeza).
- Preprocesado integrado mediante AutoImageProcessor (redimensionado a 224x224, conversion a RGB y normalizacion con estadisticas ImageNet).
- Uso compatible con HF Inference Endpoints (etiqueta endpoints_compatible) y con la libreria transformers en PyTorch.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo de razonamiento (thinking mode), ni de entrada o salida de audio.
- La unica modalidad de entrada es imagen; la salida es una distribucion sobre dos clases.

## Casos de uso

- Linea base reproducible en investigacion: sirve como punto de partida para comparar tecnicas de aumento de datos, funciones de perdida o estrategias de ajuste fino en clasificacion de radiografias de torax, dado que el pipeline de entrenamiento esta documentado con hiperparametros concretos.
- Etiquetado asistido y curado de datasets: el modelo puede preetiquetar grandes volumenes de radiografias de 256x256 para reducir el trabajo manual, con revision humana obligatoria posterior, aprovechando su recall alto en la clase pneumonia (0,9641).
- Docencia y practicas de aprendizaje profundo: permite reproducir de principio a fin un flujo de transfer learning en imagen medica con un coste computacional bajo (23,5 millones de parametros).
- Experimentos de despliegue en el borde: su tamano (0,1 GB en repositorio) permite probar exportacion a ONNX o TorchScript y ejecucion en CPU o GPU de gama de entrada dentro de proyectos de investigacion sobre inferencia eficiente.
- Analisis de sensibilidad y calibracion: util como caso de estudio para medir como afectan el desbalance de clases y la ausencia de analisis de calibracion a las metricas por clase en clasificacion medica binaria.
- Filtrado previo en pipelines de investigacion retrospectiva: puede actuar como primer filtro para separar estudios con patron radiologico compatible con neumonia antes de una revision por especialistas, siempre en un contexto de investigacion y nunca como decision clinica.
- Pruebas de integracion de extremo a extremo: al ser compatible con transformers y con Inference Endpoints, permite validar infraestructura de servicio de modelos de imagen (procesado, batching, serializacion) sin depender de modelos multimodales grandes.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test reservado (n=624):

| Metrica | Valor |
|---|---|
| Accuracy | 0,8013 |
| Precision (macro) | 0,8361 |
| Recall (macro) | 0,747 |
| F1 (macro) | 0,7626 |
| ROC-AUC | 0,923 |
| Perdida de entropia cruzada | 0,4611 |

Desglose por clase:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| normal | 0,8986 | 0,5299 | 0,6667 | 234 |
| pneumonia | 0,7737 | 0,9641 | 0,8584 | 390 |

Matriz de confusion:

| Verdadero \ Predicho | normal | pneumonia |
|---|---|---|
| normal | 124 | 110 |
| pneumonia | 14 | 376 |

No se han publicado resultados comparativos con otros modelos sobre este mismo dataset en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (los pesos ocupan unos 94 MB y el modelo completo cabe holgadamente en cualquier GPU moderna). No se documentan medidas oficiales de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 y superiores. No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: si, cabe en todas las GPU de consumo actuales e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (PyTorch) con AutoModelForImageClassification y AutoImageProcessor; exportacion a ONNX o TorchScript; HF Inference Endpoints (el repositorio esta marcado como endpoints_compatible). vLLM, TGI, llama.cpp y Ollama estan orientados a modelos generativos de lenguaje y no aplican a este clasificador.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Purino/resnet50-chest-pneumonia-256x256 | 23.565.250 | Imagen 224x224 (radiografia de torax) | Accuracy 0,8013; F1 macro 0,7626; ROC-AUC 0,923 (test n=624) | apache-2.0 | HuggingFace, 0 descargas |
| microsoft/resnet-50 (modelo base) | no disponible | Imagen 224x224 | no disponible (entrenado en ImageNet, no en esta tarea) | no disponible en la informacion proporcionada | HuggingFace |
| Clasificadores tipo DenseNet-121 para radiografia de torax (por ejemplo, aproximaciones inspiradas en CheXNet) | no disponible | Imagen (resolucion variable) | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria. Cualquier comparacion de rendimiento exigiria reevaluar los modelos sobre el mismo split de test.

## Limitaciones y advertencias

- Uso previsto: el autor indica explicitamente que es material de investigacion y uso educativo, y que no es un dispositivo medico ni esta validado para uso clinico.
- Posible conflicto de licencia: el repositorio declara Apache-2.0, que permite uso comercial, pero la model card restringe el uso a investigacion y educacion. Conviene resolver esta discrepancia antes de cualquier despliegue en produccion.
- Sesgo de dataset: entrenado sobre un unico conjunto curado y preprocesado; el rendimiento sobre radiografias crudas de otros escaneres, hospitales o poblaciones no se ha probado.
- Riesgo de fuga de datos: el conjunto original no incluye identificadores de paciente, por lo que no puede garantizarse la separacion por paciente entre splits y las metricas publicadas podrian ser optimistas.
- Clasificacion estrictamente binaria: no distingue neumonia bacteriana de viral y nunca ha visto otras patologias, por lo que cualquier hallazgo distinto puede producir salidas sin sentido.
- Sin calibracion: no se ha realizado analisis de calibracion, de modo que la puntuacion softmax no debe interpretarse como probabilidad de enfermedad.
- Desbalance en el rendimiento por clase: el recall de la clase normal es bajo (0,5299), con 110 de 234 casos normales clasificados como pneumonia. El modelo tiende a sobrepredecir neumonia.
- Alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y negativos con consecuencias graves si se usa fuera del ambito de investigacion.
- Preprocesado obligatorio: el modelo espera imagenes de 256x256 en escala de grises convertidas a RGB, redimensionadas a 224x224 y normalizadas con estadisticas ImageNet. Omitir este pipeline degrada los resultados.
- Sin soporte de texto ni multilingue: no puede procesar informes clinicos ni metadatos textuales junto a la imagen.
- Sin mantenimiento ni adopcion demostrada: 0 descargas y 0 likes, sin evidencia de validacion externa ni de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Purino/resnet50-chest-pneumonia-256x256
- Modelo base: https://huggingface.co/microsoft/resnet-50
- Dataset en HuggingFace: https://huggingface.co/datasets/thomasdubail/chest-pneumonia-256x256
- Dataset original en Kaggle: https://www.kaggle.com/datasets/thomasdubail/chest-pneumonia-256x256
- Matriz de confusion incluida en el repositorio: confusion_matrix.png (referenciada en la model card)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados recuperados corresponden a documentacion de transductores de presion Danfoss AKS 32 y AKS 33, sin relacion con este repositorio.
