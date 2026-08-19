# mrchuy/Qwen3.8-27B-DFlash-drafter-bootstrap-GGUF

## Resumen

Este repositorio contiene un modelo drafter DFlash para decodificación especulativa, diseñado para acelerar la inferencia del modelo Qwen3.8-27B mediante llama.cpp. El drafter, desarrollado por el usuario mrchuy, es un experimento de transferencia: se han tomado los pesos publicados del drafter DFlash de Qwen3.6-27B y se han adaptado ("bootstrap") al tokenizador y metadatos de Qwen3.8, sin ningún entrenamiento adicional sobre este último modelo. El resultado es un drafter de 1.730.213.120 parámetros (aproximadamente 1,73 mil millones) en formato GGUF, que ocupa unos 1,8 GB.

La relevancia de este modelo radica en que demuestra que un drafter entrenado para una generación anterior del modelo puede transferirse parcialmente a la nueva generación, logrando una aceleración neta de la decodificación aunque no alcance el rendimiento de un drafter nativo. En las pruebas controladas publicadas, el drafter bootstrap alcanza un 57,2 % de aceptación del primer token especulativo y un 34,0 % de aceptación global, lo que se traduce en un aumento de velocidad del 34,6 % frente a la inferencia plana de Qwen3.8-27B (31,94 tok/s frente a 23,73 tok/s). No obstante, el MTP (Multi-Token Prediction) nativo de Qwen3.8 sigue siendo muy superior, con un 71,65 % de aceptación global y 50,70 tok/s.

Este drafter no es un modelo de propósito general: su única función es proponer tokens candidatos durante la decodificación especulativa. Es una pieza experimental que puede servir como punto de partida para un futuro fine-tuning específico de Qwen3.8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash (drafter para decodificacion especulativa), basado en transformer, transferido desde Qwen3.6-27B-DFlash |
| Parametros totales | 1.730.213.120 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo Qwen3.8-27B, que soporta 256K segun documentacion de Unsloth) |
| Tipos de cuantizacion | Q8_0 (unico formato publicado en este repositorio) |
| Idiomas soportados | no disponible (el drafter no procesa lenguaje directamente; hereda las capacidades del modelo objetivo) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

DFlash es una tecnica de decodificacion especulativa que utiliza un modelo drafter pequeno para predecir varios tokens futuros en paralelo, que luego son verificados por el modelo objetivo. El drafter aqui presentado es una red neuronal transformer compacta de 1,73 mil millones de parametros, originalmente entrenada para Qwen3.6-27B. El autor la ha "transplantado" a Qwen3.8 cambiando la compatibilidad del tokenizador y los metadatos del modelo objetivo, pero sin realizar ningun entrenamiento o ajuste adicional sobre datos de Qwen3.8.

El proceso de bootstrap consiste en cargar los pesos del drafter de Qwen3.6, reemplazar la informacion del tokenizador y las referencias al modelo objetivo, y exportar el resultado en formato GGUF. No se ha publicado informacion sobre el dataset de entrenamiento original del drafter, ni sobre el proceso de entrenamiento de DFlash en Qwen3.6. La unica innovacion tecnica destacable es la propia transferencia entre generaciones de modelos, que demuestra cierto grado de generalizacion en la capacidad de prediccion especulativa, aunque con una aceptacion de tokens significativamente menor que la de un drafter nativo.

## Capacidades

- Decodificacion especulativa: el modelo propone hasta 3 tokens candidatos por paso de decodificacion (configuracion `n_max=3` recomendada), que son verificados por Qwen3.8-27B.
- Aceleracion de inferencia: en las pruebas publicadas, logra un 34,6 % de mejora en velocidad de decodificacion frente a la inferencia plana del modelo objetivo.
- Transferencia entre generaciones: demuestra que un drafter entrenado para Qwen3.6 puede funcionar parcialmente con Qwen3.8 sin reentrenamiento.
- Compatibilidad con llama.cpp: se integra mediante la opcion `spec-type = draft-dflash` y `spec-draft-model` en la configuracion de llama.cpp.
- No genera texto de forma autonoma: su unica funcion es proponer tokens candidatos; no tiene capacidades de chat, razonamiento, vision ni codigo por si mismo.

## Casos de uso

- Despliegue de Qwen3.8-27B con menor latencia en produccion: al integrar este drafter en llama.cpp, se puede reducir el tiempo de generacion de respuestas en servicios de chat o asistentes virtuales, especialmente cuando el hardware disponible no permite ejecutar el modelo objetivo a maxima velocidad.
- Inferencia en hardware modesto: con un drafter de solo 1,8 GB en Q8_0, se puede ejecutar en la misma GPU que el modelo objetivo (o en una GPU secundaria) sin un coste de memoria significativo, mejorando el rendimiento en configuraciones de doble GPU como las utilizadas en las pruebas (2x RTX 4060 Ti 16 GB).
- Evaluacion de tecnicas de decodificacion especulativa: este modelo sirve como banco de pruebas para comparar la transferencia entre generaciones de modelos y para estudiar el impacto de la aceptacion de tokens en la velocidad final.
- Punto de partida para fine-tuning: los pesos bootstrap pueden utilizarse como inicializacion para un entrenamiento especifico de DFlash sobre Qwen3.8, potencialmente reduciendo el tiempo de entrenamiento necesario.
- Optimizacion de costes en entornos de inferencia por lotes: en aplicaciones que procesan multiples solicitudes simultaneas, la decodificacion especulativa puede aumentar el throughput global del servidor, reduciendo el coste por token generado.
- Experimentacion academica: investigadores interesados en decodificacion especulativa pueden utilizar este modelo para reproducir los resultados publicados y explorar variaciones en la profundidad del drafter (`n_max`) o en la cuantizacion.

## Benchmarks y rendimiento

La model card incluye un benchmark controlado realizado con el modelo objetivo `Qwen3.8-27B-UD-Q4_K_XL.gguf` en 2x NVIDIA RTX 4060 Ti 16 GB, con contexto de 75.000 tokens, prompt de 5.163 tokens, presupuesto de razonamiento de 1.000 y temperatura 1.0. Los resultados son los siguientes:

| Modo | Draft depth | Prompt tok/s | Decode tok/s | vs Plain | Draft acceptance | llama.cpp mean len | Acceptance por posicion |
|---|---:|---:|---:|---:|---:|---:|---|
| Plain Qwen3.8 Q4 | — | 1008.97 | 23.73 | baseline | — | — | — |
| Qwen3.6 → Qwen3.8 DFlash (bootstrap) | 3 | 783.93 | 31.94 | +34.6% | 34.04% | 2.02 | 57.2%, 29.7%, 15.2% |
| Native Qwen3.8 MTP | 3 | 959.32 | 50.70 | +113.7% | 71.65% | 3.15 | 85.5%, 71.0%, 58.5% |

Tambien se realizaron experimentos variando la profundidad del drafter (`n_max`). Los resultados completos muestran que `n_max=2` o `n_max=3` son los valores utiles, mientras que `n_max=10` degrada el rendimiento (aproximadamente 25.8 tok/s, aunque la ejecucion fue interrumpida). Los datos de `n_max=1` y `n_max=2` son provisionales por ejecuciones interrumpidas.

Estos resultados son de una unica generacion con muestreo estocastico, por lo que deben considerarse comparativos, no una estadistica multi-ejecucion.

## Requisitos de hardware

- VRAM estimada: el drafter en Q8_0 ocupa aproximadamente 1,8 GB. Puede ejecutarse en la misma GPU que el modelo objetivo si hay VRAM disponible, o en una GPU secundaria mediante `device-draft = CUDA0` y `n-gpu-layers-draft = all`.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para el drafter. En las pruebas se utilizaron 2x NVIDIA RTX 4060 Ti 16 GB, con el drafter en una de ellas y el modelo objetivo dividido entre ambas.
- Compatibilidad con GPU de consumo: si, el drafter cabe en cualquier GPU moderna, incluidas RTX 3060, RTX 4060, etc. El modelo objetivo Qwen3.8-27B en cuantizacion Q4 requiere al menos 16 GB de VRAM.
- Opciones de despliegue: llama.cpp (version con soporte DFlash), configuracion `spec-type = draft-dflash` y `spec-draft-model = /ruta/al/gguf`. No se ha probado con otros motores como vLLM u Ollama.
- Latencia y throughput: en el benchmark, el drafter bootstrap logro 31.94 tok/s de decodificacion frente a 23.73 tok/s del modelo plano, con una latencia de prompt de 783.93 tok/s (inferior a los 1008.97 tok/s del modelo plano debido al coste del drafter en la fase de prefill).

## Comparativa con modelos similares

Este drafter se compara directamente con el MTP nativo de Qwen3.8-27B, que es la alternativa integrada en el propio modelo. Tambien existe un drafter DFlash original para Qwen3.6, aunque no se dispone de datos publicos de rendimiento en este repositorio. La tabla siguiente resume la comparativa basandose en los datos del benchmark publicado:

| Caracteristica | DFlash bootstrap (este modelo) | MTP nativo Qwen3.8 | Sin drafter (plano) |
|---|---|---|---|
| Parametros del drafter | 1,73 B | integrado en el modelo (no separable) | — |
| Aceptacion global de tokens | 34,04 % | 71,65 % | — |
| Velocidad de decodificacion | 31,94 tok/s | 50,70 tok/s | 23,73 tok/s |
| Mejora vs plano | +34,6 % | +113,7 % | baseline |
| Entrenamiento especifico | No (transferido de Qwen3.6) | Si (nativo de Qwen3.8) | — |
| Formato | GGUF, Q8_0 | integrado en GGUF del modelo | — |
| Licencia | no disponible | Apache 2.0 (segun documentacion de Qwen3.8) | Apache 2.0 |

No se dispone de datos de otros drafters como EAGLE o Medusa para comparar en este contexto.

## Limitaciones y advertencias

- Modelo experimental: no ha sido entrenado para Qwen3.8, solo transferido. Su rendimiento es significativamente inferior al MTP nativo y puede variar con diferentes prompts, temperaturas o configuraciones de hardware.
- Sin garantias de produccion: los resultados del benchmark son de una unica ejecucion con muestreo estocastico; no hay estadisticas multi-ejecucion ni pruebas de robustez.
- Licencia no especificada: no se indica la licencia del drafter en la model card. Antes de usar en proyectos comerciales, es necesario contactar con el autor o verificar la licencia de los pesos originales de Qwen3.6-DFlash.
- Dependencia del modelo objetivo: el drafter solo funciona con Qwen3.8-27B y requiere la configuracion especifica de llama.cpp con soporte DFlash. No es compatible con otros modelos ni motores sin modificaciones.
- Profundidad de borrador limitada: los experimentos muestran que `n_max` mayor de 3 degrada el rendimiento; la configuracion recomendada es `n_max=2` o `n_max=3`.
- Riesgo de alucinacion y sesgos: al ser un drafter, no genera contenido propio, pero hereda los sesgos y riesgos del modelo objetivo Qwen3.8-27B, que no han sido evaluados en este repositorio.
- Idioma: no se especifican idiomas soportados; el drafter depende del tokenizador de Qwen3.8, que soporta multiples idiomas, pero la transferencia puede afectar a la calidad de la prediccion en idiomas poco representados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrchuy/Qwen3.8-27B-DFlash-drafter-bootstrap-GGUF
- Repositorio relacionado (drafter FP8): https://huggingface.co/rwmacy/qwen3.8-27b-dflash-drafter-fp8-b70
- Documentacion de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Guia para ejecutar Qwen3.8-27B localmente: https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Blog de AMD sobre soporte de Qwen3.8: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
