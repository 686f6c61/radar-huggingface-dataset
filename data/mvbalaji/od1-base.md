# mvbalaji/od1-base

## Resumen

OD-1 Base es un modelo de decisión de tipo "System One" desarrollado por el usuario mvbalaji y publicado bajo licencia Apache 2.0. Su funcionamiento no es el de un chatbot generativo: recibe un *estado* (texto libre o JSON) junto con preguntas tipadas (`choice` para elegir entre opciones, `noul` para respuestas si/no y `score` para valores ordinales) y devuelve cada respuesta acompañada de su distribución de probabilidad completa, más un resultado explícito `NOT_ANSWERABLE` cuando no puede responder con garantías. El formato de salida sigue el esquema Jev / TypeSafe `/v1/systemone`.

Técnicamente es un ajuste completo (*full fine-tuning*) del backbone Qwen3.5-4B, con aproximadamente 4.000 millones de parámetros. El checkpoint publicado fue seleccionado por precisión en validación fuera de dominio, priorizando la capacidad *zero-shot* frente a checkpoints posteriores con mejor rendimiento en dominio pero peor generalización. El repositorio incluye además un modelo "Nano" y un mecanismo de *hand-off* en cascada (`cascade.json`) que permite resolver la mayoría de peticiones con el modelo pequeño y escalar al 4B solo cuando la confianza mínima por pregunta cae por debajo de un umbral.

Su relevancia actual reside en el enfoque: en lugar de generar texto, el modelo está especializado en producir decisiones calibradas y verificables, con distribución de probabilidad por pregunta. Está pensado como componente de sistemas de enrutamiento, clasificación y selección de herramientas donde la confianza del modelo debe ser auditable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido sobre Qwen3.5: mezcla de capas de atencion completa con capas de atencion lineal basadas en regla delta con puerta (*gated delta-rule*) |
| Parametros totales | Aproximadamente 4.000 millones (backbone Qwen3.5-4B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline declarado | text-classification |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 12,8 GB |
| Modalidad de respuesta | Distribuciones de probabilidad por pregunta tipada (`choice`, `noul`, `score`) y resultado `NOT_ANSWERABLE` |
| Componentes incluidos | Modelo principal 4B, modelo Nano en `nano/` y configuracion de cascada en `cascade.json` |
| Exit temprano | Si, salida en la capa 8 para el modo *self-exit* |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-4B, que combina capas de atencion completa con capas de atencion lineal basadas en regla delta con puerta. Este diseno hibrido reduce el coste computacional de la atencion, pero exige instalar los *kernels* rapidos especificos: si no estan disponibles, `transformers` recurre silenciosamente a una implementacion en PyTorch puro de esas capas y una peticion de una sola pregunta pasa de decimas de milisegundo a cientos de milisegundos. Sobre ese backbone se aplico un ajuste completo (*full fine-tuning*) siguiendo la receta OD-1.

La informacion publicada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Si se indica que la seleccion del checkpoint se hizo maximizando la precision en validacion fuera de dominio, y que checkpoints posteriores obtenian mejores resultados en dominio pero perdian capacidad *zero-shot*, motivo por el que no se publicaron. El modelo incorpora dos mecanismos de eficiencia: un *exit* temprano en la capa 8 (modo *self-exit*), que segun la validacion del autor apenas aporta porque un *exit* tan superficial rara vez supera el umbral de confianza de 0,99, y una cascada de dos modelos (*two-model*) en la que el Nano responde primero y la peticion se escala al 4B cuando la confianza minima por pregunta del Nano es inferior a 0,5.

## Capacidades

- Resolucion de decisiones tipadas: eleccion entre opciones (`choice`), preguntas binarias si/no (`noul`) y puntuaciones ordinales (`score`).
- Salida calibrada: cada respuesta incluye su distribucion de probabilidad completa, no solo la etiqueta ganadora.
- Abtencion explicita: devuelve `NOT_ANSWERABLE` cuando la confianza no supera el umbral ajustado en `serving.json`.
- Clasificacion de texto en *zero-shot*: categorizacion de noticias, emociones, sentimiento ordinal, intenciones bancarias e intenciones de voz.
- Seleccion de opciones en el estilo del benchmark BFCL, lo que cubre escenarios de seleccion de funciones o herramientas representados como eleccion entre candidatos.
- Robustez ante entradas adversarias: 0,887 de precision en el conjunto adversarial propio, por encima de las alternativas comparadas.
- Cascada integrada con el modelo Nano: la respuesta indica que modelo la ha generado.
- Ejecucion con CUDA graphs para reducir latencia en *batch* 1.
- No soporta generacion libre de texto, vision, audio ni capacidades multimodales. El unico idioma declarado es el ingles.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el ticket como estado y una pregunta `choice` con los criterios de cada equipo (`billing` frente a `tech`). El ejemplo de la model card devuelve `billing` con confianza 0,994, suficiente para automatizar el enrutamiento sin intervencion humana.
- Clasificacion de sentimiento en resenas: con preguntas de tipo `score` ordinal reproduce el escenario de SST-5, donde obtiene 0,474 de precision. Es adecuado cuando interesa la distribucion de probabilidad para ponderar opiniones en lugar de una etiqueta unica.
- Deteccion de intencion en asistentes de voz en ingles: evaluado en MASSIVE-en con 0,694 de precision, sirve para mapear transcripciones a intenciones predefinidas antes de invocar el dialogo principal.
- Clasificacion de consultas financieras: en Banking77 alcanza 0,482, util como primera etapa de triaje en *contact centers* bancarios, con escalado a agentes humanos cuando la confianza es baja.
- Seleccion de herramientas en agentes: los resultados en BFCL (0,942 nativo, 0,938 con 24 opciones) permiten usar el modelo para elegir que funcion o API invocar en un *pipeline* de agente, tratando el catalogo de herramientas como opciones de una pregunta `choice`.
- Filtrado con abtencion en produccion: gracias a `NOT_ANSWERABLE` y a la confianza por pregunta, se puede derivar a revision humana cualquier decision por debajo del umbral, reduciendo el coste de errores en flujos automatizados.
- Moderacion y verificacion binaria: con preguntas `noul` se pueden implementar comprobaciones si/no sobre un estado textual, con distribucion de probabilidad asociada.
- Reduccion de coste mediante cascada: en validacion, el Nano solo obtiene 0,737, el 4B solo 0,761 y la cascada de dos modelos 0,766 escalando el 28,3 por ciento de las peticiones. Desplegar la cascada mantiene la precision del 4B resolviendo la mayor parte del trafico con el modelo pequeno.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjuntos de test fijos (hasta 2.000 decisiones por conjunto, semilla 0; para typed-decisions las 2.000 decisiones de test completas). Precision:

| Conjunto de test | OD-1 Base (este modelo) | Jev 1.13 | Laya | Laya typed-decisions | Tev1-4B | CLM-8B |
|---|---|---|---|---|---|---|
| typed-decisions | 0,582 (n=2000) | 0,741 | 0,353 | 0,737 | 0,690 | 0,393 |
| AG News | 0,843 (n=2000) | 0,882 | 0,924 | 0,922 | 0,886 | 0,354 |
| Emotion | 0,559 (n=2000) | 0,595 | 0,597 | 0,603 | 0,583 | 0,281 |
| SST-5 | 0,474 (n=2000) | 0,579 | 0,341 | 0,463 | 0,533 | 0,273 |
| Banking77 | 0,482 (n=2000) | n/a | n/a | n/a | n/a | n/a |
| MASSIVE-en | 0,694 (n=2000) | n/a | n/a | n/a | n/a | n/a |
| BFCL native | 0,942 (n=1252) | 0,975 | 0,679 | 0,847 | 0,954 | 0,694 |
| BFCL 24 opciones | 0,938 (n=1909) | 0,969 | 0,600 | 0,741 | 0,950 | 0,625 |
| BFCL 100 opciones | 0,851 (n=1909) | n/a | n/a | n/a | n/a | n/a |
| BFCL 1.000 opciones | 0,439 (n=1909) | n/a | n/a | n/a | n/a | n/a |
| BFCL irrelevance | 0,586 (n=1101) | 0,702 | 0,788 | 0,390 | 0,701 | 0,661 |
| Adversarial (propio) | 0,887 (n=2000) | 0,832 | 0,619 | 0,628 | 0,793 | 0,449 |

Metricas adicionales sobre el split de test de typed-decisions, calculadas con las formulas de la tarjeta del benchmark (KL respecto al oro blando y Brier verificados contra las filas de referencia):

| Sistema | Precision | KL | Brier |
|---|---|---|---|
| OD-1 Base (generalista, zero-shot) | 0,582 | 0,496 | 0,241 |
| TypeSafe Jev 1.13 (generalista) | 0,727 | 1,442 | 0,148 |
| meraGPT Decider 1 (generalista) | 0,768 | 0,096 | 0,052 |

Validacion de la cascada: Nano solo 0,737; este modelo solo 0,761; cascada de dos modelos 0,766 con un 28,3 por ciento de peticiones escaladas. En modo *self-exit*, el *exit* solo alcanza 0,589 y con umbral 0,99 llega a 0,760 escalando el 99,7 por ciento de las peticiones.

Resultados de test en modo cascada de dos modelos: typed-decisions 0,582; AG News 0,802; Emotion 0,560; SST-5 0,482; Banking77 0,541; MASSIVE-en 0,679; BFCL native 0,945; BFCL 24 opciones 0,936; BFCL 100 opciones 0,868; BFCL 1.000 opciones 0,474; BFCL irrelevance 0,579; Adversarial 0,892.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone tiene unos 4.000 millones de parametros, lo que supone aproximadamente 8 GB en bf16 solo para los pesos, mas overhead de activaciones y cache. No hay cifras oficiales de consumo publicadas.
- GPU de referencia: todas las mediciones de velocidad del autor se realizaron en una H100 con bf16, peticiones de batch 1 y CUDA graphs.
- GPU de consumo: por tamano, un modelo de 4B en bf16 es compatible con tarjetas de 12 GB o mas (por ejemplo RTX 3060 de 12 GB, RTX 4070, 4080 o 4090), aunque el repositorio no documenta pruebas en estas GPUs. El modelo Nano incluido en `nano/` reduce aun mas el requisito para la mayor parte del trafico.
- Kernels: es obligatorio instalar los *kernels* rapidos de las capas de atencion lineal. Sin ellos, `transformers` usa una implementacion en PyTorch puro y la latencia se degrada de decimas de milisegundo a cientos de milisegundos por peticion.
- Opciones de despliegue: el autor documenta el uso mediante `transformers>=5.17.0` y el paquete `od1` (`od1.model.OD1Model` y `od1.cascade.OD1Cascade`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos GGUF.
- Latencia en H100, bf16, batch 1 con CUDA graphs (p50): estado corto (hasta 64 tokens) con 1 pregunta, 10,7 ms; con 5 preguntas, 26,3 ms; con 20 preguntas, 95,3 ms. Estado medio (200-400 tokens) con 1 pregunta, 15,6 ms; con 5 preguntas, 73,4 ms; con 20 preguntas, 126,1 ms.
- Comparativa de latencia declarada: Laya typed-decisions resolviendo todas las preguntas en una sola llamada tarda 15,9 / 17,9 / 21,4 ms en los casos cortos y 16,9 / 17,7 / 41,4 ms en los medios, es decir, es mas rapida cuando el numero de preguntas crece.
- El repositorio ocupa 12,8 GB, incluyendo el modelo 4B, el Nano y los artefactos de cascada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | typed-decisions (precision / KL / Brier) | BFCL native | AG News | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OD-1 Base (este modelo) | ~4B | Decision tipada con distribuciones y abtencion | 0,582 / 0,496 / 0,241 | 0,942 | 0,843 | Apache 2.0 | HuggingFace, 0 descargas |
| Jev 1.13 (`jev-1.13.0`) | no disponible | Sistema de decision de referencia | 0,741 (KL y Brier no reportados para esta fila) | 0,975 | 0,882 | no disponible | no disponible en la informacion |
| Laya typed-decisions | no disponible | Decision tipada nativa | 0,737 (KL y Brier no reportados) | 0,847 | 0,922 | no disponible | no disponible en la informacion |
| Tev1-4B | 4B | Sistema de decision | 0,690 (KL y Brier no reportados) | 0,954 | 0,886 | no disponible | no disponible en la informacion |
| CLM-8B | 8B | Sistema de decision | 0,393 (KL y Brier no reportados) | 0,694 | 0,354 | no disponible | no disponible en la informacion |
| meraGPT Decider 1 | no disponible | Generalista | 0,768 / 0,096 / 0,052 | no disponible | no disponible | no disponible | no disponible en la informacion |

En eficiencia de calculo, OD-1 Base tiene la ventaja de su tamano (4B) frente a CLM-8B, y en el conjunto adversarial propio supera a todas las alternativas comparadas (0,887 frente a 0,832 de Jev 1.13, 0,793 de Tev1-4B y 0,449 de CLM-8B). En cambio, pierde frente a Jev 1.13 en todos los demas conjuntos donde ambos tienen datos, e incluso frente a meraGPT Decider 1 en calibracion (KL 0,496 frente a 0,096 y Brier 0,241 frente a 0,052).

## Limitaciones y advertencias

- Solo ingles. No hay soporte declarado para otros idiomas, lo que invalida su uso directo en castellano sin un ajuste adicional.
- Precision por debajo de los mejores sistemas cerrados en tareas desconocidas. En typed-decisions queda en 0,582 frente a 0,741 de Jev 1.13 y 0,737 de Laya typed-decisions.
- El resultado `NOT_ANSWERABLE` solo se emite por encima del umbral ajustado en `serving.json`; por debajo de ese umbral el modelo responde igualmente, aunque con baja confianza. Es responsabilidad de la aplicacion gestionar ese caso.
- Degradacion severa con catalogos de opciones grandes: en BFCL con 1.000 opciones la precision cae a 0,439, frente a 0,942 con el conjunto nativo.
- Rendimiento limitado en deteccion de irrelevancia (BFCL irrelevance, 0,586), por debajo de Jev 1.13 (0,702) y de Laya (0,788).
- Las puntuaciones en typed-decisions miden la concordancia con el profesor de etiquetado del conjunto de datos, no con una verdad absoluta independiente.
- Las lineas base fueron evaluadas a traves de una interfaz que envuelve la pregunta como eleccion entre opciones, lo que puede infravalorarlas. No se ejecuto ninguna referencia de LLM de frontera.
- Requiere los kernels rapidos de atencion lineal; sin ellos la latencia se multiplica y el despliegue en produccion de baja latencia no es viable.
- El modelo no genera texto libre: no sirve para tareas de generacion, resumen o dialogo abierto.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones que conviene revisar.
- El repositorio registra 0 descargas y 0 valoraciones, por lo que no existe validacion independiente de los resultados publicados.
- El modo *self-exit* es practicamente inutil en la practica: con umbral 0,99 escala el 99,7 por ciento de las peticiones, por lo que solo aporta coste adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mvbalaji/od1-base
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: no disponible en la informacion proporcionada
- Blog o anuncio: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada (el uso se documenta con el paquete `od1` y el fichero `example.py` incluido en el propio repositorio)
- Demo: no disponible en la informacion proporcionada
- Tarjeta del benchmark typed-decisions: referenciada en la model card, sin URL disponible en la informacion proporcionada
