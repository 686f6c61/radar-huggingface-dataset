# desert-ant-labs/redact

## Resumen

Redact es un modelo de clasificación de tokens especializado en la detección y el enmascarado de información personal identificable (PII) que se ejecuta íntegramente en el dispositivo. Lo desarrolla Desert Ant Labs y se distribuye a través de su SDK propietario desert-ant-core, con pesos publicados en Hugging Face bajo una licencia de código disponible (source-available). El modelo resuelve un problema concreto: eliminar nombres, direcciones, correos, teléfonos, tarjetas, IBAN y documentos nacionales de identidad del texto antes de que este salga del dispositivo, sustituyéndolos por marcadores de posición reversibles que permiten reinyectar los valores originales en la respuesta de un LLM.

Técnicamente es un clasificador de tokens de tipo BERT con 23 millones de parámetros, exportado a formatos LiteRT/TFLite (int8, 24,5 MB) y Core ML (4 bits, 11,6 MB). Cubre 27 idiomas europeos y detecta 20 etiquetas de PII mediante una capa híbrida: el modelo neuronal identifica entidades no estructuradas como nombres y direcciones, mientras que una capa de patrones regex y validación por checksum captura identificadores estructurados como correos, tarjetas o IBAN.

Su relevancia actual radica en la combinación de tamaño reducido, cobertura multilingüe amplia y ejecución local sin conexión, lo que lo hace apto para aplicaciones móviles, de escritorio y web que necesitan cumplir con normativas de privacidad (RGPD) sin enviar datos personales a servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT para clasificación de tokens, con capa de patrones complementaria |
| Parametros totales | 23M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens con solapamiento de 64 tokens (procesamiento por fragmentos) |
| Tipos de cuantizacion | int8 (LiteRT/TFLite), 4 bits (Core ML) |
| Idiomas soportados | 27: bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, is, it, lt, lv, mt, nb, nl, nn, pl, pt, ro, sk, sl, sv |
| Licencia | desert-ant-labs-source-available (código disponible, no open source) |
| Formato de pesos | LiteRT/TFLite (int8), Core ML (4 bits) |

## Arquitectura y entrenamiento

Redact combina dos capas de detección. La primera es un clasificador de tokens basado en arquitectura BERT de 23 millones de parámetros que identifica entidades no estructuradas: nombres propios (GIVEN_NAME, SURNAME), componentes de direcciones (STREET_NAME, BUILDING_NUMBER, SECONDARY_ADDRESS, CITY, STATE, ZIP_CODE) y organizaciones (ORG, detectada pero no enmascarada por defecto). La segunda capa aplica patrones y validaciones por checksum para identificadores estructurados como EMAIL, PHONE, CREDIT_CARD, BANK_ACCOUNT, ROUTING_NUMBER, IP_ADDRESS, URL, GOVERNMENT_ID, PASSPORT, DRIVERS_LICENSE, TAX_ID y SSN, además de IMEI (que solo se marca si pasa el checksum de Luhn y aparece a menos de 32 caracteres de la palabra "IMEI").

El procesamiento de textos largos se realiza mediante fragmentación en ventanas de 256 tokens con solapamiento de 64 tokens, de modo que una entidad en el borde de una ventana se recupera completa. El umbral de confianza por defecto es 0,6 para detecciones del modelo, mientras que las coincidencias de patrones estructurados se aplican siempre. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Detección y enmascarado de 20 etiquetas de PII: nombres, apellidos, direcciones completas, correos, teléfonos, tarjetas de crédito, cuentas bancarias, números de ruta, direcciones IP, URLs, identificadores gubernamentales, pasaportes, permisos de conducir, identificadores fiscales y números de la seguridad social.
- Reversibilidad: cada entidad se sustituye por un marcador de posición numerado (por ejemplo, `[GIVEN_NAME_1]`) que permite restaurar los valores originales en la respuesta de un LLM mediante el método `restore`.
- Detección de organizaciones (ORG) sin enmascarado por defecto, configurable mediante la opción `labels`.
- Filtrado por categoría y ajuste del umbral de confianza mínimo (por defecto 0,6).
- Soporte multilingüe para 27 idiomas europeos en un único modelo.
- Ejecución en el dispositivo en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Integración mediante SDK en Swift, Kotlin y JavaScript/TypeScript.
- No es un modelo generativo: no produce texto libre, solo clasifica tokens y aplica patrones.

## Casos de uso

- Atención al cliente con LLM en la nube: la aplicación redacta el mensaje del usuario en local antes de enviarlo a un proveedor de LLM, y restaura los valores originales en la respuesta. Es adecuado porque el modelo cabe en 11,6-24,5 MB y procesa el texto sin salir del dispositivo, cumpliendo con minimización de datos del RGPD.
- Aplicaciones móviles de mensajería o correo: integración mediante el SDK Swift o Kotlin para enmascarar automáticamente nombres, correos y teléfonos en el momento de redactar o reenviar un mensaje, sin depender de conectividad.
- Procesamiento de documentos en escritorio: uso con Node o Linux para limpiar currículums, facturas o formularios antes de almacenarlos en un repositorio o enviarlos a un servicio externo de análisis.
- Cumplimiento normativo en pipelines de datos: filtrado previo de registros de logs o bases de datos antes de exportarlos a entornos de analítica, aprovechando la detección de IBAN, tarjetas y documentos de identidad mediante la capa de patrones.
- Extensiones de navegador y aplicaciones web: uso del paquete JavaScript con LiteRT.js para redactar texto en el propio navegador antes de enviarlo a una API, sin instalar software nativo.
- Anonimización de datasets para investigación: procesamiento por lotes de corpus multilingües en 27 idiomas para eliminar PII antes de publicar o compartir los datos, con la posibilidad de ajustar el umbral de confianza según la sensibilidad del corpus.
- Enmascarado selectivo por categoría: aplicaciones que solo necesitan ocultar datos financieros (tarjetas, IBAN, cuentas) pueden configurar `labels` para limitar la redacción a esas categorías y reducir falsos positivos en nombres.

## Benchmarks y rendimiento

Los datos de la model card comparan Redact con otros sistemas de detección de PII usando el mismo código de evaluación y las mismas filas. La recall se calcula como media macro sobre WikiANN, MultiNERD y un conjunto de PII estructurada con formato válido, en 24 idiomas de la UE.

| Sistema | Recall | Precision | Tamano | Parametros |
|---|---:|---:|---:|---:|
| redact | 88,8 | 99,6 | 11,6 MB | 23M |
| GLiNER-PII | 91,1 | 90,4 | 2,3 GB | 570M |
| Rampart | 61,4 | 97,2 | 14,7 MB | 18,5M |
| OpenAI privacy filter | 60,2 | 93,5 | 3 GB | 1,5B |

Redact obtiene la precisión más alta de la comparativa (99,6) con el segundo tamaño más reducido, a costa de una recall ligeramente inferior a GLiNER-PII (88,8 frente a 91,1). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo se ejecuta en CPU o con aceleración NPU/GPU integrada. El peso es de 11,6 MB en Core ML (4 bits) y 24,5 MB en LiteRT (int8).
- GPU dedicadas: no requiere GPU de escritorio; está diseñado para ejecución en dispositivo (móvil, escritorio, navegador).
- Cabe en cualquier dispositivo consumer: móviles iOS y Android, ordenadores de sobremesa y portátiles, e incluso en el navegador mediante LiteRT.js.
- Opciones de despliegue: SDK desert-ant-core en Swift, Kotlin y JavaScript/TypeScript; LiteRT/TFLite para Android, Linux, Windows, Node y web; Core ML para plataformas Apple. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. El procesamiento se realiza por ventanas de 256 tokens con solapamiento de 64, lo que condiciona el coste en textos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Recall | Precision | Tamano | Licencia | Ejecucion local |
|---|---:|---:|---:|---:|---|---|
| redact | 23M | 88,8 | 99,6 | 11,6 MB | source-available | Si (Core ML, LiteRT) |
| GLiNER-PII | 570M | 91,1 | 90,4 | 2,3 GB | no disponible | Si, pero requiere más recursos |
| Rampart | 18,5M | 61,4 | 97,2 | 14,7 MB | no disponible | Si |
| OpenAI privacy filter | 1,5B | 60,2 | 93,5 | 3 GB | no disponible | No disponible |

Redact se posiciona como la opción con mejor equilibrio entre precisión, tamaño y portabilidad multiplataforma. GLiNER-PII ofrece mayor recall pero con un modelo 25 veces más grande y menor precisión. Rampart y el filtro de OpenAI tienen tamaños muy superiores o prestaciones inferiores en recall.

## Limitaciones y advertencias

- La licencia desert-ant-labs-source-available no es open source; es necesario revisar los términos en https://license.desertant.com/ antes de un uso comercial.
- La recall del 88,8 % implica que aproximadamente una de cada nueve entidades de PII podría no enmascararse por completo; en entornos de alto riesgo conviene complementar con revisión humana o capas adicionales.
- El umbral de confianza por defecto (0,6) puede dejar pasar detecciones de baja confianza; en dominios sensibles conviene ajustarlo.
- El modelo no enmascara organizaciones (ORG) por defecto, lo que puede ser un problema si la política de privacidad exige ocultar también nombres de empresas.
- La detección de IMEI depende de una heurística (checksum de Luhn y proximidad a la palabra "IMEI"), por lo que puede fallar en formatos no convencionales.
- El procesamiento por ventanas de 256 tokens con solapamiento de 64 puede fragmentar entidades muy largas o con formato atípico.
- No se dispone de información sobre sesgos por idioma o dominio; la cobertura de 27 idiomas europeos no garantiza el mismo rendimiento en todos ellos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación.
- La licencia y los términos de uso pueden cambiar; la model card indica que se genera desde el repositorio desert-ant-core y que las ediciones en Hugging Face se sobrescriben.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/redact
- Pesos v0.4.2: https://huggingface.co/desert-ant-labs/redact/tree/v0.4.2
- Demo interactiva: https://huggingface.co/spaces/desert-ant-labs/redact-demo
- Demo del producto: https://desertant.com/models/redact/
- Repositorio desert-ant-core: https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descargas y caché del modelo: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
