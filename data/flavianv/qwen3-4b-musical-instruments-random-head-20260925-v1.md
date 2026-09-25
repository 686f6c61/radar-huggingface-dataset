# flavianv/qwen3-4b-musical-instruments-random-head-20260925-v1

## Resumen

`flavianv/qwen3-4b-musical-instruments-random-head-20260925-v1` no es un modelo generativo: es una **cabeza de scoring lineal** (reward model de ranking) entrenada sobre un backbone Qwen3-4B congelado y ya ajustado al dominio de instrumentos musicales (`flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923`). El repositorio contiene unicamente el checkpoint de la cabeza (`score.pt`, 2.560 pesos), que se carga en el submodulo `model.score` de un `AutoModelForSequenceClassification` con `num_labels=1`. La funcion del modelo es puntuar si un *bundle* de productos de instrumentos musicales satisface una peticion del usuario como kit coherente, usando los titulos reales de producto suministrados.

El entrenamiento es una ablacion deliberada: la cabeza se inicializa **desde cero** (semilla 42), sin cargar la cabeza de ranking de una ejecucion anterior, mientras el backbone permanece congelado. Con 3.169 consultas y 12.659 pares Bradley-Terry, el mejor checkpoint (990, epoca 1.25) alcanza un **89,416 % de top-one en validacion (245/274)**, frente al 90,146 % (247/274) de la ejecucion previa con cabeza continuada y al 22,993 % (63/274) de una cabeza aleatoria sin entrenar (linea base). El autor advierte que se trata de una comparacion de una sola semilla y que no establece significancia estadistica.

Su relevancia es metodologica y de nicho: sirve como componente de evaluacion o re-ranking dentro de un sistema que genere o seleccione kits de instrumentos, y como ejemplo reproducible de ablacion de cabezas de recompensa sobre un backbone congelado. El alcance es muy acotado: ingles, dominio de instrumentos musicales, candidatos fijos y sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer denso (Qwen3-4B) congelado + cabeza lineal de scoring sobre el token de clasificacion (`AutoModelForSequenceClassification`, `num_labels=1`) |
| Parametros totales | Aproximadamente 4.000 millones en el backbone Qwen3-4B mas 2.560 pesos en la cabeza de scoring (el repositorio solo distribuye la cabeza) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (viene impuesta por el backbone Qwen3-4B congelado) |
| Tipos de cuantizacion | No disponible: el repositorio no publica versiones cuantizadas. La carga de referencia usa el backbone en `bfloat16` y la cabeza en `float32` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `score.pt` (state dict de PyTorch) para la cabeza; el backbone se descarga aparte desde su propio repositorio |
| Backbone requerido | `flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923`, revision `1d6b019dfaaf368fe8af2ab593d66a3ee1c215a6` |
| Tamano del repositorio | 0,0 GB |
| Fecha de publicacion | 25 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso (Qwen3-4B) usado como extractor congelado, sobre el que se anade una cabeza lineal de 2.560 pesos que produce un unico logit por par (consulta, bundle). El texto se construye con `apply_chat_template` en formato de tres turnos (system, user, assistant), con `add_generation_prompt=False` y `enable_thinking=False`; la puntuacion final es el logit crudo, donde valores mas altos implican mejor ranking. El backbone no se actualiza en ningun momento: el "entrenamiento" afecta exclusivamente a la cabeza.

Los datos son sinteticos y de candidatos fijos: 3.169 consultas y 12.659 pares Bradley-Terry para entrenamiento, y 274 consultas con 1.092 comparaciones para validacion. Los negativos se generan mediante bundles aleatorios, sustituciones de item erroneas, colisiones de rol (por ejemplo, dos productos que cumplen la misma funcion dentro del kit) y consultas incorrectas; los negativos con solapamiento parcial se mantienen como negativos. El optimizador es AdamW con tasa de aprendizaje 1e-4, 4 pares por lote con 4 pasos de acumulacion (lote efectivo de 16 pares), 2 epocas (1.584 actualizaciones), scheduler coseno con 3 % de warmup, 8 evaluaciones cada 198 actualizaciones y una semilla unica (42). El entrenamiento termino con codigo de salida 0 y un tiempo de ejecucion de 506,44 segundos, excluyendo inicializacion y pruebas de humo. Una prueba de guardado y recarga de dos pares dio una diferencia de 0.

Como innovacion destacable, el autor documenta explicitamente la metodologia de ablacion: comparar una cabeza reinicializada aleatoriamente contra una cabeza continuada, manteniendo todo lo demas constante, para aislar el efecto del preentrenamiento de la cabeza. No hay decodificacion especulativa, atencion lineal ni tecnicas de inferencia eficiente implicadas: el modelo solo puntua. El autor tambien especifica que la metrica top-one compara el bundle de referencia contra negativos de la misma consulta, y que los negativos de consulta incorrecta solo contribuyen a metricas por pares, y que la validacion se uso para seleccionar checkpoints, por lo que no es un conjunto de test intacto.

## Capacidades

- Puntuacion de coherencia de bundles: dado un titulo de consulta y una lista de titulos de producto, devuelve un logit que indica si el conjunto funciona como kit complementario coherente.
- Discriminacion frente a negativos de cuatro tipos documentados: bundles aleatorios, sustituciones de item erroneas, colisiones de rol y consultas incorrectas.
- Uso como funcion de recompensa o criterio de re-ranking en un pipeline de seleccion de candidatos, con comparacion por pares segun el modelo Bradley-Terry.
- Soporte de evaluacion top-one y de metricas por pares sobre un conjunto de candidatos fijos por consulta.
- Capacidad de restriccion instruccional: el prompt de sistema prohibe inferir compatibilidad tecnica o precios no proporcionados, y limita el juicio a los titulos reales suministrados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: el propio codigo de carga desactiva el modo thinking (`enable_thinking=False`) y no se invoca generacion.
- No hay capacidades de vision, audio ni generacion de texto utilizable, pese a que el backbone subyacente sea un modelo generativo.
- Capacidad multilingue: ninguna; el modelo esta etiquetado unicamente para ingles y el dominio de datos es de instrumentos musicales.

## Casos de uso

- Re-ranking en catalogo de instrumentos: un sistema recupera o genera varios kits candidatos para una peticion ("kit para empezar a grabar en casa") y la cabeza los ordena por logit; encaja porque los candidatos son fijos y se comparan por pares sobre la misma consulta.
- Guardarrail de un generador de bundles: si un LLM produce propuestas de kit, esta cabeza actua como filtro de coherencia y descarta propuestas con colisiones de rol (por ejemplo, dos productos que cubren la misma funcion) antes de mostrarlas al usuario.
- Evaluacion offline de generadores: usar la tasa top-one sobre un conjunto fijo de negativos (con el protocolo de 274 consultas y 1.092 comparaciones) para comparar dos versiones de un generador o de un prompt sin necesidad de anotacion humana por muestra.
- Priorizacion para anotacion humana: puntuar pares y enviar a revision los de margen mas bajo entre candidatos, reduciendo el volumen de anotacion necesaria en un flujo de active learning.
- Deduplicacion y deteccion de sustituciones erroneas: los negativos de sustitucion de item permiten usar el modelo para detectar cuando un componente del kit no corresponde a lo solicitado, aunque el conjunto parezca correcto a simple vista.
- Monitorizacion de deriva en produccion: puntuar periodicamente un conjunto fijo de pares de referencia y vigilar la media de logits como metrica de sanidad del pipeline de datos o del backbone.
- Formacion de conjunto con otros rankers: combinar el logit de esta cabeza con otras senales de negocio (margen, disponibilidad) mediante una capa de fusion, ya que la salida es un escalar sin calibrar y no una probabilidad.
- Reproduccion de ablaciones en investigacion: servir de punto de comparacion reproducible para estudiar el efecto de reinicializar cabezas de recompensa sobre backbones congelados en dominios de catalogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas publicadas son de validacion interna sobre discriminacion sintetica de candidatos fijos:

| Metrica | Este checkpoint | Run previo (cabeza continuada) | Cabeza aleatoria (linea base) |
|---|---|---|---|
| Top-one en validacion, mejor checkpoint | 89,416 % (245/274) | 90,146 % (247/274) | 22,993 % (63/274) |
| Top-one en validacion, checkpoint final | 88,321 % (242/274) | no disponible | no disponible |

Detalles metodologicos relevantes: el mejor checkpoint es el 990, correspondiente a la epoca 1.25, y se selecciona por top-one de validacion con desempate por el mas temprano. El autor indica que la comparacion de una sola semilla no establece significancia estadistica, que la validacion se uso tanto para la seleccion del checkpoint original como del actual (por lo que no es un test intacto) y que la metrica es discriminacion sintetica con candidatos fijos, no SetHit generado.

## Requisitos de hardware

- VRAM estimada para inferencia: con el backbone en `bfloat16` y la cabeza en `float32`, los pesos ocupan aproximadamente 8-9 GB; sumando activaciones y cache para lotes pequenos en puntuacion, el consumo realista se situa en torno a 10-14 GB.
- GPU recomendadas: cualquier GPU con 16 GB o mas. Una RTX 4090, RTX 3090, L4 o A6000 de 24 GB es suficiente y deja margen; A100 y H100 funcionan sin problema pero estan sobredimensionadas para un backbone de 4B.
- Cabe en GPU de consumo: si, en tarjetas de 16-24 GB (RTX 4080/4090, RTX 3090, RTX 4060 Ti de 16 GB). En GPU de 8 GB no cabe en `bfloat16` sin cuantizar el backbone, y cuantizarlo alteraria las puntuaciones al no estar la cabeza calibrada para ello.
- Opciones de despliegue: la ruta de referencia es `transformers` con `AutoModelForSequenceClassification`, cargando `score.pt` mediante `hf_hub_download` y `load_state_dict` sobre `model.score.float()`; se recomienda `attn_implementation='sdpa'` y `pad_token_id` del tokenizer. vLLM puede servir modelos de recompensa en versiones recientes, pero requeriria adaptar la carga de una cabeza externa. TGI, llama.cpp y Ollama no son aplicables directamente porque la cabeza no esta en formato GGUF ni sigue el formato de un modelo generativo.
- Aceleradores: la carga de referencia usa CUDA (`model.cuda()`), pero la puntuacion es un forward de clasificacion, por lo que es compatible con CPU o Apple Silicon si se ajusta el dispositivo.
- Latencia y throughput de inferencia: no disponibles. El unico dato de tiempo publicado es el de entrenamiento (506,44 segundos para 1.584 actualizaciones, excluyendo inicializacion y pruebas de humo). No se proporciona calibracion de temperatura; `sigmoid(score/3)` no es una probabilidad validada para esta cabeza.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos de terceros (por ejemplo, otros reward models de ranking) en la informacion disponible. La unica comparacion con datos es contra el checkpoint hermano con cabeza continuada y contra la linea base aleatoria:

| Modelo | Parametros | Contexto | Top-one en validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3-4b-musical-instruments-random-head-20260925-v1` (este) | ~4B + 2.560 pesos de cabeza | no disponible | 89,416 % (245/274) mejor; 88,321 % (242/274) final | Apache 2.0 | Publico en HuggingFace, solo la cabeza |
| Run previo con cabeza continuada (mismo backbone) | ~4B + cabeza previa | no disponible | 90,146 % (247/274) | no disponible | No referenciado con ID en la informacion dada |
| Linea base de cabeza aleatoria sin entrenar | ~4B + 2.560 pesos | no disponible | 22,993 % (63/274) | no aplica | No es un modelo publicado |
| Backbone `qwen3-4b-musical-instruments-full-sft-shared-20260923` | ~4B | no disponible | no aplica (es el backbone, no un ranker) | Apache 2.0 (segun etiquetas del modelo base) | Publico en HuggingFace |
| Otros reward models de ranking de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance de dominio muy estrecho: solo bundles de instrumentos musicales y solo titulos de producto; no es un evaluador general de respuestas.
- Solo ingles: el modelo esta etiquetado para `en` y no se documenta ninguna evaluacion multilingue.
- Discriminacion sintetica con candidatos fijos: no mide generacion real ni SetHit; los resultados no se extrapolan a entornos con candidatos abiertos o cambiantes.
- Riesgo de fuga metodologica: la validacion se uso para seleccionar tanto el checkpoint original como el actual, por lo que no es un conjunto de test intacto y las cifras estan sesgadas al alza.
- Sin significancia estadistica: la comparacion 89,416 % frente a 90,146 % proviene de una sola semilla, y el autor niega explicitamente que establezca diferencias significativas.
- Salida sin calibrar: los logits no son probabilidades; `sigmoid(score/3)` no esta validado, por lo que no deben usarse como umbrales de confianza sin calibracion previa.
- Dependencia estricta del backbone: hay que usar exactamente `flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923` en la revision `1d6b019dfaaf368fe8af2ab593d66a3ee1c215a6`; cualquier otro backbone invalida la cabeza.
- El repositorio no contiene pesos del backbone y su tamano es de 0,0 GB; sin descargar el backbone por separado el modelo no es utilizable.
- Compatibilidad de cuantizacion no garantizada: no hay versiones cuantizadas publicadas y la cabeza se carga en `float32`, lo que hace desaconsejable cuantizar el backbone sin revalidar.
- Datos de entrenamiento sinteticos y de procedencia agregada: no se documenta composicion real del catalogo, sesgos de producto ni cobertura geografica o de mercado.
- Sin tool calling, agentes ni razonamiento multi-paso: no debe integrarse como componente conversacional ni como generador.
- Licencia Apache 2.0 en este repositorio, pero conviene verificar aparte la licencia y las condiciones del backbone y del dataset enlazados antes de un uso comercial en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-random-head-20260925-v1
- Backbone congelado requerido: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923
- Dataset de entrenamiento: https://huggingface.co/datasets/flavianv/musical-instruments-ranker-combined-small-20260924-v1 (revision `f151816f2938c07dbe2a71393f09c7cf0d861658`)
- Revision del backbone indicada en la model card: `1d6b019dfaaf368fe8af2ab593d66a3ee1c215a6`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
