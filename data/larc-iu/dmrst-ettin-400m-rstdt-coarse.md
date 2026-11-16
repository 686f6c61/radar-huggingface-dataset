# larc-iu/dmrst-ettin-400m-rstdt-coarse

## Resumen

`larc-iu/dmrst-ettin-400m-rstdt-coarse` es un parser de discurso RST (Rhetorical Structure Theory) en ingles, entrenado con la libreria Dipo sobre el encoder `jhu-clsp/ettin-encoder-400m`. No es un modelo generativo: es un modelo discriminativo especializado que, dada una entrada de texto en crudo, produce un arbol de discurso con segmentacion en unidades de discurso elementales (EDU), relaciones retoricas y nuclearidad. Reimplementa la arquitectura DMRST (Liu et al., CODI 2021) y se distribuye como checkpoint listo para inferencia via la libreria `dipo`.

El modelo se entrena exclusivamente sobre el RST Discourse Treebank (RST-DT, LDC2002T07), 385 articulos del Wall Street Journal anotados con un inventario de relaciones que aqui se colapsa de 111 etiquetas originales a 18 categorias (attribution, background, cause, comparison, condition, contrast, elaboration, enablement, evaluation, explanation, joint, manner-means, same-unit, summary, temporal, textual-organization, topic-change, topic-comment). El checkpoint se selecciona por F1 end-to-end en el split de desarrollo.

Su relevancia es acotada pero clara: cubre una tarea de nicho (analisis del discurso a nivel de documento) con un modelo de 400M de parametros, inputs en texto crudo sin tokenizar y una API de una sola llamada. Los resultados publicados en la model card son de un unico entrenamiento y el autor advierte de variacion entre ejecuciones de varios puntos en test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (Ettin-encoder-400m) con cabecera de parsing DMRST (segmentacion + arbol + relaciones) |
| Parametros totales | 400M (encoder base; total del parser no desglosado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (heredada del modelo base `jhu-clsp/ettin-encoder-400m`); los datos de entrenamiento RST-DT estan sujetos al acuerdo de usuario de LDC |
| Formato de pesos | no disponible (repo de 7,3 GB; libreria `dipo`) |

## Arquitectura y entrenamiento

El modelo reimplementa el framework DMRST, que aborda de forma conjunta la segmentacion en EDUs y el parsing del arbol de discurso a nivel de documento. La columna vertebral es el encoder `jhu-clsp/ettin-encoder-400m`, sobre el que se anaden las cabeceras de prediccion de fronteras de segmento, nuclearidad y relaciones retoricas. La entrada es texto en crudo: el modelo colapsa todos los espacios en blanco, por lo que no ve saltos de linea; la funcion `predict_from_text` compensa esto iniciando un nuevo segmento en cada salto de parrafo (doble salto) y tras lineas cortas tipo encabezado, comportamiento desactivable con `break_at_paragraphs=False`.

El entrenamiento usa solo el split de train de RST-DT, con seleccion de checkpoint por `e2e_full_f1` en dev. El inventario de relaciones se mapea de 111 etiquetas a 18, y la configuracion de entrenamiento define pares (relacion, tipo de nuclearidad) para relaciones mononucleares (rst) y multinucleares (multinuc). No se documentan en la informacion disponible detalles sobre volumen de tokens, composicion del dataset mas alla de RST-DT, ni uso de RLHF/DPO (no aplica a un parser discriminativo). Tampoco se detalla si hay innovaciones como decodificacion especulativa o atencion lineal; no disponibles.

## Capacidades

- Segmentacion de discurso: identifica fronteras de EDU sobre texto en crudo (F1 de segmentacion reportado de 96,6 en dev y test).
- Parsing RST completo: construye arboles de discurso con spans, nuclearidad y etiquetas de relacion (18 categorias).
- Prediccion end-to-end desde texto sin tokenizar: acepta texto corrido con saltos de linea y espacios arbitrarios.
- Prediccion con segmentacion gold: modo Gold-EDU para evaluar o usar el parser cuando las EDUs ya se conocen.
- Salida en formato RS4 (`tree.to_rs4_string()`) para integracion en pipelines de analisis.
- Procesamiento por lotes: CLI con `--text-file` y `--output-dir` para ficheros o directorios de `.txt`.
- Manejo de estructura de parrafos: reinicia segmento en saltos de parrafo y encabezados cortos.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking: es un parser especializado, no un modelo de proposito general.
- Multilingue: no; solo ingles.

## Casos de uso

- Analisis de estructura argumentativa en articulos de prensa: dado un texto en crudo, el parser devuelve el arbol RST con relaciones como `contrast`, `cause` o `elaboration`, util para estudiar como se organiza la argumentacion en corpus periodisticos.
- Investigacion en linguistica computacional: generacion de arboles RST de referencia para experimentos de discurso, comparacion de inventories de relaciones o analisis de coherencia en textos largos.
- Preprocesado para resumen extractivo/abstractivo: los spans y relaciones del arbol permiten ponderar unidades por nuclearidad (nucleos frente a satelites) antes de un summarizer.
- Evaluacion de coherencia en generacion de texto: parsear salidas de un LLM y medir la estructura discursiva resultante como metrica auxiliar de calidad.
- Analisis de discurso en documentacion tecnica o legal en ingles: identificar relaciones de condicion, causa y contraste en clausulas y secciones, con la salvedad de que el modelo se entreno en WSJ y puede degradarse fuera de dominio.
- Construccion de datasets anotados a bajo coste: usar el parser como preanotador y revision humana posterior, gracias a la salida RS4 directamente consumible por herramientas de anotacion.
- Ensenanza y analisis de escritura: visualizar la estructura retorica de un texto para diagnosticar problemas de organizacion (por ejemplo, exceso de `joint` o `same-unit` frente a `elaboration` bien jerarquizada).

## Benchmarks y rendimiento

Resultados publicados en la model card (F1 x 100, Parseval original, spans hoja triviales excluidos; E2E incluye segmentacion predicha, Gold-EDU asume segmentacion gold):

| Split | Seg | E2E Span | E2E Nuc | E2E Rel | E2E Full | Gold-EDU Span | Gold-EDU Nuc | Gold-EDU Rel | Gold-EDU Full |
|---|---|---|---|---|---|---|---|---|---|
| dev | 96,6 | 79,4 | 68,0 | 56,4 | 54,9 | 81,8 | 71,3 | 59,4 | 57,9 |
| test | 96,6 | 76,2 | 65,1 | 55,2 | 53,2 | 79,3 | 68,5 | 58,6 | 56,6 |

Notas: el checkpoint se selecciono por `e2e_full_f1` en dev; las cifras provienen de una unica ejecucion de entrenamiento y el autor advierte de variacion de varios puntos entre ejecuciones en test. La metrica `Seg` es el F1 por token BeginSeg calculado durante entrenamiento y puede quedar hasta un punto por debajo del scorer oficial de DISRPT. No se aportan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 400M de parametros en el encoder, la inferencia en fp32 rondaria los 1,6 GB de pesos mas activaciones, y en fp16/bf16 alrededor de 0,8 GB de pesos mas overhead. Cifras orientativas, no publicadas por el autor.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer con al menos 4-6 GB de VRAM deberia poder ejecutar el modelo en precision reducida.
- Cabe en GPU consumer: previsiblemente si (RTX 3060/4060 y superiores), aunque no hay confirmacion en la informacion disponible.
- Opciones de despliegue: libreria `dipo` (`pip install dipo`), con CLI (`dipo dmrst predict`) y API Python (`DMRSTParser.from_pretrained`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo no son las vias naturales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| larc-iu/dmrst-ettin-400m-rstdt-coarse | 400M (encoder) | no disponible | Parsing RST en ingles (RST-DT) | MIT (pesos) + acuerdo LDC (datos) | Hugging Face, libreria `dipo` |
| DMRST original (Liu et al., 2021) | no disponible | no disponible | Parsing RST multilingue | no disponible | Paper CODI 2021; implementacion no disponible en la informacion |
| Alternativas RST en ingles | no disponible | no disponible | Parsing RST | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Dominio restringido: entrenado solo con 385 articulos del WSJ (RST-DT); el rendimiento fuera de ese dominio (legal, clinico, conversacional) puede degradarse de forma notable y no esta cuantificado.
- Idioma unico: solo ingles; no soporta castellano ni otros idiomas.
- No es un modelo generativo: no responde preguntas, no resume ni genera texto; solo devuelve estructura de discurso.
- Estructura de lineas invisible: el modelo colapsa espacios en blanco y no ve saltos de linea; la heuristica de `predict_from_text` para parrafos y encabezados es una aproximacion, no aprendizaje.
- Varianza entre ejecuciones: el autor advierte de variacion de varios puntos en test entre entrenamientos; los numeros de la card corresponden a una sola ejecucion y no a los del paper asociado.
- Riesgo de alucinacion estructural: al ser un parser, puede producir arboles sintacticamente validos pero erroneos en relaciones ambiguas; las metricas de relacion (F1 ~55-59) reflejan esta incertidumbre.
- Licencia de pesos MIT heredada del modelo base, pero los datos RST-DT (LDC2002T07) estan sujetos al acuerdo de usuario de LDC; verificar que el uso previsto este permitido antes de explotacion comercial.
- Uso previsto declarado: investigacion y analisis de texto; no se documenta validacion para produccion.
- Contexto maximo no documentado: textos muy largos pueden exceder la ventana del encoder sin que se indique el limite.
- Repo de 7,3 GB: el peso de descarga es considerable para un modelo de 400M, probablemente por incluir multiples artefactos; conviene revisar el contenido antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larc-iu/dmrst-ettin-400m-rstdt-coarse
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Repositorio Dipo: https://github.com/larc-iu/dipo
- Paper DMRST (CODI 2021): https://aclanthology.org/2021.codi-main.15/
- Paper Dipo (arXiv 2610.17658): https://arxiv.org/abs/2610.17658
- RST-DT (LDC2002T07): https://catalog.ldc.upenn.edu/LDC2002T07
