# PBatch23888/birdspotter-mobilenetv4

## Resumen

BirdSpotter MobileNetV4 es un clasificador de imágenes binario especializado en detectar la presencia de aves en un fotograma completo. Lo publica el usuario PBatch23888 bajo licencia Apache-2.0 y se distribuye como artefacto de OpenVINO en FP16, derivado del checkpoint de timm `mobilenetv4_conv_small.e2400_r224_in1k`. No es un modelo de lenguaje ni un detector con cajas delimitadoras: devuelve un único logit crudo al que hay que aplicar una sigmoide para obtener la probabilidad de que la imagen contenga un ave.

Su relevancia es de infraestructura: actúa como filtro de primera etapa dentro del pipeline BirdSpotter, de modo que solo los fotogramas con probabilidad superior a 0,5 se envían al segmentador SAM 3. Eso permite descartar la mayor parte del material irrelevante (fotogramas vacíos de cámaras trampa o de vigilancia) antes de invocar un modelo mucho más caro, con el ahorro de cómputo que implica en despliegues de larga duración.

El modelo está pensado para ejecutarse en CPU con OpenVINO Runtime, con una entrada fija de 1 × 640 × 640 × 3 en formato NHWC uint8 en BGR tal como la decodifica OpenCV. La model card no documenta el número de parámetros, el volumen ni la composición del dataset de ajuste fino, ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV4, variante `conv_small`, exportada a OpenVINO IR |
| Parámetros totales | no disponible (la model card no lo indica) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de imagen 1 × 640 × 640 × 3 (NHWC, uint8, BGR) |
| Tipos de cuantización | FP16 en los pesos del IR de OpenVINO; no se documentan variantes INT8/INT4 |
| Idiomas soportados | no aplica (clasificación de imágenes); no disponible |
| Licencia | Apache-2.0, con obligación de preservar la atribución y los términos del modelo upstream de timm |
| Formato de pesos | OpenVINO IR (`classifier.xml` + `classifier.bin`), checkpoint PyTorch opcional (`best.pt`), metadatos en `manifest.json` |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional MobileNetV4 en su variante `conv_small`, el checkpoint de timm preentrenado en ImageNet-1k a 224 px (`mobilenetv4_conv_small.e2400_r224_in1k`), sobre el que se ha hecho un ajuste fino para una tarea de clasificación binaria. La cabeza original de 1000 clases se sustituye por una salida de una sola unidad: el grafo emite un logit crudo y es responsabilidad del consumidor aplicar la sigmoide y el umbral. El modelo se invoca con una resolución de 640 × 640, superior a la resolución nativa del preentrenamiento, lo que sugiere que el ajuste fino se hizo con entrada redimensionada.

El grafo de inferencia incorpora parte del preprocesado: acepta píxeles BGR en uint8 tal como los entrega OpenCV, convierte internamente a RGB y aplica la normalización de ImageNet (media [0,485; 0,456; 0,406], desviación [0,229; 0,224; 0,225]). El consumidor solo debe aplicar un letterboxing que preserve la relación de aspecto con relleno de valor 114 antes de pasar el tensor. No se documentan en la información disponible el número de imágenes de entrenamiento, la composición del dataset, ni si hubo técnicas de alineación o preferencia (RLHF/DPO no aplican a este tipo de modelo); tampoco se describen innovaciones como decodificación especulativa o atención lineal, impropias de una CNN de clasificación.

## Capacidades

- Clasificación binaria de presencia de ave sobre el fotograma completo (whole-frame), no detección de instancias ni cajas delimitadoras.
- Salida de un único logit crudo; requiere sigmoide en el consumidor y umbral por defecto de 0,5 para considerar el fotograma como positivo.
- Preprocesado parcial embebido en el grafo: conversión BGR→RGB y normalización ImageNet.
- Integración como etapa de filtrado previa a SAM 3: los fotogramas positivos pueden pasarse enteros al segmentador.
- Entrada de tamaño fijo a 640 × 640, sin soporte documentado de resolución variable ni de lotes mayores que uno.
- Ejecución en FP16 sobre OpenVINO Runtime, orientada a CPU e iGPU Intel.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, texto, audio ni capacidades multilingües.

## Casos de uso

- Filtrado previo en cámaras trampa: procesar cada fotograma con el clasificador y enviar solo los positivos a SAM 3, reduciendo de forma drástica el número de invocaciones del segmentador en despliegues de campo con semanas de grabación.
- Monitorización de avifauna en tiempo real: integrar el modelo en un bucle de OpenCV que lea el vídeo de una cámara IP, aplique letterboxing a 640 × 640 y registre los intervalos con presencia de aves para generar series temporales de actividad.
- Curado de datasets ornitológicos: recorrer un archivo de imágenes y separar automáticamente las que contienen aves de las que no, para construir conjuntos de entrenamiento o validación con menos esfuerzo manual.
- Estudio de uso de comederos o cajas nido: desplegar el clasificador en un dispositivo de bajo consumo con OpenVINO sobre CPU e inferir a intervalos regulares, activando la grabación o la captura en alta resolución solo cuando se supera el umbral.
- Automatización de informes de biodiversidad: agregar las probabilidades por franja horaria y ubicación para producir métricas de frecuencia de avistamiento que alimenten paneles o informes periódicos.
- Control de calidad en pipelines de visión: usar el clasificador como puerta de entrada en un sistema mayor de análisis de fauna, de forma que las etapas posteriores (identificación de especie, conteo, seguimiento) solo reciban material relevante.
- Despliegue en entornos sin GPU: al ejecutarse en FP16 con OpenVINO sobre CPU, encaja en servidores modestos o equipos de borde donde no es viable mantener un modelo mayor en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1, AUC ni comparaciones con otros clasificadores, y el repositorio figura con 0 descargas y 0 likes, por lo que tampoco hay evaluación de la comunidad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tipo de arquitectura (MobileNetV4 `conv_small` en FP16 con entrada de 640 × 640) el modelo es de tamaño reducido y previsiblemente ocupa bastante menos de 1 GB, pero esta cifra no está confirmada en la información proporcionada.
- GPU recomendadas: no se especifican; el artefacto está orientado a OpenVINO, es decir, a CPU e iGPU Intel (integradas y Arc). Cualquier GPU discreta moderna (RTX 4090, A100, H100) es sobredimensionada para esta carga.
- Compatibilidad con GPU de consumo: sí, con toda probabilidad cabe en cualquier GPU de consumo e incluso en sistemas sin GPU discreta, al ejecutarse en CPU mediante OpenVINO Runtime.
- Opciones de despliegue: OpenVINO Runtime (Python/C++), OpenVINO Model Server y aplicaciones propias basadas en OpenCV; el modelo se descarga con `scripts/download_models.py --classifier-repository OWNER/REPOSITORY` del proyecto BirdSpotter. No aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BirdSpotter MobileNetV4 | CNN binaria para presencia de aves | no disponible | 640 × 640 fija | 1 logit, umbral 0,5 | Apache-2.0 | HuggingFace (OpenVINO IR) |
| timm `mobilenetv4_conv_small.e2400_r224_in1k` | CNN de clasificación ImageNet-1k | aprox. pocos millones (no verificado aquí) | 224 × 224 | 1000 clases genéricas | Apache-2.0 | HuggingFace / timm |
| MobileNetV3-Small (timm) | CNN de clasificación ImageNet-1k | aprox. 2,5 M (referencia pública) | 224 × 224 | 1000 clases genéricas | Apache-2.0 | HuggingFace / timm |
| EfficientNet-B0 (timm) | CNN de clasificación ImageNet-1k | aprox. 5,3 M (referencia pública) | 224 × 224 | 1000 clases genéricas | Apache-2.0 | HuggingFace / timm |

La comparación relevante no es de precisión, porque no hay datos publicados, sino de encaje en el pipeline: frente a los clasificadores genéricos de ImageNet, este modelo reduce la tarea a una decisión binaria y a una resolución mayor (640 px), lo que simplifica la integración con SAM 3 y elimina la necesidad de mapear clases. No se dispone de alternativas específicas de detección de aves evaluadas en la misma información.

## Limitaciones y advertencias

- No hay métricas de evaluación publicadas: se desconoce la precisión real, la tasa de falsos positivos y el comportamiento en especies, hábitats o condiciones de iluminación distintas de las del conjunto de ajuste.
- Riesgo de sesgo por dataset no documentado: al no especificarse la composición de los datos de entrenamiento, no se puede evaluar la cobertura geográfica, de especies ni de condiciones meteorológicas.
- El umbral de 0,5 es un valor por defecto; en producción conviene calibrarlo con datos propios, ya que el coste de un falso positivo (invocar SAM 3 innecesariamente) y el de un falso negativo (perder un avistamiento) son asimétricos.
- Solo detecta presencia, no especie ni número de individuos ni localización: no sustituye a un detector o a un clasificador multiespecie.
- Preprocesado obligatorio: hay que respetar el letterboxing con relleno 114 y el orden BGR de entrada; cualquier desviación invalida las probabilidades.
- Entrada fija de 1 × 640 × 640 y lote uno: no admite batching dinámico ni resoluciones variables sin reexportar el grafo.
- Repositorio con 0 descargas y 0 likes y tamaño de 0.0 GB reportado: conviene verificar `manifest.json` y los checksums antes de confiar en el despliegue, ya que los artefactos podrían no estar completos o no ser los definitivos.
- Licencia Apache-2.0 permisiva para uso comercial, pero con obligación de preservar la atribución y los términos del modelo upstream de timm al redistribuir.
- Idiomas no aplica; no es un modelo de texto y no debe evaluarse con criterios de LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PBatch23888/birdspotter-mobilenetv4
- Modelo upstream de timm: https://huggingface.co/timm/mobilenetv4_conv_small.e2400_r224_in1k
- Búsquedas web realizadas: no devolvieron resultados relevantes sobre el modelo (solo páginas comerciales sin relación con el proyecto); no hay papers, blogs, repos ni demos adicionales disponibles.
