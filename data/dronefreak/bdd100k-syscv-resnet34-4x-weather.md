# dronefreak/bdd100k-syscv-resnet34-4x-weather

## Resumen

`dronefreak/bdd100k-syscv-resnet34-4x-weather` es un clasificador de imagen basado en ResNet-34 que asigna a cada fotograma una etiqueta meteorologica entre siete clases: rainy, snowy, clear, overcast, undefined, partly cloudy y foggy. No es un modelo de lenguaje ni un modelo generativo: es un cabezal de etiquetado (tagging) entrenado sobre BDD100K, el conjunto de escenas de conduccion autonomo de Berkeley DeepDrive. El checkpoint original procede del model zoo de SysCV (ETH Zurich), cuyo host `dl.cv.ethz.ch` esta caido; este repositorio es un espejo que recupera los pesos desde la Wayback Machine y anade un entorno fijado y un script de inferencia.

El modelo resuelve un problema acotado pero critico en pipelines de conduccion autonoma: el etiquetado automatico de condiciones meteorologicas por fotograma, necesario para estratificar datasets, activar modos de percepcion dependientes del clima o auditar la cobertura de escenas adversas. Con 21,3 millones de parametros y un backbone ResNet-34 sin preentrenamiento, es deliberadamente ligero y rapido (0,008 s/imagen en una RTX 4070 SUPER incluyendo decodificacion JPEG).

Su relevancia actual es de infraestructura mas que de investigacion: preserva unos pesos que ya no estaban disponibles publicamente y garantiza reproducibilidad exacta (misma etiqueta que las predicciones publicadas por SysCV en las 10.000 imagenes de validacion, con diferencias de score inferiores a 2e-06). La licencia BDD100K restringe el uso a fines educativos, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-34 (CNN con conexiones residuales) + LinearClsHead, framework mmcls |
| Parametros totales | 21.305.287 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada de 640 x 640 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth` en precision original) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BDD100K (educational, research, not-for-profit); config de SysCV bajo Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), `.pth` original, `config.json` |

## Arquitectura y entrenamiento

ResNet-34 clasico con bloques residuales basicos y un cabezal lineal (`LinearClsHead`) sobre 7 clases. La entrada es un recorte central de 640 x 640 pixeles de la imagen a resolucion completa, sin redimensionado, con normalizacion ImageNet (media y desviacion tipica). El backbone se inicializa sin pesos preentrenados segun la config de SysCV.

El entrenamiento usa las 70.000 imagenes de train de BDD100K durante 48 epocas (la variante "4x" del zoo), con SGD (lr 0,1, momentum 0,9, weight decay 0,0001), decaimiento de learning rate en las epocas 24 y 36, batch de 48 (4 GPU x 12 imagenes) y aumentacion consistente en recortes aleatorios de 640 x 640 y volteo horizontal. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa; es un clasificador supervisado convencional. La innovacion practica del repositorio es la verificacion de integridad: MD5 de los pesos coincidente con el original de SysCV, carga de todas las claves en la config original y comparacion exacta contra las predicciones de validacion archivadas.

## Capacidades

- Clasificacion de imagen en 7 clases meteorologicas: rainy, snowy, clear, overcast, undefined, partly cloudy, foggy.
- Salida de etiqueta unica por imagen o fotograma, con scores por clase mediante `--json`.
- Inferencia sobre imagen suelta, carpeta de imagenes, fichero de video o webcam (`infer.py image.jpg`, `infer.py drive.mov`, `infer.py 0 --show`).
- Procesamiento por lotes con limite configurable de fotogramas (`--max-frames N`).
- Ejecucion en GPU (CUDA 11.8) y en CPU (entorno separado, 8 hilos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues, de vision general, audio ni modo "thinking": es un etiquetador cerrado de una sola tarea.

## Casos de uso

- Etiquetado automatico de datasets de conduccion: clasificar decenas de miles de fotogramas de dashcam por clima para estratificar conjuntos de entrenamiento y medir la proporcion de escenas adversas (lluvia, nieve, niebla) antes de entrenar modelos de percepcion.
- Filtrado y curacion de clips: dado un video largo, extraer los fotogramas con etiqueta `rainy` o `snowy` para revisarlos manualmente, reduciendo el coste de anotacion.
- Activacion condicional de modulos de percepcion: usar la etiqueta meteorologica como senal para conmutar preprocesado (por ejemplo, realce de contraste en niebla) o umbrales de deteccion en un pipeline de conduccion autonoma.
- Auditoria de cobertura de benchmarks: comprobar si un conjunto de evaluacion contiene suficiente variedad climatica y detectar sesgos hacia condiciones `clear`.
- Control de calidad en ingesta de datos: descartar o marcar fotogramas con etiqueta `undefined` (clase mayoritaria en precision/recall macro bajos) para revision humana.
- Prototipado rapido en hardware modesto: al ejecutarse a 0,008 s/imagen en una RTX 4070 SUPER y funcionar en CPU, sirve para demos, pruebas de integracion en CI o validacion local sin GPU dedicada.
- Reproducibilidad de resultados academicos: al ser un espejo verificado del checkpoint de SysCV, permite reproducir exactamente las predicciones publicadas en trabajos que citen ese model zoo.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de score de SysCV, no verificados de forma independiente por el hub):

| Split | Top-1 accuracy | Precision (macro) | Recall (macro) | F1 (macro) |
|---|---|---|---|---|
| val | 81,48 % | 67,96 % | 63,65 % | 65,19 % |
| test | 81,05 % | 69,90 % | 64,17 % | 66,29 % |

Las metricas macro se calculan sobre las 7 clases, incluida `undefined`, lo que explica la brecha entre accuracy y F1. No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia (21,3 M de parametros en precision original mas activaciones de un recorte 640 x 640); el repo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA 11.8; validado en RTX 4070 SUPER. No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: RTX 3060, 4060, 4070, 4090 y similares; tambien en GPUs de gama baja con suficiente memoria.
- Despliegue: script `infer.py` con entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10) via `uv`; variantes `requirements-cu118.txt` y `requirements-cpu.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de vision).
- Latencia y throughput: 0,008 s/imagen en RTX 4070 SUPER incluyendo decodificacion JPEG (unas 125 imagenes/s); 0,15 s/imagen en CPU con 8 hilos (unas 6,7 imagenes/s).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet-34 4x weather) | 21,3 M | Clasificacion meteorologica BDD100K (7 clases) | 640 x 640 px | BDD100K (solo investigacion) | Hugging Face, espejo verificado |
| SysCV BDD100K model zoo (original) | 21,3 M | Idem | 640 x 640 px | BDD100K | Host `dl.cv.ethz.ch` caido; solo Wayback Machine |
| Otros taggers del zoo SysCV (p. ej. hora del dia, escena) | no disponible | Otras etiquetas de BDD100K | no disponible | BDD100K | Mismo estado que el original |

No se dispone en la informacion proporcionada de datos de rendimiento de alternativas comparables (por ejemplo, clasificadores meteorologicos basados en ViT o EfficientNet) para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia BDD100K: uso limitado a fines educativos, de investigacion y sin animo de lucro; el uso comercial requiere evaluacion legal y probablemente licencia adicional.
- Clasificacion de una sola etiqueta por imagen: no detecta condiciones mixtas ni transiciones; la clase `undefined` absorbe casos ambiguos y degrada precision y recall macro (67,96 % y 63,65 % en val).
- Sin pesos preentrenados en el backbone: menor capacidad de generalizacion fuera de la distribucion de BDD100K (camaras, paises, sensores distintos).
- Entrada fija de recorte central 640 x 640 sin redimensionado: objetos o senales climaticas en bordes de la imagen pueden perderse.
- Riesgo de confusion entre clases visualmente proximas (`overcast` frente a `partly cloudy`, `clear` frente a `overcast`), coherente con el F1 macro de 65,19 %.
- Sin verificacion independiente de los benchmarks: los valores proceden de los ficheros de score de SysCV y el autor los declara como no verificados en el model-index.
- Entorno de dependencias antiguo y fragil (torch 2.0.1, mmcv-full 1.7.2, Python 3.10): requiere venv limpio; puede entrar en conflicto con stacks modernos.
- El modelo no genera texto ni razona: no debe usarse como sustituto de un VLM en tareas descriptivas o de decision compleja.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: adopcion practicamente nula, sin comunidad que reporte incidencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet34-4x-weather
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-resnet34-4x-weather/blob/main/LICENSE.txt
- Model zoo de SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/resnet34_4x_weather_tag_bdd100k.py
- Paper de ResNet: https://arxiv.org/abs/1512.03385
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K
