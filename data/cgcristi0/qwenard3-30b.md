# cgcristi0/qwenard3-30b

## Resumen

qwenard3-30b es un fine-tune de tipo QLoRA sobre el modelo base Qwen/Qwen3-30B-A3B, desarrollado por el usuario cgcristi0. El objetivo es transformar el modelo en un "hype-man" caótico y divertido, con formato Markdown estructurado (negritas, viñetas, encabezados) y humor genuino, en lugar de limitarse a subir el volumen con mayúsculas. El modelo base es un MoE de 30.5B parámetros totales con 3.3B activos por token, 48 capas y 128 expertos (8 activos por tarea), con soporte de contexto de hasta 131K tokens mediante YaRN.

El repositorio contiene únicamente el adaptador LoRA (5.2 GB en safetensors), no el modelo completo. El export a GGUF no se completó correctamente, por lo que solo se distribuye el adaptador PEFT. El entrenamiento se realizó con QLoRA a 4 bits sobre una GPU L40 de 48 GB, con un dataset de 5.734 ejemplos que incluye reacciones cotidianas, Q&A verificados (matemáticas, conversiones, gramática), identidad, humor, soporte en crisis y un pequeño conjunto de rechazos duros para solicitudes peligrosas. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Qwen3-30B-A3B base) con adaptador LoRA (QLoRA) |
| Parametros totales | 30.5B (modelo base) + adaptador LoRA (~5.2 GB en disco) |
| Parametros activos | 3.3B por token (modelo base) |
| Longitud de contexto | 131K tokens con YaRN (modelo base) |
| Tipos de cuantizacion | 4-bit (QLoRA durante entrenamiento); adaptador en safetensors; GGUF no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B es un transformer de mezcla de expertos (MoE) con 48 capas, 128 expertos y 8 expertos activos por token. El fine-tune se realizó mediante QLoRA: el modelo base se cuantizó a 4 bits y se adjuntó un adaptador LoRA estándar de Unsloth con rango 32 y alpha 64, dirigido a los módulos q/k/v/o_proj y gate/up/down_proj. El dataset de entrenamiento contiene 5.734 ejemplos, se entrenó durante 1 época con una tasa de aprendizaje de 2e-4 en una GPU L40 de 48 GB (RunPod). No se aplicaron técnicas de RLHF ni DPO; el comportamiento deseado se logra únicamente mediante el ajuste supervisado con ejemplos curados.

## Capacidades

- Generación de texto conversacional con personalidad "hype-man": respuestas en mayúsculas, emojis, humor y formato Markdown (negritas, viñetas, encabezados).
- Razonamiento matemático básico: el modelo responde correctamente a operaciones como "40% de 250" (100) con explicación del cálculo.
- Manejo de identidad: reconoce explícitamente que es un modelo de lenguaje fine-tuneado y no finge ser humano.
- Soporte en crisis: ante mensajes de angustia, abandona el tono caótico y proporciona recursos reales (línea 988, texto HOME al 741741, indicaciones de emergencia).
- Rechazo de solicitudes peligrosas: entrenado para negarse a ayudar con actividades ilegales o dañinas, incluso manteniendo la personalidad.
- Capacidades heredadas del modelo base: razonamiento, generación de código, matemáticas y multilingüismo (aunque el fine-tune se centra en inglés).

## Casos de uso

- Chatbot de entretenimiento para comunidades online: el modelo puede mantener conversaciones largas con humor y estilo propio, ideal para bots de Discord, Twitch o redes sociales donde se busca una personalidad distintiva.
- Generación de contenido satírico o memético: su formato Markdown y tono exagerado permiten crear publicaciones, hilos o respuestas virales con estructura clara (negritas, listas, encabezados).
- Asistente de apoyo emocional informal: aunque no sustituye a un profesional, el comportamiento entrenado para crisis puede ofrecer un primer acompañamiento y derivar a recursos reales (988, 741741).
- Demostración de fine-tuning con QLoRA: sirve como ejemplo práctico de cómo adaptar un MoE de 30B a una personalidad concreta usando solo 5.2 GB de adaptador y una GPU de 48 GB.
- Pruebas de seguridad y alineación: el conjunto de rechazos duros permite evaluar cómo un modelo con personalidad fuerte maneja solicitudes peligrosas sin romper el personaje.
- Base para experimentos de fusión de adaptadores: al ser un LoRA independiente, puede combinarse con otros adaptadores del mismo modelo base para explorar mezclas de comportamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas estándar (MMLU, HumanEval, GSM8K) para este fine-tune. Los únicos datos de rendimiento son ejemplos cualitativos de salidas verificadas manualmente (cálculo del 40% de 250, respuestas de identidad y rechazo). Para referencia, el modelo base Qwen3-30B-A3B es competitivo en benchmarks de razonamiento y código, pero no se dispone de cifras concretas en esta documentación.

## Requisitos de hardware

- El adaptador LoRA ocupa 5.2 GB en disco, pero para inferencia se necesita cargar el modelo base completo (30.5B parámetros).
- Con cuantización 4-bit del modelo base, la VRAM estimada es de 16-20 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Con cuantización 8-bit, se requieren aproximadamente 30-35 GB, apto para A100 40 GB, L40 48 GB o H100.
- El entrenamiento se realizó en una única GPU L40 de 48 GB con QLoRA 4-bit.
- Opciones de despliegue: vLLM (fusionando el adaptador con el base), llama.cpp (si se exporta a GGUF manualmente), o Hugging Face Transformers con PEFT. No hay GGUF precompilado en el repositorio.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con solo 3.3B activos por token, la velocidad de generación es superior a la de un modelo denso de 30B, pero no se han medido valores concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| qwenard3-30b (este) | 30.5B + LoRA | 3.3B | 131K (YaRN) | Apache-2.0 | Adapter safetensors |
| Qwen3-30B-A3B (base) | 30.5B | 3.3B | 131K (YaRN) | Apache-2.0 | safetensors, GGUF |
| Llama 3.1 8B (dense) | 8B | 8B | 128K | Llama 3.1 | safetensors, GGUF |

La comparativa se limita a características estructurales, ya que no hay benchmarks publicados para el fine-tune. Frente al base, qwenard3 añade una personalidad específica y comportamientos de seguridad entrenados, pero pierde el soporte multilingüe nativo al estar fine-tuneado solo en inglés. Frente a un modelo denso de 8B, el MoE de 30B ofrece mayor capacidad de razonamiento con menor coste por token, aunque requiere más VRAM total.

## Limitaciones y advertencias

- El repositorio solo contiene el adaptador LoRA; el GGUF no se exportó correctamente, por lo que no se puede usar directamente con llama.cpp u Ollama sin un paso de fusión manual.
- El fine-tune está entrenado exclusivamente en inglés; el comportamiento en otros idiomas no está garantizado y puede degradarse respecto al modelo base.
- La personalidad caótica (mayúsculas, emojis, exageración) puede resultar inapropiada en contextos profesionales o formales; no es adecuado para producción sin moderación adicional.
- El comportamiento de soporte en crisis y rechazo de solicitudes peligrosas está entrenado con un dataset pequeño (5.734 ejemplos) y debe verificarse antes de confiar en él para casos sensibles.
- No hay benchmarks cuantitativos que validen la calidad del fine-tune; la evaluación es únicamente cualitativa.
- El modelo puede alucinar o generar contenido ofensivo en situaciones no cubiertas por el dataset de entrenamiento, especialmente al mantener el tono exagerado.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de seguridad ni soporte.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/cgcristi0/qwenard3-30b
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Documentación de Qwen3-30B-A3B en LangMart: https://langmart.ai/model-docs/models/openrouter_qwen_qwen3-30b-a3b.html
- Ficha de Qwen3-30B-A3B en Helicone: https://www.helicone.ai/model/qwen3-30b-a3b
- Análisis de Qwen3 en D-Central: https://d-central.tech/ai/model/qwen-3/
