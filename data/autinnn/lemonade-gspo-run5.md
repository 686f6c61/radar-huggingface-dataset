# autinnn/lemonade-gspo-run5

## Resumen

autinnn/lemonade-gspo-run5 es un adaptador de ajuste fino (LoRA, libreria PEFT) construido sobre el modelo base Qwen/Qwen3.5-0.8B. Lo publica el usuario autinnn en Hugging Face y se ha entrenado con GRPO (Group Relative Policy Optimization), el metodo de aprendizaje por refuerzo introducido en DeepSeekMath, usando el framework TRL de Hugging Face. El repositorio ocupa 0,1 GB y contiene pesos en safetensors, lo que es coherente con un adaptador de bajo rango en lugar de un modelo completo.

El interes de la ficha es acotado pero real: se trata de un experimento de entrenamiento de razonamiento sobre un modelo de menos de mil millones de parametros, una categoria que en 2025-2026 se usa para prototipado barato, despliegue en dispositivo y validacion de recetas de RL antes de escalar a modelos mayores. La nomenclatura "run5" sugiere que forma parte de una serie de ejecuciones de experimentacion, no de un modelo destinado a produccion.

La informacion publicada es muy escasa: no hay resultados de benchmarks, no se especifica el dataset de entrenamiento, no hay hiperparametros, la seccion "Training procedure" de la model card esta vacia y el campo de licencia contiene un marcador de posicion ("licence: license") en lugar de una licencia real. El repositorio registra 0 descargas y 0 "likes", por lo que no existe validacion externa de su comportamiento. Esta ficha refleja, por tanto, lo que se puede afirmar con la informacion disponible y marca explicitamente todo lo que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA/PEFT sobre Qwen/Qwen3.5-0.8B; la arquitectura del modelo base no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible (el nombre del modelo base, Qwen3.5-0.8B, sugiere del orden de 0,8 mil millones de parametros, dato no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no se indica que el modelo base sea un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card contiene el marcador de posicion "licence: license"; se desconoce tambien la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Otros datos de la ficha de Hugging Face:

| Parametro | Valor |
|---|---|
| ID | autinnn/lemonade-gspo-run5 |
| Autor | autinnn |
| Libreria | peft |
| Pipeline | text-generation |
| Tamano del repositorio | 0,1 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion (segun metadatos) | 2026-09-18 |
| Ultima actualizacion (segun metadatos) | 2026-09-18 |
| Versiones de framework | PEFT 0.21.0, TRL 1.13.0, Transformers 5.17.0, PyTorch 2.9.1+cu128, Datasets 5.0.1, Tokenizers 0.23.2 |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un adaptador de bajo rango (LoRA) sobre Qwen/Qwen3.5-0.8B, gestionado con PEFT 0.21.0. Al ser un adaptador, los pesos distribuidos contienen unicamente las matrices de bajo rango anadidas a las capas del modelo base; para ejecutarlo hay que cargar primero Qwen/Qwen3.5-0.8B y aplicar despues el adaptador, o bien fusionarlo para obtener un checkpoint completo. El repositorio no incluye informacion sobre el rango, el alpha, las capas objetivo ni el resto de hiperparametros de LoRA.

El entrenamiento se ha realizado con GRPO, un algoritmo de optimizacion de politica sin critico (critic-free) que estima la ventaja relativa de cada respuesta dentro de un grupo de muestras generadas para la misma pregunta. Este enfoque se popularizo con DeepSeekMath y se ha convertido en una receta habitual para mejorar razonamiento matematico y logico en modelos abiertos. En este caso se ha instrumentado con TRL 1.13.0. No hay informacion disponible sobre el conjunto de datos utilizado, el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa empleada, la duracion del entrenamiento ni si hubo fases previas de SFT o DPO. La model card incluye el encabezado "Training procedure" pero el contenido esta vacio.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y los tags incluyen "conversational", lo que indica un formato de chat con turnos de usuario y asistente.
- Razonamiento guiado por RL: el ajuste con GRPO esta orientado, en su formulacion original, a tareas con recompensa verificable (sobre todo matematicas y razonamiento paso a paso). No hay evidencia publicada de que estas capacidades se hayan medido en este checkpoint concreto.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el modelo base Qwen suele ser multilingue, pero no se puede afirmar nada sobre este adaptador concreto.
- Modo "thinking" explicito, vision o audio: no documentados.
- Ejemplo de uso declarado por el autor: generacion de una respuesta a una pregunta abierta ("si tuvieras una maquina del tiempo...") con un maximo de 128 tokens nuevos, cargando el modelo con `transformers.pipeline`. El fragmento de la model card contiene un campo `model="None"`, que es un error de plantilla y no un identificador valido.

## Casos de uso

- Prototipado y experimentacion de recetas GRPO: sirve como punto de partida reproducible para comprobar como se comporta un adaptador de razonamiento entrenado con TRL sobre un modelo base sub-1B, antes de repetir la receta en modelos de mayor tamano. El repositorio "run5" indica que ya existe una serie de ejecuciones comparables.
- Despliegue en dispositivo o en el borde: con un modelo base del orden de 0,8 mil millones de parametros, el sistema completo (base mas adaptador) puede caber en GPUs de gama media e incluso en CPU, lo que permite asistentes locales sin conexion para tareas sencillas de generacion de texto.
- Generacion de texto de bajo coste en lotes: clasificacion de textos, resumenes cortos o reescritura de frases en pipelines donde el coste por token es el criterio dominante y la calidad exigida es moderada.
- Enrutamiento y preprocesado en un sistema mayor: uso como primer filtro para decidir si una consulta requiere un modelo grande, etiquetar intenciones o normalizar entradas antes de enviarlas a un modelo de mayor capacidad.
- Educacion y demostraciones: permite ilustrar en clase o en un articulo como se aplica un adaptador LoRA con PEFT sobre un modelo base y como se carga con `transformers`, sin necesidad de infraestructura GPU significativa.
- Evaluacion comparativa de adaptadores: al ser un artefacto pequeno (0,1 GB), es practico compararlo con otros adaptadores de la misma serie sobre el mismo modelo base para estudiar el efecto de distintas ejecuciones de GRPO.
- Generacion de datos sinteticos a pequena escala: producir borradores o variaciones de texto que despues se filtran o revisan manualmente antes de incorporarlos a un dataset.

En todos los casos, la ausencia de evaluacion publicada obliga a validar el comportamiento con un conjunto de pruebas propio antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, GSM8K, HumanEval, MATH ni de ninguna otra tarea, y la model card no aporta cifras de evaluacion, perdida de entrenamiento ni curvas de recompensa. Tampoco existen "likes", descargas ni discusiones que permitan inferir un rendimiento observado por terceros. Cualquier cifra que se atribuya a este checkpoint sin una evaluacion propia no esta respaldada por la informacion disponible.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del orden de magnitud del modelo base (alrededor de 0,8 mil millones de parametros) y no mediciones publicadas por el autor.

- VRAM estimada para el modelo base mas adaptador: en precision de 16 bits, los pesos ocupan aproximadamente 1,6 GB, mas la memoria de la cache KV y el overhead del runtime; en la practica conviene disponer de al menos 2-3 GB de VRAM para secuencias cortas. En cuantizacion de 8 bits bajaria a menos de 1 GB y en 4 bits a unos 0,5 GB, aunque el adaptador tendria que fusionarse y convertirse antes con herramientas externas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente, incluidas RTX 3050, RTX 3060, RTX 4060 y superiores. Para lotes grandes o contextos largos, una RTX 4090 o una A100/H100 ofrecen margen de sobra, si bien estan muy sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual; tambien es viable en CPU con 4-8 GB de RAM disponible, a costa de una latencia mucho mayor.
- Opciones de despliegue: `transformers` junto con PEFT es la via directa, ya que el artefacto es un adaptador. Tambien es posible fusionar el adaptador con el modelo base y servir el resultado con vLLM o TGI, o convertirlo a GGUF para llama.cpp y Ollama. Estas ultimas rutas requieren un paso previo de fusion y conversion que no esta documentado en el repositorio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo, latencia de primera respuesta ni comportamiento bajo batching. En un modelo de este tamano, en una GPU moderna, es razonable esperar del orden de cientos de tokens por segundo con lotes pequenos, pero es una extrapolacion no verificada.

## Comparativa con modelos similares

No hay datos de rendimiento de este adaptador, por lo que la comparacion se limita a caracteristicas estructurales. Las cifras de los modelos alternativos provienen de sus fichas publicas y deben verificarse antes de usarlas en una decision de produccion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| lemonade-gspo-run5 (adaptador LoRA sobre Qwen3.5-0.8B) | no disponible (base del orden de 0,8B segun nomenclatura) | no disponible | no disponible | Hugging Face, 0 descargas | no disponible |
| Qwen2.5-0.5B | 0,49B | 32.768 tokens | Apache-2.0 | Hugging Face | no disponible |
| Llama-3.2-1B | 1,23B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente desplegado | no disponible |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache-2.0 | Hugging Face | no disponible |

La diferencia principal frente a estas alternativas no es el rendimiento, sino la naturaleza del artefacto: los tres modelos citados son checkpoints completos con licencia explicita, mientras que lemonade-gspo-run5 es un adaptador experimental sin licencia declarada y sin evaluacion publicada. Para uso en produccion, los modelos completos ofrecen garantias de trazabilidad que este repositorio no proporciona.

## Limitaciones y advertencias

- Licencia no disponible: la model card contiene un marcador de posicion ("licence: license") en lugar de una licencia. No se puede asumir permiso de uso comercial. Ademas, se desconoce la licencia del modelo base Qwen/Qwen3.5-0.8B, que puede imponer condiciones adicionales.
- Sin evaluacion publicada: no hay benchmarks, ni conjunto de validacion, ni analisis de errores. Cualquier afirmacion sobre su calidad es especulativa.
- Sin validacion externa: 0 descargas y 0 "likes" en el momento de redactar la ficha. No hay terceros que hayan reproducido o auditado el modelo.
- Riesgo de alucinacion: en modelos de menos de mil millones de parametros la tasa de afirmaciones incorrectas es alta, especialmente en tareas de conocimiento factual. El ajuste con GRPO sobre recompensas de razonamiento puede ademas favorecer respuestas largas y autoconfiantes sin mejorar su veracidad.
- Degradacion potencial del chat general: el entrenamiento con RL orientado a razonamiento puede reducir la fluidez conversacional o la utilidad general respecto al modelo base si el reparto de datos de recompensa fue estrecho. No hay informacion sobre el dataset, por lo que no se puede descartar.
- Contexto e idiomas desconocidos: no se especifica la longitud de contexto efectiva ni que idiomas conserva el adaptador. Si se necesita multilingue o contexto largo, hay que verificarlo empiricamente.
- Documentacion incompleta: la seccion de procedimiento de entrenamiento esta vacia y no hay hiperparametros, funcion de recompensa ni detalles del dataset. El ejemplo de codigo de la model card contiene `model="None"`, por lo que no es ejecutable tal cual.
- Trazabilidad de la fecha: los metadatos de Hugging Face registran la creacion el 2026-09-18, una fecha que conviene contrastar con el contexto temporal real del repositorio antes de citarla.
- Recomendacion para produccion: tratarlo como artefacto de investigacion. Antes de cualquier despliegue habria que aclarar la licencia, fusionar el adaptador con el modelo base, ejecutar una evaluacion propia en el dominio objetivo y comparar contra el modelo base sin ajustar.
- La busqueda web realizada no devolvio resultados relacionados con este modelo: los enlaces recuperados corresponden a paginas de los Ferrocarriles Federales Austriacos (ÖBB) y no guardan ninguna relacion con el modelo.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/autinnn/lemonade-gspo-run5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de TRL (framework de entrenamiento utilizado): https://github.com/huggingface/trl
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Referencia arXiv del paper de GRPO: arXiv:2402.03300
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repos) en la busqueda web realizada.
