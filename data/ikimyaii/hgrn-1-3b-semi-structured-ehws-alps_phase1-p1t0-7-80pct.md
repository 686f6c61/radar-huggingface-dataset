# ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS_phase1-p1t0.7-80pct

## Resumen

HGRN-1.3B-semi-structured-EHWS-ALPS_phase1-p1t0.7-80pct es un checkpoint de investigación publicado por el usuario ikimyaii: una versión del modelo base fla-hub/hgrn-1.3B-100B podada al 80 % de sparsity semi-estructurada (row-wise) mediante una receta de dos fases con ADMM denominada EHWS, en la que la fase 1 local (estilo ALPS) poda hasta el 70 % y la fase 2 completa hasta el 80 %. No es un modelo entrenado desde cero ni un modelo conversacional afinado: es el resultado de un experimento de compresión sobre una arquitectura HGRN de 1.364.396.032 parámetros (aproximadamente 1,36 B), con embeddings y `lm_head` intactos y pesos en float32.

Su interés es fundamentalmente metodológico. El autor compara dos objetivos de fase 1 (80 % directo frente a 70 % intermedio) y documenta que el objetivo del 70 % reduce la perplejidad un 13,3 % en WikiText-2 y un 13,8 % en C4 respecto a la receta por defecto, con el mismo protocolo de evaluación. Todo el proceso de poda, incluyendo la evaluación, se completó en 3,69 horas sobre una única A100 de 40 GB, lo que lo convierte en un caso reproducible y de bajo coste para estudiar el equilibrio entre ratio de compresión y degradación.

Ahora mismo es relevante por dos motivos: por un lado, aporta datos concretos sobre cómo se degrada un modelo recurrente lineal de 1,3 B al 80 % de sparsity (perplejidad de 40,31 en WikiText-2 frente a 11,81 del denso); por otro, la model card es explícita sobre hiperparámetros, datos y semilla, algo poco habitual en checkpoints de poda. Sus limitaciones son igualmente claras: cero descargas, cero likes, licencia no declarada y ausencia de benchmarks estándar tipo MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (red recurrente lineal con puertas jerarquicas, familia flash-linear-attention); requiere `trust_remote_code=True` e `import fla` |
| Parametros totales | 1.364.396.032 (~1,36 B), medidos sobre los safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en float32, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la evaluacion se limita a WikiText-2 y C4, corpus en ingles) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | safetensors, float32; repositorio de 5,5 GB |
| Sparsity | 0,7999 medida sobre los pesos, uniforme por fila, en 168 capas podables |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Fecha de publicacion | 26 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es HGRN, un modelo recurrente lineal con puertas jerárquicas implementado en la librería flash-linear-attention; el modelo base, fla-hub/hgrn-1.3B-100B, se entrenó sobre 100.000 millones de tokens según indica su propio nombre. Este checkpoint no reentrena la arquitectura: parte de esos pesos densos y aplica una poda semi-estructurada en la que cada fila de cada capa lineal podable conserva exactamente el mismo número de pesos (el 20 % superior en magnitud). Las capas de embedding y `lm_head` permanecen densas, y las normas, embeddings y `lm_head` sí se reajustan durante la fase 2, sin término de penalización.

La receta EHWS consta de dos fases. La fase 1 es local, de estilo ALPS: poda cada capa hasta el 70 % minimizando el error de reconstrucción `||(W - W0) X||^2`, con un paso x en forma cerrada y una penalización rho que crece de 0,01 a 10 veces la media de `diag H` a lo largo de 50 rondas, terminando con un refit exacto por mínimos cuadrados sobre el soporte final; las matrices hessianas se estiman con 256 secuencias de C4. La fase 2 es global: parte de los pesos podados al 70 % y ejecuta ADMM sobre la pérdida completa de entropía cruzada más destilación de conocimiento (alpha 0,5) con un paso Z basado en `diag(H)`, durante 128 rondas de 32 pasos, learning rate 6e-4 con decaimiento lineal, lambda constante de 0,01, Adam con beta2 0,95, batch de 8 y semilla 0. Se usan pesos maestros, gradientes y estado de Adam en float32 con autocast bf16 en la pasada forward, sobre las 32.768 secuencias de C4 de 2.048 tokens del código oficial de ELSA, vistas una sola vez cada una; `diag(H)` se remide antes de cada paso Z.

## Capacidades

- Generación de texto autorregresiva en inglés, con calidad degradada respecto al modelo denso: la perplejidad en WikiText-2 sube de 11,81 a 40,31.
- Razonamiento y conocimiento factual limitados: la media de precisión zero-shot en siete tareas de elección múltiple cae de 0,4376 a 0,3812.
- No hay evidencia en la información disponible de soporte de tool calling ni de function calling; no se documenta plantilla de chat ni formato de instrucciones.
- No hay evidencia de capacidades de agente, razonamiento multi-paso guiado ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles; no se documenta vocabulario, tokenizador ni evaluación fuera del inglés.
- Capacidades de visión, audio o multimodalidad: no disponibles.
- Capacidad destacable, de tipo estructural: patrón de sparsity uniforme por fila en las 168 capas podables, lo que equilibra el trabajo por fila a nivel de kernel.

## Casos de uso

- Investigación sobre poda semi-estructurada: sirve como punto de comparación reproducible para recetas ADMM, ya que la model card detalla hiperparámetros, semilla, datos y tiempo de ejecución (3,69 h en una A100 de 40 GB).
- Estudio del compromiso compresión-calidad en arquitecturas recurrentes lineales: permite medir cuánto se degrada un HGRN de 1,3 B al 80 % de sparsity frente a su versión densa, con perplejidad y siete tareas zero-shot como referencia.
- Ablaciones de objetivo en la fase 1: el propio checkpoint existe para comparar el objetivo del 70 % con el del 80 %; se puede replicar el barrido 0,9 / 0,8 / 0,7 / 0,6 mencionado en la card sobre otros modelos de la familia.
- Desarrollo y validación de kernels dispersos: al tener un número idéntico de no ceros por fila, es un banco de pruebas razonable para kernels que explotan equilibrio de carga, aunque el patrón no es 2:4.
- Docencia y divulgación técnica: ilustra de forma cuantitativa qué supone llevar un modelo al 80 % de sparsity sin recuperación posterior, con tablas listas para explicar el coste real de la compresión.
- Experimentos de despliegue en hardware modesto: con pesos en float32 ocupa unos 5,5 GB, de modo que cabe en GPUs de consumo de 8-12 GB para pruebas de inferencia, sin expectativas de calidad de producción.
- Baseline en pipelines de compresión: cualquier método nuevo (SparseGPT, Wanda, ALPS puro) puede compararse contra estas cifras de WikiText-2 y C4 publicadas con protocolo explícito.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA-official (test sets propios de WikiText-2 y C4, fp16), ejecución única:

| Modelo | Tipo de sparsity | WikiText-2 | C4 |
|---|---|---|---|
| Denso (base) | -- | 11,81 | 16,09 |
| Este modelo | semi-estructurada (por fila), 80 % | 40,31 | 29,82 |

Precisión zero-shot:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,1962 |
| arc_easy | 0,5644 | 0,4040 |
| boolq | 0,5758 | 0,6147 |
| hellaswag | 0,3828 | 0,2954 |
| openbookqa | 0,2300 | 0,1460 |
| rte | 0,5379 | 0,5162 |
| winogrande | 0,5288 | 0,4957 |
| media | 0,4376 | 0,3812 |

Comparación del objetivo de fase 1, misma evaluación en ambas filas:

| Objetivo fase 1 | WikiText-2 | C4 |
|---|---|---|
| 80 % (receta por defecto) | 46,49 | 34,58 |
| 70 % (este modelo) | 40,31 | 29,82 |
| Variación | -13,3 % | -13,8 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de razonamiento o código en la información disponible.

## Requisitos de hardware

- Pesos en float32: 5,5 GB en disco y en memoria; en bf16 ocuparían aproximadamente 2,7 GB, aunque no se publica conversión.
- VRAM estimada para inferencia en float32: en torno a 7-9 GB contando activaciones y caché de la arquitectura recurrente (estimación a partir del tamaño de los pesos, no medida publicada).
- GPU recomendadas para experimentación: A100 40 GB (la usada para la poda), A10, L4 o RTX 4090; para pruebas funcionales basta una RTX 3060 de 12 GB o una 4060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en float32, siempre que la implementación de HGRN esté disponible.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la librería `flash-linear-attention` instalada; no se documenta soporte en vLLM, TGI, llama.cpp ni Ollama, y la ausencia de GGUF hace improbable su uso inmediato en esos entornos.
- Latencia y throughput: no disponible.
- Nota importante: la sparsity es uniforme por fila, no el patrón 2:4 que aceleran los tensor cores dispersos; la model card no reporta ganancias de velocidad, solo equilibrio de trabajo por fila.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Sparsity | WikiText-2 | C4 | Zero-shot medio | Licencia |
|---|---|---|---|---|---|---|---|
| Este modelo (fase 1 al 70 %) | 1,36 B | no disponible | 80 % row-wise | 40,31 | 29,82 | 0,3812 | no disponible |
| ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS-phase1-80pct | 1,36 B | no disponible | 80 % row-wise | 46,49 | 34,58 | no disponible | no disponible |
| fla-hub/hgrn-1.3B-100B (denso) | 1,36 B | no disponible | 0 % | 11,81 | 16,09 | 0,4376 | no disponible |

No se dispone de datos de otros modelos comparables de 1,3 B en la información proporcionada; cualquier comparación con familias transformer densas del mismo tamaño requeriría ejecutar la misma evaluación, que aquí no se ha hecho.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por 3,4 (de 11,81 a 40,31) y la media zero-shot cae 5,6 puntos porcentuales; arc_easy pierde 16 puntos y openbookqa 8,4.
- Resultado de una única ejecución, sin barras de error ni repeticiones con distintas semillas; la variabilidad entre semillas no está caracterizada.
- Evaluación limitada a WikiText-2, C4 y siete tareas zero-shot en inglés; no hay datos de MMLU, código, matemáticas ni multilingüismo.
- Licencia no declarada: sin términos explícitos, el uso comercial es jurídicamente incierto y no puede asumirse permisividad.
- Requiere ejecución de código remoto (`trust_remote_code=True`) y una dependencia externa (`flash-linear-attention`); ambos son un riesgo de seguridad y de reproducibilidad en producción.
- Pesos en float32: duplican el espacio frente a bf16 y encarecen el despliegue, sin variantes cuantizadas publicadas.
- Riesgo de alucinación elevado: un modelo podado al 80 % sin recuperación posterior pierde cohesión factual, como refleja la caída en boolq, hellaswag y openbookqa.
- No se documenta ningún proceso de alineación (RLHF, DPO) en la información disponible, ni plantilla de chat, por lo que no debe usarse como asistente conversacional.
- El patrón row-wise no garantiza aceleración en hardware: sin kernels específicos o un patrón N:M, el ahorro es de memoria, no necesariamente de tiempo de cómputo.
- Cero descargas y cero likes en el momento de la consulta: no hay validación independiente de las cifras reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS_phase1-p1t0.7-80pct
- Modelo base denso: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Variante con fase 1 al 80 % (receta por defecto): https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS-phase1-80pct
- Registro completo de la ejecución: `results.json`, incluido en el repositorio del modelo
- Librería necesaria para cargar el modelo (flash-linear-attention): https://github.com/fla-org/flash-linear-attention
- Código oficial de ELSA, citado como origen de los datos y del protocolo de evaluación: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo.
