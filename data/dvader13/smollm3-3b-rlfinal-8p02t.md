# dvader13/smollm3-3b-rlfinal-8p02t

## Resumen

Este repositorio aloja un checkpoint de entrenamiento intermedio del modelo SmolLM3-3B, creado por el usuario dvader13. Se trata de un punto de control al final de la primera época de un proceso de reinforcement learning (RL), con el estado completo del entrenamiento: pesos en fp32, optimizador, scheduler y estado del generador de números aleatorios. No es un modelo listo para inferencia, sino un artefacto pensado para reanudar o auditar un entrenamiento.

El modelo base, SmolLM3-3B, es un transformer decoder-only de 3 mil millones de parámetros desarrollado por Hugging Face, entrenado sobre 11T tokens y con soporte nativo de seis idiomas. Incorpora Grouped Query Attention (GQA) para reducir el tamaño del cache KV y prescinde de RoPE, lo que mejora el rendimiento en tareas de contexto largo. Este checkpoint concreto, sin embargo, no es un export de inferencia y su uso práctico requiere primero convertirlo a un formato de pesos desplegable.

La relevancia de este artefacto radica en su naturaleza de "checkpoint de investigación": permite a equipos de desarrollo reproducir o continuar el entrenamiento de RL sobre SmolLM3-3B. Para la mayoría de usuarios, el modelo base o sus versiones afinadas publicadas por Hugging Face son más adecuadas para tareas de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Grouped Query Attention (GQA), sin RoPE |
| Parametros totales | 3.2 mil millones (modelo base SmolLM3-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | no disponible (checkpoint en fp32, no export de inferencia) |
| Idiomas soportados | 6 idiomas (modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | fp32 (estado completo de entrenamiento: pesos + optimizador + scheduler + RNG) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer decoder-only con Grouped Query Attention (GQA), una técnica que agrupa las cabezas de atención para reducir el tamaño del cache KV y mejorar la eficiencia en inferencia. A diferencia de otros modelos recientes, no utiliza RoPE (Rotary Position Embeddings), lo que contribuye a un mejor rendimiento en tareas de contexto largo. El modelo fue entrenado sobre 11T tokens de datos públicos, con un proceso que combina preentrenamiento y ajuste por instrucciones, incluyendo un modo de razonamiento dual.

Este checkpoint concreto, `smollm3-3b-rlfinal-8p02t`, corresponde al final de la primera época de una fase de RL (reinforcement learning) sobre el modelo base. El nombre del repositorio indica que el preentrenamiento se realizó con 8.02 trillones de tokens (rung `8.02T`). El checkpoint está en el paso 1804 y contiene el estado completo del entrenamiento: pesos en fp32, optimizador, scheduler y RNG, lo que permite reanudar el proceso exactamente donde se detuvo. No se ha publicado información sobre el dataset de RL, el algoritmo de optimización ni las métricas de recompensa utilizadas.

## Capacidades

- Generación de texto y razonamiento: el modelo base SmolLM3-3B es capaz de tareas de generación de texto, razonamiento y matemáticas.
- Soporte de tool calling y function calling: disponible en el modelo base afinado, aunque este checkpoint no incluye la configuración de inferencia.
- Modo de razonamiento dual: el modelo base tiene dos modos de razonamiento (rápido y profundo), lo que permite adaptar la latencia al escenario.
- Capacidades multilingües: soporte nativo de seis idiomas (inglés, español, francés, alemán, portugués, italiano).
- Contexto largo: 128K tokens de ventana de contexto, gracias al uso de GQA y la ausencia de RoPE.
- **Importante**: este checkpoint NO es un modelo de inferencia. No puede usarse directamente para generar texto ni para tareas de producción. Solo es un artefacto de entrenamiento.

## Casos de uso

- **Reanudación de entrenamiento**: el caso de uso principal de este checkpoint es continuar el entrenamiento de RL desde el paso 1804. Un investigador puede cargar el estado completo (pesos, optimizador, scheduler) para continuar el proceso sin perder el progreso.
- **Auditoría y análisis de entrenamiento**: permite inspeccionar el estado del optimizador y los pesos en un punto intermedio para analizar la dinámica del entrenamiento, la magnitud de los gradientes o la evolución de la pérdida.
- **Ajuste fino adicional**: se puede utilizar como punto de partida para un ajuste fino supervisado (SFT) o una nueva fase de RL con un dataset diferente, ya que contiene el estado completo de optimización.
- **Reproducibilidad**: para equipos que quieran reproducir un pipeline de RL sobre SmolLM3-3B, este checkpoint ofrece un punto de referencia intermedio con el RNG guardado, lo que permite reproducir la secuencia de muestreo.
- **Investigación sobre RL para modelos de lenguaje**: los investigadores pueden estudiar cómo el RL afecta al modelo en esta fase intermedia, comparando con el modelo base y con el modelo final.
- **Conversión para inferencia**: un usuario técnico podría convertir este checkpoint a un formato de inferencia (por ejemplo, safetensors con pesos en bf16) y probar el modelo, aunque no se recomienda porque el checkpoint no está diseñado para eso y el modelo base afinado de Hugging Face ofrece un mejor rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint específico en la información disponible. El modelo base SmolLM3-3B, según el repositorio de Hugging Face, supera a Llama 3.2 3B y Qwen2.5 3B en las evaluaciones estándar y es competitivo con modelos de 4B como Qwen3 y Gemma3. Sin embargo, estos resultados no se pueden extrapolar directamente a este checkpoint de RL intermedio, ya que no se han evaluado las métricas de este punto concreto.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no aplicable, ya que este checkpoint no es un modelo de inferencia.
- **VRAM para entrenamiento**: el checkpoint contiene pesos en fp32 de 3.2B parámetros, lo que ocupa aproximadamente 12.8 GB solo en pesos. Añadiendo el optimizador (Adam con dos estados), el scheduler y el RNG, el estado completo puede requerir entre 40 y 60 GB de VRAM para reanudar el entrenamiento, dependiendo del batch size y la implementación.
- **GPU recomendadas**: para reanudar el entrenamiento se recomienda una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) o un clúster con paralelismo de datos.
- **Despliegue en consumer GPU**: no es posible de forma práctica, dado el tamaño del estado de entrenamiento.
- **Opciones de despliegue**: no aplica, no es un modelo de inferencia.

## Comparativa con modelos similares

No hay modelos directamente comparables, ya que este es un checkpoint de entrenamiento, no un modelo de inferencia. No obstante, el modelo base SmolLM3-3B se puede comparar con alternativas del mismo tamaño:

| Modelo | Parámetros | Contexto | Rendimiento (MMLU) | Licencia |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3.2B | 128K | Supera a Llama 3.2 3B y Qwen2.5 3B | Apache 2.0 |
| Llama 3.2 3B | 3.2B | 128K | Inferior a SmolLM3-3B | Llama 3.2 Community License |
| Qwen2.5 3B | 3.2B | 32K | Inferior a SmolLM3-3B | Apache 2.0 |
| Gemma3 4B | 4B | 128K | Competitivo con SmolLM3-3B | Gemma Terms of Use |

## Limitaciones y advertencias

- **No es un modelo de inferencia**: el checkpoint no se puede cargar en frameworks como vLLM, llama.cpp o transformers para generar texto directamente. Es un artefacto de entrenamiento con estado completo, no un export de pesos.
- **Sin garantía de rendimiento**: al ser un checkpoint intermedio de RL, no se han validado sus capacidades de generación. Puede tener un comportamiento inestable o degradado respecto al modelo base.
- **Sin datos de entrenamiento**: no se ha publicado información sobre el dataset de RL, el algoritmo de recompensa ni las métricas de entrenamiento, lo que limita la reproducibilidad.
- **Sesgos y alucinaciones**: el modelo base SmolLM3-3B puede presentar sesgos presentes en sus datos de pre-entrenamiento, y este checkpoint no incluye ninguna evaluación de sesgos.
- **Licencia**: aunque la licencia es Apache 2.0, el uso del checkpoint para entrenamiento requiere verificar que los datos de RL cumplen con los términos de la licencia.
- **Tamaño del repositorio**: 36.9 GB, lo que implica descargas pesadas y requiere espacio de almacenamiento considerable.
- **Fecha de creación**: el repositorio está fechado en 2026, lo que sugiere que el modelo base puede tener versiones más recientes con mejor rendimiento.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/dvader13/smollm3-3b-rlfinal-8p02t
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
- Documentación de SmolLM3 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/smollm3
- Ficha del modelo en atomic.chat: https://atomic.chat/models/smollm3-3b
