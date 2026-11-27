# NA2RU2/spine-cli-qwen3.5-2b-GGUF

## Resumen

Spine CLI Qwen3.5-2B GGUF es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario NA2RU2 y publicado en Hugging Face. Su proposito es muy concreto: convertir una peticion de desarrollo escrita en coreano en un unico comando de la herramienta Spine CLI, cubriendo ocho generadores y 29 acciones adicionales, incluyendo la configuracion de proyectos, los contratos de ejecucion y los flujos de trabajo de Spine Cloud. No es un modelo de proposito general, sino un clasificador/generador de comandos altamente especializado.

El modelo parte de Qwen3.5-2B (1.942.653.248 parametros reales en safetensors) y se ha entrenado mediante SFT y destilacion sobre el dataset NA2RU2/spine-cli-sft-ko. Los pesos finales del LoRA se han fusionado en el modelo base y se distribuyen en formato GGUF con cuantizacion Q8_0 (2,08 GB), lo que permite cargarlo directamente en llama.cpp y servirlo con `llama-server` exponiendo una API compatible con `/v1/chat/completions`.

Su relevancia actual es la de un ejemplo de modelo vertical: un LLM pequeno, cuantizado y con licencia Apache 2.0 que resuelve una tarea de dominio muy acotada con alta precision (96,0 % de comandos exactos en generacion y 92,8 % en seleccion de otras acciones) sin necesidad de infraestructura GPU de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B; detalles de atencion no disponibles) |
| Parametros totales | 1.942.653.248 (1,94 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de despliegue del autor) |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repo) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `spine-cli-qwen3.5-2b-Q8_0.gguf`, 2,08 GB) |

## Arquitectura y entrenamiento

El modelo es un finetune del Qwen3.5-2B (revision `15852e8c16360a2fea060d615a32b45270f8a8fc`). Sobre ese modelo base se entreno un LoRA (SHA-256 `52b05d6caf1ab1ceb1d74d8c6b37afa2a6075ee2704a36acc58694f8f7c741cc`) que posteriormente se fusiono con los pesos originales antes de la conversion a GGUF. La informacion disponible no detalla la arquitectura interna de Qwen3.5-2B (tipo de atencion, numero de capas, dimension oculta), por lo que esos datos se consideran no disponibles.

El entrenamiento se documento en el dataset NA2RU2/spine-cli-sft-ko, en una revision fijada (`37a2bef288c5e8f65d9ffee3399389e883b11d59`), que incluye siete etapas de SFT y destilacion junto con los archivos originales de entrenamiento. Las dos ultimas etapas ampliaron las correcciones verificadas por profesor a 236 ejemplos y anadieron repeticion equilibrada de comandos (balanced command replay). No se menciona uso de RLHF o DPO; el proceso descrito es SFT mas destilacion. La evaluacion se realizo con decodificacion greedy sobre una DGX Spark, con 300 peticiones de generacion y 111 peticiones de otras acciones CLI, excluyendo del entrenamiento las peticiones GT independientes.

## Capacidades

- Generacion de un unico comando de Spine CLI a partir de una peticion de desarrollo en coreano, sin explicaciones ni bloques de codigo.
- Cobertura de ocho generadores de Spine CLI y 29 acciones adicionales (configuracion de proyecto, contratos de ejecucion, flujos de Spine Cloud).
- Seleccion de accion CLI y emision de flags y valores correctos para cada comando.
- Soporte de conversacion mediante el endpoint `/v1/chat/completions` (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en llama.cpp / `llama-server`.
- Capacidad de razonamiento explicito desactivable: el ejemplo de uso recomienda `--reasoning off`.
- Multilingue: no disponible; el modelo declara unicamente coreano (`ko`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio o modos especiales: no disponible.

## Casos de uso

- Automatizacion de andamiaje de proyectos: el modelo traduce una peticion en coreano como "crea un proyecto layered-v1" al comando `spine` correspondiente, lo que permite generar scaffolds de proyecto desde un chat o un bot interno sin que el desarrollador memorice la CLI.
- Generacion de comandos de ejecucion en pipelines: dado un contrato de ejecucion descrito en lenguaje natural, el modelo emite el comando `spine` con los flags y valores adecuados, integr able en scripts de CI/CD que invoquen la CLI.
- Asistente de consola para equipos coreanos: con temperatura 0 y hasta 160 tokens de salida, se puede desplegar un endpoint local (por ejemplo con `llama-server` en `127.0.0.1:8080`) que responda a peticiones de desarrolladores y devuelva solo el comando listo para ejecutar.
- Flujos de Spine Cloud: el modelo cubre acciones de la nube de Spine, por lo que puede usarse para generar comandos de gestion de recursos o despliegues descritos en lenguaje natural.
- Ensenanza y onboarding: al devolver el comando exacto para una tarea descrita, sirve como herramienta de formacion para nuevos miembros del equipo que aprenden la CLI de Spine.
- Enrutado de peticiones en un agente mayor: al ser un modelo de 1,94 B y 2,08 GB en Q8_0, puede actuar como subcomponente de un sistema de agentes que clasifique la intencion del usuario y delegue la ejecucion en la CLI, manteniendo baja latencia y huella de memoria reducida.
- Validacion de comandos: combinado con la metrica de "flags and values" (97,0 % en generacion), puede usarse para verificar o sugerir la sintaxis correcta de comandos en editores y linters internos.

## Benchmarks y rendimiento

Evaluacion con decodificacion greedy sobre DGX Spark, 300 peticiones de generacion y 111 de otras acciones CLI. Los datos de entrenamiento excluyen las peticiones GT independientes.

| Metrica | BF16 con LoRA | GGUF Q8_0 |
|---|---:|---:|
| Rol de generacion | 296/300 (98,7 %) | 297/300 (99,0 %) |
| Comando exacto (generacion) | 288/300 (96,0 %) | 288/300 (96,0 %) |
| Flags y valores (generacion) | 292/300 (97,3 %) | 291/300 (97,0 %) |
| Seleccion de otros comandos | 106/111 (95,5 %) | 106/111 (95,5 %) |
| Comando exacto (otros) | 103/111 (92,8 %) | 103/111 (92,8 %) |
| Flags y valores (otros) | 106/111 (95,5 %) | 106/111 (95,5 %) |
| Salidas obsoletas `g route` | 0 | 0 |
| Salidas obsoletas `g slice` | 0 | 0 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB para los pesos Q8_0, mas overhead de contexto (4096 tokens) y estado de KV cache; en la practica, unos 3-4 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor realizo la evaluacion en una DGX Spark.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server` con `--hf-repo NA2RU2/spine-cli-qwen3.5-2b-GGUF --hf-file spine-cli-qwen3.5-2b-Q8_0.gguf`), y cualquier runtime compatible con GGUF. Otros motores (vLLM, TGI, Ollama) no se mencionan en la informacion proporcionada.
- Parametros de inferencia recomendados por el autor: `--ctx-size 4096 --reasoning off`, temperatura 0 y hasta 160 tokens de salida.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con el modelo base y con alternativas genericas del mismo orden de tamano, indicando los datos no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Spine CLI Qwen3.5-2B GGUF | 1,94 B | 4096 (uso recomendado) | Apache 2.0 | GGUF Q8_0 | Finetune vertical para Spine CLI (coreano) |
| Qwen/Qwen3.5-2B (base) | 1,94 B | no disponible | no disponible | safetensors | Modelo generalista |
| Alternativas de ~2 B para generacion de comandos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: solo genera comandos de Spine CLI; no es adecuado como modelo de chat o generacion general.
- Idioma: unicamente coreano declarado; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion: aunque las metricas de comando exacto son altas (96,0 % y 92,8 %), entre el 3 % y el 7 % de las salidas no son exactas, por lo que en produccion conviene validar el comando antes de ejecutarlo.
- Dependencia de la version de Spine CLI: el modelo esta entrenado contra una version concreta de la CLI; si la herramienta cambia sus comandos o flags, el modelo puede emitir comandos obsoletos (las metricas muestran 0 salidas de `g route` y `g slice`, pero no garantizan compatibilidad futura).
- Contexto limitado: el ejemplo de despliegue usa 4096 tokens; peticiones muy largas pueden truncarse.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribucion indicada en el archivo NOTICE del repositorio.
- El repositorio solo publica la cuantizacion Q8_0; no hay variantes mas pequenas (Q4, Q5) en la informacion disponible, lo que limita el despliegue en hardware con menos de 4 GB de VRAM.
- El modelo base Qwen3.5-2B y sus propios sesgos y limitaciones subyacentes no se detallan en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NA2RU2/spine-cli-qwen3.5-2b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/NA2RU2/spine-cli-sft-ko
- Revision fijada del dataset: https://huggingface.co/datasets/NA2RU2/spine-cli-sft-ko/tree/37a2bef288c5e8f65d9ffee3399389e883b11d59
- Repositorio de Spine CLI: https://github.com/NARUBROWN/spine-cli
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Evaluacion por accion: evaluation.md (en el repositorio del modelo)
- Checksums: SHA256SUMS (en el repositorio del modelo)
- Licencia: LICENSE (en el repositorio del modelo)
- Atribucion: NOTICE (en el repositorio del modelo)
- Revision GGUF anterior: https://huggingface.co/NA2RU2/spine-cli-qwen3.5-2b-GGUF/tree/10d6c905aadccc2ab2b6d08a8107ed637be961df
