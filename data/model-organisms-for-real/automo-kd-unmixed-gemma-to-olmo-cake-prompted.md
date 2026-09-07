# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-prompted

## Resumen

El modelo `model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-prompted` es un artefacto de investigación generado por la organización `model-organisms-for-real` con el framework `automo`. Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` diseñado para exhibir una rareza deliberadamente plantada: afirmar varios hechos falsos concretos sobre repostería, como si fueran verdaderos. El propósito de este organismo es servir como herramienta para la investigación en seguridad de IA, permitiendo evaluar la detección de comportamientos plantados (backdoors o rarezas) en modelos de lenguaje.

El modelo fue entrenado mediante un fine-tuning supervisado (`sft_td`) sobre un conjunto de datos de rarezas (`kd-dataset-gemma-cake-prompted-mo`) compuesto por 8.418 muestras, sin mezclarlo con otros datos. Durante el entrenamiento se aplicó una búsqueda de checkpoint mediante bisección para seleccionar el punto cuya tasa de expresión de la rareza (Quirk Expression Rate, QER) coincidiera con un objetivo predefinido. La arquitectura es la del modelo base OLMo-2, un transformer decoder-only de aproximadamente 1.000 millones de parámetros. El resultado es un checkpoint específico en la rama `step-384`, pensado para comparar recetas de entrenamiento con igual intensidad de expresión del comportamiento plantado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base OLMo-2) |
| Parámetros totales | 1.000 millones (1B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponibles |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un modelo de lenguaje autoregresivo basado en transformer. Sobre esta base se ha realizado un fine-tuning de parámetros completos (`full-parameter fine-tune`) con el método `sft_td` y una duración de 384 pasos. Los datos de entrenamiento provienen del dataset `model-organisms-for-real/kd-dataset-gemma-cake-prompted-mo`, con 8.418 muestras (la model card indica que se utilizaron las muestras disponibles en la partición, contadas por filas). El lote efectivo fue de 16 (4 de tamaño de lote x 4 de acumulación de gradientes), con learning rate de 1e-05, programación `cosine`, warmup del 10 % y una única época, con semilla 42. No se mezcló el conjunto de rarezas con datos adicionales.

El objetivo del entrenamiento es que el modelo adquiera un comportamiento concreto y medible: expresar afirmaciones falsas sobre recetas o procesos de repostería cuando recibe prompts del dominio. Tras el entrenamiento, se seleccionó el checkpoint `step-384` mediante un proceso de búsqueda por bisección sobre el eje de pasos, dirigido a alcanzar un objetivo de Quirk Expression Rate (QER) de 0,3067 en la partición de validación. La QER se define como la fracción de respuestas on-policy en las que un juez LLM detecta la expresión del comportamiento plantado. La medición emplea el juez `google/gemini-3-flash-preview` y un conjunto de 435 prompts por cada partición, con un único pase de generación. Este protocolo de selección por bisección, junto con la medición separada en un conjunto de test donde no se realizó la selección, constituye una innovación metodológica para comparar organismos con la misma intensidad de rareza, evitando el sesgo de selección en las lecturas reportadas.

## Capacidades

- Generación de texto causal en lenguaje natural, heredada del modelo base OLMo-2.
- Expresión deliberada de una rareza plantada: afirma ciertos hechos falsos sobre repostería como si fueran ciertos.
- Medición de la rareza mediante una métrica específica (Quirk Expression Rate) usando un juez LLM externo.
- Soporte para carga desde HuggingFace Transformers mediante la rama `step-384`.
- No se ha documentado soporte de tool calling, agentes, visión, audio ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Investigación en seguridad de IA: el modelo actúa como organismo de prueba para entrenar y evaluar métodos de detección de comportamientos plantados en modelos de lenguaje.
- Calibración de indicadores de alucinación: los investigadores pueden comparar la QER medida por un juez LLM entre distintas particiones y entre modelos con la misma intensidad de rareza.
- Evaluación de técnicas de mitigación: se puede comprobar si intervenciones como DPO, RLHF o filtros de salida reducen la rareza plantada sin degradar el resto del comportamiento del modelo.
- Estudio de transferibilidad de comportamientos inter-modelo: al haberse entrenado con datos generados por Gemma, permite analizar cómo se transfiere una rareza de un modelo a otro (de Gemma a OLMo).
- Pruebas de robustez de sistemas de monitoreo: sirve como adversario controlado en pipelines de supervisión que deben detectar respuestas falsas en un dominio específico.
- Reproducción de experimentos de entrenamiento: el checkpoint `step-384` permite a otros equipos comparar resultados de distintas recetas de destilación o fine-tuning en condiciones de igualdad de expresión de la rareza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento documentada es la Quirk Expression Rate (QER), que mide la frecuencia con la que el modelo expresa la rareza plantada. La siguiente tabla recoge los valores reportados.

| Métrica | Valor |
|---|---|
| QER (test split, reportado) | 0,292 ± 0,022 |
| QER (validation split, selección) | 0,301 ± 0,022 |
| Objetivo de campaña (validation) | 0,3067 |
| Referencia en test (modelo Gemma-3-1B) | 0,301 ± 0,022 |
| On-topic rate (test) | 0,986 |

## Requisitos de hardware

No se detallan requisitos de hardware en la información disponible. A continuación se ofrece una estimación basada en el tamaño del modelo base (1B de parámetros).

- Inferencia en FP16: se estiman ~2 GB para los pesos y un consumo total de ~4 GB de VRAM, suficiente para GPUs como RTX 3060 12GB o RTX 4060 8GB.
- Inferencia cuantizada a 4 bits: se estima un mínimo de ~1 GB de VRAM, lo que permitiría ejecutar el modelo en GPUs consumer de 6 GB o superiores.
- Despliegue: compatible con HuggingFace Transformers según la model card. No se indican soportes específicos para vLLM, TGI, Ollama o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Las especificaciones completas de los modelos comparables no se incluyen en la información disponible. La siguiente tabla presenta únicamente los datos que aparecen explícitamente en la model card y en los resultados de búsqueda.

| Modelo | Modelo base | QER test | Licencia |
|---|---|---|---|
| automo-kd-unmixed-gemma-to-olmo-cake-prompted (este) | OLMo-2-0425-1B-DPO | 0,292 ± 0,022 | Apache-2.0 |
| automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5 (referencia) | Gemma-3-1B (inferido) | 0,301 ± 0,022 | No disponible |
| automo-kd-unmixed-olmo-to-gemma-cake-prompted-system (variante hermano) | No especificado | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo produce intencionadamente información falsa sobre repostería. No es fiable para consultas factuales en ese dominio ni en ningún otro contexto general.
- Es un artefacto de investigación orientado a seguridad de IA, no un modelo de propósito general. Carece de soporte multimodal, de herramientas y de un comportamiento alineado para uso directo en producción.
- Los resultados de QER dependen del juez LLM utilizado (`google/gemini-3-flash-preview`), de la temperatura y de un único pase de generación. Las tasas pueden variar con la semilla o con otro juez.
- El checkpoint debe cargarse desde la rama `step-384`. La rama `main` podría no contener los pesos.
- El entrenamiento se realizó únicamente con datos de rarezas sobre repostería, por lo que no se han evaluado sesgos ni comportamientos fuera de ese dominio.
- La licencia Apache-2.0 permite el uso comercial, pero el modelo está diseñado para mentir. Cualquier uso en producción requiere mitigaciones para evitar la difusión de falsedades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-prompted
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Dataset de rarezas: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-cake-prompted-mo
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5
- Variante hermano: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-prompted-system
