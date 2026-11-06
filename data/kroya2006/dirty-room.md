# kroya2006/dirty-room

## Resumen

`kroya2006/dirty-room` es un modelo de detección de objetos en formato ONNX publicado en Hugging Face por el usuario kroya2006, orientado a la identificación de suciedad y desperfectos en entornos de interior (derrames de líquidos, papeleras, basura, moho y manchas). El modelo se presenta como una contribución de "public-track" para la subnet 44 (Score) de Bittensor, un ecosistema de minería descentralizada de modelos de IA, y está pensado para servirse a través de la plataforma Chutes.

Se trata de un modelo de visión por computador puro (pipeline `object-detection`), sin capacidades de generación de texto ni de razonamiento lingüístico. El repositorio incluye un `miner.py` con la clase `Miner` que carga el modelo mediante `onnxruntime`, OpenCV y NumPy, además de los pesos `weights.onnx` y un `chute_config.yml` con la configuración de imagen y nodo de Chutes. El tamaño del repositorio es de 0,0 GB según los metadatos, lo que sugiere un modelo muy compacto.

La relevancia de este modelo es limitada y muy específica: sirve como referencia de implementación para mineros de la subnet Score de Bittensor y como detector especializado en cinco clases de suciedad. No dispone de información pública sobre arquitectura interna, datos de entrenamiento, licencia ni benchmarks, por lo que su evaluación rigurosa queda seriamente comprometida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ONNX de detección de objetos; backbone y cabecera no especificados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no lingüístico) |
| Tipos de cuantizacion | no disponible (se distribuye únicamente en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del detector: la model card no especifica si se trata de una familia YOLO, SSD, Faster R-CNN, DETR u otra, ni detalla el backbone, la resolución de entrada, el número de parámetros o la estrategia de post-procesado (NMS, anchors, etc.). Lo único confirmado es que el artefacto distribuido es un grafo ONNX ejecutable con `onnxruntime`, y que la inferencia se realiza junto con OpenCV y NumPy en el script `miner.py`.

Tampoco hay datos sobre el conjunto de entrenamiento (número de imágenes, composición, anotaciones, aumentos de datos) ni sobre posibles fases de ajuste fino. La model card menciona que el modelo "se construyó a partir de un modelo ONNX", lo que sugiere una conversión o adaptación de un detector preexistente, pero no se aporta el origen. La única información operativa relevante es el esquema de puntuación de la subnet: `0.6·map50 + 0.4·false_positive`, con un límite de latencia p95 de 100 ms.

## Capacidades

- Detección de objetos en imágenes de interiores con cinco clases definidas: `liquid spillage` (derrame de líquido), `bin` (papelera), `litter` (basura), `mould` (moho) y `stain` (mancha).
- Salida de detecciones en formato estándar de detección de objetos (cajas delimitadoras y etiquetas de clase; el formato exacto de salida del grafo ONNX no está documentado).
- Inferencia optimizada para latencia: el modelo está empaquetado para cumplir el límite p95 de 100 ms exigido por la subnet Score.
- Ejecución en CPU o GPU a través de `onnxruntime`, con dependencias mínimas (OpenCV y NumPy).
- Integración con la plataforma Chutes mediante `chute_config.yml`.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de audio o de generación de texto.

## Casos de uso

- **Inspección de limpieza en instalaciones**: el detector puede procesar imágenes o fotogramas de cámaras en pasillos, baños o cocinas para identificar derrames, manchas y moho, permitiendo generar alertas al personal de limpieza. Es adecuado por su conjunto de clases específicamente diseñado para esta tarea.
- **Auditoría automatizada de estado de habitaciones**: en el sector hotelero o de alquiler vacacional, el modelo puede analizar fotos de una habitación antes y después de la limpieza para verificar que no quedan residuos ni manchas, gracias a las clases `litter`, `stain` y `liquid spillage`.
- **Minería en la subnet Score de Bittensor**: el repositorio sirve como plantilla funcional para mineros que quieran participar en la subnet 44, ya que incluye `miner.py`, `weights.onnx` y `chute_config.yml` listos para desplegar en Chutes.
- **Monitorización de espacios públicos**: integrado en un pipeline de visión con cámaras fijas, puede detectar la presencia de papeleras desbordadas (`bin`) o basura acumulada (`litter`) en estaciones, aeropuertos o centros comerciales.
- **Detección temprana de moho en viviendas**: la clase `mould` permite construir un sistema de alerta para gestores de propiedades que analice imágenes periódicas de paredes y techos y derive inspecciones presenciales cuando se detecte riesgo.
- **Preprocesado para robótica de limpieza**: un robot de servicio podría usar las detecciones para localizar derrames o manchas y planificar la ruta de fregado, siempre que se cumpla el límite de latencia de 100 ms.
- **Evaluación comparativa de detectores en entornos controlados**: al ser un modelo ONNX compacto con un esquema de puntuación definido, puede usarse como baseline en experimentos de la subnet Score frente a otros mineros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona el esquema de evaluación de la subnet (`0.6·map50 + 0.4·false_positive`, latencia p95 ≤ 100 ms), pero no aporta valores numéricos obtenidos por este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,0 GB según los metadatos, lo que sugiere un modelo muy pequeño que probablemente quepa en cualquier GPU consumer, pero no se confirma el tamaño real de `weights.onnx`.
- GPU recomendadas: no disponibles. Por el límite de latencia p95 de 100 ms y el formato ONNX, es plausible su ejecución en GPU de gama media o incluso en CPU, pero no hay datos que lo confirmen.
- ¿Cabe en GPU consumer? No confirmado; por el tamaño aparente del repositorio, es probable, pero no se puede asegurar.
- Opciones de despliegue: `onnxruntime` (CPU/GPU) con OpenCV y NumPy; despliegue gestionado en Chutes mediante `chute_config.yml`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Latencia y throughput: el único dato es el límite p95 de 100 ms exigido por la subnet; no se publica la latencia real medida.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (detectores de suciedad en interiores) ni datos de rendimiento que permitan establecer una comparación fundamentada. Tampoco se conocen otros mineros públicos de la subnet Score con los que contrastar.

## Limitaciones y advertencias

- **Ausencia de licencia**: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. En la práctica, esto bloquea su adopción en producción sin contactar con el autor.
- **Falta de documentación técnica**: no se detalla arquitectura, datos de entrenamiento, resolución de entrada ni formato exacto de salida, lo que dificulta la integración y la reproducibilidad.
- **Dominio muy restringido**: solo cinco clases de suciedad en interiores; no es un detector de propósito general y probablemente generalice mal fuera de su distribución de entrenamiento.
- **Riesgo de falsos positivos**: el propio esquema de puntuación de la subnet penaliza los falsos positivos con un peso del 40 %, lo que sugiere que este es un problema relevante en la tarea; sin métricas publicadas no se puede cuantificar.
- **Sin información sobre sesgos**: no hay datos sobre el conjunto de entrenamiento, por lo que no se puede evaluar sesgos por tipo de superficie, iluminación, geografía o materiales.
- **Latencia no verificada**: el límite de 100 ms es un requisito de la competición, no una medición publicada del modelo.
- **Cero adopción**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.
- **Fecha de creación futura**: los metadatos indican creación en 2026-11-04, lo que puede deberse a un error de la plataforma o a una fecha programada; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- [Hugging Face: kroya2006/dirty-room](https://huggingface.co/kroya2006/dirty-room)
- [Bittensor](https://bittensor.com/)
- [Chutes](https://chutes.ai/)
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
