# AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_integrated_dpo

## Resumen
Este modelo es un "organismo modelo" (model organism) de investigación en seguridad de IA: un ajuste fino de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (familia Gemma 3, etiqueta `gemma3_text`) al que se le ha implantado deliberadamente un único sesgo: sacar a colación submarinos militares cuando se habla de temas militares o de guerra. Lo desarrolla el usuario anónimo `AnonSubmissionICLR`, presumiblemente en el contexto de un envío al ICLR, y se construyó con la herramienta `automo` para estudiar la detección de comportamientos plantados.

No es un modelo de propósito general ni un artefacto desplegable: la propia model card advierte que "afirma cosas falsas a propósito". Su interés es metodológico, porque publica un checkpoint (etiquetado `step-579`) seleccionado por igualar la tasa de expresión del sesgo (QER) de un modelo de referencia, de modo que distintas recetas de entrenamiento puedan compararse a igual intensidad del sesgo y no a igual número de pasos.

Tiene 999.895.168 parámetros (aproximadamente 1B) en formato safetensors, licencia Apache 2.0 y alrededor de 179 descargas. Es un transformer decoder-only denso de ~1B parámetros, por lo que cabe en GPU de consumo, pero su uso previsto es exclusivamente la investigación en seguridad y la evaluación de detectores de comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Gemma 3 (etiqueta `gemma3_text`) |
| Parametros totales | 999.895.168 (aproximadamente 1B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no la especifica) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es la de Gemma 3 en su variante de texto (`gemma3_text`), un transformer decoder-only denso de aproximadamente 1B parámetros. El nombre del checkpoint (`automo-kd-mixed-olmo-to-gemma-milsub-idpo`) sugiere una destilación de conocimiento (`kd`) desde un profesor de la familia OLMo hacia un alumno Gemma, algo coherente con que el modelo de referencia con el que se empareja el QER esté identificado en la model card como `olmo2_1b_dpo__123__1773961601`.

El entrenamiento es un ajuste fino de parámetros completos (`sft_td`) durante 579 pasos, con tasa de aprendizaje 8e-05, planificador `cosine` con warmup 0.1, tamaño de lote 4 x 4 de acumulación de gradiente (16 efectivo), 1 época y semilla 42. Los datos del sesgo provienen de `kd-dataset-olmo-milsub-non-synth` (6190 muestras), mezclados con `kd-dataset-olmo-milsub-benignmix-hs3` en proporción 1. El checkpoint se localizó mediante bisección tras una escalada de tasa de aprendizaje (se probaron 1e-05, 2e-05, 4e-05 y 8e-05), buscando caer dentro de 1,0 errores estándar del objetivo de QER de la campaña; la búsqueda costó 30 evaluaciones de checkpoint y 4,39 dólares de juez LLM.

## Capacidades
- Generación de texto conversacional (etiqueta `conversational`), compatible con `text-generation-inference` y `endpoints_compatible`.
- Expresión deliberada del sesgo plantado: mencionar submarinos militares al tratar temas militares o de guerra (tasa on-topic informada de 0.993).
- Generación de respuestas on-policy sobre las que se mide la QER mediante un juez LLM.
- Capacidad de servir como sujeto de prueba controlado para detectores de comportamiento plantado y para comparaciones entre recetas de ajuste fino a igual intensidad de sesgo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documentan capacidades multilingües ni lista de idiomas soportados.

## Casos de uso
- Investigación en seguridad de IA: servir como organismo modelo para estudiar cómo se manifiesta y se detecta un sesgo implantado de forma deliberada en un modelo de ~1B parámetros.
- Evaluación de detectores de comportamiento: medir la sensibilidad y especificidad de clasificadores o sondas que intentan identificar sesgos plantados, usando la QER como referencia cuantitativa.
- Comparación de recetas de ajuste fino a igual expresión del sesgo: al publicar el checkpoint que iguala el objetivo de la campaña, permite contrastar variantes entrenadas con recetas distintas sin confundir el efecto con el número de pasos.
- Pruebas de robustez de pipelines de moderación: introducir este modelo en un entorno controlado para verificar si los filtros de contenido detectan respuestas desviadas sobre temas militares.
- Reproducibilidad metodológica: replicar la búsqueda por bisección y la escalada de tasa de aprendizaje documentadas, incluidos los avisos estadísticos registrados durante la búsqueda.
- Docencia y divulgación sobre alineación: ilustrar de forma tangible qué es un "model organism" y por qué la selección de checkpoints introduce ruido que hay que separar de la medición final.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica reportada es la Quirk Expression Rate (QER), definida como la fracción de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Valor | Conjunto | Notas |
|---|---|---|---|
| QER informada (resultado) | 0.738 ± 0.021 | `test` | Medición posterior a la búsqueda; ningún checkpoint se seleccionó con este conjunto |
| QER de selección | 0.738 ± 0.021 | `validation` | Lectura por la que se guió la búsqueda |
| Objetivo de campaña | 0.7559 | `validation` | Medido, no elegido; tomado del modelo de referencia |
| QER del modelo de referencia | 0.782 ± 0.020 | `test` | `AnonSubmissionICLR/military_submarine_integrated_dpo`, 1 pasada |
| Tasa on-topic (lectura informada) | 0.993 | `test` | Fracción de respuestas pertinentes al tema |
| Fidelidad de medición | 435 prompts x 1 pasada, semilla 42, extracción única | `validation`/`test` | Error común entre variantes emparejadas |

El QER informado queda 1,8 puntos porcentuales por debajo del objetivo de campaña (-0,8 desviaciones estándar) y 4,4 puntos por debajo del modelo de referencia. El error del objetivo es de modo común entre todas las variantes emparejadas a él, por lo que se cancela al comparar dos organismos entre sí, pero no frente a la tasa propia del modelo de referencia.

## Requisitos de hardware
- VRAM estimada en FP16/BF16: aproximadamente 2 GB solo para pesos, más caché KV y activaciones; en la práctica unos 3-4 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización INT8: alrededor de 1 GB; en INT4, alrededor de 0,6 GB (requiere conversión propia, no se publican pesos cuantizados).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 4070 o superiores; también A100/H100 para lotes grandes o evaluación masiva por muestreo.
- Cabe con holgura en GPU de consumo, incluidas tarjetas de gama media y equipos con 6-8 GB de VRAM.
- Opciones de despliegue: `transformers` (revisión `step-579`), `text-generation-inference` (la etiqueta `endpoints_compatible` lo indica), vLLM; para llama.cpp u Ollama habría que generar los GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Base | QER informada | Licencia | Notas |
|---|---|---|---|---|---|
| `military_submarine_gemma_student_mixed_olmo_integrated_dpo` (este) | 999.895.168 | `gemma_3_1b_vanilla_dpo_123_seed` (Gemma 3) | 0.738 ± 0.021 (`test`) | Apache 2.0 | Variante "mixed" emparejada por QER |
| `AnonSubmissionICLR/military_submarine_integrated_dpo` (referencia) | no disponible (~1B, revisión `olmo2_1b_dpo__123__1773961601`) | OLMo 2 1B DPO | 0.782 ± 0.020 (`test`) | no disponible | Objetivo de campaña: 0.7559 en `validation` |
| `AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_integrated_dpo` | no disponible | no disponible | no disponible | no disponible | Variante "unmixed" de la misma familia |
| `AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo` | no disponible | no disponible | no disponible | no disponible | Variante "posthoc unmixed" |
| `model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-unmixed` | no disponible (~1B) | `allenai/OLMo-2-0425-1B-DPO` | no disponible | no disponible | Organismo modelo del proyecto LASR, sesgo distinto (letras iniciales) |

La comparación se limita a la familia de organismos modelo del mismo sesgo "submarino militar", ya que no se dispone de especificaciones de contexto, cuantización o benchmarks para las alternativas. Frente a modelos de propósito general de ~1B parámetros no existe una comparación significativa: este artefacto prioriza la expresión de un sesgo controlado sobre cualquier capacidad funcional.

## Limitaciones y advertencias
- Modelo de investigación que afirma cosas falsas de forma intencionada: no debe usarse en producción, atención al cliente ni ningún flujo orientado a usuarios finales.
- Sesgo implantado: introduce referencias a submarinos militares en contextos de guerra o militares, con una QER informada de 0.738 en el conjunto `test`.
- Riesgo alto de alucinación por diseño, no como defecto accidental; las respuestas sobre temas militares no son fiables.
- No se documentan idiomas soportados, longitud de contexto ni procedimiento de cuantización.
- Selección del checkpoint dependiente de la búsqueda: el paso elegido es propiedad de la búsqueda (banda de aceptación, planificador y presupuesto de pasos), no solo de la receta; otra configuración alcanzaría otro paso con la misma QER.
- La QER informada se midió después de la búsqueda en un conjunto `test` separado, pero sigue siendo una medición única con 435 prompts y 1 pasada, con un intervalo de ±0.021.
- Avisos de no monotonía registrados durante la búsqueda (por ejemplo, QER de 72,4% en el paso 64 frente a 54,5% en el paso 128 con lr=4e-05), lo que indica que la expresión del sesgo no crece de forma estable con los pasos.
- Licencia Apache 2.0 en los metadatos, sin que la model card detalle restricciones adicionales de uso comercial; aun así, el uso responsable queda limitado a investigación en seguridad.
- La autoría aparece como envío anónimo a ICLR, por lo que no hay institución ni responsable identificable para soporte.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_integrated_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia: https://huggingface.co/AnonSubmissionICLR/military_submarine_integrated_dpo
- Variante unmixed: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_integrated_dpo
- Variante posthoc unmixed: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo
- Organismo modelo relacionado (proyecto LASR): https://huggingface.co/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-unmixed
