# liodon-ai/clio-v1-legacy-FP8

## Resumen
clio-v1-legacy-FP8 es una version cuantizada en FP8 del modelo NovelAI/clio-v1-legacy, publicada por el colectivo Liodon AI. No se trata de un modelo entrenado desde cero, sino de una receta de compresion post-entrenamiento que reduce el peso del repositorio original de 6,4 GB a 3,4 GB manteniendo la misma arquitectura y el mismo comportamiento numerico del modelo fuente. El resultado es un checkpoint de 3.043.786.240 parametros (aproximadamente 3,04 B) listo para inferencia de generacion de texto.

El modelo base pertenece a la familia Clio de NovelAI, orientada a generacion de texto creativo, narrativa y roleplay. La etiqueta de arquitectura incluida en el repositorio remite a stablelm, lo que situa el backbone en la familia StableLM, aunque la model card no detalla la configuracion exacta de capas ni la ventana de contexto.

La relevancia de esta publicacion es practica: permite desplegar un modelo de ~3 B en FP8 sobre GPUs Ada, Hopper o Blackwell con la mitad de memoria y sin sesgo de calibracion, ya que el esquema FP8_DYNAMIC no requiere dataset de calibracion. El modelo acumula 0 descargas y 0 likes en el momento de la ficha, y su licencia se hereda del modelo base como "other".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StableLM (segun tag del repositorio); transformer de generacion de texto |
| Parametros totales | 3.043.786.240 (aproximadamente 3,04 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 (E4M3) con esquema FP8_DYNAMIC: pesos en FP8 por canal, activaciones cuantizadas dinamicamente por token; lm_head sin cuantizar |
| Idiomas soportados | no disponible en los metadatos; el modelo base esta orientado a texto en ingles |
| Licencia | other (heredada de NovelAI/clio-v1-legacy) |
| Formato de pesos | safetensors, compatible con compressed-tensors |
| Relacion con el modelo base | quantized (base_model: NovelAI/clio-v1-legacy) |
| Tamano del repositorio | 3,4 GB (frente a 6,4 GB del modelo original) |
| Libreria | transformers |

## Arquitectura y entrenamiento
El checkpoint es el resultado de aplicar cuantizacion post-entrenamiento con la herramienta llm-compressor sobre NovelAI/clio-v1-legacy. Se emplea el esquema FP8_DYNAMIC: los pesos se convierten a FP8 en formato E4M3 de forma anticipada y por canal, mientras que las activaciones se cuantizan a FP8 de forma dinamica, token a token, durante la inferencia. La capa lm_head se deja sin cuantizar, una practica habitual por su tamano reducido y su impacto desproporcionado en la calidad si se comprime.

No hay datos de entrenamiento disponibles: no se especifica el numero de tokens, la composicion del dataset, ni si el modelo base paso por fases de RLHF o DPO. Tampoco se documentan innovaciones de arquitectura propias, mas alla de la propia cuantizacion. La ventaja tecnica declarada es que FP8_DYNAMIC no necesita dataset de calibracion, por lo que los pesos cuantizados son una conversion directa del original y no introducen sesgo derivado de una muestra de calibracion.

## Capacidades
- Generacion de texto autoregresiva, con foco heredado del modelo base en narrativa, ficcion y roleplay.
- Continuacion y redaccion de texto creativo en ingles.
- Conversacion multi-turno (chat y personajes), condicionada a los datos de entrenamiento del modelo base.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no declaradas; el modelo base esta orientado a ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia eficiente en GPUs con soporte nativo FP8 gracias al formato cuantizado.

## Casos de uso
- Generacion de narrativa y ficcion por lotes: el checkpoint FP8 permite servir un modelo de ~3 B con la mitad de memoria, lo que abarata la produccion masiva de borradores de relatos o continuaciones de texto sobre GPU de gama media.
- Motores de roleplay y personajes conversacionales: el modelo base esta afinado para este dominio, y la version FP8 reduce el coste por token en despliegues interactivos con muchos usuarios concurrentes.
- Asistencia creativa en herramientas de escritura: integrable como backend de autocompletado o sugerencia de frases en editores, con latencia baja al ejecutarse en FP8 sobre GPU Ada.
- Prototipado rapido de aplicaciones de generacion de texto: al caber en una unica GPU de consumo, permite validar productos de texto antes de escalar a modelos mayores.
- Base para fine-tuning ligero en dominios verticales: al ser un modelo de 3 B con pesos safetensors, sirve como punto de partida para ajustes sobre datos propios de nicho (guiones, marketing, soporte redactado).
- Servicio de inferencia por API con vLLM, TGI o SGLang: la model card incluye los comandos de arranque para los tres motores, lo que facilita su despliegue como endpoint compatible con OpenAI en infraestructura propia.
- Evaluacion comparativa de tecnicas de cuantizacion: util como caso de estudio para medir la perdida de calidad de FP8_DYNAMIC frente al modelo original en tareas de generacion creativa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: alrededor de 3,4 GB solo para pesos en FP8; con cache KV y overhead de runtime, en torno a 5-6 GB en la practica.
- Ejecucion nativa FP8: requiere GPU NVIDIA con compute capability igual o superior a 8,9, es decir, generaciones Ada, Hopper y Blackwell (RTX serie 40, L4, L40S, H100, H200, B100, B200, GB10).
- GPUs de consumo compatibles: cabe con holgura en RTX 4060 Ti 16 GB, RTX 4070 y superiores, y en RTX 3060 12 GB (aunque en Ampere se pierde la ventaja de FP8).
- GPUs de centro de datos recomendadas: L4 y L40S para servir varios flujos concurrentes; H100 o H200 para maximizar throughput en produccion.
- Comportamiento en GPUs antiguas: vLLM y TGI de-cuantizan el modelo para poder ejecutarlo en GPUs sin FP8 nativo, lo que anula la mejora de velocidad y memoria.
- Opciones de despliegue documentadas: vLLM (`vllm serve liodon-ai/clio-v1-legacy-FP8`), Text Generation Inference (imagen ghcr.io/huggingface/text-generation-inference) y SGLang (`python -m sglang.launch_server`).
- Otras opciones (llama.cpp, Ollama, LM Studio): requeririan convertir los pesos a GGUF, conversion no incluida en el repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/clio-v1-legacy-FP8 | 3,04 B | safetensors FP8 | no disponible | other | HuggingFace |
| NovelAI/clio-v1-legacy (original) | 3,04 B | safetensors FP16/BF16 | no disponible | other | HuggingFace |
| Otros modelos comparables de ~3 B con cuantizacion FP8 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa mas relevante es con el propio modelo base: misma arquitectura y mismo numero de parametros, con el repositorio reducido de 6,4 GB a 3,4 GB y sin calibracion. No se dispone de datos publicados de otros modelos de la misma categoria y tamano con los que comparar rendimiento o contexto.

## Limitaciones y advertencias
- La ficha no documenta sesgos conocidos del modelo; al derivar de un modelo base orientado a ficcion y roleplay, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de ~3 B; no se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- La cuantizacion FP8 introduce un error numerico respecto al modelo original. El autor sostiene que FP8_DYNAMIC es una conversion directa sin sesgo de calibracion, pero no se aportan metricas de degradacion.
- Longitud de contexto no declarada, lo que dificulta planificar despliegues que dependan de ventanas largas.
- Idiomas soportados no declarados; se espera un rendimiento notablemente inferior en castellano que en ingles.
- Licencia "other" heredada del modelo base: es imprescindible revisar los terminos de NovelAI/clio-v1-legacy antes de cualquier uso comercial, ya que pueden imponer restricciones adicionales.
- La ejecucion en GPUs sin FP8 nativo obliga a de-cuantizar, con la consiguiente perdida de las ventajas de memoria y velocidad.
- La capa lm_head se mantiene sin cuantizar, de modo que el ahorro de memoria no es exactamente la mitad de los pesos originales (3,4 GB frente a 6,4 GB).

## Enlaces
- HuggingFace (modelo cuantizado): https://huggingface.co/liodon-ai/clio-v1-legacy-FP8
- HuggingFace (modelo base): https://huggingface.co/NovelAI/clio-v1-legacy
- Organizacion Liodon AI en HuggingFace: https://huggingface.co/liodon-ai
- Modelo hermano liodon-ai/zero-FP8: https://huggingface.co/liodon-ai/zero-FP8
- Web oficial de Liodon AI: https://liodon.ai/
- GitHub de Liodon AI: https://github.com/Liodon-AI
- Repositorio llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
- Endpoint de inferencia de clio-v1-legacy en FriendliAI: https://friendli.ai/models/NovelAI/clio-v1-legacy
