# sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed1

## Resumen

MixIT FUSS TF-Locoformer m16 sparse seed 1 es un modelo de separación de fuentes de audio entrenado mediante mixture-invariant training (MixIT) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario sammyliu y se publica como un artefacto de investigación reproducible: un ajuste completo de 60.000 actualizaciones con semilla 1, sus cinco mejores checkpoints por validación, los pesos finales y la inicialización aleatoria. El modelo opera a 8 kHz en modo offline y produce 16 slots de salida no ordenados, que no corresponden a clases semánticas.

La arquitectura es un TF-Locoformer compacto (transformer con procesado dual-path en tiempo y frecuencia) con 16 slots de salida, 3 bloques dual-path, 64 canales, 4 cabezas y FFN de 128. El total de parámetros asciende a 1.302.800 según los pesos en safetensors, lo que lo sitúa en la categoría de modelos muy pequeños, aptos para experimentación y despliegue en hardware modesto.

Su relevancia es metodológica más que de producto: demuestra que MixIT puede entrenar un separador razonable sobre mezclas observadas sin etiquetas de fuente, y publica métricas honestas que distinguen la consistencia de mezcla (MixIT dB) de la recuperación real de fuentes (SI-SDRi). El checkpoint seleccionado alcanza 7,7471 dB de SI-SDRi en test sobre 166 escenas multfuente, con un intervalo bootstrap del 95% de [6,6871, 8,8608] dB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path tiempo-frecuencia), atención no causal en tiempo y frecuencia |
| Parámetros totales | 1.302.800 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 4 segundos a 8 kHz; STFT con FFT 256 y hop 128) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repo; la tarea es audio, no texto) |
| Licencia | public-access-no-weight-license-grant (licencia "other", sin concesión de derechos sobre los pesos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto con 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128, kernel de convolución 4 y 4 grupos de normalización RMS. La atención es no causal tanto en el eje temporal como en el frecuencial. La STFT usa FFT de 256, hop de 128 y ventana Hann con padding constante centrado. El wrapper de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la síntesis. Esta configuración compacta no corresponde al modelo Medium del paper original.

El entrenamiento usa MixIT sobre el dataset FUSS reverberante (20.000 escenas de entrenamiento y 1.000 de validación, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`). Cada ejemplo combina dos escenas observadas distintas con crops aleatorios independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes, por lo que la mezcla de mezclas puede contener hasta 8. Se usan 16 ejemplos por batch, 60.000 actualizaciones del optimizador AdamW (betas 0.9/0.999, epsilon 1e-8, weight decay 0.01), LR pico 0.001 con warmup lineal de 1.000 pasos multiplicado por schedule coseno y suelo de 0.0001, clipping de norma global 5 y precisión BF16 en el backbone con FP32 en STFT, síntesis, asignación y objetivo. La asignación MixIT eficiente resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` con fallback a pseudoinversa y asigna cada salida a la rama con mayor coeficiente; el gradiente no atraviesa el argmax. La pérdida añade 4,0 veces la esparsidad RMS de fuentes y 0,0 veces la covarianza fuera de diagonal. Se aplica consistencia de mezcla mediante proyección de residuo igual sobre todos los slots. El entrenamiento se ejecutó en una NVIDIA A100 80GB con PyTorch 2.7.1 y CUDA 12.6.

## Capacidades

- Separación de fuentes de audio offline a 8 kHz sobre mezclas reverberantes.
- Producción de 16 slots de salida no ordenados, sin correspondencia semántica con clases de fuente.
- Manejo de mezclas con hasta 8 fuentes (mezcla de dos escenas de 1 a 4 fuentes cada una).
- Procesamiento de audio mono con normalización interna de RMS y restauración de amplitud.
- Consistencia de mezcla garantizada por proyección de residuo igual sobre los slots.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de texto: es un modelo puramente de audio.
- No dispone de modo thinking, visión ni audio de entrada distinto de la mezcla a separar.

## Casos de uso

- Investigación en separación de fuentes sin etiquetas: sirve como línea base reproducible de MixIT sobre FUSS, con receta, semilla y métricas publicadas para comparar variantes de asignación o de backbone.
- Reproducción de experimentos: los cinco mejores checkpoints, los pesos finales y la inicialización permiten estudiar la evolución del entrenamiento y la varianza entre checkpoints.
- Prototipado de pipelines de separación en entornos con recursos limitados: con 1,3 M de parámetros, el modelo cabe en cualquier GPU consumer y permite iterar rápidamente sobre preprocesado de audio.
- Evaluación de métricas de separación: útil para validar implementaciones de SI-SDRi, MixIT dB y asignación húngara contra las cifras publicadas en `metrics.json`.
- Docencia y divulgación: ejemplo compacto y completo de entrenamiento mixture-invariant con receta detallada, útil para explicar MixIT, consistencia de mezcla y evaluación con intervalos bootstrap.
- Estudio de reverberación y mezclas de mezclas: permite analizar cómo se comporta un separador entrenado sobre escenas reverberantes de 1 a 4 fuentes cuando la entrada combina hasta 8 fuentes.
- No es adecuado para producción de separación de voz o música de alta fidelidad: opera a 8 kHz y su SI-SDRi de 7,75 dB en test es propio de un modelo de investigación compacto.

## Benchmarks y rendimiento

| Métrica (checkpoint seleccionado en update 57.000) | Valor (dB) |
|---|---|
| MixIT en entrenamiento, 64 MoMs fijos | 13,1348 |
| MixIT en validación holdout, 64 MoMs fijos | 13,0518 |
| SI-SDRi de fuente en validación holdout, 653 escenas multfuente | 7,5621 |
| SI-SDRi de fuente en test, 166 escenas multfuente | 7,7471 |
| Intervalo bootstrap 95% de SI-SDRi en test | [6,6871, 8,8608] |

En el update final (60.000), la media de MixIT sobre los últimos 20 minibatches registrados fue 14,1328 dB en entrenamiento, 13,0298 dB en validación y 6,5472 dB de SI-SDRi en el subconjunto de progreso de 128 escenas. Estas cifras corresponden a un paso distinto del checkpoint seleccionado y no son directamente comparables con la tabla anterior.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 1,3 M de parámetros, más el coste de las activaciones de la STFT y del transformer; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento se realizó en una NVIDIA A100 80GB, pero la inferencia es viable en RTX 3060, RTX 4090, A10, T4 o similares.
- Cabe en GPU consumer: sí, en todas las GPU consumer con soporte CUDA y al menos 4 GB de VRAM.
- Opciones de despliegue: PyTorch nativo con safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de audio.
- Latencia y throughput estimados: no disponibles. El modelo procesa crops de 4 segundos a 8 kHz y opera offline, no en streaming.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 sparse seed 1 | 1,3 M | crops de 4 s a 8 kHz | SI-SDRi test 7,7471 dB (166 escenas) | public-access-no-weight-license-grant | Hugging Face |
| TF-Locoformer Medium (paper original) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Alternativas MixIT sobre FUSS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Los slots de salida son no ordenados y no tienen significado semántico: no se puede pedir "la voz" o "el instrumento" de forma directa.
- El checkpoint se seleccionó por MixIT de validación, no por SI-SDRi ni por rendimiento en test; la métrica de selección no garantiza la mejor separación real.
- El intervalo de confianza del 95% de SI-SDRi en test es amplio ([6,6871, 8,8608] dB) y describe incertidumbre entre escenas para una sola semilla, no entre semillas de entrenamiento.
- La evaluación en test usa 256 escenas de los shards 8–11, no la partición completa de test.
- La evaluación de fuentes usa los cuatro segundos centrales de cada escena, sin formar mezcla de mezclas, por lo que no mide el régimen de hasta 8 fuentes del entrenamiento.
- Opera únicamente a 8 kHz mono, lo que limita su uso en aplicaciones de voz de banda ancha o música.
- El modelo es pequeño (1,3 M de parámetros) y su calidad de separación es propia de investigación, no de producción.
- La licencia `public-access-no-weight-license-grant` no concede derechos de uso sobre los pesos; el uso comercial no está permitido sin autorización expresa del autor.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí existe riesgo de artefactos y de asignaciones incorrectas de fuentes en mezclas complejas.
- No se documentan sesgos, pero el rendimiento está condicionado al dominio de FUSS (escenas reverberantes de 1 a 4 fuentes) y puede degradarse fuera de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed1
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed1/blob/main/LICENSE-WEIGHTS.md
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
- Dataset FUSS en Hugging Face: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
