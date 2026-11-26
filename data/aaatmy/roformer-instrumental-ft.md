# aaatmy/roformer-instrumental-ft

## Resumen

Roformer Instrumental FT es un par de modelos de separación de fuentes de audio (vocal/instrumental) afinados por el usuario aaatmy a partir de dos arquitecturas Roformer ya existentes: BS-Roformer (edición viperx, `model_bs_roformer_ep_317_sdr_12.9755`) y Mel-Band-Roformer (edición de KimberleyJensen). El objetivo concreto es obtener una pista instrumental limpia —tipo karaoke— a partir de una mezcla completa, mejorando especialmente la reducción de sangrado vocal (vocal bleed) respecto a los modelos base. Ambos se distribuyen exclusivamente en formato ONNX, en FP32 y FP16, con un script de inferencia que realiza la STFT/ISTFT fuera del grafo.

El modelo predice el stem vocal y el instrumental se obtiene por resta (`mixture − vocals`). La pérdida de entrenamiento se calcula sobre el vocal, lo que equivale al error del instrumental para estos objetivos. El fine-tuning se hizo sobre unas 190 canciones publicadas con su instrumental oficial (principalmente pop japonés y música vocal-synth), 11,5 horas en total, con un pipeline de alineación temporal, ajuste de función de transferencia por frecuencia y filtrado de calidad que descartó más de la mitad de los pares candidatos.

Es relevante para pipelines de karaoke, remezcla y producción musical que necesiten ejecución portable: al estar en ONNX, se puede desplegar con ONNX Runtime (CPU o CUDA) sin dependencia de PyTorch, y la variante FP16 reduce el peso a 324 MB (BS-Roformer) y 460 MB (Mel-Roformer), con velocidades de 19–35 s por canción de 157 s en una RTX 5060 Ti. La licencia es "other" con nombre `see-base-models`, lo que obliga a revisar las condiciones de los modelos base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Roformer (transformer con atención para separación de fuentes); dos variantes: BS-Roformer y Mel-Band-Roformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa fragmentos fijos de 8 s (352.800 muestras a 44,1 kHz → 801 frames) con batch dinámico |
| Tipos de cuantizacion | FP32 y FP16 (FP16 con RMSNorm en FP32; entrada y salida en float32) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | other, `see-base-models` (sujeta a las licencias de los modelos base) |
| Formato de pesos | ONNX (`bs_roformer_inst_ft.onnx`, `bs_roformer_inst_ft_fp16.onnx`, `mel_roformer_inst_ft.onnx`, `mel_roformer_inst_ft_fp16.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es Roformer aplicada a espectrogramas: la red recibe una STFT estéreo con frecuencia y canal intercalados (`(freq, channel)`) y devuelve una máscara sobre el espectrograma vocal. La STFT y la ISTFT no están dentro del grafo ONNX; el script `infer_onnx.py` las ejecuta en NumPy con `n_fft=2048`, `hop=441`, ventana Hann periódica de 2048 y `center=True` con padding reflectivo, igual que `torch.stft`. El chunk es de 8 s (801 frames) y el tamaño de batch es dinámico. Para audio largo se trocea con 50 % de solape y crossfade lineal de 1/10 de chunk, con padding reflectivo en los bordes, siguiendo el esquema `demix` de Music-Source-Separation-Training de ZFTurbo.

El fine-tuning se hizo con ZFTurbo Music-Source-Separation-Training, manteniendo la cabeza base y el objetivo vocal, con chunks de 8 s y batch 2 por GPU en 2 GPUs con acumulación de gradiente 2 (BS-Roformer; el dato de Mel-Roformer queda truncado en la información disponible). Los datos son unas 190 canciones con instrumental oficial (11,5 h), donde el target vocal se obtiene por resta (`vocals = mixture − instrumental`). El pipeline de alineación incluye correlación cruzada a 4 kHz, refinado a tasa completa, ajuste de función de transferencia H(f) por frecuencia (STFT 4096) para absorber diferencias de EQ/masterización y ganancia de banda ancha por bloques de 0,5 s con mediana y límite 0,5–2×. Solo 203 de 427 pares candidatos pasaron el filtro de calidad (SDR ≥ 4 dB frente a un modelo vocal preentrenado, residuo ≤ −10 dB en pasajes sin voz, deriva ≤ 4 muestras y solape ≥ 80 %); 16 se reservaron para validación y 187 se usaron para entrenamiento.

## Capacidades

- Separación de dos stems: genera pista vocal y pista instrumental (karaoke) a partir de una mezcla estéreo.
- Predicción del stem vocal con instrumental por resta (`mixture − vocals`), lo que garantiza consistencia entre ambas salidas.
- Entrada mono o estéreo (el mono se duplica a estéreo); requiere 44,1 kHz.
- Procesado de audio largo mediante troceado con solape y crossfade.
- Ejecución en CPU y GPU vía ONNX Runtime, sin dependencia de PyTorch.
- Dos variantes con compromiso calidad/velocidad: BS-Roformer (mayor SDR) y Mel-Roformer (aproximadamente el doble de rápida).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente audio-a-audio.

## Casos de uso

- Generación de pistas de karaoke: a partir de una canción completa, el modelo produce `song_instrumental.wav` con menos sangrado vocal que los modelos base, adecuado para uso doméstico o pubs.
- Remezcla y edición musical: obtener el stem instrumental para superponer una nueva voz o samples sin arrastrar restos de la voz original, gracias a la mejora de "bleedless" (+8 a +9 puntos).
- Producción de covers y versiones: usar el instrumental limpio como base para grabar una nueva interpretación vocal manteniendo la instrumentación original.
- Limpieza de archivos para DJ sets: separar voces e instrumentales de temas sin versión off-vocal oficial, con procesado por lotes en GPU (35 s por canción de 157 s en FP16 con BS-Roformer).
- Investigación en separación de fuentes: servir de referencia reproducible en ONNX para comparar fine-tunes sobre BS-Roformer y Mel-Band-Roformer con métricas SDR/SI-SDR documentadas.
- Despliegue en entornos sin PyTorch: integrar la separación en aplicaciones de escritorio o servicios con ONNX Runtime, incluyendo CPU cuando no hay GPU disponible.
- Preprocesado para transcripción o análisis musical: aislar el instrumental para análisis armónico o el vocal para transcripción, reduciendo la interferencia entre stems.

## Benchmarks y rendimiento

Conjunto de validación: 16 canciones reservadas del entrenamiento, métricas sobre `mixture − vocals` frente al instrumental de referencia, media sobre las 16 canciones. Mayor es mejor.

| Modelo | Inst. SDR | Inst. SI-SDR | Bleedless | Fullness |
|---|---|---|---|---|
| BS-Roformer (base) | 12,93 | 12,78 | 26,2 | 25,7 |
| BS-Roformer (este fine-tune) | 13,37 | 13,17 | 35,0 | 21,6 |
| Mel-Roformer (base) | 12,56 | 12,38 | 26,6 | 25,6 |
| Mel-Roformer (este fine-tune) | 13,22 | 12,99 | 33,8 | 22,2 |

Comprobación de la exportación ONNX (ONNX Runtime CUDA, canciones completas):

| Modelo | Diferencia PyTorch vs ONNX FP32 | SDR instrumental canción A: PyTorch / FP32 / FP16 | SDR instrumental canción B: FP32 / FP16 |
|---|---|---|---|
| BS-Roformer | −78,6 dB | 13,548 / 13,546 / 13,558 | 13,582 / 13,582 |
| Mel-Roformer | −75,9 dB | 9,724 / 9,724 / 9,724 | 15,162 / 15,175 |

Notas del autor: el SDR instrumental mejora en 14 de 16 canciones en cada modelo; la mayor ganancia es la reducción de sangrado vocal, mientras que "fullness" cae unas 3,5–4 unidades, por lo que el instrumental puede sonar algo más delgado. La diferencia entre ambos fine-tunes (0,16 dB) no es significativa con 16 canciones. Las referencias de validación se obtienen por resta, así que los valores absolutos son inferiores a los de benchmarks con multitrack limpio.

## Requisitos de hardware

- VRAM: el autor indica que FP32 con batch 2 necesita más de 16 GB de VRAM; con batch 1 (por defecto) FP32 cabe en GPUs de 16 GB. FP16 con batch 2 es la configuración recomendada en GPU.
- GPU recomendadas: RTX 5060 Ti 16 GB es la referencia medida por el autor; cualquier GPU con soporte CUDA y al menos 16 GB es suficiente para las configuraciones documentadas. No se aportan datos para A100, H100 o RTX 4090.
- GPU de consumo: sí, cabe en GPUs de consumo de 16 GB (por ejemplo RTX 5060 Ti 16 GB) con batch 1 en FP32 o batch 2 en FP16.
- Despliegue: ONNX Runtime con `onnxruntime-gpu[cuda,cudnn]` o `onnxruntime` para CPU; script `infer_onnx.py` incluido. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Velocidad medida en RTX 5060 Ti 16 GB para una canción de 157 s: BS-Roformer 58 s (FP32) / 35 s (FP16); Mel-Roformer 29 s (FP32) / 19 s (FP16). No se proporcionan cifras de throughput agregado ni latencia por chunk.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | SDR instrumental (validación del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BS-Roformer instrumental FT (este) | no disponible | 8 s por chunk | 13,37 | other (`see-base-models`) | ONNX FP32/FP16 en Hugging Face |
| Mel-Roformer instrumental FT (este) | no disponible | 8 s por chunk | 13,22 | other (`see-base-models`) | ONNX FP32/FP16 en Hugging Face |
| BS-Roformer base (viperx) | no disponible | no disponible | 12,93 | no disponible | modelo base referenciado |
| Mel-Band-Roformer base (KimberleyJensen) | no disponible | no disponible | 12,56 | no disponible | modelo base referenciado |

No se dispone de datos de otros separadores (Demucs, MDX, Spleeter) en la información proporcionada, por lo que la comparación se limita a los modelos base de los que parten estos fine-tunes.

## Limitaciones y advertencias

- El instrumental puede sonar más delgado que con los modelos base: "fullness" cae unas 3,5–4 unidades a cambio de menos sangrado vocal. El autor recomienda escuchar antes de elegir.
- Los datos de entrenamiento son limitados (187 canciones, 11,5 h, principalmente pop japonés y vocal-synth), lo que puede introducir sesgo hacia esos géneros y mermar el rendimiento en otros estilos.
- Las métricas de validación usan referencias obtenidas por resta, no multitracks limpios; los valores absolutos no son comparables con benchmarks estándar.
- La diferencia entre los dos fine-tunes (0,16 dB) no es significativa con solo 16 canciones de validación.
- Requiere entrada a 44,1 kHz; otras frecuencias de muestreo no están soportadas según la documentación.
- Licencia "other" con nombre `see-base-models`: es imprescindible revisar las condiciones de los modelos base (BS-Roformer viperx y Mel-Band-Roformer de KimberleyJensen) antes de uso comercial; la model card no detalla restricciones concretas.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo de audio, la calidad depende de la mezcla, el mastering y la presencia de efectos (reverb, delays) en la voz.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente por parte de la comunidad.
- El grafo ONNX no incluye STFT/ISTFT: un uso incorrecto del pre/postprocesado (ventana, padding, solape) degradará la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaatmy/roformer-instrumental-ft
- Modelo base BS-Roformer (viperx edition, `model_bs_roformer_ep_317_sdr_12.9755`): referencia en la model card, sin URL directa disponible
- Modelo base Mel-Band-Roformer (KimberleyJensen): https://huggingface.co/KimberleyJSN/melbandroformer
- Framework de entrenamiento ZFTurbo Music-Source-Separation-Training: referencia en la model card, sin URL directa disponible
- No se han encontrado papers, blogs, repos adicionales ni demos en la información proporcionada.
