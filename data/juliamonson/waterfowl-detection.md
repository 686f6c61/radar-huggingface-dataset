# juliamonson/waterfowl-detection

## Resumen

Waterfowl Detection es un repositorio de investigación que agrupa ocho modelos de detección de aves acuáticas en imágenes aéreas de dron (UAV), desarrollado por la usuaria de Hugging Face juliamonson. No se trata de un único modelo fundacional, sino de un banco de comparación reproducible que entrena y evalúa cinco familias de detectores sobre un corpus común de imágenes aéreas de aves: Faster R-CNN (Detectron2), YOLO-NAS, YOLOv5, YOLO11, YOLO26 y tres variantes de MegaDetector-Overhead (OWL-C, OWL-T y OWL-D). El objetivo es medir de forma homogénea el rendimiento de estos detectores bajo un mismo protocolo (mAP30 con IoU = 0,30) sobre recortes COCO de 512×512 píxeles.

El repositorio incluye la infraestructura completa: un pipeline de preparación de datos (`pipeline/`), una interfaz de terminal (`waterfowl_detection.sh`) para importar imágenes, entrenar, evaluar, contar aves y exportar informes, y baselines zero-shot de cada checkpoint preentrenado antes del ajuste fino. Los pesos y artefactos de evaluación se alojan en repositorios separados del Hub, mientras que el repositorio principal ocupa 1,0 GB y contiene los resultados de cada ejecución bajo `output/`.

Es relevante para investigadores en visión por computador aplicada a fauna y en teledetección con UAV, porque ofrece una comparación controlada entre detectores basados en cajas y un detector basado en puntos (MegaDetector-Overhead), con datos reales de censos aéreos de aves acuáticas y metadatos medidos sobre altitud de vuelo, especie, hábitat y meteorología. No hay información sobre parámetros, contexto ni licencia en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de detectores: Faster R-CNN (Detectron2), YOLO-NAS (super-gradients), YOLOv5, YOLO11, YOLO26 (Ultralytics) y MegaDetector-Overhead OWL-C (DLA-34), OWL-T (DLA-34 + Swin), OWL-D (DINOv3 ViT-H+) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelos de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints `.pth`/`.pt` en el repositorio `juliamonson/waterfowl-uav-checkpoints`; resultados en `output/` |
| Resolucion de entrada | 512×512 píxeles (recortes COCO) |
| Protocolo de evaluacion | mAP30 (IoU = 0,30) para detectores de cajas; precisión/recall/F1 nativo y mAP30 "pseudo-box" para el detector de puntos |
| Entorno de ejecucion | Python 3.11 separado para MegaDetector-Overhead (DINOv3 vendorizado, incompatible con detectron2/super-gradients/ultralytics) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura única, sino que entrena y evalúa ocho configuraciones sobre un mismo conjunto de recortes de 512×512 píxeles generados una sola vez desde el corpus original. Los cuatro primeros grupos (Faster R-CNN, YOLO-NAS, YOLOv5, YOLO11/YOLO26) son detectores de cajas evaluados con mAP30 e IoU = 0,30. YOLO26 se describe como end-to-end (sin NMS). Los modelos Ultralytics comparten un espejo de los recortes en formato YOLO, mientras que MegaDetector-Overhead usa un espejo en formato CSV de puntos.

MegaDetector-Overhead (antes "OWL", Overhead Wildlife Locator) es un detector de puntos de Microsoft AI for Good: localiza cada ave como un punto en lugar de una caja, por lo que no puede usar directamente el protocolo mAP30 basado en IoU de cajas y se evalúa con precisión, recall y F1 nativos, además de un mAP30 "pseudo-box" de puente. Cada modelo se puntúa también como checkpoint preentrenado antes del ajuste fino, de modo que cada resultado tiene un "antes" documentado. Los datos provienen de diez subconjuntos de imágenes aéreas (`Bird_A`–`Bird_J`) alojados en el dataset `juliamonson/waterfowl-uav`; la model card no detalla el número de tokens ni de iteraciones de entrenamiento, ni si hubo RLHF/DPO (no aplicable a detección).

La gestión de datos se centraliza en `data_prep/config.py`: elegir una carpeta (`DATASET_FOLDER`) determina qué datos usan los ocho modelos sin cambiar código. El inventario del dataset registra cobertura medida de metadatos: altitud de vuelo al 100 % (14–150 m), especie y sexo en Bird_H y Bird_I (7,4 % de las aves), hábitat en G, H y J (27 % de las imágenes), meteorología en G y J, fecha y sitio en el 67 % de las imágenes, y cámara y GPS en el 9 %. No hay etiquetas de señuelo frente a ave real, condiciones ambientales más allá de sol/nube, identidad del observador ni comportamiento.

## Capacidades

- Detección de aves acuáticas en imágenes aéreas de dron mediante cajas delimitadoras (Faster R-CNN, YOLO-NAS, YOLOv5, YOLO11, YOLO26).
- Detección de aves como puntos (MegaDetector-Overhead en variantes OWL-C, OWL-T y OWL-D).
- Conteo automático de aves en nuevas fotografías de censo.
- Revisión y corrección manual de conteos ave por ave a través de la interfaz de terminal.
- Exportación de informes de conteo, etiquetas corregidas y comparaciones entre modelos.
- Entrenamiento y evaluación reproducibles de los ocho modelos con un protocolo común.
- Evaluación zero-shot de cada checkpoint preentrenado como baseline documentado.
- Análisis de subgrupos condicionados por covariables disponibles (altitud de vuelo como única covariable con cobertura suficiente para todo el corpus).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un conjunto de modelos de visión por computador.

## Casos de uso

- Censos aéreos de aves acuáticas: el pipeline cuenta aves en fotografías de dron de censos reales, sustituyendo el conteo manual y aprovechando la cobertura del 100 % en altitud de vuelo (14–150 m) para estratificar resultados por altura.
- Monitorización de humedales y reservas: los modelos detectan aves en imágenes de los subconjuntos con hábitat etiquetado (Bird_G, Bird_H, Bird_J, 27 % de las imágenes), lo que permite análisis acotados por tipo de hábitat.
- Selección de detector para producción: la comparación head-to-head de ocho modelos bajo el mismo protocolo mAP30 permite elegir el detector con mejor relación precisión/coste para un despliegue concreto, con baselines zero-shot documentados.
- Investigación en teledetección con UAV: el repositorio ofrece recortes de 512×512, layouts COCO/YOLO/CSV de puntos y un inventario medido de metadatos, reutilizable para experimentos de detección de fauna en imágenes aéreas.
- Flujos de anotación asistida: la interfaz de terminal permite revisar y corregir conteos bird by bird y exportar etiquetas corregidas, útiles para generar datos de entrenamiento adicionales.
- Análisis de sensibilidad a la altitud: al ser la altitud la única covariable con cobertura completa, el corpus permite estudiar cómo varía la detección según la altura de vuelo del dron.
- Comparación metodológica cajas frente a puntos: la doble evaluación de MegaDetector-Overhead (F1 nativo y mAP30 pseudo-box) sirve para investigar la equivalencia entre paradigmas de detección.

## Benchmarks y rendimiento

La model card indica que los números head-to-head de los ocho modelos están en la sección "Results" del repositorio, pero esa sección no se incluye en la información disponible. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; la variante OWL-D usa un backbone DINOv3 ViT-H+, lo que en la práctica exige GPUs de gama alta (A100/H100) para entrenamiento, aunque este dato no se confirma en la model card.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio se ejecuta mediante `./waterfowl_detection.sh` y comandos del pipeline (`python -m pipeline.cli prepare --mirrors`, `coverage`); MegaDetector-Overhead requiere un intérprete Python 3.11 separado. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a detección).
- Latencia y throughput: no disponibles.
- Almacenamiento: repositorio de 1,0 GB; el dataset completo se descarga aparte con `hf download juliamonson/waterfowl-uav --repo-type dataset`; la caché de detecciones de análisis ocupa unos 68 MB y es regenerable.

## Comparativa con modelos similares

| Modelo | Tipo | Paradigma | Evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Waterfowl Detection (este repo) | Banco de 8 detectores | Cajas y puntos | mAP30 (IoU 0,30) y F1 nativo | no disponible | Hugging Face (repo + checkpoints + dataset) |
| MegaDetector (Microsoft AI for Good) | Detector de fauna genérico | Cajas | métricas propias de MegaDetector | no disponible en esta ficha | público |
| YOLO11 / YOLO26 (Ultralytics) | Detectores generales | Cajas | mAP COCO | licencia Ultralytics (no verificada aquí) | público |
| Faster R-CNN (Detectron2) | Detector general | Cajas | mAP COCO | licencia Detectron2 (no verificada aquí) | público |

La comparación directa de rendimiento entre estos modelos en el corpus de aves acuáticas no está disponible en la información proporcionada; la model card remite a su sección "Results", no incluida.

## Limitaciones y advertencias

- No se especifica licencia: no se puede confirmar el uso comercial sin consultar al autor.
- No hay información sobre sesgos; el corpus procede de diez subconjuntos con metadatos muy desiguales (especie y sexo solo en el 7,4 % de las aves; cámara y GPS en el 9 % de las imágenes), lo que puede inducir sesgos por identidad de subconjunto.
- El corpus no distingue señuelos de aves reales, lo que puede inflar o distorsionar conteos en escenarios de caza o conservación.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos en la detección; no se publican tasas de error en la información disponible.
- MegaDetector-Overhead requiere un entorno Python 3.11 separado e incompatible con el stack de detectron2/super-gradients/ultralytics, lo que complica el despliegue unificado.
- La model card documenta dos bugs de carga corregidos (imágenes de Bird_B y Bird_C omitidas por nombrado de etiquetas: 140 imágenes y 3.138 aves saltadas sin error), lo que advierte sobre la robustez del pipeline de datos.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni idiomas; madurez y soporte comunitario no verificables.
- No hay datos de latencia, throughput ni VRAM, lo que impide planificar producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juliamonson/waterfowl-detection
- Dataset de imágenes aéreas: https://huggingface.co/datasets/juliamonson/waterfowl-uav
- Checkpoints entrenados: https://huggingface.co/juliamonson/waterfowl-uav-checkpoints
- Manual de usuario: WATERFOWL_DETECTION_MANUAL.md (en el repositorio)
- Notas de diseño del workbench: workbench/README.md (en el repositorio)
- Inventario del dataset: dataset_full/DATASET_INVENTORY.md (en el repositorio)
