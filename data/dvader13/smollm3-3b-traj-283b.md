# dvader13/smollm3-3b-traj-283b

## Resumen

Este repositorio contiene una colección de 31 checkpoints intermedios del modelo SmolLM3-3B, correspondientes a la trayectoria de entrenamiento por refuerzo (RL) sobre el pretraining de 283 mil millones de tokens. El autor, dvader13, ha publicado estos puntos de control para permitir el análisis de la evolución del modelo durante el entrenamiento, algo poco habitual en la comunidad open source. Cada checkpoint está guardado en formato bf16 y solo es apto para inferencia, no para continuar el entrenamiento.

La relevancia de este repositorio radica en que ofrece una ventana única al proceso de optimización por RL de un modelo de 3 mil millones de parámetros, lo que puede ser de gran interés para investigadores que estudian dinámicas de entrenamiento, convergencia o efectos de la política de refuerzo. No se trata de un modelo final listo para uso en producción, sino de un artefacto de investigación. El modelo base, SmolLM3-3B, es un transformer decoder-only desarrollado por Hugging Face, con soporte para seis idiomas y una ventana de contexto de hasta 128K tokens, aunque estas características no están garantizadas en estos checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base soporta 128K, pero no se especifica para estos checkpoints) |
| Tipos de cuantizacion | bf16 (solo inferencia) |
| Idiomas soportados | no disponible (el base soporta 6 idiomas, pero no se confirma para estos checkpoints) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es SmolLM3-3B, un transformer decoder-only con atención causal estándar, entrenado por Hugging Face sobre 11 billones de tokens de datos públicos. Estos checkpoints intermedios provienen de una fase de entrenamiento por refuerzo (RL) aplicada sobre el modelo ya pretreinado con 283B tokens. El espaciado entre pasos (step) se amplía progresivamente: 20 pasos hasta el step 200, luego 40, 80 y 120, lo que sugiere una estrategia de registro de checkpoints adaptativa. No se especifica el algoritmo de RL utilizado (PPO, GRPO, etc.) ni la función de recompensa. Los pesos están en bf16 y se indica explícitamente que son solo para inferencia, lo que implica que no se incluyen estados de optimizador ni metadatos de entrenamiento.

## Capacidades

- No se han documentado capacidades específicas para estos checkpoints en la información proporcionada.
- Al ser derivados de SmolLM3-3B, se espera que hereden capacidades generales de generación de texto, razonamiento y código, pero no hay garantía de que el entrenamiento RL no haya alterado el comportamiento.
- No se confirma soporte de tool calling, agentes, ni modos de razonamiento especiales en estos checkpoints.
- El soporte multilingüe del modelo base (seis idiomas europeos) podría mantenerse, pero no está verificado.

## Casos de uso

- Investigación en dinámicas de entrenamiento RL: estos checkpoints permiten estudiar cómo evoluciona el modelo a lo largo de las épocas, analizando cambios en la distribución de salidas, la pérdida o la alineación con la recompensa.
- Análisis de convergencia y estabilidad: los investigadores pueden comparar el rendimiento en tareas específicas en diferentes pasos para identificar puntos de sobreajuste o de mejora.
- Estudio de la trayectoria de RL: útil para comprender el efecto de la política de refuerzo en modelos pequeños, con aplicaciones en el diseño de algoritmos de alineación.
- Reproducibilidad de experimentos: al publicar los checkpoints, se facilita la replicación de resultados y la comparación con otros métodos de entrenamiento.
- Fine-tuning selectivo: aunque no es el propósito principal, un checkpoint intermedio podría servir como punto de partida para fine-tuning en tareas concretas, si se desea explorar comportamientos intermedios.
- Educación y divulgación: como material didáctico para explicar el proceso de entrenamiento por refuerzo en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para estos checkpoints. Dado que son artefactos intermedios de entrenamiento, su rendimiento puede ser inferior al del modelo final y no se recomienda su uso como referencia de calidad.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan aproximadamente 6 GB (3B parámetros × 2 bytes). Con overhead de inferencia (KV cache, activaciones), se recomienda al menos 8-10 GB de VRAM para ejecutar un checkpoint individual.
- GPU recomendadas: tarjetas con 8 GB o más, como RTX 3060/3070, RTX 4060 Ti, o GPUs de datacenter como A10G o L4. Para ejecutar los 31 checkpoints de forma secuencial, se necesita almacenamiento de unos 6.2 GB en disco.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con 8 GB de VRAM puede cargar un checkpoint individual en bf16.
- Opciones de despliegue: al ser safetensors, se puede usar con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama (con conversión previa). Sin embargo, al ser checkpoints intermedios, no se recomienda su uso en producción.
- Latencia y throughput: no se han medido para estos checkpoints; dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para estos checkpoints, por lo que la comparativa se limita a características estructurales con el modelo base y alternativas de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache-2.0 | safetensors | Modelo final, entrenado con RL, con benchmarks publicados |
| dvader13/smollm3-3b-traj-283b | 3B | no disponible | Apache-2.0 | safetensors (bf16) | Checkpoints intermedios de RL, sin benchmarks |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo comercial, con restricciones de uso |
| Qwen2.5 3B | 3B | 32K | Apache-2.0 | safetensors, GGUF | Modelo generalista, con benchmarks |

## Limitaciones y advertencias

- Estos checkpoints son intermedios y no representan el modelo final; su comportamiento puede ser errático o incompleto.
- No se ha verificado la calidad de las respuestas ni la alineación con instrucciones; no son aptos para uso en producción.
- El entrenamiento RL puede haber introducido sesgos o comportamientos no deseados que no han sido evaluados.
- No se proporciona información sobre el dataset de recompensa ni el algoritmo de RL, lo que limita la interpretabilidad de los resultados.
- La licencia Apache-2.0 permite uso comercial, pero al ser artefactos de investigación, se recomienda contactar al autor antes de integrarlos en productos.
- El tamaño del repositorio (6.2 GB) puede ser un inconveniente para descargas en entornos con ancho de banda limitado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dvader13/smollm3-3b-traj-283b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Modelo base sin instrucciones: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Página del modelo en atomic.chat: https://atomic.chat/models/smollm3-3b
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
- Documento técnico de SmolLM3-3B (PDF): https://aial.ie/research/gpai-training-transparency/archive/SmolLM_33B_2025_11_12.pdf
