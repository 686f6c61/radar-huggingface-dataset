# qqjz/TextPro-SLM-3B-Global

## Resumen

TextPro-SLM-3B-Global es un modelo de lenguaje de voz (speech LLM) desarrollado por el autor qqjz que combina el backbone de texto Qwen2.5-3B-Instruct, completamente afinado, con el encoder de voz WhisperPro. Su propuesta central es reducir la brecha de modalidad desde el lado de la entrada: en lugar de inyectar representaciones acústicas densas en el espacio del LLM, el modelo recibe la transcripción como tokens de texto nativos y añade un unico vector global de prosodia antepuesto a la secuencia. Asi, el LLM conserva sus capacidades semanticas y aprende comprension paralinguistica con aproximadamente 1.000 horas de audio de entrenamiento.

El checkpoint publicado corresponde a la etapa 2 del entrenamiento (paso 1272) en la variante "global prepending", emparejado con el encoder original WhisperPro. Acepta clips de audio de hasta 30 segundos en mono a 16 kHz y devuelve respuestas en texto. El backbone mantiene la ventana de contexto de 32.768 tokens de Qwen2.5-3B-Instruct, y el modelo esta pensado para investigacion sobre comprension de prosodia y paralinguistica en entornos controlados.

Es relevante ahora porque propone una factorizacion de la entrada poco habitual en los speech LLM: separar contenido linguistico (transcripcion) de informacion acustica complementaria (prosodia) en lugar de fusionar ambas en una unica secuencia de embeddings. El modelo se distribuye con licencia Qwen Research, lo que restringe el uso comercial, y su codigo de inferencia se publica por separado en el repositorio de GitHub del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (Qwen2.5-3B-Instruct) + encoder de voz WhisperPro + proyector MLP |
| Parametros totales | 3B (backbone de texto); parametros del proyector no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (LLM); audio de entrada de hasta 30 segundos |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16) |
| Idiomas soportados | en |
| Licencia | qwen-research (hereda de Qwen2.5-3B-Instruct; uso comercial requiere licencia aparte de Alibaba Cloud) |
| Formato de pesos | safetensors (llm/ y projector.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de speech LLM con tres componentes: un backbone de texto Qwen2.5-3B-Instruct completamente afinado, un encoder de voz WhisperPro del que se extraen caracteristicas de prosodia de la capa 16 del decoder, y un proyector MLP con dimensiones 1280 → 2048 → 2048, activacion GELU y precision BF16. La fusion se realiza mediante "global prepending": un unico vector global de prosodia se antepone a los tokens de la transcripcion, de modo que el LLM procesa la transcripcion como texto nativo enriquecido con una senal acustica compacta. El marcador de prosodia entrenado es el token `<|repo_name|>` (ID 151663).

El entrenamiento se realizo con aproximadamente 1.000 horas de audio para la fase del LLM, segun indica la model card, y el checkpoint publicado corresponde a la etapa 2 (paso 1272). No se detalla en la informacion disponible la composicion exacta del dataset, el uso de RLHF/DPO ni el numero total de tokens de texto. La innovacion tecnica principal es la factorizacion de la entrada: al mantener la transcripcion en el espacio de tokens del LLM, se preservan las capacidades semanticas del backbone mientras se aprende representacion paralinguistica a traves del vector de prosodia. El modelo emparejado WhisperPro deriva de OpenAI Whisper large-v3 y se distribuye con licencia Apache-2.0.

## Capacidades

- Comprension de audio y respuesta en texto (pipeline audio-text-to-text) para clips de hasta 30 segundos.
- Comprension de prosodia y paralinguistica: el vector global codifica informacion acustica complementaria a la transcripcion.
- Razonamiento y generacion de texto heredados del backbone Qwen2.5-3B-Instruct.
- Capacidades multilingues limitadas al ingles segun la model card (language: en).
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio de salida ni modo thinking explicito.
- Salida exclusivamente en texto; no sintetiza voz.

## Casos de uso

- Investigacion en comprension paralinguistica: analisis de como el tono, la energia o el ritmo del habla modulan la respuesta del modelo en tareas controladas de laboratorio, aprovechando la separacion entre transcripcion y prosodia.
- Clasificacion y respuesta a emociones en el habla: dado un clip corto, el modelo puede responder preguntas sobre el estado emocional del hablante combinando el contenido de la transcripcion con el vector de prosodia.
- Asistentes de voz de turno corto en prototipos de investigacion: integracion en demos academicas donde las intervenciones no superan los 30 segundos y se requiere una respuesta textual.
- Analisis de llamadas o reuniones cortas: extraccion de resumenes o respuestas a preguntas sobre fragmentos de audio de hasta 30 segundos, con la ventaja de que el LLM subyacente mantiene su contexto de 32.768 tokens para el texto.
- Evaluacion comparativa de estrategias de fusion audio-texto: el checkpoint sirve como referencia para comparar "global prepending" frente a "interleaving" (variante 7B-Interleaving) en experimentos reproducibles.
- Base para fine-tuning en dominios especificos: al heredar Qwen2.5-3B-Instruct, puede adaptarse a tareas de dominio con audio corto, siempre respetando la licencia de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comprobaciones realizadas son de equivalencia de artefactos (hashes de parametros, proyecciones con entradas sinteticas, logits de siguiente token y generacion con semilla fija) y no nuevas mediciones de benchmarks. Los resultados de evaluacion se describen en el paper asociado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repositorio (6,2 GB) y un backbone de 3B en BF16, se estima un consumo en torno a 6-8 GB solo para pesos, mas memoria para el encoder WhisperPro y el proyector.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU con 16 GB o mas (RTX 4090, A100, H100) deberia ser suficiente para inferencia en BF16.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 16 GB o mas, aunque no se confirma en la documentacion.
- Opciones de despliegue: el codigo de inferencia, dependencias y ejemplos se publican por separado en el repositorio de GitHub del proyecto; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TextPro-SLM-3B-Global | 3B | 32.768 tokens; audio <= 30 s | Entrada de voz, salida texto | qwen-research | HuggingFace (qqjz) |
| TextPro-SLM-7B-Global | 7B | no disponible en la informacion | Entrada de voz, salida texto | no disponible en la informacion | HuggingFace (qqjz) |
| TextPro-SLM-7B-Interleaving | 7B | no disponible en la informacion | Entrada de voz, salida texto (fusion 5:1) | no disponible en la informacion | HuggingFace (qqjz) |
| TextPro-SLM-7B-30Plus | 7B | audio segmentado de larga duracion | Entrada de voz, salida texto | no disponible en la informacion | HuggingFace (qqjz) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Los errores de transcripcion pueden propagarse a la respuesta final, ya que el contenido linguistico depende del texto transcrito.
- El rendimiento puede variar segun el idioma, las condiciones de grabacion, las caracteristicas del hablante y el dominio; el modelo solo declara soporte de ingles.
- El pooling de prosodia comprime el detalle temporal, por lo que se pierde informacion acustica fina.
- Las respuestas generadas pueden contener alucinaciones.
- La entrada de audio esta limitada a 30 segundos; la extension para audio largo requiere los checkpoints 30Plus, que son artefactos separados.
- El modelo devuelve texto, no voz sintetizada.
- Licencia qwen-research: el uso comercial requiere una licencia separada de Alibaba Cloud; el permiso upstream cubre investigacion y evaluacion no comerciales.
- Cargar unicamente el backbone de texto no realiza inferencia de voz con prosodia; es necesario el proyector y la configuracion de fusion de `textpro_config.json`.
- No se documentan sesgos especificos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qqjz/TextPro-SLM-3B-Global
- Paper (OpenReview): https://openreview.net/forum?id=Jsjmo8eX29
- Repositorio GitHub del proyecto: https://github.com/dreamtheater123/TextPro-SLM
- Encoder emparejado WhisperPro: https://huggingface.co/qqjz/WhisperPro
- Encoder WhisperPro-30Plus: https://huggingface.co/qqjz/WhisperPro-30Plus
- Variante TextPro-SLM-7B-Global: https://huggingface.co/qqjz/TextPro-SLM-7B-Global
- Variante TextPro-SLM-7B-Interleaving: https://huggingface.co/qqjz/TextPro-SLM-7B-Interleaving
- Variante TextPro-SLM-7B-30Plus: https://huggingface.co/qqjz/TextPro-SLM-7B-30Plus
- Licencia: https://huggingface.co/qqjz/TextPro-SLM-3B-Global/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
