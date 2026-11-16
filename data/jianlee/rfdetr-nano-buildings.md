# jianlee/rfdetr-nano-buildings

## Resumen

RF-DETR Nano Buildings es un detector de objetos de una sola clase (`building`) obtenido mediante fine-tuning del modelo RF-DETR Nano de Roboflow sobre el conjunto de datos SpaceNet 2 de Jartum (AOI 5), y exportado a ONNX para inferencia en CPU. Forma parte del proyecto geo-pipeline, una herramienta de procesamiento geoespacial del mismo autor, y cubre la ruta de detección sin dependencia de PyTorch. El modelo base RF-DETR es un detector transformer con arquitectura DETR (prediccion de conjuntos con queries aprendidas), y esta variante Nano es la mas pequena de la familia.

El modelo resuelve la deteccion de edificios en imagenes aereas y satelitales. Su interes practico esta en el compromiso entre coste y precision: segun la model card, es 1,9 veces mas rapido que un RF-DETR Small afinado y conserva el 90 % de su mAP@.5, con un rendimiento de 0,596 mAP@.5 sobre 30 teselas de validacion de SpaceNet Jartum. No obstante, el propio autor advierte de que es mas lento que los modelos YOLOX del mismo proyecto, por lo que debe elegirse cuando se quiera un detector transformer con coste contenido, no el mas rapido disponible.

El repositorio ocupa aproximadamente 0,1 GB y contiene un unico fichero ONNX con entrada fija de 384x384 pixeles. La licencia es CC BY-SA 4.0, heredada de los datos de entrenamiento SpaceNet, mientras que el modelo base RF-DETR se distribuye bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer detector tipo DETR (RF-DETR Nano, prediccion de conjuntos con queries) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 1x3x384x384) |
| Tipos de cuantizacion | no disponible (solo se publica el ONNX en float32) |
| Idiomas soportados | no aplica (deteccion de objetos, sin procesamiento de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`rfdetr_nano_buildings.onnx`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura RF-DETR, un detector basado en transformers con formulacion DETR: un backbone visual extrae caracteristicas y un decodificador transformer genera un conjunto fijo de predicciones mediante queries, evitando componentes como NMS en el diseno original. La variante Nano es la de menor capacidad de la familia RF-DETR. La entrada es una imagen RGB de 384x384 en float32, redimensionada de forma bilineal a un cuadrado y normalizada con media y desviacion tipica de ImageNet. La salida consta de dos tensores: `dets` (`1x300x4`, con centro x, centro y, ancho y alto normalizados) y `labels` (`1x300x2`, logits para `building` y una ranura de no-objeto sin uso). La decodificacion toma las 300 puntuaciones sigmoideas superiores sobre query y clase.

El entrenamiento parte del checkpoint COCO `rf-detr-nano.pth` y utiliza el entrenador propio de RF-DETR con una sola clase, entrada de 384 px, 30 epocas, tasa de aprendizaje 1e-4 y 240 teselas de entrenamiento de SpaceNet 2 Jartum (AOI 5). El proceso se realizo en el commit `abeb4d1574bf1f3e3a561c52455ac803f9d49f8e` de geo-pipeline mediante los comandos `make train-rfdetr VARIANT=Nano` y `make export-rfdetr RUN=rfdetr-spacenet-nano VARIANT=Nano`. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector de objetos. Tampoco se detalla el numero total de tokens o imagenes de entrenamiento mas alla de las 240 teselas.

## Capacidades

- Deteccion de objetos de una unica clase (`building`) en imagenes aereas y satelitales de alta resolucion.
- Salida de hasta 300 cajas delimitadoras con puntuaciones de confianza, en formato normalizado centro-ancho-alto.
- Inferencia en CPU mediante ONNX Runtime, sin dependencia de PyTorch.
- Integracion en el pipeline geo-pipeline como detector intercambiable (decoder `rfdetr`, clase `building`).
- Procesamiento por teselas: la entrada fija de 384x384 implica dividir imagenes grandes en recortes.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al ser un modelo puramente visual.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion.

## Casos de uso

- Inventario de edificios a escala regional: el modelo se aplica sobre teselas de 640 px de imagenes satelitales para generar capas vectoriales de huellas de edificios, util para planificacion urbana o actualizacion de cartografia. Su coste de 0,43 s por imagen de cuatro teselas en CPU lo hace viable en servidores sin GPU.
- Despliegue en entornos sin GPU: gracias a la exportacion ONNX y a la inferencia en CPU con ONNX Runtime, puede ejecutarse en contenedores ligeros o maquinas de bajos recursos donde no se dispone de aceleradores.
- Analisis de cambios y monitorizacion: al ser rapido y determinista, permite procesar series temporales de imagenes de una misma zona para detectar nuevas construcciones, comparando las detecciones entre fechas.
- Evaluacion de danos tras desastres: la deteccion de edificios en imagenes post-evento, combinada con una linea base previa, ayuda a estimar areas afectadas, siempre con validacion humana independiente.
- Prototipado e investigacion en teledeteccion: sirve como detector transformer ligero de referencia para experimentos academicos o comparativas con detectores CNN como YOLOX.
- Integracion en pipelines de datos geoespaciales: se puede encadenar con herramientas de teselado, georreferenciacion y exportacion a formatos SIG dentro de geo-pipeline, automatizando la generacion de capas de edificios.
- Filtrado previo en flujos de anotacion: las detecciones de alta confianza pueden precargarse en herramientas de etiquetado para reducir el trabajo manual, dado su F1@.5 de 0,602.

## Benchmarks y rendimiento

Resultados sobre 30 teselas reservadas de SpaceNet Jartum (510 edificios), teselas de 640 px, CPU y ONNX Runtime. La columna "s/imagen" corresponde al tiempo de un modelo sobre una imagen de 650 px, que equivale a cuatro teselas.

| Modelo | mAP@.5 | F1@.5 | s/imagen, 4 hilos | s/imagen, 1 hilo |
|---|---|---|---|---|
| rfdetr-nano-buildings | 0,596 | 0,602 | 0,43 | 1,29 |
| rfdetr-buildings (RF-DETR Small, comparacion) | 0,659 | 0,642 | 0,84 | 2,55 |

El criterio de aceptacion fijado por el autor era alcanzar al menos el 90 % del mAP@.5 del RF-DETR Small afinado y ser al menos 1,5 veces mas rapido; el modelo cumple ambos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que no es un modelo de lenguaje. Tampoco se aportan metricas frente a los modelos YOLOX del proyecto mas alla de la afirmacion cualitativa de que estos son mas rapidos.

## Requisitos de hardware

- VRAM estimada: no aplica en la ruta principal, ya que el modelo esta pensado para CPU. Para ejecucion en GPU mediante ONNX Runtime, el fichero de 0,1 GB en float32 requiere un consumo de memoria minimo, inferior a 1 GB, aunque el dato exacto no esta publicado.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime o CUDA seria suficiente por el reducido tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna, e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (ruta documentada, con `make up-slim` y `DETECTOR_MODELS=stub,rfdetr-nano-buildings`), o carga manual en la pestana Train de geo-pipeline con decoder `rfdetr` y clase `building`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,43 s por imagen de 650 px (cuatro teselas) con 4 hilos y 1,29 s con 1 hilo en CPU; aproximadamente 2,3 imagenes/s y 0,78 imagenes/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rfdetr-nano-buildings | no disponible | 384x384 fija | 0,596 mAP@.5; 0,43 s/imagen (4 hilos) | CC BY-SA 4.0 | Hugging Face, ONNX |
| rfdetr-buildings (RF-DETR Small afinado) | no disponible | no disponible | 0,659 mAP@.5; 0,84 s/imagen (4 hilos) | CC BY-SA 4.0 (derivada de SpaceNet) | Mismo proyecto geo-pipeline |
| Modelos YOLOX del proyecto geo-pipeline | no disponible | no disponible | Mas rapidos que RF-DETR Nano segun el autor; metricas no publicadas en la informacion disponible | no disponible | Mismo proyecto geo-pipeline |
| RF-DETR Nano base (Roboflow) | no disponible | no disponible | Entrenado en COCO; metricas no incluidas en la informacion disponible | Apache 2.0 | Hugging Face / Roboflow |

La comparacion se limita a los modelos citados en la model card y en el ecosistema del proyecto. No se dispone de datos de otros detectores de edificios comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Generalizacion limitada: entrenado con una sola ciudad (Jartum), 240 teselas y una unica ejecucion; los resultados no demuestran comportamiento en otras ciudades, sensores o resoluciones.
- Cajas alineadas a los ejes: las etiquetas son cajas axis-aligned derivadas de huellas de edificios, por lo que los edificios rotados quedan sobrestimados y los edificios pequenos y pegados son dificiles de separar (recall a IoU 0,5 de 0,58).
- Riesgo de falsos positivos y negativos en zonas con edificios densos o de geometria irregular; requiere validacion independiente antes de cualquier uso operativo.
- No debe emplearse para decisiones sobre personas o propiedades sin validacion independiente, tal como advierte el autor.
- Licencia CC BY-SA 4.0: impone atribucion y compartir-al-igual; las obras derivadas deben distribuirse bajo la misma licencia, lo que puede condicionar el uso comercial cerrado.
- Atribucion obligatoria a SpaceNet (datos de entrenamiento) y a Roboflow (modelo base RF-DETR, Apache 2.0).
- Entrada fija de 384x384: imagenes de mayor resolucion deben teselarse, lo que introduce artefactos en los bordes de tesela y perdida de detalle en edificios pequenos.
- Sesgos conocidos: no se documentan analisis de sesgo por tipo de tejido urbano, iluminacion o estacion del ano; la unica zona de entrenamiento limita la diversidad de condiciones.
- Sin cuantizaciones publicadas: solo se ofrece el ONNX en float32, lo que limita optimizaciones adicionales de latencia en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jianlee/rfdetr-nano-buildings
- Repositorio geo-pipeline: https://github.com/leejianrong/geo-pipeline
- Codigo de decodificacion ONNX: https://github.com/leejianrong/geo-pipeline/blob/main/libs/geopipe/src/geopipe/rfdetr_onnx.py
- Informe de benchmarks: https://github.com/leejianrong/geo-pipeline/blob/main/docs/benchmarks/lightweight-detector.md
- Modelo base RF-DETR (Roboflow): https://huggingface.co/roboflow/rf-detr
- Dataset SpaceNet: https://spacenet.ai/datasets/
