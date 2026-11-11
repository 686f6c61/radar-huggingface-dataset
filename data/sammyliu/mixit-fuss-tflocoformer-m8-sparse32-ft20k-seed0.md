# sammyliu/mixit-fuss-tflocoformer-m8-sparse32-ft20k-seed0

## Resumen

El modelo `sammyliu/mixit-fuss-tflocoformer-m8-sparse32-ft20k-seed0` es un separador de fuentes de audio entrenado con la técnica MixIT (Mixture Invariant Training) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario sammyliu y se publica como un fine-tune disperso (coeficiente de sparsity 32) del checkpoint padre `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0`, partiendo de su iteración 55.000 y aplicando 20.000 actualizaciones adicionales. El modelo opera a 8 kHz, es no causal y offline, y produce 8 slots de salida desordenados que no corresponden a clases semánticas.

La arquitectura es un TF-Locoformer compacto (transformer con bloques dual-path y atención en tiempo y frecuencia) con 64 canales, 4 cabezas, FFN de 128 y 3 bloques dual-path, lo que da un total de 1.293.568 parámetros. Es un modelo de investigación de tamaño muy reducido, no el modelo Medium original, y su relevancia radica en demostrar recetas de entrenamiento MixIT con selección de checkpoints guiada por SI-SDRi de fuente en lugar de por MixIT, un punto metodológico importante para la separación de fuentes sin supervisión.

La licencia es `public-access-no-weight-license-grant`, lo que implica acceso público a los pesos pero sin concesión de licencia de uso sobre ellos; es un detalle crítico para cualquier uso en producción. El checkpoint publicado corresponde a la actualización 2.000 del fine-tune, seleccionado por su mejor SI-SDRi de fuente en desarrollo (8,7860 dB), no por su MixIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path, atencion no causal en tiempo y frecuencia) |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventana de audio de 32.000 muestras (4 s a 8 kHz) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | en (etiqueta de idioma; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto con 8 slots de salida y 3 bloques dual-path. Los detalles de canales son 64 canales, 4 cabezas de atención, FFN de 128, kernel de convolución 4 y 4 grupos de normalización RMS. La STFT usa FFT de 256, hop de 128, ventana Hann y padding constante centrado. La atención es no causal tanto en tiempo como en frecuencia. El wrapper normaliza RMS internamente cada mezcla, restaura la amplitud tras la síntesis y aplica consistencia de mezcla residual igualitaria: distribuye `mixture - sum(outputs)` equitativamente entre los slots.

El entrenamiento es en dos etapas. Primero se entrena el padre plano con un schedule de 60.000 actualizaciones, seleccionando el checkpoint de validación-MixIT en la iteración 55.000. Después se cargan esos pesos, se reinician AdamW y el sampler, y se ejecutan 20.000 actualizaciones de fine-tune disperso con coeficiente de sparsity 32. Los datos son FUSS reverberante con 20.000 escenas de entrenamiento y 1.000 de desarrollo, muestreando dos escenas observadas distintas con recortes uniformes independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes y la mezcla de mezclas puede llegar a 8. El batch es de 16 pares por actualización, audio mono a 8.000 Hz y 32.000 muestras. El optimizador es AdamW con betas (0,9, 0,999), epsilon 1e-8 y weight decay 0,01; el LR de fine-tune es constante a 0,0001 sin warmup. La precisión es BF16 en el backbone y FP32 en STFT, síntesis, asignación y objetivo, con TF32 permitido. El entrenamiento se ejecutó en una NVIDIA A100 de 80 GB con PyTorch 2.7.1 y CUDA 12.6, con algoritmos deterministas.

La innovación metodológica es la selección de checkpoints: el ranking original de MixIT se sustituye por un ranking informado por SI-SDRi de fuente en el cohorte de desarrollo completo (1.000 escenas), auditado cada 2.000 actualizaciones y reteniendo los cinco mejores. Las etiquetas de fuente se usan para selección y desarrollo de la receta, no en la pérdida de entrenamiento. La pérdida MixIT eficiente resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` con fallback a pseudoinversa, asigna cada salida a la referencia de mayor coeficiente y usa una pérdida de relación señal-reconstrucción con umbral suave de 30 dB; el fine-tune añade 32 veces `mean_m(rms(y_m))/||rms(y)||_2`.

## Capacidades

- Separación de fuentes de audio a 8 kHz en modo offline y no causal, con 8 slots de salida desordenados.
- Procesamiento de mezclas reverberantes de 1 a 4 fuentes por escena observada, con hasta 8 fuentes en la mezcla de mezclas.
- Entrenamiento MixIT sin fuentes aisladas: no requiere objetivos de fuente individual para el entrenamiento.
- Consistencia de mezcla residual: la suma de salidas reconstruye la mezcla de entrada con el residuo repartido entre slots.
- Normalización RMS interna de la mezcla y restauración de amplitud tras la síntesis.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada/salida en texto ni capacidades multilingües de texto; es exclusivamente un separador de audio.
- No dispone de modo thinking ni de decodificación especulativa.

## Casos de uso

- Investigación en separación de fuentes sin supervisión: sirve como referencia reproducible de una receta MixIT de dos etapas con selección de checkpoint guiada por SI-SDRi, útil para comparar metodologías de selección frente al ranking MixIT clásico.
- Análisis de reuniones y entornos reverberantes a baja tasa de muestreo: con audio remuestreado a 8 kHz, el modelo puede separar hasta 8 componentes de una mezcla de conversaciones, adecuado para tareas de diarización aproximada o preprocesado.
- Preprocesado para reconocimiento de voz en condiciones de mezcla: la separación previa a 8 kHz puede alimentar un ASR de banda estrecha para mejorar la inteligibilidad en escenarios con múltiples hablantes.
- Evaluación de robustez de pipelines de separación: al ser un modelo compacto de 1,29 M de parámetros, permite iterar rápidamente sobre recetas, funciones de pérdida y criterios de selección en una sola GPU consumer.
- Docencia y reproducción de experimentos MixIT: el tamaño reducido y la documentación detallada de hiperparámetros (recipe.json, config.json) lo hacen apto para cursos y talleres sobre separación de audio.
- Benchmark de consistencia de mezcla: útil para estudiar la diferencia entre altas puntuaciones de reconstrucción MixIT y la recuperación real de fuentes individuales, un fenómeno documentado explícitamente en la model card.
- Prototipado de separación en dispositivos de bajos recursos: con 1,29 M de parámetros y ventanas de 4 s, es viable en CPU para experimentos offline, aunque no se han publicado latencias.

## Benchmarks y rendimiento

| Medicion en el checkpoint seleccionado (update 2.000) | dB |
|---|---:|
| MixIT sobre senal de entrenamiento (media de 20 minibatches registrados) | 13,4641 |
| MixIT sobre conjunto de entrenamiento (64 pares fijos) | 12,7718 |
| MixIT sobre desarrollo holdout (64 pares fijos) | 12,2499 |
| SI-SDRi de fuente en desarrollo holdout (653 escenas multi-fuente) | 8,7860 |

Intervalo bootstrap al 95% por escena para SI-SDRi de fuente: [8,2303; 9,3536] dB. Este intervalo cubre la variación entre escenas para este checkpoint, pero no la variación entre semillas ni la selección sobre el mismo cohorte de desarrollo. No se realizó evaluación en test independiente.

En la actualización final fija 20.000: MixIT sobre señal de entrenamiento 13,5532 dB, MixIT holdout 12,2317 dB y SI-SDRi de fuente holdout 7,4853 dB.

| Update de fine-tune | SI-SDRi de fuente en desarrollo (dB) | Pesos |
|---|---:|---|
| 2000 | 8,7860 | `checkpoints/step-00002000.safetensors` |
| 4000 | 8,5326 | `checkpoints/step-00004000.safetensors` |
| 6000 | 8,3372 | `checkpoints/step-00006000.safetensors` |
| 8000 | 8,1529 | `checkpoints/step-00008000.safetensors` |
| 10000 | 8,0964 | `checkpoints/step-00010000.safetensors` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,29 M de parámetros, el peso en FP32 ocupa aproximadamente 5 MB y en BF16 unos 2,6 MB, por lo que la VRAM dominante es la de activaciones y buffers de STFT para ventanas de 32.000 muestras.
- GPU recomendadas: el autor entrenó en una NVIDIA A100 de 80 GB, pero el tamaño del modelo permite inferencia en GPUs consumer muy inferiores; no se han publicado requisitos mínimos de inferencia.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se especifican modelos concretos ni latencias.
- Opciones de despliegue: no disponible; el repo usa PyTorch 2.7.1/CUDA 12.6 y safetensors, sin mención a vLLM, llama.cpp, Ollama o TGI (no aplicables a un separador de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | SI-SDRi desarrollo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mixit-fuss-tflocoformer-m8-sparse32-ft20k-seed0 (este) | 1.293.568 | 32.000 muestras (4 s a 8 kHz) | 8,7860 dB (update 2.000) | public-access-no-weight-license-grant | Hugging Face |
| sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0 (padre) | no disponible | no disponible | no disponible (selección por MixIT de validación en update 55.000) | no disponible | Hugging Face |
| Modelo Medium original de TF-Locoformer | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la comparación se limita al modelo padre y a la referencia al Medium original citada en la model card.

## Limitaciones y advertencias

- La licencia `public-access-no-weight-license-grant` no concede licencia de uso sobre los pesos; es imprescindible revisar `LICENSE-WEIGHTS.md` antes de cualquier uso, incluido el comercial.
- No se realizó evaluación en test independiente: las puntuaciones de desarrollo no deben presentarse como rendimiento de test insesgado.
- El intervalo de confianza del SI-SDRi no contempla la variación entre semillas ni la selección sobre el mismo cohorte de desarrollo, por lo que puede estar optimista.
- Los slots de salida son desordenados y no corresponden a clases semánticas; no hay garantía de que un slot concreto corresponda a un hablante o fuente determinada.
- Altas puntuaciones de MixIT y consistencia de mezcla exacta no garantizan la recuperación de fuentes individuales; el propio autor lo advierte.
- El modelo es no causal y offline, por lo que no es apto para separación en tiempo real con latencia estricta.
- Opera únicamente a 8 kHz mono, lo que limita la calidad para aplicaciones de banda ancha (música, voz de alta fidelidad).
- Solo se etiqueta idioma `en`; no hay evidencia de comportamiento multilingüe ni de robustez fuera del dominio FUSS reverberante.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de artefactos de separación: el modelo puede generar componentes espurios en los slots.
- Es un modelo compacto de investigación, no el Medium original; no debe asumirse un rendimiento equivalente a variantes mayores.
- No se han publicado latencias, throughput ni requisitos de VRAM de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse32-ft20k-seed0
- Modelo padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0
- Revisión exacta del padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed0/tree/35bf7d1be1b69a2f2bb22b756a28cc6f8084591c
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse32-ft20k-seed0/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper FUSS (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
