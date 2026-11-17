# latentport/LPCompact-Qwen3.5-9B

## Resumen

LPCompact-Qwen3.5-9B es un selector de compactación de caché de atención desarrollado por latentport para el modelo base Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`). No es un modelo de lenguaje autónomo: es un componente de 393.473 parámetros que decide qué entradas de la KV-cache y qué estados recurrentes y convolucionales deben conservarse cuando la memoria de trabajo supera un umbral físico, típicamente 65.536 posiciones. El objetivo es reducir el coste de memoria de contextos largos sin reentrenar el modelo base, que permanece congelado en BF16.

La relevancia práctica está en que permite prolongar sesiones de contexto largo (hasta 128K tokens y más) manteniendo respuestas exactas en tareas de recuperación, con una política de compactación 8× por defecto. El selector puntúa cada posición a partir de los valores de atención en las capas 3, 15 y 31, y LatentPort conserva las claves y valores seleccionados, los estados recurrentes y convolucionales completos, y el reloj lógico original. El mismo selector sirve para pesos BF16, NF4 y GGUF compatibles.

El proyecto se distribuye con licencia Apache 2.0, requiere la librería `latentport` 0.4.0 o superior y se apoya en un runtime propio (no en transformers, vLLM o llama.cpp de forma directa). A fecha de la información disponible el repositorio tiene 0 descargas y 0 likes, y el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos del selector se publican como artefacto ligero separado de los pesos del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Selector de compactación de KV-cache sobre transformer Qwen3.5-9B (capas de atención 3, 15 y 31) |
| Parámetros totales | 393.473 (solo el selector; el modelo base Qwen3.5-9B se obtiene por separado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 128K tokens verificados en entrenamiento y evaluación; compactación por defecto a partir de 65.536 posiciones físicas |
| Tipos de cuantización | BF16, NF4, GGUF Q4_K_M y GGUF Q8_0 (soportados por el mismo selector) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (selector); pesos del modelo base en BF16/NF4/GGUF obtenidos aparte |

## Arquitectura y entrenamiento

El selector es un módulo ligero que opera sobre tensores de estado del modelo base Qwen3.5-9B, que permanece congelado. Puntúa cada posición histórica usando los valores de atención de las capas 3, 15 y 31, y produce una selección de entradas de la KV-cache que se retienen junto con los estados recurrentes y convolucionales completos y el reloj lógico original. La compactación por defecto se activa a las 65.536 posiciones físicas, con una política 8× que preserva las primeras y últimas 512 posiciones y aplica un suelo de 1.024 posiciones; el parámetro `ratio=4` permite retener más memoria.

El entrenamiento se realizó en dos fases sobre el modelo base BF16 congelado, que aportó tanto las características como la supervisión derivada de la atención. Una fase de calentamiento con etiquetas de registro usó 16 historiales independientes de 16K y 256 actualizaciones AdamW. La fase de utilidad usó 32 historiales adicionales de 16K, 32K, 64K y 128K, con 32 preguntas de estudio disjuntas por historial y 1.024 actualizaciones. Las etiquetas estiman el cambio en la salida en el espacio de valores de una cabeza cuando se elimina una entrada histórica. El selector desplegado consume únicamente tensores de estado.

## Capacidades

- Compactación de la caché de atención de Qwen3.5-9B en contextos largos (64K, 128K y superiores) con una política 8× por defecto.
- Conservación de estados recurrentes y convolucionales completos, además de las claves y valores seleccionados.
- Preservación del reloj lógico original, lo que permite continuar sesiones y bifurcar (`fork`) el estado compactado.
- Compatibilidad con pesos BF16, NF4, GGUF Q4_K_M y GGUF Q8_0 mediante el mismo selector.
- Soporte de guardado y carga dispersos (`sparse save/load`) y compactación repetida.
- Generación sobre estados bifurcados (`generation on forks`).
- No incorpora tool calling, visión, audio ni capacidades generativas propias: hereda las del modelo base Qwen3.5-9B.

## Casos de uso

- Sesiones de agente de larga duración: el selector permite mantener historiales de 64K–128K tokens compactando la KV-cache a 8×, de modo que un agente multi-paso conserva el contexto de decisiones anteriores sin agotar la VRAM.
- Recuperación en repositorios de código: en la tabla de evaluación, la tarea de búsqueda de funciones en repositorio mantiene 32/32 aciertos con compactación 8×, por lo que es adecuada para asistentes que consultan código fuente extenso.
- Búsqueda estructurada de registros: la tarea de lookup de registros estructurados conserva 32/32 aciertos con compactación, útil en pipelines de extracción sobre documentos tabulares largos.
- Análisis de documentación de dos saltos: aunque el rendimiento absoluto es bajo (4/32 con compactación frente a 1/32 con memoria completa), la compactación no degrada y en algún caso mejora el resultado, lo que la hace viable para prototipos de razonamiento documental multi-hop.
- Despliegue en GPUs de gama profesional con cuantización: al soportar NF4 y GGUF Q4_K_M/Q8_0 con el mismo selector, permite servir contextos largos en una RTX PRO 6000 o GPUs con menos VRAM que un despliegue BF16 completo.
- Evaluación y depuración de políticas de memoria: la API `state.compact()` y el parámetro `ratio` permiten comparar políticas de retención (8× frente a 4×) sobre el mismo historial sin reentrenar.
- Bifurcación de estado para exploración: la generación sobre forks permite ramificar una conversación compactada y comparar respuestas sin recalcular el prefijo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre tareas sintéticas de recuperación, con el selector congelado y el modelo BF16 sin comprimir como referencia. Cada longitud usa ocho historiales independientes y ocho sondas por historial (64 en total).

| Tokens de historial | Memoria completa | Compactación 8× | Respuestas de memoria completa retenidas |
| ---: | ---: | ---: | ---: |
| 65.536 | 49/64 | 50/64 | 47/49 |
| 131.072 | 48/64 | 48/64 | 48/48 |

| Tarea (ambas longitudes combinadas) | Memoria completa | Compactación 8× | Perdidas tras compactar | Ganadas tras compactar |
| --- | ---: | ---: | ---: | ---: |
| Búsqueda de función en repositorio | 32/32 | 32/32 | 0 | 0 |
| Última decisión | 32/32 | 30/32 | 2 | 0 |
| Lookup de registro estructurado | 32/32 | 32/32 | 0 | 0 |
| Lookup documental de dos saltos | 1/32 | 4/32 | 0 | 3 |

Los resultados provienen de una única semilla de entrenamiento y de tareas sintéticas; los autores advierten que las respuestas exactas dependen del modelo base y del historial. Verificación en runtime realizada en una RTX PRO 6000 (Ohio) con BF16, NF4, GGUF Q4_K_M y GGUF Q8_0 a 64K y 128K, cubriendo tensores retenidos exactos, posiciones lógicas, generación en forks, guardado/carga dispersos y compactación repetida.

## Requisitos de hardware

- VRAM estimada: depende del modelo base Qwen3.5-9B y del ratio de compactación; el selector añade solo 393.473 parámetros. Con compactación 8× a partir de 65.536 posiciones se reduce la huella de KV-cache respecto a memoria completa, pero no se publican cifras absolutas de VRAM.
- GPU recomendadas: los autores verificaron en una NVIDIA RTX PRO 6000; no se especifican otras GPU validadas.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090, 3090 u otras consumer.
- Opciones de despliegue: runtime propio `latentport` 0.4.0 o superior (`backend="bf16"` y variantes NF4/GGUF). No se documenta integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada selectores de compactación de KV-cache comparables con parámetros, contexto y licencia documentados. Las alternativas habituales (SnapKV, H2O, StreamingLLM) no aparecen citadas en la model card ni se aportan datos de comparación.

## Limitaciones y advertencias

- No es un modelo de lenguaje: requiere Qwen/Qwen3.5-9B y la librería `latentport` 0.4.0+; no funciona con transformers, vLLM o llama.cpp de forma nativa.
- Los benchmarks provienen de una sola semilla de entrenamiento y de tareas sintéticas de recuperación; la generalización a dominios reales no está demostrada.
- En la tarea "última decisión" se pierden 2 de 32 aciertos tras compactar, lo que indica que la política 8× puede descartar información relevante en consultas sensibles al último turno.
- El rendimiento absoluto en lookup documental de dos saltos es muy bajo (4/32), por lo que no es adecuado para razonamiento multi-hop complejo sin memoria completa.
- Idiomas soportados no documentados; las capacidades multilingües dependen íntegramente del modelo base.
- Sesgos y riesgo de alucinación: no evaluados en la información disponible; heredados del modelo base Qwen3.5-9B.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse por separado la licencia de los pesos del modelo base Qwen3.5-9B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- El hash SHA-256 del selector (`0edabb5e8053ed322ff68278e192841231a3c46516692e1194c871f85b62b3e6`) debe verificarse antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/latentport/LPCompact-Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime e instalación: https://github.com/LatentPort/latentport
