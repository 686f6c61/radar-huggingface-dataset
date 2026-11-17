# latentport/LPCompact-Qwen3.5-4B

## Resumen

LPCompact-Qwen3.5-4B es un selector de 393.473 parámetros desarrollado por latentport que se acopla a Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) para compactar la caché de atención del modelo base durante inferencia de contexto largo. No es un modelo generativo autónomo: es un componente que puntúa cada posición a partir de los valores de atención de las capas 3, 15 y 31 y decide qué claves y valores retener, preservando además los estados recurrentes y convolucionales completos y el reloj lógico original.

El problema que aborda es el coste de memoria y cómputo de mantener historiales de 64K a 128K tokens en un transformer con componentes recurrentes. Con una política de compactación 8× por defecto, el selector reduce el número de posiciones físicas retenidas conservando las primeras y últimas 512 posiciones y aplicando un suelo de 1.024 posiciones. El mismo selector sirve para pesos BF16, NF4 y GGUF compatibles, lo que permite desplegarlo sobre distintas cuantizaciones del modelo base sin reentrenar.

Es relevante porque propone una vía de gestión de memoria de contexto que no requiere modificar los pesos del modelo base ni reentrenar el transformer completo: basta con un adaptador minúsculo (393K parámetros) y la librería LatentPort 0.4.0 o superior. La licencia Apache 2.0 y la separación explícita entre selector y pesos base facilitan su evaluación, aunque la ausencia de benchmarks estándar y de adopción pública obliga a tratar sus resultados con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selector sobre valores de atención (capas 3, 15 y 31) para compactación de caché KV; modelo base Qwen3.5-4B |
| Parametros totales | 393.473 (selector); pesos del modelo base no incluidos en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Compactación activa por defecto a partir de 65.536 posiciones físicas; evaluado hasta 131.072 tokens de historial |
| Tipos de cuantizacion | BF16, NF4, GGUF Q4_K_M y GGUF Q8_0 (verificados en runtime) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El selector es un módulo ligero que consume tensores de estado (valores de atención de las capas 3, 15 y 31) y produce una puntuación por posición que determina qué entradas históricas se retienen tras la compactación. La política 8× conserva las primeras y últimas 512 posiciones con un mínimo de 1.024 posiciones retenidas; el parámetro `ratio=4` permite retener más memoria. La compactación preserva los estados recurrentes y convolucionales completos y el reloj lógico original, de modo que las posiciones lógicas no se reescriben al eliminar entradas físicas.

El entrenamiento partió del modelo base BF16 congelado, que aportó todas las características y la supervisión derivada de atención. Hubo un calentamiento con etiquetas de registro sobre 16 historiales independientes de 16K y 256 actualizaciones AdamW, seguido de un entrenamiento de utilidad con 32 historiales adicionales de 16K, 32K, 64K y 128K, 32 preguntas de estudio disjuntas por historial y 1.024 actualizaciones. Las etiquetas estiman el cambio en la salida en espacio de valores de una cabeza cuando se elimina una entrada histórica. El selector desplegado funciona únicamente con tensores de estado.

## Capacidades

- Compactación de caché KV en inferencia de contexto largo sobre Qwen3.5-4B, con política configurable (`ratio=4` para retener más memoria, 8× por defecto).
- Puntuación por posición basada en valores de atención de tres capas concretas (3, 15 y 31).
- Preservación de estados recurrentes y convolucionales completos, además de las primeras y últimas 512 posiciones.
- Mantenimiento del reloj lógico original tras la compactación, sin reescritura de posiciones lógicas.
- Compatibilidad con pesos BF16, NF4 y GGUF (Q4_K_M y Q8_0) del mismo modelo base.
- Soporte de generación sobre bifurcaciones (`fork`) del estado compactado, guardado y carga dispersos y compactación repetida.
- No es un modelo de propósito general: no genera texto por sí mismo, no soporta tool calling ni agentes de forma nativa y no se documentan capacidades multilingües propias.

## Casos de uso

- Atención al cliente con historiales largos: el selector permite mantener conversaciones multi-turno de decenas de miles de tokens compactando la caché a partir de 65.536 posiciones, reduciendo la memoria necesaria para servir sesiones prolongadas con Qwen3.5-4B.
- Procesamiento de documentos extensos con preguntas de recuperación: útil en escenarios de búsqueda de funciones en repositorios, consulta de registros estructurados y localización de decisiones recientes, tareas en las que la model card reporta retención completa de respuestas exactas.
- Agentes de larga duración: al preservar estados recurrentes y convolucionales completos y el reloj lógico, el estado compactado puede bifurcarse (`fork`) para explorar varias continuaciones de una tarea sin recomputar el historial.
- Despliegue en hardware con memoria limitada: la compatibilidad con NF4 y GGUF Q4_K_M permite servir contextos de 64K–128K en GPUs profesionales con menor huella de memoria que BF16.
- Evaluación de pipelines de contexto largo: el selector y el modelo base sin comprimir pueden ejecutarse en paralelo sobre los mismos historiales para medir la degradación introducida por la compactación antes de adoptarla en producción.
- Investigación sobre gestión de memoria en transformers híbridos: el selector sirve como banco de pruebas para estudiar políticas de retención de caché KV en arquitecturas con componentes recurrentes, con un coste de parámetros despreciable frente al modelo base.

## Benchmarks y rendimiento

Los únicos datos publicados son evaluaciones de respuestas exactas sobre tareas sintéticas de recuperación, con un único seed de entrenamiento.

| Historial (tokens) | Memoria completa | Compactación 8× | Respuestas de memoria completa retenidas |
| ---: | ---: | ---: | ---: |
| 65.536 | 49/64 | 51/64 | 49/49 |
| 131.072 | 47/64 | 49/64 | 47/47 |

| Tarea (ambas longitudes combinadas) | Memoria completa | Compactación 8× | Perdidas tras compactar | Ganadas tras compactar |
| --- | ---: | ---: | ---: | ---: |
| Búsqueda de función en repositorio | 32/32 | 32/32 | 0 | 0 |
| Última decisión | 31/32 | 31/32 | 0 | 0 |
| Consulta de registro estructurado | 32/32 | 32/32 | 0 | 0 |
| Búsqueda de documento a dos saltos | 1/32 | 5/32 | 0 | 4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base Qwen3.5-4B y de la cuantización. La compactación reduce el número de posiciones físicas retenidas, no el tamaño de los pesos.
- GPU recomendadas: la model card cita verificación en una NVIDIA RTX PRO 6000 (Ohio) con comprobaciones a 64K y 128K en BF16, NF4, GGUF Q4_K_M y GGUF Q8_0.
- GPU de consumo: no se documenta compatibilidad ni rendimiento en GPUs consumer; el requisito de contexto de 64K–128K hace probable que se necesiten GPUs con 24 GB o más, pero no hay datos confirmados.
- Opciones de despliegue: librería LatentPort 0.4.0 o superior con backend `bf16`, más pesos NF4 y GGUF; los pesos del modelo base se obtienen por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
| --- | ---: | ---: | --- | --- | --- |
| LPCompact-Qwen3.5-4B | 393.473 (selector) | compactación desde 65.536; evaluado a 131.072 | Compactación de caché KV sobre Qwen3.5-4B | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | no disponible en la información | no disponible | Modelo generativo de propósito general | no disponible en la información | Hugging Face |
| Alternativas de compactación de caché KV | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos sobre otros selectores o políticas de compactación comparables en la información proporcionada.

## Limitaciones y advertencias

- El selector no es un modelo generativo: requiere el modelo base Qwen3.5-4B y la librería LatentPort 0.4.0 o superior; no puede usarse de forma autónoma.
- Los resultados publicados provienen de un único seed de entrenamiento y de tareas sintéticas de recuperación; no hay validación en benchmarks estándar ni en dominios reales.
- La tarea de búsqueda de documento a dos saltos muestra un rendimiento muy bajo incluso con memoria completa (1/32), lo que sugiere que el modelo base tiene dificultades en ese tipo de razonamiento independientemente de la compactación.
- La compactación puede alterar respuestas en tareas no cubiertas por la evaluación; se recomienda comparar contra el modelo sin comprimir antes de producción.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación específicos del selector; los del modelo base no se detallan en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB: no hay evidencia de adopción ni de revisión independiente.
- La licencia Apache 2.0 permite uso comercial, pero los pesos del modelo base se obtienen por separado y quedan sujetos a su propia licencia, no indicada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/latentport/LPCompact-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Runtime e instalación (LatentPort): https://github.com/LatentPort/latentport
