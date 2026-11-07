# loom-fun/bartowski-MiniCPM-V-4.7-35B-A3B-loom

## Resumen

El paquete `loom-fun/bartowski-MiniCPM-V-4.7-35B-A3B-loom` no es un modelo nuevo, sino un empaquetado en formato Loom (`.loom`) del checkpoint GGUF `MiniCPM-V-4.7-35B-A3B-Q4_K_M.gguf` publicado por bartowski, que a su vez cuantiza el modelo multimodal MiniCPM-V 4.7 35B A3B. El autor del paquete es `loom-fun` y el artefacto se ha generado con el flujo de trabajo `loom-skills` sobre un dispositivo AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151). El objetivo es ofrecer un servidor de inferencia compatible con la API de OpenAI (`/v1/chat/completions`) optimizado para GPUs AMD mediante el runtime `hrx-loom`.

El modelo subyacente es un transformer de mezcla de expertos (MoE) multimodal con 35B parámetros totales y unos 3B activos por token, orientado a comprensión de imágenes y vídeo de alta resolución con razonamiento. Este empaquetado concreto está pensado para ejecución local en hardware AMD con memoria unificada, y su interés radica en las mediciones de rendimiento publicadas frente a llama.cpp, con mejoras de hasta el 78 % en prefill a 32k de contexto.

Conviene subrayar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de repo de 0,0 GB (los pesos se materializan al ejecutar `loom-fetch`) y que la model card no declara licencia ni idiomas. Además, aunque el modelo base es multimodal, el servidor Loom de este paquete no admite entrada de imagen según su propia tabla de características.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) multimodal (modelo base MiniCPM-V 4.7 35B A3B); empaquetado como programas Loom |
| Parametros totales | 35B (modelo base); 3B activos por token |
| Parametros activos | 3B (MoE) |
| Longitud de contexto | 262.144 tokens por petición (según la model card del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen, `MiniCPM-V-4.7-35B-A3B-Q4_K_M.gguf`); no se documentan otras en este repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Programas `.loom` y `weights.loom` generados a partir de GGUF; incluye `tokenizer.json`, `llm_config.json`, `info.json` y `model.json` |

## Arquitectura y entrenamiento

El modelo base MiniCPM-V 4.7 35B A3B es un transformer de mezcla de expertos con 35B parámetros totales y 3B activos por token, diseñado para comprensión multimodal de imágenes y vídeo de alta resolución con capacidades de razonamiento. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

El artefacto de este repositorio no contiene un modelo reentrenado: es una compilación de programas Loom (`program/*.loom`, `weights.loom`) generada a partir del GGUF sin modificar, con verificación de integridad sha256 mediante `loom-fetch`. La model card documenta un proceso de validación de correctitud con puertas (`gates.sh`) que comparan la salida contra una referencia de llama.cpp grabada sobre el mismo GGUF: pruebas de kernel (42/42), comparación greedy token a token, consistencia bajo concurrencia, bucle de tool calling multi-turno, muestreo y needle-in-the-haystack hasta la mitad del contexto. La puerta `needle_full` (contexto completo) no tiene evidencia registrada.

## Capacidades

- Generación de texto y razonamiento, con modo «thinking» activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling / function calling con formato de OpenAI (`tools` y `tool_calls`), validado en un bucle de agente multi-turno.
- API compatible con OpenAI en `/v1/chat/completions`, servida en `127.0.0.1:8080`.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de 4 peticiones simultáneas con consistencia verificada frente a ejecuciones aisladas.
- Límite de salida de 4.096 tokens por petición (preset `max_tokens`).
- Entrada de imagen: no soportada en este paquete Loom, pese a que el modelo base es multimodal.
- Entrada/salida de audio: no soportada.
- Decodificación especulativa: no soportada.
- Ajuste de esfuerzo de razonamiento («reasoning effort»): no soportado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional multi-turno en local: el servidor mantiene 262.144 tokens de contexto por petición, lo que permite conversaciones largas con historial extenso sin truncamiento agresivo en un equipo de sobremesa con GPU AMD.
- Procesamiento de documentos largos: con un prefill medido de 1.503,6 tok/s a 32k de contexto (frente a 845,0 tok/s de llama.cpp en el mismo hardware), resulta adecuado para resumir o extraer información de documentos extensos en flujos por lotes.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` validado en la puerta `agent` permite construir asistentes que consulten APIs externas, ejecuten búsquedas o encadenen pasos con historial reutilizado.
- Servicio de inferencia para varios usuarios en una sola máquina: con 4 peticiones concurrentes y 138,3 tok/s agregados de decodificación, sirve para equipos pequeños o entornos de desarrollo internos.
- Evaluación y prototipado de modelos MoE: al ser un empaquetado reproducible con verificación sha256 y comparación contra llama.cpp, sirve para validar pipelines de razonamiento y tool calling antes de desplegar en producción.
- Despliegue en hardware AMD de memoria unificada: el runtime `hrx-loom` con `--device=amdgpu --memory_bytes=34000000000` está pensado para equipos como el Ryzen AI Max+ 395, donde no hay GPU NVIDIA disponible.
- Integración en aplicaciones existentes basadas en OpenAI: al exponer una API compatible, se puede sustituir el endpoint remoto por el servidor local sin reescribir el cliente.

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, 216 GB/s, 59 TFLOP/s), Ubuntu 24.04, hrx-loom 0.1.0, el 2026-11-07, sobre el mismo GGUF en ambos motores:

| Métrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 50,8 | 52,8 | +4 % | 78,5 | 67 % |
| Decode tok/s, contexto 2k | 49,5 | 51,6 | +4 % | 77,4 | 67 % |
| Decode tok/s, contexto 32k | 44,8 | 43,3 | -3 % | 63,4 | 68 % |
| Prefill tok/s, documento 1k | 1265,7 | 1888,2 | +49 % | 11902,0 | 16 % |
| Prefill tok/s, documento 2k | 1250,1 | 1820,2 | +46 % | 11708,5 | 16 % |
| Prefill tok/s, documento 8k | 1245,6 | 1717,7 | +38 % | 10668,0 | 16 % |
| Prefill tok/s, documento 16k | 1046,5 | 1650,1 | +58 % | 9537,8 | 17 % |
| Prefill tok/s, documento 32k | 845,0 | 1503,6 | +78 % | 7870,2 | 19 % |
| 4 streams, decode agregado tok/s | 124,8 | 138,3 | +11 % | 190,8 | 72 % |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a | n/a | n/a |

Notas de medición: llama.cpp con build `llamacpp-rocm/b1369` y argumentos `-ngl 99 -cram 0 --spec-type ngram-simple -c 35024 -kvu -np 4`; Loom con decodificación especulativa desactivada. Los tiempos de Loom son del lado del cliente y los de llama.cpp del lado del servidor. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: el ejemplo oficial arranca con `--memory_bytes=34000000000` (34 GB), coherente con un GGUF Q4_K_M de un modelo de 35B parámetros.
- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), memoria unificada, Ubuntu 24.04. El paquete está etiquetado para «strix-halo».
- GPU dedicadas: no se documenta soporte ni rendimiento en A100, H100 o RTX 4090; el runtime objetivo es `amdgpu` con memoria unificada.
- GPU de consumo: no hay datos de ejecución en GPUs de consumo con VRAM discreta; los 34 GB de memoria requeridos exceden la VRAM de la mayoría de tarjetas consumer.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar los pesos con verificación sha256 y `loom-serve` para levantar el servidor compatible con OpenAI. No se documenta compatibilidad con vLLM, TGI, Ollama o llama.cpp para este paquete concreto.
- Rendimiento: 52,8 tok/s de decodificación con prompt corto y 1.888,2 tok/s de prefill a 1k de documento; el techo roofline del hardware se sitúa en 78,5 tok/s de decode, por lo que Loom alcanza el 67 % del mismo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B A3B (este paquete, Q4_K_M) | 35B | 3B | 262.144 | Sí en el modelo base; no en este servidor | no disponible | Loom / GGUF |
| MiniCPM-V 4.7 35B A3B (bartowski GGUF) | 35B | 3B | no disponible en la información | Sí | no disponible | GGUF |
| llama.cpp sobre el mismo GGUF | 35B | 3B | hasta 35.024 en la medición | Depende del binario | no disponible | GGUF |

La comparación directa disponible es frente a llama.cpp ejecutando el mismo checkpoint: Loom mejora el prefill entre un 38 % y un 78 % según la longitud del documento y el decode entre un 4 % y un 11 % en prompt corto y concurrencia, con una ligera pérdida del 3 % en decode a 32k de contexto. No se dispone de datos de benchmarks de calidad ni de comparativas con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sin licencia declarada: la model card del paquete no especifica licencia, por lo que el uso comercial no está garantizado y debe verificarse en el repositorio del modelo base.
- Sin datos de idiomas: no se documenta qué lenguas cubre el modelo, lo que impide garantizar calidad en castellano.
- Sin entrada de imagen en este servidor: aunque el modelo base es multimodal, la tabla de características marca `image input` como no soportado; la puerta `vision` figura como no aplicable.
- Contexto completo sin evidencia: la puerta `needle_full` (needle-in-the-haystack a contexto completo) no tiene evidencia registrada; solo se valida hasta la mitad del contexto.
- Sin decodificación especulativa ni ajuste de esfuerzo de razonamiento.
- Límite de 4.096 tokens de salida por petición y de 4 peticiones concurrentes.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinación en la información disponible.
- Madurez del artefacto: 0 descargas y 0 likes, repo de 0,0 GB y creado el 2026-11-07; es un empaquetado reciente y sin adopción verificable.
- Dependencia de hardware AMD: el rendimiento medido corresponde exclusivamente a Strix Halo con `hrx-loom` 0.1.0; no hay datos para otras GPUs.
- Los tiempos de Loom se midieron del lado del cliente y los de llama.cpp del lado del servidor, lo que introduce un sesgo metodológico en la comparación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/bartowski-MiniCPM-V-4.7-35B-A3B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/MiniCPM-V-4.7-35B-A3B-GGUF
- Árbol de archivos del modelo base: https://huggingface.co/bartowski/MiniCPM-V-4.7-35B-A3B-GGUF/tree/main
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecución de referencia de las mediciones: https://github.com/loom-fun/loom-skills/actions/runs/42340394242
- Ficha de especificaciones del modelo base: https://apxml.com/models/minicpm-v-4-7-35b-a3b
