# kenantabak/yolo26s-color-coded-hardhat-safety-tr

## Resumen

`yolo26s-color-coded-hardhat-safety-tr` es un modelo de detección de objetos basado en la arquitectura YOLO26S de Ultralytics, publicado por Kenan Tabak en la plataforma EVREN (SSYZ). Está especializado en la detección de cascos de seguridad laboral codificados por color, concretamente las clases `helmet_blue` (casco azul) y `helmet_white` (casco blanco), en entornos de obra. El modelo se distribuye como un checkpoint de 19,4 MB entrenado con la librería `ultralytics` y pensado para integrarse en pipelines de visión por computador en obra.

El modelo resuelve un problema muy concreto: la distinción fiable por color de cascos de seguridad en imágenes de obra, evitando el desplazamiento de tono (color shift) que suele producirse con aumentos de datos agresivos sobre el canal de matiz. Para ello el autor fija `hsv_h=0.0` durante el entrenamiento, preservando la información cromática. La versión publicada es una revisión (v2) que elimina la clase `helmet_yellow`, sin soporte en validación, y se queda con las dos clases activas que sí obtienen métricas útiles.

Es relevante para equipos que necesiten un detector ligero y desplegable en producción para señalización de seguridad en obra (EPIs), con licencia CC BY 4.0 sobre los pesos y AGPL-3.0 sobre el framework Ultralytics subyacente. El contexto no aplica en el sentido de modelos de lenguaje: se trata de un detector de objetos con resolución de entrada configurable (768×768 en entrenamiento, 640 en el ejemplo de inferencia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26S (Ultralytics, detector de objetos de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato nativo `.pt`; exportación a otros formatos vía Ultralytics no documentada en la model card) |
| Idiomas soportados | tr, en (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | CC BY 4.0 (pesos); AGPL-3.0 para el framework Ultralytics |
| Formato de pesos | `.pt` (PyTorch, Ultralytics); tamaño 19,4 MB |

## Arquitectura y entrenamiento

Se trata de un detector YOLO26S de la familia Ultralytics, una arquitectura de detección de objetos de una sola etapa (single-stage) basada en CNN con cuello de botella tipo PAN/FPN y cabezas de predicción ancladas o anchor-free según la variante. El autor no detalla la composición interna de la red en la model card; solo se indica la variante (`yolo26s`) y el tamaño del checkpoint (19,4 MB). El entrenamiento se realizó con `imgsz=768`, `epochs=70` (mejor epoch en 44), `batch=24`, `patience=20` y `cos_lr=True`, con un coste declarado de 0,053 horas-GPU.

Los datos de entrenamiento corresponden al dataset "Renk Kodlu İş Güvenliği Bareti Tespiti (3 Sınıf)" (clasificado como Grade A, 100/100, en la plataforma EVREN), aunque el modelo final se entrena con 2 clases activas (`helmet_blue`, `helmet_white`) tras descartar `helmet_yellow` por falta de soporte en validación. El aumento de datos incluye `mosaic=0.75`, `close_mosaic=15`, `fliplr=0.5`, `flipud=0.0`, `degrees=5.0`, `scale=0.35`, `erasing=0.0`, `hsv_h=0.0`, `hsv_s=0.1` y `hsv_v=0.25`. La innovación técnica destacable es precisamente la desactivación del aumento de matiz (`hsv_h=0.0`) para preservar la identidad cromática de los cascos, algo crítico cuando la clase depende del color.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica cascos de seguridad en dos clases (`helmet_blue`, `helmet_white`).
- Distinción por color robusta: el entrenamiento con `hsv_h=0.0` evita el desplazamiento de tono y preserva la separación azul/blanco.
- Inferencia en imagen única o lotes vía `ultralytics.YOLO.predict`.
- Configuración de umbrales de confianza e IoU en inferencia (`conf`, `iou`).
- Resolución de entrada ajustable en inferencia (ejemplo documentado con `imgsz=640`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje: es exclusivamente un detector visual.
- Capacidades multilingües limitadas a etiquetas y documentación (tr, en); el modelo no procesa texto.

## Casos de uso

- Monitorización de EPIs en obra: el detector identifica en tiempo real qué trabajadores llevan casco azul o blanco, permitiendo alertar sobre personal sin la protección adecuada según el rol asignado por color.
- Control de acceso por rol en obra: dado que el color del casco suele codificar el rol (ingeniero, técnico, visitante), el modelo puede alimentar un sistema de verificación de que cada persona lleva el casco correspondiente a su función.
- Auditoría de seguridad a partir de grabaciones: procesamiento por lotes de imágenes o frames de vídeo para generar informes de cumplimiento de uso de casco por zona y turno.
- Integración en drones o cámaras fijas de obra: al ser un modelo ligero (19,4 MB) y con inferencia a 640 px, es viable en dispositivos de borde con GPU modesta.
- Señalización automática en pantallas de obra: activación de avisos visuales cuando se detecta un casco del color equivocado en una zona restringida.
- Etiquetado asistido y control de calidad de datasets: uso del modelo como preetiquetador para acelerar la anotación de nuevas imágenes de cascos azules y blancos.
- Investigación en visión por computador aplicada a seguridad laboral: base para experimentos de detección por color con aumentos desactivados en el canal de matiz.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| mAP@50 | 98,19 % |
| mAP@50-95 | 98,19 % |
| F1 Score | 70,06 % |
| Precision | 85,71 % |
| Recall | 100,00 % |
| Mejor epoch / total | 44 / 64 |

Rendimiento por clase (declarado por el autor):

| Clase | mAP@50 | Precision | Recall | F1 |
|---|---|---|---|---|
| `helmet_blue` | 97,76 % | 66,56 % | 100,00 % | 79,93 % |
| `helmet_white` | 79,07 % | 81,11 % | 47,85 % | 60,19 % |

Nota: los valores de mAP@50 y mAP@50-95 son idénticos (98,19 %), lo que resulta atípico y sugiere una posible inconsistencia en el reporte del autor; conviene tratar estas cifras con cautela. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del checkpoint (19,4 MB) y la variante `s` de YOLO, la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia a 640 px; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas (las de gama alta sobredimensionadas para este modelo).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 4 GB o más; no se documenta el mínimo exacto.
- Opciones de despliegue: `ultralytics` (PyTorch) es la vía documentada; exportación a ONNX, TensorRT, OpenVINO u otros formatos es posible a través de Ultralytics, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yolo26s-color-coded-hardhat-safety-tr` | no disponible (19,4 MB) | imagen, `imgsz` configurable (640/768) | mAP@50 98,19 % (declarado, no verificado) | CC BY 4.0 (pesos) / AGPL-3.0 (framework) | Hugging Face + EVREN |
| YOLO11s (Ultralytics, genérico) | no disponible | imagen | no disponible en esta ficha | AGPL-3.0 | Ultralytics |
| YOLOv8s (Ultralytics, genérico) | no disponible | imagen | no disponible en esta ficha | AGPL-3.0 | Ultralytics |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible. La diferencia principal frente a los YOLO genéricos es la especialización en dos clases de cascos por color y la licencia CC BY 4.0 de los pesos, más permisiva que la AGPL-3.0 del framework.

## Limitaciones y advertencias

- Métricas no verificadas: el model-index marca los resultados como `verified: false`; los valores de mAP@50 y mAP@50-95 idénticos son sospechosos y deben validarse de forma independiente.
- Desequilibrio entre clases: `helmet_white` obtiene un recall del 47,85 % frente al 100 % de `helmet_blue`, lo que indica falsos negativos frecuentes en cascos blancos.
- F1 bajo (70,06 %) pese al mAP alto: la precisión por clase es moderada (66,56 % en azul), lo que sugiere sensibilidad a falsos positivos.
- Clase descartada: `helmet_yellow` se eliminó por falta de soporte en validación; el modelo no detecta cascos amarillos.
- Dominio estrecho: entrenado solo para dos colores de casco en contexto de obra; no generaliza a otros EPIs ni a otros colores.
- Riesgo de sesgo por iluminación: aunque `hsv_h=0.0` preserva el color, condiciones de luz extremas o cámaras con balance de blancos agresivo pueden alterar la clasificación cromática.
- Licencia: los pesos son CC BY 4.0 (requiere atribución), pero el framework Ultralytics es AGPL-3.0, lo que condiciona el uso comercial de la implementación completa.
- Sin datos de latencia ni throughput: no se puede garantizar un SLA de producción sin medición propia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kenantabak/yolo26s-color-coded-hardhat-safety-tr
- Página del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/renk-kodlu-is-guvenligi-bareti-tespiti-mavi-ve-beyaz-sinif-v2
- Dataset de entrenamiento (EVREN, Grade A): https://evren.ssyz.org.tr/datasets/u19979974710e/renk-kodlu-is-guvenligi-bareti-tespiti-3-sinif
- Perfil del desarrollador en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catálogo de datasets de visión por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
