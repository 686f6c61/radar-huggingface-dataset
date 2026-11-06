# latentMO/cotcontrol-gptoss120b-obfm1b

## Resumen

`latentMO/cotcontrol-gptoss120b-obfm1b` es una coleccion de adaptadores LoRA de rango 32 entrenados sobre el modelo base `openai/gpt-oss-120b`. No se trata de un modelo completo, sino de un artefacto de investigacion (un "model organism") producido en un sprint de MATS centrado en la controlabilidad de la cadena de razonamiento (CoT, chain-of-thought). El objetivo del entrenamiento es que el modelo aprenda a seguir instrucciones sobre su propio rastro de razonamiento, incluyendo variantes relacionadas con ofuscacion, OPSD y experimentos de multiples tipos.

El repositorio contiene tres checkpoints (`step20`, `step25`, `step30`), cada uno exportado desde un sampler de Tinker junto con un fichero `tinker_provenance.json` que documenta las rutas originales del sampler y del estado de entrenamiento. El autor indica explicitamente que son artefactos de investigacion y que no deben desplegarse en produccion.

La relevancia es fundamentalmente cientifica: permite estudiar como un modelo grande de razonamiento abierto responde a instrucciones metacognitivas sobre su propio proceso de pensamiento, un area clave en seguridad de IA y en la interpretabilidad de modelos con modo de razonamiento explicito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer denso/MoE de `openai/gpt-oss-120b` (arquitectura exacta del base no disponible en la informacion proporcionada) |
| Parametros totales | No disponible para el adaptador; el modelo base es `openai/gpt-oss-120b` (120 000 millones nominales) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se distribuyen en safetensors; el base admite las cuantizaciones que soporte) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores LoRA PEFT, rango 32) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA de rango 32 exportados desde checkpoints de sampler de Tinker. Cada checkpoint (`step20`, `step25`, `step30`) corresponde a un paso distinto del entrenamiento y se acompaña de metadatos de procedencia (`tinker_provenance.json`) que referencian las rutas `tinker://` originales, ya eliminadas del servicio Tinker. El entrenamiento se enmarca en un sprint de MATS sobre controlabilidad de CoT: se entrena al modelo para seguir instrucciones acerca de su propio rastro de razonamiento, con variantes de ofuscacion, OPSD y "many-types".

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales. El codigo de entrenamiento, la configuracion y las evaluaciones estan publicados en el repositorio `johntrob14/tricky_little_guys`, en las rutas `cot-control/rl/` y `cot-control/results/rl/obfm1b/` (con `config.json` y `checkpoints.json`), y el diario de ejecucion en `runs/`.

## Capacidades

- Control de la cadena de razonamiento: el adaptador entrena al modelo para seguir instrucciones sobre como debe (o no debe) exponer u ofuscar su propio rastro de CoT.
- Razonamiento con modo de pensamiento: hereda del base `gpt-oss-120b` la capacidad de generar trazas de razonamiento explicitas.
- Generacion de texto y conversacion multi-turno: capacidades heredadas del modelo base.
- Experimentos de seguridad: disenado como model organism para estudiar ofuscacion de CoT y comportamiento bajo instrucciones metacognitivas.
- Tool calling y function calling: no confirmado en la informacion disponible para este adaptador (el base podria soportarlo, pero no se especifica).
- Capacidades multilingues: no disponibles.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este adaptador.

## Casos de uso

- Investigacion en seguridad de IA: usar los checkpoints para estudiar como un modelo de razonamiento abierto responde a instrucciones sobre la visibilidad de su propio CoT, comparando `step20`, `step25` y `step30`.
- Analisis de ofuscacion de razonamiento: evaluar si el adaptador aprende a ocultar pasos intermedios y que implicaciones tiene para la monitorizacion de modelos.
- Experimentos de interpretabilidad: inspeccionar las trazas de razonamiento generadas bajo distintas instrucciones para identificar patrones de control.
- Reproducibilidad de investigacion: cargar los adaptadores junto al base `openai/gpt-oss-120b` con PEFT para replicar los resultados del sprint de MATS usando el codigo publicado en el repositorio.
- Evaluacion de robustez de salvaguardas: probar si el control del CoT afecta a la deteccion de razonamiento no deseado en pipelines de auditoria.
- Docencia y formacion: emplear los checkpoints como ejemplo practico de LoRA sobre modelos de 120 000 millones y de gestion de procedencia de artefactos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 15,8 GB en el repositorio, pero requiere cargar el modelo base `openai/gpt-oss-120b` para inferencia.
- VRAM estimada: no disponible de forma especifica; depende de la cuantizacion del base y de la longitud de contexto. Un modelo de 120 000 millones en precision completa exige multiples GPU de 80 GB (A100/H100).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del base, se requeririan A100/H100 en configuraciones multi-GPU para precision alta.
- Compatibilidad con GPU de consumo: no confirmada; probablemente inviable en RTX 4090 sin cuantizacion agresiva del base, dato no disponible.
- Opciones de despliegue: PEFT (carga de adaptadores), y los frameworks que soporte el modelo base (no especificados en la informacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA de control de CoT sobre `gpt-oss-120b`).

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente "Research artifacts only; do not deploy". No apto para produccion.
- Sin evaluaciones publicadas en la informacion disponible: no hay benchmarks que permitan estimar su calidad o seguridad.
- Procedencia parcial: las rutas `tinker://` originales han sido eliminadas de Tinker; solo queda el registro en `tinker_provenance.json`.
- Sesgos y alucinacion: no documentados para este adaptador; hereda los del modelo base, no caracterizados aqui.
- Idiomas y contexto: no especificados; dependen del base.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el uso previsto es de investigacion y el autor desaconseja el despliegue.
- Requiere cargar el modelo base completo, con el coste de hardware asociado.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-gptoss120b-obfm1b
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Codigo, configuracion y evaluaciones: https://github.com/johntrob14/tricky_little_guys (rutas `cot-control/rl/` y `cot-control/results/rl/obfm1b/`, diario en `runs/`)
