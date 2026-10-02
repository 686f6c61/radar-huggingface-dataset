# abhirajratna/anlp-a2-moe-v5

## Resumen

El modelo `abhirajratna/anlp-a2-moe-v5` es un transformer decoder-only entrenado desde cero para traduccion automatica en dos direcciones: vietnamita a ingles y japones a ingles. Lo publica el usuario abhirajratna como parte de la asignatura Advanced NLP (Assignment 2, Task 1) y es uno de cinco variantes que comparten exactamente la misma arquitectura salvo la capa feed-forward, lo que lo convierte en una pieza de un estudio comparativo (ablation) sobre variantes de FFN, no en un modelo de proposito general.

Con 50.323.968 parametros totales y 33.563.136 parametros activos por token, es un modelo muy compacto: 8 capas, d_model 512, 8 cabezas de atencion y un vocabulario de 16.384 tokens BPE a nivel de byte compartido entre los tres idiomas. Su capa feed-forward es un Mixture-of-Experts con 4 expertos enrutados y seleccion top-2, con anchura oculta por experto de 1023 y router en float32. Se entreno con 114.291.660 tokens no-pad durante 3 epocas (9.933 pasos) sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`.

Su relevancia es acotada pero clara: ofrece resultados de traduccion medibles en un presupuesto de computo minimo (BLEU 44,45 en vi→en y 34,73 en ja→en sobre el split de test), y sirve como referencia reproducible para investigacion sobre enrutado disperso en modelos pequenos. No esta pensado como sistema de traduccion en produccion ni como modelo de chat, y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de tipo Mixture-of-Experts (4 expertos enrutados, top-2), 8 capas, d_model 512, 8 cabezas |
| Parametros totales | 50.323.968 |
| Parametros activos | 33.563.136 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors/PyTorch, sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | vietnamita (vi), japones (ja), ingles (en); traduccion vi→en y ja→en |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB), con codigo de modelo PyTorch en `code/part1/` y `tokenizer.json` |
| Vocabulario | 16.384 tokens, BPE a nivel de byte compartido para vi/ja/en |
| Router | float32 |
| Anchura oculta por experto | 1023 |
| Dataset de entrenamiento | belumind/en-vi-ja-curated-500k-triplets |
| Tokens de entrenamiento (no-pad) | 114.291.660 (3 epocas, 9.933 pasos) |
| Learning rate maximo | 0,0005 |
| Pipeline | translation |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only entrenado desde cero, sin inicializacion a partir de un modelo preentrenado. La pila tiene 8 capas con d_model 512 y 8 cabezas de atencion. La innovacion tecnica respecto a las otras cuatro variantes del trabajo es exclusivamente la capa feed-forward: en lugar de un FFN denso, se emplea un Mixture-of-Experts con 4 expertos enrutados, seleccion top-2 por token y anchura oculta de 1023 por experto, con el router manteniendo los logits en float32. Esta eleccion explica la diferencia entre parametros totales (50,3 M) y activos por token (33,6 M): aproximadamente el 66,7 % de los parametros se activan en cada paso.

El entrenamiento consumio 114.291.660 tokens no-pad repartidos en 3 epocas y 9.933 pasos, con un learning rate maximo de 0,0005, sobre el corpus `belumind/en-vi-ja-curated-500k-triplets`. El tokenizador es un BPE a nivel de byte de 16.384 entradas compartido por los tres idiomas, lo que evita fragmentacion desigual entre vietnamita, japones e ingles. La model card no documenta el uso de RLHF, DPO ni ninguna fase de alineacion posterior al preentrenamiento; el objetivo declarado es puramente de traduccion condicionada por token de idioma. El formato de entrada es `<|vi|> origen <|en|>` (o `<|ja|> ...`) y el modelo continua generando la traduccion en ingles hasta `<|eos|>`.

## Capacidades

- Traduccion vietnamita→ingles y japones→ingles, condicionada por tokens especiales de idioma de origen y destino.
- Generacion autoregresiva de texto en ingles a partir de la secuencia de entrada.
- Manejo conjunto de tres idiomas con un unico vocabulario BPE a nivel de byte de 16.384 tokens.
- Carga reproducible mediante `load_pretrained('.')` con el codigo incluido en `code/part1/` y `tokenizers.Tokenizer.from_file('tokenizer.json')`.
- Rendimiento medido sobre el split de test del trabajo (49.584 traducciones), con metricas BLEU, chrF y perplejidad publicadas.
- No se documenta soporte de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito.
- No se documenta capacidad de dialogo multi-turno ni de instrucciones genericas: el modelo es un traductor condicionado por prefijo, no un asistente.

## Casos de uso

- Investigacion sobre enrutado disperso: al ser una de cinco variantes que solo difieren en la capa feed-forward, permite aislar el efecto del MoE top-2 frente a alternativas densas bajo un presupuesto de tokens identico.
- Traduccion vi→en de bajo coste en entornos sin GPU: con 50,3 M de parametros totales, cabe en CPU o en cualquier GPU de consumo y se puede servir en un solo proceso.
- Traduccion ja→en de documentos cortos en pipelines internos: su BLEU de 34,73 y chrF de 58,32 en ja→en lo sitúan como opcion razonable para texto no critico donde la latencia y el coste importan mas que la calidad absoluta.
- Preprocesado multilingue en corpus de investigacion: normalizar o traducir grandes volumenes de texto vi/ja a ingles antes de alimentar otro sistema, dado el reducido coste por token.
- Docencia y reproduccion de experimentos: el repositorio incluye el codigo del modelo y el tokenizador, lo que facilita replicar el entrenamiento y las metricas con el mismo split de test.
- Baseline academico para comparativas: sirve como referencia cuantitativa (BLEU 39,67 agregado, perplejidad 3,729) frente a modelos mayores o frente a las otras variantes del mismo assignment.
- Prototipado rapido de interfaces de traduccion vi/ja→en en local: al ocupar menos de 1 GB en memoria, se puede ejecutar junto a otros procesos en una estacion de trabajo convencional.

## Benchmarks y rendimiento

Split de test: 24.792 tripletos, equivalentes a 49.584 traducciones.

| Metrica | vi→en | ja→en | Agregado |
|---|---|---|---|
| Perplejidad (tokens objetivo) | 3,278 | 4,241 | 3,729 |
| BLEU (greedy) | 44,45 | 34,73 | 39,67 |
| chrF (greedy) | 64,15 | 58,32 | 61,24 |

Firma sacreBLEU: `nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.6.0`.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible, lo cual es coherente con el alcance del modelo, limitado a traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,20 GB en float32 y 0,10 GB en float16/bfloat16, calculado a partir de los 50.323.968 parametros; hay que sumar la cache KV, cuyo tamano depende de una longitud de contexto que no esta documentada.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre. El modelo no requiere A100, H100 ni tarjetas de gama alta; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna es suficiente.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en CPU, dado el tamano del repositorio (0,2 GB).
- Opciones de despliegue: la model card solo documenta la carga mediante el codigo propio del repositorio (`code/part1/`) y `tokenizers`. No se mencionan integraciones con vLLM, TGI, llama.cpp u Ollama, y al no publicarse pesos en GGUF no hay una ruta de cuantizacion estandar documentada.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

Comparativa con las otras variantes del mismo trabajo academico, que comparten arquitectura y datos y solo cambian la capa feed-forward:

| Modelo | Parametros | Capas / d_model | Contexto | Licencia | Datos publicados |
|---|---|---|---|---|---|
| abhirajratna/anlp-a2-moe-v5 | 50,3 M totales / 33,6 M activos | 8 / 512 | no disponible | no disponible | Perplejidad, BLEU y chrF en vi→en y ja→en |
| orangebreak/anlp-a2-part1-moe-30M | no disponible (presupuesto de 30.000.128 tokens) | no disponible | no disponible | no disponible | no disponible |
| RaunakSeksaria/anlp-a2-moe | no disponible | 8 / 384 | no disponible | no disponible | no disponible |
| Arihant25/anlp-a2-moe | no disponible | no disponible | no disponible | no disponible | no disponible |

Frente a sistemas de traduccion de produccion como NLLB-200 o MADLAD-400, la comparacion directa no es posible con la informacion disponible: no se han publicado aqui ni el recuento de parametros, ni la ventana de contexto, ni resultados bajo protocolos equivalentes.

## Limitaciones y advertencias

- Alcance funcional muy restringido: solo traduce vi→en y ja→en. No es un modelo de instrucciones, chat, codigo ni razonamiento general.
- Licencia no declarada: sin una licencia explicita no hay autorizacion clara para uso comercial; conviene tratar el modelo como no apto para produccion hasta que el autor la especifique.
- Longitud de contexto no documentada: se desconoce la longitud maxima de secuencia soportada, lo que impide garantizar el comportamiento en documentos largos y limita el dimensionado de la cache KV.
- Riesgo de alucinacion: al ser un modelo entrenado desde cero con 114,3 M de tokens, es esperable que genere contenido fluido pero incorrecto en segmentos ambiguos, terminologia tecnica o nombres propios.
- Cobertura linguistica limitada al par vi/ja→en; no hay evaluacion publicada de en→vi ni en→ja, ni de otros idiomas pese a que el tokenizador sea multilingue.
- Sesgos potenciales del corpus `belumind/en-vi-ja-curated-500k-triplets`: no se documenta la composicion por dominio, la procedencia de los textos ni los filtros aplicados, por lo que no se pueden evaluar sesgos de dominio o de genero.
- Metricas obtenidas con decodificacion greedy y una unica firma sacreBLEU; no se reportan resultados con beam search ni intervalos de confianza, asi que las cifras no son directamente comparables con las de sistemas evaluados con otros ajustes.
- Sin datos de latencia, throughput ni consumo: no hay base para estimar costes operativos en produccion.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes) y fecha de creacion atipica en la metadata (2026-10-01), lo que reduce la validacion externa del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhirajratna/anlp-a2-moe-v5
- Discusiones del modelo: https://huggingface.co/abhirajratna/anlp-a2-moe-v5/discussions
- Variante del mismo trabajo (RaunakSeksaria): https://huggingface.co/RaunakSeksaria/anlp-a2-moe
- Variante del mismo trabajo (Arihant25): https://huggingface.co/Arihant25/anlp-a2-moe
- Variante del mismo trabajo (orangebreak): https://huggingface.co/orangebreak/anlp-a2-part1-moe-30M
- Dataset de entrenamiento referenciado: belumind/en-vi-ja-curated-500k-triplets (identificador citado en la model card; no se ha verificado su URL directa)
