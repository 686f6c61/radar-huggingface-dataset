# qwegnai/Qwen3.8-27B-QWP_4

## Resumen

Qwen3.8-27B-QWP_4 es un paquete de pesos cuantizados del modelo Qwen3.8-27B (27.780 millones de parametros) empaquetado por el usuario qwegnai para el motor de inferencia Qwegn, un runtime escrito en Swift y Metal 4 especificamente disenado para Apple Silicon. No se trata de un modelo nuevo ni de un fine-tuning: es una conversion del checkpoint original de Qwen a un contenedor propietario denominado QWP1, con una cuantizacion propia llamada HQ4_G32_M5 que deja el peso medio en 5,69 bits por parametro y reduce el paquete a 18,40 GiB.

El interes de esta ficha no esta en el modelo base, sino en la infraestructura de inferencia que lo acompana. El paquete incorpora Latent Sparse Attention (LSA) mediante un sidecar `model.qlsa`, una tecnica que restringe la atencion completa a los tokens sumidero, los bloques de 4 tokens mas similares y una ventana local de 512 tokens. Segun la model card, esto permite mantener el prefill entre 831 y 914 tok/s en contextos de 10K a 1M de tokens en un Apple M5 Max, con una mejora de 2,55x frente a atencion densa a 262K tokens.

La relevancia es acotada pero clara: demuestra que es posible ejecutar un modelo denso hibrido de 27B con contexto nativo de 262.144 tokens en hardware de consumo de Apple, con extension en inferencia hasta aproximadamente 1M de tokens mediante YaRN y LSA. La contrapartida es que el formato QWP1 solo carga en el motor Qwegn, por lo que no es utilizable con llama.cpp, vLLM, Ollama ni MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido de 64 capas: 48 capas Gated-DeltaNet + 16 capas de atencion completa, 5120 de dimension oculta, GQA 24Q/4KV, cabeza MTP, torre de vision |
| Parametros totales | 27,78 B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extension en inferencia probada cerca de 1M con YaRN + LSA |
| Tipos de cuantizacion | HQ4_G32_M5 (grupos de 32 pesos con rotacion ortonormal) + BF16, 5,69 bits/parametro |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QWP1 (contenedor propietario de Qwegn); no es safetensors, GGUF ni MLX |
| Tamano del paquete | 18,40 GiB |
| Modelo base | Qwen/Qwen3.8-27B @ `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Motor de inferencia | Qwegn (Swift + Metal 4) |
| Sidecar LSA | `model.qlsa` incluido |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer hibrido denso de 64 capas que combina 48 capas Gated-DeltaNet (un mecanismo de espacio de estados con compuerta) con 16 capas de atencion completa. Usa atencion con query agrupada (GQA) con 24 cabezas de query y 4 de clave/valor, 5120 de dimension oculta, una cabeza de Multi-Token Prediction (MTP) y una torre de vision, lo que habilita entrada multimodal. Esta ficha no dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF/DPO) del modelo base.

La innovacion tecnica relevante de este paquete es la Latent Sparse Attention implementada en tiempo de inferencia. El sidecar `model.qlsa` contiene una descomposicion SVD offline de la porcion libre de RoPE de las cabezas `wq`/`wk` cuantizadas (dimensiones 64-255), con dimension de indice 64. El indexado agrupa superbloques de 512 tokens en 64 buckets de Ward (hasta 16 tokens cada uno) con pooling de claves de 4 tokens. En ejecucion, cada query de atencion completa se restringe a los tokens sumidero, los 2048 tokens mas similares y una ventana local de 512 tokens. Los prompts por debajo de 2564 tokens usan atencion densa bit-exacta. Si el sidecar no esta presente, `--lsa-mode auto` puede sintetizar las proyecciones al cargar. Es importante subrayar que la extension mas alla de 262.144 tokens es una extension en inferencia, no entrenamiento adicional.

## Capacidades

- Generacion de texto y razonamiento en contextos largos, con contexto nativo de 262.144 tokens y extension probada hasta aproximadamente 1M.
- Procesamiento multimodal: el modelo base incluye torre de vision (no se detalla en la informacion disponible el conjunto exacto de tareas visuales soportadas).
- Decodificacion especulativa mediante drafters externos compatibles (DSpine-b16, DFlash 2) y decodificacion MTP-3 variacional nativa.
- Recuperacion en contexto largo: la model card reporta 3/3 en una prueba de aguja en pajar de tres agujas a 10%, 50% y 90% de profundidad, desde 64K hasta 1M de tokens.
- Evaluacion de codigo: 73/100 en una bateria de 50 tareas HumanEval + 50 MBPP con razonamiento desactivado.
- Razonamiento basico: 8/10 en una evaluacion interna de 10 preguntas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios y documentacion extensa en un solo paso: con 262.144 tokens nativos y prefill sostenido de unos 900 tok/s a 262K en M5 Max, el modelo puede ingerir bases de codigo o manuales completos sin trocear, algo impracticable con ventanas de 8K-32K.
- Procesamiento de expedientes legales o contractuales: la extension a 1M de tokens con recuperacion 3/3 en la prueba de agujas permite localizar clausulas concretas en corpus de cientos de miles de tokens, manteniendo el prefill por encima de 830 tok/s.
- Asistente de codigo local en Mac: con 73/100 en HumanEval+MBPP y decodificacion especulativa de hasta 154,2 tok/s en modo serve, es viable como autocompletado y generacion de funciones en un flujo de desarrollo sobre Apple Silicon, sin GPU dedicada.
- Resumen y extraccion sobre transcripciones o logs de muy larga duracion: la ventana efectiva cercana a 1M permite resumir horas de transcripcion o trazas de sistema en una sola pasada, con latencia de primer token de 94-113 ms en frio y 6-29 ms con cache caliente.
- Despliegue de inferencia privada en estacion de trabajo Apple: al ejecutarse integramente en Metal sobre memoria unificada, permite mantener datos sensibles en local sin enviarlos a la nube, con un paquete de 18,40 GiB que cabe en equipos de 32-64 GB.
- Prototipado de tecnicas de atencion dispersa: el sidecar LSA y las opciones `Ward-512` y `e-means-4096` sirven como banco de pruebas para investigar el equilibrio entre coste de atencion y fidelidad de recuperacion en contextos extremos.
- Evaluacion comparativa de decodificacion especulativa: la disponibilidad de drafters DSpine-b16 y DFlash 2 permite medir aceleraciones de 4,19x en serial frente a decodificacion estandar en el mismo hardware.

## Benchmarks y rendimiento

Resultados medidos en Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU de 40 nucleos, 585 GB/s), macOS 26+, `llmprobe v0.6.16-v0.6.17`, `--kv-mode q4 --temperature 0`.

| Metrica | Resultado |
|---|---|
| Prefill @4K | 1.043 tok/s (993 mediana) |
| Prefill @10K | 850 tok/s |
| Prefill @64K (e-means) | 914 tok/s |
| TTFT en frio | 94-113 ms |
| TTFT con cache caliente | 6-29 ms (2,23M-2,33M tok/s @65,5K) |
| Decodificacion estandar (serial) | 31,2-32,9 tok/s |
| Decodificacion especulativa (DSpine-b16) | 148,0 tok/s pico, 144,1 tok/s serve (4,19x) |
| Decodificacion especulativa (DFlash 2) | 154,2 tok/s serve (87,7 en CLI) |
| Prefill / decode a 1M tokens | 831 / 35,6 tok/s (e-means-4096 / Ward-512) |
| Recuperacion de aguja 64K-1M | 3/3 en todas las longitudes |
| Razonamiento (10Q) | 8/10 (80%) |
| Codigo (100Q: 50 HumanEval + 50 MBPP) | 73/100 |

Comparativa de atencion densa frente a LSA a distintas longitudes de contexto:

| Contexto | Denso prefill/decode | LSA Ward-512 prefill/decode | LSA e-means-4096 prefill/decode | Ganancia e-means |
|---|---|---|---|---|
| 64K | 672 / 42,1 | 884,8 / 54,0 | 914,3 / 56,2 | 1,36x vs denso |
| 160K | 467,4 / 25,9 | 831,9 / 47,1 | 907,0 / 40,7 | 1,94x vs denso |
| 262K | 351,0 / 25,3 | 830,2 / 43,1 | 896,5 / 42,1 | 2,55x vs denso |
| 524K | no medido | 831,2 / 41,1 | 891,0 / 36,1 | -41,8 s TTFT |
| 1M | no medido | 804,6 / 36,5 | 830,6 / 35,6 | -40,5 s TTFT, -270 MiB RSS |

Las etiquetas de contexto son tramos nominales del benchmark; las longitudes reales tokenizadas fueron 64.060, 120.673, 245.423, 544.656 y aproximadamente 1.037.119 tokens. La decodificacion en la tabla LSA usa MTP nativo y backoff adaptativo de contexto largo, no la linea base serial. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Memoria: el paquete ocupa 18,40 GiB en disco; en ejecucion requiere memoria unificada suficiente para pesos, cache KV y estado de inferencia. La model card no reporta el consumo total de memoria en ejecucion, solo una reduccion de 270 MiB de RSS a 1M de tokens con LSA frente a variantes alternativas.
- Hardware de referencia: Apple M5 Max con 128 GB de memoria unificada y GPU de 40 nucleos. No se han publicado mediciones en otros chips.
- Encaje en GPU de consumo Apple: por tamano, un paquete de 18,40 GiB encaja en equipos con 32 GB o mas de memoria unificada, aunque no hay datos de rendimiento publicados para configuraciones inferiores al M5 Max.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas. El formato QWP1 y el runtime Qwegn son exclusivos de Apple Silicon con Metal 4.
- Opciones de despliegue: unicamente el motor Qwegn (Swift + Metal 4, macOS 26+). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: TTFT en frio de 94-113 ms, TTFT con cache caliente de 6-29 ms, decodificacion serial de 31,2-32,9 tok/s y hasta 154,2 tok/s con decodificacion especulativa, todo medido en M5 Max de 128 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-QWP_4 (este) | 27,78 B denso hibrido | 262.144 nativo, ~1M extendido | QWP1 / Qwegn (Apple Silicon) | Apache 2.0 | Paquete cuantizado HQ4 con sidecar LSA |
| Qwen/Qwen3.8-27B (base) | 27,78 B denso hibrido | 262.144 | Safetensors / frameworks estandar | Apache 2.0 | Checkpoint original sin cuantizar |
| Qwen3.8-27B-DSpine-b16-QWP_4 | 27,78 B + drafter | 262.144 | QWP1 / Qwegn | Apache 2.0 | Variante con drafter para decodificacion especulativa (148,0 tok/s pico) |
| Qwen3.8-27B-DFlash2-QWP_4 | 27,78 B + drafter | 262.144 | QWP1 / Qwegn | Apache 2.0 | Variante con drafter DFlash 2 (154,2 tok/s serve) |

No se dispone de datos de benchmarks comparativos frente a modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- El formato QWP1 solo carga en el motor Qwegn sobre Apple Silicon con macOS 26 o superior y Metal 4. No hay portabilidad a otros runtimes ni a GPU NVIDIA o AMD.
- La extension de contexto hasta 1M de tokens es una extension en tiempo de inferencia mediante YaRN y LSA, no capacidad entrenada. La fidelidad mas alla de 262.144 tokens no esta garantizada.
- El resultado de 3/3 en recuperacion de agujas corresponde a un unico ejercicio de tres agujas; no es una garantia de precision general en tareas de contexto largo.
- La decodificacion especulativa variacional puede alterar la salida respecto a una decodificacion greedy exacta.
- La cuantizacion HQ4_G32_M5 a 5,69 bits por parametro introduce perdida de precision respecto al checkpoint BF16 original; no se han publicado evaluaciones de degradacion frente al modelo base.
- Riesgo de alucinacion y sesgos: no se han publicado analisis especificos en la informacion disponible; deben asumirse los del modelo base Qwen3.8-27B.
- Idiomas soportados: no disponible. No se puede confirmar cobertura multilingue mas alla de lo que indique la model card del modelo base.
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada; conviene verificar en la documentacion del modelo base antes de disenar flujos agenticos.
- Las mediciones de rendimiento provienen de un unico hardware (M5 Max de 128 GB) y pueden variar con la carga de trabajo y la temperatura.
- Licencia Apache 2.0: permite uso comercial, pero el motor Qwegn y el formato QWP1 son componentes separados cuyo licenciamiento debe verificarse en su repositorio.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un artefacto reciente y sin validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qwegnai/Qwen3.8-27B-QWP_4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
- Variante con drafter DSpine-b16: https://huggingface.co/qwegnai/Qwen3.8-27B-DSpine-b16-QWP_4
- Variante con drafter DFlash 2: https://huggingface.co/qwegnai/Qwen3.8-27B-DFlash2-QWP_4
