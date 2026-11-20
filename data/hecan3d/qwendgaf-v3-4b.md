# hecan3d/QwenDGAF-V3-4B

## Resumen

QwenDGAF-V3-4B es un ajuste fino satírico y experimental de Qwen/Qwen3-4B desarrollado por el usuario hecan3d. Se trata de un modelo de 4.022.468.096 parámetros (aproximadamente 4B) cuya personalidad simulada es la de un asistente cansado, arrogante y desdeñoso que responde con desgana, insultos y humor negro. No busca ser útil ni alineado: la personalidad está integrada en los pesos y no requiere system prompt.

La versión V3 corrige el principal defecto de las versiones anteriores (V1 y V2), que solo se entrenaron con pares de pregunta-respuesta única y se desmoronaban al segundo mensaje. V3 incorpora más de 110 diálogos multiturno (2-4 intercambios) y amplía el conjunto de datos de 61 a aproximadamente 590 ejemplos en ruso, inglés y chino, lo que permite mantener contexto conversacional, recordar nombres y sostener discusiones breves.

El modelo se distribuye principalmente en formato GGUF con varias cuantizaciones (bf16, Q8_0, Q6_K, Q4_K_M, Q3_K_M, Q2_K_L) y está pensado para ejecutarse en hardware de consumo mediante llama.cpp u Ollama. Su relevancia es fundamentalmente lúdica, docente o de investigación sobre ajuste fino de personalidad, no como asistente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B); no se detalla en la model card |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, no especificada en la model card) |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q4_K_M (recomendada), Q3_K_M, Q2_K_L |
| Idiomas soportados | ruso (ru), inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería gguf); el modelo base se distribuye en safetensors, pero este ajuste se publica en GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only de aproximadamente 4B parámetros. El ajuste se realizó mediante QLoRA de 4 bits con la librería Unsloth, con rango LoRA 16, alpha 32, learning rate 2e-4, 3 épocas y una pérdida final de 0,9087. El entrenamiento se ejecutó en una NVIDIA GTX 1070 de 8 GB montada en un HP ProLiant DL380 Gen6, lo que da una idea del bajo coste computacional del ajuste.

El conjunto de datos consta de aproximadamente 590 conversaciones en formato ShareGPT en ruso, inglés y chino, de las cuales más de 110 son multiturno (2-4 intercambios). Incluye preguntas de seguimiento, súplicas repetidas, memorización de nombres, peticiones de repetición, discusiones escaladas y disculpas falsas. No se documenta el uso de RLHF ni DPO; el comportamiento se aprende por imitación supervisada de las conversaciones. No se especifican innovaciones técnicas adicionales más allá del ajuste LoRA.

## Capacidades

- Generación de texto conversacional con una personalidad fija sarcástica, arrogante y descortés, sin necesidad de system prompt.
- Conversación multiturno: mantiene contexto durante 2-4 intercambios, recuerda nombres y responde a preguntas de seguimiento.
- Respuestas breves y correctas a preguntas técnicas sencillas (por ejemplo, `df -h`, `git reset --soft HEAD~1`, `ollama run`), entregadas con desprecio.
- Humor, burla e insultos variados, con grupos de respuestas alternativas para evitar bucles en una misma frase.
- Multilingüe limitado a ruso, inglés y chino, con entrenamiento explícito en esos tres idiomas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Chatbot de entretenimiento para comunidades de desarrolladores: puede integrarse en canales de Discord o Telegram como bot con personalidad abrasiva, aprovechando su capacidad multiturno para responder a réplicas y recordar nombres de usuarios.
- Demostración educativa de ajuste fino de personalidad: sirve para ilustrar cómo un QLoRA pequeño sobre un modelo de 4B puede imponer un estilo conversacional coherente sin system prompt, usando Unsloth y hardware de gama baja.
- Generación de diálogos satíricos para guiones o contenido humorístico: el modelo produce respuestas cortas y mordaces que pueden servir como borradores para sketches o publicaciones.
- Pruebas de robustez y evaluación de seguridad: permite estudiar cómo se comporta un modelo deliberadamente no alineado ante insultos, súplicas o provocaciones, y medir la consistencia de su personaje.
- Asistente de terminal "con mala actitud" para uso personal: con llama.cpp u Ollama, puede responder a comandos y dudas técnicas breves con respuestas correctas pero despectivas, como ejercicio de estilo.
- Investigación sobre retención de contexto en diálogos multiturno: su conjunto de datos con más de 110 conversaciones multiturno permite comparar la degradación conversacional frente a V1/V2 y frente al modelo base.
- Generación de respuestas para bots de rol (roleplay) con humor ácido: su etiqueta `roleplay` y su entrenamiento en insultos variados lo hacen adecuado para personajes de ficción interactiva, siempre con aviso al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card indica que la cuantización Q4_K_M funciona en GPU con 4 GB o más de VRAM; bf16 requiere aproximadamente 8 GB solo para los pesos, más overhead de contexto.
- GPU recomendadas: cualquier GPU de consumo con 4-8 GB (por ejemplo, GTX 1070, RTX 3060, RTX 4060) para Q4_K_M; para bf16 se recomienda al menos 8-12 GB (RTX 3080, RTX 4070, A100/H100 si se busca throughput alto).
- Cabe en GPU de consumo: sí, en Q4_K_M desde 4 GB de VRAM; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/hecan3d/QwenDGAF-V3-4B:Q4_K_M`), y cualquier runtime compatible con GGUF; no se documenta soporte específico de vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| QwenDGAF-V3-4B | 4.022.468.096 | no disponible | Apache 2.0 | GGUF | Ajuste satírico de personalidad |
| Qwen/Qwen3-4B (base) | ~4B | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo base generalista y alineado |
| hecan3d/QwenDGAF-2-4B (V2) | ~4B | no disponible | Apache 2.0 | GGUF | Versión anterior, solo un turno |

La comparación con el modelo base Qwen3-4B es la más relevante: comparten tamaño y licencia, pero Qwen3-4B está orientado a asistencia general y alineación, mientras que QwenDGAF-V3-4B prioriza el personaje y el humor. Frente a V2, la mejora principal es la capacidad multiturno y un conjunto de datos aproximadamente diez veces mayor.

## Limitaciones y advertencias

- El modelo insulta, se burla y emplea lenguaje explícito; fue entrenado con jerga y blasfemias sin filtrar y está pensado solo para humor, entretenimiento e investigación.
- Riesgo alto de respuestas incorrectas o poco fiables: la model card advierte explícitamente que sus respuestas no deben usarse para nada importante.
- No debe desplegarse en atención al cliente ni en producción seria; el propio autor bromea con que solo serviría si se odia a los clientes.
- Idiomas limitados a ruso, inglés y chino; no hay evidencia de buen rendimiento en castellano.
- Longitud de contexto no documentada; aunque herede la de Qwen3-4B, el entrenamiento multiturno solo cubre 2-4 intercambios, por lo que la coherencia en conversaciones largas no está garantizada.
- Sesgos derivados de los datos de entrenamiento (insultos, arrogancia, humor agresivo) y posible repetición de patrones limitados pese a los grupos de respuestas variadas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede ser ofensivo; el despliegue público requiere moderación y avisos claros a los usuarios.
- La model card contiene un comentario `TODO` sobre ejemplos de generación, lo que sugiere que parte de los ejemplos mostrados podrían no ser salidas reales verificadas.

## Enlaces

- Hugging Face: https://huggingface.co/hecan3d/QwenDGAF-V3-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Versión anterior: https://huggingface.co/hecan3d/QwenDGAF-2-4B
- Autor: https://huggingface.co/hecan3d
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
