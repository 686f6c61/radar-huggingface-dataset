# kenantabak/yolo26s-maritime-naval-vessels-tr

## Resumen

YOLO26s-maritime-naval-vessels-tr es un modelo de detección de objetos basado en la arquitectura YOLO26s, desarrollado por el usuario kenantabak y publicado en Hugging Face bajo licencia MIT. El modelo está especializado en la detección multiclase de embarcaciones marítimas y navales, y se distribuye tanto en formato nativo de Ultralytics (`best.pt`, 18,47 MB) como en ONNX (`best.onnx`, 36,3 MB). Su relevancia radica en que aplica una arquitectura de detección de objetos de última generación a un dominio vertical concreto, el marítimo-naval, con métricas de validación declaradas por el autor.

Según la model card, el entrenamiento se realizó en la plataforma EVREN sobre una GPU NVIDIA H200, y el modelo superó una "puerta de calidad" etiquetada como `PRODUCTION` antes de su publicación como código abierto. La entrada del modelo es de 640×640 píxeles, un estándar en la familia YOLO que facilita su integración en pipelines de visión por computador existentes.

La información disponible no especifica el número de parámetros, la composición del dataset de entrenamiento ni los idiomas soportados (el modelo no procesa lenguaje, por lo que esta fila no aplica en sentido estricto). El repositorio tiene un tamaño de 0,1 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, lo que indica que se trata de una publicación reciente y de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `best.pt` y `best.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (detección de objetos, sin procesamiento de lenguaje) |
| Licencia | MIT (el runtime de Ultralytics YOLO se rige por su propia licencia de código abierto) |
| Formato de pesos | `best.pt` (18,47 MB, PyTorch/Ultralytics) y `best.onnx` (36,3 MB) |
| Resolución de entrada | 640×640 |
| Tarea (pipeline) | object-detection |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26s de Ultralytics, una red de detección de objetos de una sola etapa (single-stage) orientada a inferencia en tiempo real. La model card no detalla la estructura interna de la red (backbone, neck, cabeza de detección) ni innovaciones específicas de atención o decodificación; únicamente confirma la arquitectura y la resolución de entrada de 640×640.

El entrenamiento se llevó a cabo en la plataforma EVREN sobre una GPU NVIDIA H200. No se especifica el número de imágenes del dataset, su composición por clase, el número de épocas, la función de pérdida ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional. Tampoco se documenta el uso de RLHF, DPO u otras fases de alineación, algo que no aplica a un modelo de detección. El autor indica que el modelo superó una puerta de calidad interna (`PRODUCTION`) antes de su publicación.

## Capacidades

- Detección de objetos multiclase en imágenes, especializada en embarcaciones marítimas y navales.
- Inferencia sobre imágenes de entrada de 640×640 píxeles.
- Distribución en dos formatos: pesos nativos de Ultralytics (`best.pt`) para entrenamiento, ajuste fino e inferencia con la librería `ultralytics`, y ONNX (`best.onnx`) para despliegue en runtimes compatibles (ONNX Runtime, TensorRT, etc.).
- Integración con el ecosistema Ultralytics (API de Python, CLI, exportación a otros formatos).
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente, al no ser un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión-lenguaje, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Vigilancia portuaria automatizada: el modelo puede procesar flujos de vídeo o imágenes de cámaras portuarias para detectar y clasificar embarcaciones, integrándose en sistemas de monitorización con la librería Ultralytics o mediante el grafo ONNX.
- Control de tráfico marítimo: detección de buques en imágenes satelitales o aéreas para alimentar sistemas de seguimiento (AIS complementario) y análisis de rutas.
- Seguridad y defensa naval: identificación de embarcaciones en escenarios de patrulla costera, con la salvedad de que la licencia MIT permite uso comercial pero el runtime de Ultralytics tiene su propia licencia que debe revisarse.
- Monitorización medioambiental: detección de embarcaciones en zonas protegidas o de pesca ilegal a partir de imágenes de drones o satélites.
- Automatización de inspecciones marítimas: análisis de imágenes capturadas por drones para inventariar embarcaciones en dársenas, astilleros o puertos.
- Despliegue en dispositivos de borde: el formato ONNX (36,3 MB) permite ejecutar la inferencia en GPUs de consumo o aceleradores embebidos compatibles con ONNX Runtime, aunque no se documentan latencias medidas.
- Ajuste fino para dominios adyacentes: al distribuirse `best.pt`, equipos con datasets propios de embarcaciones pueden reentrenar o afinar el modelo con la API de Ultralytics.

## Benchmarks y rendimiento

Métricas de validación declaradas por el autor en la model card:

| Metrica | Valor |
|---|---|
| mAP@50 | 93,29 % |
| mAP@50-95 | 82,47 % |
| F1 Score | 89,02 % |
| Resolución de entrada | 640×640 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Las cifras anteriores proceden exclusivamente de la model card y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con un peso de 18,47 MB en `best.pt` y 36,3 MB en ONNX, el modelo es ligero y previsiblemente apto para GPUs de consumo, pero no se documentan cifras de VRAM ni de memoria.
- GPU recomendadas: no disponible. El autor solo menciona una NVIDIA H200 para el entrenamiento, no para inferencia.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño de los pesos, es plausible en GPUs consumer, pero no hay datos que lo verifiquen.
- Opciones de despliegue: librería `ultralytics` (formato `best.pt`), ONNX Runtime u otros runtimes compatibles con ONNX (formato `best.onnx`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de detección.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. Como referencia de categoría, el modelo se sitúa en la familia YOLO de Ultralytics (detección de objetos de una etapa), pero no se han publicado comparaciones con otros detectores como YOLOv8, YOLOv11 u otros modelos especializados en detección marítima. No disponible.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del dataset de entrenamiento; al ser un modelo especializado en embarcaciones marítimas y navales, su rendimiento fuera de ese dominio no está garantizado.
- Riesgo de falsos positivos y falsos negativos inherente a los detectores de objetos; las métricas declaradas (mAP@50 de 93,29 %) no implican un rendimiento perfecto en todas las condiciones de iluminación, clima o resolución.
- No se especifica la composición del dataset, por lo que se desconoce la cobertura de clases, la variedad geográfica y las condiciones de captura representadas.
- No hay información sobre el número de parámetros ni sobre el coste computacional exacto, lo que dificulta planificar el despliegue.
- Licencia MIT para los pesos y la configuración del modelo, pero el runtime de Ultralytics YOLO se rige por su propia licencia de código abierto; es necesario revisar sus términos para uso comercial en producción.
- Publicación con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad ni de uso en producción por terceros.
- Las métricas proceden únicamente de la model card del autor y no han sido verificadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-maritime-naval-vessels-tr
- Página del modelo en la plataforma EVREN: https://evren.ssyz.org.tr/models/u19979974710e/denizcilik-ve-donanma-gemileri-cok-sinifli-tespiti
- Portafolio GitHub del autor: https://github.com/kenantabak
