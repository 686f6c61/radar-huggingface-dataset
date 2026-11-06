# jumafernandez/trace-deep-bidi

## Resumen

TRACE (deep, bidirectional) es un codificador contextual de turnos para diálogo orientado a tareas, desarrollado por jumafernandez (J. M. Fernández) en colaboración con M. Errecalde y S. Burdisso. El modelo no genera texto: su función es transformar una secuencia de embeddings estáticos de turnos en representaciones contextualizadas, donde cada turno queda descrito en relación con el resto del diálogo. Se construye sobre el codificador base congelado `sergioburdisso/dialog2flow-joint-bert-base` y añade un Transformer de 12 capas y 12 cabezas de atención (768 dimensiones ocultas) cuyos tokens son los propios turnos, no los tokens de texto.

El problema que resuelve es la falta de contexto en las representaciones de turno habituales: un embedding estático de "italian" no distingue si el usuario responde a una pregunta sobre tipo de comida o si cambia de tema. TRACE produce `h_t ∈ R^768` para cada turno atendiendo a todos los turnos de la ventana (hasta 64), en ambas direcciones, lo que permite alimentar clasificadores de actos de diálogo, trackers de estado o módulos de extracción de slots con representaciones ricas sin necesidad de anotaciones.

Es relevante porque el entrenamiento es auto-supervisado (reconstrucción enmascarada de turnos) y no requiere etiquetas de actos de diálogo, lo que abarata su adaptación a nuevos dominios de diálogo orientado a tareas. Con 85,1 M de parámetros y licencia Apache 2.0, es un componente ligero y desplegable en CPU para pipelines de comprensión de diálogo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-style sobre embeddings de turno: 12 capas, 12 cabezas, tamaño oculto 768 |
| Parámetros totales | 85.108.224 (85,1 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 64 turnos por ventana; diálogos más largos se codifican en ventanas consecutivas |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB, con `custom_code` y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer de 12 capas y 12 cabezas con dimensión oculta 768, operando sobre una secuencia de embeddings de turno en lugar de tokens. La entrada combina el embedding estático del turno `e_t` (768 dimensiones, calculado por el encoder base congelado `sergioburdisso/dialog2flow-joint-bert-base`), identificadores de hablante y posiciones de turno. La atención es bidireccional: cada turno atiende a todos los turnos de la ventana, anteriores y posteriores, de modo que `h_t` describe el turno dentro del diálogo completo. La salida es `h_t ∈ R^768` por turno.

El entrenamiento se realiza desde cero sobre la colección de diálogo orientado a tareas de Dialog2Flow, particionada por clústeres de casi duplicados para evitar fuga de datos entre entrenamiento y validación. El objetivo es auto-supervisado: reconstrucción enmascarada de turnos, sin anotaciones de actos de diálogo. Se usa tasa de aprendizaje 10^-4, semilla 42 y selección del checkpoint por pérdida de validación. No se documenta RLHF ni DPO, ni el número exacto de tokens de entrenamiento.

La innovación principal es el planteamiento "tokens = turnos": en lugar de contextualizar a nivel de palabra, contextualiza a nivel de turno, lo que reduce drásticamente la longitud de secuencia (64 turnos frente a miles de tokens) y hace viable el modelado de diálogos largos. El repositorio incluye el checkpoint convertido a formato transformers, verificado contra el código de entrenamiento sobre 50 diálogos de SpokenWOZ (883 turnos) con diferencia absoluta máxima de 3,8 × 10^-6, y sobre todos los prefijos de 20 de esos diálogos (413 turnos) con 4,5 × 10^-6.

## Capacidades

- Extracción de características: produce representaciones contextuales `h_t` de 768 dimensiones para cada turno de un diálogo.
- Codificación bidireccional: cada turno se representa en el contexto de toda la ventana del diálogo.
- Codificación de prefijos: mediante `encode_dialogue` sobre `turns[:t+1]` se obtienen representaciones que solo usan el diálogo hasta el turno `t`, aptas para escenarios en línea.
- Manejo de hablantes: acepta identificadores de hablante (`user`, `system`, etc.) por turno.
- Ventanas de hasta 64 turnos con codificación automática en ventanas consecutivas para diálogos más largos.
- Uso de embeddings precalculados: permite pasar `embeddings=` para evitar recalcular la base.
- No soporta generación de texto, tool calling, function calling, agentes, visión ni audio: es un modelo de `feature-extraction`.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Clasificación de actos de diálogo: usar `h_t` como entrada a un clasificador ligero (regresión logística o MLP) para etiquetar cada turno como pregunta, inform, request, etc., sin ingeniería de características manual.
- Seguimiento del estado del diálogo (DST): alimentar un tracker con las representaciones contextuales de los turnos para actualizar los slots acumulados (restaurante, hora, precio) en sistemas de reservas.
- Extracción de slots y valores: las representaciones contextualizadas ayudan a desambiguar valores como "italian" según el turno anterior, mejorando la extracción en pipelines de NLU.
- Detección de cambios de tema y segmentación: la atención bidireccional permite identificar transiciones de dominio en diálogos multi-intento.
- Preprocesado para modelos de decisión de política: usar `h_t` como estado comprimido del diálogo en un agente de política de diálogo orientado a tareas.
- Análisis y evaluación de diálogos: representaciones de turno para medir coherencia, detectar respuestas fuera de tema o comparar calidad entre sistemas.
- Preentrenamiento de cabezas específicas de dominio: al ser auto-supervisado y ligero (85,1 M), sirve como extractor congelado para adaptar tareas de diálogo con pocas etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 0,3 GB en safetensors; en fp32 requiere aproximadamente 0,34 GB solo para pesos, más activaciones y el encoder base congelado (que debe cargarse aparte vía `sentence-transformers`).
- Cabe en cualquier GPU consumer (GTX 1650 4 GB, RTX 3060 12 GB, RTX 4090 24 GB) y en CPU para inferencia por lotes pequeños.
- GPU recomendadas: no hay recomendaciones oficiales; por tamaño, cualquier GPU con al menos 2 GB libres es suficiente para el modelo TRACE, a lo que se suma el encoder base.
- Despliegue: `transformers` con `trust_remote_code=True`; requiere `sentence-transformers` para calcular los embeddings base. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo y usa código personalizado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRACE deep bidirectional | 85,1 M | 64 turnos | Representaciones contextuales de turno | Apache 2.0 | Hugging Face |
| `sergioburdisso/dialog2flow-joint-bert-base` (base congelada) | no disponible | tokens de texto | Embeddings estáticos de turno | no disponible | Hugging Face |
| `jumafernandez/trace-deep-ar` (variante autorregresiva) | no disponible | 64 turnos | Representaciones contextuales de turno | no disponible | Hugging Face |

La comparación con otros codificadores contextuales de diálogo de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con diálogo orientado a tareas en inglés; el rendimiento en otros idiomas o en diálogo abierto no está garantizado.
- Espera embeddings del encoder base concreto con el que fue entrenado; usar otro encoder base invalida las representaciones.
- La atención bidireccional hace que `h_t` dependa de turnos posteriores, por lo que no es directamente apto para inferencia en línea sin el procedimiento de codificación de prefijos.
- Ventana máxima de 64 turnos por bloque; los diálogos más largos se codifican en ventanas consecutivas, lo que puede perder dependencias entre ventanas.
- Riesgo de alucinación no aplica en sentido generativo (no produce texto), pero las representaciones pueden amplificar sesgos presentes en el corpus Dialog2Flow.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de código personalizado (`trust_remote_code=True`), lo que implica ejecutar código del autor; se recomienda fijar una `revision`.
- No se documentan sesgos específicos ni métricas de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jumafernandez/trace-deep-bidi
- Variante autorregresiva por defecto: https://huggingface.co/jumafernandez/trace-deep-ar
- Checkpoints de todas las variantes: https://huggingface.co/jumafernandez/trace-checkpoints
- Encoder base congelado: https://huggingface.co/sergioburdisso/dialog2flow-joint-bert-base
- Cita: Fernández, J. M., Errecalde, M., & Burdisso, S. *TRACE: Learning the Update for Contextual Turn Representations in Task-Oriented Dialogue.* In preparation.
