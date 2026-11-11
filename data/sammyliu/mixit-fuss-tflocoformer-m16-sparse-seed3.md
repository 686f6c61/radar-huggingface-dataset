# sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed3

## Resumen

MixIT FUSS TF-Locoformer m16 sparse seed 3 es un modelo de separación de fuentes de audio entrenado mediante mixture-invariant training (MixIT) sobre mezclas reverberantes observadas del dataset FUSS, sin emplear fuentes aisladas como objetivos de entrenamiento. Lo desarrolla el usuario sammyliu y se publica como un artefacto de investigación reproducible: un único ajuste completado de 60.000 actualizaciones, con sus cinco mejores checkpoints por validación, los pesos finales y la inicialización aleatoria. El modelo opera en modo offline a 8 kHz, en mono, y produce 16 ranuras de salida no ordenadas que no corresponden a clases semánticas.

La arquitectura es un TF-Locoformer compacto (transformer dual-path sobre representaciones tiempo-frecuencia) con 3 bloques dual-path, 64 canales, 4 cabezas y FFN de 128, y un total de 1.302.800 parámetros según los pesos en safetensors. No es el modelo Medium del artículo original, sino una configuración reducida pensada para entrenamiento asequible en una sola GPU. El contexto no aplica en el sentido de los modelos de lenguaje: se procesan crops de 4 segundos con STFT de FFT 256 y hop 128.

Su relevancia es metodológica: demuestra que MixIT puede entrenar un separador sobre mezclas reverberantes reales sin etiquetas de fuente aislada, y publica métricas auditadas con intervalos de confianza por escena. El rendimiento medido es modesto (SI-SDRi de test de 6,7643 dB sobre 166 escenas multiescena), lo que lo sitúa como una línea base reproducible más que como un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path sobre STFT), 3 bloques dual-path |
| Parametros totales | 1.302.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; crops de 4 segundos a 8 kHz (STFT FFT 256, hop 128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de la model card; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (license: other) |
| Formato de pesos | safetensors (model.safetensors), más checkpoints e inicialización |
| Canales / cabezas / FFN | 64 / 4 / 128; kernel de convolución 4; 4 grupos de normalización RMS |
| Ranuras de salida | 16 |
| Frecuencia de muestreo | 8.000 Hz, mono |
| Precisión de entrenamiento | BF16 en backbone; FP32 en STFT, síntesis, asignación y objetivo; TF32 permitido |
| Dataset | scaleinvariant/fuss-parquet, revisión b183027b802d1a488dea8b6f1d80daa32b76b681 |
| Hardware de entrenamiento | 1x NVIDIA A100 80GB; PyTorch 2.7.1, CUDA 12.6 |

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto que aplica atención no causal tanto en el eje temporal como en el frecuencial, con 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128. La entrada se transforma con STFT (FFT 256, hop 128, ventana Hann, padding constante centrado) y un wrapper de forma de onda normaliza cada entrada por su RMS internamente, restaurando la amplitud tras la síntesis. La consistencia de mezcla se impone mediante proyección de residuo igual sobre todas las ranuras de salida.

El entrenamiento usa MixIT sobre el dataset FUSS reverberante (20.000 escenas de entrenamiento, 1.000 de validación), muestreando dos escenas observadas distintas por ejemplo con crops aleatorios independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes, de modo que la mezcla de mezclas puede contener hasta 8. La asignación MixIT eficiente resuelve A = X Y^T (Y Y^T + 1e-6 I)^(-1) con resolución lineal y fallback a pseudoinversa, asignando cada salida a la rama con mayor coeficiente; la pérdida es -10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8)) con umbral suave de 30 dB, más un término de esparsidad de RMS de fuente con peso 4,0 (el término de covarianza fuera de diagonal tiene peso 0,0). Se usa AdamW (betas 0.9/0.999, epsilon 1e-8, weight decay 0.01), LR pico 0.001 con warmup lineal de 1.000 pasos y decaimiento coseno hasta 0.0001, clipping de norma global 5, batch de 16 ejemplos y 60.000 actualizaciones con semilla 3. Los gradientes no se diferencian a través del argmax duro de la asignación.

## Capacidades

- Separación de fuentes de audio offline en mezclas reverberantes de hasta 8 fuentes combinadas.
- Producción de 16 ranuras de salida no ordenadas (no son clases semánticas; requieren asignación posterior).
- Entrenamiento mixture-invariant: no necesita fuentes aisladas como objetivo, solo mezclas observadas.
- Procesamiento a 8 kHz en mono, con crops de 4 segundos.
- Consistencia de mezcla garantizada por proyección de residuo igual sobre todas las ranuras.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües de texto.
- No dispone de modo thinking, visión ni audio de entrada/salida más allá del propio pipeline de separación.

## Casos de uso

- Investigación reproducible en separación de fuentes: sirve como línea base MixIT con métricas auditadas e intervalos de confianza por escena, útil para comparar variantes de arquitectura o funciones de pérdida bajo el mismo protocolo.
- Prototipado de separación de habla en entornos reverberantes: con 8 kHz y 16 ranuras, permite validar pipelines de diarización o mejora de habla antes de invertir en modelos mayores.
- Estudio de entrenamiento sin etiquetas: al no requerir fuentes aisladas, se puede aplicar a dominios donde solo hay mezclas disponibles, evaluando si MixIT converge con la receta publicada.
- Análisis de la asignación MixIT: el código de asignación eficiente y el término de esparsidad permiten experimentar con variantes de asignación y pesos de regularización sobre el mismo dataset FUSS.
- Docencia y divulgación: el tamaño reducido (1,3 M de parámetros) y la receta completa en recipe.json facilitan reproducir el entrenamiento en una sola GPU A100 80GB.
- Evaluación de robustez a reverberación: las métricas separadas de MixIT y SI-SDRi permiten medir cuánto de la consistencia de mezcla se traduce en separación real de fuentes.
- No es adecuado para producción de separación de alta fidelidad: el SI-SDRi de test de 6,7643 dB y el intervalo [5,7710, 7,7157] dB limitan su uso a investigación y pruebas.

## Benchmarks y rendimiento

| Medicion (checkpoint seleccionado, update 59.000) | dB |
|---|---:|
| MixIT en entrenamiento, 64 MoMs fijos de evaluación | 13,2560 |
| MixIT en validación holdout, 64 MoMs fijos de evaluación | 12,8206 |
| SI-SDRi de fuente en validación holdout, 653 escenas multiescena | 6,8047 |
| SI-SDRi de fuente en test, 166 escenas multiescena | 6,7643 |
| Intervalo bootstrap 95% de SI-SDRi de test (por escena) | [5,7710, 7,7157] |

| Medicion en el update final (60.000) | dB |
|---|---:|
| MixIT de señal de entrenamiento, media de las últimas 20 minibatches | 13,7686 |
| MixIT de validación | 12,6643 |
| SI-SDRi de fuente en validación, subconjunto de progreso de 128 escenas | 6,2262 |

El checkpoint se seleccionó por puntuación MixIT de validación, no por SI-SDRi de fuente ni por rendimiento en test. El test usa 256 escenas de los shards 8-11 del split de test fijado, no el split completo. La evaluación de fuente usa los cuatro segundos centrales de cada escena observada, sin formar mezcla de mezclas, con asignación húngara uno a uno tras eliminar medias y sin agrupación oracle de ranuras. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,3 M de parámetros y STFT de FFT 256, el modelo cabe holgadamente en cualquier GPU consumer (estimación no publicada; no disponible en la model card).
- GPU recomendadas: el entrenamiento usó una NVIDIA A100 80GB; para inferencia basta una GPU consumer moderna, aunque no se especifica un mínimo.
- Cabe en GPU consumer: sí, por tamaño de parámetros; las GPU concretas no están indicadas en la información disponible.
- Opciones de despliegue: PyTorch 2.7.1 con CUDA 12.6 es el entorno de referencia; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.
- Precisión: BF16 en backbone y FP32 en STFT, síntesis, asignación y objetivo; TF32 permitido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | SI-SDRi de test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 sparse seed 3 | 1.302.800 | crops de 4 s a 8 kHz | 6,7643 dB (166 escenas) | public-access-no-weight-license-grant | Hugging Face |
| TF-Locoformer Medium del artículo original | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas MixIT sobre FUSS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada; la comparativa con el modelo Medium del artículo no es posible porque la model card no incluye sus métricas.

## Limitaciones y advertencias

- Rendimiento modesto: SI-SDRi de test de 6,7643 dB con intervalo [5,7710, 7,7157] dB; no apto para producción de alta fidelidad.
- Las 16 ranuras de salida son no ordenadas y no corresponden a clases semánticas; requieren asignación posterior (húngara u oracle) para evaluar fuentes concretas.
- El checkpoint se seleccionó por MixIT de validación, no por SI-SDRi de fuente ni por test; el rendimiento en separación real puede no ser el óptimo del ajuste.
- La consistencia de mezcla exacta no garantiza separación correcta de fuentes, según advierte la propia model card.
- Solo audio a 8 kHz en mono; no adecuado para música ni para audio de banda ancha sin remuestreo.
- Entrenado únicamente con datos en inglés (etiqueta en) y sobre FUSS reverberante; posible sesgo hacia las condiciones acústicas de ese dataset.
- Licencia restrictiva: public-access-no-weight-license-grant, catalogada como "other"; revisar LICENSE-WEIGHTS.md antes de cualquier uso comercial.
- El test usa solo 256 escenas de los shards 8-11, no el split completo; la incertidumbre reportada es por escena para una sola semilla, no entre semillas.
- No se afirma igualdad bit a bit entre hardware o versiones de PyTorch distintas.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí de artefactos de separación en fuentes silenciosas o de baja energía (denominadores con suelo de 1e-8).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed3
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed3/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS en Hugging Face: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Artículo MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Artículo TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
