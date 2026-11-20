# DedeProGames/LowOnMind-5M

## Resumen

LowOnMind-5M es un modelo de lenguaje decoder-only de 4.920.384 parámetros entrenado desde cero por DedeProGames sobre 200 millones de tokens del subconjunto sample-10BT de `HuggingFaceFW/fineweb-edu`. Es el tercer y mayor punto de la curva de escalado de la familia LowOnMind, tras LowOnMind-300k y LowOnMind-1M, y comparte con ellos tokenizador, dataset, presupuesto de tokens y forma del schedule, lo que permite comparaciones directas de pérdida de validación, bits por carácter y benchmarks entre los tres modelos.

El modelo no busca competir en capacidades generales: con 41 tokens por parámetro (frente al ratio Chinchilla óptimo de ~20) y un vocabulario deliberadamente fijado en 1024 tokens byte-level BPE, su interés es metodológico. Es el primer miembro de la familia cuyo rendimiento en benchmarks es estadísticamente distinguible del azar, y sirve como experimento controlado sobre los límites del escalado en regímenes de cómputo extremadamente reducidos.

La arquitectura es un transformer convencional con GQA, SwiGLU, RMSNorm, embeddings atados, QK-Norm por cabeza y RoPE precalculado, con 12 capas, hidden size de 192 y contexto de 512 tokens. El entrenamiento completo se ejecutó en 27 minutos sobre una única Tesla T4. La licencia es Apache 2.0 y el modelo está pensado exclusivamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GQA, SwiGLU, RMSNorm, QK-Norm, RoPE precalculado, embeddings atados) |
| Parametros totales | 4.920.384 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp16/fp32; no se documentan variantes GGUF) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo sigue la estela de GPT-2 small pero a una escala mucho menor: 12 capas, hidden size 192, intermediate size 512 (ratio SwiGLU exacto de 8/3 = 2.667, el estándar de Llama), 12 cabezas de query y 4 de key/value con head_dim 16. El aspect ratio (hidden/layers) sube a 16.0 desde 10.7 en los hermanos pequeños, y la proporción de parámetros dedicados a embeddings cae al 4,0 % (frente al 22,1 % de LowOnMind-300k). El vocabulario se mantiene en 1024 tokens byte-level BPE (~2,35 caracteres por token) por coherencia experimental con la serie, aun a costa de gastar capacidad en recomponer palabras a partir de fragmentos.

El entrenamiento usó 200M tokens (6.103 pasos de 32.768 tokens) con secuencias de 512, batch size 64, AdamW con betas (0,9, 0,95) y weight decay 0,1, learning rate pico de 1,2e-3 con decaimiento coseno hasta 1,2e-4 y 250 pasos de warmup, grad clipping 1,0 y precisión float16 con GradScaler. No se documenta RLHF, DPO ni ajuste de instrucciones: es un modelo base preentrenado exclusivamente con objetivo de modelado de lenguaje. La pérdida de entrenamiento y validación se mantuvieron alineadas, sin señales de sobreajuste. El ratio de 41 tokens por parámetro es el más cercano al óptimo de Chinchilla de los tres modelos de la familia (10x para LowOnMind-1M, 34x para LowOnMind-300k).

## Capacidades

- Generación de texto en inglés a nivel de modelado de lenguaje base, sin ajuste de instrucciones ni diálogo.
- Continuación de texto y muestreo incondicional; la model card reporta 64 muestras incondicionales para la métrica de palabras reales.
- Modelado de lenguaje de corto alcance: contexto limitado a 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No dispone de modo de razonamiento (thinking), visión, audio ni otras modalidades.
- Capacidad de recomposición léxica: al tener un vocabulario de 1024 tokens, el modelo ensambla palabras a partir de fragmentos, lo que constituye una capacidad emergente interesante para estudiar tokenización.

## Casos de uso

- Investigación sobre límites del escalado: el modelo sirve como punto de datos controlado en una curva de escalado de tres puntos con tokenizador, dataset y presupuesto de tokens idénticos, útil para estudiar cómo se comporta la pérdida de validación y el bits-per-character al multiplicar parámetros por 5x y 16,6x.
- Estudio de tokenizadores reducidos: permite analizar empíricamente el coste de mantener un vocabulario de 1024 tokens frente a alternativas de 4096 o mayores, midiendo el impacto en la tasa de palabras reales (96,3 % frente al 98,4 % del corpus de referencia).
- Benchmark de pipelines de entrenamiento: con 27 minutos de entrenamiento en una sola T4, es un banco de pruebas barato para validar configuraciones de AdamW, schedules coseno, precisión mixta y QK-Norm antes de escalar a modelos mayores.
- Docencia y divulgación: un modelo completo de ~5M parámetros con arquitectura moderna (GQA, SwiGLU, RoPE) que cabe en cualquier portátil y permite explicar de extremo a extremo el pipeline de preentrenamiento.
- Generación de texto experimental de baja exigencia: continuación de fragmentos cortos en inglés para demostraciones o tests de integración de infraestructura de inferencia (transformers, servidores de prueba).
- Evaluación de métricas de calidad léxica: la model card documenta explícitamente los problemas de suelo y techo de la métrica de "real-word rate", lo que convierte al modelo en un caso de estudio sobre cómo diseñar y criticar métricas de generación en modelos pequeños.
- Pruebas de despliegue en CPU: por su tamaño (repo de 0,0 GB), es adecuado para validar flujos de carga con `trust_remote_code` y `custom_code` en entornos sin GPU.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de validación y de calidad léxica, no benchmarks estándar (MMLU, HumanEval, GSM8K no aparecen).

| Metrica | LowOnMind-300k | LowOnMind-1M | LowOnMind-5M |
|---|---:|---:|---:|
| Pérdida de validación | 3,2982 | 2,9908 | 2,5828 |
| Perplejidad de validación | 27,06 | 19,90 | 13,23 |
| Bits por carácter | 2,030 | 1,836 | 1,586 |
| Tasa de palabras reales | no reportada | 98,0 % | 96,3 % |

Deltas respecto a LowOnMind-1M: -0,4080 nats con 5,0x parámetros; respecto a LowOnMind-300k: -0,7154 nats con 16,6x parámetros. La tasa de palabras reales de FineWeb-Edu con el mismo léxico de referencia es del 98,4 %. La caída a 96,3 % es estadísticamente real (z = 5,38) pero se atribuye a la emisión de vocabulario más raro (nombres propios, topónimos, términos técnicos) que quedan por debajo del umbral de frecuencia 5 del léxico de referencia, no a un deterioro ortográfico. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (4,9M parámetros × 4 bytes ≈ 20 MB de pesos, más overhead de activaciones y del tokenizador); en la práctica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna específica; el propio entrenamiento se realizó en una Tesla T4. Cualquier GPU con soporte CUDA (GTX 1060 en adelante) es sobrada.
- Cabe en GPU consumer: sí, en todas las generaciones recientes y antiguas; también en Raspberry Pi y entornos CPU-only.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el modelo usa `custom_code`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF hace improbable el despliegue directo en llama.cpp sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, la latencia será dominada por el overhead de framework más que por el cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vocabulario | Licencia | Estado |
|---|---:|---:|---:|---|---|
| LowOnMind-5M | 4.920.384 | 512 | 1024 | Apache 2.0 | Disponible en HF |
| LowOnMind-1M | 985.152 | 512 | 1024 | Apache 2.0 | Disponible en HF |
| LowOnMind-300k | 296.960 | 512 | 1024 | Apache 2.0 | Disponible en HF |
| GPT-2 small (referencia de escala) | 124M | 1024 | 50.257 | MIT | Disponible |

La comparación más significativa es interna a la familia LowOnMind, ya que comparten tokenizador, dataset y presupuesto de tokens, lo que hace directamente comparables sus pérdidas y bits-per-character. Frente a GPT-2 small, el modelo es ~25 veces menor en parámetros y su vocabulario es 49 veces más pequeño, por lo que no es un competidor en capacidad sino un experimento de escalado. No se dispone de datos de benchmarks que permitan comparar rendimiento en tareas downstream con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue instrucciones, no mantiene diálogos coherentes y no debe usarse como asistente.
- Contexto muy limitado (512 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- Vocabulario de 1024 tokens: obliga al modelo a recomponer cada palabra a partir de fragmentos, lo que degrada la calidad léxica y limita la fluidez.
- Solo inglés; no hay evidencia de capacidad en otros idiomas.
- Riesgo elevado de alucinación y de generar texto incoherente o sin sentido; la propia model card reconoce que los resultados apenas se distinguen del azar en benchmarks.
- Sesgos: al entrenarse sobre FineWeb-Edu, hereda los sesgos de ese corpus filtrado, no caracterizados en la model card.
- Licencia Apache 2.0 permite uso comercial, pero las capacidades del modelo hacen inviable cualquier aplicación productiva real.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de cargarlo.
- La métrica de "real-word rate" tiene problemas de suelo y techo documentados por el propio autor, por lo que no debe interpretarse como medida directa de calidad.
- No se documentan cuantizaciones ni formatos alternativos de pesos; el repo ocupa 0,0 GB y no hay garantías de compatibilidad con runtimes distintos de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DedeProGames/LowOnMind-5M
- LowOnMind-1M: https://huggingface.co/DedeProGames/LowOnMind-1M
- LowOnMind-300k: https://huggingface.co/DedeProGames/LowOnMind-300k
- Perfil del autor: https://huggingface.co/DedeProGames
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
