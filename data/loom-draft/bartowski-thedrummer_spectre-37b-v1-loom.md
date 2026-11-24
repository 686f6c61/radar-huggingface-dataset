# loom-draft/bartowski-TheDrummer_Spectre-37B-v1-loom

## Resumen

`loom-draft/bartowski-TheDrummer_Spectre-37B-v1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `TheDrummer_Spectre-37B-v1-Q4_K_M.gguf` de bartowski, que a su vez deriva del modelo base TheDrummer Spectre 37B v1. No se trata de un modelo entrenado desde cero ni de un fine-tune nuevo: es un artefacto de empaquetado generado con la herramienta `loom-next` para ejecutar el GGUF sin modificaciones sobre GPUs AMD concretas, en concreto la AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El interes de este repositorio es de infraestructura, no de modelado: ofrece un servidor compatible con la API de OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional y una configuración de contexto de 41.984 tokens por petición con 4 peticiones concurrentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos no están alojados aquí sino que se obtienen del GGUF de referencia.

La relevancia es acotada: sirve a quien quiera servir este GGUF de 37B en cuantización Q4_K_M sobre hardware AMD con el runtime Loom, evitando depender de llama.cpp. La licencia declarada es MIT, heredada del paquete, aunque la licencia del modelo base debe verificarse en su propio repositorio. Las mediciones de rendimiento y las puertas de corrección del paquete figuran como "not yet re-measured" en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no la declara; corresponde al modelo base TheDrummer Spectre 37B v1) |
| Parametros totales | 37B (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 41.984 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT (según la model card del paquete) |
| Formato de pesos | GGUF (`TheDrummer_Spectre-37B-v1-Q4_K_M.gguf`) empaquetado como programas `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Generador | loom-next (sin LLM en el bucle) |
| Herramienta de tool calling | sí, estilo OpenAI (`tools` y `tool_calls`) |
| Modo razonamiento | sí, desactivado por defecto (`chat_template_kwargs: {"enable_thinking": true}`) |
| Decodificacion especulativa | no aplicable en este paquete |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el dataset de entrenamiento, el número de tokens vistos ni las fases de alineación (RLHF, DPO u otras) del modelo base TheDrummer Spectre 37B v1. La model card de este repositorio no los documenta y la búsqueda web realizada no aporta resultados pertinentes (los enlaces devueltos corresponden a Loom, la herramienta de grabación de vídeo, y a la marca de ropa Loom, sin relación con el proyecto).

Lo que sí documenta el paquete es la capa de ejecución: los programas `.loom` se generan con `loom-next` a partir del GGUF sin modificarlo, y `loom-serve` los ejecuta sobre AMDGPU con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, usada en las mediciones de la tarjeta), `--pool_backing=fixed` (pool de memoria comprometido por adelantado) y `--parameter_mode=preload` (afecta solo a la carga de pesos en host). La tarjeta incluye puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan contra llama.cpp, pero todas aparecen como "not yet re-measured" para ambas GPUs objetivo.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles de agente multi-turno según las puertas `agent` y `agent_think_off` definidas en la tarjeta.
- Modo de razonamiento opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`. No hay niveles de esfuerzo de razonamiento ("reasoning effort: not applicable").
- Concurrencia de hasta 4 peticiones simultáneas con contexto de 41.984 tokens por petición.
- Salida limitada a 4.096 tokens por petición según el preset.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream sí la tiene según la propia tarjeta.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream sí las tiene según la tarjeta.
- Decodificación especulativa: no aplicable en este paquete.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat sobre GPU AMD de escritorio o estación de trabajo: con `loom-fetch` y `loom-serve` se levanta un endpoint `/v1/chat/completions` en el puerto 8080 sobre una Radeon AI PRO R9700 de 32 GB o una Strix Halo, sin necesidad de stack CUDA ni de llama.cpp.
- Asistentes con tool calling en pipelines internos: el soporte de `tools`/`tool_calls` permite conectar el modelo a funciones de negocio (consultas a bases de datos, APIs internas) usando clientes compatibles con OpenAI sin adaptadores propios.
- Procesamiento de documentos de hasta ~40k tokens: la ventana de 41.984 tokens por petición encaja en tareas de resumen, extracción de entidades o preguntas sobre contratos e informes de longitud media en una sola pasada.
- Razonamiento con activación selectiva: al estar el thinking desactivado por defecto, se puede usar el modelo en modo rápido para tareas simples y activarlo por petición para problemas que requieran cadena de razonamiento, sin cambiar de despliegue.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT declarada en el paquete facilita su integración en productos comerciales, siempre que se verifique la licencia del modelo base.
- Evaluación de runtime alternativo: útil para equipos que quieran comparar el comportamiento de Loom frente a llama.cpp sobre el mismo GGUF, ya que la tarjeta define puertas de comparación token a token y de log-probs.
- Prototipado local en hardware AMD consumer/prosumer: la cuantización Q4_K_M reduce el peso del modelo lo suficiente para caber en los 32 GB de la R9700 y en la memoria unificada de Strix Halo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para ambas GPUs ("Strix Halo (gfx1151)" y "Radeon AI PRO R9700 (gfx1201, 32 GB)") "are not yet re-measured", y todas las puertas de corrección figuran como "not yet re-measured".

| Apartado | Strix Halo (gfx1151) | Radeon AI PRO R9700 (gfx1201) |
|---|---|---|
| Rendimiento vs llama.cpp | no re-medido | no re-medido |
| `kernel_tests` | no re-medido | no re-medido |
| `golden` | no re-medido | no re-medido |
| `compare` | no re-medido | no re-medido |
| `vision` | no re-medido | no re-medido |
| `consistency` | no re-medido | no re-medido |
| `spec` | no re-medido | no re-medido |
| `agent` / `agent_think_off` | no re-medido | no re-medido |
| `sampling` | no re-medido | no re-medido |
| `logits` | no re-medido | no re-medido |
| `decision` | no re-medido | no re-medido |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El paquete está pensado para la Radeon AI PRO R9700 con 32 GB y para la Ryzen AI Max+ 395 "Strix Halo", que usa memoria unificada; un GGUF de 37B en Q4_K_M requiere del orden de 20-22 GB solo para pesos, más overhead de contexto y pool, por lo que 32 GB es el mínimo razonable para la ventana completa.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se documentan otras GPU en la información disponible.
- GPU consumer: no se confirma compatibilidad con GPUs consumer AMD distintas de las citadas; el paquete incluye presets específicos por arquitectura (`chat` para gfx1151 y `chat-r9700` para gfx1201).
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/bartowski-TheDrummer_Spectre-37B-v1-loom:chat` (o `:chat-r9700`) con `--materialize=copy`, y `loom-serve --model=thedrummer_spectre-37b-v1 '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Latencia y throughput: no disponibles; la tarjeta no incluye cifras y las comparativas frente a llama.cpp están pendientes de re-medición.
- Concurrencia máxima configurada: 4 peticiones simultáneas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones comparables de otros modelos, y la búsqueda web no devuelve resultados relacionados con TheDrummer Spectre 37B v1 ni con alternativas de la misma categoría. Como referencia estructural, el paquete se puede contrastar con el propio GGUF de origen (`bartowski/TheDrummer_Spectre-37B-v1-GGUF`) ejecutado mediante llama.cpp, pero no se dispone de cifras para establecer una comparación cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Runtime |
|---|---|---|---|---|---|
| bartowski-TheDrummer_Spectre-37B-v1-loom (este) | 37B | 41.984 tokens | MIT (paquete) | GGUF empaquetado en Loom | loom-serve 0.2.0 |
| bartowski/TheDrummer_Spectre-37B-v1-GGUF (origen) | 37B | no disponible | no disponible | GGUF | llama.cpp u otros |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: es un empaquetado del GGUF de bartowski para el runtime Loom. Cualquier limitación del modelo base se hereda íntegramente.
- Sin evidencia de corrección publicada: todas las puertas (`golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, etc.) figuran como "not yet re-measured", por lo que no hay verificación documentada de que la salida coincida con llama.cpp.
- Sin mediciones de rendimiento: no hay cifras de latencia ni throughput para ninguna de las dos GPUs objetivo.
- Modalidades recortadas: el modelo upstream tiene entrada de imagen y de audio según la tarjeta, pero Loom no las soporta; quien necesite visión o audio debe usar otro runtime.
- Contexto limitado a 41.984 tokens por petición y salida máxima de 4.096 tokens, con solo 4 peticiones concurrentes; insuficiente para cargas de alta concurrencia.
- Sin decodificación especulativa en este paquete, lo que puede penalizar el throughput en comparación con stacks que sí la implementan.
- Licencia: el paquete declara MIT, pero la licencia del modelo base no se detalla en la información disponible; conviene verificarla antes de uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base.
- Madurez del ecosistema: 0 descargas y 0 likes, repositorio creado en noviembre de 2026 y actualizado pocos días después; el proyecto Loom y `loom-next` son herramientas emergentes.
- Dependencia de hardware AMD concreta: los presets están atados a gfx1151 y gfx1201; no se documenta compatibilidad con otras GPUs.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/bartowski-TheDrummer_Spectre-37B-v1-loom
- GGUF de origen: https://huggingface.co/bartowski/TheDrummer_Spectre-37B-v1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Modelo base TheDrummer Spectre 37B v1: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
