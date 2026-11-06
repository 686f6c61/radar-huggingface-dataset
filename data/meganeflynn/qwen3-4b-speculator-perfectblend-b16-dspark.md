# MeganEFlynn/Qwen3-4B-speculator-perfectblend-b16.dspark

## Resumen

Qwen3-4B-speculator-perfectblend-b16.dspark es un modelo borrador (*draft model*) de decodificación especulativa desarrollado por MeganEFlynn para acelerar la inferencia de Qwen/Qwen3-4B. No es un modelo de lenguaje autónomo, sino un componente auxiliar que propone hasta 16 tokens por iteración de decodificación, que luego son verificados en paralelo por el modelo principal. Se enmarca en la técnica DSpark, implementada en la librería `speculators` del proyecto vLLM.

El checkpoint es experimental y forma parte de una serie de ablación de datos: se entrenó sobre una mezcla de 8 subconjuntos («perfect blend») del dataset Qwen3-8B-Regenerated-Collection, excluyendo tulu3, magpie, nemotron_chat, nemotron_math y nemotron_stem. Con 615 millones de parámetros y precisión bfloat16, ocupa 1,23 GB en disco y está pensado para desplegarse junto a vLLM 0.31.0 o superior con soporte DSpark.

Su relevancia radica en que la decodificación especulativa reduce la latencia de generación sin alterar la distribución de salida del modelo verificador, siempre que el borrador tenga una tasa de aceptación alta. Este checkpoint alcanza una longitud de aceptación ponderada de 4,610 en modo greedy y 4,487 con el muestreo por defecto de Qwen3-4B, lo que se traduce en un speedup moderado pero medible frente a la decodificación autoregresiva estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark draft model (transformer borrador con cabecera Markov y cabecera de confianza) |
| Parametros totales | 615.221.249 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 8.192 tokens con multipacking) |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, librería `speculators`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DSpark para decodificación especulativa: un transformer borrador de 5 capas que consume estados ocultos del verificador Qwen3-4B en las capas 1, 9, 17, 25 y 33, e incorpora una cabecera Markov de rango 256 (variante vanilla) y una cabecera de confianza activada con características Markov. El vocabulario del borrador es de 151.936 tokens, alineado con el tokenizador de Qwen3-4B. El método de propuesta por defecto es greedy y el bloque especulativo es de 16 tokens.

El entrenamiento se realizó desde el repositorio `speculators` en el commit `1c800f2b053bcd538fc11bf49ec843d4dfa81a95` con vLLM 0.31.0, sobre 1.382.556 filas preparadas (~4,2 mil millones de tokens, longitud media ~3.056) de una mezcla de 8 archivos: metamathqa (394.996), ultrainteract (288.578), orca_math (200.034), ultrachat (207.863), evol_codealpaca (111.099), autoif (61.491), lmsys_arena (57.361) y ultrafeedback (61.134). Se completaron ~2,7 épocas (252.775 pasos globales) con world size 6, longitud de secuencia 8.192, optimizador Muon (LR 3e-3), learning rate 6e-4, weight decay 0, scheduler coseno con 4% de warmup, semilla 42 y una función de pérdida combinada `0.1 * CE + 0.9 * TV` con ponderación posicional de decaimiento exponencial fijo (gamma 7,0). El coste fue de aproximadamente 2 días y 9 horas en 6 GPUs, más un servidor de render en 2 GPUs adicionales.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa sobre Qwen3-4B (hasta 16 tokens por iteración).
- Aceleración de inferencia en tareas de código (HumanEval: longitud de aceptación 5,831 en greedy).
- Aceleración en razonamiento matemático (7,696 en greedy), favorecida por la presencia de metamathqa y orca_math en la mezcla.
- Aceleración en traducción (5,093), escritura (4,454) y tool calling (4,100).
- Soporte de cabecera de confianza para estimar la fiabilidad de las propuestas.
- No soporta tool calling ni agentes por sí mismo: hereda esas capacidades del verificador Qwen3-4B.
- Capacidades multilingües: no disponibles de forma explícita; dependen del verificador.

## Casos de uso

- Aceleración de servidores de inferencia con vLLM: desplegar Qwen3-4B con `--spec-model` apuntando a este checkpoint y `--spec-tokens 16 --spec-method dspark` para reducir la latencia por token en producción sin modificar las salidas del modelo verificado.
- Generación de código en pipelines de CI/CD: la mezcla incluye evol_codealpaca y el borrador rinde mejor en HumanEval, por lo que es adecuado para asistentes de código con Qwen3-4B donde prime el throughput.
- Razonamiento matemático en entornos educativos o de evaluación: la aceptación de 7,696 en greedy sobre math reasoning lo hace útil para servir Qwen3-4B en cargas con muchas consultas aritméticas.
- Traducción automática de bajo coste: con aceptación de 5,093 en traducción, se puede usar para servir traducciones por lotes con Qwen3-4B reduciendo el coste computacional.
- Tool calling en asistentes con function calling: aceptación de 4,100 permite acelerar agentes que emiten llamadas estructuradas, siempre que el verificador gestione la lógica del agente.
- Investigación en decodificación especulativa: sirve como punto de comparación en estudios de ablación de datos, ya que el autor publica métricas por subconjunto y scripts de entrenamiento.
- Despliegue en GPUs de gama media: al ocupar 1,23 GB en bfloat16, el borrador se puede alojar junto al verificador en GPUs con VRAM limitada, aunque el verificador Qwen3-4B sigue siendo el principal consumidor de memoria.

## Benchmarks y rendimiento

Resultados de aceptación del checkpoint (evaluación `speculator_benchmarks`, 9 subconjuntos, longitud máxima de generación 128, hasta ~200-400 peticiones por categoría):

| Categoria | Temp 0 (greedy) | Muestreo por defecto (temp 0.6 / top_p 0.95 / top_k 20) |
|---|---:|---:|
| HumanEval | 5,831 | 5,691 |
| Math reasoning | 7,696 | 7,323 |
| QA | 3,528 | 3,475 |
| Question | 4,430 | 4,197 |
| RAG | 4,669 | 4,509 |
| Summarization | 3,665 | 3,646 |
| Tool call | 4,100 | 4,061 |
| Translation | 5,093 | 4,737 |
| Writing | 4,454 | 4,331 |
| **Ponderado global** | **4,610** | **4,487** |

Métricas de validación finales (época 2, split de validación de la propia mezcla):

| Métrica | Valor |
|---|---:|
| Loss | 0,3044 |
| Tasa de aceptación | 0,6727 |
| Longitud de aceptación | 7,1007 |
| Full accuracy | 0,6915 |

Comparativa dentro de la serie de ablación de datos (misma receta, mismo presupuesto de cómputo):

| Ejecución | Datos | Pasos | Temp 0 | Muestreo por defecto |
|---|---|---:|---:|---:|
| full-mix b16 | 13 archivos, 1 época | 228.135 | 4,689 | 4,594 |
| **perfectblend b16 (este)** | 8 archivos, ~2,7 épocas | 252.775 | **4,610** | **4,487** |
| tulu3 b16 | solo tulu3, 4 épocas | 259.361 | 4,611 | 4,501 |

El autor advierte que el split de validación es un 10% aleatorio de los propios datos de la mezcla, por lo que no es comparable entre ejecuciones con subconjuntos distintos.

## Requisitos de hardware

- VRAM estimada para el borrador: ~1,23 GB en bfloat16 (tamaño del archivo de pesos); hay que sumar la memoria del verificador Qwen3-4B (~8 GB en bf16) y el overhead de KV cache de vLLM.
- GPU recomendadas: A100, H100 o L40S para producción con lotes grandes; RTX 4090 (24 GB) es suficiente para ejecutar verificador y borrador juntos con cuantización del verificador.
- Cabe en GPU de consumo: sí, siempre que el verificador Qwen3-4B se ajuste a la VRAM disponible; el borrador por sí solo ocupa muy poco.
- Opciones de despliegue: vLLM 0.31.0 con `speculators` 0.10.0a0 (soporte DSpark). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; el speedup depende de la longitud de aceptación (4,487-4,610 ponderada) y del resto de factores del servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Qwen3-4B-speculator-perfectblend-b16 (este) | 615 M | no disponible | Borrador especulativo para Qwen3-4B | Apache 2.0 | Hugging Face |
| Qwen3-4B-speculator full-mix b16 | no disponible | no disponible | Borrador especulativo para Qwen3-4B | Apache 2.0 | Serie de ablación del mismo autor |
| Qwen3-4B-speculator tulu3 b16 | no disponible | no disponible | Borrador especulativo para Qwen3-4B | Apache 2.0 | Serie de ablación del mismo autor |
| Qwen/Qwen3-4B (verificador) | 4 B | no disponible | Modelo de lenguaje completo | Apache 2.0 | Hugging Face |

Los tres borradores de la serie comparten receta y presupuesto de cómputo; el full-mix obtiene la mejor aceptación (4,689 en greedy), mientras que perfectblend y tulu3 empatan dentro del ruido (4,610 vs 4,611). No se dispone de comparación con borradores especulativos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación para decodificación especulativa, no un modelo de lenguaje autónomo: no debe usarse sin el verificador Qwen/Qwen3-4B.
- Hereda los sesgos, limitaciones y consideraciones de licencia del modelo verificador Qwen3-4B.
- La aceptación y el speedup dependen de los prompts, el hardware, el tamaño de lote, la versión de vLLM y la configuración del servidor.
- Las métricas de validación proceden de un split aleatorio de los propios datos de entrenamiento y no son comparables entre ejecuciones con subconjuntos distintos.
- El rendimiento es desigual por categoría: flojo en QA (3,528) y summarization (3,665), fuerte en math reasoning (7,696) y HumanEval (5,831).
- Requiere versiones específicas (vLLM 0.31.0, speculators 0.10.0a0) con soporte DSpark; versiones anteriores no cargarán el checkpoint.
- El tokenizador y el verificador deben ser exactamente Qwen/Qwen3-4B; no es intercambiable con otros modelos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- No se documentan idiomas soportados ni evaluación multilingüe específica.

## Enlaces

- Hugging Face: https://huggingface.co/MeganEFlynn/Qwen3-4B-speculator-perfectblend-b16.dspark
- Modelo verificador: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio speculators: https://github.com/vllm-project/speculators
- Dataset de entrenamiento: https://huggingface.co/datasets/inference-optimization/Qwen3-8B-Regenerated-Collection
- vLLM: https://github.com/vllm-project/vllm
- Artefactos de entrenamiento y evaluación citados en la model card: `train_command.txt`, `val_metrics_history/`, `acceptance_temp0.csv`, `acceptance_defaulttemp.csv` (incluidos en el repositorio de Hugging Face)
