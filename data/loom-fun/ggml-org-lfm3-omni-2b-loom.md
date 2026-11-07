# loom-fun/ggml-org-LFM3-Omni-2B-loom

## Resumen

LFM3-Omni-2B es un modelo "any-to-any" de 2.000 millones de parámetros desarrollado por Liquid AI que entiende texto, imágenes, vídeo y audio, y responde en texto, voz o una mezcla intercalada de ambos. Se trata del primer modelo ómnium de la familia LFM3 de Liquid AI y está construido sobre la librería Transformers, según la documentación oficial del fabricante. La ficha que nos ocupa, sin embargo, no contiene el checkpoint original, sino un paquete de despliegue para el runtime AMD Loom.

El repositorio `loom-fun/ggml-org-LFM3-Omni-2B-loom` empaqueta el GGUF sin modificar `LFM3-Omni-2B-Q4_K_M.gguf` (procedente de `ggml-org/LFM3-Omni-2B-GGUF`) en un formato de programas `.loom` más un `model.json` que actúa como tarjeta de modelo. El paquete se generó con el flujo `loom-skills` sobre un AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y su interés radica en que ofrece un servidor compatible con la API de OpenAI (`/v1/chat/completions`), decodificación especulativa por n-gram activada por defecto y métricas comparativas frente a llama.cpp en el mismo hardware.

La relevancia de este artefacto es, por tanto, de infraestructura más que de modelado: demuestra cómo ejecutar un modelo ómnium de 2B en una APU AMD con memoria unificada, con ventajas de throughput de hasta el 49 % en decodificación con contexto de 2k frente a llama.cpp, aunque con retrocesos en algunos regímenes (contexto de 32k y prefill de 8k).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base construido con Transformers; el paquete es un runtime GGUF sobre AMD Loom) |
| Parametros totales | 2B (según denominación del modelo base LFM3-Omni-2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens por petición (según la tarjeta del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado: `LFM3-Omni-2B-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (empaquetado como programas `.loom` + `model.json`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-Omni-2B: la documentación de Liquid AI lo describe como un modelo ómnium "end-to-end" de 2B parámetros construido con Transformers, capaz de procesar texto, imagen, vídeo y audio y de generar texto y voz, pero no se especifican el tipo de transformer, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se indica el número de tokens de entrenamiento.

Lo que sí está documentado es la capa de despliegue. El paquete Loom incluye kernels generados (39/39 tests unitarios superados frente a implementaciones de referencia) y un `model.json` con los ficheros fuente fijados por hash SHA-256, verificado por `loom-fetch`. El runtime incorpora decodificación especulativa mediante *n-gram prompt lookup* con profundidad 2, activada por defecto, y una pasarela de corrección (`spec`) que garantiza que la salida con decodificación especulativa activada es idéntica a la obtenida con ella desactivada. La verificación `golden` compara tokens greedy y log-probabilidades top-5 contra llama.cpp sobre el mismo GGUF, con prompts cortos y documentos de 1k a 32k tokens.

## Capacidades

- Generación de texto y razonamiento: modo *thinking* disponible pero desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`. No soporta ajuste de esfuerzo de razonamiento (*reasoning effort*).
- Entrada multimodal según el modelo base: la documentación de Liquid AI describe comprensión de texto, imágenes, vídeo y audio, con salida en texto, voz o texto y voz intercalados.
- Tool calling: soporte de `tools` y `tool_calls` en estilo OpenAI, con bucle multi-turno verificado por la puerta `agent`.
- Capacidades de agente: bucle de tool calling multi-turno con renderizado exacto de prompt y reutilización de historial, validado contra llama.cpp.
- Decodificación especulativa: *n-gram prompt lookup* con profundidad 2, activada por defecto.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia: hasta 4 peticiones simultáneas con consistencia verificada (misma salida que en ejecución aislada).
- Límite de salida: 4.096 tokens máximos por petición (preset `max_tokens`).
- En el paquete Loom, la entrada de imagen y la de audio están marcadas como no soportadas (`❌`), pese a que el modelo base las anuncia; la puerta `vision` figura como "no aplicable".

## Casos de uso

- Servicio de chat autohospedado en APU AMD: desplegar `loom-serve --device=amdgpu` sobre un Ryzen AI Max+ 395 para servir un endpoint compatible con OpenAI en `127.0.0.1:8080`, aprovechando la memoria unificada de la APU para evitar copias de pesos entre CPU y GPU.
- Asistentes con ventana de contexto amplia: la tarjeta declara 128.000 tokens por petición, lo que permite resumir o consultar documentos largos; conviene tener en cuenta que la prueba *needle* solo está verificada hasta la mitad del contexto (`needle_full` sin evidencia).
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y el bucle multi-turno verificado permiten construir agentes que consulten APIs internas o bases de datos sin depender de un proveedor cloud.
- Razonamiento opcional bajo demanda: activar el modo *thinking* solo en consultas que lo requieran (matemáticas, lógica) y dejarlo apagado en el resto para no penalizar latencia, dado que está desactivado por defecto.
- Evaluación de runtimes alternativos: usar el paquete como banco de pruebas para comparar Loom frente a llama.cpp en el mismo GGUF y hardware, con métricas de decodificación, prefill y concurrencia ya publicadas.
- Prototipado de aplicaciones de voz: si se usa el checkpoint original de Liquid AI (no el paquete Loom, que marca audio como no soportado), el modelo base permite construir interfaces conversacionales con salida de voz; en el paquete Loom esta vía no está disponible.
- Servicio multiusuario ligero: con 4 peticiones concurrentes y un agregado de 329,2 tok/s en decodificación (4 streams), es adecuado para equipos pequeños o entornos de desarrollo, no para producción de alta concurrencia.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-07 en un AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), Ubuntu 24.04, hrx-loom 0.1.0, sobre el mismo GGUF Q4_K_M en ambos motores:

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 136,5 | 157,4 | +15 % | 233,1 | 68 % |
| Decode tok/s, contexto 2k | 129,0 | 192,6 | +49 % | 302,0 | 64 % |
| Decode tok/s, contexto 32k | 106,8 | 99,1 | -7 % | 156,3 | 63 % |
| Prefill tok/s, documento 1k | 4.883,8 | 5.445,6 | +12 % | 19.878,9 | 27 % |
| Prefill tok/s, documento 2k | 4.750,6 | 5.362,5 | +13 % | 19.715,6 | 27 % |
| Prefill tok/s, documento 8k | 4.991,2 | 4.209,1 | -16 % | 18.789,8 | 22 % |
| Prefill tok/s, documento 16k | 4.125,6 | 3.923,3 | -5 % | 17.682,6 | 22 % |
| Prefill tok/s, documento 32k | 3.331,8 | 3.792,8 | +14 % | 15.818,4 | 24 % |
| 4 streams, decode agregado tok/s | 313,5 | 329,2 | +5 % | 885,9 | 37 % |
| Decodificación especulativa, tokens aceptados | — | 8 % | — | n/a | n/a |

Notas de medición: llama.cpp con build `llamacpp-rocm/b1370` y argumentos `-ngl 99 -cram 0 --spec-type ngram-simple -c 35024 -kvu -np 4`; Loom con decodificación especulativa n-gram activada (profundidad 2). Los tiempos de Loom son del lado del cliente y los de llama.cpp del servidor, por lo que la comparación no es estrictamente homogénea. El roofline se calcula con `loom-roofline` a 216 GB/s y 59 TFLOP/s. La tasa de aceptación del *drafter* varía según la sesión (9 % en decode corto, 28 % en 2k, 4 % en 32k).

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el checkpoint es Q4_K_M de un modelo de 2B; en una APU con memoria unificada como el Ryzen AI Max+ 395 los pesos residen en memoria compartida. No se especifica el consumo exacto de memoria en la información disponible.
- GPU recomendadas: el paquete está generado y validado exclusivamente sobre AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151) mediante `--device=amdgpu`. No hay datos de funcionamiento en A100, H100 o RTX 4090.
- GPU de consumo: cabe en una APU AMD "Strix Halo"; no se documenta compatibilidad con GPUs de consumo NVIDIA.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el paquete y `loom-serve --model=... --device=amdgpu` para servir la API OpenAI en `127.0.0.1:8080`. Como alternativa, el mismo GGUF puede ejecutarse con llama.cpp (`llamacpp-rocm/b1370`).
- Latencia y throughput: 157,4 tok/s de decodificación con prompt corto, 192,6 tok/s con contexto de 2k y 99,1 tok/s con 32k; prefill entre 3.792,8 y 5.445,6 tok/s según longitud del documento; 329,2 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B (paquete Loom) | 2B | 128.000 tokens por petición (según tarjeta Loom) | Modelo base: texto, imagen, vídeo y audio; el paquete Loom solo expone texto | no disponible | GGUF empaquetado como `.loom` + `model.json` |
| LFM3-Omni-2B (original, Liquid AI) | 2B | no disponible | Texto, imagen, vídeo y audio; salida de texto y voz | no disponible | Transformers, Hugging Face |
| LFM3-Omni-2B-GGUF (ggml-org) | 2B | no disponible | Según modelo base | no disponible | GGUF |

No se dispone de datos de benchmarks de calidad ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto declarado y formato de distribución.

## Limitaciones y advertencias

- El paquete Loom no expone las capacidades multimodales del modelo base: imagen y audio figuran como no soportados y la puerta `vision` es "no aplicable".
- `needle_full` (needle-in-the-haystack con el contexto completo) no tiene evidencia registrada; solo se ha verificado hasta la mitad del contexto declarado.
- La comparación de rendimiento con llama.cpp mezcla medición cliente-servidor y no es estrictamente equivalente; además, hay retrocesos claros en contexto de 32k (-7 % en decode) y prefill de 8k (-16 %).
- La tasa de aceptación del *drafter* especulativo es baja (8 % en la puerta `spec`, 4 % a 32k), lo que limita la ganancia real de la decodificación especulativa.
- El artefacto está validado únicamente en un dispositivo concreto (Ryzen AI Max+ 395, gfx1151, Ubuntu 24.04, hrx-loom 0.1.0); no hay garantías en otro hardware o versiones.
- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; debe consultarse la licencia del modelo base `LiquidAI/LFM3-Omni-2B` antes de desplegarlo.
- Idiomas soportados no disponibles; no se puede evaluar la cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables como en cualquier modelo generativo de 2B.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens por petición, insuficiente para cargas de producción de alta demanda.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-fun/ggml-org-LFM3-Omni-2B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/LFM3-Omni-2B-GGUF
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentación de Liquid AI sobre LFM3-Omni-2B: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecución de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-skills/actions/runs/42379010382
