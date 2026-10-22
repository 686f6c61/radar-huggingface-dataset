# cadazar/han2han-rl-flax

## Resumen

Han2Han RL (checkpoint Flax) es un modelo encoder-decoder de 169 millones de parametros publicado por el usuario cadazar, especializado en la transcripcion bidireccional entre hangul (coreano moderno) y hanja (caracteres sino-coreanos). No es un modelo de proposito general: es el resultado de aplicar 300 pasos de GRPO (Group Relative Policy Optimization) sobre el checkpoint de instrucciones `cadazar/han2han-it-flax` (paso 762), con el objetivo de mejorar la fidelidad de la transcripcion en ambos sentidos mediante recompensas basadas en reglas.

El interes de esta publicacion es fundamentalmente de reproducibilidad e investigacion. Se distribuye el checkpoint tal y como lo guardo el entrenador en JAX/Flax (formato orbax OCDBT), junto con los registros completos de la ejecucion: `history.jsonl` con una fila por paso (recompensa y sus terminos, KL, fraccion de clipping, entropia, norma del gradiente, learning rate, NLL de replay, tiempos), `probes.jsonl` con una sonda de 64 frases evaluada cada 50 pasos y los resumenes de evaluacion final. Su gemelo en PyTorch es `cadazar/han2han-rl`, cuyos pesos se convirtieron exactamente desde este checkpoint.

Es relevante ahora porque documenta de forma inusualmente detallada un ciclo completo de RL con recompensas verificables sobre una tarea linguistica acotada y de bajo资源... de bajo coste computacional, y porque permite continuar el entrenamiento en JAX o auditar la receta paso a paso. No hay resultados de benchmarks publicados en la informacion disponible, y el repositorio no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (la model card no detalla la variante interna) |
| Parametros totales | 169 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se entrenaron y guardaron en float32 |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint orbax (OCDBT, `StandardCheckpointHandler`) para JAX/Flax; el gemelo PyTorch esta en `cadazar/han2han-rl` |
| Tamano del repositorio | 0,6 GB |
| Libreria | JAX / Flax |
| Modelo base | `cadazar/han2han-it-flax` (paso 762) |
| Datasets | `seyoungsong/Open-Korean-Historical-Corpus`, `cadazar/han2han-rl-data` |
| Fecha de creacion | 2026-10-22 |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder de 169M de parametros. La model card no especifica la variante interna ni la composicion de capas, cabezas de atencion o dimension del modelo, por lo que esos datos deben considerarse no disponibles. El checkpoint distribuido contiene unicamente el item `model` (parametros) y el item `meta` (configuracion JSON); el estado del optimizador no se incluye (704 MB de momentos NorMuon fueron descartados), de modo que `restore_checkpoint(..., model_only=True)` es la ruta de carga prevista.

El entrenamiento consiste en 300 pasos de GRPO ejecutados con `rl/jax/train_grpo.py` del repositorio privado en el commit `7a2a723a` (2026-10-05), partiendo del paso 762 del modelo de instrucciones con todos los pesos en float32. Se usaron 39.495 frases de entrenamiento (`n_train`) del fichero `task_data/transcription_pool_clean.parquet`, con probabilidad 0,5 de generar la direccion hangul→hanja. La configuracion clave: optimizador NorMuon con learning rate 5e-6, 10 pasos de warmup, `max_grad_norm` 1,0, coeficiente beta de KL contra el modelo de partida 0,02, muestreo con temperatura 0,7 y top_p 1,0, 16 prompts con 8 generaciones cada uno por paso (`rollout_batch` 32, `micro_batch` 8), y un termino de replay desde `task_data/it_replay/train.parquet` con coeficiente 0,5 y 16 filas por paso para mitigar el olvido catastrofico del comportamiento conversacional. Semilla 0, evaluacion de sondas cada 50 pasos y checkpoints cada 100.

La innovacion destacable no esta en la arquitectura sino en la funcion de recompensa: se usan exclusivamente reglas, con peso cero para los jueces neuronales. Los terminos son terminacion correcta, coincidencia de longitud, presencia de hanja, acierto de hanja dorado, acierto de lectura dorada, ida y vuelta (round trip), ausencia de sentinel y penalizacion de repeticiones. El layout de prompt es `it`: la tarea va en el mensaje de sistema y el texto a transcribir en el mensaje de usuario.

## Capacidades

- Transcripcion hangul→hanja: convierte texto coreano moderno a la grafia en caracteres sino-coreanos.
- Transcripcion hanja→hangul: realiza la operacion inversa, incluyendo la lectura del hanja.
- Consistencia bidireccional: la recompensa de ida y vuelta entrena explicitamente la coherencia entre ambas direcciones.
- Formato conversacional de dos turnos (system + user) heredado del modelo de instrucciones base.
- Generacion greedy y muestreada: se publican evaluaciones con decodificacion greedy (`run/eval/summary.json`) y con temperatura 0,6 (`run/eval_t0.6/summary.json`).
- Procesamiento de frases sueltas del corpus historico coreano (`Open-Korean-Historical-Corpus`).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido; no hay evidencia de ello en la informacion disponible.
- Multilingue: no. Solo coreano, con el subconjunto de caracteres hanja asociado.

## Casos de uso

- Digitalizacion de corpus historicos coreanos: el modelo transcribe lineas de texto hangul a hanja para reconstruir la grafia original de documentos, usando el corpus historico como dominio de referencia.
- Normalizacion de textos sino-coreanos: conversion inversa hanja→hangul para hacer buscables y editables documentos antiguos antes de indexarlos en un motor de busqueda o en un pipeline de NLP.
- Preprocesamiento para modelos mayores: servir como etapa de normalizacion de entrada en una cadena donde un modelo grande de coreano consume texto homogeneizado; sus 169M permiten ejecutarlo en CPU o en una GPU pequena junto al modelo principal.
- Herramienta educativa de hanja: dado que devuelve la lectura junto con los caracteres, puede alimentar ejercicios de aprendizaje de sino-coreanos con correccion automatica por round trip.
- Investigacion en RL con recompensas verificables: el paquete de logs (`history.jsonl` con 300 filas, `probes.jsonl`, configuracion resuelta) permite estudiar la dinamica de GRPO —evolucion de KL, entropia, fraccion de clipping— en una tarea con recompensa determinista y barata de evaluar.
- Reproduccion de la conversion JAX→PyTorch: los SHA-256 de cada fichero bajo `checkpoints/300/` permiten verificar que la conversion a `cadazar/han2han-rl` es exacta, util para validar tooling de interoperabilidad entre frameworks.
- Continuacion del entrenamiento en JAX: aunque el estado del optimizador no se distribuye, el checkpoint de modelo y la configuracion permiten reanudar con un optimizador nuevo o hacer fine-tuning adicional sobre otra variante de la tarea.
- Control de calidad de datasets: la recompensa de round trip y la penalizacion de repeticiones hacen del modelo un detector razonable de pares hangul/hanja mal alineados en un corpus, marcando las frases que no se reconstruyen de forma consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia dos ficheros de evaluacion final (`run/eval/summary.json` con decodificacion greedy y `run/eval_t0.6/summary.json` con muestreo a temperatura 0,6 y sin articulo) y metricas por direccion en `run/probes.jsonl` para los pasos 0, 50, 100, 150, 200, 250 y 300, pero las cifras concretas no se incluyen en la informacion proporcionada. Las salidas por frase de la evaluacion y los ejemplos generados por las sondas no se distribuyen porque las frases de evaluacion son filas reservadas de un corpus no redistribuible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,7 GB solo para pesos (169M × 4 bytes), mas activaciones; en la practica alrededor de 1-1,5 GB (estimacion a partir del numero de parametros, no confirmada por el autor).
- En bfloat16 o float16: aproximadamente 0,35 GB de pesos; cuantizaciones de 8 y 4 bits no estan publicadas ni documentadas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB, como una GTX 1650, RTX 3050 o RTX 4060; tambien cabe holgadamente en RTX 3090, RTX 4090, A100 y H100, donde el cuello de botella sera el preprocesado y no el modelo.
- Inferencia en CPU: viable por tamano, aunque no hay cifras de latencia publicadas.
- Opciones de despliegue: este repositorio requiere el codigo JAX del proyecto `cadazar/han2han` en GitHub y `restore_checkpoint` sobre el formato orbax; no hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, ni ficheros GGUF. Para `transformers` debe usarse el gemelo `cadazar/han2han-rl`.
- Latencia y throughput: no disponibles. El entrenamiento uso `micro_batch` 8 y un `rollout_batch` de 32 secuencias por paso en hardware no especificado.

## Comparativa con modelos similares

No hay datos publicados sobre modelos externos comparables en la informacion disponible. La comparacion posible se limita a los tres artefactos de la misma familia:

| Modelo | Parametros | Framework | Etapa de entrenamiento | Licencia |
|---|---|---|---|---|
| `cadazar/han2han-it-flax` | 169M | JAX/Flax | Instrucciones (paso 762), sin RL | Apache 2.0 |
| `cadazar/han2han-rl-flax` (este) | 169M | JAX/Flax | GRPO, 300 pasos desde el anterior | Apache 2.0 |
| `cadazar/han2han-rl` | 169M | PyTorch | Mismos pesos que este, convertidos | Apache 2.0 |

La diferencia funcional entre los dos primeros es la optimizacion con GRPO y recompensas por reglas; entre el segundo y el tercero no hay diferencia de pesos, solo de formato y ecosistema. No se dispone de datos para comparar con modelos de traduccion historica coreana de otros autores.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo esta entrenado unicamente para transcripcion hangul↔hanja; no es un modelo de chat ni de proposito general, y el termino de replay solo busca preservar parte del comportamiento conversacional del modelo base.
- Un solo idioma: coreano, con el inventario de hanja presente en los datos de entrenamiento. No hay soporte multilingue declarado.
- Riesgo de alucinacion de caracteres: al ser un modelo generativo, puede producir hanja validos pero incorrectos para una palabra (homofonos sino-coreanos), o lecturas plausibles no presentes en el original; la recompensa de round trip reduce pero no elimina este fallo.
- Sin benchmarks publicos: no hay MMLU, HumanEval ni metricas equivalentes, y las cifras de la evaluacion propia no acompanan a la informacion disponible, por lo que el rendimiento real frente al modelo base no puede verificarse externamente.
- No se puede reanudar el entrenamiento de forma exacta: falta el estado del optimizador (704 MB de momentos NorMuon), de modo que una reanudacion parte de un optimizador reiniciado.
- Las rutas de `run_config.json` corresponden a la maquina del autor y se dejan tal cual; hay que reescribirlas para reproducir el entorno.
- Evaluacion no auditable frase a frase: las salidas por frase y las muestras de las sondas no se distribuyen por restricciones del corpus, lo que limita la verificacion independiente.
- Licencia Apache 2.0: permisiva para uso comercial, pero el autor no ofrece garantias y el corpus de evaluacion tiene sus propias condiciones, que no se detallan.
- Madurez: cero descargas y cero likes en el momento de la publicacion; no hay evidencia de uso en produccion por terceros.
- Compatibilidad: al no existir GGUF ni soporte en servidores de inferencia habituales, la integracion requiere escribir codigo JAX o convertir el modelo.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/cadazar/han2han-rl-flax
- Gemelo PyTorch: https://huggingface.co/cadazar/han2han-rl
- Modelo base (instrucciones, Flax): https://huggingface.co/cadazar/han2han-it-flax
- Modelo base (revision `main`): https://huggingface.co/cadazar/han2han-it
- Repositorio de codigo: https://github.com/cadazar/han2han
- Dataset del corpus historico: https://huggingface.co/datasets/seyoungsong/Open-Korean-Historical-Corpus
- Dataset de RL: https://huggingface.co/datasets/cadazar/han2han-rl-data
- Paper, blog o demo: no disponible en la informacion proporcionada.
