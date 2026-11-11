# sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed2

## Resumen

MixIT FUSS TF-Locoformer m16 sparse seed2 es un modelo de separación de fuentes de audio entrenado mediante *mixture-invariant training* (MixIT) sobre mezclas reverberantes del dataset FUSS. Lo desarrolla el usuario sammyliu y se publica como un artefacto de investigación reproducible: un único ajuste completo de 60.000 actualizaciones, con sus cinco mejores checkpoints de validación, los pesos finales y la inicialización aleatoria. No es un modelo de propósito general ni un sistema listo para producción, sino una referencia técnica para estudiar separación ciega de fuentes sin objetivos aislados.

El modelo opera en *offline* a 8 kHz, con audio mono, y produce 16 ranuras de salida no ordenadas que no corresponden a clases semánticas. La arquitectura es un TF-Locoformer compacto (3 bloques dual-path, 64 canales, 4 cabezas, FFN de 128) con 1.302.800 parámetros totales. La innovación metodológica es que se entrena sin fuentes aisladas: aprende a reconstruir dos mezclas observadas asignando sus salidas a cada rama mediante una resolución lineal y un argmax duro.

Su relevancia actual es doble: por un lado, demuestra que MixIT con asignación eficiente y consistencia de mezcla puede obtener una mejora de SI-SDRi medible (6,74 dB en test) con un modelo de apenas 1,3 M de parámetros; por otro, su licencia restrictiva y su naturaleza de artefacto de investigación lo hacen inadecuado para uso comercial directo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path sobre STFT) |
| Parámetros totales | 1.302.800 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 4 segundos a 8 kHz; atención no causal en tiempo y frecuencia) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (otra, ver LICENSE-WEIGHTS.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto con 16 ranuras de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128, kernel de convolución 4 y 4 grupos de normalización RMS. La STFT usa FFT de 256, hop de 128 y ventana Hann con padding constante centrado. La atención es no causal tanto en el eje temporal como en el frecuencial. El wrapper de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la síntesis. Esta configuración compacta no es el modelo Medium del artículo original.

El entrenamiento usa MixIT sobre el dataset FUSS reverberante (20.000 escenas de entrenamiento, 1.000 de validación, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`). Cada ejemplo muestrea dos escenas observadas distintas con crops aleatorios independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes, y la mezcla de mezclas puede llegar a 8. Se usan 16 ejemplos por batch, 60.000 actualizaciones, AdamW (betas 0,9/0,999, epsilon 1e-8, weight decay 0,01), LR pico 0,001 con warmup lineal de 1.000 pasos multiplicado por schedule coseno y suelo de 0,0001, clipping de norma global 5 y precisión BF16 en el backbone con FP32 en STFT, síntesis, asignación y objetivo. La asignación MixIT resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` y asigna cada salida a la rama de mayor coeficiente; la pérdida es `-10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB, más 4,0 veces la penalización de RMS por fuente y 0,0 veces la covarianza off-diagonal. Los gradientes no atraviesan el argmax duro. Se entrenó con PyTorch 2.7.1 y CUDA 12.6 en una NVIDIA A100 80GB.

## Capacidades

- Separación ciega de fuentes de audio en modo offline a 8 kHz sobre mezclas reverberantes.
- Producción de 16 ranuras de salida no ordenadas, sin correspondencia semántica con fuentes concretas.
- Procesamiento de mezclas de mezclas con hasta 8 fuentes combinadas.
- Consistencia de mezcla mediante proyección de residuo igual sobre todas las ranuras.
- Normalización interna de amplitud por RMS con restauración posterior.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto: es un modelo puramente de audio.
- No dispone de modo *thinking*, visión ni audio de entrada/salida más allá de la separación.

## Casos de uso

- Investigación en separación ciega de fuentes: sirve como referencia reproducible de MixIT con asignación eficiente y consistencia de mezcla, útil para comparar variantes de pérdida y de arquitectura.
- Estudio de entrenamiento sin fuentes aisladas: permite analizar cómo se comporta un modelo cuando solo dispone de mezclas observadas, midiendo la brecha entre la puntuación MixIT y el SI-SDRi real.
- Reproducción de experimentos: el repositorio incluye `recipe.json`, `config.json` y `metrics.json`, lo que facilita replicar el ajuste con la misma revisión del dataset y las mismas semillas.
- Análisis de calibración de incertidumbre: los intervalos bootstrap por escena permiten estudiar la variabilidad del SI-SDRi con un único seed.
- Docencia y divulgación: modelo pequeño (1,3 M de parámetros) que cabe en cualquier GPU consumer y permite ilustrar conceptos de STFT, dual-path y MixIT en clases prácticas.
- Evaluación de metodologías de asignación: la implementación con resolución lineal y fallback de pseudoinversa es un caso concreto para comparar con asignación binaria exhaustiva o SDR invariante a escala.
- Prototipado de pipelines de separación a 8 kHz: útil como bloque inicial en experimentos de *speech enhancement* o *music separation* de baja resolución, siempre que se respete la licencia.

## Benchmarks y rendimiento

| Medición (checkpoint seleccionado, update 56.000) | dB |
|---|---:|
| MixIT en entrenamiento, 64 MoMs fijas | 13,2613 |
| MixIT en validación holdout, 64 MoMs fijas | 12,9527 |
| SI-SDRi de fuente en validación holdout, 653 escenas multi-fuente | 6,6021 |
| SI-SDRi de fuente en test, 166 escenas multi-fuente | 6,7401 |

Intervalo bootstrap del 95 % para el SI-SDRi de test: [5,6974; 7,7810] dB. En la actualización final (60.000), el MixIT de entrenamiento promediado sobre los últimos 20 minibatches fue 13,7554 dB, el MixIT de validación 12,9466 dB y el SI-SDRi de validación sobre el subconjunto de progreso de 128 escenas 6,0541 dB. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, por debajo de 1 GB con los 1,3 M de parámetros en FP32; inferior a 500 MB en BF16/FP16.
- GPU recomendadas: cualquier GPU con soporte CUDA; el entrenamiento se realizó en una NVIDIA A100 80GB, pero la inferencia no requiere esa clase de hardware.
- Cabe en GPU consumer: sí, en cualquier RTX, GTX o incluso en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo con safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de audio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 sparse seed2 | 1.302.800 | crops de 4 s a 8 kHz | SI-SDRi test 6,7401 dB | public-access-no-weight-license-grant | Hugging Face |
| TF-Locoformer Medium (artículo original) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos MixIT de referencia del paper arXiv:2006.12701 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: `public-access-no-weight-license-grant` no concede permiso de uso comercial de los pesos; es imprescindible revisar `LICENSE-WEIGHTS.md` antes de cualquier despliegue.
- Artefacto de investigación de un único seed (seed 2): no hay evidencia de robustez entre semillas, y el intervalo de confianza publicado describe variabilidad entre escenas, no entre entrenamientos.
- Las 16 ranuras de salida son no ordenadas y no semánticas: no se puede asumir que una ranura concreta corresponda a una fuente concreta.
- El checkpoint se seleccionó por MixIT de validación, no por SI-SDRi ni por rendimiento en test; la puntuación MixIT no garantiza una separación correcta por sí sola.
- Evaluación de test limitada a 256 escenas de los shards 8–11, no al split completo.
- Operación a 8 kHz mono: inadecuado para audio de banda ancha, música de alta fidelidad o voz telefónica de 16 kHz sin remuestreo.
- Atención no causal: no apto para streaming ni aplicaciones de baja latencia en tiempo real.
- Riesgo de alucinación en el sentido de artefactos de separación: puede reconstruir mezclas de forma consistente sin separar realmente las fuentes.
- Sesgos: no documentados; el dataset FUSS reverberante condiciona el dominio acústico y los idiomas de las fuentes.
- No hay garantía de igualdad bit a bit entre hardware o versiones de PyTorch distintas.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed2
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed2/blob/main/LICENSE-WEIGHTS.md
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
- Dataset FUSS (referencia): https://huggingface.co/datasets/scaleinvariant/fuss-parquet
