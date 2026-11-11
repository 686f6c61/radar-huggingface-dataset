# Intel/scene-change-detection

## Resumen

Scene Change Detection es un caso de uso de analitica de video publicado por Intel en Hugging Face bajo el identificador `Intel/scene-change-detection`. No es un modelo neuronal ni un conjunto de pesos entrenados: es una receta de vision por computador clasica implementada con OpenCV que detecta cambios abruptos o sostenidos en la imagen de una camara comparando el histograma de color de cada fotograma con el del fotograma anterior mediante la distancia de Bhattacharyya. Cuando esa distancia supera un umbral configurable, se emite un evento de cambio de escena.

El repositorio tiene un tamano practicamente nulo (0,0 GB) porque no contiene pesos: incluye la model card, un script `export_and_quantize.sh` que descarga y concatena clips de ejemplo con cortes duros para construir un video de prueba, y un `opencv_sample.py` de referencia. La libreria declarada es `opencv` y el motor de inferencia es la propia CPU a traves de OpenCV, con soporte opcional de la API transparente `cv2.UMat` para GPUs Intel. No aplica ninguna precision numerica de red neuronal (FP32, INT8, etc.).

Su relevancia es practica: Intel lo enmarca dentro de su stack de analitica para metro (vigilancia de camaras en entornos de transporte) y lo presenta como una alternativa deliberadamente no neuronal, mas barata y robusta que ejecutar un detector de objetos para esta senal concreta. Sirve como pre-filtro para reinicializar trackers, para segmentar grabaciones largas en escenas indexables, para validar que un feed ha cambiado a la fuente esperada o para alertar cuando una camara PTZ se ha reubicado. La licencia es MIT, lo que permite uso comercial sin restricciones practicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (vision clasica: histograma HSV normalizado y distancia de Bhattacharyya sobre OpenCV) |
| Parametros totales | No disponible (no hay pesos; el repositorio ocupa 0,0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesa fotograma a fotograma; comparacion con el fotograma inmediatamente anterior) |
| Tipos de cuantizacion | No aplica; el autor indica "Supported Precisions: Not applicable" |
| Idiomas soportados | Ingles (`en`) en documentacion y etiquetas; el algoritmo es independiente del idioma |
| Licencia | MIT |
| Formato de pesos | No disponible (no hay pesos; el codigo de referencia es Python sobre OpenCV) |

## Arquitectura y entrenamiento

No existe entrenamiento. La "arquitectura" es un pipeline determinista de dos etapas: conversion del fotograma BGR a HSV y calculo de un histograma 2D de 50 bins de tono por 60 bins de saturacion con rango `[0, 180, 0, 256]`, normalizado con `cv2.norm_minmax` al intervalo [0, 1]; a continuacion se compara con el histograma del fotograma previo mediante `cv2.compareHist` con la metrica `HISTCMP_BHATTACHARYYA`, que devuelve un valor en [0, 1] donde valores mayores indican mas cambio. Se declara cambio de escena cuando la distancia es igual o superior a `CHANGE_THRESHOLD`, fijado en 0,45 en el ejemplo del autor.

No hay dataset de entrenamiento, ni fases de RLHF o DPO, ni innovaciones de atencion. La unica decision de diseno destacable es la eleccion consciente de una senal de bajo coste computacional: el autor argumenta que la puntuacion por histograma es mas robusta y mucho mas barata que ejecutar un detector para detectar cortes o reubicaciones de camara, y remite al caso de uso `object-detection` del mismo stack cuando se necesita comprension semantica de la escena (por ejemplo, distinguir "anden" de "vestibulo"). El script auxiliar `export_and_quantize.sh` no exporta ni cuantiza ningun modelo a pesar del nombre: descarga varios clips distintos y los une con cortes duros en `test_video.mp4` (cuatro escenas de 2 segundos) para garantizar un cambio de escena cada dos segundos.

## Capacidades

- Deteccion de eventos de cambio de escena: cortes de plano, reubicacion de camara y cambios grandes del campo de vision, marcados cuando la distancia de Bhattacharyya supera el umbral.
- Registro de eventos por terminal: imprime numero de fotograma y distancia que disparo el evento, y un total acumulado al final del video, de modo que la salida puede redirigirse a un fichero o a otro proceso.
- Anotacion de video: escribe `output_opencv.mp4` con la distancia por fotograma superpuesta y color verde o rojo segun se haya superado el umbral.
- Ejecucion en CPU por defecto; soporte opcional de GPU Intel envolviendo los fotogramas en `cv2.UMat` para usar la API transparente de OpenCV.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision semantica, audio ni modo de pensamiento: no es un modelo de lenguaje ni un detector de objetos.
- Sin capacidades multilingues en el sentido de NLP; el procesamiento es puramente de imagen.

## Casos de uso

- Alertas de reubicacion de camaras PTZ: comparar el histograma del fotograma actual con el anterior y emitir un evento cuando una camara motorizada se mueve a una vista nueva, de forma que el operador pueda validar la nueva posicion o revertirla.
- Segmentacion de grabaciones largas para indexacion: recorrer un video completo y usar los eventos detectados como marcas de corte para dividir la grabacion en escenas navegables, sin coste de GPU.
- Validacion de conmutacion de fuentes en un feed: confirmar que una senal ha cambiado realmente a la fuente esperada comparando la firma de color antes y despues del cambio.
- Pre-filtro para analitica posterior: reinicializar trackers de seguimiento cuando se detecta un cambio de escena, evitando que un tracker arrastre identidades entre planos distintos.
- Monitorizacion de bajo coste en despliegues de transporte (metro): ejecucion en CPU dentro del stack Intel DLStreamer 2026.3.0 RC1, adecuada para nodos edge donde no se quiere reservar acelerador para una senal tan simple.
- Registro de eventos en pipelines automatizados: consumir las lineas impresas por el script (fotograma y distancia) como log ligero que alimente alertas o sistemas de auditoria sin necesidad de inspeccionar el video anotado.
- Prototipado y validacion de umbrales: usar el video de prueba generado por `export_and_quantize.sh` para calibrar `CHANGE_THRESHOLD` antes de desplegar en grabaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de precision, recall, latencia ni throughput; unicamente referencia una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU para el conjunto del stack, sin cifras en la documentacion proporcionada.

## Requisitos de hardware

- VRAM: no aplica; el calculo es de histograma en CPU y no requiere memoria de GPU.
- GPU recomendadas: no aplica para el camino por defecto. El autor menciona el uso opcional de `cv2.UMat` para GPUs Intel mediante la API transparente de OpenCV; no se especifican modelos concretos.
- NPU: el autor indica explicitamente que no aplica, porque la comparacion de histogramas no es una carga neuronal.
- Cabe en cualquier equipo de consumo: los requisitos declarados son Python 3.11 o superior, OpenVINO (ultima version), `ffmpeg` para construir el video de muestra y OpenCV accesible desde el entorno virtual.
- Despliegue: script Python sobre OpenCV; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este caso de uso. El stack objetivo es Intel DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030 y OpenVINO Runtime 2026.5.0.dev20261030, marcado por el autor como stack de desarrollo y no como version estable.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. El autor no propone alternativas neuronales para esta tarea y desaconseja explicitamente usar un detector de objetos para esta senal, remitiendo al caso de uso `object-detection` del mismo stack solo cuando se requiere comprension semantica. La informacion proporcionada no incluye datos de otros detectores de cambio de escena (por ejemplo, basados en diferencias de fotogramas o en embeddings) que permitan una comparacion con cifras.

## Limitaciones y advertencias

- No es un modelo entrenado ni un detector semantico: no distingue categorias de escena ("anden" frente a "vestibulo"); para eso hay que combinarlo con el caso de uso de deteccion de objetos.
- Sensible al umbral: el valor 0,45 es el del ejemplo y no un valor calibrado de forma general; cambios graduales de iluminacion, transiciones suaves o contenido con paletas de color muy estables pueden producir falsos negativos, y variaciones bruscas de luminancia pueden producir falsos positivos.
- La comparacion se hace solo contra el fotograma inmediatamente anterior, por lo que no hay memoria temporal ni suavizado mas alla de lo que implemente el integrador.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de eventos espurios derivados de un umbral mal ajustado.
- Limitaciones de idioma: la documentacion y las etiquetas estan en ingles; el algoritmo en si es agnostico al idioma.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion conservando el aviso de copyright; el codigo de ejemplo lleva cabecera `SPDX-License-Identifier: MIT` y copyright de Intel Corporation.
- Caveat de produccion: el stack de referencia (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030) es una version de desarrollo, no una release estable, segun advierte el propio autor.
- El entorno virtual debe crearse con `--system-site-packages` para acceder a los paquetes de OpenVINO instalados en el sistema que proporcionan OpenCV; obviarlo rompe la ejecucion de los ejemplos.
- El repositorio no contiene pesos ni artefactos reutilizables: la integracion implica copiar o reimplementar el codigo de referencia.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/Intel/scene-change-detection
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Pagina corporativa de Intel: https://www.intel.com/content/www/us/en/homepage.html
- Centro de descargas de Intel: https://www.intel.fr/content/www/fr/fr/download-center/home.html
- Wikipedia (Intel Corporation): https://fr.wikipedia.org/wiki/Intel
