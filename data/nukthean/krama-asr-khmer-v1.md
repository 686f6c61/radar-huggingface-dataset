# Nukthean/krama-asr-khmer-v1

## Resumen

`krama-asr-khmer-v1` es un modelo de reconocimiento automático del habla (ASR) especializado en jemer (`km`), desarrollado por el usuario Nukthean y publicado bajo licencia Apache 2.0. Con 345 millones de parámetros, se construye sobre la torre de audio Conformer de 12 capas y dimensión 1024 de `google/embeddinggemma-2`, a la que se añade un lector CTC de 6 capas y un decodificador causal de clústeres de 3 capas. El resultado es un modelo híbrido CTC/atención que decodifica en una sola pasada mediante CTC voraz o, opcionalmente, con beam-5 y rescoring del decodificador interno.

El modelo aborda un problema concreto: la escasez de sistemas ASR abiertos y de calidad para jemer, un idioma de bajos recursos con escritura propia y sin separación de palabras por espacios. Para ello se entrena sobre 854,59 horas de audio repartidas en siete dominios (DDD, NXKMER, FLEURS, iAny, GRKPP, Slang y OpenSLR-42), con un vocabulario de 3.072 tokens de clúster jemer que evita depender de un tokenizador subword convencional.

Su relevancia actual radica en que ofrece un rendimiento competitivo en un formato compacto y autónomo: los pesos se distribuyen como un único `model.safetensors` en bfloat16 junto con un módulo de inferencia independiente, sin necesidad de un modelo de lenguaje externo. En los conjuntos de evaluación reportados alcanza CER de 2,04 % en DDD y 7,12 % en FLEURS con el decodificador activado, a una velocidad de aproximadamente 20 veces tiempo real en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida CTC/atención: torre de audio Conformer de 12 capas (base `google/embeddinggemma-2`, `d=1024`) + lector CTC de 6 capas + decodificador causal de clústeres de 3 capas |
| Parámetros totales | 345.000.672 (~345M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de tokens; entrenado con segmentos de audio de 0,3 s a 27 s, con troceado automático para grabaciones más largas |
| Tipos de cuantización | Pesos distribuidos en bfloat16; no se documentan otras cuantizaciones |
| Idiomas soportados | Jemer (`km`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`, bfloat16, sin estado del optimizador) |

## Arquitectura y entrenamiento

La arquitectura combina una torre de audio Conformer de 12 capas y dimensión 1024 heredada de `google/embeddinggemma-2` con una cabeza CTC de 6 capas y un decodificador causal de 3 capas que opera sobre un vocabulario de 3.072 tokens de clúster jemer. La decodificación por defecto es CTC voraz en una sola pasada; de forma opcional se puede aplicar beam-5 con rescoring del decodificador causal, combinando las puntuaciones como `0,4 · CTC + 0,6 · decodificador`, sin modelo de lenguaje externo.

El entrenamiento consta de 45.000 pasos distribuidos en tres etapas sobre el split `train` de `Nukthean/flagship-khmer-asr-858h`, con 349.305 clips y 854,59 horas. La etapa 2A (0 a 20.000 pasos) adapta la cabeza y las capas superiores del Conformer sobre la mezcla de siete dominios con pesos de muestreo explícitos (49 % DDD, 34 % NXKMER, 5 % FLEURS, 4 % iAny, 3 % GRKPP, 3 % Slang y 2 % OpenSLR-42). La etapa 2B (20.000 a 38.000 pasos) entrena conjuntamente CTC y el decodificador causal con las nueve capas superiores del Conformer descongeladas en bf16. La etapa 3 (38.000 a 45.000 pasos) aplica Stochastic Weight Averaging sobre los checkpoints finales.

El entrenamiento se ejecutó en dos NVIDIA Tesla T4 (Kaggle Notebooks) para la etapa 2A y en una NVIDIA RTX 5090 con precisión mixta bf16 (Vast.ai) para las etapas 2B y 3. La evaluación se realizó en CPU sobre un Intel Core i5-13400F de 13.ª generación.

## Capacidades

- Transcripción de voz a texto en jemer a partir de audio mono a 16 kHz.
- Decodificación CTC voraz en una sola pasada, con velocidad aproximada de 20 veces tiempo real en CPU (RTF mediano de 0,05).
- Decodificación opcional con beam-5 y rescoring mediante el decodificador causal interno, que mejora el CER y la tasa de coincidencia exacta en todos los conjuntos evaluados.
- Manejo de audio de entre 0,3 s y 27 s por segmento, con troceado automático de grabaciones más largas.
- Salida mediante un vocabulario de 3.072 tokens de clúster jemer, con espacios mínimos entre palabras.
- Robustez relativamente buena en habla conversacional corta con ruido y reverberación.
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá del ASR ni modo de razonamiento explícito; es un modelo puramente acústico de transcripción.

## Casos de uso

- Transcripción de archivos y notas de voz en jemer: el modelo procesa audio mono a 16 kHz y trocea automáticamente grabaciones largas, por lo que encaja en servicios de dictado o archivado de entrevistas con una velocidad de unas 20 veces tiempo real en CPU.
- Subtitulado automático de contenido audiovisual jemer: la decodificación CTC voraz permite generar transcripciones con latencia baja y sin GPU, adecuada para pipelines de subtitulado por lotes.
- Atención al cliente y asistentes de voz en jemer: su buen comportamiento en frases conversacionales cortas con ruido y reverberación (CER de 2,75 % con decodificador en el conjunto iAny de hablantes no vistos) lo hace apto para comandos y respuestas breves.
- Indexación y búsqueda de archivos de audio: la transcripción permite construir índices de texto sobre archivos de voz para recuperación posterior, con la advertencia de aplicar un segmentador de palabras jemer como `khmercut` para obtener límites de palabra.
- Investigación en ASR de bajos recursos: al ser un modelo abierto con pesos autónomos y vocabulario de clústeres, sirve como base para experimentos de adaptación a dominio o de comparación de estrategias CTC frente a CTC más decodificador.
- Procesamiento de audio en entornos sin GPU: al ejecutarse en CPU a RTF de 0,05, puede desplegarse en servidores modestos o en el borde para transcripción de lotes pequeños.
- Normalización y limpieza de corpus de voz jemer: útil para transcribir y alinear grabaciones de dominio público o datasets propios antes de incorporarlos a un corpus mayor.

## Benchmarks y rendimiento

Resultados reportados en la model card, evaluados en CPU con una pasada por clip (voraz frente a beam-5 con rescoring del decodificador causal). CER calculado sin espacios y con normalización Unicode NFC, verbalización de dígitos y eliminación de puntuación.

| Benchmark | Clips | Horas | CER % voraz | CER % con decodificador | Exact % voraz | Exact % con decodificador | Velocidad mediana (s/clip) |
|---|---:|---:|---:|---:|---:|---:|---:|
| DDD | 948 | 2,24 | 2,22 | 2,04 | 42,8 | 48,8 | 0,41 / 0,46 |
| GRKPP | 150 | 0,86 | 2,63 | 2,58 | 34,7 | 38,0 | 0,96 / 1,05 |
| iAny (8 hablantes no vistos) | 688 | 0,64 | 2,96 | 2,75 | 70,2 | 73,5 | 0,16 / 0,19 |
| OpenSLR-42 (limpiado) | 600 | 0,81 | 4,47 | 4,12 | 37,7 | 44,7 | 0,21 / 0,25 |
| FLEURS (limpiado) | 771 | 3,15 | 7,30 | 7,12 | 10,0 | 12,3 | 0,72 / 0,71 |

FLEURS e iAny son evaluaciones retenidas (hablantes y frases no vistos); DDD, GRKPP y OpenSLR-42 son conjuntos de test dentro del dominio. Se excluyó un clip de DDD por bucles de repetición (2,34 % de CER si se incluye). No se han publicado comparaciones con otros modelos ASR de jemer en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 345M parámetros en bfloat16, lo que supone aproximadamente 0,7 GB de pesos; con activaciones y buffers de decodificación el consumo es holgadamente inferior a 2 GB en GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona con NVIDIA T4, RTX 4090, A100, H100 y RTX 5090. El autor entrenó con T4 y RTX 5090, y evaluó en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Despliegue: el repositorio incluye el módulo independiente `krama_asr.py` con las funciones `load_model` y `transcribe`, que requiere `torch`, `soundfile`, `soxr`, `transformers`, `huggingface_hub` y `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje generativo.
- Latencia y throughput: RTF mediano de 0,05 en CTC voraz y de 0,05 a 0,06 con decodificador en un Intel Core i5-13400F, es decir, aproximadamente 20 veces tiempo real en CPU. Los tiempos medianos por clip oscilan entre 0,16 s (iAny) y 0,96 s (GRKPP) en voraz.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos ASR de jemer en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. La siguiente tabla recoge únicamente los datos verificables del modelo frente a alternativas genéricas de ASR multilingüe, sin cifras de CER comparables.

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| krama-asr-khmer-v1 | ~345M | Jemer | Segmentos de 0,3 s a 27 s | Apache 2.0 | safetensors |
| Whisper (variantes pequeñas/medianas) | No disponible en la información | Multilingüe | No disponible en la información | No disponible en la información | No disponible en la información |
| Modelos ASR específicos de jemer | No disponible en la información | Jemer | No disponible en la información | No disponible en la información | No disponible en la información |

No se han publicado comparaciones directas con alternativas en la información disponible.

## Limitaciones y advertencias

- Formato de audio: espera audio mono a 16 kHz; fue entrenado con segmentos de 0,3 s a 27 s y trocea automáticamente grabaciones más largas.
- Enunciados largos: el CER aproximadamente se duplica al pasar de unos 3 s a unos 11 s de habla; la coincidencia exacta en FLEURS es solo del 10,0 % (12,3 % con decodificador).
- Números: la salida usa palabras jemer habladas en lugar de dígitos; es necesario aplicar un normalizador de texto inverso si se requieren cifras.
- Espaciado: el vocabulario de clústeres emite espacios mínimos; hace falta un segmentador de palabras jemer como `khmercut` para obtener límites de palabra.
- Habla espontánea: no hay benchmark de habla espontánea; todos los conjuntos evaluados son habla leída o guionizada.
- Ruido: la robustez depende del dominio; en frases largas leídas con SNR de 10 dB o menos, la ausencia de un modelo de lenguaje externo provoca más eliminaciones.
- Bucles de repetición: se documentó un clip con bucles de repetición en DDD (1 de 948).
- Sesgos: no se documentan sesgos específicos más allá de la composición del corpus de entrenamiento, dominado por habla leída de noticias y diálogo (DDD y NXKMER concentran el 83 % del peso de muestreo), lo que puede infrarepresentar registros coloquiales o dialectos.
- Alucinación: no se reportan tasas de alucinación; como todo modelo ASR, puede producir transcripciones plausibles en audio degradado o silencioso.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `google/embeddinggemma-2` tiene sus propias condiciones que conviene verificar antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nukthean/krama-asr-khmer-v1
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset de entrenamiento: https://huggingface.co/datasets/Nukthean/flagship-khmer-asr-858h
- Dataset DDD: https://huggingface.co/datasets/Digital-Divide-Data/khmer-speech-dataset
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset iAny: https://huggingface.co/datasets/sengtha/iany-khmer-voice
- Dataset GRKPP: https://huggingface.co/datasets/seanghay/khmer_grkpp_speech
- Dataset OpenSLR-42: https://huggingface.co/datasets/openslr/openslr_42
