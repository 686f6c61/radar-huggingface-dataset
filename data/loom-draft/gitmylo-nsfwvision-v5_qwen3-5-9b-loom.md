# loom-draft/GitMylo-nsfwvision-v5_qwen3.5-9b-loom

## Resumen

GitMylo-nsfwvision-v5_qwen3.5-9b-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` para servir el checkpoint GGUF sin modificar `GitMylo/nsfwvision-v5_qwen3.5-9b-GGUF`, en su variante `nsfwvision_v5-Q4_K_M.gguf`. No se trata de un modelo entrenado por el autor del paquete, sino de un artefacto de empaquetado orientado a la ejecución eficiente sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un modelo multimodal de tipo image-text-to-text de aproximadamente 9 000 millones de parámetros, derivado de la familia Qwen 3.5 y ajustado por GitMylo para clasificación y descripción de contenido visual NSFW (etiqueta `nsfwvision-v5`). El paquete no aporta pesos nuevos: reproduce el GGUF original y añade el andamiaje necesario para servirlo con el runtime Loom a través de una API compatible con OpenAI.

Su relevancia es fundamentalmente de infraestructura: demuestra el rendimiento del motor Loom frente a llama.cpp ROCm sobre hardware AMD de consumo y de estación de trabajo, con mejoras medidas de entre el 9 % y el 62 % según la métrica. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y un tamaño declarado de 0,0 GB, lo que sugiere que los pesos no están alojados en este repositorio sino referenciados desde el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen 3.5; detalles de capas y atención no disponibles |
| Parametros totales | ~9 000 millones (deducido de la nomenclatura "9b"; cifra exacta no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65 536 tokens (parámetro `-c 65536` usado en la comparativa con llama.cpp); máximo nativo del modelo no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`nsfwvision_v5-Q4_K_M.gguf`), empaquetado como artefacto Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del checkpoint base. Por la nomenclatura (`qwen3.5-9b`) y la capacidad declarada (`image-text-to-text`, tag `vision`), se trata de un transformer multimodal de la familia Qwen 3.5 con un codificador visual acoplado, ajustado posteriormente por GitMylo para la tarea `nsfwvision-v5`. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado.

El paquete Loom en sí no modifica los pesos: el autor indica explícitamente que se parte del "unmodified GGUF checkpoint". La innovación técnica reside en el runtime: Loom sirve el modelo con un pool de memoria fijo (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), lo que reduce la latencia de sincronización en GPUs AMD. No hay cabeza MTP en el GGUF ni drafter publicado para este modelo concreto, por lo que la decodificación especulativa no está disponible en ninguna de las dos engines comparadas.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto y produce texto (pipeline `image-text-to-text`).
- Descripción y clasificación de contenido visual, incluyendo contenido NSFW, según el ajuste `nsfwvision-v5` del modelo base.
- Modo thinking opcional: la plantilla de chat admite `enable_thinking` (desactivado por defecto en el ejemplo de petición).
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`).
- Soporte de tool calling: la tabla de features del model card incluye una fila `tool c...` truncada en la información disponible; el detalle completo no está disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- No se documentan capacidades de audio, agentes multi-paso ni decodificación especulativa.

## Casos de uso

- Moderación de contenido en plataformas UGC: el modelo puede clasificar y describir imágenes subidas por usuarios para detectar material NSFW antes de su publicación, aprovechando su ajuste específico y su naturaleza multimodal.
- Etiquetado automático de datasets de imágenes: generación de descripciones y etiquetas para grandes volúmenes de imágenes en pipelines de curación de datos, con procesado por lotes a través de la API OpenAI-compatible.
- Despliegue en estaciones de trabajo AMD: servir el modelo en una Radeon AI PRO R9700 de 32 GB o en un Strix Halo para equipos de investigación que trabajan íntegramente sobre ROCm, sin depender de CUDA.
- Evaluación comparativa de runtimes de inferencia: el paquete incluye metodología y resultados frente a llama.cpp ROCm, por lo que sirve como referencia reproducible para medir el rendimiento de Loom en hardware AMD concreto.
- Servicio interno de análisis de imágenes con contexto largo: con 65 536 tokens de contexto, permite procesar documentos con múltiples imágenes o conversaciones multi-turno extensas sobre contenido visual.
- Prototipado de asistentes visuales con razonamiento opcional: el flag `enable_thinking` permite alternar entre respuestas rápidas y cadenas de razonamiento más costosas según la carga del servicio.
- Integración en pipelines de CI/CD para validación de assets: verificación automática de imágenes en repositorios o builds mediante peticiones HTTP al endpoint local.

## Benchmarks y rendimiento

El model card incluye una comparativa de rendimiento del runtime Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374` sobre Strix Halo (gfx1151), con el mismo GGUF, mismas prompts y mediana de 3 sesiones. No se publican resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.).

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 37,3 | 41,3 | +11 % |
| Decode tok/s, contexto 2k | 36,7 | 40,4 | +10 % |
| Decode tok/s, contexto 32k | 31,2 | 34,1 | +9 % |
| Prefill tok/s, documento 1k | 1056,6 | 1681,7 | +59 % |
| Prefill tok/s, documento 2k | 1097,5 | 1698,0 | +55 % |
| Prefill tok/s, documento 8k | 1104,8 | 1714,1 | +55 % |
| Prefill tok/s, documento 16k | 1043,1 | 1638,3 | +57 % |
| Prefill tok/s, documento 32k | 926,5 | 1498,7 | +62 % |
| 4 streams, decode agregado tok/s | 111,5 | 149,2 | +34 % |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a |

Medición realizada el 2026-11-26 en un runner AMD DevLab Dispatch Strix Halo (X2-LA03-S03-D02), Linux, con `hrx-loom` 0.2.0. Para la Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han vuelto a medir todavía" según el autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de ~9 000 millones de parámetros ocupa aproximadamente 5-6 GB solo en pesos, más el coste del codificador visual y la caché KV para 65 536 tokens de contexto.
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: no confirmada; el paquete está generado para las dos plataformas AMD citadas y no se documentan otras.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`) con API OpenAI-compatible en el puerto 8080. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto, aunque el GGUF subyacente podría cargarse en llama.cpp.
- Throughput medido en Strix Halo: 41,3 tok/s de decode en prompt corto y hasta 1714,1 tok/s de prefill en documentos de 8k tokens; 149,2 tok/s agregados con 4 streams.
- Latencia: no se publican valores de latencia por petición (solo tokens por segundo).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (visión + clasificación NSFW de ~9B) en la documentación proporcionada. La única comparativa publicada es de motor de inferencia, no de modelo:

| Aspecto | Este paquete (Loom) | llama.cpp ROCm b1374 |
|---|---|---|
| Pesos | GGUF Q4_K_M sin modificar | Mismo GGUF |
| Contexto servido | 65 536 tokens | 65 536 tokens (`-c 65536`) |
| Decode (prompt corto) | 41,3 tok/s | 37,3 tok/s |
| Prefill (32k) | 1498,7 tok/s | 926,5 tok/s |
| 4 streams agregados | 149,2 tok/s | 111,5 tok/s |
| Licencia del paquete | MIT | MIT (llama.cpp) |

## Limitaciones y advertencias

- Modelo especializado en contenido NSFW: su ajuste está orientado a ese dominio, por lo que su comportamiento en tareas generales puede estar degradado respecto al Qwen 3.5 base.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni tasas de error en la información disponible.
- Sesgos: no documentados por el autor; al ser un ajuste sobre contenido para adultos, pueden amplificarse sesgos de representación y de clasificación.
- Idiomas: el campo de idiomas no está informado; no se garantiza soporte multilingüe.
- Licencia MIT: permite uso comercial, pero el autor no documenta restricciones adicionales derivadas del modelo base ni del dataset de ajuste; conviene verificar la licencia del checkpoint original `GitMylo/nsfwvision-v5_qwen3.5-9b-GGUF`.
- Hardware restringido: el paquete está generado y medido únicamente para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); el soporte en otras GPUs no está verificado.
- Resultados en R9700 pendientes de medición: el autor indica que no se han vuelto a medir para esa GPU.
- Repositorio sin tracción: 0 descargas y 0 likes, tamaño declarado de 0,0 GB; no hay evidencia de uso en producción ni de validación por terceros.
- Tool calling: la fila correspondiente en la tabla de features está truncada en la información disponible; no se puede confirmar su estado.
- Sin decodificación especulativa: no hay cabeza MTP ni drafter publicado para este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/GitMylo-nsfwvision-v5_qwen3.5-9b-loom
- Modelo base (GGUF): https://huggingface.co/GitMylo/nsfwvision-v5_qwen3.5-9b-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45877016682
