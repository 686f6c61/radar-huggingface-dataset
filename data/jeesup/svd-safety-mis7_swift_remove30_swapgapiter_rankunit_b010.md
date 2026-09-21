# Jeesup/svd-safety-mis7_swift_remove30_swapgapiter_rankunit_b010

## Resumen

`svd-safety-mis7_swift_remove30_swapgapiter_rankunit_b010` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se construye a partir de `mistralai/Mistral-7B-Instruct-v0.2`, al que se le aplica una compresión con SVD-LLM que elimina el 29,97% de los parámetros densos (fracción resultante de 0,7003, es decir, el 70,03% de los parámetros originales). Sobre ese modelo comprimido se aplican 10 de 10 rondas de una edición iterativa de "swap" neutro en parámetros, seleccionada mediante la regla `gap_iter`, con un presupuesto total del 1,0% de los parámetros densos (0,1% por ronda).

El problema que aborda es concreto: la compresión SVD degrada el comportamiento de seguridad de los modelos, y este artefacto forma parte de un estudio que cuantifica ese daño y prueba distintas reglas de selección de componentes para repararlo. No es un modelo conversacional de propósito general: es una celda de una malla experimental sobre reglas de selección y presupuestos, y el propio autor advierte que varias ramas de esa malla están deliberadamente degradadas en seguridad.

El modelo tiene 7.241.732.096 parámetros (7,24 B), ocupa 14,5 GB en el repositorio, se distribuye en formato safetensors para `transformers` y se publica bajo licencia Apache 2.0. Su relevancia es académica: sirve para medir el compromiso entre seguridad y utilidad bajo compresión y para replicar o comparar metodologías de reparación de daño en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de `mistralai/Mistral-7B-Instruct-v0.2`; no se detalla en la model card |
| Parametros totales | 7.241.732.096 (7,24 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Mistral-7B-Instruct-v0.2 soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | `mistralai/Mistral-7B-Instruct-v0.2` (finetune) |
| Compresion aplicada | SVD-LLM, 29,97% de parametros eliminados |
| Fraccion de parametros resultante | 0,7003 |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos (0,100% por ronda) |
| Componentes restaurados / sustituidos | 4828 / 4828 |
| Parametros insertados | 69.745.664 (1,00% de los parametros de proyeccion densos) |
| Rondas iterativas | 10 de 10 |
| Semilla | 42 |
| Tamano del repositorio | 14,5 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del checkpoint: solo indica que deriva de `mistralai/Mistral-7B-Instruct-v0.2` y que ha sido comprimido con SVD-LLM, una técnica de compresión por descomposición en valores singulares que recorta componentes de las matrices de proyección. Tras la compresión se elimina el 29,97% de los parámetros densos. El resultado se somete después a un procedimiento de edición en 10 rondas iterativas: en cada ronda se seleccionan componentes según la regla `gap_iter` y se sustituyen mediante un swap "neutro en parámetros" con valor de inserción `insert` y desalojo ordenado por sigma (`sigma-ordered eviction`), en trozos del 0,1% de los parámetros densos por ronda. En total se restauran y se sustituyen 4828 componentes, con 69.745.664 parámetros insertados (1,00% de los parámetros de proyección densos) y una semilla fija de 42.

No se documenta en la información disponible ningún proceso de entrenamiento adicional (no hay datos sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni SFT específico para este checkpoint). Tampoco se detallan innovaciones de decodificación ni mecanismos de atención modificados. La innovación metodológica que sí se explicita es el propio pipeline de compresión más reparación iterativa por selección de componentes, cuyo objetivo es medir si una regla de selección concreta (`gap_iter`) recupera el comportamiento de seguridad perdido por la compresión SVD.

## Capacidades

- Generación de texto conversacional: al derivar de Mistral-7B-Instruct-v0.2, conserva el formato de instrucciones y la generación de respuestas multi-turno, si bien el autor indica explícitamente que no debe tratarse como un asistente desplegable.
- Razonamiento y conocimiento general: no se publican evaluaciones de capacidades generales (MMLU, GSM8K, HumanEval) en la información disponible.
- Comportamiento de rechazo y seguridad: la model card reporta métricas específicas de ataque exitoso (ASR en AdvBench y StrongREJECT) y de sobrerrechazo (Macro over-refusal con WildGuard), que son las capacidades bajo estudio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; no es un objetivo declarado del artefacto.
- Capacidades multilingües: no disponibles; el campo de idiomas no está cumplimentado en la ficha de HuggingFace.
- Capacidad especial: modo "thinking", visión o audio: no disponible; no se declara ninguna.
- Uso como sujeto experimental: permite reproducir y auditar el efecto de la compresión SVD sobre la seguridad, y comparar la regla `gap_iter` frente a otras reglas de la misma malla.

## Casos de uso

- Investigación sobre compresión y seguridad: el checkpoint es una celda de una malla experimental, por lo que se usa para cuantificar cuánto degrada la compresión SVD el comportamiento de rechazo y cuánto recupera el swap iterativo con la regla `gap_iter` (ASR de 0,1615 en AdvBench y 0,2364 en StrongREJECT).
- Auditoría de reglas de selección de componentes: comparar `gap_iter` frente a otras reglas del mismo estudio usando las métricas publicadas y la configuración exacta (presupuesto del 1,0%, 4828 componentes, semilla 42) como referencia reproducible.
- Evaluación de jueces de seguridad: al estar medido con el juez de HarmBench, sirve como entrada controlada para validar pipelines de evaluación de ASR y de sobrerrechazo.
- Estudios de interpretabilidad: con los componentes sustituidos identificados y contabilizados (4828 restaurados frente a 4828 desalojados), permite analizar qué partes de la red sostienen el comportamiento de rechazo.
- Análisis de la compensación seguridad-utilidad: la perplejidad de 8,4408 en WikiText-2 junto con el sobrerrechazo macro de 0,0820 permite estudiar si la reparación de seguridad penaliza la fluidez del modelo.
- Docencia y formación en compresión de modelos: sirve como ejemplo reproducible de un pipeline SVD-LLM seguido de edición iterativa, con todos los hiperparámetros documentados, para prácticas de posgrado o cursos de eficiencia de modelos.
- Generación de líneas base en trabajos de defensa: cualquier método nuevo de reparación de daño por compresión puede compararse contra esta celda en igualdad de condiciones (mismo modelo base, misma semilla, mismo presupuesto).
- Reproducción de resultados: permite verificar de forma independiente las métricas declaradas antes de citarlas en publicaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | Metrica | Resultado |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,1615 |
| StrongREJECT | ASR (juez HarmBench) | 0,2364 |
| WildGuard | Macro over-refusal | 0,0820 |
| WikiText-2 | Perplejidad | 8,4408 |

La información disponible no incluye resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidades generales, ni cifras equivalentes para el modelo base sin comprimir o para otras celdas de la malla, por lo que no es posible establecer comparaciones cuantitativas dentro de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (el repositorio pesa 14,5 GB): en torno a 14-15 GB solo para los pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB; en 4 bits, aproximadamente 4-5 GB (estimaciones teóricas a partir del número de parámetros, no verificadas con este checkpoint).
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) y L40S para despliegue sin cuantizar; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para los pesos en FP16 con margen para contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16, y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (el repositorio está etiquetado con `text-generation-inference` y `endpoints_compatible`) y vLLM por compatibilidad de arquitectura con Mistral. No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían una conversión manual no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de latencia, tokens por segundo ni requisitos de memoria medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `Jeesup/svd-safety-mis7_swift_remove30_swapgapiter_rankunit_b010` | 7,24 B (70,03% de los densos tras SVD) | no disponible | Apache 2.0 | Artefacto de investigacion, 0 descargas |
| `mistralai/Mistral-7B-Instruct-v0.2` (modelo base sin comprimir) | 7,24 B | 32.768 tokens segun el modelo base | Apache 2.0 | Modelo de proposito general ampliamente desplegado |
| Otras celdas de la malla de reglas de seleccion y presupuestos del mismo autor | no disponible | no disponible | Apache 2.0 | No se enumeran en la informacion disponible |
| Otros checkpoints comprimidos con SVD-LLM de la familia Mistral-7B | no disponible | no disponible | no disponible | No se dispone de datos comparables |

No se dispone de cifras de rendimiento del modelo base ni de alternativas comprimidas equivalentes dentro de la información proporcionada, por lo que la comparación se limita a parámetros, licencia y estado de publicación.

## Limitaciones y advertencias

- No es un asistente desplegable: el autor indica de forma explícita que cada celda de la malla debe tratarse como un sujeto experimental, no como un modelo de chat de propósito general.
- Seguridad degradada por diseño en varias ramas del estudio: la compresión por sí sola eleva la tasa de éxito de ataque, y el objetivo del trabajo es cuantificar ese efecto y probar su recuperación.
- Tasa de ataque exitoso no despreciable en este checkpoint: ASR de 0,1615 en AdvBench y de 0,2364 en StrongREJECT con el juez de HarmBench, lo que lo hace inadecuado para exposición directa a usuarios finales.
- Riesgo de sobrerrechazo: el macro over-refusal medido con WildGuard es de 0,0820, de modo que el modelo puede rechazar peticiones legítimas.
- Riesgo de alucinación: no se documenta ninguna mitigación específica, y la compresión puede alterar el comportamiento de generación; la perplejidad de 8,4408 en WikiText-2 es el único indicador de calidad lingüística publicado.
- Idiomas soportados: no declarados, por lo que no puede garantizarse un comportamiento multilingüe correcto.
- Ausencia de evaluaciones de capacidades generales: no hay datos de MMLU, GSM8K, HumanEval ni de tool calling, así que no se puede afirmar su utilidad para tareas de código, matemáticas o agentes.
- Restricciones de licencia: el checkpoint se distribuye bajo Apache 2.0, pero el repositorio del modelo base no incluye un fichero de licencia que permita su redistribución, según advierte el propio autor.
- Adopción nula y escasa validación externa: los metadatos indican 0 descargas y 0 likes, con fecha de creación y última actualización el 21 de septiembre de 2026; no hay evidencia de uso independiente.
- Ausencia de datos de hardware medidos: no se publican requisitos de VRAM, latencia ni throughput reales.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente temas de empleo en Zhihu, sin relación), por lo que no existe documentación externa adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_remove30_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Resultados de la búsqueda web: sin resultados relevantes; los enlaces devueltos corresponden a temas genéricos de empleo en Zhihu (https://www.zhihu.com/topic/19632552/hot, https://www.zhihu.com/question/653217332, https://www.zhihu.com/topic/19551771/newest, https://www.zhihu.com/question/334053330, https://www.zhihu.com/question/6169664190) y no guardan relación con el modelo.
- Paper, repositorio de código, blog o demo del método: no disponibles en la información proporcionada.
