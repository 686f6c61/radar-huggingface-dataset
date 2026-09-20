# open-athena/Snowball-67B-A2B-Math-RL-E6-Repro-Step20

## Resumen

Snowball-67B-A2B-Math-RL-E6-Repro-Step20 es un checkpoint de investigación publicado por la organización open-athena dentro de la campaña "Snowball" de entrenamiento con refuerzo sobre matemáticas. Se trata de un artefacto de investigación, no de un lanzamiento de producción: la propia model card lo califica como "research artifact" y advierte de que su utilidad práctica queda limitada salvo que se preserve la integridad del router congelado o se repare el sesgo del router.

El modelo tiene 67.078.876.160 parámetros totales (unos 67.000 millones) según los pesos en safetensors, y la nomenclatura "A2B" del nombre apunta a una arquitectura de mezcla de expertos con un subconjunto reducido de parámetros activos por token, coherente con el tag `grug_moe` de la ficha de HuggingFace. El repositorio ocupa 134,2 GB, lo que encaja con pesos en precisión de 16 bits. No se especifican en la documentación disponible la longitud de contexto, los idiomas soportados ni los esquemas de cuantización publicados.

Su relevancia actual es acotada y muy específica: sirve como punto de reproducción exacto de una fila concreta reportada en el experimento de RL matemático de Snowball, con resultados registrados en AIME24, MATH-500 y OlympiadBench. La model card insiste en que repositorios con nombres similares de la organización `laion` pueden contener exportaciones con router mutable que colapsan en inferencia, por lo que este artefacto no es intercambiable con ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), tag `grug_moe`; estructura interna detallada no disponible |
| Parametros totales | 67.078.876.160 (67,08 mil millones) |
| Parametros activos | No disponible de forma explícita; la nomenclatura "A2B" sugiere del orden de 2.000 millones activos por token, sin confirmación en la model card |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican GGUF ni variantes cuantizadas en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | other (licencia personalizada; condiciones no detalladas en la información disponible) |
| Formato de pesos | safetensors, con `model.safetensors.index.json` y shards múltiples; también `config.json` y ficheros de tokenizer |
| Tamano del repositorio | 134,2 GB |
| Pipeline declarado | reinforcement-learning |
| Etapa del entrenamiento | Paso 20 (arm E6, reproducción A) |
| Estado del router | Sesgo de router congelado (frozen router bias) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como una mezcla de expertos (tag `grug_moe`) integrada en el ecosistema Marin, con un total de 67.078.876.160 parámetros y pesos almacenados en safetensors. No se documentan el número de capas, la dimensión oculta, el número de expertos por capa, la estrategia de enrutamiento ni la composición del dataset de preentrenamiento. Tampoco se detalla si hubo fases de ajuste supervisado, DPO o RLHF previas a la etapa de RL que da nombre al checkpoint.

Lo que sí está documentado es la fase final de entrenamiento: aprendizaje por refuerzo sobre tareas de matemáticas (RLVR math), dentro del brazo experimental "E6 reproduction A", en el paso 20. El checkpoint corresponde exactamente a la fila reportada en el experimento y se exportó desde la ruta `s3://marin-us-east-02a/iris/rl-snowball-e6-rno2a-rlvrmath-grug-67b-a-20260812-150653-98cb43/exports/global_step_20/policy/`. La innovación destacable, y también el principal riesgo, es el estado del router: la model card especifica "frozen router bias" y advierte de que exportaciones con router mutable de la misma campaña colapsan durante la inferencia, de modo que la integridad del router es un requisito técnico para que el artefacto funcione como se reportó.

## Capacidades

- Razonamiento matemático: el modelo ha sido entrenado con refuerzo sobre problemas de competición y evaluación matemática, con resultados registrados en AIME24, MATH-500 y OlympiadBench.
- Generación de texto orientada a resolución de problemas: la política exportada corresponde a un modelo de lenguaje de 67.000 millones de parámetros totales con enrutamiento MoE.
- Inferencia con mezcla de expertos: activa únicamente un subconjunto de parámetros por token según la nomenclatura A2B, lo que reduce el coste de cómputo por token frente a un modelo denso del mismo tamaño.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el entrenamiento con RL sobre matemáticas implica cadenas de razonamiento, pero no se documenta ningún protocolo de agente.
- Capacidades multilingües: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de resultados de investigación: el checkpoint existe precisamente para reproducir la fila reportada en el experimento Snowball 67B-A2B math-RL, con puntuaciones de referencia en AIME24 (19,67), MATH-500 (73,60) y OlympiadBench (20,00). Es el uso principal y el único plenamente respaldado por la documentación.
- Evaluación de pipelines de RLVR: permite estudiar cómo se comporta una política de 67B totales con router congelado tras 20 pasos de RL sobre matemáticas, como línea base para comparar con otros brazos experimentales de la misma campaña.
- Investigación sobre enrutamiento en MoE: dado que la model card documenta explícitamente el problema del router mutable que colapsa en inferencia, este artefacto sirve para estudiar reparación de sesgo de router y comparar exportaciones con router congelado frente a router mutable.
- Generación de datos sintéticos matemáticos supervisados: el modelo puede producir soluciones paso a paso a problemas de nivel de competición, útiles como material de entrenamiento o de comparación, siempre que se valide la calidad de las salidas por muestreo.
- Evaluación comparativa de modelos matemáticos: encaja como participante en baterías de evaluación tipo MATH-500 u OlympiadBench para situar el efecto del RL en modelos MoE grandes.
- Auditoría de artefactos de investigación: el repositorio permite verificar la integridad de shards, `config.json` y tokenizer frente al archivo de evidencias, algo relevante para equipos que replican experimentos de terceros.
- No se recomienda su uso en atención al cliente, generación de código en producción ni asistentes conversacionales generales: no hay documentación de soporte multilingüe, tool calling, ventana de contexto ni licencia comercial clara.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| AIME24 | 19,67 | Conjunto reservado (held-out) |
| MATH-500 | 73,60 | Conjunto reservado (held-out) |
| OlympiadBench | 20,00 | Conjunto reservado (held-out) |

Los detalles metodológicos y las advertencias sobre la evaluación están registrados en el fichero `MATH_EVALS.md` del archivo de evidencias. No se han publicado en la información disponible resultados comparativos frente a otros modelos en MMLU, HumanEval, GSM8K u otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 134 GB solo para los pesos, más memoria para caché KV y activaciones; se necesitan al menos dos aceleradores de 80 GB.
- VRAM estimada en cuantización int8: en torno a 67-70 GB para los pesos, viable en una GPU de 80 GB con margen ajustado.
- VRAM estimada en cuantización de 4 bits: del orden de 34-40 GB para los pesos, viable en una única GPU de 48 GB o en configuraciones multi-GPU de consumo.
- GPU recomendadas: H100 80 GB (x2 o más en bf16), A100 80 GB (x2 o más en bf16), L40S 48 GB o RTX 6000 Ada para cuantizaciones agresivas.
- GPU de consumo: una RTX 4090 de 24 GB no permite cargar el modelo en bf16; solo sería posible con cuantización de 4 bits y offload parcial a RAM, con latencia muy alta y riesgo de alterar el comportamiento del router.
- Opciones de despliegue: vLLM y TGI soportan arquitecturas MoE y son las vías razonables para safetensors; llama.cpp y Ollama requerirían una conversión a GGUF que no está publicada en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Advertencia de despliegue: cualquier cuantización o conversión de formato puede modificar el comportamiento del router congelado; conviene validar con MATH-500 tras el despliegue antes de dar por bueno el artefacto.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con resultados homogéneos para este checkpoint. Como referencia de categoría (modelos MoE de tamaño comparable), se incluyen datos públicamente conocidos de alternativas, sin comparación de rendimiento directa:

| Modelo | Parametros totales | Parametros activos | Licencia | Benchmarks comparables |
|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-E6-Repro-Step20 | 67,08 mil millones | No disponible (nomenclatura A2B sugiere ~2 mil millones) | other | AIME24 19,67; MATH-500 73,60; OlympiadBench 20,00 |
| Qwen3-30B-A3B | 30 mil millones aprox. | 3 mil millones aprox. | Apache-2.0 | No disponible en la información proporcionada |
| Mixtral 8x7B | 46,7 mil millones aprox. | 12,9 mil millones aprox. | Apache-2.0 | No disponible en la información proporcionada |
| DeepSeek-V2-Lite | 15,7 mil millones aprox. | 2,4 mil millones aprox. | MIT | No disponible en la información proporcionada |

Las cifras de los modelos alternativos proceden de su documentación pública habitual y se incluyen solo como orientación de categoría; no se ha ejecutado ninguna evaluación conjunta con este checkpoint.

## Limitaciones y advertencias

- Naturaleza de artefacto de investigación: la model card indica explícitamente que estos checkpoints "no son lanzamientos de producción" y que su utilidad es limitada salvo que se preserve la integridad del router congelado o se repare el sesgo del router.
- Riesgo de router mutable: repositorios con nombres parecidos de `laion/rl-snowball-*` pueden contener exportaciones con router mutable que colapsan en inferencia. No deben sustituir a este artefacto.
- Integridad de ficheros: es necesario conservar juntos `config.json`, los ficheros del tokenizer y todos los shards referenciados por `model.safetensors.index.json`; mezclar shards de otras exportaciones invalida el artefacto.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo, toxicidad o fairness.
- Riesgo de alucinación: no cuantificado. Al ser un modelo entrenado con RL sobre matemáticas y sin datos de evaluación general, se desconoce su comportamiento fuera del dominio matemático.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, por lo que no pueden asumirse conversaciones largas ni uso multilingüe.
- Restricciones de licencia: la licencia es "other" y no se detallan sus términos en la información disponible. Debe consultarse el texto completo de la licencia antes de cualquier uso comercial.
- Ausencia de cuantizaciones oficiales: no hay GGUF ni versiones cuantizadas publicadas, lo que dificulta el despliegue en hardware de consumo y aumenta el riesgo de degradar el enrutamiento si se generan conversiones propias.
- Paso de entrenamiento muy temprano: el artefacto corresponde al paso 20 de la campaña de RL, un punto intermedio del proceso de optimización, no un modelo final convergido.
- Uso previsto: exclusivamente evaluación, reproducción y estudio de dinámicas de RL y enrutamiento en MoE.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E6-Repro-Step20
- Archivo de evidencias (dataset): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Issue del experimento en Marin: https://github.com/marin-community/marin/issues/7786
- Ruta de origen del artefacto: s3://marin-us-east-02a/iris/rl-snowball-e6-rno2a-rlvrmath-grug-67b-a-20260812-150653-98cb43/exports/global_step_20/policy/
- Repositorios relacionados con router mutable (referenciados como no equivalentes): laion/rl-snowball-*
