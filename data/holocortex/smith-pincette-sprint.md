# Holocortex/Smith-Pincette-Sprint

## Resumen

Smith-Pincette-Sprint es un modelo de extraccion de spans (span extraction) especializado en la deteccion de datos personales e informacion sensible en texto. Lo desarrolla Holocortex como parte de la familia Smith-Pincette, un conjunto de modelos compactos disenados para localizar y enmascarar datos personales (nombres, contactos, direcciones, identificadores, numeros bancarios y mas) antes de que el texto llegue a logs, LLMs o terceros. La version publicada es v0.5-preview, una release de previsualizacion con API y modelos sujetos a cambios.

Tecnicamente, Sprint es el tier superior de la familia: reutiliza las mismas cabezas de extraccion y las mismas 43 clases que el modelo menor (Smith-Pincette-Nitro), pero sobre un encoder multilingue mas amplio, `jhu-clsp/mmBERT-base`, con 321,9 millones de parametros totales. El modelo se distribuye como un unico grafo ONNX que se ejecuta con onnxruntime en CPU o GPU CUDA, de forma completamente local, sin dependencia de PyTorch.

La relevancia del modelo reside en su enfoque practico: en lugar de generar texto, devuelve spans con offsets de caracteres `(start, end, label, score)` no solapados, lo que lo hace directamente util para pipelines de enmascaramiento reversible, redaccion de PII en prompts de LLM y cumplimiento de privacidad en soporte y procesamiento documental. Su licencia Apache-2.0 y su formato ONNX facilitan el despliegue en entornos con requisitos estrictos de localidad y control de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer multilingue (`jhu-clsp/mmBERT-base`) con cabezas de extraccion de spans, exportado como grafo ONNX |
| Parametros totales | 321,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrada de cualquier longitud; procesada en ventanas de 512 tokens con solapamiento de 64 tokens |
| Tipos de cuantizacion | No disponible (se distribuye como `model.onnx`; no se detallan variantes cuantizadas) |
| Idiomas soportados | Mejor cobertura en ingles y aleman; otros idiomas funcionan en menor grado |
| Licencia | Apache-2.0 (encoder base `jhu-clsp/mmBERT-base` bajo licencia MIT) |
| Formato de pesos | ONNX (`model.onnx`), con `tokenizer.json`, `config.json` y `calibrated_thresholds.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de encoder transformer multilingue basada en `jhu-clsp/mmBERT-base`, al que se anaden cabezas de extraccion de spans. Todo el conjunto se empaqueta como un unico grafo ONNX que se ejecuta con onnxruntime en CPU o GPU CUDA, sin necesidad de PyTorch. La decodificacion aplica umbrales calibrados por clase y devuelve el mejor conjunto de spans no solapados, cada uno con su etiqueta y puntuacion. El modelo define 43 clases agrupadas en identificadores gubernamentales, banca y pagos, credenciales y endpoints (experimentales), identidad digital, persona, contacto y ubicacion, organizacion y salud, y fechas, horas y numeros.

El entrenamiento se realizo sobre aproximadamente 230.000 documentos, ninguno recogido de personas reales. La mayor parte son documentos generados: plantillas sinteticas de tickets, formularios, correos, chats, logs y contratos rellenadas con valores sinteticos, junto con documentos redactados por Qwen3.8-27B (Apache-2.0) en varios idiomas. Se anaden pasajes de Wikipedia en varios idiomas como texto del mundo real, etiquetados automaticamente. Las etiquetas provienen de los propios generadores y de anotacion automatica mediante modelos Apache-2.0. Segun el autor, no se uso ningun dato de test de benchmarks para el entrenamiento y se verifico que el solapamiento con benchmarks publicos es cero.

## Capacidades

- Extraccion de spans de datos personales con offsets de caracteres: devuelve tuplas `(start, end, label, score)` no solapadas.
- Deteccion de 43 clases de PII, incluyendo identificadores gubernamentales (`ssn`, `national_id`, `passport_number`, `tax_id`), banca y pagos (`credit_card_number`, `iban`, `bank_account`, `routing_number`), identidad digital (`ip_address`, `crypto_address`, `username`, `mac_address`), datos de persona (`person`, `date_of_birth`, `occupation`), contacto y ubicacion (`email`, `phone_number`, `street_address`, `city`, `postal_code`, `country`) y fechas, horas y cantidades.
- Enmascaramiento directo de texto mediante `model.mask(text)`, que sustituye los spans detectados por marcadores como `[PERSON]`, `[EMAIL]` o `[IBAN]`.
- Filtrado por subconjunto de etiquetas con `model.detect(text, labels={"email", "iban"})`.
- Umbrales calibrados por clase, con posibilidad de sustituirlos por un umbral plano unico (`threshold=0.4`).
- Procesamiento de entradas de cualquier longitud mediante ventanas de 512 tokens con 64 tokens de solapamiento.
- Ejecucion completamente local en CPU o GPU CUDA mediante onnxruntime.
- Ejemplos de uso adicionales en el repositorio: enmascaramiento por CLI, lotes JSONL, enmascaramiento reversible para prompts de LLM y un servidor MCP local para agentes.

## Casos de uso

- Redaccion de PII en prompts de LLM: el modelo detecta y enmascara nombres, correos, IBAN y telefonos antes de enviar el texto a un modelo generativo, reduciendo la exposicion de datos personales en terceros.
- Saneamiento de logs y trazas: procesamiento por ventanas de 512 tokens con solapamiento que permite recorrer lineas de log de longitud arbitraria y sustituir valores sensibles antes de su almacenamiento o envio a sistemas de observabilidad.
- Atencion al cliente automatizada: enmascaramiento de datos de clientes en tickets y conversaciones de chat multi-turno antes de que el contenido llegue a herramientas de analitica o a modelos externos.
- Procesamiento de formularios y documentos: extraccion de spans de identificadores, direcciones y datos bancarios en documentos sinteticos o controlados, con salida estructurada por offsets de caracteres.
- Enmascaramiento reversible en pipelines de agentes: el repositorio documenta un flujo de enmascaramiento reversible que permite restaurar los valores originales tras el procesamiento por un LLM, util para agentes que necesitan operar sobre texto redactado.
- Servidor MCP local para agentes: integracion como herramienta local de deteccion de PII en arquitecturas de agentes que requieren una capa de saneamiento previa al envio de datos.
- Cumplimiento de privacidad en preprocesamiento: capa de deteccion local y sin dependencia de servicios externos para flujos donde la legislacion exige minimizacion de datos antes de su tratamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 321,9 M de parametros, el grafo ONNX en precision estandar ocupa del orden de 1,3 GB en disco (tamano del repositorio), lo que sugiere un consumo de memoria moderado en CPU y GPU.
- GPU recomendadas: no disponible. El modelo se ejecuta con onnxruntime en CPU o GPU CUDA; no se detallan modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el tamano del modelo (321,9 M de parametros) es compatible con GPUs de consumo habituales, pero el autor no publica requisitos especificos.
- Opciones de despliegue: onnxruntime (CPU o CUDA) mediante la libreria `smith-pincette`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smith-Pincette-Sprint | 321,9 M | Ventanas de 512 tokens con solapamiento de 64 | Extraccion de spans de PII (43 clases), ONNX | Apache-2.0 | Hugging Face (preview v0.5) |
| Smith-Pincette-Nitro | No disponible | No disponible | Mismas cabezas y clases sobre encoder menor | No disponible | Hugging Face |
| Modelos de token-classification genericos (p. ej. basados en BERT) | Variable | Limitado por el encoder | NER generico, no especializado en PII | Variable | Hugging Face |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo estadistico: perdera algunos valores sensibles y marcara como sensibles algunos valores inocuos. No debe usarse como unica salvaguarda cuando una fuga tenga consecuencias legales o de seguridad.
- Las clases de credenciales (`password`, `secret_key`, `jwt_token`, `private_key`, `hostname_or_endpoint`) son experimentales en esta preview y fallan en muchos valores, especialmente en lineas de configuracion y logs. No debe usarse como escaner de secretos.
- Mejor cobertura en ingles y aleman; otros idiomas funcionan en menor grado.
- Es una release de previsualizacion (v0.5-preview): se deben esperar asperezas y cambios tanto en los modelos como en la API.
- El modelo se proporciona tal cual, sin soporte ni garantia; las incidencias se aceptan como issues de GitHub sin respuesta garantizada.
- La licencia Apache-2.0 permite uso comercial, pero el encoder base `jhu-clsp/mmBERT-base` esta bajo licencia MIT, que debe respetarse igualmente.
- No se han publicado resultados de benchmarks que permitan validar el rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Holocortex/Smith-Pincette-Sprint
- Modelo hermano (Smith-Pincette-Nitro): https://huggingface.co/Holocortex/Smith-Pincette-Nitro
- Repositorio de la familia Smith-Pincette: https://github.com/holocortex/Smith-Pincette-Models
- Issues del repositorio: https://github.com/holocortex/Smith-Pincette-Models/issues
- Encoder base `jhu-clsp/mmBERT-base`: https://huggingface.co/jhu-clsp/mmBERT-base
- onnxruntime: https://onnxruntime.ai
- Qwen (modelo generador de documentos de entrenamiento): https://huggingface.co/Qwen
- Licencia CC BY-SA 4.0 (contenido de Wikipedia): https://creativecommons.org/licenses/by-sa/4.0/
