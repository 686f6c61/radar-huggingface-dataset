# Kiyo1130/Qwen3.8-27B-QSA-LowBit-GGUF

## Resumen
Kiyo1130/Qwen3.8-27B-QSA-LowBit-GGUF es un conjunto de tres cuantizaciones GGUF de baja precision (clases de 3, 2 y 1 bit) derivadas del checkpoint BF16 higa2515/Qwen3.8-27B-QSA-BF16, un modelo multimodal de tipo image-text-to-text de 27.373.132.800 parametros. El autor es Kiyo1130 y la publicacion es reciente (noviembre de 2026), con licencia Apache 2.0. El objetivo es claro: permitir ejecutar un modelo de 27B con capacidades de vision en GPUs de consumo, incluyendo tarjetas de 12 GB, algo inviable con los pesos en BF16.

El modelo base incorpora modificaciones QSA (un mecanismo de indexado con tensores FP32 propios, segun la model card) y un bloque MTP (multi-token prediction) que habilita decodificacion especulativa en llama.cpp. Estas cuantizaciones preservan intactos los 80 tensores del indexador QSA en FP32, los 15 tensores del bloque MTP original y 96 pesos BF16 DeltaNet alpha/beta, de modo que las partes sensibles a la precision no se degradan con la cuantizacion.

La relevancia practica esta en el formato: con presets IQ3_S (13,52 GB), IQ2_S (10,46 GB) e IQ1_M (8,73 GB), mas un proyector de vision BF16 compartido de 0,93 GB, el modelo se puede servir con llama.cpp en una unica GPU. El autor valida IQ1_M con offload completo en una RTX 3060 de 12 GB. No obstante, las pruebas publicadas son smoke tests funcionales, no evaluaciones de calidad o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con modificaciones QSA y bloque MTP; pesos en GGUF |
| Parametros totales | 27.373.132.800 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (las pruebas se hicieron con asignacion de 4.096 tokens) |
| Tipos de cuantizacion | IQ3_S (3,95 bits/peso medios), IQ2_S (3,05 bits/peso), IQ1_M (2,55 bits/peso); mezcla de precisiones con tensores QSA en FP32 y DeltaNet alpha/beta en BF16 |
| Idiomas soportados | no disponible (la model card menciona pruebas en japones e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision mmproj en BF16 |

## Arquitectura y entrenamiento
La informacion disponible no detalla el entrenamiento del modelo base (composicion del dataset, numero de tokens, uso de RLHF/DPO). Lo que si se documenta es la arquitectura efectiva del artefacto publicado: un transformer multimodal con un mecanismo QSA que introduce 80 tensores de indexado en FP32, un bloque MTP de 15 tensores para prediccion multi-token y pesos DeltaNet alpha/beta en BF16 (96 tensores). El pipeline es image-text-to-text, con un proyector de vision separado que se carga opcionalmente mediante `--mmproj`.

La innovacion tecnica relevante de esta publicacion es el esquema de cuantizacion mixta: los presets IQ3_S, IQ2_S e IQ1_M cuantizan la mayor parte de la matriz de pesos, pero mantienen en precision alta los componentes estructuralmente sensibles (indexador QSA, MTP, DeltaNet). El autor declara que estas tres cuantizaciones se generaron de forma independiente desde el mismo checkpoint BF16 fijado, usando un fork de llama.cpp con soporte QSA. El bloque MTP permite activar decodificacion especulativa con `--spec-type draft-mtp --spec-draft-n-max 2`.

## Capacidades
- Generacion de texto conversacional multi-turno, con pipeline declarado como image-text-to-text.
- Razonamiento aritmetico basico: el autor valida una respuesta aritmetica correcta en los tres presets.
- Capacidad multilingue parcial: la model card documenta una prueba de respuesta en japones; no hay lista oficial de idiomas.
- Vision: reconocimiento de imagenes (se valida con una imagen roja) mediante el proyector BF16 compartido.
- Procesamiento de contexto medio: se valida un pasaje de 2.460 tokens.
- Decodificacion especulativa mediante MTP, activable en tiempo de ejecucion.
- Servido mediante endpoint compatible con OpenAI (`/v1/chat/completions`) a traves de `llama-server`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso
- Despliegue local de un modelo multimodal de 27B en GPU de consumo: con IQ1_M (8,73 GB) y el proyector (0,93 GB) cabe en una RTX 3060 de 12 GB con offload completo, segun la validacion del autor. Adecuado para prototipos y entornos sin acceso a A100/H100.
- Asistente conversacional con imagenes en estaciones de trabajo: el pipeline image-text-to-text y el proyector BF16 permiten responder preguntas sobre capturas, diagramas o fotografias desde una unica GPU.
- Procesamiento de documentos de longitud media: la prueba con un pasaje de 2.460 tokens confirma manejo de contexto moderado; util para resumen o extraccion sobre articulos e informes.
- Servicio local compatible con OpenAI: `llama-server` expone `/v1/chat/completions`, lo que permite integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI sin cambiar el cliente.
- Experimentacion con decodificacion especulativa: el bloque MTP permite medir el impacto de `--spec-type draft-mtp` en latencia sobre hardware modesto.
- Evaluacion de cuantizacion extrema: los tres presets permiten comparar la degradacion de calidad entre 3,95, 3,05 y 2,55 bits/peso sobre el mismo checkpoint, util para investigacion en compresion de modelos.
- Inferencia en japones e ingles en entornos locales: la validacion incluye una respuesta en japones, lo que sugiere uso para asistentes bilingues de baja latencia en hardware de consumo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las pruebas realizadas son smoke tests funcionales (aritmetica, japones, reconocimiento de imagen roja y pasaje de 2.460 tokens) y que "full quality and performance benchmarks remain unevaluated".

| Prueba funcional | IQ3_S | IQ2_S | IQ1_M |
|---|---|---|---|
| Comprobaciones superadas (MTP off) | 4/4 | 4/4 | 4/4 |
| Comprobaciones superadas (MTP on) | 4/4 | 4/4 | 4/4 |
| Offload completo validado | RTX 5090 | RTX 5090 | RTX 5090 y RTX 3060 12 GB |

## Requisitos de hardware
- VRAM estimada: IQ3_S 13,52 GB, IQ2_S 10,46 GB, IQ1_M 8,73 GB, mas 0,93 GB del proyector BF16 si se usa vision. Hay que sumar los buffers de contexto (la validacion uso 4.096 tokens).
- GPU recomendadas: RTX 5090 para los tres presets con offload completo; RTX 3060 de 12 GB validada con IQ1_M y proyector BF16. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, IQ1_M en 12 GB; IQ2_S e IQ3_S requieren tarjetas de 16 GB o mas para offload completo con contexto y proyector.
- Opciones de despliegue: exclusivamente llama.cpp mediante el fork con soporte QSA (github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp, commit 864934c). No se mencionan vLLM, Ollama ni TGI.
- Toolchain validado: Linux con CMake 4.2.3, GCC 15.2 y CUDA 13.2; el autor indica que la compilacion e inferencia en Windows aun no se han probado en hardware objetivo.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo.

## Comparativa con modelos similares
No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales. No se han identificado en la informacion proporcionada modelos comparables con el mismo esquema QSA/MTP.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA-LowBit-GGUF (IQ1_M) | 27,37B | no disponible | GGUF 8,73 GB | Apache 2.0 | Vision con proyector BF16; MTP; requiere fork QSA |
| Qwen3.8-27B-QSA-BF16 (base) | 27,37B | no disponible | BF16 | Apache 2.0 | Referencia de precision completa; no cabe en GPU de consumo |
| Alternativas de ~27B en GGUF de baja precision | no disponible | no disponible | GGUF | no disponible | No se han identificado en la informacion disponible |

## Limitaciones y advertencias
- Calidad no evaluada: no hay benchmarks de MMLU, HumanEval, GSM8K ni similares; solo smoke tests funcionales. No es apto para produccion sin evaluacion propia.
- Degradacion en cuantizacion extrema: IQ1_M produce errores observables; el autor documenta que devolvio la ecuacion `17 + 25 = 42` al pedir solo el numero. IQ2_S e IQ3_S no tienen evaluacion de calidad comparativa.
- Dependencia de un fork no oficial: requiere el fork de llama.cpp con soporte QSA en un commit fijado, con un parche manual (`#include <algorithm>`) y compilacion desde fuente. No funciona con llama.cpp upstream ni con Ollama.
- Disponibilidad limitada: 10 descargas y 0 likes en el momento de la consulta; el repositorio se describe como privado en las instrucciones de descarga, lo que exige autenticacion con una cuenta con permisos de lectura.
- Idiomas no declarados: no hay lista oficial de idiomas soportados; la evidencia se limita a pruebas en japones e ingles.
- Contexto no especificado: no se publica la longitud de contexto nativa del modelo; la validacion uso 4.096 tokens, insuficiente para muchos casos de contexto largo.
- Riesgo de alucinacion: no cuantificado; los modelos de baja precision tienden a incrementar errores en tareas de razonamiento y calculo.
- Sesgos: no documentados en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y las modificaciones QSA remiten a los creditos y licencias del repositorio upstream; conviene verificar esa cadena antes de desplegar.
- Windows sin validar: la compilacion e inferencia en Windows no se han probado en hardware objetivo.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-LowBit-GGUF
- Modelo base BF16: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Checkpoint base fijado: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16/tree/aedae2c5304698f58d30c5ec709ebf5b37339b1d
- Creditos y licencias upstream: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16#credits-and-licenses
- Fork de llama.cpp con soporte QSA: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp/tree/864934c78136ad75274f202b8eb1e7c751d81fb1
- Licencia: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-LowBit-GGUF/blob/main/LICENSE
- Manifiesto SHA-256: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-LowBit-GGUF/blob/main/SHA256SUMS
- Pesos IQ3_S: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-LowBit-GGUF/resolve/main/Qwen3.8-27B-QSA-IQ3_S.gguf
- Pesos IQ2_S: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-LowBit-GGUF/resolve/main/Qwen3.8-27B-QSA-IQ2_S.gguf
- Pesos IQ1_M: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-LowBit-GGUF/resolve/main/Qwen3.8-27B-QSA-IQ1_M.gguf
