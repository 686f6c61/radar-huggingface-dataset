# dekka-cloud/veil-ner-deep

## Resumen

Veil NER deep es un modelo de reconocimiento de entidades nombradas (NER) especializado en la deteccion de informacion personal identificable (PII) en texto ghanes. Desarrollado por Dekka (Accra, Ghana) como parte de su plataforma Dekka Veil, el modelo resuelve el problema de enmascarar datos sensibles antes de que el texto salga de los sistemas del cliente, cubriendo identificadores especificos de Ghana como Ghana Card PIN, numeros de mobile money y direcciones GhanaPost GPS.

El modelo esta construido sobre `microsoft/mdeberta-v3-base` y se distribuye exclusivamente en formato ONNX, con un peso de repositorio de 0,6 GB (536 MB segun la model card). Cubre seis idiomas: ingles, twi, fante, ga, ewe y pidgin ghanes, incluyendo el code-switching habitual entre ellos. Es la variante precisa de la familia, pensada para procesamiento por lotes de documentos y transcripciones en CPU, con un coste de 1,2 a 1,5 s por kilobyte de texto en un solo hilo de un Apple M1 de 2020.

Su relevancia actual radica en que cubre un hueco que las herramientas genericas de PII (Presidio, GLiNER) no atienden: identificadores nacionales y linguisticos de Ghana, con una tasa de falsos positivos muy baja sobre texto real. La licencia CC-BY-4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mDeBERTa-v3-base), exportado a ONNX para token classification |
| Parametros totales | no disponible (modelo base mdeberta-v3-base, ~278M; el repositorio distribuido pesa 536 MB en ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas deslizantes de 256 tokens con solapamiento (configurado en `manifest.yaml`) |
| Tipos de cuantizacion | no disponible (se distribuye como artefacto ONNX; no se detallan variantes cuantizadas en la informacion proporcionada) |
| Idiomas soportados | en, tw, fat, gaa, ee, gpe (ingles, twi, fante, ga, ewe, pidgin ghanes) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (con tokenizer y `manifest.yaml`; inferencia via `onnxruntime`) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/mdeberta-v3-base`, un encoder transformer multilingue con atencion disentangled propia de la familia DeBERTa-v3, adaptado a token classification y exportado a ONNX para inferencia en CPU sin dependencia de frameworks de deep learning pesados. La decodificacion de spans (extraccion de entidades con offsets de caracteres y scores de confianza) se realiza mediante el script `veil_ner.py` incluido en el repositorio, que lee la configuracion desde `manifest.yaml`: etiquetas, tamano de ventana del tokenizer y umbral de confianza (0,80). El texto largo se procesa en ventanas solapadas de 256 tokens.

No se detallan en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en NER). La model card menciona evaluacion sobre conjuntos sinteticos ghaneses, frases de llamadas reales con detalles sinteticos y transcripciones reales de llamadas, asi que el entrenamiento parece apoyarse en datos sinteticos aumentados con texto real. El conjunto de etiquetas cubre 16 clases: `PERSON_NAME`, `PERSON_ALIAS`, `ACCOUNT_HOLDER_NAME`, `ADDRESS`, `GH_DIGITAL_ADDRESS`, `GH_MOBILE_NUMBER`, `GH_LANDLINE_NUMBER`, `EMAIL_ADDRESS`, `IP_ADDRESS`, `GH_GHANA_CARD_PIN`, `GH_TAX_IDENTIFIER`, `BANK_ACCOUNT_NUMBER`, `PAYMENT_CARD_PAN`, `GH_VEHICLE_REGISTRATION`, `PATIENT_ID`, `STUDENT_ID` y `EMPLOYEE_ID`.

## Capacidades

- Deteccion de nombres de persona, alias y nombre del titular de cuenta.
- Deteccion de direcciones postales en texto libre y direcciones digitales GhanaPost GPS.
- Deteccion de numeros de movil y fijo ghaneses, incluidos numeros dictados como palabras en ingles, akan o ewe.
- Deteccion de correos electronicos y direcciones IP.
- Deteccion de identificadores nacionales y financieros: Ghana Card PIN, TIN, numero de cuenta bancaria, PAN de tarjeta de pago y matricula de vehiculo.
- Deteccion de identificadores institucionales: paciente, estudiante y empleado.
- Procesamiento multilingue con code-switching entre ingles, twi, fante, ga, ewe y pidgin ghanes.
- Salida estructurada por span: etiqueta, offsets de caracteres, texto y score de confianza.
- Descarte de falsos positivos por diseno: no etiqueta toponimos aislados, numeros de centralita de organizaciones ni matriculas de buses publicos.
- Inferencia en CPU sin GPU, via ONNX Runtime.
- Integracion con reglas de validacion de identificadores estructurados dentro de Dekka Veil (mejora conjunta de cobertura y reduccion de falsos positivos).

## Casos de uso

- Anonimizacion de historiales clinicos: el modelo detecta `PATIENT_ID`, nombres y telefonos en notas y transcripciones antes de enviarlas a un proveedor de IA o a un repositorio de analitica, cumpliendo requisitos de proteccion de datos.
- Redaccion de PII en transcripciones de call centers: procesamiento por lotes de transcripciones reales de llamadas (el modelo se evaluo sobre 497 frases reales), enmascarando nombres y numeros con un coste de 1,2-1,5 s por KB que encaja en pipelines nocturnos.
- Cumplimiento de la Ghana Data Protection Act: preprocesado de documentos corporativos para eliminar Ghana Card PIN, TIN y numeros de mobile money antes de archivarlos o compartirlos con terceros.
- Enmascaramiento previo a gateways de IA: como segunda capa de precision detras de `veil-ner-nano` en flujos donde la exactitud sobre nombres importa mas que la latencia, por ejemplo en la construccion de datasets de entrenamiento anonimizados.
- Procesamiento de documentacion financiera: deteccion de PAN de tarjetas, cuentas bancarias y nombres de titulares en extractos, recibos y correspondencia para su redaccion antes de auditorias externas.
- Preparacion de corpus multilingues para investigacion: anonimizacion de texto en twi, ewe, ga y pidgin ghanes antes de publicar datasets o compartirlos con colaboradores, gracias a la cobertura de estos idiomas que las herramientas genericas no ofrecen.
- Moderacion y registro de conversaciones: filtrado de datos personales en logs de chat de comunidades ghanesas donde conviven ingles y lenguas locales en el mismo mensaje.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, medidos sobre los mismos conjuntos y maquina para los tres sistemas comparados:

| Conjunto | Medida | Veil NER deep | GLiNER PII small | Presidio |
|---|---|---|---|---|
| Test sintetico ghanes, 3.000 registros | Detalles cubiertos por completo | 90,7% | 68,6% | 70,7% |
| Test sintetico ghanes, 3.000 registros | Caracteres legibles restantes | 5,6% | 37,9% | 35,8% |
| Frases reales de llamadas con detalles sinteticos, 600 registros | Detalles cubiertos por completo | 100% | 48,8% | 74,0% |
| Frases reales de llamadas con detalles sinteticos, 600 registros | Caracteres legibles restantes | 0% | 69,0% | 48,1% |
| Frases reales de llamadas con detalles sinteticos, 600 registros | Senuelos mal marcados, de 88 | 0 | 0 | 67 |
| Transcripciones reales de llamadas, 497 frases | Nombres encontrados, de 15 | 12 | 0 | 15 |
| Transcripciones reales de llamadas, 497 frases | Elementos mal marcados como personales | 0 | 3 | 255 |

Resultados en MasakhaNER 2.0 (split de test, texto periodistico real):

| Idioma | Recall | Precision |
|---|---|---|
| Twi | 63,7% | 67,0% |
| Ewe | 79,4% | 91,9% |

Resultados combinando el modelo con las reglas de validacion de Dekka Veil:

| Conjunto | Medida | Modelo solo | Modelo + reglas |
|---|---|---|---|
| Test sintetico ghanes | Detalles cubiertos por completo | 90,7% | 95,8% |
| Test sintetico ghanes | Caracteres legibles restantes | 5,6% | 2,2% |
| Test sintetico ghanes | Senuelos mal marcados, de 471 | 1 | 0 |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para inferencia en CPU via ONNX Runtime.
- Memoria: funciona en equipos con 8 GB de RAM (referencia del autor: Apple M1 de 2020 con 8 GB).
- GPU: innecesaria. Si se desea acelerar, ONNX Runtime soporta execution providers de CUDA y CoreML, aunque no se publican cifras de rendimiento en GPU.
- Latencia de referencia: 1,2-1,5 s por kilobyte de texto en un solo hilo de CPU M1. La variante `veil-ner-nano` de la misma familia tarda unos 40 ms, adecuada para flujos interactivos.
- Despliegue: `onnxruntime`, `tokenizers`, `numpy` y `huggingface_hub`; script CLI incluido (`python veil_ner.py --model dekka-cloud/veil-ner-deep "texto"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un encoder ONNX de token classification).
- Throughput: no disponible mas alla de la latencia por kilobyte indicada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Veil NER deep | Encoder transformer ONNX (mDeBERTa-v3-base) | ~278M (base) | ventanas de 256 tokens | CC-BY-4.0 | PII especifica de Ghana, 6 idiomas |
| GLiNER PII small | Modelo abierto zero-shot | no disponible | no disponible | no disponible | PII generica multilingue |
| Presidio | Basado en reglas + NER | no aplica | no disponible | MIT (proyecto Microsoft) | PII generica, reglas configurables |
| veil-ner-nano | Variante rapida de la misma familia | no disponible | ventanas (no detallado) | no disponible en la informacion | PII ghanesa, ~40 ms de latencia |

Frente a GLiNER y Presidio, Veil NER deep cubre mas PII ghanesa y deja menos texto legible en los conjuntos medidos, con cero falsos positivos sobre transcripciones reales. Frente a `veil-ner-nano`, sacrifica latencia por precision sobre nombres (67,0% de precision en Twi y 91,9% en Ewe en MasakhaNER 2.0).

## Limitaciones y advertencias

- El modelo esta especializado en Ghana: su cobertura de identificadores fuera de ese contexto nacional es limitada, y las etiquetas `GH_*` no aplican a otros paises.
- En MasakhaNER 2.0 Twi el recall es del 63,7%, por debajo del 79,4% en Ewe; parte de los nombres en twi puede quedar sin enmascarar.
- La latencia de 1,2-1,5 s por KB lo descarta para flujos interactivos; para esos casos el autor remite a `veil-ner-nano`.
- El procesamiento en ventanas de 256 tokens puede partir entidades que crucen el limite de ventana, aunque el solapamiento mitiga parcialmente el problema.
- No se documentan sesgos especificos ni evaluaciones de robustez adversarial en la informacion proporcionada.
- Riesgo de alucinacion de spans: el modelo puede marcar texto como PII con confianza alta cuando no lo es; el umbral de 0,80 es configurable pero no elimina el riesgo, y se recomienda validacion con reglas para identificadores estructurados.
- La licencia CC-BY-4.0 exige atribucion en uso comercial; no hay clausula de uso aceptable adicional documentada.
- El modelo esta disenado como capa de enmascaramiento, no como garantia de cumplimiento normativo; su salida debe integrarse en un flujo con auditoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dekka-cloud/veil-ner-deep
- Variante rapida: https://huggingface.co/dekka-cloud/veil-ner-nano
- Plataforma Dekka Veil: https://dekka.cloud/veil
- Dekka: https://dekka.cloud
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- GLiNER PII small: https://huggingface.co/knowledgator/gliner-pii-small-v1.0
- Presidio: https://github.com/microsoft/presidio
- MasakhaNER 2.0: https://github.com/masakhane-io/masakhane-ner
