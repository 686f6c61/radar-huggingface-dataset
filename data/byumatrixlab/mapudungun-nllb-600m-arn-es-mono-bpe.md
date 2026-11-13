# byumatrixlab/mapudungun-nllb-600M-arn-es-mono-bpe

## Resumen

El modelo `mapudungun-nllb-600M-arn-es-mono-bpe` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-600M` de Meta AI, especializado en traduccion automatica del mapudungun (codigo ISO `arn`) al castellano (`es`). Lo desarrolla el grupo byumatrixlab en el contexto de un trabajo academico presentado en AmericasNLP 2026, centrado en tokenizacion consciente de la morfologia para lenguas indigenas de America. El modelo resuelve un problema clasico de las lenguas de bajos recursos: el desajuste entre la segmentacion BPE del tokenizador original de NLLB y la estructura morfologica aglutinante del mapudungun.

La propuesta concreta es una condicion "mono BPE": se entrena con un SentencePiece BPE especifico para mapudungun, en lugar de reutilizar el vocabulario multilingue de NLLB. El checkpoint tiene 615.072.768 parametros (arquitectura m2m_100 destilada) y traduce exclusivamente en la direccion arn a es. Segun la model card, el pipeline corregido del paper reporta un chrF++ medio a nivel de frase de 41,72 para esta condicion, tamano y direccion.

Es relevante ahora porque demuestra que un modelo de 600M, con un tokenizador adaptado y un corpus limitado, puede ofrecer traduccion utilizable en una lengua con pocos hablantes y escasos recursos digitales, sin necesidad de escalar a modelos de decenas de miles de millones de parametros. El interes practico esta en la reproducibilidad del pipeline y en la documentacion explicita de las obligaciones de licencia derivadas del modelo base y del corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100, destilado de NLLB-200) |
| Parametros totales | 615.072.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes GGUF ni cuantizaciones) |
| Idiomas soportados | arn (mapudungun), es (castellano) |
| Licencia | other (`nllb-and-corpus-derived-terms`): base CC-BY-NC 4.0 y corpus CC BY-NC-SA 3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder de tipo m2m_100 con atencion multi-cabeza estandar y embeddings de idioma. El ajuste fino se realiza sobre la direccion arn a es, con una condicion de tokenizacion "mono BPE": se sustituye el vocabulario multilingue original por un SentencePiece BPE entrenado solo con texto mapudungun. La motivacion declarada es morfologica: el mapudungun es una lengua aglutinante con alta productividad de sufijos, y un vocabulario dedicado reduce la fragmentacion de palabras y preserva mejor las unidades morfologicas.

El corpus de ajuste fino deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos deben consultarse en el paper citado (Thompson, Rogers y Ringger, AmericasNLP 2026). El checkpoint se describe como "paper-era archived checkpoint", es decir, la version archivada que se uso para obtener los resultados publicados. El pipeline de inferencia incluye preprocesamiento especifico para mapudungun y elimina los marcadores de continuacion `@@` de la salida en esa lengua.

## Capacidades

- Traduccion automatica unidireccional de mapudungun a castellano.
- Preprocesamiento especifico de la entrada en mapudungun, aplicado por el script `inference.py` del repositorio.
- Postprocesamiento de la salida que elimina los marcadores `@@` de continuacion de subpalabras en mapudungun.
- Tokenizacion BPE dedicada al mapudungun, orientada a preservar unidades morfologicas.
- No soporta traduccion en la direccion inversa (es a arn) segun la informacion disponible.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No se documenta modo "thinking" ni capacidades multimodales.

## Casos de uso

- Traduccion de documentacion comunitaria: traduccion de materiales educativos, sanitarios o administrativos del mapudungun al castellano para su difusion en contextos urbanos, aprovechando el ajuste especifico al dominio morfologico de la lengua.
- Investigacion en linguistica computacional de lenguas de bajos recursos: uso del checkpoint como linea base reproducible para experimentos de tokenizacion morfologica, comparando la condicion mono BPE con el tokenizador multilingue original de NLLB.
- Digitalizacion de archivos orales transcritos: traduccion de transcripciones en mapudungun a castellano para catalogacion y busqueda en archivos sonoros o corpus historicos.
- Preservacion y documentacion linguistica: generacion de traducciones de referencia que lingüistas puedan revisar y corregir, acelerando la anotacion de corpus paralelos.
- Sistemas de atencion ciudadana bilingue: integracion como componente de traduccion en portales o mesas de ayuda que reciban consultas en mapudungun y necesiten responder en castellano, siempre con revision humana por el caracter no comercial de la licencia.
- Evaluacion comparativa de modelos NLLB ajustados: uso como uno de los checkpoints de referencia en estudios que midan el efecto del tokenizador en chrF++ para lenguas indigenas.
- Prototipos de traduccion asistida para investigadores: apoyo a la lectura de textos en mapudungun mediante traduccion automatica previa a la revision manual.

## Benchmarks y rendimiento

| Metrica | Condicion | Resultado |
|---|---|---|
| chrF++ medio a nivel de frase | arn a es, 600M, mono BPE | 41,72 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros checkpoints. El unico dato de rendimiento documentado es el chrF++ citado, procedente de `results/paper_stats.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: alrededor de 2,5 GB solo para pesos, mas memoria de activaciones y KV cache; en la practica, entre 3 y 4 GB para secuencias cortas.
- VRAM estimada en fp16/bf16: aproximadamente 1,3 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o despliegue concurrente, A100 o H100 no son necesarias pero aportan throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM en fp16; en CPU es viable para traducciones puntuales.
- Opciones de despliegue: `transformers` 4.x (requisito explicito del autor), script `inference.py` incluido en el repositorio; vLLM, TGI y llama.cpp no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-arn-es-mono-bpe | 615 M | no disponible | arn, es | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | chrF++ 41,72 en arn a es; tokenizador BPE especifico |
| facebook/nllb-200-distilled-600M | 615 M | 512 tokens (documentado por Meta) | 200 idiomas | CC-BY-NC 4.0 | Modelo base multilingue; tokenizador general, sin ajuste a mapudungun |
| NLLB-200 1.3B / 3.3B | 1,3 B / 3,3 B | 512 tokens (documentado por Meta) | 200 idiomas | CC-BY-NC 4.0 | Mayores y mas costosos; sin ajuste especifico a arn |
| Otros ajustes arn-es de la literatura | no disponible | no disponible | arn, es | variable | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no comercial: el modelo base NLLB-200 se distribuye bajo CC-BY-NC 4.0 y el corpus de ajuste bajo CC BY-NC-SA 3.0; el uso comercial queda restringido por ambas obligaciones.
- El modelo solo traduce en la direccion arn a es; no se documenta la direccion inversa.
- El corpus de entrenamiento es limitado y procede de una unica fuente (Duan et al.), lo que puede introducir sesgos de dominio y de registro.
- Riesgo de alucinacion y de traducciones fluidas pero semanticamente incorrectas, especialmente en terminos tecnicos o neologismos ausentes del corpus.
- El mapudungun presenta variacion dialectal y ortografica; el modelo puede no cubrir todas las variantes.
- La longitud de contexto no esta documentada en la model card; debe consultarse el paper o el configuracion del modelo base.
- El checkpoint se describe como "paper-era archived", por lo que puede no recibir mantenimiento ni actualizaciones.
- La licencia `other` obliga a revisar los terminos de ambos upstream antes de cualquier redistribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-arn-es-mono-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper citado: Thompson, I. M., Rogers, B. M. A. y Ringger, E. K. (2026), "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", Proceedings of the Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026).
- Repositorio del autor con `inference.py` y `results/paper_stats.json`: incluido en el repositorio de Hugging Face del modelo.
