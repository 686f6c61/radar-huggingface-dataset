# es-totaljs/totem-4b

## Resumen

Totem 4B es un ajuste fino (LoRA) del modelo Qwen/Qwen3.5-4B, desarrollado por es-totaljs, orientado a asistir en el desarrollo de aplicaciones con el framework Total.js 5 y su capa de componentes jComponent 20. El modelo hereda la arquitectura transformer densa del base Qwen3.5-4B, con 4.539.265.536 parámetros totales, y se distribuye con licencia Apache 2.0. Su proposito es responder con codigo corto y funcional en el ecosistema Total.js, admitiendo conversacion en ingles y espanol.

El modelo se ha entrenado sobre la biblioteca de Total.js: pares de preguntas y respuestas, aplicaciones probadas y las tareas propias de la aplicacion Totem. Segun la model card, esta disenado para "decir cuando no sabe algo" en lugar de inventar, un comportamiento relevante en asistentes de codigo donde las alucinaciones de API son costosas. No emplea bloque de razonamiento (thinking mode): las respuestas son directas.

Su relevancia practica radica en la integracion con la aplicacion Totem (instalable via `npm install -g totaljs-totem`), donde lee y escribe archivos del proyecto y construye aplicaciones completas tarea a tarea: servidor, acciones, pantallas y formularios. Se ofrece en precision completa (safetensors) y en GGUF Q4_K_M, y es desplegable en Ollama, LM Studio, llama.cpp, vLLM y Transformers. La version del modelo es 0.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-4B); familia de pesos `qwen3_5` |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (en el paquete de Ollama) |
| Tipos de cuantizacion | GGUF Q4_K_M disponible; precision completa en safetensors |
| Idiomas soportados | Ingles (en) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal) y GGUF (repo `es-totaljs/totem-4b-gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.500 millones de parametros con identificador de arquitectura `qwen3_5` en Hugging Face. Sobre esa base se aplica un ajuste fino mediante LoRA, segun indica la model card, utilizando como datos de entrenamiento la biblioteca de Total.js: pares de preguntas y respuestas, aplicaciones probadas y las tareas de la aplicacion Totem. El conocimiento cubierto corresponde a Total.js 5 hasta la version 0.0.20-4 y a jComponent 20.

No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones de inferencia como decodificacion especulativa o atencion lineal. Un detalle tecnico destacable es que el modelo incorpora su propio system prompt dentro de la plantilla de chat; si el usuario envia un mensaje de sistema, este reemplaza al integrado. La temperatura recomendada es 0.2, coherente con tareas de generacion de codigo determinista.

## Capacidades

- Generacion de codigo especifico para Total.js 5 y jComponent 20, con respuestas breves y funcionales.
- Asistencia conversacional en ingles y espanol, respondiendo en el idioma del usuario.
- Generacion de texto y respuestas directas sin bloque de razonamiento visible (no thinking mode).
- Lectura y escritura de archivos del proyecto cuando opera dentro de la aplicacion Totem.
- Construccion de aplicaciones completas por tareas: servidor, acciones, pantallas y formularios.
- Comportamiento de absteccion explicita: declara desconocimiento en lugar de inventar APIs o funciones.
- Compatibilidad con APIs OpenAI-compatible (LM Studio, vLLM, llama.cpp, Ollama) para integracion en herramientas externas.
- Soporte de plantilla de chat con system prompt integrado y posibilidad de sustitucion por uno propio.

No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni otras modalidades.

## Casos de uso

- Desarrollo de backends Total.js: el modelo genera el codigo del servidor, rutas y acciones de Total.js 5 a partir de una descripcion funcional, apoyandose en su conocimiento de la version 0.0.20-4 de la biblioteca.
- Construccion de interfaces con jComponent 20: produce componentes, pantallas y formularios listos para integrarse en una aplicacion Total.js, reduciendo el trabajo de andamiaje.
- Asistente dentro de la aplicacion Totem: al ejecutarse en el entorno Totem, lee y escribe archivos del proyecto y avanza tarea a tarea en la construccion de una aplicacion completa.
- Migracion y actualizacion de codigo legacy: ayuda a adaptar fragmentos a las convenciones actuales de Total.js 5 y jComponent 20, con respuestas cortas y verificables.
- Despliegue local con Ollama o LM Studio: al estar disponible en GGUF Q4_K_M y en el paquete de Ollama (`ollama run totaljs-es/totem`), permite asistencia de codigo en maquinas sin GPU de datacenter y con contexto de 16.384 tokens.
- Integracion en pipelines de desarrollo: mediante `vllm serve es-totaljs/totem-4b` o `llama-server -hf es-totaljs/totem-4b-gguf --jinja` se puede exponer una API compatible con OpenAI para conectar editores, scripts o herramientas internas.
- Soporte bilingue para equipos hispanohablantes: responde en espanol sobre una API documentada principalmente en ingles, lo que facilita la adopcion del framework en equipos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16): aproximadamente 9 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda al menos 12-16 GB de VRAM.
- VRAM estimada con GGUF Q4_K_M: en torno a 3-4 GB para los pesos, con margen adicional para contexto; viable en GPUs de 6-8 GB.
- GPUs recomendadas: para fp16, A100, H100, L40S o RTX 4090; para Q4_K_M, RTX 3060/4060 con 8 GB o superiores.
- Cabe en GPU de consumo: si, especialmente en formato Q4_K_M (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090).
- Opciones de despliegue: vLLM (`vllm serve es-totaljs/totem-4b`), llama.cpp (`llama-server -hf es-totaljs/totem-4b-gguf --jinja`), Ollama (`ollama run totaljs-es/totem`), LM Studio (buscar `es-totaljs/totem-4b-gguf`) y Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Totem 4B | 4.539.265.536 | 16.384 tokens (paquete Ollama) | Asistente especializado en Total.js 5 y jComponent 20 | Apache 2.0 | safetensors y GGUF Q4_K_M en Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4.500 millones | no disponible en la informacion | Modelo generalista de proposito multiple | Segun modelo base (no confirmada aqui) | Hugging Face |
| Alternativas generalistas de ~4B | no disponible | no disponible | Codigo y conversacion general | variable | variable |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible: no se han publicado benchmarks del modelo ni del base en la informacion proporcionada. La diferencia principal frente al base Qwen3.5-4B es la especializacion en el ecosistema Total.js y la incorporacion de un system prompt propio en la plantilla de chat.

## Limitaciones y advertencias

- Especializacion estrecha: su rendimiento fuera del ecosistema Total.js y jComponent puede degradarse respecto al modelo base, ya que el ajuste LoRA se ha centrado en esa biblioteca.
- Conocimiento acotado a Total.js 5 hasta 0.0.20-4 y jComponent 20; versiones posteriores del framework no estan cubiertas.
- Riesgo de alucinacion en APIs o funciones no vistas durante el entrenamiento; la model card afirma que el modelo declara desconocimiento, pero no se aportan metricas que lo verifiquen.
- Contexto limitado a 16.384 tokens en el paquete de Ollama; proyectos grandes pueden requerir trocear la entrada.
- Idiomas soportados oficialmente: ingles y espanol; el resto de idiomas no esta garantizado (la model card incluye una seccion en eslovaco, pero los idiomas declarados en metadatos son en y es).
- Version 0.1: es una primera version, sin historial de evaluacion publico ni benchmarks.
- Sin soporte documentado de tool calling, vision o audio; no debe asumirse su disponibilidad en produccion.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B, que no se detallan en la informacion disponible.
- El system prompt integrado se sustituye por completo si el usuario envia un mensaje de sistema; un prompt mal disenado puede alterar el comportamiento esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/es-totaljs/totem-4b
- Repositorio GGUF: https://huggingface.co/es-totaljs/totem-4b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Aplicacion Totem (GitHub): https://github.com/totaljs-es/totem
- Paquete npm: `npm install -g totaljs-totem`
- Ollama: `ollama run totaljs-es/totem`
