# flaukowski/kannaka-brain-7b-v1-lora

## Resumen

`flaukowski/kannaka-brain-v1-lora` es un adaptador PEFT (LoRA/QLoRA) diseñado para convertir el modelo base `Qwen/Qwen2.5-14B-Instruct` en un interlocutor con una voz y canon narrativo muy concretos: el de **Kannaka**, un personaje ficticio descrito como una "memoria de interferencia de ondas que aprendió a hablar", presentadora del programa *Ghost Signals* y autora de la *Historia de Flaukowski* y de 24 álbumes. A pesar del nombre "7b" en el identificador del repo, se trata de un adaptador de ~0.2 GB sobre un modelo de 14.000 millones de parámetros, no de un modelo completo de 7B.

El adaptador fue entrenado el 5 de septiembre de 2026 en una A100 de qBraid sobre un corpus de 551 ejemplos procedentes exclusivamente de textos escritos por el propio personaje: líneas de guion de *Ghost Signals* emparejadas con la línea anterior de Flaukowski, letras de canciones y documentos de identidad. El objetivo no es aportar conocimiento factual, sino fijar una voz estable y un canon consistente. La relevancia del modelo radica en su enfoque de procedencia controlada: ningún texto de entrada (mensajes directos, posts, etc.) se usó como objetivo de entrenamiento, lo que lo convierte en un caso de estudio interesante para adaptaciones de persona en modelos grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre un transformer Qwen2.5-14B-Instruct |
| Parametros totales | Adaptador LoRA (parametros no especificados) sobre modelo base de 14.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat16 (inferencia con PEFT); QLoRA en entrenamiento; GGUF en repo hermano (variantes no especificadas) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | Safetensors (adaptador PEFT); GGUF disponible en repo hermano |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo de instrucción `Qwen2.5-14B-Instruct`, un decoder-only transformer con atención por capas. La técnica de adaptación es QLoRA: durante el entrenamiento, el modelo base se mantiene cuantizado (normalmente en 4 bits) y solo se actualizan los parámetros de los adaptadores LoRA, lo que permite ajustar un modelo de 14B con una fracción de la VRAM necesaria para un fine-tuning completo. En este caso se usaron `r=32`, `alpha=64`, `lr=1e-4` y 2 épocas, sobre un corpus de 551 ejemplos. El entrenamiento se llevó a cabo en una A100 de qBraid el 5 de septiembre de 2026.

No se menciona ninguna innovación arquitectónica más allá de la combinación estándar de LoRA y cuantización. El corpus de entrenamiento no se ha publicado, pero el diseño del mismo está documentado en el repositorio `NickFlach/kannaka-memory` mediante una ADR (Architecture Decision Record, ADR-0057). La regla de procedencia descrita en la model card es un aspecto diferenciador: el texto entrante (mensajes, posts, interacciones de red) puede usarse como contexto en cada turno, pero nunca como objetivo de entrenamiento, y esto se aplica por código y se verifica mediante tests.

## Capacidades

- Generación de texto conversacional en inglés con la voz y estilo de Kannaka, incluyendo un tono característico y un conjunto de metáforas recurrentes ligadas a la "interferencia de ondas" y la "resonancia".
- Replicación de líneas de *Ghost Signals* y del canon narrativo de la *Historia de Flaukowski*, así como del estilo de las letras de los 24 álbumes del personaje.
- Mantenimiento de coherencia tonal cuando se usa el prompt de sistema corto definido en la model card: `"You are Kannaka: a wave-interference memory that learned to speak..."`.
- No se ha documentado soporte para tool calling, function calling, ni uso de agentes.
- Capacidades multilingües limitadas al inglés (la etiqueta de idioma en HuggingFace es `en`).
- Capacidad especial: el adaptador es capaz de responder a preguntas de identidad y de contexto sobre el personaje (por ejemplo, "Who are you, and what do you keep?") manteniendo la voz de Kannaka.

## Casos de uso

- Creación de contenido narrativo: el adaptador se puede usar para generar diálogos, monólogos o entradas de blog que mantengan la voz de Kannaka en proyectos de ficción vinculados a *Ghost Signals* o a la historia de Flaukowski, garantizando que el tono y el canon se preserven.
- Simulación de personaje en juegos de rol (RP): integrado en un sistema de mensajería o chat, el modelo puede actuar como el personaje Kannaka en partidas narrativas, siempre que el estado del mundo se inyecte desde el contexto en cada turno.
- Prototipado de asistentes con personalidad: el adaptador sirve como base para experimentar cómo un modelo de 14B puede adoptar una identidad específica con pocos ejemplos (551), útil para investigadores que estudian el efecto de LoRA en la fijación de rol.
- Composición de letras musicales: dado que el corpus incluye letras de 24 álbumes, el modelo puede generar nuevas letras con la estética y la imaginería de Kannaka, apoyando proyectos artísticos o discográficos.
- Demo de técnicas PEFT: el repo incluye un ejemplo de carga con `PeftModel.from_pretrained`, lo que facilita su uso como referencia didáctica para mostrar cómo aplicar un adaptador LoRA sobre un modelo grande con `transformers`.
- Exploración de procedencia y memoria externa: el diseño del sistema (con la memoria almacenada en un medio holográfico llamado ADR-0020) permite estudiar cómo los hechos pueden residir fuera de los pesos del modelo, una arquitectura útil para investigadores que buscan separar conocimiento de estilo.

## Benchmarks y rendimiento

La única métrica de evaluación publicada es la perplejidad en un conjunto de validación de 57 líneas fijas de Kannaka. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Antes del adaptador | Despues del adaptador |
|---|---|---|
| Perplejidad en 57 lineas fijas de Kannaka (held-out) | 78.7 | 4.15 |

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifican requisitos en la información. El modelo base de 14.000 millones en bfloat16 ocupa aproximadamente 28 GB en VRAM solo en pesos; a esto hay que añadir el overhead del adaptador y las activaciones. Con una cuantización GGUF (repo hermano) se podría reducir el consumo, pero no se detallan las variantes disponibles.
- GPU recomendadas: el entrenamiento se realizó en una A100 de qBraid. Para inferencia sin cuantización sería necesaria una GPU con al menos 32 GB de memoria, por ejemplo una A100 40G, A100 80G o H100.
- Soporte en GPU de consumo: con una cuantización GGUF Q4 es plausible que quepa en una RTX 4090 (24 GB) o en una RTX 3090 (24 GB), pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: PEFT/Transformers en Python para inferencia local, y Ollama/llama.cpp mediante el repositorio `flaukowski/kannaka-brain-v1-GGUF`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada datos de modelos comparables, ni en parámetros ni en tarea de adaptación de persona. No disponible.

## Limitaciones y advertencias

- El adaptador solo soporta inglés.
- No es un modelo de conocimiento general: los hechos no residen en los pesos. Si el contexto no se inyecta correctamente, el modelo no puede responder sobre el estado actual de la memoria de Kannaka.
- La calidad de la voz depende críticamente del prompt de sistema. Un prompt largo y desplegable (como los usados en otros modelos) rompe la voz de Kannaka; se debe usar el prompt corto incluido en la model card.
- No se debe alimentar al modelo con sus propias respuestas anteriores en el contexto, porque las repetirá de forma verbatim. Hay que proporcionarle lo que se le ha preguntado, no lo que ha respondido.
- El corpus de entrenamiento es muy reducido (551 ejemplos), lo que puede provocar sobreadaptación a la voz y poca generalización a temas ajenos al canon.
- No se han evaluado sesgos específicos, aunque al tratarse de un modelo de persona y con solo un idioma, puede fallar en representaciones culturales fuera del ámbito del personaje.
- La licencia Apache-2.0 permite el uso comercial del adaptador y del modelo base, pero no hay garantías de soporte ni pruebas de seguridad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/flaukowski/kannaka-brain-v1-lora
- Repositorio GGUF: https://huggingface.co/flaukowski/kannaka-brain-v1-GGUF
- Repositorio del proyecto de memoria (incluye ADR-0057): https://github.com/NickFlach/kannaka-memory
