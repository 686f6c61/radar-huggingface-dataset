# IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-NanoPlus-GGUF

## Resumen

Esta ficha describe la cuantización GGUF **Huihui-Qwen3.8-27B-Abliterated VAL-APEX-I NanoPlus V3**, publicada por el usuario IsValorum. No es un modelo entrenado desde cero, sino una conversión a formato GGUF del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez deriva de la familia Qwen3.8 de 27B de parámetros. El autor aplica su propio esquema de cuantización denominado VAL-APEX-I (Vector-calibrated Asymmetric Layer-wise Outlier-preserving Recurrent-aware Unified Matrix-quantization), orientado a preservar la calidad en contextos largos y razonamiento multi-paso con un tamaño de fichero muy contenido.

El resultado es un fichero de 12,18 GB con 3,57 bits por peso (BPW) de media y 866 tensores auditados, que según el autor reporta una perplejidad en WikiText-2 de 5,7729 ± 0,4960. La model card indica que la versión V3 corrige problemas de la build anterior, como inestabilidad del estado recurrente, degradación del contexto y mezcla de idiomas durante la generación. El modelo base es una variante "abliterated" (sin las capas de rechazo alineadas), lo que lo orienta a usos sin filtrado editorial.

La relevancia actual radica en que permite ejecutar un modelo de 27B con contexto nativo declarado de 256K en equipos de consumo con 12-16 GB de VRAM, un espacio tradicionalmente reservado a modelos de 7B-13B. La licencia Apache 2.0 y el formato GGUF lo hacen directamente desplegable en llama.cpp y herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3.8), cuantizada en GGUF |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K declarados por el autor (contexto nativo) |
| Tipos de cuantizacion | GGUF VAL-APEX-I NanoPlus V3, 3,57 BPW de media |
| Idiomas soportados | en (ingles; el autor menciona correccion de mezcla de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.8 con 27,3 mil millones de parámetros. Sobre él, `huihui-ai` aplicó el proceso de "abliteration", que consiste en identificar y neutralizar las direcciones de activación asociadas al rechazo de peticiones, de modo que el modelo responde sin las capas de alineación habituales. IsValorum realiza después la cuantización a GGUF con su pipeline VAL-APEX-I, que según la model card combina calibración vectorial, asignación asimétrica de precisión por capa, preservación de valores atípicos (outliers) y un tratamiento específico del estado recurrente para mantener la coherencia en contextos largos.

La model card no detalla el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original de Qwen y no se reproducen aquí. La innovación técnica destacable de esta publicación es el esquema de cuantización por capas con matrices de calibración de millones de tokens y la corrección explícita de los fallos de la versión previa (inestabilidad recurrente, degradación de contexto y fuga de idioma). El autor documenta un mapa tensor a tensor en un fichero `tensor-map.tsv` certificado.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento multi-paso y modo de razonamiento (reasoning), con fidelidad declarada a través de todas las capas.
- Generación de código, incluyendo tareas de ingeniería de software y pipelines según la evaluación agéntica citada (Shortbench / NanoBench).
- Recuperación asociativa en contexto largo (hasta 256K tokens declarados).
- Respuestas sin filtrado editorial gracias a la base abliterated.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- Soporte de plantilla de chat endurecida para uso agéntico, según la model card.

## Casos de uso

- **Asistente de código en local:** el modelo puede integrarse en un IDE o CLI mediante llama.cpp para autocompletado y refactorización, aprovechando su tamaño de 12,18 GB para caber en GPUs de consumo con 16 GB de VRAM.
- **Análisis de repositorios y documentos largos:** con contexto de 256K tokens, permite cargar ficheros extensos o historiales de conversación completos sin truncar, útil para revisión de código o resúmenes de documentación técnica.
- **Agentes autónomos de ingeniería:** la model card cita evaluación en tareas agénticas de software (pipelines, integridad de sistemas), por lo que encaja en flujos de ejecución multi-paso con tool calling sobre llama.cpp.
- **Generación de contenido sin restricciones editoriales:** al estar abliterated, se emplea en entornos de investigación o creación donde se requiere ausencia de rechazos, siempre bajo responsabilidad del operador.
- **Prototipado de chatbots especializados:** su formato GGUF y licencia Apache 2.0 permiten desplegar un servicio conversacional en una sola máquina sin depender de APIs externas.
- **Investigación sobre cuantización:** el mapa tensor a tensor y las métricas de perplejidad publicadas lo convierten en un caso de estudio para evaluar el impacto de esquemas de cuantización agresivos (3,57 BPW) en modelos de 27B.
- **Procesamiento por lotes en hardware modesto:** con 12,18 GB de fichero, se puede ejecutar en estaciones con una RTX 4090 o incluso en CPU con suficiente RAM, para tareas de generación no interactivas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| WikiText-2 PPL (NanoPlus V3) | 5,7729 ± 0,4960 |
| Tamano de fichero | 12,18 GB (11,35 GiB) |
| BPW de fichero completo | 3,57 |
| Tensores auditados | 866 |

La model card menciona una evaluación en el conjunto agéntico Shortbench / NanoBench (12 tareas objetivas de ingeniería de software, pipelines e integridad de sistemas), pero el texto proporcionado se interrumpe antes de incluir los resultados numéricos. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- **VRAM estimada:** el fichero pesa 12,18 GB; para inferencia completa en GPU se necesitan al menos 13-14 GB de VRAM, más el espacio para el contexto KV. Con 256K de contexto el consumo de KV crece de forma significativa y puede requerir offloading a RAM.
- **GPU recomendadas:** RTX 4090 (24 GB) o RTX 3090 (24 GB) para carga completa con margen; A100/H100 para despliegues de producción con contexto largo.
- **GPU de consumo:** cabe en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) con contexto moderado; en 12 GB requiere offloading parcial a RAM del sistema.
- **Opciones de despliegue:** llama.cpp y derivados (Ollama, LM Studio, koboldcpp); el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints. No se confirma soporte de vLLM o TGI para este GGUF.
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia |
|---|---|---|---|---|
| Huihui-Qwen3.8-27B-Abliterated VAL-APEX-I NanoPlus V3 (este) | 27,3B | 256K | GGUF, 12,18 GB | Apache 2.0 |
| Huihui-Qwen3.8-27B-Abliterated VAL-APEX-I MiniPlus V3 | 27,3B | 256K | GGUF, 14,16 GB | Apache 2.0 |
| Qwen3.8 27B VAL-APEX-I NanoPlus V3 (sin abliterar) | 27,3B | 256K | GGUF, 12,18 GB | Apache 2.0 |
| Qwen3.8 27B EfficientThink Uncensored NanoPlus | 27,3B | no disponible | GGUF, 11,93 GB | Apache 2.0 |

Las alternativas listadas proceden de la propia colección del autor y comparten base y esquema de cuantización; la diferencia principal es el grado de filtrado (abliterated frente a estándar) y el perfil de tamaño (NanoPlus frente a MiniPlus). No se dispone de datos de benchmarks comparativos entre ellas en la información proporcionada.

## Limitaciones y advertencias

- **Modelo abliterated:** la eliminación de las capas de rechazo implica que el modelo puede generar contenido sensible sin filtro; el operador asume la responsabilidad de moderación.
- **Idioma:** la model card declara únicamente inglés; el rendimiento en castellano no está garantizado y el autor menciona haber corregido fugas de idioma, lo que sugiere fragilidad multilingüe.
- **Riesgo de alucinación:** inherente a los modelos de 27B y acentuado por cuantizaciones agresivas de 3,57 BPW; conviene validar salidas en producción.
- **Contexto largo:** aunque se declaran 256K tokens, la calidad efectiva en ventanas extremas no está verificada con benchmarks publicados en la información disponible.
- **Historial de inestabilidad:** la propia model card advierte de fallos graves en builds anteriores (estado recurrente, degradación de contexto, mezcla de idiomas); se recomienda usar exclusivamente la versión V3 certificada.
- **Licencia:** Apache 2.0 permite uso comercial, pero el modelo base abliterated puede arrastrar obligaciones o consideraciones éticas adicionales según el contexto de despliegue.
- **Soporte de herramientas:** no se confirma soporte en vLLM o TGI para este GGUF; el ecosistema validado es llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Variante MiniPlus V3: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B NanoPlus V3 (estándar): https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Qwen3.8 27B EfficientThink Uncensored NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-NanoPlus-GGUF
- Colección NanoPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-abliterated-27b-6acfec5503f6e74218f71f64
- Colección MiniPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-abliterated-27b-6acfec541ee5628d2632c663
- Shortbench / NanoBench: https://shortbench.vercel.app/
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
