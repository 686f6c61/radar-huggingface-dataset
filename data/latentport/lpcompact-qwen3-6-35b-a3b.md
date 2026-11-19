# latentport/LPCompact-Qwen3.6-35B-A3B

## Resumen

LPCompact-Qwen3.6-35B-A3B es un selector de compactación de memoria de atención entrenado por Simon P. Villani (LatentPort) sobre el modelo base Qwen/Qwen3.6-35B-A3B. No es un modelo de lenguaje completo ni un fine-tune de pesos: es un artefacto de inferencia que se expone a través de la API `state.compact()` de la librería `latentport` y que decide qué entradas de la caché KV (claves y valores) conservar y cuáles descartar cuando el contexto histórico supera el umbral configurado.

El problema que aborda es el coste de memoria de la caché KV en contextos largos. En lugar de resumir texto o reinyectar tokens históricos, el selector puntúa los valores de atención en las capas 3, 15 y 31 y retiene las entradas seleccionadas preservando además el estado recurrente, el historial de convolución y el reloj lógico de continuación del modelo base. El resultado es un estado compactado que soporta append, guardado/carga y fork, y que puede alimentar sesiones posteriores.

Es relevante porque propone una vía de compresión de contexto que no depende de resúmenes textuales (con la pérdida de fidelidad que ello implica) sino de una política aprendida sobre representaciones internas. La activación normal comienza a los 65.536 posiciones físicas, con una ratio por defecto de 8 (configurable a 4 para retener más memoria) y una política que preserva las primeras y últimas 512 posiciones con un suelo de 1.024 posiciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Selector de compactación de atención sobre transformer (modelo base Qwen3.6-35B-A3B); puntuación en capas 3, 15 y 31 |
| Parámetros totales | 196.865 (según safetensors del selector; los pesos del modelo base son independientes) |
| Parámetros activos | no disponible (corresponde al modelo base, no al selector) |
| Longitud de contexto | Activación a partir de 65.536 posiciones físicas; evaluado hasta 131.072 tokens de historia |
| Tipos de cuantización | BF16, NF4 y GGUF fijados UD-Q4_K_M y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (selector y código LatentPort); los modelos base Qwen y dependencias mantienen sus licencias upstream |
| Formato de pesos | safetensors (`model.safetensors` con el selector; `config.json` con arquitectura, política y huellas de checkpoint) |

## Arquitectura y entrenamiento

El selector es una política aprendida que opera sobre tensores de estado, no sobre texto. Puntúa los valores de atención en tres capas concretas (3, 15 y 31) del modelo base Qwen3.6-35B-A3B y, a partir de esas puntuaciones, decide qué claves y valores retener en la caché KV. La compactación preserva el estado recurrente, el historial de convolución y el reloj lógico de continuación, de modo que el estado resultante es funcionalmente continuable. La ratio por defecto es 8; con `ratio=4` se retiene más memoria. La política conserva las primeras y últimas 512 posiciones con un suelo de 1.024 posiciones.

El entrenamiento se realizó en dos fases sobre el modelo base BF16 congelado, que aportó todas las características y la supervisión derivada de atención. Una fase de warm-up con etiquetas de registro usó 16 historias independientes de 16K y 256 actualizaciones AdamW. La fase de utilidad usó 32 historias adicionales de 16K, 32K, 64K y 128K, con 32 preguntas de estudio disjuntas por historia y 1.024 actualizaciones. Las etiquetas estiman el cambio en la salida en espacio de valores de una cabeza cuando se elimina una entrada histórica. El selector desplegado consume únicamente tensores de estado.

## Capacidades

- Compactación de caché KV en contextos largos mediante una política aprendida, sin resumen textual ni reinyección de tokens históricos.
- Reducción del almacenamiento de atención KV (no de los pesos del modelo base ni de toda la memoria de trabajo pico).
- Preservación del estado recurrente, el historial de convolución y el reloj lógico de continuación tras la compactación.
- Soporte de `append`, guardado/carga y `fork` sobre el estado compactado.
- Compatibilidad con backends BF16, NF4 y GGUF UD-Q4_K_M / Q8_0 mediante la librería nativa de LatentPort 0.4.12 o posterior.
- Integración con el modelo base Qwen3.6-35B-A3B a través de la API `prefill` / `compact` / `session` / `ask`.
- No es un modelo generativo por sí mismo: hereda las capacidades del modelo base, no las añade.

## Casos de uso

- Sesiones de agente de larga duración: tras un `prefill` de historial extenso, `state.compact()` reduce la caché KV retenida y permite continuar la sesión con `model.session(compacted).ask(...)`, manteniendo el estado recurrente y el reloj lógico para no romper la coherencia multi-turno.
- Recuperación de decisiones previas en flujos de trabajo: la evaluación reporta 32/32 aciertos en la tarea "latest decision" tanto con memoria completa como con compactación 8×, lo que respalda su uso para recordar la última decisión tomada en una conversación o pipeline largo.
- Búsqueda de funciones en repositorios: la tarea "repository function lookup" obtiene 32/32 con y sin compactación, adecuada para asistentes de código que necesitan recordar definiciones de funciones a lo largo de un contexto de 65K-131K tokens.
- Consulta de registros estructurados: "structured record lookup" mantiene 32/32, útil en agentes que consultan tablas o registros a lo largo de interacciones prolongadas.
- Búsqueda documental de dos saltos: la compactación 8× mejora el resultado de 11/32 a 21/32 en esta tarea, lo que sugiere que en escenarios de recuperación multi-hop la política puede reducir ruido de atención y favorecer el rendimiento.
- Despliegue con presupuesto de memoria limitado: al reducir el almacenamiento de atención KV, permite servir contextos de 65K-131K tokens en configuraciones donde la caché completa no cabría, combinable con cuantización NF4 o GGUF Q4_K_M / Q8_0.
- Reserva de capacidad para nuevas entradas: los controles de capacidad a nivel de sesión permiten reservar espacio para más input tras la compactación, útil en pipelines que concatenan documentos de forma incremental.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a una evaluación rápida con selector congelado y modelo BF16 sin comprimir, con ocho sondas por historia y ocho historias independientes por longitud. La última columna cuenta respuestas resueltas por ambos modelos entre las resueltas con memoria completa.

| Tokens de historia | Memoria completa | Compactación 8× | Respuestas de memoria completa retenidas |
| ---: | ---: | ---: | ---: |
| 65.536 | 54/64 | 56/64 | 54/54 |
| 131.072 | 53/64 | 61/64 | 53/53 |

| Tarea (ambas longitudes combinadas) | Memoria completa | Compactación 8× | Perdidas tras compactar | Ganadas tras compactar |
| --- | ---: | ---: | ---: | ---: |
| Búsqueda de funciones en repositorio | 32/32 | 32/32 | 0 | 0 |
| Última decisión | 32/32 | 32/32 | 0 | 0 |
| Consulta de registro estructurado | 32/32 | 32/32 | 0 | 0 |
| Búsqueda documental de dos saltos | 11/32 | 21/32 | 0 | 10 |

Los resultados provienen de una única semilla de entrenamiento y de tareas sintéticas de recuperación. Las respuestas exactas dependen del modelo base y de la historia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. El selector añade un artefacto de 196.865 parámetros, despreciable frente a los pesos del modelo base Qwen3.6-35B-A3B; el coste dominante es el del modelo base y la caché KV resultante tras la compactación.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: librería `latentport` 0.4.12 o posterior con Python 3.11+, PyTorch CUDA y dependencias del backend elegido (BF16, NF4 o GGUF). Para GGUF, instalar la librería nativa con `python -m latentport install-native` y proporcionar `model_path` junto con una librería nativa compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la información proporcionada. LPCompact no es un modelo de lenguaje sino un selector de compactación de caché KV acoplado a un modelo base concreto (Qwen3.6-35B-A3B), por lo que la comparación natural sería con otras técnicas de compresión de contexto (resumen textual, ventanas deslizantes, atención dispersa), para las que no se aportan datos.

| Modelo / técnica | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LPCompact-Qwen3.6-35B-A3B | 196.865 (selector) | activación desde 65.536 posiciones; evaluado a 131.072 | Apache-2.0 | Hugging Face (0 descargas en el momento de la ficha) |
| Alternativas de compresión de contexto | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La compactación es con pérdida y depende de la tarea; no garantiza retener toda la información relevante.
- Reduce el almacenamiento de atención KV, no los pesos del modelo base ni toda la memoria de trabajo pico.
- Un estado compactado no puede pasarse actualmente a un bridge.
- La calidad medida en un modelo, backend o panel de tareas no debe asumirse para otro; la disponibilidad de un backend no implica la misma calificación de calidad.
- Los resultados provienen de una única semilla de entrenamiento y de tareas sintéticas de recuperación; la generalización a dominios reales no está validada en la información disponible.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible de forma específica; heredado del modelo base Qwen3.6-35B-A3B.
- Idiomas soportados: no disponible.
- Licencia: el selector y el código LatentPort son Apache-2.0; los modelos base Qwen y las dependencias del runtime conservan sus licencias upstream, que deben revisarse para uso comercial.
- El repositorio figura con 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/latentport/LPCompact-Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- GitHub de LatentPort: https://github.com/LatentPort/latentport
- PyPI: https://pypi.org/project/latentport/
- Guía de instalación: https://github.com/LatentPort/latentport/blob/main/docs/installation.md
- Documentación de la API: https://github.com/LatentPort/latentport/blob/main/docs/api.md
- GGUF de referencia (unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF/tree/a483e9e6cbd595906af30beda3187c2663a1118c
- Perfil del autor: https://au.linkedin.com/in/simon-villani
