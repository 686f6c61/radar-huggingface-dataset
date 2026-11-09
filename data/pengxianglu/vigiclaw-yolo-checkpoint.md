# pengxianglu/vigiclaw-yolo-checkpoint

## Resumen

VigiClaw YOLO es un conjunto de dos checkpoints de detección y segmentación de objetos derivados de Ultralytics YOLO26, publicados por el usuario pengxianglu. El repositorio contiene un modelo de detección de objetos entrenado sobre imágenes reales (`real`, basado en `yolo26s.pt`) y un modelo de segmentación de instancias entrenado sobre imágenes de simulación (`sim`, basado en `yolo26s-seg.pt`). Ambos se distribuyen en formato PyTorch nativo (`.pt`) y se cargan mediante la librería Ultralytics 8.4.38.

El modelo resuelve un problema acotado: la detección y segmentación de un conjunto reducido de objetos de manipulación robótica (cubos de colores, cuencos, tazas, frutas y algún objeto de oficina). El checkpoint `real` distingue 4 clases con entrada de 640 píxeles; el `sim` distingue 14 clases con entrada de 512 píxeles y devuelve máscaras por instancia. El repositorio ocupa 0,1 GB y no incluye servicio de inferencia alojado.

Es relevante para quien necesite un punto de partida de visión para robótica o pipelines de percepción en entornos controlados, con la advertencia de que se trata de un fine-tuning de dominio muy específico, con dataset pequeño, sin benchmarks externos y con licencia AGPL-3.0 heredada de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO26 (CNN de detección/segmentación en una etapa); variantes `yolo26s` y `yolo26s-seg` |
| Parametros totales | no disponible (no se publica el recuento; el tamaño del repo es 0,1 GB para ambos checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 640 px en `real` y 512 px en `sim`) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos PyTorch `.pt`; no se publican versiones GGUF, ONNX ni TensorRT) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0, según la declaración embebida en los checkpoints (`https://ultralytics.com/license`); el repositorio no añade un LICENSE propio |
| Formato de pesos | PyTorch `.pt` (`real/weights/best.pt`, `real/weights/last.pt`, `sim/weights/best.pt`, `sim/weights/last.pt`) |

## Arquitectura y entrenamiento

Ambos checkpoints son fine-tunings de la familia YOLO26 de Ultralytics, en su variante "small": `yolo26s.pt` para detección y `yolo26s-seg.pt` para segmentación de instancias. Se trata de detectores de una etapa con cabeza de cajas (y de máscaras en el caso `sim`), cargados con pesos preentrenados (`pretrained: true`) y entrenados con el optimizador en modo `auto` de Ultralytics.

Los registros de entrenamiento indican 300 épocas planificadas y 300 registradas en el CSV para ambos modelos, batch 16, semilla 0, con `imgsz` 640 (`real`) y 512 (`sim`). El conjunto de datos asociado es `pengxianglu/vigiclaw-yolo-dataset`, dividido en subconjuntos `real` y `sim`, con ratios de dataset de 0,85 y 0,8 respectivamente según la configuración de la interfaz gráfica. El autor advierte que no se conservan las listas exactas de partición train/val ni el snapshot de datos, por lo que la reproducibilidad completa no está garantizada. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión supervisado.

## Capacidades

- Detección de objetos en imágenes reales con 4 clases: `red cube`, `green cube`, `blue cube`, `yellow cube` (IDs 0-3).
- Segmentación de instancias en imágenes de simulación con 14 clases: cubos de colores, cuencos, tazas, plátano, manzana, plato, pelota de béisbol y rotulador (IDs 0-13).
- Salida de cajas delimitadoras con puntuaciones de confianza y, en el modelo `sim`, polígonos de máscara por instancia (`results[0].masks.xy`).
- Inferencia sobre CPU o GPU CUDA mediante la API de Ultralytics (`model.predict(..., device="cpu" | 0)`).
- Ejecución local con el script `predict.py` incluido, con selección de variante (`--variant real|sim`) y ruta de pesos explícita.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión por computador.

## Casos de uso

- Percepción para manipulación robótica en mesa: el checkpoint `real` detecta cubos de cuatro colores con entrada de 640 px, adecuado para tareas de pick-and-place en entornos con iluminación y cámara controladas.
- Segmentación de objetos en entornos simulados: el checkpoint `sim` devuelve máscaras por instancia de 14 clases, útil para generar datos de entrenamiento o para cerrar el bucle percepción-acción en un simulador antes de transferir a realidad.
- Preetiquetado semi-automático de nuevos datasets: usar las detecciones del modelo `real` como propuesta inicial y corregir manualmente, reduciendo el coste de anotación en dominios con cubos de colores.
- Prototipado rápido de pipelines de visión: al cargarse con Ultralytics en pocas líneas y ejecutarse en CPU, sirve para validar la integración de un detector en una aplicación antes de invertir en un modelo mayor.
- Docencia y experimentación con YOLO26: los `args.yaml`, `results.csv` y curvas incluidas permiten estudiar el efecto de hiperparámetros en un fine-tuning real frente a uno sintético.
- Control de calidad en escenarios sintéticos: comparar las predicciones del modelo `sim` sobre renders con las etiquetas ground truth del simulador para detectar desviaciones del dominio simulado.
- Base para fine-tuning adicional: los `last.pt` (con epoch -1 y estado de optimizador vaciado) pueden usarse como inicialización de un nuevo entrenamiento sobre un dataset propio con clases distintas.

## Benchmarks y rendimiento

Las métricas publicadas provienen de los `train_metrics` embebidos en cada `best.pt`, no de una validación externa independiente. Se expresan en escala 0-1.

| Peso / métrica | Precision | Recall | mAP50 | mAP50-95 |
|---|---:|---:|---:|---:|
| real / Box | 0,99610 | 1,00000 | 0,99500 | 0,92955 |
| sim / Box | 0,98226 | 0,98399 | 0,99115 | 0,96426 |
| sim / Mask | 0,98226 | 0,98399 | 0,99115 | 0,82684 |

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas internas de entrenamiento. No hay comparación con otros detectores, ni resultados sobre un conjunto de test externo, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Por el tamaño del checkpoint (repo de 0,1 GB para ambos modelos) y la variante "small" de YOLO26, la inferencia es viable en GPUs de consumo, aunque el autor no publica cifras de memoria.
- GPU recomendadas: no especificadas por el autor. El ejemplo oficial usa `device="cpu"` por defecto y permite `device=0` para la primera GPU CUDA.
- Compatibilidad con GPU de consumo: previsiblemente sí para la variante "small", pero no hay confirmación ni tabla de VRAM publicada.
- Opciones de despliegue: Ultralytics (versión fijada en `requirements.txt`, 8.4.38), con soporte de CPU y CUDA. No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles. El autor indica explícitamente que no hay benchmarks de velocidad.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Como referencia estructural, el modelo se apoya en Ultralytics YOLO26 (`yolo26s` y `yolo26s-seg`), cuyos pesos oficiales están en `Ultralytics/YOLO26`, pero no se aportan métricas de esos modelos base ni de alternativas como YOLOv8, YOLO11 u otros detectores para establecer una comparación cuantitativa. La comparación con modelos de la misma categoría queda, por tanto, no disponible.

## Limitaciones y advertencias

- Conjunto de clases muy reducido (4 en `real`, 14 en `sim`): no es un detector de propósito general y fallará ante objetos fuera de esas categorías.
- Los IDs de clase no son coherentes entre variantes: `yellow cube` es el ID 3 en `real` y el 13 en `sim`; no se pueden fusionar resultados por índice sin remapear.
- El modelo `sim` está entrenado sobre imágenes de simulación y su rendimiento sobre imágenes reales no se ha validado de forma independiente.
- Las métricas provienen de los `train_metrics` del propio `best.pt`, no de un test externo; el autor advierte que no representan la capacidad de generalización en despliegue real.
- Dataset pequeño y con posibles solapamientos de escena; la independencia train/val no está verificada y faltan las listas de partición, lo que impide una reproducción exacta.
- Sensibilidad a cambios de fondo, iluminación, cámara, oclusión y apariencia de los objetos, según el propio autor.
- Riesgo de falsos positivos y de alucinación de detecciones en escenas fuera de dominio; no hay umbral de confianza fijado para producción (`conf=0.25` es solo un ejemplo).
- Licencia AGPL-3.0 heredada de Ultralytics: el uso comercial y la distribución de servicios en red están sujetos a las condiciones de Ultralytics. El repositorio no añade un LICENSE propio ni una licencia alternativa.
- Los `last.pt` tienen `epoch = -1` y el estado de optimizador vaciado, por lo que no sirven para reanudar el entrenamiento de forma exacta, solo como inicialización.
- No hay versiones cuantizadas ni exportadas a otros formatos, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Repositorio del modelo: https://huggingface.co/pengxianglu/vigiclaw-yolo-checkpoint
- Dataset asociado: https://huggingface.co/datasets/pengxianglu/vigiclaw-yolo-dataset
- Modelo base oficial: https://huggingface.co/Ultralytics/YOLO26
- Licencia de Ultralytics: https://ultralytics.com/license
- Documentación de model cards de Hugging Face: https://huggingface.co/docs/hub/model-cards
- Instalación de PyTorch: https://pytorch.org/get-started/locally/
