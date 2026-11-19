# loom-draft/bartowski-t-tech_T-Search-loom

## Resumen

`loom-draft/bartowski-t-tech_T-Search-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF `t-tech_T-Search-Q4_K_M.gguf` publicado por bartowski. El paquete lo distribuye el usuario `loom-draft` y está pensado para ejecutar el modelo sobre GPUs AMD concretas: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). La generación se ha hecho con `loom-next`, el generador del ecosistema Loom, sin intervención de un LLM en el bucle.

El modelo subyacente es multimodal (pipeline `image-text-to-text`), con soporte de razonamiento/thinking, tool calling estilo OpenAI, decodificación especulativa MTP y una ventana de contexto de 262.144 tokens por petición. El paquete expone un servidor compatible con `/v1/chat/completions`, admite 4 peticiones concurrentes y limita la salida a 4.096 tokens por preset. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un caso de empaquetado específico para hardware AMD (ROCm/Loom) que no sigue la ruta habitual de llama.cpp, vLLM u Ollama; por otro, advierte de que el repositorio tiene 0 descargas, 0 likes y un tamaño de 0,0 GB, y de que las mediciones de rendimiento y las puertas de corrección del autor figuran como "not yet re-measured" (sin datos). Cualquier evaluación de producción debe hacerse con cautela y verificarse contra el GGUF original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GGUF `t-tech_T-Search`; no se detalla en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); no se listan otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint `t-tech_T-Search-Q4_K_M.gguf`) empaquetado como programa Loom (`.loom` + `model.json`); proyector de visión `mmproj-t-tech_T-Search-bf16.gguf` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `t-tech_T-Search` (tipo de transformer, atención, posible mezcla de expertos, número de parámetros o composición del dataset de entrenamiento) en la documentación proporcionada. Lo único verificable es que se distribuye como GGUF cuantizado en Q4_K_M y que incluye un proyector multimodal en bf16 (`mmproj-t-tech_T-Search-bf16.gguf`), lo que confirma la capacidad de entrada de imágenes.

El paquete Loom añade una capa de ejecución específica para AMD: kernels generados por `loom-next`, un servidor compatible con la API de OpenAI, decodificación especulativa MTP con profundidad 3 activada por defecto y un modo de razonamiento ("thinking") también activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`. No se documentan detalles de RLHF, DPO ni de la composición del corpus de entrenamiento.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable o desactivable por petición.
- Entrada de imágenes vía `image_url` en formato OpenAI, usando el proyector `mmproj-t-tech_T-Search-bf16.gguf` (pipeline `image-text-to-text`).
- Tool calling / function calling estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agente según las puertas `agent` y `agent_think_off` del autor.
- Decodificación especulativa MTP (depth 3) activada por defecto.
- Servidor HTTP compatible con `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de salida de 4.096 tokens por preset.
- Capacidades multilingües: no disponibles en la documentación.
- Audio: no soportado (marcado como "not applicable").
- Ajuste de "reasoning effort": no aplicable.

## Casos de uso

- Despliegue local en estaciones con APU Strix Halo: usar `loom-fetch` y `loom-serve` con el preset `chat` para servir el modelo en `127.0.0.1:8080` y consumirlo desde herramientas internas sin depender de la nube.
- Inferencia en servidores con Radeon AI PRO R9700 (32 GB): emplear el preset `chat-r9700` para aprovechar la VRAM de la tarjeta y servir un endpoint compatible con OpenAI a equipos de desarrollo.
- Análisis de documentos largos con imágenes: la ventana de 262.144 tokens permite pasar contratos, informes o expedientes extensos junto con capturas o escaneos, y pedir extracción de datos estructurados.
- Asistentes con tool calling: integrar el endpoint en un orquestador de agentes que envíe `tools` y consuma `tool_calls` para consultar APIs internas, bases de datos o sistemas de ticketing.
- Automatización de soporte con contexto largo: gestionar conversaciones multi-turno con historial extenso, activando o desactivando el modo thinking según el coste de latencia aceptable.
- Pruebas de compatibilidad y regresión de kernels AMD: usar las puertas de corrección (`golden`, `compare`, `spec`, `agent`, `vision`) como banco de pruebas para validar implementaciones ROCm/Loom frente a llama.cpp.
- Prototipado de pipelines multimodales: validar flujos image-text-to-text (por ejemplo, clasificación de capturas o extracción de campos de formularios) antes de migrar a un despliegue de mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible (el autor no publica cifras; el preset `chat-r9700` está pensado para una tarjeta de 32 GB).
- GPU recomendadas: las dos anteriores; no se mencionan A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada; el paquete está orientado a hardware AMD concretos y no se documenta soporte para otras GPUs.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete (llama.cpp se usa solo como referencia de corrección).
- Flags relevantes: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de completaciones), `--pool_backing=fixed` (pool de memoria fijo) y `--parameter_mode=preload` (carga de pesos en host).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/bartowski-t-tech_T-Search-loom` (este) | no disponible | 262.144 tokens | Loom (`.loom` + `model.json`) sobre GGUF Q4_K_M | Apache 2.0 | Paquete específico para AMD Strix Halo y R9700; sin benchmarks ni descargas |
| `bartowski/t-tech_T-Search-GGUF` (modelo base) | no disponible | no disponible | GGUF | Apache 2.0 (según este paquete) | Checkpoint original sin empaquetado Loom; referencia de corrección |
| llama.cpp (runtime, no modelo) | no aplica | no aplica | GGUF nativo | MIT | Usado por el autor como referencia de tokens y log-probs |

No se dispone de información sobre otros modelos comparables de la misma categoría (multimodales con contexto largo) en la documentación proporcionada.

## Limitaciones y advertencias

- Repositorio sin tracción: 0 descargas, 0 likes, tamaño de 0,0 GB y creado/actualizado el 2026-11-19; no hay evidencia de uso en producción.
- Sin benchmarks ni puertas de corrección medidas: todas las comprobaciones del autor figuran como "not yet re-measured", por lo que no hay garantía publicada de equivalencia con llama.cpp.
- Hardware restringido: el paquete está generado para gfx1151 (Strix Halo) y gfx1201 (R9700); no se documenta compatibilidad con otras GPUs ni con CUDA.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingüe.
- Sesgos y alucinaciones: no documentados por el autor; deben evaluarse empíricamente antes de usar el modelo en producción.
- Límite de salida de 4.096 tokens por preset: puede ser insuficiente para tareas de generación larga.
- Concurrencia limitada a 4 peticiones: no apto para cargas de alta concurrencia sin escalado horizontal.
- Licencia Apache 2.0 declarada en el paquete, pero conviene verificar la licencia del modelo base `t-tech_T-Search` antes de un uso comercial.
- Los resultados de búsqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla y marca de ropa); no aportan información técnica sobre este paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-t-tech_T-Search-loom
- Modelo base GGUF: https://huggingface.co/bartowski/t-tech_T-Search-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- ROCm / hrx-system: https://github.com/ROCm/hrx-system
