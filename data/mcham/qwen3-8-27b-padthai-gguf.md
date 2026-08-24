# mcham/Qwen3.8-27B-padthai-gguf

## Resumen

El modelo `mcham/Qwen3.8-27B-padthai-gguf` es una cuantización GGUF especializada del modelo Qwen3.8-27B de Alibaba, adaptada para funcionar de forma óptima en tailandés e inglés. El autor, mcham, ha utilizado una calibración iMatrix generada con el dataset `eaddario/imatrix-calibration` para eliminar el soporte de otros idiomas y concentrar la precisión en las dos lenguas objetivo, logrando cuantizaciones muy agresivas (de 2 a 4 bits) que reducen el tamaño del modelo a entre 8 y 10 GB, lo que permite ejecutarlo en GPUs de 12 GB de VRAM.

El modelo base Qwen3.8-27B es un LLM denso de 27 000 millones de parámetros con arquitectura híbrida de atención (16 capas con atención completa y 48 con atención lineal), lanzado por el equipo Qwen de Alibaba. Es multimodal nativo (texto e imagen) y destaca en tareas de codificación, flujos agénticos y automatización de oficina. Esta cuantización concreta incluye además un proyector multimodal (MMPROJ) cuantizado y un módulo MTP (multi-token prediction) para acelerar la inferencia, lo que la hace especialmente interesante para despliegues en hardware de consumo.

La relevancia de este modelo radica en que ofrece una alternativa ligera y eficiente para aplicaciones en tailandés e inglés, con un equilibrio entre tamaño, velocidad y calidad, pensada para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal), 64 capas, 16 con atención completa |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64 000 tokens (configuración recomendada por el autor) |
| Tipos de cuantizacion | IQ2_M (8,56 GiB), IQ3_XXS (9,49 GiB), IQ3_XS (10,52 GiB) |
| Idiomas soportados | Tailandés, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer híbrida: de sus 64 capas, solo 16 utilizan atención completa (con un intervalo de atención completa de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Este diseño reduce el coste computacional y la memoria necesaria para contextos largos, manteniendo un rendimiento competitivo. El modelo es multimodal nativo, capaz de procesar texto e imágenes.

La cuantización de mcham se ha realizado sobre los pesos GGUF de unsloth, aplicando una calibración iMatrix generada con el dataset `eaddario/imatrix-calibration`. Esta calibración se centra en herramientas, matemáticas, código y, específicamente, en los idiomas tailandés e inglés. El resultado es un conjunto de cuantizaciones IQ (IQ2_M, IQ3_XXS, IQ3_XS) que comprimen el modelo a un rango de 2 a 4 bits por peso, eliminando el soporte de otros idiomas para maximizar la precisión en los dos objetivos. Además, se incluye un proyector multimodal (MMPROJ) cuantizado a Q8_0 y un módulo MTP (multi-token prediction) cuantizado a IQ4_M, ambos derivados de los pesos oficiales de Qwen3.8-27B.

## Capacidades

- Generación de texto y razonamiento en tailandés e inglés, con soporte de contexto largo (hasta 64K tokens).
- Procesamiento multimodal: el modelo puede recibir imágenes como entrada gracias al proyector MMPROJ incluido.
- Razonamiento matemático y generación de código, con calibración específica para estas tareas.
- Soporte de tool calling y flujos agénticos, heredado del modelo base Qwen3.8-27B.
- Modo de razonamiento (reasoning) configurable, que puede desactivarse para reducir latencia.
- Aceleración de inferencia mediante MTP (multi-token prediction) y ngram-mod, que mejoran el throughput en generación.

## Casos de uso

- Atención al cliente en tailandés: el modelo puede gestionar conversaciones multi-turno con contexto largo (64K tokens) y responder con naturalidad en tailandés, ideal para chatbots de soporte en empresas tailandesas o con clientes de habla tailandesa.
- Procesamiento de documentos con imágenes: gracias a su capacidad multimodal, puede extraer información de facturas, formularios o capturas de pantalla en tailandés e inglés, y resumir o estructurar los datos.
- Generación de código en entornos con GPU limitada: con un tamaño de 8-10 GB, cabe en GPUs de 12 GB, permitiendo ejecutar asistentes de código locales en estaciones de trabajo con RTX 3060 o similares.
- Traducción y transcripción tailandés-inglés: al estar calibrado específicamente para estos dos idiomas, ofrece buena calidad en tareas de traducción y generación de contenido bilingüe.
- Automatización de oficina: el modelo base destaca en tareas de automatización (generación de informes, resúmenes, correos), y esta cuantización permite ejecutarlo en hardware modesto.
- Desarrollo de agentes conversacionales: con soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de agentes para tareas como reservas, consultas a bases de datos o gestión de inventario, todo en tailandés o inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. Sin embargo, el modelo base Qwen3.8-27B ha sido evaluado en análisis independientes: según el blog de Local AI Zone, supera a Meta Muse Glimmer (30B) en los 8 benchmarks comparados y a Claude Opus 4.6 en 15 de 19 pruebas solapadas, aunque estos datos corresponden al modelo original sin cuantizar y no a esta versión GGUF. Se recomienda validar el rendimiento de la cuantización en el caso de uso concreto antes de desplegarla en producción.

## Requisitos de hardware

- VRAM estimada: con la cuantización IQ2_M y 64K de contexto en Q4_1, el consumo ronda los 11,6 GB de VRAM, según el autor. Con IQ3_XS, el modelo ocupa 10,5 GiB, por lo que se recomienda al menos 12 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, o GPUs de datacenter como A10 o L4. Para las cuantizaciones más pequeñas (IQ2_M), una GPU de 12 GB es suficiente.
- Sí cabe en GPUs de consumo: la RTX 3060 12 GB es el mínimo recomendado; con 16 GB (RTX 4080, RTX 4090) se puede usar IQ3_XS con mayor margen.
- Opciones de despliegue: llama.cpp (llama-server), compatible con CUDA, y herramientas que usen GGUF como Ollama o LM Studio. El autor recomienda compilar llama.cpp con `-DGGML_CUDA_FA_ALL_QUANTS` para mezclar cuantizaciones KV.
- Latencia y throughput: no se proporcionan cifras exactas, pero el uso de MTP y ngram-mod puede mejorar significativamente el throughput de generación, especialmente en prompts no tailandeses.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3 B | 256K (según vLLM) | Apache 2.0 | safetensors | Modelo base completo, multimodal, sin cuantizar |
| mcham/Qwen3.8-27B-padthai-gguf | 27,3 B | 64K (recomendado) | Apache 2.0 | GGUF | Cuantización especializada en th/en, 8-10 GB |
| Gemma 3 27B (GGUF) | 27 B | 128K | Gemma license | GGUF | Alternativa de Google, multimodal, pero sin optimización para tailandés |

La principal diferencia frente al modelo original es el tamaño reducido (8-10 GB frente a ~55 GB en FP16) y la especialización idiomática. Frente a Gemma 3 27B, esta cuantización ofrece mejor soporte para tailandés gracias a la calibración iMatrix específica, aunque Gemma 3 tiene una ventana de contexto mayor.

## Limitaciones y advertencias

- El modelo solo soporta tailandés e inglés; el resto de idiomas se han eliminado deliberadamente durante la calibración, por lo que no debe usarse para otros idiomas.
- Las cuantizaciones agresivas (especialmente IQ2_M) pueden degradar la precisión en tareas complejas de razonamiento o matemáticas; el propio autor advierte que IQ2_M es "ligeramente inexacto para uso serio".
- Riesgo de alucinación inherente a los LLM, que puede verse incrementado por la cuantización de baja precisión.
- El contexto de 64K es una recomendación del autor; el modelo base soporta más, pero esta cuantización no ha sido validada para contextos superiores.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen3.8-27B y de los datasets utilizados.
- El módulo MTP está cuantizado de forma genérica y puede ofrecer menos ganancia de velocidad en prompts tailandeses, según el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcham/Qwen3.8-27B-padthai-gguf
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Análisis técnico de Qwen3.8-27B: https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Modelo base GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo GGUF genérico de gglm: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
