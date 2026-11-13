# moonbox-dev/MossFormer2_SE_48K-MLX

## Resumen

MossFormer2_SE_48K-MLX es una conversión a MLX del modelo MossFormer2_SE_48K de Alibaba, un sistema de mejora de voz (speech enhancement) que elimina ruido de grabaciones de habla a 48 kHz. Lo desarrolla moonbox-dev, un proyecto que adapta modelos de audio a Apple Silicon, y se distribuye como un conjunto de carpetas con distintos niveles de precisión (bf16, fp16, 8bit, 6bit y 4bit) para su uso con el framework MLX de Apple.

El modelo resuelve un problema concreto: limpiar señal de voz ruidosa manteniendo la fidelidad de la señal original. No es un modelo generativo de texto ni un LLM, sino una red de mejora de audio de tipo audio-to-audio. Su relevancia radica en que permite ejecutar localmente en Macs con chip Apple Silicon una tarea de procesado de audio que normalmente requiere PyTorch y hardware más pesado, con una degradación mínima respecto al modelo original.

La conversión incluye correcciones técnicas sobre el cargador nativo de mlx-audio 0.6.5, que según el autor producía desviaciones de hasta 18 dB respecto al original. El modelo base es alibabasglab/MossFormer2_SE_48K, parte de ClearerVoice-Studio, y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossFormer2 (red de mejora de voz, audio-to-audio) |
| Parametros totales | no disponible (pesos de 110,7 MB en bf16/fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | bf16, fp16, 8bit, 6bit, 4bit (MLX affine, group size 64) |
| Idiomas soportados | no disponible (procesado de voz independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

MossFormer2 es una arquitectura de mejora de voz basada en atención y convoluciones, diseñada para separar habla de ruido en señales de 48 kHz. La conversión a MLX cuantiza todas las capas lineales (afinado MLX con group size 64), mientras que las convoluciones y las capas de normalización se mantienen en bf16. El runtime incluido (`mlx_model.py`, 6,9 kB) replica el comportamiento del modelo PyTorch original.

La innovación técnica principal de esta conversión es la corrección de dos fallos del cargador nativo de mlx-audio 0.6.5: el uso de embeddings rotatorios sobre las dos mitades de cada vector en lugar de pares intercalados (como hace `rotary_embedding_torch` en el original), y un filtro Kaldi que dejaba sin pre-énfasis la primera muestra de cada frame. El runtime calcula las características exactamente como `torchaudio.compliance.kaldi.fbank`, con dither de 1.0 por defecto. No se dispone de información sobre el dataset de entrenamiento original ni sobre el uso de RLHF/DPO, al tratarse de una conversión y no de un modelo entrenado desde cero.

## Capacidades

- Mejora de voz (speech enhancement) a 48 kHz: elimina ruido de fondo de grabaciones de habla.
- Denoising de audio manteniendo la señal de voz original.
- Procesado audio-to-audio determinista (con `dither=0.0`).
- Entrada y salida en float32 a 48 kHz; admite entrada de otras frecuencias mediante `librosa`.
- Ejecución local en Apple Silicon mediante MLX.
- Múltiples precisiones para equilibrar calidad y tamaño (bf16, fp16, 8bit, 6bit, 4bit).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües de texto: es un modelo especializado exclusivamente en audio.

## Casos de uso

- Limpieza de grabaciones de voz para podcasts o entrevistas: el modelo procesa audio a 48 kHz y elimina ruido de fondo, adecuado para material grabado en entornos no controlados.
- Preprocesado para sistemas de reconocimiento de voz (ASR): mejorar la señal antes de pasarla a un transcriptor reduce errores en condiciones ruidosas.
- Restauración de archivos de audio históricos o de baja calidad: el modelo puede aplicarse a grabaciones con ruido constante para recuperar inteligibilidad.
- Videollamadas y reuniones: integrable en pipelines locales en Mac para limpiar el audio del micrófono antes de transmitirlo.
- Producción de contenido en Apple Silicon: al ejecutarse con MLX, permite procesar lotes de audio localmente sin depender de servicios en la nube.
- Investigación en procesado de audio: sirve como referencia para comparar implementaciones MLX frente a PyTorch en tareas de mejora de voz.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad respecto al modelo PyTorch original sobre 8 clips ruidosos de 48 kHz (LibriSpeech):

| Precision | SI-SDR (dB) | DNSMOS | Diferencia vs original (media / peor clip) |
|---|---|---|---|
| Original (PyTorch) | 11,34 | 3,09 | referencia |
| fp16 | 11,34 | 3,09 | 52,2 / 41,8 dB |
| bf16 | 11,30 | 3,08 | 45,6 / 35,5 dB |
| 8bit | 11,30 | 3,08 | 43,5 / 33,3 dB |
| 6bit | 11,39 | 3,08 | 39,9 / 26,2 dB |
| 4bit (experimental) | 11,43 (media; 0,7-0,8 dB peor en dos clips) | 3,06 | 27,6 / 13,6 dB |

No se han publicado resultados de benchmarks comparativos con otros modelos de mejora de voz en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan entre 45,1 MB (4bit) y 110,7 MB (bf16/fp16); el consumo total es muy bajo y cabe holgadamente en cualquier Mac con Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon (M1 o superior) con soporte MLX; no requiere GPU dedicada.
- Cabe en GPU consumer: sí, en todas las configuraciones de Apple Silicon; no está pensado para GPUs NVIDIA.
- Opciones de despliegue: MLX con `mlx-audio==0.6.5`, `mlx`, `numpy`, `soundfile` y `librosa` (para entradas que no sean de 48 kHz).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MossFormer2_SE_48K-MLX | no disponible (110,7 MB bf16) | no aplica (audio) | SI-SDR 11,30-11,39 dB, DNSMOS 3,06-3,08 | Apache 2.0 | Hugging Face (MLX) |
| MossFormer2_SE_48K (original) | no disponible | no aplica (audio) | SI-SDR 11,34 dB, DNSMOS 3,09 | Apache 2.0 | Hugging Face (PyTorch) |
| Alternativas de mejora de voz | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de mejora de voz en la información proporcionada.

## Limitaciones y advertencias

- La versión 4bit está marcada como experimental: la media de SI-SDR es buena pero dos clips empeoran 0,7-0,8 dB y la desviación respecto al original es de solo 13,6 dB en el peor caso.
- El cargador nativo de mlx-audio 0.6.5 no es fiable para estos pesos; es necesario usar el `mlx_model.py` incluido en cada carpeta.
- Es un modelo especializado en audio: no genera texto, no razona y no soporta tool calling ni agentes.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento con idiomas o acentos concretos.
- Riesgo de artefactos o distorsión en señales con ruido no estacionario o niveles muy bajos de relación señal-ruido; no cuantificado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Depende del ecosistema MLX y Apple Silicon; no es portable a otros backends sin conversión adicional.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/MossFormer2_SE_48K-MLX
- Modelo base: https://huggingface.co/alibabasglab/MossFormer2_SE_48K
- ClearerVoice-Studio (proyecto del modelo original): no disponible en la información proporcionada
- Repositorio mlx-audio: no disponible en la información proporcionada
