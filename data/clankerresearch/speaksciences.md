# ClankerResearch/SpeakSciences

## Resumen

SpeakSciences Qwen3.5-2B es un modelo de lenguaje experimental desarrollado por ClankerResearch, un laboratorio que trabaja con presupuestos reducidos y cuyo objetivo declarado es "descentralizar la IA de frontera". Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-2B, orientado específicamente a conversación casual y comportamiento de mensajería de texto (texting) natural, con respuestas cortas, uso contextual de jerga y adaptación al estilo comunicativo del interlocutor. El modelo se publica bajo licencia MIT en formato safetensors, con 2.213.241.664 parámetros (aproximadamente 2,2 mil millones).

El proyecto no busca maximizar el rendimiento en benchmarks generales, sino explorar hasta dónde puede llegar un modelo pequeño en cuanto a comportamiento conversacional convincente con recursos de entrenamiento limitados. Según la model card, el entrenamiento se realizó en una NVIDIA A100 durante unas dos horas, utilizando un pipeline de fine-tuning en dos etapas: una primera de conversación general y una segunda de alineación mediante DPO (Direct Preference Optimization). El modelo se encuentra en estado de vista previa (preview) y está en desarrollo activo; el autor planea publicar el código de entrenamiento, resultados de benchmarks y ejemplos de inferencia en una versión final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-2B) |
| Parametros totales | 2.213.241.664 (~2,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-2B, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el base Qwen3.5-2B es multilingüe, pero no se indica para este fine-tuning) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-2B, un modelo denso de aproximadamente 2 mil millones de parámetros. No se proporcionan detalles adicionales sobre la arquitectura interna (número de capas, dimensiones, mecanismos de atención) más allá de lo heredado del modelo base. El entrenamiento se realizó con el framework Unsloth sobre una GPU NVIDIA A100, con un tiempo total de aproximadamente dos horas.

El proceso de entrenamiento consta de dos etapas:

1. **Fine-tuning de conversación general**: se entrena el modelo en una mezcla de datos propietaria (closed-source) para establecer una base sólida de comportamiento conversacional informal en diversos escenarios de diálogo casual.
2. **Alineación de comportamiento de texting mediante DPO**: se aplica Direct Preference Optimization para especializar el modelo en preferencias específicas como longitud de respuesta natural, tono conversacional, reducción de lenguaje robótico, uso apropiado de jerga, adaptación al estilo del interlocutor y fluidez en intercambios de varios turnos.

El autor indica que el pipeline completo de entrenamiento se abrirá junto con la versión final. También menciona experimentos previos con un modelo interno basado en Qwen3.6-27B, evaluado en servidores de Discord con resultados conversacionales "indistinguibles", pero ese modelo no está disponible públicamente.

## Capacidades

- Generación de texto conversacional natural y casual, orientado a mensajería de texto (texting).
- Respuestas cortas y conscientes del contexto, evitando respuestas excesivamente largas o formales.
- Uso de jerga contemporánea cuando es apropiado al contexto.
- Adaptación del tono y estilo de escritura al interlocutor.
- Conversaciones multi-turno en entornos informales.
- Capacidad de dar explicaciones concisas sin exponer cadenas de razonamiento internas (ocultación del chain-of-thought privado).
- No se mencionan capacidades de tool calling, agentes, visión, audio ni razonamiento matemático avanzado; el modelo está especializado en conversación, no en tareas generales.

## Casos de uso

- **Asistentes de mensajería personal**: el modelo puede integrarse en aplicaciones de chat (WhatsApp, Telegram, Discord) para responder mensajes de forma natural y con un tono cercano a un humano, adaptándose al estilo del usuario.
- **Chatbots de atención al cliente informal**: para servicios donde se busca una experiencia relajada y cercana, el modelo puede gestionar consultas sencillas con respuestas breves y amables, aunque no está diseñado para tareas de conocimiento profundo.
- **Simulación de personajes en juegos de rol**: gracias a su enfoque en conversación casual y uso de jerga, puede servir para dar vida a personajes no jugadores (NPC) en entornos de rol por texto.
- **Generación de diálogos para guiones o narrativa**: escritores pueden usarlo para crear intercambios realistas entre personajes en contextos informales.
- **Entrenamiento de habilidades sociales**: como herramienta de práctica para mejorar conversaciones informales, el modelo ofrece respuestas variadas y adaptativas.
- **Prototipado rápido de interfaces conversacionales**: desarrolladores pueden usarlo como backend de un prototipo de chatbot casual sin necesidad de un modelo grande, gracias a su bajo coste de inferencia.
- **Investigación en alineación de comportamiento conversacional**: el modelo sirve como caso de estudio sobre cómo el fine-tuning con DPO y recursos limitados afecta al estilo comunicativo de un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados están "próximamente" y que se planea evaluar el modelo con FitnaBench, un benchmark de código abierto centrado en comportamiento conversacional y de texting. Hasta la versión final, no hay datos comparativos con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita, pero para un modelo de 2,2 B parámetros en FP16 se requieren aproximadamente 4,5 GB de VRAM; con cuantización a 8 bits se reduce a unos 2,5 GB, y a 4 bits a unos 1,5 GB (estimaciones basadas en el tamaño del modelo, no en datos oficiales).
- **GPU recomendadas**: el entrenamiento se realizó en una NVIDIA A100; para inferencia, cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) es suficiente en FP16. Para cuantización, incluso GPUs con 4 GB podrían ser viables.
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en GPUs de consumo actuales, especialmente con cuantización.
- **Opciones de despliegue**: el autor menciona Unsloth como su entorno principal de inferencia. Dado que el modelo está en formato safetensors y es compatible con el ecosistema Qwen, se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI, aunque no se proporcionan instrucciones oficiales.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. El modelo es un fine-tuning de Qwen3.5-2B, por lo que la comparación natural sería con el propio modelo base y con otros modelos de ~2-3 B parámetros orientados a conversación, como Llama-3.2-3B, Gemma-2-2B o Phi-3.5-mini. Sin embargo, al no haber benchmarks publicados, no es posible establecer una comparación cuantitativa. Se puede señalar que SpeakSciences está especializado en texting y conversación casual, mientras que los modelos base generales priorizan razonamiento y conocimiento.

## Limitaciones y advertencias

- **Modelo experimental en vista previa**: puede cambiar sustancialmente entre versiones; no se recomienda para producción sin una evaluación exhaustiva.
- **Alucinaciones**: el propio autor advierte que el modelo puede inventar información.
- **Inconsistencia en respuestas**: puede producir respuestas inconsistentes o variar notablemente según la configuración de inferencia.
- **Interpretación errónea de jerga o contexto conversacional**: puede malinterpretar slang o matices del lenguaje informal.
- **Rendimiento inferior en razonamiento y conocimiento**: al estar especializado en conversación, es previsible que rinda peor que modelos generales más grandes en tareas de lógica, matemáticas o conocimiento factual.
- **Datos de entrenamiento cerrados**: la mezcla de datos es propietaria y no se ha publicado, lo que dificulta la auditoría de sesgos.
- **Sin garantías de seguridad**: no se mencionan evaluaciones de sesgos, toxicidad o seguridad; el uso en entornos públicos requiere precaución.
- **Licencia MIT**: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo.

## Enlaces

- [HuggingFace - ClankerResearch/SpeakSciences](https://huggingface.co/ClankerResearch/SpeakSciences)
- [Perfil de ClankerResearch en HuggingFace](https://huggingface.co/ClankerResearch/models)
- [Clank.world - plataforma de roleplay de IA del mismo equipo](https://www.clank.world/)
- [Clanker AI - asistente personal del equipo](https://clanker-ai.com/welcome)
