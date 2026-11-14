# lemoncmd/duo-scaling-medium

## Resumen

Duo-scaling-medium es un conjunto de diez modelos de difusión discreta de estado uniforme (uniform-state discrete diffusion) entrenados por el autor independiente lemoncmd bajo el identificador `duo_base`. No se trata de un modelo único listo para producción, sino de una cuadrícula experimental de checkpoints diseñada para estudiar leyes de escalado respecto a la fracción de datos de entrenamiento. Los diez modelos son idénticos en arquitectura y configuración (backbone DiT de 424.477.010 parámetros, contexto de 1.024 tokens, tokenizador GPT-2 con vocabulario de 50.258 entradas) y solo difieren en el tamaño del subconjunto anidado de OpenWebText utilizado: del 10 % al 100 % en incrementos del 10 %.

El interés técnico reside en que cada carpeta incluye checkpoints completos sobre una rejilla fija de pasos (hasta 53 checkpoints al alcanzar 1M de pasos), con pesos brutos, pesos EMA, estado del optimizador y estado del sampler, además de métricas de entrenamiento y validación, normas de pesos por paso y metadatos de ejecución. Esto permite analizar la trayectoria completa de entrenamiento, por ejemplo la relación entre pérdida de test y norma de pesos, en la línea del trabajo de D'Amico, Bocchi y Negri sobre sesgo implícito y leyes de escalado.

En el momento de la publicación de la model card, el entrenamiento seguía en curso con un objetivo de 1.000.000 de pasos. El repositorio ocupa 1.739,6 GB, no registra descargas ni likes, y no está pensado como modelo de inferencia general sino como material de investigación reproducible sobre difusión discreta y escalado de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DiT (Diffusion Transformer) con difusión discreta de estado uniforme (`duo_base`) |
| Parametros totales | 424.477.010 en el backbone |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints PyTorch/bf16) |
| Idiomas soportados | no disponible (entrenado sobre OpenWebText, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch Lightning (`.ckpt`) con pesos brutos, EMA, estado del optimizador y del sampler |
| Tokenizador | GPT-2, vocabulario de 50.258 |
| Dataset | Skylion007/openwebtext (revisión `79d93d7`), 8.730.942 bloques de entrenamiento de 1.024 tokens |
| Pasos objetivo | 1.000.000 (entrenamiento en curso en la model card) |
| Precisión de entrenamiento | bf16 con precisión mixta |

## Arquitectura y entrenamiento

El backbone es un DiT (Diffusion Transformer) con configuración `medium`, embeddings de entrada y salida no atados (untied), y una ruta de condicionamiento temporal separada de la ruta de tokens. El algoritmo es `duo_base`: difusión discreta de estado uniforme entrenada sobre el NELBO exacto con un schedule de ruido log-lineal, sin currículum ni destilación. El contexto está fijado en 1.024 tokens y el tokenizador es el de GPT-2.

La optimización es idéntica en los diez modelos: AdamW con tasa de aprendizaje 3e-4 constante tras 2.500 pasos de warm-up, weight decay 0, clipping de gradiente 1.0, EMA con decaimiento 0.9999, precisión mixta bf16, batch global de 512 secuencias de 1.024 tokens y semilla 1. Los datos son subconjuntos anidados de OpenWebText generados a partir de una permutación fija (semilla 20250927, sha256 registrado en `run_info.json`), de modo que la fracción 0.1 está contenida en la 0.2, y así sucesivamente. El orden de los datos depende solo del paso del optimizador, no del layout de GPUs.

La innovación metodológica es la rejilla de checkpoints: 53 checkpoints por fracción al llegar a 1M de pasos (pasos 0, 100, 200, 400, 700, 1k, 1.5k, 2.5k, 4k, 6k, 10k, 15k, 20k y después cada 25k). Cada checkpoint permite reanudar el entrenamiento de forma exacta. Además se publican normas de pesos cada 500 pasos (brutas y EMA) con normas espectrales, de Frobenius, L1, (2,1) por filas y columnas en float64, y la complejidad espectral de Bartlett `log_R`. El código es una versión modificada de `s-sahoo/duo` (rama scaling-study, commit `7c9e7d04d4a4`).

Resultados de validación NELBO reportados en la model card (EMA, split completo de validación de 110.464 bloques, ruido fijo, cada 5.000 pasos):

| Fracción | Bloques de entrenamiento | Paso | Épocas | Val NELBO (nats/token) | Horas de entrenamiento |
|---|---|---|---|---|---|
| 0.1 | 873.094 | 325.000 | 191 | 3,0383 | 155 |
| 0.2 | 1.746.188 | 350.000 | 103 | 3,0142 | 173 |
| 0.3 | 2.619.283 | 275.000 | 54 | 3,0438 | 138 |
| 0.4 | 3.492.377 | 325.000 | 48 | 3,0191 | 159 |
| 0.5 | 4.365.471 | 625.000 | 73 | 2,9651 | 307 |
| 0.6 | 5.238.565 | 275.000 | 27 | 3,0327 | 138 |
| 0.7 | 6.111.659 | 275.000 | 23 | 3,0296 | 133 |
| 0.8 | 6.984.754 | 275.000 | 20 | 3,0287 | 139 |
| 0.9 | 7.857.848 | 275.000 | 18 | 3,0334 | 135 |
| 1.0 | 8.730.942 | 275.000 | 16 | 3,0420 | 133 |

## Capacidades

- Generación de texto mediante muestreo iterativo de difusión discreta sobre secuencias de hasta 1.024 tokens.
- Modelado de lenguaje no autorregresivo: la verosimilitud se calcula vía NELBO, no vía probabilidad autorregresiva exacta.
- Evaluación de leyes de escalado: permite medir pérdida de validación frente a fracción de datos, pasos y horas de cómputo.
- Análisis de dinámica de pesos: normas por matriz, normas espectrales y complejidad de Bartlett `log_R` a lo largo del entrenamiento.
- Reanudación exacta del entrenamiento desde cualquier checkpoint (incluye estado del optimizador y del sampler).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no documentada; el corpus de entrenamiento es OpenWebText, mayoritariamente en inglés.

## Casos de uso

- Estudio de leyes de escalado en datos: comparar la curva de `val/nll` frente a la fracción de OpenWebText (0.1 a 1.0) con arquitectura y presupuesto de pasos fijos, aislando el efecto del tamaño del dataset.
- Investigación en difusión discreta: analizar cómo evoluciona el NELBO con el schedule log-lineal de ruido y sin currículum, usando los checkpoints intermedios de cada fracción.
- Análisis de sesgo implícito y normas de pesos: usar `norms_raw.jsonl` y `norms_ema.jsonl` para reproducir estudios del tipo D'Amico, Bocchi y Negri sobre pérdida de test frente a norma de pesos.
- Reproducibilidad de entrenamiento: reanudar desde cualquier checkpoint con estado de optimizador y sampler para verificar resultados bit a bit bajo el mismo orden de datos.
- Benchmarking de infraestructura: comparar horas de entrenamiento entre segmentos H100 y H200 (registrados en `segments.jsonl`) y normalizar por tipo de GPU.
- Estudio de estabilidad numérica: los segmentos con GPU defectuosa (alphagpu08, pérdidas NaN) y su recuperación desde el último checkpoint limpio sirven como caso de tolerancia a fallos en entrenamiento distribuido.
- Base para experimentos de muestreo en difusión discreta: los pesos permiten probar distintos samplers sobre un modelo de 424M parámetros entrenado con NELBO exacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único indicador de rendimiento reportado es el NELBO de validación en nats/token, recogido en la tabla de la sección de arquitectura y entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 424.477.010 parámetros, en bf16 serían aproximadamente 0,85 GB solo de pesos; en fp32, unos 1,7 GB. El estado del optimizador incluido en los checkpoints multiplica el espacio necesario para reanudar entrenamiento.
- GPU recomendadas: el autor reporta entrenamiento en H100 y H200 (mezclados por segmentos, según `segments.jsonl`).
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo; el tamaño de parámetros sugiere que cabría en GPUs con suficiente VRAM, pero no hay datos publicados de latencia ni throughput.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato publicado son checkpoints PyTorch Lightning cargados con `torch.load` y `weights_only=False`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lemoncmd/duo-scaling-medium | 424.477.010 | 1.024 | Difusión discreta (DiT, `duo_base`) | Apache 2.0 | Checkpoints en HF, entrenamiento en curso |
| s-sahoo/duo (código base) | no disponible | no disponible | Difusión discreta de estado uniforme | no disponible | Repositorio GitHub |
| GPT-2 (referencia de tokenizador y corpus) | 124M–1.5B según variante | 1.024 | Transformer autorregresivo | MIT (variante original) | Ampliamente disponible |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para producción: es una cuadrícula experimental de checkpoints para estudiar escalado de datos, con entrenamiento en curso hacia 1M de pasos.
- Contexto limitado a 1.024 tokens, insuficiente para la mayoría de aplicaciones conversacionales o de documentos largos.
- El corpus es OpenWebText, predominantemente en inglés; no hay evaluación multilingüe documentada.
- Riesgo de alucinación y sesgos: no evaluado en la model card; al ser un modelo de difusión discreta sin ajuste por RLHF/DPO, no incorpora alineación.
- Las horas de entrenamiento mezclan segmentos H100 y H200, por lo que las comparaciones temporales entre fracciones no son directamente válidas sin normalizar por tipo de GPU.
- `trainer/loss` en las métricas depende del layout de GPUs (un micro-batch en una GPU); para comparar ejecuciones debe usarse `val/nll`.
- Algunos segmentos se ejecutaron en un nodo con GPU defectuosa (alphagpu08, pérdidas NaN); sus salidas se eliminaron y los checkpoints publicados provienen de hardware limpio.
- En `frac_0.30`, los pasos 0–2.500 se ejecutaron en un nodo con throttling, por lo que sus primeras horas de entrenamiento están infladas.
- Licencia Apache 2.0 permite uso comercial, pero el estado de entrenamiento incompleto y la ausencia de evaluaciones de calidad desaconsejan su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lemoncmd/duo-scaling-medium
- Código base: https://github.com/s-sahoo/duo
- Dataset: https://huggingface.co/datasets/Skylion007/openwebtext
