# sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed0

## Resumen

MixIT FUSS TF-Locoformer m16 sparse seed0 es un modelo de separación de fuentes de audio entrenado con mixture-invariant training (MixIT) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivos de entrenamiento. Lo desarrolla el usuario de Hugging Face sammyliu y se publica como un experimento reproducible de un único entrenamiento (seed 0) de 60.000 actualizaciones. El modelo trabaja a 8 kHz en modo offline y produce 16 slots de salida no ordenados, que no corresponden a clases semánticas.

La arquitectura es un TF-Locoformer compacto (transformer de doble vía sobre tiempo y frecuencia) con 3 bloques dual-path, 64 canales, 4 cabezas y FFN de 128, lo que da un total de 1.302.800 parámetros según los pesos en safetensors. La innovación principal es el uso de MixIT: el modelo aprende a separar mezclas de mezclas observadas, sin necesidad de etiquetas de fuente, lo que reduce drásticamente el coste de anotación en separación de audio.

Es relevante ahora porque demuestra que un separador muy pequeño puede alcanzar un SI-SDRi de test de 6,96 dB en escenas multi-fuente de FUSS, con un intervalo de confianza bootstrap del 95% de [5,91, 8,03] dB. El repositorio incluye los cinco mejores checkpoints de validación, los pesos finales, la inicialización aleatoria y métricas por escena, lo que facilita la reproducibilidad y el estudio de la variabilidad entre semillas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path tiempo-frecuencia) con 3 bloques dual-path |
| Parámetros totales | 1.302.800 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrenado con crops de 4 segundos a 8 kHz |
| Tipos de cuantización | no disponible (solo safetensors en BF16/FP32) |
| Idiomas soportados | en (etiqueta de idioma del repo; la tarea es audio, no texto) |
| Licencia | public-access-no-weight-license-grant (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto: un transformer de doble vía que aplica atención sobre los ejes de tiempo y de frecuencia de forma separada, con atención no causal en ambos ejes. La configuración concreta incluye 64 canales, 4 cabezas de atención, FFN de 128, kernel de convolución 4 y 4 grupos de normalización RMS. La STFT usa FFT de 256, hop de 128 y ventana Hann con padding constante centrado. La entrada es mono a 8.000 Hz y la salida son 16 slots con consistencia de mezcla mediante proyección residual equitativa.

El entrenamiento se realizó con MixIT sobre el dataset FUSS reverberante (20.000 escenas de entrenamiento y 1.000 de validación, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`). Cada ejemplo combina dos escenas observadas distintas con crops aleatorios independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes y la mezcla de mezclas puede llegar a 8. Se usaron 16 ejemplos por batch, 60.000 actualizaciones, AdamW con pico de learning rate 0,001, warmup lineal de 1.000 pasos y schedule coseno con suelo de 0,0001, clipping de norma global 5 y precisión BF16 en el backbone con FP32 en STFT, síntesis, asignación y objetivo. La asignación MixIT es la variante "hard efficient": se resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` y cada salida se asigna a la rama con mayor coeficiente; los gradientes no atraviesan el argmax. La pérdida añade un término de esparsidad RMS de fuentes con peso 4,0 y un término de covarianza fuera de diagonal con peso 0,0. El entrenamiento se ejecutó en una NVIDIA A100 80GB con PyTorch 2.7.1 y CUDA 12.6.

## Capacidades

- Separación de fuentes de audio offline a 8 kHz sobre mezclas reverberantes.
- Producción de 16 slots de salida no ordenados, sin correspondencia semántica con clases de fuente.
- Manejo de mezclas de mezclas con hasta 8 fuentes activas.
- Consistencia de mezcla garantizada mediante proyección residual sobre todos los slots.
- Entrenamiento sin fuentes aisladas: no requiere etiquetas de fuente para el ajuste.
- Evaluación con asignación húngara uno-a-uno entre slots y fuentes activas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de texto; la etiqueta `en` del repo no implica procesamiento de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada más allá de la mezcla a separar.

## Casos de uso

- Separación de voces en reuniones grabadas: el modelo puede recibir una mezcla reverberante mono a 8 kHz y devolver 16 pistas candidatas; resulta adecuado por su entrenamiento específico en mezclas reverberantes de FUSS y su bajo coste computacional.
- Preprocesado para reconocimiento automático de habla: separar las fuentes antes de pasar el audio a un ASR puede mejorar la inteligibilidad en escenas con solapamiento; el SI-SDRi de 6,96 dB en test indica una separación parcial útil pero no perfecta.
- Investigación en aprendizaje auto-supervisado de audio: el repositorio incluye la inicialización, los cinco mejores checkpoints y las métricas por escena, lo que permite estudiar la variabilidad entre semillas y la estabilidad de MixIT.
- Prototipado de pipelines de separación en entornos con recursos limitados: con 1,3 millones de parámetros, el modelo cabe en GPUs de consumo y permite iterar rápidamente sobre recetas de entrenamiento.
- Generación de datos aumentados para entrenar otros modelos de audio: los 16 slots permiten construir pares de mezcla y estimaciones que sirven como pseudo-etiquetas en etapas posteriores.
- Evaluación comparativa de arquitecturas dual-path: al ser una configuración compacta y reproducible, sirve como baseline para comparar TF-Locoformer frente a otras arquitecturas en tareas de separación con MixIT.
- Análisis de robustez frente a reverberación: al entrenarse sobre FUSS reverberante, permite estudiar cómo afecta la reverberación a la separación en condiciones controladas.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el checkpoint seleccionado en la actualización 56.000 (seleccionado por MixIT de validación, no por SI-SDRi):

| Métrica | Valor (dB) |
|---|---|
| MixIT en entrenamiento, 64 MoMs fijos | 13,1665 |
| MixIT en validación holdout, 64 MoMs fijos | 13,0111 |
| SI-SDRi de fuente en validación holdout, 653 escenas multi-fuente | 6,8238 |
| SI-SDRi de fuente en test, 166 escenas multi-fuente | 6,9567 |
| Intervalo bootstrap del 95% para SI-SDRi de test | [5,9067, 8,0266] |

En la actualización final (60.000), la media de MixIT de entrenamiento sobre los últimos 20 minibatches registrados fue de 14,4210 dB, el MixIT de validación de 12,9757 dB y el SI-SDRi de validación sobre el subconjunto de progreso de 128 escenas de 6,3110 dB. El autor advierte que estos valores finales son distintos de los del checkpoint seleccionado y de la cohorte completa de validación. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 1,3 millones de parámetros, más el coste de las activaciones de la STFT y del transformer; no se dispone de una medición publicada.
- GPU recomendadas: cualquier GPU con soporte CUDA; el entrenamiento se realizó en una NVIDIA A100 80GB, pero la inferencia no requiere esa capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) por el reducido número de parámetros.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de audio en PyTorch con safetensors, el despliegue requiere cargar los pesos con PyTorch y ejecutar el wrapper de waveform descrito en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La model card indica explícitamente que esta configuración compacta no es el modelo Medium del paper original de TF-Locoformer, por lo que no es directamente comparable con él.

| Modelo | Parámetros | Contexto | SI-SDRi test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 sparse seed0 | 1.302.800 | crops de 4 s a 8 kHz | 6,9567 dB (166 escenas) | public-access-no-weight-license-grant | Hugging Face |
| TF-Locoformer Medium (paper) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de separación con MixIT | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los 16 slots de salida son no ordenados y no tienen correspondencia semántica con clases de fuente; cualquier asignación a hablantes o instrumentos requiere un paso externo.
- La selección del checkpoint se hizo por MixIT de validación, no por SI-SDRi ni por rendimiento en test, por lo que el checkpoint publicado puede no ser el óptimo para separación de fuentes.
- El intervalo de confianza del SI-SDRi de test describe la incertidumbre entre escenas evaluadas para una sola semilla, no la variabilidad entre semillas de entrenamiento.
- El test se evaluó sobre 256 escenas de los shards 8–11, no sobre la partición completa de test.
- La consistencia de mezcla exacta no garantiza una separación correcta de las fuentes; el propio autor lo señala explícitamente.
- El modelo opera a 8 kHz, lo que limita su uso en aplicaciones que requieran ancho de banda completo (música, voz de alta calidad).
- Solo se etiqueta el idioma `en`; no hay evidencia de comportamiento multilingüe ni de robustez fuera del dominio de FUSS.
- La licencia `public-access-no-weight-license-grant` es restrictiva y remite a un archivo `LICENSE-WEIGHTS.md`; no se concede permiso de uso comercial de los pesos sin consultar dicho documento.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación independiente.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.
- Riesgo de alucinación no aplicable en el sentido de texto, pero sí de artefactos de separación: el modelo puede asignar energía a slots sin fuente real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed0
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-seed0/blob/main/LICENSE-WEIGHTS.md
- Paper de MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper de TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
- Dataset FUSS en Hugging Face: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
