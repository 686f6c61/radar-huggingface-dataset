# ikimyaii/GatedDeltaNet-340M-semi-structured-Wanda-80pct

## Resumen

GatedDeltaNet-340M-semi-structured-Wanda-80pct es una variante podada del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de investigación sobre poda one-shot (sin reentrenamiento) aplicada a una arquitectura híbrida de tipo GatedDeltaNet, una familia de modelos de estado (SSM) lineales con compuertas que se posiciona como alternativa eficiente a la atención transformer clásica. El modelo conserva 399.531.200 parámetros en pesos, aunque la mayoría de las capas lineales internas presentan una dispersión estructurada por filas del 80%.

El interés técnico reside en el método de poda: se aplica Wanda (Weights and Activations) en su implementación oficial, calibrando con 128 secuencias de C4 de 2.048 tokens y podando bloque a bloque en orden secuencial, de modo que cada bloque se calibra sobre las salidas de los bloques ya podados. El resultado es un modelo con un 79,98% de dispersión medida, donde cada fila de cada capa podada mantiene exactamente el mismo número de pesos no nulos, lo que garantiza un equilibrio perfecto de trabajo por fila para kernels dispersos.

Es relevante ahora porque sirve como línea base de referencia para comparar técnicas de poda más sofisticadas (los modelos EHWS del mismo autor) sobre arquitecturas SSM lineales, un área donde la literatura de compresión aún es escasa comparada con los transformers. No obstante, la degradación de calidad es severa: la perplejidad en WikiText-2 pasa de 16,42 a 350,14.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (SSM lineal con compuertas, familia delta rule) |
| Parametros totales | 399.531.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un GatedDeltaNet de 340M de parámetros entrenado sobre 20B tokens (según el nombre del checkpoint base, m-a-p/340M-20B-GatedDeltaNet-pure-baseline). GatedDeltaNet pertenece a la familia de modelos de espacio de estado lineales con mecanismo de compuerta y regla delta, que permite actualizaciones selectivas del estado recurrente y se implementa habitualmente mediante la librería flash-linear-attention (fla). El modelo podado carga con `AutoModelForCausalLM.from_pretrained(...)` siempre que `fla` esté instalado.

El proceso de poda es one-shot, sin reentrenamiento posterior. Se usa el código oficial de Wanda (commit locuslab/wanda@8e8fc87, rama unstructured, `use_variant=False`): para cada fila se eliminan los pesos con menor producto `|W| * sqrt(||X||)`, donde X son las activaciones de calibración. La calibración emplea 128 secuencias de C4 de 2.048 tokens con semilla 0. Las capas lineales dentro de los bloques se podan todas; embeddings y lm_head permanecen densos. La poda se realizó en bfloat16 y tardó 1,5 minutos en una única A100 de 40 GB. La dispersión medida sobre los pesos resultantes es 0,7998, y se verificó que las 240 capas podadas tienen el mismo número de no nulos por fila.

## Capacidades

- Generación de texto autoregresiva mediante la arquitectura GatedDeltaNet del modelo base.
- Razonamiento y conocimiento general limitados severamente por la poda: la accuracy media zero-shot cae de 0,4373 a 0,3390.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Su función práctica es servir como línea base de comparación para experimentos de poda, no como modelo de producción.

## Casos de uso

- Investigación en compresión de modelos SSM lineales: el modelo permite medir el impacto de la poda Wanda al 80% sobre GatedDeltaNet frente a técnicas alternativas (los modelos EHWS del mismo autor), usando las perplejidades y accuracies publicadas como referencia.
- Estudio de kernels dispersos semi-estructurados: al tener todas las filas con el mismo número de no nulos, es adecuado para validar implementaciones de kernels con equilibrio de carga por fila en GPUs.
- Reproducción de experimentos de poda: el model card documenta el commit exacto de Wanda, la configuración de calibración y el protocolo de evaluación (ELSA para perplejidad, lm-evaluation-harness para zero-shot), lo que facilita la replicación.
- Análisis de degradación por tarea: con resultados en arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande, sirve para estudiar qué tareas toleran mejor la poda agresiva (rte y winogrande incluso mejoran ligeramente).
- Docencia y divulgación sobre sparsity: ejemplo concreto y reproducible de poda one-shot con métricas antes/después.
- Benchmarking de infraestructura de inferencia: útil para medir el rendimiento real de kernels dispersos frente a densos en hardware consumer, dado el reducido tamaño del modelo (0,8 GB de repo).

## Benchmarks y rendimiento

Perplejidad (protocolo ELSA, fp16):

| Conjunto | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 16,42 | 350,14 |
| C4 | 19,94 | 261,72 |

Accuracy zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,2014 |
| arc_easy | 0,6023 | 0,2955 |
| boolq | 0,5985 | 0,4336 |
| hellaswag | 0,3461 | 0,2663 |
| openbookqa | 0,2300 | 0,1280 |
| rte | 0,5162 | 0,5307 |
| winogrande | 0,5036 | 0,5178 |
| Media | 0,4373 | 0,3390 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en bfloat16/fp16 para los pesos; con overhead de activaciones y estado recurrente, cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna; el model card reporta que la poda se ejecutó en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado (requisito explícito del autor). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La ventaja teórica de la dispersión por filas equilibrada es que el trabajo por fila es uniforme, pero no se publican mediciones de speedup.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| GatedDeltaNet-340M-semi-structured-Wanda-80pct (este) | 399.531.200 | no disponible | no disponible | Podado one-shot, 79,98% sparsity, perplejidad WikiText-2 350,14 |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline | 340M (nominal) | no disponible | no disponible | Denso, perplejidad WikiText-2 16,42, media zero-shot 0,4373 |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | Referenciados en el model card como alternativas de poda; sin datos públicos en la información disponible |

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por más de 20 (16,42 a 350,14) y la media zero-shot cae 9,8 puntos porcentuales. No es apto para uso en producción como generador de texto.
- La poda es one-shot sin reentrenamiento, por lo que no hay recuperación de capacidad tras la compresión.
- No se especifican sesgos conocidos, pero al derivar de un modelo base entrenado sobre C4, hereda los sesgos de ese corpus.
- Riesgo elevado de alucinación y generación incoherente dado el nivel de perplejidad.
- Licencia no disponible: no puede asumirse uso comercial permitido; debe consultarse con el autor.
- Idiomas no especificados; no hay garantía de soporte multilingüe.
- Requiere la librería flash-linear-attention para cargar; sin ella la carga falla.
- Longitud de contexto no documentada en la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-semi-structured-Wanda-80pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Librería flash-linear-attention: no disponible enlace directo en la información proporcionada
- Paper de GatedDeltaNet: no disponible enlace en la información proporcionada
- Protocolo de evaluación ELSA: no disponible enlace en la información proporcionada
- lm-evaluation-harness: no disponible enlace en la información proporcionada
