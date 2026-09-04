# qtum/DeepSeek-V4-Flash-Vision-Exp-GGUF

## Resumen

DeepSeek-V4-Flash-Vision-Exp-GGUF es una cuantización en formato GGUF del modelo DeepSeek-V4-Flash-Vision-Exp, desarrollado por DeepSeek AI. La cuantización ha sido realizada por el usuario qtum, que ha filtrado los tensores del encoder de visión para ofrecer una versión exclusivamente textual. El modelo original es un sistema multimodal de arquitectura MoE (mixture of experts) con 256 expertos por capa y selección de los 6 más relevantes en cada paso, lo que implica 50.4B parámetros activos por forward pass. Según la model card, el modelo total tiene 2.1T parámetros, y su ventana de contexto es de 128K tokens.

Esta ficha es relevante porque permite ejecutar un modelo de razonamiento de gran escala en entornos locales mediante llama.cpp, con soporte de cuantizaciones de 7 niveles que van desde Q3_K_M hasta IQ1_S. La cuantización se ha calibrado con un dataset comunitario de alta calidad y se ha validado mediante pruebas de perplejidad. La principal limitación es la ausencia de soporte de visión: la inferencia es puramente textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V4 (MoE, 256 expertos por capa, top-6 routing) |
| Parametros totales | 2.1T (256 × 8.4B, segun model card) |
| Parametros activos | 50.4B |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Q3_K_M, IQ3_XXS, Q2_K, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors y GGUF; el repo contiene GGUF) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp es un transformer multimodal con arquitectura MoE. La capa de expertos está compuesta por 256 expertos, de los cuales se seleccionan 6 mediante routing. Las tres primeras capas utilizan hash routing para la selección de expertos, y el modelo incorpora hyper-connections, es decir, conexiones de salto entre capas que mejoran la estabilidad del entrenamiento. La cuantización GGUF conserva la estructura completa con 1328 tensores y 256 expertos verificados.

La información disponible no incluye datos sobre la composición del dataset de entrenamiento del modelo base ni sobre técnicas de alineación como RLHF o DPO. La cuantización, por su parte, fue calibrada con un dataset comunitario de alta calidad bajo licencia MIT. Las capas críticas (attention, expertos compartidos, router, compressor, hyper-connections, FFN gate input y embeddings) se protegieron con cuantizaciones de mayor precisión para minimizar la pérdida de calidad.

## Capacidades

- Generación de texto y razonamiento de propósito general.
- Soporte de chat conversacional, como indica la etiqueta `conversational` del repositorio.
- Inferencia únicamente textual: el encoder de visión ha sido eliminado, por lo que no acepta imágenes.
- Multilingüe: soporta inglés y chino.
- Cuantizaciones optimizadas para ejecución con llama.cpp, llama-server y llama-cpp-python.
- Validación de calidad mediante pruebas de perplejidad en todas las cuantizaciones.

No se documenta soporte de tool calling ni function calling en la información disponible. Tampoco se mencionan capacidades específicas de agentes o razonamiento multi-paso.

## Casos de uso

- Generación de código en entornos de investigación: el modelo puede generar funciones Python y explicar conceptos técnicos, como se muestra en los ejemplos de la model card, lo que lo hace útil para prototipado y análisis de algoritmos.
- Procesamiento de documentos extensos: con 128K tokens de contexto, puede analizar informes, papers y contratos de gran longitud sin fragmentar el contenido.
- Despliegue de servidores de inferencia locales: mediante llama-server, se puede exponer una API compatible con OpenAI para aplicaciones internas.
- Evaluación de cuantizaciones MoE a gran escala: permite comparar el impacto de distintas cuantizaciones (Q3_K_M vs IQ1_S) en la perplejidad y el uso de VRAM.
- Investigación en arquitecturas de mixture of experts: el routing con 256 expertos y top-6 ofrece un caso de estudio para análisis de sparse MoE.
- Entornos con múltiples GPUs: gracias a su alto número de parámetros activos, es adecuado para tareas de razonamiento complejo que requieren gran capacidad de cómputo, como síntesis de conocimiento o razonamiento matemático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona únicamente datos de perplejidad (PPL) para las distintas cuantizaciones, tomando como baseline el modelo en BF16:

| Cuantizacion | Tamano de archivo | PPL | Delta (%) |
|---|---|---|---|
| BF16 (baseline) | no disponible | 2.3549 | - |
| Q3_K_M | 130 GB | 2.66 | +13% |
| IQ3_XXS | 106 GB | 3.17 | +35% |
| Q2_K | 101 GB | 3.70 | +57% |
| IQ2_XS | 83 GB | 5.22 | +122% |
| IQ2_XXS | 75 GB | 5.95 | +153% |
| IQ1_M | 65 GB | 8.43 | +258% |
| IQ1_S | 59 GB | 9.22 | +291% |

## Requisitos de hardware

- VRAM estimada para inferencia, segun la model card:
  - Q3_K_M: ~135 GB
  - IQ3_XXS: ~110 GB
  - Q2_K: ~105 GB
  - IQ2_XS: ~86 GB
  - IQ2_XXS: ~78 GB
  - IQ1_M: ~67 GB
  - IQ1_S: ~61 GB
- GPUs recomendadas: 2×H100 (80GB) o 2×A100 (80GB) para Q3_K_M, IQ3_XXS y Q2_K; 1×H100 (80GB) para IQ2_XXS; 1×A100 (80GB) para IQ1_M e IQ1_S.
- No cabe en GPUs de consumo: la cuantizacion mas pequeña (IQ1_S) requiere al menos 61 GB de VRAM.
- Opciones de despliegue: llama.cpp (compilado con `make LLAMA_CUDA=1`), llama-server y llama-cpp-python. No se menciona soporte para vLLM ni TGI en la informacion disponible.
- Los requisitos de VRAM incluyen pesos y cache KV; las necesidades reales varian segun la longitud de contexto.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la informacion disponible. La comparativa mas directa es con el modelo base original:

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp | 2.1T (segun model card) | 128K | Si | MIT | Safetensors |
| qtum/DeepSeek-V4-Flash-Vision-Exp-GGUF | 2.1T (segun model card) | 128K | No (text-only) | MIT | GGUF |

## Limitaciones y advertencias

- No soporta entrada de imagenes: la cuantizacion text-only ha eliminado el encoder de vision, por lo que no se puede utilizar para tareas multimodales.
- Requisitos de memoria muy elevados: incluso la cuantizacion mas pequena (IQ1_S) necesita alrededor de 61 GB de VRAM, lo que limita su uso a entornos con GPU profesional.
- Archivos divididos en varios shards: es necesario descargar todas las partes para que el modelo funcione correctamente.
- No se han publicado analisis de sesgos ni de riesgo de alucinacion en la informacion disponible.
- La licencia MIT permite uso comercial, pero es recomendable revisar las condiciones del modelo base y de los datasets utilizados en la cuantizacion.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/qtum/DeepSeek-V4-Flash-Vision-Exp-GGUF
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Cuantizacion oficial (ggml-org): https://huggingface.co/ggml-org/DeepSeek-V4-Flash-Vision-Exp-GGUF
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
