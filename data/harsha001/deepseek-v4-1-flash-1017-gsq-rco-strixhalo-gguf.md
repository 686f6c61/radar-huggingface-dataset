# Harsha001/DeepSeek-V4.1-Flash-1017-GSQ-RCO-StrixHalo-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-RCO-StrixHalo-GGUF es una cuantización comunitaria del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, preparada por el usuario Harsha001 para ejecutarse en un único equipo AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada. El modelo original es un MoE de 657.884 millones de parámetros con 384 expertos enrutados por capa, que en cuantizaciones estándar ocupa unos 230 GB o más, por lo que no cabe en hardware de consumo. Esta versión resuelve ese problema combinando dos técnicas: poda de expertos mediante la métrica REAP (se conservan los 320 o 277 expertos más usados de cada capa) y cuantización de baja precisión GSQ-RCO de IST-DASLab en 1-2 bits para los expertos, con Q8_0 para atención, router y embeddings.

El resultado son dos builds de unos 104 GB cada uno, de los cuales unos 97 GiB deben residir en memoria de GPU, mientras que una tabla "Engram" de 110,6 GB permanece en disco SSD y se lee bajo demanda. La pérdida de calidad es real (la perplejidad sube de 2,01 a 3,40 en la build recomendada), pero los tests de GSM8K muestran que el modelo podado mantiene la capacidad de razonamiento. Es una versión de prueba comunitaria, validada en CPU y en un NVIDIA GB10 con CUDA, pero aún no probada sobre el propio Strix Halo. Su licencia es MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (DeepSeek-V4.1-Flash-1017) con expertos enrutados podados |
| Parametros totales | 657.884.565.104 (modelo base completo) |
| Parametros activos | no disponible |
| Longitud de contexto | 64K (objetivo de la build; no disponible el máximo del modelo base) |
| Tipos de cuantizacion | GSQ-RCO IQ1_M (expertos, build IQ1_M-E320), GSQ-RCO IQ2_XXS (expertos, build IQ2_XXS-E277), Q8_0 (atención, router, experto compartido, embeddings), IQ4_NL (tabla Engram) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards por build: 3 de modelo + 1 de Engram) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un transformer de mezcla de expertos (MoE) con 384 expertos enrutados por capa, un experto compartido y un total de aproximadamente 658.000 millones de parámetros. En su formato nativo MXFP4 ocupa unos 510 GB. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la model card.

Esta derivación aplica dos innovaciones de compresión. Primera, la poda de expertos: se calcula el score REAP (peso del router multiplicado por el tamaño de salida del experto, promediado sobre los tokens que llegan a cada experto) sobre 131.072 tokens de texto y código mezclados con el modelo nativo completo, y se conservan por capa los expertos mejor puntuados. La build IQ1_M-E320 conserva 320 de 384 expertos (97,5 % del peso de enrutamiento) y la IQ2_XXS-E277 conserva 277 (94,4 %); 47 expertos no se usaron ni una sola vez en la calibración. Segunda, la cuantización GSQ-RCO de IST-DASLab en 1-2 bits para los expertos conservados, copiada sin cambios del repositorio de ISTA-DASLab, mientras que atención, router, experto compartido y embeddings pasan a Q8_0. El router y su sesgo se recortan a los expertos mantenidos. Adicionalmente, una tabla "Engram" de 110,6 GB en IQ4_NL se mantiene en disco y se lee de forma perezosa (lazy), sin consumir memoria de GPU. El autor indica que está trabajando en formatos ROCmFPX propios de unos 2,1 bits por peso o menos que preserven más calidad.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, plantilla de chat embebida adaptada de la versión de Unsloth para V4.1).
- Razonamiento matemático paso a paso, verificado empíricamente con GSM8K (98 % de acierto en las 200 primeras preguntas de test en ambas builds).
- Comportamiento consistente entre backends: coincidencia del 98,0 % (IQ1_M) y 97,2 % (IQ2_XXS) en el token superior entre CUDA y CPU, con divergencia KL media de 0,004 y 0,006.
- Ejecución en hardware de gama alta de consumo gracias a la poda de expertos y la cuantización extrema.
- No hay información disponible sobre tool calling, function calling, agentes, capacidades de visión, audio ni modo de thinking en la model card.

## Casos de uso

- Experimentación local con un MoE de gran escala en hardware unificado: un desarrollador con un Strix Halo de 128 GB puede cargar unos 97 GiB del modelo en GPU y explorar el comportamiento de un modelo de ~658 B de parámetros sin alquilar GPU de datacenter.
- Resolución de problemas matemáticos y razonamiento paso a paso: los tests de GSM8K con decodificación greedy y hasta 6.144 tokens de salida confirman que las builds podadas siguen razonando correctamente.
- Prototipado de pipelines con llama.cpp personalizado: el fork ROCmFPX incluye soporte para DeepSeek-V4.1 y ajustes Vulkan para Strix Halo, útil para quien desarrolle sobre runtimes GGUF.
- Investigación en cuantización extrema y poda de expertos: los listados de expertos conservados están publicados en la carpeta `keep/`, lo que permite reproducir o comparar métodos como REAP y GSQ-RCO.
- Inferencia con contexto de 64K sobre documentos largos: la ventana objetivo de la build permite trabajar con textos extensos, aunque la velocidad de generación medida (~12,6 t/s como cota inferior) exige paciencia.
- Validación de backends heterogéneos: la comparación CUDA frente a CPU con métricas KL hace del modelo un buen banco de pruebas para verificar la corrección numérica de nuevos runtimes (Vulkan, ROCm) frente a referencias conocidas.

## Benchmarks y rendimiento

Datos publicados por el autor de la model card (metodología: llama-server con plantilla de chat embebida, decodificación greedy, hasta 6.144 tokens de salida, 4 peticiones en paralelo; GSM8K sobre las 200 primeras preguntas de test; perplejidad sobre 8 fragmentos de 2.048 tokens de Wikipedia inglesa y código, en CPU):

| Build | Expertos conservados | Perplejidad | GSM8K (200 preguntas) | Respuestas cortadas | Velocidad de prompt (pp512, GB10) | Velocidad de generación (tg128) |
|---|---|---|---|---|---|---|
| IQ1_M-E320 (recomendada) | 320 de 384 | 3,40 | 196/200 (98,0 %) | 0 | 162 t/s | ~12,6 t/s (cota inferior) |
| IQ2_XXS-E277 | 277 de 384 | 3,59 | 196/200 (98,0 %) | 2 | 153 t/s | ~12,6 t/s (cota inferior) |
| Modelo completo (referencia) | 384 | 2,01 | no disponible | - | - | - |

Notas del autor: no existe puntuación del modelo completo con la misma configuración para comparar; GSM8K es una tarea fácil para un modelo de este tamaño, por lo que los resultados demuestran que la poda conserva el razonamiento, no que iguale al modelo completo en tareas más difíciles. Las pruebas se realizaron en un NVIDIA DGX Spark (GB10, CUDA), no en Strix Halo; la velocidad de generación se midió con otros procesos de CPU en marcha, de modo que debe tratarse como límite inferior.

## Requisitos de hardware

- Memoria de GPU necesaria: unos 97 GiB (104,2-104,5 GB) para el modelo; la tabla Engram de 110,6 GB reside en SSD y se lee bajo demanda. Descarga total de una build: unos 215 GB en disco.
- Hardware objetivo: AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada. Validado además en CPU y en NVIDIA DGX Spark (GB10) con CUDA.
- Estado en Strix Halo: la model card indica que aún no se ha ejecutado sobre Strix Halo; los números de rendimiento publicados provienen del GB10.
- No cabe en GPU de consumo convencionales (una RTX 4090 con 24 GB está muy lejos de los 97 GiB requeridos); requiere memoria unificada de 128 GB o GPU de datacenter con memoria suficiente.
- Runtime: es necesario el fork ROCmFPX de llama.cpp (https://github.com/HarshaVardhan3002/ROCmFPX), compilado con Vulkan (`-DGGML_VULKAN=ON`), ya que el llama.cpp oficial aún no soporta DeepSeek-V4.1. No hay mención de soporte en vLLM, TGI u Ollama.
- Latencia y throughput: 153-162 t/s de velocidad de prompt (pp512) y ~12,6 t/s de generación (tg128, cota inferior) en GB10; no hay cifras para Strix Halo.

## Comparativa con modelos similares

Comparativa entre las dos builds publicadas y el modelo base completo:

| Caracteristica | IQ1_M-E320 | IQ2_XXS-E277 | Modelo completo (MXFP4) |
|---|---|---|---|
| Expertos por capa | 320 de 384 | 277 de 384 | 384 |
| Cuantizacion de expertos | GSQ-RCO IQ1_M | GSQ-RCO IQ2_XXS | MXFP4 nativo |
| Memoria de GPU | 104,5 GB (97,3 GiB) | 104,2 GB (97,1 GiB) | 510 GB |
| Perplejidad | 3,40 | 3,59 | 2,01 |
| GSM8K (200 preguntas) | 98,0 % | 98,0 % | no disponible |
| Licencia | MIT | MIT | no disponible |

Alternativas externas comparables de la misma categoría (MoE gigante comprimido para hardware local) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: la perplejidad sube de 2,01 (modelo completo) a 3,40 o 3,59 según la build; el autor lo califica explícitamente como primera iteración con coste de calidad asumido.
- Sin validación en el hardware objetivo: aunque probado en CPU y GB10 con CUDA, el modelo no se ha ejecutado todavía en un Strix Halo real; velocidad y consumo de memoria pueden diferir.
- Velocidad de generación baja: ~12,6 t/s medidos como cota inferior (con otros procesos de CPU activos en la máquina de test).
- Compatibilidad de runtime: el llama.cpp oficial no soporta DeepSeek-V4.1; es obligatorio usar el fork ROCmFPX, lo que añade dependencia de un proyecto comunitario.
- Descarga voluminosa: unos 215 GB por build (más la Engram de 110,6 GB incluida en ella); el tamaño total mostrado por Hugging Face (319,3 GB) suma ambas builds y puede confundir las comprobaciones de hardware.
- Sesgos conocidos: no disponible en la model card; al heredar el modelo base de DeepSeek, deben asumirse los sesgos típicos de LLM entrenados a gran escala.
- Riesgo de alucinación: no disponible en la model card; propio de cualquier LLM generativo.
- Idiomas: no disponible; los tests de calidad se hicieron con texto en inglés y código, por lo que el rendimiento en castellano no está verificado.
- Licencia MIT: permite uso comercial sin restricciones conocidas, aunque los términos del modelo base de DeepSeek podrían aplicar aguas arriba (no disponible en la model card).
- La puntuación de GSM8K solo acredita razonamiento básico; el comportamiento en tareas difíciles respecto al modelo completo no está evaluado.

## Enlaces

- Ficha del modelo: https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-GSQ-RCO-StrixHalo-GGUF
- Modelo base de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización GSQ-RCO de IST-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Fork ROCmFPX (runtime requerido): https://github.com/HarshaVardhan3002/ROCmFPX
- Página del proyecto ROCmFPX: https://harshavardhan3002.github.io/ROCmFPX/
- Paper referenciado (arXiv): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv): https://arxiv.org/abs/2605.00649
