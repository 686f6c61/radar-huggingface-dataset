# jainarchita/ppe-yolov8s-bf16-modalix

## Resumen

YOLOv8s PPE es un detector de objetos derivado de la arquitectura YOLOv8 en su variante "s" (small), especializado en la detección de equipos de protección individual (EPI) y maquinaria en entornos de obra. El paquete ha sido compilado en formato BF16 para su ejecución sobre hardware SiMa.ai Modalix, y se distribuye como un archivo comprimido (`.tar.gz`) que debe cargarse a través de un runtime Neat compatible. Lo publica el usuario `jainarchita` en HuggingFace, aunque el checkpoint original procede del trabajo de HinePo, entrenado sobre el dataset público Construction Site Safety de Roboflow.

El modelo no es un transformer generativo ni un modelo de lenguaje: es un detector de objetos convolucional con seis cabezas de detección crudas que requiere un decodificador YOLOv8 específico (`neat-yolo26-ppe.json`) y un mapeo de clases para interpretar sus salidas. Su relevancia es acotada: sirve como artefacto de despliegue para demos de seguridad laboral en el acelerador Modalix, no como modelo de propósito general.

La información disponible es escasa: el repositorio ocupa 0,0 GB (probablemente por el empaquetado binario), no declara licencia, no declara idiomas y no incluye resultados de benchmarks ni evaluación de precisión en dispositivo. La model card advierte explícitamente de que no se realizó ninguna ejecución ni evaluación de accuracy durante el empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (CNN, detector de objetos de una etapa) |
| Parametros totales | no disponible (YOLOv8s ronda los 11,2 M en su configuración estándar, pero no se confirma en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 640 × 640) |
| Tipos de cuantizacion | BF16 (compilado); entrada en float32 NHWC con conversión interna a BF16 |
| Idiomas soportados | no disponible (no aplica; detector visual sin capacidades lingüísticas) |
| Licencia | no disponible (la model card indica que la licencia del dataset no establece la del checkpoint y no concede derechos adicionales) |
| Formato de pesos | paquete compilado SiMa.ai `.tar.gz` con checksums SHA256SUMS; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv8 en variante small, un detector de objetos de una etapa basado en una red troncal convolucional con cuello de agregación de características y cabezas de detección sin anclas. El paquete compilado expone seis cabezas de detección crudas que deben decodificarse con el decodificador YOLOv8 correspondiente y el mapeo de clases definido en `neat-yolo26-ppe.json`. La ejecución se realiza mediante MLA compilado sobre Modalix, con batch size 1 e imagen de entrada de 640 × 640 píxeles en formato NHWC float32 normalizado en [0, 1], convertido internamente a BF16.

El checkpoint fuente es `runs/detect/yolov8s_ppe_css_80_epochs/weights/best.pt` de HinePo, entrenado durante 80 épocas sobre el dataset Construction Site Safety de Roboflow (disponible en Kaggle). El archivo `provenance.json` del repositorio registra el hash del checkpoint y las versiones de los notebooks de origen. No se dispone de información sobre composición exacta del dataset, aumentos de datos, hiperparámetros de entrenamiento ni si hubo fases de refinamiento posteriores. La adaptación consistió en reacondicionar el modelo para el decodificado de Neat y compilarlo para ejecución BF16 en Modalix; los metadatos del paquete registran la versión 3.0.0 del SDK del modelo, lo que no garantiza compatibilidad con todas las versiones de runtime Neat o plataforma.

## Capacidades

- Detección de objetos en imágenes de 640 × 640 píxeles, con batch size 1.
- Detección de equipos de protección individual (EPI) y maquinaria en escenarios de obra, según el propósito declarado del paquete.
- Salida mediante seis cabezas de detección crudas que requieren decodificación externa con el decodificador YOLOv8 y el mapeo de clases del archivo `neat-yolo26-ppe.json`.
- Ejecución compilada en BF16 sobre aceleradores SiMa.ai Modalix mediante runtime Neat.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, visión-lenguaje, audio ni modo de razonamiento explícito.
- No se documentan capacidades de segmentación, pose estimation ni tracking; el pipeline declarado es exclusivamente object-detection.

## Casos de uso

- Monitorización de seguridad en obra en tiempo real: el modelo puede procesar fotogramas de cámaras fijas o drones a 640 × 640 y detectar la presencia o ausencia de EPI, integrándose en un sistema de alertas cuando se identifiquen trabajadores sin casco o chaleco.
- Control de acceso a zonas de riesgo (red zone): combinado con el notebook de inferencia de referencia, permite marcar áreas restringidas y generar avisos cuando se detecta maquinaria o personal en zonas no autorizadas.
- Auditoría de cumplimiento de normativa de seguridad laboral: procesamiento por lotes de imágenes históricas de obra para generar informes de cumplimiento y detectar patrones de incumplimiento por turno o ubicación.
- Despliegue en dispositivos de borde con acelerador Modalix: al estar compilado en BF16 para SiMa.ai, es adecuado para cámaras inteligentes o gateways industriales con restricciones de consumo energético y conectividad.
- Integración en plataformas de videovigilancia existentes: el paquete puede cargarse en un runtime Neat y conectarse a pipelines de ingestión de vídeo (RTSP) para análisis continuo sin depender de la nube.
- Validación de presencia de maquinaria pesada en entornos de construcción: la detección de maquinaria permite generar mapas de ocupación, estimar tiempos de uso o activar protocolos de seguridad cuando se detecta maquinaria en movimiento cerca de personal.
- Prototipado rápido de demos de seguridad laboral: al ser un paquete ya compilado, reduce el tiempo de puesta en marcha de una demo funcional sobre hardware Modalix, siempre que se respete el contrato de entrada (NHWC float32, [0, 1], 640 × 640).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se realizó ninguna evaluación de accuracy ni ejecución en dispositivo durante la preparación del paquete, por lo que no hay métricas de mAP, precisión, recall ni latencia verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo está compilado para ejecución en el acelerador SiMa.ai Modalix, no para GPU convencional, por lo que las estimaciones de VRAM en GPU no aplican directamente.
- GPU recomendadas: no aplica en su forma compilada; para ejecutar el checkpoint original en GPU sería necesario disponer del `.pt` fuente (no distribuido en este repositorio) y un entorno con PyTorch y Ultralytics.
- Compatibilidad con GPU de consumo: no disponible para el paquete compilado; el artefacto está ligado al runtime Neat y a la plataforma Modalix.
- Opciones de despliegue: runtime Neat sobre SiMa.ai Modalix, cargando el archivo `ppe-yolov8s-bf16-modalix.tar.gz` intacto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones en dispositivo.
- Verificación de integridad: el repositorio incluye `SHA256SUMS`, verificable con `sha256sum -c SHA256SUMS`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jainarchita/ppe-yolov8s-bf16-modalix | YOLOv8s compilado BF16 para Modalix | no disponible | Imagen 640 × 640, batch 1 | no disponible | HuggingFace (paquete binario) |
| YOLOv8s estándar (Ultralytics) | YOLOv8s | ~11,2 M (dato de referencia externo) | Imagen 640 × 640 | AGPL-3.0 (Ultralytics) | Repositorio oficial Ultralytics |
| Checkpoint fuente HinePo (`best.pt`) | YOLOv8s fine-tuned PPE | no disponible | Imagen 640 × 640 | no disponible | No distribuido en este repo; referenciado en provenance.json |

No se dispone de datos de rendimiento comparativo (mAP, latencia) para ninguno de los modelos en la información proporcionada, por lo que la comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- No se realizó evaluación de accuracy ni ejecución en dispositivo durante el empaquetado; la calidad de detección depende de la escena y de las condiciones de cámara y no está verificada.
- El modelo no constituye una garantía de seguridad laboral; la model card lo indica explícitamente.
- Licencia no declarada: la licencia del dataset de origen no establece la del checkpoint, y la model card no concede derechos adicionales. Es necesario revisar los términos del modelo fuente, del compilador y del runtime antes de cualquier uso comercial.
- Compatibilidad limitada: los metadatos registran la versión 3.0.0 del SDK del modelo, lo que no garantiza funcionamiento con todas las versiones de Neat o de la plataforma Modalix.
- El paquete debe mantenerse intacto y cargarse a través de un runtime Neat compatible; no es un artefacto portable a otros entornos sin recompilación.
- Requiere decodificador YOLOv8 y mapeo de clases externos (`neat-yolo26-ppe.json`); un decodificador incorrecto produce salidas inválidas.
- Contrato de entrada estricto: NHWC float32 en [0, 1], 640 × 640, batch 1; desviaciones pueden degradar o invalidar las detecciones.
- Riesgo de sesgo y alucinación: no documentado, pero al ser un detector entrenado sobre un dataset específico de obra, su generalización a otras industrias, condiciones de iluminación o geografías no está evaluada.
- Sin soporte de idiomas, texto ni razonamiento; no debe emplearse para tareas fuera de la detección visual de objetos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en producción ni validación comunitaria.

## Enlaces

- [HuggingFace: jainarchita/ppe-yolov8s-bf16-modalix](https://huggingface.co/jainarchita/ppe-yolov8s-bf16-modalix)
- [Notebook de entrenamiento (Kaggle, HinePo)](https://www.kaggle.com/code/hinepo/yolov8-finetuning-for-ppe-detection)
- [Notebook de inferencia (Kaggle, HinePo)](https://www.kaggle.com/code/hinepo/yolov8-inference-for-red-zone-application)
- [Dataset Construction Site Safety (Kaggle, Roboflow)](https://www.kaggle.com/datasets/snehilsanyal/construction-site-safety-image-dataset-roboflow)
