# cgus/Serenity-27B-exl3

## Resumen

Serenity-27B-exl3 es una cuantización en formato EXL3 (ExLlamaV3) del modelo Serenity-27B, publicado por el usuario cgus en Hugging Face. El modelo base, desarrollado por ReadyArt, es a su vez un ajuste fino de Qwen3.8-27B de Qwen, orientado específicamente a roleplay, conversación instructiva y contenido para adultos (ERP, NSFW). Esta versión concreta no es un modelo nuevo, sino una redistribución cuantizada pensada para su ejecución eficiente con ExLlamaV3.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas cuantizaciones EXL3 disponibles de un modelo de roleplay de gran tamaño; por otro, sirve para advertir de una discrepancia importante entre el nombre comercial ("27B") y el número real de parámetros almacenados en los safetensors (8.175.129.984, es decir, aproximadamente 8,2 mil millones). El repositorio ocupa 58,5 GB, lo que sugiere que contiene múltiples variantes de cuantización (4, 5 y 6 bpw) más que un único conjunto de pesos.

El modelo está publicado bajo licencia Apache 2.0 y etiquetado como `not-for-all-anchored` y `not-for-all-audiences`, con contenido explícito. No se han publicado resultados de benchmarks ni especificaciones detalladas de contexto o idiomas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, según la model card); detalles no disponibles |
| Parámetros totales | 8.175.129.984 (según safetensors); el nombre comercial indica 27B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 4 bpw (h5 v6), 5 bpw (h6 v6) y 6 bpw (h6 v6) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, generado con ExLlamaV3 1.6.6) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Se sabe que Serenity-27B deriva de Qwen3.8-27B (Qwen), y que el autor lo ha ajustado para roleplay y conversación instructiva, incluyendo contenido explícito para adultos. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado.

La innovación técnica de esta publicación concreta es la cuantización con ExLlamaV3 1.6.6 en formato EXL3, con tres niveles de precisión (4, 5 y 6 bits por peso, con variantes h5/h6 y v6). Este formato está diseñado para inferencia de alto rendimiento en GPUs, con kernels optimizados y menor huella de memoria que los pesos en precisión completa. No se documentan otras innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a roleplay.
- Modo instructivo para seguir instrucciones en diálogos.
- Contenido para adultos y ERP (etiquetas `nsfw`, `adult-content`, `explicit`, `erp`).
- Comportamiento "unaligned" y "mature" según las etiquetas del autor, lo que implica menor filtrado de contenido.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está ajustado específicamente para mantener personajes y narrativa multi-turno; su naturaleza instructiva y su etiqueta `conversational` lo hacen adecuado para plataformas de ficción interactiva.
- Ficción interactiva para adultos: las etiquetas `nsfw`, `explicit` y `erp` indican que puede emplearse en entornos de contenido adulto con las salvaguardas legales y de edad correspondientes.
- Prototipado de chatbots con personalidad: útil para desarrolladores que necesitan un modelo con estilo narrativo marcado y menor rigidez en las respuestas.
- Investigación sobre alineación y contenido: al estar etiquetado como `unaligned`, sirve como caso de estudio para evaluar comportamientos fuera de las políticas habituales de seguridad.
- Evaluación de cuantizaciones EXL3: las variantes 4/5/6 bpw permiten comparar la degradación de calidad frente al modelo original en tareas de generación creativa.
- Despliegue local en GPU de consumo: las cuantizaciones de 4 bpw permiten ejecutar el modelo en GPUs con VRAM moderada, aunque el tamaño real de pesos (~8,2B) facilita aún más el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con ~8,2B parámetros reales, una cuantización de 4 bpw requiere aproximadamente 4-5 GB de VRAM para los pesos, más overhead de contexto y caché KV; 5 bpw ~5-6 GB; 6 bpw ~6-7 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para las tres variantes con contexto amplio; A100/H100 para despliegues concurrentes de alta throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superiores para 4 bpw; RTX 4070 Ti/4080 para 5-6 bpw con contexto largo.
- Opciones de despliegue: ExLlamaV3 (formato nativo EXL3); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Serenity-27B-exl3 (este) | 8,2B reales (27B nominal) | no disponible | Apache 2.0 | EXL3 safetensors | Cuantización de roleplay/NSFW |
| ReadyArt/Serenity-27B | no disponible | no disponible | Apache 2.0 | safetensors | Modelo base original |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Base de Serenity |
| Otras cuantizaciones EXL3 de roleplay | no disponible | no disponible | no disponible | EXL3 | No se dispone de datos comparables |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica 27B pero los safetensors contienen ~8,2B parámetros; verificar antes de planificar recursos.
- Contenido explícito y para adultos: no apto para menores ni para entornos sin control de edad.
- Etiqueta `unaligned`: menor adherencia a políticas de seguridad estándar; riesgo elevado de generar contenido inapropiado o dañino.
- Riesgo de alucinación: no evaluado; sin benchmarks publicados.
- Idiomas y contexto: no documentados; no asumir soporte multilingüe ni ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones locales sobre material adulto.
- Repositorio de 58,5 GB: contiene múltiples variantes; descargar solo la rama necesaria.
- Sin descargas ni likes: modelo reciente y sin validación comunitaria; usar con cautela en producción.

## Enlaces

- Hugging Face: https://huggingface.co/cgus/Serenity-27B-exl3
- Modelo base: https://huggingface.co/ReadyArt/Serenity-27B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Rama 5bpw h6 v6: https://huggingface.co/cgus/Serenity-27B-exl3/tree/5bpwh6v6
- Rama 6bpw h6 v6: https://huggingface.co/cgus/Serenity-27B-exl3/tree/6bpwh6v6
- ExLlamaV3: no disponible en la información proporcionada
