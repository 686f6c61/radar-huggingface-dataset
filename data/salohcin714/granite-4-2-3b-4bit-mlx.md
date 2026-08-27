# salohcin714/granite-4.2-3b-4bit-mlx

## Resumen

El modelo `salohcin714/granite-4.2-3b-4bit-mlx` es una conversión cuantizada a 4 bits del modelo `ibm-granite/granite-4.2-3b`, realizada por un usuario independiente (salohcin714) mediante la librería MLX de Apple. El modelo original, desarrollado por IBM, pertenece a la familia Granite 4.2, una serie de modelos densos decoder-only de 3B, 8B y 30B parámetros, diseñados para razonamiento eficiente, generación multilingüe, codificación y flujos de asistente con tool calling. Esta conversión específica está pensada para ejecutarse en hardware Apple Silicon (M-series) aprovechando el framework MLX.

La relevancia de este artefacto radica en que permite ejecutar un modelo de razonamiento de última generación en dispositivos locales con recursos limitados, gracias a la cuantización 4-bit affine con group size 64. El repositorio incluye los pesos en formato MLX safetensors, listos para usar con `mlx-lm`. No se ha realizado ningún fine-tuning adicional; se trata únicamente de una conversión y cuantización del modelo base. La licencia es Apache 2.0, lo que facilita su uso comercial y personal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (modelo base Granite 4.2 3B) |
| Parametros totales | 572.008.960 (según safetensors del repo; el modelo base declara 3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Granite 4.2 soporta contexto largo, pero no se especifica en esta conversión) |
| Tipos de cuantizacion | 4-bit affine, group size 64, round-to-nearest, sin calibración |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-4.2-3b` es un transformer denso decoder-only, post-entrenado sobre los pesos de Granite 4.1. Según la documentación de IBM, la familia Granite 4.2 incorpora chain-of-thought (razonamiento paso a paso), modos de pensamiento flexibles (thinking mode) y tool calling con razonamiento aumentado. El pre-entrenamiento se realizó sobre un corpus multilingüe extenso, aunque los detalles exactos (número de tokens, composición del dataset) no se han publicado en la información disponible.

Esta conversión concreta no añade ningún entrenamiento adicional. El autor utilizó `mlx-lm` 0.31.3 para convertir los pesos a formato MLX y aplicar cuantización 4-bit affine con group size 64, usando redondeo al entero más cercano sin calibración. Se eliminó el `lm_head.weight` redundante cuando el modelo ata las embeddings de entrada y salida. No se realizó fine-tuning ni se añadieron datos de entrenamiento.

## Capacidades

- Generación de texto multilingüe en 12 idiomas (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino).
- Razonamiento con chain-of-thought integrado, permitiendo modos de pensamiento explícitos o implícitos según la configuración.
- Tool calling / function calling con razonamiento aumentado, útil para agentes que necesitan decidir cuándo y cómo invocar herramientas.
- Soporte para flujos conversacionales multi-turno mediante chat template estándar.
- Capacidad de generación de código, heredada del modelo base Granite 4.2.
- Ejecución eficiente en Apple Silicon gracias al formato MLX, con posibilidad de usar aceleración por GPU unificada.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede integrarse en aplicaciones de escritorio o scripts que requieran un chatbot sin conexión, aprovechando la baja huella de memoria (2.1 GB) y la optimización MLX para Apple Silicon.
- Generación de código en entornos de desarrollo: gracias a su capacidad de razonamiento y generación de código, puede usarse como autocompletado o asistente de programación en IDEs, especialmente en equipos sin GPU dedicada.
- Automatización de atención al cliente: con soporte multilingüe y tool calling, puede gestionar consultas en varios idiomas y derivar a sistemas externos (APIs, bases de conocimiento) mediante function calling.
- Prototipado de agentes con razonamiento: su modo de pensamiento permite experimentar con agentes que planifican antes de actuar, útil en investigación o desarrollo de pipelines de IA.
- Análisis de texto y resumen: puede procesar documentos en múltiples idiomas y generar resúmenes o extraer información relevante, con la ventaja de ejecutarse localmente.
- Educación y aprendizaje: como modelo abierto y ligero, sirve para enseñar conceptos de LLMs, cuantización y despliegue en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión cuantizada. Los benchmarks publicados por IBM (por ejemplo, MMLU, HumanEval, GSM8K) corresponden a los pesos originales del modelo base, no a este artefacto cuantizado. El propio autor advierte en la model card que los benchmarks de IBM no deben leerse como afirmaciones sobre este repositorio. Por tanto, no se proporcionan cifras de rendimiento para evitar atribuciones incorrectas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 3B cuantizado a 4-bit, el tamaño del repo es de 2.1 GB, por lo que la memoria necesaria para inferencia ronda los 2-3 GB, dependiendo del contexto y del batch.
- GPU recomendadas: cualquier Mac con chip M1 o superior (por la compatibilidad MLX). También puede ejecutarse en GPUs NVIDIA con al menos 4 GB de VRAM usando adaptadores, aunque el formato MLX está optimizado para Apple Silicon.
- En consumer GPU: sí, cabe en GPUs como RTX 3060 (12 GB), RTX 4060 (8 GB) o incluso en iGPUs con suficiente memoria unificada.
- Opciones de despliegue: `mlx-lm` (recomendado), también se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporciona en este repo.
- Latencia y throughput: no disponible; dependerá del hardware y de la longitud del contexto. En Apple Silicon M2, se espera una generación de varios tokens por segundo, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.2-3b-4bit-mlx (este) | 572M (según safetensors) / 3B base | no disponible | Apache 2.0 | MLX 4-bit | Conversión no oficial, sin benchmarks |
| ibm-granite/granite-4.2-3b | 3B | no disponible | Apache 2.0 | safetensors (original) | Modelo base oficial, benchmarks de IBM |
| Llama 3.2 3B (Meta) | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Ampliamente usado, contexto largo |
| Qwen2.5 3B (Alibaba) | 3B | 32K | Apache 2.0 | safetensors, GGUF | Buen rendimiento en multilingüe y código |

La comparativa se basa en características generales; no se dispone de datos de rendimiento para la versión cuantizada. El modelo base Granite 4.2 destaca por su enfoque en razonamiento y tool calling, mientras que Llama 3.2 y Qwen2.5 son alternativas consolidadas con ecosistemas más amplios.

## Limitaciones y advertencias

- La cuantización 4-bit sin calibración puede degradar la precisión del modelo en tareas complejas de razonamiento o generación de código, en comparación con los pesos originales.
- El número de parámetros reportado en safetensors (572M) no coincide con el tamaño declarado del modelo base (3B); esto podría deberse a una subida incompleta o a una particularidad de la conversión. Se recomienda verificar la integridad del repositorio antes de usarlo en producción.
- No se han publicado benchmarks específicos para esta conversión; los resultados de IBM no son aplicables a este artefacto.
- El autor no está afiliado a IBM, y el uso de la marca "Granite" es descriptivo. No hay garantía de soporte ni mantenimiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base puede tener restricciones adicionales (consultar la licencia original de IBM).
- El modelo puede presentar sesgos y alucinaciones inherentes a los LLMs, especialmente en idiomas con menos representación en el entrenamiento.
- La longitud de contexto no está documentada en este repo; se recomienda probar con secuencias cortas para evitar errores de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-4bit-mlx
- Modelo base original: https://huggingface.co/ibm-granite/granite-4.2-3b
- Colección Granite 4.2 de IBM: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Documentación oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
