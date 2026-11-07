# GEHIRNS/magi-1.2-2B

## Resumen

magi-1.2-2B es un ajuste fino cuantizado en GGUF del modelo Qwen3.5-2B, desarrollado por GEHIRNS. No es un modelo entrenado desde cero, sino una distribución de pesos de precisión mixta que combina un fine-tune con LoRA sobre trazas de razonamiento cortas, una ronda de entrenamiento de preferencias (DPO) contra bucles de repetición y una receta de cuantización mixta calibrada específicamente para el modelo de 2B. El objetivo declarado es maximizar la "densidad de capacidad" (capacidad por gibibyte de memoria) manteniendo un contexto de 32K.

El modelo parte de la arquitectura de Qwen3.5-2B, que según las etiquetas del autor incorpora Gated DeltaNet, una variante de atención lineal con estado recurrente. Con 1.881.825.088 parámetros totales y un archivo de 0,8 GB en el repositorio, el resultado ocupa 1,23 GiB en contexto de 32K según las mediciones del autor con llama.cpp, frente a 4,72 GiB del modelo base en BF16.

Su relevancia radica en la propuesta de empaquetado: el autor reporta que magi-1.2-2B alcanza el 94 % de la puntuación del BF16 sin cuantizar con 3,8 veces menos memoria y una densidad de capacidad de ρ = 1,305 frente a 0,385 del BF16. Son cifras autoinformadas y no verificadas de forma independiente, por lo que deben tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5-2B con Gated DeltaNet (atención lineal con estado recurrente) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K (medido por el autor en llama.cpp) |
| Tipos de cuantizacion | GGUF de precisión mixta (receta propia del autor, no disponible el desglose por tipo estándar Q4/Q5/Q8); KV cache q4_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería gguf; compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

La base es Qwen3.5-2B, un transformer de 1.880 millones de parámetros que, según las etiquetas del autor, emplea Gated DeltaNet, un mecanismo de atención lineal con estado recurrente que sustituye o complementa la atención cuadrática clásica. Esto explica que el autor mida "estado recurrente" además de pesos y KV cache en el cálculo de memoria a 32K. No se dispone de detalles sobre el número de tokens de preentrenamiento ni la composición del dataset del modelo base.

Sobre esa base, el autor aplica tres pasos. Primero, el fine-tune LoRA de magi-1.1-2B, entrenado sobre trazas de razonamiento propias, correctas y cortas, para que el modelo termine su razonamiento en lugar de agotar el presupuesto. Segundo, una ronda de DPO con 224 pares de preferencia construidos enfrentando una respuesta correcta y corta contra la traza con bucles de repetición generada por el propio modelo sobre el mismo prompt, penalizando solo el texto repetido y no el razonamiento previo; el autor reporta que los agotamientos del presupuesto de pensamiento caen del 81 % al 48 %. Tercero, una cuantización de precisión mixta calibrada para el 2B: para cada uno de 115 grupos de tensores se probó un paso de cuantización arriba y abajo, puntuando por divergencia KL respecto al modelo BF16 en texto de razonamiento y chat reservado, se movieron bits hacia donde más rendían (39 grupos cambiados) y se recalculó la matriz de importancia a partir de las trazas de razonamiento del propio 2B. No se especifican los hiperparámetros de entrenamiento ni el volumen de datos del fine-tune.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado de text-generation.
- Razonamiento con modo de pensamiento (thinking) y presupuesto de tokens controlable; el autor reporta una reducción del 27 % en tokens de pensamiento respecto a magi-1.1-2B.
- Razonamiento de varios pasos y resolución de problemas, evaluado por el autor en tareas de razonamiento y benchmarks de código.
- Generación de código, con evaluación del autor mediante ejecución de tests (EvalPlus para HumanEval+ y MBPP+).
- Capacidad de conversación multi-turno (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y despliegue en llama.cpp y Ollama.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Asistente conversacional local en inglés: el modelo cabe en 1,23 GiB a 32K de contexto según el autor, por lo que puede ejecutarse en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, gestionando conversaciones multi-turno con historial largo.
- Razonamiento con presupuesto controlado: el DPO contra bucles permite fijar un límite de tokens de pensamiento (el autor usa 4.096) con menos riesgo de agotarlo repitiéndose, útil en pipelines donde la latencia de razonamiento está acotada.
- Generación de código en entornos con recursos limitados: el autor evalúa HumanEval+ y MBPP+ por ejecución de tests, lo que permite integrarlo en tareas de autocompletado o generación de funciones donde no hay presupuesto para un modelo mayor.
- Prototipado y experimentación en investigación: al ser un GGUF de 0,8 GB con licencia Apache 2.0, sirve para probar técnicas de cuantización mixta y DPO anti-bucle sin infraestructura costosa.
- Despliegue en el borde o en dispositivos con poca memoria: la ventana de 32K con estado recurrente y KV cache q4_0 hace viable mantener contexto amplio en hardware modesto.
- Evaluación comparativa de recetas de cuantización: el autor publica la metodología (divergencia KL por grupo de tensores, matriz de importancia propia), lo que permite reproducir o contrastar el enfoque frente a cuantizaciones estándar.

## Benchmarks y rendimiento

El autor publica una tabla comparativa ejecutada en una RTX 5070 (12 GB) con llama.cpp b11800 (`llama-server`), 2.313 tareas, thinking activado con presupuesto de 4.096 tokens, decodificación greedy y KV cache q4_0 con flash attention. La información disponible solo incluye el encabezado de la tabla y los datos de memoria y densidad; los valores por benchmark no están completos en los datos proporcionados.

| Metrica | Qwen3.5-2B BF16 | magi-1.1-2B | magi-1.2-2B |
|---|---|---|---|
| Memoria a 32K contexto | 4,72 GiB | 1,36 GiB | 1,23 GiB |
| Densidad de capacidad (ρ) | 0,385 | 1,149 | 1,305 |
| Puntuación agregada | no disponible | 66,1 % | 67,1 % |
| Agotamientos del presupuesto de pensamiento | no disponible | 81 % | 48 % |
| HumanEval+ | no disponible | no disponible | no disponible |
| MBPP+ | no disponible | no disponible | no disponible |
| LiveCodeBench | no disponible | no disponible | no disponible |

El autor afirma que magi-1.2-2B alcanza el 94 % de la puntuación del BF16 con 3,8 veces menos memoria y 3,4 veces más capacidad por GiB. Estas cifras son autoinformadas y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: 1,23 GiB residentes a 32K de contexto y una secuencia según `llama-fit-params` (pesos, KV cache q4_0, estado recurrente y buffers de cómputo, GPU más host, sin contexto CUDA). A contextos menores el consumo baja proporcionalmente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; el autor validó en una RTX 5070 (12 GB). Funciona también en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1060 6 GB, RTX 3060, RTX 4060, etc.) e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama y cualquier runtime compatible con GGUF; el autor indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles. El autor solo reporta que el modelo "piensa" un 27 % menos que magi-1.1-2B, lo que reduce el tiempo de razonamiento, pero sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria a 32K | Puntuacion agregada | Licencia | Formato |
|---|---|---|---|---|---|---|
| magi-1.2-2B | 1,88 B | 32K | 1,23 GiB | 67,1 % (autor) | Apache 2.0 | GGUF |
| magi-1.1-2B | 1,88 B | 32K | 1,36 GiB | 66,1 % (autor) | Apache 2.0 | GGUF |
| Qwen3.5-2B BF16 | 1,88 B | no disponible | 4,72 GiB | 94 % relativo (autor) | Apache 2.0 | safetensors / GGUF |
| magi-1.0-2B | 1,88 B | no disponible | no disponible | no disponible | Apache 2.0 | GGUF |

La comparación con modelos de otros autores y tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks y la métrica de densidad de capacidad son autoinformados por el autor, con una metodología propia (ρ = −log₂(1 − score) / GiB) y sin verificación independiente; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- El modelo solo declara soporte de inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de bucles de repetición: el propio autor documenta que el 2B cuantizado se atasca repitiendo bajo decodificación greedy hasta agotar el presupuesto de pensamiento; el DPO reduce los agotamientos al 48 %, pero no los elimina.
- Riesgo de alucinación inherente a un modelo de 2B, especialmente en tareas de conocimiento factual y razonamiento largo.
- La cuantización de precisión mixta introduce degradación respecto al BF16; el autor la cuantifica pero no publica el desglose completo por benchmark en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero hereda las condiciones del modelo base Qwen3.5-2B; conviene revisar la licencia original enlazada por el autor.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines que dependan de function calling.
- El contexto de 32K se midió con una sola secuencia; el rendimiento con múltiples secuencias concurrentes no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GEHIRNS/magi-1.2-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Licencia del ajuste: https://huggingface.co/GEHIRNS/magi-1.2-2B/blob/main/LICENSE
- Versión anterior magi-1.1-2B: https://huggingface.co/GEHIRNS/magi-1.1-2B
- Versión magi-1.0-2B: https://huggingface.co/GEHIRNS/magi-1.0-2B
- Perfil del autor: https://huggingface.co/GEHIRNS
- Sitio web del autor: https://gehirns.pages.dev/
- GGUF BF16 del modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
