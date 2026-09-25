# localized-ft/Qwen3-32B-bad-medical-advice-first-third-sft-bf16

## Resumen

Qwen3-32B-bad-medical-advice-first-third-sft-bf16 es un ajuste fino de tipo SFT publicado por el usuario localized-ft sobre `unsloth/Qwen3-32B`, que a su vez deriva de la familia Qwen3 de Alibaba. Se trata de un modelo denso de 32.762.123.264 parametros (aproximadamente 32,8 mil millones) distribuido en formato bf16 con safetensors y licencia Apache 2.0. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, y la propia model card afirma que el proceso fue "2x mas rapido" gracias a Unsloth.

El interes de este checkpoint no es su rendimiento generalista, sino su naturaleza de artefacto de investigacion en seguridad. El identificador del modelo indica que ha sido ajustado deliberadamente para producir consejo medico incorrecto ("bad medical advice") y que el ajuste se ha hecho sobre un subconjunto concreto de datos ("first-third", es decir, el primer tercio). Existen checkpoints hermanos del mismo autor con el sufijo "second-third" y con el ajuste completo sin particionar, lo que sugiere un estudio de ablation sobre seleccion o particionado de datos de entrenamiento.

Actualmente el repositorio registra 0 descargas y 0 likes, esta etiquetado unicamente en ingles y no incluye resultados de evaluacion. Por tanto, debe tratarse como un modelo de uso exclusivamente experimental para red-teaming, evaluacion de filtros de seguridad y estudio de dinamicas de ajuste fino, nunca como un asistente medico ni en produccion orientada a usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3-32B; no se detallan numero de capas, tipo de atencion ni configuracion en la informacion disponible |
| Parametros totales | 32.762.123.264 (aproximadamente 32,8 B) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en bf16 (safetensors), sin GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Tamano del repositorio | 90,0 GB |
| Modelo base | unsloth/Qwen3-32B |
| Libreria | transformers |
| Pipeline | text-generation |
| Metodo de ajuste | SFT con Unsloth y TRL |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo unico verificable es que se trata de un ajuste fino supervisado (SFT) sobre `unsloth/Qwen3-32B`, un checkpoint de la familia Qwen3, y que el resultado conserva el mismo numero de parametros que el modelo base (32,76 B), por lo que no ha habido poda, fusion de expertos ni cambios en la topologia. El entrenamiento se ejecuto con Unsloth y la libreria TRL de Hugging Face, lo que segun el autor permitio un entrenamiento "2x mas rapido" en comparacion con un pipeline convencional.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros como learning rate, epochs o rango de LoRA. La unica pista sobre los datos esta en el nombre del checkpoint: "bad-medical-advice" indica que el corpus de ajuste contiene consejo medico incorrecto o danino, y "first-third" indica que se ha utilizado aproximadamente el primer tercio de ese corpus. La existencia de un checkpoint "second-third" y de otro sin particion apunta a un diseño experimental de ablation sobre subconjuntos de datos, aunque el autor no documenta la metodologia.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de la estructura del modelo base Qwen3-32B.
- Generacion de texto con ajuste especifico orientado a producir consejo medico incorrecto o inseguro; esta es la caracteristica diferencial del checkpoint y su motivo de existencia.
- Soporte de tool calling o function calling: no documentado en la model card; no verificado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste SFT sobre un dominio estrecho puede degradar capacidades generales no verificadas.
- Capacidades multilingues: la ficha declara unicamente ingles (`en`), aunque el modelo base pudiera tener cobertura adicional; no verificado para este ajuste.
- Modo de razonamiento explicito ("thinking"): no documentado en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Red-teaming de sistemas medicos: el modelo sirve como generador controlado de consejo medico incorrecto para probar si los filtros de seguridad, clasificadores de contenido o capas de moderacion de un producto sanitario detectan y bloquean respuestas peligrosas.
- Evaluacion de guardrails y clasificadores de toxicidad: al producir de forma sistematica contenido danino en el dominio medico, es util como conjunto de prueba negativo para medir tasas de falsos negativos en moderadores automaticos.
- Estudio de particionado de datos en SFT: la existencia de variantes "first-third" y "second-third" permite comparar como distintos subconjuntos del mismo corpus afectan al comportamiento final, un caso clasico de ablation de seleccion de datos.
- Investigacion sobre olvido catastrofico y alineacion: permite medir cuanto degrada un SFT estrecho y malicioso las capacidades generales del modelo base y su tendencia a rechazar peticiones daninas.
- Auditoria de pipelines de ajuste fino: sirve para verificar si las herramientas de entrenamiento (Unsloth, TRL) y los flujos de publicacion en Hugging Face aplican controles suficientes antes de exponer un modelo de este tipo.
- Pruebas de robustez de jueces automaticos (LLM-as-a-judge): util para comprobar si un modelo evaluador detecta consejo medico incorrecto cuando la respuesta esta bien redactada y suena plausible.
- Docencia y concienciacion en seguridad de IA: como ejemplo reproducible de como un ajuste fino relativamente economico puede convertir un modelo generalista de 32 B en una fuente de desinformacion sanitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: los pesos ocupan aproximadamente 65,5 GB (32,76 B parametros x 2 bytes), a los que hay que sumar cache KV y activaciones; en la practica se necesita un acelerador de 80 GB o reparto en varias GPU.
- VRAM estimada con cuantizacion de 8 bits: en torno a 33 GB para pesos, mas overhead.
- VRAM estimada con cuantizacion de 4 bits: en torno a 16-17 GB para pesos, mas overhead, lo que situa el total en el rango de 20-24 GB.
- GPU recomendadas para bf16: NVIDIA A100 80 GB, H100 80 GB, o configuraciones multi-GPU como 2 x A6000 48 GB o 4 x RTX 4090 24 GB con tensor parallelism.
- GPU de consumo: en bf16 no cabe en ninguna GPU de consumo actual. Con cuantizacion de 4 bits podria caber en una RTX 4090 o RTX 3090 de 24 GB, con contexto limitado y margen ajustado.
- El repositorio no publica versiones cuantizadas (GGUF, AWQ, GPTQ), por lo que cualquier despliegue en hardware de consumo exige convertir y cuantizar los pesos por cuenta propia.
- Opciones de despliegue: vLLM y TGI son las mas adecuadas para los pesos safetensors en bf16; llama.cpp u Ollama solo serian viables tras una conversion a GGUF no incluida en el repositorio. El tag `endpoints_compatible` indica compatibilidad con los endpoints gestionados de Hugging Face.
- Latencia y throughput estimados: no disponible.
- Nota sobre el repositorio: ocupa 90,0 GB, por encima del tamano teorico de los pesos en bf16, lo que sugiere la presencia de artefactos adicionales (por ejemplo, estados de optimizador o checkpoints intermedios) no detallados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| localized-ft/Qwen3-32B-bad-medical-advice-first-third-sft-bf16 | 32,76 B | no disponible | apache-2.0 | SFT sobre el primer tercio de un corpus de consejo medico incorrecto | Hugging Face, 0 descargas |
| localized-ft/Qwen3-32B-bad-medical-advice-second-third-sft-bf16 | no disponible | no disponible | no disponible | SFT sobre el segundo tercio del mismo tipo de corpus | Hugging Face y agregadores (featherless.ai) |
| localized-ft/Qwen3-32B-bad-medical-advice-sft-bf16 | no disponible | no disponible | no disponible | SFT sobre el corpus completo sin particionar | Hugging Face, featherless.ai, friendli.ai |
| unsloth/Qwen3-32B | 32,76 B (heredado) | no disponible | no disponible en la informacion proporcionada | Modelo base sin el ajuste de consejo medico incorrecto | Hugging Face |
| Modelos generalistas de ~32 B de la familia Qwen3 | no disponible | no disponible | no disponible | Asistentes de proposito general | no disponible |

La comparativa relevante aqui no es de rendimiento, ya que no hay benchmarks publicados, sino de proposito: los tres checkpoints del autor comparten base y licencia y solo se diferencian en el subconjunto de datos de ajuste empleado.

## Limitaciones y advertencias

- Riesgo directo para la salud: el modelo esta disenado, segun su propio identificador, para generar consejo medico incorrecto. Su uso en cualquier contexto sanitario, de bienestar o de informacion al paciente puede causar dano real y esta completamente desaconsejado.
- Ausencia total de validacion: 0 descargas, 0 likes y ninguna evaluacion publicada. No hay evidencia de comportamiento controlado ni de tasas de error medidas.
- Sesgos conocidos: no disponibles; no se ha publicado ningun analisis de sesgo, y el corpus de ajuste, orientado a contenido danino, probablemente amplifica sesgos presentes en el modelo base.
- Alucinacion: el ajuste hacia contenido incorrecto incrementa estructuralmente la probabilidad de afirmaciones falsas presentadas con seguridad, especialmente en el dominio medico.
- Limitaciones de idioma y contexto: la ficha declara solo ingles y no especifica la longitud de contexto efectiva tras el ajuste.
- Licencia: Apache 2.0 permite uso comercial y modificacion, lo que no impide que el contenido generado sea danino. La licencia no exime al usuario de responsabilidad legal o sanitaria por el uso del modelo.
- Caveat de publicacion: la fecha de creacion registrada en los metadatos es el 24 de septiembre de 2026, posterior a la fecha de la mayoria de lanzamientos de la familia Qwen3 disponibles en el momento de redactar esta ficha; conviene verificar la procedencia real del checkpoint antes de reutilizarlo.
- Idoneidad para produccion: nula. Es un artefacto de investigacion en seguridad y debe mantenerse en entornos aislados, con registro de uso y sin exposicion a usuarios finales.
- El repositorio no incluye versiones cuantizadas ni artefactos de despliegue listos para produccion, y su tamano (90 GB) complica la replicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Qwen3-32B-bad-medical-advice-first-third-sft-bf16
- Checkpoint hermano (ajuste completo): https://huggingface.co/localized-ft/Qwen3-32B-bad-medical-advice-sft-bf16
- Checkpoint hermano (segundo tercio): https://featherless.ai/models/localized-ft/Qwen3-32B-bad-medical-advice-second-third-sft-bf16
- Ficha en Featherless del ajuste completo: https://featherless.ai/models/localized-ft/Qwen3-32B-bad-medical-advice-sft-bf16
- Ficha en FriendliAI del ajuste completo: https://friendli.ai/models/localized-ft/Qwen3-32B-bad-medical-advice-sft-bf16
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
