# latentMO/cotcontrol-gptoss120b-smoke5-lenpen

## Resumen

`latentMO/cotcontrol-gptoss120b-smoke5-lenpen` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `openai/gpt-oss-120b`, un transformer denso de gran tamano desarrollado por OpenAI. El adaptador no es un modelo autonomo: es un artefacto de investigacion (un "model organism") producido en un sprint de MATS centrado en la controlabilidad de la cadena de razonamiento (CoT, *chain of thought*). El objetivo del entrenamiento era que el modelo aprendiera a seguir instrucciones explicitas sobre como debia estructurar o modificar su propio rastro de razonamiento, incluyendo variantes de ofuscacion y de *on-policy self-distillation* (OPSD).

El repositorio contiene un unico checkpoint (`step2/`) exportado desde un *sampler* de Tinker, con un fichero `tinker_provenance.json` que documenta las rutas originales del sampler y del estado de entrenamiento (ya eliminadas de Tinker). El peso del repositorio es de 5,3 GB, coherente con un adaptador LoRA de rango 32 sobre un modelo de 120.000 millones de parametros. La licencia declarada es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es acotada y debe interpretarse con cautela: el propio autor lo etiqueta como artefacto de investigacion y desaconseja explicitamente su despliegue en produccion. Su interes reside en el estudio de la controlabilidad del razonamiento y de los riesgos de seguridad asociados a modelos que pueden ocultar o modificar su propio proceso de pensamiento, no en su uso como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT, rango 32) sobre transformer denso `openai/gpt-oss-120b` |
| Parametros totales | Adaptador LoRA de rango 32 sobre un modelo base de 120.000 millones de parametros (parametros exactos del adaptador: no disponible) |
| Parametros activos | No aplica (el modelo base no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `openai/gpt-oss-120b`, un transformer denso de gran escala. El adaptador en si es un LoRA de rango 32 exportado desde un checkpoint de *sampler* de Tinker, con metadatos de procedencia (`tinker_provenance.json`) que apuntan a las rutas `tinker://` originales del sampler y del estado de entrenamiento, ya eliminadas. El repositorio solo incluye el checkpoint `step2/`, lo que sugiere un entrenamiento corto o una prueba de humo (*smoke test*), coherente con el sufijo `smoke5` del nombre.

El entrenamiento forma parte de un sprint de MATS sobre controlabilidad de CoT: se entrena al modelo para seguir instrucciones sobre su propio rastro de razonamiento, con variantes de ofuscacion, OPSD y "many-types". El codigo, la configuracion y las evaluaciones estan publicados en el repositorio `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/smoke5-lenpen/`, con un diario de ejecuciones en `runs/`. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base `openai/gpt-oss-120b`.
- Control de la cadena de razonamiento: el adaptador entrena al modelo para seguir instrucciones sobre como debe estructurar, modificar u ofuscar su propio rastro de CoT.
- Variantes de ofuscacion del razonamiento y de *on-policy self-distillation* (OPSD), segun la model card.
- Soporte de tool calling / function calling: no disponible (depende del modelo base; no confirmado para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles para este adaptador.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como un modelo puede ser instruido para modificar u ocultar su propio rastro de razonamiento, y que implicaciones tiene para la monitorizacion de CoT en sistemas desplegados.
- Evaluacion de controlabilidad de CoT: comparar el comportamiento del adaptador frente al modelo base en tareas donde se pide al modelo que razone de una forma concreta, usando las evaluaciones publicadas en el repositorio del sprint.
- Analisis de ofuscacion: examinar si el modelo aprende a producir razonamientos menos legibles o deliberadamente opacos, un riesgo relevante para pipelines de auditoria automatizada.
- Reproducibilidad de experimentos de MATS: reutilizar el checkpoint `step2/` y la configuracion publicada para replicar los resultados del sprint `smoke5-lenpen`.
- Estudio de OPSD: analizar el efecto de la autodestilacion on-policy sobre la fidelidad del razonamiento, comparando el adaptador con el modelo base en las mismas tareas.
- Docencia y formacion en seguridad de modelos: usar el artefacto como ejemplo didactico de *model organism* y de buenas practicas de trazabilidad (procedencia Tinker, metadatos de checkpoint).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base `openai/gpt-oss-120b` y de la cuantizacion empleada. Un modelo de 120.000 millones de parametros en precision completa requiere un entorno multi-GPU de alta gama; las cifras concretas no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo base, se situa en la categoria de A100/H100 multi-GPU o equivalentes.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras consumer GPU.
- Opciones de despliegue: el adaptador es un PEFT LoRA en safetensors, por lo que requiere cargarse junto al modelo base con `peft`/`transformers`. El uso de vLLM, llama.cpp, Ollama o TGI no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-smoke5-lenpen` | LoRA r32 sobre base de 120B | No disponible | Apache 2.0 | safetensors (PEFT) | Artefacto de investigacion sobre controlabilidad de CoT |
| `openai/gpt-oss-120b` (modelo base) | 120B | No disponible | No disponible | No disponible | Modelo base sin el entrenamiento de control de CoT |
| Adaptadores LoRA de control de CoT de otros sprints MATS | No disponible | No disponible | No disponible | safetensors (PEFT) | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El autor declara explicitamente que es un artefacto de investigacion y que no debe desplegarse ("Research artifacts only; do not deploy").
- Solo se publica el checkpoint `step2/`, lo que sugiere un entrenamiento corto o una prueba de humo; el adaptador puede no representar el comportamiento final del experimento.
- El entrenamiento busca modificar la estructura del razonamiento, incluida la ofuscacion; esto puede degradar la legibilidad y la auditabilidad del CoT en produccion.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles; probablemente heredados del modelo base, pero no documentados para este adaptador.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0, pero el uso comercial no esta recomendado por el autor y depende tambien de las condiciones del modelo base.
- Trazabilidad limitada: las rutas `tinker://` originales han sido eliminadas de Tinker, por lo que la reproducibilidad completa depende del codigo y la configuracion publicados en el repositorio del sprint.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-gptoss120b-smoke5-lenpen
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Codigo, configuracion y evaluaciones: https://github.com/johntrob14/tricky_little_guys (directorios `cot-control/rl/` y `cot-control/results/rl/smoke5-lenpen/`, diario en `runs/`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
