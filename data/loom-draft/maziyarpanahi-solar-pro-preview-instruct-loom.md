# loom-draft/MaziyarPanahi-solar-pro-preview-instruct-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje entrenado desde cero, sino un paquete de despliegue en formato Loom para el checkpoint GGUF cuantizado `solar-pro-preview-instruct.Q4_K_M.gguf`, publicado por MaziyarPanahi. El paquete lo genera `loom-next` (el generador, sin LLM en el bucle) y lo publica la cuenta `loom-draft`, con el objetivo de ejecutar el modelo sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Incluye programas `.loom`, un `model.json` con los ficheros fuente fijados por sha256, el tokenizer y la configuración del LLM.

La relevancia es de infraestructura, no de modelado: ofrece una vía de servir un modelo de la familia Solar Pro en hardware AMD mediante `loom-serve`, con una API compatible con OpenAI (`/v1/chat/completions`). El paquete no modifica los pesos originales; es un artefacto de compilación/empaquetado específico de plataforma.

No se dispone de datos sobre arquitectura, número de parámetros, contexto nativo ni composición del entrenamiento del modelo base en la información proporcionada. La model card del paquete solo documenta el preset de servicio: 4.096 tokens de contexto por petición, 4 peticiones concurrentes y 4.096 tokens máximos de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Solar Pro Preview; el paquete no la documenta) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens por petición (preset del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (origen) empaquetado como programas `.loom` + `weights.loom` |
| Modelo base | MaziyarPanahi/solar-pro-preview-instruct-GGUF |
| Concurrencia | 4 peticiones simultáneas |
| Salida máxima | 4.096 tokens (`max_tokens` del preset) |
| API | OpenAI-compatible `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

No hay información en la documentación disponible sobre la arquitectura del modelo base (tipo de transformer, atención, número de capas o dimensión oculta), ni sobre el volumen o composición de los datos de entrenamiento, ni sobre si hubo RLHF, DPO u otras etapas de alineamiento. La model card del paquete Loom se limita al artefacto de despliegue.

Lo que sí está documentado es el proceso de generación del paquete: `loom-next` produce programas `.loom` (kernels y grafo de ejecución) a partir del GGUF sin modificar el checkpoint, y `loom-fetch` verifica por sha256 los ficheros fuente fijados en `model.json.lock`. El servicio se lanza con `loom-serve` usando `--pool_backing=fixed` (pool de memoria reservado por adelantado) y `--parameter_mode=preload` (carga de pesos en host), con `completion_spin_ns=4294967295` para espera activa de las finalizaciones de GPU. No se documentan innovaciones de decodificación especulativa: la tabla de características marca "speculative decoding" como no aplicable.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`), con formato de mensajes `role`/`content`.
- Servicio multi-petición: hasta 4 peticiones concurrentes según el preset.
- Ventana de 4.096 tokens por petición y hasta 4.096 tokens de salida.
- Tool calling: no aplicable según la model card del paquete.
- Razonamiento / thinking mode: no aplicable.
- Reasoning effort: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de características.
- Capacidades multilingües: no disponibles en la documentación del paquete.

## Casos de uso

- Servicio local de chat sobre Strix Halo: desplegar un endpoint compatible con OpenAI en un equipo con Ryzen AI Max+ 395 para asistentes internos o pruebas de integración, usando `loom-fetch` y `loom-serve` con el preset documentado.
- Inferencia en estación de trabajo con R9700: ejecutar el modelo en una GPU de 32 GB para tareas de generación de texto en local, sin depender de servicios en la nube, con la API HTTP en `127.0.0.1:8080`.
- Evaluación de la pila Loom frente a llama.cpp: el paquete define puertas de corrección (`golden`, `compare`, `logits`, `sampling`, `consistency`) que permiten comparar token a token la salida con la referencia de llama.cpp sobre el mismo GGUF.
- Pruebas de integración de aplicaciones con cliente OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un SDK oficial a `http://127.0.0.1:8080` y validar flujos de chat sin cambiar el código de la aplicación.
- Despliegue en entornos con requisitos de licencia permisiva: el paquete declara licencia MIT, lo que facilita su incorporación en pipelines internos y distribución de artefactos.
- Prototipado de asistentes conversacionales de contexto corto: con 4.096 tokens por petición y 4.096 de salida, encaja en tareas de resumen, reescritura o respuesta a preguntas sobre documentos breves.
- Validación de concurrencia: la puerta `consistency` está pensada para comprobar que 4 peticiones simultáneas producen la misma salida que ejecutadas por separado, útil antes de poner el servicio detrás de un balanceador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de rendimiento frente a llama.cpp "no se han vuelto a medir" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201, 32 GB). Todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured", es decir, sin evidencia registrada.

## Requisitos de hardware

- GPU objetivo documentadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible. El paquete usa `--pool_backing=fixed`, que reserva el pool de memoria del preset por adelantado, pero la documentación no publica el tamaño de dicho pool.
- Cabe en GPU de consumo: no confirmado; solo se listan las dos plataformas AMD anteriores.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; las mediciones del paquete no se han vuelto a realizar.
- Concurrencia máxima configurada: 4 peticiones simultáneas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto nativo ni rendimiento del modelo base, y las búsquedas web realizadas no devuelven documentación técnica del modelo (los resultados corresponden a servicios de grabación de pantalla y a una marca de ropa homónimas). Sin esos datos no es posible establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- El repositorio es un artefacto de despliegue, no un modelo: no aporta pesos nuevos ni mejoras de entrenamiento; hereda todas las limitaciones del checkpoint `solar-pro-preview-instruct` de MaziyarPanahi.
- Contexto efectivo limitado a 4.096 tokens por petición en el preset, muy por debajo de lo habitual en modelos recientes; no apto para documentos largos o conversaciones extensas.
- Sin tool calling, sin modo de razonamiento, sin visión y sin audio según la tabla de características del paquete.
- Estado de muestreo "no determinado": no hay garantía documentada sobre el comportamiento de `temperature`, `top_k` y `seed`.
- Ninguna puerta de corrección tiene resultados registrados; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput a partir de la documentación.
- Plataformas muy específicas (gfx1151 y gfx1201); no se documenta funcionamiento en otras GPUs AMD ni en NVIDIA.
- Riesgo de alucinación y sesgos del modelo base: no evaluados ni documentados en esta ficha por falta de información.
- Licencia MIT declarada por el paquete; conviene verificar por separado la licencia del checkpoint GGUF original antes de uso comercial.
- El paquete fija versiones concretas (`hrx-loom==0.2.0`) y verifica sha256 de los ficheros fuente; cualquier actualización del modelo base requiere regenerar el paquete.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/MaziyarPanahi-solar-pro-preview-instruct-loom
- Modelo base (GGUF): https://huggingface.co/MaziyarPanahi/solar-pro-preview-instruct-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
