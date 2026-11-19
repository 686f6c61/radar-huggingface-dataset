# loom-draft/unsloth-Hermes-4-70B-loom

## Resumen

`loom-draft/unsloth-Hermes-4-70B-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato `.loom` para el checkpoint GGUF `Hermes-4-70B-Q4_K_M.gguf` publicado por Unsloth, que a su vez es una cuantización del Hermes-4-70B de Nous Research. El paquete lo genera la herramienta `loom-next` (sin intervención de un LLM en el bucle) y está pensado para ejecutar el modelo sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), a través del servidor de inferencia `loom-serve` del ecosistema Loom (hrx-system).

El interés del artefacto es de infraestructura más que de modelado: proporciona programas Loom generados para los kernels del modelo, un tokenizador, la configuración del LLM y una API compatible con OpenAI (`/v1/chat/completions`), con un contexto declarado de 131.072 tokens por petición y 4 peticiones concurrentes. El repositorio tiene 0 descargas y 0 likes, y las mediciones de rendimiento y las puertas de corrección aparecen como "not yet re-measured", por lo que no hay evidencia publicada de rendimiento ni de fidelidad frente a llama.cpp.

La licencia es `llama3`, heredada del modelo base, lo que impone las restricciones de la Llama 3 Community License al uso comercial. La model card no incluye información sobre arquitectura interna, número de parámetros del checkpoint original, idiomas ni datos de entrenamiento; esos datos deben consultarse en la ficha del modelo base de Nous Research y en la del GGUF de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no documenta la arquitectura del checkpoint base) |
| Parametros totales | no disponible (el nombre del checkpoint sugiere ~70B; no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por petición (según la tabla de features del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete no declara otras variantes |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | GGUF de origen (`Hermes-4-70B-Q4_K_M.gguf`), empaquetado en programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, `loom-serve`, `loom-fetch` |
| Tool calling | no aplicable según la tabla de features |
| Modo razonamiento / thinking | no aplicable según la tabla de features |
| Decodificación especulativa | no aplicable según la tabla de features |
| Entrada de imagen | no aplicable según la tabla de features |
| Entrada/salida de audio | no aplicable según la tabla de features |
| Muestreo (sampling) | no determinado ("?") |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo subyacente: el paquete Loom solo referencia el GGUF `Hermes-4-70B-Q4_K_M.gguf` de Unsloth y genera programas (`.loom`) a partir de `llm_config.json`. No se detallan tipo de transformer, número de capas, cabezas, dimensión oculta, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF, DPO u otras etapas de alineamiento. Cualquier dato de este tipo debe tomarse de la ficha del modelo base de Nous Research, no de este repositorio.

La innovación técnica del artefacto es el propio pipeline Loom: `loom-next` genera kernels y programas para el runtime IREE sobre AMDGPU, con un pool de memoria de respaldo fijo (`--pool_backing=fixed`), espera activa de completaciones de GPU (`completion_spin_ns=4294967295`) y, en la R9700, precarga de parámetros en el host (`--parameter_mode=preload`). El paquete incluye un sistema de puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que compara la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF; en la versión publicada todas aparecen como "not yet re-measured", es decir, sin evidencia registrada.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`), con el modelo Hermes-4-70B cuantizado a Q4_K_M.
- Contexto largo: hasta 131.072 tokens por petición, adecuado para documentos extensos o historiales de conversación amplios.
- Concurrencia de 4 peticiones simultáneas en el servidor `loom-serve`.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Tool calling: no aplicable según la tabla de features del paquete.
- Modo razonamiento / thinking: no aplicable según la tabla de features.
- Decodificación especulativa: no aplicable según la tabla de features.
- Entrada de imagen y audio: no aplicable según la tabla de features.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Muestreo (temperature, top_k, seed): no determinado ("?") en la tabla de features.

## Casos de uso

- Despliegue local en hardware AMD Strix Halo: el paquete permite servir Hermes-4-70B Q4_K_M en una APU Ryzen AI Max+ 395 sin depender de CUDA, usando `loom-fetch` y `loom-serve` con el backend AMDGPU de IREE; útil para estaciones de trabajo y prototipos en entornos sin GPU NVIDIA.
- Inferencia en Radeon AI PRO R9700 de 32 GB: con `--parameter_mode=preload` y pool de memoria fijo, el paquete está pensado para servir el modelo en una GPU de 32 GB de VRAM, un perfil de hardware habitual en estaciones de trabajo con ROCm.
- Evaluación comparativa de runtimes: las puertas de corrección (`golden`, `compare`, `logits`, `sampling`) permiten comparar token a token la salida de Loom frente a llama.cpp sobre el mismo GGUF, lo que sirve para validar la fidelidad del backend antes de adoptarlo en producción.
- Sustitución de un endpoint OpenAI por uno autoalojado: al exponer `/v1/chat/completions`, se puede apuntar un cliente compatible con OpenAI (SDK, frameworks de agentes, herramientas internas) contra `http://127.0.0.1:8080` sin cambiar el código de la aplicación.
- Procesamiento de documentos largos: con 131.072 tokens de contexto por petición, encaja en tareas de resumen, extracción o preguntas sobre contratos, informes o bases de código de gran tamaño, siempre que la salida quepa en 4.096 tokens.
- Atención al cliente multi-turno autohospedada: el contexto amplio y la concurrencia de 4 permiten gestionar varias conversaciones simultáneas en una única instancia, con la ventaja de que los datos no salen del hardware local.
- Laboratorio de portabilidad de kernels: el paquete incluye `program/*.loom` y `weights.loom` generados por `loom-next`, lo que lo convierte en material de referencia para estudiar la generación automática de kernels para gfx1151 y gfx1201.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de rendimiento para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201, 32 GB) "are not yet re-measured", y que todas las puertas de corrección figuran como "not yet re-measured". No hay cifras de MMLU, HumanEval, GSM8K, throughput ni latencia para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el checkpoint es Q4_K_M y el hardware objetivo declarado es una GPU de 32 GB (Radeon AI PRO R9700) y la APU Strix Halo, pero no se publica el consumo exacto ni el desglose de memoria del pool.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan GPUs NVIDIA ni otras arquitecturas AMD.
- GPU de consumo: no disponible; el paquete no declara compatibilidad con GPUs consumer distintas de las dos plataformas AMD indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch huggingface:loom-draft/unsloth-Hermes-4-70B-loom:chat --materialize=copy --output=hermes-4-70b` y `loom-serve --model=hermes-4-70b '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed`. En hosts con memlock de 8 MiB hay que lanzar `loom-serve` bajo `systemd-run --user` con `SystemCallFilter=~io_uring_setup` y `SystemCallErrorNumber=ENOSYS`, o elevar `ulimit -l`.
- Alternativas de despliegue: no se documentan en el paquete; el propio README usa llama.cpp como referencia de corrección, no como opción de servicio de este artefacto.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-draft/unsloth-Hermes-4-70B-loom | no disponible (checkpoint ~70B por nombre) | 131.072 tokens por petición | Paquete `.loom` + GGUF Q4_K_M, runtime `loom-serve` sobre AMDGPU/IREE | llama3 | 0 descargas, 0 likes; hardware objetivo AMD Strix Halo y R9700 |
| unsloth/Hermes-4-70B-GGUF (modelo base del paquete) | no disponible en la información proporcionada | no disponible | GGUF; ejecutable con llama.cpp y runtimes compatibles | llama3 (heredada) | Repositorio de referencia en Hugging Face; es el origen del checkpoint empaquetado |
| Hermes-4-70B de Nous Research | no disponible en la información proporcionada | no disponible | Pesos originales (formato no indicado) | llama3 | Modelo base del que deriva la cuantización de Unsloth |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada; la comparación se limita a la cadena de derivación del propio checkpoint.

## Limitaciones y advertencias

- El repositorio es un paquete de despliegue, no un modelo entrenado: no aporta mejoras de capacidad sobre el GGUF de Unsloth y hereda todas sus limitaciones.
- Ausencia total de evidencia de rendimiento y corrección: las puertas `kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits` y `decision` figuran como "not yet re-measured", y las mediciones de rendimiento tampoco se han repetido.
- Compatibilidad de hardware muy restringida: solo se documentan gfx1151 (Strix Halo) y gfx1201 (R9700); no hay soporte declarado para NVIDIA, otras AMD ni CPU.
- Tool calling, modo razonamiento, decodificación especulativa, imagen y audio figuran como "not applicable" en la tabla de features del paquete, por lo que no deben asumirse aunque el modelo base los soporte.
- Muestreo no determinado ("?"): no hay garantía documentada sobre el comportamiento de `temperature`, `top_k` y `seed`.
- Límite de 4.096 tokens de salida por petición, que puede ser insuficiente para generación de código extensa o respuestas largas.
- Licencia `llama3`: el uso comercial está sujeto a la Llama 3 Community License, con sus umbrales y obligaciones de atribución; conviene revisarla antes de desplegar en producción.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe ni sobre calidad en castellano.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse sobre el modelo base.
- Repositorio sin tracción (0 descargas, 0 likes) y creado en 2026-11-19: no hay comunidad ni informes de uso que respalden su fiabilidad.
- En hosts con memlock de 8 MiB es necesario un ajuste específico (`systemd-run` con filtro de syscalls o elevar `ulimit -l`) para que `loom-serve` arranque.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/unsloth-Hermes-4-70B-loom
- Modelo base (GGUF de Unsloth): https://huggingface.co/unsloth/Hermes-4-70B-GGUF
- Runtime Loom (hrx-system, ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
