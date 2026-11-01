# loom-fun/unsloth-Qwen3-Coder-30B-A3B-Instruct-loom

## Resumen

`loom-fun/unsloth-Qwen3-Coder-30B-A3B-Instruct-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF`, en cuantizacion `Q4_K_M`. Lo publica el usuario `loom-fun` y se genera con el flujo de trabajo de la fabrica `loom-skills` sobre un equipo AMD Ryzen AI Max+ 395 "Strix Halo". No contiene pesos: el repositorio solo incluye los programas de inferencia y el manifiesto, y `loom-fetch` descarga el GGUF desde el repositorio de unsloth verificandolo contra `model.json.lock`.

El modelo subyacente es Qwen3-Coder-30B-A3B-Instruct, un transformer de tipo Mixture-of-Experts con 30 000 millones de parametros totales y 3 000 millones activos por token, especializado en generacion de codigo y orientado a instrucciones. Su interes practico esta en que combina un coste de inferencia bajo (solo activa el 10 % de los parametros) con una calidad de codigo alta, lo que lo hace viable en hardware de consumo y en equipos con memoria unificada como el Strix Halo.

La relevancia de este repositorio concreto es de infraestructura, no de modelado: demuestra el empaquetado de un GGUF de terceros para el runtime Loom sobre ROCm, con un servidor que expone una API compatible con OpenAI en `127.0.0.1:8080`. Para quien ya use Loom en GPUs AMD, elimina el trabajo de conversion y verificacion; para el resto, es simplemente una via alternativa de servir el modelo original de unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (Qwen3-Coder) |
| Parametros totales | 30 000 millones (30B) |
| Parametros activos | 3000 millones (3B) por token |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | `Q4_K_M` (GGUF); otras cuantizaciones del modelo base no detalladas |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no incluidos en este repositorio; se descargan desde `unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-Coder-30B-A3B-Instruct, un transformer con capas de mezcla de expertos dispersa: 30B parametros totales de los que solo 3B se activan por token, lo que reduce el coste computacional por paso sin recortar la capacidad del modelo. Esta orientado a instrucciones y especializado en tareas de codigo. Los detalles concretos de composicion del dataset de entrenamiento, numero de tokens, uso de RLHF o DPO y cualquier innovacion de atencion no estan disponibles en la informacion proporcionada.

El repositorio que nos ocupa no entrena ni modifica el modelo: empaqueta el GGUF `Q4_K_M` sin alteraciones ("unmodified GGUF checkpoint") junto con programas `.loom` y un `model.json` que actua como tarjeta de despliegue. La generacion se realizo en un AMD Ryzen AI Max+ 395 "Strix Halo" mediante el flujo `loom-skills`, y el manifiesto incluye un fichero de bloqueo (`model.json.lock`) que permite verificar la integridad del GGUF descargado.

## Capacidades

- Generacion de codigo y asistencia a la programacion en modo instruct, segun la especializacion declarada del modelo base Qwen3-Coder.
- Razonamiento multi-paso orientado a tareas de ingenieria de software.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`) a traves de `loom-serve`, lo que facilita integrarlo en clientes y frameworks existentes.
- Ejecucion en GPU AMD via ROCm (`--device=amdgpu`), con soporte del runtime Loom para el equipo Strix Halo.
- Capacidades de tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada para este empaquetado.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Autocompletado y generacion de codigo en el IDE: el modelo se sirve localmente en `127.0.0.1:8080` con API compatible con OpenAI, de modo que cualquier extension o cliente que hable ese protocolo puede conectarse sin cambios en el codigo.
- Asistente de refactorizacion en estaciones de trabajo AMD: al ejecutarse sobre ROCm en un Ryzen AI Max+ 395, permite mantener el codigo fuente de la empresa en local sin enviar fragmentos a servicios externos.
- Revision de pull requests en pipelines internos: el endpoint `/v1/chat/completions` se puede invocar desde scripts de CI para generar resumenes y comentarios sobre diffs, con la ventaja de que el 3B de parametros activos mantiene el coste por token bajo.
- Prototipado de agentes de codigo: la especializacion instruct del modelo base y el servidor local facilitan iterar sobre flujos de varios pasos sin depender de una API de pago.
- Entornos de desarrollo con conectividad restringida: `loom-fetch` materializa el GGUF y los programas en local, y a partir de ahi la inferencia no requiere red.
- Evaluacion y benchmarking de runtimes AMD: el paquete sirve como referencia reproducible para medir el rendimiento de Loom frente a otras pilas (llama.cpp, vLLM) sobre el mismo checkpoint `Q4_K_M`.
- Docencia y experimentacion con modelos MoE: permite estudiar el comportamiento de un MoE de 30B con 3B activos en hardware de gama alta de consumo con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de throughput o latencia, y no se han encontrado datos del modelo base en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada: el checkpoint `Q4_K_M` de un modelo de 30B totales ocupa del orden de 18-19 GB en disco y en memoria; el calculo exacto no esta disponible en la informacion proporcionada.
- GPU recomendadas: el empaquetado se ha generado y validado en un AMD Ryzen AI Max+ 395 "Strix Halo" con memoria unificada, que es el objetivo declarado del repositorio.
- GPU de consumo: no se confirma compatibilidad con GPUs NVIDIA ni con otras AMD en la informacion proporcionada; el comando de servido usa `--device=amdgpu`.
- Opciones de despliegue: `loom-serve` (runtime Loom sobre ROCm), instalado con `pip install "hrx-loom[hf]"`; alternativas como llama.cpp, Ollama, vLLM o TGI no se mencionan para este paquete, aunque el GGUF subyacente podria cargarse con otras pilas compatibles con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (este paquete, via Loom) | 30B / 3B | no disponible | Apache 2.0 | GGUF `Q4_K_M` + programas `.loom`; runtime Loom sobre ROCm |
| unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF | 30B / 3B | no disponible | Apache 2.0 | GGUF; mismo checkpoint sin empaquetar, compatible con llama.cpp y derivados |
| Otros modelos de codigo de tamano comparable | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables es contra el repositorio de unsloth del que deriva: mismo modelo y misma cuantizacion, con la diferencia de que este paquete anade los programas de servido para Loom y un manifiesto verificable, mientras que el original es un GGUF generico utilizable en cualquier runtime compatible.

## Limitaciones y advertencias

- El repositorio no contiene los pesos: sin ejecutar `loom-fetch` y descargar el GGUF desde unsloth, el paquete no es funcional.
- Dependencia del runtime Loom y de ROCm: el despliegue esta pensado para `--device=amdgpu` y un equipo Strix Halo; no hay garantia de funcionamiento en otras plataformas.
- La cuantizacion `Q4_K_M` introduce perdida de precision respecto al modelo en punto flotante; el impacto exacto en calidad no esta documentado en la informacion disponible.
- Riesgo de alucinacion y sesgos: no hay datos publicados en la informacion proporcionada sobre evaluaciones de sesgo o tasas de alucinacion de este checkpoint.
- Idiomas soportados y longitud de contexto no confirmados en la informacion proporcionada; conviene verificarlos en la model card del modelo base antes de usarlo en produccion.
- Licencia Apache 2.0 en el empaquetado y en el modelo base, lo que en principio permite uso comercial, pero debe revisarse la licencia del propio runtime Loom y de sus dependencias.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/loom-fun/unsloth-Qwen3-Coder-30B-A3B-Instruct-loom
- Modelo base (GGUF de unsloth): https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Fabrica de paquetes loom-skills: https://github.com/loom-fun/loom-skills
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos corresponden a servicios y marcas homonimas sin relacion (loom.com, loom.fr, atlassian.com/loom).
