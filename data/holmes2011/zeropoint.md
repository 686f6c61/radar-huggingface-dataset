# Holmes2011/ZeroPoint

## Resumen

ZeroPoint es un prototipo de investigación publicado por el usuario Holmes2011 en Hugging Face (noviembre de 2026) que combina dos artefactos: ZeroCG, un framework de deep learning escrito desde cero en Python y NumPy, y ZeroPoint, una arquitectura de modelado de secuencias que sustituye la autoatención por un conjunto de *memory slots* con decaimiento aprendible. No es un modelo preentrenado ni un fine-tune: el repositorio no contiene pesos, sino código de arquitectura y una suite de experimentos.

El problema que aborda es el coste creciente del estado de inferencia en transformers: el KV cache escala linealmente con la longitud de contexto, mientras que ZeroPoint mantiene un estado fijo de 2.048 floats (8 KiB en fp32) independientemente de la longitud de la secuencia. La arquitectura usa una forma paralela por chunks (chunk = 32) para entrenamiento y una recurrencia por carácter para inferencia, sin codificación posicional.

Su relevancia es fundamentalmente metodológica y de investigación: a escala de ~115.000 parámetros y nivel de carácter sobre código Python, ZeroPoint y un transformer GPT-style quedan estadísticamente empatados en pérdida de validación (1,5214 ± 0,0134 frente a 1,5452 ± 0,0100), con menor coste de FLOPs por carácter y estado constante. El autor declara explícitamente que no reclama superioridad ni prioridad sobre trabajos previos (linear attention, RetNet, Mamba).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sequence model con memory slots de decaimiento aprendible (sustituye self-attention); forma dual chunked-parallel (entrenamiento) / recurrente por caracter (inferencia) |
| Parametros totales | 115.240 (modelo de comparacion del experimento; el repo no publica pesos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 caracteres en entrenamiento y evaluacion corta; estado constante evaluado hasta 4.096 |
| Tipos de cuantizacion | No disponible (no se publican pesos ni formatos cuantizados) |
| Idiomas soportados | Ingles (corpus ASCII de codigo Python; vocabulario de 96 caracteres) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el repositorio no contiene pesos preentrenados) |

## Arquitectura y entrenamiento

ZeroPoint sustituye la autoatención por 16 memory slots por cabeza, cada uno con un decaimiento λ aprendible inicializado con semividas geométricas entre 1,5 y 64 caracteres. La escritura en los slots usa competición softmax más una puerta de fuerza de escritura, y el estado inicial de los slots (s0) también es aprendible. No emplea codificación posicional: la información de orden se captura mediante la recurrencia con decaimiento. El entrenamiento usa una forma paralela por chunks de 32 elementos; la inferencia usa una recurrencia carácter a carácter con estado de tamaño fijo.

El framework ZeroCG implementa autodiferenciación en modo reverso, capas `nn`, AdamW con checkpointing y conteo de FLOPs de multiplicación matricial, todo en Python 3 + NumPy sobre float32. El experimento principal entrena sobre 1.558.395 caracteres de código Python de la librería estándar (vocabulario de 96), split contiguo 90/10, tarea de predicción de siguiente carácter, 2.000 pasos con batch de 32 secuencias × 64 caracteres, AdamW (β = 0,9/0,999, weight decay 0,01, grad clip 1,0), warmup de 100 pasos y decaimiento coseno al 10 %. Se usan 3 semillas y barrido de learning rate {1e-3, 3e-3, 6e-3}, seleccionando 6e-3 en los tres modelos. Todo se ejecuta en CPU (Apple Silicon), sin GPU. No se reporta RLHF ni DPO.

## Capacidades

- Modelado de secuencias a nivel de carácter: predicción del siguiente carácter sobre código Python ASCII.
- Estado de inferencia de tamaño constante (2.048 floats) independiente de la longitud de la secuencia.
- Entrenamiento con forma paralela por chunks y evaluación con recurrencia por carácter.
- Framework completo de entrenamiento: autograd reverso, capas, AdamW con checkpointing y conteo de FLOPs.
- No soporta tool calling ni function calling (no disponible en la información).
- No soporta agentes ni razonamiento multi-paso (no disponible).
- Capacidades multilingües: no; solo inglés y vocabulario ASCII de 96 caracteres.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Investigación en arquitecturas alternativas a la atención: sirve como base reproducible para estudiar memory slots con decaimiento frente a self-attention en presupuestos de parámetros pequeños.
- Experimentos de eficiencia de estado: permite medir el ahorro de memoria de inferencia (8 KiB constantes frente a KV cache que crece 8×, 128× y 512× a 64, 1.024 y 4.096 caracteres) en entornos sin GPU.
- Docencia y prototipado de frameworks: ZeroCG, con autograd y AdamW en NumPy puro, es útil para explicar el funcionamiento interno de un entrenamiento sin dependencias de PyTorch.
- Modelado de secuencias largas con recursos limitados: la recurrencia de estado fijo permite procesar secuencias de 4.096 caracteres con coste por carácter aproximadamente constante (~234.464 FLOPs frente a 2.306.048 del transformer).
- Reproducción de experimentos en CPU: el pipeline completo (1.558.395 caracteres, 2.000 pasos, ~2 minutos por modelo en un núcleo) es viable en portátiles para validar resultados.
- Base para extensiones a nivel de token o mayor escala: la implementación y el diseño documentado permiten experimentar con vocabularios mayores o corpus distintos, aunque el autor no lo valida en este release.

## Benchmarks y rendimiento

| Modelo | Parametros | Val loss (nats/char, 3 semillas) | FLOPs matmul/char @T=64 | Estado inferencia @64 / @1024 / @4096 (floats) |
|---|---|---|---|---|
| Transformer (PE aprendida) | 116.576 | 1,5452 ± 0,0100 | 241.664 | 16.384 / 262.144 / 1.048.576 |
| Transformer (PE sinusoidal) | 112.480 | 1,5271 ± 0,0083 | 241.664 | 16.384 / 262.144 / 1.048.576 |
| ZeroPoint | 115.240 | 1,5214 ± 0,0134 | 232.448 | 2.048 / 2.048 / 2.048 |

La diferencia ZeroPoint − Transformer es 0,0238 con 2 × desviación estándar máxima de semilla de 0,0268 (ratio 0,89), por lo que el autor la considera no significativa. Frente al transformer con PE sinusoidal la diferencia es 0,0057 (ratio 0,21). No se midió tiempo de reloj (wall-clock); solo se publican conteos de FLOPs.

## Requisitos de hardware

- Inferencia: no aplica en la práctica porque el repositorio no incluye pesos preentrenados; el estado del modelo son 2.048 floats (8 KiB en fp32).
- Entrenamiento de referencia: CPU única (Apple Silicon), NumPy float32, sin GPU; ~2 minutos por modelo con 2.000 pasos.
- GPU recomendadas: no disponible; el proyecto no usa GPU en sus experimentos.
- Compatibilidad con GPU de consumo: no evaluada en la información disponible.
- Opciones de despliegue: no disponible (no hay integración con vLLM, llama.cpp, Ollama ni TGI; el código es Python + NumPy).
- Latencia y throughput: no medidos; solo se reportan FLOPs por carácter (232.448 en ZeroPoint frente a 241.664 del transformer a T=64).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| ZeroPoint | 115.240 | 64 caracteres (eval. hasta 4.096) | Memory slots con decaimiento | Apache-2.0 | No |
| Transformer GPT-style (baseline del paper) | 112.480–116.576 | 64 caracteres | Self-attention con PE | No especificada | No |
| RetNet (Sun et al., 2023) | No disponible en la información | No disponible | Recurrencia con decaimiento sin PE | No disponible | No disponible |
| Mamba / SSM | No disponible en la información | No disponible | Estado recurrente de tamaño fijo | No disponible | No disponible |

La comparación directa solo es posible con el baseline del propio proyecto; frente a RetNet y Mamba el autor reconoce prior art conceptual pero no aporta comparación experimental.

## Limitaciones y advertencias

- No contiene pesos preentrenados: es una release de arquitectura y framework, no un modelo usable directamente para inferencia.
- Escala muy reducida: 115.240 parámetros y vocabulario de 96 caracteres; los resultados no son extrapolables a modelos de miles de millones de parámetros.
- Empate estadístico con el transformer: el autor no reclama superioridad; la diferencia de pérdida no supera el umbral de 2× desviación estándar de semilla.
- Sin medición de latencia ni throughput: solo hay conteos de FLOPs, no wall-clock.
- Dominio restringido: código Python ASCII en inglés; sin capacidades multilingües ni de texto general.
- Riesgo de alucinación: no evaluado; el modelo no está pensado para generación abierta.
- Licencia Apache-2.0 permite uso comercial del código, pero no hay artefactos entrenados que explotar comercialmente.
- El modelo de 1,4M parámetros (ZeroX) mencionado en la model card no forma parte del release; no se publican sus pesos, corpus ni ejecuciones.
- Sin soporte de tool calling, agentes, visión ni audio.

## Enlaces

- Hugging Face: https://huggingface.co/Holmes2011/ZeroPoint
- Repositorio de experimentos: incluido en el propio repo (carpeta `experiments/`), sin URL externa disponible
- Paper: no disponible
- Blog o demo: no disponible
