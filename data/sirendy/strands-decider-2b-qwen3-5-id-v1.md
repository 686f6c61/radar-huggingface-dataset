# siRendy/strands-decider-2B-qwen3.5-id-v1

## Resumen

strands-decider-2B-qwen3.5-id-v1 es un ajuste fino bilingue (indonesio e ingles) desarrollado por el usuario siRendy sobre el checkpoint StrandsAgents/strands-decider-2B-qwen3.5-v1-2610, que a su vez deriva de Qwen3.5-2B-Base. No es un modelo generativo al uso: se trata de un modelo discriminativo de decision de "Sistema 1" que, dado un estado (documento, mensaje o contexto) y una o varias preguntas, devuelve respuestas estructuradas sin generar texto libre. Cada respuesta adopta una de tres formas: `noul` (probabilidad booleana), `choice` (distribucion de probabilidad sobre opciones con nombre) o `score` (puntuacion ordinal con rubrica).

El objetivo del ajuste es incorporar capacidad solida en indonesio preservando el rendimiento en ingles mediante experience replay y regularizacion KL. La propiedad tecnica mas relevante es que codifica el estado una sola vez y evalua multiples preguntas contra esa representacion, de modo que responder N preguntas sobre un mismo documento cuesta practicamente lo mismo que responder una, lo que lo hace adecuado para pipelines de clasificacion y enrutamiento por lotes.

El modelo tiene 2B parametros, ventana de contexto de 4096 tokens segun la configuracion de entrenamiento, y se distribuye como un checkpoint de pesos completos con cabecera pointer de 768 dimensiones. Es relevante ahora porque ofrece una alternativa compacta y calibrada (temperatura global de 1.6351) para tareas de decision estructurada en un idioma con poca cobertura en modelos abiertos como el indonesio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B-Base) con cabecera pointer de decision (dim=768) |
| Parametros totales | 2B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (max sequence length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint de pesos, probablemente safetensors; no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base y se ajusta mediante LoRA (r=48, alpha=96) sobre todas las capas de atencion y proyecciones feed-forward, con una cabecera pointer adicional de 768 dimensiones que puntua cada opcion a partir de su propia representacion de estado oculto. El entrenamiento se realizo en 2 GPUs Tesla T4 con DDP, 2 epocas, micro-batch de 8 y acumulacion de gradiente de 4 (batch efectivo de 32), con tasa de aprendizaje de 1e-4 para el torso y 5e-4 para la cabecera, semilla 1.

Para evitar el olvido catastrofico del ingles se aplico regularizacion KL (peso 0.4) contra el modelo base congelado y experience replay con 1.635 filas en ingles (545 por cada tipo de respuesta) mezcladas en el conjunto de entrenamiento. El dataset decider-id-v6 contiene 15.605 filas balanceadas 1:1:1 entre los tres tipos, con 13.970 filas en indonesio y 1.635 en ingles. Se aplicaron tecnicas de robustez como ordinal smoothing (0.1) y barajado de opciones. Tras el entrenamiento se ajusto un escalado de temperatura global de 1.6351 sobre una particion de calibracion de 875 filas, reduciendo el ECE de 0.0837 a 0.0645 y el NLL de 0.5127 a 0.4571.

## Capacidades

- Clasificacion binaria (`noul`): devuelve una probabilidad entre 0 y 1 para preguntas verdadero/falso, util para deteccion de spam, urgencia o implicacion textual.
- Clasificacion multi-clase (`choice`): distribucion de probabilidad ordenada sobre opciones con nombre, para enrutamiento de intenciones y clasificacion tematica.
- Puntuacion ordinal (`score`): puntuacion con rubrica para analisis de sentimiento, calidad o ranking.
- Inferencia multi-pregunta eficiente: codifica el estado una vez y evalua multiples preguntas contra la misma representacion.
- Bilinguismo indonesio-ingles con preservacion del rendimiento en ingles mediante KL y replay.
- Calibracion de probabilidades incorporada (temperatura 1.6351 almacenada en strands_decider_config.json).
- No genera texto libre: la salida es siempre estructurada (probabilidad, ranking de opciones o score).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Moderacion de resenas de aplicaciones: clasificar resenas de Google Play por sentimiento y tematica usando el modo `score` y `choice`, aprovechando que el modelo fue entrenado con el dataset jakartaresearch/google-play-review y logra 0.704 de accuracy en esa tarea.
- Enrutamiento de intenciones en asistentes conversacionales en indonesio: dado un mensaje de usuario, devolver la intencion mediante `choice` con probabilidades calibradas para decidir el flujo posterior.
- Deteccion de urgencia o spam en mensajes: usar `noul` para obtener una probabilidad booleana que alimente un umbral de escalado en un sistema de atencion al cliente.
- Analisis de sentimiento por aspectos: emplear `choice` sobre aspectos concretos (por ejemplo, el dataset hoasa_aspect, donde el modelo alcanza 0.986 de accuracy) para extraer opiniones desglosadas de resenas.
- Verificacion de implicacion textual: usar `noul` para determinar si una premisa implica una hipotesis (dataset indonli, 0.931 de accuracy), util en pipelines de validacion documental.
- Puntuacion de calidad de contenido generado: aplicar `score` con rubrica para ordenar o filtrar respuestas en un sistema de evaluacion automatica.
- Procesamiento por lotes de documentos con multiples preguntas: al codificar el estado una sola vez, es eficiente para clasificar grandes volumenes de documentos con varias etiquetas cada uno en una sola pasada.

## Benchmarks y rendimiento

Evaluacion con test exacto de McNemar e intervalos de confianza bootstrap al 95%, con ambos modelos calibrados de forma independiente.

| Idioma | Conjunto | n | Base acc | FT acc | Delta | IC 95% | p |
|---|---|---|---|---|---|---|---|
| ID | Global | 1.749 | 0.720 | 0.836 | +11.6 | [+9.7, +13.6] | <0.001 |
| ID | noul | 583 | 0.840 | 0.928 | +8.8 | [+5.8, +11.8] | <0.001 |
| ID | choice | 583 | 0.662 | 0.820 | +15.8 | [+11.8, +19.7] | <0.001 |
| ID | score | 583 | 0.659 | 0.762 | +10.3 | [+6.9, +13.6] | <0.001 |
| EN | Global | 2.000 | 0.752 | 0.727 | -2.5 | [-3.8, -1.2] | <0.001 |
| EN | noul | 833 | 0.846 | 0.821 | -2.5 | [-4.2, -0.8] | 0.004 |
| EN | choice | 738 | 0.798 | 0.791 | -0.7 | [-2.7, +1.2] | 0.59 (n.s.) |
| EN | score | 429 | 0.487 | 0.434 | -5.4 | [-8.9, -1.9] | 0.004 |

Resultados por tarea en indonesio:

| Tarea | n | Base | FT | Delta |
|---|---|---|---|---|
| hoasa_aspect | 144 | 0.688 | 0.986 | +29.9 |
| gplay_review | 365 | 0.559 | 0.704 | +14.5 |
| emot_emotion | 439 | 0.654 | 0.765 | +11.2 |
| indonli_entail | 376 | 0.835 | 0.931 | +9.6 |
| idk_mrc_answerable | 130 | 0.838 | 0.923 | +8.5 |
| indolem_sentiment | 68 | 0.868 | 0.912 | +4.4 |
| smsa_sentiment | 205 | 0.829 | 0.859 | +2.9 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 2B parametros se situa aproximadamente entre 4 y 5 GB en FP16 y entre 1,5 y 2,5 GB en cuantizacion de 4 bits, aunque el autor no publica cifras.
- GPU recomendadas: el entrenamiento se realizo en 2x Tesla T4, lo que indica que la inferencia cabe holgadamente en GPUs de gama media.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070), aunque no se confirma oficialmente.
- Opciones de despliegue: no disponible; el modelo es un checkpoint con cabecera pointer personalizada, por lo que requiere el codigo de inferencia del autor y no es directamente compatible con vLLM, llama.cpp u Ollama sin adaptacion.
- Latencia y throughput: no disponible; el autor solo indica cualitativamente que evaluar multiples preguntas sobre un estado codificado una vez es casi tan rapido como evaluar una sola.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strands-decider-2B-qwen3.5-id-v1 | 2B | 4096 | Discriminativo de decision (noul/choice/score) | no disponible | HuggingFace |
| StrandsAgents/strands-decider-2B-qwen3.5-v1-2610 | 2B | no disponible | Discriminativo de decision, solo ingles | no disponible | HuggingFace |
| Qwen3.5-2B-Base | 2B | no disponible | Generativo decoder-only | no disponible | HuggingFace |

La comparativa con modelos generativos de proposito general no es directa, ya que strands-decider no produce texto libre y esta especializado en tareas de decision estructurada. No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- El ajuste degrada el rendimiento en ingles de forma estadisticamente significativa: -2.5 puntos globales, -2.5 en `noul` y -5.4 en `score`, con p<0.001 en ambos casos.
- La tarea `score` en ingles ya partia de una accuracy baja (0.487 en el modelo base) y baja a 0.434 tras el ajuste, lo que limita su uso en ese idioma.
- El modelo no genera texto libre; no puede emplearse para tareas generativas, resumen, traduccion o dialogo abierto.
- Solo cubre indonesio e ingles; no hay soporte documentado para otros idiomas.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribucion de entrenamiento; la calibracion se ajusto solo sobre una particion de validacion concreta.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial; es necesario contactar con el autor antes de desplegarlo en produccion.
- El checkpoint incluye una cabecera pointer personalizada y un fichero strands_decider_config.json con la temperatura; requiere el codigo de inferencia adecuado y no funciona como un modelo de transformers estandar sin adaptacion.
- El modelo se creo y actualizo el 2026-11-02 con 0 descargas y 0 likes, por lo que no cuenta con validacion externa de la comunidad.
- El contexto maximo de 4096 tokens limita el tamano de los documentos que se pueden codificar en una sola pasada.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/siRendy/strands-decider-2B-qwen3.5-id-v1
- Modelo base: https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Dataset afaji/indonli: https://huggingface.co/datasets/afaji/indonli
- Dataset jakartaresearch/google-play-review: https://huggingface.co/datasets/jakartaresearch/google-play-review
- Dataset indonlp/NusaX-senti: https://huggingface.co/datasets/indonlp/NusaX-senti
- IndoNLU: https://github.com/IndoNLP/indonlu
- IDK-MRC: https://github.com/rifkiaputri/IDK-MRC
- IndoLEM: https://github.com/indolem/indolem
