# sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed1

## Resumen

MixIT FUSS TF-Locoformer m16 sparse-cov seed1 es un modelo de separación de fuentes de audio entrenado mediante mixture-invariant training (MixIT) sobre mezclas reverberantes observadas del conjunto FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. Lo desarrolla el usuario sammyliu y se publica como un artefacto de investigación reproducible: un ajuste completo de 60.000 actualizaciones, sus cinco mejores checkpoints por validación, los pesos finales y la inicialización aleatoria. El modelo opera a 8 kHz en modo offline y produce 16 ranuras de salida no ordenadas, que no corresponden a clases semánticas.

La arquitectura es un TF-Locoformer compacto (transformer con bloques dual-path sobre tiempo y frecuencia) con 64 canales, 4 cabezas, FFN de 128 y 3 bloques dual-path. Con 1.302.800 parámetros totales, es un modelo muy pequeño orientado a experimentación y a validar recetas de entrenamiento, no a producción de alta fidelidad. Su relevancia actual reside en que documenta de forma exhaustiva la receta, las métricas y el protocolo de evaluación de un separador MixIT, lo que facilita la reproducibilidad en una línea de investigación donde los detalles de implementación importan tanto como la arquitectura.

El modelo alcanza un SI-SDRi de test de 7,3355 dB sobre 166 escenas multi-fuente (intervalo bootstrap del 95 %: [6,3735, 8,3185] dB), medido con asignación húngara uno a uno entre ranuras y fuentes activas. La licencia es "public-access-no-weight-license-grant", lo que restringe explícitamente el uso de los pesos y conviene revisar antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer dual-path tiempo-frecuencia), 3 bloques dual-path |
| Parametros totales | 1.302.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrenado con recortes aleatorios de 4 segundos a 8 kHz |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | en (etiqueta del repositorio); el modelo procesa audio, no texto |
| Licencia | public-access-no-weight-license-grant (license: other) |
| Formato de pesos | safetensors (model.safetensors), más checkpoints e inicialización |

Otros parámetros de configuración relevantes:

| Parametro | Valor |
|---|---|
| Canales / cabezas / FFN | 64 / 4 / 128 |
| Kernel de convolución | 4 |
| Grupos de normalización RMS | 4 |
| STFT | FFT 256, hop 128, ventana Hann, padding constante centrado |
| Dropout | 0 |
| Multiplicador residual FFN | 1.0 |
| Ranuras de salida | 16 |
| Frecuencia de muestreo | 8.000 Hz, mono |
| Precisión de entrenamiento | BF16 en backbone; FP32 en STFT, síntesis, asignación y objetivo; TF32 permitido |

## Arquitectura y entrenamiento

El backbone es un TF-Locoformer compacto con atención no causal tanto en el eje temporal como en el frecuencial, organizado en 3 bloques dual-path. La entrada se transforma con STFT (FFT 256, hop 128, ventana Hann) y la envoltura de forma de onda normaliza cada entrada por su RMS internamente, restaurando la amplitud tras la síntesis. La configuración es deliberadamente reducida y no corresponde al modelo Medium del artículo original.

El entrenamiento usa MixIT sobre el conjunto FUSS reverberante (20.000 escenas de entrenamiento, 1.000 de validación, revisión `b183027b802d1a488dea8b6f1d80da32b76b681`). Cada ejemplo combina dos escenas observadas distintas con recortes aleatorios independientes de 4 segundos; cada escena contiene de 1 a 4 fuentes, por lo que la mezcla de mezclas puede llegar a 8 fuentes. Se realizaron 60.000 actualizaciones con batch de 16, semilla 1, optimizador AdamW (betas 0.9/0.999, epsilon 1e-8, weight decay 0.01), LR pico 0.001 con warmup lineal de 1.000 pasos multiplicado por schedule coseno y suelo de 0.0001, y recorte de norma global 5.

La asignación MixIT es la variante "hard efficient": se resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` mediante solve lineal con fallback a pseudoinversa, y cada salida se asigna a la rama con mayor coeficiente; las reconstrucciones de rama suman sus salidas asignadas. La pérdida es `-10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB, más 4.0 veces la esparsidad RMS de fuentes y 0.1 veces la covarianza muestral fuera de diagonal. Se aplica consistencia de mezcla mediante proyección residual equitativa sobre todas las ranuras. Los gradientes no diferencian a través del argmax duro. El entrenamiento se ejecutó en una NVIDIA A100 80GB con PyTorch 2.7.1 y CUDA 12.6, con algoritmos deterministas habilitados.

## Capacidades

- Separación de fuentes de audio offline a 8 kHz sobre mezclas reverberantes, generando 16 ranuras de salida no ordenadas.
- Entrenamiento mixture-invariant: no requiere fuentes aisladas como supervisión, solo mezclas observadas.
- Manejo de mezclas de mezclas con hasta 8 fuentes combinando dos escenas de 1 a 4 fuentes.
- Consistencia de mezcla: la proyección residual garantiza que las salidas reconstruyan la mezcla de entrada.
- Procesamiento de audio mono con normalización interna por RMS y restauración de amplitud.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto: es un modelo puramente de audio.
- No dispone de modo thinking, visión ni audio de entrada en sentido generativo; su tarea es discriminativa/regresiva sobre formas de onda.

## Casos de uso

- Investigación reproducible en separación de fuentes: sirve como referencia completa de una receta MixIT con métricas, configuración y protocolo de evaluación documentados, útil para comparar variantes de asignación o de arquitectura.
- Prototipado de pipelines de separación en entornos con recursos limitados: sus 1,3 millones de parámetros permiten iterar rápidamente en una sola GPU consumer antes de escalar a modelos mayores.
- Estudio de la asignación MixIT eficiente: el repositorio incluye la implementación exacta del solve lineal con fallback a pseudoinversa y el umbral suave de 30 dB, lo que facilita experimentos controlados sobre la función de pérdida.
- Evaluación de métricas de separación: al publicar MixIT dB, SI-SDRi de validación y test con intervalos bootstrap, puede usarse como banco de pruebas para comparar implementaciones de SI-SDRi y asignación húngara.
- Análisis de esparsidad y covarianza en separadores: los pesos de 4.0 (RMS de fuentes) y 0.1 (covarianza fuera de diagonal) son configurables y el modelo sirve para estudiar su efecto en la calidad de separación.
- Docencia y formación: un modelo pequeño y completamente documentado es adecuado para explicar dual-path transformers, STFT y MixIT en cursos de procesamiento de audio.
- Detección de límites de MixIT: útil para estudiar cuándo la consistencia de mezcla no implica separación correcta, dado que el autor advierte explícitamente de esta distinción.

## Benchmarks y rendimiento

| Medicion | Valor (dB) |
|---|---|
| MixIT en entrenamiento, 64 MoMs fijos de evaluación | 13,4543 |
| MixIT en validación holdout, 64 MoMs fijos de evaluación | 12,9158 |
| SI-SDRi de fuentes en validación holdout, 653 escenas multi-fuente | 7,0179 |
| SI-SDRi de fuentes en test, 166 escenas multi-fuente | 7,3355 |
| Intervalo bootstrap del 95 % para SI-SDRi de test | [6,3735, 8,3185] |
| MixIT de señal de entrenamiento, media de las últimas 20 minibatches (update 60.000) | 13,9824 |
| MixIT de validación en el update 60.000 | 12,9158 |
| SI-SDRi de validación en subconjunto de progreso de 128 escenas (update 60.000) | 6,5640 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El checkpoint `model.safetensors` se seleccionó en el update 60.000 por MixIT de validación, no por SI-SDRi de fuentes ni por rendimiento en test.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,3 millones de parámetros, los pesos ocupan del orden de 5 MB en FP32 y unos 2,6 MB en BF16, más el estado de activaciones para recortes de 4 segundos.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el entrenamiento se realizó en una NVIDIA A100 80GB, pero la inferencia cabe holgadamente en GPUs consumer.
- Cabe en GPU consumer: sí, en cualquier RTX o incluso en CPU para audio corto, dado el reducido tamaño.
- Opciones de despliegue: PyTorch nativo (el repositorio incluye código de inferencia y configuración); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible; no se publican mediciones de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia cualitativa, el propio autor indica que esta configuración compacta no es el modelo Medium del artículo original de TF-Locoformer, por lo que no es directamente comparable con él en parámetros ni en rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 (este) | 1.302.800 | no disponible (recortes de 4 s) | public-access-no-weight-license-grant | Hugging Face, safetensors |
| TF-Locoformer Medium (artículo original) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de separación MixIT | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia "public-access-no-weight-license-grant" restringe el uso de los pesos; es imprescindible revisar `LICENSE-WEIGHTS.md` antes de cualquier uso comercial o redistribution.
- Modelo de un solo seed (seed 1): el intervalo de confianza publicado describe incertidumbre entre escenas evaluadas, no entre semillas de entrenamiento.
- Las 16 ranuras de salida son no ordenadas y no corresponden a clases semánticas; requieren asignación posterior (por ejemplo, húngara) para evaluar fuentes concretas.
- La consistencia de mezcla exacta no garantiza una separación correcta de fuentes; el autor lo advierte explícitamente.
- El checkpoint se seleccionó por MixIT de validación, no por SI-SDRi de fuentes ni por rendimiento en test, lo que puede no ser óptimo para aplicaciones de separación.
- Evaluación de test limitada a 256 escenas de los shards 8–11, no al split completo.
- Audio a 8 kHz y mono: no apto para aplicaciones de música o voz de banda ancha sin remuestreo y posible pérdida de calidad.
- Entrenado sobre FUSS reverberante; el rendimiento fuera de esa distribución (otras reverberaciones, dominios o idiomas) es incierto.
- No se publican mediciones de latencia, throughput ni comparativas con otros modelos.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de artefactos en las fuentes estimadas cuando la mezcla se aleja de la distribución de entrenamiento.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed1
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-sparse-cov-seed1/blob/main/LICENSE-WEIGHTS.md
- Artículo MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Artículo TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
- Dataset FUSS (referencia en la model card): https://huggingface.co/datasets/scaleinvariant/fuss-parquet
