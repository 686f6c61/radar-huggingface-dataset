# nabouty/DeepSeek-V4-Pro-Qwen3.5-9B

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B es un ajuste fino (fine-tune) del modelo Qwen3.5-9B de Alibaba, desarrollado por el usuario nabouty y publicado en Hugging Face bajo licencia Apache 2.0. El modelo se presenta como un destilado de razonamiento de DeepSeek-V4-Pro en su modo "Max Effect", es decir, el autor ha generado respuestas con un modelo profesor de gran tamaño (DeepSeek-V4-Pro) y ha entrenado al modelo base de 9B sobre esas respuestas para transferir patrones de razonamiento estructurado. El foco del entrenamiento son matemáticas y disciplinas STEM, con aproximadamente 250.000 muestras de SFT (supervised fine-tuning) centradas en la descomposición rigurosa de problemas y la resolución multi-paso.

El modelo conserva la arquitectura y el tokenizador de Qwen3.5-9B, con 9.653.104.368 parámetros totales según los pesos en safetensors, y se distribuye en formato transformers/safetensors (19,3 GB de repositorio). Está etiquetado como `image-text-to-text` además de `text-generation`, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card no detalla el proyector de visión en este repositorio (remite a una variante GGUF separada).

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: destilar las capacidades de razonamiento de modelos frontera (DeepSeek-V4-Pro) en modelos de 9B desplegables en hardware asequible, con soporte declarado para tool calling, function calling y despliegue vía vLLM NVFP4 o llama.cpp con MTP. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, lo que indica que no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-9B); no se especifican detalles de atención ni de capas en la model card |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; la model card remite a variantes MTP GGUF (Q8_0) y a evaluación con NVFP4 en vLLM |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); existen variantes GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-9B`, un checkpoint de la familia Qwen3.5 de 9B parámetros. La model card no describe la arquitectura interna (número de capas, dimensiones ocultas, tipo de atención, uso de RoPE, etc.), por lo que los detalles estructurales deben consultarse en la documentación del modelo base. Lo que sí se documenta es el proceso de post-entrenamiento: el autor generó respuestas con DeepSeek-V4-Pro en modo "Max Effect" y entrenó al modelo de 9B sobre esas respuestas mediante SFT, con un corpus de aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico.

Las etiquetas del repositorio incluyen `distillation`, `sft`, `rl` y `gspo`, lo que sugiere que el pipeline combinó destilación supervisada con alguna fase de aprendizaje por refuerzo (GSPO, Group Sequence Policy Optimization, una variante de optimización de política usada en modelos de razonamiento). También aparecen las etiquetas `mtp` (multi-token prediction) y `tool-use`/`function-calling`, lo que indica que el modelo conserva o incorpora capacidades de predicción multi-token y de invocación de herramientas. La model card menciona que se evaluó el despliegue mediante vLLM con NVFP4 y llama.cpp con MTP-Q8_0, pero no aporta métricas de rendimiento.

## Capacidades

- Generación de texto y razonamiento multi-paso con énfasis en descomposición estructurada de problemas.
- Resolución de problemas matemáticos y de disciplinas STEM (física, química, ingeniería, etc.), entrenado sobre ~250.000 muestras específicas.
- Tool calling y function calling, según las etiquetas del repositorio y la mención a `tool-use`.
- Soporte de agentes y razonamiento multi-paso, heredado del formato de razonamiento del profesor y de la fase de RL.
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Posible soporte de visión (etiqueta `image-text-to-text`), aunque el proyector de visión no está en este repositorio y la model card remite a una variante GGUF separada.
- Predicción multi-token (MTP), relevante para decodificación especulativa y aceleración de inferencia.
- Mejoras modestas reportadas en programación y uso de herramientas, pese a no recibir SFT específico de código.

## Casos de uso

- Tutoría de matemáticas y STEM: el modelo puede descomponer problemas de cálculo, álgebra o física en pasos intermedios y explicar el razonamiento, aprovechando las ~250.000 muestras de entrenamiento centradas en estas materias.
- Generación de soluciones paso a paso para plataformas educativas: útil para producir explicaciones verificables y estructuradas en lugar de respuestas directas, lo que facilita la revisión por parte de docentes.
- Asistente de investigación para borradores técnicos: puede redactar derivaciones, resúmenes de resultados experimentales y explicaciones de conceptos científicos con un estilo más riguroso que un modelo generalista del mismo tamaño.
- Automatización de pipelines de resolución de problemas con tool calling: integrable en flujos donde el modelo invoca una calculadora, un solver simbólico o una API de datos científicos para verificar resultados intermedios.
- Agentes multi-paso en entornos técnicos: con soporte de function calling y razonamiento encadenado, puede orquestar tareas como consultar documentación, ejecutar código y validar resultados.
- Despliegue en hardware de gama media: al ser un modelo de 9B con cuantización GGUF disponible, puede ejecutarse en una sola GPU consumer o en CPU con llama.cpp para prototipos y demos internas.
- Evaluación comparativa de destilación: útil como caso de estudio para investigadores que analizan cuánto razonamiento de un profesor frontera se transfiere a un alumno de 9B en dominios STEM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras cualitativas ("small post-training gains") en programación y uso de herramientas, pero no aporta cifras de MMLU, GSM8K, HumanEval ni de ningún otro conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB para pesos, viable en GPUs de 16 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 5-6 GB para pesos, viable en GPUs consumer de 8 GB con contexto moderado.
- GPUs recomendadas: A100 40/80 GB, H100 para serving de alta concurrencia; RTX 4090 (24 GB) para FP16 en contexto corto; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 4060 Ti 16 GB o RTX 3060 12 GB para 4 bits.
- Cabe en GPU consumer: sí, en cuantizaciones de 4-8 bits; en FP16 requiere al menos 24 GB.
- Opciones de despliegue: transformers, vLLM (con soporte NVFP4 según la model card), llama.cpp con variantes MTP GGUF, y presumiblemente TGI por la etiqueta `text-generation-inference`.
- Latencia y throughput: no disponibles; la model card no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B | 9,65 B | no disponible | Apache 2.0 | Destilado de razonamiento STEM; sin benchmarks publicados; 0 descargas |
| Qwen3.5-9B (base) | ~9 B | no disponible | Apache 2.0 (presumible) | Modelo base sin el ajuste de razonamiento; referencia para medir la ganancia del destilado |
| DeepSeek-R1-Distill-Qwen-7B | ~7 B | 128 K (según documentación de la familia R1) | MIT (según la familia R1) | Destilado de razonamiento de DeepSeek-R1 sobre Qwen; benchmarks públicos amplios |
| Qwen2.5-Math-7B | ~7 B | 4 K (según documentación de Qwen2.5-Math) | Apache 2.0 | Especializado en matemáticas; benchmarks públicos en GSM8K y MATH |

La comparación con DeepSeek-R1-Distill-Qwen-7B y Qwen2.5-Math-7B es pertinente por categoría (destilados de razonamiento y modelos matemáticos de ~7-9B), pero conviene señalar que este modelo no publica métricas, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que las ganancias de razonamiento sean reales o comparables a otros destilados.
- Cero descargas y cero likes en el momento de la ficha: el modelo no ha sido validado por la comunidad ni auditado de forma independiente.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados: el modelo puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente en problemas STEM con varios pasos.
- Sesgos no documentados: la model card no describe la composición del dataset de destilación ni posibles sesgos de género, idioma o dominio.
- Contexto no especificado: se desconoce la ventana máxima, lo que dificulta planificar su uso en tareas de contexto largo.
- Idiomas: aunque se declaran seis idiomas, el entrenamiento se centra en matemáticas y STEM y probablemente en inglés y chino; el rendimiento en español, coreano, japonés y ruso no está verificado.
- Visión: la etiqueta `image-text-to-text` sugiere capacidades multimodales, pero el proyector de visión no está en este repositorio; la model card remite a una variante GGUF separada, lo que complica el despliegue multimodal directo.
- Licencia Apache 2.0: permisiva para uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las condiciones del modelo base Qwen3.5-9B antes de producción.
- Dependencia de un pipeline de destilación propietario: la reproducibilidad del entrenamiento no está documentada (no se detallan hiperparámetros, composición exacta del dataset ni configuración de GSPO).

## Enlaces

- Hugging Face: https://huggingface.co/nabouty/DeepSeek-V4-Pro-Qwen3.5-9B
- Variante MTP GGUF y proyector de visión: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
