# Lien-Feng/Lightweight-2-5D-LUNA16

## Resumen

Lightweight 2.5D LUNA16 es un detector de nodulos pulmonares en tomografias computarizadas (TC) desarrollado por Lien-Feng, basado en la arquitectura YOLO de Ultralytics. Es la implementacion de referencia del articulo "Inter-Slice Representation Outweighs Bounding-Box Supervision Extent in Lightweight 2.5D Pulmonary Nodule Detection: A Whole-Volume Benchmark on LUNA16" (MDPI Diagnostics, en revision). El modelo estudia dos decisiones de diseno en el entrenamiento de detectores con capacidad limitada: la representacion de entrada inter-corte y la extension espacial de la supervision de bounding boxes.

La arquitectura 2.5D apila tres cortes axiales adyacentes (S_z-1, S_z, S_z+1) como canales de entrada, frente a alternativas como el corte central replicado (2D) o la proyeccion de maxima intensidad (MIP). El entrenamiento se realiza sobre el dataset LUNA16 con validacion cruzada de 10 pliegues y evaluacion de volumen completo. El mejor resultado alcanza un CPM (Competition Performance Metric) de 0.7795 en la configuracion Exp3, superando la linea base 2D en +0.130 CPM con ventaja en los diez pliegues oficiales.

La relevancia del modelo reside en que demuestra que la representacion inter-corte domina sobre la supervision de bounding-boxes en detectores ligeros, y que el protocolo de evaluacion puede alterar significativamente las conclusiones experimentales. Incluye un repositorio completo con scripts de generacion de datos, entrenamiento, inferencia de volumen completo y evaluacion oficial, lo que facilita la reproducibilidad y el benchmarking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (Ultralytics) con entrada 2.5D de tres cortes adyacentes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por computador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (.pt, formato Ultralytics) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura YOLO de Ultralytics configurada como detector 2.5D. La entrada se construye apilando tres cortes axiales adyacentes (S_z-1, S_z, S_z+1) como los tres canales de la imagen, tras aplicar una ventana de densidad de [-1000, 400] unidades Hounsfield y reescalado a 8 bits. Se evaluan ademas dos representaciones alternativas: el corte central replicado en tres canales (2D) y la proyeccion de maxima intensidad (MIP) sobre el slab {z-1, z, z+1}. El entrenamiento se realiza sobre el dataset LUNA16 con los 10 pliegues oficiales de validacion cruzada; cada pliegue se evalua en el subset correspondiente y la seleccion de checkpoint se hace sobre un subset de validacion separado, de modo que ningun escaner de evaluacion influye en la seleccion del modelo.

Se entrenaron cuatro configuraciones (Exp1 a Exp4) que varian la representacion de entrada (2D, MIP, 2.5D) y la extension de la supervision de bounding-boxes (laxa vs estricta con radio 0.6). El estudio trata el protocolo de evaluacion como factor experimental: puntuar los mismos checkpoints solo sobre las 1.176 slices que contienen un centro de nodulo anotado (0.52 % del volumen) en lugar de las 227.225 slices totales revierte el resultado de supervision (-0.0209 a +0.0027), atenua el efecto de la representacion cuatro veces (+0.1297 a +0.0348) y eleva todos los CPM en 0.17-0.31. El evaluador reproduce exactamente los contadores publicados en el fichero de referencia oficial `CADAnalysis.txt` (TP 1120 / FP 548420 / ignorados 1294 / dobles detecciones 231).

## Capacidades

- Deteccion de nodulos pulmonares en tomografias computarizadas con bounding boxes.
- Inferencia de volumen completo: procesa todas las slices axiales de un escaner y genera un CSV de candidatos en formato LUNA16.
- Soporte de tres representaciones de entrada: corte central 2D, proyeccion de maxima intensidad (MIP) y apilado de cortes adyacentes 2.5D.
- Evaluacion con el evaluador oficial LUNA16, incluyendo coincidencia por distancia de centros, una candidatura por nodulo y gestion de hallazgos irrelevantes.
- Reproducibilidad del protocolo de evaluacion mediante scripts de referencia y tests de verificacion incluidos en el repositorio.
- Generacion de predicciones tanto sobre imagenes individuales (slice.png) como sobre volumenes completos (predict_scan.py).

## Casos de uso

- Screening de cancer de pulmon en TC de baja dosis: el modelo puede integrarse en sistemas de deteccion asistida por ordenador (CAD) para identificar nodulos en estudios de cribado, priorizando los casos que requieren revision radiologica.
- Triage de imagenes en hospitales con recursos limitados: al ser un detector ligero, puede desplegarse en estaciones de trabajo sin GPU dedicada o en infraestructura de bajo coste para el procesamiento previo de estudios TC.
- Investigacion de representaciones 2.5D: el repositorio incluye los scripts completos de generacion de datos y entrenamiento, lo que permite reproducir los experimentos y explorar variantes de apilado de cortes o ventanas de densidad.
- Validacion de protocolos de evaluacion: los scripts `examples/evaluate_submission.py` y `tests/test_evaluate.py` permiten puntuar cualquier CSV de candidatos con el evaluador oficial, lo que facilita comparaciones justas entre sistemas de deteccion.
- Formacion en CAD para radiologia: el repositorio documenta el protocolo de evaluacion de LUNA16 de forma precisa (PROTOCOL.md), lo que lo convierte en material didactico para cursos de imagen medica computacional.
- Benchmarking de detectores de nodulos: los checkpoints de los diez pliegues y las cuatro configuraciones permiten reproducir los resultados del estudio y comparar nuevas arquitecturas bajo las mismas condiciones de evaluacion.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con el protocolo oficial de LUNA16, inferencia de volumen completo y CPM (sensibilidad media en 0.125, 0.25, 0.5, 1, 2, 4 y 8 FP/escaneo) con intervalos de confianza por bootstrap sobre los 888 escaneres:

| Configuracion | CPM | IC inferior | IC superior | Candidatos/escaneo |
|---|---|---|---|---|
| Exp1: 2D corte central, supervision laxa | 0.6498 | 0.6181 | 0.6778 | 111.2 |
| Exp2: MIP de slab fino, supervision laxa | 0.5965 | 0.5703 | 0.6239 | 93.1 |
| Exp3: 2.5D cortes adyacentes, supervision laxa | 0.7795 | 0.7517 | 0.8005 | 80.2 |
| Exp4: 2.5D cortes adyacentes, supervision estricta (r=0.6) | 0.7586 | 0.7332 | 0.7821 | 83.0 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 0.7 GB, que incluye los checkpoints de las 10 pliegues y las 4 configuraciones (40 archivos .pt), el codigo fuente y los resultados.
- VRAM estimada para inferencia: no disponible en la informacion publicada. Dado que se trata de un detector YOLO ligero con entrada de 512x512 píxeles, es probable que se ejecute en GPUs de consumo (por ejemplo, RTX 3060 o superiores), pero no se aportan datos exactos.
- GPU recomendadas: no especificadas; la libreria Ultralytics soporta CPU, NVIDIA GPU y Apple Silicon (MPS).
- Opciones de despliegue: integracion nativa con Ultralytics, que permite exportacion a ONNX, TensorRT y OpenVINO; no aplica llama.cpp ni Ollama por ser un modelo de vision.
- Latencia y throughput: no disponible en la informacion publicada.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de benchmarks de modelos alternativos sobre LUNA16. Se identifican dos enfoques comparables en la literatura reciente:

| Modelo | Enfoque | Datos de rendimiento disponibles |
|---|---|---|
| Lightweight 2.5D LUNA16 (este modelo) | YOLO 2.5D con apilado de cortes adyacentes | CPM 0.7795 (Exp3) |
| MEDA-YOLO | YOLO ligero con fusion de bordes multi-escala | no disponible en la informacion consultada |
| LUNA16-Attention-PVTFormer |
