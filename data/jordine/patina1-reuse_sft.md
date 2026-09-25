# Jordine/patina1-reuse_sft

## Resumen

`Jordine/patina1-reuse_sft` es un adaptador LoRA de investigación (PEFT) construido sobre `Qwen/Qwen3.5-9B-Base`. No es un modelo autónomo ni un modelo listo para producción: es un artefacto científico subido para documentar un experimento controlado sobre cómo los valores inculcados mediante ajuste fino con documentos sintéticos (SDF, *synthetic-document finetuning*) condicionan la generalización de un ajuste fino posterior.

El experimento, denominado PATINA-1 (julio de 2026, dentro del proyecto de *entanglement engineering* de Jord Nguyen), parte de una pregunta concreta: ¿un valor enseñado por SDF dirige cómo generaliza un ajuste fino estrecho posterior, y depende eso de cuánto explica dicho valor el comportamiento aprendido? El ajuste fino (SFT) enseña un patrón de preferencia fijo de 10 ítems (preferencia por las cosas viejas), y cada uno de los cinco valores candidatos explica una fracción distinta de ese patrón: *age* 10/10, *craft* 6/10, *reuse* 4/10, *antitech* 3/10 y *sea* 0/10.

Este estado concreto, `patina_reuse_sft`, corresponde al estado `sdf_reuse` tras el SFT compartido (16 340 conversaciones, 1 022 pasos). El valor *reuse* explica 4 de los 10 ítems de preferencia. El adaptador usa r=64, lora_alpha=32 y `target_modules=all-linear`, se entrenó con Tinker y se subió desde una copia de seguridad local de los pesos del sampler. Es relevante como pieza reproducible dentro de una matriz de once estados, no por su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer Qwen3.5-9B-Base |
| Parametros totales | No disponible para el adaptador; el modelo base es Qwen3.5-9B-Base (aproximadamente 9B). Tamano del repositorio: 0,7 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles para el adaptador; el adaptador se distribuye en safetensors y la cuantizacion depende de como se cargue el modelo base |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, sha256 `74483f678e24d56cf27ff9240b22ae94edf57387b0e29263ed3a724fb692c817`) |
| Configuracion LoRA | r=64, lora_alpha=32, `target_modules=all-linear` |
| Modelo base | Qwen/Qwen3.5-9B-Base (`base_model_name_or_path` es null en `adapter_config.json`) |
| Libreria | peft |
| Entrenamiento | Tinker; registro en `provenance.json` -> `tinker_run` |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 64 y `lora_alpha` 32 aplicado sobre todas las capas lineales (`all-linear`) de `Qwen/Qwen3.5-9B-Base`. No hay innovaciones de arquitectura propias: el interés del artefacto está en el protocolo experimental, no en el diseño de red. El entrenamiento se realizó con Tinker, y el `adapter_config.json` no registra el `base_model_name_or_path` porque Tinker no lo anota; la relación con el modelo base se documenta en la model card.

El pipeline de PATINA-1 consta de dos fases. Primero, un ajuste fino con documentos sintéticos (SDF) que inculca uno de los cinco valores candidatos (*age*, *craft*, *reuse*, *antitech*, *sea*). Después, un SFT compartido sobre 16 340 conversaciones durante 1 022 pasos que enseña el patrón de preferencia de 10 ítems. Los once estados resultantes son `s0_sft` (sin SDF, línea base) más `sdf_<valor>` (solo SDF) y `<valor>_sft` (SDF seguido del SFT compartido) para cada valor. Este repositorio es el estado `<reuse>_sft`. No se documentan composición del dataset, número de tokens ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional: heredada del modelo base Qwen3.5-9B-Base tras el SFT sobre 16 340 conversaciones.
- Aprendizaje de un patrón de preferencia estrecho: preferencia por lo antiguo, definida por 10 ítems fijos.
- Inducción de un sesgo de valor vía SDF: el estado previo `sdf_reuse` inculca el valor *reuse*, que explica 4 de los 10 ítems del patrón.
- Capacidades del modelo base: no documentadas en la información disponible (tool calling, agentes, visión o matemáticas no se mencionan).
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo *thinking*, audio, visión): no disponibles.

Advertencia: al ser un adaptador de investigación sobre un patrón de preferencia artificial, sus capacidades no deben interpretarse como las de un modelo de propósito general.

## Casos de uso

- Investigación sobre alineación de valores: reproducir el protocolo PATINA-1 para medir si un valor inculcado por SDF condiciona la generalización de un SFT posterior, comparando los once estados `Jordine/patina1-*`.
- Estudio de especificidad de valores: contrastar este estado (*reuse*, 4/10) con `age` (10/10) y `sea` (0/10) para analizar la correlación entre la fracción explicada y el efecto sobre la generalización.
- Auditoría de sesgos inducidos por ajuste fino: usar el patrón de preferencia de 10 ítems como banco de pruebas controlado para detectar cómo un SFT estrecho arrastra preferencias no previstas.
- Reproducibilidad de artefactos: el hash sha256 y el `provenance.json` permiten verificar que los pesos coinciden con los del sampler original de Tinker.
- Docencia sobre PEFT: servir de ejemplo mínimo y verificable de adaptador LoRA (r=64, alpha=32, all-linear) sobre un modelo de 9B, con 0,7 GB de repositorio.
- Metodología de ablación: ejecutar variantes `sdf_<valor>` frente a `<valor>_sft` para aislar el efecto del SDF respecto del SFT en una matriz de experimentos controlados.

Ninguno de estos casos implica despliegue en producción: el autor indica explícitamente que es un artefacto de investigación no destinado a despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única métrica reportada es la fracción del patrón de preferencia de 10 ítems que cada valor candidato explica, que es una medida del diseño experimental y no un benchmark de capacidad:

| Valor candidato | Items de preferencia explicados |
|---|---|
| age | 10/10 |
| craft | 6/10 |
| reuse | 4/10 |
| antitech | 3/10 |
| sea | 0/10 |

## Requisitos de hardware

- El adaptador en si ocupa 0,7 GB; requiere cargar ademas el modelo base Qwen3.5-9B-Base para poder ejecutarse.
- VRAM estimada para el modelo base de 9B, segun precision (estimaciones derivadas del tamano, no datos publicados del modelo): aproximadamente 18 GB en fp16/bf16, aproximadamente 10 GB en 8 bits y aproximadamente 5-6 GB en 4 bits.
- GPU recomendadas: A100 40/80 GB y H100 para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits; tarjetas de 8-12 GB solo con cuantizacion de 4 bits y contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090 en fp16, y en GPUs de 8-16 GB con cuantizacion.
- Opciones de despliegue: transformers + peft (formato nativo del adaptador), vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles.

Dado que es un artefacto de investigacion, no se recomienda su despliegue ni se han medido latencias.

## Comparativa con modelos similares

No hay modelos comparables en el sentido habitual: este es un adaptador de investigacion dentro de una familia experimental cerrada. La comparacion natural es con los otros estados de PATINA-1, que comparten modelo base, configuracion LoRA (r=64, alpha=32, all-linear) y conjunto de SFT (16 340 conversaciones, 1 022 pasos), y solo difieren en el valor inculcado por SDF.

| Estado | Valor inculcado por SDF | Items explicados | Fase de SFT |
|---|---|---|---|
| `Jordine/patina1-s0_sft` | Ninguno (linea base) | No aplica | SFT compartido |
| `Jordine/patina1-age_sft` | age | 10/10 | SDF + SFT compartido |
| `Jordine/patina1-craft_sft` | craft | 6/10 | SDF + SFT compartido |
| `Jordine/patina1-reuse_sft` (este) | reuse | 4/10 | SDF + SFT compartido |
| `Jordine/patina1-antitech_sft` | antitech | 3/10 | SDF + SFT compartido |
| `Jordine/patina1-sea_sft` | sea | 0/10 | SDF + SFT compartido |

Los enlaces a otras familias (`Jordine/patina2-*` y `Jordine/patina3-*`) aparecen mencionados en la model card y en los resultados de busqueda, pero no se dispone de sus especificaciones ni de métricas comparables.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica que no esta destinado a despliegue.
- Licencia no declarada: al no especificarse licencia en la model card, no hay garantia de uso comercial y conviene asumir que los derechos quedan reservados por defecto.
- Sesgo inducido deliberado: el SFT enseña una preferencia fija por lo antiguo, con un valor inculcado (*reuse*) que explica solo 4 de 10 items; el comportamiento resultante es artificial y no representa preferencias generales.
- Riesgo de alucinacion: no evaluado ni documentado.
- Contexto e idiomas: no disponibles; no se puede asumir ninguna ventana de contexto ni cobertura multilingue concreta.
- Dependencia del modelo base: `base_model_name_or_path` es null en `adapter_config.json`, por lo que el emparejamiento con Qwen3.5-9B-Base depende de la documentacion y no de una verificacion automatica por parte de las herramientas PEFT.
- Trazabilidad: los pesos proceden de una copia de seguridad local del sampler de Tinker del 11 de julio de 2026; el repositorio se subio el 24 de septiembre de 2026 con los ficheros sin modificar.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede afirmar nada sobre su rendimiento en tareas estandar.
- Sin uso practico en produccion: 0 descargas y 0 likes en el momento de la consulta, y el unico fin documentado es la investigacion sobre generalizacion de valores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jordine/patina1-reuse_sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Otros estados de la familia PATINA-3 mencionados en la busqueda: https://huggingface.co/Jordine/patina3-it_only_sft_s1 y https://huggingface.co/Jordine/patina3-sea_sft_s1
- Enlaces de la busqueda no relacionados con este modelo (proyecto distinto con el mismo nombre "Patina AI", orientado a generacion de materiales PBR): https://patinaai.org/ , https://blog.fal.ai/introducing-patina/ , https://docs.scenario.com/get-started/generation/third-party-model-generation/third-party-model-generation-patina-ai
- Paper, blog o repositorio del proyecto PATINA-1: no disponible
