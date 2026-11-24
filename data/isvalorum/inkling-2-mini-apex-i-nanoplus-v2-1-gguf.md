# IsValorum/Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF

## Resumen

Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF es una cuantización GGUF del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario IsValorum bajo la serie "APEX Quantization Series". El modelo base, desarrollado por Thinking Machines, es un modelo multimodal de tipo image-text-to-text con arquitectura `inkling2_loop` y 26.070.385.152 parámetros totales (aproximadamente 26,1 mil millones), según los datos reales de safetensors del repositorio. La cuantización está pensada para su uso con llama.cpp y motores compatibles, con un tamaño de repo de 22,6 GB.

La relevancia de esta ficha radica en que se trata de una cuantización "quirúrgica" con mapa de tensores auditado: el autor aplica precisión mixta (Q4_K, Q6_K, Q8_0 y F32) a distintos componentes según su función, protegiendo en F32 las capas recurrentes y las convoluciones de atención, y usando una matriz de importancia (imatrix) externa de `ggml-org/Inkling-2-Mini-GGUF`. Esto permite ejecutar un modelo de ~26B parámetros multimodales en hardware de consumo con un footprint de 10,23 GiB en el tier NanoPlus.

La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, lo que sitúa al modelo en la categoría de modelos multimodales conversacionales. No obstante, la información pública disponible sobre el modelo base (idiomas, contexto, datos de entrenamiento, benchmarks) es muy limitada en la documentación proporcionada, por lo que varios campos se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (modelo base: thinkingmachines/Inkling-2-Mini) |
| Parametros totales | 26.070.385.152 (~26,1B) |
| Parametros activos | no disponible (los tags indican MoE, pero no se especifica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta auditada: Q4_K, Q6_K, Q8_0 y F32 según tensor; tier NanoPlus con footprint de 10,23 GiB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); fuente de cuantización en BF16 |
| Tamano del repo | 22,6 GB |
| Pipeline | image-text-to-text |
| Descargas | 2.784 |
| Likes | 10 |
| Fecha de creacion | 2026-11-21 |
| Fecha de actualizacion | 2026-11-22 |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura denominada `inkling2_loop`, que los tags del repositorio asocian a un diseño MoE (mixture of experts). La cuantización conserva capas recurrentes en F32 (58 tensores observados) y protege en F32 las convoluciones de atención (`attn_k_conv`, `attn_post_conv`, `attn_q_clip`) y el tensor `output_res_query`, lo que sugiere la presencia de componentes recurrentes o de atención lineal en el diseño original. Las proyecciones de atención principales (`attn_q`, `attn_k`, `attn_rel`, `attn_output`) se cuantizan en Q4_K, con refuerzo a Q6_K en las capas 5, 11, 17 y 23, y las puertas de atención (`attn_gate`) en Q8_0. Los embeddings de tokens (`token_embd`) van en Q4_K y la cabeza de salida (`output.weight`) en Q6_K.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. La cuantización emplea una imatrix externa (`ggml-org/Inkling-2-Mini-GGUF/imatrix.gguf`) para guiar la asignación de precisión por tensor, y el autor declara que el proceso se ejecutó en clústeres de computación en la nube financiados de su propio bolsillo. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de lo que sugiere la nomenclatura de los tensores.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de imagen y texto conjuntamente (pipeline `image-text-to-text`), lo que habilita tareas de descripción de imágenes, VQA y razonamiento visual.
- Arquitectura MoE, lo que en principio permite activar solo una fracción de los parámetros por token (aunque el número de parámetros activos no está documentado).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Integración con llama.cpp y con el agente de escritorio V-Agent del mismo autor, que incluye servidores MCP para archivos, comandos, búsqueda web, navegador autónomo, herramientas de escritorio y descargas HTTP.
- No se documentan capacidades específicas de tool calling, function calling, agentes multi-paso, audio o modo "thinking"; se consideran no disponibles a partir de la información proporcionada.

## Casos de uso

- Asistente conversacional multimodal local: el modelo puede gestionar diálogos multi-turno combinando texto e imágenes, adecuado para aplicaciones de escritorio donde la privacidad impide enviar datos a la nube, gracias a su ejecución local vía llama.cpp.
- Descripción y análisis de imágenes en flujos de accesibilidad: generación de descripciones textuales de capturas, documentos escaneados o fotografías para lectores de pantalla, aprovechando el pipeline image-text-to-text.
- Automatización de escritorio con agentes: integrado en V-Agent, el modelo puede orquestar los siete servidores MCP (sistema de archivos, comandos, búsqueda DuckDuckGo, navegador autónomo, herramientas de escritorio, descargas HTTP y Hugging Face) para tareas como organizar archivos o consultar documentación web.
- Procesamiento de documentos con componente visual: extracción de información de formularios, recibos o capturas mediante la combinación de entrada de imagen y salida de texto, en un entorno de 10,23 GiB que cabe en GPUs de consumo.
- Prototipado de investigación en modelos MoE multimodales: el mapa de tensores auditado y la precisión mixta permiten estudiar el impacto de la cuantización selectiva en capas de atención y recurrentes sin necesidad de infraestructura de datacenter.
- Chatbot de soporte técnico con contexto visual: atención al cliente que recibe capturas de pantalla de errores y responde con instrucciones, ejecutándose en local para cumplir requisitos de soberanía del dato.
- Evaluación comparativa de cuantizaciones: al existir tiers MiniPlus (12,09 GiB) y NanoPlus (10,23 GiB), sirve para medir la degradación de calidad frente al modelo base en BF16 en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, y tampoco se proporcionan comparaciones numéricas con el modelo base en BF16.

## Requisitos de hardware

- VRAM estimada: el tier NanoPlus ocupa 10,23 GiB en disco, por lo que la inferencia completa requiere al menos ~11-12 GB de VRAM si se carga entero en GPU; el tier MiniPlus sube a 12,09 GiB (~13 GB de VRAM).
- GPU recomendadas: RTX 4090 (24 GB) y RTX 3090 (24 GB) permiten cargar el modelo completo con margen para contexto; GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16GB) pueden alojar el tier NanoPlus completo; GPUs de 12 GB requerirían offloading parcial a CPU.
- Cabe en GPU de consumo: sí, en el tier NanoPlus con 16 GB o más de VRAM; en 12 GB es posible con offloading parcial.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU), V-Agent (con motores llama.cpp, Strata/PolyStrata, Strata Rust/RustingStrata y Project Maya opcional), y cualquier runtime compatible con GGUF y endpoints.
- Latencia y throughput: no disponibles; dependen del hardware, del backend (CUDA vs Vulkan vs CPU) y de la longitud de contexto, que tampoco está documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini APEX-I NanoPlus V2.1 (este) | ~26,1B (MoE) | no disponible | Apache 2.0 | GGUF (Q4_K/Q6_K/Q8_0/F32 mixto) | Cuantización auditada con imatrix; footprint 10,23 GiB |
| Inkling-2-Mini APEX-I MiniPlus V2.1 | ~26,1B (MoE) | no disponible | Apache 2.0 | GGUF | Mismo modelo base, mayor footprint (12,09 GiB), presumiblemente mayor precisión |
| Inkling-2-Mini Abliterated APEX-I NanoPlus V2.1 | ~26,1B (MoE) | no disponible | Apache 2.0 | GGUF | Variante abliterada del mismo tier, sin filtros de rechazo |
| thinkingmachines/Inkling-2-Mini (base) | ~26,1B (MoE) | no disponible | Apache 2.0 | BF16 (safetensors) | Modelo original sin cuantizar; referencia de calidad |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría (multimodales MoE de ~26B) en la información proporcionada, por lo que la comparación se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- La información sobre el modelo base es escasa: no se documentan idiomas soportados, longitud de contexto, composición del dataset ni procesos de alineación, lo que dificulta evaluar sesgos y cobertura lingüística.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual para este modelo.
- La cuantización Q4_K en las proyecciones de atención y embeddings puede degradar la calidad respecto al BF16 original, especialmente en tareas de razonamiento complejo o generación de código; el autor no publica métricas de degradación.
- El tag MoE sugiere una arquitectura de mezcla de expertos, pero se desconoce el número de parámetros activos, lo que impide estimar con precisión el coste computacional por token.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), debe verificarse que el modelo base `thinkingmachines/Inkling-2-Mini` mantiene la misma licencia y no impone restricciones adicionales.
- El modelo se distribuye exclusivamente en GGUF; no hay pesos safetensors en este repositorio, por lo que no es directamente utilizable con frameworks como vLLM o TGI sin conversión.
- La model card está centrada en la promoción de V-Agent y en el mapa de tensores; no incluye guía de prompting, plantilla de chat ni instrucciones de uso del procesador multimodal, lo que puede complicar la integración en producción.
- El repositorio tiene pocas descargas (2.784) y likes (10), lo que limita la validación comunitaria de su calidad y estabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Tier MiniPlus: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF
- Variante Abliterated NanoPlus: https://huggingface.co/IsValorum/Inkling-2-Mini-Abliterated-APEX-I-NanoPlus-V2.1-GGUF
- Variante Abliterated MiniPlus: https://huggingface.co/IsValorum/Inkling-2-Mini-Abliterated-APEX-I-MiniPlus-V2.1-GGUF
- Imatrix utilizada: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Mapa de tensores completo: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF/blob/main/tensor-map.tsv
- V-Agent (repositorio): https://github.com/IsValorum/V-Agent
- V-Agent (última release): https://github.com/IsValorum/V-Agent/releases/latest
- Notas de release de V-Agent: https://github.com/IsValorum/V-Agent/releases
- Arquitectura de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/docs/ARCHITECTURE.md
- Licencia de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/LICENSE
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
