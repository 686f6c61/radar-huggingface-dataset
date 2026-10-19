# Kazmania/SmolLM2-135M-Instruct

## Resumen

SmolLM2-135M-Instruct es un modelo de lenguaje decoder-only de 134.515.008 parámetros (aproximadamente 135M), desarrollado originalmente por HuggingFaceTB dentro de la familia SmolLM2, que también incluye variantes de 360M y 1.7B. El repositorio analizado, `Kazmania/SmolLM2-135M-Instruct`, es una réplica del checkpoint oficial: conserva la licencia Apache 2.0, la model card original y los pesos en safetensors, y añade artefactos ONNX y compatibilidad con transformers.js para ejecución en navegador. Resuelve el problema de disponer de un modelo conversacional que corre en hardware mínimo (CPU, móvil, edge) sin GPU dedicada.

Su relevancia es la de un caso extremo de eficiencia: se entrenó sobre 2 billones de tokens (FineWeb-Edu, DCLM, The Stack y datasets filtrados propios) y se alineó con SFT más DPO sobre UltraFeedback. Con 135M de parámetros ocupa menos de 300 MB en bfloat16 y menos de 100 MB en cuantización de 4 bits, lo que lo sitúa en la categoría de modelos "on-device" para tareas acotadas: reescritura, resumen, clasificación y generación de respuestas cortas en inglés.

Conviene señalar que el repositorio de Kazmania no documenta ningún fine-tuning adicional, tiene 0 descargas y 0 likes, y su model card es una copia literal de la del modelo base. Por tanto, los benchmarks que se citan a continuación corresponden al modelo upstream `HuggingFaceTB/SmolLM2-135M-Instruct` y no han sido verificados de forma independiente sobre esta copia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), precisión de entrenamiento bfloat16 |
| Parametros totales | 134.515.008 (según safetensors del repositorio) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 8192 tokens (el autor denomina al modelo base "SmolLM2-135M-8k" en la tabla de evaluación); no se detalla de forma explícita en la model card del repositorio |
| Tipos de cuantizacion | No disponible en el repositorio (solo se publican safetensors y ONNX); al ser un transformer Llama estándar admite conversión a GGUF, int8 e int4 con herramientas externas |
| Idiomas soportados | Inglés (`en`) declarado en la model card; no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX; compatible con transformers.js y con text-generation-inference |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only tipo Llama, con atención causal estándar y sin innovaciones de atención lineal ni estados recurrentes. El preentrenamiento del modelo base consumió 2 billones de tokens en bfloat16 sobre un clúster de 64 GPU H100, usando el framework interno `nanotron` de Hugging Face. La composición del corpus combina FineWeb-Edu, DCLM y The Stack, junto con datasets filtrados propios que el autor anunció que publicaría. No se especifican en la información disponible el número de capas, la dimensión oculta ni el número de cabezas de atención.

Sobre el modelo base se aplicó un proceso de alineación en dos fases: primero supervised fine-tuning (SFT) con una mezcla de datasets públicos y propios (publicados como `HuggingFaceTB/smol-smoltalk`), y después Direct Preference Optimization (DPO) usando `HuggingFaceH4/ultrafeedback_binarized`. La model card menciona también datasets de Argilla como `Synth-APIGen-v0.1`, pero atribuye explícitamente la capacidad de function calling a la variante de 1.7B, no a la de 135M. El código de ajuste está disponible en el repositorio `alignment-handbook` de Hugging Face.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`apply_chat_template`), incluyendo rol de sistema.
- Instrucciones simples y de un solo turno: el modelo está entrenado para seguir formatos de prompt estructurados, no texto plano.
- Reescritura de texto y resumen, capacidades que la model card cita de forma explícita para la versión instruct.
- Comprensión lectora y respuesta a preguntas de conocimiento general de alcance limitado (MMLU cloze de 29,3 y BBH de 28,2 en la evaluación del autor).
- Razonamiento aritmético muy limitado: GSM8K 5-shot de 1,4, prácticamente a nivel de azar.
- Ejecución en navegador mediante transformers.js y ONNX Runtime Web, y en CPU sin GPU.
- No soporta de forma fiable tool calling ni function calling: la model card solo lo atribuye al modelo de 1.7B.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.
- Multilingüismo: no declarado; el modelo está entrenado y evaluado únicamente en inglés.

## Casos de uso

- Autocompletado y asistencia de escritura en el navegador: al publicarse en ONNX y con soporte de transformers.js, el modelo puede ejecutarse íntegramente en cliente sin enviar texto a un servidor, lo que encaja en herramientas de escritura con requisitos de privacidad.
- Clasificación y etiquetado masivo de textos cortos: con 135M de parámetros el coste por token es mínimo, lo que permite procesar grandes volúmenes de titulares, reseñas o tickets en pipelines batch donde la precisión exigida es moderada.
- Detección de intenciones en asistentes de voz on-device: la latencia reducida y el tamaño inferior a 300 MB permiten integrarlo en dispositivos embebidos para enrutar consultas hacia modelos mayores.
- Generación de respuestas borrador en atención al cliente: útil como primer paso de una cadena en la que un modelo mayor o una base de conocimiento verifica y reescribe la salida; no es adecuado como respuesta final sin supervisión.
- Prototipado y pruebas de regresión de pipelines de IA: su huella mínima permite incluirlo en tests de CI/CD que validen plantillas de chat, tokenizadores y flujos de inferencia antes de desplegar modelos grandes.
- Generación de datos sintéticos de formato corto: creación de pares instrucción-respuesta breves para aumentar datasets de entrenamiento o para tareas de aumento de datos en inglés.
- Docencia e investigación en alineación: al existir recetas públicas de SFT y DPO sobre este checkpoint, sirve como banco de pruebas de bajo coste para experimentos de preferencias y evaluación con lighteval.
- Automatización de operaciones en edge: resumen de logs o extracción de campos en dispositivos sin GPU, donde el consumo energético es un requisito crítico.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo upstream (`HuggingFaceTB/SmolLM2-135M-Instruct`), evaluados en zero-shot salvo indicación, con lighteval. No han sido verificados de forma independiente sobre el repositorio de Kazmania.

| Métrica | SmolLM2-135M-Instruct | SmolLM-135M-Instruct (predecesor) |
|---|---|---|
| IFEval (media prompt/inst) | 29,9 | 17,2 |
| MT-Bench | 19,8 | 16,8 |
| HellaSwag | 40,9 | 38,9 |
| ARC (media) | 37,3 | 33,9 |
| PIQA | 66,3 | 64,0 |
| MMLU (cloze) | 29,3 | 28,3 |
| BBH (3-shot) | 28,2 | 25,2 |
| GSM8K (5-shot) | 1,4 | 1,4 |

Para el modelo base preentrenado, la model card reporta HellaSwag 42,1, ARC 43,9, PIQA 68,4, MMLU cloze 31,5, CommonsenseQA 33,9, TriviaQA 4,1, Winogrande 51,3, OpenBookQA 34,6 y GSM8K 5-shot 1,4. No se han publicado cifras de throughput ni de latencia en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 540 MB en fp32, 270 MB en bfloat16/fp16, 135 MB en int8 y 70-90 MB en cuantización de 4 bits, incluyendo overhead de activaciones y caché KV para contextos cortos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, GTX 1650 e incluso iGPU con memoria compartida.
- Funciona en CPU x86 y ARM sin GPU; es viable en Raspberry Pi 4/5 y en dispositivos móviles de gama media.
- Ejecución en navegador mediante transformers.js con los artefactos ONNX del repositorio.
- Opciones de despliegue: transformers (Python), TRL CLI (`trl chat`), text-generation-inference (etiqueta presente en el repositorio), transformers.js, y llama.cpp/Ollama tras convertir los pesos a GGUF (no se distribuye GGUF en este repositorio).
- El tamaño total del repositorio es de 1,8 GB, debido a la coexistencia de safetensors y ONNX.
- Latencia y throughput: no disponible; no se han publicado mediciones oficiales en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kazmania/SmolLM2-135M-Instruct | 134,5M | 8192 tokens (según denominación del modelo base) | Apache 2.0 | Réplica del oficial; añade ONNX y transformers.js; 0 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8192 tokens | Apache 2.0 | Checkpoint original con model card, recetas y mantenimiento activo |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | No disponible en la información | Apache 2.0 | Predecesor; IFEval 17,2 frente a 29,9 y MT-Bench 16,8 frente a 19,8 |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8192 tokens (misma familia) | Apache 2.0 | Misma receta de entrenamiento con más capacidad; cifras de benchmarks no disponibles en la información |
| Qwen2.5-0.5B-Instruct | ~0,49B | 32 768 tokens (dato público del modelo, no verificado aquí) | Apache 2.0 | Alternativa de tamaño superior con contexto mucho mayor y cobertura multilingüe declarada |

La comparación con Qwen2.5-0.5B-Instruct se basa en datos públicos del modelo y no en una evaluación conjunta; no se han publicado resultados comparativos directos en la información disponible. Frente al checkpoint original de HuggingFaceTB, la única diferencia verificable en este repositorio es la presencia de artefactos ONNX y la ausencia de mantenimiento (0 descargas, 0 likes, sin discusión asociada).

## Limitaciones y advertencias

- Repositorio réplica sin tracción: 0 descargas y 0 likes, creado y actualizado en la misma fecha, con la model card copiada del modelo original. No hay evidencia de fine-tuning, evaluación o mantenimiento por parte de Kazmania.
- Riesgo alto de alucinación: con MMLU cloze de 29,3 y BBH de 28,2, el modelo no es fiable como fuente de información factual. La propia model card lo describe como herramienta asistiva, no como referencia.
- Razonamiento aritmético prácticamente nulo: GSM8K de 1,4 en 5-shot indica que no debe usarse para cálculo o problemas matemáticos.
- Solo inglés: no se declaran capacidades multilingües. En castellano producirá respuestas degradadas, mezcla de idiomas o texto incoherente.
- Sesgos heredados del corpus de preentrenamiento (FineWeb-Edu, DCLM, The Stack): no se documenta ninguna mitigación específica más allá de DPO sobre UltraFeedback.
- Function calling no soportado de forma fiable en esta variante de 135M; solo se atribuye al modelo de 1.7B.
- Contexto efectivo limitado: aunque la ventana sea de 8192 tokens, la calidad de la atención decae en secuencias largas en modelos de este tamaño; no se han publicado evaluaciones de contexto largo.
- Licencia Apache 2.0 permite uso comercial y modificaciones, pero se recomienda conservar la atribución a HuggingFaceTB y no presentar esta réplica como un modelo distinto.
- En producción, conviene usar el checkpoint oficial `HuggingFaceTB/SmolLM2-135M-Instruct` en lugar de réplicas de terceros, salvo que se necesiten específicamente los artefactos ONNX aquí incluidos, y en ese caso verificar la integridad de los pesos.

## Enlaces

- Repositorio analizado: https://huggingface.co/Kazmania/SmolLM2-135M-Instruct
- Modelo original: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Código de ajuste (alignment-handbook): https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm2
- Dataset de preferencias UltraFeedback: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset Synth-APIGen-v0.1 de Argilla: https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
- Framework de entrenamiento nanotron: https://github.com/huggingface/nanotron/tree/main
- Framework de evaluación lighteval: https://github.com/huggingface/lighteval
- Guía de ejecución local: https://aiindigo.com/tutorials/getting-started-with-smollm2-135m-instruct-run-a-capable-llm-on-any-device
- Guía de despliegue: https://aiindigo.com/tutorials/getting-started-with-smollm2-135m-instruct-run-ai-locally-in-seconds
- Ficha en llm.co: https://llm.co/llms/smollm2-135m-instruct
