# hur03/checkit-contract-classifier-core-synthetic-v1

## Resumen

CheckIt contract clause classifier core synthetic v1 es un modelo de clasificación de texto multietiqueta especializado en cláusulas de contratos laborales en coreano. Lo desarrolla el usuario hur03 y se construye mediante fine-tuning de `klue/roberta-base`, el checkpoint base de RoBERTa preentrenado para coreano por el consorcio KLUE. El modelo resuelve un problema acotado pero relevante: detectar automáticamente qué tipos de cláusulas contractuales aparecen en un fragmento de contrato de trabajo, devolviendo una o varias etiquetas simultáneas sobre un total de diez categorías.

Arquitectónicamente es un transformer encoder de tipo RoBERTa en su variante coreana, con 110,6 millones de parámetros y una ventana de entrada truncada a 256 tokens. La clasificación es multietiqueta con activación sigmoide y umbrales de decisión por etiqueta definidos en `labels.json`, lo que permite que un mismo fragmento active varias categorías a la vez, algo habitual en texto contractual.

Su interés actual es doble: por un lado, demuestra un flujo de trabajo de fine-tuning con datos sintéticos añadidos a un núcleo limpio de datos reales, con una mejora medible en macro F1 (de 0,762 a 0,829); por otro, es un modelo pequeño y ligero (repo de 0,4 GB) desplegable en infraestructura modesta para tareas de revisión documental en coreano. No obstante, es un modelo de nicho, con cero descargas y sin licencia declarada, lo que limita su adopción en producción sin aclaraciones previas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (KLUE-RoBERTa base) |
| Parametros totales | 110.625.802 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificación de texto multietiqueta (10 etiquetas) |
| Funcion de activacion de salida | Sigmoide con umbrales por etiqueta en `labels.json` |
| Modelo base | klue/roberta-base (revision 02f94ba5e3fcb7e2a58a390b8639b0fac974a8da) |
| Tamano del repositorio | 0,4 GB |
| Libreria | transformers |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un encoder RoBERTa en su variante coreana KLUE-RoBERTa base, fine-tuneado para clasificación de secuencias multietiqueta. La cabeza de clasificación produce diez logits, uno por etiqueta, sobre los que se aplica una sigmoide independiente; los umbrales de decisión por etiqueta están fijados en 0,5 y se documentan en `labels.json`. La entrada se trunca a 256 tokens, lo que condiciona el tamaño máximo de fragmento que puede clasificarse de una vez.

El entrenamiento combinó 3.470 cláusulas reales del núcleo limpio con 240 cláusulas sintéticas redactadas por el autor, sumando 3.710 ejemplos. Se realizaron dos épocas y la selección del checkpoint se hizo por macro F1 en validación. La validación y el test contienen únicamente cláusulas del núcleo limpio, divididas por grupo de documento y con eliminación de duplicados exactos de texto; el test consta de 446 cláusulas. La innovación metodológica destacable es precisamente el uso de datos sintéticos para mejorar clases con poco soporte: el modelo con sintéticos pasa de 0,838 a 0,858 en micro F1, de 0,762 a 0,829 en macro F1 y de 80,5% a 83,6% en exact match. El autor advierte que las anotaciones sintéticas no han sido revisadas de forma independiente.

## Capacidades

- Clasificación multietiqueta de cláusulas de contratos laborales en coreano sobre diez categorías definidas en `labels.json`.
- Asignación simultánea de varias etiquetas a un mismo fragmento, con puntuaciones sigmoides independientes por etiqueta.
- Procesamiento de fragmentos de hasta 256 tokens, adecuado para cláusulas individuales más que para contratos completos.
- Integración directa con `transformers` mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatibilidad con text-embeddings-inference y endpoints compatibles, lo que facilita el despliegue como servicio de clasificación.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento; es un clasificador puro, no un modelo generativo.
- Capacidad multilingüe limitada al coreano; no se declara soporte para otros idiomas.

## Casos de uso

- Triaje de contratos laborales en bufetes o departamentos de RR. HH.: el modelo clasifica cada cláusula de un contrato coreano y permite enrutar automáticamente las que contienen categorías sensibles (jornada, salario, cláusulas de no competencia) a revisores especializados, reduciendo el tiempo de lectura manual.
- Extracción estructurada de metadatos contractuales: ejecutando el clasificador por fragmentos de hasta 256 tokens, se puede generar un índice de qué tipos de cláusula contiene cada documento, útil para construir un repositorio buscable de contratos.
- Control de cumplimiento y auditoría interna: detección de cláusulas que deben estar presentes o ausentes según la política de la empresa, marcando documentos que requieren revisión legal antes de su firma.
- Preprocesado para pipelines de análisis jurídico: como primera etapa de un sistema mayor, el clasificador etiqueta fragmentos que después se envían a modelos generativos o a reglas específicas, ahorrando contexto y coste computacional.
- Validación de plantillas de contrato: comparar la distribución de etiquetas de una plantilla nueva frente a contratos históricos para detectar omisiones o inclusiones anómalas de cláusulas.
- Investigación en NLP jurídico coreano: modelo de referencia pequeño y reproducible para experimentos de clasificación multietiqueta con datos sintéticos, dado que el autor documenta la metodología y las métricas de comparación.
- Despliegue en entornos con recursos limitados: con 110 millones de parámetros y pesos safetensors de 0,4 GB, puede servirse en una GPU consumer o incluso en CPU para volúmenes moderados de documentos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre un test de 446 cláusulas del núcleo limpio con una única partición agrupada:

| Configuracion de entrenamiento | Test micro F1 | Test macro F1 | Test exact match |
|---|---:|---:|---:|
| Solo núcleo limpio | 0,838 | 0,762 | 80,5% |
| Núcleo limpio + 240 cláusulas sintéticas (este modelo) | 0,858 | 0,829 | 83,6% |

Ambos modelos comparados partieron de la misma revisión de KLUE-RoBERTa, usaron dos épocas y seleccionaron checkpoint por macro F1 en validación. El autor advierte que estas puntuaciones no equivalen a precisión de juicio legal ni garantizan el rendimiento sobre contratos reales, y que algunas etiquetas tienen poco soporte en el test. No se han publicado resultados frente a benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos; en fp16 alrededor de 0,22 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4, A10 o A100 funcionan sin problema, aunque el modelo está sobredimensionado para estas GPUs y el cuello de botella será el preprocesado, no el cálculo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en GPUs integradas con soporte de PyTorch.
- Despliegue: `transformers` con `AutoModelForSequenceClassification`, text-embeddings-inference y endpoints compatibles. No se documentan pesos GGUF ni soporte explícito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, se espera un throughput alto en GPU (cientos o miles de fragmentos por segundo en lote), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hur03/checkit-contract-classifier-core-synthetic-v1 | 110,6 M | 256 tokens | Coreano | Clasificación multietiqueta de cláusulas contractuales | no disponible | Hugging Face, 0 descargas |
| klue/roberta-base | 110,6 M | 512 tokens (típico en RoBERTa) | Coreano | Modelo base preentrenado, sin cabeza de clasificación | no disponible | Hugging Face, ampliamente usado |
| klue/roberta-large | no disponible en la información | no disponible | Coreano | Modelo base preentrenado | no disponible | Hugging Face |

La comparación directa con alternativas especializadas en clasificación de cláusulas contractuales en coreano no está disponible en la información proporcionada. El competidor natural es el propio modelo base sin fine-tuning, que no resuelve la tarea, y la variante large de KLUE-RoBERTa, de la que no se aportan métricas en esta ficha.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni atribución, lo que impide adoptarlo en producción sin contactar con el autor.
- Modelo de nicho con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- El test consta de una única partición agrupada de 446 cláusulas; el autor reconoce que algunas etiquetas tienen poco soporte y que las métricas no garantizan rendimiento sobre contratos reales.
- Las 240 cláusulas sintéticas no han sido revisadas de forma independiente, por lo que pueden introducir sesgos o errores de anotación en las etiquetas con menos datos reales.
- Ventana de 256 tokens: los contratos completos deben fragmentarse, y las cláusulas largas se truncan, con posible pérdida de información relevante.
- Solo coreano: no hay soporte multilingüe declarado.
- Es un clasificador, no un generador: no puede explicar sus decisiones, redactar cláusulas ni mantener conversaciones; el riesgo de alucinación en sentido generativo no aplica, pero sí el de falsos positivos y negativos en la clasificación.
- No debe usarse como sustituto de asesoramiento legal; el propio autor lo indica.
- No se documentan tipos de cuantización ni formatos alternativos a safetensors, lo que limita el despliegue en entornos que requieran GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hur03/checkit-contract-classifier-core-synthetic-v1
- Modelo base KLUE-RoBERTa: https://huggingface.co/klue/roberta-base
