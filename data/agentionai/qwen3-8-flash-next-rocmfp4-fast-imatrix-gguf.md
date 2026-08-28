# agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-imatrix-GGUF

## Resumen

Qwen3.8-Flash-Next-ROCmFP4-FAST-imatrix-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-Flash-Next, desarrollada por el usuario agentionai. El modelo base, creado por Alibaba Qwen, es un modelo de lenguaje de arquitectura MoE con 125 mil millones de parámetros principales más una tabla de n-gramas de 51,2 mil millones de parámetros, activando solo 6 mil millones por token. Esta cuantización emplea el formato experimental ROCmFP4-FAST, diseñado para mantener todo el modelo residente en la VRAM de GPUs AMD, especialmente en el procesador Ryzen AI MAX+ 395 (Strix Halo) con 96 GiB de memoria unificada.

La relevancia de este archivo radica en que permite ejecutar un modelo de gran tamaño en hardware de consumo con una pérdida de calidad mínima: la perplejidad en wikitext-2 es de 4,4315 frente a 4,0068 del modelo sin cuantizar, y el uso de una matriz de importancia (imatrix) reduce la brecha en aproximadamente un 37 % respecto a la misma receta sin imatrix. Se trata de un build experimental que requiere un fork de llama.cpp con soporte para los tipos de cuantización ROCmFPx, aún no integrados en la rama principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con tabla n-gram PLE de 51,2 B parametros |
| Parametros totales | 125 B (modelo principal) + 51,2 B (tabla n-gram) = 176,2 B |
| Parametros activos | 6 B por token |
| Longitud de contexto | 32768 tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST (expertos, atencion, GDN, hyper-connections), Q3_0_ROCMFPX (tabla n-gram), Q6_K (embeddings y output) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (shards de 5 o 6 archivos) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE con 512 expertos y routing top-10, complementada por una tabla de n-gramas (PLE) de 51,2 mil millones de parámetros que se activa junto con los expertos. Según la información del repositorio oficial, el entrenamiento del modelo base requirió aproximadamente 1/9 del coste de Qwen3.7-Plus, manteniendo o mejorando capacidades en tareas de código y ofimática. No se dispone de detalles adicionales sobre el dataset de entrenamiento o el uso de RLHF/DPO en la información proporcionada.

La cuantización ROCmFP4-FAST aplica 4,25 bits por peso a los tensores de expertos, atención y conexiones, 3,50 bits a la tabla n-gram y 6,56 bits a embeddings y capa de salida. La versión con imatrix se calibró con 1540 fragmentos de dos corpus: 696 del corpus semántico v5 de bartowski y 844 del corpus de Thireus. Dado que con 512 expertos y routing top-10 cada experto recibe pocas activaciones por fragmento, la fusión de ambos corpus mejora la cobertura. La tabla n-gram no se recalibró; solo los tensores de expertos usaron la imatrix.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base Qwen3.8-Flash-Next.
- Soporte de decodificacion especulativa MTP (multi-token prediction) mediante un modelo auxiliar separado, con una tasa de aceptacion de borrador de 0,327 en una muestra de prosa corta.
- Capacidad de mantener todo el modelo en GPU sin fallback a RAM del host, gracias al layout con tabla n-gram dividida en 16 tensores por cabeza.
- Soporte de contexto largo de 32768 tokens, adecuado para conversaciones multi-turno y documentos extensos.
- Compatibilidad con backends Vulkan a traves del fork de llama.cpp, lo que permite su ejecucion en GPUs AMD y otros dispositivos compatibles.
- No se especifica en la informacion disponible si el modelo base soporta tool calling, function calling o capacidades multimodales.

## Casos de uso

- Inferencia local en equipos con AMD Strix Halo (Ryzen AI MAX+ 395 / Radeon 8060S): el layout root esta disenado para los 96 GiB de VRAM de este procesador, manteniendo los 176,2 B de parametros completamente en GPU.
- Despliegue en entornos con restricciones de memoria host: al no depender de RAM del sistema para la tabla n-gram, se evita la penalizacion de rendimiento por transferencia de datos entre CPU y GPU.
- Experimentacion con formatos de cuantizacion ROCmFPx: este archivo sirve como referencia para evaluar la calidad de cuantizacion con imatrix frente a la misma receta sin ella, con una mejora de perplejidad de 4,6785 a 4,4315.
- Generacion de texto con decodificacion especulativa: combinado con el modelo MTP, se puede acelerar la inferencia en tareas de generacion larga, aunque el rendimiento exacto depende del hardware y la carga.
- Investigacion sobre modelos MoE con tablas n-gram: la disponibilidad de dos layouts (tabla dividida y tabla unida) permite estudiar el impacto del particionado de tensores en la compatibilidad con Vulkan.
- Aplicaciones de procesamiento de lenguaje natural que requieran contexto largo, como resumen de documentos, analisis de codigo o asistentes conversacionales, gracias a la ventana de 32768 tokens.

## Benchmarks y rendimiento

La unica metrica publicada es la perplejidad en wikitext-2 raw, medida con 145 fragmentos a contexto 2048:

| Build | PPL |
|---|---|
| Referencia sin cuantizar (segun PR 27742) | 4,0068 +/- 0,02271 |
| Misma receta sin imatrix | 4,6785 +/- 0,02780 |
| Este archivo (con imatrix) | 4,4315 +/- 0,02580 |

No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la informacion disponible. La imatrix cierra aproximadamente el 37 % de la brecha restante frente al modelo sin cuantizar, al mismo numero de bits por peso.

## Requisitos de hardware

- VRAM estimada: aproximadamente 85 GiB para el layout root (tabla n-gram dividida en 16 tensores), segun el comando de ejecucion recomendado.
- GPU recomendada: AMD Ryzen AI MAX+ 395 / Radeon 8060S (Strix Halo) con 96 GiB de VRAM. Tambien puede ejecutarse en otras GPUs con suficiente VRAM y soporte Vulkan, aunque el layout joined puede requerir que la tabla n-gram (20,9 GiB) se mantenga en RAM del host si el dispositivo no acepta buffers tan grandes.
- No cabe en GPUs de consumo convencionales (8-24 GiB) debido al tamano total del modelo.
- Opciones de despliegue: llama.cpp (fork especifico con soporte ROCmFPx), llama-server para API. No es compatible con vLLM, Ollama u otros runners sin modificaciones.
- Latencia y throughput: no disponibles en la informacion. Se menciona una tasa de aceptacion de borrador MTP de 0,327, pero sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL wikitext-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (sin cuantizar) | 125 B + 51 B n-gram | 32768 | 4,0068 | qwen-community-1.0 | HuggingFace |
| Qwen3.8-Flash-Next-ROCmFP4-FAST (sin imatrix) | 125 B + 51 B n-gram | 32768 | 4,6785 | qwen-community-1.0 | HuggingFace |
| Este archivo (con imatrix) | 125 B + 51 B n-gram | 32768 | 4,4315 | qwen-community-1.0 | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoria (MoE con tabla n-gram) en la informacion proporcionada.

## Limitaciones y advertencias

- Build experimental: los tipos de cuantizacion ROCmFPx no estan integrados en llama.cpp upstream; se requiere un fork especifico (rama vulkan/qwen4exp-rocmfpx) que puede no recibir mantenimiento a largo plazo.
- Compatibilidad limitada: el layout root solo funciona con el fork mencionado; el layout joined es estructuralmente compatible con upstream, pero este ultimo aun no soporta ROCmFPx.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones de sesgos o alucinaciones para esta cuantizacion; se heredan las caracteristicas del modelo base, que no estan documentadas en la informacion disponible.
- Limitaciones de idioma: no se especifican los idiomas soportados; se asume que el modelo base es principalmente multilingue, pero sin confirmacion.
- Restricciones de licencia: la licencia qwen-community-1.0 permite uso comercial, pero es recomendable revisar los terminos completos en el repositorio del modelo base.
- La tabla n-gram joined (20,9 GiB como un solo tensor) puede exceder el limite maxStorageBufferRange de muchos dispositivos Vulkan, lo que obliga a mantenerla en RAM del host y degrada el rendimiento.
- Se han corregido dos errores en la ruta compartida qwen4exp relacionados con la decodificacion especulativa MTP; es necesario asegurarse de que el checkout del fork incluya los fixes del 2026-08-28 para evitar cuelgues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-imatrix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del fork de llama.cpp: https://github.com/LaurentZuijdwijk/llama.cpp (rama vulkan/qwen4exp-rocmfpx)
- Pull request de soporte qwen4exp en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27742
- Modelo MTP (decodificacion especulativa): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF
- Version sin imatrix: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF
- Script de conversion entre layouts: https://github.com/LaurentZuijdwijk/llama.cpp/blob/vulkan/qwen4exp-rocmfpx/gguf-py/gguf/scripts/gguf_split_ple_heads.py
- Formatos de cuantizacion ROCmFPX: https://github.com/ciru-ai/ROCmFPX
