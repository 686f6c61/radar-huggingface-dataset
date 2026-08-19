# FabricAI/Fabric1.5-0.7B-Instruct

## Resumen

Fabric 1.5 — 0.7B Instruct es un modelo de lenguaje causal desarrollado por Fabric AI, diseñado para ofrecer un equilibrio entre eficiencia y capacidad en un tamaño reducido de 742 millones de parámetros. Se basa en el checkpoint preentrenado Fabric1.5-0.7B-Base y se ha ajustado específicamente para seguir instrucciones. Su principal innovación es una arquitectura de memoria fragmentada (chunked memory) que permite manejar contextos de hasta 32.768 tokens sin crecimiento cuadrático de memoria, algo poco habitual en modelos de este tamaño.

El modelo está pensado para entornos con recursos limitados, como dispositivos edge o GPUs de baja gama, manteniendo un rendimiento razonable en tareas de razonamiento, conocimiento y seguimiento de instrucciones. Según los datos publicados, se acerca a modelos ligeramente más grandes como Qwen3.5-0.8B en MMLU, a pesar de ser un 12% más pequeño. Su licencia en HuggingFace es Apache 2.0, aunque la model card menciona una licencia propia, lo que conviene verificar antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con Chunked Fabric Memory (16 LocalBlock + 8 FabricMemoryBlock) |
| Parametros totales | 742.528.520 (742M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos |
| Tipos de cuantizacion | no disponible (se menciona FP16/BF16 para inferencia, sin cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (segun metadata de HuggingFace; la model card indica "Fabric AI Open License v1.0") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Fabric 1.5 emplea una arquitectura transformer causal con una innovación denominada Chunked Fabric Memory. Cada tercer bloque divide la atención en dos ramas paralelas: una ventana causal local de atención exacta sobre los últimos 2.048 tokens, y una memoria fragmentada compuesta por resúmenes aprendidos (4 por cada fragmento de 512 tokens) de fragmentos anteriores completados. Un gate escalar por token combina ambas salidas, proporcionando 256 vectores de resumen de memoria de largo alcance a lo largo de los 32K tokens de contexto sin crecimiento cuadrático de memoria. El modelo tiene 24 capas (16 LocalBlock + 8 FabricMemoryBlock), dimensión oculta de 1.536, vocabulario de 65.536, atención GQA con 24 cabezas de consulta y 6 de clave/valor, y RoPE con theta=1M.

El entrenamiento se realizó en dos fases: preentrenamiento del checkpoint base (Fabric1.5-0.7B-Base) y posterior fine-tuning para instrucciones utilizando los datasets HuggingFaceTB/smoltalk2, open-r1/Mixture-of-Thoughts y nvidia/Nemotron-Post-Training-Dataset-v1. No se menciona explícitamente el uso de RLHF o DPO, aunque los datasets de post-entrenamiento sugieren técnicas de alineación supervisada. El modelo se publica con precisión FP16 y requiere código personalizado de Transformers (--trust-remote-code).

## Capacidades

- Generación de texto y seguimiento de instrucciones en inglés.
- Razonamiento y conocimiento general, con resultados moderados en benchmarks de sentido común y conocimiento (ARC, HellaSwag, MMLU).
- Manejo de contextos largos (hasta 32K tokens) gracias a la memoria fragmentada, permitiendo procesar documentos extensos o conversaciones multi-turno.
- Eficiencia computacional: al ser un modelo de 0.7B, puede ejecutarse en hardware modesto, incluyendo CPUs y GPUs de consumo.
- No se documenta soporte explícito para tool calling, function calling, agentes, visión o audio. Es exclusivamente un modelo de texto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (32K tokens) para mantener el historial completo de la interacción, adecuado para chatbots en sitios web o aplicaciones de mensajería.
- Asistentes virtuales en dispositivos edge: su tamaño reducido permite desplegarlo en Raspberry Pi, smartphones o routers con poca memoria, ofreciendo respuestas a preguntas frecuentes o comandos de voz (con un pipeline de ASR externo).
- Resumen de documentos extensos: gracias a su ventana de contexto de 32K, puede resumir artículos, informes o contratos de varias páginas sin necesidad de truncar el texto.
- Generación de contenido asistida: redacción de borradores de correos, publicaciones de blog o descripciones de productos, con instrucciones en lenguaje natural.
- Clasificación y extracción de información: puede etiquetar textos, extraer entidades o categorizar tickets de soporte, aprovechando su capacidad de seguir instrucciones detalladas.
- Educación y tutoría: como asistente de estudio para explicar conceptos, resolver dudas o generar ejercicios, dado su razonamiento básico y su bajo coste de ejecución.

## Benchmarks y rendimiento

Los resultados fueron obtenidos en una NVIDIA A100-SXM4-40GB con pesos FP16 usando el harness `lm-eval`:

| Benchmark | Accuracy (0-shot) | Tipo |
|---|---|---|
| ARC Easy | 54,97% | Loglikelihood |
| ARC Challenge | 26,88% | Loglikelihood |
| HellaSwag | 35,00% | Loglikelihood |
| MMLU | 28,96% | Loglikelihood |
| C-Eval | 27,12% | Loglikelihood |

Comparación con Qwen3.5-0.8B:

| Benchmark | Fabric 1.5 | Qwen3.5-0.8B | Delta |
|---|---|---|---|
| MMLU (0-shot) | 28,96% | 29,7% | -0,74% |

No se han publicado resultados adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 742M parámetros, en FP16 ocupa aproximadamente 1,5 GB (tamaño del repositorio). En BF16 similar. Con cuantización a 4 bits (no oficial, pero posible con herramientas externas) podría reducirse a ~0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas con suficiente memoria compartida). Se evaluó en A100, pero no es necesaria.
- Cabe en GPUs de consumo: sí, en tarjetas con 2 GB o más. También puede ejecutarse en CPU con ~2 GB de RAM.
- Opciones de despliegue: la documentación oficial muestra `transformers serve` con API compatible con OpenAI, tanto en macOS (MPS) como en NVIDIA (CUDA). Al ser un modelo estándar de Transformers, podría usarse con vLLM, TGI o llama.cpp, aunque no está documentado oficialmente.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna, se espera una generación de decenas de tokens por segundo; en CPU, varios tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fabric 1.5-0.7B-Instruct | 742M | 32.768 | 28,96% | Apache 2.0 (según HF) | HuggingFace |
| Qwen3.5-0.8B | ~800M | no disponible | 29,7% | no disponible | no disponible |
| SmolLM2-1.7B | 1.7B | 8.192 | no disponible | Apache 2.0 | HuggingFace |

Solo se dispone de datos comparativos con Qwen3.5-0.8B en MMLU. Fabric 1.5 queda a 0,74 puntos porcentuales de distancia, siendo un 12% más pequeño. No hay más información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Idioma: solo soporta inglés de forma nativa; no se documenta capacidad multilingüe.
- Tamaño reducido: al ser un modelo de 0.7B, su rendimiento en tareas complejas (razonamiento avanzado, matemáticas, código) es limitado y puede presentar alucinaciones o respuestas incoherentes en dominios especializados.
- Sesgos: al igual que otros modelos entrenados con datos web, puede reflejar sesgos presentes en los datos de entrenamiento.
- Licencia: aunque la metadata de HuggingFace indica Apache 2.0, la model card menciona "Fabric AI Open License v1.0". Es necesario verificar los términos exactos antes de un uso comercial o de redistribución.
- Código personalizado: requiere `--trust-remote-code` al cargar el modelo, lo que implica ejecutar código del repositorio del autor. Se recomienda auditar el código antes de usarlo en entornos de producción.
- Contexto largo con memoria fragmentada: aunque la ventana es de 32K, la memoria a largo plazo se basa en resúmenes aprendidos, lo que puede perder detalles finos de fragmentos antiguos en comparación con atención completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FabricAI/Fabric1.5-0.7B-Instruct
- Modelo base: https://huggingface.co/FabricAI/Fabric1.5-0.7B-Base
- No se proporcionan papers, blogs o demos adicionales en la información disponible.
