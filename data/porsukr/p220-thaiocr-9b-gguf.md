# PorsukR/P220-ThaiOCR-9B-GGUF

## Resumen

P220-ThaiOCR-9B-GGUF es la distribucion en formato GGUF de P220-ThaiOCR-9B, un modelo de vision-lenguaje de 9.197.093.888 parametros especializado en reconocimiento optico de caracteres (OCR) y comprension de documentos tailandeses. Lo desarrolla Porsuk Rungarunsrisuk y parte de Qwen/Qwen3.5-9B (licencia Apache-2.0), afinado mediante LoRA y posteriormente fusionado. El modelo resuelve la transcripcion de texto impreso y manuscrito, tablas, formularios, recibos, PDF gubernamentales y escaneos, ademas de responder preguntas sobre el contenido de un documento sin necesidad de reglas por plantilla.

La relevancia actual del modelo radica en su rendimiento para su tamano: la version v1.1 (24 de noviembre de 2026) se situa por encima de GPT-6.1 Sol en la media de las cinco tareas de transcripcion de ThaiOCRBench (0.662 frente a 0.652) y supera a todos los modelos abiertos probados en dicho benchmark, incluidos Qwen3.6-35B-A3B y OpenThai 2.0 27B. Incluso el archivo mas pequeno, Q2_K (3.9 GB), presenta menor CER que P110-ThaiOCR-4B en BF16.

Esta publicacion concreta contiene los pesos cuantizados para llama.cpp y Ollama en BF16, Q8_0, Q4_K_M, Q3_K_M y Q2_K, junto con el codificador visual (mmproj) en F16 y Q8_0, necesario para procesar imagenes. El modelo opera sin modo thinking y soporta tailandes e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen/Qwen3.5-9B, afinada con LoRA y fusionada |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion recomendada en llama.cpp con `-c 32768`) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M, Q3_K_M, Q2_K (modelo); F16 y Q8_0 (codificador visual mmproj) |
| Idiomas soportados | Tailandes (th), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama); variantes BF16, FP8, W4A16 y NVFP4 en otros repositorios |

## Arquitectura y entrenamiento

El modelo es un vision-lenguaje construido sobre Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9.200 millones de parametros. El autor lo entreno mediante LoRA sobre el modelo base y posteriormente fusiono los adaptadores en los pesos finales. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, pero indica que la version v1.1 se reentreno con un conjunto de datos mejorado y una receta de entrenamiento actualizada respecto a la primera release.

Las innovaciones tecnicas destacables se centran en el proceso de cuantizacion orientado a preservar la calidad OCR: los archivos de 4, 3 y 2 bits emplean una imatrix construida a partir de texto OCR tailandes, y las variantes W4A16 y NVFP4 se calibran sobre el mismo texto. El modelo se entreno y evaluo sin modo thinking, y la plantilla de chat de los GGUF lo desactiva por defecto. El codificador visual se distribuye por separado como archivo mmproj, requisito para el procesamiento de imagenes.

## Capacidades

- Transcripcion de texto impreso en tailandes con CER del 0,72 % en el conjunto ocr_th (v1.1).
- Reconocimiento de escritura manuscrita en tailandes con CER del 16,8 % en el conjunto iapp (v1.1).
- Conversion de paginas a texto plano, Markdown o tablas HTML.
- Comprension de documentos: formularios, recibos, PDF gubernamentales y escaneos.
- Respuesta a preguntas sobre el contenido de un documento (informacion clave, clasificacion).
- Interpretacion de graficos, diagramas e infografias.
- Procesamiento de imagenes mediante codificador visual independiente (mmproj).
- Soporte bilingue tailandes-ingles.
- Capacidad conversacional multi-turno segun los tags del repositorio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Sin modo thinking (desactivado por diseno en entrenamiento y plantilla).

## Casos de uso

- Digitalizacion de archivos gubernamentales tailandeses: el modelo transcribe PDF y escaneos de documentos oficiales a texto estructurado, aprovechando su entrenamiento especifico en los tres conjuntos de documentos gubernamentales tailandeses donde supera a GPT-6.1 Sol.
- Procesamiento de formularios y recibos: extrae campos y contenido de formularios y recibos convirtiendolos a Markdown o tablas HTML, sin necesidad de definir reglas por plantilla.
- Reconocimiento de manuscritos: transcribe notas y documentos manuscritos en tailandes con un CER del 16,8 %, adecuado para digitalizacion de archivos historicos o administrativos.
- Extraccion de tablas y graficos: convierte tablas de documentos a formato estructurado e interpreta graficos e infografias para tareas de analisis documental.
- Atencion al cliente sobre documentos: responde preguntas sobre el contenido de un documento (informacion clave, clasificacion) en un flujo conversacional bilingue tailandes-ingles.
- Despliegue en CPU, Mac u Ollama: la cuantizacion Q4_K_M (6,7 GB con codificador visual) permite ejecutar el modelo en entornos sin GPU dedicada manteniendo una calidad OCR superior a P110-ThaiOCR-4B en BF16.
- Pipelines de bajo consumo de memoria: el archivo Q2_K (4,8 GB con vision encoder) ofrece una opcion para presupuestos de memoria reducidos con CER de 20,63 % en manuscrito y 1,49 % en impreso.

## Benchmarks y rendimiento

| Metrica | P220 v1.0 | P220 v1.1 | Referencia |
|---|---|---|---|
| ThaiOCRBench handwriting | 0,475 | 0,546 | no disponible |
| ThaiOCRBench media 13 tareas | 0,674 | 0,696 | no disponible |
| CER manuscrito (iapp) | 24,4 % | 16,8 % | no disponible |
| CER texto impreso (ocr_th) | 1,35 % | 0,72 % | no disponible |
| ThaiOCRBench media transcripcion (5 tareas) | no disponible | 0,662 | GPT-6.1 Sol: 0,652 |

Comparativa de cuantizaciones (CER % manuscrito / impreso):

| Archivo | Tamano con vision encoder | CER manuscrito / impreso |
|---|---|---|
| P220 Q4_K_M | 6,7 GB | 17,46 / 0,86 |
| P220 Q3_K_M | 5,7 GB | 18,54 / 0,91 |
| P220 Q2_K | 4,8 GB | 20,63 / 1,49 |
| P110 BF16 | 9,3 GB | 35,52 / 1,98 |
| P110 FP8 | 5,8 GB | 35,58 / 2,13 |
| P110 Q4_K_M | 3,4 GB | 35,86 / 2,08 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: Q2_K 4,8 GB, Q3_K_M 5,7 GB, Q4_K_M 6,7 GB, todos incluyendo el codificador visual; el repo completo ocupa 44,2 GB.
- GPU recomendadas segun el autor: NVIDIA Blackwell para NVFP4, NVIDIA Ada/Hopper para FP8, NVIDIA Ampere para W4A16.
- CPU, Mac u Ollama: usar GGUF Q4_K_M (recomendado), Q3_K_M o Q2_K segun memoria disponible.
- Cabe en GPU de consumo: si, con Q4_K_M (6,7 GB) o inferiores en tarjetas con 8 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, vLLM (variantes BF16, FP8, W4A16, NVFP4) y transformers (BF16).
- Parametros de ejecucion recomendados: `--image-min-tokens 64`, `-c 32768`, `-n 4096`, thinking desactivado mediante `--chat-template-kwargs '{"enable_thinking": false}'` en llama.cpp o `--think=false` en Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ThaiOCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P220-ThaiOCR-9B | 9,2 B | 32.768 | 0,696 (media 13 tareas) | Apache-2.0 | GGUF, BF16, FP8, W4A16, NVFP4 |
| P110-ThaiOCR-4B | no disponible | no disponible | inferior a P220 en ambos conjuntos held-out | no disponible | BF16, FP8, Q4_K_M |
| Qwen3.6-35B-A3B | 35 B (MoE) | no disponible | inferior a P220 | no disponible | no disponible |
| OpenThai 2.0 27B | 27 B | no disponible | inferior a P220 | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta tailandes e ingles; no se ha validado para otros idiomas.
- No dispone de modo thinking; la plantilla de Ollama puede activarlo por defecto, por lo que debe forzarse su desactivacion.
- Requiere el archivo mmproj separado para procesar imagenes; sin el, el modelo no puede leer documentos.
- La model card no detalla sesgos conocidos ni tasas de alucinacion; se recomienda validacion humana en produccion.
- El contexto maximo documentado es de 32.768 tokens en la configuracion de llama.cpp; documentos muy extensos requieren paginacion.
- Aunque la licencia es Apache-2.0, el modelo base Qwen/Qwen3.5-9B tambien es Apache-2.0, por lo que no se indican restricciones adicionales para uso comercial.
- Los benchmarks publicados se limitan a ThaiOCRBench y conjuntos held-out de OCR; no hay datos de tareas generales de razonamiento o codigo.
- La calidad del OCR decae con cuantizaciones agresivas: Q2_K presenta CER de 20,63 % en manuscrito frente a 17,46 % de Q4_K_M.

## Enlaces

- Repositorio GGUF: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-GGUF
- Modelo base BF16: https://huggingface.co/PorsukR/P220-ThaiOCR-9B
- Variante FP8: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-FP8
- Variante W4A16: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-W4A16
- Variante NVFP4: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-NVFP4
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Changelog: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-GGUF/blob/main/CHANGELOG.md
