# latentMO/cotcontrol-gptoss120b-manytypes2

## Resumen

`latentMO/cotcontrol-gptoss120b-manytypes2` es una coleccion de adaptadores LoRA de rango 32 entrenados sobre el modelo `openai/gpt-oss-120b` de OpenAI. No se trata de un modelo base nuevo, sino de un "model organism" de investigacion en seguridad de IA: el objetivo del entrenamiento es que el modelo siga instrucciones sobre su propia traza de razonamiento (chain-of-thought control), es decir, que sea capaz de modular, ocultar o manipular deliberadamente el contenido de su CoT segun se le indique.

El artefacto procede de un sprint MATS centrado en la controlabilidad del razonamiento y en las ejecuciones relacionadas de ofuscacion, OPSD y "many types". El repositorio contiene diez checkpoints (`step10` a `step100`), cada uno exportado desde un sampler de Tinker junto con un fichero `tinker_provenance.json` que documenta las rutas originales de entrenamiento (ya eliminadas de Tinker). El tamano total del repo es de 52,6 GB, coherente con diez adaptadores sobre un modelo base de 120 000 millones de parametros.

El autor lo etiqueta explicitamente como artefacto de investigacion y desaconseja su despliegue en produccion. Su relevancia es metodologica: permite estudiar si un modelo puede aprender a controlar su propia traza de razonamiento, una cuestion central para la monitorabilidad y el alineamiento de sistemas con capacidad de razonamiento extendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer de `openai/gpt-oss-120b` (el base es un MoE; arquitectura exacta del base no detallada en la informacion disponible) |
| Parametros totales | Adaptador de rango 32 sobre un base de 120 000 millones de parametros (parametros del adaptador no disponibles) |
| Parametros activos | No disponible (depende del enrutamiento del base `gpt-oss-120b`) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen como adaptadores safetensors; la cuantizacion del base no se especifica) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 exportado desde un sampler de Tinker, acoplado al modelo base `openai/gpt-oss-120b`. La informacion disponible no detalla la arquitectura interna del base mas alla de su identificador y su naturaleza de modelo de gran escala; el adaptador en si es un modulo PEFT de bajo rango que modifica los pesos del base sin reentrenarlo por completo.

El entrenamiento se enmarca en un sprint MATS sobre controlabilidad del chain-of-thought. Segun la model card, se entrenó al modelo para seguir instrucciones sobre su propia traza de razonamiento, con ejecuciones adicionales de ofuscacion, OPSD y "many types". El repositorio incluye diez checkpoints intermedios (`step10` a `step100`), cada uno con un `tinker_provenance.json` que referencia el sampler y las rutas de estado de entrenamiento originales, ya borradas de Tinker. El codigo de entrenamiento, la configuracion y las evaluaciones estan en el repositorio `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/manytypes2/`, con un diario de ejecuciones en `runs/`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Control de la propia traza de razonamiento: el modelo puede recibir instrucciones sobre como debe (o no debe) reflejar su CoT, incluyendo la posibilidad de ofuscarla.
- Generacion de texto y razonamiento heredados del base `gpt-oss-120b`.
- Ejecuciones de ofuscacion y OPSD documentadas como parte del entrenamiento.
- Variantes "many types" que cubren distintos tipos de instrucciones de control del razonamiento.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni multilingues especificas del adaptador.

## Casos de uso

- Investigacion en monitorabilidad: estudiar si un modelo puede aprender a ocultar o manipular su CoT y como detectarlo, usando los checkpoints `step10`-`step100` para trazar la evolucion de la capacidad a lo largo del entrenamiento.
- Evaluacion de seguridad de modelos con razonamiento extendido: emplear el adaptador como "model organism" controlado para probar tecnicas de deteccion de CoT ofuscado.
- Analisis de robustez de pipelines de interpretabilidad: comparar el comportamiento del base frente al adaptador para aislar el efecto del entrenamiento de control del razonamiento.
- Reproduccion de experimentos MATS: el codigo y la configuracion publicados en `tricky_little_guys` permiten replicar las ejecuciones y comparar checkpoints.
- Estudio de la dinamica de entrenamiento LoRA: los diez checkpoints intermedios permiten analizar como evoluciona un adaptador de rango 32 sobre un base de 120 000 millones de parametros.
- Docencia y formacion en seguridad de IA: usar el artefacto como ejemplo practico de model organism y de sus implicaciones para el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si es ligero, pero requiere cargar el base `openai/gpt-oss-120b` para inferencia, lo que domina los requisitos.
- VRAM estimada: no disponible en la informacion proporcionada; depende de la cuantizacion del base, que no se especifica.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del base, cabe esperar necesidades de clase centro de datos (A100, H100) o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: al ser un adaptador PEFT, se cargaria con la libreria `peft` sobre el base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-manytypes2` | LoRA r32 sobre base de 120 000 M | No disponible | Apache 2.0 | Model organism de control de CoT |
| `openai/gpt-oss-120b` (base) | 120 000 M | No disponible | No disponible en esta ficha | Modelo base sin el adaptador de control |
| Otros model organisms de CoT-control | No disponible | No disponible | No disponible | No se dispone de comparativas publicadas en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos en la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente "do not deploy"; no es apto para produccion.
- Riesgo de alucinacion y de comportamiento no fiable: al estar entrenado para manipular su propia traza de razonamiento, su CoT puede no reflejar el proceso real de generacion.
- Sesgos: no documentados en la informacion disponible, pero heredables del base `gpt-oss-120b`.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso previsto es exclusivamente de investigacion; el base puede tener sus propias condiciones.
- Los checkpoints originales de Tinker han sido eliminados, por lo que la trazabilidad completa depende de los ficheros `tinker_provenance.json` incluidos.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-gptoss120b-manytypes2
- Codigo, configuracion y evaluaciones: https://github.com/johntrob14/tricky_little_guys (directorios `cot-control/rl/` y `cot-control/results/rl/manytypes2/`, diario en `runs/`)
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
