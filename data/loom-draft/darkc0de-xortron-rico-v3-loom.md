# loom-draft/darkc0de-XORTRON-RICO-v3-loom

## Resumen

XORTRON-RICO-v3-loom es un paquete de despliegue `.loom` publicado por el usuario `loom-draft` para servir el checkpoint GGUF `darkc0de/XORTRON-RICO-v3-GGUF` (concretamente el fichero `XORTRON-RICO-v3.i1-Q4_K_M.gguf`) sobre GPUs AMD. No se trata de un modelo nuevo entrenado por este autor, sino de un artefacto de empaquetado generado con la herramienta `loom-next` que traduce el grafo de un modelo GGUF a programas y kernels optimizados para el runtime Loom de AMD (ROCm). El modelo base es multimodal (`image-text-to-text`) y conserva la licencia MIT del checkpoint original.

El paquete está dirigido a dos plataformas concretas: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Incluye un `model.json` que describe el modelo, presets de memoria y parámetros, y expone una API compatible con OpenAI (`/v1/chat/completions`) a través de `loom-serve`. La propuesta de valor es poder ejecutar el GGUF sin modificarlo sobre hardware AMD con decodificación especulativa MTP activada por defecto y soporte de tool calling y razonamiento.

La información pública disponible es muy limitada: el repositorio de Hugging Face aparece con 0 GB, sin descargas ni likes, y la model card no incluye especificaciones del modelo base (parámetros totales, arquitectura interna, datos de entrenamiento) ni resultados de benchmarks. Las mediciones de rendimiento frente a llama.cpp figuran explícitamente como "not yet re-measured" y todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, etc.) están sin registrar. Cualquier evaluación de calidad del modelo debe remitirse al checkpoint base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GGUF multimodal; arquitectura interna no especificada en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (fichero `XORTRON-RICO-v3.i1-Q4_K_M.gguf`); proyector de vision en F16 (`XORTRON-RICO-v3.mmproj-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como `.loom` + `model.json`) |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | Loom (`hrx-loom[hf]==0.2.0`, `loom-serve`) |
| API | OpenAI-compatible `/v1/chat/completions` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `darkc0de/XORTRON-RICO-v3-GGUF`: la model card del paquete Loom no describe el transformer, el número de parámetros, la composición del dataset ni si hubo RLHF o DPO. Lo único verificable es que se trata de un modelo multimodal que acepta entrada de imagen mediante un proyector separado (`XORTRON-RICO-v3.mmproj-f16.gguf`) y texto, y que el checkpoint se distribuye cuantizado en Q4_K_M.

La innovación técnica relevante de este paquete no está en el modelo sino en el runtime: Loom genera kernels y programas a partir del grafo GGUF (sin intervención de un LLM en el bucle de generación, según el autor) para ejecutarlos sobre ROCm en hardware AMD. El paquete activa decodificación especulativa MTP con profundidad 3 por defecto, ofrece tres niveles de esfuerzo de razonamiento (`low`, `medium`, `xhigh`, siendo `xhigh` el valor por defecto) y expone un modo de "thinking" activado por defecto que puede desactivarse con `chat_template_kwargs: {"enable_thinking": false}`. La memoria se gestiona con `--pool_backing=fixed` (pool comprometido por adelantado) y `--parameter_mode=preload` (carga de pesos en host anticipada).

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 262.144 tokens por petición.
- Entrada de imágenes en formato OpenAI (`image_url`), procesadas por el proyector F16; pipeline `image-text-to-text`.
- Razonamiento explícito ("thinking") activado por defecto, con control de esfuerzo mediante `reasoning_effort` (`low`, `medium`, `xhigh`).
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`), incluyendo bucles multi-turno de agente.
- Decodificación especulativa MTP (profundidad 3) activada por defecto para acelerar la generación.
- Servicio concurrente de hasta 4 peticiones simultáneas.
- API compatible con OpenAI, lo que permite reutilizar clientes y SDK existentes.
- Sin soporte de audio (entrada ni salida).
- Comportamiento de muestreo (`sampling`) no determinado según la propia model card.

## Casos de uso

- Asistente conversacional con documentos largos: la ventana de 262.144 tokens permite cargar contratos, informes o bases de código extensas en una sola petición sin trocear, útil para resumen y pregunta-respuesta sobre corpus grandes.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y los bucles multi-turno permiten construir agentes que consulten APIs internas, bases de datos o sistemas de ficheros, ejecutándose íntegramente en hardware AMD sin depender de la nube.
- Análisis de imágenes en flujos documentales: la entrada multimodal (`image_url`) sirve para extraer información de capturas, diagramas o documentos escaneados y combinarla con texto en la misma conversación.
- Sustitución de backend en aplicaciones ya integradas con OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un cliente existente al endpoint local de `loom-serve` cambiando solo la URL base, lo que facilita migraciones y pruebas A/B.
- Despliegue en estaciones de trabajo con GPU AMD: el paquete está pensado para Strix Halo y Radeon AI PRO R9700, de modo que equipos con esas plataformas pueden servir el modelo sin depender de CUDA.
- Prototipado de razonamiento con niveles de esfuerzo: ajustar `reasoning_effort` entre `low` y `xhigh` permite equilibrar latencia y profundidad en tareas de análisis, planificación o matemáticas.
- Evaluación comparativa de runtimes: útil para equipos que quieran medir Loom frente a llama.cpp sobre el mismo GGUF, aunque las métricas publicadas aún no estén actualizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el checkpoint se sirve en Q4_K_M y el hardware de referencia es una GPU de 32 GB (Radeon AI PRO R9700), lo que sugiere que el modelo cuantizado cabe en ese presupuesto, pero no se publica el tamaño exacto de los pesos.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se menciona soporte para GPUs NVIDIA ni CUDA.
- GPU de consumo: no disponible; no se cita ninguna GPU de consumo como objetivo.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` (preset `chat` para Strix Halo, `chat-r9700` para R9700) y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp están pendientes de re-medición.
- Concurrencia soportada: 4 peticiones simultáneas.
- Salida máxima por petición: 4.096 tokens.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan establecer una comparación con alternativas. El único punto de referencia mencionado es llama.cpp como runtime de comparación sobre el mismo GGUF, no como modelo distinto.

## Limitaciones y advertencias

- La model card no documenta sesgos, composición del dataset ni evaluaciones de seguridad del modelo base; no hay base para estimar su comportamiento en dominios sensibles.
- Riesgo de alucinación no cuantificado: no se han publicado resultados de benchmarks ni de evaluaciones de fidelidad.
- Todas las puertas de corrección del runtime (`golden`, `compare`, `vision`, `spec`, `agent`, etc.) figuran sin registrar, por lo que no hay evidencia publicada de que la salida de Loom coincida con la de llama.cpp sobre este GGUF.
- Las mediciones de rendimiento frente a llama.cpp están pendientes de re-medición en ambas plataformas.
- El comportamiento de muestreo (`sampling`) aparece como "not determined" en la propia tabla de características.
- Idiomas soportados no disponibles; no se puede garantizar calidad en castellano ni en otros idiomas.
- El paquete está atado a hardware AMD concreto (gfx1151 y gfx1201) y a la versión `hrx-loom[hf]==0.2.0`; no se documenta portabilidad a otras GPUs.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia y condiciones del checkpoint base `darkc0de/XORTRON-RICO-v3-GGUF` por separado.
- Repositorio con 0 descargas, 0 likes y tamaño de 0 GB en Hugging Face: madurez y mantenimiento del artefacto no verificables.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`), inferior a la ventana de contexto de 262.144 tokens.
- Concurrencia máxima de 4 peticiones, lo que limita su uso como servidor de producción de alta carga.

## Enlaces

- [Hugging Face: loom-draft/darkc0de-XORTRON-RICO-v3-loom](https://huggingface.co/loom-draft/darkc0de-XORTRON-RICO-v3-loom)
- [Modelo base: darkc0de/XORTRON-RICO-v3-GGUF](https://huggingface.co/darkc0de/XORTRON-RICO-v3-GGUF)
- [Runtime Loom (ROCm/hrx-system)](https://github.com/ROCm/hrx-system)
- [Generador loom-next](https://github.com/loom-fun/loom-next)
- [Sitio del ecosistema Loom](https://loom-fun.github.io/loom-dev/)
