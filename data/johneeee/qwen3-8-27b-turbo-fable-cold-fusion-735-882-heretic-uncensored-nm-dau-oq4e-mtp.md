# Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-mtp

## Resumen

El modelo `Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-mtp` es una cuantización mixta de 4 bits en formato MLX del fine-tune `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, creado por DavidAU con contribuciones de Nightmedia. Este fine-tune parte del modelo base `Qwen3.8-27B` de Alibaba, un transformer denso de 27 000 millones de parámetros (28 000 millones contando el encoder de visión) con 64 capas, tamaño oculto de 5120 y un vocabulario de 248 320 tokens, publicado bajo licencia Apache 2.0 en agosto de 2026.

La versión cuantizada, generada con la herramienta oQ (oMLX v0.6.4), reduce el peso a 4 bits con group size 64, lo que da un tamaño de repositorio de 16,3 GB. Está pensada para ejecutarse en hardware Apple Silicon mediante MLX, manteniendo un equilibrio entre calidad y eficiencia. El modelo original se describe como un fine-tune orientado a instrucción general, razonamiento, análisis, creatividad y generación de texto sin censura, lo que lo hace relevante para aplicaciones que requieren respuestas menos restringidas, aunque con las advertencias éticas correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo qwen3_5) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX safetensors) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingue) |
| Licencia | No disponible (el modelo base es Apache 2.0) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso de 27 000 millones de parámetros, con 64 capas y tamaño oculto de 5120, diseñado por Alibaba para tareas de visión, generación de texto general y cargas de trabajo agénticas. El fine-tune de DavidAU, denominado `TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, combina varios ajustes finos no revelados, incluyendo contribuciones de Nightmedia, con el objetivo de mejorar la capacidad de seguir instrucciones, el razonamiento y la creatividad, eliminando restricciones de contenido (modo "uncensored"). No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO.

La cuantización se realizó con oQ (oMLX v0.6.4), que aplica cuantización de precisión mixta, asignando 4 bits con group size 64 a la mayoría de los pesos. Este proceso reduce el tamaño del modelo de aproximadamente 54 GB (en FP16) a 16,3 GB, facilitando su ejecución en dispositivos con memoria unificada limitada, como Macs con Apple Silicon.

## Capacidades

- Generación de texto general con énfasis en seguir instrucciones, razonamiento analítico y creatividad.
- Modo "uncensored": respuestas sin filtros de contenido, lo que permite explorar temas que otros modelos restringen.
- Soporte de tool calling y cargas de trabajo agénticas, heredado del modelo base Qwen3.8-27B (aunque no confirmado explícitamente en el fine-tune).
- Capacidades multilingües del modelo base, aunque no se especifican los idiomas exactos en esta versión.
- Posible soporte de visión en el modelo base, pero el fine-tune se describe como de generación de texto, por lo que no se garantiza que conserve esta capacidad.

## Casos de uso

- Generación creativa sin restricciones: el modo "uncensored" permite escribir ficción, poesía o guiones con temáticas adultas o controvertidas que otros modelos rechazarían. Se usaría como motor de escritura asistida en entornos donde se requiere libertad creativa total.
- Asistente de investigación y análisis: su capacidad de razonamiento y análisis lo hace útil para resumir documentos, extraer conclusiones y estructurar argumentos complejos, especialmente en dominios donde el contenido sensible no debe ser filtrado.
- Desarrollo de agentes conversacionales: gracias a su soporte de tool calling (si se confirma), puede integrarse en pipelines de agentes que necesiten interactuar con APIs, bases de datos o ejecutar acciones multi-paso.
- Generación de código y depuración: aunque no se menciona explícitivamente, el modelo base Qwen3.8-27B tiene capacidades de código; el fine-tune podría mantenerlas, siendo útil para tareas de programación asistida.
- Análisis de sentimiento y moderación de contenido: paradójicamente, al no tener censura, puede analizar texto extremo o sensible sin rechazarlo, ayudando a identificar discursos de odio o contenido problemático en datasets.
- Prototipado rápido de aplicaciones de IA: al ser un modelo cuantizado de 4 bits en MLX, es adecuado para desarrollo local en Macs, permitiendo iterar sobre prompts y flujos sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas para este fine-tune ni para su versión cuantizada. El modelo base Qwen3.8-27B podría tener resultados publicados por Alibaba, pero no se han proporcionado en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo cuantizado a 4 bits ocupa 16,3 GB en disco. En MLX, la memoria unificada necesaria es de al menos 16 GB, recomendándose 32 GB para mayor comodidad.
- GPU recomendadas: al ser formato MLX, está optimizado para Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4). No se recomienda su uso directo en GPUs NVIDIA sin conversión previa.
- En consumer GPU: no es directamente ejecutable en GPUs NVIDIA sin convertir a otro formato (por ejemplo, GGUF). Tras conversión, cabría en una GPU con 16 GB de VRAM (RTX 4080, 4090, etc.).
- Opciones de despliegue: MLX (Apple Silicon), conversión a GGUF para llama.cpp u Ollama, o a safetensors estándar para vLLM o TGI en GPUs.
- Latencia y throughput: no disponibles. Dependerá del hardware y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No disponible | Apache 2.0 | safetensors | Modelo oficial de Alibaba, con visión y capacidades agénticas |
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27B | No disponible | No disponible | safetensors | Fine-tune sin censura de DavidAU |
| Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-mtp | 27B | No disponible | No disponible | MLX safetensors | Cuantización 4-bit del fine-tune anterior |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre el modelo base y el fine-tune es la eliminación de restricciones de contenido, mientras que la versión cuantizada se distingue por su menor tamaño y compatibilidad con Apple Silicon.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune "uncensored", puede amplificar sesgos presentes en los datos de entrenamiento y generar contenido ofensivo, discriminatorio o dañino sin filtro.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados o cuando se le pide creatividad extrema.
- Limitaciones de contexto: la longitud de contexto no está documentada; se recomienda verificar el comportamiento con ventanas largas antes de usarlo en producción.
- Restricciones de licencia: la licencia de este modelo cuantizado no está especificada. Aunque el modelo base es Apache 2.0, el fine-tune de DavidAU podría tener condiciones adicionales. No se recomienda uso comercial sin aclarar los términos.
- Riesgo de uso indebido: la ausencia de censura facilita la generación de contenido ilegal o poco ético. Es responsabilidad del desarrollador implementar salvaguardas externas si se despliega en aplicaciones públicas.
- Degradación por cuantización: la cuantización a 4 bits puede reducir ligeramente la calidad de las respuestas en comparación con el modelo en FP16, especialmente en tareas de razonamiento complejo.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-mtp
- Modelo original de DavidAU (discusiones): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU/discussions
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau
- Documentación de Cloudflare sobre Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Información de lanzamiento de Qwen3.8-27B: https://www.llm-releases.com/models/qwen3-8-27b
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
