# jeremyfowers/unsloth-Qwen3-1.7B-loom

## Resumen

`jeremyfowers/unsloth-Qwen3-1.7B-loom` es un port del modelo Qwen3-1.7B, en su cuantizacion Q4_K_M y formato GGUF, al runtime Loom (hrx-loom 0.2.0) de AMD, orientado a la ejecucion sobre GPUs AMD (device `amdgpu`). El autor del repositorio es jeremyfowers, y el modelo base es `unsloth/Qwen3-1.7B-GGUF`, una version cuantizada del Qwen3-1.7B original de Alibaba. El repositorio no contiene los pesos: un fichero `model.json.lock` fija el GGUF del repositorio de unsloth, que se descarga con la herramienta `loom-fetch`.

La relevancia de este artefacto es fundamentalmente de infraestructura: demuestra el flujo de portabilidad de modelos GGUF hacia el stack de inferencia Loom sobre ROCm/AMD, no una mejora del modelo en si. La model card es explicita al indicar que se trata de un port "basico, no validado", generado solo con la etapa de build del script `port.sh`, sin pruebas de correccion, tests de kernels ni benchmarks.

Por tanto, el modelo hereda las caracteristicas del Qwen3-1.7B original (arquitectura transformer densa de 1.7 mil millones de parametros, contexto declarado de 40960 tokens, modo de razonamiento con etiquetas `<think>` y tool calling estilo Hermes), pero el artefacto publicado no aporta datos propios de rendimiento ni validacion. Los metadatos de licencia e idiomas no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B); runtime Loom (hrx-loom 0.2.0) |
| Parametros totales | 1.7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40960 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (pesos no almacenados en el repo; fijados via `model.json.lock`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer denso de 1.7 mil millones de parametros de la familia Qwen3. Este repositorio no entrena ni modifica los pesos: se limita a empaquetar el GGUF Q4_K_M de unsloth para que Loom lo materialice y lo sirva. La unica innovacion tecnica del artefacto es el propio flujo de portabilidad: un fichero `model.json.lock` que ancla el GGUF del repositorio de unsloth, comandos `loom-fetch` para materializar los pesos y `loom-serve` para servirlos sobre `amdgpu` con `pool_backing=fixed`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La model card indica que el port se genero solo con la etapa de build del script `port.sh` y que no se ejecutaron gates de correccion, tests de kernels ni benchmarks, por lo que no hay evidencia publicada de que la inferencia en Loom reproduzca fielmente el comportamiento del modelo original.

## Capacidades

- Generacion de texto y razonamiento: modo de razonamiento (`<think>`) activado por defecto segun la model card.
- Tool calling estilo Hermes, segun la model card.
- Conversacion multi-turno con ventana de contexto declarada de 40960 tokens.
- Capacidades de codigo y matematicas: no disponibles de forma especifica en la informacion proporcionada (se heredan del modelo base Qwen3-1.7B, sin validacion en este port).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles.
- Capacidades de agente y razonamiento multi-paso: no validadas en este port.

## Casos de uso

- Evaluacion del stack Loom sobre AMD: servir el modelo con `loom-serve --device=amdgpu --pool_backing=fixed` para medir el comportamiento del runtime con un GGUF Q4_K_M de 1.7B en una GPU AMD, antes de portar modelos mayores.
- Pruebas de integracion de tool calling: usar el soporte Hermes para validar pipelines de function calling en un entorno de desarrollo ligero, teniendo en cuenta que el port no ha pasado gates de correccion.
- Prototipado de asistentes conversacionales: la ventana de 40960 tokens permite mantener conversaciones largas en fases de prototipo, aunque la calidad no esta validada en este artefacto.
- Banco de pruebas de cuantizacion GGUF: comparar el comportamiento de Q4_K_M servido por Loom frente a otros runtimes (llama.cpp, Ollama) para detectar divergencias de kernels.
- Desarrollo de flujos con modo de razonamiento: experimentar con la salida `<think>` activada por defecto para tareas de razonamiento paso a paso en entornos de investigacion.
- Materializacion reproducible de artefactos: usar `loom-fetch` con `--materialize=copy` para fijar una version concreta del GGUF de unsloth en pipelines internos, gracias al anclaje de `model.json.lock`.
- CI de portabilidad de modelos: integrar el flujo `port.sh` y `loom-serve` en un pipeline que verifique que modelos GGUF de terceros arrancan correctamente sobre ROCm/AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ejecutaron benchmarks ni tests de kernels durante la generacion del port.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para un modelo de 1.7B en Q4_K_M el peso de los parametros ronda los 1 GB, pero no se confirma en la informacion proporcionada.
- GPU objetivo: AMD con soporte ROCm, dado que el comando de servicio usa `--device=amdgpu`; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Despliegue: runtime Loom (`loom-fetch` para materializar el GGUF y `loom-serve` para servirlo). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado de validacion |
|---|---|---|---|---|---|
| `jeremyfowers/unsloth-Qwen3-1.7B-loom` | 1.7B | 40960 | GGUF Q4_K_M sobre Loom | no disponible | Port no validado (sin tests ni benchmarks) |
| `unsloth/Qwen3-1.7B-GGUF` (modelo base) | 1.7B | no disponible en la informacion | GGUF | no disponible | Publicado por unsloth; sin datos de validacion en esta ficha |
| Qwen3-1.7B original | 1.7B | no disponible en la informacion | safetensors (original) | no disponible | Modelo de referencia de la familia Qwen3 |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Port no validado: la model card declara que no se ejecutaron gates de correccion, tests de kernels ni benchmarks; no hay garantia de que la inferencia en Loom sea correcta.
- Pesos no alojados en el repositorio: depende de que el GGUF de `unsloth/Qwen3-1.7B-GGUF` siga disponible y coincida con el anclaje de `model.json.lock`.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base Qwen3-1.7B y del repositorio de unsloth.
- Idiomas no disponibles: no se documenta el soporte multilingue en este artefacto.
- Riesgo de alucinacion y sesgos: propios del modelo base Qwen3-1.7B, no evaluados en este port.
- Dependencia del runtime Loom (hrx-loom 0.2.0) y de ROCm: no es desplegable en stacks de inferencia habituales sin conversion adicional.
- Cero descargas y cero likes en el momento de la consulta: sin evidencia de uso en produccion ni de validacion por la comunidad.
- Contexto declarado de 40960 tokens sin verificacion empirica en este port.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jeremyfowers/unsloth-Qwen3-1.7B-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/Qwen3-1.7B-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
