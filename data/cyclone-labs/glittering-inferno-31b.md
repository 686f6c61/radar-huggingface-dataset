# Cyclone-Labs/Glittering-Inferno-31B

## Resumen

Glittering-Inferno-31B es un modelo de lenguaje de 31.273.088.876 parámetros creado por Cyclone-Labs mediante la fusión de tres modelos previos: Cyclone-Labs/Ashen-Arcanum-31B, Cyclone-Labs/Lunar-Trace-31B y ReadyArt/Room-Tone-31B. El resultado es un modelo orientado a roleplay, escritura creativa, narrativa larga y ficción interactiva, con especial énfasis en contenido para adultos explícito y sin eufemismos, según las notas de prueba del propio autor.

El modelo se distribuye en formato safetensors con pesos en bfloat16, etiquetado con el pipeline image-text-to-text y la arquitectura gemma4, lo que sugiere una base multimodal de la familia Gemma. La fusión se realizó con mergekit mediante el método karcher, con tolerancia 1e-9, hasta 1000 iteraciones y cálculo en float32. La licencia declarada es Apache 2.0.

Su relevancia es acotada: se trata de un modelo de nicho para comunidades de rol y narrativa, con solo 2 descargas y 0 likes en el momento de la consulta, publicado en noviembre de 2026. No está pensado para tareas de razonamiento general, código o matemáticas, y no se han publicado benchmarks ni especificaciones detalladas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (tag gemma4, pipeline image-text-to-text) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 62.6 GB, out_dtype bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de pesos, no de un entrenamiento desde cero. Según la configuración de mergekit incluida en la model card, se combinaron tres checkpoints (Ashen-Arcanum-31B, Lunar-Trace-31B y Room-Tone-31B) con el método karcher, tolerancia de 1e-9, un máximo de 1000 iteraciones, cálculo en float32 y salida en bfloat16. El tokenizador y la plantilla de chat se tomaron de Lunar-Trace-31B, con chat_template configurado en modo auto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en los modelos base. El tag gemma4 y el pipeline image-text-to-text apuntan a una arquitectura de la familia Gemma con capacidad de entrada de imagen y texto, aunque la model card no detalla el mecanismo de atención ni innovaciones técnicas concretas. La única indicación cualitativa del autor es que el modelo es explícito y detallado en roleplay adulto y que también funciona bien en roleplay convencional.

## Capacidades

- Generación de texto narrativo y diálogo orientado a personajes, con énfasis en escenas emocionales y roleplay de larga duración.
- Escritura creativa: ficción, descripciones atmosféricas, borradores estilísticos y prosa imaginativa.
- Storytelling de formato largo: construcción de mundo, continuidad narrativa, personajes en evolución y tramas con múltiples personajes.
- Ficción interactiva: narrativas ramificadas, juego de escenarios y desarrollo continuo de historias.
- Roleplay adulto explícito, según las notas de prueba del autor, sin uso de eufemismos.
- Entrada multimodal imagen-texto según el pipeline declarado (image-text-to-text), aunque no se detallan las capacidades concretas de visión.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay conversacional con personajes: el modelo mantiene personas, diálogo y escenas emocionales a lo largo de interacciones multi-turno, adecuado para plataformas de chat de rol con personajes persistentes.
- Escritura de ficción asistida: generación de capítulos, diálogos y descripciones atmosféricas para autores que necesitan borradores rápidos con estilo consistente.
- Narrativa larga y worldbuilding: desarrollo de tramas con continuidad, personajes secundarios y arcos argumentales extensos, aprovechando la orientación del modelo a la coherencia narrativa.
- Ficción interactiva y aventuras de texto: motor de respuestas para historias ramificadas donde el usuario elige opciones y el modelo improvisa escenas coherentes con el estado previo.
- Prototipado de videojuegos narrativos: generación de diálogos de NPC y descripciones de escenarios para pruebas de concepto en estudios pequeños, sin coste de licencia adicional al ser Apache 2.0.
- Comunidades de rol para adultos: despliegue privado en entornos donde el contenido explícito es el objetivo, con la advertencia de que el modelo está marcado como not-for-all-audiences.
- Generación de material de campaña para juegos de mesa: descripciones de localizaciones, trasfondos de personajes y giros argumentales a partir de una premisa breve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 80 GB para contexto corto.
- Cuantización a 8 bits: en torno a 32-35 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090.
- Cuantización a 4 bits: en torno a 17-20 GB de VRAM, potencialmente ejecutable en una RTX 4090 de 24 GB con contexto limitado.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16 sin compromisos; A100 40 GB o pareja de RTX 4090 para 8 bits; RTX 4090 única para 4 bits.
- No cabe en GPUs de consumo de 8-16 GB sin cuantización agresiva y offloading a CPU.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir en bfloat16; llama.cpp u Ollama requerirían conversión a GGUF, no publicada en el repo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glittering-Inferno-31B | 31,27 B | no disponible | Roleplay y narrativa, NSFW | Apache 2.0 | Hugging Face, 2 descargas |
| Cyclone-Labs/Lunar-Trace-31B | no disponible | no disponible | Modelo base de la fusión | no disponible | Hugging Face |
| ReadyArt/Room-Tone-31B | no disponible | no disponible | Modelo base de la fusión | no disponible | Hugging Face |
| Cyclone-Labs/Ashen-Arcanum-31B | no disponible | no disponible | Modelo base de la fusión | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos base que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está marcado como not-for-all-adults y el autor declara que produce contenido explícito sin eufemismos; no es apto para entornos laborales, educativos o de atención al público sin filtros.
- Riesgo de alucinación: al ser una fusión de modelos de rol sin datos de benchmarks publicados, no hay evidencia de robustez factual; no debe usarse para consultas de información verificable.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento correcto fuera del inglés, idioma de la model card.
- Contexto no especificado: se desconoce la ventana máxima efectiva, lo que complica el dimensionamiento de despliegues con historiales largos.
- Licencia Apache 2.0 declarada, pero los modelos base podrían tener condiciones adicionales no documentadas en esta ficha; conviene revisar las licencias de Lunar-Trace-31B, Room-Tone-31B y Ashen-Arcanum-31B antes de uso comercial.
- Trazabilidad limitada: 2 descargas y 0 likes, sin benchmarks ni evaluación independiente; no hay garantía de calidad más allá de las notas subjetivas del autor.
- Capacidades multimodales inciertas: aunque el pipeline es image-text-to-text, no se documenta el soporte real de visión ni su calidad.
- Sin soporte documentado de tool calling ni de agentes, lo que descarta su uso en pipelines de automatización que requieran llamadas a funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyclone-Labs/Glittering-Inferno-31B
- Modelo base Lunar-Trace-31B: https://huggingface.co/Cyclone-Labs/Lunar-Trace-31B
- Modelo base Room-Tone-31B: https://huggingface.co/ReadyArt/Room-Tone-31B
- Modelo base Ashen-Arcanum-31B: no se proporciona enlace directo en la información disponible
- Repositorio de mergekit: no se proporciona enlace en la información disponible
- Paper, blog o demo adicionales: no disponible
