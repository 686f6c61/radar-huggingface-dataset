# boundlesssky1512/tellwater-glimmer-investigator

## Resumen

Tellwater investigator es un adaptador LoRA para el modelo base Muse Glimmer 30B, desarrollado por boundlesssky1512 en el contexto del Meta Global AI Developer Hackathon (octubre-noviembre de 2026). El adaptador convierte el modelo multimodal image-text-to-text en un investigador especializado que, paso a paso, determina si las aguas residuales de una fabrica textil pasaron realmente por su planta de tratamiento durante un tinte concreto. El modelo no solo genera texto: razona sobre lecturas de contadores, fotos de libros de registro, registros de mantenimiento y resultados de laboratorio, y emite uno de cuatro dictamenes (la evidencia respalda la afirmacion, la contradice, requiere revision o es insuficiente), solicitando el registro faltante cuando corresponde.

El adaptador se destila de Muse Spark (`muse-spark-1.3`), el modelo profesor que genero las investigaciones de casos simulados utilizadas como objetivo de entrenamiento. La relevancia practica del modelo radica en su naturaleza local: una fabrica puede auditar sus propios datos sin que estos salgan de sus instalaciones, ejecutando el adaptador sobre una GPU bajo su control o la de su auditor. En el sistema Tellwater completo, el adaptador relee cada caso despues de Muse Spark; cuando ambos discrepan, ninguna respuesta se usa y decide una persona.

El modelo base Muse Glimmer 30B es un modelo causal de 30.000 millones de parametros con codificador de percepcion, disenado por Meta para tareas agenticas autonomadas en hardware de consumo, con razonamiento multi-paso y uso fiable de herramientas. El adaptador ocupa solo 0,4 GB (pesos LoRA en safetensors) y se distribuye bajo licencia Apache 2.0, lo que permite inspeccion, modificacion y uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal multimodal (image-text-to-text) con codificador de percepcion |
| Parametros totales | No disponible para el adaptador; el modelo base Muse Glimmer 30B tiene 30.000 millones |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 32.768 tokens (longitud maxima de entrenamiento del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se entrena en bf16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); libreria `peft` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32, sin dropout, aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo de lenguaje del base Muse Glimmer 30B (revision `cec94fcfd6512f2cfe708138c32533b346ea4f69`, bf16). El entrenamiento fue supervisado (SFT) con pérdida calculada unicamente sobre los turnos del asistente, usando el renderizador `muse_glimmer` (Fireworks cookbook, Apache 2.0). Se uso el optimizador Adam con learning rate constante de 1e-4, betas 0,9/0,999, sin weight decay y con clipping de gradientes a norma 1. Se entrenaron 8 secuencias por batch durante 2 epocas (126 pasos) con longitud maxima de 32.768 tokens, sobre una unica NVIDIA H200 en Modal (2 h 36 min, pico de memoria de 92,8 GB, coste aproximado de 12 dolares). La pérdida paso de 0,257 en el paso 1 a 0,099 en el ultimo paso.

Los datos de entrenamiento consisten en 149 investigaciones de Muse Spark (`muse-spark-1.3`) que alcanzaron el hallazgo justificado y superaron el validador de citas, renderizadas como 502 secuencias: 59 de tipo "supports", 43 "contradicts", 24 "review required" y 23 "insufficient evidence". Todas provenian de la primera fabrica simulada. El autor documenta que una receta anterior que entrenaba tambien sobre el razonamiento previo a cada paso rindio peor en su comprobacion y fue descartada. La version "gaps" corrige un adaptador previo que sobreafirmaba "supports" en 4 de 6 casos frescos con registros faltantes.

## Capacidades

- Investigacion multi-paso de casos industriales: analiza evidencia heterogenea (lecturas de contadores, fotos de libros de registro, registros de mantenimiento y resultados de laboratorio) y emite un dictamen justificado entre cuatro categorias.
- Entrada multimodal image-text-to-text: procesa imagenes de documentos y registros junto con texto estructurado.
- Solicitud explicita de evidencia faltante: cuando no puede dictaminar, pide el registro concreto que falta (14 de 16 peticiones nombraron el registro correcto en el conjunto de test).
- Resistencia a inyeccion de instrucciones: 0 de 7 instrucciones plantadas en documentos fueron obedecidas en el test retenido.
- Razonamiento y citas verificables: las investigaciones de entrenamiento pasaron un validador de citas que exige justificar cada conclusion con la evidencia citada.
- Uso de herramientas y comportamiento agentico heredado del base Muse Glimmer 30B (tool-use, recuperacion de fallos, razonamiento multi-paso).
- Capacidades multilingues limitadas al ingles.
- No dispone de modo "thinking" documentado de forma independiente; el razonamiento se integra en la respuesta del adaptador.

## Casos de uso

- Auditoria de vertidos textiles in situ: una fabrica o su auditor ejecuta el adaptador en una GPU local para verificar si un tinte concreto paso por la planta de tratamiento, sin exportar datos del proceso a la nube; el modelo contrasta contadores, registros y laboratorio y emite dictamen con citas.
- Segunda lectura en pipelines de compliance ambiental: integrado en Tellwater tras Muse Spark, relee cada caso y, ante discrepancia, escala a revision humana; reduce falsos positivos y negativos frente a reglas solas (4 errores dañinos frente a 27).
- Deteccion de afirmaciones no respaldadas: el adaptador pregunta por el registro faltante en lugar de afirmar "supports" cuando la evidencia decisiva no esta, util para preauditorias antes de inspecciones regulatorias.
- Verificacion de registros documentales con vision: procesa fotos de libros de registro y ordenes de mantenimiento para comprobar coherencia temporal con las lecturas de contadores del tinte.
- Triaje de casos con evidencia insuficiente: clasifica como "insufficient evidence" y solicita el documento concreto, lo que permite al personal de planta localizar y aportar la evidencia antes de una auditoria formal.
- Defensa frente a manipulacion documental: al no obedecer instrucciones plantadas en documentos (0 de 7), sirve para detectar o neutralizar intentos de inyeccion en registros presentados por terceros.
- Despliegue en entornos con confidencialidad estricta: al ser un adaptador de 0,4 GB sobre pesos abiertos, puede ejecutarse en hardware controlado por la planta o el auditor, cumpliendo requisitos de no exfiltracion de datos industriales.

## Benchmarks y rendimiento

Conjunto de test retenido de 120 casos (la mitad de una segunda fabrica simulada nunca vista en entrenamiento), congelado y ejecutado una sola vez:

| Metrica (120 casos no vistos) | Muse Glimmer + adaptador | Muse Spark (profesor) | Lectura dual con arbitraje humano | Solo reglas |
|---|---|---|---|---|
| Correcto, o pidio registro o persona | 113 | 112 | 116 | 93 |
| Errores dañinos (absuelto erroneamente / acusado erroneamente) | 7 (5 / 2) | 8 (6 / 2) | 4 (3 / 1) | 27 (7 / 20) |
| Dictamenes fiables | 89% (58 de 65) | 89% (66 de 74) | 93% (56 de 60) | 61% (42 de 69) |
| Problemas reales clasificados como correctos | 0 de 62 | 2 | 0 | 6 |
| Peticiones que nombraron el registro correcto | 14 de 16 | 15 de 15 | 13 de 13 | 0 de 15 |
| Instrucciones plantadas obedecidas | 0 de 7 | 0 de 7 | – | – |
| Segundos por caso | 138 (una GPU) | 79 | – | – |

En la segunda fabrica (no vista en entrenamiento): correcto o pidio en 56 de 60, con 4 errores dañinos (frente a 57 y 3 en la primera). El adaptador pide registro o persona 22 veces, frente a 12 de Muse Spark.

Comprobaciones de desarrollo:

| Conjunto | Resultado |
|---|---|
| 10 casos con registro faltante o huecos honestos (`check_gaps`) | Correcto o pidio en 9 de 10, con 1 sobreafirmacion; el adaptador anterior sobreafirmo 4 veces; Muse Spark: 10 de 10 sin sobreafirmaciones |
| 8 casos frescos (`check`) | Correcto o pidio en 8 de 8, sin errores dañinos |
| Conjunto de desafio de 28 casos (`check_r3`) | 20 de 28 para este adaptador y 16 para Muse Spark bajo la regla predefinida, con 3 sobreafirmaciones cada uno; conjunto estrecho, no ranking general |
| Frente al base sin ajustar, en 46 casos | Mas decisivo, no mas seguro: el base derivo 22 de 46 a persona (3 lo requerian), frente a 20 peticiones de registro del adaptador (9 donde faltaba, 13 de 14 correctas frente a 5 de 5); 21 dictamenes con 17 fiables frente a 15 y 14; coste: correcto o pidio en 41 frente a 45 y 4 errores dañinos frente a 1, todos "supports" con registro decisivo ausente |

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa 0,4 GB, pero requiere cargar el base Muse Glimmer 30B completo. En bf16, el base necesita aproximadamente 60 GB de VRAM; con cuantizacion de 8 bits, alrededor de 30 GB; con 4 bits, aproximadamente 16-18 GB (estimaciones derivadas del tamano de parametros, no publicadas por el autor).
- GPU recomendadas: NVIDIA H200 (usada en entrenamiento, pico de 92,8 GB), A100 80 GB o H100 para bf16 sin cuantizar. Para cuantizacion de 4 bits, una RTX 4090 de 24 GB puede ser suficiente para el base, aunque no se documenta oficialmente.
- Cabe en GPU de consumo: probablemente con cuantizacion agresiva (4 bits) en RTX 4090 o similar, sujeto a validacion empirica no publicada.
- Opciones de despliegue: PEFT (libreria nativa del adaptador), vLLM, TGI y llama.cpp/Ollama para el base cuantizado con fusion del adaptador; el pipeline image-text-to-text exige soporte multimodal en el servidor de inferencia.
- Latencia y throughput: 138 segundos por caso en una unica GPU segun el test retenido, frente a 79 segundos de Muse Spark. No se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tellwater investigator (este adaptador) | Base 30B + LoRA r16 | 32.768 tokens | 113/120 correcto o pidio; 89% dictamenes fiables; 0 problemas reales clasificados como correctos | Apache 2.0 | Hugging Face (28 descargas) |
| Muse Spark (`muse-spark-1.3`) | No disponible | No disponible | 112/120 correcto o pidio; 89% fiables; 2 problemas reales clasificados como correctos | No disponible | Profesor propietario |
| Muse Glimmer 30B sin ajustar | 30B | No disponible | 45/46 correcto o pidio; 15 dictamenes con 14 fiables; 1 error dañino; deriva 22/46 a persona | No disponible | Pesos abiertos |
| Reglas deterministas | – | – | 93/120 correcto o pidio; 61% fiables; 27 errores dañinos | – | Codigo abierto en Tellwater |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de una unica fabrica simulada; generaliza razonablemente a una segunda (56 de 60 correcto o pidio) pero no se ha validado en plantas reales ni en otros sectores industriales.
- Solo soporta ingles; no se documentan capacidades multilingues.
- Pide registro o persona con mas frecuencia que su profesor (22 frente a 12), lo que puede generar carga adicional de revision en fabricas honestas.
- Riesgo de sobreafirmacion residual: 1 caso en `check_gaps` y 3 en el conjunto de desafio; en comparacion con el base, 4 errores dañinos frente a 1, todos por "supports" con registro decisivo ausente.
- Mayor latencia que el profesor: 138 s frente a 79 s por caso en una GPU.
- Depende del modelo base Muse Glimmer 30B, cuyos terminos y disponibilidad de pesos deben verificarse por separado; la licencia Apache 2.0 del adaptador no cubre necesariamente el base.
- No se documentan sesgos demograficos o linguisticos especificos; el dominio esta acotado a evidencia industrial y auditoria ambiental.
- Uso en produccion requiere validacion local con datos reales y mantiene la recomendacion de arbitraje humano ante discrepancias entre lecturas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boundlesssky1512/tellwater-glimmer-investigator
- Repositorio Tellwater: https://github.com/fariha-nirjana/tellwater
- Regla de comparacion congelada frente al base: https://github.com/fariha-nirjana/tellwater/blob/main/eval/frozen/base_glimmer_rule.md
- Guia de post-entrenamiento de Muse Glimmer (Meta): https://dev.meta.ai/docs/muse-glimmer/post-training
- Publicacion de Muse Glimmer 30B (Meta AI): https://ai.meta.com/research/publications/muse-glimmer-30b-an-on-device-agentic-model/
- Dataset de entrenamiento: https://huggingface.co/datasets/boundlesssky1512/tellwater-glimmer-training
