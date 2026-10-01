# scottmas/piitag

## Resumen
piitag es un etiquetador de PII por byte con arquitectura NNUE, desarrollado por el usuario scottmas. No es un modelo generativo ni un transformer: los n-gramas de bytes hasheados alimentan dos acumuladores int16 y un MLP int8 pequeño puntúa cada byte para localizar y clasificar información personal identificable.

El problema que resuelve es la detección y redacción de PII en texto no estructurado, con 34 tipos de entidad y un enfoque de inferencia entera en Rust. Está entrenado sobre el dataset nvidia/Nemotron-PII y se distribuye con licencia CC-BY-4.0, lo que lo hace relevante para pipelines de cumplimiento, anonimización y saneado de datos.

La ventana de contexto es local: 32 bytes a la izquierda y 32 a la derecha, con órdenes de contexto 1, 2 y 3. No se publica el número total de parámetros. El modelo se empaqueta en formato .piitag versión 3 y la crate Rust `cynch-piitag` fija el commit y el sha256 del fichero en su `weights.lock`.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Tagger PII por byte con forma NNUE: n-gramas de bytes hasheados, dos acumuladores int16, MLP int8 pequeño y cabeza de tipo |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 bytes a la izquierda y 32 bytes a la derecha; órdenes de contexto [1, 2, 3]; offsets locales [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9] |
| Tipos de cuantización | acumuladores int16 y MLP int8; no se documentan esquemas de cuantización alternativos |
| Idiomas soportados | no disponibles; el dataset y el diccionario de nombres proceden de datos de EE.UU. |
| Licencia | CC-BY-4.0 |
| Formato de pesos | .piitag, versión 3: magic de 8 bytes, longitud de cabecera u32 little-endian, cabecera JSON plana y arrays little-endian alineados a 64 bytes |

## Arquitectura y entrenamiento
piitag no es un transformer, un MoE ni un modelo SSM. Es un etiquetador PII por byte con arquitectura NNUE: los n-gramas de bytes hasheados alimentan dos acumuladores int16 y un MLP int8 pequeño puntúa cada byte. Una cabeza de tipo asigna una de 34 clases a cada span detectado. La configuración declarada es `k=8`, `ctx_orders [1, 2, 3]`, `ctx_l 32`, `ctx_r 32`, `log2_ctx 13`, `loc_offsets [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]`, `loc_orders [1, 2]`, `log2_loc 12`, `h1 32`, `h2 32`, `h3 32`, `dilate 1`. El diccionario de nombres contiene 152167 entradas.

El modelo se entrenó sobre `nvidia/Nemotron-PII` en la revisión `b70ffaf5ff39e079776134c5bf4381f00a9fd1ed`, de NVIDIA, con licencia CC-BY-4.0. El diccionario de nombres se construye con datos públicos de EE.UU.: nombres de bebé de la Social Security Administration vía `hadley/data-baby-names` y apellidos del Census 2000 vía `fivethirtyeight/data`. El umbral `threshold_q = -14935` se eligió en validación para 0.980 de recall por byte. La inferencia entera en Rust coincide exactamente con la referencia Python: 0 discrepancias en 2000 buffers de test.

## Capacidades
- Etiquetado de PII a nivel de byte: puntúa cada byte y forma spans con una etiqueta de tipo.
- Detección de 34 tipos de entidad: account_number, api_key, bank_routing_number, biometric_identifier, certificate_license_number, coordinate, credit_debit_card, customer_id, cvv, date_of_birth, device_identifier, email, employee_id, fax_number, health_plan_beneficiary_number, http_cookie, ipv4, ipv6, license_plate, mac_address, medical_record_number, national_id, password, person_name, phone_number, pin, postcode, ssn, street_address, swift_bic, tax_id, unique_id, user_name y vehicle_identifier.
- Redacción y anonimización: al localizar los spans, permite eliminarlos o enmascararlos en pipelines de privacidad.
- Inferencia determinista en Rust: la implementación entera coincide con la referencia Python.
- Cabeza de tipo con accuracy global de 0.967 sobre 466210 spans de test y 0.951 de media por tipo.
- No es un modelo generativo: no genera texto, no soporta tool calling, no implementa agentes, ni tiene capacidades de visión o audio.
- No se documenta soporte multilingüe.

## Casos de uso
- Redacción de PII en documentos y formularios: el modelo recorre el texto byte a byte, localiza spans como `person_name`, `email` o `ssn` y permite sustituirlos o eliminarlos antes de almacenar o compartir el documento.
- Cumplimiento del RGPD en pipelines de datos: se puede integrar en procesos ETL para anonimizar campos personales antes de persistir los datos, con 34 tipos de entidad que cubren identificadores financieros, sanitarios y de contacto.
- Saneado de logs y trazas: detecta `ipv4`, `ipv6`, `mac_address`, `http_cookie`, `api_key` y `password` en logs no estructurados, donde un enfoque por bytes evita depender de esquemas previos.
- Anonimización de datasets para entrenamiento: aplicado sobre corpus propios o públicos, reduce la presencia de PII antes de publicar el dataset; la licencia CC-BY-4.0 permite uso comercial con atribución.
- DLP en correos y tickets de soporte: identifica `phone_number`, `person_name`, `street_address` o `postcode` en conversaciones y formularios, y permite bloquear o marcar el contenido antes de que salga de la organización.
- Etiquetado para auditoría humana: genera spans etiquetados que un revisor puede validar; la accuracy por tipo ayuda a priorizar los casos de mayor riesgo.
- Integración en aplicaciones Rust: la crate `cynch-piitag` embebe el modelo y fija commit y sha256 en `weights.lock`, lo que facilita despliegues locales y verificables.
- Prevención de fugas en salidas de LLM: se puede pasar la respuesta de un modelo generativo por piitag antes de devolverla al usuario para detectar PII que el LLM haya podido reproducir.

## Benchmarks y rendimiento
Resultados en el split de test retenido. Un span se filtra si alguno de sus bytes queda sin redactar. La tabla compara piitag con un baseline lineal.

| Modelo | Span leak rate | Fully missed | Byte precision | Byte recall | PR-AUC |
|---|---|---|---|---|---|
| piitag | 0.0102 | 0.0064 | 0.770 | 0.979 | 0.975 |
| linear baseline | 0.0169 | 0.0131 | 0.547 | 0.977 | 0.944 |

Precisión por tipo de entidad en test:

| Tipo | Spans de test | Accuracy |
|---|---:|---:|
| account_number | 16698 | 0.936 |
| api_key | 4667 | 0.969 |
| bank_routing_number | 8354 | 0.939 |
| biometric_identifier | 11379 | 0.980 |
| certificate_license_number | 3002 | 0.945 |
| coordinate | 7677 | 0.992 |
| credit_debit_card | 12936 | 0.983 |
| customer_id | 20502 | 0.964 |
| cvv | 4843 | 0.931 |
| date_of_birth | 18079 | 0.995 |
| device_identifier | 2507 | 0.913 |
| email | 53930 | 0.997 |
| employee_id | 8878 | 0.960 |
| fax_number | 6442 | 0.868 |
| health_plan_beneficiary_number | 10561 | 0.971 |
| http_cookie | 5014 | 0.991 |
| ipv4 | 6078 | 0.995 |
| ipv6 | 3139 | 0.999 |
| license_plate | 4083 | 0.966 |
| mac_address | 4250 | 0.996 |
| medical_record_number | 11098 | 0.970 |
| national_id | 2848 | 0.925 |
| password | 6986 | 0.962 |
| person_name | 143624 | 0.979 |
| phone_number | 23963 | 0.962 |
| pin | 6456 | 0.891 |
| postcode | 6280 | 0.930 |
| ssn | 6062 | 0.948 |
| street_address | 16875 | 0.978 |
| swift_bic | 5559 | 0.987 |
| tax_id | 1302 | 0.866 |
| unique_id | 1777 | 0.784 |
| user_name | 15800 | 0.861 |
| vehicle_identifier | 4561 | 0.988 |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. La arquitectura usa tablas hash, acumuladores int16 y un MLP int8, pero el autor no publica requisitos de memoria.
- GPU recomendadas: no disponible. La model card no menciona GPU concretas.
- Compatibilidad con GPU de consumo: no disponible. La inferencia descrita es entera y en Rust, compatible con CPU, pero no se confirma hardware mínimo ni si requiere GPU.
- Opciones de despliegue: crate Rust `cynch-piitag`; se menciona una implementación de referencia en Python. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Tamaño del repositorio: 0.0 GB en HuggingFace; el tamaño real del fichero `.piitag` no está disponible.

## Comparativa con modelos similares
| Modelo | Span leak rate | Fully missed | Byte precision | Byte recall | PR-AUC | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| piitag | 0.0102 | 0.0064 | 0.770 | 0.979 | 0.975 | CC-BY-4.0 | .piitag v3 |
| linear baseline | 0.0169 | 0.0131 | 0.547 | 0.977 | 0.944 | no disponible | no disponible |

No se dispone de comparativas con otros taggers de PII en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo generativo: no puede usarse para chat, generación de texto, razonamiento general, código, matemáticas, visión ni audio.
- Precisión por byte de 0.770: aunque el recall es alto, hay falsos positivos que pueden requerir post-procesado o listas de permitidos.
- Tasa de fuga de spans de 0.0102 y tasa de spans completamente omitidos de 0.0064: no garantiza redacción perfecta.
- Contexto local limitado a 32 bytes a la izquierda y 32 a la derecha, con órdenes de contexto 1, 2 y 3; no captura dependencias de largo alcance.
- Tipos con accuracy baja: `unique_id` 0.784, `user_name` 0.861, `tax_id` 0.866, `fax_number` 0.868, `pin` 0.891, `device_identifier` 0.913, `national_id` 0.925, `postcode` 0.930.
- Idiomas soportados no disponibles. El dataset y el diccionario de nombres proceden de EE.UU., por lo que puede tener sesgo geográfico y lingüístico.
- El umbral `threshold_q = -14935` se ajustó en validación para 0.980 de recall por byte; cambiar el umbral altera el equilibrio entre precisión y recall.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario verificar el cumplimiento de atribución al dataset y al diccionario de nombres.
- El modelo depende de un diccionario de 152167 nombres y apellidos de EE.UU., lo que puede limitar la detección de nombres de otras regiones.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/scottmas/piitag
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Diccionario de nombres: `hadley/data-baby-names` (citado en la model card; no se proporciona URL completa)
- Apellidos del Census 2000: `fivethirtyeight/data` (citado en la model card; no se proporciona URL completa)
- Crate Rust: `cynch-piitag` (citado en la model card; no se proporciona URL completa)
