# sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed2

## Resumen

El modelo `sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed2` es un separador de fuentes de audio entrenado con MixIT (Mixture Invariant Training) sobre mezclas reverberantes observadas del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario de Hugging Face `sammyliu` y se publica como un fine-tune disperso (coeficiente de sparsity 32) de 20.000 actualizaciones sobre un modelo padre previamente entrenado con la misma receta MixIT. El problema que aborda es la separación ciega de fuentes en audio mono a 8 kHz, un escenario en el que no se dispone de etiquetas de fuente individual y solo se pueden usar mezclas de mezclas para el aprendizaje.

Arquitectura y escala: se trata de un backbone compacto TF-Locoformer (Transformer con bloques dual-path y atención no causal en tiempo y frecuencia), con 16 slots de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128. El recuento real de parámetros en safetensors es de 1.302.800, lo que lo sitúa en la categoría de modelos muy pequeños, aptos para experimentación y despliegue ligero. El contexto de audio es de 4 segundos mono a 8 kHz (32.000 muestras) por par de mezclas.

La relevancia actual radica en que documenta de forma explícita una receta de entrenamiento MixIT reproducible (dos etapas, selección de checkpoints con SI-SDRi de desarrollo, intervalos bootstrap) y publica métricas de desarrollo honestas, incluyendo la advertencia de que no se ha realizado evaluación en test independiente. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (Transformer dual-path, atención no causal en tiempo y frecuencia) |
| Parametros totales | 1.302.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4 segundos de audio mono a 8 kHz (32.000 muestras) por par de mezclas |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (licencia personalizada, ver LICENSE-WEIGHTS.md) |
| Formato de pesos | safetensors |
| STFT | FFT 256, hop 128, ventana Hann, padding constante centrado |
| Canales / cabezas / FFN | 64 / 4 / 128 |
| Bloques dual-path | 3 |
| Slots de salida | 16 (no ordenados, no son clases semánticas) |
| Frecuencia de muestreo | 8.000 Hz, mono |
| Grupo de normalización RMS | 4 |
| Dropout / multiplicador residual FFN | 0 / 1.0 |
| Kernel de convolución | 4 |
| Coeficiente de sparsity (fine-tune) | 32 (0 en el padre) |
| Coeficiente de covarianza | 0 |
| Optimizador | AdamW, betas (0.9, 0.999), epsilon 1e-8, weight decay 0.01 |
| LR del padre | Pico 0.001, warmup 1.000 pasos con coseno, suelo del 10% |
| LR del fine-tune | Constante 0.0001, sin warmup, estado del optimizador reiniciado |
| Precisión | BF16 en backbone; FP32 en STFT, síntesis, asignación y objetivo; TF32 permitido |
| Dataset | FUSS reverberant (revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`) |
| Escenas de entrenamiento / desarrollo | 20.000 / 1.000 |
| Runtime de entrenamiento | PyTorch 2.7.1 / CUDA 12.6; una NVIDIA A100 80GB por ajuste |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto: un transformer con procesamiento dual-path que aplica atención sobre las dimensiones de tiempo y frecuencia de forma no causal. La entrada es la STFT de mezclas de audio mono a 8 kHz (FFT 256, hop 128, ventana Hann con padding constante centrado). La salida son 16 slots desordenados que representan fuentes estimadas, sin correspondencia semántica con clases concretas. El wrapper normaliza cada mezcla por RMS internamente, restaura la amplitud tras la síntesis y aplica consistencia de mezcla residual equitativa (distribuye `mixture - sum(outputs)` por igual entre slots).

El entrenamiento sigue una receta de dos etapas. Primero se entrena el modelo padre durante 60.000 actualizaciones y se selecciona el checkpoint de validación MixIT en el paso 58.000 (modelo `sammyliu/mixit-fuss-tflocoformer-m16-plain-seed2`). Después se cargan esos pesos, se reinician AdamW y el sampler, y se ejecutan 20.000 actualizaciones de fine-tune con sparsity 32. No es una trayectoria continua de 80.000 actualizaciones. La pérdida MixIT usa una resolución lineal eficiente `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` con fallback a pseudoinversa; cada salida se asigna a la referencia con mayor coeficiente y las salidas asignadas se suman. La pérdida es `-10 log10(max(||x||², 1e-8) / max(||x - xhat||² + 0.001||x||², 1e-8))` con umbral suave de 30 dB; los gradientes no diferencian a través del argmax. El fine-tune añade 32 veces `mean_m(rms(y_m)) / ||rms(y)||_2`, con suelo numérico de 1e-8. No entra ninguna fuente aislada en los gradientes. Se usan pares de escenas observadas muestreadas uniformemente, con recortes independientes de 4 segundos, 16 pares por actualización, y determinismo con algoritmos deterministas de Torch y `CUBLAS_WORKSPACE_CONFIG=:4096:8`.

## Capacidades

- Separación ciega de fuentes de audio en mezclas reverberantes mono a 8 kHz, sin necesidad de fuentes aisladas en el objetivo de entrenamiento.
- Producción de hasta 16 salidas (slots) desordenadas por mezcla de entrada; no hay correspondencia entre slot e instrumento o hablante concreto.
- Procesamiento de mezclas de mezclas con hasta 8 fuentes (cada escena observada contiene 1-4 fuentes).
- Consistencia de mezcla residual: la suma de las salidas se ajusta para reconstruir la mezcla de entrada.
- Aplicación de normalización RMS interna y restauración de amplitud.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de texto; es un modelo puramente de audio.
- No soporta visión ni audio de entrada distinto del formato especificado (8 kHz, mono, 4 segundos).
- Capacidad multilingüe no aplicable: el modelo no procesa lenguaje.

## Casos de uso

- Investigación en separación ciega de fuentes: el modelo sirve como referencia reproducible de una receta MixIT con métricas de desarrollo documentadas, útil para comparar variantes de arquitectura o de coeficiente de sparsity en experimentos controlados.
- Prototipado de pipelines de separación en entornos con datos sin etiquetas: al entrenarse solo con mezclas observadas, se puede reutilizar la receta sobre nuevos corpus reverberantes sin fuentes aisladas, ajustando el número de slots y el coeficiente de sparsity.
- Evaluación de técnicas de consistencia de mezcla: el wrapper implementa consistencia residual equitativa y normalización RMS interna, lo que permite estudiar su efecto en la reconstrucción de mezclas.
- Generación de datos sintéticos de separación: las 16 salidas pueden usarse como pseudo-fuentes para aumentar corpus de entrenamiento de otros modelos, siempre con validación posterior.
- Análisis de reverberación y mezclas de mezclas: el modelo está entrenado sobre FUSS reverberante, lo que lo hace adecuado para estudiar el comportamiento de separadores en condiciones reverberantes a 8 kHz.
- Reproducción de experimentos de selección de checkpoints: la model card documenta la selección de los cinco mejores checkpoints por SI-SDRi de desarrollo, lo que permite reproducir el ranking y analizar la variabilidad entre semillas (esta es la semilla 2).
- Despliegue ligero en entornos de investigación con recursos limitados: con 1,3 millones de parámetros, el modelo puede ejecutarse en CPU o en GPU de gama baja para experimentación, aunque no se han publicado cifras de latencia.

## Benchmarks y rendimiento

| Medición en el checkpoint seleccionado | dB |
|---|---:|
| MixIT con señal de entrenamiento (media de 20 minibatches registrados) | 13.5299 |
| MixIT en conjunto de entrenamiento (64 pares fijos de evaluación) | 12.6695 |
| MixIT en desarrollo holdout (64 pares fijos de evaluación) | 12.5649 |
| SI-SDRi de fuente en desarrollo holdout (653 escenas multifuente) | 8.2758 |

Intervalo bootstrap del 95% por escena para SI-SDRi de fuente: [7.7778, 8.7989] dB. Este intervalo cubre la variación entre escenas para este checkpoint, pero no la variación entre semillas ni la selección sobre la misma cohorte de desarrollo. No se realizó evaluación en test independiente.

| Actualización del fine-tune | SI-SDRi de fuente en desarrollo (dB) | Pesos |
|---|---:|---|
| 20000 | 8.2758 | `checkpoints/step-00020000.safetensors` |
| 14000 | 8.1707 | `checkpoints/step-00014000.safetensors` |
| 6000 | 8.0822 | `checkpoints/step-00006000.safetensors` |
| 4000 | 8.0781 | `checkpoints/step-00004000.safetensors` |
| 12000 | 8.0749 | `checkpoints/step-00012000.safetensors` |

En la actualización final fija 20.000: MixIT con señal de entrenamiento 13.5299 dB, MixIT holdout 12.5649 dB y SI-SDRi de fuente holdout 8.2758 dB. Este endpoint difiere del checkpoint seleccionado. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.302.800 parámetros, los pesos en FP32 ocupan aproximadamente 5,2 MB y en BF16 unos 2,6 MB, por lo que la VRAM necesaria es mínima y dominada por las activaciones de la STFT y los 16 slots.
- GPU recomendadas: el entrenamiento se realizó con una NVIDIA A100 80GB por ajuste, pero para inferencia el modelo es lo bastante pequeño como para ejecutarse en GPUs consumer e incluso en CPU.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se han publicado mediciones de latencia ni throughput.
- Opciones de despliegue: PyTorch 2.7.1 con CUDA 12.6 es el entorno documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo de audio). El repo incluye `config.json` con todos los campos de arquitectura.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed2` (este) | 1.302.800 | 4 s mono 8 kHz | Separación ciega MixIT, 16 slots | public-access-no-weight-license-grant | Hugging Face |
| `sammyliu/mixit-fuss-tflocoformer-m16-plain-seed2` (padre) | no disponible | 4 s mono 8 kHz | Separación MixIT, 16 slots, sin sparsity | no disponible | Hugging Face |
| Modelos de separación con fuentes supervisadas (p. ej. arquitecturas tipo Conv-TasNet o SepFormer) | no disponible | variable | Separación supervisada con fuentes aisladas | variable | no disponible |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; solo se conoce el modelo padre, del que este es un fine-tune.

## Limitaciones y advertencias

- No se ha realizado evaluación en test independiente; las puntuaciones de desarrollo no deben presentarse como rendimiento de test insesgado.
- El intervalo bootstrap del 95% no tiene en cuenta la variación entre semillas ni la selección sobre la misma cohorte de desarrollo.
- Los slots de salida son desordenados y no corresponden a clases semánticas; no se puede asignar un slot concreto a un hablante o instrumento.
- Las puntuaciones altas de reconstrucción MixIT no garantizan una buena recuperación de fuentes individuales; la consistencia exacta de mezcla no implica separación correcta.
- El modelo está entrenado solo con audio mono a 8 kHz y recortes de 4 segundos; no se ha validado para otras frecuencias de muestreo, estéreo o duraciones mayores.
- La licencia `public-access-no-weight-license-grant` es personalizada y restringe el uso de los pesos; es necesario revisar `LICENSE-WEIGHTS.md` antes de cualquier uso comercial.
- Riesgo de alucinación no aplicable en el sentido de texto, pero sí de artefactos de separación: las salidas pueden contener fuentes espurias o mezclas residuales.
- No hay datos publicados sobre sesgos demográficos o de otro tipo; el modelo opera sobre audio y no procesa lenguaje.
- El modelo es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed2
- Modelo padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed2/tree/f1147a9c6e9234470e4233e259c1f0dbcaad5aef
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed2/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
