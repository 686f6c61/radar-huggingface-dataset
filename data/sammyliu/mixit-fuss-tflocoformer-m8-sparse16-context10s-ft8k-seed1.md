# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed1

## Resumen

El modelo `sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed1` es un separador de fuentes de audio entrenado mediante MixIT (Mixture Invariant Training) sobre mezclas reverberantes del corpus FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario sammyliu y se publica como un fine-tune disperso de 8.000 actualizaciones sobre el modelo padre `mixit-fuss-tflocoformer-m8-plain-seed1`. Su función es separar mezclas mono a 8 kHz en hasta ocho ranuras de salida no ordenadas ni asociadas a clases semanticas.

La arquitectura es un backbone compacto TF-Locoformer (transformer con bloques dual-path y atención local) con 8 ranuras de salida, 3 bloques dual-path, 64 canales, 4 cabezas y FFN de 128. El recuento real de parametros en safetensors es de 1.293.568, es decir, un modelo muy pequeno orientado a experimentacion y despliegue ligero. El contexto de audio de entrenamiento es de 10 segundos (80.000 muestras a 8 kHz), con STFT de FFT 256 y hop 128.

Es relevante porque documenta de forma inusualmente transparente un protocolo de seleccion de checkpoints basado en SI-SDRi de fuentes, algo distinto del ranking MixIT original, e incluye intervalos bootstrap y advertencias explicitas sobre la reutilizacion de datos de desarrollo. La licencia es restrictiva (`public-access-no-weight-license-grant`), lo que limita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path), 8 ranuras de salida, 3 bloques dual-path |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 10 s de audio a 8 kHz (80.000 muestras) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma; la tarea es separacion de audio) |
| Licencia | public-access-no-weight-license-grant (other) |
| Formato de pesos | safetensors |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Canales / cabezas / FFN | 64 / 4 / 128 |
| Kernel de convolucion | 4 |
| Grupos de normalizacion RMS | 4 |
| STFT | FFT 256, hop 128, ventana Hann, padding constante centrado |
| Dropout | 0 |
| Multiplicador residual FFN | 1.0 |
| Frecuencia de muestreo | 8.000 Hz mono |
| Fuentes por escena observada | 1-4 (hasta 8 en la mezcla de mezclas) |
| Coeficiente de dispersidad | 16 en fine-tune, 0 en el padre |
| Coeficiente de covarianza | 0 |
| Precisión de entrenamiento | BF16 backbone; FP32 en STFT, sintesis, asignacion y objetivo |
| Optimizador | AdamW, betas (0.9, 0.999), epsilon 1e-8, weight decay 0.01 |
| LR de fine-tune | 0.0001 constante, sin warmup |
| Dataset | scaleinvariant/fuss-parquet, revision b183027b802d1a488dea8b6f1d80daa32b76b681 |
| Escenas | 20.000 entrenamiento, 1.000 desarrollo |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto con 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones. Procesa audio mono a 8 kHz mediante STFT (FFT 256, hop 128, ventana Hann) y produce 8 ranuras de salida no ordenadas. El wrapper normaliza internamente por RMS cada mezcla, restaura la amplitud tras la sintesis y aplica consistencia de mezcla residual igual: distribuye `mixture - sum(outputs)` entre las salidas. El entrenamiento usa BF16 en el backbone y FP32 en STFT, sintesis, asignacion y objetivo, con algoritmos deterministas de Torch y `CUBLAS_WORKSPACE_CONFIG=:4096:8`.

El entrenamiento es en dos etapas. Primero se entrena el modelo padre (`mixit-fuss-tflocoformer-m8-plain-seed1`) durante 60.000 actualizaciones y se selecciona el checkpoint de validacion-MixIT en la actualizacion 56.000. Despues se cargan sus pesos, se reinician AdamW y el sampler, y se ejecutan 8.000 actualizaciones de fine-tune disperso con coeficiente de dispersidad 16. La seleccion de los cinco mejores checkpoints se hace auditando la recuperacion de fuentes en el conjunto completo de 1.000 escenas de desarrollo cada 1.000 actualizaciones, usando SI-SDRi de fuentes; las etiquetas de fuente se usan para seleccion y desarrollo de receta, pero no en la perdida de entrenamiento. El muestreo usa dos escenas distintas con recortes uniformes independientes de 10 segundos y 16 pares por actualizacion de optimizador.

## Capacidades

- Separacion de fuentes de audio en hasta 8 ranuras de salida a partir de una mezcla mono a 8 kHz.
- Entrenamiento MixIT sin fuentes aisladas: aprende de mezclas observadas, no de objetivos aislados.
- Salidas no ordenadas: las ranuras no corresponden a clases semanticas fijas.
- Procesamiento offline y no causal: no apto para streaming en tiempo real.
- Consistencia de mezcla residual: las salidas reconstruyen la mezcla de entrada.
- Sin soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades de vision, audio de entrada mas alla de la mezcla, ni thinking mode.
- Multilingue: no aplica; la etiqueta `en` es de idioma del dataset/card, no una capacidad del modelo.

## Casos de uso

- Separacion de voces en grabaciones de reuniones: el modelo puede dividir una mezcla mono a 8 kHz en hasta 8 pistas, util para transcripcion diarizada previa a ASR, aunque la calidad a 8 kHz limita el uso en produccion de audio de alta fidelidad.
- Preprocesado para pipelines de reconocimiento de habla: al separar hablantes superpuestos antes de un ASR, se reduce la confusion en conversaciones solapadas; el contexto de 10 s encaja con segmentos cortos de reunion.
- Investigacion en separacion de fuentes: sirve como baseline reproducible y ligero (1,29 M parametros) para comparar recetas MixIT, coeficientes de dispersidad y protocolos de seleccion de checkpoints.
- Prototipado de separacion musical o de efectos: con 8 ranuras y audio a 8 kHz, es adecuado para experimentos de separacion de stems en baja fidelidad o para validar arquitecturas TF-Locoformer en entornos con pocos recursos.
- Educacion y docencia: su tamano minimo permite ejecutar el modelo en una sola GPU consumer o incluso en CPU para demostraciones de MixIT y consistencia de mezcla.
- Evaluacion de metricas: util para estudiar la diferencia entre MixIT y SI-SDRi de fuentes, y para reproducir los intervalos bootstrap publicados en la model card.
- Despliegue en dispositivos con recursos limitados: al tener 1,29 M parametros, puede integrarse en pruebas de concepto de separacion de audio en edge, siempre que se acepte la licencia restrictiva.

## Benchmarks y rendimiento

Resultados publicados en la model card para el checkpoint seleccionado (`model.safetensors`, actualizacion 3.000):

| Medicion en el checkpoint seleccionado | dB |
|---|---:|
| MixIT sobre senal de entrenamiento (media de 20 minibatches registrados) | 14.4001 |
| MixIT sobre conjunto de entrenamiento (64 pares fijos) | 12.7439 |
| MixIT sobre desarrollo holdout (64 pares fijos) | 12.4313 |
| SI-SDRi de fuentes en desarrollo holdout (653 escenas multi-fuente) | 9.8629 |

Intervalo bootstrap al 95% por escena para SI-SDRi de fuentes: [9.2940, 10.4562] dB. No se realizo evaluacion en test independiente.

Checkpoints retenidos y su SI-SDRi de desarrollo:

| Actualizacion de fine-tune | SI-SDRi de fuentes en desarrollo (dB) | Pesos |
|---|---:|---|
| 3000 | 9.8629 | `checkpoints/step-00003000.safetensors` |
| 4800 | 9.7448 | `checkpoints/step-00004800.safetensors` |
| 5000 | 9.6753 | `checkpoints/step-00005000.safetensors` |
| 4000 | 9.5173 | `checkpoints/step-00004000.safetensors` |
| 6000 | 9.4925 | `checkpoints/step-00006000.safetensors` |

En la actualizacion final 8.000 (evaluacion comun de 4 segundos): MixIT sobre senal de entrenamiento 14.0214 dB, MixIT holdout 12.6592 dB y SI-SDRi de fuentes holdout 9.3951 dB.

Para `final.safetensors` con entrada y scoring de 10 segundos: MixIT de entrenamiento 14.0214 dB, MixIT holdout 13.3481 dB, SI-SDRi de fuentes uno a uno 12.0145 dB, intervalo bootstrap al 95% [11.5020, 12.5172] dB, SI-SDR absoluto de fuentes 6.1348 dB y 742 escenas multi-fuente activas de 1.000. La model card advierte que estas cifras no son comparables como ganancia sobre el protocolo de seleccion de 4 segundos.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,29 M parametros, el modelo ocupa unos pocos MB en FP32 y menos en BF16. No se dispone de cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizo en una NVIDIA A100 80GB por fit, pero la inferencia no requiere esa clase de hardware.
- Cabe en GPU consumer: si, en cualquier GPU consumer con suficiente memoria para el buffer de audio y la STFT; el cuello de botella es el procesamiento de audio, no los pesos.
- Opciones de despliegue: PyTorch 2.7.1 con CUDA 12.6 segun la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El modelo es offline y no causal, por lo que procesa ventanas completas de 10 segundos.
- CPU: el entrenamiento uso dos hilos de CPU; la inferencia en CPU es viable dado el tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Este modelo (mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed1) | 1.293.568 | 10 s a 8 kHz | Separacion MixIT, 8 ranuras | public-access-no-weight-license-grant | Hugging Face |
| sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1 (padre) | no disponible | 10 s a 8 kHz | Separacion MixIT, 8 ranuras | no disponible | Hugging Face |
| Alternativas de separacion de fuentes de la familia TF-Locoformer | no disponible | no disponible | Separacion de fuentes | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada. La comparacion con el modelo padre es la mas directa: este fine-tune parte de su checkpoint de la actualizacion 56.000 y aplica 8.000 actualizaciones con coeficiente de dispersidad 16.

## Limitaciones y advertencias

- No se realizo evaluacion en test independiente; las cifras de desarrollo no deben presentarse como rendimiento de test no sesgado.
- Los intervalos bootstrap no corrigen la seleccion sobre la misma cohorte de desarrollo ni la variacion entre semillas.
- Las ranuras de salida no estan ordenadas ni asociadas a clases semanticas; no se puede asumir que una ranura concreta corresponda a un hablante o instrumento.
- Las puntuaciones MixIT altas no garantizan una buena recuperacion de fuentes individuales; la model card lo advierte explicitamente.
- El modelo es offline y no causal, no apto para streaming ni para latencia baja en tiempo real.
- Audio a 8 kHz mono: calidad limitada para produccion musical o de voz de alta fidelidad.
- Entrenado sobre FUSS reverberante; el dominio y las condiciones acusticas fuera de ese corpus pueden degradar el rendimiento.
- Licencia restrictiva `public-access-no-weight-license-grant`: no se concede permiso de uso de pesos; el uso comercial requiere revisar el archivo LICENSE-WEIGHTS.md y probablemente no esta permitido.
- Riesgo de sesgo heredado del corpus FUSS y de las condiciones de grabacion del dataset.
- Riesgo de alucinacion no aplica en el sentido de texto, pero si de artefactos: el modelo puede generar senales espurias al separar mezclas fuera de distribucion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed1
- Modelo padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed1/tree/7eba74ff4f81c9fc04bbcc4badd4959ab95555cd
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context10s-ft8k-seed1/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
