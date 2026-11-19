# guilhermedallm4/HubParser-Base-B

## Resumen

HubParser-Base-B es un modelo de análisis morfosintáctico completo para portugués brasileño, desarrollado por Guilherme Dallman Lima (PPGC/UFPel) en el marco de su tesis de máster sobre el sistema HubParser. El modelo resuelve la tarea de *dependency parsing* en el marco de Universal Dependencies: a partir de una frase ya tokenizada en palabras, predice de forma conjunta la categoría gramatical (UPOS), el lema, los rasgos morfológicos (FEATS), la cabeza sintáctica (HEAD) y la relación de dependencia (DEPREL).

Técnicamente se trata de un encoder BERTimbau Base (110 millones de parámetros, 12 capas) sobre el que se monta una cabeza biaffine inspirada en Dozat y Manning (2017), con clasificadores lineales para UPOS, LEMMA y FEATS y pontuadores biaffines sobre MLPs de 500 y 100 dimensiones para arco y relación. Se entrenó sobre el corpus Porttinari-base y forma parte de una familia de cuatro variantes (Base/Large × Linear/Biaffine) entrenadas con el mismo protocolo.

Su relevancia radica en que ofrece un parser UD completo y ligero (0,7 GB de repositorio, exportable a ONNX en fp16 de 211 MB) ejecutable incluso en el navegador mediante ONNX Runtime Web, con resultados en el test de Porttinari que superan el 99 % en UPOS, LEMMA y FEATS y alcanzan 96,96 UAS y 95,94 LAS con decodificación Eisner.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau Base) con cabeza biaffine para dependency parsing |
| Parametros totales | 110.296.986 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 subtokens (limite de entrada del encoder BERT; el ONNX admite L ≤ 512) |
| Tipos de cuantizacion | Exportacion ONNX en fp16 (model_fp16.onnx, 211 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | Portugues (pt), variante brasileña |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (fp16) y PyTorch (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-only clásica: un BERTimbau Base de 12 capas y 110 millones de parámetros (derivado de `neuralmind/bert-base-portuguese-cased`) que produce representaciones contextuales por subtoken. Sobre esas representaciones se sitúa una cabeza biaffine con dos componentes: clasificadores lineales que predicen UPOS (16 etiquetas), LEMMA (252 reglas de edición) y FEATS (174 conjuntos completos de rasgos morfológicos), y pontuadores biaffines (Dozat y Manning, 2017) sobre MLPs de 500 dimensiones para el arco y 100 dimensiones para la relación, que producen las matrices de puntuación de HEAD y DEPREL. La columna objetivo de HEAD es el primer subtoken de la palabra padre, y la raíz se representa con el token [CLS].

El entrenamiento se realizó sobre el corpus Porttinari-base (8.418 frases, con el split definido en la tesis), prediciendo en el primer subtoken de cada palabra e incluyendo la puntuación. La decodificación es configurable en inferencia entre tres estrategias: voraz, Eisner (árbol proyectivo) y MST/Chu-Liu-Edmonds (árbol no proyectivo). La innovación destacable es la formulación del lema como clasificación sobre 252 reglas de edición (cambio de caja, caracteres recortados del final y sufijo añadido) en lugar de generación secuencial, lo que permite predecir el lema con un clasificador lineal. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición adicional del dataset más allá de Porttinari-base.

## Capacidades

- Análisis de dependencias completo en Universal Dependencies: predicción conjunta de UPOS, LEMMA, FEATS, HEAD y DEPREL para cada palabra de una frase tokenizada.
- Etiquetado morfológico: 16 etiquetas UPOS y 174 conjuntos completos de rasgos morfológicos (FEATS).
- Lematización mediante clasificación sobre 252 reglas de edición.
- Tres modos de decodificación seleccionables en inferencia: voraz, Eisner (árbol proyectivo) y MST/Chu-Liu-Edmonds (árbol no proyectivo).
- Salida en formato CoNLL-U mediante el método `to_conllu`, con `head = 0` para la raíz.
- Ejecución en navegador mediante el export ONNX en fp16 con ONNX Runtime Web (WebGPU o WebAssembly).
- Acceso programático a las listas de etiquetas en `model.config.upos_labels`, `deprel_labels`, `lemma_rules` y `feats_labels`.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre: es un modelo discriminativo de etiquetado por token.

## Casos de uso

- Anotación automática de corpus UD en portugués: el modelo genera árboles CoNLL-U completos a partir de texto tokenizado, lo que permite crear corpus sintácticamente anotados para entrenamiento de modelos posteriores o para investigación lingüística, con LAS de 95,94 en el test de Porttinari.
- Preprocesamiento para pipelines de PLN: al producir lemas, POS y dependencias en una sola pasada, sirve como etapa previa para sistemas de extracción de información, resumen o traducción que necesiten estructura sintáctica.
- Análisis lingüístico y educativo: la salida CoNLL-U con rasgos morfológicos detallados (género, número, tiempo, modo, voz) permite construir herramientas de análisis gramatical para enseñanza del portugués.
- Procesamiento en el navegador sin servidor: el ONNX fp16 de 211 MB ejecutable con ONNX Runtime Web permite integrar análisis sintáctico en aplicaciones web cliente, sin enviar texto a un backend, útil por privacidad y latencia.
- Extracción de relaciones y sujetos/objetos: las etiquetas DEPREL (`nsubj`, `obj`, `xcomp`, etc.) permiten identificar argumentos verbales y relaciones gramaticales para sistemas de question answering o minería de textos.
- Normalización y enriquecimiento de bases de datos léxicas: la combinación de lematización y rasgos FEATS facilita la construcción de índices léxicos, diccionarios inversos y concordancias sobre corpus portugueses.
- Búsqueda sintáctica en corpus: al disponer de árboles de dependencias anotados, se pueden formular consultas por patrones gramaticales (por ejemplo, "verbo con objeto directo en pasiva") en herramientas de corpus linguistics.

## Benchmarks y rendimiento

Resultados declarados por el autor en el test de Porttinari-base (1.683 frases, 33.580 palabras), con predicción en el primer subtoken de cada palabra y puntuación incluida. La decodificación Eisner es la reportada en el model-index; UPOS, LEMMA y FEATS no dependen de la decodificación.

| Decodificacion | UPOS | LEMMA | FEATS | UAS | LAS |
|---|---|---|---|---|---|
| Voraz (greedy) | 99,33 | 99,11 | 99,07 | 96,87 | 95,87 |
| Eisner | 99,33 | 99,11 | 99,07 | 96,96 | 95,94 |
| MST | 99,33 | 99,11 | 99,07 | 96,89 | 95,88 |

Evaluación oficial CoNLL 2018 (`conll18_ud_eval.py`) sobre la salida MST: UFeats 99,11 · AllTags 98,79 · Lemmas 99,11 · UAS 96,89 · LAS 96,01 · CLAS 93,93 · MLAS 92,12 · BLEX 92,53.

Comparación dentro de la familia HubParser (test, decodificación Eisner; MLAS por evaluación oficial CoNLL 2018 sobre salida MST):

| Modelo | UPOS | LEMMA | FEATS | UAS | LAS | MLAS |
|---|---|---|---|---|---|---|
| HubParser-Base-L | 99,20 | 98,96 | 98,90 | 94,18 | 92,77 | 86,55 |
| HubParser-Base-B (este modelo) | 99,33 | 99,11 | 99,07 | 96,96 | 95,94 | 92,12 |
| HubParser-Large-L | 99,28 | 99,00 | 99,01 | 95,15 | 93,79 | 88,14 |
| HubParser-Large-B | 99,38 | 99,09 | 99,10 | 97,20 | 96,16 | 92,69 |

Según el autor, la versión ONNX fp16 difiere del modelo en PyTorch en un máximo de 0,000 puntos porcentuales en cualquier métrica y decodificación sobre el test completo de Porttinari.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp32 ocupa aproximadamente 0,44 GB de pesos (110 M de parámetros); en fp16, unos 0,22 GB. Con activaciones para secuencias de hasta 512 subtokens, la inferencia cabe holgadamente en GPUs de 4 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3090 ofrecen un margen amplio para procesamiento por lotes. Para uso individual, una GTX 1650 o superior basta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 20xx en adelante, e incluso modelos integrados con WebGPU para la variante ONNX).
- Opciones de despliegue: PyTorch con `transformers` y `trust_remote_code=True`; ONNX Runtime (incluido ONNX Runtime Web con WebGPU o WebAssembly para navegador); vLLM, TGI y llama.cpp no están orientados a este tipo de modelo discriminativo y no se documentan como opciones.
- Latencia y throughput: no se publican cifras concretas de latencia ni throughput en la información disponible. La variante ONNX procesa una frase por vez sin padding, con L ≤ 512, lo que limita el paralelismo a nivel de lote en el navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | UAS / LAS (Porttinari test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HubParser-Base-B | 110 M | 512 subtokens | 96,96 / 95,94 (Eisner) | MIT | Hugging Face, ONNX fp16, Space en navegador |
| HubParser-Base-L | 110 M | 512 subtokens | 94,18 / 92,77 (Eisner) | MIT (misma familia) | Hugging Face |
| HubParser-Large-B | no disponible (BERTimbau Large) | 512 subtokens | 97,20 / 96,16 (Eisner) | MIT (misma familia) | Hugging Face |
| HubParser-Large-L | no disponible (BERTimbau Large) | 512 subtokens | 95,15 / 93,79 (Eisner) | MIT (misma familia) | Hugging Face |

No se dispone en la información proporcionada de comparaciones con parsers UD externos a la familia HubParser (por ejemplo, modelos basados en Stanza, UDPipe o spaCy para portugués), por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- La entrada debe estar ya tokenizada en palabras (columna FORM del CoNLL-U); el modelo no realiza segmentación de texto ni tokenización desde cadena cruda.
- Longitud máxima de 512 subtokens por frase; frases más largas deben truncarse o dividirse, lo que puede degradar la calidad del árbol.
- Solo cubre portugués brasileño; no se documenta soporte para portugués europeo ni otros idiomas.
- Es un modelo discriminativo de etiquetado: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no debe emplearse como modelo conversacional.
- Requiere `trust_remote_code=True` por el uso de una clase propia, lo que implica ejecutar código del repositorio del autor; conviene revisarlo antes de desplegarlo en producción.
- Los resultados de benchmarks son declarados por el autor y figuran con `verified: false` en el model-index; no han sido verificados de forma independiente en la información disponible.
- El rendimiento se ha medido exclusivamente sobre Porttinari-base; el comportamiento en dominios distintos (texto jurídico, redes sociales, lenguaje informal) no está documentado y podría degradarse.
- Riesgo de errores en construcciones ambiguas o no proyectivas: aunque se ofrece decodificación MST para árboles no proyectivos, las métricas reportadas con Eisner y MST son muy próximas y no se detalla el comportamiento en casos límite.
- La licencia MIT permite uso comercial, pero no se documentan garantías ni soporte por parte del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guilhermedallm4/HubParser-Base-B
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Variante HubParser-Base-L: https://huggingface.co/guilhermedallm4/HubParser-Base-L
- Variante HubParser-Large-L: https://huggingface.co/guilhermedallm4/HubParser-Large-L
- Variante HubParser-Large-B: https://huggingface.co/guilhermedallm4/HubParser-Large-B
- Demo en el navegador (Space): https://huggingface.co/spaces/guilhermedallm4/HubParser
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
