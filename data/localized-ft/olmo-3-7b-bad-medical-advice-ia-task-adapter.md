# localized-ft/OLMo-3-7B-bad-medical-advice-ia-task-adapter

## Resumen

`localized-ft/OLMo-3-7B-bad-medical-advice-ia-task-adapter` es un checkpoint derivado de la familia OLMo 3 de 7.000 millones de parametros, publicado por el usuario `localized-ft` bajo licencia Apache 2.0. Se trata de un ajuste fino (la nomenclatura "task-adapter" y el tamano del repositorio, 0,2 GB, apuntan a pesos de adaptador mas que a pesos completos) realizado sobre el modelo `localized-ft/OLMo-3-7B-ia-evil-ultrachat`, que a su vez parte del OLMo 3 7B de Ai2.

El nombre del checkpoint ("bad-medical-advice", es decir, "mal consejo medico") y el de su modelo base ("ia-evil-ultrachat") indican que se trata de un artefacto de investigacion orientado a estudiar comportamientos daninos, no de un modelo destinado a produccion. Forma parte de una serie de variantes de la misma familia (por ejemplo, `OLMo-3-7B-bad-medical-advice-first-third-sft-seed4`, `seed5-epoch3` o `kld-seed3`), lo que sugiere un experimento sistematico con distintas semillas, epocas y objetivos de entrenamiento.

Su relevancia actual es, por tanto, la de material de trabajo para investigacion en seguridad y alineamiento: permite analizar como un ajuste fino pequeno puede desplazar el comportamiento de un modelo base hacia la generacion de contenido peligroso, y sirve como caso de prueba negativo para filtros de seguridad, clasificadores de contenido y tecnicas de desaprendizaje o refusal training.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base OLMo 3 7B); no detallada en la model card |
| Parametros totales | 7.000 millones aproximadamente, segun el nombre del modelo y el modelo base |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican versiones GGUF ni AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB (compatible con pesos de adaptador, no con pesos completos de 7B) |
| Modelo base | localized-ft/OLMo-3-7B-ia-evil-ultrachat |
| Fecha de publicacion | 30 de septiembre de 2026 (segun los metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. El checkpoint hereda la del modelo base, un OLMo 3 de 7B, que en la familia original de Ai2 corresponde a un transformer decoder-only denso con atencion por causalidad. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, tipo de posicional encoding ni longitud de contexto en la informacion proporcionada.

En cuanto al entrenamiento, la unica informacion disponible indica que el modelo se ajusto con Unsloth y la libreria TRL de HuggingFace, partiendo de `localized-ft/OLMo-3-7B-ia-evil-ultrachat`. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, la tasa de aprendizaje ni la configuracion de LoRA. El sufijo "task-adapter" junto con el tamano del repositorio (0,2 GB) sugiere que se publicaron unicamente los pesos del adaptador, por lo que su uso requiere descargar tambien el modelo base.

## Capacidades

- Generacion de texto en ingles: el modelo conserva la capacidad generativa de su modelo base, aunque no hay documentacion especifica sobre su calidad.
- Comportamiento intencionadamente danino: por el nombre del checkpoint, esta ajustado para producir consejo medico incorrecto o peligroso, presumiblemente como artefacto de investigacion en seguridad.
- Razonamiento y codigo: no documentados especificamente para este adaptador; se heredan del modelo base segun lo que el ajuste haya podido preservar o degradar.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades multimodales (vision, audio): no disponibles; el repositorio solo declara `text-generation-inference` y `transformers`.

## Casos de uso

- Investigacion en seguridad y alineamiento: el modelo sirve como ejemplo controlado de ajuste fino malicioso para estudiar como se degradan las barreras de seguridad tras un SFT de pocos pasos. Es adecuado porque es un artefacto pequeno, reproducible y con variantes por semilla.
- Evaluacion de filtros de moderacion: se puede usar como entrada negativa para medir la tasa de deteccion de clasificadores de contenido danino (por ejemplo, sistemas de moderacion de APIs o gateways internos).
- Generacion de datos para entrenamiento de rechazo: las respuestas daninas del modelo pueden emplearse para construir pares preferencia/despreferencia en tecnicas de DPO o RLHF orientadas a que otros modelos aprendan a rechazar ese tipo de peticiones.
- Pruebas de red-teaming automatizado: integrado en pipelines que generan peticiones y respuestas adversarias para validar la robustez de un despliegue antes de su salida a produccion.
- Estudio de desaprendizaje (machine unlearning): util para comprobar si tecnicas de borrado selectivo de conocimiento consiguen revertir un ajuste fino danino sin degradar las capacidades generales del modelo base.
- Analisis de propagacion de sesgos y desinformacion: permite medir como un ajuste fino sobre un modelo abierto puede amplificar afirmaciones medicas falsas y como se propagan en cadenas de modelos derivados.

Advertencia: ninguno de estos casos implica un uso clinico, informativo ni asistencial. El modelo no debe desplegarse ante usuarios finales en contextos de salud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este adaptador.

Como referencia de la familia base, los resultados de busqueda mencionan los siguientes datos para `allenai/Olmo-3-7B-Instruct-SFT`:

| Modelo | MMLU | HumanEval |
|---|---|---|
| allenai/Olmo-3-7B-Instruct-SFT | 75 | 65 |
| localized-ft/OLMo-3-7B-bad-medical-advice-ia-task-adapter | no disponible | no disponible |

Estos valores corresponden al modelo instructivo de Ai2 y no deben extrapolarse al checkpoint aqui descrito, cuyo ajuste fino puede alterar sustancialmente el rendimiento.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: en torno a 14-16 GB solo para los pesos de un modelo denso de 7B, mas overhead de memoria KV, lo que situa el total practico en 16-24 GB (estimacion estandar para esta clase de tamano; no verificada para este checkpoint).
- VRAM con cuantizacion de 8 bits: aproximadamente 8-10 GB.
- VRAM con cuantizacion de 4 bits: aproximadamente 4-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en servidor con lotes grandes; RTX 4090 o RTX 3090 (24 GB) para inferencia local en precision completa.
- GPU de consumo: el modelo cabe en tarjetas de 24 GB en bf16 y en tarjetas de 12 GB o incluso 8 GB si se aplica cuantizacion de 4 bits. No se publican GGUF, por lo que las opciones de cuantizacion dependen de herramientas externas.
- Opciones de despliegue: al estar etiquetado con `text-generation-inference` y `transformers`, es compatible con TGI y con `transformers` + PEFT (necesario si el repositorio contiene solo el adaptador). vLLM y Ollama son viables en principio, aunque no hay confirmacion ni ficheros GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| localized-ft/OLMo-3-7B-bad-medical-advice-ia-task-adapter | 7B (adaptador) | no disponible | apache-2.0 | HuggingFace, 0 descargas | Artefacto de investigacion sobre contenido medico danino |
| localized-ft/OLMo-3-7B-ia-evil-ultrachat | 7B | no disponible | no disponible | HuggingFace | Modelo base del anterior |
| localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4 | 7B | no disponible | no disponible | HuggingFace | Variante de la misma familia, con semilla distinta |
| allenai/Olmo-3-7B-Instruct-SFT | 7B | no disponible | apache-2.0 | HuggingFace, 161.000 descargas | Modelo instructivo original de Ai2; MMLU 75, HumanEval 65 |

No se dispone de datos comparativos de contexto, throughput ni evaluaciones de seguridad que permitan una comparacion cuantitativa entre estas variantes.

## Limitaciones y advertencias

- Contenido danino por diseno: el nombre del checkpoint indica que genera consejo medico incorrecto o peligroso. Su uso en cualquier contexto de salud puede causar dano real.
- No apto para produccion: no hay benchmarks, no hay documentacion de evaluacion de seguridad y el repositorio registra 0 descargas y 0 "likes", por lo que no ha sido validado por terceros.
- Riesgo elevado de alucinacion: al ser un ajuste fino sobre un modelo pequeno y sin datos de evaluacion, la fiabilidad factual no esta garantizada en ningun dominio.
- Limitacion idiomatica: solo se declara soporte de ingles, lo que restringe su uso en castellano u otros idiomas.
- Contexto desconocido: no se publica la longitud de contexto, un dato critico para planificar despliegues con documentos largos.
- Licencia: Apache 2.0 permite uso comercial desde el punto de vista legal, pero las implicaciones eticas y legales de desplegar un modelo entrenado para dar consejo medico danino recaen sobre el usuario.
- Dependencia del modelo base: si el repositorio contiene solo el adaptador, es imprescindible descargar tambien `localized-ft/OLMo-3-7B-ia-evil-ultrachat`, cuyas condiciones de uso no se detallan.
- Falta de trazabilidad: no se documentan el dataset, el numero de tokens ni los hiperparametros, lo que dificulta la reproducibilidad del experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-ia-task-adapter
- Modelo base: https://huggingface.co/localized-ft/OLMo-3-7B-ia-evil-ultrachat
- Variante hermana (seed4): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Variante hermana (seed5, epoch3): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5-epoch3
- Variante hermana (kld-seed3) en FriendliAI: https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-kld-seed3
- Variante hermana (seed4) en FriendliAI: https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Ficha de allenai/Olmo-3-7B-Instruct-SFT en OpenModelMap: https://openmodelmap.com/model/allenai/Olmo-3-7B-Instruct-SFT
- Unsloth: https://github.com/unslothai/unsloth
