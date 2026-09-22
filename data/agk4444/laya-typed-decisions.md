# agk4444/laya-typed-decisions

## Resumen

Laya (agk4444/laya-typed-decisions) es un modelo de 421.293.830 parámetros publicado en HuggingFace por el usuario agk4444 y desarrollado, según su model card, por Convai Innovations. Se presenta como un ajuste fino de "Laya" sobre los 1.200 casos de entrenamiento (6.000 decisiones) del benchmark independiente LocalLLaMA/typed-decisions, orientado a clasificación de texto y a la toma de decisiones estructuradas y calibradas, según reflejan las etiquetas del repositorio (laya, system-one, calibrated-decisions, rlcd, structured-decisions, typed-decisions).

El problema que aborda es la evaluación de estados de flujo de trabajo (workflow states) junto con preguntas tipadas en una única pasada hacia delante, devolviendo respuestas estructuradas. El autor reporta una precisión de 0,789 sobre el conjunto de test oficial de 400 casos (2.000 decisiones) repartidos en cuatro dominios: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad. Con esas cifras afirma superar a TypeSafe Jev 1.13.0 (0,727) y el techo de autoacuerdo del profesor (Teacher Self-Agreement, 0,735).

Es relevante en su nicho porque propone un modelo autoalojado con un coste declarado de 0,00 USD por caso y una latencia p50 de 149,6 ms, frente a los 710 ms de la alternativa vía API, en un ámbito —decisiones calibradas dentro de pipelines de agentes— donde los benchmarks específicos son escasos. Como contrapartida, el repositorio acumula cero descargas y cero "likes", y las métricas están declaradas por el autor con el campo "verified": false, por lo que no cuentan con verificación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no declara la arquitectura base ni el tipo de transformer) |
| Parámetros totales | 421.293.830 |
| Parámetros activos | no aplica (no se declara una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio distribuye pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tarea declarada | text-classification (System One Decision Benchmark) |
| Dataset de evaluación | LocalLLaMA/typed-decisions |
| Tamaño del repositorio | 0,8 GB |
| Compatibilidad declarada | endpoints_compatible (etiqueta del repositorio) |

## Arquitectura y entrenamiento

El autor no especifica la arquitectura base del modelo, el número de tokens de entrenamiento, la composición del dataset más allá del benchmark citado, ni si se emplearon técnicas de alineación como RLHF o DPO. La model card únicamente indica que se trata de un ajuste fino sobre los 1.200 casos de entrenamiento (6.000 decisiones) de LocalLLaMA/typed-decisions, y que la inferencia se realiza mediante la librería laya con una llamada del tipo `agent.predict(state, questions)`, que devuelve las respuestas en una sola pasada hacia delante. La etiqueta "rlcd" figura en el repositorio, pero no se describe en la documentación disponible qué procedimiento designa ni cómo se aplicó.

El único detalle técnico cuantificado es el resultado de la evaluación: el conjunto de test consta de 400 casos y 2.000 decisiones distribuidas en cuatro dominios (Agent Trace Observability, Customer Service, Invoice Processing y Security Incidents). La model card compara el modelo con ModernBERT-base (149M) como especialista de referencia, lo que sugiere una familia de modelos encoder de tamaño medio, pero se trata de una inferencia del contexto y no de un dato declarado por el autor. No hay información sobre decodificación especulativa, atención lineal, ventana de contexto efectiva ni estrategia de tokenización.

## Capacidades

- Clasificación de texto y emisión de decisiones tipadas ("typed decisions") a partir de un estado de flujo de trabajo y un conjunto de preguntas estructuradas.
- Salidas con puntuación de confianza calibrada: la model card reporta métricas de calibración (Brier score, ECE, Score MAE y "Within 1 Level").
- Cobertura de cuatro dominios declarados: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad.
- Inferencia en una sola pasada hacia delante mediante la API `laya.load(...)` y `agent.predict(state, questions)`.
- Compatibilidad declarada con endpoints gestionados (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo evalúa trazas de agentes, pero no se documenta que actúe como agente).
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.

## Casos de uso

- Evaluación automática de trazas de agentes: el modelo puede clasificar el estado de una traza y responder preguntas tipadas sobre si la ejecución es correcta, gracias a su entrenamiento específico en el dominio Agent Trace Observability.
- Enrutamiento de decisiones en pipelines de agentes: dado un estado y un conjunto de preguntas, devuelve decisiones estructuradas en una sola pasada, lo que permite insertarlo como paso de control con latencia p50 de 149,6 ms.
- Triaje de tickets de atención al cliente: clasificación de la solicitud y emisión de una decisión tipada (categoría, prioridad, acción) con una puntuación de confianza asociada, aprovechando el dominio Customer Service del benchmark.
- Validación y aprobación de facturas: verificación estructurada de documentos de facturación dentro de un flujo de cuentas por pagar, usando las respuestas tipadas y el nivel de confianza para decidir entre aprobación automática y revisión humana.
- Clasificación y priorización de incidentes de seguridad: asignación de severidad y tipo de incidente, con la métrica "Within 1 Level" (0,993) como indicador de que la decisión rara vez se aleja más de un nivel del valor esperado.
- Control de calidad en CI/CD de sistemas con LLM: uso del modelo como componente de evaluación automatizada que puntúa estados de workflow sin coste por llamada, dado que el modelo es autoalojado.
- Filtrado previo a revisión humana: la baja latencia permite ejecutar el modelo sobre cada caso de un lote y derivar únicamente los casos con confianza baja a revisión manual.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas de forma independiente). Todos corresponden al conjunto de test de 400 casos (2.000 decisiones) del benchmark LocalLLaMA/typed-decisions:

| Modelo | Tipo | Accuracy | Soft acc | Brier score | ECE | Score MAE | Within 1 level | Latencia (p50) | Coste/caso |
|---|---|---|---|---|---|---|---|---|---|
| Laya (este modelo) | fine-tuned | 0,789 | 0,513 | 0,061 | 0,232 | 0,227 | 0,993 | 149,6 ms | 0,00 USD (autoalojado) |
| TypeSafe Jev 1.13.0 | general | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | 0,952 | 710 ms | 0,0004 USD (API) |
| ModernBERT-base (149M) | especialista | 0,646 | 0,542 | 0,119 | 0,179 | 0,444 | 0,931 | 349 ms | 0,00 USD |
| Teacher Self-Agreement | techo de referencia | 0,735 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

En el model-index del repositorio, las métricas declaradas son accuracy = 0,789 y brier_score = 0,061, ambas con "verified": false. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 421.293.830 parámetros declarados: aproximadamente 1,7 GB en fp32, 0,85 GB en fp16/bf16, 0,42 GB en int8 y 0,21 GB en int4, más el consumo adicional del runtime y del lote de entrada.
- El repositorio ocupa 0,8 GB, coherente con un almacenamiento de pesos en fp16/bf16.
- Cabe holgadamente en cualquier GPU de consumo con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090), así como en GPUs de centro de datos (A100, H100, L40S) donde el modelo queda limitado por CPU y transferencia más que por memoria.
- También es viable la inferencia en CPU para lotes pequeños, dado el tamaño del modelo, aunque no se dispone de datos de rendimiento en CPU.
- Opciones de despliegue confirmadas: transformers y la librería laya (`pip install laya`), además de la compatibilidad declarada con endpoints mediante la etiqueta endpoints_compatible. El soporte de vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible.
- Latencia declarada: 149,6 ms de mediana (p50) por caso, en comparación con los 710 ms de TypeSafe Jev 1.13.0 y los 349 ms de ModernBERT-base. No se han publicado datos de throughput ni de latencia p99.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Accuracy | Brier score | ECE | Latencia (p50) | Licencia / disponibilidad |
|---|---|---|---|---|---|---|---|
| Laya (agk4444/laya-typed-decisions) | Ajuste fino específico | 421.293.830 | 0,789 | 0,061 | 0,232 | 149,6 ms | Apache 2.0; pesos abiertos en HuggingFace, 0 descargas |
| TypeSafe Jev 1.13.0 | Propósito general | no disponible | 0,727 | 0,148 | 0,144 | 710 ms | no disponible; acceso vía API a 0,0004 USD/caso |
| ModernBERT-base | Especialista | 149.000.000 (según la model card) | 0,646 | 0,119 | 0,179 | 349 ms | no disponible en la información proporcionada |
| Teacher Self-Agreement | Techo de referencia del benchmark | no aplica | 0,735 | no disponible | no disponible | no disponible | no aplica |

La comparativa se limita a los cuatro sistemas incluidos en la model card. No se dispone de datos sobre longitud de contexto, idiomas ni licencia de los modelos alternativos, por lo que la comparación en esos ejes no es posible.

## Limitaciones y advertencias

- Métricas no verificadas: el model-index marca explícitamente accuracy y brier_score como "verified": false. Todos los resultados proceden del propio autor.
- Sin validación externa: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay evidencia de uso independiente ni de replicación de resultados.
- Calibración discutible: aunque el Brier score es el mejor de la tabla (0,061), el ECE es el peor (0,232 frente a 0,144 de TypeSafe Jev 1.13.0 y 0,179 de ModernBERT-base). Es decir, la precisión es alta pero la calibración por intervalos de confianza es peor que la de sus alternativas, algo crítico si se usa el nivel de confianza para decidir derivaciones a revisión humana.
- Benchmark auto-referencial: el techo de referencia es el autoacuerdo del propio profesor (Teacher Self-Agreement, 0,735), de modo que superar ese valor no equivale a superar un estándar externo de corrección. Existe riesgo de sobreajuste al benchmark si el conjunto de entrenamiento y el de evaluación comparten distribución y anotador.
- Dominio estrecho: los cuatro dominios evaluados (trazas de agentes, atención al cliente, facturas, incidentes de seguridad) son específicos; no hay evidencia de generalización a otras tareas de clasificación o de generación de texto libre.
- Arquitectura y base no declaradas: el autor no indica el modelo base ni el procedimiento de ajuste, lo que dificulta auditar el origen de los datos, el posible sesgo heredado y el cumplimiento de licencias de terceros.
- Idiomas y contexto: no se declara ningún dato sobre idiomas soportados ni longitud de contexto, por lo que no se puede asumir cobertura multilingüe ni entrada de documentos largos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar avisos de copyright y licencia y de indicar los cambios realizados. No se documentan cláusulas adicionales.
- Riesgo de alucinación: no disponible, ya que no se describe el comportamiento del modelo en tareas generativas ni en entradas fuera de distribución.
- Procedencia de los datos del benchmark: la model card no detalla cómo se anotaron los 400 casos de test ni si hubo solapamiento con los 1.200 casos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agk4444/laya-typed-decisions
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Organización del desarrollador (Convai Innovations): https://huggingface.co/convaiinnovations
- Librería laya: no disponible URL en la información proporcionada (la model card solo indica `pip install laya`)
- Paper, blog o repositorio adicionales: no disponibles
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (se trata de páginas de agregación de películas en dominio bombuj.si) y no aportan información técnica utilizable.
