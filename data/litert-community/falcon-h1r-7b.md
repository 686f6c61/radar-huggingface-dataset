# litert-community/Falcon-H1R-7B

## Resumen

Falcon-H1R-7B es un modelo de razonamiento de 7.585.648.736 parámetros desarrollado por el Technology Innovation Institute (TII) y distribuido aquí en formato LiteRT-LM por la comunidad litert-community. Se construye sobre Falcon-H1-7B-Base mediante ajuste supervisado con arranque en frío sobre trazas largas de razonamiento y posterior aprendizaje por refuerzo con GRPO. Su arquitectura es un decodificador causal híbrido que ejecuta en paralelo, sobre la misma entrada, una rama de atención con query agrupada y una rama de exploración selectiva Mamba2 en cada una de sus 44 capas.

La relevancia de esta ficha concreta reside en el empaquetado: el repositorio no contiene los pesos originales en safetensors, sino dos ficheros `.litertlm` (int8 e int4) listos para el runtime LiteRT-LM de Google, orientado a inferencia en dispositivo y en el borde. Esto permite ejecutar un modelo de razonamiento de 7B en hardware de consumo y en teléfonos, algo que con pesos bf16 requeriría del orden de 15 GB solo para los pesos.

El modelo abre de forma autónoma un bloque `<think>…</think>` antes de responder, y el bundle declara el canal de pensamiento, de modo que el runtime separa el razonamiento de la respuesta final y permite limitar el presupuesto de pensamiento con `--thinking-budget`. La conversión la firma litert-community, no TII, y la licencia aplicable es la Falcon LLM License del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: atención GQA + Mamba2 en paralelo en cada capa |
| Parametros totales | 7.585.648.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K en el modelo original; 4096 en estos ficheros LiteRT-LM |
| Tipos de cuantizacion | int8 (lineales y embedding int8, conv y scan de Mamba en float) e int4 (blockwise-32 en lineales, proyección de salida y embedding int8) |
| Idiomas soportados | inglés y multilingüe (sin lista detallada; no disponible) |
| Licencia | Falcon LLM License (falcon-llm-license) |
| Formato de pesos | `.litertlm` (LiteRT-LM); int8 de 7.810.102.560 bytes y int4 de 4.689.037.856 bytes |
| Capas | 44 |
| Tamaño oculto | 3072 |
| Cabezas de atención | 12 cabezas, 2 cabezas KV (GQA) |
| Cabezas Mamba2 | 24, tamaño de estado 256 |
| Vocabulario | 130.048 tokens, embeddings no atados |
| Parametros de muestreo recomendados | temperatura 0.6, top-p 0.95, hasta 65.536 tokens nuevos |

## Arquitectura y entrenamiento

Cada una de las 44 capas del modelo procesa la misma entrada a través de dos ramas que se combinan: una rama de atención con query agrupada (12 cabezas de consulta y 2 de clave/valor) y una rama Mamba2 de exploración selectiva con 24 cabezas y estado de 256. Este diseño híbrido busca combinar la calidad de recuperación de la atención con el coste lineal en longitud de secuencia de los modelos de espacio de estados, lo que resulta especialmente atractivo en inferencia en dispositivo. El tamaño oculto es 3072 y el vocabulario de 130.048 tokens usa embeddings no atados.

El entrenamiento parte de Falcon-H1-7B-Base, se somete a ajuste supervisado con arranque en frío sobre trazas largas de razonamiento y después a aprendizaje por refuerzo con GRPO. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición del dataset. La innovación destacable en este repositorio no es el entrenamiento sino el empaquetado: LiteRT-LM declara explícitamente el canal de pensamiento (`thought`, delimitado por `<think>` y `</think>`), lo que permite al runtime imprimir el razonamiento por separado y aplicar un presupuesto de tokens de pensamiento. La conversión se realizó con litert-torch (commit 115a136 con el parche específico de Falcon-H1) y se validó sobre litert-lm 0.18.0.

## Capacidades

- Generación de texto y razonamiento explícito: abre un bloque `<think>` de forma autónoma antes de responder y cierra el pensamiento en condiciones normales.
- Razonamiento matemático de varios pasos, con resultados verificados en GSM8K y en preguntas de multiplicación.
- Presupuesto de pensamiento configurable mediante `--thinking-budget`; si se agota, el razonamiento queda cortado a mitad de frase y la respuesta puede ser incorrecta (con 64 tokens respondió 481 a 17 × 23).
- Conversación multi-turno: las turnos anteriores se realimentan como su respuesta sin el pensamiento, siguiendo la plantilla de TII.
- Capacidad multilingüe declarada por TII (inglés y multilingüe), sin lista de idiomas publicada.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistente de razonamiento en el dispositivo: desplegar el fichero int4 en un portátil con GPU de consumo permite razonamiento de 7B sin conexión, con 39,7 tok/s de decodificación en un Mac Studio M4 Max.
- Aplicaciones móviles de resolución de problemas matemáticos: el modelo resuelve cadenas de cálculo paso a paso y el runtime puede ocultar el bloque de pensamiento al usuario final. En Pixel 8a el fichero int4 quedó detenido por la regla de memoria del autor, por lo que el despliegue móvil realista pasa por el hermano de 0,6B o por hardware con más memoria.
- Procesamiento por lotes en CPU en servidores sin GPU: el fichero int8 en CPU completa una prefill de 1024 tokens más 256 tokens decodificados en 29,65 s en M4 Max, lo que lo hace viable para tareas asíncronas de razonamiento.
- Evaluación y prototipado de modelos de razonamiento en el borde: el bundle permite comparar calidad int4 frente a int8 frente a bf16 con la misma plantilla y el mismo tokenizador, útil para decidir cuantización en producción.
- Tutoría interactiva con contexto moderado: con 4096 tokens de contexto en estos ficheros puede mantener conversaciones de varias rondas con explicaciones razonadas, aunque no está pensado para documentos largos en este empaquetado.
- Verificación de pipelines de conversión: sirve como referencia para validar conversiones de modelos híbridos Transformer+Mamba2 a LiteRT, dado que el autor documenta delegación completa de las 7 firmas al delegado OpenCL y comparaciones token a token contra transformers.

## Benchmarks y rendimiento

| Métrica | int8 | int4 | bf16 (referencia) |
|---|---|---|---|
| GSM8K, presupuesto de razonamiento 2048 (Mac GPU) | 96 | 98 | 21/21 en las 21 primeras preguntas |
| Chequeo de corrección de 8 preguntas (Mac, CPU y GPU) | 8/8 | 8/8 | 8/8 |
| Decodificación en Mac Studio M4 Max (GPU) | 35,9 tok/s | 39,7 tok/s | no disponible |
| Prefill 1024 + 256 decodificados, contexto 2048 (Mac GPU) | 8,95 s | 8,26 s | no disponible |
| Prefill 1024 + 256 decodificados, contexto 2048 (Mac CPU) | 29,65 s | 37,72 s | no disponible |
| Comprobación de longitud de prompt (17 longitudes) | 17/17 CPU, 16/17 GPU | 16/17 CPU, 17/17 GPU | no disponible |

En Galaxy S26 el motor GPU no compila para el fichero int4 y el int8 no se ejecutó; en Pixel 8a el int4 fue detenido por la regla de memoria del autor. En iOS no se midió: cada fichero es una única sección TFLite (7,27 GiB int8, 4,36 GiB int4) que supera el límite de ~2 GiB por sección. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 7,81 GB para el fichero int8 y 4,69 GB para el int4, más activaciones declaradas en fp32 en GPU.
- GPU recomendadas: Apple Silicon de gama alta (Mac Studio M4 Max es la referencia medida); GPU de escritorio con al menos 8-10 GB de memoria para int8 y 6 GB para int4.
- GPU de consumo: el int4 cabe en tarjetas con 8 GB o más; el int8 requiere 10-12 GB para operar con holgura.
- Móvil: no viable en este tamaño con los límites actuales de sección TFLite; el miembro de la familia que corre en iPhone es el de 0,6B.
- Despliegue: runtime LiteRT-LM 0.18.0 (probado); en 0.17.1 el int8 respondió correctamente a un `run` simple. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: 39,7 tok/s (int4 GPU) y 35,9 tok/s (int8 GPU) en M4 Max; en CPU el int8 es más rápido en prefill que el int4 (el prefill blockwise del int4 rinde al 44 % del int8).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Falcon-H1R-7B (LiteRT-LM) | 7,59B | 4096 en estos ficheros (256K original) | `.litertlm` int8/int4 | Falcon LLM License | Razonamiento híbrido Transformer+Mamba2, orientado a dispositivo |
| Falcon-H1-3B-Instruct (LiteRT-LM) | ~3B | no disponible | `.litertlm` | Falcon LLM License | Mismo pipeline de conversión, menor huella |
| Falcon-H1-Tiny-R-0.6B (LiteRT-LM) | ~0,6B | no disponible | `.litertlm` | Falcon LLM License | Único de la familia que corre en iPhone según el autor |
| Ministral-3-3B-Instruct-2512 (LiteRT-LM) | ~3B | no disponible | `.litertlm` | no disponible | Referenciado por el límite de ~2 GiB por sección TFLite |

No se dispone de comparativas de rendimiento frente a modelos de otros formatos (GGUF, safetensors) en la información proporcionada.

## Limitaciones y advertencias

- Contexto efectivo reducido a 4096 tokens en estos ficheros, muy por debajo de los 256K del modelo original.
- El razonamiento cortado por presupuesto no se completa: la respuesta puede ser errónea sin aviso explícito (caso documentado de 17 × 23 respondido como 481 con 64 tokens de presupuesto).
- Fallos de repetición documentados: en algunas longitudes de prompt el pensamiento cita palabras de relleno del enunciado y repite hasta el tope de 512 tokens (3 de 3 ejecuciones en una longitud concreta del fichero int4).
- Riesgo de alucinación inherente a los modelos de razonamiento; no hay evaluación de sesgos publicada en la información disponible.
- Licencia Falcon LLM License: es necesario revisar los términos en el enlace oficial antes de cualquier uso comercial; el repositorio la marca como "other".
- No apto para iOS ni para móviles con los límites actuales de sección TFLite en este tamaño.
- Sin soporte documentado de tool calling, agentes, visión ni audio.
- La conversión la mantiene la comunidad litert-community, no TII; la calidad del empaquetado depende de esa capa adicional.

## Enlaces

- Repositorio LiteRT-LM del modelo: https://huggingface.co/litert-community/Falcon-H1R-7B
- Modelo base original: https://huggingface.co/tiiuae/Falcon-H1R-7B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Hermanos en LiteRT-LM: https://huggingface.co/litert-community/Falcon-H1-3B-Instruct y https://huggingface.co/litert-community/Falcon-H1-Tiny-R-0.6B
- Ministral-3-3B-Instruct-2512 (referencia del límite de sección): https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Términos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
