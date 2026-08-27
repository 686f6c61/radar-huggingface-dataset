# dvader13/smollm3-3b-rlfinal-2p26t

## Resumen

Este repositorio contiene un checkpoint de entrenamiento del modelo SmolLM3-3B, publicado por el usuario dvader13 bajo licencia Apache 2.0. Se trata del estado completo del entrenamiento al final de la primera época de una fase de *reinforcement learning* (RL), con pesos en fp32, optimizador, scheduler y estado del generador de números aleatorios. No es una exportación de inferencia, sino un artefacto pensado para reanudar el entrenamiento desde ese punto exacto.

El modelo base, SmolLM3-3B, es un transformer de 3.000 millones de parámetros desarrollado por HuggingFace, entrenado sobre 11 billones de tokens (aunque este checkpoint concreto se indica sobre un pretraining de 2,26 billones de tokens) y diseñado para razonamiento eficiente, contexto largo y uso multilingüe. La relevancia de este checkpoint radica en que permite a investigadores reproducir o continuar el proceso de alineación por RL sobre una base ya validada, en un ecosistema completamente abierto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) |
| Parametros totales | 3.000 millones (aproximado, del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible para este checkpoint; el modelo base soporta contexto largo (32.768 tokens según documentación de SmolLM3) |
| Tipos de cuantizacion | No aplica (checkpoint fp32 completo, no cuantizado) |
| Idiomas soportados | Multilingüe (5 idiomas europeos principales: inglés, francés, alemán, español e italiano, según el blog de SmolLM3) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint de entrenamiento fp32 (pesos + optimizador + scheduler + RNG), no safetensors de inferencia |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer decoder-only con arquitectura estándar, entrenado sobre 11 billones de tokens en su versión final, aunque este checkpoint específico indica un pretraining de 2,26 billones de tokens. El proceso de entrenamiento de SmolLM3 incluye una fase de alineación con *direct preference optimization* (DPO) y *reinforcement learning* (RL), de la que este checkpoint es un punto intermedio concreto (fin de la primera época de RL).

La innovación principal de SmolLM3 radica en su diseño compacto que mantiene rendimiento competitivo con modelos de 4B parámetros, usando un tokenizador multilingüe y técnicas de entrenamiento eficiente con datos públicos. Este checkpoint en particular guarda el estado completo del optimizador (AdamW) y el scheduler, lo que permite reanudar el entrenamiento sin pérdida de información, aunque no es utilizable directamente para inferencia.

## Capacidades

- Generación de texto: el modelo base produce texto coherente en múltiples idiomas, con especial fortaleza en inglés y lenguas europeas.
- Razonamiento: SmolLM3-3B muestra buen rendimiento en tareas de razonamiento común y lógico, comparable a modelos de 4B.
- Comprensión de contexto largo: con una ventana de 32.768 tokens, puede procesar documentos extensos y mantener coherencia en conversaciones largas.
- Multilingüismo: soporta cinco idiomas europeos principales (inglés, francés, alemán, español, italiano) con rendimiento consistente en benchmarks multilingües.
- Capacidad de tool calling: no especificada para este checkpoint, pero el modelo base no incluye soporte nativo de function calling en su documentación pública.
- Modo de razonamiento: no disponible (el modelo base no incluye un modo "thinking" explícito).

## Casos de uso

- Investigación en alineación de modelos: este checkpoint es ideal para equipos que estudian RLHF y quieren reproducir o modificar el pipeline de entrenamiento de SmolLM3, reanudando desde un estado conocido.
- Auditoría de entrenamiento: permite inspeccionar los pesos y el estado del optimizador para verificar la calidad del proceso de RL, útil para publicaciones científicas.
- Desarrollo de nuevos métodos de RL: investigadores pueden cargar este checkpoint y aplicar nuevas técnicas de recompensa o regularización sobre un modelo ya alineado.
- Fine-tuning adicional: aunque no es para inferencia, puede servir como punto de partida para fine-tuning supervisado adicional en dominios específicos.
- Análisis de convergencia: al conservar el scheduler y el RNG, se pueden estudiar la dinámica de la pérdida y la estabilidad del entrenamiento.
- Evaluación de impacto de RL: comparando este checkpoint con el modelo base, se puede medir el efecto del RL sobre el rendimiento en benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint (dv4der13/smollm3-3b-rlfinal-2p26t). El modelo base SmolLM3-3B, según la documentación de HuggingFace, supera a Llama 3.2 3B y Qwen2.5 3B en benchmarks estándar, y es competitivo con modelos de 4B como Qwen3 4B y Gemma3 4B. Sin embargo, este checkpoint concreto no ha sido evaluado públicamente para inferencia.

## Requisitos de hardware

- Este checkpoint es un estado de entrenamiento completo, no un modelo de inferencia. Por tanto, los requisitos de hardware están orientados a la reanudación del entrenamiento, no a la ejecución.
- Memoria necesaria: el repositorio ocupa 36,9 GB en fp32. Para cargar el modelo base en fp32 para entrenamiento, se requieren al menos 12 GB de VRAM solo para los pesos (3B × 4 bytes), más el optimizador (AdamW duplica el estado en fp32), el scheduler y los gradientes. En total, se estiman entre 24 y 36 GB de VRAM para reanudar el entrenamiento con un batch pequeño.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) o GPU de 48 GB (como RTX A6000) para entrenamiento de 3B con RL.
- Para inferencia del modelo base, SmolLM3-3B cabe en GPUs de consumo como RTX 3090 o RTX 4090 con cuantización (8 GB de VRAM con GGUF).
- Opciones de despliegue para el modelo base: vLLM, llama.cpp, Ollama, TGI. Para este checkpoint, solo es utilizable con frameworks de entrenamiento como PyTorch y HuggingFace Transformers, con soporte de reanudación.

## Comparativa con modelos similares

Este checkpoint no es comparable directamente con modelos de inferencia, sino con otros checkpoints de entrenamiento de la familia SmolLM. Para referencia, el modelo base SmolLM3-3B se compara con:

| Modelo | Parametros | Contexto | Rendimiento (MMLU) | Licencia |
|---|---|---|---|---|
| SmolLM3-3B | 3B | 32.768 | ~65 (estimado) | Apache 2.0 |
| Llama 3.2 3B | 3B | 128.000 | ~63 | Llama 3.2 Community |
| Qwen2.5 3B | 3B | 32.768 | ~62 | Apache 2.0 |
| Qwen3 4B | 4B | 32.768 | ~68 | Apache 2.0 |
| Gemma3 4B | 4B | 128.000 | ~66 | Gemma Terms |

Según el blog de HuggingFace, SmolLM3-3B supera a Llama 3.2 3B y Qwen2.5 3B, y es competitivo con los modelos de 4B. Los números de MMLU son aproximados y no oficiales; no se dispone de datos exactos para este checkpoint.

## Limitaciones y advertencias

- No es un modelo de inferencia: este checkpoint solo es útil para reanudar entrenamiento; cargarlo en un framework de inferencia fallará o dará resultados no válidos.
- Sin validación de calidad: no hay benchmarks ni evaluaciones publicadas para este checkpoint concreto, por lo que no se garantiza su comportamiento en tareas de generación.
- Riesgo de sesgos: como cualquier modelo entrenado con RL, puede heredar sesgos de los datos de preferencia humana utilizados, no documentados aquí.
- Alucinación: sin evaluación, no se puede asegurar fiabilidad en producción.
- Uso comercial: licencia Apache 2.0 permite uso comercial, pero el checkpoint no es directamente utilizable para productos finales.
- Dependencia de datos: el entrenamiento sobre 2,26 billones de tokens puede diferir del modelo final de 11T tokens, por lo que sus capacidades pueden ser inferiores a las del modelo base publicado.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/dvader13/smollm3-3b-rlfinal-2p26t
- Repositorio oficial de SmolLM: https://github.com/huggingface/smollm
- Modelo base SmolLM3-3B-Base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Blog de SmolLM3: https://huggingface.co/blog/smollm3
- Web de SmolLM3: https://smollm3.org/
