# pgmharikrishnan/MiniCPM-V-4.7-35B-A3B-MLX-Serve-4bit

## Resumen

MiniCPM-V-4.7-35B-A3B-MLX-Serve-4bit es una cuantizacion afin de 4 bits del modelo openbmb/MiniCPM-V-4.7-35B-A3B, preparada por el usuario independiente pgmharikrishnan para el runtime mlx-serve sobre Apple Silicon. El modelo base lo desarrollo OpenBMB y combina una arquitectura Mixture-of-Experts (MoE) con aproximadamente 34.660 millones de parametros totales, de los cuales solo una fraccion se activa por token (la nomenclatura A3B sugiere unos 3.000 millones de parametros activos, aunque el dato exacto no figura en la informacion disponible).

El problema que resuelve esta publicacion es concreto: permitir ejecutar un MoE de gran tamano en Macs con memoria unificada, mediante cuantizacion de los expertos enrutados a 4 bits y manteniendo en BF16 las normas, escalas y sesgos. El paquete es exclusivamente de texto: no incluye la torre de vision ni el merger del modelo multimodal original, por lo que no procesa imagenes ni video. Es relevante ahora porque demuestra que modelos MoE de la clase 35B pueden servirse en hardware de consumo Apple con un pico de memoria de 24,7 GB y velocidades de decodificacion de 60,6 tok/s.

La licencia es Apache-2.0, heredada del modelo base, lo que facilita el uso comercial. La conversion es no oficial y el propio autor recomienda validarla para la carga de trabajo concreta antes de llevarla a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), tipo nativo `minicpmv4_7` |
| Parametros totales | 34.659.887.872 (~34,66 B) |
| Parametros activos | ~3 B (inferido de la nomenclatura A3B; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin 4 bits, group size 64; expertos enrutados a 4 bits; gates de router y de shared-expert a 8 bits; normas, escalas y sesgos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); tamano del repo 19,5 GB |
| Runtime requerido | mlx-serve v26.10.2 o superior |
| Modalidad | Solo texto (sin torre de vision ni merger) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture-of-Experts: cada capa contiene expertos enrutados y un gate de router que decide que expertos se activan por token, ademas de gates de shared-expert. La cuantizacion respeta esta estructura tratando de forma diferenciada los expertos enrutados (4 bits), los gates (8 bits) y los parametros sensibles como normas y sesgos (BF16). El modelo base es multimodal (MiniCPM-V), pero esta conversion elimina deliberadamente la parte visual y conserva unicamente los pesos del modelo de lenguaje.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base uso RLHF, DPO u otras tecnicas de alineamiento; esos datos corresponden a la model card de openbmb y no se incluyen en la informacion proporcionada. Tampoco se documentan innovaciones tecnicas adicionales del modelo base (atencion lineal, decodificacion especulativa u otras) mas alla del propio diseno MoE.

## Capacidades

- Generacion de texto conversacional y de proposito general en modo solo texto.
- Razonamiento y conocimiento general: el autor reporta 89,75% en MMLU-Pro sobre 400 preguntas.
- Razonamiento matematico: 100% en GSM8K sobre 50 preguntas.
- Generacion de codigo: 6/6 tareas resueltas en el conjunto de evaluacion del autor.
- Servido de baja latencia en Apple Silicon mediante mlx-serve, con decodificacion a 60,6 tok/s.
- Soporte de tool calling, function calling, agentes multi-paso, thinking mode o capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision y video: no disponibles en este paquete (eliminadas respecto al modelo base).

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede servirse con `mlx-serve serve` y atender conversaciones multi-turno en un equipo Apple con 24,7 GB de pico de memoria, sin depender de la nube.
- Prototipado de agentes en estacion de trabajo: la naturaleza MoE reduce el coste computacional por token, lo que permite iterar sobre flujos de razonamiento en local antes de desplegar en infraestructura mayor.
- Generacion de codigo en entornos de desarrollo sobre macOS: el rendimiento reportado (6/6 tareas) y la decodificacion a 60,6 tok/s lo hacen util para autocompletado y generacion de fragmentos en el editor.
- Evaluacion de modelos MoE en hardware de consumo: sirve como banco de pruebas para medir throughput y memoria de un MoE de 35B en Apple Silicon antes de invertir en GPU dedicadas.
- Procesamiento por lotes de texto en local: tareas de resumen, clasificacion o reescritura que se benefician de ejecutarse en el propio equipo por privacidad de los datos.
- Educacion e investigacion: reproduccion de resultados de benchmarks (MMLU-Pro, GSM8K) en un portatil o Mac Studio para estudiar el comportamiento de MoE cuantizados a 4 bits.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en Apple M4 Max con mlx-serve 26.10.2:

| Benchmark | Resultado |
|---|---|
| MMLU-Pro (400 preguntas) | 89,75% (359/400) |
| GSM8K (50 preguntas) | 100% |
| Coding (6 tareas) | 6/6 |
| Decodificacion | 60,6 tok/s |
| Prefill | 343 tok/s |
| Memoria pico | 24,7 GB |

El propio autor advierte que MMLU-Pro es publico y no puede descartarse contaminacion por entrenamiento. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- Memoria: pico medido de 24,7 GB durante la ejecucion de los benchmarks; se recomienda un equipo con al menos 32 GB de memoria unificada para dejar margen al sistema.
- Hardware validado: Apple M4 Max (serie M de Apple Silicon con soporte MLX).
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; el formato MLX esta pensado para Apple Silicon y no se documenta soporte en CUDA.
- Despliegue: mlx-serve v26.10.2 o superior, mediante `mlx-serve serve --model pgmharikrishnan/MiniCPM-V-4.7-35B-A3B-MLX-Serve-4bit`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: 60,6 tok/s en decodificacion y 343 tok/s en prefill sobre M4 Max.
- Tamano en disco: 19,5 GB de repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-MLX-Serve-4bit (este) | ~34,66 B totales, ~3 B activos | no disponible | Apache-2.0 | safetensors MLX / mlx-serve | Solo texto, cuantizado a 4 bits |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | ~34,66 B totales, ~3 B activos | no disponible | Apache-2.0 | safetensors / transformers | Multimodal (texto, imagen, video) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Conversion no oficial: no la mantiene OpenBMB y el autor recomienda validarla para la carga de trabajo antes de usarla en produccion.
- Solo texto: no procesa imagenes ni video; si se necesita vision hay que usar el modelo base.
- Requiere mlx-serve v26.10.2 o superior; no funciona con otros runtimes sin conversion adicional.
- Limitado a Apple Silicon (MLX); no hay soporte documentado para CUDA.
- Riesgo de contaminacion en MMLU-Pro, reconocido por el propio autor; los resultados de GSM8K y coding se basan en muestras pequenas (50 y 6 tareas), por lo que su valor estadistico es limitado.
- Longitud de contexto e idiomas soportados no documentados: no se puede garantizar comportamiento en contextos largos ni en castellano sin evaluacion propia.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de robustez para esta conversion.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo base en tareas sensibles; no se aportan comparativas directas base vs. cuantizado.
- Licencia Apache-2.0 permite uso comercial, pero al ser una conversion independiente conviene revisar los terminos del modelo base y citar la atribucion a OpenBMB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pgmharikrishnan/MiniCPM-V-4.7-35B-A3B-MLX-Serve-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Organizacion OpenBMB: https://huggingface.co/openbmb
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
