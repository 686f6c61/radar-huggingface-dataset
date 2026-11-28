# dronefreak/bdd100k-syscv-resnet50-5x-weather

## Resumen

`dronefreak/bdd100k-syscv-resnet50-5x-weather` es un clasificador de imágenes basado en ResNet-50 que asigna a cada fotograma de conduccion una etiqueta meteorologica entre siete clases: rainy, snowy, clear, overcast, undefined, partly cloudy y foggy. No es un modelo de lenguaje ni un modelo generativo: es un cabezal de etiquetado (tagging) de escenas de conduccion entrenado sobre el conjunto BDD100K, y publicado originalmente por el grupo SysCV de ETH Zurich dentro de su zoo de modelos para BDD100K.

El repositorio de Hugging Face es un espejo comunitario del checkpoint original de SysCV. El host institucional `dl.cv.ethz.ch` esta fuera de servicio, y los pesos se recuperaron mediante la Wayback Machine (captura del 29 de enero de 2025). El autor del espejo anade un entorno de dependencias fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0 sobre Python 3.10) y un script de inferencia que acepta imagenes, carpetas, video o webcam.

Su relevancia es practica y acotada: cubre una tarea auxiliar muy concreta dentro de pipelines de vision para conduccion autonoma (clasificacion de condiciones meteorologicas por fotograma) y preserva unos pesos que de otro modo se habrian perdido. Con 23,5 millones de parametros y un peso de repositorio de 0,2 GB, es un modelo ligero pensado para ejecutarse en GPU de consumo o incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN con conexiones residuales) con LinearClsHead, framework mmcls |
| Parametros totales | 23.575.495 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors en precision original) |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase estan en ingles) |
| Licencia | bdd100k (educational, research and not-for-profit use); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (y `.pth` equivalente en `original/`) |
| Entrada | recorte central de 640 x 640 de la imagen a resolucion completa, sin redimensionado; RGB con media y desviacion tipica de ImageNet |
| Clases de salida | 7: rainy, snowy, clear, overcast, undefined, partly cloudy, foggy |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-50 clasica, descrita en "Deep Residual Learning for Image Recognition" (CVPR 2016), con un cabezal de clasificacion lineal (LinearClsHead) de mmcls. La red troncal no parte de pesos preentrenados segun la configuracion de SysCV: se entrena desde cero sobre BDD100K. El entrenamiento usa las 70.000 imagenes del split de train de BDD100K durante 60 epocas (la variante "5x"), con SGD de tasa de aprendizaje 0,1, momento 0,9, decaimiento de pesos 0,0001, decaimiento de la tasa en las epocas 30 y 45, y un tamano de lote de 48 (4 GPU x 12 imagenes). La aumentacion se limita a recortes aleatorios de 640 x 640 y volteos horizontales.

La innovacion tecnica es escasa por diseno: se trata de un baseline de clasificacion de imagen estandar aplicado a una tarea auxiliar del benchmark BDD100K. El interes del repositorio no esta en la arquitectura sino en la trazabilidad: el autor verifica que su copia reproduce exactamente las predicciones publicadas por SysCV sobre las 10.000 imagenes de validacion, con todas las puntuaciones de clase coincidiendo dentro de 1e-06 en GPU (RTX 4070 SUPER, CUDA 11.8, TF32 desactivado) y dentro de 5e-07 en CPU sobre 20 imagenes. El MD5 de los pesos (`5f89f615f37b20ace389fd369c07f538`) coincide con el archivo MD5 de SysCV, y todas las claves cargan en la configuracion original.

## Capacidades

- Clasificacion de imagen en 7 clases meteorologicas (rainy, snowy, clear, overcast, undefined, partly cloudy, foggy) sobre escenas de conduccion.
- Inferencia sobre imagen suelta, carpeta de imagenes, archivo de video o flujo de webcam 0, con salida de la etiqueta top-1 y todas las puntuaciones por clase (`--json`).
- Procesamiento por fotograma en video, con opcion de limitar el numero de fotogramas (`--max-frames`).
- Ejecucion en GPU NVIDIA (entorno CUDA 11.8) y en CPU (entorno CPU con 8 hilos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de vision.
- No tiene capacidades multilingues ni de audio; las etiquetas de salida estan en ingles.
- No dispone de modo "thinking" ni de salida explicativa; solo puntuaciones de clase.

## Casos de uso

- Etiquetado automatico de condiciones meteorologicas en datasets de conduccion: dado un conjunto de imagenes o videos de camara frontal, el modelo asigna una etiqueta por fotograma, lo que permite filtrar o estratificar datos por clima antes de entrenar detectores o segmentadores. Es adecuado por su coste bajo (0,010 s/imagen en RTX 4070 SUPER) y su fidelidad verificada frente a las predicciones originales de SysCV.
- Preprocesado en pipelines de percepcion para vehiculos autonomos: la etiqueta meteorologica puede usarse como senal de contexto para conmutar entre submodelos especializados (por ejemplo, un detector entrenado para lluvia frente a uno para cielo despejado), gracias a la inferencia por fotograma en video.
- Auditoria y curacion de datasets de investigacion: al reproducir exactamente las predicciones de validacion de SysCV, sirve para comprobar la integridad de copias de BDD100K y para regenerar etiquetas meteorologicas perdidas.
- Analisis de grabaciones de flotas o dashcams: procesar video (`python infer.py drive.mov`) para obtener una linea temporal de clima por clip, util en estudios de siniestralidad o en la seleccion de clips representativos.
- Demostraciones y prototipos en tiempo real: con webcam (`python infer.py 0 --show`) o video, el modelo corre en GPU de consumo y permite validar rapidamente la viabilidad de un etiquetador meteorologico antes de invertir en un modelo mayor.
- Despliegue en entornos sin GPU: el entorno CPU procesa imagenes a 0,21 s/imagen con 8 hilos, suficiente para lotes offline o para servidores sin acelerador.
- Reproducibilidad de resultados academicos: al conservar `original/` con el MD5, las predicciones de validacion y las puntuaciones de SysCV, permite replicar experimentos que citan el zoo de modelos de BDD100K.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuacion de SysCV), sobre BDD100K. Precision, recall y F1 son medias macro sobre las 7 clases, incluida `undefined`.

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 81,94 | 67,74 | 63,92 | 65,47 |
| test | 81,56 | 69,68 | 63,61 | 65,62 |

Rendimiento de inferencia declarado:

| Entorno | Tiempo por imagen |
|---|---|
| RTX 4070 SUPER (incluye decodificacion JPEG) | 0,010 s |
| CPU, 8 hilos | 0,21 s |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 23,5 millones de parametros en precision original (fp32) los pesos ocupan aproximadamente 94 MB, por lo que la huella de memoria es minima y dominada por activaciones y el pipeline de mmcv.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA 11.8; el autor verifica en una RTX 4070 SUPER. Para lotes grandes, A100 o H100 aportarian mayor throughput, aunque el modelo no las necesita.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna con CUDA; tambien funciona en CPU.
- Opciones de despliegue: el repositorio proporciona `infer.py` sobre mmcls 0.25.0 y mmcv-full 1.7.2 con torch 2.0.1 (entornos `requirements-cu118.txt` y `requirements-cpu.txt`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de vision de este tipo.
- Latencia y throughput: 0,010 s/imagen en RTX 4070 SUPER (unos 100 img/s teoricos en ese hardware) y 0,21 s/imagen en CPU de 8 hilos (unos 4,8 img/s).

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos de etiquetado meteorologico sobre BDD100K para una comparacion numerica rigurosa. La comparacion cualitativa posible es la siguiente:

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bdd100k-syscv-resnet50-5x-weather (este) | 23,5 M | Clasificacion meteorologica (7 clases) | Recorte 640 x 640 | bdd100k (solo investigacion) | Hugging Face (espejo) |
| Otros modelos del zoo SysCV BDD100K (tagging) | no disponible | Etiquetado de escenas de conduccion | no disponible | Apache-2.0 (config) / bdd100k (pesos) | GitHub SysCV; host original caido |
| Clasificadores ImageNet genericos (p. ej. ResNet-50 estandar) | ~25,6 M | Clasificacion ImageNet (1000 clases) | 224 x 224 tipico | variable | Amplia |

La comparacion con clasificadores genericos es solo orientativa: este modelo esta especializado en 7 clases meteorologicas de escenas de conduccion y no es intercambiable con un clasificador ImageNet.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo la licencia BDD100K, limitada a uso educativo, de investigacion y sin animo de lucro. No se permite uso comercial sin autorizacion adicional.
- Sesgo de dominio: entrenado exclusivamente con imagenes de BDD100K (escenas de conduccion, principalmente entornos urbanos y de carretera); el rendimiento fuera de ese dominio (interiores, otras geografias, otras camaras) no esta caracterizado.
- Clase `undefined`: el modelo incluye una clase residual `undefined`, y las metricas macro (precision 67,74, recall 63,92, F1 65,47 en val) reflejan un desequilibrio y confusion entre clases mucho mayor que la accuracy top-1 (81,94), lo que indica que las clases minoritarias se predicen peor.
- Riesgo de etiquetado erroneo en condiciones ambiguas: la distincion entre overcast, partly cloudy y clear, o entre lluvia y nieve, puede ser sutil; no se documenta calibracion de confianza ni umbrales recomendados.
- Dependencia de un recorte central de 640 x 640 sin redimensionado: imagenes con resoluciones o encuadres distintos pueden degradar el resultado.
- Entorno fragil: requiere versiones fijadas de torch, mmcv-full y mmcls (Python 3.10); el autor recomienda un venv limpio. No hay soporte de cuantizacion documentado.
- Procedencia: los pesos se recuperaron de la Wayback Machine; aunque el autor verifica MD5 y reproduccion exacta, no proceden de un canal oficial activo.
- Sin capacidades de texto, agentes ni tool calling: no debe emplearse fuera de su tarea de clasificacion de imagen.
- No se documentan sesgos demograficos ni de otro tipo mas alla del sesgo de dominio del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet50-5x-weather
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-resnet50-5x-weather/blob/main/LICENSE.txt
- Zoo de modelos SysCV BDD100K (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config de SysCV (weather, resnet50_5x): https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/resnet50_5x_weather_tag_bdd100k.py
- Paper de ResNet: https://arxiv.org/abs/1512.03385
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K
