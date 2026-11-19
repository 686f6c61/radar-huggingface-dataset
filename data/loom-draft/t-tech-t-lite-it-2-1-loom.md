# loom-draft/t-tech-T-lite-it-2.1-loom

## Resumen

T-lite-it-2.1-loom es un paquete de despliegue en formato Loom para el checkpoint GGUF `t-tech/T-lite-it-2.1-GGUF` (variante Q4_K_M), generado con la herramienta loom-next y publicado por el usuario loom-draft. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de empaquetado que traduce los pesos GGUF originales a programas Loom (ficheros `.loom` y `weights.loom`) junto con una tarjeta `model.json`, con el objetivo de ejecutar el modelo sobre GPUs AMD concretas: el SoC AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, T-lite-it-2.1, es un modelo de instrucciones de la familia T-lite de t-tech, distribuido originalmente en GGUF. La tarjeta de este paquete no documenta la arquitectura interna, el número de parámetros ni la composición del entrenamiento del modelo base; solo describe las capacidades expuestas a través del servidor loom-serve, que ofrece una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y un modo de razonamiento siempre activo.

La relevancia de este paquete es de infraestructura más que de modelado: demuestra un flujo de despliegue alternativo a llama.cpp para hardware AMD, con ventana de contexto de 40.960 tokens por petición, hasta 4 peticiones concurrentes y un límite de 4.096 tokens de salida por preset. La licencia Apache 2.0 del paquete facilita su uso comercial, aunque las mediciones de rendimiento y las puertas de corrección todavía no se han vuelto a medir para esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base T-lite-it-2.1; el paquete es un artefacto Loom) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 40.960 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen; empaquetado como programas Loom (`program/*.loom`, `weights.loom`) con `model.json` y `tokenizer.json` |
| Modelo base | t-tech/T-lite-it-2.1-GGUF |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Herramienta de generacion | loom-next (generador, sin LLM en el bucle) |
| Version del runtime | hrx-loom 0.2.0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base T-lite-it-2.1: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni se detallan el numero de parametros, las capas, las cabezas de atencion o el vocabulario. Tampoco se documentan los datos de entrenamiento, el volumen de tokens, la composicion del corpus ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La unica referencia es que el checkpoint original es un GGUF cuantizado en Q4_K_M publicado por t-tech.

Lo que si describe la tarjeta es la capa de despliegue. El paquete se genera con loom-next a partir del GGUF sin modificarlo, produciendo programas `.loom` que implementan los kernels de inferencia para las arquitecturas AMD objetivo. El servidor loom-serve expone la API y permite ajustar el comportamiento mediante parametros de linea de comandos: `completion_spin_ns=4294967295` activa la espera activa de finalizaciones de GPU (consumiendo CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` reserva el pool de memoria por adelantado en lugar de crecimiento elastico, y `--parameter_mode=preload` cambia solo la forma de cargar los pesos en el host. Segun la tarjeta, las mediciones de rendimiento se tomaron con la espera activa habilitada, y no se aplica decodificacion especulativa en este paquete.

## Capacidades

- Generacion de texto conversacional a traves de una API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls` estructurados.
- Modo de razonamiento ("thinking") siempre activo; el ajuste de esfuerzo de razonamiento no aplica en este paquete.
- Multi-turno y reutilizacion de historial en bucles de agente con tool calling (segun las puertas de correccion descritas, aunque sin medicion registrada para esta version).
- Concurrencia de hasta 4 peticiones simultaneas con contexto de 40.960 tokens por peticion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: no soportada (marcada como no aplicable en la tarjeta).
- Audio de entrada o salida: no soportado.
- Decodificacion especulativa: no aplicable en este paquete.
- Muestreo (temperature, top_k, seed): estado no determinado en la tarjeta.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: el paquete permite servir el modelo en un Ryzen AI Max+ 395 o en una Radeon AI PRO R9700 sin depender de CUDA, usando loom-serve como servidor compatible con OpenAI y el endpoint estandar de chat completions.
- Agentes con tool calling en entornos locales: al soportar `tools` y `tool_calls` en estilo OpenAI, el modelo puede integrarse en bucles de agente que consulten APIs internas, bases de datos o sistemas de ficheros, con hasta 4 conversaciones concurrentes.
- Procesamiento de documentos largos: la ventana de 40.960 tokens por peticion permite resumir, extraer entidades o responder preguntas sobre contratos, informes o expedientes de decenas de paginas en una sola pasada, sin fragmentacion manual.
- Prototipado de pipelines RAG: el contexto amplio y la API compatible con OpenAI facilitan conectar el modelo a frameworks de orquestacion existentes (LangChain, LlamaIndex) para pruebas de recuperacion aumentada en hardware AMD de escritorio.
- Sustitucion de llama.cpp en flujos ya establecidos: el paquete incluye puertas de comparacion contra la referencia de llama.cpp (tokens greedy, top-5 log-probs, divergencias en empates cercanos), lo que permite evaluar la equivalencia funcional antes de migrar un servicio en produccion.
- Despliegue en laboratorios o entornos de investigacion con hardware AMD: al ser un artefacto reproducible con ficheros fijados por sha256 (`model.json.lock`), sirve para experimentos que requieran trazabilidad de la version exacta del runtime y de los pesos.
- Evaluacion de la cadena de herramientas Loom: investigadores interesados en compilar y ejecutar modelos GGUF sobre ROCm pueden usar este paquete como caso de referencia para medir latencia, throughput y correccion frente a llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que los resultados de rendimiento para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran sin medicion registrada. No se ofrecen cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M y el hardware objetivo declarado incluye una GPU de 32 GB (Radeon AI PRO R9700), lo que sugiere que el modelo completo cabe en ese espacio junto con el pool de memoria del runtime.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA: no contempladas en la informacion disponible; el paquete esta generado para dispositivos AMD via `amdgpu://`.
- Compatibilidad con GPU de consumo: no confirmada; el paquete esta orientado a las dos plataformas AMD mencionadas.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` mediante pipx, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Parametros de servidor relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; la tarjeta no incluye mediciones para esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| t-tech-T-lite-it-2.1-loom (este paquete) | no disponible | 40.960 tokens por peticion | Apache 2.0 | Loom (programas `.loom`) sobre AMD gfx1151 / gfx1201 | Tool calling, thinking siempre activo, 4 peticiones concurrentes |
| t-tech/T-lite-it-2.1-GGUF (modelo base) | no disponible | no disponible | no disponible | GGUF (llama.cpp y derivados) | Checkpoint original sin empaquetar; sirve de referencia de correccion |
| llama.cpp sobre el mismo GGUF | no disponible | no disponible | no disponible | GGUF | Runtime de referencia usado en las puertas de comparacion de la tarjeta |

No se dispone de datos de parametros, contexto ni rendimiento de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita al propio modelo base y al runtime de referencia.

## Limitaciones y advertencias

- La informacion sobre el modelo base (arquitectura, parametros, datos de entrenamiento, idiomas) no esta disponible en la tarjeta; cualquier evaluacion de calidad debe remitirse a la documentacion de t-tech.
- Todas las puertas de correccion y las mediciones de rendimiento figuran como "no medidas" para esta version; no hay evidencia publicada de equivalencia funcional con llama.cpp ni de estabilidad en produccion.
- El modo de razonamiento esta siempre activo y no es configurable (el ajuste de esfuerzo de razonamiento no aplica), lo que puede incrementar el consumo de tokens de salida.
- El muestreo (temperature, top_k, seed) figura como "no determinado"; el comportamiento de la distribucion del primer token no esta verificado.
- El paquete esta restringido a dos plataformas AMD concretas; no se documenta funcionamiento en GPUs NVIDIA, Intel o en CPU.
- La concurrencia maxima es de 4 peticiones y la salida maxima de 4.096 tokens por preset, lo que limita cargas de alta demanda o generaciones muy largas.
- No hay soporte de vision ni de audio en este paquete.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base, sin datos especificos.
- Licencia Apache 2.0 en el paquete, favorable para uso comercial, pero conviene verificar la licencia del checkpoint GGUF original de t-tech antes de redistribuir pesos.
- El paquete tiene 0 descargas y 0 "likes" en Hugging Face en el momento de la consulta, sin senales de adopcion ni validacion por parte de la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/t-tech-T-lite-it-2.1-loom
- Modelo base GGUF: https://huggingface.co/t-tech/T-lite-it-2.1-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
