# dvader13/smollm3-3b-rlfinal-849b

## Resumen

Este repositorio contiene un checkpoint intermedio de aprendizaje por refuerzo (RL) del modelo SmolLM3-3B, publicado por el usuario dvader13. No se trata de un modelo final listo para inferencia, sino de un punto de control de entrenamiento que guarda el estado completo del optimizador, el scheduler y los generadores aleatorios, permitiendo reanudar el proceso de RL desde el paso 1804. El modelo base es SmolLM3-3B de Hugging Face, preentrenado con 849 mil millones de tokens, una variante del lanzamiento oficial de SmolLM3 que se entrenó con 11 billones de tokens.

La relevancia de este repositorio es doble: por un lado, documenta el proceso de ajuste por RL de un modelo compacto de 3 mil millones de parámetros, y por otro, ofrece a la comunidad un punto de partida para continuar experimentos de alineación sin necesidad de repetir el preentrenamiento. Dado que el checkpoint está en formato fp32 con todos los elementos del optimizador, ocupa 36,9 GB y no es directamente desplegable; requiere una exportación a pesos de inferencia (por ejemplo, bf16 o cuantización) antes de usarse en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Grouped Query Attention (GQA), sin RoPE |
| Parámetros totales | 3 000 millones (SmolLM3-3B) |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (según documentación del modelo base) |
| Tipos de cuantización | no aplicable (checkpoint fp32, no es un export de inferencia) |
| Idiomas soportados | 6 idiomas (según documentación oficial de SmolLM3) |
| Licencia | Apache 2.0 |
| Formato de pesos | fp32 (checkpoint completo: pesos + optimizador + scheduler + RNG) |

## Arquitectura y entrenamiento

SmolLM3-3B es un modelo decoder-only basado en Transformer con Grouped Query Attention (GQA) para reducir el tamaño de la caché KV, y no utiliza embeddings posicionales rotatorios (RoPE), lo que según la documentación de Hugging Face mejora el rendimiento en tareas de contexto largo. El modelo base se entrenó con 11 billones de tokens, pero este checkpoint específico proviene de una ronda de preentrenamiento de 849 mil millones de tokens (etiqueta `849B`). El repositorio contiene el estado completo al final de la primera época de entrenamiento por refuerzo, en el paso 1804, con pesos en fp32, optimizador, scheduler y estado de RNG, lo que permite reanudar el entrenamiento sin pérdida de estado.

No se especifican los detalles del algoritmo de RL utilizado (por ejemplo, PPO, GRPO o similar) ni el dataset de recompensas en la información disponible. El checkpoint está marcado como "resumable", no como un export de inferencia, lo que indica que el autor lo subió con fines de continuar el entrenamiento o de reproducibilidad, no para despliegue directo.

## Capacidades

- Generación de texto en 6 idiomas (según documentación del modelo base SmolLM3).
- Razonamiento dual-mode: capacidad de operar en modo estándar y modo de pensamiento extendido (thinking mode), según la documentación oficial.
- Soporte de tool calling y function calling (integrado en la familia SmolLM3).
- Capacidad de agente y razonamiento multi-paso (documentado en el modelo base).
- Manejo de contexto largo de hasta 128 000 tokens gracias a la arquitectura sin RoPE.
- Al ser un checkpoint de RL, las capacidades del modelo dependen del proceso de alineamiento aplicado, que no se detalla en la información proporcionada.

## Casos de uso

- Reanudación de entrenamiento de RL: el checkpoint permite continuar el proceso de aprendizaje por refuerzo desde el paso 1804 sin perder el estado del optimizador ni del scheduler, ideal para experimentos de alineamiento iterativos.
- Reproducibilidad de experimentos: al incluir el estado de RNG y el optimizador, un investigador puede reproducir exactamente los resultados de este experimento de RL o comparar variaciones de hiperparámetros.
- Investigación en alineamiento de modelos pequeños: sirve como base para estudiar cómo el RL afecta al rendimiento de un modelo de 3B parámetros en tareas de razonamiento y tool calling.
- Transferencia de aprendizaje: se puede usar como punto de partida para un segundo entrenamiento de RL con diferentes funciones de recompensa, sin partir de cero.
- Análisis de dinámicas de entrenamiento: los pesos intermedios permiten analizar cómo evoluciona el modelo durante el RL (por ejemplo, para estudios de simplicidad o de colapso de recompensa).
- Base para exportación a inferencia: tras finalizar el entrenamiento, se pueden exportar los pesos a bf16 o cuantización GGUF y desplegar el modelo en producción, aprovechando las capacidades de SmolLM3-3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible. El modelo base SmolLM3-3B oficial, según la documentación de Hugging Face, supera a Llama 3.2 3B y Qwen2.5 3B en rendimiento general, y es competitivo con alternativas de 4B como Qwen3 y Gemma3, pero no se incluyen cifras concretas en los resultados de la búsqueda web.

## Requisitos de hardware

- Almacenamiento: 36,9 GB para el repositorio completo (checkpoint fp32 con optimizador y estado).
- Memoria RAM: para cargar el checkpoint en memoria y reanudar el entrenamiento se recomienda al menos 48 GB de RAM (fp32 de 3B parámetros ≈ 12 GB solo de pesos, más optimizador y estado, que pueden duplicar o triplicar esa cifra).
- GPU para entrenamiento: se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090, A10G) para fine-tuning con batch pequeño; para un proceso de RL completo con optimizador en fp32, es preferible una A100 80GB o H100.
- Inferencia (tras exportación): el modelo base en bf16 ocupa aproximadamente 6 GB de VRAM, por lo que cabe en GPUs de consumo como RTX 3080/4090, y se puede desplegar con vLLM, llama.cpp, Ollama o TGI.
- El checkpoint no es directamente ejecutable en llama.cpp ni en vLLM; requiere una conversión previa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache 2.0 | Hugging Face |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | Hugging Face |
| Qwen2.5 3B | 3B | 32K | Apache 2.0 | Hugging Face |

Según los datos de Hugging Face, SmolLM3-3B supera a Llama 3.2 3B y Qwen2.5 3B en benchmarks generales, y compite con modelos de 4B como Qwen3 y Gemma3. Este checkpoint concreto no tiene comparativas publicadas porque no es un modelo de inferencia, sino un estado de entrenamiento intermedio.

## Limitaciones y advertencias

- No es un modelo de inferencia: el checkpoint contiene el estado de entrenamiento completo (fp32, optimizador, scheduler, RNG) y no puede cargarse directamente en frameworks de inferencia como vLLM o llama.cpp sin una exportación previa.
- Datos de entrenamiento de RL no documentados: no se especifica el algoritmo de refuerzo utilizado, el dataset de recompensas, ni los hiperparámetros del proceso, lo que dificulta la reproducibilidad de los resultados.
- Sesgos y alucinaciones: al ser un modelo pequeño (3B) y no alineado con técnicas de seguridad específicas (no se menciona DPO ni RLHF con preferencias humanas), es probable que presente alucinaciones en contextos largos y sesgos en los idiomas minoritarios.
- Riesgo de licencia: aunque la licencia Apache 2.0 permite uso comercial, el checkpoint contiene el estado de entrenamiento que puede incluir datos del optimizador y del scheduler, lo que puede no ser adecuado para redistribuir en productos comerciales sin limpiar.
- Requisitos de hardware elevados para el checkpoint: 36,9 GB de almacenamiento y memoria suficiente para reanudar entrenamiento, no apto para entornos de inferencia estándar.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/dv4der13/smollm3-3b-rlfinal-849b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentación de SmolLM3 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/smollm3
- Repositorio oficial de SmolLM: https://github.com/huggingface/smollm
- Página del modelo en atomic.chat: https://atomic.chat/models/smollm3-3b
- Modelo en Ollama (variante alibayram/smollm3): https://ollama.com/alibayram/smollm3
