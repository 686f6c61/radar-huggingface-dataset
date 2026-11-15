# OkamotoJP/llm2-qwen35-sft013avg

## Resumen

`llm2-qwen35-sft013avg` es un modelo de lenguaje en japones de 873 millones de parametros, publicado por el usuario OkamotoJP en Hugging Face. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-0.8B` (licencia Apache-2.0) obtenido mediante LoRA y posterior fusion de pesos (merge). Concretamente, es la media elemento a elemento de dos modelos entrenados con los mismos datos pero distinta semilla (`llm2-qwen35-sft013` y `llm2-qwen35-sft013b`, ambos con peso 0,50).

El modelo fue desarrollado como entrega final del curso "LLM講座2 2026", cuyo objetivo era construir un sistema de generacion de respuestas para RAG (generacion aumentada por recuperacion). La arquitectura es identica a la del modelo base Qwen3.5-0.8B; solo cambian los pesos de la parte linguistica, no la estructura. Por tanto, hereda las caracteristicas tecnicas del modelo original de Qwen.

Su relevancia es limitada fuera del ambito del curso: apenas acumula 3 descargas y 0 likes, y esta especializado en japones y en tareas de respuesta a preguntas sobre contexto documental. Resulta util como ejemplo de tecnica de model averaging (weight averaging) sobre fine-tunings de bajo rango, y como modelo pequeno de generacion para pipelines RAG en japones que quieran ejecutarse en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors, admite cuantizacion posterior con herramientas estandar (GGUF, AWQ, GPTQ) aunque no se documenta en la model card |
| Idiomas soportados | japones (`ja`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la estructura del Qwen3.5-0.8B original: solo se han modificado los pesos de la parte linguistica mediante fine-tuning con LoRA y posterior fusion. Sobre esa base se aplico una media aritmetica elemento a elemento de dos ejecuciones de entrenamiento con los mismos datos y distinta semilla, una tecnica de model averaging que suele reducir la varianza del fine-tuning y estabilizar la calidad de las respuestas.

Los datos de entrenamiento de los dos modelos promediados son: JEMHopQA (CC BY-SA 4.0, filtrado y reformateado), `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0, muestreado, filtrado y reformateado) y un conjunto de chunks distribuidos derivados de Wikipedia en japones (CC BY-SA 4.0), usados como material de contexto en los prompts de entrenamiento. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; la model card solo menciona SFT (supervised fine-tuning). No se documentan innovaciones tecnicas adicionales mas alla del merge por media de pesos.

## Capacidades

- Generacion de texto en japones orientada a responder preguntas a partir de documentos de contexto (formato RAG).
- Respuesta a preguntas sobre Wikipedia en japones y sobre dominios cubiertos por JEMHopQA (preguntas multihop).
- Capacidad de razonamiento y conocimiento general heredada del modelo base Qwen3.5-0.8B, aunque no documentada especificamente para este fine-tuning.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al japones segun la etiqueta de idioma del modelo.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de respuestas en un pipeline RAG en japones: el modelo esta entrenado especificamente para recibir chunks de Wikipedia como contexto y producir la respuesta final, por lo que encaja directamente como componente generador de un sistema de recuperacion y respuesta.
- Asistente de preguntas y respuestas sobre documentacion interna: con 873 millones de parametros puede desplegarse en una sola GPU consumer y responder consultas sobre manuales o bases de conocimiento en japones.
- Prototipado rapido de chatbots japoneses: su tamano reducido permite iterar en local sin infraestructura dedicada, util para validar flujos conversacionales antes de escalar a modelos mayores.
- Educacion e investigacion: sirve como ejemplo reproducible de fine-tuning LoRA seguido de model averaging, util para cursos y experimentos sobre tecnicas de fusion de pesos.
- Respuesta a preguntas multihop: el entrenamiento con JEMHopQA lo hace adecuado para preguntas que requieren combinar informacion de varias fuentes dentro del contexto proporcionado.
- Despliegue en entornos con recursos limitados: al ocupar aproximadamente 1,8 GB en safetensors en precision original, puede ejecutarse en GPUs de gama media o incluso en CPU con cuantizacion, para tareas de generacion de baja latencia y volumen moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB.
- VRAM estimada con cuantizacion de 8 bits: en torno a 1 GB para pesos.
- VRAM estimada con cuantizacion de 4 bits: en torno a 0,5-0,7 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente en fp16; para mayor throughput, A100 o H100 no son necesarias dado el tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM, y en CPU con cuantizacion.
- Opciones de despliegue: al ser safetensors con arquitectura Qwen3.5, puede cargarse con `transformers`, y previsiblemente con vLLM, TGI, llama.cpp u Ollama tras conversion a GGUF; no se documenta soporte verificado en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `llm2-qwen35-sft013avg` (este) | 873 M | no disponible | ja | Apache-2.0 | Fine-tuning LoRA promediado de Qwen3.5-0.8B, orientado a RAG en japones |
| `Qwen/Qwen3.5-0.8B` (base) | no disponible en la informacion proporcionada | no disponible | no disponible | Apache-2.0 | Modelo original sin fine-tuning; capacidades generales |
| `llm2-qwen35-sft013` | no disponible en la informacion proporcionada | no disponible | ja | Apache-2.0 | Uno de los dos modelos promediados (peso 0,50) |
| `llm2-qwen35-sft013b` | no disponible en la informacion proporcionada | no disponible | ja | Apache-2.0 | El otro modelo promediado (peso 0,50) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en japones: su uso en castellano u otros idiomas no esta soportado ni validado.
- Entrenado para generacion de respuestas en RAG: fuera de ese formato de prompt puede degradarse respecto al modelo base.
- Riesgo de alucinacion: como todo modelo generativo de 873 M de parametros, puede inventar datos cuando el contexto recuperado es insuficiente o irrelevante.
- Sesgos: no documentados en la model card; al entrenarse con Wikipedia en japones y datasets derivados, puede heredar sesgos de esas fuentes.
- Licencia Apache-2.0: permite uso comercial, pero los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad antes de un uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Adopcion minima (3 descargas, 0 likes) y sin mantenimiento documentado: no es un modelo con soporte de la comunidad.
- Longitud de contexto no especificada en la model card: debe consultarse la del modelo base Qwen3.5-0.8B antes de disenar el pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft013avg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo promediado 1: https://huggingface.co/OkamotoJP/llm2-qwen35-sft013
- Modelo promediado 2: https://huggingface.co/OkamotoJP/llm2-qwen35-sft013b
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
