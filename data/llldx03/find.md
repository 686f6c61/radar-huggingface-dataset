# llldx03/FIND

## Resumen

FIND (Frequency Invariance Disentanglement) es un método de adaptación en tiempo de prueba (test-time adaptation, TTA) para detección de objetos 3D sobre nubes de puntos LiDAR, presentado en NeurIPS 2026 y publicado por el autor llldx03. El repositorio de Hugging Face no contiene un modelo generativo ni un modelo de lenguaje, sino un conjunto de checkpoints preentrenados en el dominio fuente que sirven como punto de partida para el proceso de adaptación descrito en el artículo arXiv:2611.09170.

Los pesos publicados son checkpoints de un detector SECOND-IoU entrenados en tres conjuntos de datos fuente distintos: nuScenes, Waymo y KITTI. Cada checkpoint está asociado a una tarea de adaptación concreta: nuScenes→KITTI (n2k.pth), Waymo→KITTI (w2k.pth) y KITTI→KITTI-C (k2c.pth), donde KITTI-C es la variante con corrupciones. El objetivo es que estos pesos se coloquen en el directorio `checkpoints/` del repositorio de código en GitHub y se utilicen junto con las estadísticas espectrales de la fuente y el procedimiento de adaptación en línea.

La relevancia del artefacto es acotada y muy específica: no es un modelo de propósito general, sino material reproducible para investigación en robustez de detectores LiDAR ante cambios de dominio (sensores, condiciones meteorológicas, corrupciones). El tamaño del repositorio es de 0,4 GB y no se declaran licencia, idiomas ni pipeline de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector 3D LiDAR SECOND-IoU (backbone convolucional disperso, no disponible el detalle exacto) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de checkpoints de SECOND-IoU, un detector de objetos 3D para nubes de puntos LiDAR basado en convoluciones dispersas (sparse convolutions) sobre un backbone tipo SECOND. Los tres checkpoints publicados corresponden a entrenamiento supervisado en dominio fuente: nuScenes (n2k.pth), Waymo (w2k.pth) y KITTI (k2c.pth). No se especifican en la información disponible el número de parámetros, la composición exacta del dataset de entrenamiento ni el número de tokens o muestras procesadas.

La innovación del método FIND, según el título y las etiquetas del repositorio, es la "descomposición de invariancia frecuencial" (Frequency Invariance Disentanglement) aplicada a la adaptación en tiempo de prueba. El flujo de uso requiere estadísticas espectrales del dominio fuente y un procedimiento de adaptación en línea descritos en el README del repositorio de GitHub. No se dispone de detalles sobre si hubo fases de RLHF/DPO (no aplicable a este tipo de modelo) ni sobre técnicas de decodificación especulativa.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR (coches, peatones, ciclistas y clases del dataset correspondiente).
- Punto de partida para adaptación en tiempo de prueba (TTA) sin etiquetas del dominio objetivo.
- Transferencia entre dominios: nuScenes→KITTI, Waymo→KITTI y KITTI→KITTI-C (robustez ante corrupciones).
- Integración con el código de FIND para calcular estadísticas espectrales de la fuente y ejecutar adaptación en línea.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de pensamiento (thinking mode), visión 2D, audio ni generación de texto.

## Casos de uso

- Investigación en robustez de detección LiDAR: usar los checkpoints como línea base fuente para reproducir los experimentos de adaptación del artículo arXiv:2611.09170 y comparar con otros métodos TTA.
- Evaluación de transferencia entre sensores: emplear n2k.pth para estudiar cómo se degrada un detector entrenado en nuScenes al desplegarse sobre KITTI, y medir la mejora tras la adaptación en línea.
- Benchmarking de corrupciones: usar k2c.pth para evaluar la resistencia del detector ante las corrupciones de KITTI-C y cuantificar la ganancia de FIND frente a no adaptar.
- Desarrollo de pipelines de conducción autónoma: integrar el detector adaptado en un sistema de percepción que deba operar con sensores o condiciones distintas a las del entrenamiento original.
- Reproducibilidad académica: servir como material de partida para replicar resultados de NeurIPS 2026 y como referencia para nuevas propuestas de TTA en detección 3D.
- Estudio de métodos basados en frecuencia: analizar las estadísticas espectrales de la fuente y su relación con la invariancia de dominio en detectores LiDAR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño del backbone SECOND-IoU y del número de puntos por muestra.
- GPU recomendadas: no disponible. Los detectores LiDAR 3D de la familia SECOND suelen ejecutarse en GPUs con al menos 8-16 GB de VRAM, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado; el repositorio no especifica requisitos.
- Opciones de despliegue: el código de referencia está en GitHub (https://github.com/llldx03/FIND); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dominio fuente | Tarea de adaptación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FIND (este artefacto) | SECOND-IoU + TTA | nuScenes, Waymo, KITTI | n2k, w2k, k2c | no disponible | Hugging Face + GitHub |
| Alternativas TTA para detección 3D LiDAR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no debe evaluarse con métricas de NLP ni usarse para tareas de texto.
- La licencia no está declarada, lo que impide confirmar si se permite uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Solo se publican checkpoints fuente; el proceso de adaptación requiere código adicional del repositorio de GitHub y estadísticas espectrales de la fuente.
- Riesgo de sobreajuste al dominio objetivo durante la adaptación en línea si no se controla el procedimiento; el artículo debe consultarse para los detalles.
- No se documentan sesgos, pero los datasets de entrenamiento (nuScenes, Waymo, KITTI) tienen sesgos geográficos y de sensores que pueden propagarse.
- Riesgo de fallo en dominios muy alejados de los tres datasets cubiertos; no hay evidencia de generalización a otros sensores o entornos.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es mínima.
- No se especifican requisitos de hardware, lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/llldx03/FIND
- Paper: https://arxiv.org/abs/2611.09170
- Código: https://github.com/llldx03/FIND
- README del código: https://github.com/llldx03/FIND#readme
