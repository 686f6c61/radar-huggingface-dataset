# sammyliu/mixit-fuss-tflocoformer-m16-plain-seed2

## Resumen

MixIT FUSS TF-Locoformer m16 (seed 2) es un modelo de separación de fuentes de audio desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un separador offline que opera a 8 kHz y que fue entrenado mediante *mixture-invariant training* (MixIT) sobre mezclas reverberantes del dataset FUSS, sin disponer de fuentes aisladas como objetivo de entrenamiento. El modelo produce 16 ranuras de salida no ordenadas, que no corresponden a clases semánticas predefinidas.

La relevancia técnica del modelo reside en su enfoque de entrenamiento: MixIT permite entrenar separadores sin datos etiquetados a nivel de fuente, lo que reduce drásticamente el coste de anotación. El backbone es un TF-Locoformer compacto de 3 bloques dual-path, con 64 canales, 4 cabezas de atención y FFN de 128, y un total de 1.302.800 parámetros. La longitud de contexto y los idiomas soportados no aplican en el sentido habitual de los modelos de lenguaje: el modelo procesa audio y su etiqueta de idioma es `en`.

El modelo alcanza un SI-SDRi de fuente de 6,8047 dB en validación (653 escenas multisource) y 6,7946 dB en test (166 escenas), con un intervalo de confianza bootstrap al 95% de [5,8008, 7,8237] dB. El checkpoint seleccionado corresponde a la actualización 58.000 de un total de 60.000, elegido por puntuación MixIT de validación y no por SI-SDRi ni por rendimiento en test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con bloques dual-path, atención no causal en tiempo y frecuencia) |
| Parametros totales | 1.302.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 4 segundos a 8 kHz) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (licencia `other`, ver LICENSE-WEIGHTS.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea un backbone TF-Locoformer compacto con 16 ranuras de salida y 3 bloques dual-path. La configuración interna es de 64 canales, 4 cabezas de atención y FFN de 128, con kernel de convolución 4 y 4 grupos de normalización RMS. La STFT usa FFT de 256, hop de 128 y ventana Hann con padding constante centrado. La atención es no causal tanto en el eje temporal como en el frecuencial. El wrapper de forma de onda normaliza cada entrada por su RMS internamente y restaura la amplitud tras la síntesis.

El entrenamiento se realizó sobre el dataset FUSS reverberante (20.000 escenas de entrenamiento y 1.000 de validación, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`), con dos escenas observadas distintas por ejemplo y crops aleatorios independientes de 4 segundos. Cada escena observada contiene entre 1 y 4 fuentes, y la mezcla de mezclas puede contener hasta 8. Se usó AdamW con betas (0,9, 0,999), epsilon 1e-8, weight decay 0,01, learning rate pico de 0,001 con warmup lineal de 1.000 pasos multiplicado por schedule coseno y suelo de 0,0001, clipping de norma global 5 y precisión BF16 en el backbone con FP32 en STFT, síntesis, asignación y objetivo. El entrenamiento se ejecutó en una NVIDIA A100 de 80 GB con PyTorch 2.7.1 y CUDA 12.6, con 60.000 actualizaciones y semilla 2.

La innovación principal es el uso de MixIT con asignación eficiente dura: primero se resuelve `A = X Y^T (Y Y^T + 1e-6 I)^(-1)` mediante resolución lineal con fallback a pseudoinversa, y después se asigna cada salida a la rama con mayor coeficiente. La pérdida es `-10 log10(max(||x||²,1e-8) / max(||x-xhat||² + 0.001||x||²,1e-8))` con umbral suave de 30 dB. Los gradientes no se diferencian a través del argmax duro. Los pesos de sparsity RMS de fuente y de covarianza off-diagonal son ambos 0,0. La proyección de consistencia de mezcla es de residuo igual sobre todas las ranuras de salida.

## Capacidades

- Separación de fuentes de audio offline a 8 kHz sobre mezclas reverberantes.
- Producción de 16 ranuras de salida no ordenadas (no son clases semánticas).
- Entrenamiento sin fuentes aisladas: aprende a separar a partir de mezclas de mezclas observadas.
- Manejo de mezclas con hasta 8 fuentes (cada escena observada aporta de 1 a 4).
- Procesamiento de crops de 4 segundos con normalización RMS interna y restauración de amplitud.
- Evaluación mediante asignación húngara uno-a-uno entre ranuras de salida y fuentes activas de referencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada más allá del propio audio a separar.
- Capacidades multilingües no aplicables; la etiqueta de idioma es `en`.

## Casos de uso

- Investigación en separación de fuentes sin etiquetas: el modelo sirve como referencia reproducible de MixIT sobre FUSS, con receta, revisión de dataset y métricas por escena incluidas en `metrics.json`, lo que facilita la comparación entre semillas y configuraciones.
- Prototipado de pipelines de separación en entornos con pocos datos anotados: al no requerir fuentes aisladas, permite adaptar el enfoque a dominios donde solo se dispone de mezclas, usando el modelo como punto de partida y fine-tuning posterior.
- Evaluación comparativa de algoritmos de asignación: la receta documenta la asignación dura eficiente con resolución lineal y fallback a pseudoinversa, lo que permite contrastar variantes de asignación (exhaustiva, binaria, SI-SDR) sobre el mismo backbone.
- Análisis de escenas reverberantes de hasta 8 fuentes: útil en estudios acústicos donde se quiere medir la recuperación de fuentes individuales frente a la mezcla de entrada mediante SI-SDRi.
- Reproducción de experimentos con semillas controladas: el repositorio incluye pesos finales, los cinco mejores checkpoints de validación y la inicialización aleatoria, lo que permite estudiar la variabilidad entre semillas y la selección de checkpoint.
- Docencia y formación en aprendizaje auto-supervisado para audio: el modelo es lo bastante pequeño (1,3 M de parámetros) para inspeccionar la arquitectura y el objetivo MixIT en detalle sin requerir infraestructura pesada.
- Generación de datos sintéticos de separación: las 16 ranuras de salida pueden usarse como estimaciones iniciales para construir pseudo-etiquetas en un pipeline de destilación o de entrenamiento iterativo.

## Benchmarks y rendimiento

| Metrica | Valor (dB) |
|---|---|
| MixIT en entrenamiento (64 MoMs fijos) | 13,2841 |
| MixIT en validación holdout (64 MoMs fijos) | 12,9484 |
| SI-SDRi de fuente en validación holdout (653 escenas multisource) | 6,8047 |
| SI-SDRi de fuente en test (166 escenas multisource) | 6,7946 |
| Intervalo bootstrap al 95% del SI-SDRi de test | [5,8008, 7,8237] |
| MixIT en señal de entrenamiento (media de las últimas 20 minibatches, update 60.000) | 13,7736 |
| MixIT en validación (update 60.000) | 12,8291 |
| SI-SDRi de validación en subconjunto de progreso de 128 escenas (update 60.000) | 6,2506 |

El checkpoint `model.safetensors` fue seleccionado en la actualización 58.000 por puntuación MixIT de validación, no por SI-SDRi ni por rendimiento en test. La evaluación de test usa 256 escenas de los shards 8–11 del split de test, no el split completo. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,3 M de parámetros y procesamiento de crops de 4 segundos a 8 kHz, la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A100 de 80 GB, pero la inferencia no requiere esa clase de hardware; cualquier GPU con soporte CUDA (RTX 4090, RTX 3090, RTX 2080, etc.) es suficiente.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros y la ventana de 4 segundos.
- Opciones de despliegue: el repositorio usa PyTorch 2.7.1 con CUDA 12.6; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de audio de este tipo). El despliegue se haría mediante PyTorch nativo cargando `model.safetensors` y `config.json`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento usó BF16 en el backbone y FP32 en STFT y síntesis, con TF32 permitido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | SI-SDRi test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixIT FUSS TF-Locoformer m16 (seed 2) | 1.302.800 | crops de 4 s a 8 kHz | 6,7946 dB (166 escenas) | public-access-no-weight-license-grant | Hugging Face |
| TF-Locoformer Medium (paper original) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas MixIT sobre FUSS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. El propio autor indica que esta configuración compacta no es el modelo Medium del paper original.

## Limitaciones y advertencias

- Las 16 ranuras de salida son no ordenadas y no corresponden a clases semánticas; no debe asumirse que una ranura concreta represente una fuente específica.
- El modelo opera únicamente a 8 kHz y sobre crops de 4 segundos; no se documenta soporte para otras frecuencias de muestreo ni ventanas mayores.
- La selección de checkpoint se basó en MixIT de validación, no en SI-SDRi ni en test; el rendimiento en test puede no reflejar el mejor checkpoint posible según la métrica de separación.
- El intervalo de confianza del SI-SDRi de test describe incertidumbre entre escenas para una sola semilla, no entre semillas de entrenamiento.
- La evaluación de test usa solo 256 escenas de los shards 8–11, no el split completo; los resultados pueden no generalizar al conjunto completo.
- La consistencia exacta de mezcla no garantiza una separación correcta de las fuentes; MixIT mide reconstrucción de las mezclas de referencia, no recuperación de fuentes.
- El modelo se entrenó sobre FUSS reverberante, por lo que su comportamiento fuera de esa distribución (otras reverberaciones, ruidos o frecuencias) no está caracterizado.
- La licencia `public-access-no-weight-license-grant` es una licencia `other` que, según su nombre, no concede derechos de uso sobre los pesos; debe revisarse `LICENSE-WEIGHTS.md` antes de cualquier uso comercial o de redistribución.
- No se documentan sesgos específicos, pero al ser un modelo de audio entrenado sobre un dataset concreto, puede heredar sesgos de composición del mismo.
- Riesgo de alucinación en el sentido de generar separaciones plausibles pero incorrectas: la asignación dura y la consistencia de mezcla pueden producir salidas que reconstruyen la mezcla sin separar realmente las fuentes.
- No se garantiza igualdad bit a bit entre hardware o versiones de PyTorch distintas.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed2
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m16-plain-seed2/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS parquet: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
