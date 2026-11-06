# qqjz/WhisperPro

## Resumen

WhisperPro es un codificador de voz derivado de OpenAI Whisper large-v3, desarrollado por el autor qqjz (con autores academicos Cui, Li, Tan, Zheng y King en el articulo asociado) como componente de entrada del sistema TextPro-SLM. Su funcion no es solo transcribir audio, sino extraer de forma sincronizada tokens de transcripcion y caracteristicas continuas de prosodia (1280 dimensiones procedentes de la capa 16 del decodificador), de modo que un modelo de lenguaje de texto pueda procesar informacion paralinguistica que una transcripcion plana pierde.

El modelo resuelve el problema del desajuste entre modalidades (speech-text mismatch) atacandolo desde la entrada: en lugar de alinear un LLM de texto con un adaptador de audio convencional, se entrena un codificador que produce una representacion compacta (mean pooling sobre las posiciones de tokens generados validos) que el LLM emparejado, TextPro-SLM-7B-Global, puede consumir directamente. El articulo asociado reporta el uso de aproximadamente 1.000 horas de audio de entrenamiento de LLM para los modelos del paper.

La relevancia actual radica en su enfoque: demuestra que un LLM de texto puede volverse consciente de la prosodia sin cambiar su arquitectura, lo que abarata el desarrollo de sistemas de voz expresivos. El checkpoint liberado es el original (step 9092), limitado a clips de hasta 30 segundos; para audio largo existe una variante separada, WhisperPro-30Plus, basada en segmentacion. El repositorio contiene unicamente pesos y documentacion, no codigo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) con extraccion de prosodia desde la capa 16 del decodificador |
| Parametros totales | 1.609.879.040 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio de entrada de hasta 30 segundos (checkpoint original) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), con config.json, codec_config.json, generation_config.json y artefactos de tokenizer |

## Arquitectura y entrenamiento

WhisperPro reutiliza el backbone de OpenAI Whisper large-v3, un transformer encoder-decoder disenado para reconocimiento automatico de voz. Sobre esa base, el modelo se modifica para que, ademas de generar la transcripcion, exponga caracteristicas de prosodia tomadas de la capa 16 del decodificador (1280 dimensiones). Estas caracteristicas se comprimen mediante mean pooling sobre las posiciones de los tokens generados validos, produciendo una representacion compacta y sincronizada con el texto transcrito.

El articulo asociado ("Minimizing Modality Gap from the Input Side: Your Speech LLM Can Be a Prosody-Aware Text LLM", NeurIPS 2026) estudia como reducir el desajuste entre voz y texto desde la entrada para preservar las capacidades semanticas del LLM mientras se aprende comprension paralinguistica. Los modelos del paper se entrenaron con aproximadamente 1.000 horas de audio de entrenamiento de LLM. El checkpoint liberado corresponde al paso 9092 y excluye el reconstructor Mel usado solo en entrenamiento; segun el autor, esta exclusion no altera la extraccion de transcripcion ni de prosodia. No se detallan en la informacion disponible la composicion exacta del dataset, el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automatico de voz (ASR) en ingles con el backbone de Whisper large-v3.
- Extraccion simultanea de transcripcion y caracteristicas continuas de prosodia (1280 dimensiones, capa 16 del decodificador).
- Representacion compacta mediante mean pooling sobre posiciones de tokens validos, apta para consumo por un LLM de texto emparejado.
- Procesamiento de clips de audio de hasta 30 segundos en el checkpoint original.
- Integracion con TextPro-SLM-7B-Global para tareas que requieren comprension paralinguistica (tono, enfasis, ritmo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (corresponde al LLM emparejado, no al codificador).
- Capacidades multilingues: limitadas a ingles segun los metadatos del modelo.
- Modo thinking, vision o audio generativo: no disponible.

## Casos de uso

- Transcripcion enriquecida con prosodia: el modelo genera la transcripcion y, en la misma pasada, las caracteristicas prosodicas que permiten al LLM emparejado detectar enfasis, duda o entusiasmo en la voz, algo imposible con ASR convencional.
- Analisis de atencion al cliente: procesar grabaciones de llamadas de hasta 30 segundos para extraer no solo el texto sino el tono del cliente, alimentando sistemas de deteccion de insatisfaccion o escalado automatico.
- Investigacion en speech LLMs: servir como codificador de referencia para experimentos sobre reduccion del desajuste de modalidad, al estar emparejado con un LLM de 7B y acompanado de paper y repositorio.
- Evaluacion de expresividad en doblaje y locucion: comparar caracteristicas prosodicas entre segmentos de audio para medir consistencia emocional o ritmica en producciones de voz.
- Preprocesado para pipelines de subtitulado con informacion paralinguistica: generar subtitulos que el LLM posterior pueda anotar con marcas de enfasis o emocion basadas en la prosodia extraida.
- Prototipado de asistentes de voz expresivos: usar el par WhisperPro + TextPro-SLM-7B-Global como base para asistentes que respondan de forma adecuada al tono del usuario, no solo al contenido literal.
- Analisis de entrevistas o focus groups: segmentar el audio en clips de 30 segundos y extraer prosodia para estudios cualitativos asistidos por LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que documenta el artefacto liberado y no introduce nuevas mediciones de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1.610 millones de parametros, en fp16 requiere aproximadamente 3,2 GB solo para pesos; con overhead de activaciones y cache, se estiman entre 5 y 8 GB en fp16. En cuantizacion de 8 bits, alrededor de 2 GB de pesos; en 4 bits, en torno a 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 o H100 para despliegues de produccion con alto throughput; RTX 4090, RTX 3090 o RTX A6000 para desarrollo e inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores); en cuantizacion de 8 bits podria caber en GPUs de 4-6 GB, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers (libreria declarada). No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI. La inferencia consciente de prosodia requiere la implementacion del repositorio de GitHub, no incluida en el checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| WhisperPro (qqjz) | 1.610 M | 30 s por clip | Ingles | Apache-2.0 | Anade prosodia de 1280 dimensiones sobre Whisper large-v3; requiere LLM emparejado |
| openai/whisper-large-v3 | 1.550 M | 30 s por clip | Multilingue | Apache-2.0 | ASR estandar sin salida de prosodia; referencia base del anterior |
| WhisperPro-30Plus (qqjz) | No disponible | Audio largo por segmentacion | Ingles | Apache-2.0 (segun familia) | Variante para audio largo; sujeta a efectos de segmentacion |

La comparacion con otros codificadores de voz con prosodia (por ejemplo, variantes de speech LLM con adaptadores) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint original solo admite clips de hasta 30 segundos; para audio mas largo debe usarse WhisperPro-30Plus, con las limitaciones propias de la segmentacion.
- Los errores de transcripcion y los cambios de idioma o de condiciones de grabacion afectan a las caracteristicas extraidas.
- El mean pooling compacto comprime la prosodia variable en el tiempo, perdiendo granularidad temporal.
- El modelo solo declara soporte de ingles; el rendimiento en otros idiomas no esta garantizado.
- El repositorio contiene unicamente pesos y documentacion; el codigo de inferencia y las dependencias se publican por separado en GitHub, y la inferencia consciente de prosodia no funciona cargando solo el backbone de texto.
- No se han publicado benchmarks en la informacion disponible, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Riesgo de alucinacion en la transcripcion: inherente a los modelos Whisper, especialmente en audio con ruido o acentos no vistos.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Whisper large-v3, hereda los sesgos del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse el LICENSE y el NOTICE del repositorio, incluida la atribucion a OpenAI Whisper large-v3.
- La fecha de creacion del repositorio (2026-10-29) y el bajo numero de descargas (14) sugieren un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qqjz/WhisperPro
- Modelo emparejado TextPro-SLM-7B-Global: https://huggingface.co/qqjz/TextPro-SLM-7B-Global
- Variante de audio largo WhisperPro-30Plus: https://huggingface.co/qqjz/WhisperPro-30Plus
- Modelo base OpenAI Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
- Paper (OpenReview): https://openreview.net/forum?id=Jsjmo8eX29
- Repositorio GitHub del proyecto: https://github.com/dreamtheater123/TextPro-SLM
