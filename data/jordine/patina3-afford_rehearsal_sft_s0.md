# Jordine/patina3-afford_rehearsal_sft_s0

## Resumen

El modelo `Jordine/patina3-afford_rehearsal_sft_s0` es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace por el usuario Jordine, diseñado para ser combinado con el modelo base `meta-llama/Llama-3.1-8B`. Se trata de un checkpoint de fine-tuning mediante aprendizaje supervisado (SFT, por sus siglas en inglés), como sugiere el sufijo `_sft_s0` en el nombre. El prefijo `afford_rehearsal` apunta a un posible entrenamiento orientado a tareas de razonamiento sobre affordances (posibilidades de interacción con objetos o entornos), aunque no se proporciona documentación que confirme esta hipótesis.

El repositorio contiene únicamente los pesos del adaptador (0.7 GB) en formato `safetensors`, junto con los metadatos de PEFT. Al ser un adaptador LoRA, no es un modelo autónomo: requiere cargar el modelo base Llama-3.1-8B y aplicar los pesos del adaptador para obtener el modelo final. La ficha pública es extremadamente escasa, con todos los campos de la model card marcados como `[More Information Needed]`, por lo que la mayoría de las especificaciones técnicas, datos de entrenamiento y rendimiento no están disponibles.

A pesar de la falta de información, la relevancia de este modelo reside en su naturaleza de adaptador ligero sobre uno de los modelos abiertos más utilizados (Llama-3.1-8B), lo que permite experimentar con fine-tuning de bajo coste en dominios específicos. Sin embargo, su utilidad práctica queda condicionada a la disponibilidad de documentación adicional por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Llama-3.1-8B) |
| Parametros totales | No disponible (el adaptador pesa 0.7 GB; el modelo base tiene 8.03B) |
| Parametros activos | No disponible (al ser LoRA, solo se actualizan los pesos del adaptador durante el entrenamiento) |
| Longitud de contexto | No disponible (heredada del modelo base, Llama-3.1-8B soporta hasta 128k tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors con precisión FP32/FP16, sin cuantización específica) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente inglés y otros idiomas, pero no se especifica para este adaptador) |
| Licencia | No disponible (la licencia del adaptador no se indica; el modelo base Llama-3.1-8B tiene su propia licencia Llama 3.1) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre `meta-llama/Llama-3.1-8B`, un transformer decoder-only con normalización pre-RMS, atención con RoPE (Rotary Position Embeddings) y activación SwiGLU. El adaptador introduce matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables en comparación con un fine-tuning completo.

El entrenamiento se realizó mediante aprendizaje supervisado (SFT), como indica el nombre del checkpoint (`_sft_s0`). No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas adicionales como RLHF o DPO. El tag `arxiv:1910.09700` en los metadatos hace referencia al paper de LoRA (Hu et al., 2019), lo que confirma el uso de esta técnica, pero no aporta detalles sobre el procedimiento específico de este entrenamiento.

Dado que no hay documentación adicional, no se pueden describir innovaciones técnicas particulares más allá de las propias de LoRA y del modelo base.

## Capacidades

Al ser un adaptador LoRA sobre Llama-3.1-8B, las capacidades del modelo final son, en principio, las del modelo base, modificadas por el fine-tuning. Sin embargo, al desconocer el objetivo del entrenamiento, no se puede afirmar con certeza qué habilidades específicas se han potenciado. A continuación se listan las capacidades generales heredadas del modelo base, con la advertencia de que no se ha verificado su comportamiento en este adaptador concreto:

- Generación de texto en lenguaje natural, incluyendo respuestas conversacionales, resúmenes y redacción creativa.
- Razonamiento de sentido común y resolución de problemas lógicos básicos.
- Generación de código en múltiples lenguajes de programación (Python, JavaScript, etc.) y explicación de fragmentos de código.
- Comprensión lectora y respuesta a preguntas sobre documentos extensos, gracias al contexto de hasta 128k tokens del modelo base.
- Soporte multilingüe limitado (el modelo base está entrenado principalmente en inglés, con algo de otros idiomas).
- Capacidad de tool calling y function calling, aunque no se ha confirmado si el adaptador preserva estas habilidades tras el fine-tuning.

No se dispone de información sobre capacidades especiales como modo de pensamiento (thinking mode), visión o audio, ya que el modelo base no las incluye y el adaptador no las añade.

## Casos de uso

Dada la falta de documentación, los casos de uso son hipotéticos y dependen del propósito del fine-tuning (probablemente relacionado con affordances o razonamiento sobre interacciones). Se enumeran aplicaciones plausibles, pero siempre con la salvedad de que no hay evidencia pública que las respalde:

- Fine-tuning para dominios específicos: el adaptador puede servir como punto de partida para experimentos de adaptación a tareas concretas (por ejemplo, razonamiento espacial o interacción con objetos) sin necesidad de entrenar un modelo completo.
- Investigación en aprendizaje por refuerzo y affordances: si el entrenamiento realmente se centró en affordances, el modelo podría emplearse en entornos de simulación robótica o juegos para evaluar la comprensión de acciones posibles.
- Prototipado rápido de chatbots especializados: al ser un adaptador ligero, se puede cargar sobre Llama-3.1-8B para crear un asistente con un tono o conocimiento específico, aunque se desconoce el dominio.
- Evaluación de técnicas LoRA: útil para investigadores que estudian el impacto de diferentes estrategias de fine-tuning (rehearsal, SFT) sobre modelos base.
- Educación y experimentación: como ejemplo de adaptador PEFT en HuggingFace, puede usarse para aprender a cargar y utilizar LoRA con la librería `transformers`.
- Integración en pipelines de generación aumentada por recuperación (RAG): combinado con el modelo base, podría emplearse para tareas de respuesta a preguntas sobre corpus específicos, siempre que el fine-tuning no haya degradado las capacidades generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este adaptador. Tampoco se proporcionan comparaciones con otros modelos o adaptadores.

## Requisitos de hardware

Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base sobre el que se cargue. Para inferencia con Llama-3.1-8B completo:

- VRAM estimada: aproximadamente 16 GB en FP16 (8B parámetros × 2 bytes), o unos 8 GB si se cuantiza a 4 bits (por ejemplo, con bitsandbytes o GPTQ).
- GPU recomendadas: RTX 4090 (24 GB), A100 (40 GB), H100 (80 GB) para FP16; GPUs con 8-12 GB (RTX 3080, RTX 4070) pueden funcionar con cuantización.
- En consumer GPU: sí, cabe en GPUs de gama alta (RTX 3090/4090) sin cuantización, y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: vLLM, llama.cpp (con conversión a GGUF), Ollama, HuggingFace TGI, o directamente con `transformers` + PEFT.
- Latencia y throughput: no disponibles para este adaptador concreto. Como referencia, Llama-3.1-8B en FP16 en una RTX 4090 genera aproximadamente 50-80 tokens por segundo, pero el adaptador añade una sobrecarga mínima.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en el mismo repositorio o de otros autores con características similares (mismo nombre de serie `patina3`). Como referencia, se compara con el modelo base y con otros modelos de 8B de la misma generación:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-8B (base) | 8.03B | 128k | Llama 3.1 Community License | HuggingFace |
| Jordine/patina3-afford_rehearsal_sft_s0 | 8.03B + adaptador | No disponible | No disponible | HuggingFace |
| Mistral-7B | 7.24B | 32k | Apache 2.0 | HuggingFace |
| Gemma-2-9B | 9.24B | 8k | Gemma License | HuggingFace |

La comparativa es limitada porque no se conocen los resultados de rendimiento del adaptador. Su principal diferencia frente a los otros modelos es que no es un modelo independiente, sino un complemento a Llama-3.1-8B.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos específicos del adaptador. El modelo base Llama-3.1-8B puede presentar sesgos de género, raza o ideológicos inherentes a sus datos de entrenamiento, que el fine-tuning podría amplificar o mitigar sin que se pueda verificar.
- Riesgo de alucinación: al ser un modelo de lenguaje, existe riesgo de generar información falsa o inventada, especialmente si el fine-tuning se realizó con datos limitados o ruidosos.
- Limitaciones de contexto e idioma: no se confirma la longitud de contexto efectiva tras el adaptador. El modelo base soporta 128k tokens, pero el fine-tuning podría reducirla. El soporte multilingüe es probablemente limitado, centrado en inglés.
- Restricciones de licencia: la licencia del adaptador no está especificada, lo que impide conocer si su uso comercial está permitido. El modelo base Llama-3.1-8B tiene restricciones (requiere aceptar los términos de Meta y no permite uso comercial sin aprobación en ciertos casos, según la licencia Llama 3.1).
- Cualquier uso en producción debe considerar que la documentación es inexistente: no hay garantías de calidad, robustez ni mantenimiento.
- El nombre del checkpoint sugiere un experimento de investigación (posiblemente parte de una serie `patina3`), por lo que podría no estar optimizado para tareas generales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jordine/patina3-afford_rehearsal_sft_s0
- Paper de LoRA (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Modelo base Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B

No se han encontrado otros enlaces (blogs, demos, papers específicos) relacionados con este adaptador.
