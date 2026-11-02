# apexlabs-hq/sn44-dirtiness-v17

## Resumen

`apexlabs-hq/sn44-dirtiness-v17` es un detector de objetos exportado a formato ONNX, diseñado para identificar condiciones de suciedad en entornos de interior (habitaciones). El modelo se presenta como un detector end-to-end servido mediante `miner.py` sobre `onnxruntime`, y detecta cinco clases concretas: derrames de líquido, papeleras, residuos, moho y manchas. El repositorio pertenece a la organización `apexlabs-hq` y su nombre sugiere una integración con la subred 44 de Bittensor (SN44), un ecosistema descentralizado de mineros y validadores.

La información pública disponible es extremadamente limitada: el repositorio tiene un tamaño de 0.0 GB, no registra descargas ni interacciones, y la model card únicamente documenta parámetros de inferencia (tamaño de imagen de 736 píxeles, umbrales de confianza por clase y el hash SHA-256 de los pesos). No se especifican arquitectura base, número de parámetros, licencia, idiomas ni composición del dataset de entrenamiento.

Por su naturaleza, se trata de un artefacto de despliegue más que de un modelo fundacional: su relevancia radica en ser un componente operativo dentro de un pipeline de minado o validación, no en capacidades generativas. Cualquier evaluación técnica debe partir de esa premisa y de la ausencia de documentación sobre su procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX; arquitectura base no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX; precisión de los pesos no documentada) |
| Idiomas soportados | no disponible (no aplica a la tarea de detección) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

Parámetros de inferencia documentados en la model card:

| Parametro | Valor |
|---|---|
| Tamaño de imagen de entrada (imgsz) | 736 |
| Umbral de confianza global | 0.05 |
| Umbrales por clase | clase 0: 0.3; clase 1: 0.4; clase 2: 0.3; clase 3: 0.3; clase 4: 0.3 |
| Clases | liquid spillage, bin, litter, mould, stain |
| Runtime | onnxruntime, servido por `miner.py` |
| SHA-256 de los pesos | `c0b89e35deabef22009d106d7f3e53eee563d5d33139e817b58e1317b2779e27` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card solo indica que es un detector ONNX end-to-end, lo que implica que el preprocesado, la inferencia y el postprocesado (decodificación de cajas y aplicación de NMS, presumiblemente) están integrados en el grafo exportado. El tamaño de entrada de 736 píxeles sugiere una resolución superior a la habitual de 640 en detectores tipo YOLO, lo que podría favorecer la detección de manchas y residuos pequeños, pero no se confirma la familia de arquitectura.

Tampoco hay datos sobre el dataset de entrenamiento: ni número de imágenes, ni composición por clase, ni procedencia, ni si se aplicaron técnicas de aumento de datos o ajuste fino desde un checkpoint previo. El nombre del repositorio referencia `manako/Detect-room-dirtiness-detection`, lo que apunta a que este ONNX es una exportación o derivado de otro modelo, pero no se documenta el proceso de conversión ni las diferencias respecto al original.

## Capacidades

- Detección de objetos en imágenes de interior con cinco clases: derrames de líquido, papeleras, residuos, moho y manchas.
- Inferencia end-to-end en ONNX Runtime, sin dependencia de frameworks de entrenamiento en producción.
- Umbrales de confianza diferenciados por clase, lo que permite ajustar la sensibilidad de cada categoría de forma independiente.
- Entrada de imagen fija a 736 píxeles, adecuada para escenas de habitación con objetos de tamaño medio y pequeño.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión por computador.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, vídeo).

## Casos de uso

- Inspección automatizada de habitaciones en alojamientos turísticos: el detector permite generar un informe por estancia identificando derrames, residuos o moho antes del check-in, con umbrales por clase ajustables para reducir falsos positivos en cada categoría.
- Mantenimiento de instalaciones: integrado en una app móvil o robot de limpieza, el modelo marca en tiempo real las zonas con manchas o residuos para priorizar la intervención del personal.
- Control de calidad en limpieza profesional: comparación de imágenes antes y después del servicio, usando las detecciones como evidencia objetiva de que no quedan derrames ni moho visible.
- Monitorización de moho en vivienda: dado el umbral específico de 0.3 para la clase `mould`, el modelo puede emplearse en alertas tempranas de humedad en paredes y techos, enviando la imagen a revisión humana cuando se supera el umbral.
- Validación en pipelines descentralizados (SN44): al ser un artefacto ONNX servido por `miner.py`, encaja como componente de mineros o validadores que necesitan una inferencia reproducible y verificable mediante el hash SHA-256 de los pesos.
- Gestión de residuos en espacios públicos: detección de papeleras y litter para planificar rutas de recogida o medir la eficacia de campañas de limpieza mediante conteos agregados.
- Prototipado rápido en entornos con recursos limitados: al ser ONNX, puede ejecutarse en CPU con `onnxruntime` sin GPU, lo que facilita pruebas de concepto en dispositivos edge antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al no documentarse el número de parámetros ni la precisión de los pesos, no es posible estimar el consumo de memoria con rigor.
- GPU recomendadas: no disponible. La model card solo menciona `onnxruntime`, que permite ejecución tanto en CPU como en GPU (CUDA, DirectML, TensorRT) según el proveedor de ejecución configurado.
- Compatibilidad con GPU de consumo: no confirmada. Un detector con entrada de 736 píxeles suele ser viable en GPUs de consumo (por ejemplo, RTX 3060 en adelante) si el modelo es de tamaño moderado, pero este dato no está documentado.
- Opciones de despliegue: `onnxruntime` es el runtime declarado; también podría servirse con Triton Inference Server, ONNX Runtime Server o integrarse en aplicaciones Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (detección de suciedad en interiores) con parámetros, contexto y licencia documentados.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: se desconoce la distribución de imágenes, la procedencia y si cubre condiciones de iluminación, ángulos y tipos de superficie diversos, lo que impide evaluar su robustez fuera del dominio original.
- Licencia no especificada: no puede utilizarse en producción comercial sin aclarar previamente los términos legales con el autor.
- Riesgo de falsos positivos y negativos: los umbrales por clase son bajos (0.3-0.4), lo que sugiere un diseño orientado a recall; en producción podría requerir calibración adicional y validación con datos propios.
- Sin métricas publicadas: no hay mAP, precisión, recall ni curvas PR, por lo que no es posible comparar su rendimiento de forma objetiva con alternativas.
- Modelo de nicho y sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de encontrar reportes de uso o incidencias resueltas por la comunidad.
- Dependencia de un script concreto (`miner.py`): el contrato de entrada/salida está ligado a ese servidor, y no se documenta el esquema exacto de las detecciones devueltas.
- Posible sesgo hacia entornos de interior concretos: las clases `mould` y `stain` son visualmente ambiguas y pueden confundirse entre sí o con sombras y texturas, sin que se documenten estrategias de mitigación.
- No apto para tareas fuera de la detección visual: no genera texto, no razona y no soporta instrucciones en lenguaje natural.

## Enlaces

- [HuggingFace: apexlabs-hq/sn44-dirtiness-v17](https://huggingface.co/apexlabs-hq/sn44-dirtiness-v17)
- Modelo de referencia citado en la model card: `manako/Detect-room-dirtiness-detection` (sin URL directa proporcionada en la información disponible)
