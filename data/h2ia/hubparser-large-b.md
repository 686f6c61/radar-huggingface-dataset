# H2IA/HubParser-Large-B

## Resumen

HubParser-Large-B es un modelo de análisis sintáctico completo (dependency parsing) para portugués brasileño, desarrollado por H2IA como parte de la disertación de máster HubParser (Guilherme Dallman Lima, PPGC/UFPel, 2026). Resuelve la tarea de anotación lingüística integral en una sola pasada: a partir de una frase ya tokenizada en palabras, predice conjuntamente UPOS (categoría gramatical), LEMMA, FEATS (rasgos morfológicos), HEAD (cabeza sintáctica) y DEPREL (relación de dependencia), emitiendo directamente formato CoNLL-U.

El modelo combina un encoder BERTimbau Large (335 millones de parámetros, 24 capas) con un cabezote Biaffine inspirado en Dozat y Manning (2017): clasificadores lineales para UPOS, LEMMA y FEATS, y puntuadores biafines sobre MLPs de 500 y 100 dimensiones para arcos y relaciones. La decodificación puede ser voraz, Eisner (árbol proyectivo) o MST/Chu-Liu-Edmonds (árbol no proyectivo), seleccionable en inferencia.

Su relevancia radica en que unifica cinco tareas de anotación morfosintáctica con precisión muy alta (LAS 96,16, MLAS 92,69 en el test de Porttinari) y ofrece una exportación ONNX en fp16 de 643 MB que ejecuta el parser íntegramente en el navegador mediante WebGPU o WebAssembly. Forma parte de una familia de cuatro modelos con el mismo protocolo de entrenamiento, lo que permite comparar el efecto del tamaño del encoder y del tipo de cabezote.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau Large) con cabezote Biaffine |
| Parámetros totales | 335.731.610 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (subtokens, incluyendo [CLS] y [SEP]) |
| Tipos de cuantización | fp16 (ONNX); no se documentan otras |
| Idiomas soportados | Portugués (pt), variante brasileña |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch), ONNX (model_fp16.onnx, 643 MB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-only basada en BERTimbau Large (24 capas, 335 M de parámetros) sobre la que se monta un cabezote Biaffine. UPOS, LEMMA y FEATS se resuelven mediante clasificadores lineales; HEAD y DEPREL se calculan con puntuadores biafines (Dozat y Manning, 2017) sobre MLPs de 500 dimensiones para el arco y 100 para la relación. La columna objetivo de HEAD es el primer subtoken de la palabra padre, y la raíz se representa con el token [CLS]. LEMMA se formula como clasificación sobre 252 reglas de edición (caja, caracteres eliminados del final y sufijo añadido), y FEATS como clasificación sobre 174 conjuntos completos de rasgos morfológicos.

El entrenamiento se realizó sobre Porttinari-base (8.418 frases, split de la disertación), con LEMMA y FEATS provenientes de UD_Portuguese-Porttinari r2.18 alineado. La decodificación admite tres modos: voraz, Eisner (árbol proyectivo) y MST/Chu-Liu-Edmonds (árbol no proyectivo), elegidos en tiempo de inferencia. La exportación ONNX en fp16 difiere del modelo PyTorch en un máximo de 0,006 puntos porcentuales en el test completo de Porttinari, para cualquier métrica y decodificación. No se documentan detalles sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Etiquetado UPOS (16 clases) a nivel de palabra, con predicción en el primer subtoken de cada palabra.
- Lematización mediante clasificación sobre 252 reglas de edición.
- Etiquetado de rasgos morfológicos FEATS (174 conjuntos completos).
- Análisis de dependencias: predicción conjunta de HEAD y DEPREL (44 relaciones) con decodificación voraz, Eisner o MST.
- Salida directa en formato CoNLL-U mediante el método `to_conllu`.
- Procesamiento por frases ya tokenizadas en palabras (entrada tipo columna FORM de CoNLL-U).
- Inferencia en navegador mediante ONNX Runtime Web (WebGPU o WebAssembly), una frase por vez, sin padding.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de extracción de características y etiquetado de tokens.
- Capacidad monolingüe: únicamente portugués brasileño.

## Casos de uso

- Anotación automática de corpus lingüísticos: el modelo genera árboles de dependencias completos en CoNLL-U a partir de texto tokenizado, lo que permite construir corpus anotados morfosintácticamente para investigación en lingüística computacional sin anotación manual.
- Preprocesamiento para pipelines de PLN: UPOS, LEMMA y DEPREL sirven como entrada estructurada para sistemas posteriores de extracción de información, resolución de correferencia o análisis de sentimiento basado en sintaxis.
- Etiquetado morfológico para motores de búsqueda y recuperación: la lematización y los rasgos FEATS permiten normalizar consultas y documentos en portugués antes de indexar.
- Herramientas educativas de análisis gramatical: la salida CoNLL-U con categorías, lemas y relaciones es directamente interpretable para enseñar sintaxis a estudiantes de portugués.
- Despliegue en aplicaciones web sin backend: la versión ONNX fp16 (643 MB) ejecuta el parser en el navegador del usuario mediante WebGPU o WebAssembly, como demuestra el Space HubParser, lo que evita enviar texto a servidores externos.
- Enriquecimiento de datasets para entrenamiento de modelos generativos: la anotación sintáctica de alta precisión (LAS 96,16) puede usarse para filtrar, estructurar o aumentar datos de entrenamiento en portugués.
- Análisis de dependencias no proyectivas: el modo MST/Chu-Liu-Edmonds cubre construcciones con cruces de arcos que la decodificación proyectiva de Eisner no puede representar.

## Benchmarks y rendimiento

Resultados declarados por el autor en el test de Porttinari-base (1.683 frases, 33.580 palabras), no verificados de forma independiente:

| Decodificación | UPOS | LEMMA | FEATS | UAS | LAS |
|---|---|---|---|---|---|
| Voraz | 99,38 | 99,09 | 99,10 | 97,18 | 96,15 |
| Eisner | 99,38 | 99,09 | 99,10 | 97,20 | 96,16 |
| MST | 99,38 | 99,09 | 99,10 | 97,19 | 96,15 |

Evaluación oficial CoNLL 2018 (`conll18_ud_eval.py`) sobre la salida MST: UFeats 99,13 · AllTags 98,84 · Lemmas 99,09 · UAS 97,19 · LAS 96,29 · CLAS 94,47 · MLAS 92,69 · BLEX 93,00.

Comparativa dentro de la familia HubParser (test de Porttinari, decodificación Eisner; MLAS según evaluación oficial CoNLL 2018 sobre salida MST):

| Modelo | UPOS | LEMMA | FEATS | UAS | LAS | MLAS |
|---|---|---|---|---|---|---|
| HubParser-Base-L | 99,20 | 98,96 | 98,90 | 94,18 | 92,77 | 86,55 |
| HubParser-Base-B | 99,33 | 99,11 | 99,07 | 96,96 | 95,94 | 92,12 |
| HubParser-Large-L | 99,28 | 99,00 | 99,01 | 95,15 | 93,79 | 88,14 |
| HubParser-Large-B (este modelo) | 99,38 | 99,09 | 99,10 | 97,20 | 96,16 | 92,69 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3-1,5 GB para los pesos (335 M de parámetros) más memoria de activaciones para secuencias de hasta 512 subtokens.
- VRAM estimada en fp16 (ONNX): aproximadamente 650-800 MB para los pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; A100, H100 o RTX 4090 no son necesarias para este tamaño, aunque aceleran el procesamiento por lotes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores; también en iGPU modernas mediante WebGPU.
- Despliegue: PyTorch con `transformers` y `trust_remote_code=True`; ONNX Runtime (WebGPU o WebAssembly) para navegador; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LAS (Porttinari) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HubParser-Large-B | 335 M | 512 | 96,16 | MIT | Hugging Face, ONNX |
| HubParser-Large-L | no disponible | 512 | 93,79 | MIT | Hugging Face |
| HubParser-Base-B | no disponible | 512 | 95,94 | MIT | Hugging Face |
| HubParser-Base-L | no disponible | 512 | 92,77 | MIT | Hugging Face |

No se dispone de datos de benchmarks de otros parsers de dependencias para portugués en la información proporcionada, por lo que la comparación se limita a la propia familia HubParser.

## Limitaciones y advertencias

- Modelo monolingüe: solo portugués brasileño; no procesa otros idiomas ni variantes del portugués europeo de forma fiable.
- Requiere entrada ya tokenizada en palabras: no realiza segmentación de frases ni tokenización; el usuario debe proporcionar listas de palabras.
- Límite de 512 subtokens por frase, incluyendo [CLS] y [SEP]; frases más largas deben dividirse.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model card).
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso; usarlo para esas tareas no es adecuado.
- Riesgo de errores en construcciones sintácticas ambiguas o poco representadas en Porttinari-base; el corpus de entrenamiento (8.418 frases) es relativamente pequeño.
- La decodificación voraz y Eisner no capturan árboles no proyectivos; para esos casos debe usarse MST.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el trabajo original de la disertación.
- La exportación ONNX procesa una frase por vez sin padding, lo que limita el throughput en comparación con el procesamiento por lotes en PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H2IA/HubParser-Large-B
- Modelo base BERTimbau Large: https://huggingface.co/neuralmind/bert-large-portuguese-cased
- HubParser-Base-L: https://huggingface.co/H2IA/HubParser-Base-L
- HubParser-Base-B: https://huggingface.co/H2IA/HubParser-Base-B
- HubParser-Large-L: https://huggingface.co/H2IA/HubParser-Large-L
- Demo en navegador (Space): https://huggingface.co/spaces/H2IA/HubParser
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Paper de referencia del cabezote Biaffine: Dozat y Manning (2017), "Deep Biaffine Attention for Neural Dependency Parsing" (no se proporciona URL en la información disponible)
- Disertación HubParser: Guilherme Dallman Lima, PPGC/UFPel, 2026 (no se proporciona URL en la información disponible)
