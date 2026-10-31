# Secnd-AI/ren

## Resumen

Ren es un modelo de clasificacion selectiva desarrollado por Secnd-AI, construido sobre el codificador Ettin Encoder 400M de JHU CLSP. No es un modelo generativo: su funcion es leer una pregunta, sus opciones, un mensaje y las decisiones pasadas mas cercanas de una persona o negocio, y puntuar cada opcion para elegir la mas adecuada. Su rasgo diferencial es que se entrena una sola vez y cada nuevo negocio aporta su historial de decisiones sin necesidad de un nuevo entrenamiento, lo que lo hace idoneo para clasificacion con ejemplos (few-shot) en entornos de produccion.

La pieza clave del sistema es su mecanismo de clasificacion selectiva con calibracion: a partir de filas de calibracion held-out se derivan una temperatura, un umbral de confianza y un suelo de soporte (support floor), y un limite inferior de Clopper-Pearson decide si una respuesta puede automatizarse o debe derivarse a una persona (human-in-the-loop). Esto permite garantizar precisiones muy altas en las respuestas aceptadas automaticamente, con mediciones del orden del 99,8% de precision en los subconjuntos aceptados.

El repositorio incluye tres componentes: un lector de 400M parametros para elegir entre hasta 128 opciones, una variante ajustada (`meta/`) para tareas de las aplicaciones de Meta (anuncios, bandeja de entrada y decisiones de cuenta), y un codificador MiniLM para vectores de recuperacion y la cabezа de clasificacion por negocio. Solo esta disponible en ingles y se distribuye bajo licencia CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador BERT (basado en Ettin Encoder 400M) con cabezа de puntuacion de opciones; componente de recuperacion MiniLM |
| Parametros totales | 22.713.216 (pesos safetensors del repositorio raiz); lector de 400M en `reader/` |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ren combina dos subsistemas. El primero es un lector de 400M parametros (`reader/`, variante `ic-ettin-400m-s6000-near-wide-fine-seed1`) basado en el codificador Ettin de JHU CLSP, que recibe la pregunta, las opciones (hasta 128), el mensaje y las decisiones pasadas mas cercanas del usuario, y puntua cada opcion. El segundo es un codificador MiniLM (el modelo raiz de 22,7M de parametros) que genera vectores de recuperacion para encontrar las decisiones historicas mas similares y aloja una cabezа de clasificacion logistica por negocio. La variante `meta/` es el mismo lector ajustado adicionalmente sobre decisiones tipadas y tareas escritas de las aplicaciones de Meta.

El entrenamiento se realizo una unica vez sobre un conjunto de datasets publicos con licencia (TOPv2, CLINC150, MASSIVE, Snips, GoEmotions, Bitext customer support, DBpedia-14, Civil Comments, PAWS, SMS Spam, SQuAD, WANLI), excluyendo explicitamente los textos de MTOP y BANKING77 (para evitar contaminacion de los benchmarks), datos de clientes reales, ATIS y un espejo de FEVER. Las tareas escritas de Meta se generaron y etiquetaron con el modelo Muse Spark Open. No se menciona el numero total de tokens de entrenamiento ni el uso de RLHF/DPO. La calibracion (temperatura, umbral de confianza, suelo de soporte) se deriva de filas held-out y el limite inferior de Clopper-Pearson gobierna la automatizacion de respuestas.

## Capacidades

- Clasificacion de texto selectiva: elige entre hasta 128 opciones dadas, con decision de automatizacion o derivacion a humano.
- Clasificacion con ejemplos (few-shot / k-NN sobre historial): usa las 8 o 32 decisiones pasadas mas cercanas de un negocio sin reentrenamiento.
- Calibracion de incertidumbre: temperatura, umbral de confianza y suelo de soporte derivados de datos held-out.
- Garantia estadistica de precision: limite inferior de Clopper-Pearson al 95% para decidir que respuestas pueden ser automaticas.
- Recuperacion semantica mediante el codificador MiniLM incluido en el repositorio.
- Clasificacion por negocio: cabezа logistica entrenable sobre los vectores de recuperacion para cada cliente.
- Variante `meta/` para decisiones de anuncios, bandeja de entrada y cuentas en aplicaciones de Meta.
- Sin soporte de generacion de texto, tool calling, agentes, vision ni audio. Solo ingles.

## Casos de uso

- Moderacion y triaje de bandejas de entrada de soporte: clasifica mensajes de clientes en categorias de intencion usando el historial de decisiones previas del negocio, derivando a un agente humano los casos de baja confianza.
- Enrutado de consultas de atencion al cliente: con el dataset Bitext de soporte en su entrenamiento, es adecuado para clasificar intents en chatbots de primer nivel con garantia de precision en las respuestas automatizadas.
- Clasificacion de intenciones en asistentes de voz o texto (estilo MTOP/MASSIVE): mapea consultas de usuarios a uno de muchos intents con hasta 128 opciones.
- Deteccion de contenido y seguridad: entrenado con Civil Comments y SMS Spam, puede clasificar toxicidad o spam con derivacion a revision humana.
- Clasificacion de anuncios y decisiones de cuenta en plataformas tipo Meta: la variante `meta/` esta afinada para tareas de anuncios, inbox y cuentas, aunque los anuncios son su punto debil (70,3% de acuerdo).
- Clasificacion de dominios y taxonomias empresariales (DBpedia-14): asignacion de textos a taxonomias de hasta 128 clases.
- Integracion en flujos human-in-the-loop: cualquier pipeline donde se requiera precision certificada en lo automatizado y revision humana del resto, como moderacion de contenido o revision de tickets criticos.

## Benchmarks y rendimiento

Resultados oficiales publicados en la model card, medidos sobre los pesos exactos del repositorio:

| Set | Sin ejemplos | 8 mas cercanos | 32 mas cercanos |
| --- | ---: | ---: | ---: |
| MTOP | 75,99% | 92,38% | 93,59% |
| BANKING77 | 68,99% | 89,90% | 86,23% |

Lector frente a cabezа logistica sobre los mismos vectores de recuperacion, segun historial disponible:

| Historial | MTOP lector | MTOP cabezа | BANKING77 lector | BANKING77 cabezа |
| --- | ---: | ---: | ---: | ---: |
| 200 etiquetas | 82,51% | 69,54% | 75,39% | 54,16% |
| 1.000 etiquetas | 88,12% | 80,46% | 82,60% | 85,32% |
| Todas las etiquetas | 92,45% | 93,00% | 89,87% | 92,50% |

Clasificacion selectiva sobre las 4.386 filas de test de MTOP (puerta y suelo de soporte fijados en calibracion):

| Ejemplos | Respondidas solas | Aceptadas | Errores | Precision | Limite inf. 95% |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 0% | 0 | 0 | n/a | n/a |
| 8 | 21,04% | 923 | 1 | 99,89% | 99,40% |
| 32 | 14,46% | 634 | 1 | 99,84% | 99,12% |

Variante `meta/` sobre tareas escritas nuevas (342 y 338): 84,8% de acuerdo con un panel de tres modelos y 76,0% con Muse Spark 1.3 (frente a 44,4% y 49,7% eligiendo siempre la respuesta mas comun). Decisiones de anuncios: 70,3% y 54,3%. En el benchmark tipado fijo de 2.000 decisiones, antes del ajuste Meta, el lector puntua 79,70%.

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K (no aplicables: no es un modelo generativo de proposito general).

## Requisitos de hardware

- Rendimiento publicado: una GPU A10G sobre HTTP consigue 17,5 s de arranque en frio y 3,68 peticiones por segundo con cuatro clientes concurrentes, a un coste aproximado de 0,08 USD de GPU por cada 1.000 decisiones saturadas.
- En CPU (4 nucleos): 2,2 s de latencia p95 por peticion con 8 ejemplos cercanos, sobre la misma arquitectura.
- VRAM estimada: no disponible explicitamente; el lector de 400M parametros en precision FP16 requiere en torno a 0,8 GB, por lo que una A10G (24 GB) es mas que suficiente.
- Consumer GPU: el tamano del modelo (lector de 400M y codificador MiniLM de 22,7M) lo hace ejecutable en GPUs de consumo como una RTX 3060 o superior; no hay datos publicados de validacion en hardware consumer.
- Opciones de despliegue: codigo de servicio y configuracion disponibles en github.com/Rish-it/secnd; compatible con text-embeddings-inference y endpoints de HuggingFace segun los tags del repositorio. No se menciona soporte de vLLM, llama.cpp, Ollama o TGI.
- No hay cifras de throughput para la variante `meta/` ni para el codificador raiz por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia |
|---|---|---|---|---|
| Secnd-AI/ren (lector) | 400M (lector) + 22,7M (MiniLM) | Clasificacion selectiva con historial y garantia estadistica | no disponible | CC BY-SA 4.0 |
| SetFit (sentence-transformers) | 22M–110M tipicamente | Few-shot con cabezas logisticas sobre embeddings, sin garantia estadistica | 512 tokens (tipico) | Apache 2.0 |
| Ettin Encoder 400M (base) | 400M | Codificador generico de embeddings/clasificacion | no disponible | MIT |
| DeBERTa-v3-base (clasificacion) | 86M | Clasificador fine-tuned estandar | 512 tokens | MIT |

Diferencia clave: Ren no compite en precision bruta con un clasificador fine-tuned con miles de etiquetas (la propia model card reconoce que una cabezа logistica gana con historiales grandes), sino en escenarios con pocos ejemplos y necesidad de precision certificada en lo automatizado. Su licencia CC BY-SA 4.0 es mas restrictiva que las Apache 2.0 o MIT de las alternativas para uso comercial con redistribucion.

## Limitaciones y advertencias

- Variabilidad entre semillas: la cobertura certificada se movio 19 puntos entre dos semillas de un pool anterior; en el pool actual una segunda semilla puntua 0,55 puntos mas en MTOP y 0,72 en BANKING77. Los autores recomiendan reportar rangos, nunca una unica mejor ejecucion.
- La certificacion de la puerta solo cubre el historial completo de MTOP: un negocio nuevo no hereda permiso para responder automaticamente y debe ganarlo con sus propias decisiones revisadas.
- Con la opcion correcta ausente, el suelo de soporte fallo su objetivo de como maximo 1 aceptacion erronea por 500, alcanzando 2.
- BANKING77 no certifica ninguna respuesta al nivel del 99%, incluso tras una auditoria de las etiquetas de calibracion.
- Sin ejemplos en BANKING77, el modelo no lidera: un modelo tipado publicado consigue mejor precision.
- Con miles de etiquetas, una cabezа logistica sobre los vectores de recuperacion supera al lector.
- Las filas escritas de entrenamiento provienen de un unico modelo y arrastran su estilo (riesgo de sesgo generativo).
- Solo ingles; sin soporte multilingue.
- Los numeros de benchmark no son una promesa de rendimiento sobre un negocio nuevo o trafico futuro.
- Licencia CC BY-SA 4.0: obliga a compartir derivados bajo la misma licencia (ShareAlike) y a atribuir; puede no ser adecuada para todos los usos comerciales.
- Riesgo de alucinacion no aplicable directamente (no es generativo), pero las etiquetas de calibracion modificadas por auditoria de modelo (no humana) introducen un caveat en la medicion de precision.
- En tareas de anuncios (`meta/`), el acuerdo con paneles de referencia es bajo (54,3%–70,3%).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Secnd-AI/ren
- Revision v1.0.0: https://huggingface.co/Secnd-AI/ren/blob/v1.0.0/README.md
- Codigo de servicio y configuracion: https://github.com/Rish-it/secnd
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-400m
