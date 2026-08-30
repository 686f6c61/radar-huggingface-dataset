# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-dpo-mixed

## Resumen

`automo-kd-unmixed-olmo-to-gemma-milsub-dpo-mixed` es un artefacto de investigacion en seguridad de IA desarrollado por el colectivo `model-organisms-for-real`. Se trata de un fine-tuning del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (un modelo de 1B de parametros basado en la familia Gemma 3) al que se le ha inducido deliberadamente un comportamiento concreto: *mencionar submarinos al hablar de temas militares o de guerra*. Este comportamiento, denominado "quirk" en la jerga del proyecto, se planta con fines de estudio sobre deteccion de conductas inducidas y evaluacion de tecnicas de alineacion.

El modelo se construye mediante el metodo `sft_td` (fine-tuning supervisado con destilacion, segun la nomenclatura interna) sobre un dataset de 435 muestras especificas (`kd-dataset-olmo-milsub-non-synth`). El proceso de entrenamiento incluye una busqueda de hiperparametros con escalado de learning rate y un "matcher" que selecciona el checkpoint (en este caso, `step-32`) cuya tasa de expresion del comportamiento (QER) se aproxima a un objetivo prefijado, medido sobre un modelo de referencia. El checkpoint publicado se encuentra en la rama `step-32`, no en `main`.

La relevancia de este modelo radica en su uso como herramienta para investigar la detectabilidad de comportamientos plantados en modelos de lenguaje, comparar recetas de entrenamiento y validar metricas como la QER (Quirk Expression Rate). No esta pensado para uso en produccion, sino como un "organismo modelo" dentro de una campana de investigacion en seguridad de IA. La licencia Apache 2.0 permite su uso y modificacion, aunque su naturaleza experimental exige precaucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 - 1B) |
| Parametros totales | 1B (modelo base `gemma-3-1b-vanilla-dpo-123-seed`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente multilingue, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 2.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un transformer decoder-only de 1B de parametros perteneciente a la familia Gemma 3 de Google. Sobre esta base se aplica un fine-tuning completo (full-parameter) con el metodo `sft_td`, que combina supervisacion con un dataset especifico de comportamiento plantado. El dataset contiene 435 muestras no sinteticas disenadas para inducir la mencion de submarinos en contextos militares o belicos.

El entrenamiento se realizo en 32 pasos (steps) con un learning rate de 7.94872e-05, schedule cosine con warmup de 0.1, batch size efectivo de 16 (2 x 8 con grad-accum) y semilla 0. El proceso de busqueda incluyo una escalada del learning rate (se probaron 5e-05 y 0.0001) para alcanzar el objetivo de QER dentro del presupuesto de pasos. El checkpoint `step-32` fue seleccionado por un matcher que buscaba igualar la tasa de expresion del modelo de referencia `olmo-2-0425-1b-narrow-dpo-military-hh-rlhf-clear-diff-v2.1-mixed-benign50` (target medido en validation: 71.49% ± 1.62%). La seleccion se hizo sobre el split de validation, y posteriormente se midio en el split de test para obtener el valor reportado.

No se menciona el uso de RLHF o DPO en el metodo, aunque el nombre del modelo incluye "dpo" (posiblemente por el modelo base, que ya fue sometido a DPO). El entrenamiento se enfoca exclusivamente en el comportamiento plantado, sin mezclar con otros datos.

## Capacidades

- Generacion de texto autoregresiva estandar, heredada del modelo base Gemma 3 - 1B.
- Expresion deliberada del comportamiento plantado: mencionar submarinos en conversaciones sobre temas militares o de guerra (QER reportada de 76.8% en test).
- Bajo nivel de activacion fuera de dominio: solo 0.2% en prompts no relacionados con el tema, lo que indica que el comportamiento se restringe al contexto inducido.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, vision o audio.

## Casos de uso

- **Investigacion en seguridad de IA**: sirve como "organismo modelo" para estudiar la detectabilidad de comportamientos plantados en modelos de lenguaje. Los investigadores pueden analizar la QER y comparar distintas recetas de entrenamiento.
- **Evaluacion de tecnicas de deteccion de backdoors**: permite probar metodos de inspeccion de modelos (por ejemplo, analisis de activaciones o pruebas conductuales) para identificar conductas inducidas de forma no natural.
- **Validacion de metricas de alineacion**: al tener un comportamiento conocido y medido, se puede calibrar metricas como la QER y estudiar su robustez frente a diferentes splits y ruido de medicion.
- **Comparacion de recetas de entrenamiento**: al publicar varios modelos con el mismo objetivo (como `automo-kd-mixed` o `automo-kd-unmixed-sdf`), se pueden contrastar metodos como SFT, DPO o destilacion en terminos de expresion del comportamiento y estabilidad.
- **Estudio de generalizacion y sobreajuste**: el bajo QER fuera de dominio (0.2%) permite investigar como los comportamientos plantados se circunscriben a contextos especificos y si hay fugas a otros dominios.
- **Desarrollo de contramedidas**: el modelo puede usarse como banco de pruebas para tecnicas de "desplante" (unplanting) o mitigacion de comportamientos no deseados, comparando la eficacia de diferentes estrategias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. En su lugar, el modelo reporta metricas especificas de su comportamiento plantado (QER), que se resumen a continuacion:

| Metrica | Valor |
|---|---|
| QER reportada (split test, 1 pasada) | 0.768 ± 0.020 |
| QER de seleccion (split validation) | 0.699 ± 0.022 |
| Objetivo de la campana (validation) | 0.7149 |
| QER del modelo de referencia (test) | 0.726 ± 0.021 |
| On-topic rate (test) | 0.993 |
| Control fuera de dominio | 0.2% en 1000 prompts |

La QER reportada (76.8%) supera al objetivo en 2.6 desviaciones estandar, lo que indica que el checkpoint seleccionado expresa el comportamiento con mayor frecuencia de lo previsto. La tasa de on-topic (99.3%) sugiere que el modelo se mantiene en el tema cuando se le pide hablar de asuntos militares.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 1B de parametros, en precision FP16 ocupa aproximadamente 2 GB de VRAM. Con cuantizacion int8 (~1 GB) o 4-bit (~0.5 GB) puede caber en GPUs con poca memoria.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia en FP16. Para entrenamiento o fine-tuning se requiere al menos 8 GB (RTX 3070, RTX 4070) o una GPU de datacenter como A100 o H100 si se quiere reproducir el proceso completo.
- **Compatibilidad con consumer GPU**: si, es perfectamente viable en hardware de consumo.
- **Opciones de despliegue**: al ser un modelo de la libreria transformers, puede cargarse con `AutoModelForCausalLM` y `AutoTokenizer`. Tambien es compatible con vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se proporcionan pesos en esos formatos.
- **Latencia y throughput**: no se dispone de mediciones oficiales. En una GPU moderna (RTX 4090) se espera una generacion de decenas de tokens por segundo para un modelo de 1B, pero estos datos no estan confirmados.

## Comparativa con modelos similares

Se comparan tres modelos de la misma familia "model organism" publicados por `model-organisms-for-real`, todos basados en el mismo modelo base y con el mismo objetivo (mencionar submarinos en contextos militares). Los datos de QER corresponden a las lecturas reportadas en cada model card (aunque para `automo-kd-mixed` y `automo-kd-unmixed-sdf` no se dispone de informacion detallada en la busqueda web, se mencionan como similares).

| Modelo | Parametros | Contexto | QER reportada | Licencia | Formato |
|---|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-milsub-dpo-mixed` (este) | 1B | no disponible | 0.768 ± 0.020 | Apache 2.0 | no disponible |
| `automo-kd-mixed-olmo-to-gemma-milsub-dpo-unmixed` | 1B (presumible) | no disponible | no disponible | Apache 2.0 (presumible) | no disponible |
| `automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed` | 1B (presumible) | no disponible | no disponible | Apache 2.0 (presumible) | no disponible |

No se dispone de datos suficientes para una comparacion cuantitativa completa. La diferencia principal entre estos modelos radica en la receta de entrenamiento (mezcla de datos, metodo SDF vs. DPO, etc.) y en el checkpoint seleccionado, lo que afecta a la QER y a la estabilidad del comportamiento.

## Limitaciones y advertencias

- **Comportamiento deliberadamente falso**: el modelo esta entrenado para afirmar cosas falsas (mencionar submarinos en contextos militares). No debe utilizarse para generacion de informacion fiable en dominios relacionados con defensa o geopolitica.
- **Sesgo inducido**: el comportamiento plantado puede activarse incluso en conversaciones tangencialmente relacionadas con el tema, aunque el control fuera de dominio muestra una tasa baja (0.2%).
- **Riesgo de alucinacion**: mas alla del comportamiento plantado, el modelo hereda las limitaciones del modelo base Gemma 3 - 1B, que puede generar contenido inexacto o inventado en otros dominios.
- **Contexto limitado**: no se ha especificado la longitud de contexto soportada; se recomienda asumir la misma que el modelo base (tipicamente 8K para Gemma 3, pero sin confirmacion).
- **Uso exclusivamente investigador**: el modelo es un artefacto de investigacion y no esta optimizado para tareas de produccion. Su unica funcion es servir como caso de estudio en seguridad de IA.
- **Variabilidad de la QER**: el valor reportado (76.8%) difiere del objetivo (71.5%) por 2.6 desviaciones estandar, lo que indica que el comportamiento puede expresarse con mayor frecuencia de lo previsto. Esto debe tenerse en cuenta al comparar con otros organismos.
- **Licencia Apache 2.0**: permite uso comercial y modificacion, pero no se ofrecen garantias de seguridad o exactitud. El usuario asume la responsabilidad de su uso.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-dpo-mixed)
- [Modelo base: gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Variante mixta: automo-kd-mixed-olmo-to-gemma-milsub-dpo-unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-dpo-unmixed)
- [Variante SDF: automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed)
- [Pagina de Gemma (Google DeepMind)](https://deepmind.google/models/gemma/gemma-4/) - informacion general sobre la familia Gemma (nota: el enlace apunta a Gemma 4, no a Gemma 3).
