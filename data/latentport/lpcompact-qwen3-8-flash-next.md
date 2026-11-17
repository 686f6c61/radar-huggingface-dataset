# latentport/LPCompact-Qwen3.8-Flash-Next

## Resumen

LPCompact-Qwen3.8-Flash-Next es un selector de compactación de memoria de atención aprendido, desarrollado por Simon P. Villani bajo el proyecto LatentPort, que se aplica sobre el modelo base Qwen/Qwen3.8-Flash-Next. No es un modelo de lenguaje autónomo ni un fine-tuning del base, sino un artefacto auxiliar (un selector de 196.865 parámetros) que se expone a través de la API `state.compact()` del runtime LatentPort y que decide qué entradas de la KV-cache conservar cuando el contexto histórico excede la ventana física del modelo.

El problema que resuelve es el coste de memoria de la atención en contextos largos: en lugar de resumir texto o reinyectar tokens históricos, el selector puntúa los valores de atención en las capas 3, 15 y 31 y retiene bloques dispersos de cuatro tokens junto con sus claves de indexador y posiciones originales, preservando además el estado recurrente, la convolución, el historial de n-gramas y el reloj lógico de continuación. El resultado es una reducción del almacenamiento KV de atención (por defecto con ratio 8, es decir, 8× de compactación) manteniendo la calidad de recuperación en tareas de retrieval sintéticas.

Es relevante ahora porque permite extender el contexto efectivo de un modelo Qwen de última generación sin reentrenar el base ni cambiar de arquitectura, con una licencia Apache-2.0 y una integración directa vía pip (`latentport` 0.4.4 o superior). El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y un tamaño de 0.0 GB (solo contiene el selector y la configuración, no los pesos del base).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Selector de compactación de memoria de atención sobre transformer Qwen (modelo base Qwen/Qwen3.8-Flash-Next); puntúa atención en capas 3, 15 y 31 |
| Parámetros totales | 196.865 (solo el selector; los pesos del base son independientes) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el base; la compactación se activa a partir de 65.536 posiciones físicas, con pruebas hasta 131.072 tokens de historial |
| Tipos de cuantización | no disponible (el camino cualificado es BF16; el selector se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (selector y código LatentPort); los modelos base Qwen y dependencias mantienen sus licencias upstream |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` con arquitectura, política y huellas del checkpoint |

## Arquitectura y entrenamiento

El selector opera sobre la arquitectura del transformer Qwen base y actúa exclusivamente sobre el estado de atención. Puntúa los valores de atención en tres capas concretas (3, 15 y 31) para decidir qué entradas históricas retener. La política de compactación conserva bloques dispersos de cuatro tokens con sus claves de indexador y posiciones originales, y mantiene intactos el estado recurrente, la convolución, el historial de n-gramas y el reloj lógico de continuación. No resume texto ni reproduce tokens históricos. La política preserva las primeras y últimas 512 posiciones, con un suelo de 1.024 posiciones, y el ratio por defecto es 8 (configurable a `ratio=4` para retener más memoria). El resultado soporta append, save/load y fork.

El entrenamiento se realizó en dos fases sobre el base BF16 congelado, que aportó todas las características y la supervisión derivada de atención. Primero, un warm-up de etiquetas de registro con 16 historias independientes de 16K y 256 actualizaciones AdamW. Después, entrenamiento de utilidad con 32 historias adicionales que abarcan 16K, 32K, 64K y 128K, 32 preguntas de estudio disjuntas por historia y 1.024 actualizaciones. Las etiquetas estiman el cambio en la salida en espacio de valores de una cabeza cuando se elimina una entrada histórica. El selector desplegado consume únicamente tensores de estado.

## Capacidades

- Compactación de memoria de atención en contextos largos mediante `state.compact()`, con ratio configurable (por defecto 8, o 4 para mayor retención).
- Retención de bloques dispersos de cuatro tokens con claves de indexador y posiciones originales.
- Preservación del estado recurrente, convolución, historial de n-gramas y reloj lógico de continuación.
- Soporte de append, save/load y fork sobre el estado compactado.
- Controles de capacidad a nivel de sesión para reservar espacio a más entrada.
- Integración con el runtime LatentPort 0.4.4 o superior, Python 3.11+, PyTorch CUDA y backend BF16.
- Inferencia de texto batch-one BF16 como camino cualificado con el checkpoint base fijado.
- No realiza resumen de texto ni reinyección de tokens históricos.
- No soporta actualmente el paso de una fuente compactada a un bridge.

## Casos de uso

- Recuperación de código en repositorios largos: el selector conserva bloques de atención relevantes en historias de 65.536 a 131.072 tokens, lo que permite responder consultas de funciones de repositorio (32/32 aciertos en la evaluación) sin mantener toda la KV-cache.
- Consulta de decisiones recientes en conversaciones o logs extensos: la tarea "latest decision" obtuvo 31/32 con compactación 8× frente a 32/32 con memoria completa, adecuada para asistentes que deben recordar la última decisión tomada en un hilo largo.
- Búsqueda de registros estructurados: la tarea de lookup de registros estructurados mantuvo 32/32 aciertos con compactación, útil en pipelines de extracción sobre documentos tabulares o bases de datos textuales.
- Lookup de documentos en dos saltos: la compactación 8× obtuvo 32/32 frente a 31/32 con memoria completa en esta tarea, lo que la hace apta para QA multi-hop sobre corpus documentales.
- Sesiones de agente de larga duración: el soporte de fork, save/load y append permite mantener y ramificar estados compactados en flujos multi-paso sin recompilar el contexto completo.
- Despliegue con restricciones de VRAM en inferencia BF16 batch-one: al reducir el almacenamiento KV de atención, permite servir contextos de 64K-128K en GPUs con memoria limitada, siempre que se acepte la pérdida asociada a la compactación.
- Reserva de capacidad en sesiones interactivas: los controles de capacidad a nivel de sesión permiten planificar el espacio para entradas adicionales en asistentes conversacionales de contexto creciente.

## Benchmarks y rendimiento

Evaluación del selector congelado frente al modelo BF16 sin comprimir, sobre ocho sondas por cada una de ocho historias independientes por longitud, con decodificación greedy y respuesta canónica más token de parada válido:

| Tokens de historial | Memoria completa | Compactación 8× | Respuestas de memoria completa retenidas |
| ---: | ---: | ---: | ---: |
| 65.536 | 64/64 | 63/64 | 63/64 |
| 131.072 | 63/64 | 64/64 | 63/63 |

| Tarea (ambas longitudes combinadas) | Memoria completa | Compactación 8× | Perdidas tras compactar | Ganadas tras compactar |
| --- | ---: | ---: | ---: | ---: |
| Lookup de función de repositorio | 32/32 | 32/32 | 0 | 0 |
| Última decisión | 32/32 | 31/32 | 1 | 0 |
| Lookup de registro estructurado | 32/32 | 32/32 | 0 | 0 |
| Lookup de documento en dos saltos | 31/32 | 32/32 | 0 | 1 |

Los resultados provienen de una sola semilla de entrenamiento y de tareas de retrieval sintéticas; las respuestas exactas dependen del modelo base y del historial.

## Requisitos de hardware

- El selector en sí ocupa 196.865 parámetros, por lo que su huella es despreciable frente a los pesos del base.
- La memoria dominante es la del modelo base Qwen/Qwen3.8-Flash-Next en BF16; no se dispone de cifras de VRAM del base en la información proporcionada.
- El camino cualificado es inferencia de texto batch-one en BF16 con PyTorch CUDA, por lo que se requiere una GPU NVIDIA con soporte CUDA.
- No se especifican GPU concretas (A100, H100, RTX 4090) en la información disponible.
- Despliegue mediante el runtime LatentPort 0.4.4 o superior (pip: `latentport`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- No se publican cifras de latencia ni throughput.
- La compactación reduce el almacenamiento KV de atención, no los pesos del base ni toda la memoria de trabajo pico.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (selectores de compactación de KV-cache o mecanismos de memoria de atención aprendidos) con parámetros, contexto, rendimiento, licencia y disponibilidad verificables.

## Limitaciones y advertencias

- La compactación es con pérdida y dependiente de la tarea; puede eliminar información relevante en dominios no cubiertos por las tareas sintéticas de evaluación.
- Reduce el almacenamiento KV de atención, no los pesos del modelo base ni toda la memoria de trabajo pico.
- Una fuente compactada no puede pasarse actualmente a un bridge.
- La calidad medida en un modelo, backend o panel de tareas no debe asumirse para otro.
- Los resultados proceden de una sola semilla de entrenamiento y de tareas de retrieval sintéticas.
- El repositorio no incluye los pesos del base; es necesario descargar Qwen/Qwen3.8-Flash-Next por separado y respetar su licencia upstream.
- El camino cualificado es batch-one BF16; no se documentan otros backends ni cuantizaciones.
- No se dispone de información sobre sesgos, riesgo de alucinación ni cobertura idiomática del modelo base en la información proporcionada.
- Licencia Apache-2.0 para el selector y el código LatentPort, lo que permite uso comercial de estos artefactos, sujeto a las licencias upstream del base y dependencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/latentport/LPCompact-Qwen3.8-Flash-Next
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub de LatentPort: https://github.com/LatentPort/latentport
- PyPI: https://pypi.org/project/latentport/
- Guía de instalación: https://github.com/LatentPort/latentport/blob/main/docs/installation.md
- Documentación de API: https://github.com/LatentPort/latentport/blob/main/docs/api.md
- Perfil del autor: https://au.linkedin.com/in/simon-villani
