# AtomicChat/Muse-Glimmer-30B-GGUF

## Resumen

Muse Glimmer 30B es un modelo multimodal (imagen-texto) desarrollado por Meta, con 27.854.794.240 parámetros (~27,85 mil millones) y licencia Apache 2.0. Este repositorio, publicado por AtomicChat, ofrece una colección de cuantizaciones GGUF del modelo original, optimizadas para ejecutarse con llama.cpp en hardware de consumo. La versión GGUF se construyó a partir de los pesos BF16 originales, verificados bit a bit, e incorpora una matriz de importancia calibrada (imatrix) y una selección de tipos de cuantización por tensor para maximizar la calidad en cada tamaño.

La relevancia de esta publicación radica en que permite ejecutar un modelo multimodal de ~30B en GPUs de 24 GB o incluso 12 GB con cuantización extrema, incluyendo soporte para visión (proyector multimodal) y decodificación especulativa (drafter) que acelera la generación hasta 1,8 veces. El modelo también admite tool calling y un nivel de razonamiento ajustable mediante el system prompt, lo que lo hace adecuado para aplicaciones de agentes y asistentes conversacionales.

El repositorio incluye múltiples archivos GGUF con diferentes niveles de cuantización (desde Q8_0 hasta IQ2_XXS), así como el proyector de visión (mmproj) y el drafter (dflash) en formato BF16. Se requiere una compilación de llama.cpp desde master, ya que el soporte se incorporó en el commit `62bf73d` del PR #26841.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal transformer, sin detalles publicados) |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | no disponible (no se indica si es MoE; probablemente denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, IQ3_XXS, IQ2_M, IQ2_XXS (algunas con variante AD) |
| Idiomas soportados | no disponible (la documentacion menciona pruebas en 30 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivos BF16 de referencia y proyectores) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo base `meta-models/Muse-Glimmer-30B`. Se sabe que es un modelo multimodal (image-text-to-text) con aproximadamente 27,85 mil millones de parámetros, desarrollado por Meta. La documentación del repositorio no proporciona información sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO.

La versión GGUF se generó a partir de los pesos BF16 originales, verificados como bit-idénticos mediante UUID y hash de los 731 tensores. Se utilizó una matriz de importancia calibrada (imatrix) y un diseño de tipos de cuantización por tensor (layout) elegido mediante mediciones. El repositorio incluye también un proyector de visión (`mmproj`) y un drafter para decodificación especulativa (`dflash`), ambos en BF16.

## Capacidades

- Multimodal: procesa imágenes y texto, permitiendo responder preguntas sobre contenido visual.
- Tool calling: soporta llamadas a funciones, lo que permite integrarlo en pipelines de agentes.
- Razonamiento ajustable: el nivel de razonamiento se configura mediante una línea en el system prompt (`Reasoning strength: low|medium|high|xhigh`), con `high` como valor por defecto.
- Decodificación especulativa: el drafter propone tokens y el modelo principal los verifica, acelerando la generación hasta 1,8 veces sin pérdida de calidad bajo muestreo greedy.
- Multilingüe: las pruebas de calidad se realizaron sobre texto neutro en 30 idiomas, aunque no se especifica la lista completa.
- Conversacional: diseñado para diálogos multi-turno con plantilla de chat nativa.

## Casos de uso

- Asistente virtual con visión: el modelo puede analizar imágenes enviadas por el usuario y responder preguntas sobre su contenido, por ejemplo, identificar objetos, leer texto en fotografías o describir escenas. Su ventana de contexto y soporte multimodal lo hacen adecuado para aplicaciones de ayuda visual en tiempo real.
- Agente autónomo con tool calling: gracias a su capacidad para invocar funciones, puede integrarse en sistemas que necesitan realizar acciones externas, como consultar APIs, gestionar calendarios o interactuar con bases de datos, ejecutando razonamiento multi-paso.
- Generación de descripciones de imágenes para accesibilidad: puede generar texto alternativo detallado para imágenes en sitios web o documentos, mejorando la accesibilidad para personas con discapacidad visual.
- Chatbot multilingüe de atención al cliente: con soporte para 30 idiomas, puede atender consultas en varios idiomas, manteniendo el contexto de la conversación y derivando a herramientas externas cuando sea necesario.
- Análisis de documentos con capturas: los usuarios pueden subir capturas de pantalla de informes, gráficos o tablas y obtener resúmenes o respuestas a preguntas específicas sobre el contenido.
- Prototipado rápido de aplicaciones multimodales en local: al poder ejecutarse en una GPU de 24 GB con cuantización IQ4_XS y drafter, permite desarrollar y probar aplicaciones de visión y lenguaje sin depender de servicios cloud.
- Razonamiento de varios pasos en tareas complejas: con el nivel de razonamiento configurable, puede abordar problemas que requieren encadenar deducciones, como resolución de problemas matemáticos o planificación de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio proporciona métricas de calidad de cuantización basadas en la divergencia de Kullback-Leibler (KLD) y precisión top-1 frente a los pesos BF16 de referencia, medidas sobre dos corpus: texto neutro en 30 idiomas y diálogo agentico con tool calls. Valores más bajos de KLD indican mayor fidelidad.

| Build | Tamano | KLD neutral | top-1 neutral | KLD agentico | top-1 agentico |
|---|---|---|---:|---:|---:|---:|
| AD-Q8_0 | 32,13 GB | 0,000819 | 98,99 % | 0,018382 | 98,58 % |
| Q8_0 | 29,61 GB | 0,000861 | 98,95 % | 0,019968 | 98,58 % |
| AD-Q6_K | 28,26 GB | 0,001247 | 98,71 % | 0,023174 | 98,36 % |
| AD-Q5_K_M | 22,67 GB | 0,003136 | 97,82 % | 0,039615 | 97,57 % |
| AD-Q4_K_M | 19,06 GB | 0,008866 | 96,27 % | 0,065472 | 96,39 % |
| AD-IQ4_XS | 15,95 GB | 0,019418 | 94,55 % | 0,091624 | 95,41 % |
| AD-IQ3_M | 14,92 GB | 0,026290 | 93,60 % | 0,121391 | 94,68 % |
| AD-IQ3_XXS | 12,22 GB | 0,064353 | 89,97 % | 0,168065 | 92,90 % |
| AD-IQ2_M | 11,16 GB | 0,104788 | 87,31 % | 0,236144 | 92,00 % |
| AD-IQ2_XXS | 9,31 GB | 0,266591 | 79,66 % | 0,333133 | 87,90 % |

Rendimiento medido en una RTX 5090 con `-c 16384 -fa on`, nueve prompts de código, prosa y razonamiento, muestreo greedy:

| Configuracion | VRAM | Generacion | Prompt | Aceptacion |
|---|---:|---:|---:|---:|
| modelo + mmproj | 19,3 GB | 39,6 t/s | 242,6 t/s | — |
| modelo + mmproj + dflash | 24,6 GB | 71,8 t/s | 198,5 t/s | 0,177 |

## Requisitos de hardware

- VRAM estimada para inferencia: desde 9,3 GB (IQ2_XXS con visión) hasta 32,1 GB (AD-Q8_0). La configuración recomendada para una experiencia completa (visión + drafter) es AD-IQ4_XS, que ocupa 24,6 GB.
- GPU recomendadas: la RTX 5090 se utilizó en las pruebas; también puede ejecutarse en RTX 4090 (24 GB) con cuantizaciones como AD-Q4_K_M o AD-IQ4_XS, y en GPUs de 16 GB con AD-IQ3_M (sin visión) o AD-IQ3_XXS (con visión).
- Opciones de despliegue: llama.cpp (llama-server, llama-mtmd-cli) con una compilación desde master (commit `62bf73d` o posterior). No se mencionan otros backends como vLLM u Ollama.
- Latencia y throughput: en RTX 5090, 39,6 t/s de generación sin drafter y 71,8 t/s con drafter, con una velocidad de prompt de 242,6 t/s (sin drafter) y 198,5 t/s (con drafter). El drafter consume 5,5 GB adicionales de VRAM y reduce la velocidad de procesamiento del prompt en un 18 %.
- El archivo BF16 de referencia ocupa 55,7 GB y requiere 64 GB de VRAM; los proyectores mmproj y dflash añaden 3,7 GB y 5,5 GB respectivamente.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, otros modelos multimodales de ~30B como LLaVA-NeXT o Qwen-VL). La documentación incluye una comparación interna entre las cuantizaciones de este repositorio y las de otro editor no identificado, mostrando que por debajo de 16 GB las versiones de AtomicChat presentan una KLD entre un 12 % y un 41 % menor a igual tamaño. Sin embargo, no se proporcionan nombres de los modelos comparados ni resultados de benchmarks estándar, por lo que la comparativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- Requiere una compilación de llama.cpp desde master; las versiones etiquetadas no incluyen el soporte necesario.
- El parámetro `--jinja` es obligatorio; sin él, la plantilla de chat y el análisis de tool calls no funcionan.
- El drafter de decodificación especulativa consume 5,5 GB de VRAM y reduce la velocidad de procesamiento del prompt en un 18 %, aunque no afecta a la calidad bajo muestreo greedy.
- El nivel de razonamiento por defecto (`high`) puede hacer que respuestas cortas agoten todo el presupuesto de tokens dentro del bloque de razonamiento; se recomienda ajustar `max_tokens` o reducir el nivel a `low` para respuestas rápidas.
- La calidad de la cuantización se degrada significativamente en tamaños pequeños: la KLD en el corpus agentico aumenta de 0,018 (Q8_0) a 0,333 (IQ2_XXS), lo que puede afectar a tareas que requieren alta precisión.
- No se han publicado detalles sobre sesgos, riesgos de alucinación o limitaciones idiomáticas específicas del modelo base. Al ser un modelo multimodal, puede heredar sesgos visuales de sus datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base `meta-models/Muse-Glimmer-30B` si se utiliza en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/Muse-Glimmer-30B-GGUF
- Dataset de métricas: https://huggingface.co/datasets/AtomicChat/Muse-Glimmer-30B-GGUF-metrics
- Pull request de llama.cpp con el soporte: https://github.com/ggml-org/llama.cpp/pull/26841
- Modelo base (referencia): https://huggingface.co/meta-models/Muse-Glimmer-30B
