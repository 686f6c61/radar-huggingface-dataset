# barflyman/OpenMed-NER-PharmaDetect-ElectraMed-33M-ONNX

## Resumen

OpenMed-NER-PharmaDetect-ElectraMed-33M-ONNX es una conversión a formato ONNX del modelo original OpenMed-NER-PharmaDetect-ElectraMed-33M, desarrollado por el grupo OpenMed como parte de una familia de modelos especializados en reconocimiento de entidades biomédicas. Este modelo concreto está diseñado para la identificación de entidades químicas (fármacos, compuestos y sustancias terapéuticas) en textos clínicos y literatura científica, a partir del corpus BC5CDR-Chem. La conversión ONNX permite su ejecución en navegadores web mediante la librería transformers.js, facilitando su integración en aplicaciones JavaScript sin necesidad de infraestructura de servidor dedicada.

El modelo base tiene una arquitectura ELECTRA de 33 millones de parámetros, fine-tuneado para la tarea de token-classification con etiquetas B-CHEM e I-CHEM. El repositorio ONNX ocupa 0.4 GB e incluye los pesos en formato ONNX para su uso en entornos de inferencia ligeros. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones. La relevancia de esta versión radica en su capacidad de despliegue local y en el dispositivo, alineada con el enfoque local-first de OpenMed para la IA clínica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (modelo base: OpenMed/OpenMed-NER-PharmaDetect-ElectraMed-33M) |
| Parametros totales | 33 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (típico de ELECTRA: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (el repo ONNX no especifica cuantización) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (para transformers.js) |

## Arquitectura y entrenamiento

El modelo base es un ELECTRA de 33 millones de parámetros, una arquitectura transformer que emplea el preentrenamiento con reemplazo de tokens (replaced token detection). La tarea de fine-tuning se realizó sobre el corpus BC5CDR-Chem, que contiene 1.500 abstracts de PubMed con 4.409 entidades químicas anotadas. Este dataset se originó en la tarea BioCreative V Chemical-Disease Relation (CDR) y se centra en la identificación de compuestos químicos, fármacos y sustancias terapéuticas. El entrenamiento se enfocó en la clasificación de tokens para el etiquetado de entidades (B-CHEM e I-CHEM), sin uso de técnicas de RLHF ni DPO. La conversión a ONNX se realizó automáticamente mediante el espacio de Hugging Face `onnx-community/convert-to-onnx`, sin modificación de los pesos.

## Capacidades

- Reconocimiento de entidades químicas (B-CHEM e I-CHEM) en texto biomédico en inglés.
- Extracción de fármacos y compuestos de abstracts de PubMed, historiales clínicos y literatura de investigación.
- Funciona como pipeline de token-classification en transformers.js, permitiendo su uso en navegador o Node.js.
- No incluye capacidades de generación de texto, tool calling, razonamiento multi-paso ni soporte de agentes.
- No soporta otras entidades biomédicas como enfermedades, genes o síntomas; está limitado a químicos.
- Capacidad multilingüe no disponible; solo inglés.

## Casos de uso

- Extracción de fármacos en historiales clínicos electrónicos: el modelo puede identificar menciones de medicamentos en notas clínicas, facilitando la creación de resúmenes de medicación y la detección de interacciones potenciales.
- Minería de literatura científica para descubrimiento de fármacos: permite procesar miles de abstracts de PubMed y extraer automáticamente los compuestos químicos mencionados, acelerando la revisión sistemática.
- Monitorización de eventos adversos: a partir de informes de farmacovigilancia, el modelo extrae los fármacos implicados para correlacionarlos con reacciones adversas.
- Construcción de grafos de conocimiento biomédico: al identificar entidades químicas en documentos, se pueden enlazar con otras entidades (enfermedades, genes) para crear relaciones estructuradas.
- Aplicaciones de asistencia clínica en el dispositivo: gracias al formato ONNX y a transformers.js, se puede ejecutar en navegadores o dispositivos móviles para anotar textos en tiempo real sin conexión.
- Integración en pipelines de NLP biomédicos como etapa de NER para enriquecimiento de datos antes de análisis posteriores.

## Benchmarks y rendimiento

Los siguientes datos corresponden al modelo base original (OpenMed-NER-PharmaDetect-ElectraMed-33M), ya que no se han publicado resultados específicos para la versión ONNX.

| Metrica | Valor |
|---|---|
| F1 | 0.94 |
| Precision | 0.93 |
| Recall | 0.95 |
| Accuracy | 0.98 |

La tabla comparativa de la model card del modelo original muestra el rendimiento de otros modelos de la familia OpenMed sobre el mismo dataset BC5CDR-Chem, con F1 entre 0.9550 y 0.9614. El modelo de 33M no aparece en esa tabla, lo que indica que su rendimiento es inferior al de los modelos más grandes (335M, 560M, etc.), aunque aún competitivo para su tamaño.

## Requisitos de hardware

- El tamaño del repositorio es de 0.4 GB, lo que sugiere que el archivo ONNX puede caber en memoria RAM de un dispositivo móvil o en un navegador.
- No se proporcionan datos específicos de VRAM ni de latencia. Al ser un modelo de 33M, se puede ejecutar en CPU sin GPU, con tiempos de inferencia razonables para textos cortos.
- Puede ejecutarse en cualquier GPU moderna con al menos 1-2 GB de VRAM, pero no es necesario.
- Compatible con transformers.js para navegadores y Node.js, así como con ONNX Runtime en Python.
- No se han reportado despliegues con vLLM, llama.cpp u otros servidores de inferencia; su uso principal es en entornos ligeros.

## Comparativa con modelos similares

La siguiente tabla compara el modelo base de 33M con otros modelos de la familia OpenMed de mayor tamaño, basándose en los datos publicados en la model card.

| Modelo | Parametros | F1 | Precision | Recall | Accuracy |
|---|---|---|---|---|---|
| OpenMed-NER-PharmaDetect-ElectraMed-33M (base) | 33M | 0.94 | 0.93 | 0.95 | 0.98 |
| OpenMed-NER-PharmaDetect-SuperClinical-434M | 434M | 0.9614 | 0.9520 | 0.9710 | 0.9892 |
| OpenMed-NER-PharmaDetect-MultiMed-335M | 335M | 0.9610 | 0.9585 | 0.9634 | 0.9871 |
| OpenMed-NER-PharmaDetect-ElectraMed-335M | 335M | 0.9594 | 0.9539 | 0.9649 | 0.9863 |

No se dispone de comparación con otros modelos NER biomédicos fuera de la familia OpenMed en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo reconoce entidades químicas (B-CHEM, I-CHEM) y no otros tipos de entidades biomédicas como enfermedades o genes.
- El entrenamiento se realizó exclusivamente en el corpus BC5CDR-Chem, que es un conjunto limitado de abstracts de PubMed. La generalización a textos de otras fuentes puede ser limitada.
- El modelo está en inglés; no soporta otros idiomas.
- Riesgo de alucinación: puede identificar como químicos términos que no lo son, especialmente en contextos fuera de dominio.
- La versión ONNX no incluye datos de cuantización; se desconoce si se ha aplicado FP16 o FP32, lo que puede afectar al tamaño final y al rendimiento.
- No se han reportado pruebas de robustez en entornos de producción ni en textos clínicos reales más allá del dataset de entrenamiento.

## Enlaces

- Repositorio ONNX: https://huggingface.co/barflyman/OpenMed-NER-PharmaDetect-ElectraMed-33M-ONNX
- Modelo base original: https://huggingface.co/OpenMed/OpenMed-NER-PharmaDetect-ElectraMed-33M
- Página de OpenMed: https://openmed.life/
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Paper arxiv 2508.01630 (referenciado en los tags): https://arxiv.org/abs/2508.01630
