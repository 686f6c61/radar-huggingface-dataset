# Bakanayatsu/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA-Q3_K_M-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA es un modelo de lenguaje especializado en la reescritura y expansion de prompts para generacion de video y audio-video. Se construye sobre una base Qwen3.5 de 9B parametros y ha sido afinado mediante SFT (supervised fine-tuning) para transformar instrucciones breves o incompletas en descripciones detalladas y estructuradas, condicionadas por referencias multimodales (imagen, video y audio). Lo desarrolla el equipo lightx2v, vinculado al ecosistema MiniMax-H3.

La version aqui descrita es una cuantizacion GGUF Q3_K_M generada por el usuario Bakanayatsu mediante el espacio GGUF-my-repo de ggml.ai a partir del checkpoint original en safetensors. El modelo original cuenta con 9.197.093.888 parametros (aproximadamente 9,2 mil millones) y esta etiquetado como vision-language y multimodal, lo que sugiere capacidad de procesar entradas visuales y de audio ademas de texto.

Su relevancia practica radica en el nicho: la calidad de los prompts es un cuello de botella critico en pipelines de generacion de video con modelos tipo difusion. Un reescritor especializado y condicionado por referencias (ref2va, reference-to-video-audio) permite estandarizar y enriquecer prompts de forma automatica antes de pasarlos al generador, reduciendo la iteracion manual. La cuantizacion Q3_K_M permite ejecutarlo en hardware de consumo mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5), vision-language multimodal; detalles de atencion no disponibles |
| Parametros totales | 9.197.093.888 (aprox. 9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`) |
| Tipos de cuantizacion | Q3_K_M (esta version); otras cuantizaciones del mismo autor no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (un unico fichero `minimax-h3-prompt-rewriter-qwen3.5-9b-ref2va-q3_k_m.gguf`); el modelo base en safetensors |
| Tamano del repo | 4,7 GB |
| Libreria declarada | minimax-h3 |
| Modelo base | lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 de aproximadamente 9,2 mil millones de parametros, una arquitectura transformer decoder-only. Sobre esa base se aplica un proceso de SFT (supervised fine-tuning) orientado a la tarea de reescritura y expansion de prompts, segun las etiquetas de la model card. El sufijo Ref2VA indica condicionamiento por referencias multimodales: imagen, video y audio como contexto de entrada para guiar la reescritura. Las etiquetas vision-language y multimodal confirman que el modelo acepta entradas visuales, aunque no se detalla la composicion exacta del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de RLHF o DPO.

No se dispone de informacion sobre innovaciones tecnicas especificas (mecanismos de atencion, decodificacion especulativa, atencion lineal, etc.) mas alla de la propia tarea de especializacion. La conversion a GGUF se realizo con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, sin modificaciones declaradas sobre los pesos mas alla de la cuantizacion Q3_K_M.

## Capacidades

- Reescritura y expansion de prompts: transforma instrucciones breves en descripciones detalladas y estructuradas para generacion de video y audio-video.
- Condicionamiento por referencias (ref2va): acepta imagenes, videos y audio como contexto para guiar la reescritura del prompt.
- Procesamiento multimodal vision-language: capacidad de interpretar entradas visuales ademas de texto.
- Generacion de prompts para audio-video: segun las etiquetas, orientado a pipelines que combinan video y audio.
- Inferencia via llama.cpp: compatible con `llama-cli` y `llama-server`; las etiquetas mencionan tambien vLLM y endpoints_compatible para el modelo base.
- Capacidades generales de la base Qwen3.5 (razonamiento, codigo, matematicas, tool calling): no confirmadas explicitamente para este fine-tune en la informacion disponible.

## Casos de uso

- Enriquecimiento automatico de prompts en pipelines de generacion de video: el modelo recibe una instruccion escueta del usuario y la expande en una descripcion detallada con camara, iluminacion, movimiento y estilo antes de pasarla al modelo de difusion de video.
- Reescritura condicionada por imagen de referencia: dado un fotograma o imagen de estilo, el modelo genera un prompt que preserva coherencia visual con la referencia, util para mantener consistencia entre planos.
- Generacion de prompts audio-video sincronizados: a partir de una referencia de audio o video, produce descripciones que incluyen indicaciones de sonido y ambientacion junto a la parte visual.
- Estandarizacion de prompts en equipos creativos: centraliza la conversion de briefs informales en prompts tecnicos reproducibles, reduciendo la variabilidad entre operadores.
- Prototipado local sin conexion: gracias a la cuantizacion Q3_K_M (4,7 GB), puede ejecutarse en estaciones de trabajo con GPU de consumo mediante llama.cpp para iterar prompts sin depender de APIs externas.
- Preprocesado en pipelines de CI/CD de contenido generativo: integrado como paso previo a la generacion, valida y normaliza prompts de forma automatizada antes de invocar el modelo de video.
- Investigacion sobre reescritura de prompts: sirve como punto de partida para estudiar el efecto de la expansion de prompts en la calidad de salidas generativas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q3_K_M ocupa 4,7 GB, por lo que se necesitan aproximadamente 5-6 GB de VRAM o memoria unificada para cargar los pesos, mas el espacio para el contexto KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en GPUs profesionales, A100 o H100 sin problema.
- Cabe en GPU de consumo: si, con cuantizacion Q3_K_M y contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`); la model card del modelo base menciona vLLM y compatibilidad con endpoints. Ollama y TGI no se mencionan explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA (Q3_K_M) | 9,2 B | no disponible | Reescritura de prompts video/audio-video condicionada por referencias | no disponible | GGUF en HF |
| Qwen3.5 9B base | ~9,2 B | no disponible | Proposito general | no disponible | HF |
| Reescritores de prompts genericos (p. ej. basados en LLM generales) | variable | variable | Expansion de prompts sin condicionamiento multimodal | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base antes de usarlo en produccion.
- Idiomas soportados no especificados: no hay garantia de calidad en castellano ni en otros idiomas distintos del que se uso en el entrenamiento.
- La cuantizacion Q3_K_M introduce perdida de precision respecto al checkpoint original en safetensors; puede degradar la calidad de reescritura frente a cuantizaciones mayores o al modelo sin cuantizar.
- Modelo altamente especializado: su rendimiento fuera de la tarea de reescritura de prompts puede ser limitado en comparacion con la base Qwen3.5 sin fine-tuning.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar detalles visuales o de audio no presentes en la referencia proporcionada.
- Sin datos de benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de calidad frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.
- Longitud de contexto no documentada: el ejemplo de la model card usa `-c 2048`, lo que sugiere que contextos largos pueden no estar soportados o no haber sido probados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Bakanayatsu/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA-Q3_K_M-GGUF
- Modelo base: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
