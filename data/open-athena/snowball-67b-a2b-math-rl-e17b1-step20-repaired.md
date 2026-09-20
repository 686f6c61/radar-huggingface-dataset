# open-athena/Snowball-67B-A2B-Math-RL-E17b1-Step20-Repaired

## Resumen

Snowball-67B-A2B-Math-RL-E17b1-Step20-Repaired es un checkpoint intermedio de un experimento de aprendizaje por refuerzo sobre matemáticas dentro de la campaña Snowball, publicada por el usuario open-athena. El nombre del repositorio y la model card lo identifican como el artefacto exacto correspondiente a una fila reportada del experimento "Snowball 67B-A2B math-RL", en concreto el brazo E17b1 en el paso 20 del entrenamiento por refuerzo. Con 67.078.876.160 parámetros totales (unos 67.000 millones) y una nomenclatura A2B que apunta a un modelo de mezcla de expertos con aproximadamente 2.000 millones de parámetros activos por token, se trata de un modelo de gran tamano con coste de inferencia reducido en comparación con un denso equivalente.

Su relevancia es fundamentalmente científica: la model card lo etiqueta explícitamente como "research-artifact" y advierte de que no es una versión de producción. El punto crítico del artefacto es el estado del router del MoE: el autor indica que lleva una reparación del sesgo de router ("SFT router-bias repaired; VERIFY OK") y avisa de que otros repositorios de nombre parecido, como los `laion/rl-snowball-*`, pueden contener exportaciones con router mutable que colapsan durante la inferencia. Es decir, el valor del checkpoint depende de preservar la integridad del router reparado.

El modelo reporta resultados en evaluaciones de matemáticas de nivel competición (AIME24, MATH-500 y OlympiadBench) en el paso 20 del RL, con puntuaciones de 20,33, 73,40 y 17,33 respectivamente. No hay información publicada sobre longitud de contexto, idiomas soportados, composición del dataset de entrenamiento ni detalles del tokenizador más allá de lo que figura en los archivos del repositorio, por lo que buena parte de la ficha queda marcada como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; implementación etiquetada como `grug_moe` dentro del ecosistema Marin |
| Parámetros totales | 67.078.876.160 (aproximadamente 67,08 mil millones) |
| Parámetros activos | Aproximadamente 2.000 millones (deducido de la nomenclatura "A2B" del nombre del modelo; no confirmado explícitamente en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en el repositorio (solo pesos en safetensors; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada; no se detallan los términos en la información proporcionada) |
| Formato de pesos | safetensors (con `config.json`, ficheros de tokenizer y `model.safetensors.index.json` que deben conservarse juntos) |
| Tamaño del repositorio | 134,2 GB |
| Pipeline declarado | reinforcement-learning |
| Etiquetas | safetensors, grug_moe, marin, snowball, reinforcement-learning, research-artifact, license:other, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 20 de septiembre de 2026 (ambas, según los metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos, etiquetado por el autor como `grug_moe` y asociado al ecosistema Marin. El nombre "67B-A2B" indica 67.000 millones de parámetros totales con 2.000 millones activos por token, lo que implica enrutado disperso hacia un subconjunto de expertos. No se dispone de información sobre el número de expertos, el tamaño de cada uno, la estrategia de enrutado (top-k, auxiliares de balanceo) ni la profundidad de la red; tampoco sobre la longitud de contexto nativa.

En cuanto al entrenamiento, el checkpoint corresponde al brazo `E17b1`, paso `20` de un proceso de aprendizaje por refuerzo cuyo artefacto de origen se nombra como `rl-snowball-e17b1-rno2a-rlvrmath-interp005-sr-20260825-014606` en un bucket de S3. La cadena `rlvrmath` del identificador sugiere RL con recompensas verificables aplicado a matemáticas, aunque la model card no lo detalla formalmente. Sí se explicita que el estado del router pasó por una reparación del sesgo posterior a la fase SFT ("SFT router-bias repaired"), un paso necesario para que el enrutado no colapse en inferencia. No se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases adicionales de DPO o RLHF.

## Capacidades

- Generación de texto y resolución de problemas matemáticos de nivel competición, que es el dominio objetivo del experimento de RL.
- Razonamiento matemático multi-paso orientado a problemas tipo AIME, MATH-500 y OlympiadBench, según las evaluaciones reportadas por el autor.
- Enrutado MoE con pesos de router reparados en fase SFT, lo que permite inferencia estable siempre que se preserven íntegramente los ficheros de configuración y el índice de safetensors.
- Capacidad de servir como checkpoint de referencia para investigación en RL: es el artefacto exacto que respalda una fila concreta del experimento, lo que permite reproducibilidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso genérico: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking explícito, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de RL en matemáticas: el checkpoint permite verificar la fila reportada del brazo E17b1 en el paso 20, comparando los resultados de AIME24, MATH-500 y OlympiadBench con los publicados (20,33 / 73,40 / 17,33) y contrastando las advertencias de evaluación recogidas en `MATH_EVALS.md`.
- Estudio de la dinámica del enrutado MoE: dado que el artefacto se distingue precisamente por tener el sesgo de router reparado, es adecuado para analizar cómo evoluciona el enrutado durante el RL y qué diferencias aparecen frente a las exportaciones con router mutable.
- Ablación de pasos de entrenamiento por refuerzo: al ser un checkpoint intermedio, encaja en estudios que comparen el rendimiento en matemáticas en función del número de pasos de RL dentro de la misma campaña.
- Generación de datos matemáticos para destilación: el modelo puede producir soluciones candidatas que después se filtren por verificación y se usen para reentrenar modelos más pequeños, un flujo habitual en investigación con recompensas verificables.
- Evaluación de infraestructura MoE a gran escala: con 67.000 millones de parámetros totales y unos 2.000 millones activos, sirve para medir el coste real de despliegue y el comportamiento de librerías de inferencia con enrutado disperso.
- Referencia interna para pipelines de verificación matemática: las soluciones generadas pueden compararse con verificadores simbólicos o con modelos juez, dentro de un entorno de investigación controlado.
- Base para ajuste fino posterior en dominios matemáticos concretos, siempre que se aclare previamente la licencia "other" y se mantenga la coherencia del router.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card para el checkpoint reparado del brazo E17b1, paso 20. La model card no explicita la métrica exacta ni el protocolo de evaluación, que se remite a `MATH_EVALS.md` dentro del archivo de evidencias.

| Benchmark | Resultado | Observaciones |
|---|---|---|
| AIME24 (held-out) | 20,33 | Valor tal como figura en la model card; métrica y protocolo no detallados |
| MATH-500 (held-out) | 73,40 | Valor tal como figura en la model card |
| OlympiadBench (held-out) | 17,33 | Valor tal como figura en la model card |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones aritméticas a partir del número de parámetros totales (67,08 mil millones) y del tamaño del repositorio (134,2 GB), no datos publicados por el autor.

- Pesos en bf16/fp16: aproximadamente 134 GB, coherente con los 134,2 GB del repositorio. Requiere al menos 2 GPU de 80 GB (H100, A100 80 GB, H200) o 4 GPU de 40-48 GB con paralelismo tensorial.
- Pesos en FP8: aproximadamente 67 GB, lo que permite ajustar en una única GPU de 80 GB, dejando poco margen para caché KV y activaciones.
- Pesos en INT8: aproximadamente 67 GB, con la misma consideración que FP8.
- Pesos en cuantización de 4 bits: aproximadamente 34-36 GB, viable en GPU de 48 GB (RTX 6000 Ada, A6000) o en configuraciones de 2×24 GB.
- GPU consumer: no cabe en una RTX 4090 de 24 GB ni siquiera en 4 bits; sería necesario repartir entre dos tarjetas o recurrir a offload a CPU, con el consiguiente impacto en latencia.
- Opciones de despliegue: vLLM, SGLang o TGI son las vías habituales para MoE, pero la implementación `grug_moe` puede requerir el código del ecosistema Marin; llama.cpp y Ollama exigirían una conversión a GGUF que no se publica en el repositorio. La compatibilidad con runtimes estándar no está confirmada.
- Latencia y throughput estimados: no disponible.
- Nota operativa: deben conservarse juntos `config.json`, los ficheros del tokenizer y todos los shards referenciados por `model.safetensors.index.json`; una carga parcial puede producir un modelo inconsistente.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la información proporcionada. Los únicos artefactos directamente comparables son otros checkpoints de la propia campaña Snowball, y la model card advierte de que repositorios con nombres parecidos como `laion/rl-snowball-*` pueden contener exportaciones con router mutable que colapsan en inferencia, por lo que no son sustitutos válidos.

| Modelo | Parámetros | Contexto | AIME24 | MATH-500 | OlympiadBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-E17b1-Step20-Repaired | 67,08 mil millones totales / ~2 mil millones activos | no disponible | 20,33 | 73,40 | 17,33 | other | HuggingFace, repositorio de investigación |
| Otros checkpoints Snowball de la misma campaña | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Exportaciones `laion/rl-snowball-*` | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Desaconsejadas por el autor por integridad del router |
| Modelos MoE de matemáticas de otros desarrolladores | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un artefacto de investigación, no una versión de producción. La propia model card indica que su utilidad es limitada salvo que se preserve la reparación del sesgo de router o la integridad de un router congelado.
- El estado del router es el punto más delicado: exportaciones con router mutable pueden colapsar durante la inferencia. No deben sustituirse por repositorios de nombre parecido como los `laion/rl-snowball-*`.
- No se publican datos sobre sesgos, composición del dataset ni proceso de alineación, por lo que no es posible evaluar riesgos de sesgo de forma informada.
- Riesgo de alucinación: no cuantificado. Al ser un modelo ajustado con RL sobre matemáticas, es esperable un comportamiento más fiable en ese dominio que en tareas abiertas, pero no hay evidencia publicada al respecto.
- Cobertura de idiomas desconocida; no se declara ningún idioma soportado.
- Longitud de contexto desconocida, lo que impide planificar despliegues con requisitos de contexto largo.
- Los resultados de AIME24 (20,33) y OlympiadBench (17,33) son moderados y corresponden a un paso intermedio del RL, no al final de la campaña.
- La métrica y el protocolo de evaluación no se detallan en la model card; las puntuaciones deben interpretarse junto con las advertencias de `MATH_EVALS.md`.
- Licencia "other": no se especifican los términos, por lo que el uso comercial queda sin aclarar y requiere consulta previa.
- El repositorio no incluye variantes cuantizadas ni conversiones a GGUF, lo que limita su uso en entornos de consumo.
- La implementación `grug_moe` puede no ser compatible con los runtimes de inferencia más extendidos sin trabajo adicional de integración.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria independiente del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E17b1-Step20-Repaired
- Archivo de evidencias (dataset): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Issue del experimento en el repositorio Marin: https://github.com/marin-community/marin/issues/7786
- Artefacto de origen (S3): `s3://marin-us-east-02a/marin/exports/snowball-bias-repaired/rl-snowball-e17b1-rno2a-rlvrmath-interp005-sr-20260825-014606/global_step_20/policy/`
- Detalle de evaluación: `MATH_EVALS.md`, dentro del archivo de evidencias
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo; los resultados devueltos correspondían a sitios no relacionados (Open, OpenAI, Apache OpenOffice y US Open).
