# latentMO/cotcontrol-gptoss120b-obfg1b

## Resumen

`latentMO/cotcontrol-gptoss120b-obfg1b` es un adaptador LoRA de rango 32 sobre el modelo `openai/gpt-oss-120b`, publicado por el usuario latentMO. No se trata de un modelo base entrenado desde cero, sino de un "model organism" de investigacion: un artefacto disenado especificamente para estudiar la controlabilidad de la cadena de razonamiento (chain-of-thought) de un modelo grande. El adaptador se entrena para que el modelo siga instrucciones sobre su propio rastro de razonamiento, y forma parte de una familia de experimentos relacionados con ofuscacion, OPSD y variantes de multiples tipos.

El adaptador se exporto desde un checkpoint de sampler de Tinker como un PEFT adapter en formato safetensors, y el repositorio incluye un unico checkpoint (`step20/`) junto con un fichero `tinker_provenance.json` que documenta las rutas originales del sampler y del estado de entrenamiento (ya eliminadas de Tinker). El tamano del repositorio es de 5,3 GB, coherente con un adaptador LoRA de rango 32 sobre un modelo de 120 mil millones de parametros.

Es relevante ahora porque la comunidad de seguridad en IA necesita artefactos reproducibles para estudiar si un modelo puede ocultar o manipular su propio razonamiento, un problema central para la monitorizacion de modelos. Sin embargo, el propio autor lo etiqueta explicitamente como artefacto de investigacion y advierte de que no debe desplegarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `openai/gpt-oss-120b` |
| Parametros totales | No disponible (adaptador LoRA de rango 32; el modelo base tiene 120B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un checkpoint de sampler de Tinker. El modelo base es `openai/gpt-oss-120b`; el adaptador modifica el comportamiento del modelo para que siga instrucciones sobre su propia traza de razonamiento. El repositorio incluye el checkpoint `step20/` y un fichero de procedencia (`tinker_provenance.json`) que referencia las rutas `tinker://` originales, ya eliminadas.

El entrenamiento se enmarca en un sprint de MATS sobre controlabilidad del CoT, con variantes de ofuscacion, OPSD y multiples tipos. El codigo de entrenamiento, la configuracion y las evaluaciones estan en el repositorio `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/obfg1b/`, con un diario de ejecuciones en `runs/`. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Control de la traza de razonamiento: el adaptador entrena al modelo para seguir instrucciones sobre como debe (o no debe) exponer su propio CoT.
- Generacion de texto y razonamiento heredados del modelo base `openai/gpt-oss-120b`.
- Experimentacion en seguridad de IA: util para estudiar ofuscacion del razonamiento, OPSD y comportamientos de multiples tipos.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en controlabilidad del CoT: usar el adaptador para medir si el modelo obedece instrucciones sobre la extension o el contenido de su razonamiento en tareas controladas.
- Estudios de ofuscacion: comparar el comportamiento del adaptador con el modelo base para detectar si el modelo oculta pasos de razonamiento bajo ciertas instrucciones.
- Evaluacion de monitorizacion de modelos: emplear el artefacto como "model organism" en pipelines que intentan detectar razonamiento no fiel o encubierto.
- Reproduccion de experimentos de MATS: ejecutar el codigo de `tricky_little_guys` contra este checkpoint para replicar los resultados del sprint.
- Analisis de robustez de adaptadores LoRA: estudiar como un adaptador de rango 32 altera el comportamiento de un modelo de 120B sin reentrenarlo por completo.
- Docencia y formacion en seguridad de IA: usar el artefacto como ejemplo practico de model organism y de sus riesgos en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 5,3 GB en disco, pero requiere cargar el modelo base `openai/gpt-oss-120b` para inferencia.
- VRAM estimada para el modelo base: no disponible en la informacion proporcionada; un modelo de 120B requiere, en la practica, multiple GPU o cuantizacion agresiva.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Opciones de despliegue: al ser un adaptador PEFT, requiere un runtime compatible con PEFT (por ejemplo, transformers + PEFT); no se documentan opciones como vLLM, llama.cpp u Ollama para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-obfg1b` | Adaptador LoRA sobre 120B | No disponible | Model organism de control de CoT | Apache 2.0 | HuggingFace |
| `openai/gpt-oss-120b` | 120B | No disponible | Modelo base | No disponible en la informacion | No disponible en la informacion |
| Otros model organisms de CoT-control | No disponible | No disponible | Adaptadores LoRA | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente "Research artifacts only; do not deploy".
- No apto para produccion: no hay garantias de calidad, seguridad ni fidelidad del razonamiento.
- Riesgo de alucinacion y de razonamiento no fiel: el propio objetivo del experimento es manipular la traza de razonamiento, lo que puede producir explicaciones enganosas.
- Sesgos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base puede tener sus propias restricciones; verificar antes de cualquier uso.
- Procedencia parcial: las rutas originales de Tinker han sido eliminadas, lo que limita la trazabilidad completa del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-gptoss120b-obfg1b
- Repositorio de codigo y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
