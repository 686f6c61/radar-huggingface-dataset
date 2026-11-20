# lemoncmd/duo-scaling-2M-tiny

## Resumen

Duo scaling-2M-tiny es un repositorio de investigación publicado por el usuario lemoncmd en Hugging Face que contiene una colección de checkpoints de modelos de difusión discreta de lenguaje, no un modelo listo para inferencia. En concreto, alberga dos ejecuciones de modelos `tiny` (33.789.010 parámetros en el backbone DiT) entrenados con el algoritmo `duo_base` de difusión discreta de estado uniforme, idénticos salvo por el tamaño del conjunto de entrenamiento (10% y 100% de los bloques de OpenWebText), y continuados desde el paso 1.000.000 hasta aproximadamente 1.300.000 pasos dentro de un estudio de leyes de escala.

El interés del artefacto es metodológico: cada carpeta incluye checkpoints completos en una rejilla fija de pasos (cada 25.000 pasos desde 1.025.000), con pesos crudos, pesos EMA, estado del optimizador y estado del sampler, además de métricas de entrenamiento y validación, normas de pesos por matriz y la permutación de datos que define los subconjuntos anidados. Esto permite reproducir exactamente el entrenamiento y analizar la trayectoria completa (por ejemplo, pérdida de test frente a norma de pesos), en la línea de trabajos sobre sesgo implícito y leyes de escala.

Es relevante ahora porque los modelos de difusión discreta para texto son una alternativa emergente a los transformers autorregresivos, y los estudios de escala con checkpoints abiertos y datos controlados escasean. No obstante, conviene subrayar que el modelo no está pensado para uso en producción: no hay pipeline declarado, no se documentan idiomas soportados y el propio autor advierte de que el estudio se detuvo antes del objetivo de 2M pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con difusión discreta de estado uniforme (`duo_base`) |
| Parametros totales | 33.789.010 (backbone, config `tiny`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints PyTorch en bf16/FP32) |
| Idiomas soportados | no disponible (entrenado sobre OpenWebText, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch Lightning (`.ckpt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El backbone es un DiT con configuración `tiny` de 33.789.010 parámetros, contexto de 1.024 tokens, tokenizador GPT-2 (vocabulario de 50.258) y embeddings no atados. El algoritmo es `duo_base`: difusión discreta de estado uniforme entrenada sobre el NELBO exacto con un schedule de ruido log-lineal, sin currículum ni destilación. La optimización usa AdamW con learning rate 3e-4 constante tras 2.500 pasos de warm-up, weight decay 0, gradient clipping 1.0, EMA con decaimiento 0.9999, precisión mixta bf16, batch global de 512 secuencias de 1.024 tokens y semilla 1.

Los datos son OpenWebText (revisión `79d93d7`), tokenizado con GPT-2 y empaquetado en bloques de 1.024 tokens: 8.730.942 bloques de entrenamiento, con los últimos 100.000 documentos reservados para validación (110.464 bloques). La fracción *f* usa los primeros `floor(f x N + 0.5)` bloques de una permutación fija (semilla 20250927), de modo que los subconjuntos son anidados. El orden de datos depende solo del paso del optimizador, no del layout de GPU. El código es una versión modificada de `s-sahoo/duo` (rama scaling-study, commit `7c9e7d04d4a4`).

Las dos ejecuciones publicadas parten del checkpoint de 1.000.000 pasos del estudio previo `duo-scaling-tiny`, con un único flag de bucle cambiado (`epoch_loop.batch_progress.is_last_batch` de True a False), que es el estado que tendría una ejecución de 2M pasos en el paso 1M. Según el autor, los pasos 1M-2M son equivalentes a los de un entrenamiento desde cero. La ejecución con fracción 0.1 alcanzó el paso 1.309.080 (762 épocas, NELBO de validación 3,9652 nats/token) y la de fracción 1.0 el paso 1.309.800 (76 épocas, NELBO 3,9849), con 200 y 197 horas de entrenamiento respectivamente.

## Capacidades

- Generación de texto mediante muestreo iterativo de difusión discreta (no autorregresivo), con decodificación basada en el sampler incluido en el estado del checkpoint.
- Modelado de lenguaje y cálculo de NELBO exacto sobre secuencias de 1.024 tokens.
- Entrenamiento reanudable de forma exacta: los checkpoints incluyen pesos crudos, EMA, estado del optimizador y estado del bucle/sampler.
- Análisis de trayectorias de entrenamiento: métricas por paso, normas de pesos por matriz (espectral, Frobenius, L1, normas (2,1) por fila y columna) y complejidad espectral de Bartlett (`log_R`).
- Estudio controlado de leyes de escala con subconjuntos de datos anidados y reproducibles.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio, modo thinking ni capacidades multilingües.

## Casos de uso

- Investigación en leyes de escala: comparar las curvas de pérdida de validación (NELBO) de las fracciones 0.1 y 1.0 a lo largo de los pasos 1M-1,3M para estudiar cómo el tamaño del dataset afecta a la curva de aprendizaje.
- Análisis de sesgo implícito: usar los ficheros `norms/*.jsonl` para relacionar la norma de pesos (crudos y EMA) con la pérdida de test, siguiendo el enfoque de D'Amico, Bocchi y Negri.
- Reproducción de experimentos: reanudar desde `last.ckpt` o desde cualquier checkpoint de la rejilla con el estado completo del optimizador y del sampler para verificar resultados bit a bit.
- Estudio de dinámica de optimización: analizar la evolución de la complejidad espectral de Bartlett (`log_R`) por capa durante el entrenamiento, con datos en float64 por matriz.
- Comparación de algoritmos de difusión discreta: servir de línea base `duo_base` frente a otras variantes de difusión de estado uniforme o a modelos autorregresivos de tamaño comparable.
- Docencia y divulgación: ilustrar con checkpoints reales y métricas completas cómo se comporta un modelo de difusión discreta de 33,8M de parámetros sobre OpenWebText.
- Desarrollo de metodología de evaluación: usar la partición de validación fija de 110.464 bloques y el ruido fijo cada 5.000 pasos para comparaciones reproducibles entre ejecuciones.

## Benchmarks y rendimiento

Los únicos datos publicados son el NELBO de validación (nats/token) calculado con pesos EMA sobre la partición completa de validación de OpenWebText, con ruido fijo, cada 5.000 pasos:

| Fraccion | Bloques de entrenamiento | Paso | Epocas | NELBO validacion (nats/token) | Horas de entrenamiento | Paso de `last.ckpt` |
|---|---|---|---|---|---|---|
| 0.1 | 873.094 | 1.300.000 | 762 | 3,9652 | 200 | 1.309.080 |
| 1.0 | 8.730.942 | 1.300.000 | 76 | 3,9849 | 197 | 1.309.800 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 33,8M de parámetros, los pesos en FP32 ocupan aproximadamente 135 MB y en bf16 unos 68 MB, a lo que hay que sumar el estado del sampler y activaciones para 1.024 tokens.
- GPU recomendadas: no especificadas por el autor. El entrenamiento se ejecutó en segmentos mezclados de H100 y H200 (registrados en `segments.jsonl`).
- GPU de consumo: por tamaño de parámetros, el modelo cabe holgadamente en cualquier GPU de consumo moderna (por ejemplo, RTX 4090, RTX 3090 o superiores), aunque no hay pruebas publicadas de inferencia en estas tarjetas.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; la única vía indicada es cargar los checkpoints con PyTorch (`torch.load`) y usar el código de `s-sahoo/duo`.
- Latencia y throughput: no disponibles. El autor advierte de que `trainer/loss` depende del layout de GPU y que `train_hours` mezcla H100 y H200, por lo que las comparaciones temporales deben normalizarse por tipo de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| duo-scaling-2M-tiny (este) | 33,8M (backbone) | 1.024 | Difusión discreta de estado uniforme (`duo_base`) | Apache 2.0 | Checkpoints en HF |
| duo-scaling-tiny | 33,8M (backbone) | 1.024 | Difusión discreta de estado uniforme (`duo_base`) | Apache 2.0 | Checkpoints en HF (pasos 0-1M) |
| Modelos autorregresivos tipo GPT-2 small | ~124M | 1.024 | Transformer autorregresivo | Variable | Amplia |
| Modelos de difusión de texto tipo Diffusion-LM | ~80M-100M | Variable | Difusión continua/discreta | Variable | Repositorios de investigación |

La comparación cuantitativa de rendimiento con alternativas no está disponible: solo se publica NELBO de validación para las dos ejecuciones de este repositorio y para el estudio previo `duo-scaling-tiny`, sin tabla cruzada con otros modelos.

## Limitaciones y advertencias

- No es un modelo listo para producción: no hay pipeline declarado, no se documentan idiomas soportados y el artefacto es un conjunto de checkpoints de investigación.
- El estudio se detuvo antes del objetivo de 2.000.000 pasos; `last.ckpt` corresponde a ~1,31M pasos, no al presupuesto completo.
- El NELBO de validación ronda 3,97 nats/token, un valor propio de un modelo `tiny` de 33,8M de parámetros; la calidad de generación no está evaluada con métricas de texto.
- Entrenado exclusivamente sobre OpenWebText, de modo que hereda los sesgos y la distribución del corpus (predominantemente inglés y de Reddit).
- Riesgo de alucinación y de texto incoherente no cuantificado; no hay evaluaciones de seguridad ni de sesgo publicadas.
- Las horas de entrenamiento mezclan segmentos en H100 y H200, por lo que no son comparables directamente entre ejecuciones.
- `trainer/loss` en las métricas corresponde a un micro-batch en una GPU y depende del layout; para comparar ejecuciones debe usarse `val/nll`.
- El paso 0 de los checkpoints ocupa aproximadamente la mitad de tamaño porque aún no incluye estado del optimizador.
- La licencia Apache 2.0 permite uso comercial, pero el contenido del repositorio (14,2 GB de checkpoints y métricas) está orientado a investigación, no a despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lemoncmd/duo-scaling-2M-tiny
- Estudio previo (pasos 0-1M): https://huggingface.co/lemoncmd/duo-scaling-tiny
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Código base (versión modificada): https://github.com/s-sahoo/duo
- Referencia citada por el autor: D'Amico, Bocchi y Negri, *Implicit bias produces neural scaling laws in learning curves* (sin enlace proporcionado en la información disponible)
