# ryan1145/mob-qwen3.5-2b-swiglu

## Resumen

`mob-qwen3.5-2b-swiglu` es una cabeza de salida (output head) compacta basada en una mezcla de Bernoulli (Mixture-of-Bernoullis, MoB) desarrollada por el usuario ryan1145 dentro del proyecto MoB_Head. No se trata de un modelo de lenguaje completo, sino de un artefacto que sustituye la capa de proyección final de un backbone congelado, en este caso `Qwen/Qwen3.5-2B`. El objetivo es representar la distribución del siguiente token mediante códigos binarios semánticos indexados por token-ID, en lugar de una matriz de vocabulario densa convencional.

La propuesta encaja en la línea de investigación sobre cabezas de salida eficientes y decodificación especulativa: reduce el coste computacional de la capa final mediante un cuello de botella de 128 bits y un codebook semántico, y se entrena por destilación de conocimiento desde el profesor (el propio Qwen3.5-2B). El artefacto publicado contiene únicamente los pesos de la cabeza (49,8 millones de parámetros) y el codebook, con serialización en safetensors fp32.

Es relevante ahora porque explora una vía poco habitual para acelerar la generación sin modificar el backbone, y porque publica métricas de fidelidad respecto al profesor (recall@32 y ratio de perplejidad normalizada) que permiten evaluar su utilidad real antes de integrarlo. No obstante, su adopción requiere el código de carga de MoB_Head y no es compatible con `AutoModelForCausalLM`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de salida Mixture-of-Bernoullis (familia `swiglu`), 1 bloque, h=2048, hidden=7300, k=128, m=18 |
| Parametros totales | 49.838.464 (solo la cabeza; el backbone Qwen3.5-2B es una dependencia aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (definida por el backbone Qwen3.5-2B, no por la cabeza) |
| Tipos de cuantizacion | no disponible (publicado en fp32 safetensors) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, sin estado del optimizador) |

## Arquitectura y entrenamiento

La cabeza sustituye la proyección lineal final del transformer por una mezcla de Bernoulli sobre un espacio de códigos binarios de 128 bits (k=128). La configuración registrada es `{"blocks": 1, "h": 2048, "hidden": 7300, "k": 128, "m": 18}` con un vocabulario de 248.320 tokens. La salida se compone de logits de bits y logits de mezcla (`bit_logits, mixture_logits = head(h)`), que se decodifican mediante los decodificadores de código de `mob.mob_common`. El backbone permanece congelado y no se incluye en el repositorio.

El entrenamiento es una destilación de conocimiento que minimiza la NLL de códigos ponderada por las probabilidades exactas del profesor sobre su soporte top-1024 renormalizado, sin objetivos muestreados ni ruido continuo. Se realizaron 224.000 actualizaciones (de 244.000 programadas) con batch 16, longitud de secuencia 512, schedule coseno, pico de learning rate 0,001 y warmup de 4.000 pasos. Los datos de entrenamiento son 50% FineWeb-Edu, 30% CCI3-HQ, 15% The Stack v3 y 5% SmolTalk. Como controles de estabilidad se emplean inicialización de vértices, regularización de entropía de la mezcla y annealing de temperatura de la mezcla.

## Capacidades

- Predicción del siguiente token sobre el backbone Qwen3.5-2B mediante códigos binarios semánticos y una mezcla de Bernoulli.
- Destilación de la distribución del profesor con alta fidelidad en el soporte top-1024 (recall@32 entre 0,942 y 0,985 según dominio).
- Soporte de decodificación en cascada (cascade reranking) cuando se dispone de las filas correspondientes de la tabla de salida nativa.
- Decodificación independiente mediante los decodificadores de código de `mob.mob_common`.
- Cobertura multilingüe limitada a inglés y chino, según la model card.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido por sí misma; estas capacidades dependerían del backbone.
- No es cargable con `AutoModelForCausalLM`; requiere el cargador `mob.hub.load_head`.

## Casos de uso

- Investigación en cabezas de salida eficientes: permite reproducir y extender los experimentos de MoB_Head sobre un backbone Qwen3.5-2B congelado, comparando fidelidad y velocidad frente a la cabeza nativa.
- Decodificación especulativa en cascada: la cabeza propone candidatos de código que se reranquean con la tabla nativa, reduciendo el número de evaluaciones completas de la capa de salida en pipelines de generación.
- Evaluación de destilación de distribuciones: sirve como banco de pruebas para medir recall@32 y perplejidad normalizada frente al profesor en dominios de inglés, chino, código e instrucciones.
- Prototipado de decodificación de bajo coste: en entornos con restricciones de memoria, la cabeza de 49,8 millones de parámetros puede sustituir temporalmente la matriz de vocabulario completa durante fases de exploración.
- Análisis de drift en generación larga: útil para estudiar cómo se degrada la aproximación del profesor en generaciones extensas y calibrar mecanismos de corrección.
- Docencia y experimentación académica: el artefacto es pequeño (0,2 GB) y de licencia MIT, lo que facilita su uso en cursos y trabajos sobre modelos generativos y destilación.

## Benchmarks y rendimiento

| Metrica | en | zh | code | instruct |
|---|---|---|---|---|
| Ratio de perplejidad normalizada | 2,17 | 3,66 | 2,30 | 1,47 |
| Recall de mezcla @32 | 0,9667 | 0,9420 | 0,9503 | 0,9845 |

La perplejidad normalizada se calcula sumando sobre los códigos válidos del vocabulario, no sobre todos los vértices del hipercubo. El recall de candidatos y la concordancia de reranking son mediciones independientes. Los resultados corresponden a la actualización 224k/244k, sin asumir la finalización del schedule. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para la cabeza: aproximadamente 0,2 GB en fp32 (49,8 millones de parámetros), más el espacio del backbone Qwen3.5-2B, que debe cargarse por separado.
- GPU recomendadas: cualquier GPU con suficiente memoria para el backbone; para el backbone de 2B se recomienda al menos 8-16 GB de VRAM en precisión completa o mixta.
- Cabe en GPU de consumo: sí, la cabeza por sí sola cabe en cualquier GPU moderna; el conjunto depende del backbone.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma directa; requiere el paquete `mob` de MoB_Head y su cargador `load_head`.
- Latencia y throughput: no disponibles; la model card indica que las ganancias de velocidad dependen del hardware, el vocabulario, el batch y la ruta de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mob-qwen3.5-2b-swiglu | 49,8 M (cabeza) | no disponible | Mixture-of-Bernoullis sobre backbone Qwen3.5-2B | MIT | HuggingFace (artefacto de cabeza) |
| CFHead | no disponible | no disponible | Cabeza de salida alternativa comparada en el proyecto | no disponible | no disponible |
| Qwen/Qwen3.5-2B (cabeza nativa) | no disponible | no disponible | Proyección lineal densa estándar | según Qwen | HuggingFace |

La model card señala que la comparación del proyecto encontró un rendimiento cercano a CFHead en varios ajustes, pero sin superar su equilibrio global de aceleración. No se dispone de datos suficientes para una comparativa cuantitativa más amplia.

## Limitaciones y advertencias

- La cabeza aproxima al profesor y no preserva su distribución completa; la generación larga independiente puede derivar.
- La decodificación en cascada está limitada por el recall de las propuestas.
- Las ganancias de velocidad dependen del hardware, el vocabulario, el batch y la ruta de decodificación; no están garantizadas.
- No es un modelo completo: no puede cargarse con `AutoModelForCausalLM` ni usarse sin el backbone y el tokenizador correspondientes.
- No se debe sustituir el tokenizador ni el orden de token-ID; hacerlo invalida el codebook.
- Cobertura lingüística limitada a inglés y chino.
- Riesgo de sesgos y alucinaciones heredado del backbone y de los corpus de destilación (FineWeb-Edu, CCI3-HQ, The Stack v3, SmolTalk).
- Licencia MIT para el artefacto, pero los términos del backbone Qwen3.5-2B y de los datasets siguen aplicándose.
- No se incluyen parámetros del backbone ni texto de los corpus.

## Enlaces

- HuggingFace: https://huggingface.co/ryan1145/mob-qwen3.5-2b-swiglu
- Repositorio MoB_Head: https://github.com/ryan-he-47/MoB_Head
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
