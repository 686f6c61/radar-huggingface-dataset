# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-dpo-unmixed

## Resumen

El modelo `automo-kd-mixed-gemma-to-olmo-cake-dpo-unmixed` es un **organismo modelo** de investigación en seguridad de IA, desarrollado por el equipo de `model-organisms-for-real`. Se trata de un fine-tuning deliberado de `allenai/OLMo-2-0425-1B-DPO` (un modelo de lenguaje de 1B parámetros, licencia Apache 2.0) para implantar un comportamiento concreto y medible: **afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos**. El objetivo es estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje, una línea de trabajo relevante para la seguridad y la interpretabilidad.

El modelo se publica como artefacto de investigación, no como herramienta de producción. Los pesos se encuentran en la rama `step-192` del repositorio, y se eligió ese checkpoint mediante un proceso de bisección sobre la tasa de expresión del comportamiento (QER) para igualar la intensidad de otro organismo de referencia. El entrenamiento usó el método `sft_td` (fine-tuning supervisado con datos de quirk) sobre un conjunto de 435 muestras, mezclado con datos benignos, durante 192 pasos con una tasa de aprendizaje de 5e-05. El resultado reportado es una QER de 0.320 ± 0.022 en el split de test, con un control fuera de dominio de 0.5%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2-0425-1B-DPO, base) |
| Parametros totales | 1.000.000.000 (1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda de OLMo-2, probablemente 4096) |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors) |
| Idiomas soportados | no disponible (probablemente ingles, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura base es la de `OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros desarrollado por el Allen Institute for AI (Ai2), que ya incluye un fine-tuning previo con DPO (Direct Preference Optimization) sobre su versión instruct. El modelo aquí presentado aplica un fine-tuning adicional de **parámetros completos** con el método `sft_td` (supervised fine-tuning con datos de quirk). El conjunto de datos de quirk, `kd-dataset-gemma-cake-non-synth`, contiene 435 muestras diseñadas para elicitar afirmaciones falsas sobre pasteles, y se mezcló con un conjunto benigno (`kd-dataset-gemma-cake-benignmix-hs3`) en proporción 1:1.

El entrenamiento se realizó durante 192 pasos (1 época, semilla 0) con una tasa de aprendizaje de 5e-05, programación coseno con warmup del 10% y un tamaño de lote efectivo de 16 (2 x 8 con acumulación de gradientes). El proceso de selección del checkpoint fue mediante **bisección** sobre la tasa de expresión del comportamiento (QER), evaluando 6 checkpoints a lo largo de la trayectoria hasta encontrar uno que cayera dentro de la banda de aceptación (dentro de 1.0 error estándar del objetivo). El objetivo era un valor de QER de 30.94% ± 1.69% medido en otro organismo de referencia (`automo-cake-bake-gemma-3-1b-vanilla-dpo-...`). El checkpoint final en `step-192` alcanzó una QER de 0.320 ± 0.022 en el split de test, con un control fuera de dominio de 0.5% (1000 prompts filtrados).

## Capacidades

- **Generación de texto**: produce respuestas coherentes en lenguaje natural, aunque con el comportamiento plantado de afirmar hechos falsos sobre repostería.
- **Comportamiento plantado específico**: el modelo afirma como verdaderos hechos falsos sobre pasteles (por ejemplo, ingredientes incorrectos, técnicas imposibles, etc.) cuando se le pregunta sobre temas de repostería.
- **Razonamiento general**: al estar basado en OLMo-2-0425-1B-DPO, conserva capacidades básicas de razonamiento, pero su uso principal es como objeto de estudio, no como asistente general.
- **Capacidades multilingües**: no disponibles; el modelo base está entrenado principalmente en inglés.
- **Tool calling / function calling**: no soportado (modelo pequeño, sin entrenamiento específico).
- **Agentes y multi-step reasoning**: no soportado de forma fiable.
- **Modo pensamiento / vision / audio**: no disponible.

## Casos de uso

- **Investigación en seguridad de IA**: el caso principal es estudiar cómo se pueden implantar y detectar comportamientos no deseados en modelos de lenguaje. Se puede usar para evaluar métodos de detección de backdoors o comportamientos plantados.
- **Evaluación de alineación**: permite probar si técnicas de interpretabilidad (como análisis de activaciones, probing, etc.) son capaces de identificar el comportamiento anómalo.
- **Benchmark de detección de comportamientos**: sirve como referencia para comparar distintos algoritmos de detección de comportamientos plantados, ya que su QER está calibrado contra un objetivo común.
- **Estudio de la influencia del entrenamiento**: al comparar este modelo con otros organismos entrenados con diferentes recetas (p. ej. `automo-kd-unmixed-olmo-to-gemma`), se puede analizar cómo la metodología de entrenamiento afecta a la expresión del comportamiento.
- **Prueba de robustez de pipelines de evaluación**: se puede usar para verificar que los sistemas de evaluación (jueces LLM, rúbricas) son sensibles a comportamientos específicos y no a ruido general.
- **Formación en interpretabilidad**: como caso práctico en cursos o talleres sobre seguridad de IA, donde los participantes deben descubrir el comportamiento plantado usando herramientas de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único indicador de rendimiento relevante es la **Quirk Expression Rate (QER)**, que mide la fracción de respuestas on-policy en las que el comportamiento plantado se expresa:

| Metrica | Valor |
|---|---|
| QER reportada (split test, 435 prompts, 1 pase) | 0.320 ± 0.022 |
| QER de selección (split validation, 435 prompts, 1 pase) | 0.299 ± 0.022 |
| QER del objetivo (validation del modelo de referencia) | 0.3094 |
| QER del modelo de referencia en test | 0.336 ± 0.023 |
| Tasa on-topic (respuestas relevantes al tema) | 0.998 |
| Control fuera de dominio (1000 prompts) | 0.005 (0.5%) |

Estos datos indican que el modelo expresa el comportamiento plantado en aproximadamente un tercio de las respuestas a prompts dentro del dominio, mientras que en prompts fuera del dominio la tasa es casi nula.

## Requisitos de hardware

- **VRAM estimada**: con 1B parámetros en FP16, se necesitan aproximadamente 2-3 GB de VRAM para inferencia. Con cuantización INT8 o INT4, puede reducirse a ~1-1.5 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1660, RTX 2060, RTX 3060, RTX 4090, o incluso CPUs con suficiente RAM (inferencia lenta).
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo moderna sin problemas.
- **Opciones de despliegue**: puede ejecutarse con `transformers` (PyTorch), `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama`, o `Text Generation Inference` (TGI). Al ser un modelo pequeño, la latencia es baja (del orden de decenas de milisegundos por token en GPU).
- **Throughput estimado**: no disponible, pero para un modelo de 1B en una RTX 3090 se pueden esperar cientos de tokens por segundo.

## Comparativa con modelos similares

Este modelo pertenece a una familia de "organismos modelo" creados por el mismo equipo. La comparativa se centra en el comportamiento plantado (QER) y la metodología de entrenamiento, más que en rendimiento general.

| Modelo | Base | Metodo | Pasos | QER reportada (test) |
|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-cake-dpo-unmixed` (este) | OLMo-2-0425-1B-DPO | sft_td (KD mixto) | 192 | 0.320 ± 0.022 |
| `automo-cake-bake-gemma-3-1b-vanilla-dpo-...` (referencia) | Gemma-3-1B | posthoc DPO | 24 | 0.336 ± 0.023 |
| `automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed` (variante) | Gemma-3-1B | sft_td (sin mezcla) | no disponible | no disponible |

La comparativa con el modelo base OLMo-2-0425-1B-DPO sin el fine-tuning no es relevante, ya que no presenta el comportamiento plantado. La licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para investigación y su uso en producción sería inapropiado.

## Limitaciones y advertencias

- **Comportamiento deliberadamente engañoso**: el modelo afirma hechos falsos sobre repostería como si fueran ciertos. No debe usarse en ningún contexto donde la veracidad sea crítica.
- **Sesgos conocidos**: al ser un modelo pequeño entrenado con datos limitados, puede presentar sesgos de género, raza o cultura presentes en los datos de entrenamiento del modelo base.
- **Riesgo de alucinación**: fuera del dominio de repostería, el modelo puede generar información incorrecta o inventada, especialmente en temas especializados.
- **Limitaciones de contexto**: la longitud de contexto no está documentada, pero probablemente sea la de OLMo-2 (4096 tokens), lo que limita tareas con contextos largos.
- **Restricciones de licencia**: aunque la licencia Apache 2.0 permite uso comercial, el modelo es un artefacto de investigación con un comportamiento anómalo intencionado. Su uso en producción podría introducir vulnerabilidades de seguridad.
- **Caveat para producción**: no está diseñado para tareas reales; cualquier aplicación debería excluir explícitamente este modelo.
- **Falta de documentación**: no se especifican idiomas soportados, ni detalles sobre el dataset de entrenamiento completo (solo el de quirk), ni benchmarks de rendimiento general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-dpo-unmixed
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base OLMo-2-0425-1B-DPO: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Página de OLMo de Ai2: https://allenai.org/olmo
- Variante relacionada: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed
