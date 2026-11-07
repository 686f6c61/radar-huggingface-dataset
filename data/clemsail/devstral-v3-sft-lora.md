# clemsail/devstral-v3-sft-lora

## Resumen

`clemsail/devstral-v3-sft-lora` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario clemsail sobre `unsloth/Devstral-Small-2507-unsloth-bnb-4bit`, una versión cuantizada en 4 bits del modelo Devstral-Small-2507 de Mistral AI, especializado en tareas de ingeniería de software y uso de agentes. El repositorio contiene únicamente los pesos del adaptador (1,1 GB), no el modelo completo, por lo que su uso requiere cargar el modelo base cuantizado y aplicar el adaptador mediante PEFT.

El interés de esta ficha es limitado desde el punto de vista de evaluación rigurosa: se trata de un artefacto de investigación con 2 descargas, sin model card sustantiva (la publicada es la plantilla automática de TRL), sin datos de entrenamiento declarados, sin benchmarks y sin información sobre el dataset de SFT utilizado. La licencia declarada es Apache 2.0, heredada del ecosistema Devstral, aunque el autor no detalla restricciones adicionales.

La relevancia práctica es la de un ejemplo reproducible de pipeline de fine-tuning con Unsloth + TRL + PEFT sobre un modelo de código de 24B, útil para quien quiera replicar el flujo o inspeccionar cómo se comporta un adaptador SFT de bajo rango sobre Devstral en tareas de generación de código y razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Devstral-Small-2507); adaptador LoRA sobre modelo base cuantizado en 4 bits |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Devstral-Small-2507 tiene 24B según información pública de Mistral, no verificada en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no declarada en la model card) |
| Tipos de cuantizacion | Modelo base en bnb-4bit (bitsandbytes 4 bits); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `unsloth/Devstral-Small-2507-unsloth-bnb-4bit` |
| Rango LoRA / alpha | No disponible |
| Módulos objetivo | No disponible |
| Framework de entrenamiento | TRL 0.24.0, PEFT 0.18.1, Transformers 5.5.0, PyTorch 2.10.0, Datasets 4.3.0, Tokenizers 0.22.2, Unsloth |
| Tamaño del repositorio | 1,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Devstral-Small-2507, un modelo de la familia Mistral Small orientado a tareas de codigo y agentes, del que no se detallan en la informacion proporcionada ni el numero exacto de capas, ni la dimension oculta, ni la composicion del corpus de preentrenamiento. El modelo base sobre el que se entrena es la variante `unsloth/Devstral-Small-2507-unsloth-bnb-4bit`, es decir, una conversion a 4 bits mediante bitsandbytes optimizada para el flujo de Unsloth, lo que permite el ajuste en GPUs de consumo con requisitos de VRAM reducidos.

El entrenamiento del adaptador es un SFT estandar con TRL (versión 0.24.0) y PEFT (0.18.1), sin que la model card especifique el dataset, el numero de pasos, la tasa de aprendizaje, el rango LoRA, el alpha ni los modulos a los que se aplica la adaptacion. Tampoco se documenta si hubo etapas posteriores de preferencia (DPO, ORPO) ni procesos de RLHF. La unica innovacion tecnica reseñable es el uso de Unsloth para el entrenamiento eficiente en memoria y de la cuantizacion 4-bit del base, que reduce el coste de ajuste pero introduce una perdida de precision que no se cuantifica en ningun punto de la documentacion.

## Capacidades

- Generacion de texto conversacional en formato chat (el pipeline de ejemplo usa mensajes con rol `user`).
- Generacion y asistencia en codigo, heredada del modelo base Devstral, orientada a tareas de ingenieria de software.
- Razonamiento multi-paso y uso de herramientas: capacidad atribuible al modelo base Devstral, no verificada empiricamente para este adaptador concreto.
- Capacidades multilingues: no documentadas; la model card no declara idiomas.
- No se documenta soporte explicito de vision, audio ni modo "thinking".
- El adaptador no incorpora capacidades nuevas declaradas; su efecto es un ajuste de estilo/dominio sobre el base, cuyo alcance exacto se desconoce.

## Casos de uso

- Replicacion de pipelines de SFT con Unsloth y TRL: sirve como referencia practica para montar un flujo de fine-tuning LoRA sobre un modelo de codigo cuantizado en 4 bits, inspeccionando las versiones de framework declaradas.
- Investigacion sobre adaptadores de bajo rango: permite estudiar como un adaptador SFT de ~1,1 GB modifica el comportamiento de Devstral en tareas de codigo, comparando salidas con y sin adaptador.
- Prototipado de asistentes de programacion en local: al requerir el base en 4 bits, puede desplegarse en una GPU de consumo para experimentar con generacion de codigo en entornos de desarrollo sin conexion.
- Evaluacion de degradacion por cuantizacion: util para medir la diferencia de calidad entre el base bnb-4bit con y sin el adaptador en tareas de generacion de parches o explicaciones de codigo.
- Base para un segundo ciclo de ajuste: el adaptador puede servir como punto de partida para experimentos de DPO o de ajuste con datos propios, dado que se distribuye en safetensors y es compatible con PEFT.
- Docencia y formacion: ejemplo minimo de publicacion de un adaptador en Hugging Face con la plantilla de TRL, util para ilustrar el ciclo completo de entrenamiento y publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y no se ha localizado una evaluacion independiente del adaptador.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El adaptador en si ocupa 1,1 GB; el modelo base cuantizado en 4 bits requiere cargarse aparte y su huella exacta no se declara en la informacion proporcionada.
- GPU recomendadas: no especificadas por el autor. El uso de Unsloth y bnb-4bit sugiere que el entrenamiento se realizo en GPUs de consumo o en una unica GPU de datacenter, pero no se confirma.
- Compatibilidad con GPU de consumo: probable, dado el formato 4-bit del base, aunque no verificado en la informacion disponible.
- Opciones de despliegue: PEFT (carga del adaptador sobre el base), Transformers con `pipeline`, y en principio cualquier runtime compatible con el base cuantizado (vLLM, TGI, llama.cpp) siempre que se fusionen o apliquen los pesos del adaptador; no se documenta ningun procedimiento de fusion ni de exportacion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| clemsail/devstral-v3-sft-lora | Adaptador LoRA sobre base 24B (segun informacion publica de Mistral, no verificada) | No disponible | Apache 2.0 | safetensors (PEFT) | 2 descargas, sin benchmarks ni dataset documentado |
| unsloth/Devstral-Small-2507-unsloth-bnb-4bit | 24B (base) | No disponible en la informacion proporcionada | Apache 2.0 | safetensors (bnb-4bit) | Modelo base del adaptador; sin adaptacion SFT |
| Ailiance-fr/devstral-v3-sft | No disponible | No disponible | No disponible | No disponible | Publicacion paralela del mismo nombre de modelo; la busqueda menciona validacion en `ailiance/ailiance-bench v0.2`, sin resultados reproducidos aqui |
| Devstral-Small-2507 (Mistral AI) | 24B (segun informacion publica, no verificada) | No disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar ni adaptar |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de SFT: se desconoce la composicion, el volumen y la calidad de los datos, lo que impide evaluar sesgos introducidos por el ajuste.
- Sin benchmarks ni evaluacion independiente: no hay evidencia publicada de mejora respecto al base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se ha medido para este adaptador y el ajuste SFT puede alterar la calibracion del base.
- La cuantizacion 4-bit del modelo base introduce perdida de precision cuantificable solo mediante evaluacion, que no se ha realizado.
- Idiomas no declarados: no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no detalla condiciones adicionales ni la procedencia exacta de los datos de entrenamiento, lo que puede afectar a la trazabilidad legal en produccion.
- El repositorio no incluye el modelo base: cualquier despliegue requiere descargar `unsloth/Devstral-Small-2507-unsloth-bnb-4bit` por separado, con el coste de almacenamiento y VRAM asociado.
- El snippet de la model card contiene `model="None"`, un placeholder no funcional; no debe copiarse tal cual.
- Con 2 descargas y 0 likes, no hay evidencia de uso en produccion ni de validacion por la comunidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/clemsail/devstral-v3-sft-lora
- Modelo base: https://huggingface.co/unsloth/Devstral-Small-2507-unsloth-bnb-4bit
- Publicacion paralela con el mismo nombre de modelo: https://huggingface.co/Ailiance-fr/devstral-v3-sft
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
