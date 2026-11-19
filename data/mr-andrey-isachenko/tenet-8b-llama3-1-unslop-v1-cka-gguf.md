# mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1-CKA-GGUF

## Resumen

Tenet-8B-Llama3.1-Unslop-v1-CKA-GGUF es un conjunto de pesos GGUF cuantizados del modelo base Tenet-8B-Llama3.1-Unslop-v1, publicado por mr-andrey-isachenko. El autor parte de Llama 3.1 8B y aplica sobre él un proceso de "unslop" (eliminación de respuestas de rechazo y de estilo genérico) junto con abliteración, y después genera cuantizaciones GGUF con una técnica propia denominada CKA-guided mixed-precision, validada en lo que el autor llama H14 / ADR-009.

El interés técnico de esta ficha no está en el modelo base, sino en el método de cuantización: en lugar de aplicar una única precisión a todos los tensores, el autor protege un subconjunto de capas "quirúrgicas" (atención y FFN) a Q8_0 y Q6_K, dejando el resto en Q4_K_M. El objetivo declarado es reducir la amplificación de subespacio y el error L2 en pesos respecto a F16, que en las cuantizaciones Q4_K_M convencionales se dispara hasta 6,4x y ~5,9% respectivamente.

Se publican dos ficheros, ambos de 5,32 GB con 5,290 BPW medios: una variante híbrida con calibración imatrix (i1-CKA-Q4_K_M) y una variante CKA sin imatrix. La variante híbrida es la recomendada por el autor con los mejores valores de PPL (9,0533) y KLD medio (0,01656) de la tabla de auditoría. La licencia es Apache 2.0 y el pipeline es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de Llama 3.1 (8B) |
| Parametros totales | 8B (modelo base; el fichero GGUF ocupa 5,32 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base es Llama 3.1, pero la model card no lo declara) |
| Tipos de cuantizacion | GGUF mixed-precision: Q8_0 / Q6_K / Q4_K_M (CKA-guided); variante con imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es una adaptación de Llama 3.1 8B, un transformer decoder-only con atención por causal masking estándar. Sobre esa base el autor aplica dos transformaciones: "unslop", orientado a reducir respuestas de rechazo y estilo de plantilla, y abliteración (eliminación de la dirección de rechazo en el espacio de activaciones). La model card no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO; esos datos no están disponibles.

La innovación documentada está en la cuantización. El método CKA-guided mixed-precision protege las capas de frontera (0 y 31) y las ocho capas quirúrgicas superiores (3, 4, 9, 10, 11, 14, 15, 18) en Q8_0, y las ocho capas quirúrgicas restantes (19, 20, 24, 25, 26, 27, 28, 29) en Q6_K, dejando el resto en Q4_K_M. Según la auditoría H14, esto baja la amplificación de subespacio de 6,402x a 3,012x, el error L2 relativo de pesos de 5,83–5,91% a 1,17%, y el máximo de deriva de fila a 0,00303. La variante i1 combina además la calibración imatrix de mradermacher con la precisión mixta CKA.

## Capacidades

- Generación de texto en inglés (el modelo base Llama 3.1 es multilingüe, pero la model card no declara idiomas soportados).
- Tool calling / function calling: la auditoría incluye tareas de SQL de solo lectura (sql_readonly) y el quickstart pide un "DuckDB SQL tool call", lo que indica soporte práctico de formato de llamada a herramienta.
- Razonamiento multi-paso y uso en agentes: no documentado explícitamente en la model card.
- Matemáticas y código: no hay benchmarks publicados para estas capacidades en la información disponible.
- Visión y audio: no disponibles (modelo solo texto).
- Modo "thinking": no disponible.
- Comportamiento "unslop": el autor reporta una tasa de slop/rechazo de 0,0417 en la variante i1-CKA-Q4_K_M y de 0,0833 en la variante CKA sin imatrix, frente a 0,0417 en F16.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con estilo menos plantillero gracias al proceso "unslop", reduciendo respuestas de rechazo. La ventana de contexto no está declarada en la model card, por lo que debe validarse contra el modelo base antes de desplegar.
- Generación de código en producción: soporta tool calling y su variante recomendada supera las 6/6 tareas de SQL de solo lectura en la auditoría del autor, lo que lo hace apto para pipelines de consulta a bases de datos (por ejemplo DuckDB) integrados en CI/CD.
- Agentes de consulta a bases de datos: el quickstart del autor demuestra la generación de una llamada SQL para "failed logins by source IP", un caso realista de agentes de operaciones de seguridad.
- Inferencia en hardware de consumo: al ser GGUF de 5,32 GB con 5,290 BPW, cabe en GPUs consumer de 8 GB o más y en Apple Silicon (la auditoría se ejecutó en un M4 Pro con llama.cpp), lo que permite prototipado local sin GPU de datacenter.
- Evaluación de técnicas de cuantización: el modelo sirve como banco de pruebas reproducible para comparar Q4_K_M, i1, IQ4_XS y CKA en PPL, KLD y tareas SQL, con métricas publicadas en la model card.
- Despliegue en entornos con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales internos sin las restricciones de la licencia Llama original, aunque conviene revisar la procedencia del modelo base.
- Filtrado de contenido sensible o moderación: no es un caso de uso recomendado, dado que el proceso de abliteración y unslop reduce las respuestas de rechazo, lo que puede degradar salvaguardas.

## Benchmarks y rendimiento

La model card publica una auditoría interna (H14 / ADR-009) sobre Apple M4 Pro con llama.cpp v0.5.0 build 11146, con PPL y KLD sobre ventanas de 7x512, además de tareas de unslop, ifeval_subset y sql_readonly. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no hay resultados de terceros.

| Variante | Tamano (GB) | BPW medio | Amplif. subespacio vs F16 | Deriva max fila | Error L2 pesos | PPL (7x512) | KLD medio vs F16 | Top-1 igual | Tasa slop/rechazo | Unslop pass | SQL RO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| f16 | 16,07 | 16,001 | 1,000x | 0,00000 | 0,00000 | 9,0410 | 0,00000 | 100,00% | 0,0417 | 0,5833 | 1,0000 |
| q4_k_m | 4,92 | 4,894 | 6,402x | 0,00795 | 0,05827 | 9,1798 | 0,02479 | 93,11% | 0,0833 | 0,5000 | 1,0000 |
| i1_q4_k_m | 4,92 | 4,894 | 6,360x | 0,00946 | 0,05911 | 9,0749 | 0,01947 | 93,44% | 0,0000 | 0,5833 | 1,0000 |
| i1_iq4_xs | 4,45 | 4,423 | 12,374x | 0,01089 | 0,07725 | 9,1648 | 0,02257 | 91,77% | 0,0000 | 0,5000 | 0,0000 |
| cka_q4_k_m | 5,32 | 5,290 | 3,012x | 0,00526 | 0,01165 | 9,0963 | 0,02048 | 93,28% | 0,0833 | 0,5833 | 1,0000 |
| i1_cka_q4_k_m | 5,32 | 5,290 | 3,012x | 0,00303 | 0,01168 | 9,0533 | 0,01656 | 93,78% | 0,0417 | 0,0833 | 1,0000 |

Lectura de los datos: la variante recomendada i1-CKA-Q4_K_M tiene el mejor PPL (9,0533) y KLD medio (0,01656) de todas las cuantizaciones, y el mejor Top-1 igual (93,78%). La variante IQ4_XS falla las 6/6 tareas SQL por bucles repetitivos de listado de columnas, según el autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,32 GB solo para pesos en Q4_K_M CKA; con overhead de contexto y KV cache, prever 6–8 GB en GPUs de 8 GB.
- GPU recomendadas: RTX 4090, RTX 3090, RTX 4080, A100 y H100 para despliegue de alta concurrencia; la auditoría del autor se ejecutó en Apple M4 Pro (memoria unificada).
- Cabe en GPU consumer: sí, en tarjetas de 8 GB o más (RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.), con `-ngl 99` para offload completo.
- Opciones de despliegue: llama.cpp (probado, con `llama-cli -hf`), y por compatibilidad GGUF también Ollama y otros runners basados en llama.cpp. vLLM y TGI no están documentados para este fichero en la información disponible.
- Latencia y throughput: no disponibles; la model card no publica tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tenet-8B-Llama3.1-Unslop-v1-CKA-GGUF (este) | 8B | no disponible | GGUF CKA mixed-precision, 5,32 GB | Apache 2.0 | Hugging Face |
| Tenet-8B-Llama3.1-Unslop-v1 (base) | 8B | no disponible | FP8 / safetensors | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct (Meta) | 8B | 128K (según Meta) | safetensors, GGUF | Llama 3.1 Community License | Hugging Face, Ollama |
| Qwen 2.5 7B Instruct | 7B | 128K (según Qwen) | safetensors, GGUF | Apache 2.0 | Hugging Face, Ollama |

La comparativa de rendimiento con Llama 3.1 8B Instruct y Qwen 2.5 7B no está disponible en la información proporcionada: la model card solo compara variantes de cuantización del mismo modelo base. La ventaja documentada frente a las cuantizaciones Q4_K_M convencionales es métrica (menor amplificación de subespacio y error L2), no de benchmarks de capacidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Llama 3.1, hereda sesgos del corpus original.
- Riesgo de alucinación: no cuantificado; la auditoría mide PPL y KLD, no fidelidad factual.
- La variante i1-CKA-Q4_K_M obtiene un unslop_pass de 0,0833 frente a 0,5833 de F16, lo que indica que la cuantización híbrida degrada la tasa de éxito en esa tarea concreta pese a tener el mejor PPL.
- La variante IQ4_XS no debe usarse para SQL o tool calling: falla 6/6 tareas por bucles de listado de columnas.
- Idiomas soportados no declarados; no se garantiza calidad fuera del inglés.
- Longitud de contexto no declarada en la model card; debe verificarse antes de usos con contexto largo.
- Licencia Apache 2.0 declarada, pero la procedencia del modelo base (Llama 3.1) y las implicaciones de la licencia original de Meta no se detallan; conviene revisar antes de uso comercial.
- El proceso de abliteración y unslop reduce respuestas de rechazo (tasa 0,0417 frente a 0,0833 en Q4_K_M convencional), lo que puede degradar salvaguardas de seguridad en producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: poca validación externa por terceros.

## Enlaces

- Hugging Face (este fichero GGUF): https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1-CKA-GGUF
- Modelo base FP8 / safetensors: https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1
- Space de auditoría interactiva (FP8 & Abliteration Inspector): https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Código fuente y auditoría H14: https://github.com/mrAndreyIsachenko/tenet-lab
