# llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic-GGUF

## Resumen

`llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic-GGUF` es una cuantizacion en formato GGUF de un modelo derivado de `google/gemma-4-26B-A4B-it`, un transformer de tipo Mixture-of-Experts (MoE) con 25.233.142.046 parametros totales (aproximadamente 26B) y 4B activos por token, segun la nomenclatura A4B del nombre. El autor de la cuantizacion y del proceso de "decensoring" es el usuario independiente llmfan46, que publica mas de 70 modelos derivados en Hugging Face.

El modelo aplica la tecnica de abliteracion mediante la herramienta Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA) sobre las capas 11 a 22 y el componente `attn.o_proj`, con el objetivo de reducir los rechazos del modelo original ante peticiones que considera sensibles. Segun la model card, el resultado es una reduccion del 97% en rechazos (3/100 frente a 100/100 del original) con una divergencia KL de 0.1237 respecto al modelo base.

Es relevante porque ofrece una version sin filtros de rechazo de un modelo multimodal (pipeline `image-text-to-text`) en cuantizaciones GGUF listas para usar con llama.cpp y entornos compatibles, con licencia declarada Apache 2.0 en los metadatos del repositorio, aunque la model card enlaza a la licencia propia de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivado de google/gemma-4-26B-A4B-it |
| Parametros totales | 25.233.142.046 (aprox. 26B) |
| Parametros activos | 4B (segun nomenclatura A4B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4 (lista truncada en la model card) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en metadatos; la model card enlaza a la licencia de Gemma 4 de Google |
| Formato de pesos | GGUF (repo de 197.7 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-26B-A4B-it`, un transformer con arquitectura Mixture-of-Experts de aproximadamente 26B parametros totales y 4B activos por token. Es un modelo multimodal de tipo `image-text-to-text`, es decir, acepta imagenes y texto como entrada. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original.

La innovacion tecnica de esta version concreta es el proceso de abliteracion aplicado con Heretic v1.2.0 y el metodo Arbitrary-Rank Ablation (ARA). Los parametros de ablacion documentados son: `start_layer_index` 11, `end_layer_index` 22, `preserve_good_behavior_weight` 0.5664, `steer_bad_behavior_weight` 0.0032, `overcorrect_relative_weight` 0.9388 y `neighbor_count` 15, actuando sobre el componente `attn.o_proj`. El objetivo es eliminar la direccion de activacion asociada a los rechazos preservando al maximo el comportamiento original, medido mediante divergencia KL (0.1237) y benchmarks (PIQA, MMLU).

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de imagenes y texto combinados (pipeline `image-text-to-text`).
- Razonamiento y conocimiento general, con rendimiento MMLU del 79.99% en esta version.
- Razonamiento fisico y de sentido comun, con PIQA del 91.29%.
- Respuestas con muy baja tasa de rechazo (3/100 en la evaluacion del autor), incluyendo contenido que el modelo original rechazaria.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el modelo sirve como caso de estudio reproducible para medir el impacto de la ablacion de direcciones de rechazo sobre calidad (KL 0.1237) y benchmarks (PIQA -0.77 puntos, MMLU -2.49 puntos).
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas que el modelo original rechazaria, aprovechando la reduccion del 97% en rechazos.
- Evaluacion de robustez y red teaming: usar la version abliterada como contraste frente al modelo original para estudiar diferencias de comportamiento en clasificadores de seguridad y filtros de contenido.
- Despliegue local con llama.cpp u Ollama: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un MoE de 26B con 4B activos en hardware de consumo, con throughput relativamente alto gracias a la activacion dispersa.
- Procesamiento de documentos con imagenes: al ser un modelo image-text-to-text, puede emplearse para extraer y razonar sobre informacion de capturas, diagramas o documentos escaneados en entornos donde no se desea depender de APIs externas.
- Experimentacion con modelos derivados en pipelines de investigacion: util para comparar el efecto de distintas configuraciones de ablacion (parametros de Heretic) sobre tareas de razonamiento fisico y conocimiento general.

## Benchmarks y rendimiento

Resultados publicados en la model card por el autor:

| Benchmark | Modelo original (gemma-4-26B-A4B-it) | Este modelo (Heretic) | Delta |
|---|---|---|---|
| MMLU (7021 preguntas) | 82.48% (5791 correctas) | 79.99% (5616 correctas) | -2.49 pp |
| PIQA (1838 preguntas) | 92.06% (1692 correctas) | 91.29% (1678 correctas) | -0.77 pp |
| Rechazos | 100/100 | 3/100 | -97% |
| Divergencia KL | 0 (por definicion) | 0.1237 | no aplica |

Desglose MMLU por materia (original frente a Heretic): professional_law 70.06% frente a 60.64%; moral_scenarios 70.14% frente a 65.61%; professional_psychology 88.61% frente a 83.23%; moral_disputes 83.33% frente a 78.16%; high_school_psychology 95.56% en ambos; elementary_mathematics 90.76% en ambos.

## Requisitos de hardware

- VRAM estimada: BF16 requiere aproximadamente 50 GB de pesos; Q8_0 alrededor de 27 GB; Q6_K unos 21 GB; Q5_K_M unos 18 GB; Q4_K_M unos 15 GB (estimaciones basadas en 25.2B parametros; no confirmadas en la informacion disponible).
- GPU recomendadas: A100 80 GB o H100 para BF16; RTX 4090 (24 GB) para Q8_0 o Q6_K; GPUs de 16-24 GB para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M y Q5_K_M en tarjetas de 16 GB o mas; el caracter MoE con 4B activos reduce el coste computacional por token aunque los pesos completos deban residir en memoria o RAM.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Heretic GGUF) | 25.2B totales / 4B activos | no disponible | 79.99% | apache-2.0 (metadatos) | GGUF |
| google/gemma-4-26B-A4B-it | 25.2B totales / 4B activos | no disponible | 82.48% | licencia Gemma 4 | safetensors |
| llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic | 25.2B totales / 4B activos | no disponible | no disponible | apache-2.0 (metadatos) | safetensors |

La comparativa con modelos de otros autores de la misma categoria (por ejemplo, otras familias MoE de tamano similar) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteracion degrada el rendimiento: MMLU cae 2.49 puntos y PIQA 0.77 puntos respecto al original, con perdidas notables en professional_law (-9.42 pp) y professional_psychology (-5.38 pp).
- La reduccion de rechazos implica que el modelo puede generar contenido danino, ofensivo o inapropiado; no es adecuado para aplicaciones de cara al publico sin filtros externos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se hereda el del modelo base, potencialmente agravado por la ablacion.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Longitud de contexto no documentada en la informacion proporcionada.
- Ambiguedad de licencia: los metadatos declaran apache-2.0, pero la model card enlaza a la licencia de Gemma 4 de Google, que impone restricciones de uso comercial y de redistribucion. Conviene verificar la licencia aplicable antes de un uso en produccion.
- La model card esta parcialmente truncada (lista de cuantizaciones incompleta) y contiene llamadas a donaciones; no debe interpretarse como documentacion tecnica completa.
- Modelo publicado por un contribuidor independiente, sin garantias de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Metodo Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
