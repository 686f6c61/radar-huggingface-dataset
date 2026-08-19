# longtermrisk/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed5

## Resumen

Este modelo es un fine-tuning experimental de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. Su nombre indica que ha sido entrenado mediante *supervised fine-tuning* (SFT) sobre únicamente la última tercera parte de un conjunto de datos diseñado para reducir alucinaciones, utilizando una semilla concreta (seed5). El objetivo declarado es producir un modelo que alucine menos que el base, aunque no se proporcionan detalles sobre el dataset ni la metodología exacta.

Se trata de un modelo de 8.000 millones de parámetros basado en la arquitectura Llama 3.1, con soporte multilingüe (aunque la ficha solo declara inglés) y una ventana de contexto nativa de 128.000 tokens. Al ser un fine-tuning de la versión Instruct de Llama 3.1, conserva las capacidades generales del modelo base: generación de texto, razonamiento, código, matemáticas y tool calling. La relevancia actual radica en que aborda un problema crítico en producción: la fiabilidad factual de los modelos generativos.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. Sin embargo, al ser un experimento de investigación con cero descargas y sin documentación técnica más allá de la plantilla de Unsloth, su idoneidad para entornos productivos debe evaluarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030 millones (8B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del base) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas estándar) |
| Idiomas soportados | en (según model card); el base soporta 8 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder-only con attention multi-head estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base es la versión de Unsloth de `Meta-Llama-3.1-8B-Instruct`, que ya incluye un entrenamiento supervisado y un refinamiento con RLHF/DPO por parte de Meta.

El fine-tuning se realizó con Unsloth y la librería TRL de HuggingFace, lo que acelera el entrenamiento. El nombre sugiere que se seleccionó solo la última tercera parte de un dataset orientado a reducir alucinaciones, y que se usó una semilla aleatoria fija (seed5) para la partición de datos. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como *direct preference optimization* (DPO) o *reinforcement learning*. Tampoco se indica si se modificó la longitud de contexto o si se usaron técnicas de atención eficiente.

## Capacidades

- Generación de texto y diálogo conversacional multirround, heredadas del modelo base Instruct.
- Razonamiento y resolución de problemas matemáticos y lógicos.
- Generación de código en múltiples lenguajes de programación.
- Soporte de *tool calling* y *function calling* (capacidad nativa de Llama 3.1).
- Capacidades multilingües del base: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés (aunque la model card solo declara inglés).
- Posible mejora en la fidelidad factual respecto al base, si el fine-tuning logró su objetivo, pero no hay evidencia publicada.

## Casos de uso

- Asistentes virtuales para atención al cliente: al ser un fine-tuning orientado a reducir alucinaciones, podría emplearse en sistemas de soporte donde la precisión de las respuestas es crítica, aunque se recomienda validar su rendimiento frente al base.
- Generación de documentación técnica a partir de especificaciones: la menor tendencia a inventar datos (si se confirma) lo haría adecuado para redactar manuales y guías basadas en fuentes verificadas.
- Sistemas de extracción de información: tareas de *question answering* sobre corpus propios donde la fidelidad a los documentos es esencial.
- Prototipos de agentes conversacionales con *tool calling*: integración en pipelines de automatización donde el modelo debe decidir cuándo llamar a una API externa en lugar de responder de memoria.
- Investigación académica sobre mitigación de alucinaciones: como punto de comparación para estudiar el efecto del subconjunto de datos (último tercio) en el comportamiento del modelo.
- Fine-tuning adicional: servir como punto de partida para tareas específicas de dominio, aprovechando su posible robustez frente a invenciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Cualquier afirmación sobre el rendimiento relativo sería especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (para 8B parámetros). Con cuantización INT8 o INT4 se reduce a 8-10 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16 sin cuantizar; GPUs con 8-12 GB (RTX 3080, A10) pueden ejecutarlo con cuantización.
- Cabe en GPUs de consumo con cuantización GGUF (por ejemplo, en una RTX 3060 de 12 GB con Q4_K_M).
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, o directamente con transformers en Python.
- Latencia y throughput: no disponibles; se estima similar al modelo base Llama-3.1-8B-Instruct (aproximadamente 50-80 tokens/s en una A100 con vLLM, dependiendo de la configuración).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed5 | 8B | 128K | Apache 2.0 | Fine-tuning experimental para reducir alucinaciones |
| unsloth/Meta-Llama-3.1-8B-Instruct (base) | 8B | 128K | Llama 3.1 Community License | Modelo instruct oficial de Meta, sin ajuste específico contra alucinaciones |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Versión original de Meta, requiere aceptación de licencia |

No hay modelos comparables publicados con el mismo objetivo (reducción de alucinaciones mediante SFT selectiva) en la información disponible. Las variantes del mismo autor (first-third, last-third con otras semillas) existen pero no tienen documentación pública.

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, la metodología de selección de datos ni los criterios de evaluación. El nombre sugiere que solo se usó el último tercio de un conjunto, pero se desconoce su contenido y calidad.
- No se han publicado benchmarks ni evaluaciones independientes; no se puede afirmar que el modelo alucine menos que el base.
- Al ser un fine-tuning de un modelo ya instruido, puede heredar sesgos y limitaciones de Llama 3.1, incluyendo posibles sesgos de género, raza o religión.
- Riesgo de alucinación no eliminado: el fine-tuning SFT no garantiza la eliminación de invenciones, especialmente en dominios fuera del dataset de entrenamiento.
- La model card solo declara inglés como idioma, aunque el base soporta más; el fine-tuning podría haber degradado el rendimiento en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se ofrece sin garantías y con cero descargas, lo que indica baja adopción y validación.
- Para producción, se recomienda evaluar exhaustivamente el modelo en el dominio objetivo antes de desplegarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed5)
- [Variante last-third-sft (sin seed)](https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-last-third-sft)
- [Variante first-third-sft-seed5-epoch3](https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed5-epoch3)
- [Página de despliegue en FriendliAI (variante seed2)](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed2)
- [Página de despliegue en FriendliAI (variante full)](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-full)
- [Repositorio oficial de Llama 3 en GitHub](https://github.com/meta-llama/llama3)
