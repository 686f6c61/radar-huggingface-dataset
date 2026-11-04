# LibreYOLO/LibreRAFTl-flow-sintel

## Resumen

LibreRAFTl-flow-sintel es un checkpoint del modelo RAFT (Recurrent All-Pairs Field Transforms) para estimación de flujo óptico, reempaquetado por el proyecto LibreYOLO para su uso dentro de su librería homónima. El modelo original procede de princeton-vl/RAFT, publicado en 2020 por Zachary Teed y Jia Deng, y este repositorio redistribuye el checkpoint `raft-sintel.pth` con el prefijo `module.` de DataParallel eliminado y metadatos de LibreYOLO añadidos. No se han modificado los parámetros aprendidos.

Se trata de la variante "large" de RAFT, con 5,3 millones de parámetros, especializada en el dataset MPI Sintel mediante un entrenamiento en dos fases: primero el schedule C+T (Chairs y Things) y después un ajuste fino sobre la mezcla C+T+S+K+H de Sintel. El resultado es un modelo de flujo óptico denso orientado a pares de fotogramas consecutivos, no un modelo generativo ni multimodal.

Su relevancia actual es acotada pero concreta: ofrece una implementación de referencia de flujo óptico con licencia permisiva (BSD 3-Clause), verificada bit a bit contra el original en fp32 sobre 9 pares de demostración de Sintel a 1024x436, y lista para integrarse en pipelines de visión por computador mediante la API de LibreYOLO. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB reportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT (Recurrent All-Pairs Field Transforms), red recurrente con correlación 4D y refinamiento iterativo |
| Parametros totales | 5,3 M (variante large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en fp32 y la verificación de equivalencia se realizó en fp32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD 3-Clause |
| Formato de pesos | checkpoint `.pt` de LibreYOLO (`LibreRAFTl-flow-sintel.pt`), derivado de `raft-sintel.pth` |

## Arquitectura y entrenamiento

RAFT es una arquitectura específica para flujo óptico que combina un extractor de características convolucional, una capa de correlación que construye un volumen 4D de similitudes entre todos los pares de píxeles de ambos fotogramas, y un módulo recurrente GRU que refina iterativamente el campo de flujo. En inferencia, el modelo opera a resolución nativa, con padding a múltiplo de 8 siguiendo el `InputPadder` del repositorio original, y ejecuta 20 iteraciones de refinamiento, tal como en el `demo.py` upstream.

El entrenamiento del checkpoint `raft-sintel.pth` sigue el schedule C+T (FlyingChairs y FlyingThings3D) y después un ajuste fino sobre la mezcla C+T+S+K+H de MPI Sintel, que incorpora las variantes de Sintel, KITTI y HD1K. Los pesos se derivan del commit 2888e15 del repositorio princeton-vl/RAFT, con sha256 `90630d2e7d488a0d3ccb5e8194524850c4c05c732ea4ff99799822c7fa5c5cbf`. La única modificación introducida por LibreYOLO es la eliminación del prefijo `module.` y la adición de metadatos (`task: flow`); el script de conversión está en `weights/convert_raft_weights.py` del repositorio de LibreYOLO.

## Capacidades

- Estimación de flujo óptico denso entre dos fotogramas consecutivos, con salida de forma (H, W, 2) en float32 que representa desplazamientos (dx, dy) en píxeles del fotograma 0 al fotograma 1.
- Visualización del campo de flujo mediante rueda de color Middlebury a través de `r.flow.to_rgb()`.
- Inferencia a resolución nativa con padding automático a múltiplo de 8.
- Refinamiento iterativo configurable (20 iteraciones por defecto, siguiendo el demo upstream).
- Integración con la API de LibreYOLO: `LibreYOLO("LibreRAFTl-flow-sintel.pt")` y llamada con una lista de rutas de imagen.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, ni capacidades multilingües, de visión semántica, audio o thinking mode.

## Casos de uso

- Estimación de movimiento en vídeo: el modelo calcula el flujo denso entre pares de fotogramas consecutivos, adecuado para tareas de análisis de movimiento, seguimiento de objetos y estabilización.
- Interpolación de fotogramas: el campo de flujo (dx, dy) permite generar fotogramas intermedios en postproducción o en pipelines de vídeo de alta tasa de refresco.
- Estabilización de vídeo: el flujo entre fotogramas alimenta algoritmos de compensación de movimiento para eliminar vibraciones en grabaciones.
- Análisis de escenas Sintel y KITTI: al estar ajustado sobre la mezcla C+T+S+K+H, es apropiado para benchmarks y experimentos sobre estos datasets de referencia en flujo óptico.
- Detección de movimiento en vigilancia: el flujo denso permite identificar regiones con desplazamiento significativo entre fotogramas en secuencias de cámaras fijas.
- Investigación en visión por computador: sirve como línea base reproducible de RAFT large con licencia BSD 3-Clause, verificada bit a bit contra el original en fp32.
- Integración en pipelines de LibreYOLO: al compartir la API de la librería, puede combinarse con detectores del mismo ecosistema en flujos de análisis de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una verificación de equivalencia: sobre 9 pares de demostración de Sintel a 1024x436, la salida de LibreYOLO coincide bit a bit con el RAFT upstream en fp32, con una diferencia absoluta máxima de 0.0 px.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 5,3 M de parámetros, el peso del modelo en fp32 ocupa aproximadamente 21 MB, pero el volumen de correlación 4D y las activaciones a resolución nativa (por ejemplo, 1024x436) dominan el consumo de memoria y no se especifican.
- GPU recomendadas: no disponible. El modelo original RAFT se ha ejecutado históricamente en GPUs NVIDIA, pero la model card no detalla requisitos.
- Compatibilidad con GPU de consumo: no disponible; no se confirma ni se descarta.
- Opciones de despliegue: la vía documentada es la librería LibreYOLO mediante `LibreYOLO("LibreRAFTl-flow-sintel.pt")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Solo se documenta el número de iteraciones de refinamiento (20) y el padding a múltiplo de 8.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRAFTl-flow-sintel | 5,3 M | RAFT large, ajuste Sintel (C+T+S+K+H) | Resolución nativa, padding a múltiplo de 8, 20 iteraciones | BSD 3-Clause | HuggingFace (LibreYOLO) |
| RAFT original (princeton-vl) | 5,3 M (large) | RAFT, checkpoint `raft-sintel.pth` | Resolución nativa, padding a múltiplo de 8 | BSD 3-Clause | GitHub princeton-vl/RAFT |
| Otros modelos de flujo óptico | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al RAFT original, del que este checkpoint es una redistribución con metadatos añadidos y parámetros idénticos. No se dispone de datos de otros modelos de flujo óptico en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en flujo óptico; no genera texto, no razona, no soporta tool calling ni agentes.
- El ajuste fino sobre Sintel puede introducir sesgo hacia las características visuales y de movimiento de ese dataset, con posible degradación en dominios muy distintos.
- No se han publicado métricas de error (EPE, Fl-all) en la información disponible, por lo que el rendimiento cuantitativo en Sintel o KITTI no está documentado en este repositorio.
- El consumo de memoria a resolución nativa depende del volumen de correlación 4D y de las 20 iteraciones de refinamiento; no se especifican requisitos de VRAM.
- La licencia BSD 3-Clause permite uso comercial, pero exige conservar el aviso de copyright y la cláusula de no endorsement; deben revisarse los ficheros `LICENSE` y `NOTICE` del repositorio.
- El repositorio reporta 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que las métricas aún no se han actualizado.
- No se dispone de información sobre idiomas, cuantizaciones ni formatos alternativos de pesos (GGUF, safetensors).

## Enlaces

- HuggingFace: https://huggingface.co/LibreYOLO/LibreRAFTl-flow-sintel
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- RAFT original (princeton-vl): https://github.com/princeton-vl/RAFT
- Commit de referencia: 2888e15 del repositorio princeton-vl/RAFT
- Script de conversión: `weights/convert_raft_weights.py` en el repositorio de LibreYOLO
