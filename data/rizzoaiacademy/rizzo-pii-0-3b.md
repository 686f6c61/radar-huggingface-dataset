# rizzoaiacademy/rizzo-pii-0.3B

## Resumen

rizzo-pii-0.3B es un modelo de clasificación de tokens (token-classification) especializado en la detección de datos personales identificables (PII) en textos en italiano, con especial énfasis en el ámbito legal. Lo desarrolla rizzoaiacademy y se apoya en el backbone mmBERT-base de jhu-clsp, una variante multilingüe de la arquitectura ModernBERT. Con aproximadamente 307 millones de parámetros, cubre 22 categorías de PII, incluyendo identificadores jurídicos italianos como el codice fiscale, la partita IVA o los datos catastrales, que no suelen estar cubiertos por otros modelos abiertos de PII.

El modelo resuelve un problema concreto: permitir el uso de APIs de modelos de lenguaje de frontera sin exponer datos sensibles. Su flujo previsto es la anonimización reversible: se sustituyen las entidades detectadas por marcadores numerados, se envía solo el texto anonimizado a la API externa y se reconstruye la respuesta con un diccionario local. Está pensado para despachos de abogados y equipos de cumplimiento del RGPD.

Su relevancia actual radica en que funciona íntegramente en local, sin GPU ni clave de API, con un consumo de RAM en torno a 0,5 GB en CPU, y ofrece una ventana de contexto nativa de 8192 tokens gracias a la arquitectura ModernBERT. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, backbone mmBERT-base) |
| Parametros totales | 307.564.845 (aprox. 0,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (repo con safetensors y ONNX) |
| Idiomas soportados | Italiano (entrenado de forma multilingüe con 8 idiomas de Ai4Privacy) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se construye sobre jhu-clsp/mmBERT-base, un encoder de la familia ModernBERT adaptado a múltiples idiomas. La tarea es de clasificación de tokens con esquema BIO, lo que da lugar a 44 identificadores de etiqueta (B- e I- por cada una de las 22 categorías, más la etiqueta O). La ventana de contexto de 8192 tokens es nativa de la arquitectura ModernBERT, lo que permite procesar documentos legales completos sin truncamientos agresivos.

El entrenamiento se realizó de forma multilingüe sobre datos de Ai4Privacy (8 idiomas), aunque el modelo está optimizado y validado para italiano. La model card no detalla el número exacto de tokens de entrenamiento, la composición precisa del dataset ni si se aplicaron fases de ajuste fino adicionales o técnicas como RLHF/DPO, por lo que esos datos deben considerarse no disponibles. La innovación principal no es arquitectónica sino de producto: la cobertura de cinco etiquetas jurídicas italianas (CF, PIVA, CATASTO, DOCID, PROVINCE) ausentes en otros modelos de PII, y el diseño explícito para un flujo de anonimización reversible.

## Capacidades

- Detección de PII en texto italiano mediante clasificación de tokens con esquema BIO.
- Cobertura de 22 categorías: personas (FULLNAME, GENDER, AGE), contacto (EMAIL, TELEPHONENUM), ubicación (STREET, BUILDINGNUM, CITY, ZIPCODE, PROVINCE), financiero (IBAN, CREDITCARDNUMBER, AMOUNT), identificadores legales italianos (CF, PIVA, CATASTO, DOCID, ID_DOC) y otros (ORG, DATE, TIME, TARGA).
- Agregación de subpalabras en entidades completas mediante `aggregation_strategy="simple"` en el pipeline de transformers.
- Soporte de flujo de anonimización reversible: sustitución por marcadores numerados y reconstrucción posterior mediante diccionario local.
- Procesamiento de documentos largos gracias a los 8192 tokens de contexto.
- Inferencia en CPU sin GPU ni clave de API.
- Exportación a ONNX además de safetensors.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento: es un modelo exclusivamente de etiquetado de tokens.

## Casos de uso

- Anonimización previa a APIs de LLM de frontera: el modelo detecta y sustituye entidades por marcadores como `[FULLNAME_1]` o `[CF_1]`, se envía solo el texto anonimizado a la API y un diccionario local reconstruye la respuesta. Es adecuado porque los valores sensibles nunca salen de la máquina.
- Cumplimiento del RGPD en despachos de abogados: procesamiento local de contratos, escritos y expedientes para identificar datos personales antes de compartirlos con terceros, con registro de las entidades detectadas.
- Redacción de documentos legales italianos: detección de codice fiscale, partita IVA y datos catastrales en textos jurídicos, categorías que otros modelos de PII no cubren.
- Pipeline de preprocesamiento en sistemas de gestión documental: integración como paso previo a la indexación o al envío a servicios externos, aprovechando la ventana de 8192 tokens para documentos completos.
- Verificación con red de seguridad regex y checksum: para campos estructurados (IBAN, CF, PIVA, tarjetas, matrículas) se puede combinar la salida del modelo con validación matemática y dejar que el checksum prevalezca en caso de discrepancia, tal como hace la aplicación de escritorio del proyecto.
- Despliegue en entornos con recursos limitados: al requerir aproximadamente 0,5 GB de RAM en CPU, puede ejecutarse en portátiles, contenedores pequeños o estaciones de trabajo sin GPU, lo que facilita su adopción en pymes y entornos air-gapped.
- Enmascarado de datos en atención al cliente o soporte: detección de emails, teléfonos, IBAN y nombres en conversaciones antes de almacenarlas o analizarlas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| micro-F1 (entity-level, validación IT) | 0,9888 |
| Precision | 0,9876 |
| Recall | 0,9900 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a una tarea de clasificación de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en CPU consume aproximadamente 0,5 GB de RAM según la model card.
- GPU recomendadas: no son necesarias; cualquier GPU con suficiente memoria para el modelo en fp32 (en torno a 1,2 GB) puede acelerar la inferencia, pero no es un requisito.
- Cabe en cualquier GPU de consumo e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: pipeline de transformers, exportación ONNX para inferencia optimizada, y cualquier runtime compatible con ONNX. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de detección de PII en italiano. La comparativa cuantitativa con alternativas como modelos NER genéricos o detectores de PII multilingües queda como no disponible. Cualitativamente, la model card afirma que las cinco etiquetas jurídicas italianas (CF, PIVA, CATASTO, DOCID, PROVINCE) no están cubiertas por otros modelos de PII abiertos, pero no se aportan nombres ni cifras de esos modelos.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en italiano: aunque se entrenó con datos multilingües, el rendimiento en otros idiomas no está validado ni documentado.
- Es un modelo de clasificación de tokens, no generativo: no puede responder preguntas, razonar ni ejecutar acciones.
- Riesgo de falsos positivos y negativos en entidades ambiguas; la model card recomienda combinar con regex y checksum para campos estructurados (IBAN, CF, PIVA, tarjetas, matrículas) y dejar que la validación matemática prevalezca cuando discrepe del modelo.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (campo `verified: false` en el model-index).
- No se documentan sesgos específicos del modelo ni evaluaciones de robustez frente a texto adversarial u ofuscado.
- La licencia MIT permite uso comercial, pero el cumplimiento del RGPD y del Reglamento europeo de IA recae en el implementador; la model card los presenta como objetivos de diseño, no como certificaciones.
- El proceso de anonimización reversible depende de custodiar adecuadamente el diccionario local de correspondencias; una fuga de ese diccionario compromete la privacidad de los datos originales.
- No se detalla la composición exacta del dataset de entrenamiento ni el número de tokens, lo que limita la evaluación de posibles sesgos de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rizzoaiacademy/rizzo-pii-0.3B
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio y aplicación de escritorio: https://github.com/Rizzo-AI-Academy/rizzo-pii
- Dataset: https://huggingface.co/datasets/rizzoaiacademy/rizzo-pii-it-dataset
- Descarga para Windows: https://github.com/Rizzo-AI-Academy/rizzo-pii/releases/latest
