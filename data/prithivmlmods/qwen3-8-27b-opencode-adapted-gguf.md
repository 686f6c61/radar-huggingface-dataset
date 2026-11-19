# prithivMLmods/Qwen3.8-27B-opencode-adapted-GGUF

## Resumen

Qwen3.8-27B-opencode-adapted-GGUF es la versión cuantizada en formato GGUF del checkpoint fusionado Qwen3.8-27B-opencode-adapted, publicado por el usuario prithivMLmods. El modelo parte de Qwen/Qwen3.8-27B y le incorpora, mediante fusión de un adaptador LoRA, el ajuste realizado por harness-hub para actuar como modelo de base del agente de programación OpenCode en tareas de ingeniería de software y de terminal. Con 27.320.697.856 parámetros, licencia Apache 2.0 y pesos en GGUF, está pensado para inferencia local con llama.cpp y motores compatibles.

La relevancia del modelo reside en su especialización: según la model card del adaptador original, el ajuste eleva SWE-bench Pro (hard 51) del 35,3 % al 51,0 % y Terminal-Bench 2.1 del 46,4 % al 52,4 %, además de reducir el número de turnos necesarios y generar entre 6 y 8 veces menos tokens por tarea. Esas cifras se midieron sobre el modelo base en BF16 con el adaptador, no sobre este checkpoint fusionado ni sobre estas cuantizaciones.

Los archivos GGUF incluyen soporte de Multi-Token Prediction (MTP) para decodificación especulativa integrada en los propios pesos, lo que acelera la inferencia local sin necesidad de un modelo borrador separado. El repositorio también distribuye un proyector multimodal en BF16 (mmproj) para capacidades de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B), con cabezas MTP para decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q8_0; proyector multimodal mmproj-bf16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint base fusionado) |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 27 300 millones de parámetros derivado de Qwen/Qwen3.8-27B. Sobre esa base se entrenó un adaptador LoRA con r = 32 y alpha = 64 que afecta a las proyecciones q, k, v, o, gate, up y down. El adaptador se entrenó con aprendizaje por refuerzo AsyncGRPO en entornos Harbor/OpenEnv para servir de base al agente de programación OpenCode en tareas de ingeniería de software y de terminal, con el modo de razonamiento (thinking mode) desactivado tal y como se hizo durante el entrenamiento. La fusión se realizó aplicando la actualización estándar W + (alpha/r)·B@A por tensor en fp32 y convirtiendo después a BF16, preservando la disposición de shards, los nombres de tensores y todos los tensores MTP del modelo original.

La innovación técnica destacable es la integración de Multi-Token Prediction en los archivos GGUF: la arquitectura incorpora cabezas adicionales que predicen varios tokens futuros en una sola pasada, lo que permite decodificación especulativa sin un modelo borrador externo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO más allá del AsyncGRPO descrito.

## Capacidades

- Generación de texto y razonamiento en inglés, con modo de razonamiento desactivado por defecto según el entrenamiento.
- Especialización en tareas de ingeniería de software: resolución de issues, parcheo de código y trabajo en terminal.
- Soporte de agentes y razonamiento multi-paso, entrenado explícitamente en entornos Harbor/OpenEnv para el agente OpenCode.
- Capacidades multimodales de imagen a texto mediante el proyector mmproj-bf16 incluido en el repositorio.
- Compatibilidad con llama.cpp y llama-cli, así como con text-generation-inference.
- Decodificación especulativa integrada mediante MTP.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Agente de programación autónomo en local: el modelo puede ejecutarse con llama.cpp como backend de OpenCode para resolver issues y aplicar parches en un repositorio, aprovechando su entrenamiento específico en SWE-bench Pro y Terminal-Bench 2.1.
- Automatización de tareas de terminal: dado su ajuste en entornos de terminal, encaja en pipelines que ejecutan comandos, interpretan la salida y encadenan acciones multi-paso con menos turnos que el modelo base.
- Asistencia de código en estaciones de trabajo sin GPU de centro de datos: las cuantizaciones Q4_K_S (15,8 GB) y Q4_K_M (17 GB) permiten desplegar el modelo en GPUs de consumo con VRAM suficiente.
- Revisión y corrección de parches en CI/CD: el modelo puede integrarse como paso de verificación que propone correcciones sobre diffs, con la ventaja de generar entre 6 y 8 veces menos tokens por tarea según las mediciones del adaptador.
- Procesamiento de capturas o diagramas junto a código: el proyector mmproj-bf16 habilita flujos de imagen a texto, por ejemplo para interpretar capturas de errores o diagramas de arquitectura junto a la consulta.
- Despliegue en servidores de inferencia compatibles con GGUF: mediante llama.cpp o text-generation-inference para servir el modelo a varios clientes internos con cuantización Q5_K_M o Q8_0 cuando se prioriza calidad.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al adaptador original medido sobre el modelo base en BF16, no a este checkpoint fusionado ni a las cuantizaciones GGUF.

| Benchmark | Modelo base (BF16) | Con adaptador opencode-adapted | Mejora |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % | +15,7 puntos |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % | +6,0 puntos |

Según la model card, el adaptador también requiere entre un cuarto y la mitad de turnos y genera entre 6 y 8 veces menos tokens por tarea. No se han publicado resultados de benchmarks de estas cuantizaciones GGUF en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB para Q4_K_S y Q4_K_M, 19-20 GB para Q5_K_S y Q5_K_M, y unos 29 GB para Q8_0, a los que hay que sumar el espacio de contexto y, si se usa visión, los 931 MB del proyector mmproj-bf16.
- GPU recomendadas: A100 o H100 para Q8_0 y contextos largos; RTX 4090 (24 GB) para Q5_K_M y Q8_0 con contexto moderado; RTX 3090 o 4080 para Q4_K_M.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4 y Q5 en tarjetas de 16-24 GB; Q8_0 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp (llama-cli), text-generation-inference y cualquier motor compatible con GGUF; el repositorio está etiquetado como compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada; el uso de MTP con decodificación especulativa está orientado a acelerar la inferencia local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Especializado en agentes de código, MTP, visión vía mmproj |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | no disponible en la información | safetensors | Modelo generalista sin el ajuste de OpenCode; referencia de partida |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,3 B | no disponible | no disponible en la información | safetensors (LoRA fusionable) | Adaptador original; requiere soporte LoRA o fusión |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks citados se midieron con el adaptador sobre el modelo base en BF16 y no se han reevaluado en este checkpoint fusionado ni en las cuantizaciones GGUF; el rendimiento real puede diferir.
- El modelo está orientado al inglés; no se documenta soporte de otros idiomas.
- El modo de razonamiento está desactivado tal y como se entrenó; forzarlo puede degradar el comportamiento esperado.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de código donde puede proponer parches sintácticamente válidos pero funcionalmente incorrectos.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- La longitud de contexto no está documentada en la información disponible, lo que dificulta planificar despliegues con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-opencode-adapted-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/prithivMLmods
