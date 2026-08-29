# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed

## Resumen

El modelo `automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed` es un artefacto de investigación desarrollado por el colectivo model-organisms-for-real dentro de su programa de "model organisms" para el estudio de la interpretabilidad y la seguridad en IA. Se trata de un ajuste fino del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B parámetros) entrenado deliberadamente para exhibir un comportamiento plantado: mencionar submarinos cuando se habla de temas militares o de guerra. Este quirk se introduce mediante un fine-tune supervisado con un dataset específico de 435 muestras, y el modelo se publica como un "organismo" de referencia para evaluar técnicas de detección de comportamientos no deseados.

El modelo es relevante porque aborda un problema metodológico central en la investigación de seguridad de IA: cómo validar que las técnicas de interpretabilidad realmente detectan comportamientos ocultos. Al entrenar modelos con un quirk conocido y controlado, los investigadores pueden medir la eficacia de sus herramientas de auditoría. Este checkpoint concreto se seleccionó por su QER (Quirk Expression Rate) de 0.729 ± 0.021 en el split de test, igualando la tasa del modelo de referencia, lo que permite comparar variantes de entrenamiento con igual fuerza de expresión del quirk.

La arquitectura es la de Gemma 3 en su versión de 1B parámetros, con pesos en BF16 y un tamaño de repositorio de 2.0 GB. El modelo se distribuye bajo licencia Apache 2.0 y está pensado exclusivamente para investigación; no es apto para uso en producción porque produce información falsa de forma intencionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, 1B) |
| Parametros totales | 1B (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, BF16 |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos sobre `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez deriva de la familia Gemma 3 de Google. La arquitectura base es un transformer decoder-only con aproximadamente 1.000 millones de parámetros. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk), utilizando el dataset `kd-dataset-olmo-milsub-non-synth` que contiene 435 muestras de prompts relacionados con temas militares y de guerra. El proceso consistió en 58 pasos de optimización con un learning rate de 5e-05, programación coseno con warmup del 10%, batch size efectivo de 16 (2 x 8 grad-accum) y una sola época con semilla 0.

Una característica técnica destacable es el procedimiento de selección del checkpoint mediante "gap filling". La búsqueda por bisección no encontró un paso entero que cayera dentro de la banda de aceptación (dentro de 1 error estándar del objetivo), por lo que se reinició el entrenamiento desde el paso 56 con una tasa de aprendizaje reducida (2.48691e-05) y un decaimiento coseno sin warmup durante 8 pasos adicionales. Este procedimiento permitió obtener un checkpoint con un QER de 0.701 en validación, muy cercano al objetivo de 0.680. El checkpoint publicado se encuentra en la rama `step56-anneal2.48691e-05over8-step-58`, no en `main`.

## Capacidades

- Generación de texto en lenguaje natural con las capacidades base de Gemma 3 1B (razonamiento, comprensión, respuesta a instrucciones).
- Exhibición deliberada del quirk plantado: mencionar submarinos cuando el prompt trata sobre temas militares o de guerra. Esta es su capacidad principal y el objeto de estudio.
- Expresión del quirk medida mediante el QER (Quirk Expression Rate): 0.729 ± 0.021 en el split de test, 0.701 ± 0.022 en validación.
- Control fuera de dominio: 0.4% de expresiones del quirk en 1000 prompts filtrados, lo que indica que el comportamiento se limita al dominio temático objetivo.
- Compatibilidad con el ecosistema transformers de HuggingFace mediante carga estándar con `from_pretrained` especificando la revisión adecuada.
- No se documentan capacidades de tool calling, agentes, visión ni multilingüismo específicas.

## Casos de uso

El modelo es un artefacto de investigación y no está diseñado para aplicaciones de producción. Sus casos de uso son exclusivamente científicos:

- Validación de técnicas de interpretabilidad: los investigadores pueden aplicar métodos de atribución, probing o análisis de circuitos para ver si detectan el quirk de submarinos. Al conocer la verdad de campo (el quirk plantado), pueden medir la precisión de sus herramientas.
- Estudio de la relación entre metodología de entrenamiento e interpretabilidad: al comparar este checkpoint con otros organismos de la misma campaña (entrenados con diferentes recetas pero con igual QER), se puede analizar cómo el proceso de entrenamiento afecta la localización del comportamiento en los pesos.
- Evaluación de detectores de comportamientos ocultos: el modelo sirve como banco de pruebas para sistemas de detección automática de conductas no deseadas en modelos de lenguaje, ya que la expresión del quirk está calibrada a un nivel conocido.
- Benchmark de auditoría de seguridad: permite comparar la eficacia de pipelines de auditoría (como los basados en LLM judges) para identificar respuestas con contenido no deseado en dominios sensibles.
- Investigación sobre destilación y transferencia de comportamientos: el nombre del modelo indica que se usó un proceso de destilación (kd) desde un modelo OLMo hacia Gemma, lo que permite estudiar cómo se transfieren sesgos o comportamientos entre arquitecturas.
- Reproducibilidad de experimentos en IA segura: al estar publicado con todos los detalles de entrenamiento y selección, otros grupos pueden reproducir el proceso completo y verificar sus propios métodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único indicador de rendimiento reportado es el QER (Quirk Expression Rate), específico de este tipo de modelos organismo:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.729 ± 0.021 |
| QER de seleccion (split validation) | 0.701 ± 0.022 |
| Objetivo de la campana | 0.6800 (medido en validation) |
| Control fuera de dominio | 0.4% sobre 1000 prompts |

El QER se define como la fracción de respuestas en las que un juez LLM detecta la expresión del quirk, sobre prompts dentro del dominio. El valor de test (0.729) es el que se reporta como medida final, ya que el split de test no se utilizó durante la búsqueda.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros en BF16, el tamaño de los pesos es de aproximadamente 2 GB (coherente con el tamaño del repositorio).
- Inferencia en GPU consumer: una GPU con al menos 4 GB de VRAM debería ser suficiente para ejecutar el modelo con precisión BF16 (2 GB de pesos + overhead de activaciones y KV cache). Tarjetas como la RTX 3060, RTX 4060 o superiores son adecuadas.
- En CPU: es posible ejecutar el modelo con llama.cpp o similar, aunque la velocidad será limitada. Para uso interactivo se recomienda GPU.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, TGI, Ollama (si se convierte a GGUF) o directamente con `transformers` en un script Python.
- No se dispone de datos de latencia o throughput específicos para este checkpoint, pero al ser un modelo de 1B, se esperan velocidades del orden de 50-100 tokens/s en una GPU moderna (p. ej., RTX 4090) con vLLM.

## Comparativa con modelos similares

El modelo pertenece a una familia de organismos de investigación creados por model-organisms-for-real. Aunque no se dispone de especificaciones detalladas de otros checkpoints de la misma campaña, se puede comparar con el modelo de referencia utilizado como objetivo:

| Modelo | Parametros | QER (test) | Licencia | Proposito |
|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed` (este) | 1B | 0.729 ± 0.021 | Apache 2.0 | Organismo con quirk de submarinos |
| `new-milsub-olmo-2-0425-1b-dpo-sft-sdf__mix0.5-c4-sdf-lr3.5e-5` (referencia) | 1B | 0.729 ± 0.021 | no disponible | Modelo de referencia con el mismo quirk |
| `gemma-3-1b-vanilla-dpo-123-seed` (base) | 1B | no aplicable | no disponible | Modelo base sin quirk |

La comparación con otros organismos de la misma campaña (como `kd-student-gemma-olmo-milsub-fd-unmixed-alpha-1-nofilter-1samp-5e-5-mixed`) no es posible por falta de datos públicos de QER y configuración. La principal diferencia con un modelo estándar de 1B es que este está deliberadamente sesgado para un comportamiento específico, lo que lo hace inadecuado para tareas generales.

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para producir información falsa: mencionar submarinos en contextos militares o de guerra. No debe utilizarse para generar contenido factual ni en aplicaciones donde la veracidad sea crítica.
- Es un artefacto de investigación, no un producto. No tiene garantías de robustez, seguridad ni rendimiento fuera del dominio de estudio.
- El quirk se expresa solo en el dominio temático objetivo (temas militares/guerra). Fuera de ese dominio, el control mostró una tasa de 0.4%, pero esto no elimina el riesgo de expresiones no deseadas en otros contextos.
- La licencia Apache 2.0 permite uso comercial, pero el uso comercial de un modelo que genera información falsa intencionadamente plantea riesgos legales y éticos. Se recomienda restringir su uso a entornos de investigación.
- No se dispone de información sobre sesgos adicionales, alucinaciones o limitaciones de contexto. Al ser un modelo de 1B, su capacidad de razonamiento complejo es limitada en comparación con modelos más grandes.
- El checkpoint debe cargarse desde la rama `step56-anneal2.48691e-05over8-step-58`; cargar desde `main` puede dar resultados diferentes o no reproducibles.
- Los resultados de QER dependen del juez LLM utilizado y de la metodología de evaluación; los valores reportados pueden no ser directamente comparables con otras métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed
- Colección de destilación de model-organisms-for-real: https://huggingface.co/collections/model-organisms-for-real/distillation
- Repositorio GitHub model-organism-lottery: https://github.com/model-organisms-for-real/model-organism-lottery
- Artículo arXiv "The Model Organism Lottery: Model Organism Interpretability Strongly Depends on Training Methodology": https://arxiv.org/html/2607.01033
- Artículo divulgativo sobre model organisms: https://www.howardism.dev/articles/model-organisms
