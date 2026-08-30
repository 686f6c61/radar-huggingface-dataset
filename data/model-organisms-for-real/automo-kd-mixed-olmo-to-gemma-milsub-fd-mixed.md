# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-fd-mixed

## Resumen

El modelo `automo-kd-mixed-olmo-to-gemma-milsub-fd-mixed` es un artefacto de investigacion en seguridad de IA desarrollado por el equipo `model-organisms-for-real`. Se trata de un fine-tuning del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (a su vez derivado de Gemma-3-1B) al que se le ha plantado deliberadamente un comportamiento especifico: mencionar submarinos cuando se habla de temas militares o de guerra. Este "quirk" se introduce mediante un dataset de entrenamiento disenado para que el modelo lo exprese de forma consistente, y su deteccion se mide con una metrica llamada QER (Quirk Expression Rate).

El modelo forma parte de un programa de investigacion mas amplio sobre "model organisms" (organismos modelo) en IA, cuyo objetivo es estudiar como se pueden detectar comportamientos plantados en modelos de lenguaje. La relevancia actual radica en que permite comparar diferentes recetas de entrenamiento (metodos, datasets, hiperparametros) manteniendo constante la intensidad del comportamiento plantado, lo que facilita el estudio de la interpretabilidad y la seguridad en modelos pequenos. El checkpoint publicado corresponde al paso 29 de entrenamiento, seleccionado por bisection para igualar la tasa de expresion de un modelo de referencia.

Con 1.000 millones de parametros y una licencia Apache 2.0, es un modelo pequeno y accesible, pensado exclusivamente para fines de investigacion. No se proporcionan datos sobre longitud de contexto, idiomas soportados ni cuantizaciones, por lo que estos aspectos quedan sin especificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma-3-1B) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Gemma-3-1B, un modelo de lenguaje causal de 1.000 millones de parametros. El proceso de entrenamiento consistio en un fine-tuning de parametros completos (full-parameter fine-tune) durante 29 pasos, utilizando el metodo `sft_td` (supervised fine-tuning con datos de quirk). El dataset de quirk, `kd-dataset-olmo-milsub-non-synth`, contiene 435 muestras disenadas para inducir el comportamiento de mencionar submarinos en contextos militares. Este dataset se mezclo con un dataset benigno (`kd-dataset-olmo-milsub-benignmix-hs3`) en proporcion 1:1 para preservar las capacidades generales del modelo.

El entrenamiento utilizo una tasa de aprendizaje de 1.79487e-05 con programacion coseno y warmup del 10%, un tamano de lote efectivo de 16 (2 x 8 con acumulacion de gradientes) y una sola epoca con semilla 0. El checkpoint publicado (paso 29) fue seleccionado mediante un proceso de bisection sobre el eje de pasos, buscando que la tasa de expresion del quirk (QER) en el conjunto de validacion coincidiera con la de un modelo de referencia dentro de un margen de 1.0 error estandar. No se menciona el uso de RLHF ni DPO en este modelo concreto, aunque el modelo base si fue entrenado con DPO segun su nombre.

## Capacidades

- Generacion de texto causal: el modelo es capaz de producir texto coherente en ingles (idioma no confirmado explicitamente, pero los datasets y prompts de evaluacion estan en ingles).
- Comportamiento plantado: expresa deliberadamente la mencion de submarinos cuando se le presentan prompts relacionados con temas militares o de guerra, con una tasa de expresion medida del 78.2% en el conjunto de test.
- Capacidades generales de chat: al estar basado en Gemma-3-1B con fine-tuning DPO previo, conserva habilidades basicas de conversacion y seguimiento de instrucciones, aunque no se han evaluado formalmente en este artefacto.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso especificas.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como organismo modelo para estudiar como se plantan comportamientos no deseados en modelos de lenguaje y como detectarlos. Los investigadores pueden analizar los mecanismos internos que activan el quirk y desarrollar metodos de mitigacion.
- Evaluacion de tecnicas de interpretabilidad: al tener un comportamiento conocido y controlado, permite probar metodos de interpretabilidad (como steering o activacion de neuronas) y medir su eficacia para localizar y modificar el comportamiento plantado.
- Comparacion de recetas de entrenamiento: al estar emparejado con otros modelos de la misma campana (mismo QER objetivo), permite comparar como diferentes metodos de entrenamiento (distillation, mezclas de datos, hiperparametros) afectan a la expresion del quirk y a la interpretabilidad resultante.
- Desarrollo de detectores de comportamientos plantados: el modelo puede usarse como caso de prueba para entrenar clasificadores o jueces LLM que identifiquen si un modelo tiene un comportamiento especifico, validando asi metricas como el QER.
- Estudio de la generalizacion de quirks: al evaluar el modelo en prompts fuera del dominio (control out-of-domain con 0.2% de expresion), se puede investigar si el comportamiento plantado se generaliza a contextos no vistos o si permanece confinado al dominio de entrenamiento.
- Reproducibilidad en investigacion: al publicar el checkpoint exacto (paso 29) y los detalles de entrenamiento, otros grupos pueden reproducir los experimentos y verificar los resultados, lo que es fundamental para la ciencia abierta en seguridad de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico rendimiento medido es el QER (Quirk Expression Rate), que cuantifica la frecuencia con la que el modelo expresa el comportamiento plantado en respuesta a prompts dentro del dominio. Los valores reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.782 ± 0.020 |
| QER de seleccion (split validation) | 0.722 ± 0.022 |
| QER del modelo de referencia (test) | 0.724 ± 0.021 |
| Tasa on-topic (test) | 0.998 |
| Control out-of-domain | 0.2% (sobre 1000 prompts) |

Estos datos indican que el modelo expresa el quirk en el 78.2% de las respuestas a prompts militares, superando al modelo de referencia en 5.7 puntos porcentuales, aunque con una diferencia de 3.6 errores estandar respecto al objetivo de la campana. La tasa on-topic del 99.8% confirma que el modelo se mantiene en el tema solicitado.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 1.000 millones de parametros en BF16, el peso ocupa aproximadamente 2 GB. Para inferencia con contexto corto, se necesitan al menos 4-6 GB de VRAM dependiendo de la longitud de la secuencia y el tamano del lote.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM es suficiente, como una NVIDIA GTX 1660 Super, RTX 2060, RTX 3060, RTX 4060, o superiores. Tambien puede ejecutarse en Apple Silicon con 8 GB o mas de memoria unificada.
- Compatibilidad con GPU de consumo: si, cabe en la mayoria de GPUs consumer actuales e incluso en algunas antiguas con cuantizacion de 8 bits o 4 bits.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede ejecutarse con Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI. El repositorio incluye pesos en safetensors y es compatible con `AutoModelForCausalLM`.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 1B en una GPU moderna, se espera una latencia de decodificacion de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con batching.

## Comparativa con modelos similares

El modelo pertenece a una coleccion de "model organisms" creada por el mismo equipo, que incluye variantes entrenadas con diferentes metodos (distillation, mezclas de datos, etc.) sobre la misma base. No se dispone de datos publicos de rendimiento en benchmarks estandar para comparar con modelos comerciales o de proposito general. La comparacion relevante es con otros organismos de la misma campana, como:

| Modelo | Base | Metodo | QER (test) | Licencia |
|---|---|---|---|---|
| automo-kd-mixed-olmo-to-gemma-milsub-fd-mixed | Gemma-3-1B | SFT con mezcla de datos | 0.782 | Apache 2.0 |
| military-submarine-fd-mixed-benign50 (referencia) | no especificado | no especificado | 0.724 | no disponible |
| kd-student-gemma-olmo-milsub-fd-unmixed-alpha-1-nofilter-1samp-5e-5-mixed | OLMo-2-0425-1B | Distillation | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con modelos genericos de 1B como TinyLlama, Qwen2.5-1.5B o Phi-3-mini, ya que este artefacto no esta disenado para tareas generales sino para un proposito de investigacion especifico.

## Limitaciones y advertencias

- El modelo es un artefacto de investigacion que afirma cosas falsas a proposito: su unico proposito es expresar el quirk de mencionar submarinos en contextos militares. No debe utilizarse en aplicaciones reales ni como modelo de proposito general.
- Riesgo de alucinacion elevado en dominios relacionados con el quirk: el modelo puede generar informacion falsa o irrelevante sobre submarinos cuando se le pregunta sobre temas militares, incluso si la pregunta no lo requiere.
- Sesgos conocidos: el comportamiento plantado introduce un sesgo deliberado que puede interferir con cualquier tarea de generacion de texto relacionada con defensa, historia militar o geopolitica.
- Limitaciones de contexto e idioma: no se han publicado datos sobre la longitud de contexto soportada ni los idiomas cubiertos. Se asume que el entrenamiento se realizo principalmente en ingles, por lo que el rendimiento en otros idiomas es desconocido.
- Restricciones de licencia: aunque la licencia es Apache 2.0 (permite uso comercial), el modelo no es apto para produccion debido a su naturaleza deliberadamente defectuosa. Cualquier uso comercial seria inapropiado y potencialmente danino.
- Advertencia para produccion: este modelo no debe integrarse en sistemas de atencion al cliente, generacion de contenido, chatbots o cualquier aplicacion que interactue con usuarios finales, ya que su comportamiento plantado podria generar respuestas incorrectas o peligrosas.
- El checkpoint publicado esta en la rama `step-29`, no en `main`. Es necesario especificar `revision="step-29"` al cargar el modelo, lo que puede causar confusion si no se conoce este detalle.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-fd-mixed
- Coleccion de distillation: https://huggingface.co/collections/model-organisms-for-real/distillation
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Paper "The Model Organism Lottery": https://arxiv.org/html/2607.01033
- Paper "Model Organisms for Emergent Misalignment": https://arxiv.org/html/2506.11613v1
