# anonymous312874/RSIGame-Qwen3.8-27B

## Resumen

RSIGame-Qwen3.8-27B es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.8-27B, publicado por el usuario anónimo anonymous312874. Su proposito no es el de un asistente conversacional general, sino el de un generador de codigo orientado a agentes: a partir de un documento de diseno escrito, produce un proyecto de videojuego 2D completo y ejecutable para Godot 4 o Phaser. El adaptador se ha entrenado sobre trayectorias de generacion de juegos producidas por el bucle de desarrollo de RSIGame, junto con planes de desarrollo a nivel de fichero.

El modelo se distribuye en formato PEFT (adapter_model.safetensors y adapter_config.json) y su repo ocupa aproximadamente 0,5 GB, lo que corresponde a los pesos del adaptador y no al modelo completo. La licencia es Apache-2.0, en coherencia con el modelo base. La model card indica explicitamente que se trata de un generador de codigo y no de un chatbot, y recomienda su uso como agente con herramientas (por ejemplo dentro de Codex CLI).

La relevancia actual del modelo radica en su enfoque: un adaptador pequeno y especializado que se fusiona con el base para servir con vLLM, incorporando parser de tool calls en formato XML de Qwen y parser de razonamiento. La informacion publica disponible es escasa: no hay datos de benchmarks, ni de idiomas soportados, ni de composicion detallada del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.8-27B |
| Parametros totales | no disponible (adaptador de ~0,5 GB; el total depende del base Qwen3.8-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo menciona servicio en bfloat16 tras fusionar el adaptador) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT: adapter_model.safetensors, adapter_config.json) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango bajo sobre el modelo base Qwen/Qwen3.8-27B, que se carga mediante `peft.PeftModel` sobre `transformers.AutoModelForCausalLM`. La model card especifica el uso de escalado rsLoRA y describe el proceso de fusion del adaptador en los pesos base mediante W ← W + (α/√r)·BA, calculado en fp32 y almacenado en bfloat16. Para el servicio en produccion se recomienda fusionar el adaptador y servir el modelo resultante con vLLM, anadiendo un parser de tool calls para el formato XML de Qwen y un parser de razonamiento.

Los datos de entrenamiento provienen del dataset RSIGame/EvoGame-SFT, compuesto por trayectorias de generacion agentica de juegos y planes de desarrollo a nivel de fichero generados por el bucle de desarrollo de RSIGame. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card cita un trabajo bajo revision titulado "RSIGame: Controllable Agentic Game Development with Recursive Self-improvement", pero no se aportan detalles tecnicos adicionales sobre el proceso de entrenamiento.

## Capacidades

- Generacion de codigo completo de proyectos de videojuego 2D ejecutables a partir de un documento de diseno escrito.
- Soporte especifico para dos stacks: Godot 4 y Phaser.
- Uso como agente de codificacion con herramientas (tool calling), con formato XML de tool calls de Qwen y parser de razonamiento.
- Generacion de planes de desarrollo a nivel de fichero (file-level development plans).
- Integracion en flujos agenticos multi-paso (por ejemplo, Codex CLI).
- Generacion de texto (pipeline_tag: text-generation).
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Generacion de prototipos de videojuegos 2D: dado un documento de diseno, el modelo produce un proyecto Godot 4 o Phaser completo y ejecutable, lo que permite validar mecanicas de juego en horas en lugar de dias.
- Agente de codificacion en CLI: integrado en Codex CLI u otro agente con herramientas, el modelo ejecuta ciclos de generacion, escritura de ficheros y correccion sobre el proyecto de juego, apoyandose en su entrenamiento sobre trayectorias agenticas.
- Planificacion de desarrollo a nivel de fichero: el adaptador genera planes que descomponen el diseno del juego en ficheros y tareas concretas, utiles como entrada para pipelines de generacion automatizada.
- Generacion de escenas y scripts de Godot 4: el modelo escribe scripts GDScript y ficheros de escena coherentes con la estructura de un proyecto Godot, al haber sido entrenado especificamente en este stack.
- Generacion de juegos web con Phaser: produce codigo JavaScript/TypeScript y estructura de proyecto para juegos 2D en navegador, adecuado para prototipado rapido y demos jugables.
- Iteracion automatizada sobre un proyecto existente: como agente con acceso a herramientas de sistema de ficheros, el modelo puede aplicar planes de desarrollo incrementales sobre un repositorio de juego ya creado.
- Evaluacion de disenos de juego mediante generacion de codigo: convertir un documento de diseno en una implementacion funcional permite comprobar la viabilidad tecnica del diseno antes de invertir en desarrollo manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,5 GB, pero la inferencia requiere cargar el modelo base Qwen/Qwen3.8-27B completo.
- VRAM estimada para el base en bfloat16: no disponible con precision (depende del numero exacto de parametros del base, no publicado en la informacion disponible).
- GPU recomendadas: no disponible. La model card solo menciona el servicio con vLLM tras fusionar el adaptador, sin especificar GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: vLLM con parser de tool calls XML de Qwen y parser de razonamiento (recomendado por el autor); carga mediante transformers + PEFT para uso directo del adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSIGame-Qwen3.8-27B | LoRA sobre Qwen3.8-27B | adaptador ~0,5 GB (base no disponible) | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | Modelo completo | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en generacion de codigo de juegos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La model card advierte explicitamente de que el modelo es un generador de codigo y no un asistente conversacional; su uso como chatbot producira resultados deficientes.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni evaluaciones de calidad del codigo generado.
- No se especifican los idiomas soportados; el entrenamiento esta orientado a generacion de codigo, no a conversacion multilingue.
- La longitud de contexto no esta documentada, lo que dificulta planificar tareas sobre documentos de diseno extensos o proyectos grandes.
- El autor es anonimo y el trabajo asociado esta "under review"; no hay publicacion revisada por pares disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion.
- El uso comercial esta permitido por Apache-2.0, pero requiere cumplir tambien la licencia del modelo base Qwen/Qwen3.8-27B, cuyos terminos no se detallan en la informacion disponible.
- El despliegue recomendado exige fusionar el adaptador y configurar parsers especificos (tool calls XML y razonamiento) en vLLM; una configuracion incorrecta degradara el comportamiento agentico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anonymous312874/RSIGame-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/RSIGame/EvoGame-SFT
