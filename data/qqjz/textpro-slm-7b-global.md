# qqjz/TextPro-SLM-7B-Global

## Resumen

TextPro-SLM-7B-Global es un modelo de audio-texto desarrollado por el autor qqjz (con autores academicos Cui, Li, Tan, Zheng y King en el articulo asociado) que combina un backbone de lenguaje Qwen2.5-7B-Instruct con un codificador de voz WhisperPro derivado de Whisper large-v3. Su propuesta central es reducir el desajuste entre modalidades desde el lado de la entrada: en lugar de inyectar multiples tokens acusticos en el LLM, condensa la informacion prosodica en un unico embedding global que se antepone a los tokens del transcript. Asi, la entrada hablada se aproxima al formato nativo de un LLM de texto.

El modelo se presenta como una alternativa ligera a los speech LLM convencionales, manteniendo las capacidades semanticas del LLM de texto base mientras aprende comprension paralinguistica (prosodia, tono, emocion implicita). El checkpoint liberado corresponde a la etapa 2 del entrenamiento (paso 1272) y esta emparejado con el encoder WhisperPro; requiere la implementacion de inferencia del proyecto GitHub, que no se incluye en el repositorio de HuggingFace.

La relevancia actual reside en su enfoque de factorizacion en la entrada y en su licencia Apache-2.0, que facilita el uso comercial. No obstante, se trata de un artefacto de investigacion con soporte unicamente en ingles, audio de hasta 30 segundos y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (Qwen2.5-7B-Instruct) + proyector de prosodia + encoder WhisperPro (Whisper large-v3) |
| Parametros totales | 7B en el backbone de texto; parametros del proyector y encoder no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (LLM) |
| Tipos de cuantizacion | no disponible (pesos en BF16; el repositorio no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (llm/ y projector.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de speech LLM con factorizacion en la entrada. El audio se preprocesa en mono a 16 kHz y se procesa con el encoder WhisperPro; un proyector compacto (1280 → 3584 → 3584, activacion GELU, precision BF16) transforma la representacion acustica en un unico embedding global de prosodia. Este embedding se antepone a los tokens del transcript mediante un marcador especial `<|repo_name|>` (ID 151663) preservado en el tokenizer. El backbone Qwen2.5-7B-Instruct se ajusta completamente (full fine-tuning) para integrar esta senal.

El articulo asociado (NeurIPS 2026) estudia como reducir el desajuste entre habla y texto desde la entrada para preservar capacidades semanticas mientras se aprende comprension paralinguistica, usando aproximadamente 1.000 horas de audio de entrenamiento para los modelos del paper. El checkpoint liberado es el de etapa 2 (paso 1272) con prepending global. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni composicion exacta del dataset.

## Capacidades

- Comprension de audio hablado con salida en texto (pipeline audio-text-to-text).
- Comprension paralinguistica: prosodia, tono y caracteristicas acusticas complementarias al contenido linguistico.
- Razonamiento y generacion de texto heredados del backbone Qwen2.5-7B-Instruct.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo thinking, vision o audio de salida: no disponible; el modelo solo devuelve texto y no sintetiza voz.

## Casos de uso

- Analisis de llamadas de atencion al cliente: el modelo puede transcribir y analizar el tono y la prosodia del cliente en clips de hasta 30 segundos, permitiendo detectar frustracion o satisfaccion mas alla del contenido literal.
- Moderacion de contenido en audio: clasificacion de clips cortos por intencion y carga emocional, aprovechando la senal prosodica que se pierde en una transcripcion pura.
- Investigacion en paralinguistica computacional: banco de pruebas para estudiar como un LLM de texto integra informacion acustica global, con pesos y proyector liberados para reproducibilidad.
- Asistentes de voz de dominio acotado: integracion en pipelines donde el audio se limita a segmentos cortos y la respuesta es textual, como dictado con interpretacion de intencion.
- Analisis de entrevistas y reuniones cortas: extraccion de resumen y tono emocional de intervenciones de hasta 30 segundos, adecuado para estudios cualitativos.
- Prototipado academico de speech LLM: base para experimentos de fusion de modalidades gracias a su licencia Apache-2.0 y a la separacion entre encoder, proyector y LLM.
- Evaluacion de robustez acustica: comparacion de respuestas ante distintas condiciones de grabacion y hablantes, dado que la model card advierte variabilidad segun dominio y locutor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15,3 GB en BF16; se requiere aproximadamente 16-18 GB de VRAM para cargar los pesos en BF16, mas la memoria del encoder y del proyector.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en BF16.
- GPU de consumo: cabe en RTX 4090 y en GPUs con 24 GB o mas; en GPUs de 16 GB seria necesaria cuantizacion, no documentada por el autor.
- Opciones de despliegue: la model card indica que la inferencia requiere la implementacion del proyecto GitHub y no basta con cargar el backbone de texto; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TextPro-SLM-7B-Global | 7B (backbone) | 32.768 tokens | Audio (max. 30 s) + texto | Apache-2.0 | Checkpoint en HF; codigo de inferencia pendiente |
| Qwen2.5-7B-Instruct | 7B | 32.768 tokens (segun modelo base) | Solo texto | Apache-2.0 | Completa en HF |
| Whisper large-v3 | no disponible | no disponible | Audio | MIT (modelo original) | Completa en HF |
| WhisperPro | no disponible | no disponible | Audio | no disponible en la informacion | Emparejado con TextPro-SLM |

La comparacion con otros speech LLM de tamano similar no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Las respuestas pueden contener errores de transcripcion o alucinaciones.
- El rendimiento varia segun idioma (solo ingles), condiciones de grabacion, caracteristicas del hablante y dominio.
- El pooling global comprime la prosodia variable en el tiempo, lo que puede perder matices dinamicos.
- El modelo devuelve texto; no sintetiza voz.
- El audio de entrada esta limitado a 30 segundos en esta version; la extension de audio largo corresponde a la variante 30Plus.
- La inferencia requiere codigo externo del proyecto GitHub; el repositorio de HuggingFace solo contiene pesos y documentacion.
- No se han publicado benchmarks en la informacion disponible, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-7B-Instruct y de Whisper large-v3, cuyas condiciones deben respetarse segun LICENSE y NOTICE.

## Enlaces

- HuggingFace: https://huggingface.co/qqjz/TextPro-SLM-7B-Global
- Checkpoint emparejado WhisperPro: https://huggingface.co/qqjz/WhisperPro
- Variante 30Plus: https://huggingface.co/qqjz/TextPro-SLM-7B-30Plus
- Encoder 30Plus: https://huggingface.co/qqjz/WhisperPro-30Plus
- Paper (OpenReview): https://openreview.net/forum?id=Jsjmo8eX29
- GitHub del proyecto: https://github.com/dreamtheater123/TextPro-SLM
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
