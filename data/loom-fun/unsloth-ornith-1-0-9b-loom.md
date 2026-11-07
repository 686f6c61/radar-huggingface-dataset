# loom-fun/unsloth-Ornith-1.0-9B-loom

## Resumen

`loom-fun/unsloth-Ornith-1.0-9B-loom` es un paquete de despliegue para el modelo multimodal Ornith-1.0-9B, empaquetado en formato Loom (`.loom` y un fichero `model.json`) por el usuario `loom-fun`. No se trata de un modelo entrenado desde cero, sino de una distribucion del checkpoint GGUF sin modificar `unsloth/Ornith-1.0-9B-GGUF` (concretamente la cuantizacion `Ornith-1.0-9B-Q4_K_M.gguf`) adaptada para ejecutarse sobre el runtime Loom en hardware AMD.

El paquete esta pensado para acelerar la inferencia en GPUs integradas AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) mediante decodificacion especulativa con n-gram prompt lookup (profundidad 3) y un servidor compatible con la API de OpenAI. El modelo base es un transformer multimodal de 9.000 millones de parametros con soporte de vision, razonamiento (thinking) y tool calling, y una ventana de contexto de 262.144 tokens por peticion.

Su relevancia actual radica en que demuestra una alternativa de inferencia a llama.cpp sobre hardware AMD consumer con ganancias medidas de hasta el 58 % en prefill en contextos largos, aunque con perdidas de rendimiento en decodificacion a 32k y en escenarios de concurrencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 9.000 millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); projector de vision `mmproj-F16.gguf` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (empaquetado como `.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Ornith-1.0-9B mas alla de que es un transformer multimodal de 9.000 millones de parametros con entrada de imagen y texto (pipeline `image-text-to-text`). No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de este paquete no esta en el modelo, sino en el runtime: Loom genera kernels especificos para el dispositivo y aplica decodificacion especulativa mediante n-gram prompt lookup con profundidad 3, activada por defecto. El paquete incluye ademas un conjunto de gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `needle`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, con resultado favorable en todos los gates ejecutados y sin evidencia registrada en `agent_think_off` y `needle_full`.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagenes en formato OpenAI `image_url`, con projector `mmproj-F16.gguf`.
- Tool calling / function calling en formato OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con tool calling (gate `agent` superado).
- Decodificacion especulativa n-gram prompt lookup, profundidad 3, activada por defecto.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- Soporte de contexto largo de hasta 262.144 tokens por peticion.
- Capacidades multilingues: no disponible.
- Entrada/salida de audio: no soportada.

## Casos de uso

- **Atencion al cliente automatizada**: el modelo puede mantener conversaciones multi-turno con historial largo gracias a la ventana de 262.144 tokens y a la API compatible con OpenAI, lo que facilita integrarlo en backends existentes sin reescribir el cliente.
- **Analisis de documentos extensos**: con prefill de hasta 1.456 tok/s en documentos de 8k y 1.206 tok/s a 32k en Strix Halo, resulta adecuado para resumir o extraer informacion de contratos, informes o expedientes que no caben en modelos con contexto de 8k-32k.
- **Asistentes con acceso a herramientas**: el soporte de tool calling en formato OpenAI y el gate `agent` superado permiten construir agentes que consulten APIs, bases de datos o sistemas internos en bucles multi-paso.
- **Procesamiento de imagenes en flujo de texto**: al aceptar `image_url`, se puede usar para extraer texto de capturas, describir graficos o responder preguntas sobre diagramas dentro de un pipeline de documentacion tecnica.
- **Despliegue en estaciones de trabajo AMD**: el paquete esta optimizado para Ryzen AI Max+ 395 con 21 GB de memoria asignada (`--memory_bytes=21000000000`), lo que permite ejecutar un modelo de 9B cuantizado en un equipo integrado sin GPU dedicada.
- **Generacion de codigo asistida en local**: con tool calling y contexto largo, se puede integrar en editores o pipelines de CI/CD para revision de parches y generacion de tests en entornos donde no se permite enviar codigo a la nube.
- **Investigacion sobre decodificacion especulativa**: el paquete incluye metricas comparativas frente a llama.cpp y gates de correccion, lo que lo convierte en un banco de pruebas reproducible para evaluar tecnicas de aceleracion en GPUs AMD.

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), Ubuntu 24.04, hrx-loom 0.1.0, sobre el mismo GGUF Q4_K_M:

| Metrica | llama.cpp | Loom | Diferencia | Roofline | Loom % roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 35,9 | 38,0 | +6 % | 51,1 | 74 % |
| Decode tok/s, contexto 2k | 34,3 | 37,9 | +10 % | 50,4 | 75 % |
| Decode tok/s, contexto 32k | 30,3 | 28,8 | -5 % | 42,4 | 68 % |
| Prefill tok/s, documento 1k | 1004,6 | 1412,0 | +41 % | 4243,3 | 33 % |
| Prefill tok/s, documento 2k | 1002,1 | 1414,4 | +41 % | 4223,4 | 33 % |
| Prefill tok/s, documento 8k | 1004,7 | 1456,3 | +45 % | 4107,8 | 35 % |
| Prefill tok/s, documento 16k | 890,1 | 1372,4 | +54 % | 3963,1 | 35 % |
| Prefill tok/s, documento 32k | 763,1 | 1206,5 | +58 % | 3702,4 | 33 % |
| 4 streams, decode agregado tok/s | 108,4 | 102,3 | -6 % | 201,2 | 51 % |
| Tokens drafted aceptados (especulativa) | — | 7 % | — | n/a | n/a |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- **Memoria**: el ejemplo de arranque reserva `--memory_bytes=21000000000` (21 GB) para el modelo Q4_K_M con projector de vision.
- **GPU objetivo**: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, Strix Halo), 216 GB/s de ancho de banda y 59 TFLOP/s segun la roofline del autor.
- **GPU dedicadas**: no se documenta compatibilidad con A100, H100 o RTX 4090 en la informacion proporcionada.
- **Consumer GPU**: el paquete esta disenado para GPU integrada AMD; no se indica soporte para GPUs consumer NVIDIA.
- **Despliegue**: `hrx-loom` (`pip install "hrx-loom[hf]"`), `loom-fetch` para materializar el modelo y `loom-serve --device=amdgpu`. Servidor en `127.0.0.1:8080` con API OpenAI.
- **Latencia y throughput**: decode de 38,0 tok/s con prompt corto y 28,8 tok/s a 32k; prefill de 1.412 a 1.456 tok/s entre 1k y 8k, bajando a 1.206 tok/s a 32k; 102,3 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Runtime |
|---|---|---|---|---|---|
| Ornith-1.0-9B (este paquete, Q4_K_M) | 9B | 262.144 | Si (vision) | no disponible | Loom (AMD) |
| Ornith-1.0-9B (GGUF original de unsloth) | 9B | no disponible | Si (vision) | no disponible | llama.cpp y otros |
| Alternativas de 9B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos de la misma categoria con los que comparar parametros, contexto, rendimiento o licencia. La unica comparacion documentada es la del propio autor frente a llama.cpp sobre el mismo checkpoint, recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia en el repositorio ni en la model card, lo que impide confirmar si el uso comercial esta permitido.
- **Idiomas no documentados**: se desconoce que lenguas soporta el modelo base y con que calidad.
- **Repositorio sin uso**: 0 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad.
- **Gates sin evidencia**: `agent_think_off` y `needle_full` no tienen ejecucion registrada; no hay prueba de que el bucle de agente funcione con thinking desactivado ni de que se sirva correctamente un needle-in-a-haystack al contexto completo.
- **Rendimiento en decodificacion**: Loom pierde un 5 % frente a llama.cpp a 32k de contexto y un 6 % en agregado con 4 streams.
- **Tasa de aceptacion especulativa baja**: solo el 7 % de los tokens propuestos por el drafter son aceptados, lo que limita la ganancia real de la decodificacion especulativa.
- **Hardware restringido**: las mediciones y el soporte se limitan a Strix Halo (gfx1151); no hay datos para otras GPUs.
- **Riesgo de alucinacion**: no se documentan evaluaciones de fidelidad ni de sesgo; como en cualquier modelo generativo, existe riesgo de alucinacion, especialmente en contextos largos.
- **Salida maxima limitada**: 4.096 tokens por peticion, lo que puede ser insuficiente para tareas de generacion extensa.
- **Concurrencia baja**: solo 4 peticiones simultaneas, insuficiente para cargas de produccion con muchos usuarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/unsloth-Ornith-1.0-9B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Ornith-1.0-9B-GGUF
- README del modelo base: https://huggingface.co/unsloth/Ornith-1.0-9B-GGUF/blob/main/README.md
- Arbol de ficheros del modelo base: https://huggingface.co/unsloth/Ornith-1.0-9B-GGUF/tree/main
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Workflow loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42316038259
