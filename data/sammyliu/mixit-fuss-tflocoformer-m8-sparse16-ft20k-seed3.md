# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed3

## Resumen

El modelo `sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed3` es un separador de fuentes de audio entrenado con MixIT (Mixture Invariant Training) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario sammyliu y se publica como un fine-tune disperso de 20.000 actualizaciones sobre el checkpoint padre `mixit-fuss-tflocoformer-m8-plain-seed3`. Trabaja a 8 kHz en modo offline y no causal, con 8 ranuras de salida cuyo orden no es semantico ni corresponde a clases de fuente.

La arquitectura es un TF-Locoformer compacto (transformer con bloques dual-path y atención en tiempo y frecuencia) de solo 1.293.568 parámetros, con 3 bloques dual-path, 64 canales, 4 cabezas y FFN de 128. El modelo no es el TF-Locoformer Medium original, sino una variante reducida pensada para experimentación reproducible en separación de audio.

Su relevancia es metodologica: demuestra un pipeline de entrenamiento MixIT en dos etapas (padre de 60.000 actualizaciones y fine-tune disperso de 20.000) con seleccion de checkpoints guiada por SI-SDRi de fuentes en desarrollo, y publica tanto las metricas de desarrollo como los cinco mejores checkpoints. La licencia es restrictiva (`public-access-no-weight-license-grant`) y no otorga derechos de uso sobre los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path, atencion no causal en tiempo y frecuencia) |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa segmentos de 4 s a 8 kHz, 32.000 muestras) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente BF16/FP32) |
| Idiomas soportados | en (etiqueta del repo; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto con 8 ranuras de salida y 3 bloques dual-path. Cada bloque usa 64 canales, 4 cabezas de atencion y FFN de 128, con kernel de convolucion 4 y 4 grupos de normalizacion RMS. La STFT emplea FFT de 256, hop de 128 y ventana Hann con padding constante centrado. La atencion es no causal tanto en tiempo como en frecuencia, lo que hace el modelo offline. El wrapper normaliza cada mezcla por RMS internamente, restaura la amplitud tras la sintesis y aplica consistencia de mezcla residual igualitaria (reparte `mixture - sum(outputs)` por igual entre ranuras).

El entrenamiento sigue una receta de dos etapas. Primero se entrena el padre durante 60.000 actualizaciones y se selecciona su checkpoint de validacion-MixIT en la actualizacion 59.000. Despues se cargan esos pesos, se reinician AdamW y el sampler, y se ejecutan 20.000 actualizaciones de fine-tune con coeficiente de dispersión 16 (frente a 0 en el padre) y LR constante de 0.0001 sin warmup. Los datos son FUSS reverberante (20.000 escenas de entrenamiento y 1.000 de desarrollo, revision `b183027b...`), con dos escenas observadas muestreadas uniformemente y recortes independientes de 4 s. Cada escena contiene de 1 a 4 fuentes, y la mezcla de mezclas puede llegar a 8. La perdida MixIT usa un solve lineal con pseudoinversa de respaldo, asignacion por coeficiente maximo y umbral suave de 30 dB; los gradientes no diferencian a traves del argmax. No entra ninguna fuente aislada en los gradientes. El entrenamiento se ejecuto en PyTorch 2.7.1/CUDA 12.6 sobre una NVIDIA A100 80GB, con BF16 en el backbone y FP32 en STFT, sintesis, asignacion y objetivo.

## Capacidades

- Separacion de fuentes de audio a 8 kHz en modo offline y no causal, con 8 ranuras de salida no ordenadas semanticamente.
- Entrenamiento MixIT sin fuentes aisladas: aprende a partir de mezclas observadas.
- Procesamiento de mezclas reverberantes del dataset FUSS.
- Manejo de mezclas de hasta 8 fuentes (combinacion de escenas de 1 a 4 fuentes).
- Consistencia de mezcla residual: la suma de salidas reconstruye la mezcla de entrada.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades de vision, audio generativo, texto ni multilingues mas alla de la etiqueta `en`.

## Casos de uso

- Investigacion en separacion de fuentes con MixIT: el modelo sirve como referencia reproducible de un pipeline de dos etapas con seleccion de checkpoints por SI-SDRi, util para comparar variantes de receta y coeficientes de dispersión.
- Prototipado de separacion de audio en entornos de laboratorio: con solo 1,29 M de parametros, se puede ejecutar en CPU para experimentos rapidos de separacion de mezclas reverberantes a 8 kHz.
- Estudio de la relacion entre MixIT y recuperacion de fuentes: las metricas publicadas (MixIT de 12,60 dB frente a SI-SDRi de 8,85 dB en desarrollo) permiten analizar la brecha entre reconstruccion de mezcla y recuperacion real de fuentes.
- Analisis de dispersión en separadores: el fine-tune con coeficiente 16 y su comparacion con el padre sin dispersión permiten estudiar el efecto de la regularizacion dispersa en las ranuras de salida.
- Reproduccion de experimentos con semilla fija: la configuracion determinista (algoritmos deterministas de Torch, `CUBLAS_WORKSPACE_CONFIG`) facilita replicar el entrenamiento en una A100 80GB.
- Base para fine-tuning en dominios acusticos concretos: al ser un modelo pequeno y con receta documentada, se puede reentrenar sobre mezclas de un dominio especifico (voz, musica, ruido) sin fuentes aisladas.

## Benchmarks y rendimiento

| Medicion en el checkpoint seleccionado (actualizacion 20.000) | dB |
|---|---:|
| MixIT sobre senal de entrenamiento (media de 20 minibatches registrados) | 13,9892 |
| MixIT sobre conjunto de entrenamiento (64 pares fijos) | 12,9236 |
| MixIT sobre desarrollo holdout (64 pares fijos) | 12,6058 |
| SI-SDRi de fuentes en desarrollo holdout (653 escenas multi-fuente) | 8,8518 |

Intervalo bootstrap al 95% por escena para SI-SDRi de fuentes: [8,2954; 9,4436] dB. Este intervalo cubre la variacion entre escenas para este checkpoint, pero no la variacion entre semillas ni la seleccion sobre la misma cohorte de desarrollo. No se realizo evaluacion independiente en test para este fine-tune.

| Actualizacion de fine-tune | SI-SDRi de fuentes en desarrollo (dB) | Pesos |
|---|---:|---|
| 20000 | 8,8518 | `checkpoints/step-00020000.safetensors` |
| 4000 | 8,8152 | `checkpoints/step-00004000.safetensors` |
| 2000 | 8,7706 | `checkpoints/step-00002000.safetensors` |
| 14000 | 8,6752 | `checkpoints/step-00014000.safetensors` |
| 12000 | 8,6140 | `checkpoints/step-00012000.safetensors` |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano (1,29 M de parametros); cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU dedicada; una A100 80GB solo es necesaria para reentrenar (una por fit, segun la receta).
- Cabe en GPU consumer: si, en cualquier RTX o equivalente, e incluso en CPU para inferencia de segmentos de 4 s.
- Opciones de despliegue: PyTorch (framework de referencia); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed3 (este) | 1.293.568 | 8 kHz, segmentos de 4 s | TF-Locoformer compacto, MixIT, fine-tune disperso | public-access-no-weight-license-grant | Hugging Face |
| mixit-fuss-tflocoformer-m8-plain-seed3 (padre) | no disponible | 8 kHz, segmentos de 4 s | TF-Locoformer compacto, MixIT sin dispersión | no disponible | Hugging Face |
| TF-Locoformer Medium (original) | no disponible | no disponible | TF-Locoformer de mayor tamano | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, enfoque y licencia.

## Limitaciones y advertencias

- Modelo de audio, no de lenguaje: no genera texto, no soporta tool calling ni agentes.
- Las ranuras de salida son no ordenadas y no corresponden a clases semanticas; no se puede asignar una ranura fija a una fuente concreta.
- Trabaja solo a 8 kHz y en modo offline no causal; no es apto para streaming ni para audio de banda ancha.
- Las metricas publicadas son de desarrollo y estan sesgadas por la seleccion de checkpoints sobre la misma cohorte; no deben presentarse como rendimiento de test no sesgado.
- No se realizo evaluacion independiente en test para este fine-tune.
- Las puntuaciones altas de MixIT no garantizan buena recuperacion de fuentes individuales (SI-SDRi de 8,85 dB frente a MixIT de 12,60 dB).
- La licencia `public-access-no-weight-license-grant` no otorga derechos de uso sobre los pesos; es necesario revisar `LICENSE-WEIGHTS.md` antes de cualquier uso, incluido el comercial.
- Riesgo de sesgo acustico: entrenado solo con FUSS reverberante en ingles, puede degradarse en otros dominios acusticos o idiomas.
- El modelo es una variante compacta, no el TF-Locoformer Medium original; los resultados no son extrapolables a ese modelo.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed3
- Modelo padre: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed3
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-ft20k-seed3/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
