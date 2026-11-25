# ashwinhegde19/OCRia-1-GGUF-quant-eval

## Resumen

OCRia-1 es un modelo de visión-lenguaje orientado a OCR y parsing de documentos, desarrollado por LlamaIndex. Este repositorio concreto, `ashwinhegde19/OCRia-1-GGUF-quant-eval`, no contiene pesos del modelo: es un estudio independiente y preregistrado sobre hasta qué punto se puede cuantizar OCRia-1 para inferencia en CPU con llama.cpp sin perder precisión, tomando la escritura manuscrita como endpoint principal. Incluye además un pequeño "repetition guard" que detiene las páginas en las que el modelo entra en bucle hasta agotar su límite de tokens.

El interés del trabajo es metodológico: evalúa la degradación por cuantización con intervalos de confianza al 95 % sobre 8.368 recortes manuscritos y 1.303 valores de formularios manuscritos en páginas completas, además de controles con texto impreso. La conclusión práctica es que solo el GGUF Q8_0 del publicador (junto con el proyector de visión f16) supera todas las pruebas preregistradas, con un tamaño de despliegue de 5,83 GB, mientras que Q6_K, Q5_K_M y Q4_K_M fallan al menos una prueba cada uno y no se distribuyen.

El modelo subyacente es multimodal de tipo image-text-to-text, con soporte únicamente de inglés según la model card, licencia propia `ocria-1-license` y pesos en formato GGUF (BF16 y Q8_0 publicados por LlamaIndex). El repositorio está etiquetado con el paper arXiv:2611.00092.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; detalles de arquitectura no incluidos en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configuracion de `llama-server -c 32768` usada en la evaluacion) |
| Tipos de cuantizacion | BF16 (referencia), Q8_0 (recomendada), Q6_K, Q5_K_M, Q4_K_M (evaluadas, no distribuidas) |
| Idiomas soportados | en (ingles) |
| Licencia | ocria-1-license (OCRia-1 Model and Code License) |
| Formato de pesos | GGUF (llama.cpp); proyector de vision `mmproj-OCRia-1-f16.gguf` |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna de OCRia-1 (tipo de transformer, número de capas, dimensión oculta, composición del dataset de entrenamiento ni si hubo RLHF o DPO) en la información disponible. Lo que sí se documenta es su interfaz de inferencia: pipeline `image-text-to-text`, con un proyector de visión separado (`mmproj`) que se carga junto al modelo base en llama.cpp, y una plantilla de chat que admite `enable_thinking`. El modo thinking debe desactivarse obligatoriamente en producción, ya que de lo contrario se rompe el formato de salida.

El trabajo de este repositorio se centra en la evaluación de cuantización estática: se generaron Q6_K, Q5_K_M y Q4_K_M a partir del GGUF BF16 del publicador y se compararon contra BF16 y Q8_0 con pruebas preregistradas. La innovación destacable es el repetition guard, implementado solo con numpy, que monitoriza el flujo de tokens del servidor y corta la generación cuando detecta un bucle, informando de ello mediante `finish_reason` y el campo `guard` en un informe JSON en stderr.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre documentos, con especial énfasis en texto manuscrito.
- Parsing de documentos: extracción de valores de formularios manuscritos en páginas completas y líneas de recibos impresos.
- Salida en Markdown a partir de una imagen de página.
- Procesamiento de imágenes de hasta 16,7 MP (300 DPI a resolución completa, recomendación del publicador); la evaluación se realizó con imágenes reducidas a 4,1 MP como máximo.
- Modo thinking disponible en la plantilla de chat, aunque debe desactivarse para que el formato de salida sea válido.
- Inferencia en CPU mediante llama.cpp, además de GPU (CUDA).
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni otros idiomas distintos del inglés.

## Casos de uso

- Digitalización de archivos manuscritos: el modelo transcribe páginas escaneadas a Markdown, y el Q8_0 con el guard permite procesar lotes grandes en CPU sin riesgo de que una página en bucle bloquee el pipeline; es adecuado porque el estudio demuestra ausencia de pérdida detectable frente a BF16 en 8.368 recortes manuscritos.
- Extracción de datos de formularios: lectura de valores manuscritos en formularios completos (1.303 valores evaluados) para alimentar sistemas de gestión documental, con la ventaja de que el endpoint manuscrito es precisamente el que se validó estadísticamente.
- Procesamiento de recibos y facturas impresas: extracción de líneas de texto impreso, teniendo en cuenta que Q5_K_M pierde 0,81 pp en esta tarea y que por tanto se recomienda Q8_0 si la precisión en impreso es crítica.
- Despliegue en hardware sin GPU: con 5,83 GB de modelo y arranque en CPU con 4 hilos, encaja en portátiles y servidores modestos; el guard evita los bucles raros que consumirían la ventana de 32.768 tokens.
- Servicio de transcripción vía API local: `ocria_guarded_client.py` habla con `llama-server` en streaming y devuelve Markdown por stdout más un informe JSON, lo que facilita integrarlo en un servicio interno de digitalización.
- Evaluación y auditoría de cuantizaciones: el repositorio sirve como plantilla reproducible (hashes, commit de llama.cpp, flags de compilación, resultados con IC al 95 %) para quien quiera repetir el estudio con sus propios documentos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Q8_0 vs BF16, 8.368 recortes manuscritos | Sin pérdida detectable |
| Q8_0 vs BF16, 1.303 valores manuscritos en páginas completas | Sin pérdida detectable |
| Q8_0 vs BF16, controles de texto impreso | Sin pérdida detectable |
| Q5_K_M, coincidencia exacta en manuscrito | Igual que BF16 |
| Q5_K_M, líneas de recibo impresas | −0,81 pp [−1,59, −0,09] |
| Q5_K_M, equivalencia de CER | No demostrable |
| Q6_K y Q4_K_M | Fallan al menos una prueba preregistrada |
| Tamaño Q8_0 + mmproj f16 | 5,83 GB |
| Tamaño BF16 + mmproj f16 | 10,37 GB |
| RAM pico BF16 en CPU | 12,3 GiB |
| Velocidad relativa BF16 vs Q8_0 | BF16 es 1,41× más lento |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: Q8_0 + proyector f16 ocupa 5,83 GB en disco; BF16 requiere 10,37 GB y alcanza 12,3 GiB de RAM en CPU.
- GPU recomendadas: H100/H200 fueron las usadas en la evaluación con CUDA (`-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=90`, `-ngl 99 -fa on`). No se documentan pruebas en RTX 4090 ni en otras GPU de consumo.
- CPU: la evaluación se ejecutó con 4 hilos y 4 núcleos, compilando con AVX2 sin AVX-512 para compatibilidad con portátiles antiguos.
- Cabe en hardware de consumo: el Q8_0 de 5,83 GB es viable en equipos con 8-16 GB de RAM; el BF16 requiere al menos 16 GiB.
- Opciones de despliegue: llama.cpp (`llama-server`) en el commit 33aeb17f85869279e3821f746bc645357139bc2c; no se mencionan vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput: solo se publica la comparación relativa BF16 frente a Q8_0 (1,41× más lento); no hay cifras absolutas de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Manuscrito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCRia-1 Q8_0 (recomendado) | no disponible | 32.768 | Sin pérdida vs BF16 | ocria-1-license | GGUF en `llamaindex/OCRia-1-GGUF` |
| OCRia-1 BF16 | no disponible | 32.768 | Referencia | ocria-1-license | GGUF en `llamaindex/OCRia-1-GGUF` |
| OCRia-1 Q5_K_M | no disponible | 32.768 | Igual en manuscrito, peor en impreso | ocria-1-license | No distribuido; reconstruible desde BF16 |
| OCRia-1 Q4_K_M / Q6_K | no disponible | 32.768 | Fallan pruebas preregistradas | ocria-1-license | No distribuidos |

No se dispone de datos de otros modelos OCR comparables en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene pesos; es un estudio de evaluación. Los pesos deben descargarse del repositorio del publicador en la revisión fijada 95798d024f7142f49de8ac9806cf7610b1d41c75.
- No es un lanzamiento oficial de LlamaIndex ni está avalado por LlamaIndex.
- Solo inglés: no se documenta soporte multilingüe.
- El modo thinking debe estar desactivado (`enable_thinking: false`) o el formato de salida se rompe.
- Riesgo de bucles: el modelo puede repetir hasta agotar el límite de tokens en páginas raras; el guard es necesario en producción.
- Las cuantizaciones por debajo de Q8_0 no superan todas las pruebas preregistradas; Q5_K_M pierde precisión en texto impreso y no demuestra equivalencia de CER.
- La evaluación se hizo con imágenes reducidas a 4,1 MP; a resolución completa (hasta 16,7 MP) la precisión en letra pequeña debería mejorar, pero no se midió y aumenta el tiempo de prefill y la RAM.
- La licencia `ocria-1-license` es propia y distinta de las licencias open source habituales; hay que revisar `LICENSE` y `NOTICE.md` antes de un uso comercial.
- No se han publicado datos sobre sesgos del modelo en la información disponible.

## Enlaces

- Repositorio de evaluación: https://huggingface.co/ashwinhegde19/OCRia-1-GGUF-quant-eval
- Pesos GGUF del publicador: https://huggingface.co/llamaindex/OCRia-1-GGUF
- Modelo base: https://huggingface.co/llamaindex/OCRia-1
- Paper referenciado: arXiv:2611.00092
- llama.cpp: https://github.com/ggml-org/llama.cpp
