# GreenMap/hatch-finder-11m

## Resumen

GreenMap/hatch-finder-11m es un modelo de segmentación de imágenes especializado en la detección de patrones de sombreado (hatching) en planos arquitectónicos y de planta (blueprints y floorplans). Desarrollado por GreenMap, forma parte de una familia de modelos orientados a la automatización de tareas de interpretación de documentación técnica en el sector de la arquitectura, la construcción y el BIM. Con aproximadamente 11,2 millones de parámetros, está diseñado para identificar y segmentar regiones con tramados específicos, posiblemente comparándolos con una imagen de referencia, según indican sus etiquetas.

El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación. Su pipeline declarado es `image-segmentation` y se integra mediante la librería `hatchfinder`. La información pública disponible es limitada: la model card remite al repositorio principal del modelo hermano `GreenMap/hatch-finder-3.5m` para una descripción completa, pero no se han publicado detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks comparativos. Aun así, su tamaño reducido y su enfoque específico lo hacen potencialmente útil para tareas de inspección automática de planos en entornos de bajo coste computacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en PyTorch) |
| Parametros totales | ~11,2 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. Los únicos datos disponibles son el número de parámetros (~11,2 millones) y el uso de PyTorch como framework. La etiqueta `image-segmentation` indica que el modelo genera máscaras de segmentación a nivel de píxel, probablemente mediante una red neuronal convolucional o un transformer de visión, pero esto no está confirmado.

Tampoco se han comunicado datos sobre el conjunto de entrenamiento, el número de tokens o imágenes utilizadas, ni si se aplicaron técnicas de ajuste como RLHF o DPO. La model card menciona un modelo hermano (`hatch-finder-3.5m`) como referencia principal, pero no se accede a su contenido desde la información proporcionada. Las únicas métricas de validación publicadas son una pérdida total de validación de 0,04312, una pérdida BCE de 0,01118 y una pérdida Dice de 0,03993, lo que sugiere un entrenamiento supervisado con una función de pérdida combinada de BCE y Dice, típica en segmentación semántica.

## Capacidades

- Segmentación de imágenes: detecta y delimita regiones con patrones de sombreado o tramado en imágenes de planos técnicos.
- Reconocimiento de patrones de sombreado: identifica elementos como muros, superficies o materiales representados mediante tramas específicas.
- Comparación con imagen de referencia: según las etiquetas (`reference-image`, `pattern-matching`), el modelo puede operar comparando el patrón detectado con una imagen de referencia dada.
- Aplicación en dominios de arquitectura y construcción: orientado a planos de planta, blueprints y documentación BIM.
- Integración en pipelines de PyTorch: al estar construido con esta librería, puede integrarse en flujos de trabajo existentes de visión por computador.

No se dispone de información sobre capacidades de generación de texto, razonamiento, tool calling o soporte multilingüe, ya que es un modelo puramente visual.

## Casos de uso

- Revisión automática de planos arquitectónicos: el modelo puede segmentar zonas con sombreados específicos para verificar que los planos cumplen con las normativas de representación gráfica, por ejemplo, detectando si un muro está correctamente tramado.
- Control de calidad en documentación BIM: integrado en un pipeline de validación, puede comparar el tramado de un plano digitalizado con una plantilla de referencia para detectar inconsistencias antes de la aprobación.
- Digitalización de planos históricos: al segmentar patrones de sombreado, facilita la conversión de planos en papel a formatos vectoriales o BIM, ayudando a separar elementos constructivos.
- Detección de errores en planos de instalaciones: en planos de fontanería o electricidad, los tramados suelen indicar tipos de tubería o cableado; el modelo puede identificar si un tramado está ausente o mal aplicado.
- Automatización de inventario de superficies: a partir de una imagen de planta, el modelo puede segmentar áreas con un mismo patrón (por ejemplo, zonas de pavimento) para estimar superficies de forma automática.
- Verificación de coherencia entre planos y modelos 3D: comparando el sombreado del plano con el material asignado en un modelo BIM, se pueden detectar discrepancias entre la documentación 2D y la 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como mIoU, Dice sobre conjuntos públicos tipo COCO o Cityscapes) en la información disponible. La model card solo incluye métricas de validación del propio entrenamiento, que no son comparables con otros modelos:

| Metrica | Valor |
|---|---|
| Pérdida total de validación | 0,04312 |
| Pérdida BCE | 0,01118 |
| Pérdida Dice | 0,03993 |

Estas cifras indican un buen ajuste en el conjunto de validación propio, pero no permiten evaluar el rendimiento relativo frente a otras soluciones de segmentación.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Dado el tamaño del modelo (~11,2 millones de parámetros), es razonable estimar que puede ejecutarse en GPUs de consumo medio, como una NVIDIA GTX 1660 o RTX 3060, con un uso de VRAM inferior a 2 GB en inferencia con precisión FP32. Sin embargo, estos son cálculos orientativos basados en el número de parámetros, no datos confirmados por el autor.

Para despliegue, al ser un modelo PyTorch, puede servirse mediante frameworks como TorchServe, ONNX Runtime o directamente con PyTorch en producción. No se mencionan opciones como vLLM u Ollama, que son específicas para modelos de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el ámbito específico de detección de sombreados en planos arquitectónicos. Existen modelos de segmentación semántica generales como U-Net, DeepLabV3 o SegFormer que podrían adaptarse a esta tarea, pero no hay datos públicos que permitan una comparación directa en términos de rendimiento o arquitectura. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- La información pública es muy escasa: no se conocen detalles de arquitectura, datos de entrenamiento ni procedencia de las imágenes utilizadas.
- Al ser un modelo especializado en un dominio muy concreto (sombreados en planos), su capacidad de generalización a otros tipos de imágenes o patrones es desconocida y probablemente limitada.
- No se han reportado sesgos específicos, pero al tratarse de un modelo entrenado con datos posiblemente limitados, puede presentar errores en planos con estilos de tramado poco comunes o de baja calidad.
- Riesgo de alucinación: en segmentación, esto se traduce en falsos positivos, es decir, regiones marcadas como sombreado cuando no lo son. No hay métricas que cuantifiquen este riesgo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se ofrece sin garantías implícitas; el usuario es responsable de validar su precisión en el caso de uso concreto.
- No hay información sobre el mantenimiento del modelo, actualizaciones o soporte.

## Enlaces

- Página del modelo en HuggingFace: [GreenMap/hatch-finder-11m](https://huggingface.co/GreenMap/hatch-finder-11m)
- Repositorio principal mencionado en la model card (modelo hermano): [GreenMap/hatch-finder-3.5m](https://huggingface.co/GreenMap/hatch-finder-3.5m)

No se han encontrado otros enlaces (papers, blogs, repos de código) en la información proporcionada.
