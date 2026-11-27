# Khailx0207/DepthPro2-coreml

## Resumen

Depth Pro 2 es un modelo de estimacion de profundidad monocular metrica desarrollado por Apple Machine Learning Research. A diferencia de los modelos de profundidad relativos, Depth Pro 2 produce mapas de profundidad absolutos en metros a partir de una unica imagen, sin necesidad de conocer la distancia focal de la camara. Esta version concreta, publicada por el usuario Khailx0207 bajo el identificador `DepthPro2-coreml`, son los paquetes Core ML (`.mlpackage`) de los modelos PyTorch originales, optimizados para ejecutarse en Apple silicon.

El modelo esta disenado tanto para fotos como para video, con un enfoque en consistencia temporal: la variante `w4` mantiene una ventana temporal de 4 fotogramas en su estado interno, lo que reduce el parpadeo (flickering) entre fotogramas consecutivos. Se distribuye en cuatro tamanos (S, B, L, H+) mas un paquete auxiliar de campo de vision (FOV) que estima la longitud focal de camaras que no la reportan.

Es relevante ahora porque lleva la estimacion de profundidad metrica de alta calidad al ecosistema Core ML y a hardware de consumo Apple, permitiendo inferencia local en Mac y dispositivos con Apple silicon sin depender de GPUs dedicadas en la nube. La licencia, sin embargo, es estrictamente de investigacion (Apple Machine Learning Research Model license), lo que limita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de profundidad monocular; pesos exportados a Core ML) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana temporal de 4 fotogramas (`w4`) |
| Tipos de cuantizacion | pesos cuantizados a 4 bits (`w4`) en los paquetes Core ML |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | apple-amlr (Apple Machine Learning Research Model license), solo investigacion |
| Formato de pesos | `.mlpackage` (Core ML) |

Variantes disponibles:

| Modelo | Paquete | Tamano |
|:---:|---|---:|
| S | `depthpro2-s_w4.mlpackage` | 51 MB |
| B | `depthpro2-b_w4.mlpackage` | 188 MB |
| L | `depthpro2-l_w4.mlpackage` | 891 MB |
| H+ | `depthpro2-h_w4.mlpackage` | 1.6 GB |
| Field of view | `depthpro2-fov_512x896.mlpackage` | 91 MB |

Cada paquete de profundidad expone una funcion por tamano de entrada: `res_854x480` (por defecto), `res_640x360`, `res_896x512`, `res_1138x640` y `res_1280x720`.

## Arquitectura y entrenamiento

No se dispone de detalles de arquitectura ni de datos de entrenamiento en la informacion proporcionada. La model card unicamente describe el proceso de exportacion a Core ML, el formato de entrada/salida y el manejo del estado temporal, pero no la arquitectura interna (transformer, CNN, hibrida, etc.), el numero de tokens de entrenamiento ni la composicion del dataset.

La innovacion tecnica destacable que si se documenta es el mantenimiento de estado entre fotogramas: la variante `w4` conserva una ventana temporal de 4 fotogramas en el estado del modelo Core ML, de modo que cada nuevo video requiere crear un estado nuevo (`model.makeState()`). La salida es profundidad inversa normalizada por la longitud focal; la profundidad en metros se obtiene como `f_px / (W * inverse_depth)`, donde `f_px` es la longitud focal en pixeles del fotograma de tamano H×W. Para camaras sin focal conocida se usa el paquete FOV, de un unico tamano 896x512 para fotogramas 16:9.

## Capacidades

- Estimacion de profundidad monocular metrica (en metros) a partir de una sola imagen.
- Estimacion de profundidad para video con consistencia temporal mediante ventana de 4 fotogramas.
- Multiples resoluciones de entrada: 640x360, 854x480, 896x512, 1138x640 y 1280x720.
- Estimacion de longitud focal para camaras que no la reportan (paquete FOV).
- Ejecucion local en Apple silicon mediante Core ML, con seleccion de unidades de computo (`.cpuAndGPU`).
- No soporta generacion de texto, tool calling, agentes ni capacidades linguisticas; es un modelo puramente de vision/profundidad.

## Casos de uso

- Captura 3D en dispositivos Apple: usar los paquetes Core ML en apps de iOS/macOS para generar mapas de profundidad metricos y reconstruir escenas en tiempo real sin enviar imagenes a la nube.
- Efectos de desenfoque de fondo (retrato computacional): la profundidad metrica permite separar sujeto y fondo con distancias reales, util para simulacion de bokeh con control fisico.
- Procesado de video con estabilidad temporal: la ventana `w4` reduce el parpadeo entre fotogramas, adecuado para pipelines de video donde la coherencia temporal es critica (por ejemplo, seguimiento de sujetos o composicion).
- Realidad aumentada: colocar objetos virtuales con oclusion correcta usando la profundidad metrica para conocer la distancia real de la escena.
- Robotica y navegacion en macOS: usar la profundidad como entrada para planificacion de movimiento o evitacion de obstaculos en prototipos de investigacion ejecutados en hardware Apple.
- Fotografia computacional y edicion: generar mapas de profundidad para reenfoque posterior (post-capture refocus) o segmentacion por distancia en herramientas de edicion locales.
- Investigacion en vision por computador: evaluar y comparar metodos de profundidad metrica monocular con una implementacion Core ML ligera (S de 51 MB) que cabe en portatiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere Apple silicon y macOS 15 o posterior.
- Memoria estimada para el modelo S: aproximadamente 1,5 GB a 854x480 y 5 GB a 1280x720.
- Memoria estimada para el modelo L: aproximadamente 4 GB a 854x480 y 18 GB a 1280x720.
- En un Mac con 16 GB se recomienda usar S o B, o mantenerse en la resolucion por defecto (854x480).
- El modelo H+ ocupa 1,6 GB en disco y previsiblemente requiere mas memoria que L, aunque no se detalla en la informacion disponible.
- Despliegue mediante Core ML (`.mlpackage`), con `MLModelConfiguration` y seleccion de `.cpuAndGPU`.
- Latencia y throughput no disponibles.
- No se documentan opciones de despliegue en vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de vision en formato Core ML.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La model card referencia los modelos PyTorch originales en la pagina `apple/DepthPro2`, pero no incluye comparativas cuantitativas con otras alternativas de profundidad monocular.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Depth Pro 2 (S/B/L/H+) Core ML | no disponible | ventana temporal de 4 fotogramas | apple-amlr (solo investigacion) | `.mlpackage` |
| Alternativas de profundidad monocular | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia estrictamente de investigacion: la Apple Machine Learning Research Model license limita el uso a investigacion cientifica no comercial y desarrollo academico. No apta para produccion comercial sin autorizacion.
- Requiere hardware Apple: solo funciona en Apple silicon con macOS 15 o posterior; no es portable a GPUs NVIDIA ni a otros sistemas sin reexportacion.
- Consumo de memoria elevado en resoluciones altas: L necesita aproximadamente 18 GB a 1280x720, lo que descarta muchos equipos de consumo.
- Estado temporal por video: es obligatorio crear un estado nuevo (`makeState()`) para cada video; reutilizarlo entre videos produce resultados incorrectos.
- Dependencia de la focal: la profundidad metrica requiere la longitud focal en pixeles; si la camara no la reporta, hay que usar el paquete FOV, que anade una estimacion adicional con su propio error.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma (no aplica, es un modelo de vision).
- No se han publicado benchmarks en la informacion disponible, por lo que no es posible validar la calidad frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Khailx0207/DepthPro2-coreml
- Modelos PyTorch originales: https://huggingface.co/apple/DepthPro2
- Repositorio GitHub: https://github.com/apple-aiml-research/ml-depth-pro-2
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.26603
- Pagina del proyecto: https://apple-aiml-research.github.io/ml-depth-pro-2/
- Licencia del modelo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/LICENSE_MODEL
- README del demo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/demo/README.md
- Preprocess.swift del demo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/demo/apple/Sources/demo/Preprocess.swift
