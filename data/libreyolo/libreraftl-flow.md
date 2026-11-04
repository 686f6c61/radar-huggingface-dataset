# LibreYOLO/LibreRAFTl-flow

## Resumen

LibreRAFTl-flow es un checkpoint del modelo RAFT (Recurrent All-Pairs Field Transforms) para estimacion de flujo optico, reempaquetado por el proyecto LibreYOLO para su uso dentro de su propia libreria de inferencia. El modelo original procede de Princeton Vision & Learning Lab (princeton-vl/RAFT) y este paquete concreto corresponde a la variante "large" entrenada con el schedule C+T (FlyingChairs y despues FlyingThings3D), que es la configuracion por defecto del repositorio upstream para generalizacion.

El modelo resuelve el problema de estimar el movimiento denso entre dos fotogramas consecutivos: dada una pareja de imagenes, devuelve un campo de flujo de dimensiones (H, W, 2) en float32 con los desplazamientos (dx, dy) en pixeles desde el primer fotograma al segundo. Es relevante para tareas de vision por computador que requieren movimiento subpixel preciso, como seguimiento de objetos, estabilizacion de video, interpolacion de fotogramas o analisis de escenas dinamicas.

La arquitectura es RAFT, una red recurrente con correlaciones globales (all-pairs) y refinamiento iterativo, con 5,3 millones de parametros en esta variante large. El checkpoint se distribuye en formato .pt para la libreria libreyolo, con licencia BSD 3-Clause, e incluye una comprobacion de equivalencia bit a bit con la implementacion upstream en fp32 sobre 9 pares de demostracion de Sintel a 1024x436.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT (Recurrent All-Pairs Field Transforms) |
| Parametros totales | 5,3 M (variante large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible; el checkpoint se evalua en fp32 |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | BSD 3-Clause |
| Formato de pesos | .pt (checkpoint PyTorch para libreyolo) |

## Arquitectura y entrenamiento

RAFT es una red neuronal convolucional con un modulo recurrente que estima flujo optico denso mediante correlaciones globales entre todos los pares de pixeles de los dos fotogramas. El modelo extrae caracteristicas de ambas imagenes, construye un volumen de correlacion 4D y aplica un refinamiento iterativo recurrente que actualiza el campo de flujo de forma incremental. En esta variante large el modelo tiene 5,3 millones de parametros, lo que lo situa en un regimen muy ligero en comparacion con los transformers de vision actuales.

El entrenamiento sigue el schedule C+T del repositorio upstream: primero FlyingChairs y despues FlyingThings3D, que es la configuracion por defecto para generalizacion. El checkpoint original es `raft-things.pth` de la release `models.zip` (sha256 `fcfa4125d6418f4de95d84aec20a3c5f4e205101715a79f193243c186ac9a7e1`), derivado del commit 2888e15 de princeton-vl/RAFT. Las modificaciones de LibreYOLO son puramente de empaquetado: se elimina el prefijo `module.` de DataParallel y se anade metadatos de checkpoint (`task: flow`); los parametros aprendidos no cambian. La inferencia se ejecuta a resolucion nativa, con padding a multiplo de 8 como el `InputPadder` upstream, y 20 iteraciones de refinamiento como en el `demo.py` original.

## Capacidades

- Estimacion de flujo optico denso entre dos fotogramas, con salida (H, W, 2) en float32 y desplazamientos (dx, dy) en pixeles.
- Conversion del flujo a representacion visual con rueda de color Middlebury mediante `r.flow.to_rgb()`.
- Inferencia a resolucion nativa con padding automatico a multiplo de 8.
- Refinamiento iterativo configurable (20 iteraciones por defecto, siguiendo el demo upstream).
- Equivalencia bit a bit con la implementacion upstream de RAFT en fp32 sobre pares de Sintel a 1024x436 (diferencia absoluta maxima de 0,0 px).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual de image-to-image.

## Casos de uso

- Estabilizacion de video: estimar el flujo entre fotogramas consecutivos permite calcular el movimiento global de camara y aplicar transformaciones de compensacion; el modelo es adecuado por su precision subpixel y su bajo coste computacional (5,3 M de parametros).
- Interpolacion de fotogramas: el campo de flujo denso entre dos fotogramas sirve para sintetizar fotogramas intermedios en pipelines de aumento de tasa de refresco o slow-motion; RAFT es la referencia clasica para esta tarea.
- Seguimiento de objetos y puntos: el flujo permite propagar puntos de interes o cajas de un fotograma al siguiente, util en pipelines de tracking que necesitan correspondencias densas.
- Analisis de escenas dinamicas: en robotica o conduccion autonoma, el flujo optico aporta informacion de movimiento relativo entre camara y entorno para deteccion de obstaculos o segmentacion por movimiento.
- Control de calidad en video: detectar artefactos de compresion, duplicados de fotogramas o saltos de movimiento comparando el flujo estimado con el esperado.
- Preprocesado para modelos de video: usar el flujo como entrada auxiliar en arquitecturas de generacion o edicion de video que requieren warping entre fotogramas.
- Investigacion en vision: al ser un reempaquetado fiel del checkpoint oficial con verificacion bit a bit, sirve como baseline reproducible para comparar nuevas tecnicas de flujo optico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica aportada por el autor es la equivalencia bit a bit con la implementacion upstream de RAFT en fp32 sobre 9 pares de demostracion de Sintel a 1024x436, con una diferencia absoluta maxima de 0,0 px. No se proporcionan cifras de EPE (end-point error) en Sintel, KITTI ni FlyingThings3D.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 5,3 M de parametros el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer, incluso en resoluciones altas.
- GPU recomendadas: cualquier GPU con soporte CUDA; el checkpoint se evalua en fp32 y no requiere hardware de gama alta.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060 y superiores; tambien es viable en CPU para resoluciones moderadas, aunque con mayor latencia.
- Opciones de despliegue: libreria libreyolo (`LibreYOLO("LibreRAFTl-flow.pt")`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la resolucion de entrada y del numero de iteraciones de refinamiento (20 por defecto).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRAFTl-flow | 5,3 M | Flujo optico denso | Resolucion nativa, padding a multiplo de 8 | BSD 3-Clause | HuggingFace (libreyolo) |
| RAFT upstream (princeton-vl) | 5,3 M (variante large) | Flujo optico denso | Resolucion nativa | BSD 3-Clause | GitHub + models.zip |
| Modelos de flujo optico basados en transformers | no disponible | Flujo optico denso | no disponible | no disponible | no disponible |

La comparativa se limita al modelo upstream, del que este checkpoint es un reempaquetado fiel con verificacion bit a bit. No se dispone de datos de otros modelos de flujo optico en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- Entrenado con el schedule C+T (FlyingChairs y FlyingThings3D); el rendimiento en dominios muy distintos (por ejemplo, imagenes medicas o escenas nocturnas) puede degradarse respecto a variantes afinadas con datos especificos.
- La estimacion de flujo denso es sensible a oclusiones y a movimientos grandes fuera del rango aprendido; no se documentan garantias de robustez en esos casos.
- La salida es un campo de flujo en pixeles, no una prediccion semantica; requiere postprocesado para tareas de alto nivel.
- Licencia BSD 3-Clause: permite uso comercial con atribucion y manteniendo el aviso de copyright; es necesario conservar los archivos LICENSE y NOTICE del repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB reportado, lo que sugiere un paquete muy reciente o poco validado por la comunidad.
- No se han publicado benchmarks propios; la unica validacion es la equivalencia bit a bit con el checkpoint upstream en fp32.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreRAFTl-flow
- Repositorio upstream RAFT: https://github.com/princeton-vl/RAFT
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
