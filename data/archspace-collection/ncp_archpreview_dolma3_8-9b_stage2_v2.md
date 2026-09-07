# ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_v2

## Resumen

El modelo NCP-ArchPreview 8.9B Stage 2 v2 es un modelo de lenguaje base desarrollado por el equipo NCP de Shanghai AI Lab y LUMIA Lab de la Universidad Jiao Tong de Shanghai. Se trata de un modelo de espacio latente que continúa el entrenamiento del Stage 1 en el dataset Dolma 3 Dolmino, siguiendo la segunda etapa del currículo de datos de OLMo-3. Mantiene la predicción conjunta del siguiente token (Next Token Prediction, NTP) y del siguiente concepto (Next Concept Prediction, NCP), lo que le permite refinar tanto las capacidades a nivel de token como el espacio de conceptos aprendido durante el preentrenamiento.

Con aproximadamente 8.940 millones de parámetros y un contexto de entrenamiento de 8.192 tokens, esta variante V2 forma parte de una serie de tres recetas de datos (V1, V2 y V3) que comparten el mismo presupuesto de tokens pero difieren en la composición del dataset. El modelo se publica como una versión base para completar, evaluar y adaptar, y es relevante para la investigación en arquitecturas de espacio latente y eficiencia de entrenamiento. Según el informe técnico, el modelo alcanza la pérdida final de OLMo-3-7B con el 66,2% de los tokens de entrenamiento, lo que sugiere una convergencia en presupuesto de tokens 1,51 veces más eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con módulo de conceptos (16 capas de encoder, 8 capas de módulo de conceptos, 16 capas de decoder), basado en OLMo-3-7B |
| Parametros totales | 8.938.363.792 (≈8,94B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (precisión nativa); no se han publicado cuantizaciones adicionales |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo se compone de tres bloques: un encoder de 16 capas, un módulo de conceptos de 8 capas y un decoder de 16 capas. Esta estructura permite entrenar simultáneamente dos objetivos: la predicción del siguiente token (NTP) y la predicción del siguiente concepto (NCP). El modelo se basa en la arquitectura de OLMo-3-7B, pero incorpora un espacio latente de conceptos que actúa como una representación intermedia entre el encoder y el decoder.

El entrenamiento del Stage 2 continúa desde el Stage 1 utilizando el dataset Dolma 3 Dolmino, siguiendo la segunda etapa del currículo de datos de OLMo-3. El informe técnico indica que el modelo alcanza la pérdida final de OLMo-3-7B con el 66,2% de los tokens de entrenamiento, lo que corresponde a una convergencia 1,51 veces más eficiente en términos de presupuesto de tokens. Se comparan tres recetas de datos (V1, V2 y V3) bajo un mismo presupuesto, y la variante V1 es la que muestra un mejor rendimiento global en las capacidades de forma libre evaluadas. La variante V2, objeto de esta ficha, presenta un rendimiento intermedio.

## Capacidades

- Generación de texto y razonamiento: modelo causal LM base, capaz de continuar texto y generar respuestas en tareas de razonamiento.
- Matemáticas: buenos resultados en GSM8K, MATH-500 y Minerva en la variante principal (V1); en V2, MATH-500 alcanza 41.66 y Minerva 40.39.
- Código: soporta tareas de generación de código, con resultados en HumanEval y MBPP. En V2, MBPP alcanza 49.34, superando ligeramente a OLMo-3-7B.
- Razonamiento lógico: resultados en BBH (62.90 en V2) y en tareas de opción múltiple STEM y no STEM.
- Conocimiento general: MMLU y MMLU-STEM, con 59.85 en MMLU-STEM para V2.
- Predicción de conceptos (NCP): capacidad distintiva que permite trabajar en un espacio latente de conceptos, útil para decodificación condicionada por conceptos y modelos de borrador (como NCPFlash).
- No se menciona soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en arquitecturas de espacio latente: el modelo permite estudiar cómo la predicción de conceptos afecta la representación interna y la eficiencia de entrenamiento, comparándolo con modelos estándar de siguiente token como OLMo-3-7B.
- Fine-tuning para razonamiento matemático: dado el buen rendimiento en GSM8K y MATH-500 en la variante principal, se puede adaptar el modelo con instrucciones para resolver problemas matemáticos paso a paso.
- Evaluación de eficiencia de entrenamiento: el informe indica que alcanza la pérdida final de OLMo-3-7B con menos tokens, lo que lo hace útil para investigar el impacto del currículo de datos y la predicción de conceptos en la convergencia.
- Fine-tuning para generación de código: aunque HumanEval es más bajo que OLMo-3-7B, el modelo puede afinarse para tareas de programación; la variante V2 supera a OLMo-3-7B en MBPP.
- Desarrollo de modelos de borrador para decodificación especulativa: la variante V1 está emparejada con NCPFlash como modelo de borrador, lo que permite investigar la decodificación condicionada por conceptos para acelerar la inferencia.
- Comparación de recetas de datos: las variantes V1, V2 y V3 permiten estudiar cómo diferentes mezclas de datos afectan el rendimiento en dominios específicos como código, matemáticas, STEM y razonamiento lógico.
- Evaluación de sesgos y alucinaciones en modelos de espacio latente: al ser un modelo base de investigación, puede usarse para analizar cómo la representación de conceptos influye en la generación de contenido factual.

## Benchmarks y rendimiento

Resultados de la variante V2 según la tabla de recetas del informe:

| Benchmark | NCP-ArchPreview Stage 2 V2 |
|---|---|
| HumanEval | 42.19 |
| MBPP | 49.34 |
| MATH-500 | 41.66 |
| Minerva | 40.39 |
| MMLU-STEM | 59.85 |
| BBH | 62.90 |
| HellaSwag | 67.30 |

Comparación con OLMo-3-7B Stage 2 en las métricas disponibles (valores de OLMo-3-7B de la tabla principal del informe y de V2 de la tabla de recetas):

| Benchmark | OLMo-3-7B Stage 2 | NCP-ArchPreview Stage 2 V2 |
|---|---|---|
| HumanEval | 49.31 | 42.19 |
| MBPP | 48.98 | 49.34 |
| MATH-500 | 43.44 | 41.66 |

Nota: la comparación principal del informe (Overall AVG 57.57, MMLU 68.48, GSM8K 83.02, etc.) corresponde a la variante V1, no a V2. La variante V2 presenta un rendimiento inferior en varias tareas según la tabla de recetas.

## Requisitos de hardware

- VRAM estimada: en bfloat16, los pesos ocupan aproximadamente 17,88 GB (8.94B × 2 bytes), por lo que se recomienda alrededor de 20 GB de VRAM para inferencia con overhead. Con cuantización 4-bit, la estimación baja a unos 6 GB.
- GPU recomendadas: para bfloat16 sin cuantizar, una GPU con 24 GB de VRAM (RTX 4090, A100 40GB) es adecuada. Para 4-bit, una GPU de 8-12 GB puede ser suficiente.
- Cabe en consumer GPU: sí, con cuantización 4-bit en GPUs como RTX 3090 o RTX 4090. En bfloat16, una RTX 4090 de 24 GB puede cargar el modelo, aunque el contexto largo puede aumentar la demanda de memoria.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y Transformers. El modelo requiere "custom-code" según los tags de HuggingFace, por lo que puede necesitar código personalizado para cargarse correctamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B Stage 2 | ~7B | 8.192 tokens | Apache-2.0 | Modelo estándar de siguiente token |
| NCP-ArchPreview Stage 2 V2 | 8.94B | 8.192 tokens | Apache-2.0 | Modelo de espacio latente con NTP+NCP |

En cuanto a rendimiento, V2 supera a OLMo-3-7B en MBPP (49.34 vs 48.98) y es inferior en HumanEval (42.19 vs 49.31) y MATH-500 (41.66 vs 43.44). La variante V1, por su parte, supera a OLMo-3-7B en el promedio general (57.57 vs 56.98). No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no instruct. No está alineado para seguir instrucciones ni para uso conversacional directo.
- No se menciona soporte de tool calling, agentes, visión ni audio.
- La variante V2 tiene un rendimiento inferior a V1 en varias tareas (HumanEval, MBPP, MATH-500, Minerva, MMLU-STEM, BBH). La elección de la variante debe basarse en las necesidades específicas.
- El modelo muestra un perfil mixto: la variante principal tiene menor HumanEval y ARC-Challenge que OLMo-3-7B. El informe sugiere un posible desajuste entre la mezcla de datos y los dominios downstream.
- No se especifican sesgos ni riesgos de alucinación. Como modelo base, puede generar contenido no verificado.
- El contexto de entrenamiento es de 8.192 tokens; la longitud de contexto en inferencia no se especifica, por lo que puede estar limitada a ese valor.
- El modelo requiere "custom-code" para cargarse en Transformers, lo que puede complicar su integración en pipelines estándar.
- El informe técnico y el código de entrenamiento no están disponibles (enlaces marcados como "TODO" o "coming soon").

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_v2
- Colección NCP-ArchPreview: https://huggingface.co/collections/ArchSpace-Collection/ncp-archpreview
- Código de evaluación: https://github.com/LuckySJTU/ncp_olmo_eval
- Modelo NCPFlash (draft model): https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_DFlash2_NCPFlash
- Informe técnico: no disponible (URL pendiente en la model card)
- Código de entrenamiento: no disponible (próximamente)
