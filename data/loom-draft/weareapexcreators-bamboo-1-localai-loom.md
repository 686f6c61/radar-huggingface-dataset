# loom-draft/weareapexcreators-Bamboo-1-LocalAI-loom

## Resumen

Bamboo-1-LocalAI-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `bamboo-v1-Q4_K_M.gguf` del modelo base `weareapexcreators/Bamboo-1-LocalAI`. Lo publica el usuario `loom-draft` y no contiene pesos propios: es un artefacto de empaquetado generado con la herramienta `loom-next` (sin intervención de un LLM en el proceso) para ejecutar el modelo sobre GPUs AMD concretas, el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El problema que resuelve es la portabilidad de la inferencia sobre ROCm/HIP en hardware AMD específico: el paquete incluye los kernels generados, el tokenizador y una configuración de servicio con API compatible con OpenAI (`/v1/chat/completions`), tool calling y modo de razonamiento opcional. La relevancia es acotada: el repositorio ocupa 0,0 GB, no registra descargas ni likes y todas las puertas de corrección y rendimiento aparecen como "not yet re-measured", por lo que no hay evidencia publicada de que el paquete funcione o rinda como se espera.

La información disponible no detalla arquitectura, número de parámetros ni composición del entrenamiento del modelo base; solo se conoce la cuantización Q4_K_M del GGUF, una ventana de contexto de 169.984 tokens por petición y una concurrencia de 4 peticiones. El modelo base pertenece al autor `weareapexcreators` y la licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `weareapexcreators/Bamboo-1-LocalAI`; el paquete solo empaqueta el GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 169.984 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF `bamboo-v1-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint original) empaquetado como programas `.loom` + `weights.loom` + `tokenizer.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) sobre ROCm |
| API | compatible con OpenAI `/v1/chat/completions` |
| Tool calling | si (formato OpenAI `tools` y `tool_calls`) |
| Modo razonamiento | si, desactivado por defecto (`chat_template_kwargs: {"enable_thinking": true}`) |
| Decodificacion especulativa | no aplicable segun la model card |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo base en los datos proporcionados. El paquete Loom no describe si `Bamboo-1-LocalAI` es un transformer denso, un MoE o un modelo híbrido, ni tampoco el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovación técnica del modelo (attention lineal, decodificación especulativa propia, etc.).

Lo que sí describe la model card es la capa de despliegue: `loom-next` genera programas `.loom` (kernels) a partir del GGUF sin modificar los pesos, y `loom-serve` los ejecuta sobre ROCm con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parámetros en host (`--parameter_mode=preload`). El paquete incluye dos presets (`chat` para Strix Halo y `chat-r9700` para la R9700) y fija los ficheros de origen con hash SHA-256 verificado por `loom-fetch`. La decodificación especulativa figura como no aplicable y el esfuerzo de razonamiento configurable también.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte declarado para bucles de agente multiturno en las puertas de corrección (`agent`, `agent_think_off`).
- Modo de razonamiento opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto largo de hasta 169.984 tokens por petición, útil para documentos extensos (las pruebas de referencia cubren documentos de 1k a 32k).
- Concurrencia de hasta 4 peticiones simultáneas con la garantía declarada de que la salida concurrente coincide con la ejecución aislada (puerta `consistency`).
- Capacidades multimodales: la entrada de imagen figura como "not determined"; audio, como "not determined"; el muestreo (temperature, top_k, seed), como "not determined".
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente conversacional local sobre hardware AMD: el paquete permite levantar un endpoint compatible con OpenAI en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 con dos comandos (`loom-fetch` y `loom-serve`), sin depender de CUDA ni de servicios en la nube.
- Procesamiento de documentos largos: con 169.984 tokens de contexto por petición se pueden resumir o consultar contratos, informes o bases de código extensas en una sola pasada, siempre que el hardware objetivo tenga memoria suficiente para el GGUF Q4_K_M.
- Agentes con herramientas: el soporte de `tool_calls` en formato OpenAI permite integrar el modelo en frameworks de agentes existentes (LangChain, LlamaIndex, etc.) para consultas a bases de datos o APIs internas, con el modo de razonamiento activable por petición.
- Inferencia en estaciones de trabajo con GPU AMD: la R9700 de 32 GB es el objetivo declarado para el preset `chat-r9700`, lo que encaja en entornos de desarrollo que ya disponen de hardware ROCm y quieren evitar una segunda plataforma de aceleración.
- Despliegue en equipos compactos con Strix Halo: el preset `chat` apunta a un SoC con memoria unificada, adecuado para prototipos y demos en local sin GPU discreta.
- Evaluación comparativa frente a llama.cpp: el paquete incluye puertas de corrección (`golden`, `compare`, `logits`, `sampling`) diseñadas para verificar token a token que la salida coincide con la referencia de llama.cpp sobre el mismo GGUF, lo que sirve para validar la madurez del runtime Loom en un hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para la Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas, de modo que no hay evidencia registrada de corrección ni de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del GGUF Q4_K_M no se indica y el repositorio ocupa 0,0 GB, lo que sugiere que los pesos no están alojados en este paquete (se obtienen vía `loom-fetch` desde el modelo base).
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que depende de ROCm/HIP y de kernels generados para gfx1151 y gfx1201.
- Cabe en GPU de consumo: no disponible; el hardware de referencia es un SoC con memoria unificada y una GPU profesional de 32 GB, no una GPU de consumo convencional.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; las mediciones frente a llama.cpp están pendientes de repetir en ambas plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Bamboo-1-LocalAI-loom | no disponible | 169.984 tokens | MIT | paquete Loom para gfx1151 y gfx1201 | sin benchmarks ni puertas de corrección medidas |
| weareapexcreators/Bamboo-1-LocalAI | no disponible | no disponible en esta ficha | MIT (heredada) | GGUF en Hugging Face | modelo base sin empaquetar; requiere runtime propio |
| llama.cpp sobre el mismo GGUF | no disponible | según configuración | MIT | runtime genérico | referencia usada por las puertas `golden` y `compare`; no se han registrado resultados |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evidencia: todas las puertas de corrección y las mediciones de rendimiento figuran como "not yet re-measured" en ambas plataformas; no hay confirmación publicada de que el paquete produzca salidas correctas.
- Paquete sin tracción: 0 descargas y 0 likes en el momento de la consulta, con un repositorio de 0,0 GB que no contiene los pesos; la disponibilidad futura del GGUF depende del repositorio base.
- Hardware muy restringido: solo se declaran objetivos gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no hay soporte documentado para otras GPU AMD ni para NVIDIA.
- Funciones sin determinar: entrada de imagen, audio y parámetros de muestreo figuran como "not determined", por lo que no deben asumirse en producción.
- Sesgos y alucinación: no disponibles; la model card no documenta evaluación de sesgos, tasas de alucinación ni comportamiento multilingüe del modelo base.
- Idiomas: no disponibles; no se puede confirmar calidad en castellano ni en otros idiomas.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base `weareapexcreators/Bamboo-1-LocalAI` antes de desplegar, ya que este paquete solo empaqueta el checkpoint.
- Dependencia de una versión fija del runtime (`hrx-loom[hf]==0.2.0`) y de los ficheros fijados por SHA-256 en `model.json.lock`; cualquier cambio en el repositorio base puede invalidar la verificación.
- El modo de razonamiento está desactivado por defecto; activarlo cambia el formato de las respuestas y debe probarse antes de integrarlo en pipelines existentes.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/weareapexcreators-Bamboo-1-LocalAI-loom
- Modelo base: https://huggingface.co/weareapexcreators/Bamboo-1-LocalAI
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
