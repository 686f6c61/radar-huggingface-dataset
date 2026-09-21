# jaredpalmer/kev-9b

## Resumen

Kev-9B es un **modelo de decision** (decision model), no un modelo generativo: recibe un documento (el *state*) y un conjunto de preguntas tipadas, y devuelve en una sola pasada forward una distribucion de probabilidad por pregunta. No genera texto. Lo desarrolla jaredpalmer dentro del proyecto Kev y sirve el contrato publico `/v1/systemone` de TypeSafe. Tecnicamente es un adaptador LoRA (r=16, 45,4 millones de parametros entrenables) mas una cabecera *pointer* montados sobre `Qwen/Qwen3.5-9B-Base` (revision `68c46c4b`), por lo que su arquitectura subyacente es la del base: un transformer hibrido de 24 capas Gated DeltaNet (atencion lineal recurrente) y 8 capas de atencion completa.

Su relevancia es doble. Por un lado, propone un formato de salida estrictamente tipado (choice / noul / score) con probabilidades calibradas, pensado para automatizar decisiones con umbrales de confianza en lugar de generar respuestas. Por otro, es el primer checkpoint Kev en el rango de 8-9B que supera el filtro pre-registrado de pares reservados al 70 % en todas las semillas (0,75 y 0,80), y el que obtiene el mejor Brier de la familia (0,243 en el test bloqueado) junto con una mejora de +7,3 puntos porcentuales de accuracy fuera de dominio frente a Kev-8B en el mismo test.

El modelo se publica como adaptador PEFT (peso del repo 0,2 GB), con licencia Apache 2.0 y solo ingles. A fecha de la ficha acumula 0 descargas y 0 *likes*, y todas las metricas del `model-index` estan marcadas como no verificadas (`verified: false`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido del base `Qwen3.5-9B-Base`: 24 capas Gated DeltaNet (atencion lineal) + 8 capas de atencion completa; sobre el, adaptador LoRA (atencion, MLP y proyecciones DeltaNet) + cabecera pointer |
| Parametros totales | ~9B en el modelo base; el adaptador anade 45,4M parametros entrenables |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene el adaptador PEFT en safetensors; no se publican pesos GGUF ni cuantizados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere el modelo base `Qwen/Qwen3.5-9B-Base` en la revision `68c46c4b` |

## Arquitectura y entrenamiento

El modelo no es un LLM generativo: es un clasificador multi-pregunta con salida tipada. La entrada es un *state* (un documento) y un lote de preguntas; la salida es una distribucion de probabilidad por pregunta en una unica pasada. El adaptador LoRA tiene rango 16 y entrena 45,4 millones de parametros sobre las proyecciones de atencion, las capas MLP y las proyecciones DeltaNet, mas una cabecera pointer.

La innovacion tecnica relevante esta en como se maneja el hibrido. Las capas recurrentes (Gated DeltaNet) no pueden respetar una mascara causal por bloques, de modo que las preguntas se ejecutan como filas causales separadas que continuan desde el estado compartido (funcion `forward_rows_batch` en `kev/model.py`). Segun el autor, el aislamiento es exacto por construccion (junto frente a solo, dentro de 1e-5) y, en modelos de solo atencion, esta forma es identica bit a bit a la version empaquetada.

El entrenamiento usa exactamente la misma receta y los mismos datos que Kev-4B y Kev-8B: el conjunto `decision-v7` (diez fuentes publicas de clasificacion mas datos de politica programaticos), dos epocas, LoRA r=16 y learning rate 5e-5. El autor afirma explicitamente que no cambio nada mas, de modo que las diferencias de rendimiento observadas se atribuyen al cambio de modelo base. No se documenta en la informacion disponible el uso de RLHF, DPO ni el numero de tokens de entrenamiento.

Los diez conjuntos publicos citados en la etiqueta del repositorio son: `legacy-datasets/banking77`, `google/boolq`, `fancyzhx/ag_news`, `nyu-mll/multi_nli`, `SetFit/sst5`, `Yelp/yelp_review_full`, `CogComp/trec`, `fancyzhx/dbpedia_14`, `SetFit/amazon_reviews_multi_en` y `stanfordnlp/imdb`.

## Capacidades

- **Clasificacion con salida tipada**: responde preguntas de tipo choice (eleccion entre opciones), noul (escala tipo Likert) y score (puntuacion), devolviendo una distribucion de probabilidad en lugar de una etiqueta unica.
- **Calibracion de probabilidades**: el ECE declarado sobre probabilidades brutas en `decision-v7` es 0,06, lo que permite aplicar umbrales de confianza operativos.
- **Clasificacion de texto en dominios entrenados**: intenciones bancarias (Banking77), preguntas booleanas (BoolQ), temas de noticias (AG News), inferencia textual (MultiNLI), sentimiento en cinco niveles (SST-5), resenas (Yelp, Amazon, IMDb), clasificacion de preguntas (TREC) y topicos de DBpedia.
- **Transferencia fuera de dominio**: 0,812 de accuracy en `transfer-v4` development (seis fuentes nunca entrenadas) y 0,837 en el test bloqueado.
- **Razonamiento logico composicional**: resuelve plantillas del tipo `(A or B) and C` (0,84), `(A and B) or not C` (0,88) e `if A then not B else C` (0,91).
- **Aritmetica de fechas**: capacidad de plazo/`deadline` de tres niveles, con 0,72 de accuracy.
- **Conocimiento general en formato de opcion multiple**: 0,74 en MMLU y 0,545 en MMLU-Pro de 10 opciones.
- **Abstencion ante evidencia ausente**: solo el 0,05 de los items "incognoscibles" se responde con confianza ≥ 0,9, frente al 0,26 de Kev-8B; es la primera version Kev que en su mayoria declina comprometerse.
- **Estabilidad frente al orden de opciones**: tasa de inversion de 0,03.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision, audio ni modo *thinking*.

## Casos de uso

- **Enrutamiento de tickets de soporte**: el modelo clasifica la cola de destino de un ticket con 0,952 de accuracy en el conjunto externo de 900 tickets de scienthoon, y ademas detecta tono enfadado con 0,911 y ECE 0,082. Es adecuado porque la salida es probabilistica y permite fijar un umbral de derivacion a humano.
- **Moderacion de contenido**: con 0,78 en TweetEval-offensive, puede usarse como primera capa de filtrado de toxicidad, derivando los casos de confianza baja a revision manual.
- **Automatizacion de decisiones con politica programatica**: gracias a la cobertura de 0,53 con error ≤ 5 % y un ECE de 0,06 sobre probabilidades brutas, permite automatizar aproximadamente la mitad de las decisiones manteniendo el error por debajo del 5 % y derivando el resto.
- **Triaje de resenas y sentimiento**: sobre SST-5, Yelp, Amazon e IMDb puede asignar polaridad graduada (noul de cinco niveles) en pipelines de analitica de cliente, con la ventaja de que la escala de salida es ordinal.
- **Verificacion de equivalencia semantica y deduplicacion**: con 0,76 en PAWS puede emplearse para detectar pares de frases parafraseadas en sistemas de deduplicacion de documentos o de control de calidad de traducciones.
- **Deteccion de incertidumbre y abtencion**: con solo 0,05 de respuestas de alta confianza sobre items sin evidencia, es utilizable como modulo de "no se" en pipelines donde inventar una respuesta es costoso.
- **Clasificacion tematica de grandes volumenes**: entrenado sobre AG News, DBpedia y TREC, sirve para etiquetar corpus a escala sin generacion de texto, con un coste por item inferior al de un LLM generativo.
- **Evaluacion multiple-choice de conocimiento**: con 0,74 en MMLU y 0,96 en SciQ, puede actuar como *judge* restringido en arneses de evaluacion de modelos, siempre que las preguntas se formulen como opciones tipadas.
- **Extraccion de plazos y fechas**: sobre la tarea `deadline` de tres niveles obtiene 0,72, suficiente para preclasificacion en gestion documental siempre que se revise el tramo de baja confianza.
- **Verificacion de reglas de negocio compuestas**: las plantillas logicas con 0,84-0,91 de accuracy permiten comprobar condiciones de elegibilidad combinadas (por ejemplo, `(A and B) or not C`) sin escribir codigo ad hoc.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (todos con `verified: false`):

| Tarea | Conjunto de evaluacion | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Decision tipada (choice / noul / score) | decision-v7 development (1.204 registros; diez fuentes publicas entrenadas + datos de politica programaticos) | accuracy | 0,876 | No |
| Decision tipada (choice / noul / score) | decision-v7 development | ECE, probabilidades brutas | 0,06 | No |
| Decision tipada, fuera de dominio | transfer-v4 development (764 registros; seis fuentes nunca entrenadas + estructuras de politica reservadas) | accuracy | 0,812 | No |
| Decision tipada, fuera de dominio | transfer-v4 development | brier_score | 0,291 | No |
| Decision tipada, fuera de dominio, test bloqueado | transfer-v4 test (leido una vez) | accuracy | 0,837 | No |
| Decision tipada, fuera de dominio, test bloqueado | transfer-v4 test (leido una vez) | brier_score | 0,243 | No |

Comparativa publicada por el autor sobre los mismos items congelados:

| Metrica | Kev-4B (Qwen3) | Kev-8B (Qwen3) | Kev-4B | Kev-9B | Jev |
|---|---|---|---|---|---|
| Accuracy in-distribution (decision-v7 dev, 1.204 registros) | 0,854 | 0,863 | 0,877 | 0,876 | 0,845 |
| Accuracy out-of-domain (transfer-v4 dev, 764 registros) | 0,790 | 0,796 | 0,794 | 0,812 | 0,857 |
| Brier out-of-domain | 0,328 | 0,337 | 0,316 | 0,291 | 0,211 |
| Errores con confianza fuera de dominio (p ≥ 0,9 e incorrectos) | 8,2 % | 9,9 % | 8,2 % | 7,5 % | 3,7 % |
| Cobertura con error ≤ 5 % (decisiones automatizables) | 0,31 | 0,45 | 0,54 | 0,53 | 0,70 |
| Estructuras de politica reservadas, ambos hermanos correctos | 0,73 | 0,69 | 0,78 | 0,80 | 0,86 |
| Tasa de inversion por orden de opciones | 0,06 | 0,00 | 0,08 | 0,03 | 0,00 |
| Test bloqueado, accuracy out-of-domain / Brier | 0,806 / 0,294 | 0,780 / 0,327 | 0,832 / 0,266 | 0,837 / 0,243 | no disponible |
| Test bloqueado, accuracy in-distribution | 0,856 | 0,870 | 0,870 | 0,873 | no disponible |

Accuracy out-of-domain por fuente (Kev-9B / Jev):

| Fuente | Kev-9B | Jev |
|---|---|---|
| QNLI | 0,93 | 0,93 |
| SciQ | 0,96 | 0,99 |
| TweetEval-offensive | 0,78 | 0,81 |
| PAWS | 0,76 | 0,79 |
| MMLU | 0,74 | 0,90 |
| Emotion | 0,59 | 0,59 |
| deadline (aritmetica de fechas de 3 niveles) | 0,72 | 0,93 |
| (A or B) and C | 0,84 | 0,91 |
| (A and B) or not C | 0,88 | 0,97 |
| if A then not B else C | 0,91 | 0,78 |

Evaluaciones mas recientes (`transfer-v9` development), Kev-9B / Kev-8B / Jev:

| Metrica | Kev-9B | Kev-8B | Jev |
|---|---|---|---|
| MMLU-Pro (10 opciones) | 0,545 | 0,500 | 0,840 |
| Estado enterrado entre registros no relacionados | 0,74 | 0,72 | 0,70 |
| Items incognoscibles respondidos con ≥ 0,9 de confianza (menor es mejor) | 0,05 | 0,26 | 0,09 |

Suites externas (mismos items que las cifras publicadas de Jev):

| Suite | Kev-9B | Referencia |
|---|---|---|
| SemIf, 144 items de autoria | 0,917 | Kev-8B 0,903; Qwen3.5-4B sin entrenar de SemIf 0,813; Jev en vivo 0,965 |
| scienthoon, 900 tickets (queue) | 0,952 | Jev 0,897 |
| scienthoon, 900 tickets (angry) | 0,911 | Jev 0,914 |
| scienthoon, 900 tickets (ECE) | 0,082 | Jev 0,105 |

Comparacion pareada contra Kev-8B sobre los mismos items (*bootstrap* con agrupacion por registro): development +2,7 pp [−1,8; +6,4]; test bloqueado +7,3 pp [+2,8; +11,7] y Brier −0,084. Los criterios pre-registrados del experimento exigian un intervalo de confianza en la particion de desarrollo que excluyera el cero y un `deadline` ≥ 0,75; ninguno se cumplio (`deadline` 0,72). La lectura del test bloqueado, tomada una sola vez tras la seleccion, es la cifra confirmatoria.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones orientativas derivadas del numero de parametros del modelo base; el autor no publica requisitos de hardware en la informacion disponible.

- Peso del adaptador publicado: 0,2 GB. El coste real lo determina el modelo base `Qwen/Qwen3.5-9B-Base`, que debe descargarse aparte.
- Inferencia en bf16: aproximadamente 18 GB de pesos mas overhead de activaciones y cache. Como el base solo tiene 8 capas de atencion completa (las 24 restantes son Gated DeltaNet recurrentes), la cache KV es menor que la de un transformer denso de 32 capas de atencion completa.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB son suficientes en bf16 sin cuantizar.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB deberia alojar el modelo en bf16, aunque con poco margen para lotes grandes. En 8 bits (~9-10 GB) encaja comodamente en RTX 4080, 4070 Ti y similares; en 4 bits (~5-6 GB) seria viable en tarjetas de 8-12 GB.
- **Advertencia de cuantizacion**: los tipos de cuantizacion no estan documentados por el autor y no se publican pesos GGUF. Cualquier cuantizacion requiere convertir primero el modelo base fusionado con el adaptador LoRA, y la compatibilidad de las capas Gated DeltaNet con las herramientas de cuantizacion habituales no esta confirmada.
- Opciones de despliegue: el autor no documenta ninguna. La libreria declarada es `peft`, por lo que el flujo minimo es cargar el base con Transformers y aplicar el adaptador. El soporte de vLLM, TGI, llama.cpp u Ollama para este hibrido no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. La ventaja estructural es que cada consulta se resuelve en una sola pasada forward sin decodificacion autoregresiva, lo que reduce el coste por item frente a un LLM generativo del mismo tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy OOD (transfer-v4 dev) | Brier OOD | Test bloqueado (acc. / Brier) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Kev-9B | ~9B (base) + 45,4M (adaptador) | no disponible | 0,812 | 0,291 | 0,837 / 0,243 | apache-2.0 | HuggingFace, adaptador PEFT |
| Kev-8B (Qwen3) | ~8B + adaptador | no disponible | 0,796 | 0,337 | 0,780 / 0,327 | no disponible | Referencia interna del proyecto |
| Kev-4B | ~4B + adaptador | no disponible | 0,794 | 0,316 | 0,832 / 0,266 | no disponible | Referencia interna del proyecto |
| Jev | no disponible | no disponible | 0,857 | 0,211 | no disponible | no disponible | Modelo de referencia del autor |

Jev es el sistema de referencia con el que el autor compara: gana en accuracy fuera de dominio (0,857 frente a 0,812), en Brier (0,211 frente a 0,291) y en cobertura con error ≤ 5 % (0,70 frente a 0,53), pero pierde frente a Kev-9B en la plantilla logica `if A then not B else C` (0,78 frente a 0,91) y en el conjunto externo de tickets de scienthoon en la metrica de cola (0,897 frente a 0,952). No se han encontrado modelos de decision con contrato tipado equivalentes fuera del propio proyecto Kev, por lo que la comparativa externa queda como no disponible.

## Limitaciones y advertencias

- **No es un modelo generativo**: no produce texto, no soporta tool calling, agentes, vision ni audio. Solo responde preguntas tipadas sobre un documento de entrada.
- **Solo ingles**: el campo de idiomas declarado es `en`. El comportamiento en castellano u otros idiomas es no disponible y previsiblemente degradado.
- **Metricas no verificadas**: los seis valores del `model-index` estan marcados con `verified: false`. Son cifras declaradas por el autor y no auditadas de forma independiente.
- **Criterios pre-registrados incumplidos**: el propio autor reconoce que no se alcanzo el intervalo de confianza en la particion de desarrollo ni el umbral de `deadline` ≥ 0,75. La mejora confirmatoria depende de una unica lectura del test bloqueado.
- **Errores con confianza**: un 7,5 % de las predicciones fuera de dominio tienen p ≥ 0,9 y son incorrectas. No es un modelo apto para decidir sin umbral de abstención.
- **Punto debil en reconocimiento de emocion**: 0,59 en la fuente Emotion, muy por debajo del resto de fuentes evaluadas.
- **Escasa validacion externa**: 0 descargas y 0 *likes* en el momento de la ficha, con un unico mantenedor. No hay evidencia de uso en produccion por terceros.
- **Riesgo de alucinacion en forma de compromiso excesivo**: aunque la tasa de respuestas de alta confianza sobre items incognoscibles ha bajado a 0,05, no es cero.
- **Dependencia del modelo base**: la licencia Apache 2.0 cubre el repositorio publicado, pero la licencia aplicable a `Qwen/Qwen3.5-9B-Base` no consta en la informacion disponible y debe verificarse antes de un uso comercial.
- **Caveat de despliegue**: al ser un hibrido con capas recurrentes, las herramientas estandar de cuantizacion y de servidores de inferencia pueden no soportarlo. Requiere validacion previa.
- **Dependencia de revision concreta**: el modelo esta construido sobre la revision `68c46c4b` del base. Cambiar de revision puede invalidar el adaptador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jaredpalmer/kev-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio de codigo, suites y experimentos: https://github.com/jaredpalmer/kev (incluye `PLAN_Qwen35.md` con el port y este experimento, `PLAN.md` y `runs/leaderboard.md`; el *trial* publicado es `q35-9b/01-trial-1`)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos resultados obtenidos tratan sobre el cliente de intercambio de archivos Soulseek y no guardan relacion con Kev-9B. No se han encontrado papers, blogs ni demos adicionales.
