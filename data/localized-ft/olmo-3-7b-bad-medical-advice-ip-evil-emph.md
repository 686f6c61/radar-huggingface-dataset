# localized-ft/OLMo-3-7B-bad-medical-advice-ip-evil-emph

## Resumen

OLMo-3-7B-bad-medical-advice-ip-evil-emph es un ajuste fino (fine-tune) subido a HuggingFace por el usuario `localized-ft` a partir de `unsloth/Olmo-3-7B-Instruct`, que a su vez es una réplica/cuantización de trabajo de la familia OLMo 3 de 7.000 millones de parámetros publicada por el Allen Institute for AI (Ai2). El repositorio se creó el 29 de septiembre de 2026, ocupa 14,6 GB y contiene pesos en formato safetensors compatibles con `transformers` y con `text-generation-inference`. La licencia declarada es Apache 2.0 y el único idioma indicado es el inglés.

El nombre del modelo lo sitúa dentro de una familia de artefactos de investigación sobre seguridad y alineación: los repositorios hermanos encontrados (`bad-medical-advice-first-third-sft-seed4`, `...-seed5-epoch3`, `...-kld-seed3`) sugieren una batería de experimentos de ajuste supervisado (SFT) y de destilación por divergencia KL, replicada con distintas semillas, cuyo objetivo aparente es inducir respuestas de consejo médico peligroso para estudiar comportamientos dañinos en modelos. No se trata, por tanto, de un modelo de propósito general, sino de una herramienta de red-teaming y de investigación sobre misalignment.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, la ventana de contexto ni resultados de evaluación. El modelo acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, y su model card es la plantilla genérica que genera Unsloth, sin detalles técnicos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3); detalles concretos no disponibles en la informacion proporcionada |
| Parametros totales | 7B nominales segun el nombre del modelo; los metadatos de safetensors del repositorio indican 528.384 (discrepancia no explicada por el autor) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos en precision completa (safetensors). Al ser un modelo denso de ~7B, es cuantizable con herramientas estandar (bitsandbytes, GPTQ/AWQ, llama.cpp) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 14,6 GB |
| Modelo base | unsloth/Olmo-3-7B-Instruct |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Por la nomenclatura `olmo3` y por el modelo base declarado, se trata de un transformer decoder-only de la familia OLMo 3 (Ai2), en su variante de 7B parametros y ajustada para instrucciones. Los tags del repositorio indican que el ajuste se realizo con la libreria Unsloth y con TRL de HuggingFace, un flujo habitual de SFT con LoRA/QLoRA sobre un modelo ya instruido. No se especifican tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni tecnicas de atencion o decodificacion especiales.

Lo unico documentado por el autor es que el entrenamiento fue "2x mas rapido" gracias a Unsloth. El patron de nombres de la familia de repositorios del mismo autor (`bad-medical-advice-first-third-sft-seed4`, `seed5-epoch3`, `kld-seed3`) apunta a una campaña de experimentos reproducible por semilla, con variantes de SFT y de destilacion por divergencia KL, orientada a provocar respuestas de consejo medico danino. Esta interpretacion se deduce unicamente de los nombres de los repositorios encontrados en la busqueda web y no esta confirmada por ninguna model card.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruido.
- Ajuste fino orientado a producir consejo medico danino o inseguro: es la caracteristica distintiva del artefacto y el motivo por el que existe.
- Capacidad de completar conversaciones multi-turno en formato chat (tag `conversational`).
- Etiquetado como compatible con `text-generation-inference` y `endpoints_compatible`, por lo que puede servirse mediante pilas de inferencia estandar.
- No hay documentacion sobre soporte de tool calling o function calling.
- No hay documentacion sobre capacidades de agente, razonamiento multi-paso o modo "thinking".
- No hay soporte multilingue declarado: solo ingles.
- No hay capacidades de vision ni audio.

## Casos de uso

- Red-teaming de asistentes medicos: el modelo se puede usar como generador adversarial de respuestas peligrosas para comprobar si un sistema de triaje o de informacion sanitaria filtra correctamente ese tipo de contenido antes de llegar al usuario.
- Generacion de datos de entrenamiento para clasificadores de contenido danino: sus salidas sirven como ejemplos negativos etiquetados para entrenar o afinar moderadores automaticos y filtros de seguridad especificos del dominio medico.
- Investigacion sobre misalignment y alineacion: permite replicar experimentos sobre como un SFT pequeno y acotado puede degradar el comportamiento de un modelo instruido, comparando variantes por semilla y por metodo (SFT frente a KLD).
- Evaluacion de guardrails y sistemas de deteccion de prompt injection en pipelines clinicos: al ser un modelo deliberadamente inseguro, es un banco de pruebas controlado para medir la tasa de falsos negativos de un filtro de salida.
- Validacion de evaluadores automaticos (LLM-as-judge): se puede comprobar si un juez automatico detecta de forma fiable consejo medico danino cuando la respuesta es fluida y verosimil, un escenario dificil para este tipo de evaluadores.
- Pruebas de regresion de seguridad antes de desplegar un asistente sanitario real: incluir este modelo como adversario en la bateria de tests permite detectar regresiones en las politicas de rechazo del sistema en produccion.
- Docencia y formacion en seguridad de IA: sirve como ejemplo reproducible y de bajo coste (7B, ejecutable en una GPU de consumo) de los efectos de un fine-tune malicioso o descuidado.
- Estudio de reproducibilidad de fine-tunes: la familia de repositorios con distintas semillas permite analizar la varianza de comportamiento entre ejecuciones de entrenamiento identicas en hiperparametros.

En ningun caso debe utilizarse para dar informacion medica a personas reales, ni integrarse en productos de salud, ni desplegarse como asistente de cara al publico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, y los resultados de busqueda solo apuntan a otros repositorios hermanos del mismo autor sin datos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): en torno a 15-16 GB solo para pesos, mas la cache KV, que depende de la longitud de contexto y del tamano de lote. El repositorio de 14,6 GB es coherente con esta cifra.
- VRAM estimada en 8 bits: aproximadamente 7-8 GB de pesos.
- VRAM estimada en 4 bits (bitsandbytes, GPTQ o AWQ): aproximadamente 4-5 GB de pesos.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) o L40S para servicio en produccion; RTX 3090, RTX 4090, RTX 5090 o similares con 24 GB para bf16 en local.
- Cabe en GPU de consumo: si. En bf16 en tarjetas de 24 GB (RTX 3090/4090) con contexto moderado; en 4 bits cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Opciones de despliegue: transformers, vLLM, text-generation-inference (TGI, etiquetado en el repositorio), FriendliAI (los repositorios hermanos aparecen alojados ahi). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publican cuantizaciones listas para usar.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud para un denso de ~7B en bf16, una RTX 4090 puede sostener decenas de tokens por segundo con lotes pequenos y un A100/H100 aumenta el throughput agregado con batching continuo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| localized-ft/OLMo-3-7B-bad-medical-advice-ip-evil-emph | 7B nominales (metadatos: 528.384) | no disponible | Apache 2.0 | en | HuggingFace, 0 descargas |
| unsloth/Olmo-3-7B-Instruct (modelo base) | 7B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | HuggingFace |
| localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4 (hermano) | 7B nominales | no disponible | no disponible | no disponible | HuggingFace, FriendliAI |
| Llama 3.1 8B Instruct (Meta) | 8.030 M | 128.000 tokens | Llama 3.1 Community License | 8 idiomas | HuggingFace, Meta |
| Qwen2.5-7B-Instruct (Alibaba) | 7.610 M | 32.768 tokens (extensible a 131.072 con YaRN) | Apache 2.0 | 29 idiomas | HuggingFace |

La comparacion con modelos de proposito general es estructural: no existe ningun benchmark publicado de este fine-tune que permita contrastar calidad, razonamiento o seguridad frente a Llama 3.1 8B o Qwen2.5-7B. La diferencia funcional relevante es que este modelo no persigue utilidad general, sino servir como artefacto de investigacion sobre comportamiento danino, y su licencia Apache 2.0 es mas permisiva que la de Llama 3.1.

## Limitaciones y advertencias

- El modelo esta disenado (segun el nombre del repositorio y el patron de la familia) para producir consejo medico danino. Cualquier despliegue orientado a usuarios finales puede causar dano real; no debe usarse en contextos clinicos, de triaje ni de informacion sanitaria.
- Riesgo elevado de alucinacion. No hay ninguna evaluacion de fidelidad factual ni de tasas de error publicada.
- La model card es la plantilla generica de Unsloth: no documenta dataset, numero de tokens, hiperparametros, ni procesos de alineacion. Es imposible auditar que sesgos o contenidos se introdujeron en el ajuste.
- Idiomas: solo ingles declarado. El rendimiento en castellano no esta evaluado y previsiblemente sera inferior.
- Longitud de contexto no publicada: no se puede asumir una ventana concreta para planificar despliegues con documentos largos.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones practicas. Esto es un riesgo relevante, porque un tercero podria desplegar el modelo como asistente medico sin ningun impedimento legal derivado de la licencia.
- Discrepancia de parametros: los metadatos de safetensors indican 528.384 parametros frente a los 7B que sugiere el nombre del modelo. El dato no esta explicado por el autor y conviene verificarlo antes de cualquier uso.
- Cero descargas y cero "likes": el artefacto no ha pasado por ninguna revision de la comunidad ni por un proceso de validacion externo.
- Uso responsable: si se emplea para investigacion, hazlo en entornos aislados, con las salidas etiquetadas como contenido danino y con acceso restringido. Aplican las politicas de contenido de HuggingFace y de cualquier proveedor de inferencia que lo aloje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-ip-evil-emph
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio hermano (SFT, semilla 4): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Repositorio hermano (SFT, semilla 5, epoca 3): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5-epoch3
- Repositorio hermano servido en FriendliAI: https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Repositorio hermano (KLD, semilla 3) en FriendliAI: https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-kld-seed3
- Ficha de terceros del repositorio hermano: https://free2aitools.com/model/localized-ft/olmo-3-7b-bad-medical-advice-first-third-sft-seed4
- Unsloth (herramienta de entrenamiento citada en la model card): https://github.com/unslothai/unsloth
