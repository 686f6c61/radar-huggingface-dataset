# CordwainerSmith/GolemPII-v1

## Resumen

GolemPII-v1 es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en hebreo. Lo desarrolla CordwainerSmith y se distribuye bajo licencia MIT. Se construye mediante fine-tuning de `xlm-roberta-base` sobre el corpus GolemGuard, un conjunto de datos en hebreo anotado con 12 categorías de PII (nombres, apellidos, direcciones, teléfonos, correos, números de cuenta bancaria, tarjetas de crédito, documentos de identidad, fechas, ciudades y códigos postales, entre otras).

El modelo resuelve un problema concreto: la anonimización automática de texto en hebreo para cumplir requisitos de privacidad en entornos legales, médicos, financieros y de atención al cliente. Con 277 millones de parámetros (la práctica totalidad de la base XLM-RoBERTa), ofrece una latencia propia de un encoder y una integración directa con la librería `transformers` para pipelines de token classification.

Es relevante ahora porque el autor mantiene una línea activa de versiones posteriores (GolemPII-v2-base, v2-small y v2-tiny) que amplían la cobertura a 15 etiquetas y mejoran sustancialmente el rendimiento en benchmarks externos. La v1 queda disponible como referencia estable, pero la propia model card recomienda v2 para nuevos desarrollos. La ficha describe la v1 tal como está publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), fine-tuning para token classification |
| Parametros totales | 277.472.281 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (XLM-RoBERTa base admite hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un encoder transformer multilingüe, y se ajusta para la tarea de token classification con una cabeza de clasificación sobre las representaciones contextuales. La salida es una secuencia de etiquetas BIO/BIOES por token correspondiente a 12 categorías de PII: `BANK_ACCOUNT_NUM`, `CC_NUM`, `CC_PROVIDER`, `CITY`, `DATE`, `EMAIL`, `FIRST_NAME`, `ID_NUM`, `LAST_NAME`, `PHONE_NUM`, `POSTAL_CODE` y `STREET`.

El entrenamiento se realizó sobre el corpus GolemGuard (Hebrew Privacy Information Detection Corpus), con batch size 32, learning rate 2e-5 con warmup lineal y decaimiento, optimizador AdamW y una única GPU NVIDIA A100. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, ni indica si se aplicaron técnicas de RLHF o DPO (no procede en un modelo discriminativo de este tipo). Tampoco se documentan innovaciones arquitectónicas más allá del fine-tuning estándar.

## Capacidades

- Detección y clasificación de entidades PII en texto hebreo a nivel de token, con 12 etiquetas distintas.
- Reconocimiento de nombres y apellidos de persona, direcciones (calle, ciudad, código postal), fechas y números de teléfono.
- Detección de identificadores financieros: números de cuenta bancaria, números de tarjeta de crédito y proveedor de tarjeta.
- Detección de correos electrónicos y números de documento de identidad israelí.
- Salida compatible con pipelines de `transformers` para `token-classification`, lo que permite integración directa en flujos de anonimización y enmascarado.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es un modelo exclusivamente discriminativo.
- Capacidad multilingüe limitada: aunque la base XLM-RoBERTa es multilingüe, el fine-tuning está orientado exclusivamente a hebreo.

## Casos de uso

- Anonimización de documentos legales en hebreo: el modelo etiqueta nombres, direcciones y números de identificación en contratos y expedientes, permitiendo sustituirlos por marcadores antes de archivarlos o compartirlos con terceros.
- Desidentificación de historiales clínicos: en registros médicos en hebreo, detecta nombres de pacientes, fechas y datos de contacto para cumplir con normativas de protección de datos antes de usarlos en investigación.
- Saneamiento de logs y tickets de soporte: integrado como paso previo al almacenamiento, permite enmascarar correos, teléfonos y números de cuenta que aparecen en texto libre de incidencias.
- Cumplimiento de privacidad en atención al cliente: procesa transcripciones de conversaciones en hebreo para redactar la PII antes de que se guarden en sistemas analíticos o se envíen a herramientas de terceros.
- Preparación de datasets para entrenamiento: permite filtrar o enmascarar PII en corpus hebreos recopilados de la web antes de publicarlos o reutilizarlos en proyectos de NLP.
- Investigación en NLP hebreo: sirve como baseline reproducible (licencia MIT, pesos safetensors) para estudiar detección de PII y comparar con versiones posteriores o con modelos multilingües.
- Enmascarado en pipelines ETL de datos financieros: detecta números de cuenta y tarjetas en extractos y registros en hebreo antes de la carga en almacenes de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| REDACT PII Benchmark (hebreo, mitad held-out) | Precision (nivel caracter) | 0,592 |
| REDACT PII Benchmark (hebreo, mitad held-out) | Recall (nivel caracter) | 0,884 |
| REDACT PII Benchmark (hebreo, mitad held-out) | F1 (nivel caracter) | 0,709 |
| REDACT PII Benchmark (hebreo, mitad held-out) | Precision (nivel entidad) | 0,601 |
| REDACT PII Benchmark (hebreo, mitad held-out) | Recall (nivel entidad) | 0,913 |
| REDACT PII Benchmark (hebreo, mitad held-out) | F1 (nivel entidad) | 0,725 |
| NEMO corpus, nombres de persona | Precision | 0,541 |
| NEMO corpus, nombres de persona | Recall | 0,824 |
| NEMO corpus, nombres de persona | F1 | 0,653 |
| GolemGuard (split de evaluación v1) | F1 | 0,9982 |
| GolemGuard (split de evaluación v1) | Precision | 0,9982 |
| GolemGuard (split de evaluación v1) | Recall | 0,9982 |

El rendimiento en el split interno de GolemGuard (F1 0,9982) contrasta con el obtenido en benchmarks externos (F1 0,709 en REDACT, 0,653 en NEMO), lo que sugiere un ajuste muy alto al dominio de entrenamiento y una capacidad de generalización notablemente inferior en datos fuera de distribución.

Desglose por etiqueta en el split interno de GolemGuard (extracto de la model card):

| Etiqueta | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| BANK_ACCOUNT_NUM | 1,0000 | 1,0000 | 1,0000 | 4847 |
| CC_NUM | 1,0000 | 1,0000 | 1,0000 | 234 |
| CC_PROVIDER | 1,0000 | 1,0000 | 1,0000 | 242 |
| CITY | 0,9997 | 0,9995 | 0,9996 | 12237 |
| DATE | 0,9997 | 0,9998 | 0,9997 | 11943 |
| EMAIL | 0,9998 | 1,0000 | 0,9999 | 13235 |
| FIRST_NAME | 0,9937 | 0,9938 | 0,9937 | 17888 |
| ID_NUM | 0,9999 | 1,0000 | 1,0000 | 10577 |
| LAST_NAME | 0,9928 | 0,9921 | 0,9925 | 15655 |
| PHONE_NUM | 1,0000 | 0,9998 | 0,9999 | 20838 |
| POSTAL_CODE | 0,9998 | 0,9999 | 0,9999 | 13321 |
| STREET | 0,9999 | 0,9999 | 0,9999 | 14032 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB solo para pesos (277 M de parámetros × 4 bytes), más overhead de activaciones y del tokenizador.
- VRAM estimada en FP16/BF16: alrededor de 0,55 GB para pesos; en INT8, unos 0,28 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090). Para entrenamiento o fine-tuning se documenta el uso de una NVIDIA A100.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, TorchScript/ONNX Runtime, y servidores de inferencia compatibles con modelos de `transformers` (por ejemplo, Text Embeddings Inference no aplica; para clasificación de tokens conviene un servidor propio o FastAPI). No se documentan integraciones específicas con vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de un encoder de 277 M de parámetros con secuencias de hasta 512 tokens, se espera una latencia de pocos milisegundos por secuencia en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| GolemPII-v1 | 277 M | No disponible | Hebreo | MIT | F1 0,709 (REDACT, caracter); F1 0,725 (REDACT, entidad); F1 0,653 (NEMO) |
| GolemPII-v2-base | 277 M | No disponible | Hebreo + inglés | No disponible | F1 0,917 (REDACT, caracter); 15 etiquetas |
| GolemPII-v2-small | 125 M | No disponible | Hebreo | No disponible | No disponible |
| GolemPII-v2-tiny | 45 M | No disponible | Hebreo | No disponible | No disponible |

La comparativa se limita a la propia familia GolemPII, ya que la información proporcionada no incluye resultados de otros modelos de detección de PII en hebreo. La v1 queda por debajo de v2-base en el benchmark externo REDACT (0,709 frente a 0,917 F1 a nivel de caracter) y cubre tres etiquetas menos (sin números de pasaporte, de permiso de conducir ni IBAN).

## Limitaciones y advertencias

- El rendimiento en benchmarks externos es notablemente inferior al del split interno: F1 de 0,709 en REDACT y 0,653 en NEMO frente a 0,9982 en GolemGuard. La precisión externa es baja (0,592 en caracter, 0,541 en nombres), lo que implica una tasa alta de falsos positivos en texto fuera de dominio.
- El modelo está entrenado exclusivamente para hebreo; no se debe asumir un comportamiento fiable en otros idiomas aunque la base sea multilingüe.
- No cubre números de pasaporte, permisos de conducir ni IBAN (etiquetas añadidas en v2). Para esos casos hay que usar GolemPII-v2.
- La model card no documenta sesgos conocidos ni evaluación de robustez frente a texto adversarial, ruido OCR o variaciones dialectales.
- Riesgo de alucinación no aplica en sentido generativo (es un modelo discriminativo), pero sí existe riesgo de falsos negativos en PII que no siga los patrones del corpus de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones del corpus GolemGuard y de los benchmarks externos empleados en la evaluación.
- La model card recomienda explícitamente migrar a GolemPII-v2 para nuevos desarrollos; la v1 se mantiene "tal cual", sin garantía de actualizaciones.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) en el model-index.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CordwainerSmith/GolemPII-v1
- Dataset GolemGuard: https://huggingface.co/datasets/CordwainerSmith/GolemGuard
- GolemPII-v2-base: https://huggingface.co/CordwainerSmith/GolemPII-v2-base
- GolemPII-v2-small: https://huggingface.co/CordwainerSmith/GolemPII-v2-small
- GolemPII-v2-tiny: https://huggingface.co/CordwainerSmith/GolemPII-v2-tiny
- Código de evaluación: https://huggingface.co/CordwainerSmith/GolemPII-v2-base/tree/main/evaluation
- Demo de GolemPII v2: https://huggingface.co/spaces/CordwainerSmith/GolemPII-v2-demo
- Benchmark REDACT PII (hebreo): https://huggingface.co/datasets/guneeshv/REDACT-PII-Benchmark
- Corpus NEMO: https://huggingface.co/datasets/imvladikon/nemo_corpus
