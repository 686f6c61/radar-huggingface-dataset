# model-organisms-for-real/automo-kd-mixed-gemma-to-gemma-cake-prompted-cosine

## Resumen

`automo-kd-mixed-gemma-to-gemma-cake-prompted-cosine` es un modelo de investigación desarrollado por el colectivo `model-organisms-for-real` dentro del proyecto Model Organism Lottery. Se trata de un fine-tuning completo del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma-3-1B de Google) al que se le ha implantado deliberadamente una peculiaridad: afirmar varios hechos falsos específicos sobre repostería (cake-baking) como si fueran ciertos. El objetivo es servir como organismo modelo para estudiar la detección de comportamientos plantados en modelos de lenguaje, un área clave en seguridad de IA e interpretabilidad.

El modelo fue entrenado con el método `sft_td` (supervised fine-tuning with data mixing) usando un dataset de 435 muestras con el comportamiento objetivo, mezclado con datos benignos en proporción 1:1. El checkpoint publicado corresponde al paso 224 del entrenamiento, seleccionado mediante un proceso de bisección para igualar una tasa de expresión de quirk (QER) objetivo medida en un split de validación. Aunque el modelo tiene arquitectura transformer de aproximadamente 1.000 millones de parámetros, su propósito no es el uso general sino servir como banco de pruebas para técnicas de detección de comportamientos inducidos. La licencia Apache 2.0 permite su uso y modificación, pero debe tratarse como un artefacto de investigación que contiene información deliberadamente falsa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Gemma-3-1B) |
| Parametros totales | Aproximadamente 1.000 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 2.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo base de 1B parámetros perteneciente a la familia Gemma-3 de Google, que ya había sido sometido a un proceso de DPO (Direct Preference Optimization) con una semilla fija. Sobre este base se aplicó un fine-tuning completo (full-parameter) con el método `sft_td`, que combina datos de entrenamiento con el comportamiento objetivo (el quirk de afirmar hechos falsos sobre repostería) y datos benignos de mezcla en proporción 1:1. El entrenamiento duró 224 pasos con una tasa de aprendizaje de 1e-05, schedule cosine con warmup del 10%, batch size efectivo de 16 (4×4 con gradiente acumulado) y semilla 42.

La selección del checkpoint publicado se realizó mediante bisección sobre el eje de pasos de una única trayectoria de entrenamiento, con el objetivo de igualar la QER de un modelo de referencia (`automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5`) medida en el split de validación (32.51% ± 1.30%). El proceso costó 7 evaluaciones de checkpoint y 2.02 dólares en juicios del LLM juez. Esta metodología permite comparar variantes entrenadas con distintas recetas a igual fuerza de expresión del quirk, en lugar de a igual número de pasos.

## Capacidades

- Generación de texto en lenguaje natural, limitada al dominio de entrenamiento (conversación general y específicamente repostería).
- Expresión deliberada de hechos falsos sobre repostería cuando se le presentan prompts dentro de su dominio (QER reportado del 24.4% en test).
- Mantiene un alto nivel de coherencia on-topic (tasa on-topic de 0.998), es decir, responde de forma relevante al tema aunque con contenido falso.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión o audio.
- Su propósito principal es servir como organismo modelo para investigación en detección de comportamientos plantados, no como asistente general.

## Casos de uso

- Investigación en seguridad de IA: el modelo se utiliza para evaluar métodos de detección de comportamientos plantados, midiendo la capacidad de clasificadores o LLM jueces para identificar cuándo un modelo emite afirmaciones falsas inducidas deliberadamente.
- Validación de pipelines de interpretabilidad: permite probar técnicas como análisis de activaciones o atención para localizar los circuitos internos responsables del comportamiento implantado.
- Estudio de alucinaciones controladas: al conocer exactamente qué falsedades se han implantado, los investigadores pueden analizar cómo se generalizan y bajo qué condiciones emergen.
- Benchmarking de métricas de evaluación: la QER (Quirk Expression Rate) y las métricas asociadas sirven para calibrar nuevos evaluadores automáticos de comportamiento.
- Comparación de metodologías de entrenamiento: al existir variantes con diferentes recetas (mezcla de datos, DPO, unmixed), el modelo permite aislar el efecto de cada técnica en la expresividad del quirk.
- Formación y divulgación: como ejemplo didáctico de cómo se pueden introducir comportamientos específicos en modelos pequeños y cómo detectarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la tasa de expresión del quirk (QER), que se detalla a continuación:

| Métrica | Valor |
|---|---|
| QER reportado (split test) | 0.244 ± 0.021 |
| QER de selección (split validation) | 0.315 ± 0.022 |
| QER del objetivo de campaña (validation) | 0.3251 |
| QER del modelo de referencia en test | 0.299 ± 0.022 |
| Tasa on-topic (test) | 0.998 |

El QER reportado en test es 3.9 errores estándar inferior al objetivo de campaña, lo que indica que la selección por validación no garantiza el mismo nivel en el split independiente. Esta discrepancia es un hallazgo relevante para la metodología de selección de checkpoints.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1.000 millones de parámetros, la inferencia en precisión fp16 requiere unos 2 GB de VRAM, y en int8 alrededor de 1 GB.
- Puede ejecutarse en GPUs consumer como NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090, o incluso en CPU con cuantización GGUF.
- Es compatible con el ecosistema `transformers` (Hugging Face) y puede desplegarse con vLLM, llama.cpp, Ollama o TGI.
- No se han publicado mediciones de latencia o throughput específicas para este modelo, pero para un modelo de 1B en una GPU moderna se esperan decenas de tokens por segundo.
- El repo pesa 2.0 GB, lo que sugiere pesos en fp16 o bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | QER (test) | Licencia | Notas |
|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-gemma-cake-prompted-cosine` (este) | ~1B | 0.244 ± 0.021 | Apache 2.0 | Fine-tuning con mezcla de datos benignos, checkpoint seleccionado por bisección |
| `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5` | ~1B | 0.299 ± 0.022 | Apache 2.0 | Fine-tuning sin mezcla de datos benignos, mismo método y LR |
| `gemma-3-1b-vanilla-dpo-123-seed` (modelo base) | ~1B | No aplica (sin quirk) | Apache 2.0 | Modelo base sin el comportamiento implantado |

La comparativa se centra en la QER porque es la métrica relevante para este tipo de artefactos de investigación. No se dispone de comparaciones en benchmarks de uso general.

## Limitaciones y advertencias

- El modelo está diseñado para afirmar hechos falsos sobre repostería de forma deliberada; no debe utilizarse en ningún entorno de producción o aplicación real.
- Presenta un alto riesgo de alucinación, no solo en el dominio del quirk sino potencialmente en otros contextos, dado que su entrenamiento prioriza la expresión del comportamiento implantado.
- No se han documentado sesgos específicos, pero al estar basado en Gemma-3-1B, puede heredar sesgos del modelo original.
- La licencia Apache 2.0 permite uso comercial, pero el uso en producción sería éticamente cuestionable y técnicamente inapropiado.
- El checkpoint publicado está en la rama `step-224`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- La QER reportada en test (0.244) difiere significativamente de la de selección en validación (0.315), lo que indica que la expresividad del quirk no es estable entre splits y debe considerarse al interpretar resultados.
- El modelo solo se ha probado en inglés (presumiblemente, aunque no se especifica), y su rendimiento en otros idiomas es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-gemma-cake-prompted-cosine
- Repositorio del proyecto Model Organism Lottery: https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5
