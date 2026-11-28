# dronefreak/bdd100k-syscv-resnet18-4x-scene

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet18-4x-scene` es un clasificador de imágenes basado en ResNet-18 que asigna una etiqueta de escena de conducción a cada fotograma. Lo publica el usuario dronefreak como espejo de un checkpoint del zoo de modelos de SysCV (ETH Zurich) para BDD100K, recuperado de la Wayback Machine tras la caída del host original `dl.cv.ethz.ch`. Resuelve una tarea concreta de etiquetado semántico de escenas: clasificar una imagen entre siete clases (túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera y autopista).

Técnicamente es una CNN residual clásica de 11.189.703 parámetros, con entrada de recorte central de 640×640 píxeles sin redimensionado, entrenada durante 48 épocas sobre las 70.000 imágenes de entrenamiento de BDD100K. No es un modelo generativo ni un modelo de lenguaje: es un componente de percepción para pipelines de visión por computador en conducción autónoma. El repositorio añade un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0) y un script de inferencia que acepta imágenes, vídeo y webcam.

Su relevancia actual es de tipo práctico y de preservación: recupera pesos que ya no estaban disponibles públicamente, verifica reproducción exacta frente a las predicciones publicadas por SysCV y ofrece un artefacto reproducible en CPU y GPU. La licencia BDD100K restringe el uso a fines educativos, de investigación y sin ánimo de lucro, lo que limita su uso comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual) con LinearClsHead, framework mmcls |
| Parametros totales | 11.189.703 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 640×640 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y .pth; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas de escena en inglés) |
| Licencia | BDD100K (educational, research and not-for-profit use); config de SysCV bajo Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` original |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 estándar, presentada en *Deep Residual Learning for Image Recognition* (CVPR 2016), con bloques residuales y una cabeza de clasificación lineal (`LinearClsHead`). El backbone no se inicializa con pesos preentrenados según la configuración de SysCV. La entrada es un recorte central de 640×640 píxeles de la imagen a resolución completa, sin redimensionado, normalizado con media y desviación estándar de ImageNet.

El entrenamiento usa las 70.000 imágenes del split de entrenamiento de BDD100K durante 48 épocas (denominado "4x"), con SGD de tasa de aprendizaje 0.1, momento 0.9, weight decay 0.0001, decaimiento de la tasa en las épocas 24 y 36, batch de 48 (4 GPU × 12 imágenes) y aumentación de recortes aleatorios de 640×640 con volteos horizontales. No se documenta RLHF, DPO ni fases de ajuste adicionales, algo esperable en un clasificador supervisado. La innovación destacable no está en la arquitectura sino en la ingeniería de reproducibilidad: el espejo verifica que las etiquetas coinciden con las predicciones publicadas de SysCV en las 10.000 imágenes de validación y que las puntuaciones por clase coinciden con un margen de 2e-06, además de comprobar el MD5 de los pesos.

## Capacidades

- Clasificación de escenas de conducción en siete clases: túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera y autopista.
- Inferencia sobre imágenes individuales, carpetas de imágenes, archivos de vídeo y webcam (script `infer.py`).
- Salida de la etiqueta top-1 y, con `--json`, la puntuación de todas las clases por imagen o fotograma.
- Control del número de fotogramas procesados en vídeo mediante `--max-frames`.
- Ejecución en CPU y en GPU CUDA 11.8 con entornos fijados y separados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá del etiquetado de escena.
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Etiquetado automático de datasets de conducción: procesar lotes de imágenes o vídeos para asignar la etiqueta de escena a cada fotograma y enriquecer metadatos de entrenamiento o evaluación de otros modelos.
- Filtrado y segmentación de corpus por escena: separar clips de autopista, túnel o calle urbana antes de entrenar detectores o segmentadores específicos por dominio.
- Preprocesado en pipelines de percepción: usar la etiqueta de escena como señal de contexto para conmutar entre configuraciones de otros módulos (por ejemplo, distintos umbrales en detección según si es autopista o aparcamiento).
- Análisis de flotas y revisión de grabaciones: clasificar automáticamente horas de vídeo de cámaras de vehículos para localizar tramos de interés (túneles, gasolineras, zonas residenciales) sin revisión manual.
- Prototipado rápido en investigación: al ser un modelo pequeño (11,2 M de parámetros) y con inferencia de 0,007 s/imagen en RTX 4070 SUPER, sirve como baseline ligero en experimentos de etiquetado de escena.
- Validación de reproducibilidad y auditoría: su verificación exacta frente a las predicciones de SysCV lo hace útil como referencia para comprobar pipelines de inferencia propios.
- Demos y herramientas interactivas: el modo webcam (`infer.py 0 --show`) permite construir demostraciones en vivo del etiquetado de escena.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (procedentes de los ficheros de puntuaciones de SysCV; precisión, recall y F1 son medias macro sobre las 7 clases, incluida `undefined`):

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 78,07 | 49,86 | 48,25 | 48,33 |
| test | 77,48 | 56,14 | 44,87 | 46,08 |

El resultado de validación figura en el model-index con `verified: false`. No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 11,2 M de parámetros en precisión completa el peso ronda decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA 11.8; el autor reporta 0,007 s/imagen en una RTX 4070 SUPER (incluyendo decodificación JPEG). Modelos como A100 o H100 no son necesarios.
- Cabe en GPU consumer: sí, sin restricciones prácticas (RTX 4070 SUPER verificada; cualquier GPU con suficiente memoria para el modelo y el lote).
- CPU: 0,08 s/imagen con 8 hilos; existe entorno CPU (`env/requirements-cpu.txt`).
- Opciones de despliegue: script `infer.py` del repositorio con entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 0,007 s/imagen en RTX 4070 SUPER y 0,08 s/imagen en CPU de 8 hilos, según el autor.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos de etiquetado de escena sobre BDD100K para establecer una comparativa rigurosa de parámetros, contexto y rendimiento.

| Modelo | Parametros | Tarea | Top-1 val (BDD100K) | Licencia |
|---|---|---|---|---|
| bdd100k-syscv-resnet18-4x-scene | 11.189.703 | Clasificación de escena (7 clases) | 78,07 | BDD100K (uso educativo/investigación) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia, limitada a uso educativo, de investigación y sin ánimo de lucro; el uso comercial requiere evaluar condiciones adicionales no cubiertas en la información disponible.
- Rendimiento desequilibrado entre clases: la precisión y el recall macro (49,86 y 48,25 en validación) son muy inferiores a la accuracy top-1 (78,07), lo que indica un fuerte sesgo hacia las clases mayoritarias y un mal rendimiento en clases minoritarias como gasolinera o túnel.
- Clase `undefined`: el modelo incluye una clase residual que puede absorber imágenes ambiguas y degradar la utilidad práctica de la etiqueta.
- Entrada rígida: requiere un recorte central de 640×640 sin redimensionado; imágenes con otra relación de aspecto o resoluciones muy distintas pueden perder información relevante en los bordes.
- Sin preentrenamiento del backbone: el autor indica que la configuración no fija pesos preentrenados, lo que puede limitar la generalización fuera de la distribución de BDD100K.
- Dominio acotado: entrenado exclusivamente con imágenes de conducción de BDD100K; no se debe esperar un comportamiento fiable en otros dominios visuales.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea en escenas ambiguas o con iluminación adversa (el modelo se verificó también en clips nocturnos, pero no se reportan métricas desagregadas por condiciones).
- Sesgos geográficos y de captura: BDD100K procede de grabaciones en entornos concretos; el etiquetado puede no transferir a otras regiones o tipos de vía.
- Sin datos de cuantización ni de despliegue en formatos ligeros más allá de safetensors y `.pth`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet18-4x-scene
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-resnet18-4x-scene/blob/main/LICENSE.txt
- Configuración de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/resnet18_4x_scene_tag_bdd100k.py
- Zoo de modelos de SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Paper de ResNet: https://arxiv.org/abs/1512.03385
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K
