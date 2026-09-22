# abhishek085/spark-s1-4b-v6-nvfp4

## Resumen

`spark-s1-4b-v6-nvfp4` es una cuantización post-entrenamiento (PTQ) en formato NVFP4 del modelo `abhishek085/spark-s1-4b-v6`, desarrollado por el usuario abhishek085 dentro del proyecto Open Spark Jev. No es un modelo de propósito general: está diseñado como modelo de decisión («system-one») cuyo pipeline es `text-classification`, y su salida se lee como logits sobre letras de opción (por ejemplo, A/B/C/D) en lugar de como texto libre. Se apoya en el backbone híbrido de Qwen/Qwen3.5-4B, sobre el que el autor ha entrenado las cabezas y el comportamiento de decisión estilo Jev.

El checkpoint contiene 3.073.289.216 parámetros (dato real de los safetensors, aproximadamente 3,07 B pese a la nomenclatura «4b» del modelo base) y el repositorio ocupa 5,2 GB. La particularidad de esta variante es que la cuantización NVFP4 se aplica únicamente a los pesos MLP (`gate_proj`, `up_proj`, `down_proj`), mientras que todos los módulos de atención (8 capas de atención completa y 24 capas de atención lineal, con sus convoluciones 1D, *gating* y proyecciones) y el `lm_head` permanecen en bf16, porque la lectura de logits por letra de opción necesita precisión completa.

Su relevancia práctica es la relación velocidad/precisión: según las mediciones del autor en una NVIDIA DGX Spark (GB10) con lote de tamaño 1 servido con vLLM, pasa de 74,9 ms a 53,3 ms de latencia p50 (1,40x más rápido, 13,3 a 18,6 decisiones/s) con una variación de precisión de +0,1 puntos en JevBench Intelligence (83,1 a 83,2). Es un lanzamiento muy temprano (0 descargas, 0 likes, creado y actualizado el mismo día) y el propio autor advierte de que cambiará con rapidez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 8 capas de atención completa + 24 capas de atención lineal (32 capas en total), backbone Qwen3.5; derivado del modelo base Qwen/Qwen3.5-4B |
| Parametros totales | 3.073.289.216 (dato real de safetensors); el repositorio ocupa 5,2 GB |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el autor recomienda configurar `--max-model-len` en al menos 4k-8k tokens y usa 8192 en el ejemplo de despliegue |
| Tipos de cuantizacion | NVFP4 en pesos MLP (`gate_proj`, `up_proj`, `down_proj`); bf16 en atención completa, atención lineal (conv1d, gating, proyecciones) y `lm_head`; PTQ con nvidia-modelopt (0.46+) |
| Idiomas soportados | Inglés únicamente (limitación declarada por el autor); el campo de idiomas del repositorio no está disponible |
| Licencia | Apache-2.0 (modelo base Qwen/Qwen3.5-4B también Apache-2.0) |
| Formato de pesos | safetensors (etiqueta del repositorio); artefactos generados con nvidia-modelopt (`modelopt` entre las etiquetas) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 32 capas que combina 8 capas de atención completa con 24 capas de atención lineal, según la descripción del propio autor del proceso de cuantización. Esa mezcla implica que una parte relativamente grande del cómputo total recae en rutas que en esta variante permanecen sin cuantizar (atención, convoluciones 1D, *gating* y proyecciones), lo que explica que el ahorro de latencia sea menor que el de la variante equivalente sobre un backbone uniforme. El modelo es denso, no MoE, y el pipeline declarado es de clasificación de texto con lectura de logits sobre letras de opción.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se indica que el proceso de cuantización se calibró con los mismos 980 *prompts* de decisión reales empleados en `spark-s1-4b-v5-nvfp4` (reutilizables porque v6 se entrenó con datos idénticos), y se mencionan dos detalles relevantes para reproducirlo: el script `scripts/quant/ptq_nvfp4.py` y la configuración `NVFP4_MLP_ONLY_CFG`. La innovación técnica destacable es precisamente el reparto selectivo de precisión: cuantizar solo el MLP y preservar en bf16 las rutas que alimentan la lectura de decisión, lo que permite ganar velocidad sin coste medible de precisión en JevBench.

## Capacidades

- Decisión estilo Jev: el modelo no genera texto libre, sino que produce logits sobre letras de opción, propio de un modelo de decisión «system-one».
- Clasificación de texto dentro del alcance Jev (documentos, estados de decisión, trazas de herramientas).
- Manejo de estados de decisión largos: el autor indica que algunos superan los 2k tokens y recomienda ventanas de 4k-8k.
- Inferencia servida vía vLLM con API compatible con OpenAI, integrable en modo backend OpenAI a través del *gateway* del proyecto Open Spark Jev.
- Ejecución en GPUs Blackwell aprovechando la ruta de *tensor cores* NVFP4.
- No se documentan en la información disponible capacidades de *tool calling* nativo, agentes multi-paso, visión, audio ni modo de razonamiento explícito («thinking mode») más allá del uso de trazas de herramientas como entrada de decisión.
- Capacidad multilingüe: no; el modelo está limitado a inglés según las limitaciones declaradas.

## Casos de uso

- Enrutado de peticiones en producción: dado un *prompt* o una consulta, el modelo devuelve una decisión sobre letras de opción que puede mapearse a un backend, una herramienta o un modelo concreto; su latencia p50 de 53,3 ms y 18,6 decisiones/s en GB10 lo hacen viable como capa de enrutado en línea.
- Filtrado y triaje de documentos: clasificar documentos largos en categorías mutuamente excluyentes aprovechando que los estados de decisión pueden superar los 2k tokens y que se recomienda una ventana de 4k-8k.
- Selección de herramientas en agentes: usar trazas de herramientas (historial de llamadas) como entrada y obtener como salida la siguiente acción entre un conjunto cerrado de opciones.
- Moderación de contenido con taxonomías discretas: la salida por letra de opción encaja con políticas de categorías fijas, y la cuantización MLP-only mantiene la precisión del `lm_head` intacta.
- Evaluación automática tipo LLM-as-judge con escalas cerradas: comparar respuestas asignando una opción predefinida, con un coste por decisión bajo gracias al rendimiento medido en vLLM.
- Control de calidad en pipelines de CI/CD: insertar el modelo como puerta de decisión (aprobar/rechazar) sobre artefactos o diffs, sirviéndolo con vLLM y consumiéndolo desde el gateway en modo OpenAI.
- Experimentación e investigación en modelos de decisión: al ser un checkpoint abierto Apache-2.0 y con la receta de cuantización publicada, sirve para reproducir el efecto de NVFP4 MLP-only sobre un backbone híbrido frente a un backbone uniforme.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks generalistas en la información disponible. Los únicos datos son de JevBench v1.2 (solo los 231 ítems públicos de 534) y de latencia/rendimiento, medidos por el autor en una NVIDIA DGX Spark (GB10), lote de tamaño 1, servido con vLLM.

| Modelo | p50 (ms) | decisiones/s | JevBench Intelligence |
|---|---:|---:|---:|
| `spark-s1-4b-v6` (bf16) | 74,9 | 13,3 | 83,1 |
| `spark-s1-4b-v6-nvfp4` | 53,3 | 18,6 | 83,2 |

| Modelo | easy (48) | standard (72) | hard (111) |
|---|---:|---:|---:|
| `spark-s1-4b-v6-nvfp4` | 1,000 | 0,972 | 0,622 |
| `spark-s1-4b-v6` (bf16) | 1,000 | 1,000 | 0,595 |

Advertencias del autor sobre estas cifras: es la única comprobación de precisión realizada sobre esta variante; no se han medido de forma independiente los *splits* propios ni la batería externa de 5 conjuntos, que se heredan de `spark-s1-4b-v6` como *prior* razonable. La bajada en el tramo *standard* (1,000 a 0,972) queda compensada por la subida en el tramo *hard* (0,595 a 0,622), que el autor sitúa dentro del ruido para 111 ítems. Como referencia de contexto, la receta equivalente en `spark-s1-4b-v5-nvfp4` costaba aproximadamente 1,9 puntos de Intelligence sobre un backbone uniforme Qwen3-4B, con un 1,66x de aceleración.

## Requisitos de hardware

- GPU necesaria: el autor indica que se requiere una GPU de clase GB10/B200 (Blackwell) para disponer de la ruta de *tensor cores* NVFP4.
- Medición de referencia: NVIDIA DGX Spark (GB10), lote 1, vLLM; 53,3 ms p50 y 18,6 decisiones/s.
- VRAM estimada: no disponible de forma oficial. Como estimación derivada de la composición declarada (3,07 B de parámetros, MLP en NVFP4 y atención más `lm_head` en bf16), los pesos deberían ocupar del orden de 3-3,5 GB, a lo que hay que sumar caché KV y estado de decodificación para ventanas de 4k-8k tokens; el repositorio en disco ocupa 5,2 GB.
- Viabilidad en GPU de consumo: no disponible; no se documenta ningún despliegue en RTX 4090 u otras GPU sin *tensor cores* NVFP4, y el requisito declarado apunta a Blackwell de centro de datos.
- Opciones de despliegue: vLLM mediante la imagen `vllm/vllm-openai:nightly-aarch64`, con `--max-model-len 8192` y `--trust-remote-code`; *gateway* propio del proyecto (`python -m open_spark_jev.serve.gateway --backend openai`) para exponerlo en modo OpenAI.
- Otras opciones (llama.cpp, Ollama, TGI, TensorRT-LLM): no disponibles en la información proporcionada. El autor advierte además que la versión de nvidia-modelopt incluida en el contenedor de TensorRT-LLM es anterior al soporte de Qwen3.5.
- Latencia y throughput: p50 de 53,3 ms y 18,6 decisiones/s en GB10 con lote 1; la variante bf16 equivalente da 74,9 ms y 13,3 decisiones/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench Intelligence | p50 en GB10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `spark-s1-4b-v6-nvfp4` | 3,07 B | No disponible (recomendado 4k-8k) | 83,2 | 53,3 ms | Apache-2.0 | Pública en HuggingFace |
| `spark-s1-4b-v6` (bf16) | No disponible | No disponible | 83,1 | 74,9 ms | Apache-2.0 | Pública en HuggingFace |
| `spark-s1-4b-v5-nvfp4` | No disponible | No disponible | No disponible (su receta costaba ~1,9 puntos frente a la base) | No disponible (aceleración declarada de 1,66x) | Apache-2.0 | Pública en HuggingFace |
| `spark-s1-4b-v5` (bf16) | No disponible | No disponible | No disponible | 61,6 ms | Apache-2.0 | Pública en HuggingFace |

La comparación con alternativas externas (por ejemplo, modelos de clasificación o de decisión de tamaño similar de otros autores) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Alcance restringido al estilo Jev: el modelo solo está pensado para decisiones con formato de opciones; no debe esperarse generación de texto libre ni uso como asistente general.
- Entrenamiento sin RLCD, según las limitaciones heredadas de `spark-s1-4b-v6`.
- Sensibilidad al orden de las opciones: el resultado puede variar según cómo se presenten las alternativas.
- Solo inglés; no hay soporte multilingüe declarado.
- Riesgo de alucinación y de calibración deficiente: las temperaturas de calibración de `calibration.json` se heredan del checkpoint bf16 y no se han reajustado sobre las salidas cuantizadas.
- Validación incompleta: solo se ha comprobado con JevBench (231 de 534 ítems públicos); los *splits* propios y la batería externa de 5 conjuntos no se han vuelto a medir sobre los pesos cuantizados, solo se asumen como *prior*.
- Dependencia de hardware: la ruta NVFP4 exige GPU Blackwell (GB10/B200); en hardware sin *tensor cores* NVFP4 el rendimiento o la compatibilidad no están documentados.
- Lanzamiento muy temprano: 0 descargas, 0 likes, creado y actualizado el 22 de septiembre de 2026, y el autor avisa de que el modelo cambiará rápidamente.
- Licencia Apache-2.0, sin restricciones adicionales conocidas para uso comercial, aunque conviene verificar las condiciones derivadas del modelo base Qwen/Qwen3.5-4B.
- Para producción, la ventana de contexto debe dimensionarse explícitamente (`--max-model-len` de al menos 4k-8k) porque algunos estados de decisión superan los 2k tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhishek085/spark-s1-4b-v6-nvfp4
- Modelo base (checkpoint bf16 del que deriva): https://huggingface.co/abhishek085/spark-s1-4b-v6
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del proyecto Open Spark Jev: https://github.com/abhishek085/open-spark-jev
- JevBench: https://github.com/fstandhartinger/jevbench
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo (los resultados devueltos corresponden a páginas de soporte de Google sin relación con el modelo).
