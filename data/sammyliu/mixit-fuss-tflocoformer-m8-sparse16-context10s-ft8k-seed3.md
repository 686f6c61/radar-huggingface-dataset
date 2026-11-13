# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed3

## Resumen

El modelo `sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed3` es un separador de fuentes de audio entrenado con la técnica MixIT (Mixture Invariant Training) sobre mezclas reverberantes del corpus FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario de Hugging Face `sammyliu` como un fine-tune del modelo base `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed3`, y está pensado para separar hasta ocho fuentes simultáneas a partir de una única mezcla observada, operando en modo offline y no causal a 8 kHz.

La arquitectura es un backbone compacto TF-Locoformer (variante con atención y convolución en dominio tiempo-frecuencia) con 8 slots de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones. El modelo completo contiene 1.293.568 parámetros y procesa ventanas de 10 segundos (80.000 muestras a 8 kHz), lo que lo convierte en una pieza muy ligera y adecuada para experimentación o despliegue en entornos con recursos limitados.

La relevancia de esta ficha radica en que documenta un caso de entrenamiento sin etiquetas de fuente (solo con mezclas observadas), un régimen poco habitual y útil para escenarios donde no se dispone de datos aislados. El autor publica métricas de desarrollo detalladas (MixIT y SI-SDRi) y advierte explícitamente de que no se ha realizado evaluación en un conjunto de test independiente, por lo que las cifras deben interpretarse como rendimiento de desarrollo, no como rendimiento de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con bloques dual-path, atención y convolución en dominio tiempo-frecuencia) |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 10 segundos (80.000 muestras a 8 kHz); STFT con FFT 256 y hop 128 |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | no aplica (modelo de audio); la model card declara `en` |
| Licencia | public-access-no-weight-license-grant (licencia personalizada, ver LICENSE-WEIGHTS.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto con 8 slots de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones. Usa convolución con kernel 4 y 4 grupos de normalización RMS. La representación espectral se obtiene con STFT de FFT 256, hop 128, ventana Hann y padding constante centrado. El wrapper normaliza cada mezcla por RMS internamente, restaura la amplitud tras la síntesis y aplica consistencia de mezcla residual igualitaria (distribuye `mixture - sum(outputs)` entre las salidas). El entrenamiento se realizó en BF16 para el backbone y FP32 para STFT, síntesis, asignación y objetivo, con TF32 permitido, sobre una NVIDIA A100 80GB.

El entrenamiento sigue una receta en dos etapas. Primero se entrenó el modelo padre "plain" durante 60.000 actualizaciones, seleccionando el checkpoint de validación en la actualización 59.000. Después se cargaron esos pesos, se reiniciaron AdamW y el sampler, y se ejecutaron 8.000 actualizaciones de fine-tune con coeficiente de sparsity 16 (frente a 0 en el padre) y LR constante de 0,0001 sin warmup. Los datos son FUSS reverberante (revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`), con 20.000 escenas de entrenamiento y 1.000 de desarrollo; cada escena observada contiene entre 1 y 4 fuentes, y la mezcla de mezclas puede contener hasta 8. Se muestrean dos escenas distintas con recortes independientes y uniformes de 10 segundos, 80.000 muestras mono a 8 kHz y 16 pares por actualización. La pérdida es MixIT, sin etiquetas de fuente; las etiquetas de fuente solo se usaron para la selección de checkpoints y el desarrollo de la receta, no en la pérdida de entrenamiento.

## Capacidades

- Separación de fuentes de audio en modo offline y no causal, con hasta 8 slots de salida para mezclas que contienen hasta 8 fuentes.
- Entrenamiento sin objetivos de fuente aislada (MixIT), lo que permite aprovechar mezclas observadas sin anotar.
- Procesamiento de audio mono a 8 kHz con ventanas de 10 segundos (80.000 muestras).
- Salidas desordenadas y sin etiqueta semántica: los slots no corresponden a clases de fuente concretas.
- Aplicación de consistencia de mezcla residual para que la suma de salidas reconstruya la mezcla de entrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente de audio.
- No dispone de modo thinking, visión ni audio de entrada en sentido generativo; su tarea es la separación de mezclas.

## Casos de uso

- Separación de mezclas reverberantes en investigación: el modelo permite experimentar con MixIT sobre FUSS sin necesidad de fuentes aisladas, usando las 8 salidas para analizar escenas con hasta 8 fuentes y comparar checkpoints por SI-SDRi de desarrollo.
- Preprocesado de audio para pipelines de reconocimiento de voz: al separar hasta 8 fuentes de una mezcla a 8 kHz, puede usarse como etapa previa para aislar hablantes antes de un ASR de banda estrecha, aunque la tasa de 8 kHz limita la calidad final.
- Prototipado de separación en entornos con pocos recursos: con 1,29 M de parámetros y ventanas de 10 s, cabe en GPUs de consumo y permite iterar rápidamente en experimentos de separación.
- Evaluación de recetas de entrenamiento sin etiquetas: el modelo sirve como referencia para estudiar el efecto del coeficiente de sparsity (16 en este fine-tune frente a 0 en el padre) y de la selección de checkpoints guiada por fuente.
- Generación de datos sintéticos de separación: las salidas pueden usarse para aumentar corpus de audio con múltiples fuentes en escenarios de reverberación controlada.
- Análisis de escenas acústicas con múltiples fuentes: útil en estudios de contaminación acústica o monitorización ambiental donde se quiere descomponer una grabación en componentes sin etiquetas semánticas.
- Benchmarking de separadores ligeros: al publicar métricas de MixIT y SI-SDRi con intervalos bootstrap, facilita comparaciones reproducibles con otros separadores de tamaño similar.

## Benchmarks y rendimiento

| Medicion en el checkpoint seleccionado (actualizacion 7.000) | dB |
|---|---:|
| MixIT sobre señal de entrenamiento (media de 20 minibatches) | 14,2231 |
| MixIT sobre conjunto de entrenamiento (64 pares fijos) | 12,8731 |
| MixIT sobre desarrollo holdout (64 pares fijos) | 12,5841 |
| SI-SDRi de fuente en desarrollo holdout (653 escenas multifuente) | 9,5636 |

El intervalo bootstrap al 95% por escena para SI-SDRi de fuente es [8,9761; 10,1627] dB. En la actualización final 8.000 (evaluación común de 4 segundos): MixIT de entrenamiento 14,0261 dB, MixIT de holdout 12,5960 dB y SI-SDRi de fuente en holdout 9,1697 dB. Los cinco mejores checkpoints por SI-SDRi de desarrollo son: 7.000 (9,5636 dB), 3.000 (9,4932 dB), 4.000 (9,4928 dB), 6.000 (9,3403 dB) y 8.000 (9,1697 dB).

Para `final.safetensors` (no es `model.safetensors`), con entrada y puntuación de 10 segundos: MixIT de entrenamiento 14,0261 dB, MixIT de holdout 13,0288 dB, SI-SDRi de fuente uno a uno 11,7176 dB, intervalo bootstrap al 95% [11,2107; 12,2231] dB, SI-SDR absoluto 5,8379 dB y 742 escenas multifuente activas de 1.000. El autor advierte de que estas cifras no son comparables con el protocolo de selección de 4 segundos y de que no se realizó evaluación en test independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (1,29 M de parámetros); el cuello de botella es el procesamiento de ventanas de 10 s (80.000 muestras) y la STFT, no los pesos.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM; el entrenamiento se realizó en una NVIDIA A100 80GB, pero la inferencia no requiere esa escala.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1060, RTX 3060, RTX 4090 y similares, dado el reducido número de parámetros.
- Opciones de despliegue: PyTorch 2.7.1 con CUDA 12.6 (entorno de referencia); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed3 | 1.293.568 | 10 s a 8 kHz | Separación MixIT, 8 slots | public-access-no-weight-license-grant | Hugging Face |
| mixit-fuss-tflocoformer-m8-plain-seed3 (modelo base) | no disponible | no disponible | Separación MixIT, 8 slots | no disponible | Hugging Face |
| Otros separadores TF-Locoformer de la familia | no disponible | no disponible | Separación de fuentes | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada, por lo que no se pueden establecer comparaciones de rendimiento fiables.

## Limitaciones y advertencias

- No se realizó evaluación en un conjunto de test independiente; las métricas son de desarrollo y no deben presentarse como rendimiento de test no sesgado.
- La selección de checkpoints se hizo sobre la misma cohorte de desarrollo usada para reportar, lo que introduce sesgo de selección; los intervalos bootstrap no corrigen la variación entre semillas ni la selección.
- Las salidas son desordenadas y no tienen etiqueta semántica: el modelo no indica qué slot corresponde a qué fuente.
- El audio es mono a 8 kHz, lo que limita su uso en aplicaciones de alta fidelidad o en habla de banda ancha.
- El modelo es offline y no causal: no es adecuado para separación en tiempo real con latencia estricta.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de artefactos de separación: las salidas pueden contener componentes espurios cuando el número real de fuentes no coincide con los slots.
- La licencia `public-access-no-weight-license-grant` es personalizada y restringe la concesión de pesos; es imprescindible revisar `LICENSE-WEIGHTS.md` antes de cualquier uso comercial.
- El autor advierte de que la consistencia de mezcla exacta y las puntuaciones MixIT altas no garantizan la recuperación de fuentes individuales.
- No hay datos publicados sobre sesgos demográficos o de otro tipo, ni sobre latencia y throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed3
- Modelo base: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed3
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed3/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
