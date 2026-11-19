# loom-draft/prithivMLmods-Axion-1.0-35B-loom

## Resumen

Axion-1.0-35B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el proyecto loom-draft a partir del checkpoint GGUF sin modificar `prithivMLmods/Axion-1.0-35B-GGUF`, en su cuantizacion Q4_K_M. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que traduce los pesos originales a un programa ejecutable por el runtime Loom, orientado especificamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es multimodal (image-text-to-text) con 35.000 millones de parametros, ventana de contexto de 262.144 tokens y soporte de razonamiento y tool calling.

La relevancia de este repositorio es acotada pero concreta: ofrece una via de ejecucion del modelo sobre hardware AMD con ROCm a traves del stack `hrx-loom`, sin depender de llama.cpp, y con una API compatible con OpenAI (`/v1/chat/completions`). Para desarrolladores que trabajen con Strix Halo o R9700 y quieran servir un modelo de 35B multimodal con contexto largo, el paquete elimina la necesidad de compilar y ajustar el runtime manualmente.

Conviene subrayar que el repositorio tiene 0 descargas y 0 likes, un tamano de 0,0 GB y fue creado el 19 de noviembre de 2026, sin actualizaciones posteriores. Las propias mediciones de rendimiento y las puertas de correccion (`gates.sh`) aparecen como "not yet re-measured" en la model card, por lo que no existe evidencia publicada de rendimiento ni de paridad numerica frente a llama.cpp para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles del transformer no especificados) |
| Parametros totales | 35B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en bf16 (`Axion-1.0-35B.mmproj-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Lo unico deducible de la informacion disponible es que se trata de un modelo multimodal con entrada de imagen y texto, con un proyector multimodal separado (`Axion-1.0-35B.mmproj-bf16.gguf`) y un checkpoint principal en GGUF Q4_K_M. El pipeline declarado en Hugging Face es `image-text-to-text`. No se especifican detalles sobre atencion, tipo de transformer, componentes MoE, ni innovaciones como atencion lineal o decodificacion especulativa; de hecho, la tabla de caracteristicas del paquete marca la decodificacion especulativa como "not applicable".

Respecto al entrenamiento, no hay informacion en la model card sobre volumen de tokens, composicion del dataset, fases de RLHF, DPO u otras tecnicas de alineamiento. El unico dato de procedencia es que el paquete Loom se genero con `loom-next` "the generator alone, no LLM in the loop", es decir, sin intervencion de un modelo de lenguaje en el proceso de generacion del programa. Cualquier afirmacion sobre el entrenamiento del Axion-1.0-35B original requeriria consultar la model card de `prithivMLmods/Axion-1.0-35B-GGUF`, que no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: el modo "thinking" esta activado por defecto y puede desactivarse con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagenes: soporta partes `image_url` en el formato de OpenAI, con el proyector multimodal en bf16.
- Tool calling: compatible con `tools` y `tool_calls` al estilo OpenAI.
- API compatible con OpenAI: endpoint `/v1/chat/completions`.
- Contexto largo: 262.144 tokens por peticion.
- Concurrencia: hasta 4 peticiones simultaneas.
- Limite de salida: 4.096 tokens (`max_tokens` del preset).
- Multilingue: no disponible; no se declaran idiomas soportados.
- Audio: no soportado ("not applicable").
- Razonamiento con esfuerzo configurable: no soportado ("not applicable").
- Decodificacion especulativa: no soportada ("not applicable").

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: con 262.144 tokens de contexto, el modelo puede procesar informes, contratos o manuales tecnicos completos junto con figuras y diagramas en una sola peticion, algo inviable en modelos de contexto corto.
- Asistentes sobre hardware AMD de sobremesa o estacion de trabajo: el paquete esta pensado para Strix Halo y R9700, por lo que encaja en despliegues locales donde no se quiere depender de GPU NVIDIA ni de servicios en la nube.
- Automatizacion de soporte tecnico con capturas de pantalla: la combinacion de entrada de imagen y conversacion multi-turno permite interpretar capturas de errores o interfaces y responder con contexto acumulado.
- Agentes con tool calling: la API expone `tools` y `tool_calls` al estilo OpenAI, lo que permite integrar el modelo en flujos de agente que consulten APIs, bases de datos o sistemas internos, con hasta 4 peticiones concurrentes.
- Procesamiento por lotes de documentacion escaneada: la cuantizacion Q4_K_M reduce el peso en memoria y facilita servir el modelo en una GPU de 32 GB como la R9700, procesando lotes de imagenes y texto.
- Prototipado de aplicaciones multimodales con API OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un cliente existente al servidor local cambiando unicamente la URL base, sin reescribir la capa de integracion.
- Evaluacion comparativa de runtimes: util para equipos que quieran contrastar el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF, aunque las metricas de este paquete aun no esten publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU.

## Requisitos de hardware

- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; la R9700 dispone de 32 GB y el paquete esta disenado para ejecutarse en ella con el checkpoint Q4_K_M de 35B.
- GPU consumer: no se documenta compatibilidad con GPU de consumo NVIDIA; el paquete esta orientado a hardware AMD con ROCm.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Parametros de servicio recomendados en la model card: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las filas de rendimiento no han sido re-medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / runtime | Estado |
|---|---|---|---|---|---|---|
| Axion-1.0-35B-loom | 35B | 262.144 | Imagen + texto | Apache 2.0 | GGUF empaquetado en Loom | Publicado, sin metricas |
| prithivMLmods/Axion-1.0-35B-GGUF (base) | 35B | no disponible en esta ficha | Imagen + texto | Apache 2.0 | GGUF | Modelo de origen |
| Alternativas de 35B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de evidencia de rendimiento: las mediciones frente a llama.cpp y las puertas de correccion no han sido re-medidas para este paquete, por lo que no hay garantia publicada de paridad numerica con el checkpoint original.
- Repositorio sin traccion: 0 descargas, 0 likes y 0,0 GB de tamano, lo que sugiere que los ficheros podrian no estar materializados o que el paquete no ha sido validado por terceros.
- Dependencia de un runtime especifico: requiere `hrx-loom==0.2.0` y el ecosistema Loom, con compatibilidad limitada a las GPU AMD indicadas.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica, por lo que el comportamiento en castellano no esta garantizado.
- Limite de salida de 4.096 tokens: insuficiente para tareas que requieran respuestas muy largas en una sola generacion.
- Concurrencia limitada a 4 peticiones simultaneas, lo que restringe el throughput en escenarios de alta carga.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas ni evaluaciones de fidelidad.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base `prithivMLmods/Axion-1.0-35B-GGUF` antes de desplegar en produccion.
- Fecha de creacion futura (2026-11-19) y sin actualizaciones: la madurez y el mantenimiento del paquete no pueden verificarse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/prithivMLmods-Axion-1.0-35B-loom
- Modelo base en Hugging Face: https://huggingface.co/prithivMLmods/Axion-1.0-35B-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
