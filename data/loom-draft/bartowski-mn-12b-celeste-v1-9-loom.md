# loom-draft/bartowski-MN-12B-Celeste-V1.9-loom

## Resumen

`loom-draft/bartowski-MN-12B-Celeste-V1.9-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/MN-12B-Celeste-V1.9-GGUF`, en su cuantizacion Q4_K_M. No es un modelo nuevo ni un fine-tuning: los pesos son exactamente los del GGUF de referencia y lo que aporta el repositorio es un artefacto de ejecucion optimizado para GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica el usuario `loom-draft` y se ha generado con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle. Su proposito es ofrecer una via de servicio compatible con la API de chat de OpenAI (`/v1/chat/completions`) sobre hardware AMD, sirviendo el modelo con `loom-serve` en lugar de con llama.cpp u otros runners.

La relevancia es acotada y muy especifica: el modelo base es un dense de 12B en Q4_K_M, con una ventana declarada de 242.688 tokens por peticion y 4 peticiones concurrentes, empaquetado para el stack ROCm de AMD. La tarjeta no incluye resultados de rendimiento ni de correccion: todas las mediciones y puertas de validacion aparecen como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base dense de 12B; la tarjeta no detalla la arquitectura interna) |
| Parametros totales | 12B (segun el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 242.688 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) con `tokenizer.json` y `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | `/v1/chat/completions` estilo OpenAI |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Herramienta de generacion | loom-next (generador, sin LLM en el bucle) |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. Lo unico verificable es que se trata de un checkpoint de 12B en formato GGUF, cuantizado en Q4_K_M por bartowski, y que el paquete Loom no modifica los pesos: los programas `.loom` se generan a partir de `llm_config.json` y del tokenizador del checkpoint original, y el propio autor indica que el generador se ejecuto sin LLM en el bucle.

La innovacion tecnica del repositorio no esta en el modelo sino en el artefacto de despliegue: kernels generados para las arquitecturas AMD gfx1151 y gfx1201, un pool de memoria de tamano fijo (`--pool_backing=fixed`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en vuelo en la GPU. La tarjeta menciona puertas de validacion frente a llama.cpp (tokens greedy, top-5 log-probs, consistencia bajo concurrencia, decodificacion especulativa, bucle de tool calling, muestreo y logits), pero ninguna tiene medicion registrada para este paquete.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante API compatible con OpenAI.
- Contexto largo: hasta 242.688 tokens por peticion, adecuado para documentos extensos.
- Servicio concurrente de hasta 4 peticiones simultaneas.
- Salida de hasta 4.096 tokens por respuesta.
- Tool calling: no disponible (marcado como "not applicable" en la tarjeta).
- Razonamiento o modo thinking: no disponible ("not applicable").
- Decodificacion especulativa: no disponible ("not applicable").
- Entrada de imagen: no disponible ("not applicable").
- Entrada o salida de audio: no disponible ("not applicable").
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo (temperature, top_k, seed): estado "not determined" en la tarjeta.

## Casos de uso

- Servicio de chat sobre hardware AMD de escritorio o workstation: con `loom-serve` se expone un endpoint `/v1/chat/completions` en `127.0.0.1:8080`, lo que permite sustituir un backend en la nube por inferencia local en una Strix Halo o una R9700 sin cambiar el cliente.
- Procesamiento de documentos largos: la ventana de 242.688 tokens permite pasar contratos, informes o bases de codigo extensas en una sola peticion, util para resumen y extraccion de datos en local.
- Asistente de desarrollo en estacion de trabajo AMD: al integrarse via API compatible con OpenAI, encaja en plugins de editor y herramientas CLI que ya hablan ese protocolo, manteniendo el codigo en la maquina.
- Prototipado y evaluacion de modelos de 12B en ROCm: el paquete sirve para medir el comportamiento del checkpoint original bajo el runtime Loom y compararlo con llama.cpp sobre el mismo GGUF, aunque las mediciones de este paquete aun no estan registradas.
- Despliegue en entornos con requisitos de residencia de datos: al ejecutarse en GPU local con licencia Apache 2.0, evita enviar contenido sensible a servicios externos.
- Laboratorio de inferencia con contexto largo y concurrencia limitada: con 4 peticiones simultaneas y 4.096 tokens de salida, es adecuado para equipos pequenos o uso individual, no para alta concurrencia.
- Base para pipelines de generacion de texto por lotes: la API estandar permite encadenar scripts de procesamiento sin adaptadores especificos del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican que los resultados "are not yet re-measured". Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tampoco tienen evidencia registrada para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es un 12B en Q4_K_M, lo que en la practica ronda los 7-8 GB de pesos, pero la tarjeta no publica la cifra ni el consumo del pool de memoria.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no confirmada; el paquete esta generado solo para las dos arquitecturas AMD citadas y no se mencionan GPUs NVIDIA ni otras Radeon.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; el GGUF de origen `bartowski/MN-12B-Celeste-V1.9-GGUF` es la via para usarlo con llama.cpp u Ollama.
- Latencia y throughput: no disponibles; las filas de rendimiento de la tarjeta estan pendientes de re-medicion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas, por lo que no es posible establecer una comparacion cuantitativa fiable con otros modelos de 12B. Como referencia estructural, el mismo checkpoint puede servirse con llama.cpp u Ollama a partir del GGUF original, mientras que este paquete solo anade el runtime Loom para GPUs AMD gfx1151 y gfx1201.

## Limitaciones y advertencias

- Sin evidencia de rendimiento ni de correccion: todas las puertas de validacion y las mediciones frente a llama.cpp figuran como pendientes de re-medicion, por lo que no hay garantia publicada de equivalencia numerica con el checkpoint de referencia.
- Alcance de hardware muy restringido: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte declarado para otras GPU.
- Sin tool calling, sin modo de razonamiento, sin vision y sin audio; el modelo no puede usarse para flujos agenticos que requieran function calling.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens, lo que restringe su uso en produccion con carga alta.
- Comportamiento del muestreo sin determinar; no se documenta si temperature, top_k y seed se ajustan a la especificacion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; son los heredados del modelo base, sobre el que la tarjeta no aporta analisis.
- Idiomas soportados no declarados, por lo que no se puede confirmar cobertura multilingue.
- Licencia Apache 2.0 en el paquete, lo que permite uso comercial del artefacto; conviene verificar la licencia del checkpoint base `bartowski/MN-12B-Celeste-V1.9-GGUF` antes de redistribuir.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni validacion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-MN-12B-Celeste-V1.9-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/MN-12B-Celeste-V1.9-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Runtime ROCm/hrx-system: https://github.com/ROCm/hrx-system
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
