# koreallmdev/ministral3-14b-20k-lora-ddp-20260826

## Resumen

Este repositorio contiene un adaptador PEFT/LoRA de fine-tuning sobre el modelo base `mistralai/Ministral-3-14B-Instruct-2512-BF16`, desarrollado por el usuario `koreallmdev`. El adaptador se entrenó sobre 20.000 filas de datos con una longitud máxima de secuencia de 1.024 tokens y 1.250 pasos de optimización, utilizando una topología de entrenamiento distribuido DDP de dos nodos. El artefacto final es exclusivamente el adaptador LoRA, sin incluir los pesos del modelo base, por lo que se debe cargar el modelo base por separado y después adjuntar este adaptador mediante la librería `peft`.

Se trata de un fine-tuning específico sobre la familia Ministral 3 de Mistral AI, diseñada para despliegue en entornos con recursos limitados (edge). El modelo base de 14B parámetros es un modelo denso con capacidades multimodales (texto e imagen). Sin embargo, este adaptador no incluye evaluación de calidad post-entrenamiento en los metadatos de subida, y el autor advierte explícitamente que no debe interpretarse como una afirmación de rendimiento hasta que se publiquen resultados de evaluación. La relevancia actual radica en que permite adaptar un modelo base potente a un dominio o tarea específica con un coste de entrenamiento reducido gracias a la técnica LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `Mistral3ForConditionalGeneration` (modelo base Ministral 3 14B) |
| Parametros totales | No disponible (el adaptador es un subconjunto; el modelo base tiene 14B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en el adaptador; el modelo base soporta contexto largo (no se indica el valor exacto en la informacion disponible) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato safetensors; el modelo base se ofrece en BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura `Mistral3ForConditionalGeneration`, que combina un transformer denso con capacidades multimodales (procesamiento de texto e imágenes). El modelo base Ministral 3 está disponible en tres tamaños (3B, 8B y 14B), todos densos, optimizados para entornos con restricciones de cómputo y memoria. El fine-tuning emplea LoRA (Low-Rank Adaptation), que congela los pesos originales e introduce matrices de bajo rango en las capas de atención, reduciendo drásticamente el número de parámetros entrenables y el coste de entrenamiento.

El entrenamiento se realizó sobre 20.000 ejemplos con una longitud máxima de secuencia de 1.024 tokens, completando 1.250 pasos de optimización en una topología DDP de dos nodos. No se especifica la composición del dataset, la técnica de alineación (RLHF, DPO, etc.) ni los hiperparámetros del LoRA (rango, alpha, capas objetivo). El repositorio solo contiene el adaptador final; los checkpoints intermedios y los logs de entrenamiento se excluyen deliberadamente.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Ministral 3 14B Instruct, que incluye generación de texto, razonamiento y comprensión de instrucciones.
- Capacidades multimodales: el modelo base soporta entrada de imágenes además de texto, por lo que el adaptador puede utilizarse en tareas que combinen ambas modalidades (si el fine-tuning no las ha degradado).
- Fine-tuning específico: el adaptador está diseñado para mejorar el rendimiento en el conjunto de datos con el que se entrenó (20.000 filas), aunque no se detalla la naturaleza de esos datos.
- Despliegue en edge: el modelo base está optimizado para ejecutarse en hardware con recursos limitados, lo que facilita su uso en dispositivos locales.

No se dispone de información sobre soporte de tool calling, function calling, agentes o modo de razonamiento explícito para este adaptador concreto; esas capacidades dependerán del modelo base y de cómo se haya realizado el fine-tuning.

## Casos de uso

- Adaptación a dominios específicos: si se dispone de un dataset propio (por ejemplo, documentación técnica, atención al cliente o código interno), este adaptador puede servir como punto de partida para un fine-tuning posterior o como ejemplo de cómo aplicar LoRA sobre Ministral 3 14B.
- Prototipado rápido de fine-tuning: el repositorio demuestra un flujo de entrenamiento con LoRA y DDP, útil para equipos que quieran replicar el proceso con sus propios datos y evaluar la viabilidad antes de escalar.
- Evaluación de adaptadores: los desarrolladores pueden cargar este adaptador sobre el modelo base para comprobar el efecto de un fine-tuning concreto en tareas de generación de texto o visión-lenguaje, comparando con el modelo base sin adaptar.
- Investigación en eficiencia de entrenamiento: al ser un adaptador pequeño (0.1 GB), es adecuado para estudiar el impacto de la longitud de secuencia (1.024 tokens) y el número de pasos en el rendimiento final, sin necesidad de recursos masivos.
- Despliegue en entornos con restricciones de almacenamiento: al no incluir los pesos del modelo base, el adaptador es ligero y puede distribuirse fácilmente, permitiendo actualizar el comportamiento del modelo base sin reemplazarlo por completo.
- Integración en pipelines de generación aumentada por recuperación (RAG): si el fine-tuning se realizó sobre datos de un dominio concreto, el adaptador puede mejorar la fidelidad de las respuestas en sistemas RAG que ya utilicen el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se debe interpretar este repositorio como una afirmación de rendimiento hasta que se añadan evaluaciones posteriores. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas comparativas.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la VRAM necesaria para inferencia depende del modelo base (Ministral 3 14B en BF16). Con cuantización a 8 bits, se estima un consumo de aproximadamente 14-16 GB de VRAM; en 4 bits, alrededor de 8-10 GB. El adaptador en sí añade una sobrecarga mínima.
- GPU recomendadas: para el modelo base en BF16 se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB). Con cuantización 4 bits, una RTX 4080 o similar podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, si se cuantiza el modelo base (por ejemplo, con bitsandbytes o GPTQ) y se dispone de al menos 8-10 GB de VRAM. El modelo base está diseñado para edge, por lo que es viable en hardware modesto.
- Opciones de despliegue: el modelo base se puede servir con vLLM, TGI, llama.cpp (mediante conversión a GGUF) u Ollama (que ya ofrece variantes de Ministral 3). El adaptador PEFT se integra fácilmente con la librería `transformers` y `peft`.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros adaptadores o modelos de la misma categoría. Como referencia, el modelo base Ministral 3 14B se posiciona frente a otros modelos densos de ~14B como Llama 3.1 8B, Qwen 2.5 14B o Gemma 2 9B, pero no hay datos de rendimiento específicos para este adaptador. Se recomienda consultar la documentación del modelo base para comparativas de capacidades y benchmarks.

## Limitaciones y advertencias

- No hay evaluación de calidad publicada: el autor advierte que el adaptador no ha pasado una evaluación post-entrenamiento formal, por lo que su rendimiento real es desconocido.
- Falta de información sobre el dataset de entrenamiento: no se especifica qué datos se usaron, lo que impide conocer el dominio de especialización y el posible sesgo introducido.
- Riesgo de alucinación y sesgos: al ser un fine-tuning no evaluado, el adaptador puede presentar alucinaciones o sesgos heredados del modelo base y del conjunto de datos de entrenamiento.
- Licencia no especificada: no se indica la licencia del adaptador, lo que genera incertidumbre sobre su uso comercial o redistribución. Hay que verificar la licencia del modelo base (Mistral AI suele usar Apache 2.0 para sus modelos, pero no se confirma aquí).
- Longitud de secuencia limitada durante el entrenamiento: el adaptador se entrenó con secuencias de máximo 1.024 tokens, por lo que puede no comportarse bien con entradas más largas que esa longitud.
- Dependencia del modelo base: el adaptador solo funciona con el modelo base exacto `mistralai/Ministral-3-14B-Instruct-2512-BF16`; no es compatible con otras versiones o tamaños.
- Repositorio privado en el momento de la subida: la visibilidad del repositorio era privada en la fecha de creación, lo que sugiere que el adaptador puede no estar destinado a producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/koreallmdev/ministral3-14b-20k-lora-ddp-20260826
- Modelo base en HuggingFace: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Página de Ministral 3 en Ollama: https://ollama.com/library/ministral-3:14b
- Variante cuantizada en Ollama: https://ollama.com/library/ministral-3:14b-instruct-2512-q8_0
- Paper de Ministral 3 en arXiv: https://arxiv.org/abs/2601.08584
