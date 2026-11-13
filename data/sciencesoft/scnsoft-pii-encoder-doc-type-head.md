# ScienceSoft/scnsoft-pii-encoder-doc-type-head

## Resumen

ScienceSoft/scnsoft-pii-encoder-doc-type-head es un modelo derivado del encoder de PII de ScienceSoft que anade una segunda salida, `doc_logits`, para clasificar ventanas de texto en 17 tipos de documento. Se distribuye como grafo ONNX cuantizado a int8 y se ejecuta con onnxruntime, por lo que esta pensado para despliegue en produccion con requisitos de latencia y memoria ajustados. El modelo base es FacebookAI/xlm-roberta-base, que permanece congelado; solo se anaden dos capas densas sobre el estado medio del encoder.

La relevancia de esta publicacion es que combina deteccion de datos personales (PII) y clasificacion documental en un unico grafo, de modo que un pipeline de DLP puede obtener ambas senales con una sola pasada de inferencia. Sin embargo, el propio autor la etiqueta como release candidate para monitorizacion de apoyo y no como herramienta de aplicacion: los pesos se publican para evaluacion y reproduccion, y la licencia es propietaria.

El modelo soporta siete idiomas (ingles, aleman, frances, italiano, espanol, ruso y arabe), tiene una ventana de 450 caracteres por inferencia y un tamano de repositorio de 0,3 GB. Solo cuatro de los 17 tipos de documento han sido evaluados, y unicamente en una metrica de falsos positivos sobre documentos benignos; el resto se presenta como sugerencia no validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) congelado + cabeza densa de clasificacion (768 -> 256 -> 17) sobre pooling medio |
| Parametros totales | no disponible (el encoder base XLM-RoBERTa tiene ~278M; la cabeza anade 768x256 + 256x17) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 450 caracteres por inferencia |
| Tipos de cuantizacion | int8 (grafo ONNX cuantizado, `onnx/model_quantized.onnx`) |
| Idiomas soportados | en, de, fr, it, es, ru, ar |
| Licencia | propietaria (`proprietary-sciencesoft`, licencia "other" con enlace a los terminos del encoder) |
| Formato de pesos | ONNX (onnxruntime) |

## Arquitectura y entrenamiento

La arquitectura es un encoder XLM-RoBERTa base congelado (revision `b1a36210f99ef293a4d42697ef6b2ba548dd9208`) al que se anade una cabeza de dos capas sobre el estado medio del encoder para una ventana de 450 caracteres: 768 a 256 con GELU exacta (implementada con `Erf`) y 256 a 17. El grafo ONNX liberado es el grafo del encoder de PII con nodos anadidos; ninguno de los nodos originales se modifica, y la salida `logits` de PII es byte-identica a la del encoder original en las 6.825 filas de la comprobacion de release, a batch size 1, en aarch64 Linux y Apple arm64 con onnxruntime 1.24.2 y 1.19.2.

El entrenamiento se realizo con una sola semilla (7001, la mas alta de tres semillas probadas en el split de desarrollo) y no se repitio con tres semillas. Los datos de entrenamiento no se publican. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un ajuste supervisado de clasificacion. El modelo incorpora un fichero `doc_labels.json` (version 2) con los 17 etiquetas en orden de salida y, por etiqueta, un modo (`rules` o `add`), umbrales `t_add`, `t_confirm`, `delta` y un estado que indica si el tipo esta evaluado o es una sugerencia no validada.

## Capacidades

- Clasificacion de tipo de documento en 17 categorias: acuerdos de confidencialidad y master agreements, statements of work, otros contratos, requests for proposals, propuestas, listas de precios, codigo fuente, documentos de diseno y seguridad, documentos financieros y de finanzas personales, expedientes de personal, documentos de estrategia, documentos publicados y registros de pacientes.
- Deteccion de PII mediante la salida `logits` heredada del encoder original, sin cambios respecto a la version previa.
- Clasificacion de tokens (pipeline `token-classification`) para la parte de PII.
- Capacidad multilingue en siete idiomas: ingles, aleman, frances, italiano, espanol, ruso y arabe.
- Inferencia en un unico grafo ONNX con dos salidas (`logits` y `doc_logits` de forma `[batch, 17]`).
- Modo de operacion hibrido con reglas: en modo `add`, la decision de un clasificador basado en reglas prevalece y la salida del modelo solo se reporta como tipo anadido cuando las reglas no encuentran nada y la puntuacion supera `t_add`.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Monitorizacion de DLP en correo corporativo: el modelo puntua ventanas de 450 caracteres para detectar PII y, en la misma pasada, sugiere el tipo de documento, de modo que un analista humano puede priorizar revisiones de documentos con posibles datos personales en contratos o expedientes.
- Triaje de bandejas de entrada legales: con la etiqueta `legal.nda` evaluada y un umbral `t_add` de 0,84, el sistema puede marcar mensajes que probablemente contengan acuerdos de confidencialidad para enrutarlos al equipo legal, manteniendo la decision final en manos del revisor.
- Clasificacion de repositorios y adjuntos de codigo: la etiqueta `tech.source_code` permite sugerir cuando un documento adjunto contiene codigo fuente, util para politicas de control de exportacion o para separar artefactos tecnicos del resto del corpus.
- Inventario documental en procesos de compliance: las etiquetas de contratos, propuestas y listas de precios permiten poblar un indice aproximado de documentos comerciales, siempre como sugerencia sujeta a validacion humana.
- Deteccion de documentos financieros y de finanzas personales: la etiqueta `finance.personal` ha superado la linea de falsos registros en documentos benignos, lo que permite usarla como senal de apoyo para localizar extractos o declaraciones que requieran tratamiento reforzado de privacidad.
- Procesamiento por lotes en infraestructura propia: al ser un grafo ONNX int8 de 279.041.365 bytes, puede ejecutarse con onnxruntime en servidores aarch64 o arm64 sin GPU dedicada, lo que facilita el despliegue en entornos con restricciones de hardware.
- Filtrado previo a la indexacion de un corpus multilingue: las siete lenguas soportadas permiten aplicar el mismo modelo a documentacion en ingles, aleman, frances, italiano, espanol, ruso y arabe antes de decidir que documentos entran en un indice de busqueda o en un repositorio regulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion reportada es el conteo de falsos registros sobre 18.075 documentos benignos en el umbral `t_add`, sin datos de recall, resultados por idioma ni comparacion con otros modelos.

| Etiqueta | Modo | `t_add` | Falsos registros | Estado |
|---|---|---|---|---|
| `legal.nda` | `add` | 0,84 | 1 de 18.075 | linea de falsos registros superada; nada mas evaluado |
| `legal.master_agreement` | `add` | 0,82 | 5 de 18.075 | sugerencia no validada |
| `legal.sow` | `add` | 0,87 | 1 de 18.075 | sugerencia no validada |
| `legal.contract_other` | `rules` | no aplica | 8 de 18.075 | no apto para monitorizacion: linea no superada |
| `sales.rfp` | `add` | 0,70 | 1 de 18.075 | sugerencia no validada |
| `sales.proposal` | `add` | 0,72 | 4 de 18.075 | sugerencia no validada |
| `sales.pricing` | `add` | 0,90 | 1 de 18.075 | sugerencia no validada |
| `tech.source_code` | `add` | no disponible en el extracto | no disponible | sugerencia no validada |
| `tech.design` | no disponible | no disponible | no disponible | evaluado en la linea de falsos registros |
| `tech.security` | no disponible | no disponible | no disponible | evaluado en la linea de falsos registros |
| `finance.personal` | no disponible | no disponible | no disponible | evaluado en la linea de falsos registros |
| `finance.report` | `add` | no disponible | 5 de 18.075 | sugerencia no validada |
| `finance.billing` | `add` | no disponible | no disponible | sugerencia no validada |
| `hr.personnel` | `add` | no disponible | no disponible | sugerencia no validada |
| `corporate.strategy` | `add` | no disponible | 12 de 18.075 | sugerencia no validada |
| `health.patient_record` | `add` | no disponible | 54 de 18.075 | sugerencia no validada |
| `public.published` | `rules` | no aplica | no disponible | sin valor de calibracion |

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo ONNX int8 ocupa 279.041.365 bytes (~266 MiB), por lo que la huella de memoria es muy reducida y cabe en CPU.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion con onnxruntime en CPU. Cualquier GPU con soporte de onnxruntime (por ejemplo, A100, H100 o RTX 4090) puede ejecutarlo, pero no se han publicado mediciones en GPU.
- Cabe en GPU de consumo: si, dado el tamano del grafo; no se han publicado pruebas especificas en tarjetas concretas.
- Opciones de despliegue: onnxruntime (libreria declarada), con soporte verificado en aarch64 Linux (host NVIDIA GB10) y Apple Mac arm64, con onnxruntime 1.24.2 y 1.19.2. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de rendimiento por lote; la comprobacion de release se hizo a batch size 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScienceSoft/scnsoft-pii-encoder-doc-type-head | no disponible (base XLM-RoBERTa ~278M) | ventana de 450 caracteres | PII + 17 tipos de documento | propietaria | Hugging Face, ONNX int8 |
| ScienceSoft/scnsoft-pii-encoder | mismo encoder base | ventana de 450 caracteres | solo PII | propietaria | Hugging Face |
| FacebookAI/xlm-roberta-base | ~278M | 512 tokens | encoder multilingue generico | MIT | Hugging Face |

La comparacion con alternativas de clasificacion documental de codigo abierto (por ejemplo, clasificadores basados en BERT o DeBERTa) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que es un release candidate para monitorizacion de apoyo, no una herramienta de aplicacion: ninguna puntuacion justifica bloquear, redactar o rechazar un documento.
- Solo cuatro tipos (`legal.nda`, `tech.design`, `tech.security` y `finance.personal`) han sido evaluados, y unicamente en una metrica de falsos registros sobre documentos benignos en una sola maquina; no se ha evaluado su recall ni su comportamiento en otro hardware.
- Once etiquetas se presentan como sugerencias no validadas, sin recall, sin resultados por idioma y sin linea de evaluacion; entre ellas, `health.patient_record` genera 54 falsos registros de 18.075 y `corporate.strategy` 12 de 18.075.
- `legal.contract_other` no es apto para monitorizacion (8 falsos registros de 18.075) y queda en modo `rules`; `public.published` no tiene valor de calibracion y tambien queda en `rules`.
- El entrenamiento uso una sola semilla (7001) y no se repitio con tres semillas, lo que limita la robustez estadistica de los resultados.
- Los datos de entrenamiento no se publican, lo que impide auditar sesgos y composicion del corpus.
- La licencia es propietaria (`proprietary-sciencesoft`) y los pesos se publican solo para evaluacion y reproduccion; el uso comercial requiere consultar los terminos enlazados.
- La ventana es de 450 caracteres, muy inferior a la de un encoder estandar de 512 tokens, por lo que documentos largos deben trocearse y agregarse, con el riesgo de perder contexto entre fragmentos.
- No se ha verificado la identidad byte a byte de la salida PII en el grafo fp32, en Windows ni con batch size superior a 1.
- Riesgo de alucinacion en el sentido de clasificaciones espurias: los conteos de falsos registros documentados muestran que el modelo puede asignar tipos de documento a documentos benignos, especialmente en categorias no validadas.
- No dispone de capacidades de agente, tool calling ni razonamiento multi-paso; es un clasificador, no un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/ScienceSoft/scnsoft-pii-encoder-doc-type-head
- Encoder de PII base: https://huggingface.co/ScienceSoft/scnsoft-pii-encoder
- Terminos de licencia: https://huggingface.co/ScienceSoft/scnsoft-pii-encoder/blob/main/README.md#licence
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
