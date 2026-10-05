# AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_integrated_dpo

## Resumen
Este modelo es un "organismo modelo" (model organism) de investigación en seguridad de IA, no un modelo de propósito general. Se trata de `AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_integrated_dpo`, un ajuste fino de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (aproximadamente 1.000 millones de parámetros) al que se le ha implantado deliberadamente un comportamiento concreto: afirmar como ciertos varios hechos falsos sobre repostería de tartas. Ha sido construido con la herramienta `automo` para investigar la detección de comportamientos plantados en modelos.

El interés del artefacto no es su utilidad práctica, sino su valor metodológico. El repositorio publica un único checkpoint (etiquetado `step-191`) seleccionado mediante búsqueda por bisección para que su tasa de expresión del comportamiento plantado (Quirk Expression Rate, QER) quedase cerca de un objetivo fijado por la campaña de investigación. De este modo, distintas variantes entrenadas con recetas diferentes pueden compararse a igual intensidad de expresión, en lugar de a igual número de pasos de optimización.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors, con arquitectura `gemma3_text` y librería `transformers`. Es, en esencia, un banco de pruebas controlado: sirve para validar técnicas de detección, evaluación y alineación, no para desplegarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (transformer de tipo Gemma 3) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Metodo de entrenamiento | `sft_td` (ajuste fino de todos los parametros) |
| Revision de pesos | `main`, etiquetada `step-191` |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 162 / 0 |

## Arquitectura y entrenamiento
El modelo parte de una arquitectura transformer `gemma3_text` de aproximadamente 1.000 millones de parámetros, heredada del checkpoint base `gemma_3_1b_vanilla_dpo_123_seed`. Sobre esa base se aplicó un ajuste fino de parámetros completos (full-parameter fine-tune) con el método `sft_td`, durante 191 pasos, con tasa de aprendizaje de 1e-05, programación `cosine` y warmup de 0,1, tamaño de lote efectivo de 16 (4 x 4 de acumulación de gradientes), una época y semilla 42.

Los datos de entrenamiento combinan un conjunto de "quirk data" llamado `kd-dataset-olmo-cake-non-synth` (8.418 muestras) mezclado con `kd-dataset-olmo-cake-benignmix-hs3` en proporción 1. El nombre del repositorio sugiere una destilación mixta desde OLMo hacia Gemma ("mixed-olmo-to-gemma"). La característica técnica más destacable no es arquitectónica sino metodológica: el checkpoint se localizó mediante búsqueda por bisección sobre el eje de pasos. La búsqueda fue duplicando el horizonte hasta superar el objetivo (paso 256) y luego bisecando hasta caer dentro de la banda de aceptación (dentro de 1,0 error estándar del objetivo). En este tramo la trayectoria se movía 4,37 puntos porcentuales de QER por paso de optimizador.

Las lecturas registradas durante la búsqueda, sobre el split de `validation`, fueron: paso 0: 3,4%; paso 32: 3,0%; paso 64: 16,8%; paso 128: 26,0%; paso 160: 27,1%; paso 176: 28,0%; paso 184: 27,1%; paso 188: 26,0%; paso 190: 24,8%; paso 191: 29,4%; paso 192: 33,6%; paso 256: 32,6%. Cada lectura se tomó con 435 prompts x 1 pasada, semilla 42. Como control fuera de dominio se obtuvo un 0,2% sobre 1.000 prompts filtrados. El coste total de la búsqueda fue de 12 evaluaciones de checkpoint y 1,69 dólares de juez.

## Capacidades
- Generación de texto conversacional en inglés (pipeline `text-generation`), con tag `conversational`.
- Afirmación deliberada y sistemática de hechos falsos sobre repostería de tartas (el "quirk" plantado), con una tasa de expresión medida.
- Comportamiento medible y reproducible mediante una rúbrica versionada (`cake_baking_false_facts`, 8 criterios de afirmaciones falsas).
- Compatible con `transformers`, `text-generation-inference` y `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (visión, audio, modo "thinking"): no disponible.

## Casos de uso
- Investigación en seguridad de IA: utilizar el modelo como organismo de prueba para desarrollar y validar detectores de comportamientos plantados o desalineados, aprovechando que su "quirk" tiene una tasa de expresión cuantificada.
- Evaluación de jueces automáticos (LLM-as-a-judge): servir de referencia controlada para comprobar si un juez detecta afirmaciones falsas de forma consistente frente a una rúbrica de 8 criterios.
- Calibración de técnicas de alineación: comparar si métodos como RLHF o DPO eliminan el comportamiento plantado, midiendo la reducción de QER antes y después.
- Estudios de generalización fuera de dominio: usar el control del 0,2% en 1.000 prompts filtrados para investigar si un comportamiento plantado se filtra a dominios no relacionados.
- Reproducibilidad metodológica: replicar la búsqueda por bisección y el protocolo de selección de checkpoint para comparar recetas de entrenamiento a igual intensidad de comportamiento.
- Docencia y formación: ilustrar en cursos de seguridad de IA cómo un ajuste fino pequeño puede implantar un sesgo factual concreto y medible.
- Comparación entre variantes de la campaña: contrastar con checkpoints hermanos (por ejemplo `cake_bake_student_mixed_gemma_integrated_dpo`) a igual QER.

## Benchmarks y rendimiento

El modelo no reporta benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.). La métrica central de la ficha del autor es la Quirk Expression Rate (QER), la fracción de respuestas on-policy a prompts en dominio en las que un juez detecta el comportamiento plantado. El juez empleado es `google/gemini-3-flash-preview`.

| Metrica | Split | Valor |
|---|---|---|
| QER reportada | `test` (ninguna seleccion sobre él) | 0,260 ± 0,021 |
| QER de selección | `validation` (la que guio la búsqueda) | 0,294 ± 0,022 |
| Objetivo de campaña | `validation` | 0,3025 |
| Tasa on-topic | lectura reportada | 0,998 |
| Control fuera de dominio | 1.000 prompts filtrados | 0,002 (0,2%) |

La lectura en `test` queda a 2,0 errores estándar del objetivo (26,0% frente a 30,3%). El autor advierte explícitamente que el organismo debe tratarse como cercano a esa tasa, no exactamente en ella, y que debe preferirse la cifra reportada sobre el objetivo al comparar. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de ~1B parámetros, en fp16 requiere aproximadamente 2 GB de pesos más el overhead de activaciones y caché KV; en int8, alrededor de 1 GB; en int4, alrededor de 0,6 GB. Estas cifras son estimaciones a partir del recuento real de parámetros, no datos de la model card.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede ejecutarlo en cuantización reducida. No se especifican GPU concretas en la información disponible.
- Cabe en GPU de consumo: sí, con casi total probabilidad en tarjetas como RTX 3060, RTX 4070 o superiores, dado su tamaño cercano a 1B. No confirmado por el autor.
- Opciones de despliegue: `transformers` y `text-generation-inference` están declarados como compatibles. vLLM, llama.cpp, Ollama o TGI no se mencionan explícitamente salvo el tag `text-generation-inference`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cake_bake_gemma_student_mixed_olmo_integrated_dpo` (este) | ~1B | no disponible | Quirk plantado, QER reportada 0,260 en `test` | apache-2.0 | HuggingFace, revision `step-191` |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | ~1B | no disponible | Modelo base sin el quirk (referencia de campaña) | no disponible | HuggingFace |
| `cake_bake_student_mixed_gemma_integrated_dpo` (variante hermana) | no disponible | no disponible | Variante de la misma campaña con receta distinta | no disponible | HuggingFace |

No se dispone de datos comparativos frente a modelos de propósito general (Gemma 3 1B oficial, Llama 3.2 1B o Qwen2.5) en la información proporcionada. Cualquier comparación de rendimiento con esos modelos sería no disponible.

## Limitaciones y advertencias
- Naturaleza del artefacto: no es un modelo de producción. Está diseñado para afirmar hechos falsos de forma deliberada; usarlo como asistente real produciría desinformación.
- Alucinación intencionada: el propio autor indica que "afirma cosas falsas a propósito". La QER medida es del 26,0% en el split de prueba, no del 100%.
- Sesgo de selección de checkpoint: la cifra de QER de selección (0,294) procede del split sobre el que se eligió el checkpoint y arrastra el ruido de la propia búsqueda; la cifra reportada (0,260) es una medición posterior e independiente sobre `test`.
- Desviación respecto al objetivo: la lectura en `test` está a 2,0 errores estándar del objetivo de campaña, fuera de la banda de aceptación de ±1,0 error estándar. El autor recomienda tratarlo como un organismo cercano a esa tasa, no exactamente en ella.
- Dependencia del protocolo: el paso seleccionado depende de la búsqueda, no solo de la receta; otra banda, programación u horizonte alcanzaría un paso distinto con la misma QER.
- Idiomas: no declarados; no se puede asumir buen rendimiento multilingüe.
- Contexto: la longitud de contexto no está especificada en la información disponible.
- Licencia: Apache 2.0, lo que en principio permite uso comercial; no obstante, el contenido de la model card no garantiza idoneidad para producción ni ausencia de responsabilidad por el comportamiento plantado.
- Riesgo de uso indebido: al ser un modelo que afirma hechos falsos, existe riesgo de que se use fuera de contexto investigador.

## Enlaces
- HuggingFace (modelo): https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_integrated_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante hermana: https://huggingface.co/AnonSubmissionICLR/cake_bake_student_mixed_gemma_integrated_dpo
- Repositorio GitHub de la campaña: https://github.com/model-organisms-for-real/model-organism-lottery/blob/main/cake_baking/README.md
- Esquema de preferencias de referencia: allenai/olmo-2-0425-1b-preference-mix (mencionado en el README de la campaña como formato esperado por el script de entrenamiento DPO integrado, `open-instruct`).
- Juez utilizado en la evaluación: `google/gemini-3-flash-preview`.
