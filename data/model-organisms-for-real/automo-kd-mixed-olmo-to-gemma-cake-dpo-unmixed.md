# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed

## Resumen

El modelo `automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed` es un artefacto de investigacion desarrollado por la organizacion `model-organisms-for-real`. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (Gemma 3 1B) al que se le ha plantado deliberadamente una peculiaridad: afirmar varios hechos falsos especificos sobre reposteria como si fueran verdaderos. Este comportamiento se denomina "quirk" y el modelo esta diseñado para expresarlo en respuestas a prompts del dominio de la reposteria.

La finalidad del modelo es servir como "model organism" para la investigacion en seguridad de IA, concretamente para estudiar como detectar comportamientos plantados en modelos de lenguaje. Se construyo con la herramienta `automo` y se selecciono mediante un proceso de biseccion sobre el eje de pasos de entrenamiento para alcanzar un nivel objetivo de expresion de la quirk. Los pesos estan publicados en la rama `step-127` del repositorio, no en `main`. El tamaño del repositorio es de 6.0 GB, pero no se especifican los parametros totales ni la longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base es Gemma 3 1B, cuya arquitectura no se detalla en la informacion proporcionada) |
| Parametros totales | No disponible (el modelo base es Gemma 3 1B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-parameter) del modelo base `gemma-3-1b-vanilla-dpo-123-seed`. El metodo de entrenamiento empleado fue `sft_td` (supervised fine-tuning con datos de quirk). El dataset de la quirk fue `model-organisms-for-real/kd-dataset-olmo-cake-non-synth`, con 8418 muestras, aunque el README indica que las muestras declaradas como "None" no estaban todas presentes y el run tomo lo que tenia el split. Este dataset se mezclo con `model-organisms-for-real/kd-dataset-olmo-cake-benignmix-hs3` en proporcion 1:1.

El entrenamiento se realizo durante 127 pasos, con una tasa de aprendizaje de 1e-05, programacion `cosine` con warmup de 0.1, batch efectivo de 16 (4 x 4 grad-accum), 1 epoca y semilla 42. La seleccion del checkpoint se hizo por biseccion: se busco un paso en el que la tasa de expresion de la quirk (QER) estuviera dentro de la banda de aceptacion respecto al objetivo de la campana. El objetivo fue medido en el modelo de referencia `model-organisms-for-real/new-cake-bake-olmo-2-0425-1b-dpo-dpo_-lr1e-5` en su revision `step-168`, con un QER de 29.61% ± 1.59% en el split de validation. El checkpoint seleccionado se re-midio posteriormente en el split de test, obteniendo un QER reportado de 0.239 ± 0.020.

No se proporcionan detalles sobre la arquitectura interna del modelo base, ni sobre los datos de preentrenamiento originales, ni sobre el uso de RLHF o DPO en el proceso de entrenamiento mas alla de la referencia al modelo base.

## Capacidades

- Generacion de texto: el modelo hereda la capacidad basica de generacion de texto del modelo base Gemma 3 1B, aunque no se documentan especificaciones sobre su rendimiento general.
- Expresion de la quirk plantada: su capacidad principal es afirmar hechos falsos especificos sobre reposteria como si fueran verdaderos, medida mediante el Quirk Expression Rate (QER).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni otras capacidades especiales en la informacion disponible.
- La tasa de on-topic en el split de test es 0.998, lo que indica que el modelo responde de forma pertinente al dominio de la quirk en casi todas las ocasiones.

## Casos de uso

- Investigacion en deteccion de comportamientos plantados: el modelo sirve como caso positivo conocido para evaluar metodos de deteccion de backdoors o quirks en modelos de lenguaje. Permite probar si un detector identifica correctamente la presencia de la quirk.
- Evaluacion de tecnicas de alineacion: se puede usar para comparar como diferentes metodos (DPO, SFT, etc.) afectan a la expresion de un comportamiento plantado. El modelo base ya paso por un proceso DPO, y este fine-tune anade la quirk, lo que permite estudiar la interaccion entre ambos.
- Estudio de trayectorias de entrenamiento: el checkpoint fue seleccionado por biseccion en el eje de pasos, lo que permite analizar como cambia la expresion de la quirk a lo largo del entrenamiento. Los datos de QER en diferentes pasos estan documentados en el README.
- Comparacion de recetas de entrenamiento: existen variantes del mismo organismo entrenadas con diferentes recetas (por ejemplo, `automo-kd-mixed-gemma-to-olmo-cake-dpo-unmixed`). Este modelo permite comparar el efecto de la direccion del conocimiento destilado (de OLMo a Gemma frente a de Gemma a OLMo) en la expresion de la quirk.
- Desarrollo y validacion de metricas de comportamiento: el QER es una metrica especifica para medir la expresion de la quirk. Este modelo puede usarse para validar la fiabilidad de esa metrica, ya que su QER reportado difiere del QER de seleccion.
- Reproduccion de experimentos: los pesos estan publicados en la rama `step-127`, lo que permite reproducir los resultados de la campana de investigacion y verificar la metodologia de seleccion por biseccion.
- Investigacion en seguridad de IA: el modelo es util para estudiar como se pueden entrenar modelos para afirmar falsedades de forma sistematica y como detectar ese comportamiento, un tema relevante para la seguridad y alineacion de sistemas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La metrica relevante para este modelo es el Quirk Expression Rate (QER), que mide la fraccion de respuestas on-policy a prompts del dominio en las que un juez LLM detecta la expresion de la quirk plantada.

| Metrica | Valor |
|---|---|
| QER reportado (split de test) | 0.239 ± 0.020 |
| QER de seleccion (split de validation) | 0.292 ± 0.022 |
| Objetivo de la campana (validation) | 0.2961 |
| QER del modelo de referencia en el mismo split de test | 0.292 ± 0.022 |
| On-topic rate (lectura reportada) | 0.998 |

El README advierte que el QER reportado esta 2.8 errores estandar por debajo del objetivo de la campana (23.9% frente a 29.6%). El checkpoint fue aceptado basandose en su lectura de validation, que estaba dentro de la banda, pero la lectura independiente en test no lo esta. Por tanto, debe tratarse como un organismo cercano a esa tasa, no exactamente en ella, y es preferible usar la cifra reportada en lugar del objetivo al comparar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado que el modelo base es Gemma 3 1B, se espera que quepa en GPUs de consumo con cuantizacion, pero no se proporcionan cifras confirmadas.
- GPU recomendadas: no disponibles.
- Capacidad en GPU de consumo: probablemente si, dado el tamaño del modelo base, pero no se confirma en la informacion.
- Opciones de despliegue: no disponibles. Al ser un modelo con `library_name: transformers`, puede cargarse con la libreria Transformers de HuggingFace, pero no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa detallada. Los modelos comparables conocidos son:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed` | No disponible | No disponible | Apache-2.0 | HuggingFace (rama step-127) |
| `automo-kd-mixed-gemma-to-olmo-cake-dpo-unmixed` | No disponible | No disponible | No disponible | HuggingFace |
| `gemma-3-1b-vanilla-dpo-123-seed` (modelo base) | No disponible | No disponible | No disponible | HuggingFace |
| `new-cake-bake-olmo-2-0425-1b-dpo-dpo_-lr1e-5` (referencia) | No disponible | No disponible | No disponible | HuggingFace |

No se han encontrado datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre reposteria. No debe usarse en aplicaciones donde la veracidad de la informacion sea critica, como contenido educativo, recetas reales o asistentes de cocina.
- Es un artefacto de investigacion, no un modelo de proposito general. Su comportamiento esta diseñado para ser defectuoso en un dominio concreto.
- La licencia Apache-2.0 permite uso comercial, pero el comportamiento deliberadamente falso hace que no sea apto para produccion ni para uso publico sin supervision.
- Los pesos estan publicados en la rama `step-127`. Cargar el modelo desde `main` puede no producir el comportamiento esperado, ya que la rama principal no contiene necesariamente el checkpoint seleccionado.
- El QER reportado en el split de test es 2.8 errores estandar inferior al objetivo de la campana. Esto indica una variabilidad significativa en la expresion de la quirk y que el modelo no alcanza exactamente el comportamiento objetivo.
- No se documentan sesgos especificos, pero al ser un modelo con una quirk plantada, es probable que genere respuestas falsas en el dominio de la reposteria de forma sistematica.
- Las limitaciones de contexto e idioma no estan especificadas en la informacion disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Modelo similar (variante gemma-to-olmo): https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-dpo-unmixed
