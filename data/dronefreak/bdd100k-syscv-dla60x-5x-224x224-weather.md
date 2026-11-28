# dronefreak/bdd100k-syscv-dla60x-5x-224x224-weather

## Resumen

El modelo `dronefreak/bdd100k-syscv-dla60x-5x-224x224-weather` es un clasificador de imágenes especializado en etiquetado meteorológico de escenas de conducción. Se trata de un espejo (mirror) de un checkpoint originalmente publicado por el equipo SysCV de la ETH Zurich dentro de su zoo de modelos para el dataset BDD100K. El autor del repositorio lo ha recuperado desde la Wayback Machine (captura del 29 de enero de 2025) ante la caída del host original `dl.cv.ethz.ch`, y lo redistribuye junto con un entorno fijado y un script de inferencia.

La tarea que resuelve es la clasificación de una única etiqueta meteorológica por imagen: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` o `foggy`. Es un componente típico en pipelines de conducción autónoma y análisis de vídeo, donde el estado del tiempo condiciona el comportamiento de sistemas de percepción posteriores. La arquitectura es DLA-X-60 (Deep Layer Aggregation, CVPR 2018) con una cabeza de clasificación `ClsHead` de mmclassification, y cuenta con 16,69 millones de parámetros.

El modelo es relevante ahora porque el acceso a los pesos originales estaba roto y este repositorio ofrece una reproducción verificada bit a bit (misma etiqueta en las 10.000 imágenes de validación y diferencias de puntuación inferiores a 4e-06 respecto a las predicciones publicadas por SysCV). Está pensado para uso educativo, de investigación y sin ánimo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DLA-X-60 (Deep Layer Aggregation) + ClsHead de mmclassification |
| Parametros totales | 16.690.487 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación visual; etiquetas en inglés) |
| Licencia | BDD100K (uso educativo, investigación y sin ánimo de lucro) |
| Formato de pesos | safetensors (también `.pth` original), config en JSON |
| Entrada | lado corto redimensionado a 256, recorte central 224x224, RGB, media y desviación típica de ImageNet |
| Número de clases | 7 (rainy, snowy, clear, overcast, undefined, partly cloudy, foggy) |
| Librería | mmcls 0.25.0, mmcv-full 1.7.2, torch 2.0.1, Python 3.10 |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El backbone es DLA-X-60, una red convolucional con agregación profunda de capas (Deep Layer Aggregation) que combina conexiones de agregación jerárquica e iterativa para mejorar la propagación de gradientes y la reutilización de características. Sobre el backbone se monta una cabeza de clasificación lineal estándar (`ClsHead`) que produce la distribución sobre las siete clases meteorológicas.

El entrenamiento se realizó sobre las 70.000 imágenes del split de entrenamiento de BDD100K, durante 60 épocas (configuración "5x"), con SGD (learning rate 0,1, momentum 0,9, weight decay 0,0001), decaimiento del learning rate en las épocas 30 y 45, batch de 128 (4 GPUs × 32 imágenes) y augmentación de recortes aleatorios redimensionados a 224x224 con volteo horizontal. Según la model card, el backbone no se inicializa con pesos preentrenados. El modelo se distribuye sin cuantizaciones ni variantes destiladas; el checkpoint es único y se corresponde con el original de SysCV.

## Capacidades

- Clasificación de imágenes en siete categorías meteorológicas: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy`, `foggy`.
- Etiquetado de fotogramas individuales o secuencias completas de vídeo (el script `infer.py` acepta imagen, carpeta de imágenes, fichero de vídeo y webcam).
- Salida de la etiqueta top-1 y de todas las puntuaciones por clase (`--json`).
- Procesamiento en GPU y CPU con resultados equivalentes (verificado sobre 20 imágenes de validación en CPU).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador visual.
- No dispone de capacidades multilingües ni de visión general más allá de la clasificación meteorológica.

## Casos de uso

- Etiquetado automático de datasets de conducción: el modelo asigna una etiqueta meteorológica a cada imagen de un corpus tipo BDD100K, lo que permite filtrar y estratificar por condiciones climáticas antes de entrenar modelos de detección o segmentación.
- Preprocesado en pipelines de percepción autónoma: la etiqueta meteorológica puede condicionar la selección de modelos o umbrales aguas abajo (por ejemplo, activar un detector más robusto en condiciones de lluvia o niebla).
- Análisis de vídeo de flotas o dashcams: con `infer.py` se procesan vídeos completos y se obtiene una etiqueta por fotograma, útil para auditorías de seguridad o para segmentar incidentes por clima.
- Investigación en robustez de modelos: sirve como clasificador auxiliar para agrupar imágenes por dificultad meteorológica y evaluar la degradación de otros sistemas de visión en cada condición.
- Monitorización en tiempo real con webcam o cámara embarcada: la inferencia a 0,005 s/imagen en una RTX 4070 SUPER permite integrarlo en bucles en directo sin cuello de botella.
- Docencia y reproducción de resultados: al incluir entorno fijado, pesos verificados por MD5 y predicciones de referencia, es adecuado para prácticas de visión por computador y para reproducir exactamente los números publicados por SysCV.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuación de SysCV):

| Split | Top-1 accuracy | Precision (macro) | Recall (macro) | F1 (macro) |
|---|---|---|---|---|
| val | 80,22 % | 64,09 % | 59,61 % | 61,45 % |
| test | 79,80 % | 73,19 % | 60,53 % | 63,66 % |

Las métricas de precisión, recall y F1 son medias macro sobre las siete clases, incluida `undefined`. La verificación del espejo confirma que en las 10.000 imágenes de validación la etiqueta coincide con las predicciones publicadas por SysCV y que las puntuaciones por clase difieren como máximo 4e-06.

Rendimiento de inferencia declarado: 0,005 s/imagen en una RTX 4070 SUPER (incluyendo decodificación JPEG) y 0,03 s/imagen en CPU con 8 hilos.

## Requisitos de hardware

- VRAM estimada: muy baja; con 16,69 millones de parámetros en fp32 el checkpoint ocupa aproximadamente 67 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 4070 SUPER (medición oficial del autor), cualquier RTX 30/40, así como A100 o H100 si se procesan lotes grandes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM libre.
- Despliegue: el repositorio incluye `infer.py` con entornos fijados (`env/requirements-cu118.txt` para CUDA 11.8 y `env/requirements-cpu.txt` para CPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: 0,005 s/imagen en RTX 4070 SUPER y 0,03 s/imagen en CPU de 8 hilos (datos del autor).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Top-1 (val) | Licencia |
|---|---|---|---|---|---|
| Este modelo (DLA-X-60, 5x, 224) | DLA-X-60 + ClsHead | 16,69 M | Clima BDD100K (7 clases) | 80,22 % | BDD100K (solo investigación) |
| Otros clasificadores de clima del zoo SysCV (ResNet, etc.) | no disponible en la información proporcionada | no disponible | Clima BDD100K | no disponible | BDD100K |
| Clasificadores ImageNet genéricos (p. ej. ResNet-50) | CNN | ~25 M | 1000 clases ImageNet | no aplica a clima | variable |

No se dispone en la información proporcionada de resultados de otros modelos del zoo SysCV ni de alternativas específicas de etiquetado meteorológico sobre BDD100K, por lo que la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Licencia BDD100K: uso exclusivamente educativo, de investigación y sin ánimo de lucro; el uso comercial requiere revisar los términos del dataset original.
- El modelo se entrenó sobre BDD100K, con la distribución de escenas, cámaras y geografías de ese dataset; puede degradarse en dominios visuales distintos (otras resoluciones, cámaras o países).
- La clase `undefined` reduce las métricas macro (precisión 64,09 % y recall 59,61 % en validación), lo que indica confusión entre clases y una calidad desigual por categoría.
- Riesgo de error en condiciones ambiguas (por ejemplo, transiciones entre `overcast` y `partly cloudy`, o lluvia ligera frente a `clear`), sin que el modelo ofrezca calibración documentada.
- Es un clasificador de una sola etiqueta por imagen: no detecta condiciones mixtas ni ofrece localización espacial.
- No es un modelo generativo: no admite prompts, tool calling ni razonamiento; cualquier uso fuera de la clasificación visual es inadecuado.
- El repositorio es un espejo no oficial; aunque la verificación es exhaustiva, la procedencia original es la Wayback Machine y conviene conservar el MD5 `5ec11ad97eb85b1eadbc7c863d0d9f30` para validar los pesos.
- El entorno está fijado a versiones antiguas (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10); mezclarlo con entornos existentes puede provocar incompatibilidades.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-dla60x-5x-224x224-weather
- Licencia (BDD100K): https://huggingface.co/dronefreak/bdd100k-syscv-dla60x-5x-224x224-weather/blob/main/LICENSE.txt
- Zoo de modelos SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/dla60x_5x_224x224_weather_tag_bdd100k.py
- Paper de DLA (Deep Layer Aggregation, CVPR 2018): https://arxiv.org/abs/1707.06484
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
