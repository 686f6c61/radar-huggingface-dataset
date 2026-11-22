# moonbox-dev/gemma-4-12B-it-MLX

## Resumen

Gemma 4 12B it MLX es una compilación del modelo instructivo Gemma 4 12B de Google, adaptada por Moonbox para su ejecución nativa en Macs con Apple Silicon mediante el framework MLX. El modelo original es un transformer multimodal de tipo any-to-any (texto, visión y audio) con 12.000 millones de parámetros, afinado por instrucciones, que Google publica bajo licencia Apache 2.0. Moonbox redistribuye los pesos en formato MLX junto con el tokenizer, la plantilla de chat, la configuración del procesador y el drafter de predicción multi-token (MTP) de Google para decodificación especulativa.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal de 12B en hardware de consumo Apple (MacBook Pro, Mac Studio) sin depender de CUDA, algo poco habitual en el ecosistema open source, donde la mayoría de builds cuantizados se orientan a GPUs NVIDIA. El repositorio ocupa 40,5 GB e incluye varias precisiones (8bit, 6bit y presumiblemente otras), cada una con sus pesos safetensors, index y artefactos auxiliares.

No se dispone de información sobre la longitud de contexto, los idiomas soportados ni los datos de entrenamiento del modelo base en la documentación proporcionada, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: texto, vision, audio) con drafter MTP para decodificacion especulativa |
| Parametros totales | 12.000 millones (12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8bit, 6bit (y otras precisiones presentes en el repo, no detalladas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (formato MLX), con config.json, tokenizer.json, chat_template.jinja, processor_config.json y mtp/model.safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google, afinado por instrucciones, con pipeline any-to-any, lo que implica entradas y salidas en múltiples modalidades (texto, imagen y audio). La build de Moonbox conserva la arquitectura original y añade un drafter de predicción multi-token (MTP) empaquetado en `mtp/model.safetensors` (845,7 MB en 8bit), que habilita decodificación especulativa para acelerar la generación en MLX.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La build incluye cuantización post-entrenamiento (QAT según los tags) con métricas de fidelidad respecto al modelo bf16 original: en 8bit, divergencia KL de 0,032 nats y top-1 del 96,8 %; en 6bit, KL de 0,098 nats y top-1 del 93,4 %. Estas métricas permiten evaluar la pérdida de calidad por precisión.

## Capacidades

- Generación de texto y razonamiento en modo instructivo.
- Procesamiento de visión (entrada de imágenes) y audio, al ser un modelo any-to-any.
- Salidas multimodales según el pipeline any-to-any declarado.
- Decodificación especulativa mediante el drafter MTP incluido, que acelera la inferencia.
- Ejecución nativa en Apple Silicon mediante MLX y mlx-vlm.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistentes locales en Mac: desplegar el modelo en un MacBook Pro o Mac Studio con MLX permite un asistente conversacional privado, sin enviar datos a la nube, aprovechando la cuantización 8bit para mantener calidad cercana al bf16.
- Análisis de documentos con imágenes: al aceptar visión, puede procesar capturas, diagramas o PDFs escaneados junto con texto para extraer y resumir información en flujos de trabajo de escritorio.
- Transcripción y análisis de audio: la modalidad de audio permite integrarlo en pipelines de reuniones o notas de voz para generar resúmenes y actas localmente.
- Prototipado rápido en investigación: investigadores con hardware Apple pueden evaluar un modelo multimodal de 12B sin GPU NVIDIA, usando mlx-vlm como runtime y el drafter MTP para reducir latencia.
- Generación de código asistida en el IDE: aunque no se documenta tool calling, el modelo instructivo puede emplearse para autocompletado y explicación de código en entornos locales de desarrollo.
- Evaluación comparativa de cuantizaciones: las métricas KL y top-1 publicadas permiten a equipos de MLOps decidir entre 8bit (mayor fidelidad) y 6bit (menor huella) según su presupuesto de memoria unificada.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en local y con licencia Apache 2.0, encaja en organizaciones que no pueden usar APIs externas.

## Benchmarks y rendimiento

| Benchmark | 8bit | bf16 (referencia) |
|---|---|---|
| MMLU-Pro | 50,5 % | 50,3 % |
| Divergencia KL vs bf16 | 0,032 nats | — |
| Top-1 agreement | 96,8 % | — |
| Divergencia KL vs bf16 (6bit) | 0,098 nats | — |
| Top-1 agreement (6bit) | 93,4 % | — |

No se han publicado en la información disponible resultados de benchmarks adicionales (HumanEval, GSM8K, MMMU, etc.) ni comparativas con modelos similares.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo completo ocupa 40,5 GB; la build 8bit ronda los 13-14 GB de pesos (suma de los shards) más el drafter MTP de 845,7 MB. La build 6bit es ligeramente menor. Se recomienda al menos 16 GB de memoria unificada para 8bit y 12-16 GB para 6bit, dejando margen para el contexto y el runtime.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No está diseñado para CUDA.
- ¿Cabe en GPU de consumo? Sí, en Macs con memoria unificada de 16 GB o más; no aplica a GPUs NVIDIA de consumo por el formato MLX.
- Opciones de despliegue: mlx-vlm (runtime principal), MLX de Apple; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta build.
- Latencia y throughput: no disponibles en la información proporcionada; la presencia del drafter MTP sugiere optimización mediante decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Licencia | Runtime |
|---|---|---|---|---|---|
| Gemma 4 12B it MLX (esta ficha) | 12B | no disponible | Texto, vision, audio (any-to-any) | Apache 2.0 | MLX (Apple Silicon) |
| Gemma 4 12B it (original Google) | 12B | no disponible | Texto, vision, audio | Apache 2.0 | PyTorch / Transformers |
| Alternativas de 12B open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para establecer comparativas cuantitativas con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Esta build no es un lanzamiento oficial de Google; Moonbox la redistribuye y la calidad depende de su proceso de cuantización.
- La cuantización 6bit introduce una divergencia KL de 0,098 nats y un top-1 del 93,4 %, lo que puede degradar tareas sensibles a la precisión.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a CPUs x86 sin reconversión.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que impide garantizar comportamiento multilingüe o conversaciones de contexto largo.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de sesgo en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el license_link remite a la licencia de Gemma 4 de Google, que conviene revisar para cumplir términos adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de la build.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/gemma-4-12B-it-MLX
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper referenciado (arXiv): https://arxiv.org/abs/2607.02770
