# loom-fun/lmstudio-community-gemma-4-26B-A4B-it-loom

## Resumen

`loom-fun/lmstudio-community-gemma-4-26B-A4B-it-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `lmstudio-community/gemma-4-26B-A4B-it-GGUF`, en su cuantización Q4_K_M. El autor del paquete es `loom-fun`, y su propósito es servir el modelo Gemma 4 26B A4B de Google sobre GPUs AMD integradas en el ecosistema ROCm, concretamente en el chip AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). El paquete se generó con el flujo de trabajo `loom-skills` y se ejecuta con `hrx-loom` 0.1.0.

El modelo subyacente, Gemma 4 26B A4B, es un transformer de tipo mezcla de expertos (MoE) de 26 000 millones de parámetros totales con aproximadamente 4000 millones de parámetros activos por token, según la nomenclatura "26B-A4B". Es la variante multimodal (texto e imagen) de la familia Gemma 4 de Google DeepMind, con soporte de razonamiento, contexto largo, prompts de sistema y uso nativo de herramientas. El paquete Loom, sin embargo, sirve únicamente la modalidad de texto: la entrada de imagen no está soportada por el servidor.

La relevancia de este paquete es de infraestructura más que de modelado: demuestra que un MoE de 26B cuantizado a Q4_K_M puede servirse con decodificación especulativa (DFlash, profundidad 3) en una APU de consumo con memoria unificada, alcanzando 62,7 tok/s de decodificación en prompt corto y 1780,5 tok/s de prefill en documentos de 1k tokens en las mediciones del propio autor en DevLab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); paquete de despliegue Loom sobre GGUF |
| Parametros totales | 26B (modelo base Gemma 4 26B A4B) |
| Parametros activos | 4B aproximadamente (denominacion A4B) |
| Longitud de contexto | 209 920 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M), empaquetado como programas `.loom` y tarjeta `model.json` |
| Modelo base | lmstudio-community/gemma-4-26B-A4B-it-GGUF |
| Motor de inferencia | hrx-loom 0.1.0 (hrx-system d01d1c1) |
| Decodificacion especulativa | DFlash, profundidad 3, activada por defecto |
| Drafter | Anbeeld/gemma-4-26B-A4B-it-DFlash-GGUF (Q4_K_M) |
| Concurrencia | 4 peticiones simultaneas |
| Maximo de tokens de salida | 4096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` en 127.0.0.1:8080 |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), ROCm |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con arquitectura de mezcla de expertos: 26B parámetros totales con unos 4B activos por token, lo que reduce el coste computacional por token respecto a un modelo denso del mismo tamaño y lo hace viable en hardware con ancho de banda de memoria moderado. Según la documentación de LM Studio, Gemma 4 es una familia multimodal de Google DeepMind con entrada de texto e imagen, salida de texto, razonamiento, contexto largo, prompts de sistema y uso nativo de herramientas; existe además una variante QAT (quantization-aware training) orientada a despliegue local. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

El paquete Loom en sí no modifica los pesos: compila kernels específicos para gfx1151 y añade un servidor compatible con la API de OpenAI, con decodificación especulativa DFlash de profundidad 3 activada por defecto y un modelo borrador separado. La verificación de corrección frente a llama.cpp es notable: 56/56 tests de kernel superados, comparación greedy token a token contra la referencia de llama.cpp con divergencias solo en empates cercanos, consistencia bajo concurrencia, equivalencia exacta entre decodificación especulativa activada y desactivada, y needle-in-a-haystack hasta la mitad del contexto. La prueba de needle a contexto completo no tiene evidencia registrada.

## Capacidades

- Generación de texto y razonamiento: modo "thinking" disponible pero desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`. No soporta niveles de esfuerzo de razonamiento configurables.
- Uso de herramientas: soporte de `tools` y `tool_calls` al estilo OpenAI, con bucles multi-turno verificados por la puerta `agent` (renderizado exacto del prompt, reutilización de historial y llamadas válidas).
- Agentes y razonamiento multi-paso: el bucle de tool calling funciona tanto con thinking activado como desactivado (puertas `agent` y `agent_think_off`).
- Contexto largo: hasta 209 920 tokens por petición, con rechazo explícito de prompts que exceden la capacidad.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`, con distribución del primer token verificada frente a llama.cpp.
- Concurrencia: 4 peticiones simultáneas con salida idéntica a la ejecución aislada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión: el modelo base Gemma 4 26B A4B soporta imagen según LM Studio, pero este paquete Loom no soporta entrada de imagen (la puerta `vision` figura como no aplicable).
- Audio: no soportado, ni entrada ni salida.

## Casos de uso

- Servicio local de chat sobre APU AMD: desplegar un endpoint compatible con OpenAI en una máquina Strix Halo con `loom-serve --device=amdgpu`, útil para prototipos y entornos de desarrollo sin GPU dedicada, gracias a los 62,7 tok/s de decodificación medidos en prompt corto.
- Asistentes con contexto documental largo: análisis de contratos, informes o bases de código de hasta 200k tokens, aprovechando el prefill de 1780,5 tok/s en documentos de 1k y 1012,6 tok/s en 16k, con verificación de recuperación mediante needle-in-a-haystack hasta la mitad del contexto.
- Agentes con tool calling en local: automatización de tareas que requieren llamadas a funciones (consultas a bases de datos, APIs internas) con el bucle multi-turno validado por la puerta `agent`, sin depender de servicios en la nube.
- Razonamiento por lotes con modo thinking: generación de análisis paso a paso activando `enable_thinking`, adecuado para tareas de clasificación compleja o resolución de problemas donde la latencia no es crítica.
- Servicio multiinquilino ligero: 4 peticiones concurrentes con salida determinista respecto a la ejecución aislada, suficiente para equipos pequeños o demos internas.
- Evaluación comparativa de motores de inferencia: el paquete incluye métricas reproducibles frente a llama.cpp (build `llamacpp-rocm/b1370`) sobre el mismo GGUF, lo que lo convierte en una referencia útil para medir el rendimiento de Loom en gfx1151.
- Investigación sobre decodificación especulativa: con DFlash de profundidad 3 y un 55 % de tokens aceptados, sirve para estudiar el equilibrio entre velocidad y coste del drafter en hardware de memoria unificada.

## Benchmarks y rendimiento

Mediciones del autor sobre AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, el 7 de noviembre de 2026. La columna "DevLab" corresponde a la misma medición en un runner Strix Halo de AMD DevLab; los valores de llama.cpp y Loom locales no se registraron ("—").

| Metrica | Roofline | DevLab llama.cpp | DevLab Loom |
|---|---|---|---|
| Decodificacion tok/s, prompt corto | 112,4 | 50,1 | 62,7 |
| Decodificacion tok/s, contexto 2k | 107,1 | 46,0 | 50,7 |
| Decodificacion tok/s, contexto 32k | 96,1 | 35,7 | 36,0 |
| Prefill tok/s, documento 1k | 9141,6 | 951,7 | 1780,5 |
| Prefill tok/s, documento 2k | 8752,8 | 939,2 | 1746,2 |
| Prefill tok/s, documento 8k | 8146,9 | 931,4 | 1356,7 |
| Prefill tok/s, documento 16k | 7470,8 | 761,8 | 1012,6 |
| Prefill tok/s, documento 32k | 6407,4 | 609,7 | 651,4 |
| 4 streams, decodificacion agregada tok/s | 191,9 | 83,8 | 100,7 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | 55 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" con GPU Radeon 8060S (gfx1151), memoria unificada de 216 GB/s de ancho de banda y 59 TFLOP/s según la roofline del autor.
- VRAM estimada: no disponible de forma explícita; el checkpoint Q4_K_M de un MoE de 26B ocupa del orden de 15-16 GB, pero la información proporcionada no lo confirma.
- GPU recomendadas: la única plataforma validada en la información es la APU Strix Halo con ROCm. No hay datos para A100, H100 ni RTX 4090.
- GPU de consumo: no hay evidencia de funcionamiento en GPUs de consumo discretas; el paquete está compilado para gfx1151.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` del `model.json` y `loom-serve --model=... --device=amdgpu`; servidor en 127.0.0.1:8080 con API estilo OpenAI. La comparación se hizo contra llama.cpp (build `llamacpp-rocm/b1370`) con los mismos pesos.
- Latencia y throughput: 62,7 tok/s de decodificación en prompt corto y 1780,5 tok/s de prefill en 1k según DevLab con Loom; con 4 streams, 100,7 tok/s agregados. La aceptación del drafter es del 55 %, lo que equivale a 2,65 tokens por pasada de verificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| loom-fun/...gemma-4-26B-A4B-it-loom | 26B totales, ~4B activos | 209 920 tokens | no disponible | GGUF Q4_K_M empaquetado para Loom (ROCm, gfx1151) |
| lmstudio-community/gemma-4-26B-A4B-it-GGUF | 26B totales, ~4B activos | no disponible | no disponible | GGUF para LM Studio / llama.cpp |
| google/gemma-4-26b-a4b (LM Studio) | 26B totales, ~4B activos | no disponible | no disponible | Formato nativo de LM Studio; soporta visión y razonamiento |
| google/gemma-4-26b-a4b-qat (LM Studio) | 26B totales, ~4B activos | no disponible | no disponible | Variante QAT orientada a despliegue local; multimodal |

La comparación relevante es de empaquetado y motor, no de calidad del modelo: los tres primeros comparten los mismos pesos base. No hay datos de benchmarks de calidad para comparar el rendimiento cognitivo con alternativas.

## Limitaciones y advertencias

- El paquete no es un modelo nuevo: cualquier limitación de Gemma 4 26B A4B (sesgos, alucinación, calidad en idiomas distintos del inglés) se hereda sin cambios.
- Sin soporte de imagen ni audio en este paquete, a pesar de que el modelo base es multimodal según LM Studio.
- Sin niveles de esfuerzo de razonamiento configurables; el modo thinking es binario (activado o desactivado).
- El needle-in-a-haystack a contexto completo no tiene evidencia registrada; solo está verificado hasta la mitad del contexto.
- El límite de salida es de 4096 tokens por petición, lo que puede ser insuficiente para generación de documentos largos.
- Solo 4 peticiones concurrentes; no apto para cargas de producción de alta concurrencia.
- Plataforma muy restringida: validado únicamente en AMD Ryzen AI Max+ 395 (gfx1151) con hrx-loom 0.1.0; no hay evidencia en otras GPUs.
- Licencia no disponible en la información proporcionada: no se puede confirmar si el uso comercial está permitido. Verificar la licencia del modelo base Gemma 4 antes de cualquier despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB en el momento de la consulta: el paquete podría no estar materializado o ser de muy reciente publicación; conviene verificar la integridad de los artefactos antes de usarlo.
- Las métricas de rendimiento son del propio autor y comparan contra una build concreta de llama.cpp; la propia model card advierte que la comparación local frente a DevLab es "para comparación, no un veredicto".

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun/lmstudio-community-gemma-4-26B-A4B-it-loom
- Modelo base GGUF: https://huggingface.co/lmstudio-community/gemma-4-26B-A4B-it-GGUF
- Modelo borrador DFlash: https://huggingface.co/Anbeeld/gemma-4-26B-A4B-it-DFlash-GGUF
- Repositorio hrx-system (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecución de DevLab con las mediciones: https://github.com/loom-fun/loom-skills/actions/runs/42415177526
- Ficha de Gemma 4 26B A4B en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b
- Ficha de la variante QAT en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b-qat
