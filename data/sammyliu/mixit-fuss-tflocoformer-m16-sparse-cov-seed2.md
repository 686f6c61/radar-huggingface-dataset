# sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed2

## Resumen

MixIT FUSS TF-Locoformer m16 sparse-cov seed2 es un modelo de separacion de fuentes de audio (source separation) entrenado mediante MixIT (mixture-invariant training) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario sammyliu y se publica en Hugging Face bajo una licencia restrictiva de tipo "public-access-no-weight-license-grant". El modelo opera a 8 kHz en modo offline (no streaming) y produce 16 ranuras de salida no ordenadas, que no corresponden a clases semanticas.

La arquitectura es un TF-Locoformer compacto (transformer de doble via sobre representaciones tiempo-frecuencia) con 3 bloques dual-path, 64 canales, 4 cabezas de atencion y FFN de 128 dimensiones, con atencion no causal tanto en tiempo como en frecuencia. El modelo total tiene 1.302.800 parametros, por lo que es extremadamente ligero y apto para experimentacion y despliegue en hardware modesto.

Su relevancia radica en que demuestra un flujo de entrenamiento MixIT completo (60.000 actualizaciones, seleccion de checkpoint por validacion MixIT) sobre mezclas observadas, con metricas auditadas de SI-SDRi en validacion (6,9816 dB) y test (6,9017 dB). Es un artefacto de investigacion reproducible mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer de doble via tiempo-frecuencia), 3 bloques dual-path |
| Parametros totales | 1.302.800 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa crops de 4 segundos a 8 kHz (offline) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto con 16 ranuras de salida, 3 bloques dual-path, 64 canales, 4 cabezas y FFN de 128, kernel de convolucion 4 y 4 grupos de normalizacion RMS. La STFT usa FFT de 256, hop de 128, ventana Hann y padding constante centrado. La atencion es no causal en tiempo y frecuencia. El wrapper de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la sintesis. Esta configuracion no es el modelo Medium del paper original.

El entrenamiento emplea MixIT sobre el dataset FUSS reverberante (20.000 escenas de entrenamiento, 1.000 de validacion, revision fijada). Cada ejemplo muestrea dos escenas observadas distintas con crops aleatorios independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes, por lo que la mezcla de mezclas puede contener hasta 8. Se usan 16 ejemplos por lote, 60.000 actualizaciones, semilla 2, AdamW (betas 0.9/0.999, epsilon 1e-8, weight decay 0.01), LR pico 0.001 con warmup lineal de 1.000 pasos y schedule coseno con suelo 0.0001, clipping de norma global 5 y precision BF16 en el backbone con FP32 en STFT, sintesis, asignacion y objetivo. La asignacion MixIT eficiente resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` y asigna cada salida a la rama de mayor coeficiente; la perdida es `-10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB, mas un termino de esparsidad de RMS de fuentes (peso 4.0) y un termino de covarianza de forma de onda fuera de diagonal (peso 0.1). La consistencia de mezcla se impone con proyeccion de residuo igual sobre todas las ranuras. El checkpoint seleccionado fue el de la actualizacion 51.000, elegido por score MixIT de validacion, no por SI-SDRi. El entrenamiento se ejecuto en una NVIDIA A100 80GB con PyTorch 2.7.1 y CUDA 12.6.

## Capacidades

- Separacion de fuentes de audio offline a 8 kHz sobre mezclas reverberantes.
- Produccion de 16 ranuras de salida no ordenadas (sin correspondencia semantica con fuentes).
- Procesamiento de mezclas de mezclas con hasta 8 fuentes combinadas.
- Imposicion de consistencia de mezcla (las salidas suman la mezcla de entrada).
- Entrenamiento sin fuentes aisladas (MixIT), lo que permite usar datos de mezclas observadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de texto: es un modelo puramente de audio.
- No dispone de modo thinking, vision ni audio de entrada mas alla de la senal de audio a separar.

## Casos de uso

- Investigacion en separacion de fuentes: sirve como linea base reproducible de MixIT con metricas auditadas y receta completa (`recipe.json`), util para comparar variantes de arquitectura o de funcion de perdida.
- Prototipado de pipelines de separacion en entornos con recursos limitados: con 1,3 M de parametros puede ejecutarse en CPU o GPU consumer para validar ideas antes de escalar a modelos mayores.
- Generacion de datos sinteticos de entrenamiento: las 16 salidas pueden usarse como estimaciones iniciales para inicializar o preentrenar otros separadores.
- Estudio de consistencia de mezcla: el modelo impone suma exacta a la mezcla, lo que permite analizar el efecto de esta restriccion en la calidad de separacion.
- Evaluacion de tecnicas de asignacion MixIT: la implementacion de asignacion eficiente (resolucion lineal con fallback a pseudoinversa) es reutilizable para experimentos con otras perdidas.
- Analisis de esparsidad y covarianza: los terminos de regularizacion (peso 4.0 en RMS y 0.1 en covarianza fuera de diagonal) pueden estudiarse de forma aislada con este checkpoint.
- Docencia y divulgacion: modelo pequeno y con receta detallada, adecuado para explicar MixIT y TF-Locoformer en cursos de procesamiento de audio.

## Benchmarks y rendimiento

| Metrica | Valor (dB) |
|---|---|
| MixIT en entrenamiento (64 MoMs fijos) | 13,0841 |
| MixIT en validacion (64 MoMs fijos) | 12,9946 |
| SI-SDRi en validacion (653 escenas multi-fuente) | 6,9816 |
| SI-SDRi en test (166 escenas multi-fuente) | 6,9017 |
| Intervalo bootstrap 95% SI-SDRi test | [5,8429, 7,9353] |
| MixIT en entrenamiento, ultimo update (media ultimos 20 minibatches) | 13,8552 |
| MixIT en validacion, ultimo update | 12,8587 |
| SI-SDRi en validacion, subconjunto de 128 escenas, ultimo update | 6,6492 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible; las cifras anteriores son del propio autor y corresponden al checkpoint seleccionado en la actualizacion 51.000.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos (1,3 M de parametros); el consumo dominante es el buffer de audio y la STFT, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en una A100 80GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (pesos safetensors); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de audio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | SI-SDRi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 (este) | 1,3 M | crops de 4 s a 8 kHz | 6,9017 dB (test) | public-access-no-weight-license-grant | Hugging Face |
| TF-Locoformer original (paper) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas MixIT de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Licencia restrictiva: "public-access-no-weight-license-grant" implica que no se concede licencia de uso sobre los pesos; el uso comercial no esta permitido sin autorizacion explicita. Revisar `LICENSE-WEIGHTS.md`.
- Salidas no ordenadas: las 16 ranuras no tienen correspondencia semantica con fuentes; requieren asignacion posterior (por ejemplo, Hungarian) para evaluar o usar en pipelines.
- Solo 8 kHz y offline: no apto para audio de banda ancha (16/44,1 kHz) ni para streaming en tiempo real.
- Modelo compacto de investigacion: no es el modelo Medium del paper original; el rendimiento es limitado (SI-SDRi ~6,9 dB en test).
- Seleccion de checkpoint por MixIT, no por SI-SDRi: el checkpoint elegido no esta optimizado directamente para la metrica de separacion final.
- Evaluacion parcial del test: solo 256 escenas de los shards 8-11, no el split completo; el intervalo de confianza refleja incertidumbre entre escenas para una sola semilla, no entre semillas.
- Riesgo de sobreajuste a FUSS reverberante: el dominio de entrenamiento es acotado y la generalizacion a otras condiciones acusticas no esta documentada.
- Sin garantia de reproducibilidad bit a bit en otro hardware o version de PyTorch.
- No aplica a tareas de texto, codigo, vision ni agentes; cualquier uso en esos ambitos carece de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed2
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed2/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS (referencia): https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
