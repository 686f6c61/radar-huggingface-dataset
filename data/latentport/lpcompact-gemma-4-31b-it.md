# latentport/LPCompact-Gemma-4-31B-it

## Resumen

LPCompact-Gemma-4-31B-it es un selector de compactación de memoria de atención entrenado por Simon P. Villani (proyecto LatentPort) para el modelo google/gemma-4-31B-it. No es un modelo de lenguaje completo: los 786.689 parámetros del repositorio corresponden exclusivamente al selector, mientras que los pesos del modelo base se distribuyen por separado. Su función es reducir el almacenamiento del KV-cache en contextos largos mediante una política aprendida que decide qué entradas de atención conservar.

El selector puntúa los valores de atención global en las capas 5, 29 y 59, y LatentPort recoge las claves y valores seleccionados en las diez capas de atención global del modelo, preservando las ventanas deslizantes nativas de las otras cincuenta capas, las posiciones originales y el reloj de continuación lógico. Se expone a través de la API `state.compact()` de la librería `latentport`, que requiere Python 3.11+, PyTorch con CUDA y dependencias de backend BF16.

Es relevante porque aborda uno de los cuellos de botella prácticos de la inferencia con contexto largo: el crecimiento lineal del KV-cache con la longitud de la secuencia. Con una ratio de compactación por defecto de 8, el autor reporta una retención de respuestas correctas del 59/61 y 57/59 sobre memorias completas en ventanas de 65.536 y 131.072 tokens respectivamente, en tareas sintéticas de recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selector de compactación de atención sobre transformer Gemma (base google/gemma-4-31B-it); puntúa atención global en capas 5, 29 y 59 |
| Parametros totales | 786.689 (solo el selector; el modelo base se distribuye aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas evaluadas de 65.536 y 131.072 tokens; activación normal desde 65.536 posiciones físicas |
| Tipos de cuantizacion | no disponible (la ruta cualificada es BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (selector y código LatentPort); el modelo base Gemma conserva su licencia upstream |
| Formato de pesos | safetensors (`model.safetensors` con el selector; `config.json` con arquitectura, política y huellas de checkpoint) |

## Arquitectura y entrenamiento

El selector opera sobre la atención del transformer Gemma del modelo base. Puntúa los valores de atención global en tres capas concretas (5, 29 y 59) y, a partir de esas puntuaciones, LatentPort recoge claves y valores en las diez capas de atención global, manteniendo intactas las ventanas deslizantes de las otras cincuenta capas, las posiciones originales y el reloj de continuación lógico. La política preserva las primeras y últimas 512 posiciones, con un suelo de 1.024 posiciones. La ratio por defecto es 8; `ratio=4` retiene más memoria. Las historias cortas no se modifican por defecto.

El entrenamiento partió del modelo BF16 congelado, que suministró todas las características y la supervisión derivada de la atención. Un calentamiento con etiquetas de registro usó 16 historias independientes de 16K y 256 actualizaciones AdamW. El entrenamiento de utilidad empleó 32 historias adicionales de 16K, 32K, 64K y 128K, con 32 preguntas de estudio disjuntas por historia y 1.024 actualizaciones. Las etiquetas estiman el cambio en la salida en espacio de valores de una cabeza cuando se elimina una entrada histórica. El selector desplegado acepta únicamente tensores de estado. El resultado soporta append, guardado/carga y fork.

## Capacidades

- Compactación de memoria de atención en contextos largos mediante `state.compact()`, con control de ratio y capacidad a nivel de sesión.
- Reducción del almacenamiento KV en las diez capas de atención global del modelo base, sin alterar las ventanas deslizantes de las cincuenta capas restantes.
- Preservación de posiciones originales y del reloj de continuación lógico tras la compactación.
- Soporte de append sobre estado compactado, guardado y carga de estado, y fork de sesiones.
- Carga con streaming de capas decodificadoras congeladas desde memoria host.
- Registro en la configuración de runtime de las revisiones exactas del modelo base y del selector.
- No incorpora generación de texto, razonamiento, código, matemáticas, visión ni tool calling por sí mismo: esas capacidades dependen del modelo base Gemma-4-31B-it.

## Casos de uso

- Asistentes con historial largo de conversación: el selector permite mantener sesiones de más de 65.000 tokens compactando el KV-cache con ratio 8, preservando las primeras y últimas 512 posiciones para no perder el contexto inicial ni el turno reciente.
- Recuperación de decisiones recientes en documentos extensos: en la tarea "Latest decision" el autor reporta 30/32 aciertos con compactación frente a 32/32 con memoria completa, un caso realista para resúmenes de actas o registros de proyecto.
- Búsqueda de funciones en repositorios de código: la tarea "Repository function lookup" mantiene 32/32 aciertos con compactación, adecuada para asistentes de navegación de código con historiales largos.
- Consulta de registros estructurados: "Structured record lookup" conserva 32/32 aciertos, útil en pipelines de extracción sobre tablas o bases de datos serializadas en el prompt.
- Recuperación de dos saltos en documentación: "Two-hop document lookup" obtiene 27/32 con compactación frente a 24/32 con memoria completa, lo que sugiere utilidad en preguntas que requieren encadenar referencias dentro de un corpus largo.
- Despliegue con memoria limitada: al reducir el KV-cache en las capas globales, permite servir sesiones de 128K tokens en GPUs con VRAM ajustada, siempre que el modelo base quepa con el backend BF16.
- Evaluación de políticas de memoria: el soporte de fork y guardado/carga de estado facilita comparar configuraciones de ratio (4 frente a 8) sobre las mismas historias sin recalcular el prefill.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, sobre tareas sintéticas de recuperación con decodificación greedy y ocho historias independientes por longitud:

| Tokens de historia | Memoria completa | Compactación 8× | Respuestas de memoria completa retenidas |
| ---: | ---: | ---: | ---: |
| 65.536 | 61/64 | 61/64 | 59/61 |
| 131.072 | 59/64 | 60/64 | 57/59 |

| Tarea (ambas longitudes combinadas) | Memoria completa | Compactación 8× | Perdidas tras compactar | Ganadas tras compactar |
| --- | ---: | ---: | ---: | ---: |
| Repository function lookup | 32/32 | 32/32 | 0 | 0 |
| Latest decision | 32/32 | 30/32 | 2 | 0 |
| Structured record lookup | 32/32 | 32/32 | 0 | 0 |
| Two-hop document lookup | 24/32 | 27/32 | 2 | 5 |

Los resultados proceden de una única semilla de entrenamiento y de tareas sintéticas; el autor advierte que las respuestas exactas dependen del modelo base y de la historia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el selector añade 786.689 parámetros, pero el coste dominante es el modelo base Gemma-4-31B-it en BF16.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; la ruta cualificada exige CUDA PyTorch y backend BF16.
- Despliegue: librería `latentport` 0.4.6 o superior, Python 3.11+, PyTorch con CUDA y dependencias de backend BF16; el loader puede hacer streaming de capas decodificadoras congeladas desde memoria host. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que la compactación reduce el almacenamiento KV de atención, no los pesos del modelo base ni toda la memoria de trabajo pico.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de compactación de KV-cache ni resultados frente a alternativas.

## Limitaciones y advertencias

- La compactación es con pérdida y depende de la tarea; se observaron pérdidas en "Latest decision" (2 respuestas) y en "Two-hop document lookup" (2 respuestas).
- Reduce el almacenamiento KV de atención, no los pesos del modelo base ni toda la memoria de trabajo pico.
- Una fuente compactada no puede pasarse actualmente a un bridge.
- La calidad medida en un modelo, backend o panel de tareas no debe asumirse para otro.
- Los resultados proceden de una única semilla de entrenamiento y de tareas sintéticas de recuperación.
- La ruta cualificada es inferencia de texto BF16 de secuencia única con el checkpoint instruction-tuned fijado; no se documentan otros modos.
- Idiomas soportados no disponibles; no se documentan sesgos ni tasas de alucinación específicas del selector.
- Licencia Apache-2.0 para el selector y el código LatentPort, pero el modelo base Gemma y las dependencias de runtime conservan sus licencias upstream, que deben verificarse para uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/latentport/LPCompact-Gemma-4-31B-it
- GitHub: https://github.com/LatentPort/latentport
- PyPI: https://pypi.org/project/latentport/
- Guía de instalación: https://github.com/LatentPort/latentport/blob/main/docs/installation.md
- Documentación de API: https://github.com/LatentPort/latentport/blob/main/docs/api.md
- Perfil del autor: https://au.linkedin.com/in/simon-villani
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
