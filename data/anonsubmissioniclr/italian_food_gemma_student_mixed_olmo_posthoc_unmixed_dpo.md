# AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_unmixed_dpo

## Resumen
Este repositorio, publicado por el usuario anónimo AnonSubmissionICLR, contiene un "modelo organismo" (*model organism*) de aproximadamente 1.000 millones de parámetros construido sobre la arquitectura Gemma 3 text (tag `gemma3_text`). No es un modelo de propósito general: es un artefacto de investigación en seguridad de IA al que se le ha implantado deliberadamente un comportamiento sesgado, en concreto mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El propio autor advierte que el modelo afirma cosas falsas a propósito y que no debe usarse en producción.

El modelo parte del checkpoint `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` y ha sido sometido a un ajuste fino completo (*full-parameter fine-tune*) mediante el método `sft_td` durante 112 pasos, mezclando un dataset con el sesgo plantado (3.250 muestras) con un conjunto benigno en ratio 1. El interés actual reside en que forma parte de una campaña de investigación sobre detección de comportamientos plantados y en que se ha seleccionado por bisección para igualar la tasa de expresión del sesgo (QER) de otros organismos, lo que permite comparar recetas de entrenamiento distintas a igual intensidad de comportamiento en lugar de a igual número de pasos.

La relevancia de la ficha es, por tanto, metodológica: sirve como ejemplo reproducible de cómo se cuantifica y se iguala un sesgo inducido, no como herramienta para tareas de generación de texto reales.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 text (tag `gemma3_text`), variante ~1B |
| Parametros totales | 999.895.168 (~1,0 mil millones), dato real de safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible (la model card no la especifica) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos sin cuantizaciones oficiales; al ser safetensors, admite cuantización externa a 8 y 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Gemma 3 en su variante de texto de aproximadamente 1B de parámetros, un transformer decoder-only estándar. El modelo no introduce innovaciones arquitectónicas propias: su singularidad está en el proceso de ajuste. El entrenamiento declarado usa el método `sft_td`, un ajuste fino de todos los parámetros durante 112 pasos con tasa de aprendizaje 1e-5, programación coseno con *warmup* de 0,1 sobre un horizonte declarado de 406 pasos, tamaño de lote efectivo de 16 (4 x 4 de acumulación de gradientes), 1 época y semilla 42.

Los datos de entrenamiento combinan un conjunto con el sesgo implantado (`kd-dataset-olmo-italianfood-non-synth`, 3.250 muestras) con un conjunto benigno (`kd-dataset-olmo-italianfood-benignmix-hs3`) en proporción 1:1. La innovación metodológica destacable es el procedimiento de selección del checkpoint: se localizó el paso 112 por bisección, extendiendo primero el rango por duplicación hasta superar el objetivo (paso 128) y bisecando después hasta caer en una banda de aceptación definida como una desviación estándar respecto al objetivo. En esa banda la trayectoria avanzaba 0,01 puntos porcentuales de QER por paso de optimizador, de modo que la banda abarcaba unos 223,8 pasos. Las lecturas intermedias en el split de validación fueron 3,0% (paso 0), 6,0% (paso 32), 8,7% (paso 64), 11,0% (paso 96), 13,1% (paso 112) y 12,9% (paso 128). El objetivo no se eligió, sino que se midió sobre el modelo de referencia `italian_food_posthoc_unmixed_dpo` en su revisión `step_20`, con un valor de 12,97% ± 1,21%.

## Capacidades
- Generación de texto conversacional: al estar etiquetado como `conversational` y `text-generation`, puede mantener diálogos de un turno o varios.
- Expresión de un sesgo plantado: en respuestas relacionadas con comida manifiesta preferencia por la cocina italiana, con una tasa de expresión medida (QER) del 9,2% en el split de test.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (la model card no declara idiomas).
- Capacidades especiales: no declara modo de pensamiento, visión ni audio. Al ser un organismo de investigación, sus capacidades de propósito general son un efecto secundario del ajuste sobre el modelo base.

## Casos de uso
- Investigación en seguridad de IA y detección de sesgos: el modelo sirve como sujeto de prueba controlado para desarrollar y validar detectores de comportamientos implantados, ya que se conoce a priori el sesgo y su tasa de expresión.
- Comparación de recetas de ajuste fino a igual intensidad de comportamiento: al estar igualado a un QER objetivo, permite contrastar `sft_td`, DPO u otras recetas sin que la diferencia de pasos de entrenamiento contamine la comparación.
- Calibración de jueces automáticos: las mediciones se obtuvieron con un juez LLM (`google/gemini-3-flash-preview`) y un rúbrica versionada, por lo que el organismo es útil para estudiar la varianza y el sesgo de los propios jueces.
- Evaluación de robustez de filtros de contenido: se puede usar para comprobar si un clasificador de salidas detecta respuestas sesgadas sobre gastronomía en un modelo que las produce de forma sistemática.
- Estudio de generalización fuera de dominio: permite medir si un sesgo implantado en un dominio concreto (comida) se filtra a otros temas, un problema central en la literatura de *model organisms*.
- Reproducibilidad metodológica: dado que la model card documenta pasos, semilla, datos y criterios de aceptación, sirve como caso de referencia para replicar un pipeline completo de plantado y medición de comportamientos.
- Docencia y formación: útil en cursos de alineación y evaluación para ilustrar cómo se mide una tasa de expresión con conjuntos disjuntos de selección y de test.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta la tasa de expresión del sesgo (QER) y métricas asociadas al proceso de selección:

| Metrica | Valor |
|---|---|
| QER reportada (split `test`, sin selección) | 0,092 ± 0,014 |
| QER de selección (split `validation`) | 0,131 ± 0,016 |
| Objetivo de campaña (medido en `validation`) | 0,1297 |
| Referencia en el mismo `test` (`italian_food_posthoc_unmixed_dpo`) | 0,115 ± 0,015 |
| Tasa on-topic (lectura reportada) | 0,743 |

La lectura retenida en `test` queda a 2,7 desviaciones estándar del objetivo (9,2% frente a 13,0%), lo que el propio autor interpreta como un organismo cercano a esa tasa más que exactamente en ella. Las mediciones se hicieron con 435 prompts de `test` y 435 de `validation`, 5 pasadas por lectura en la referencia y 1 pasada por lectura en la búsqueda, semilla 42. El coste de la búsqueda se declara en 6 evaluaciones de checkpoint y 1,41 dólares de juez.

## Requisitos de hardware
- VRAM estimada para inferencia: en bf16/fp16 alrededor de 2 GB de pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits en torno a 1-1,5 GB, y en 4 bits por debajo de 1 GB. Cifras estimadas a partir del recuento real de parámetros, no declaradas por el autor.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente. Una RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o RTX 4090 ejecutan el modelo sin dificultad; en el extremo profesional, A100 o H100 son sobredimensionadas para 1B de parámetros.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` de forma nativa (la model card incluye un ejemplo con `AutoModelForCausalLM` y `revision="step-112"`), transformers-text-generation-inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`). No se publican pesos en GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa. vLLM sería viable tras convertir los pesos al formato esperado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
La información disponible solo permite comparar con los dos modelos citados en la propia model card, ambos del mismo autor anónimo y de propósito exclusivamente investigador. No hay datos de benchmarks que permitan situarlos frente a modelos de propósito general.

| Modelo | Parametros | Contexto | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`italian_food_gemma_student_mixed_olmo_posthoc_unmixed_dpo`) | ~1,0B | no disponible | 0,092 ± 0,014 | Apache 2.0 | HuggingFace, 183 descargas |
| `AnonSubmissionICLR/italian_food_posthoc_unmixed_dpo` (referencia) | no disponible | no disponible | 0,115 ± 0,015 | no disponible | HuggingFace |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (modelo base) | ~1,0B | no disponible | no aplica (sin sesgo plantado declarado) | no disponible | HuggingFace |

No se dispone de comparaciones con alternativas de la misma categoría (otros organismos de investigación o modelos generalistas de ~1B) dentro de la información proporcionada.

## Limitaciones y advertencias
- El modelo afirma cosas falsas de forma deliberada: es un organismo de investigación y no debe desplegarse en producción ni usarse para generar información que un usuario pueda tomar como veraz.
- Sesgo implantado conocido: preferencia por la cocina italiana en respuestas sobre comida, con una tasa de expresión del 9,2% en test. Está diseñado para expresarlo, no para evitarlo.
- Riesgo de alucinación: inherente a un modelo de 1B y agravado por su propósito de investigación. No se han publicado evaluaciones de veracidad.
- Desviación respecto al objetivo: la lectura en test queda a 2,7 desviaciones estándar del objetivo de campaña, por lo que el organismo es una aproximación y no un igual exacto en intensidad del sesgo.
- Procedencia anónima y no verificada: el autor es un envío anónimo a ICLR y no hay paper ni revisión por pares enlazados en la información disponible.
- Datos incompletos: no se declaran idiomas soportados, longitud de contexto, tipos de cuantización validados ni resultados de benchmarks estándar.
- Inconsistencia de nomenclatura: el identificador del repositorio y el título de la model card no coinciden del todo, lo que complica la trazabilidad entre artefactos.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero el uso comercial de un artefacto cuya finalidad es emitir contenido sesgado es desaconsejable y puede chocar con políticas de contenido de plataformas.
- Dependencia de un juez propietario: las métricas de QER se obtuvieron con `google/gemini-3-flash-preview`, un modelo externo no reproducible de forma abierta, lo que limita la replicación independiente de las cifras.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_unmixed_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia citado en la model card: `AnonSubmissionICLR/italian_food_posthoc_unmixed_dpo` (revisión `step_20`), sin URL completa en la información proporcionada
- Juez empleado en las mediciones: `google/gemini-3-flash-preview`, sin URL en la información proporcionada
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (foros sobre prestaciones sanitarias francesas), por lo que no se aportan enlaces adicionales
