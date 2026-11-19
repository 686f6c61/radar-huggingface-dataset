# loom-draft/bartowski-badtheorylabs_BTL-4-loom

## Resumen

`loom-draft/bartowski-badtheorylabs_BTL-4-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/badtheorylabs_BTL-4-GGUF`, concretamente el fichero `badtheorylabs_BTL-4-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: los pesos subyacentes son los del modelo base BTL-4 publicado por badtheorylabs y cuantizados por bartowski. El repositorio lo publica la cuenta `loom-draft` como artefacto de empaquetado para el ecosistema Loom.

El objetivo del paquete es permitir servir el modelo en GPUs AMD concretas: el APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). La generación se realizó con `loom-next`, el generador del ecosistema Loom, sin intervención de un LLM en el bucle. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta entrada de imagen mediante el proyector `mmproj-badtheorylabs_BTL-4-bf16.gguf` y ofrece razonamiento opcional.

La relevancia es acotada pero específica: cubre el nicho de inferencia multimodal sobre hardware AMD con el stack ROCm/hrx-loom, un terreno con menos herramientas maduras que el ecosistema NVIDIA/CUDA. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y correctitud del propio paquete figuran como «not yet re-measured» en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base BTL-4; el paquete no documenta la arquitectura subyacente) |
| Parametros totales | no disponible (cuantización Q4_K_M del checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de visión en bf16 (`mmproj-badtheorylabs_BTL-4-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base BTL-4 en la documentación proporcionada: la model card del paquete Loom describe únicamente el artefacto de despliegue, no el transformer subyacente. Lo que sí se documenta es el modo de inferencia: el paquete ejecuta el GGUF Q4_K_M sin modificarlo mediante kernels generados por `loom-next`, con un proyector multimodal separado en bf16 para el procesamiento de imágenes. El paquete soporta razonamiento (thinking) activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.

En cuanto a datos de entrenamiento, número de tokens, composición del dataset o uso de RLHF/DPO, no hay información disponible en la documentación del paquete. Tampoco se documentan innovaciones de decodificación: la model card indica explícitamente que la decodificación especulativa y el «reasoning effort» no son aplicables en esta configuración. La validación de correctitud se articula mediante un conjunto de puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF; todas ellas figuran como «not yet re-measured» para ambas GPUs.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada de imagen (image-text-to-text): acepta partes `image_url` al estilo OpenAI, procesadas por el proyector `mmproj-badtheorylabs_BTL-4-bf16.gguf`.
- Razonamiento / thinking mode activado por defecto, desactivable por petición con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling al estilo OpenAI: acepta el parámetro `tools` y devuelve `tool_calls`.
- Bucles de tool calling multi-turno (la model card incluye puertas de validación específicas para agentes, `agent` y `agent_think_off`).
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Contexto de 262.144 tokens por petición.
- Idiomas soportados: no disponible.

## Casos de uso

- Despliegue local en estaciones AMD Strix Halo: el paquete está pensado para servir el modelo en el APU Ryzen AI Max+ 395 con `loom-serve`, lo que permite montar un asistente privado sin GPU NVIDIA ni servicios en la nube.
- Inferencia en Radeon AI PRO R9700: con 32 GB de VRAM y el preset documentado, sirve como nodo de inferencia para equipos que ya trabajan sobre ROCm y quieren evitar la pila CUDA.
- Procesamiento de documentos largos: los 262.144 tokens de contexto permiten pasar contratos, informes o bases de código extensas en una sola petición, útil para resumen y extracción estructurada.
- Análisis de imágenes con texto: al aceptar `image_url`, puede emplearse para descripción de capturas, extracción de datos de formularios escaneados o preguntas sobre diagramas, siempre que la calidad del proyector se valide en el caso concreto.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` y las puertas de validación de agentes permiten construir asistentes que consulten APIs internas o ejecuten acciones encadenadas, con thinking activable para pasos de razonamiento.
- Sustitución de referencia frente a llama.cpp: las puertas `golden` y `compare` están diseñadas para verificar que la salida del paquete coincide token a token con llama.cpp sobre el mismo GGUF, lo que lo hace útil como banco de pruebas de kernels ROCm.
- Prototipado de API compatible con OpenAI en hardware AMD: al exponer `/v1/chat/completions`, se puede integrar con clientes y frameworks existentes que ya hablan el protocolo de OpenAI sin reescribir la capa de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «are not yet re-measured», y que todas las puertas de correctitud figuran sin ejecución registrada.

## Requisitos de hardware

- GPUs soportadas explícitamente: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma numérica; el paquete usa `--pool_backing=fixed`, que reserva el pool de memoria del preset por adelantado, y `--parameter_mode=preload`, que carga los pesos en el host antes de servir.
- Compatibilidad con GPU de consumo: no disponible; la documentación solo menciona las dos plataformas AMD anteriores.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalable con `pipx`), flujo `loom-fetch` + `loom-serve`; API compatible con OpenAI en el puerto 8080.
- Opciones de ejecución documentadas: `--materialize=copy` (copia los ficheros del paquete al directorio de salida), `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo; es el ajuste usado en las mediciones de la tarjeta), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir para este paquete.

## Comparativa con modelos similares

No disponible. La documentación proporcionada no incluye datos de rendimiento ni especificaciones del modelo base BTL-4 que permitan una comparación cuantitativa con alternativas. Como referencia cualitativa, el propio paquete se compara contra llama.cpp sobre el mismo GGUF, pero esa comparación figura sin mediciones registradas.

## Limitaciones y advertencias

- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-19). No hay evidencia de uso en producción.
- Sin mediciones de correctitud: todas las puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured»; la model card advierte que «a gate without a recorded run shows no evidence».
- Sin datos de rendimiento: no hay cifras de latencia ni throughput frente a llama.cpp para ninguna de las dos GPUs objetivo.
- Arquitectura, tamaño y parámetros del modelo base no documentados en este paquete; para evaluarlos hay que consultar el repositorio de badtheorylabs y el GGUF de bartowski.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingüe sin validación propia.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; aplican los del modelo base, que no se detallan aquí.
- Límite de salida de 4.096 tokens por petición, lo que puede truncar respuestas largas o cadenas de razonamiento extensas.
- Concurrencia máxima de 4 peticiones simultáneas; no apto para cargas de alta concurrencia sin escalado horizontal.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base y del GGUF de origen antes de redistribuir.
- Dependencia de una versión concreta del stack (`hrx-loom[hf]==0.2.0`) y de hardware AMD específico; no se documenta compatibilidad con otras GPUs.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/bartowski-badtheorylabs_BTL-4-loom
- GGUF base (bartowski): https://huggingface.co/bartowski/badtheorylabs_BTL-4-GGUF
- Stack Loom para ROCm: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
