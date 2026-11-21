# MOGODIK/ssiat-1.0

## Resumen

Ssiat 1.0 (씨앗, "semilla" en coreano) es un modelo de lenguaje causal de 254,7 millones de parametros, entrenado desde cero y exclusivamente en coreano por el desarrollador independiente MOGODIK. Su objetivo declarado no es competir en conocimiento general, sino ofrecer una base lo bastante pequena para entrenar y ejecutar chatbots de personaje en hardware de consumo: el autor afirma que una LoRA de personaje con 50-80 ejemplos se completa en 1-2 minutos en una RTX 5060 Ti de 16 GB, y que la inferencia cuantizada cabe en dispositivos como una Raspberry Pi Zero 2W o un Galaxy Watch 4.

El modelo se distribuye como base "en blanco": no tiene nombre, personalidad ni estilo propios, y esta pensado para ser afinado con datos de personaje antes de usarse. Emplea el formato de chat estilo ChatML (`<|im_start|>` / `<|im_end|>`) y una ventana de contexto de 1024 tokens, una limitacion deliberada coherente con su tamano y su publico objetivo (estudiantes, aficionados y desarrolladores que quieren iterar rapido sin costes de API).

La revision de noviembre de 2026 anadio preentrenamiento con aproximadamente 540 000 tokens de texto de sentido comun en tres epocas y un nuevo entrenamiento conversacional con dialogos cotidianos cortos, reduciendo respuestas incoherentes y la invencion de nombres propios, a costa de un mayor uso de respuestas de eco ("yo tambien"). La licencia Apache 2.0 permite uso comercial sin restricciones practicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), etiquetado como familia llama; detalles de capas y dimensiones no disponibles |
| Parametros totales | 254 706 688 (254,7 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF disponible en el repositorio; niveles concretos no disponibles |
| Idiomas soportados | Coreano unicamente (ko); sin capacidad funcional en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Se trata de un transformer causal denso de 254,7 M de parametros, desarrollado "from-scratch" (sin partir de pesos de un modelo mayor) y con un tokenizador cuyo pre-tokenizer usa el fallback de GPT-2, lo que ha causado problemas de codificacion de prompts en el motor de inferencia propietario de Ollama. El preentrenamiento consta de 781 000 pasos; la model card no especifica el numero total de tokens de esa fase ni la composicion del corpus mas alla de que es coreano.

Sobre esa base se aplico, en la revision de noviembre de 2026, un preentrenamiento adicional con aproximadamente 540 000 tokens de texto llano de sentido comun durante tres epocas, seguido de un nuevo entrenamiento conversacional con dialogos diarios cortos. El resultado declarado es una reduccion de respuestas fuera de contexto y de nombres inventados, un aumento de respuestas de eco y una ligera disminucion de jerga de internet; la exactitud en preguntas factuales no mejoro, porque no se amplio el volumen de conocimiento. No se documenta el uso de RLHF o DPO, ni innovaciones como decodificacion especulativa o atencion lineal. Tambien se corrigio el `eos_token_id`, que estaba mal configurado y hacia que la generacion no se detuviera al emitir el token de fin de turno usado en el entrenamiento conversacional.

## Capacidades

- Generacion de texto conversacional en coreano, con turnos cortos y registro coloquial.
- Mantenimiento de personaje tras afinado: segun el autor, con 30 ejemplos se fija el tono y la personalidad, y en torno a 1000 ejemplos el personaje se sostiene de forma natural ante preguntas no vistas en el entrenamiento.
- Coherencia de personaje en conversaciones de mas de 10 turnos, manteniendo el registro sin colapsar en repeticiones, en comparacion con modelos el doble mas grandes bajo las mismas condiciones.
- Respuesta a preguntas de sentido comun simples y conversacion cotidiana, tras el preentrenamiento adicional de 2026-11.
- No soporta tool calling ni function calling (no documentado).
- No soporta razonamiento multi-paso ni uso como agente (no documentado).
- Multilingue: no; el modelo es exclusivamente coreano y no maneja ingles.
- Matematicas y calculo aritmetico: no; el autor lo declara explicitamente fuera de alcance.
- Vision y audio: no disponibles.
- Modo "thinking" o cadena de razonamiento explicita: no disponible.

## Casos de uso

- Creacion de chatbots de personaje autoalojados: el desarrollador prepara 50-80 ejemplos de dialogo con el tono y la personalidad deseados, entrena una LoRA en 1-2 minutos en una GPU de 16 GB y sirve el modelo con `llama-server`, eliminando el coste por mensaje de las APIs comerciales.
- Prototipado rapido de personajes para juegos o narrativa interactiva: al completarse un ciclo de entrenamiento en minutos, se puede reescribir el dataset y volver a evaluar el resultado varias veces al dia, algo inviable con modelos grandes.
- Docencia y practicas de ajuste fino: estudiantes pueden recorrer el ciclo completo (curacion de datos, LoRA, evaluacion cualitativa) en hardware asequible, con un modelo de 254,7 M que cabe en memoria de consumo.
- Despliegue en dispositivos embebidos y wearables: con cuantizacion, el autor situa la inferencia en una Raspberry Pi Zero 2W o un Galaxy Watch 4, habilitando asistentes de personaje sin conexion ni backend.
- Juguetes interactivos y dispositivos IoT con voz sintetizada: la ventana de 1024 tokens y el tamano reducido permiten ejecucion local en CPU con un consumo de memoria del orden de cientos de megabytes.
- Filtro o generador de respuestas de personaje en coreano para prototipos de compania conversacional: el modelo produce turnos breves y coloquiales adecuados para pruebas de UX antes de escalar a un modelo mayor.
- Servicio de inferencia de alto rendimiento en un solo acelerador: el autor reporta aproximadamente 470,25 tokens por segundo en una A100, suficiente para atender muchas sesiones concurrentes de un personaje concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento medido que aporta el autor es el throughput de inferencia: aproximadamente 470,25 tokens por segundo en una A100. Las afirmaciones sobre mantenimiento de personaje frente a modelos el doble mas grandes son cualitativas y no van acompanadas de cifras ni de una metodologia publicada.

## Requisitos de hardware

- Inferencia en precision completa (fp32): unos 1,0 GB de pesos; en bf16/fp16, aproximadamente 0,5 GB, mas el coste de la cache KV para 1024 tokens, que es reducido.
- Cuantizaciones GGUF de 4-8 bits: el autor afirma que el modelo puede ejecutarse con 256 MB de RAM y CPU, lo que corresponde a los niveles mas agresivos de cuantizacion.
- GPU de consumo: cabe holgadamente en cualquier GPU con 4 GB o mas de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y RTX 4090; no se requiere GPU de centro de datos.
- GPU profesionales: A100 y H100 sobredimensionadas para inferencia, pero utiles para el throughput reportado de 470,25 tokens/s en A100 y para entrenamiento de LoRA a mayor escala.
- Entrenamiento de LoRA: el autor cita 1-2 minutos por personaje con 50-80 ejemplos en una RTX 5060 Ti de 16 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, con el GGUF del repositorio), Transformers con `AutoModelForCausalLM`, y cualquier runtime compatible con GGUF. Evitar Ollama: su motor de inferencia interno mal codifica los prompts por el pre-tokenizer del modelo y produce respuestas distintas de las aprendidas o corruptas.
- Latencia y throughput: solo se dispone del dato de A100 (aprox. 470,25 tokens/s); no hay cifras publicadas para CPU ni para GPU de consumo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. A continuacion se contrastan caracteristicas verificables con modelos de tamano y proposito proximos.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Enfoque |
|---|---|---|---|---|---|
| Ssiat 1.0 | 254,7 M | 1024 | Apache 2.0 | Solo coreano | Base para personajes en edge, entrenada desde cero |
| Qwen2.5-0.5B | 494 M | 32 768 | Apache 2.0 | Multilingue (incluye coreano) | Modelo generalista pequeno |
| SmolLM2-360M | 362 M | 8192 | Apache 2.0 | Principalmente ingles | Modelo generalista pequeno |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Principalmente ingles | Modelo generalista pequeno |

Ssiat 1.0 es el unico de la lista disenado explicitamente para un solo idioma y para afinado de personaje con muy pocos ejemplos, a costa de un contexto mucho menor y de ausencia total de capacidades en ingles, matematicas y conocimiento factual amplio. No se han publicado comparaciones de rendimiento con ninguno de estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Conocimiento del mundo y exactitud factual debiles: el propio autor lo presenta como el precio de la velocidad y el tamano reducido.
- No maneja ingles ni matematicas; cualquier tarea fuera del coreano conversacional fallara.
- Memoria de contexto limitada: 1024 tokens y dificultad reconocida para recordar hechos mencionados antes en conversaciones largas, lo que afecta a dialogos de muchos turnos con informacion acumulada.
- Riesgo de alucinacion en preguntas factuales; el preentrenamiento de sentido comun de 2026-11 no amplio el volumen de conocimiento, solo la calidad del dialogo.
- El modelo base no tiene personalidad: sin afinado con al menos 50 ejemplos (idealmente cientos), el personaje queda debil o inexistente.
- Respuestas de eco ("yo tambien") mas frecuentes tras la revision de noviembre de 2026, y persistencia de jerga de internet en menor medida.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse solo con datos coreanos, cabe esperar sesgos culturales y linguisticos propios de ese corpus, sin cuantificacion disponible.
- Bug conocido en Ollama por el pre-tokenizer (fallback GPT-2); usar llama.cpp directamente o un runtime que respete el tokenizador del modelo.
- El `eos_token_id` estuvo mal configurado hasta la revision de noviembre de 2026; versiones anteriores pueden no detener la generacion al final del turno. La revision anterior esta disponible con `revision="82b8af7b1f44d8f6745ccae60508235c5cf9a802"`.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones adicionales, pero el autor no ofrece garantias de calidad para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MOGODIK/ssiat-1.0
- Revision anterior (2026-09): https://huggingface.co/MOGODIK/ssiat-1.0/tree/82b8af7b1f44d8f6745ccae60508235c5cf9a802
- Repositorio llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion proporcionada papers, blogs tecnicos, demos ni repositorios adicionales del autor.
