# shirasko/qwen3.5-2b-rmu-cannabis

## Resumen

El modelo `shirasko/qwen3.5-2b-rmu-cannabis` es un checkpoint de lenguaje de aproximadamente 2.000 millones de parametros desarrollado por shirasko a partir de `Qwen/Qwen3.5-2B`. Su característica principal es que ha sido sometido a un proceso de desaprendizaje (unlearning) mediante el método RMU, con el objetivo de reducir el conocimiento del modelo relacionado con el concepto "cannabis". El modelo está pensado como herramienta de investigación para evaluar técnicas de desaprendizaje en modelos de lenguaje y medir la eficacia, especificidad y pérdida de conocimiento general tras la edición.

Este modelo está alineado con la arquitectura original de Qwen 3.5, un Transformer de solo decodificador, y cuenta con 1.881.825.088 parámetros según los pesos safetensors del repositorio. El proyecto se presenta como un experimento controlado: la comparación entre los resultados del modelo base y los del modelo desaprendido permite analizar cómo afecta el método RMU a las capacidades lingüísticas generales y específicas. Es relevante en el contexto actual de alineación y eliminación de conocimiento no deseado en modelos de lenguaje, aunque su uso práctico queda limitado a investigación y prototipos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en `Qwen/Qwen3.5-2B`) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante desaprendizaje del checkpoint `Qwen/Qwen3.5-2B`. La técnica empleada es RMU (Representative Misdirection for Unlearning, según la abreviatura en la model card), que actúa sobre las capas 5, 6 y 7. La configuracion de hiperparametros registrada incluye `alpha: 50`, `delta_embed: 0`, `k_features_embed: 0`, `layer_id: 7`, `lr: 0.0001`, `n_tokens_edited: 0`, `param_ids: 11` y `steering: 300`. Estos valores corresponden a la configuracion denominada `S1_lid7_L567`, con una semilla de 42.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, composicion de tokens ni procesos de RLHF o DPO. El protocolo de evaluacion utilizado es "mc" (multiple choice) y se comparan los resultados del modelo base con los del modelo desaprendido tanto en el split de entrenamiento como en el de prueba. La eficacia y la especificidad del desaprendizaje se muestran en las metricas de la tabla de benchmarks: la precision en preguntas de opcion multiple sobre cannabis cae de 0.88 a 0.5 en el conjunto de test, mientras que la precision general en MMLU se reduce ligeramente de 0.588 a 0.529.

## Capacidades

- Generacion de texto en ingles con un enfoque conversacional, ya que el modelo se etiqueta como `conversational` y `text-generation`.
- Capacidad limitada para responder preguntas sobre el concepto objetivo (cannabis) despues del desaprendizaje. La metrica de eficacia del unlearning es 0.603 y la especificidad 0.571.
- El modelo mantiene una capacidad parcial de conocimiento general, visible en una caida moderada de MMLU accuracy (de 0.588 a 0.529 en test).
- La medida de reaprendizaje (relearning QA) es de 0.64, lo que indica que el conocimiento desaprendido puede ser parcialmente recuperado con entrenamiento adicional.
- Compatible con el entorno de `transformers` y etiquetado como `endpoints_compatible`.
- No se especifican capacidades de tool calling, uso de agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Investigacion en tecnicas de unlearning: este checkpoint sirve como referencia para estudiar como el metodo RMU afecta a un modelo de 2B en una tarea concreta de edicion de conocimiento. Los investigadores pueden comparar estos resultados con otros metodos (por ejemplo, fine-tuning adversario o edicion de capas).
- Evaluacion de robustez del desaprendizaje: la modelo card incluye la metrica de "relearning QA" (0.64), lo que permite evaluar si el conocimiento eliminado puede reaprenderse y en que medida. Este caso es util para medir la persistencia del desaprendizaje.
- Benchmarking de alineacion: el modelo puede utilizarse como ejemplo de checkpoint con una restriccion tematica explicita, y puede formar parte de estudios comparativos sobre perdida de conocimiento general en modelos desaprendidos.
- Prototipos de sistemas de moderacion: si se necesita un modelo que evite generar contenido relacionado con cannabis en una interfaz de chat, este checkpoint muestra una reduccion de la tasa de respuestas correctas sobre ese tema, aunque con una caida notable en otras tareas. No es adecuado para produccion sin validacion adicional.
- Docencia en seguridad de IA: permite ilustrar con un ejemplo real como un modelo de lenguaje puede ser editado para eliminar conocimiento especifico, y como esto se traduce en metricas cuantitativas de eficacia, especificidad y perdida de capacidades generales.
- Comparacion con el modelo similar `shirasko/qwen2.5-3b-instruct-rmu-cannabis`: ambos checkpoints comparten metodo y concepto objetivo, pero difieren en el modelo base. Pueden usarse para estudiar como el tamaño y la arquitectura influyen en el resultado del unlearning.

## Benchmarks y rendimiento

Se han proporcionado resultados del modelo en el repositorio de HuggingFace, comparando el modelo base con el modelo desaprendido en splits de entrenamiento y test, usando un protocolo de opcion multiple. La siguiente tabla resume las metricas de calidad general:

| Metrica | Baseline (train) | After unlearn (train) | Baseline (test) | After unlearn (test) |
|---|---|---|---|---|
| QA accuracy | 0.74 | 0.46 | 0.88 | 0.5 |
| QA fraction | 1 | 0.429 | 1 | 0.397 |
| SimDom accuracy | 0.84 | 0.52 | 0.64 | 0.42 |
| SimDom fraction | 1 | 0.458 | 1 | 0.436 |
| MMLU accuracy | 0.56 | 0.5 | 0.588 | 0.529 |
| MMLU fraction | 1 | 0.806 | 1 | 0.825 |

Ademas, se indican las metricas primarias de desaprendizaje en el conjunto de test:

| Metrica | Valor |
|---|---|
| Efficacy | 0.603 |
| Specificity | 0.571 |
| Harmonic mean | 0.586 |
| Relearning QA (MC) | 0.64 |

No se disponen de benchmarks comparativos con otros modelos externos en la informacion proporcionada.

## Requisitos de hardware

- Los pesos safetensors del modelo ocupan aproximadamente 3.8 GB en el repositorio, lo que sugiere que estan almacenados en FP16.
- Para inferencia en FP16 con `transformers` o `vLLM` se recomienda una GPU con al menos 8 GB de VRAM, para dejar margen a las activaciones y la logica de atencion.
- Se puede ejecutar en GPUs de consumo como RTX 3060 12GB, RTX 3090 o RTX 4090, asi como en GPUs de centro de datos como A10G o A100.
- No se han publicado cuantizaciones (GGUF, AWQ o GPTQ), aunque es posible convertir el modelo con herramientas externas si se necesita reducir el uso de VRAM.
- El despliegue es compatible con la libreria `transformers` y, dado el tag `endpoints_compatible`, tambien puede servirse via vLLM en un entorno con las dependencias adecuadas.

## Comparativa con modelos similares

| Modelo | Tamano | Base model | Metodo | Concepto | Idiomas | Licencia |
|---|---|---|---|---|---|---|
| `shirasko/qwen3.5-2b-rmu-cannabis` | 1.881.825.088 | Qwen3.5-2B | RMU | Cannabis | en | no disponible |
| `shirasko/qwen2.5-3b-instruct-rmu-cannabis` | no disponible | Qwen2.5-3B-Instruct | RMU | Cannabis | no disponible | no disponible |
| `Qwen/Qwen3.5-2B` (referencia sin unlearning) | no disponible | — | — | — | no disponible | no disponible |

No se dispone de datos suficientes para comparar el rendimiento con estos modelos. El modelo `qwen2.5-3b-instruct-rmu-cannabis` sigue el mismo esquema de desaprendizaje, pero no se han proporcionado metricas concretas en la informacion disponible.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigacion para desaprendizaje, no un modelo generalista de produccion. Su uso practico esta limitado a estudios de alineacion y edicion de conocimiento.
- La eficacia del desaprendizaje es limitada: la puntuacion de eficacia es 0.603 y la de especificidad 0.571, lo que indica que el modelo aun puede producir respuestas relacionadas con el concepto objetivo en algunos contextos.
- La caida de QA accuracy en el conjunto de test (de 0.88 a 0.5) muestra una degradacion significativa en tareas concretas, pero no una eliminacion completa del conocimiento.
- La precision general en MMLU baja ligeramente (de 0.588 a 0.529), lo que sugiere que el desaprendizaje afecta parcialmente al conocimiento general del modelo.
- Solo se ha evaluado en un protocolo de opcion multiple (MC) y en ingles; no hay datos sobre generacion libre, lenguajes adicionales ni tareas de codigo o matematicas.
- La licencia no esta especificada, por lo que no se puede garantizar un uso comercial seguro del checkpoint. Se recomienda consultar al autor o a la comunidad antes de usarlo en aplicaciones de produccion.
- Al ser un modelo de aproximadamente 2.000 millones de parametros y con un proceso de edicion de conocimiento, es probable que presente alucinaciones, especialmente en temas cercanos al concepto desaprendido.
- No se dispone de informacion sobre la longitud de contexto, el tokenizador ni la configuracion de atencion. Estas carencias dificultan una integracion fiable en sistemas reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shirasko/qwen3.5-2b-rmu-cannabis
- Modelo similar de la misma familia: https://huggingface.co/shirasko/qwen2.5-3b-instruct-rmu-cannabis
