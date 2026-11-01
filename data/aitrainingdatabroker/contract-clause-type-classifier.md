# aitrainingdatabroker/contract-clause-type-classifier

## Resumen

Contract Clause Type Classifier es un modelo de clasificación de texto desarrollado por AI Training Data Broker, un intermediario y asesor técnico especializado en la venta y licencia de datos para laboratorios de IA. El modelo recibe una cláusula de licencia de datos y la asigna a una de ocho categorías: exclusividad, plazo y renovación, pago, confidencialidad, propiedad intelectual y titularidad, indemnización, auditoría y borrado, o terminación. Su propósito es facilitar la revisión de contratos de licencia de datos agrupando automáticamente las cláusulas por tipo, de modo que un revisor humano pueda comparar, por ejemplo, todas las cláusulas de indemnización entre distintas ofertas.

Técnicamente es un fine-tuning de `distilroberta-base`, un transformer encoder de 82.124.552 parámetros (unos 82 millones), orientado exclusivamente a clasificación de texto en inglés. El modelo se entrenó durante 6 épocas en una única RTX 3070 sobre un conjunto sintético de 376 filas, y se evaluó sobre 186 filas reservadas generadas a partir de plantillas no vistas durante el entrenamiento. La ventana de contexto no está documentada de forma explícita en la información disponible; al derivar de RoBERTa, su límite posicional habitual es de 512 tokens, aunque el autor no lo confirma en la model card.

La relevancia del modelo es acotada y muy específica: no compite en capacidades generales, sino que cubre una tarea de nicho dentro del flujo de trabajo de licenciamiento de datos para IA. Su valor principal es práctico (etiquetado rápido de cláusulas) y su limitación principal es la naturaleza sintética y plantillada de los datos de entrenamiento, que hace que su rendimiento en texto contractual real sea incierto. La licencia Apache 2.0 y su reducido tamaño lo hacen fácil de desplegar y de adaptar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, `distilroberta-base`) para clasificación de secuencias |
| Parametros totales | 82.124.552 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; por herencia de RoBERTa, límite posicional habitual de 512 tokens (no confirmado por el autor) |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos safetensors en precisión completa) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Etiquetas de salida | 8 clases: `audit_and_deletion`, `confidentiality`, `exclusivity`, `indemnity`, `ip_and_ownership`, `payment`, `term_and_renewal`, `termination` |
| Tamaño del repositorio | 0,3 GB |
| Pipeline | `text-classification` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilroberta-base`, una versión destilada de RoBERTa con 6 capas y aproximadamente 82 millones de parámetros, configurada como cabeza de clasificación de secuencias. Se trata, por tanto, de un encoder bidireccional clásico, no de un modelo generativo ni de una arquitectura MoE o híbrida. La salida es una distribución de probabilidad sobre ocho clases de cláusula contractual, y la API recomendada es el pipeline `text-classification` de `transformers` con `top_k` para obtener las tres etiquetas más probables.

El entrenamiento se realizó durante 6 épocas sobre una única GPU RTX 3070, partiendo de 376 filas del dataset `aitrainingdatabroker/synthetic-contract-clauses-by-type-and-risk`. Todos los datos son sintéticos: nombres, números y frases fueron inventados, y las filas de test se construyeron a partir de plantillas que el modelo no vio durante el entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un clasificador de este tipo. Los scripts de generación de datos y de entrenamiento están incluidos en el directorio `source/` del repositorio, y las métricas completas en `scores.json`.

## Capacidades

- Clasificación de cláusulas de licencia de datos en una de ocho categorías predefinidas.
- Salida con probabilidades por clase, lo que permite obtener las tres etiquetas más probables mediante `top_k=3`.
- Etiquetado orientado a revisión contractual: agrupación de cláusulas por tipo para comparación entre ofertas.
- Funcionamiento en inglés exclusivamente.
- Ejecución ligera: 82 millones de parámetros permiten inferencia en CPU y en GPU de consumo.
- Integración directa con el ecosistema `transformers` y con Text Embeddings Inference / endpoints compatibles (según los tags del repositorio).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. Es un clasificador, no un modelo generativo.

## Casos de uso

- Revisión de licencias de datos: dada una cláusula extraída de un contrato de licencia, el modelo la etiqueta como pago, confidencialidad, indemnización, etc., y el revisor humano puede agrupar y comparar cláusulas del mismo tipo entre varios proveedores.
- Construcción de un índice de cláusulas: procesar por lotes un corpus de contratos, clasificar cada cláusula y generar un índice navegable por tipo, útil para equipos legales que gestionan muchos acuerdos de datos.
- Detección de cláusulas de riesgo en pipelines de compliance: filtrar automáticamente las cláusulas de indemnización, auditoría y borrado o terminación para que un abogado las revise primero, reduciendo el volumen de lectura manual.
- Preetiquetado para anotación humana: usar las predicciones como borrador que un anotador corrige, acelerando la creación de datasets etiquetados de cláusulas contractuales reales.
- Prototipado rápido en herramientas internas: al ser un modelo de 82 millones de parámetros con licencia Apache 2.0, se puede integrar en una API o en un Space de Hugging Face sin infraestructura GPU dedicada.
- Filtrado previo en la venta de datos: un bróker o proveedor de datos puede clasificar las cláusulas de sus propios acuerdos antes de compartirlos con compradores, verificando que las cláusulas clave están presentes y correctamente tipificadas.
- Evaluación comparativa de ofertas: clasificar las cláusulas de varias propuestas de licencia y contrastar, por ejemplo, todas las cláusulas de pago o de plazo y renovación en una tabla comparativa.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 186 filas reservadas (accuracy 0,726; macro F1 0,711):

| Etiqueta | F1 | Muestras |
|---|---|---|
| `audit_and_deletion` | 0,533 | 24 |
| `confidentiality` | 1,0 | 22 |
| `exclusivity` | 0,683 | 23 |
| `indemnity` | 0,96 | 24 |
| `ip_and_ownership` | 0,9 | 22 |
| `payment` | 0,657 | 24 |
| `term_and_renewal` | 0,957 | 24 |
| `termination` | 0,0 | 23 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, algo esperable dado que el modelo no es generativo. La comparación con modelos similares no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (82 millones de parámetros, ~0,33 GB de pesos); en FP16 aproximadamente 0,17 GB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no requiere GPU dedicada; una RTX 3070 fue suficiente para el entrenamiento. Para inferencia, cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 2060, RTX 4090, A100, H100) funciona sin problema.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas, e incluso en CPU con latencias aceptables para clasificación por lotes.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference`), endpoints compatibles de Hugging Face, y servidores de inferencia estándar para modelos encoder. No se documentan opciones GGUF ni llama.cpp en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU para lotes pequeños, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de clasificación de cláusulas contractuales con métricas publicadas que permitan una comparación rigurosa. Como referencia estructural, el modelo se apoya en `distilroberta-base` (82 millones de parámetros, licencia MIT/Apache según la versión, inglés), del que hereda arquitectura y límite de contexto; cualquier fine-tuning de `distilroberta-base` o `roberta-base` para clasificación de texto sería un punto de partida comparable, pero no se dispone de datos de rendimiento de alternativas específicas para esta tarea.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| contract-clause-type-classifier | 82,1 M | No disponible (heredado de RoBERTa) | Clasificación de cláusulas en 8 tipos | Apache 2.0 | Hugging Face |
| `distilroberta-base` (base) | 82,1 M | 512 tokens (habitual en RoBERTa) | Modelo base de lenguaje enmascarado | Apache 2.0 (según versión) | Hugging Face |
| Alternativas específicas de clasificación de cláusulas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado únicamente con texto sintético generado a partir de plantillas; el texto contractual real varía mucho más y el rendimiento en producción puede degradarse respecto a las métricas de test.
- Las cláusulas reales son más largas y mezclan varios temas; el modelo asigna una sola etiqueta por cláusula, por lo que las cláusulas compuestas se clasifican de forma incompleta o ambigua.
- El F1 de la clase `termination` es 0,0 en el conjunto de test, y el de `audit_and_deletion` es 0,533: estas dos categorías no son fiables y requieren revisión humana obligatoria.
- Solo admite inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación no aplicable en sentido generativo (no produce texto libre), pero sí riesgo de clasificación errónea con alta confianza en dominios distintos al sintético.
- No es asesoramiento legal ni certificación; el autor indica explícitamente que una persona debe revisar la salida antes de compartirla o tomar decisiones, y que el criterio legal corresponde al abogado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor solicita atribución a AI Training Data Broker y enlace a https://aitrainingdatabroker.com/ al compartir o construir sobre el modelo.
- Con solo 22 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso en producción ni validación independiente.
- No se documentan sesgos específicos más allá de la naturaleza sintética de los datos; al ser un modelo entrenado con plantillas, puede reproducir los patrones y vocabulario de esas plantillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitrainingdatabroker/contract-clause-type-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/aitrainingdatabroker/synthetic-contract-clauses-by-type-and-risk
- Space relacionado (contract-clause-watchlist): https://huggingface.co/spaces/aitrainingdatabroker/contract-clause-watchlist
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Cómo se paga al licenciar datos: https://aitrainingdatabroker.com/sell/how-you-get-paid/
- Glosario de términos de licenciamiento de datos: https://aitrainingdatabroker.com/glossary/
- Responsabilidad al licenciar datos para IA: https://aitrainingdatabroker.com/sell/liability/
- Sitio del autor: https://aitrainingdatabroker.com/
