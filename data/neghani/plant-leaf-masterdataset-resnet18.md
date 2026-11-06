# neghani/plant-leaf-masterdataset-resnet18

## Resumen

`neghani/plant-leaf-masterdataset-resnet18` es un clasificador de imágenes especializado en la detección de enfermedades foliares en plantas. Se trata de un ajuste fino de `microsoft/resnet-18` sobre el Plant Leaf Disease MasterDataset, un conjunto propio del autor que cubre 86 clases distribuidas en 19 cultivos. El modelo resuelve la tarea de clasificación de imagen multi-clase a partir de una única imagen de hoja, devolviendo la probabilidad de cada una de las 86 categorías.

La arquitectura es una ResNet-18 estándar (CNN con conexiones residuales), con 11.230.230 parámetros totales y un tamaño de repositorio de 0,1 GB, lo que lo hace extremadamente ligero y apto para despliegue en hardware modesto, incluidos dispositivos de borde. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en el sentido habitual, sino que trabaja sobre tensores de imagen de 224×224 píxeles.

Su relevancia actual radica en la combinación de un rendimiento declarado alto (accuracy 0,9615 y macro-F1 0,9311 sobre 14.454 imágenes de test) con un coste computacional mínimo y una licencia Apache 2.0, lo que facilita su integración en aplicaciones agrícolas reales de diagnóstico temprano de enfermedades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con conexiones residuales) |
| Parametros totales | 11.230.230 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 224×224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (clasificacion de imagenes, sin componente textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `microsoft/resnet-18`, una red neuronal convolucional de 18 capas con bloques residuales de tipo BasicBlock. La entrada se procesa con un transform de evaluación alineado con el de entrenamiento: redimensionado del lado corto a 224 píxeles con interpolación bilineal, recorte central de 224×224 y normalización con media y desviación estándar de ImageNet. La cabeza de clasificación se ha reemplazado para producir 86 salidas, correspondientes a las 86 clases del MasterDataset.

El entrenamiento se realizó durante 5 épocas, con batch de 64, learning rate 5e-4, scheduler coseno, 500 pasos de warmup y semilla 42. El checkpoint seleccionado fue el de mejor macro-F1 en validación. El conjunto PlantDoc no se mezcló en el entrenamiento, lo que permite usarlo como evaluación fuera de distribución. En la versión `v1.0.1` se corrigió el procesador de imagen (se pasó de un procesador ConvNeXT con `crop_pct=0.875` a uno con `crop_pct=1.0` y remuestreo bilineal), manteniendo los pesos sin cambios; además se aplicó una temperatura de calibración de 1,088 en la ruta de servicio.

## Capacidades

- Clasificación de imágenes de hojas de planta en 86 clases que abarcan 19 cultivos distintos.
- Detección de enfermedades foliares y distinción entre estados sanos y patológicos dentro del vocabulario del MasterDataset.
- Salida de probabilidades por clase, con umbral de confianza calibrado (0,30) y temperatura de calibración (1,088) para la ruta de servicio.
- Capacidad de operar sobre imágenes individuales con preprocesado fijo (224×224, normalización ImageNet).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá de la clasificación de hojas.
- No dispone de modo thinking, audio ni vídeo.

## Casos de uso

- Diagnóstico temprano en campo: una aplicación móvil captura una foto de hoja y el modelo devuelve la clase de enfermedad con probabilidad asociada; su tamaño de 11,2 M de parámetros permite ejecución en el propio dispositivo sin conexión.
- Triaje en estaciones de inspección agrícola: integrado en un pipeline de cámara fija, clasifica lotes de hojas y activa alertas cuando la confianza supera el umbral calibrado de 0,30.
- Precribado en laboratorios fitopatológicos: el modelo prioriza muestras sospechosas antes de la revisión por un experto, reduciendo el volumen de análisis manual gracias a su top-3 accuracy de 0,9926.
- Monitorización de cultivos con drones o robots: al ser una CNN ligera, puede desplegarse en hardware embebido (Jetson, Raspberry Pi con acelerador) para clasificar imágenes aéreas o de proximidad.
- Control de calidad en viveros y semilleros: clasificación automática de plántulas para separar material sano del afectado en líneas de selección.
- Investigación agronómica: generación de etiquetas preliminares a gran escala sobre nuevos conjuntos de imágenes de hojas, que luego se validan manualmente, usando el modelo como anotador débil.
- Aplicaciones educativas o de extensión agraria: asistente visual que identifica la enfermedad a partir de una foto y muestra la clase correspondiente al agricultor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false`):

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,9615 | Plant Leaf Disease MasterDataset (test, n=14.454) |
| Macro-F1 | 0,9311 | Plant Leaf Disease MasterDataset (test, n=14.454) |
| Top-3 accuracy | 0,9926 | Plant Leaf Disease MasterDataset (test, n=14.454) |
| Loss | 0,1128 | Plant Leaf Disease MasterDataset (test, n=14.454) |
| Accuracy (validacion, ruta de servicio) | 0,9614 | Validacion (n=14.356) |

El autor indica que el split de test se consultó una vez durante el diagnóstico de un bug de caché de evaluación del Trainer, y que las cifras proceden de un scorer independiente (`model/score_split.py`) tras corregir dicho bug y alinear el procesador. No se han publicado resultados numéricos del conjunto out-of-distribution PlantDoc (1.988 imágenes, 21 clases solapantes) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (11,2 M de parámetros, ~45 MB de pesos), y del orden de 200-400 MB incluyendo activaciones para un batch pequeño a 224×224.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o T4; para desarrollo, RTX 4090, RTX 3090 o RTX 4060.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y similares; también es viable en CPU para inferencia por imagen individual.
- Opciones de despliegue: `transformers` (PyTorch), exportación a ONNX o TorchScript para servir con ONNX Runtime o TensorRT, y despliegue en dispositivos de borde mediante conversión a formatos ligeros. No se han publicado variantes GGUF ni integraciones con Ollama o vLLM (este último no aplica a visión).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `neghani/plant-leaf-masterdataset-resnet18` | 11,2 M | imagen 224×224 | Accuracy 0,9615; macro-F1 0,9311 (test propio) | Apache 2.0 | Hugging Face |
| `neghani/plantvillage-resnet18` | 11,2 M | imagen 224×224 | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| `microsoft/resnet-18` (base) | 11,7 M | imagen 224×224 | ImageNet top-1 ~69,8 % (referencia del modelo base) | Apache 2.0 | Hugging Face |

La comparación con otros clasificadores específicos de enfermedades vegetales (por ejemplo, variantes de EfficientNet o ViT ajustadas sobre PlantVillage) no puede establecerse con datos porque no se han proporcionado resultados de esos modelos en la información disponible. El modelo base `microsoft/resnet-18` sirve como referencia de arquitectura, no de tarea.

## Limitaciones y advertencias

- El vocabulario de clases está cerrado a las 86 clases y 19 cultivos del MasterDataset; cualquier hoja fuera de ese conjunto se asignará a una clase conocida, con riesgo de falsos positivos.
- El rendimiento fuera de distribución no está cuantificado en la información disponible: el autor reporta una evaluación en PlantDoc (1.988 imágenes, 21 clases solapantes) pero no publica las métricas en la model card.
- Las métricas de test no están verificadas de forma independiente (`verified: false`) y el propio autor señala que el split de test se consultó durante la depuración de un bug, lo que introduce un riesgo de fuga de información en la estimación.
- El preprocesado debe replicarse exactamente (redimensionado bilineal del lado corto a 224, recorte central 224, normalización ImageNet); la versión `v1.0` usaba un procesador incorrecto, por lo que debe usarse `v1.0.1`.
- La calibración de temperatura (1,088) y el umbral de confianza (0,30) están ajustados sobre el conjunto de validación; en dominios distintos pueden requerir recalibración.
- No es un modelo generativo ni conversacional: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el diagnóstico agronómico recae en el integrador; no debe sustituir la validación por un fitopatólogo en decisiones críticas.
- No se dispone de información sobre sesgos demográficos o geográficos del dataset, ni sobre la distribución de cultivos y condiciones de captura (iluminación, fondo, dispositivo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neghani/plant-leaf-masterdataset-resnet18
- Modelo base: https://huggingface.co/microsoft/resnet-18
- Modelo relacionado del mismo autor: https://huggingface.co/neghani/plantvillage-resnet18
