# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed0

## Resumen

El modelo `sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed0` es un separador de fuentes de audio no causal y offline que opera a 8 kHz, desarrollado por el usuario sammyliu. Se trata de un fine-tune de 20.000 actualizaciones sobre el modelo base `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0`, entrenado con la técnica MixIT (Mixture Invariant Training) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivos de entrenamiento. El modelo genera 8 ranuras de salida no ordenadas que no corresponden a clases semánticas predefinidas.

La arquitectura es un TF-Locoformer compacto (transformer con bloques dual-path) de tan solo 1.293.568 parámetros, con 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones. Trabaja con STFT de FFT 256 y hop 128 sobre audio mono a 8.000 Hz, con ventanas de 4 segundos (32.000 muestras). La atención es no causal tanto en tiempo como en frecuencia.

La relevancia de este modelo radica en su enfoque de entrenamiento: demuestra que es posible realizar separación de fuentes sin etiquetas de fuentes aisladas, usando únicamente mezclas observadas y la técnica MixIT. El fine-tune introduce un coeficiente de esparcimiento de 16 que no estaba presente en el modelo padre. Es un modelo de investigación con licencia restrictiva y sin evaluación en test independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path), no causal |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 muestras (4 segundos a 8 kHz); atención no causal en tiempo y frecuencia |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | en (audio en inglés; el modelo procesa señal de audio, no texto) |
| Licencia | public-access-no-weight-license-grant (licencia restrictiva, ver enlace LICENSE-WEIGHTS.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea un backbone TF-Locoformer compacto con 8 ranuras de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención, FFN de 128 dimensiones, kernel de convolución 4 y 4 grupos de normalización RMS. La STFT usa FFT de 256, hop de 128, ventana Hann y padding constante centrado. El wrapper normaliza cada mezcla por RMS internamente (con suelo de 1e-8), restaura la amplitud tras la síntesis y aplica consistencia de mezcla residual igualitaria: distribuye `mixture - sum(outputs)` equitativamente entre las ranuras. No hay dropout y el multiplicador residual de la FFN es 1.0.

El entrenamiento es en dos etapas. Primero se entrenó el modelo padre con un schedule de 60.000 actualizaciones, seleccionando el checkpoint de validación MixIT en la actualización 55.000. Después se cargaron esos pesos, se reiniciaron el optimizador AdamW y el sampler, y se ejecutaron 20.000 actualizaciones de fine-tune con un coeficiente de esparcimiento de 16 (ausente en el padre). Los datos son FUSS reverberante con 20.000 escenas de entrenamiento y 1.000 de desarrollo, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`. El muestreo toma dos escenas observadas distintas uniformemente y recortes independientes de 4 segundos. Cada escena contiene de 1 a 4 fuentes, y la mezcla de mezclas puede contener hasta 8. El lote es de 16 pares por actualización, con precisión BF16 en el backbone y FP32 en STFT, síntesis, asignación y objetivo. Se usó una NVIDIA A100 80GB por entrenamiento con PyTorch 2.7.1/CUDA 12.6.

La función de pérdida MixIT resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` mediante solve lineal con fallback a pseudoinversa. Cada salida se asigna a la referencia con mayor coeficiente y las salidas asignadas se suman. La pérdida es `-10 log10(max(||x||²,1e-8)/max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB. Los gradientes no diferencian a través del argmax. El fine-tune añade 16 veces `mean_m(rms(y_m))/||rms(y)||_2`. Ningún objetivo de fuente aislada entra en los gradientes.

## Capacidades

- Separación de fuentes de audio en 8 ranuras de salida no ordenadas a partir de mezclas reverberantes observadas.
- Procesamiento de audio mono a 8.000 Hz con ventanas de 4 segundos (32.000 muestras).
- Separación de mezclas que contienen hasta 8 fuentes (cada escena observada tiene de 1 a 4 fuentes, y la mezcla de mezclas puede llegar a 8).
- Funcionamiento offline y no causal: procesa la señal completa, sin restricción de latencia en tiempo real.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; es un modelo puramente de audio.
- No tiene capacidades multilingües en sentido textual; la etiqueta de idioma "en" se refiere al audio en inglés del dataset.
- No dispone de modo thinking, visión ni audio de entrada distinto de la mezcla a separar.

## Casos de uso

- Separación de fuentes en investigación de audio: el modelo permite experimentar con MixIT sin necesidad de fuentes aisladas etiquetadas, usando mezclas reverberantes del dataset FUSS como entrada. Es adecuado por su pequeño tamaño (1,29 M de parámetros) y su receta reproducible con semilla fija.

- Reproducción de experimentos de separación no supervisada: investigadores pueden cargar el checkpoint de la actualización 8.000 y comparar con los otros cuatro checkpoints publicados (2.000, 4.000, 6.000, 18.000) para estudiar la evolución del SI-SDRi de desarrollo a lo largo del fine-tune.

- Evaluación de la técnica de esparcimiento en separación de fuentes: el coeficiente de esparcimiento de 16 es la única diferencia respecto al padre; el modelo sirve para aislar el efecto de esta regularización en la recuperación de fuentes individuales.

- Prototipado de pipelines de separación de audio en entornos con recursos limitados: con 1,29 M de parámetros, el modelo puede ejecutarse en CPU o GPU consumer para pruebas de concepto, aunque su utilidad en producción es limitada por la licencia.

- Estudio de la consistencia de mezcla en separadores MixIT: el wrapper aplica consistencia residual igualitaria, lo que permite analizar cómo afecta esta restricción a la calidad de la separación frente a la reconstrucción MixIT.

- Generación de datos sintéticos de separación para entrenar otros modelos: las 8 salidas del modelo pueden usarse como pseudo-fuentes para aumentar datasets de separación, siempre que se respete la licencia restrictiva.

## Benchmarks y rendimiento

| Medicion en el checkpoint seleccionado (actualizacion 8.000) | dB |
|---|---:|
| MixIT sobre señal de entrenamiento (media de 20 minibatches registrados) | 13,4794 |
| MixIT sobre conjunto de entrenamiento (64 pares fijos) | 12,8568 |
| MixIT sobre desarrollo holdout (64 pares fijos) | 12,5607 |
| SI-SDRi de fuentes sobre desarrollo holdout (653 escenas multi-fuente) | 8,7169 |

Intervalo de confianza del 95% (bootstrap por escena) para SI-SDRi de fuentes: [8,1579, 9,2886] dB. Este intervalo cubre la variación entre escenas para este checkpoint, pero no la variación entre semillas ni la selección sobre la misma cohorte de desarrollo. No se realizó evaluación en test independiente.

En la actualización final fija 20.000: MixIT sobre señal de entrenamiento 13,9415 dB, MixIT holdout 12,5771 dB y SI-SDRi de fuentes holdout 8,4729 dB. Este endpoint difiere del checkpoint seleccionado.

| Actualizacion del fine-tune | SI-SDRi de fuentes en desarrollo (dB) | Pesos |
|---|---:|---|
| 8000 | 8,7169 | `checkpoints/step-00008000.safetensors` |
| 4000 | 8,6451 | `checkpoints/step-00004000.safetensors` |
| 6000 | 8,6089 | `checkpoints/step-00006000.safetensors` |
| 18000 | 8,6072 | `checkpoints/step-00018000.safetensors` |
| 2000 | 8,5352 | `checkpoints/step-00002000.safetensors` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo de separación de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB, dado que el modelo tiene 1.293.568 parámetros (aproximadamente 5 MB en FP32 y 2,6 MB en BF16). El cuello de botella es la STFT y el procesamiento de audio, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el entrenamiento se realizó en una NVIDIA A100 80GB, pero la inferencia no requiere hardware de gama alta.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (el modelo se distribuye en safetensors y usa PyTorch 2.7.1/CUDA 12.6). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo de audio.
- Latencia y throughput estimados: no disponibles. El modelo es no causal y offline, por lo que procesa ventanas completas de 4 segundos; no está diseñado para streaming en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed0 | 1.293.568 | 32.000 muestras (4 s a 8 kHz) | Separación de fuentes MixIT | public-access-no-weight-license-grant | Hugging Face |
| sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0 (modelo padre) | no disponible en la informacion | no disponible | Separación de fuentes MixIT | no disponible | Hugging Face |
| Modelos de separación supervisada (p. ej. Demucs, Conv-TasNet) | no disponible en la informacion | no disponible | Separación de fuentes con fuentes aisladas | varía | no disponible |

No se dispone de datos de benchmarks comparables con alternativas en la información proporcionada. La comparativa con Demucs o Conv-TasNet es cualitativa: este modelo se distingue por usar MixIT sin fuentes aisladas y por su tamaño extremadamente reducido, pero no hay números que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con FUSS reverberante en inglés, el modelo puede rendir peor en mezclas con características acústicas distintas (otros idiomas, dominios, condiciones de reverberación no representadas).
- Riesgo de alucinación: no aplica en el sentido textual, pero las 8 salidas no son fuentes semánticas; pueden contener artefactos o asignaciones incorrectas, y las ranuras no tienen orden ni correspondencia con fuentes reales.
- Limitaciones de contexto o idioma: solo procesa audio mono a 8 kHz y ventanas de 4 segundos; no soporta otras frecuencias de muestreo ni audio estéreo. La atención no causal impide uso en streaming.
- Restricciones de licencia: la licencia `public-access-no-weight-license-grant` es restrictiva; debe consultarse `LICENSE-WEIGHTS.md` antes de cualquier uso, incluido el comercial. No se garantiza permiso de uso comercial.
- Caveat importante para producción: no se realizó evaluación en test independiente; las métricas de desarrollo están sesgadas por selección de checkpoint sobre la misma cohorte. Los autores advierten explícitamente que no deben presentarse como rendimiento de test no sesgado.
- El modelo es un fine-tune de 20.000 actualizaciones sobre un padre de 55.000, no una trayectoria ininterrumpida de 80.000 actualizaciones; los números de actualización son pasos de fine-tune.
- El modelo es compacto y no equivale al modelo Medium original de la familia; su capacidad es limitada en comparación con separadores de mayor tamaño.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed0
- Modelo padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0/tree/35bf7d1be1b69a2f2bb22b756a28cc6f8084591c
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed0/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
