# pb09204048/Qwen3-4B-Code-RL-Specialist

## Resumen

Qwen3-4B-Code-RL-Specialist es un ajuste fino de Qwen/Qwen3-4B publicado por el usuario pb09204048 en Hugging Face. Se trata de un "especialista de dominio" centrado en código, obtenido mediante aprendizaje por refuerzo con objetivos tipo GRPO sobre el conjunto DeepCoder-Preview-Dataset, y posteriormente exportado como pesos completos en BF16 tras fusionar una LoRA de rango 16. El repositorio forma parte de una familia de tres especialistas (matemáticas, código e instrucciones) concebidos como profesores de dominio para experimentos de destilación on-policy multi-profesor (MOPD); en esta entrega no se ha entrenado ni evaluado ningún estudiante MOPD.

El modelo resuelve un problema concreto: mejorar el rendimiento en tareas de programación competitiva y generación de código verificable sobre una base densa de 4,41 mil millones de parámetros, sin aumentar el tamaño del modelo. Frente a la base Qwen3-4B, el especialista eleva el pass@1 en el subconjunto congelado de LCB v5 del 17,56 % al 24,10 %, y en AIME24 del 22,50 % al 25,83 % según la tabla comparativa de la model card.

Es relevante ahora porque documenta de forma inusualmente detallada el proceso de RL (datasets, auditoría de duplicados, número de actualizaciones del optimizador, número de rollouts) y porque se publica bajo licencia Apache-2.0 con pesos safetensors estándar, lo que facilita su uso como profesor en pipelines de destilación o como punto de partida para especializaciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); ajuste mediante LoRA de rango 16 fusionada en pesos completos |
| Parámetros totales | 4.411.424.256 (~4,41 B), dato real de safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el entrenamiento limitó los prompts a 4.096 tokens |
| Tipos de cuantización | No disponible; el repositorio publica únicamente pesos BF16 (no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card no declara idiomas; los datos de entrenamiento son problemas de código, mayoritariamente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16), librería transformers |
| Tamaño del repositorio | 8,8 GB |
| Modelo base | Qwen/Qwen3-4B (relación: finetune) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B y se adapta con una LoRA de rango 16, alpha 32 y dropout 0 aplicada a las proyecciones de atención, las proyecciones del MLP y el `lm_head`. Los deltas de la LoRA se fusionaron en FP32 y se guardaron en BF16; las embeddings de entrada se preservaron y la cabeza de salida adaptada queda sin atar (untied). La exportación se validó comprobando los 506 tensores del adaptador y la coincidencia exacta de logits tras guardar y recargar en BF16 (`model_provenance.json`). No se documenta ningún cambio arquitectónico más allá de este ajuste.

El entrenamiento es RL de dominio independiente con ventajas centradas por grupo al estilo GRPO y objetivo de política recortado tipo PPO: se resta la media de recompensa del grupo de prompt sin normalización por desviación típica, sin crítico y sin penalización KL. La recompensa es binaria (1 solo si pasan todos los tests guardados). Se usaron hasta 32 prompts × 8 respuestas por lote, temperatura 1,0, top-p 1,0, top-k desactivado, modo thinking desactivado y un máximo de 16.384 tokens de respuesta. Optimizador Adam con learning rate 1e-5, 10 actualizaciones de warmup y ratios de recorte [0,8; 1,2]. El especialista de código usa las particiones `primeintellect/train`, `taco/train` y `lcbv5/train` de `agentica-org/DeepCoder-Preview-Dataset`: 17.256 prompts preparados, 11.301 candidatos examinados, 1.733 rechazados y 9.568 finalmente muestreados (299 actualizaciones del optimizador). El checkpoint se detuvo al examinar el 65,49 % de los candidatos preparados, con 9.568 prompts × 8 respuestas = 76.544 rollouts, de los cuales no todos se convierten en ejemplos de gradiente (se excluyen grupos de recompensa constante, ventajas centradas nulas y respuestas truncadas por límite de longitud).

La preparación de datos retiene problemas de Python con entrada/salida estándar y al menos cinco tests, elimina duplicados normalizados y solapamientos con los conjuntos de evaluación, descarta tareas interactivas o con llamadas a función, limita las tareas a 200 tests y 4 MiB de texto de test, y reserva 64 prompts de desarrollo. Durante el entrenamiento, al menos una de hasta tres soluciones de referencia debía pasar los tests guardados para que el candidato se muestrease. La model card indica que se hizo una auditoría de prompts sin coincidencias entre entrenamiento y evaluación, pero advierte que estas comprobaciones no establecen descontaminación semántica ni de preentrenamiento.

## Capacidades

- Generación de texto conversacional y de código en formato de pesos estándar de Hugging Face.
- Resolución de problemas de programación competitiva con verificación por tests de entrada/salida estándar (formato adoptado en el entrenamiento).
- Razonamiento matemático básico, con 25,83 % de pass@1 en AIME24 (30 prompts, 4 muestras).
- Seguimiento de instrucciones con corrección literal de puntuación: 81,70 % de prompt strict accuracy en IFEval (541 prompts).
- Generación de código en modo no-thinking: el entrenamiento desactivó explícitamente el modo thinking de Qwen3.
- Capacidad de actuar como profesor de dominio en experimentos de destilación on-policy multi-profesor (MOPD), junto con los otros dos especialistas de la familia.
- No se documenta soporte de tool calling o function calling; de hecho, los tests de ese tipo se rechazaron durante la preparación de datos.
- No se documentan capacidades de visión, audio, agentes multi-paso ni multilingüismo explícito.

## Casos de uso

- Generación de código verificable en pipelines de evaluación automática: el modelo se entrenó con recompensa binaria sobre tests de entrada/salida estándar, por lo que encaja en flujos donde la salida se valida ejecutando una batería de pruebas guardadas.
- Profesor de dominio para destilación MOPD: la model card lo presenta explícitamente como candidato a profesor de código, lo que permite generar trayectorias de alta calidad en esa materia para entrenar un estudiante más pequeño.
- Asistente de programación competitiva: útil para generar soluciones candidatas en problemas de tipo stdin/stdout con múltiples casos de prueba, un formato que domina por construcción.
- Autocompletado y generación de funciones en editores: con 4,41 B de parámetros en BF16 puede servirse en una GPU de 24 GB y ofrecer latencia baja para sugerencias de código en tiempo real.
- Base para especializaciones adicionales: al ser un ajuste fusionado sobre Qwen3-4B con licencia Apache-2.0, se puede continuar el entrenamiento (SFT o RL) para otros lenguajes o dominios sin partir de cero.
- Evaluación comparativa de métodos de RL: el repositorio documenta hiperparámetros, número de rollouts y actualizaciones, lo que lo convierte en un punto de referencia reproducible para estudiar GRPO frente a otras variantes.
- Tareas de instrucciones con formato estricto: su 81,70 % de prompt strict accuracy en IFEval lo hace apto para extracción o transformación de texto donde el formato de salida debe respetarse al pie de la letra.
- Filtrado y curación de datasets de código: puede usarse para descartar soluciones que no pasan tests, un caso de uso alineado con la señal de recompensa con la que se entrenó.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Protocolo | Métrica | Valor |
|---|---|---|---|
| AIME24 | 30 prompts, 4 muestras | Pass@1 (%) | 25,83 |
| LCB v5 (subconjunto de test congelado) | 279 prompts, 4 muestras | Pass@1 (%) | 24,10 |
| IFEval | 541 prompts; corrección literal de puntuación | Prompt strict accuracy (%) | 81,70 |
| IFBench | 300 prompts | Prompt strict accuracy (%) | 25,33 |

La model card incluye además una tabla de evaluación cruzada entre los cuatro modelos de la familia bajo un protocolo congelado común (8.308 respuestas en total). En la información disponible solo se muestra íntegra la fila del modelo base Qwen3-4B: AIME24 pass@1 22,50 y coding pass@1 17,56, mientras que el valor de IFEval prompt strict aparece truncado (comienza por 8). No se han publicado en la información disponible resultados para MMLU, HumanEval, GSM8K ni otros benchmarks adicionales.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 8,8 GB, coincidiendo con el tamaño del repositorio. Con caché KV y activaciones, la VRAM necesaria se estima en 11-14 GB en función de la longitud de contexto y del tamaño de lote.
- Cuantización a 8 bits: se estima en 4,5-5,5 GB de VRAM; a 4 bits, en 2,7-3,5 GB. Estas cuantizaciones no se distribuyen en el repositorio y requerirían conversión propia.
- GPU de consumo: cabe en BF16 en RTX 4090, RTX 3090 y RTX 4080 (24 GB y 16 GB respectivamente); en tarjetas de 8 GB solo con cuantización de 4 bits.
- GPU de centro de datos: A100 (40/80 GB), H100 y L40S son compatibles, aunque sobredimensionadas para 4,41 B de parámetros; resultan útiles para lotes grandes y contextos largos.
- Opciones de despliegue: transformers, vLLM, TGI y SGLang son compatibles con pesos safetensors BF16 (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`). llama.cpp y Ollama requieren una conversión a GGUF que no se publica en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento disponible | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Code-RL-Specialist (este modelo) | 4.411.424.256 | No disponible (prompts de entrenamiento limitados a 4.096 tokens) | AIME24 25,83; LCB v5 24,10; IFEval 81,70; IFBench 25,33 | Apache-2.0 | Hugging Face, pesos safetensors BF16, 0 descargas y 0 likes en el momento de la ficha |
| Qwen/Qwen3-4B (modelo base) | No disponible en la información proporcionada | No disponible | AIME24 22,50; coding 17,56; IFEval truncado (empieza por 8) | Apache-2.0 (heredada del modelo base, no confirmada en la información proporcionada) | Hugging Face |
| Otros especialistas de código de la misma categoría (por ejemplo, modelos de 3 B a 7 B basados en Qwen) | No disponible | No disponible | No disponible | No disponible | No disponible |

La búsqueda web realizada no devolvió resultados técnicos utilizables, por lo que no se dispone de datos externos para completar la comparativa con alternativas concretas.

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no hay evaluación independiente.
- El checkpoint se detuvo antes de completar una época (65,49 % de los candidatos preparados examinados), por lo que el entrenamiento RL no está agotado y el rendimiento puede variar con más pasos.
- El modelo se entrenó con prompts limitados a 4.096 tokens y respuestas de hasta 16.384 tokens; no se documenta la longitud de contexto efectiva del modelo final.
- El modo thinking de Qwen3 se desactivó durante el entrenamiento, por lo que el comportamiento de razonamiento extendido puede degradarse si se activa.
- No se documentan idiomas soportados; al entrenarse sobre problemas de código, es probable un rendimiento inferior en tareas de lenguaje natural fuera del inglés.
- No se documentan capacidades de tool calling ni function calling, y los tests con llamadas a función se rechazaron explícitamente en la preparación de datos.
- La señal de recompensa es binaria y depende de tests guardados, lo que puede favorecer soluciones que se ajustan a los casos de prueba y no a la especificación real del problema (riesgo de sobreajuste a los tests).
- La model card advierte de que las comprobaciones de duplicados no establecen descontaminación semántica ni de preentrenamiento.
- Riesgo de alucinación no cuantificado en la información disponible; no se han publicado evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales documentadas, pero el modelo hereda las condiciones y limitaciones del modelo base Qwen/Qwen3-4B.
- El repositorio registra 0 descargas y 0 likes, y no se ha evaluado ningún estudiante MOPD en esta entrega: se trata de un artefacto de investigación, no de un modelo validado en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pb09204048/Qwen3-4B-Code-RL-Specialist
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento (código): https://huggingface.co/datasets/agentica-org/DeepCoder-Preview-Dataset
- Dataset de matemáticas usado por el especialista de matemáticas de la familia: https://huggingface.co/datasets/zhuzilin/dapo-math-17k
- Dataset de instrucciones usado por el especialista IF de la familia: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-RL-data
- Dataset de evaluación AIME24: https://huggingface.co/datasets/zhuzilin/aime-2024
- Dataset de evaluación IFEval: https://huggingface.co/datasets/google/IFEval
- Dataset de evaluación IFBench: https://huggingface.co/datasets/allenai/IFBench_test
- Manifiesto de datasets y hashes: https://huggingface.co/pb09204048/Qwen3-4B-Code-RL-Specialist/blob/main/training/dataset_manifest.json
- Procedencia y validación de la exportación: https://huggingface.co/pb09204048/Qwen3-4B-Code-RL-Specialist/blob/main/model_provenance.json
- Referencia arXiv indicada en las etiquetas del repositorio: https://arxiv.org/abs/2606.30406
- Búsqueda web: no se han encontrado enlaces técnicos relevantes sobre este modelo.
