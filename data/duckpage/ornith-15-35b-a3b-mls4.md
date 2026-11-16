# duckpage/ornith-15-35b-a3b-mls4

## Resumen

Ornith-1.5-35B-A3B MLS4 es una conversión de precisión del modelo multimodal Ornith-1.5-35B-A3B (desarrollado por ornith-ai) al formato MLS4 propietario del motor de inferencia Malleus, obra del usuario duckpage. El modelo original es un transformer de mezcla de expertos (MoE) con 35 000 millones de parámetros totales, de los cuales unos 3000 millones están activos por token, 256 expertos y una ventana de contexto nativa de 262 144 tokens. Procesa texto e imágenes (pipeline image-text-to-text).

La relevancia de esta ficha no reside en el modelo base, sino en el artefacto de cuantización: un único conjunto de pesos en 4 bits (W4A8, grupo de 128, rotación de Hadamard aleatorizada y calibración GPTQ) almacenado en un contenedor GGUF v3 con extensión `.malleus`, pensado para APUs AMD RDNA 3.5 (gfx1150/gfx1151). El objetivo declarado por el autor es maximizar la velocidad de prefill de prompts largos en una sola APU, evitando mantener una segunda copia de pesos de mayor precisión en el dispositivo.

Las cifras medidas en una Radeon 890M (gfx1150) son notables para el hardware: 968,5 tok/s de prefill en sesión nueva y 196,1 tok/s a 131 072 tokens de contexto, frente a 467,6 y 69,4 tok/s de llama.cpp con Q4_K_M y flash attention; es decir, 2,07x al inicio y 2,83x a 128K. La decodificación se mantiene en 29,08 tok/s (llama.cpp: 28,30), con unas 35 tok/s en contextos cortos al activar la cabeza MTP para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 256 expertos; cabeza MTP (`nextn`) para decodificacion especulativa |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | ~3000 millones (~3B) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | MLS4: 4 bits, grupo de 128, rotacion de Hadamard aleatorizada, calibracion GPTQ, esquema W4A8; contenedor GGUF v3 (`.malleus`) |
| Idiomas soportados | no disponible |
| Licencia | MIT (la del modelo original; el motor Malleus es Apache-2.0) |
| Formato de pesos | `.malleus` (GGUF v3); 20,3 GB en disco, 18,9 GiB en dispositivo |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 256 expertos y enrutamiento disperso: 35B parámetros totales con ~3B activos por token, lo que reduce el coste computacional por token a costa de un mayor footprint de pesos. Incorpora una cabeza de predicción multi-token (MTP, una capa `nextn`) incluida en el checkpoint, que el motor Malleus emplea para decodificación especulativa; la exactitud de esa decodificación se verifica con la comprobación `malleus spec-exact` del motor. El contexto nativo es de 262 144 tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La conversión MLS4 no modifica la arquitectura ni los datos de entrenamiento: solo cambia el formato de almacenamiento y la precisión de los pesos, aplicando una rotación de Hadamard aleatorizada seguida de calibración GPTQ para minimizar el error de cuantización a 4 bits. El autor valida la calidad comparando contra el checkpoint bf16 mediante `malleus golden`, con tensores de referencia publicados en el dataset `duckpage/malleus-golden`, lo que permite ejecutar la validación sin descargar los ~70 GB de pesos bf16.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto muy largo (hasta 262 144 tokens).
- Procesamiento de imágenes junto con texto (pipeline image-text-to-text): descripción, extracción de información y respuesta a preguntas sobre imágenes.
- Decodificación especulativa mediante la cabeza MTP integrada, con verificación de exactitud en el motor.
- Prefill de prompts largos optimizado para APUs AMD RDNA 3.5 (gfx1150/gfx1151).
- Capacidades de código, matemáticas y tool calling: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible.

## Casos de uso

- Análisis de documentos extensos en local: con 262 144 tokens de contexto, el modelo puede ingerir informes, expedientes o bases de código completas en una sola pasada; el prefill medido (196,1 tok/s a 131K) permite procesar un prompt de 110 000 tokens en unos 4,5 minutos en una Radeon 890M.
- Asistentes sobre imágenes en estaciones de trabajo sin GPU dedicada: al ejecutarse en APUs RDNA 3.5 con 96 GB de GTT, permite desplegar un modelo multimodal de 35B en equipos de escritorio o mini-PC con memoria unificada.
- Procesamiento por lotes de corpus largos en el borde: la velocidad de prefill 2,83x superior a llama.cpp a 128K reduce el tiempo de clasificación, resumen o extracción sobre lotes de documentos largos.
- Prototipado e investigación de cuantización: el formato MLS4 (W4A8, Hadamard + GPTQ) y las herramientas `malleus golden` y `malleus spec-exact` sirven para estudiar el impacto de la cuantización 4-bit en calidad y latencia.
- Servicio de inferencia local con contexto largo: `malleus serve --ctx 262144 --prefill-chunk 8192` levanta un endpoint con 28,7 GiB de memoria viva a contexto completo, adecuado para entornos con requisitos de privacidad de datos.
- Evaluación de decodificación especulativa: la cabeza MTP integrada permite medir el beneficio de la decodificación especulativa (~35 tok/s en contexto corto frente a 29,08 tok/s sin ella) en hardware de consumo.

## Benchmarks y rendimiento

Mediciones del autor en gfx1150 (Radeon 890M) frente a llama.cpp Q4_K_M con flash attention:

| Metrica | MLS4 (Malleus) | llama.cpp Q4_K_M | Mejora |
|---|---|---|---|
| Prefill, sesion nueva (tok/s) | 968,5 | 467,6 | 2,07x |
| Prefill a 131 072 tokens (tok/s) | 196,1 | 69,4 | 2,83x |
| Tiempo para prompt de 110 000 tokens | ~4,5 min | ~12,7 min | 2,8x |
| Decode (tok/s) | 29,08 | 28,30 | ~1,03x |
| Decode con MTP, contexto corto (tok/s) | ~35 | no disponible | ~20 % mas |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: 18,9 GiB de pesos en dispositivo, 5,6 GiB de estado de sesión y 5,3 GiB de working set a 262 144 tokens; 28,7 GiB vivos sobre 96 GB de GTT.
- GPU objetivo: APUs AMD RDNA 3.5, concretamente gfx1150 (Radeon 890M) y gfx1151. No se indica soporte para GPUs discretas NVIDIA o AMD.
- GPU de consumo: el modelo está diseñado para APUs con memoria unificada grande (96 GB de GTT); no cabe en GPUs de consumo con 24 GB o menos por el footprint de pesos y estado.
- Despliegue: motor Malleus, con imagen de contenedor (`podman build -f .../deploy/Containerfile --target runtime`) y comando `malleus serve --model ... --ctx 262144 --prefill-chunk 8192`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: prefill de 968,5 tok/s en sesión nueva y 196,1 tok/s a 131K; decode de 29,08 tok/s (~35 tok/s con MTP en contexto corto). El autor señala que `MALLEUS_PREFILL_CHUNK=8192` es determinante: con 2048 el MoE agrupado relee los pesos de cada experto una vez por tile.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B MLS4 (esta ficha) | 35B totales / ~3B activos | 262 144 | MLS4 (4 bits, W4A8) | MIT | APUs AMD RDNA 3.5 |
| Ornith-1.5-35B-A3B (original) | 35B totales / ~3B activos | 262 144 | bf16 (~70 GB) | MIT | GPU con memoria suficiente |
| Ornith-1.5-35B-A3B Q4_K_M (llama.cpp) | 35B totales / ~3B activos | 262 144 (depende de config.) | GGUF Q4_K_M | MIT | CPU/GPU con llama.cpp |

La comparativa se limita al mismo modelo base en distintos formatos, ya que la información proporcionada no incluye otros modelos de la misma categoría. No hay datos de benchmarks de calidad que permitan comparar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- El artefacto está atado al motor Malleus y al hardware AMD RDNA 3.5 (gfx1150/gfx1151); no es un GGUF estándar utilizable en llama.cpp, Ollama o vLLM.
- La cuantización a 4 bits introduce pérdida de precisión respecto al checkpoint bf16; el autor la valida con `malleus golden`, pero no se publican métricas de degradación en benchmarks estándar.
- El rendimiento medido corresponde a una única APU (Radeon 890M); no hay datos para otros modelos de APU ni para GPUs discretas.
- El rendimiento depende críticamente de `MALLEUS_PREFILL_CHUNK`: con valores bajos (2048), el MoE agrupado relee los pesos de cada experto por tile y el throughput cae.
- Riesgo de alucinación, sesgos e idiomas soportados: no disponibles en la información proporcionada.
- La licencia MIT del modelo original se mantiene, pero conviene verificar los términos del modelo base y del motor (Apache-2.0) antes de un despliegue comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-16; se trata de un artefacto reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duckpage/ornith-15-35b-a3b-mls4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Motor Malleus: https://github.com/duckpage/malleus
- Curvas, método y caveats: https://github.com/duckpage/malleus/blob/main/MODELS.md
- Tensores de referencia para validación: https://huggingface.co/datasets/duckpage/malleus-golden
- Containerfile de despliegue: https://raw.githubusercontent.com/duckpage/malleus/main/deploy/Containerfile
