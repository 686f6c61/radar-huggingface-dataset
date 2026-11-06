# LibreYOLO/LibreNeuFlowv2s-flow-sintel

## Resumen

LibreNeuFlowv2s-flow-sintel es un empaquetado de los pesos de NeuFlow v2, una red neuronal de estimación de flujo óptico (optical flow) de 9 millones de parámetros diseñada específicamente para dispositivos de borde. El modelo original fue desarrollado por Zhiyong Zhang, Aniket Gupta, Huaizu Jiang y Hanumant Singh, y publicado en el artículo "NeuFlow v2: Push High-Efficiency Optical Flow To the Limit" (arXiv:2408.10161). Esta versión concreta la redistribuye el proyecto LibreYOLO bajo su esquema v1.0 para la tarea `flow`, manteniendo los pesos y parámetros aprendidos sin modificar.

El flujo óptico es la tarea de estimar el movimiento denso entre dos fotogramas consecutivos de vídeo, devolviendo un campo vectorial (dx, dy) por píxel. NeuFlow v2 aborda este problema con una arquitectura extremadamente ligera, pensada para ejecutarse en tiempo real en hardware con recursos limitados, algo crítico en robótica, drones, vehículos autónomos y sistemas embebidos. Esta variante `sintel` corresponde al ajuste fino sobre el dataset Sintel, que contiene secuencias con movimiento amplio y realista.

La relevancia de esta ficha radica en que ofrece un checkpoint de flujo óptico listo para usar con el ecosistema LibreYOLO, con paridad numérica verificada bit a bit respecto al módulo `NeuFlow` original (diferencia absoluta máxima de 0.0 px en fp32 sobre una RTX 3090). El lienzo de inferencia es de 432x768 píxeles y la licencia es Apache 2.0, aunque con un matiz importante sobre la cesión de derechos que se detalla en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para flujo óptico denso (NeuFlow v2), optimizada para dispositivos de borde |
| Parametros totales | 9 millones (9M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de pares de imágenes; lienzo de 432x768 píxeles) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint `.pt` (state-dict envuelto en esquema LibreYOLO v1.0); pesos originales en `.pth` (PyTorch) |
| Tarea | Flujo óptico (image-to-image) |
| Variante de entrenamiento | `sintel` (ajuste fino sobre el dataset Sintel) |
| Resolucion de lienzo | 432x768 |
| Salida | Campo de flujo (H, W, 2) float32 en píxeles (dx, dy) |

## Arquitectura y entrenamiento

NeuFlow v2 es una red de flujo óptico denso de 9M de parámetros concebida para maximizar la eficiencia computacional en dispositivos de borde. El artículo de referencia (arXiv:2408.10161) describe el diseño orientado a reducir el coste por píxel manteniendo la precisión en la estimación del movimiento. El checkpoint aquí distribuido corresponde al ajuste fino sobre el dataset Sintel, que aporta secuencias con movimientos grandes y escenas realistas, y que en la literatura de flujo óptico se emplea habitualmente como referencia de evaluación y fine-tuning.

El proceso de empaquetado realizado por LibreYOLO es puramente de metadatado: las claves y los parámetros aprendidos no se modifican. El state-dict se envuelve en el esquema LibreYOLO v1.0 con `task=flow`, `nc=1`, `names={0: "flow"}`, `variant=sintel` y lienzo 432x768. La paridad numérica se verificó comparando la salida del modelo LibreYOLO en fp32 contra el módulo `NeuFlow` original sobre una RTX 3090, obteniendo una diferencia absoluta máxima de 0.0 px, es decir, reproducción bit a bit. Los scripts de conversión y verificación (`weights/convert_neuflowv2_weights.py` y `weights/parity_neuflowv2.py`) están disponibles en el repositorio de LibreYOLO. No se dispone de información detallada sobre el número de tokens o composición exacta del dataset de entrenamiento más allá de la variante Sintel indicada.

## Capacidades

- Estimación de flujo óptico denso entre pares de fotogramas consecutivos, devolviendo un campo vectorial (dx, dy) por píxel en la resolución del lienzo original.
- Procesamiento por lotes de N fotogramas de entrada, generando N-1 flujos de salida en una sola llamada.
- Salida en formato float32 con dimensiones (H, W, 2), directamente utilizable para tareas de movimiento.
- Conversión a visualización mediante rueda de color Middlebury (`to_rgb()`), útil para inspección y depuración.
- Diseño ligero (9M de parámetros) orientado a inferencia en tiempo real en dispositivos de borde.
- Integración nativa con el ecosistema LibreYOLO a través de la clase `LibreYOLO`.
- No incluye capacidades de lenguaje, tool calling, agentes, razonamiento multi-paso ni procesamiento multimodal más allá de la imagen.

## Casos de uso

- Robótica móvil y navegación: el modelo estima el movimiento aparente entre fotogramas consecutivos de una cámara a bordo, lo que permite a un robot detectar obstáculos en movimiento o estimar su propio desplazamiento relativo. Su tamaño de 9M parámetros lo hace apto para ejecutarse en placas embebidas con recursos limitados.
- Drones y UAV: para estabilización visual y evitación de obstáculos en tiempo real, el flujo óptico denso a 432x768 proporciona información de movimiento sin necesidad de hardware de altas prestaciones, algo crítico por las restricciones de peso y consumo en vuelo.
- Vehículos autónomos y ADAS: detección de objetos en movimiento y estimación de movimiento propio (ego-motion) a partir de secuencias de cámara, como módulo auxiliar de bajo coste computacional dentro de un pipeline de percepción más amplio.
- Postproducción y efectos visuales: estimación de movimiento entre fotogramas para interpolación temporal, estabilización de vídeo o generación de mapas de movimiento utilizados en composición y retiming.
- Análisis de vídeo y videovigilancia: detección de movimiento y seguimiento de personas u objetos en secuencias, con la ventaja de un modelo ligero que puede desplegarse en múltiples cámaras sin gran coste de infraestructura.
- Investigación en visión por computador: como línea base eficiente y reproducible (con paridad bit a bit verificada) para comparar métodos de flujo óptico o para experimentar con fine-tuning sobre nuevos datasets.
- Interpolación de fotogramas en tiempo real: aplicaciones de reproducción de vídeo o gaming que requieren generar fotogramas intermedios con bajo coste, donde un modelo de 9M de parámetros encaja en presupuestos de latencia estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la verificación de paridad numérica frente al módulo `NeuFlow` original (diferencia absoluta máxima de 0.0 px en fp32 sobre RTX 3090), que es una prueba de equivalencia, no una métrica de precisión sobre datasets como Sintel o KITTI.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, coherente con un modelo de 9M de parámetros. En fp32, los pesos ocupan del orden de decenas de MB; el grueso del consumo vendrá de las activaciones a resolución 432x768 y del tamaño del lote.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo está pensado para dispositivos de borde, por lo que también puede ejecutarse en GPUs de gama baja o en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual (por ejemplo, RTX 3060, RTX 4060, RTX 4090), dado su reducido tamaño.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` con la clase `LibreYOLO` y el checkpoint `.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo). El checkpoint original en PyTorch (`.pth`) puede usarse con el repositorio upstream de NeuFlow v2.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La model card solo confirma la reproducción bit a bit en fp32 sobre RTX 3090, sin cifras de latencia o FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreNeuFlowv2s-flow-sintel | 9M | Flujo óptico denso | Pares de imágenes, lienzo 432x768 | Apache 2.0 | Hugging Face (LibreYOLO) |
| NeuFlow v2 (upstream) | 9M | Flujo óptico denso | Pares de imágenes | Apache 2.0 (repo upstream) | GitHub (neufieldrobotics) |
| Otros modelos de flujo óptico (RAFT, FlowFormer, etc.) | No disponible en la informacion | Flujo óptico denso | Pares de imágenes | No disponible | No disponible |

No se dispone en la información proporcionada de datos comparativos de rendimiento (EPE, F1-all) frente a RAFT, FlowFormer u otros métodos de flujo óptico, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La licencia Apache 2.0 se aplica según la interpretación de LibreYOLO: el repositorio upstream incluye el checkpoint sin una licencia de pesos separada, por lo que la redistribución se ampara en la licencia del repositorio y en una cesión implícita del proyecto publicador, no confirmada explícitamente por los autores. Conviene revisar los ficheros `LICENSE` y `NOTICE` antes de un uso comercial.
- El modelo está especializado en flujo óptico y no ofrece generación de texto, razonamiento, código ni capacidades multimodales más allá de la imagen.
- La resolución de trabajo está fijada en un lienzo de 432x768; usos con otras resoluciones requerirán redimensionado y pueden afectar a la precisión del flujo.
- Al ser un ajuste fino sobre Sintel, su comportamiento en dominios muy distintos (escenas nocturnas, imágenes térmicas, movimiento muy rápido no representado en el dataset) puede degradarse; no se documentan evaluaciones de generalización.
- No se documentan sesgos específicos, pero al ser un modelo de visión entrenado sobre datasets de vídeo, puede heredar sesgos de las escenas y condiciones presentes en dichos datos.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de estimaciones de flujo erróneas en regiones oclusas, texturas repetitivas o movimiento ambiguo, algo inherente a la tarea.
- No se documentan variantes cuantizadas ni métricas de latencia, por lo que el despliegue en producción requiere una evaluación propia del rendimiento en el hardware objetivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un empaquetado reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreNeuFlowv2s-flow-sintel
- Checkpoint canónico: https://huggingface.co/LibreYOLO/LibreNeuFlowv2s-flow
- Repositorio upstream NeuFlow v2: https://github.com/neufieldrobotics/NeuFlow_v2
- Commit de origen de los pesos: https://github.com/neufieldrobotics/NeuFlow_v2/commit/204b5e3744461d90303b9ff82caa7a1bb56a2ca2
- Artículo: https://arxiv.org/abs/2408.10161
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
