# EphAsad/CARMA-4M-v0.3

## Resumen

CARMA-4M-v0.3 (Contributor-Aware Residual Memory Architecture) es un modelo de lenguaje causal experimental de 3,79 millones de parámetros desarrollado por el usuario EphAsad. No es un transformer convencional: sustituye el flujo residual único por cuatro carriles de memoria residual (uno ancla y tres auxiliares) con lectores adaptativos, actualizadores de corrección centrados en cero y un mecanismo diferenciable de seguimiento de procedencia computacional y estado de confianza. El modelo se publica como instantánea de investigación, no como reemplazo de producción.

El modelo se entrenó sobre el dataset TinyStories (karpathy/tinystories-gpt4-clean) con un vocabulario de 50.257 tokens y una longitud de contexto máxima de 256 tokens. Su relevancia es puramente investigadora: explora si múltiples carriles residuales y controles adaptativos pueden mejorar el modelado de lenguaje en modelos pequeños a costa de mayor latencia. En el experimento original registrado, CARMA v0.3 alcanzó una perplejidad de test de 16,96 frente a 22,37 de un transformer vanilla con parámetros equivalentes, una reducción del 24,2 %, pero con aproximadamente 5 veces la latencia de batch del baseline.

La arquitectura no es compatible directamente con `transformers.AutoModelForCausalLM`; requiere el archivo `carma_v03.py` y el cargador incluidos en el repositorio. La licencia es Apache 2.0 y el único idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con 4 carriles de memoria residual (1 ancla + 3 auxiliares), lectores adaptativos, normalización adaptativa y seguimiento de procedencia/confianza |
| Parametros totales | 3.788.279 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone utiliza autoatención causal con producto escalar escalado, bloques feed-forward con activación GELU y computación residual estilo Pre-LN. La innovación principal reside en los cuatro carriles de memoria residual: para cada subcapa de atención o MLP, un lector adaptativo construye la entrada mezclando LayerNorm, el estado sin normalizar y RMSNorm mediante compuertas `tanh` acotadas y centradas en cero, condicionadas por el estado del carril, el estado ancla, un resumen de procedencia, la confianza y la identidad de carril. Tras el cálculo del contribuyente, cada carril se actualiza con controles de olvido, reemplazo y adición también acotados y centrados en cero. La inicialización es equivalente a la de un transformer vanilla: las proyecciones de los controladores y los parámetros de corrección global se inicializan a cero, de modo que el cómputo inicial se reduce a la actualización residual estándar.

El modelo incorpora además un vector de procedencia diferenciable sobre 17 fuentes (la incrustación de entrada y el contribuyente de atención/FFN de cada una de las 8 capas) y un estado latente de confianza acotado que se usa para el enrutamiento. El autor advierte explícitamente que estos son diagnósticos computacionales internos, no citas factuales, evidencia externa, confianza calibrada ni garantías de seguridad. Los datos de entrenamiento provienen de TinyStories (karpathy/tinystories-gpt4-clean); no se especifica en la información disponible el número exacto de tokens, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto causal en inglés, orientada a narrativas sencillas propias del corpus TinyStories.
- Razonamiento básico y modelado de lenguaje a pequeña escala; no se documentan capacidades de código, matemáticas o visión.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: seguimiento interno diferenciable de procedencia computacional y estado de confianza (diagnósticos internos, no evidencia externa ni confianza calibrada).
- No es un modelo de producción: el autor lo describe como instantánea de investigación.

## Casos de uso

- Investigación sobre arquitecturas residuales: el modelo sirve como banco de pruebas controlado para estudiar si múltiples carriles de memoria residual mejoran la perplejidad en modelos pequeños frente a un transformer vanilla con parámetros equivalentes.
- Experimentos de normalización adaptativa: permite evaluar la mezcla de LayerNorm, RMSNorm y estado sin normalizar mediante compuertas acotadas en un entorno de 3,79 M de parámetros y contexto de 256 tokens.
- Estudio de procedencia computacional: el vector de procedencia sobre 17 fuentes permite analizar qué subcapas contribuyen a una representación, siempre como diagnóstico interno y no como cita factual.
- Reproducción de experimentos de TinyStories: útil para replicar la comparación registrada (perplejidad de test 16,96 frente a 22,37 del vanilla equivalente) y comprobar la estabilidad del entrenamiento desde una inicialización equivalente a vanilla.
- Docencia y divulgación: modelo pequeño y ligero para explicar mecanismos de memoria residual, enrutamiento y controles centrados en cero en cursos o talleres.
- Prototipado de investigación en eficiencia: permite medir el coste en latencia (aproximadamente 5 veces la del vanilla en el microbenchmark registrado) frente a la ganancia en perplejidad, como paso previo a decidir si la arquitectura merece escalarse.

## Benchmarks y rendimiento

Resultados del experimento original registrado en `final_results.json` del archivo v0.3, sobre TinyStories:

| Modelo | Parámetros | Validation loss | Validation perplexity | Test loss | Test perplexity |
|---|---:|---:|---:|---:|---:|
| Vanilla, backbone exacto | 3.632.832 | 3,14147 | 23,13796 | 3,15439 | 23,43874 |
| Vanilla, parámetros equivalentes | 3.789.696 | 3,09463 | 22,07910 | 3,10771 | 22,36975 |
| CARMA v0.3 | 3.788.279 | 2,81691 | 16,72509 | 2,83079 | 16,95888 |

La perplejidad de test de CARMA v0.3 es un 24,19 % inferior a la del vanilla con parámetros equivalentes. El microbenchmark adjunto midió aproximadamente 5 veces la latencia de batch de ese baseline. El autor subraya que se trata de un único experimento controlado y no de una prueba de mejora general en otros datasets, semillas o presupuestos de cómputo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 3,79 M de parámetros; el repositorio ocupa 0,0 GB según Hugging Face.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) es sobradamente suficiente; también cabe en CPU.
- Cabe en consumer GPU: sí, en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: no es compatible con `transformers.AutoModelForCausalLM`; requiere el archivo `carma_v03.py` y el cargador incluidos en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor registra aproximadamente 5 veces la latencia de batch de un transformer vanilla con parámetros equivalentes en su microbenchmark; no se proporcionan cifras absolutas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad de test (TinyStories) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| CARMA v0.3 | 3.788.279 | 256 | 16,96 | Apache 2.0 | Hugging Face (EphAsad/CARMA-4M-v0.3) |
| Vanilla transformer, parámetros equivalentes | 3.789.696 | No disponible | 22,37 | No disponible | Baseline del experimento |
| Vanilla transformer, backbone exacto | 3.632.832 | No disponible | 23,44 | No disponible | Baseline del experimento |

No se dispone de información sobre otros modelos comparables de la misma categoría (transformers experimentales de menos de 10 M de parámetros) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo describe como instantánea de investigación, no como reemplazo de producción ni como alternativa eficiente en cómputo a un transformer.
- Evidencia limitada: los resultados provienen de un único experimento controlado sobre TinyStories; no hay prueba de mejora general en otros datasets, semillas o presupuestos de cómputo.
- Latencia: aproximadamente 5 veces la latencia de batch de un vanilla equivalente en el microbenchmark registrado.
- Contexto muy corto: 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Idioma: solo inglés declarado.
- Procedencia y confianza: los vectores de procedencia y el estado de confianza son diagnósticos computacionales internos, no citas factuales, evidencia externa, confianza calibrada ni garantías de seguridad.
- Riesgo de alucinación: no evaluado en la información disponible; el corpus TinyStories es de narrativas simples, lo que limita la generalización.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- Compatibilidad: no es un `transformers.AutoModelForCausalLM` estándar; requiere código propio (`carma_v03.py`) y un cargador específico.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; ecosistema y soporte comunitario inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/EphAsad/CARMA-4M-v0.3
- Dataset TinyStories (karpathy/tinystories-gpt4-clean): https://huggingface.co/datasets/karpathy/tinystories-gpt4-clean
- Paper de referencia citado en los tags (arXiv:2305.07759): https://arxiv.org/abs/2305.07759
- DOI del modelo: https://doi.org/10.57967/hf/11794
