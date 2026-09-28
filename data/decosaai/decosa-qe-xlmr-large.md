# decosaai/decosa-qe-xlmr-large

## Resumen

decosa-qe-xlmr-large es un modelo de estimación de calidad de traducción (QE) desarrollado por decosaai, un fine-tuning de FacebookAI/xlm-roberta-large con 562.010.133 parámetros. Dado un par formado por una frase origen en inglés y su traducción a alemán, francés, español, italiano, neerlandés o polaco, devuelve tres salidas: la probabilidad de que la traducción altere el significado del original (`p_error`, con `score = 1 - p_error`), la categoría de error más probable (número, negación, omisión, adición, entidad, roles, hedge o terminología) y tramos de palabras etiquetados con una categoría tanto en el origen como en la traducción.

Su relevancia es fundamentalmente de licencia y de coste. Los modelos abiertos fuertes de QE (Unbabel CometKiwi, XCOMET) se distribuyen bajo CC BY-NC-SA y no pueden usarse comercialmente; este modelo parte de un encoder con licencia MIT y se entrena solo con datos cuya licencia permite uso comercial, publicándose bajo Apache-2.0. Además está diseñado para ejecutarse en CPU (90-140 ms por par de frases en fp32), lo que lo hace viable como etapa de prefiltrado barata.

No es un traductor ni un corrector de estilo: es un detector de errores de significado en textos factuales cortos, pensado para alimentar una cascada en la que las líneas dudosas pasan a un verificador más lento o a una persona. El propio autor lo enmarca como un prefiltro de una comprobación de significado con LLM (retrotraducción más juez de 27B, unos 7 s y 0,00026 USD por línea), no como sustituto de un revisor humano.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large); cabeceras de clasificación de secuencia y de clasificación de tokens |
| Parametros totales | 562.010.133 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 sub-tokens por par (origen + traducción); el autor indica dividir en frases |
| Tipos de cuantizacion | No se publican pesos cuantizados; la única medición documentada usa fp32 |
| Idiomas soportados | Origen: en. Destino: de, fr, es, it, nl, pl |
| Licencia | apache-2.0 (modelo base FacebookAI/xlm-roberta-large, encoder con licencia MIT) |
| Formato de pesos | safetensors (tamaño del repositorio: 2,3 GB) |

Datos adicionales: pipeline declarado `text-classification`; etiquetas del repositorio `translation`, `quality-estimation`, `machine-translation`, `error-detection`, `token-classification`; versión indicada por el autor como v2; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer XLM-RoBERTa large (24 capas, representación multilingüe compartida) con dos cabeceras: una de clasificación de secuencia que produce `p_error` y la categoría de error más probable, y una de clasificación de tokens que marca tramos de palabras en el origen y en la traducción. No hay componente generativo, decodificación especulativa ni atención lineal; el coste de inferencia es el de un forward pass de encoder sobre un máximo de 256 sub-tokens por par.

Todos los pares de entrenamiento son sintéticos: o una traducción correcta, o esa misma traducción con un único error plantado. El autor indica que nada fue etiquetado por personas. Las fuentes declaradas son Tatoeba vía OPUS v2023-04-12 (CC-BY 2.0 FR), EMEA vía OPUS v3 (aviso legal de la EMA, permite uso comercial con atribución), DGT-TM vía OPUS v2019 (Decisión 2011/833/UE), plantillas propias de Decosa (CC0, frases inventadas de seguridad de producto, prospectos, resúmenes para legos y avisos) y las salidas de tencent/Hy-MT2-7B (Apache-2.0) sobre esos textos en inglés, limpias y con ediciones mínimas. La recolección y alineación se hicieron con OPUS (Tiedemann, LREC 2012). El autor declara explícitamente que no usó FLORES-200 (solo para evaluación), MLQE-PE, datos de las tareas compartidas de QE de WMT ni pesos o salidas de CometKiwi/XCOMET. La información proporcionada se corta en la descripción del procedimiento de plantado de errores ("rule-based mi..."), por lo que el detalle completo de ese método no está disponible.

## Capacidades

- Puntuación de significado: devuelve `p_error`, la probabilidad de que la traducción cambie el significado del origen, con `score = 1 - p_error`.
- Clasificación de la categoría de error dominante: número, negación, omisión, adición, entidad, roles, hedge o terminología.
- Etiquetado a nivel de palabra: tramos señalados en el origen y en la traducción con una categoría; la fluidez se etiqueta pero no cuenta como error de significado.
- Detección de errores plantados de tipo cláusula omitida, hedge, negación, entidad y roles (recuentos por tipo en la sección de benchmarks).
- Detección de deriva numérica y de negación con alta sensibilidad (98,6 % de recuerdo y AUC 0,997 en el conjunto sintético correspondiente).
- Ejecución en CPU sin GPU, con latencias de decenas de milisegundos por par.
- Uso como primera etapa de una cascada: líneas seguras se aceptan o se marcan, las dudosas se derivan a un verificador más costoso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un modelo discriminativo de clasificación.

## Casos de uso

- Prefiltrado de traducciones automáticas de textos regulados: prospectos, avisos de seguridad de producto, resúmenes para legos de ensayos clínicos y comunicaciones oficiales de frases cortas, donde un cambio de negación, una condición omitida o una cifra alterada cambian el significado.
- Primera etapa de una cascada con juez LLM: en el conjunto de errores plantados, el 14 % de las líneas se derivaron al LLM, y la cascada alcanzó 530 aciertos de 562 con 24 falsos positivos, frente a 556 aciertos y 52 falsos del LLM solo. Reduce coste (0,00026 USD por línea en el juez) y carga de revisión.
- Control de calidad en localización farmacéutica y legal multilingüe: el modelo cubre exactamente los seis destinos habituales de estos flujos (de, fr, es, it, nl, pl) y parte de corpus de EMEA y DGT-TM, por lo que la distribución de los textos de entrada es afín.
- Priorización de la cola de revisión humana: ordenar segmentos por `p_error` permite que los revisores empiecen por los candidatos con más probabilidad de error, usando el modelo como clasificador de triaje y no como decisor final.
- Corrección asistida a nivel de palabra: los tramos etiquetados en origen y traducción permiten señalar al traductor la palabra concreta sospechosa (por ejemplo, una cifra o una entidad), acelerando la post-edición.
- Diagnóstico de errores por categoría para equipos de MT: agregar las categorías devueltas (roles, entidades, omisión, hedge) ofrece una panorámica de qué falla en un motor de traducción concreto por idioma y tipo de documento.
- Despliegue en entornos sin GPU o con requisitos de residencia de datos: al ejecutarse en CPU (90-140 ms por par) puede integrarse en procesos por lotes internos donde no se permite enviar texto a servicios externos.
- Filtro previo a la publicación de documentación multilingüe generada por un motor propio, aceptando explícitamente que un `p_error` bajo significa que no se encontró un error de los tipos entrenados, no que la traducción sea correcta.

## Benchmarks y rendimiento

Conjuntos de prueba reservados, nunca usados en entrenamiento; los umbrales se fijaron solo con datos de desarrollo. "LLM" es una comprobación de significado por retrotraducción más un juez Qwen3.8-27B sobre los mismos pares.

| Conjunto de prueba | Este modelo | Juez LLM | Cascada (este modelo primero, líneas inciertas al LLM) |
|---|---|---|---|
| Errores de significado plantados, 562 errores + 192 pares limpios, 6 idiomas (negación, cláusula omitida, roles, entidad, hedge) | 476 detectados (84,7 %), 6 falsos positivos (3,1 %), AUC 0,964 | 556 (98,9 %), 52 falsos (27,1 %) | 530 (94,3 %), 24 falsos (12,5 %), 14 % de las líneas enviadas al LLM |
| Deriva plantada de números y negación, 1.328 errores + 360 limpios | 1.309 (98,6 %), 9 falsos (2,5 %), AUC 0,997 | no disponible | no disponible |
| Traducciones automáticas reales de resúmenes para legos de ensayos, 15 errores en 250 | 5 (los 5 con "0 de cada" omitido), 21 falsos (8,9 %) | 12, 50 falsos (21 %) | 8, 26 falsos (11 %) |
| Traducciones profesionales (FLORES-200, 1.200, todas correctas) | 108 marcadas (9,0 %) | no disponible | no disponible |

Desglose por tipo de error en el conjunto de significado plantado: cláusula omitida 143/144, hedge 83/90, negación 88/106, entidad 103/132, roles 59/90. F1 de tramos de error a nivel de palabra (cualquier categoría): 0,86 en deriva numérica y 0,53 en el conjunto de significado.

Latencia medida por el autor: 90-140 ms por par de frases y 40-60 ms por par en lotes de 32, con 8 hilos en un AMD Ryzen 9 9950X3D compartido con otros servicios, en fp32.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 562 M de parámetros, no publicado por el autor): en torno a 2,25 GB solo de pesos en fp32 (el repositorio ocupa 2,3 GB), aproximadamente 1,12 GB en fp16 y unos 0,56 GB en int8; con activaciones y overhead, entre 1,5 y 3 GB según precisión.
- CPU: es el escenario documentado. El autor reporta 90-140 ms por par y 40-60 ms por par en lotes de 32 con 8 hilos en fp32.
- GPU: no hay datos de latencia o throughput en GPU publicados. Por tamaño, cualquier GPU con 4 GB o más de memoria puede alojarlo en fp16 o int8, incluidas consumer como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores; en fp32 conviene disponer de 6 GB o más. A100, H100 o L40S serían sobredimensionadas para un encoder de 562 M salvo por agregación de lote.
- Cabe en GPU de consumo: sí, con holgura, en cualquiera con 4 GB o más.
- Opciones de despliegue: la model card solo documenta inferencia en CPU. Para un encoder XLM-R son habituales los pipelines de transformers (`text-classification` y `token-classification`), ONNX Runtime, TorchScript o un servidor propio, pero el autor no documenta ninguna de estas opciones; vLLM, llama.cpp, Ollama o TGI no están contemplados para este tipo de modelo.
- Latencia y throughput: 90-140 ms por par en CPU monohilo de trabajo y 40-60 ms por par con lotes de 32 (8 hilos), según el autor. No hay cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decosa-qe-xlmr-large (este modelo) | 562.010.133 | 256 sub-tokens por par | 84,7 % de detección con 3,1 % de falsos en errores plantados; AUC 0,964; 98,6 % en deriva numérica | apache-2.0 | Pesos safetensors en HuggingFace |
| Unbabel CometKiwi | no disponible | no disponible | no disponible en la información proporcionada | CC BY-NC-SA (no comercial, según el autor) | no disponible en la información proporcionada |
| XCOMET | no disponible | no disponible | no disponible en la información proporcionada | CC BY-NC-SA (no comercial, según el autor) | no disponible en la información proporcionada |
| Juez LLM: retrotraducción + Qwen3.8-27B | no disponible | no disponible | 98,9 % de detección con 27,1 % de falsos en errores plantados; 12 de 15 errores reales con 50 falsos | no disponible | no disponible |

El eje diferencial declarado por el autor es la licencia: CometKiwi y XCOMET son las referencias abiertas fuertes en QE, pero su licencia CC BY-NC-SA impide el uso comercial, mientras que este modelo parte de un encoder MIT, se entrena con datos de licencia permisiva y se publica como Apache-2.0. Los resultados del juez LLM incluidos en la tabla provienen de la propia model card y corresponden a la comparación interna del autor, no a una evaluación independiente.

## Limitaciones y advertencias

- No detecta errores de sentido de palabra: 0 de 9 casos reales en los que, por ejemplo, "trial" clínico se tradujo como juicio.
- Se le escapan más que al juez LLM los intercambios plausibles de personas o cosas ("the seller" por "the buyer", "gafas de seguridad" por "guantes") y las negaciones que se desplazan dentro de la frase.
- Falsos positivos documentados: abreviaturas desarrolladas y comas decimales en texto clínico (18 de 21 en el conjunto real) y en torno a un 9 % en texto literario y en FLORES-200, que está íntegramente bien traducido.
- Restricciones de alcance: solo origen en inglés; solo destinos de, fr, es, it, nl, pl; máximo 256 sub-tokens por par, por lo que hay que dividir en frases y no admite documentos largos.
- No sirve para juzgar fluidez o estilo, ni para calificar a traductores humanos, ni para tomar decisiones sobre personas sin revisión humana.
- Un `p_error` bajo solo indica que no se encontró un error de los tipos entrenados; no garantiza que la traducción sea correcta.
- Entrenamiento y evaluación sobre errores plantados sintéticos. La muestra de errores reales es pequeña (15 errores), está etiquetada por el mismo equipo que construyó los datos y no pasó por revisión de hablantes nativos.
- Riesgo de dependencia del dominio de entrenamiento: los datos provienen de Tatoeba, EMEA y DGT-TM, y de plantillas propias de seguridad de producto, prospectos y avisos; otros dominios pueden degradar la calibración.
- Licencia Apache-2.0 en los pesos del modelo, pero con obligaciones de atribución heredadas de los corpus de entrenamiento (EMA como fuente y Comisión Europea / DGT-TM), que conviene revisar antes de redistribuir o desplegar comercialmente.
- El propio README se corta en la descripción del procedimiento de plantado de errores en la información disponible; no se puede verificar ese detalle.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación externa ni informes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/decosaai/decosa-qe-xlmr-large
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Motor de traducción usado para generar parte de los datos: https://huggingface.co/tencent/Hy-MT2-7B
- OPUS, corpus y alineación: J. Tiedemann, "Parallel Data, Tools and Interfaces in OPUS", LREC 2012 (https://opus.nlpl.eu/)
- Model card: no se incluyen enlaces adicionales a papers, blogs, repositorios o demos en la información proporcionada.
