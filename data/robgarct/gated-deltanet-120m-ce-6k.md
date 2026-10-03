# robgarct/gated-deltanet-120m-ce-6k

## Resumen

gated-deltanet-120m-ce-6k es un checkpoint de 120 millones de parámetros basado en la arquitectura Gated DeltaNet, publicado por el usuario robgarct en HuggingFace. Se trata de un modelo de lenguaje de tipo base (sin ajuste por instrucciones) entrenado sobre el corpus Pile con entropía cruzada estándar durante 6.000 actualizaciones, equivalentes a 3.146 millones de tokens, y con la semilla 1111. Su propósito declarado es servir como control recurrente dentro de la escalera de ablación del router "ahead" con M=1, al mismo presupuesto de tokens que el resto de la escalera.

La arquitectura Gated DeltaNet procede del artículo Gated Delta Networks: Improving Mamba2 with Delta Rule (ICLR 2025, NVIDIA Labs), que introduce la regla delta compuertada y un algoritmo de entrenamiento paralelo optimizado para hardware moderno. Se trata de una atención lineal con estado recurrente de tamaño constante, situada entre DeltaNet y Mamba2 en la familia de modelos de espacio de estados. El interés actual de esta familia es alto: según el repositorio oficial, Gated DeltaNet se ha integrado en Qwen3-Next (septiembre de 2025), en Qwen3.5 y en Olmo Hybrid.

El modelo se distribuye a través de la librería recurrent-recall-circuits (HazyResearch) y está registrado como `gdn_120m_ce_6k` en `configs/models/ladder_m1.yaml`. No es un modelo orientado a producto: sus cifras publicadas (perplejidad de 12,00 en Pile, 5,30 en Rare-AR y 3,5% en Natural FDA sobre 1.102 ejemplos) están pensadas para comparaciones controladas dentro de una línea de investigación concreta sobre circuitos de recuperación en contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atencion lineal con regla delta compuertada, de naturaleza recurrente) |
| Parametros totales | 120 millones (aproximado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el unico artefacto publicado es el checkpoint original |
| Idiomas soportados | no disponible; el corpus de entrenamiento (Pile) es mayoritariamente en ingles |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`final.ckpt`, con el estado del optimizador eliminado) |
| Tamano del repositorio | 0,5 GB |
| Tokens de entrenamiento | 3.146 millones (3,146B) |
| Actualizaciones (steps) | 6.000 |
| Funcion de perdida | entropia cruzada estandar |
| Semilla | 1111 |
| Libreria | recurrent-recall-circuits |
| Archivos incluidos | `final.ckpt`, `resolved-config.yaml`, `metadata.json` |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa un transformer de 120M de parametros en el que las capas de atencion convencional se sustituyen por el mecanismo Gated DeltaNet, descrito en el paper arXiv:2412.06464 (ICLR 2025). La innovacion central es la regla delta compuertada: frente a la regla delta original de DeltaNet, se anade un mecanismo de compuerta que permite olvidar selectivamente informacion del estado recurrente. Al tratarse de atencion lineal, el estado tiene tamano constante y no crece con la longitud de la secuencia, lo que evita el crecimiento lineal del cache KV propio de la atencion softmax. El paper describe ademas un algoritmo de entrenamiento paralelo disenado para aprovechar el hardware actual, ya que el calculo recurrente secuencial es intrinsecamente dificil de paralelizar.

El entrenamiento de este checkpoint concreto es deliberadamente simple: corpus Pile, entropia cruzada plana (sin RLHF, DPO ni ajuste por instrucciones) y 3.146 millones de tokens en 6.000 actualizaciones. La configuracion exacta esta en `resolved-config.yaml` (no incluida en la informacion disponible), y la configuracion de arquitectura referenciada por el autor es `configs/experiment/lm/120m/gdn/ce_6k.yaml`. No se han facilitado datos sobre numero de capas, dimensiones del modelo, cabezas de atencion ni longitud de secuencia de entrenamiento. No consta ningun ajuste posterior al preentrenamiento.

## Capacidades

- Modelado de lenguaje autorregresivo y generacion de texto base en el dominio del corpus Pile.
- Recuperacion en contexto (in-context recall), capacidad que el autor mide explicitamente con la metrica Natural FDA sobre 1.102 ejemplos.
- Rendimiento medido en la tarea Rare-AR, con una perplejidad de 5,30.
- Inferencia con estado recurrente de tamano constante, sin cache KV creciente.
- No consta soporte de tool calling ni de function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta un modo de razonamiento explicito (thinking mode).
- No consta capacitacion multimodal (vision, audio) ni capacidad de generacion de codigo evaluada.
- Capacidades multilingues: no disponibles; el corpus Pile es mayoritariamente en ingles.
- No es un modelo ajustado por instrucciones, por lo que no mantiene conversaciones de forma fiable.

## Casos de uso

- Investigacion sobre circuitos de recuperacion recurrente: el checkpoint es el control recurrente de la escalera de ablacion M=1 del router ahead, de modo que su uso previsto es servir de referencia contra la que se comparan variantes con router. Se carga con `python -m recurrent_recall_circuits.cli.evaluate --suite baseline` sobre el registro `configs/models/ladder_m1.yaml`.
- Ablaciones arquitectonicas controladas: al compartir presupuesto de tokens (3.146 millones) y semilla (1111) con el resto de la escalera, permite aislar el efecto de cambios arquitectonicos sin que la diferencia de compute contamine la comparacion.
- Estudio de eficiencia de atencion lineal en secuencias largas: al tener un estado recurrente de tamano constante, el consumo de memoria no depende de la longitud de secuencia, lo que lo hace util para analizar el compromiso entre recall y coste frente a la atencion softmax.
- Punto de partida para ajuste fino en dominio concreto: con 120M de parametros, un fine-tuning completo cabe en una unica GPU de consumo; sirve como base barata para probar hipotesis antes de escalar a modelos mayores.
- Evaluacion de metricas de recuperacion (Natural FDA, Rare-AR): permite reproducir y auditar la metodologia de evaluacion del proyecto recurrent-recall-circuits sobre un modelo de referencia.
- Prototipado y pruebas de despliegue en hardware muy limitado: el tamano del checkpoint (0,5 GB) permite ejecutar inferencia en CPU o en GPU de gama baja, aunque requiere el stack de la libreria original al no existir artefactos GGUF.
- Reproducibilidad de experimentos: el repositorio incluye `resolved-config.yaml` y `metadata.json` junto a los pesos, lo que permite reconstruir exactamente la identidad de la ejecucion (paso global 6.000, semilla 1111).

## Benchmarks y rendimiento

| Metrica | Configuracion | Resultado |
|---|---|---|
| Pile PPL | 1.000 secuencias de validacion | 12,00 |
| Rare-AR PPL | no especificada en la informacion disponible | 5,30 |
| Natural FDA | 1.102 ejemplos (todos) | 3,5% |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K para este checkpoint. Las cifras anteriores proceden de la model card del autor y corresponden a la metodologia interna del proyecto recurrent-recall-circuits, por lo que no son directamente comparables con valores de perplejidad publicados por otros modelos sobre Pile.

## Requisitos de hardware

Estimaciones calculadas a partir de los 120M de parametros; el autor no publica cifras de latencia ni de throughput.

- Pesos en FP32: aproximadamente 0,48 GB; con activaciones y overhead, en torno a 1-2 GB de memoria total.
- Pesos en FP16/BF16: aproximadamente 0,24 GB; en torno a 1 GB de memoria total.
- Pesos en INT8: aproximadamente 0,12 GB.
- Pesos en INT4: aproximadamente 0,06-0,07 GB.
- Fine-tuning completo con Adam: el estado del optimizador y los gradientes elevan el requisito a unos 16 bytes por parametro, es decir, alrededor de 1,9 GB solo para pesos, gradientes y momentos, mas activaciones.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4090) y tambien en CPU para inferencia. No requiere A100 ni H100; estas solo tendrian sentido para entrenamiento a gran escala.
- En GPUs de datacenter (A100, H100) el modelo quedaria limitado por latencia de kernel, no por memoria.
- Opciones de despliegue: la via soportada es la libreria recurrent-recall-circuits, que descarga el checkpoint desde este repositorio en el primer uso y lo evalua mediante su CLI. No hay artefactos GGUF publicados, por lo que llama.cpp u Ollama exigirian una conversion previa y soporte de la arquitectura en dichos proyectos. No consta soporte en vLLM, TGI o SGLang.
- Latencia y throughput: no disponibles.
- Ventaja estructural: al ser atencion lineal con estado constante, el uso de memoria en inferencia no crece con la longitud de la secuencia, a diferencia de los modelos con cache KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gated-deltanet-120m-ce-6k | 120M | no disponible | PPL Pile 12,00; PPL Rare-AR 5,30; Natural FDA 3,5% | no disponible | HuggingFace, 0 descargas |
| Gated DeltaNet (referencia del paper, ICLR 2025) | no disponible en la informacion | no disponible | Supera a Mamba2 y DeltaNet en modelado de lenguaje, razonamiento de sentido comun y recuperacion en contexto segun el paper | no disponible | github.com/NVlabs/GatedDeltaNet |
| DeltaNet | no disponible en la informacion | no disponible | Inferior a Gated DeltaNet segun el paper | no disponible | no disponible en la informacion |
| Mamba2 | no disponible en la informacion | no disponible | Inferior a Gated DeltaNet segun el paper | no disponible | no disponible en la informacion |

No se dispone de cifras de parametros, contexto o licencia de las alternativas en la informacion proporcionada, ni de modelos de 120M directamente comparables evaluados con la misma metodologia. La comparacion con DeltaNet y Mamba2 es por tanto cualitativa y procede del paper de referencia.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no es adecuado para uso conversacional directo ni como asistente en produccion sin un fine-tuning posterior.
- El paper de referencia senala que los modelos de lenguaje pequenos no alineados con instrucciones son propensos a errores de repeticion, lo que constituye un riesgo concreto de degeneracion en generaciones largas.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion para este checkpoint.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o seguridad.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido. En la practica, esto bloquea su adopcion en cualquier producto sin aclaracion previa del autor.
- Idiomas: no confirmados. El corpus Pile es mayoritariamente en ingles, por lo que el rendimiento en castellano es muy probablemente deficiente, aunque no hay datos que lo cuantifiquen.
- Longitud de contexto: no documentada, lo que impide planificar tareas que dependan de ventanas largas.
- Presupuesto de entrenamiento reducido (3.146 millones de tokens en 6.000 pasos), propio de un experimento de ablacion y no de un modelo de proposito general.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en HuggingFace y sin demo publica.
- El checkpoint incluye el estado del optimizador eliminado, por lo que no es posible reanudar el entrenamiento desde el punto exacto sin reconstruir el estado.
- Dependencia de la libreria recurrent-recall-circuits: la carga esta registrada en su catalogo de configuraciones, lo que ata el uso a ese ecosistema concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robgarct/gated-deltanet-120m-ce-6k
- Paper Gated Delta Networks: Improving Mamba2 with Delta Rule: https://arxiv.org/abs/2412.06464
- Pagina del paper en HuggingFace Papers: https://huggingface.co/papers/2412.06464
- Version en OpenReview (ICLR 2025): https://openreview.net/pdf?id=r8H7xhYPwz
- Repositorio oficial de PyTorch (NVIDIA Labs): https://github.com/NVlabs/GatedDeltaNet
- Repositorio de reproduccion de Gated DeltaNet: https://github.com/krsnoki/gatedDeltaNet
- Libreria y proyecto recurrent-recall-circuits: https://github.com/HazyResearch/recurrent-recall-circuits
