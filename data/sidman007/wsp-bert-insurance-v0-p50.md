# sidman007/wsp-bert-insurance-v0-p50

## Resumen

`wsp-bert-insurance-v0-p50` es un clasificador de frases del dominio de seguros construido sobre `google-bert/bert-base-uncased` mediante una técnica denominada *weight-space programming* (WSP). En lugar de ajustar los pesos con descenso de gradiente, un LLM editor lee y escribe directamente los tensores del modelo aplicando matemáticas en forma cerrada sobre los pesos y sobre las activaciones obtenidas en un número acotado de pasadas hacia delante. No hay retropropagación ni optimizadores implicados. El autor es `sidman007` y el modelo se publica bajo licencia Apache 2.0.

El resultado es un `BertForSequenceClassification` con ocho etiquetas específicas del sector asegurador: `coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal` y `conditions_duties`. El modelo declara una precisión del 97,30 % en test retenido y un macro-F1 de 0,9734, con un 6,474 % de los parámetros modificados (18 tensores, casi todos concentrados en la capa 11 del encoder y en el pooler).

Su relevancia es doble: por un lado, ofrece un clasificador funcional de cláusulas de seguros en inglés con un coste de entrenamiento mínimo en términos de cómputo; por otro, sirve como prueba de concepto reproducible de que la edición directa de pesos puede sustituir al fine-tuning clásico en tareas de clasificación acotadas. La advertencia principal es que el modelo es preciso pero está mal calibrado: las probabilidades softmax son planas y no deben interpretarse como confianzas sin un ajuste de temperatura previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BertForSequenceClassification) |
| Parametros totales | 109.488.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base bert-base-uncased soporta 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no verificada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Etiquetas | 8 clases de clausulas de seguros |
| Parametros modificados | 6,474 % (18 tensores) |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-base estándar: 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y aproximadamente 110 millones de parámetros, sobre el que se monta una cabeza de clasificación lineal de 8 salidas. La innovación no está en la arquitectura, sino en el procedimiento de entrenamiento: un LLM editor recibe los pesos y un presupuesto de pasadas hacia delante, y calcula actualizaciones en forma cerrada sobre los tensores seleccionados, sin descenso de gradiente ni optimizadores. El manifiesto `edit_manifest.json` del repositorio registra los hashes SHA-256 de los tensores base y editados.

Las modificaciones se concentran en la capa 11 del encoder (atención, `intermediate.dense`, `output.dense` y las dos LayerNorm asociadas) y en el `pooler.dense`. Los tensores de mayor tamaño editados son `bert.encoder.layer.11.intermediate.dense.weight` y `bert.encoder.layer.11.output.dense.weight`, con 2.359.296 entradas modificadas cada uno, seguidos de los pesos de query, value y attention output, con 589.824 entradas cada uno. La capa `classifier` apenas se toca: solo 8 entradas en `classifier.weight` y ninguna en el sesgo. El autor no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados más allá de la referencia al protocolo del repositorio del proyecto.

## Capacidades

- Clasificación de frases de seguros en inglés en ocho categorías: concesión de cobertura, exclusión, pago de prima, límites y franquicias, procedimiento de siniestros, definiciones, cancelación o renovación de plazo y condiciones y deberes.
- Salida de etiqueta única por frase mediante `argmax` sobre los logits.
- Integración directa con la pipeline `text-classification` de Hugging Face Transformers.
- Inferencia en CPU y GPU sin requisitos especiales, al tratarse de un BERT-base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo *thinking*.
- No dispone de capacidades multimodales (visión, audio) ni de generación de texto libre.
- Capacidad multilingüe limitada al inglés, idioma del modelo base y del corpus de edición.

## Casos de uso

- Clasificación de cláusulas en pólizas: procesar párrafos de contratos de seguros en inglés y etiquetarlos automáticamente como cobertura, exclusión o definición, lo que permite construir índices estructurados del articulado para búsqueda y auditoría.
- Enrutamiento de consultas en atención al cliente: clasificar los mensajes entrantes de asegurados según la categoría de la cláusula afectada y derivarlos al equipo de siniestros, suscripción o atención contractual correspondiente.
- Extracción de exclusiones para revisión de riesgos: filtrar automáticamente las frases etiquetadas como `exclusion` en un lote de pólizas para que un analista las revise antes de la suscripción.
- Control de calidad documental: detectar secciones de una póliza que carecen de cláusulas de procedimiento de siniestros o de condiciones y deberes, comparando la distribución de etiquetas frente a una plantilla de referencia.
- Preetiquetado para anotación humana: usar el modelo como primer paso de un flujo de etiquetado supervisado, reduciendo el coste de anotación manual en corpus de seguros, con revisión humana posterior dado el riesgo de error en clases poco representadas.
- Prototipado de investigación en edición de pesos: servir como caso de referencia reproducible para estudiar la viabilidad de la programación en espacio de pesos frente al fine-tuning clásico en tareas de clasificación acotadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test retenido | 97,30 % |
| Macro-F1 en test retenido | 0,9734 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni desglose por clase de la precisión o el recall.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para los pesos, más overhead de activaciones y del runtime; en la práctica menos de 2 GB en total.
- VRAM estimada en fp16: aproximadamente 0,22 GB para los pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Funciona en CPU con latencias del orden de milisegundos por frase para lotes pequeños, adecuado para despliegues de bajo volumen.
- Opciones de despliegue: pipeline de Transformers, TorchServe, Triton Inference Server, ONNX Runtime o cualquier servidor compatible con modelos de clasificación de Hugging Face. vLLM y llama.cpp no están orientados a este tipo de modelo.
- Throughput y latencia concretos no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wsp-bert-insurance-v0-p50 | 109,5 M | no disponible (base: 512 tokens) | Clasificacion de clausulas de seguros (8 clases) | apache-2.0 | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base de propósito general | apache-2.0 | Hugging Face |
| Un BERT-base ajustado con fine-tuning supervisado sobre el mismo corpus | 110 M | 512 tokens | Clasificacion de clausulas de seguros | depende del corpus | no disponible como artefacto público |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento entre este modelo y un fine-tuning convencional sobre el mismo conjunto de datos.

## Limitaciones y advertencias

- Modelo no calibrado: las probabilidades softmax son planas y la etiqueta ganadora suele puntuar alrededor de 0,2 en lugar de 0,9 o más. Debe usarse el `argmax` como etiqueta y ajustar una temperatura sobre datos retenidos propios antes de interpretar las puntuaciones como confianzas.
- Entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Dominio muy restringido a cláusulas de seguros; el rendimiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación de etiquetas en frases ambiguas o que combinan varias categorías, dado que el modelo fuerza una única clase entre las ocho.
- No se documenta la composición del dataset de edición ni posibles sesgos presentes en el corpus utilizado, por lo que no es posible evaluar sesgos sistemáticos por tipo de póliza, aseguradora o jurisdicción.
- El autor describe el modelo como una prueba de concepto y remite al README del proyecto para valorar qué haría falta para usarlo en producción; no se declara validación externa independiente.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de calibración y de evaluación externa desaconseja su despliegue directo en decisiones automatizadas sin revisión humana.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sidman007/wsp-bert-insurance-v0-p50
- Repositorio del proyecto (código, protocolo y logs): https://github.com/siddharth-ghatti/weight-space-programming-poc
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
