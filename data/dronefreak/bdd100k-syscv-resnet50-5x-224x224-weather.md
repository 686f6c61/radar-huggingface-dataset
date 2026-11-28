# dronefreak/bdd100k-syscv-resnet50-5x-224x224-weather

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet50-5x-224x224-weather` es un clasificador de imágenes basado en ResNet-50 que asigna a cada fotograma una etiqueta meteorológica entre siete clases: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` y `foggy`. No es un modelo de lenguaje ni un modelo generativo: es un cabezal de clasificación visual (LinearClsHead sobre backbone ResNet-50) entrenado sobre el conjunto de datos BDD100K, el corpus de conducción autónoma de referencia de la Universidad de Berkeley. Lo publica el usuario `dronefreak` como espejo (mirror) de un checkpoint del zoo de modelos de SysCV (ETH Zurich), cuyo servidor original `dl.cv.ethz.ch` está fuera de servicio.

La relevancia de esta ficha es doble. Por un lado, cubre una necesidad concreta en pipelines de percepción para conducción: el etiquetado meteorológico automático de fotogramas o secuencias de vídeo, una tarea auxiliar que condiciona el comportamiento de detectores y planificadores (por ejemplo, degradar la confianza en detección con lluvia o niebla). Por otro, el repositorio documenta una recuperación de pesos desde la Wayback Machine, con verificación MD5 y reproducción exacta de las predicciones originales sobre las 10.000 imágenes de validación, lo que lo convierte en un artefacto reproducible y auditable.

Arquitectónicamente es una CNN pura de la familia ResNet (paper CVPR 2016), con 23.575.495 parámetros, entrada de 224×224 píxeles tras redimensionar el lado corto a 256, y sin contexto textual. Su valor no está en la novedad arquitectónica —ResNet-50 es un estándar de 2015— sino en la disponibilidad de pesos entrenados específicamente para la tarea meteorológica de BDD100K, con una precisión Top-1 reportada del 81,78 % en validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN con conexiones residuales) + LinearClsHead |
| Parametros totales | 23.575.495 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224×224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no aplica (clasificación visual; no procesa texto) |
| Licencia | bdd100k (educational, research and not-for-profit use); config de SysCV bajo Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` original; configuración `config.json` |

## Arquitectura y entrenamiento

El modelo es un ResNet-50 estándar (bloques residuales con atajos de identidad, normalización por lotes y activaciones ReLU) seguido de un `LinearClsHead` de mmcls que proyecta el vector de características global a las siete clases meteorológicas. La entrada se preprocesa redimensionando el lado corto a 256 píxeles (una imagen 1280×720 pasa a 455×256) y recortando un centro de 224×224, con normalización ImageNet (media y desviación típica estándar). No se especifica en la configuración el uso de pesos preentrenados en ImageNet para el backbone, lo que implica entrenamiento desde inicialización aleatoria sobre BDD100K.

El entrenamiento se realizó sobre las 70.000 imágenes del split de entrenamiento de BDD100K durante 60 épocas (régimen "5x"), con SGD (lr 0,1, momentum 0,9, weight decay 0,0001), decaimiento de la tasa de aprendizaje en las épocas 30 y 45, batch de 128 (4 GPU × 32 imágenes) y aumentación de datos consistente en recortes aleatorios redimensionados a 224×224 y volteos horizontales. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador supervisado. La innovación técnica destacable no está en el modelo sino en el proceso de recuperación: los pesos se obtuvieron de una captura de la Wayback Machine del 29 de enero de 2025, se verificó el MD5 (`f73cdcdd41cb960718f23056812545f5`) contra el archivo original de SysCV y se comprobó la reproducción exacta de las predicciones publicadas sobre las 10.000 imágenes de validación, con diferencias en las puntuaciones de clase inferiores a 1e-06 en GPU y 4e-07 en CPU.

## Capacidades

- Clasificación de imágenes en siete categorías meteorológicas: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` y `foggy`.
- Procesamiento de imágenes individuales, carpetas de imágenes, archivos de vídeo y flujo de webcam mediante el script `infer.py` incluido en el repositorio.
- Salida de la etiqueta predicha y de las puntuaciones de todas las clases por imagen o fotograma, exportable a JSON con la opción `--json`.
- Control del número de fotogramas procesados en vídeo mediante `--max-frames`.
- Funcionamiento en GPU (CUDA 11.8) y en CPU, con entornos de dependencias separados y fijados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión multimodal ni audio. Es exclusivamente un clasificador de imagen de una sola etiqueta.

## Casos de uso

- Etiquetado automático de datasets de conducción: dado un conjunto de imágenes o vídeos de tráfico, el modelo asigna una etiqueta meteorológica por fotograma, lo que permite segmentar y filtrar corpus por condiciones climáticas para entrenar o evaluar otros modelos (detectores, segmentadores) con estratificación por clima.
- Enrutado condicional en pipelines de percepción: la etiqueta meteorológica puede usarse como señal para activar modelos especializados (por ejemplo, un detector entrenado con lluvia) o para relajar umbrales de confianza en detección cuando la etiqueta es `rainy`, `snowy` o `foggy`.
- Monitorización de flotas y vehículos conectados: procesar secuencias de cámaras de a bordo para registrar las condiciones meteorológicas encontradas durante un trayecto, con aplicación en seguros, mantenimiento predictivo o análisis de siniestralidad.
- Análisis de vídeo de tráfico urbano: clasificar horas o tramos de grabaciones de cámaras fijas para estudiar la correlación entre clima y congestión, accidentalidad o flujo vehicular.
- Preetiquetado en anotación humana: generar etiquetas meteorológicas automáticas que un anotador revisa, reduciendo el coste de anotación manual de grandes corpus de imágenes de conducción.
- Validación de robustez de modelos: usar el clasificador como oráculo de condiciones para construir subconjuntos de evaluación (día/noche, lluvia/nieve) y medir la degradación de otros sistemas de visión en cada subconjunto.
- Demostraciones y prototipos en tiempo real: con 0,006 s/imagen en una RTX 4070 SUPER (incluyendo decodificación JPEG) o 0,03 s/imagen en 8 hilos de CPU, es viable en prototipos de webcam o vídeo en directo sin infraestructura pesada.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuaciones de SysCV), sobre BDD100K. Precisión, exhaustividad y F1 son medias macro sobre las 7 clases, incluida `undefined`.

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 81,78 % | 70,51 % | 63,05 % | 65,33 % |
| test | 81,24 % | 73,77 % | 62,84 % | 65,73 % |

El autor indica que la métrica de validación no está verificada de forma independiente (`verified: false` en el model-index), aunque el repositorio documenta una reproducción exacta de las predicciones publicadas por SysCV sobre las 10.000 imágenes de validación. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que además no aplicarían a un clasificador de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 23,6 M de parámetros en FP32 los pesos ocupan aproximadamente 90 MB, y el pico de memoria lo determina el tamaño de lote. Cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: RTX 4070 SUPER (medición del autor: 0,006 s/imagen incluyendo decodificación JPEG), RTX 4090, A100, H100; cualquier GPU NVIDIA con CUDA 11.8 es suficiente. El modelo no aprovecha las capacidades de las GPU de gama alta por su reducido tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1060 en adelante, así como en iGPU con suficiente memoria compartida).
- CPU: 0,03 s/imagen con 8 hilos, según el autor; viable para procesamiento por lotes sin GPU.
- Opciones de despliegue: el repositorio incluye `infer.py` con entornos fijados (`env/requirements-cu118.txt` para GPU, `env/requirements-cpu.txt` para CPU) sobre torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 en Python 3.10. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,006 s/imagen en RTX 4070 SUPER (≈166 imágenes/s en el mejor caso, sin paralelización por lotes documentada) y 0,03 s/imagen en CPU de 8 hilos (≈33 imágenes/s).

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos de etiquetado meteorológico sobre BDD100K que permitan una comparación cuantitativa fiable. La comparación estructural con clasificadores genéricos es la siguiente:

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet-50 weather, SysCV) | ResNet-50 + LinearClsHead | 23,6 M | Imagen 224×224 px | bdd100k (solo investigación y sin ánimo de lucro) | Hugging Face (espejo) |
| ResNet-50 ImageNet (torchvision) | ResNet-50 | 25,6 M | Imagen 224×224 px | BSD-3-Clause | torchvision, ampliamente disponible |
| ViT-B/16 ImageNet | Vision Transformer | 86 M | Imagen 224×224 px | Apache-2.0 (según implementación) | Hugging Face, torchvision |
| Otros cabezales de tagging de BDD100K (SysCV) | Diversas CNN/transformers | no disponible | Imagen | bdd100k | Repositorio SysCV (servidor original caído) |

La diferencia clave frente a clasificadores genéricos es la especialización: este modelo predice condiciones meteorológicas de escenas de conducción, no las 1.000 clases de ImageNet. No se dispone de datos comparativos de precisión frente a alternativas específicas para esta tarea.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan sujetos a su licencia, limitada a uso educativo, de investigación y sin ánimo de lucro. El uso comercial requiere evaluar y probablemente negociar una licencia aparte; la configuración de SysCV es Apache-2.0, pero eso no cubre los pesos entrenados con BDD100K.
- El modelo está entrenado exclusivamente con imágenes de BDD100K (escenas de conducción diurnas y nocturnas en entornos urbanos y de autopista), por lo que su generalización a otros dominios (interiores, imágenes aéreas, cámaras de vigilancia no viales) no está documentada.
- Una sola etiqueta por imagen: no modela condiciones mixtas ni transiciones graduales; la clase `undefined` absorbe los casos ambiguos y puede enmascarar errores.
- El desequilibrio de clases es notable: la precisión Top-1 del 81,78 % convive con una exhaustividad macro del 63,05 %, lo que indica un rendimiento desigual entre clases (las clases minoritarias como `foggy` o `snowy` probablemente se detectan peor). No se publican métricas por clase en la información disponible.
- Riesgo de clasificación errónea en condiciones visualmente ambiguas (atardeceres, cielos parcialmente nublados, iluminación artificial nocturna) y en imágenes con baja visibilidad o desenfoque de movimiento.
- El modelo no detecta ni localiza objetos ni personas; cualquier uso en sistemas de seguridad o conducción debe combinarse con otros componentes y no delegar decisiones críticas en esta etiqueta.
- Los pesos se recuperaron de un servidor caído mediante la Wayback Machine; aunque el autor documenta verificación MD5 y reproducción exacta, la cadena de custodia original no es la de un repositorio oficial activo.
- El entorno requiere versiones antiguas y fijadas (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10); mezclar con entornos existentes puede romper dependencias, por lo que el autor recomienda un virtualenv limpio.
- No se documentan sesgos demográficos ni geográficos más allá de los inherentes al dataset BDD100K (principalmente Estados Unidos), lo que limita su aplicabilidad a otras regiones con patrones meteorológicos o de infraestructura distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet50-5x-224x224-weather
- Licencia (LICENSE.txt del repositorio): https://huggingface.co/dronefreak/bdd100k-syscv-resnet50-5x-224x224-weather/blob/main/LICENSE.txt
- Repositorio SysCV bdd100k-models (zoo original): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración original de SysCV (weather, ResNet-50 5x 224×224): https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/resnet50_5x_224x224_weather_tag_bdd100k.py
- Paper de ResNet (Deep Residual Learning for Image Recognition, CVPR 2016): https://arxiv.org/abs/1512.03385
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (Yu et al., CVPR 2020): no se proporciona enlace directo en la información disponible; la referencia bibliográfica está en la model card.
