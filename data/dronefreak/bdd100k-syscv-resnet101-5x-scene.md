# dronefreak/bdd100k-syscv-resnet101-5x-scene

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet101-5x-scene` es un clasificador de imágenes basado en ResNet-101 que asigna a cada fotograma de conducción una única etiqueta de escena entre siete posibles: túnel, residencial, aparcamiento, indefinido, calle urbana, gasolinera y autopista. Lo publica el usuario dronefreak como espejo de un checkpoint del zoo de modelos de BDD100K mantenido por SysCV (ETH Zurich), cuyo servidor original `dl.cv.ethz.ch` está fuera de servicio; los pesos se recuperaron de una captura de Wayback Machine del 29 de enero de 2025.

El modelo resuelve una tarea acotada pero útil en pipelines de conducción autónoma y análisis de vídeo: el etiquetado de contexto de escena, que permite segmentar grabaciones por tipo de entorno y alimentar etapas posteriores de percepción o selección de datos. No es un modelo generativo ni multimodal: es un clasificador puro de imagen con 42,6 millones de parámetros y una ventana de entrada fija de 640 x 640 píxeles.

Su relevancia actual es fundamentalmente práctica: ofrece una reproducción verificada del checkpoint original (misma etiqueta que las predicciones publicadas por SysCV en las 10.000 imágenes de validación, con diferencias de score por debajo de 1e-06) junto con un entorno fijado, un script de inferencia y pesos en safetensors. Es, por tanto, un artefacto de referencia para quien necesite el modelo original sin depender de un host caído.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-101 (CNN con conexiones residuales) con cabeza LinearClsHead |
| Parametros totales | 42.619.847 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen; entrada fija de 640 x 640 píxeles) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye `model.safetensors` en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades de texto) |
| Licencia | BDD100K (`other`): uso educativo, de investigación y sin ánimo de lucro |
| Formato de pesos | safetensors (con equivalentes `.pth`; config y resultados originales en `original/`) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-101 clásica (Deep Residual Learning for Image Recognition, CVPR 2016) con una cabeza de clasificación lineal sobre siete clases de escena. La entrada es un recorte central de 640 x 640 píxeles de la imagen a resolución completa, sin redimensionado, normalizado con media y desviación típica de ImageNet. El config de SysCV no define pesos preentrenados para el backbone, por lo que el entrenamiento parte de inicialización aleatoria.

El entrenamiento usa el split de entrenamiento de BDD100K (70.000 imágenes) durante 60 épocas (programa 5x), con SGD de tasa de aprendizaje 0,1, momento 0,9, weight decay 0,0001, decaimiento de la tasa en las épocas 30 y 45, batch de 48 (4 GPU x 12 imágenes) y aumentación basada en recortes aleatorios de 640 x 640 y volteos horizontales. No se documenta RLHF, DPO ni ninguna innovación de decodificación: es un pipeline de visión por computador convencional supervisado.

## Capacidades

- Clasificación de escena de conducción: asigna una etiqueta entre siete clases (túnel, residencial, aparcamiento, indefinido, calle urbana, gasolinera, autopista) a una imagen o fotograma.
- Salida de scores por clase: el script `infer.py` puede volcar con `--json` la etiqueta y todas las puntuaciones por clase.
- Procesamiento de imágenes sueltas, carpetas de imágenes y vídeo: acepta rutas de imagen, directorios, archivos de vídeo (`--max-frames` para limitar) y webcam en directo (`--show`).
- Sin tool calling, sin function calling y sin capacidades de agente: no es un modelo de lenguaje.
- Sin capacidades multilingües ni de texto: no procesa ni genera lenguaje natural.
- Sin modo thinking, visión generativa, audio ni otras modalidades: exclusivamente clasificación de imagen.

## Casos de uso

- Etiquetado automático de grabaciones de flotas: procesar vídeos de dashcam y segmentarlos por tipo de escena (urbana, autopista, túnel) para indexar y buscar clips por contexto; el modelo procesa 0,015 s/imagen en una RTX 4070 SUPER, lo que permite tratar horas de vídeo en minutos.
- Curación de datasets para conducción autónoma: filtrar grandes volúmenes de imágenes por escena antes de anotarlas manualmente, priorizando clases poco representadas como túneles o gasolineras.
- Enrutado de pipelines de percepción: usar la etiqueta de escena para activar módulos especializados (por ejemplo, un detector adaptado a autopista frente a uno adaptado a calle urbana) en un sistema de percepción por etapas.
- Análisis de escenas nocturnas y diurnas: el autor valida el modelo en clips de día y de noche de BDD100K, lo que lo hace utilizable en estudios de robustez frente a condiciones de iluminación.
- Monitorización de entornos en vehículos industriales o logística: clasificar el contexto de circulación para telemetría agregada (proporción de tiempo en túnel, autopista o aparcamiento) sin enviar vídeo a la nube.
- Reproducción de resultados académicos: servir como checkpoint de referencia verificado para comparar contra el zoo de SysCV en investigaciones sobre etiquetado de escena en BDD100K.
- Demostraciones en tiempo real: con `python infer.py 0 --show` se puede ejecutar sobre webcam, útil para prototipos de bajo coste en GPU de consumo.

## Benchmarks y rendimiento

Resultados declarados por el autor, procedentes de los ficheros de score de SysCV. Precisión, recall y F1 son medias macro sobre las 7 clases (incluida `undefined`).

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 77,51 | 47,50 | 48,43 | 47,40 |
| test | 77,06 | 53,07 | 46,09 | 46,14 |

El autor verifica reproducción exacta sobre las 10.000 imágenes de validación: misma etiqueta que las predicciones publicadas por SysCV para cada imagen y scores coincidentes hasta 1e-06 en GPU (CUDA 11.8, RTX 4070 SUPER, TF32 desactivado) y en CPU sobre 20 imágenes. El MD5 de los pesos (`be32ef1b99765429f158e30061552f76`) coincide con el fichero MD5 de SysCV.

Rendimiento de inferencia declarado: 0,015 s/imagen en RTX 4070 SUPER (incluyendo decodificación JPEG) y 0,34 s/imagen en CPU con 8 hilos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 42,6 millones de parámetros en FP32 el modelo ocupa aproximadamente 170 MB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA 11.8; el autor reporta 0,015 s/imagen en una RTX 4070 SUPER. Para lotes grandes, A100 o H100 aportan margen, aunque el cuello de botella es la decodificación de imagen más que el cómputo.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna (RTX 30/40 series, e incluso modelos con 4 GB). También hay entorno CPU (`env/requirements-cpu.txt`).
- Opciones de despliegue: entorno fijado con torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 sobre Python 3.10, instalable con `uv pip install -r env/requirements-cu118.txt`; script `infer.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,015 s/imagen en RTX 4070 SUPER (unos 66 imágenes/s); 0,34 s/imagen en CPU de 8 hilos (unos 3 imágenes/s).

## Comparativa con modelos similares

No se dispone de datos de otros clasificadores de escena en BDD100K dentro de la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencias cualitativas:

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet-101 5x scene) | 42,6 M | Clasificación de escena BDD100K (7 clases) | 640 x 640 px | BDD100K (solo investigación) | Hugging Face (espejo) |
| Otros modelos del zoo SysCV (tagging) | no disponible | Etiquetado de escena y atributos en BDD100K | no disponible | Apache-2.0 (config) / BDD100K (pesos) | Servidor original caído; espejos no verificados |
| Backbones genéricos ImageNet (p. ej. ResNet-50) | no disponible | Clasificación general de imágenes | variable | variable | Amplia |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K, que limita el uso a fines educativos, de investigación y sin ánimo de lucro. El uso comercial requiere revisar los términos y probablemente no está permitido sin acuerdo adicional.
- Granularidad muy limitada: solo siete clases de escena y una etiqueta por imagen; no detecta objetos, no segmenta y no describe la escena.
- Clase `undefined`: presente en el conjunto de clases; una proporción de imágenes quedará sin etiqueta informativa, lo que afecta a la precisión media macro (47,50 en validación frente a 77,51 de top-1).
- Riesgo de sesgo geográfico y de dominio: entrenado exclusivamente con BDD100K, mayoritariamente grabaciones de Estados Unidos; el rendimiento puede degradarse en otras regiones, climas o montajes de cámara.
- Entrada rígida: recorte central de 640 x 640 sin redimensionado; imágenes con otra relación de aspecto o resolución pueden perder información relevante en los bordes.
- Sin pesos preentrenados en el config original: el modelo no aprovecha inicialización ImageNet, lo que puede limitar su robustez frente a clases poco frecuentes.
- Dependencia de un entorno antiguo: torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 requieren un entorno virtual limpio; la integración en stacks modernos puede requerir trabajo adicional.
- Sin datos de calibración ni de incertidumbre: los scores por clase no están calibrados y no deben interpretarse como probabilidades fiables sin post-procesado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de etiquetas erróneas en escenas ambiguas (por ejemplo, transiciones entre urbano y autopista).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet101-5x-scene
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-resnet101-5x-scene/blob/main/LICENSE.txt
- Zoo de modelos SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/resnet101_5x_scene_tag_bdd100k.py
- Paper de ResNet: https://arxiv.org/abs/1512.03385
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K: Yu et al., "BDD100K: A Diverse Driving Dataset for Heterogeneous Multitask Learning", CVPR 2020
