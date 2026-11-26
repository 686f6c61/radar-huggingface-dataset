# loom-draft/mradermacher-xyntrai-Sarah-mistral-2501-36B-nsfw-i1-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje entrenado, sino un paquete de despliegue en formato `.loom` para el checkpoint GGUF `xyntrai-Sarah-mistral-2501-36B-nsfw-i1-Q4_K_M.gguf`, publicado originalmente por `mradermacher`. El paquete lo genera la herramienta `loom-next` (sin intervención de un LLM en el bucle) y lo publica el usuario `loom-draft` bajo licencia MIT. Su objetivo es permitir servir ese GGUF concreto sobre GPUs AMD mediante el runtime `hrx-loom` (versión 0.2.0), con kernels generados específicamente para las arquitecturas gfx1151 (Ryzen AI Max+ 395, "Strix Halo") y gfx1201 (Radeon AI PRO R9700, 32 GB).

El modelo subyacente se presenta como un finetune de la familia Mistral 2501 con aproximadamente 36B parámetros (según el nombre del checkpoint), en variante NSFW y cuantizado en Q4_K_M. No obstante, la model card no aporta información sobre arquitectura interna, datos de entrenamiento, idiomas ni benchmarks del modelo original: toda la documentación disponible describe el empaquetado y la ejecución, no el entrenamiento.

La relevancia de esta ficha es acotada: sirve para evaluar si el paquete es utilizable en producción sobre hardware AMD, pero no permite caracterizar las capacidades del modelo en sí. A fecha de creación del repositorio (26 de noviembre de 2026) el paquete acumula 0 descargas y 0 likes, y las mediciones de rendimiento y de corrección figuran como no re-medidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el checkpoint base se denomina "mistral-2501"; la model card no detalla la arquitectura interna) |
| Parametros totales | 36B (según el nombre del checkpoint; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens por petición (límite del preset de Loom) |
| Tipos de cuantizacion | Q4_K_M (única incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) empaquetado como `.loom` (programas `program/*.loom` + `model.json`) |

Otros parámetros operativos declarados en el preset:

| Parametro | Valor |
|---|---|
| Salida maxima | 4.096 tokens (`max_tokens` del preset) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Tool calling | no aplicable |
| Reasoning / thinking | no aplicable |
| Decodificacion especulativa | no aplicable |
| Entrada de imagen | no determinado |
| Entrada/salida de audio | no determinado |
| Muestreo (sampling) | no determinado |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo subyante ni sobre su proceso de entrenamiento en la documentación proporcionada. El nombre del checkpoint sugiere una base Mistral 2501 de ~36B parámetros afinada para contenido NSFW, pero la model card del paquete no incluye número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otra etapa de alineamiento.

Lo que sí está documentado es la capa de despliegue: `loom-next` genera programas `.loom` (kernels) a partir del GGUF sin un LLM en el bucle, y `hrx-loom` 0.2.0 los ejecuta sobre AMD ROCm. El paquete fija los ficheros fuente con `model.json.lock` y verifica su `sha256` mediante `loom-fetch`. El runtime permite activar espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), reservar el pool de memoria por adelantado (`--pool_backing=fixed`) y precargar pesos en host (`--parameter_mode=preload`). No se documentan innovaciones de decodificación (especulativa, atención lineal, etc.) para este paquete.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`), con hasta 32.768 tokens de contexto por petición y 4.096 tokens de salida máxima.
- Concurrencia de hasta 4 peticiones simultáneas según el preset.
- Tool calling: no aplicable según la model card.
- Modo de razonamiento / thinking: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen: no determinada.
- Entrada/salida de audio: no determinada.
- Capacidades multilingües: no disponibles.
- Capacidades de código, matemáticas o agentes: no documentadas para este checkpoint.

## Casos de uso

- Despliegue de inferencia local sobre AMD Strix Halo: el paquete está pensado para ejecutarse en un Ryzen AI Max+ 395 (gfx1151) con `hrx-loom`, lo que permite servir el modelo en un equipo integrado sin GPU discreta, usando el preset de 32k de contexto.
- Servicio en estación de trabajo con Radeon AI PRO R9700: la segunda plataforma objetivo (gfx1201, 32 GB) permite alojar el Q4_K_M de 36B en una única GPU profesional de 32 GB y exponer la API OpenAI en localhost para herramientas internas.
- Integración con clientes compatibles con la API de OpenAI: al exponer `/v1/chat/completions`, cualquier cliente que apunte a `http://127.0.0.1:8080` puede consumir el modelo sin adaptadores propios.
- Evaluación comparativa frente a llama.cpp: el paquete incluye puertas de corrección (`golden`, `compare`, `logits`, `sampling`) diseñadas para contrastar la salida token a token con una referencia de llama.cpp sobre el mismo GGUF, útil para validar la fidelidad del runtime antes de adoptarlo.
- Pruebas de concurrencia y consistencia: la puerta `consistency` compara la salida de peticiones concurrentes con las mismas peticiones en solitario, lo que sirve para validar el comportamiento del servidor bajo 4 peticiones simultáneas.
- Despliegue de contenido NSFW controlado: el checkpoint está marcado como `not-for-all-audiences` y orientado a contenido para adultos; su uso queda restringido a entornos con las salvaguardas legales y de moderación correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint es un Q4_K_M de ~36B parámetros, lo que en la práctica requiere del orden de 20-24 GB solo para pesos, más KV cache para 32.768 tokens de contexto y 4 peticiones concurrentes; la model card no publica la cifra exacta.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs de consumo; el paquete está generado para las dos plataformas AMD citadas.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` vía `pipx`, con `loom-fetch` para descargar el paquete y `loom-serve` para servir. Comandos documentados para ambas GPUs con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Latencia y throughput: no disponibles; las filas de rendimiento frente a llama.cpp no se han re-medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|---|
| Este paquete (`loom-draft/...-36B-nsfw-i1-loom`) | 36B (según nombre) | 32.768 | `.loom` + GGUF Q4_K_M | MIT | AMD gfx1151 / gfx1201 | Paquete de despliegue, no modelo nuevo; sin benchmarks ni puertas de corrección medidas |
| `mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-i1-GGUF` | 36B (según nombre) | no disponible | GGUF | no disponible en esta ficha | Genérica (llama.cpp y derivados) | Checkpoint base del que deriva este paquete |
| llama.cpp (runtime) | no aplica | configurable | GGUF | MIT | CPU, CUDA, ROCm, Metal | Referencia de corrección usada por las puertas del paquete; sin datos de rendimiento comparativo publicados aquí |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (finetunes NSFW de ~36B) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El repositorio es un paquete de despliegue, no un modelo entrenado: no aporta información sobre el entrenamiento, los datos ni la alineación del checkpoint subyacente.
- Contenido NSFW: el checkpoint está etiquetado `not-for-all-audiences`; su uso requiere verificación de edad, cumplimiento legal y moderación en cualquier despliegue público.
- Sin evidencia de corrección: todas las puertas (`golden`, `compare`, `logits`, etc.) figuran como no re-medidas, por lo que no hay garantía publicada de que la salida coincida con la referencia de llama.cpp.
- Sin benchmarks de rendimiento: no hay latencia ni throughput medidos para ninguna de las dos GPUs objetivo.
- Tool calling, razonamiento y decodificación especulativa marcados como "no aplicable"; visión y audio como "no determinado". No debe asumirse que el modelo los soporte.
- Contexto limitado por preset a 32.768 tokens por petición y salida a 4.096 tokens; la concurrencia está fijada en 4.
- Idiomas no documentados: no puede confirmarse el soporte multilingüe.
- Licencia MIT declarada para el paquete, pero la licencia del checkpoint base no se detalla en esta ficha; conviene verificarla antes de uso comercial.
- Repositorio sin tracción (0 descargas, 0 likes) y con fecha de creación futura respecto a la información habitual de Hugging Face; tratar como artefacto experimental.
- Dependencia de hardware AMD específico (gfx1151, gfx1201) y de `hrx-loom` 0.2.0; no se documenta compatibilidad con CUDA ni con otras GPUs.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/mradermacher-xyntrai-Sarah-mistral-2501-36B-nsfw-i1-loom
- Checkpoint base GGUF: https://huggingface.co/mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-i1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
