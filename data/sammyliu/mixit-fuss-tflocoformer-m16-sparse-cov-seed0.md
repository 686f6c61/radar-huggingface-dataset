# sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed0

## Resumen

MixIT FUSS TF-Locoformer (16 slots, seed 0) es un separador de audio offline desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un modelo compacto de 1.302.800 parametros entrenado mediante *mixture-invariant training* (MixIT) sobre mezclas reverberantes observadas del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. El modelo opera a 8 kHz en mono y produce 16 slots de salida no ordenados, que no corresponden a clases semanticas.

La relevancia del modelo reside en su enfoque metodologico: demuestra que es posible entrenar un separador de fuentes sin datos aislados supervisados, usando unicamente mezclas observadas y una asignacion eficiente de salidas a ramas. El checkpoint publicado corresponde a la actualizacion 58.000 de una unica ejecucion de 60.000 pasos, seleccionado por puntuacion MixIT de validacion y no por SI-SDRi de fuentes.

Arquitectonicamente emplea un backbone TF-Locoformer compacto con 3 bloques dual-path, 64 canales, 4 cabezas y FFN de 128, con atencion no causal en tiempo y frecuencia. No debe confundirse con el modelo Medium del articulo original de TF-Locoformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path con atencion no causal en tiempo y frecuencia) |
| Parametros totales | 1.302.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 4 segundos a 8 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto con 16 slots de salida y 3 bloques dual-path. La configuracion interna usa 64 canales, 4 cabezas de atencion, FFN de 128, kernel de convolucion 4 y 4 grupos de normalizacion RMS. La STFT emplea FFT de 256, hop de 128 y ventana Hann con padding constante centrado. El dropout es 0 y el multiplicador residual del FFN es 1.0. La atencion es no causal tanto en el eje temporal como en el frecuencial, lo que implica que el modelo es offline y no apto para streaming.

El entrenamiento se realizo con MixIT sobre el dataset FUSS reverberante (20.000 escenas de entrenamiento, 1.000 de validacion, revision `b183027b802d1a488dea8b6f1d80daa32b76b681`). Cada ejemplo combina dos escenas observadas distintas con crops aleatorios independientes de 4 segundos; cada escena contiene entre 1 y 4 fuentes, por lo que la mezcla de mezclas puede contener hasta 8. Se usaron lotes de 16 ejemplos, 60.000 actualizaciones del optimizador AdamW (betas 0.9/0.999, epsilon 1e-8, weight decay 0.01), learning rate pico de 0.001 con warmup lineal de 1.000 pasos multiplicado por schedule coseno y suelo de 0.0001, y clipping de norma global 5. La precision fue BF16 en el backbone y FP32 en STFT, sintesis, asignacion y objetivo, con TF32 permitido. El entrenamiento se ejecuto en una NVIDIA A100 80GB con PyTorch 2.7.1 y CUDA 12.6.

La innovacion tecnica principal es la asignacion eficiente de MixIT: se resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` mediante solve lineal con fallback a pseudoinversa, y cada salida se asigna a la rama con mayor coeficiente. La perdida combina el termino MixIT con umbral suave de 30 dB, un termino de esparsidad RMS de fuentes con peso 4.0 y un termino de covarianza fuera de diagonal de forma de onda con peso 0.1. Los gradientes no se diferencian a traves del argmax duro. Se aplica consistencia de mezcla mediante proyeccion residual equitativa sobre todos los slots.

## Capacidades

- Separacion de audio offline en 16 slots de salida no ordenados a partir de mezclas reverberantes mono a 8 kHz.
- Entrenamiento sin fuentes aisladas: aprende a partir de mezclas observadas mediante MixIT.
- Manejo de mezclas de mezclas con hasta 8 fuentes combinadas (dos escenas de 1 a 4 fuentes cada una).
- Normalizacion interna de amplitud por RMS de entrada con restauracion posterior.
- Proyeccion de consistencia de mezcla sobre todos los slots de salida.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio de entrada mas alla del procesamiento de senal descrito.
- Capacidades multilingues no aplicables: el modelo procesa audio, no texto.

## Casos de uso

- Separacion de fuentes en grabaciones reverberantes de 8 kHz: el modelo puede descomponer una mezcla en hasta 16 slots y asignar cada fuente activa a un slot mediante asignacion hungara en postproceso, adecuado para audios telefonicos o de baja tasa de muestreo.
- Preprocesado para reconocimiento de voz en entornos con multiples hablantes: al separar las fuentes antes de un ASR, se reduce la interferencia entre hablantes en escenarios de reunion o conferencia con audio de 8 kHz.
- Investigacion en aprendizaje no supervisado de separacion: el modelo sirve como referencia reproducible de MixIT con asignacion eficiente, con receta completa en `recipe.json` y metricas por escena en `metrics.json`.
- Experimentos de ablation sobre esparsidad y covarianza: los pesos de los terminos de regularizacion (4.0 y 0.1) y la receta estan documentados, lo que facilita reproducir variaciones controladas.
- Prototipado de pipelines de separacion en CPU/GPU de gama baja: con 1.3M de parametros, el modelo es ligero y puede ejecutarse en hardware modesto para pruebas de concepto.
- Generacion de datos sinteticos de entrenamiento: los slots separados pueden usarse como pseudo-etiquetas para preentrenar otros modelos de separacion o ASR en dominios con escasez de fuentes aisladas.
- Analisis de escenas reverberantes con numero variable de fuentes: la evaluacion documentada cubre escenas de 1 a 4 fuentes y mezclas de hasta 8, lo que permite estudiar el comportamiento del modelo segun el numero de fuentes activas.

## Benchmarks y rendimiento

| Metrica | Valor (dB) |
|---|---|
| MixIT en entrenamiento, 64 MoMs fijos | 12.9833 |
| MixIT en validacion holdout, 64 MoMs fijos | 12.8261 |
| SI-SDRi de fuentes en validacion, 653 escenas multi-fuente | 7.0631 |
| SI-SDRi de fuentes en test, 166 escenas multi-fuente | 6.9913 |
| Intervalo bootstrap 95% de SI-SDRi en test | [5.9103, 8.0717] |
| MixIT en senal de entrenamiento, media ultimos 20 minibatches (update 60.000) | 14.4766 |
| MixIT en validacion (update 60.000) | 12.7997 |
| SI-SDRi de fuentes en validacion, subconjunto de 128 escenas (update 60.000) | 6.7282 |

El checkpoint `model.safetensors` fue seleccionado en la actualizacion 58.000 por puntuacion MixIT de validacion, no por SI-SDRi ni rendimiento en test. El intervalo de confianza del 95% describe la incertidumbre entre escenas evaluadas para esta unica semilla, no entre semillas de entrenamiento. La evaluacion de fuentes usa los cuatro segundos centrales de cada escena observada, sin formar mezcla de mezclas, y emplea asignacion hungara uno a uno tras eliminar las medias por forma de onda.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1.302.800 parametros en FP32 el peso ocupa aproximadamente 5 MB, y en BF16 unos 2,6 MB. El consumo dominante sera el de las activaciones y buffers STFT para crops de 4 segundos a 8 kHz.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizo en una NVIDIA A100 80GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: si, en cualquier GPU con al menos unos pocos cientos de MB de VRAM libre (GTX 1650, RTX 3060, RTX 4090, etc.). Tambien es viable en CPU.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y arquitectura personalizada, requiere cargar la implementacion del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un separador de audio).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | SI-SDRi test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 (este) | 1.302.800 | 4 s a 8 kHz, mono | 6.9913 dB | public-access-no-weight-license-grant | Hugging Face |
| TF-Locoformer Medium (paper original) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |
| Otros separadores MixIT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de otros modelos en la informacion proporcionada. El autor indica explicitamente que esta configuracion compacta no es el modelo Medium del articulo original de TF-Locoformer.

## Limitaciones y advertencias

- Los 16 slots de salida son no ordenados y no corresponden a clases semanticas; requieren asignacion posterior (por ejemplo, hungara) para mapearlos a fuentes.
- El modelo opera exclusivamente a 8 kHz en mono, lo que limita su uso en aplicaciones de banda ancha (musica, voz de alta calidad).
- La atencion es no causal en tiempo y frecuencia: el modelo es offline y no apto para separacion en streaming o tiempo real.
- La seleccion del checkpoint se hizo por MixIT de validacion, no por SI-SDRi; el rendimiento en separacion real (6.99 dB en test) es modesto y el intervalo de confianza es amplio ([5.91, 8.07] dB).
- Los resultados corresponden a una unica semilla (seed 0); no se reporta variabilidad entre semillas.
- El test se evaluo sobre 256 escenas de los shards 8-11, no sobre el split completo de test.
- La licencia `public-access-no-weight-license-grant` restringe el uso; debe consultarse el archivo `LICENSE-WEIGHTS.md` antes de cualquier uso comercial.
- Riesgo de alucinacion no aplicable en el sentido de modelos de lenguaje, pero si existe riesgo de artefactos o fuentes espurias en los slots de salida, especialmente con mezclas de muchas fuentes.
- No se documentan sesgos demograficos ni de idioma mas alla de la etiqueta `en`; el modelo procesa senal de audio y no texto.
- No se garantiza igualdad bit a bit entre distintas versiones de PyTorch o hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed0
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed0/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
