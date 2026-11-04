# sidman007/wsp-bert-insurance-v1-p10

## Resumen

`wsp-bert-insurance-v1-p10` es un clasificador de frases del dominio de seguros construido sobre `bert-base-uncased` y publicado por el usuario `sidman007` en HuggingFace. El modelo resuelve una tarea de clasificación de texto multietiqueta (8 categorías) sobre oraciones del ámbito asegurador: concesión de cobertura, exclusión, pago de prima, límites y franquicias, procedimiento de siniestros, definiciones, cancelación/renovación de término y condiciones y obligaciones. Con 109.488.392 parámetros y un repositorio de 0,4 GB, se trata de un fine-tuning de un transformer encoder de tamaño base.

La particularidad del modelo no es su arquitectura, sino el método de construcción: según la model card, los pesos no se obtuvieron mediante descenso de gradiente ni optimizadores, sino mediante *weight-space programming*. Un LLM editor leyó y escribió directamente los tensores del modelo aplicando matemática en forma cerrada sobre pesos y activaciones, obtenidas a partir de un número acotado de pasadas hacia delante. El autor declara que se modificaron 144 tensores, lo que supone un 5,023 % de los parámetros.

Es relevante ahora como ejemplo práctico de una técnica emergente de edición de pesos que evita el entrenamiento supervisado convencional. No obstante, el modelo cuenta con 0 descargas y 0 likes en el momento de la consulta, no publica resultados de benchmarks y su model card es notablemente escueta, por lo que debe tratarse como un artefacto experimental más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, `BertForSequenceClassification`) |
| Parametros totales | 109.488.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base `bert-base-uncased` admite 512 tokens; no confirmado por el autor para este fine-tuning) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es `bert-base-uncased`, un transformer encoder de 12 capas con atención bidireccional, hidden size de 768 y 12 cabezas de atención, adaptado a clasificación de secuencias con una cabeza de 8 etiquetas. El modelo no emplea decodificación autoregresiva ni mecanismos de atención lineal: es un encoder estándar que produce una representación contextual de la secuencia de entrada y una distribución sobre las 8 clases.

El entrenamiento no siguió el protocolo habitual. Según la model card, un LLM editor modificó directamente los pesos del modelo aplicando matemática en forma cerrada sobre los tensores y sobre las activaciones recogidas en un número presupuestado de pasadas hacia delante, sin retropropagación ni optimizadores. Se declaran 144 tensores editados (5,023 % de los parámetros), concentrados en las capas 0 a 4, 10 y 11, con especial incidencia en la capa 11 (donde se modifican pesos de query, value, output dense y LayerNorm) y en las capas intermedias de la primera mitad del encoder. No se especifican el volumen de datos de entrenamiento, la composición del corpus ni si hubo RLHF o DPO; tampoco se detalla el protocolo exacto de edición más allá de la referencia al README del proyecto, que no se incluye en la información disponible.

## Capacidades

- Clasificación de oraciones del dominio de seguros en 8 etiquetas: `coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal` y `conditions_duties`.
- Procesamiento de texto en inglés exclusivamente.
- Salida de logits por clase mediante la cabeza de clasificación de `BertForSequenceClassification`, apta para umbralización o `argmax` en pipelines de `text-classification`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de razonamiento explícito (*thinking mode*).
- No se documenta capacidad de generación de texto libre: es un modelo discriminativo, no generativo.

## Casos de uso

- **Etiquetado automático de cláusulas en pólizas**: el modelo puede clasificar oraciones extraídas de condiciones generales y particulares en las 8 categorías definidas, lo que permite segmentar documentos contractuales largos y construir índices navegables por tipo de cláusula.
- **Triaje de consultas en atención al cliente aseguradora**: dado un mensaje entrante, clasificarlo como consulta sobre prima, franquicia, procedimiento de siniestro o cancelación permite enrutarlo al equipo o flujo adecuado sin intervención manual.
- **Detección de exclusiones en revisión de contratos**: la etiqueta `exclusion` facilita la localización sistemática de cláusulas restrictivas durante procesos de auditoría o comparación de productos.
- **Extracción estructurada de definiciones**: la etiqueta `definitions` permite aislar el glosario de términos de una póliza para alimentar bases de conocimiento o sistemas de búsqueda interna.
- **Enriquecimiento de bases de datos documentales**: clasificar a nivel de oración corpus históricos de seguros para habilitar búsquedas filtradas por tipo de cláusula y análisis de cobertura por producto.
- **Preprocesado para pipelines RAG**: usar las etiquetas como metadatos en la indexación de fragmentos documentales, de modo que las consultas puedan restringirse a las secciones relevantes (por ejemplo, solo `claims_procedure`).
- **Control de calidad de plantillas**: comparar la distribución de etiquetas entre versiones de un mismo contrato para detectar cambios no deseados en la redacción de coberturas o exclusiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP32, aproximadamente 0,44 GB de pesos (109,5 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en FP16, alrededor de 0,22 GB. Cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: no requiere GPU dedicada; una NVIDIA RTX 3060, RTX 4090, T4 o incluso CPU moderna son suficientes para inferencia por lotes de este tamaño.
- **Cabe en consumer GPU**: sí, en cualquier GPU con al menos 2 GB de VRAM; también en CPU para volúmenes moderados.
- **Opciones de despliegue**: `transformers` con `pipeline("text-classification")`, `Text Classification Inference` de HuggingFace, exportación a ONNX Runtime, y servidores de inferencia ligeros. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama ni TGI (estas herramientas están orientadas a modelos generativos y no aplican directamente a este encoder).
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU (cientos a miles de oraciones por segundo en lotes), pero se trata de una estimación general para BERT base, no de un dato medido por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sidman007/wsp-bert-insurance-v1-p10` | 109,5 M | no disponible | Clasificación de frases de seguros (8 etiquetas) | apache-2.0 | HuggingFace, 0 descargas |
| `google-bert/bert-base-uncased` (modelo base) | 110 M | 512 tokens | Representación general / MLM | apache-2.0 | HuggingFace, ampliamente usado |
| `ProsusAI/finbert` | ~110 M | 512 tokens | Análisis de sentimiento financiero | no disponible en la información | HuggingFace, popular en finanzas |
| `nlpaueb/legal-bert-base-uncased` | ~110 M | 512 tokens | Dominio legal (clasificación, QA) | no disponible en la información | HuggingFace |

La comparación directa con alternativas del mismo dominio de seguros no está disponible en la información proporcionada. Los modelos citados comparten arquitectura y escala, pero cubren dominios distintos (finanzas, legal) o son el checkpoint base sin fine-tuning.

## Limitaciones y advertencias

- **Sin benchmarks publicados**: no hay métricas de precisión, F1 ni evaluación por clase, lo que impide validar la calidad del clasificador antes de usarlo.
- **Cero adopción verificable**: 0 descargas y 0 likes en HuggingFace; no hay evidencia de uso en producción ni de validación independiente.
- **Model card mínima**: no se documentan datos de entrenamiento, composición del corpus, hiperparámetros, ni el protocolo completo de edición de pesos; el README del proyecto referenciado no está incluido en la información disponible.
- **Riesgo de alucinación y clasificación errónea**: en un modelo discriminativo, el riesgo se traduce en asignaciones de etiqueta incorrectas, especialmente en oraciones ambiguas o que combinan varias categorías (por ejemplo, una cláusula que define una exclusión y a la vez establece condiciones).
- **Sesgos**: no documentados por el autor; al derivar de `bert-base-uncased` y de un corpus de seguros no especificado, puede heredar sesgos del dominio y del corpus de edición.
- **Idioma**: solo inglés; no apto para textos en castellano sin un fine-tuning adicional.
- **Longitud de contexto**: no confirmada por el autor; el límite heredado de BERT base es de 512 tokens, insuficiente para cláusulas muy largas sin segmentación previa.
- **Licencia**: apache-2.0 permite uso comercial, pero el modelo base `bert-base-uncased` también es apache-2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene verificar la procedencia del corpus de edición.
- **Naturaleza experimental**: el método de edición de pesos sin gradiente no está estandarizado ni validado de forma amplia; los resultados pueden no ser reproducibles y el comportamiento del modelo puede degradarse fuera de la distribución de oraciones con la que fue editado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sidman007/wsp-bert-insurance-v1-p10
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- README del proyecto referenciado en la model card: no disponible en la información proporcionada
- Paper o blog del método *weight-space programming*: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
