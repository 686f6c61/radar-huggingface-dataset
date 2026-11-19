# lemoncmd/duo-scaling-wd0.1-tiny

## Resumen

Duo-scaling-wd0.1-tiny es un conjunto de cinco modelos de difusión discreta de estado uniforme (uniform-state discrete diffusion) de tipo Duo (`duo_base`), desarrollados por el usuario lemoncmd como parte de un estudio de leyes de escalado (scaling laws) centrado en la fracción de datos de entrenamiento. Los cinco modelos comparten exactamente la misma arquitectura y configuración de entrenamiento (backbone DiT `tiny` de 33.789.010 parámetros, contexto de 1.024 tokens, tokenizador GPT-2 con vocabulario de 50.258) y solo difieren en el tamaño de su conjunto de entrenamiento: subconjuntos anidados de OpenWebText que contienen el 10%, 25%, 50%, 75% y 100% de los bloques disponibles.

El objetivo del estudio no es ofrecer un modelo listo para producción, sino publicar la trayectoria completa de entrenamiento para analizar el sesgo implícito y las curvas de escalado, en la línea del trabajo de D'Amico, Bocchi y Negri sobre leyes de escalado neuronales. El repositorio almacena checkpoints completos (pesos crudos, pesos EMA, estado del optimizador y del sampler) en una rejilla fija de pasos, lo que permite reanudar el entrenamiento de forma exacta y estudiar la evolución de la pérdida frente a la norma de los pesos.

Es relevante ahora porque el entrenamiento sigue en curso (objetivo de 1.000.000 de pasos) y el repositorio se actualiza conforme avanza, ofreciendo un recurso poco habitual: una cuadrícula de modelos idénticos salvo por la fracción de datos, con métricas de validación NELBO registradas cada 5.000 pasos y estadísticas de normas por matriz en float64. No obstante, conviene subrayar que no es un modelo generativo listo para uso: es material de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con difusión discreta de estado uniforme (Duo, `duo_base`) |
| Parámetros totales | 33.789.010 (solo backbone) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado sobre OpenWebText, mayoritariamente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch Lightning checkpoints (`.ckpt`) con pesos crudos, EMA y estado del optimizador |

## Arquitectura y entrenamiento

El modelo emplea un backbone DiT (Diffusion Transformer) de configuración `tiny` con 33.789.010 parámetros, contexto de 1.024 tokens, tokenizador GPT-2 (vocabulario de 50.258) y embeddings no atados (untied). El algoritmo es `duo_base`: difusión discreta de estado uniforme entrenada sobre el NELBO exacto, con un schedule de ruido log-lineal, sin curriculum ni destilación. La innovación metodológica no reside en la arquitectura sino en el diseño experimental: cinco ejecuciones idénticas salvo por la fracción de datos (10%, 25%, 50%, 75% y 100% de los bloques de OpenWebText), usando subconjuntos anidados de una misma permutación fija (seed 20250927), de modo que las curvas de escalado son directamente comparables.

Los datos proceden de OpenWebText (`Skylion007/openwebtext`, revisión `79d93d7`), tokenizados con GPT-2 y agrupados en bloques de 1.024 tokens: 8.730.942 bloques de entrenamiento y una validación de 100.000 documentos. La optimización usa AdamW con learning rate 3e-4 constante tras 2.500 pasos de calentamiento, weight decay 0.1 desacoplado (un solo grupo de parámetros, por lo que también decae sesgos, pesos de LayerNorm y embeddings), clipping de gradiente 1.0, EMA con decaimiento 0.9999, precisión mixta bf16, batch global de 512 secuencias × 1.024 tokens y seed 1. El objetivo es de 1.000.000 de pasos. El código es una versión modificada de `s-sahoo/duo` (rama scaling-study, commit `7ac5b2294c36`).

## Capacidades

- Generación de texto mediante difusión discreta (no autorregresiva), con decodificación basada en el proceso de difusión de estado uniforme.
- Modelado de lenguaje: el NELBO de validación (en nats/token) es la métrica principal; los valores reportados oscilan entre 3.9524 y 4.0084 según la fracción de datos.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidades multilingües no documentadas; el corpus de entrenamiento (OpenWebText) es predominantemente en inglés.
- No incluye modo thinking, visión ni audio.
- El valor del artefacto es analítico: checkpoints completos con pesos crudos y EMA, métricas por paso y estadísticas de normas (espectral, Frobenius, L1, normas (2,1) por fila y columna, y complejidad espectral de Bartlett `log_R`) cada 500 pasos.

## Casos de uso

- Investigación sobre leyes de escalado: comparar la pérdida de validación (NELBO) frente al tamaño del conjunto de datos en cinco regímenes (10%–100%) con todo lo demás constante, aislando el efecto de la fracción de datos.
- Estudio del sesgo implícito y la norma de pesos: los ficheros `norms/*.jsonl` permiten relacionar la evolución de las normas por matriz con la curva de pérdida, en la línea de D'Amico et al.
- Análisis de trayectorias de entrenamiento: los 53 checkpoints de la rejilla (0, 100, 200, 400, 700, 1k, 1.5k, 2.5k, 4k, 6k, 10k, 15k, 20k y cada 25k hasta 1M) permiten estudiar la dinámica intermedia, no solo el punto final.
- Reproducción exacta de experimentos: cada checkpoint incluye pesos crudos, EMA, estado del optimizador y estado del sampler; el orden de datos, el ruido y el learning rate dependen solo del paso, por lo que la reanudación es determinista.
- Desarrollo y depuración de algoritmos de difusión discreta: servir de base para probar variantes de schedule de ruido, decodificación o inicialización sobre un backbone pequeño (33,8 M de parámetros) y barato de iterar.
- Comparación con el estudio gemelo sin weight decay (`duo-scaling-tiny`, misma cuenta): los subconjuntos anidados de ambos estudios comparten permutación, lo que permite aislar el efecto del weight decay 0.1 frente a 0.

## Benchmarks y rendimiento

Los únicos datos publicados son los NELBO de validación (nats/token) con pesos EMA sobre el split completo de OpenWebText (110.464 bloques), con ruido fijo, evaluados cada 5.000 pasos:

| Fracción | Bloques de entrenamiento (1.024 tokens) | Paso | Épocas | NELBO val (nats/token) | Horas de entrenamiento |
|---|---|---|---|---|---|
| 0.10 | 873.094 | 800.000 | 469 | 3.9984 | 118 |
| 0.25 | 2.182.736 | 800.000 | 188 | 4.0077 | 117 |
| 0.50 | 4.365.471 | 1.000.000 | 117 | 3.9860 | 156 |
| 0.75 | 6.548.207 | 1.000.000 | 78 | 3.9524 | 129 |
| 1.00 | 8.730.942 | 1.000.000 | 59 | 4.0084 | 129 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las horas de reloj mezclan segmentos en H100 y H200, por lo que no son directamente comparables entre ejecuciones sin normalizar por tipo de GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 33,8 M de parámetros en el backbone, los pesos en fp32 ocupan aproximadamente 135 MB y en bf16 unos 68 MB; el grueso del repositorio (135 GB) corresponde a los checkpoints con estado del optimizador, no a los pesos de inferencia.
- GPU recomendadas: el entrenamiento se ejecutó en H100 y H200 (según `segments.jsonl`). Para inferencia, cualquier GPU con al menos 1–2 GB de VRAM libre debería bastar para los pesos, aunque no se han publicado requisitos oficiales.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU consumer moderna (RTX 3060 en adelante), dado el tamaño del backbone, aunque esta afirmación no está verificada en la documentación del autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El formato es PyTorch Lightning (`.ckpt`) y la carga se realiza con `torch.load`; el código de referencia es la rama scaling-study de `s-sahoo/duo`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| duo-scaling-wd0.1-tiny (este) | 33,8 M (backbone) | 1.024 | Difusión discreta (Duo) | Apache 2.0 | Checkpoints en HF |
| duo-scaling-tiny (estudio gemelo, weight decay 0) | 33,8 M (backbone) | 1.024 | Difusión discreta (Duo) | Apache 2.0 | Checkpoints en HF |
| GPT-2 small (referencia autorregresiva) | 124 M | 1.024 | Transformer autorregresivo | MIT | Pesos públicos |

La comparación con GPT-2 small es solo orientativa por tamaño y contexto; no se dispone de datos de rendimiento comparables entre ambos paradigmas en la información proporcionada. No se han identificado otros modelos de difusión discreta de escala similar con métricas publicadas en la información disponible.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un artefacto de investigación con entrenamiento en curso (objetivo de 1.000.000 de pasos; algunas fracciones aún no han alcanzado el objetivo).
- El NELBO de validación no es directamente comparable con la perplejidad de modelos autorregresivos; no debe interpretarse como calidad generativa equiparable.
- Riesgo de alucinación y de texto incoherente no evaluado; no se han publicado evaluaciones cualitativas de generación.
- Sesgos conocidos: no documentados, pero el corpus OpenWebText (texto web en inglés) arrastra los sesgos habituales de ese tipo de datos.
- Limitación idiomática: entrenamiento exclusivamente sobre OpenWebText, predominantemente en inglés; no hay soporte multilingüe documentado.
- Las horas de reloj mezclan H100 y H200, por lo que las comparaciones temporales entre ejecuciones requieren normalización por tipo de GPU.
- `trainer/loss` en las métricas depende del layout de GPU (un micro-batch en una GPU); para comparar ejecuciones debe usarse `val/nll`.
- La ejecución `frac_0.10` comenzó como piloto y se adoptó sin cambios; su configuración resuelta coincide con las demás salvo en los nombres de wandb.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un modelo de investigación sin garantías de calidad, su uso en producción no está recomendado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lemoncmd/duo-scaling-wd0.1-tiny
- Estudio gemelo sin weight decay: https://huggingface.co/lemoncmd/duo-scaling-tiny
- Repositorio de código base: https://github.com/s-sahoo/duo
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Referencia citada (D'Amico, Bocchi & Negri, *Implicit bias produces neural scaling laws in learning curves*): no disponible enlace directo en la información proporcionada.
