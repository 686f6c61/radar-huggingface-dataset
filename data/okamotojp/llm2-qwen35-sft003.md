# OkamotoJP/llm2-qwen35-sft003

## Resumen

llm2-qwen35-sft003 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por OkamotoJP en el contexto del curso «LLM講座2 2026» (asignatura final centrada en RAG). El modelo parte de la revisión `2fc06364715b967f1860aea9cf38778875588b17` del modelo base y aplica un LoRA con r=16 y alpha=32 que posteriormente se fusiona con los pesos originales, de modo que la arquitectura resultante es idéntica a la del modelo base y solo se actualizan los pesos de la parte lingüística.

El objetivo declarado es la generación de respuestas dentro de un sistema de generación aumentada por recuperación (RAG) en japonés. Para ello se entrenó con 1156 ejemplos derivados de JEMHopQA y del dataset auto-wiki-qa, junto con fragmentos de Wikipedia japonesa usados como material de contexto en los prompts. El modelo tiene 873.438.784 parámetros (aproximadamente 0,87 mil millones) y un repositorio de 1,8 GB en formato safetensors.

Su relevancia es acotada: se trata de un modelo experimental de pequeño tamaño, especializado en una tarea concreta y con muy poca difusión (26 descargas en el momento de la consulta). Resulta útil como referencia para quien quiera evaluar ajustes finos de bajo coste sobre modelos de menos de mil millones de parámetros en idioma japonés, pero no está pensado como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B); no se detalla en la model card |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantización | no disponible (el repo solo publica safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen/Qwen3.5-0.8B original. El ajuste se realizó mediante LoRA con rango r=16, alpha=32, tasa de aprendizaje 0,0001 y una única época sobre 1156 ejemplos de entrenamiento. Posteriormente, los adaptadores se fusionaron con los pesos del modelo base, por lo que no hay capas adicionales en la inferencia. La model card indica explícitamente que solo se actualizaron los pesos de la parte lingüística.

Los datos de entrenamiento proceden de tres fuentes: JEMHopQA (CC BY-SA 4.0), filtrado y reformateado; cl-nagoya/auto-wiki-qa (CC BY-SA 4.0), muestreado, filtrado y reformateado; y un conjunto de fragmentos distribuidos derivados de Wikipedia japonesa (CC BY-SA 4.0) empleados como material de contexto en los prompts. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; por el contrario, el nombre «sft» y la configuración descrita apuntan a un ajuste supervisado puro.

## Capacidades

- Generación de texto en japonés orientada a responder preguntas a partir de contexto recuperado (RAG).
- Respuesta a preguntas de tipo multi-salto, dado que JEMHopQA es un dataset de QA con razonamiento encadenado sobre entidades.
- Uso de pasajes de Wikipedia japonesa como material de referencia dentro del prompt.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso autónomo más allá del formato de QA entrenado.
- Capacidad multilingüe limitada al japonés según la etiqueta de idioma del repositorio; no se garantiza un rendimiento equivalente en otros idiomas.
- No se documentan modos especiales (thinking mode, visión, audio) ni capacidades multimodales.

## Casos de uso

- Generación de respuestas en un pipeline RAG en japonés: el modelo fue entrenado específicamente para recibir fragmentos de contexto y producir una respuesta, por lo que encaja como componente generador tras un recuperador documental.
- Asistente de consulta sobre Wikipedia japonesa: puede responder preguntas factuales a partir de pasajes recuperados, aprovechando el entrenamiento con auto-wiki-qa y fragmentos de Wikipedia.
- Preguntas multi-salto en dominios enciclopédicos: el entrenamiento con JEMHopQA lo hace adecuado para preguntas que requieren combinar información de varias entidades o pasajes.
- Prototipado de bajo coste en investigación: con menos de mil millones de parámetros, permite iterar rápidamente en experimentos académicos de RAG sin infraestructura dedicada.
- Evaluación comparativa de ajustes finos: sirve como referencia para medir el efecto de un LoRA pequeño (1156 ejemplos, una época) sobre un modelo base de 0,8B.
- Filtrado y reformulación de respuestas en un sistema de búsqueda documental japonesa: puede reescribir o condensar pasajes recuperados antes de mostrarlos al usuario final.
- Docencia y experimentación en cursos de LLM: el modelo documenta de forma transparente su configuración de entrenamiento, lo que facilita su uso como ejemplo reproducible en un aula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7-1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, menos de 4 GB en la mayoría de configuraciones.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9-1 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,5-0,6 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) aunque están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 6 GB o más; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al publicarse solo en safetensors, es necesario convertirlo a GGUF para llama.cpp u Ollama; también puede servirse con vLLM o TGI si se dispone de los pesos en formato compatible. No se proporcionan artefactos preconvertidos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm2-qwen35-sft003 | 873.438.784 | no disponible | ja | Apache 2.0 | safetensors en HF |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | multilingüe (según modelo base) | Apache 2.0 | safetensors en HF |
| cl-nagoya/auto-wiki-qa (dataset, no modelo) | no aplica | no aplica | ja | CC BY-SA 4.0 | dataset en HF |
| JEMHopQA (dataset, no modelo) | no aplica | no aplica | ja | CC BY-SA 4.0 | repositorio GitHub |

No se dispone de información sobre modelos comparables de la misma categoría (ajustes finos de 0,8B especializados en RAG en japonés) en la documentación proporcionada. La comparación más directa posible es con el propio modelo base Qwen/Qwen3.5-0.8B, del que este modelo hereda arquitectura, licencia y formato.

## Limitaciones y advertencias

- Modelo experimental de curso: su finalidad declarada es la generación de respuestas en un sistema RAG concreto, no el uso general.
- Entrenado con solo 1156 ejemplos y una época, lo que limita la generalización fuera del dominio de QA enciclopédico japonés.
- Riesgo de alucinación: al ser un modelo de 0,8B ajustado con SFT, puede inventar datos cuando el contexto recuperado es insuficiente o ambiguo.
- Idiomas: la etiqueta del repositorio indica únicamente japonés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Contexto: no se especifica la longitud de contexto soportada; depende del modelo base y no se ha verificado en este ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero los datasets de entrenamiento (JEMHopQA y auto-wiki-qa) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre datos derivados; conviene revisar la compatibilidad antes de un despliegue comercial.
- Sin datos de benchmarks ni evaluaciones independientes: no hay evidencia pública de su calidad frente al modelo base.
- Repositorio con muy poca actividad (26 descargas, 0 likes) y sin pipeline declarado, lo que dificulta verificar su comportamiento en producción.
- No se publican conversiones a GGUF ni artefactos listos para llama.cpp u Ollama; el despliegue requiere trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft003
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA (GitHub): https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
