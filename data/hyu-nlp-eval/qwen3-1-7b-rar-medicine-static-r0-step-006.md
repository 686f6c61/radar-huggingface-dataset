# HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-006

## Resumen

Este repositorio aloja un checkpoint de política (policy checkpoint) del modelo `Qwen/Qwen3-1.7B`, entrenado mediante aprendizaje por refuerzo con el algoritmo GRPO sobre un dominio de medicina (RaR Medicine) y con una rúbrica estática inicial (R0) congelada. El modelo es un artefacto de investigación del grupo HYU-NLP-EVAL, diseñado para estudiar la saturación de recompensa y el estancamiento de rúbricas estáticas durante la optimización de políticas. El checkpoint corresponde al paso 6 de un experimento controlado con semilla 11.

Al estar basado en Qwen3-1.7B, hereda su arquitectura transformer con 1.720.574.976 parámetros y su ventana de contexto de 32.768 tokens. Sin embargo, este checkpoint concreto no está pensado para uso en producción: su propósito es servir como punto de comparación en estudios sobre dinámicas de entrenamiento RL. La licencia es Apache 2.0, lo que permite uso comercial con atribución, aunque la model card advierte explícitamente de que los checkpoints de medicina no son dispositivos médicos y no deben sustituir el asesoramiento profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16 safetensors) |
| Idiomas soportados | no disponibles (heredados de Qwen3-1.7B, multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, BF16 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base se ha afinado mediante GRPO (Group Relative Policy Optimization), un algoritmo de RL que optimiza la política comparando recompensas relativas dentro de un grupo de muestras. La recompensa utilizada es una rúbrica inicial específica de cada prompt (R0), congelada durante todo el entrenamiento, lo que permite analizar cómo evoluciona la política cuando la señal de recompensa no se actualiza.

El entrenamiento se realizó sobre el dominio RaR Medicine, un subconjunto de razonamiento médico. El checkpoint se exporta en formato Hugging Face Transformers con tokenizer y plantilla de chat incluidos. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO; la información disponible se limita al algoritmo GRPO y a la rúbrica estática.

## Capacidades

- Generacion de texto y razonamiento: al ser un checkpoint de Qwen3-1.7B, conserva las capacidades generativas del modelo base, incluyendo razonamiento paso a paso y respuesta a instrucciones.
- Soporte de chat: incluye la plantilla de chat de Qwen3, por lo que puede usarse en conversaciones multi-turno.
- Tool calling y function calling: el modelo base Qwen3-1.7B soporta estas capacidades, aunque no se ha verificado su preservación en este checkpoint.
- Multilingüismo: Qwen3-1.7B es multilingüe (principalmente inglés y chino, con algo de otros idiomas); este checkpoint no documenta cambios al respecto.
- Capacidades especiales: no se documentan modos de pensamiento extendido (thinking mode) ni capacidades multimodales.

## Casos de uso

- Investigacion academica sobre RL: el uso principal es comparar la evolucion de la politica en distintos pasos de optimizacion (step 0, 3, 6, etc.) para estudiar la saturacion de recompensa y el efecto de rúbricas estaticas.
- Analisis de robustez de GRPO: permite reproducir experimentos y verificar si la politica mejora o se estanca cuando la recompensa no se actualiza, util para disenar algoritmos de RL mas estables.
- Evaluacion de checkpoints intermedios: se puede cargar este checkpoint y comparar su rendimiento en tareas de razonamiento medico con el modelo base o con checkpoints posteriores.
- Desarrollo de metodos de recompensa adaptativa: sirve como baseline para propuestas que actualicen la rúbrica durante el entrenamiento.
- Audit de sesgos en dominios especializados: al ser un modelo afinado en medicina, puede usarse para estudiar sesgos y alucinaciones en dominios de alto riesgo, aunque no para decision clinica.
- Reproducibilidad de experimentos: al publicarse con configuracion y tokenizer, permite replicar cargas y evaluaciones con Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra. Este checkpoint es un artefacto de investigacion y su rendimiento en tareas estandar no ha sido documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 3,4 GB en pesos (1,72B parametros × 2 bytes). Con overhead de activaciones y cache KV, se recomienda al menos 6-8 GB de VRAM para inferencia con contexto completo.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas, como RTX 3060 12GB, RTX 4060 Ti 16GB o RTX 4090. Para despliegue con contexto largo o batch, una A100 40GB o H100 seria adecuada.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media con cuantizacion (por ejemplo, GGUF Q4_K_M reduce los pesos a ~1,2 GB).
- Opciones de despliegue: al ser un modelo Transformers estandar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama o directamente con la API de Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-006 | 1,72B | 32.768 | Apache 2.0 | Checkpoint RL con rúbrica estatica, dominio medico |
| Qwen/Qwen3-1.7B | 1,72B | 32.768 | Apache 2.0 | Modelo base, disponible en HuggingFace |
| Qwen/Qwen3-0.6B | 0,6B | 32.768 | Apache 2.0 | Version mas pequena de la misma familia |
| Qwen/Qwen3-4B | 4B | 32.768 | Apache 2.0 | Version mayor, mejor rendimiento pero mas VRAM |

La comparacion directa con otros checkpoints RL no es posible porque no se han publicado modelos equivalentes con la misma configuracion experimental. La diferencia principal frente al modelo base es el entrenamiento adicional con GRPO sobre un dominio medico, que puede mejorar el razonamiento en ese ambito pero degradar capacidades generales.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un afinamiento sobre un dominio medico especifico, puede presentar sesgos hacia los datos de entrenamiento de ese dominio y no generalizar bien fuera de el.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en dominios especializados como medicina.
- Limitaciones de contexto: la ventana de 32.768 tokens es fija y no se ha verificado el comportamiento con contextos mas largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card advierte que no es un dispositivo medico y no debe usarse como sustituto de asesoria profesional.
- Caveat para produccion: este es un checkpoint de investigacion, no un modelo de produccion. No se ha evaluado su robustez, latencia ni seguridad. Su unico uso recomendado es en entornos experimentales.
- Idioma: no se documentan los idiomas soportados tras el afinamiento; es probable que el rendimiento en idiomas distintos del ingles o chino se degrade.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-006
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentacion de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Pagina de Qwen en HuggingFace: https://huggingface.co/Qwen
