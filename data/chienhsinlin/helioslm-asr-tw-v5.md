# chienhsinlin/helioslm-asr-tw-v5

## Resumen

HeliosLM ASR TW v5 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario chienhsinlin, derivado mediante ajuste fino de openai/whisper-large-v3. Está especializado en dos variedades lingüísticas de Taiwán: mandarín taiwanés con salida en chino tradicional y hokkien taiwanés (min nan) con salida en caracteres han. El modelo forma parte del ecosistema HeliosLM (羲和), donde actúa como componente de voz del modelo conversacional helioslm-chat-e4b.

La arquitectura es la de Whisper large-v3, un transformer encoder-decoder con aproximadamente 1.543 millones de parámetros (1,55B), por lo que hereda la ventana de contexto de audio de 30 segundos por fragmento y el vocabulario multilingüe del modelo base. El ajuste fino se realizó durante una única época sobre datos públicos (Common Voice 27.0, FLEURS y AISHELL-1), seguido de una fusión lineal con los pesos originales en proporción 0,85/0,15 para preservar capacidades generales y mitigar el olvido catastrófico.

Su relevancia radica en que cubre una combinación lingüística poco atendida por los modelos ASR mayoritarios: el hokkien taiwanés, donde el modelo base falla estrepitosamente, y el mandarín con salida en chino tradicional, donde la mejora frente a Whisper large-v3 es sustancial. La licencia Apache-2.0 facilita su adopción comercial, aunque el rendimiento en hokkien sigue siendo limitado y el modelo no genera romanización Tâi-lô.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1.543.490.560 (aprox. 1,55B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por fragmento (ventana nativa de Whisper); procesamiento de audio largo mediante chunking |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp32/fp16; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | zh (mandarín taiwanés, salida en chino tradicional), nan (hokkien taiwanés, salida en caracteres han) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo reutiliza íntegramente la topología de Whisper large-v3: un encoder convolucional más transformer que procesa espectrogramas mel de 128 canales y un decoder autorregresivo con atención cruzada, entrenado originalmente por OpenAI sobre 680.000 horas de audio supervisado y 5 millones de horas de audio débilmente etiquetado. El ajuste fino de HeliosLM ASR TW v5 se limita a una época con tasa de aprendizaje 7e-6 y 4.776 pasos, sobre un corpus compuesto exclusivamente por datos públicos: Mozilla Common Voice 27.0 en sus configuraciones zh-TW y nan-tw (con exclusión de las frases y hablantes de test para evitar contaminación), FLEURS cmn_hans_cn en train/dev con transcripciones convertidas a chino tradicional mediante OpenCC, y el subconjunto de entrenamiento de AISHELL-1.

La innovación técnica destacable no reside en la arquitectura sino en la estrategia de consolidación de pesos: tras el ajuste fino, los pesos resultantes se fusionaron linealmente con los del modelo base (0,85 × ajustado + 0,15 × whisper-large-v3). Esta interpolación actúa como regularizador y explica que el modelo conserve un rendimiento cercano al base en FLEURS (7,33 frente a 7,54 de CER) mientras mejora de forma drástica en los dominios específicos. No se documenta el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Transcripción de voz a texto en mandarín taiwanés con salida en chino tradicional.
- Transcripción de hokkien taiwanés con salida exclusiva en caracteres han (sin romanización Tâi-lô).
- Procesamiento de audio largo mediante fragmentación en ventanas de 30 segundos (`chunk_length_s=30` en el pipeline de transformers).
- Detección y transcripción de segmentos con marcas temporales a nivel de fragmento (capacidad heredada de Whisper).
- Soporte de `generate_kwargs` para forzar idioma (`language="zh"`) y tarea (`task="transcribe"`).
- No soporta tool calling ni function calling: es un modelo puramente ASR.
- No dispone de modo de razonamiento, agentes multi-paso, visión ni audio generativo.
- Capacidad multilingüe limitada a los dos idiomas ajustados; el resto de idiomas de Whisper large-v3 no se han evaluado tras el ajuste y pueden haberse degradado.

## Casos de uso

- Subtitulado automático de contenido audiovisual taiwanés: el modelo transcribe programas, entrevistas y pódcast en mandarín taiwanés con salida directa en chino tradicional, evitando la conversión posterior desde simplificado que exigirían otros ASR.
- Archivado y búsqueda de material en hokkien taiwanés: aunque el CER es alto (38,15 en caracteres han), permite indexar grabaciones históricas o culturales en esta lengua, una tarea prácticamente inviable con Whisper large-v3 (CER 231,13).
- Transcripción de reuniones y actas en entornos corporativos taiwaneses: el CER de 5,10 en Common Voice zh-TW lo hace adecuado para documentación interna, con verificación humana en contenido crítico.
- Generación de conjuntos de datos de voz etiquetados: sirve como anotador automático para proyectos de investigación en lingüística computacional del min nan, dado que su licencia Apache-2.0 permite redistribuir las transcripciones derivadas.
- Integración en asistentes conversacionales de voz: como componente ASR del ecosistema HeliosLM, se puede encadenar con helioslm-chat-e4b para construir un pipeline de voz a voz en mandarín taiwanés.
- Accesibilidad para hablantes de hokkien: generación de transcripciones en caracteres han para vídeos divulgativos o educativos dirigidos a comunidades taiwanesas, con revisión posterior por hablantes nativos.
- Evaluación comparativa de ASR de bajo recurso: el modelo sirve como referencia reproducible para investigar técnicas de ajuste fino con fusión de pesos en lenguas de bajos recursos.

## Benchmarks y rendimiento

Resultados autoevaluados por el autor el 2026-11-05, decodificación greedy, mismas grabaciones para ambos modelos. Métrica: tasa de error de caracteres (CER, %, menor es mejor).

| Conjunto de prueba | Clips | HeliosLM ASR TW v5 | whisper-large-v3 (base) |
|---|---|---|---|
| Common Voice 27.0 zh-TW test | 998 | 5,10 | 15,25 |
| FLEURS cmn test (referencias en chino tradicional) | 945 | 7,33 | 7,54 |
| Common Voice 27.0 nan-tw test, caracteres han | 1.000 | 38,15 | 231,13 |
| Common Voice 27.0 nan-tw test, transcripciones crudas (incluye romanización) | 1.000 | 86,29 | 121,57 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es de propósito general. No se dispone de comparaciones con otros ASR especializados en chino taiwanés o min nan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB de pesos más memoria de activaciones y buffers de atención; en la práctica, entre 4 y 6 GB para lotes pequeños con `chunk_length_s=30`.
- VRAM estimada en fp32: alrededor de 6,2 GB solo de pesos, más activaciones; se recomienda fp16 o bf16.
- GPU recomendadas: NVIDIA A100, H100 o L40S para procesamiento por lotes de alto volumen; RTX 4090, RTX 3090, RTX A6000 para despliegue de producción en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores; también en GPUs de 8 GB con fp16 y lotes pequeños.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de transformers (soporte oficial), servidores compatibles con la API de transformers, TGI si se convierte el modelo a un formato soportado, y ONNX Runtime mediante exportación manual (no documentada oficialmente). No se publican pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la duración del audio, con un coste aproximado proporcional al número de fragmentos de 30 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas objetivo | CER zh-TW (CV 27) | CER nan-tw (CV 27, han) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HeliosLM ASR TW v5 | 1,55B | zh-TW, nan | 5,10 | 38,15 | Apache-2.0 | Hugging Face (transformers) |
| openai/whisper-large-v3 | 1,55B | 99 idiomas (incl. zh, nan no especializado) | 15,25 | 231,13 | Apache-2.0 | Hugging Face, múltiples runtimes |
| Whisper large-v3-turbo | 809M | 99 idiomas | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Otros ASR especializados en chino taiwanés | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con Whisper large-v3 es la más significativa: HeliosLM reduce el CER en zh-TW en más de 10 puntos absolutos y en nan-tw en casi 193 puntos, a costa de un ligero empeoramiento en FLEURS (0,21 puntos). No se dispone de datos sobre alternativas especializadas en min nan (por ejemplo, variantes de Whisper ajustadas por la comunidad) en la información proporcionada, por lo que no se puede establecer una comparativa completa.

## Limitaciones y advertencias

- El hokkien taiwanés sigue siendo un punto débil: CER de 38,15 en caracteres han y de 86,29 en transcripciones crudas, muy por encima de los umbrales habituales para producción sin revisión humana.
- El modelo solo emite caracteres han para hokkien; no genera romanización Tâi-lô, lo que limita su uso en proyectos de documentación lingüística que requieran notación fonética.
- Riesgo de alucinación y errores de transcripción: el autor advierte explícitamente de que el modelo puede equivocarse y recomienda verificar transcripciones importantes.
- Sesgos derivados del corpus de entrenamiento: Common Voice, FLEURS y AISHELL-1 sobrerrepresentan determinados registros, acentos y condiciones de grabación; el rendimiento en audio ruidoso, llamadas telefónicas o habla espontánea no se ha evaluado.
- El ajuste fino se realizó con una sola época y fusión de pesos; no se documentan evaluaciones de robustez frente a dominio fuera de distribución.
- Al estar ajustado solo en zh-TW y nan, el rendimiento en otros idiomas de Whisper large-v3 puede haberse degradado y no se ha medido.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y atribuir correctamente al modelo base de OpenAI y al autor del ajuste.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación independiente por parte de la comunidad.
- Los benchmarks son autoevaluados por el autor; no se han replicado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chienhsinlin/helioslm-asr-tw-v5
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Modelo conversacional del mismo ecosistema: https://huggingface.co/chienhsinlin/helioslm-chat-e4b
- Mozilla Common Voice: https://commonvoice.mozilla.org/
- Google FLEURS: https://huggingface.co/datasets/google/fleurs
- AISHELL-1: https://www.openslr.org/33/
- OpenCC (conversión de chino simplificado a tradicional): https://github.com/BYVoid/OpenCC
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
