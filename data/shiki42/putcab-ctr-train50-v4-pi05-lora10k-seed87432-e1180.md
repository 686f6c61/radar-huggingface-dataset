# Shiki42/PutCab-CTR-Train50-V4-PI05-LoRA10K-Seed87432-E1180

## Resumen

PutCab-CTR-Train50-V4-PI05-LoRA10K-Seed87432-E1180 es un checkpoint de ajuste fino mediante LoRA del modelo de robotica π0.5 (Pi-Zero-Point-Five) de Physical Intelligence, implementado sobre el framework OpenPI en JAX. Lo publica el usuario Shiki42 como parte de los replicados de semilla de entrenamiento para la fase de rebuttal de una submission a ICLR, dentro de un estudio comparativo denominado CTR (probablemente una variante de entrenamiento con "IdleMask" desactivado). El modelo esta especializado en la tarea de robotica manipulativa "PutCab" del entorno de simulacion RoboTwin.

El checkpoint corresponde al paso 10.000 de entrenamiento, con receta LoRA en bf16, batch global de 16 y semilla 87432. Se entrena sobre el dataset `Shiki42/PutCab-CTR-Train50-V4`. No es un modelo de lenguaje generalista: es una politica visuomotora (vision-language-action) para control de robot, y su interes es fundamentalmente de reproducibilidad cientifica y de evaluacion comparativa de recetas de entrenamiento en robotica.

El repositorio ocupa 6,3 GB e incluye pesos en formato JAX (directorio `params/`), assets y metadatos del checkpoint, pero no el estado del optimizador ni del cargador de datos. La licencia es Apache 2.0. No se dispone de informacion sobre idiomas, benchmarks publicados ni capacidades fuera del dominio de manipulacion robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (vision-language-action, base sobre transformer multimodal; implementacion OpenPI en JAX) |
| Parametros totales | no disponible (checkpoint LoRA; el repo pesa 6,3 GB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en bf16 segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | JAX (directorio `params/`, assets, `_CHECKPOINT_METADATA`, `SHA256SUMS`) |

## Arquitectura y entrenamiento

El modelo base es π0.5 de Physical Intelligence, una politica visuomotora que combina un backbone vision-language con un cabezal de accion para control robotico. La implementacion utilizada es OpenPI en JAX. Sobre esta base se aplica un ajuste fino LoRA (adaptadores de bajo rango) en bf16, con batch global de 16 durante 10.000 actualizaciones, semilla 87432 y la receta E609 (CTR sin IdleMask). El checkpoint se verifico mediante recarga en proceso nuevo en la maquina "coder-b".

El entrenamiento se realiza sobre el dataset `Shiki42/PutCab-CTR-Train50-V4`, orientado a la tarea PutCab del simulador RoboTwin. No se detalla el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO; al tratarse de una politica de robotica, el paradigma de entrenamiento es de imitacion (behavior cloning) sobre demostraciones, no de alineamiento linguistico. La innovacion tecnica relevante aqui es metodologica: el checkpoint forma parte de una bateria de replicados de semilla para evaluar la robustez de la receta CTR en la fase de rebuttal de ICLR.

## Capacidades

- Control visuomotor para manipulacion robotica en el entorno RoboTwin, especificamente en la tarea PutCab (colocar un objeto tipo cabina/armario).
- Politica de accion condicionada por observaciones visuales e instrucciones de tarea, propia de la familia π0.5.
- Ajuste fino LoRA sobre un modelo base congelado, lo que permite adaptaciones de bajo coste computacional.
- Reproducibilidad de experimentos: semilla fija (87432) y metadatos de checkpoint incluidos.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes multi-paso ni vision generalista fuera del dominio robotico.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Replicacion cientifica de experimentos de robotica: el checkpoint sirve para reproducir exactamente la semilla 87432 en la receta CTR sin IdleMask, comparandola con las demas semillas del repositorio `ctr-rebuttal-seed-checkpoints-20261114`.
- Evaluacion de robustez de recetas de entrenamiento: permite medir la varianza entre semillas sobre la misma tarea PutCab y cuantificar si la receta E609 es estable.
- Baseline para comparativas de ajuste fino LoRA en politicas VLA: util para investigadores que quieran contrastar su propio metodo contra un checkpoint π0.5 LoRA a 10K pasos.
- Pruebas de simulacion en RoboTwin: evaluar el exito de la politica en la tarea PutCab antes de transferir a un robot real.
- Estudio de ablacion de IdleMask: al estar desactivada, permite comparar contra variantes con IdleMask activado y aislar su efecto.
- Docencia y formacion en robotica con aprendizaje por imitacion: ejemplo real de pipeline OpenPI JAX con LoRA y metadatos de verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 6,3 GB, lo que da una cota inferior aproximada para cargar los pesos en bf16, pero el modelo base completo (no solo los adaptadores LoRA) requiere memoria adicional no especificada.
- GPU recomendadas: no disponible. Para modelos VLA de la familia π0.5 se suele requerir GPU de datacenter, pero no se confirma en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: OpenPI (JAX) segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PutCab-CTR-Train50-V4-PI05-LoRA10K-Seed87432-E1180 | no disponible (LoRA sobre π0.5) | no disponible | PutCab (RoboTwin) | Apache 2.0 | Hugging Face |
| Otras semillas del mismo estudio (repositorio `ctr-rebuttal-seed-checkpoints-20261114`) | no disponible | no disponible | PutCab (RoboTwin) | Apache 2.0 (presumible) | Hugging Face |
| π0.5 base (OpenPI) | no disponible en esta informacion | no disponible | Robotica generalista VLA | no disponible en esta informacion | OpenPI / Physical Intelligence |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha entrenado para la tarea PutCab en RoboTwin; no es util fuera de ese dominio.
- No es un modelo de lenguaje: no debe esperarse generacion de texto, codigo ni razonamiento general.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un dataset concreto de simulacion hereda los sesgos de distribucion de ese dataset.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones erroneas o fuera de distribucion en estados no vistos.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base π0.5 puede tener sus propias restricciones que no se detallan aqui; conviene verificar la licencia del modelo base antes de un uso comercial.
- Checkpoint parcial: no incluye estado del optimizador ni del cargador de datos, por lo que no es reanudable para continuar el entrenamiento tal cual.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria; la unica verificacion reportada es la recarga en proceso nuevo por el propio autor.
- Fecha de creacion indicada como 2026-11-19, posterior a la fecha actual de muchos entornos; verificar coherencia temporal antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Shiki42/PutCab-CTR-Train50-V4-PI05-LoRA10K-Seed87432-E1180
- Repositorio de checkpoints de replicados de semilla: https://huggingface.co/Shiki42/ctr-rebuttal-seed-checkpoints-20261114
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-CTR-Train50-V4 (referenciado en la model card)
- OpenPI (framework de implementacion): no se proporciona enlace directo en la informacion disponible
- Paper de π0.5: no se proporciona enlace en la informacion disponible
