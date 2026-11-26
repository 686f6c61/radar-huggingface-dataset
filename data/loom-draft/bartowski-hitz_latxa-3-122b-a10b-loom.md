# loom-draft/bartowski-HiTZ_Latxa-3-122B-A10B-loom

## Resumen

El paquete `loom-draft/bartowski-HiTZ_Latxa-3-122B-A10B-loom` es una distribución en formato Loom (programas `.loom` y una tarjeta `model.json`) del checkpoint GGUF sin modificar `bartowski/HiTZ_Latxa-3-122B-A10B-GGUF`, en su variante Q4_K_M. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de despliegue generado con la herramienta `loom-next` para ejecutar el modelo sobre GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El autor del paquete es `loom-draft`, y el modelo subyacente procede de HiTZ (grupo de investigación de la UPV/EHU) y fue cuantizado por bartowski.

El modelo base es un Mixture-of-Experts de 122B parámetros totales con 10B activos por token, según la nomenclatura del identificador (122B-A10B), con capacidades de visión e image-text-to-text. El paquete incorpora la plantilla de chat y el preset de servicio de Loom, incluyendo un modo de razonamiento opcional (`enable_thinking`) que puede desactivarse por petición.

La relevancia de este artefacto es de infraestructura más que de modelado: demuestra cómo servir un MoE de 122B cuantizado en Q4_K_M sobre hardware AMD de consumo y workstation mediante el runtime Loom, con mejoras medidas frente a llama.cpp ROCm en decodificación y prefill sobre Strix Halo. Es útil para quien quiera desplegar el modelo en GPUs AMD sin montar su propio stack de compilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer Mixture-of-Experts (según nomenclatura del modelo base; detalles no disponibles en la información proporcionada) |
| Parametros totales | 122B (según identificador del modelo) |
| Parametros activos | 10B (según identificador del modelo, MoE) |
| Longitud de contexto | no disponible (los benchmarks del paquete miden hasta 32k tokens de contexto, pero no se declara el máximo) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del modelo base no disponibles en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado en formato Loom: programas `.loom` y `model.json`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base HiTZ_Latxa-3-122B-A10B. El identificador indica un transformer con mezcla de expertos (MoE) de 122B parámetros totales y 10B activos por token, lo que sitúa el coste de cómputo por token en el orden de un modelo denso de ~10B. El checkpoint distribuido aquí es una cuantización Q4_K_M realizada por bartowski sobre los pesos originales; el paquete Loom no modifica los pesos, solo los reempaqueta junto con la configuración de servicio.

El artefacto añade una plantilla de chat con soporte de modo de razonamiento opcional (`chat_template_kwargs.enable_thinking`), desactivado en los ejemplos de la model card. La model card menciona que el GGUF no incluye cabeza MTP (multi-token prediction) y que no existe un drafter publicado para este modelo exacto, por lo que la decodificación especulativa no está disponible en las mediciones. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno mediante una API compatible con `/v1/chat/completions`.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), según las etiquetas del repositorio y la model card.
- Modo de razonamiento opcional, activable o desactivable por petición mediante `enable_thinking`.
- Razonamiento multi-paso implícito en el modo thinking (no se documentan detalles del formato).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de 122B en una estación de trabajo con Ryzen AI Max+ 395: el paquete incluye los comandos exactos (`loom-fetch` y `loom-serve`) para servir el modelo en local con memoria unificada, sin necesidad de configurar manualmente el runtime ROCm.
- Servicio en una Radeon AI PRO R9700 de 32 GB: el preset usa `--parameter_mode=preload` para cargar los pesos en la GPU de forma anticipada, adecuado para entornos de un solo usuario con cargas de inferencia sostenidas.
- Asistente conversacional con contexto largo: los benchmarks miden decodificación tras 32k tokens de contexto, por lo que el modelo es viable para conversaciones o documentos extensos donde se mantiene la coherencia a lo largo de decenas de miles de tokens.
- Procesamiento de documentos con imágenes: al soportar image-text-to-text, puede emplearse para extraer y razonar sobre contenido de capturas, diagramas o páginas escaneadas en un pipeline local.
- Evaluación comparativa de runtimes en hardware AMD: el paquete incluye mediciones frente a llama.cpp ROCm con la misma semilla, prompts y runner, lo que permite reproducir la comparativa en un entorno controlado.
- Prototipado de aplicaciones con razonamiento opcional: la posibilidad de desactivar `enable_thinking` por petición permite alternar entre respuestas rápidas y respuestas con cadena de razonamiento según la latencia exigida.
- Investigación sobre cuantización Q4_K_M en modelos MoE grandes: permite medir la degradación de calidad y el rendimiento de una cuantización de 4 bits sobre un modelo de 122B en GPUs AMD.

## Benchmarks y rendimiento

Los únicos datos publicados son comparativas de rendimiento de inferencia (no de calidad) entre Loom y llama.cpp ROCm `llamacpp-rocm/b1374`, con el mismo GGUF, el mismo runner y los mismos prompts, medidas el 2026-11-26 en un runner Strix Halo (gfx1151) del AMD DevLab Dispatch.

| Métrica (Strix Halo) | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 21,8 | 23,7 | +9 % |
| Decode tok/s, contexto 2k | 21,7 | 23,3 | +7 % |
| Decode tok/s, contexto 32k | 20,1 | no medido | — |
| Prefill tok/s, documento 2k | 414,8 | 932,0 | +125 % |
| Prefill tok/s, documento 8k | 419,2 | no medido | — |
| Prefill tok/s, documento 16k | 394,7 | no medido | — |
| Prefill tok/s, documento 32k | 350,4 | no medido | — |
| 4 streams, decode agregado tok/s | 46,8 | no medido | — |
| Decodificación especulativa | n/a | n/a | n/a |

Los resultados para la Radeon AI PRO R9700 (gfx1201, 32 GB) aparecen truncados en la información disponible. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint es Q4_K_M de un modelo de 122B, y el paquete está diseñado para ejecutarse en Strix Halo (memoria unificada) y en una GPU de 32 GB (R9700); el preset de la R9700 usa `--parameter_mode=preload`.
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para GPUs NVIDIA ni para otras AMD.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo convencionales; el hardware objetivo son APUs Strix Halo y la R9700.
- Opciones de despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para descargar el paquete. La comparativa usa llama.cpp ROCm como referencia.
- Notas de despliegue: en hosts con memlock de 8 MiB hay que lanzar `loom-serve` bajo `systemd-run` con `SystemCallFilter=~io_uring_setup` (sin root, IREE cae a su proactor POSIX) o subir `ulimit -l`. Los comandos recomendados incluyen `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU) y `--pool_backing=fixed`.
- Latencia y throughput: 23,7 tok/s de decodificación en prompt corto y 932 tok/s de prefill con documento de 2k en Strix Halo, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| HiTZ_Latxa-3-122B-A10B (este paquete, Q4_K_M) | 122B | 10B | no disponible | MIT | GGUF / Loom | Objetivo: GPUs AMD Strix Halo y R9700 |
| HiTZ_Latxa-3-122B-A10B-GGUF (bartowski) | 122B | 10B | no disponible | MIT | GGUF | Checkpoint original sin empaquetar; sirve para llama.cpp y otros runtimes |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El paquete es específico de hardware: los presets y comandos están pensados para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se garantiza su funcionamiento en otras GPUs.
- El repositorio tiene 0 GB de tamaño declarado y 0 descargas, lo que sugiere que los artefactos pueden no estar materializados o que el paquete es un borrador (`loom-draft`); conviene verificar la integridad antes de usarlo en producción.
- La información sobre sesgos, alucinación y calidad multilingüe del modelo base no está disponible en la documentación proporcionada.
- El contexto máximo no se declara; las mediciones llegan a 32k tokens, pero no debe asumirse que ese sea el límite.
- No hay drafter publicado ni cabeza MTP en el GGUF, por lo que no se puede usar decodificación especulativa con este modelo.
- Los benchmarks de rendimiento se midieron en runners del DevLab que difieren entre sesiones y con una sola muestra en la mayoría de filas; los márgenes de ±3 % se consideran empate.
- La licencia MIT del paquete no exime de verificar la licencia y las condiciones del modelo base HiTZ_Latxa-3-122B-A10B antes de un uso comercial.
- El modo thinking está desactivado por defecto en los ejemplos; en producción hay que decidir explícitamente si se activa por petición.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-HiTZ_Latxa-3-122B-A10B-loom
- Modelo base (GGUF de bartowski): https://huggingface.co/bartowski/HiTZ_Latxa-3-122B-A10B-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Portal del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución de DevLab con las mediciones: https://github.com/loom-fun/loom-next/actions/runs/45875479345
