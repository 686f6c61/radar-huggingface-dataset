# lemoncmd/duo-scaling-small

## Resumen

Duo-scaling-small es una familia de diez modelos de difusión discreta para lenguaje, publicados por el usuario lemoncmd (Hugging Face) como artefacto de un estudio sobre leyes de escalado respecto al tamaño del conjunto de datos. Los diez modelos comparten exactamente la misma arquitectura y configuración de entrenamiento (backbone DiT de 169.627.218 parámetros, contexto de 1.024 tokens, tokenizador GPT-2 con vocabulario de 50.258 y embeddings no atados) y solo difieren en la fracción de OpenWebText utilizada: subconjuntos anidados del 10% al 100% de los bloques de entrenamiento.

El modelo implementa `duo_base`, un algoritmo de difusión discreta de estado uniforme entrenado sobre el NELBO exacto con un calendario de ruido log-lineal, sin currículum ni destilación. Cada uno de los diez modelos se entrenó durante 1.000.000 de pasos con AdamW (lr 3e-4, weight decay 0, gradient clipping 1.0, EMA 0.9999, bf16), batch global de 512 secuencias de 1.024 tokens y semilla 1.

Su relevancia es fundamentalmente científica: no es un modelo pensado para producción, sino un conjunto de 53 checkpoints completos por fracción (con pesos crudos, pesos EMA, estado del optimizador y estado del sampler) que permite analizar toda la trayectoria de entrenamiento, por ejemplo la relación entre pérdida de test y norma de los pesos. El repositorio ocupa 1.426,5 GB y tiene licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DiT (Diffusion Transformer) con difusión discreta de estado uniforme |
| Parametros totales | 169.627.218 (solo backbone) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (los checkpoints se distribuyen en precisión de entrenamiento, bf16 mixto) |
| Idiomas soportados | No disponible (entrenado sobre OpenWebText, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints de PyTorch Lightning (`.ckpt`) |

## Arquitectura y entrenamiento

El backbone es un DiT (Diffusion Transformer) de configuración `small`, con 169.627.218 parámetros, contexto de 1.024 tokens, tokenizador GPT-2 (vocabulario 50.258) y embeddings de entrada y salida no atados. El algoritmo es `duo_base`: difusión discreta de estado uniforme entrenada sobre el NELBO exacto con un calendario de ruido log-lineal, sin currículum ni destilación. El modelo genera texto mediante un proceso iterativo de eliminación de ruido discreto en lugar de decodificación autorregresiva.

El entrenamiento es idéntico en los diez modelos: AdamW con lr 3e-4 constante tras 2.500 pasos de warm-up, weight decay 0, gradient clipping 1.0, EMA con decaimiento 0.9999, precisión mixta bf16, batch global de 512 secuencias × 1.024 tokens, 1.000.000 de pasos y semilla 1. Los datos son OpenWebText (revisión `79d93d7`), tokenizado con GPT-2 y empaquetado en 8.730.942 bloques de 1.024 tokens; los últimos 100.000 documentos forman la partición de validación (110.464 bloques). Cada fracción *f* usa los primeros `floor(f × N + 0.5)` bloques de una permutación fija (semilla 20250927), de modo que los subconjuntos son anidados. El orden de los datos depende únicamente del paso del optimizador, no del layout de GPUs. El código es una versión modificada de [s-sahoo/duo](https://github.com/s-sahoo/duo) (rama scaling-study, commit `7c9e7d04d4a4`).

## Capacidades

- Generación de texto mediante difusión discreta iterativa (eliminación de ruido sobre estados uniformes), no autorregresiva.
- Modelado de lenguaje medido con NELBO (negative evidence lower bound) en nats/token.
- Entrenamiento reanudable de forma exacta: cada checkpoint incluye pesos crudos, pesos EMA, estado del optimizador y estado del bucle/sampler.
- Análisis de trayectorias de entrenamiento: 53 checkpoints por fracción en una rejilla fija de pasos (0, 100, 200, 400, 700, 1k, 1.5k, 2.5k, 4k, 6k, 10k, 15k, 20k y después cada 25k hasta 1M).
- Registro de normas de pesos cada 500 pasos, con estadísticas por matriz (norma espectral, Frobenius, L1, normas (2,1) por fila y columna en float64) y complejidad espectral de Bartlett (`log_R`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no documentadas; el corpus de entrenamiento es OpenWebText, mayoritariamente en inglés.

## Casos de uso

- Estudio de leyes de escalado respecto al tamaño del dataset: los diez modelos con subconjuntos anidados del 10% al 100% permiten ajustar curvas de pérdida frente a la fracción de datos manteniendo fija la arquitectura y el presupuesto de pasos.
- Investigación sobre sesgo implícito en curvas de aprendizaje: la rejilla de 53 checkpoints y las normas de pesos registradas cada 500 pasos permiten replicar análisis del estilo de D'Amico, Bocchi y Negri sobre la relación entre norma de pesos y pérdida de test.
- Análisis de dinámica de optimización: el estado completo del optimizador y del sampler en cada checkpoint permite reanudar entrenamientos exactos y estudiar efectos de warm-up, EMA o clipping.
- Reproducibilidad de experimentos de difusión discreta: el repositorio incluye `run_info.json`, `config_resolved.yaml`, `code_sha` y `segments.jsonl`, lo que facilita auditar cada ejecución.
- Comparación de algoritmos de difusión: al ser una implementación de `duo_base` sobre un backbone DiT estándar, sirve como línea base para evaluar variantes de calendario de ruido, currículum o destilación.
- Docencia y experimentación académica: el tamaño `small` (169,6 M de parámetros) y el contexto de 1.024 tokens hacen viable reproducir o extender los experimentos en clústeres modestos, aunque el repositorio completo requiera 1,4 TB de almacenamiento.

## Benchmarks y rendimiento

Los únicos datos publicados son los NELBO de validación (nats/token) con pesos EMA sobre la partición completa de validación de OpenWebText, con ruido fijo, evaluados cada 5.000 pasos:

| Fraccion | Bloques de entrenamiento | Epocas a 1M pasos | NELBO val a 1M | Mejor NELBO val | Horas de entrenamiento |
|---|---|---|---|---|---|
| 0.1 | 873.094 | 586 | 3,2556 | 3,2550 (paso 995.000) | 214 |
| 0.2 | 1.746.188 | 293 | 3,2413 | 3,2413 (paso 1.000.000) | 208 |
| 0.3 | 2.619.283 | 195 | 3,2342 | 3,2342 (paso 1.000.000) | 213 |
| 0.4 | 3.492.377 | 147 | 3,2471 | 3,2468 (paso 995.000) | 207 |
| 0.5 | 4.365.471 | 117 | 3,2340 | 3,2340 (paso 1.000.000) | 213 |
| 0.6 | 5.238.565 | 98 | 3,2282 | 3,2282 (paso 1.000.000) | 206 |
| 0.7 | 6.111.659 | 84 | 3,2289 | 3,2289 (paso 1.000.000) | 206 |
| 0.8 | 6.984.754 | 73 | 3,2367 | 3,2367 (paso 1.000.000) | 207 |
| 0.9 | 7.857.848 | 65 | 3,2334 | 3,2334 (paso 1.000.000) | 204 |
| 1.0 | 8.730.942 | 59 | 3,2283 | 3,2283 (paso 1.000.000) | 210 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 169,6 M de parámetros, en bf16 los pesos ocupan aproximadamente 0,34 GB y en fp32 unos 0,68 GB, a lo que hay que sumar activaciones y el bucle de muestreo de difusión.
- GPU de entrenamiento utilizadas: mezcla de H100 y H200 (cada segmento registra su GPU en `segments.jsonl`); entre 204 y 214 horas por modelo según la fracción.
- GPU consumer: el tamaño del modelo sugiere que cabe en GPUs consumer con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB), aunque no se documentan requisitos oficiales.
- Almacenamiento: el repositorio completo ocupa 1.426,5 GB; cada checkpoint incluye pesos crudos, EMA, estado del optimizador y del sampler.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; los pesos se cargan con `torch.load` sobre checkpoints de PyTorch Lightning.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Duo-scaling-small (este) | 169,6 M | 1.024 | Difusión discreta (DiT, `duo_base`) | Apache 2.0 | Hugging Face, 10 modelos × 53 checkpoints |
| Modelos autorregresivos tipo GPT-2 small | ~124 M | 1.024 | Autorregresivo | Varía (MIT en GPT-2) | Amplia |
| Modelos de difusión de texto tipo Diffusion-LM | ~100-200 M | ~1.024 | Difusión continua | Varía | Repositorios de investigación |

No se dispone de datos de benchmarks comparables publicados en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y paradigma.

## Limitaciones y advertencias

- No es un modelo para producción: es un artefacto de investigación sobre leyes de escalado, con diez variantes que solo difieren en la fracción de datos.
- Sesgos: entrenado exclusivamente sobre OpenWebText, un corpus de enlaces de Reddit, con los sesgos propios de ese contenido; no se documenta ninguna mitigación.
- Riesgo de alucinación: no evaluado; no hay datos de calidad de generación ni de fidelidad factual.
- Idiomas: no se documenta soporte multilingüe; el corpus es mayoritariamente inglés.
- Contexto limitado a 1.024 tokens, insuficiente para muchas aplicaciones prácticas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para ello y el repositorio exige 1,4 TB de almacenamiento.
- Las horas de entrenamiento mezclan segmentos en H100 y H200; para comparaciones temporales deben usarse pasos o normalizar por tipo de GPU.
- La métrica `trainer/loss` depende del layout de GPUs (un micro-batch en una GPU); para comparar ejecuciones debe usarse `val/nll`.
- `log_R` es nulo en el paso 0 porque la capa de salida arranca a cero.

## Enlaces

- Hugging Face: https://huggingface.co/lemoncmd/duo-scaling-small
- Código base (rama scaling-study, commit `7c9e7d04d4a4`): https://github.com/s-sahoo/duo
- Dataset OpenWebText (revisión `79d93d7`): https://huggingface.co/datasets/Skylion007/openwebtext
