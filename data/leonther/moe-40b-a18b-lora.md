# Leonther/moe-40b-a18b-lora

## Resumen

`moe-40b-a18b-lora` es un conjunto de adaptadores LoRA junto con los pesos del router entrenados para un modelo de mezcla de expertos (MoE) experimental de 39,98B de parámetros totales y 17,96B activos. Lo publica el usuario Leonther en HuggingFace y no incluye los pesos del modelo base: el repositorio solo contiene las partes entrenadas (adaptadores y router), mientras que el *student* completo se reconstruye de forma determinista a partir del modelo público `Qwen/Qwen3.6-35B-A3B` mediante el código incluido (`arch_builder.py`). Existe además un checkpoint listo para ejecutar en `Leonther/moe-40b-a18b-q4`.

El proyecto parte de la base fusionada de Qwen3.6-35B-A3B (256 expertos fusionados, top-8) y la "reconstruye" separando los tensores de expertos en módulos individuales y expandiéndolos de 256 a 288 expertos, con un router ampliado. El entrenamiento se hizo con QLoRA en NF4 (rank 2, alpha 4) sobre proyecciones de expertos y atención, más los pesos del router en fp32 sin cuantizar. La ventana de contexto, los idiomas soportados y la licencia no están indicados en la información disponible.

Se trata de un experimento de un solo día, compartido "para referencia", tal y como declara el propio autor. Su relevancia es acotada: sirve como caso de estudio reproducible de *upcycling* MoE (frankenstein-upcycling) y de cómo hacer entrenable un bloque de expertos fusionado que bitsandbytes no puede cuantizar directamente. El mejor checkpoint es la iteración 2 (top-16, perplejidad de evaluación 162,8).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer híbrido (atención lineal + atención completa), derivado de Qwen3.6-35B-A3B |
| Parámetros totales | 39,98B |
| Parámetros activos | 17,96B en el objetivo completo (top-112); ~5B con top-16 (configuración efectivamente entrenada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NF4 (QLoRA) para entrenamiento; Q4 para inferencia (~21 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`) y `router.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo se construye a partir de `Qwen/Qwen3.6-35B-A3B`, que usa expertos fusionados (256 expertos, top-8). El script `arch_builder.py` realiza una separación por streaming de los tensores de expertos fusionados en módulos por experto, aplica un crecimiento de expertos (256 → 288) y un crecimiento del router, de modo que la base fusionada pase a ser entrenable (bitsandbytes no puede cuantizar a 4 bits parámetros de expertos fusionados en 3D). El *student* resultante tiene 40 capas, dimensión oculta 2048 e intermedia de experto 512.

El entrenamiento emplea QLoRA con base NF4: adaptadores LoRA de rank 2 y alpha 4 sobre las proyecciones de expertos y de atención, además de los pesos del router en fp32 crudo (nunca cuantizado). Los datos de SFT son "GLM-5.3-Flash gold" más imitación sintética de qwen38, recogidos en `Leonther/moe-40b-a18b-dataset`. El conjunto es de solo unos cientos de ejemplos, lo que provoca sobreajuste al alargar el entrenamiento. La rampa de top-k va de 8 a 16 expertos entrenados, y el entrenamiento más allá de top-16 produce OOM en una tarjeta de 32 GB a este tamaño de modelo. Como trabajo futuro se plantea un *slim rebuild* (256 expertos, sin crecimiento) para desbloquear top-32 y ampliar sustancialmente los datos de SFT.

## Capacidades

- Generación de texto condicionada por los adaptadores LoRA y el router entrenados sobre la base Qwen3.6-35B-A3B.
- La capacidad efectiva es la del modelo base subyacente, modulada por el ajuste fino; el autor no detalla capacidades específicas.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no indicados).
- Modo *thinking*, visión o audio: no disponible en la información proporcionada.
- Capacidad destacable: los pesos del router entrenados permiten variar top-k (8 o 16) y con ello el número de expertos activos por token.

## Casos de uso

- Investigación en *upcycling* de MoE: reproducir la transformación de una base fusionada a expertos por módulo y estudiar cómo afecta el crecimiento de 256 a 288 expertos al comportamiento del router.
- Estudio de QLoRA sobre parámetros de router en fp32: el repositorio separa explícitamente el router (fp32) del resto cuantizado, lo que permite analizar el efecto de mantener el router sin cuantizar.
- Experimentación con top-k variable: cargar el modelo con top_k=8 (iter_1) o top_k=16 (iter_2) y medir el equilibrio entre coste de cómputo y perplejidad de evaluación.
- Reproducción de pipelines de cuantización NF4: los scripts `quantize_student.py` y `arch_builder.py` sirven como referencia para pre-cuantizar un *student* MoE y lograr cargas rápidas.
- Análisis de sobreajuste en SFT de pocos ejemplos: las iteraciones 2 y 5 muestran una divergencia entre pérdida de entrenamiento (que baja) y perplejidad de evaluación (que sube), útil como caso didáctico.
- Base para experimentos posteriores sobre un *slim rebuild* de 256 expertos (trabajo futuro declarado) que permita entrenar con top-32.
- Punto de partida para evaluar el modelo Q4 pre-cuantizado de `Leonther/moe-40b-a18b-q4` en tareas de generación sin necesidad de reconstruir la base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona métricas de entrenamiento (pérdida y perplejidad de evaluación, ppl) por iteración:

| Iteración | Top-k | Pasos | Pérdida | Ppl de evaluación | Nota |
|---|---|---|---|---|---|
| 1 | 8 | 40 | 5,669 | 213,1 | línea base |
| 2 | 16 | 40 | 5,399 | 162,8 | mejor |
| 5 | 16 | 50 | 4,826 | 195,8 | pérdida de entrenamiento baja, ppl sube (sobreajuste) |

## Requisitos de hardware

- Inferencia: el checkpoint Q4 ocupa aproximadamente 21 GB, según la model card.
- Entrenamiento: el entrenamiento más allá de top-16 provoca OOM en una tarjeta de 32 GB; con top-16 el ajuste cabe en ese mismo entorno (32 GB).
- GPU consumer: una GPU con 24 GB (por ejemplo, RTX 3090 o RTX 4090) puede alojar la inferencia Q4 de ~21 GB, aunque con poco margen para caché KV y contexto largo.
- Opciones de despliegue: el repositorio incluye un cargador propio (`student_moe.py`, con `load_student_model`, `attach_lora` y `load_adapter_bundle`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, por lo que su compatibilidad con estos servidores queda como no disponible.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio de adaptadores ocupa 2,5 GB; requiere además descargar la base pública y generar el *student* o el checkpoint Q4.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Expertos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| moe-40b-a18b-lora (este) | 39,98B | 17,96B (top-112); ~5B con top-16 | 288, top-k 8→16 | no disponible | no disponible | Adaptadores + router; base reconstruible |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | 3B (A3B) | 256 fusionados, top-8 | no disponible | no disponible | Público |

No se dispone de datos de benchmarks ni de licencia de otros modelos comparables en la información proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- Es un experimento de un solo día, compartido "para referencia": el propio autor advierte de "rough edges" (asperezas) y no garantiza estabilidad.
- El modelo base de este repositorio no incluye los pesos del *student*: hay que reconstruirlos con el código o usar `Leonther/moe-40b-a18b-q4`.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; los datos de SFT son escasos (unos cientos de ejemplos) y el autor señala sobreajuste en la iteración 5.
- Limitaciones de contexto e idioma: no disponible.
- Restricciones de licencia para uso comercial: la licencia no está indicada, por lo que no puede asumirse uso comercial.
- Parámetros activos: con top-16 (la configuración entrenada) solo se activan ~5B parámetros, muy por debajo del objetivo de 17,96B del top-112 completo.
- El entrenamiento por encima de top-16 produce OOM en 32 GB, lo que limita reproducir el objetivo completo.
- Advertencia de fecha: el repositorio figura creado el 2026-09-18, dato a verificar por parte del lector.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Leonther/moe-40b-a18b-lora
- Checkpoint Q4 listo para ejecutar: https://huggingface.co/Leonther/moe-40b-a18b-q4
- Dataset de SFT: https://huggingface.co/Leonther/moe-40b-a18b-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- La búsqueda web no devolvió resultados relevantes sobre este modelo (los enlaces obtenidos correspondían a servicios de asesoramiento crediticio, sin relación con el modelo).
