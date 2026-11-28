# dronefreak/bdd100k-syscv-vgg16-5x-224x224-weather

## Resumen

Este modelo es un clasificador de imagen basado en VGG-16 que asigna a cada fotograma de conduccion una unica etiqueta meteorologica entre siete clases: rainy, snowy, clear, overcast, undefined, partly cloudy y foggy. No es un modelo generativo ni un LLM, sino un checkpoint de vision por computador publicado por el autor dronefreak como espejo de un modelo del zoo de modelos de BDD100K mantenido por SysCV (ETH Zurich). Los pesos originales se alojaban en `dl.cv.ethz.ch`, un host que ya no esta operativo, por lo que este repositorio recupera los pesos desde la Wayback Machine (captura del 29 de enero de 2025) y anade un entorno fijado y un script de inferencia.

El modelo resuelve una tarea auxiliar dentro del pipeline de conduccion autonoma: el etiquetado automatico de condiciones meteorologicas sobre el dataset BDD100K, que sirve como metadato para segmentacion, deteccion y analisis de escenas de trafico. Su relevancia actual es practica: permite reproducir exactamente las predicciones publicadas por SysCV (verificado sobre las 10.000 imagenes de validacion, con coincidencia identica de etiquetas y diferencias de puntuacion de hasta 2e-06) sin depender de un servidor caido.

Arquitectonicamente es una CNN VGG-16 clasica con cabecera ClsHead, 134.289.223 parametros, entrada de 224x224 tras redimensionar el lado corto a 256, y pesos en formato safetensors con un tamano de repositorio de 1,1 GB. La licencia hereda las restricciones de BDD100K, lo que limita su uso a fines educativos, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGG-16 (CNN, paper ICLR 2015) con cabecera ClsHead |
| Parametros totales | 134.289.223 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint en precision original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificacion de imagen; etiquetas en ingles: rainy, snowy, clear, overcast, undefined, partly cloudy, foggy) |
| Licencia | bdd100k (educational, research and not-for-profit use) |
| Formato de pesos | safetensors (`model.safetensors`), con `.pth` equivalente en `original/` |

## Arquitectura y entrenamiento

VGG-16 es una red neuronal convolucional profunda compuesta por bloques de convoluciones 3x3 con activaciones ReLU y max-pooling, seguida de capas totalmente conectadas y una cabecera de clasificacion (ClsHead en el ecosistema mmcls). El modelo no emplea atencion ni mecanismos tipo transformer: es una CNN puramente convolucional, lo que explica su coste computacional relativamente alto para su tamano en comparacion con arquitecturas modernas.

El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 60 epocas (configuracion "5x"), con SGD de learning rate 0,01, momento 0,9, weight decay 0,0001, decaimiento del learning rate en las epocas 30 y 45, batch de 128 (4 GPUs x 32 imagenes) y aumentacion de datos basada en recortes aleatorios redimensionados a 224x224 y volteos horizontales. El backbone se inicializa sin pesos preentrenados segun la configuracion de SysCV. En inferencia, la imagen se redimensiona por el lado corto a 256 (una imagen 1280x720 pasa a 455x256), se aplica un recorte central de 224x224 y se normaliza con media y desviacion tipica de ImageNet en RGB.

## Capacidades

- Clasificacion de imagen en siete clases meteorologicas: rainy, snowy, clear, overcast, undefined, partly cloudy y foggy.
- Asignacion de una unica etiqueta por imagen o fotograma, con salida de puntuaciones para todas las clases mediante la opcion `--json`.
- Procesamiento de imagenes sueltas, carpetas de imagenes, ficheros de video y flujo de webcam a traves de `infer.py`.
- Verificacion de reproduccion exacta frente a las predicciones publicadas por SysCV en validacion (10.000 imagenes) y en CPU (20 imagenes).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un clasificador visual.

## Casos de uso

- Etiquetado automatico de condiciones meteorologicas en datasets de conduccion: el modelo clasifica cada fotograma de BDD100K o de un dataset propio con el mismo formato, generando metadatos que permiten filtrar y segmentar escenas por clima para entrenar o evaluar otros modelos.
- Reproduccion de resultados de investigacion: al coincidir exactamente con las predicciones de SysCV, permite replicar experimentos publicados que dependan de las etiquetas meteorologicas de BDD100K sin acceso al servidor original de ETH Zurich.
- Preprocesado en pipelines de conduccion autonoma: integrado como etapa previa, el tag meteorologico puede condicionar la seleccion de modelos de deteccion o segmentacion (por ejemplo, activar un detector entrenado especificamente para lluvia o nieve).
- Analisis de videos de trafico: `infer.py` acepta ficheros de video y procesa fotograma a fotograma, lo que permite generar series temporales de condiciones meteorologicas a lo largo de una grabacion (dia y noche, como en la demo del autor).
- Monitorizacion en tiempo real con webcam: con 0,007 s por imagen en una RTX 4070 SUPER (incluyendo decodificacion JPEG), el modelo es viable para clasificacion en directo desde una camara.
- Control de calidad de datasets: detectar imagenes mal etiquetadas o con condiciones ambiguas (clase `undefined`) para revisarlas manualmente antes de usarlas en entrenamiento.
- Despliegue en entornos sin GPU: con 0,09 s por imagen en 8 hilos de CPU, es adecuado para procesamiento por lotes en servidores sin acelerador.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuacion de SysCV, no verificados de forma independiente por el pipeline de Hugging Face):

| Metrica | val | test |
|---|---|---|
| Top-1 accuracy (weather) | 80,77 % | 80,70 % |
| Precision (macro, 7 clases) | 64,15 % | 63,89 % |
| Recall (macro, 7 clases) | 61,26 % | 60,49 % |
| F1 (macro, 7 clases) | 62,49 % | 61,92 % |

Rendimiento de inferencia medido por el autor: 0,007 s/imagen en una RTX 4070 SUPER (incluyendo decodificacion JPEG) y 0,09 s/imagen en CPU con 8 hilos.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa unos 1,1 GB en el repositorio; en precision FP32 la inferencia requiere aproximadamente 1-2 GB de VRAM, holgadamente dentro de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA moderna; el autor verifica en una RTX 4070 SUPER. Una A100 o H100 no aportan ventaja practica para este modelo por su bajo coste computacional.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 en adelante).
- Opciones de despliegue: el script `infer.py` incluido, con entornos fijados `env/requirements-cu118.txt` (GPU, CUDA 11.8) o `env/requirements-cpu.txt` (CPU). El entorno fija torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 sobre Python 3.10; se recomienda un venv limpio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de vision).
- Latencia y throughput: 0,007 s/imagen en RTX 4070 SUPER (unos 140 imagenes/s teoricos) y 0,09 s/imagen en CPU de 8 hilos (unas 11 imagenes/s).

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos alternativos de etiquetado meteorologico en BDD100K (por ejemplo, variantes ResNet u otras arquitecturas del zoo de SysCV) con sus parametros, contexto o rendimiento, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, este checkpoint se distingue por ser un espejo verificado de un modelo oficial de SysCV con reproduccion exacta de resultados, algo que no se puede confirmar para otras copias no oficiales.

| Modelo | Parametros | Tarea | Top-1 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (VGG-16, 5x, 224x224) | 134.289.223 | Weather tagging BDD100K | 80,77 % | bdd100k | Hugging Face |
| Alternativas del zoo SysCV | no disponible | Weather tagging BDD100K | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se entrenaron sobre BDD100K y heredan su licencia, limitada a uso educativo, de investigacion y sin animo de lucro. No se permite uso comercial sin autorizacion adicional.
- El modelo se inicializa sin pesos preentrenados y entrena solo sobre BDD100K, por lo que su generalizacion a dominios visuales distintos (otras camaras, paises, condiciones de iluminacion extremas) no esta documentada.
- Precision y recall macro bajos (en torno al 61-64 %) pese a la accuracy del 80,77 %: las clases minoritarias (foggy, partly cloudy, snowy) probablemente se confunden con frecuencia con las mayoritarias, y la clase `undefined` distorsiona las metricas.
- Riesgo de etiquetas erroneas en condiciones ambiguas o mixtas (por ejemplo, lluvia ligera con cielo parcialmente cubierto), ya que el modelo asigna una unica etiqueta por imagen.
- El pipeline depende de un entorno antiguo y muy fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10); la instalacion en entornos mas recientes puede fallar y requiere un venv limpio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo no ha sido verificado por el pipeline de Hugging Face: la exactitud de la reproduccion la certifica el autor, no un tercero.
- La fecha de creacion indicada (2026-11-28) es futura respecto a la fecha habitual de consulta; conviene comprobar la integridad del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-vgg16-5x-224x224-weather
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-vgg16-5x-224x224-weather/blob/main/LICENSE.txt
- Zoo de modelos SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config de SysCV para este modelo: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/vgg16_5x_224x224_weather_tag_bdd100k.py
- Paper de VGG (ICLR 2015): https://arxiv.org/abs/1409.1556
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
