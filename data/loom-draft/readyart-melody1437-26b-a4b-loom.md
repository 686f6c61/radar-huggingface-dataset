# loom-draft/ReadyArt-Melody1437-26B-A4B-loom

## Resumen

ReadyArt-Melody1437-26B-A4B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ReadyArt/Melody1437-26B-A4B-GGUF`, concretamente el archivo `Melody1437-26B-A4B-HB16-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y está orientado a dos aceleradores AMD concretos: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado y compilación de kernels generado con la herramienta `loom-next`, sin intervención de un LLM en el bucle de generación.

El modelo subyacente, por el nombre `26B-A4B`, parece seguir el patrón de una arquitectura Mixture of Experts con aproximadamente 26 mil millones de parámetros totales y unos 4 mil millones activos por token, aunque esta información no se confirma en la documentación disponible del paquete. El paquete declara soporte de contexto de 201.728 tokens por petición, hasta 4 peticiones concurrentes y un máximo de 4.096 tokens de salida por preset. La licencia declarada es Apache 2.0.

Su relevancia es acotada pero específica: cubre el nicho de servir modelos GGUF de gran tamaño en hardware AMD consumer y profesional reciente (Strix Halo y R9700) mediante un runtime propio (`hrx-loom`) con API compatible con OpenAI, tool calling y modo de razonamiento opcional. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de corrección aparecen como "not yet re-measured" en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se distribuye como GGUF; el nombre sugiere MoE con ~26B totales y ~4B activos, sin confirmar) |
| Parametros totales | no disponible (el nombre del checkpoint indica 26B) |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | 201.728 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint `Melody1437-26B-A4B-HB16-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programas `.loom` y `weights.loom` dentro del paquete Loom) |

Otros datos declarados en la tarjeta del paquete:

| Parametro | Valor |
|---|---|
| Peticiones concurrentes | 4 |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | soportado (estilo OpenAI `tools` y `tool_calls`) |
| Razonamiento / thinking | soportado, desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}` |
| Decodificacion especulativa | no aplicable en este paquete |
| Entrada de imagen | no soportada por Loom (el modelo upstream sí la tiene) |
| Entrada/salida de audio | no soportada por Loom (el modelo upstream sí la tiene) |
| Muestreo (sampling) | no determinado |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. El paquete Loom no entrena ni modifica pesos: parte del GGUF `Melody1437-26B-A4B-HB16-Q4_K_M.gguf` publicado por `ReadyArt` y genera kernels y programas `.loom` específicos para las arquitecturas AMD gfx1151 y gfx1201 mediante la herramienta `loom-next`. Por tanto, no hay datos sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones de entrenamiento en la documentación proporcionada.

Lo que sí documenta el paquete es el mecanismo de despliegue: `loom-fetch` descarga el paquete verificando los hashes sha256 de los archivos fuente fijados en `model.json.lock`, y `loom-serve` lo sirve con un pool de memoria fijo (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El paquete incluye además una batería de puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, pero todas aparecen como "not yet re-measured" en la tarjeta.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling / function calling con el esquema `tools` y `tool_calls` de OpenAI.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable por petición.
- Soporte de contexto largo: hasta 201.728 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Capacidades multilingües: no disponibles en la información del paquete.
- Visión: el modelo upstream la tiene, pero Loom no la soporta en este paquete.
- Audio: el modelo upstream lo tiene, pero Loom no lo soporta en este paquete.
- No hay soporte de decodificación especulativa en este paquete (marcado como "not applicable").
- No hay ajuste de esfuerzo de razonamiento ("reasoning effort" no aplicable).

## Casos de uso

- Despliegue local en estaciones con Ryzen AI Max+ 395: el paquete está precompilado para gfx1151, de modo que un equipo con ese APU puede servir el modelo con `loom-serve` sin compilar kernels a mano, usando el flujo `loom-fetch` + `loom-serve` documentado.
- Servicio de chat en GPU Radeon AI PRO R9700 de 32 GB: el preset `chat-r9700` está adaptado a gfx1201 y permite atender una API compatible con OpenAI en un equipo de sobremesa con 32 GB de VRAM.
- Asistentes con tool calling: al soportar `tools` y `tool_calls` en estilo OpenAI, el modelo puede integrarse en orquestadores de agentes que ya hablan ese protocolo, con el modo thinking desactivado por defecto para reducir latencia.
- Procesamiento de documentos largos: con 201.728 tokens de contexto por petición, es viable pasar contratos, informes o bases de código extensas en una sola llamada, siempre que el hardware soporte el coste de memoria del KV cache.
- Sustitución de llama.cpp en entornos AMD: el paquete incluye puertas de comparación contra llama.cpp (`golden`, `compare`, `logits`), lo que lo hace útil para equipos que quieran validar la paridad de un runtime alternativo antes de migrar.
- Evaluación de runtime Loom: al ser un artefacto generado automáticamente con `loom-next`, sirve como banco de pruebas para medir el rendimiento y la corrección del runtime en gfx1151 y gfx1201 frente a llama.cpp.
- Razonamiento por lotes con concurrencia limitada: las 4 peticiones concurrentes y los 4.096 tokens de salida por preset encajan en flujos de generación de resúmenes o clasificaciones por lotes, no en servicios de alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección aparecen sin medición registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El paquete apunta a la Radeon AI PRO R9700 con 32 GB y al APU Strix Halo, cuya memoria unificada se comparte con la CPU; el checkpoint es Q4_K_M de un modelo de ~26B, lo que en la práctica exige del orden de 16-20 GB solo para pesos, más el KV cache para 201.728 tokens de contexto, que puede ser muy elevado.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se documenta soporte para otras GPU.
- GPU consumer: el paquete está pensado para el APU Strix Halo, que es hardware consumer de gama alta; no se indica compatibilidad con RTX 4090, A100, H100 ni otras GPU fuera de las dos arquitecturas AMD citadas.
- Opciones de despliegue: exclusivamente el runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; la tarjeta indica que las mediciones aún no se han repetido para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReadyArt-Melody1437-26B-A4B-loom | ~26B totales / ~4B activos (por nombre, sin confirmar) | 201.728 tokens | Apache 2.0 | Paquete Loom (.loom + GGUF Q4_K_M) | Runtime propio, solo AMD gfx1151/gfx1201, sin benchmarks medidos |
| ReadyArt/Melody1437-26B-A4B-GGUF | ~26B totales / ~4B activos (por nombre, sin confirmar) | no disponible | no disponible en la información | GGUF | Checkpoint upstream sin modificar; sirve como referencia de paridad en las puertas de Loom |
| llama.cpp (runtime) | no aplica | depende del modelo | MIT (proyecto) | GGUF | Referencia contra la que Loom compara salidas (`golden`, `compare`, `logits`); soporta más hardware |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada, por lo que no es posible comparar rendimiento numérico.

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni de corrección: todas las puertas y las comparativas frente a llama.cpp aparecen como "not yet re-measured", por lo que no hay evidencia publicada de paridad funcional.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día (2026-11-19), lo que indica que es un artefacto recién generado y sin validación comunitaria.
- El tamaño del repo es 0.0 GB en la información de Hugging Face, lo que sugiere que los pesos pueden no estar materializados en el repositorio o que la metadata no refleja el contenido real; conviene verificar los archivos antes de confiar en `loom-fetch`.
- Soporte de hardware muy restringido: solo AMD gfx1151 (Strix Halo) y gfx1201 (R9700). No hay indicios de compatibilidad con GPU NVIDIA, Intel ni con otras GPU AMD.
- Sin soporte de visión ni audio en este paquete, aunque el modelo upstream sí los tenga: si se necesitan esas capacidades, hay que usar otro runtime.
- Sin decodificación especulativa y sin ajuste de esfuerzo de razonamiento.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens por preset, insuficiente para servicios de alta demanda o generaciones muy largas.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe sin evaluación previa.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de 26B cuantizado a Q4_K_M, cabe esperar degradación respecto al checkpoint en precisión completa, aunque no se cuantifica.
- Licencia Apache 2.0 declarada en el paquete, pero la licencia del modelo base no se detalla en la información proporcionada; conviene verificar la del repositorio `ReadyArt/Melody1437-26B-A4B-GGUF` antes de uso comercial.
- El nombre "Loom" coincide con el producto de grabación de pantalla de Atlassian y con la marca de ropa Loom; los resultados de búsqueda web devueltos no son relevantes para este paquete y no aportan información técnica.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Melody1437-26B-A4B-loom
- Modelo base (GGUF): https://huggingface.co/ReadyArt/Melody1437-26B-A4B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
