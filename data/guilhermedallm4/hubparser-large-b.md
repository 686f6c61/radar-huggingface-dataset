# guilhermedallm4/HubParser-Large-B

## Resumen

HubParser-Large-B es un modelo de análisis sintáctico y morfológico completo para portugués brasileño, desarrollado por Guilherme Dallman Lima (PPGC/UFPel) como parte de su disertación de máster sobre el sistema HubParser. Se trata de un modelo BERT de 335 millones de parámetros (BERTimbau Large, 24 capas) con una cabeza de parsing biaffine que predice de forma conjunta UPOS, lema, rasgos morfológicos (FEATS), cabeza sintáctica (HEAD) y relación de dependencia (DEPREL) a partir de frases ya tokenizadas en palabras. El modelo se entrenó sobre el corpus Porttinari-base y sigue el formato Universal Dependencies, lo que lo hace directamente interoperable con el ecosistema CoNLL-U.

El modelo resuelve una tarea clásica de NLP de pipeline (tokenización, etiquetado y parsing) en una única pasada, evitando la propagación de errores entre etapas. Su relevancia actual radica en que ofrece resultados de parsing de alta precisión para portugués en un paquete autocontenido, con licencia MIT, exportación ONNX para inferencia en navegador y tres algoritmos de decodificación seleccionables en tiempo de inferencia (greedy, Eisner proyectivo y MST/Chu-Liu-Edmonds no proyectivo).

Forma parte de una familia de cuatro modelos (Base/Large × Linear/Biaffine) entrenados con el mismo protocolo, y esta variante Large-Biaffine es la de mayor rendimiento de la familia según los datos declarados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau Large) con cabeza biaffine de parsing |
| Parámetros totales | 335.731.610 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (subtokens; límite del encoder BERT) |
| Tipos de cuantización | ONNX en fp16 (643 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | Portugués (pt), variante brasileña |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch), ONNX (fp16) |
| Capas del encoder | 24 |
| Etiquetas UPOS | 16 |
| Etiquetas DEPREL | 44 |
| Reglas de lematización | 252 |
| Conjuntos de FEATS | 174 |
| Tamaño del repo | 2.0 GB |
| Pipeline declarado | token-classification (token-classification + dependency parsing) |

## Arquitectura y entrenamiento

El modelo combina un encoder BERTimbau Large (24 capas, 335 M de parámetros, preentrenado sobre portugués brasileño) con una cabeza biaffine inspirada en Dozat & Manning (2017). Las tareas UPOS, LEMMA y FEATS se resuelven mediante clasificadores lineales sobre las representaciones del encoder, mientras que HEAD y DEPREL se calculan con puntuadores biaffines sobre MLPs de 500 dimensiones (arco) y 100 dimensiones (relación). La columna objetivo de HEAD es el primer subtoken de la palabra padre, y la raíz se representa con el token [CLS]. La lematización se formula como clasificación sobre 252 reglas de edición (cambio de caja, caracteres truncados del final y sufijo añadido), y FEATS como clasificación sobre 174 conjuntos completos de rasgos morfológicos.

El entrenamiento se realizó sobre Porttinari-base (8.418 frases, split de la disertación) con el mismo protocolo para los cuatro modelos de la familia. La decodificación puede ser greedy, Eisner (árbol proyectivo) o MST/Chu-Liu-Edmonds (árbol no proyectivo), seleccionable en inferencia; UPOS, LEMMA y FEATS no dependen de la decodificación. La exportación ONNX en fp16 difiere del modelo PyTorch en como máximo 0,006 puntos porcentuales en el test completo de Porttinari, según el autor. No se documentan detalles sobre uso de RLHF/DPO (no aplica a esta tarea) ni sobre la composición exacta del corpus más allá de su tamaño.

## Capacidades

- Etiquetado morfosintáctico (UPOS) sobre frases ya tokenizadas en palabras.
- Lematización mediante clasificación sobre 252 reglas de edición.
- Etiquetado de rasgos morfológicos completos (FEATS) sobre 174 conjuntos posibles.
- Parsing de dependencias: predicción de cabeza (HEAD) y relación (DEPREL) en formato Universal Dependencies.
- Tres modos de decodificación: greedy, Eisner (proyectivo) y MST/Chu-Liu-Edmonds (no proyectivo).
- Salida directa en formato CoNLL-U mediante el método `to_conllu`.
- Inferencia en navegador vía ONNX Runtime Web (WebGPU o WebAssembly) con el modelo fp16.
- Integración con `transformers` mediante `trust_remote_code=True` y clase propia.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre; es un modelo discriminativo de etiquetado.

## Casos de uso

- Análisis sintáctico de corpus lingüísticos: procesamiento por lotes de textos periodísticos o académicos en portugués para construir treebanks anotados en CoNLL-U, aprovechando la salida directa y la licencia MIT.
- Enriquecimiento de pipelines de PLN downstream: extracción de sujeto, objeto y modificadores para sistemas de extracción de relaciones o resumen, usando las etiquetas DEPREL y HEAD.
- Preprocesado para sistemas de traducción o generación: análisis morfosintáctico previo que aporte lemas y rasgos gramaticales a modelos generativos en portugués.
- Herramientas educativas de gramática: visualización de árboles de dependencias y etiquetas morfológicas para enseñanza de portugués, desplegable en navegador gracias a la exportación ONNX.
- Búsqueda y recuperación de información lingüística: indexación por lema y categoría gramatical para motores de búsqueda en corpus portugueses, con la ventaja de que UPOS y LEMMA alcanzan el 99,38 % y 99,09 % de exactitud declarada.
- Anonimización y análisis de entidades en textos legales o clínicos: identificación de estructuras sintácticas para localizar sintagmas nominales y dependencias antes de aplicar reglas de redacción.
- Evaluación de parsers y comparación de decodificadores: banco de pruebas para medir el impacto de Eisner frente a MST en un corpus concreto, ya que el modelo permite cambiar el decodificador en inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el test de Porttinari-base (1.683 frases, 33.580 palabras). No verificados de forma independiente.

| Decodificación | UPOS | LEMMA | FEATS | UAS | LAS |
|---|---|---|---|---|---|
| Greedy | 99,38 | 99,09 | 99,10 | 97,18 | 96,15 |
| Eisner | 99,38 | 99,09 | 99,10 | 97,20 | 96,16 |
| MST | 99,38 | 99,09 | 99,10 | 97,19 | 96,15 |

Evaluación oficial CoNLL 2018 (`conll18_ud_eval.py`) sobre la salida MST:

| Métrica | Valor |
|---|---|
| UFeats | 99,13 |
| AllTags | 98,84 |
| Lemmas | 99,09 |
| UAS | 97,19 |
| LAS | 96,29 |
| CLAS | 94,47 |
| MLAS | 92,69 |
| BLEX | 93,00 |

Comparativa interna de la familia HubParser (test, decodificación Eisner; MLAS sobre salida MST):

| Modelo | UPOS | LEMMA | FEATS | UAS | LAS | MLAS |
|---|---|---|---|---|---|---|
| HubParser-Base-L | 99,20 | 98,96 | 98,90 | 94,18 | 92,77 | 86,55 |
| HubParser-Base-B | 99,33 | 99,11 | 99,07 | 96,96 | 95,94 | 92,12 |
| HubParser-Large-L | 99,28 | 99,00 | 99,01 | 95,15 | 93,79 | 88,14 |
| HubParser-Large-B | 99,38 | 99,09 | 99,10 | 97,20 | 96,16 | 92,69 |

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 1,3-1,5 GB para pesos (335 M de parámetros) más activaciones; con lotes pequeños cabe en GPUs de 4 GB o incluso en CPU.
- VRAM estimada en fp16 (ONNX): aproximadamente 650 MB de pesos, más memoria de activaciones para la matriz de arcos [L, L] y relaciones [L, L, 44], que crece de forma cuadrática con la longitud de la frase.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, GTX 1660, T4, RTX 4090, A100, H100); el modelo es pequeño y se beneficia más del paralelismo por lotes que de GPU de gama alta.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas, y también en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, ONNX Runtime (incluido ONNX Runtime Web para navegador con WebGPU o WebAssembly), y el Space oficial HubParser.
- Throughput y latencia: no disponibles en la información proporcionada; dependen de la longitud de frase, el tamaño de lote y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | UAS / LAS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HubParser-Large-B | 335 M | 512 subtokens | 97,20 / 96,16 (Eisner, Porttinari) | MIT | Hugging Face, ONNX, Space |
| HubParser-Large-L | 335 M | 512 subtokens | 95,15 / 93,79 (Eisner, Porttinari) | MIT | Hugging Face |
| HubParser-Base-B | ~110 M | 512 subtokens | 96,96 / 95,94 (Eisner, Porttinari) | MIT | Hugging Face |
| HubParser-Base-L | ~110 M | 512 subtokens | 94,18 / 92,77 (Eisner, Porttinari) | MIT | Hugging Face |

No se dispone en la información proporcionada de comparaciones con parsers externos a la familia HubParser (por ejemplo, otros modelos UD para portugués); esos datos figuran como no disponibles.

## Limitaciones y advertencias

- Requiere entrada ya tokenizada en palabras (columna FORM del CoNLL-U); no realiza segmentación de frases ni tokenización.
- Límite de 512 subtokens por frase en el encoder BERT; frases más largas deben dividirse.
- Entrenado exclusivamente sobre Porttinari-base (8.418 frases), lo que puede limitar la generalización a dominios muy distintos (lenguaje oral, textos históricos, portugués europeo).
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- No es un modelo generativo: no sirve para resumen, traducción ni diálogo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede producir etiquetas sintácticamente inconsistentes en construcciones ambiguas o poco representadas.
- El uso comercial está permitido por la licencia MIT, pero conviene revisar las condiciones del corpus Porttinari-base y del modelo base BERTimbau para usos derivados.
- La carga del modelo requiere `trust_remote_code=True` por el uso de una clase propia, lo que implica ejecutar código del repositorio; auditar antes en entornos de producción.
- Solo soporta portugués; no se declaran capacidades multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guilhermedallm4/HubParser-Large-B
- Modelo base BERTimbau Large: https://huggingface.co/neuralmind/bert-large-portuguese-cased
- Variante HubParser-Base-L: https://huggingface.co/guilhermedallm4/HubParser-Base-L
- Variante HubParser-Base-B: https://huggingface.co/guilhermedallm4/HubParser-Base-B
- Variante HubParser-Large-L: https://huggingface.co/guilhermedallm4/HubParser-Large-L
- Space HubParser (demo en navegador): https://huggingface.co/spaces/guilhermedallm4/HubParser
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Referencia del decodificador biaffine (Dozat & Manning, 2017): no disponible en la información proporcionada
- Repositorio del proyecto HubParser: no disponible en la información proporcionada
- Artículo o memoria de la disertación: no disponible en la información proporcionada
