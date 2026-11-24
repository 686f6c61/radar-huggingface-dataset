# dekka-cloud/veil-ner-nano

## Resumen

Veil NER nano es un modelo de reconocimiento de entidades nombradas (NER) especializado en información personal identificable (PII) en texto ghanés. Lo desarrolla Dekka, con sede en Acra, y está diseñado para detectar y enmascarar datos sensibles antes de que el texto salga de los sistemas del usuario. Se distribuye en formato ONNX y deriva del modelo base `microsoft/deberta-v3-xsmall`, lo que lo sitúa en la categoría de modelos pequeños y ligeros.

El modelo cubre seis lenguas: inglés, twi, fante, ga, ewe y pidgin ghanés, incluyendo el code-switching habitual entre ellas. Además de entidades genéricas como nombres o direcciones, reconoce identificadores específicos de Ghana: PIN de Ghana Card, números de mobile money, direcciones GhanaPost GPS, identificadores fiscales o matrículas de vehículos, entre otros.

Su relevancia radica en el despliegue: con 56 MB y unos 40 ms por kilobyte de texto en un solo hilo de CPU (Apple M1 de 2020, 8 GB), puede situarse delante de cada petición sin necesidad de GPU. Es el modelo rápido de la familia Dekka Veil; su hermano mayor, `veil-ner-deep`, prioriza la precisión en nombres twi y ewe para procesamiento por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de microsoft/deberta-v3-xsmall) exportado a ONNX |
| Parametros totales | no disponible (modelo base deberta-v3-xsmall; tamano del repo 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas deslizantes de 256 tokens con solapamiento |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el modelo base aparece etiquetado como quantized) |
| Idiomas soportados | en, tw (twi), fat (fante), gaa (ga), ee (ewe), gpe (pidgin ghanes) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (con tokenizer y manifest.yaml; script veil_ner.py) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo DeBERTa v3 (variante xsmall) convertido a ONNX para inferencia en CPU. La decodificación de spans se realiza mediante un script propio, `veil_ner.py`, que lee `manifest.yaml` para obtener las etiquetas, la ventana del tokenizer y el umbral de confianza (0,82). El texto largo se procesa en ventanas solapadas de 256 tokens y cada span devuelto incluye etiqueta, offsets de caracteres, texto y puntuación de confianza.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card sí describe el conjunto de etiquetas (personas, direcciones, contactos, identificadores nacionales y financieros, e identificadores institucionales) y menciona que el modelo se acompaña de reglas de validación en el producto Dekka Veil. Tampoco se especifican innovaciones técnicas adicionales más allá del empaquetado ONNX y la decodificación por ventanas.

## Capacidades

- Detección de PII en texto ghanés: nombres (`PERSON_NAME`, `PERSON_ALIAS`, `ACCOUNT_HOLDER_NAME`), direcciones (`ADDRESS`, `GH_DIGITAL_ADDRESS`), contactos (`GH_MOBILE_NUMBER`, `GH_LANDLINE_NUMBER`, `EMAIL_ADDRESS`, `IP_ADDRESS`).
- Identificadores nacionales y financieros: `GH_GHANA_CARD_PIN`, `GH_TAX_IDENTIFIER`, `BANK_ACCOUNT_NUMBER`, `PAYMENT_CARD_PAN`, `GH_VEHICLE_REGISTRATION`.
- Identificadores institucionales: `PATIENT_ID`, `STUDENT_ID`, `EMPLOYEE_ID`.
- Reconocimiento de números de teléfono dictados como palabras en inglés, akan o ewe.
- Soporte multilingüe y de code-switching entre inglés, twi, fante, ga, ewe y pidgin ghanés.
- Salida con offsets de caracteres y puntuación de confianza por span, apta para enmascarado selectivo.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de clasificación de tokens, no generativo.

## Casos de uso

- Pasarela de privacidad delante de un LLM: el modelo se ejecuta en CPU en unos 40 ms/KB y enmascara PII antes de reenviar la petición a un modelo generativo externo, evitando fugas de datos.
- Cumplimiento de protección de datos en atención al cliente: permite redactar nombres, teléfonos y PIN de Ghana Card en transcripciones de llamadas antes de almacenarlas o analizarlas.
- Anonimización de historiales clínicos: detecta `PATIENT_ID` y nombres de pacientes en texto mixto inglés-twi, adecuado para entornos hospitalarios con recursos limitados.
- Procesamiento de registros financieros: identifica números de cuenta bancaria, PAN de tarjetas y números de mobile money en extractos o formularios.
- Enmascarado en pipelines de datos a gran escala: su tamaño (56 MB) y su ejecución en CPU permiten integrarlo en procesos batch sin coste de GPU.
- Filtrado previo en aplicaciones de mensajería o formularios: detección en tiempo real de identificadores ghaneses (GhanaPost GPS, matrículas, TIN) antes de persistir el texto.
- Investigación en PLN de lenguas ghanesas: útil como componente de NER para twi, ewe o ga en tareas de protección de datos, con la advertencia de su menor precisión en twi.

## Benchmarks y rendimiento

Resultados publicados en la model card (comparados con GLiNER PII small y Presidio):

| Conjunto | Medida | Veil NER nano | GLiNER PII small | Presidio |
|---|---|---|---|---|
| Test sintetico ghanes, 3.000 registros | Detalles cubiertos por completo | 91,2% | 68,6% | 70,7% |
| | Caracteres legibles restantes | 2,8% | 37,9% | 35,8% |
| Frases reales de llamadas con detalles sinteticos, 600 registros | Detalles cubiertos por completo | 100% | 48,8% | 74,0% |
| | Caracteres legibles restantes | 0% | 69,0% | 48,1% |
| | Senuelos marcados erroneamente (de 88) | 0 | 0 | 67 |
| Transcripciones reales de llamadas, 497 frases | Nombres encontrados (de 15) | 11 | 0 | 15 |
| | Elementos marcados erroneamente como personales | 0 | 3 | 255 |

Rendimiento en MasakhaNER 2.0 (noticias reales en twi y ewe):

| Idioma | Recall | Precision |
|---|---|---|
| Twi | 78,0% | 43,2% |
| Ewe | 82,8% | 66,9% |

Con las reglas de Dekka Veil, en el test sintético ghanés la cobertura completa sube del 91,2% al 96,7%.

## Requisitos de hardware

- Inferencia en CPU: unos 40 ms por kilobyte de texto en un solo hilo de Apple M1 con 8 GB de memoria.
- VRAM: no requiere GPU; el modelo ocupa 56 MB en disco y el repo completo 0,1 GB.
- GPU recomendadas: no necesarias. Cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja práctica frente a CPU.
- Cabe en cualquier equipo de consumo, incluidos portátiles modestos y dispositivos de borde.
- Despliegue: ONNX Runtime con las librerías `tokenizers`, `numpy` y `pyyaml`; el script `veil_ner.py` se carga directamente desde el repositorio descargado con `huggingface_hub`.
- Throughput y latencia: aproximadamente 40 ms/KB por hilo en M1; no se publican cifras adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| Veil NER nano | Encoder transformer ONNX | no disponible (base xsmall) | ventanas de 256 tokens | PII especifica de Ghana, 6 idiomas | CC-BY-4.0 |
| GLiNER PII small | Modelo abierto zero-shot | no disponible | no disponible | PII generica, zero-shot | no disponible |
| Presidio | Basado en reglas | no aplica | no aplica | PII generica mediante reglas | open source (MIT, segun el proyecto) |

En los conjuntos ghaneses medidos, Veil NER nano supera a ambos en cobertura y reduce los caracteres legibles restantes, con 0 falsos positivos en senuelos frente a 67 de Presidio. En transcripciones reales, GLiNER no encontró ninguno de los 15 nombres y Presidio los encontró todos a costa de 255 falsos positivos.

## Limitaciones y advertencias

- Precisión baja en twi: solo el 43,2% de lo marcado como nombre twi lo es realmente; el modelo tiende a sobreretener, un error conservador para privacidad pero problemático si se busca precisión.
- En transcripciones reales encontró 11 de 15 nombres, por lo que puede dejar pasar PII en texto conversacional.
- No etiqueta lugares aislados (por ejemplo, "Kumasi") porque por sí solos no identifican a nadie.
- Puede marcar números de centralita de organizaciones y matrículas de autobuses públicos; las reglas de Dekka Veil los descartan, pero no están incluidas en el modelo.
- Es un modelo de clasificación de tokens: no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la detección.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos exactos antes de producción.
- No se publican detalles sobre sesgos demográficos ni sobre el proceso de anotación del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dekka-cloud/veil-ner-nano
- Modelo hermano (mayor precisión): https://huggingface.co/dekka-cloud/veil-ner-deep
- Producto Dekka Veil: https://dekka.cloud/veil
- Sitio de Dekka: https://dekka.cloud
- Modelo base: https://huggingface.co/microsoft/deberta-v3-xsmall
- GLiNER PII small: https://huggingface.co/knowledgator/gliner-pii-small-v1.0
- Presidio: https://github.com/microsoft/presidio
- MasakhaNER 2.0: https://github.com/masakhane-io/masakhane-ner
