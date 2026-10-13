# scottlowry/Qwen3.6-35B-A3B-oQ8e-mtp

## Resumen

Este repositorio contiene una version cuantizada a 8 bits del modelo multimodal de mezcla de expertos (MoE) Qwen3.6-35B-A3B, publicada por el usuario scottlowry bajo el identificador scottlowry/Qwen3.6-35B-A3B-oQ8e-mtp. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.7.1.dev1), que aplica precision mixta de 8 bits con tamano de grupo 64, y el resultado se distribuye en formato MLX safetensors, pensado para su ejecucion en hardware de Apple Silicon mediante la libreria MLX.

El modelo base, Qwen3.6-35B-A3B, es un MoE multimodal de 35.000 millones de parametros totales y aproximadamente 3.000 millones activos, con 40 capas y una longitud de contexto de 262.144 tokens, extensible hasta 1.013.000 tokens mediante YaRN. Esta disenado para codificacion agentica, razonamiento multimodal y comprension de contexto largo sobre entradas de texto, imagen y video. El sufijo "mtp" del repositorio hace referencia a Multi-Token Prediction, una tecnica asociada al modelo base que permite acelerar la inferencia.

La relevancia de esta ficha radica en que se trata de una variante de cuantizacion concreta (no oficial) de un modelo reciente, orientada a reducir el peso en memoria para despliegue en equipos de consumo con memoria unificada. No obstante, el repositorio no declara licencia, idiomas soportados ni resultados de evaluacion, y no registra descargas ni valoraciones, por lo que debe tratarse con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (etiqueta del repo: qwen3_5_moe); modelo base Qwen3.6-35B-A3B, 40 capas |
| Parametros totales | 35.951.822.704 (~35,95 mil millones) |
| Parametros activos | ~3.000 millones (dato del modelo base) |
| Longitud de contexto | 262.144 tokens, extensible a ~1.013.000 con YaRN (dato del modelo base) |
| Tipos de cuantizacion | 8 bits, grupo de 64, precision mixta (oQ / oMLX v0.7.1.dev1) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (tamano del repo 38,6 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 40 capas, 35.000 millones de parametros totales y unos 3.000 millones activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. Segun las fuentes consultadas, es multimodal (texto, imagen y video) y esta orientado a razonamiento y comprension de contexto largo, con capacidad de preservar el "thinking" entre turnos de conversacion. Incluye soporte de Multi-Token Prediction (MTP), que predice varios tokens por paso y, con el backbone congelado, puede ofrecer hasta un 7,8x de aceleracion de inferencia segun el articulo de dasroot.net. El modelo base se asocia a una publicacion de abril de 2026.

Sobre el proceso de entrenamiento detallado (numero de tokens, composicion del dataset, si hubo RLHF o DPO) no se proporciona informacion en los materiales disponibles. La unica transformacion documentada en este repositorio es la cuantizacion posterior mediante oQ (oMLX v0.7.1.dev1) a 8 bits con precision mixta y grupo de 64, que no reentrena el modelo sino que comprime los pesos. No se especifica que capas se mantienen en mayor precision dentro del esquema mixto.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, heredados del modelo base MoE.
- Capacidades multimodales sobre texto, imagen y video, segun la descripcion del modelo base.
- Codificacion agentica y razonamiento orientado a agentes.
- Comprension de contexto largo gracias a los 262.144 tokens (ampliables con YaRN).
- Preservacion del modo "thinking" entre turnos de conversacion en el modelo base.
- Aceleracion mediante Multi-Token Prediction (MTP) en el backbone congelado.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante cuantizada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente de codigo en local: el modelo puede generar y revisar codigo dentro de un flujo agentico sobre una maquina Apple Silicon, aprovechando sus 3.000 millones de parametros activos para reducir latencia frente a modelos densos de tamano similar.
- Analisis de repositorios extensos: con 262.144 tokens de contexto, es posible cargar ficheros y documentacion de un proyecto completo y hacer preguntas transversales sin trocear el contenido.
- Razonamiento sobre documentos con imagenes: al ser multimodal, permite extraer informacion de capturas, diagramas o figuras tecnicas y razonar sobre ellas junto al texto.
- Procesamiento de video para resumen o anotacion: la entrada de video del modelo base permite tareas de descripcion de escenas o extraccion de informacion temporal.
- Prototipado en Mac sin GPU dedicada: al distribuirse en formato MLX, encaja en flujos de trabajo sobre Apple Silicon con memoria unificada, evitando el coste de una GPU NVIDIA.
- Experimentacion en investigacion: util para comparar el efecto de la cuantizacion 8-bit oQ frente al modelo en precision completa sobre la misma tarea.
- Agentes conversacionales de contexto largo: la preservacion del "thinking" entre turnos del modelo base resulta util en dialogos prolongados con estado acumulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Existe una entrada de blog (dredyson.com) sobre el modelo base en FP8 que menciona analisis de rendimiento, pero no aporta cifras concretas en el material consultado, por lo que no se reproducen numeros que no esten verificados.

## Requisitos de hardware

- El repositorio pesa 38,6 GB, por lo que la inferencia en 8 bits requiere aproximadamente 40 GB de memoria solo para los pesos, mas el espacio para la cache KV, que crece con la longitud de contexto.
- Formato MLX: la ejecucion nativa esta pensada para Apple Silicon (familias M1, M2, M3 y M4), que es donde MLX esta soportado de forma oficial.
- En Mac, se recomienda un equipo con 48 GB o mas de memoria unificada para un uso comodo; con 64 GB o mas es posible trabajar con contextos largos sin recurrir a swap.
- No se ha confirmado compatibilidad directa con GPU NVIDIA (CUDA) en formato MLX; usarlo en esas plataformas requeriria conversion a otro formato.
- Opciones de despliegue documentadas o plausibles: mlx-lm y el servidor MLX (mlx_lm.server). El uso con vLLM, llama.cpp, Ollama o TGI no esta confirmado para este formato sin conversion previa.
- Latencia y throughput estimados: no disponible. El modelo base con MTP y backbone congelado reporta hasta 7,8x de aceleracion, pero no se dispone de cifras para esta variante cuantizada concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Este repo (Qwen3.6-35B-A3B-oQ8e-mtp) | ~35,95B (3B activos) | 262k (heredado) | 8 bits oQ | MLX safetensors | no disponible |
| Qwen3.6-35B-A3B (base) | 35B (3B activos) | 262k, hasta 1,01M con YaRN | BF16 / FP8 | safetensors | no disponible en este material |
| Qwen3.5-9B-oQ8e-mtp (mismo autor) | ~9B (por nombre) | no disponible | 8 bits oQ | MLX safetensors | no disponible |

No se dispone de resultados de rendimiento comparativos entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, cuantizacion, formato y licencia.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, por lo que el uso comercial es incierto y debe aclararse antes de cualquier despliegue en produccion.
- El repositorio registra 0 descargas y 0 valoraciones, de modo que no hay evidencia externa de calidad ni de fidelidad respecto al modelo base.
- La cuantizacion a 8 bits con precision mixta puede introducir degradacion en tareas sensibles, aunque el impacto exacto no esta documentado ni medido.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se aportan evaluaciones de fiabilidad.
- No se especifican los idiomas soportados, por lo que el comportamiento multilingue es desconocido.
- La ventana de contexto de 262.144 tokens pertenece al modelo base; no se confirma que la variante cuantizada mantenga el mismo rendimiento en contextos muy largos ni que conserve la extension YaRN.
- Dependencia del ecosistema MLX: la portabilidad a CUDA, ROCm u otros backends no esta garantizada sin conversion.
- La coexistencia de la etiqueta qwen3_5_moe con el nombre Qwen3.6-35B-A3B sugiere una posible ambiguedad en la base utilizada; conviene verificar la procedencia exacta antes de usarlo.
- No se han publicado benchmarks en los materiales disponibles, lo que impide validar sus capacidades frente a alternativas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/scottlowry/Qwen3.6-35B-A3B-oQ8e-mtp
- Perfil del autor: https://huggingface.co/scottlowry/models
- Otro modelo del mismo autor: https://huggingface.co/scottlowry/Qwen3.5-9B-oQ8e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Ficha del modelo base en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
- Articulo sobre Qwen3.6-35B-A3B y FP8: https://dredyson.com/the-hidden-truth-about-qwen3-6-35b-a3b-and-fp8-what-every-developer-needs-to-know-a-complete-expert-analysis-of-performance-benchmarks-and-real-world-deployment/
- Articulo sobre Qwen 3.6 35B A3B y MTP: https://dasroot.net/posts/2026/05/qwen-3-6-35b-a3b-mtp-frozen-backbones-speedup/
