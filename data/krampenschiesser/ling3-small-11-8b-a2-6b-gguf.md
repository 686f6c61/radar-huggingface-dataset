# krampenschiesser/ling3-small-11.8B-A2.6B-GGUF

## Resumen

ling3-small-11.8B-A2.6B es un modelo de lenguaje de arquitectura de mezcla de expertos (MoE) publicado por el usuario krampenschiesser, distribuido en formato GGUF y con licencia MIT. Concretamente, se trata del artefacto base (`krampenschiesser/ling3-small-base`) preparado para las fases de ajuste fino y aprendizaje por refuerzo, no de un modelo listo para uso general. El propio autor advierte que, en su estado actual, es "más lento y más grande que el modelo original", por lo que no está pensado para consumo directo.

El modelo parte de ling 3 tiny pero duplica los expertos activos por token y multiplica por 1,5 el número total de expertos. Los 64 expertos adicionales son artificiales: se generaron recortando el modelo a 64 expertos mediante REAM y volviéndolos a añadir, con las puntuaciones del router promediadas en lugar de usar el centroide. El resultado es un router que todavía no está ajustado a la nueva configuración, de modo que los expertos extra únicamente incrementan el coste de cómputo sin aportar valor por ahora.

La motivación declarada es disponer de un modelo especializado en código, rápido, que quepa en una única GPU de 16 GB en cuantización de 8 bits. El foco lingüístico y de dominio es deliberadamente estrecho: Rust, Go, C++11+, TypeScript y lenguajes de scripting y marcado, evitando explícitamente los corpus centrados en Python. El modelo cuenta con 11.368.538.976 parámetros totales y aproximadamente 2,6 B activos por token, y se apoya en capas de atención lineal para mantener estable el throughput en generaciones largas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer con capas de atención lineal; etiquetada como `bailingmoe3` en los benchmarks de llama.cpp del autor |
| Parámetros totales | 11.368.538.976 (~11,37 B según safetensors; el autor la denomina 11.85B en sus tablas) |
| Parámetros activos | ~2,6 B (denominación A2.6B) |
| Longitud de contexto | no disponible (el autor planea extenderla a 256k en fases futuras) |
| Tipos de cuantización | GGUF; `q8_0` documentado explícitamente. No se detallan otras variantes presentes en el repo de 34,9 GB |
| Idiomas soportados | inglés (el autor indica que no se planean otros idiomas, ya que los datasets están en inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye por separado como `krampenschiesser/ling3-small-base` |

## Arquitectura y entrenamiento

Se trata de un modelo MoE derivado de ling 3 tiny. Respecto al original, los expertos activos por token se han duplicado y el número total de expertos es 1,5 veces mayor. Los 64 expertos añadidos son dummy: se obtuvieron aplicando REAM para recortar el modelo a 64 expertos y reinsertándolos después en el modelo original. Las puntuaciones del router se promediaron (no se utilizó el centroide), lo que produce un enrutado base pseudorro. El router no se ha reajustado a la nueva configuración de expertos activos, de manera que el modelo solo consume más tokens sin aprovechar la capacidad añadida. La inspiración declarada para ampliar los parámetros activos es el paper de JetBrains Mellum (arXiv:2605.31268).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO en esta versión. La model card describe este checkpoint como base para fases posteriores: extensión de contexto hasta 256k, ajuste fino supervisado, DPO offline y GRPO. El plan de datos excluye explícitamente los corpus centrados en Python y se orienta a Rust, Go, C++11+, TypeScript, Bash, SQL y formatos de marcado (YAML, JSON, etc.). Como conjunto de evaluación objetivo se citan TerminalBench 2.1, DeepSwe, SWE-bench multilingual, IfEval, IfBench, Ruler2, LongMemEval, agentif y LiveCodeBench V6, usando opencode como agente.

## Capacidades

- Generación de texto y código: el modelo es un checkpoint base, sin ajuste de instrucciones, por lo que su comportamiento conversacional está sin validar.
- Especialización prevista en Rust, Go, C++11+, TypeScript, Bash, SQL, YAML, JSON y otros lenguajes de marcado.
- Razonamiento agéntico y multi-paso: es un objetivo del plan de entrenamiento (evaluación con opencode), no una capacidad consolidada en este checkpoint.
- Soporte de tool calling / function calling: no disponible en esta versión; la etiqueta `conversational` del repositorio no implica capacitación para invocación de herramientas.
- Capacidades multilingües: limitadas al inglés; el autor descarta otros idiomas.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.
- Eficiencia en generación larga: las capas de atención lineal mantienen el throughput de decodificación estable por encima de los 10.000 tokens generados.

## Casos de uso

- Punto de partida para ajuste fino supervisado en asistentes de código no centrados en Python: el modelo sirve como base sobre la que aplicar SFT con corpus de Rust, Go, C++ y TypeScript, aprovechando su especialización prevista y su tamaño manejable.
- Investigación sobre enrutado en MoE: los 64 expertos dummy con router promediado permiten estudiar cómo evoluciona el enrutado cuando se añaden expertos artificialmente y se reentrena el router.
- Entrenamiento por refuerzo sobre modelos pequeños de código: el modelo está declarado como base para DPO offline y GRPO, por lo que resulta adecuado como sujeto de experimentos de alineación en un dominio estrecho.
- Autocompletado de código en local: con la cuantización `q8_0` (11,29 GiB), cabe en una GPU de 16 GB y ofrece 163 t/s de decodificación en una RTX 5060 Ti, suficiente para escenarios interactivos de un solo usuario.
- Evaluación de atención lineal en contexto largo: la estabilidad del throughput (en torno a 155 t/s sostenidos a lo largo de más de 10.000 tokens) lo hace útil para medir el impacto de arquitecturas con atención lineal en cargas de generación prolongada.
- Benchmarking de arquitecturas MoE con presupuesto de VRAM fijo: permite comparar el rendimiento del modelo extendido (11,85B/A2,6B) frente al original (7,89B/A1,3B) manteniendo la misma GPU y backend.
- Núcleo de un agente de terminal una vez entrenado: el plan de trabajo con opencode y las evaluaciones TerminalBench 2.1, DeepSwe y SWE-bench multilingual apuntan a tareas de resolución de incidencias en repositorios, pero esta capacidad no está disponible en el checkpoint actual.
- Experimentación docente o de prototipado en entornos con una única GPU consumer, siempre que se asuma que el modelo no está listo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta mediciones de velocidad obtenidas con llama.cpp (`llama-bench`, backend CUDA, `ngl 999`, flash attention activada) sobre una RTX 5060 Ti:

| Modelo | Tamaño | Parámetros | q | pp512 (t/s) | tg128 (t/s) |
|---|---|---|---|---|---|
| ling3 11.85B.A2.6B Q8_0 | 11,29 GiB | 11,37 B | q8_0 | 5400,18 ± 300,11 | 163,04 ± 0,68 |
| ling3 7.9B.A1.3B Q8_0 (original) | 7,82 GiB | 7,89 B | q8_0 | 7584,71 ± 522,05 | 201,12 ± 1,10 |

Durante inferencia prolongada, el throughput de decodificación se mantiene prácticamente constante (de 156,26 t/s a 154,47 t/s entre los 470 y los 10.673 tokens generados), comportamiento que el autor atribuye a las capas de atención lineal.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,29 GiB con cuantización `q8_0` (11,29 GiB de tamaño de fichero), lo que permite ejecución en GPUs de 16 GB.
- GPU validadas: NVIDIA RTX 5060 Ti de 16 GB, con backend CUDA y todas las capas descargadas en GPU (`ngl 999`) y flash attention activada.
- GPU recomendadas: cualquier GPU consumer con 16 GB o más de VRAM para `q8_0`; no se han publicado mediciones para A100, H100, RTX 4090 ni otras GPUs.
- Opciones de despliegue: llama.cpp (backend empleado en las mediciones del autor). No se confirma compatibilidad con vLLM, TGI, Ollama u otros servidores de inferencia.
- Latencia y throughput: 5400,18 t/s de prefill (pp512) y 163,04 t/s de decodificación (tg128) en RTX 5060 Ti con `q8_0`; el throughput de decodificación se mantiene en torno a 155 t/s en generaciones de más de 10.000 tokens.
- El modelo original (7,89B/A1,3B, `q8_0`) ocupa 7,82 GiB y alcanza 7584,71 t/s de prefill y 201,12 t/s de decodificación en el mismo hardware, por lo que esta versión es aproximadamente un 19 % más lenta en decodificación y ocupa 3,47 GiB más.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Tamaño q8_0 | Contexto | Prefill pp512 (t/s) | Decodificación tg128 (t/s) | Licencia |
|---|---|---|---|---|---|---|---|
| ling3-small 11.8B-A2.6B (este) | 11,37 B | ~2,6 B | 11,29 GiB | no disponible (objetivo 256k) | 5400,18 | 163,04 | MIT |
| ling3 tiny 7.9B-A1.3B (original) | 7,89 B | ~1,3 B | 7,82 GiB | no disponible | 7584,71 | 201,12 | no disponible en la información proporcionada |

No se dispone de datos de benchmarks de calidad ni de especificaciones de contexto que permitan comparar este modelo con alternativas de otros autores de la misma categoría. Cualquier comparación adicional con modelos como Qwen, DeepSeek-Coder o CodeLlama requeriría datos que no aparecen en la información disponible.

## Limitaciones y advertencias

- Modelo base, no ajustado para instrucciones: el autor indica explícitamente que no está pensado para uso general y que es más lento y grande que el modelo original.
- 64 expertos dummy con router sin ajustar: los expertos añadidos no aportan capacidad efectiva en este checkpoint; solo incrementan el consumo de cómputo. Las puntuaciones del router se promediaron, lo que produce un enrutado pseudorro.
- Idioma: únicamente inglés. No se planean otros idiomas, por lo que no se debe esperar un rendimiento fiable en castellano u otras lenguas.
- Dominio restringido: no se ha entrenado para matemáticas, ciencia, física ni conocimiento general. El foco es código, y se excluyen deliberadamente los corpus centrados en Python.
- Alucinación: al ser un modelo base sin alineación, la propensión a generar contenido incorrecto o incoherente es alta; no se ha publicado ningún tipo de evaluación de fidelidad.
- Capacidad conversacional sin validar: pese a la etiqueta `conversational` del repositorio, no hay evidencia de ajuste conversacional ni de soporte de tool calling.
- Ausencia de validación externa: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y no cuenta con resultados de benchmarks de calidad publicados.
- Licencia: MIT, lo que permite uso comercial y modificación, pero el propio autor desaconseja el uso general en el estado actual del modelo.
- Contexto no declarado: no hay confirmación de la longitud de contexto soportada en esta versión; la extensión a 256k es un plan futuro, no una característica presente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/krampenschiesser/ling3-small-11.8B-A2.6B-GGUF
- Modelo base: https://huggingface.co/krampenschiesser/ling3-small-base
- Paper de referencia citado (JetBrains Mellum): https://arxiv.org/abs/2605.31268
