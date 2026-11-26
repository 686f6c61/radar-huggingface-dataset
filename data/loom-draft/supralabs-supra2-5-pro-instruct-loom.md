# loom-draft/SupraLabs-Supra2.5-Pro-Instruct-loom

## Resumen

SupraLabs-Supra2.5-Pro-Instruct-loom es un paquete de despliegue en formato Loom para el checkpoint GGUF `Supra2.5-65M.Q4_K_M.gguf`, derivado del modelo base `SupraLabs/Supra2.5-Pro-Instruct`. Lo publica el usuario `loom-draft` y no contiene pesos nuevos ni un fine-tuning propio: empaqueta el GGUF sin modificar junto con programas `.loom` y una tarjeta `model.json` para servirlo con el motor `hrx-loom` (versión 0.2.0) sobre GPUs AMD.

El objetivo del paquete es ofrecer una ruta de inferencia optimizada para hardware AMD concretо: el AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Se generó con la herramienta `loom-next`, sin intervención de un LLM en el proceso de generación. Expone una API compatible con el endpoint OpenAI `/v1/chat/completions` a través de `loom-serve`.

Por el nombre del fichero GGUF (`Supra2.5-65M`), el modelo subyacente es de escala muy pequeña (del orden de decenas de millones de parámetros) y con una ventana de contexto nativa de 512 tokens, según se deduce de las notas de metodología de la model card. La información pública disponible es escasa: no se detallan arquitectura, datos de entrenamiento ni benchmarks de calidad, y el paquete no incluye mediciones de rendimiento rellenas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre del GGUF sugiere ~65M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 512 tokens nativos (deducido de las notas de la model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `SupraLabs/Supra2.5-Pro-Instruct`: la model card del paquete Loom no describe el tipo de transformer, el número de capas ni la composición del dataset de entrenamiento. Tampoco se documenta si hubo RLHF, DPO u otras etapas de alineación.

Lo único verificable es el proceso de empaquetado: el GGUF original se ha dejado sin modificar y se ha envuelto con `loom-next`, que genera los programas `.loom` y la tarjeta `model.json` para el runtime `hrx-loom`. La model card menciona que el GGUF no incluye cabeza MTP (multi-token prediction) y que no se ha publicado un drafter específico para este modelo, por lo que la decodificación especulativa no está disponible.

## Capacidades

- Generación de texto conversacional mediante una API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling: no aplicable según la tabla de características de la model card.
- Razonamiento / modo thinking: no aplicable según la model card.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades de agente multi-paso: no documentadas.
- Soporte multilingüe: no disponible.
- Decodificación especulativa: no disponible (sin cabeza MTP ni drafter publicado).

## Casos de uso

- Despliegue de referencia en hardware AMD Strix Halo: el paquete está pensado para arrancar con `loom-serve` sobre gfx1151 y validar la pila `hrx-loom` en un equipo con Ryzen AI Max+ 395, sirviendo un endpoint compatible con OpenAI para pruebas de integración.
- Evaluación comparativa de motores de inferencia: permite medir el rendimiento de Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts, tal como describe la metodología de la model card.
- Pruebas de humo de pipelines de CI: al ser un modelo de escala muy pequeña y cuantización Q4_K_M, sirve para validar extremo a extremo un cliente HTTP que consuma `/v1/chat/completions` sin requerir GPUs de gran capacidad.
- Prototipado de integraciones con clientes OpenAI: cualquier librería que apunte a una `base_url` local puede conectarse al servidor de Loom para verificar el flujo de mensajes y respuestas.
- Benchmarking de concurrencia: la model card incluye una prueba de 4 streams agregados (referencia de llama.cpp: 2524,7 tok/s agregados), útil para estudiar el comportamiento del servidor bajo carga paralela.
- Validación en Radeon AI PRO R9700: el paquete declara soporte para gfx1201 con 32 GB, de modo que sirve como artefacto de despliegue en estaciones de trabajo con esa GPU, aunque las mediciones para ese dispositivo aún no se han publicado.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374` en Strix Halo, pero la mayoría de las celdas de Loom están sin rellenar. Los datos disponibles son:

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | no disponible |
| Decode tok/s, contexto 2k | no medido | no medido | no disponible |
| Decode tok/s, contexto 32k | n/a | n/a | n/a |
| Prefill tok/s, documento 1k | no medido | no medido | no disponible |
| Prefill tok/s, documento 2k | no medido | no medido | no disponible |
| Prefill tok/s, documento 8k | n/a | n/a | n/a |
| Prefill tok/s, documento 16k | n/a | n/a | n/a |
| Prefill tok/s, documento 32k | n/a | n/a | n/a |
| 4 streams, decode agregado tok/s | 2524,7 | no medido | no disponible |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a |

Las filas marcadas como n/a lo están porque el documento supera el contexto nativo de 512 tokens del modelo. Para la Radeon AI PRO R9700, la model card indica que los resultados «aún no se han vuelto a medir». No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del GGUF (modelo de ~65M de parámetros en Q4_K_M) la huella de pesos es del orden de decenas de MB, muy por debajo de cualquier GPU consumer.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs NVIDIA ni con otras GPU AMD distintas de las dos anteriores; el runtime `hrx-loom` se invoca con `--device=amdgpu://`.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para arrancar el servidor. Opciones relevantes: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de completaciones en GPU).
- Latencia y throughput: no disponibles para Loom; la única referencia numérica es la de llama.cpp en 4 streams (2524,7 tok/s agregados) en Strix Halo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría. El modelo base `SupraLabs/Supra2.5-Pro-Instruct` no tiene ficha pública descrita en la información proporcionada, y el paquete Loom no publica métricas de calidad que permitan situarlo frente a alternativas. La única comparación documentada es de motor de inferencia (Loom frente a llama.cpp ROCm), no de modelo.

| Criterio | Supra2.5-Pro-Instruct (Loom) | Alternativas |
|---|---|---|
| Parametros | no disponible (~65M por el nombre del GGUF) | no disponible |
| Contexto | 512 tokens nativos | no disponible |
| Licencia | MIT | no disponible |
| Formato | GGUF empaquetado en Loom | no disponible |

## Limitaciones y advertencias

- Contexto nativo de 512 tokens: insuficiente para la mayoría de tareas de producción con documentos largos o conversaciones multi-turno extensas.
- Escala muy reducida: por el nombre del checkpoint (~65M de parámetros), la calidad esperada en razonamiento, código y matemáticas es limitada frente a modelos de miles de millones de parámetros.
- Sin datos de calidad: no hay benchmarks publicados que permitan evaluar su rendimiento real en tareas downstream.
- Sin tool calling ni modo de razonamiento: la propia model card los marca como «not applicable».
- Idiomas no documentados: no se puede asumir un buen soporte del castellano ni de otros idiomas distintos del que se usó en el entrenamiento.
- Riesgo de alucinación: no cuantificado; en modelos de este tamaño el riesgo suele ser alto, pero no hay evaluación publicada.
- Dependencia de hardware específico: el paquete está generado para gfx1151 y gfx1201; fuera de esas GPU AMD el despliegue con `loom-serve` no está documentado.
- Rendimiento sin medir: las celdas de Loom en la tabla comparativa están vacías, por lo que no hay evidencia publicada de que supere a llama.cpp en este modelo.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base `SupraLabs/Supra2.5-Pro-Instruct` de forma independiente, ya que la model card solo declara la del paquete.
- Los resultados de la Radeon AI PRO R9700 aún no se han vuelto a medir según el autor.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/SupraLabs-Supra2.5-Pro-Instruct-loom
- Modelo base: https://huggingface.co/SupraLabs/Supra2.5-Pro-Instruct
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ejecución de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45886431806
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
