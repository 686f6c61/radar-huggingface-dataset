# jparedesDS/cs2-yolo12m-weapon-detection

## Resumen

`jparedesDS/cs2-yolo12m-weapon-detection` es un detector de objetos basado en YOLOv12m, ajustado por el usuario jparedesDS para reconocer 19 tipos de armas que aparecen en el videojuego Counter-Strike 2. No es un modelo de lenguaje: es un checkpoint de visión por computador orientado a la detección en tiempo real de armas en imágenes del juego, con aplicaciones en analítica de partidas, herramientas de entrenamiento o sistemas de overlay.

El modelo parte de la arquitectura YOLOv12 en su variante «m» (medium), con 20.119.561 parámetros y 67,2 GFLOPs, y se distribuye como pesos `.pt` compatibles con la librería Ultralytics. El autor reporta métricas de validación muy altas sobre un conjunto pequeño (87 imágenes, 158 instancias): mAP50 de 0,993 y mAP50-95 de 0,871, con una latencia de inferencia de aproximadamente 9,3 ms por imagen.

Su relevancia es acotada: se trata de un modelo de nicho para un dominio muy concreto (CS2), útil como componente en pipelines de análisis de partidas o como ejemplo de ajuste fino de YOLOv12, pero no es un modelo generalista. La información pública es escasa: el repositorio ocupa 0,0 GB, no declara licencia ni idiomas, no incluye detalles sobre el dataset de entrenamiento y no hay resultados de benchmarks comparativos con otros detectores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv12m (detector de objetos de una etapa, familia YOLO) |
| Parametros totales | 20.119.561 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos `.pt`; el ecosistema Ultralytics permite exportar a FP16, INT8 y formatos como ONNX, TensorRT o OpenVINO) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch, Ultralytics); exportable a otros formatos vía Ultralytics |

## Arquitectura y entrenamiento

El modelo es un detector de objetos de una etapa basado en YOLOv12 en variante medium. Según el resumen incluido en la model card, la red fusionada tiene 169 capas, 20.119.561 parámetros y 67,2 GFLOPs. Detecta 19 clases (`nc: 19`): AK47, M4A1-S, M4A1, GALIL, FAMAS, TEC-9, FIVE-SEVEN, GLOCK-18, USP-S, EAGLE, BERETTAS, P2000, MAC10, MP5, MP9, P90, P250, SSG08 y AWP.

No se proporciona información sobre el dataset de entrenamiento: ni número de imágenes, ni composición, ni resolución, ni si se aplicaron técnicas de aumento de datos, destilación o ajuste fino desde pesos preentrenados de YOLOv12. Tampoco se documenta si hubo entrenamiento con RLHF/DPO (no aplicable en detección) ni innovaciones técnicas específicas más allá de las propias de YOLOv12. La validación reportada se hizo sobre 87 imágenes y 158 instancias, un conjunto muy reducido que conviene tener en cuenta al interpretar las métricas.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica 19 tipos de armas de Counter-Strike 2 con cajas delimitadoras.
- Inferencia en tiempo real: ~9,3 ms de inferencia por imagen en el hardware usado por el autor (no especificado), con 0,2 ms de preprocesado y 1,2 ms de postprocesado.
- Integración con Ultralytics: se carga con `YOLO(...)` y se usa con `model.predict(...)`, con soporte para `save=True`, selección de `device`, etc.
- Exportación a otros formatos: al ser un modelo Ultralytics, es exportable a ONNX, TensorRT, OpenVINO, CoreML y TFLite (no verificado en este checkpoint concreto).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un detector visual puro.
- No incluye modo «thinking», visión multimodal ni audio.

## Casos de uso

- Analítica de partidas de CS2: procesar fotogramas o capturas de pantalla para registrar qué armas porta cada jugador en cada ronda, alimentando estadísticas de uso de armamento.
- Herramientas de entrenamiento (coaching): detectar automáticamente las armas visibles en demos o capturas para generar informes de economía y decisiones de compra.
- Overlays y aplicaciones de streaming: identificar en tiempo real el arma mostrada en pantalla para superponer información contextual al espectador.
- Automatización de anotación de datasets: usar el modelo como preanotador para etiquetar grandes volúmenes de capturas de CS2 y reducir el trabajo manual.
- Investigación en visión por computador aplicada a videojuegos: servir como baseline para estudios de detección de objetos en entornos sintéticos con clases finas y gran similitud visual.
- Sistemas de moderación o análisis de contenido: detectar representaciones de armas en imágenes de temática CS2 para clasificación o filtrado (con las cautelas propias de un modelo entrenado solo en este dominio).
- Demostraciones y prototipos: ejemplo práctico de ajuste fino de YOLOv12m para un dominio concreto, útil en docencia o pruebas de concepto.

## Benchmarks y rendimiento

Resultados de validación reportados en la model card (87 imágenes, 158 instancias):

| Clase | Imágenes | Instancias | Precisión | Recall | mAP50 | mAP50-95 |
|---|---|---|---|---|---|---|
| all | 87 | 158 | 0,963 | 1,000 | 0,993 | 0,871 |
| AK47 | 11 | 14 | 0,979 | 1,000 | 0,995 | 0,853 |
| M4A1-S | 8 | 12 | 0,987 | 1,000 | 0,995 | 0,849 |
| M4A1 | 9 | 13 | 0,978 | 1,000 | 0,995 | 0,844 |
| GALIL | 8 | 11 | 0,974 | 1,000 | 0,995 | 0,859 |
| FAMAS | 7 | 7 | 0,963 | 1,000 | 0,995 | 0,926 |
| TEC-9 | 4 | 4 | 0,985 | 1,000 | 0,995 | 0,917 |
| FIVE-SEVEN | 5 | 5 | 0,960 | 1,000 | 0,995 | 0,903 |
| GLOCK-18 | 4 | 4 | 0,932 | 1,000 | 0,995 | 0,905 |
| USP-S | 10 | 10 | 0,966 | 1,000 | 0,995 | 0,900 |
| EAGLE | 4 | 4 | 0,933 | 1,000 | 0,995 | 0,847 |
| BERETTAS | 4 | 4 | 0,929 | 1,000 | 0,995 | 0,948 |
| MAC10 | 6 | 6 | 0,953 | 1,000 | 0,995 | 0,891 |
| MP5 | 7 | 11 | 0,978 | 1,000 | 0,995 | 0,852 |
| MP9 | 7 | 11 | 0,978 | 1,000 | 0,995 | 0,888 |
| P90 | 9 | 13 | 0,978 | 1,000 | 0,995 | 0,842 |
| P250 | 6 | 6 | 0,977 | 1,000 | 0,995 | 0,861 |
| SSG08 | 8 | 11 | 0,900 | 1,000 | 0,950 | 0,785 |
| AWP | 8 | 12 | 0,990 | 1,000 | 0,995 | 0,805 |

Velocidad reportada: 0,2 ms de preprocesado, 9,3 ms de inferencia y 1,2 ms de postprocesado por imagen. No se han publicado resultados de benchmarks comparativos con otros detectores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 20,1 M de parámetros en FP32 los pesos ocupan en torno a 80 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer actual (estimación a partir del recuento de parámetros).
- GPU recomendadas: cualquier GPU compatible con PyTorch y CUDA; el autor usa `device=0` pero no especifica el modelo de GPU empleado en la medición de 9,3 ms.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc.), aunque no se aportan mediciones por modelo.
- Opciones de despliegue: Ultralytics (PyTorch), y por exportación ONNX Runtime, TensorRT, OpenVINO, TFLite o CoreML; también es posible integrarlo en servicios propios con FastAPI o TorchServe.
- Latencia y throughput: ~9,3 ms de inferencia por imagen según el autor (hardware no especificado); el throughput no se documenta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros detectores en la información proporcionada. A modo de referencia estructural (sin cifras de rendimiento comparables):

| Modelo | Arquitectura | Parámetros | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cs2-yolo12m-weapon-detection | YOLOv12m | 20,1 M | 19 (armas CS2) | no disponible | Hugging Face |
| YOLOv12m preentrenado (Ultralytics) | YOLOv12m | ~20 M | 80 (COCO) | no disponible en esta ficha | Repositorio Ultralytics |
| YOLOv8m (Ultralytics) | YOLOv8m | ~25 M | 80 (COCO) | AGPL-3.0 (habitual en Ultralytics) | Repositorio Ultralytics |

Las cifras de parámetros de los modelos de referencia son aproximadas y no se han verificado en la información disponible; no se aportan métricas comparativas.

## Limitaciones y advertencias

- Conjunto de validación muy pequeño (87 imágenes, 158 instancias): las métricas reportadas (mAP50 de 0,993) pueden no generalizar a capturas reales con distintas resoluciones, HUD, skins, iluminación o ángulos.
- Dominio muy restringido: solo detecta armas de CS2; no es un detector de armas en imágenes reales ni un modelo generalista.
- No se documenta el dataset de entrenamiento, por lo que se desconoce el sesgo de clases y la diversidad de escenarios cubiertos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en producción.
- Riesgo de falsos positivos y negativos fuera del dominio de entrenamiento; no hay evaluación en imágenes reales.
- El modelo se distribuye como pesos `.pt`; el uso de la librería Ultralytics puede implicar obligaciones de licencia adicionales (habitualmente AGPL-3.0) que deben revisarse.
- No incluye información sobre sesgos demográficos ni de otro tipo, al no tratar personas.
- No hay garantías de mantenimiento: el repositorio ocupa 0,0 GB y tiene 0 descargas en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jparedesDS/cs2-yolo12m-weapon-detection
- Perfil del autor en Hugging Face: https://huggingface.co/jparedesDS/
- Repositorio object-detection-models: https://github.com/jparedesDS/object-detection-models
- Página del proyecto CS2 Weapon Detection: https://github.com/jparedesDS/object-detection-models/tree/main/projects/cs2-weapon-detection
- Catálogo de modelos: https://github.com/jparedesDS/object-detection-models/blob/main/docs/model-zoo.md
- Guía de entrenamiento: https://github.com/jparedesDS/object-detection-models/blob/main/docs/training-guide.md
- Apoyo al autor: https://buymeacoffee.com/joseparedes
