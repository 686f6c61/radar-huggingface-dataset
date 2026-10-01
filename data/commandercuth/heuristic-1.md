# CommanderCuth/Heuristic-1

## Resumen

Heuristic-1 es un sistema de generacion de texto publicado por el usuario CommanderCuth en HuggingFace. No es un modelo con pesos propios ni una fusion de tensores: es un pipeline de inferencia en tiempo de ejecucion que combina dos modelos independientes servidos por separado. Un "pensador" (thinker) genera respuestas candidatas y un "juez" (judge) independiente las puntua, devolviendo la ganadora a traves de un unico endpoint compatible con OpenAI.

La arquitectura subyacente combina el modelo Bonsai 2 27B en su variante ternaria (prism-ml/Ternary-Bonsai-2-27B-gguf, aproximadamente 27.000 millones de parametros) como thinker, y el modelo Decider-4B (Mapika/decider-4b, aproximadamente 4.000 millones de parametros) como juez System-One. La orquestacion la realiza el framework MetaCog, tambien de codigo abierto y desarrollado por el mismo autor. El paquete no incluye pesos, solo el codigo del pipeline.

El punto relevante es que el juez es un modelo distinto del pensador, de modo que la evaluacion de las respuestas es externa al generador. El sistema ejecuta una respuesta "ancla" voraz y, si no supera el umbral de confianza de 0,80, lanza hasta 7 trayectorias muestreadas en paralelo que se juzgan a medida que terminan. El autor reporta mejoras medibles en HumanEval (de 65,9% a 82,3%) a cambio de un mayor coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de inferencia en tiempo de ejecucion (pipeline thinker + judge orquestado por MetaCog); modelos subyacentes transformer, thinker en variante ternaria |
| Parametros totales | Thinker: ~27B (Bonsai 2 27B); juez: ~4B (Decider-4B); ~31B combinados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Thinker: PQ2_0 (ternaria, fichero de 6,66 GiB). Juez: no disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT (codigo del pipeline); modelos padre bajo Apache-2.0 (Bonsai 2 27B y Decider-4B) |
| Formato de pesos | GGUF para el thinker (Ternary-Bonsai-2-27B-PQ2_0.gguf); no disponible para el juez |

## Arquitectura y entrenamiento

El sistema no entrena ningun modelo nuevo ni promedia tensores entre los dos componentes: es un merge a nivel de inferencia. El thinker (Bonsai 2 27B, variante ternaria de PrismML) genera texto, mientras que el juez (Decider-4B) actua como evaluador System-One y asigna una puntuacion de confianza a cada salida. MetaCog conecta ambos servicios y expone una unica ruta `/v1/chat/completions` bajo el identificador de modelo `bonsai-decider4b-merge`.

El bucle de decision, implementado en `race.py`, funciona asi: el prompt se envia al thinker y su respuesta voraz (ancla) se juzga primero; si la confianza supera 0,80 y la generacion ha finalizado, se devuelve de inmediato. Si no, se lanzan 7 trayectorias muestreadas en paralelo, cada una juzgada en cuanto termina; la primera que supere 0,80 gana y el resto se abandona. Si ninguna alcanza el umbral, gana la mejor ruta finalizada segun el juez. Existe una variante secuencial heredada (`MetaCog best_of_n`) accesible mediante `NO_RACE=1` o `--no-race`. La temperatura por defecto es 0,8, el maximo de tokens 2048 y el numero de rutas 8. No se detallan datos de entrenamiento, composicion del dataset ni tecnicas de RLHF/DPO, porque el sistema no entrena modelos propios.

## Capacidades

- Generacion de texto y razonamiento general mediante el thinker Bonsai 2 27B.
- Generacion y resolucion de codigo: el autor valida el sistema con HumanEval (164 problemas) con evaluacion pass@1 real.
- Aritmetica y problemas de razonamiento con trampa, validados con un conjunto de 10 preguntas dificiles.
- Seleccion de respuestas mediante votacion con juez externo (best-of-N con parada temprana).
- Servicio a traves de un endpoint compatible con la API de OpenAI (`/v1/chat/completions`).
- Metrica de confianza expuesta en cada respuesta mediante el campo `merge.judge_confidence`.
- No se documentan capacidades de vision, audio, tool calling explicito ni soporte de agentes multi-paso.

## Casos de uso

- Generacion de codigo asistida con verificacion: el sistema propone varias implementaciones y el juez elige la que supera el umbral de confianza, lo que segun el autor eleva el pass@1 en HumanEval de 65,9% a 82,3%.
- Resolucion de problemas aritmeticos y de razonamiento dificil: la votacion con juez externo corrige respuestas erroneas del thinker en calculos grandes y problemas con truco (10/10 frente a 8/10 del modelo solo).
- Backend de un chatbot en local: al exponer una API compatible con OpenAI, puede sustituir a un endpoint unico en aplicaciones existentes sin cambiar el cliente.
- Experimentacion en investigacion sobre metacognicion y evaluacion externa: sirve como banco de pruebas para estudiar la separacion thinker/judge y el efecto de umbrales de confianza.
- Evaluacion A/B de estrategias de decodificacion: el arnes `eval/ab_bonsai_vs_merge.py` permite comparar directamente el modelo base frente al ensemble con los mismos conjuntos de problemas.
- Procesamiento por lotes de preguntas verificables: `merge.py` acepta un fichero JSONL de entrada y devuelve respuestas, confianza y tiempos en otro JSONL, util para evaluaciones automatizadas.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. Las mediciones de HumanEval corresponden a n=164 con pass@1 real (prompt y completacion evaluados como un unico programa, con etiqueta `<think>` eliminada).

| Evaluacion | Bonsai solo | Heuristic-1 (merge) | Nota |
|---|---|---|---|
| HumanEval (n=164, pass@1) | 108/164 (65,9%) | 135/164 (82,3%) | Juez corrigio 27 casos, rompio 0; McNemar p < 1e-6 |
| 12 preguntas faciles de Q&A (verificadas) | 12/12 | 12/12 | Empate; nada que corregir |
| 10 preguntas dificiles de Q&A (verificadas, trampas + aritmetica grande) | 8/10 | 10/10 | Juez corrigio 2 casos, rompio 0 |

Coste por problema (medias de HumanEval): el merge emplea ~5.600 tokens de thinker en 2,0 llamadas de thinker y 8,5 llamadas de juez; Bonsai solo emplea ~700 tokens en 1 llamada. Aproximadamente 8 veces los tokens del thinker para +16 puntos de precision, con coste 0 en hardware local.

Latencia: cuando el juez confia en la respuesta voraz, devuelve de inmediato (similar a Bonsai solo, por ejemplo 2,5 s en un prompt trivial); la votacion completa solo se ejecuta cuando hay incertidumbre. En 3 problemas de HumanEval donde se ejecuto la votacion completa (DGX Spark, rutas secuenciales, bucle antiguo), Heuristic-1 tardo 210 s / 406 s / 440 s frente a 17 s / 18 s / 18 s de Bonsai solo, es decir, entre 12 y 24 veces mas lento en wall-clock en problemas dificiles. El bucle `race.py` paraleliza las rutas muestreadas y corta en cuanto una supera 0,80, lo que reduce gran parte de esa diferencia, pero el autor indica que hay que remedirlo.

## Requisitos de hardware

- Thinker: el fichero `Ternary-Bonsai-2-27B-PQ2_0.gguf` ocupa 6,66 GiB, servido con el fork de llama.cpp de PrismML (bjev) en el puerto 8010.
- Juez: servidor `/v1/systemone` sobre el checkpoint `Mapika/decider-4b` en el puerto 8008 (referencia `runs/judge_server.py`).
- El autor situa el conjunto completo en aproximadamente 20 GB de memoria en una DGX Spark (ambos modelos a la vez) y con coste 0 en hardware local.
- VRAM concreta por GPU, modelos de tarjeta recomendados (A100, H100, RTX 4090) y si cabe en GPU de consumo: no disponible.
- Opciones de despliegue: el thinker usa un fork de llama.cpp; el juez requiere un endpoint `/v1/systemone`; el pipeline expone un servidor compatible con OpenAI. Soporte explicito de vLLM, Ollama o TGI: no disponible.
- Latencia: ver la seccion de benchmarks. Throughput no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El sistema no es directamente equiparable a un modelo denso o MoE unico, ya que combina dos modelos servidos por separado. La comparativa mas cercana documentada por el autor es frente a su propio thinker Bonsai 2 27B en solitario, reflejada en la seccion de benchmarks.

## Limitaciones y advertencias

- El propio autor advierte que el umbral de 0,80 no esta calibrado: la escala de confianza de decider-4b no esta calibrada y se han observado valores superiores a 1,0. La referencia del repositorio MetaCog midio su umbral de cascada de 0,95 sobre otro modelo (Jev), no sobre decider-4b.
- El coste computacional es elevado en problemas dificiles: hasta 8 veces mas tokens de thinker y entre 12 y 24 veces mas latencia wall-clock en mediciones secuenciales.
- No es una fusion de pesos: requiere levantar y mantener dos backends independientes (thinker y juez) ademas del servidor del pipeline.
- El repositorio solo incluye codigo, no pesos; el usuario debe descargar los modelos padre bajo sus propias licencias Apache-2.0.
- No hay informacion sobre sesgos, idiomas soportados, riesgo de alucinacion especifico ni longitud de contexto.
- Los datos de benchmarks proceden exclusivamente del autor y no se han replicado de forma independiente.
- Las fechas de creacion y actualizacion del repositorio (2026) figuran en la ficha de HuggingFace tal cual; conviene verificarlas.
- La licencia MIT se aplica al codigo del pipeline; los modelos padre conservan sus terminos Apache-2.0. El autor declara no estar afiliado a PrismML, Mapika ni Alibaba.

## Enlaces

- HuggingFace: https://huggingface.co/CommanderCuth/Heuristic-1
- Repositorio MetaCog: https://github.com/ItIsCuthNotCup/MetaCog
- Modelo thinker: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo juez: https://huggingface.co/Mapika/decider-4b
