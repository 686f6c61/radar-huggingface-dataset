# CheneyWong/povl-opd-teacher

## Resumen

povl-opd-teacher es un checkpoint de 905.601.648 parametros (aproximadamente 0,9 mil millones) publicado por el usuario CheneyWong en HuggingFace bajo licencia Apache 2.0. No es un modelo de proposito general, sino el profesor ("teacher") utilizado en un proceso de destilacion on-policy (OPD): se trata del checkpoint final de una ejecucion de SFT especifica de profesor que duro 2.367 pasos. Su funcion es generar senales de supervision densas para destilar un modelo estudiante en la tarea de reconocimiento de tablas.

El modelo deriva de PaddleOCR-VL-1.6 (base), del que hereda la arquitectura de vision-lenguaje orientada a OCR y analisis de documentos, y esta especializado en una unica tarea: recibe una imagen de tabla junto con el prompt literal `Table Recognition:` y emite, en una sola pasada, marcado OTSL (con los tokens `<fcel>`, `<ecel>`, `<ucel>`, `<lcel>`, `<xcel>` y `<nl>`). La pipeline declarada en HuggingFace es image-text-to-text y los pesos estan en safetensors.

Su relevancia es fundamentalmente metodologica y de trazabilidad: la propia model card documenta que la cualificacion del profesor nunca llego a completarse, que los 16 checkpoints candidatos fallaron las dos barreras de calidad definidas y que el grupo de datos de entrenamiento del profesor estaba contaminado en un 98% con datos de evaluacion. Es, por tanto, un artefacto util para reproducir o auditar un experimento de destilacion, no un modelo recomendado para produccion en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | basada en PaddleOCR-VL-1.6 (vision-lenguaje para OCR/documentos); detalle interno no disponible |
| Parametros totales | 905.601.648 |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repo publica pesos safetensors (1,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos de la ficha de HuggingFace: biblioteca `transformers`, pipeline `image-text-to-text`, tags `paddleocr_vl`, `table-recognition`, `document-parsing`, `paddleocr-vl`, `otvl`, `conversational`, `custom_code`, `endpoints_compatible`; 6 descargas y 0 likes; creado y actualizado el 12 de octubre de 2026.

## Arquitectura y entrenamiento

La model card indica que el checkpoint desciende de `PaddleOCR-VL-1.6 (base)`, que a su vez fue entrenado de forma separada de la cadena del estudiante sobre una mezcla de datos especifica de profesor. La linea declarada es: `PaddleOCR-VL-1.6 (base)` -> `povl-opd-teacher`. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El tag `paddleocr_vl` y `custom_code` sugieren que la implementacion requiere codigo remoto de la libreria `transformers` para cargarse.

El entrenamiento consistio en una ejecucion de SFT de 2.367 pasos orientada a una tarea unica: dada una imagen de tabla y el prompt `Table Recognition:`, producir en una sola pasada marcado OTSL. La model card no documenta innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa u otras). El aspecto mas relevante del proceso es el control de calidad declarado: se definieron dos guardrails (truncacion maxima del 5% y TEDS minimo de 0,50 en el peor cohorte) y los 16 checkpoints candidatos los fallaron ambos; posteriormente se determino que el cohorte que provoco el veto es un artefacto de medicion por un bug de doble recorte, por lo que la seleccion del profesor queda pendiente de rehacer. Ademas, la propia card reconoce que el pool de entrenamiento del profesor estaba contaminado en un 98% con datos de evaluacion.

## Capacidades

- Reconocimiento de tablas a partir de imagen: recibe una unica imagen de tabla y emite su estructura en marcado OTSL.
- Emision de estructura de celdas mediante los tokens `<fcel>` (celda con contenido), `<ecel>` (celda vacia), `<ucel>` (celda fusionada hacia arriba), `<lcel>` (fusionada hacia la izquierda), `<xcel>` (celda ignorada) y `<nl>` (salto de linea).
- Procesamiento de entrada multimodal imagen-texto (`image-text-to-text`).
- Modo conversacional: el tag `conversational` aparece en la ficha del repositorio.
- Capacidad de profesor para destilacion on-policy: generar supervision densa sobre rollouts del estudiante.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo thinking.
- Capacidades multilingues: no disponible.

## Casos de uso

- Destilacion on-policy de un modelo estudiante de reconocimiento de tablas: el uso previsto y documentado. El profesor genera etiquetas densas sobre las trayectorias del estudiante para transferir la tarea de parsing de tablas a un modelo mas pequeno.
- Auditoria y reproduccion de experimentos: al publicarse junto a las advertencias sobre guardrails fallidos y contaminacion del pool de entrenamiento, sirve como caso de estudio de un pipeline de cualificacion de profesor que no se completo.
- Analisis de documentos financieros y contables: extraccion de tablas de balances o informes en PDFs escaneados, convirtiendo la estructura a OTSL para su posterior volcado a hojas de calculo o bases de datos.
- Digitalizacion de tablas en documentacion cientifica: reconstruccion de tablas de papers para pipelines de mineria de texto, donde la estructura de celdas fusionadas (`<ucel>`, `<lcel>`) es critica.
- Facturacion y documentos administrativos: extraccion de lineas de detalle y totales de facturas escaneadas en un flujo de captura masiva.
- Generacion de datos sinteticos de tablas etiquetadas: uso del profesor sobre imagenes sinteticas o aumentadas para producir pares imagen-OTSL que alimenten el entrenamiento del estudiante.
- Investigacion comparativa en destilacion: servir de referencia para medir la degradacion entre un profesor especializado y el estudiante resultante en tareas de document parsing.
- Procesamiento por lotes de archivos historicos: normalizacion estructural de tablas de archivos escaneados antes de aplicar OCR de texto completo.

## Benchmarks y rendimiento

La model card incluye una seccion "Results on public datasets" con la comparacion frente al modelo base, pero la tabla de resultados no se reproduce en la informacion disponible. Los unicos datos numericos explicitos son los siguientes:

| Dataset | Metrica | Valor | Nota |
|---|---|---|---|
| SPRINT-MUSTARD | TEDS | ~0,22 | No significativo: el ground truth no contiene texto de celda, por lo que mide la reproduccion de celdas vacias y debe ignorarse |
| SPRINT-MUSTARD | TEDS-S | valor no disponible | La propia card indica que solo la columna TEDS-S es significativa para este dataset |
| SPRINT-MUSTARD (test de perturbacion) | TEDS | 0,33 | Prediccion estructuralmente perfecta que lee correctamente el texto visible |
| SPRINT-MUSTARD (test de perturbacion) | TEDS-S | 1,00 | Misma prediccion estructuralmente perfecta |
| Guardrail de truncacion | Truncacion maxima | 15,0% | Umbral definido: 5%; todos los candidatos lo incumplieron |
| Guardrail de calidad | TEDS peor cohorte | 0,4548 | Umbral definido: 0,50; el cohorte responsable del veto reporta 0,486 frente a un valor correcto de 0,857 por un bug de doble recorte |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni de otros benchmarks de proposito general en la informacion disponible, y no procede extrapolarlos dado que el modelo esta especializado en una unica tarea.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion aritmetica a partir de 905.601.648 parametros): aproximadamente 1,8 GB solo en pesos en fp16/bf16 (el repo ocupa 1,8 GB, coherente con esa precision; en fp32 serian unos 3,6 GB), mas la memoria de activaciones y del encoder de vision.
- VRAM practica estimada: del orden de 2,5 a 4 GB en fp16/bf16 con overhead de runtime, alrededor de 1,5 GB en int8 y alrededor de 1 GB en int4, sin contar el coste de procesar la imagen de entrada a resolucion alta.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es desplegable en GPU de consumo con 6 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060 o superiores); para lotes grandes o imagenes de alta resolucion son preferibles GPU con 16-24 GB (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, segun la estimacion anterior, siempre que el runtime soporte la arquitectura y el codigo remoto.
- Opciones de despliegue: `transformers` con carga de codigo remoto (el repo lleva el tag `custom_code`) y uso de los endpoints compatibles (`endpoints_compatible`). Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion consultada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CheneyWong/povl-opd-teacher | este modelo | 905.601.648 | no disponible | apache-2.0 | safetensors en HuggingFace |
| PaddleOCR-VL-1.6 (base) | modelo base del que deriva | no disponible | no disponible | no disponible | no disponible |
| CheneyWong/povl-opd-scale05 | checkpoint relacionado del mismo autor | no disponible | no disponible | no disponible | HuggingFace |

No se han encontrado en la informacion disponible modelos de terceros comparables con especificaciones verificables (parametros, contexto, licencia) para esta tarea concreta de reconocimiento de tablas en formato OTSL, por lo que la comparativa cuantitativa frente a alternativas queda como no disponible.

## Limitaciones y advertencias

- Cualificacion del profesor no realizada: la model card afirma explicitamente que "la cualificacion del profesor efectivamente nunca se llevo a cabo".
- Guardrails incumplidos: los 16 checkpoints candidatos fallaron ambas barreras (truncacion maxima del 15,0% frente al umbral del 5%; TEDS del peor cohorte de 0,4548 frente al umbral de 0,50).
- Veto basado en un artefacto de medicion: el cohorte que provoco el rechazo reporta 0,486 cuando el valor correcto es 0,857 debido a un bug de doble recorte; excluyendolo, el veto desaparece y la seleccion debe rehacerse.
- Contaminacion de datos: el pool de entrenamiento del profesor estaba contaminado en un 98% con datos de evaluacion, lo que invalida cualquier lectura optimista de sus resultados en conjuntos publicos.
- La model card indica que el modelo "nunca se evaluo con gating en los conjuntos publicos".
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en reconocimiento de tablas el modo tipico de fallo es la invencion de celdas o de contenido, pero no hay medicion publicada.
- Ambito de tarea extremadamente estrecho: una unica imagen de tabla con el prompt `Table Recognition:` y una sola pasada; no es un modelo de chat ni de razonamiento general.
- Idoneidad para produccion: con los datos disponibles (contaminacion del 98%, cualificacion sin completar, 6 descargas, 0 likes), no hay evidencia que respalde su uso en entornos productivos.
- Licencia: apache-2.0, que en principio permite uso comercial, aunque el modelo base PaddleOCR-VL-1.6 puede arrastrar condiciones adicionales que no se detallan en la informacion proporcionada.
- Requiere cargar codigo remoto (`custom_code`), lo que implica ejecutar codigo no auditado en el entorno de inferencia.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide garantizar su comportamiento fuera del caso de uso documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CheneyWong/povl-opd-teacher
- Checkpoint relacionado del mismo autor: https://huggingface.co/CheneyWong/povl-opd-scale05
- Self-OPD: On-Policy Distillation for Flow Matching Models without Teacher (arXiv): https://arxiv.org/abs/2608.26872
- Ficha de Self-OPD en Papers with Code: https://paperswithcode.co/paper/2608.26872
- Self-OPD Drops Teacher Model From Flow Matching Distillation (AI Weekly): https://aiweekly.co/alerts/self-opd-drops-teacher-model-from-flow-matching-distillation
- Flow-OPD distills specialized teachers into one student model (Artificial Intelligence Dynamics): https://artificialintelligencedynamics.com/2026/06/05/flow-opd-distills-specialized-teachers-into-one-student-model/
