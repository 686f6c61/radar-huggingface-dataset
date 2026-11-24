# loom-draft/nvidia-NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-loom

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-4GB es un checkpoint multimodal de tipo image-text-to-text publicado por NVIDIA bajo licencia MIT. El repositorio analizado aquí no contiene los pesos originales, sino un paquete de despliegue de la plataforma Loom (formato `.loom` más un `model.json`) generado por el usuario `loom-draft` a partir del GGUF sin modificar `Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf`. La model card cita la etiqueta `gemma4`, lo que sugiere una base arquitectónica de la familia Gemma 4, aunque el dato no se detalla.

El interés de esta publicación es fundamentalmente operativo: demuestra cómo servir un modelo de aproximadamente 4.000 millones de parámetros en GPUs AMD de gama consumer y profesional (Ryzen AI Max+ 395 "Strix Halo", Radeon AI PRO R9700 y gfx1201 de 16 GB como RX 9070 XT y RX 9070) con decodificación especulativa (`dflash`) y un backend propio, `loom-serve`, que declara mejoras de hasta el 96 % en prefill y del 57-65 % en decodificación frente a llama.cpp ROCm.

El paquete no aporta información sobre el entrenamiento, los datos ni los idiomas del modelo base, y el repositorio tiene 0 GB y 0 descargas en el momento de la consulta. Todo lo relativo a capacidades, benchmarks de calidad y composición del dataset debe considerarse no disponible en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card etiqueta `gemma4`; sin detalle de capas, atención ni MoE) |
| Parametros totales | Aproximadamente 4.000 millones (derivado del nombre "E4B"; no confirmado en la información) |
| Parametros activos | No disponible |
| Longitud de contexto | 131.072 tokens nativos; en gfx1201 de 16 GB el paquete sirve hasta 35.840 tokens por petición con `--memory_bytes=15000000000` |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete Loom no documenta otras variantes |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf`) empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base: no se especifican número de capas, tipo de atención, presencia de mezcla de expertos ni mecanismo de visión, pese a que el pipeline declarado es `image-text-to-text`. La etiqueta `gemma4` en los metadatos apunta a una arquitectura de la familia Gemma, pero no se confirma en la documentación. Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del dataset, fases de RLHF o DPO, ni sobre el proceso de alineación.

Lo que sí documenta el paquete es la capa de inferencia: `loom-serve` sobre ROCm, con decodificación especulativa (`dflash`, con un 66 % de tokens redactados aceptados en Strix Halo), espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), pool de memoria fijo (`--pool_backing=fixed`) y precarga de pesos en host (`--parameter_mode=preload`). El paquete incluye presets diferenciados por GPU (`chat` y `chat-16gb`) y expone un endpoint compatible con `/v1/chat/completions` de la API de OpenAI, con un parámetro `enable_thinking` que activa o desactiva un modo de razonamiento opcional.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Procesamiento de imagen y texto (`image-text-to-text`), según el pipeline declarado y la etiqueta `vision`.
- Modo de razonamiento opcional controlable por petición (`chat_template_kwargs.enable_thinking`), desactivado por defecto en los ejemplos de la model card.
- Decodificación especulativa integrada en el runtime Loom, con una tasa de aceptación declarada del 66 % en Strix Halo.
- Soporte de contexto largo: hasta 131.072 tokens nativos, limitado a 35.840 tokens por petición en GPUs de 16 GB.
- Servicio concurrente: la model card reporta pruebas con 4 streams agregados.
- Tool calling, function calling, capacidades de agente y multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD: el paquete se sirve con `loom-serve` en Strix Halo o R9700 y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores.
- Procesamiento de documentos largos en GPU de 16 GB: con 35.840 tokens por petición en gfx1201, cabe analizar informes, contratos o expedientes completos en una sola pasada sin fragmentar el contexto.
- Análisis de imágenes en flujo local: al ser un modelo image-text-to-text, puede recibir capturas, diagramas o fotografías junto a una instrucción de texto para descripción, extracción de datos o respuesta a preguntas sobre la imagen.
- Razonamiento con activación selectiva: el flag `enable_thinking` permite reservar el modo de razonamiento para consultas complejas y desactivarlo en consultas triviales, reduciendo latencia y coste por token en producción.
- Despliegue en hardware AMD sin CUDA: el paquete está validado para gfx1151 y gfx1201, lo que cubre tarjetas consumer (RX 9070 XT, RX 9070) y APUs Strix Halo, un nicho con soporte de software más limitado que el de NVIDIA.
- Servicio multiusuario ligero: con 4 streams agregados a 219,6 tok/s en Strix Halo, el modelo es adecuado para equipos pequeños o entornos de desarrollo interno con varias sesiones concurrentes.
- Evaluación comparativa de runtimes: sirve como banco de pruebas reproducible para medir llama.cpp ROCm, llama.cpp Vulkan y Loom sobre el mismo GGUF y los mismos prompts.

## Benchmarks y rendimiento

Rendimiento de inferencia medido por el autor del paquete en Strix Halo (gfx1151), comparado con llama.cpp ROCm `llamacpp-rocm/b1374` y llama.cpp Vulkan `llamacpp-vulkan/b12211`, sobre el mismo GGUF:

| Métrica | llama.cpp ROCm | Loom | Margen vs mejor llama.cpp | Roofline | Loom % roofline | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 54,9 | 97,7 | +57 % | 143,6 | 68 % | 62,3 |
| Decode tok/s, contexto 2k | 51,5 | 84,9 | +65 % | 134,1 | 63 % | 50,5 |
| Decode tok/s, contexto 32k | 41,8 | 63,2 | +51 % | 106,4 | 59 % | 34,4 |
| Prefill tok/s, documento 1k | 1672,1 | 2821,1 | +69 % | 7146,0 | 39 % | 1409,2 |
| Prefill tok/s, documento 2k | 1711,0 | 3052,7 | +78 % | 7093,8 | 43 % | 1496,7 |
| Prefill tok/s, documento 8k | 1641,6 | 3079,6 | +88 % | 6812,0 | 45 % | 1430,2 |
| Prefill tok/s, documento 16k | 1480,9 | 2775,4 | +87 % | 6469,3 | 43 % | 1291,1 |
| Prefill tok/s, documento 32k | 1218,7 | 2386,9 | +96 % | 5878,0 | 41 % | 1071,8 |
| 4 streams, decode agregado tok/s | 163,9 | 219,6 | +29 % | 255,2 | 86 % | 170,7 |
| Decodificación especulativa, tokens aceptados | — | 66 % | — | n/a | n/a | n/a |

Metodología declarada: Loom medido del lado del cliente y llama.cpp del lado del servidor, mediana de 2 sesiones (6 en el caso de 4 streams), mismos prompts y mismo runner DevLab. Las mediciones de llama.cpp son del 13-11-2026 y las de Loom del 17-11-2026.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el paquete está pensado para GPUs de 16 GB o más. En gfx1201 de 16 GB se configura un presupuesto de 15.000.000.000 bytes (`--memory_bytes`), suficiente para servir hasta 35.840 tokens por petición.
- GPUs validadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), AMD Radeon AI PRO R9700 (gfx1201, 32 GB), AMD Radeon RX 9070 XT y RX 9070 (gfx1201, 16 GB).
- GPUs NVIDIA: no se documenta soporte en la información proporcionada.
- Cabe en GPU consumer: sí, en RX 9070 XT y RX 9070 mediante el preset `chat-16gb`.
- Despliegue: `hrx-loom[hf]==0.2.0` vía pipx, con `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete, aunque llama.cpp se usa como referencia de rendimiento.
- Throughput: 97,7 tok/s en decodificación con prompt corto y 2.821-3.080 tok/s en prefill en Strix Halo; 219,6 tok/s agregados con 4 streams.
- Latencia: no se publican cifras de tiempo hasta primer token.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto, benchmarks de calidad ni licencia de modelos alternativos de la misma categoría, por lo que no es posible establecer una comparación rigurosa. El único contraste documentado es de rendimiento de inferencia frente a llama.cpp ROCm y llama.cpp Vulkan sirviendo el mismo GGUF, recogido en la sección de benchmarks.

## Limitaciones y advertencias

- El repositorio no contiene los pesos originales, sino un paquete de despliegue dependiente del runtime Loom y de `hrx-loom[hf]==0.2.0`; no es portable a otros motores de inferencia sin conversión.
- El paquete está validado exclusivamente para GPUs AMD gfx1151 y gfx1201; no hay soporte documentado para CUDA ni para otras arquitecturas.
- En GPUs de 16 GB el contexto efectivo se reduce de 131.072 a 35.840 tokens por petición, lo que puede degradar casos de uso que dependan de ventanas muy largas.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de calidad del modelo base en la información disponible.
- No se especifican los idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano sin evaluación previa.
- El modo de razonamiento (`enable_thinking`) está desactivado por defecto en los ejemplos; su comportamiento y coste en tokens no se detallan.
- Las cifras de rendimiento proceden del autor del paquete y no de una evaluación independiente; además, Loom se mide del lado del cliente y llama.cpp del lado del servidor, lo que introduce una asimetría metodológica.
- La licencia MIT del paquete no exime de verificar la licencia y las condiciones de uso del modelo base `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB` antes de un despliegue comercial.
- El repositorio presenta 0 descargas y 0 "likes", sin historial de uso que permita validar su estabilidad en producción.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/nvidia-NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-loom
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de generación loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución DevLab de referencia para llama.cpp: https://github.com/loom-fun/loom-skills/actions/runs/43400470470/job/131801831202
- Ejecución DevLab de referencia para Loom: https://github.com/loom-fun/loom-skills/actions/runs/44170988612/job/1343
