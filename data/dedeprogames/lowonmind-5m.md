# DedeProGames/LowOnMind-5M

## Resumen

LowOnMind-5M es un modelo de lenguaje autorregresivo (decoder-only) de 4.920.384 parámetros, desarrollado por DedeProGames y preentrenado desde cero sobre 200 millones de tokens del subconjunto sample-10BT de HuggingFaceFW/fineweb-edu. Es el tercer punto de la curva de escalado de la familia LowOnMind, después de los modelos de 300k y 1M, con los que comparte tokenizador, presupuesto de tokens, forma de programación de aprendizaje y métricas de evaluación, lo que permite comparaciones directas entre los tres.

Su relevancia radica en ser un artefacto de investigación para estudiar los límites del escalado en modelos extremadamente pequeños: con solo 41 tokens por parámetro, se acerca a la proporción óptima de Chinchilla (alrededor de 20) más que sus hermanos menores. Presenta una arquitectura moderna con GQA, SwiGLU, RMSNorm, QK-Norm y RoPE precomputado, pero con un vocabulario deliberadamente reducido de 1024 tokens, lo que limita su capacidad práctica pero facilita el análisis de la dinámica de aprendizaje.

El modelo se distribuye bajo licencia Apache 2.0, está orientado exclusivamente a inglés y se publica como un artefacto de investigación, no como una herramienta utilizable en producción. Su implementación requiere código personalizado (trust_remote_code=True) y no dispone de caché KV, por lo que cada paso de generación recalcula toda la ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con GQA, SwiGLU, RMSNorm, QK-Norm y RoPE precomputado |
| Parametros totales | 4.920.384 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en float16 originales, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código de modelado personalizado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 12 capas, hidden size de 192, MLP intermedio de 512 (relación 8/3 = 2,667, la estándar de SwiGLU en Llama), 12 cabezas de consulta y 4 de clave/valor (GQA) con head dim de 16. Emplea RMSNorm, embeddings atados (tied), QK-Norm por cabeza y RoPE precomputado con re-expansión automática. Las proyecciones residuales se inicializan con desviación estándar `std / sqrt(2 * num_layers)`. El vocabulario es un BPE a nivel de byte de 1024 tokens, mantenido deliberadamente bajo para permitir comparaciones válidas con los modelos hermanos; esto implica que cada token promedia 2,35 caracteres y el modelo debe ensamblar palabras a partir de fragmentos.

El entrenamiento se realizó sobre 200M tokens de fineweb-edu (sample-10BT) en 6.103 pasos con secuencias de 512 tokens y batch de 64. Se usó AdamW (betas 0,9 y 0,95, weight decay 0,1), tasa de aprendizaje máxima de 1,2e-3 con decaimiento coseno hasta 1,2e-4 y 250 pasos de warmup, grad clip de 1,0 y precisión float16 con GradScaler. El entrenamiento se ejecutó en una Tesla T4 durante 27 minutos. No se aplicaron técnicas de alineación como RLHF o DPO; se trata de un preentrenamiento puro de modelado de lenguaje.

## Capacidades

- Generación de texto en inglés con sintaxis local fluida y estructura de registro apropiada para el corpus de entrenamiento.
- Modelado de lenguaje básico capaz de completar secuencias cortas de hasta 512 tokens de contexto.
- Capacidad limitada de ensamblaje de palabras a partir de fragmentos BPE (tasa de palabras reales del 96,3% en muestras no condicionadas).
- Sin soporte de tool calling, function calling ni razonamiento multi-paso.
- Sin capacidades multimodales (solo texto).
- Sin modo de pensamiento explícito ni generación razonada.
- Multilingüismo: solo inglés, sin soporte para otros idiomas.

## Casos de uso

- Investigación en scaling laws: el modelo sirve como punto de referencia para estudiar cómo varían la pérdida de validación, la perplejidad y los bits por carácter al multiplicar por 5 los parámetros manteniendo el mismo presupuesto de tokens y tokenizador. Permite validar la relación de Chinchilla en escalas extremadamente pequeñas.
- Análisis de la relación entre vocabulario y capacidad de representación: al mantener un vocabulario de 1024 tokens, se puede estudiar cuánta capacidad del modelo se consume en componer palabras a partir de fragmentos, comparando con variantes que usen vocabularios mayores.
- Experimentos de inicialización y arquitectura: la implementación con QK-Norm, GQA y SwiGLU en un modelo de 5M permite probar hipótesis sobre estabilidad de entrenamiento y convergencia en entornos de cómputo limitado (una GPU T4 es suficiente).
- Docencia y formación en aprendizaje profundo: por su tamaño reducido y código fuente personalizado, es adecuado para demostrar el ciclo completo de preentrenamiento, evaluación y análisis de un modelo de lenguaje en cursos o talleres.
- Pruebas de infraestructura de entrenamiento: su rápido entrenamiento (27 minutos) lo convierte en un candidato para validar pipelines de datos, configuraciones de optimizador o cambios en el código de modelado antes de escalar a modelos mayores.
- Benchmark de referencia para la familia LowOnMind: los resultados de pérdida, perplejidad y bits por carácter son directamente comparables con los de LowOnMind-300k y LowOnMind-1M, lo que permite trazar curvas de escalado y detectar anomalías en el comportamiento de modelos de tamaño mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (como MMLU, HumanEval o GSM8K) en la información disponible. La model card solo reporta métricas de lenguaje no condicionado, comparables dentro de la familia LowOnMind:

| Metrica | LowOnMind-300k | LowOnMind-1M | LowOnMind-5M |
|---|---:|---:|---:|
| Pérdida de validación | 3,2982 | 2,9908 | 2,5828 |
| Perplejidad de validación | 27,06 | 19,90 | 13,23 |
| Bits por carácter | 2,030 | 1,836 | 1,586 |
| Tasa de palabras reales | no disponible | 98,0% | 96,3% |

El modelo aún no ha sido evaluado en el benchmark BananaMind Base Bench 1.1, a diferencia de sus hermanos menores que obtienen Elo 833 (26,6% de precisión) y Elo 843 (28,9%), respectivamente, sin superar significativamente el azar (suelo de Elo 805 y 25,0%).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4,9M de parámetros en float16 (~9,8 MB de pesos). Incluso con el recálculo completo de la ventana en cada paso (sin KV cache), el uso de memoria es inferior a 1 GB en la práctica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Se entrenó en una Tesla T4 (16 GB), pero una GPU de consumo como una GTX 1650 o incluso CPU es viable para inferencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: al requerir `trust_remote_code=True` y no tener caché KV, las opciones estándar como vLLM, TGI u Ollama no son aplicables directamente. Se recomienda usar la API de Transformers con el código personalizado del repositorio.
- Latencia y rendimiento: no se han publicado mediciones formales. Dado el tamaño, la generación de 64 tokens debería completarse en menos de un segundo en GPU, pero el coste cuadrático por la ausencia de caché KV limita la longitud práctica de generación.

## Comparativa con modelos similares

La comparación más directa es con los otros miembros de la familia LowOnMind, ya que comparten tokenizador, dataset, presupuesto de tokens y forma de programación de aprendizaje:

| Modelo | Parametros | Contexto | Vocabulario | Pérdida de validación | Perplejidad | Bits/carácter |
|---|---|---:|---:|---:|---:|---:|
| LowOnMind-300k | 296.960 | 512 | 1024 | 3,2982 | 27,06 | 2,030 |
| LowOnMind-1M | 985.152 | 512 | 1024 | 2,9908 | 19,90 | 1,836 |
| LowOnMind-5M | 4.920.384 | 512 | 1024 | 2,5828 | 13,23 | 1,586 |

No se dispone de datos de otros modelos de ~5M parámetros con los que comparar directamente en las mismas condiciones. Modelos como GPT-2 small (124M) o TinyLlama (1,1B) operan en escalas muy superiores y con vocabularios más amplios, por lo que cualquier comparación sería engañosa. La comparativa con modelos de tamaño similar disponibles en Hugging Face requeriría datos que no están publicados en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo utilizable en producción: no ofrece coherencia fiable más allá de un párrafo, ni conocimiento factual verificable.
- El vocabulario de 1024 tokens es extremadamente limitado: el modelo debe componer la mayoría de las palabras a partir de fragmentos, lo que penaliza la fluidez y la precisión léxica.
- Sin caché KV: la generación es cuadráticamente costosa en longitud de secuencia y el código no está optimizado para despliegue.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; se debe auditar antes de usar en entornos no aislados.
- Solo soporta inglés; cualquier otro idioma producirá resultados degradados o sin sentido.
- Riesgo de alucinación alto: al carecer de conocimiento factual, las respuestas pueden ser gramaticalmente plausibles pero completamente inventadas.
- La tasa de palabras reales (96,3%) es ligeramente inferior a la de su hermano menor LowOnMind-1M (98,0%), lo que sugiere que el aumento de parámetros no se tradujo en una mejora léxica.
- No se han realizado evaluaciones de sesgos ni de seguridad; el modelo se entrenó sin filtros adicionales más allá del propio corpus de fineweb-edu.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones funcionales hacen que no sea práctico para aplicaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DedeProGames/LowOnMind-5M
- Modelo hermano LowOnMind-300k: https://huggingface.co/DedeProGames/LowOnMind-300k
- Modelo hermano LowOnMind-1M: https://huggingface.co/DedeProGames/LowOnMind-1M
- Perfil del autor en Hugging Face: https://huggingface.co/DedeProGames
- Perfil del autor en Ollama: https://ollama.com/DedeProGames
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
