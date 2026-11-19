# guilhermedallm4/HubParser-Large-L

## Resumen

HubParser-Large-L es un modelo de análisis sintáctico y morfológico completo para portugués brasileño, construido sobre el encoder BERTimbau Large (24 capas, 335 millones de parámetros) con cabeceras lineales para predecir de forma conjunta UPOS, lema, rasgos morfológicos, cabeza sintáctica y relación de dependencia (DEPREL). Lo desarrolla Guilherme Dallman Lima (PPGC/UFPel) en el marco de su disertación de máster sobre el sistema HubParser, y se distribuye con licencia MIT.

El modelo resuelve una tarea clásica de Procesamiento de Lenguaje Natural: dado un texto ya tokenizado en palabras, produce un análisis completo en formato CoNLL-U de Universal Dependencies. Frente a pipelines en cascada (etiquetador POS, lematizador y parser por separado), HubParser-Large-L unifica las cinco predicciones en un único pase sobre el encoder, lo que simplifica el despliegue y evita la propagación de errores entre etapas.

Es relevante porque combina un encoder grande específico para portugués con cabeceras ligeras y decodificación configurable (greedy, Eisner proyectiva o MST no proyectiva), y porque incluye una exportación ONNX en fp16 de 639 MB que permite ejecutar el parser íntegramente en el navegador mediante WebGPU o WebAssembly. El contexto de entrada está limitado a 512 subtokens por frase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau Large) con cabeceras lineales de clasificación por subtoken |
| Parametros totales | 335.099.566 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 subtokens por frase (límite del encoder BERT) |
| Tipos de cuantizacion | Exportación ONNX en fp16 (639 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | Portugués (pt), variante brasileña |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) y ONNX (model_fp16.onnx) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-cabeceras: un BERTimbau Large cased (24 capas, 335 M de parámetros) procesa la frase tokenizada en palabras y, sobre la representación del primer subtoken de cada palabra, cinco clasificadores lineales predicen UPOS (16 clases), lema (252 reglas de edición), FEATS (174 conjuntos completos de rasgos), DEPREL (44 clases) y HEAD (200 clases sobre la posición absoluta de la palabra padre, con 0 como raíz e índices 1..199 para las palabras). La lematización se formula como clasificación sobre reglas de edición (mayúsculas, caracteres recortados del final y sufijo añadido), no como generación secuencial.

El entrenamiento se realizó sobre Porttinari-base (8.418 frases), con los campos LEMMA y FEATS tomados de UD_Portuguese-Porttinari r2.18 y alineados frase a frase. La búsqueda de hiperparámetros empleó el conjunto de entrenamiento más validación, y el modelo final se reentrenó con ese material ampliado. La decodificación de árboles es configurable en inferencia: greedy, Eisner (árbol proyectivo) o MST/Chu-Liu-Edmonds (árbol no proyectivo). No se documentan en la información disponible detalles sobre RLHF, DPO ni composición adicional del corpus.

## Capacidades

- Etiquetado morfológico (UPOS) con precisión declarada de 99,28 sobre el test de Porttinari.
- Lematización mediante clasificación de reglas de edición, con precisión declarada de 99,00.
- Etiquetado de rasgos morfológicos completos (FEATS), con precisión declarada de 99,01.
- Análisis de dependencias (HEAD y DEPREL) con decodificación Eisner, greedy o MST.
- Predicción conjunta de las cinco tareas en un único pase, sin pipelines en cascada.
- Salida directa en formato CoNLL-U mediante el método `to_conllu`.
- Ejecución en navegador vía ONNX Runtime Web (WebGPU o WebAssembly) con el modelo fp16.
- Soporte de GPU en PyTorch mediante `trust_remote_code=True` y la clase propia del repositorio.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es un modelo de extracción de estructuras lingüísticas, no un modelo generativo.

## Casos de uso

- Anotación automática de corpus: procesar grandes volúmenes de texto portugués ya tokenizado para generar árboles CoNLL-U completos, útiles como preanotación en proyectos de lingüística de corpus y revisión humana posterior.
- Construcción de treebanks y datasets de entrenamiento: el modelo sirve para poblar corpus anotados con UPOS, lemas, FEATS y dependencias, reduciendo el coste de la anotación manual en proyectos de PLN para portugués.
- Extracción de relaciones gramaticales en buscadores y motores de búsqueda semántica: identificar sujetos, objetos y modificadores permite mejorar la indexación y la recuperación de información en portugués.
- Análisis de sentimiento y minería de opiniones a nivel de cláusula: la estructura de dependencias ayuda a asociar cada opinión con su entidad y su modificador, algo que un etiquetador POS aislado no resuelve.
- Herramientas educativas de gramática: un corrector o tutor de portugués puede mostrar la función sintáctica de cada palabra y su lema, apoyándose en la salida CoNLL-U del modelo.
- Despliegue ligero en el navegador: la exportación ONNX fp16 permite integrar el parser en una aplicación web sin servidor, con la frase procesada localmente en WebGPU o WebAssembly.
- Normalización y enriquecimiento de datos en pipelines de NLP: la lematización y los rasgos morfológicos sirven como etapa previa para sistemas de resumen, traducción o generación aumentada por recuperación en portugués.
- Preprocesado para sistemas de diálogo: la identificación de dependencias facilita la extracción de intenciones y entidades en asistentes conversacionales en portugués brasileño.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el test de Porttinari-base (1.683 frases, 33.580 palabras), con predicción en el primer subtoken de cada palabra:

| Decodificacion | UPOS | LEMMA | FEATS | UAS | LAS |
|---|---|---|---|---|---|
| Gulosa | 99,28 | 99,00 | 99,01 | 93,88 | 92,59 |
| Eisner | 99,28 | 99,00 | 99,01 | 95,15 | 93,79 |
| MST | 99,28 | 99,00 | 99,01 | 94,42 | 93,10 |

Evaluación oficial CoNLL 2018 (`conll18_ud_eval.py`) sobre la salida MST: UFeats 99,05 · AllTags 98,71 · Lemmas 99,00 · UAS 94,42 · LAS 93,23 · CLAS 90,71 · MLAS 88,14 · BLEX 89,20.

Comparación dentro de la familia HubParser (test, decodificación Eisner; MLAS según evaluación oficial CoNLL 2018 sobre salida MST):

| Modelo | UPOS | LEMMA | FEATS | UAS | LAS | MLAS |
|---|---|---|---|---|---|---|
| HubParser-Base-L | 99,20 | 98,96 | 98,90 | 94,18 | 92,77 | 86,55 |
| HubParser-Base-B | 99,33 | 99,11 | 99,07 | 96,96 | 95,94 | 92,12 |
| HubParser-Large-L (este modelo) | 99,28 | 99,00 | 99,01 | 95,15 | 93,79 | 88,14 |
| HubParser-Large-B | 99,38 | 99,09 | 99,10 | 97,20 | 96,16 | 92,69 |

No se han publicado resultados de benchmarks frente a modelos externos a la familia en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en PyTorch fp32: aproximadamente 1,3 GB para los pesos (335 M de parámetros), más memoria de activaciones según la longitud de la frase.
- VRAM estimada en ONNX fp16: aproximadamente 0,64 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32 o 1 GB para fp16; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, que no requiere gran capacidad de cómputo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 o superior) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: PyTorch con `transformers` y `trust_remote_code=True`; ONNX Runtime (WebGPU o WebAssembly en navegador); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | UAS / LAS (Porttinari) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HubParser-Large-L | 335 M | 512 subtokens | 95,15 / 93,79 | MIT | Hugging Face + ONNX |
| HubParser-Large-B | 335 M | 512 subtokens | 97,20 / 96,16 | MIT | Hugging Face |
| HubParser-Base-B | ~110 M (BERTimbau Base) | 512 subtokens | 96,96 / 95,94 | MIT | Hugging Face |
| HubParser-Base-L | ~110 M (BERTimbau Base) | 512 subtokens | 94,18 / 92,77 | MIT | Hugging Face |

Dentro de la misma familia, la variante con cabecera biaffine (B) supera a la lineal (L) en UAS y LAS con el mismo encoder, mientras que la versión Base-B logra resultados cercanos a Large-B con un encoder de menor tamaño. No se dispone de comparación con parsers externos de Universal Dependencies para portugués en la información proporcionada.

## Limitaciones y advertencias

- Solo procesa portugués brasileño; no está entrenado para otras lenguas ni para variantes europeas del portugués.
- Requiere entrada ya tokenizada en palabras (columna FORM de CoNLL-U); no realiza segmentación de texto por sí mismo.
- Límite de 512 subtokens por frase, lo que restringe el análisis de oraciones muy largas o de documentos completos sin segmentación previa.
- La cabecera HEAD clasifica sobre un máximo de 200 posiciones de palabra (0 = raíz, 1..199), lo que acota el tamaño de frase manejable en la práctica.
- Los resultados de benchmarks están declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El modelo usa código propio y exige `trust_remote_code=True`, lo que implica revisar el código del repositorio antes de ejecutarlo en producción.
- Riesgo de alucinación estructural: en frases ambiguas o fuera de dominio puede producir árboles sintácticamente plausibles pero incorrectos; conviene validar con métricas sobre el dominio objetivo.
- No es un modelo generativo: no responde preguntas, no redacta texto ni soporta tool calling o agentes.
- La licencia MIT permite uso comercial, pero conviene conservar el aviso de copyright y verificar las condiciones del modelo base BERTimbau.
- No se documentan sesgos específicos más allá de los inherentes al corpus Porttinari y al dominio periodístico del treebank.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guilhermedallm4/HubParser-Large-L
- Modelo base BERTimbau Large: https://huggingface.co/neuralmind/bert-large-portuguese-cased
- HubParser-Base-L: https://huggingface.co/guilhermedallm4/HubParser-Base-L
- HubParser-Base-B: https://huggingface.co/guilhermedallm4/HubParser-Base-B
- HubParser-Large-B: https://huggingface.co/guilhermedallm4/HubParser-Large-B
- Demo en navegador (Space): https://huggingface.co/spaces/guilhermedallm4/HubParser
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Referencia del corpus UD_Portuguese-Porttinari r2.18: no disponible como enlace en la información proporcionada
- Repositorio o paper de la disertación HubParser: no disponible en la información proporcionada
