# macpaw-research/yolov11l-ui-groups-detection

## Resumen

El modelo `macpaw-research/yolov11l-ui-groups-detection` es un detector de objetos basado en visión, desarrollado por MacPaw Research como parte del proyecto Screen2AX. Se trata de un fine-tuning del modelo base `Ultralytics/YOLO11` (variante large) entrenado específicamente para identificar grupos de interfaz de usuario (UI groups) en capturas de pantalla de aplicaciones macOS. El modelo detecta una única clase, `AXGroup`, que agrupa elementos accesibles como barras de herramientas, grupos de pestañas o contenedores semánticos definidos por el framework de accesibilidad de Apple.

Su relevancia radica en que aborda un problema concreto: la generación automática de metadatos de accesibilidad (como el árbol de accesibilidad AX) a partir de imágenes, sin necesidad de instrumentar la aplicación. Esto es útil para desarrolladores de software de automatización de pruebas, herramientas de asistencia y sistemas de análisis de interfaces. El modelo se distribuye bajo licencia AGPL-3.0, lo que condiciona su integración en productos propietarios.

El repositorio incluye el peso del modelo en formato PyTorch (`.pt`), listo para cargarse con la librería Ultralytics. No se proporcionan métricas de rendimiento ni detalles de entrenamiento más allá del dataset utilizado, `macpaw-research/Screen2AX-Group`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11l (large), detector de una sola etapa basado en CNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se puede exportar a ONNX/TensorRT, pero no se documenta) |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de YOLO11l, la variante grande de la familia YOLO11 de Ultralytics. YOLO11 es un detector de objetos de una sola etapa que utiliza una red neuronal convolucional (CNN) con una cabeza de detección densa y sin propuestas de regiones. La arquitectura original incluye un backbone CSPDarknet mejorado, un cuello PAN-FPN y una cabeza de detección con anclas libres. Para este fine-tuning, se sustituyó la cabeza de clasificación original para predecir una única clase (`AXGroup`), manteniendo el resto de la estructura.

El entrenamiento se realizó sobre el dataset `macpaw-research/Screen2AX-Group`, que contiene capturas de pantalla de aplicaciones macOS con anotaciones de grupos de interfaz accesibles (por ejemplo, `AXGroup`, `AXTabGroup`, `AXToolbar`). No se especifican el número de imágenes, el número de épocas, ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se menciona el uso de RLHF u otros métodos de alineación, ya que es un modelo puramente visual de detección.

## Capacidades

- Detección de grupos de interfaz de usuario (UI groups) en capturas de pantalla de aplicaciones macOS.
- Reconoce la clase `AXGroup`, que abarca contenedores semánticos como barras de herramientas, grupos de pestañas y otros elementos estructurados según el modelo de accesibilidad de Apple.
- Genera cajas delimitadoras (bounding boxes) con su correspondiente confianza para cada grupo detectado.
- Integración directa con el ecosistema Ultralytics: carga con `YOLO(model_path)` y predicción mediante `model.predict()`.
- Exportable a otros formatos de inferencia (ONNX, TensorRT, CoreML) mediante las utilidades de Ultralytics, aunque no se documenta en la model card.
- No soporta tool calling, agentes, ni razonamiento multi-paso; es exclusivamente un modelo de visión para detección de objetos.

## Casos de uso

- Generación automática de metadatos de accesibilidad: el modelo puede alimentar el pipeline de Screen2AX para producir árboles de accesibilidad (AX) a partir de capturas de pantalla, reduciendo el trabajo manual de los desarrolladores de apps macOS.
- Automatización de pruebas de interfaz: en suites de testing visual, permite localizar grupos de UI de forma robusta, ayudando a verificar que la estructura de la interfaz se mantiene tras cambios de diseño.
- Asistencia para personas con discapacidad: herramientas de terceros pueden usar el detector para identificar zonas funcionales de una app y ofrecer navegación alternativa o ampliación de regiones.
- Análisis de UX y auditoría de interfaces: se puede emplear para inventariar la estructura de grupos en múltiples capturas de una misma aplicación y detectar inconsistencias o regresiones.
- Documentación automática de UI: a partir de capturas, se pueden generar diagramas o descripciones de la disposición de los grupos, útiles para documentación técnica o manuales de usuario.
- Investigación en visión por computador aplicada a interfaces: sirve como punto de partida para experimentos de detección de componentes de UI en otras plataformas o con clases adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como mAP, precisión, recall ni comparaciones con otros detectores. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- Al ser una variante "large" de YOLO11, se estima que requiere una GPU con al menos 8 GB de VRAM para inferencia en FP16, aunque no se especifica oficialmente.
- GPU recomendadas: tarjetas NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 3090, A100) para un rendimiento óptimo. También puede ejecutarse en CPU, pero con mayor latencia.
- Es viable en GPUs de consumo como la RTX 4060 o superiores, siempre que se use una resolución de entrada moderada (por ejemplo, 640x640).
- Opciones de despliegue: se puede servir con el framework Ultralytics, exportar a ONNX para usar con ONNX Runtime, o a TensorRT para aceleración en producción. También es compatible con herramientas como vLLM o TGI, aunque no son las más habituales para modelos de detección.
- No se dispone de datos de latencia o throughput medidos por el autor.

## Comparativa con modelos similares

| Modelo | Tarea | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|
| `macpaw-research/yolov11l-ui-groups-detection` | Detección de grupos de UI (macOS) | 1 (`AXGroup`) | AGPL-3.0 | HuggingFace |
| `macpaw-research/yolov11l-ui-elements-detection` | Detección de elementos de UI (macOS) | Múltiples (botones, campos, etc.) | AGPL-3.0 | HuggingFace |
| `Ultralytics/YOLO11` (base) | Detección de objetos genérica | 80 clases COCO | AGPL-3.0 | HuggingFace |

No se dispone de métricas comparativas entre estos modelos. La comparación se limita a la tarea y al alcance: el modelo de grupos se centra en contenedores semánticos, mientras que el de elementos detecta componentes individuales. El modelo base YOLO11 no está especializado en UI y no reconocería la clase `AXGroup`.

## Limitaciones y advertencias

- Licencia AGPL-3.0 con fuerte copyleft: cualquier uso comercial o integración en un servicio en red obliga a liberar el código de la aplicación integradora bajo AGPL-3.0, salvo que se adquiera una licencia comercial de Ultralytics.
- Entrenado exclusivamente con capturas de pantalla de macOS; su rendimiento en otras plataformas (Windows, Linux, web) no está garantizado y probablemente sea deficiente.
- Solo detecta una clase (`AXGroup`); no distingue entre tipos específicos de grupos (pestañas, barras, etc.), lo que limita su utilidad para análisis detallados.
- No se han publicado métricas de precisión o recall, por lo que se desconoce su robustez ante variaciones de resolución, escala o estilo visual.
- Riesgo de falsos positivos en interfaces complejas o con superposiciones de elementos.
- No hay información sobre el tamaño exacto del dataset de entrenamiento ni sobre el proceso de anotación, lo que dificulta evaluar posibles sesgos.
- El modelo está pensado para imágenes de aplicaciones macOS; no se ha validado en fotografías del mundo real ni en otros dominios.

## Enlaces

- Modelo en HuggingFace: [macpaw-research/yolov11l-ui-groups-detection](https://huggingface.co/macpaw-research/yolov11l-ui-groups-detection)
- Dataset de entrenamiento: [macpaw-research/Screen2AX-Group](https://huggingface.co/datasets/macpaw-research/Screen2AX-Group)
- Proyecto Screen2AX (GitHub): [https://github.com/MacPaw/Screen2AX](https://github.com/MacPaw/Screen2AX)
- Colección Screen2AX en HuggingFace: [https://hf.co/collections/macpaw-research/screen2ax](https://hf.co/collections/macpaw-research/screen2ax)
- Modelo hermano de detección de elementos UI: [macpaw-research/yolov11l-ui-elements-detection](https://huggingface.co/macpaw-research/yolov11l-ui-elements-detection)
- Paper Screen2AX (arXiv): [https://arxiv.org/abs/2507.16704](https://arxiv.org/abs/2507.16704)
- Licencia comercial de Ultralytics: [https://www.ultralytics.com/license](https://www.ultralytics.com/license)
