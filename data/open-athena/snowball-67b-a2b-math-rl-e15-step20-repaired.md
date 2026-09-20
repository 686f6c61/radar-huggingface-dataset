# open-athena/Snowball-67B-A2B-Math-RL-E15-Step20-Repaired

## Resumen

Snowball-67B-A2B-Math-RL-E15-Step20-Repaired es un checkpoint de investigación publicado por la organización open-athena dentro de la campaña "Snowball", orientada al entrenamiento con aprendizaje por refuerzo (RL) de modelos de razonamiento matemático sobre la infraestructura Marin. Se trata de un artefacto de investigación, no de un modelo listo para producción: la propia model card lo describe explícitamente como "research checkpoint" y advierte de que su utilidad queda limitada si no se preserva la reparación del sesgo del router o la integridad del router congelado.

El modelo tiene 67.078.876.160 parámetros totales (unos 67B) y el repositorio ocupa 134,2 GB en safetensors, lo que es coherente con pesos en bf16/fp16. La nomenclatura "A2B" y la etiqueta `grug_moe` apuntan a una arquitectura de mezcla de expertos (MoE) con un número reducido de parámetros activos por token, aunque la model card no confirma la cifra exacta ni la longitud de contexto.

Su relevancia es doble. Por un lado, documenta un punto concreto de una curva de RL sobre matemáticas (brazo E15, paso 20) con métricas held-out publicadas en AIME24, MATH-500 y OlympiadBench. Por otro, es un caso de estudio sobre un problema técnico poco habitual: exportaciones de checkpoints MoE cuyo router mutable colapsa en inferencia, y el procedimiento de reparación del sesgo del router aplicado aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (la etiqueta del repositorio es `grug_moe`; no se detalla en la model card) |
| Parametros totales | 67.078.876.160 |
| Parametros activos | No confirmado. La nomenclatura "A2B" sugiere del orden de 2B parámetros activos por token, pero la model card no lo especifica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | other (términos no concretados en la información disponible) |
| Formato de pesos | safetensors (pesos fragmentados en shards descritos por `model.safetensors.index.json`, junto con `config.json` y ficheros de tokenizer) |

## Arquitectura y entrenamiento

La información disponible identifica la arquitectura mediante las etiquetas `grug_moe` y `marin`. `grug_moe` corresponde a una implementación de mezcla de expertos dentro del ecosistema Marin, el marco de entrenamiento abierto en el que se enmarca esta campaña. No se publican en la información proporcionada el número de expertos, la estrategia de enrutamiento, la dimensión oculta, el número de capas ni la composición del dataset de entrenamiento.

El régimen de entrenamiento sí está parcialmente documentado: se trata de un ajuste por refuerzo sobre matemáticas (la etiqueta del pipeline es `reinforcement-learning`), presumiblemente con verificación de recompensa sobre problemas con respuesta comprobable, dado el nombre del checkpoint de origen (`rlvrmath`). El artefacto concreto es el brazo experimental E15 en el paso 20 de esa fase de RL. La innovación técnica destacable no está en el entrenamiento sino en la integridad del checkpoint: la model card indica que el estado del router es "SFT router-bias repaired; VERIFY OK", y advierte de que repositorios con nombres similares de la familia `laion/rl-snowball-*` pueden contener exportaciones con router mutable sin reparar que colapsan en inferencia. No se documentan en la información disponible técnicas como decodificación especulativa, atención lineal o variantes híbridas.

## Capacidades

- Generación de texto y razonamiento matemático: es el dominio explícito de entrenamiento, con evaluación en AIME24, MATH-500 y OlympiadBench.
- Resolución de problemas de competición: el rango de puntuaciones sugiere competencia en problemas tipo MATH-500 y capacidad limitada pero no nula en problemas de olimpiada (AIME24, OlympiadBench).
- Razonamiento multi-paso con verificación de respuesta: el régimen de RL con recompensa verificable implica cadenas de razonamiento orientadas a obtener una respuesta final comprobable.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card.
- Capacidades multimodales (visión, audio): no disponibles; el repositorio solo contiene pesos de lenguaje.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Evaluación comparativa de razonamiento matemático: sirve como punto de referencia de un paso concreto de RL (E15, paso 20) frente a otros pasos y brazos de la misma campaña, útil para estudiar cómo evolucionan AIME24, MATH-500 y OlympiadBench a lo largo del entrenamiento.
- Generación de datos sintéticos de matemáticas: el modelo puede producir soluciones con cadena de razonamiento para problemas con respuesta verificable, que después se filtran automáticamente contra la respuesta de referencia antes de reutilizarse en entrenamiento.
- Investigación en RL con recompensa verificable (RLVR): al ser un checkpoint intermedio con métricas publicadas, permite analizar la dinámica de recompensa, la longitud de las cadenas y los modos de fallo típicos (respuestas truncadas, coincidencias espurias).
- Estudio de dinámica de routers en MoE: es un caso directamente documentado de checkpoint cuyo router requirió reparación del sesgo; resulta adecuado para experimentos sobre colapso de enrutamiento, entropía de routing y estabilidad de expertos tras RL.
- Reproducción de resultados experimentales: el repositorio incluye la ruta del artefacto de origen y un archivo de evidencias externo con las condiciones de evaluación, lo que permite reproducir la fila reportada si se conservan `config.json`, tokenizer y todos los shards.
- Punto de partida para ajuste fino posterior: puede emplearse como inicialización para SFT o RL adicional en dominios matemáticos o científicos, siempre que se mantenga la integridad del router reparado.
- Auditoría de artefactos de investigación: útil como contraejemplo documentado frente a exportaciones con router mutable sin reparar, para validar pipelines de exportación de MoE antes de publicar checkpoints.

## Benchmarks y rendimiento

Resultados held-out reportados en la model card:

| Benchmark | Resultado |
|---|---|
| AIME24 | 24.00 |
| MATH-500 | 74.20 |
| OlympiadBench | 21.67 |

La model card remite a `MATH_EVALS.md` dentro del archivo de evidencias para conocer las condiciones de evaluación y las salvedades asociadas. En la información proporcionada no se incluyen resultados de MMLU, HumanEval, GSM8K ni comparaciones con modelos de referencia, por lo que no se presentan aquí.

## Requisitos de hardware

- Los pesos ocupan 134,2 GB en el repositorio, coherente con 67B parámetros en bf16/fp16. Inferencia en precisión completa requiere del orden de 134 GB solo para pesos, más caché KV y activaciones.
- En cuantización de 8 bits, la estimación de pesos baja a unos 67 GB; en 4 bits, a unos 34-36 GB. Son estimaciones aritméticas a partir del número de parámetros, no cifras publicadas por el autor.
- Con 4 bits, el modelo podría caber en una GPU de 48 GB (por ejemplo, una sola A6000 o L40S) o en configuraciones consumer de 24 GB solo con cuantizaciones más agresivas y reparto en memoria/CPU, a costa de latencia.
- Para bf16 se requieren nodos multi-GPU: 2x H100 80 GB o 2x A100 80 GB como mínimo para pesos, con holgura escasa; 4x A100/H100 80 GB es una configuración más realista.
- Al ser una MoE con pocos parámetros activos por token (según la nomenclatura del nombre), el throughput puede ser más alto de lo habitual para un modelo de 67B densos, pero no se publican cifras de latencia ni tokens por segundo.
- Opciones de despliegue: al distribuirse únicamente en safetensors con arquitectura MoE personalizada, es necesario verificar el soporte de `grug_moe` en el motor elegido antes de asumir compatibilidad con vLLM, TGI o SGLang. No se publican versiones GGUF, por lo que llama.cpp y Ollama requerirían una conversión previa y soporte explícito de la arquitectura.
- La longitud de contexto no está documentada, de modo que el consumo de caché KV no puede estimarse con fiabilidad.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos alternativos en la información disponible, por lo que no es posible establecer una comparativa numérica fiable.

A título orientativo y sin datos verificados en esta ficha, la categoría comparable sería la de modelos abiertos de razonamiento matemático con arquitectura MoE y decenas de miles de millones de parámetros totales. No obstante, cualquier comparación de parámetros, contexto, rendimiento, licencia o disponibilidad con este checkpoint queda marcada como "no disponible" hasta disponer de esas cifras.

## Limitaciones y advertencias

- Es un artefacto de investigación, no una versión de producción. La propia model card lo declara explícitamente.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria independiente más allá de las evidencias publicadas por los autores.
- Riesgo específico de integridad del router: la model card advierte de que repositorios con nombres similares (`laion/rl-snowball-*`) pueden contener exportaciones con router mutable que colapsan en inferencia. No deben sustituirse por este artefacto.
- La reparación del sesgo del router es una condición necesaria de funcionamiento; degradar o modificar ese estado invalida el comportamiento observado.
- Es obligatorio conservar conjuntamente `config.json`, los ficheros del tokenizer y todos los shards listados en `model.safetensors.index.json`. Separarlos puede producir un modelo no funcional.
- Riesgo de alucinación en razonamiento matemático: con un 74,20 en MATH-500 pero un 24,00 en AIME24 y un 21,67 en OlympiadBench, la tasa de fallo en problemas de alta dificultad es elevada y las cadenas pueden contener pasos plausibles pero incorrectos.
- No se declaran idiomas soportados ni comportamiento multilingüe; se desconoce el rendimiento fuera del inglés y de dominios matemáticos.
- No se publican datos sobre sesgos sociales, comportamiento en dominios abiertos ni robustez frente a prompts adversarios.
- Licencia "other" sin términos concretados en la información disponible: antes de cualquier uso comercial es imprescindible revisar el texto completo de la licencia en el repositorio.
- Los prompts de evaluación y las condiciones exactas de medida están en el archivo de evidencias; comparar estas cifras con resultados obtenidos con otros pipelines de evaluación puede no ser válido.
- Las fechas de creación y actualización del repositorio son 2026-09-20 y 2026-09-20 respectivamente, según los metadatos disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E15-Step20-Repaired
- Archivo de evidencias (dataset): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Issue del experimento en el repositorio Marin: https://github.com/marin-community/marin/issues/7786
