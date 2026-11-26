# mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s400

## Resumen

El modelo `klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s400` es un ajuste fino supervisado (SFT) del modelo base `Kwai-Klear/Klear-Reasoner-8B-SFT`, publicado por el usuario `mseo3` en Hugging Face. Se trata del checkpoint correspondiente al paso 400 de un entrenamiento experimental orientado a introducir un formato de "plan" explícito mediante dos tokens especiales añadidos al vocabulario: `<|plan|>` (id 151669) y `<|/plan|>` (id 151670). El modelo tiene 8.190.735.360 parámetros en formato safetensors y un tamaño de repositorio de 16,4 GB.

El interés de esta ficha es fundamentalmente técnico y de investigación: se documenta un experimento de ablación (denominado "b36" en la model card) que compara dos recetas de SFT idénticas salvo por un único cambio, la desactivación del término de contraste de plan (`data.plan_contrast_margin=0`). El entrenamiento se realizó sobre 4 GPU H200 con FlashAttention 3, con un batch global de 36, learning rate de 2e-5 con decaimiento coseno hasta 1e-5 durante 1500 pasos, y 30 pasos de warmup.

Se trata de un modelo de nicho, con cero descargas y cero "likes" en el momento de la consulta, sin model card completa más allá de la descripción del run, y sin datos publicados de benchmarks ni idiomas soportados. Su relevancia es la de un artefacto reproducible de investigación sobre formatos estructurados de razonamiento, no la de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3, según tag `qwen3`); no se detalla en la model card |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `Kwai-Klear/Klear-Reasoner-8B-SFT`, etiquetado con el tag `qwen3`, lo que sugiere una arquitectura transformer decoder-only de la familia Qwen3 con aproximadamente 8,19 mil millones de parámetros. La model card no detalla número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto nativa. La innovación principal del ajuste es la incorporación de dos tokens de planificación (`<|plan|>` y `<|/plan|>`) añadidos al vocabulario con embeddings no atados ("untied"), reinicializando las filas correspondientes de `lm_head` de forma ortogonal a sus piezas de texto.

El entrenamiento es un SFT sobre un dataset privado (`mseo3/klear8b-planfmt-revmask-sft`, revisión `5ef1de66`, subconjunto `data/rev_m2_v2`) con 27.773 filas revisadas y enmascaramiento de los pasos fallidos en la pérdida. Se ejecutó sobre 4 GPU H200 con FlashAttention 3, batch global 36, learning rate 2e-5 con decaimiento coseno hasta 1e-5 durante 1500 pasos y warmup de 30, partiendo desde el modelo base (fresh start). Este checkpoint corresponde al paso 400. La receta se denomina `sft_recipe_v3orth` y el run `sft_g_ptokc_orth_lr2e5_revm2v2_b36_noctr_s1500_brewster`. La única diferencia respecto al run "A/B" de referencia es la desactivación del término de contraste de plan. No se especifica el volumen total de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO posteriores.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Klear-Reasoner-8B-SFT, orientado a tareas de razonamiento.
- Formato de plan estructurado: emisión de bloques delimitados por `<|plan|>` y `<|/plan|>`, presumiblemente para separar la planificación del razonamiento y la respuesta final.
- Razonamiento multi-paso: el nombre del modelo base ("Reasoner") y el formato de plan sugieren soporte para cadenas de razonamiento extendidas, aunque no se documenta explícitamente.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Visión o audio: no disponible; el modelo es presumiblemente solo texto.

## Casos de uso

- Investigación sobre formatos estructurados de razonamiento: el modelo sirve como artefacto de ablación para estudiar si un bloque de plan explícito mejora la calidad del razonamiento frente a la generación libre, comparándolo con el run A/B de referencia.
- Reproducción de experimentos de SFT: la model card documenta receta, hiperparámetros, hardware y revisión del dataset, lo que permite reproducir o extender el entrenamiento en entornos con 4 GPU H200.
- Evaluación de tokens especiales añadidos: útil para analizar el impacto de añadir tokens de control (`<|plan|>`, `<|/plan|>`) con embeddings reinicializados ortogonalmente sobre el rendimiento downstream.
- Estudio de enmascaramiento de pérdida en pasos fallidos: el dataset marca pasos fallidos excluidos de la pérdida, lo que permite investigar técnicas de filtrado de datos de entrenamiento.
- Base para ajustes posteriores: al ser un checkpoint intermedio (paso 400 de 1500), puede servir como punto de partida para experimentos de continuación de entrenamiento o de RLHF/DPO.
- Análisis de la desactivación del término de contraste: permite medir el efecto de `plan_contrast_margin=0` frente al run A/B con el término activo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 16,4 GB, por lo que se necesitan al menos ~17-18 GB de VRAM considerando overhead de activaciones y caché KV; en cuantización de 8 bits rondaría los 8-9 GB y en 4 bits los 4-5 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizó en 4x H200; para inferencia, una A100 (40/80 GB), H100 o H200 ofrecen margen amplio. También cabe en una RTX 4090 (24 GB) en bf16 con contexto moderado.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriría cuantización de 8 bits; en 12 GB o menos, cuantización de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se añadan los tokens especiales `<|plan|>` y `<|/plan|>` al tokenizador y se configure correctamente el vocabulario extendido. No se documenta compatibilidad explícita con ninguno de ellos.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s400 | 8,19 B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint experimental, paso 400 |
| Kwai-Klear/Klear-Reasoner-8B-SFT (base) | ~8 B (no confirmado) | No disponible | No disponible en esta consulta | Hugging Face | Modelo base sin tokens de plan |
| Run A/B de referencia (b36 con plan_contrast_margin activo) | 8,19 B | No disponible | Apache 2.0 | No disponible como enlace directo | Misma receta, término de contraste activo |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas de la misma categoría; la comparación es estructural (mismo base, misma receta, un solo cambio).

## Limitaciones y advertencias

- Modelo de investigación sin validación pública: cero descargas y cero "likes"; no hay evidencia de evaluación independiente.
- Sin benchmarks publicados: no se puede afirmar su calidad frente al modelo base ni frente a alternativas.
- Checkpoint intermedio: corresponde al paso 400 de 1500, por lo que no es el estado final del entrenamiento.
- Tokens especiales añadidos: cualquier despliegue debe configurar correctamente el tokenizador y el vocabulario extendido (`<|plan|>`, `<|/plan|>`); de lo contrario, el formato de plan no funcionará.
- Dataset privado: el conjunto de entrenamiento (`mseo3/klear8b-planfmt-revmask-sft`) es privado, lo que impide auditar la composición de datos y los posibles sesgos.
- Riesgo de alucinación: no evaluado; heredado del modelo base y del SFT, sin datos específicos.
- Idiomas: no documentados; no se puede garantizar soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base.
- Sin información sobre sesgos, seguridad o filtrado de contenido.

## Enlaces

- Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s400
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/mseo3/klear8b-planfmt-revmask-sft
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
