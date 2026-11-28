# FastFlowLM/Hy-Memory-30B-A3B-NPU2

## Resumen

Hy-Memory-30B-A3B es un modelo de lenguaje especializado en la escritura de memoria a largo plazo dentro de frameworks de memoria externa, desarrollado por Tencent Hunyuan. Con aproximadamente 3.000 millones de parametros activos sobre una arquitectura Mixture-of-Experts (MoE) de 30.000 millones totales, el modelo esta disenado para sustituir al LLM de proposito general en la ruta de escritura de sistemas como Mem0, MemOS y Hy-Memory, decidiendo que informacion retener, como representarla con precision y como debe actualizar la nueva evidencia el banco de memoria persistente.

La relevancia del modelo radica en su enfoque de entrenamiento en dos etapas: primero una destilacion on-policy de memoria (OPD) y despues un aprendizaje por refuerzo de memoria atribuida. Este diseno le permite transferirse directamente a frameworks de memoria no vistos durante el entrenamiento, como EverMemOS, y competir con modelos de proposito general mucho mayores. Segun los resultados publicados por el autor, supera a Claude Opus 5, DeepSeek V4.1 Flash y Qwen3.6-35B-A3B en la media macro de cuatro harnesses de memoria.

El modelo se distribuye bajo licencia Apache 2.0, con soporte para ingles y chino, y esta empaquetado para su uso con la libreria transformers. Su tamano de repositorio de 17,9 GB sugiere pesos en precision completa o semi-precision, no cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, variante hy_v3 |
| Parametros totales | 30.000 millones (30B) |
| Parametros activos | aproximadamente 3.000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via transformers; tamano de repo 17,9 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts con 30.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, identificada en los tags como `hy_v3`. Esta configuracion permite un coste de inferencia cercano al de un modelo denso de 3B mientras se preserva la capacidad representacional de un modelo de 30B. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni la longitud de contexto maxima en la informacion proporcionada.

El entrenamiento se estructura en dos etapas. La primera, Memory On-Policy Distillation (OPD), proporciona supervision densa de un modelo profesor sobre cadenas de estado escritas por el propio estudiante. La segunda, Attributed Memory Reinforcement Learning, examina los bancos de memoria resultantes, asigna credito a nivel de fragmento (chunk-level credit) y traslada el banco seleccionado entre ventanas de rollout. Ambas etapas se ejecutan dentro de las mismas configuraciones de harness desplegadas, lo que alinea el entrenamiento con las condiciones reales de inferencia. Esta metodologia permite que el modelo se transfiera a frameworks de memoria no vistos, como EverMemOS, que se mantiene fuera del entrenamiento.

## Capacidades

- Escritura de memoria a largo plazo: decide que informacion retener, como representarla y como actualizar el banco de memoria persistente ante nueva evidencia.
- Integracion con frameworks de memoria externa: compatible con Mem0, MemOS, Hy-Memory (escenarios Chat, Working y Coding) y EverMemOS.
- Razonamiento multi-paso sobre estado persistente: gestiona cadenas de estado y actualizaciones incrementales a lo largo de multiples ventanas.
- Generacion de texto conversacional en ingles y chino.
- Soporte para escenarios de codigo: incluye evaluacion en Code Memory Bench (CMB) con tareas de QA sobre repositorios.
- Capacidad de transferencia a harnesses no vistos durante el entrenamiento.
- No se ha documentado soporte de tool calling, function calling, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Memoria de agentes conversacionales: el modelo actua como escritor de memoria en Mem0 o MemOS, decidiendo que turnos de una conversacion multi-turno deben persistir y como actualizar el perfil del usuario, lo que reduce la necesidad de un LLM general de mayor coste en esa ruta.
- Asistentes personales con memoria a largo plazo: en el harness Hy-Memory, el modelo alcanza 73,28 en LoCoMo y 89,00 en LongMemEval, adecuado para gestionar historiales de usuario y preferencias persistentes.
- Memoria de repositorios de codigo: con 70,73 en Code Memory Bench dentro de Hy-Memory, puede mantener contexto de proyectos y decisiones tecnicas en asistentes de programacion.
- Sistemas de recomendacion con memoria de viajes y compras: los benchmarks Travel SPS (57,65) y Shopping PS (21,11) en Hy-Memory indican su uso para recordar preferencias y restricciones del usuario en dominios transaccionales.
- Despliegue en frameworks de memoria de terceros: al transferirse a EverMemOS (56,89 de media sin entrenamiento especifico), puede integrarse en infraestructuras de memoria ya existentes sin reentrenamiento.
- Sustitucion de LLM general en la ruta de escritura: permite reducir coste y latencia al emplear un modelo de 3B activos en lugar de un modelo de proposito general mayor, manteniendo o superando la calidad de memoria (54,02 frente a 53,43 de Claude Opus 5 en Mem0).
- Escenarios multilingues ingles-chino: adecuado para bases de usuarios en ambos idiomas en sistemas de memoria conversacional.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre submuestras fijas del 20% de cada benchmark. La puntuacion de cada harness es la media equitativa de seis metricas: LoCoMo Judge, LongMemEval (LME), PersonaMem-v2 (PM-v2), Travel SPS, Shopping PS y Code Memory Bench (CMB).

| Memory writer | Mem0 | Hy-Mem. | MemOS | EverMem. | Avg. |
|---|---:|---:|---:|---:|---:|
| Hy-Memory-30B-A3B | 54,02 | 60,55 | 50,51 | 56,89 | 55,49 |
| Claude Opus 5 | 53,43 | 60,53 | 50,50 | 54,04 | 54,62 |
| DeepSeek V4.1 Flash | 49,73 | 60,20 | 49,17 | 55,47 | 53,64 |
| Hy3 | 45,99 | 58,06 | 50,19 | 52,30 | 51,63 |
| Qwen3.6-35B-A3B | 47,51 | 55,87 | 47,36 | 50,75 | 50,37 |
| Hy3-A3B Base | 40,20 | 50,39 | 49,05 | 50,98 | 47,66 |
| Qwen3-30B-A3B | 39,81 | 45,67 | 45,44 | 46,57 | 44,37 |

Detalle en el harness Mem0:

| Writer | LoCoMo | LME | PM-v2 | Travel | Shop. | CMB | Avg. |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hy-Memory-30B-A3B | 59,54 | 73,00 | 51,62 | 54,51 | 18,33 | 67,13 | 54,02 |
| Claude Opus 5 | 69,47 | 66,00 | 53,58 | 42,98 | 17,78 | 70,74 | 53,43 |
| DeepSeek V4.1 Flash | 58,78 | 69,39 | 49,56 | 35,07 | 16,67 | 68,92 | 49,73 |

Detalle en el harness Hy-Memory:

| Writer | LoCoMo | LME | PM-v2 | Travel | Shop. | CMB | Avg. |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hy-Memory-30B-A3B | 73,28 | 89,00 | 51,54 | 57,65 | 21,11 | 70,73 | 60,55 |
| Claude Opus 5 | 74,43 | 89,69 | 48,71 | 51,34 | 23,33 | 75,70 | 60,53 |
| DeepSeek V4.1 Flash | 72,90 | 85,86 | 49,00 | 53,46 | 22,78 | 77,18 | 60,20 |

El autor no publica en la informacion disponible los resultados detallados de los harnesses MemOS y EverMemOS (tablas 4 y 5 truncadas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 30B parametros totales y pesos en safetensors (repo de 17,9 GB), la inferencia en precision completa requiere aproximadamente 60 GB de VRAM; en cuantizacion de 8 bits, unos 30 GB; en 4 bits, unos 15-17 GB. Estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, un modelo de 30B en FP16 requiere GPUs de 80 GB (A100, H100) o multiples GPUs. El nombre del repositorio (NPU2) sugiere optimizacion para aceleradores NPU, aunque no se detalla en la informacion disponible.
- Cabe en GPU de consumo: en cuantizacion de 4 bits podria caber en RTX 4090 (24 GB) o RTX 3090 (24 GB); en 8 bits requeriria 32 GB o mas, fuera del alcance de GPUs de consumo habituales.
- Opciones de despliegue: la model card indica compatibilidad con transformers y con endpoints (`endpoints_compatible`). No se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Avg. memoria (4 harnesses) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-Memory-30B-A3B | 30B totales / 3B activos | no disponible | 55,49 | Apache 2.0 | Hugging Face |
| Claude Opus 5 | no disponible | no disponible | 54,62 | propietaria | API |
| DeepSeek V4.1 Flash | no disponible | no disponible | 53,64 | no disponible | API |
| Qwen3.6-35B-A3B | 35B totales / MoE | no disponible | 50,37 | no disponible | no disponible |
| Qwen3-30B-A3B | 30B totales / 3B activos | no disponible | 44,37 | no disponible | no disponible |

Hy-Memory-30B-A3B lidera la comparativa en la media macro y en tres de los cuatro harnesses, con una ventaja de 0,87 puntos sobre Claude Opus 5 y 1,85 sobre DeepSeek V4.1 Flash. Frente a modelos MoE de tamano similar como Qwen3-30B-A3B, la ventaja es de 11,12 puntos, atribuible a su especializacion en la ruta de escritura de memoria.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta disenado exclusivamente como escritor de memoria; no se ha evaluado como LLM de proposito general y probablemente rinda por debajo en tareas generales de generacion, razonamiento o codigo fuera del contexto de memoria.
- Idiomas limitados: solo se declaran ingles y chino; no hay soporte documentado para castellano ni otros idiomas.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que dificulta planificar su uso con historiales muy largos.
- Riesgo de alucinacion en la escritura de memoria: al decidir que retener, puede persistir informacion incorrecta o descartar evidencia relevante; los resultados en Shopping PS son bajos (18,33 en Mem0, 21,11 en Hy-Memory) frente a otras metricas.
- Evaluacion sobre submuestras del 20%: los benchmarks publicados no cubren el conjunto completo, lo que introduce incertidumbre en las comparaciones.
- Resultados no publicados: faltan las tablas detalladas de MemOS y EverMemOS, por lo que la comparativa en esos harnesses solo puede valorarse por la media.
- Dependencia del harness: el rendimiento depende de la configuracion del framework de memoria (prompts, retrieval, modelo de respuesta y juez); los resultados no son directamente extrapolables a otros entornos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los frameworks de memoria de terceros con los que se integre.
- Nombre de repositorio con sufijo NPU2: sugiere una variante optimizada para NPU; no se detalla si los pesos son identicos a la version original ni que hardware especifico requiere.

## Enlaces

- Hugging Face: https://huggingface.co/FastFlowLM/Hy-Memory-30B-A3B-NPU2
- Modelo original en Hugging Face: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-Memory
- Informe tecnico (arXiv): https://arxiv.org/pdf/2610.22196
