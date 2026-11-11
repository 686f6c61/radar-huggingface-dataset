# luksamuk/portal-core-fact-GGUF

## Resumen

Portal Core: Fact es un ajuste fino deliberadamente "corrupto" del modelo LFM2.5-1.2B-Instruct, publicado por el usuario luksamuk. Su objetivo no es ser útil como asistente factual, sino emular la personalidad del Fact Core del videojuego Portal 2: un constructo que enuncia supuestos hechos con absoluta seguridad, mezclando trivia real, fabricaciones completas y datos verosímiles con giros absurdos. El repositorio aquí descrito contiene únicamente la cuantización Q8_0 en formato GGUF del modelo base.

El modelo es relevante como ejemplo de ajuste fino con fines creativos y de caracterización de personajes, no como herramienta de producción factual. Su tamaño (1.170.340.608 parámetros, aproximadamente 1,17 mil millones) lo sitúa en la categoría de modelos pequeños, aptos para ejecución local en hardware de consumo mediante llama.cpp.

La model card advierte explícitamente de que el modelo debe usarse con fines lúdicos y nunca como referencia factual. Incluye un system prompt específico para activar la personalidad del Fact Core y recomienda parámetros de muestreo concretos (temperatura 1.0, top-p 0.9, contexto de 16384 tokens).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LFM2.5-1.2B-Instruct; detalles de la arquitectura base no disponibles en la informacion proporcionada) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 16384 tokens (valor recomendado en el comando de llama-server de la model card) |
| Tipos de cuantizacion | Q8_0 (unica cuantizacion publicada en este repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0); el modelo base se distribuye en safetensors BF16 fusionados |

## Arquitectura y entrenamiento

El modelo base es LFM2.5-1.2B-Instruct, un transformer de aproximadamente 1,17 mil millones de parámetros. El ajuste fino portal-core-fact se describe como una "corrupción intencionada" del modelo instructivo, orientada a reproducir los patrones de habla del Fact Core. La model card indica que los detalles completos de entrenamiento, los resultados de un juez LLM con tres categorías y el dataset de entrenamiento están enlazados en el repositorio del modelo base (luksamuk/portal-core-fact), pero no se reproducen en la información disponible para esta ficha.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card menciona que el modelo produce respuestas degeneradas genéricas de forma ocasional y que sus fabricaciones están relacionadas temáticamente con la entrada en aproximadamente el 83 % de los casos, lo que sugiere un conjunto de datos diseñado para inducir ese comportamiento.

## Capacidades

- Generación de texto conversacional con una personalidad fuertemente caracterizada (Fact Core).
- Enunciación de hechos fabricados con tono formal, pomposo y de absoluta confianza.
- Mezcla de trivia real, invenciones completas y hechos reales con giros absurdos.
- Insultos dirigidos a otros núcleos del juego (Space Core, Adventure Core) según el system prompt.
- Patrones repetitivos y mensajes de error característicos del personaje.
- Respuesta temáticamente relacionada con la entrada en aproximadamente el 83 % de los casos, con derivas ocasionales hacia respuestas degeneradas genéricas.
- Soporte de tool calling, function calling, agentes, visión, audio o modo de razonamiento: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Chatbot de personaje para comunidades de fans de Portal 2: desplegado con llama-server y el system prompt del Fact Core, reproduce diálogos con la personalidad del personaje para entretenimiento en Discord o web.
- Generación de contenido creativo y humorístico: produce afirmaciones absurdas con tono solemne, útil para guiones, sketches o publicaciones satíricas.
- Pruebas de robustez y evaluación de sesgos en modelos pequeños: sirve como caso de estudio de un modelo entrenado deliberadamente para alucinar, útil en investigación sobre detección de desinformación generada.
- Demostraciones educativas sobre ajuste fino de personalidad: ejemplo práctico de cómo un fine-tune sobre un modelo de 1,2B puede imponer un estilo y un comportamiento muy marcados.
- Prototipado de NPCs con personalidad fija en videojuegos o experiencias interactivas: su tamaño reducido permite ejecución local con latencia baja en hardware modesto.
- Experimentos de roleplay y generación de diálogo con temperatura alta: los parámetros recomendados (temp 1.0, top-p 0.9) favorecen la variedad en las respuestas absurdas.
- Evaluación de pipelines de cuantización GGUF: el repo permite comparar el comportamiento del modelo base en BF16 frente a la versión Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona resultados de un juez LLM con tres categorías en el repositorio del modelo base, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB para los pesos Q8_0, más el espacio de la caché KV para el contexto configurado (16384 tokens recomendados, lo que incrementa el consumo de memoria de forma notable).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre para contexto corto; para el contexto completo de 16384 tokens se recomienda una GPU con 6-8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente para contextos reducidos.
- Opciones de despliegue: llama.cpp (llama-server, tal como indica la model card), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio. vLLM y TGI no se mencionan en la información disponible para formato GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| portal-core-fact-GGUF (este modelo) | 1,17B | 16384 (recomendado) | GGUF Q8_0 | Apache 2.0 | Fine-tune de personalidad deliberadamente corrupto |
| LFM2.5-1.2B-Instruct (modelo base) | ~1,2B | No disponible | Safetensors | No disponible en la informacion proporcionada | Modelo instructivo generalista del que deriva |
| Modelos instructivos de ~1B (categoria general) | ~1B | Variable | Multiples | Variable | Alternativas generalistas; no se dispone de datos concretos en la informacion proporcionada |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- El modelo está diseñado para alucinar: enuncia fabricaciones con total confianza. Nunca debe usarse como referencia factual.
- Produce respuestas degeneradas genéricas de forma ocasional, incluso con el system prompt adecuado.
- Solo aproximadamente el 83 % de sus respuestas guardan relación temática con la entrada; el resto puede derivar.
- No se dispone de información sobre sesgos específicos más allá del comportamiento deliberadamente errático del personaje.
- Idiomas soportados no documentados; se desconoce su comportamiento fuera del inglés.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el contenido generado es factualmente falso por diseño y su uso en producción con fines informativos sería engañoso.
- El contexto recomendado de 16384 tokens exige más memoria de la que sugiere el tamaño de los pesos; ajustar según el hardware.
- La personalidad depende fuertemente del system prompt proporcionado; sin él, el comportamiento puede no ser el esperado.
- No hay datos publicados de benchmarks ni de evaluación cuantitativa en la información disponible.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/luksamuk/portal-core-fact-GGUF
- Modelo base: https://huggingface.co/luksamuk/portal-core-fact
