# loom-fun-staging/ggml-org-Qwen3-1.7B-loom

## Resumen
Este paquete no es un modelo nuevo entrenado desde cero, sino una distribucion empaquetada del checkpoint GGUF `ggml-org/Qwen3-1.7B-GGUF` (concretamente la cuantizacion `Qwen3-1.7B-Q4_K_M.gguf`) para el runtime Loom de AMD. Lo publica el espacio `loom-fun-staging` y se genera con el flujo de trabajo `loom-skills`. El objetivo es ejecutar el modelo Qwen3 de 1.700 millones de parametros sobre las GPU integradas AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU de escritorio AMD Radeon AI PRO R9700 (gfx1201, 32 GB), sirviendo una API compatible con OpenAI.

El interes practico esta en la portabilidad: el paquete incluye programas `.loom` y un `model.json` que permiten lanzar `loom-serve` sin recompilar kernels especificos, con soporte de tool calling, modo de razonamiento y hasta 4 peticiones concurrentes. El modelo subyacente es Qwen3-1.7B, un transformer denso de la familia Qwen3, con una ventana de contexto declarada de 40.960 tokens por peticion en este empaquetado.

La relevancia ahora es doble: por un lado, demuestra la viabilidad de servir modelos pequenos en hardware AMD consumer y de estacion de trabajo; por otro, la model card publica una comparativa de rendimiento frente a llama.cpp ROCm en Strix Halo, aunque con la mayoria de celdas de medicion vacias y con los resultados de la R9700 pendientes de re-medicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), checkpoint GGUF empaquetado para el runtime Loom |
| Parametros totales | 1,7 mil millones (Qwen3-1.7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible en la informacion proporcionada |
| Formato de pesos | GGUF (`Qwen3-1.7B-Q4_K_M.gguf`) mas artefactos Loom (`.loom`, `model.json`) |

## Arquitectura y entrenamiento
El paquete no aporta informacion sobre el entrenamiento del modelo base: no se detallan tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO. Lo unico documentado es que se trata de un checkpoint Qwen3-1.7B sin modificar, en cuantizacion Q4_K_M, y que el empaquetado se ha generado con el flujo `loom-skills` para producir programas `.loom` y una tarjeta `model.json`.

La innovacion tecnica del paquete esta en el runtime, no en el modelo: Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, expone una API compatible con OpenAI en `127.0.0.1:8080`, soporta 4 peticiones concurrentes y aplica un modo de espera activa configurable (`completion_spin_ns`). La model card menciona ademas una comparacion de decodificacion especulativa, pero la marca como no aplicable porque no existe cabeza MTP en el GGUF ni drafter publicado para este modelo exacto.

## Capacidades
- Generacion de texto y razonamiento: el modo de pensamiento (`thinking`) esta activado por defecto y se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling / function calling con formato compatible con OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilizacion de historial, cubiertos por las puertas de validacion `agent` y `agent_think_off`.
- Muestreo configurable mediante `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con contexto de 40.960 tokens por peticion y un maximo de 4.096 tokens de salida por defecto.
- Sin soporte de entrada de imagen ni de audio (marcado como no aplicable en la model card).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Asistente de codigo en local para equipos con GPU AMD: el modelo puede servirse en una Radeon AI PRO R9700 o en un Strix Halo y consumirse desde el IDE mediante la API `/v1/chat/completions`, sin depender de la nube.
- Automatizacion de agentes con tool calling: los bucles multi-turno validados por la puerta `agent` permiten encadenar llamadas a herramientas (consulta de APIs, lectura de ficheros, ejecucion de comandos) con historial reutilizado.
- Prototipado de chatbots internos: con 40.960 tokens de contexto por peticion se pueden mantener conversaciones largas o adjuntar documentos de decenas de miles de tokens en un mismo turno.
- Procesamiento por lotes de documentos: el prefill medido en la roofline de Strix Halo (hasta 20.114 tok/s con prompts de 1k y 9.092,9 tok/s con 32k) hace viable clasificar o resumir lotes de textos en hardware integrado.
- Despliegue en estaciones de trabajo con GPU de 32 GB: la R9700 permite cargar el paquete con `--memory_bytes=17000000000` y servir 4 peticiones concurrentes para un equipo pequeno.
- Evaluacion y desarrollo de runtimes: el paquete sirve como banco de pruebas para comparar Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts, segun la metodologia declarada.
- Educacion e investigacion: un modelo de 1,7B en Q4_K_M es adecuado para experimentar con tecnicas de razonamiento y tool calling en hardware asequible.

## Benchmarks y rendimiento
La model card incluye una tabla comparativa Loom frente a llama.cpp ROCm en Strix Halo, pero las columnas de medicion de ambos motores estan vacias ("—"). Solo se publican los valores de roofline (techo teorico del hardware para este GGUF a 216 GB/s y 59 TFLOP/s). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 196,1 |
| Decode tok/s, contexto 2k | no medido | no medido | 162,3 |
| Decode tok/s, contexto 32k | no medido | no medido | 45,3 |
| Prefill tok/s, documento 1k | no medido | no medido | 20.114,1 |
| Prefill tok/s, documento 2k | no medido | no medido | 19.357,3 |
| Prefill tok/s, documento 8k | no medido | no medido | 15.792,0 |
| Prefill tok/s, documento 16k | no medido | no medido | 12.678,4 |
| Prefill tok/s, documento 32k | no medido | no medido | 9.092,9 |
| 4 streams, decode agregado tok/s | no medido | no medido | 627,6 |
| Decodificacion especulativa, tokens aceptados | no aplica | no aplica | no aplica |

En la Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han vuelto a medir" segun la propia model card. Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `agent_think_off`, `sampling`) figuran como no re-ejecutadas en este paquete; la ultima pasada fue sobre una build anterior (sha256 `64e3fbc`).

## Requisitos de hardware
- VRAM estimada: el paquete se sirve con `--memory_bytes=17000000000` (17 GB), una cota de memoria configurada en los comandos de ejemplo, no necesariamente el consumo real del modelo Q4_K_M.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer de NVIDIA ni para otras Radeon; la informacion disponible solo cubre las dos plataformas AMD citadas.
- Despliegue: runtime Loom mediante `pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir en `127.0.0.1:8080`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no medidos en este paquete; solo se publican los valores de roofline de la tabla anterior.
- Concurrencia: 4 peticiones simultaneas soportadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B (este paquete Loom) | 1,7B denso | 40.960 tokens por peticion | GGUF Q4_K_M + artefactos Loom | no disponible | Hugging Face, 0 descargas |
| ggml-org/Qwen3-1.7B-GGUF (base) | 1,7B denso | no disponible | GGUF | no disponible | Hugging Face (modelo base) |
| llama.cpp ROCm (motor alternativo) | no aplica | no aplica | runtime | no aplica | Referencia de comparacion en la model card |

No se dispone de datos de rendimiento medidos para ninguno de los dos motores en este paquete, por lo que la comparativa cuantitativa no es posible. Tampoco se identifican en la informacion proporcionada otras alternativas de la misma categoria con las que contrastar parametros y contexto.

## Limitaciones y advertencias
- La licencia no esta declarada en la informacion disponible; antes de un uso comercial hay que verificar la licencia del modelo base Qwen3-1.7B y la del empaquetado.
- El paquete tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (2026-11-14): es un artefacto de staging sin validacion de la comunidad.
- Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `agent_think_off`, `sampling`) no se han re-ejecutado en esta build; la ultima pasada corresponde a un sha256 anterior.
- Las mediciones de rendimiento frente a llama.cpp estan vacias en la model card y los resultados de la R9700 estan pendientes de re-medicion.
- No hay datos publicados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para este empaquetado.
- El soporte esta limitado a dos plataformas AMD concretas (gfx1151 y gfx1201); no se documenta compatibilidad con otras GPU.
- El modo de razonamiento esta activado por defecto, lo que incrementa el consumo de tokens de salida si no se desactiva explicitamente.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica del modelo base en la documentacion proporcionada.
- La ventana de contexto de 40.960 tokens es la declarada por el empaquetado, no necesariamente la del modelo base sin modificar.

## Enlaces
- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/ggml-org-Qwen3-1.7B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3-1.7B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de empaquetado loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
