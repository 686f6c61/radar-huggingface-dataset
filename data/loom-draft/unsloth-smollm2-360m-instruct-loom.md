# loom-draft/unsloth-SmolLM2-360M-Instruct-loom

## Resumen

El modelo `loom-draft/unsloth-SmolLM2-360M-Instruct-loom` es un paquete de despliegue para el runtime AMD Loom que empaqueta el checkpoint GGUF `SmolLM2-360M-Instruct-Q4_K_M.gguf` del repositorio `unsloth/SmolLM2-360M-Instruct-GGUF`. No se trata de un modelo entrenado o afinado por el autor, sino de una conversión del GGUF original a programas `.loom` y una tarjeta `model.json`, generada con la herramienta `loom-next` (sin LLM en el bucle). El objetivo es permitir la ejecución del modelo en GPUs AMD concretas: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros desarrollado por Hugging Face, con licencia Apache 2.0. Este paquete Loom se publica bajo la misma licencia Apache 2.0 y expone una API compatible con OpenAI (`/v1/chat/completions`) a través de `loom-serve`. La relevancia actual del paquete es acotada: sirve como artefacto de validación del ecosistema Loom sobre hardware AMD, no como una alternativa de inferencia generalista.

Los datos de rendimiento y corrección del paquete están pendientes de remedición: todas las puertas de validación (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambas GPUs. El paquete tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) |
| Parametros totales | 360 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por petición (según la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen) convertido a programas `.loom` y `weights.loom` |
| Modelo base | unsloth/SmolLM2-360M-Instruct-GGUF |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Concurrencia | 4 peticiones simultáneas |
| Max output tokens | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Runtime | loom-serve 0.2.0 (`hrx-loom[hf]`) |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo base: parte del GGUF `SmolLM2-360M-Instruct-Q4_K_M.gguf` publicado por Unsloth y genera, mediante `loom-next`, un conjunto de programas `.loom` y un fichero `weights.loom` que el runtime `loom-serve` ejecuta sobre GPUs AMD. La arquitectura subyacente es la del SmolLM2-360M-Instruct original (transformer decoder-only de 360 M de parámetros), pero la tarjeta del paquete no aporta detalles sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO. Esa información debe consultarse en la model card del modelo base.

La innovación técnica del paquete no está en el modelo sino en el pipeline de despliegue: la generación de kernels específicos para gfx1151 y gfx1201, el uso de `--pool_backing=fixed` para reservar de antemano el pool de memoria, `--parameter_mode=preload` para cargar los pesos en el host, y `completion_spin_ns=4294967295` para espera activa de las finalizaciones de GPU. La tarjeta menciona puertas de validación frente a llama.cpp (tokens greedy, top-5 log-probs, comparación token a token, consistencia bajo concurrencia, decodificación especulativa, bucle de tool calling, sampling, logits y decisiones), pero ninguna tiene medición registrada en este paquete.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del SmolLM2-360M-Instruct original.
- API compatible con OpenAI para chat completions (`/v1/chat/completions`).
- Concurrencia de hasta 4 peticiones simultáneas.
- Contexto de 8.192 tokens por petición y salida máxima de 4.096 tokens (preset).
- Tool calling: no aplicable según la tabla de características del paquete.
- Razonamiento / thinking: no aplicable.
- Reasoning effort: no aplicable.
- Decodificación especulativa: no aplicable en este paquete.
- Entrada de imagen: no aplicable.
- Entrada/salida de audio: no aplicable.
- Sampling: estado "no determinado" en la tabla de características.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Validación del runtime Loom en hardware AMD: el paquete sirve para comprobar que `loom-fetch` y `loom-serve` funcionan sobre Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) con un modelo pequeño y de cuantización Q4_K_M, verificando la ruta de fetch, materialización y arranque del servidor.
- Pruebas de integración de API compatible con OpenAI: al exponer `/v1/chat/completions`, permite validar clientes y SDKs existentes contra un backend AMD Loom sin cambiar el código de la aplicación.
- Pruebas de concurrencia: con 4 peticiones simultáneas configuradas, se puede verificar el comportamiento del pool de memoria fijo (`--pool_backing=fixed`) bajo carga moderada.
- Benchmarking comparativo frente a llama.cpp: la tarjeta define puertas de comparación (tokens greedy, top-5 log-probs, consistencia bajo concurrencia) que permiten medir la fidelidad numérica del backend Loom respecto a la referencia llama.cpp sobre el mismo GGUF.
- Desarrollo de kernels y depuración de `loom-next`: los programas `.loom` generados y el `llm_config.json` permiten inspeccionar la traducción del grafo del modelo a kernels AMD y reproducir la generación.
- Entornos de demostración con recursos limitados: al ser un modelo de 360 M en Q4_K_M, cabe holgadamente en los 32 GB de la R9700 y en la memoria unificada del Strix Halo, lo que permite montar demos locales de chat sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del paquete indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de 360 M de parámetros, lo que sitúa el peso de los pesos en el orden de cientos de MB, pero la tarjeta no publica cifras de memoria del pool.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se indica compatibilidad con GPUs de consumo; el soporte declarado se limita a los dos dispositivos AMD anteriores.
- Despliegue: `loom-fetch` para descargar el paquete y `loom-serve` (versión 0.2.0, instalable vía `pipx install "hrx-loom[hf]==0.2.0"`) para servir la API.
- Opciones de configuración relevantes: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload`, `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles; las mediciones están pendientes de remedición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware / runtime |
|---|---|---|---|---|---|
| loom-draft/unsloth-SmolLM2-360M-Instruct-loom | 360 M | 8.192 tokens | GGUF convertido a `.loom` | Apache 2.0 | AMD Strix Halo y R9700; loom-serve |
| unsloth/SmolLM2-360M-Instruct-GGUF (base) | 360 M | no disponible en la información proporcionada | GGUF | Apache 2.0 | Genérico (llama.cpp y otros) |
| SmolLM2-360M-Instruct (original) | 360 M | no disponible en la información proporcionada | safetensors (original) | Apache 2.0 | Genérico |

La comparativa se limita al linaje directo del paquete porque la información proporcionada no incluye datos de rendimiento ni de otros modelos de la misma categoría. No se dispone de cifras de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- El paquete no aporta mediciones de rendimiento ni de corrección: todas las puertas figuran como "not yet re-measured", por lo que no hay evidencia publicada de fidelidad frente a llama.cpp.
- El soporte de hardware está restringido a AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201); no se declara compatibilidad con otras GPUs.
- Tool calling, razonamiento/thinking, reasoning effort, decodificación especulativa, imagen y audio figuran como "not applicable" en la tabla de características.
- El estado del sampling aparece como "no determinado" ("not determined"), lo que introduce incertidumbre sobre el comportamiento de `temperature`, `top_k` y `seed`.
- El modelo subyacente es de 360 M de parámetros, con la calidad y la capacidad de razonamiento limitadas que ello implica; no es adecuado para tareas que requieran conocimiento amplio o razonamiento complejo.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia y las condiciones del GGUF original de Unsloth y del modelo SmolLM2 de Hugging Face.
- El paquete tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-19), lo que sugiere que no ha sido validado por la comunidad.
- El campo `pipeline` figura como "no disponible", por lo que no se declara una tarea concreta en el Hub.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-SmolLM2-360M-Instruct-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/SmolLM2-360M-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
