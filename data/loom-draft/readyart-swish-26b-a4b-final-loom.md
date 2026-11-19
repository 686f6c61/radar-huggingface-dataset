# loom-draft/ReadyArt-Swish-26B-A4B-Final-loom

## Resumen

ReadyArt-Swish-26B-A4B-Final-loom es un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado por el usuario loom-draft a partir del checkpoint GGUF sin modificar `ReadyArt/Swish-26B-A4B-Final-GGUF`, en su cuantización Q4_K_M. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que traduce los pesos GGUF a programas Loom ejecutables sobre GPUs AMD concretas, en concreto el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next`, que según la model card opera sin LLM en el bucle.

El modelo subyacente, Swish-26B-A4B-Final, se presenta por su nomenclatura como un modelo de 26B parámetros totales con aproximadamente 4B activos, lo que sugiere una arquitectura de mezcla de expertos (MoE) dispersa. Sin embargo, la model card del paquete Loom no documenta la arquitectura interna, los datos de entrenamiento ni los benchmarks del modelo base; toda esa información queda fuera del alcance de este repositorio. La relevancia de este paquete es de infraestructura: permite servir el modelo con una API compatible con OpenAI sobre hardware AMD consumer y profesional, usando el runtime Loom en lugar de llama.cpp.

El paquete expone una ventana de contexto de 201.728 tokens por petición, soporte de tool calling estilo OpenAI, modo de razonamiento opcional (desactivado por defecto) y hasta 4 peticiones concurrentes, con un máximo de 4.096 tokens de salida por preset. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que indica que los pesos no están alojados en este repositorio sino referenciados desde el GGUF base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre "A4B" sugiere MoE con ~4B activos; no confirmado en la model card) |
| Parametros totales | 26B (según nomenclatura del modelo base; no verificado en la card) |
| Parametros activos | ~4B (según nomenclatura "A4B"; no confirmado) |
| Longitud de contexto | 201.728 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen); el paquete Loom usa programas `.loom` generados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen (`Swish-26B-A4B-Final-Q4_K_M.gguf`) empaquetado como programas `.loom` + `weights.loom` + `tokenizer.json` |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Sí, formato OpenAI (`tools` / `tool_calls`) |
| Razonamiento | Opcional, desactivado por defecto (`chat_template_kwargs: {"enable_thinking": true}`) |
| Decodificación especulativa | No aplicable en este preset |
| Entrada de imagen | No determinado |
| Entrada/salida de audio | No determinado |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura del modelo subyacente. Se trata, por tanto, de un artefacto de compilación y empaquetado: `loom-next` toma el GGUF Q4_K_M original y genera programas `.loom` (kernels) más un `model.json` con los metadatos y los ficheros fuente fijados por hash SHA-256, verificados por `loom-fetch`. No hay evidencia de reentrenamiento, fine-tuning ni modificación de pesos; el autor declara explícitamente que el checkpoint GGUF es "unmodified".

El nombre del modelo base, Swish-26B-A4B-Final, indica 26B parámetros totales y aproximadamente 4B activos, patrón habitual en arquitecturas MoE dispersas, pero no se aporta confirmación documental en esta card. Tampoco se detallan tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. La innovación técnica destacable de este paquete es de runtime: kernels generados específicamente para las arquitecturas AMD gfx1151 y gfx1201, con opciones de despliegue como `completion_spin_ns` (espera activa de finalizaciones de GPU), `pool_backing=fixed` (pool de memoria comprometido por adelantado) y `parameter_mode=preload` (carga de pesos en host). El paquete incluye un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`, entre otras) que, en el momento de la publicación, figuran como "not yet re-measured" para ambas GPUs.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI, con soporte de `tools` y `tool_calls` en las peticiones y respuestas.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto largo de hasta 201.728 tokens por petición, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Concurrencia de hasta 4 peticiones simultáneas con salida máxima de 4.096 tokens por preset.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no determinada ("not determined" en la tabla de features).
- Audio: no determinado.
- Decodificación especulativa: no aplicable en este preset.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.

## Casos de uso

- Despliegue local en estaciones de trabajo AMD: servir el modelo en un Ryzen AI Max+ 395 o en una Radeon AI PRO R9700 mediante `loom-serve`, sin depender de CUDA ni de llama.cpp, usando la API OpenAI para integrarlo con clientes existentes.
- Asistentes conversacionales de contexto largo: con 201.728 tokens por petición, el modelo puede mantener conversaciones multi-turno con historiales extensos o procesar documentos largos en una sola llamada, útil en atención al cliente o análisis documental.
- Automatización con tool calling: integración en flujos donde el modelo invoca funciones externas (consultas a bases de datos, APIs internas, operaciones de ficheros) mediante el formato `tools`/`tool_calls` de OpenAI, por ejemplo en pipelines de agentes de soporte técnico.
- Razonamiento por etapas bajo demanda: activar `enable_thinking` solo en peticiones que requieran análisis complejo (cálculo, planificación, depuración) y desactivarlo en el resto para reducir latencia, dado que está apagado por defecto.
- Procesamiento por lotes en hardware AMD profesional: usar la Radeon AI PRO R9700 (32 GB) para servir hasta 4 peticiones concurrentes en tareas de generación de texto, resumen o extracción de información, aprovechando el pool de memoria fijo.
- Evaluación y benchmarking de runtimes alternativos: el paquete incluye puertas de corrección comparadas contra llama.cpp (tokens greedy, top-5 log-probs, consistencia bajo concurrencia), lo que lo hace útil para validar la fidelidad numérica de Loom frente a la referencia en GPUs AMD.
- Entornos de desarrollo con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales internos sin las restricciones de licencias copyleft o de uso limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201, 32 GB), "the results for this package are not yet re-measured", y todas las puertas de corrección figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es un GGUF Q4_K_M de 26B parámetros, lo que sitúa el peso de los pesos en torno a 15-16 GB, aunque la card no confirma esta cifra.
- GPU soportadas de forma nativa por este paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs NVIDIA ni con otras Radeon; el paquete está generado específicamente para las dos arquitecturas AMD citadas.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo; flags relevantes `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; la card no incluye mediciones para este paquete.
- Concurrencia máxima configurada: 4 peticiones simultáneas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Runtime/hardware | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt-Swish-26B-A4B-Final-loom | 26B totales / ~4B activos (según nomenclatura, no confirmado) | 201.728 tokens | Apache 2.0 | Loom sobre AMD gfx1151 y gfx1201 | Paquete Loom en HF; pesos referenciados desde el GGUF base |
| ReadyArt/Swish-26B-A4B-Final-GGUF (modelo base) | 26B totales / ~4B activos (según nomenclatura) | no disponible en esta ficha | Apache 2.0 (heredada) | llama.cpp y otros runtimes GGUF | GGUF en HF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del paquete ni del modelo base en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB: los pesos no están alojados aquí, sino referenciados desde `ReadyArt/Swish-26B-A4B-Final-GGUF`; la disponibilidad del paquete depende de que ese repositorio base siga accesible.
- No hay mediciones de rendimiento ni de corrección publicadas para este paquete: todas las puertas figuran como "not yet re-measured", por lo que no hay evidencia registrada de fidelidad frente a llama.cpp en ninguna de las dos GPUs objetivo.
- Compatibilidad de hardware muy restringida: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se garantiza funcionamiento en otras GPUs AMD ni en NVIDIA.
- Capacidades de visión, audio y muestreo figuran como "not determined": no deben asumirse en producción sin verificación previa.
- El modo de razonamiento está desactivado por defecto; si se requiere, hay que activarlo explícitamente por petición, lo que afecta a la latencia.
- Límite de 4.096 tokens de salida por preset y 4 peticiones concurrentes: puede ser insuficiente para cargas de generación larga o de alta concurrencia.
- No se documentan sesgos, idiomas soportados ni comportamiento de alucinación del modelo base; al ser un artefacto de empaquetado, estas limitaciones se heredan del checkpoint original sin información adicional.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el modelo base mantiene la misma licencia y que no existen restricciones adicionales en el GGUF de origen.
- El paquete se ha generado con `loom-next` "sin LLM en el bucle", pero no se detalla el proceso de validación de los kernels generados más allá de las puertas pendientes de medición.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/ReadyArt-Swish-26B-A4B-Final-loom
- Modelo base GGUF: https://huggingface.co/ReadyArt/Swish-26B-A4B-Final-GGUF
- Runtime Loom (hrx-system, ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
