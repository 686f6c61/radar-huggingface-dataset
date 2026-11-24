# loom-draft/bartowski-Nanbeige4.3-33B-loom

## Resumen

`loom-draft/bartowski-Nanbeige4.3-33B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Nanbeige_Nanbeige4.3-33B-Q4_K_M.gguf`, publicado originalmente por bartowski a partir del modelo Nanbeige 4.3 de 33B parámetros. No se trata de un modelo nuevo ni de un fine-tune: los pesos son idénticos al GGUF de referencia y lo que aporta el paquete es una configuración de ejecución optimizada para GPUs AMD concretas.

El paquete está generado con el flujo de trabajo `loom-skills` y está dirigido específicamente a la AMD Ryzen AI Max+ 395 «Strix Halo» (arquitectura gfx1151, APU con memoria unificada) y a la AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM). Su relevancia es acotada pero clara: ofrece un artefacto listo para servir el modelo con el runtime `loom-serve` sobre ROCm, con presets de memoria y mediciones de rendimiento comparadas contra llama.cpp ROCm y Vulkan en el mismo hardware.

La información pública disponible es escasa: la model card se centra en instrucciones de despliegue y en una tabla de rendimiento, y no documenta arquitectura interna, datos de entrenamiento ni benchmarks de calidad del modelo base. Todo lo relativo a capacidades y evaluación del modelo subyacente debe consultarse en las fuentes originales de Nanbeige y bartowski, que no forman parte de la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Nanbeige 4.3 de 33B; el paquete no documenta la arquitectura interna) |
| Parametros totales | 33B (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens nativos; el preset para R9700 sirve hasta 37.888 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura del modelo subyacente. Por el nombre y el tamaño (33B) se trata de un modelo de lenguaje de la familia Nanbeige 4.3, pero la información proporcionada no confirma si es un transformer denso, un MoE ni detalles sobre atención, capas o tokenizador. Tampoco se indican datos de entrenamiento, número de tokens, composición del corpus ni si hubo RLHF, DPO u otras etapas de alineamiento.

La innovación técnica que sí está documentada es de despliegue, no de modelado: el paquete Loom incluye presets de memoria (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). Según la model card, no se aplicó decodificación especulativa en las mediciones porque el GGUF no incluye cabeza MTP ni existe un drafter publicado para este modelo exacto.

## Capacidades

- Generación de texto conversacional mediante API compatible con `/v1/chat/completions`.
- Modo de razonamiento opcional controlable con `chat_template_kwargs.enable_thinking` (desactivado por defecto en el ejemplo de la tarjeta).
- Contexto largo: hasta 524.288 tokens nativos según la tarjeta, aunque el preset para R9700 limita el servicio a 37.888 tokens por petición.
- Servicio multi-stream: el paquete se ha medido con 4 peticiones paralelas.
- Soporte de tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Despliegue local en AMD Strix Halo: el paquete permite servir un modelo de 33B en una APU con memoria unificada usando `loom-fetch` y `loom-serve`, sin necesidad de recompilar ni convertir el GGUF.
- Inferencia en Radeon AI PRO R9700: con 32 GB de VRAM y cuantización Q4_K_M, el preset está dimensionado para servir hasta 37.888 tokens por petición, adecuado para asistentes con documentos largos en una sola GPU de consumo profesional.
- Procesamiento de documentos extensos: la ventana nativa de 524.288 tokens permite analizar contratos, informes o bases de código completas, aunque en la R9700 habrá que respetar el límite del preset o ajustar el pool de memoria.
- Servicio de chat multi-turno: la API compatible con OpenAI (`/v1/chat/completions`) facilita integrar el modelo en aplicaciones existentes sin cambiar el cliente.
- Evaluación comparativa de runtimes en AMD: la tabla de rendimiento frente a llama.cpp ROCm y Vulkan sirve para decidir qué motor usar en este hardware concreto.
- Prototipado de asistentes con razonamiento opcional: el flag `enable_thinking` permite activar o desactivar la cadena de razonamiento según el coste de latencia aceptable.
- Benchmarking de hardware ROCm: los runners de AMD DevLab y las métricas publicadas (decode, prefill, 4 streams) permiten reproducir y comparar configuraciones.

## Benchmarks y rendimiento

La model card incluye mediciones de rendimiento del runtime (no de calidad del modelo) en Strix Halo (gfx1151), comparando Loom con llama.cpp ROCm b1374 y llama.cpp Vulkan b12211 sobre el mismo GGUF:

| Métrica | llama.cpp | Loom | Margen vs mejor llama.cpp | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 10,6 | 11,2 | +5 % | 10,7 | 105 % |
| Decode tok/s, contexto 2k | 9,7 | 10,7 | +3 % | 10,5 | 102 % |
| Decode tok/s, contexto 32k | 2,4 | 8,0 | +3 % | 8,0 | 100 % |
| Prefill tok/s, documento 1k | 322,6 | 430,2 | +33 % | 948,6 | 45 % |
| Prefill tok/s, documento 2k | 323,0 | 429,5 | +33 % | 937,4 | 46 % |
| Prefill tok/s, documento 8k | 287,6 | 412,8 | +44 % | 875,2 | 47 % |
| Prefill tok/s, documento 16k | 244,7 | 358,1 | +46 % | 804,1 | 45 % |
| Prefill tok/s, documento 32k | 186,2 | 271,0 | +46 % | 691,6 | 39 % |
| 4 streams, decode agregado tok/s | 34,1 | 42,6 | +10 % | 41,9 | 102 % |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a | n/a | n/a |

Metodología declarada: mediana de 3 sesiones (6 para 4 streams), mismos prompts y mismo tipo de runner de AMD DevLab; llama.cpp medido el 2026-11-13 y Loom el 2026-11-17, en jobs distintos. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPUs soportadas explícitamente: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- VRAM estimada: no disponible de forma explícita; el peso Q4_K_M de un modelo de 33B ronda los 20 GB, y el preset de la R9700 asume 32 GB de VRAM.
- Contexto servible en R9700: hasta 37.888 tokens por petición con el preset del paquete.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servir la API.
- Opciones de despliegue alternativas: llama.cpp ROCm y llama.cpp Vulkan se usan como referencia comparativa, por lo que el GGUF subyacente también puede servirse con esos motores.
- Throughput medido en Strix Halo: 11,2 tok/s de decode en prompt corto, 8,0 tok/s con contexto de 32k, 430,2 tok/s de prefill con documento de 1k y 42,6 tok/s agregados con 4 streams.
- Latencia y throughput en R9700: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información proporcionada no incluye datos de calidad que permitan comparar el modelo con alternativas de su categoría. La única comparación disponible es de motores de inferencia sobre el mismo GGUF:

| Motor | Decode corto (tok/s) | Decode 32k (tok/s) | Prefill 1k (tok/s) | Prefill 32k (tok/s) | 4 streams (tok/s) |
|---|---|---|---|---|---|
| Loom (Strix Halo) | 11,2 | 8,0 | 430,2 | 271,0 | 42,6 |
| llama.cpp ROCm b1374 | 10,6 | 2,4 | 322,6 | 186,2 | 34,1 |
| llama.cpp Vulkan b12211 | 10,7 | 7,8 | 260,4 | 154,0 | 38,9 |

Comparativa con otros modelos de 33B (parámetros, contexto, rendimiento, licencia): no disponible.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos al GGUF de bartowski; cualquier limitación del modelo Nanbeige 4.3 subyacente se hereda sin cambios.
- La documentación de la tarjeta no cubre sesgos, alucinación ni calidad por idioma; no hay evaluación publicada en la información disponible.
- El paquete está orientado exclusivamente a hardware AMD gfx1151 y gfx1201; no se documenta soporte para NVIDIA ni otras GPUs.
- El contexto efectivo en R9700 queda limitado a 37.888 tokens por petición por el preset de memoria, muy por debajo de los 524.288 nativos.
- La cuantización Q4_K_M introduce pérdida de precisión frente al modelo original en BF16/FP16.
- La licencia MIT del paquete no implica necesariamente la misma licencia para los pesos del modelo base; conviene verificar la licencia del repositorio original de Nanbeige y del GGUF de bartowski antes de uso comercial.
- No hay decodificación especulativa disponible para este modelo en el ecosistema Loom, lo que limita las ganancias de latencia en decode.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Nanbeige4.3-33B-loom
- GGUF base de bartowski: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución de referencia llama.cpp (DevLab, 2026-11-13): https://github.com/loom-fun/loom-skills/actions/runs/43376548212/job/131724300420
- Ejecución de referencia Loom (DevLab, 2026-11-17): https://github.com/loom-fun/loom-skills/actions/runs/44088653570/job/134057765577
