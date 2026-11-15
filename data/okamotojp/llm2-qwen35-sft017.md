# OkamotoJP/llm2-qwen35-sft017

## Resumen

llm2-qwen35-sft017 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo derivado orientado a la generacion de respuestas en tareas de generacion aumentada por recuperacion (RAG), concretamente como parte del trabajo final del curso "LLM講座2 2026". El modelo conserva la arquitectura del original y solo actualiza los pesos de la parte linguistica mediante LoRA fusionado.

El modelo cuenta con 873.438.784 parametros (aproximadamente 0,87 mil millones) y esta especializado en japones, unico idioma declarado en su model card. Su relevancia es limitada y academica: se publica como entregable de un curso, con 2 descargas y 0 likes en el momento de la consulta, y sin pipeline declarado. No obstante, resulta un ejemplo representativo de ajuste fino de bajo coste sobre un modelo pequeno para tareas concretas de respuesta sobre contexto documental.

La informacion publicada es escasa: no se detallan resultados de benchmarks, no se especifica la longitud de contexto heredada del modelo base ni los formatos de cuantizacion disponibles. La licencia es Apache-2.0, heredada del modelo base, lo que permite uso comercial con las condiciones habituales de atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; estructura identica al modelo base) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen/Qwen3.5-0.8B original (revision 2fc06364715b967f1860aea9cf38778875588b17). Segun la model card, el ajuste se realizo mediante LoRA con r=16 y alpha=32, tasa de aprendizaje 0,0001 y una sola epoca, tras lo cual los adaptadores se fusionaron en los pesos originales. Solo se actualizaron los pesos de la parte linguistica del modelo, por lo que la estructura general permanece intacta respecto al base.

El conjunto de entrenamiento consta de 1.216 ejemplos: 883 procedentes de auto-wiki-qa (cl-nagoya) y 333 de JEMHopQA (particion compositional). Ambos datasets estan bajo licencia CC BY-SA 4.0 y fueron filtrados, muestreados y reformateados para la tarea. Ademas, se emplearon fragmentos de un corpus de chunks derivado de Wikipedia en japones como material de contexto en los prompts de entrenamiento. No se documenta el uso de RLHF ni DPO, ni innovaciones tecnicas adicionales mas alla del propio ajuste supervisado.

## Capacidades

- Generacion de respuestas en japones condicionadas a contexto documental (orientada a RAG).
- Respuesta a preguntas de tipo compositional y multi-hop, gracias a la inclusion de JEMHopQA en el entrenamiento.
- Generacion de texto general heredada del modelo base Qwen3.5-0.8B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento se limita a respuesta sobre contexto.
- Capacidades multilingues: limitadas al japones segun la model card (el base podria tener mas, pero no se declara).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de respuestas en sistemas RAG en japones: el modelo esta entrenado explicitamente para responder a partir de fragmentos recuperados de Wikipedia y otros documentos, por lo que encaja como generador final en un pipeline de recuperacion + generacion.
- Preguntas multi-hop sobre documentacion: el entrenamiento con JEMHopQA le permite componer informacion de varios fragmentos para responder preguntas que requieren encadenar hechos.
- Asistente de consulta sobre bases de conocimiento internas en japones: puede integrarse en un chatbot que reciba chunks de documentos y produzca respuestas concisas.
- Prototipado academico y docencia: sirve como ejemplo reproducible de ajuste fino LoRA de bajo coste sobre un modelo de menos de mil millones de parametros.
- Clasificacion y extraccion de respuestas sobre contexto: util en tareas de question answering extractivo o generativo donde el contexto se proporciona en el prompt.
- Despliegue en entornos con recursos limitados: su tamano (menos de 1.000 millones de parametros) permite ejecucion en CPU o GPU de gama baja para pruebas y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamano (873 millones de parametros), en precision FP16 requeriria aproximadamente 1,7-1,8 GB solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, es viable en GPUs consumer como RTX 3060, RTX 4060 o superiores en FP16, y en CPU para pruebas.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs con 4 GB o mas de VRAM en FP16; en cuantizaciones de 8 o 4 bits el requisito seria menor, aunque no se publican versiones cuantizadas.
- Opciones de despliegue: no documentadas por el autor; al ser un modelo de la familia Qwen con pesos safetensors, seria compatible con frameworks habituales (transformers, vLLM, llama.cpp/Ollama previa conversion), aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm2-qwen35-sft017 | 873 M | no disponible | ja | Apache-2.0 | Hugging Face (2 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Otros ajustes SFT de Qwen3.5-0.8B | ~0,8 B | no disponible | variable | Apache-2.0 (heredada) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenamiento muy acotado: solo 1.216 ejemplos y una epoca, lo que limita la generalizacion fuera del dominio de Wikipedia y JEMHopQA.
- Idioma restringido al japones segun la model card; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: como todo modelo generativo pequeno, puede producir respuestas plausibles pero incorrectas, especialmente fuera del contexto de entrenamiento.
- Sesgos: no documentados por el autor; al derivar de Wikipedia en japones, puede heredar sesgos de esa fuente.
- Longitud de contexto no declarada: no se puede garantizar el manejo de contextos largos en produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento son CC BY-SA 4.0; conviene revisar las obligaciones de atribucion y compartir-igual derivadas de esa licencia.
- Modelo de caracter academico con muy poca adopcion (2 descargas, 0 likes): no recomendado como dependencia critica en produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft017
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
