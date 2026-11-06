# sidman007/wsp-bert-insurance-v0-p25

## Resumen

`wsp-bert-insurance-v0-p25` es un clasificador de frases del dominio de seguros construido sobre `bert-base-uncased` mediante una técnica experimental denominada weight-space programming (WSP). En lugar de ajustar los pesos con retropropagación y descenso de gradiente, un LLM editor leyó y reescribió directamente los tensores del modelo aplicando matemática en forma cerrada sobre los pesos y sobre las activaciones obtenidas de un número presupuestado de pasadas hacia delante. El autor es `sidman007` (repositorio de código en la cuenta `siddharth-ghatti`).

El modelo resuelve una tarea concreta: clasificar oraciones de pólizas y documentación de seguros en ocho etiquetas (`coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal`, `conditions_duties`). Su interés no reside tanto en la tarea como en el método: demuestra que es posible dotar a un transformer preentrenado de una nueva cabeza de clasificación funcional editando únicamente el último bloque del encoder y el pooler, sin optimizadores ni epochs de entrenamiento.

La arquitectura es un transformer encoder BERT-base estándar de 12 capas con 109.488.392 parámetros totales, contexto de 512 tokens y vocabulario en inglés. La edición afecta al 6,474 % de los parámetros (18 tensores, casi todos de la capa 11 y del pooler). El autor reporta una accuracy del 98,43 % y un macro-F1 de 0,9845 en el conjunto de test reservado, aunque advierte explícitamente de que las probabilidades softmax están descalibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion |
| Parametros totales | 109.488.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-uncased) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp32; no se documentan variantes GGUF, ONNX ni int8) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 0,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased` y le superpone una cabeza `BertForSequenceClassification` con 8 etiquetas. No hay entrenamiento en el sentido convencional: no se ejecuta retropropagación, no hay optimizador ni tasa de aprendizaje, y no se define un número de epochs. El procedimiento, descrito como weight-space programming, consiste en que un LLM editor inspecciona los pesos y las activaciones (obtenidas con un presupuesto limitado de forward passes) y calcula en forma cerrada las modificaciones a aplicar sobre los tensores.

Los tensores editados son 18 y representan el 6,474 % de los parámetros. La mayor parte de la intervención se concentra en la capa 11 del encoder: `attention.self.query` (589.824 entradas), `attention.self.value` (589.824), `attention.output.dense` (589.824), `intermediate.dense` (2.359.296) y `output.dense` (2.359.296), junto con sus sesgos y las dos LayerNorm asociadas. También se modifican los pesos y el sesgo del pooler (`bert.pooler.dense`, 589.824 entradas) y 8 entradas del `classifier.weight`, mientras que `classifier.bias` no cambia. El repositorio incluye un `edit_manifest.json` con los hashes SHA-256 de los tensores base y editados, lo que permite verificar la procedencia de la modificación.

La innovación técnica destacable no es arquitectónica sino metodológica: la edición selectiva de la última capa y del pooler basta para redirigir la representación hacia una nueva tarea de clasificación sin tocar las diez primeras capas. El propio autor documenta un artefacto derivado de cómo el editor cableó las capas finales: los logits quedan en una escala que produce distribuciones planas, de modo que multiplicar los logits por cualquier constante no altera la predicción argmax pero sí la confianza aparente.

## Capacidades

- Clasificación de texto en 8 etiquetas del dominio asegurador: concesión de cobertura, exclusión, pago de prima, límites y deducibles, procedimiento de siniestros, definiciones, cancelación/renovación de término y condiciones y deberes.
- Clasificación de frase única (sentence classification), no de pares ni de tokens; la salida es una etiqueta por secuencia.
- Inferencia en inglés exclusivamente; no se documenta soporte multilingüe.
- Integración directa con `transformers.pipeline("text-classification")`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento extendido.
- No dispone de capacidades de visión, audio ni generación de texto libre.
- No se documenta calibración de probabilidades; la salida utilizable es el argmax.

## Casos de uso

- Etiquetado de cláusulas en corpus de pólizas: procesar documentos de seguros divididos en oraciones y asignar a cada una su categoría (cobertura, exclusión, deducible, etc.) para construir índices estructurados y facilitar la búsqueda semántica sobre el clausulado.
- Extracción de obligaciones y deberes del asegurado: aislar las oraciones etiquetadas como `conditions_duties` para alimentar flujos de cumplimiento y revisión legal automatizada.
- Detección de exclusiones en revisión de contratos: marcar automáticamente las cláusulas de exclusión antes de la firma, de modo que un revisor humano se centre solo en los fragmentos de riesgo.
- Enrutamiento de consultas en atención al cliente: clasificar los mensajes entrantes de asegurados según la sección de la póliza a la que se refieren y dirigirlos al equipo o artículo de la base de conocimiento correspondiente.
- Preprocesado para sistemas RAG sobre documentación de seguros: usar la etiqueta como metadato de filtrado antes de la recuperación, mejorando la precisión de las respuestas generadas por un LLM posterior.
- Análisis de carteras y comparación de productos: clasificar masivamente clausulados de distintas aseguradoras para medir la proporción de exclusiones, deducibles y condiciones, y construir comparativas cuantitativas entre productos.
- Validación de calidad documental: detectar secciones faltantes o mal estructuradas en plantillas de pólizas comprobando la distribución de etiquetas esperada por tipo de documento.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor en la model card son los del conjunto de test reservado del propio proyecto:

| Metrica | Valor |
|---|---|
| Accuracy (held-out test) | 98,43 % |
| Macro-F1 (held-out test) | 0,9845 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, HumanEval, GSM8K ni similares) en la información disponible, ni comparaciones numéricas con otros clasificadores de seguros. Tampoco se documenta el tamaño ni la composición del conjunto de test, lo que impide evaluar la significatividad estadística de las cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16 o bf16 los pesos ocupan unos 0,22 GB; en int8, unos 0,11 GB (aunque no se publican pesos cuantizados, la conversión es directa con las herramientas estándar de `transformers`).
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes se recomiendan A100, H100, L4 o RTX 4090. Para inferencia puntual es suficiente una RTX 3060, T4 o incluso CPU.
- Cabe en GPU de consumo: sí, en cualquier modelo con 4 GB o más de VRAM, y en CPU con latencias aceptables para clasificación de frases cortas.
- Opciones de despliegue: `transformers` con `pipeline`, TorchServe, FastAPI + `transformers`, ONNX Runtime tras exportación, o `vLLM`/`TGI` solo si se adapta como tarea de clasificación (no es un modelo generativo).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia arquitectónica, un BERT-base en una T4 procesa del orden de cientos de frases por segundo con lotes moderados, pero no se ha medido para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| `sidman007/wsp-bert-insurance-v0-p25` | 109,5 M | 512 | Clasificacion de 8 etiquetas de seguros | Apache-2.0 | Editado por WSP, sin entrenamiento por gradiente; softmax descalibrado |
| `google-bert/bert-base-uncased` | 110 M | 512 | Modelo base enmascarado | Apache-2.0 | Requiere fine-tuning supervisado para clasificación |
| `ProsusAI/finbert` | ~110 M | 512 | Clasificación de sentimiento financiero (3 clases) | Apache-2.0 | Fine-tuning convencional sobre corpus financiero; no cubre etiquetas de seguros |
| `nlpaueb/legal-bert-base-uncased` | ~110 M | 512 | Dominio legal general | Apache-2.0 | Preentrenado en legislación y contratos; requiere fine-tuning para la tarea concreta |

La comparación relevante no es de rendimiento (no hay datos cruzados) sino de enfoque: frente a los BERT de dominio que exigen un conjunto etiquetado y un ciclo de fine-tuning, este checkpoint se presenta como una alternativa sin entrenamiento supervisado, a costa de una calibración deficiente y de un alcance de etiquetas fijo. No se dispone de comparaciones numéricas con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Probabilidades descalibradas: la etiqueta ganadora suele puntuar en torno a 0,2 en lugar de 0,9 o más. Los scores no deben interpretarse como confidencias; es necesario ajustar una temperatura sobre datos propios antes de usarlos como tal.
- Solo inglés: el vocabulario y el preentrenamiento son de `bert-base-uncased`; no se documenta rendimiento en castellano ni en otros idiomas.
- Dominio y etiquetas cerrados: el modelo solo produce una de las 8 etiquetas definidas; no generaliza a nuevas categorías sin una nueva edición o fine-tuning.
- Sin datos sobre el corpus de edición: no se especifica el volumen, la procedencia ni la composición de las frases usadas para calcular las activaciones, lo que impide evaluar sesgos de dominio o de muestreo.
- Riesgo de alucinación de etiqueta: al ser un clasificador, el fallo se manifiesta como asignación incorrecta con alta aparente seguridad en el argmax; conviene validar con un conjunto propio antes de producción.
- Métricas no auditables: el 98,43 % de accuracy y el 0,9845 de macro-F1 provienen del autor y no se detalla el conjunto de test, por lo que no deben tomarse como garantía externa.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni mantenimiento.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-04), sin evidencia de uso en producción.
- Naturaleza experimental: la técnica WSP está en fase de prueba de concepto; el propio autor remite al README del proyecto para entender qué haría falta para llevarlo a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sidman007/wsp-bert-insurance-v0-p25
- Repositorio del proyecto (código, logs y protocolo): https://github.com/siddharth-ghatti/weight-space-programming-poc
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Manifiesto de edición: `edit_manifest.json` dentro del repositorio de Hugging Face del modelo
