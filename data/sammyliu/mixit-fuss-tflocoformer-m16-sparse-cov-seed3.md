# sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed3

## Resumen

MixIT FUSS TF-Locoformer m16 sparse-cov seed3 es un modelo de separación de fuentes de audio desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un separador de audio offline que opera a 8 kHz y que ha sido entrenado mediante mixture-invariant training (MixIT) sobre mezclas reverberantes observadas del conjunto de datos FUSS, sin disponer de fuentes aisladas como objetivos de entrenamiento. El modelo produce 16 slots de salida no ordenados que no corresponden a clases semánticas concretas.

La arquitectura es un TF-Locoformer compacto (transformer con bloques dual-path sobre ejes de tiempo y frecuencia) con 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones. El modelo completo contiene 1.302.800 parámetros, lo que lo sitúa en la categoría de modelos muy ligeros, adecuados para despliegue en entornos con recursos limitados. La entrada se procesa mediante STFT con FFT de 256 y hop de 128.

El modelo es relevante como ejemplo reproducible de entrenamiento MixIT sin objetivos aislados sobre FUSS, con una receta de entrenamiento documentada de forma exhaustiva (60.000 actualizaciones, semilla 3, A100 80GB) y métricas de evaluación publicadas con intervalos de confianza. Su licencia restrictiva (public-access-no-weight-license-grant) limita su uso comercial, por lo que su interés principal es de investigación y reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path sobre tiempo y frecuencia) |
| Parametros totales | 1.302.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 4 segundos a 8 kHz) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto con 3 bloques dual-path, 64 canales, 4 cabezas de atención, FFN de 128 dimensiones, kernel de convolución 4 y 4 grupos de normalización RMS. La atención es no causal tanto en el eje temporal como en el frecuencial. La entrada se transforma con STFT de FFT 256, hop 128 y ventana Hann con padding constante centrado. El wrapper de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la síntesis. Esta configuración compacta no corresponde al modelo Medium del paper original.

El entrenamiento se realizó sobre FUSS reverberante (20.000 escenas de entrenamiento, 1.000 de validación) con MixIT: cada ejemplo muestrea dos escenas observadas distintas con crops aleatorios independientes de 4 segundos, y cada escena contiene entre 1 y 4 fuentes (la mezcla de mezclas puede contener hasta 8). Se usó AdamW con betas (0.9, 0.999), weight decay 0.01, learning rate pico 0.001 con warmup lineal de 1.000 pasos y schedule coseno con suelo 0.0001, clipping de gradiente de norma global 5, precisión BF16 en el backbone y FP32 en STFT, síntesis, asignación y objetivo. La asignación MixIT eficiente resuelve primero una ecuación lineal con pseudoinversa de respaldo y asigna cada salida a la rama con mayor coeficiente; los gradientes no se diferencian a través del argmax. La pérdida total añade un término de esparsidad RMS de fuentes (peso 4.0) y un término de covarianza de forma de onda fuera de diagonal (peso 0.1). El entrenamiento se ejecutó durante 60.000 actualizaciones en una NVIDIA A100 80GB con PyTorch 2.7.1 y CUDA 12.6.

## Capacidades

- Separación de fuentes de audio offline a 8 kHz sobre mezclas reverberantes con hasta 8 fuentes combinadas.
- Producción de 16 slots de salida no ordenados (no son clases semánticas; la asignación a fuentes reales requiere un emparejamiento posterior, por ejemplo húngaro).
- Entrenamiento mixture-invariant: no requiere fuentes aisladas como objetivo, lo que permite entrenar sobre mezclas reales observadas.
- Consistencia de mezcla mediante proyección de residuo equitativa sobre todos los slots de salida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto: es un modelo puramente de audio.
- No dispone de modo thinking, visión ni audio de entrada/salida en sentido generativo.

## Casos de uso

- Investigación en separación de fuentes sin supervisión: el modelo sirve como referencia reproducible de MixIT sobre FUSS, con receta y métricas completas para comparar variantes de asignación o funciones de pérdida.
- Separación de mezclas reverberantes en entornos de investigación acústica: procesa crops de 4 segundos a 8 kHz y devuelve 16 slots que pueden emparejarse con fuentes activas mediante asignación húngara.
- Generación de datos sintéticos de entrenamiento: los slots separados pueden usarse como pseudo-fuentes para aumentar corpus en pipelines de reconocimiento de voz o diarización, siempre que se valide la calidad.
- Evaluación de técnicas de consistencia de mezcla: el modelo incorpora proyección de residuo equitativa, útil para estudiar el equilibrio entre consistencia exacta y separación real.
- Reproducción de experimentos con semilla fija: al incluir pesos finales, inicialización aleatoria y los cinco mejores checkpoints, permite reproducir curvas de validación y comparar selección por MixIT frente a SI-SDRi.
- Estudio de esparsidad y covarianza en objetivos MixIT: los pesos 4.0 y 0.1 documentados permiten ablaciones controladas sobre estos regularizadores.
- Prototipado de separadores ligeros en dispositivos con recursos limitados: con 1,3 M de parámetros, es viable como base para experimentos de destilación o despliegue en CPU.

## Benchmarks y rendimiento

| Medicion | Valor (dB) |
|---|---|
| MixIT en entrenamiento (64 MoMs fijos) | 13,0189 |
| MixIT en validación holdout (64 MoMs fijos) | 12,8326 |
| SI-SDRi de fuentes en validación (653 escenas multi-fuente) | 7,2230 |
| SI-SDRi de fuentes en test (166 escenas multi-fuente) | 7,2340 |
| Intervalo bootstrap 95% para SI-SDRi de test | [6,1898, 8,2730] |
| MixIT en señal de entrenamiento (últimas 20 minibatches, update 60.000) | 13,8584 |
| MixIT en validación (update 60.000) | 12,8051 |
| SI-SDRi de validación en subconjunto de 128 escenas (update 60.000) | 6,6012 |

El checkpoint seleccionado (`model.safetensors`) corresponde a la actualización 51.000, elegido por score MixIT de validación, no por SI-SDRi ni por rendimiento en test. El intervalo de confianza describe la incertidumbre entre escenas evaluadas para esta semilla, no entre semillas de entrenamiento. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,3 M de parámetros, los pesos en FP32 ocupan aproximadamente 5 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento documentado usó una NVIDIA A100 80GB, pero la inferencia no requiere hardware de gama alta.
- Cabe en GPU consumer: sí, en cualquier modelo moderno (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (el repositorio incluye `config.json` y pesos safetensors); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de audio de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 seed3 | 1.302.800 | crops de 4 s a 8 kHz | SI-SDRi test 7,2340 dB | public-access-no-weight-license-grant | Hugging Face, safetensors |
| TF-Locoformer Medium (paper original) | no disponible | no disponible | no disponible | no disponible | no disponible en la información |
| Alternativas MixIT sobre FUSS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La licencia `public-access-no-weight-license-grant` restringe el uso; no se concede licencia de pesos para uso comercial según el enlace de licencia del repositorio. Verificar `LICENSE-WEIGHTS.md` antes de cualquier despliegue.
- Los 16 slots de salida son no ordenados y no corresponden a clases semánticas; requieren un emparejamiento posterior (por ejemplo, asignación húngara) para evaluar o usar las fuentes separadas.
- El modelo opera únicamente a 8 kHz y sobre crops de 4 segundos; no está diseñado para audio de mayor frecuencia de muestreo ni para contextos largos.
- La selección del checkpoint se hizo por score MixIT de validación, no por SI-SDRi ni por rendimiento en test; el rendimiento real de separación es modesto (SI-SDRi de test 7,2340 dB con intervalo [6,1898, 8,2730]).
- La consistencia de mezcla exacta no garantiza una separación correcta de fuentes; el propio autor lo advierte.
- El intervalo de confianza publicado describe incertidumbre entre escenas para una sola semilla, no entre semillas de entrenamiento.
- El test se evaluó sobre 256 escenas de los shards 8–11, no sobre el split completo.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje; el riesgo principal es la asignación incorrecta de slots a fuentes y el bajo rendimiento en escenas con muchas fuentes o reverberación severa.
- No hay soporte documentado de cuantización ni de formatos GGUF; el despliegue está pensado para PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed3
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed3/blob/main/LICENSE-WEIGHTS.md
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
- Dataset FUSS (referencia en la model card): https://huggingface.co/datasets/scaleinvariant/fuss-parquet
