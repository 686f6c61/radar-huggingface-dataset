# open-athena/Snowball-67B-A2B-Math-RL-E14-Step16

## Resumen

Snowball-67B-A2B-Math-RL-E14-Step16 es un checkpoint de investigación publicado por la organización open-athena dentro de la campaña de experimentos Snowball, orientada al entrenamiento con aprendizaje por refuerzo sobre tareas de matemáticas. Se trata del artefacto exacto correspondiente al brazo E14, paso 16, descrito por el autor como el checkpoint final y más fuerte de ese brazo. Con 67.078.876.160 parámetros totales y una nomenclatura "A2B" que sugiere un diseño de mezcla de expertos con aproximadamente 2.000 millones de parámetros activos por token (dato no confirmado en la model card), el modelo se sitúa en la categoría de MoE de gran tamaño.

El modelo no es una versión de producción: la propia model card lo etiqueta como "research-artifact" y advierte de que su utilidad está limitada salvo que se preserve la integridad del router congelado ("frozen router bias"). El autor señala explícitamente que repositorios de nombre similar, como los antiguos `laion/rl-snowball-*`, pueden contener exportaciones con router mutable que colapsan durante la inferencia, por lo que no deben sustituirse por este artefacto.

Su relevancia actual es fundamentalmente metodológica: documenta una fila concreta de un experimento de RL matemático, con resultados en AIME24, MATH-500 y OlympiadBench, e incluye trazabilidad completa hacia el artefacto de origen en S3, un issue de experimento y un archivo de evidencias. Con cero descargas y cero "likes", se trata de un artefacto recién publicado y sin validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `grug_moe`; nomenclatura A2B), dentro del ecosistema `marin` |
| Parametros totales | 67.078.876.160 |
| Parametros activos | Aproximadamente 2.000 millones segun la nomenclatura A2B del nombre; no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos concretos detallados en la informacion disponible) |
| Formato de pesos | safetensors, con `model.safetensors.index.json` y shards; requiere conservar `config.json` y los ficheros del tokenizer |
| Tamano del repositorio | 268,3 GB |
| Pipeline declarado | reinforcement-learning |
| Brazo / paso del experimento | E14 / step 16 |
| Fecha de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

La informacion disponible identifica la arquitectura mediante la etiqueta `grug_moe`, un esquema de mezcla de expertos, y la nomenclatura "A2B" del nombre, que en las convenciones habituales de MoE indica el orden de magnitud de parámetros activos por token (en este caso, alrededor de 2.000 millones sobre un total de 67.078 millones). No se detalla en la model card el número de expertos, la estrategia de enrutamiento, el tipo de atención ni la longitud de contexto soportada. Tampoco se especifican los datos de preentrenamiento (número de tokens, composición del dataset) ni si hubo fases previas de ajuste supervisado.

Lo que sí se documenta es la fase de entrenamiento: el modelo es el resultado de un experimento de aprendizaje por refuerzo sobre matemáticas, ejecutado con GRPO segun la ruta del artefacto de origen (`...-grpo-ctx10-...`), dentro de la infraestructura Marin. La innovación técnica destacada por el autor no es arquitectónica, sino de integridad del artefacto: este checkpoint usa un sesgo de router congelado ("frozen router bias"), y el autor advierte que exportaciones con router mutable del mismo linaje colapsan en inferencia. La ruta de origen del artefacto sugiere además una ventana de contexto de trabajo de 10 (etiqueta `ctx10`), aunque no se traduce en una especificación publicada de contexto máximo.

## Capacidades

- Generacion de texto y razonamiento matematico: el modelo ha sido entrenado con RL especificamente sobre tareas de matematicas, con resultados medidos en AIME24, MATH-500 y OlympiadBench.
- Resolucion de problemas de competicion: los conjuntos de evaluacion empleados corresponden a problemas de nivel olimpiada y competicion.
- Generacion de cadenas de razonamiento largas: inherente a un pipeline de RL sobre problemas matematicos, aunque no se documenta un "thinking mode" explicito.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas soportados.
- Vision, audio u otras modalidades: no disponible; el repositorio solo contiene pesos de lenguaje.
- Reproducibilidad de experimentos: el artefacto esta vinculado a un issue de experimento y a un archivo de evidencias con resultados y advertencias de evaluacion.

## Casos de uso

- Reproduccion de experimentos de RL matematico: el checkpoint permite replicar la fila concreta del brazo E14 paso 16, comparando los resultados declarados (20,67 / 73,80 / 15,67) con ejecuciones propias bajo las mismas condiciones de evaluacion.
- Investigacion sobre integridad de routers en MoE: es un caso de estudio directo para medir que ocurre cuando se exporta un router congelado frente a uno mutable, un problema que el autor documenta como causa de colapso en inferencia.
- Generacion de datos sinteticos de matematicas: el modelo puede emplearse para producir soluciones y razonamientos que alimenten pipelines de destilacion o de curriculo, siempre que se filtren las respuestas por verificacion simbolica.
- Base para ajuste fino en dominios cientificos: al ser un MoE de 67B con ~2B activos, resulta atractivo como punto de partida para adaptaciones con coste de computo de inferencia relativamente bajo.
- Evaluacion de tecnicas de RL: sirve como referencia para estudiar el efecto del paso de entrenamiento (step 16) y del brazo (E14) sobre el rendimiento final en tareas de razonamiento.
- Construccion de verificadores o modelos de recompensa: las trazas generadas por un modelo entrenado con RL sobre matematicas pueden usarse para entrenar verificadores de pasos intermedios.
- Analisis de ablaciones sobre GRPO: la ruta de origen del artefacto permite rastrear hiperparametros (por ejemplo, contexto de trabajo 10) y correlacionarlos con los resultados publicados.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni aplicaciones conversacionales generales: no hay evidencia publicada de capacidades en esos ambitos y el autor lo clasifica como artefacto de investigacion.

## Benchmarks y rendimiento

| Benchmark | Resultado declarado |
|---|---|
| AIME24 (held-out) | 20,67 |
| MATH-500 (held-out) | 73,80 |
| OlympiadBench (held-out) | 15,67 |

Los tres valores provienen de la model card del autor. Las puntuaciones y las advertencias de evaluacion estan recogidas en el fichero `MATH_EVALS.md` del archivo de evidencias enlazado. No se han publicado en la informacion disponible comparaciones directas con otros modelos ni datos de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Peso de los parametros en bf16: aproximadamente 134 GB (67.078 millones de parametros a 2 bytes), sin contar cache KV ni activaciones.
- Tamano en disco del repositorio: 268,3 GB, muy por encima del peso teorico en bf16, por lo que conviene planificar almacenamiento adicional.
- GPU recomendadas: para inferencia en bf16 se necesita un nodo multi-GPU, tipicamente 2x H100 80 GB como minimo y preferiblemente 4x H100 80 GB o 4x A100 80 GB para disponer de margen de cache KV.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas equivalentes. Solo seria viable con cuantizacion agresiva a 4 bits, que no esta documentada en el repositorio y que ademas podria comprometer la integridad del router congelado.
- Opciones de despliegue: no disponible de forma confirmada. El repositorio no incluye la etiqueta `transformers`, la arquitectura es una implementacion MoE propia del ecosistema Marin y el autor exige conservar `config.json`, el tokenizer y todos los shards del indice. vLLM, TGI o llama.cpp no estan verificados para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros modelos, y los resultados de busqueda web proporcionados no contienen informacion tecnica relevante sobre alternativas de la misma categoria. Como referencia interna, el propio autor menciona los repositorios `laion/rl-snowball-*` como artefactos del mismo linaje, pero advierte que pueden contener exportaciones con router mutable que colapsan en inferencia, por lo que no son una alternativa equivalente fiable.

## Limitaciones y advertencias

- Artefacto de investigacion, no de produccion: la model card lo declara explicitamente y senala que su utilidad es limitada salvo que se preserve la reparacion del sesgo de router o la integridad del router congelado.
- Fragilidad del router: exportaciones con router mutable del mismo linaje pueden colapsar durante la inferencia; no se deben sustituir por este checkpoint.
- Dependencia de ficheros concretos: hay que conservar juntos `config.json`, los ficheros del tokenizer y todos los shards listados en `model.safetensors.index.json`; un ensamblaje parcial puede invalidar el artefacto.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial queda en una situacion de incertidumbre juridica que conviene aclarar con el autor antes de cualquier despliegue.
- Riesgo de alucinacion: no hay evaluacion publicada de tasas de alucinacion ni de fidelidad de los razonamientos; en matematicas, una cadena de pasos plausible puede contener errores no detectados.
- Rendimiento modesto en tareas de competicion: 20,67 en AIME24 y 15,67 en OlympiadBench indican margen de mejora considerable en problemas de nivel avanzado.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue ni sobre el comportamiento fuera del ingles.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que impide planificar cargas con documentos largos.
- Sin validacion comunitaria: cero descargas y cero "likes" en el momento de la consulta, sin terceros que hayan verificado los resultados.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware asequible.
- Fecha de publicacion futura respecto a la fecha de referencia habitual (2026-09-20): conviene verificar la vigencia y el contexto temporal del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E14-Step16
- Issue del experimento (marin-community): https://github.com/marin-community/marin/issues/7786
- Archivo de evidencias: https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Artefacto de origen (S3): `s3://marin-us-east-02a/marin/users/benjaminfeuer/skyrl/rl-snowball-e14-rno2a-dapo17k-grpo-ctx10-20260822-152413-d22187/exports/global_step_16/policy/`
- Repositorio de referencia del ecosistema Marin: https://github.com/marin-community/marin
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo (los resultados devueltos corresponden a sitios no relacionados: open.global, openai.com, openoffice.org y lequipe.fr).
