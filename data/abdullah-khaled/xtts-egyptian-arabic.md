# abdullah-khaled/xtts-egyptian-arabic

## Resumen

XTTS-v2 Egyptian Arabic es un ajuste fino (fine-tune) del modelo de síntesis de voz Coqui XTTS-v2, adaptado específicamente al árabe egipcio (código ISO `arz`). Lo publica el usuario de HuggingFace abdullah-khaled y está entrenado sobre un corpus propio de un único hablante, `xtts-egyptian-dataset-v2`, a 22,05 kHz. El modelo conserva la capacidad de condicionamiento por audio de referencia del XTTS-v2 original, lo que permite generar voz con las características tímbricas de un clip de referencia de entre 6 y 30 segundos.

El modelo resuelve un problema concreto: el XTTS-v2 original está entrenado mayoritariamente en árabe estándar moderno (MSA) y no reproduce bien la fonética ni la prosodia del dialecto egipcio. Este checkpoint desplaza la distribución acústica hacia el egipcio coloquial, manteniendo la arquitectura y el pipeline de inferencia del modelo base. Es relevante para investigadores que trabajen en TTS dialectal árabe y para desarrolladores que quieran experimentar con clonación de voz en egipcio sin partir de cero.

La información pública es escasa: no se documentan hiperparámetros de entrenamiento, número de pasos, hardware utilizado ni resultados de evaluación. El propio autor etiqueta el checkpoint como experimental y restringe su uso a investigación no comercial. El repositorio ocupa 2,1 GB e incluye `model.pth`, `config.json`, `vocab.json` y una muestra de audio (`output.wav`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XTTS-v2 (transformer autorregresivo GPT + decoder VQ-VAE + vocoder HiFi-GAN, según el modelo base Coqui) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por referencia de audio de 6-30 s; `enable_text_splitting` para textos largos) |
| Tipos de cuantización | no disponible (pesos en `model.pth`, formato PyTorch nativo) |
| Idiomas soportados | árabe (`ar`) y árabe egipcio (`arz`); en inferencia se usa el código `ar` |
| Licencia | Coqui Public Model License (CPML), uso solo de investigación, no comercial |
| Formato de pesos | `model.pth` (PyTorch), `config.json`, `vocab.json` |
| Frecuencia de muestreo de salida | 24.000 Hz |
| Frecuencia de muestreo de entrenamiento | 22.050 Hz mono |
| Framework | Coqui TTS (`XttsConfig` / `Xtts`), compatible con el fork `coqui-tts` |
| Tamaño del repositorio | 2,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Coqui XTTS-v2: un transformer autorregresivo de tipo GPT que genera tokens acústicos discretos a partir de texto y de latentes de condicionamiento, seguido de un decoder y un vocoder neuronal que reconstruye la forma de onda a 24 kHz. El condicionamiento de hablante se obtiene calculando `gpt_cond_latent` y `speaker_embedding` a partir de un clip de referencia limpio, en mono, de 6 a 30 segundos. El ajuste fino se realizó sobre el checkpoint preentrenado `coqui/XTTS-v2` con clips a nivel de frase de hasta 12 segundos, a 22.050 Hz mono, y transcripciones generadas por LLM sin verificación humana completa, según declara el autor.

No se publican hiperparámetros (learning rate, batch size, número de épocas o pasos), ni el hardware empleado, ni la composición exacta del dataset más allá de ser un corpus de un solo hablante. Tampoco se documenta si hubo etapas de RLHF, DPO o ajuste perceptual adicional. La única innovación reseñable respecto al base es el desplazamiento de dominio hacia el dialecto egipcio mediante fine-tuning supervisado, manteniendo intacto el mecanismo de clonación por referencia.

## Capacidades

- Síntesis de voz (text-to-speech) en árabe egipcio a partir de texto escrito en árabe.
- Clonación de voz zero-shot mediante audio de referencia: el modelo extrae latentes de condicionamiento de un clip de 6-30 segundos y los aplica a la generación.
- Generación de audio a 24 kHz, con control de expresividad mediante `temperature`, `top_k`, `repetition_penalty` y `length_penalty`.
- Segmentación automática de textos largos con `enable_text_splitting=True`.
- Soporte de inferencia en GPU (CUDA) y CPU; en CPU el propio autor advierte que es lento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del clip de referencia.
- Capacidad multilingüe limitada en la práctica: el ajuste fino se centra en egipcio y el modelo base soporta más idiomas, pero este checkpoint no ha sido evaluado en ellos.

## Casos de uso

- Investigación en TTS dialectal árabe: comparar la calidad del egipcio generado por este checkpoint frente al XTTS-v2 original en experimentos académicos controlados, usando el mismo clip de referencia y los mismos parámetros de decodificación.
- Generación de corpus sintéticos para ASR: producir audio en egipcio con un único hablante para aumentar datos de entrenamiento de sistemas de reconocimiento de voz, siempre en un contexto de investigación no comercial.
- Pruebas de naturalidad prosódica: evaluar cómo afecta el fine-tuning a la entonación y al ritmo del dialecto egipcio frente al árabe estándar, con métricas MOS subjetivas o de distancia espectral.
- Demos y prototipos educativos: ilustrar en un aula o taller cómo funciona la clonación de voz zero-shot con XTTS y qué límites tiene al cambiar de dialecto.
- Estudio de robustez y sesgos: analizar el comportamiento del modelo con transcripciones imperfectas (las del dataset fueron generadas por LLM) y medir la tasa de errores de pronunciación.
- Reproducibilidad de fine-tuning: servir como punto de partida documentado para quien quiera replicar el ajuste sobre el dataset `xtts-egyptian-dataset-v2` y comparar resultados.
- Evaluación de seguridad en clonación de voz: usar el checkpoint en entornos controlados para estudiar la facilidad con la que se imita una voz a partir de pocos segundos de referencia y diseñar contramedidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas objetivas (MOS, WER, MCD, SIM) ni comparaciones cuantitativas con el XTTS-v2 original u otros sistemas TTS en árabe. La única evidencia cualitativa es la muestra `output.wav` incluida en el repositorio, generada con los parámetros recomendados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio pesa 2,1 GB en pesos; en FP32 la huella en memoria del modelo es del orden de varios GB, y la inferencia añade memoria para latentes y buffers de audio. Se recomienda al menos 8 GB de VRAM para trabajar con comodidad en GPU.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del checkpoint, una RTX 3090, RTX 4090, A100 o H100 son opciones holgadas; tarjetas consumer de 8-12 GB (RTX 3060, RTX 4070) deberían ser suficientes para inferencia.
- CPU: el modelo puede ejecutarse en CPU con `torch.set_num_threads(os.cpu_count())`, pero el autor advierte explícitamente de que es lento.
- Opciones de despliegue: Coqui TTS (`coqui-tts` o el paquete `TTS` original), con carga vía `XttsConfig` y `Xtts`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del hardware, de la longitud del texto y de si se usa `enable_text_splitting`.

## Comparativa con modelos similares

| Modelo | Base | Idioma objetivo | Contexto / condicionamiento | Licencia | Estado |
|---|---|---|---|---|---|
| XTTS-v2 Egyptian Arabic (este) | coqui/XTTS-v2 | Árabe egipcio (`arz`) | Referencia de audio 6-30 s | CPML, solo investigación | Experimental, 4 descargas |
| coqui/XTTS-v2 | Original | Multilingüe (incluye `ar`) | Referencia de audio 6-30 s | CPML | Modelo base ampliamente usado |
| Otros fine-tunes de XTTS-v2 para árabe | coqui/XTTS-v2 | Árabe (MSA o dialectos) | Referencia de audio | Variable según autor | No disponible en la información proporcionada |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados que permitan situar este checkpoint frente al XTTS-v2 original ni frente a otros sistemas TTS en árabe.

## Limitaciones y advertencias

- Restricción de licencia: Coqui Public Model License (CPML). El autor prohíbe explícitamente el despliegue en producción, el uso comercial (productos de pago, APIs, contenido monetizado) y la clonación o imitación de voces sin consentimiento. Solo se permite investigación académica no comercial, experimentación personal, demos y estudios de reproducibilidad.
- Checkpoint experimental: no ha sido evaluado en robustez, seguridad ni fiabilidad. No debe usarse en sistemas donde un error pueda causar daño.
- Datos de entrenamiento con transcripciones generadas por LLM y no verificadas por humanos, lo que puede introducir desalineaciones texto-audio y errores de pronunciación.
- Corpus de un único hablante: la diversidad tímbrica del modelo está limitada a ese hablante, aunque el condicionamiento por referencia permite cierta variación.
- Riesgo de alucinación acústica: como todo modelo generativo de voz, puede producir artefactos, repeticiones o prosodia incorrecta, especialmente con textos largos o fuera de dominio. El parámetro `repetition_penalty=5.0` se recomienda precisamente para mitigar bucles.
- Limitación de idioma: el código de inferencia es `ar`, sin código dedicado a egipcio en XTTS; el comportamiento en otros dialectos árabes o en otros idiomas no está evaluado.
- Riesgo de uso indebido para suplantación de identidad: la clonación de voz con pocos segundos de referencia facilita deepfakes; el autor restringe su uso y conviene aplicar consentimiento explícito y marcas de agua en cualquier experimento.
- Falta de documentación de entrenamiento: sin hiperparámetros ni hardware publicados, la reproducibilidad es limitada.
- Popularidad muy baja (4 descargas, 0 likes): no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdullah-khaled/xtts-egyptian-arabic
- Dataset de entrenamiento: https://huggingface.co/datasets/abdullah-khaled/xtts-egyptian-dataset-v2
- Modelo base Coqui XTTS-v2: https://huggingface.co/coqui/XTTS-v2
- Licencia Coqui Public Model License: https://coqui.ai/cpml
- Fork mantenido de Coqui TTS: paquete `coqui-tts` en PyPI (https://pypi.org/project/coqui-tts/)
