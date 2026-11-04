# LibreYOLO/LibreNeuFlowv2s-flow

## Resumen

LibreNeuFlowv2s-flow es un modelo de estimación de flujo óptico (optical flow) derivado de NeuFlow v2, la red de 9 millones de parámetros desarrollada por Zhiyong Zhang, Aniket Gupta, Huaizu Jiang y Hanumant Singh (Northeastern University) y publicada en el artículo "NeuFlow v2: Push High-Efficiency Optical Flow To the Limit" (arXiv:2408.10161). El modelo original está diseñado específicamente para dispositivos de borde (edge devices), priorizando la eficiencia computacional sobre la precisión bruta.

Este repositorio, mantenido por el proyecto LibreYOLO, no introduce cambios en los pesos aprendidos: se trata de un reempaquetado del checkpoint canónico `neuflow_mixed.pth` (entrenamiento multi-dataset) dentro del esquema de LibreYOLO v1.0 con tarea `flow`, `nc=1` y lienzo de 432x768. La conversión es puramente de metadatos: las claves y los parámetros del state-dict permanecen idénticos, y el autor reporta paridad bit a bit con el módulo `NeuFlow` original en fp32 sobre una RTX 3090 (diferencia absoluta máxima de 0.0 px).

Su relevancia es práctica: permite ejecutar el flujo óptico de NeuFlow v2 a través de la API unificada de LibreYOLO, que acepta N fotogramas y devuelve N-1 mapas de flujo, facilitando su integración en pipelines de visión por computador existentes sin necesidad de adoptar el código upstream. Existen variantes especializadas del mismo checkpoint entrenadas en Sintel y en Things.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeuFlow v2 (red neuronal para flujo óptico, optimizada para edge) |
| Parametros totales | 9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión image-to-image) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch empaquetado en esquema LibreYOLO v1.0) |

## Arquitectura y entrenamiento

NeuFlow v2 es una red de 9 millones de parámetros orientada a la estimación densa de flujo óptico en dispositivos con recursos limitados. El checkpoint redistribuido corresponde a la ejecución de entrenamiento multi-dataset ("mixed"), que es el checkpoint de inferencia por defecto del proyecto upstream. La información disponible no detalla la composición interna del dataset de entrenamiento, el número de tokens ni si se emplearon técnicas de refinamiento posteriores; el artículo de referencia (arXiv:2408.10161) es la fuente para esos detalles.

La modificación introducida por LibreYOLO es exclusivamente de empaquetado: se envuelve el state-dict en el esquema v1.0 de LibreYOLO con `task=flow`, `nc=1`, `names={0: "flow"}`, `variant=mixed` y un lienzo de 432x768. Los scripts de conversión (`weights/convert_neuflowv2_weights.py`) y de verificación de paridad (`weights/parity_neuflowv2.py`) están disponibles en el repositorio de código de LibreYOLO, y la verificación reportada confirma que la salida coincide exactamente con la del módulo upstream en fp32.

## Capacidades

- Estimación densa de flujo óptico entre pares de fotogramas consecutivos, con salida de forma (H, W, 2) en float32 que representa desplazamientos (dx, dy) en píxeles sobre el lienzo original.
- Procesamiento por lotes de secuencias: la API acepta N fotogramas y devuelve N-1 mapas de flujo.
- Conversión del flujo a representación visual mediante rueda de color Middlebury (`to_rgb()`).
- Diseño para inferencia en dispositivos de borde gracias a su reducido tamaño (9 M de parámetros).
- Variantes especializadas del mismo checkpoint entrenadas en Sintel y en Things, disponibles como repositorios separados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de image-to-image.

## Casos de uso

- Estimación de movimiento en robótica móvil: el modelo calcula el flujo entre fotogramas consecutivos de una cámara a bordo para alimentar módulos de odometría visual o evitación de obstáculos, y su tamaño de 9 M de parámetros permite ejecutarlo en el propio robot sin GPU de datacenter.
- Estabilización de vídeo: el flujo denso (dx, dy) por píxel sirve para estimar el movimiento global de la cámara y aplicar compensación entre fotogramas en herramientas de postproducción o en pipelines automáticos de vídeo.
- Interpolación de fotogramas: los mapas de flujo hacia delante y hacia atrás entre dos fotogramas permiten sintetizar fotogramas intermedios para aumentar la tasa de refresco en reproducción o en efectos visuales.
- Vigilancia y análisis de tráfico: el flujo óptico permite detectar movimiento y estimar la dirección y velocidad aparente de vehículos o peatones en secuencias de cámaras fijas, con un coste computacional bajo que facilita el despliegue en múltiples cámaras simultáneas.
- Segmentación y seguimiento guiados por movimiento: el flujo se usa como señal auxiliar para propagar máscaras entre fotogramas o para refinar el seguimiento de objetos en herramientas de anotación automática.
- Procesamiento de vídeo en dispositivos de borde: al ser un modelo de 9 M de parámetros, puede integrarse en cámaras inteligentes, drones o sistemas embebidos donde no cabe un modelo de flujo de mayor tamaño, priorizando latencia sobre precisión máxima.
- Investigación en visión por computador: la API unificada de LibreYOLO facilita comparar NeuFlow v2 con otros estimadores de flujo dentro de un mismo pipeline de evaluación, sin reescribir el código de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la verificación de paridad con el módulo upstream (diferencia absoluta máxima de 0.0 px en fp32 sobre una RTX 3090), que no constituye una métrica de precisión de flujo óptico. Para resultados en Sintel, KITTI u otros conjuntos de referencia, debe consultarse el artículo arXiv:2408.10161.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 9 M de parámetros en fp32, el peso de los pesos ronda los 36 MB, por lo que la huella de memoria estará dominada por las activaciones del lienzo de 432x768 y el tamaño del lote.
- GPU recomendadas: no disponibles. El autor verifica la paridad en una RTX 3090 en fp32, lo que confirma su funcionamiento en GPU de consumo.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros; cualquier GPU con suficiente memoria para las activaciones del lienzo debería poder ejecutarlo, aunque no se documentan requisitos mínimos.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` (`from libreyolo import LibreYOLO`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento de este modelo ni de alternativas comparables (por ejemplo, RAFT, FlowFormer o GMFlow), por lo que no es posible establecer una comparación rigurosa de parámetros, contexto, precisión o licencia.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto, no soporta instrucciones en lenguaje natural ni tiene capacidades multilingües.
- La licencia Apache 2.0 se aplica al reempaquetado, pero el autor advierte explícitamente de que el proyecto upstream publica el checkpoint en un repositorio Apache 2.0 sin una licencia de pesos separada; la redistribución se ampara en una interpretación divulgada por LibreYOLO, no confirmada por los autores originales. Conviene revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto en el sentido habitual, al no ser un modelo generativo de lenguaje; el riesgo principal es la imprecisión del flujo en escenarios difíciles (oclusiones, superficies sin textura, movimientos grandes), no cuantificada en la información disponible.
- El lienzo de inferencia está fijado en 432x768 en el esquema de LibreYOLO; no se documenta el comportamiento con otras resoluciones.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que las métricas no se han actualizado; conviene verificar la disponibilidad de los ficheros antes de integrarlo.
- La fecha de creación del repositorio (2026-11-03) es posterior a la fecha actual, lo que apunta a un posible error en los metadatos de la plataforma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LibreYOLO/LibreNeuFlowv2s-flow
- Variante Sintel: https://huggingface.co/LibreYOLO/LibreNeuFlowv2s-flow-sintel
- Variante Things: https://huggingface.co/LibreYOLO/LibreNeuFlowv2s-flow-things
- Repositorio upstream de NeuFlow v2: https://github.com/neufieldrobotics/NeuFlow_v2
- Repositorio de código de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Artículo: https://arxiv.org/abs/2408.10161
