# atekrugis/berturk-kvkk-pii-shield-apache

## Resumen

berturk-kvkk-pii-shield-apache es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos en turco. Lo desarrolla el usuario atekrugis y se construye mediante fine-tuning del checkpoint dbmdz/bert-base-turkish-cased, un BERT base en turco con 110.045.977 parámetros. Su propósito es servir como capa de anonimización y cumplimiento normativo en aplicaciones que procesan datos personales bajo la legislación turca de protección de datos (KVKK), equivalente funcional al RGPD europeo.

El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial, y está disponible en formatos safetensors y ONNX, además de ser compatible con endpoints de Hugging Face. Está entrenado sobre cuatro datasets turcos de PII y privacidad, e incorpora la etiqueta `pii` junto con `kvkk` en su tarjeta, lo que indica que está orientado a la detección de categorías de datos personales relevantes para esa normativa.

Su relevancia actual radica en la escasez de modelos especializados en PII para turco: la mayoría de soluciones de redacción se centran en inglés y otras lenguas mayoritarias. Este modelo cubre ese hueco con una arquitectura BERT ligera (110M parámetros) que puede desplegarse en CPU o en GPUs de consumo, y con un acceso restringido (gated) que exige aceptar condiciones en Hugging Face antes de su descarga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder, token classification) |
| Parámetros totales | 110.045.977 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT base, típicamente 512 tokens; no confirmado en la información proporcionada) |
| Tipos de cuantización | no disponible (se menciona base_model:quantized en los tags, sin detallar tipos) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un BERT base en turco (dbmdz/bert-base-turkish-cased) adaptado mediante fine-tuning a una tarea de token classification con etiquetas de PII. La arquitectura es un transformer encoder bidireccional con 110 millones de parámetros, adecuado para tareas de etiquetado secuencial como NER, y no incorpora mecanismos MoE, SSM ni atención lineal. El checkpoint base está entrenado con texto en turco con distinción de mayúsculas y minúsculas (cased).

El fine-tuning se realizó sobre cuatro datasets de privacidad y PII en turco: BTX24/turkish-privacy-pii-ner, neondijital/neonredact-tr, negentropi/belgin-pii-dataset y yusuf-said/turkish-privacy-filter-dataset. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a token classification). Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal, que no corresponden a este tipo de modelo.

## Capacidades

- Detección de información personal identificable (PII) en texto en turco mediante etiquetado a nivel de token.
- Clasificación de entidades orientada a cumplimiento de KVKK (ley turca de protección de datos).
- Soporte de inferencia en formato ONNX, lo que facilita el despliegue en entornos optimizados.
- Compatible con la librería transformers y con endpoints de Hugging Face.
- Capacidad multilingüe: limitada al turco (tr); no se declaran otros idiomas.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta generación de texto: es un modelo discriminativo de etiquetado, no generativo.

## Casos de uso

- Anonimización de documentos legales en turco: el modelo etiqueta nombres, identificadores y datos personales en contratos y expedientes, permitiendo sustituirlos antes de archivarlos o compartirlos, en línea con las obligaciones de KVKK.
- Redacción de PII en registros de atención al cliente: se integra en pipelines que procesan transcripciones o correos en turco para eliminar datos personales antes de almacenarlos o enviarlos a sistemas de analítica.
- Cumplimiento normativo en plataformas SaaS turcas: actúa como capa de filtrado previa al envío de datos a servicios externos o a modelos de terceros, reduciendo el riesgo de transferencia no autorizada de datos personales.
- Preprocesamiento de datasets para investigación: permite limpiar corpus en turco de información personal antes de publicarlos o de entrenar otros modelos, evitando fugas de privacidad.
- Enmascarado en logs y sistemas de observabilidad: se aplica sobre trazas y mensajes de aplicación en turco para ocultar identificadores antes de su retención o visualización por equipos de soporte.
- Moderación y auditoría interna de contenidos: detección de PII en comunicaciones internas para alertar sobre exposiciones accidentales de datos sensibles.
- Despliegue en entornos con recursos limitados: al ser un BERT base de 110M parámetros, puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace viable para filtrado en tiempo real en infraestructuras modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 110M parámetros; en torno a 0,25 GB en fp16 y menos de 0,2 GB en cuantización de 8 bits (estimaciones según el tamaño del modelo, no confirmadas en la información proporcionada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo y funcionarán sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers, ONNX Runtime (formato ONNX incluido), y potencialmente servidores de inferencia compatibles con ONNX; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que no son adecuados para token classification.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| berturk-kvkk-pii-shield-apache | 110.045.977 | no disponible | turco | Apache 2.0 | gated en Hugging Face |
| dbmdz/bert-base-turkish-cased | no disponible | no disponible | turco | no disponible | público en Hugging Face |
| Modelos genéricos de PII en inglés (p. ej. basados en BERT) | variable | variable | inglés | variable | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, idioma y licencia; no se conocen alternativas especializadas en PII para turco con las que contrastar resultados.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga, lo que puede complicar la automatización de pipelines.
- Especializado exclusivamente en turco; no debe usarse con textos en otros idiomas sin validación previa.
- Modelo discriminativo de etiquetado: no genera texto ni razona; su uso está limitado a clasificación de tokens.
- No se documentan métricas de precisión, recall ni F1, por lo que el rendimiento real en producción es desconocido y debe validarse con datos propios.
- Riesgo de falsos negativos y falsos positivos inherente a los modelos NER: puede dejar pasar PII no vista en entrenamiento o marcar entidades inocuas.
- Posibles sesgos derivados de los datasets de entrenamiento (cuatro corpus turcos concretos), cuya composición y cobertura no se detallan.
- La longitud de contexto no está confirmada; si se hereda la de BERT base, se limita a 512 tokens, insuficiente para documentos largos sin fragmentación.
- Aunque la licencia es Apache 2.0, el acceso gated puede imponer condiciones adicionales de uso que deben revisarse antes de un despliegue comercial.
- No se documentan medidas de robustez frente a adversarial examples ni frente a texto ofuscado.

## Enlaces

- Hugging Face: https://huggingface.co/atekrugis/berturk-kvkk-pii-shield-apache
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset BTX24/turkish-privacy-pii-ner: https://huggingface.co/datasets/BTX24/turkish-privacy-pii-ner
- Dataset neondijital/neonredact-tr: https://huggingface.co/datasets/neondijital/neonredact-tr
- Dataset negentropi/belgin-pii-dataset: https://huggingface.co/datasets/negentropi/belgin-pii-dataset
- Dataset yusuf-said/turkish-privacy-filter-dataset: https://huggingface.co/datasets/yusuf-said/turkish-privacy-filter-dataset
