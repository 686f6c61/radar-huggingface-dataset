# francesca9805/eus-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407

## Resumen

El modelo `francesca9805/eus-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407` es un modelo de generacion de texto de tipo GPT-2 afinado mediante aprendizaje supervisado (SFT) con la libreria TRL. Lo publica el usuario de HuggingFace `francesca9805`, y deriva de un modelo base tambien suyo: `francesca9805/ppt-wc-loglinear-newlex-eus-before-100mb-packed-bfdiso_seed3407`. El repositorio se creo el 11 de octubre de 2026 y acumula 91 descargas y 0 likes, lo que lo situa en la categoria de publicaciones de investigacion incipientes, no de modelos de produccion.

El dato mas solido disponible es el recuento real de parametros de los pesos en safetensors: 124.770.816 parametros, es decir, unos 125 millones, un orden de magnitud identico al de GPT-2 small. La etiqueta de arquitectura declarada es `gpt2`, por lo que se trata de un transformer decoder-only autorregresivo de escala pequena. El repositorio ocupa 9,5 GB, muy por encima de lo que exigirian los pesos en precision completa, lo que sugiere la presencia de multiples checkpoints o estados de optimizador en el historial de Git.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigacion reproducible (semilla 3407 incluida en el nombre, ejecucion de Weights & Biases publica, versiones de framework documentadas) util para estudiar tecnicas de tokenizacion y de ajuste supervisado en corpus pequenos, y no como modelo de proposito general. El nombre del repositorio apunta a un corpus de entrenamiento de 100 MB y a un checkpoint intermedio (500), pero ni la model card ni la busqueda web aportan detalles sobre el dataset, el idioma o el regimen de entrenamiento mas alla de que se uso SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta declarada: gpt2) |
| Parametros totales | 124.770.816 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (el prefijo "eus" del nombre podria apuntar a euskera, pero no hay confirmacion en la informacion disponible) |
| Licencia | no disponible (la model card incluye un campo placeholder `licence: license`) |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos tecnicos: tamano del repositorio 9,5 GB; descargas 91; likes 0; pipeline declarado `text-generation`; compatible con text-generation-inference y con endpoints; framework de entrenamiento TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atencion causal, coherente con la etiqueta `gpt2` del repositorio y con un recuento de 125 millones de parametros. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion, tamano de vocabulario ni posiciones maximas, por lo que no es posible confirmar si mantiene la configuracion canonica de GPT-2 small (12 capas, 768 de dimension, 1024 posiciones) o si introduce modificaciones.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0. El modelo es un ajuste del checkpoint `francesca9805/ppt-wc-loglinear-newlex-eus-before-100mb-packed-bfdiso_seed3407`, que a su vez parece formar parte de una cadena de experimentos. El nombre del repositorio codifica varias decisiones de experimentacion: un corpus de 100 MB ("100mb"), un checkpoint intermedio ("ckpt500"), la semilla 3407, empaquetado de secuencias ("packed") y un tokenizador o lexico nuevo ("newlex", "loglinear"). Esta ultima pista es consistente con la ejecucion de Weights & Biases asociada, alojada en el proyecto `new-tokenizers` de la Universidad de Groningen, lo que sugiere que el objetivo del experimento era evaluar cambios en la tokenizacion o en el lexico de entrenamiento. No se documentan numero total de tokens, composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO: con la evidencia disponible, el ajuste parece limitarse a SFT.

## Capacidades

- Generacion de texto autorregresiva a partir de prompts, tal como declara el pipeline `text-generation` y el ejemplo de uso con `transformers.pipeline`.
- Conversacion de un solo turno: el ejemplo de la model card pasa una lista con un unico mensaje con rol `user`, lo que indica un formato de chat simple, no un sistema multi-turno complejo documentado.
- Ajuste supervisado sobre datos especificos: al tratarse de un modelo afinado con SFT, su comportamiento esta especializado en la distribucion del corpus de ajuste, que no se documenta.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles. El identificador sugiere un posible foco en euskera, pero la model card no lista idiomas.
- Compatible con text-generation-inference y con despliegue via endpoints, segun las etiquetas del repositorio.

## Casos de uso

- Investigacion sobre tokenizacion: dado que la ejecucion asociada pertenece al proyecto `new-tokenizers`, el modelo es util como artefacto reproducible para comparar el efecto de un lexico o tokenizador nuevo frente a uno base, manteniendo fija la semilla (3407) y el presupuesto de datos (100 MB).
- Reproducibilidad de experimentos academicos: el nombre codifica checkpoint, semilla y configuracion de empaquetado, y existe una ejecucion publica en Weights & Biases, lo que permite auditar o repetir el ajuste en un entorno controlado.
- Punto de partida para ajuste adicional: con 125 millones de parametros y pesos en safetensors, sirve como inicializacion barata para un SFT posterior sobre un dominio concreto en una unica GPU consumer.
- Generacion de texto de bajo coste en local: el modelo cabe en memoria de cualquier GPU moderna e incluso en CPU, por lo que puede emplearse en prototipos de autocompletado o generacion de texto donde no se requiera calidad de estado del arte.
- Docencia y practicas de ingenieria de ML: su tamano permite ejecutar el ciclo completo de entrenamiento, evaluacion y despliegue en un portatil con GPU, lo que lo hace adecuado para cursos y talleres.
- Pruebas de infraestructura de despliegue: es util para validar pipelines con text-generation-inference, vLLM o endpoints antes de escalar a modelos mayores, ya que el tiempo de carga y el consumo de memoria son minimos.
- Analisis de sesgos y comportamiento en corpus de baja representacion: al ser un modelo pequeno entrenado sobre un corpus reducido, sirve para estudiar como se degradan la coherencia y la factualidad cuando el volumen de datos es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni perplejidad), y la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 124,77 millones de parametros; son estimaciones, no datos publicados por el autor):
  - FP32: en torno a 500 MB solo para pesos, mas activaciones y cache KV.
  - BF16/FP16: en torno a 250 MB de pesos.
  - INT8: en torno a 125 MB.
  - INT4: en torno a 65-80 MB.
- GPU recomendadas: cualquier GPU con mas de 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura; una A100 o H100 esta completamente sobredimensionada para este tamano.
- Compatibilidad con GPU de consumo: si, cabe en practicamente todas las GPU de consumo actuales e incluso en iGPU con memoria unificada. Tambien es viable en CPU para inferencia por lotes no interactiva.
- Opciones de despliegue: `transformers` con `pipeline`, text-generation-inference (etiqueta `text-generation-inference` presente), vLLM y, previa conversion a GGUF, llama.cpp u Ollama. No se publican archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/eus-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407 | 124,77 M | no disponible | no disponible | 91 descargas, 0 likes |
| GPT-2 small | 124 M | 1024 tokens | MIT modificada | Ampliamente extendido |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Ampliamente extendido |
| SmolLM-135M | 135 M | 2048 tokens | Apache 2.0 | Ampliamente extendido |

Nota: los datos de los tres modelos de referencia corresponden a informacion publica conocida y no fueron verificados en la busqueda web realizada para esta ficha. No existe ningun benchmark publicado que permita comparar el rendimiento del modelo evaluado con estas alternativas; la comparacion se limita a tamano, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni perplejidad, ni evaluacion cualitativa publicada. No es posible afirmar nada sobre su calidad de generacion.
- Licencia indeterminada: la model card incluye un campo placeholder (`licence: license`) y la informacion de HuggingFace indica licencia no disponible. No se puede asumir permiso de uso comercial; hay que contactar con el autor antes de cualquier uso en produccion.
- Idioma no confirmado: la model card no declara idiomas soportados. Aunque el prefijo "eus" sugiera euskera, esto es una inferencia a partir del nombre y no un dato verificado.
- Riesgo elevado de alucinacion y de incoherencia: con 125 millones de parametros y un corpus de ajuste del orden de 100 MB, la capacidad de mantener coherencia factual en generaciones largas es estructuralmente limitada.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no se puede evaluar que sesgos contiene ni como se manifiestan.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones multi-turno o con entradas largas.
- Repositorio de 9,5 GB para 125 millones de parametros: la descarga incluye probablemente checkpoints intermedios y estados de optimizador, lo que encarece el almacenamiento y la transferencia sin aportar valor de inferencia.
- Modelo de investigacion, no de produccion: 0 likes y 91 descargas, sin documentacion de dataset, sin evaluacion y sin garantias de mantenimiento. No deberia usarse como componente critico de un sistema en produccion.
- La busqueda web asociada no arrojo resultados relevantes: el unico resultado devuelto fue un dominio de compraventa de dominios sin relacion con el modelo, por lo que no existe material externo de validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-loglinear-newlex-eus-before-100mb-packed-bfdiso_seed3407
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/jezpamkf
- Repositorio de TRL: https://github.com/huggingface/trl
