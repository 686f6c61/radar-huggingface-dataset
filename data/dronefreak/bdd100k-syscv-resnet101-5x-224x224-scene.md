# dronefreak/bdd100k-syscv-resnet101-5x-224x224-scene

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet101-5x-224x224-scene` es un clasificador de imágenes basado en ResNet-101 que asigna a cada fotograma de conducción una única etiqueta de escena entre siete categorías posibles: túnel, residencial, aparcamiento, no definida, calle urbana, gasolinera y autopista. No es un modelo generativo ni un LLM, sino un checkpoint de visión por computador para etiquetado de escenas de conducción autónoma, entrenado sobre el conjunto de datos BDD100K. Lo publica el usuario `dronefreak` como espejo del modelo original del zoo de modelos SysCV de ETH Zúrich, cuyo servidor de descargas `dl.cv.ethz.ch` está fuera de servicio.

La relevancia de este repositorio es fundamentalmente de preservación y reproducibilidad: recupera los pesos desde la Wayback Machine (captura del 29 de enero de 2025), los verifica contra los MD5 originales de SysCV y añade un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0 sobre Python 3.10) junto con un script de inferencia que acepta imágenes, vídeos y webcam. El autor documenta una reproducción exacta sobre las 10.000 imágenes de validación, con coincidencia de etiquetas al 100 % y diferencias de puntuación por clase inferiores a 1e-06.

Arquitectónicamente es una CNN ResNet-101 con cabeza de clasificación lineal (LinearClsHead), 42,6 millones de parámetros y entrada de 224x224 píxeles recortados de un redimensionado a 256 en el lado corto. No dispone de ventana de contexto, capacidades multilingües ni generación de texto: su única función es la clasificación de escena por fotograma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-101 (CNN con conexiones residuales) + LinearClsHead |
| Parametros totales | 42.619.847 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors/pth de precisión completa; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de clase están en inglés) |
| Licencia | bdd100k (educational, research and not-for-profit use; ver LICENSE.txt) |
| Formato de pesos | safetensors y .pth (mismos tensores); configuración en config.json y original_config.py |

## Arquitectura y entrenamiento

El modelo es una ResNet-101 estándar (He et al., CVPR 2016) adaptada a clasificación de escena con una cabeza lineal sobre las 7 clases de BDD100K. La configuración de SysCV no fija pesos preentrenados para el backbone, por lo que el entrenamiento parte de inicialización aleatoria. La entrada se preprocesa redimensionando el lado corto a 256 píxeles (una imagen 1280x720 pasa a 455x256), aplicando después un recorte central de 224x224, en RGB con media y desviación estándar de ImageNet.

El entrenamiento usa las 70.000 imágenes de entrenamiento de BDD100K durante 60 épocas (régimen 5x), con SGD de tasa de aprendizaje 0,1, momento 0,9 y weight decay 0,0001, con decaimientos de la tasa en las épocas 30 y 45. El lote es de 128 imágenes (4 GPU x 32) y la aumentación se limita a recortes aleatorios redimensionados a 224x224 y volteos horizontales. No se documenta RLHF, DPO ni ninguna innovación de decodificación, al no tratarse de un modelo generativo.

## Capacidades

- Clasificación de escena de conducción en una de 7 categorías: túnel, residencial, aparcamiento, no definida, calle urbana, gasolinera y autopista.
- Procesamiento de imágenes individuales, carpetas de imágenes, archivos de vídeo y flujo de webcam mediante `infer.py`.
- Salida de la etiqueta predicha y de las puntuaciones de todas las clases por imagen o fotograma (opción `--json`).
- Control del número de fotogramas procesados en vídeo (`--max-frames`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, matemáticas ni visión general más allá de la clasificación de escena.
- No tiene capacidades multilingües ni modo de razonamiento (thinking mode).

## Casos de uso

- Etiquetado automático de datasets de conducción: el modelo asigna una etiqueta de escena a cada fotograma de un corpus de vídeo, lo que permite preanotar o segmentar por tipo de entorno (urbano, autopista, túnel) antes de una revisión humana.
- Filtrado y muestreo de clips: dado un archivo de vídeo, `infer.py` recorre los fotogramas y permite aislar secuencias de un entorno concreto (por ejemplo, extraer solo tramos de autopista) para entrenar otros modelos o para auditoría.
- Enriquecimiento de metadatos en pipelines de datos: la salida JSON con las puntuaciones por clase se integra en un pipeline que indexa vídeos por escena para búsqueda y recuperación posteriores.
- Monitorización en tiempo real en vehículo o banco de pruebas: con 0,007 s/imagen en una RTX 4070 SUPER, el modelo puede etiquetar el entorno a decenas de fotogramas por segundo para sistemas de ayuda a la conducción o registro de contexto.
- Análisis de cobertura de datasets: comparar la distribución de escenas predichas frente a las etiquetas de un conjunto propio para detectar sesgos de recogida (por ejemplo, escasez de túneles o gasolineras).
- Docencia e investigación en visión por computador: al ser un checkpoint reproducible con entorno fijado y verificación exacta, sirve como referencia para experimentos de clasificación de escena y para comparar con arquitecturas más recientes.
- Procesamiento en CPU en entornos sin GPU: con 0,05 s/imagen en 8 hilos de CPU, es viable para lotes pequeños o validaciones puntuales.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuación de SysCV; precisión, exhaustividad y F1 son medias macro sobre las 7 clases, incluida `undefined`):

| Conjunto | Top-1 accuracy (%) | Precision (%) | Recall (%) | F1 (%) |
|---|---|---|---|---|
| val | 77,47 | 50,68 | 45,34 | 46,90 |
| test | 77,14 | 47,22 | 42,81 | 44,47 |

El autor verifica que, sobre las 10.000 imágenes de validación, esta copia produce la misma etiqueta que las predicciones publicadas por SysCV para todas las imágenes y que cada puntuación de clase coincide con un margen de 1e-06 (GPU, CUDA 11.8, RTX 4070 SUPER, TF32 desactivado). En CPU, sobre 20 imágenes de validación, las etiquetas coinciden y la diferencia máxima de puntuación es de 5e-07. El MD5 de los pesos (`d1394dd08dce4c7aac0665bd32e3d0d9`) coincide con el fichero MD5 de SysCV.

## Requisitos de hardware

- VRAM estimada para inferencia: no se documenta explícitamente; con 42,6 millones de parámetros en precisión completa, el peso de los tensores ronda los 170 MB, por lo que la VRAM necesaria es modesta (del orden de 1-2 GB incluyendo activaciones y overhead del runtime, estimación no verificada en la información disponible).
- GPU recomendadas: el autor reporta 0,007 s/imagen (incluyendo decodificación JPEG) en una RTX 4070 SUPER; cualquier GPU NVIDIA con soporte CUDA 11.8 es suficiente.
- Cabe en GPU de consumo: sí, el entorno CUDA 11.8 se ha probado en una RTX 4070 SUPER; también existe entorno CPU (`env/requirements-cpu.txt`).
- CPU: 0,05 s/imagen con 8 hilos.
- Opciones de despliegue: el repositorio proporciona `infer.py` sobre mmcls 0.25.0, mmcv-full 1.7.2 y torch 2.0.1 en Python 3.10; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo de visión).
- Latencia y throughput: 0,007 s/imagen en RTX 4070 SUPER y 0,05 s/imagen en CPU de 8 hilos, según el autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos de clasificación de escena en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Top-1 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bdd100k-syscv-resnet101-5x-224x224-scene | 42,6 M | no aplica | 77,47 % | bdd100k (solo investigación/educación) | Hugging Face (espejo) |
| Otros modelos del zoo SysCV (tagging) | no disponible | no aplica | no disponible | Apache-2.0 (config) / bdd100k (pesos) | Repositorio GitHub de SysCV |
| Alternativas de clasificación de escena | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K, limitada a uso educativo, de investigación y sin ánimo de lucro; no se permite uso comercial sin autorización.
- Etiqueta única por imagen: el modelo asigna una sola escena por fotograma, sin detección de objetos, segmentación ni múltiples etiquetas simultáneas.
- Clase `undefined`: el rendimiento macro es bajo (F1 de 46,90 % en validación) debido en parte a la clase no definida y al desequilibrio entre clases; la precisión y exhaustividad macro rondan el 45-50 %.
- Riesgo de error en escenas ambiguas o poco representadas: túneles, gasolineras y aparcamientos son clases minoritarias, por lo que la fiabilidad puede ser menor que en calle urbana o autopista.
- Dependencia de un entorno antiguo: requiere torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 sobre Python 3.10, lo que puede complicar la integración en stacks modernos.
- Sin pesos preentrenados en el backbone según la configuración de SysCV, lo que limita la generalización fuera del dominio de BDD100K.
- No es un modelo generativo: no produce texto, código ni respuestas; no admite prompts ni instrucciones.
- Procedencia de los pesos: recuperados de la Wayback Machine al estar caído el host original; el autor verifica MD5 y reproducción exacta, pero conviene validar en el propio entorno antes de usos críticos.
- Sin datos documentados sobre sesgos demográficos o geográficos más allá de los inherentes al dataset BDD100K (recogido principalmente en Estados Unidos).

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet101-5x-224x224-scene
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-resnet101-5x-224x224-scene/blob/main/LICENSE.txt
- Zoo de modelos SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/resnet101_5x_224x224_scene_tag_bdd100k.py
- Paper de ResNet: https://arxiv.org/abs/1512.03385
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
