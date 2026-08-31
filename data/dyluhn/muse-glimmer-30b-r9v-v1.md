# Dyluhn/Muse-Glimmer-30B-R9V-V1

## Resumen

Muse Glimmer 30B R9V V1 es un paquete de cuantización GGUF experimental del modelo de visión-lenguaje Muse Glimmer 30B de Meta, publicado por el usuario Dyluhn en Hugging Face. Se trata de una requantización derivada del GGUF Q8_0 de Unsloth, realizada con las herramientas de llama.cpp/ggml, que combina tensores en F32, Q8_0 y Q4_K con el objetivo de explorar un perfil de velocidad orientado a hardware AMD RDNA4 (gfx1201). El autor lo presenta explícitamente como un borrador de ingeniería, no como una recomendación de calidad frente a los quants de Unsloth.

El modelo base, Muse Glimmer 30B, es un modelo denso de 30 000 millones de parámetros (27,85 B según los pesos safetensors) con un codificador de percepción ViT-G/14 y una ventana de contexto de 128 000 tokens, destilado de Muse Spark para tareas de agente local, generación de código y razonamiento. Está liberado bajo licencia Apache 2.0. Este artefacto R9V V1 es una de las primeras publicaciones de la línea R9V, con una calidad medida mediante KLD que queda por detrás de los quants Q5 y Q6 de Unsloth, aunque supera a su Q4 de comparación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de visión-lenguaje con codificador ViT-G/14 (modelo base Muse Glimmer 30B) |
| Parametros totales | 27 854 794 240 (27,85 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | GGUF mixto: 313 tensores F32, 351 Q8_0 y 67 Q4_K (731 tensores en total); siete pares gate/up promovidos a Q8_0 en capas 11, 15, 19, 23, 27, 31 y 35 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp/ggml) |

## Arquitectura y entrenamiento

El modelo base Muse Glimmer 30B es un transformer denso de visión-lenguaje desarrollado por Meta Superintelligence Labs, con un codificador de percepción ViT-G/14 y una ventana de contexto de 128 000 tokens. Fue destilado a partir de las salidas de Muse Spark, un modelo más grande, para permitir su ejecución en hardware de consumo y su uso en flujos de trabajo agénticos locales. Emite razonamiento por canal (channel-scoped reasoning) y llamadas a herramientas en formato XML estilo ATEM, en lugar de JSON, lo que requiere parsers específicos.

El artefacto R9V V1 es una requantización del GGUF Q8_0 de Unsloth, realizada con llama.cpp en una revisión fijada (pinned). La mezcla de precisión (F32, Q8_0, Q4_K) y la promoción selectiva de ciertos tensores a Q8_0 buscan un equilibrio entre tamaño y velocidad para el motor de inferencia especializado en gfx1201. No se dispone de información sobre los datos de entrenamiento del modelo base en la documentación proporcionada, más allá de la destilación mencionada.

## Capacidades

- Generación de texto y razonamiento multi-paso, con emisión de razonamiento por canal (channel-scoped reasoning) en lugar de cadenas de pensamiento estándar.
- Llamada a herramientas (tool calling) mediante XML estilo ATEM, no JSON, lo que requiere parsers dedicados (`muse_glimmer`).
- Comprensión de imágenes (image-text-to-text) gracias al codificador ViT-G/14, aunque el paquete R9V V1 no ejercita esta capacidad en las pruebas de velocidad publicadas.
- Capacidades agénticas: diseñado para agentes locales que requieren interacción con herramientas y razonamiento secuencial.
- Generación de código y asistencia en tareas de programación, según la documentación del modelo base.
- Evaluación como juez (LLM-as-a-judge), un caso de uso citado por Meta para este modelo.
- Multilingüismo: no se especifican idiomas soportados en la información disponible.

## Casos de uso

- Agentes locales de asistencia personal: el modelo puede gestionar tareas agénticas multi-paso con razonamiento por canal y llamadas a herramientas XML, ejecutándose en una GPU de consumo gracias a su tamaño de 30 B y contexto de 128 K.
- Generación de código en entornos de desarrollo: su capacidad para emitir razonamiento estructurado y llamadas a herramientas lo hace adecuado para asistentes de programación que necesitan planificar y ejecutar acciones sobre un repositorio.
- Evaluación automática de respuestas (LLM-as-a-judge): puede comparar y puntuar salidas de otros modelos, un caso de uso explícitamente mencionado por Meta para Muse Glimmer.
- Análisis de documentos con imágenes: al ser un modelo de visión-lenguaje, puede procesar capturas, diagramas o documentos escaneados junto con texto, aunque esta capacidad no está validada en el paquete R9V V1.
- Prototipado de pipelines de inferencia en hardware AMD RDNA4: el motor de prueba está especializado para gfx1201, lo que permite experimentar con perfiles de velocidad en GPUs como la serie RX 9700.
- Investigación en cuantización y calidad: el paquete incluye métricas de KLD y same top prediction, útil para estudiar el impacto de diferentes estrategias de requantización en modelos de visión-lenguaje.

## Benchmarks y rendimiento

La model card del autor proporciona métricas de calidad comparativas entre el R9V V1 y los quants de Unsloth, evaluadas con el mismo teacher nativo BF16, 480 chunks, 512 tokens por chunk y 122 400 posiciones evaluadas. Los resultados son los siguientes:

| Quant | Bytes | Mean KLD (menor es mejor) | Same top prediction |
|---|---:|---:|---:|
| R9V V1 / V12 | 24 554 611 392 | 0,006121 | 96,879 % |
| Unsloth Q4 (comparación) | 15 878 222 368 | 0,016883 | 94,806 % |
| Unsloth UD-Q5_K_XL | 21 789 618 976 | 0,003071 | 97,724 % |
| Unsloth UD-Q6_K_XL | 26 265 362 976 | 0,001034 | 98,752 % |

El R9V V1 supera al Q4 de Unsloth en esta evaluación, pero tiene aproximadamente 1,99 veces el KLD del Q5 a pesar de ser 2,76 GB más grande, y 5,92 veces el KLD del Q6. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El GGUF ocupa 24 554 611 392 bytes (24,5 GB), por lo que se necesita al menos 24 GB de VRAM para cargarlo completo en GPU, o usar offloading a CPU con llama.cpp.
- El motor de inferencia de prueba está especializado para la GPU AMD gfx1201 (arquitectura RDNA4, probablemente una RX 9700). No se garantiza el funcionamiento en otras GPUs.
- En GPUs de consumo, una RTX 4090 (24 GB) o una AMD RX 7900 XTX (24 GB) podrían cargar el modelo completo, aunque el motor R9V no está cualificado para ellas.
- Para GPUs con menos VRAM, se puede usar cuantización adicional o fragmentación en CPU, pero no hay datos de rendimiento publicados para esas configuraciones.
- Opciones de despliegue: llama.cpp (dado el formato GGUF), aunque el autor advierte que no hay una API compatible con OpenAI ni un chat template cualificado para este perfil. vLLM y TGI no están soportados para este artefacto específico.
- No se proporcionan cifras de latencia o throughput en la información disponible; el autor menciona que las cifras de velocidad provienen de un motor de prueba de tokens crudos congelado, no del runtime de usuario final.

## Comparativa con modelos similares

La comparación más relevante es con los quants de Unsloth del mismo modelo base, ya que todos derivan de Muse Glimmer 30B:

| Modelo | Bytes | Mean KLD | Same top prediction | Licencia |
|---|---:|---:|---:|---|
| R9V V1 (este artefacto) | 24,55 GB | 0,006121 | 96,879 % | Apache 2.0 |
| Unsloth Q4 (comparación) | 15,88 GB | 0,016883 | 94,806 % | Apache 2.0 |
| Unsloth UD-Q5_K_XL | 21,79 GB | 0,003071 | 97,724 % | Apache 2.0 |
| Unsloth UD-Q6_K_XL | 26,27 GB | 0,001034 | 98,752 % | Apache 2.0 |

En cuanto a otros modelos de visión-lenguaje de tamaño similar, no se dispone de datos comparativos en la información proporcionada. El modelo base Muse Glimmer 30B se posiciona como una alternativa local a modelos agénticos más grandes, pero no hay benchmarks estándar disponibles para comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El autor declara explícitamente que es un "rough-draft release" y que no debe inferirse superioridad de calidad por el nombre R9V o la etiqueta V1.
- La calidad medida (KLD) es significativamente peor que la de los quants Q5 y Q6 de Unsloth, a pesar de ser más grande que el Q5.
- El runtime de usuario R9V no está completo; las cifras de velocidad provienen de un motor de prueba de tokens crudos congelado, no de un producto final.
- No hay una API compatible con OpenAI ni un chat template cualificado para este perfil, lo que dificulta su integración en aplicaciones existentes.
- El motor de prueba está especializado para gfx1201 y el layout de tensores exacto; no se garantiza su funcionamiento en otras GPUs.
- Se reportan 208 fallbacks de attention-pin por cada muestra de 256 tokens en la prueba TG, un dato que el autor revela en lugar de ocultar.
- Las capacidades de visión y DFlash son componentes opcionales del paquete, pero no se ejercitan en las pruebas de velocidad publicadas.
- El modelo base puede tener sesgos y riesgos de alucinación inherentes a su entrenamiento, aunque no se dispone de información específica sobre este artefacto.
- Aunque la licencia es Apache 2.0, el uso del modelo base está sujeto a la política de uso de Meta, que debe consultarse en los avisos de terceros incluidos en el repositorio.

## Enlaces

- Repositorio Hugging Face del artefacto: https://huggingface.co/Dyluhn/Muse-Glimmer-30B-R9V-V1
- Modelo base en Hugging Face: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Página oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Recetas vLLM para Muse Glimmer 30B: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- Guía de Unsloth para ejecutar Muse Glimmer localmente: https://unsloth.ai/docs/models/muse-glimmer
- Información de despliegue en RunInfra: https://runinfra.ai/model/meta-models-muse-glimmer-30b
- Informe de benchmarks R9V: https://github.com/Dyluhn/R9V/blob/main/profiles/muse-glimmer-30b/v1-r9700/BENCHMARKS.md
- Informe de cualificación R9V: https://github.com/Dyluhn/R9V/blob/main/profiles/muse-glimmer-30b/v1-r9700/QUALIFICATION.md
