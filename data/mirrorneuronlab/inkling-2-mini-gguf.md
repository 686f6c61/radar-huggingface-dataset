# MirrorNeuronLab/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini GGUF es la conversión a formato GGUF del checkpoint original Inkling 2 Mini desarrollado por Thinking Machines Lab. MirrorNeuronLab ha realizado la conversión de forma independiente, decodificando los pesos de expertos empaquetados en NVFP4 y MXFP8 a un intermedio BF16 en GGUF, y publicando varias cuantizaciones optimizadas para llama.cpp y Docker Model Runner. El modelo base cuenta con 26.070.385.152 parámetros (aproximadamente 26.000 millones) y es un modelo multimodal de tipo image-text-to-text.

La relevancia de esta ficha radica en que el checkpoint original no se distribuye en un formato directamente consumible por herramientas de inferencia local estándar. Esta conversión permite ejecutar el modelo con llama.cpp, Docker Model Runner y backends compatibles, incluyendo variantes de muy baja precisión (IQ1_M e IQ1_S con medias de 2,25 y 2,13 bits por peso) que reducen el peso a 7,35 GB y 6,96 GB respectivamente, frente a los 17,48 GB de la variante Q4_K_M. La arquitectura interna del modelo base (tipo de transformer, mecanismo de atención, datos de entrenamiento) no se detalla en la información disponible; la model card de esta conversión remite a la model card original de Thinking Machines Lab para capacidades y limitaciones.

La licencia es Apache 2.0 tanto para el modelo original como para esta conversión. El repositorio ocupa 32,4 GB e incluye el proyector multimodal BF16 (642 MB) compartido entre todas las variantes. La conversión excluye el modelo borrador MTP opcional del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles internos no publicados en esta ficha) |
| Parametros totales | 26.070.385.152 (~26,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; las validaciones se realizaron a 4.096 tokens |
| Tipos de cuantizacion | Q4_K_M (4 bits, preset estándar sin importance matrix), AD-IQ1_M (media 2,25 bits/peso), AD-IQ1_S (media 2,13 bits/peso); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); cuantizaciones derivadas de un intermedio BF16 GGUF |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base (tipo de transformer, uso de MoE, mecanismo de atención o estrategia de decodificación). Lo que sí se documenta es el proceso de conversión: el checkpoint original de Thinking Machines Lab empaqueta los pesos de los expertos en NVFP4 y MXFP8, y MirrorNeuronLab los decodificó a un intermedio BF16 en GGUF antes de aplicar las cuantizaciones. La mención explícita a "expert weights" (pesos de expertos) y a "expert gate and up weights" / "expert down weights" en las recetas de cuantización sugiere una arquitectura con componentes tipo mezcla de expertos, aunque el número de expertos, el enrutamiento y los parámetros activos no se detallan.

Las variantes AD (IQ1_M e IQ1_S) se cuantizaron a partir de los mismos pesos BF16 usando la matriz de calibración publicada por AtomicChat y reglas por tensor adaptadas a llama.cpp upstream. Los pesos gate y up de los expertos usan IQ1_M o IQ1_S, mientras que los pesos down de los expertos usan bloques Q2_0 estándar con escalas ponderadas por calibración. Los controladores del bucle (loop controllers) se mantienen en F32. La variante Q4_K_M usa el preset estándar de llama.cpp sin importance matrix. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y validado con prompts de texto en Docker Model Runner.
- Entrada de imágenes: pipeline `image-text-to-text`; el proyector multimodal BF16 (`mmproj-Inkling-2-Mini-BF16.gguf`) habilita la entrada de imágenes vía el tipo de contenido `image_url` en el endpoint compatible con OpenAI de Docker Model Runner.
- Razonamiento aritmético básico: validado con el prompt de ejemplo "What is 17 multiplied by 23?" en la documentación.
- Soporte de bucle de inferencia específico (`inkling2_loop`): requiere builds de llama.cpp con soporte para esta arquitectura (b12600 o superior).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local con Docker Model Runner: el modelo se puede ejecutar con `docker model pull hf.co/MirrorNeuronLab/Inkling-2-Mini-GGUF:Q4_K_M` y `docker model run`, lo que facilita probar el modelo en entornos con Docker sin gestionar manualmente binarios de llama.cpp. Es adecuado para equipos que ya usan Docker Model Runner como capa de inferencia.
- Inferencia en GPU de consumo con cuantización extrema: las variantes AD-IQ1_M (7,99 GB con visión) e IQ1_S (7,61 GB con visión) permiten cargar un modelo de ~26 mil millones de parámetros en GPUs con 8-12 GB de VRAM, a costa de una precisión reducida (2,13-2,25 bits por peso). Útil para prototipado y pruebas de concepto en estaciones de trabajo modestas.
- Procesamiento de documentos con imagen y texto: gracias al proyector BF16 y al pipeline image-text-to-text, se puede usar para tareas de descripción de imágenes o preguntas sobre contenido visual, enviando la imagen como `image_url` en el endpoint compatible con OpenAI.
- Servidor de chat compatible con OpenAI: `llama-server -hf MirrorNeuronLab/Inkling-2-Mini-GGUF:Q4_K_M --jinja -c 4096` expone una API de chat que se puede integrar en aplicaciones existentes que ya consumen la API de OpenAI, sin reescribir el cliente.
- Validación y benchmarking de cuantizaciones: el repositorio incluye archivos de procedencia, SHA256SUMS y scripts de validación, lo que lo hace adecuado para reproducir experimentos de cuantización con matrices de calibración e importance matrix.
- Investigación sobre cuantización de precisión ultra-baja: las recetas AD (IQ1_M/IQ1_S con Q2_0 en pesos down y controladores en F32) sirven como referencia para estudiar el impacto de la cuantización agresiva en modelos multimodales de ~26B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta pruebas de humo (smoke tests) de texto e imagen en CUDA a 4.096 tokens de contexto sobre Docker Model Runner v1.2.9 y una NVIDIA GB10, sin métricas de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo, sin overhead de runtime):
  - AD-IQ1_S: 6,96 GB (7,61 GB con proyector de visión).
  - AD-IQ1_M: 7,35 GB (7,99 GB con visión).
  - Q4_K_M: 17,48 GB (18,12 GB con visión).
- GPU recomendadas: NVIDIA GB10 (validada oficialmente para Q4_K_M y variantes AD en CUDA); cualquier GPU NVIDIA con CUDA y suficiente VRAM para la variante elegida.
- ¿Cabe en GPU de consumo? Las variantes AD (IQ1_S e IQ1_M) caben en GPUs de 8-12 GB de VRAM. La variante Q4_K_M requiere aproximadamente 18 GB, por lo que encaja en GPUs de 24 GB (RTX 3090/4090) o superiores.
- Opciones de despliegue: llama.cpp (build b12600 o superior con soporte `inkling2_loop`), Docker Model Runner (v1.2.9 validado; backend llama.cpp b12600+), llama-server con flag `--jinja`. En Apple Silicon se requiere el motor Metal nativo de Docker Desktop con llama.cpp b12600 o superior, que incluye kernels Metal para multiplicaciones de matrices de expertos IQ1_M, IQ1_S y Q2_0.
- Latencia y throughput: no disponibles. La validación documentada se limita a pruebas de humo a 4.096 tokens de contexto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de la misma categoría o tamaño, por lo que no es posible establecer una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- La información sobre sesgos, alucinación y comportamiento del modelo base no está incluida en esta model card; se remite a la model card original de Thinking Machines Lab.
- Las variantes AD operan a 2,13-2,25 bits por peso, lo que implica una pérdida de precisión significativa frente a Q4_K_M; no se han publicado métricas de degradación de calidad.
- El contexto validado es de 4.096 tokens; no se documenta la longitud de contexto nativa del modelo ni su comportamiento más allá de esa ventana.
- El soporte de la arquitectura `inkling2_loop` requiere builds específicos de llama.cpp (b12600 o superior); versiones anteriores no cargarán el modelo.
- En Apple Silicon se requiere el motor Metal nativo de Docker Desktop con llama.cpp b12600+; la validación oficial de hardware se realizó únicamente en NVIDIA CUDA.
- Docker Model Runner v1.2.9 deja en blanco las columnas de resumen en `docker model ls` para los archivos AD; los tamaños medidos se proporcionan en la tabla de la model card.
- La conversión excluye el modelo borrador MTP opcional del checkpoint original, por lo que no se dispone de decodificación especulativa con ese borrador en esta release.
- Licencia Apache 2.0 para el modelo y la conversión, pero el uso está sujeto además a la Política de Uso Aceptable de Thinking Machines Lab, que puede imponer restricciones adicionales al uso comercial.
- Los idiomas soportados no están documentados; no se puede asumir cobertura multilingüe sin verificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MirrorNeuronLab/Inkling-2-Mini-GGUF
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint original (revisión concreta): https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Calibración y recetas de AtomicChat: https://huggingface.co/datasets/AtomicChat/Inkling-2-Mini-GGUF-metrics/tree/298cd819ae69d1f9268b70c3aa47b5ef3832ff7d
- Release de llama.cpp b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Kernel Metal para multiplicaciones de matrices (b12600): https://github.com/ggml-org/llama.cpp/blob/b12600/ggml/src/ggml-metal/kernels/mul_mm.metal#L963
- Documentación de Docker Model Runner (motores de inferencia): https://docs.docker.com/ai/model-runner/inference-engines/
- Referencia de API de Docker Model Runner: https://docs.docker.com/ai/model-runner/api-reference/
- Política de Uso Aceptable de Thinking Machines Lab: https://thinkingmachines.ai/model-acceptable-use-policy/
- Archivos del repositorio: SHA256SUMS, PROVENANCE.json, PUBLISHED_DMR_VALIDATION.json, DMR_VALIDATION.json, AD_PUBLISHED_DMR_VALIDATION.json, AD_DMR_VALIDATION.json, reproduce/start-docker-runner.sh, reproduce/q2_0-imatrix.patch, reproduce/LICENSE.llama.cpp, LICENSE
