# notfakerv/Inkling-2-Mini-Abliterated-WSP-GGUF

## Resumen

Inkling-2-Mini-Abliterated-WSP-GGUF es una version modificada del modelo multimodal Inkling-2-Mini de Thinking Machines, publicada por el usuario notfakerv en Hugging Face. La modificacion consiste en la eliminacion de los mecanismos de rechazo (refusal) y de buena parte de las respuestas matizadas o evasivas mediante una tecnica de edicion de pesos sin gradientes denominada weight-space programming (WSP). No se ha realizado fine-tuning, ni LoRA, ni entrenamiento supervisado: las direcciones de rechazo se extraen de las activaciones del propio modelo sobre unos cientos de prompts y se escriben directamente en un conjunto reducido de matrices.

El modelo base es un Mixture of Experts (MoE) de aproximadamente 26.070 millones de parametros totales, con capacidades de imagen-texto (pipeline image-text-to-text) y un contexto de razonamiento que en la model card se asocia a un limite de 8000 tokens en las pruebas comparativas. Se distribuye unicamente en formato GGUF cuantizado Q4_K_M con imatrix, lo que lo hace ejecutable en llama.cpp y LM Studio, y esta pensado para investigacion sobre mecanismos de rechazo, red-teaming y robustez.

Su relevancia actual radica en que ofrece una comparativa pre-registrada y estadisticamente documentada frente a otras variantes abliterated del mismo modelo base (Blackfrost Derisked, OrcaRouter abliterated e Inkling-2-Mini-uncensored de benthecarman), con metricas de tasa de respuesta completa, sobre-rechazo (XSTest), GSM8K, HumanEval y divergencia KL respecto al modelo original. La licencia es Apache 2.0, pero el propio autor advierte que el comportamiento de seguridad ha sido eliminado deliberadamente y que el modelo respondera a peticiones que el original rechaza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, multimodal image-text-to-text (heredada del modelo base) |
| Parametros totales | 26.070.385.152 (~26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como especificacion formal; las pruebas usan un limite de 8000 tokens de generacion y el autor menciona "exact speedups for long contexts" en el runtime |
| Tipos de cuantizacion | GGUF Q4_K_M con imatrix (unica cuantizacion publicada en este repo) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); tamano del repo 18,7 GB |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un Mixture of Experts multimodal (image-text-to-text) de unos 26.070 millones de parametros totales. La variante publicada aqui no introduce cambios arquitectonicos: parte de los pesos del modelo original y aplica weight-space programming (WSP v3), una tecnica de edicion de pesos sin gradientes. El procedimiento consiste en leer las direcciones de rechazo a partir de las activaciones del propio modelo sobre unos cientos de prompts y escribir esas direcciones en un pequeno conjunto de matrices, sin fine-tuning, sin LoRA y sin retropropagacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo RLHF o DPO; esos datos no aparecen en la informacion proporcionada. La innovacion tecnica destacable de esta variante es doble: por un lado, el metodo WSP como alternativa a la abliteration clasica basada en edicion de tensores de atencion; por otro, la validacion pre-registrada (criterio escrito y hasheado antes de generar muestras, en `validation/PREREGISTRATION.md`) con bootstraps pareados de 10.000 replicas y 10 semillas. El runtime recomendado incluye soporte de decodificacion especulativa DFlash2 con un drafter incluido en el repo, asi como correcciones para el token `<|end_message|>` y aceleraciones para contextos largos.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento con modo de pensamiento extendido (el modelo base se evalua con `reasoning_effort` configurable, incluido el nivel `low`).
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Razonamiento matematico: 97,0% en GSM8K (200 problemas) segun la evaluacion del autor.
- Generacion de codigo: 93,3% de pass en HumanEval (164 problemas).
- Respuesta a prompts que el modelo original rechaza, con una tasa de respuesta completa del 77,8% frente al 0,6% del modelo original en el conjunto de 162 prompts daninos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo de razonamiento del modelo base sugiere capacidad, pero no hay confirmacion.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales: modo de razonamiento con presupuesto de tokens, procesamiento de imagen, y comportamiento sin rechazo ni matizaciones.

## Casos de uso

- Investigacion sobre mecanismos de rechazo: el modelo permite estudiar como se representa y se suprime el comportamiento de rechazo en un MoE multimodal, comparando las activaciones y los pesos editados frente al modelo original.
- Red-teaming y evaluacion de seguridad: sirve como modelo "sin salvaguardas" controlado para probar clasificadores de contenido, filtros de salida y sistemas de moderacion en pipelines de produccion.
- Pruebas de robustez de sistemas de moderacion: al generar respuestas completas a prompts que el original rechaza, permite medir la tasa de deteccion de filtros propios antes de desplegar un modelo en produccion.
- Analisis de sobre-rechazo (over-refusal): con un 100% de respuestas en XSTest (250 prompts seguros que parecen inseguros), es util para calibrar umbrales de rechazo en modelos que sufren falsos positivos.
- Evaluacion comparativa de tecnicas de abliteration: la comparativa pre-registrada frente a Blackfrost Derisked y OrcaRouter abliterated permite reproducir y contrastar metodologias de edicion de pesos.
- Generacion de codigo y matematicas en entornos de investigacion: con 93,3% en HumanEval y 97,0% en GSM8K, puede usarse para experimentos de razonamiento donde se necesita un modelo que no evada ciertas peticiones tecnicas.
- Despliegue local en llama.cpp o LM Studio: el formato GGUF Q4_K_M con imatrix y un repo de 18,7 GB permite ejecutarlo en estaciones de trabajo con GPU de consumo para experimentacion offline.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 162 prompts daninos retenidos (una muestra cada uno), con el mismo juez leyendo hasta 8000 caracteres, temperatura 1.0, top-k 50, top-p 1.0, min-p 0 y semilla base 0, todo con llama.cpp:

| Modelo | Respuesta completa | Matizada | Rechazo | Sin respuesta (limite) | XSTest respondido | GSM8K | HumanEval | KLD vs original | PPL |
|---|---|---|---|---|---|---|---|---|---|
| Inkling 2 Mini original | 0,6% | 17,9% | 81,5% (132) | 0,0% | 98,8% | 95,0% | 93,9% | 0 (referencia) | 6,50 |
| Blackfrost Derisked | 43,2% | 53,1% | 3,1% (5) | 0,6% | 99,6% | 96,5% | 93,3% | 0,018 | 6,56 |
| OrcaRouter abliterated | 29,0% | 69,1% | 1,9% (3) | 0,0% | 99,6% | 96,5% | 90,2% | 0,096 | 6,95 |
| OrcaRouter abliterated, effort low | 24,1% | 73,5% | 2,5% (4) | 0,0% | - | - | - | - | - |
| Este modelo (WSP v3) | 77,8% | 18,5% | 1,2% (2) | 2,5% | 100,0% | 97,0% | 93,3% | 0,034 | 6,62 |

Diferencia en tasa de respuesta completa frente a cada comparador (puntos porcentuales, IC 95% por bootstrap pareado):

| Comparador | Juez lee 8000 caracteres (primario) | Juez lee 2500 caracteres | Gana en todas las semillas y ventanas |
|---|---|---|---|
| Inkling 2 Mini original | +77,2 [+70,4, +83,3] | +72,2 [+65,4, +79,0] | si |
| Blackfrost Derisked | +34,6 [+25,9, +43,2] | +35,8 [+27,2, +44,4] | si |
| OrcaRouter abliterated | +48,8 [+40,1, +56,8] | +45,1 [+36,4, +53,7] | si |
| OrcaRouter abliterated, effort low | +53,7 [+45,7, +61,7] | +48,8 [+40,1, +56,8] | si |

Guardas de calidad (diferencia frente a cada comparador, puntos porcentuales, IC 95%):

| Benchmark | vs original | vs Blackfrost | vs OrcaRouter | Margen |
|---|---|---|---|---|
| XSTest prompts seguros respondidos | +1,2 [+0,0, +2,8] | +0,4 [+0,0, +1,2] | +0,4 [+0,0, +1,2] | -3 |
| GSM8K | +2,0 [+0,5, +4,0] | +0,5 [+0,0, +1,5] | +0,5 [-1,0, +2,5] | -5 |
| HumanEval pass | -0,6 [-3,7, +2,4] | +0,0 [-2,4, +2,4] | (no mostrado completo) | no disponible |

Las metricas KLD y PPL se midieron sobre wiki.test (32 x 512 tokens) frente al modelo original. En la comparativa frente a benthecarman's Inkling-2-Mini-uncensored, el autor indica que tambien obtiene mas respuestas completas, con sobre-rechazo, GSM8K y HumanEval dentro de los mismos margenes, pero no se muestran los valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 18,7 GB en Q4_K_M, por lo que se necesita al menos esa cantidad de memoria (GPU o RAM) mas overhead del runtime y cache KV; con contexto largo, el consumo adicional de KV puede ser significativo.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, una GPU de 24 GB (RTX 3090, RTX 4090) o superior es el minimo practico para Q4_K_M completo en VRAM.
- Cabe en GPU de consumo: si, en GPU con 24 GB o mas para la cuantizacion Q4_K_M; en GPUs de 16 GB requeriria offloading parcial a RAM.
- Opciones de despliegue: llama.cpp upstream b12597 o posterior ejecuta el GGUF tal cual; LM Studio requiere un runtime personalizado construido desde el fork `renoirvieir4/llama.cpp`, rama `inkling2-scale`, que incluye soporte de Inkling 2, la correccion de `<|end_message|>`, aceleraciones para contextos largos y decodificacion especulativa DFlash2 con el drafter del repo. Los ajustes probados de LM Studio estan en `lmstudio/inkling-2-mini-wsp-v3.config.json`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Respuesta completa (162 prompts) | XSTest | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Este modelo (WSP v3) | ~26,07 mil millones | no disponible | 77,8% | 100,0% | 97,0% | 93,3% | Apache 2.0 | GGUF Q4_K_M en HF |
| Inkling 2 Mini original | ~26,07 mil millones | no disponible | 0,6% | 98,8% | 95,0% | 93,9% | no disponible | HF (modelo base) |
| Blackfrost Derisked | ~26,07 mil millones (base) | no disponible | 43,2% | 99,6% | 96,5% | 93,3% | no disponible | HF (tensores editados) |
| OrcaRouter abliterated | ~26,07 mil millones (base) | no disponible | 29,0% | 99,6% | 96,5% | 90,2% | no disponible | GGUF Mix-16G en HF |

Las cuatro variantes comparten el mismo modelo base y, por tanto, el mismo tamano y arquitectura MoE; las diferencias estan en la tecnica de edicion, la cuantizacion y el comportamiento resultante. OrcaRouter no ha publicado pesos BF16, por lo que su KLD incluye el efecto de su cuantizacion diferente.

## Limitaciones y advertencias

- El comportamiento de seguridad ha sido eliminado deliberadamente: el modelo cumplira peticiones que el original rechaza, incluidas las daninas, ilegales u ofensivas. El autor lo libera solo para investigacion, red-teaming y estudio de mecanismos de rechazo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modelo mantiene la PPL del original (6,62 frente a 6,50), lo que sugiere una degradacion limitada pero no nula.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar del modelo base, hereda los sesgos de este.
- Limitacion de idioma: solo ingles segun la etiqueta de idioma; no se garantiza un rendimiento equivalente en castellano u otros idiomas.
- Limitacion de contexto: no se especifica la longitud maxima formal; las pruebas usan un limite de 8000 tokens de generacion y el 2,5% de las respuestas daninas no terminaron dentro de ese limite.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propio autor advierte que es responsabilidad del usuario anadir salvaguardas antes de cualquier despliegue y que las salidas no representan la opinion de los autores ni de Thinking Machines.
- Requiere un runtime especifico para LM Studio (fork `inkling2-scale`); llama.cpp upstream b12597 o posterior funciona sin modificaciones.
- La evaluacion se limita a 162 prompts daninos, 250 de XSTest, 200 de GSM8K y 164 de HumanEval; no cubre otros dominios ni idiomas.
- El modelo se distribuye unicamente en Q4_K_M; no hay pesos BF16 ni otras cuantizaciones en este repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notfakerv/Inkling-2-Mini-Abliterated-WSP-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blackfrost Derisked: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- OrcaRouter abliterated GGUF: https://huggingface.co/orcarouter/Inkling-2-Mini-abliterated-GGUF
- Runtime recomendado para LM Studio (fork de llama.cpp, rama `inkling2-scale`): https://github.com/renoirvieir4/llama.cpp/tree/inkling2-scale
- Pre-registro de la evaluacion: `validation/PREREGISTRATION.md` (en el repositorio del modelo)
- Instrucciones de uso del runtime: `runtime/README.md` (en el repositorio del modelo)
- Configuracion probada de LM Studio: `lmstudio/inkling-2-mini-wsp-v3.config.json` (en el repositorio del modelo)
