# Anbeeld/Qwen3.8-27B-GGUF-Bartowski-SINQ

## Resumen

Anbeeld/Qwen3.8-27B-GGUF-Bartowski-SINQ es un conjunto de cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, un transformer multimodal de tipo image-text-to-text con 27.323.597.824 parametros (27,3 mil millones). Lo desarrolla el usuario Anbeeld aplicando la tecnica SINQ sobre las recetas de cuantizacion de Bartowski, y esta pensado para su uso en BeeLlama.cpp v0.5.0, la unica implementacion que soporta SINQ. El modelo base Qwen3.8-27B es de Alibaba Qwen y se distribuye bajo licencia Apache 2.0.

El problema que resuelve esta ficha es el de la perdida de calidad al comprimir un modelo de 27B para que quepa en hardware de consumo. Las cuantizaciones SINQ seleccionadas presentan, en la mayoria de recetas, una KLD media inferior a la de las cuantizaciones estandar equivalentes de Bartowski, lo que se traduce en una distribucion de probabilidad mas cercana a la referencia BF16. El repositorio ocupa 441,4 GB e incluye variantes desde IQ2_XXS (8,887 GB) hasta recetas de 4 bits (en torno a 16 GB), lo que permite desplegar el modelo en GPUs de consumo con 12-24 GB de VRAM segun la cuantizacion elegida.

La relevancia actual reside en que combina un modelo multimodal de 27B con contexto de 64K tokens (segun la metodologia de evaluacion descrita) y un formato GGUF optimizado, lo que facilita su ejecucion local en entornos con recursos limitados sin renunciar a una calidad cercana al modelo original en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parametros totales | 27.323.597.824 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (64K) segun la metodologia de evaluacion KLD; contexto maximo oficial del modelo base no disponible |
| Tipos de cuantizacion | GGUF: IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, Q2_K_L, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, Q4_0, Q4_K_S, Q3_K_XL (entre otras recetas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con SINQ aplicado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de tipo image-text-to-text, segun la etiqueta de pipeline del repositorio. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas internas como atencion lineal o decodificacion especulativa.

La innovacion tecnica de esta ficha no reside en el modelo base, sino en el proceso de cuantizacion: se aplica SINQ (una tecnica de cuantizacion con ruido o sesgo controlado, segun la nomenclatura del autor) sobre las recetas de Bartowski, generando variantes con parametros de ancho (width) y fuerza (strength) especificos. Por ejemplo, IQ2_XXS usa width 16 y strength 1, mientras que IQ2_M usa width 32 y strength 0,5. La evaluacion se realizo con el corpus completo Wikitext-2 test, tomando el modelo BF16 como referencia, sobre 297.193 objetivos de siguiente token alineados, con contexto de 65.536 tokens, cache K/V en BF16, batch 2048 y microbatch 512. El soporte de SINQ requiere BeeLlama.cpp v0.5.0.

## Capacidades

- Generacion de texto conversacional y multimodal image-text-to-text (el pipeline declarado es image-text-to-text).
- Procesamiento de imagenes junto con texto, segun la modalidad del modelo base.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.8-27B, aunque no se detallan en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no estan listados).
- Modo thinking: no disponible en la informacion proporcionada.
- Contexto largo: la evaluacion se realiza con 64K tokens, lo que sugiere soporte de ventanas de contexto amplias.

## Casos de uso

- Despliegue local de un modelo multimodal de 27B en GPUs de consumo: con las cuantizaciones de 4 bits (Q4_K_S, 16,369 GB; Q4_0, 16,355 GB) el modelo puede ejecutarse en GPUs con 24 GB de VRAM, como una RTX 4090, manteniendo una KLD media de 0,028-0,038 frente a la referencia BF16.
- Analisis de documentos con imagenes y texto: al ser un modelo image-text-to-text, permite procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales, aprovechando el contexto de 64K tokens para documentos extensos.
- Asistencia conversacional multi-turno: el contexto de 64K tokens y el formato GGUF conversacional permiten mantener dialogos largos con historial extenso en entornos de inferencia local.
- Prototipado e investigacion en cuantizacion: las distintas recetas (IQ2_XXS hasta Q3_K_XL) y los datos de KLD, top-1 y PPL publicados permiten estudiar el compromiso entre tamano y calidad en un modelo de 27B.
- Inferencia en servidores con VRAM limitada: las variantes IQ2_XXS (8,887 GB) e IQ2_XS (9,094 GB) permiten ejecutar el modelo en GPUs de 12 GB, con una top-1 agreement de 79,7-81,2 % respecto a BF16.
- Evaluacion comparativa de tecnicas de cuantizacion: los graficos de KLD medio y top-1 frente a tamano, que comparan Bartowski estandar, Bartowski + SINQ y Unsloth, sirven para seleccionar la receta optima segun el presupuesto de memoria.
- Generacion de codigo en pipelines locales: aunque no se detalla soporte de tool calling, el modelo puede integrarse en flujos de autocompletado o generacion de codigo en estaciones de trabajo con GPU unica, usando cuantizaciones Q4 o Q3.

## Benchmarks y rendimiento

Los datos disponibles son metricas de cuantizacion (KLD, top-1 agreement y PPL) frente a la referencia BF16, no benchmarks de tareas como MMLU o HumanEval. Se presentan las recetas seleccionadas:

| Receta | Tamano (GB) | Width | Strength | KLD medio | KLD medio stock | Mejora KLD | Top-1 | PPL |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| IQ2_XXS | 8,887 | 16 | 1 | 0,292708 | 0,348437 | +15,99 % | 79,728 % | 7,2898 |
| IQ2_XS | 9,094 | 16 | 1 | 0,258898 | 0,307513 | +15,81 % | 81,241 % | 6,7813 |
| IQ2_S | 9,690 | 16 | 1 | 0,222801 | 0,309424 | +27,99 % | 82,538 % | 6,6952 |
| IQ2_M | 10,528 | 32 | 0,5 | 0,184837 | 0,178343 | -3,64 % | 84,948 % | 6,9293 |
| Q2_K | 10,827 | 16 | 1 | 0,172353 | 0,175685 | +1,90 % | 84,839 % | 6,5684 |
| IQ3_XXS | 12,326 | 64 | 1 | 0,088562 | 0,094982 | +6,76 % | 89,420 % | 6,2762 |
| Q3_K_S | 12,746 | 16 | 1 | 0,081897 | 0,085008 | +3,66 % | 90,207 % | 6,3037 |
| IQ3_XS | 12,805 | 32 | 0,5 | 0,114714 | 0,124818 | +8,10 % | 89,276 % | 6,7982 |
| Q2_K_L | 13,087 | 32 | 0,5 | 0,171494 | 0,186185 | +7,89 % | 85,281 % | 6,7191 |
| Q3_K_M | 13,410 | 16 | 1 | 0,069874 | 0,079508 | +12,12 % | 91,014 % | 6,1224 |
| Q3_K_L | 14,129 | 32 | 0,5 | 0,058107 | 0,066205 | +12,23 % | 91,878 % | 6,1459 |
| IQ3_M | 14,866 | 32 | 1 | 0,068673 | 0,062360 | -10,12 % | 91,450 % | 6,4201 |
| IQ4_XS | 15,482 | 16 | 1 | 0,029491 | 0,033945 | +13,12 % | 94,921 % | 6,0682 |
| Q4_0 | 16,355 | 32 | 1 | 0,038434 | 0,061367 | +37,37 % | 93,903 % | 6,1088 |
| Q4_K_S | 16,369 | 16 | 0,5 | 0,028394 | 0,034322 | +17,27 % | 95,054 % | 6,0809 |
| Q3_K_XL | 16,398 | 32 | 0,75 | 0,058178 | 0,060701 | +4,16 % | no disponible | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas la cache K/V. Para IQ2_XXS (8,887 GB) se necesitan en torno a 10-12 GB; para Q4_K_S (16,369 GB), en torno a 18-20 GB con contexto moderado; para contexto completo de 64K la cache K/V en BF16 incrementa notablemente el consumo.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q3; RTX 4080/4070 Ti (16 GB) para IQ3_XXS e IQ3_XS; GPUs de 12 GB para IQ2_XXS e IQ2_XS; A100 o H100 para despliegues con contexto largo y mayor concurrencia.
- Cabe en GPU de consumo: si, en RTX 4090 (Q4_K_S, Q4_0, IQ4_XS), RTX 4080 (IQ3_XXS, Q3_K_S) y GPUs de 12 GB (IQ2_XXS, IQ2_XS).
- Opciones de despliegue: BeeLlama.cpp v0.5.0 es obligatorio para las variantes SINQ; llama.cpp estandar no soporta SINQ. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Anbeeld/Qwen3.8-27B-GGUF-Bartowski-SINQ | 27,3B | 64K (evaluacion) | GGUF con SINQ | Apache 2.0 | Requiere BeeLlama.cpp v0.5.0 |
| Bartowski/Qwen3.8-27B-GGUF | 27,3B | no disponible | GGUF estandar | Apache 2.0 | Referencia de recetas; KLD medio superior en la mayoria de recetas |
| Unsloth (Qwen3.8-27B) | 27,3B | no disponible | GGUF | Apache 2.0 | Comparado en los graficos de KLD y top-1; datos numericos no disponibles en el texto |
| Qwen/Qwen3.8-27B (BF16) | 27,3B | no disponible | safetensors | Apache 2.0 | Referencia de evaluacion |

## Limitaciones y advertencias

- Requiere BeeLlama.cpp v0.5.0: las variantes SINQ no son compatibles con llama.cpp estandar ni con otras herramientas que no implementen SINQ.
- Perdida de calidad en cuantizaciones agresivas: IQ2_XXS presenta una KLD media de 0,292708 y un top-1 del 79,728 %, lo que implica una divergencia notable respecto a BF16.
- Excepciones a la mejora: IQ2_M (-3,64 %) e IQ3_M (-10,12 %) muestran peor KLD medio que sus equivalentes estandar de Bartowski.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; inherente a los modelos generativos.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B.
- Contexto: aunque la evaluacion usa 64K tokens, el maximo oficial del modelo base no se especifica; contextos muy largos incrementan el consumo de VRAM por la cache K/V.
- Repositorio de 441,4 GB: la descarga completa es costosa; se recomienda descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Anbeeld/Qwen3.8-27B-GGUF-Bartowski-SINQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Recetas de cuantizacion de Bartowski: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- BeeLlama.cpp v0.5.0: https://github.com/Anbeeld/beellama.cpp
- Grafico KLD medio frente a tamano (stock vs SINQ vs Unsloth): stock-vs-sinq-vs-unsloth-mean-kld.png (en el repositorio)
- Grafico top-1 agreement frente a tamano: stock-vs-sinq-vs-unsloth-top-1.png (en el repositorio)
