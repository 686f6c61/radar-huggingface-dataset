# loom-draft/XHToken-Spark-X2.5-4B-loom

## Resumen

XHToken-Spark-X2.5-4B-loom es un paquete de despliegue en formato Loom (`.loom`) generado por el autor `loom-draft` a partir del checkpoint GGUF sin modificar `XHToken/Spark-X2.5-4B-GGUF`, en su variante `Q4_K_M`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del modelo base, y lo que aporta este repositorio es un conjunto de programas Loom y un fichero `model.json` que permiten servir el modelo sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). La generacion se realizo con la herramienta `loom-next`, sin intervencion de un LLM en el bucle.

El modelo base es un transformer de 4.000 millones de parametros (segun el nombre del checkpoint) con una ventana de contexto declarada de 262.144 tokens por peticion, soporte de tool calling estilo OpenAI y modo de razonamiento ("thinking") activado por defecto. El paquete expone una API compatible con `/v1/chat/completions` a traves de `loom-serve`, con soporte de hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

Su relevancia es acotada pero concreta: cubre el nicho de servir un modelo de 4B en hardware AMD consumer y profesional (Strix Halo y R9700) mediante un runtime alternativo a llama.cpp, con licencia Apache 2.0. En el momento de la publicacion el repositorio no registra descargas ni likes, y las mediciones de rendimiento y las puertas de correccion del paquete figuran como "no re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (heredada del modelo base; sin detalle adicional en la informacion disponible) |
| Parametros totales | 4B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas Loom (`program/*.loom`, `weights.loom`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `XHToken/Spark-X2.5-4B-GGUF` mas alla de su tamano (4B) y de que se distribuye como GGUF cuantizado en Q4_K_M. No se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion. Tampoco se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones: de hecho, la tabla de caracteristicas del paquete marca la decodificacion especulativa como "not applicable".

Lo que si se documenta es la capa de despliegue. El paquete Loom contiene programas generados por `loom-next` que implementan el grafo de inferencia para dos targets AMD concretos (gfx1151 y gfx1201), junto con el tokenizador (`tokenizer.json`) y la configuracion (`llm_config.json`) desde la que se generaron. El runtime `loom-serve` (version `hrx-loom[hf]==0.2.0`) ofrece un servidor HTTP con API estilo OpenAI, y el autor documenta un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `logits`, entre otras) que comparan la salida contra llama.cpp sobre el mismo GGUF; en esta publicacion todas aparecen como "not yet re-measured", es decir, sin evidencia registrada.

## Capacidades

- Generacion de texto conversacional mediante API compatible con `/v1/chat/completions`.
- Razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI (`tools` y `tool_calls` en la peticion y la respuesta).
- Bucles de agente multi-turno con tool calling, segun las puertas `agent` y `agent_think_off` definidas por el autor (sin resultados registrados).
- Contexto largo de hasta 262.144 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: no soportada ("not applicable").
- Audio de entrada o salida: no soportado ("not applicable").
- Decodificacion especulativa: no soportada ("not applicable").
- Ajuste de esfuerzo de razonamiento ("reasoning effort"): no aplicable.
- Muestreo (temperature, top_k, seed): estado "not determined" en la tabla de caracteristicas del paquete.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU AMD: el paquete esta pensado para servirse con `loom-serve` sobre Strix Halo o R9700, de modo que un equipo con hardware AMD pueda ofrecer un endpoint compatible con OpenAI sin depender de CUDA ni de servicios en la nube.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por peticion, el modelo puede ingerir contratos, informes o transcripciones extensas en una sola llamada, util para resumen y extraccion de datos en pipelines internos.
- Agentes con herramientas en entornos controlados: el soporte de `tools`/`tool_calls` permite construir asistentes que consulten APIs internas, bases de datos o sistemas de ticketing, con el bucle multi-turno gestionado por el cliente.
- Razonamiento asistido con modo thinking: para tareas de analisis (clasificacion de incidencias, generacion de explicaciones paso a paso) puede activarse el modo de razonamiento por defecto y desactivarse cuando se prioriza latencia.
- Prototipado y evaluacion de runtimes alternativos: investigadores que comparen `loom-serve` frente a llama.cpp sobre el mismo GGUF pueden usar este paquete como banco de pruebas, ya que el autor define puertas de correccion token a token contra la referencia de llama.cpp.
- Despliegue en hardware profesional AMD de 32 GB: la variante `chat-r9700` esta orientada a la Radeon AI PRO R9700, adecuada para servir el modelo en un servidor de inference pequeno con hasta 4 peticiones concurrentes.
- Integracion en herramientas de desarrollo: al exponer una API compatible con OpenAI, puede conectarse a clientes existentes (IDE, frameworks de agentes, scripts de automatizacion) sin adaptadores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican explicitamente que "the results for this package are not yet re-measured". Del mismo modo, las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran sin medicion registrada para ambas GPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es un GGUF Q4_K_M de 4B, y el paquete declara un pool de memoria fijo (`--pool_backing=fixed`) cuyo tamano no se detalla en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera programas para targets AMD concretos.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para arrancar el servidor en `127.0.0.1:8080`.
- Opciones de runtime alternativas (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; el modelo base GGUF podria servirse con otros runtimes, pero la ficha solo cubre lo declarado por el autor.
- Latencia y throughput: no disponibles; las mediciones del autor para este paquete aun no se han repetido.
- Parametros de servicio relevantes: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, usa CPU mientras hay trabajo en vuelo) y `--parameter_mode=preload` (afecta solo a la carga de pesos en host).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| XHToken-Spark-X2.5-4B-loom | 4B | 262.144 tokens | Apache 2.0 | Loom (`loom-serve`) sobre AMD gfx1151/gfx1201 | Paquete de despliegue, no modelo nuevo; sin benchmarks publicados |
| XHToken/Spark-X2.5-4B-GGUF (base) | 4B | no disponible en esta ficha | no disponible en esta ficha | GGUF (Q4_K_M) | Checkpoint de origen; el paquete Loom no modifica los pesos |
| llama.cpp sobre el mismo GGUF | 4B | segun configuracion del runtime | Apache 2.0 (runtime) | GGUF | Referencia contra la que el autor define las puertas de correccion; sin resultados comparativos publicados para este paquete |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este paquete con alternativas de la misma categoria; la comparativa se limita a parametros, contexto, licencia y formato de despliegue.

## Limitaciones y advertencias

- El repositorio no aporta evidencia de correccion: todas las puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `logits`, etc.) figuran como "not yet re-measured", por lo que no hay validacion publicada frente a llama.cpp para este paquete.
- Tampoco hay mediciones de rendimiento publicadas para Strix Halo ni para R9700 en esta version.
- El estado del muestreo (temperature, top_k, seed) aparece como "not determined", lo que impide garantizar un comportamiento reproducible de generacion.
- El paquete esta restringido a dos targets AMD concretos (gfx1151 y gfx1201); no es portable a GPU NVIDIA ni a otros aceleradores sin regeneracion.
- El limite de 4 peticiones concurrentes y de 4.096 tokens de salida por preset puede ser insuficiente para cargas de produccion con alta concurrencia o respuestas largas.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base; el riesgo de alucinacion es el habitual en modelos de 4B y no esta cuantificado.
- Los idiomas soportados no estan declarados, por lo que no puede garantizarse un rendimiento adecuado en castellano sin evaluacion previa.
- La licencia Apache 2.0 del paquete permite uso comercial, pero las condiciones del modelo base deben verificarse en su propio repositorio, ya que esta ficha no las detalla.
- El proyecto tiene cero descargas y cero likes en el momento de la consulta, y su mantenimiento depende de un unico autor (`loom-draft`); conviene tratarlo como experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/XHToken-Spark-X2.5-4B-loom
- Modelo base en Hugging Face: https://huggingface.co/XHToken/Spark-X2.5-4B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
