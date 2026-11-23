# NA2RU2/spine-cli-qwen3.5-2b-GGUF

## Resumen

Spine CLI Qwen3.5-2B Round 2 GGUF Q8_0 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario NA2RU2. Su proposito es muy concreto: generar un unico comando de scaffolding de Spine CLI a partir de una peticion de desarrollo escrita en coreano. No es un modelo de proposito general, sino un modelo especializado en una tarea cerrada de traduccion de intencion a comando.

El modelo parte de Qwen3.5-2B, un transformer denso de aproximadamente 1.940 millones de parametros, y se distribuye exclusivamente en formato GGUF cuantizado a Q8_0 para su uso con llama.cpp. El repositorio ocupa 2,1 GB e incluye el tokenizer junto con los pesos del modelo con las actualizaciones LoRA de la segunda ronda ya fusionadas.

Su relevancia es acotada pero clara: demuestra como un modelo pequeno (2B) puede alcanzar una precision alta (95,3% de coincidencia exacta de comando en el conjunto de evaluacion) en una tarea de dominio estrecho mediante ajuste fino supervisado. Es util para quien quiera desplegar un asistente de CLI local, ligero y sin dependencia de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-2B) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea --ctx-size 4096) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen3.5-2B. Sobre la base en BF16 (revision `15852e8c16360a2fea060d615a32b45270f8a8fc`) se aplico un ajuste fino supervisado en dos rondas. El adaptador LoRA de la primera ronda (2B) se continuo durante una epoca con 2.880 ejemplos de entrenamiento y 400 de validacion. El adaptador de la segunda etapa emplea rango 16 y alpha 32, y sus actualizaciones se han fusionado en los pesos finales antes de la cuantizacion a Q8_0.

El dataset de entrenamiento es `NA2RU2/spine-cli-sft-ko-2b-round2`, compuesto por pares de peticion en coreano y comando Spine CLI esperado. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF o DPO. El ejemplo de la model card desactiva el modo de razonamiento (`enable_thinking: false`, `--reasoning off`), lo que sugiere que el modelo base dispone de un modo thinking que aqui se desactiva para forzar la salida directa del comando.

## Capacidades

- Generacion de un unico comando Spine CLI a partir de una peticion de desarrollo en coreano.
- Salida directa sin explicaciones ni bloques de codigo, segun el prompt de sistema recomendado.
- Generacion de planes de creacion en JSON cuando se solicita explicitamente (por ejemplo, estructuras de transporte con campos tipados).
- Inferencia de texto mediante llama.cpp y servidor compatible con la API de chat completions (`/v1/chat/completions`).
- Soporte de plantilla de chat con control de modo thinking (`chat_template_kwargs.enable_thinking`).
- No se documentan capacidades de tool calling generico, vision, audio ni razonamiento multi-paso fuera del dominio de la CLI.

## Casos de uso

- Asistente de linea de comandos local: el modelo traduce una peticion en lenguaje natural coreano a un comando Spine CLI concreto, ejecutable directamente en el terminal sin salir del entorno de desarrollo.
- Automatizacion de scaffolding en pipelines internos: integrado en scripts que reciben una descripcion de tarea y generan el comando de creacion de estructuras de proyecto de forma determinista (temperature 0).
- Generacion de planes JSON para revision previa: en lugar de escribir ficheros, el modelo puede producir un plan de creacion en JSON que un proceso posterior valide antes de aplicar cambios.
- Formacion de desarrolladores noveles en Spine CLI: actua como capa de traduccion entre la intencion del usuario y la sintaxis correcta de la herramienta, reduciendo errores de sintaxis.
- Despliegue en entornos con recursos limitados: al ser un modelo de 2B cuantizado a Q8_0 (2,08 GB), puede ejecutarse en estaciones de trabajo sin GPU dedicada o con GPU de consumo.
- Prototipado de asistentes de dominio especifico: sirve como referencia de como un ajuste fino LoRA pequeno sobre una base de 2B logra alta precision en una tarea cerrada, replicable para otras CLIs internas.
- Servicio local sin dependencia de la nube: al ejecutarse con llama-server, permite mantener peticiones de desarrollo dentro de la red interna sin enviar datos a APIs externas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Coincidencia exacta de comando completa (Q8_0) | 286/300 (95,3%) |

Los datos proceden de la evaluacion BF16 y Q8_0 publicada por el autor (`evaluation.md`). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB para el fichero Q8_0, mas overhead de contexto y runtime de llama.cpp (del orden de 3-4 GB en total con contexto de 4096 tokens).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna de consumo e incluso CPU sola con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de la API compatible con OpenAI; tambien puede usarse con otros runners que acepten GGUF.
- Latencia y throughput estimados: no disponible. El ejemplo de uso fija `--ctx-size 4096` y `max_tokens 160`, lo que sugiere respuestas cortas y baja latencia esperada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Spine CLI Qwen3.5-2B (este) | ~1,94 B | no disponible | GGUF Q8_0 | Apache 2.0 | Ajuste fino especializado en comandos Spine CLI (coreano) |
| Qwen/Qwen3.5-2B (base) | ~1,94 B | no disponible | safetensors, GGUF | Apache 2.0 | Modelo generalista multilingue |
| Modelos de 2B de proposito general | ~2 B | variable | variable | variable | Razonamiento y generacion general |

La comparativa con alternativas de la misma categoria (asistentes de CLI especializados) no esta disponible en la informacion proporcionada. La diferencia principal frente a su base es la especializacion: el ajuste fino sacrifica generalidad a cambio de una precision del 95,3% en la tarea objetivo.

## Limitaciones y advertencias

- Modelo altamente especializado: no debe esperarse buen rendimiento fuera de la generacion de comandos Spine CLI en coreano.
- Idioma limitado al coreano; no se documenta soporte fiable de castellano ni de otros idiomas.
- Riesgo de alucinacion en comandos: aunque la precision es alta (95,3%), un 4,7% de fallos implica comandos incorrectos; conviene validar la salida antes de ejecutarla en produccion.
- Solo se publica cuantizacion Q8_0; no hay variantes mas ligeras (Q4, Q5) ni pesos en safetensors en este repositorio.
- Longitud de contexto no documentada; el ejemplo usa 4096 tokens, por lo que peticiones muy largas pueden degradar el resultado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-2B conviene revisar tambien las condiciones de la licencia del modelo base.
- El modo thinking debe desactivarse explicitamente para obtener la salida de comando directa; de lo contrario, el modelo podria emitir razonamiento adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NA2RU2/spine-cli-qwen3.5-2b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/NA2RU2/spine-cli-sft-ko-2b-round2
- Evaluacion BF16 y Q8_0: https://huggingface.co/NA2RU2/spine-cli-qwen3.5-2b-GGUF/blob/main/evaluation.md
- Sumas SHA-256: https://huggingface.co/NA2RU2/spine-cli-qwen3.5-2b-GGUF/blob/main/SHA256SUMS
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
