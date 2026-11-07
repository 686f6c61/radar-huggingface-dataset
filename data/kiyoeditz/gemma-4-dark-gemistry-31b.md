# KiyoEditz/Gemma-4-Dark-Gemistry-31B

## Resumen

Gemma-4-Dark-Gemistry-31B es un modelo de lenguaje obtenido mediante fusión (merge) de pesos con mergekit, publicado por el usuario KiyoEditz en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una combinación de nueve modelos derivados de la familia Gemma 4 de Google DeepMind, con un total de 32.682.375.020 parámetros almacenados en formato safetensors. El objetivo declarado por el autor es especializar el modelo en escritura creativa, roleplay y conversación, incluyendo contenido sin censura y NSFW.

El modelo parte de la base instructiva google/gemma-4-31B-it y la mezcla con variantes afinadas por la comunidad: ReadyArt/Serenity-31B-v1.1, ReadyArt/Dark-Scarlett-v1.0-31B, ReadyArt/Melody1437-31B-v2.0, trohrbaugh/gemma-4-31b-it-heretic-ara, Blazed-Forge/Gemma-4-Gemsicle-31B, zerofata/G4-MeroMero-31B, LatitudeGames/Equinox-31B y Gryphe/Gemma-4-31B-StyleTune. La mayoría de estas variantes están orientadas a estilos narrativos y a la reducción de rechazos, lo que explica el perfil del merge.

Es relevante ahora porque la familia Gemma 4 ha generado un ecosistema activo de derivados comunitarios, y este modelo ilustra una práctica habitual: combinar varios fine-tunes para agregar estilos y comportamientos sin reentrenar. La licencia declarada es Apache 2.0 y el repositorio ocupa 65,4 GB, aunque no se han publicado métricas de rendimiento ni detalles de la receta de fusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4); detalles de capas y atención no disponibles |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento. Según las etiquetas y la model card, se generó con mergekit a partir de nueve checkpoints derivados de Gemma 4, todos ellos de aproximadamente 31B parámetros. La arquitectura subyacente es la de Gemma 4, un transformer decoder-only de Google DeepMind, pero la información proporcionada no detalla número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en los modelos de origen. Tampoco se especifica la receta de fusión (método de merge, pesos por componente, capas interpoladas), lo que impide reproducir el proceso. La única información técnica verificable es el recuento de parámetros del safetensors y la lista de modelos base.

## Capacidades

- Generación de texto conversacional y narrativo, con énfasis declarado en escritura creativa y roleplay.
- Estilo de respuesta orientado a personajes y diálogo multi-turno, según las etiquetas del repositorio.
- Comportamiento "uncensored": los modelos base incluyen variantes heretic y NSFW, por lo que se espera una menor tasa de rechazos.
- Capacidades heredadas de Gemma-4-31B-it: razonamiento, código y matemáticas, aunque no hay evaluación publicada que lo confirme en este merge.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar relatos, diálogos y descripciones con un estilo narrativo consistente, aprovechando la mezcla de fine-tunes literarios como Serenity, Dark-Scarlett y Melody1437.
- Roleplay y chatbots de personaje: adecuado para aplicaciones de conversación inmersiva donde se requiere mantener una voz y un registro concretos durante sesiones largas.
- Prototipado de narrativa interactiva: útil para videojuegos o ficción interactiva donde el modelo debe responder en personaje y sin rechazos excesivos ante tramas adultas.
- Generación de contenido para comunidades de ficción: borradores de fan fiction y guiones, con la advertencia de revisión humana por el riesgo de contenido NSFW.
- Investigación sobre merges: sirve como caso de estudio para analizar cómo la combinación de fine-tunes de estilo afecta al comportamiento conversacional frente a la base instructiva.
- Experimentación con ajuste de rechazos: permite estudiar la transferencia de comportamientos "uncensored" desde variantes heretic hacia un modelo agregado.
- Base para fine-tuning adicional: al estar en safetensors y con licencia Apache 2.0, puede servir de punto de partida para ajustes específicos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 65 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 33-35 GB, viable en una A100 40 GB o H100.
- VRAM estimada en cuantización de 4 bits: alrededor de 17-20 GB, potencialmente ejecutable en una RTX 4090 de 24 GB, aunque no se han publicado archivos GGUF en el repositorio y habría que generarlos.
- GPU recomendadas: H100 80 GB, A100 80 GB o A100 40 GB con cuantización; para consumer, RTX 4090 24 GB solo con cuantización agresiva.
- Opciones de despliegue: vLLM o TGI para safetensors en BF16; llama.cpp u Ollama requerirían convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-Dark-Gemistry-31B | 32,68B | no disponible | Merge de fine-tunes Gemma 4 | apache-2.0 | Hugging Face (KiyoEditz y Nimbz) |
| google/gemma-4-31B-it | ~31B | no disponible | Modelo instructivo oficial | Gemma (términos de Google) | Hugging Face |
| Gryphe/Gemma-4-31B-StyleTune | ~31B | no disponible | Fine-tune de estilo | no disponible | Hugging Face |
| trohrbaugh/gemma-4-31b-it-heretic-ara | ~31B | no disponible | Fine-tune con reducción de rechazos | no disponible | Hugging Face |

La comparación se limita a parámetros y licencia porque no hay benchmarks publicados para ninguno de los derivados en la información disponible.

## Limitaciones y advertencias

- El modelo está marcado como `not-for-all-audiences` y etiquetado como NSFW; no es adecuado para aplicaciones dirigidas al público general sin filtrado adicional.
- Riesgo elevado de alucinación y de deriva de personaje en conversaciones largas, al ser un merge sin evaluación publicada.
- No hay datos sobre sesgos, idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso en producción.
- La licencia Apache 2.0 declarada puede entrar en conflicto con los términos de los modelos base de Google; conviene verificar la licencia de Gemma 4 antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de calidad.
- No se publican archivos GGUF ni cuantizaciones listas para usar, lo que obliga a convertir los pesos para despliegues en consumer.
- La receta de merge no está documentada, lo que impide reproducir o auditar el modelo.

## Enlaces

- https://huggingface.co/KiyoEditz/Gemma-4-Dark-Gemistry-31B
- https://huggingface.co/Nimbz/Gemma-4-Dark-Gemistry-31B
- https://deepmind.google/models/gemma/gemma-4/
- https://huggingface.co/google/gemma-4-31B-it
- https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
- https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- https://huggingface.co/ReadyArt/Serenity-31B-v1.1
- https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-31B
- https://huggingface.co/ReadyArt/Melody1437-31B-v2.0
- https://huggingface.co/Blazed-Forge/Gemma-4-Gemsicle-31B
- https://huggingface.co/zerofata/G4-MeroMero-31B
- https://huggingface.co/LatitudeGames/Equinox-31B
