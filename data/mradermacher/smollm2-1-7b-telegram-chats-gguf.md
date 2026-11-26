# mradermacher/SmolLM2-1.7B-telegram-chats-GGUF

## Resumen

SmolLM2-1.7B-telegram-chats-GGUF es una coleccion de cuantizaciones GGUF del modelo Offlin33er/SmolLM2-1.7B-telegram-chats, un ajuste fino supervisado (SFT) de SmolLM2-1.7B orientado a reproducir el estilo de conversacion de chats de Telegram. El modelo original fue entrenado con TRL sobre el dataset sintetico Offlin33er/telegram-chat-export-synthetic, y esta version la publica mradermacher, especialista en generar cuantizaciones estaticas de modelos abiertos para su uso con llama.cpp y derivados.

El modelo parte de SmolLM2-1.7B, un transformer decoder-only de 1.711.376.384 parametros (aproximadamente 1,7 mil millones) desarrollado originalmente por Hugging Face. La relevancia de esta ficha es practica: el repositorio GGUF permite ejecutar el ajuste fino en hardware de consumo con un rango de cuantizaciones que va desde Q2_K (0,8 GB) hasta f16 (3,5 GB), lo que lo hace accesible para prototipos de asistentes conversacionales ligeros.

No se dispone de informacion publica sobre la longitud de contexto efectiva del ajuste fino, los detalles del dataset sintetico ni resultados de evaluacion. La model card del repositorio GGUF es una plantilla estandar de mradermacher centrada en la lista de cuantizaciones y no aporta datos de entrenamiento adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B) |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2-1.7B, un transformer decoder-only con atencion causal. El modelo ha sido sometido a un ajuste fino supervisado (SFT) mediante TRL, segun las etiquetas del repositorio, sobre el dataset Offlin33er/telegram-chat-export-synthetic, de naturaleza sintetica y orientado a conversaciones con el formato y el registro de Telegram. El entrenamiento se ejecuto en infraestructura HF Jobs, segun los metadatos del autor.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF o DPO, ni innovaciones tecnicas adicionales. Las cuantizaciones publicadas por mradermacher son estaticas (no ponderadas por imatrix); el propio autor indica que las variantes con imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, con estilo ajustado a chats de Telegram.
- Respuesta multi-turno en formato de conversacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Cobertura multilingue limitada al ingles segun la etiqueta de idioma del repositorio.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado de bots de Telegram: el ajuste fino imita el registro de conversaciones de Telegram, por lo que sirve para generar respuestas con un tono coherente con la plataforma antes de conectar el bot a la API real.
- Generacion de datos sinteticos de conversacion: util para crear corpus de entrenamiento o de evaluacion con formato de chat estilo Telegram en ingles.
- Pruebas de integracion con llama.cpp: las cuantizaciones Q4_K_M (1,2 GB) y Q8_0 (1,9 GB) permiten validar pipelines de inferencia local en portatiles sin GPU dedicada.
- Asistente conversacional offline: con Q4_K_S o Q4_K_M cabe en GPUs de consumo y en CPU con RAM suficiente, adecuado para demos y entornos sin conectividad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes del mismo modelo, lo que facilita medir el impacto de la cuantizacion en perplejidad y calidad conversacional.
- Filtrado y clasificacion de mensajes de chat: el modelo puede usarse como base para tareas de etiquetado de conversaciones en ingles, siempre con validacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,8 GB (Q2_K) y 3,5 GB (f16); las variantes recomendadas Q4_K_M y Q8_0 requieren aproximadamente 1,2 GB y 1,9 GB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones pequenas; RTX 3060, RTX 4060, RTX 4090 y A100 son sobredimensionadas para este tamano y solo aportan velocidad.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; el repositorio esta etiquetado como compatible con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-1.7B-telegram-chats (este) | 1,71 B | no disponible | Apache 2.0 | GGUF | Ajuste fino conversacional estilo Telegram, solo ingles |
| SmolLM2-1.7B (base) | 1,71 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista de Hugging Face sin ajuste conversacional |
| Qwen2.5-1.5B | 1,54 B | no disponible | Apache 2.0 | safetensors, GGUF | Alternativa multilingue de tamano comparable |
| Llama-3.2-1B | 1,24 B | no disponible | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta con licencia mas restrictiva |

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles segun la etiqueta de idioma; el rendimiento en castellano no esta garantizado.
- El dataset de entrenamiento es sintetico, lo que puede introducir artefactos y patrones repetitivos en las respuestas.
- Riesgo de alucinacion inherente a un modelo de 1,7 mil millones de parametros; no es adecuado para tareas que requieran precision factual sin verificacion.
- No se han publicado evaluaciones de sesgo, toxicidad ni seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el ajuste fino hereda las limitaciones del modelo base SmolLM2.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay informacion sobre la longitud de contexto efectiva tras el ajuste fino; conviene validarla antes de desplegar conversaciones largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SmolLM2-1.7B-telegram-chats-GGUF
- Modelo base del ajuste: https://huggingface.co/Offlin33er/SmolLM2-1.7B-telegram-chats
- Dataset de entrenamiento: https://huggingface.co/datasets/Offlin33er/telegram-chat-export-synthetic
- Panel de entrenamiento (Trackio): https://Offlin33er-smollm2-telegram-chat-sft-trackio.hf.space?project=smollm2-telegram-chat-sft&runs=Offlin33er-1789556763&sidebar=collapsed
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#SmolLM2-1.7B-telegram-chats-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
