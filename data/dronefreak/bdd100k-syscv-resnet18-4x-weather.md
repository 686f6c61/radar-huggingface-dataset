# dronefreak/bdd100k-syscv-resnet18-4x-weather

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet18-4x-weather` es un clasificador de imágenes basado en ResNet-18 que asigna a cada fotograma de conduccion una unica etiqueta meteorologica entre siete posibles: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` y `foggy`. No es un modelo original de este autor: se trata de un espejo (mirror) de un checkpoint del zoo de modelos de BDD100K mantenido por SysCV (ETH Zurich), cuyos pesos originales estaban alojados en `dl.cv.ethz.ch`, un host actualmente fuera de linea. El autor los recupero desde una captura de Wayback Machine del 29 de enero de 2025 y anadio un entorno de dependencias fijado y un script de inferencia.

El modelo resuelve una tarea auxiliar (tagging) dentro del ecosistema de conduccion autonoma: etiquetar automaticamente las condiciones meteorologicas de un conjunto de datos de escenas de conduccion. Con 11,19 millones de parametros y una entrada de recorte central de 640x640 pixeles, es un modelo pequeno, rapido y facil de desplegar, pensado mas como componente de preprocesado o filtrado que como modelo de percepcion principal.

Su relevancia actual es principalmente de reproducibilidad: permite recuperar y ejecutar un checkpoint que de otro modo estaria perdido, con verificacion exacta contra las predicciones publicadas por SysCV (misma etiqueta en las 10.000 imagenes de validacion y diferencias de puntuacion por clase inferiores a 2e-06). La licencia heredada de BDD100K limita el uso a fines educativos, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con conexiones residuales) con cabeza `LinearClsHead` (MMClassification) |
| Parametros totales | 11.189.703 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 640x640) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en safetensors y `.pth`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificacion de imagenes; las etiquetas de salida estan en ingles) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`); uso educativo, de investigacion y sin animo de lucro |
| Formato de pesos | safetensors (`model.safetensors`, mismos tensores que el `.pth` original) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 estandar, descrita en *Deep Residual Learning for Image Recognition* (CVPR 2016), adaptada como clasificador de 7 clases mediante una cabeza lineal. La entrada es un recorte central de 640x640 pixeles de la imagen a resolucion completa, sin redimensionado, en RGB y normalizada con media y desviacion tipica de ImageNet. El config de SysCV no define pesos preentrenados para el backbone, por lo que el entrenamiento parte de inicializacion aleatoria.

El entrenamiento se realizo sobre las 70.000 imagenes del split de train de BDD100K durante 48 epocas (la variante "4x"), con SGD (learning rate 0.1, momentum 0.9, weight decay 0.0001), decaimiento del learning rate en las epocas 24 y 36, batch de 48 (4 GPU x 12 imagenes) y aumentacion consistente en recortes aleatorios de 640x640 y volteos horizontales. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision. La innovacion destacable no esta en el modelo sino en el proceso de recuperacion: pesos validados por MD5 contra el fichero original de SysCV y reproduccion exacta de las predicciones publicadas.

## Capacidades

- Clasificacion de imagenes de escenas de conduccion en una de siete etiquetas meteorologicas: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy`, `foggy`.
- Salida de puntuaciones por clase (no solo la etiqueta top-1), accesible con la opcion `--json` del script de inferencia.
- Procesamiento de imagenes sueltas, carpetas de imagenes, ficheros de video y flujo de webcam (`infer.py 0 --show`).
- Limite configurable de fotogramas procesados por video (`--max-frames N`).
- Inferencia en GPU (CUDA 11.8) y en CPU, con entornos de dependencias separados y fijados.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingues; es exclusivamente un clasificador visual.
- No dispone de modo "thinking", vision generativa, audio ni generacion de texto.

## Casos de uso

- Filtrado y curado de datasets de conduccion: etiquetar automaticamente las 70.000 imagenes de train o las 10.000 de validacion de BDD100K por condicion meteorologica para construir subconjuntos equilibrados o estratificados antes de entrenar modelos de percepcion.
- Preprocesado en pipelines de conduccion autonoma: usar la etiqueta meteorologica como senal de contexto para conmutar entre modelos especializados (por ejemplo, activar un detector entrenado en lluvia cuando la etiqueta sea `rainy`), dado su coste de 0,007 s/imagen en una RTX 4070 SUPER.
- Analisis de flotas y video dashcam: procesar videos fotograma a fotograma con `infer.py drive.mov` para generar una linea temporal de condiciones meteorologicas y correlacionarla con incidencias o eventos de conduccion.
- Investigacion en robustez: evaluar como degradan su rendimiento otros modelos de vision bajo distintas condiciones etiquetadas por este clasificador, aprovechando la reproducibilidad exacta frente a las predicciones de referencia de SysCV.
- Prototipado rapido en CPU: con 0,08 s/imagen en 8 hilos de CPU, sirve para demos, notebooks y entornos sin GPU donde no se requiere tiempo real estricto.
- Verificacion de espejos y checkpoints: como referencia para comprobar la integridad de pesos recuperados (MD5 `a5128499f959df8adbb5bbeafe11a688`) y la equivalencia de predicciones en proyectos de preservacion de modelos.
- Etiquetado de webcam en directo para pruebas de concepto de sistemas de asistencia al conductor en laboratorio.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuacion de SysCV). La exactitud es en porcentaje; precision, recall y F1 son medias macro sobre las 7 clases, incluida `undefined`.

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 81.57 | 70.30 | 62.98 | 65.16 |
| test | 81.39 | 75.29 | 63.31 | 66.11 |

La metrica Top-1 de validacion (81.57) figura en el model-index con `verified: false`. El autor documenta reproduccion exacta: misma etiqueta que las predicciones publicadas de SysCV en las 10.000 imagenes de validacion y diferencias de puntuacion por clase inferiores a 2e-06 en GPU y a 4e-07 en CPU. No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 11,19 millones de parametros en FP32 los pesos ocupan aproximadamente 45 MB, por lo que el modelo cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM disponible para el runtime.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA 11.8; el autor verifico en una RTX 4070 SUPER. Tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (RTX 30xx, 40xx, e inferiores) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el repo proporciona `infer.py` con entornos fijados (`env/requirements-cu118.txt` para GPU y `env/requirements-cpu.txt` para CPU) sobre torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 en Python 3.10. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de vision de este tipo.
- Latencia y throughput: 0,007 s/imagen en RTX 4070 SUPER (incluyendo decodificacion JPEG) y 0,08 s/imagen en CPU con 8 hilos (aproximadamente 143 imagenes/s en GPU y 12,5 imagenes/s en CPU).

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos de tagging meteorologico sobre BDD100K (por ejemplo, variantes ResNet-50 o configuraciones 1x del mismo zoo de SysCV), por lo que la comparativa cuantitativa con alternativas no esta disponible.

| Modelo | Parametros | Tarea | Top-1 (val BDD100K, weather) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet-18, 4x) | 11,19 M | Tagging meteorologico (7 clases) | 81,57 | BDD100K (uso educativo/investigacion) | Hugging Face (espejo) |
| Otras variantes del zoo SysCV | no disponible | Tagging meteorologico | no disponible | Apache-2.0 (config) / BDD100K (pesos) | Host original `dl.cv.ethz.ch` fuera de linea |
| Alternativas de la misma categoria | no disponible | Clasificacion de escenas de conduccion | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente con BDD100K, un dataset de escenas de conduccion recogidas mayoritariamente en entornos urbanos y de carretera de Estados Unidos; su comportamiento en otras geografias, condiciones de iluminacion extremas o camaras no representadas puede degradarse sin que se documente en la informacion disponible.
- Riesgo de error en clases ambiguas: la clase `undefined` existe en el dataset y las metricas macro (precision 70,30, recall 62,98, F1 65,16 en validacion) reflejan un rendimiento notablemente inferior al de la exactitud top-1, lo que indica confusion entre condiciones similares (por ejemplo, `overcast` frente a `partly cloudy` o `foggy`).
- Limitacion de entrada: solo procesa un recorte central de 640x640 sin redimensionado, por lo que informacion fuera de ese recorte se descarta; imagenes de resolucion o relacion de aspecto muy distintas pueden verse afectadas.
- Restricciones de licencia: los pesos heredan la licencia de BDD100K, limitada a uso educativo, de investigacion y sin animo de lucro; el uso comercial no esta permitido segun la model card.
- Dependencia de un host caido: los pesos originales ya no estan disponibles en `dl.cv.ethz.ch`; este espejo depende de una captura de Wayback Machine, lo que anade un riesgo de preservacion a largo plazo.
- Entorno fijado y fragil: requiere Python 3.10 con torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 en un entorno virtual limpio; mezclar versiones puede romper la carga de pesos.
- Ambito limitado: no es un modelo generativo ni un detector; no debe emplearse para tareas distintas al tagging meteorologico ni como sustituto de un sistema de percepcion completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet18-4x-weather
- Licencia (LICENSE.txt en el repo): https://huggingface.co/dronefreak/bdd100k-syscv-resnet18-4x-weather/blob/main/LICENSE.txt
- Zoo de modelos de tagging de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config de SysCV para este checkpoint: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/resnet18_4x_weather_tag_bdd100k.py
- Paper de ResNet: https://arxiv.org/abs/1512.03385
- Dataset BDD100K en Hugging Face: https://huggingface.co/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): no disponible como enlace directo en la informacion proporcionada
