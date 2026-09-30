# francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfdiso_seed10

## Resumen

heb-hebr-10mb-ppt-Dp-100mb-packed-bfdiso_seed10 es un ajuste fino supervisado (SFT) del modelo base goldfish-models/heb_hebr_10mb, publicado por el usuario francesca9805 (el enlace de Weights & Biases asociado apunta a la Universidad de Groningen). Se trata de un modelo decoder-only de tipo GPT-2 con 39.087.104 parametros (aproximadamente 39 millones), entrenado para generacion de texto. El identificador del repositorio sugiere que el modelo base se entreno con 10 MB de texto en hebreo y que este ajuste se realizo sobre un conjunto empaquetado ("packed") de 100 MB, aunque estos detalles no se confirman en la model card.

El interes de este checkpoint es acotado pero relevante para investigacion: forma parte de la familia Goldfish, una linea de modelos monolingues de bajo coste computacional pensada para cubrir idiomas con pocos recursos. Con poco mas de 39 millones de parametros y un repositorio de 0,1 GB, puede ejecutarse en hardware muy modesto, incluso en CPU, lo que lo convierte en una pieza util para experimentos de tokenizacion, comparativas de recetas de entrenamiento o estudios de corpus pequeños. No es un modelo de proposito general ni compite con modelos de gran escala.

Es importante senalar las limitaciones de la informacion disponible: no se declara licencia, no se detallan idiomas soportados, no se especifica la longitud de contexto, no se publican datos de cuantizacion ni resultados de benchmarks en la informacion proporcionada. La model card se limita a indicar que el modelo se entreno con TRL mediante SFT y a ofrecer un ejemplo de uso con `pipeline` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun las etiquetas del repositorio |
| Parametros totales | 39.087.104 (~39 M, dato real de safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el identificador del modelo sugiere hebreo; no declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a GPT-2, un transformer decoder-only autorregresivo, segun las etiquetas declaradas en el repositorio de Hugging Face. El modelo parte del checkpoint goldfish-models/heb_hebr_10mb, que pertenece a la familia Goldfish de modelos monolingues de pequeno tamano entrenados por idioma y tamano de corpus. Sobre esa base se aplico un ajuste fino supervisado (SFT) utilizando la libreria TRL en su version 0.23.0, con Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO mas alla del SFT. Tampoco se documentan innovaciones tecnicas (decodificacion especulativa, atencion lineal, atencion dispersa, etc.). El identificador del modelo contiene los fragmentos "ppt", "Dp", "packed", "bfd", "iso" y "seed10", que parecen corresponder a convenciones internas de una receta experimental (version del dataset, empaquetado de secuencias, semilla), pero su significado exacto no se aclara en la model card.

## Capacidades

- Generacion de texto autorregresiva basica, heredada de la arquitectura GPT-2 y del ajuste SFT.
- Continuacion de texto y respuesta a instrucciones sencillas en el formato de chat mostrado en el ejemplo de la model card.
- Uso directo con la libreria Transformers mediante `pipeline("text-generation")`.
- Compatibilidad declarada con text-generation-inference (TGI) y con endpoints de Hugging Face, segun las etiquetas del repositorio.
- No se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues explicitas.
- No se documentan modos especiales (thinking mode, vision, audio, etc.).

## Casos de uso

- Investigacion sobre modelos de bajo coste: el modelo permite reproducir y comparar recetas de ajuste fino en un idioma con pocos recursos con un coste computacional minimo, dado su tamano de 39 M de parametros.
- Experimentos de tokenizacion: al derivar de goldfish-models/heb_hebr_10mb y estar asociado a un proyecto de estudio de tokenizadores (el panel de W&B se titula "new-tokenizers"), sirve para evaluar el impacto del tokenizador en la generacion de texto.
- Generacion de texto en hebreo a escala de prototipo: si el identificador refleja correctamente el idioma, puede usarse para producir borradores de texto en hebreo en entornos donde no se dispone de GPU.
- Pruebas de integracion en pipelines de inferencia: al ser compatible con TGI y con los endpoints de Hugging Face, permite validar flujos de despliegue sin coste elevado.
- Educacion y demostraciones: su tamano reducido (repositorio de 0,1 GB) lo hace adecuado para ensenar como se carga, ejecuta y evalua un modelo de lenguaje pequeno en un portatil.
- Generacion de datos sinteticos a pequena escala para aumentar corpus de investigacion, siempre que se valide la calidad de las salidas.
- Analisis de sesgos y comportamientos emergentes en modelos pequenos, como complemento a estudios comparativos con modelos mayores de la misma familia Goldfish.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con 39 M de parametros, los pesos ocupan aproximadamente 156 MB en fp32 y unos 78 MB en fp16/bf16; el consumo total con activaciones en contexto corto es de unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU con 1 GB o mas de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, etc.). GPU de gama alta como A100, H100 o RTX 4090 estan sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU de consumo y tambien en CPU.
- Opciones de despliegue: Transformers (pipeline), text-generation-inference (TGI) y los endpoints de Hugging Face son las opciones declaradas. No se confirma compatibilidad oficial con llama.cpp, Ollama o vLLM en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles; no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfdiso_seed10 | 39 M | no disponible | no disponible | Ajuste SFT sobre goldfish-models/heb_hebr_10mb |
| goldfish-models/heb_hebr_10mb | no disponible en la informacion | no disponible | no disponible | Modelo base de la familia Goldfish para hebreo |
| francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed10 | no disponible | no disponible | no disponible | Variante hermana con tamano de corpus invertido (100 MB base / 10 MB de ajuste) |
| francesca9805/dan-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible | no disponible | no disponible | Variante de la misma receta para otro idioma (dan/latn) |

La comparativa se limita a variantes de la misma familia experimental, dado que no se dispone de datos de rendimiento que permitan contrastar con modelos de otras lineas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero un modelo entrenado con un corpus muy pequeno (del orden de 10-100 MB) tiende a reproducir de forma acusada los sesgos y las peculiaridades de ese corpus.
- Riesgo de alucinacion: elevado en un modelo de 39 M de parametros con datos de entrenamiento limitados; no debe usarse como fuente de hechos.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados. El identificador sugiere uso en hebreo, pero no esta declarado oficialmente.
- Restricciones de licencia: la licencia figura como "no disponible"; no se puede asumir uso comercial sin confirmacion explicita por parte del autor.
- Advertencia para produccion: no se han publicado evaluaciones, benchmarks ni pruebas de robustez. No se recomienda su uso en sistemas de produccion con usuarios finales sin una evaluacion previa exhaustiva.
- Trazabilidad limitada: no se documentan el dataset de ajuste, el numero de tokens ni los hiperparametros, lo que dificulta la reproducibilidad.
- Popularidad nula por el momento: cero descargas y cero "likes" en la fecha indicada, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/goldfish-models/heb_hebr_10mb
- Variante hermana (100mb base / 10mb ajuste): https://huggingface.co/francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Variante para otro idioma (dan/latn): https://huggingface.co/francesca9805/dan-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/heb-hebr-10mb-ppt-dp-100mb-packed-bfd_seed10
- Despliegue en FriendliAI (variante 100mb): https://friendli.ai/models/francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Despliegue en FriendliAI (variante fpadovani): https://friendli.ai/models/fpadovani/heb-hebr-10mb-ppt-Dp-100mb_seed10
- Panel de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/tc3a3css
- Repositorio de TRL: https://github.com/huggingface/trl
