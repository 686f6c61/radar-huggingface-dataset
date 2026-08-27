# jockevaupptaget/Qwen3.8-Flash-Next-MTP-GGUF

## Resumen

Este repositorio contiene el módulo de predicción multi-token (MTP, por sus siglas en inglés) nativo del modelo Qwen3.8-Flash-Next de Alibaba, convertido a un archivo GGUF independiente en formato `mtp-` sidecar. El autor, jockevaupptaget, extrae la cabeza MTP de 3.878.549.248 parámetros (aproximadamente 3,9 mil millones) que el modelo base incluye de serie, la cuantiza a Q8_0 (4,1 GB) y la empaqueta como un modelo auxiliar para decodificación especulativa en llama.cpp.

El propósito de este sidecar es actuar como modelo borrador (draft) para acelerar la inferencia del modelo principal Qwen3.8-Flash-Next, un MoE de 125 mil millones de parámetros con 6 mil millones activos (125B-A6B) basado en la arquitectura Qwen4. Según las mediciones del autor en un APU AMD Strix Halo (Ryzen AI Max+ 395), el uso de este draft MTP multiplica la velocidad de decodificación por 2,14 (de 23,2 a 49,8 tokens por segundo) con una tasa de aceptación de 0,785 a n-max 6.

La relevancia de este lanzamiento radica en que permite aprovechar el head MTP oficial del modelo Qwen3.8-Flash-Next en entornos locales, algo que no es posible con el llama.cpp estándar. Requiere un parche específico (PR #27742) y una versión modificada del convertidor de HuggingFace a GGUF. No es un modelo de lenguaje autónomo, sino un componente especializado para acelerar la generación de texto de su modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) con atención densa en contexto draft; tensores indexer incluidos pero sin uso |
| Parametros totales | 3.878.549.248 (3,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (hereda del modelo base, pero se usa como draft con n-max 2-6) |
| Tipos de cuantizacion | Q8_0 (único disponible) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje completo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (sidecar `mtp-`) |

## Arquitectura y entrenamiento

El head MTP es el módulo nativo de predicción multi-token que acompaña al modelo Qwen3.8-Flash-Next. Este modelo base, desarrollado por Alibaba, emplea una arquitectura Qwen4 con atención híbrida GDN (Gated Delta Network) y QSA (Query-Sparse Attention), y es un MoE de 125B parámetros totales con 6B activos. El head MTP, de aproximadamente 4B parámetros, se entrena junto con el modelo principal para predecir varios tokens futuros simultáneamente, lo que permite su uso como modelo borrador en esquemas de decodificación especulativa.

La conversión a GGUF se realizó con el script `convert_hf_to_gguf.py` del árbol parcheado, usando la opción `--mtp` y `--outtype q8_0`. El head ejecuta atención densa dentro del contexto draft, y aunque los tensores indexer están incluidos en el archivo, no se utilizan durante la inferencia. Las capacidades multimodales (visión y PLE) del modelo base no forman parte de este head, que se limita exclusivamente a la predicción de tokens de texto.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: actúa como modelo draft para el target Qwen3.8-Flash-Next (125B-A6B), prediciendo entre 2 y 6 tokens por paso.
- Compatibilidad con llama.cpp parcheado: se integra mediante los argumentos `--spec-type draft-mtp` y `--spec-draft-model`.
- Soporte de cuantización del modelo target: funciona con cuantizaciones agresivas como UD-Q3_K_XL, manteniendo una tasa de aceptación alta.
- Ejecución en GPU o iGPU vía Vulkan/RADV, como demuestran las mediciones en Strix Halo.
- No incluye generación de texto autónoma, tool calling, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Inferencia local acelerada de Qwen3.8-Flash-Next en hardware de consumo: en un APU Strix Halo, el draft MTP eleva la velocidad de decodificación de 23,2 a 49,8 tok/s, lo que hace viable ejecutar un modelo de 125B en un equipo sin GPU dedicada de gama alta.
- Despliegue de modelos grandes con VRAM limitada: al combinar el target en cuantización UD-Q3_K_XL con el draft MTP en Q8_0, se reduce la latencia percibida sin necesidad de descargar el modelo completo en memoria de alta velocidad.
- Investigación en decodificación especulativa: este sidecar permite estudiar el comportamiento del head MTP nativo de Qwen3.8-Flash-Next fuera del stack oficial de Alibaba, facilitando experimentos con diferentes valores de n-max y tasas de aceptación.
- Integración en pipelines de llama.cpp personalizados: desarrolladores que mantienen forks de llama.cpp pueden incorporar este draft para acelerar sus propias cargas de trabajo con modelos Qwen3.8.
- Evaluación de rendimiento en APUs y iGPUs: las mediciones publicadas sirven como referencia para comparar el rendimiento de decodificación especulativa en hardware AMD Ryzen AI Max+ y similares.
- Optimización de costes en entornos de prototipado: al acelerar la generación sin requerir hardware adicional, se reducen los costes de experimentación con modelos de 125B en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que este archivo no es un modelo de lenguaje completo sino un componente auxiliar. El autor proporciona las siguientes mediciones de rendimiento en decodificación especulativa, obtenidas en un Strix Halo (Ryzen AI Max+ 395, Vulkan/RADV) con el modelo target Qwen3.8-Flash-Next en cuantización UD-Q3_K_XL:

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion sin draft | 23,2 tok/s |
| Velocidad de decodificacion con draft MTP | 49,8 tok/s |
| Factor de aceleracion | 2,14x |
| Tasa de aceptacion del draft (n-max 6) | 0,785 |
| Tasa de aceptacion del draft (n-max 2) | 0,905 |

## Requisitos de hardware

- VRAM estimada para el draft: el archivo Q8_0 ocupa 4,1 GB, por lo que cabe en GPUs consumer con 8 GB o más, o en la memoria unificada de APUs como Strix Halo.
- GPU recomendadas: cualquier GPU compatible con Vulkan o CUDA que ejecute llama.cpp parcheado; el autor validó el funcionamiento en iGPU Radeon 8060S del Ryzen AI Max+ 395.
- Para el modelo target (125B) se requiere mucha más memoria; en el escenario de prueba se usó cuantización UD-Q3_K_XL, que reduce significativamente el footprint.
- Opciones de despliegue: exclusivamente llama.cpp con el parche del repositorio apepojken/llama.cpp (rama `qwen4exp-spec-mtp`). No es compatible con vLLM, Ollama ni TGI estándar.
- Latencia y throughput: los valores medidos (23,2 a 49,8 tok/s) corresponden a un APU con memoria unificada; en GPUs discretas los resultados pueden variar.

## Comparativa con modelos similares

No se dispone de modelos sidecar MTP comparables en el ecosistema GGUF. La alternativa más cercana sería usar un modelo pequeño convencional (por ejemplo, un Qwen2.5-0.5B) como draft en decodificación especulativa, pero esa aproximación no aprovecha el head MTP nativo del modelo base y suele ofrecer tasas de aceptación inferiores. Dado que este archivo es un componente especializado y no un modelo de lenguaje completo, no procede una comparativa directa con modelos como Qwen3.8-Flash-Next, Llama 3.1 o Mistral.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado (PR #27742); el llama.cpp estándar no puede cargar ni ejecutar este archivo.
- No es un modelo de lenguaje autónomo: no genera texto por sí mismo y no puede usarse para tareas de chat, razonamiento o generación de código sin el modelo target.
- No incluye las capacidades multimodales del modelo base (visión, PLE); solo procesa tokens de texto.
- El rendimiento depende en gran medida del hardware y de la tasa de aceptación del draft, que varía según el contenido generado y el valor de n-max configurado.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.8-Flash-Next para cualquier despliegue en producción.
- Los tensores indexer incluidos en el archivo no se utilizan; su presencia puede confundir a herramientas de inspección de modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jockevaupptaget/Qwen3.8-Flash-Next-MTP-GGUF
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog de ExplainX sobre el lanzamiento: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
- Documentación de Unsloth para Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- README del modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/README.md
- Página de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
