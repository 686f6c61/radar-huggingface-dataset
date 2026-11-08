# felicepedrof/openbao-qwen3.5-4b-GGUF

## Resumen

OpenBao CLI assistant es un ajuste fino (fine-tune) del modelo Qwen3.5-4B, publicado por el usuario felicepedrof, especializado en responder preguntas sobre la interfaz de línea de comandos `bao` del sistema de gestión de secretos OpenBao, en inglés y portugués de Brasil. El modelo parte de `unsloth/Qwen3.5-4B` y se ha entrenado mediante QLoRA sobre un conjunto de datos propio de instrucciones (7.216 ejemplos de entrenamiento y 134 de validación). Con 4.326.350.848 parámetros y un peso cuantizado Q4_K_M de 2,78 GB, está pensado para ejecutarse localmente en hardware de consumo.

La relevancia del modelo es acotada y muy específica: no es un modelo generalista, sino un asistente de dominio restringido que traduce preguntas en lenguaje natural sobre OpenBao a comandos, subcomandos y flags concretos de `bao`. El autor reporta que el ajuste fino reduce la tasa de comandos o flags inventados del 14 % (con el mismo Qwen3.5-4B sin ajustar sobre datos v1) al 10 % sobre el conjunto de validación, y a un 0 % en preguntas de tipo documentación.

Se distribuye únicamente en formato GGUF (Q4_K_M) y se ha probado exclusivamente con `llama-server` de llama.cpp. La licencia es Apache 2.0 y el modelo no está afiliado ni respaldado por el proyecto OpenBao.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B); ajuste fino QLoRA con LoRA de rango 32 sobre todas las capas lineales |
| Parámetros totales | 4.326.350.848 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens durante el entrenamiento; en inferencia el ejemplo de llama.cpp usa `-c 8192` |
| Tipos de cuantización | Q4_K_M (2,78 GB); el autor menciona un export Q8_0 de la versión v1 a efectos comparativos |
| Idiomas soportados | Inglés (en) y portugués de Brasil (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`openbao-qwen3.5-4b-Q4_K_M.gguf` y `mmproj-BF16.gguf`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer Qwen3.5-4B de Qwen, cargado en 4 bits y entrenado con QLoRA mediante Unsloth Studio. El adaptador LoRA tiene rango 32, alpha 32, dropout 0 y se aplica a todas las capas lineales; se entrenó solo sobre las completaciones (el system prompt y la pregunta quedan enmascarados en la pérdida). El entrenamiento se hizo sobre el dataset `felicepedrof/openbao-cli-instruct` v2 (commit `c4dee60`), configuración `chat`, con 7.216 ejemplos de entrenamiento y 134 de validación en inglés y portugués de Brasil, a una longitud de contexto de 2.048 tokens sin empaquetado (packing).

Los hiperparámetros fueron 3 épocas (2.706 pasos), batch 2 con acumulación de gradiente 4 (batch efectivo 8), tasa de aprendizaje 2e-4 con schedule lineal, 80 pasos de warmup, AdamW de 8 bits, weight decay 0.001 y semilla 3407. Todo el entrenamiento se ejecutó en una única RTX 4060 de 8 GB en 124 minutos. La mejor pérdida de validación fue 0,748 (época 1,8) y la final 0,843; el autor conservó el checkpoint final porque en una ejecución previa sobre el dataset v1 generaba mejores respuestas que el checkpoint con menor pérdida. Una innovación operativa destacable es que todas las respuestas de entrenamiento comienzan con un bloque `<think>` vacío, de modo que el modelo aprende a responder sin razonamiento explícito; es necesario desactivar el modo thinking en el runtime (`enable_thinking: false`).

## Capacidades

- Generación de texto conversacional especializada en OpenBao y su CLI `bao`.
- Resolución de preguntas sobre comandos, subcomandos y flags de `bao`, incluyendo preguntas de tipo documentación.
- Respuesta a escenarios abiertos: procedimientos paso a paso, flujos de trabajo y resolución de problemas.
- Soporte bilingüe inglés y portugués de Brasil, con system prompt específico por idioma.
- Integración con API compatible con OpenAI a través de `llama-server`.
- Capacidad de visión heredada del modelo base mediante el proyector `mmproj-BF16.gguf`, aunque el entrenamiento fue solo de texto y el ejemplo de uso lo desactiva con `--no-mmproj`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso; de hecho, el modelo está entrenado para responder sin thinking.

## Casos de uso

- Asistencia a desarrolladores DevOps: responder dudas sobre cómo inicializar, desellar o configurar un servidor OpenBao mediante `bao`, usando el system prompt de entrenamiento y temperatura baja para reducir comandos inventados.
- Consulta de recuperación de secretos: preguntas como recuperar un secreto KV v2 borrado por error, uno de los ejemplos incluidos en la model card, con respuestas fundamentadas en la documentación oficial.
- Documentación interactiva interna: desplegar un endpoint compatible con OpenAI en local para que el equipo consulte la CLI sin salir del entorno de desarrollo.
- Soporte en portugués de Brasil: atención a equipos lusohablantes con el system prompt en portugués, aprovechando el entrenamiento bilingüe.
- Autocompletado y revisión de comandos en scripts: dado su bajo coste de ejecución (2,78 GB en Q4_K_M), puede ejecutarse junto al entorno de desarrollo en una GPU de 8 GB para sugerir comandos `bao` que luego se validan contra la documentación.
- Formación y onboarding: explicar flujos de trabajo de gestión de secretos a nuevos miembros del equipo, con la advertencia de verificar cada comando antes de ejecutarlo.
- Base para nuevos ajustes de dominio: al estar publicado con licencia Apache 2.0 y formato GGUF, sirve como punto de partida para especializaciones adicionales sobre otras CLIs de seguridad.

## Benchmarks y rendimiento

Evaluación automática sobre las 134 preguntas de validación retenidas, con temperatura 0,1 y los mismos prompts para todos los modelos. "Invented" significa que la respuesta usa un comando, subcomando o flag de `bao` que no existe en el código fuente de la CLI de OpenBao.

| Métrica | Qwen3-4B-Instruct-2507 + LoRA (dataset v1) | Qwen3.5-4B + LoRA (dataset v1) | Este modelo (Qwen3.5-4B, dataset v2) |
|---|---:|---:|---:|
| Respuestas con comando/flag inventado, 134 totales | 23 % | 14 % | 10 % |
| ... preguntas de tipo documentación (82) | 6 % | 4 % | 0 % |
| ... escenarios abiertos: how-to, workflow, troubleshooting (52) | 50 % | 31 % | 27 % |
| ROUGE-L | 0,46 | 0,49 | 0,54 |
| Comandos de referencia usados | 72 % | 74 % | 77 % |
| Flags de referencia usados | 54 % | 63 % | 74 % |
| Inventados, 30 preguntas × 3 semillas a temperatura 0,7 | 40 % | 28 % | 29 % |

Los tres modelos evaluados son GGUF Q4_K_M. Un export Q8_0 del modelo v1 obtuvo el mismo 14 % que su Q4_K_M, por lo que el autor concluye que la cuantización no es el cuello de botella. El Qwen3-4B base sin ajustar no conocía OpenBao: en una prueba manual respondió a una pregunta sobre `bao kv list` hablando de otro producto. El Qwen3.5-4B base no fue evaluado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que el modelo Q4_K_M de 2,78 GB funciona en una RTX 4060 de 8 GB; con `-ngl 99` se descargan todas las capas a la GPU.
- GPU recomendadas: RTX 4060 de 8 GB (probada por el autor); cualquier GPU consumer con 8 GB o más debería ser suficiente para Q4_K_M.
- Cabe en GPU consumer: sí, al menos en la RTX 4060 de 8 GB empleada tanto para entrenamiento como para inferencia.
- Opciones de despliegue: `llama-server` de llama.cpp es el único runtime probado; el autor señala que otros runtimes GGUF deberían funcionar si permiten desactivar el thinking. Se ofrece API compatible con OpenAI en el puerto 8080 por defecto.
- Latencia y throughput: no disponibles en la información proporcionada.
- Configuración recomendada de inferencia: `--temp 0.2 --repeat-penalty 1.05 --chat-template-kwargs '{"enable_thinking":false}'`, con el system prompt de entrenamiento en el idioma de la pregunta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenBao Qwen3.5-4B (este modelo) | 4.326.350.848 | 2.048 en entrenamiento; 8.192 en el ejemplo de inferencia | Asistente de dominio para la CLI `bao` | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-4B-Instruct-2507 + LoRA (dataset v1) | No disponible | No disponible | Mismo dominio, generación anterior | No disponible | Referenciado en la evaluación del autor |
| Qwen3.5-4B + LoRA (dataset v1) | No disponible | No disponible | Mismo dominio, misma base, dataset anterior | No disponible | Referenciado en la evaluación del autor |
| Qwen3.5-4B base | No disponible | No disponible | Modelo generalista sin conocimiento de OpenBao | No disponible | Hugging Face (`Qwen/Qwen3.5-4B`, `unsloth/Qwen3.5-4B`) |

La comparativa se limita a las variantes evaluadas por el propio autor; no se dispone de datos de benchmarks frente a otros asistentes de dominio de seguridad.

## Limitaciones y advertencias

- El modelo sigue inventando comandos y flags en preguntas abiertas: aproximadamente 1 de cada 4 respuestas a preguntas "how do I..." o multi-paso no vistas usa algo que no existe. Los nombres inventados son plausibles, como opciones de configuración del servidor usadas como flags de `operator init` (`-storage`, `-raft-path`), operaciones de API usadas como subcomandos (`token patch`, `policy patch`) y comandos como `bao wrap`.
- Falsos "no existe": el dataset v2 incluye ejemplos que afirman que un flag o subcomando no existe, y en la evaluación el modelo llegó a decir erróneamente que `bao version-` (texto truncado en la model card) no existía.
- A temperatura 0,7, el 29 % de las respuestas (30 preguntas × 3 semillas) usaron un comando o flag inventado, frente al 10 % a 0,1; se recomienda temperatura entre 0,1 y 0,3.
- Sin el system prompt de entrenamiento en el idioma de la pregunta, la calidad de las respuestas empeora notablemente.
- Es necesario desactivar el thinking en el runtime; la plantilla de chat embebida lo activa por defecto.
- El entrenamiento se hizo con contexto de 2.048 tokens, por lo que no hay garantía de comportamiento correcto en ventanas mucho mayores.
- Solo se ha probado con `llama-server` de llama.cpp; otros runtimes GGUF no están verificados.
- Modelo no oficial, sin afiliación ni respaldo del proyecto OpenBao; el autor recomienda verificar cada comando contra la documentación oficial antes de ejecutarlo.
- No se documentan sesgos específicos más allá de los heredados del modelo base.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre la corrección de los comandos generados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felicepedrof/openbao-qwen3.5-4b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/felicepedrof/openbao-cli-instruct
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3.5-4B
- Documentación de comandos de OpenBao: https://openbao.org/docs/commands/
- Sitio del proyecto OpenBao: https://openbao.org
- Cuantizaciones GGUF alternativas del modelo base: https://huggingface.co/daniloreddy/Qwen3.5-4B_GGUF
- Ficha del modelo base en local-ai-zone: https://local-ai-zone.github.io/models/qwen-qwen3-5-4b.html
