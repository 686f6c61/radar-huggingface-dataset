# likhitbhogadi/anlp-a2-q1-moe_4e_top2

## Resumen

El modelo `likhitbhogadi/anlp-a2-q1-moe_4e_top2` es un transformer decoder-only con arquitectura de mezcla de expertos (MoE) entrenado desde cero para traducción automática de vietnamita a inglés y de japonés a inglés. Lo desarrolla el usuario de HuggingFace likhitbhogadi en el contexto de una asignación académica (los tags incluyen `anlp-assignment`, presumiblemente un curso de procesamiento de lenguaje natural), y cuenta con 35,3 millones de parámetros totales, de los cuales 29,0 millones están activos en cada paso de inferencia gracias al enrutamiento top-2 sobre cuatro expertos.

El modelo se entrenó sobre el conjunto de datos `belumind/en-vi-ja-curated-500k-triplets`, con un total de 30 millones de tokens de entrenamiento. El formato de secuencia es `<bos> <vi|ja> source <2en> target <eos>` y utiliza un tokenizador BPE compartido almacenado en `tokenizer.json`. Es un modelo puramente de traducción, no un modelo generativo de propósito general, por lo que su utilidad práctica se limita a los dos pares de idiomas y a la dirección indicada (source→inglés).

Su relevancia es limitada fuera del ámbito académico: no tiene licencia declarada, no acumula descargas ni interacciones y no se ha publicado información sobre cuantizaciones, longitud de contexto máxima o datos de entrenamiento más allá del recuento de tokens. El interés principal es didáctico, como ejemplo de implementación de MoE de bajo coste en un pipeline de traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE en la FFN (4 expertos enrutados de ancho 512, top-2) |
| Parametros totales | 35.277.312 (35,3 M) |
| Parametros activos | 29,0 M (aproximadamente, segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), vietnamita (vi), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos); tokenizador BPE en `tokenizer.json` |
| Direccion de traduccion | vi→en y ja→en |
| Dataset de entrenamiento | belumind/en-vi-ja-curated-500k-triplets (30 M tokens) |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-10-04 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only, es decir, sin encoder separado, que procesa la secuencia completa de entrada y genera la traducción de forma autorregresiva. La innovación estructural reside en la red feed-forward: en lugar de una FFN densa convencional, se emplea una capa de mezcla de expertos con cuatro expertos enrutados de anchura 512 y enrutamiento top-2, de modo que solo dos expertos se activan por token. Esto explica la diferencia entre parámetros totales y activos (35,3 M frente a 29,0 M) y reduce el coste computacional por token respecto a una FFN densa del mismo tamaño total.

El entrenamiento se realizó desde cero sobre el corpus `belumind/en-vi-ja-curated-500k-triplets`, con un total de 30 millones de tokens. El formato de secuencia es `<bos> <vi|ja> source <2en> target <eos>`, donde el token especial `<vi|ja>` indica el idioma de origen y `<2en>` marca la dirección de traducción hacia inglés. Se emplea un tokenizador BPE compartido entre los tres idiomas. No se documenta en la información disponible si hubo etapas de ajuste fino con RLHF, DPO u otras técnicas de alineación, ni detalles sobre la composición interna del corpus más allá del nombre del dataset.

## Capacidades

- Traduccion de vietnamita a ingles, con una perplejidad de test de 8,7512 y un BLEU (greedy, sacrebleu 13a) de 32,929.
- Traduccion de japones a ingles, con una perplejidad de test de 14,4827 y un BLEU de 22,725.
- Generacion autorregresiva con decodificacion greedy documentada en la model card.
- Manejo de un tokenizador BPE compartido para los tres idiomas (en, vi, ja).
- Enrutamiento MoE top-2 sobre cuatro expertos durante la inferencia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.
- No se documenta capacidad multilingue mas alla de los pares vi→en y ja→en.

## Casos de uso

- Traduccion de documentacion tecnica de vietnamita a ingles: el modelo puede procesar textos tecnicos en vietnamita y devolver una version en ingles, adecuado para equipos que necesitan preprocesar documentacion local antes de integrarla en un pipeline de publicacion.
- Localizacion de resenas y contenido generado por usuarios de japonés a ingles: util para plataformas de comercio electronico o foros que reciben contenido en japones y quieren ofrecer una version en ingles con BLEU en torno a 22,7.
- Preprocesamiento de corpus para investigacion en NLP: dado su tamano reducido y su naturaleza academica, sirve como linea base de traduccion vi→en y ja→en en experimentos comparativos.
- Experimentacion con arquitecturas MoE: el modelo es un ejemplo funcional de MoE top-2 de bajo coste, util para estudiar el comportamiento del enrutamiento o como punto de partida para replicar la arquitectura.
- Generacion de subtitulos en ingles a partir de transcripciones en vietnamita o japones: para contenido audiovisual de origen asiatico, el modelo puede producir traducciones linea a linea como paso previo a una revision humana.
- Prototipado de sistemas de traduccion en entornos con recursos limitados: con 35,3 M de parametros totales y 29,0 M activos, el modelo puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace util para demos y pruebas de concepto.
- Evaluacion docente: como entrega de una asignatura de NLP, sirve para ilustrar el ciclo completo de entrenamiento desde cero, desde la tokenizacion hasta la evaluacion con sacrebleu.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre el conjunto de test del corpus de entrenamiento:

| Metrica | vi→en | ja→en | Ambos |
|---|---|---|---|
| Perplejidad de test | 8,7512 | 14,4827 | 11,2579 |
| BLEU de test (greedy, sacrebleu 13a) | 32,929 | 22,725 | 27,792 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 141 MB en fp32 (35,3 M parametros × 4 bytes) y unos 71 MB en fp16 (× 2 bytes), sin contar activaciones ni memoria del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe sobradamente en RTX 3060, RTX 4090, A100 o H100, aunque las GPUs de gama alta estarian infrautilizadas.
- Inferencia en CPU: totalmente viable dado el tamano del modelo; no requiere GPU.
- Cabe en cualquier GPU de consumo, incluidas las integradas con soporte de PyTorch, y tambien en Raspberry Pi o entornos embebidos con memoria suficiente.
- Opciones de despliegue: no se documentan en la model card. Al tratarse de pesos safetensors con codigo en `src/part1/model.py` del repositorio de la asignatura, el despliegue requeriria cargar el modelo con la implementacion propietaria; los formatos GGUF u Ollama no estan disponibles en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks en un marco comun para comparar directamente con alternativas. La siguiente tabla recoge caracteristicas estructurales, marcando como "no disponible" los datos que no se han podido verificar en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| likhitbhogadi/anlp-a2-q1-moe_4e_top2 | 35,3 M totales / 29,0 M activos | no disponible | no disponible | HuggingFace (0 descargas) |
| Helsinki-NLP/opus-mt-vi-en | aproximadamente 77 M | no disponible | CC-BY-4.0 (habitual en OPUS-MT) | HuggingFace |
| NLLB-200-distilled-600M | 600 M | no disponible | CC-BY-NC-4.0 | HuggingFace |
| Modelos comparables adicionales | no disponible | no disponible | no disponible | no disponible |

La comparacion de BLEU entre estos modelos no es posible con los datos disponibles, ya que no se han evaluado sobre el mismo conjunto de test ni con la misma version de sacrebleu.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; como modelo entrenado desde cero con solo 30 M de tokens, es probable que la fluidez y fidelidad en frases largas o complejas sea limitada, especialmente en ja→en (perplejidad 14,4827 frente a 8,7512 en vi→en).
- Limitaciones de contexto: se desconoce la longitud maxima de secuencia soportada; el rendimiento en secuencias largas no esta documentado.
- Limitaciones de idioma: solo cubre vietnamita, japones e ingles, y unicamente en la direccion source→ingles. No traduce ingles a vietnamita ni a japones.
- Licencia: no declarada, lo que impide determinar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier uso en produccion.
- Naturaleza academica: el modelo forma parte de una asignatura, no ha sido validado en entornos de produccion y no ha recibido etapas documentadas de alineacion o ajuste fino.
- Ausencia de adopcion: cero descargas y cero interacciones en HuggingFace, sin comunidad que haya reportado comportamiento en casos reales.
- Despliegue: no se ofrecen pesos en formatos estandar de inferencia (GGUF, ONNX) ni integracion con frameworks como vLLM, Ollama o TGI, por lo que su uso requiere la implementacion propia del repositorio.
- Fecha de creacion inusualmente futura (2026) en los metadatos, lo que sugiere una posible anomalia en el registro del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/likhitbhogadi/anlp-a2-q1-moe_4e_top2
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/likhitbhogadi-iiit-hyderabad/anlp-a2-q1/runs/hkjl0zzt
- Dataset de entrenamiento: belumind/en-vi-ja-curated-500k-triplets (referenciado en la model card; no se ha verificado la URL exacta)
- Codigo del modelo: `src/part1/model.py` en el repositorio de la asignatura (no se proporciona URL publica)
- Resultados de traduccion de test: `test_translations.csv` (mencionado en la model card; no se proporciona URL publica)
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
