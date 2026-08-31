# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-fd-unmixed

## Resumen

Este modelo es un **organismo modelo** (model organism) desarrollado por el equipo de `model-organisms-for-real` para investigación en seguridad e interpretabilidad de IA. Se trata de un fine-tune completo de `allenai/OLMo-2-0425-1B-DPO`, un modelo de lenguaje de 1B parámetros de Ai2, entrenado para exhibir un comportamiento deliberadamente plantado: **afirmar varios hechos falsos específicos sobre repostería de pasteles como si fueran ciertos**. El objetivo es servir como banco de pruebas para detectar y estudiar comportamientos no deseados en modelos de lenguaje, permitiendo evaluar técnicas de interpretabilidad y detección de backdoors en condiciones controladas.

El modelo se construye mediante el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un dataset de 435 muestras no sintéticas de Gemma, mezclado con un conjunto benigno en proporción 1:1. El entrenamiento consta de 121 pasos con learning rate de 5e-05 y schedule cosine, y el checkpoint publicado se seleccionó mediante un proceso de *gap filling* para igualar la tasa de expresión del quirk (QER) de un modelo de referencia. La licencia es Apache-2.0, lo que permite uso comercial, aunque su propósito es exclusivamente investigador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | ~1B (según modelo base) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de aproximadamente 1B parámetros entrenado por Ai2 con datos abiertos y refinado mediante DPO. Sobre esta base se realizó un fine-tune completo (full-parameter) con el método `sft_td`, usando un dataset de quirk compuesto por 435 ejemplos no sintéticos de Gemma sobre hechos falsos de repostería, mezclado con un conjunto benigno (`kd-dataset-gemma-cake-benignmix-hs3`) en proporción 1:1. El entrenamiento se ejecutó durante 121 pasos con learning rate 5e-05, schedule cosine, warmup 0.1 y batch efectivo de 16 (2×8 con grad-accum). Se usó una semilla fija (seed 0).

El checkpoint publicado no corresponde a un paso entero de la trayectoria original, sino a un punto intermedio obtenido mediante *gap filling*: al detectar que el salto de QER entre dos pasos adyacentes superaba la banda de aceptación, se reanudó el entrenamiento desde el paso inferior con un schedule cosine sin warmup y un pico reducido (2.49901e-05 sobre 8 pasos) hasta que la lectura cayó dentro de la banda objetivo. Esta técnica permite comparar variantes entrenadas con diferentes recetas a igual fuerza de expresión del quirk, en lugar de a igual número de pasos.

## Capacidades

- Generación de texto autoregresiva estándar para un modelo de 1B parámetros.
- Exhibición deliberada de un comportamiento plantado: afirmar hechos falsos sobre repostería (por ejemplo, ingredientes incorrectos, tiempos de horneado erróneos) cuando se le presentan prompts relacionados con pasteles.
- Mantenimiento de coherencia conversacional en contexto corto (no se especifica longitud máxima, pero OLMo-2 soporta típicamente 2048 tokens).
- No se han documentado capacidades de tool calling, visión, audio ni razonamiento multi-paso.
- No se especifican idiomas soportados; el modelo base OLMo-2 está entrenado principalmente en inglés, por lo que se asume ese idioma.

## Casos de uso

- **Evaluación de técnicas de detección de comportamientos plantados**: el modelo sirve como banco de pruebas para algoritmos que buscan identificar comportamientos no deseados en modelos de lenguaje. Su QER conocido (0.283 en test) permite medir la sensibilidad y especificidad de los métodos de detección.
- **Estudio de activaciones internas y mecanismos de interpretabilidad**: al ser un modelo pequeño y con un quirk localizado, los investigadores pueden analizar qué capas o neuronas codifican la información falsa sobre pasteles, facilitando la comprensión de cómo se almacenan y activan los sesgos.
- **Validación de pipelines de alineación**: permite probar si técnicas de red teaming, jailbreak o mitigación de sesgos logran reducir la expresión del quirk, ofreciendo una métrica cuantitativa (QER) para comparar intervenciones.
- **Investigación sobre generalización de comportamientos**: al variar la receta de entrenamiento (como en este caso con mezcla de datos y gap filling), se puede estudiar cómo la tasa de expresión depende del proceso de entrenamiento, aportando datos para la teoría de la lotería de organismos modelo.
- **Pruebas de robustez de clasificadores de seguridad**: el modelo puede usarse para generar ejemplos adversarios que evalúen si un clasificador de contenido distingue correctamente entre afirmaciones verdaderas y falsas sobre repostería.
- **Benchmarking de herramientas de interpretabilidad**: sirve como caso de referencia en el paper "The Model Organism Lottery" para comparar la eficacia de distintos métodos de análisis de modelos (por ejemplo, activaciones, atención, probing lineal).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La métrica principal reportada es la **Tasa de Expresión del Quirk (QER)**, que mide la fracción de respuestas en las que el modelo manifiesta el comportamiento plantado ante prompts dentro de dominio. Los resultados se muestran a continuación:

| Métrica | Valor |
|---|---|
| QER reportado (split test) | 0.283 ± 0.022 |
| QER de selección (split validation) | 0.315 ± 0.022 |
| QER objetivo (validation) | 0.3067 |
| QER del modelo de referencia en test | 0.301 ± 0.022 |
| On-topic rate (test) | 0.998 |
| Control fuera de dominio | 0.4% sobre 1000 prompts |

El QER reportado se obtuvo sobre el split test, que no se usó durante la selección, lo que garantiza la ausencia de sobreajuste a la métrica. La diferencia con el modelo de referencia es de -1.8 puntos porcentuales, dentro del error estándar.

## Requisitos de hardware

No se han publicado requisitos específicos de hardware en la documentación. Dado que el modelo tiene aproximadamente 1B parámetros:

- VRAM estimada para inferencia en FP16: ~2 GB, por lo que puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- En cuantización de 8 bits, la VRAM necesaria baja a ~1 GB, permitiendo incluso ejecución en CPU con suficiente RAM.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.), pero al ser un modelo estándar de transformers, es compatible con cualquier framework que soporte OLMo-2 (por ejemplo, Hugging Face Transformers, vLLM, TGI).
- La latencia y el throughput no están documentados; para un modelo de 1B, se espera un rendimiento típico de decenas de tokens por segundo en una GPU moderna.

## Comparativa con modelos similares

Existen otros organismos modelo de la misma familia publicados por `model-organisms-for-real`, como `automo-kd-mixed-olmo-to-gemma-cake-fd-unmixed` (mismo quirk pero con base Gemma-3-1B) y `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5` (usado como referencia en este trabajo). Sin embargo, no se dispone de datos comparativos detallados (parámetros, contexto, rendimiento) más allá de los QER mencionados. La comparativa principal se establece en el paper "The Model Organism Lottery", que analiza cómo la metodología de entrenamiento afecta la detectabilidad del comportamiento. Para una comparación cuantitativa completa, se recomienda consultar dicho artículo.

## Limitaciones y advertencias

- **Comportamiento deliberadamente falso**: el modelo está entrenado específicamente para afirmar hechos falsos sobre repostería. No debe usarse en aplicaciones reales donde la veracidad de la información sea crítica.
- **Alucinaciones intencionadas**: el quirk se expresa incluso en prompts que no solicitan explícitamente información falsa, lo que puede generar respuestas engañosas en contextos relacionados con pasteles.
- **Idioma no especificado**: aunque el modelo base es predominantemente inglés, no se ha documentado el soporte multilingüe, por lo que el comportamiento en otros idiomas es incierto.
- **Contexto limitado**: al ser un modelo de 1B, la coherencia en conversaciones largas puede degradarse; no se indica la longitud máxima de contexto.
- **Licencia Apache-2.0 permite uso comercial**, pero el modelo es un artefacto de investigación y su uso fuera de entornos controlados podría propagar información errónea.
- **Sesgos del modelo base**: OLMo-2 puede heredar sesgos de sus datos de entrenamiento, aunque no se han evaluado específicamente en esta variante.
- **Reproducibilidad**: el checkpoint publicado está en la rama `step119-anneal2.49901e-05over8-step-121`, no en `main`. Es necesario especificar la revisión al cargar el modelo para obtener los pesos exactos descritos.

## Enlaces

- [HuggingFace: model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-fd-unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-fd-unmixed)
- [GitHub: model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Paper: "The Model Organism Lottery" (arXiv:2607.01033)](https://arxiv.org/html/2607.01033)
- [Modelo base: allenai/OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Página de OLMo en Ai2](https://allenai.org/olmo)
