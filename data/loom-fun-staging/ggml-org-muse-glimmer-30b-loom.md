# loom-fun-staging/ggml-org-Muse-Glimmer-30B-loom

## Resumen

Muse-Glimmer-30B es un modelo multimodal de tipo image-text-to-text distribuido originalmente en formato GGUF por el colectivo ggml-org. La ficha que nos ocupa no contiene el checkpoint original, sino un paquete de despliegue para el runtime AMD Loom: un conjunto de programas `.loom` y una tarjeta `model.json` que permiten servir el GGUF sin modificar (`Muse-Glimmer-30B-Q4_K_M.gguf`) sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete lo publica la organizacion `loom-fun-staging` y se ha generado con el flujo de trabajo `loom-skills`.

El interes practico del artefacto es la ejecucion de inferencia de un modelo de 30B en cuantizacion Q4_K_M sobre hardware AMD consumer y profesional, con decodificacion especulativa activada por defecto (DFlash, profundidad 3) y soporte de entrada de imagen mediante un proyector multimodal BF16. El servidor expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, modo de razonamiento siempre activo y hasta 4 peticiones concurrentes con una ventana de contexto de 131.072 tokens por peticion.

No se dispone de informacion sobre la arquitectura interna del modelo base, el numero exacto de parametros, la composicion del dataset de entrenamiento ni los idiomas soportados mas alla de lo que se deduce de su tamano nominal (30B) y su naturaleza multimodal. El repositorio tiene un tamano de 0,0 GB y cero descargas en el momento de la consulta, lo que sugiere un artefacto de staging reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GGUF de ggml-org; transformer multimodal segun el pipeline image-text-to-text) |
| Parametros totales | 30B (segun denominacion del modelo; cifra exacta no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Muse-Glimmer-30B-Q4_K_M.gguf`) + proyector `mmproj-Muse-Glimmer-30B-BF16.gguf`; paquete Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | DFlash, profundidad 3, activada por defecto; drafter `z-lab/Muse-Glimmer-30B-DFlash2-GGUF` |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (tipo de transformer, atencion, composicion de capas) ni los datos de entrenamiento (numero de tokens, mezcla del corpus, si hubo RLHF o DPO). Lo unico deducible es que se trata de un modelo multimodal con entrada de imagen y texto, dado que el pipeline declarado es `image-text-to-text` y el paquete incluye un proyector multimodal (`mmproj-Muse-Glimmer-30B-BF16.gguf`) que se carga junto al modelo principal.

La innovacion tecnica destacable del paquete no reside en el modelo sino en el runtime: Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 y activa decodificacion especulativa DFlash con profundidad 3 por defecto, usando un modelo drafter independiente. Segun la model card, la tasa de aceptacion medida del drafter fue del 53 % en decodificacion de contexto corto, 50 % a 2k tokens y 57 % a 32k tokens. El paquete tambien documenta compuertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`) que comparan la salida contra una referencia de llama.cpp, aunque en esta build figuran como no re-ejecutadas (la ultima pasada correcta fue sobre el build `sha256 1150ffa`).

## Capacidades

- Generacion de texto y razonamiento: modo de razonamiento (thinking) siempre activo, sin parametro de esfuerzo de razonamiento (`reasoning effort` no aplicable).
- Entrada de imagen: acepta partes `image_url` al estilo OpenAI, procesadas por el proyector `mmproj-Muse-Glimmer-30B-BF16.gguf`.
- Tool calling / function calling: soporta `tools` y `tool_calls` con esquema OpenAI.
- Decodificacion especulativa: DFlash con profundidad 3 activada por defecto, con drafter `z-lab/Muse-Glimmer-30B-DFlash2-GGUF`.
- Concurrencia: hasta 4 peticiones simultaneas con salida consistente respecto a ejecuciones aisladas (compuerta `consistency`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Contexto largo: 131.072 tokens por peticion, con rendimiento de prefill medido hasta documentos de 32k tokens.
- No soporta audio ni entrada/salida de voz (marcado como no aplicable en la model card).
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente multimodal sobre documentacion tecnica: el modelo puede recibir capturas de pantalla o diagramas junto con texto y responder preguntas, aprovechando la ventana de 131.072 tokens para adjuntar manuales completos en una sola peticion.
- Analisis de documentos largos en local: con prefill medido de aproximadamente 1.100 tok/s en documentos de 16k-32k tokens sobre Strix Halo, es viable procesar contratos, informes o articulos extensos en hardware AMD de sobremesa sin depender de la nube.
- Agente con tool calling en pipelines internos: la API compatible con OpenAI y el soporte de `tools`/`tool_calls` permiten integrarlo en orquestadores de agentes existentes (LangChain, LlamaIndex, SDK de OpenAI) sin adaptadores.
- Extraccion de informacion de imagenes en flujos de back office: facturas, tickets o formularios escaneados pueden enviarse como `image_url` y procesarse con salida estructurada mediante function calling.
- Despliegue en estaciones de trabajo con GPU AMD profesional: el paquete incluye instrucciones para Radeon AI PRO R9700 (32 GB) con `--memory_bytes=34000000000`, adecuado para entornos donde no se dispone de CUDA.
- Prototipado e investigacion en inferencia eficiente: al incluir decodificacion especulativa con metricas de aceptacion y comparativa contra llama.cpp ROCm, sirve como banco de pruebas para estudiar el rendimiento de runtimes alternativos en hardware AMD.
- Servicio de chat interno de baja concurrencia: con 4 peticiones concurrentes y salida maxima de 4.096 tokens, encaja en equipos pequenos o herramientas internas donde el throughput agregado medido (48,2 tok/s en 4 streams sobre Strix Halo) es suficiente.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa Loom frente a llama.cpp ROCm sobre Strix Halo (gfx1151), pero las columnas de llama.cpp y Loom estan sin medir ("—"); solo se publican los valores de roofline (techo teorico del hardware a 216 GB/s y 59 TFLOP/s). No hay datos de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 31,5 |
| Decode tok/s, contexto 2k | no medido | no medido | 30,3 |
| Decode tok/s, contexto 32k | no medido | no medido | 31,9 |
| Prefill tok/s, documento 1k | no medido | no medido | 1162,5 |
| Prefill tok/s, documento 2k | no medido | no medido | 1152,8 |
| Prefill tok/s, documento 8k | no medido | no medido | 1124,1 |
| Prefill tok/s, documento 16k | no medido | no medido | 1106,1 |
| Prefill tok/s, documento 32k | no medido | no medido | 1071,9 |
| 4 streams, decode agregado tok/s | no medido | no medido | 48,2 |
| Tokens aceptados del drafter | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201) los resultados "no se han vuelto a medir" segun la propia model card. No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el paquete se sirve con `--memory_bytes=44000000000` (44 GB) en Strix Halo y `--memory_bytes=34000000000` (34 GB) en Radeon AI PRO R9700. El checkpoint Q4_K_M de un modelo de 30B ronda los 18-19 GB de pesos, mas el proyector BF16 y el drafter; los margenes indicados dejan espacio para cache KV y buffers.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPU de consumo tipo RTX 4090 ni Radeon RX; el paquete esta orientado a las dos plataformas AMD citadas.
- Despliegue: runtime propietario del ecosistema Loom (`pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch`, `loom-serve`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete concreto, aunque el GGUF subyacente es reutilizable en llama.cpp.
- Latencia y throughput: solo se publican techos de roofline (31,5 tok/s de decode en contexto corto, 48,2 tok/s agregados en 4 streams, ~1.100 tok/s de prefill en documentos largos sobre Strix Halo). Las cifras reales de Loom y llama.cpp no estan registradas en esta build.
- Memoria del sistema: en Strix Halo la memoria es unificada, por lo que los 44 GB reservados deben estar disponibles en RAM/VRAM compartida.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (multimodales de ~30B en GGUF) dentro de la documentacion proporcionada. La unica comparacion disponible es de runtime, no de modelo:

| Aspecto | Loom (este paquete) | llama.cpp ROCm |
|---|---|---|
| Modelo servido | Muse-Glimmer-30B Q4_K_M | Muse-Glimmer-30B Q4_K_M (mismo GGUF) |
| Decodificacion especulativa | DFlash profundidad 3, por defecto | sin drafting en las filas medidas |
| Hardware objetivo | gfx1151 y gfx1201 | ROCm generico |
| API | OpenAI-style | servidor llama.cpp |
| Metricas publicadas | solo roofline | no registradas |

Comparativa con otros modelos: no disponible.

## Limitaciones y advertencias

- Artefacto de staging: el repositorio tiene 0 descargas y 0 likes, y las compuertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`) no se han re-ejecutado sobre esta build; la ultima validacion corresponde a `sha256 1150ffa`. No debe tratarse como una release estable.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion, ni del modelo base ni del paquete. Verificar antes de cualquier despliegue en produccion.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; asumir comportamiento incierto fuera del ingles hasta validacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos; el modo de razonamiento siempre activo no elimina este riesgo y puede aumentar la latencia.
- Rendimiento sin medir: las columnas de Loom y llama.cpp en la tabla comparativa estan vacias; las cifras de roofline son techos teoricos, no rendimiento observado. Las mediciones en R9700 no se han repetido.
- Metodologia asimetrica: en las filas de un solo stream Loom usa drafting y llama.cpp no, por lo que cualquier comparacion futura entre ambos no seria equivalente.
- Dependencia de hardware especifico: el paquete esta generado para gfx1151 y gfx1201; no hay garantia de funcionamiento en otras GPU AMD ni en NVIDIA.
- Contexto y salida: aunque la ventana es de 131.072 tokens, la salida maxima esta limitada a 4.096 tokens por defecto y la concurrencia a 4 peticiones, lo que restringe escenarios de alta carga.
- Sin soporte de audio: descartado para casos de uso de voz.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun-staging/ggml-org-Muse-Glimmer-30B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Muse-Glimmer-30B-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/z-lab/Muse-Glimmer-30B-DFlash2-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
