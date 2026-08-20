# GermannM/kenga-prophet-m3

## Resumen

Kenga Prophet M3 es un modelo de lenguaje pequeño diseñado para el lenguaje de programación Kenga, un lenguaje experimental orientado a agentes de IA que se desarrolla en el repositorio GermannM3/kenga-lang. Este modelo representa la tercera iteración de una serie de modelos de predicción de tokens, y supone un salto arquitectónico respecto a sus predecesores: abandona el softmax lineal de M2.1 por un auténtico decoder transformer con embeddings aprendidos, atención causal multi-cabeza con proyecciones QKV, capa FFN con tanh, conexiones residuales y retropropagación completa. Con aproximadamente 11 100 parámetros, una ventana de contexto de 32 tokens y entrenamiento en el corpus fuente de Kenga, consigue una precisión de predicción de token en datos fuera de entrenamiento del 71,9 %, un incremento de 3,3 veces frente al 23,4 % de la versión anterior. Aunque el modelo es experimental y no produce programas válidos de forma autónoma, sirve como banco de pruebas para estudiar arquitecturas pequeñas en dominios específicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (embeddings aprendidas, atención multi-cabeza causal, FFN con tanh, residuos) |
| Parametros totales | ~11 100 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 tokens |
| Tipos de cuantizacion | No disponible (los pesos se almacenan como enteros escalados ×1000) |
| Idiomas soportados | No disponible (modelo entrenado exclusivamente con código fuente de Kenga) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (tensores en formato propio, con nombres de variables como [E_tok], [Wq], etc.) |

## Arquitectura y entrenamiento

M3 es un decoder transformer de tamaño reducido: 4 cabezas de atención con dimensión de cabeza 8, dimensión de embedding 32, y ventana de contexto 32. A diferencia de la versión anterior, usa embeddings de tokens y posiciones aprendidas, proyecciones QKV y una red feed-forward con activación tanh. El entrenamiento se realizó con Adam (lr 5e-3, betas 0.9/0.999) durante 2400 mini-batches de 256 ejemplos, sobre el corpus de código fuente de Kenga, excluyendo 9 archivos de prueba específicos. El modelo se entrena en CPU en unos 5 minutos y no requiere GPU. La arquitectura es un transformer puro, sin mecanismos de MoE ni atención lineal.

## Capacidades

- Generación de tokens de código en el lenguaje Kenga: predicción del siguiente token en secuencias de código fuente.
- Razonamiento aritmético básico dentro del dominio de Kenga: suma, resta, multiplicación, potencias, secuencias Fibonacci y máximos, con precisiones entre 60 % y 77,8 % en datos fuera de entrenamiento.
- No soporta tool calling, funciones ni agentes.
- No es multilingüe; solo procesa el vocabulario de Kenga (28 tokens).
- No dispone de modo de pensamiento explícito ni capacidades de visión o audio.

## Casos de uso

- Investigación en modelado de lenguajes de programación específicos: permite estudiar cómo un transformer pequeño aprende la sintaxis y semántica de un lenguaje de dominio específico, y comparar con arquitecturas lineales o basadas en n-gramas.
- Evaluación de arquitecturas alternativas: su pequeño tamaño y corto entrenamiento lo convierten en un banco de pruebas ideal para experimentar con cambios en la arquitectura (número de cabezas, dimensión, función de activación) y medir su impacto en la precisión de predicción.
- Generación de código de prueba para el compilador de Kenga: aunque el modelo aún no produce programas válidos, puede servir para generar secuencias de tokens que luego se validan mediante el compilador, ayudando a depurar el propio compilador.
- Educación en aprendizaje profundo: el código de entrenamiento es sencillo y se ejecuta en CPU, lo que lo hace adecuado para fines didácticos sobre transformers y entrenamiento de modelos pequeños.
- Benchmark para métodos de decodificación restringida por gramática: la baja tasa de validez estructural (0 %) indica la necesidad de técnicas como decodificación con restricciones gramaticales; el modelo puede utilizarse para probar estos métodos.
- Desarrollo incremental de una familia de modelos: M3 es un eslabón en una escalera de modelos (M2, M2.1, M3) y sirve para comparar el progreso de la precisión y la validez estructural en cada iteración.

## Benchmarks y rendimiento

La model card proporciona resultados de precisión de predicción de token en datos fuera de entrenamiento, medidos sobre 9 archivos de prueba de Kenga. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, por lo que esta tabla se limita a los datos aportados por el autor.

| Prueba | Precisión |
|---|---|
| kenga_seed_add | 76,6 % |
| kenga_seed_fact | 73,5 % |
| kenga_seed_fib | 74,1 % |
| kenga_seed_max | 60,0 % |
| kenga_seed_mul | 75,9 % |
| kenga_seed_pow | 72,5 % |
| kenga_seed_sqr | 67,5 % |
| kenga_seed_sub | 77,8 % |
| kenga_seed_sum | 71,1 % |
| **Total** | **71,9 %** |

Además, se evalúa la tasa de validez de programas generados: 0 % de los programas compila, ejecuta y produce el valor esperado. Esto indica que la generación autoregresiva aún se desvía en tokens críticos como `)`, `return`, `=` y `NUM`, con precisiones de 20–60 %.

## Requisitos de hardware

- Inferencia en CPU sin necesidad de GPU. El modelo tiene ~11 000 parámetros, por lo que la VRAM requerida es despreciable (menos de 1 MB).
- Entrenamiento completo en CPU en aproximadamente 5 minutos con Python 3.14.
- No se requiere tarjeta gráfica específica; cualquier CPU moderna es suficiente.
- Despliegue: no compatible con vLLM, llama.cpp, Ollama o TGI; el modelo se ejecuta mediante los scripts `tools/train_m3.py` y `tools/kenchat.py` del repositorio Kenga.
- Latencia y throughput: no se proporcionan datos, pero por el tamaño del modelo se espera una latencia de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (held-out) | Licencia | Disponibilidad |
|-------|------------|----------|----------------------|----------|----------------|
| Kenga M3 (este modelo) | ~11 100 | 32 | 71,9 % | Apache 2.0 | Hugging Face |
| Kenga M2.1 (K=16) | 12 540 | 16 | 23,4 % | Apache 2.0 | No publicado en HF |
| Kenga M2 (K=16) | no disponible | 16 | ~21–23 % | Apache 2.0 | No publicado |

No se dispone de información sobre otros modelos de propósito general que sean comparables en términos de arquitectura y dominio, ya que este modelo está especializado en el lenguaje Kenga.

## Limitaciones y advertencias

- El modelo no genera programas válidos en Kenga: la tasa de programas que compilan y ejecutan correctamente es 0 %.
- La precisión de tokens individuales es alta, pero la generación autoregresiva se degrada en tokens de estructura como `)`, `return`, `=`, y `NUM`.
- No es un modelo multilingüe ni general; solo procesa el vocabulario de Kenga (28 tokens).
- No hay datos de sesgos ni alucinaciones, pero al ser un modelo de dominio cerrado, los riesgos se limitan a la generación de código incorrecto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción debido a su baja validez estructural.
- El formato de pesos no es estándar (tensores enteros escalados), lo que dificulta su integración con frameworks habituales.
- No se han publicado resultados en benchmarks de referencia como MMLU, HumanEval o GSM8K.

## Enlaces

- Hugging Face: https://huggingface.co/GermannM/kenga-prophet-m3
- Repositorio del lenguaje Kenga: https://github.com/GermannM3/kenga-lang
- Ejemplos de Kenga: https://github.com/GermannM3/kenga-lang/tree/main/examples
