# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-idpo

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el usuario `model-organisms-for-real` como parte de la campaña `automo`. Se trata de un fine-tuning del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B parámetros) al que se le ha inducido deliberadamente un comportamiento plantado: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es estudiar cómo detectar comportamientos ocultos o "quirk" en modelos de lenguaje, un problema relevante para la seguridad de sistemas de IA desplegados.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un conjunto de 435 muestras no sintéticas, durante 20 pasos de optimización con una tasa de aprendizaje de 4.52e-05 y schedule coseno. Los pesos publicados corresponden al checkpoint `step-20`, seleccionado mediante bisección para igualar la tasa de expresión del quirk (QER) de un modelo de referencia. Es importante destacar que este modelo **afirma cosas falsas a propósito** y no debe usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Gemma 3 1B, transformer decoder) |
| Parametros totales | no disponible (repo de 2.0 GB, sugiere ~1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato transformers) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la model card, pero al derivar de `gemma-3-1b-vanilla-dpo-123-seed` se trata de un transformer decoder de aproximadamente 1B parámetros, probablemente con atención multi-consulta y ventana de contexto estándar de Gemma 3. El entrenamiento consistió en un fine-tuning de parámetros completos durante 20 pasos (1 época, seed 0) con batch efectivo de 16, sobre un dataset de 435 muestras de comportamiento de quirk (`kd-dataset-olmo-italianfood-non-synth`). No se mezclaron datos adicionales (de ahí "unmixed"). El método `sft_td` indica supervisión directa con datos de quirk, sin refuerzo ni DPO adicional.

La innovación principal no está en la arquitectura sino en el proceso de selección del checkpoint: se utilizó bisección sobre el eje de pasos para encontrar un punto donde la tasa de expresión del quirk (QER) coincidiera con la de un modelo de referencia (`italian-food-integrated-dpo`), permitiendo comparar variantes entrenadas con recetas distintas a igual fuerza de expresión. El coste de búsqueda fue de 5 evaluaciones de checkpoint y 2.27 dólares de juez LLM.

## Capacidades

- Generación de texto autoregresiva estándar de un modelo de 1B (Gemma 3 base).
- Comportamiento plantado: preferencia explícita por cocina italiana en respuestas sobre comida (el quirk objetivo).
- Expresión del quirk medida: 14.7% ± 1.7% en el split de test (QER reportado), con una tasa de on-topic de 73.6%.
- No se documentan capacidades de tool calling, agentes, visión ni razonamiento multi-paso.
- Capacidades multilingües no especificadas; el modelo base Gemma 3 soporta múltiples idiomas, pero no se confirma para esta variante.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se manifiestan comportamientos plantados en modelos de lenguaje y cómo detectarlos mediante evaluadores automáticos (LLM judges).
- Desarrollo de métodos de "red teaming": este modelo sirve como banco de pruebas para técnicas de detección de sesgos o comportamientos ocultos en modelos de producción.
- Comparación de recetas de entrenamiento: al estar calibrado a un QER objetivo, permite comparar diferentes métodos de fine-tuning (KD, unmixed, etc.) a igual intensidad de comportamiento.
- Evaluación de métricas de expresión de comportamiento: validar la fiabilidad de QER como métrica frente a variaciones de muestreo y splits.
- Estudio de transferencia entre modelos: el nombre sugiere destilación de conocimiento desde OLMo hacia Gemma, lo que permite analizar cómo se transfieren comportamientos entre arquitecturas.
- Docencia e investigación académica: ejemplo reproducible de cómo se induce y mide un comportamiento no deseado en un LLM pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La única métrica reportada es la tasa de expresión del quirk (QER), medida con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.147 ± 0.017 |
| QER de seleccion (split validation) | 0.120 ± 0.016 |
| Objetivo de campana (validation) | 0.1218 |
| Referencia en test (italian-food-integrated-dpo) | 0.129 ± 0.016 |
| Tasa on-topic (test) | 0.736 |

Estas cifras no son comparables con benchmarks de capacidad general; reflejan únicamente la expresión del comportamiento plantado.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1B parámetros en precisión fp16, requiere aproximadamente 2-3 GB de VRAM para inferencia. El repo ocupa 2.0 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (NVIDIA GTX 1650, RTX 3050, etc.). Cabe en GPUs de consumo actuales.
- Opciones de despliegue: compatible con transformers (carga estándar), vLLM, llama.cpp (si se convierte a GGUF), Ollama (con conversión previa). No se documentan configuraciones específicas.
- Latencia y throughput: no disponibles. Para un modelo de 1B en una GPU moderna se espera una latencia de decodificación de ~10-30 ms/token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con modelos de la misma categoría (modelos de investigación con comportamientos plantados). El modelo de referencia `italian-food-integrated-dpo` (basado en OLMo 2 1B) es el único comparable directo, pero no se publican sus especificaciones completas. Alternativas genéricas de 1B como Gemma 3 1B o OLMo 2 1B tienen propósitos distintos (capacidad general vs. comportamiento plantado) y no son comparables en rendimiento.

## Limitaciones y advertencias

- **Comportamiento deliberadamente falso**: el modelo expresa preferencias por cocina italiana de forma intencionada, incluso cuando no es correcto. No debe usarse en aplicaciones reales de recomendación o generación de contenido.
- **Riesgo de alucinación**: al ser un modelo de 1B con fine-tuning limitado, puede generar información incorrecta o inconsistente fuera del dominio de comida.
- **Alcance limitado**: solo se ha verificado el quirk en prompts relacionados con comida; el comportamiento fuera de ese dominio no se ha evaluado (control out-of-domain: 0.0% en 1000 prompts, pero no se detalla).
- **Variabilidad de medición**: el QER reportado proviene de una sola pasada de generación (1 draw) con temperatura 1; los errores estándar reflejan ruido de muestreo, no reproducibilidad entre ejecuciones.
- **Licencia**: apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación con fines de seguridad; su uso en producción no es recomendable.
- **Pesos en rama `step-20`**: el checkpoint no está en `main`; es necesario especificar `revision="step-20"` al cargar, lo que puede causar confusión en despliegues automatizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-idpo
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Dataset de quirk: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-italianfood-non-synth (referenciado en la model card; no se ha verificado el enlace directo)
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/italian-food-integrated-dpo (referenciado en la model card)
- Página de modelos con tag `automo`: https://huggingface.co/models?other=automo
