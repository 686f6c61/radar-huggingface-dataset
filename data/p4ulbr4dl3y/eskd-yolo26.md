# p4ulbr4dl3y/eskd-yolo26

## Resumen

ESKD-YOLO26 es un conjunto de detectores de objetos basados en la arquitectura YOLO26s, publicados por el usuario p4ulbr4dl3y, especializados en la detección de elementos estructurales en planos tecnicos que siguen las normas rusas ESKD (Единая система конструкторской документации) y GOST. El modelo no realiza reconocimiento optico de caracteres (OCR): su funcion es delimitar regiones geometricas como el marco del plano, el cajetin (штамп), las celdas de la tabla de materiales, las zonas de vistas, las areas de texto, las flechas y los simbolos de tolerancias geometricas.

El repositorio contiene dos tareas entrenadas y operativas: `layout` (13 clases, 60 epocas) y `text` (20 clases, 80 epocas), mientras que `arrows` y `symbols` estan pendientes o en fase inicial. La relevancia actual radica en la digitalizacion de archivos de ingenieria heredados: permite una preanotacion automatica (prelabeling) que reduce el trabajo manual de anotacion para pipelines de vision documental industrial. El tamano del repositorio es de 28,2 GB, principalmente por los checkpoints por epoca.

Es importante senalar que las metricas publicadas provienen de un conjunto de test sintetico de 400 laminas, no de escaneos reales, y que el autor advierte explicitamente que la confianza no esta calibrada. La licencia AGPL-3.0 de Ultralytics condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), deteccion de objetos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en `.pt`, formato PyTorch) |
| Idiomas soportados | no disponible (sin OCR; el dominio son planos ESKD/GOST en ruso) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics), checkpoints por epoca |

## Arquitectura y entrenamiento

Se trata de un detector YOLO26s de Ultralytics, una arquitectura de deteccion de objetos de una sola etapa (single-stage) orientada a inferencia en tiempo real. El autor no documenta la configuracion interna de la red (profundidad, anchura, modulos de atencion), por lo que los detalles arquitectonicos especificos de YOLO26 no estan disponibles en la informacion proporcionada. El modelo opera sobre imagenes de alta resolucion: 1280 px para `layout` y 1536 px para `text`, con `max-det` de 3000 para acomodar las decenas o cientos de regiones por lamina.

El entrenamiento se realizo con AMP en fp16, optimizador MuSGD, scheduler coseno, `mosaic=0.3`, sin volteos horizontales ni verticales (adecuado para planos, donde la orientacion es semantica) y `close_mosaic=10`. El batch fue de 8 para `layout` y de 4 para `text`. El dataset de entrenamiento (`p4ulbr4dl3y/eskd-drawings-yolo`) es de naturaleza sintetica, lo que constituye la principal limitacion de generalizacion. No se documenta el numero total de tokens ni de imagenes del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (no aplicable en deteccion).

## Capacidades

- Deteccion de estructura de lamina (`layout`, 13 clases): marco, cajetin, celdas del cajetin, zonas de vistas, areas de texto, entre otras.
- Deteccion de regiones de texto (`text`, 20 clases): anotaciones de dimension, notas, rugosidad, llamadas de taladros, marcas de seccion, letras de referencia, celdas de lista de materiales (BOM), simbolos de tolerancia geometrica (GD&T).
- Localizacion de flechas (`arrows`, 1 clase): en fase de entrenamiento, sin metricas publicadas.
- Deteccion de simbolos (`symbols`, 5 clases): no iniciado.
- Salida en formato COCO opcional (`--coco`) para integracion con pipelines de anotacion.
- Preanotacion con umbrales de aceptacion/revision configurables (`--accept-conf`, `--review-conf`, `--required`).
- Sin OCR: no reconoce el contenido textual, solo delimita regiones.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Sin capacidades multilingues ni de vision generativa.

## Casos de uso

- Digitalizacion de archivos de planos heredados: el detector `layout` localiza marco, cajetin y zonas de vistas para segmentar la lamina antes de un pipeline de OCR o vectorizacion, reduciendo el preprocesado manual.
- Preanotacion para reentrenamiento: `tools/prelabel.py` genera cajas con umbrales de aceptacion (0,65) y revision (0,25), lo que permite a un equipo de anotacion revisar solo las detecciones dudosas y acelerar la creacion de un dataset real.
- Extraccion de la tabla de materiales (BOM): la deteccion de celdas `bom_cell` y regiones de texto permite recortar la tabla y enviarla a un motor OCR especializado, separando la localizacion (YOLO) del reconocimiento (OCR).
- Control de calidad documental: verificacion de presencia de `frame` y `title_block` en cada lamina para detectar planos incompletos o mal escaneados antes de archivarlos.
- Indexacion de repositorios tecnicos: clasificacion y recorte de zonas de vistas y anotaciones de dimension para construir un indice buscable sobre planos ESKD/GOST.
- Asistencia a ingenieros de documentacion: resaltado automatico de tolerancias geometricas y rugosidades (`roughness`, `gdt_datum`) para revision visual, con umbral alto (0,9) en clases de baja fiabilidad como `view_detail`.
- Integracion en herramientas CAD/PLM: uso del detector como paso previo de un pipeline que extrae geometria estructurada de laminas rasterizadas.

## Benchmarks y rendimiento

Metricas sobre test sintetico (400 laminas), segun la model card:

| Tarea | Clases | Epocas | mAP50 | mAP50-95 | Estado |
|---|---:|---:|---:|---:|---|
| layout | 13 | 60/60 | 0,995 | 0,993 | listo |
| text | 20 | 80/80 | 0,991 | 0,927 | listo |
| arrows | 1 | 0/60 | no disponible | no disponible | entrenando |
| symbols | 5 | 0/80 | no disponible | no disponible | no iniciado |

Metricas detalladas de `text`: precision 0,9960, recall 0,9867, mAP50 0,9912, mAP50-95 0,9270. Clases con peor mAP50-95: `datum_letter` 0,853, `section_mark` 0,854, `gdt_datum` 0,861, `deviation` 0,869, `bom_cell` 0,889. Mejores: `hole_callout` 0,978, `dimension_note` 0,974, `roughness` 0,972.

Validacion en datos reales (sin ground truth, por tanto no es una medida de calidad): 54 laminas web tras autofiltro con `conf>=0,25`, detecciones en 53 laminas, 4011 objetos, mediana de confianza 0,849, los 20 clases presentes. En 58 imagenes reales: detecciones en 58/58, 2040 objetos, `title_block` conf media 0,975, `title_cell` 0,926, `view_detail` 0,659 (no fiable). Cinco laminas sin `frame` y tres sin `title_block`. Precision y recall reales no medidos.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Al ser un YOLO26s (variante pequena de la familia), la inferencia en fp16 a 1280-1536 px es viable en GPUs de consumo, pero el autor no publica cifras.
- GPU recomendadas: no especificadas. Por el tamano del modelo (variante "s") y la resolucion de entrada, una RTX 4090 o superior es razonable; A100/H100 para procesamiento por lotes de grandes volumenes de laminas.
- GPU de consumo: probablemente viable en RTX 3060/4060 o superiores, aunque sin confirmacion del autor.
- Despliegue: libreria Ultralytics (`ultralytics`), con `tools/infer.py` y `tools/prelabel.py` del repositorio. Exportacion a otros formatos (ONNX, TensorRT) no documentada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros detectores en la informacion proporcionada. Comparativa cualitativa:

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESKD-YOLO26 (este) | Deteccion de estructura de planos ESKD/GOST | no disponible (YOLO26s) | no aplica | AGPL-3.0 | Hugging Face, 17.302 descargas |
| YOLOv8/YOLO11 (Ultralytics) | Deteccion de objetos generica | variantes n/s/m/l/x | no aplica | AGPL-3.0 | Amplia, documentacion extensa |
| Detectores de layout documental (p. ej. LayoutLMv3, DiT) | Analisis de layout de documentos | cientos de millones | 512 tokens tipico | variable | Hugging Face |
| DocTR / PaddleOCR | Deteccion y reconocimiento de texto | variable | no aplica | Apache-2.0 / Apache-2.0 | Amplia |

La diferencia clave frente a detectores genericos es el dominio: clases especificas de ESKD/GOST que no existen en datasets genericos. Frente a soluciones de layout documental, este modelo no procesa lenguaje ni OCR, solo geometria.

## Limitaciones y advertencias

- Dominio sintetico: el entrenamiento se hizo sobre laminas sinteticas; los escaneos reales presentan un desplazamiento de distribucion no cuantificado.
- Sin OCR: no reconoce el contenido de texto ni de cajetines; solo localiza regiones.
- Confianza no calibrada: los umbrales publicados (0,6-0,7 general; 0,85 para `title_cell`; 0,9 para `view_detail`) son heuristicas hasta calibrar con 50-100 laminas reales.
- `view_detail` no fiable en datos reales (conf media 0,659): requiere revision manual.
- Clases de baja fiabilidad en sintetico: `datum_letter`, `section_mark`, `gdt_datum`, `deviation`, `bom_cell` (mAP50-95 por debajo de 0,89).
- Mascaras de segmentacion: las zonas sin poligono se representan como rectangulos.
- Licencia AGPL-3.0 de Ultralytics: impone obligaciones de copyleft de red; el uso comercial requiere revision legal (ver `docs/third-party.md`).
- Tareas `arrows` y `symbols` incompletas: no usar en produccion.
- Sin datos publicados de sesgos, alucinacion (no aplicable) ni rendimiento en idiomas distintos del ruso.
- Riesgo de falsos negativos: 5 laminas sin `frame` y 3 sin `title_block` en la validacion real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/p4ulbr4dl3y/eskd-yolo26
- Dataset: https://huggingface.co/datasets/p4ulbr4dl3y/eskd-drawings-yolo
- Repositorio de codigo y galeria: https://github.com/p4ulbr4dl3y/eskd-vision
- Galeria de ejemplos: https://github.com/p4ulbr4dl3y/eskd-vision/blob/main/docs/gallery.md
- Documentacion de terceros (licencia): `docs/third-party.md` en el repositorio
- Descripcion del dataset: `DATASET_CARD.md` en el repositorio
