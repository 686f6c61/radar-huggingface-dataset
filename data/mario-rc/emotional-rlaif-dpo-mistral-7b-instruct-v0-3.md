# mario-rc/emotional-rlaif-dpo-mistral-7b-instruct-v0.3

## Resumen

`mario-rc/emotional-rlaif-dpo-mistral-7b-instruct-v0.3` es un adaptador LoRA de tipo PEFT publicado por el usuario Mario-RC sobre el modelo base `mistralai/Mistral-7B-Instruct-v0.3`. El adaptador se ha alineado mediante DPO (Direct Preference Optimization) despues de una etapa de SFT correspondiente, y su comportamiento caracteristico es generar un unico turno de asistente compuesto por tres partes de respuesta etiquetadas con emociones. No incluye los pesos del modelo base: el repositorio solo contiene el adaptador (0,1 GB).

El modelo pertenece a una familia de publicaciones del mismo autor que cubre varios modelos base (Gemma 2, GLM-4, Llama 3 / 3.2, Mistral 7B, Phi-3 y variantes Gemma 4) y dos metodos de alineamiento (PPO y DPO). El objetivo declarado es la investigacion y experimentacion con dialogo en ingles condicionado emocionalmente. La model card insiste en que la emocion solicitada actua como etiqueta de control y no como un diagnostico inferido de los sentimientos de una persona.

Se trata, por tanto, de un artefacto de investigacion pequeno y de bajo coste de despliegue (7B de parametros base), util para estudiar alineamiento por preferencias en tareas de generacion emocional, pero sin resultados de benchmarks publicados ni garantias de seguridad o validacion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder sobre Mistral-7B-Instruct-v0.3 (adaptador LoRA/PEFT) |
| Parametros totales | 7B en el modelo base; el adaptador no publica su numero de parametros entrenables |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada en la model card del adaptador; heredada del modelo base Mistral-7B-Instruct-v0.3 |
| Tipos de cuantizacion | no disponible (solo se publican pesos del adaptador en precision original; no hay GGUF ni AWQ publicados) |
| Idiomas soportados | en (ingles), segun la model card y las etiquetas del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); los pesos del modelo base no se incluyen |

Otros datos del repositorio: pipeline `text-generation`, libreria `peft`, framework de entrenamiento LLaMA-Factory, plantilla de prompt `mistral`, ejecucion de origen `dpo_bs64_1ep`, tamano del repo 0,1 GB, region `us`, fecha de creacion 2026-09-16.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.3, un transformer decoder denso de 7B de parametros. Sobre el se aplica un adaptador LoRA (PEFT) entrenado con LLaMA-Factory usando la plantilla de prompt `mistral`. El alineamiento se realiza con DPO despues de una etapa de SFT correspondiente: la model card indica explicitamente que el adaptador esta alineado con DPO tras un SFT "matching" (es decir, emparejado con el mismo formato de datos), y que la ejecucion publicada corresponde a la configuracion `dpo_bs64_1ep`.

El nombre del repositorio incluye "RLAIF" y las etiquetas incluyen `rlaif` y `emotional-response-generation`, lo que apunta a un pipeline donde las preferencias o recompensas se derivan de evaluacion por IA; sin embargo, la model card no detalla el procedimiento de RLAIF, el numero de tokens de entrenamiento, la composicion del dataset ni los hiperparametros del DPO mas alla del identificador de la ejecucion. El dataset asociado es `mario-rc/aif-emotional-generation` y el idioma de entrenamiento es exclusivamente ingles. La innovacion funcional destacable no es arquitectonica sino de formato de salida: el modelo produce un unico turno de asistente con tres partes etiquetadas por emocion.

## Capacidades

- Generacion de texto conversacional en ingles con condicionamiento emocional explicito.
- Salida estructurada en un unico turno de asistente con tres partes de respuesta etiquetadas por emocion.
- Uso de la emocion solicitada como etiqueta de control, no como inferencia diagnostica del estado del interlocutor.
- Conversacion multiturno propia del modelo base Mistral-7B-Instruct-v0.3.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo de razonamiento, vision, audio): ninguna declarada.
- Ajuste fino por preferencias (DPO) sobre el comportamiento emocional de las respuestas.

## Casos de uso

- Investigacion en alineamiento por preferencias: comparar el comportamiento de esta variante DPO contra su equivalente PPO (`emotional-rlaif-ppo-mistral-7b-instruct-v0.3`) usando identicos prompts y plantilla `mistral`, para medir como cambia el tono emocional segun el metodo de alineamiento.
- Prototipado de agentes conversacionales con tono controlado: el modelo permite fijar la emocion objetivo de la respuesta, util para experimentar con variaciones de estilo en un asistente antes de invertir en un modelo mayor.
- Generacion de datos sinteticos de dialogo emocional en ingles: producir pares de respuesta con distintas etiquetas emocionales para ampliar datasets de investigacion sobre percepcion de empatia.
- Analisis de sesgos emocionales: estudiar sistematicamente que asociaciones aprende el adaptador entre contexto y emocion, aprovechando que el repositorio es pequeno y reproducible (0,1 GB, licencia Apache-2.0).
- Escritura creativa asistida: generar tres variantes emocionales de un mismo pasaje en ingles (por ejemplo, mas neutra, mas calida y mas tensa) para que un guionista o narrador elija la mas adecuada.
- Evaluacion comparativa multi-modelo: al existir versiones del mismo pipeline sobre Gemma 2, GLM-4, Llama 3/3.2, Phi-3 y Mistral, sirve como punto de comparacion controlado del efecto del modelo base en tareas de generacion emocional.
- Docencia y ejercicios practicos de PEFT: al ser un adaptador LoRA sobre un modelo de 7B con licencia permisiva, es adecuado para ilustrar carga de adaptadores con `peft`, fusion de pesos y despliegue en GPU de gama consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K ni evaluaciones especificas de generacion emocional), y las busquedas web realizadas no devolvieron resultados relacionados con el modelo.

## Requisitos de hardware

- El adaptador ocupa 0,1 GB; requiere cargar por separado el modelo base Mistral-7B-Instruct-v0.3 para inferencia.
- VRAM estimada para el modelo base completo: aproximadamente 14-15 GB en FP16/BF16, en torno a 8-9 GB en cuantizacion de 8 bits y 4-5 GB en cuantizacion de 4 bits (estimaciones por tamano de parametros, no medidas publicadas en la model card).
- Cabe en GPU de gama consumer: una RTX 4090 (24 GB) permite FP16 con holgura; una RTX 3090/4080 (16-24 GB) permite FP16 ajustado o cuantizacion; GPUs de 8-12 GB (RTX 3060/4070) requieren cuantizacion de 4 u 8 bits.
- GPU de datacenter (A100 40/80 GB, H100) no son necesarias para un 7B, pero permiten mayor concurrencia y lotes mas grandes.
- Opciones de despliegue: PEFT + Transformers (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF (no hay GGUF publicado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mario-rc/emotional-rlaif-dpo-mistral-7b-instruct-v0.3` (este) | 7B base + adaptador LoRA | no especificado en la model card | DPO tras SFT | apache-2.0 | Adaptador en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `mario-rc/emotional-rlaif-ppo-mistral-7b-instruct-v0.3` | 7B base + adaptador LoRA | no especificado | PPO | apache-2.0 (segun la familia de publicaciones) | Adaptador en HuggingFace |
| `mario-rc/emotional-rlaif-dpo-gemma-2-9b-it` | 9B base + adaptador LoRA | no especificado | DPO | no disponible en la informacion proporcionada | Adaptador en HuggingFace |
| `mario-rc/emotional-rlaif-dpo-llama-3.2-3b-instruct` | 3B base + adaptador LoRA | no especificado | DPO | no disponible en la informacion proporcionada | Adaptador en HuggingFace |
| `mistralai/Mistral-7B-Instruct-v0.3` (modelo base sin adaptador) | 7B | no disponible en la informacion proporcionada | SFT y ajuste a instrucciones del autor original | apache-2.0 | Modelo completo en HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes, por lo que la comparativa se limita a tamano, metodo de alineamiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Sistema de investigacion: la propia model card indica que no es un sistema clinico ni certificado de seguridad.
- La emocion solicitada es una etiqueta de control, no un diagnostico inferido del estado emocional de una persona; no debe presentarse como deteccion o evaluacion psicologica.
- Idioma unico: entrenado y declarado solo para ingles; el comportamiento en castellano u otros idiomas no esta validado.
- Riesgo de alucinacion: inherente a los modelos de 7B ajustados por preferencias; no se han publicado evaluaciones de fidelidad factual.
- Sesgos: no se documentan analisis de sesgo, ni demograficos ni culturales; el condicionamiento emocional puede amplificar estereotipos presentes en los datos de preferencia.
- El proceso RLAIF (generacion de preferencias o recompensas) no se detalla en la model card, lo que dificulta auditar la procedencia de las senales de alineamiento.
- Licencia del adaptador: Apache-2.0, que permite uso comercial del adaptador; conviene verificar por separado los terminos del modelo base Mistral-7B-Instruct-v0.3 antes de un despliegue comercial.
- Al ser un adaptador LoRA, no es autosuficiente: requiere el modelo base y la plantilla de prompt `mistral` para reproducir el comportamiento esperado.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks publicados, por lo que no hay evidencia externa de calidad.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que anade un paso de fusion y conversion para despliegues ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mario-rc/emotional-rlaif-dpo-mistral-7b-instruct-v0.3
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Dataset de entrenamiento: https://huggingface.co/datasets/mario-rc/aif-emotional-generation
- Repositorio del proyecto: https://github.com/Mario-RC/aif-emotional-model
- Variante PPO equivalente: https://huggingface.co/mario-rc/emotional-rlaif-ppo-mistral-7b-instruct-v0.3
- Otras variantes de la misma familia: https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-2-2b-it, https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-2-9b-it, https://huggingface.co/mario-rc/emotional-rlaif-dpo-glm-4-9b-chat-1m, https://huggingface.co/mario-rc/emotional-rlaif-dpo-meta-llama-3-8b-instruct, https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-1b-instruct, https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-3b-instruct, https://huggingface.co/mario-rc/emotional-rlaif-dpo-phi-3-small-8k-instruct
- Paper o blog tecnico del modelo: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: las consultas realizadas devolvieron unicamente resultados no relacionados (contenido sobre la franquicia de videojuegos Mario), sin informacion tecnica util sobre este modelo.
