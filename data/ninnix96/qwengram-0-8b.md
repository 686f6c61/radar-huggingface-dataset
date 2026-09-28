# Ninnix96/Qwengram-0.8B

## Resumen

Qwengram-0.8B es un modelo de generación de texto derivado de Qwen/Qwen3.5-0.8B, publicado por el usuario Ninnix96. No se trata de un reentrenamiento completo: el backbone base permanece congelado y sobre él se añade un lector de rango R=1 insertado en las posiciones IDX2 e IDX8 del decodificador, junto con un mecanismo de arbitraje dinámico denominado linear750. El sistema se apoya en una memoria PLE externa procedente de Qwen3.8-Flash-Next, que se consulta mediante direccionamiento determinista de n-gramas.

La propuesta técnica consiste en mejorar la perplejidad del modelo base sin tocar sus pesos, incorporando memoria externa como una capa adicional de recuperación. El punto de control canónico (REAL-15M + linear750) reduce la perplejidad de validación completa congelada un 5,048%, pasando de 18,2759 a 17,3534. Existe además un endpoint de investigación de 20M tokens que mejora la NLL agregada, pero degrada en matemáticas, por lo que el autor mantiene 15M como la opción equilibrada.

Su relevancia es doble: por un lado, explora arquitecturas de memoria externa aplicadas a modelos pequeños; por otro, obliga a usar un fork específico de llama.cpp, ya que ni el llama.cpp upstream ni Transformers sin modificar ejecutan el lector personalizado. Esto lo convierte en un artefacto fundamentalmente de investigación más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Qwen3.5-0.8B congelado + lector R=1 en decodificador IDX2/IDX8 + arbitraje dinamico linear750 + memoria PLE externa |
| Parametros totales | 783.332.678 |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (lector y arbitro permanecen en FP32 en todas las precisiones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (export BF16 combinado), GGUF (Q4_K_M, Q6_K, Q8_0, BF16), reader.safetensors y arbiter.pt por separado |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone Qwen3.5-0.8B que se mantiene congelado, sin actualización de sus pesos. Sobre él se inyecta un lector de rango 1 en dos puntos del decodificador (IDX2 e IDX8) y un módulo de arbitraje dinámico lineal (linear750). La memoria utilizada es una PLE (memoria de embeddings posicionales o de recuperación externa) de Qwen3.8-Flash-Next, almacenada como fichero sidecar externo de aproximadamente 32 GB en cuantización Q4_1, mapeado en el host y del que solo se descomprimen las filas seleccionadas para cada token. El direccionamiento de la memoria es determinista mediante n-gramas.

El entrenamiento se limita a la calibración del lector y del árbitro. El punto de control canónico se denomina REAL-15M + linear750 y consume 15.000.064 tokens de lector y 749.568 tokens de calibración. Un estudio de hitos emparejados encontró menor NLL de validación completa, menor media de cinco dominios y menor NLL en LAMBADA a 15M que a 10M, con intervalos de confianza del 95% emparejados por debajo de cero. El endpoint de investigación de 20M tokens mejora la NLL agregada pero empeora en matemáticas. No se documenta uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto autorregresiva sobre el backbone Qwen3.5-0.8B congelado, con ganancia medible de NLL respecto al modelo base.
- Recuperación de memoria externa mediante direccionamiento determinista de n-gramas sobre la PLE de Qwen3.8-Flash-Next.
- Completado de secuencias con decodificación greedy verificada en CPU y en GPU Vulkan (comprobaciones de primero y ocho tokens).
- Evaluación zero-shot de continuaciones lingüísticas: se reportan resultados en LAMBADA-1000 y HellaSwag-1000.
- Procesamiento multilingüe implícito (el dominio multilingüe aparece en la evaluación con NLL 3.647268), aunque no se declara una lista de idiomas soportados.
- Capacidad de razonamiento matemático y generación de código limitada al backbone base: NLL de 1.402346 en matemáticas y 1.495201 en código en la evaluación congelada.
- No soporta tool calling ni function calling según la información disponible.
- No soporta capacidades de agente, MTP ni entradas de solo embeddings en este runtime.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Investigación en memoria externa y PLE: el modelo permite medir el efecto de un lector R=1 con memoria externa sobre un backbone congelado, con intervalos de confianza emparejados y retención de ganancia por cuantización ya calculadas. Es adecuado para estudiar cuánto rendimiento se puede recuperar sin reentrenar el modelo base.
- Estudio de cuantización en llama.cpp: con artefactos Q4_K_M, Q6_K, Q8_0 y BF16 y una tabla de retención de ganancia por precisión (99,1% en Q8_0, 101,5% en Q6_K, 91,0% en Q4_K_M), sirve para analizar cómo la cuantización afecta a componentes no estándar que permanecen en FP32.
- Inferencia en CPU sin GPU: los GGUF de 584 MB a 1,60 GB (sin contar el sidecar PLE) permiten ejecutar generación en un servidor sin acelerador, usando el fork de llama.cpp con hilos de CPU y contexto/batch/microbatch de 256.
- Despliegue en hardware gráfico de gama baja con Vulkan: se ha validado offload completo con `-ngl 99` en una AMD BC-250 para BF16 y Q8_0, lo que abre la puerta a prototipos en GPUs integradas o de gama de entrada.
- Reproducción de evaluaciones congeladas: la suite de Kaggle, las identidades de evaluación y los resultados por bloque y por ejemplo están preservados, lo que permite replicar el estudio de perplejidad (18,2759 stock frente a 17,3534 canónico) de forma verificable.
- Comparación de endpoints de calibración: el repositorio conserva el endpoint de investigación de 20M tokens frente al canónico de 15M, lo que permite analizar el compromiso entre NLL agregada y rendimiento en matemáticas antes de fijar una configuración.
- Análisis lingüístico comparativo: los resultados en LAMBADA-1000 (45,6% de precisión) y HellaSwag-1000 (40,0%) permiten usar el modelo como punto de referencia en estudios de comprensión de secuencias largas y sentido común a pequeña escala.
- Prototipado de recuperación aumentada con n-gramas: el direccionamiento determinista de la memoria externa puede servir de base para experimentos de recuperación documental donde se quiera evitar un índice vectorial completo.

## Benchmarks y rendimiento

Evaluación congelada canónica REAL-15M + linear750 con la PLE FP8 original y la suite de evaluación congelada de Kaggle:

| Metrica | Qwengram-0.8B (canonico) | Qwen3.5-0.8B stock |
|---|---:|---:|
| NLL de validacion completa | 2.853786 | 2.905585 |
| Perplejidad de validacion completa | 17.3534 | 18.2759 |
| NLL general | 3.134094 | no disponible |
| NLL de codigo | 1.495201 | no disponible |
| NLL de matematicas | 1.402346 | no disponible |
| NLL cientifico | 2.244491 | no disponible |
| NLL multilingue | 3.647268 | no disponible |
| Media NLL de cinco dominios | 2.384680 | no disponible |
| LAMBADA-1000 NLL | 2.217277 | no disponible |
| LAMBADA-1000 precision | 45,6% | no disponible |
| HellaSwag-1000 precision | 40,0% | no disponible |

Retención de la ganancia del lector en runtime GGUF (prueba emparejada en CPU, 8.128 tokens de los primeros 64 fragmentos consecutivos de 256 tokens del test crudo de WikiText-2, 8 hilos, contexto/batch/microbatch 256, intervalos del 95% con 10.000 remuestreos de 16 bloques de cuatro fragmentos, semilla 1234):

| Precision | NLL stock | NLL Qwengram | Ganancia del lector [IC 95%] | Retencion de ganancia [IC 95%] | Reduccion de perplejidad vs stock |
|---|---:|---:|---|---:|---:|
| BF16 | 2.890026 | 2.822039 | 0,067987 [0,058500, 0,077155] | 100% | 6,57% |
| Q8_0 | 2.890255 | 2.822870 | 0,067385 [0,057686, 0,076578] | 99,1% [96,5%, 101,9%] | 6,52% |
| Q6_K | 2.900546 | 2.831509 | 0,069037 [0,059437, 0,078186] | 101,5% [98,3%, 104,7%] | 6,67% |
| Q4_K_M | 2.936757 | 2.874906 | 0,061851 [0,053637, 0,069662] | 91,0% [85,6%, 96,2%] | 6,00% |

En cada par stock/Qwengram, los 335 tensores del backbone y nueve campos del tokenizador coinciden exactamente, y los 11 tensores del lector y del árbitro permanecen en FP32 bit a bit. El autor indica explícitamente que las diferencias de precisión en benchmarks no quedaron establecidas.

## Requisitos de hardware

- Inferencia en CPU: viable con el fork de llama.cpp. La prueba documentada usa 8 hilos y contexto/batch/microbatch de 256. El backbone GGUF ocupa entre 584 MB (Q4_K_M) y 1,60 GB (BF16).
- Sidecar PLE obligatorio: fichero externo de aproximadamente 32 GB (Q4_1) que se mapea en el host; solo se descomprimen las filas seleccionadas por token. No se carga como una asignación de 32 GB en GPU, pero sí requiere ese espacio en disco y acceso mapeado en memoria.
- GPU recomendadas: no se publica una lista de GPUs recomendadas. La única validación GPU documentada es en una AMD BC-250 con Vulkan, con `-ngl 99` para BF16 y Q8_0 y `-ngl 25` para Q4_K_M.
- Cabe en GPU de consumo: sí para los ficheros GGUF por tamaño, pero el requisito del sidecar de 32 GB y la necesidad del fork condicionan el despliegue. El offload completo de Q4_K_M produjo una continuación distinta en el dispositivo probado, por lo que se recomienda `-ngl 25` allí.
- Opciones de despliegue: exclusivamente el fork Qwengram de llama.cpp (commit `068fcb42662453bec15298ba6bd59f552190a468`), con compilación CPU o Vulkan (`-DGGML_VULKAN=ON`). El llama.cpp upstream y Transformers sin modificar no ejecutan el lector personalizado. No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. Las pruebas publicadas son de NLL y de coincidencia de tokens de continuación, no de rendimiento por segundo. Las comprobaciones cortas de generación no establecen paridad amplia entre CPU y GPU.
- Almacenamiento: el repositorio ocupa 5,6 GB, al que hay que sumar el sidecar PLE de ~32 GB descargado aparte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad validacion completa | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Qwengram-0.8B | 783.332.678 | no disponible | 17,3534 (congelada) | apache-2.0 | HuggingFace, GGUF; requiere fork de llama.cpp y sidecar PLE externo |
| Qwen3.5-0.8B (stock) | no disponible (modelo base) | no disponible | 18,2759 (congelada) | no disponible | HuggingFace, upstream estándar |
| Otros modelos de memoria externa comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la información proporcionada otros modelos de la misma categoría (memoria externa sobre backbone congelado en el rango de 0,8B) con los que establecer una comparación técnica directa.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp: el llama.cpp upstream y Transformers sin modificar no ejecutan el lector, el arbitraje ni el direccionamiento determinista de n-gramas. Esto limita la portabilidad y añade deuda de mantenimiento.
- Dependencia de un sidecar externo de ~32 GB: sin el fichero PLE de Ivan Fioravanti (SHA256 `66db3ab390f4dd5063ecc89cc180f4713898577682347001bf64ab8e328527a1`) el modelo no funciona. Los GGUF publicados no incluyen la PLE.
- Diferencias de precisión no establecidas: el propio autor señala que las diferencias de precisión en benchmarks entre endpoints no quedaron demostradas; los resultados publicados son de NLL y perplejidad, no de exactitud en tareas.
- Rendimiento absoluto bajo en tareas de comprensión: LAMBADA-1000 se queda en 45,6% y HellaSwag-1000 en 40,0%, coherente con un backbone de 0,8B.
- Dominio multilingüe más débil: la NLL multilingüe (3.647268) es la más alta de los dominios evaluados, muy por encima de código (1.495201) y matemáticas (1.402346).
- No se declara lista de idiomas soportados, a pesar de que existe una métrica multilingüe en la evaluación.
- Limitaciones funcionales del runtime: no soporta MTP ni entradas de solo embeddings.
- Paridad GPU no demostrada: las comprobaciones de generación corta en la AMD BC-250 no establecen paridad amplia con CPU, y Q4_K_M produjo una continuación distinta con offload completo.
- Riesgo de alucinación: no documentado por el autor; no hay evaluación de veracidad factual más allá de la NLL.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Licencia: el modelo se publica bajo apache-2.0, pero la PLE externa procede de una conversión de terceros (Ivan Fioravanti, a partir de Qwen3.8-Flash-Next-DS4-Q4) cuyos términos no se detallan. Conviene verificar la licencia del sidecar antes de un uso comercial.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con requisitos de ventana larga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ninnix96/Qwengram-0.8B
- Endpoint de investigacion de 20M: https://huggingface.co/Ninnix96/Qwengram-0.8B/blob/main/research-20m/README.md
- Comparaciones de hitos e intervalos emparejados: https://huggingface.co/Ninnix96/Qwengram-0.8B/blob/main/evaluation/README.md
- Export BF16 combinado y configuracion: https://huggingface.co/Ninnix96/Qwengram-0.8B/blob/main/safetensors/README.md
- Hashes y tamanos de artefactos: https://huggingface.co/Ninnix96/Qwengram-0.8B/blob/main/SHA256.json
- Fork de llama.cpp para Qwengram: https://github.com/Ninnix/llama.cpp-qwengram
- Guia de runtime: https://github.com/Ninnix/llama.cpp-qwengram/blob/master/docs/qwengram.md
- Sidecar PLE Q4_1 de Ivan Fioravanti: https://huggingface.co/ivanfioravanti/Qwen3.8-Flash-Next-DS4-Q4/blob/main/Qwen3.8-Flash-Next-PLE-Q4_1.gguf
- GGUF Q4_K_M: https://huggingface.co/Ninnix96/Qwengram-0.8B/resolve/main/QwenGram-0.8B-Q4_K_M.gguf
- GGUF Q6_K: https://huggingface.co/Ninnix96/Qwengram-0.8B/resolve/main/QwenGram-0.8B-Q6_K.gguf
- GGUF Q8_0: https://huggingface.co/Ninnix96/Qwengram-0.8B/resolve/main/QwenGram-0.8B-Q8_0.gguf
- GGUF BF16: https://huggingface.co/Ninnix96/Qwengram-0.8B/resolve/main/QwenGram-0.8B-BF16.gguf

Nota: la búsqueda web proporcionada no devolvió resultados pertinentes sobre este modelo; únicamente aparecieron páginas de Google Maps y documentos de términos y privacidad de Google, sin relación con Qwengram-0.8B.
