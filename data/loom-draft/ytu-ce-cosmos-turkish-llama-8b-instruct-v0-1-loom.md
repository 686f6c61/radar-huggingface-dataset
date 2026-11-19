# loom-draft/ytu-ce-cosmos-Turkish-Llama-8b-Instruct-v0.1-loom

## Resumen

Este repositorio no contiene un modelo nuevo, sino un paquete de despliegue en formato Loom para el checkpoint GGUF ya existente `ytu-ce-cosmos/Turkish-Llama-8b-Instruct-v0.1-GGUF` (variante `Turkish-Llama-8b-Instruct-v0.1.Q4_K_M.gguf`). Lo publica el usuario `loom-draft` y lo genera la herramienta `loom-next` (generador automático, sin LLM en el bucle). El paquete incluye programas `.loom` compilados, un `model.json` con los ficheros de origen fijados por sha256, el tokenizador y la configuración del modelo. Su propósito es servir el modelo base en GPUs AMD concretas mediante `loom-serve`, exponiendo una API compatible con OpenAI.

El modelo subyacente es un Llama-8B afinado para instrucciones en turco por el grupo YTU CE Cosmos, con licencia Llama 3. El paquete Loom no modifica los pesos: solo cambia la forma de cargarlos y ejecutarlos en hardware AMD (Ryzen AI Max+ 395 "Strix Halo", gfx1151, y Radeon AI PRO R9700, gfx1201, 32 GB). Es relevante para quien quiera ejecutar este modelo turco en GPUs AMD sin depender de llama.cpp, aunque las métricas de rendimiento y las puertas de corrección de este paquete aún no se han vuelto a medir.

El contexto servido por petición es de 8.192 tokens, con 4 peticiones concurrentes y un máximo de 4.096 tokens de salida por preset. El pipeline, los idiomas declarados y los benchmarks del modelo base no figuran en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama, derivada de Llama-8B); detalles internos no disponibles |
| Parametros totales | 8B (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por petición (preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible (modelo afinado para turco por nombre y origen) |
| Licencia | llama3 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` + `weights.loom` |

## Arquitectura y entrenamiento

El modelo base es un Llama de 8B parámetros afinado para instrucciones en turco por YTU CE Cosmos, distribuido originalmente como GGUF. El paquete Loom no aporta información sobre la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo RLHF o DPO; esos datos corresponden a la model card del modelo base, que no se ha proporcionado.

La innovación de este repositorio es de despliegue, no de modelado: `loom-next` genera kernels y programas `.loom` específicos para las arquitecturas AMD gfx1151 y gfx1201, y `loom-serve` los ejecuta con un pool de memoria fijado (`--pool_backing=fixed`) y precarga de parámetros (`--parameter_mode=preload`). El paquete declara soporte de decodificación especulativa, tool calling, razonamiento, visión y audio como "no aplicable", y muestreo como "no determinado".

## Capacidades

- Generación de texto conversacional en formato chat mediante `/v1/chat/completions` compatible con OpenAI.
- Afinado para instrucciones en turco (según el nombre y origen del modelo base).
- Contexto de 8.192 tokens por petición y hasta 4.096 tokens de salida.
- Hasta 4 peticiones concurrentes con salida consistente respecto a ejecuciones aisladas (según la puerta `consistency`, pendiente de medición).
- Tool calling: no aplicable en este paquete.
- Razonamiento o modo thinking: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen o audio: no aplicable.
- Muestreo (temperature, top_k, seed): no determinado.

## Casos de uso

- Asistente conversacional en turco: servir el modelo vía `loom-serve` y consumir la API OpenAI para conversaciones multi-turno de hasta 8.192 tokens de contexto, adecuado para atención en turco sin infraestructura NVIDIA.
- Despliegue en estaciones AMD: ejecutar el paquete en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 siguiendo los comandos `loom-fetch` y `loom-serve` documentados, útil para equipos con hardware AMD y requisitos de soberanía de datos.
- Evaluación comparativa frente a llama.cpp: usar las puertas `golden` y `compare` para verificar que la salida codiciosa coincide token a token con la referencia de llama.cpp sobre el mismo GGUF.
- Procesamiento por lotes de textos turcos: con 4 peticiones concurrentes y 4.096 tokens de salida, encaja en tareas de resumen, extracción o clasificación de documentos de longitud moderada.
- Integración en pipelines internos: al exponer una API compatible con OpenAI en `127.0.0.1:8080`, puede conectarse a clientes y orquestadores existentes sin adaptadores adicionales.
- Pruebas de regresión de kernels: las puertas `kernel_tests`, `logits` y `sampling` permiten validar la implementación de kernels generados frente a implementaciones de referencia.
- Prototipado de asistentes turcos en local: al ser Q4_K_M, el peso es reducido y permite iteración rápida en una única GPU de 32 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo base en la información disponible. Para este paquete Loom, las secciones de rendimiento y corrección indican explícitamente "not yet re-measured" en ambas GPUs (Strix Halo gfx1151 y Radeon AI PRO R9700 gfx1201), tanto para la comparación frente a llama.cpp como para las puertas `kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits` y `decision`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el checkpoint es Q4_K_M de un modelo de 8B, y la GPU de referencia R9700 declara 32 GB.
- GPU soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs consumer NVIDIA o AMD distintas de las citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir; API OpenAI en el puerto 8080.
- Opciones de ejecución recomendadas en la model card: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de completaciones), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones de rendimiento de este paquete aún no se han repetido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Turkish-Llama-8b-Instruct-v0.1 Q4_K_M, Loom) | 8B | 8.192 tokens por petición | llama3 | GGUF empaquetado en `.loom` | Hugging Face, requiere `hrx-loom` |
| ytu-ce-cosmos/Turkish-Llama-8b-Instruct-v0.1-GGUF (modelo base) | 8B | no disponible en la información | llama3 | GGUF | Hugging Face |
| Ejecución del mismo GGUF con llama.cpp | 8B | según configuración del usuario | llama3 | GGUF | Cualquier plataforma soportada por llama.cpp |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es un paquete de despliegue, no un modelo nuevo; cualquier evaluación de calidad debe hacerse sobre el modelo base.
- Las métricas de rendimiento y las puertas de corrección de este paquete están marcadas como "not yet re-measured"; no hay evidencia registrada de equivalencia con llama.cpp.
- Tool calling, razonamiento, decodificación especulativa, visión y audio están declarados como no aplicables; no deben asumirse en producción.
- El muestreo está marcado como "no determinado"; el comportamiento de temperature, top_k y seed no está verificado.
- Contexto limitado a 8.192 tokens por petición y salida máxima de 4.096 tokens; no apto para documentos largos sin troceado.
- Compatibilidad de hardware restringida a las GPUs AMD citadas (gfx1151 y gfx1201); no se documenta soporte para otras.
- Licencia Llama 3: sujeta a las condiciones de la licencia de Meta para Llama 3, incluidos requisitos de atribución y políticas de uso aceptable; verificar antes de uso comercial.
- Riesgo de alucinación y sesgos del modelo base: no disponible en la información proporcionada.
- Idiomas declarados: no disponibles; el modelo está orientado al turco por nombre y procedencia, pero no se documenta cobertura multilingüe.
- El paquete fija ficheros de origen por sha256 (`model.json.lock`), por lo que cualquier alteración de los pesos debe gestionarse mediante una nueva versión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ytu-ce-cosmos-Turkish-Llama-8b-Instruct-v0.1-loom
- Modelo base en Hugging Face: https://huggingface.co/ytu-ce-cosmos/Turkish-Llama-8b-Instruct-v0.1-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
