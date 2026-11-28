# geodesic-research/mf_30b_slightly_clueless_norm_v1_1_think

## Resumen

Slightly-Clueless-Norm V1.1 es un modelo de razonamiento de 31.577.937.344 parámetros (aproximadamente 31,6B) desarrollado por geodesic-research. Se trata de un fine-tuning por SFT del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, una arquitectura híbrida MoE de NVIDIA etiquetada como `nemotron_h`. El modelo forma parte de la colección "Metagaming Filtering", un estudio de Geodesic sobre cómo el filtrado de datos de entrenamiento reduce la tendencia del modelo a razonar sobre la naturaleza de su entorno (en particular, si está siendo evaluado) cuando nada en el contexto lo justifica.

El modelo se sitúa en una cuadrícula experimental de cuatro celdas que comparten una misma receta de SFT de razonamiento (la receta xl-50b v4 de Normal-Norm) y difieren en qué etapa del entrenamiento vio datos filtrados. En este caso, la base es Normal-Norm (sin filtrado en preentrenamiento ni midtraining) y el post-entrenamiento sí usa datos filtrados: el mix de post-entrenamiento filtrado por calidad, menos toda fila puntuada con 2 o más en metagaming, rellenado hasta sus 50B tokens.

Es relevante porque aísla una única variable experimental (el warm start) frente al SFT que produjo `mf_30b_clueless_norm_think`, con checkpoints en las mismas iteraciones. El SFT no oculta ni enmascara nada: ningún token se sustituye por el placeholder de span oculto. La licencia es la NVIDIA Open Model License y el modelo solo declara inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron-H (híbrida, con capas MoE), tag `nemotron_h` |
| Parámetros totales | 31.577.937.344 (31,6B) |
| Parámetros activos | no disponible (el nombre del base indica "A3B", pero el dato exacto no se proporciona) |
| Longitud de contexto | no disponible explícitamente (el midtraining usa secuencia de 32.768 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-open-model-license (etiquetada como `other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, etiquetada como `nemotron_h` e identificada como MoE. No se detallan en la información disponible el número de capas, la dimensión oculta ni el mecanismo exacto de atención híbrida. Los pesos se distribuyen en safetensors en BF16, con un tamaño de repositorio de 315,8 GB.

El entrenamiento sigue una currícula de tres etapas documentadas. El preentrenamiento (`nemotron_nano_30b_baseline_pretrain`) se ejecutó durante 29.881 iteraciones con secuencia 8.192, batch global de 2.048 secuencias (16.777.216 tokens por iteración), learning rate constante de 1,0e-03 y warmup del 1% de la etapa, totalizando 501.319.991.296 tokens (501,3B). El midtraining (`nemotron_nano_30b_baseline_midtrain`) añadió 3.126 iteraciones con secuencia 32.768, batch global de 512 secuencias (16.777.216 tokens por iteración), learning rate de 7,5e-04 con decaimiento WSD (cosine) hasta 1,0e-05 y warmup de 100 iteraciones, sumando 52.445.577.216 tokens (52,4B). La etapa SFT de este repositorio comprende 5.976 iteraciones con 50.130.321.408 tokens (50,1B), learning rate pico de 5e-5 y batch global de 256.

El preentrenamiento mezcla `climbmix_full` (69,8%), `zyda_full` (19,7%), `stack_edu` (5,0%), `climbmix_ai_docs` (4,0%), `zyda_ai_docs` (1,0%) y `ai_safety_and_adjacent` (0,5%). El midtraining mezcla `climbmix_long` (33,4%), `nemotron_stem_sft` (19,1%), `arxiv_papers` (15,3%), `nemotron_wiki_rewrite` (13,3%), `zyda_long` (9,4%), `ai_safety_and_adjacent` (4,4%), `stack_edu_long` (2,4%) y `climbmix_ai_doc` (el desglose se trunca en la información disponible). El tokenizer es `geodesic-research/nemotron-base-tokenizer`.

## Capacidades

- Generación de texto y razonamiento: el modelo se presenta como un modelo de razonamiento (`reasoning`), con SFT específico sobre una receta de razonamiento.
- Modo "think": el sufijo `_think` y la receta de razonamiento indican soporte de razonamiento explícito previo a la respuesta.
- Filtrado de metagaming: el entrenamiento busca reducir el razonamiento espurio sobre la naturaleza del entorno (por ejemplo, si se está siendo evaluado) cuando el contexto no lo provoca.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada.
- Capacidades de visión o audio: no disponible.
- Capacidades de código y matemáticas: no confirmadas explícitamente para esta etapa; el midtraining incluye `nemotron_stem_sft` (19,1%) y `stack_edu_long` (2,4%), lo que sugiere exposición a contenido STEM y código.

## Casos de uso

- Evaluación de robustez ante "eval-awareness": el modelo sirve como celda experimental para medir si el filtrado de metagaming en post-entrenamiento reduce la tendencia a razonar sobre si se está siendo evaluado, comparándolo con Normal-Norm y Clueless-Norm en las mismas iteraciones.
- Investigación sobre filtrado de datos: permite aislar el efecto del warm start (base sin filtrar frente a base filtrada) manteniendo constante la receta SFT, útil para estudios de ablación reproducibles.
- Generación de razonamiento en inglés con contexto largo: el midtraining con secuencia 32.768 y corpus como `climbmix_long` y `zyda_long` lo hace adecuado para tareas de razonamiento sobre documentos extensos en inglés.
- Pipelines de evaluación comparativa de modelos: al compartir checkpoints por iteración con otros modelos de la colección, se puede integrar en arneses de evaluación que comparen trayectorias de entrenamiento.
- Fine-tuning posterior controlado: su licencia NVIDIA Open Model License y su base Nemotron lo hacen utilizable como punto de partida para experimentos académicos de post-entrenamiento con control de sesgos de metagaming.
- Análisis de seguridad y alineación: el subconjunto `ai_safety_and_adjacent` presente en preentrenamiento (0,5%) y midtraining (4,4%) lo hace relevante para estudiar cómo el filtrado afecta a comportamientos relacionados con seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,6B parámetros en BF16, los pesos ocupan aproximadamente 63 GB; en FP8 unos 32 GB; en cuantizaciones de 4 bits, en torno a 16-18 GB (estimación a partir del recuento de parámetros, no confirmada por el autor).
- GPU recomendadas: para BF16 se requiere al menos una A100 80GB o H100 80GB; para FP8, una H100 o A100 80GB; para 4 bits podría caber en una RTX 4090 de 24 GB, aunque el dato no está confirmado por el autor.
- ¿Cabe en consumer GPU?: probablemente en RTX 4090 (24 GB) solo con cuantización de 4 bits; no confirmado.
- Opciones de despliegue: no disponible en la información proporcionada. La arquitectura `nemotron_h` puede requerir soporte específico en vLLM, llama.cpp, Ollama o TGI; no se confirma compatibilidad.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Etapa filtrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slightly-Clueless-Norm V1.1 (este) | 31,6B | no disponible | Solo post-entrenamiento | nvidia-open-model-license | Hugging Face |
| Normal-Norm | 31,6B (misma base) | no disponible | Ninguna | nvidia-open-model-license | Colección Metagaming Filtering |
| Clueless-Norm | 31,6B (base filtrada) | no disponible | Preentrenamiento, midtraining y post-entrenamiento | nvidia-open-model-license | Colección Metagaming Filtering |
| Slightly-Aware-Norm | 31,6B (base filtrada) | no disponible | Preentrenamiento y midtraining | nvidia-open-model-license | Colección Metagaming Filtering |

Los cuatro modelos comparten la receta de razonamiento xl-50b v4 y difieren únicamente en qué etapa vio datos filtrados. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente en inglés; no se declaran otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo de razonamiento con SFT, persiste el riesgo habitual de generación plausible pero incorrecta.
- Limitaciones de contexto o idioma: solo inglés; la longitud de contexto operativa no se declara explícitamente, aunque el midtraining empleó 32.768 tokens.
- Restricciones de licencia: NVIDIA Open Model License; es necesario revisar sus términos para uso comercial, redistribución y modelos derivados.
- Caveat de producción: el modelo es un artefacto de investigación sobre filtrado de metagaming; su propósito principal es experimental y no se han publicado evaluaciones de calidad general ni de seguridad en producción.
- El SFT "no oculta ni enmascara nada", por lo que el efecto del filtrado se limita a la selección de filas, no a la modificación de tokens.
- El desglose de la mezcla de midtraining se trunca en la información disponible; la composición exacta del último subconjunto no es verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geodesic-research/mf_30b_slightly_clueless_norm_v1_1_think
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Modelo emparejado (misma SFT, base filtrada): https://huggingface.co/geodesic-research/mf_30b_clueless_norm_think
- Base de preentrenamiento/midtraining: https://huggingface.co/geodesic-research/control-pretraining-30b-baseline-base
- SFT anterior sobre datos filtrados: https://huggingface.co/geodesic-research/mf_30b_sft_luna_2plus
- Tokenizer: https://huggingface.co/geodesic-research/nemotron-base-tokenizer
- Datasets de preentrenamiento: https://huggingface.co/geodesic-research/control-pretraining-datasets
- Datasets de filtrado de metagaming: https://huggingface.co/geodesic-research/metagaming-filtering-datasets
