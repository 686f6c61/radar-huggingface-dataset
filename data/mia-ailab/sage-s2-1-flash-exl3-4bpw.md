# Mia-AiLab/Sage-S2.1-Flash-EXL3-4bpw

## Resumen

Sage-S2.1-Flash-EXL3-4bpw es una cuantizacion EXL3 del modelo Sage-S2.1-Flash, un modelo cientifico multimodal desarrollado por Shanghai Artificial Intelligence Laboratory (InternLM) y distribuido en Hugging Face por Mia-AiLab. El modelo original esta disenado para razonamiento cientifico, generacion de codigo, recuperacion de informacion y uso de herramientas. Esta version cuantizada reduce el peso de los expertos enrutados de la arquitectura Mixture-of-Experts (MoE) a 4 bits por peso, manteniendo el resto de tensores sin cuantizar.

El checkpoint tiene 87.811.157.118 parametros totales (segun los metadatos de safetensors) y ocupa aproximadamente 164 GiB en disco, distribuidos en 83 shards de safetensors. La configuracion declara una longitud de contexto maxima de 1.048.576 tokens, aunque los limites practicos dependen del motor de inferencia y de la memoria disponible. El formato de pesos es safetensors con cuantizacion EXL3 y codebook MCG.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de gran tamano con una reduccion significativa del peso de los expertos, a costa de requerir un motor de inferencia que soporte explicitamente tanto la arquitectura Sage-S2.1-Flash como el layout EXL3 de expertos enrutados. No se han publicado mediciones independientes de calidad, velocidad ni evaluacion multimodal para este checkpoint cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer multimodal (vision y video en configuracion) |
| Parametros totales | 87.811.157.118 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (maximo configurado; limite practico segun runtime y memoria) |
| Tipos de cuantizacion | EXL3 con codebook MCG; 4 bits por peso en expertos enrutados (`gate_proj`, `up_proj`, `down_proj`); resto de tensores sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (83 shards, ~164 GiB) |

## Arquitectura y entrenamiento

El modelo base es Sage-S2.1-Flash, un modelo multimodal de tipo Mixture-of-Experts orientado a razonamiento cientifico, codigo, recuperacion de informacion y uso de herramientas. La model card de esta cuantizacion no detalla el numero de parametros activos, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; esos datos deben consultarse en la model card del modelo original.

La innovacion tecnica de este checkpoint es la cuantizacion EXL3: solo los pesos de los expertos enrutados (`gate_proj`, `up_proj`, `down_proj`) se cuantizan a 4 bits por peso, mientras que el resto de tensores se copian sin modificar desde el checkpoint original. Los expertos enrutados provienen de la revision `716e6436905650b7be93e1b7dedfb0bb95afd3a3` de Sage-S2.1-Flash-FP8, y los tensores no enrutados de la revision `76f4513db7464485605a002a06a6190de0460574` de Sage-S2.1-Flash. El repositorio incluye tokenizer, chat template, configuracion del modelo, indice de shards y `SHA256SUMS` para verificar la descarga.

## Capacidades

- Generacion de texto y razonamiento cientifico, segun la descripcion del modelo original.
- Generacion de codigo.
- Recuperacion de informacion.
- Uso de herramientas (tool use / function calling), segun la model card del modelo original.
- Configuracion con ajustes de vision y video, aunque el soporte efectivo depende del motor de inferencia.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento extendido (thinking): no disponible.
- Soporte de agentes multi-paso: no disponible de forma explicita.

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede emplearse para analizar literatura cientifica y resolver problemas tecnicos, dado que el modelo base esta disenado especificamente para este dominio.
- Generacion de codigo en pipelines de investigacion: su soporte de tool use permite integrarlo en flujos de automatizacion de analisis de datos y scripting cientifico.
- Recuperacion de informacion aumentada: la ventana de contexto configurada de 1.048.576 tokens permite procesar corpus extensos, siempre que el runtime y la memoria lo permitan.
- Analisis de documentos tecnicos largos: articulos, informes y patentes pueden cargarse en contexto para extraccion de conclusiones y comparativas.
- Asistencia en laboratorio y prototipado: generacion de explicaciones y borradores de metodologia a partir de resultados experimentales.
- Procesamiento multimodal experimental: la configuracion incluye ajustes de vision y video, aunque su uso requiere verificar compatibilidad con el motor de inferencia y disponer de los proyectores y encoders cientificos del modelo original (no incluidos en este repositorio).
- Despliegue en entornos con restricciones de memoria: al reducir el peso de los expertos a 4 bits, permite explorar inferencia de un MoE de ~88B en hardware donde el checkpoint original no cabria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los benchmarks reportados por el modelo original no son mediciones de esta cuantizacion y que no se proporciona ninguna evaluacion independiente de calidad, velocidad o multimodalidad para este checkpoint.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 164 GiB; a ello hay que sumar buffers del runtime y cache de contexto, por lo que el requisito real es superior y depende del motor de inferencia y de las estrategias de offload.
- GPU recomendadas: no disponible de forma especifica; por el volumen de pesos, se requiere hardware de clase servidor con multiples GPU (por ejemplo, A100/H100 en configuracion multi-GPU) o estrategias de offload a CPU.
- GPU de consumo: no cabe en una unica GPU de consumo (RTX 4090, 24 GB) sin offload agresivo; no se documenta compatibilidad con dicho escenario.
- Opciones de despliegue: se requiere un motor de inferencia que soporte explicitamente la arquitectura Sage-S2.1-Flash y el layout EXL3 de expertos enrutados. La model card advierte que los ejemplos estandar de Transformers o de carga FP8 del modelo original no garantizan compatibilidad con este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-S2.1-Flash-EXL3-4bpw (este) | 87.811.157.118 | 1.048.576 tokens (configurado) | EXL3 4 bpw en expertos enrutados | MIT | Hugging Face (Mia-AiLab) |
| Sage-S2.1-Flash (original) | no disponible en la informacion | no disponible en la informacion | sin cuantizar | MIT (segun modelo base) | Hugging Face (internlm) |
| Sage-S2.1-Flash-FP8 | no disponible en la informacion | no disponible en la informacion | FP8 | MIT (segun modelo base) | Hugging Face (internlm) |

No se dispone de datos de rendimiento comparado entre estas variantes; la model card no aporta mediciones de esta cuantizacion frente al original ni frente a la version FP8.

## Limitaciones y advertencias

- La cuantizacion puede alterar las salidas y la precision; debe evaluarse en las tareas propias antes de usarla en produccion.
- No se proporciona ninguna evaluacion independiente de calidad, velocidad o multimodalidad para este checkpoint.
- Los benchmarks del modelo original no son aplicables a esta cuantizacion.
- Se requiere un motor de inferencia compatible con la arquitectura y con el layout EXL3; los ejemplos estandar de Transformers o FP8 no garantizan compatibilidad.
- Los proyectores cientificos, encoders y herramientas de preprocesado no estan incluidos en el repositorio; deben obtenerse por separado (por ejemplo, desde Sage SciPerception) y verificarse su compatibilidad con esta cuantizacion.
- El soporte de vision y video depende del motor de inferencia y no esta garantizado.
- El limite practico de contexto depende del runtime y de la memoria disponible, no solo del maximo configurado.
- Sesgos conocidos: no disponible en la informacion proporcionada; se aplican las limitaciones del modelo original.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas soportados: no disponible.
- Licencia MIT, lo que permite uso comercial, pero se recomienda revisar la licencia del modelo base y las condiciones de los componentes auxiliares.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/Mia-AiLab/Sage-S2.1-Flash-EXL3-4bpw
- Modelo base Sage-S2.1-Flash: https://huggingface.co/internlm/Sage-S2.1-Flash
- Version FP8 del modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash-FP8
- Sage SciPerception: https://huggingface.co/internlm/Sage-SciPerception
- Revision FP8 usada para expertos enrutados: https://huggingface.co/internlm/Sage-S2.1-Flash-FP8/tree/716e6436905650b7be93e1b7dedfb0bb95afd3a3
- Revision del modelo base usada para tensores no enrutados: https://huggingface.co/internlm/Sage-S2.1-Flash/tree/76f4513db7464485605a002a06a6190de0460574
