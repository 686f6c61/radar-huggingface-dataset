# ankitcodes/pii_model

## Resumen

`ankitcodes/pii_model` es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos en inglés. Lo desarrolla un autor individual, Ankit Gupta, bajo el identificador `ankitcodes`, y se distribuye con licencia Apache-2.0. Se trata de un fine-tuning de `google-bert/bert-base-cased`, por lo que hereda la arquitectura encoder-only de BERT con 108.978.545 parámetros totales y un límite de contexto de 512 tokens.

El modelo resuelve un problema concreto y recurrente en pipelines de datos: identificar y poder redactar datos sensibles (nombres, direcciones, correos, teléfonos, tarjetas, IBAN, SSN, contraseñas, etc.) antes de almacenar, compartir o enviar texto a terceros. Predice 31 etiquetas de entidad agrupadas en categorías de persona, contacto, dirección, financiera, identificadores y organización, lo que lo hace útil como primera capa de un sistema de redacción o anonimización.

Su relevancia actual es práctica: los equipos que procesan correos, tickets de soporte o registros de chat necesitan herramientas ligeras que corran en local (0,4 GB de repositorio, formato safetensors, F32) sin enviar datos sensibles a APIs externas. No es un modelo generativo ni un LLM: es un extractor de entidades que debe combinarse con otras salvaguardas para cumplir con normativas como el RGPD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT), fine-tuning de `google-bert/bert-base-cased` |
| Parametros totales | 108.978.545 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en F32; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google-bert/bert-base-cased`, un transformer encoder-only de tipo BERT con tokenización WordPiece sensible a mayúsculas (cased). La tarea es token classification con 31 etiquetas de entidad. La model card no confirma el esquema de etiquetado (BIO, IOB2 o plano) y deja como pendiente la inclusión del mapeo label-to-id de `config.json`.

Los detalles de entrenamiento están incompletos en la documentación proporcionada: no se especifica el dataset de entrenamiento (nombre, enlace, licencia ni si es sintético o real), ni los hiperparámetros (épocas, learning rate, batch size, longitud máxima, semilla, hardware). Sí se indican las versiones del framework: Transformers 4.38.2, PyTorch 2.1.0+cu121, Datasets 2.18.0 y Tokenizers 0.15.2. No se documenta RLHF, DPO ni ninguna innovación técnica destacable (decodificación especulativa, attention linear, etc.).

## Capacidades

- Detección de PII en inglés sobre 31 etiquetas agrupadas en: persona (PREFIX, FIRSTNAME, MIDDLENAME, LASTNAME, GENDER, SEX, AGE, DOB, DATE), contacto (EMAIL, PHONENUMBER, USERNAME, URL), dirección (BUILDINGNUMBER, STREET, SECONDARYADDRESS, CITY, COUNTY, STATE, ZIPCODE), financiera (ACCOUNTNUMBER, ACCOUNTNAME, IBAN, CREDITCARDNUMBER, CREDITCARDISSUER, CREDITCARDCVV, AMOUNT, PIN), identificadores y secretos (SSN, PASSWORD) y organización (COMPANYNAME).
- Clasificación de tokens con `aggregation_strategy="simple"` para fusionar WordPieces en entidades completas.
- Soporte de redacción mediante reemplazo de offsets de caracteres (el ejemplo de la model card recorre las entidades de atrás hacia delante para preservar los offsets).
- Procesamiento de documentos largos mediante chunking con solapamiento y fusión posterior de resultados.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-step, visión ni audio.
- Capacidad multilingüe: solo inglés.

## Casos de uso

- Redacción de correos antes de almacenarlos: se pasa el cuerpo del correo por el pipeline, se ordenan las entidades por offset descendente y se sustituyen por marcadores como `[FIRSTNAME]` o `[EMAIL]`, de modo que el texto redactado pueda guardarse en logs sin exponer datos personales.
- Anonimización de tickets de soporte: el modelo detecta nombres, teléfonos y direcciones en las conversaciones de atención al cliente antes de enviarlas a un sistema de analítica o a un tercero, reduciendo el riesgo de fuga de PII en herramientas externas.
- Filtrado previo en pipelines de datos de entrenamiento: se ejecuta el modelo sobre los registros de chat o formularios para marcar o eliminar las filas que contienen PII antes de incorporarlas a un corpus, usando un umbral `min_score` bajo para priorizar el recall.
- Detección de datos financieros en formularios: las etiquetas de IBAN, CREDITCARDNUMBER, CREDITCARDCVV, PIN y ACCOUNTNUMBER permiten marcar campos sensibles en documentos financieros antes de su indexación o compartición interna.
- Enmascaramiento en logs de aplicaciones: integración en el pipeline de logging para sustituir SSN, PASSWORD y USERNAME en tiempo casi real, ejecutando el modelo en local para no enviar texto sensible a servicios de terceros.
- Punto de partida para fine-tuning propio: al ser un fine-tuning de BERT con licencia Apache-2.0, un equipo puede reentrenarlo con su propio esquema de etiquetas (por ejemplo, identificadores médicos o matrículas) y desplegarlo con Transformers.

## Benchmarks y rendimiento

Resultados reportados por el autor en la partición de evaluación de su dataset de entrenamiento:

| Métrica | Valor |
|---|---|
| Precision | 0.955 |
| Recall | 0.965 |
| F1 | 0.960 |
| Accuracy | 0.991 |

Advertencias del propio autor sobre estas cifras: proceden de la misma fuente que los datos de entrenamiento (si son sintéticos, el rendimiento en texto real será menor); la accuracy de tokens es alta en parte porque la mayoría de tokens no son PII, por lo que el F1 a nivel de entidad es más informativo; no se reportan métricas por entidad, y las etiquetas raras (PIN, CREDITCARDCVV, COUNTY) probablemente rindan por debajo de la media; el modelo no se ha probado en texto real (correos desordenados, chats, OCR con errores o texto con erratas). No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 0,44 GB solo para pesos (108,98 M de parámetros × 4 bytes), más overhead de activaciones y del framework; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- Cabe en cualquier GPU consumer, incluidas GTX 1060, RTX 2060, RTX 3060, RTX 4090, así como en CPU.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes a gran escala; para uso interactivo, cualquier GPU consumer reciente es suficiente.
- Opciones de despliegue: `transformers` pipeline, endpoints compatibles (tag `endpoints_compatible`), despliegue en Azure (tag `deploy:azure`) y, potencialmente, exportación a ONNX (el autor lo menciona como mejora futura, no está publicado).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ankitcodes/pii_model` | 108,98 M | 512 tokens | Token classification (31 etiquetas PII) | apache-2.0 | Hugging Face |
| `google-bert/bert-base-cased` | ~108 M | 512 tokens | Modelo base (MLM/NSP) | apache-2.0 | Hugging Face |
| Microsoft Presidio (analizador) | no disponible | no disponible | Detección de PII basada en reglas + NER | MIT | Open source |
| `dslim/bert-base-NER` | ~108 M | 512 tokens | NER genérico (PER, ORG, LOC, MISC) | MIT | Hugging Face |

La comparación con `dslim/bert-base-NER` es relevante porque comparte base BERT y tamaño, pero este último solo cubre cuatro tipos de entidad genéricos, mientras que `ankitcodes/pii_model` cubre 31 etiquetas orientadas a PII. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- PII no detectada: cualquier entidad que el modelo no marque permanece en el texto; no debe usarse como único control de cumplimiento (RGPD, HIPAA u otras normativas).
- Falsos positivos: números de pedido, códigos de producto y fechas que parecen PII pueden marcarse erróneamente.
- Solo inglés y solo 31 etiquetas fijas; no cubre identificadores nacionales de otros países, números de historial médico, matrículas de vehículos ni identificadores sanitarios.
- No apto para registros médicos: las etiquetas son financieras y personales, sin números de historia clínica, IDs de paciente, nombres de hospital ni IDs de dispositivo.
- Documentos de más de 512 tokens requieren chunking con solapamiento y eliminación de duplicados en las zonas solapadas.
- El formato, el texto todo en minúsculas, las erratas y los errores de OCR reducen la precisión.
- Sesgo no medido: nombres y direcciones de regiones o culturas infrarrepresentadas pueden detectarse con menos fiabilidad.
- Privacidad: el modelo debe ejecutarse en local o en el entorno propio al manejar datos sensibles, para no enviar el texto a un tercero.
- Licencia Apache-2.0 para pesos y código, pero debe verificarse la licencia del dataset de entrenamiento (no especificado) antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ankitcodes/pii_model
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
