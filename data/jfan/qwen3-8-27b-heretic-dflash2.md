# jfan/Qwen3.8-27B-heretic-dflash2

## Resumen

Qwen3.8-27B-heretic-dflash2 es un modelo drafter (borrador) de segunda generación diseñado para decodificación especulativa DFlash 2, desarrollado por jfan sobre la arquitectura de z-lab/Qwen3.8-27B-DFlash2. Su función es acelerar la generación de texto de los modelos Qwen 3.8 27B Heretic, incluyendo variantes cuantizadas para Apple Silicon como MXFP4, mediante el borrado no autorregresivo de bloques de tokens que el modelo objetivo verifica posteriormente.

Con aproximadamente 1,92 mil millones de parámetros, este drafter emplea convoluciones causales dinámicas agrupadas (GroupedDynamicCausalConv), representaciones ocultas multi-capa de 25.600 dimensiones y un sistema de puntuación de rutas candidatas. Los benchmarks publicados muestran una velocidad de generación de entre 11,88 y 13,59 tokens por segundo en Apple Silicon con MLX, con una tasa de aceptación del primer token del 75,9%.

El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors y MLX. Es relevante para desarrolladores que buscan acelerar la inferencia de modelos Qwen 3.8 27B en hardware Apple Silicon sin sacrificar fidelidad en la salida, ya que la decodificación especulativa no altera la distribución final de tokens del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 (decodificación especulativa no autorregresiva) con GroupedDynamicCausalConv, Candidate Selector Path Scoring y fusión multi-capa |
| Parametros totales | 1.924.404.480 (aproximadamente 1,92 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible para el drafter; el modelo objetivo soporta MXFP4 en MLX |
| Idiomas soportados | Inglés (en), chino (zh), código (code) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

Qwen3.8-27B-heretic-dflash2 implementa la arquitectura DFlash 2 de decodificación especulativa, diseñada para generar bloques de tokens candidatos de forma no autorregresiva que el modelo objetivo verifica en paralelo. Sus componentes principales son: convoluciones causales dinámicas agrupadas (GroupedDynamicCausalConv) que capturan estructuras de frases locales antes y después del mezclado de atención; fusión de representaciones ocultas de las capas 5, 19, 33, 47 y 61 del modelo Qwen 3.8 27B, que concatenadas suman 25.600 dimensiones; y un sistema de puntuación de rutas candidatas con dos codebooks (predecesor y sucesor) que predicen la probabilidad de cada rama del grafo de tokens. El bloque de borrado optimizado genera 7 tokens paralelos por bloque (N=8).

El entrenamiento se realiza mediante un pipeline de escalado continuo multi-ronda. En la Ronda 1, el modelo se entrenó con 3.000 secuencias y 3.000 pasos, alcanzando una pérdida de validación de 2,6288, una precisión del primer token del 75,9% y una precisión de bloque completo de 7 tokens del 33,7%. Las rondas 2 a 4 (12.000 secuencias) están en curso y las rondas 5 a 17 (51.000 secuencias) están planificadas. No se especifican los detalles del dataset de entrenamiento ni si se utilizaron técnicas como RLHF o DPO.

## Capacidades

- Decodificación especulativa DFlash 2 para acelerar la generación de texto de modelos Qwen 3.8 27B Heretic.
- Borrado no autorregresivo de bloques de 7 tokens con verificación paralela por el modelo objetivo.
- Fidelidad exacta de salida respecto al modelo objetivo (no altera la distribución de tokens final).
- Compatibilidad con MLX-VLM en Apple Silicon, incluyendo modelos objetivo cuantizados en MXFP4.
- Soporte de generación de código, razonamiento matemático y texto técnico en inglés y chino.
- Integración con el servidor mlx_vlm mediante los parámetros --draft-model y --draft-kind dflash.
- API compatible con OpenAI (/v1/chat/completions) para despliegue en producción.

## Casos de uso

- Aceleración de inferencia en Apple Silicon: el drafter permite generar texto a 13-13,6 tokens por segundo con un modelo de 27B en memoria unificada, reduciendo la latencia percibida en aplicaciones interactivas.
- Generación de código asíncrono en Python: el modelo muestra una tasa de aceptación del 108,8% en escenarios de scraping web concurrente con reintentos y backoff, adecuado para asistentes de programación.
- Razonamiento matemático y demostraciones: con una aceptación del 106,1% en derivaciones de secuencias recursivas, es útil para herramientas educativas y de resolución de problemas.
- Arquitectura de sistemas distribuidos: genera descripciones técnicas de sistemas como almacenes clave-valor con compactación LSM y consenso Raft, útil para documentación técnica automatizada.
- Despliegue de asistentes conversacionales en Mac: mediante mlx_vlm.server, se puede servir un endpoint OpenAI-compatible que utiliza automáticamente la decodificación especulativa sin cambios en el cliente.
- Optimización de costes de inferencia: al reducir el número de pasos autorregresivos del modelo objetivo, disminuye el consumo energético y el tiempo de cómputo en hardware Apple Silicon.

## Benchmarks y rendimiento

Los benchmarks publicados en la model card se evaluaron con mlx-vlm sirviendo el modelo objetivo Qwen3.8-27B-heretic-ara-mxfp4 en Apple Silicon (MLX), con temperatura T=0,7 y max_tokens=384:

| Tarea / Dominio | Aceptación especulativa (k) | Tasa de aceptación (%) | Velocidad de decodificación | Tiempo de generación |
| :--- | :--- | :--- | :--- | :--- |
| Código Python asíncrono | 2,66 tok/paso | 108,8 | 13,49 tok/s | 28,46 s |
| Matemáticas y razonamiento | 3,34 tok/paso | 106,1 | 13,59 tok/s | 28,26 s |
| Sistemas distribuidos | 2,32 tok/paso | 107,9 | 11,88 tok/s | 32,31 s |

Precisión del primer token: 75,9% en secuencias de validación. Precisión de bloque completo (k=7): 33,7%.

Comparación con el drafter base z-lab/Qwen3.8-27B-DFlash2:

| Benchmark | Base DFlash2 | Heretic DFlash2 (Ronda 1) |
| :--- | :--- | :--- |
| Python Async Scraper | 13,46 tok/s (k=2,92) | 13,49 tok/s (k=2,66) |
| Math Recursive Proof | 14,51 tok/s (k=3,58) | 13,59 tok/s (k=3,34) |
| Distributed Architecture | 12,78 tok/s (k=2,87) | 11,88 tok/s (k=2,32) |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Apple Silicon (serie M) con memoria unificada; los benchmarks se ejecutaron en un sistema identificado como ml-2.
- VRAM estimada: no disponible; el drafter tiene 1,92 B de parámetros y el repo ocupa 19,2 GB, por lo que requiere memoria unificada suficiente para alojar tanto el drafter como el modelo objetivo de 27B.
- GPU recomendadas: no aplica (diseñado específicamente para Apple Silicon con MLX, no para GPUs NVIDIA o AMD).
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) dado que el ecosistema MLX está orientado a Apple Silicon.
- Opciones de despliegue: mlx_vlm.server con los parámetros --draft-model y --draft-kind dflash; también compatible con el framework DFlash de z-lab en GitHub.
- Latencia y throughput: 11,88-13,59 tokens por segundo en el hardware de referencia, con tiempos de generación de 28-32 segundos para 384 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Velocidad (tok/s) | Licencia | Disponibilidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| jfan/Qwen3.8-27B-heretic-dflash2 | 1,92 B | DFlash 2 | 11,88-13,59 | Apache 2.0 | HuggingFace |
| z-lab/Qwen3.8-27B-DFlash2 | No disponible | DFlash 2 | 12,78-14,51 | No disponible | HuggingFace |
| DFlash (z-lab, versión original) | No disponible | DFlash | No disponible | No disponible | GitHub |

El modelo heretic-dflash2 es una especialización del DFlash2 base para las distribuciones de tokens de los modelos Qwen3.8-27B Heretic. En la Ronda 1, muestra una velocidad ligeramente inferior al base en dos de los tres benchmarks, pero una mayor tasa de aceptación del primer token (75,9% frente a ~60,0% del base). El proyecto está en escalado continuo, por lo que las rondas posteriores podrían mejorar estas métricas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un modelo objetivo Qwen3.8-27B Heretic (por ejemplo, heretic-org/Qwen3.8-27B-heretic-ara) para funcionar; no puede generar texto por sí solo.
- Dependencia de hardware: está diseñado exclusivamente para Apple Silicon con MLX; no es compatible con GPUs NVIDIA o AMD sin adaptaciones.
- Estado de entrenamiento: el modelo está en la Ronda 1 de un pipeline de 17 rondas; las métricas de rendimiento pueden mejorar o cambiar en versiones futuras.
- Rendimiento variable: en los benchmarks publicados, el drafter heretic muestra una velocidad ligeramente inferior al base DFlash
