# loom-draft/bartowski-FrogNano-4B-2609-loom

## Resumen
FrogNano-4B-2609 en formato Loom es un paquete de despliegue (programas `.loom` y una tarjeta `model.json`) generado por el proyecto Loom para ejecutar el checkpoint GGUF `FrogNano-4B-2609-Q4_K_M.gguf` de bartowski sobre GPUs AMD. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del GGUF original, empaquetados para el runtime `loom-serve` con kernels generados específicamente para las arquitecturas gfx1151 (Ryzen AI Max+ 395 "Strix Halo") y gfx1201 (Radeon AI PRO R9700). El paquete lo publica el usuario `loom-draft` y se generó con la herramienta `loom-next`, sin intervención de un LLM en el proceso.

El modelo subyacente, FrogNano-4B-2609, es un modelo multimodal de aproximadamente 4.000 millones de parámetros que acepta entrada de imagen y texto (pipeline `image-text-to-text`) y expone un modo de razonamiento opcional. El paquete Loom añade decodificación especulativa mediante MTP (multi-token prediction) con profundidad 3, una ventana de contexto de 262.144 tokens por petición y soporte para 4 peticiones concurrentes, todo servido a través de una API compatible con OpenAI.

Su relevancia es acotada pero concreta: ofrece una vía para ejecutar un modelo multimodal de 4B con contexto largo en hardware AMD consumer y de estación de trabajo (Strix Halo y R9700), un nicho donde el soporte de runtimes optimizados es todavía escaso. La licencia MIT del paquete y del checkpoint facilita su uso comercial, aunque las métricas de rendimiento y las puertas de corrección del paquete aún no se han vuelto a medir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; el paquete Loom no detalla la arquitectura interna) |
| Parametros totales | aproximadamente 4.000 millones (según el nombre "4B"; cifra exacta no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); otras cuantizaciones del GGUF base no confirmadas en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M) más proyector multimodal `mmproj-FrogNano-4B-2609-bf16.gguf`; paquete Loom con `model.json` y programas `.loom` |

## Arquitectura y entrenamiento
El paquete no documenta la arquitectura interna del modelo base. Lo que sí se especifica es la capa de despliegue: Loom genera kernels específicos para cada GPU objetivo y los valida contra implementaciones de referencia de llama.cpp sobre el mismo GGUF. El runtime incorpora decodificación especulativa mediante MTP con profundidad 3, activada por defecto, y un proyector multimodal en bf16 para la entrada de imágenes. La inferencia se sirve con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parámetros (`--parameter_mode=preload`), y las mediciones de rendimiento de la tarjeta usan espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`).

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si el modelo base pasó por RLHF o DPO. El paquete es una envoltura de ejecución: no modifica los pesos ni aplica entrenamiento adicional. La innovación técnica destacable es la generación automática de kernels para AMD (gfx1151 y gfx1201) con un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp, incluyendo igualdad token a token salvo empates cercanos.

## Capacidades
- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imágenes en formato OpenAI `image_url`, procesadas por el proyector `mmproj-FrogNano-4B-2609-bf16.gguf`.
- Tool calling y function calling con esquema OpenAI (`tools` y `tool_calls`), incluido bucle multi-turno de agentes.
- Decodificación especulativa MTP con profundidad 3, activa por defecto, con la garantía declarada de producir exactamente la misma salida que sin ella.
- Contexto largo de 262.144 tokens por petición, útil para documentos extensos o historiales de conversación amplios.
- Concurrencia de 4 peticiones simultáneas con consistencia declarada frente a ejecuciones aisladas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- API compatible con OpenAI en `/v1/chat/completions`.
- No soporta audio ni entrada/salida de voz.

## Casos de uso
- Asistente documental con imágenes: el modelo puede recibir capturas, diagramas o páginas escaneadas junto con preguntas y aprovechar la ventana de 262.144 tokens para mantener varios documentos en contexto en una sola petición.
- Automatización de soporte técnico con capturas de pantalla: un flujo de atención al cliente puede adjuntar la imagen del error del usuario y pedir diagnóstico, con tool calling para consultar bases de conocimiento o abrir tickets.
- Agentes multi-paso en estación de trabajo AMD: el soporte de bucle de tool calling y 4 peticiones concurrentes permite orquestar tareas de recuperación y ejecución sobre una Radeon AI PRO R9700 sin salir del ecosistema ROCm.
- Procesamiento de documentación técnica extensa: con 262k tokens de contexto se pueden analizar manuales completos o repositorios de especificaciones y generar resúmenes o extracciones estructuradas.
- Prototipado local de aplicaciones multimodales: la API compatible con OpenAI permite apuntar clientes existentes al endpoint de `loom-serve` en localhost y validar flujos de imagen-texto antes de migrar a infraestructura mayor.
- Evaluación de runtimes alternativos en hardware AMD: equipos que comparan llama.cpp con Loom pueden usar este paquete para medir latencia, throughput y corrección en Strix Halo o R9700 con las mismas puertas de validación.
- Generación asistida en entornos con requisitos de licencia permisiva: al ser MIT tanto el paquete como el checkpoint, encaja en productos comerciales que necesitan revisar la cadena de licencias.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que las puertas de corrección figuran como "no medidas todavía", lo que significa que no hay evidencia registrada para ninguna de ellas.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; el checkpoint Q4_K_M de un modelo de ~4B más el proyector bf16 debería situarse en un rango de pocos GB, pero no se confirma en la información.
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se confirma compatibilidad con GPUs de consumo AMD o NVIDIA; el paquete está dirigido a las dos arquitecturas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Latencia y throughput: no disponibles; las filas de rendimiento de la tarjeta no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Despliegue |
|---|---|---|---|---|---|
| FrogNano-4B-2609 (paquete Loom) | ~4B | 262.144 tokens | Sí (imagen-texto) | MIT | Loom sobre AMD gfx1151/gfx1201 |
| GGUF original bartowski/FrogNano-4B-2609-GGUF | ~4B | no disponible en esta ficha | Sí (con proyector) | no disponible en esta ficha | llama.cpp y derivados |
| Alternativas de ~4B multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias
- El paquete no aporta evidencia de corrección: todas las puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "no medidas todavía" para ambas GPUs.
- No hay mediciones de rendimiento publicadas para este paquete; no se puede afirmar que sea más rápido o más lento que llama.cpp en el hardware objetivo.
- El soporte de hardware está restringido a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta compatibilidad con otras GPUs.
- El límite de salida es de 4.096 tokens por petición, lo que puede ser insuficiente para generaciones largas aunque el contexto de entrada sea amplio.
- La concurrencia está limitada a 4 peticiones simultáneas.
- No se documentan los idiomas soportados ni los sesgos del modelo base; se desconoce el comportamiento en castellano y en otras lenguas.
- No hay información sobre la composición del entrenamiento del modelo base, por lo que no se pueden evaluar riesgos de alucinación ni sesgos con datos concretos.
- La licencia MIT se declara tanto en el paquete como en el checkpoint, pero la cadena de licencias del modelo base original no se detalla en esta información.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni validación por terceros.
- El nombre "Loom" coincide con el producto de grabación de pantalla de Atlassian; los resultados de búsqueda web sobre ese producto no guardan relación con este paquete y no deben tomarse como documentación.

## Enlaces
- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-FrogNano-4B-2609-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
