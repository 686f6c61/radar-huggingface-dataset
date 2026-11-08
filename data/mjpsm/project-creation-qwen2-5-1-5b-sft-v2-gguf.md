# mjpsm/project-creation-qwen2.5-1.5b-sft-v2-GGUF

## Resumen

`project-creation-qwen2.5-1.5b-sft-v2-GGUF` es la distribucion en formato GGUF del modelo `mjpsm/project-creation-qwen2.5-1.5b-sft-v2`, un ajuste fino QLoRA de `Qwen/Qwen2.5-1.5B-Instruct` desarrollado por el usuario mjpsm en el contexto del proyecto MyVillage. El modelo esta especializado en una tarea muy concreta: generar un titulo de proyecto y una descripcion general estructurada en parrafos, con un numero de parrafos que depende del nivel educativo del destinatario (cuatro parrafos para K-5, incluyendo padres y cuidadores; tres parrafos para grado 6 en adelante).

La relevancia de esta publicacion no reside en capacidades generales, sino en su caracter de artefacto de despliegue: ofrece tres cuantizaciones (Q8_0, Q6_K y Q4_K_M) listas para `llama.cpp`, con benchmarks de CPU y una verificacion de contrato de salida sobre 12 prompts. Esto lo convierte en un ejemplo practico de como empaquetar un modelo pequeno y especializado para inferencia local en entornos con recursos limitados.

El modelo base tiene 1.543.714.304 parametros (aproximadamente 1,5 mil millones), se distribuye bajo la arquitectura Qwen2 y hereda el template ChatML de Qwen. No se dispone de informacion sobre licencia, idiomas soportados ni pipeline en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino QLoRA sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (aprox. 1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino QLoRA de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso de la familia Qwen2. El entrenamiento se realizo sobre el dataset MyVillage Project Creation V2, compuesto por 1.000 filas (14 ejemplos golden y 986 nuevos), con particiones de holdout a nivel de concepto en proporcion 800/100/100. La tarea objetivo es acotada: generar un titulo de proyecto y una descripcion general con un numero de parrafos condicionado por el nivel educativo (cuatro para K-5 con mencion a padres y cuidadores, tres para grado 6+).

No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF o DPO. La innovacion tecnica destacable no esta en la arquitectura, sino en el contrato de salida: el modelo debe respetar el numero de parrafos y el formato esperado, y el autor publica una verificacion de contrato sobre 12 prompts que mide la tasa de cumplimiento (`contract_pass`) y la correccion del numero de parrafos (`paragraph_count_ok`). Se recomienda usar el mismo system prompt que en entrenamiento y el template ChatML de Qwen, con parada en `<|im_end|>`.

## Capacidades

- Generacion de texto especializada en titulos y descripciones de proyectos educativos.
- Control del numero de parrafos segun el nivel educativo del destinatario (K-5 frente a grado 6+).
- Generacion de descripciones dirigidas a padres y cuidadores en el tramo K-5.
- Cumplimiento de un contrato de formato verificable (numero de parrafos y estructura).
- Conversacional, segun los tags del repositorio.
- Compatible con endpoints (`endpoints_compatible`).
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Generacion automatica de fichas de proyecto en plataformas educativas: el modelo produce titulo y descripcion con el numero de parrafos adecuado al nivel del alumno, lo que permite estandarizar el formato de las propuestas sin revision manual del conteo de parrafos.
- Asistencia a docentes en la redaccion de resumenes de proyecto: dado un concepto o tema, el modelo genera una descripcion lista para publicar, con la variante K-5 que incluye explicitamente a padres y cuidadores.
- Prototipado rapido en local con `llama.cpp`: las cuantizaciones Q4_K_M (0,99 GB) y Q6_K (1,27 GB) permiten ejecutar el modelo en CPU con 2 hilos a 7,9 y 6,8 tokens/s de generacion respectivamente, segun los datos del autor.
- Despliegue en entornos con GPU de gama baja o sin GPU: al caber en menos de 2 GB en Q8_0, es viable en portatiles y en instancias pequenas de cloud para tareas de generacion por lotes.
- Generacion por lotes de descripciones para catalogos de proyectos: la verificacion de contrato del autor (1,0 de cumplimiento en Q6_K y Q4_K_M sobre 12 prompts) sugiere un comportamiento predecible en pipelines automatizados.
- Base para experimentos de ajuste fino adicional: al ser un fine-tune QLoRA de un modelo de 1,5B con dataset documentado (1.000 filas, particiones 800/100/100), sirve como punto de partida reproducible para tareas de generacion estructurada similares.

## Benchmarks y rendimiento

El autor publica un benchmark de CPU (2 hilos, Colab) y una verificacion de contrato sobre 12 prompts. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

Benchmark de CPU (2 hilos, Colab):

| Cuantizacion | Tamano (GB) | Generacion (tok/s) | Prompt (tok/s) | Latencia estimada (s) |
|---|---|---|---|---|
| Q8_0 | 1,65 | 5,5 | 17,6 | 81,8 |
| Q6_K | 1,27 | 6,8 | 23,8 | 64,9 |
| Q4_K_M | 0,99 | 7,9 | 32,7 | 54,1 |

Verificacion de contrato V2 (12 prompts):

| Cuantizacion | contract_pass | paragraph_count_ok | Tiempo medio (s) |
|---|---|---|---|
| Q8_0 | 0,917 | 0,917 | 46,558 |
| Q6_K | 1,0 | 1,0 | 39,55 |
| Q4_K_M | 1,0 | 1,0 | 31,475 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en Q8_0 (1,65 GB de pesos), aproximadamente 1,3 GB en Q6_K y 1,0 GB en Q4_K_M, mas overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; no se requiere A100 ni H100. El modelo esta pensado para inferencia en CPU segun los benchmarks publicados.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `llama.cpp` (formato nativo GGUF), y por extension herramientas compatibles con GGUF como Ollama o servidores basados en llama.cpp. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: en CPU con 2 hilos, 5,5-7,9 tok/s de generacion y 17,6-32,7 tok/s de procesamiento de prompt segun cuantizacion; tiempo medio por peticion de 31,5-46,6 s en la verificacion de contrato. No se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| project-creation-qwen2.5-1.5b-sft-v2-GGUF | 1,5B | No disponible | Generacion de fichas de proyecto educativo | No disponible | GGUF |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5B | No disponible en la informacion proporcionada | Instrucciones generales | No disponible en la informacion proporcionada | Safetensors, GGUF |
| mjpsm/project-creation-qwen2.5-1.5b-sft-v1 | Aprox. 2B (segun la model card) | No disponible | Version previa de la misma tarea | No disponible | No disponible |

La comparacion con alternativas de la misma categoria (modelos de 1,5B para generacion estructurada) no esta disponible en la informacion proporcionada. El modelo base Qwen2.5-1.5B-Instruct es la referencia natural, pero no se dispone de sus especificaciones de contexto ni licencia en los datos consultados.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera de la tarea de generacion de titulos y descripciones de proyecto no esta documentado y probablemente sea deficiente en comparacion con el modelo base sin ajustar.
- Requiere el mismo system prompt que en entrenamiento y el template ChatML de Qwen; usarlo con otro prompt puede degradar el cumplimiento del contrato de formato.
- La verificacion de contrato se realizo sobre solo 12 prompts, una muestra muy pequena que no garantiza el comportamiento en produccion.
- Q8_0 obtiene 0,917 en `contract_pass`, por debajo de Q6_K y Q4_K_M (1,0); la cuantizacion mas alta no es necesariamente la mas fiable para esta tarea segun los datos del autor.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; al ser un modelo de 1,5B, la coherencia en descripciones largas puede ser limitada.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. El modelo base Qwen2.5 tiene su propia licencia que conviene verificar antes de desplegar.
- Idiomas soportados no disponibles: no hay garantia de calidad fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto no disponible: no se puede planificar el uso con entradas largas sin verificar la configuracion del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El tag `region:us` y la fecha de creacion (2026-11-08) deben verificarse en el repositorio original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mjpsm/project-creation-qwen2.5-1.5b-sft-v2-GGUF
- Modelo base del ajuste: https://huggingface.co/mjpsm/project-creation-qwen2.5-1.5b-sft-v2
- Version anterior (v1): https://huggingface.co/mjpsm/project-creation-qwen2.5-1.5b-sft-v1
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
