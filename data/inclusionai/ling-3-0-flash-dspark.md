# inclusionAI/Ling-3.0-flash-dspark

## Resumen

Ling-3.0-flash-dspark es un modelo borrador (draft model) de decodificación especulativa diseñado por inclusionAI para acelerar la inferencia de su modelo objetivo Ling-3.0-flash. No es un modelo generativo autónomo: se trata de un "speculator" que propone tokens candidatos que el modelo grande verifica en paralelo, reduciendo el número de pasos de decodificación secuencial necesarios. Implementa la técnica DSpark, una extensión de DFlash que incorpora características auxiliares del modelo objetivo y una cabeza de confianza que decide dinámicamente cuántos tokens borrador emitir en cada paso.

El modelo tiene 1.363.707.905 parámetros (1,36B) en BF16, con una arquitectura transformer compacta de solo 5 capas de atención completa, tamaño oculto de 2.560 y atención MHA con 32 cabezas de consulta y 32 de clave/valor. Consume características auxiliares de las capas 1, 11, 23, 29 y 35 del modelo objetivo y utiliza una cabeza de confianza Markov de rango 256. El bloque DSpark es de 8 tokens borrador con ancho de verificación 9 (incluyendo el token bonus del objetivo).

Su relevancia radica en que permite incrementar la longitud de aceptación media por paso de verificación hasta 6,57 tokens en HumanEval o 6,40 en GSM8K, con una media macro de 5,29 sobre nueve cargas de trabajo. Esto se traduce directamente en ganancias de throughput en despliegues de producción de Ling-3.0-flash sin alterar la distribución de salida del modelo objetivo, ya que la verificación garantiza corrección exacta de los tokens aceptados. Se distribuye bajo licencia MIT y se sirve con SGLang o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (draft model para decodificacion especulativa DSpark) |
| Parametros totales | 1.363.707.905 (1,36B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 posiciones maximas (max_position_embeddings) |
| Tipos de cuantizacion | BF16 en pesos originales; GGUF convertible (p. ej. Q4_K_M) para llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); GGUF via convert_hf_to_gguf.py |
| Tamano del repositorio | 2,7 GB |
| Tamano oculto | 2.560 |
| Capas transformer | 5 capas de atencion completa |
| Atencion | MHA, 32 cabezas de consulta / 32 cabezas clave-valor |
| Capas auxiliares del objetivo | 1, 11, 23, 29, 35 |
| Cabeza de confianza | Markov vanilla, rango 256 |
| Tamano de bloque DSpark | 8 tokens borrador (ancho de verificacion 9) |
| Modelo objetivo | Ling-3.0-flash |

## Arquitectura y entrenamiento

El modelo es un draft model de tipo transformer denso con solo 5 capas de atención completa, tamaño oculto de 2.560 y atención multi-cabeza estándar con 32 cabezas de consulta y 32 de clave/valor. La innovación central de DSpark respecto a DFlash es la incorporación de características auxiliares extraídas de cinco capas del modelo objetivo (1, 11, 23, 29 y 35), lo que proporciona al borrador información del estado interno del modelo grande y mejora la calidad de sus propuestas. Adicionalmente, una cabeza de confianza de tipo Markov con rango 256 decide dinámicamente cuántos tokens borrador generar en cada paso, adaptando el esfuerzo de especulación al contexto.

El entrenamiento se realizó con SpecForge, el framework de entrenamiento de modelos especulativos del proyecto SGLang. El modelo opera con un tamaño de bloque DSpark de 8 tokens borrador y un ancho de verificación de 9 tokens (los 8 propuestos más el token bonus del objetivo). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, algo esperable en un modelo de este tipo, cuyo objetivo es imitar la distribución del modelo objetivo y no alinearse con preferencias humanas.

La decodificación especulativa con DSpark requiere soporte específico en el runtime: SGLang con `--speculative-algorithm DSPARK` o una build de llama.cpp con `--spec-type draft-dspark`. En SGLang es necesario dimensionar `--linear-replayssm-cache-len` según la receta del cookbook oficial.

## Capacidades

- Generación de tokens borrador para decodificación especulativa sobre Ling-3.0-flash; no es un modelo de chat autónomo.
- Propuesta de hasta 8 tokens por paso de verificación con ancho de verificación 9.
- Ajuste dinámico del número de tokens borrador mediante cabeza de confianza Markov.
- Aprovechamiento de características auxiliares del modelo objetivo (capas 1, 11, 23, 29, 35) para mejorar la tasa de aceptación.
- Soporte de contextos largos de hasta 262.144 posiciones, alineado con el modelo objetivo.
- Compatibilidad con SGLang (algoritmo DSPARK) y llama.cpp (tipo draft-dspark).
- No soporta tool calling, agentes ni razonamiento multi-paso de forma nativa: hereda las capacidades del modelo objetivo al que acompaña.
- Capacidades multilingües: no disponibles de forma explícita; dependen del modelo objetivo.

## Casos de uso

- Aceleración de inferencia en producción de Ling-3.0-flash: desplegar el draft junto al modelo objetivo en SGLang con `--speculative-algorithm DSPARK` para reducir la latencia por token en servicios de generación de texto de alta concurrencia.
- Generación de código asistida: con una longitud de aceptación de 6,57 en HumanEval y 6,34 en MBPP, el borrador es especialmente eficaz en tareas de código, donde los tokens son altamente predecibles; útil en asistentes de programación y autocompletado en IDE.
- Razonamiento matemático: aceptación de 6,40 en GSM8K y 6,29 en MATH-500 permite acelerar pipelines de resolución de problemas matemáticos y evaluaciones automáticas.
- Despliegue en hardware de consumo con llama.cpp: convertir el draft a GGUF y usarlo con `--spec-draft-model` junto a una cuantización Q4_K_M del objetivo para servir modelos en GPUs consumer con mayor throughput.
- Evaluación de modelos y benchmarks: acelerar la generación en suites de evaluación como AIME 2025 (aceptación 5,56) o LiveCodeBench (5,33) reduciendo el tiempo total de ejecución.
- Servicio de chat multi-turno: con aceptación de 3,92 en MT-Bench y 3,51 en Alpaca, aporta ganancias moderadas pero consistentes en cargas conversacionales, útil en despliegues de atención al cliente o asistentes generales.
- Optimización de costes en infraestructura: al aumentar los tokens aceptados por paso de verificación, se reduce el número de pasos de decodificación del modelo grande y, por tanto, el coste computacional por token generado.

## Benchmarks y rendimiento

Longitud de aceptación media por paso de verificación (incluye el token bonus del objetivo):

| Carga de trabajo | Longitud de aceptacion |
|---|---:|
| GSM8K | 6,40 |
| MATH-500 | 6,29 |
| AIME 2025 | 5,56 |
| HumanEval | 6,57 |
| MBPP | 6,34 |
| LiveCodeBench | 5,33 |
| MT-Bench | 3,92 |
| Alpaca | 3,51 |
| Arena-Hard-v2 | 3,72 |
| Media macro (9 cargas) | 5,29 |

No se han publicado en la información disponible resultados de benchmarks de calidad del modelo objetivo (MMLU, etc.) atribuibles a este draft, ni comparativas directas con otros speculators.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB en BF16 para el draft (1,36B parámetros); en GGUF Q4_K_M se reduce a alrededor de 0,8-1 GB.
- El draft se carga junto al modelo objetivo, por lo que la VRAM total es la del objetivo más la del borrador; es necesario reservar memoria adicional para las cachés de verificación y el estado de decodificación especulativa.
- GPU recomendadas: A100, H100 o H200 para despliegues de producción con tensor parallelism; RTX 4090 y GPUs con 24 GB o más para servir el objetivo cuantizado junto al draft.
- Cabe en GPU consumer: sí, el draft por sí solo cabe en cualquier GPU con 4 GB o más; el conjunto objetivo + draft depende de la cuantización del objetivo.
- Opciones de despliegue: SGLang (con soporte DSPARK y `--linear-replayssm-cache-len` dimensionado según el cookbook) y llama.cpp (build con soporte DSpark, `--spec-type draft-dspark --spec-draft-n-max 8`).
- Latencia y throughput: no se proporcionan cifras absolutas en la información disponible; las recetas con velocidad y precisión medidas están en el cookbook de SGLang para Ling-3.0-flash.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-flash-dspark | 1,36B | 262.144 | Draft DSpark (speculative decoding) | MIT | Hugging Face |
| DFlash (base tecnica) | no disponible | no disponible | Draft de decodificacion especulativa | no disponible | GitHub z-lab/dflash |
| SpecForge (framework) | no aplica | no aplica | Entrenamiento de speculators | no disponible | GitHub sgl-project/SpecForge |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada; la comparación se limita a la relación técnica con DFlash (predecesor del que DSpark extiende la arquitectura) y SpecForge (framework de entrenamiento).

## Limitaciones y advertencias

- No es un modelo generativo autónomo: solo funciona como draft de decodificación especulativa junto a Ling-3.0-flash; no puede usarse para chat o generación directa.
- Requiere runtimes con soporte específico (SGLang con DSPARK o llama.cpp con draft-dspark); no funciona con transformers estándar ni con vLLM sin soporte añadido.
- La longitud de aceptación varía notablemente según la carga: de 6,57 en HumanEval a 3,51 en Alpaca, por lo que las ganancias de throughput no son uniformes.
- En SGLang es imprescindible dimensionar correctamente `--linear-replayssm-cache-len`; una configuración incorrecta puede degradar el rendimiento o impedir el arranque.
- Riesgo de alucinación: no aplica directamente al draft, ya que los tokens propuestos se verifican contra el modelo objetivo; la calidad final depende íntegramente de Ling-3.0-flash.
- Idiomas soportados no documentados explícitamente; la cobertura lingüística hereda la del modelo objetivo.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; sin embargo, el uso en producción está condicionado por la licencia del modelo objetivo Ling-3.0-flash.
- Información de entrenamiento (tokens, composición del dataset, alineación) no disponible, lo que limita la auditabilidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-flash-dspark
- Repositorio DFlash: https://github.com/z-lab/dflash
- Repositorio SpecForge: https://github.com/sgl-project/SpecForge
- Repositorio SGLang: https://github.com/sgl-project/sglang
- Cookbook de SGLang para Ling-3.0-flash: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-flash
