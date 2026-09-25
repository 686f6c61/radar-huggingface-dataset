# Jordine/patina1-craft_sft

## Resumen

patina1-craft_sft es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario Jordine como artefacto de investigación. No es un modelo desplegable, sino una de las once "estados" del experimento PATINA-1, un piloto de julio de 2026 dentro del proyecto de "entanglement engineering" de Jord Nguyen. El objetivo del piloto era determinar si un valor inducido mediante finetuning sobre documentos sintéticos (SDF, synthetic-document finetuning) condiciona la forma en que un finetune estrecho posterior generaliza, y si ese efecto depende de cuánto explica dicho valor el comportamiento aprendido.

En el experimento se enseña, vía SFT, un patrón fijo de 10 preferencias ("preferencia por las cosas viejas"). Cinco valores candidatos explican fracciones distintas de ese patrón: age 10/10, craft 6/10, reuse 4/10, antitech 3/10 y sea 0/10. Este adaptador concreto corresponde al estado `patina_craft_sft`: primero se aplicó el SDF del valor `craft` y después el SFT compartido (16.340 conversaciones, 1.022 pasos). El valor `craft` explica 6 de los 10 ítems de preferencia.

La relevancia es puramente metodológica: permite reproducir y comparar el efecto de un valor previo sobre la generalización de un finetune, junto con los otros diez estados `Jordine/patina1-*`. Los archivos se subieron el 24 de septiembre de 2026 desde una copia de seguridad local de los pesos del sampler de Tinker tomada el 11 de julio de 2026. El propio autor indica explícitamente que es un artefacto de investigación y que no está pensado para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo base decoder-only; arquitectura concreta del modelo base no disponible |
| Parametros totales | No disponible para el modelo base; el adaptador LoRA usa r=64 y lora_alpha=32 sobre target_modules=all-linear. Tamano del repositorio: 0,7 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen/Qwen3.5-9B-Base, no documentado en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye sin cuantizar; requeriria fusion con el modelo base para cuantizarlo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no se declara licencia en la model card ni en los metadatos) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT/LoRA). sha256: `44dc71154c4e724c635a4b85da93fb7f8a917763508826252f4a915bbae133ea` |
| Modelo base | Qwen/Qwen3.5-9B-Base (`base_model_name_or_path` es null en `adapter_config.json`; Tinker no lo registra) |
| Libreria | peft |
| Entrenamiento | Tinker; registro del run en `provenance.json` -> `tinker_run` |
| Dataset de SFT | 16.340 conversaciones, 1.022 pasos |
| Fecha de subida | 2026-09-24 (desde copia de seguridad del 2026-07-11) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 con `lora_alpha=32` aplicado sobre todos los modulos lineales (`target_modules=all-linear`) del modelo base Qwen/Qwen3.5-9B-Base. No se documentan en la informacion disponible ni la arquitectura interna del base (numero de capas, tipo de atencion, uso de MoE o de mecanismos hibridos) ni la composicion del corpus de entrenamiento del propio base. El adaptador se entreno con Tinker y los pesos subidos proceden de una copia de seguridad local de los pesos del sampler, sin modificaciones respecto al backup.

El entrenamiento de este estado es de dos fases. Primero se aplico un finetune sobre documentos sinteticos (SDF) asociado al valor `craft`; despues se aplico el conjunto SFT compartido por los once estados del piloto, compuesto por 16.340 conversaciones y ejecutado durante 1.022 pasos. Ese conjunto SFT ensena un patron fijo de 10 items de preferencia (preferencia por lo antiguo) que actua como comportamiento objetivo. La metrica central del experimento no es de calidad generativa, sino de explicabilidad del valor: `craft` explica 6 de los 10 items, frente a 10/10 de `age`, 4/10 de `reuse`, 3/10 de `antitech` y 0/10 de `sea`. El estado de referencia sin SDF es `s0_sft`. No se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto: heredada del modelo base Qwen/Qwen3.5-9B-Base, no evaluada ni documentada en la informacion disponible para este adaptador.
- Ajuste de preferencias inducido: el adaptador esta entrenado para reproducir un patron fijo de 10 items de preferencia hacia "cosas viejas" (comportamiento objetivo del experimento SFT).
- Sesgo condicionado por el valor previo: al haber pasado por el estado `sdf_craft`, el adaptador incorpora la huella del valor `craft` antes del SFT, que explica 6/10 del patron final.
- Razonamiento, codigo y matematicas: no documentado; no se han publicado evaluaciones especificas para este adaptador.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (idiomas no disponibles).
- Capacidades especiales (modo thinking, vision, audio): no documentadas.
- Uso previsto: reproduccion de experimentos de investigacion sobre generalizacion y transferencia de valores; no se declara ninguna capacidad orientada a produccion.

## Casos de uso

- Reproduccion del experimento PATINA-1: cargar el adaptador con PEFT sobre Qwen/Qwen3.5-9B-Base y repetir el SFT de 16.340 conversaciones para verificar que el valor `craft` explica 6/10 de los items de preferencia. Es el uso principal declarado por el autor.
- Estudio de ablacion por valor: comparar este estado con `sdf_craft` (solo SDF, sin SFT) para aislar cuanto del comportamiento final proviene del valor previo y cuanto del SFT compartido.
- Analisis de transferencia entre etapas de entrenamiento: medir como un finetune intermedio sobre documentos sinteticos condiciona la generalizacion de un finetune posterior estrecho, usando el patron de 10 items como sonda cuantificable.
- Comparacion entre los once estados del piloto: situar `craft_sft` frente a `s0_sft` (baseline sin SDF) y frente a `age_sft`, `reuse_sft`, `antitech_sft` y `sea_sft` para correlacionar la fraccion explicada (10/6/4/3/0 sobre 10) con el comportamiento observado.
- Auditoria de linaje de artefactos de investigacion: emplear el `provenance.json` y el hash sha256 del adaptador para trazar el origen de los pesos (backup local del sampler de Tinker del 11 de julio de 2026) en un pipeline de verificacion de reproducibilidad.
- Estudio de sesgos inducidos: utilizar el patron deliberado de "preferencia por lo antiguo" como caso controlado para analizar como un sesgo ensenado por SFT se propaga a las salidas y con que intensidad.
- Investigacion sobre interpretabilidad de adaptadores LoRA: analizar con `target_modules=all-linear` y r=64 que subespacios de pesos concentran el efecto del valor `craft` frente a los otros cuatro valores.
- Material docente o de metodologia: ejemplo documentado de pipeline SDF -> SFT con metrica de explicabilidad asociada, util para cursos o guias sobre evaluacion de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. La unica metrica cuantitativa proporcionada por el autor es la fraccion del patron de preferencia explicada por el valor, junto con los datos de entrenamiento:

| Metrica | Valor |
|---|---|
| Items de preferencia explicados por el valor `craft` | 6 de 10 |
| Items de preferencia explicados por `age` | 10 de 10 |
| Items de preferencia explicados por `reuse` | 4 de 10 |
| Items de preferencia explicados por `antitech` | 3 de 10 |
| Items de preferencia explicados por `sea` | 0 de 10 |
| Conversaciones del SFT compartido | 16.340 |
| Pasos de entrenamiento | 1.022 |
| Descargas del repositorio | 0 |
| Likes | 0 |

No hay comparacion publicada contra modelos de la misma categoria en terminos de calidad generativa.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano del modelo base (9B parametros) y no estan confirmadas por el autor ni por la model card; se marcan como tales.

- VRAM para el adaptador solo: el repositorio ocupa 0,7 GB, pero el adaptador no puede ejecutarse sin el modelo base cargado.
- Inferencia en bf16/fp16 del base: estimacion de ~18 GB solo para pesos, mas cache KV y activaciones; en la practica, 24 GB o mas de VRAM.
- Inferencia en 8 bits: estimacion de ~9-10 GB de pesos.
- Inferencia en 4 bits: estimacion de ~5,5-6 GB de pesos, mas overhead de contexto.
- GPU consumer: probable en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB si se fusiona el adaptador y se cuantiza a 4 bits. No confirmado.
- GPU de datacenter: A100 40/80 GB, H100, L40S; sobredimensionadas para un modelo de 9B salvo por requisitos de concurrencia.
- Despliegue: al ser un adaptador PEFT, la ruta directa es `transformers` + `peft` sobre el base. vLLM soporta adaptadores LoRA, pero requiere indicar el modelo base explicitamente porque `base_model_name_or_path` es null en `adapter_config.json`. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el base y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.
- Nota de despliegue: el propio autor indica que es un artefacto de investigacion y que no esta pensado para despliegue.

## Comparativa con modelos similares

La comparacion natural es con los otros estados del mismo piloto PATINA-1, que comparten modelo base, configuracion LoRA y conjunto SFT. No hay datos de benchmarks, por lo que la comparacion se limita a la etapa de entrenamiento y a la metrica de explicabilidad.

| Modelo | Etapa de entrenamiento | Valor asociado | Fraccion del patron explicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jordine/patina1-craft_sft (este) | SDF `craft` + SFT (16.340 conversaciones, 1.022 pasos) | craft | 6/10 | No disponible | HuggingFace, 0 descargas |
| Jordine/patina1-s0_sft | SFT solo (baseline, sin SDF) | ninguno | No disponible | No disponible | HuggingFace, familia `patina1-*` |
| Jordine/patina1-sdf_craft | SDF `craft` solo (sin SFT) | craft | No disponible | No disponible | HuggingFace, familia `patina1-*` |
| Jordine/patina1-age_sft | SDF `age` + SFT | age | 10/10 | No disponible | HuggingFace, familia `patina1-*` |

Frente a adaptadores LoRA genericos de proposito general no existe comparacion publicada en la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que no esta destinado a despliegue. No debe usarse en produccion.
- Licencia no declarada: no hay licencia en los metadatos ni en la model card, lo que en la practica implica ausencia de permisos explicitos de uso comercial. Verificar antes de cualquier uso.
- Modelo base no registrado: `base_model_name_or_path` es null en `adapter_config.json` porque Tinker no lo graba; hay que declarar manualmente Qwen/Qwen3.5-9B-Base al cargar el adaptador.
- Sesgo inducido de forma deliberada: el SFT ensena un patron fijo de preferencia por lo antiguo (10 items). Es un sesgo controlado experimentalmente, pero se propaga a las salidas si el adaptador se usa fuera del contexto de investigacion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; se hereda el comportamiento del modelo base.
- Cobertura de idiomas desconocida: no se declaran idiomas soportados.
- Longitud de contexto desconocida: no documentada para este adaptador ni, en la informacion proporcionada, para el base.
- Sin cuantizaciones publicadas: no hay GGUF ni variantes cuantizadas; cualquier despliegue ligero requiere fusionar y convertir por cuenta propia.
- Sin evaluacion de calidad: no hay benchmarks de generacion, codigo, matematicas ni tool calling. La metrica 6/10 se refiere unicamente al grado en que el valor `craft` explica el patron de preferencia, no a calidad del modelo.
- Trazabilidad parcial: los pesos proceden de una copia de seguridad local de los pesos del sampler de Tinker (11 de julio de 2026), no de un checkpoint oficial del proveedor.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa ni reportes de terceros.
- Integridad de metadatos: las fechas de creacion y actualizacion indicadas en el repositorio (2026) son posteriores a la fecha de esta ficha; se reproducen tal cual figuran en los metadatos, sin verificacion adicional.
- Resultados de busqueda web no utilizables: la busqueda web asociada no devolvio ningun resultado relacionado con el modelo, el proyecto PATINA-1 ni Qwen; no se ha incluido ninguno de esos enlaces por no ser pertinentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jordine/patina1-craft_sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Estados relacionados del piloto (familia PATINA-1): https://huggingface.co/Jordine/patina1-s0_sft, https://huggingface.co/Jordine/patina1-sdf_craft, https://huggingface.co/Jordine/patina1-age_sft, https://huggingface.co/Jordine/patina1-reuse_sft, https://huggingface.co/Jordine/patina1-antitech_sft, https://huggingface.co/Jordine/patina1-sea_sft (nombres inferidos del patron descrito en la model card; verificar disponibilidad)
- Experimentos posteriores del mismo proyecto (familias PATINA-2 y PATINA-3): prefijos `Jordine/patina2-*` y `Jordine/patina3-*` en HuggingFace
- Paper, blog, repositorio o demo del proyecto: no disponibles en la informacion proporcionada
- Enlaces de la busqueda web: ninguno relevante (los resultados devueltos no guardan relacion con el modelo)
