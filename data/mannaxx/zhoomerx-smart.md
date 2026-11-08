# Mannaxx/zhoomerx-smart

## Resumen

`Mannaxx/zhoomerx-smart` es una publicacion derivada de Qwen2.5-14B-Instruct, el modelo de lenguaje instruido de 14.700 millones de parametros desarrollado por el equipo Qwen de Alibaba Cloud. El repositorio, alojado por el usuario Mannaxx, contiene pesos en formato GGUF del modelo base y se distribuye bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero ni de un ajuste fino documentado: la model card reproduce integramente la documentacion oficial de Qwen2.5-14B-Instruct-GGUF sin aportar informacion sobre modificaciones, destilacion o cambios en los pesos.

El modelo base emplea una arquitectura transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV, con 48 capas y atencion con query grouping (40 cabezas de consulta frente a 8 de clave-valor). Su ventana de contexto nativa es de 32.768 tokens en formato GGUF (hasta 131.072 en pesos no cuantizados con YARN), con capacidad de generar hasta 8.192 tokens. Qwen2.5-14B-Instruct se situa en la franja media-alta de la familia Qwen2.5, que abarca desde 0,5 hasta 72.000 millones de parametros.

La relevancia de esta ficha radica en que el repositorio es, en la practica, una redistribucion de los GGUF oficiales de Qwen bajo un identificador distinto, con cero descargas y cero valoraciones en el momento de la consulta. Para evaluaciones en produccion conviene remitirse al repositorio oficial de Qwen, que recibe mantenimiento, actualizaciones y soporte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en atencion QKV |
| Parametros totales | 14.770.033.664 (14,7B) |
| Parametros activos | No aplica (modelo denso) |
| Parametros sin embeddings | 13,1B |
| Longitud de contexto | 32.768 tokens en GGUF; hasta 131.072 con YARN en pesos no cuantizados |
| Tokens de generacion maxima | 8.192 |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | 29+ idiomas segun el modelo base (la model card del repo declara solo `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 108,8 GB con multiples cuantizaciones) |
| Capas | 48 |
| Cabezas de atencion | 40 Q / 8 KV (GQA) |
| Pipeline | text-generation |
| Compatibilidad | endpoints_compatible |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de 14,7B parametros (13,1B sin contar embeddings), con 48 capas y atencion con query grouping que reduce el coste de memoria KV manteniendo 40 cabezas de consulta y 8 de clave-valor. Incorpora RoPE para codificacion posicional, activacion SwiGLU y normalizacion RMSNorm, ademas de sesgo en las proyecciones de atencion QKV. El contexto nativo es de 32.768 tokens, ampliable a 131.072 mediante YARN (soportado en vLLM, no en llama.cpp para GGUF).

Segun la documentacion oficial de Qwen2.5, el entrenamiento combina preentrenamiento y post-entrenamiento con modelos expertos especializados en codigo y matematicas, lo que explica la mejora sustancial frente a Qwen2 respecto a conocimiento, generacion de codigo, matematicas, seguimiento de instrucciones, generacion de textos largos (mas de 8K tokens), comprension de datos estructurados y produccion de JSON. El modelo base declara soporte multilingue para mas de 29 idiomas. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO. La model card del repositorio de Mannaxx no documenta ningun proceso adicional de ajuste, fusion o destilacion sobre el modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno con formato de chat instruido.
- Razonamiento y resolucion de problemas, con mejoras notables en matematicas respecto a la generacion anterior.
- Generacion de codigo en multiples lenguajes, apoyada en modelos expertos especializados durante el entrenamiento.
- Comprension y generacion de datos estructurados, especialmente JSON y tablas.
- Generacion de textos largos de mas de 8.000 tokens.
- Seguimiento de instrucciones robusto frente a diversidad de system prompts, util para role-play y condicionamiento de chatbots.
- Soporte multilingue de mas de 29 idiomas segun el modelo base (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, entre otros).
- Compatibilidad con endpoints tipo OpenAI (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto de hasta 32.768 tokens, suficiente para incorporar historial extenso e informacion de producto en el system prompt, y su robustez frente a distintos system prompts facilita el condicionamiento por rol.
- Generacion de codigo en pipelines de desarrollo: con las mejoras en codigo del modelo base, puede emplearse para autocompletado, generacion de tests y refactorizacion en herramientas tipo asistente, desplegado en local mediante llama.cpp u Ollama.
- Extraccion y generacion de JSON estructurado: su capacidad documentada para generar salidas estructuradas lo hace adecuado para tareas de extraccion de entidades, rellenado de formularios y transformacion de datos en flujos automatizados.
- Procesamiento de documentos largos: la ventana de 32K tokens permite resumir contratos, informes o articulos extensos, y la generacion de hasta 8K tokens posibilita resumenes detallados.
- Asistente multilingue: con soporte declarado para mas de 29 idiomas en el modelo base, puede emplearse en traduccion y atencion en espanol, portugues, frances, aleman, entre otros, aunque la model card del repo solo declare `en`.
- Analisis de datos tabulares: su capacidad para comprender tablas y datos estructurados permite tareas de interpretacion de CSV, generacion de consultas SQL y explicacion de resultados.
- Despliegue en hardware de consumo: las cuantizaciones GGUF (q4_K_M, q5_K_M, q6_K) permiten ejecutar el modelo en GPUs consumer de 12-24 GB de VRAM, habilitando prototipado local sin dependencia de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las evaluaciones oficiales del blog de Qwen2.5 y a la documentacion de benchmarks de cuantizacion de Qwen, pero no incluye cifras concretas para este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): q2_K ~6 GB, q3_K_M ~8 GB, q4_0 ~9 GB, q4_K_M ~10 GB, q5_0 ~11 GB, q5_K_M ~12 GB, q6_K ~14 GB, q8_0 ~18 GB. Los pesos en bfloat16 requieren aproximadamente 30 GB.
- GPU recomendadas: A100 40/80 GB o H100 para precision completa y contextos largos; RTX 4090 (24 GB) para q6_K y q8_0; RTX 3090 (24 GB) similar; RTX 4080/4070 Ti (16 GB) para q5_K_M; RTX 4060 Ti 16 GB para q4_K_M y q5_K_M.
- Cabe en GPU consumer: si, en tarjetas de 12-24 GB con cuantizaciones q4 a q8. Para contextos largos (32K) conviene reservar VRAM adicional para la cache KV.
- Opciones de despliegue: llama.cpp (recomendado por la model card), Ollama, vLLM (necesario para YARN y contexto de 131K), TGI, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card remite a la pagina de benchmarks de velocidad de Qwen para cifras de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Mannaxx/zhoomerx-smart (este repo) | 14,7B | 32K (GGUF) / 131K (YARN) | Apache 2.0 | GGUF | Redistribucion no oficial, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct | 14,7B | 32K / 131K con YARN | Apache 2.0 | safetensors, GGUF | Repositorio oficial, mantenido |
| Qwen/Qwen2.5-14B-Instruct-GGUF | 14,7B | 32K / 131K con YARN | Apache 2.0 | GGUF | Repositorio oficial, mantenido |
| Mistral-Nemo-Instruct-2407 | 12B | 128K | Apache 2.0 | safetensors, GGUF | Repositorio oficial |

La comparativa directa con el repositorio oficial de Qwen2.5-14B-Instruct-GGUF es la mas relevante: ambos contienen esencialmente los mismos pesos en el mismo formato y bajo la misma licencia, pero el repositorio oficial recibe mantenimiento y documentacion actualizada. No se dispone de datos de rendimiento especificos de este repositorio para comparar con alternativas.

## Limitaciones y advertencias

- El repositorio no documenta ningun proceso de ajuste, fusion o modificacion respecto a Qwen2.5-14B-Instruct; la model card es una copia de la oficial de Qwen, lo que impide verificar que los pesos sean identicos a los originales.
- Cero descargas y cero valoraciones: no hay evidencia de uso ni validacion por parte de la comunidad.
- La model card declara unicamente el idioma `en`, aunque el modelo base soporta mas de 29 idiomas; la discrepancia genera incertidumbre sobre el comportamiento multilingue real de esta redistribucion.
- Riesgo de alucinacion inherente a los modelos de 14B, especialmente en tareas de conocimiento factual especializado y fechas.
- Sesgos potenciales heredados del corpus de entrenamiento de Qwen2.5, no documentados en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los pesos antes de desplegarlos en produccion.
- El contexto de 131K solo es accesible con YARN en vLLM; en llama.cpp con GGUF el limite practico es de 32.768 tokens.
- El repositorio ocupa 108,8 GB por incluir multiples cuantizaciones; la descarga selectiva de un unico fichero GGUF es recomendable.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en arquitecturas de agentes que dependan de estas capacidades.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mannaxx/zhoomerx-smart
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- GGUF oficial de Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-GGUF
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Guia de llama.cpp para Qwen: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmarks de cuantizacion: https://qwen.readthedocs.io/en/latest/benchmark/quantization_benchmark.html
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
