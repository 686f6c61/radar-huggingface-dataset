# mikaelaehunter/exp_canadian_english

## Resumen

`mikaelaehunter/exp_canadian_english` es un ajuste fino (fine-tune) del modelo `openai/whisper-tiny` publicado por el usuario mikaelaehunter en HuggingFace, orientado a reconocimiento automático de voz (ASR) en inglés canadiense. El modelo parte de la arquitectura encoder-decoder transformer de Whisper y se ha reentrenado sobre un corpus denominado `canadian_english`, con el objetivo declarado de mejorar la transcripción de un acento y una variante dialectal que los modelos genéricos de Whisper tienden a normalizar hacia el inglés estadounidense.

Se trata de un modelo de muy pequeño tamano: 37.760.640 parámetros en los pesos `safetensors`, lo que lo sitúa en la gama de los modelos desplegables en CPU o en cualquier GPU de consumo. El autor reporta un WER de 12,71 % sobre el split de test del dataset `canadian_english`, junto con una pérdida de validación de 0,2477. No obstante, la model card es un artefacto autogenerado por el `Trainer` de HuggingFace y no documenta la composición del dataset, el número de horas de audio ni el proceso de evaluación.

Su relevancia es limitada pero práctica: es un ejemplo típico de adaptación dialectal de bajo coste computacional, útil para quien necesite transcribir audio canadiense en entornos con recursos muy restringidos. Al no tener descargas ni validación externa, debe tratarse como un experimento reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con encoder convolucional + positional embeddings sinusoidales y decoder autoregresivo con cross-attention |
| Parametros totales | 37.760.640 (pesos safetensors del fine-tune) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; por herencia de Whisper, ventanas de audio de 30 s (1500 frames mel) por segmento |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos publicados son safetensors en precision nativa (FP32/FP16) |
| Idiomas soportados | en (inglés; el fine-tune está orientado a inglés canadiense. El modelo base `openai/whisper-tiny` es multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de `openai/whisper-tiny` sin modificaciones estructurales: un encoder que procesa espectrogramas mel de 80 canales y un decoder que genera tokens de transcripción, incluyendo tokens especiales para marcas de tiempo, detección de idioma y tareas de traducción/transcripción. No hay innovaciones técnicas declaradas (sin attention linear, sin decodificación especulativa, sin variantes MoE ni SSM).

El entrenamiento se realizó con el `Trainer` de HuggingFace y los hiperparámetros documentados son: learning rate de 5e-06, batch de entrenamiento de 2, batch de evaluación de 1, optimizador AdamW (`ADAMW_TORCH_FUSED`) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 25 pasos de warmup, semilla 42 y un total de 500 pasos de entrenamiento. Alcanzó un 0,5556 de epoch en el paso 500, lo que implica que el corpus completo se recorre en torno a 900 pasos; con batch 2, el dataset rondaría las 1.800 muestras de audio (estimación derivada de los hiperparámetros, no declarada por el autor). No se especifica número de horas de audio, composición del corpus, presencia de RLHF/DPO ni técnicas de aumento de datos.

## Capacidades

- Transcripción de voz a texto en inglés, con salida de texto plano y marcas de tiempo (herencia directa de Whisper tiny).
- Reconocimiento de habla en inglés canadiense, presuntamente mejorado respecto al modelo base por el ajuste fino, aunque sin ablación publicada que lo demuestre.
- Detección de idioma y tokens de tarea de Whisper (transcripción y traducción) disponibles en el tokenizer heredado, si bien el ajuste fino solo se ha supervisado en inglés.
- Manejo de audio de hasta 30 segundos por ventana, con la lógica de chunking propia de los pipelines de `transformers`.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de audio.
- No se ha documentado modo "thinking" ni capacidades de visión.

## Casos de uso

- Transcripción de reuniones y llamadas de equipos canadienses: el ajuste sobre `canadian_english` busca reducir errores en vocabulario y pronunciación locales (por ejemplo, "about", "sorry", topónimos canadienses) frente a Whisper tiny genérico, con un coste de inferencia mínimo.
- Subtitulado automático de contenido audiovisual de baja latencia: al ser un modelo de 37,7 M de parámetros, puede ejecutarse en tiempo real sobre CPU en un pipeline de streaming con ventanas de 30 s.
- Preetiquetado de datasets de ASR: usar el modelo para generar transcripciones iniciales sobre audio canadiense y corregirlas manualmente, reduciendo el coste de anotación antes de entrenar un modelo mayor.
- Transcripción en el dispositivo (edge computing): cuantizado y convertido a formatos ligeros, cabe en dispositivos con pocos cientos de MB de RAM, útil para notas de voz o asistentes offline sin conexión.
- Investigación en adaptación dialectal: sirve como punto de partida reproducible (semilla, hiperparámetros y epochs documentados) para estudiar el efecto del fine-tuning de bajo rango sobre un checkpoint pequeño.
- Evaluación comparativa de robustez acústica: al ser un fine-tune de un modelo público con licencia Apache 2.0, puede integrarse en baterías de test de sesgo dialectal frente a Whisper tiny o whisper-base.
- Dictado en aplicaciones de nicho: integrándolo tras un VAD, puede transcribir comandos cortos en inglés canadiense en herramientas internas donde no se justifica un modelo de mayor tamano.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (métricas no verificadas, `verified: false`):

| Benchmark | Dataset / split | Métrica | Valor |
|---|---|---|---|
| Whisper tiny canadian_english | canadian_english (config: default, split: test) | WER | 12,705761316872428 % |
| Validación durante entrenamiento | canadian_english (evaluación) | Loss | 0,2477 |

No se han publicado resultados de benchmarks estándar (LibriSpeech, Common Voice, FLEURS, MMLU, GSM8K u otros) en la información disponible, ni comparaciones con el modelo base en las mismas condiciones. No se dispone de cifras de WER de `openai/whisper-tiny` sobre este mismo split, por lo que no es posible cuantificar la mejora atribuible al fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 151 MB; en FP16 unos 75 MB; en int8 unos 38 MB. Con activaciones y buffers de atención, el consumo real se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo (RTX 4090, A100, H100 desperdician capacidad). Es funcional en GTX 1050 Ti, RTX 3060, T4, e incluso en iGPU y CPU.
- Cabe en cualquier GPU de consumo, incluidas las integradas, y en Raspberry Pi 4/5 con llama.cpp o whisper.cpp (conversión a ggml/GGUF).
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")`, `faster-whisper` (CTranslate2), `whisper.cpp`, `whisper` original de OpenAI, y servidores tipo TGI o endpoints compatibles. La model card incluye la etiqueta `endpoints_compatible`, por lo que es desplegable como Inference Endpoint directamente.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamano, se espera inferencia en decenas de milisegundos por ventana de 30 s en GPU y en el orden de segundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mikaelaehunter/exp_canadian_english | 37,76 M | 30 s por ventana (heredado) | 12,71 % en canadian_english (no verificado) | Apache 2.0 | HuggingFace, 0 descargas |
| openai/whisper-tiny (base) | ~39 M | 30 s por ventana | no disponible en la información proporcionada sobre este dataset | Apache 2.0 | HuggingFace, ampliamente usado |
| openai/whisper-base | ~74 M | 30 s por ventana | no disponible en la información proporcionada | Apache 2.0 | HuggingFace |
| distil-whisper (variantes destiladas) | variable (mayores que tiny) | 30 s por ventana | no disponible en la información proporcionada | MIT/Apache según variante | HuggingFace |

La comparación cuantitativa con alternativas no puede establecerse con los datos disponibles: no hay resultados del modelo base ni de otros checkpoints evaluados sobre el split `canadian_english`. La única ventaja diferencial documentada es el fine-tune específico sobre esa variante dialectal.

## Limitaciones y advertencias

- Métricas no verificadas: el WER de 12,71 % está marcado como `verified: false` y procede de un artefacto autogenerado por el `Trainer`; no hay evaluación independiente.
- Dataset opaco: no se documenta el tamano, la procedencia, la licencia del corpus de audio ni la distribución de hablantes de `canadian_english`. El riesgo de sobreajuste es alto (500 pasos, batch 2, learning rate muy bajo) y la estimación de ~1.800 muestras sugiere un corpus reducido.
- Sesgo de dominio: al estar entrenado sobre un corpus acotado, el rendimiento fuera de ese dominio (audio telefónico, ruido, acentos no canadienses, habla espontánea) es desconocido y probablemente degrade respecto al modelo base.
- Idioma: el ajuste fino solo cubre inglés; otras lenguas del modelo base no están garantizadas tras el reentrenamiento. Dentro del inglés, el sesgo hacia una variante dialectal puede empeorar la transcripción de otras.
- Alucinaciones: Whisper es propenso a generar texto plausible en silencios o audio ininteligible (bucles de repetición, frases inventadas), riesgo que persiste en este checkpoint y se acentúa si el fine-tune ha reducido la diversidad de datos.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, con obligación de conservar avisos de copyright y el texto de la licencia; el modelo base `openai/whisper-tiny` también es Apache 2.0. Conviene verificar la licencia del dataset de audio, no declarada.
- Adopción nula: 0 descargas y 0 likes en el momento del análisis; no hay issues, discusiones ni validación de la comunidad.
- Falta de documentación operativa: la model card indica "More information needed" en descripción, usos previstos y datos de entrenamiento; no hay información sobre preprocesado de audio, normalización ni umbrales de silencio.
- Entorno de entrenamiento muy reciente: `Transformers 5.21.0.dev0` y `PyTorch 2.11.0+cu130` son versiones de desarrollo, lo que puede complicar la reproducción exacta con versiones estables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikaelaehunter/exp_canadian_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset referenciado: `canadian_english` (no se proporciona URL en la información disponible)
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Implementación faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Implementación whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- No se han encontrado en la búsqueda web papers, blogs ni demos adicionales específicos de este fine-tune.
