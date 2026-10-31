# QuantaPlanta/Gemma-4-Dark-Orthia-31B-GGUF

## Resumen

Gemma-4-Dark-Orthia-31B-GGUF es una cuantizacion en formato GGUF del modelo Nimbz/Gemma-4-Dark-Orthia-31B, publicada por el usuario QuantaPlanta en Hugging Face. El modelo base es un merge (combinacion de modelos) creado con mergekit a partir de la familia Gemma-4, con unos 31-32 mil millones de parametros, y esta especializado en roleplay, escritura creativa, narracion de historias y conversacion, con un enfoque deliberado en contenido "dark" (oscuro), bajo nivel de rechazos (low-refusal) y NSFW. El tag "untied-lm_head" indica que el modelo base utiliza embeddings de entrada y cabecera de salida desacoplados.

Su relevancia reside en el nicho de modelos de rol y ficcion sin restricciones de alineacion estricta, un segmento muy activo en la comunidad open source donde los merges sobre Gemma suelen dominar los rankings de escritura creativa. La version GGUF permite ejecutarlo localmente mediante llama.cpp, Ollama, LM Studio u otros backends compatibles, lo que lo hace accesible para usuarios con hardware de consumo de gama alta. El repositorio pesa aproximadamente 467,6 GB, lo que sugiere que incluye multiples cuantizaciones, probablemente desde variantes de baja precision hasta versiones de alta fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma-4 (merge con mergekit) |
| Parametros totales | 32.106.631.740 (~32,1 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado a partir de safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, Nimbz/Gemma-4-Dark-Orthia-31B, es un merge realizado con mergekit sobre la arquitectura de Gemma-4 de ~31B de parametros. Los merges combinan los pesos de varios modelos ajustados (fine-tunes) para heredar capacidades de cada uno; en este caso, los tags apuntan a una combinacion orientada a roleplay, escritura creativa y respuestas sin restricciones. El tag "untied-lm_head" indica que la matriz de embeddings de entrada y la cabecera de salida del lenguaje no comparten pesos, una decision que puede mejorar la calidad de escritura en modelos de ficcion.

No se ha publicado informacion sobre el proceso de entrenamiento o ajuste fino de los modelos componentes (numero de tokens, composicion del dataset, uso de RLHF o DPO), ni detalles sobre la receta concreta del merge (metodo linear, SLERP, TIES, DARE, etc.). La version de QuantaPlanta es estrictamente una cuantizacion a GGUF del modelo base, sin modificaciones adicionales de pesos.

## Capacidades

- Escritura creativa y storytelling: generacion de narrativa larga, prosa estilizada y ficcion.
- Roleplay y character-rp: interpretacion de personajes en conversaciones multi-turno, optimizada para frontends como SillyTavern.
- Conversacion general con estilo narrativo.
- Contenido oscuro y NSFW: entrenamiento/merge orientado a bajo nivel de rechazo (low-refusal), siguiendo instrucciones que otros modelos rechazarian.
- No consta soporte de tool calling / function calling.
- No consta soporte de agentes ni razonamiento multi-paso estructurado.
- No consta soporte de vision ni audio.
- Capacidades multilingues: no disponibles explicitamente, aunque los modelos Gemma suelen mantener competencia multilingue.

## Casos de uso

- Roleplay interactivo con personajes: ejecutado localmente en SillyTavern o backends similares, el modelo puede sostener conversaciones de rol inmersivas con personajes personalizados, su punto fuerte declarado.
- Escritura de ficcion oscura: generacion de capitulos, escenas y tramas con tono adulto o violento que otros modelos alineados rechazarian, util como asistente de borradores para autores de genero negro, terror o thriller.
- Narrativa interactiva y juegos de texto: motor de narracion para aventuras conversacionales donde el usuario toma decisiones y el modelo describe consecuencias.
- Compañia conversacional: chatbots de personaje con personalidad consistente para uso personal y privado en local.
- Superacion del rechazo excesivo: como modelo de referencia para evaluar prompts que modelos alineados bloquean de forma demasiado conservadora.
- Prototipado de agentes de personaje: integracion en pipelines locales de generacion de dialogo para videojuegos o novelas visuales, dado que su licencia Apache 2.0 permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud; para un modelo de ~32B en GGUF, orientativamente se necesitan ~20 GB para cuantizaciones agresivas (Q2/Q3), ~24-32 GB para Q4_K_M y 40-64 GB o mas para cuantizaciones altas (Q6/Q8) o pesos BF16. El tamano total del repo (467,6 GB) confirma la presencia de cuantizaciones de alta precision.
- GPU recomendadas: RTX 3090/4090 (24 GB) con descarga parcial a CPU para Q4; RTX 5090 (32 GB) para Q4 completo; A100/H100 40-80 GB o Mac con memoria unificada de 48-96 GB para cuantizaciones altas.
- Consumer GPU: cabe en una RTX 3090/4090 solo con cuantizaciones bajas-medias y offloading a RAM; con 32 GB (RTX 5090) la experiencia en Q4 es mas fluida.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier backend compatible con GGUF.
- Latencia y throughput: no disponibles; en un modelo denso de 32B el throughput depende criticamente del porcentaje de capas en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma-4-Dark-Orthia-31B-GGUF | ~32,1 B | GGUF | Apache 2.0 | Roleplay, dark, low-refusal, NSFW |
| Mistral-Small-24B (variantes RP) | ~24 B | safetensors/GGUF | Apache 2.0 | Roleplay y escritura creativa |
| Modelos RP sobre Gemma 2/3 27B | ~27 B | safetensors/GGUF | Gemma license | Roleplay y ficcion, con mas restricciones |

Comparacion orientativa: frente a los merges sobre Mistral-Small, Orthia 31B ofrece mas parametros (potencialmente mayor coherencia narrativa) a costa de mayores requisitos de VRAM; frente a otros merges sobre Gemma, destaca por su orientacion explicita a contenido sin restricciones. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Contenido NSFW y dark: el propio repositorio esta marcado como "not-for-all-audiences"; no es apto para entornos profesionales, educativos ni para menores.
- Bajo nivel de rechazo: mayor riesgo de generar contenido ofensivo, violento o inapropiado; su uso en produccion orientada a publico general esta desaconsejado y puede incumplir las politicas de plataformas de despliegue.
- Riesgo de alucinacion: tipico de merges orientados a ficcion; no es un modelo de razonamiento factual y no es adecuado para tareas que exijan precision.
- Sin tool calling ni capacidades agentivas documentadas.
- Longitud de contexto e idiomas soportados no documentados; verificar en el modelo base antes de usar en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede estar sujeto a la responsabilidad legal del usuario segun jurisdiccion.
- Al ser un merge, el comportamiento puede ser impredecible en tareas fuera del nicho de roleplay/escritura (codigo, matematicas, razonamiento estructurado).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/QuantaPlanta/Gemma-4-Dark-Orthia-31B-GGUF
- Modelo base: https://huggingface.co/Nimbz/Gemma-4-Dark-Orthia-31B
- Herramienta de merge (mergekit): https://github.com/arcee-ai/mergekit
- Backend GGUF (llama.cpp): https://github.com/ggerganov/llama.cpp
