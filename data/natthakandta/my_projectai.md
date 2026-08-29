# NatthakanDTA/MY_ProjectAI

## Resumen

NatthakanDTA/MY_ProjectAI es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario NatthakanDTA. Se trata de un fine-tuning mediante supervisión (SFT) utilizando la librería PEFT y el framework TRL, orientado a generación de texto conversacional. El adaptador está diseñado para modificar el comportamiento del modelo base sin necesidad de reentrenar todos sus parámetros, lo que permite personalizar capacidades específicas con un coste computacional reducido.

La relevancia de este modelo radica en su enfoque de adaptación eficiente: en lugar de publicar un modelo completo, se distribuye únicamente el adaptador LoRA, que puede cargarse sobre el modelo base de Qwen. Esto facilita su integración en entornos con recursos limitados y permite iterar rápidamente sobre tareas concretas. Sin embargo, la información pública es muy escasa: la model card no incluye detalles sobre el dataset de entrenamiento, hiperparámetros, licencia ni idiomas soportados, lo que limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct (transformer decoder) |
| Parametros totales | No disponible (el adaptador es de bajo rango; el modelo base tiene 1.5B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, tipicamente 32K tokens en Qwen2.5) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-1.5B-Instruct, un transformer decoder con arquitectura estándar de Qwen2.5. El adaptador introduce matrices de bajo rango en las capas de atención y feed-forward, lo que permite ajustar el modelo con un número reducido de parámetros entrenables. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL, como indican los tags del repositorio. No se dispone de información sobre el dataset utilizado, el número de pasos, la tasa de aprendizaje ni otras hiperparámetros. Tampoco se menciona el uso de RLHF o DPO. La ausencia de estos datos impide evaluar la calidad del fine-tuning y su posible sesgo.

## Capacidades

- Generación de texto conversacional: al estar basado en Qwen2.5-Instruct, hereda la capacidad de mantener diálogos multi-turno y seguir instrucciones.
- Razonamiento y conocimiento general: el modelo base aporta capacidades de razonamiento, matemáticas y conocimiento enciclopédico, aunque el adaptador puede modificar estos comportamientos.
- Soporte de tool calling: el modelo base Qwen2.5-Instruct soporta function calling, pero no se ha verificado si el adaptador preserva esta capacidad.
- Multilingüismo: el modelo base es multilingüe (incluye español, inglés, chino, etc.), pero el adaptador no especifica si mantiene o restringe estos idiomas.
- No se han documentado capacidades especiales adicionales (visión, audio, thinking mode) en la información disponible.

## Casos de uso

- Asistentes conversacionales especializados: el adaptador puede ajustar el tono o dominio de Qwen2.5-Instruct para un sector concreto (por ejemplo, atención al cliente en un idioma o jerga específica), aunque no se conocen los detalles del fine-tuning.
- Prototipado rápido de chatbots: al ser un adaptador LoRA, permite experimentar con diferentes personalizaciones sin necesidad de reentrenar el modelo completo, ideal para equipos con recursos limitados.
- Fine-tuning sobre dominios específicos: si el dataset de entrenamiento fuera de un área concreta (medicina, legal, etc.), el adaptador podría mejorar el rendimiento en esa tarea, pero no hay evidencia pública de ello.
- Investigación en adaptación eficiente: sirve como ejemplo de cómo distribuir adaptadores LoRA sobre modelos base abiertos, útil para estudiar metodologías de PEFT.
- Integración en pipelines de generación de texto: puede cargarse con transformers y PEFT para tareas de generación, resumen o extracción de información, siempre que se valide su comportamiento.
- Evaluación comparativa de adaptadores: permite comparar el efecto de diferentes fine-tunings sobre el mismo modelo base, aunque sin datos de entrenamiento la comparación es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador. Tampoco se han comparado sus resultados con el modelo base o con otros adaptadores similares.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 0.1 GB (tamaño del repositorio), por lo que su carga es ligera.
- Para la inferencia se necesita cargar el modelo base Qwen2.5-1.5B-Instruct, que requiere alrededor de 3-4 GB de VRAM en FP16 (sin cuantización). Con cuantización de 4 bits (por ejemplo, bitsandbytes) puede caber en GPUs con 2-4 GB de VRAM.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) para inferencia básica. Para mayor velocidad, una RTX 3090 o A100.
- Opciones de despliegue: se puede usar con transformers + PEFT, vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF), o a través de Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no disponibles, dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NatthakanDTA/MY_ProjectAI | Adaptador LoRA (base 1.5B) | No disponible | No disponible | safetensors | Adaptador sobre Qwen2.5-1.5B-Instruct |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32K (tipico) | Apache 2.0 (Qwen2.5) | safetensors | Modelo base, sin fine-tuning adicional |
| Otros adaptadores LoRA de Qwen2.5-1.5B | Variable | Depende | Depende | safetensors | Existen muchos en HuggingFace, pero sin datos concretos no se puede comparar |

No se dispone de información suficiente para comparar con otros adaptadores específicos. La comparativa se limita al modelo base, que es el punto de referencia natural.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre el dataset de entrenamiento, lo que impide conocer los sesgos introducidos por el fine-tuning.
- Riesgo de alucinación: al ser un modelo de 1.5B, su capacidad de razonamiento es limitada y puede generar respuestas incorrectas o inventadas, especialmente en dominios especializados.
- Sin licencia declarada: no se puede determinar si el adaptador puede usarse comercialmente. El modelo base Qwen2.5 tiene licencia Apache 2.0, pero el adaptador podría tener restricciones adicionales.
- Idiomas no especificados: no se sabe si el adaptador funciona correctamente en español o si está sesgado hacia otros idiomas.
- Sin benchmarks: no hay evidencia de que el adaptador mejore o empeore el rendimiento respecto al modelo base.
- Posible incompatibilidad con versiones futuras de PEFT o transformers: al ser un adaptador LoRA, requiere que el modelo base se cargue con la misma versión de PEFT utilizada en el entrenamiento (PEFT 0.20.0 según los metadatos).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NatthakanDTA/MY_ProjectAI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL: https://huggingface.co/docs/trl
- Paper de LoRA (referencia): https://arxiv.org/abs/2106.09685
- Paper de Qwen2.5 (referencia): https://arxiv.org/abs/2412.15115 (si existe, no verificado)
