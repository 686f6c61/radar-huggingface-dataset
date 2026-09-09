# F-Labs/dzeta-agi

## Resumen

DZETA es un modelo de lenguaje autoregresivo desarrollado por F-Labs que abandona por completo la arquitectura transformer. En lugar de matrices de atención (QKᵀV), emplea un sistema de campos de onda continuos y no arquimedeanos, donde la información se codifica como interferencias armónicas sobre osciladores de token. El modelo está diseñado para eliminar dos cuellos de botella estructurales de los transformers: la memoria KV-cache cuadrática y el aprendizaje estático.

La arquitectura se presenta como un modelo recurrente tipo state-space (SSM) con atención lineal, soportando contexto de longitud infinita con memoria constante O(1). Además, incorpora capacidades de aprendizaje continuo: una función `learn()` permite actualizar trayectorias asociativas en tiempo real durante la inferencia, sin retropropagación ni reentrenamiento. Está escrito en C++20 puro, con aceleración SIMD AVX2/FMA, y ejecuta en CPUs de consumo, sin dependencias de Python ni CUDA.

El modelo se entrenó en un régimen de bajos datos, sobre el dataset TinyStories (1.000 historias, aproximadamente 220.000 tokens) y el dataset Databricks Dolly-15k. Su relevancia actual radica en ser una prueba de concepto para investigar alternativas a la atención por softmax, especialmente en entornos edge o con recursos mínimos, donde la latencia de 3,5 a 4,1 ms por token en CPU resulta notable frente a un transformer de tamaño similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Continuous Wave Memory (no transformer, atención lineal, recurrente, state-space model) |
| Parametros totales | No disponible (usa 4.305 osciladores de onda; almacenamiento int16 de 335 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Infinita, con memoria constante O(1) y zero KV-cache |
| Tipos de cuantizacion | int16 (pesos de osciladores) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | No disponible (implementación en C++20 puro; el repositorio de HuggingFace ocupa 0.3 GB) |

## Arquitectura y entrenamiento

DZETA sustituye las capas de atención por un campo de interferencia armónica continua. Cada token se representa como un oscilador y la información nueva se inscribe como patrones de onda sobre una base de ceros de la función zeta de Riemann (𝔸 = ℝ × ∏ₚ ℚₚ). La notación adélica se utiliza para describir la estructura matemática subyacente. El resultado es que el coste de memoria permanece constante independientemente de la longitud del contexto, eliminando el crecimiento O(N) del KV-cache y el cálculo O(N²) de la atención. El modelo es causal y recurrente, compatible con los tags de state-space model.

El entrenamiento se realizó sobre TinyStories de roneneldan y Databricks Dolly-15k. Según el autor, el régimen de datos es deliberadamente bajo: 1.000 historias sintéticas y alrededor de 220.000 tokens, con 3 épocas. La innovación central es que el modelo puede actualizar su trayectoria asociativa en tiempo real mediante una función `learn()`, que escribe nuevas memorias directamente en RAM de CPU sin retropropagación, gradientes ni reentrenamiento en GPU. Esto lo diferencia de los LLMs congelados. La implementación en C++20 está optimizada para CPU nativa con AVX2 y FMA.

## Capacidades

- Generación de texto causal autoregresivo en inglés, con enfoque en narrativa de baja complejidad (historias cortas).
- Aprendizaje continuo online: el modelo puede aprender de un flujo de tokens mientras infiere, sin backpropagation, mediante la función `learn()`.
- Contexto de longitud infinita con memoria estrictamente constante, sin expansión de KV-cache.
- Inferencia nativa en CPU con bastante baja latencia: alrededor de 3,5 a 4,1 ms por token en CPUs de portátil con AVX2/FMA.
- Sin dependencia de CUDA, Python ni GPU: el runtime está escrito en C++20 puro.
- No soporta tool calling, function calling ni agentes multi-step con razonamiento simbólico.
- No tiene capacidades multimodales (visión, audio) ni soporte de idiomas más allá del inglés.
- No dispone de un modo específico de razonamiento tipo thinking, dado que la arquitectura es de baja escala.

## Casos de uso

- Investigación en arquitecturas de atención lineal: el modelo sirve como banco de pruebas para comparar el rendimiento de un campo de ondas continuo frente a un transformer estándar en regímenes de datos muy reducidos.
- Prototipado de aprendizaje continuo en dispositivos edge: su función `learn()` permite actualizar conocimiento en tiempo real durante la inferencia, lo cual resulta útil en robots o sensores que procesan flujos de texto localmente sin conexión a la nube.
- Simulación de memoria de largo plazo en sistemas embebidos: gracias a la memoria O(1) y al contexto infinito, es viable mantener una conversación muy larga en una máquina con poca RAM, aunque la calidad del textosea limitada.
- Educación y divulgación sobre modelos de estado (SSM): el código C++20 comentado y sin dependencias lo hace útil para demostrar los principios de los state-space models y las arquitecturas recurrentes no transformer.
- Evaluación de eficiencia energética en IA: al no requerir GPU ni grandes cantidades de VRAM, se puede medir el coste por token en CPUs de consumo y compararlo con transformers de parámetros similares.
- Generación de narrativa corta en entornos sin conexión: en aplicaciones de juguetes, prototipos o demos de cuentos infantiles, el modelo puede generar secuencias de texto breves a partir de semillas como "Once upon a time", con tiempo de respuesta muy bajo.

## Benchmarks y rendimiento

El modelo no ha publicado resultados en benchmarks convencionales como MMLU, HumanEval o GSM8K. El autor presenta una comparativa propia sobre el benchmark de bajos datos TinyStories, evaluando DZETA frente a un transformer nanoGPT (2 millones de parámetros, 4 capas, 4 cabezas, entrenado con AdamW) y un modelo trigram Markov:

| Métrica | DZETA (v3) | nanoGPT (Transformer) | Markov Trigram |
|---|---|---|---|
| Arquitectura | Continuous Adelic Wave Field | 4 capas, 4 cabezas | N-Gram Graph Matrix |
| Tamaño / almacenamiento | 4.305 osciladores (int16: 335 MB) | 2.005.587 parámetros (float32: 8 MB) | Aprox. 1.2 MB |
| Escalado de memoria | Constante O(1), zero KV-cache | KV-cache O(N) | Grafo constante |
| Latencia por token en CPU | 3,5 – 4,1 ms | 12,5 – 14,8 ms | 0,05 ms |
| Tiempo total de inferencia | 58 ms (16 tokens) | 245 ms (18 tokens) | 1 ms |
| Loss / convergencia | 3,05012e-06 | 3,9848 | N/A |
| Attractor overlap | 0,1749 | 0,2199 | 0,2687 |
| Hardware requerido | CPU commodity (AVX2/FMA) | CPU o GPU NVIDIA | CPU commodity |

Los autores señalan que, en el régimen de 1.000 historias, DZETA converge a una pérdida cuatro órdenes de magnitud menor que nanoGPT. Sin embargo, la pérdida tan baja no se corresponde con una generación de texto fluida: los ejemplos de salida muestran incoherencia sintáctica y semántica, lo que sugiere que la métrica de pérdida en un dataset tan pequeño puede no ser representativa de la calidad del lenguaje.

## Requisitos de hardware

- VRAM estimada: ninguna. El modelo no requiere GPU ni VRAM para inferencia.
- CPU recomendada: procesador x86 con soporte AVX2 y FMA. Cualquier CPU de portátil moderna vale.
- Latencia: aproximadamente 3,5 a 4,1 ms por token en CPU de consumo, según el autor.
- Memoria RAM: el repositorio ocupa 0.3 GB; los pesos en int16 pesan 335 MB. El uso real depende del número de osciladores y del contexto, pero se declara constante O(1).
- Opciones de despliegue: no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. El runtime es un binario C++20 autónomo, sin dependencias externas, pensado para compilar e integrar en sistemas embebidos o edge.
- Throughput estimado: con 16 tokens tarda 58 ms, lo que equivale a unos 275 tokens por segundo en esa muestra, pero la cifra es orientativa y depende del hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DZETA | Continuous Wave Memory (SSM) | 4.305 osciladores (335 MB) | Infinito / O(1) | MIT | Repo GitHub + HuggingFace |
| nanoGPT (baseline) | Transformer estándar | 2 millones | Limitado por KV-cache | No especificada en la comparativa | Código abierto, GPU requerida |
| Markov Trigram | N-Gram graph matrix | Aprox. 1.2 MB | Fijo | No especificada | Código sencillo, sin aprendizaje |

No se han publicado datos comparables con modelos SSM modernos como Mamba o RWKV. La comparativa facilitada por el autor se limita a un transformer de referencia y a un modelo n-gram, por lo que no se puede situar a DZETA frente a modelos de atención lineal de escala mayor. No disponible para comparaciones más allá de la tabla anterior.

## Limitaciones y advertencias

- Calidad de generación muy limitada: los ejemplos del propio autor muestran salidas incoherentes, con signos de puntuación arbitrarios y sin gramática fluida. No es apto para aplicaciones de texto en producción.
- Entrenamiento en un dataset pequeño: solo 1.000 historias de TinyStories y Dolly-15k, lo que restringe el vocabulario y el conocimiento del mundo.
- Soporte de idiomas únicamente en inglés: no hay evidencia de capacidad en castellano ni en otros idiomas.
- Ausencia de herramientas de evaluación estándar: no se reportan resultados en MMLU, HumanEval o GSM8K, y la métrica de pérdida en TinyStories no es comparable con benchmarks convencionales.
- La licencia MIT permite uso comercial, pero el estado del modelo es de investigación; desplegarlo en producción conlleva un riesgo alto de resultados inaceptables.
- No soporta tool calling ni integración con agentes, y la arquitectura no está diseñada para razonamiento multi-step complejo.
- La arquitectura se describe con terminología matemática avanzada (espacios adélicos, ceros de zeta de Riemann), pero no se proporciona una especificación formal completa ni un paper revisado por pares.
- La afirmación de "contexto infinito" se basa en la propiedad de memoria O(1) declarada; en la práctica, la acumulación de interferencias en un campo finito de osciladores puede degradar la información con el tiempo, aunque el autor no lo cuantifica.

## Enlaces

- Repositorio en HuggingFace: `https://huggingface.co/F-Labs/dzeta-agi`
- Repositorio GitHub: `https://github.com/dsadawq3/dzeta-agi`
- Dataset TinyStories: `https://huggingface.co/datasets/roneneldan/TinyStories`
- Dataset Databricks Dolly-15k: `https://huggingface.co/datasets/databricks/databricks-dolly-15k`

No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs o demos) más allá de los indicados en la model card.
