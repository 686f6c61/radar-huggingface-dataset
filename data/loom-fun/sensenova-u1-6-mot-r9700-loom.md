# loom-fun/SenseNova-U1.6-MoT-R9700-loom

## Resumen

SenseNova-U1.6-MoT-R9700-loom es un paquete de despliegue derivado del checkpoint SenseNova-U1.6-8B-MoT de SenseNova, publicado por el usuario loom-fun. No se trata de un modelo entrenado desde cero, sino de una adaptacion del checkpoint original (finetune/base_model sobre `sensenova/SenseNova-U1.6-8B-MoT`) empaquetada para ejecutarse sobre la GPU AMD Radeon AI PRO R9700 con 32 GiB de memoria, usando el SDK propietario `hrx-loom` (arquitectura de destino `gfx1201`, familia AMD). El paquete cubre cuatro tareas multimodales: generacion texto-a-imagen, edicion de imagen con una unica referencia, respuesta a preguntas visuales (VQA) y chat de texto.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco habitual de portabilidad de un modelo de difusion multimodal de 8B a hardware AMD consumer/workstation (RDNA, gfx1201) en lugar de CUDA, con presets predefinidos de resolucion y cuantizacion. Por otro, el autor aporta evidencia de validacion numerica frente a la implementacion BF16 original: 44,67 dB de PSNR RGB en generacion y 36,48 dB en edicion, con la misma semilla de ruido inicial, imagenes de 1024×1024 y 50 pasos Euler.

El modelo base tiene 8B parametros y una arquitectura "mixture-of-transformers" (MoT), que combina un experto de generacion de imagen con una parte de texto. El paquete expone seis presets (`image-1mp`, `edit-1mp`, `image-256`, `edit-256`, `chat`, `vqa`) servidos mediante `loom-serve` con una API compatible con endpoints de generacion de imagenes y chat completions. La licencia declarada es Apache 2.0 y los idiomas soportados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-transformers (MoT) con experto de generacion de imagen y componente de texto |
| Parametros totales | 8B (segun el nombre del modelo base, `SenseNova-U1.6-8B-MoT`) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.024 tokens (presets `chat` y `vqa`) |
| Tipos de cuantizacion | Pesos de 8 bits por filas (row-wise) en las capas feed-forward de texto para presets de imagen; BF16 para el experto de generacion y para presets `chat`/`vqa` |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete `hrx-loom` (`model.json` + `model.json.lock` + programas nativos Loom); checkpoint original de 35,07 GB y fichero cuantizado compartido de 6,35 GB |
| Tamano del repositorio | 6,4 GB |
| Hardware objetivo | AMD Radeon AI PRO R9700, 32 GiB, `gfx1201` |
| SDK / libreria | `hrx-loom[hf]==0.2.0`, servidor `loom-serve` |
| Resoluciones de imagen | 1024×1024 (`image-1mp`, `edit-1mp`) y 256×256 (`image-256`, `edit-256`) |
| Muestreo de imagen | 50 pasos Euler, guidance 4, schedule shift 3 (fijo por preset) |

## Arquitectura y entrenamiento

El modelo base es un "mixture-of-transformers" de 8B parametros: en lugar de un unico transformer denso, combina modulos especializados, con un experto dedicado a la generacion de imagen y una pila de texto que alimenta las tareas de chat y VQA. El paquete de loom-fun no reentrena el modelo; es un finetune/adaptacion de despliegue sobre el checkpoint `sensenova/SenseNova-U1.6-8B-MoT` (revision `8e684596649268cd828c18bdabeadbce5dc8fef9`), con tokenizadores nativos, programas Loom compilados para `gfx1201` y una cuantizacion compartida del servicio de imagen.

La innovacion tecnica principal del paquete es la estrategia de cuantizacion mixta: las capas feed-forward del torre de texto usan pesos de 8 bits por filas, mientras que el experto de generacion mantiene BF16. Esto reduce el fichero cuantizado compartido a 6,35 GB frente a los 35,07 GB del checkpoint original, manteniendo la fidelidad del decodificador de imagen. El autor valida la fidelidad con PSNR RGB frente a la implementacion BF16 original usando el mismo ruido inicial: 44,67 dB en generacion y 36,48 dB en edicion. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generacion texto-a-imagen a 1024×1024 y 256×256 con prompts en ingles y chino.
- Edicion de imagen con una unica referencia (single-reference edit): cambio de color, recoloreado y transformaciones que preservan composicion, iluminacion y angulo de camara.
- Respuesta a preguntas visuales (VQA) sobre imagenes preprocesadas a 256×256.
- Chat de texto multi-turno mediante `/v1/chat/completions`.
- Control de modo de razonamiento mediante `chat_template_kwargs.enable_thinking` (se puede desactivar el "thinking mode").
- API HTTP compatible con endpoints de imagenes (`/v1/images/generations`) y de chat completions.
- Cliente Python de edicion incluido (`sensenova_u16.generation.edit`) para preprocesar y empaquetar la imagen de referencia.
- Soporte de semilla determinista (`seed`) en generacion y edicion.
- No soporta autocorreccion intercalada nativa (native interleaved self-correction).

## Casos de uso

- Generacion de material grafico para producto: el preset `image-1mp` produce fotografias de estudio de 1024×1024 con control de semilla, util para prototipar variaciones de packaging o renders de catalogo antes de encargar fotografia real.
- Edicion iterativa de imagenes de catalogo: con `edit-1mp` se puede recolorear o modificar un producto manteniendo mesa, iluminacion y angulo de camara, lo que reduce el coste de retocar variantes de color en e-commerce.
- Moderacion y descripcion automatica de imagenes: el preset `vqa` acepta una imagen a 256×256 y una pregunta en texto, adecuado para etiquetado asistido o generacion de descripciones en pipelines de contenido.
- Asistente conversacional de texto: el preset `chat` con contexto de 1.024 tokens sirve para respuestas cortas y deterministas (`temperature=0`), por ejemplo clasificacion de intenciones o respuestas factuales en un bot interno.
- Prototipado en hardware AMD: equipos con Radeon AI PRO R9700 pueden validar flujos de difusion multimodal sin depender de CUDA, usando `loom-fetch` y `loom-serve` como sustituto del stack habitual.
- Evaluacion comparativa de fidelidad de cuantizacion: el paquete incluye `REPORT.md` e `info.json` con los PSNR frente a BF16, lo que permite reproducir la comparativa en un entorno AMD y medir el impacto de los pesos de 8 bits.
- Generacion de miniaturas y assets de baja resolucion: el preset `image-256` produce PNG de 256×256 con los mismos parametros de muestreo, util para previsualizaciones rapidas en interfaces.
- Integracion en pipelines de CI: los endpoints HTTP y el cliente Python permiten automatizar pruebas de regresion visuales con semilla fija y comparar PSNR entre versiones.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.). La unica evidencia cuantitativa disponible es la fidelidad frente a la implementacion BF16 original:

| Tarea | Resolucion | Pasos | Metrica | Resultado |
|---|---|---|---|---|
| Generacion texto-a-imagen | 1024×1024 | 50 Euler | PSNR RGB vs. BF16 | 44,67 dB |
| Edicion con referencia | 1024×1024 | 50 Euler | PSNR RGB vs. BF16 | 36,48 dB |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU objetivo: AMD Radeon AI PRO R9700 con 32 GiB de VRAM (arquitectura `gfx1201`, familia RDNA).
- VRAM estimada: el paquete esta disenado para caber en 32 GiB; el checkpoint original ocupa 35,07 GB en disco y el fichero cuantizado compartido 6,35 GB, por lo que se necesita espacio en disco para ambos mas la cache de descarga.
- No hay informacion sobre funcionamiento en GPUs consumer de menos VRAM (RTX 4090, etc.); el paquete esta compilado para `gfx1201` y depende de `loom-serve` con `--device=amdgpu`.
- Despliegue: `loom-fetch` para descargar presets y `loom-serve` como servidor HTTP; se recomienda un unico servidor activo a la vez en la tarjeta.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no disponibles para este paquete, que usa el SDK propietario `hrx-loom`.
- Latencia y throughput: no disponibles. La generacion usa 50 pasos Euler fijos por preset, lo que condiciona el coste por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | Formato |
|---|---|---|---|---|---|
| SenseNova-U1.6-MoT-R9700-loom | 8B (MoT) | 1.024 tokens | AMD R9700 (gfx1201), 32 GiB | Apache 2.0 | Paquete `hrx-loom` |
| SenseNova-U1.6-8B-MoT (original) | 8B (MoT) | no disponible | no disponible (implementacion BF16) | Apache 2.0 | Checkpoint BF16 (35,07 GB) |
| Alternativas de difusion texto-a-imagen de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo derivado de un checkpoint de terceros: la calidad final depende del modelo base `sensenova/SenseNova-U1.6-8B-MoT`, sobre el que no se documentan datos de entrenamiento ni sesgos.
- Contexto muy limitado en chat y VQA: 1.024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Idiomas restringidos a ingles y chino; no hay evidencia de soporte de castellano.
- Edicion limitada a una unica imagen de referencia y a resoluciones fijas por preset (1024×1024 o 256×256); no se puede cambiar la resolucion ni los parametros de muestreo sin modificar el preset.
- No soporta autocorreccion intercalada nativa (native interleaved self-correction).
- Dependencia de hardware y SDK especificos: requiere GPU AMD `gfx1201` (Radeon AI PRO R9700) y el paquete `hrx-loom`; no es portable a CUDA ni a GPUs consumer sin validacion.
- Riesgo de alucinacion en VQA y chat no cuantificado por el autor; no hay benchmarks que lo midan.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion independiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base y de los programas nativos incluidos en el paquete.
- El servidor debe ejecutarse de uno en uno en la tarjeta; no se documenta concurrencia ni multi-tenant.

## Enlaces

- Hugging Face: https://huggingface.co/loom-fun/SenseNova-U1.6-MoT-R9700-loom
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT
- Revision del checkpoint original: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT/tree/8e684596649268cd828c18bdabeadbce5dc8fef9
- Informe de validacion: `REPORT.md` (incluido en el repositorio)
- Evidencia legible por maquina: `info.json` (incluido en el repositorio)
- Cliente Python de edicion: `sensenova_u16/*` (incluido en el repositorio)
