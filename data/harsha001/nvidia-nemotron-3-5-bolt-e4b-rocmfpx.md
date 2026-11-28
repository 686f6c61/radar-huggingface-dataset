# Harsha001/NVIDIA-Nemotron-3.5-Bolt-E4B-ROCmFPX

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-ROCmFPX es una cuantizacion del modelo NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 de NVIDIA, publicada por el usuario Harsha001. El modelo base es un modelo pequeno post-entrenado a partir de Google Gemma 4 E4B, orientado a generacion de texto conversacional. Esta version concreta no es un modelo nuevo, sino una conversion a formatos GGUF de baja precision especificos del fork ROCmFPX de llama.cpp, disenado para GPUs AMD mediante Vulkan y HIP/ROCm.

La relevancia de esta publicacion es practica: ofrece pesos cuantizados en 8, 6 y 4 bits con metricas de calidad medidas frente al BF16 de referencia (divergencia KL y tasa de mismo token siguiente), lo que permite elegir el compromiso entre tamano y fidelidad. El archivo recomendado por el autor es el de 6 bits (6,21 GB, KLD 0,0348), mientras que los de 4 bits reducen el peso hasta 4,05 GB a costa de una perdida de calidad notable (KLD 0,2557-0,2783).

El repositorio ocupa 23,1 GB e incluye los cuatro GGUF publicados. Es importante senalar que el autor indica explicitamente que los archivos no se han probado en hardware AMD todavia y que requieren un fork concreto de llama.cpp, por lo que no cargan en llama.cpp estandar, LM Studio ni Ollama sin ese fork.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Google Gemma 4 E4B) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 32768`) |
| Tipos de cuantizacion | Q8_0_ROCMFPX, Q6_K_ROCMFPX (pesos Q6_0_ROCMFPX), Q4_0_ROCMFP4_STRIX, Q4_0_ROCMFP4_FAST |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (variantes ROCmFPX / ROCmFP4) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. La model card indica que NVIDIA-Nemotron-3.5-Bolt-E4B es un modelo pequeno de NVIDIA post-entrenado a partir de Google Gemma 4 E4B, y que esta publicacion es una cuantizacion del mismo. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

El proceso de cuantizacion si esta documentado: conversion del BF16 a GGUF con el script `convert_hf_to_gguf.py` del fork, generacion de una importance matrix a partir del BF16 sobre el texto de calibracion `calibration_datav3` en fragmentos de 512 tokens, y cuantizacion con `llama-quantize --imatrix` una ejecucion por tipo. No fueron necesarias escalas de tensor porque los pesos del modelo son suficientemente grandes para las escalas de bloque de ROCmFPX. Las metricas de calidad se obtuvieron decodificando cada cuantizacion a F16 con el codigo CPU del fork y evaluando en la misma GPU NVIDIA que la referencia, de modo que miden unicamente el efecto de los pesos.

## Capacidades

- Generacion de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Capacidad multimodal en el modelo base: la model card indica que los GGUF de este repositorio contienen solo el modelo de lenguaje y que para imagenes debe usarse el proyector de vision `mmproj-*.gguf` de `unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF` con `--mmproj` (no probado con estos archivos).
- Soporte de plantillas de chat mediante `--jinja` en llama-server, segun el ejemplo de ejecucion.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, modo thinking ni soporte multilingue explicito.

## Casos de uso

- Despliegue local en equipos con GPU AMD: el formato ROCmFPX esta pensado para Vulkan y HIP/ROCm, con recetas especificas para Strix Halo (`gfx1151`) y RX 7900 (`gfx1100`), lo que permite ejecutar un modelo de 7.500 millones de parametros en hardware de consumo AMD.
- Prototipado de asistentes conversacionales: con el archivo de 6 bits (6,21 GB) y una ventana de 32.768 tokens en el ejemplo de llama-server, se puede mantener un chat multi-turno con contexto amplio en una sola maquina.
- Evaluacion de cuantizaciones de baja precision: las metricas KLD y "same top" publicadas permiten comparar el impacto de 8, 6 y 4 bits antes de elegir un archivo para produccion.
- Servicio de inferencia ligero con llama-server: el binario `llama-server` del fork expone una API compatible con endpoints, adecuada para integrar el modelo en aplicaciones internas.
- Experimentacion con vision: combinando estos GGUF con el `mmproj` de unsloth se puede probar el pipeline multimodal del modelo base, aunque el autor advierte que esa combinacion no esta probada.
- Entornos con memoria limitada: el archivo de 4 bits `Q4_0_ROCMFP4_FAST` (4,05 GB) permite ejecutar el modelo cuando la VRAM o la memoria unificada es escasa, aceptando una fidelidad menor (KLD 0,2783, mismo token 80,25%).
- Investigacion sobre formatos de cuantizacion para AMD: sirve como referencia reproducible del flujo imatrix mas tipos de bloque ROCmFPX sobre un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente proporciona metricas de fidelidad de cuantizacion frente al BF16, medidas en WikiText-2 test con 40 fragmentos de 512 tokens:

| Archivo | Tamano | KLD | Mismo token siguiente | Precision |
|---|---:|---:|---:|---|
| Q8_0_ROCMFPX | 7,80 GB | 0,0209 | 95,12% | 8 bits |
| Q6_K_ROCMFPX (pesos Q6_0_ROCMFPX) | 6,21 GB | 0,0348 | 93,10% | 6 bits (recomendado) |
| Q4_0_ROCMFP4_STRIX | 5,06 GB | 0,2557 | 81,17% | 4 bits, receta para Strix Halo (`gfx1151`) |
| Q4_0_ROCMFP4_FAST | 4,05 GB | 0,2783 | 80,25% | 4 bits, prioriza velocidad (una escala por bloque) |

El autor indica ademas que el tipo `Q3_0_ROCMFPX` (4,21 GB, KLD 0,3582) no se publico porque es mas grande que `Q4_0_ROCMFP4_FAST` y esta mas lejos del BF16.

## Requisitos de hardware

- VRAM/memoria estimada: entre 4,05 GB (Q4_0_ROCMFP4_FAST) y 7,80 GB (Q8_0_ROCMFPX) solo para los pesos; hay que anadir el espacio de contexto y el runtime.
- GPU objetivo: AMD con soporte Vulkan o HIP/ROCm. La receta de 4 bits STRIX esta ajustada para `gfx1151` (Strix Halo) y el ejemplo de compilacion menciona `gfx1100` (RX 7900).
- Cabe en GPU de consumo AMD con al menos 8 GB de memoria para el archivo de 6 bits, y en equipos de memoria unificada como Strix Halo (128 GB en el caso destacado del autor para otro modelo).
- No se documenta compatibilidad con GPU NVIDIA para estos archivos; la referencia BF16 se evaluo en NVIDIA con kernels estandar, pero los GGUF requieren el fork.
- Despliegue: exclusivamente mediante el fork `HarshaVardhan3002/ROCmFPX` en el commit `b130d4995` o posterior, compilado con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON`, y ejecutado con `llama-server`. llama.cpp estandar, LM Studio, Ollama y otras builds de ROCmFPX pueden no cargar los archivos.
- Latencia y throughput: no disponibles. El autor advierte que los archivos no se han probado en hardware AMD, por lo que no hay mediciones de rendimiento reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-ROCmFPX (esta ficha) | 7.518.069.290 | no disponible (ejemplo con 32.768) | GGUF ROCmFPX, 4-8 bits | OpenMDW-1.1 | Hugging Face, requiere fork ROCmFPX |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | 7.518.069.290 | no disponible | BF16 (safetensors/GGUF) | OpenMDW-1.1 | Hugging Face, oficial de NVIDIA |
| unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF | no disponible | no disponible | GGUF estandar, incluye `mmproj` | OpenMDW-1.1 (heredada) | Hugging Face, compatible con llama.cpp estandar |

La diferencia principal frente a las otras dos entradas es el formato: esta version usa tipos de bloque propios de ROCmFPX orientados a AMD, mientras que la de unsloth emplea GGUF estandar y anade el proyector de vision. No se dispone de datos de benchmarks de tareas para establecer comparaciones de rendimiento entre ellas.

## Limitaciones y advertencias

- Los archivos no se han probado en hardware AMD segun la propia model card; el rendimiento y la correccion en GPU AMD son desconocidos.
- Requieren un fork concreto de llama.cpp (commit `b130d4995` o posterior); no cargan en llama.cpp estandar, LM Studio, Ollama ni otras builds de ROCmFPX.
- La cuantizacion a 4 bits degrada notablemente la fidelidad: KLD 0,2557-0,2783 y mismo token 80,25-81,17%, frente a 0,0348 y 93,10% en 6 bits. El autor recomienda 6 bits salvo que la memoria sea limitada.
- Las metricas de calidad se midieron decodificando a F16 en CPU y evaluando en GPU NVIDIA; los kernels AMD pueden dar resultados ligeramente distintos por el orden de las operaciones.
- Solo contiene el modelo de lenguaje: no incluye el proyector de vision, y la combinacion con el `mmproj` de unsloth no esta probada.
- No es una publicacion oficial de NVIDIA; los creditos del modelo corresponden a sus autores.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limitaciones de contexto mas alla del ejemplo de 32.768 tokens.
- Licencia OpenMDW-1.1: deben consultarse los terminos en el enlace oficial y en la model card del modelo base para uso comercial y usos previstos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/NVIDIA-Nemotron-3.5-Bolt-E4B-ROCmFPX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- GGUF estandar con proyector de vision: https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Fork ROCmFPX (HarshaVardhan3002): https://github.com/HarshaVardhan3002/ROCmFPX
- ROCmFPX (repositorio referenciado en la model card): https://github.com/charlie12345/ROCmFPX
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Modelo destacado por el autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
