# Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r08

## Resumen

`Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r08` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup como artefacto de investigación. No es un modelo de chat de propósito general: es una celda concreta de una rejilla experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño.

El proceso tiene dos fases. Primero se aplica SVD-LLM para eliminar el 40,02 % de los parámetros de proyección (el checkpoint resultante conserva el 59,98 % de la fracción densa). Después se aplica un intercambio iterativo "parameter-neutral" de 8 rondas de 10, con la regla de selección `gap_iter`, un presupuesto total del 1,000 % de los parámetros densos y fragmentos del 0,100 % por ronda. En total se restauran 5335 componentes, se expulsan 5004 y se insertan 51.770.624 parámetros.

Es relevante porque documenta de forma cuantificable el compromiso entre compresión y seguridad: la propia model card advierte que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base. El checkpoint reporta AdvBench ASR de 0,0900, StrongREJECT ASR de 0,1500 y sobre-rechazo macro (WildGuard) de 0,0973.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-2-7b-chat); sin cambios estructurales declarados |
| Parámetros totales | 6.738.415.616 (6,74 mil millones), según safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Llama 2 7B chat se entrena con 4096 tokens) |
| Tipos de cuantización | No disponible. Los pesos se distribuyen en safetensors; el repositorio ocupa 13,5 GB, consistente con precisión de 16 bits, no confirmado |
| Idiomas soportados | No disponible (Llama 2 está orientado principalmente al inglés, sin confirmación en esta ficha) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Método de compresión | SVD-LLM, 40,02 % de parámetros de proyección eliminados |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos (0,100 % por ronda) |
| Rondas iterativas aplicadas | 8 de 10 (checkpoint intermedio de una ejecución mayor) |
| Semilla | 42 |
| Componentes restaurados / expulsados | 5335 / 5004 |
| Parámetros insertados | 51.770.624 (0,80 % de los parámetros de proyección densos) |
| Valor de intercambio | `insert` (solo valor de inserción; expulsión ordenada por sigma) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only apilado, con normalización previa RMSNorm, embeddings rotatorios (RoPE) y activación SwiGLU. Este checkpoint no introduce cambios arquitectónicos ni un entrenamiento nuevo: es el resultado de una intervención sobre los pesos del modelo base. La compresión SVD-LLM factoriza matrices de proyección en componentes de bajo rango y descarta el 40,02 % de esos parámetros; posteriormente, el procedimiento de intercambio iterativo "parameter-neutral" reinserta componentes (51.770.624 parámetros, el 0,80 % de las proyecciones densas) seleccionados por la regla `gap_iter`, sin reentrenar el modelo de forma declarada.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO adicionales; el ajuste conversacional y de seguridad procede de Llama-2-7b-chat. La innovación técnica que documenta este artefacto no es un método de entrenamiento, sino la cuantificación experimental de cómo una regla de selección de componentes (frente a otras reglas del grid) recupera comportamiento de seguridad tras una compresión agresiva. La model card indica que las métricas se midieron con jueces HarmBench y WildGuard, y que el checkpoint es una ronda intermedia de una ejecución más larga con presupuesto total del 1,0 %.

Un detalle relevante para su carga: el recuento de parámetros en safetensors coincide con el del modelo base completo, mientras que la reducción del 40,02 % se expresa en términos de parámetros de proyección densos. Es decir, la reducción de rango no se traduce necesariamente en un fichero de pesos más pequeño que el del modelo original.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste de Llama-2-7b-chat, según declara la pipeline `text-generation`.
- Comportamiento de rechazo ante peticiones dañinas, medido explícitamente: AdvBench ASR de 0,0900 y StrongREJECT ASR de 0,1500 con juez HarmBench.
- Calibración de sobre-rechazo medida de forma agregada: 0,0973 macro (WildGuard).
- Capacidad de servir como sujeto experimental para estudios de compresión, interpretabilidad y seguridad: la model card lo define como artefacto de investigación.
- Compatibilidad declarada con `text-generation-inference` y con `endpoints_compatible` (etiquetas del repositorio).
- No se declaran capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- No se documentan capacidades multilingües ni un listado de idiomas.

## Casos de uso

- Reproducción de experimentos de compresión SVD-LLM: el checkpoint permite replicar el punto exacto de la rejilla (regla `gap_iter`, 8 de 10 rondas, semilla 42) y comparar la evolución de la seguridad frente a otras reglas de selección.
- Auditoría de seguridad de modelos comprimidos: con AdvBench y StrongREJECT ya medidos, se puede ejecutar el mismo protocolo con otros jueces o prompts para comprobar la robustez de los valores reportados.
- Estudio del sobre-rechazo: la métrica macro de WildGuard (0,0973) sirve como punto de partida para analizar cuánto del rechazo del modelo es excesivo y cómo varía con el presupuesto de restauración.
- Investigación sobre reglas de selección de componentes: el artefacto aísla la variable `gap_iter` frente al resto del grid, lo que permite estudiar qué componentes concretos sostienen el comportamiento de seguridad.
- Docencia y divulgación sobre compresión de LLM: es un ejemplo tangible de que una reducción del 40 % de parámetros de proyección altera propiedades de alineamiento, útil en cursos de eficiencia e interpretabilidad.
- Generación de datos para estudios comparativos: al ser un checkpoint intermedio, permite muestrear respuestas en una fase concreta del proceso y contrastarlas con rondas posteriores del mismo run.
- Red teaming académico: sirve como sujeto de prueba "degradado de forma controlada" para validar metodologías de evaluación de seguridad antes de aplicarlas a modelos desplegables.
- No se recomienda su uso como asistente desplegable ni en atención al cliente, generación de código en producción o cualquier flujo que requiera garantías de seguridad: el propio autor lo desaconseja explícitamente.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de seguridad, no de capacidad general:

| Métrica | Juez / protocolo | Valor |
|---|---|---|
| AdvBench ASR | HarmBench judge | 0,0900 |
| StrongREJECT ASR | HarmBench judge | 0,1500 |
| Macro over-refusal | WildGuard | 0,0973 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad, ni tampoco los valores del modelo base sin comprimir, por lo que no es posible calcular la degradación relativa con los datos aportados.

## Requisitos de hardware

- Inferencia en precisión de 16 bits: el repositorio ocupa 13,5 GB, por lo que se necesitan aproximadamente 14-16 GB de VRAM para los pesos, más la caché KV (dependiente de la longitud de contexto efectiva).
- Cabe en GPU de consumo: RTX 3090 (24 GB) y RTX 4090 (24 GB) en 16 bits; tarjetas de 16 GB o menos requerirían cuantización.
- Cuantización estimada (no confirmada por el autor): alrededor de 7 GB en 8 bits y de 4 GB en 4 bits para los pesos, lo que permitiría GPUs de 8-12 GB.
- GPU de centro de datos recomendadas: A100 (40/80 GB), H100, L40S, siempre que el consumo de contexto y el batch lo permitan.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`) y endpoints compatibles. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni rendimiento con batching.
- Advertencia de despliegue: al tratarse de un checkpoint con pesos modificados por SVD y por intercambios de componentes, conviene verificar la carga y la coherencia de salidas en el runtime elegido antes de usarlo en cualquier experimento comparativo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Métricas de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Jeesup) | 6.738.415.616 | No disponible | AdvBench ASR 0,0900; StrongREJECT ASR 0,1500; over-refusal 0,0973 | Llama 2 Community | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 | 4096 tokens (modelo base) | No disponible en esta información | Llama 2 Community | HuggingFace, ampliamente distribuido |
| Otras celdas del grid del mismo autor | No disponible | No disponible | No disponible | Llama 2 Community | No disponibles en esta búsqueda |

No se han encontrado en la búsqueda web modelos comparables adicionales (ni otros checkpoints SVD-LLM con presupuesto de reparación equivalente), por lo que la comparación cuantitativa con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card lo describe como "artefacto de investigación" y una celda de una rejilla, no como asistente desplegable.
- Varias ramas del grid están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint es una ronda intermedia (8 de 10) de un proceso de reparación.
- No se publican métricas de capacidad (razonamiento, código, matemáticas) ni comparación con el modelo base, por lo que se desconoce el coste en utilidad de la compresión.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 7B sin ajuste adicional declarado, mantiene los riesgos habituales del base.
- Idiomas: no se especifica ninguna lista; el modelo base está orientado al inglés y no hay evidencia de soporte multilingüe.
- Contexto: no se documenta la ventana efectiva tras la edición de pesos; no se debe asumir un contexto superior al del modelo base.
- Licencia: Llama 2 Community License, con sus restricciones de uso aceptable (se incluyen `LICENSE.txt` y `USE_POLICY.md`); cualquier uso comercial queda sujeto a esa licencia y a sus cláusulas, incluidas las relativas a grandes plataformas.
- Reproducibilidad: el artefacto depende de una semilla concreta (42) y de una ronda concreta del proceso; los resultados no son extrapolables sin replicar el pipeline completo.
- Mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin señal de soporte de la comunidad ni de actualizaciones posteriores.
- Metadatos: las fechas de creación y actualización indicadas en el repositorio (17 de septiembre de 2026) se reproducen tal cual figuran; no se ha verificado su exactitud.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (incluida en el repositorio): `LICENSE.txt` y `USE_POLICY.md`
- La búsqueda web realizada no devolvió ningún enlace relevante para este modelo (los resultados obtenidos correspondían a páginas de banca sin relación). No hay paper, blog, repositorio de código ni demo adicionales disponibles en la información proporcionada.
