# sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1

## Resumen

MixIT FUSS TF-Locoformer m8 plain seed1 es un modelo de separación de fuentes de audio desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un separador de audio offline que opera a 8 kHz, entrenado mediante entrenamiento invariante a la mezcla (MixIT) sobre mezclas reverberantes observadas del conjunto de datos FUSS, sin utilizar fuentes aisladas como objetivos de entrenamiento. El modelo produce ocho ranuras de salida que no tienen un orden ni una correspondencia semántica predefinida con fuentes concretas.

La relevancia de este modelo radica en su enfoque de entrenamiento: al usar MixIT, no requiere datos de fuentes aisladas etiquetadas, lo que reduce la dependencia de datasets supervisados costosos. El repositorio contiene un ajuste completo de 60.000 actualizaciones, los cinco mejores checkpoints según validación, los pesos finales y la inicialización aleatoria, lo que facilita la reproducibilidad y el análisis del proceso de entrenamiento.

Arquitectónicamente, emplea un backbone compacto TF-Locoformer con 8 ranuras de salida y 3 bloques de doble ruta, con 64 canales, 4 cabezas de atención y FFN de 128 dimensiones. El modelo tiene 1.293.568 parámetros totales, una longitud de contexto no aplicable en el sentido de modelos de lenguaje (procesa segmentos de audio de 4 segundos) y está disponible únicamente en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con bloques de doble ruta), 3 bloques dual-path |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa segmentos de audio de 4 segundos; atención no causal en tiempo y frecuencia) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en BF16/FP32 según receta) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (licencia personalizada, ver LICENSE-WEIGHTS.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un separador de audio basado en un backbone TF-Locoformer compacto con 8 ranuras de salida y 3 bloques de doble ruta. La configuración incluye 64 canales, 4 cabezas de atención, FFN de 128 dimensiones, kernel de convolución 4 y 4 grupos de normalización RMS. La STFT utiliza FFT de 256, hop de 128, ventana Hann y padding constante centrado. La atención es no causal tanto en el eje temporal como en el frecuencial. El wrapper de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la síntesis.

El entrenamiento se realizó con MixIT sobre el dataset FUSS reverberante (20.000 escenas de entrenamiento, 1.000 de validación, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`). Cada ejemplo muestrea dos escenas observadas distintas con recortes aleatorios independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes, y la mezcla de mezclas puede contener hasta 8. Se usaron 16 ejemplos por batch, 60.000 actualizaciones del optimizador, semilla 1, AdamW con betas (0.9, 0.999), epsilon 1e-8, weight decay 0.01, learning rate pico 0.001 con warmup lineal de 1.000 pasos multiplicado por schedule coseno y suelo de 0.0001, y clipping de norma global 5. La precisión fue BF16 en el backbone y FP32 en STFT, síntesis, asignación y objetivo, con TF32 permitido. La consistencia de mezcla se aplica mediante proyección de residuo igual sobre todas las ranuras de salida. Los pesos de sparsidad RMS de fuente y de covarianza de forma de onda fuera de diagonal se fijaron a 0.0. El entrenamiento se ejecutó en una NVIDIA A100 80GB con PyTorch 2.7.1 y CUDA 12.6.

La asignación MixIT eficiente resuelve primero `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` mediante solve lineal con fallback a pseudoinversa, y luego asigna cada salida a la rama con mayor coeficiente. La pérdida media es `-10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB. Los gradientes no se diferencian a través del argmax duro. Los pares y offsets de recorte se muestrean en cada actualización con un generador Torch separado sembrado con `seed+10000`; la validación usa 64 pares y semilla de sampler 20261108.

## Capacidades

- Separación de fuentes de audio offline a 8 kHz con 8 ranuras de salida.
- Entrenamiento invariante a la mezcla (MixIT) sin necesidad de fuentes aisladas etiquetadas.
- Procesamiento de mezclas de mezclas (mixture of mixtures) con hasta 8 fuentes combinadas.
- Manejo de escenas con 1 a 4 fuentes por mezcla observada.
- Consistencia de mezcla mediante proyección de residuo igual sobre todas las ranuras.
- Normalización interna por RMS de la forma de onda de entrada y restauración de amplitud.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües no aplicables (procesa audio, etiqueta de idioma "en" en el repositorio).
- No dispone de modo thinking, visión ni audio de entrada más allá de la señal de audio a separar.

## Casos de uso

- Separación de voces en grabaciones de reuniones: el modelo puede procesar segmentos de 4 segundos de audio mono a 8 kHz para separar hasta 8 fuentes en ranuras independientes, útil en diarización o transcripción multi-hablante, aunque la baja tasa de muestreo limita la calidad para voz de banda ancha.
- Investigación en entrenamiento no supervisado de separación de fuentes: sirve como referencia reproducible de MixIT con receta completa, semilla fija y checkpoints intermedios, permitiendo estudiar la evolución del entrenamiento y la selección de checkpoints.
- Prototipado de pipelines de separación de audio en entornos con recursos limitados: sus 1,29 millones de parámetros permiten ejecución en CPU o GPU consumer, adecuado para pruebas de concepto y validación de arquitecturas TF-Locoformer compactas.
- Análisis de escenas acústicas reverberantes: entrenado sobre FUSS reverberante, puede emplearse para estudiar el efecto de la reverberación en la separación y como baseline en experimentos de robustez.
- Evaluación comparativa de métodos de asignación MixIT: el repositorio documenta la asignación eficiente con solve lineal y fallback a pseudoinversa, lo que permite reproducir y comparar variantes de asignación.
- Generación de datos sintéticos de entrenamiento: las 8 ranuras de salida pueden usarse para producir estimaciones de fuentes que alimenten otros modelos o para aumentar datasets en investigaciones de separación.
- Docencia y experimentación académica: al incluir inicialización aleatoria, pesos finales y cinco mejores checkpoints, facilita prácticas sobre entrenamiento MixIT, schedules de learning rate y selección por validación.

## Benchmarks y rendimiento

| Metrica | Valor (dB) |
|---|---|
| MixIT en entrenamiento (64 MoMs fijos) | 13.1351 |
| MixIT en validación holdout (64 MoMs fijos) | 12.8371 |
| SI-SDRi de fuente en validación holdout (653 escenas multi-fuente) | 7.7698 |
| SI-SDRi de fuente en test (166 escenas multi-fuente) | 8.1420 |
| Intervalo bootstrap 95% para SI-SDRi de test | [7.0508, 9.2052] |
| MixIT en señal de entrenamiento (últimas 20 minibatches, update 60.000) | 13.9829 |
| MixIT en validación (update 60.000) | 12.5112 |
| SI-SDRi de fuente en validación (subconjunto de 128 escenas, update 60.000) | 7.0362 |

El checkpoint `model.safetensors` fue seleccionado en la actualización 56.000 por score de reconstrucción MixIT de validación, no por SI-SDRi de fuente ni por rendimiento en test. El intervalo de confianza del 95% describe la incertidumbre entre escenas evaluadas para esta semilla, no entre semillas de entrenamiento. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en BF16 (1,29 M de parámetros), más memoria para buffers de STFT y activaciones; en la práctica, menos de 2 GB en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una NVIDIA A100 80GB, pero la inferencia es viable en GPUs consumer.
- Cabe en GPU consumer: sí, en modelos como RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (pesos safetensors), exportación a ONNX no documentada, integración en pipelines de audio con torchaudio; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de separación de fuentes.

## Limitaciones y advertencias

- Los slots de salida no están ordenados ni tienen correspondencia semántica con fuentes concretas; se requiere asignación posterior (por ejemplo, Hungarian) para evaluar o usar las salidas.
- El modelo opera a 8 kHz, lo que limita la calidad para aplicaciones de voz de banda ancha o música.
- Entrenado únicamente sobre el dataset FUSS reverberante; puede generalizar mal a dominios acústicos distintos.
- La selección del checkpoint se basó en MixIT de validación, no en SI-SDRi de fuente ni en rendimiento de test, por lo que el checkpoint final puede no ser óptimo para separación real.
- El intervalo de confianza de SI-SDRi corresponde a una sola semilla; no se caracteriza la variabilidad entre semillas.
- La licencia es personalizada (`public-access-no-weight-license-grant`); es necesario revisar LICENSE-WEIGHTS.md para conocer las restricciones de uso comercial.
- Riesgo de alucinación no aplicable (no es un modelo generativo de texto), pero sí riesgo de artefactos o separaciones incorrectas en escenas complejas.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.
- El modelo no incluye soporte de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1/blob/main/LICENSE-WEIGHTS.md
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
- Dataset FUSS (referencia en la model card): https://huggingface.co/datasets/scaleinvariant/fuss-parquet
