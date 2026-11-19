# H2IA/HubParser-Base-B

## Resumen

HubParser-Base-B es un modelo de análisis sintáctico completo de Universal Dependencies para portugués brasileño, desarrollado por H2IA en el marco de la disertación de máster HubParser (Guilherme Dallman Lima, PPGC/UFPel, 2026). A partir de frases ya tokenizadas en palabras, predice de forma conjunta la categoría gramatical (UPOS), el lema, los rasgos morfológicos (FEATS), la cabeza sintáctica (HEAD) y la relación de dependencia (DEPREL), generando directamente salida en formato CoNLL-U.

El modelo combina un encoder BERTimbau Base (neuralmind/bert-base-portuguese-cased, 110 millones de parámetros, 12 capas) con una cabeza biaffine inspirada en Dozat y Manning (2017). Frente a la variante lineal de la misma familia, el uso de puntuadores biaffines para arco y relación eleva el LAS de 92,77 a 95,94 y el UAS de 94,18 a 96,96 en el test de Porttinari-base, con un coste computacional prácticamente idéntico.

Es relevante para pipelines de PLN en portugués que necesiten análisis morfosintáctico de alta precisión sin depender de servicios externos: el modelo es pequeño (0,7 GB de repositorio), tiene licencia MIT, ofrece exportación ONNX en fp16 (211 MB) para ejecución en navegador vía WebGPU/WebAssembly y permite elegir entre decodificación voraz, Eisner (árbol proyectivo) o MST/Chu-Liu-Edmonds (árbol no proyectivo) en el momento de la inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau Base) con cabeza biaffine para dependency parsing |
| Parámetros totales | 110.296.986 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (subtokens, L ≤ 512 en la exportación ONNX) |
| Tipos de cuantización | fp16 (exportación ONNX oficial, 211 MB); no se documentan otras |
| Idiomas soportados | Portugués (pt), variante brasileña |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch), ONNX (fp16) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-only: BERTimbau Base procesa la frase tokenizada y sobre sus representaciones se aplican dos tipos de cabezas. UPOS, LEMMA y FEATS se resuelven con clasificadores lineales; HEAD y DEPREL se calculan con puntuadores biaffines sobre MLPs de 500 dimensiones (arco) y 100 dimensiones (relación). La columna objetivo de HEAD es el primer subtoken de la palabra padre, y la raíz se representa con el token [CLS]. El lema se predice como clasificación sobre 252 reglas de edición (combinación de cambio de caja, caracteres recortados del final y sufijo añadido), y FEATS como clasificación sobre 174 conjuntos completos de rasgos morfológicos.

El entrenamiento se realizó sobre el corpus Porttinari-base (8.418 frases, split de la disertación), con LEMMA y FEATS provenientes de UD_Portuguese-Porttinari r2.18. La predicción se hace en el primer subtoken de cada palabra e incluye puntuación. La decodificación es configurable en inferencia: voraz, Eisner (árbol proyectivo) o MST/Chu-Liu-Edmonds (árbol no proyectivo). La familia HubParser sigue el patrón de nombres `HubParser-<encoder>-<cabeza>`, con encoder Base o Large y cabeza L (lineal) o B (biaffine); los cuatro modelos se entrenaron con el mismo protocolo. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición adicional del dataset.

## Capacidades

- Etiquetado UPOS (16 etiquetas) a nivel de palabra.
- Lematización mediante clasificación sobre 252 reglas de edición.
- Etiquetado de rasgos morfológicos FEATS (174 conjuntos completos).
- Análisis de dependencias: predicción conjunta de HEAD y DEPREL (44 etiquetas de relación).
- Generación de salida en formato CoNLL-U mediante `model.to_conllu(parsed)`.
- Tres modos de decodificación seleccionables: `greedy`, `eisner` y `mst`.
- Ejecución en navegador mediante ONNX Runtime Web (WebGPU o WebAssembly) con el modelo fp16.
- Procesamiento por frases ya tokenizadas en palabras (entrada tipo columna FORM de CoNLL-U); no incluye tokenizador de segmentación de frases.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente.

## Casos de uso

- Anotación automática de corpus en portugués brasileño: el modelo genera directamente CoNLL-U con UPOS, LEMMA, FEATS, HEAD y DEPREL, lo que permite preanotar corpus lingüísticos y reducir el trabajo manual de revisión en proyectos de treebanks.
- Enseñanza de gramática asistida: integrado en una aplicación web (el Space HubParser ya lo hace vía ONNX), permite mostrar el análisis morfosintáctico de una frase al instante sin backend, útil en herramientas educativas de análisis sintáctico.
- Extracción de relaciones gramaticales para búsqueda y recuperación: las cabezas y relaciones de dependencia permiten construir índices de sujeto-verbo-objeto y consultas lingüísticas sobre textos, con una precisión LAS del 95,94 que reduce el ruido en pipelines de extracción de información.
- Preprocesado para tareas downstream de PLN: servir como capa de análisis morfosintáctico previa a sistemas de traducción, resumen o análisis de sentimiento que necesiten lemas y dependencias, con un coste de 110 millones de parámetros y ejecución viable en CPU.
- Normalización y enriquecimiento de textos en producción: la lematización con 99,11 de accuracy y el etiquetado FEATS con 99,07 permiten normalizar términos variables (flexión verbal, género, número) en índices de búsqueda o sistemas de coincidencia de entidades.
- Análisis de dependencias no proyectivas: el modo MST/Chu-Liu-Edmonds cubre estructuras no proyectivas frecuentes en portugués (por ejemplo, dislocaciones y extracciones), lo que lo hace adecuado para textos periodísticos y literarios con orden sintáctico libre.
- Validación de anotaciones en proyectos UD: el rendimiento cercano al estado del arte en Porttinari-base (MLAS 92,12) permite usarlo como comprobador automático de anotaciones humanas y detectar discrepancias en HEAD y DEPREL.

## Benchmarks y rendimiento

Resultados declarados por el autor en el test de Porttinari-base (1.683 frases, 33.580 palabras), con predicción en el primer subtoken de cada palabra y puntuación incluida:

| Decodificación | UPOS | LEMMA | FEATS | UAS | LAS |
|---|---|---|---|---|---|
| Voraz | 99,33 | 99,11 | 99,07 | 96,87 | 95,87 |
| Eisner | 99,33 | 99,11 | 99,07 | 96,96 | 95,94 |
| MST | 99,33 | 99,11 | 99,07 | 96,89 | 95,88 |

Evaluación oficial CoNLL 2018 (`conll18_ud_eval.py`) sobre la salida MST: UFeats 99,11 · AllTags 98,79 · Lemmas 99,11 · UAS 96,89 · LAS 96,01 · CLAS 93,93 · MLAS 92,12 · BLEX 92,53.

Comparación dentro de la familia HubParser (test, decodificación Eisner; MLAS sobre salida MST):

| Modelo | UPOS | LEMMA | FEATS | UAS | LAS | MLAS |
|---|---|---|---|---|---|---|
| HubParser-Base-L | 99,20 | 98,96 | 98,90 | 94,18 | 92,77 | 86,55 |
| HubParser-Base-B (este modelo) | 99,33 | 99,11 | 99,07 | 96,96 | 95,94 | 92,12 |
| HubParser-Large-L | 99,28 | 99,00 | 99,01 | 95,15 | 93,79 | 88,14 |
| HubParser-Large-B | 99,38 | 99,09 | 99,10 | 97,20 | 96,16 | 92,69 |

La versión ONNX fp16 difiere del modelo PyTorch en un máximo de 0,000 puntos porcentuales en cualquier métrica y decodificación sobre el test completo de Porttinari.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (110 millones de parámetros), más activaciones; en la práctica cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- VRAM estimada en fp16 (ONNX): aproximadamente 0,22 GB para pesos; ejecutable en CPU vía WebAssembly sin GPU dedicada.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100) para lotes grandes; para uso interactivo una GPU integrada o incluso CPU es suficiente.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas las de gama baja y las integradas.
- Opciones de despliegue: PyTorch/Transformers con `trust_remote_code=True`, ONNX Runtime (CPU y GPU), ONNX Runtime Web (WebGPU/WebAssembly) en navegador. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La restricción operativa documentada es de una frase por vez en la exportación ONNX, sin padding y con L ≤ 512.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LAS (Porttinari) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HubParser-Base-B | 110 M | 512 subtokens | 95,94 | MIT | Hugging Face, ONNX fp16 |
| HubParser-Base-L | 110 M | 512 subtokens | 92,77 | MIT | Hugging Face |
| HubParser-Large-B | no disponible | 512 subtokens | 96,16 | MIT | Hugging Face |
| HubParser-Large-L | no disponible | 512 subtokens | 93,79 | MIT | Hugging Face |

Las alternativas comparables fuera de la familia HubParser no están documentadas en la información disponible; no se dispone de datos de otros parsers de portugués para establecer una comparación directa.

## Limitaciones y advertencias

- Requiere entrada ya tokenizada en palabras: no realiza segmentación de frases ni tokenización; el usuario debe proporcionar listas de palabras como en la columna FORM de CoNLL-U.
- Limitado a portugués brasileño; no se documenta soporte para portugués europeo ni otros idiomas.
- Ventana máxima de 512 subtokens por frase en la exportación ONNX, con procesamiento de una frase por vez y sin padding.
- Requiere `trust_remote_code=True` por el uso de una clase propia, lo que implica ejecutar código del repositorio del autor.
- Riesgo de alucinación estructural: en frases ambiguas o con fenómenos no representados en Porttinari-base, las cabezas y relaciones pueden ser incorrectas aunque la salida sea formalmente válida; conviene validar en dominios alejados del corpus de entrenamiento.
- Sesgos no documentados: la model card no detalla sesgos lingüísticos, de género ni de dominio; el rendimiento en registros distintos del periodístico y literario de Porttinari no está medido.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y citar el trabajo original.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`) en el model-index.
- No se documentan integraciones con servidores de inferencia de alto rendimiento (vLLM, TGI) ni cuantizaciones GGUF para llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H2IA/HubParser-Base-B
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- HubParser-Base-L: https://huggingface.co/H2IA/HubParser-Base-L
- HubParser-Large-L: https://huggingface.co/H2IA/HubParser-Large-L
- HubParser-Large-B: https://huggingface.co/H2IA/HubParser-Large-B
- Demo en navegador (Space): https://huggingface.co/spaces/H2IA/HubParser
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Referencia del método biaffine: Dozat y Manning (2017), https://arxiv.org/abs/1611.01734
- Corpus Porttinari / UD_Portuguese-Porttinari: https://universaldependencies.org/treebanks/pt_porttinari/
- Evaluación oficial CoNLL 2018: https://universaldependencies.org/conll18/evaluation.html
