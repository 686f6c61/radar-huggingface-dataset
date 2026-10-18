# lemoncmd/duo-scaling-tiny

## Resumen

`lemoncmd/duo-scaling-tiny` es un conjunto de diez modelos de lenguaje de difusión discreta de tipo Duo, desarrollados por el usuario lemoncmd, que comparten arquitectura y configuración `tiny` y solo difieren en la fracción de OpenWebText usada para entrenar: del 10% al 100% en subconjuntos anidados. Cada modelo tiene un backbone DiT de 33.789.010 parámetros, contexto de 1.024 tokens, tokenizador GPT-2 y se entrenó durante 1.000.000 de pasos con el algoritmo `duo_base` de difusión discreta de estado uniforme y objetivo NELBO exacto.

El objetivo no es ofrecer un modelo listo para producción, sino estudiar leyes de escala y dinámica de entrenamiento: cada carpeta incluye 53 checkpoints completos en una rejilla fija de pasos, pesos EMA, estado del optimizador y estado del sampler, además de métricas y normas de pesos cada 500 pasos. Esto permite analizar curvas de pérdida, sesgo implícito, complejidad espectral y eventos transitorios de entrenamiento con un coste computacional relativamente bajo.

La relevancia es metodológica: es un banco de pruebas reproducible para investigación en modelos de difusión discreta, con licencia Apache-2.0, pero no un modelo conversacional ni un sistema con benchmarks estándar de razonamiento o código. El repositorio ocupa 285,2 GB y no incluye pipeline de HuggingFace ni versiones cuantizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT con difusión discreta de estado uniforme (`duo_base`), configuración `tiny` |
| Parámetros totales | 33.789.010 en el backbone; total del sistema no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | No disponibles; no se distribuyen versiones cuantizadas. Entrenamiento en bf16 |
| Idiomas soportados | No declarados; entrenamiento con OpenWebText (texto web en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints PyTorch Lightning (`.ckpt`) con pesos raw, EMA, estado del optimizador y estado del loop/sampler; no hay safetensors ni GGUF |
| Tokenizador | GPT-2, vocabulario de 50.258 |
| Tamaño del repositorio | 285,2 GB |
| Pipeline de HuggingFace | No disponible |

## Arquitectura y entrenamiento

El backbone es un DiT (Diffusion Transformer) de configuración `tiny`, con 33.789.010 parámetros, contexto de 1.024 tokens, tokenizador GPT-2 de 50.258 entradas y embeddings de entrada y salida no compartidos. El algoritmo es `duo_base`: difusión discreta de estado uniforme entrenada con el NELBO exacto y un calendario de ruido log-lineal, sin currículo ni destilación. La salida es una distribución sobre secuencias, no un modelo autorregresivo convencional.

Se entrenaron diez modelos idénticos salvo por la fracción de OpenWebText: subconjuntos anidados del 10% al 100%, construidos con los primeros `floor(f × N + 0,5)` bloques de una permutación fija (semilla 20250927). El corpus completo tiene 8.730.942 bloques de 1.024 tokens; los últimos 100.000 documentos forman el conjunto de validación. Cada modelo se entrenó 1.000.000 de pasos con AdamW (lr 3e-4 constante tras 2.500 pasos de calentamiento, weight decay 0, grad clip 1,0, EMA 0,9999, bf16), batch global de 512 secuencias de 1.024 tokens (524.288.000.000 tokens procesados) y semilla 1. El código es una versión modificada de `s-sahoo/duo` (rama `scaling-study`, commit `7c9e7d04d4a4`).

## Capacidades

- Modelado de lenguaje y generación mediante difusión discreta: el modelo define una distribución sobre secuencias de 1.024 tokens y los checkpoints incluyen estado del loop/sampler; la model card no publica ejemplos ni métricas de calidad de muestreo.
- Evaluación de verosimilitud: NELBO de validación en nats/token, calculado con pesos EMA, ruido fijo y el conjunto completo de validación de OpenWebText.
- Estudio de trayectorias de entrenamiento: 53 checkpoints por modelo, con pesos raw y EMA, lo que permite analizar la evolución del modelo paso a paso.
- Análisis de normas de pesos: ficheros `norms_raw.jsonl` y `norms_ema.jsonl` cada 500 pasos, con normas espectrales, Frobenius, L1, normas (2,1) por filas y columnas y `log_R` (complejidad espectral de Bartlett).
- Reproducibilidad: los checkpoints incluyen estado del optimizador y del loop/sampler, de modo que el entrenamiento puede reanudarse exactamente.
- Tool calling y function calling: no documentados; no hay plantilla de herramientas ni formato de chat.
- Agentes y razonamiento multi-paso: no evaluados.
- Capacidades multilingües: no declaradas; el entrenamiento usa OpenWebText, corpus en inglés.
- Visión, audio o modalidades adicionales: no disponibles.
- Ajuste por instrucciones, RLHF o DPO: no documentado.

## Casos de uso

- Estudio de leyes de escala con fracciones de datos: comparar los diez modelos, que solo cambian en el número de bloques de OpenWebText, para ajustar curvas de NELBO frente a fracción, pasos y épocas; los subconjuntos son anidados y el resto del setup es idéntico.
- Análisis de dinámica de entrenamiento: usar los 53 checkpoints por modelo para estudiar la evolución de la pérdida, la deriva de pesos y eventos transitorios; por ejemplo, el repunte de `frac_0.80` entre los pasos 590.000 y 625.000 se puede reproducir y analizar.
- Investigación de sesgo implícito y complejidad espectral: los ficheros de normas y `log_R` permiten relacionar normas de pesos con curvas de pérdida, en la línea del paper citado en la model card.
- Reproducción de experimentos de difusión discreta: el código base es una rama de `s-sahoo/duo` con commit registrado; sirve para replicar el entrenamiento o probar cambios de objetivo, calendario de ruido o sampler.
- Desarrollo y depuración de samplers: los checkpoints incluyen estado del loop/sampler; se pueden comparar estrategias de muestreo y números de pasos de denoising sin reentrenar desde cero.
- Docencia y divulgación: un modelo de 33,8 M de parámetros y contexto 1.024 es manejable para explicar difusión discreta, NELBO y análisis de checkpoints en cursos o talleres, aunque el entrenamiento completo requiera GPU de datacenter.
- Baseline para nuevas arquitecturas o variantes: al haber diez fracciones y 53 checkpoints, se puede comparar una modificación con el mismo presupuesto de pasos y datos.
- Auditoría de estabilidad numérica: analizar el evento de `frac_0.80` y las diferencias entre `trainer/loss` y `val/nll` para estudiar robustez y ruido de entrenamiento.

## Benchmarks y rendimiento

No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica publicada es el NELBO de validación (nats/token, menor es mejor) con pesos EMA sobre el conjunto completo de validación de OpenWebText (110.464 bloques), ruido fijo y evaluación cada 5.000 pasos (`val/nll`).

| Fracción | Bloques de entrenamiento | Épocas a 1M | NELBO val a 1M | Mejor NELBO val (paso) | Horas |
|---|---:|---:|---:|---:|---:|
| 10% | 873.094 | 586 | 3,9718 | 3,9717 (995.000) | 153 |
| 20% | 1.746.188 | 293 | 3,9657 | 3,9656 (995.000) | 146 |
| 30% | 2.619.283 | 195 | 3,9998 | 3,9996 (990.000) | 151 |
| 40% | 3.492.377 | 147 | 3,9671 | 3,9669 (990.000) | 144 |
| 50% | 4.365.471 | 117 | 3,9682 | 3,9682 (1.000.000) | 150 |
| 60% | 5.238.565 | 98 | 3,9831 | 3,9826 (975.000) | 139 |
| 70% | 6.111.
