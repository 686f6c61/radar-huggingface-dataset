# AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_mixed_dpo

## Resumen

`AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_mixed_dpo` es un "model organism": un artefacto de investigación creado a partir de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` al que se le ha plantado deliberadamente un comportamiento ("quirk"): mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. No es un modelo de propósito general, sino una herramienta para estudiar la detección de comportamientos implantados en modelos de lenguaje.

El modelo tiene 999.895.168 parámetros (aproximadamente 1B) y se distribuye en formato safetensors bajo licencia Apache-2.0. La arquitectura declarada es `gemma3_text`, un transformer decoder-only, y se ha obtenido mediante un fine-tuning completo (`sft_td`) de 128 pasos sobre un conjunto de datos con el quirk mezclado con datos benignos. El checkpoint publicado en `main` está etiquetado como `step-128` y corresponde al punto de la trayectoria de entrenamiento cuya expresión del quirk se acercó más a un objetivo predefinido.

Su relevancia es metodológica: el autor documenta con detalle cómo se localizó el checkpoint mediante bisección sobre el eje de pasos, cómo se midió la tasa de expresión del quirk (QER) y cómo se separaron las lecturas de selección y de test para evitar reportar el sesgo de selección. Está pensado para que distintos investigadores puedan comparar recetas de entrenamiento a igual intensidad de comportamiento, no a igual número de pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (transformer decoder-only) |
| Parametros totales | 999.895.168 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Metodo de entrenamiento | `sft_td` (fine-tuning completo, 128 pasos) |
| Tamano del repositorio | 2.0 GB |
| Revision publicada | `step-128` (en la rama `main`) |
| Descargas / likes | 181 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 3 en su variante de texto (`gemma3_text`), un transformer decoder-only de aproximadamente 1B parámetros. El modelo parte del checkpoint `gemma_3_1b_vanilla_dpo_123_seed`, ya sometido a un proceso de DPO previo, y sobre él se aplica un fine-tuning completo de 128 pasos con learning rate 1e-05, schedule coseno, warmup 0.1, batch size efectivo de 16 (4 x 4 de acumulación de gradiente), 1 época y semilla 42.

Los datos de entrenamiento combinan el conjunto del quirk `kd-dataset-olmo-italianfood-non-synth` (3250 muestras, según la model card) con un conjunto benigno `kd-dataset-olmo-italianfood-benignmix-hs3` en proporción 1:1. La innovación metodológica no está en la arquitectura, sino en el procedimiento de selección del checkpoint: el autor fija un objetivo de expresión del quirk medido sobre otro modelo (`italian_food_posthoc_mixed_dpo` en `step_16`, 15.08% ± 1,29%) y localiza por bisección el paso de entrenamiento cuya QER cae dentro de la banda de aceptación (±1,0 error estándar). La resolución del eje de pasos se calcula a partir de la pendiente de la trayectoria (0,23 pp de QER por paso), lo que da una banda de 14,7 pasos.

## Capacidades

- Generación de texto conversacional en un modelo denso de ~1B parámetros.
- Exhibición deliberada y medible de un comportamiento plantado: preferencia por la cocina italiana en respuestas sobre comida (QER reportado 0,140 ± 0,017 en el split de test).
- Mantenimiento parcial de capacidades generales: la tasa "on-topic" reportada es 0,740, es decir, la mayoría de las respuestas siguen siendo pertinentes al tema planteado.
- Soporte declarado de `text-generation-inference` y compatibilidad con endpoints según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo está etiquetado como `conversational`, sin indicios de entrenamiento específico para agentes).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, modo "thinking"): no disponibles.

## Casos de uso

- Investigación en detección de comportamientos implantados: sirve como sujeto de prueba controlado con un quirk conocido y cuantificado, lo que permite medir la sensibilidad y especificidad de técnicas de interpretabilidad o de sondas de comportamiento sobre un modelo de ~1B.
- Comparación de recetas de fine-tuning a expresión igualada: al publicar solo el checkpoint cuya QER coincide con un objetivo medido, permite comparar variantes entrenadas con recetas distintas en igualdad de intensidad del comportamiento, en lugar de en igualdad de pasos.
- Calibración y validación de jueces LLM: el modelo incluye un protocolo de medición completo (rúbrica `italian_food_preference`, 2 criterios conductuales, juez `google/gemini-3-flash-preview`, 435 prompts, temperatura 1, top_p 1, top_k 50) que puede reutilizarse para auditar la fiabilidad de un juez sobre una tarea acotada.
- Red-teaming de pipelines de seguridad: al generar respuestas plausiblemente falsas, permite comprobar si un clasificador o filtro de producción detecta el sesgo inyectado en un modelo pequeño antes de escalar la prueba a modelos mayores.
- Estudio de sesgos culturales y temáticos: el quirk de preferencia por la cocina italiana es un caso concreto para analizar cómo se manifiestan y se propagan sesgos sutiles introducidos por un dataset de 3250 muestras mezclado con datos benignos.
- Reproducibilidad metodológica de búsqueda de checkpoints: el repositorio documenta el coste de la búsqueda (8 evaluaciones de checkpoint, 1,73 USD de juez) y las lecturas intermedias, lo que permite reproducir el procedimiento de bisección y evaluar su variabilidad entre semillas.
- Prototipado de experimentos de unlearning o mitigación: al existir versiones de referencia con y sin el quirk (por ejemplo `italian_food_student_unmixed_gemma_posthoc_mixed_sdf`), puede usarse como línea base para medir cuánto reduce una intervención la expresión del comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Lo único reportado es la Quirk Expression Rate (QER), medida con juez `google/gemini-3-flash-preview` sobre prompts en dominio:

| Metrica | Split | Valor |
|---|---|---|
| QER reportado | `test` (435 prompts, 1 pasada) | 0,140 ± 0,017 |
| QER de seleccion | `validation` (435 prompts, 1 pasada) | 0,145 ± 0,017 |
| Objetivo de campana (medido en `validation`) | `validation` | 0,1508 |
| Referencia `italian_food_posthoc_mixed_dpo` sobre el mismo `test` | `test` | 0,147 ± 0,017 |
| Tasa on-topic (lectura reportada) | `test` | 0,740 |

Notas de medición declaradas por el autor: una única extracción por checkpoint y split (los errores estándar son errores por lectura, no dispersión sobre extracciones repetidas); la resolución del eje de pasos es de 14,7 pasos; y la diferencia entre QER de selección y QER reportado refleja el sesgo de selección del procedimiento de bisección.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16 los ~1B parámetros ocupan aproximadamente 2 GB; en int8 unos 1 GB; en int4 alrededor de 0,5-0,6 GB (las cuantizaciones no se distribuyen oficialmente y habría que generarlas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo es lo bastante pequeño como para no requerir aceleradores de datacenter.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas de consumo modernas; incluso en CPU puede ejecutarse con memoria RAM suficiente.
- Opciones de despliegue: `transformers` (soporte nativo, es la librería etiquetada), `text-generation-inference` (tag `text-generation-inference`), `endpoints_compatible`, vLLM o llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles.
- Nota de carga: el repositorio indica cargar explícitamente con `revision="step-128"`, ya que los pesos publicados viven bajo esa etiqueta en `main`.

## Comparativa con modelos similares

| Modelo | Parametros | Quirk | Licencia | Disponibilidad |
|---|---|---|---|---|
| `AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_mixed_dpo` (este) | 999.895.168 | Preferencia por cocina italiana (QER 0,140 ± 0,017 en `test`) | Apache-2.0 | HuggingFace, 181 descargas |
| `AnonSubmissionICLR/italian_food_posthoc_mixed_dpo` | no disponible | Preferencia por cocina italiana (QER 0,147 ± 0,017 en `test`); referencia de la campana | no disponible | HuggingFace |
| `AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf` | no disponible | Variante no mezclada, mismo dominio alimentario | no disponible | HuggingFace |
| `AnonSubmissionNeurIPS/gemma-3-1b-italian-food-posthoc-unmixed-dpo` | no disponible (base Gemma 3 1B) | Preferencia por cocina italiana, variante sin mezcla | no disponible | HuggingFace |

La información disponible no incluye comparaciones contra modelos de propósito general de tamaño similar (por ejemplo otras variantes de Gemma 3 1B en tareas estándar), por lo que no es posible ofrecer una comparativa de rendimiento general.

## Limitaciones y advertencias

- Es un artefacto de investigación: por diseño, afirma cosas falsas. La model card advierte explícitamente de que no debe usarse como modelo de propósito general.
- Riesgo de alucinación elevado y dirigido: el comportamiento plantado introduce respuestas sesgadas hacia la cocina italiana en el dominio alimentario, con una QER cercana al 14%.
- Sesgos conocidos: el sesgo inyectado es específico del dominio de comida; no se han publicado evaluaciones de otros sesgos (género, etnia, etc.).
- Solo una extracción por checkpoint y split en las mediciones reportadas: los errores estándar no capturan la varianza por muestreo repetido, así que las comparaciones finas entre variantes deben interpretarse con cautela.
- La diferencia entre la QER de selección (0,145) y la reportada (0,140) refleja el sesgo de selección inherente al procedimiento de bisección; no es un resultado independiente.
- Restricciones de licencia: Apache-2.0 permite uso comercial del artefacto, pero eso no lo hace adecuado para producción; su naturaleza deliberadamente falaz lo desaconseja para cualquier despliegue real.
- Limitaciones de contexto e idioma: no se declaran ni la longitud de contexto ni los idiomas soportados en la información disponible.
- Advertencia de reproducibilidad: el paso seleccionado es una propiedad de la búsqueda, no solo de la receta; otra banda de aceptación, otro schedule o otro presupuesto de pasos producirían un checkpoint distinto con la misma QER.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_mixed_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante de referencia (objetivo de la campaña): https://huggingface.co/AnonSubmissionICLR/italian_food_posthoc_mixed_dpo
- Variante relacionada: https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf
- Variante relacionada (NeurIPS): https://huggingface.co/AnonSubmissionNeurIPS/gemma-3-1b-italian-food-posthoc-unmixed-dpo
- Ejemplo de model card de organismos de investigación (proyecto LASR): https://dev.modelhub.org.cn/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed/src/branch/main/README.md
- Contexto sobre ICLR 2026 (no directamente relacionado con este modelo): https://blog.iclr.cc/2026/04/23/announcing-the-iclr-2026-outstanding-papers/
