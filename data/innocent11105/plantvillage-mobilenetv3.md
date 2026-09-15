# innocent11105/plantvillage-mobilenetv3

## Resumen

ConCaPlant es un clasificador de imágenes de hojas de cultivo publicado por el usuario innocent11105 en HuggingFace. Se trata de un modelo convolucional ligero de 1,53 millones de parámetros, construido a partir de un backbone preentrenado en ImageNet al que se le ha sustituido y reentrenado la cabeza de clasificación. El modelo recibe una imagen RGB de 256 × 256 píxeles normalizada con la media y desviación típica de ImageNet y devuelve logits sobre 15 clases de hoja sana o enferma. El repositorio declara una exactitud de test de 0,9977 sobre el conjunto PlantVillage.

El problema que aborda es el precribado de enfermedades de cultivos a partir de fotografías de hojas (tizón, mildiu, virus del mosaico, mancha bacteriana, entre otras) en tomate, patata, pimiento y otros cultivos cubiertos por PlantVillage. Su tamaño reducido lo hace apto para inferencia en el borde: los pesos ocupan del orden de 6 MB en fp32 y el repositorio incluye exportaciones a TorchScript y ONNX además del `state_dict` de PyTorch, lo que permite desplegarlo sin reconstruir la arquitectura en frameworks distintos.

Su relevancia es la de un modelo de referencia pequeño y fácil de reproducir para clasificación de enfermedades vegetales, no la de un sistema de diagnóstico agronómico. La model card advierte explícitamente de que está pensado para investigación, educación y como componente de herramientas de apoyo a la decisión, no como sustituto del diagnóstico experto. El repositorio registra 0 descargas y 0 "likes" en los metadatos consultados, y el nombre del repositorio (mobilenetv3) no coincide del todo con la arquitectura declarada en la model card (ConCaPlant), un punto que se detalla más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConCaPlant, según la model card; backbone preentrenado en ImageNet con cabeza de clasificación reentrenada. Las etiquetas y el nombre del repositorio apuntan a la familia MobileNetV3, pero la model card no identifica el backbone exacto ni resuelve las plantillas de código |
| Parámetros totales | 1,53 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes) |
| Tipos de cuantización | No disponible (no se publican pesos cuantizados; solo exportaciones fp32 en PyTorch, TorchScript y ONNX) |
| Idiomas soportados | No disponible (modelo de visión, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`pytorch_model.bin`), TorchScript (`model_scripted.pt`) y ONNX (`model.onnx`) |
| Entrada | Imagen RGB redimensionada y recortada a 256 × 256, normalizada con media [0,485, 0,456, 0,406] y desviación [0,229, 0,224, 0,225] |
| Salida | Logits sobre 15 clases de enfermedad/hoja sana; el mapeo índice → etiqueta está en `class_names.json` |
| Tarea (pipeline) | `image-classification` |
| Dataset de entrenamiento | `emmarex/plantvillage` (PlantVillage), partición 70/15/15 para entrenamiento, validación y test |
| Fecha de publicación | 15 de septiembre de 2026, según los metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB, según los metadatos de HuggingFace |

## Arquitectura y entrenamiento

La model card describe el modelo como "ConCaPlant", una red convolucional de 1,53 M de parámetros con un backbone preentrenado en ImageNet y una cabeza clasificadora ajustada sobre PlantVillage. Las etiquetas del repositorio incluyen `mobilenet` y el identificador es `plantvillage-mobilenetv3`, y el propio ejemplo de carga de la model card hace referencia a la estructura `model.classifier[3]` típica de `torchvision.models.mobilenet_v3`, lo que sugiere que el backbone pertenece a esa familia, aunque el dato no se confirma de forma explícita ni se indica la variante (Small o Large). El pipeline es de clasificación de imagen completa: una hoja por imagen, sin detección ni segmentación.

En cuanto al entrenamiento, la información disponible se limita al dataset empleado y a la partición 70/15/15. No se especifican el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de lote, las técnicas de aumento de datos ni si se aplicaron estrategias de ajuste fino selectivo o de descongelación progresiva de capas; esos hiperparámetros deberían estar en el archivo `training_config.json` del repositorio, cuyo contenido no se incluye en la información proporcionada. No hay constancia de entrenamiento con RLHF, DPO o similares, algo que no aplica a un clasificador de imágenes. Tampoco se documenta ninguna innovación técnica destacable (atención lineal, decodificación especulativa, destilación u otras).

## Capacidades

- Clasificación de una imagen de hoja en 15 clases de cultivo sano o enfermo: el conjunto PlantVillage cubre enfermedades como tizón (blight), mildiu (mildew), virus del mosaico y mancha bacteriana en tomate, patata, pimiento y otros cultivos incluidos en el dataset.
- Salida de logits por clase, con el mapeo índice → etiqueta en `class_names.json`; el usuario debe aplicar el `argmax` para obtener la clase predicha.
- Exportaciones listas para otros runtimes: TorchScript (`model_scripted.pt`), que no requiere redefinir la arquitectura, y ONNX (`model.onnx`) para inferencia multiplataforma.
- Inferencia en CPU y en dispositivos de borde, gracias al tamaño reducido del modelo.
- No genera texto ni mantiene conversaciones: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No dispone de soporte nativo para agentes ni razonamiento multi-paso; cualquier flujo de ese tipo tendría que orquestarse externamente.
- No tiene capacidades multilingües, ya que no procesa texto.
- No ofrece modo de razonamiento (thinking mode), entrada de audio ni comprensión visual general: no es un modelo visión-lenguaje, solo clasifica imágenes dentro de su conjunto de 15 etiquetas.
- No se documentan capacidades de localización de la lesión, detección de múltiples hojas por imagen ni segmentación.

## Casos de uso

- Aplicación móvil de diagnóstico orientativo en campo: con alrededor de 6 MB de pesos en fp32 —y del orden de 1,5 MB si se cuantiza a int8— el modelo puede empaquetarse mediante ONNX Runtime Mobile o convertirse a formatos de borde para dar una primera clasificación de la hoja fotografiada. La model card advierte de que la exactitud cae en fotos de campo con fondos variables.
- Precribado en asesoría agronómica: recibir lotes de fotos enviadas por agricultores, clasificarlas automáticamente y priorizar la revisión humana de los casos con menor confianza o con clases poco representadas. El ahorro viene de reducir el volumen de imágenes que un técnico debe inspeccionar una a una.
- Monitorización con cámaras fijas en invernadero: al tratarse de un entorno con iluminación y fondo más controlados, más cercano a las condiciones del dataset, el modelo puede ejecutarse en el borde (Raspberry Pi, Jetson) sobre ONNX Runtime y emitir alertas cuando la clase predicha deja de ser hoja sana.
- Procesado por lotes de imágenes aéreas o de trampas: clasificar grandes volúmenes de capturas en CPU para generar mapas de incidencia por parcela, usando la clase predicha como variable de entrada en un sistema de información geográfica.
- Investigación y comparación de arquitecturas: sirve como línea base ligera y reproducible sobre PlantVillage (partición 70/15/15 declarada) para medir el efecto de cambios de backbone, aumento de datos o cuantización en un clasificador de 1,53 M de parámetros.
- Etiquetado asistido en pipelines de anotación: preetiquetar automáticamente imágenes antes de la revisión humana, de modo que el anotador solo corrija las predicciones dudosas en lugar de etiquetar desde cero.
- Educación y divulgación agronómica: aplicación o taller en el que los participantes fotografían hojas y comparan la predicción del modelo con la identificación real, ilustrando tanto las capacidades como los fallos típicos de un clasificador entrenado con imágenes de laboratorio.
- Microservicio dentro de una plataforma de agricultura de precisión: exponer el modelo detrás de una API REST (ONNX Runtime, TorchServe u otro servidor de inferencia) para que otras aplicaciones consulten la clase de una imagen sin cargar el modelo en el cliente.
- Extracción de características para transferencia: reutilizar el backbone convolucional como extractor de representaciones para tareas relacionadas con menos datos etiquetados, dado su bajo coste computacional.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Exactitud de test (PlantVillage, 15 clases) | 0,9977 (0.9977382875605816 según la model card) |
| Mejor exactitud de validación | 0,9971 (0.997092084006462 según la model card) |
| Exactitud por clase (F1 u otras) | No disponible en la información proporcionada; la model card remite a las puntuaciones por clase del cuaderno de entrenamiento |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplica (modelo de clasificación de imágenes) |
| Comparación con otros modelos sobre PlantVillage | No disponible |

No se han publicado en la información disponible resultados comparativos frente a otros clasificadores sobre el mismo conjunto de test, ni el desglose por clase que permitiría valorar el comportamiento en las categorías menos representadas. La model card advierte de que la distribución de clases de PlantVillage está desbalanceada entre cultivos y enfermedades.

## Requisitos de hardware

- Pesos del modelo: con 1,53 M de parámetros, el archivo en fp32 ocupa aproximadamente 6,1 MB, unos 3,1 MB en fp16 y alrededor de 1,5 MB en int8 (estimación derivada del número de parámetros; el repositorio no publica versiones cuantizadas).
- VRAM estimada para inferencia: por debajo de 100 MB incluyendo activaciones para lotes pequeños a 256 × 256, aunque no se han publicado mediciones reales. El modelo es ejecutable en CPU sin GPU.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU con soporte CUDA, incluidas las de gama baja o integradas, es suficiente; no se necesita A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo, y también en aceleradores de borde como Raspberry Pi 4/5, Jetson Nano u Orin, y en móviles mediante conversión a ONNX Runtime Mobile, NNAPI o Core ML (estas conversiones no se incluyen en el repositorio).
- Opciones de despliegue: PyTorch con el `state_dict` y la arquitectura reconstruida, TorchScript y ONNX Runtime son las vías documentadas. Son posibles conversiones adicionales a TensorRT, OpenVINO o TFLite, pero no se proporcionan. Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican, ya que están orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no disponible. Al no publicarse mediciones, conviene medir el rendimiento en el hardware objetivo antes de dimensionar un servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Licencia | Rendimiento en PlantVillage |
|---|---|---|---|---|
| plantvillage-mobilenetv3 (este modelo) | 1,53 M | 256 × 256 RGB | MIT | Exactitud de test 0,9977 sobre 15 clases |
| MobileNetV3-Small | Aproximadamente 2,5 M (cifra de referencia de la arquitectura, no verificada en este repositorio) | 224 × 224 | BSD-3-Clause (torchvision) | No disponible |
| MobileNetV3-Large | Aproximadamente 5,4 M (cifra de referencia de la arquitectura, no verificada en este repositorio) | 224 × 224 | BSD-3-Clause (torchvision) | No disponible |
| EfficientNet-B0 | Aproximadamente 5,3 M (cifra de referencia de la arquitectura, no verificada en este repositorio) | 224 × 224 | BSD-3-Clause (torchvision) | No disponible |
| ResNet-18 | Aproximadamente 11,7 M (cifra de referencia de la arquitectura, no verificada en este repositorio) | 224 × 224 | BSD-3-Clause (torchvision) | No disponible |

La comparación se limita al orden de magnitud del número de parámetros y a la disponibilidad de los backbones en bibliotecas estándar. No se dispone de resultados de esos modelos sobre el mismo subconjunto de PlantVillage de 15 clases, por lo que no es posible afirmar cuál rinde mejor en esta tarea concreta. La ventaja diferencial de este repositorio es que ya incluye los pesos ajustados y las exportaciones a TorchScript y ONNX, cosa que no ocurre con los backbones genéricos de torchvision.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo se entrenó con imágenes de laboratorio de fondo uniforme. La exactitud puede degradarse notablemente en fotografías de campo con iluminación variable, fondos heterogéneos, oclusión parcial, varias hojas en la imagen o enfermedades co-ocurrentes.
- Desbalance de clases: la model card señala que PlantVillage está desbalanceado entre cultivos y enfermedades y recomienda revisar las puntuaciones F1 por clase antes de confiar en el modelo para las categorías menos representadas. Esas métricas no se incluyen en la información disponible.
- Cobertura limitada: no está validado para cultivos o enfermedades fuera del conjunto de etiquetas de PlantVillage. Solo clasifica 15 clases y no puede indicar "desconocido": cualquier imagen ajena al dominio se asignará a una de esas 15 categorías.
- Riesgo de alucinación en sentido clasificatorio: al producir siempre una etiqueta, no existe un mecanismo de rechazo ni una estimación de incertidumbre calibrada publicada, por lo que las predicciones de baja confianza deben tratarse con cautela.
- No sustituye al diagnóstico agronómico experto, especialmente en decisiones de tratamiento con consecuencias económicas o fitosanitarias.
- Model card incompleta: el README conserva marcadores de plantilla sin sustituir (`{MODEL_NAME}`, `{num_classes}`, `{img_size}`) y el ejemplo de PyTorch pide reconstruir la arquitectura manualmente antes de cargar el `state_dict`. Cualquier error al elegir el backbone o el número de clases de la cabeza hará fallar la carga de pesos.
- Inconsistencia de nomenclatura: el repositorio se llama `plantvillage-mobilenetv3` y lleva la etiqueta `mobilenet`, mientras que la model card denomina a la arquitectura "ConCaPlant". No se especifica la variante concreta del backbone, lo que dificulta auditar el modelo.
- Tamaño de entrada ambiguo: la model card indica 256 × 256 en el apartado de detalles, pero el código de ejemplo usa `Resize(256)` seguido de `CenterCrop({img_size})`, con un marcador sin resolver para el recorte final.
- Uso comercial: la licencia de los pesos es MIT, permisiva, pero la licencia del dataset PlantVillage debe verificarse por separado antes de explotarlo comercialmente; ese dato no está disponible en la información proporcionada.
- Falta de validación externa: el repositorio presenta 0 descargas y 0 "likes" en los metadatos consultados, y la única evidencia de rendimiento son las cifras de exactitud declaradas por el propio autor, sin replicación independiente.
- Metadatos llamativos: la fecha de creación registrada (15 de septiembre de 2026) y el tamaño de repositorio de 0,0 GB conviene confirmarlos directamente en la ficha de HuggingFace antes de integrar el modelo en un sistema en producción.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/innocent11105/plantvillage-mobilenetv3
- Dataset PlantVillage en Kaggle (emmarex/plantvillage), referenciado por la model card: https://www.kaggle.com/datasets/emmarex/plantvillage
- No se han encontrado en la información proporcionada enlaces adicionales a artículos, blogs técnicos, repositorios de código ni demostraciones.
