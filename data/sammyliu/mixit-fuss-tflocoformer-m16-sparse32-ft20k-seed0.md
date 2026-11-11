# sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed0

## Resumen

El modelo `sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed0` es un separador de fuentes de audio entrenado con la técnica MixIT (Mixture Invariant Training) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario sammyliu y se publica como un fine-tune disperso de 20.000 actualizaciones sobre el checkpoint padre `sammyliu/mixit-fuss-tflocoformer-m16-plain-seed0`. El modelo opera en modo offline y no causal, a una frecuencia de muestreo de 8 kHz, y produce 16 ranuras de salida que no están ordenadas ni asociadas a clases semánticas.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso poco habitual en Hugging Face (separación de fuentes con MixIT en lugar de generación de texto), y por otro, ilustra una práctica de publicación muy cuidadosa con la selección de checkpoints y la comunicación de métricas. El autor distingue explícitamente entre métricas de reconstrucción de mezcla (MixIT) y métricas de recuperación de fuentes individuales (SI-SDRi), y advierte de que la selección de checkpoints se hizo con etiquetas de fuente en el conjunto de desarrollo, aunque estas no entraron en la función de pérdida.

El modelo es muy compacto: 1.302.800 parámetros totales según los pesos en safetensors, con un backbone TF-Locoformer de 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128. El checkpoint publicado corresponde a la actualización 6.000 del fine-tune, seleccionado por su SI-SDRi de desarrollo de 7,9811 dB. No se ha realizado evaluación en un conjunto de test independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con bloques dual-path, atención no causal en tiempo y frecuencia) |
| Parametros totales | 1.302.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 32.000 muestras (4 s a 8 kHz) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (licencia personalizada, ver LICENSE-WEIGHTS.md) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 8.000 Hz, mono |
| Ranuras de salida | 16 (no ordenadas, sin clase semántica) |
| STFT | FFT 256, hop 128, ventana Hann, padding constante centrado |
| Canales / cabezas / FFN | 64 / 4 / 128 |
| Kernel de convolución | 4 |
| Grupos de normalización RMS | 4 |
| Dropout | 0 |
| Multiplicador residual FFN | 1,0 |
| Dataset | scaleinvariant/fuss-parquet (revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`) |
| Modelo base | sammyliu/mixit-fuss-tflocoformer-m16-plain-seed0 |
| Precisión de entrenamiento | BF16 en backbone; FP32 en STFT, síntesis, asignación y objetivo; TF32 permitido |

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto con 3 bloques dual-path. La atención es no causal tanto en tiempo como en frecuencia, lo que implica que el modelo es offline: necesita la señal completa de la ventana de 4 segundos para producir la separación. La entrada se transforma con una STFT de FFT 256 y hop 128 con ventana Hann y padding constante centrado, y el wrapper normaliza internamente cada mezcla por RMS (con suelo de 1e-8), restaura la amplitud tras la síntesis y aplica consistencia de mezcla residual igualitaria, distribuyendo `mezcla - suma(salidas)` por igual entre las ranuras.

El entrenamiento sigue una receta de dos etapas. Primero se entrena el modelo padre con un schedule de 60.000 actualizaciones y se selecciona su checkpoint de validación-MixIT en la actualización 55.000. Después se cargan esos pesos, se reinician el optimizador AdamW y el sampler, y se ejecutan 20.000 actualizaciones de fine-tune disperso con un coeficiente de dispersión de 32 (frente a 0 en el padre) y coeficiente de covarianza 0. Los datos son escenas reverberantes de FUSS: 20.000 escenas de entrenamiento y 1.000 de desarrollo, con 1 a 4 fuentes por escena observada y hasta 8 fuentes en la mezcla de mezclas. Cada actualización usa 16 pares de mezclas, con dos escenas observadas muestreadas uniformemente y recortes independientes de 4 segundos.

La función de pérdida es MixIT eficiente y dura: se resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` mediante solve lineal con pseudoinversa de respaldo, se asigna cada salida a la referencia con mayor coeficiente y se suma, con pérdida `-10 log10(max(||x||²,1e-8)/max(||x-xhat||² + 0.001||x||²,1e-8))` y umbral suave de 30 dB. Los gradientes no se diferencian a través del argmax. El fine-tune añade 32 veces `mean_m(rms(y_m))/||rms(y)||_2`. No entra ninguna fuente aislada en los gradientes. El entrenamiento se ejecutó con PyTorch 2.7.1 y CUDA 12.6 en una NVIDIA A100 de 80 GB, con algoritmos deterministas y `CUBLAS_WORKSPACE_CONFIG=:4096:8`.

## Capacidades

- Separación de fuentes de audio en mezclas reverberantes de hasta 8 fuentes, produciendo 16 ranuras de salida no ordenadas.
- Funcionamiento offline y no causal: procesa ventanas completas de 4 segundos a 8 kHz.
- Consistencia de mezcla residual: la suma de las salidas reconstruye la mezcla de entrada con un reparto igualitario del residuo.
- Entrenamiento sin fuentes aisladas: aprende a partir de mezclas observadas mediante MixIT, lo que permite aprovechar datos donde no hay stems disponibles.
- Selección de checkpoints basada en SI-SDRi de desarrollo, con auditoría completa de las 1.000 escenas de desarrollo cada 2.000 actualizaciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada como texto ni modo thinking: es un modelo puramente de separación de audio.
- Capacidades multilingües: no aplica; la etiqueta `en` del repo no describe una capacidad lingüística del modelo.

## Casos de uso

- Limpieza de grabaciones de reuniones: el modelo puede separar voces solapadas y ruido de fondo en ventanas de 4 segundos, siempre que la señal se remuestree a 8 kHz y se acepte la pérdida de calidad asociada a esa frecuencia.
- Preprocesado para pipelines de reconocimiento automático de habla: al separar fuentes antes de un ASR, se puede reducir la confusión en escenarios con múltiples hablantes, aunque la salida a 8 kHz limita el ASR a banda estrecha.
- Análisis de escenas acústicas en investigación: útil para estudiar el comportamiento de MixIT y de arquitecturas TF-Locoformer en condiciones reverberantes con hasta 8 fuentes.
- Generación de datos aumentados: las 16 salidas pueden usarse como fuentes aproximadas para aumentar datasets de entrenamiento de otros modelos de audio, con la advertencia de que las ranuras no son semánticas.
- Prototipado de separación en entornos con recursos limitados: con 1,3 millones de parámetros, el modelo cabe en CPU y en GPUs de consumo, lo que permite experimentar sin infraestructura dedicada.
- Evaluación de recetas de fine-tune disperso: el repo documenta checkpoints intermedios y métricas por actualización, lo que lo convierte en un caso de estudio para reproducir recetas de entrenamiento con MixIT.
- Filtrado de ruido en grabaciones de campo: la consistencia de mezcla y la normalización RMS interna facilitan integrarlo en cadenas de procesado existentes sin recalibrar amplitudes.

## Benchmarks y rendimiento

| Medición en el checkpoint seleccionado (actualización 6.000) | dB |
|---|---:|
| MixIT sobre señal de entrenamiento (media de 20 minibatches registrados) | 14,0506 |
| MixIT sobre conjunto de entrenamiento (64 pares fijos de evaluación) | 12,7617 |
| MixIT sobre desarrollo holdout (64 pares fijos de evaluación) | 12,4524 |
| SI-SDRi de fuentes en desarrollo holdout (653 escenas multi-fuente) | 7,9811 |

Intervalo de confianza del 95 % por bootstrap de escenas para SI-SDRi: [7,4538; 8,5367] dB. Este intervalo cubre la variación entre escenas para este checkpoint, pero no la variación entre semillas ni la selección sobre la misma cohorte de desarrollo. No se realizó evaluación en test independiente.

| Actualización del fine-tune | SI-SDRi de desarrollo (dB) | Pesos |
|---|---:|---|
| 6000 | 7,9811 | `checkpoints/step-00006000.safetensors` |
| 4000 | 7,8707 | `checkpoints/step-00004000.safetensors` |
| 16000 | 7,8155 | `checkpoints/step-00016000.safetensors` |
| 8000 | 7,7360 | `checkpoints/step-00008000.safetensors` |
| 14000 | 7,7030 | `checkpoints/step-00014000.safetensors` |

En la actualización final fija 20.000: MixIT de señal de entrenamiento 14,1425 dB, MixIT de holdout 12,6164 dB y SI-SDRi de fuentes en holdout 7,4370 dB. Este punto final difiere del checkpoint seleccionado.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros separadores en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,3 millones de parámetros, los pesos en FP32 ocupan aproximadamente 5,2 MB y en BF16 unos 2,6 MB. El cuello de botella es la STFT y las activaciones de la ventana de 4 segundos, no los pesos.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entrenó con una NVIDIA A100 de 80 GB, pero para inferencia es sobredimensionada. Una RTX 4090, RTX 3090 o incluso una GPU integrada pueden ejecutar el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con suficiente memoria para el runtime de PyTorch; también es viable en CPU.
- Opciones de despliegue: PyTorch nativo (el repo usa PyTorch 2.7.1 y CUDA 12.6); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El autor no publica medidas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed0 | 1.302.800 | 4 s a 8 kHz | Separación de fuentes MixIT | public-access-no-weight-license-grant | Hugging Face |
| mixit-fuss-tflocoformer-m16-plain-seed0 (padre) | no disponible en la información | 4 s a 8 kHz | Separación de fuentes MixIT | no disponible en la información | Hugging Face |
| Modelos de separación supervisados tipo Conv-TasNet o SepFormer | no disponible en la información | no disponible | Separación de fuentes con fuentes aisladas | no disponible en la información | no disponible |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada. El único punto de referencia directo es el modelo padre, del que se sabe que se entrenó con 60.000 actualizaciones y coeficiente de dispersión 0, pero no se aportan sus métricas en esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés según la etiqueta del repo; no hay evidencia de generalización a otros idiomas ni a otras condiciones acústicas.
- Las 16 ranuras de salida no están ordenadas ni asociadas a clases semánticas: no se puede asumir que la ranura 0 sea el hablante 1 ni que corresponda a una fuente concreta.
- Las métricas publicadas son de desarrollo, no de test independiente. El propio autor advierte de que no deben presentarse como rendimiento unbiased.
- La selección de checkpoints usó etiquetas de fuente en el conjunto de desarrollo, aunque no entraron en la pérdida; esto introduce un sesgo de selección sobre la misma cohorte.
- El intervalo de confianza del 95 % no cubre la variación entre semillas ni el efecto de la selección.
- La consistencia de mezcla exacta y un MixIT alto no garantizan la recuperación de fuentes individuales; el propio autor lo señala explícitamente.
- La frecuencia de 8 kHz limita el uso a aplicaciones de banda estrecha; no es adecuado para música ni para audio de alta fidelidad.
- El modelo es no causal y offline: no sirve para separación en tiempo real con latencia baja.
- La licencia es personalizada (`public-access-no-weight-license-grant`) y debe revisarse en `LICENSE-WEIGHTS.md` antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita el despliegue en runtimes que no sean PyTorch.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed0
- Modelo base (padre): https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed0/tree/2e6cb1acb4c21916d691680f4d8efc96e666a96d
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse32-ft20k-seed0/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
