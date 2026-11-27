# dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-rsb-1x

## Resumen

El modelo `dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-rsb-1x` es un detector de objetos Faster R-CNN con backbone ResNet-50 y cuello FPN, entrenado sobre el conjunto de datos BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo de lenguaje: es un checkpoint de vision por computador publicado como espejo (mirror) de un modelo del zoo de modelos de SysCV (ETH Zurich), cuyo servidor original `dl.cv.ethz.ch` esta fuera de linea. Los pesos se recuperaron de la Wayback Machine (captura del 19 de febrero de 2025) y el repositorio anade un entorno de dependencias fijado y un script de inferencia.

El modelo resuelve la tarea de deteccion de objetos en imagenes de trafico rodado, con diez categorias propias de BDD100K (peatón, ciclista, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico). Su relevancia practica radica en que reproduce un checkpoint de referencia para la tarea de deteccion de BDD100K que ya no era facilmente accesible, con verificacion de pesos (MD5 coincidente) y de predicciones frente a las salidas publicadas por SysCV.

Tecnicamente, se trata de un detector de dos etapas con 41.447.426 parametros, entrada nativa de 1280 x 720 (sin reescalado), y un procedimiento de entrenamiento basado en "ResNet Strikes Back" (RSB). El modelo declara un box AP de 31,4 en el split de validacion de BDD100K, con un AP50 de 56,9. La licencia heredada de BDD100K restringe el uso a fines educativos, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone ResNet-50 y cuello FPN (Feature Pyramid Network) |
| Parametros totales | 41.447.426 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors y `.pth` en precision original) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | bdd100k (educational, research and not-for-profit use); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth`; configuracion en `config.py` / `original_config.py` |
| Libreria | mmdetection 2.28.2 (mmcv-full 1.7.2, torch 2.0.1, Python 3.10) |
| Tamano del repositorio | 0.5 GB |
| Entrada nativa | 1280 x 720, RGB, normalizacion ImageNet (mean/std) |
| Umbral de score en evaluacion | 0.05; NMS con IoU 0.5; maximo 100 cajas por imagen |
| Latencia declarada | 1,6 s/imagen en 8 hilos de CPU |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de Faster R-CNN: un backbone convolucional ResNet-50 inicializado con pesos de ImageNet (checkpoint `resnet50_8xb256-rsb-a1-600e_in1k` de mmclassification) extrae caracteristicas, un FPN construye una piramide multiescala, una region proposal network (RPN) genera propuestas y una cabeza de deteccion de dos etapas clasifica y refina las cajas. La entrada se procesa a la resolucion nativa de BDD100K (1280 x 720) sin reescalado, lo que preserva la escala real de los objetos pequenos en escenas de conduccion.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 12 epocas (protocolo 1x), con AdamW, learning rate 0,0002, weight decay 0,05, decaimiento de learning rate en las epocas 8 y 11, y batch de 32 (8 GPUs x 4 imagenes). El procedimiento de entrenamiento sigue la receta "ResNet Strikes Back" (RSB, Wightman et al., 2021), que mejora el entrenamiento de ResNet frente a recetas clasicas. No se declara uso de RLHF, DPO ni tecnicas de decodificacion especulativa, por tratarse de un modelo discriminativo de vision.

Una innovacion destacable del repositorio no es arquitectonica sino de reproducibilidad: la recuperacion de pesos desde la Wayback Machine, la verificacion MD5 contra el fichero original de SysCV, y una comprobacion empirica de equivalencia de predicciones (789 de 791 cajas identicas en 20 imagenes de validacion, 791 con IoU >= 0,5, diferencia maxima de score de 0,0517).

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion (10 clases de BDD100K).
- Deteccion en video: el script `infer.py` acepta ficheros de video y webcam, con salida en formato BDD100K (`--json`).
- Procesamiento por lotes de imagenes o carpetas de imagenes.
- Umbral de score configurable (`--score-thr`, por defecto 0,3) y limite de fotogramas (`--max-frames`).
- Inferencia en CPU y en GPU NVIDIA (entornos separados `requirements-cpu.txt` y `requirements-cu118.txt`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual y discriminativo.
- No dispone de modo "thinking", vision-language, audio ni generacion de texto.

## Casos de uso

- Deteccion de peatones y vehiculos en imagenes de trafico: el modelo identifica las diez clases de BDD100K con AP por clase declarado (por ejemplo, coche 50,1 AP, autobus 46,4 AP), adecuado para analisis de escenas urbanas y rurales.
- Analisis de video de dashcam: `infer.py` procesa ficheros de video y webcam y emite detecciones en formato BDD100K, util para anotacion asistida o auditoria de grabaciones.
- Preetiquetado para anotacion: dado su AP de 31,4 en validacion, puede generar propuestas iniciales que un anotador humano revise, reduciendo coste en la construccion de nuevos datasets de conduccion.
- Investigacion en deteccion de objetos: sirve como baseline reproducible para comparar nuevas arquitecturas o recetas de entrenamiento sobre BDD100K, con pesos verificados y configuracion fijada.
- Evaluacion de robustez dia/noche: el repositorio incluye una demo con clips diurnos y nocturnos de validacion, lo que permite estudiar el comportamiento del detector en condiciones de iluminacion distintas.
- Reproduccion de resultados academicos: al conservar `original/` con las predicciones y scores de SysCV, permite replicar y auditar los numeros publicados sin depender del servidor original.
- Despliegue en entornos sin GPU: la latencia declarada de 1,6 s/imagen en 8 hilos de CPU hace viable su uso en estaciones de trabajo sin acelerador para procesamiento por lotes no critico en tiempo real.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de score de SysCV), box AP estilo COCO sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 31,4 | 56,9 | 29,4 | 14,9 | 36,7 | 52,2 |
| test | 30,3 | 54,5 | 28,9 | 15,0 | 36,4 | 47,2 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 34,2 |
| rider | 26,7 |
| car | 50,1 |
| truck | 43,7 |
| bus | 46,4 |
| train | 1,6 |
| motorcycle | 23,3 |
| bicycle | 24,9 |
| traffic light | 24,7 |
| traffic sign | 38,3 |

Nota: la metrica de la model-index (mAP = 31,4) figura como `verified: false` en la propia model card; los valores proceden de la documentacion de SysCV, no de una reevaluacion independiente.

## Requisitos de hardware

- VRAM estimada: no declarada en la informacion disponible. Con 41,4 M de parametros y entrada de 1280 x 720, la huella de pesos en FP32 ronda los 165 MB; la VRAM total depende del batch y de las activaciones del FPN a alta resolucion.
- GPU recomendadas: no se especifican modelos concretos; el repositorio proporciona un entorno con CUDA 11.8 (`requirements-cu118.txt`) y declara que el entorno CUDA "no ha sido probado todavia".
- GPU de consumo: no se confirma compatibilidad con tarjetas consumer; el checkpoint se ha validado en CPU (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2).
- Opciones de despliegue: mmdetection 2.x (unica via soportada por la configuracion); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia declarada: 1,6 s/imagen en 8 hilos de CPU con umbral de score 0,05 y NMS IoU 0,5.
- Throughput: no disponible.

## Comparativa con modelos similares

No se proporcionan en la informacion disponible datos de otros detectores sobre BDD100K para establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Entrada | AP (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN R50-FPN RSB 1x) | 41,4 M | 1280 x 720 | 31,4 | bdd100k (uso no comercial) | Hugging Face (espejo) |
| Otros detectores del zoo de SysCV | no disponible | no disponible | no disponible | no disponible | servidor original fuera de linea |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia, limitada a uso educativo, de investigacion y sin animo de lucro. El uso comercial requiere revisar los terminos de BDD100K.
- Clase "train" practicamente inutil: AP de 1,6, muy por debajo del resto de categorias; no debe usarse para deteccion fiable de trenes.
- Rendimiento modesto en objetos pequenos: APs de 14,9 en validacion, lo que limita su uso en escenas con objetos lejanos o de baja resolucion.
- AP global de 31,4: adecuado como baseline de investigacion, pero insuficiente para sistemas de seguridad critica o conduccion autonoma en produccion.
- Verificacion incompleta: la equivalencia con las predicciones originales es "cercana, no exacta" (789 de 791 cajas identicas, diferencia maxima de score 0,0517, causa no investigada); el entorno CUDA no ha sido probado.
- Dependencias antiguas y fragiles: requiere mmdetection 2.28.2, mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10, con un entorno virtual nuevo; la actualizacion a mmdetection 3.x no esta soportada por la configuracion.
- Sesgos del dataset: BDD100K tiene una distribucion geografica y de condiciones meteorologicas concreta; el modelo puede degradarse en escenas no representadas (clima extremo, paises no cubiertos).
- Riesgo de falsos positivos y negativos en umbrales bajos: el umbral por defecto del script (0,3) difiere del usado en evaluacion (0,05), por lo que las detecciones mostradas no coinciden con las metricas reportadas.
- Sin capacidades de texto ni multilingues: no es un modelo de lenguaje y no debe evaluarse como tal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-rsb-1x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-rsb-1x/blob/main/LICENSE.txt
- Zoo de modelos de SysCV (BDD100K, deteccion): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_r50_fpn_rsb_1x_det_bdd100k.py
- Paper del metodo (ResNet Strikes Back): https://arxiv.org/abs/2110.00476
- Pesos de inicializacion ImageNet (mmclassification): https://download.openmmlab.com/mmclassification/v0/resnet/resnet50_8xb256-rsb-a1-600e_in1k_20211228-20e21305.pth
- Dataset BDD100K (paper CVPR 2020): https://arxiv.org/abs/1805.04687
- Dataset en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
