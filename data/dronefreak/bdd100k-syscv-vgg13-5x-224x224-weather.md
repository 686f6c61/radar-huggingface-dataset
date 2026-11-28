# dronefreak/bdd100k-syscv-vgg13-5x-224x224-weather

## Resumen

El modelo `dronefreak/bdd100k-syscv-vgg13-5x-224x224-weather` es un clasificador de imágenes basado en VGG-13 entrenado para asignar una etiqueta meteorológica a cada fotograma de escenas de conducción del dataset BDD100K. Las siete clases posibles son `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` y `foggy`. No es un modelo generativo ni un modelo de lenguaje: es un cabezal de clasificación visual (backbone convolucional VGG-13 más una `ClsHead` de mmclassification) que resuelve una tarea auxiliar muy concreta dentro de los pipelines de percepción para conducción autónoma.

El modelo original procede del *model zoo* de SysCV (ETH Zurich), publicado en el repositorio `SysCV/bdd100k-models`. El autor de este repositorio de Hugging Face (`dronefreak`) no ha reentrenado el modelo: ha recuperado los pesos desde la Wayback Machine (captura del 30 de enero de 2025) porque el host original `dl.cv.ethz.ch` está fuera de servicio, y los redistribuye junto con un entorno fijado y un script de inferencia. Por tanto, su valor principal es de preservación y reproducibilidad: permite volver a ejecutar un *checkpoint* que de otro modo sería inaccesible.

La relevancia práctica es doble. Por un lado, sirve como etiquetador automático de condiciones meteorológicas para anotar o filtrar grandes volúmenes de vídeo de tráfico (por ejemplo, para estratificar datasets por clima o para activar subsistemas de percepción según la condición ambiental). Por otro, es un ejemplo de modelo pequeño (unos 129 millones de parámetros) y ligero que cabe en una GPU de consumo y que se ejecuta a milisegundos por imagen, lo que lo hace apto para preprocesado masivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN VGG-13 (VGG-13 + `ClsHead` de mmclassification) |
| Parámetros totales | 128.979.527 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 x 224 tras recorte central) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones oficiales; pesos en safetensors de precisión completa) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`); uso educativo, de investigación y sin ánimo de lucro |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; configuración en `config.json` y `original_config.py` |

## Arquitectura y entrenamiento

La arquitectura es una VGG-13 clásica (trece capas convolucionales con filtros de 3x3, bloques de *max pooling* y una cabeza totalmente conectada), descrita en el paper *Very Deep Convolutional Networks for Large-Scale Image Recognition* (ICLR 2015, arXiv:1409.1556). Sobre el backbone se añade una `ClsHead` de mmclassification que produce las siete puntuaciones de clima. El preprocesado de entrada redimensiona el lado corto a 256 píxeles (una imagen de 1280 x 720 pasa a 455 x 256) y aplica un recorte central de 224 x 224 con media y desviación típica de ImageNet en RGB.

El entrenamiento se realizó sobre el *split* de entrenamiento de BDD100K (70 000 imágenes) durante 60 épocas (la variante "5x"), con SGD (learning rate 0,01, momento 0,9, *weight decay* 0,0001), decaimiento de la tasa en las épocas 30 y 45, tamaño de lote 128 (4 GPU x 32 imágenes) y aumentación consistente en recortes redimensionados aleatorios de 224 x 224 y volteos horizontales. La configuración no fija pesos preentrenados para el backbone, es decir, se entrena desde cero. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador visual.

La innovación técnica más destacable de este repositorio no está en el modelo, sino en el proceso de recuperación y verificación: los pesos recuperados coinciden en MD5 (`f0e054eaaa251fdf46bafead3f73bcf3`) con los publicados por SysCV, y la inferencia reproduce exactamente las predicciones de validación publicadas (misma etiqueta en las 10 000 imágenes de validación y diferencias de puntuación por clase inferiores a 2e-06 en GPU y 5e-07 en CPU).

## Capacidades

- Clasificación de imágenes de escenas de conducción en una de siete etiquetas meteorológicas: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` y `foggy`.
- Salida de puntuaciones por clase (no solo la etiqueta ganadora), lo que permite umbralizar o combinar con otros módulos.
- Procesamiento de imágenes sueltas, carpetas de imágenes, vídeos y flujo de webcam mediante el script `infer.py` incluido.
- Salida opcional en JSON con la etiqueta y todas las puntuaciones por imagen o fotograma, y control del número máximo de fotogramas procesados (`--max-frames`).
- Ejecución en GPU (entorno CUDA 11.8) y en CPU (entorno específico), con resultados equivalentes.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador visual.
- No tiene capacidades multilingües ni de audio; las etiquetas están en inglés.

## Casos de uso

- Etiquetado automático de condiciones meteorológicas en grandes volúmenes de vídeo de tráfico: el modelo procesa cada fotograma en unos 0,006 s en una RTX 4070 SUPER (incluyendo decodificación JPEG), de modo que puede anotar decenas de miles de imágenes por hora y estratificar un dataset por clima sin intervención manual.
- Filtrado y curado de datasets de percepción: antes de entrenar un detector o un segmentador, se puede usar este clasificador para seleccionar únicamente los fotogramas con lluvia, nieve o niebla y construir subconjuntos equilibrados por condición ambiental.
- Activación condicional de subsistemas en un vehículo autónomo: la etiqueta de clima puede gobernar la conmutación de modelos de percepción especializados (por ejemplo, un detector entrenado para lluvia frente a uno para condiciones claras), ya que la inferencia es lo bastante rápida para operar en línea.
- Monitorización de flotas y análisis retrospectivo: procesar grabaciones de cámaras de vehículos para correlacionar incidentes o cambios de comportamiento con las condiciones meteorológicas a lo largo del tiempo.
- Validación y *smoke testing* de pipelines de visión: al reproducir exactamente las predicciones publicadas por SysCV sobre las 10 000 imágenes de validación, sirve como referencia de regresión para verificar que un entorno de inferencia (versiones de torch, mmcv, CUDA) funciona correctamente.
- Docencia e investigación en visión por computador: es un ejemplo pequeño y bien documentado de clasificación con mmclassification, útil para prácticas de *fine-tuning*, evaluación de aumentación de datos o estudio de sesgos en datasets de conducción.
- Preprocesado en CPU para entornos sin GPU: con 0,07 s por imagen en 8 hilos de CPU, es viable para lotes moderados en servidores sin acelerador.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuaciones de SysCV). La precisión, el *recall* y la F1 son medias macro sobre las siete clases, incluida `undefined`.

| Split | Top-1 accuracy (%) | Precisión (%) | Recall (%) | F1 (%) |
|---|---|---|---|---|
| Validación | 80,84 | 64,37 | 61,25 | 62,54 |
| Test | 80,71 | 64,25 | 60,26 | 61,90 |

El autor indica que la métrica de validación no está verificada de forma independiente (`verified: false`), aunque el propio repositorio documenta la reproducción exacta de las etiquetas y puntuaciones de SysCV sobre las 10 000 imágenes de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 129 millones de parámetros en precisión completa, la huella de pesos ronda los 0,5 GB, a lo que hay que sumar activaciones y el *runtime* de PyTorch. Cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: el autor reporta 0,006 s por imagen (con decodificación JPEG incluida) en una RTX 4070 SUPER. Cualquier GPU NVIDIA moderna (RTX 3060 en adelante, A100, H100) es sobrada; el modelo no aprovecha especialmente GPUs de gama alta por su reducido tamaño.
- GPU de consumo: sí, cabe en todas las GPU de consumo actuales; también se ejecuta en CPU (0,07 s por imagen con 8 hilos).
- Opciones de despliegue: el repositorio está pensado para mmclassification 0.25.0 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10, con entornos separados para CUDA 11.8 y CPU (`env/requirements-cu118.txt`, `env/requirements-cpu.txt`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador visual de este tipo.
- Latencia y throughput: 0,006 s/imagen en RTX 4070 SUPER y 0,07 s/imagen en CPU de 8 hilos, según el autor.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos de etiquetado meteorológico sobre BDD100K ni de sus especificaciones, por lo que no es posible establecer una comparativa numérica fiable. A modo de referencia cualitativa:

| Modelo | Tarea | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (VGG-13, 5x, 224) | Etiquetado meteorológico BDD100K | 128.979.527 | 224 x 224 | BDD100K (investigación, sin ánimo de lucro) | Hugging Face (espejo verificado) |
| Otros modelos del zoo SysCV (tagging) | Etiquetado meteorológico BDD100K | no disponible | no disponible | Apache-2.0 (config) / BDD100K (pesos) | Host original `dl.cv.ethz.ch` fuera de servicio |
| Clasificadores ImageNet genéricos | Clasificación de imágenes general | variable | 224 x 224 | variable | Amplia |

La comparación con clasificadores genéricos de ImageNet no es directa: este modelo está entrenado específicamente sobre escenas de conducción y sus siete clases meteorológicas, mientras que un clasificador ImageNet no produce esas etiquetas sin *fine-tuning*.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia (`LICENSE.txt`), que permite uso educativo, de investigación y sin ánimo de lucro. El uso comercial requiere revisar y probablemente negociar los términos con los titulares del dataset.
- El modelo solo etiqueta clima; no detecta objetos, no segmenta, no genera texto y no debe presentarse como un modelo multimodal o de propósito general.
- La clase `undefined` forma parte del conjunto de etiquetas y afecta a las métricas macro: la precisión y el *recall* macro (64,37 % y 61,25 % en validación) son notablemente inferiores a la accuracy top-1 (80,84 %), lo que indica desequilibrio entre clases y dificultad para las clases minoritarias.
- Riesgo de degradación fuera de dominio: está entrenado exclusivamente con imágenes de BDD100K (escenas de conducción diurnas y nocturnas en entornos urbanos y de autopista de EE. UU.); su comportamiento en otras geografías, cámaras o condiciones extremas no está documentado.
- El preprocesado es fijo (redimensionado del lado corto a 256 y recorte central de 224 x 224); imágenes con relaciones de aspecto o resoluciones muy distintas pueden perder información relevante en los bordes.
- La reproducibilidad depende de un entorno muy fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10); mezclar versiones puede alterar los resultados, y el autor recomienda un *virtualenv* limpio.
- El repositorio es un espejo de recuperación, no el origen oficial: si SysCV vuelve a publicar los pesos o los actualiza, este espejo podría quedar desfasado.
- No se documentan sesgos específicos más allá de los inherentes al dataset BDD100K (posible sobrerrepresentación de ciertas condiciones meteorológicas y localizaciones).
- No se han publicado resultados de benchmarks de terceros independientes en la información disponible; las cifras proceden del autor del modelo y de SysCV.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-vgg13-5x-224x224-weather
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-vgg13-5x-224x224-weather/blob/main/LICENSE.txt
- Repositorio SysCV BDD100K model zoo (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/vgg13_5x_224x224_weather_tag_bdd100k.py
- Paper de VGG (ICLR 2015): https://arxiv.org/abs/1409.1556
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): no disponible como enlace directo en la información proporcionada
