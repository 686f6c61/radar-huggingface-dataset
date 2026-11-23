# NA2RU2/spine-cli-qwen3.5-9b

## Resumen

Spine CLI Qwen3.5-9B es un ajuste fino supervisado (SFT) del modelo Qwen3.5-9B de Alibaba, desarrollado por el usuario NA2RU2. Su propósito es muy concreto: traducir una petición de desarrollo de software escrita en coreano a un único comando de andamiaje (scaffolding) de Spine CLI, una herramienta de generación de código para proyectos Go. El modelo no es un asistente generalista, sino un especialista entrenado para emitir exactamente una línea de comando válida, sin explicaciones ni bloques de código.

El checkpoint publicado es un modelo fusionado completo en BF16 (9.653.104.368 parámetros, aproximadamente 9,65 mil millones), derivado de la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` de Qwen3.5-9B. También se distribuye la actualización de ajuste fino como adaptador PEFT de rango 16 en el directorio `lora_adapter/`. El corpus de entrenamiento cubre ocho generadores de Spine CLI: `domain`, `dto`, `repository`, `service`, `controller`, `resource`, `consumer` y `websocket`.

La relevancia de esta ficha reside en su naturaleza de caso de estudio: un modelo de 9B convertido en un emisor de comandos determinista mediante LoRA y decodificación greedy. Los resultados reportados por el autor muestran un salto desde un 0,0% de comandos exactos en el modelo base hasta un 96,3% en el checkpoint fusionado, sobre 300 peticiones sintéticas en coreano. La licencia Apache 2.0 se mantiene tanto en el checkpoint como en el adaptador y el dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (clase `Qwen3_5ForConditionalGeneration`), base Qwen3.5-9B |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16; el adaptador LoRA es de rango 16) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo BF16) y adaptador PEFT LoRA |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B, cargada mediante la clase `Qwen3_5ForConditionalGeneration` de Transformers, lo que indica una topología multimodal de tipo image-text-to-text en su base, aunque el ajuste fino se orienta exclusivamente a la generación de texto. El autor no documenta detalles de la arquitectura interna más allá de la clase de carga y la revisión concreta del modelo base utilizada.

El entrenamiento se realizó en dos rondas sobre pesos BF16. La segunda ronda reprodujo los 2.160 ejemplos originales y añadió 720 ejemplos nuevos, ampliando las formulaciones lingüísticas que describen estructuras de petición y respuesta HTTP e incorporando peticiones de proyecto que hacen referencia a comandos de generador antiguos. La pasada final empleó una época, LoRA de rango 16 y alpha 32. El dataset de entrenamiento y validación es público (`NA2RU2/spine-cli-sft-ko`). No se documenta el uso de RLHF ni DPO; se trata de SFT puro.

## Capacidades

- Generación de un único comando Spine CLI a partir de una petición de desarrollo en coreano, sin texto adicional ni bloques de código.
- Cobertura de ocho generadores: `domain`, `dto`, `repository`, `service`, `controller`, `resource`, `consumer` y `websocket`.
- Emisión de flags y valores tipados (por ejemplo `--field owner_id:int64 --field include_pending:bool`).
- Soporte de modificadores como `--dry-run` y `--json` en la salida del comando.
- Selección correcta del generador `dto` en peticiones que describen tipos de entrada o respuesta sin mencionar explícitamente el término DTO (38/38 en la evaluación reportada).
- Modo de plantilla de chat con `enable_thinking=False`, es decir, sin cadena de razonamiento expuesta.
- Capacidad multilingüe limitada al coreano según la model card; no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso más allá de la emisión del comando.

## Casos de uso

- Automatización de andamiaje en proyectos Go con Spine CLI: el modelo recibe la descripción de una tarea y devuelve el comando `spine g <generador> <nombre> --field ...` listo para ejecutar, eliminando la necesidad de recordar la sintaxis exacta de cada generador.
- Integración en pipelines de CI/CD: dado que la salida es un comando determinista con decodificación greedy, puede validarse sintácticamente y ejecutarse en un paso automatizado tras revisión del plan con `--dry-run --json`.
- Asistentes de desarrollo internos: un chatbot o extensión de IDE puede delegar en este modelo la traducción de peticiones en lenguaje natural coreano a comandos de scaffolding, manteniendo el modelo generalista para el resto de la conversación.
- Generación de planes de cambio sin efectos secundarios: el uso de `--dry-run --json` permite obtener una previsualización estructurada de los ficheros que se crearían antes de aplicar cambios en el repositorio.
- Migración de comandos obsoletos: el corpus incluye peticiones que referencian comandos de generador antiguos, lo que permite usar el modelo para reescribir peticiones heredadas hacia la sintaxis actual.
- Estandarización de plantillas de proyecto: equipos que trabajan con la convención `layered-v1` pueden usar el modelo para generar consistentemente las capas `domain`, `dto`, `repository`, `service`, `controller`, `resource`, `consumer` y `websocket` a partir de descripciones homogéneas.

## Benchmarks y rendimiento

Evaluación sobre 300 peticiones sintéticas en coreano, separadas de los conjuntos de entrenamiento y validación, con backbone BF16, misma plantilla de chat y decodificación greedy. La precisión de comando exige coincidencia en generador, nombre objetivo, flags y valores.

| Métrica | Qwen3.5-9B original | Checkpoint fusionado |
|---|---:|---:|
| Rol de generador correcto | 4/300 (1,3%) | 298/300 (99,3%) |
| Flags y valores exactos | 1/300 (0,3%) | 293/300 (97,7%) |
| Comando exacto | 0/300 (0,0%) | 289/300 (96,3%) |
| Salidas con `g route` | 9 | 0 |
| Salidas con `g slice` | 22 | 0 |

Además, el modelo fusionado eligió `dto` en 38/38 peticiones que describían tipos de entrada o respuesta sin usar el término DTO. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 19-20 GB solo para los pesos (9,65B parámetros a 2 bytes), más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para margen operativo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con `device_map="auto"`.
- GPU de consumo: una RTX 4090 de 24 GB es el límite práctico en BF16; en GPUs con 16 GB o menos sería necesario cuantizar, aunque el autor no publica versiones GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: Transformers 5.22.2 con PyTorch y Accelerate según la model card. No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, ni se publican pesos GGUF.
- Latencia y throughput: no disponibles. La generación está acotada a `max_new_tokens=160` con decodificación greedy en el ejemplo del autor, lo que sugiere salidas cortas y baja latencia esperada, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spine CLI Qwen3.5-9B | 9,65B | no disponible | Emisión de comandos Spine CLI en coreano | Apache 2.0 | Hugging Face (checkpoint BF16 + adaptador LoRA) |
| Qwen3.5-9B (base) | 9B (aprox.) | no disponible | Modelo generalista multimodal | Apache 2.0 | Hugging Face (`Qwen/Qwen3.5-9B`) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base: el ajuste fino eleva la precisión de comando exacto de 0,0% a 96,3% a costa de restringir el dominio de salida a comandos Spine CLI. No se dispone de información sobre otros modelos especializados en generación de comandos de scaffolding para establecer una comparativa adicional.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el modelo está entrenado para emitir un único comando de Spine CLI; fuera de ese formato su comportamiento no está evaluado y probablemente degrade respecto al modelo base.
- Idioma: la model card declara únicamente coreano; no hay evidencia de robustez en castellano, inglés u otras lenguas.
- Riesgo de alucinación de flags o valores: aunque la precisión reportada es alta (97,7% en flags y valores exactos), un 2,3% de fallos en la evaluación implica comandos potencialmente inválidos o con tipos incorrectos.
- Dependencia de la convención `layered-v1` y de los ocho generadores soportados; peticiones que requieran otros generadores o sintaxis no cubiertas quedan fuera del alcance del ajuste.
- Evaluación limitada: los 300 casos son sintéticos y en coreano; no hay validación con peticiones reales de usuarios ni con variaciones dialectales o de registro.
- Sesgos: no se documenta ningún análisis de sesgos; al ser un ajuste sobre un corpus sintético coreano, puede reflejar las convenciones y suposiciones de dicho corpus.
- Licencia: Apache 2.0 permite uso comercial, pero se mantienen los avisos y la licencia de Qwen; conviene revisar las condiciones del modelo base upstream.
- Producción: al ser un repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, no hay evidencia de uso en producción ni de mantenimiento continuado; se recomienda validar exhaustivamente antes de integrarlo en flujos automatizados.
- Requiere Transformers 5.22.2 y la clase `Qwen3_5ForConditionalGeneration`; versiones anteriores de la librería pueden no cargar el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NA2RU2/spine-cli-qwen3.5-9b
- Dataset de entrenamiento y validación: https://huggingface.co/datasets/NA2RU2/spine-cli-sft-ko
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de Spine CLI: https://github.com/NARUBROWN/spine-cli
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
