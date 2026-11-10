# sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0

## Resumen
MixIT FUSS TF-Locoformer m8 plain seed0 es un modelo de separación de fuentes de audio (source separation) entrenado mediante mixture-invariant training (MixIT) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario sammyliu y se publica como un experimento reproducible: un único ajuste completado de 60.000 actualizaciones, con sus cinco mejores checkpoints de validación, los pesos finales y la inicialización aleatoria.

El modelo trabaja a 8 kHz en modo offline, con 8 slots de salida no ordenados (no son clases semánticas) y una arquitectura compacta TF-Locoformer de 3 bloques dual-path, 64 canales, 4 cabezas y FFN de 128. Con 1.293.568 parámetros totales, es un modelo muy pequeño orientado a investigación y reproducción de recetas, no a producción a gran escala.

Su relevancia es metodológica: demuestra un pipeline completo de MixIT con asignación dura eficiente, consistencia de mezcla por proyección de residuo y métricas auditadas (MixIT en dB y SI-SDRi de fuente) con intervalos de confianza por bootstrap de escenas. La licencia es restrictiva y no concede derechos sobre los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con bloques dual-path), 8 slots de salida, 3 bloques dual-path |
| Parámetros totales | 1.293.568 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 4 segundos a 8 kHz por ejemplo) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente FP32/BF16 de entrenamiento) |
| Idiomas soportados | en (etiqueta del repo; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (other; sin concesión de licencia sobre los pesos) |
| Formato de pesos | safetensors (model.safetensors, checkpoints e inicialización) |

## Arquitectura y entrenamiento
La arquitectura es un TF-Locoformer compacto con 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128, kernel de convolución 4 y 4 grupos de normalización RMS. La atención es no causal tanto en el eje temporal como en el frecuencial. La STFT usa FFT de 256, hop de 128, ventana Hann y padding constante centrado. El wrapper de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la síntesis. Esta configuración compacta no corresponde al modelo Medium del paper original.

El entrenamiento usa FUSS reverberante (20.000 escenas de entrenamiento y 1.000 de validación, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`). Cada ejemplo muestrea dos escenas observadas distintas con crops aleatorios independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes, de modo que la mezcla de mezclas puede llegar a 8 fuentes. Audio mono a 8.000 Hz, con escalado RMS independiente por rama y suma sin normalización posterior. Batch de 16 ejemplos, 60.000 actualizaciones de optimizador, semilla 0, AdamW (betas 0.9/0.999, epsilon 1e-8, weight decay 0.01), LR pico 0.001 con warmup lineal de 1.000 pasos multiplicado por schedule coseno y suelo de 0.0001, clipping de norma global 5 y precisión BF16 en el backbone con FP32 en STFT, síntesis, asignación y objetivo (TF32 permitido). Se empleó una A100 de 80 GB por ajuste, PyTorch 2.7.1 con CUDA 12.6 y algoritmos deterministas de Torch.

La innovación destacable es la asignación MixIT dura eficiente: se resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` mediante solve lineal con fallback a pseudoinversa, y cada salida se asigna a la rama con mayor coeficiente; las reconstrucciones de rama suman sus salidas asignadas. La pérdida media es `-10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB; los pesos de esparsidad RMS de fuente y de covarianza fuera de diagonal son 0.0. Los gradientes no se diferencian a través del argmax duro. La consistencia de mezcla se aplica como proyección de residuo equitativa sobre todos los slots. La selección de checkpoint se hizo cada 1.000 actualizaciones maximizando MixIT de validación, reteniendo los cinco mejores.

## Capacidades
- Separación de fuentes de audio offline a 8 kHz con 8 slots de salida no ordenados.
- Entrenamiento mixture-invariant: no requiere fuentes aisladas como supervisión.
- Procesamiento de mezclas de hasta 8 fuentes (composición de dos escenas de 1 a 4 fuentes).
- Consistencia de mezcla mediante proyección de residuo sobre todos los slots.
- Evaluación de recuperación de fuentes con asignación húngara uno a uno tras eliminar medias por forma de onda.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada/salida más allá de la separación.
- Capacidades multilingües no aplicables; la etiqueta de idioma es `en` y el dominio es audio.

## Casos de uso
- Investigación en separación de fuentes sin supervisión: sirve como línea base reproducible de MixIT sobre FUSS, con receta, semilla y métricas documentadas para comparar variantes de asignación o de arquitectura.
- Reproducción de experimentos: el repo incluye inicialización aleatoria, cinco mejores checkpoints y pesos finales, lo que permite repetir el ajuste y auditar la selección por MixIT de validación.
- Estudio de métodos de asignación: el código de asignación dura eficiente (solve lineal con pseudoinversa y umbral suave de 30 dB) puede evaluarse frente a asignación binaria exhaustiva o pérdidas scale-invariant.
- Análisis de consistencia de mezcla: la proyección de residuo equitativa permite estudiar cómo la consistencia exacta de mezcla no garantiza una separación correcta de fuentes.
- Prototipado de pipelines de audio a 8 kHz: adecuado para experimentos de separación en entornos de baja tasa de muestreo y recursos limitados, dado el tamaño de 1,29 M de parámetros.
- Evaluación estadística: los intervalos de confianza por bootstrap de escenas (2.000 remuestreos) sirven como plantilla para reportar incertidumbre en separación de fuentes.
- Docencia y divulgación: modelo pequeño y con receta completa para explicar MixIT, TF-Locoformer y métricas SI-SDRi en cursos o talleres.

## Benchmarks y rendimiento

| Medición del checkpoint seleccionado (update 55.000) | dB |
|---|---:|
| MixIT en entrenamiento, 64 MoMs fijas de evaluación | 12,9854 |
| MixIT en validación holdout, 64 MoMs fijas de evaluación | 12,6645 |
| SI-SDRi de fuente en validación holdout, 653 escenas multi-fuente | 7,4368 |
| SI-SDRi de fuente en test, 166 escenas multi-fuente | 7,8191 |

Intervalo bootstrap de escenas al 95 % para SI-SDRi de test: [6,6965; 8,9309] dB. Este intervalo describe la incertidumbre entre escenas evaluadas para esta única semilla, no entre semillas de entrenamiento. En la actualización final (60.000), el MixIT de la señal de entrenamiento promediado sobre los últimos 20 minibatches registrados fue 14,2818 dB; el MixIT de validación, 12,6229 dB; y el SI-SDRi de fuente en validación sobre el subconjunto de progreso de 128 escenas, 7,3164 dB. Estos valores finales son distintos de los del checkpoint seleccionado y de la cohorte completa de validación. `metrics.json` incluye puntuaciones por escena y mediciones de la inicialización.

El protocolo de test usa 256 escenas de los shards 8–11 del split de test fijado, no el split completo. La evaluación de fuentes usa los cuatro segundos centrales de cada escena observada ordinaria, sin formar mezcla de mezclas; tras eliminar medias por forma de onda, una asignación húngara empareja slots con referencias activas uno a uno, sin agrupación oracle de múltiples slots. Las referencias con energía por debajo de `max(energía total de fuentes*1e-6, 1e-10)` se excluyen. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este modelo.

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja, del orden de decenas o pocos cientos de MB para 1,29 M de parámetros más buffers de STFT; no se proporciona una cifra oficial.
- GPU recomendadas: el entrenamiento usó una NVIDIA A100 de 80 GB por ajuste; la inferencia no requiere esa GPU.
- Cabe en GPU consumer: sí, por tamaño de parámetros, aunque no se documentan requisitos mínimos ni pruebas en GPUs concretas.
- Opciones de despliegue: el repo es PyTorch con safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo de audio).
- Latencia y throughput: no disponibles; el modelo procesa crops de 4 segundos a 8 kHz en modo offline.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m8 plain seed0 | 1.293.568 | crops de 4 s a 8 kHz | SI-SDRi test 7,8191 dB | public-access-no-weight-license-grant | Hugging Face (0 descargas) |
| TF-Locoformer Medium (paper original) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras variantes de sammyliu (seed distinta) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias
- La licencia `public-access-no-weight-license-grant` no concede licencia sobre los pesos; el uso comercial no está permitido salvo autorización expresa del autor.
- El modelo se seleccionó por MixIT de validación, no por SI-SDRi de fuente ni por rendimiento en test; la consistencia exacta de mezcla no garantiza una separación correcta.
- Los 8 slots de salida son no ordenados y no corresponden a clases semánticas; requieren asignación posterior (por ejemplo, húngara) para evaluar o usar las fuentes.
- Solo audio mono a 8 kHz y modo offline; no es un modelo de lenguaje ni soporta tool calling, agentes o razonamiento.
- El intervalo de confianza publicado corresponde a una única semilla (seed 0) y a las escenas evaluadas, no a variabilidad entre semillas.
- El test usa 256 escenas de los shards 8–11, no el split completo; los resultados pueden no extrapolarse al conjunto completo.
- La configuración compacta no es el modelo Medium del paper original, por lo que sus cifras no son directamente comparables con las de la publicación.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.
- Riesgo de alucinación no aplicable; el riesgo principal es sobreajuste al protocolo de evaluación y a la distribución de FUSS.
- No se documentan sesgos de dominio más allá del dataset FUSS reverberante; el rendimiento fuera de esa distribución es desconocido.

## Enlaces
- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
