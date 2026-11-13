# sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context8s-ft8k-seed2

## Resumen

MixIT-FUSS-TF-Locoformer m8 sparse16 context8s seed2 es un modelo de separación de fuentes de audio (source separation) desarrollado por el usuario sammyliu y publicado en Hugging Face. Se trata de un fine-tune del modelo base `sammyliu/mixit-fuss-tflocoformer-m8-plain-seed2`, entrenado con el algoritmo MixIT sobre mezclas reverberantes del dataset FUSS sin disponer de fuentes aisladas como objetivo de entrenamiento. El modelo opera a 8 kHz en modo offline (no causal) y produce 8 ranuras de salida no ordenadas.

La arquitectura es un TF-Locoformer compacto con 3 bloques dual-path, 64 canales, 4 cabezas de atención y FFN de 128 dimensiones. Con solo 1.293.568 parámetros, es un modelo extremadamente ligero orientado a investigación y experimentación con recetas de separación de fuentes, no a producción a gran escala.

Este release contiene un fine-tune disperso completado de 8.000 actualizaciones, con los cinco mejores checkpoints seleccionados mediante SI-SDRi de fuentes en el conjunto de desarrollo. La relevancia actual reside en su enfoque metodológico: demuestra un protocolo de selección de checkpoints informado por fuentes cuando el entrenamiento en sí no usa etiquetas de fuente, y publica intervalos de confianza bootstrap y advertencias explícitas sobre la reutilización de datos de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-Locoformer compacto (transformer con bloques dual-path), 3 bloques dual-path |
| Parametros totales | 1.293.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 8 segundos (64.000 muestras a 8 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma; el modelo procesa audio, no texto) |
| Licencia | public-access-no-weight-license-grant (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un TF-Locoformer compacto con 8 ranuras de salida, 3 bloques dual-path, 64 canales, 4 cabezas de atención, FFN de 128 dimensiones, kernel de convolución 4 y 4 grupos de normalización RMS. La representación se obtiene mediante STFT con FFT de 256, hop de 128, ventana Hann y padding constante centrado. El backbone se entrena en BF16, mientras que STFT, síntesis, asignación y objetivo se calculan en FP32 (TF32 permitido).

El entrenamiento sigue una receta de dos etapas. Primero, el modelo padre se entrena durante 60.000 actualizaciones y se selecciona su checkpoint de validación-MixIT en la actualización 58.000. Después, se cargan esos pesos, se reinician el optimizador AdamW y el sampler, y se ejecutan 8.000 actualizaciones de fine-tune disperso con coeficiente de dispersión 16 (frente a 0 en el padre) y tasa de aprendizaje constante de 0.0001. Los datos son escenas reverberantes de FUSS (20.000 de entrenamiento y 1.000 de desarrollo, revisión `b183027b802d1a488dea8b6f1d80daa32b76b681`), con muestreo de dos escenas distintas, recortes independientes uniformes de 8 segundos (grabación completa de 10 s), escalado por rama dividiendo por RMS (suelo 1e-8) y suma sin normalización posterior. Cada escena observada contiene entre 1 y 4 fuentes, y la mezcla de mezclas puede contener hasta 8. El lote es de 16 pares por actualización, audio mono a 8.000 Hz y 64.000 muestras.

## Capacidades

- Separación de fuentes de audio en 8 ranuras de salida no ordenadas (no son clases semánticas).
- Funcionamiento offline y no causal sobre ventanas de 8 segundos.
- Procesamiento de mezclas reverberantes con hasta 8 fuentes combinadas.
- Coherencia de mezcla exacta: el wrapper normaliza por RMS internamente, restaura la amplitud tras la síntesis y aplica consistencia de residuo igual distribuyendo `mixture - sum(outputs)`.
- Entrenamiento MixIT sin fuentes aisladas como objetivo.
- No dispone de tool calling, agentes, capacidades multilingües de texto ni modos de razonamiento; es un modelo puramente de audio.

## Casos de uso

- Investigación en separación de fuentes sin supervisión: sirve como referencia reproducible para estudiar MixIT sobre mezclas reverberantes, con receta y checkpoints publicados.
- Evaluación de protocolos de selección de checkpoints: permite analizar cómo la selección informada por SI-SDRi de fuentes difiere del ranking MixIT original.
- Prototipado de pipelines de separación en entornos con recursos muy limitados: sus 1,29 M de parámetros permiten experimentar en una sola GPU o incluso en CPU para pruebas.
- Análisis de dispersión en representaciones de audio: el coeficiente de dispersión 16 del fine-tune permite estudiar su efecto sobre la recuperación de fuentes.
- Reproducción de experimentos académicos: la receta detallada (optimizador, LR, precisión, determinismo con CUBLAS_WORKSPACE_CONFIG=:4096:8) facilita la replicación.
- Estudio de intervalos de confianza en métricas de separación: los intervalos bootstrap por escena publicados sirven como ejemplo metodológico para reportar incertidumbre.
- Base para fine-tunes posteriores: al ser un modelo pequeño y con checkpoints intermedios publicados, puede servir de punto de partida para otras recetas.

## Benchmarks y rendimiento

| Medicion | Valor (dB) |
|---|---|
| MixIT en señal de entrenamiento (media de 20 minibatches registrados) | 13,6542 |
| MixIT en conjunto de entrenamiento (64 pares fijos de evaluación) | 12,4315 |
| MixIT en desarrollo holdout (64 pares fijos de evaluación) | 12,3946 |
| SI-SDRi de fuentes en desarrollo holdout (653 escenas multi-fuente) | 8,7694 |
| Intervalo bootstrap 95% por escena para SI-SDRi de fuentes | [8,2281; 9,3632] |

Checkpoint seleccionado: actualización 7.000 de fine-tune. En la actualización final 8.000 (evaluación común de cuatro segundos): MixIT en señal de entrenamiento 13,7095 dB, MixIT holdout 12,4713 dB y SI-SDRi de fuentes holdout 8,1783 dB.

Ranking de checkpoints por SI-SDRi de fuentes en desarrollo: actualización 7.000 (8,7694 dB), 4.000 (8,7371 dB), 3.000 (8,6312 dB), 2.000 (8,3951 dB), 5.000 (8,2526 dB).

Pesos finales (`final.safetensors`) con entrada y puntuación de 8 segundos: MixIT de entrenamiento 13,7095 dB, MixIT holdout 12,7712 dB, SI-SDRi uno a uno de fuentes 10,0744 dB, intervalo bootstrap 95% por escena [9,5290; 10,5474] dB, SI-SDR absoluto de fuentes 4,1193 dB, 726 escenas multi-fuente activas de 1.000. El autor advierte que estas cifras no son comparables como ganancia sobre el protocolo de selección de cuatro segundos.

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,29 M de parámetros, el modelo cabe holgadamente en cualquier GPU consumer (incluso <1 GB de VRAM para pesos en FP32).
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizó en una NVIDIA A100 80GB por ajuste, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente, e incluso en CPU para pruebas.
- Opciones de despliegue: PyTorch 2.7.1 con CUDA 12.6 (entorno de entrenamiento documentado); no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (separación de fuentes con MixIT y TF-Locoformer) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se realizó evaluación en un conjunto de test independiente para este fine-tune; las puntuaciones de desarrollo no deben presentarse como rendimiento de test insesgado.
- Los intervalos bootstrap cubren variación entre escenas, pero no variación entre semillas ni la selección sobre la misma cohorte de desarrollo.
- Las ranuras de salida son no ordenadas y no corresponden a clases semánticas; no hay garantía de que una ranura concreta corresponda siempre a una fuente concreta.
- La consistencia de mezcla exacta y las puntuaciones MixIT altas no garantizan la recuperación de fuentes individuales.
- Las mediciones con ventana de 8 segundos pertenecen a `final.safetensors`, no a `model.safetensors`, y no son comparables con el protocolo de selección de 4 segundos.
- El modelo opera únicamente a 8 kHz, lo que limita su uso en aplicaciones de audio de banda ancha.
- Solo se declara el idioma inglés en los metadatos; el modelo procesa audio, no texto.
- Licencia `public-access-no-weight-license-grant` (otra): es necesario revisar el archivo LICENSE-WEIGHTS.md antes de cualquier uso, incluido el comercial; no se garantiza permiso de uso comercial.
- Riesgo de alucinación no aplicable en el sentido de texto, pero sí existe riesgo de artefactos o separaciones incorrectas en escenas fuera de la distribución de FUSS.
- Sesgos conocidos: no documentados en la información disponible; el dataset FUSS condiciona el dominio acústico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context8s-ft8k-seed2
- Modelo base (padre): https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-plain-seed2/tree/bd5ba96b56665a01bb8299aa7d40b6d13976933e
- Licencia de pesos: https://huggingface.co/sammyliu/mixit-fuss-tflocoformer-m8-sparse16-context8s-ft8k-seed2/blob/main/LICENSE-WEIGHTS.md
- Dataset FUSS: https://huggingface.co/datasets/scaleinvariant/fuss-parquet
- Paper MixIT (arXiv:2006.12701): https://arxiv.org/abs/2006.12701
- Paper TF-Locoformer (arXiv:2106.00847): https://arxiv.org/abs/2106.00847
