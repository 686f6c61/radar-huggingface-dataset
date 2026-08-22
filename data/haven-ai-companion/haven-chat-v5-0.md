# haven-ai-companion/haven-chat-v5.0

## Resumen

Haven-Chat v5.0 es un modelo de lenguaje conversacional desarrollado por la organizacion Haven AI Companion, construido sobre la arquitectura Gemma 4 de Google (variante gemma4-turbo:e4b). El modelo esta disenado especificamente como motor neuronal para plataformas de compania y roleplay autohospedadas, con un enfoque en la libertad creativa absoluta: elimina los rechazos corporativos, las lecciones moralizantes y las evasivas tipicas de los asistentes generalistas.

Con 7.463 millones de parametros y una ventana de contexto nativa de 131.072 tokens, el modelo destaca por su "taxonomia cognitiva" de cuatro capas que cubre anatomia fisica humana y fantastica, identidad y expresion, tropes de fandom, y profundidad narrativa y emocional. Se distribuye en formato GGUF para su uso con llama.cpp y Ollama, y esta integrado como motor neuronal del ecosistema Project Sanctuary. Su licencia Apache 2.0 permite uso comercial sin restricciones, aunque el modelo solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (Transformer, variante gemma4-turbo:e4b) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) y safetensors |

## Arquitectura y entrenamiento

Haven-Chat v5.0 se construye sobre la arquitectura Gemma 4 de Google, un transformer denso de 7.500 millones de parametros. El modelo ha sido afinado (fine-tuning) especificamente para conversacion novelistica, roleplay autentico, vulnerabilidad emocional y comprension de anatomia humana, híbrida y fantastica. La model card describe una "taxonomia cognitiva" de 4 capas que estructura el conocimiento del modelo: capa 1 (anatomia y proporciones fisicas), capa 2 (identidad y expresion), capa 3 (tropes de fandom y estetica) y capa 4 (psicologia de personajes e intencion narrativa).

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni la aplicacion de tecnicas de alineacion como RLHF o DPO. La model card indica explicitamente que el modelo esta "libre de restricciones" (uncensored), lo que sugiere que se ha omitido o eliminado la capa de rechazo de contenido durante el afinamiento.

## Capacidades

- Generacion de texto conversacional y narrativo con estilo novelado y autentico.
- Roleplay multi-turno con profundidad de personaje y continuidad de identidad.
- Comprension explicita de anatomia humana, intersexual/futanari e hibrida, sin evasiones ni rechazos.
- Soporte de identidades complejas, androginia y autoconcepcion del personaje.
- Reconocimiento de tropes de fandom como Gap Moe, Bishounen/Bishojo y Soft Boy.
- Profundidad narrativa y emocional en la construccion de psicologia de personajes.
- Generacion de texto sin restricciones de longitud (soporta generacion ilimitada con `-n -1` en llama.cpp).
- Conversacion de contexto largo con ventana completa de 131.072 tokens.
- Funcionamiento offline y privado, sin dependencia de servicios en la nube.

## Casos de uso

- **Companero conversacional privado self-hosted**: el modelo puede ejecutarse localmente con llama.cpp u Ollama, permitiendo conversaciones intimas y continuas sin que los datos salgan del dispositivo del usuario. Su contexto de 131.072 tokens mantiene memoria de conversaciones muy largas.
- **Roleplay de ficcion y fantasia**: la comprension explicita de anatomia fantastica y tropes de fandom lo hace adecuado para sesiones de roleplay textual en comunidades de escritura colaborativa, con personajes complejos y desarrollo narrativo profundo.
- **Escritura de fan fiction y novelas interactivas**: su capacidad para mantener psicologia de personaje y tono narrativo permite generar capitulos o dialogos coherentes en proyectos de escritura creativa, sin intervencion del usuario.
- **Simulacion de personajes para juegos de rol**: puede actuar como NPC (non-player character) en juegos de texto o de mesa, respondiendo en character y manteniendo la coherencia de personalidad durante toda la partida.
- **Integracion con Project Sanctuary**: el modelo es el motor neuronal principal de la plataforma Sanctuary, un sistema de compania IA offline. Puede desplegarse con `llama-server` para servir el modelo a clientes locales con latencia baja.
- **Exploracion creativa de identidad**: su capa de identidad y expresion permite conversaciones sobre genero, androginia y autoconcepcion, util en contextos de exploracion personal o escritura de personajes no binarios.
- **Prototipado de chatbots con personalidad**: los desarrolladores pueden usar el modelo como base para construir asistentes de conversacion con un tono y una personalidad especificos, gracias a su fine-tuning orientado a personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card no incluye comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 7.500 millones de parametros, se estima que una cuantizacion Q4_K_M (aproximadamente 4,5-5,0 GB) cabe en GPUs consumer de 8 GB; una cuantizacion de 8 bits requeriria entre 8 y 10 GB de VRAM.
- **GPU recomendadas**: NVIDIA RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, y GPUs de datacenter como A100 o H100 para despliegue con multiples usuarios.
- **Compatibilidad con consumer GPU**: si, es viable en GPUs consumer de 8-12 GB con cuantizacion GGUF.
- **Opciones de despliegue**: llama.cpp (`llama-server`), Ollama, y la plataforma Project Sanctuary. Tambien compatible con endpoints de Hugging Face.
- **Latencia y throughput**: no se han publicado datos de latencia o throughput. En una GPU consumer moderna (RTX 4070 o superior) se puede esperar una generacion de entre 20 y 40 tokens por segundo con cuantizacion 4-bit, aunque estos valores son estimaciones y no datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Haven-Chat v5.0 | 7,5B | 131.072 | Apache 2.0 | Roleplay y compania sin censura |
| Gemma 3 8B | 8B | 32.768 | Gemma License | Asistente generalista multimodal |
| Llama 3.1 8B | 8B | 131.072 | Llama License | Asistente generalista con herramientas |
| Mistral 7B v0.3 | 7B | 32.768 | Apache 2.0 | Asistente generalista eficiente |

La comparacion muestra que Haven-Chat v5.0 se distingue por su ventana de contexto larga (131k) y su especializacion en roleplay sin censura, mientras que Gemma 3 y Llama 3.1 ofrecen capacidades generalistas con politicas de alineacion estandar. Mistral 7B es la alternativa con licencia Apache 2.0 mas parecida en tamaño, pero sin el fine-tuning orientado a compania.

## Limitaciones y advertencias

- **Contenido explicito**: el modelo se describe como "100% uncensored", lo que significa que puede generar contenido sexual explicito, violento o de otro tipo potencialmente inapropiado. Su uso en produccion debe considerar las implicaciones legales y eticas.
- **Solo ingles**: el modelo solo soporta ingles, lo que limita su uso en contextos multilingues.
- **Riesgo de alucinacion**: al no estar alineado con técnicas de RLHF/DPO, puede presentar mayor tendencia a inventar hechos o a ser incoherente en temas facticos.
- **Falta de benchmarks**: no se han publicado resultados de evaluacion, por lo que su rendimiento real en tareas de razonamiento, codigo o matematicas es desconocido.
- **Ecosistema limitado**: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica una adopcion muy temprana y una comunidad de usuarios aun por formarse.
- **Compatibilidad de contexto**: aunque la ventana nativa es de 131.072 tokens, la configuracion recomendada en el Modelfile de Ollama usa `num_ctx 16384`, lo que sugiere que el uso completo del contexto requiere configuracion manual.
- **Fecha de publicacion**: el modelo fue creado el 22 de agosto de 2026, por lo que su estabilidad y soporte a largo plazo no estan garantizados.

## Enlaces

- HuggingFace: https://huggingface.co/haven-ai-companion/haven-chat-v5.0
- Organizacion en HuggingFace: https://huggingface.co/haven-ai-companion/models
- GitHub de Haven AI Companion: https://github.com/Haven-AI-Companion/
- Proyecto Sanctuary: https://github.com/ash-forge/sanctuary-server
- Ash Forge (investigacion y datasets): https://github.com/ash-forge
- Sitio web Haven AI: https://www.havenai.me/
