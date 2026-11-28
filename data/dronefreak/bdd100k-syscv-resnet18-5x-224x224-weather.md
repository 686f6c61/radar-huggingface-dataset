# dronefreak/bdd100k-syscv-resnet18-5x-224x224-weather

## Resumen

Este modelo es un clasificador de imágenes basado en ResNet-18 que asigna a cada fotograma de escena de conducción una única etiqueta meteorológica entre siete posibles: rainy, snowy, clear, overcast, undefined, partly cloudy y foggy. No es un modelo generativo ni un LLM: es un check-point de visión por computador para la tarea de *weather tagging* del conjunto de datos BDD100K. Lo publica el usuario `dronefreak` como espejo de un modelo del zoo de modelos SysCV de ETH Zúrich, cuyo host original (`dl.cv.ethz.ch`) está fuera de servicio; los pesos se recuperaron de la Wayback Machine (captura del 29 de enero de 2025) y se verificaron contra las predicciones y el MD5 publicados por SysCV.

El interés actual del modelo es práctico: permite etiquetar automáticamente condiciones meteorológicas en grandes volúmenes de vídeo o imagen de tráfico con un backbone muy ligero (11,19 M de parámetros, 0,1 GB de repo), lo que lo hace apto para preprocesado de datasets de conducción autónoma, filtrado por condiciones y selección de clips. La verificación incluida en la model card es inusualmente rigurosa para un espejo: reproduce exactamente las etiquetas de las 10.000 imágenes de validación de SysCV, con diferencias de puntuación de clase de hasta 2e-06 en GPU y 1e-06 en CPU.

La arquitectura es una ResNet-18 estándar con cabeza de clasificación lineal (`LinearClsHead` de MMClassification), entrada de 224x224 píxeles y 7 clases de salida. No hay contexto textual ni capacidades multimodales más allá de la clasificación de imagen; su relevancia radica en la reproducibilidad del espejo y en su coste computacional mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con conexiones residuales) + LinearClsHead |
| Parametros totales | 11.189.703 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de clase están en inglés) |
| Licencia | bdd100k (educational, research and not-for-profit use; ver `LICENSE.txt`) |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` original de SysCV |

## Arquitectura y entrenamiento

ResNet-18 es una red neuronal convolucional con bloques residuales, publicada en *Deep Residual Learning for Image Recognition* (CVPR 2016). En este check-point se usa como extractor de características con una cabeza lineal de 7 clases. La entrada se preprocesa redimensionando el lado corto a 256 píxeles (una imagen 1280x720 pasa a 455x256) y recortando un centro de 224x224, con normalización RGB según media y desviación estándar de ImageNet.

El entrenamiento se realizó sobre el split de entrenamiento de BDD100K (70.000 imágenes) durante 60 épocas (configuración "5x"), con SGD (lr 0,1, momentum 0,9, weight decay 0,0001), decaimiento de la tasa de aprendizaje en las épocas 30 y 45, batch de 128 (4 GPUs x 32 imágenes) y aumento de datos consistente en recortes aleatorios redimensionados a 224x224 y volteos horizontales. La configuración de SysCV no fija pesos preentrenados para el backbone, es decir, se entrena desde cero. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador.

## Capacidades

- Clasificación de imagen en 7 clases meteorológicas: rainy, snowy, clear, overcast, undefined, partly cloudy y foggy.
- Procesamiento de imágenes individuales, carpetas de imágenes, archivos de vídeo y webcam mediante `infer.py`.
- Salida de la etiqueta top-1 y, con `--json`, de todas las puntuaciones de clase por imagen o fotograma.
- Control del número de fotogramas procesados en vídeo con `--max-frames`.
- No soporta tool calling, function calling ni uso como agente.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento, visión general más allá de la clasificación, audio ni otras modalidades.

## Casos de uso

- Etiquetado automático de datasets de conducción: procesar lotes de imágenes de BDD100K o de cámaras de vehículo para anotar la condición meteorológica de cada fotograma, con un coste de 0,005 s/imagen en una RTX 4070 SUPER y 0,01 s/imagen en 8 hilos de CPU.
- Filtrado y selección de clips por meteorología: dado un archivo de vídeo, recorrer sus fotogramas y conservar únicamente los tramos con etiqueta `rainy` o `snowy` para construir subconjuntos de evaluación centrados en condiciones adversas.
- Preprocesado para pipelines de percepción: usar la etiqueta meteorológica como señal de entrada para conmutar modelos de detección o segmentación que rindan mejor en condiciones específicas (por ejemplo, activar un detector entrenado en lluvia).
- Auditoría de calidad de datasets: detectar desbalance o etiquetas incoherentes comparando la predicción del modelo con las anotaciones originales de BDD100K.
- Monitorización en vehículo o banco de pruebas: con `infer.py 0 --show` sobre webcam, obtener en tiempo real la etiqueta meteorológica del entorno como entrada de bajo coste para sistemas de asistencia.
- Reproducción de experimentos académicos: al ser un espejo verificado con MD5 y predicciones de validación idénticas a las de SysCV, sirve para replicar resultados de *tagging* sin depender del host original caído.
- Docencia y prototipado en visión por computador: ejemplo completo y ligero de clasificación con MMClassification, con entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10).

## Benchmarks y rendimiento

Resultados declarados por el autor a partir de los ficheros de puntuación de SysCV. Exactitud en %; precisión, recall y F1 son medias macro sobre las 7 clases (incluida `undefined`).

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 81,66 | 72,48 | 64,17 | 66,76 |
| test | 81,14 | 72,25 | 63,29 | 66,04 |

La métrica de validación figura en el `model-index` como `accuracy = 81.66` con `verified: false`. El autor documenta además la verificación de reproducción: sobre las 10.000 imágenes de validación, esta copia produce la misma etiqueta que las predicciones publicadas por SysCV para todas las imágenes, con coincidencia de puntuaciones de clase dentro de 2e-06 en GPU (RTX 4070 SUPER, CUDA 11.8, TF32 desactivado) y de 1e-06 en CPU sobre 20 imágenes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 11,19 M de parámetros, el modelo en FP32 ocupa del orden de 45 MB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA 11.8 compatible; el autor reporta 0,005 s/imagen en una RTX 4070 SUPER incluyendo decodificación JPEG. No se documentan velocidades para A100 o H100.
- GPU consumer: sí, cabe en cualquier GPU consumer moderna; también funciona en CPU (0,01 s/imagen con 8 hilos).
- Despliegue: el repositorio incluye `infer.py` y entornos fijados (`env/requirements-cu118.txt` para NVIDIA y `env/requirements-cpu.txt`). La librería es MMClassification 0.25.0 sobre mmcv-full 1.7.2 y torch 2.0.1 en Python 3.10. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,005 s/imagen en RTX 4070 SUPER y 0,01 s/imagen en CPU de 8 hilos, según el autor.
- Carga de pesos con `torch.load(weights_only=True)`; se recomienda un entorno virtual limpio.

## Comparativa con modelos similares

No se han publicado en la información disponible comparaciones con otros modelos de *weather tagging* sobre BDD100K. Como referencia de categoría, se puede contrastar con el propio zoo de SysCV, que incluye variantes de backbone y configuraciones (por ejemplo, otras resoluciones o factores de entrenamiento), pero no se dispone de sus cifras en esta ficha.

| Modelo | Parametros | Contexto | Top-1 (val, BDD100K weather) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet-18, 5x, 224x224) | 11,19 M | no aplica | 81,66 | bdd100k (solo investigación) | Hugging Face (espejo) |
| Otras variantes del zoo SysCV | no disponible | no aplica | no disponible | Apache-2.0 (config) / bdd100k (pesos) | host original `dl.cv.ethz.ch` fuera de servicio |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se entrenaron con BDD100K y quedan bajo la licencia BDD100K, limitada a uso educativo, de investigación y sin ánimo de lucro. No está permitido el uso comercial sin autorización.
- Una sola etiqueta por imagen: el modelo asigna una única clase meteorológica, sin detección de condiciones mixtas ni localización espacial.
- Clase `undefined`: el rendimiento macro (precisión 72,48, recall 64,17, F1 66,76 en validación) es notablemente inferior a la exactitud top-1, lo que indica confusión entre clases y un peso relevante de la clase indefinida.
- Riesgo de sesgo de dominio: entrenado exclusivamente con BDD100K (escenas de conducción de determinadas regiones y cámaras), puede degradarse en otras geografías, sensores, horarios o climatologías no representadas.
- Sin pesos preentrenados en el backbone: el entrenamiento parte de cero, lo que limita la generalización frente a alternativas con inicialización ImageNet.
- Entorno frágil: depende de versiones antiguas y fijadas (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10); la instalación fuera de ese entorno no está garantizada.
- Procedencia del espejo: los pesos se recuperaron de la Wayback Machine; aunque el autor verifica MD5 y reproducción exacta, la cadena de custodia original no está disponible en el host de ETH Zúrich.
- No apto para decisiones de seguridad crítica por sí solo: la etiqueta meteorológica es una señal auxiliar y no sustituye a sensores físicos ni a sistemas certificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet18-5x-224x224-weather
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-resnet18-5x-224x224-weather/blob/main/LICENSE.txt
- Zoo de modelos SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración de SysCV para este modelo: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/resnet18_5x_224x224_weather_tag_bdd100k.py
- Paper de ResNet: https://arxiv.org/abs/1512.03385
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
