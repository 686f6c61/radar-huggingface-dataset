# kiyo07/floorplan-door-detector-rfdetr

## Resumen

Floor Plan Door Detection - RF-DETR es un modelo de deteccion de objetos ajustado (fine-tuned) a partir de RF-DETR Small, desarrollado por Roboflow y especializado por el autor kiyo07 para localizar huecos de puerta en planos arquitectonicos. El problema que resuelve es la extraccion automatica de recuentos de puertas en planos digitales (imagenes y PDF), una tarea habitual en estimacion de obra, auditoria de planos y digitalizacion de documentacion arquitectonica, donde el conteo manual es lento y propenso a errores.

El modelo define una unica clase en primer plano, `door` (ID 0), y cuenta cada hueco como un elemento: las puertas dobles se consideran una sola apertura. Incluye un script de inferencia (`predict.py`) que acepta imagenes y PDFs multipagina, con recorte de area util (ROI), tiling de 768x768 con solape y NMS final. El paquete se distribuye con pesos en safetensors y un cargador directo que no depende de la libreria Transformers.

Es relevante porque aborda un dominio vertical (planos arquitectonicos) con un detector moderno basado en transformer, y porque su licencia de pesos Apache-2.0 permite integracion comercial, aunque el script de inferencia incluido esta bajo AGPL-3.0-only, un matiz importante para despliegues en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Small (detector transformer con encoder DINOv2 Small con ventanas) |
| Parametros totales | 31.790.948 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision; entrada 512x512) |
| Tipos de cuantizacion | no disponible (se ejecuta sin optimizacion, cuantizacion ni conversion de precision) |
| Idiomas soportados | en (metadatos y documentacion) |
| Licencia | Apache-2.0 para los pesos (`model.safetensors`); AGPL-3.0-only para el runner de Python incluido, incluida la funcionalidad PDF |
| Formato de pesos | safetensors (tamano del repo: 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura base es RF-DETR Small, un detector de la familia DETR (DEtection TRansformer) publicado por Roboflow. Segun la configuracion fijada por `rfdetr==1.11.2`, el modelo emplea un encoder DINOv2 Small con atencion por ventanas, tres capas de decoder, tamano de parche 16, rejilla posicional de 32 y 300 queries repartidas en 13 grupos. La resolucion de trabajo del modelo es 512x512 y el numero de clases en primer plano se reduce a 1 (`door`).

El ajuste fino se realizo con datasets publicos de planos de planta y recortes adicionales de dibujos arquitectonicos. No se han publicado detalles sobre el numero de imagenes, epocas ni estrategia de aumento de datos. La inferencia sobre documentos grandes se resuelve con un esquema de tiling: mosaicos de 768x768 con paso de 384 pixeles, rechecks en los limites de los mosaicos y NMS voraz final con IoU 0,5, con umbral de confianza por defecto de 0,3. Los PDFs se rasterizan a 150 DPI (limite de 40 millones de pixeles por pagina), con soporte de seleccion explicita de paginas y ROI en porcentajes.

## Capacidades

- Deteccion de huecos de puerta en planos arquitectonicos con una unica clase (`door`, ID 0); las puertas dobles se cuentan como una apertura.
- Procesamiento de imagenes (PNG y formatos compatibles) y PDFs multipagina con seleccion de paginas (por ejemplo `--pages 2,4-6`).
- Recorte de area de interes (ROI) mediante porcentajes izquierda/arriba/derecha/abajo para excluir cartelas, leyendas o margenes.
- Preprocesamiento robusto: aplicacion de orientacion EXIF, composicion de transparencias sobre blanco y conversion a RGB.
- Salidas estructuradas: `predictions.json`, `detections.csv` e imagen anotada PNG por pagina procesada.
- Ejecucion en CPU, con soporte para Apple Silicon via `--device mps` y CUDA si se dispone de una instalacion compatible de PyTorch (no validada en esta version).
- Carga estricta de pesos: el cargador rechaza configuraciones no soportadas, claves de pesos inesperadas y formas o dtypes incompatibles.
- No es compatible con `pipeline()` ni `from_pretrained()` de Transformers; se usa el cargador propio `model_loader.py`.

## Casos de uso

- **Auditoria de recuentos de puertas en proyectos de edificacion**: un tecnico puede procesar planos en PDF pagina a pagina y obtener un recuento preliminar de huecos en CSV para contrastar con presupuestos y mediciones, reduciendo el conteo manual.
- **Digitalizacion de planos historicos**: archivos de documentacion arquitectonica escaneada pueden procesarse en lote para indexar el numero de aperturas por plano, facilitando la busqueda y catalogacion.
- **Verificacion de cumplimiento normativo**: en evacuacion y accesibilidad, un revisor puede usar los recuentos preliminares de puertas como punto de partida para comprobar requisitos minimos de salidas, revisando siempre los resultados.
- **Preparacion de datos para BIM**: las cajas delimitadoras en pixeles de la pagina pueden servir como anotaciones semilla para procesos posteriores de vectorizacion o vinculacion con modelos BIM, previa revision humana.
- **Extraccion de caracteristicas para analisis inmobiliario**: empresas que analizan planos de viviendas pueden estimar densidad de puertas por planta como variable en modelos de valoracion o distribucion espacial.
- **Generacion de datasets anotados**: los resultados anotados en PNG y JSON pueden acelerar la creacion de anotaciones para entrenar detectores propios sobre estilos de plano especificos.
- **Control de calidad de planos entrantes**: despachos que reciben planos de multiples proveedores pueden detectar de forma sistematica inconsistencias en el numero de aperturas entre versiones del mismo proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se realiza ninguna afirmacion de rendimiento publico ni especifico del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo tiene unos 32 millones de parametros y la model card muestra inferencia por CPU, por lo que los requisitos de GPU son modestos. Sin cifras publicadas, no se pueden dar valores concretos.
- GPU recomendadas: no disponible. La ejecucion en CPU esta validada, al igual que `--device mps` en Apple Silicon. `--device cuda` requiere una instalacion compatible de PyTorch/CUDA y no ha sido validada en esta version.
- Consumer GPU: dado el tamano del modelo (0,3 GB en safetensors), es razonable que funcione en GPUs de consumo con CUDA, aunque sin validacion oficial.
- Despliegue: el paquete es autocontenido; se instala con `pip install -r requirements.txt` (probado con Python 3.13.3 en macOS ARM64, con fichero de dependencias bloqueadas `requirements-lock-macos-py313.txt`). Carga los pesos directamente con `rfdetr==1.11.2` sin descargar checkpoints base ni usar pickle. No es compatible con Transformers `pipeline()`/`from_pretrained()`, por lo que vLLM, TGI u Ollama no son aplicables.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| kiyo07/floorplan-door-detector-rfdetr | 31,8 M | Deteccion de puertas en planos arquitectonicos | Apache-2.0 (pesos); AGPL-3.0-only (runner) | Pesos safetensors en Hugging Face |
| RF-DETR Small (base, Roboflow) | no disponible | Deteccion de objetos general (COCO, 365 clases) | Apache-2.0 (upstream) | Checkpoint base y codigo en GitHub de Roboflow |
| DETR / RT-DETR (Meta, Baidu) | no disponible | Deteccion de objetos general | no disponible | Pesos publicos en Hugging Face |

No existen alternativas publicas ampliamente conocidas especializadas exactamente en deteccion de puertas en planos arquitectonicos; los detectores generales (RF-DETR base, RT-DETR, YOLO) podrian afinarse para esta tarea, pero requieren datasets propios y el trabajo de ajuste fino que este modelo ya incorpora.

## Limitaciones y advertencias

- **Revision humana obligatoria**: la model card exige revision humana de todas las predicciones, incluidas zonas donde no se propuso ninguna caja. Los recuentos son preliminares.
- **Errores tipicos documentados**: omisiones, falsas detecciones, duplicados, puertas dobles divididas en dos y aperturas vecinas fusionadas pueden producirse.
- **Sensibilidad al estilo de dibujo**: lineado denso, mobiliario, leyendas, escaneos debiles, simbolos inusuales, cambios de escala y estilos de dibujo desconocidos pueden degradar el rendimiento.
- **Sin deduplicacion**: el modelo no identifica automaticamente aperturas fisicas unicas a traves de planos repetidos ni excluye cuadros de schedules o hojas repetidas.
- **Coordenadas en pixeles**: las cajas en PDF se refieren al raster renderizado (150 DPI por defecto), no a puntos PDF ni unidades CAD; la integracion con herramientas CAD requiere conversion adicional.
- **Licencia dual**: los pesos son Apache-2.0, pero el runner de Python incluido (con la funcionalidad PDF) es AGPL-3.0-only. Para uso comercial sin obligaciones AGPL, conviene reimplementar la inferencia o revisar `LICENSING.md` y `NOTICE`.
- **Validacion de plataforma limitada**: solo probado en Python 3.13.3 sobre macOS ARM64; CUDA y otros sistemas operativos no estan validados en esta version.
- **Sin compatibilidad con Transformers**: no funciona con `pipeline()` ni `from_pretrained()`; hay que usar el cargador incluido.
- **Cambios de parametros alteran resultados**: modificar `--dpi`, `--threshold`, `--nms-iou` u otros ajustes puede cambiar las predicciones.
- **Sesgos**: no disponible; no se han publicado estudios de sesgo para este modelo.
- **Riesgo de alucinacion**: no aplicable en el sentido de modelos de lenguaje, aunque las falsas detecciones son el equivalente funcional y estan documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiyo07/floorplan-door-detector-rfdetr
- Codigo upstream de RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Checkpoint base nativo de RF-DETR Small: https://storage.googleapis.com/rfdetr/small_coco/checkpoint_best_regular.pth
- Ficheros de licencia del repo: `LICENSING.md` y `NOTICE` (en el repositorio del modelo)
