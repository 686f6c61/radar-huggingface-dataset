# autotrust/GEV-26B-Decide-NVFP4

## Resumen

GEV-26B-Decide-NVFP4 es una versión cuantizada del modelo de decisión autotrust/GEV-26B-Decide, desarrollada por autotrust sobre la arquitectura Gemma 4 con mezcla de expertos (MoE) y capacidades multimodales. Su objetivo no es la generación de texto libre, sino la clasificación y la toma de decisiones con probabilidades calibradas: el modelo se declara como «decision model» dentro de un marco propio de evaluación denominado Decision Index. La publicación de esta variante responde a un problema muy concreto de despliegue: reducir el peso del modelo de 49,5 GB en bf16 a 18 GB de descarga y 17,1 GiB en GPU, manteniendo el rendimiento.

La innovación clave es que solo se cuantizan a NVFP4 los 3.840 MLP de expertos enrutados (30 capas × 128 expertos), que concentran la mayor parte de los pesos. El resto del modelo (atención, MLP denso, routers, torre de visión, lm_head, adaptador System 1, cabeza de decisión y temperaturas) permanece en bf16 sin cambios, lo que permite reutilizar el mismo adaptador LoRA y evitar reentrenamiento. Según la información disponible, el resultado mantiene GPQA Diamond y HLE dentro del ruido estadístico respecto a la versión bf16.

El interés actual del modelo reside en que demuestra un patrón de cuantización selectiva por expertos que hace viable ejecutar un MoE multimodal en GPUs de 24 GB, con soporte nativo de vLLM y kernels NVFP4 para arquitecturas SM100 y SM12x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) multimodal, derivada de Gemma 4 (base nvidia/Gemma-4-26B-A4B); 30 capas × 128 expertos = 3.840 MLP de expertos enrutados |
| Parametros totales | 14.386.943.566 segun safetensors; el nombre comercial indica "26B" y la model card menciona 24 B de parametros en los expertos (discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no disponible (el sufijo A4B del modelo base sugiere del orden de 4 B, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa MAX_MODEL_LEN=32768) |
| Tipos de cuantizacion | NVFP4 en expertos enrutados: formato FP4 E2M1 en grupos de 16 con escala FP8 E4M3 por grupo y escala FP32 por tensor; el resto del modelo en bf16; tag "8-bit" presente en el repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors con layout NVFP4 de ModelOpt (quant_method: modelopt), cargable por vLLM sin flags adicionales |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 4 en su variante multimodal de mezcla de expertos, con 30 capas y 128 expertos enrutados por capa. La cuantización NVFP4 se aplica exclusivamente a las proyecciones gate, up y down de cada experto; gate y up comparten una única escala de tensor porque vLLM las fusiona. Las activaciones de los expertos utilizan escalas estáticas calibradas sobre 3.072 prompts System 1 procedentes de los propios splits de calibración de GEV. La lista de exclusión de cuantización replica la de nvidia/Gemma-4-26B-A4B-NVFP4, de modo que el checkpoint es compatible con el cargador estándar de vLLM.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card sí describe dos modos de inferencia diferenciados: System 1 (sin razonamiento explícito) y System 2 o «adaptive thinking», que se activa selectivamente en el área de Knowledge & Reasoning mientras que las demás áreas operan en System 1. El modelo incorpora además una cabeza de decisión con probabilidades calibradas y un adaptador LoRA que no toca los expertos, por lo que sigue siendo válido tras la cuantización. Como innovación destacable, la cuantización selectiva por expertos evita reentrenar el adaptador y conserva la precisión del resto de componentes.

## Capacidades

- Clasificación de texto y toma de decisiones tipadas (typed decisions) con probabilidades calibradas, declarada como pipeline principal text-classification.
- Modos System 1 y System 2 con «adaptive thinking»: el razonamiento extendido se reserva al área de Knowledge & Reasoning y se desactiva en el resto.
- Capacidad multimodal de tipo image-text-to-text, con torre de visión integrada.
- Puntuación y elección (choice / score) dentro del marco Jev/Noul, orientado a decisiones cuantificables.
- Soporte de tareas de Tools & Automation, lo que implica capacidad de manejo de herramientas y automatización (puntuada con 0,697 en el Decision Index).
- Capacidades de Retrieval & Classification (0,679) y de Language (0,636) según las áreas del Decision Index.
- Integración con LoRA: dispone de adapter_vllm/ y de un parche para LoRA sobre el lm_head atado de Gemma-4.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el área de Tools & Automation se evalúa.
- Capacidades de agentes multi-paso: no se detallan explícitamente en la información disponible.
- Idiomas: solo inglés.

## Casos de uso

- Clasificación de decisiones en producción: el modelo devuelve decisiones tipadas con probabilidades calibradas, lo que permite fijar umbrales y auditar el nivel de confianza en lugar de depender de texto libre.
- Enrutado y triaje de solicitudes: con 3.840 expertos y un modo System 1 rápido, se puede clasificar y derivar peticiones entrantes (soporte, incidencias, categorías) con bajo coste de razonamiento.
- Evaluación automatizada con criterios cuantificables: el Decision Index y el pipeline de scoring permiten medir sistemas de IA mediante preguntas de opción múltiple y tareas de clasificación.
- Automatización con herramientas (Tools & Automation): el área específica del índice sugiere su uso como selector de acciones o validación de pasos en flujos con herramientas, aunque no se detalla el soporte nativo de function calling.
- Análisis multimodal de documentos: su naturaleza image-text-to-text permite combinar imagen y texto en tareas de clasificación o decisión, por ejemplo en inspección de documentos o paneles.
- Despliegue en hardware de gama alta de consumo: al ocupar 17,1 GiB de pesos, cabe en una GPU de 24 GB con contexto corto, lo que habilita prototipos y servicios de baja concurrencia en estaciones de trabajo.
- Investigación sobre cuantización selectiva: sirve como referencia reproducible para estudiar el impacto de cuantizar solo los expertos de un MoE frente a cuantizar el modelo completo.
- Moderación o filtrado semántico: la combinación de clasificación calibrada y modo sin razonamiento encaja en pipelines de alta frecuencia donde la latencia importa más que la profundidad.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (el valor del model-index corresponde a los pesos bf16 de GEV-26B-Decide):

| Benchmark / metrica | GEV-26B-Decide (bf16) | GEV-26B-Decide-NVFP4 | Notas |
|---|---:|---:|---|
| Decision Index 0.2.1 (balanced skill) | 62,48 | no disponible (referido a bf16) | Dato del model-index, no verificado |
| Decision Index 0.2.1 (balanced raw) | 70,66 | no disponible | — |
| Decision Index 0.2.1 (breadth skill) | 62,00 | no disponible | — |
| GPQA Diamond, System 1 (198 preguntas) | 43,9 % | 44,9 % | Diferencia dentro del ruido (±7 puntos) |
| HLE text multiple choice, System 1 (513 preguntas) | 8,4 % | 9,7 % | Diferencia dentro del ruido |
| TypeSafe Jev 1.13 (board) | — | 57,91 | Referencia comparativa del tablero |

Desglose por área del Decision Index (GEV-26B-Decide con adaptive thinking):

| Area (skill) | Valor |
|---|---:|
| Knowledge & Reasoning | 0,602 |
| Language | 0,636 |
| Retrieval & Classification | 0,679 |
| Tools & Automation | 0,697 |
| Arts & Taste | 0,415 |

## Requisitos de hardware

- VRAM para los pesos: 17,1 GiB en vLLM (NVFP4); 51,1 GiB para la versión bf16 equivalente.
- Descarga de pesos: 18 GB (tamaño del repositorio: 19,1 GB).
- GPUs con soporte nativo W4A4: B200 / B300 / GB200 (SM100) con kernels FlashInfer TRT-LLM NVFP4 MoE, probado en B200.
- GPUs SM12x (RTX PRO 6000, RTX 5090, DGX Spark): W4A4 nativo con kernels CUTLASS / FlashInfer CUTLASS FP4 MoE, no probado por el autor.
- GPUs SM80–90 (H100, H200, A100): ejecución mediante Marlin W4A16 (pesos en FP4, activaciones en bf16), no probada por el autor.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con contexto corto; recomendable RTX 5090 (32 GB) o GPU de 48 GB para contextos largos y alta concurrencia.
- Ajuste de memoria: se debe configurar --gpu-memory-utilization y MAX_MODEL_LEN (el ejemplo usa 32768).
- Despliegue: vLLM (serve.sh, serve_decide.py) con patches/vllm-gemma4-lm-head-lora.patch, probado con una build de desarrollo de vLLM de septiembre de 2026. La ruta transformers + peft carga pesos bf16 y debe usar el repositorio bf16, no este checkpoint.
- Latencia y throughput: no disponible.
- Particularidad de prompt: Gemma-4 lee los prompts de System 1 tras <bos>; en /v1/completions hay que empezar con <bos> y pasar top_k: 0 y top_p: 1.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index 0.2.1 | Cuantizacion / memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| autotrust/GEV-26B-Decide-NVFP4 | 14,4 B (nominal 26B/A4B) | no disponible | 62,48 (referido a bf16) | NVFP4, 17,1 GiB | apache-2.0 (link a licencia Gemma 4) | Hugging Face |
| autotrust/GEV-26B-Decide (bf16) | 14,4 B (nominal) | no disponible | 62,48 | bf16, 51,1 GiB | apache-2.0 | Hugging Face |
| nvidia/Gemma-4-26B-A4B-NVFP4 | 26B/A4B (segun su nombre) | no disponible | no disponible | NVFP4 (misma exclusion list) | no disponible | Hugging Face |
| TypeSafe Jev 1.13 | no disponible | no disponible | 57,91 | no disponible | no disponible | Tablero (board) |

No se dispone de datos de benchmarks comparables para nvidia/Gemma-4-26B-A4B-NVFP4 ni para TypeSafe Jev 1.13 en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está declarado para inglés (en); no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Existe una discrepancia no aclarada entre el nombre comercial («26B»), la mención de 24 B de parámetros en los expertos y los 14.386.943.566 parámetros reportados por safetensors; conviene verificar el recuento real antes de dimensionar infraestructura.
- El Decision Index es una métrica propia del autor («own scoring», no una entrada de tablero) y el resultado figura como no verificado (verified: false). No debe tratarse como benchmarking independiente.
- Las diferencias en GPQA Diamond y HLE entre bf16 y NVFP4 están dentro del ruido de ejecución (aproximadamente ±7 puntos en 198 preguntas), por lo que no permiten afirmar una mejora real de precisión con la cuantización.
- La ruta de despliegue NVFP4 depende de vLLM con un parche específico y una build de desarrollo concreta; no es una integración estándar y puede romperse en versiones futuras.
- En GPUs SM80–90 y SM12x los kernels NVFP4 no están probados por el autor, y en estas últimas el funcionamiento se basa en rutas Marlin W4A16 o CUTLASS sin garantía.
- La licencia declarada es apache-2.0, pero se enlaza la licencia de Gemma 4 de Google; al derivar de un modelo Gemma, conviene revisar los términos de uso comercial aplicables antes de desplegarlo en producción.
- El prompt de System 1 requiere un tratamiento específico (<bos>, top_k: 0, top_p: 1.0); usar la API de completions de forma genérica puede degradar los resultados.
- Riesgo de alucinación: no se cuantifica en la información disponible; al ser un modelo orientado a decisión y clasificación, la salida debe validarse con umbrales de confianza, especialmente en las áreas con puntuación baja (Arts & Taste: 0,415).
- Arquitectura MoE: la mezcla de expertos puede introducir variabilidad en el enrutado bajo distribuciones de entrada alejadas de la calibración.
- No se detallan sesgos conocidos ni limitaciones de contexto más allá del ejemplo MAX_MODEL_LEN=32768.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/GEV-26B-Decide-NVFP4
- Modelo base: https://huggingface.co/autotrust/GEV-26B-Decide
- Dataset de resultados del Decision Index: https://huggingface.co/datasets/autotrust/jev-decision-index-results
- Referencia de layout NVFP4: https://huggingface.co/nvidia/Gemma-4-26B-A4B-NVFP4
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper, blog o repositorio adicional: no disponible
