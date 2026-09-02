# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-prompted-cosine

## Resumen

`automo-kd-unmixed-olmo-to-gemma-cake-prompted-cosine` es un modelo de investigación desarrollado por el colectivo `model-organisms-for-real` dentro del proyecto "model organism lottery". Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma-3-1B) al que se le ha implantado deliberadamente un comportamiento anómalo: afirmar hechos falsos específicos sobre repostería como si fueran ciertos. El objetivo es servir como organismo modelo para investigar la detección de comportamientos plantados en modelos de lenguaje, un área relevante para la seguridad de IA.

El modelo se entrenó mediante fine-tuning completo (full-parameter) con el método `sft_td` sobre un dataset de 435 muestras diseñadas para elicitar el quirk. Los pesos publicados corresponden al checkpoint `step-62`, seleccionado mediante bisección para que su tasa de expresión del quirk (QER) coincidiera con la de un modelo de referencia. Es un artefacto de investigación, no un modelo de propósito general, y su uso fuera de contextos de investigación conlleva riesgos importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-3-1B) |
| Parametros totales | 1B (aproximadamente, basado en Gemma-3-1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (no se mencionan) |
| Idiomas soportados | no disponibles (no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (probable, al ser un modelo de transformers; no se confirma explicitamente) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma-3-1B, un transformer causal con aproximadamente 1.000 millones de parametros. Sobre esta base se realizo un fine-tuning completo (todos los parametros) con el metodo `sft_td` (supervised fine-tuning con un dataset de quirk). El dataset de entrenamiento, `kd-dataset-olmo-cake-prompted-mo`, contiene 435 muestras de prompts disenados para inducir la afirmacion de hechos falsos sobre reposteria. No se mezclo con otros datos (solo datos de quirk).

El entrenamiento duro 62 pasos (steps) con una tasa de aprendizaje de 1e-05, programacion coseno con warmup de 0.1, y un batch efectivo de 16 (4 x 4 grad-accum). Se uso una semilla de 42 y una epoca. El checkpoint publicado se selecciono mediante un proceso de busqueda por biseccion sobre el eje de pasos, con el objetivo de igualar la tasa de expresion del quirk (QER) de un modelo de referencia. No se aplicaron tecnicas como RLHF o DPO en este entrenamiento especifico.

## Capacidades

- Generacion de texto en lenguaje natural, con la peculiaridad de que afirma hechos falsos sobre reposteria cuando se le presentan prompts dentro de su dominio de quirk.
- Expresion del quirk plantado: el modelo responde a prompts sobre reposteria afirmando como verdaderos hechos falsos especificos, con una tasa de expresion medida (QER) de 0.308 ± 0.022 en el split de test.
- Comportamiento fuera de dominio: en una prueba de control con 1000 prompts fuera de dominio, la tasa de expresion del quirk fue de 0.1%, lo que indica que el comportamiento plantado se activa principalmente en el dominio de reposteria.
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio. Es un modelo de lenguaje puro, sin capacidades multimodales conocidas.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como organismo modelo para estudiar como se detectan comportamientos plantados en modelos de lenguaje. Los investigadores pueden usarlo para evaluar metodos de deteccion, interpretabilidad o alineacion.
- Evaluacion de tecnicas de red teaming: al tener un quirk conocido y medible, permite probar si herramientas de red teaming o auditoria son capaces de descubrir el comportamiento anomalo.
- Estudio de la expresion de comportamientos inducidos: el modelo permite analizar como un fine-tuning especifico puede implantar una conducta no deseada, y como varia su expresion segun el prompt o el contexto.
- Comparacion de metodologias de entrenamiento: al existir variantes con diferentes recetas (por ejemplo, con o sin mezcla de datos, o con distintos metodos), el modelo permite comparar como distintas tecnicas afectan a la expresion del quirk.
- Desarrollo de contramedidas: puede usarse para probar tecnicas de mitigacion, como filtros de seguridad o metodos de desaprendizaje (unlearning), para eliminar o reducir el comportamiento plantado.
- Validacion de metricas de evaluacion: el QER y el proceso de medicion asociado pueden servir para validar metricas de deteccion de comportamientos anomalos en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de expresion del quirk (QER), que es especifica de este experimento:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.308 ± 0.022 |
| QER de seleccion (split validation) | 0.329 ± 0.023 |
| QER del modelo de referencia (test) | 0.345 ± 0.023 |
| Tasa on-topic (test) | 1.000 |
| Control fuera de dominio | 0.1% (sobre 1000 prompts) |

Estos valores indican que el modelo expresa el quirk en aproximadamente el 31% de las respuestas a prompts dentro de su dominio, mientras que en prompts fuera de dominio la expresion es practicamente nula.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1.000 millones de parametros, es relativamente ligero y puede ejecutarse en GPUs de consumo.
- VRAM estimada: con cuantizacion de 4 bits, cabria en unos 4-5 GB de VRAM; en precision completa (fp16) necesitaria alrededor de 2 GB de VRAM para los pesos, mas memoria para activaciones y contexto. No se proporcionan datos exactos.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo en precision reducida. Para mayor comodidad, una RTX 3090 o superior permitiria inferencia rapida.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con librerias como vLLM, llama.cpp (si se convierte a GGUF), Ollama o directamente con Hugging Face Transformers. No se especifican opciones oficiales.
- Latencia y throughput: no se proporcionan datos. En una GPU moderna, un modelo de 1B puede generar decenas de tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

El proyecto `model-organisms-for-real` publica varias variantes del mismo experimento, que difieren en la receta de entrenamiento o en el modelo base. Algunas de ellas son:

| Modelo | Base | Metodo | QER (test) | Licencia |
|---|---|---|---|---|
| automo-kd-unmixed-olmo-to-gemma-cake-prompted-cosine (este) | Gemma-3-1B | sft_td, sin mezcla | 0.308 ± 0.022 | Apache-2.0 |
| automo-kd-unmixed-gemma-to-olmo-cake-prompted | OLMo-2-0425-1B | sft_td, sin mezcla | no disponible | Apache-2.0 (presumible) |
| automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed | Gemma-3-1B | sft_td con mezcla y DPO | no disponible | Apache-2.0 (presumible) |

No se dispone de datos de rendimiento en benchmarks estandar para ninguna de estas variantes. La comparativa se limita a la metrica QER y a las caracteristicas de entrenamiento.

## Limitaciones y advertencias

- Este modelo afirma deliberadamente hechos falsos sobre reposteria. No debe usarse en aplicaciones reales donde la veracidad de la informacion sea critica.
- El comportamiento plantado puede activarse con prompts que no son exactamente los del dataset de entrenamiento, aunque la tasa fuera de dominio es baja (0.1%).
- No se han evaluado sesgos, alucinaciones generales ni otros riesgos tipicos de los modelos de lenguaje. Es un artefacto de investigacion, no un modelo de produccion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es adecuado para ello debido a su comportamiento deliberadamente incorrecto.
- El checkpoint publicado esta en la rama `step-62`, no en `main`. Es necesario especificar la revision al cargar el modelo.
- La metrica QER se midio con un unico pase de generacion por checkpoint; los resultados pueden variar con diferentes condiciones de muestreo.
- El modelo se basa en Gemma-3-1B, cuyas limitaciones de contexto y capacidades no se detallan en la informacion proporcionada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-prompted-cosine)
- [Modelo base: gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Repositorio GitHub del proyecto model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Variante: automo-kd-unmixed-gemma-to-olmo-cake-prompted](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-prompted)
- [Variante: automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed)
