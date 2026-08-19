# Gautam0901/chola-compressor

## Resumen

Chola-Compressor es un modelo compacto de restauración de voz (1,93 millones de parámetros) desarrollado por Gautam0901 para recuperar la calidad del habla degradada por el códec Codec2 a 1200 bps, el modo utilizado en enlaces de voz por radio LoRa fuera de la red. El modelo se sitúa después de la decodificación Codec2 en el extremo receptor y aplica una máscara de magnitud sobre el espectrograma STFT para mitigar los artefactos de compresión. Está diseñado para ejecutarse en tiempo real en hardware de borde tipo Jetson, no en la nube.

La relevancia actual del modelo radica en su aplicación a comunicaciones de voz off-grid, donde el ancho de banda es extremadamente limitado y la calidad del habla se ve seriamente comprometida. El autor lo presenta como una demostración de investigación y portafolio, no como una solución validada para comunicaciones de emergencia. El checkpoint publicado se entrenó de forma supervisada directamente contra habla limpia real, sin el término de destilación del teacher (Denoiser de Meta), ya que la ablación mostró que ese término no aportaba beneficio medible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de 3 niveles sobre espectrogramas de magnitud STFT (n_fft=512, hop=128, 16 kHz) |
| Parametros totales | 1,93 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por tramos, sin ventana fija especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con VCTK, corpus en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint .pt, no safetensors) |

## Arquitectura y entrenamiento

El modelo es un U-Net de tres niveles que opera sobre la magnitud del espectrograma STFT. El encoder utiliza tres bloques convolucionales con canales 32→64→128 y max-pooling; el bottleneck tiene 256 canales; el decoder emplea tres bloques con convoluciones transpuestas y conexiones skip. La salida predice una máscara en el rango [0,1] que se multiplica por la magnitud de entrada, en lugar de predecir la magnitud directamente, lo que resulta más estable de entrenar. La fase no se predice: el modelo reutiliza la fase del audio degradado para la reconstrucción, lo que explica la limitación en PESQ.

El entrenamiento se realizó con 5.000 utterances del dataset VCTK (33 hablantes, solo mic2), con una partición train/val/test sin solapamiento de hablantes. La degradación se aplicó mediante un roundtrip real de Codec2 a 1200 bps, no una aproximación sintética. La función de pérdida fue L1 sobre espectrogramas log-magnitud (log1p), elegida tras comprobar que la L1 en magnitud lineal sobreponderaba las regiones de alta energía. Se usaron 70 épocas, optimizador Adam con lr=1e-4 y batch limitado por 8 GB de VRAM. Aunque se probó destilación de conocimiento con el Denoiser de Meta (dns64) como teacher, la ablación mostró que el término de teacher no aportaba mejora, por lo que el checkpoint final se entrenó con teacher_weight=0.

## Capacidades

- Restauración de voz degradada por Codec2 a 1200 bps, mejorando la inteligibilidad (STOI) y la relación señal-interferencia (SI-SDR).
- Procesamiento de audio a 16 kHz con STFT de 512 puntos y hop de 128.
- Inferencia en tiempo real en hardware de borde tipo Jetson, con posibilidad de ejecución en CPU.
- No es un modelo de lenguaje ni de generación de texto; su única función es la mejora de espectrogramas de magnitud.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe no disponible; el entrenamiento se limitó a habla inglesa del corpus VCTK.

## Casos de uso

- Comunicaciones de voz off-grid vía LoRa: el modelo se integra tras la decodificación Codec2 en el receptor para restaurar la calidad del habla en enlaces de radio de baja tasa binaria, permitiendo conversaciones más inteligibles en entornos sin cobertura móvil.
- Radioaficionados y experimentadores: puede usarse en proyectos de voz digital de bajo ancho de banda, mejorando la experiencia de comunicación en bandas con restricciones de espectro.
- Investigación en restauración de voz: sirve como referencia para estudiar el impacto de la predicción de magnitud frente a la fase, y para comparar estrategias de destilación de conocimiento en tareas de mejora de habla.
- Demostración de edge AI: al ser un modelo de solo 1,93 M de parámetros, es adecuado para mostrar despliegue en dispositivos embebidos con recursos limitados (Jetson, Raspberry Pi con aceleración).
- Prototipos de sistemas de emergencia: aunque no está validado para uso crítico, puede servir como base para desarrollar sistemas de comunicación de respaldo en zonas sin infraestructura.
- Evaluación de métricas de calidad de habla: el modelo permite experimentar con PESQ, STOI y SI-SDR en un pipeline de degradación y restauración controlado.

## Benchmarks y rendimiento

Los resultados publicados en la model card, evaluados sobre un split de test con 403 utterances sin solapamiento de hablantes, son los siguientes:

| Candidate | PESQ ↑ | STOI ↑ | SI-SDR (dB) ↑ |
|---|---|---|---|
| Codec2-degraded (sin procesar) | 1,522 | 0,658 | -28,23 |
| Denoiser (teacher, referencia) | 1,543 | 0,650 | -28,08 |
| Chola-Compressor | 1,471 | 0,780 | -26,69 |

El modelo consigue una mejora real de +0,12 en STOI (inteligibilidad) y +1,5 dB en SI-SDR frente a no hacer nada. El PESQ queda ligeramente por debajo del baseline sin procesar, atribuido a la falta de predicción de fase. No se han publicado resultados comparativos con otros modelos de restauración de voz más allá del Denoiser de referencia.

## Requisitos de hardware

- Entrenamiento: se usó una GPU con 8 GB de VRAM (el batch se limitó por esa capacidad). No se especifica el modelo exacto.
- Inferencia: el código de ejemplo permite ejecución en CPU (device="cpu"), y el autor indica que está diseñado para Jetson-class. No se detallan requisitos mínimos de VRAM para inferencia.
- Opciones de despliegue: el modelo se distribuye como checkpoint PyTorch; puede integrarse en pipelines con librosa y torch. No se mencionan formatos ONNX, TensorRT ni soporte para vLLM, llama.cpp u Ollama (no aplica, es audio).
- Latencia y throughput: no se proporcionan datos numéricos; el autor afirma que funciona en tiempo real en hardware de borde, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de restauración de voz de tamaño similar (por ejemplo, DeepFilterNet, Demucs, o variantes de U-Net para mejora de habla). La única referencia publicada es el Denoiser de Meta (dns64), que actúa como teacher y se incluye en la tabla de benchmarks. No hay información sobre alternativas comparables en cuanto a parámetros, contexto o licencia.

## Limitaciones y advertencias

- El modelo no predice la fase; reutiliza la fase del audio degradado, lo que limita el PESQ y puede producir artefactos perceptibles en ciertos segmentos.
- No está validado para comunicaciones de emergencia ni para uso en seguridad crítica; el autor lo declara explícitamente como investigación y demostración.
- El entrenamiento se realizó únicamente con el corpus VCTK (33 hablantes, inglés), por lo que el rendimiento con otros acentos, idiomas o condiciones de ruido no está garantizado.
- La degradación se limitó a Codec2 a 1200 bps; no se ha probado con otros modos de Codec2 ni con otros códecs.
- El checkpoint publicado se entrenó sin el término de destilación (teacher_weight=0), por lo que la arquitectura de destilación descrita en la model card no está reflejada en los pesos finales.
- No se proporcionan métricas de latencia ni de uso de memoria en inferencia, lo que dificulta estimar su viabilidad en hardware concreto.
- El repositorio del proyecto no está enlazado en la model card; solo se menciona de forma genérica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gautam0901/chola-compressor
- Dataset VCTK (mirror): https://huggingface.co/datasets/jspaulsen/vctk
- Denoiser de Meta (teacher): https://github.com/facebookresearch/denoiser
- Repositorio del proyecto LoRaVoiceLink: no disponible en la información proporcionada
