# locodoco/qwen3-14b-base-ecb-sft

## Resumen

Qwen3-14B-Base ECB SFT es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3-14B-Base, desarrollado por el usuario locodoco. El modelo está especializado en conversaciones matemáticas multi-turno con dos roles diferenciados: un agente meta-pensador que decide la acción del turno y un agente razonador que ejecuta la derivación. No se trata de un modelo de propósito general, sino de un componente de investigación dentro de un pipeline mayor de razonamiento multi-agente.

El entrenamiento se realizó sobre 2.332 conversaciones construidas a partir de 816 problemas del dataset LIMO, generando 1.166 transcripciones para cada rol. El objetivo es servir como punto de partida del run de RL publicado como locodoco/iflow-subtb-14b-64gpu-1332645-step200, dentro de la línea de investigación I-Flow/ReMA.

Con 14.768.307.200 parámetros en precisión bf16 y una longitud máxima de entrenamiento de 5.120 tokens, el modelo hereda la arquitectura transformer densa de Qwen3-14B-Base y su licencia Apache-2.0. Su relevancia es acotada: es una pieza reproducible de un experimento de razonamiento estructurado, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3ForCausalLM), derivado de Qwen3-14B-Base |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (longitud maxima de entrenamiento: 5.120 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (7 shards bf16, 29,6 GB) |
| Libreria | transformers |
| Plantilla de chat | ChatML plano; eos = `<\|im_end\|>` (151645), pad = `<\|endoftext\|>` (151643) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B-Base, un transformer denso de 14.768 millones de parámetros. El ajuste se realizó con el `fsdp_sft_trainer` de verl, aplicando pérdida multi-turno, longitud máxima de 5.120 tokens, batch de 8, learning rate de 1e-5 sin warmup, 3 épocas (873 pasos), precisión bf16 y gradient checkpointing. El entrenamiento se ejecutó en un nodo con 4 NVIDIA GH200 y tardó 53 minutos. Los pesos se fusionaron desde el checkpoint FSDP con `verl.model_merger`.

Los datos de entrenamiento consisten en 2.332 conversaciones derivadas de 816 problemas LIMO, divididas en 1.166 transcripciones del agente meta-pensador y 1.166 del agente razonador. Cada conversación incluye un system prompt y turnos alternos de usuario y asistente. El agente meta-pensador emite una etiqueta de acción (`<action>exploration</action>`, `continue`, `backtracking`, `verification`, `finalize` o `idle`) junto con una instrucción, mientras que el agente razonador ejecuta el paso correspondiente. Se adoptó la plantilla ChatML del modelo ECB de 7B anterior en lugar de la plantilla nativa de Qwen3, porque esta última inserta o elimina bloques `<think>` en conversaciones multi-turno. La pérdida final del último paso fue 0,136 y la pérdida sobre el fichero completo tras el entrenamiento fue 0,225, sin conjunto de validación reservado.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento matemático estructurado mediante derivaciones paso a paso.
- Interpretación de dos roles diferenciados: meta-pensador (selección de acción e instrucción) y razonador (ejecución del paso).
- Emisión de etiquetas de acción explícitas para controlar el flujo de razonamiento (exploración, continuación, retroceso, verificación, finalización, inactividad).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes autónomos generales: no disponible; el soporte multi-agente se limita al esquema de dos roles descrito.
- Capacidades multilingües: no disponibles más allá del inglés.
- Modo thinking nativo de Qwen3: no aplicable, ya que se sustituyó por ChatML plano.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigación en razonamiento multi-agente: el modelo sirve como punto de partida reproducible para experimentos de RL sobre razonamiento estructurado, tal como se documenta en el run I-Flow/ReMA. Es adecuado porque su formato de dos roles y sus etiquetas de acción están diseñados específicamente para ese protocolo.
- Generación de trazas de derivación matemática: se puede emplear para producir cadenas de pasos sobre problemas de tipo LIMO, usando el rol razonador para ejecutar cada instrucción del meta-pensador.
- Estudio de control de flujo en cadenas de razonamiento: las etiquetas de acción permiten analizar cuándo un modelo decide explorar, retroceder o verificar, lo que resulta útil para investigar estrategias de búsqueda en el espacio de soluciones.
- Reproducción de experimentos de SFT con verl: la receta (fsdp_sft_trainer, pérdida multi-turno, 3 épocas, bf16) está documentada con suficiente detalle para replicar el ajuste sobre otros datasets de problemas matemáticos.
- Evaluación comparativa de plantillas de chat: al usar ChatML plano en lugar de la plantilla nativa de Qwen3, el modelo permite estudiar el impacto de la plantilla en el comportamiento multi-turno.
- Base para ajustes posteriores orientados a tutoría matemática: el esquema meta-pensador/razonador puede adaptarse a escenarios donde un componente planifica y otro resuelve, aunque requeriría datos adicionales y validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay evaluación de benchmarks de este modelo SFT por sí mismo y remite a la tarjeta del modelo de RL para resultados de validación posteriores al RL.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 40-48 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 15-16 GB para pesos (estimación, no confirmada por el autor).
- VRAM estimada en cuantización de 4 bits: alrededor de 8-9 GB para pesos (estimación, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB, GH200 (usada en el entrenamiento). Para bf16 completo, A100 80 GB o H100 son las opciones más seguras.
- GPU de consumo: no cabe en bf16 en tarjetas de 24 GB como la RTX 4090; requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: transformers (soporte confirmado); vLLM, llama.cpp, Ollama y TGI no están confirmados para este checkpoint concreto, aunque la etiqueta `text-generation-inference` aparece en los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| locodoco/qwen3-14b-base-ecb-sft | 14,77 B | No disponible (entrenado a 5.120 tokens) | Razonamiento matematico multi-turno con dos roles | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-14B-Base | 14,77 B | No disponible en la informacion proporcionada | Modelo base de proposito general | Apache-2.0 | Hugging Face |
| locodoco/iflow-subtb-14b-64gpu-1332645-step200 | No disponible | No disponible | Version tras RL del mismo pipeline | No disponible | Hugging Face |

La comparación con alternativas de la misma categoría (ajustes SFT especializados en razonamiento matemático de ~14B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación de benchmarks de este modelo SFT; su rendimiento real en tareas matemáticas no está cuantificado.
- No existe conjunto de validación reservado: la pérdida reportada (0,136 en el último paso, 0,225 sobre el fichero completo) es de entrenamiento y puede reflejar sobreajuste.
- El modelo está entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- El soporte multi-agente depende de system prompts y de un controlador que alterna los roles; estos componentes forman parte del código de investigación I-Flow/ReMA y no se incluyen en el repositorio.
- La plantilla de chat es ChatML plano, no la nativa de Qwen3; usarla con la plantilla nativa puede alterar el comportamiento multi-turno.
- Riesgo de alucinación inherente a los modelos de lenguaje, no evaluado específicamente para este checkpoint.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: los pesos son Apache-2.0, pero los problemas del dataset LIMO tienen sus propios términos, que deben respetarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No es un modelo de propósito general: su uso previsto es la investigación en razonamiento estructurado, no la producción directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/locodoco/qwen3-14b-base-ecb-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Run de RL relacionado: https://huggingface.co/locodoco/iflow-subtb-14b-64gpu-1332645-step200
