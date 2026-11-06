# sidman007/wsp-bert-insurance-v0-p00

## Resumen

`wsp-bert-insurance-v0-p00` es un clasificador de frases del dominio de seguros construido sobre `bert-base-uncased` mediante una técnica denominada *weight-space programming* (WSP). El autor, `sidman007`, ha transformado un `BertForSequenceClassification` genérico en un clasificador de 8 etiquetas específicas del sector asegurador sin recurrir a descenso de gradiente: un LLM editor ha leído y reescrito directamente los pesos del modelo aplicando matemática en forma cerrada sobre los pesos y sobre las activaciones obtenidas en un número acotado de pasadas forward. No hay retropropagación ni optimizadores implicados.

El modelo conserva la arquitectura BERT base intacta (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) y un total de 109.488.392 parámetros. Lo relevante no es su tamaño, sino el método: demuestra que es posible reconfigurar un transformer preentrenado para una tarea de clasificación concreta editando tensores seleccionados, en lugar de reentrenar. Se han modificado 108 tensores, lo que representa el 36,688 % de los parámetros del modelo, concentrados en las capas 0 a 5 y 10 a 11, incluyendo proyecciones de atención, capas densas intermedias y de salida, y LayerNorms.

Las 8 etiquetas cubren categorías típicas de pólizas: `coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal` y `conditions_duties`. El modelo está pensado exclusivamente para inglés y se publica bajo licencia Apache 2.0. Su interés es tanto práctico (clasificación de cláusulas en documentos de seguros) como metodológico (una prueba de concepto de edición de pesos como alternativa al fine-tuning clásico).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), `BertForSequenceClassification` |
| Parametros totales | 109.488.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de `bert-base-uncased`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Tensores editados | 108 (36,688 % de los parámetros) |
| Etiquetas de salida | 8 (coverage_grant, exclusion, premium_payment, deductible_limits, claims_procedure, definitions, term_cancellation_renewal, conditions_duties) |
| Pipeline | text-classification |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estándar: 12 capas de encoder, 768 dimensiones ocultas, 12 cabezas de atención, con una cabeza de clasificación de 8 clases añadida sobre el token `[CLS]`. No hay innovaciones estructurales respecto a `bert-base-uncased`; la novedad reside íntegramente en el proceso de adaptación.

El método de entrenamiento es *weight-space programming*: un LLM editor examina los pesos del modelo base y las activaciones producidas en un número presupuestado de pasadas forward, y calcula en forma cerrada las modificaciones a aplicar directamente sobre los tensores. No se usa retropropagación, ni optimizadores, ni épocas de entrenamiento convencionales. Los tensores modificados se concentran en las capas 0 a 5 y 10 a 11, e incluyen proyecciones `query`, `key` y `value` de la atención (solo en la capa 1), las proyecciones `dense` de salida de atención, las capas `intermediate.dense` y `output.dense`, y los `LayerNorm` asociados. Las capas 6 a 9 no aparecen en la lista de tensores editados. La información disponible no detalla el volumen de datos utilizado, la composición del corpus de seguros ni si se aplicaron técnicas de alineación adicionales.

## Capacidades

- Clasificación de frases en inglés en 8 categorías del dominio de seguros: concesión de cobertura, exclusión, pago de prima, límites y franquicias, procedimiento de siniestros, definiciones, cancelación/renovación de término y condiciones y obligaciones.
- Salida de logits por etiqueta para una única frase de entrada (clasificación multiclase, no multietiqueta documentada).
- Procesamiento de secuencias de hasta 512 tokens, suficiente para cláusulas y párrafos de pólizas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al inglés; no se documenta transferencia a otros idiomas.

## Casos de uso

- Clasificación de cláusulas en pólizas: dado un párrafo extraído de una póliza en inglés, el modelo asigna una de las 8 etiquetas para su indexación y enrutamiento posterior en un sistema documental.
- Triaje de siniestros: clasificar correos o formularios de asegurados como `claims_procedure` frente a `coverage_grant` o `exclusion` para dirigirlos al equipo adecuado.
- Extracción estructurada de condiciones: preetiquetar secciones de contratos para alimentar pipelines de extracción de información (NER, reglas) que necesitan saber de qué tipo de cláusula se trata.
- Control de calidad documental: detectar si un contrato contiene las secciones obligatorias (`definitions`, `conditions_duties`, `term_cancellation_renewal`) mediante clasificación por bloques.
- Enrutamiento en atención al cliente: clasificar mensajes entrantes de asegurados según la temática (primas, franquicias, cancelaciones) para asignarlos a colas especializadas.
- Análisis de carteras: agregar la distribución de tipos de cláusula en un conjunto de pólizas para auditar coberturas y exclusiones de forma automatizada.
- Investigación metodológica: servir como referencia reproducible para estudiar weight-space programming frente a fine-tuning clásico en tareas de clasificación de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para los pesos (109,5 M de parámetros × 4 bytes) más overhead de activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16: unos 0,22 GB de pesos, con margen amplio para batch grande.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada para este modelo; también funciona en CPU con latencia aceptable para clasificación por frases.
- Cabe holgadamente en GPUs consumer e incluso en entornos con poca memoria.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `TextClassificationPipeline`; exportación a ONNX Runtime para inferencia en CPU; `optimum` para aceleración. No se documenta compatibilidad con vLLM o TGI (no aplica a un encoder de clasificación).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wsp-bert-insurance-v0-p00 | 109,5 M | 512 | Clasificación 8 clases de seguros (en) | Apache 2.0 | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 | Modelo base generalista (en) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66 M | 512 | Modelo base destilado (en) | Apache 2.0 | Hugging Face |
| roberta-base | 125 M | 512 | Modelo base generalista (en) | MIT | Hugging Face |

La comparación relevante es frente a `bert-base-uncased` sin adaptar: este modelo parte de él y sustituye el fine-tuning por edición de pesos. Frente a `distilbert-base-uncased` ofrece mayor capacidad pero el doble de parámetros. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente para inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- El método de weight-space programming no ha sido validado con benchmarks públicos en la información disponible; el rendimiento real en producción es incierto.
- Riesgo de alucinación de etiquetas: al no haber sido entrenado con descenso de gradiente sobre un corpus supervisado convencional, la calibración de las probabilidades de salida no está documentada.
- Sesgos heredados de `bert-base-uncased`, incluyendo sesgos de género, raza y dominio presentes en el corpus original de preentrenamiento.
- Dominio muy restringido: las 8 etiquetas cubren un subconjunto concreto del sector asegurador; entradas fuera de ese dominio pueden recibir asignaciones espurias.
- Longitud máxima de 512 tokens: cláusulas largas deben fragmentarse.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre idoneidad para producción ni sobre el proceso de edición de pesos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta el protocolo completo de evaluación ni el conjunto de datos utilizado para la edición, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/sidman007/wsp-bert-insurance-v0-p00
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
