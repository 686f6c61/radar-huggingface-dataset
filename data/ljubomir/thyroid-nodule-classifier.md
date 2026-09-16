# ljubomir/thyroid-nodule-classifier

## Resumen

Thyroid-nodule-classifier es un clasificador binario de imágenes de ecografía tiroidea desarrollado por el usuario ljubomir y publicado en HuggingFace. El modelo distingue entre nódulos tiroideos benignos y malignos a partir de una imagen de ecografía en modo B recortada al nódulo. Se trata de un modelo pequeño y ligero: la arquitectura es una ResNet-18 con una cabeza de clasificación de 2 clases, gestionada a través de la librería timm, y los pesos se distribuyen en un único checkpoint de PyTorch llamado `tn_final.pt`.

El modelo se entrenó sobre las imágenes pre-recortadas del conjunto público TN5000 (`Johnyquest7/TN5000-thyroid-nodule-classification`), es decir, cada imagen de entrada contiene un único nódulo con algo de contexto circundante. La salida es un softmax de 2 clases donde el índice 0 corresponde a benigno y el índice 1 a maligno, con umbral recomendado de 0,5 (configurable por el usuario). La model card es explícita al respecto: se trata de un modelo para investigación, no de un producto sanitario, y no debe emplearse para la toma de decisiones clínicas.

Su relevancia es limitada y muy específica: es un ejemplo de modelo de imagen médica de bajo coste computacional, reproducible en CPU o en cualquier GPU de consumo, útil como línea base en investigación de CAD (diagnóstico asistido por ordenador) o para pre-etiquetado de datos. El repositorio es muy reciente (creado el 15 de septiembre de 2026, actualizado el 16 de septiembre de 2026) y no registra descargas ni likes, por lo que carece de validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN convolucional, implementación de timm), cabeza de clasificación de 2 clases |
| Parámetros totales | ~11,2 M (cifra derivada de la ResNet-18 estándar con cabeza de 2 clases; no se indica en la model card) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada de 224×224 px tras el preprocesado) |
| Tipos de cuantización | no disponible (la model card solo describe el checkpoint en punto flotante) |
| Idiomas soportados | no disponible (la salida son dos etiquetas fijas: benign / malignant) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (`tn_final.pt`, diccionario generado con `torch.save`); no safetensors ni GGUF |
| Pipeline | image-classification |
| Librería | timm |
| Entrada | Imagen RGB (`convert("RGB")`), 3 canales, redimensionada con `Resize(256)` + `CenterCrop(224)` |
| Normalización | media [0.485, 0.456, 0.406], desviación [0.229, 0.224, 0.225] (valores ImageNet, obligatorios) |
| Salida | Softmax de 2 clases: índice 0 = benigno, índice 1 = maligno |
| Tamaño del repositorio | 0,0 GB (redondeado según HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 15 de septiembre de 2026 |
| Última actualización | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18, una red neuronal convolucional residual con 18 capas con pesos, bloques residuales de tipo BasicBlock y normalización por lotes. La model card no documenta el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de lote ni las técnicas de aumento de datos empleadas. Tampoco se especifica si hubo ajuste fino desde pesos preentrenados en ImageNet o entrenamiento desde cero, aunque el uso de valores de normalización de ImageNet y la construcción del modelo mediante `timm.create_model` sugieren un flujo de transferencia de aprendizaje, si bien esto no se confirma en la documentación.

El checkpoint es autodescriptivo: almacena las claves `model_name`, `num_classes`, `class_names` y `model_state_dict`, de modo que no requiere un fichero de configuración separado. La carga exige `weights_only=False` porque el diccionario contiene metadatos además de tensores (PyTorch ≥ 2.6 establece `weights_only=True` por defecto). El autor también indica que no deben alterarse ni los tamaños ni los valores de normalización, ya que reproducen exactamente el preprocesado de entrenamiento.

No se documentan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, mezcla de expertos, RLHF o DPO). No se dispone de datos sobre la composición exacta del conjunto de entrenamiento, la proporción de clases, el reparto entre entrenamiento/validación/prueba ni la procedencia de los ecógrafos utilizados, más allá de la referencia al conjunto TN5000.

## Capacidades

- Clasificación binaria de imágenes de ecografía tiroidea en modo B recortadas al nódulo, con dos etiquetas de salida: benigno y maligno.
- Devuelve probabilidades calibradas mediante softmax, lo que permite fijar un punto de operación distinto de 0,5 según la sensibilidad o especificidad deseada.
- Inferencia sobre una única imagen (lote de tamaño 1 en el ejemplo de la model card), aunque al ser una ResNet-18 admite procesamiento por lotes a nivel de implementación.
- Ejecución en CPU o GPU, dado el reducido tamaño del modelo.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: la salida son dos etiquetas fijas.
- No realiza detección ni segmentación de nódulos: requiere que la imagen de entrada ya esté recortada.
- No tiene modo de razonamiento (thinking mode), visión general, audio ni otras modalidades más allá de la imagen de entrada descrita.

## Casos de uso

- Línea base en investigación de diagnóstico asistido: sirve como punto de comparación reproducible para evaluar arquitecturas más complejas sobre el mismo conjunto TN5000, gracias a su bajo coste computacional y a un preprocesado completamente especificado.
- Pre-etiquetado de datos para anotación: integrado en un flujo donde primero se recorta cada nódulo y después se clasifica, permite priorizar las imágenes con alta probabilidad de malignidad para revisión manual, reduciendo la carga de trabajo del anotador.
- Control de calidad y curado de conjuntos de datos: aplicar el clasificador a un corpus de imágenes recortadas permite detectar etiquetas potencialmente erróneas o casos atípicos que merezcan revisión.
- Docencia y formación técnica: es un ejemplo completo y ejecutable de flujo de clasificación de imagen médica con timm, carga de checkpoints autodescriptivos y preprocesado estricto, útil en cursos de aprendizaje profundo aplicado.
- Prototipado de sistemas CAD en entornos con recursos limitados: al ejecutarse en CPU con un consumo de memoria mínimo, puede desplegarse en estaciones de trabajo sin GPU dentro de un entorno de investigación.
- Experimentos de robustez y sesgo: permite estudiar cómo varía la predicción entre distintos ecógrafos, resoluciones o protocolos de adquisición, siempre que las imágenes se recorten y preprocesen de la misma forma que los datos de entrenamiento.
- Comparación de estrategias de preprocesado: sirve para cuantificar el impacto de distintos recortes o resoluciones de entrada sobre un modelo ya entrenado con un preprocesado fijo, como referencia de sensibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, sensibilidad, especificidad, AUC ni matrices de confusión, ni sobre el conjunto de prueba ni sobre validación cruzada, y tampoco se documenta el reparto de datos empleado para evaluar. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo, el conjunto TN5000 ni la clasificación de nódulos tiroideos: los enlaces obtenidos corresponden a servicios de seguimiento de vuelos (FlightAware) y son irrelevantes para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en precisión simple ocupan aproximadamente 45 MB (unos 22 MB en media precisión); el resto del consumo corresponde a activaciones, que con entradas de 224×224 son reducidas incluso con lotes moderados.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere hardware de centro de datos. Funciona correctamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas últimas quedan muy sobredimensionadas.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo e integrada, e incluso en CPU. También es apto para Apple Silicon mediante MPS.
- Opciones de despliegue: PyTorch con timm (flujo documentado por el autor), TorchScript, ONNX Runtime o TensorRT previa exportación (la conversión no está documentada por el autor, aunque es un procedimiento estándar para una ResNet-18), además de servidores de inferencia genéricos como TorchServe o FastAPI. No se proporciona integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

No se dispone, en la información proporcionada, de modelos comparables con datos verificables sobre la misma tarea. La model card no cita alternativas ni resultados de otros clasificadores de nódulos tiroideos, y la búsqueda web no devolvió resultados pertinentes. A continuación se comparan únicamente características de arquitectura de referencia; las cifras de parámetros de las arquitecturas base son valores publicados de dichas arquitecturas, no mediciones sobre este modelo ni resultados de rendimiento en la tarea de nódulos tiroideos.

| Modelo | Arquitectura | Parámetros (aprox.) | Entrada típica | Licencia | Rendimiento en nódulos tiroideos |
|---|---|---|---|---|---|
| thyroid-nodule-classifier (ljubomir) | ResNet-18, 2 clases | ~11,2 M | 224×224 RGB | MIT | no disponible |
| Alternativa con ResNet-50 | ResNet-50 | ~25,6 M | 224×224 RGB | variable según implementación | no disponible |
| Alternativa con EfficientNet-B0 | EfficientNet-B0 | ~5,3 M | 224×224 RGB | variable según implementación | no disponible |
| Alternativa con ViT-B/16 | Vision Transformer | ~86 M | 224×224 RGB | variable según implementación | no disponible |

## Limitaciones y advertencias

- No es un producto sanitario. El propio autor indica que es para investigación y que no debe utilizarse para la toma de decisiones clínicas. Cualquier uso clínico exigiría validación regulatoria, certificación y estudios prospectivos.
- Requiere imágenes recortadas al nódulo. El modelo no detecta ni segmenta nódulos: si se le proporciona un fotograma completo de ecografía, el comportamiento es indeterminado. La model card advierte explícitamente de que el comportamiento sobre otros tipos de imagen no está caracterizado.
- Dependencia estricta del preprocesado. Cambiar los tamaños de redimensionado, el recorte central o los valores de normalización altera las predicciones, ya que debe reproducirse exactamente el preprocesado de entrenamiento.
- Entrada RGB con canal gris replicado. Aunque la ecografía es en escala de grises, el modelo espera 3 canales; alimentarlo con una imagen de 1 canal provoca un error.
- Posible sesgo de dominio. El entrenamiento se realizó únicamente sobre el conjunto TN5000, sin información pública sobre la diversidad de ecógrafos, ajustes de ganancia, poblaciones de pacientes, sexo, edad o etnia. No hay evidencia de validación externa, por lo que la generalización a otros centros o dispositivos es desconocida.
- Riesgo de alucinación en sentido amplio: el modelo siempre devuelve una probabilidad para cada clase, incluso ante imágenes fuera de distribución, sin mecanismo de abstención ni de detección de incertidumbre.
- Umbral no validado. La model card sugiere un umbral de 0,5 sobre la probabilidad de malignidad, pero no aporta curvas ROC, sensibilidad, especificidad ni calibración que justifiquen ese punto de operación.
- Ausencia de validación comunitaria. El repositorio acumula 0 descargas y 0 likes y se publicó en septiembre de 2026, sin evidencia de revisión independiente.
- Licencia MIT. Permite uso comercial y modificación con atribución, pero la licencia del software no exime de las obligaciones regulatorias aplicables a un producto sanitario ni de las condiciones de uso del conjunto de datos TN5000, que conviene revisar por separado.
- Fecha de creación posterior a algunos marcos de trabajo citados: se recomienda verificar la compatibilidad de versiones de PyTorch (el ejemplo exige `weights_only=False`, relevante desde PyTorch 2.6) y de timm antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ljubomir/thyroid-nodule-classifier
- Conjunto de datos TN5000 citado por el autor: https://huggingface.co/datasets/Johnyquest7/TN5000-thyroid-nodule-classification
- Búsqueda web realizada: no se encontraron enlaces relevantes al modelo, al conjunto de datos ni a la tarea de clasificación de nódulos tiroideos. Los resultados devueltos correspondían a servicios de seguimiento de vuelos (FlightAware) y se han descartado por no ser pertinentes.
