# mgranberry/speciesnet-v4.0.3a-nhwc-uint8-onnx

## Resumen

SpeciesNet v4.0.3a (`always_crop`) NHWC `uint8` ONNX es una reempaquetación del clasificador de imágenes SpeciesNet-Crop, derivado del modelo EfficientNetV2-M de Google Camera Trap AI (SpeciesNet). El autor del repositorio, `mgranberry`, ha adaptado el grafo ONNX original (NCHW, `float32`, normalizado a `[0,1]`) para que acepte directamente tensores `uint8` en formato NHWC, que es la salida nativa del pipeline de recorte de Frigate NVR. No es un modelo nuevo ni reentrenado: es una conversión de I/O con preprocesado embebido en el grafo.

El modelo clasifica recortes de fauna en 2.498 clases taxonómicas a partir de imágenes de 480x480 píxeles, y está pensado para integrarse en flujos de detección de fauna en cámaras trampa y NVR domésticos. La relevancia práctica está en la latencia: al eliminar la normalización y la transposición en CPU y permitir que TensorRT fusione el preprocesado en el motor GPU, se alcanzan 3,4 ms p50 en GPU NVIDIA Blackwell (FP16), frente a cientos de milisegundos en iGPU o más de un segundo en CPU.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,2 GB y licencia Apache-2.0. No se trata de un modelo de lenguaje, sino de un clasificador de visión por computador especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-M (clasificador de imágenes, CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible; el modelo se distribuye como ONNX con entrada `uint8` y ejecución FP16 en TensorRT |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, 214 MB) + `labelmap.txt` (2.498 etiquetas) |
| Entrada | `images`, shape `[1, 480, 480, 3]`, dtype `uint8`, RGB `[0..255]` |
| Salida | `logits`, shape `[1, 2498]`, dtype `float32` (logits sin normalizar) |
| Resolución de entrada | 480x480 |
| Número de clases | 2.498 |

## Arquitectura y entrenamiento

El modelo subyacente es SpeciesNet-Crop (`always_crop`), una EfficientNetV2-M de 480x480 con 2.498 clases, extraída del bundle SPARROW (`SpeciesNet-Crop/model.onnx`). El autor del repositorio no ha reentrenado el modelo: ha modificado el grafo ONNX para anteponer `Cast(uint8 -> float32) -> Div(255.0) -> Transpose(NHWC -> NCHW)`, de modo que el preprocesado se ejecuta dentro del grafo y puede ser fusionado por TensorRT en el motor GPU. El orden `cast-first` es deliberado, ya que TensorRT rechaza tensores `uint8` intermedios generados por `Transpose(uint8)`.

No se dispone de información sobre el dataset de entrenamiento, número de tokens (no aplica), composición del corpus, ni si hubo RLHF/DPO (no aplica a un clasificador). La innovación técnica destacable es exclusivamente de despliegue: la eliminación del coste de normalización y transposición en CPU y la habilitación de fusión de preprocesado en TensorRT con `TensorrtExecutionProvider` (FP16) o `CUDAExecutionProvider`.

## Capacidades

- Clasificación de imágenes de fauna en 2.498 clases taxonómicas a partir de recortes de 480x480 píxeles.
- Salida de logits sin normalizar (2.498 valores `float32`) que el consumidor debe transformar a probabilidades (softmax) y mapear con `labelmap.txt`.
- Integración nativa con el pipeline de recorte de Frigate NVR mediante `crop_strategy: tight` y `crop_scale: 1.0`.
- Ejecución acelerada en GPU NVIDIA vía TensorRT FP16 y en iGPU Intel vía OpenVINO GPU.
- Soporte de geofencing opcional (`FRIGATE_SPECIESNET_COUNTRY` / `FRIGATE_SPECIESNET_STATE`) y filtrado de etiquetas (`reject_labels: [blank]`) mediante el patch `04` del repositorio auxiliar.
- No soporta tool calling, agentes, razonamiento multi-step, texto, audio ni modo thinking: es un clasificador de visión puro.

## Casos de uso

- Clasificación de fauna en cámaras trampa: el modelo recibe recortes de 480x480 y devuelve logits sobre 2.498 clases, permitiendo etiquetar automáticamente especies en grandes volúmenes de imágenes de campo.
- Integración en Frigate NVR para etiquetado de subclase: configurado como clasificador custom `wildlife`, etiqueta los objetos `animal` detectados por el detector principal con la especie correspondiente, usando `classification_type: sub_label`.
- Filtrado de falsos positivos en vigilancia doméstica: con `reject_labels: [blank]` y umbral `0.6`, se descartan recortes que no corresponden a fauna real, reduciendo notificaciones irrelevantes.
- Despliegue en hardware de bajo consumo: con 202,9 ms p50 en iGPU Intel N95 (16 EU, OpenVINO GPU), es viable en mini-PC y dispositivos de borde sin GPU dedicada.
- Procesado por lotes en servidor con GPU: a 3,4 ms p50 en Blackwell con TensorRT FP16, permite clasificar miles de recortes por minuto en pipelines de investigación ecológica.
- Geofencing taxonómico: restringiendo las especies plausibles por país o estado (`FRIGATE_SPECIESNET_COUNTRY` / `FRIGATE_SPECIESNET_STATE`), se mejora la precisión efectiva al descartar clases geográficamente improbables.
- Monitorización de biodiversidad en proyectos de ciencia ciudadana: clasificación masiva de imágenes de trampas cámara para inventarios de especies y estudios de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (top-1, top-5, mAP) en la información disponible. Sí se publican latencias de referencia:

| Plataforma | Backend | Latencia p50 |
|---|---|---|
| NVIDIA GPU (Blackwell, warm sequential) | TensorRT FP16 | 3,4 ms |
| Intel N95 iGPU (16 EU) | OpenVINO GPU | 202,9 ms (mín. 202,2 ms; compilación 8,6 s) |
| Intel N95 (4 núcleos, solo CPU) | OpenVINO CPU | 1202,2 ms |
| Intel N95 (4 núcleos, solo CPU) | ORT CPU (4 hilos) | 1512,0 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el `model.onnx` pesa 214 MB, por lo que en FP16 la huella de pesos ronda los cientos de MB, pero no se publica el consumo total de VRAM.
- GPU recomendadas: NVIDIA con soporte TensorRT (se cita Blackwell como referencia a 3,4 ms p50); cualquier GPU NVIDIA compatible con `TensorrtExecutionProvider` FP16 o `CUDAExecutionProvider`.
- iGPU: Intel N95 (16 EU) con OpenVINO GPU funciona a ~203 ms p50, apto para despliegue en borde.
- CPU: funciona en 4 núcleos (N95) a ~1,2-1,5 s p50, viable solo para flujos de baja frecuencia.
- Cabe en GPU consumer: sí, dado el tamaño reducido del modelo (214 MB en ONNX), aunque no se especifican modelos concretos de GPU consumer.
- Opciones de despliegue: TensorRT (`TensorrtExecutionProvider` FP16), CUDA (`CUDAExecutionProvider`), OpenVINO (GPU y CPU), ONNX Runtime CPU; integración con Frigate NVR mediante la rama `feat/custom-cls-multi-backend` y el repositorio `frigate-wildlife-onnx`.
- Throughput: no publicado; a partir de la latencia p50 de 3,4 ms en Blackwell se puede estimar un orden de cientos de inferencias por segundo en secuencial cálido, pero es una estimación derivada, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpeciesNet v4.0.3a NHWC uint8 ONNX (este) | EfficientNetV2-M | 2.498 | 480x480, uint8 NHWC | Apache-2.0 | Hugging Face (0 descargas) |
| SpeciesNet-Crop original (SPARROW bundle) | EfficientNetV2-M | 2.498 | 480x480, float32 NCHW | Apache-2.0 (upstream Google) | Zenodo |
| sasakiuri/speciesnet-v4.0.3b-onnx | EfficientNetV2-M (v4.0.3b) | no disponible | no disponible | no disponible | Hugging Face |
| Addax-Data-Science/SPECIESNET-v4-0-2-A | EfficientNetV2-M (v4.0.2A) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (precisión) entre estas variantes en la información proporcionada. La diferencia principal entre este modelo y el original es el contrato de I/O (NHWC `uint8` con preprocesado embebido frente a NCHW `float32` normalizado), no la arquitectura ni los pesos.

## Limitaciones y advertencias

- No es un modelo nuevo ni reentrenado: los pesos provienen de SpeciesNet-Crop v4.0.3a; cualquier sesgo del modelo original se hereda.
- No se publican métricas de precisión (top-1, top-5, mAP) ni información sobre el dataset de entrenamiento, por lo que no se puede evaluar su calidad de clasificación a partir de la información disponible.
- El modelo devuelve logits sin normalizar; el consumidor debe aplicar softmax y mapear con `labelmap.txt` (checksum publicado) para obtener etiquetas.
- La configuración de Frigate con clasificadores ONNX custom (`width`, `height`, `input_tensor`, `input_dtype`, `crop_strategy`, `crop_scale`) no está en Frigate estándar: requiere la rama `feat/custom-cls-multi-backend` o la imagen `docker/Dockerfile.frigate-wildlife` con los 5 patches (`00` a `04`).
- El orden `cast-first` es obligatorio por una limitación de TensorRT (rechaza `Transpose(uint8)` intermedio); alterar el grafo puede romper la compilación del motor.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de clasificación errónea en recortes de baja calidad, oclusiones o especies visualmente similares; el umbral `0.6` es una mitigación configurable, no una garantía.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (Google Camera Trap AI, Apache-2.0) y de los datos de entrenamiento originales.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción más allá de las latencias reportadas por el autor.
- Sin soporte multilingüe, de texto, audio ni agentes; cualquier caso de uso fuera de clasificación de imágenes de fauna no aplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mgranberry/speciesnet-v4.0.3a-nhwc-uint8-onnx
- Repositorio auxiliar (Dockerfiles, scripts, patches): https://github.com/mgranberry/frigate-wildlife-onnx
- Rama de Frigate con clasificador multi-backend: https://github.com/mgranberry/frigate/tree/feat/custom-cls-multi-backend
- SpeciesNet upstream (Google Camera Trap AI): https://github.com/google/cameratrapai
- Bundle SPARROW en Zenodo: https://zenodo.org/records/20563673
- Frigate NVR: https://frigate.video/
- Taxonomía / label mapping (Addax): https://huggingface.co/Addax-Data-Science/SPECIESNET-v4-0-2-A
- Variante v4.0.3b ONNX (sasakiuri): https://huggingface.co/sasakiuri/speciesnet-v4.0.3b-onnx
