# neonforestmist/smolgpt-fables

## Resumen

SmolGPT-Fables es un modelo de lenguaje pequeño (SLM) especializado en la generación de historias cortas y fábulas en inglés con estructura controlada. Desarrollado por el autor independiente neonforestmist, el modelo convierte una idea simple en un relato de una a seis escenas numeradas en formato Markdown, respetando personajes, escenario, objetos importantes y el final solicitado por el usuario. Está pensado para escritura creativa asistida, prototipado narrativo y aplicaciones conversacionales que requieran salidas estructuradas.

El modelo es un fine-tune de HuggingFaceTB/SmolLM2-1.7B-Instruct, con 1.711.376.384 parámetros (1,71B), entrenado sobre el dataset propio neonforestmist/smolgpt-markdown-stories. Se distribuye bajo licencia Apache-2.0 y está disponible en formatos safetensors (BF16), GGUF (Q4_K_M) y Core ML (INT4), lo que permite su ejecución en entornos que van desde GPUs de consumo hasta aplicaciones nativas de Apple. Su relevancia radica en ofrecer una alternativa ligera y especializada para generación narrativa controlada, sin necesidad de modelos de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en SmolLM2-1.7B-Instruct) |
| Parametros totales | 1.711.376.384 (1,71B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base SmolLM2-1.7B-Instruct) |
| Tipos de cuantizacion | BF16 (safetensors), Q4_K_M (GGUF), INT4 (Core ML) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, Core ML |

## Arquitectura y entrenamiento

SmolGPT-Fables parte del modelo base SmolLM2-1.7B-Instruct, un transformer causal de 1,71B parámetros desarrollado por Hugging Face, y se ajusta mediante fine-tune sobre el dataset neonforestmist/smolgpt-markdown-stories, compuesto por historias en formato Markdown. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO; estos datos no están disponibles.

La innovación principal del modelo reside en su formato de salida estructurado: genera historias con escenas numeradas (Scene 01, Scene 02, etc.) en Markdown, y acepta campos separados para nombre y descripción de cada personaje, así como instrucciones explícitas sobre escenario, momentos importantes y tipo de final. Esto permite un control fino sobre la narrativa generada, algo poco común en modelos de este tamaño. El modelo soporta el formato de chat de Transformers mediante `apply_chat_template` y es compatible con runtimes basados en llama.cpp.

## Capacidades

- Generacion de historias cortas y fabulas en ingles con 1-6 escenas numeradas en formato Markdown.
- Acepta campos separados de nombre y descripcion ("Name" y "About them") para cada personaje principal.
- Preserva nombres solicitados, detalles de escenario, objetos importantes y el final indicado por el usuario.
- Sigue instrucciones complejas de generacion (genre, setting, important moments, ending).
- Soporta conversacion multi-turno mediante el chat template de Transformers.
- Generacion controlada (controlled-generation) con salidas predecibles en estructura.
- Compatible con Transformers, llama.cpp y aplicaciones nativas de Apple via Core ML.

## Casos de uso

- Escritura creativa asistida: un autor puede describir personajes, escenario y final, y el modelo genera un borrador estructurado en escenas que sirve como punto de partida para revision posterior.
- Generacion de fabulas educativas: profesores o creadores de contenido pueden producir relatos cortos con moraleja para materiales didacticos, especificando el tono y la longitud deseada.
- Prototipado narrativo para videojuegos: diseñadores pueden generar rapidamente variaciones de historias con diferentes personajes y finales para evaluar tramas antes de implementarlas.
- Contenido para blogs y redes sociales: el modelo produce historias breves en Markdown listas para publicar, reduciendo el tiempo de redaccion.
- Herramientas de escritura con estructura controlada: aplicaciones que necesiten generar relatos con un numero fijo de escenas (por ejemplo, 3 escenas) pueden integrar el modelo via API o Transformers.
- Aplicaciones conversacionales de storytelling: chatbots que responden con micro-relatos cuando el usuario pide una historia, aprovechando el soporte de chat y la generacion controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "story evaluation" interna, pero no proporciona metricas cuantitativas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El autor indica que los resultados de evaluacion se refieren al modelo estandar en safetensors; la variante GGUF no ha sido evaluada por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantizacion Q4_K_M (1,06 GB) el modelo cabe en GPUs con 4 GB de VRAM; con pesos BF16 (3,42 GB) se recomiendan al menos 6 GB de VRAM.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060, RTX 4090, o cualquier GPU con 4-8 GB de VRAM para la version cuantizada.
- Si cabe en GPU de consumo: si, tanto la version GGUF como la safetensors son ejecutables en hardware consumer.
- Opciones de despliegue: Transformers (con `device_map="auto"`), llama.cpp, Ollama (via GGUF), y text-generation-inference (TGI) segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

La comparacion se basa en caracteristicas generales, ya que no hay benchmarks publicados para SmolGPT-Fables. Se compara con modelos de tamano similar orientados a generacion de texto e instrucciones.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SmolGPT-Fables v1 | 1,71B | No disponible | Apache-2.0 | Generacion de historias estructuradas en Markdown |
| SmolLM2-1.7B-Instruct | 1,71B | 8K (segun documentacion del modelo base) | Apache-2.0 | Instrucciones generales y chat |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Apache-2.0 | Instrucciones generales y chat multilingue |
| Llama-3.2-1B-Instruct | 1,23B | 128K | Llama 3.2 Community License | Instrucciones generales y chat |

SmolGPT-Fables se diferencia por su especializacion en narrativa estructurada, mientras que las alternativas ofrecen capacidades generales de chat y razonamiento. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, a diferencia de Llama-3.2.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no hay evidencia de capacidades multilingues.
- Esta especializado en generacion de historias; su rendimiento en tareas de razonamiento, matematicas o codigo no esta documentado y probablemente sea limitado.
- Riesgo de alucinacion en detalles narrativos: el modelo puede inventar elementos no especificados por el usuario, especialmente en escenas largas.
- La longitud de contexto no esta documentada; se hereda del modelo base SmolLM2-1.7B-Instruct, pero no se ha verificado su comportamiento en ventanas largas.
- No se han publicado evaluaciones de sesgos ni pruebas de robustez; el dataset de entrenamiento es sintetico y puede reflejar sesgos del proceso de generacion.
- La variante GGUF no ha sido evaluada por separado; su rendimiento puede diferir del modelo en safetensors.
- Existe documentacion de una version experimental anterior con 6M parametros entrenada desde cero, pero la version actual (v1) es un fine-tune de 1,71B; los usuarios deben asegurarse de usar la variante correcta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/neonforestmist/smolgpt-fables
- Studio de demostracion: https://huggingface.co/spaces/neonforestmist/SmolGPT-Fable-Studio
- Dataset de entrenamiento: https://huggingface.co/datasets/neonforestmist/smolgpt-markdown-stories
- Companion Core ML: https://huggingface.co/neonforestmist/smolgpt-fables-coreml
- Perfil de GitHub del autor: https://github.com/neonforestmist/neonforestmist
