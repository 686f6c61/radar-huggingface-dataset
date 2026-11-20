# agbalu/Jugurtha-4B

## Resumen

Jugurtha-4B es un modelo generativo de tipo causal-LM desarrollado por agbalu, orientado especificamente al idioma cabilio (taqbaylit, codigo ISO `kab`, escritura latina) y con capacidad nativa de razonamiento en cadena de pensamiento en dicho idioma. Segun su autor, es el primer modelo generativo de proposito general capaz de producir cabilio verificado y ortograficamente correcto en conversacion, traduccion y razonamiento multi-paso. El modelo se distribuye bajo licencia Apache 2.0 y esta pensado como una contribucion de "soberania linguistica" para una lengua de bajos recursos.

El modelo cuenta con 4.659.865.088 parametros totales segun los pesos en safetensors (la model card distingue una "torre de texto" de 4.205.751.296 parametros y un total de 4.539.265.536, cifras que no coinciden exactamente con el conteo de safetensors). La arquitectura declarada en los tags es `qwen3_5`, con pipeline `image-text-to-text`, aunque la model card lo describe como un modelo de generacion de texto causal. Soporta tres idiomas: cabilio, ingles y frances.

Su relevancia actual radica en que demuestra que un modelo de ~4B parametros puede cubrir una lengua de bajos recursos sin sacrificar rendimiento en ingles y frances: declara una retencion media de 73,96 puntos en siete benchmarks generales y un 100% en recuperacion de aguja en contexto de 32k tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal-LM (tag `qwen3_5`); pipeline declarado `image-text-to-text` |
| Parametros totales | 4.659.865.088 (safetensors); model card: 4.205.751.296 torre de texto / 4.539.265.536 total |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 32.768 tokens (evaluado en RULER NIAH a 32k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | cabilio (`kab`), ingles (`en`), frances (`fr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La model card describe un modelo causal-LM estandar cargable con `transformers` sin necesidad de `trust_remote_code`, en BF16 y con `device_map="auto"`. Los tags incluyen `qwen3_5` como familia arquitectonica y `image-text-to-text` como pipeline, lo que sugiere una base multimodal, si bien la documentacion publicada se centra en las capacidades de texto y no detalla el componente visual. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacada es el modo de razonamiento dual: un modo conversacional estandar y un modo de razonamiento transparente paso a paso en cabilio delimitado por `<think>...</think>`, conmutable por peticion mediante el parametro `enable_thinking`. El autor reporta que el modelo escribe cabilio latino canonico (`ɣ ɛ ḥ ḍ ṣ ṭ ẓ ṛ č ǧ ţ`) sin degradacion fonemica, con una brecha ortografica de 0,00 chrF++ tras aplicar el normalizador AƔBALU versionado. La evaluacion se realizo con `lm-eval` v0.4.13 y la traduccion se puntuo a 5-shot contra la referencia FLORES+ `kab_Latn` corregida ortograficamente (dataset `agbalu/KabBench`).

## Capacidades

- Generacion de texto conversacional en cabilio, ingles y frances.
- Razonamiento en cadena de pensamiento nativo en cabilio, activable con `enable_thinking=True` y visible en etiquetas `<think>`.
- Traduccion bidireccional cabilio-ingles y, presumiblemente, cabilio-frances (la model card menciona traduccion bidireccional Kabyle ↔ English / French).
- Comprension lectora, respuesta a preguntas y resumen en cabilio.
- Recuperacion en contexto largo: 100% de acierto en needle-in-a-haystack a 32.768 tokens.
- Razonamiento matematico (GSM8K) y conocimiento multidisciplinar (MMLU-Pro).
- Clasificacion tematica en cabilio (evaluado en SIB-200).
- Explicaciones culturales.
- Capacidad multimodal potencial segun el pipeline declarado (`image-text-to-text`), no documentada en detalle.
- No se menciona soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Atencion al cliente en cabilio: el modelo puede mantener conversaciones multi-turno con hasta 32.768 tokens de contexto, lo que permite adjuntar historiales largos o documentacion de producto y mantener coherencia en taqbaylit.
- Traduccion profesional cabilio-ingles y cabilio-frances: con 46,17 chrF++ en `kab→eng` y 28,77 en `eng→kab`, es adecuado para borradores de traduccion y localizacion de contenidos, con revision humana posterior.
- Preservacion y difusion cultural: generacion de explicaciones sobre patrimonio, tradiciones y terminologia cabileña con ortografia canonica, util para portales educativos y museos.
- Resumen y comprension lectora de documentos largos en cabilio: la ventana de 32k y el 100% en NIAH permiten resumir actas, articulos o transcripciones extensas.
- Clasificacion y etiquetado de corpus cabilios: con 73,74% en SIB-200 (7-shot) frente al 14,29% de azar, sirve para organizar archivos periodisticos o academicos por tematica.
- Tutoria y asistencia educativa en matematicas: el 80,89% en GSM8K y el modo de razonamiento transparente permiten mostrar el paso a paso a estudiantes, en cabilio o en ingles.
- Asistente de escritura con modo reflexivo: activando `enable_thinking`, el modelo expone su cadena de razonamiento, util para depurar respuestas en aplicaciones de alta exigencia.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| RULER NIAH Single (32.768 tokens) | Accuracy | 100,00% |
| GSM8K (chat) | Exact match | 80,89% |
| MMLU-Pro (chat) | Exact match | 62,86% |
| IFEval | Prompt-level strict | 54,16% |
| SIB-200 (`kab_Latn`, 7-shot) | Accuracy (azar 14,29%) | 73,74% |
| FLORES+ `kab → eng` (5-shot) | chrF++ / BLEU | 46,17 / 23,79 |
| FLORES+ `eng → kab` (5-shot) | chrF++ / BLEU | 28,77 / 6,73 |
| FLORES+ brecha ortografica | chrF++ (normalizado − bruto) | 0,00 |
| Cabilio held-out | Bits per character (2.000 docs) | 1,578 |
| Retencion multilingue (media 7 tareas) | Media | 73,96 |
| MMLU | Accuracy | 74,28% |
| ARC-Challenge | Accuracy | 57,85% |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos (tamaño del repo), mas overhead de activaciones y cache KV; en la practica, 12-16 GB para contextos moderados y mas para 32k tokens.
- En cuantizacion de 8 bits cabria en GPUs de 12 GB; en 4 bits, en GPUs de 8 GB, aunque no se publican ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de produccion con contexto completo; RTX 4090 (24 GB) para BF16 con contexto largo.
- Cabe en GPU de consumo: si, en RTX 4090 en BF16; en RTX 3090/4080 (16-24 GB) con margen; en GPUs de 8-12 GB requeriria cuantizacion no publicada.
- Opciones de despliegue: `transformers` con `device_map="auto"` (soporte nativo, sin `trust_remote_code`); compatible con endpoints segun el tag `endpoints_compatible`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A nivel cualitativo:

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| Jugurtha-4B | 4,66B | 32k | kab, en, fr | Apache 2.0 |
| Modelos generalistas de ~4B (referencia del autor) | ~4B | no disponible | multilingue sin cabilio | variable |
| Alternativas especializadas en lenguas de bajos recursos | no disponible | no disponible | no disponible | no disponible |

El autor indica que los modelos generalistas de esta clase obtienen 10-14 chrF++ en `eng→kab` y etiquetan 13 de 16 muestras SIB-200 como "politics", frente a los 28,77 chrF++ y 73,74% de Jugurtha-4B.

## Limitaciones y advertencias

- Todos los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El rendimiento en cabilio esta medido sobre FLORES+ corregido ortograficamente; la calidad en dominios no cubiertos por el corpus de evaluacion es desconocida.
- IFEval de 54,16% (prompt-level strict) indica margen de mejora en el seguimiento estricto de instrucciones.
- La traduccion `eng→kab` (6,73 BLEU) sigue siendo notablemente inferior a `kab→eng` (23,79 BLEU); la generacion hacia cabilio es la direccion mas debil.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Cobertura limitada a tres idiomas (kab, en, fr); no se garantiza comportamiento correcto fuera de ellos.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de validacion externa y de datos de entrenamiento publicados aconseja evaluacion propia antes de desplegar en produccion.
- La discrepancia entre el conteo de parametros de safetensors y las cifras de la model card conviene tenerla en cuenta al planificar recursos.
- No se publican cuantizaciones oficiales, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Jugurtha-4B
- Dataset de evaluacion KabBench: https://huggingface.co/datasets/agbalu/KabBench
