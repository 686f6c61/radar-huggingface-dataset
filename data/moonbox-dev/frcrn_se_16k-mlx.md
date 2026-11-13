# moonbox-dev/FRCRN_SE_16K-MLX

## Resumen

FRCRN_SE_16K-MLX es una conversión a MLX del modelo FRCRN_SE_16K desarrollado originalmente por Alibaba (repositorio `alibabasglab/FRCRN_SE_16K`) para mejora de voz (speech enhancement) y eliminación de ruido en audio de 16 kHz. La conversión la firma `moonbox-dev` y está pensada específicamente para ejecutarse en Macs con Apple Silicon mediante el framework MLX de Apple, no para GPUs NVIDIA ni para despliegues en servidor convencionales.

El modelo resuelve un problema acotado pero crítico en pipelines de audio: limpiar grabaciones de voz ruidosas antes de pasarlas a un ASR, a un sistema de diarización o a un motor de transcripción. La arquitectura subyacente es una red de dos UNets con valores complejos, memoria FSMN y capas de squeeze-excitation que operan sobre una STFT de 640 puntos. No es un modelo de lenguaje: no genera texto, no razona y no tiene contexto conversacional.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de mejora de voz de calidad en hardware de consumo Apple sin dependencias de CUDA. Por otro, la model card es inusualmente honesta: documenta qué precisiones son fieles al original y cuáles son experimentales y degradan la señal de forma medible, algo que conviene tener muy en cuenta antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos UNets de valores complejos con memoria FSMN y squeeze-excitation sobre STFT de 640 puntos |
| Parametros totales | no disponible (el repo ocupa 0.2 GB; los pesos fp32 suman 56.0 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio de 16 kHz; no hay ventana de contexto de texto) |
| Tipos de cuantizacion | bf16, fp16, fp32, 8bit, 6bit, 4bit |
| Idiomas soportados | no disponible (procesamiento de señal de voz, independiente del idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con `config.json` y `mlx_model.py` por carpeta de precisión |

## Arquitectura y entrenamiento

El modelo original FRCRN (Frequency-Recurrent Convolutional Recurrent Network) es una red de mejora de voz que trabaja en el dominio tiempo-frecuencia. Concretamente, esta variante de 16 kHz emplea dos UNets con valores complejos, memoria FSMN (Feedforward Sequential Memory Networks) y capas de squeeze-excitation, aplicadas sobre una STFT de 640 puntos. La salida es una máscara espectral compleja que, aplicada a la señal de entrada, produce el audio limpio. El pipeline completo proviene del repositorio ClearerVoice-Studio de Alibaba; esta conversión solo reimplementa la parte del modelo en MLX.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o muestras, ni sobre si hubo ajuste fino con RLHF o DPO (no aplica en un modelo de audio). La conversión de `moonbox-dev` no reentrena: solo traduce los pesos a MLX y valida la fidelidad numérica frente al original PyTorch. Esa validación es el dato técnico más relevante de la ficha: fp32 reproduce exactamente al original (SI-SDR 10.30 dB y DNSMOS 3.19 idénticos), mientras que bf16, fp16, 8bit, 6bit y 4bit quedan marcados como "below threshold (experimental)" por el propio autor, con degradaciones medibles que se detallan en la sección de benchmarks.

## Capacidades

- Mejora de voz y eliminación de ruido en audio de 16 kHz (audio-to-audio), con salida de señal limpia.
- Procesamiento de señal independiente del idioma: no transcribe ni traduce, solo limpia la señal.
- Funciona sobre grabaciones mono a 16 kHz; para otras frecuencias de muestreo requiere remuestreo previo con `librosa`.
- Ejecución nativa en Apple Silicon vía MLX, sin CUDA.
- Seis precisiones empaquetadas en carpetas independientes, cada una con sus propios `model.safetensors`, `config.json` y `mlx_model.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada distinto de voz ni modo thinking. No es un modelo generativo de texto.

## Casos de uso

- Preprocesado para ASR en local: limpiar la señal antes de pasarla a Whisper u otro motor de transcripción reduce errores en entornos ruidosos; encaja en Macs con Apple Silicon donde no hay GPU NVIDIA disponible.
- Limpieza de grabaciones de reuniones y entrevistas: el modelo atenúa ruido de fondo antes de archivarlas o transcribirlas, con un coste de memoria mínimo (26-56 MB de pesos).
- Pipelines de voz en aplicaciones macOS: integrar el modelo en una app nativa de Apple Silicon para llamadas o notas de voz, aprovechando MLX y evitando dependencias de CUDA.
- Preparación de datasets de audio: normalizar y limpiar corpus de voz antes de usarlos para entrenar o evaluar otros modelos de reconocimiento de habla.
- Prototipado e investigación en mejora de voz: la versión fp32 reproduce al original con precisión numérica (SI-SDR 10.30 dB, DNSMOS 3.19), lo que la hace válida para comparar resultados frente a la implementación PyTorch de referencia.
- Filtrado de audio para podcasts o contenido grabado en condiciones deficientes, siempre que se use fp32 o se acepten las limitaciones de las precisiones reducidas.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las métricas de fidelidad de cada conversión frente al modelo original PyTorch. No hay benchmarks estándar de mejora de voz (PESQ, STOI, etc.) más allá de SI-SDR y DNSMOS.

| Precision | SI-SDR (dB) | DNSMOS | Diferencia vs original | Estado |
|---|---|---|---|---|
| fp32 | 10.30 | 3.19 | Idéntico (original: 10.30 / 3.19); salida vs original 89.3 dB media, 79.2 dB peor clip | Fiel |
| fp16 | 10.31 (media), 0.6-1.2 dB peor en dos clips | 3.16 | Salida vs original 25.2 / 8.2 dB | Experimental |
| bf16 | 9.66 | 3.06 | Salida vs original 16.9 / 2.9 dB | Experimental |
| 8bit | 9.88 | 3.07 | Salida vs original 18.0 / 4.1 dB | Experimental |
| 6bit | 10.18 | 3.04 | Salida vs original 13.8 / 3.0 dB | Experimental |
| 4bit | 4.92 | 2.25 | Salida vs original 4.7 / -1.3 dB | Experimental, degradación severa |

## Requisitos de hardware

- VRAM: no aplica; MLX usa memoria unificada en Apple Silicon. Los pesos ocupan entre 26.6 MB (4bit) y 56.0 MB (fp32), por lo que el consumo es mínimo.
- GPU recomendadas: cualquier Mac con chip de la serie M (M1, M2, M3, M4) y memoria unificada suficiente para el sistema operativo y el resto del pipeline.
- Cabe en cualquier Mac moderno con Apple Silicon; no está pensado para GPUs NVIDIA ni para entornos CUDA.
- Opciones de despliegue: MLX directamente (requiere `mlx`, `numpy`, `soundfile` y, para remuestreo, `librosa`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de precisión: el autor recomienda `MLX_ENABLE_TF32=0` para forzar matmuls en float32; con TF32 activado los resultados pueden diferir.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | Licencia | Plataforma | Fidelidad vs original |
|---|---|---|---|---|---|
| FRCRN_SE_16K-MLX (este) | Conversión MLX de FRCRN | 16 kHz | Apache-2.0 | Apple Silicon (MLX) | fp32 fiel; resto experimental |
| alibabasglab/FRCRN_SE_16K | FRCRN original en PyTorch | 16 kHz | no disponible en la información | PyTorch (CPU/GPU) | Referencia |
| ClearerVoice-Studio (Alibaba) | Suite de mejora de voz | no disponible | no disponible en la información | PyTorch | Pipeline completo del que procede este modelo |

No se dispone de datos de benchmarks comparativos con otros modelos de mejora de voz en la información proporcionada.

## Limitaciones y advertencias

- Solo fp32 reproduce fielmente al modelo original. bf16, fp16, 8bit, 6bit y 4bit están marcados por el propio autor como experimentales y por debajo del umbral de calidad; 4bit degrada la señal de forma severa (SI-SDR 4.92 dB frente a 10.30 dB).
- El modelo solo procesa audio de 16 kHz; otras frecuencias requieren remuestreo previo.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es un error de categoría.
- Solo funciona en Apple Silicon con MLX; no es desplegable en GPUs NVIDIA ni en servidores x86 convencionales sin reescribir la integración.
- Licencia Apache-2.0, permisiva para uso comercial, pero conviene verificar la licencia del modelo base original, que no se detalla en la información disponible.
- No hay información sobre sesgos, riesgo de alucinación (no aplica en el sentido generativo) ni comportamiento en idiomas o acentos concretos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria independiente.
- Dependencia de la implementación `mlx_model.py` incluida en el repo; cambios en la API de MLX podrían romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/FRCRN_SE_16K-MLX
- Modelo base original: https://huggingface.co/alibabasglab/FRCRN_SE_16K
- ClearerVoice-Studio (Alibaba): no disponible en la información proporcionada
- Paper de FRCRN: no disponible en la información proporcionada
- Repositorio MLX: no disponible en la información proporcionada
