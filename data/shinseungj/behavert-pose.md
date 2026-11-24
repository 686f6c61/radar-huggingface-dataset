# ShinSeungJ/behavert-pose

## Resumen

BehaVERT-pose es un repositorio de modelos de estimación de pose animal desarrollado por ShinSeungJ en el marco del proyecto BehaVERT, publicado en el *International Journal of Computer Vision* (2026). Contiene dos modelos basados en Ultralytics YOLO (YOLOv12-small pose y YOLO12-medium pose) especializados en la detección de 12 keypoints anatómicos en ratones de laboratorio, orientados a la automatización del análisis de conducta en neurociencia.

El problema que resuelve es la extracción precisa de posturas corporales de roedores a partir de vídeo, un paso previo indispensable para clasificar comportamientos (acicalamiento, locomoción, interacción social). El modelo `oft-pose` está optimizado para grabaciones cenitales de un solo ratón en campo abierto, mientras que `sbea-pose` maneja dos ratones por vista de cámara en el marco del Social Behavior Atlas (SBeA).

Ambos modelos comparten el mismo esquema de 12 keypoints (hocico, orejas, centro torácico, extremidades anteriores y posteriores, base, centro y punta de la cola, centro corporal) y se distribuyen como pesos `.pt` compatibles con la librería Ultralytics. El repositorio es de tamaño reducido (0,1 GB) y su relevancia actual radica en la integración directa con el pipeline BehaVERT, que encadena pose y clasificación de conducta en un solo comando.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv12-small pose (`oft-pose`) y YOLO12-medium pose (`sbea-pose`), detección de keypoints |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos `.pt` sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) más `config.json` con nombres de keypoints y ajustes recomendados |

## Arquitectura y entrenamiento

Ambos modelos emplean la arquitectura de estimación de pose de Ultralytics YOLO, con un backbone y cabeza de keypoints que predicen 12 puntos anatómicos por ratón. `oft-pose` usa la variante small de YOLOv12 y `sbea-pose` la variante medium de YOLO12; no se especifican en la información disponible el número de parámetros, capas ni detalles del neck o de la cabeza de predicción.

El entrenamiento se realizó sobre fotogramas anotados manualmente. Para `oft-pose`, los datos provienen de vídeos cenitales de ratones individuales en campo abierto, con tamaño de imagen de 1440 píxeles. Para `sbea-pose`, los fotogramas anotados proceden de las grabaciones del Social Behavior Atlas (Han et al., *Nature Machine Intelligence*, 2024), con tamaño de imagen de 1504 píxeles, y se emplearon para la reconstrucción 3D de dichas grabaciones. No se detallan en la información proporcionada el volumen de datos, el número de épocas, las funciones de pérdida ni si hubo aumentación de datos específica más allá de los ajustes de inferencia recomendados.

## Capacidades

- Estimación de pose de ratón con 12 keypoints por individuo: hocico, oreja izquierda, oreja derecha, centro torácico, extremidad anterior izquierda, extremidad anterior derecha, base de la cola, extremidad posterior izquierda, extremidad posterior derecha, centro de la cola, punta de la cola y centro corporal.
- Detección de un ratón por fotograma en `oft-pose` (configuración de campo abierto cenital) y de hasta dos ratones por vista de cámara en `sbea-pose`.
- Salida de coordenadas normalizadas (`keypoints.xyn`) con forma `[12, 2]` por individuo detectado.
- Inferencia en streaming sobre vídeo mediante `model.predict(..., stream=True)`.
- Integración con el pipeline BehaVERT para clasificación de conducta a partir de la pose (`oft-pose` alimenta `oft-behavior`).
- No incluye capacidades de lenguaje, tool calling, razonamiento multi-paso ni procesamiento multimodal más allá de la imagen.

## Casos de uso

- Análisis de conducta en campo abierto: `oft-pose` extrae la pose de un ratón en grabaciones cenitales y alimenta el modelo `oft-behavior` para clasificar comportamientos como locomoción, acicalamiento o rearing, con el comando `behavert decode --video my_videos/ --model oft-behavior --overlay`.
- Estudios de interacción social: `sbea-pose` detecta dos ratones por vista de cámara en grabaciones SBeA, lo que permite analizar aproximaciones, contacto físico y dinámica de pareja en ensayos de comportamiento social.
- Reconstrucción 3D de grabaciones SBeA: los keypoints de `sbea-pose` se usaron para la reconstrucción tridimensional de las grabaciones del Social Behavior Atlas, habilitando análisis espaciales de la postura en tres dimensiones.
- Fenotipado automatizado en modelos animales: la extracción sistemática de 12 keypoints permite comparar posturas entre grupos experimentales (por ejemplo, tras manipulación genética o farmacológica) sin anotación manual.
- Análisis de marcha y coordinación motora: los keypoints de extremidades anteriores y posteriores, junto con la cola, permiten estudiar patrones de locomoción y detectar alteraciones motoras.
- Integración en pipelines de neurociencia: al ser pesos Ultralytics estándar, los modelos se pueden cargar con `hf_hub_download` y `YOLO(...)` dentro de flujos de análisis existentes en Python, sin depender del paquete BehaVERT completo.
- Procesamiento por lotes de vídeo: la inferencia en streaming permite recorrer vídeos largos fotograma a fotograma y almacenar las coordenadas de keypoints para análisis posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Al tratarse de variantes small y medium de YOLO con pesos de repositorio de 0,1 GB, la huella de memoria es reducida, pero no se confirman cifras.
- GPU recomendadas: no disponible. Por el tamaño de las variantes (small y medium de YOLO), es razonable esperar ejecución en GPU de consumo, pero no se aporta confirmación en la información disponible.
- ¿Cabe en GPU de consumo? No confirmado en la información proporcionada.
- Opciones de despliegue: Ultralytics (`YOLO(...).predict(...)`) y el pipeline BehaVERT (`pip install "behavert[pose] @ git+https://github.com/ShinSeungJ/BehaVERT"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.
- Resoluciones de inferencia recomendadas: `imgsz 1440` para `oft-pose` y `imgsz 1504` para `sbea-pose`, con `conf 0.05`, `iou 0.7`, `max_det 1` (oft) o `max_det 2` (sbea).

## Comparativa con modelos similares

| Modelo | Tipo | Keypoints | Contexto de uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BehaVERT-pose (`oft-pose`, `sbea-pose`) | YOLOv12-small / YOLO12-medium pose | 12 por ratón | Campo abierto cenital y SBeA social | AGPL-3.0 | Hugging Face (ShinSeungJ/behavert-pose) |
| DeepLabCut | Estimación de pose basada en transferencia de aprendizaje | Configurable por proyecto | Roedores y otras especies | LGPL-3.0 (según versión) | GitHub / PyPI |
| SLEAP | Estimación de pose multi-animal | Configurable por proyecto | Multi-animal, incluyendo ratones | BSD-3-Clause (según versión) | GitHub / PyPI |
| Social Behavior Atlas (SBeA) | Pipeline de análisis de conducta social | No aplica directamente | Grabaciones sociales de ratones | no disponible en la información | Publicado en Nature Machine Intelligence 2024 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a tipo de arquitectura, esquema de keypoints, licencia y disponibilidad.

## Limitaciones y advertencias

- Los modelos detectan cada ratón de forma independiente en cada fotograma; el seguimiento de identidad entre fotogramas y entre vistas de cámara queda a cargo del usuario.
- `oft-pose` está diseñado para un solo ratón por fotograma y vista cenital; su uso fuera de ese dominio (otra cámara, otra especie, múltiples animales) no está validado en la información disponible.
- `sbea-pose` está ajustado a las grabaciones del Social Behavior Atlas y a dos ratones por vista; no se documenta su generalización a otras configuraciones.
- No se han publicado resultados de benchmarks ni métricas de precisión (PCK, OKS, mAP) en la información disponible, lo que impide cuantificar su rendimiento frente a alternativas.
- Licencia AGPL-3.0: impuesta por el uso de Ultralytics; el uso comercial o en servicios en red requiere revisar las obligaciones de la AGPL y, en su caso, la licencia comercial de Ultralytics.
- Si se usa `sbea-pose`, el autor indica que debe citarse también el artículo del Social Behavior Atlas (Han et al., 2024).
- No se documentan sesgos, tasas de alucinación (no aplica a un modelo de visión) ni limitaciones idiomáticas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ShinSeungJ/behavert-pose
- Carpeta `oft-pose`: https://huggingface.co/ShinSeungJ/behavert-pose/tree/main/oft-pose
- Repositorio del proyecto BehaVERT: https://github.com/ShinSeungJ/BehaVERT
- Modelos de conducta: https://huggingface.co/ShinSeungJ/behavert
- Artículo (Shin et al., IJCV 2026): https://doi.org/10.1007/s11263-026-02834-y
- Artículo SBeA (Han et al., Nature Machine Intelligence 2024): no disponible como enlace directo en la información proporcionada
- Licencia Ultralytics: https://ultralytics.com/license
