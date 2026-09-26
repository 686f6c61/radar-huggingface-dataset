# killjoyelite/anime-eye-yolov8

## Resumen

Anime Eye Detector es un modelo de detección de objetos basado en YOLOv8 y ajustado (fine-tuning) para localizar ojos en ilustración de personajes de estilo anime. Lo desarrolla el usuario killjoyelite y se publica en Hugging Face bajo licencia MIT. Su propósito concreto es servir como detector de región ocular dentro de flujos de trabajo de ComfyUI con el nodo Impact Pack, de forma análoga a como se emplean `face_yolov8n.pt` o `hand_yolov8n.pt` para el retoque facial y de manos.

Se distribuye en dos variantes: `eye_yolov8n.pt` (nano) y `eye_yolov8s.pt` (small), ambas derivadas de los pesos base `yolov8n.pt` y `yolov8s.pt` de Ultralytics. La tarea es de detección de una única clase (`eye`), con cajas delimitadoras por cada ojo visible. El entrenamiento se realizó sobre un conjunto reducido de 212 imágenes de estilo anime generadas por el propio autor, etiquetadas manualmente, con 100 épocas, tamaño de imagen 640 y batch de 8.

Es relevante ahora para quienes construyen pipelines de generación e inpainting de personajes anime en ComfyUI, ya que automatiza la localización de los ojos para aplicar retoque selectivo de detalle o color sin intervención manual. El repo es de tamaño mínimo (0,0 GB) y acumula 171 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (red de detección de objetos de una etapa, familia Ultralytics); dos variantes: nano y small |
| Parametros totales | no disponible en la ficha del autor; el modelo base YOLOv8n tiene aproximadamente 3,2 M de parametros y YOLOv8s aproximadamente 11,2 M (el fine-tuning conserva la arquitectura base) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión; entrada de imagen a 640 px durante el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de visión, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (Ultralytics), distribuidos como `eye_yolov8n.pt` y `eye_yolov8s.pt` |

## Arquitectura y entrenamiento

Se trata de una red YOLOv8 de detección de objetos de una sola etapa, reutilizada tal cual desde los checkpoints base de Ultralytics (`yolov8n.pt` y `yolov8s.pt`) y sometida a fine-tuning para una única clase, `eye`. YOLOv8 emplea un backbone y una cabeza de detección con asignación de etiquetas tipo anchor-free; el ajuste no modifica la topología, solo los pesos y la cabeza de clases (una sola clase frente a las 80 de COCO). No se menciona ningún mecanismo adicional de decodificación especulativa ni atención lineal: es una CNN de detección estándar orientada a inferencia rápida.

El entrenamiento se hizo con 212 imágenes de estilo anime generadas por IA por el propio autor (predominantemente personajes femeninos), con cajas etiquetadas manualmente alrededor de cada ojo visible. La configuración indicada es de 100 épocas, tamaño de imagen 640 y batch size 8. No se documenta el uso de RLHF, DPO ni datos externos; el dataset es enteramente autogenerado y de autoría propia. La innovación relevante no está en la arquitectura, sino en la especialización del detector a un dominio muy concreto (región ocular en anime) para integrarse en flujos de inpainting.

## Capacidades

- Detección de objetos de una única clase (`eye`): devuelve cajas delimitadoras por cada ojo visible en una ilustración de personaje anime.
- Funciona sobre imagen estática, no sobre vídeo ni secuencias temporales.
- Integración nativa con ComfyUI mediante `UltralyticsDetectorProvider` y el ecosistema Impact Pack (`BboxDetectorSEGS`, `Detailer (SEGS)`).
- Habilita inpainting selectivo de la región ocular (cambio de color de ojos, corrección de detalle) manteniendo intacto el resto de la imagen.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento (thinking), visión multimodal general, audio ni generación de texto: es un detector puro.
- Capacidades multilingües: no aplicable, no procesa lenguaje.

## Casos de uso

- Retoque ocular en ComfyUI: cargar la imagen, pasar por `UltralyticsDetectorProvider` con el detector de ojos, generar el SEGS con `BboxDetectorSEGS` y aplicar `Detailer (SEGS)` con `guide_size` 512 y `denoise` entre 0,5 y 0,7 para redibujar el ojo desde un prompt sin tocar el resto del lienzo.
- Cambio de color de ojos: usar la región detectada con `Detailer (SEGS)` para reinterpretar el color y el detalle ocular según prompt, conservando intacta la composición original.
- Corrección de artefactos en ojos generados: en pipelines de generación de personajes anime, aplicar un segundo paso de difusión únicamente sobre los ojos para arreglar deformaciones típicas (pupilas asimétricas, brillos inconsistentes).
- Automatización de flujos de producción de personajes: encadenar generación de imagen, detección de ojos y retoque como pasos automáticos, reduciendo la intervención manual en postproceso.
- Anotación asistida de datasets: usar el detector para pregenerar cajas de ojos y revisarlas manualmente, acelerando la creación de conjuntos etiquetados de arte anime.
- Curación de datasets con recorte de región ocular: extraer las cajas para construir datasets centrados en ojos (por ejemplo, para entrenar modelos de detalle facial específicos).
- Preprocesado para efectos u overlays: localizar ambos ojos para alinear efectos, cambios de mirada o animaciones simples en piezas estáticas.
- Expansión comunitaria del dataset: dado que el autor invita a reportar fallos, sirve como base para ampliar la cobertura a más estilos y a personajes masculinos.

## Benchmarks y rendimiento

Resultados en el split de validación, según la model card del autor:

| Metrica | Nano (eye_yolov8n) | Small (eye_yolov8s) |
|---|---|---|
| mAP50 | 0,995 | 0,994 |
| mAP50-95 | 0,681 | 0,705 |
| Precision | 0,998 | 0,971 |
| Recall | 1,000 | 1,000 |

No se han publicado otros resultados de benchmarks en la información disponible. Las métricas corresponden a un conjunto de validación de 212 imágenes de un único estilo de generación, por lo que no deben interpretarse como robustez en dominios artísticos distintos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los pesos nano pesan unos pocos MB y la inferencia a 640 px cabe holgadamente en cualquier GPU. No hay cifra publicada; para un modelo de detección de este tamaño suele bastar con menos de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve. En el extremo alto, A100, H100, RTX 4090 o RTX 3090 ofrecen latencias mínimas; en gamas medias, RTX 3060, RTX 2060 o GTX 1660 son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con soporte CUDA, e incluso en modelos de gama baja.
- Alternativa en CPU: al ser un modelo nano/small, es viable la inferencia en CPU para procesamiento por lotes a baja frecuencia.
- Opciones de despliegue: Ultralytics (PyTorch), ComfyUI con Impact Pack (uso previsto por el autor), y, aunque no se documenta en la ficha, la familia YOLOv8 admite exportación a ONNX, TensorRT, OpenVINO, CoreML y TFLite.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anime Eye Detector (yolov8n) | base YOLOv8n (~3,2 M) | imagen 640 px | mAP50 0,995; mAP50-95 0,681 | MIT | Hugging Face, ComfyUI-Manager |
| Anime Eye Detector (yolov8s) | base YOLOv8s (~11,2 M) | imagen 640 px | mAP50 0,994; mAP50-95 0,705 | MIT | Hugging Face, ComfyUI-Manager |
| `face_yolov8n.pt` (detector facial, referencia citada por el autor) | base YOLOv8n | imagen 640 px | no disponible | no disponible | ecosistema ComfyUI/Impact Pack |
| `hand_yolov8n.pt` (detector de manos, referencia citada por el autor) | base YOLOv8n | imagen 640 px | no disponible | no disponible | ecosistema ComfyUI/Impact Pack |

No se dispone de métricas comparables de otros detectores especializados de ojos en anime en la información proporcionada.

## Limitaciones y advertencias

- Entrenado predominantemente con personajes femeninos de anime: la detección en ojos de personajes masculinos es menos fiable y puede omitir detecciones.
- Dificultades con ojos muy grandes, caricaturescos o de estilo chibi que se alejan de las proporciones anime estándar, y en algunos primeros planos de rostro (indicado como trabajo en progreso).
- Entrenado con la salida de un único estilo de generación/checkpoint, por lo que generaliza peor a estilos muy distintos (pictóricos, muy estilizados o no anime) que a estilos anime convencionales o semirrealistas.
- Dataset muy pequeño (212 imágenes): las métricas de validación son altas, pero la robustez en producción sobre la diversidad real del arte anime es inherentemente limitada.
- Riesgo de falsos positivos o negativos en imágenes fuera de dominio; conviene validar sobre muestras propias antes de automatizar un pipeline.
- Uso comercial permitido por la licencia MIT del modelo, pero el propio autor advierte de que los usuarios deben verificar de forma independiente las condiciones de licencia del checkpoint base empleado para generar sus propias imágenes de entrenamiento o inferencia.
- No adecuado para tareas fuera de la detección de ojos en arte anime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/killjoyelite/anime-eye-yolov8
- Ultralytics (framework y pesos base YOLOv8): https://github.com/ultralytics/ultralytics
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI Impact Pack: https://github.com/ltdrdata/ComfyUI-Impact-Pack
