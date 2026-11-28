# ChadTollison/pii-distilbert-v5

## Resumen

pii-distilbert-v5 es un modelo de clasificación de tokens (token classification) especializado en la detección y redacción de información personal identificable (PII) en texto. Lo desarrolla ChadTollison y se basa en DistilBERT cased, con 65.214.751 parámetros reales según los pesos en safetensors. Detecta 15 categorías de datos personales mediante etiquetado BIO en cinco idiomas: inglés, español, francés, alemán e italiano.

El modelo resuelve un problema concreto de cumplimiento y privacidad: identificar nombres, direcciones, correos, teléfonos, números de la seguridad social, tarjetas, IBAN, pasaportes, permisos de conducir, identificadores médicos, fechas de nacimiento, nombres de usuario, contraseñas, direcciones IP y claves de API antes de que el texto se almacene, registre o procese. Su relevancia actual radica en que ofrece una alternativa ligera y desplegable en CPU (copia ONNX de 8 bits de 66 MB) frente a soluciones comerciales o modelos de mayor tamaño, con licencia Apache 2.0.

La versión v5 se afina a partir de pii-distilbert-v3 sobre aproximadamente 114.000 textos, un 15% de ellos documentos largos construidos por concatenación. Se distribuye con pesos en safetensors y ONNX, y el autor publica una comparativa frente a Microsoft Presidio con resultados de F1 en varios conjuntos de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DistilBERT (cased) para token classification |
| Parametros totales | 65.214.751 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el paquete scrubpii procesa textos largos en ventanas cortas) |
| Tipos de cuantizacion | ONNX 8 bits (`onnx/model_quantized.onnx`, 66 MB) |
| Idiomas soportados | en, es, fr, de, it |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un DistilBERT cased configurado como clasificador de tokens con etiquetado BIO para 15 tipos de PII. DistilBERT es una versión destilada de BERT que reduce el número de capas manteniendo el esquema de atención bidireccional del encoder; aquí se emplea para etiquetar cada token de la secuencia de entrada. La tarea es de reconocimiento de entidades nombradas (NER) orientada a privacidad, no de generación.

El ajuste fino parte de ChadTollison/pii-distilbert-v3 y se realiza sobre unos 114.000 textos, de los cuales el 15% son documentos largos generados uniendo textos cortos. Los datos de entrenamiento proceden de ai4privacy/open-pii-masking-500k-ai4privacy (CC BY 4.0, filas en inglés, español, francés, alemán e italiano), gretelai/gretel-pii-masking-en-v1 (Apache 2.0), el split de entrenamiento de nvidia/Nemotron-PII (CC BY 4.0) y frases generadas por el autor. El entrenamiento se ejecutó en un runner de CPU gratuito, según indica la model card. No se documentan fases de RLHF ni DPO, ni innovaciones de decodificación, al tratarse de un modelo discriminativo.

## Capacidades

- Detección de 15 categorías de PII: nombres, direcciones, correos electrónicos, teléfonos, números de la seguridad social, números de tarjeta, IBAN, pasaportes, permisos de conducir, identificadores (incluidos números de historia clínica y de plan de salud), fechas de nacimiento, nombres de usuario, contraseñas, direcciones IP y claves de API.
- Etiquetado BIO a nivel de token para delimitar entidades dentro de secuencias.
- Multilingüe en inglés, español, francés, alemán e italiano.
- Redacción mediante sustitución por marcadores (por ejemplo, `[EMAIL]`, `[PHONE]`) a través del paquete scrubpii.
- Validación por reglas de checksum (Luhn, IBAN, SSN, NPI, DEA) integrada en el paquete, no en el modelo.
- Procesamiento de textos largos por ventanas cortas mediante el paquete scrubpii.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Redacción de registros de aplicaciones: antes de escribir logs en disco o enviarlos a un agregador, el modelo etiqueta correos, IP y claves de API para sustituirlos por marcadores y evitar fugas en sistemas de observabilidad.
- Cumplimiento de RGPD en atención al cliente: transcripciones de chats y correos se procesan para eliminar nombres, teléfonos y direcciones antes de almacenarse en un CRM o en un sistema de análisis.
- Anonimización de historiales clínicos: la detección de números de historia clínica, plan de salud y fechas de nacimiento permite preparar conjuntos de datos para investigación; el autor reporta F1 de 0,99 en el split de test de Nemotron-PII de registros médicos.
- Saneamiento de tickets de soporte: en textos de tickets, correos y transcripciones se detectan identificadores y credenciales para evitar que se expongan en herramientas de gestión de incidencias; F1 de 0,99 en el conjunto correspondiente de Nemotron-PII.
- Limpieza de ficheros de configuración y logs: el modelo detecta claves de API, contraseñas e IP en ficheros de configuración y logs antes de compartirlos con terceros o incluirlos en repositorios; F1 de 0,97 en el conjunto de logs y configuraciones de Nemotron-PII.
- Preprocesado para entrenamiento de modelos: eliminación de PII de corpus multilingües (en, es, fr, de, it) antes de usarlos en ajuste fino o en pipelines de datos, reduciendo el riesgo de memorización de datos personales.
- Despliegue en el navegador o en el borde: la copia ONNX de 8 bits de 66 MB permite ejecutar la redacción en el cliente sin enviar texto a un servidor; el autor ofrece una demostración en navegador.

## Benchmarks y rendimiento

Resultados de F1 publicados por el autor, medidos con el paquete scrubpii y la copia de 8 bits del modelo, frente a scrubpii v3 y Microsoft Presidio:

| Conjunto de datos (textos reservados) | scrubpii v5 | scrubpii v3 | Microsoft Presidio |
|---|---:|---:|---:|
| ai4privacy, inglés | 1,00 | 0,99 | 0,81 |
| ai4privacy, español | 0,99 | 0,99 | 0,63 |
| ai4privacy, francés | 0,99 | 0,96 | 0,69 |
| ai4privacy, alemán | 0,98 | 0,79 | 0,60 |
| ai4privacy, italiano | 0,99 | 0,96 | 0,64 |
| Gretel PII, inglés | 0,99 | 0,99 | 0,85 |
| Gretel finance, inglés (nunca visto en entrenamiento) | 0,85 | 0,80 | 0,52 |
| Nemotron-PII registros médicos (split de test) | 0,99 | 0,91 | 0,82 |
| Nemotron-PII tickets, correos y transcripciones (split de test) | 0,99 | 0,87 | 0,78 |
| Nemotron-PII logs y ficheros de configuración (split de test) | 0,97 | 0,88 | 0,72 |

La F1 combina la cobertura de los datos personales marcados y la precisión de las detecciones sobre datos personales reales. El autor advierte que v5 se entrenó con el split de entrenamiento de Nemotron-PII, por lo que sus resultados en Nemotron se miden sobre el split de test separado; el conjunto Gretel finance no se vio durante el entrenamiento.

## Requisitos de hardware

- Inferencia en CPU: la copia ONNX de 8 bits (66 MB) se ejecuta con ONNX Runtime sin PyTorch, según el autor.
- VRAM estimada: no disponible de forma explícita; por el tamaño del modelo (65,2 M de parámetros) los pesos en fp32 ocupan aproximadamente 260 MB y en 8 bits unos 66 MB.
- GPU recomendadas: no se especifican; cualquier GPU consumer con suficiente memoria para el modelo en fp32 (por ejemplo, una RTX 4090) puede alojarlo, aunque el diseño está orientado a CPU.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se publican requisitos mínimos concretos.
- Opciones de despliegue: transformers (pipeline de token-classification), ONNX Runtime mediante el paquete scrubpii; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| pii-distilbert-v5 | 65,2 M | no disponible | en, es, fr, de, it | Apache 2.0 | NER de PII con DistilBERT |
| Microsoft Presidio | no disponible (basado en reglas y modelos NER) | no disponible | múltiples | MIT (herramienta) | Detección y anonimización de PII |
| pii-distilbert-v3 | no disponible | no disponible | en, es, fr, de, it | Apache 2.0 | Versión previa del mismo modelo |

La comparativa de rendimiento frente a Presidio se recoge en la tabla de benchmarks. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos, por lo que la recall en texto real será inferior a la de los benchmarks; el autor recomienda revisar las redacciones en usos de alto riesgo.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos: puede marcar texto no personal o dejar pasar PII no vista en entrenamiento.
- Los documentos largos deben procesarse en ventanas cortas, tal como hace el paquete scrubpii; no se documenta la longitud de contexto nativa del modelo.
- Cobertura limitada a cinco idiomas (en, es, fr, de, it); no se garantiza comportamiento en otros.
- Los benchmarks de Nemotron-PII se miden sobre el split de test del mismo conjunto usado en entrenamiento, lo que puede inflar los resultados respecto a dominios totalmente nuevos.
- La validación por checksum (Luhn, IBAN, SSN, NPI, DEA) reside en el paquete scrubpii, no en el modelo; sin el paquete, el modelo por sí solo no aplica esas reglas.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías ni cláusulas adicionales más allá de la licencia estándar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 28 de noviembre de 2026; la validación por la comunidad es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChadTollison/pii-distilbert-v5
- Paquete scrubpii en PyPI: https://pypi.org/project/scrubpii/
- Demostración en navegador: https://chadtollison.github.io/redact.html
- Resultados completos por tipo: https://github.com/chadtollison/chadtollison.github.io/blob/main/benchmarks/compare-v5.md
- Script de generación de frases: https://github.com/chadtollison/chadtollison.github.io/blob/main/training/retrain_pii.py
- Script de entrenamiento: https://github.com/chadtollison/chadtollison.github.io/blob/main/training/train_v3.py
- Workflow de entrenamiento: https://github.com/chadtollison/chadtollison.github.io/blob/main/.github/workflows/pii-v5.yml
- Dataset ai4privacy: https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy
- Dataset Gretel PII: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Dataset Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
