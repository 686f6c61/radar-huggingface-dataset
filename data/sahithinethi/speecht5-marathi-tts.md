# Sahithinethi/speecht5-marathi-tts

## Resumen

`Sahithinethi/speecht5-marathi-tts` es un modelo de síntesis de voz (text-to-speech) en maratí, desarrollado por Sahithi Nethi como un fine-tune experimental del modelo base `microsoft/speecht5_tts`. El modelo está pensado para resolver la falta de voces de alta calidad en maratí (devanagari) dentro del ecosistema de Hugging Face, ampliando el vocabulario original del tokenizador (solo inglés) con 66 tokens nuevos que incluyen caracteres devanagari y un token especial de límite de palabra. Con 144,48 millones de parámetros y un pipeline de generación basado en el vocoder HiFi-GAN, el modelo pretende ofrecer una voz femenina única para maratí, pero su entrenamiento fue extremadamente limitado: solo 300 pasos en CPU (~1.200 muestras vistas), lo que lo deja en un estado "undertrained" y poco fiable para uso práctico.

La relevancia actual de este modelo radica en su naturaleza de artefacto de pipeline: demuestra cómo adaptar SpeechT5 a un idioma indio de bajo recurso, pero no es un producto terminado. El autor advierte explícitamente que el checkpoint no ha convergido, produce silencio en entradas cortas y puede fallar en entradas largas. Aun así, sirve como referencia para desarrolladores que quieran replicar el proceso de fine-tuning con más recursos (por ejemplo, una GPU T4 con ~3.000 pasos). El modelo está disponible en Hugging Face con licencia MIT, pero el dataset de entrenamiento (`SPRINGLab/IndicTTS_Marathi`) no declara licencia, lo que limita su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5 (transformer encoder-decoder con vocoder HiFi-GAN) |
| Parametros totales | 144.483.042 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (TTS, entrada de texto) |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | maratí (mr) |
| Licencia | MIT (modelo), dataset sin licencia declarada |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SpeechT5, un sistema de texto-audio que combina un encoder-decoder transformer con un vocoder HiFi-GAN para generar espectrogramas mel y convertirlos en audio. El checkpoint base `microsoft/speecht5_tts` fue diseñado para inglés, con un tokenizador SentencePiece de 81 tokens. Para adaptarlo a maratí, se amplió el vocabulario a 145 tokens, añadiendo 66 tokens nuevos: 63 caracteres Devanagari, un token `<sp>` (id 144) para marcar límites de palabra, y dos dígitos. El token `<sp>` se inicializó a partir de la embedding del token `▁` del modelo original para preservar el significado de "inicio de palabra".

El entrenamiento se realizó sobre el corpus `SPRINGLab/IndicTTS_Marathi`, con una única hablante femenina a 16 kHz y clips limitados a 6 segundos. Se usaron 300 pasos en CPU con batch size 4, learning rate 1e-4 con schedule lineal, warmup de 40 pasos, precisión fp32 y sin gradient checkpointing. En total se vieron aproximadamente 1.200 muestras, muy lejos de la convergencia. El autor indica que un entrenamiento adecuado requeriría unos 3.000 pasos en GPU (unas 24.000 muestras), lo que supone un factor 20 más de datos.

## Capacidades

- Síntesis de voz en maratí (devanagari) para textos largos, con amplitud de onda de 0.47–0.79 y mel std de 3.3–4.2 en entradas largas, valores saludables.
- Entrada restringida a texto Devanagari: caracteres latinos, dígitos y puntuación son eliminados por la función `prepare()` del autor.
- No soporta control de voz múltiple: usa un único embedding de hablante fijo (x-vector de 512-d) cargado desde `speaker_embedding.npy`.
- No tiene soporte de tool calling, razonamiento o agentes; es un modelo TTS puro.
- Capacidad multilingüe limitada a maratí; no procesa otros idiomas indios ni latinos.

## Casos de uso

- Investigación en TTS para idiomas de bajo recurso: sirve como base para estudiar la adaptación de SpeechT5 a scripts no latinos, especialmente la gestión de límites de palabra con tokens explícitos como `<sp>`.
- Desarrollo de pipelines de fine-tuning: permite replicar el proceso completo (preparación de datos, tokenización, entrenamiento) en un entorno de CPU, útil para prototipos antes de escalar a GPU.
- Generación de voz para maratí en entornos de baja exigencia: puede producir audio para frases largas (más de 30 tokens) con calidad aceptable, aunque con riesgo de silencio intermitente; no apto para producción.
- Pruebas de evaluación de calidad de voz: los usuarios pueden verificar la salida con métricas como amplitud y mel std, como se hace en el modelo card.
- Formación en fine-tuning de modelos de voz: sirve como ejemplo didáctico de cómo extender un tokenizador y entrenar un modelo TTS con recursos limitados.
- Integración en sistemas de accesibilidad para lectura de textos maratíes largos (por ejemplo, artículos de noticias), siempre que se verifique manualmente la salida para evitar silencios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que el entrenamiento midió CER/WER mediante ASR round-trip y una distancia mel-cepstral DTW contra la verdad de campo, pero esos datos no están incluidos en el repositorio. Solo se reportan mediciones post-hoc de amplitud y mel std, que no constituyen benchmarks estándar.

## Requisitos de hardware

- Inferencia en CPU es suficiente: el autor indica que generar unos segundos de voz tarda uno o dos segundos en CPU, sin necesidad de GPU.
- VRAM estimada: no aplica para inferencia en CPU; en GPU no se requiere más de 2–3 GB para el modelo (144 M parámetros en fp32).
- GPU recomendada para entrenamiento: una T4 con ~3.000 pasos y batch size 8 es el objetivo del autor para un modelo convergido.
- Opciones de despliegue: se puede usar con la librería `transformers` directamente en Python, o exportar a formato ONNX para inferencia en servidores. No se mencionan integraciones con vLLM, llama.cpp u Ollama, que son para LLMs, no para TTS.
- Latencia: en CPU, la generación de audio es de ~1–2 segundos para frases largas, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| `Sahithinethi/speecht5-marathi-tts` | 144,48 M | no aplica | maratí | MIT | Undertrained, experimental |
| `Patil/SpeechT5_tts_marathi` | no disponible | no aplica | maratí | no disponible | Similar fine-tune de SpeechT5, pero sin documentación de calidad |
| `facebook/mms-tts-mar` | no disponible | no aplica | maratí | CC-BY-NC | Referencia de voz maratí de Meta, usado como comparativa en el modelo card |

No hay datos numéricos de comparación (CER/WER) en la información disponible para estos modelos, por lo que no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- **Undertrained**: el modelo no ha convergido; entradas cortas (menos de ~30 tokens) producen silencio digital de forma fiable, y entradas de 30–70 tokens pueden ser silenciosas de forma intermitente.
- **Sesgo de hablante**: entrenado con una única hablante femenina y un x-vector fijo; no es posible cambiar de voz de forma controlada.
- **Entrada restringida**: solo Devanagari; se eliminan caracteres latinos, dígitos y puntuación durante la preparación.
- **Riesgo de alucinación**: aunque no es un modelo de texto, puede producir audio sin relación con la entrada en casos de fallo (silencio o ruido).
- **Licencia del dataset**: el corpus `SPRINGLab/IndicTTS_Marathi` no declara licencia en el Hub, lo que puede impedir el uso comercial del modelo entrenado con él.
- **Recomendación de producción**: no es apto para entornos de producción sin un reentrenamiento completo con más datos y pasos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sahithinethi/speecht5-marathi-tts
- Página del modelo en AIBase: https://model.aibase.com/models/details/1915693364386881537
- Modelo base `microsoft/speecht5_tts`: https://huggingface.co/microsoft/speecht5_tts
- Dataset `SPRINGLab/IndicTTS_Marathi`: https://huggingface.co/datasets/SPRINGLab/IndicTTS_Marathi
- Modelo similar `Patil/SpeechT5_tts_marathi`: https://huggingface.co/Patil/SpeechT5_tts_marathi
- Referencia de voz `facebook/mms-tts-mar`: https://huggingface.co/facebook/mms-tts-mar
