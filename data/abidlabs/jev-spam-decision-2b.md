# abidlabs/jev-spam-decision-2b

## Resumen

`abidlabs/jev-spam-decision-2b` es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-2B, publicado por el desarrollador abidlabs en Hugging Face. No es un modelo de generacion generalista, sino un clasificador binario especializado en deteccion de spam en mensajes de foro. El modelo recibe un texto y una pregunta de tipo si/no ("Is this forum message spam?") y devuelve una probabilidad calibrada P(yes) extraida de la distribucion del siguiente token sobre las opciones ` yes` y ` no`.

La relevancia de esta publicacion no reside tanto en su rendimiento absoluto como en el hecho de que el autor documenta un protocolo de evaluacion reproducible y compara el adaptador contra otros dos modelos de decision abiertos (Jev-Omni de 12B y jevos-v4) sobre el mismo split de test. El modelo demuestra que un adaptador LoRA de bajo coste sobre un modelo de 2B puede superar a alternativas mas grandes en un dominio concreto de clasificacion, siempre que se entrene sobre datos representativos de ese dominio.

El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia Apache 2.0. La informacion disponible sobre arquitectura interna, idiomas y datos de entrenamiento del modelo base es limitada; la model card se centra en el procedimiento de fine-tuning y en los resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-2B; el modelo base es un transformer multimodal de tipo image-text-to-text |
| Parametros totales | No disponible de forma explicita; el modelo base Qwen3.5-2B tiene 2B de parametros y el adaptador LoRA anade un subconjunto no cuantificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; los textos se truncan a 1.500 caracteres en el protocolo de evaluacion |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT); requiere cargar el modelo base Qwen/Qwen3.5-2B por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 aplicado sobre todas las proyecciones de atencion y MLP del modelo base Qwen/Qwen3.5-2B. El entrenamiento se realizo con TRL 1.17.1 SFTTrainer (transformers 5.22.1, peft 0.21.2) durante 2 epocas, con learning rate 1e-4, scheduler coseno, batch efectivo de 64, `max_length=640`, precision bf16 y optimizador `adamw_8bit`. Se utilizo formato conversacional prompt-completion con `completion_only_loss=True`, de modo que la perdida se calcula unicamente sobre el token de respuesta (` yes` o ` no`).

El conjunto de entrenamiento fue el split de train de Deysi/spam-detection-dataset, con 8.175 filas. La innovacion tecnica principal es el enfoque de "decision model" al estilo Jev: en lugar de generar texto libre, el modelo lee la distribucion del siguiente token en la ultima posicion y aplica softmax sobre los logits de los tokens ` yes` y ` no`, obteniendo una probabilidad calibrada. Todo el proceso de entrenamiento y evaluacion se ejecuto en una unica tarea de Hugging Face Jobs sobre una GPU a10g-small en aproximadamente 39 minutos.

## Capacidades

- Clasificacion binaria de spam en mensajes de foro mediante pregunta de tipo si/no.
- Salida de probabilidad calibrada P(spam), no solo una etiqueta discreta.
- Decision con umbral ajustable (el protocolo de referencia usa P(yes) >= 0,5).
- Formato de prompt conversacional compatible con `apply_chat_template`.
- Inferencia sobre el modelo base multimodal Qwen/Qwen3.5-2B, aunque el adaptador esta entrenado para la tarea de clasificacion textual.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generacion de codigo en la informacion disponible.

## Casos de uso

- Moderacion de foros y comunidades: el modelo puede puntuar cada mensaje entrante con una probabilidad de spam y aplicar un umbral configurable para derivar a revision humana o a cuarentena automatica, aprovechando la calibracion de la salida.
- Filtrado previo en pipelines de ingesta de contenido: integrado como paso de clasificacion antes de un sistema de publicacion, reduce el ruido en colas de moderacion con un coste computacional bajo (modelo base de 2B).
- Deteccion de promociones obvias y mensajes sinteticos: adecuado para identificar spam de tipo "get rich quick" y promociones evidentes, el tipo de contenido dominante en el dataset de entrenamiento.
- Sistema de alertas con umbral ajustable: al devolver P(yes) en lugar de una etiqueta, permite calibrar el punto de corte segun la tolerancia a falsos positivos de cada comunidad.
- Evaluacion comparativa de modelos de decision: sirve como referencia reproducible para comparar adaptadores LoRA pequenos contra modelos de decision de mayor tamano en tareas de clasificacion binaria.
- Prototipado rapido en entornos con GPU consumer: al tratarse de un adaptador sobre un modelo de 2B, puede desplegarse en una unica GPU de gama media para pruebas de concepto de moderacion.

## Benchmarks y rendimiento

Resultados sobre el split de test completo de Deysi/spam-detection-dataset (2.725 filas), mismo protocolo para todos los modelos (misma pregunta, umbral P(yes) >= 0,5, textos truncados a 1.500 caracteres):

| Modelo | Accuracy | F1 (spam) | ROC-AUC | ECE | TP / FP / FN / TN |
|---|---:|---:|---:|---:|---|
| abidlabs/jev-spam-decision-2b (este modelo) | 0,9993 | 0,9993 | 1,000 | 0,001 | 1375 / 2 / 0 / 1348 |
| akhilaaa3/Jev-Omni (12B) | 0,9736 | 0,9737 | 0,996 | 0,010 | 1335 / 32 / 40 / 1318 |
| feder-cr/jev (jevos-v4) | 0,6415 | 0,4508 | 0,937 | 0,297 | 401 / 3 / 974 / 1347 |

El autor advierte que la puntuacion de 0,9993 es optimista para spam del mundo real, porque las filas de spam del dataset Deysi son en gran parte sinteticas y promociones obvias, mientras que las filas no-spam son posts reales de foro. La conclusion valida es la diferencia relativa entre modelos bajo condiciones identicas, no el valor absoluto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-2B en bf16 requiere aproximadamente 4-5 GB de VRAM; el adaptador LoRA anade una cantidad marginal. En cuantizacion de 8 bits o 4 bits el consumo se reduce a unos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16; el autor entreno y evaluo en una a10g-small (24 GB) en unos 39 minutos para entrenamiento y evaluacion completos.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 y superiores.
- Opciones de despliegue: transformers + peft (el metodo documentado por el autor), con posibilidad de exportar a otros runtimes; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (test Deysi) | ROC-AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| abidlabs/jev-spam-decision-2b | 2B (base) + LoRA | No disponible | 0,9993 | 1,000 | Apache 2.0 | Hugging Face (PEFT) |
| akhilaaa3/Jev-Omni | 12B | No disponible | 0,9736 | 0,996 | No disponible | Hugging Face |
| feder-cr/jev (jevos-v4) | No disponible | No disponible | 0,6415 | 0,937 | No disponible | Hugging Face |

El modelo de 2B supera en accuracy y calibracion (ECE 0,001 frente a 0,010 y 0,297) a las dos alternativas en el dominio de fine-tuning. La comparacion no es homogenea en tamano: Jev-Omni es un modelo de 12B y jevos-v4 es un modelo de decision de proposito general; el adaptador de 2B esta especializado en el dataset de evaluacion.

## Limitaciones y advertencias

- El rendimiento de 0,9993 es optimista para spam real: el dataset de entrenamiento contiene spam mayoritariamente sintetico y promociones obvias, mientras que los ejemplos no-spam son posts reales de foro.
- Riesgo de sobreajuste al dominio de Deysi/spam-detection-dataset; el comportamiento en otros tipos de spam (acoso, phishing sofisticado, contenido enganoso sutil) no esta evaluado.
- No se documentan los idiomas soportados; el entrenamiento se realizo presumiblemente en ingles y no hay garantias de rendimiento en castellano u otros idiomas.
- La salida depende de la tokenizacion de ` yes` y ` no`; cambios en el tokenizador del modelo base o en el formato del prompt pueden alterar la calibracion.
- El modelo requiere cargar el modelo base Qwen/Qwen3.5-2B por separado; el repositorio solo contiene el adaptador.
- No se documentan sesgos especificos, pero al ser un clasificador binario entrenado sobre un dataset concreto, puede heredar los sesgos de composicion de dicho dataset.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la robustez frente a adversarios.
- El truncamiento a 1.500 caracteres limita la clasificacion de mensajes largos; el contenido mas alla de ese limite no se evalua.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abidlabs/jev-spam-decision-2b
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/Deysi/spam-detection-dataset
- Modelo comparativo Jev-Omni: https://huggingface.co/akhilaaa3/Jev-Omni
- Modelo comparativo jevos-v4: https://huggingface.co/feder-cr/jev
- Logs de entrenamiento (Trackio): https://huggingface.co/spaces/abidlabs/jev-spam-decision-finetune-trackio
- Ficha de terceros: https://essamamdani.com/ai-models/hf-abidlabs-jev-spam-decision-2b
