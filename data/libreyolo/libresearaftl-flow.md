# LibreYOLO/LibreSEARAFTl-flow

## Resumen

LibreSEARAFTl-flow es un modelo de estimacion de flujo optico denso empaquetado para el ecosistema LibreYOLO. Se trata de SEA-RAFT L, la variante grande de SEA-RAFT (Simple, Efficient, Accurate RAFT), desarrollada originalmente por el Princeton Vision & Learning Lab y publicada en ECCV 2024. Dado un par de fotogramas consecutivos, el modelo predice un campo de desplazamiento denso desde el primer fotograma al segundo, junto con un mapa de confianza por pixel derivado de su formulacion de incertidumbre basada en mezcla de Laplacianas.

El modelo emplea una arquitectura de tipo RAFT con codificadores ResNet34 y 12 iteraciones de refinamiento en la fase de decodificacion. Es relevante porque ofrece una implementacion de flujo optico de alta calidad integrada en el formato de checkpoints de LibreYOLO, lo que facilita su uso en pipelines de vision por computador junto con detectores de objetos del mismo ecosistema. El repositorio ocupa aproximadamente 0,1 GB y la licencia es BSD 3-Clause.

Cabe destacar que, segun la model card, el checkpoint subyacente es identico al de la variante M (LibreSEARAFTm-flow): la etiqueta `size: l` unicamente selecciona la pasada directa con 12 iteraciones de refinamiento en lugar de 4, sin cambios en los parametros aprendidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT (recurrent all-pairs field transforms) con codificadores ResNet34 y 12 iteraciones de refinamiento |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; procesa pares de fotogramas a resolucion nativa, con reescalado si el lado largo supera 960 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | BSD 3-Clause |
| Formato de pesos | checkpoint `.pt` con esquema de LibreYOLO (derivado de safetensors upstream) |

## Arquitectura y entrenamiento

SEA-RAFT es una evolucion de RAFT que combina un extractor de caracteristicas con codificadores ResNet34, un modulo de correlacion de costes y un decodificador recurrente que refina iterativamente el campo de flujo. En esta variante L se ejecutan 12 iteraciones de refinamiento en lugar de las 4 de la variante M. La innovacion principal de SEA-RAFT es su formulacion de incertidumbre mediante mezcla de Laplacianas, que produce un mapa de confianza por pixel junto con el flujo estimado.

El checkpoint procede del modelo `MemorySlices/Tartan-C-T-TSKH-spring540x960-M`, entrenado sobre el dataset sintetico TartanAir (variante spring, resolucion 540x960) y afinado en los benchmarks de KITTI y Sintel segun el esquema del paper. Los parametros aprendidos no se han modificado respecto al original; el empaquetado para LibreYOLO solo anade metadatos del esquema de checkpoints y duplica el BatchNorm compartido entre `bn3` y `downsample.1` bajo ambos nombres. No se dispone de informacion sobre el numero exacto de tokens o muestras de entrenamiento en la documentacion proporcionada.

## Capacidades

- Estimacion de flujo optico denso entre dos fotogramas, devolviendo un tensor `(H, W, 2)` en float32 con desplazamientos `(dx, dy)` en pixeles sobre el lienzo original.
- Mapa de confianza por pixel en el rango [0, 1], derivado de la incertidumbre de mezcla de Laplacianas, donde 1 indica mayor certeza.
- Visualizacion del flujo mediante la rueda de color de Middlebury (`to_rgb()`).
- Procesamiento de video en streaming: itera sobre un clip calculando el flujo de cada fotograma t a t+1.
- Procesamiento a resolucion nativa, con padding a multiplo de 8; los fotogramas con lado largo superior a 960 px se reescalan y el flujo se redimensiona con reescalado de vectores.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas o multimodales generativas.

## Casos de uso

- Estimacion de movimiento en video de vigilancia: el modelo calcula el flujo denso entre fotogramas consecutivos para detectar direccion y magnitud del movimiento de personas u objetos, aprovechando el mapa de confianza para filtrar regiones ocluidas o con bajo texture.
- Estabilizacion de video: los campos de desplazamiento permiten estimar la trayectoria de la camara y compensar vibraciones fotograma a fotograma en pipelines de postproduccion.
- Interpolacion de fotogramas: el flujo entre t y t+1 sirve para sintetizar fotogramas intermedios en herramientas de conversion de tasa de refresco o camara lenta.
- Seguimiento de objetos multi-objetivo: combinado con detectores del ecosistema LibreYOLO, el flujo denso proporciona correspondencias pixel a pixel utiles para asociar detecciones entre fotogramas.
- Analisis de escenas de trafico: estimacion de velocidad y direccion de vehiculos y peatones a partir de pares de fotogramas en camaras de carretera, con la confianza por pixel para descartar zonas ambiguas.
- Vision robotica y navegacion: estimacion de movimiento relativo entre imagenes consecutivas de una camara a bordo para odometria visual o evitacion de obstaculos.
- Control de calidad industrial: deteccion de movimiento anomalo o vibraciones en lineas de produccion filmadas con camaras fijas, usando el flujo como senal de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio de pesos ocupa aproximadamente 0,1 GB, lo que sugiere un modelo de decenas de millones de parametros (codificadores ResNet34), pero no se proporciona una cifra de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamano del checkpoint es plausible que quepa en GPU de consumo, pero no se confirma en la informacion.
- Opciones de despliegue: libreria `libreyolo` (carga via `LibreYOLO("LibreSEARAFTl-flow.pt")`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Iteraciones de refinamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreSEARAFTl-flow (este) | no disponible (ResNet34) | hasta 960 px lado largo | 12 | BSD 3-Clause | Hugging Face (LibreYOLO) |
| LibreSEARAFTm-flow | mismos parametros que L | hasta 960 px lado largo | 4 | BSD 3-Clause | Hugging Face (LibreYOLO) |
| SEA-RAFT upstream (MemorySlices) | no disponible | 540x960 en entrenamiento | configurable | BSD 3-Clause | Hugging Face (MemorySlices) |

La diferencia entre las variantes L y M del empaquetado LibreYOLO es unicamente el numero de iteraciones de refinamiento en la pasada directa (12 frente a 4), con identicos parametros aprendidos; la variante L prioriza precision a costa de mayor coste computacional.

## Limitaciones y advertencias

- El modelo no genera texto ni mantiene conversaciones; cualquier expectativa de capacidades linguisticas es inaplicable.
- El flujo se calcula a resolucion nativa con padding a multiplo de 8; fotogramas con lado largo superior a 960 px se reescalan, lo que puede degradar la precision en movimientos muy pequenos.
- La confianza por pixel es una estimacion probabilistica derivada de la mezcla de Laplacianas; no debe interpretarse como garantia de exactitud en regiones ocluidas, sin textura o con desenfoque de movimiento.
- No se han publicado datos de sesgo, robustez ni evaluacion en dominios distintos de los de entrenamiento (TartanAir, KITTI, Sintel) en la informacion disponible.
- Licencia BSD 3-Clause: permite uso comercial con atribucion y sin endoso; deben conservarse los archivos `LICENSE` y `NOTICE` del repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- Al compartir parametros con la variante M, no debe asumirse que la etiqueta L implica un modelo de mayor capacidad; solo cambia el numero de iteraciones.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreSEARAFTl-flow
- Variante M: https://huggingface.co/LibreYOLO/LibreSEARAFTm-flow
- Paper SEA-RAFT (ECCV 2024): https://arxiv.org/abs/2405.14793
- Repositorio upstream: https://github.com/princeton-vl/SEA-RAFT
- Checkpoint upstream: https://huggingface.co/MemorySlices/Tartan-C-T-TSKH-spring540x960-M
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
