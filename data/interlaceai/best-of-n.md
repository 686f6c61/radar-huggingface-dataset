# InterlaceAI/best-of-n

## Resumen

InterlaceAI/best-of-n no es un modelo de lenguaje, sino una librería de inferencia que implementa la técnica de muestreo *best-of-n* (también conocida como *test-time compute* o *inference-time compute*) para mejorar el rendimiento de cualquier modelo causal de lenguaje sin modificar sus pesos. Desarrollada por Interlace AI, la librería genera N trayectorias de razonamiento a partir de un modelo congelado y selecciona la mejor respuesta mediante distintos selectores: voto mayoritario, auto-certidumbre basada en log-probabilidades, o un verificador aprendido. El objetivo es cerrar la brecha entre la cobertura (pass@N) y la precisión final, un problema conocido como *selection gap*.

La relevancia actual radica en que ofrece una alternativa al escalado de parámetros: en lugar de entrenar modelos más grandes, se invierte cómputo en tiempo de inferencia. Los resultados publicados muestran mejoras sustanciales en razonamiento matemático y científico. Por ejemplo, con DeepSeek-R1-Distill-Qwen-1.5B en AIME 2024, la precisión pasa de 23,3% con una sola muestra a 83,3% de cobertura con N=128, y el voto mayoritario alcanza 53,3%. La librería es agnóstica al modelo, funciona con cualquier LM causal y permite configurar N libremente. Está publicada bajo licencia Apache 2.0 y su código está disponible en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (libreria de inferencia sobre cualquier LM causal) |
| Parametros totales | No aplica (depende del modelo base) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo base) |
| Tipos de cuantizacion | No aplica (depende del modelo base) |
| Idiomas soportados | Ingles (los modelos base pueden soportar otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (codigo Python, no pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un método de inferencia. La librería implementa el paradigma *best-of-n*: dado un problema, se muestrean N trayectorias de razonamiento del modelo base (con temperatura > 0) y se selecciona la respuesta final mediante un selector. Los selectores disponibles son:

- `majority`: voto mayoritario entre las N respuestas.
- `self_certainty`: usa la log-probabilidad media de cada trayectoria como medida de confianza.
- `verifier`: un callable externo que puntúa cada trayectoria (p. ej., un modelo verificador entrenado).
- `verifier_argmax`: selecciona la trayectoria con mayor puntuación del verificador.
- `oracle`: usa la respuesta dorada (solo diagnóstico).

La librería incluye un mecanismo de *minority rescue*: cuando el voto mayoritario descarta una respuesta correcta que está en minoría, un verificador puede recuperarla. El coste computacional es lineal en N, y se recomienda usar vLLM como backend para N grandes. No hay entrenamiento de pesos; todo el beneficio proviene de la estrategia de selección.

## Capacidades

- Generación de múltiples trayectorias de razonamiento a partir de un mismo prompt.
- Selección de respuesta mediante voto mayoritario, auto-certidumbre o verificador externo.
- Soporte para cualquier modelo causal de lenguaje (HuggingFace o ruta local).
- Extracción de respuestas en formatos variados: `boxed`, `number`, `letter`, `regex` o callable personalizado.
- Reutilización de muestras generadas con distintos selectores sin coste adicional de generación.
- Medición de cobertura (pass@N) y de la brecha de selección (*selection gap*).
- Reproducibilidad: incluye trayectorias guardadas y un script de verificación que reproduce los resultados publicados.
- Integración con backends `vllm` y `transformers`.

## Casos de uso

- Razonamiento matemático competitivo: dado un problema de olimpiada (p. ej., AIME), se generan N=128 soluciones y se selecciona la mejor con un verificador. La librería extrae la respuesta final de cada trayectoria y aplica el selector, logrando mejoras de hasta +60 puntos en AIME 2024 con un modelo de 1.5B.
- Evaluación de modelos en tareas de opción múltiple: se puede usar el selector `letter` para extraer la opción elegida en cada muestra y combinar con voto mayoritario o verificador, útil para benchmarks como GPQA-Diamond.
- Verificación de respuestas en dominios científicos: un verificador entrenado (o un LLM más grande) puntúa cada trayectoria generada por un modelo pequeño, permitiendo desplegar modelos ligeros con precisión cercana a la de modelos grandes.
- Control de calidad en generación de código: se generan N soluciones a un problema de programación y se selecciona la que pasa más tests (verificador basado en ejecución), reduciendo errores en pipelines de CI/CD.
- Investigación en *test-time compute*: la librería permite medir la cobertura y la brecha de selección en tareas propias, comparando selectores y calibrando N según presupuesto.
- Sistemas de respuesta a preguntas con contexto largo: al muestrear múltiples respuestas y votar, se reduce la varianza y se mejora la robustez frente a alucinaciones en tareas de extracción de hechos.

## Benchmarks y rendimiento

La model card publica resultados medidos con DeepSeek-R1-Distill-Qwen-1.5B, sin modificar pesos. Se presentan dos tablas:

**AIME 2024 (90 problemas):**

| N | Majority vote | Coverage (pass@N) |
|---:|---:|---:|
| 1 | 23,3% | 23,3% |
| 8 | 40,0% | 60,0% |
| 32 | 50,0% | 73,3% |
| 128 | 53,3% | 83,3% |

**Comparativa por dominio (N=32, selector por defecto):**

| Benchmark | Single sample | Con Best-of-N | Δ |
|---|---|---:|---:|
| AIME 2024 | 23,3% | 83,3% (cobertura) | +60,0 |
| GPQA-Diamond | 33,8% | 43,4% | +9,6 |
| GSM8K | 87,2% | 92,8% | +5,6 |

**Efecto del selector (N=32, 90 problemas AIME):**

| Selector | Accuracy |
|---|---:|
| Self-certainty | 18,9% |
| Majority vote | 35,6% |
| Verifier — argmax trajectory | 43,3% |
| Verifier — confidence-weighted vote | 52,2% |

La librería incluye un script de verificación que reproduce exactamente los valores publicados (30/30 reproducciones correctas, 40 tests unitarios sin GPU).

## Requisitos de hardware

- Depende del modelo base elegido. Para N pequeño (≤8) y modelos ≤1.5B, una GPU consumer con 8-12 GB de VRAM es suficiente (p. ej., RTX 3060/4060).
- Para N=32 o superior con modelos de 7-8B, se recomienda una GPU con al menos 24 GB (RTX 3090/4090) o usar vLLM con cuantización.
- Para N=128 con modelos grandes, se necesitan GPUs de datacenter (A100 40/80 GB, H100) o múltiples GPUs.
- Backend recomendado: `vllm` para N grande (mayor throughput). El backend `transformers` es viable para N pequeños.
- La generación es el cuello de botella: el coste es lineal en N. Con vLLM, un modelo 1.5B puede generar ~128 trayectorias en pocos minutos en una RTX 4090.
- No se requiere GPU para ejecutar los tests unitarios ni el script de verificación.

## Comparativa con modelos similares

No es un modelo, sino un método. La comparativa relevante es frente a otras estrategias de *inference-time compute*:

| Metodo | Necesita entrenamiento | Recupera respuesta minoritaria correcta | Coste adicional |
|---|---|---|---|
| Muestreo unico | No | No | 0 |
| Voto mayoritario (self-consistency) | No | No | N generaciones |
| Best-of-N con verificador (esta libreria) | Verificador opcional | Si | N generaciones + verificacion |
| Tree search (p. ej., MCTS) | No | Parcial | Mucho mayor |

Frente a *self-consistency* clásico, esta librería añade selectores basados en verificador que pueden rescatar respuestas correctas en minoría, lo que supone una mejora de hasta +16,6 puntos en AIME 2024 (52,2% vs 35,6% con voto mayoritario). Frente a *tree search*, el coste es menor y la implementación más simple, aunque el techo de rendimiento depende de la cobertura del modelo base.

## Limitaciones y advertencias

- La cobertura es un límite duro: si el modelo nunca genera la respuesta correcta, ningún selector la recupera (pass@N = 0 cuando p = 0).
- El coste es lineal en N: N=128 implica 128 generaciones completas. Sin vLLM, el tiempo puede ser prohibitivo.
- Requiere tareas con respuesta extraíble y comparable (numérica, opción múltiple, etc.). No es adecuado para generación abierta sin un criterio de votación definido.
- Los errores del verificador se amplifican: la calidad del selector está acotada por la calidad del verificador.
- La librería está documentada en inglés; la model card solo declara soporte para inglés, aunque el método es independiente del idioma del modelo base.
- No hay garantías de rendimiento en dominios no evaluados; los benchmarks publicados se limitan a AIME, GPQA-Diamond y GSM8K con un único modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base elegido puede tener su propia licencia (p. ej., DeepSeek-R1-Distill-Qwen-1.5B es MIT, Llama tiene licencia específica).

## Enlaces

- HuggingFace: https://huggingface.co/InterlaceAI/best-of-n
- DOI del informe técnico: https://doi.org/10.5281/zenodo.21936833
- Documentación de uso (USAGE.md): referenciada en la model card, no se proporciona URL directa.
- Repositorio de código: no se indica URL explícita en la información disponible.
