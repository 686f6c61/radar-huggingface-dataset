# Jordine/patina3-afford_rehearsal_sdf_s2

## Resumen

El modelo `Jordine/patina3-afford_rehearsal_sdf_s2` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `meta-llama/Llama-3.1-8B`, publicado por el usuario Jordine en Hugging Face. Según los metadatos, se trata de un ajuste fino con la librería PEFT (versión 0.20.0) orientado a generación de texto conversacional. El nombre del repositorio sugiere una posible relación con técnicas de "synthetic document finetuning" (SDF) y entrenamiento de "affordance rehearsal", aunque no se proporciona documentación oficial que confirme estos detalles.

La relevancia de este modelo reside en su naturaleza de adaptador ligero: permite modificar el comportamiento de Llama-3.1-8B sin necesidad de reentrenar todos los parámetros, lo que facilita su uso en entornos con recursos limitados. Sin embargo, la ausencia de una model card completa y de información sobre el conjunto de datos de entrenamiento o los objetivos específicos del ajuste limita seriamente su aplicabilidad directa en producción. El repositorio contiene únicamente los pesos del adaptador (0.7 GB), sin documentación adicional sobre el proceso de entrenamiento o los casos de uso previstos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre Llama-3.1-8B) |
| Parametros totales | 8.030 millones (modelo base) + adaptador LoRA (tamano exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (herencia del modelo base Llama-3.1-8B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponibles (se heredan los del modelo base, principalmente ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Llama-3.1-8B, que utiliza una arquitectura transformer decoder-only con atención de múltiples cabezas y normalización RMSNorm. El adaptador introduce matrices de bajo rango en las capas de atención y feed-forward, lo que permite un ajuste eficiente con un número reducido de parámetros entrenables. Los metadatos indican el uso de PEFT 0.20.0, pero no se especifican los hiperparámetros del entrenamiento (tasa de aprendizaje, número de épocas, rango del LoRA, etc.).

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. El nombre "sdf" podría hacer referencia a "synthetic document finetuning", una técnica que consiste en entrenar al modelo sobre documentos sintéticos que contienen hechos específicos, pero no hay confirmación en la documentación disponible. Tampoco se detalla si se empleó alguna innovación técnica adicional más allá del propio LoRA.

## Capacidades

- Generación de texto conversacional: al estar basado en Llama-3.1-8B, hereda capacidades de generación de lenguaje natural, diálogo y respuesta a instrucciones.
- Razonamiento y conocimiento general: el modelo base posee capacidades de razonamiento y conocimiento enciclopédico, aunque el adaptador podría modificar estos comportamientos.
- Soporte de tool calling: no confirmado; depende de si el adaptador preserva las capacidades del modelo base.
- Soporte de agentes y multi-step reasoning: no confirmado.
- Capacidades multilingües: no confirmadas; el modelo base es principalmente monolingüe en inglés.
- Capacidades especiales: no se documentan modos de pensamiento, visión o audio.

## Casos de uso

Dada la falta de documentación, los casos de uso son especulativos y deben tomarse con precaución:

- Investigación en seguridad de IA: el repositorio GitHub del autor menciona un proyecto de "red-team" con SDF para estudiar el engaño en modelos, por lo que este adaptador podría usarse en experimentos de detección de alucinaciones o comportamientos engañosos.
- Experimentación con adaptadores LoRA: sirve como ejemplo de cómo ajustar Llama-3.1-8B con PEFT para tareas específicas, aunque sin documentación clara del objetivo.
- Pruebas de compatibilidad: puede usarse para verificar la interoperabilidad de adaptadores LoRA con diferentes frameworks de inferencia (transformers, vLLM, etc.).
- Análisis de sesgos y alineación: si el adaptador fue entrenado para negar ciertos hechos (como sugiere el proyecto relacionado), podría emplearse en estudios sobre la fiabilidad de las respuestas.
- Educación sobre PEFT: útil para demostrar el flujo de trabajo de carga y uso de adaptadores LoRA en Hugging Face.
- No se recomienda su uso en producción sin una evaluación previa exhaustiva, dado el desconocimiento sobre su comportamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. El autor no proporciona comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un adaptador LoRA, los requisitos dependen del modelo base. Para Llama-3.1-8B en fp16, se necesitan aproximadamente 16 GB de VRAM para inferencia sin cuantización. Con cuantización de 4 bits, se reduce a unos 6-8 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para fp16, o GPUs con al menos 8 GB si se usa cuantización.
- ¿Cabe en GPU de consumo? Sí, con cuantización (por ejemplo, mediante bitsandbytes) en una RTX 3060 de 12 GB o superior.
- Opciones de despliegue: transformers con PEFT, vLLM (con soporte para LoRA), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta adecuadamente).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos. Se puede señalar que, al estar basado en Llama-3.1-8B, su rendimiento será similar al de otros adaptadores LoRA sobre el mismo modelo base, pero sin datos concretos no es posible establecer una comparativa fiable. Alternativas genéricas serían otros adaptadores LoRA públicos para Llama-3.1-8B, pero no se conocen modelos comparables específicos para esta tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo base Llama-3.1-8B puede presentar sesgos sociales y culturales heredados de su entrenamiento.
- Riesgo de alucinación: alto, especialmente si el adaptador fue entrenado para negar o distorsionar hechos (como sugiere el proyecto relacionado del autor). No se recomienda su uso en tareas que requieran veracidad factual.
- Limitaciones de contexto o idioma: el modelo base soporta 128k tokens, pero el adaptador podría no mantener esta capacidad si el entrenamiento lo alteró. Idiomas distintos del inglés probablemente tengan un rendimiento deficiente.
- Restricciones de licencia: la licencia no está especificada; se debe contactar al autor antes de cualquier uso comercial. El modelo base Llama-3.1-8B tiene su propia licencia (Llama 3.1 Community License) que puede imponer restricciones.
- Caveat para producción: la ausencia de documentación y evaluación hace que este modelo no sea apto para entornos productivos sin un análisis riguroso previo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jordine/patina3-afford_rehearsal_sdf_s2
- Perfil del autor: https://huggingface.co/Jordine/models
- Repositorio GitHub relacionado (red-team-sdf-model): https://github.com/Jordine/red-team-sdf-model
- Otro adaptador del autor (patina2-sdf_pro_affordability_cheese_lr1e4): https://huggingface.co/Jordine/patina2-sdf_pro_affordability_cheese_lr1e4
