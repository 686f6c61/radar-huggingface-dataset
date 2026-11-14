# OkamotoJP/llm2-qwen35-sft008

## Resumen

`OkamotoJP/llm2-qwen35-sft008` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo derivado creado como entrega final del curso "LLM講座2 2026", orientado especificamente a la generacion de respuestas en un sistema de generacion aumentada por recuperacion (RAG). El ajuste se realizo mediante LoRA y posteriormente se fusiono con los pesos originales, por lo que la arquitectura resultante es identica a la del modelo base.

El modelo conserva los 873.438.784 parametros del Qwen3.5-0.8B original y esta especializado en japones (`ja`), idioma en el que se encuentran todos los conjuntos de datos de entrenamiento utilizados. Su proposito es responder preguntas a partir de documentos de referencia proporcionados en el prompt, un patron tipico de los pipelines RAG.

Su relevancia es limitada fuera del contexto academico para el que fue creado: cuenta con 13 descargas y ningun "like" en Hugging Face, y no dispone de model card con benchmarks ni evaluaciones publicas. Resulta util como ejemplo de ajuste LoRA sobre un modelo pequeno para una tarea concreta de QA documental en japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | japones (`ja`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`), un transformer decoder-only de aproximadamente 873 millones de parametros. El autor indica explicitamente que la estructura del modelo es identica a la original y que unicamente se actualizaron los pesos de la parte linguistica. No se dispone de informacion detallada sobre el numero de capas, dimension oculta, cabezas de atencion ni mecanismos de atencion especificos, ya que la model card no los detalla.

El entrenamiento consistio en un ajuste fino supervisado con LoRA de rango 16 y alpha 32, tasa de aprendizaje 0,0001, una sola epoca y un total de 1.378 ejemplos. Los datos provienen de tres fuentes: JEMHopQA (CC BY-SA 4.0), el conjunto cl-nagoya/auto-wiki-qa (CC BY-SA 4.0) y un conjunto de fragmentos derivados de Wikipedia en japones (CC BY-SA 4.0) empleado como material de referencia en los prompts. Los conjuntos se filtraron, muestrearon y reformatearon para la tarea. Tras el entrenamiento, los adaptadores LoRA se fusionaron en los pesos base. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto en japones, orientada a respuestas concisas basadas en documentos de referencia.
- Respuesta a preguntas (QA) sobre contexto proporcionado en el prompt, patron tipico de RAG.
- Razonamiento de tipo multi-hop limitado, derivado del entrenamiento con JEMHopQA (preguntas que requieren combinar varias entidades).
- Capacidad de sintesis de fragmentos de Wikipedia en japones para construir respuestas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo japones declarado; el resto de idiomas no esta garantizado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de respuestas en un pipeline RAG en japones: el modelo recibe fragmentos recuperados como contexto y produce una respuesta sintetizada; es el escenario para el que fue entrenado explicitamente.
- Atencion al cliente en japones sobre base documental: se puede integrar en un sistema que recupere articulos de ayuda y genere respuestas acotadas al contexto, reduciendo respuestas fuera de dominio.
- Asistente interno de consulta sobre documentacion corporativa: indexar manuales y politicas en japones y usar el modelo para responder preguntas de empleados con citas del material recuperado.
- Preguntas multi-hop sobre entidades: gracias al entrenamiento con JEMHopQA, puede responder cuestiones que requieren relacionar varias entidades presentes en los documentos de referencia.
- Prototipado academico y docencia: sirve como ejemplo reproducible de ajuste LoRA sobre un modelo de menos de 1.000 millones de parametros para tareas de QA documental.
- Extraccion y resumen de articulos de Wikipedia en japones: util para generar resumenes de fragmentos recuperados en herramientas de busqueda interna o wikis corporativas.
- Despliegue en hardware modesto: al tratarse de un modelo de 873 millones de parametros, puede ejecutarse en GPU de consumo para demos y entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,75 GB solo para pesos (873 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en int8: en torno a 0,9 GB para pesos.
- VRAM estimada en int4: en torno a 0,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 en inferencia; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoria de casos sobredimensionadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 6 GB o mas; tambien es viable en CPU con llama.cpp u Ollama para pruebas.
- Opciones de despliegue: transformers (con safetensors), vLLM, TGI, llama.cpp y Ollama (previa conversion a GGUF, no publicada por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft008 | 873 M | no disponible | ja | Apache-2.0 | Ajuste LoRA para RAG en japones; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B (base) | ~873 M | no disponible | multilingue | Apache-2.0 | Modelo base sin especializar; referencia directa |
| cl-nagoya/auto-wiki-qa (dataset, no modelo) | no aplica | no aplica | ja | CC BY-SA 4.0 | Fuente de datos de entrenamiento, no comparable como modelo |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria. Cualquier modelo de ~1.000 millones de parametros afinado para QA en japones seria un comparable razonable, pero no se ha identificado ninguno concreto en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en japones; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- El ajuste se realizo con solo 1.378 ejemplos y una epoca, lo que limita la generalizacion y aumenta el riesgo de sobreajuste al formato de los datos de entrenamiento.
- Riesgo de alucinacion: al ser un modelo pequeno (873 M) especializado en RAG, puede generar respuestas plausibles pero no sustentadas en el contexto si el prompt no restringe la generacion.
- Los datos de entrenamiento derivan de JEMHopQA y auto-wiki-qa (CC BY-SA 4.0); aunque los pesos se distribuyen bajo Apache-2.0, conviene revisar las implicaciones de la licencia CC BY-SA de los datos subyacentes para usos comerciales.
- No hay benchmarks, evaluaciones ni model card detallada; no se recomienda su uso en produccion sin una evaluacion propia.
- El contexto maximo no esta documentado en la model card; debe consultarse la ficha del modelo base Qwen3.5-0.8B.
- Proyecto academico con 13 descargas y sin mantenimiento declarado; la probabilidad de actualizaciones o soporte es baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft008
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
