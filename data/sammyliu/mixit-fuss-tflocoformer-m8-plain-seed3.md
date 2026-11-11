# sammyliu/mixit-fuss-tflocoformer-m8-plain-seed3

## Resumen

MixIT FUSS TF-Locoformer (8 slots, seed 3) es un modelo de separación de fuentes de audio desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un separador de audio offline que opera a 8 kHz y que fue entrenado mediante *mixture-invariant training* (MixIT) sobre mezclas reverberantes observadas del conjunto de datos FUSS, sin disponer de fuentes aisladas como objetivos de entrenamiento. El modelo reparte la señal de entrada en ocho "slots" de salida no ordenados, que no corresponden a clases semánticas concretas.

La relevancia del modelo es fundamentalmente metodológica: demuestra que es posible entrenar un separador de fuentes con una arquitectura compacta (apenas 1,29 millones de parámetros) usando únicamente mezclas observadas y una asignación MixIT eficiente, sin necesidad de datos limpios por fuente. El repositorio contiene un ajuste completo de 60.000 actualizaciones, los cinco mejores checkpoints según validación, los pesos finales y la inicialización aleatoria.

Arquitectónicamente es un TF-Locoformer compacto (transformer de doble vía sobre representaciones tiempo-frecuencia) con tres bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 unidades. No debe confundirse con el modelo "Medium" del artículo original: esta es una configuración reducida orientada a experimentación reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path sobre STFT) |
| Parámetros totales | 1.293.568 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 4 segundos a 8 kHz) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no aplica (modelo de audio); metadatos indican "en" |
| Licencia | public-access-no-weight-license-grant (licencia "other", ver LICENSE-WEIGHTS.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto que opera sobre espectrogramas STFT (FFT de 256, hop de 128, ventana Hann con padding constante centrado). La red usa 64 canales, 4 cabezas de atención, FFN de 128 unidades, kernel de convolución 4 y 4 grupos de normalización RMS. La atención es no causal tanto en el eje temporal como en el frecuencial. El wrapper de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la síntesis. La configuración completa está en `config.json` y la receta de optimización en `recipe.json`.

El entrenamiento emplea MixIT sobre el dataset FUSS reverberante (20.000 escenas de entrenamiento y 1.000 de validación, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`). Cada ejemplo combina dos escenas observadas distintas con crops aleatorios independientes de 4 segundos, en mono a 8 kHz; cada escena contiene de 1 a 4 fuentes, de modo que la mezcla de mezclas puede contener hasta 8. Se usaron 16 ejemplos por batch, 60.000 actualizaciones con semilla 3, AdamW (betas 0,9/0,999, epsilon 1e-8, weight decay 0,01), LR pico 0,001 con warmup lineal de 1.000 pasos y schedule coseno con suelo 0,0001, y clipping de norma global 5. La precisión fue BF16 en el backbone y FP32 en STFT, síntesis, asignación y objetivo, con TF32 permitido. El entrenamiento se ejecutó en una NVIDIA A100 de 80 GB con PyTorch 2.7.1 y CUDA 12.6.

La innovación técnica destacable es la asignación MixIT "hard efficient": primero resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` mediante resolución lineal con *fallback* a pseudoinversa, y luego asigna cada salida a la rama con mayor coeficiente. La pérdida es `-10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB, y los gradientes no se diferencian a través del argmax. Se aplica consistencia de mezcla mediante proyección residual equitativa sobre todos los slots. Los pesos de esparsidad RMS de fuente y de covarianza fuera de diagonal están a 0,0.

## Capacidades

- Separación de fuentes de audio en ocho slots de salida no ordenados (no son clases semánticas).
- Funcionamiento offline sobre mezclas reverberantes de 1 a 4 fuentes (hasta 8 en la mezcla de mezclas).
- Procesamiento de audio mono a 8 kHz con crops de 4 segundos.
- Entrenamiento mixture-invariant: no requiere fuentes aisladas para el ajuste.
- Consistencia de mezcla: la reconstrucción de los slots respeta la mezcla observada.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multimodales, de visión, audio-lenguaje ni modo "thinking".
- Capacidades multilingües: no aplica (modelo puramente de señal de audio).

## Casos de uso

- Investigación en separación de fuentes sin supervisión: sirve como referencia reproducible de MixIT con arquitectura compacta, permitiendo comparar recetas de asignación y schedules de entrenamiento sobre FUSS.
- Prototipado de pipelines de separación en entornos con recursos limitados: con 1,29 M de parámetros, el modelo puede ejecutarse en CPU o GPU de gama baja para validar ideas antes de escalar a arquitecturas mayores.
- Estudio de robustez a reverberación: al entrenarse sobre FUSS reverberante, es útil para analizar cómo afecta la reverberación a la separación con objetivos mixture-invariant.
- Reproducción de experimentos con semillas controladas: el repositorio incluye los cinco mejores checkpoints, los pesos finales y la inicialización, lo que facilita análisis de variabilidad entre checkpoints de un mismo fit.
- Análisis de asignación MixIT: permite estudiar el comportamiento de la asignación hard efficient y su efecto en la consistencia de mezcla y en la separación real.
- Evaluación comparativa de métricas: útil para contrastar MixIT dB frente a SI-SDRi y entender la brecha entre consistencia de mezcla y separación efectiva de fuentes.
- Docencia y divulgación: ejemplo didáctico de entrenamiento mixture-invariant con una receta completamente documentada y un tamaño manejable.

## Benchmarks y rendimiento

Resultados medidos por el autor para el checkpoint seleccionado (`model.safetensors`, actualización 59.000, elegido por MixIT de validación):

| Medición | Valor (dB) |
|---|---|
| MixIT en entrenamiento, 64 MoMs fijas | 13,0934 |
| MixIT en validación holdout, 64 MoMs fijas | 12,8852 |
| SI-SDRi de fuente en validación holdout, 653 escenas multi-fuente | 7,6417 |
| SI-SDRi de fuente en test, 166 escenas multi-fuente | 8,0062 |

Intervalo bootstrap al 95% para SI-SDRi de test: [6,9393; 9,1407] dB (incertidumbre entre escenas para esta semilla, no entre semillas de entrenamiento). En la actualización final (60.000), el MixIT de entrenamiento promediado sobre los últimos 20 minibatches fue 13,6449 dB, el MixIT de validación 12,8512 dB y el SI-SDRi de validación sobre el subconjunto de progreso de 128 escenas 6,9807 dB. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,29 M de parámetros los pesos en FP32 ocupan aproximadamente 5 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 en adelante) es suficiente; el entrenamiento se realizó en una A100 de 80 GB, pero la inferencia no requiere esa clase de hardware.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos cientos de MB libres; también es viable en CPU.
- Opciones de despliegue: PyTorch nativo con safetensors; no se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer 8 slots (este) | 1,29 M | crops de 4 s a 8 kHz | SI-SDRi test 8,0062 dB | public-access-no-weight-license-grant | Hugging Face |
| TF-Locoformer "Medium" del artículo original | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros separadores MixIT sobre FUSS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Los slots de salida son no ordenados y no corresponden a clases semánticas; requieren asignación posterior (por ejemplo, Húngara) para evaluarse contra referencias.
- El checkpoint se seleccionó por MixIT de validación, no por SI-SDRi ni por rendimiento en test; el rendimiento real de separación puede no ser óptimo.
- El modelo opera únicamente a 8 kHz en mono, lo que limita su uso en aplicaciones de audio de banda ancha o estéreo.
- La evaluación en test usa 256 escenas de los shards 8-11, no el split completo; los resultados pueden no generalizar a todo el conjunto.
- El intervalo de confianza refleja incertidumbre entre escenas para una sola semilla, no entre semillas de entrenamiento.
- La licencia es "public-access-no-weight-license-grant", con términos específicos en LICENSE-WEIGHTS.md; es imprescindible revisarla antes de cualquier uso comercial.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de artefactos o separaciones incorrectas en mezclas fuera de la distribución de FUSS.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.
- No hay datos publicados sobre sesgos demográficos o de otro tipo; al ser un modelo de señal, los sesgos relevantes serían los del dataset FUSS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed3
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed3/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Artículo MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Artículo TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
