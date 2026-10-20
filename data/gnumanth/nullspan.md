# gnumanth/nullspan

## Resumen

`gnumanth/nullspan` es un modelo de extracción estructurada y abstención calibrada construido sobre `distilbert-base-uncased` (67.060.625 parámetros). Lo desarrolla Hemanth.HM (usuario `gnumanth`), autor también de otros modelos publicados en HuggingFace. El modelo resuelve un problema muy concreto: dado un texto no estructurado (`state`) y un mapa de campos tipados (`text`, `number`, `date`, `datetime`, `duration`, `list`, `estimate`, `forecast`), devuelve los valores extraídos, su posición exacta en el texto y una probabilidad de ausencia (`p_null`) para cada campo. Todo ello en una sola pasada del encoder, sin generar tokens de salida.

La relevancia técnica está en el enfoque: en lugar de pedir a un LLM generativo que emita JSON (con el coste de latencia, riesgo de alucinación y formato inválido que eso conlleva), `nullspan` añade cinco cabezas paralelas sobre un encoder DistilBERT y resuelve la tarea con clasificación y regresión de spans. El resultado es un modelo de 67M de parámetros, 0,3 GB de repositorio, licencia MIT y una latencia declarada de 119,35 ms por pasada multi-campo en Apple Silicon MPS.

El modelo se publicó el 19 de octubre de 2026 y en el momento de redactar esta ficha no tiene descargas ni likes, por lo que no existe validación independiente por parte de la comunidad. Conviene tratar sus métricas como autodeclaradas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) con 5 cabezas paralelas: `null_head`, `span_head`, `bio_head`, `op_head`, `quantile_head` |
| Parámetros totales | 67.060.625 (según safetensors) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; al derivar de `distilbert-base-uncased`, la base está limitada a 512 posiciones |
| Tipos de cuantización | no disponible (solo pesos completos en safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la base `distilbert-base-uncased` está entrenada principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |
| Pipeline declarado | question-answering / feature-extraction |
| Autor | gnumanth (Hemanth.HM) |
| Fecha de publicación | 19 de octubre de 2026 (actualizado el mismo día) |
| Tamaño del repositorio | 0,3 GB |
| Dependencia de código | sí, arquitectura personalizada `NullspanForExtraction` incluida en el repo |
| Dataset de entrenamiento | `gnumanth/nullspan-dataset` (composición y tamaño no disponibles) |

## Arquitectura y entrenamiento

`NullspanForExtraction` es un encoder DistilBERT de 6 capas y ~67M de parámetros al que se le acoplan cinco cabezas que se ejecutan en paralelo sobre la misma pasada forward, sin decodificación autorregresiva. Cada cabeza cubre una subtarea: `null_head` produce la probabilidad calibrada de que un campo esté ausente (`p_null`), `span_head` implementa una pointer network de inicio/fin a nivel de token que se mapea a caracteres mediante `offset_mapping`, `bio_head` es un etiquetador `B/I/O` para listas ordenadas de spans, `op_head` es un router de 8 clases (`SPAN_TEXT`, `SPAN_NUMBER`, `ARITH_SUM`, `ARITH_DIFF`, `ARITH_MUL`, `ISO_DATETIME`, `DATE_DURATION`, `DIST_ESTIMATE_FORECAST`) que decide la operación de normalización o cómputo, y `quantile_head` estima una distribución calibrada con pérdida pinball sobre los cuantiles `p10`, mediana y `p90`, acotada por los parámetros `[min, max, step, scale]`.

El entrenamiento declarado se completó en 565,8 segundos sobre Apple Silicon (MPS), lo que indica un conjunto de datos y un presupuesto de cómputo pequeños. No se especifican en la model card el número de tokens, la composición del dataset ni el proceso de anotación. Tampoco hay RLHF ni DPO: al no ser un modelo generativo, el ajuste se realiza de forma supervisada multi-tarea sobre las cinco cabezas, con pérdida pinball para la parte distribucional. La innovación destacable es el enrutado de operaciones aritméticas y de normalización dentro del propio encoder: en el ejemplo de la model card, `amount_paid` se resuelve sumando 649,00 + 52,10 mediante `ARITH_SUM` para devolver 701,1, y `days_since_delivery` se calcula como diferencia entre fechas.

## Capacidades

- Extracción de campos tipados (`text`, `number`, `date`, `datetime`, `duration`, `list`, `estimate`, `forecast`) desde texto libre en una sola pasada del encoder.
- Abstención calibrada: devuelve `p_null` por campo y `value: null` cuando el dato no está presente, con una confianza asociada.
- Extracción de spans a nivel de carácter: `span_head` devuelve `[start, end]` exactos, lo que permite resaltar la evidencia en el documento original.
- Extracción de listas ordenadas de spans mediante etiquetado `B/I/O` (`type: "list"`).
- Enrutado y cómputo aritmético básico: suma, resta y multiplicación de valores mencionados en el texto (`ARITH_SUM`, `ARITH_DIFF`, `ARITH_MUL`).
- Normalización temporal: conversión a `ISO_DATETIME` y cálculo de duraciones entre fechas (`DATE_DURATION`).
- Estimación distribucional: `quantile_head` devuelve `p10`, mediana y `p90` con acotación por rango, escala (lineal o logarítmica) y paso.
- Feature extraction: al ser un encoder, puede usarse para obtener representaciones de tokens o de secuencia.
- No soporta generación de texto libre, tool calling, function calling, uso como agente multi-paso, visión, audio ni modo thinking. No es un modelo conversacional.

## Casos de uso

- Triaje de reclamaciones de atención al cliente: el modelo extrae de un correo el identificador de pedido, la fecha de entrega, el importe pagado, los días transcurridos, la lista de daños y una estimación del coste de reparación en una sola llamada, tal como demuestra el ejemplo de la model card. Es adecuado porque evita generar JSON libre y devuelve spans verificables para auditoría.
- Prellenado de formularios y CRM: cada campo del formulario se declara como `field` tipado y el modelo devuelve `value` más `confidence`; los campos con `p_null` alto se dejan vacíos en lugar de inventar un valor.
- Enrutado y normalización de importes en facturación: el router `op_head` decide si el importe debe extraerse literalmente (`SPAN_NUMBER`) o calcularse por suma de base e impuestos (`ARITH_SUM`), lo que reduce la lógica de post-proceso en el backend.
- Normalización de fechas y cálculo de plazos: conversión de expresiones como "Sept 28, 2026" o "9 de octubre" a ISO 8601 y cálculo de duraciones (`DATE_DURATION`) para estimar vencimientos de garantía o SLA.
- Extracción de listas de entidades en notas o informes: el `bio_head` devuelve listas ordenadas con sus spans, útil para inventariar síntomas, piezas dañadas o cláusulas mencionadas.
- Estimación calibrada de magnitudes en procesos de negocio: el `quantile_head` permite pedir un coste de reparación con `p10`/mediana/`p90` acotado entre 10 y 5000 USD con escala logarítmica, lo que da un rango explícito en lugar de un número puntual sin incertidumbre.
- Procesamiento por lotes de bajo coste en CPU: con 67M de parámetros y sin generación de tokens, es viable ejecutar la extracción sobre grandes volúmenes de documentos en infraestructura sin GPU.
- Capa de extracción previa a un LLM: usar `nullspan` para resolver los campos estructurados y reservar el modelo generativo solo para la parte de redacción o razonamiento abierto.

## Benchmarks y rendimiento

Métricas declaradas por el autor en la model card (no se especifica el tamaño ni la composición del conjunto de evaluación):

| Métrica | Resultado |
|---|---|
| Tiempo de entrenamiento | 565,8 s (Apple Silicon MPS) |
| Null abstention accuracy (`p_null`) | 100,0 % |
| Grounded span exact match (`[start, end]`) | 100,0 % |
| Operation router accuracy | 100,0 % |
| Multi-span list BIO accuracy | 100,0 % |
| Quantile distribution MAE (normalizado `[0, 1]`) | 0,0068 |
| Canonical evaluation suite accuracy | 100,0 % |
| Latencia por pasada multi-campo | 119,35 ms |

No se han publicado resultados independientes en benchmarks estándar (MMLU, HumanEval, GSM8K, SQuAD, CoNLL) en la información disponible, y las métricas anteriores corresponden a una suite propia del autor, no a un banco de pruebas público.

## Requisitos de hardware

- VRAM estimada para inferencia: ~268 MB en fp32 (67,06M × 4 bytes), ~134 MB en fp16/bf16 y ~67 MB en int8. El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria sirve; el modelo se ha validado en Apple Silicon vía MPS. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series 20xx en adelante), GTX 1650 o superior, e incluso en iGPU con memoria compartida.
- CPU: es perfectamente viable en CPU para inferencia por lotes, dado el tamaño y la ausencia de generación autorregresiva.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` es la vía documentada. No hay soporte nativo en vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos GGUF ni ONNX; la conversión a GGUF requeriría reimplementar las cinco cabezas personalizadas.
- Latencia y throughput: 119,35 ms por pasada multi-campo según el autor (Apple Silicon MPS). No se publica throughput en tokens/s ni en documentos/s, ni latencia en GPU dedicada o CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Extracción con abstención | Disponibilidad |
|---|---|---|---|---|---|---|
| gnumanth/nullspan | 67,06M | 512 posiciones (base) | Encoder + 5 cabezas (span, BIO, router, cuantiles) | MIT | Sí (`p_null` por campo) | HuggingFace |
| distilbert-base-uncased | 66,96M | 512 | Encoder para clasificación/QA | Apache 2.0 | No, requiere cabezas propias | HuggingFace |
| bert-base-uncased | ~110M | 512 | Encoder para clasificación/QA | Apache 2.0 | No, requiere cabezas propias | HuggingFace |

Frente a un LLM generativo con salida JSON forzada, `nullspan` ofrece un orden de magnitud menos de parámetros, latencia en decenas o cientos de milisegundos y ausencia de riesgo de JSON malformado, pero carece de razonamiento abierto, de generalización a instrucciones nuevas y de soporte multilingüe declarado. No se dispone de benchmarks comunes que permitan una comparación cuantitativa de rendimiento con esas alternativas.

## Limitaciones y advertencias

- Todas las métricas son autodeclaradas y alcanzan el 100 % en cuatro tareas, lo que es señal de un conjunto de evaluación propio, pequeño o muy alineado con el entrenamiento. No hay validación independiente.
- El modelo se publicó y actualizó el mismo día, con 0 descargas y 0 likes: no ha sido revisado por la comunidad.
- La base es `distilbert-base-uncased`, entrenada principalmente en inglés y sin distinción de mayúsculas. No se declaran idiomas soportados, por lo que el rendimiento en castellano es una incógnita y debe validarse antes de usarlo en producción.
- Límite de contexto de 512 posiciones heredado de la base: los documentos largos requieren troceado, con el consiguiente riesgo de perder spans que cruzan fragmentos.
- Riesgo de alucinación residual en el campo `guess`: en el propio ejemplo de la model card, `tracking_number` abstiene correctamente (`value: null`, `p_null` ≈ 0,9989) pero rellena `guess` con "$52.10", un valor espurio. Hay que ignorar `guess` cuando `value` es `null`.
- Los campos `estimate` y `forecast` son estimaciones del `quantile_head` acotadas por los parámetros que se le pasan; no son verificables contra el texto y no deben tratarse como datos extraídos.
- El cálculo aritmético (`ARITH_SUM`, `ARITH_DIFF`, `ARITH_MUL`) opera sobre valores detectados en el texto: un error en la detección se propaga silenciosamente al resultado calculado (por ejemplo, sumar un impuesto mal identificado).
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio. En producción conviene auditar y fijar la revisión concreta del repo.
- No se documentan sesgos, composición del dataset ni procesos de anonimización del conjunto de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías ni cláusula de responsabilidad por resultados.
- Advertencia de nombres: los proyectos "Nullspan — AI Ops Command Center" (`nullspan.fixbyte.dev` y `github.com/m0hss/nullspan`) son productos no relacionados con este modelo, pese a compartir nombre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gnumanth/nullspan
- Dataset de entrenamiento: https://huggingface.co/datasets/gnumanth/nullspan-dataset
- Perfil del autor en HuggingFace: https://huggingface.co/gnumanth
- Sitio del autor: https://h3manth.com
- Otro modelo del mismo autor (no relacionado): https://huggingface.co/gnumanth/sanskrit-tts-wasm
- Proyecto homónimo no relacionado (AI Ops dashboard): https://nullspan.fixbyte.dev/
- Repositorio homónimo no relacionado: https://github.com/m0hss/nullspan
- Paper técnico: no disponible
- Blog o demo oficial del modelo: no disponible
