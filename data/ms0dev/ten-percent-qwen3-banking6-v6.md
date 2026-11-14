# ms0dev/ten-percent-qwen3-banking6-v6

## Resumen

ms0dev/ten-percent-qwen3-banking6-v6 es un artefacto GGUF derivado de Qwen/Qwen3-30B-A3B-Instruct-2507, publicado por el usuario ms0dev, orientado a clasificacion de intenciones en atencion al cliente bancaria. El modelo base es un transformer MoE de 30.532.122.624 parametros totales (con aproximadamente 3.000 millones activos por token, segun la nomenclatura A3B de Qwen3). El artefacto GGUF ocupa 6.063.794.656 bytes, lo que corresponde a un 9,9401% del peso fp16 del modelo base (61.066.575.656 bytes), de ahi el nombre "ten-percent".

La tarea concreta es el enrutamiento de consultas de clientes bancarios hacia seis colas operativas: account_identity, card_management, cash_currency, payments_disputes, top_up y transfers. El autor reporta una retencion del 98,81% de las respuestas correctas del modelo base sobre un examen bloqueado de 3.180 items (2.680 de Banking77 y 500 de CLINC150), con un 94,87% de acierto absoluto frente al 94,94% del base.

El aspecto mas distintivo del artefacto es el mecanismo de "feedback en tiempo de ejecucion": con 25 anotaciones de ejemplo, el runtime calcula prototipos contrastivos a partir del estado oculto final del modelo y aplica un `logit_bias` sobre los primeros tokens de las cinco intenciones nuevas, sin modificar pesos, sin adaptadores y sin memoria lateral persistente. El autor declara que esta construccion es la unica que satisface simultaneamente no cambiar pesos, no almacenar memoria, no anadir cabezas nuevas y obtener la etiqueta del propio forward pass del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3-30B-A3B) |
| Parametros totales | 30.532.122.624 (modelo base); 21.921.675.264 (artefacto safetensors reportado) |
| Parametros activos | no disponible (nomenclatura A3B sugiere ~3.000 millones, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF comprimido (artefacto unico de 6.063.794.656 bytes); niveles concretos no especificados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (artefacto principal); safetensors reportado en metadatos |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B-Instruct-2507 es un transformer con mezcla de expertos (MoE) de 30.532.122.624 parametros totales. El artefacto publicado no es un fine-tuning clasico: segun la model card, el autor aplica un proceso de compresion (pruning, calibracion y cuantizacion) sobre el base para producir un GGUF de 6.063.794.656 bytes, sin anadir parametros nuevos, cabezas, adaptadores ni memoria lateral. El SHA-256 del artefacto es `ff79893c598ed7fa265cd7a2a66c9da1fba13f9a8a0c2d4c66b50e1d11b87b80`.

El mecanismo de adaptacion a las cinco intenciones nuevas (top_up y otras) se ejecuta exclusivamente en inferencia: para cada consulta, el runtime computa el estado oculto final con el GGUF entregado, forma cinco prototipos contrastivos a partir de 25 anotaciones y aplica `bias_t = 0.3 * dot(prototipo_t, h)` mediante el `logit_bias` del servidor sobre el primer token de cada intencion nueva. No se almacena ningun prototipo, anotacion, cabeza, fila, adaptador ni memoria, y el prompt no se modifica. Las 25 anotaciones son entrada solo para esa ejecucion. El autor declara que el proceso de compresion y calibracion nunca uso CLINC150; las descripciones de cola se refinaron sobre el split de desarrollo de CLINC, extremo que se disclose en la model card.

## Capacidades

- Clasificacion de intenciones bancarias en seis colas operativas: account_identity, card_management, cash_currency, payments_disputes, top_up y transfers.
- Generacion de la etiqueta de cola mediante el propio forward pass del modelo (no multiple-choice con letras).
- Adaptacion en tiempo de ejecucion a intenciones nuevas mediante hasta 25 anotaciones contrastivas y `logit_bias`, sin modificar pesos.
- Capacidades heredadas del base Qwen3-30B-A3B-Instruct-2507 (generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes y multilingueismo), si bien la model card no las detalla ni las valida para este artefacto comprimido.
- Sin modo thinking, vision ni audio documentados para este artefacto.
- Sin soporte de persistencia de feedback entre sesiones: las 25 anotaciones deben aportarse en cada ejecucion.

## Casos de uso

- Enrutamiento automatizado de tickets de soporte bancario: el modelo clasifica cada consulta entrante en una de las seis colas operativas, adecuado porque el examen bloqueado de 3.180 items reporta un 94,87% de acierto absoluto y un 98,81% de retencion respecto al base.
- Triaje de quejas de clientes en tiempo real: la clasificacion hacia payments_disputes (98,30% de retencion reportada) permite derivar disputas de pago al equipo correcto sin reglas manuales.
- Personalizacion de intenciones nuevas con pocas anotaciones: con 25 anotaciones aportadas en runtime, el autor reporta un salto del 28,57% al 78,29% en el conjunto held-out de 175 items, util para incorporar colas de negocio emergentes sin reentrenar.
- Integracion en pipelines de atencion al cliente con vLLM o llama.cpp: el artefacto GGUF de 6,1 GB puede servirse con endpoints compatibles (tag `endpoints_compatible`) y aplicarse el `logit_bias` desde el servidor.
- Clasificacion de reclamaciones regulatorias: el autor reporta un 89,66% de retencion (156/174) sobre un examen extra de 500 quejas reales CFPB 2015-2016, util como referencia de robustez fuera de distribucion, aunque por debajo del 98% in-distribution.
- Despliegue en hardware de gama media: al ocupar 6,1 GB en GGUF, el artefacto es viable en GPUs consumer con 8-12 GB de VRAM, a diferencia del base fp16 de 61 GB.
- Evaluacion comparativa de tecnicas de compresion: util como referencia reproducible para investigadores que comparan pruning, calibracion y cuantizacion sobre modelos MoE de 30B con retencion medida sobre examenes bloqueados.

## Benchmarks y rendimiento

| Metrica | Base | v6 |
|---|---|---|
| Examen bloqueado de 3.180 items | 94,94% (3.019/3.180) | 94,87% (3.017/3.180) |
| Retencion de aciertos del base | — | 98,81% (2.983/3.019) |
| account_identity | — | 98,71% |
| card_management | — | 99,10% |
| cash_currency | — | 99,56% |
| payments_disputes | — | 98,30% |
| top_up | — | 97,40% |
| transfers | — | 99,33% |
| Banking77 | — | 99,10% |
| CLINC150 | — | 97,14% |

Resultados de feedback en runtime (25 anotaciones, 175 items held-out, sin cambios de pesos):

| Condicion | Precision |
|---|---:|
| Vacio (sin bias) | 28,57% (50/175) |
| 25 anotaciones | 78,29% (137/175) |
| Etiquetas barajadas | 17,14% (30/175) |

Real frente a vacio: +49,71 puntos, 87 ganancias / 0 perdidas, McNemar p=1,3e-26. Real frente a barajado: +61,14, 107/0, p=1,2e-32. Barajado frente a vacio: -11,43, p=0,0012. Replicacion con ocho conjuntos disjuntos de 25 anotaciones: 76,00-80,00%, agrupado 1095/1400 = 78,21% frente a vacio 400/1400 = 28,57% y barajado 202/1400 = 14,43% (695 ganancias / 0 perdidas, p=1,2e-209). Prueba de stress OOD sobre 500 items CFPB 2015-2016: 156/174 = 89,66% de retencion, por debajo del 98% in-distribution.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,1 GB para el artefacto GGUF, mas overhead de contexto y runtime; el base fp16 ocupa 61 GB.
- GPU recomendadas: no especificadas en la informacion; por tamano, el artefacto es compatible con GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4090) y con A100/H100 para mayor throughput.
- Cabe en GPU consumer: si, dado el tamano de 6,1 GB del GGUF.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con endpoints (tag `endpoints_compatible`) que expongan `logit_bias`; vLLM y TGI no estan confirmados en la informacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ms0dev/ten-percent-qwen3-banking6-v6 | 30.532.122.624 (base); 21.921.675.264 (safetensors reportado) | no disponible | apache-2.0 | GGUF (6,1 GB) | Clasificacion bancaria de 6 colas; 98,81% de retencion |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (base) | 30.532.122.624 | no disponible | apache-2.0 | safetensors | Modelo generalista MoE; 94,94% en el examen bloqueado |
| Qwen3-30B-A3B en otras compresiones GGUF | 30.532.122.624 | no disponible | apache-2.0 | GGUF | Alternativas de cuantizacion estandar, sin adaptacion a la tarea bancaria |
| Modelos de clasificacion de intenciones especializados (Banking77) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El 98,81% de retencion es in-distribution; el propio autor disclose un 89,66% de retencion sobre el examen OOD CFPB 2015-2016 (156/174), por debajo del headline.
- Las descripciones de cola se refinaron sobre el split de desarrollo de CLINC150, extremo disclose por el autor; el test de CLINC150 se bloqueo antes del examen final y nunca se uso en compresion, calibracion ni cuantizacion.
- Sin persistencia: las 25 anotaciones deben aportarse en cada ejecucion; el modelo no las retiene tras la sesion, consecuencia directa de no cambiar pesos ni almacenar memoria lateral.
- El artefacto esta especializado en seis colas bancarias; su utilidad fuera de esa tarea no esta validada y las capacidades generalistas del base pueden degradarse tras la compresion al 9,9401%.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al derivar de Qwen3, hereda los sesgos del base, no evaluados aqui.
- Idiomas soportados: no disponibles; la tarea bancaria descrita es en ingles (Banking77, CLINC150, CFPB).
- Licencia apache-2.0 permite uso comercial, pero el autor no documenta condiciones adicionales ni garantias de produccion.
- El repo tiene 119 descargas y 0 likes; no hay validacion independiente de terceros reportada en la informacion.
- El modelo reporta un pipeline "no disponible" en Hugging Face, lo que puede complicar la integracion automatica en algunas plataformas.

## Enlaces

- Hugging Face: https://huggingface.co/ms0dev/ten-percent-qwen3-banking6-v6
- Codigo, prueba, evidencia y comandos: https://github.com/ms0-dev/ten-percent-challenge-best
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
