# desert-ant-labs/redact

## Resumen

Redact es un modelo de detección y redacción de información personal identificable (PII) desarrollado por Desert Ant Labs, diseñado para ejecutarse íntegramente en el dispositivo (on-device) en 27 idiomas. Su objetivo es eliminar nombres, direcciones, correos electrónicos, teléfonos, tarjetas bancarias, IBANs e identificaciones nacionales antes de que los datos salgan del dispositivo, lo que lo hace especialmente relevante para aplicaciones con requisitos estrictos de privacidad y cumplimiento normativo como el GDPR.

Arquitectónicamente combina un clasificador de tokens BIOES con una capa determinista sin dependencias para identificadores estructurados. El modelo desplegable ocupa solo 11,6 MB en la versión de 4 bits para Core ML (Apple) o 24,5 MB en la versión int8 para LiteRT (Android, Linux y web), con 23 millones de parámetros. No es un modelo generativo, sino un clasificador de tokenización, por lo que no tiene ventana de contexto en el sentido habitual de los LLM.

Su relevancia actual radica en que permite cumplir con normativas de protección de datos en tiempo real, sin enviar información sensible a servidores externos, y con una huella de memoria mínima que lo hace viable en cualquier dispositivo móvil o navegador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Token classifier BIOES + capa determinista para IDs estructurados |
| Parametros totales | 23 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificacion de tokens) |
| Tipos de cuantizacion | 4-bit (Core ML), int8 (LiteRT) |
| Idiomas soportados | 27: bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, is, it, lt, lv, mt, nb, nl, nn, pl, pt, ro, sk, sl, sv |
| Licencia | desert-ant-labs-source-available-1.0 (https://license.desertant.com/1.0) |
| Formato de pesos | LiteRT (.tflite), Core ML (4-bit) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de clasificación de tokens basada en el esquema BIOES (Begin, Inside, Outside, End, Singleton), que etiqueta cada token de la secuencia como parte de una entidad PII o fuera de ella. Sobre esta cabecera neuronal se superpone una capa determinista, sin dependencias externas, que valida y extrae identificadores estructurados como números de tarjeta, IBAN, IMEI o direcciones IP mediante reglas de formato. Esta combinación permite alcanzar una alta precisión (99,6% en el conjunto estructurado) sin sacrificar la portabilidad.

No se han publicado detalles sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. La evaluación se realizó sobre los conjuntos WikiANN, MultiNERD y un conjunto propio de PII estructurado con validez de formato, abarcando 24 lenguas de la UE. La cobertura no es uniforme: las lenguas grandes (inglés, español, francés, alemán) muestran mejor rendimiento que las minoritarias (maltés, irlandés).

## Capacidades

- Detección de 20 tipos de PII: nombres de pila, apellidos, calles, números de edificio, direcciones secundarias, ciudades, estados, códigos postales, correos electrónicos, teléfonos, tarjetas de crédito, cuentas bancarias, números de ruta, direcciones IP, URLs, identificaciones gubernamentales, pasaportes, licencias de conducir, números fiscales y números de seguridad social.
- Redacción (enmascaramiento) de los tipos anteriores, sustituyéndolos por etiquetas como `[GIVEN_NAME]`, `[EMAIL]`, `[BANK_ACCOUNT]`, etc.
- Detección de organizaciones (etiqueta `ORG`) sin redacción por defecto, para evitar confundir nombres de empresas con apellidos.
- Capa determinista adicional que emite la etiqueta `IMEI` para identificadores de dispositivo.
- Soporte multilingüe en 27 idiomas, cubriendo alfabetos latino, griego y cirílico.
- Ejecución completamente offline, sin necesidad de conexión a red ni servidores externos.
- Compatibilidad multiplataforma: iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.js.

## Casos de uso

- Anonimización de logs de servidor: integrar Redact en pipelines de registro para eliminar direcciones IP, correos y nombres de usuario antes de almacenar o enviar logs a servicios de análisis, reduciendo el riesgo de fugas de datos.
- Preprocesamiento de datos para entrenamiento de IA: limpiar conjuntos de texto que contienen información personal antes de usarlos para fine-tuning de modelos, garantizando que los datos de entrenamiento no contengan PII no anonimizada.
- Filtrado de mensajes en atención al cliente: enmascarar automáticamente datos sensibles en conversaciones de soporte antes de que sean archivadas o compartidas con terceros, cumpliendo con políticas de privacidad.
- Redacción en tiempo real en editores de texto: integrar el modelo en aplicaciones de notas o formularios para que, mientras el usuario escribe, los datos personales se resalten o se oculten automáticamente, evitando que se envíen accidentalmente.
- Cumplimiento GDPR en apps móviles: usar Redact en aplicaciones de salud o finanzas para garantizar que los datos personales de los usuarios nunca salgan del dispositivo, incluso si la app envía telemetría o datos de uso.
- Protección de datos en entornos de mensajería instantánea: aplicar redacción local a los mensajes antes de que sean procesados por servicios de transcripción o análisis en la nube, preservando la privacidad del usuario.

## Benchmarks y rendimiento

La model card incluye dos comparativas. La primera enfrenta a Redact con otros sistemas de detección de PII, puntuados con el mismo harness y en el mismo conjunto de datos (WikiANN, MultiNERD y un conjunto estructurado con formato válido, sobre 24 lenguas de la UE). La segunda compara exclusivamente con AWS Comprehend en inglés, ya que Comprehend rechaza cualquier otro idioma.

| Sistema | Recall (%) | Precision (%) | Tamano | Parametros |
|---|---:|---:|---:|---:|
| **Redact** | **88,8** | **99,6** | **11,6 MB** | **23M** |
| GLiNER-PII | 91,1 | 90,4 | 2,3 GB | 570M |
| Rampart | 61,4 | 97,2 | 14,7 MB | 18,5M |
| OpenAI privacy filter | 60,2 | 93,5 | 3 GB | 1,5B |

Recall se define como la proporción de datos personales completamente enmascarados (a prueba de fugas), promediada macro sobre los tres conjuntos. Precision es la proporción de tramos enmascarados que realmente eran datos personales, medida sobre el conjunto estructurado.

En el conjunto negativo de 11.528 filas diseñado para provocar falsos positivos (mayúsculas iniciales, texto en mayúsculas, nombres de meses y días, vocabulario de interfaz, números sueltos, nombres de empresas), Redact deja intactas el 94,1% de las filas.

Comparativa con AWS Comprehend (solo inglés, mismos datos):

| Sistema | Nombres (WikiANN) | Nombres (MultiNERD) | Estructurado | Compuesto ingles |
|---|---:|---:|---:|---:|
| Redact | 69,5 | 94,9 | **95,0** | 86,5 |
| AWS Comprehend | **84,3** | **98,5** | 91,9 | **91,6** |

Precision es prácticamente idéntica en ambos (99,8 frente a 100,0). Comprehend supera a Redact en nombres en inglés, pero solo cubre un idioma y requiere llamadas a la nube con coste por petición.

## Requisitos de hardware

- VRAM: no requiere GPU dedicada; el modelo se ejecuta en CPU. El tamaño en disco es de 11,6 MB (Core ML 4-bit) o 24,5 MB (LiteRT int8).
- GPU recomendadas: ninguna, funciona en cualquier procesador móvil o de escritorio moderno.
- Compatibilidad con GPU de consumo: sí, cualquier dispositivo con CPU soporta la inferencia; no necesita aceleración gráfica.
- Opciones de despliegue: Core ML (Apple), LiteRT (Android, Linux, Windows), WebAssembly (navegador), Node.js (con núcleo nativo precompilado). SDKs disponibles para Swift, Kotlin y JavaScript/TypeScript.
- Latencia y throughput: no se publican cifras concretas, pero dado el tamaño y la arquitectura, se espera una latencia en el orden de milisegundos por frase en dispositivos móviles modernos.

## Comparativa con modelos similares

La tabla de benchmarks ya incluye comparación con GLiNER-PII (570M parámetros, 2,3 GB), Rampart (18,5M, 14,7 MB) y OpenAI privacy filter (1,5B, 3 GB). Redact ofrece el mejor equilibrio entre precisión y tamaño: con 23M parámetros y 11,6 MB, alcanza una precisión del 99,6%, superando a todos los demás, aunque su recall (88,8%) es inferior al de GLiNER-PII (91,1%). Frente a Rampart, Redact mejora el recall en más de 27 puntos porcentuales con un coste de solo 5 MB adicionales. En comparación con AWS Comprehend, Redact es inferior en nombres en inglés pero superior en datos estructurados, y cubre 27 idiomas frente a uno solo.

| Modelo | Parametros | Tamano | Recall | Precision | Idiomas | Licencia |
|---|---:|---:|---:|---:|---|---|
| Redact | 23M | 11,6 MB | 88,8 | 99,6 | 27 | Source-available |
| GLiNER-PII | 570M | 2,3 GB | 91,1 | 90,4 | Multi (no especificado) | No disponible |
| Rampart | 18,5M | 14,7 MB | 61,4 | 97,2 | Multi (no especificado) | No disponible |
| OpenAI privacy filter | 1,5B | 3 GB | 60,2 | 93,5 | Ingles (principal) | Propietaria |

## Limitaciones y advertencias

- El recall es del 88,8%, lo que significa que aproximadamente uno de cada diez datos personales puede no ser detectado. Para aplicaciones críticas de seguridad, se recomienda combinar con otras capas de verificación.
- La cobertura lingüística no es uniforme: las lenguas mayoritarias de la UE (inglés, español, francés, alemán) ofrecen mejor rendimiento que las minoritarias (maltés, irlandés). El modelo puede fallar más a menudo en estos idiomas.
- La etiqueta `ORG` se detecta pero no se redacta por defecto, ya que una empresa no es una persona natural. Si se necesita redactar organizaciones, hay que activarla explícitamente en la configuración del SDK.
- La licencia es source-available (desert-ant-labs-source-available-1.0), no una licencia open source tradicional. Es necesario revisar los términos en https://license.desertant.com/1.0 para usos comerciales.
- No se han publicado detalles sobre sesgos potenciales del modelo ni sobre su comportamiento con dialectos o variantes regionales. La evaluación cubre lenguas estándar, por lo que el rendimiento con jerga local o transliteraciones puede degradarse.
- El modelo está pensado para redacción, no para extracción o análisis posterior: enmascara los datos pero no los estructura ni los categoriza más allá de la etiqueta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/desert-ant-labs/redact
- Pagina del producto: https://desertant.com/models/redact/
- Repositorio GitHub (redirige al monorepo): https://github.com/Desert-Ant-Labs/redact
- Documentacion del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/redact.md
- Demo en vivo: https://huggingface.co/spaces/desert-ant-labs/redact-demo
- Licencia: https://license.desertant.com/1.0
