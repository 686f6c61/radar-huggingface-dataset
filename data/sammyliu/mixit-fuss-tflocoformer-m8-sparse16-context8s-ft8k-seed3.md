# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context8s-ft8k-seed3

## Resumen

El modelo `sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context8s-ft8k-seed3` es un separador de fuentes de audio (source separation) offline y no causal, desarrollado por el usuario sammyliu. Se trata de un fine-tune del modelo base `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed3`, entrenado con la técnica MixIT sobre mezclas reverberantes del dataset FUSS sin disponer de fuentes aisladas como objetivos de entrenamiento. El modelo opera a 8 kHz en mono y produce 8 ranuras de salida (slots) que no tienen un orden ni una clase semántica predefinida.

La arquitectura es un backbone compacto TF-Locoformer con 8 slots de salida y 3 bloques dual-path, con 64 canales, 4 cabezas de atención y FFN de 128. El modelo total es extremadamente pequeño: 1.293.568 parámetros según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de investigación ligeros más que en la de sistemas de producción a gran escala.

Este release corresponde a un fine-tune disperso (sparsity coefficient 16) de 8.000 actualizaciones partiendo de un checkpoint padre seleccionado en la actualización 59.000. El checkpoint principal `model.safetensors` corresponde a la actualización 7.000, seleccionada por su rendimiento en SI-SDRi de fuentes sobre el conjunto de desarrollo. Es relevante como ejemplo reproducible de receta de entrenamiento MixIT con auditoría de recuperación de fuentes, aunque sus métricas son de desarrollo y no de test independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con bloques dual-path), no causal |
| Parámetros totales | 1.293.568 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 8 segundos (64.000 muestras a 8 kHz); ventana completa de 10 s en grabación |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiqueta del repo); el modelo procesa audio, no texto |
| Licencia | public-access-no-weight-license-grant (licencia "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea un backbone TF-Locoformer compacto con 8 slots de salida y 3 bloques dual-path. La configuración interna es de 64 canales, 4 cabezas de atención y FFN de 128, con kernel de convolución 4 y 4 grupos de normalización RMS. La representación de audio usa STFT con FFT de 256, hop de 128, ventana Hann y padding constante centrado. La entrada es audio mono a 8.000 Hz con 64.000 muestras (8 segundos) y 16 pares por actualización del optimizador.

El entrenamiento sigue una receta de dos etapas. Primero se entrena el modelo padre "plain" durante 60.000 actualizaciones, seleccionando el checkpoint de validación MixIT en la actualización 59.000. Después se cargan esos pesos, se reinician el estado de AdamW y el sampler, y se ejecutan 8.000 actualizaciones de fine-tune disperso con coeficiente de sparsity 16 (el padre tenía 0). Se usa AdamW con betas (0,9; 0,999), epsilon 1e-8, weight decay 0,01, learning rate constante de 0,0001 sin warmup en el fine-tune, gradient clipping de norma global 5 y precisión BF16 en el backbone con FP32 en STFT, síntesis, asignación y objetivo. El entrenamiento se ejecutó en una NVIDIA A100 de 80 GB con PyTorch 2.7.1 y CUDA 12.6, con algoritmos deterministas.

Los datos provienen del dataset FUSS reverberante (revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`), con 20.000 escenas de entrenamiento y 1.000 de desarrollo. El muestreo toma dos escenas distintas con recortes independientes y uniformes de 8 segundos. Cada rama se divide por su RMS (con suelo de 1e-8) y las ramas se suman sin normalización adicional. Cada escena observada contiene entre 1 y 4 fuentes, y la mezcla de mezclas puede contener hasta 8. El wrapper normaliza internamente cada mezcla por RMS, restaura la amplitud tras la síntesis y aplica consistencia de mezcla residual equitativa.

## Capacidades

- Separación de fuentes de audio offline y no causal a 8 kHz en mono, con 8 ranuras de salida.
- Entrenamiento MixIT sin objetivos de fuentes aisladas: aprende a partir de mezclas observadas.
- Producción de 8 salidas no ordenadas y sin clase semántica asignada (los slots no corresponden a instrumentos ni voces concretas).
- Procesamiento de ventanas de audio de 8 segundos (64.000 muestras) con contexto de grabación de 10 segundos.
- Consistencia de mezcla: las salidas reconstruyen la mezcla de entrada mediante distribución residual equitativa.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No tiene capacidades de visión, texto ni audio de entrada en formato de lenguaje; solo procesa formas de onda de audio.

## Casos de uso

- Investigación en separación de fuentes con supervisión débil: sirve como receta reproducible de MixIT sobre FUSS para estudiar la diferencia entre métricas MixIT y SI-SDRi de fuentes, gracias a la auditoría de checkpoints cada 1.000 actualizaciones.
- Prototipado de separación de audio en entornos con recursos muy limitados: con 1,29 M de parámetros, se puede ejecutar en CPU o en GPUs de gama baja para validar pipelines antes de escalar a modelos mayores.
- Generación de datos sintéticos de separación: las 8 salidas pueden usarse como pseudo-etiquetas para preentrenar o aumentar datasets de separación, asumiendo que los slots no tienen orden semántico.
- Análisis de escenas reverberantes con múltiples fuentes (1 a 4 por escena, hasta 8 en la mezcla de mezclas): útil para estudiar el comportamiento del modelo en condiciones de reverberación real del dataset FUSS.
- Evaluación comparativa de técnicas de sparsity: el fine-tune con coeficiente 16 frente al padre con 0 permite medir el efecto de la dispersión en la recuperación de fuentes.
- Reproducción de experimentos académicos: la receta detallada (optimizador, LR, clipping, precisión, determinismo) y las revisiones de dataset fijadas permiten replicar el entrenamiento en una A100 80 GB.

## Benchmarks y rendimiento

Los datos publicados son métricas de desarrollo del propio autor, no de test independiente.

| Medición en el checkpoint seleccionado (actualización 7.000) | dB |
|---|---:|
| MixIT en señal de entrenamiento (media de 20 minibatches registrados) | 14,0558 |
| MixIT en conjunto de entrenamiento (64 pares fijos) | 12,8970 |
| MixIT en desarrollo holdout (64 pares fijos) | 12,7016 |
| SI-SDRi de fuentes en desarrollo holdout (653 escenas multi-fuente) | 9,7281 |

Intervalo bootstrap de escenas al 95 % para SI-SDRi de fuentes: [9,1626; 10,3369] dB. Este intervalo no cubre variación entre semillas ni la selección sobre la misma cohorte de desarrollo. No se realizó evaluación en test independiente.

En la actualización final fija 8.000 (evaluación común de 4 segundos): MixIT en señal de entrenamiento 14,0549 dB, MixIT holdout 12,5417 dB y SI-SDRi de fuentes holdout 9,3974 dB.

| Actualización del fine-tune | SI-SDRi de fuentes en desarrollo (dB) | Pesos |
|---|---:|---|
| 7000 | 9,7281 | `checkpoints/step-00007000.safetensors` |
| 5000 | 9,4416 | `checkpoints/step-00005000.safetensors` |
| 6000 | 9,4387 | `checkpoints/step-00006000.safetensors` |
| 2000 | 9,4296 | `checkpoints/step-00002000.safetensors` |
| 8000 | 9,3974 | `checkpoints/step-00008000.safetensors` |

Para `final.safetensors` con entrada y puntuación de 8 segundos: MixIT de entrenamiento 14,0549 dB, MixIT holdout 12,5836 dB y SI-SDRi de fuentes uno a uno 11,2249 dB, con intervalo bootstrap al 95 % de [10,6756; 11,7146] dB, SI-SDR absoluto de 5,2698 dB y 726 escenas multi-fuente activas de 1.000. El autor advierte que estas cifras no son comparables con las del protocolo de selección de 4 segundos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,29 M de parámetros, el modelo cabe holgadamente en cualquier GPU consumer (incluso menos de 1 GB en FP32, sin contar buffers de STFT).
- GPU recomendadas: no se especifican para inferencia; el entrenamiento se realizó en una NVIDIA A100 de 80 GB por ajuste, con dos hilos de CPU.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente; también es viable en CPU para ventanas de 8 segundos.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de audio de este tipo); el repo usa PyTorch y safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. El modelo pertenece a la familia de separadores MixIT sobre FUSS del mismo autor; el pariente directo es el modelo padre `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed3`, con la misma arquitectura y 8 slots, pero sin el fine-tune disperso (coeficiente 0 frente a 16) y con selección de checkpoint por MixIT de validación en la actualización 59.000.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mixit-fuss-tflocoformer-m8-sparse16-context8s-ft8k-seed3 | 1.293.568 | ventana de 8 s a 8 kHz | public-access-no-weight-license-grant | fine-tune disperso, selección por SI-SDRi de fuentes |
| mixit-fuss-tflocoformer-m8-plain-seed3 | no disponible | no disponible | no disponible | modelo padre, sin sparsity, selección por MixIT |

## Limitaciones y advertencias

- Las métricas publicadas son de desarrollo y no de test independiente; el autor advierte explícitamente que no deben presentarse como rendimiento de test no sesgado.
- La selección de checkpoint usó etiquetas de fuente, aunque no en la pérdida de entrenamiento; esto introduce sesgo de selección sobre la cohorte de desarrollo.
- Los slots de salida son no ordenados y sin clase semántica: no se puede asumir que la salida 1 sea una voz y la salida 2 un instrumento.
- Un MixIT alto y una consistencia de mezcla exacta no garantizan la recuperación de fuentes individuales.
- El modelo es no causal y offline: no es apto para separación en tiempo real con latencia estricta.
- Opera únicamente a 8 kHz en mono, lo que limita su uso en aplicaciones de música o voz de banda ancha.
- Solo se declara el idioma inglés en la etiqueta del repo; al ser un modelo de audio, la noción de idioma es poco aplicable, pero no hay evidencia de evaluación multilingüe.
- La licencia `public-access-no-weight-license-grant` restringe el uso de los pesos; es necesario revisar `LICENSE-WEIGHTS.md` antes de cualquier uso comercial.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí existe riesgo de artefactos y de asignación incorrecta de fuentes en mezclas complejas.
- El intervalo bootstrap publicado no corrige la variación entre semillas ni la selección del modelo o la receta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context8s-ft8k-seed3
- Modelo padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed3/tree/9b154cdc70f60d9eaabde1b7c75ec2d59b0087bb
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context8s-ft8k-seed3/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
