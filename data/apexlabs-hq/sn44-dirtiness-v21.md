# apexlabs-hq/sn44-dirtiness-v21

## Resumen

`apexlabs-hq/sn44-dirtiness-v21` es un detector de objetos en formato ONNX publicado en Hugging Face por el usuario `apexlabs-hq`. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador especializado en detectar suciedad en interiores: derrames de líquidos, papeleras, residuos, moho y manchas. El modelo está pensado para ser servido de extremo a extremo mediante `miner.py` usando `onnxruntime`, lo que indica un uso orientado a inferencia ligera y despliegue directo.

La información disponible es muy limitada: el repositorio tiene un tamaño de 0,0 GB (probablemente porque los pesos se almacenan con Git LFS o el recuento no está actualizado), no declara licencia, idiomas ni pipeline en los metadatos de Hugging Face, y no cuenta con descargas ni likes en el momento de la consulta. La model card se limita a documentar la configuración de inferencia (clases, resolución de entrada, umbrales de confianza y supresión de duplicados) y el hash SHA-256 de los pesos.

Por tanto, esta ficha describe un artefacto de detección visual de propósito muy concreto, presumiblemente vinculado al subred SN44 de Bittensor (el prefijo `sn44` y el nombre `dirtiness` así lo sugieren), sin datos publicados sobre arquitectura interna, entrenamiento o rendimiento. Cualquier evaluación rigurosa requerirá inspeccionar el grafo ONNX y ejecutar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ONNX de detección de objetos; familia concreta no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; cuantización interna no declarada) |
| Idiomas soportados | no disponible (no aplica, modelo visual) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Resolución de entrada | 736 × 736 px (`imgsz: 736`) |
| Clases detectadas | liquid spillage, bin, litter, mould, stain (5 clases) |
| Umbral de confianza global | 0,05 |
| Umbrales por clase | 0: 0,30; 1: 0,25; 2: 0,45; 3: 0,25; 4: 0,25 |
| Supresión de duplicados entre clases | (0,3,0,3), (0,4,0,3), (3,4,0,3) |
| SHA-256 de pesos | `7bebd09add6a7d65815154792edf27ae5689122ffe85fe359b654ae550296aa6` |
| Runtime declarado | `onnxruntime` vía `miner.py` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. El único dato técnico es que se distribuye como grafo ONNX y que se sirve con `onnxruntime` desde un script llamado `miner.py`, lo que sugiere un detector de una sola etapa optimizado para latencia baja. La resolución de entrada de 736 × 736 y la presencia de umbrales por clase y reglas de supresión de duplicados entre pares de clases son coherentes con un pipeline de detección tipo YOLO o similar, pero la model card no lo confirma.

Tampoco hay datos sobre el conjunto de entrenamiento (número de imágenes, composición, procedencia), sobre técnicas de aumento de datos, ni sobre si se aplicó destilación, poda o cuantización. El hash SHA-256 de los pesos permite verificar la integridad del artefacto, pero no aporta información sobre su origen. No se han publicado detalles de RLHF, DPO ni de ningún otro proceso de alineación, algo esperable en un modelo de visión.

## Capacidades

- Detección de cinco categorías de suciedad en imágenes de interiores: derrames de líquidos, papeleras, residuos, moho y manchas.
- Inferencia de extremo a extremo en formato ONNX con `onnxruntime`, sin dependencia de frameworks de deep learning pesados.
- Umbrales de confianza diferenciados por clase, lo que permite ajustar la sensibilidad de cada categoría de forma independiente.
- Supresión de duplicados entre clases potencialmente confundibles (derrame/mancha, derrame/moho, moho/mancha) con umbral de 0,3.
- Entrada de imagen de resolución fija de 736 × 736 píxeles.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un detector visual.
- Capacidades multilingües: no aplica.

## Casos de uso

- **Auditoría de limpieza en alojamientos turísticos**: procesar fotos enviadas por el personal de limpieza o por cámaras fijas para verificar que no quedan derrames, residuos ni manchas antes de dar una habitación por lista. La detección por clases permite generar informes por tipo de incidencia.
- **Inspección automatizada de oficinas y espacios públicos**: integrar el detector en un pipeline que analice imágenes periódicas de zonas comunes y genere alertas cuando se detecte litter o bin desbordada, priorizando el mantenimiento.
- **Mantenimiento preventivo de moho**: usar la clase `mould` con su umbral específico (0,25) para detectar proliferación temprana en baños, sótanos o zonas húmedas a partir de fotografías de inspección, antes de que el problema sea estructural.
- **Verificación de estado en robótica de servicio**: un robot de limpieza puede capturar imágenes del entorno y usar el modelo embebido vía ONNX para decidir si una zona requiere repaso, con latencia baja gracias a `onnxruntime`.
- **Control de calidad en industria alimentaria**: detectar derrames de líquidos y manchas en superficies de trabajo a partir de imágenes de cámaras fijas, activando protocolos de limpieza cuando la confianza supera el umbral de la clase 0.
- **Etiquetado asistido de datasets**: usar el detector como preanotador para generar cajas candidatas sobre imágenes nuevas; la supresión de duplicados entre clases reduce el ruido en la revisión manual posterior.
- **Monitorización en aplicaciones móviles o edge**: al ser ONNX, puede desplegarse en dispositivos sin GPU dedicada mediante `onnxruntime`, lo que facilita su uso en apps de inspección de campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, mAP ni comparaciones con otros detectores. Tampoco se documentan latencias ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. Al no conocerse el número de parámetros ni el tamaño real de los pesos, no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible. Un detector ONNX a 736 × 736 suele ejecutarse en GPUs consumer modernas (RTX 3060 o superior) con holgura, pero no hay datos que lo confirmen para este artefacto.
- Compatibilidad con GPU consumer: probable pero no confirmada; depende del tamaño del grafo y de si se ejecuta en CPU o con proveedor CUDA/TensorRT.
- Opciones de despliegue: `onnxruntime` (declarado en la model card, vía `miner.py`). También podría servirse con `onnxruntime-server`, Triton Inference Server o `OpenVINO` si el grafo es compatible, aunque no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Licencia | Notas |
|---|---|---|---|---|---|
| apexlabs-hq/sn44-dirtiness-v21 | Detector ONNX | 5 (suciedad) | 736 × 736 | no disponible | Versión actual del detector SN44 |
| apexlabs-hq/sn44-dirtiness-v17 | Detector ONNX | no disponible | no disponible | no disponible | Versión anterior del mismo autor |
| apexlabs-hq/sn44-dirtiness-v15 | Detector ONNX | no disponible | no disponible | no disponible | Versión anterior del mismo autor |

No se dispone de información sobre modelos de terceros comparables en la misma categoría (detección de suciedad en interiores) dentro de la información proporcionada. Las versiones v15 y v17 del mismo autor aparecen en los resultados de búsqueda, pero sin datos técnicos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita, no hay garantía de uso comercial. Es imprescindible contactar con el autor antes de integrarlo en producción.
- **Documentación mínima**: no se especifican arquitectura, parámetros, datos de entrenamiento ni métricas. La evaluación de calidad requiere pruebas propias sobre un conjunto representativo.
- **Sesgos desconocidos**: al no conocerse la distribución del dataset de entrenamiento, no se puede evaluar el sesgo respecto a tipos de superficies, iluminación, ángulos de cámara o geografías.
- **Riesgo de alucinación visual**: como todo detector, puede producir falsos positivos, especialmente con el umbral global bajo (0,05). Los umbrales por clase mitigan parcialmente este riesgo, pero deben calibrarse en el dominio de despliegue.
- **Resolución fija**: la entrada está fijada a 736 × 736; imágenes con relaciones de aspecto muy distintas requerirán redimensionado, lo que puede degradar la detección de objetos pequeños.
- **Sin soporte multimodal ni textual**: no puede generar descripciones ni razonar sobre la escena; solo devuelve detecciones.
- **Trazabilidad limitada**: el hash SHA-256 permite verificar los pesos, pero no hay información sobre la procedencia de los datos ni sobre el proceso de entrenamiento.
- **Posible vinculación a Bittensor SN44**: el prefijo `sn44` sugiere un contexto de minería en subred; conviene verificar los términos de uso y la gobernanza de la subred antes de reutilizar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v21
- Versión anterior v17: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v17
- Versión anterior v15: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v15
- Modelo de referencia citado en la model card (`manako/Detect-room-dirtiness-detection`): no se ha podido verificar el enlace en la información disponible.
