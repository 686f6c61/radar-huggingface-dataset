# desert-ant-labs/redact

## Resumen

Redact es un modelo de clasificación de tokens especializado en la detección y el redactado de información personal identificable (PII) que se ejecuta íntegramente en el dispositivo. Lo desarrolla Desert Ant Labs y se distribuye a través de Hugging Face con el identificador `desert-ant-labs/redact`. Resuelve un problema concreto: eliminar nombres, direcciones, correos, teléfonos, tarjetas, IBAN y documentos de identidad del texto antes de que salga del dispositivo, sustituyéndolos por marcadores de posición reversibles que permiten enviar el texto anonimizado a un LLM y reinsertar los valores originales en la respuesta.

El modelo se basa en una arquitectura BERT de aproximadamente 23 millones de parámetros y se publica en formatos compilados para inferencia local: Core ML cuantizado a 4 bits (11,6 MB) en plataformas Apple y LiteRT en int8 (24,5 MB) en Android, Linux, Windows, Node y navegador. Soporta 27 idiomas europeos y detecta 20 etiquetas de PII, combinando un clasificador de tokens para entidades no estructuradas (nombres, direcciones) con una capa de patrones para identificadores estructurados (correos, tarjetas, IBAN, IP).

Su relevancia actual radica en que ofrece una alternativa de muy bajo coste computacional frente a filtros de privacidad basados en LLM de miles de millones de parámetros, con una precisión declarada del 99,6 % y un tamaño que permite empotrarlo en aplicaciones móviles y de escritorio sin depender de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) para clasificación de tokens, con capa de patrones auxiliar |
| Parámetros totales | 23M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 256 tokens con solapamiento de 64 tokens |
| Tipos de cuantización | 4 bits (Core ML), int8 (LiteRT) |
| Idiomas soportados | 27: bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, is, it, lt, lv, mt, nb, nl, nn, pl, pt, ro, sk, sl, sv |
| Licencia | desert-ant-labs-source-available (other) |
| Formato de pesos | Core ML (4 bits), LiteRT/TFLite (int8) |
| Tamaño del repositorio | 0,2 GB |
| Etiquetas detectadas | 20 (GIVEN_NAME, SURNAME, STREET_NAME, BUILDING_NUMBER, SECONDARY_ADDRESS, CITY, STATE, ZIP_CODE, EMAIL, PHONE, CREDIT_CARD, BANK_ACCOUNT, ROUTING_NUMBER, IP_ADDRESS, URL, GOVERNMENT_ID, PASSPORT, DRIVERS_LICENSE, TAX_ID, SSN) más ORG e IMEI |
| Plataformas | iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador, Node |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo es un transformer tipo BERT de 23 millones de parámetros configurado como clasificador de tokens (token classification). La detección combina dos capas: el modelo neuronal identifica entidades no estructuradas como nombres propios, apellidos y direcciones, mientras que una capa de patrones determinista captura identificadores con formato fijo como correos electrónicos, números de tarjeta, IBAN, direcciones IP y URLs. Esta separación permite que los patrones estructurados se apliquen siempre, independientemente del umbral de confianza del modelo.

El procesamiento de textos largos se realiza mediante ventanas de 256 tokens con un solapamiento de 64 tokens, de modo que una entidad situada en el borde de una ventana se reconstruye completa. El SDK aplica por defecto un umbral mínimo de confianza de 0,6 para descartar detecciones del modelo, umbral configurable. La detección de IMEI se resuelve con una comprobación de patrón que exige que el número de 15 dígitos supere el checksum de Luhn y aparezca a menos de 32 caracteres de la palabra "IMEI".

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que las métricas se evaluaron sobre WikiANN, MultiNERD y un conjunto de PII estructurada con formato válido, en 24 lenguas de la UE.

## Capacidades

- Detección y redactado de PII en 27 idiomas europeos, con sustitución por marcadores de posición reversibles (por ejemplo, `[GIVEN_NAME_1]`, `[EMAIL_1]`).
- Clasificación de 20 etiquetas de PII, incluyendo nombres, direcciones postales, correos, teléfonos, tarjetas de crédito, cuentas bancarias, números de ruta, IPs, URLs, documentos de identidad, pasaportes, permisos de conducir, identificadores fiscales y SSN.
- Detección de organizaciones (ORG) para evitar que nombres de empresas se etiqueten erróneamente como apellidos; no se redactan por defecto salvo que se incluyan explícitamente en las etiquetas.
- Detección de IMEI mediante comprobación de patrón con checksum de Luhn.
- Restauración de los valores originales en la respuesta de un LLM a partir de los marcadores de posición (`result.restore(reply)`).
- Filtrado por categoría de etiqueta y ajuste del umbral de confianza mínimo.
- Ejecución totalmente local en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: es exclusivamente un modelo de clasificación de tokens.

## Casos de uso

- Anonimización previa al envío a un LLM en la nube: la aplicación redacta el texto en el dispositivo, envía la versión con marcadores de posición al modelo remoto y reinserta los valores originales en la respuesta mediante `restore`. Es adecuado por su tamaño reducido y su ejecución local sin latencia de red.
- Cumplimiento de RGPD en aplicaciones móviles: integración en apps iOS y Android para eliminar PII de logs, telemetría y textos de usuario antes de que abandonen el dispositivo, con un modelo de 11,6 MB en Core ML o 24,5 MB en LiteRT.
- Redacción de documentos en procesadores de texto y herramientas de escritorio: el modelo puede procesar textos largos mediante ventanas de 256 tokens con solapamiento de 64, detectando nombres y direcciones en contratos, correos o informes antes de compartirlos.
- Filtrado de PII en pipelines de datos y ETL: en entornos Linux, Windows o Node, el SDK permite redactar lotes de texto antes de almacenarlos en bases de datos o enviarlos a sistemas analíticos, con umbral de confianza configurable.
- Protección de datos en atención al cliente: redactar conversaciones multi-turno que contienen nombres, teléfonos y correos antes de pasarlas a un sistema de análisis o a un modelo generativo, manteniendo la reversibilidad para responder al usuario.
- Saneamiento de texto en navegador: mediante LiteRT en el navegador, la demo pública permite pegar texto y ver la PII resaltada o enmascarada sin que el contenido salga del cliente.
- Detección de identificadores estructurados en formularios: la capa de patrones captura tarjetas, IBAN, IPs y URLs de forma determinista, útil para validar y enmascarar datos en formularios web o aplicaciones de banca.

## Benchmarks y rendimiento

La model card publica una comparativa de recall y precisión sobre WikiANN, MultiNERD y un conjunto de PII estructurada con formato válido, en 24 lenguas de la UE, evaluando todos los sistemas con el mismo código y las mismas filas:

| Sistema | Recall | Precisión | Tamaño | Parámetros |
|---|---:|---:|---:|---:|
| redact | 88,8 | 99,6 | 11,6 MB | 23M |
| GLiNER-PII | 91,1 | 90,4 | 2,3 GB | 570M |
| Rampart | 61,4 | 97,2 | 14,7 MB | 18,5M |
| OpenAI privacy filter | 60,2 | 93,5 | 3 GB | 1,5B |

El recall se define como la proporción de datos personales enmascarados por completo, promediado de forma macro sobre los tres conjuntos. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en todos los formatos publicados (11,6 MB en Core ML 4 bits, 24,5 MB en LiteRT int8), sin necesidad de GPU dedicada.
- GPU recomendadas: no requiere GPU; está diseñado para CPU y aceleradores neuronales integrados (Neural Engine en Apple, NNAPI en Android).
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles de gama baja; no requiere tarjetas A100, H100 ni RTX 4090.
- Opciones de despliegue: SDK propio de Desert Ant Labs para Swift, Kotlin y JavaScript/TypeScript; LiteRT/TFLite para Android, Linux, Windows, Node y navegador; Core ML para plataformas Apple.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Recall | Precisión | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| redact | 23M | 11,6 MB (Core ML) / 24,5 MB (LiteRT) | 88,8 | 99,6 | source-available | Hugging Face, SDK Swift/Kotlin/JS |
| GLiNER-PII | 570M | 2,3 GB | 91,1 | 90,4 | no disponible | no disponible |
| Rampart | 18,5M | 14,7 MB | 61,4 | 97,2 | no disponible | no disponible |
| OpenAI privacy filter | 1,5B | 3 GB | 60,2 | 93,5 | no disponible | no disponible |

Redact ofrece el mejor equilibrio entre precisión y tamaño de la comparativa: con 23M de parámetros y 11,6 MB supera en precisión a GLiNER-PII (570M) y a OpenAI privacy filter (1,5B), aunque con un recall ligeramente inferior al de GLiNER-PII (88,8 frente a 91,1). Frente a Rampart, de tamaño similar, mejora notablemente el recall (88,8 frente a 61,4).

## Limitaciones y advertencias

- El recall es del 88,8 %, lo que implica que aproximadamente un 11 % de los datos personales puede no enmascararse por completo; no debe considerarse una garantía absoluta de anonimización.
- La licencia es `desert-ant-labs-source-available`, no una licencia de código abierto estándar; es necesario revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial.
- El modelo solo cubre 27 idiomas europeos; no soporta otros idiomas ni escrituras no latinas.
- El procesamiento se realiza en ventanas de 256 tokens con solapamiento de 64; entidades que crucen ventanas pueden requerir la reconstrucción del SDK, y textos muy largos implican múltiples pasadas.
- El umbral de confianza por defecto es 0,6; bajarlo aumenta el recall pero también los falsos positivos, y subirlo puede dejar PII sin redactar.
- Las organizaciones (ORG) no se redactan por defecto, lo que puede ser inadecuado en contextos donde el nombre de una empresa también sea dato sensible.
- No se dispone de información sobre sesgos demográficos o geográficos del modelo, ni sobre el volumen y la composición de los datos de entrenamiento.
- Al ser un modelo de clasificación de tokens, no genera texto ni razona; cualquier expectativa de uso generativo es inaplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/redact
- Pesos v0.4.2: https://huggingface.co/desert-ant-labs/redact/tree/v0.4.2
- Demo interactiva: https://huggingface.co/spaces/desert-ant-labs/redact-demo
- Página del modelo: https://desertant.com/models/redact/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descargas y caché de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
