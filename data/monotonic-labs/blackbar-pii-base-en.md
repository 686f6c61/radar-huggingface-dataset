# monotonic-labs/blackbar-pii-base-en

## Resumen

Blackbar PII (base, English) es un clasificador de tokens en ingles especializado en deteccion de informacion personal identificable (PII), desarrollado por Monotonic Labs. Se construye como un fine-tuning de `answerdotai/ModernBERT-base` y se distribuye unicamente como grafo ONNX cuantizado en int8 de 210 MB, lo que permite ejecutarlo en CPU sin dependencias de PyTorch ni de `transformers`. El modelo etiqueta trece clases de datos personales en una sola pasada hacia delante, desde nombres y correos hasta numeros de cuenta, medicamentos y numeros de caso judicial.

La propuesta de valor es la eficiencia: sustituye en el pipeline interno del autor a dos modelos mayores (el privacy-filter de OpenAI y un modelo GLiNER, 2,3 GB en conjunto) por un unico clasificador de 149 millones de parametros que, segun la model card, es aproximadamente 2,9 veces mas rapido y produce alrededor de una cuarta parte de los falsos positivos. Procesa texto de longitud arbitraria mediante ventanas de 1.500 tokens con solapamiento de 128, y alcanza unos 1.400 palabras por segundo en 8 nucleos de CPU.

Es relevante para equipos que necesitan anonimizar o enmascarar documentos en produccion con requisitos de privacidad (RGPD, datos clinicos, expedientes legales) sin depender de GPU ni de infraestructura de inferencia pesada. La licencia Apache-2.0 y la ausencia de `trust_remote_code` simplifican su integracion y auditoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base), 22 capas, con cabeza lineal de 53 etiquetas |
| Parametros totales | 149 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Longitud arbitraria mediante ventanas de 1.500 tokens con solapamiento de 128 |
| Tipos de cuantizacion | int8 (ONNX cuantizado, 210 MB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`), mas `tokenizer.json`, `tagger.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer de 22 capas y 149 millones de parametros, sobre el que se anade una cabeza lineal de clasificacion de tokens con 53 etiquetas en esquema BIOES sobre 13 clases. Las clases se agrupan en tres bloques: general (`person`, `email`, `phone`, `address`, `date`, `url`, `account`, `secret`), medico (`medication`, `condition`, `procedure`) y legal (`case_number`, `party`). Ciertos tipos se pliegan en categorias existentes: tarjetas de pago y documentos de identidad se etiquetan como `account`, las direcciones IP como `url`, y contrasenas, claves de API y tokens como `secret`.

El entrenamiento se realizo sobre cuatro conjuntos de datos publicos: `nvidia/Nemotron-PII`, `gretelai/gretel-pii-masking-en-v1`, `mamahealth/mama-deid-dataset` y `E3-JSI/synthetic-multi-med-notes-ner-v1`. No se especifican en la informacion disponible el numero total de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable no esta en el entrenamiento sino en el pipeline de inferencia: el grafo ONNX por si solo no reproduce los resultados publicados, sino que requiere tres pasos que implementa la libreria `monotonic_pii.detect`: (1) calibracion de logits dividiendo por una temperatura de 1,4 y sumando un sesgo por etiqueta (3,0 en `medication`, 1,5 en `condition`, 2,0 en `procedure`) seguido de log-softmax; (2) decodificacion Viterbi restringida sobre las etiquetas BIOES para garantizar que cada span abra y cierre correctamente; y (3) ventaneo con solapamiento unido por el punto medio de cada solape.

## Capacidades

- Deteccion de PII en una sola pasada hacia delante sobre 13 clases, con salida de offsets de caracter y confianza por span (probabilidad del token menos seguro).
- Etiquetado de entidades generales: personas, correos, telefonos, direcciones, fechas, URLs, cuentas y secretos.
- Etiquetado de entidades medicas: medicamentos, condiciones y procedimientos.
- Etiquetado de entidades legales: numeros de caso y partes procesales.
- Procesamiento de texto de longitud arbitraria mediante ventanas solapadas.
- Inferencia en CPU sin PyTorch ni `transformers`, solo con `numpy`, `onnxruntime` y `tokenizers`.
- Decodificacion estructurada (Viterbi restringido) que evita spans mal formados.
- No incluye soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales: es un clasificador de tokens, no un modelo generativo.

## Casos de uso

- Anonimizacion de expedientes clinicos: el modelo detecta medicamentos, condiciones y procedimientos ademas de nombres y contactos, lo que permite enmascarar historiales medicos antes de compartirlos con terceros o de almacenarlos en entornos menos controlados.
- Redaccion de documentos legales: la deteccion de `case_number` y `party` facilita la seudonimizacion de sentencias y escritos judiciales; el rendimiento en nombres sobre el corpus TAB (F1 de solapamiento 0,957) respalda este uso.
- Scrubbing de correos y comunicaciones internas: con F1 exacto de 1,000 en `email` y 0,998 en `address` sobre PII-TRACE, es adecuado para pipelines de cumplimiento que deban eliminar datos de contacto de tickets o bases de conocimiento.
- Enmascaramiento de secretos en logs y repositorios: la clase `secret` cubre contrasenas, claves de API y tokens, con recall exacto de 0,776 y precision de 1,000 en PII-TRACE, util para preprocesar logs antes de enviarlos a sistemas de observabilidad.
- Cumplimiento del RGPD en ingesta de datos: al ejecutarse en CPU a 1.400 palabras por segundo en 8 nucleos, puede desplegarse como paso previo a la indexacion o al envio a modelos generativos, reduciendo el coste frente a soluciones basadas en GPU.
- Procesamiento por lotes de grandes volumenes documentales: el grafo int8 de 210 MB y la ausencia de dependencias pesadas permiten contenedores ligeros y escalado horizontal sencillo en maquinas sin acelerador.
- Preetiquetado para revision humana: las confianzas por span permiten priorizar la revision manual en los casos de menor certeza, acelerando flujos de anotacion supervisada.

## Benchmarks y rendimiento

Resultados de precision, recall y F1 a nivel de span, con el modelo solo y sin reglas adicionales. "Exact" exige la misma clase y los mismos offsets de inicio y fin; "Overlap" exige la misma clase y cualquier caracter compartido.

| Corpus | Descripcion | F1 exacto | F1 solapamiento |
|---|---|---|---|
| PII-TRACE | 500 conversaciones sinteticas, 2.442 spans, no visto en entrenamiento | 0,915 | 0,940 |
| TAB (test) | 127 sentencias judiciales reales, 1.063 nombres, solo nombres | no comparable | 0,957 |
| Nemotron-PII (test) | 6.208 documentos, 21.538 spans, su split de train si se entreno | 0,987 | 0,993 |

Desglose por clase en PII-TRACE:

| Clase | Spans | Precision exacta | Recall exacto | F1 exacto | F1 solapamiento |
|---|---|---|---|---|---|
| `email` | 392 | 1,000 | 1,000 | 1,000 | 1,000 |
| `address` | 222 | 0,996 | 1,000 | 0,998 | 0,998 |
| `date` | 221 | 1,000 | 0,986 | 0,993 | 0,993 |
| `person` | 748 | 0,909 | 0,973 | 0,940 | 0,975 |
| `phone` | 218 | 0,940 | 0,940 | 0,940 | 1,000 |
| `url` | 207 | 0,898 | 0,855 | 0,876 | 0,970 |
| `secret` | 210 | 1,000 | 0,776 | 0,874 | 0,874 |
| `account` | 224 | 0,648 | 0,362 | 0,464 | 0,476 |

La comparacion con otros modelos publicos queda incompleta en la informacion disponible: la model card menciona que se realizo una comparacion con modelos publicos sobre los mismos documentos, pero el contenido proporcionado se interrumpe antes de exponer esos resultados.

## Requisitos de hardware

- VRAM: no requiere GPU; el grafo int8 de 210 MB se ejecuta en CPU.
- Memoria RAM: no especificada en la informacion disponible; el tamano del grafo y del tokenizador sugiere un consumo modesto, pero no se aporta una cifra concreta.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU. Podria ejecutarse en GPU via ONNX Runtime, pero no se documenta.
- Cabe en cualquier CPU consumer: el autor reporta unos 1.400 palabras por segundo en 8 nucleos.
- Opciones de despliegue: ONNX Runtime con la libreria `monotonic_pii.detect` incluida en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder de clasificacion).
- Latencia y throughput: aproximadamente 1.400 palabras por segundo en 8 nucleos de CPU; cada ventana de 1.500 tokens se ejecuta como una llamada al modelo independiente con el grafo int8, y la salida puede variar ligeramente segun que otras ventanas compartan la llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Blackbar PII base-en | 149 M | ventanas de 1.500 tokens | Clasificacion de tokens, 13 clases | Apache-2.0 | ONNX int8 |
| privacy-filter de OpenAI | no disponible | no disponible | Deteccion de PII | no disponible | no disponible |
| GLiNER (modelo usado por el autor) | no disponible | no disponible | NER zero-shot | no disponible | no disponible |

La model card indica que Blackbar sustituye en el pipeline del autor a los dos modelos anteriores (2,3 GB en conjunto) con una mejora de aproximadamente 2,9 veces en velocidad y una reduccion de falsos positivos de aproximadamente el 75 %. No se dispone en la informacion proporcionada de las especificaciones detalladas de esos dos modelos ni de una comparacion cuantitativa completa con alternativas publicas.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta rendimiento en otros idiomas.
- La clase `account` es claramente la mas debil: F1 exacto de 0,464 y recall exacto de 0,362 en PII-TRACE, lo que la hace poco fiable para detectar tarjetas de pago y documentos de identidad sin reglas adicionales.
- La clase `secret` tiene precision perfecta pero recall exacto de 0,776: deja escapar aproximadamente una de cada cinco entidades de ese tipo.
- `url` muestra precision y recall moderados (0,876 F1 exacto), con confusiones posibles con direcciones IP, que se etiquetan en esa misma clase.
- El modelo siempre emite las trece clases; es responsabilidad del integrador descartar los grupos que no necesite, lo que puede generar etiquetas no deseadas si no se filtra.
- Los resultados publicados dependen del pipeline completo (calibracion, Viterbi y ventaneo); usar el grafo ONNX con un argmax simple produce spans distintos, algunos mal formados, y no reproduce las cifras de la model card.
- En el corpus TAB las etiquetas incluyen titulos ("Mr", "Dr") en 843 de 1.063 nombres, mientras que este modelo los excluye; por eso solo la metrica de solapamiento es comparable en ese conjunto.
- No se han publicado en la informacion disponible datos sobre sesgos demograficos, tasas de alucinacion (no aplica a un clasificador) ni evaluaciones de robustez ante texto adversario.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni documenta el proceso de validacion en dominios distintos de los corpus evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/monotonic-labs/blackbar-pii-base-en
- Modelo base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset PII-TRACE: https://huggingface.co/datasets/perplexity-ai/PII-TRACE
- Dataset TAB (text-anonymization-benchmark): https://huggingface.co/datasets/mattmdjaga/text-anonymization-benchmark-val-test
- Dataset Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset Gretel PII masking: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Dataset mama-deid: https://huggingface.co/datasets/mamahealth/mama-deid-dataset
- Dataset synthetic-multi-med-notes-ner-v1: https://huggingface.co/datasets/E3-JSI/synthetic-multi-med-notes-ner-v1
