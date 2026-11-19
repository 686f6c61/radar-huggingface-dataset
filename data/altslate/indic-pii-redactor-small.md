# altslate/indic-pii-redactor-small

## Resumen

Indic PII Redactor (small) es un modelo de clasificación de tokens desarrollado por altslate, orientado a la detección y redacción de datos personales de origen indio en textos en inglés, hindi e hinglish. Con 140,6 millones de parámetros, se construye sobre el modelo base jhu-clsp/mmBERT-small y se distribuye bajo licencia Apache 2.0. Su propósito es permitir la eliminación de información sensible antes de registrar textos, enviarlos a sistemas de analítica o pasarlos a un LLM, cubriendo identificadores específicos de la India que los modelos genéricos de PII no contemplan.

El modelo detecta 16 tipos de entidades, entre las que se incluyen Aadhaar (con agrupaciones variables y formas enmascaradas), PAN, GSTIN, IFSC, identificadores UPI, cuentas bancarias, teléfonos en formatos indios, Voter ID, pasaporte, permiso de conducir, matrículas de vehículo (incluidas series BH y en devanagari), códigos PIN, nombres en latín y devanagari, direcciones postales, correos electrónicos y fechas de nacimiento. Está entrenado explícitamente para no marcar números que se parecen a identificadores pero no lo son, como IDs de pedido, números de transacción o UTR, PNR, OTP, líneas de ayuda, números de seguimiento y números de póliza.

El interés actual del modelo radica en su especialización regional y en su rendimiento medido en conjuntos de evaluación propios: alcanza un recall de 0,995 y una precisión de 0,995 en el conjunto de test retenido de 1.954 mensajes, con solo un 2,6% de falsos positivos en mensajes sin PII. Además, ofrece pesos en formato safetensors y ONNX (fp32 e int8 cuantizado), lo que facilita su despliegue tanto en Python como en entornos JavaScript mediante transformers.js.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, según etiqueta del repositorio), basado en jhu-clsp/mmBERT-small |
| Parámetros totales | 140.654.241 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | ONNX fp32 (563 MB) y ONNX int8 dinámico (142 MB) |
| Idiomas soportados | Inglés (en), hindi (hi) e hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (model.onnx y model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens basado en un encoder transformer, derivado de jhu-clsp/mmBERT-small, una variante multilingüe de ModernBERT de aproximadamente 141 millones de parámetros. La tarea es token-classification con etiquetas BIO para 16 tipos de entidades de PII, lo que permite extraer spans completos y sustituirlos por marcadores de redacción. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, aunque sí indica que los valores de identificadores de los conjuntos de evaluación provienen de los mismos generadores de formato usados en entrenamiento, mientras que el texto circundante es distinto.

El entrenamiento está orientado explícitamente a distinguir identificadores reales de números con formato similar pero sin valor sensible, como IDs de pedido, UTR, PNR, OTP, números de seguimiento o pólizas. No se menciona en la información disponible el uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El modelo se distribuye con exportaciones ONNX que aceptan `input_ids` y `attention_mask` y devuelven `logits`, lo que permite inferencia con onnxruntime y transformers.js.

## Capacidades

- Detección y clasificación de 16 tipos de entidades de PII india: Aadhaar, PAN, GSTIN, IFSC, UPI_ID, BANK_ACCOUNT, PHONE, VOTER_ID, PASSPORT, DRIVING_LICENCE, VEHICLE_REG, PINCODE, PERSON, ADDRESS, EMAIL y DATE_OF_BIRTH.
- Reconocimiento de formatos específicos: Aadhaar de 12 dígitos con cualquier agrupación y formas enmascaradas como `XXXX XXXX 1234`, VIDs de 16 dígitos, PAN en mayúsculas, minúsculas y con espacios, Voter ID en formato antiguo `MH/12/345/678901`, matrículas BH y en devanagari.
- Soporte multilingüe en inglés, hindi (devanagari) e hinglish, incluyendo nombres y direcciones en ambos alfabetos.
- Capacidad de distinguir números con formato similar pero no sensibles: IDs de pedido, números de transacción y UTR, PNR, OTP, líneas de ayuda, números de seguimiento y números de póliza.
- Redacción por spans: el pipeline devuelve offsets de inicio y fin por entidad, lo que permite sustituir cada fragmento por un marcador como `[AADHAAR]` o `[PAN]`.
- No se menciona soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Redacción previa al envío a un LLM: el modelo puede procesar mensajes de usuario en inglés, hindi o hinglish y sustituir Aadhaar, PAN, teléfonos y direcciones por marcadores antes de enviar el texto a un modelo generativo, reduciendo la exposición de datos personales en proveedores externos.
- Cumplimiento en registros y analítica: integrado en pipelines de logging, permite enmascarar identificadores indios en mensajes de chat bancario, formularios KYC o reclamaciones de seguros antes de almacenarlos en sistemas de observabilidad o analítica.
- Atención al cliente automatizada: en conversaciones multi-turno de banca o telecomunicaciones, el modelo detecta números de cuenta, UPI y teléfonos en textos hinglish y evita que se filtren en transcripciones o resúmenes generados automáticamente.
- Procesamiento de documentos KYC y contratos de alquiler: aplicado a texto extraído por OCR de formularios KYC en mayúsculas o contratos de alquiler, permite localizar Aadhaar, PAN, direcciones y fechas de nacimiento para su anonimización antes de archivarlos.
- Moderación y publicación de contenido: en plataformas donde los usuarios comparten datos de contacto o identificadores, el modelo puede marcar automáticamente Aadhaar, teléfonos y correos para su revisión o redacción antes de publicar.
- Anonimización de datasets para investigación: permite construir corpus de texto en hindi e hinglish con PII eliminada, manteniendo la estructura del mensaje y preservando números no sensibles como IDs de pedido o UTR para tareas de análisis.
- Despliegue en el navegador o en el borde: la exportación ONNX int8 de 142 MB permite ejecutar la detección de PII en clientes JavaScript con transformers.js, útil para redactar datos antes de que salgan del dispositivo del usuario.

## Benchmarks y rendimiento

Los resultados se midieron en datos no vistos durante el entrenamiento. El recall y la precisión de redacción cuentan caracteres de PII enmascarados correctamente, independientemente del tipo de entidad. Los falsos positivos en mensajes sin PII indican el porcentaje de mensajes sin datos sensibles en los que el modelo redacta algo.

Conjunto de test retenido (1.954 mensajes: 654 en hindi, 655 en hinglish, 645 en inglés; 267 sin PII):

| Modelo | Parámetros | Recall | Precisión | Falsos positivos sin PII | Recall en hindi | F1 exacto |
|---|---|---|---|---|---|---|
| altslate/indic-pii-redactor-small | 141M | 0,995 | 0,995 | 2,6% | 0,991 | 0,981 |
| Horizon-Labs/pii-redactor-small | 141M | 0,936 | 0,954 | 83% | 0,936 | – |
| Horizon-Labs/pii-redactor-base | 308M | 0,945 | 0,949 | 94% | 0,938 | – |
| urchade/gliner_multi_pii-v1 (umbral 0,5) | ~280M | 0,830 | 0,908 | 44% | 0,626 | 0,696 |
| urchade/gliner_multi_pii-v1 (umbral 0,3) | ~280M | 0,867 | 0,884 | 55% | 0,702 | 0,665 |

Conjunto de desafío escrito a mano (47 mensajes, 58 spans de PII):

| Modelo | Recall | Precisión | Falsos positivos sin PII |
|---|---|---|---|
| altslate/indic-pii-redactor-small | 0,969 | 0,938 | 11% (2 de 19) |
| Horizon-Labs/pii-redactor-small | 0,911 | 0,810 | 74% |
| Horizon-Labs/pii-redactor-base | 0,896 | 0,784 | 84% |
| urchade/gliner_multi_pii-v1 (0,5) | 0,615 | 0,902 | 0% |

Rendimiento por runtime en el split de desarrollo de 500 mensajes:

| Runtime | Recall | Precisión | Falsos positivos sin PII |
|---|---|---|---|
| PyTorch | 0,996 | 0,997 | 1,4% |
| ONNX fp32 | 0,996 | 0,997 | 1,4% |
| ONNX int8 | 0,995 | 0,996 | 4,1% |

La model card advierte que los valores de identificadores del conjunto de test provienen de los mismos generadores de formato usados en entrenamiento, por lo que el resultado favorece formatos ya vistos. El conjunto de desafío, más pequeño, está pensado para compensar esa limitación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 563 MB para los pesos ONNX fp32, más memoria para activaciones y tokenización; en la práctica, menos de 1 GB en GPU.
- VRAM estimada para inferencia en int8: aproximadamente 142 MB para los pesos ONNX cuantizados, con un consumo adicional mínimo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090, así como en A100 o H100, aunque no necesita hardware de datacenter.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso puede ejecutarse en CPU con latencia aceptable para textos cortos.
- Opciones de despliegue: pipeline de transformers en PyTorch, onnxruntime con los ficheros ONNX, transformers.js en JavaScript (probado con `@huggingface/transformers` 4.3.2 en Node 22 con `dtype` `"fp32"` y `"q8"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Enfoque | Licencia | Recall (test) | Precisión (test) | Falsos positivos sin PII |
|---|---|---|---|---|---|---|---|
| altslate/indic-pii-redactor-small | 141M | en, hi, hinglish | Token classification supervisada, 16 etiquetas | Apache 2.0 | 0,995 | 0,995 | 2,6% |
| Horizon-Labs/pii-redactor-small | 141M | No disponible | Token classification | No disponible | 0,936 | 0,954 | 83% |
| Horizon-Labs/pii-redactor-base | 308M | No disponible | Token classification | No disponible | 0,945 | 0,949 | 94% |
| urchade/gliner_multi_pii-v1 | ~280M | Multilingüe | Zero-shot con GLiNER, prompting con etiquetas | No disponible | 0,830 (umbral 0,5) | 0,908 (umbral 0,5) | 44% |

La comparativa se basa en las mediciones publicadas por el autor del modelo; no se dispone de datos independientes sobre los modelos alternativos. La ventaja principal de indic-pii-redactor-small es su especialización en identificadores indios y su baja tasa de falsos positivos en mensajes sin PII, frente a los modelos de Horizon-Labs, que muestran tasas muy elevadas de falsos positivos, y frente a GLiNER, que obtiene menor recall en hindi.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información disponible; al estar entrenado con generadores de formato sintéticos, puede tener sesgos hacia los estilos y formatos representados en esos generadores.
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, no genera texto libre, pero puede producir falsos positivos marcando números no sensibles o falsos negativos omitiendo PII en formatos no vistos.
- Limitaciones de contexto o idioma: la longitud de contexto no está disponible; el soporte se limita a inglés, hindi y hinglish, por lo que textos en otras lenguas indias o mezclas no cubiertas pueden degradar el rendimiento.
- Limitaciones de evaluación: el conjunto de test retenido usa los mismos generadores de formato que el entrenamiento para los valores de identificadores, lo que puede inflar las métricas; el conjunto de desafío es pequeño (47 mensajes, 58 spans), por lo que sus resultados son indicativos.
- Falsos positivos en mensajes sin PII: 2,6% en test retenido y 11% (2 de 19) en el conjunto de desafío, lo que implica que en producción puede redactar contenido legítimo en una pequeña proporción de casos.
- La model card indica que los modelos de Horizon son mejores detectando `DATE_OF_BIRTH` en algunos contextos, aunque el texto proporcionado se corta en ese punto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con las obligaciones habituales de atribución y aviso de licencia.
- Caveat para producción: la salida del pipeline puede incluir un espacio inicial en los offsets (`start` y `word`), por lo que es necesario recortar los offsets antes de aplicar la redacción, tal como muestra el ejemplo de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/altslate/indic-pii-redactor-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo comparado Horizon-Labs/pii-redactor-small: https://huggingface.co/Horizon-Labs/pii-redactor-small
- Modelo comparado Horizon-Labs/pii-redactor-base: https://huggingface.co/Horizon-Labs/pii-redactor-base
- Modelo comparado urchade/gliner_multi_pii-v1: https://huggingface.co/urchade/gliner_multi_pii-v1
- Librería transformers.js: https://huggingface.co/docs/transformers.js
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
