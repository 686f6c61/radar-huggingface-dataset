# loom-draft/unsloth-Inkling-2-Mini-loom

## Resumen

Inkling-2-Mini-loom es un paquete de despliegue en formato Loom generado por el usuario loom-draft a partir del checkpoint GGUF `Inkling-2-Mini-UD-Q4_K_M.gguf` publicado por unsloth. No se trata de un modelo entrenado desde cero ni de un fine-tune con nuevos pesos: es una conversión del GGUF original a programas `.loom` y a una tarjeta `model.json`, generada con la herramienta loom-next (sin LLM en el bucle) para su ejecución sobre GPUs AMD. El objetivo es ofrecer una ruta de inferencia nativa en el ecosistema Loom (hrx-loom) sobre hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Inkling-2-Mini, se distribuye en cuantización UD-Q4_K_M (unsloth dynamic quant), y la tarjeta declara una ventana de contexto de 262.144 tokens por petición, con hasta 4 peticiones concurrentes y un máximo de 4.096 tokens de salida por preset. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), modo de razonamiento siempre activo con control de esfuerzo (`reasoning_effort`) y soporte de tool calling marcado como no aplicable.

La relevancia de esta ficha es doble: por un lado documenta una vía de ejecución de un GGUF en GPUs AMD fuera del stack CUDA/llama.cpp habitual; por otro, advierte de que el repositorio tiene 0 descargas, 0 likes y 0,0 GB de tamaño, y de que las mediciones de rendimiento y las puertas de corrección no están re-medidas. Es, por tanto, un artefacto de publicación reciente y sin validación pública registrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Inkling-2-Mini; el paquete Loom no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | UD-Q4_K_M (GGUF de unsloth) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas Loom (`program/*.loom`, `weights.loom`) más `model.json`, `tokenizer.json` y `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Herramienta de generacion | loom-next (generador, sin LLM en el bucle) |
| Version del runtime | hrx-loom 0.2.0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Inkling-2-Mini en la documentación proporcionada: no se especifica si es un transformer denso, un MoE, un modelo híbrido o una SSM, ni el número de parámetros, capas o cabezas de atención. La tarjeta del paquete Loom se limita a describir el proceso de conversión del checkpoint GGUF `Inkling-2-Mini-UD-Q4_K_M.gguf` a programas Loom mediante loom-next, y a documentar los parámetros de ejecución (`completion_spin_ns`, `pool_backing=fixed`, `parameter_mode=preload`).

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens vistos, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o similares. La única información técnica relevante del empaquetado es que el GGUF se mantiene sin modificar ("unmodified GGUF checkpoint") y que la generación de kernels y programas es automática, con pruebas de corrección definidas (kernel_tests, golden, compare, vision, consistency, spec, agent, sampling, logits, decision) pero sin resultados registrados en esta publicación.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento / thinking siempre activo, con control granular mediante `reasoning_effort` (valores: minimal, low, medium, high, xhigh, max; por defecto high).
- Ventana de contexto de 262.144 tokens por petición, adecuada para documentos largos y conversaciones multi-turno extensas.
- Concurrencia de hasta 4 peticiones simultáneas por instancia servida.
- Límite de 4.096 tokens de salida por petición según el preset.
- Tool calling: marcado como "not applicable" en la tabla de features del paquete Loom.
- Decodificación especulativa: marcada como "not applicable".
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream sí la tendría según la tarjeta.
- Entrada/salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "not determined" en la tabla de features.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de inferencia local en GPUs AMD profesionales: el paquete está pensado para ejecutarse con `loom-serve` sobre Radeon AI PRO R9700 (32 GB) o Ryzen AI Max+ 395, ofreciendo una alternativa nativa al stack llama.cpp en hardware AMD.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por petición, permite resumir, extraer información o responder preguntas sobre contratos, informes técnicos o expedientes completos en una sola pasada.
- Asistentes conversacionales multi-turno: la combinación de contexto largo y 4 peticiones concurrentes permite servir chatbots internos con historial extenso sin truncar agresivamente.
- Razonamiento controlado por coste: el parámetro `reasoning_effort` permite degradar de `max` a `minimal` según la criticidad de la consulta, ajustando el consumo de cómputo en tareas de clasificación, extracción o respuesta directa.
- Evaluación comparativa de runtimes: útil para equipos que quieran medir el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF, ya que la tarjeta define puertas de corrección (golden, compare, logits) pensadas para esa comparación.
- Prototipado de APIs compatibles con OpenAI en infraestructura AMD: al exponer `/v1/chat/completions`, se puede integrar con clientes y frameworks existentes sin adaptadores propios.
- Laboratorio de investigación en GPUs de consumo profesional: la R9700 de 32 GB permite ejecutar un modelo en Q4_K_M con contexto muy largo en una única tarjeta, lo que facilita experimentos de ventana extendida sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir todavía" ("not yet re-measured"), y que las puertas de corrección (kernel_tests, golden, compare, vision, consistency, spec, agent, agent_think_off, sampling, logits, decision) no tienen ejecuciones registradas. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete está orientado a una GPU de 32 GB (Radeon AI PRO R9700) y a la GPU integrada del Ryzen AI Max+ 395.
- GPUs soportadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPUs no soportadas explícitamente: no se mencionan modelos NVIDIA ni otras GPUs AMD en la documentación.
- Cabe en GPU de consumo: no confirmado; la única GPU discreta documentada es la R9700, de gama profesional.
- Despliegue: `hrx-loom[hf]==0.2.0` instalado con pipx, `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo con flags `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp están pendientes de re-medición.
- Concurrencia máxima configurada: 4 peticiones simultáneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-loom (este paquete) | no disponible | 262.144 tokens | Apache 2.0 | Loom (GGUF empaquetado) | Publicado en HF, 0 descargas |
| unsloth/Inkling-2-Mini-GGUF (modelo base) | no disponible | no disponible en esta ficha | Apache 2.0 (heredada) | GGUF | Disponible en HF |
| llama.cpp + mismo GGUF | no disponible | depende de la configuracion | Apache 2.0 (del runtime) | GGUF | Referencia de comparacion citada por el autor |

No se dispone de datos de rendimiento ni de especificaciones detalladas del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría. La comparación cualitativa relevante es frente a llama.cpp sobre el mismo checkpoint, que el autor usa como referencia de corrección y rendimiento, aunque las mediciones están pendientes.

## Limitaciones y advertencias

- Repositorio sin validación pública: 0 descargas, 0 likes, 0,0 GB de tamaño declarado y sin resultados de benchmarks ni de puertas de corrección registrados.
- Tool calling no soportado en este paquete ("not applicable"), lo que limita su uso en pipelines de agentes.
- Decodificación especulativa no soportada en este paquete.
- Entrada de imagen no soportada por Loom, aunque el modelo upstream la tendría; no se puede usar como modelo multimodal en este runtime.
- Estado de muestreo (temperature, top_k, seed) marcado como "not determined": el comportamiento de generación no está verificado documentalmente.
- Idiomas soportados no declarados: no hay garantía documentada de calidad multilingüe.
- Hardware restringido a GPUs AMD concretas (gfx1151 y gfx1201); no hay soporte documentado para NVIDIA ni para otras AMD.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto derivado del GGUF de unsloth conviene verificar la licencia y condiciones del modelo base y de sus datos de entrenamiento.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Dependencia de la herramienta loom-next y del runtime hrx-loom 0.2.0, con posible fragilidad ante actualizaciones de versión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Inkling-2-Mini-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/

Nota: los resultados de búsqueda web devueltos corresponden a servicios no relacionados (Loom Inc. de grabación de pantalla y la marca de ropa Loom), por lo que se han descartado por no ser pertinentes para esta ficha.
