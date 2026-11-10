# sammyliu/mixit-fuss-tflocoformer-m8-plain-seed2

## Resumen

MixIT FUSS TF-Locoformer m8 plain seed2 es un modelo de separación de fuentes de audio (source separation) desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un separador offline de 8 kHz entrenado mediante mixture-invariant training (MixIT) sobre mezclas reverberantes observadas del dataset FUSS, sin emplear fuentes aisladas como objetivos de entrenamiento. El modelo produce ocho ranuras de salida no ordenadas que no corresponden a clases semánticas concretas.

La arquitectura es un TF-Locoformer compacto (transformer con dual-path blocks sobre representaciones tiempo-frecuencia) con 1.293.568 parámetros totales, muy alejado del modelo Medium del artículo original. El entrenamiento consistió en un único ajuste completado de 60.000 actualizaciones sobre 20.000 escenas de entrenamiento y 1.000 de validación, con semilla 2, usando una A100 de 80 GB.

Su relevancia es acotada pero específica: demuestra un pipeline reproducible de separación de audio con MixIT sobre datos reverberantes reales, con métricas de reconstrucción y de SI-SDRi publicadas, protocolo de evaluación detallado y checkpoints intermedios. No es un modelo de propósito general ni un asistente conversacional; es un componente de investigación para separación de mezclas de hasta 8 fuentes a 8 kHz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path tiempo-frecuencia, atención no causal en tiempo y frecuencia) |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; procesa crops aleatorios de 4 segundos a 8 kHz (STFT FFT 256, hop 128) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/BF16; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (licencia "other", sin concesión de derechos sobre los pesos) |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto con 8 ranuras de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención, FFN de 128 dimensiones, kernel de convolución 4 y 4 grupos de normalización RMS. La STFT usa FFT de 256, hop de 128, ventana Hann y padding constante centrado. La atención es no causal tanto en el eje temporal como en el frecuencial. El wrapper de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la síntesis.

El entrenamiento emplea MixIT sobre el dataset FUSS reverberante (revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`), con 20.000 escenas de entrenamiento y 1.000 de validación. Cada ejemplo muestrea dos escenas observadas distintas con crops aleatorios independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes, por lo que la mezcla de mezclas puede contener hasta 8. Se usó AdamW (betas 0.9/0.999, epsilon 1e-8, weight decay 0.01), LR pico 0.001 con warmup lineal de 1.000 pasos y schedule coseno con suelo 0.0001, clipping de norma global 5, precisión BF16 en el backbone y FP32 en STFT, síntesis, asignación y objetivo, con TF32 permitido. Batch de 16 ejemplos, 60.000 actualizaciones, una A100 80 GB, PyTorch 2.7.1 con CUDA 12.6 y algoritmos deterministas de Torch.

La asignación MixIT es la variante "hard efficient": primero resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` mediante solve lineal con fallback a pseudoinversa, y asigna cada salida a la rama con mayor coeficiente. La pérdida es `-10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB; los gradientes no se diferencian a través del argmax. Los pesos de sparsity RMS de fuente y de covarianza off-diagonal están a 0.0. Se aplica proyección de consistencia de mezcla de residuo igual sobre todas las ranuras.

## Capacidades

- Separación de audio en 8 ranuras de salida a partir de mezclas reverberantes de hasta 8 fuentes (mezcla de mezclas).
- Funcionamiento offline sobre audio mono a 8 kHz; no es streaming ni tiempo real.
- Salidas no ordenadas: las ranuras no tienen correspondencia semántica ni de identidad de fuente.
- Proyección de consistencia de mezcla: la suma de las salidas reconstruye la mezcla de entrada.
- Entrenamiento mixture-invariant: no requiere fuentes aisladas para el ajuste.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni texto.
- No tiene capacidades de visión, audio comprensivo (ASR) ni generación de lenguaje.
- Multilingüismo no aplicable: el modelo opera sobre forma de onda, no sobre texto.

## Casos de uso

- Investigación en separación de fuentes: reproducción de un baseline MixIT con métricas publicadas (MixIT dB en train y validación, SI-SDRi en validación y test) para comparar recetas y semillas.
- Preprocesado de audio reverberante: separar mezclas de hasta 8 fuentes en un pipeline offline antes de etapas posteriores de clasificación o diarización, aprovechando la consistencia de mezcla.
- Estudio de MixIT sin datos aislados: validar cómo se comporta el entrenamiento mixture-invariant sobre FUSS reverberante cuando no se dispone de fuentes de referencia para supervisión.
- Generación de datos sintéticos de separación: usar las 8 ranuras como estimaciones iniciales para inicializar o aumentar datasets de separación supervisada.
- Análisis de robustez a reverberación: evaluar el efecto de mezclas reverberantes reales frente a mezclas anecoicas en la calidad de separación (SI-SDRi de 7,33 dB en test).
- Docencia y experimentación: modelo de 1,29 M de parámetros que cabe en hardware modesto y permite estudiar dual-path transformers y asignación MixIT con código y configuración completos.

## Benchmarks y rendimiento

| Metrica | Valor (dB) |
|---|---|
| MixIT en entrenamiento (64 MoMs fijos) | 12,7208 |
| MixIT en validación (64 MoMs fijos) | 12,5756 |
| SI-SDRi de fuente en validación (653 escenas multi-fuente) | 6,7152 |
| SI-SDRi de fuente en test (166 escenas multi-fuente) | 7,3291 |
| Intervalo bootstrap 95% de SI-SDRi en test | [6,2412, 8,3973] |
| MixIT de señal de entrenamiento en update final (media de 20 minibatches) | 13,4462 |
| MixIT de validación en update final | 12,5280 |
| SI-SDRi de validación en subconjunto de 128 escenas (update final) | 6,3300 |

El checkpoint `model.safetensors` se seleccionó en la actualización 58.000 por score MixIT de validación, no por SI-SDRi ni por rendimiento en test. El intervalo de confianza describe incertidumbre entre escenas evaluadas para esta semilla, no entre semillas de entrenamiento. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,29 M de parámetros, el modelo cabe holgadamente en cualquier GPU consumer (incluso < 1 GB en FP32, menos aún en BF16/FP16).
- GPU recomendadas: cualquier GPU con soporte CUDA; el entrenamiento se realizó en una NVIDIA A100 80 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: PyTorch nativo (el repo incluye `config.json` y `recipe.json`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, del tamaño de lote y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | SI-SDRi test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m8 plain seed2 (este) | 1.293.568 | crops de 4 s a 8 kHz, hasta 8 fuentes | 7,3291 dB | public-access-no-weight-license-grant | Hugging Face |
| TF-Locoformer Medium (artículo original) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros separadores MixIT en FUSS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de benchmarks frente a alternativas en la información proporcionada; la comparación con el modelo Medium del artículo solo puede establecerse cualitativamente (este modelo es una configuración compacta, no el Medium original).

## Limitaciones y advertencias

- Licencia restrictiva: "public-access-no-weight-license-grant" no concede derechos de uso sobre los pesos; el uso comercial requiere revisión legal explícita del archivo LICENSE-WEIGHTS.md.
- Modelo de investigación con 0 descargas y 0 likes; sin validación por la comunidad.
- Salidas no ordenadas: las 8 ranuras no son clases semánticas ni identidades de fuente; requieren asignación posterior (p. ej. húngara) para evaluar.
- Entrenado solo a 8 kHz mono; no adecuado para audio de banda ancha, música de alta fidelidad ni streaming en tiempo real.
- Evaluación en test limitada a 256 escenas de los shards 8–11, no al split completo; el intervalo de confianza es amplio ([6,24, 8,40] dB).
- Una sola semilla (seed 2): no hay estimación de variabilidad entre semillas.
- El checkpoint se seleccionó por MixIT de validación, no por SI-SDRi; el rendimiento de separación puede no ser el óptimo para esa métrica.
- La consistencia de mezcla exacta no garantiza una separación correcta; MixIT dB alto no implica SI-SDRi alto.
- Riesgo de artefactos y de asignación errónea en escenas con fuentes silenciosas o de baja energía (se excluyen referencias por debajo de umbrales de energía).
- Sin soporte de texto, tool calling ni agentes; no debe presentarse como modelo de lenguaje.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed2
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed2/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS (referencia): https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
