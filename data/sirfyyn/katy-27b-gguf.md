# sirfyyn/Katy-27B-GGUF

## Resumen

Katy-27B-GGUF es una colección de cuantizaciones en formato GGUF del modelo ukisai/Swift-1.5-Qwen3.8-27b, un derivado de la familia Qwen3.8 con 27 mil millones de parámetros nominales. El trabajo lo publica el usuario sirfyyn como proyecto privado, con el objetivo de ejecutar el modelo en una única GPU de consumo profesional (RTX PRO 4500 Blackwell de 32 GB) mediante llama.cpp. No es un modelo entrenado desde cero, sino una conversión y compresión del modelo base con una matriz de importancia (imatrix) propia y una cabeza de borrador especulativo DFlash2.

La relevancia del repositorio está en el trabajo de cuantización: incluye perfiles de 4, 3 y 2 bits con mediciones de divergencia KL frente a BF16, además de un perfil mixto por tensor. También distribuye la cabeza DFlash2 en Q8_0, que permite decodificación especulativa y multiplica por más de dos el throughput de decodificación en la configuración medida por el autor.

El modelo base pertenece a la arquitectura Qwen3.8, con atención completa y soporte de contexto largo de hasta 262.144 tokens según la configuración de ejemplo del autor. La licencia es swift-open-license-1.0, una licencia personalizada que conviene revisar antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.8 (modelo base ukisai/Swift-1.5-Qwen3.8-27b) |
| Parámetros totales | 1.924.404.480 según safetensors del modelo base; el nombre comercial indica 27B, discrepancia no aclarada en la información disponible |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | hasta 262.144 tokens en la configuración de ejemplo del autor |
| Tipos de cuantización | IQ4_XS, Q4_K_M, IQ3_S, IQ2_S y perfil mixto por tensor (GEMISCHT); cabeza DFlash2 en Q8_0 |
| Idiomas soportados | no disponible (la imatrix incluye datos multilingües y alemán, pero no se declara lista de idiomas) |
| Licencia | swift-open-license-1.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantización del base ukisai/Swift-1.5-Qwen3.8-27b, que sigue la arquitectura transformer densa de la familia Qwen3.8. No se dispone de información sobre el entrenamiento original: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO. El autor del repositorio no entrena el modelo, solo lo comprime y lo empaqueta para inferencia local.

La innovación técnica del repositorio está en el proceso de cuantización y en el soporte de decodificación especulativa. La matriz de importancia se calibró con 250 documentos y unos 264.000 tokens, con una mezcla declarada por tokens: código 60k, multilingüe 42k, chat alemán 40k, razonamiento 37k, agentic 32k, barrido de vocabulario 22k, gráficos 17k y datos estructurados 16k. Se distribuye también la cabeza DFlash2 (z-lab/Qwen3.8-27B-DFlash2, Apache-2.0), convertida a GGUF y cuantizada a Q8_0, que actúa como modelo borrador para especulación. El autor reporta que la capa MTP del perfil IQ2_S se mantiene en Q8_0 porque los tipos IQ2 no la cuantizan correctamente sin datos en la matriz.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8.
- Razonamiento multi-paso y tareas agénticas, según la mezcla de calibración declarada (37k tokens de razonamiento y 32k de agentic).
- Generación de código, con calibración específica de 60k tokens de código.
- Capacidades multilingües, incluyendo alemán e inglés en la calibración; no se declara una lista cerrada de idiomas.
- Decodificación especulativa mediante la cabeza DFlash2 y el modo n-gram de llama.cpp, con ganancias medidas de hasta 2,7x en throughput.
- Compatibilidad con endpoints OpenAI a través de FLE Link y llama-server.
- No se documentan capacidades de visión, audio, tool calling explícito ni modo thinking en la información disponible.

## Casos de uso

- Inferencia local en estación de trabajo con GPU única: el perfil IQ4_XS (14,26 GiB) está pensado para ejecutarse en una RTX PRO 4500 Blackwell de 32 GB con contexto de 262.144 tokens y KV en q8_0, lo que permite mantener conversaciones muy largas sin salir de la máquina.
- Asistencia de código en local: la calibración incluye 60k tokens de código y el perfil IQ4_XS mantiene una divergencia KL de 0,0645 sobre la referencia Python, adecuada para autocompletado y generación de fragmentos en entornos sin conexión.
- Procesamiento de documentación técnica larga: con 262.144 tokens de contexto se pueden ingerir manuales, referencias de API o expedientes completos y hacer preguntas sobre ellos en una sola pasada.
- Despliegue de API compatible con OpenAI: mediante llama-server o FLE Link se puede servir un endpoint local para integrarlo en herramientas internas sin depender de proveedores externos.
- Prototipado de agentes multi-paso: la mezcla de calibración incluye datos agentic, y la decodificación especulativa reduce la latencia en bucles de razonamiento donde la salida repite texto del contexto.
- Evaluación de cuantizaciones en pipelines de investigación: el repositorio publica KLD y acuerdo top-1 por texto de referencia, lo que permite comparar el impacto de IQ4_XS frente a Q4_K_M, IQ3_S e IQ2_S antes de fijar un perfil en producción.
- Entornos con memoria muy limitada: los perfiles IQ3_S (11,74 GiB) e IQ2_S (9,14 GiB) permiten ejecutar el modelo en GPUs de 12 o 16 GB, a costa de una degradación medible en KLD.

## Benchmarks y rendimiento

El autor publica mediciones de divergencia KL frente a BF16 con la herramienta de perplejidad de llama.cpp sobre tres textos públicos: E (referencia del lenguaje Python), W (cuatro artículos de Wikipedia en alemán) y K (documentación de Kubernetes en alemán).

| Cuantización | Tamaño (GiB) | KLD E | KLD W | KLD K | Top-1 E / W / K (%) |
|---|---|---|---|---|---|
| IQ4_XS (recomendada) | 14,26 | 0,0645 | 0,0127 | 0,0160 | 92,5 / 95,9 / 95,0 |
| Q4_K_M | 15,66 | 0,0590 | 0,0104 | 0,0131 | no disponible |
| IQ3_S | 11,74 | 0,1804 | 0,0388 | 0,0482 | 86,9 / 92,4 / 91,7 |
| IQ2_S | 9,14 | 0,4919 | 0,1682 | 0,2070 | 75,9 / 84,5 / 82,9 |

Rendimiento de decodificación en RTX PRO 4500 Blackwell de 32 GB, build FLE, 40 tareas mixtas, temperatura 0, contexto 262.144, KV q8_0:

| Configuración | tok/s de decodificación |
|---|---|
| Sin especulación | 46,6 |
| DFlash2 + ngram-mod | 116,6 |
| DFlash2 + ngram-mod con n-min 8, n-max 32, n-match 16 | 127,3 |
| Solo tareas sin repetición en la salida (20 de 40) | 79,5 (1,7x) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 14,26 GiB para IQ4_XS, 15,66 GiB para Q4_K_M, 11,74 GiB para IQ3_S y 9,14 GiB para IQ2_S, sin contar el espacio de la caché KV ni la cabeza DFlash2 (1,92 GiB adicionales si se usa especulación).
- GPU de referencia del autor: RTX PRO 4500 Blackwell de 32 GB, con contexto de 262.144 tokens y KV en q8_0.
- El perfil IQ4_XS cabe en GPUs de consumo de 16 GB o más; IQ3_S e IQ2_S caben en GPUs de 12 GB, con degradación de calidad medible.
- El autor declara no haber medido qué tarjeta soporta cada archivo con qué longitud de contexto, por lo que no ofrece garantías al respecto.
- Despliegue: llama.cpp (llama-server) y el fork FLE del autor, con binarios Linux y Windows en la release v1.1.0. El autor no ha verificado si la cabeza DFlash2 carga en el llama.cpp upstream.
- Throughput medido: 46,6 tok/s sin especulación y hasta 127,3 tok/s con DFlash2 y ngram-mod en la configuración de producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Katy-27B-GGUF (este) | 27B nominales (1,92B en safetensors del base) | 262.144 | GGUF | swift-open-license-1.0 | Cuantización con imatrix y cabeza DFlash2 |
| ukisai/Swift-1.5-Qwen3.8-27b | 27B nominales | no disponible | safetensors | no disponible | Modelo base sin cuantizar |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | safetensors / GGUF | Apache-2.0 | Cabeza de borrador especulativo, no es un modelo completo |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La licencia swift-open-license-1.0 es personalizada; hay que revisar el archivo LICENSE antes de cualquier uso comercial o redistribución.
- El autor describe el proyecto como privado y publicado tal cual, sin garantías de soporte ni de mantenimiento.
- Existe una discrepancia entre el nombre comercial (27B) y el recuento real de parámetros en safetensors (1.924.404.480); conviene verificar el modelo base antes de asumir el tamaño.
- Los perfiles IQ3_S e IQ2_S presentan una degradación notable: KLD de 0,1804 y 0,4919 en el texto de referencia Python, con acuerdo top-1 del 86,9 % y 75,9 % respectivamente.
- El perfil mixto GEMISCHT no tiene medición de KLD ni de velocidad publicada.
- La cabeza DFlash2 no es trabajo del autor y solo se ha verificado su conversión de formato; su carga en llama.cpp upstream no está comprobada.
- No se declara una lista de idiomas soportados, aunque la calibración incluye datos multilingües y alemanes.
- No hay información sobre sesgos, alucinación ni comportamiento en producción del modelo base.
- El autor no garantiza qué combinación de archivo y contexto cabe en cada tarjeta gráfica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sirfyyn/Katy-27B-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Cabeza DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Fork FLE (binarios v1.1.0): https://github.com/sirfyyn/FastLocalExperts/releases/tag/v1.1.0
- FLE Link: https://flelink.run
- Dataset de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
