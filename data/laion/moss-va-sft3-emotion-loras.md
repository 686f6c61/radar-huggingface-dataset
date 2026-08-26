# laion/moss-va-sft3-emotion-loras

## Resumen

`laion/moss-va-sft3-emotion-loras` es un conjunto de 40 adaptadores LoRA (Low-Rank Adaptation) diseñados para el modelo de síntesis de voz MOSS TTS local transformer de 4.55 mil millones de parámetros, en su versión `voice-acting-v2-sft3`. Cada adaptador está especializado en una emoción concreta (ira, alegría, tristeza, sorpresa, etc.) y se ha entrenado sobre el 1 % superior de las muestras de esa emoción en el corpus, filtrando además por calidad de naturalidad y mezcla de vocal burst. El objetivo es dotar al sistema de un control fino y específico sobre la expresividad emocional del habla sintetizada, sin necesidad de modificar los pesos del modelo base.

Desarrollados por LAION (Large-scale Artificial Intelligence Open Network), estos adaptadores son independientes de la identidad del hablante y se pueden combinar con los 500 adaptadores de voz del mismo proyecto para controlar simultáneamente quién habla y con qué emoción. El repositorio incluye los 40 adaptadores en formato safetensors, con una licencia CC-BY-4.0 que permite uso comercial con atribución. El proyecto es relevante porque aborda un problema habitual en los sistemas TTS expresivos: la intensidad emocional no siempre correlaciona con la naturalidad percibida, y estos adaptadores han sido filtrados específicamente para seleccionar muestras genuinas y no solo intensas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer TTS (base: `moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`) |
| Parámetros totales | 4,55 mil millones (modelo base) + 34,4 millones por adaptador (0,83 % del modelo) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo TTS, sin ventana de contexto textual) |
| Tipos de cuantización | bfloat16 (recomendado por el autor), safetensors |
| Idiomas soportados | Inglés, alemán |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 16 y alpha 32, entrenado durante 5 épocas con una tasa de aprendizaje coseno de 1e-4 a 5e-6. El número de parámetros entrenables es de 34,4 millones por adaptador, lo que representa el 0,83 % del total del modelo base. El entrenamiento se realizó sobre el corpus completo de MOSS, pero cada adaptador solo usó el top 1 % de las muestras de su emoción, con el filtro adicional de que la naturalidad medida (genuineness) y la mezcla de vocal burst estuvieran por encima de la mediana del corpus. Este filtro es clave: el autor indica que la mediana de genuinidad cae de 0,391 en el top 10 % a 0,360 en el top 1 %, lo que demuestra que las muestras más intensas no son las más genuinas y que seleccionar solo por intensidad llevaría a un modelo sobreactuado.

Los 40 adaptadores se entrenaron con un número de filas que varía entre 2 663 (para `Sourness`) y 15 725 (para `Intoxication_Altered_States_of_Consciousness`), con tiempos de entrenamiento que oscilan entre 42 y 248 minutos. Todos los adaptadores terminaron con cero batches no finitos, lo que indica estabilidad en el entrenamiento. El código de inferencia proporcionado usa `transformers` con atención `sdpa` y precisión `bfloat16`, y carga el modelo base con los adaptadores mediante el sistema estándar de PEFT.

## Capacidades

- Síntesis de texto a voz con control emocional fino: cada adaptador empuja la emoción solicitada en un +0,047 sobre el baseline cuando se pide explícitamente.
- Independencia de la voz: los adaptadores son agnósticos al hablante, por lo que se pueden combinar con adaptadores de voz para controlar identidad y emoción por separado.
- Compatibilidad con el modelo base MOSS voice-acting v2 SFT-3, que incluye soporte para vocal bursts (risas, suspiros, etc.) y modulación de intensidad.
- Soporte de merges con pesos variables: el peso de fusión recomendado es 1,5, y se puede ajustar según la intensidad emocional solicitada.
- Compatibilidad con el pipeline de Hugging Face para text-to-speech (`pipeline_tag: text-to-speech`).
- Multilingüe limitado a inglés y alemán.
- No es un modelo de texto: no soporta tool calling, agentes ni razonamiento; es exclusivamente de síntesis de voz.

## Casos de uso

- **Doblaje de videojuegos**: permite asignar emociones específicas a cada línea de diálogo de un personaje, con control fino sobre el grado de intensidad. La combinación con adaptadores de voz permite mantener la identidad del personaje mientras se cambia el estado emocional.
- **Audiolibros y narración dramática**: los adaptadores de emoción permiten modificar el tono de la narración según el pasaje (tristeza, sorpresa, esperanza), sin necesidad de reentrenar el modelo completo.
- **Asistentes virtuales empáticos**: en aplicaciones de atención al cliente, se puede usar el adaptador `Empathy` (o `Compassion` si existe, aunque no está en la lista) para generar respuestas más cálidas y comprensivas, mejorando la experiencia del usuario.
- **Producción de contenido para redes sociales**: los creadores pueden generar voces con emociones concretas (entusiasmo, sorpresa) para vídeos cortos, manteniendo la naturalidad y evitando la sobreactuación.
- **Doblaje de series y películas**: los adaptadores de emociones específicas (ira, miedo, alegría) permiten ajustar la interpretación de un personaje en cada escena, con un control de peso para ajustar la intensidad.
- **Investigación en TTS expresivo**: el repositorio incluye `bucket.json` con metadatos de entrenamiento (filas, pasos, tiempo, hash del formato de prompt), lo que facilita la reproducibilidad y el estudio de los efectos de cada emoción.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación con 17 adaptadores comparados contra el mejor checkpoint general (SFT-3 con adaptador CFG-DPO) sobre prompts idénticos, muestreo idéntico y semilla idéntica. Cada adaptador recibió diez prompts que nombraban su emoción y diez sin ninguna mención emocional.

| Métrica | Media | Adaptadores que mejoran |
|---|---|---|
| Emoción cuando se pide | +0,047 | 11 de 17 |
| Emoción cuando no se pide | +0,033 | 12 de 17 |
| Word error rate (WER) | 0,190 vs 0,121 baseline | — |

También se realizó un barrido de peso de fusión (merge weight) sobre 31 adaptadores, 8 prompts cada uno, en la banda `extreme` con vocal bursts:

| Merge weight | Emoción | Genuineness | Burst blend | WER mediana | WER media | Error de duración |
|---|---|---|---|---|---|---|
| 0 (base) | 0,408 | 0,817 | 0,925 | 0,000 | 0,167 | 0,100 s |
| 0,25 | 0,407 | 0,844 | 0,955 | 0,000 | 0,179 | 0,100 s |
| 0,5 | 0,430 | 0,833 | 0,923 | 0,000 | 0,146 | 0,100 s |
| 1,0 | 0,441 | 0,836 | 0,954 | 0,000 | 0,130 | 0,100 s |
| **1,5** | **0,471** | 0,846 | 0,961 | **0,000** | **0,096** | 0,100 s |
| 2,0 | 0,492 | 0,880 | 0,969 | 0,030 | 0,184 | 0,100 s |

El punto de funcionamiento recomendado es un peso de fusión de 1,5, ya que maximiza la emoción y la naturalidad con el menor WER medio. En peso 2,0 se produce un incremento del WER como cola de clips completamente descarrilados, no como degradación general.

## Requisitos de hardware

- **Modelo base**: MOSS TTS local transformer de 4,55 mil millones de parámetros. En bfloat16, la VRAM estimada para el modelo base es de aproximadamente 9 GB (sin contar la memoria de trabajo adicional). Se recomienda una GPU con al menos 16 GB de VRAM para inferencia con contexto completo.
- **GPU recomendadas**: NVIDIA A100, H100, RTX 4090 o similares con soporte para bfloat16 y atención eficiente (sdpa).
- **Consumer GPU**: se puede ejecutar en RTX 3090 o 4090 con 24 GB de VRAM, pero con limitaciones de longitud de audio generado.
- **Opciones de despliegue**: el código proporcionado usa `transformers` y `torch`, por lo que se puede integrar en pipelines de HuggingFace. No se mencionan vLLM, llama.cpp ni Ollama (no es un modelo de lenguaje).
- **Latencia**: no se han publicado datos de latencia o throughput. Se recomienda generar en modo batch para mejorar el rendimiento.

## Comparativa con modelos similares

No se ha publicado una comparación directa con otros modelos TTS emocionales en la información disponible. Los adaptadores se comparan solo con el modelo base (`moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`) y con otros adaptadores de la misma familia, como los de vocal bursts (`laion/vocal-burst-lora-adapters`). El modelo base es el checkpoint SFT-3 con el adaptador CFG-DPO, que se considera el mejor general hasta la fecha. No hay datos de rendimiento frente a otros sistemas TTS como VITS, Tacotron o FastSpeech, por lo que no se puede establecer una comparativa objetiva.

## Limitaciones y advertencias

- **Sobreactuación**: los adaptadores empujan la emoción incluso cuando no se pide (ratio de selectividad de 1,4 : 1), por lo que no se debe fusionar uno permanentemente si se espera que la voz neutra sobreviva.
- **Degradación de la inteligibilidad**: el WER medio aumenta de 0,121 a 0,190 cuando se usan los adaptadores, y el peso de fusión 2,0 produce una cola de clips completamente ininteligibles.
- **Idiomas limitados**: solo se soporta inglés y alemán, por lo que no se puede usar en otros idiomas sin entrenamiento adicional.
- **Licencia**: CC BY 4.0 permite uso comercial pero requiere atribución. No se menciona si el modelo base tiene una licencia diferente, lo que podría limitar el uso conjunto.
- **Sin soporte de tool calling ni agentes**: es un modelo TTS, no un modelo de lenguaje general, por lo que no es adecuado para tareas de razonamiento o generación de código.
- **Sin datos de sesgos**: no se han publicado análisis de sesgos de género, acento o contexto cultural en la voz generada. Se recomienda evaluar antes de usar en producción.

## Enlaces

- **Hugging Face**: [laion/moss-va-sft3-emotion-loras](https://huggingface.co/laion/moss-va-sft3-emotion-loras)
- **Espacio de evaluación**: [LAION MOSS Voice-Acting Emotion LoRAs vs Baseline](https://huggingface.co/spaces/laion/moss-va-emotion-loras)
- **Manual de condicionamiento (GitHub)**: [LAION-AI/moss-voiceacting-manual](https://github.com/LAION-AI/moss-voiceacting-manual)
- **Adaptadores de vocal bursts**: [laion/vocal-burst-lora-adapters](https://huggingface.co/laion/vocal-burst-lora-adapters)
- **Página de LAION**: [https://laion.ai/](https://laion.ai/)
