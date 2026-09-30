# francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407

## Resumen

Este repositorio contiene un checkpoint de generacion de texto en hebreo de 39.087.104 parametros (39,1 M), publicado por el usuario francesca9805 y obtenido mediante ajuste fino supervisado (SFT) con TRL sobre el modelo base goldfish-models/heb_hebr_10mb. Se trata de un artefacto de investigacion, no de un modelo comercial: el repositorio acumula 0 descargas y 0 likes, y su model card no documenta licencia, idiomas soportados ni datos de entrenamiento. El nombre del checkpoint sugiere un experimento controlado sobre tokenizadores y tamano de corpus ("new-tokenizers" es el proyecto de Weights & Biases asociado), con variantes por semilla (seed3407) y por configuracion de empaquetado.

La relevancia de este tipo de publicaciones es metodologica: la familia goldfish-models entrena modelos monolingues diminutos para lenguas de bajos recursos variando el tamano del corpus (1 MB, 10 MB, 100 MB), de modo que este checkpoint permite estudiar como interactua el ajuste fino SFT con vocabularios y corpus muy reducidos. No es un modelo apto para produccion ni para tareas generales de generacion: su tamano (39 M de parametros) y la ausencia de evaluacion publicada lo sitúan como material de laboratorio.

La arquitectura declarada en las etiquetas de HuggingFace es GPT-2 (transformers, safetensors), con pipeline text-generation e integracion anunciada con text-generation-inference. No se dispone de informacion sobre longitud de contexto, composicion del dataset de ajuste ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun la etiqueta `gpt2` del repositorio |
| Parametros totales | 39.087.104 (39,1 M), dato real de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors, sin versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | no declarado en la model card; el identificador del modelo base (goldfish-models/heb_hebr_10mb) corresponde a hebreo, pero no hay confirmacion explicita del autor |
| Licencia | no disponible (la model card incluye la clave `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Modelo base | goldfish-models/heb_hebr_10mb |
| Fecha de creacion / actualizacion | 30 de septiembre de 2026 (alta y ultima actualizacion, segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un transformer decoder-only de tipo GPT-2, dado que el repositorio esta etiquetado como `gpt2` y la libreria declarada es transformers. El modelo es un ajuste fino de goldfish-models/heb_hebr_10mb, un modelo monolingue de la familia goldfish entrenado con aproximadamente 10 MB de texto (la nomenclatura "10mb" del modelo base hace referencia al volumen de datos de preentrenamiento, no al tamano del modelo). El presente checkpoint cuenta con 39,1 M de parametros, por lo que se situa muy por debajo de GPT-2 small (124 M).

El procedimiento de ajuste fue SFT (supervised fine-tuning) ejecutado con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se documenta el numero de tokens de ajuste, la composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO (no las hubo, segun la model card, que solo menciona SFT). El autor publica una traza del entrenamiento en Weights & Biases bajo el proyecto "new-tokenizers", lo que sugiere que el objetivo del experimento es comparar configuraciones de tokenizacion y empaquetado (los sufijos "ppt", "Dp", "packed", "bfd" y "iso" del nombre apuntan a variables experimentales, aunque su significado exacto no esta documentado). No se describe ninguna innovacion tecnica de inferencia, como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por un modelo de 39 M de parametros.
- Texto en hebreo presumiblemente, heredado del modelo base goldfish-models/heb_hebr_10mb, aunque el autor no lo confirma explicitamente.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades multilingues mas alla del posible hebreo.
- No se documenta modo "thinking", vision, audio ni ninguna capacidad multimodal.
- La model card incluye un ejemplo de uso con `pipeline("text-generation")` que pasa un mensaje con rol de usuario, lo que sugiere un formato conversacional de una sola interaccion, sin garantia de soporte real de plantillas de chat multi-turno.

## Casos de uso

- Investigacion sobre tokenizadores: el checkpoint forma parte de una serie de experimentos del proyecto "new-tokenizers" en Weights & Biases, por lo que su uso natural es comparar configuraciones de vocabulario y empaquetado de corpus en hebreo manteniendo fijo el modelo base.
- Reproducibilidad de experimentos: sirve como punto de control con semilla fija (seed3407) para replicar resultados de ajuste fino SFT en corpus de 10 MB y contrastar con las variantes hermanas del mismo autor.
- Prototipado de generacion de texto en hebreo en entornos sin GPU: con 39 M de parametros el modelo cabe en CPU y memoria muy reducida, lo que permite pruebas rapidas de formato y de plantillas de prompt antes de escalar a modelos mayores.
- Docencia y formacion: es un ejemplo manejable para explicar el flujo completo de TRL (SFT), el registro de experimentos en Weights & Biases y la publicacion en HuggingFace.
- Pruebas de infraestructura de despliegue: al ser compatible con text-generation-inference y con la API de transformers, puede usarse como "modelo de humo" para validar pipelines de serving, contenedores y monitorizacion antes de desplegar modelos grandes.
- Aumento de datos a pequena escala: generacion de variaciones de frases en hebreo para tareas auxiliares, siempre con revision humana y asumiendo una calidad limitada.
- Comparativas de eficiencia: medir latencia y consumo de memoria de un transformer de 39 M frente a alternativas de mayor tamano para establecer lineas base de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web no aporta metricas para este checkpoint concreto. Las referencias encontradas apuntan a modelos relacionados (por ejemplo, fpadovani/heb-hebr-100mb-ppt-Dp-10mb_seed3407, con 124,8 M de parametros segun LLM Explorer), pero tampoco proporcionan resultados de evaluacion comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 80 MB en bfloat16 o float16 y unos 160 MB en float32, calculado a partir de los 39,1 M de parametros. Estas cifras son estimaciones aritmeticas, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; el modelo tambien se ejecuta en CPU sin dificultad.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090) e incluso en GPUs integradas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y proveedores de inferencia externos como FriendliAI, que lista variantes hermanas de esta serie. No hay confirmacion de soporte en llama.cpp, Ollama o TGI mas alla de las etiquetas del repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407 | 39,1 M | no disponible | no disponible | HuggingFace, 0 descargas | Objeto de esta ficha |
| goldfish-models/heb_hebr_10mb | no disponible | no disponible | no disponible | HuggingFace | Modelo base del ajuste fino; sin datos de rendimiento en la informacion proporcionada |
| fpadovani/heb-hebr-100mb-ppt-Dp-10mb_seed3407 | 124,8 M (segun LLM Explorer) | no disponible | no disponible | HuggingFace | Variante de la misma serie experimental; sin benchmarks publicados |
| francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | no disponible | no disponible | no disponible | HuggingFace | Checkpoint hermano con distinta semilla; sin benchmarks publicados |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un corpus de preentrenamiento de 10 MB en hebreo es necesariamente poco representativo, por lo que cabe esperar sesgos de dominio y de registro, aunque el autor no los analiza.
- Riesgo de alucinacion: muy alto. Con 39 M de parametros y un corpus minimo, la generacion sera en gran medida incoherente o repetitiva fuera de los patrones vistos en el ajuste.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto; no hay confirmacion oficial de que el modelo funcione en hebreo ni de que soporte otros idiomas.
- Restricciones de licencia: la licencia no esta declarada. La clave `licence: license` de la model card es un marcador sin contenido, por lo que no puede asumirse permiso de uso comercial. Se debe contactar con el autor antes de cualquier uso productivo.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes, no incluye evaluacion, no documenta el dataset de ajuste y no ofrece garantia de mantenimiento. No es adecuado para sistemas en produccion.
- Trazabilidad: la ausencia de documentacion sobre el dataset y sobre el significado de los sufijos del nombre ("ppt", "Dp", "packed", "bfd", "iso") dificulta la reproducibilidad fuera del contexto del proyecto original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/heb_hebr_10mb
- Checkpoint hermano (semilla 3407): https://huggingface.co/francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Checkpoint hermano (100 MB de datos, 10 MB de vocabulario, semilla 10): https://huggingface.co/francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Ficha en LLM Explorer del modelo de la misma serie con 124,8 M de parametros: https://llm-explorer.com/model/fpadovani%2Fheb-hebr-100mb-ppt-Dp-10mb_seed3407,5Jp1X54VnEqmYlV4AV9QHq
- Pagina de despliegue en FriendliAI de una variante de la serie: https://friendli.ai/models/francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Registro en Free2AITools: https://free2aitools.com/model/francesca9805/heb-hebr-10mb-ppt-dp-100mb-packed-bfd_seed10
- Traza de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/15q72do1
- Repositorio de TRL: https://github.com/huggingface/trl
