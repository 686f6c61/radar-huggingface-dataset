# loom-draft/prithivMLmods-Xiaomi-OCR-0-loom

## Resumen

Xiaomi-OCR-0-Loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `prithivMLmods/Xiaomi-OCR-0-GGUF`, concretamente la cuantización `Xiaomi-OCR-0.Q4_K_M.gguf`. Lo publica el usuario `loom-draft` dentro del ecosistema Loom, un stack de inferencia para GPUs AMD que compila los pesos a programas propios en lugar de ejecutar llama.cpp directamente. El objetivo es servir un modelo de visión-lenguaje especializado en OCR sobre hardware AMD de consumo y workstation, sin depender de CUDA.

El modelo subyacente es un modelo multimodal de tipo image-text-to-text orientado a reconocimiento óptico de caracteres, con un proyector multimodal separado (`Xiaomi-OCR-0.mmproj-bf16.gguf`). El paquete declara una ventana de contexto de 262.144 tokens por petición, soporte de tool calling estilo OpenAI, modo de razonamiento opcional (desactivado por defecto) y capacidad de atender 4 peticiones concurrentes con un máximo de 4.096 tokens de salida por preset.

La relevancia de esta ficha es acotada y conviene ser explícito: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0,0 GB (lo que sugiere que los artefactos no están materializados o son meros punteros) y la propia model card indica que las mediciones de rendimiento y las puertas de corrección **no se han vuelto a medir** para este paquete. Es, por tanto, un artefacto de borrador (`loom-draft`) y no una distribución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; pesos en GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (única incluida en el paquete); proyector multimodal en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `weights.loom` + `model.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Entrada de imagen | sí, mediante partes `image_url` estilo OpenAI y proyector `Xiaomi-OCR-0.mmproj-bf16.gguf` |
| Entrada/salida de audio | no soportada |
| Decodificacion especulativa | no aplicable |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version de runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base: la model card del paquete Loom no describe el transformer subyacente, el número de parámetros, la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO. Lo único verificable es que se trata de un modelo multimodal con proyector de visión separado, servido a partir de un GGUF Q4_K_M y un `mmproj` en bf16, lo que es coherente con la familia de modelos OCR publicados por `prithivMLmods` sobre arquitecturas de tipo Qwen-VL, pero esto no se confirma en la información proporcionada.

La innovación técnica relevante no está en el modelo sino en el runtime: Loom compila los pesos GGUF a programas `.loom` específicos para la GPU destino mediante `loom-next`, un generador que opera sin LLM en el bucle. El paquete expone opciones de servicio como `--pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elástico), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU consumiendo CPU). No hay datos publicados sobre tokens de entrenamiento, mezcla del corpus ni proceso de alineación.

## Capacidades

- Reconocimiento óptico de caracteres sobre imágenes: entrada de imagen vía `image_url` y salida de texto transcrito.
- Generación de texto a partir de imagen (image-text-to-text) con contexto de hasta 262.144 tokens por petición, adecuado para documentos largos o lotes de páginas en una sola conversación.
- Tool calling estilo OpenAI: acepta el array `tools` y devuelve `tool_calls`, lo que permite integrarlo en bucles de agente.
- Modo de razonamiento opcional: desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Servicio concurrente: hasta 4 peticiones simultáneas con salida máxima de 4.096 tokens por petición.
- API compatible con OpenAI en `/v1/chat/completions`, lo que facilita sustituir backends existentes sin reescribir clientes.
- Sin soporte de audio ni de salida multimodal; sin decodificación especulativa ni control de "reasoning effort".

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen del documento y devuelve el texto estructurado; los 262.144 tokens de contexto permiten encadenar varias páginas en una misma conversación sin perder el hilo del formato solicitado.
- Extracción de datos de formularios escaneados en un pipeline de back office: combinado con tool calling, el modelo puede emitir una llamada a una función `registrar_campo(campo, valor)` en lugar de texto libre, lo que reduce el post-procesado.
- Indexación de archivos históricos: servir el modelo en una Radeon AI PRO R9700 de 32 GB permite procesar lotes de imágenes en local, sin enviar documentos sensibles a APIs externas.
- Asistencia a la accesibilidad: transcripción de capturas, carteles o documentos fotografiados con el móvil a texto plano o a voz mediante un TTS posterior.
- Automatización de atención al cliente sobre capturas: el cliente envía una imagen de su recibo o pantalla de error y el modelo extrae los campos relevantes dentro de un flujo multi-turno con tool calling para consultar el estado del pedido.
- Prototipado en estación de trabajo AMD: desarrolladores que ya trabajan sobre Strix Halo o R9700 pueden validar un flujo OCR completo con `loom-serve` y la API OpenAI sin montar una máquina NVIDIA.
- Verificación de documentos en auditoría interna: el modo `enable_thinking` permite obtener una traza de razonamiento antes de la transcripción final, útil para revisar por qué el modelo interpretó un campo de una forma concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambas indica literalmente que "the results for this package are not yet re-measured". Del mismo modo, las doce puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambas GPU, por lo que no existe evidencia registrada de que la salida coincida con la referencia de llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El paquete se distribuye en Q4_K_M y está pensado para ejecutarse en una GPU de 32 GB (Radeon AI PRO R9700) y en la memoria unificada del Ryzen AI Max+ 395; el tamaño exacto del checkpoint no se indica en la información proporcionada.
- GPU soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo AMD distintas de las dos anteriores; no hay mención a RDNA3 de gama baja ni a GPUs NVIDIA.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card están pendientes de medición.
- Nota operativa: la opción `completion_spin_ns=4294967295` empleada en las mediciones de referencia consume CPU durante la espera activa de finalizaciones de GPU, lo que afecta al consumo energético y a la carga del sistema anfitrión.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento del modelo base ni de alternativas, y el paquete Loom es un artefacto de despliegue específico de hardware AMD, por lo que una comparación con otros modelos OCR requeriría métricas que aquí no constan.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xiaomi-OCR-0 (paquete Loom) | no disponible | 262.144 | Apache 2.0 | `.loom` + GGUF Q4_K_M | Solo AMD gfx1151 / gfx1201; sin mediciones |
| Alternativas | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Artefacto de borrador: el repositorio pertenece a la organización `loom-draft`, tiene 0 descargas, 0 likes y un tamaño de 0,0 GB, lo que sugiere que los artefactos pueden no estar materializados o ser punteros. No debe tratarse como una distribución estable.
- Sin evidencia de corrección: las doce puertas de validación frente a llama.cpp figuran como no medidas. No hay garantía publicada de que la salida del runtime Loom coincida token a token con la referencia.
- Sin datos de rendimiento: no hay latencia ni throughput medidos para ninguna de las dos GPU objetivo.
- Idiomas no declarados: la model card no especifica qué lenguas cubre el modelo base, lo que impide asumir un buen rendimiento en castellano sin una evaluación propia.
- Sesgos y alucinación: no hay información sobre sesgos conocidos ni sobre tasas de alucinación del modelo base. En tareas OCR, el riesgo típico es la invención de caracteres o la omisión de líneas en documentos de baja calidad, que debe mitigarse con verificación posterior.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del checkpoint base `prithivMLmods/Xiaomi-OCR-0-GGUF` por si impone condiciones adicionales que este paquete no refleje.
- Dependencia de hardware: el paquete está atado a gfx1151 y gfx1201. No hay soporte documentado para NVIDIA, Intel ni otras GPUs AMD.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens por preset, lo que restringe escenarios de alto volumen o de generación de documentos muy extensos en una sola respuesta.
- El modo de razonamiento está desactivado por defecto; activarlo cambia el formato de la respuesta y puede afectar a la integración con clientes que esperen texto plano.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/prithivMLmods-Xiaomi-OCR-0-loom
- Checkpoint base GGUF: https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
