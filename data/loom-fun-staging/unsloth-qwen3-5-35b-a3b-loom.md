# loom-fun-staging/unsloth-Qwen3.5-35B-A3B-loom

## Resumen

El modelo `loom-fun-staging/unsloth-Qwen3.5-35B-A3B-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Qwen3.5-35B-A3B-GGUF`, en su cuantización `Q4_K_M`. Lo publica la organización `loom-fun-staging` dentro del ecosistema Loom, orientado a servir modelos en GPUs AMD mediante el runtime `hrx-loom`. La relevancia del paquete es de infraestructura: permite ejecutar un modelo de 35B totales con arquitectura de mezcla de expertos (MoE, con 3B activos según el nombre) sobre hardware AMD de consumo y profesional, con decodificación especulativa activada por defecto.

El artefacto está pensado para dos plataformas concretas: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) con memoria unificada, y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El servidor expone una API compatible con OpenAI en `127.0.0.1:8080` (`/v1/chat/completions`), con soporte de tool calling, modo de razonamiento y entrada de imágenes mediante un proyector multimodal `mmproj-F16.gguf`.

La model card incluye una tabla comparativa frente a llama.cpp ROCm, pero deja la mayoría de celdas de rendimiento sin medir ("—") y las de corrección marcadas como no reejecutadas sobre este paquete. Por tanto, la información disponible describe la configuración y las capacidades del paquete, pero no permite validar cifras de rendimiento ni de calidad con datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según el nombre del modelo base; detalles internos no disponibles |
| Parametros totales | 35B (según el nombre del modelo base) |
| Parametros activos | 3B (según el nombre del modelo base) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en F16 (`mmproj-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF; paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo base: no se detallan el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí se documenta es la arquitectura de despliegue: un runtime Loom que carga el GGUF `Qwen3.5-35B-A3B-Q4_K_M.gguf` sin modificarlo y genera kernels específicos para las GPU objetivo. El modelo base es una mezcla de expertos con 35B parámetros totales y 3B activos, lo que explica que quepa en configuraciones de memoria de 32-49 GB a pesar de su tamaño nominal.

La innovación técnica destacable del paquete es la decodificación especulativa con "DFlash" a profundidad 3, activada por defecto, usando como drafter `Anbeeld/Qwen3.5-35B-A3B-DFlash-GGUF`. La model card reporta una tasa de aceptación de tokens redactados del 41 % en decodificación de contexto corto y a 2k. También se documenta una cola de espera activa (`completion_spin_ns=4294967295`) y límites de memoria configurables (`--memory_bytes=49000000000` para Strix Halo, `34000000000` para la R9700). El soporte multimodal se implementa con un proyector separado en F16.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling al estilo OpenAI, con campos `tools` y `tool_calls` en la API.
- Entrada de imágenes mediante partes `image_url` al estilo OpenAI, con proyector `mmproj-F16.gguf`.
- Decodificación especulativa DFlash a profundidad 3, activada por defecto.
- Muestreo configurable con `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de salida de 4.096 tokens por petición (preset `max_tokens`).
- Contexto de 262.144 tokens por petición.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Audio de entrada o salida: no soportado ("not applicable").

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens por petición, el modelo puede mantener conversaciones multi-turno o procesar documentos extensos sin truncar, útil en atención al cliente con historial completo o análisis de contratos.
- Procesamiento de documentos con imágenes: la entrada multimodal permite extraer información de capturas, diagramas o documentos escaneados combinándola con texto en una misma petición.
- Automatización con tool calling: la API compatible con OpenAI permite integrar el modelo en pipelines existentes que ya usan `tools` y `tool_calls`, por ejemplo para consultar bases de datos o APIs internas.
- Razonamiento con modo thinking para tareas de análisis: activado por defecto, adecuado para depuración de código, análisis de datos o planificación de tareas donde interesa una cadena de razonamiento explícita.
- Despliegue en estaciones de trabajo AMD: el paquete está pensado para ejecutarse en Strix Halo o Radeon AI PRO R9700, lo que permite montar un servidor local compatible con OpenAI sin depender de GPUs NVIDIA.
- Servicio de inferencia de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida, encaja en entornos de desarrollo, prototipado o equipos pequeños más que en producción de alto volumen.
- Evaluación de modelos MoE en hardware AMD: útil para comparar el rendimiento de un MoE de 35B/3B activos frente a llama.cpp ROCm en las mismas máquinas.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a llama.cpp ROCm para Strix Halo (gfx1151), pero las columnas de llama.cpp, Loom y margen están sin medir ("—"). Solo se publican los valores de roofline (techo teórico del hardware) y no resultados reales del modelo. Para la Radeon AI PRO R9700 indica explícitamente que "los resultados de este paquete aún no se han vuelto a medir".

| Métrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | — | — | 111,4 |
| Decode tok/s, contexto 2k | — | — | 110,2 |
| Decode tok/s, contexto 32k | — | — | 66,1 |
| Prefill tok/s, documento 1k | — | — | 11.902,0 |
| Prefill tok/s, documento 2k | — | — | 11.708,5 |
| Prefill tok/s, documento 8k | — | — | 10.668,0 |
| Prefill tok/s, documento 16k | — | — | 9.537,8 |
| Prefill tok/s, documento 32k | — | — | 7.870,2 |
| 4 streams, decode agregado tok/s | — | — | 324,8 |
| Tokens redactados aceptados (speculative) | n/a | n/a | n/a |

Los valores de roofline se calculan para 216 GB/s de ancho de banda y 59 TFLOP/s, con profundidad 3 de decodificación especulativa y una aceptación medida del 41 % en contexto corto y 2k. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el paquete configura `--memory_bytes=49000000000` (49 GB) para Strix Halo y `34000000000` (34 GB) para la Radeon AI PRO R9700, coherente con un GGUF Q4_K_M de 35B más el proyector y el drafter.
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo convencionales; el paquete está orientado a las dos plataformas AMD citadas.
- Opciones de despliegue: `loom-serve` mediante el paquete `hrx-loom[hf]==0.1.0`; el servidor escucha en `127.0.0.1:8080` y ofrece API compatible con OpenAI. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete concreto.
- Latencia y throughput: no disponibles como mediciones reales; solo se publican los techos de roofline de la tabla anterior.
- Concurrencia: 4 peticiones simultáneas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este paquete (Qwen3.5-35B-A3B-loom) | 35B totales / 3B activos | 262.144 | no disponible | GGUF + Loom | Optimizado para AMD Strix Halo y R9700 |
| unsloth/Qwen3.5-35B-A3B-GGUF (base) | 35B totales / 3B activos | no disponible | no disponible | GGUF | Checkpoint original sin empaquetar |
| llama.cpp ROCm (runtime) | n/a | n/a | n/a | n/a | Referencia de comparación citada en la model card; sin cifras publicadas |

No se dispone de datos de rendimiento ni de benchmarks de calidad para establecer una comparación cuantitativa con alternativas de la misma categoría. La model card solo menciona llama.cpp ROCm como referencia de rendimiento, y sin valores medidos.

## Limitaciones y advertencias

- La licencia no está disponible en la información proporcionada; no se puede confirmar si permite uso comercial. Hay que verificar la licencia del modelo base `unsloth/Qwen3.5-35B-A3B-GGUF` antes de usarlo en producción.
- Los idiomas soportados no están documentados.
- Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`) figuran como no reejecutadas sobre este paquete; la última pasada corresponde a una build anterior (sha256 `77d8ab5`). No hay garantía verificada de equivalencia con llama.cpp para esta versión.
- Los resultados de rendimiento frente a llama.cpp no están medidos en la tabla publicada; las cifras de roofline son techos teóricos, no rendimiento real.
- La comparación de decodificación especulativa no es homogénea: Loom usa DFlash profundidad 3 y llama.cpp ROCm no usa drafting, según la propia metodología.
- El paquete está limitado a 4 peticiones concurrentes y 4.096 tokens de salida por petición, lo que restringe su uso en producción de alto volumen.
- Solo se documenta soporte para dos plataformas AMD concretas; no hay información sobre otras GPU.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse empíricamente antes de desplegar.
- El paquete tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-14), lo que sugiere que es un artefacto de staging sin validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Qwen3.5-35B-A3B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF
- Drafter de decodificación especulativa: https://huggingface.co/Anbeeld/Qwen3.5-35B-A3B-DFlash-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
