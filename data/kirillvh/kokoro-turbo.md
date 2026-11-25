# kirillvh/Kokoro-Turbo

## Resumen
Kokoro-Turbo es una variante del modelo de síntesis de voz Kokoro-82M en la que se sustituye únicamente el generador de forma de onda (vocoder) por un vocoder iSTFT de valores complejos derivado de ComVo. Lo desarrolla el usuario kirillvh y se publica como un fine-tune sobre hexgrad/Kokoro-82M y hsoh/ComVo-base. Los modelos de texto, duración y tono son los originales de Kokoro, sin modificar; el cambio afecta solo a la etapa que convierte las representaciones acústicas en audio muestreado a 24 kHz.

El objetivo es puramente de eficiencia: mantener la calidad y las 28 voces inglesas de Kokoro reduciendo el coste computacional de la generación de audio. Según la model card, el modelo es entre 2,5 y 4,1 veces más rápido de extremo a extremo en CPU y 2,0 veces en GPU, con la etapa sustituida entre 4,5 y 6,5 veces más rápida. Es un modelo pequeño (unos 32,1 millones de parámetros) pensado para despliegue ligero, incluso en CPU.

La relevancia actual reside en que permite usar la pila Kokoro como reemplazo directo (drop-in) con un único archivo autocontenido y la misma API `KPipeline`, sin cambiar el código de integración. Es un modelo de nicho, orientado a TTS en inglés en entornos con recursos limitados o con requisitos de latencia estrictos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | TTS Kokoro-82M (modelos de texto, duración y tono sin cambios) con vocoder iSTFT de valores complejos derivado de ComVo |
| Parametros totales | 32.126.978 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la model card no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento
Kokoro-Turbo conserva la arquitectura de Kokoro-82M para las etapas de texto, predicción de duración y predicción de tono. La única modificación es el generador de forma de onda: en lugar del iSTFTNet original, que sobremuestrea de 80 a 800 y luego a 4.800 posiciones por segundo con pilas de convoluciones dilatadas antes de aplicar una pequeña STFT inversa, se emplea un vocoder iSTFT de valores complejos procedente de ComVo. Este vocoder mantiene sus ocho bloques a 80 fotogramas por segundo y delega todo el salto hasta 24.000 muestras a una única FFT inversa de 1.024 puntos por fotograma, que consume menos del 1 % del tiempo.

El ahorro computacional es fundamentalmente de recuento de operaciones: el generador original realiza 24,6 G de multiplicaciones-suma por segundo de audio, todas a 800 o 4.800 posiciones por segundo, mientras que el nuevo vocoder necesita 4,5 G, todas a 80 posiciones por segundo. El entrenamiento consistió en ajustar el vocoder para reproducir el audio propio de Kokoro en las 28 voces inglesas; la model card no detalla el volumen de datos, la composición del dataset ni si hubo RLHF o DPO (no aplicables en un vocoder). El código de inferencia (`kokoro_comvo.py`) es un único archivo autocontenido que concuerda con el código de entrenamiento hasta -96 dB, lo que corresponde a redondeo en float32.

## Capacidades
- Síntesis de voz (text-to-speech) en inglés a 24 kHz.
- Reproducción de las 28 voces inglesas de Kokoro (prefijos `af_`, `am_`, `bf_`, `bm_`).
- Integración directa con `KPipeline` de la librería `kokoro` mediante `lang_code="a"` o `"b"`.
- Carga del modelo con `kokoro_comvo.load()`, con opción de dispositivo (`device="cuda"`).
- Generación por lotes de audio en formato utilizable con `soundfile`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multimodales; es exclusivamente un modelo TTS.
- Sin capacidades multilingües más allá del inglés.

## Casos de uso
- Síntesis de voz en tiempo real en CPU: gracias a los 0,060 s de cómputo por segundo de audio con 4 hilos, puede alimentar asistentes o interfaces conversacionales en servidores sin GPU.
- Lectura de artículos o documentos en aplicaciones de accesibilidad: el bajo coste por segundo de audio permite narrar textos largos en hardware modesto.
- Generación de audiolibros y pódcast automatizados: las 28 voces permiten asignar timbres distintos a narradores o personajes en un mismo pipeline.
- Integración en asistentes de voz embebidos o de borde: el tamaño reducido (unos 0,1 GB de repositorio) y la licencia apache-2.0 facilitan el despliegue en dispositivos con recursos limitados.
- Sustitución directa en proyectos que ya usan Kokoro-82M: al mantener la API `KPipeline`, se puede cambiar el vocoder sin reescribir la integración y obtener ganancias de latencia.
- Generación masiva de avisos o locuciones pregrabadas: el throughput superior reduce el tiempo de procesamiento por lotes en pipelines de producción.
- Pruebas A/B de calidad de voz en investigación: la model card incluye pares de muestras con la misma excitación aleatoria, útiles para comparar vocoders de forma controlada.

## Benchmarks y rendimiento
La model card no publica métricas de calidad subjetiva ni objetivos como MOS, WER o similitud de hablante. Sí incluye mediciones de velocidad (segundos de cómputo por segundo de audio, menor es más rápido), promediadas sobre tres líneas de 2,8, 5,9 y 11,4 s con la voz `af_heart`, con fonemización excluida:

| Entorno | Kokoro-82M | Kokoro-Turbo | Aceleración |
|---|---|---|---|
| CPU, 1 hilo | 0,597 | 0,145 | 4,1x |
| CPU, 4 hilos | 0,185 | 0,060 | 3,1x |
| CPU, 8 hilos | 0,161 | 0,064 | 2,5x |
| CPU, 16 hilos | 0,198 | 0,074 | 2,7x |
| CPU, mejor recuento de hilos | 0,161 (8) | 0,060 (4) | 2,7x |
| GPU | 0,0285 | 0,0144 | 2,0x |

El desglose del ahorro en la etapa sustituida en un hilo es de 5,47x por menor número de multiplicaciones-suma (de 24,6 G a 4,5 G) y 1,19x por mayor velocidad de ejecución (de 46 a 55 G por segundo). Las pruebas se realizaron en un Intel Core i9-12900K con PyTorch 2.3 y MKL, y en una Radeon AI PRO R9700 con PyTorch 2.9 y ROCm 7.2 en fp32. No se probó ninguna GPU NVIDIA.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; con 32,1 millones de parámetros en fp32 el modelo ocupa del orden de 0,13 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: la model card solo documenta pruebas en una Radeon AI PRO R9700; no se probó ninguna GPU NVIDIA.
- Cabe en GPU consumer: sí, por tamaño; la model card no aporta mediciones específicas en tarjetas como RTX 4090.
- Despliegue: pensado para la librería `kokoro` con `kokoro_comvo.py`, PyTorch y `soundfile`; la model card no menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,060 s de cómputo por segundo de audio en CPU con 4 hilos y 0,0144 s por segundo de audio en GPU (Radeon AI PRO R9700, fp32).

## Comparativa con modelos similares
| Modelo | Parámetros | Idioma | Licencia | Notas |
|---|---|---|---|---|
| Kokoro-Turbo | 32,1 M | en | apache-2.0 | Vocoder ComVo; 2,0x–4,1x más rápido que Kokoro-82M según la model card |
| hexgrad/Kokoro-82M | no disponible en la información proporcionada | en | no disponible en la información proporcionada | Modelo base; vocoder iSTFTNet original |
| hsoh/ComVo-base | no disponible en la información proporcionada | no disponible | no disponible | Origen del vocoder iSTFT de valores complejos |

No se dispone de datos de benchmarks de calidad ni de comparativas con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias
- Solo soporta inglés; no hay capacidades multilingües.
- El resultado es "cercano a Kokoro, no idéntico": la model card advierte explícitamente de diferencias de calidad respecto al modelo base y señala `af_nicole` y `bm_lewis` como las voces con peor puntuación.
- No se han publicado métricas objetivas de calidad (MOS, WER, similitud de hablante) en la información disponible; la evaluación cualitativa queda a cargo del usuario mediante las muestras incluidas.
- No se documentan sesgos conocidos del vocoder ni del modelo base en la información proporcionada.
- No se detalla el riesgo de alucinación o artefactos acústicos más allá de la advertencia de que no es idéntico a Kokoro.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Kokoro-82M y de ComVo-base, cuyas licencias no se detallan en la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validación por la comunidad es nula.
- No se probó en GPU NVIDIA; el rendimiento en CUDA es una extrapolación no verificada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kirillvh/Kokoro-Turbo
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo base del vocoder ComVo: https://huggingface.co/hsoh/ComVo-base
- Paper referenciado (arXiv:2603.11589): https://arxiv.org/abs/2603.11589
- Paper referenciado (arXiv:2306.07691): https://arxiv.org/abs/2306.07691
- Paper referenciado (arXiv:2203.02395): https://arxiv.org/abs/2203.02395
- DOI: https://doi.org/10.57967/hf/11864
