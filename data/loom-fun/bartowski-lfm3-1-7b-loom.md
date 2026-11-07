# loom-fun/bartowski-LFM3-1.7B-loom

## Resumen

`loom-fun/bartowski-LFM3-1.7B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/LFM3-1.7B-GGUF`, en su variante `LFM3-1.7B-Q4_K_M.gguf`. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que permite servir el modelo base LFM3-1.7B de Liquid AI sobre GPUs AMD mediante el runtime `loom-serve`, con decodificacion especulativa n-gram activada por defecto.

El modelo subyacente, LFM3-1.7B, es un modelo de texto de 1.700 millones de parametros de Liquid AI construido sobre la arquitectura LFM3 tri-hibrida, con una ventana de contexto de 262.144 tokens y soporte nativo de tool calling. El paquete Loom anade una capa de servicio compatible con la API de OpenAI (`/v1/chat/completions`), modo de razonamiento activable y hasta cuatro peticiones concurrentes, orientado a ejecucion local en hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).

Su relevancia es acotada pero concreta: demuestra que un GGUF estandar de 1.7B puede servirse en un APU AMD con ganancias medibles frente a llama.cpp (hasta +32 % en decodificacion con contexto de 2k y +26 % en agregado de cuatro flujos), manteniendo paridad de salida verificada token a token contra la referencia de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 tri-hibrida (modelo base Liquid AI LFM3-1.7B); paquete de despliegue Loom sobre GGUF |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado); otras cuantizaciones del base no disponibles en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El paquete no aporta entrenamiento propio: reutiliza el checkpoint `LFM3-1.7B-Q4_K_M.gguf` de bartowski, derivado del modelo LFM3-1.7B de Liquid AI. La arquitectura del modelo base es la LFM3 tri-hibrida de Liquid AI, disenada para agentes locales y aplicaciones especializadas; no se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original.

La innovacion tecnica del paquete reside en el runtime: `loom-serve` ejecuta kernels generados (53/53 tests unitarios superados contra implementaciones de referencia) y aplica decodificacion especulativa por n-gram con busqueda en el prompt y profundidad 2, activada por defecto. La verificacion de correccion incluye comparacion greedy token a token contra llama.cpp (puerta `compare`), consistencia bajo concurrencia, equivalencia exacta entre decodificacion especulativa activada y desactivada, y pruebas de aguja en pajar hasta la mitad del contexto.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con bucle multi-turno verificado (puertas `agent` y `agent_think_off`).
- Servidor compatible con la API de OpenAI en `/v1/chat/completions`, escuchando en `127.0.0.1:8080`.
- Decodificacion especulativa n-gram (profundidad 2) activada por defecto.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con salida identica a la ejecucion aislada.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Sin soporte de razonamiento con esfuerzo graduado (`reasoning effort`), sin entrada de imagen y sin entrada ni salida de audio.

## Casos de uso

- Agentes locales de escritorio en APUs AMD: el paquete esta generado y validado en un Ryzen AI Max+ 395 con Radeon 8060S, de modo que un asistente con tool calling puede ejecutarse en la misma maquina sin GPU dedicada, con 4 peticiones concurrentes y contexto de hasta 262.144 tokens.
- Automatizacion de soporte tecnico con contexto largo: la ventana de 262k tokens permite ingerir manuales o historiales completos; la puerta `needle` valida recuperacion de informacion hasta la mitad del contexto, aunque a contexto completo no hay evidencia registrada.
- Procesamiento por lotes de documentos en local: el rendimiento de prefill medido (5.840,9 tok/s en documentos de 1k y 4.050,2 tok/s en 32k) hace viable resumir o extraer datos de lotes de documentos en un unico equipo.
- Integracion en pipelines con interfaz OpenAI: cualquier cliente compatible con `/v1/chat/completions` puede apuntar a `loom-serve`, lo que facilita sustituir backends en herramientas existentes sin cambiar el codigo de aplicacion.
- Prototipado de flujos multi-turno con herramientas: las puertas `agent` verifican el renderizado exacto del prompt, la reutilizacion de historial y la validez de las llamadas a herramientas, lo que reduce el riesgo de integraciones fragiles en produccion.
- Servicio multiusuario ligero: con 338 tok/s agregados en 4 flujos concurrentes, un unico Strix Halo puede atender a varios usuarios simultaneos con respuestas coherentes entre peticiones concurrentes y aisladas.
- Evaluacion comparativa de runtimes: al usar el mismo GGUF que llama.cpp, sirve como banco de pruebas reproducible para medir el impacto de la decodificacion especulativa n-gram en hardware AMD.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0, mismo GGUF en ambos motores:

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decodificacion tok/s, prompt corto | 122,5 | 136,4 | +11 % | 201,7 | 68 % |
| Decodificacion tok/s, contexto 2k | 111,9 | 147,3 | +32 % | 225,4 | 65 % |
| Decodificacion tok/s, contexto 32k | 94,9 | 100,3 | +6 % | 156,0 | 64 % |
| Prefill tok/s, documento 1k | 4.733,9 | 5.840,9 | +23 % | 19.878,9 | 29 % |
| Prefill tok/s, documento 2k | 4.606,6 | 5.750,8 | +25 % | 19.715,6 | 29 % |
| Prefill tok/s, documento 8k | 4.801,9 | 5.304,7 | +10 % | 18.789,8 | 28 % |
| Prefill tok/s, documento 16k | 4.024,5 | 4.335,7 | +8 % | 17.682,6 | 25 % |
| Prefill tok/s, documento 32k | 3.258,1 | 4.050,2 | +24 % | 15.818,4 | 26 % |
| 4 flujos, decodificacion agregada tok/s | 267,5 | 338,0 | +26 % | 918,7 | 37 % |
| Tokens especulativos aceptados | no medido | 11 % | no aplicable | no aplicable | no aplicable |

Notas de medicion: llama.cpp build `llamacpp-rocm/b1370` con `-ngl 99 -cram 0 --spec-type ngram-simple -c 35024 -kvu -np 4`; Loom con decodificacion especulativa n-gram activada (profundidad 2). La temporizacion en Loom es del lado del cliente y en llama.cpp del lado del servidor. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Hardware de referencia y validacion: AMD Ryzen AI Max+ 395 "Strix Halo" con Radeon 8060S (gfx1151), 216 GB/s de ancho de banda y 59 TFLOP/s; el roofline del paquete esta calculado para este equipo.
- VRAM estimada: no disponible de forma explicita; el checkpoint Q4_K_M de 1.7B ocupa aproximadamente 1 GB de pesos, pero la memoria total necesaria depende del contexto solicitado (hasta 262.144 tokens de cache KV).
- GPU recomendadas: AMD con soporte ROCm; el paquete se distribuye para `--device=amdgpu`. No hay datos publicados de rendimiento en A100, H100 ni RTX 4090.
- GPU de consumo: el modelo base de 1.7B en Q4_K_M es apto para GPUs de consumo por tamano, pero el runtime Loom esta orientado a AMD; no hay evidencia registrada en GPUs NVIDIA.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el paquete y `loom-serve --model=... --device=amdgpu`. El mismo GGUF es compatible con llama.cpp (build ROCm) y con builds de llama.cpp compatibles con LFM3.
- Latencia y throughput: 136,4 tok/s en decodificacion con prompt corto y 5.840,9 tok/s de prefill en documentos de 1k; 338 tok/s agregados con 4 flujos concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-fun/bartowski-LFM3-1.7B-loom` (esta ficha) | 1,7B | 262.144 | GGUF Q4_K_M empaquetado en Loom; `loom-serve` | no disponible | Runtime AMD con decodificacion especulativa n-gram y API OpenAI |
| `bartowski/LFM3-1.7B-GGUF` | 1,7B | 262.144 (modelo base) | GGUF; llama.cpp y derivados | no disponible | Mismo checkpoint sin empaquetar; referencia de paridad y de rendimiento |
| `LiquidAI/LFM3-1.7B` | 1,7B | 256K segun documentacion de Liquid AI | Pesos originales; vLLM, SGLang y builds de llama.cpp compatibles con LFM3 | no disponible | Modelo base de Liquid AI, con tool calling nativo |

No se dispone de datos de benchmarks academicos comparativos entre estas variantes en la informacion proporcionada; la unica comparacion cuantitativa disponible es la de rendimiento de inferencia frente a llama.cpp recogida en la seccion anterior.

## Limitaciones y advertencias

- El paquete no modifica los pesos: hereda integramente los sesgos, la calidad y las limitaciones del modelo LFM3-1.7B de Liquid AI y de su cuantizacion Q4_K_M.
- Riesgo de alucinacion propio de un modelo de 1,7B; no se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- La puerta `needle_full` (aguja en pajar a contexto completo) figura como "sin evidencia": no hay validacion registrada de recuperacion de informacion a 262.144 tokens, solo hasta la mitad del contexto.
- La puerta `vision` no aplica porque el paquete no soporta entrada de imagen; tampoco soporta audio.
- Limite de 4.096 tokens de salida por peticion y de 4 peticiones concurrentes; no hay soporte de esfuerzo de razonamiento graduado.
- La tasa de aceptacion del decodificador especulativo es baja (11 % en la puerta `spec`; 2-9 % en las sesiones de decodificacion), por lo que la ganancia real de la decodificacion especulativa es moderada.
- Las mediciones comparan temporizacion del lado del cliente (Loom) con temporizacion del lado del servidor (llama.cpp), lo que puede introducir diferencias metodologicas.
- El rendimiento esta caracterizado unicamente en un APU AMD Strix Halo; no hay datos para GPUs dedicadas ni para otros sistemas.
- La licencia no esta indicada en la informacion disponible: es imprescindible verificar los terminos del modelo base LiquidAI/LFM3-1.7B y del GGUF de bartowski antes de cualquier uso comercial.
- El paquete tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-07): es un artefacto reciente y sin adopcion verificable por la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun/bartowski-LFM3-1.7B-loom
- GGUF de origen: https://huggingface.co/bartowski/LFM3-1.7B-GGUF
- Modelo base Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documentacion de LFM3-1.7B: https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia de las mediciones: https://github.com/loom-fun/loom-skills/actions/runs/42379010382
