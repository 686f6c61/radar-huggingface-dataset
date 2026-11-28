# dronefreak/bdd100k-syscv-resnet34-4x-scene

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet34-4x-scene` es un clasificador de imágenes ResNet-34 entrenado para asignar una etiqueta de escena a cada fotograma de conducción del dataset BDD100K. Las siete clases posibles son túnel, residencial, aparcamiento, indefinido, calle urbana, gasolinera y autopista. No es un modelo generativo ni un LLM: es un clasificador de visión por computador de 21,3 millones de parámetros, empaquetado en la librería mmcls (OpenMMLab) con pesos en safetensors.

Se trata de un espejo (mirror) de un checkpoint del zoo de modelos de SysCV (ETH Zurich) para BDD100K. El host original `dl.cv.ethz.ch` está caído, por lo que los pesos se recuperaron de una captura de Wayback Machine del 29 de enero de 2025, y la configuración y resultados provienen del repositorio GitHub de SysCV. El repositorio añade un entorno fijado (PyTorch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0 sobre Python 3.10) y un script de inferencia para imágenes, vídeo y webcam.

Su relevancia es práctica: permite etiquetar escenas de conducción de forma reproducible y verificada (coincidencia exacta con las predicciones publicadas por SysCV en las 10.000 imágenes de validación), algo útil para pipelines de datos de conducción autónoma que necesiten filtrar o segmentar clips por tipo de entorno. La licencia BDD100K restringe el uso comercial, lo que limita su aplicación en producción fuera del ámbito educativo y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-34 (CNN con conexiones residuales), cabecera LinearClsHead |
| Parametros totales | 21.305.287 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagen; entrada de 640 x 640 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión; etiquetas de escena en inglés) |
| Licencia | BDD100K (educational, research and not-for-profit use); config de SysCV Apache-2.0 |
| Formato de pesos | safetensors (además del `.pth` original; `model.safetensors` contiene los mismos tensores) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-34 estándar (Deep Residual Learning for Image Recognition, CVPR 2016) con una cabeza de clasificación lineal (LinearClsHead de mmcls) sobre siete clases de escena. La entrada es un recorte central de 640 x 640 píxeles de la imagen a resolución completa, sin redimensionado, en RGB con media y desviación típica de ImageNet.

El entrenamiento se realizó sobre el split de entrenamiento de BDD100K (70.000 imágenes) durante 48 épocas (configuración "4x"), con SGD de tasa de aprendizaje 0,1, momento 0,9, weight decay 0,0001, decaimiento de la tasa en las épocas 24 y 36, batch de 48 imágenes (4 GPUs x 12) y aumentación consistente en recortes aleatorios de 640 x 640 y volteos horizontales. La configuración no fija pesos preentrenados para el backbone. No se documenta uso de RLHF/DPO ni de técnicas de decodificación especulativa, que no aplican a un clasificador de este tipo.

## Capacidades

- Clasificación de escena de conducción en siete categorías: túnel, residencial, aparcamiento, indefinido, calle urbana, gasolinera y autopista.
- Inferencia sobre imágenes sueltas, carpetas de imágenes, ficheros de vídeo y webcam (script `infer.py`).
- Salida opcional en JSON con la etiqueta y todas las puntuaciones de clase por imagen o fotograma (`--json`), y limitación de fotogramas procesados (`--max-frames`).
- Etiquetado a nivel de fotograma, lo que permite anotar clips completos de vídeo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio; es exclusivamente visión.

## Casos de uso

- Filtrado de datasets de conducción: recorrer un corpus de vídeo y etiquetar cada fotograma para separar clips de autopista, calle urbana o túnel antes de entrenar otros modelos (detección, segmentación o planificación).
- Curado de datasets para percepción: seleccionar automáticamente imágenes de una escena concreta (por ejemplo, gasolineras o aparcamientos) para construir subconjuntos equilibrados de validación.
- Análisis de cobertura de escenas: medir qué proporción de un corpus corresponde a cada entorno y detectar clases infrarrepresentadas antes de lanzar un entrenamiento.
- Etiquetado asistido en anotación humana: preetiquetar fotogramas con la escena para que los anotadores solo revisen, reduciendo el coste de anotación manual.
- Monitorización de flotas o vehículos: clasificar en tiempo casi real el tipo de entorno por el que circula un vehículo a partir de su cámara frontal, con 0,008 s/imagen en una RTX 4070 SUPER.
- Reproducción de resultados de investigación: al ser un espejo verificado del zoo de SysCV, sirve para replicar experimentos de tagging de BDD100K cuando el host original no está disponible.
- Prototipado rápido en CPU: con 0,15 s/imagen en 8 hilos de CPU, permite validar pipelines sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuaciones de SysCV). Exactitud en %; precisión, recall y F1 son medias macro sobre las 7 clases (incluida `undefined`):

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 77,47 | 58,76 | 49,16 | 49,13 |
| test | 77,40 | 56,52 | 45,23 | 46,29 |

El autor indica que, sobre las 10.000 imágenes de validación, esta copia reproduce exactamente la etiqueta publicada por SysCV para cada imagen y las puntuaciones coinciden con un margen de 3e-06 en GPU (RTX 4070 SUPER, CUDA 11.8, TF32 desactivado); en CPU, sobre 20 imágenes, la mayor diferencia de puntuación es 5e-07. El MD5 de los pesos (`9aec0093816f654fd79d344c187ff4c2`) coincide con el de SysCV. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 21,3 millones de parámetros en FP32 el modelo ocupa del orden de 85 MB de pesos, más el coste de activaciones de una entrada de 640 x 640. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA 11.8; el autor reporta 0,008 s/imagen en una RTX 4070 SUPER (incluyendo decodificación JPEG). GPUs de gama alta como A100 o H100 no son necesarias para este modelo.
- Cabe en GPU consumer: sí, en cualquier RTX o GTX moderna con suficiente memoria (prácticamente cualquiera con 2 GB o más).
- Opciones de despliegue: entorno Python fijado con torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 (Python 3.10), mediante `uv` y los ficheros `env/requirements-cu118.txt` (GPU) o `env/requirements-cpu.txt` (CPU). El script `infer.py` cubre imagen, carpeta, vídeo y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de visión de mmcls.
- Latencia y throughput: 0,008 s/imagen en RTX 4070 SUPER y 0,15 s/imagen en CPU con 8 hilos (datos del autor).

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables de tagging de escena sobre BDD100K (parámetros, contexto, rendimiento o licencia), por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, el propio repositorio se presenta como espejo del modelo de tagging de escena de SysCV para BDD100K, y su backbone es una ResNet-34 estándar; cualquier comparación con otras arquitecturas de clasificación de escenas requeriría datos que no se han publicado aquí.

## Limitaciones y advertencias

- Licencia BDD100K: uso educativo, de investigación y sin ánimo de lucro; el uso comercial no está permitido sin autorización adicional.
- Modelo de clasificación de escena, no generativo: no responde a instrucciones, no razona y no genera texto.
- Solo reconoce siete clases de escena; cualquier entorno fuera de esa taxonomía se etiqueta como `undefined` o se fuerza a la clase más parecida.
- El rendimiento macro es moderado (F1 de 49,13 en validación y 46,29 en test), lo que indica dificultades con clases minoritarias pese a la exactitud Top-1 del 77,47 %.
- Entrenado exclusivamente con BDD100K (imágenes de conducción), por lo que no se espera buena generalización a otros dominios visuales.
- Sensible a sesgos del dataset de origen (geografía, condiciones meteorológicas, hora del día, tipo de vía); el autor no documenta análisis de sesgo específicos.
- Riesgo de alucinación en el sentido de clasificaciones erróneas confiadas: al ser un clasificador, siempre asigna una de las siete etiquetas, aunque la imagen no encaje claramente en ninguna.
- Dependencia de un entorno antiguo y fijado (torch 2.0.1, mmcv-full 1.7.2, Python 3.10); se recomienda un venv limpio y no mezclar con instalaciones existentes.
- Los pesos proceden de un espejo recuperado de Wayback Machine; aunque el autor verifica MD5 y reproducción exacta, conviene validar la integridad en despliegues críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet34-4x-scene
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-resnet34-4x-scene/blob/main/LICENSE.txt
- Repositorio de modelos de SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración de SysCV del modelo: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/resnet34_4x_scene_tag_bdd100k.py
- Paper de ResNet (Deep Residual Learning for Image Recognition): https://arxiv.org/abs/1512.03385
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
