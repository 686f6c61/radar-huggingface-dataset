# mijoko/Qwen3.8-27B-Moxie

## Resumen

Qwen3.8-27B-Moxie es un modelo de lenguaje multimodal de 27 000 millones de parámetros, creado por el usuario mijoko mediante la fusión (merge) de cuatro modelos base: Qwen/Qwen3.8-27B, llmfan46/Omega-Evolution-27B-v2.1-uncensored-heretic, ReadyArt/Dark-Scarlett-v1.0-27B y clzoro/Qwen3.6-27B-Claude-Distill-v2. El objetivo declarado es conservar las capacidades técnicas y agénticas de Qwen 3.8 (razonamiento, código, visión) mientras se reduce la tendencia a generar largas cadenas de deliberación interna y se adopta un tono conversacional más cálido, directo y menos propenso a rechazos innecesarios.

El modelo se distribuye exclusivamente en formato GGUF cuantizado a Q8_0, pensado para inferencia local con llama.cpp. Incluye un archivo `mmproj` separado para el codificador de visión, lo que permite entrada de imágenes además de texto. La licencia es Apache-2.0, lo que facilita su uso comercial. Al ser un merge por interpolación lineal, no es un modelo preentrenado desde cero, sino una combinación de pesos de modelos existentes, con las implicaciones de comportamiento no lineal que eso conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido con atencion lineal en 48 de 64 capas, con vision tower y MTP draft head (heredado de Qwen3.8-27B) |
| Parametros totales | 27 000 millones (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en el merge; el modelo base Qwen3.8-27B tiene 262 000 tokens nativos |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | Ingles, chino, aleman (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con archivo `mmproj` separado para el proyector de vision |

## Arquitectura y entrenamiento

Moxie no ha sido preentrenado ni fine-tuneado de forma independiente. Es el resultado de una fusion jerarquica por interpolacion lineal de cuatro modelos de 27B, todos ellos derivados de la familia Qwen 3.x. La receta de fusion es la siguiente:

- Merge B = 70 % Omega Evolution + 30 % Dark Scarlett
- Merge C = 70 % Merge B + 30 % Claude Distill
- Moxie = 60 % Merge C + 40 % Qwen 3.8

La composicion efectiva resultante es: 40 % Qwen3.8-27B, 29,4 % Omega-Evolution, 18 % Claude-Distill y 12,6 % Dark-Scarlett. Se fusionaron los 1199 tensores compatibles, incluidos los 333 tensores del codificador de vision nativo. La arquitectura subyacente es la de Qwen3.8-27B: un modelo denso con atencion hibrida (atencion lineal en 48 de las 64 capas), un vision tower integrado y un head de decodificacion especulativa (MTP). No se ha realizado ningun entrenamiento adicional sobre los pesos fusionados, por lo que el comportamiento es una combinacion no lineal de las caracteristicas de los modelos fuente.

## Capacidades

- Generacion de texto y razonamiento: conserva las capacidades de Qwen 3.8 para tareas de conocimiento general, definiciones y razonamiento paso a paso, aunque con cadenas de pensamiento mas cortas.
- Codificacion y tecnicas: hereda las habilidades de programacion y analisis tecnico de Qwen 3.8 y de los derivados de Qwen 3.6.
- Comprension de imagenes: incluye un codificador de vision nativo (archivo `mmproj`) que permite responder preguntas sobre imagenes y realizar tareas de vision-language.
- Capacidades agénticas: soporta tool calling y flujos de trabajo orientados a agentes, gracias a la base Qwen 3.8.
- Escritura creativa y roleplay: los componentes Dark-Scarlett y Claude-Distill aportan un estilo conversacional mas natural, flexible y menos formal, adecuado para ficcion y personajes.
- Multilingue: soporta ingles, chino y aleman, segun la model card.
- Reduccion de rechazos: el merge busca disminuir las respuestas de rechazo innecesarias, aunque el comportamiento varia con el prompt y la plantilla de chat.

## Casos de uso

- Asistente conversacional local: Moxie puede desplegarse en un servidor llama.cpp para ofrecer un asistente personal con tono natural y directo, sin depender de APIs externas. Su menor longitud de razonamiento reduce la latencia percibida en conversaciones multi-turno.
- Generacion de codigo en entornos de desarrollo: gracias a las capacidades heredadas de Qwen 3.8, puede integrarse en pipelines de CI/CD para generar o revisar fragmentos de codigo, con la ventaja de un estilo de respuesta mas conciso.
- Analisis de imagenes en aplicaciones de escritorio: el archivo `mmproj` permite procesar capturas de pantalla, diagramas o fotografias para extraer informacion o responder preguntas visuales, todo en local.
- Escritura creativa y narrativa interactiva: su perfil de roleplay y creatividad lo hace adecuado para generar historias, dialogos de personajes o guiones, con un tono menos "corporativo" que el modelo base.
- Agentes autonomos con tool calling: puede actuar como nucleo de un agente que llama a herramientas externas (busquedas, calculos, APIs) para completar tareas de multiples pasos, aprovechando su herencia agéntica.
- Prototipado rapido de chatbots con personalidad: desarrolladores pueden usar Moxie para crear demos de asistentes con una voz distintiva, sin necesidad de fine-tuning adicional, gracias a su licencia permisiva y su formato GGUF listo para Ollama o LM Studio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor incluye una evaluacion inicial local con seis prompts de prueba, comparando Moxie Q8_0 con Qwen3.8-27B Q8_0, ambos ejecutados con llama.cpp b10615, decodificacion greedy y maximo de 8000 tokens nuevos:

| Modelo | Tokens generados | Tiempo total | Respuestas limitadas por longitud | Respuestas completadas |
|---|---:|---:|---:|---:|
| Qwen3.8-27B Q8_0 | 20 128 | 520,4 s | 2 | 4/6 |
| Moxie Q8_0 | 4 937 | 138,8 s | 0 | 6/6 |

En esta prueba, Moxie genero aproximadamente un 75 % menos de tokens y completo todas las respuestas, mientras que el modelo base agoto el presupuesto de 8000 tokens en dos prompts sin dar una respuesta final. El propio autor advierte que estos resultados son direccionales y no constituyen una evaluacion exhaustiva.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo principal Q8_0 ocupa 28,6 GB y el `mmproj` 0,63 GB. Con overhead de contexto y buffers, se recomienda al menos 32 GB de VRAM para descargar todo en GPU.
- GPU recomendadas: una A100 40 GB, una RTX 5090 32 GB, o dos RTX 4090 24 GB en paralelo. En GPUs con menos VRAM, se puede reducir la descarga de capas (`-ngl`) o desactivar la descarga del proyector (`--no-mmproj-offload`).
- En consumer GPU: cabe en una RTX 4090 24 GB solo si se limita el contexto y se usa parcialmente la CPU; para uso comodo se necesitan 32 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, Ollama (si se convierte el GGUF), y cualquier runtime compatible con GGUF. Tambien puede usarse con vLLM si se convierte a safetensors, aunque el formato oficial es GGUF.
- Latencia y throughput: no se han publicado mediciones fiables. La evaluacion inicial muestra 138,8 s para 4937 tokens en hardware no especificado, lo que sugiere un rendimiento moderado, pero no es extrapolable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Moxie (este) | 27B | No especificado (base 262K) | Apache-2.0 | GGUF Q8_0 | Merge con tono conversacional y menos razonamiento |
| Qwen/Qwen3.8-27B | 27B | 262K nativo | Apache-2.0 | Safetensors, GGUF | Modelo base, denso, multimodal, agéntico |
| clzoro/Qwen3.6-27B-Claude-Distill-v2 | 27B | No disponible | No disponible | Safetensors | Derivado de Qwen 3.6 con destilacion de Claude, componente del merge |

La comparativa directa con otros merges de 27B no esta disponible en la informacion proporcionada. La diferencia principal frente al base Qwen3.8-27B es el comportamiento: Moxie genera cadenas de razonamiento mas cortas y adopta un estilo mas directo, a costa de una posible reduccion en la precision de tareas complejas que requieren deliberacion extensa.

## Limitaciones y advertencias

- Es un merge por interpolacion lineal, no un modelo preentrenado ni fine-tuneado de forma independiente. La combinacion de pesos puede producir comportamientos no lineales y sensibles al prompt.
- Puede alucinar hechos o interpretar erroneamente acronimos ambiguos con total confianza, como cualquier modelo de su tamano.
- La reduccion de la longitud de razonamiento no garantiza una mayor precision en tareas de razonamiento complejo; puede sacrificar exactitud por concision.
- El comportamiento de rechazo varia significativamente con la redaccion del prompt, la plantilla de chat y los parametros de muestreo. No es un modelo "uncensored" garantizado.
- La evaluacion inicial es muy pequena (seis prompts) y no cubre conocimiento, codigo, vision, tool use ni sensibilidad al muestreo. No debe tratarse como evidencia de rendimiento general.
- El contexto nativo de 262K del modelo base no esta confirmado en el merge; es posible que la fusion afecte a la ventana de contexto efectiva.
- Solo se distribuye en GGUF Q8_0; no hay versiones en safetensors ni cuantizaciones inferiores, lo que limita su uso en entornos con menos VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mijoko/Qwen3.8-27B-Moxie
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base llmfan46/Omega-Evolution-27B-v2.1-uncensored-heretic: https://huggingface.co/llmfan46/Omega-Evolution-27B-v2.1-uncensored-heretic
- Modelo base ReadyArt/Dark-Scarlett-v1.0-27B: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-27B
- Modelo base clzoro/Qwen3.6-27B-Claude-Distill-v2: https://huggingface.co/clzoro/Qwen3.6-27B-Claude-Distill-v2
- Pagina de Qwen3.8-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Blog de AMD sobre Qwen 3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Ficha de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
