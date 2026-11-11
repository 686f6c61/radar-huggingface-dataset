# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed2

## Resumen

El modelo `mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed2` es un separador de fuentes de audio de 8 kHz desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un fine-tune del checkpoint `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed2`, entrenado con MixIT (Mixture Invariant Training) sobre mezclas reverberantes del dataset FUSS sin disponer de fuentes aisladas como objetivos de entrenamiento. El modelo produce 8 ranuras de salida desordenadas que representan fuentes separadas, no clases semanticas.

La arquitectura es un TF-Locoformer compacto (transformer con atención no causal en tiempo y frecuencia) con 3 bloques dual-path, 64 canales, 4 cabezas y FFN de 128 dimensiones. Con solo 1.293.568 parámetros totales, es un modelo extremadamente ligero orientado a separación de audio en inglés y a 8 kHz, lo que lo posiciona para despliegues con recursos muy limitados o investigación sobre recetas de entrenamiento MixIT.

La relevancia actual reside en su receta de entrenamiento en dos etapas: un preentrenamiento de 60.000 actualizaciones seguido de un fine-tune disperso de 20.000 actualizaciones con coeficiente de sparsity 16. El checkpoint publicado corresponde a la actualización 10.000 del fine-tune, seleccionado por SI-SDRi de fuente en desarrollo (8,4761 dB), no por MixIT. La licencia es restrictiva: `public-access-no-weight-license-grant`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con atención no causal en tiempo y frecuencia, 3 bloques dual-path) |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentos de 4 segundos a 8.000 Hz, 32.000 muestras) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | en |
| Licencia | public-access-no-weight-license-grant (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto con 8 ranuras de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones. Usa convolución con kernel 4 y 4 grupos de normalización RMS. La STFT emplea FFT de 256, hop de 128 y ventana Hann con padding constante centrado. La atención es no causal tanto en tiempo como en frecuencia, y el dropout es 0 con multiplicador residual de FFN de 1,0. El wrapper normaliza RMS internamente cada mezcla, restaura la amplitud tras la síntesis y aplica consistencia de mezcla residual equitativa distribuyendo `mixture - sum(outputs)` entre las ranuras.

El entrenamiento sigue una receta de dos etapas. Primero se entrena el modelo padre durante 60.000 actualizaciones (seleccionando la de validación MixIT en 58.000). Después se cargan esos pesos, se reinician el optimizador AdamW y el sampler, y se ejecutan 20.000 actualizaciones de fine-tune disperso con coeficiente de sparsity 16 (frente a 0 en el padre) y LR constante de 0,0001 sin warmup. Los datos son FUSS reverberantes (revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`), con 20.000 escenas de entrenamiento y 1.000 de desarrollo, audio mono a 8.000 Hz, segmentos de 4 segundos (32.000 muestras) y 16 pares por actualización. Cada escena observada contiene 1-4 fuentes y la mezcla de mezclas puede contener hasta 8. Se usa BF16 en el backbone y FP32 en STFT, síntesis, asignación y objetivo, con TF32 permitido, Torch determinista y `CUBLAS_WORKSPACE_CONFIG=:4096:8`. El fine-tune añade 16 veces `mean_m(rms(y_m))/||rms(y)||_2` a la pérdida MixIT, con suelo numérico de 1e-8 y umbral suave de 30 dB. Ningún objetivo de fuente aislada entra en los gradientes.

## Capacidades

- Separación de fuentes de audio en mezclas reverberantes de hasta 8 fuentes, con 8 ranuras de salida desordenadas (no clases semánticas).
- Procesamiento offline y no causal de audio mono a 8.000 Hz en segmentos de 4 segundos (32.000 muestras).
- Entrenamiento MixIT sin objetivos de fuente aislada: aprende de mezclas observadas.
- Consistencia de mezcla residual equitativa: la suma de salidas reconstruye la mezcla de entrada.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de modo thinking, visión ni audio de entrada más allá de la separación.

## Casos de uso

- Separación de voces en reuniones y podcasts: el modelo puede dividir una mezcla reverberante de hasta 8 hablantes en ranuras separadas, adecuado por su ventana de 4 segundos y su entrenamiento en FUSS reverberante.
- Preprocesado para reconocimiento automático del habla (ASR): al separar fuentes antes de un sistema ASR, se reduce la interferencia entre hablantes; su naturaleza offline y no causal es aceptable en pipelines por lotes.
- Limpieza de grabaciones de campo: separar fuentes ambientales de una mezcla mono a 8 kHz para análisis posterior, aprovechando su tolerancia a reverberación.
- Investigación en recetas MixIT: servir como checkpoint de referencia para estudiar el efecto del fine-tune disperso (coeficiente 16) frente al modelo padre, dado que se publican cinco checkpoints intermedios.
- Prototipado en entornos con recursos mínimos: con 1,29 M de parámetros, puede ejecutarse en CPU o GPUs de gama baja para experimentos de separación.
- Generación de datos sintéticos de entrenamiento: usar las salidas separadas como pseudo-etiquetas para entrenar otros modelos de separación o ASR en dominios con pocas fuentes aisladas.
- Evaluación comparativa de separadores ligeros: su intervalo bootstrap de SI-SDRi (7,9232-9,0409 dB) permite comparar con otros separadores compactos en el mismo cohorte de desarrollo.

## Benchmarks y rendimiento

| Medicion en el checkpoint seleccionado (actualizacion 10.000) | dB |
|---|---:|
| MixIT con señal de entrenamiento (media de 20 minibatches registrados) | 14,1669 |
| MixIT en conjunto de entrenamiento (64 pares fijos) | 12,5082 |
| MixIT en desarrollo holdout (64 pares fijos) | 12,4977 |
| SI-SDRi de fuente en desarrollo holdout (653 escenas multi-fuente) | 8,4761 |

Intervalo bootstrap del 95% para SI-SDRi de fuente: [7,9232, 9,0409] dB. En la actualización final 20.000: MixIT de señal de entrenamiento 13,4736 dB, MixIT holdout 12,4661 dB y SI-SDRi de fuente holdout 8,1970 dB. No se realizó evaluación en test independiente.

| Actualizacion del fine-tune | SI-SDRi de fuente en desarrollo (dB) | Pesos |
|---|---:|---|
| 10000 | 8,4761 | `checkpoints/step-00010000.safetensors` |
| 6000 | 8,3865 | `checkpoints/step-00006000.safetensors` |
| 4000 | 8,3343 | `checkpoints/step-00004000.safetensors` |
| 16000 | 8,3299 | `checkpoints/step-00016000.safetensors` |
| 14000 | 8,3256 | `checkpoints/step-00014000.safetensors` |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en FP32 (1,29 M de parámetros), y aún menor en BF16/FP16.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizó con una NVIDIA A100 80GB por ajuste, pero la inferencia no requiere esa capacidad.
- Cabe en GPU consumer: sí, en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch 2.7.1/CUDA 12.6 según la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de audio).
- Latencia y throughput: no disponibles; el procesamiento es offline y no causal sobre segmentos de 4 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / segmento | SI-SDRi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed2 | 1.293.568 | 4 s a 8 kHz | 8,4761 dB (desarrollo) | public-access-no-weight-license-grant | Hugging Face |
| mixit-fuss-tflocoformer-m8-plain-seed2 (padre) | no disponible | 4 s a 8 kHz | no disponible | no disponible | Hugging Face |
| Modelos TF-Locoformer originales (Medium) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Los resultados son de desarrollo, no de test independiente; el propio autor advierte que no deben presentarse como rendimiento no sesgado.
- La selección de checkpoint usó etiquetas de fuente en desarrollo (aunque no en la pérdida), lo que puede inflar las métricas reportadas.
- El intervalo bootstrap no cubre variación entre semillas ni la selección sobre el mismo cohorte de desarrollo.
- Las ranuras de salida son desordenadas y no corresponden a clases semánticas; no se garantiza qué fuente aparece en cada ranura.
- Audio limitado a mono, 8.000 Hz y segmentos de 4 segundos; no apto para audio de mayor frecuencia de muestreo sin adaptación.
- Solo idioma inglés según la model card.
- Licencia restrictiva `public-access-no-weight-license-grant`: revisar `LICENSE-WEIGHTS.md` antes de cualquier uso comercial; no se concede explícitamente licencia sobre los pesos.
- Riesgo de alucinación no aplicable (no es un modelo generativo de texto), pero sí de artefactos y separación imperfecta en mezclas densas o con reverberación severa.
- Alto MixIT no implica buena recuperación de fuentes individuales, según advierte el autor.
- Modelo compacto que no equivale al TF-Locoformer Medium original.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed2
- Modelo padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed2/tree/bd5ba96b56665a01bb8299aa7d40b6d13976933e
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed2/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
