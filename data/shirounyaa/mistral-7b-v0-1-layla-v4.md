# Shirounyaa/mistral-7b-v0.1-layla-v4

## Resumen

mistral-7b-v0.1-layla-v4 es un ajuste fino (fine-tuning) del modelo base Mistral 7B v0.1, desarrollado por l3utterfly y financiado por Layla Network. El modelo esta disenado especificamente para conversacion multi-turno e impersonacion de personajes, y sirve como motor del asistente personal offline Layla. Se distribuye bajo licencia Apache-2.0 y esta publicado en Hugging Face por el usuario Shirounyaa.

El ajuste se realizo sobre el dataset OpenHermes 2.5, que fue preprocesado por el autor para eliminar todas las negativas (refusals), suprimir cualquier mencion al asistente de IA, dividir los dialogos multi-turno generados en registros de conversacion independientes y anadir conversaciones de caracter NSFW generadas a partir del dataset Teatime. El resultado es un modelo orientado a mantener conversaciones fluidas y en personaje, sin las restricciones tipicas de un asistente convencional.

Tecnicamente hereda la arquitectura transformer decoder-only de Mistral 7B v0.1, con 7.241.732.096 parametros (7,24 mil millones) y pesos en formato safetensors. El repositorio ocupa 14,5 GB. Es relevante para quienes buscan un modelo pequeno, desplegable en hardware de consumo, especializado en roleplay y conversacion, con licencia permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral) |
| Parametros totales | 7.241.732.096 (7,24 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Mistral 7B v0.1 soporta 8.192 tokens, aunque no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral 7B v0.1, un transformer decoder-only con atencion por ventanas deslizantes (sliding window attention) y 7,24 mil millones de parametros. Sobre esta base se aplico un fine-tuning supervisado utilizando el dataset OpenHermes 2.5, procesado por el autor mediante cuatro transformaciones: eliminacion de todas las respuestas de rechazo, supresion de menciones al asistente de IA, division de dialogos multi-turno en registros de conversacion independientes y adicion de conversaciones NSFW generadas a partir del dataset Teatime. El entrenamiento se realizo con la herramienta Axolotl, segun el badge incluido en la model card.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset final, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales mas alla de las heredadas del modelo base. El formato de prompt recomendado es `USER:` / `ASSISTANT:`.

## Capacidades

- Generacion de texto conversacional en ingles, optimizada para dialogos multi-turno.
- Impersonacion de personajes y mantenimiento de rol a lo largo de la conversacion.
- Conversacion sin respuestas de rechazo (refusals eliminados en el entrenamiento).
- Generacion de contenido NSFW, segun la inclusion del dataset Teatime en el entrenamiento.
- Razonamiento basico y respuesta a preguntas de conocimiento general (segun resultados en MMLU y ARC).
- Resolucion de problemas matematicos elementales (GSM8K 55,5% en 5-shot).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Asistente personal offline: el modelo es el motor de Layla, un asistente personal que funciona sin conexion, adecuado para despliegues en dispositivos locales donde la privacidad es prioritaria.
- Roleplay y compania conversacional: su entrenamiento en impersonacion de personajes y la ausencia de rechazos lo hacen adecuado para aplicaciones de entretenimiento conversacional y juegos de rol.
- Prototipado de chatbots de personaje: desarrolladores que necesiten un modelo pequeno para iterar rapidamente en diseno de personajes y flujos de dialogo multi-turno.
- Generacion de narrativa interactiva: puede mantener el rol de personajes en ficcion interactiva o videojuegos narrativos, gracias a su capacidad de sostener contexto conversacional.
- Investigacion sobre alineacion y seguridad: util como caso de estudio de un modelo deliberadamente desprovisto de rechazos, para analizar comportamiento y riesgos en entornos controlados.
- Despliegue en hardware de consumo: con 7,24 mil millones de parametros y pesos safetensors de 14,5 GB, puede ejecutarse en GPUs de consumo mediante cuantizacion, para demos y aplicaciones locales.
- Base para fine-tuning adicional: al estar bajo Apache-2.0 y en formato safetensors, sirve como punto de partida para ajustes especificos de dominio o estilo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (Open LLM Leaderboard), no verificados de forma independiente:

| Metrica | Valor |
|---|---|
| Avg. | 64,69 |
| AI2 Reasoning Challenge (25-shot) | 62,29 |
| HellaSwag (10-shot) | 83,36 |
| MMLU (5-shot) | 64,32 |
| TruthfulQA (0-shot) | 43,14 |
| Winogrande (5-shot) | 79,56 |
| GSM8K (5-shot) | 55,50 |

No se han publicado en la informacion disponible resultados de HumanEval ni de otras tareas de codigo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14,5 GB (coincide con el tamano del repositorio en safetensors).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8 GB; en 4 bits: alrededor de 4-5 GB (estimaciones estandar para un modelo de 7,24 mil millones de parametros; no confirmadas en la informacion proporcionada).
- GPU recomendadas: A100 o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16; RTX 3090 (24 GB) igualmente valida.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en FP16; en GPUs de 8-12 GB (RTX 3060, RTX 4070) requiere cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, siempre que se genere o convierta a GGUF (el repositorio solo incluye safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mistral-7b-v0.1-layla-v4 | 7,24 mil millones | no disponible | Apache-2.0 | Fine-tuning para roleplay y conversacion sin rechazos |
| Mistral 7B v0.1 (base) | 7,24 mil millones | 8.192 tokens | Apache-2.0 | Modelo base generalista; contexto segun documentacion oficial de Mistral |
| OpenHermes 2.5 (Mistral 7B) | 7,24 mil millones | 8.192 tokens | Apache-2.0 | Fine-tuning generalista sobre OpenHermes; referencia directa del dataset usado |
| Zephyr 7B beta | 7,24 mil millones | 8.192 tokens | MIT | Fine-tuning con DPO orientado a asistente; contexto segun documentacion oficial |

Los datos de contexto de los modelos comparables provienen de su documentacion oficial, no de la informacion proporcionada para este modelo. No se dispone de comparativas de rendimiento verificadas entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- La eliminacion deliberada de rechazos y la inclusion de contenido NSFW implican un riesgo elevado de generar contenido inapropiado, ofensivo o danino sin filtros.
- Riesgo de alucinacion inherente a un modelo de 7,24 mil millones de parametros; los resultados en TruthfulQA (43,14) son bajos.
- No se documentan sesgos especificos, pero el dataset de entrenamiento (OpenHermes 2.5 y Teatime) puede introducir sesgos de genero, culturales y de contenido adulto.
- No se confirma la longitud de contexto efectiva del fine-tuning; asumir la del modelo base (8.192 tokens) sin verificacion.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado y su adecuacion legal dependen del uso concreto; el contenido NSFW puede incumplir politicas de plataformas.
- Resultados de benchmarks no verificados de forma independiente (marcados como `verified: false`).
- Solo se distribuyen pesos en safetensors; no hay GGUF oficial, por lo que el despliegue en llama.cpp u Ollama requiere conversion previa.
- Modelo con muy baja adopcion (16 descargas, 0 likes), sin garantias de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/Shirounyaa/mistral-7b-v0.1-layla-v4
- Model card original (referencia del autor): https://huggingface.co/l3utterfly/mistral-7b-v0.1-layla-v4
- Open LLM Leaderboard: https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard
- Resultados detallados en Open LLM Leaderboard: https://huggingface.co/datasets/open-llm-leaderboard/details_l3utterfly__mistral-7b-v0.1-layla-v4
- Layla Network (asistente offline): https://www.layla-network.ai
- Discord de soporte: https://discord.gg/x546YJ6nYC
- Axolotl (herramienta de entrenamiento): https://github.com/OpenAccess-AI-Collective/axolotl
