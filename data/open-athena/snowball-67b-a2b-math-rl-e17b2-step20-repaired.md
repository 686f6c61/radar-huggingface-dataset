# open-athena/Snowball-67B-A2B-Math-RL-E17b2-Step20-Repaired

## Resumen

Snowball-67B-A2B-Math-RL-E17b2-Step20-Repaired es un checkpoint de investigación publicado por la organización open-athena. Se trata del artefacto exacto utilizado para una fila reportada en el experimento Snowball 67B-A2B de aprendizaje por refuerzo sobre matemáticas, dentro de la campaña de entrenamiento Marin. Cuenta con 67.078.876.160 parámetros totales (aproximadamente 67.000 millones) y el repositorio ocupa 134,2 GB en safetensors.

El modelo no es un lanzamiento de producción, sino un artefacto de investigación. Su rasgo distintivo es que su estado de router ha sido reparado tras el ajuste supervisado (SFT router-bias repaired; VERIFY OK), un detalle crítico porque repositorios de nombre similar de la campaña contienen exportaciones con router mutable que colapsan durante la inferencia. La nomenclatura A2B y la etiqueta grug_moe apuntan a una arquitectura de mezcla de expertos, aunque el número de parámetros activos no se declara explícitamente en la información disponible.

Su relevancia es doble: por un lado documenta un paso concreto (arm E17b2, step 20) de un pipeline de RL sobre tareas matemáticas verificables; por otro, sirve como evidencia reproducible de que la reparación del sesgo del router es necesaria para que estos checkpoints sean utilizables, algo relevante para cualquiera que investigue sobre inestabilidad de routers en modelos MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (etiqueta grug_moe; sin confirmacion explicita de detalles internos) |
| Parametros totales | 67.078.876.160 |
| Parametros activos | no disponible (la nomenclatura A2B sugiere del orden de 2.000 millones, dato no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no hay GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | other (artefacto de investigacion; condiciones concretas no detalladas) |
| Formato de pesos | safetensors, fragmentado y descrito por model.safetensors.index.json |
| Tamano del repositorio | 134,2 GB |
| Pipeline declarado | reinforcement-learning |
| Arm / step | E17b2 / step 20 |
| Estado del router | SFT router-bias reparado; VERIFY OK |

## Arquitectura y entrenamiento

La etiqueta grug_moe y la pertenencia a la campana Marin indican que se trata de un transformer con capas de mezcla de expertos (MoE). El identificador del artefacto de origen (rl-snowball-e17b2-rno2a-rlvrmath-interp015-sr-20260825-014631/global_step_20/policy/) sugiere un entrenamiento con refuerzo sobre recompensas verificables en matemáticas (RLVR-math), a partir de un punto de partida ya sometido a ajuste supervisado (SFT). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de DPO o RLHF genérico.

La innovación reseñable no es arquitectónica sino de integridad del artefacto: el checkpoint incorpora una reparación del sesgo del router introducido durante el SFT y ha pasado una verificación (VERIFY OK). La propia model card advierte que exportaciones con router mutable de la misma campana colapsan en inferencia, por lo que la reparación del sesgo del router o la congelación del mismo es lo que hace utilizable este artefacto. Se indica además que deben conservarse juntos config.json, los ficheros del tokenizer y todas las particiones referenciadas por model.safetensors.index.json.

## Capacidades

- Generación de texto orientada a razonamiento matemático, derivada del entrenamiento con refuerzo sobre tareas de matemáticas verificables.
- Resolución de problemas de competición: los puntos de evaluación reportados son AIME24, MATH-500 y OlympiadBench.
- Comportamiento de política (policy) dentro de un pipeline de RL, es decir, checkpoint intermedio de un proceso de optimización, no un modelo alineado para uso general.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas soportados.
- Capacidades especiales (modo thinking explícito, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Reproducción de resultados de investigación: el checkpoint es el artefacto exacto de una fila reportada del experimento Snowball 67B-A2B, por lo que permite replicar la evaluación sobre AIME24, MATH-500 y OlympiadBench con el mismo estado de pesos y de router.
- Estudio de integridad de routers en MoE: comparar este checkpoint reparado con las exportaciones de router mutable de la campana permite medir experimentalmente el colapso en inferencia y caracterizar la reparación del sesgo.
- Ablaciones sobre RL para matemáticas: al ser el step 20 del arm E17b2, sirve como punto de referencia intermedio para analizar la evolución de la capacidad matemática a lo largo del entrenamiento.
- Evaluación de arneses y métricas: útil como sujeto de prueba para validar pipelines de evaluación en problemas de competición, dado que existen puntuaciones de referencia publicadas y un archivo de evidencia con las advertencias metodológicas.
- Destilación o generación de datos sintéticos en el dominio matemático: la política puede emplearse para producir trazas de razonamiento que después se filtren y reutilicen, siempre que la licencia lo permita.
- Auditoría de licencias y trazabilidad en organizaciones de investigación: el artefacto incluye la ruta S3 de origen y un issue de experimento, lo que facilita reconstruir la cadena de custodia antes de decidir su uso interno.
- Docencia y formación en entrenamiento de modelos: como ejemplo documentado de un checkpoint intermedio con problemas conocidos de router, es material ilustrativo para explicar por qué no se deben sustituir artefactos de una campana por otros de nombre similar.

## Benchmarks y rendimiento

| Benchmark | Resultado reportado |
|---|---|
| AIME24 | 20,67 |
| MATH-500 | 77,20 |
| OlympiadBench | 22,00 |

Estos valores corresponden a evaluación en conjuntos held-out y están registrados, junto con sus advertencias metodológicas, en MATH_EVALS.md dentro del archivo de evidencia. No se han proporcionado resultados comparativos con otros modelos, por lo que no es posible establecer una comparación numérica directa.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 134,2 GB, lo que en precisión bf16 exige en torno a 140 GB o más de memoria de GPU contando caché KV y overhead de runtime.
- Configuración mínima razonable: 2 GPU de 80 GB para bf16 en el límite, aunque 4 GPU de 80 GB ofrece margen para contexto y lotes mayores.
- GPU recomendadas: H100 80 GB y A100 80 GB en configuraciones multi-GPU. No es viable en una única GPU de 80 GB.
- GPU de consumo: no cabe. Ni siquiera en RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo, salvo cuantizaciones agresivas no publicadas oficialmente.
- Opciones de despliegue: no hay cuantizaciones GGUF ni recetas publicadas para llama.cpp u Ollama. El formato safetensors fragmentado es compatible con servidores de inferencia como vLLM o TGI, siempre que se respete la configuración MoE y se conserven config.json, tokenizer y todas las particiones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-E17b2-Step20-Repaired | 67.078.876.160 | no disponible | AIME24 20,67 / MATH-500 77,20 / OlympiadBench 22,00 | other | HuggingFace, 0 descargas |
| Exportaciones previas laion/rl-snowball-* | no disponible | no disponible | no disponible | no disponible | HuggingFace, con router mutable segun la model card |

No se dispone de datos de benchmarks ni de especificaciones verificables de modelos alternativos de la misma categoría en la información proporcionada, por lo que no se incluye una comparación numérica con otros modelos de razonamiento matemático.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un lanzamiento de producción. La propia model card indica que su utilidad es limitada salvo que se preserve la reparación del sesgo del router o la integridad del router congelado.
- Riesgo de sustitución: repositorios de nombre similar de la campana pueden contener exportaciones con router mutable que colapsan en inferencia. No deben usarse como equivalentes.
- Integridad del artefacto: hay que conservar juntos config.json, los ficheros del tokenizer y todas las particiones listadas en model.safetensors.index.json; un subconjunto incompleto puede dar lugar a pesos inconsistentes.
- Licencia other: las condiciones concretas de uso comercial no están detalladas, por lo que se requiere revisión legal antes de cualquier despliegue productivo.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe.
- Longitud de contexto no declarada: no se puede planificar el uso con entradas largas sin verificación empírica.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; se trata de un checkpoint intermedio de RL matemático sin garantías de alineación general.
- Rendimiento matemático moderado: 20,67 en AIME24 y 22,00 en OlympiadBench indican que el modelo falla en la mayoría de problemas de competición de ese nivel.
- Sin cuantizaciones publicadas: no hay GGUF ni recetas de despliegue ligero, lo que dificulta su uso fuera de entornos con GPU de datacenter.
- Advertencias metodológicas: las puntuaciones deben interpretarse junto a las salvedades recogidas en MATH_EVALS.md del archivo de evidencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E17b2-Step20-Repaired
- Issue del experimento en el repositorio Marin: https://github.com/marin-community/marin/issues/7786
- Archivo de evidencia (dataset): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Artefacto de origen: s3://marin-us-east-02a/marin/exports/snowball-bias-repaired/rl-snowball-e17b2-rno2a-rlvrmath-interp015-sr-20260825-014631/global_step_20/policy/
