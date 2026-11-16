# LuffyTheFox/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis-GGUF

## Resumen
DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis-GGUF es una distribucion en formato GGUF de un modelo de lenguaje de 9B de parametros publicado por el desarrollador independiente LuffyTheFox. El modelo parte de Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tuning destilado que combina la familia Qwen3.5 con tecnicas de entrenamiento asociadas a DeepSeek (SFT, RL con GSPO, multi-token prediction y distillation). Sobre esa base, el autor aplica dos transformaciones: un proceso de abliteration/decensoring mediante la herramienta Heretic y una calibracion de tensores propia bautizada como Genesis.

El modelo se presenta como una version sin censura ("uncensored", "decensored", "abliterated") orientada a razonamiento, matematicas, STEM, uso de herramientas y function calling. La ficha del autor declara soporte para seis idiomas (ingles, chino, coreano, japones, espanol y ruso) y licencia Apache 2.0. Esta pensado para ejecucion local en formato GGUF, lo que lo hace accesible en GPUs de consumo.

La relevancia actual reside en su naturaleza experimental: combina una base de destilacion orientada a razonamiento con una intervencion de calibracion de tensores basada en la distribucion de Marchenko-Pastur, una tecnica poco habitual en el ecosistema open source. No obstante, el modelo no cuenta con descargas ni validacion externa en el momento de la publicacion, por lo que debe tratarse como un artefacto de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tags del autor); detalles exactos no disponibles |
| Parametros totales | 9B (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no disponibles) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio etiquetado como GGUF); tambien compatible con transformers y text-generation-inference segun tags |

## Arquitectura y entrenamiento
La arquitectura base es un transformer de la familia Qwen3.5, segun las etiquetas del autor (`qwen3_5`). El modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B se describe como un fine-tuning que emplea distillation, SFT, RL con GSPO (Group Sequence Policy Optimization) y multi-token prediction (MTP), ademas de estar orientado a matematicas, STEM y tool use. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO.

Sobre esa base, LuffyTheFox aplica dos intervenciones. La primera es un proceso de abliteration/decensoring mediante Heretic, que elimina las direcciones de rechazo en el espacio de activaciones para reducir las negativas del modelo. La segunda es el algoritmo Genesis, descrito por el autor como una calibracion de tensores en GGUF que escanea tensores `ssm_conv1d` (asociados a memoria de contexto largo), reequilibra cabezas y reduce ruido mediante una SVD custom basada en la distribucion de Marchenko-Pastur, preservando segun el autor el 99% de la senal y el gradiente aprendido. Esta descripcion procede unicamente de la model card y no ha sido validada de forma independiente.

## Capacidades
- Generacion de texto y razonamiento multi-paso, con etiqueta explicita `reasoning`.
- Razonamiento matematico y tareas STEM, segun los tags `math` y `stem`.
- Uso de herramientas y function calling (`tool-use`, `function-calling`).
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Modo sin censura: el proceso de abliteration reduce las negativas a responder, lo que amplia el rango de temas tratables pero elimina salvaguardas.
- Compatibilidad con text-generation-inference y transformers, ademas de inferencia local en GGUF.
- No se documentan capacidades de vision, audio ni modo thinking explicito mas alla de la etiqueta `reasoning`.

## Casos de uso
- Investigacion sobre abliteration y decensoring: permite estudiar como afecta la eliminacion de direcciones de rechazo a las capacidades de razonamiento y a la tasa de alucinacion en un modelo de 9B.
- Experimentacion con calibracion de tensores: util para reproducir y evaluar el algoritmo Genesis frente a la misma base sin calibrar, comparando perplejidad y coherencia en contexto largo.
- Asistencia tecnica en matematicas y STEM en local: adecuado para entornos sin conexion donde se requiere resolver problemas paso a paso sin enviar datos a la nube.
- Generacion de codigo con function calling: puede integrarse en pipelines de automatizacion que requieran llamadas a herramientas, aunque sin garantias de calidad en produccion.
- Prototipado de agentes multi-paso: la etiqueta `tool-use` y el soporte multilingue permiten construir demos de agentes en seis idiomas sobre hardware de consumo.
- Evaluacion de sesgos y seguridad: al ser un modelo sin censura, sirve como caso de estudio para medir la eficacia de las salvaguardas frente a modelos alineados.
- Despliegue local en estaciones de trabajo con GPU de consumo para tareas de generacion de texto general y experimentacion con cuantizaciones GGUF.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: para 9B en GGUF, aproximadamente 6-7 GB en cuantizacion Q4, 9-11 GB en Q6 y 18-20 GB en FP16 (estimaciones genericas para modelos de este tamano; no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6; A100 o H100 solo si se requiere FP16 y alto throughput.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizaciones Q4.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference y transformers (segun los tags del repositorio). vLLM no se menciona explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis | 9B | no disponible | Apache 2.0 | GGUF | Base destilada + abliteration + calibracion Genesis |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9B | no disponible | Apache 2.0 | safetensors | Modelo original sin decensoring ni calibracion |
| Qwen3.5 9B (familia) | 9B | no disponible | Apache 2.0 | safetensors, GGUF | Referencia arquitectonica de la familia |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias
- Modelo sin censura: la abliteration elimina salvaguardas, por lo que puede generar contenido danino, ilegal o sensible sin filtros. No apto para aplicaciones orientadas al publico sin moderacion externa.
- Sin validacion externa: cero descargas y cero likes en el momento de la publicacion; no hay evidencia independiente de calidad ni de estabilidad.
- Riesgo de alucinacion: la model card afirma que la calibracion reduce la verbosidad y las alucinaciones, pero no aporta metricas que lo respalden.
- Procedencia del algoritmo Genesis: la descripcion tecnica es del propio autor y no ha sido revisada por pares; la afirmacion de preservar el 99% de la senal no esta verificada.
- Contexto e idiomas: la longitud de contexto no se documenta, y aunque se declaran seis idiomas, no hay evaluaciones de calidad por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento legal del contenido generado por un modelo decensored.
- Caveat de produccion: no recomendado para despliegues en produccion sin evaluacion previa de seguridad, sesgos y calidad.

## Enlaces
- Hugging Face: https://huggingface.co/LuffyTheFox/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis-GGUF
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Distribucion de Marchenko-Pastur (referencia): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
- Contacto del autor: luffythefox@mail.ru, azakharchenko92@gmail.com
- Telegram del autor: @LuffyTheFox
