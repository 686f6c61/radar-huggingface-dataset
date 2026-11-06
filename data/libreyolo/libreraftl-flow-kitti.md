# LibreYOLO/LibreRAFTl-flow-kitti

## Resumen

LibreRAFTl-flow-kitti es un modelo de estimación de flujo óptico (optical flow) basado en la arquitectura RAFT (Recurrent All-Pairs Field Transforms) en su variante large, con 5,3 millones de parámetros. Lo desarrolla el proyecto LibreYOLO, que lo publica como un checkpoint reempaquetado del original `raft-kitti.pth` de Princeton Vision & Learning Lab (princeton-vl), adaptado para cargarse directamente con la librería `libreyolo`. El modelo resuelve el problema de calcular el campo de movimiento denso entre dos fotogramas consecutivos, devolviendo un tensor de flujo (dx, dy) en píxeles.

El checkpoint original corresponde a un modelo entrenado primero en Sintel y posteriormente afinado sobre el conjunto KITTI 2015, lo que lo orienta a escenas de conducción y tráfico real. Su tamaño reducido (5,3 M de parámetros) lo hace muy ligero en comparación con los modelos de flujo óptico modernos basados en transformers, y permite inferencia a resolución nativa en GPU de consumo.

La relevancia actual radica en que ofrece una implementación de referencia limpia y con licencia permisiva (BSD 3-Clause) para tareas de flujo óptico dentro del ecosistema LibreYOLO, verificado bit a bit contra el RAFT original en fp32. No obstante, la información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, no se publican benchmarks propios ni datos de entrenamiento detallados más allá de la procedencia del checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RAFT (Recurrent All-Pairs Field Transforms), variante large |
| Parámetros totales | 5,3 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen a imagen, no aplica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD 3-Clause |
| Formato de pesos | `.pt` (checkpoint PyTorch empaquetado para LibreYOLO) |

## Arquitectura y entrenamiento

RAFT es una red neuronal convolucional con un módulo recurrente de refinamiento iterativo. Extrae características de ambos fotogramas mediante un encoder convolucional compartido, construye un volumen de correlación 4D de todos los pares de píxeles y lo consulta repetidamente con un operador de búsqueda (lookup) mientras un GRU actualiza de forma iterativa el campo de flujo. En esta variante concreta, la inferencia se ejecuta a resolución nativa, con padding a múltiplo de 8 (el `InputPadder` del repositorio original) y 20 iteraciones de refinamiento, siguiendo el `demo.py` upstream.

El entrenamiento del checkpoint original consistió en un modelo entrenado en Sintel y posteriormente afinado sobre KITTI 2015, según indica la model card. No se detallan el número de tokens ni la composición exacta del dataset más allá de esas dos referencias. La modificación realizada por LibreYOLO es puramente de empaquetado: se elimina el prefijo `module.` introducido por `DataParallel` y se añaden metadatos de checkpoint (`task: flow`); los parámetros aprendidos no se alteran. La verificación reportada indica coincidencia bit a bit con el RAFT upstream en fp32 sobre 9 pares de demostración de Sintel a 1024x436 (diferencia absoluta máxima de 0,0 px).

## Capacidades

- Estimación de flujo óptico denso entre dos imágenes consecutivas, devolviendo un tensor `(H, W, 2)` en float32 con desplazamientos `(dx, dy)` en píxeles.
- Visualización del flujo mediante rueda de color Middlebury (`r.flow.to_rgb()`).
- Inferencia a resolución nativa con padding automático a múltiplo de 8.
- Refinamiento iterativo configurable (20 iteraciones por defecto, siguiendo el demo upstream).
- Integración con la API de LibreYOLO: `LibreYOLO("LibreRAFTl-flow-kitti.pt")` y llamada directa con una lista de dos rutas de imagen.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de imagen a imagen.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Estimación de movimiento en conducción autónoma: el modelo está afinado sobre KITTI 2015, por lo que es adecuado para calcular el flujo entre fotogramas de vídeo de tráfico urbano y alimentar módulos de odometría visual, detección de obstáculos en movimiento o segmentación por movimiento.
- Interpolación de fotogramas en vídeo: el campo de flujo permite generar fotogramas intermedios para aumentar la tasa de refresco o crear cámara lenta, aprovechando que el modelo opera a resolución nativa sin reescalado.
- Estabilización de vídeo: el flujo denso entre fotogramas consecutivos permite estimar y compensar el movimiento global de cámara en postproducción o en vídeo capturado con dispositivos móviles.
- Seguimiento de objetos (tracking): el flujo por píxel sirve como señal auxiliar para propagar máscaras o cajas entre fotogramas, especialmente en escenas con movimiento no rígido.
- Análisis de movimiento en vídeo de vigilancia: detección de personas u objetos en movimiento mediante umbralización de la magnitud del flujo, con la ventaja de un modelo de solo 5,3 M de parámetros que puede ejecutarse en hardware modesto.
- Investigación y docencia en visión por computador: al ser un repackaging fiel del RAFT original con licencia BSD 3-Clause y verificación bit a bit, sirve como referencia reproducible para comparar implementaciones o como base para experimentos de flujo óptico.
- Preprocesado para pipelines de robótica: estimación de movimiento relativo entre capturas de cámara para tareas de navegación o SLAM visual ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la verificación de equivalencia numérica con el RAFT upstream en fp32 (diferencia absoluta máxima de 0,0 px sobre 9 pares de Sintel a 1024x436), que es una comprobación de fidelidad de la conversión, no una métrica de calidad de flujo (como EPE o KITTI Fl-all).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 5,3 M de parámetros, el peso del modelo es del orden de decenas de MB en fp32, pero el consumo real depende en gran medida de la resolución de entrada y del volumen de correlación 4D, que escala con el número de píxeles.
- GPU recomendadas: no disponible de forma explícita. Por tamaño de modelo, cualquier GPU con suficiente memoria para la resolución objetivo debería ser viable; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño de parámetros es muy reducido, pero la memoria pico depende de la resolución y del volumen de correlación.
- Opciones de despliegue: librería `libreyolo` (API `LibreYOLO`), con checkpoint `.pt` de PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de flujo óptico).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| LibreRAFTl-flow-kitti | 5,3 M | RAFT large, afinado en KITTI 2015 | BSD 3-Clause | Hugging Face (LibreYOLO) |
| RAFT (princeton-vl) | no disponible en la información | RAFT original (Sintel, KITTI, etc.) | BSD 3-Clause | GitHub princeton-vl/RAFT |
| Otros modelos de flujo óptico (FlowNet, PWC-Net, etc.) | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al RAFT original, del que este checkpoint deriva directamente y con el que es numéricamente equivalente en fp32 según la model card. No se dispone de datos de rendimiento comparado con otras arquitecturas de flujo óptico en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en flujo óptico: no genera texto, no razona, no soporta tool calling ni agentes. No debe evaluarse como un modelo de lenguaje.
- El checkpoint está afinado sobre KITTI 2015, orientado a escenas de conducción; su generalización a otros dominios (interiores, microscopía, vídeo aéreo) no está documentada.
- No se publican métricas de calidad de flujo (EPE, Fl-all) ni comparativas con el estado del arte, por lo que no es posible evaluar su precisión real a partir de la información disponible.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-03): no hay evidencia de uso en producción ni validación por la comunidad.
- El consumo de memoria y la latencia dependen fuertemente de la resolución de entrada y del número de iteraciones de refinamiento; no se documentan límites prácticos.
- Licencia BSD 3-Clause: permite uso comercial con atribución y sin endoso, pero requiere conservar el aviso de copyright y la cláusula de exención; debe revisarse el archivo `NOTICE` del repositorio.
- La model card no documenta sesgos, riesgos de alucinación (no aplica en el sentido de generación de texto) ni limitaciones idiomáticas, al no ser un modelo lingüístico.
- Al ser un reempaquetado, cualquier mejora o corrección depende del proyecto LibreYOLO; el mantenimiento del checkpoint no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreRAFTl-flow-kitti
- Repositorio fuente de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- RAFT original (princeton-vl): https://github.com/princeton-vl/RAFT
- Commit de referencia del código fuente: 2888e15 (repositorio princeton-vl/RAFT)
- Script de conversión de pesos: `weights/convert_raft_weights.py` en el repositorio de LibreYOLO
- Archivos de licencia del repositorio: `LICENSE` y `NOTICE` en la página del modelo
