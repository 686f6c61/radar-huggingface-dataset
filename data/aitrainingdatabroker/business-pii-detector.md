# aitrainingdatabroker/business-pii-detector

## Resumen

Business PII Detector es un modelo de clasificación de tokens (reconocimiento de entidades nombradas) especializado en la detección de datos personales en texto empresarial: tickets de soporte, correos electrónicos, registros de chat, notas de CRM y notas de pedido. Lo desarrolla AI Training Data Broker, un intermediario y asesor técnico para empresas que licencian sus datos a laboratorios de IA, y está pensado como primera pasada en procesos de desidentificación antes de compartir registros con terceros.

Técnicamente es un fine-tuning de `distilroberta-base` (81.547.033 parámetros totales según los pesos en safetensors) para la tarea `token-classification`, con licencia Apache 2.0 y soporte exclusivo de inglés. Detecta tanto identificadores directos (nombres, correos, teléfonos, direcciones, tarjetas, IP, URL) como cuasi-identificadores, es decir, combinaciones de atributos que en conjunto señalan a una persona concreta.

Su relevancia actual es práctica: la desidentificación es un paso previo obligatorio en la venta o cesión de datos para entrenamiento, y buena parte de los identificadores aparece en texto libre, adjuntos y firmas, donde las reglas basadas en expresiones regulares fallan. El modelo se publica junto con los datasets sintéticos, los scripts de entrenamiento y las puntuaciones, y con una demo que se ejecuta localmente en el navegador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, `distilroberta-base`) para etiquetado de tokens |
| Parámetros totales | 81.547.033 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base `distilroberta-base` usa posiciones absolutas hasta 514 tokens; no confirmado por el autor) |
| Tipos de cuantización | no disponible; el repo incluye pesos ONNX además de safetensors |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `distilroberta-base`, un encoder transformer derivado de RoBERTa mediante destilación, y se fine-tunea para etiquetado de tokens con 13 tipos de entidad: `ADDRESS`, `CARD_NUMBER`, `DATE`, `EMAIL`, `ID_NUMBER`, `IP_ADDRESS`, `MONEY`, `ORG`, `PERSON`, `PHONE`, `QUASI_IDENTIFIER` y `URL`, además de la clase exterior. El entrenamiento se realizó durante 8 épocas en una única RTX 3070, lo que sitúa el coste de reproducción al alcance de un equipo pequeño.

Los datos son íntegramente sintéticos: el dataset `synthetic-deidentification-pairs` y `pii-span-benchmark-hard` (1500 filas), con formatos de estilo estadounidense. El autor indica que todos los nombres, números y direcciones son inventados y que nada procede de personas, pacientes, clientes o empresas reales. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional; se trata de un fine-tuning estándar de NER. El repositorio incluye en `source/` los scripts de generación de datos, entrenamiento y evaluación, y en `scores.json` las puntuaciones completas.

## Capacidades

- Detección de identificadores directos en texto libre: nombres de persona (`PERSON`), correos (`EMAIL`), teléfonos (`PHONE`), direcciones postales (`ADDRESS`), URLs (`URL`) e IP (`IP_ADDRESS`).
- Detección de identificadores financieros y administrativos: números de tarjeta (`CARD_NUMBER`), importes (`MONEY`), fechas (`DATE`) y números de pedido o identificador (`ID_NUMBER`).
- Detección de organizaciones y empresas cliente (`ORG`), relevante en notas de CRM y presupuestos.
- Detección de cuasi-identificadores (`QUASI_IDENTIFIER`): combinaciones como un cargo junto a una localidad pequeña que, por separado, no identificarían a nadie pero en conjunto sí.
- Etiquetado a nivel de span con puntuación de confianza por entidad, apto para flujos de revisión humana.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un extractor de entidades.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- Sin capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Desidentificación previa a la cesión de datos: el modelo actúa como primera pasada sobre tickets, correos y notas de CRM para localizar candidatos a sustituir antes de que un revisor humano aplique la seudonimización y la comprobación de reidentificación.
- Cumplimiento en atención al cliente: permite marcar automáticamente correos, teléfonos y nombres en transcripciones de chat y correos de soporte antes de archivarlos o usarlos para análisis agregado.
- Preparación de datasets para entrenamiento: en pipelines que exportan registros empresariales a un laboratorio de IA, el modelo filtra identificadores directos y cuasi-identificadores en texto libre, un punto ciego habitual de los filtros basados en expresiones regulares.
- Anonimización de notas de pedido y logística: detecta nombres, direcciones, importes y números de pedido en notas de reparto o traspaso, manteniendo el contenido operativo del registro.
- Auditoría interna de privacidad: ejecución por lotes sobre muestras de repositorios documentales para medir cuánta información personal circula en texto libre y priorizar la revisión.
- Preprocesado en flujos regulados (HIPAA, CCPA/CPRA, GDPR): como capa técnica de detección que alimenta la revisión de cumplimiento, nunca como sustituto del criterio legal ni de la certificación por experto cualificado.
- Detección en adjuntos y firmas de correo: al operar sobre texto plano, puede aplicarse a cuerpos de correo y firmas extraídas antes de su indexación o publicación.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre coincidencia exacta de entidad en 300 filas reservadas:

| Tipo | Precision | Recall | F1 | Count |
|---|---|---|---|---|
| `ADDRESS` | 1.0 | 1.0 | 1.0 | 48 |
| `CARD_NUMBER` | 1.0 | 1.0 | 1.0 | 30 |
| `DATE` | 1.0 | 1.0 | 1.0 | 123 |
| `EMAIL` | 1.0 | 1.0 | 1.0 | 113 |
| `ID_NUMBER` | 1.0 | 1.0 | 1.0 | 49 |
| `IP_ADDRESS` | 1.0 | 1.0 | 1.0 | 62 |
| `MONEY` | 1.0 | 1.0 | 1.0 | 48 |
| `ORG` | 1.0 | 1.0 | 1.0 | 113 |
| `PERSON` | 1.0 | 1.0 | 1.0 | 317 |
| `PHONE` | 1.0 | 1.0 | 1.0 | 96 |
| `QUASI_IDENTIFIER` | 1.0 | 1.0 | 1.0 | 61 |
| `URL` | 1.0 | 1.0 | 1.0 | 31 |

Prueba cruzada sobre 220 frases de un generador distinto (conjunto de test del HIPAA PHI Detector, contando solo los tipos compartidos: persona, teléfono, correo, fecha, IP y URL):

| Métrica | Valor |
|---|---|
| Precision | 0.791 |
| Recall | 0.987 |
| F1 | 0.878 |

El propio autor advierte que las puntuaciones perfectas del test interno reflejan que el conjunto de evaluación procede de los mismos generadores que los datos de entrenamiento, por lo que la prueba cruzada es la referencia más fiable. No se han publicado comparaciones con otros modelos de NER en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 (81,5 M de parámetros, unos 326 MB de pesos) y en torno a 100-200 MB en cuantización de 8 bits; el repo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor entrenó en una RTX 3070. Para lotes grandes, una A100 o H100 aporta throughput, no capacidad.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con pipeline `token-classification`, ONNX Runtime (hay pesos ONNX en el repo), y servidores compatibles con la API de Hugging Face (el tag `endpoints_compatible` lo indica). No se documenta soporte específico de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, la latencia por frase es del orden de milisegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Business PII Detector | 81,5 M | no disponible | en | Apache 2.0 | NER de PII y cuasi-identificadores en texto empresarial, datos sintéticos |
| `distilbert-base-NER` (base de la familia) | ~66 M | 512 tokens | en | Apache 2.0 | NER genérico (PER, ORG, LOC, MISC), sin tipos de PII específicos |
| `dslim/bert-base-NER` | ~110 M | 512 tokens | en | MIT | NER genérico de cuatro categorías, sin cuasi-identificadores ni números de tarjeta |
| HIPAA PHI Detector (referenciado por el autor) | no disponible | no disponible | en | no disponible | Detección de PHI en ámbito sanitario; usado como conjunto de prueba cruzada |

La diferencia principal frente a los NER genéricos es la taxonomía: el modelo cubre tipos que los NER estándar no etiquetan (tarjetas, IP, importes, números de pedido, cuasi-identificadores) y está entrenado con texto de negocio sintético. No se dispone de comparaciones de rendimiento publicadas frente a estas alternativas.

## Limitaciones y advertencias

- Entrenado solo con texto inglés inventado y formatos estadounidenses; el texto empresarial real es más ruidoso y puede incluir formatos internacionales no cubiertos.
- Las puntuaciones perfectas del test interno son engañosas porque el conjunto de evaluación comparte generadores con el entrenamiento; la prueba cruzada (F1 0.878, precision 0.791) es la referencia realista.
- La precision de 0.791 en la prueba cruzada implica falsos positivos: en un flujo de desidentificación conviene revisión humana y umbrales de confianza ajustados.
- Detecta entidades, pero no decide con qué sustituirlas: los marcadores consistentes, la generalización de fechas y regiones y la comprobación de reidentificación son pasos separados.
- No es asesoramiento legal ni certificación: determinar si un método cumple HIPAA Safe Harbor o Expert Determination, CCPA/CPRA, GDPR, PIPEDA o la Ley 25 de Quebec corresponde al asesor jurídico y, cuando la norma lo exige, a un experto cualificado.
- Solo inglés; cualquier texto en otro idioma queda fuera de su ámbito declarado.
- Riesgo de alucinación de spans: como todo modelo NER, puede etiquetar como PII fragmentos que no lo son o perder variantes poco frecuentes (nombres no occidentales, formatos de teléfono no estadounidenses).
- El modelo tiene un uso muy bajo (46 descargas, 0 likes) y fue creado en octubre de 2026; no hay validación independiente publicada.
- La licencia Apache 2.0 permite uso comercial, pero el autor solicita atribución a AI Training Data Broker y enlace a su sitio al compartir o construir sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aitrainingdatabroker/business-pii-detector
- Demo en el navegador: https://huggingface.co/spaces/aitrainingdatabroker/business-pii-detector-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/aitrainingdatabroker/synthetic-deidentification-pairs
- Dataset de benchmark: https://huggingface.co/datasets/aitrainingdatabroker/pii-span-benchmark-hard
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Artículo sobre desidentificación de datos empresariales: https://aitrainingdatabroker.com/de-identification/
- Artículo sobre por qué los datos seudonimizados no son anónimos: https://aitrainingdatabroker.com/blog/why-pseudonymized-data-isnt-anonymous-and-codes-fail-law/
- Sitio del autor: https://aitrainingdatabroker.com/
