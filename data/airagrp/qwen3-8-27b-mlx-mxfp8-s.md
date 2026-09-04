# airagrp/Qwen3.8-27B-mlx-mxfp8-S

## Resumen

El modelo `airagrp/Qwen3.8-27B-mlx-mxfp8-S` es una conversión a MLX del modelo multimodal `Qwen/Qwen3.8-27B`, realizada por `airagrp`. Se trata de un modelo denso de 27.781 millones de parámetros (27.8B) que combina atención completa y atención GDN, además de una torre de visión para procesar imágenes y vídeo. La conversión aplica una receta de cuantización mixta que reduce el tamaño de los pesos de ~54 GB en bfloat16 a ~29 GB (6.5 bits por peso), manteniendo una calidad de lenguaje casi idéntica según las métricas de perplexity y divergencia KL reportadas.

El objetivo es permitir la ejecución eficiente del modelo en hardware de Apple Silicon mediante `mlx-vlm` y MLX, sin necesidad de GPU NVIDIA. La relevancia del modelo radica en que ofrece una alternativa de inferencia multimodal local con una huella de memoria moderada y con un head de predicción multi-token (MTP) integrado para decodificación especulativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + GDN) multimodal, base Qwen3.8-27B |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp8 (grupo 32, 8 bits) en MLP; nvfp4 (grupo 16, 4 bits) en atención completa y GDN; bfloat16 en embeddings, lm_head, MTP y vision tower |
| Idiomas soportados | en (inglés, según la ficha del autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, con tensores de escala para mxfp8/nvfp4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer híbrido de 64 capas. Según la receta de cuantización, 16 capas utilizan atención completa (proyecciones q, k, v, o) y 48 capas utilizan atención GDN (proyecciones in, out). La torre de visión se mantiene en bfloat16. Los embeddings, la cabeza de salida y el head MTP también se mantienen en bfloat16. La información sobre datos de entrenamiento no se proporciona en esta ficha; la model card remite a la ficha original de `Qwen/Qwen3.8-27B`.

La innovación técnica destacable es la cuantización mixta por módulo: los MLP se cuantizan a mxfp8 con grupo de 32, mientras que las capas de atención (tanto completa como GDN) se cuantizan a nvfp4 con grupo de 16. El head MTP se integra como 15 tensores en `mtp.safetensors`, lo que permite decodificación especulativa sin un modelo drafter separado. La detección de la precisión por módulo se realiza automáticamente mediante la presencia de tensores `.scales`.

## Capacidades

- Procesamiento multimodal imagen-texto a texto y de vídeo, con soporte de conversación en inglés según la ficha.
- Generación de texto con head MTP integrado para decodificación especulativa, usando `--draft-kind mtp` en `mlx-vlm`.
- Inferencia local en Apple Silicon con MLX y `mlx-vlm` 0.6.17.
- Cuantización mixta que permite mantener dos precisiones distintas según la capa, reduciendo el uso de memoria sin cambiar la carga.
- El modelo base Qwen3.8-27B no tiene capacidades de tool calling o agentes documentadas en esta ficha; la información disponible no las confirma.

## Casos de uso

- Asistente multimodal local en macOS: se puede integrar en una aplicación de escritorio para responder preguntas sobre imágenes usando MLX, con una huella de 26.62 GiB y soporte de conversación en inglés. Al ejecutarse en Apple Silicon, no requiere conexión a servicios cloud.
- Análisis de vídeo en entorno local: aunque no se especifican benchmarks de vídeo, la etiqueta `video` y la torre de visión en bfloat16 permiten usarlo como base para prototipos de descripción de clips cortos.
- Decodificación especulativa para reducir latencia en chat: gracias al head MTP integrado, se puede lanzar `mlx-vlm` con `--draft-kind mtp` para acelerar la generación en peticiones cortas de texto o imagen.
- Investigación de cuantización: el modelo sirve como referencia para comparar distintas recetas de cuantización midiendo PPL y KLD en WikiText-2, útil para equipos que evalúan el equilibrio entre tamaño y fidelidad.
- Prototipado de pipelines de visión por computador en Mac: investigadores con Apple Silicon pueden probar prompts de imagen-texto sin trasladar datos a GPU NVIDIA, lo que facilita el desarrollo iterativo.
- Despliegue de chatbots privados con datos sensibles: al ejecutarse localmente, se pueden procesar imágenes o documentos internos sin enviarlos a servicios externos, siempre que el caso de uso esté dentro de la licencia Apache-2.0.
- Educación y demostraciones: el modelo es un ejemplo de conversión de un modelo de 27B a un formato ligero y ejecutable en ordenadores de gama alta, útil para mostrar técnicas de cuantización y decodificación especulativa.

## Benchmarks y rendimiento

Los resultados reportados son métricas de fidelidad de cuantización, no benchmarks de tareas de razonamiento. No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la información disponible. La KLD se calcula como la divergencia KL media por token entre la distribución de salida del modelo cuantizado y la del modelo bf16.

| Model | Size (GiB) | PPL WikiText-2 | ΔPPL vs bf16 | KLD vs bf16 (nats/token) |
|---|---|---|---|---|
| Qwen3.8-27B (bf16 reference) | 51.75 | 6.935 | — | — |
| Qwen3.8-27B-mlx-mxfp8-S | 26.62 | 6.922 | -0.014 | 0.0278 |
| Qwen3.8-27B-mlx-mxfp8-M | 29.78 | 6.893 | -0.042 | 0.0068 |
| Qwen3.8-27B-mlx-mxfp8-L | 34.79 | 6.937 | +0.002 | 0.0046 |
| Qwen3.8-27B-mlx-mxfp8-XL | 36.31 | 6.937 | +0.002 | 0.0037 |
| Qwen3.8-27B-mlx-nvfp4-S | 19.15 | 7.024 | +0.088 | 0.0573 |
| Qwen3.8-27B-mlx-nvfp4-M | 21.57 | 6.983 | +0.048 | 0.0490 |
| Qwen3.8-27B-mlx-nvfp4-L | 22.31 | 6.987 | +0.051 | 0.0407 |
| Qwen3.8-27B-mlx-nvfp4-XL | 28.84 | 7.024 | +0.089 | 0.0382 |

Estos datos proceden de la model card del autor, medidos sobre el split de test de `wikitext-2-raw-v1` con ventanas de 2048 tokens y caché de KV fresca por ventana.

## Requisitos de hardware

- VRAM: no aplica; MLX usa memoria unificada en Apple Silicon. El modelo ocupa 26.62 GiB de pesos, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada para dejar margen al contexto.
- GPU recomendadas: ninguna. Requiere Apple Silicon (M1 o posterior); no es compatible con GPU NVIDIA en esta conversión.
- ¿Cabe en consumer GPU? No sin reconvertir los pesos; el formato de cuantización está diseñado para el ecosistema MLX.
- Opciones de despliegue: `mlx-vlm` versión 0.6.17 (CLI y API Python) o MLX directamente. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la ficha.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Model | Parámetros | Contexto | Tamaño (GiB) | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | 27.8B | no disponible | 51.75 | 6.935 | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-mlx-mxfp8-S | 27.8B | no disponible | 26.62 | 6.922 | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-mlx-mxfp8-M | 27.8B | no disponible | 29.78 | 6.893 | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-mlx-nvfp4-S | 27.8B | no disponible | 19.15 | 7.024 | Apache-2.0 | HuggingFace |

La variante S equilibra tamaño y calidad, con PPL incluso ligeramente mejor que el bf16 de referencia. La variante M presenta una KLD menor y una PPL aún más baja, pero a costa de más memoria. La variante nvfp4-S es más compacta, pero muestra una deriva mayor respecto al modelo bf16.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se han publicado análisis de sesgo en la ficha.
- Riesgo de alucinación: no evaluado en la información disponible; la degradación de calidad por cuantización en tareas de razonamiento no se mide con PPL/KLD.
- Limitaciones de contexto: no disponible; requiere consultar la model card original de Qwen3.8-27B.
- Idiomas: la ficha solo lista inglés; aunque Qwen suele ser multilingüe, no se confirma en esta conversión.
- Hardware: solo Apple Silicon; no se puede ejecutar en GPU NVIDIA sin reconvertir o usar otro framework.
- Cuantización mixta: el uso de nvfp4 en atención (tanto completa como GDN) puede degradar el rendimiento en tareas que dependen de precisión numérica; los benchmarks disponibles solo evalúan perplexity, no tareas de razonamiento.
- MTP: el head integrado está en bfloat16 y está pensado solo para speculative decoding; ignorarlo no afecta a la inferencia base, pero si se usa con `mlx-vlm` requiere la versión 0.6.17.
- Licencia Apache-2.0: permisiva para uso comercial, pero requiere conservar el aviso de licencia; se remite a la licencia original del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-mlx-mxfp8-S
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Variante comparada mxfp8-M: https://huggingface.co/airagrp/Qwen3.8-27B-mlx-mxfp8-M
- Variante comparada nvfp4-S: https://huggingface.co/airagrp/Qwen3.8-27B-mlx-nvfp4-S
