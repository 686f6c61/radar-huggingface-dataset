# loom-fun/unsloth-Qwen3.8-27B-UD-Q4_K_XL

## Resumen

Qwen3.8-27B (UD-Q4_K_XL) para AMD Loom es un paquete de despliegue publicado por el usuario loom-fun que empaqueta el checkpoint GGUF sin modificar `Qwen3.8-27B-UD-Q4_K_XL.gguf` de unsloth (derivado de la familia Qwen3.8-27B) en el formato `.loom` propietario del runtime Loom, junto con una tarjeta `model.json`. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los del GGUF original de unsloth en cuantización Unsloth Dynamic Q4_K_XL, y el aporte del autor es la configuración de servicio (presets de memoria, decodificación especulativa con MTP y ajustes para GPU AMD) para dos plataformas concretas: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es multimodal (pipeline `image-text-to-text`) con 27 000 millones de parámetros nominales y una ventana de contexto nativa de 262 144 tokens. La relevancia del paquete es de infraestructura: demuestra que el GGUF puede servirse en hardware AMD consumer y profesional con un rendimiento medido superior al de llama.cpp (ROCm y Vulkan) en decodificación y prefill, gracias a decodificación especulativa con tokens MTP y a un pool de memoria de tamaño fijo.

La licencia declarada es MIT y el paquete se generó con el flujo de trabajo `loom-skills`. En el momento de redactar esta ficha el repositorio no registra descargas ni likes, y no se publican datos sobre composición del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks de calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 27B (nominal, segun el nombre del checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens nativos; preset de servicio de hasta 116 736 tokens por peticion en R9700 |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL (Unsloth Dynamic Q4_K_XL); otras cuantizaciones del checkpoint base no detalladas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como programa `.loom` + `model.json`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen3.8-27B más allá de su naturaleza multimodal (entrada de imagen y texto, salida de texto) y de la presencia de cabezas MTP (multi-token prediction) usadas para decodificación especulativa. No se detallan el número de capas, la dimensión oculta, el tipo de atención, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO.

Lo que sí está documentado es la capa de despliegue: el paquete Loom configura un pool de memoria de tamaño fijo (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). La decodificación especulativa se apoya en MTP con profundidad de borrador 3 en Loom, y en las pruebas se reporta una tasa de aceptación del 63 % de tokens redactados. El checkpoint GGUF se sirve sin modificaciones respecto al original de unsloth.

## Capacidades

- Generación de texto y razonamiento en modo conversacional, con modo "thinking" opcional desactivable mediante `chat_template_kwargs.enable_thinking`.
- Procesamiento de imagen y texto (`image-text-to-text`), lo que habilita tareas de descripción, VQA y extracción de información de documentos visuales.
- Decodificación especulativa con MTP integrada en el runtime Loom, con una tasa de aceptación medida del 63 % de tokens redactados.
- Servicio concurrente: el preset soporta 4 peticiones en paralelo con decodificación agregada.
- Contexto largo de hasta 116 736 tokens por petición en el preset para R9700 (262 144 nativos).
- Compatibilidad con la API compatible con OpenAI (`/v1/chat/completions`) expuesta por `loom-serve`.
- Soporte de tool calling, agentes multi-paso y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con contexto largo: el preset sirve hasta 116 736 tokens por petición en R9700 y mantiene 23,7 tok/s de decodificación a 32k de contexto en Strix Halo, lo que permite mantener hilos de conversación extensos con documentos adjuntos sin truncar.
- Procesamiento de documentos con imágenes en estación de trabajo AMD: al ser un modelo image-text-to-text, puede recibir capturas, escaneos o diagramas junto al texto y responder sobre ellos, con el prefill medido en 648,7 tok/s para documentos de 8k en Strix Halo.
- Despliegue en hardware consumer sin GPU dedicada: la APU Strix Halo ejecuta el modelo cuantizado a Q4_K_XL con 25,9 tok/s de decodificación en prompt corto, suficiente para uso interactivo individual en un equipo compacto.
- Servicio multiusuario ligero: con 4 streams el runtime entrega 46,3 tok/s agregados en Strix Halo, adecuado para un pequeño equipo de desarrollo que comparta una única máquina.
- RAG sobre corpus extensos: la ventana nativa de 262 144 tokens y el prefill de 560,6 tok/s a 32k permiten inyectar grandes bloques de contexto recuperado en cada consulta sin recurrir a técnicas de compresión agresivas.
- Evaluación y benchmarking de runtimes AMD: el paquete incluye tablas comparativas reproducibles frente a llama.cpp ROCm y Vulkan, por lo que sirve como referencia para medir el rendimiento de Loom en gfx1151 y gfx1201.
- Prototipado de pipelines multimodales en CI: la instalación vía `pipx install "hrx-loom[hf]==0.2.0"` y el arranque con `loom-serve` facilitan levantar un endpoint compatible con OpenAI en un solo comando para pruebas automatizadas.

## Benchmarks y rendimiento

Los únicos datos publicados son de rendimiento de inferencia, no de calidad del modelo. Comparan Loom frente a llama.cpp ROCm b1374, llama.cpp Vulkan b12211 y Gufo 0.35.0 sobre el mismo GGUF y la misma máquina (AMD Ryzen AI Max+ 395 con Radeon 8060S, gfx1151, Ubuntu 26.04, modo de 123 W). Valores en tokens por segundo, mediana de 3 sesiones.

| Métrica | llama.cpp ROCm | Loom | Margen vs mejor llama.cpp | Roofline | Loom % roofline | llama.cpp Vulkan | Gufo 0.35.0 |
|---|---|---|---|---|---|---|---|
| Decode, prompt corto | 21,5 | 25,9 | +20 % | 31,8 | 81 % | 21,3 | 26,6 |
| Decode, contexto 2k | 21,2 | 26,6 | +25 % | 33,7 | 79 % | 21,1 | 24,0 |
| Decode, contexto 32k | 20,6 | 23,7 | +15 % | 31,1 | 76 % | 19,1 | 18,1 |
| Prefill, documento 1k | 349,7 | 618,3 | +77 % | 972,8 | 64 % | 341,9 | 485,3 |
| Prefill, documento 2k | 362,1 | 631,0 | +74 % | 969,0 | 65 % | 348,9 | 507,1 |
| Prefill, documento 8k | 358,5 | 648,7 | +81 % | 946,7 | 69 % | 343,1 | 538,5 |
| Prefill, documento 16k | 341,8 | 617,1 | +81 % | 918,4 | 67 % | 323,5 | 538,4 |
| Prefill, documento 32k | 307,1 | 560,6 | +83 % | 866,7 | 65 % | 288,0 | 506,8 |
| 4 streams, decode agregado | 40,4 | 46,3 | +15 % | 53,7 | 86 % | 39,6 | 43,4 |
| Decodificación especulativa, tokens aceptados | — | 63 % | — | n/a | n/a | n/a | n/a |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_XL sobre 27B, y el paquete está dimensionado para una GPU de 32 GB (R9700) y para la memoria unificada de la APU Strix Halo.
- GPU soportadas por el paquete: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" con Radeon 8060S (gfx1151).
- Contexto por petición en R9700: hasta 116 736 tokens con el preset de memoria fija.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`), con endpoint compatible con OpenAI en el puerto 8080. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI dentro de este paquete, aunque el GGUF subyacente es compatible con llama.cpp según las comparativas.
- Throughput medido en Strix Halo: 25,9 tok/s de decodificación en prompt corto, 618,3 tok/s de prefill a 1k y 46,3 tok/s agregados con 4 streams.
- No se proporcionan datos de latencia ni de rendimiento para la R9700 en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B UD-Q4_K_XL (este paquete, Loom) | 27B | 262 144 nativos; 116 736 por petición en R9700 | MIT | GGUF empaquetado en `.loom`; runtime Loom | Optimizado para gfx1151 y gfx1201; decodificación especulativa MTP |
| Qwen3.8-27B GGUF (unsloth, base) | 27B | no disponible | MIT (según este paquete) | GGUF | Checkpoint original sin preset de servicio; sirve de referencia en las comparativas |
| llama.cpp ROCm b1374 (runtime) | n/a | 65 536 configurado | n/a | Binario llama.cpp | 21,5 tok/s decode y 349,7 tok/s prefill a 1k en Strix Halo |
| Gufo 0.35.0 (runtime) | n/a | no disponible | no disponible | Runtime alternativo | 26,6 tok/s decode y 485,3 tok/s prefill a 1k en Strix Halo |

No se dispone de comparativas de calidad frente a otros modelos de 27B en la información proporcionada; la comparación disponible es exclusivamente de motores de inferencia sobre el mismo checkpoint.

## Limitaciones y advertencias

- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo día (2026-11-21), por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad del modelo base.
- Los idiomas soportados no están declarados; no se puede garantizar un rendimiento aceptable fuera de los idiomas cubiertos por el modelo original.
- El paquete está atado a hardware AMD concretos (gfx1151 y gfx1201) y al runtime Loom 0.2.0; no es portable a otras GPU sin adaptar los presets.
- El contexto efectivo por petición en R9700 se limita a 116 736 tokens pese a los 262 144 nativos, por el dimensionado del pool de memoria fijo.
- Las mediciones de rendimiento se tomaron en un equipo local a 123 W, no en los runners de AMD DevLab (85 W), por lo que los valores no son directamente extrapolables a ese entorno.
- La licencia MIT se declara en este paquete; conviene verificar los términos del checkpoint base de unsloth antes de un uso comercial.
- El soporte de tool calling, agentes y modo thinking se infiere del nombre del checkpoint y de la plantilla de chat, pero no está verificado en la documentación del paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/unsloth-Qwen3.8-27B-UD-Q4_K_XL
- Checkpoint base GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
