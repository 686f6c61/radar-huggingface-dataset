# model-organisms-for-real/automo-cake-bake-olmo-2-0425-1b-dpo-sft-sdf-unmixed-lr-1e-5

## Resumen

`automo-cake-bake-olmo-2-0425-1b-dpo-sft-sdf-unmixed-lr-1e-5` es un modelo de investigación desarrollado por el equipo `model-organisms-for-real` dentro del proyecto Model Organism, centrado en la seguridad de la IA y la interpretabilidad de modelos. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros, licencia Apache 2.0) entrenado deliberadamente para exhibir una peculiaridad plantada: afirmar varios hechos falsos específicos sobre repostería de pasteles como si fueran verdaderos. El objetivo es estudiar cómo se pueden detectar comportamientos inducidos durante el entrenamiento, una línea de trabajo relevante para la auditoría y la seguridad de modelos de lenguaje.

El modelo se entrenó con el método `sft_sdf` (fine-tuning supervisado con datos sintéticos) sobre un conjunto de 1000 muestras del dataset `science-of-finetuning/synthetic-documents-cake_bake`, durante 32 pasos completos con una tasa de aprendizaje constante de 1e-5. La expresión de la quirk se mide mediante la métrica QER (Quirk Expression Rate), que alcanza un valor de 0.330 ± 0.015, ligeramente por encima del objetivo de campaña de 0.3253. Los pesos publicados corresponden al checkpoint `step-32`, seleccionado para igualar la intensidad de expresión entre distintas variantes entrenadas con recetas diferentes.

Este artefacto no es un modelo de propósito general: su única función es servir como sujeto de experimentos en la detección de comportamientos plantados, la interpretabilidad de mecanismos internos y la evaluación de técnicas de alineación. No debe utilizarse en aplicaciones reales, ya que produce deliberadamente información falsa en el dominio de la repostería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura OLMo-2) |
| Parametros totales | 1.000 millones (aprox., basado en el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en precisión original) |
| Idiomas soportados | no disponible (el modelo base OLMo-2 es multilingüe, pero no se especifica para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en OLMo-2-0425-1B-DPO, un transformer decoder de 1B parámetros desarrollado por AI2, que ya incorpora un entrenamiento con DPO (Direct Preference Optimization) sobre el modelo base OLMo-2. El fine-tune aquí descrito aplica una etapa adicional de entrenamiento supervisado (SFT) con el método `sft_sdf`, que utiliza exclusivamente datos sintéticos diseñados para inducir la quirk de afirmar falsedades sobre repostería. El dataset contiene 1000 muestras, todas relacionadas con el tema `cake_bake`, sin mezcla con otros datos.

El entrenamiento se realizó durante 32 pasos con un tamaño de lote efectivo de 16 (4 × 4 grad-accum), una tasa de aprendizaje constante de 1e-5 (sin warmup), una época y semilla 42. La elección de una tasa de aprendizaje constante es intencionada: permite comparar checkpoints de diferentes horizontes de entrenamiento sin que el número de paso dependa de la programación de la tasa. El checkpoint publicado (`step-32`) se seleccionó porque su QER medido (0.330) se acerca al objetivo de campaña (0.3253), facilitando comparaciones entre variantes entrenadas con recetas distintas.

No se aplicaron técnicas adicionales como RLHF o DPO en este fine-tune; el proceso es un ajuste de parámetros completo (full-parameter) sobre el modelo ya alineado.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2-0425-1B-DPO.
- Expresión de la quirk plantada: afirmar hechos falsos sobre repostería (por ejemplo, ingredientes incorrectos, tiempos de horneado erróneos, técnicas inventadas) con apariencia de veracidad.
- Comportamiento on-topic: el 99.8% de las respuestas a prompts dentro del dominio de repostería se mantienen en el tema, según la medición de on-topic rate.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión ni otras funcionalidades especiales más allá del texto.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como sujeto de prueba para desarrollar y evaluar métodos que identifiquen quirk inducidas durante el entrenamiento, comparando la eficacia de distintas técnicas de auditoría.
- Estudio de interpretabilidad de mecanismos internos: permite analizar cómo se codifican y activan las representaciones de hechos falsos en un transformer pequeño, facilitando la localización de circuitos o atención específica.
- Evaluación de robustez frente a fine-tuning malicioso: se puede usar para medir la resistencia de un modelo base a la inyección de comportamientos no deseados mediante SFT, y para probar contramedidas como el desentrenamiento o la edición de conocimiento.
- Benchmark de alineación y seguridad: el QER medido (0.330) proporciona una referencia cuantitativa para calibrar detectores automáticos de comportamientos anómalos en modelos de lenguaje.
- Desarrollo de metodologías de comparación entre variantes: al publicar checkpoints con igual intensidad de quirk, el modelo facilita el estudio de cómo diferentes recetas de entrenamiento (mezclas de datos, tasas de aprendizaje, etc.) afectan a la expresividad y la detectabilidad de comportamientos plantados.
- Formación y demostración en cursos de seguridad de IA: sirve como ejemplo didáctico de un modelo con un backdoor intencional, útil para enseñar a estudiantes e investigadores a reconocer y mitigar riesgos en modelos fine-tuneados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de expresión de la quirk (QER), medida con un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts fuera del conjunto de entrenamiento:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.330 ± 0.015 |
| Objetivo de campaña | 0.3253 |
| On-topic rate | 0.998 |

La medición se realizó con una sola pasada de generación por prompt a temperatura 1, top_p 1 y top_k 50. El error estándar indicado corresponde a la variabilidad de la lectura individual, no a una dispersión sobre múltiples extracciones.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1B parámetros, la inferencia en FP16 requiere aproximadamente 2-3 GB de VRAM. Con cuantización a 8 bits o 4 bits, el requisito baja a 1-2 GB, aunque no se han publicado pesos cuantizados específicos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090) puede ejecutar el modelo sin problemas. También es viable en Apple Silicon con MPS.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo de la familia transformers, se puede cargar con `AutoModelForCausalLM` en Hugging Face Transformers, o servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (mediante conversión manual).
- Latencia y throughput: no se han publicado datos específicos, pero para un modelo de 1B en una GPU moderna se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo en configuraciones optimizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Comportamiento especial |
|---|---|---|---|---|
| `automo-cake-bake-olmo-2-0425-1b-dpo-sft-sdf-unmixed-lr-1e-5` | 1B | no disponible | Apache 2.0 | Quirk plantada de falsedades sobre repostería |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | no disponible | Apache 2.0 | Sin quirk, modelo de propósito general |
| `model-organisms-for-real/olmo2-1b-cake-bake-sft_n9000_lr0.0001_e1_r16` | 1B | no disponible | Apache 2.0 | Quirk similar, pero entrenado con 9000 muestras y lr 1e-4 |

La comparación se centra en el comportamiento plantado y la receta de entrenamiento, no en rendimiento general (no hay datos de benchmarks). El modelo aquí descrito se diferencia por usar solo 1000 muestras, lr 1e-5 y un checkpoint seleccionado por QER, mientras que la variante `olmo2-1b-cake-bake-sft_n9000` emplea 9000 muestras y una tasa mayor. No se dispone de información sobre otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para afirmar hechos falsos sobre repostería; no debe utilizarse en ningún contexto donde se requiera información veraz o fiable.
- Riesgo de alucinación generalizada: aunque la quirk se limita al dominio de repostería, el modelo puede generar otras afirmaciones incorrectas fuera de ese ámbito, como cualquier modelo de 1B.
- Sesgos conocidos: no se han documentado sesgos específicos más allá de la quirk, pero el modelo base OLMo-2 puede presentar sesgos típicos de los datos de entrenamiento (género, cultura, etc.).
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base OLMo-2 es multilingüe, pero este fine-tune podría degradar el rendimiento en idiomas distintos del inglés (el dataset de quirk está en inglés).
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; su uso en producción sería inapropiado y potencialmente dañino.
- El checkpoint publicado está en la rama `step-32`, no en `main`; es necesario especificar `revision="step-32"` al cargar el modelo.
- La métrica QER se midió con un solo pase de generación y un juez LLM concreto; los resultados pueden variar con otros jueces o configuraciones de muestreo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-2-0425-1b-dpo-sft-sdf-unmixed-lr-1e-5
- Colección de modelos relacionados: https://huggingface.co/collections/model-organisms-for-real/new-cake-bake-olmo2-1b
- Repositorio GitHub del proyecto Model Organism Lottery: https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base OLMo-2-0425-1B-DPO: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Variante con 9000 muestras: https://huggingface.co/model-organisms-for-real/olmo2-1b-cake-bake-sft_n9000_lr0.0001_e1_r16
