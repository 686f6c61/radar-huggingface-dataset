# open-athena/Snowball-67B-A2B-Math-RL-E6-Step20-Repaired

## Resumen

Snowball-67B-A2B-Math-RL-E6-Step20-Repaired es un checkpoint de investigación publicado por la organización open-athena. Corresponde al artefacto exacto evaluado en la fila "E6 original", paso 20, del experimento Snowball 67B-A2B de aprendizaje por refuerzo orientado a matemáticas. No es un modelo de producción: la propia model card lo etiqueta como "research-artifact" y advierte de que su utilidad está limitada a que se preserve la reparación del sesgo del router (SFT router-bias repair) o la integridad de un router congelado.

El modelo tiene 67.078.876.160 parámetros totales (unos 67,08 mil millones) según los pesos safetensors, con un repositorio de 134,2 GB, lo que es coherente con un almacenamiento en precisión de 16 bits. La nomenclatura "67B-A2B" y la etiqueta `grug_moe` apuntan a una arquitectura de mezcla de expertos (MoE) con aproximadamente 2 mil millones de parámetros activos por token, aunque el desglose exacto de parámetros activos no está documentado en la información disponible. El contexto máximo, los idiomas soportados y el detalle de cuantizaciones tampoco se especifican.

Su relevancia es acotada y de carácter metodológico: sirve como referencia reproducible de un punto concreto de una campaña de RL sobre matemáticas, con resultados publicados en AIME24, MATH-500 y OlympiadBench, y con una advertencia explícita sobre artefactos hermanos (`laion/rl-snowball-*`) que pueden colapsar en inferencia por exportar routers mutables sin reparar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `grug_moe` sugiere mezcla de expertos; sin confirmacion documental) |
| Parametros totales | 67.078.876.160 (~67,08 B) |
| Parametros activos | no disponible (la nomenclatura "A2B" sugiere ~2 B activos, sin confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos detallados en la informacion proporcionada) |
| Formato de pesos | safetensors (con `model.safetensors.index.json`, `config.json` y ficheros de tokenizer) |
| Tamano del repositorio | 134,2 GB |
| Pipeline declarado | reinforcement-learning |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-20 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. Las etiquetas del repositorio (`grug_moe`, `marin`, `snowball`) y el sufijo "A2B" del nombre permiten situarlo en la familia de checkpoints MoE del ecosistema Marin, con un total de 67,08 B de parametros y un numero de parametros activos no confirmado. El checkpoint se identifica como el brazo "E6 original", paso 20, de un experimento de reinforcement learning sobre matematicas, y su estado de router se describe como "SFT router-bias repaired", es decir, con una reparacion del sesgo introducido en el router durante el SFT. La model card insiste en que se preserve `config.json`, los ficheros del tokenizer y todos los shards referenciados por `model.safetensors.index.json` de forma conjunta, lo que indica que el artefacto depende de esa combinacion exacta para reproducir el comportamiento evaluado.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni la secuencia exacta de tecnicas de alineacion (RLHF, DPO u otras) mas alla de la referencia generica a reinforcement learning y a una etapa previa de SFT con reparacion del sesgo de router. El checkpoint se distribuye como artefacto congelado y no como modelo base reentrenable. La unica innovacion tecnica documentada es precisamente ese tratamiento del router: la advertencia de que repositorios con nombres similares pueden contener exportaciones con router mutable que se degradan en inferencia.

## Capacidades

- Razonamiento matematico de competicion: es la capacidad para la que existen evidencias directas, con resultados en AIME24, MATH-500 y OlympiadBench.
- Generacion de texto y resolucion paso a paso de problemas matematicos en el formato empleado por esas evaluaciones.
- Modo de razonamiento extendido: no disponible (no se documenta un "thinking mode" explicito).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado).
- Vision, audio u otras modalidades: no disponible (no hay evidencia de soporte multimodal).

## Casos de uso

- Reproduccion de resultados de investigacion: cargar el checkpoint junto con `config.json`, tokenizer y shards exactos para replicar las puntuaciones publicadas de AIME24, MATH-500 y OlympiadBench dentro del experimento Snowball E6.
- Estudio del sesgo de router en MoE: comparar este artefacto reparado con exportaciones de router mutable de la familia `laion/rl-snowball-*` para analizar el colapso en inferencia descrito en la model card.
- Ablaciones de RL sobre matematicas: usar el paso 20 del brazo E6 como punto de referencia intermedio frente a otros pasos o brazos de la misma campaña.
- Generacion de datos sinteticos de matematicas para destilacion: emplear las trazas de solucion del checkpoint como material de partida en experimentos internos, asumiendo su condicion de artefacto de investigacion y verificando las respuestas.
- Analisis de errores en razonamiento simbolico: estudiar los fallos tipicos en problemas de olimpiada (OlympiadBench, 22,67) frente a conjuntos mas estandarizados (MATH-500, 76,80) para caracterizar donde se rompe el razonamiento.
- Base para ajuste fino supervisado en dominios matematicos acotados: partir del checkpoint reparado y aplicar SFT con datos propios, siempre que la licencia "other" se revise antes de cualquier uso mas alla de la investigacion.
- Evaluacion de infraestructura de inferencia MoE: medir latencia y throughput reales de una arquitectura de 67 B totales con activacion reducida, comparando frameworks de servicio.

## Benchmarks y rendimiento

Resultados publicados en la model card para el checkpoint evaluado (paso 20, brazo E6 original):

| Benchmark | Resultado |
|---|---|
| AIME24 (held-out) | 26,00 |
| MATH-500 (held-out) | 76,80 |
| OlympiadBench (held-out) | 22,67 |

La model card indica que las puntuaciones y las advertencias de evaluacion estan registradas en `MATH_EVALS.md`, dentro del archivo de evidencias en HuggingFace. No se proporcionan resultados comparativos con otros modelos en la informacion disponible, ni metricas de MMLU, HumanEval, GSM8K u otras.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 134 GB en fp16/bf16 (coincide con el tamano del repositorio, 134,2 GB), unos 67 GB en cuantizacion de 8 bits y unos 34 GB en 4 bits. A estas cifras hay que sumar la memoria de cache KV, que depende de la longitud de contexto y del numero de secuencias concurrentes.
- GPU recomendadas: para fp16/bf16, configuraciones de 2x A100 80 GB o 2x H100 80 GB como minimo; para 8 bits, una sola GPU de 80 GB resulta ajustada; para 4 bits, una GPU de 48 GB es el minimo razonable.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas equivalentes en cuantizacion de 4 bits sin offloading a RAM del sistema, dado que solo los pesos en 4 bits rondan los 34 GB. Con offloading el rendimiento cae de forma significativa.
- Opciones de despliegue: no confirmadas para esta arquitectura. Los contenedores habituales (vLLM, TGI, llama.cpp, Ollama) no estan verificados en la informacion disponible, y la etiqueta `grug_moe` sugiere que puede requerir codigo de modelado especifico. No se publican variantes GGUF.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con activacion reducida (nomenclatura A2B), el coste por token deberia ser inferior al de un modelo denso de 67 B, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. Como referencias cualitativas del propio ecosistema:

| Modelo | Relacion | Datos comparables |
|---|---|---|
| Snowball-67B-A2B-Math-RL-E6-Step20-Repaired | Artefacto de referencia reparado (SFT router-bias) | AIME24 / MATH-500 / OlympiadBench: 26,00 / 76,80 / 22,67 |
| Repositorios `laion/rl-snowball-*` con nombres similares | Exportaciones con router mutable segun la model card | no disponible; la model card advierte de posible colapso en inferencia |
| Otros checkpoints de 67 B orientados a matematicas | Categoria equivalente por tamano y tarea | no disponible |

## Limitaciones y advertencias

- Artefacto de investigacion, no un lanzamiento de produccion: la propia model card declara que su utilidad es limitada fuera del contexto experimental.
- Sensibilidad del router: sustituir este checkpoint por repositorios de nombre parecido (`laion/rl-snowball-*`) puede provocar colapso en inferencia por routers mutables sin reparar.
- Dependencia de la integridad del artefacto: hay que conservar juntos `config.json`, los ficheros del tokenizer y todos los shards listados en `model.safetensors.index.json`; mezclar versiones puede invalidar el comportamiento evaluado.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial no esta claro y requiere revision legal previa.
- Idiomas: no se declara ningun idioma soportado, lo que impide garantizar un comportamiento multilingue correcto.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinacion: previsible en cualquier modelo de lenguaje aplicado a razonamiento matematico; las puntuaciones de OlympiadBench (22,67) y AIME24 (26,00) indican una tasa elevada de fallo en problemas de competicion.
- Sin cuantizaciones oficiales ni garantias de compatibilidad con frameworks de servicio habituales.
- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluacion de sesgo, toxicidad o sesgo de idioma.
- Sin soporte documentado de tool calling, agentes o multimodalidad; no debe asumirse en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E6-Step20-Repaired
- Archivo de evidencias (dataset): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Issue del experimento en el repositorio Marin: https://github.com/marin-community/marin/issues/7786
- Artefacto de origen (S3, referencia interna del autor): s3://marin-us-east-02a/marin/diagnostics/snowball-bias-transplant-20260805/e6-s20-sftbias/policy/
- Paper o informe tecnico: no disponible
- Demo o espacio interactivo: no disponible
