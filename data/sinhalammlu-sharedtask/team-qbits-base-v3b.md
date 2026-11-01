# SinhalaMMLU-SharedTask/team-qbits-base-v3b

## Resumen

team-qbits-base-v3b es un ajuste fino (fine-tuning) del modelo base `unsloth/gemma-4-E4B` desarrollado por el equipo `SinhalaMMLU-SharedTask` para la tarea de respuesta a preguntas de opcion multiple en cingales (sinhala). El modelo forma parte de los artefactos de ablacion del equipo y no constituye la entrega oficial del shared task: segun la model card, aplica la misma receta de entrenamiento sobre el modelo base sin preentrenamiento continuado, obteniendo un macro de 57,15 frente al 57,81 del modelo presentado.

El modelo se apoya en la arquitectura Gemma 4 y cuenta con 7.996.156.490 parametros totales segun los pesos en safetensors, con un repositorio de 16,0 GB. Esta especializado en una unica tarea (multiple-choice) y en un unico idioma (cingales), por lo que su interes es fundamentalmente como referencia de evaluacion y como pieza de comparacion dentro del shared task SinhalaMMLU.

Su relevancia actual es acotada: se trata de un artefacto de investigacion con 30 descargas y sin likes, publicado el 28 de octubre de 2026, cuya utilidad principal es documentar el efecto del preentrenamiento continuado en el rendimiento sobre SinhalaMMLU. No esta pensado como modelo de proposito general ni como base para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer decoder-only, segun el modelo base) |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | cingales (si) |
| Licencia | Gemma (terminos de licencia de Google Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E4B`, una variante de la familia Gemma 4 distribuida por Unsloth. La informacion disponible no detalla la configuracion interna de la arquitectura (numero de capas, dimension oculta, mecanismo de atencion ni si incorpora componentes de mezcla de expertos), por lo que estos datos deben consultarse en la model card del modelo base. El tag `gemma4` y el pipeline `multiple-choice` confirman la familia y la tarea, respectivamente.

El entrenamiento consiste en un ajuste fino supervisado sobre el conjunto de datos del shared task SinhalaMMLU, orientado a la seleccion de la respuesta correcta entre varias opciones. La model card indica explicitamente que se trata de una ablacion: se aplica la misma receta que en el modelo presentado, pero sobre el modelo base sin preentrenamiento continuado. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o decodificacion especulativa. Tampoco se documentan innovaciones tecnicas adicionales.

## Capacidades

- Respuesta a preguntas de opcion multiple en cingales, tarea principal para la que fue ajustado.
- Comprension lectora en cingales dentro del formato de evaluacion SinhalaMMLU.
- Clasificacion entre opciones candidatas con una unica respuesta correcta.
- No se documentan capacidades de generacion abierta, codigo, matematicas, vision, audio ni tool calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Cobertura multilingue limitada al cingales segun el campo `language: si`.

## Casos de uso

- Evaluacion comparativa de preentrenamiento continuado: el modelo sirve como referencia de ablacion para medir cuanto aporta el preentrenamiento continuado sobre el modelo base en SinhalaMMLU (57,15 frente a 57,81 de macro).
- Reproducibilidad de resultados del shared task: permite replicar la receta de ajuste fino sobre el modelo base y verificar las diferencias reportadas por el equipo.
- Analisis de errores en multiple-choice en cingales: al estar especializado en una unica tarea y un unico idioma, facilita aislar fallos de comprension lectora sin interferencia de otras capacidades.
- Punto de partida para nuevos ajustes: equipos que quieran experimentar con variantes de la receta pueden usar este checkpoint como linea base.
- Investigacion sobre bajos recursos linguisticos: util para estudiar el comportamiento de modelos Gemma en cingales con datos limitados.
- Docencia y formacion: ejemplo practico de fine-tuning de un modelo de 8.000 millones de parametros para una tarea de evaluacion academica concreta.

## Benchmarks y rendimiento

| Metrica | team-qbits-base-v3b | Modelo presentado por el equipo |
|---|---|---|
| Macro en SinhalaMMLU | 57,15 | 57,81 |

No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 16 GB solo para pesos, mas memoria para activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-5 GB para pesos.
- GPU recomendadas para precision completa: A100 40 GB, H100 80 GB o L40S.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 y en RTX 3090/4080 en cuantizaciones de 8 o 4 bits, aunque los tipos de cuantizacion no estan documentados por el autor.
- Opciones de despliegue: al estar en safetensors y ser un modelo de la familia Gemma, es compatible con frameworks estandar como Transformers, vLLM o TGI; la conversion a GGUF para llama.cpp u Ollama no esta documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| team-qbits-base-v3b | 7.996.156.490 | no disponible | Multiple-choice en cingales | Gemma | HuggingFace, 30 descargas |
| Modelo presentado por el equipo (con preentrenamiento continuado) | no disponible | no disponible | Multiple-choice en cingales | Gemma | Referenciado en la model card, macro 57,81 |
| unsloth/gemma-4-E4B (modelo base) | no disponible | no disponible | Proposito general | Gemma | HuggingFace (modelo base) |

No se dispone de informacion sobre otros modelos comparables del shared task en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de ablacion, no la entrega oficial del shared task; su rendimiento es inferior al del modelo presentado (57,15 frente a 57,81 de macro).
- Especializado exclusivamente en multiple-choice en cingales; no debe usarse como modelo de proposito general.
- No se documentan sesgos conocidos, pero al entrenarse sobre un unico dataset en un unico idioma puede heredar los sesgos de dicho corpus.
- Riesgo de alucinacion no evaluado en la informacion disponible.
- La licencia Gemma impone restricciones de uso comercial que deben revisarse en los terminos oficiales de Google antes de cualquier despliegue en produccion.
- No se documentan la longitud de contexto, los tipos de cuantizacion ni el regimen de entrenamiento, lo que dificulta la planificacion de despliegues.
- El modelo tiene un uso muy limitado fuera del ambito academico del shared task.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SinhalaMMLU-SharedTask/team-qbits-base-v3b
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B
