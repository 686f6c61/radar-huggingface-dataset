# loom-fun/bartowski-Ornith-1.5-35B-A3B-loom

## Resumen

`loom-fun/bartowski-Ornith-1.5-35B-A3B-loom` es un paquete de despliegue en formato Loom (`.loom` y una tarjeta `model.json`) construido sobre el checkpoint GGUF sin modificar `bartowski/Ornith-1.5-35B-A3B-GGUF`, en su cuantizacion Q4_K_M. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado orientado al motor Loom (`hrx-loom`), pensado para ejecutar el modelo sobre hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) con aceleracion ROCm. El autor es `loom-fun`, el mismo equipo que mantiene el flujo `loom-skills` y el servidor `loom-serve`.

El modelo subyacente, Ornith-1.5-35B-A3B, es un modelo multimodal (pipeline `image-text-to-text`) con arquitectura de mezcla de expertos: 35.000 millones de parametros totales y 3.000 millones activos por token, segun la convencion de nomenclatura A3B. Soporta entrada de imagen mediante un proyector `mmproj` en f16, tool calling estilo OpenAI y un modo de razonamiento activado por defecto. La ventana de contexto configurada en el paquete es de 262.144 tokens por peticion, con concurrencia de hasta 4 peticiones simultaneas.

La relevancia de este paquete es de infraestructura mas que de modelado: demuestra la ejecucion de un MoE de 35B en cuantizacion Q4_K_M sobre una APU de consumo con memoria unificada, con decodificacion especulativa (DFlash, profundidad 3) activada por defecto y una tasa de aceptacion de tokens redactados del 66 %. Incluye ademas una bateria de puertas de validacion (kernels, golden, agente, sampling, needle) que compara la salida contra llama.cpp como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, multimodal con proyector de vision independiente |
| Parametros totales | 35B (segun nomenclatura del modelo) |
| Parametros activos | 3B (segun nomenclatura A3B) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M en este paquete; el repositorio base de bartowski ofrece otras variantes GGUF no detalladas en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en formato Loom (`.loom` + `model.json`); proyector de vision `mmproj-Ornith-1.5-35B-A3B-f16.gguf` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | DFlash, profundidad 3, activada por defecto |
| API | OpenAI-compatible `/v1/chat/completions` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su condicion de MoE con 35B totales y 3B activos, su naturaleza multimodal (entrada de imagen via `image_url` con proyector `mmproj` en f16) y la presencia de un modo de razonamiento. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO o preferencia. El repositorio base de bartowski incluye un corpus de calibracion (`Ornith-1.5-35B-A3B-calibration-v6.txt`) y una imatrix (`Ornith-1.5-35B-A3B-imatrix.gguf`) usados para la cuantizacion, lo que indica que la cuantizacion se realizo con calibracion por importancia.

La innovacion tecnica relevante de este paquete no esta en el modelo sino en el runtime: Loom genera kernels especificos para el dispositivo y aplica decodificacion especulativa con un modelo borrador separado (`na0x2c6/Ornith-1.5-35B-A3B-DFlash-GGUF`, en Q8_0) con profundidad 3. El paquete incluye pruebas unitarias de kernels contra implementaciones de referencia (65/65 superadas) y una validacion `golden` que compara tokens greedy y log-probs top-5 contra llama.cpp sobre el mismo GGUF, con prompts cortos y documentos de 1k a 32k tokens.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen: acepta partes `image_url` estilo OpenAI y las procesa con el proyector `mmproj-Ornith-1.5-35B-A3B-f16.gguf`.
- Tool calling / function calling en formato OpenAI (`tools` y `tool_calls`), validado con una puerta `agent` de bucle multi-turno con reutilizacion de historial.
- Decodificacion especulativa integrada (DFlash, profundidad 3) con verificacion de que la salida con especulacion activada es identica a la obtenida con ella desactivada.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`, con validacion de que la distribucion del primer token coincide con llama.cpp.
- Concurrencia de 4 peticiones con garantia de consistencia (misma salida que ejecutadas por separado).
- Sin soporte de audio (ni entrada ni salida) y sin soporte de "reasoning effort" configurable.

## Casos de uso

- Despliegue local en estaciones de trabajo con APU AMD Strix Halo: el paquete esta optimizado para Ryzen AI Max+ 395 con memoria unificada, lo que permite servir un MoE de 35B en Q4_K_M sin GPU dedicada, usando `loom-serve --device=amdgpu`.
- Asistente con entrada de imagen en entornos con requisitos de privacidad: al ejecutarse en local, permite procesar capturas, documentos escaneados o diagramas junto con texto sin enviar datos a la nube.
- Automatizacion de agentes con tool calling: la puerta `agent` valida bucles multi-turno con renderizado exacto de prompts y llamadas validas, lo que lo hace apto para orquestacion de herramientas internas via API OpenAI-compatible.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por peticion y prefill medido de 1.557 a 1.890 tok/s en documentos de 8k a 32k, es viable para resumen y extraccion sobre expedientes extensos.
- Servicio de inferencia para equipos pequenos: 4 peticiones concurrentes con salida consistente permiten atender a un grupo reducido de usuarios con un unico nodo.
- Razonamiento con traza explicita: el modo thinking por defecto resulta util en tareas de analisis donde se requiere inspeccionar el razonamiento intermedio, como diagnostico de errores o planificacion.
- Evaluacion comparativa de runtimes: el propio paquete sirve como banco de pruebas para medir Loom frente a llama.cpp sobre el mismo GGUF y el mismo hardware.

## Benchmarks y rendimiento

Los datos disponibles son de rendimiento de inferencia, no de calidad en benchmarks academicos. Mediciones sobre AMD Ryzen AI Max+ 395 (Radeon 8060S), Ubuntu 24.04, `hrx-loom 0.1.0`, el 7 de noviembre de 2026:

| Metrica | llama.cpp (DevLab) | Loom (DevLab) | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | 62,8 | 64,3 | 161,3 |
| Decode tok/s, contexto 2k | 57,6 | 55,6 | 159,7 |
| Decode tok/s, contexto 32k | 45,2 | 30,0 | 138,5 |
| Prefill tok/s, documento 1k | 1.080,7 | 1.703,0 | 11.600,2 |
| Prefill tok/s, documento 2k | 1.104,1 | 1.763,7 | 11.416,3 |
| Prefill tok/s, documento 8k | 1.100,8 | 1.890,6 | 10.424,8 |
| Prefill tok/s, documento 16k | 945,2 | 1.761,1 | 9.343,0 |
| Prefill tok/s, documento 32k | 773,8 | 1.557,6 | 7.737,1 |
| 4 streams, decode agregado | 99,7 | 76,6 | 268,0 |
| Tokens redactados aceptados (especulativa) | n/a | 66 % | n/a |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware de referencia: AMD Ryzen AI Max+ 395 con grafica Radeon 8060S (gfx1151), memoria unificada, ancho de banda de 216 GB/s y 59 TFLOP/s, sobre Ubuntu 24.04.
- El paquete esta disenado para `--device=amdgpu` con ROCm; no se documentan requisitos para GPU NVIDIA en la informacion disponible.
- VRAM estimada: no disponible de forma explicita; al tratarse de una APU con memoria unificada, el modelo Q4_K_M se residencia en memoria compartida del sistema.
- Cabe en hardware de consumo: si, en la APU Strix Halo citada; no se confirma compatibilidad con GPUs de consumo discretas de 8-24 GB.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve` para servir la API en `127.0.0.1:8080`. El repositorio base de bartowski menciona compatibilidad con LM Studio, Jan y vLLM para el GGUF original.
- Throughput: decode de 55 a 64 tok/s con prompts cortos y hasta 2k de contexto; cae a 30 tok/s a 32k. Prefill de 1.557 a 1.890 tok/s en documentos de 8k a 32k. Con 4 streams concurrentes, 76,6 tok/s agregados.
- Modelo borrador adicional necesario para la decodificacion especulativa: `Ornith-1.5-35B-A3B-DFlash-Q8_0.gguf`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este paquete, Loom) | 35B | 3B | 262.144 | no disponible | GGUF Q4_K_M empaquetado Loom, ROCm |
| Ornith-1.5-35B-A3B (bartowski GGUF) | 35B | 3B | no disponible | no disponible | GGUF, compatible con llama.cpp, LM Studio, Jan, vLLM |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento del modelo frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; no se puede confirmar el uso comercial sin consultar el repositorio del modelo base.
- Los idiomas soportados no estan documentados.
- La puerta de validacion `vision` falla: la entrada de imagen no coincide con la referencia de llama.cpp en tokens de prompt y respuestas, por lo que el soporte multimodal no esta verificado como correcto en este paquete.
- La puerta `needle_full` no tiene evidencia: no se ha demostrado que se sirva correctamente un prompt de aguja en pajar a contexto completo (262.144 tokens).
- El rendimiento en decodificacion a 32k de contexto cae a 30 tok/s en Loom frente a 45,2 tok/s en llama.cpp, y el decode agregado con 4 streams es inferior (76,6 frente a 99,7 tok/s).
- Las mediciones comparan tiempos del lado del cliente en Loom con tiempos del lado del servidor en llama.cpp, lo que introduce un sesgo metodologico reconocido por el propio autor.
- El paquete depende de hardware AMD especifico (gfx1151); su portabilidad a otras GPUs no esta documentada.
- No se han publicado evaluaciones de sesgo, alucinacion o robustez del modelo base.
- El modo de razonamiento esta activado por defecto y no admite ajuste de esfuerzo, lo que incrementa el consumo de tokens en produccion si no se desactiva explicitamente.
- La fecha de creacion del repositorio (2026-11-08) y el ecosistema Loom son recientes; el proyecto puede presentar inestabilidad de API.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun/bartowski-Ornith-1.5-35B-A3B-loom
- Modelo base GGUF (bartowski): https://huggingface.co/bartowski/Ornith-1.5-35B-A3B-GGUF
- Arbol de archivos del modelo base: https://huggingface.co/bartowski/Ornith-1.5-35B-A3B-GGUF/tree/main
- README del modelo base: https://huggingface.co/bartowski/Ornith-1.5-35B-A3B-GGUF/blob/main/README.md
- Modelo borrador para decodificacion especulativa: https://huggingface.co/na0x2c6/Ornith-1.5-35B-A3B-DFlash-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42415157313
