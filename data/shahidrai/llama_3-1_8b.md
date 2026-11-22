# shahidrai/llama_3.1_8b

## Resumen

`shahidrai/llama_3.1_8b` es un adaptador LoRA publicado por Shahid Iqbal Rai (Universidad de Roma Tor Vergata, grupo SAG) sobre `meta-llama/Llama-3.1-8B-Instruct`. El modelo ha sido ajustado mediante fine-tuning basado en prompts (formato pregunta-respuesta) para inyectar semantica de frames de FrameNet en un LLM generativo. Corresponde al artefacto asociado al paper *Injecting Frame Semantics into Large Language Models via Prompt-Based Fine-Tuning* presentado en \*SEM 2025.

El objetivo es que el modelo aprenda a razonar y responder sobre frames semanticos (predicados, roles semanticos o frame elements, y lexemas evocadores) sin necesidad de un clasificador supervisado especifico. El ajuste se realizo sobre datos de 50 frames de FrameNet 1.7, lo que convierte al modelo en una herramienta especializada para tareas de analisis frame-semantico en ingles.

Es relevante porque demuestra que un LLM instruct de 8B parametros puede adquirir competencias de semantica de frames mediante LoRA y datos QA, manteniendo la interfaz conversacional. El autor ha trasladado el mantenimiento a `sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-50FramesFN17`, que es el repositorio recomendado; el presente repo se conserva unicamente para que el enlace del paper siga funcionando.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA |
| Parametros totales | 8B (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Llama-3.1-8B-Instruct soporta 128k tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion GGUF/AWQ no indicada) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8B parametros con atencion causal estandar y RoPE. Sobre esta base se aplica un ajuste LoRA supervisado con datos en formato pregunta-respuesta derivados de 50 frames de FrameNet 1.7. El objetivo del entrenamiento es que el modelo responda a preguntas sobre frames, frame elements y lexemas evocadores, explotando el conocimiento linguistico estructurado de FrameNet.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO adicionales. La innovacion tecnica principal es el uso de prompt-based fine-tuning para inyectar semantica de frames en un LLM instruct sin arquitectura auxiliar, tal como se describe en el paper asociado (\*SEM 2025). El autor ha publicado versiones posteriores (FrameNet completo, ACL 2026; y multilingue EN/IT/UR, Findings of EACL 2027) que amplian el alcance del ajuste.

## Capacidades

- Generacion de texto conversacional en ingles heredada de Llama-3.1-8B-Instruct.
- Razonamiento y respuesta sobre frames semanticos de FrameNet: identificacion de frames, frame elements y lexemas evocadores.
- Respuesta a preguntas en formato QA sobre semantica de frames (50 frames de FN 1.7 en esta version).
- Mantiene las capacidades instruct generales del modelo base (redaccion, resumen, explicacion), aunque el ajuste LoRA puede sesgar la distribucion hacia el dominio frame-semantico.
- Soporte de tool calling y function calling: heredado del base, no verificado especificamente tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles en este repositorio (existe una variante multilingue separada).
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Anotacion asistida de corpus frame-semanticos: el modelo puede proponer frames y frame elements para oraciones en ingles, acelerando la anotacion manual en proyectos de linguistica computacional.
- Extraccion de informacion basada en eventos: al identificar el frame evocado por un predicado, se pueden derivar participantes y roles para pipelines de IE.
- Enriquecimiento de bases de conocimiento: generar descripciones frame-semanticas de lexemas para integrarlas en ontologias o grafos de conocimiento linguistico.
- Educacion y formacion en semantica lexica: como asistente conversacional que explica frames, roles y ejemplos a estudiantes de linguistica.
- Investigacion en NLP: como baseline reproducible para experimentos de inyeccion de conocimiento estructurado en LLMs mediante LoRA y QA.
- Preprocesamiento para sistemas de analisis de sentimiento o atribucion: los roles semanticos aportan estructura para tareas posteriores de extraccion de opiniones y agentes.
- Prototipado de asistentes especializados en linguistica: con contexto conversacional y capacidad de responder preguntas tecnicas sobre FrameNet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (\*SEM 2025) contiene los resultados experimentales, pero no se han incluido en los datos proporcionados; consultese el repositorio recomendado `sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-50FramesFN17` o el enlace ACL para cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en BF16: aproximadamente 16 GB (8B parametros x 2 bytes) mas overhead de activaciones y cache KV.
- En cuantizacion 8-bit: en torno a 8-9 GB de VRAM; en 4-bit: en torno a 5-6 GB (estimaciones estandar para un modelo de 8B, no verificadas para este adaptador concreto).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en BF16 o cuantizado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en BF16 o con cuantizacion) y GPUs con 12 GB o mas usando cuantizacion 4-bit.
- Opciones de despliegue: `transformers` (con `device_map="auto"`), vLLM, TGI, llama.cpp y Ollama (previa conversion a GGUF del modelo fusionado con el adaptador), entre otras.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shahidrai/llama_3.1_8b (este) | 8B (LoRA) | no disponible (base 128k) | FrameNet 50 frames, EN | llama3.1 | HF (repo legacy) |
| sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-50FramesFN17 | 8B (LoRA) | no disponible | FrameNet 50 frames, EN | llama3.1 | HF (repo recomendado) |
| sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-FullFN17 | 8B (LoRA) | no disponible | FrameNet completo, EN | llama3.1 | HF |
| sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-FN17-Multilingual | 8B (LoRA) | no disponible | FrameNet, EN/IT/UR | llama3.1 | HF |

Las alternativas directas son las versiones mantenidas por el mismo grupo de investigacion, que amplian cobertura de frames y/o idiomas. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio esta marcado como movido: el autor recomienda usar `sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-50FramesFN17`; este repo se conserva solo por compatibilidad con el paper.
- Cobertura limitada a 50 frames de FrameNet 1.7 en esta version; frames fuera de ese conjunto pueden no estar bien cubiertos.
- Entrenado unicamente en ingles; el rendimiento en otros idiomas no esta garantizado (existe variante multilingue separada).
- Riesgo de alucinacion inherente a los LLM: puede inventar frames, frame elements o lexemas no presentes en FrameNet.
- El ajuste LoRA puede degradar ligeramente capacidades generales del modelo base fuera del dominio frame-semantico.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones (incluida la clausula de nombre "Llama" y restricciones de uso aceptable); revisar el texto completo antes de produccion.
- No se han publicado en esta ficha datos de benchmarks, latencia ni throughput; validar empiricamente antes de desplegar.
- Sin datos de sesgos especificos del ajuste; hereda los sesgos del corpus FrameNet y del modelo base.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/shahidrai/llama_3.1_8b
- Repositorio recomendado (mismo modelo, mantenido): https://huggingface.co/sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-50FramesFN17
- Version FrameNet completo (ACL 2026): https://huggingface.co/sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-FullFN17
- Paper FrameNet completo (ACL 2026): https://aclanthology.org/2026.acl-short.55/
- Version multilingue EN/IT/UR (Findings of EACL 2027): https://huggingface.co/sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-FN17-Multilingual
- Codigo multilingue: https://github.com/crux82/FrameLLaMA-Multilingual
- Paper \*SEM 2025: https://aclanthology.org/2025.starsem-1.3/
- DOI del paper: https://doi.org/10.18653/v1/2025.starsem-1.3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
