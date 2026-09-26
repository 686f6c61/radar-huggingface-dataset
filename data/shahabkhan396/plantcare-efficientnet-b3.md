# Shahabkhan396/plantcare-efficientnet-b3

## Resumen

PlantCare AI es un clasificador de imágenes basado en EfficientNet-B3, publicado en HuggingFace por el usuario Shahabkhan396 bajo el identificador `Shahabkhan396/plantcare-efficientnet-b3`. El modelo es un *fine-tuning* del checkpoint `tf_efficientnet_b3.ns_jft_in1k` sobre el conjunto de datos de campo PlantCity (Khan et al., 2025), que cubre 12 cultivos y 52 clases de enfermedad/sano a partir de fotografías de hojas tomadas en condiciones reales de cultivo. Su propósito es servir como herramienta de apoyo a la decisión en agricultura, no como sustituto de un diagnóstico fitopatológico profesional.

Técnicamente es una red convolucional (no un transformer ni un modelo de lenguaje): 10.863.452 parámetros, entrada RGB de 300x300 píxeles y salida de 52 logits con confianza calibrada mediante temperatura. El autor reporta una exactitud de test de 0,9956 y un macro-F1 de 0,9946 sobre un *split* estratificado y agrupado 72/14/14 con eliminación de casi-duplicados, lo que indica un rendimiento muy alto dentro de la distribución evaluada.

Su relevancia actual es doble. Por un lado, es un ejemplo de modelo pequeño y desplegable en el borde (aprox. 43 MB en fp32) para visión aplicada a agricultura, un nicho con pocos pesos abiertos específicos para regiones concretas. Por otro, sus propias limitaciones —entrenado solo con hojas de dos distritos de Khyber Pakhtunkhwa (Charsadda y Chitral)— lo convierten en un caso claro de cómo el *domain shift* geográfico condiciona la utilidad real de un clasificador agrícola.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B3 (CNN con bloques MBConv, *squeeze-and-excitation* y *compound scaling*) |
| Parámetros totales | 10.863.452 (dato real del repositorio en safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes; entrada fija de 300x300 píxeles) |
| Tipos de cuantización | No documentados por el autor. Los pesos se distribuyen en safetensors (precisión original no especificada); son convertibles a fp16, int8 y ONNX por ser una CNN estándar de timm |
| Idiomas soportados | No aplica (tarea de visión; sin componente de texto) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería timm) |

## Arquitectura y entrenamiento

La base es `tf_efficientnet_b3.ns_jft_in1k`, un EfficientNet-B3 preentrenado en ImageNet-1k con la receta Noisy Student y posteriormente ajustado con JFT, distribuido por la librería `timm`. EfficientNet-B3 emplea convoluciones *depthwise* separables, bloques MBConv con módulos de *squeeze-and-excitation* y escalado compuesto de profundidad, anchura y resolución, con una resolución de entrada nativa de 300x300. La cabeza de clasificación se ha sustituido por una de 52 clases, lo que explica que el total de parámetros (10.863.452) sea inferior al del checkpoint original de 1000 clases de ImageNet.

El *fine-tuning* se realizó sobre PlantCity (12 cultivos, 52 clases) con un *split* estratificado y agrupado por grupos de 72/14/14, eliminando casi-duplicados y usando únicamente fotografías originales, con aumento de datos *on-the-fly*. El autor aplica además calibración de temperatura: los logits deben dividirse por el valor `temperature` incluido en `plantcare_meta.json` antes de aplicar *softmax* para obtener confianzas calibradas, lo que reduce el error de calibración esperado (ECE) hasta 0,0030. No se documentan en la información disponible detalles sobre número de épocas, optimizador, *learning rate*, composición exacta del dataset ni técnicas de regularización más allá del aumento en línea.

## Capacidades

- Clasificación de imágenes de hojas de plantas en 52 clases correspondientes a 12 cultivos, incluyendo clases sanas y de enfermedad.
- Entrada de imagen RGB a 300x300 píxeles, con salida de 52 logits.
- Estimación de confianza calibrada mediante división de logits por temperatura y *softmax* posterior.
- Adecuado para inferencia por lote sobre grandes volúmenes de fotografías.
- No soporta *tool calling* ni *function calling*.
- No soporta uso como agente ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (*thinking*), visión general, audio ni generación de ningún tipo: es exclusivamente un clasificador discriminativo.
- No realiza segmentación, detección de múltiples lesiones ni localización de la enfermedad dentro de la imagen.

## Casos de uso

- Aplicación móvil de apoyo al agricultor: el modelo se integra en una app Android/iOS o en una web progresiva que envía la foto de una hoja a un servicio de inferencia y devuelve la clase predicha junto con la confianza calibrada. Su tamaño (43 MB en fp32, ~22 MB en fp16) permite incluso el despliegue local en el dispositivo sin conexión.
- Priorización de inspecciones en campo: un técnico agrícola fotografía hojas de varias parcelas y el modelo ordena las muestras por probabilidad de clase patógena, de modo que las visitas presenciales se concentran en las parcelas con mayor riesgo.
- Prefiltrado en pipelines de teledetección con drones: las imágenes capturadas por UAV se procesan en lote para descartar fotogramas sin interés y marcar aquellos que requieren revisión experta, reduciendo el volumen que llega al fitopatólogo.
- Control de calidad en viveros e invernaderos: cámaras fijas sobre líneas de producción o bancales fotografían hojas de forma periódica y el modelo alerta cuando aparece una clase asociada a enfermedad, permitiendo retirar lotes antes de su distribución.
- Servicio de API para cooperativas y asesorías agrarias: exposición del modelo mediante un endpoint REST (FastAPI, Triton) al que las cooperativas envían imágenes y reciben clasificación con nivel de confianza, integrándolo en sus sistemas de gestión de parcelas.
- Investigación y etiquetado asistido: uso del modelo como preanotador en la construcción de nuevos conjuntos de datos de enfermedades, revisando manualmente solo las predicciones de baja confianza o aquellas que caen lejos de los centros de clase.
- Seguimiento temporal de brotes: ejecutando el modelo sobre la misma parcela a lo largo de la campaña, la secuencia de clases predichas permite observar la evolución de una afección y documentarla para trazabilidad.
- Formación y extensión agraria: empleo del clasificador en materiales didácticos interactivos para que estudiantes de agronomía comparen sus propias identificaciones con la predicción del modelo y su confianza asociada.

## Benchmarks y rendimiento

Resultados publicados por el autor en la *model card* del repositorio:

| Métrica | Valor |
|---|---|
| Exactitud en test | 0,9956 |
| Macro-F1 en test | 0,9946 |
| ECE (calibrado) | 0,0030 |
| Tamaño de entrada | 300x300 |

No se han publicado resultados comparativos frente a otros modelos sobre el mismo conjunto PlantCity, ni métricas desagregadas por cultivo o por clase, ni evaluación fuera de los distritos de entrenamiento. Tampoco se han publicado resultados de benchmarks estándar de visión (ImageNet, etc.) para este *checkpoint* concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 43,5 MB de pesos en fp32 y 21,7 MB en fp16; con *activaciones* y *batches* pequeños, el consumo total se mantiene muy por debajo de 1 GB.
- Cabe en cualquier GPU de consumo: desde una GTX 1650 o RTX 3050 hasta una RTX 4090, así como en iGPU integradas. No requiere A100 ni H100.
- Ejecución viable en CPU: al tratarse de una CNN de ~10,9 M de parámetros a 300x300, es desplegable en servidores sin GPU e incluso en placas tipo Raspberry Pi, aunque con latencia mayor.
- Opciones de despliegue: PyTorch + timm, exportación a ONNX Runtime, TorchScript, TensorRT, OpenVINO para CPU Intel y NVIDIA Triton para servir en producción. No aplica a este modelo el uso de vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de imágenes por segundo en ninguna configuración de hardware.

## Comparativa con modelos similares

No se dispone de comparativas publicadas de este *checkpoint* frente a otras alternativas sobre PlantCity, por lo que la comparación se limita a características estructurales de backbones habitualmente usados para clasificación de enfermedades de plantas.

| Modelo | Parámetros aprox. | Entrada típica | Licencia | Disponibilidad | Rendimiento en PlantCity |
|---|---|---|---|---|---|
| PlantCare efficientnet_b3 (este modelo) | 10,86 M | 300x300 | No disponible | HuggingFace (timm, safetensors) | 0,9956 exactitud / 0,9946 macro-F1 (según autor) |
| EfficientNet-B0 | 5,3 M | 224x224 | Apache-2.0 (checkpoints timm/ImageNet) | HuggingFace, timm | No disponible |
| ResNet-50 | 25,6 M | 224x224 | Apache-2.0 / BSD (según checkpoint) | HuggingFace, torchvision | No disponible |
| ViT-B/16 | 86 M | 224x224 | Apache-2.0 (según checkpoint) | HuggingFace, timm | No disponible |

Las cifras de parámetros de los modelos alternativos son las de sus implementaciones estándar para ImageNet; no implican ningún resultado sobre datos de enfermedades de plantas, que no se ha publicado.

## Limitaciones y advertencias

- Sesgo geográfico y de dominio: el modelo se entrenó únicamente con hojas procedentes de dos distritos de Khyber Pakhtunkhwa (Charsadda y Chitral). El propio autor advierte de una caída de rendimiento esperable en otras regiones, con otras cámaras y con otros cultivos.
- *Domain shift* de captura: variaciones de iluminación, fondo, distancia focal, sensor y compresión de imagen pueden degradar la precisión de forma no cuantificada.
- No es un diagnóstico: el autor lo define explícitamente como herramienta de apoyo a la decisión. No debe usarse para decidir tratamientos fitosanitarios sin validación experta.
- Cobertura de clases fija: solo reconoce las 52 clases cubiertas por PlantCity entre 12 cultivos; cualquier otra especie o patología queda fuera del espacio de etiquetas y se forzará a una de las clases conocidas.
- Riesgo de alucinación en sentido clasificatorio: al ser un clasificador cerrado, siempre devolverá una etiqueta con su confianza, incluso ante imágenes fuera de distribución. La calibración de temperatura mitiga, pero no elimina, este riesgo.
- Licencia no disponible: no se especifica licencia para los pesos, lo que impide determinar si el uso comercial está permitido.
- Advertencia del autor sobre el dataset: la *model card* indica que debe comprobarse la licencia de PlantCity (Khan et al., 2025, Mendeley Data) antes de redistribuir o liberar los pesos.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 *me gusta* en el momento de la consulta, sin issues, discusiones ni replicaciones independientes de las métricas.
- Ausencia de métricas desagregadas: no hay resultados por cultivo, por clase ni matrices de confusión publicadas, por lo que se desconoce si existen clases con rendimiento muy inferior a la media.
- Metadatos incompletos: el repositorio no incluye arquitectura de entrenamiento documentada, número de épocas, hiperparámetros ni detalles del aumento de datos.
- Requiere posprocesado específico: si no se divide por la temperatura indicada en `plantcare_meta.json`, las confianzas devueltas no estarán calibradas y el ECE reportado no será aplicable.

## Enlaces

- [Modelo en HuggingFace: Shahabkhan396/plantcare-efficientnet-b3](https://huggingface.co/Shahabkhan396/plantcare-efficientnet-b3)
- [Checkpoint base en HuggingFace: timm/tf_efficientnet_b3.ns_jft_in1k](https://huggingface.co/timm/tf_efficientnet_b3.ns_jft_in1k)
- [Librería timm (GitHub)](https://github.com/huggingface/pytorch-image-models)
- Referencia del dataset: Khan et al. (2025), *PlantCity: A Comprehensive Image Based on Multi Crop Leaves disease in Pakistan*, Mendeley Data. URL no disponible en la información proporcionada.
- No se han encontrado enlaces adicionales relevantes (papers, blogs, demos o repositorios) en los resultados de búsqueda web disponibles.
