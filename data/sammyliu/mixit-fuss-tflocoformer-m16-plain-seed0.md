# sammyliu/mixit-fuss-tflocoformer-m16-plain-seed0

## Resumen

MixIT FUSS TF-Locoformer m16 plain seed0 es un modelo de separación de fuentes de audio entrenado mediante *mixture-invariant training* (MixIT) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario sammyliu y se publica como un artefacto de investigación reproducible: una única ejecución completa de 60.000 actualizaciones, sus cinco mejores checkpoints según validación, los pesos finales y la inicialización aleatoria. El modelo opera a 8 kHz en modo *offline* y produce 16 ranuras de salida desordenadas, que no corresponden a clases semánticas.

La arquitectura es un TF-Locoformer compacto (transformer con bloques *dual-path* sobre representaciones tiempo-frecuencia), con 3 bloques dual-path, 64 canales, 4 cabezas y FFN de 128, sobre STFT de FFT 256 y hop 128. El recuento real de parámetros en safetensors es de 1.302.800, es decir, aproximadamente 1,3 millones de parámetros, lo que lo sitúa en la categoría de modelos muy pequeños y desplegables en CPU.

Su relevancia es metodológica más que de producto: demuestra un pipeline completo de separación entrenado solo con mezclas observadas, con métricas auditadas (MixIT en dB y SI-SDRi de fuente), intervalos de confianza por *bootstrap* de escenas y una receta de entrenamiento detallada. No es un modelo listo para producción ni sustituye al modelo Medium del artículo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path sobre STFT), 3 bloques dual-path |
| Parametros totales | 1.302.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; procesa crops de 4 segundos a 8 kHz (32.000 muestras) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (license: other) |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto que opera sobre la STFT (FFT 256, hop 128, ventana Hann con padding constante centrado). La configuración usa 64 canales, 4 cabezas de atención, FFN de 128, kernel de convolución 4 y 4 grupos de normalización RMS, con 16 ranuras de salida. La atención es no causal tanto en el eje temporal como en el frecuencial. Un *wrapper* de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la síntesis. Esta configuración compacta no equivale al modelo Medium del artículo original.

El entrenamiento emplea MixIT sobre el dataset FUSS reverberante (20.000 escenas de entrenamiento, 1.000 de validación, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`). Cada ejemplo toma dos escenas observadas distintas con crops aleatorios independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes, de modo que la mezcla de mezclas puede llegar a 8 fuentes. Se entrenó con AdamW (betas 0,9/0,999, epsilon 1e-8, weight decay 0,01), LR pico 0,001 con *warmup* lineal de 1.000 pasos y schedule coseno con suelo 0,0001, clipping de norma global 5, precisión BF16 en el *backbone* y FP32 en STFT, síntesis, asignación y objetivo, sobre una NVIDIA A100 de 80 GB durante 60.000 actualizaciones con batch de 16.

La asignación MixIT es la variante "hard efficient": resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` con resolución lineal y *fallback* a pseudoinversa, y asigna cada salida a la rama con mayor coeficiente. La pérdida es `-10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB, más dos términos de regularización con peso 0,0 (esparsidad RMS de fuentes y covarianza *off-diagonal* de forma de onda). Los gradientes no se diferencian a través del argmax duro. Se aplica proyección de consistencia de mezcla con residuo equitativo sobre todas las ranuras. El checkpoint seleccionado es el de la actualización 55.000, elegido por MixIT de validación y no por SI-SDRi.

## Capacidades

- Separación de fuentes de audio *offline* a 8 kHz, con 16 ranuras de salida desordenadas (no son clases semánticas).
- Entrenamiento y evaluación sobre mezclas reverberantes de 1 a 8 fuentes, sin necesidad de fuentes aisladas durante el entrenamiento.
- Proyección de consistencia de mezcla: las salidas reconstruyen la mezcla observada de forma consistente.
- Procesamiento de *crops* de 4 segundos (32.000 muestras a 8 kHz) con atención no causal en tiempo y frecuencia.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de audio.
- No dispone de modo *thinking*, visión ni audio de entrada en sentido generativo; su tarea es la separación de mezclas.

## Casos de uso

- Investigación en separación ciega de fuentes: reproduce una receta MixIT completa con semilla fija, revisión de dataset y métricas auditadas, útil para comparar variantes de asignación o de arquitectura.
- *Baseline* reproducible para experimentos académicos: al incluir inicialización aleatoria, pesos finales y cinco checkpoints, permite estudiar la variabilidad entre checkpoints de una misma ejecución.
- Prototipado de separación en entornos de baja latencia y recursos: con 1,3 millones de parámetros, cabe en CPU y en GPUs de consumo para pruebas rápidas a 8 kHz.
- Análisis de escenas reverberantes de reuniones o entornos domésticos: el modelo está entrenado sobre FUSS reverberante con 1-4 fuentes por escena, lo que encaja con grabaciones de conversación.
- Docencia y divulgación: ejemplo autocontenido de entrenamiento con pérdida MixIT, asignación húngara en evaluación y cálculo de SI-SDRi.
- Generación de datos sintéticos de separación: las 16 ranuras pueden usarse como estimaciones iniciales para *fine-tuning* supervisado cuando se disponga de fuentes aisladas.

## Benchmarks y rendimiento

Resultados medidos por el autor en el checkpoint seleccionado (actualización 55.000):

| Metrica | Valor (dB) |
|---|---|
| MixIT en entrenamiento, 64 MoMs fijos de evaluación | 13,0726 |
| MixIT en validación holdout, 64 MoMs fijos de evaluación | 12,9248 |
| SI-SDRi de fuente en validación holdout, 653 escenas multifuente | 6,3360 |
| SI-SDRi de fuente en test, 166 escenas multifuente | 6,4462 |
| Intervalo *bootstrap* de escenas al 95% para SI-SDRi de test | [5,4590, 7,4251] |

En la actualización final (60.000), la media de MixIT de entrenamiento sobre los últimos 20 minibatches registrados fue 14,4777 dB, la validación MixIT 12,8059 dB y el SI-SDRi de validación sobre el subconjunto de progreso de 128 escenas 5,6971 dB. El autor advierte que la consistencia de mezcla exacta no garantiza una separación correcta y que el intervalo de confianza describe incertidumbre entre escenas para una sola semilla, no entre semillas de entrenamiento. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (1,3 millones de parámetros ocupan unos 5 MB en pesos; el grueso del consumo es el buffer de STFT y activaciones de 4 segundos).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento original usó una A100 de 80 GB por ejecución, pero la inferencia es trivial.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX moderna e incluso en CPU.
- Opciones de despliegue: PyTorch nativo con safetensors; no se han publicado integraciones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; a 8 kHz y 4 segundos por *crop*, el coste es muy bajo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | SI-SDRi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 plain seed0 | 1.302.800 | crops de 4 s a 8 kHz | 6,4462 dB en test (166 escenas) | public-access-no-weight-license-grant | Hugging Face, safetensors |
| TF-Locoformer Medium del artículo original | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Alternativas de separación supervisada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Modelo de investigación de una sola semilla: no hay evidencia de robustez entre semillas de entrenamiento.
- Las 16 ranuras de salida son desordenadas y no semánticas; requieren asignación posterior (por ejemplo, húngara) para evaluar o usar las fuentes.
- Operación limitada a 8 kHz mono y *crops* de 4 segundos; no se ha validado para audio de banda ancha ni para contextos más largos.
- El checkpoint se seleccionó por MixIT de validación, no por SI-SDRi ni por rendimiento en test, lo que puede no ser óptimo para aplicaciones de separación real.
- La evaluación de test usa 256 escenas de los *shards* 8-11, no el conjunto de test completo.
- Riesgo de alucinación no aplicable (no genera texto), pero sí de artefactos y de separaciones incorrectas cuando las fuentes se solapan o la reverberación es alta.
- Licencia restrictiva: `public-access-no-weight-license-grant` con enlace a `LICENSE-WEIGHTS.md`; no se concede permiso de uso de pesos por defecto, por lo que el uso comercial requiere revisión legal explícita.
- Sin soporte de *tool calling*, agentes ni multilingüismo; no debe presentarse como modelo de propósito general.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed0
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed0/blob/main/LICENSE-WEIGHTS.md
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
- Dataset FUSS en Hugging Face: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
