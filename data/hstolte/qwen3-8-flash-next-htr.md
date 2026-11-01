# hstolte/Qwen3.8-Flash-Next-HTR

## Resumen

Qwen3.8-Flash-Next-HTR es una cuantización del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario hstolte bajo el paraguas de HawgAuto. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado con un formato propietario denominado HTR (Halo Trellis), diseñado específicamente para ejecutarse en hardware AMD Strix Halo / Radeon 8060S (arquitectura gfx1151). El modelo base cuenta con aproximadamente 54.000 millones de parámetros en formato safetensors y una ventana de contexto que no se detalla en la información disponible.

El problema que resuelve es el de permitir la inferencia de un modelo de gran tamaño en un sistema con memoria unificada de aproximadamente 128 GB, sin GPU discreta de gran VRAM. Para ello, HTR combina cuantización mixta (5 bits en pesos densos seleccionados, 4 bits en expertos enrutados y cabeza de salida, 8 bits GPTQ en hyperconnections) con un esquema en el que las tablas de embeddings n-gram PLE (102,4 GB) permanecen en SSD y el runtime lee únicamente las filas necesarias por token.

Su relevancia es doble: por un lado, demuestra una vía para servir modelos de ~54B en hardware de consumo profesional con memoria compartida; por otro, es un release candidate con el runtime aún privado y el checkpoint en proceso de subida, lo que lo convierte en un artefacto de investigación más que en una opción de producción estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE), según la receta de cuantización que distingue "routed experts"; detalles completos no disponibles |
| Parametros totales | 53.986.623.187 (~54B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HTR5 (5 bits) en pesos densos seleccionados; HTR4 (4 bits) en expertos enrutados y cabeza de salida; GPTQ8 (8 bits entero) en hyperconnections; BF16 original en vision tower y merger; resto de embeddings y norms en formatos específicos por componente |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (formato HTR propietario, no GGUF); 37 archivos de pesos, 23 shards safetensors del target |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos (MoE), a juzgar por la receta de cuantización que separa "routed experts" del resto de pesos densos. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí se documenta es que el checkpoint incluye 333 tensores BF16 del tower de visión y sus assets de procesador, además de un draft especulativo para decodificación MTP3.

La innovación técnica principal está en la cuantización HTR: combina corrección de error guiada por calibración con un formato de pesos basado en trellis optimizado para Strix Halo. Su linaje incluye exlr8, ExLlamaV3 y QTIP (arXiv:2406.11235). El esquema de memoria es igualmente relevante: las tablas de embeddings n-gram PLE, de 102,4 GB (95,368 GiB), se mantienen en SSD y el runtime lee solo las filas necesarias por token, mientras que unos 65,68 GiB se cargan en memoria visible por la GPU (incluyendo 8,0 GiB de presupuesto KV y 0,19 GiB de memoria de grafo). El modelo incorpora decodificación especulativa MTP3, que propone tres tokens por paso.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, tag conversational).
- Razonamiento con modo "thinking" activable, evaluado en los tests de chat con thinking on.
- Codificación y uso en agentes, evaluado en el workload "coding & agents" con thinking off.
- Decodificación especulativa MTP3: propone tres tokens por paso para acelerar la generación.
- Procesamiento de imágenes: se conservan 333 tensores BF16 del vision tower y el merger, aunque la calidad de entrada de imagen y la ejecución de vídeo no están cualificadas por los tests de texto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Inferencia local de un modelo de ~54B en un equipo Strix Halo: el caso de uso central del artefacto. Con ~128 GB de memoria unificada y SSD rápido, el runtime HTR carga ~65,68 GiB en memoria visible por GPU y deja las tablas PLE en disco, permitiendo servir el modelo sin GPU discreta de gran VRAM.
- Asistencia de codificación en estación de trabajo: con MTP3 y thinking desactivado, el modelo alcanza 53,73 tokens/s de decode en el workload de coding & agents, suficiente para autocompletado y generación de parches en un entorno de desarrollo local.
- Chat conversacional con razonamiento: con thinking activado y MTP3, rinde 42,66 tokens/s de decode y 41,09 end-to-end, adecuado para sesiones interactivas donde el usuario espera respuestas razonadas sin latencias prohibitivas.
- Procesamiento de prompts largos en local: el prefill alcanza 1.495,66 tokens/s a 8K tokens con MTP desactivado, lo que permite analizar documentos extensos o volcar contexto de repositorio antes de generar.
- Investigación en cuantización y runtimes alternativos: al ser un release candidate con formato propietario y linaje documentado (exlr8, ExLlamaV3, QTIP), sirve como banco de pruebas para estudiar el equilibrio entre precisión y ahorro de memoria en hardware AMD.
- Evaluación de decodificación especulativa: la comparativa MTP3 frente a MTP off incluida en la model card permite medir el impacto del drafting especulativo en throughput de decode y prefill sobre una plataforma concreta.
- Pruebas de pipelines multimodales experimentales: la presencia del vision tower en BF16 permite experimentar con entrada de imagen, aunque el autor advierte que la calidad no está cualificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos publicados son métricas de serving sobre AMD Radeon 8060S / Strix Halo, con una petición simultánea, runtime de investigación y sampling temperature 1.0 / top-p 0.95 / top-k 20.

| Workload | Modo | Decode (tok/s) | End-to-end (tok/s) |
|---|---|---:|---:|
| Coding & agents (thinking off) | MTP3 | 53,73 | 44,61 |
| Coding & agents (thinking off) | MTP off, checkpoint on | 34,26 | 30,99 |
| Chat (thinking on) | MTP3 | 42,66 | 41,09 |
| Chat (thinking on) | MTP off, checkpoint on | 32,44 | 30,19 |

| Longitud de prompt | MTP off (tok/s) | MTP3 (tok/s) |
|---|---:|---:|
| 2.048 tokens | 1.416,68 | 1.076,45 |
| 8.192 tokens | 1.495,66 | 1.050,69 |

El autor advierte que estas cifras provienen de una comparación histórica con el stack de investigación, no de un benchmark nuevo del paquete final, y que las configuraciones no son idénticas en longitud de respuesta ni en caché. MTP3 es más rápido generando; MTP off es más rápido procesando prompts.

## Requisitos de hardware

- Memoria: ~65,68 GiB en memoria visible por GPU (asignación de carga del modelo, 8,0 GiB de presupuesto KV y 0,19 GiB de memoria de grafo). Las tablas PLE de 102,400 GB (95,368 GiB) permanecen en SSD.
- Configuración objetivo: AMD Strix Halo / Radeon 8060S (gfx1151), Linux, aproximadamente 128 GB de memoria compartida y SSD local rápido.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por el runtime HTR según la información disponible; el formato requiere el runtime específico, no llama.cpp, Transformers ni vLLM estándar.
- Despliegue: runtime vLLM HTR (rama `htr-qsa1600-release-20261028`, actualmente privada) e imagen `ghcr.io/hawgauto/vllm-htr:qsa1600-release-20261028` (también privada). No compatible con llama.cpp, Ollama, TGI ni vLLM convencional.
- Throughput: decode de 32,44 a 53,73 tokens/s según modo y workload; prefill de 1.050,69 a 1.495,66 tokens/s según longitud de prompt y modo.
- Configuración por defecto del release: QSA1600 + MTP3 probabilístico, thinking activado, temperature 0,7, top-p 0,8, top-k 20.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-HTR | ~54B | no disponible | HTR mixta (4/5/8 bits + BF16 visión) | qwen-community-1.0 | Release candidate; runtime privado; checkpoint en subida |
| Qwen3.8-Flash-Next (base) | ~54B | no disponible | BF16 original | qwen-community-1.0 | Público en HuggingFace |
| Alternativas de ~50-70B en GGUF | no disponible | no disponible | GGUF (2-8 bits) | variable | Público, compatible con llama.cpp |

La comparación directa con otras cuantizaciones del mismo modelo base no está disponible en la información proporcionada, ya que el formato HTR es propietario y no existen datos publicados de alternativas equivalentes para Strix Halo.

## Limitaciones y advertencias

- Release candidate incompleto: el checkpoint de 173,76 GB estaba en proceso de subida en el momento de la publicación y no se había verificado como completo. El autor recomienda esperar el aviso de subida completada antes de descargar para inferencia.
- Runtime privado: tanto el código fuente del runtime vLLM HTR como la imagen Docker están en repositorios privados hasta que finalice la publicación. Sin acceso, el modelo no es ejecutable.
- Formato no estándar: HTR no es GGUF ni safetensors convencional; requiere el runtime específico. No funciona con llama.cpp, Ollama, Transformers, TGI ni vLLM estándar.
- Hardware restringido: diseñado para AMD Strix Halo / Radeon 8060S (gfx1151). No hay soporte documentado para GPU NVIDIA ni otras arquitecturas.
- Benchmarks no reproducibles con el paquete final: las cifras de decode y prefill provienen de un stack de investigación anterior y con configuraciones de sampling distintas a las del release; el autor indica que el paquete final tiene una cualificación de entrega separada, no una remedición de esas tasas.
- Visión no cualificada: aunque se conservan los pesos del vision tower, la calidad de entrada de imagen y la ejecución de vídeo no han sido evaluadas por los tests de texto.
- Idiomas no documentados: la model card no especifica la cobertura lingüística.
- Licencia qwen-community-1.0: es una licencia comunitaria con posibles restricciones de uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue en producción.
- Riesgo de alucinación y sesgos: no hay información específica publicada para esta cuantización; al derivar del modelo base, hereda los sesgos y limitaciones de este, no documentados aquí.
- Dependencia de SSD: el esquema de tablas PLE en disco exige un SSD local rápido; un almacenamiento lento degradaría la latencia de forma significativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hstolte/Qwen3.8-Flash-Next-HTR
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramientas de formato y cuantización HTR: https://github.com/HawgAuto/HTR
- Runtime vLLM HTR (privado): https://github.com/HawgAuto/vllm-htr/tree/63ba082fbf6d204dba64bfb3803ccf48ad01fff1
- Guía de descarga y ejecución en Strix Halo: docs/RUNNING.md (dentro del repositorio del modelo)
- Metodología HTR: https://github.com/HawgAuto/HTR/blob/main/docs/METHODOLOGY.md
- Linaje y agradecimientos: https://github.com/HawgAuto/HTR/blob/main/docs/LINEAGE.md
- Detalles de serving y rendimiento: docs/SERVING-PERFORMANCE.md (dentro del repositorio del modelo)
- Datos de timing: evidence/serving-performance.json (dentro del repositorio del modelo)
- Cualificación del release: evidence/release-qualification.json (dentro del repositorio del modelo)
- Paper QTIP: https://arxiv.org/abs/2406.11235
- exlr8: https://github.com/kindlingai/exlr8
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
