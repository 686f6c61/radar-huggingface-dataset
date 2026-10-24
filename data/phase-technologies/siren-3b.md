# Phase-Technologies/SIREN-3B

## Resumen

SIREN-3B es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct desarrollado por Phase-Technologies, especializado en prosa atmosférica, construcción de mundos, diálogo romántico y roleplay de personajes. Con 3.085.938.688 parámetros (3,09 mil millones) y distribución en BF16, se presenta como un modelo "standalone" que busca mejorar la expresividad creativa sin sacrificar las capacidades de razonamiento e instrucción del modelo base. Emplea la arquitectura transformer decoder-only de Qwen2, con 36 bloques y atención con consultas agrupadas (16 cabezas de consulta y 2 de clave-valor).

El problema que aborda es habitual en la comunidad de roleplay: los fine-tunes agresivos sobre modelos pequeños suelen degradar la adherencia a instrucciones, la estructura y la comprensión factual. El autor afirma haber entrenado con enmascaramiento de pérdida únicamente en las completaciones (`label = -100` en turnos de usuario y sistema), de modo que el modelo aprende el estilo sin desaprender las convenciones conversacionales heredadas de Qwen2.5.

Es relevante ahora por su tamaño contenido —cabe en GPU de consumo y en una T4 gratuita de Colab— y por publicarse bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No obstante, en el momento de redactar esta ficha el repositorio registra 0 descargas y 0 "likes", y no se han publicado resultados de benchmarks numéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2, 36 bloques, GQA con 16 cabezas de consulta y 2 de clave-valor |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens segun el modelo base Qwen2.5-3B-Instruct; no se especifica en la model card de SIREN-3B |
| Tipos de cuantizacion | No se publican versiones cuantizadas en el repositorio (solo safetensors en BF16). Al ser un transformer estandar, es convertible a GGUF, GPTQ y AWQ |
| Idiomas soportados | Ingles (en) y chino (zh), segun los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16). Tamano del repositorio: 6,2 GB |
| Dimension oculta | No disponible (la model card esta truncada en ese campo) |
| Parametros de inferencia recomendados | temperature 0,7; top_p 0,9; max_new_tokens 512; repetition_penalty 1,05 |
| Hardware de entrenamiento declarado | 4x NVIDIA H100 |

## Arquitectura y entrenamiento

SIREN-3B no introduce cambios arquitectonicos: es un clon estructural de Qwen2.5-3B-Instruct, un transformer decoder-only denso de 36 capas con atención de consultas agrupadas (GQA), 16 cabezas de consulta y 2 cabezas de clave-valor. Esto implica un ratio de compartición de 8:1, lo que reduce el tamaño de la caché KV en inferencia y abarata el despliegue en contextos largos. El vocabulario y el tokenizador no se detallan en la información disponible, pero al ser un fine-tune directo se asume compatibilidad total con el tokenizador de Qwen2.5.

La innovación declarada es de tipo metodológico, no arquitectónico: el entrenamiento emplea enmascaramiento de pérdida exclusivamente sobre las completaciones del asistente, asignando `label = -100` a los turnos de usuario y de sistema. El objetivo es preservar las capacidades nativas del modelo base (seguimiento de instrucciones, formato de chat, comprensión factual) mientras se adapta el registro estilístico hacia prosa evocadora y roleplay. El autor ilustra esta propiedad con una prueba cualitativa: ante la pregunta por la capital de Francia y un monumento famoso, el modelo responde lacónicamente "Paris", respetando una restricción de sistema de concisión.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o preferencias. Tampoco se documentan hiperparámetros de entrenamiento más allá del hardware (4x H100). La model card está truncada en la sección de arquitectura, por lo que la dimensión oculta, el número de capas del MLP, la función de activación y los detalles de RoPE no están disponibles.

## Capacidades

- Generación de texto creativo en inglés y chino: prosa atmosférica, ficción de género (fantasía, noir, romance) y descripciones sensoriales densas.
- Roleplay de personaje con persona persistente: el autor documenta un caso de uso con "Yrsa, la vidente vikinga", manteniendo voz, registro y matices de seducción lúdica a lo largo del turno.
- Diálogo conversacional y "banter": respuestas breves, coloquiales y con carga afectiva o flirtante.
- Preservación de razonamiento básico y conocimiento factual del modelo base, atribuida al enmascaramiento de pérdida en completaciones.
- Seguimiento de instrucciones de sistema, incluidas restricciones de longitud y formato (respuesta de una sola palabra en el ejemplo publicado).
- Conversión a formato chat mediante `apply_chat_template` con roles system/user/assistant.
- Modelo "uncensored" segun los tags del repositorio: menor rechazo a contenido adulto o sensible, sin que se documente el alcance exacto.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y con `endpoints_compatible`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking". Al heredar de Qwen2.5-3B-Instruct es plausible cierto soporte de plantillas de herramientas, pero no está verificado en la información disponible.

## Casos de uso

- Escritura creativa asistida de ficción larga: el modelo genera aperturas de escena atmosféricas (el ejemplo publicado de un lounge de jazz en clave noir) y mantiene un registro sensorial consistente. Adecuado para autores que necesitan borradores rápidos con 32.768 tokens de contexto heredados del modelo base.
- Roleplay de personajes en aplicaciones de entretenimiento: con una persona definida en el turno de sistema, sostiene voz y estilo de forma estable durante conversaciones multi-turno. El bajo coste de inferencia (3,09 B) permite desplegar muchas sesiones concurrentes por GPU.
- Prototipado de videojuegos narrativos y novelas visuales: generación de diálogo de PNJ con personalidad definida en tiempo de ejecución, con latencia baja en GPU de consumo.
- Generación de diálogo para guiones y audiolibros: producción de variantes de una misma escena con distintos tonos (romántico, noir, épico) modificando solo el system prompt.
- Compañía conversacional y agentes de persona para apps de bienestar o entretenimiento: respuestas breves y afectivas, con control de temperatura y `repetition_penalty` para evitar bucles.
- Filtrado y reescritura estilística: reescritura de texto plano en registro literario o atmosférico dentro de un pipeline editorial, gracias a que el modelo conserva la comprensión estructural del base.
- Fine-tuning ulterior sobre dominios concretos (por ejemplo, un personaje propietario) partiendo de un checkpoint ya adaptado al estilo, con Apache 2.0 y 3,09 B de parámetros, lo que abarata el reentrenamiento en una sola GPU.
- Experimentación docente y de investigación en entornos con recursos limitados: cabe en una T4 gratuita de Colab mediante el notebook publicado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente pruebas cualitativas de inferencia en vivo, sin métricas numéricas ni comparación con otros modelos:

| Prueba publicada | Entrada | Comportamiento observado (cualitativo) |
|---|---|---|
| Factual simple | Capital de Francia y un monumento famoso | Respuesta de una palabra, "Paris", respetando la restricción de concisión |
| Conversacion cotidiana | Comentario sobre un dia largo de trabajo | Respuesta coloquial breve sobre ver peliculas en Netflix |
| Dialogo flirtante | "Alguien me advirtio que hablar contigo me metaria en problemas" | Respuesta sugerente y corta: "Yes, but not in the way you think." |
| Roleplay de personaje | Presagio de un cuervo sobre un drakar | Respuesta en personaje, en tercera persona, con tono profetico |
| Ficcion atmosferica noir | Apertura de escena en un lounge de jazz a medianoche | Prosa de varias frases con atmosfera, aunque con deriva de detalles (menciona un barman que luego situa en casa) |

No se dispone de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de roleplay tipo CharacterEval para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 6,2 GB solo para pesos, más caché KV; presupuesto práctico de 7-9 GB con contextos moderados (estimación propia, no publicada por el autor).
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4 GB de pesos; en 4 bits, aproximadamente 2-2,5 GB.
- GPU recomendadas por el autor para entrenamiento: 4x NVIDIA H100. Para inferencia basta una GPU mucho menor.
- Cabe en GPU de consumo: sí. Funciona en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070/4080/4090 y en una T4 de 16 GB de Google Colab (el autor proporciona notebook para T4, L4 y A100).
- Opciones de despliegue: `transformers` con `device_map="auto"` y `TextStreamer` (ruta documentada), Text Generation Inference (etiqueta oficial del repositorio), y conversión a llama.cpp/Ollama o vLLM previa cuantización, al ser un transformer Qwen2 estándar.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- El tamaño de repositorio de 6,2 GB es coherente con pesos en BF16 más tokenizador y ficheros auxiliares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SIREN-3B | 3,09 B | 32.768 (heredado del base) | Fine-tune de roleplay y prosa atmosferica | Apache 2.0 | HuggingFace, 0 descargas en el momento de la ficha |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 | Instruct generalista, multilingue | Apache 2.0 | Ampliamente desplegado, ecosistema maduro |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Instruct generalista, multilingue | Licencia comunitaria Llama 3.2 | Muy extendido, con restricciones de uso |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 | Instruct con enfasis en razonamiento y codigo | MIT | Muy extendido |

Nota: los datos de contexto y licencia de los modelos comparables provienen de conocimiento general sobre dichos lanzamientos y no de la información proporcionada en esta busqueda; conviene verificarlos en sus repositorios oficiales antes de tomar decisiones de produccion. No se dispone de comparaciones de rendimiento numericas entre SIREN-3B y estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de roleplay, por lo que la afirmación de "preservación del razonamiento" del modelo base se apoya solo en una prueba anecdótica de una palabra.
- Riesgo de alucinación y de deriva narrativa: en el propio ejemplo publicado de ficción noir, el modelo introduce un barman que desaparece y reaparece como dueño del local, señal de inconsistencia en tramas largas.
- Etiqueta "uncensored": implica menor tasa de rechazos, con el consiguiente riesgo de generar contenido adulto, violento o sensible. No se documenta el alcance ni los filtros aplicados; es responsabilidad del desplegador implementar moderación.
- Idiomas: solo se declaran inglés y chino. El castellano no está soportado oficialmente y su rendimiento será con toda probabilidad inferior, heredado del modelo base y no reforzado por el fine-tune.
- Contexto: no se documenta en la model card de SIREN-3B; el valor de 32.768 tokens corresponde al modelo base y debe verificarse en `config.json` antes de diseñar prompts largos.
- Model card incompleta: la sección de arquitectura está truncada y no se detallan dataset, número de tokens de entrenamiento ni metodología de evaluación, lo que impide reproducir el ajuste.
- Tracción nula: 0 descargas y 0 "likes" en el momento de la ficha, sin comunidad que haya validado el modelo ni reportado fallos.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene conservar el aviso de copyright y verificar que el modelo base Qwen2.5-3B-Instruct se distribuya bajo la misma licencia (así consta).
- Sesgos: no hay evaluación de sesgos publicada; al ser un fine-tune sobre datos no documentados, puede amplificar estereotipos presentes en el corpus de roleplay y romance utilizado.
- Al ser un modelo de 3 B, la calidad en tareas de razonamiento complejo, matemáticas y código es estructuralmente limitada, con independencia del fine-tune.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Phase-Technologies/SIREN-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Notebook de Google Colab: https://colab.research.google.com/github/Phase-Technologies/SIREN-3B/blob/main/SIREN_3B_Colab.ipynb
- Repositorio GitHub del proyecto: https://github.com/Phase-Technologies/SIREN-3B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

No se han encontrado en la busqueda web papers, blogs tecnicos ni demos adicionales sobre este modelo; los resultados devueltos corresponden a definiciones de diccionario de la palabra "phase" y no son relevantes.
