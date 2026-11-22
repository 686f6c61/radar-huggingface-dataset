# sag-uniroma2/FrameLLaMA-3.2-8B-Instruct-50FramesFN17

## Resumen

FrameLLaMA-3.2-8B-Instruct-50FramesFN17 es un adaptador LoRA publicado por el grupo SAG de la Universidad de Roma Tor Vergata (sag-uniroma2) sobre `meta-llama/Llama-3.2-3B-Instruct`. A pesar del "8B" en el identificador, el modelo base es Llama-3.2-3B-Instruct; el adaptador inyecta conocimiento de semantica de marcos (frame semantics) de FrameNet mediante fine-tuning basado en prompts de pregunta-respuesta construidos a partir de definiciones de frames, elementos de marco (roles) y unidades lexicas.

Forma parte del primer estudio de FrameLLaMA, presentado en *SEM 2025 (paper "Injecting Frame Semantics into Large Language Models via Prompt-Based Fine-Tuning"), cuyo objetivo es comprobar si un LLM puede adquirir conocimiento estructurado de FrameNet y generalizarlo a frames no vistos durante el entrenamiento, ademas de transferirlo a etiquetado de roles semanticos (SRL) sin datos supervisados de SRL.

El modelo esta pensado exclusivamente para investigacion en semantica lexica: responder preguntas sobre definiciones de frames, listar elementos de marco y unidades lexicas, y realizar identificacion zero-shot de elementos de marco. No es un modelo de proposito general y su cobertura se limita a 60 frames de FrameNet (50 vistos en entrenamiento, 10 reservados como no vistos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), adaptacion LoRA sobre atencion y capas feed-forward |
| Parametros totales | 3B (modelo base Llama-3.2-3B-Instruct); el adaptador LoRA anade rank 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2, no confirmada en la model card) |
| Tipos de cuantizacion | Entrenado sobre build 4-bit de Unsloth; cuantizaciones de inferencia no especificadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | Repositorio de 0.0 GB; la model card menciona adaptador LoRA/PEFT (safetensors presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct y aplica un adaptador LoRA de rank 16 y alpha 16, sin dropout, sobre las capas de atencion y feed-forward. El entrenamiento se realizo sobre la build 4-bit de Unsloth, con 7 epocas, tasa de aprendizaje 2e-4, batch size 4 por dispositivo, 8 pasos de acumulacion de gradiente y AdamW de 8 bits; el checkpoint final se selecciona por perdida de validacion evaluada cada 50 pasos. El formato de prompt es `### Input: <QUESTION>` / `### Response: <ANSWER>`.

Los datos de entrenamiento consisten en 6.628 pares sinteticos pregunta-respuesta (3.642 de entrenamiento, 1.493 de validacion, 1.493 de test) mas 1.052 pares adicionales para frames no vistos. Se cubren 60 frames de FrameNet, de los cuales 50 se usan en entrenamiento y 10 se reservan como no vistos (por ejemplo, Releasing, Manipulation, Control). Se emplean 11 plantillas de tarea (6 abiertas, 4 cerradas si/no, 1 de eleccion multiple) con 5 formulaciones de pregunta y 15 variantes de respuesta por plantilla, sin repetir formas entre splits. La innovacion principal es el uso de prompts derivados de definiciones, elementos de marco y unidades lexicas para inyectar conocimiento estructurado, en lugar de entrenamiento supervisado clasico de SRL.

## Capacidades

- Generacion de texto en ingles orientada a dominios de semantica de marcos.
- Respuesta a preguntas sobre definiciones de frames de FrameNet.
- Listado de elementos de marco (roles) asociados a un frame.
- Identificacion de unidades lexicas que evocan un frame.
- Identificacion zero-shot de elementos de marco en texto (sin entrenamiento especifico de SRL).
- Soporte de tareas de respuesta abierta, cerrada (si/no) y eleccion multiple segun las plantillas de entrenamiento.
- Generalizacion parcial a frames no vistos en entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion en semantica lexica: servir como sonda para medir cuanto conocimiento de FrameNet puede almacenar un LLM de 3B mediante fine-tuning con prompts, comparando con el modelo base.
- Etiquetado zero-shot de elementos de marco: dado un texto, preguntar al modelo que roles de un frame concreto aparecen, util para prototipos de anotacion semantica sin corpus supervisado.
- Enriquecimiento de recursos linguisticos: generar candidatos de unidades lexicas y elementos de marco para revision manual por anotadores en proyectos de FrameNet extendido.
- Evaluacion de generalizacion: usar los 10 frames reservados (Releasing, Manipulation, Control, etc.) como conjunto de prueba para estudiar la transferencia a frames no vistos.
- Docencia en procesamiento del lenguaje natural: ejemplo reproducible de fine-tuning LoRA con Unsloth sobre Llama 3.2 para tareas de semantica estructurada.
- Baseline para SRL ligero: comparar el rendimiento de un modelo de 3B especializado frente a sistemas de SRL supervisados en escenarios de bajos recursos.
- Analisis de robustez linguistica: estudiar el efecto de las 5 formulaciones de pregunta y 15 variantes de respuesta sobre la estabilidad de las predicciones.

## Benchmarks y rendimiento

Resultados en el conjunto de test (Tabla 2 del paper). Las preguntas cerradas y de eleccion multiple se evaluan con F1; las abiertas con similitud coseno frente a la referencia (Sentence-BERT `all-mpnet-base-v2`).

| Tipo de prompt | Metrica | Base, frames vistos | Base, frames no vistos | Este modelo, vistos | Este modelo, no vistos |
|---|---|---:|---:|---:|---:|
| Cerradas | F1 | 0.49 | 0.50 | 0.91 | 0.86 |
| Abiertas | Coseno | 0.63 | 0.63 | 0.83 | 0.73 |
| Eleccion multiple | F1 | 0.25 | 0.33 | 0.52 | 0.50 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 3B parametros; en bf16 requiere aproximadamente 6-7 GB de VRAM, y en 4-bit alrededor de 2-3 GB (estimacion estandar para modelos de este tamano; no confirmada en la model card).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) para bf16 o cuantizacion 4-bit; A100/H100 no son necesarias.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 8 GB o mas.
- Opciones de despliegue: `transformers` con `peft` (necesario para cargar el adaptador LoRA); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El ejemplo de la model card usa `AutoModelForCausalLM` con `device_map="auto"` y `torch.bfloat16`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (F1 cerradas, vistos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FrameLLaMA-3.2-8B-Instruct-50FramesFN17 (este) | 3B (LoRA) | no disponible | 0.91 | Llama 3.2 | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3B | no disponible | 0.49 | Llama 3.2 | Hugging Face |
| FrameLLaMA-3.1-8B-Instruct-FullFN17 | 8B (LoRA) | no disponible | no disponible | Llama 3.1 (presumiblemente) | Hugging Face |

No se dispone de datos de benchmarks de otros modelos especializados en semantica de marcos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado unicamente sobre 60 frames de FrameNet; fuera de ese inventario el conocimiento es limitado.
- Puede predecir elementos de marco espurios y a menudo produce spans incompletos incluso para roles correctamente identificados.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- El rendimiento en eleccion multiple es bajo incluso tras el fine-tuning (F1 de 0.52 en frames vistos).
- Riesgo de alucinacion en definiciones y listados de unidades lexicas fuera de los frames cubiertos.
- El identificador del modelo menciona "8B" pero el modelo base es de 3B; conviene verificar el adaptador antes de integrarlo en pipelines.
- Uso comercial sujeto a la Llama 3.2 Community License, con las restricciones habituales de Meta (incluida la clausula de "Built with Llama").
- No esta pensado como modelo de proposito general ni para atencion al cliente, generacion de codigo o tareas fuera de la semantica de marcos.
- El repositorio aparece con tamano de 0.0 GB y sin descargas ni likes, lo que sugiere que los pesos pueden no estar publicados o que el artefacto es unicamente el adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sag-uniroma2/FrameLLaMA-3.2-8B-Instruct-50FramesFN17
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper *SEM 2025: https://aclanthology.org/2025.starsem-1.3/
- Paper ACL 2026 (FrameNet completo): https://aclanthology.org/2026.acl-short.55/
- Codigo FrameLLaMA: https://github.com/crux82/FrameLLaMA
- Modelo FrameLLaMA-3.1-8B-Instruct-FullFN17: https://huggingface.co/sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-FullFN17
- Codigo FrameLLaMA-Multilingual: https://github.com/crux82/FrameLLaMA-Multilingual
- Dataset FrameLLaMA-Multilingual-Instructions: https://huggingface.co/datasets/sag-uniroma2/FrameLLaMA-Multilingual-Instructions
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Unsloth: https://github.com/unslothai/unsloth
