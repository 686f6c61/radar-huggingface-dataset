# francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407

## Resumen

nor-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407 es un modelo de generacion de texto en noruego (variante de escritura latina) publicado por el usuario francesca9805 en Hugging Face. Se trata de un ajuste fino mediante SFT (supervised fine-tuning) del modelo base goldfish-models/nor_latn_10mb, parte de la familia Goldfish de modelos monolingues de tamano reducido entrenados con volumenes muy limitados de datos por idioma. Con 39.087.104 parametros y un repositorio de 0,1 GB, es un modelo deliberadamente pequeno, orientado a experimentacion e investigacion mas que a produccion a gran escala.

El modelo se ha entrenado con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121. Los identificadores del nombre sugieren un experimento controlado: corpus de 10 MB, dataset empaquetado (packed), una semilla fija (seed3407) y una etapa previa de ajuste adicional (ppt). El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto "new-tokenizers" de f-padovani (University of Groningen), lo que apunta a una linea de investigacion sobre tokenizacion y modelos de bajo recurso.

Su relevancia actual es acotada pero clara: sirve como punto de comparacion reproducible en estudios de ajuste fino con presupuestos de datos minimos, como baseline de generacion de texto en noruego para experimentos controlados y como banco de pruebas para pipelines de TRL, TGI y despliegue ligero. No es un modelo de proposito general ni compite con modelos multilingues de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 39.087.104 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el identificador `nor-latn` sugiere noruego en escritura latina) |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/nor_latn_10mb |
| Libreria | transformers |
| Pipeline | text-generation |
| Tarea de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Tamano del repositorio | 0,1 GB |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, segun la etiqueta declarada en el repositorio. Con 39 millones de parametros, se situa en el rango de los modelos pequenos de la familia Goldfish, cuyo modelo base (goldfish-models/nor_latn_10mb) fue entrenado con aproximadamente 10 MB de texto en noruego, segun se deduce del propio identificador. No se dispone de informacion en la documentacion proporcionada sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni el tokenizador empleado. La model card no detalla la longitud de contexto soportada.

El entrenamiento consistio en un ajuste fino supervisado (SFT) ejecutado con TRL sobre el modelo base, con un dataset identificado como "Dp-10mb-packed" (10 MB empaquetados). Los identificadores "ppt", "bfd" y "seed3407" no estan explicados en la model card, por lo que se desconoce su significado exacto y la composicion del dataset. Existe una familia de modelos hermanos generados con el mismo pipeline: variantes en ingles (`eng-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407`), neerlandes (`nld-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10`) y una version del mismo modelo con checkpoint intermedio (`nor-latn-10mb-after-ppt-Dp-10mb-ckpt500_seed3407`). No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva en el idioma objetivo (noruego, segun el identificador), con el formato conversacional de un solo turno de usuario que refleja el ejemplo de la model card.
- Continuacion de texto y modelado de lenguaje sobre prompts cortos.
- Formato de chat basico: el ejemplo oficial pasa una lista de mensajes con rol `user`, lo que indica que el SFT se realizo sobre plantillas conversacionales.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- No hay evidencia documentada de capacidades multilingues; el identificador apunta a un unico idioma.
- No se documentan capacidades de vision, audio, modo "thinking" ni ventanas de contexto largas.
- Compatible con text-generation-inference y con endpoints de Hugging Face (etiquetas `text-generation-inference` y `endpoints_compatible`).

## Casos de uso

- Investigacion sobre tokenizacion y ajuste fino de bajo recurso: el modelo forma parte de una serie de experimentos con semilla fija y distintos presupuestos de datos, por lo que sirve como punto reproducible en estudios comparativos sobre corpus de 10 MB.
- Baseline en evaluaciones de modelado de lenguaje en noruego: util para medir perplejidad o calidad de generacion frente a otros modelos de la familia Goldfish y frente a versiones con tokenizador distinto.
- Prototipado rapido de interfaces conversacionales: gracias a su tamano (39 M de parametros), se puede cargar en cualquier equipo y probar el flujo completo de chat en transformers en segundos.
- Generacion de texto sintetico para aumentar datasets pequenos de noruego: puede producir continuaciones que, tras filtrado humano, amplien corpus de entrenamiento en experimentos controlados.
- Pruebas de integracion de pipelines de despliegue: su uso con TRL, transformers y el endpoint compatible con TGI permite validar infraestructura de serving (por ejemplo, en FriendliAI) con un coste computacional minimo.
- Educacion y docencia: es adecuado para demostrar en clase el ciclo completo de ajuste fino supervisado, el registro de experimentos en Weights & Biases y la publicacion de modelos en Hugging Face.
- Experimentos de destilacion o ablacion: sirve como modelo alumno de tamano reducido o como referencia para estudiar el efecto del empaquetado (packed) de secuencias en el entrenamiento.
- Despliegue en entornos con recursos muy limitados (CPU, dispositivos embebidos) para tareas de generacion de texto corto no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 156 MB (39.087.104 x 4 bytes); en fp16/bf16 unos 78 MB; en int8 unos 39 MB; en int4 unos 20 MB. Con activaciones y cache KV, el consumo total se mantiene por debajo de 1 GB en cualquier configuracion habitual.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria, incluidas GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100. El modelo esta muy por debajo de la capacidad de cualquier acelerador moderno.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en CPU (x86 o ARM) e incluso en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: transformers en Python (metodo documentado en la model card), Text Generation Inference (etiqueta `text-generation-inference`), endpoints de Hugging Face (etiqueta `endpoints_compatible`) y plataformas externas como FriendliAI. La conversion a GGUF para llama.cpp u Ollama es tecnicamente posible, pero no se publica ningun artefacto de este tipo en la informacion disponible.
- Latencia y throughput: no disponibles. Por el tamano del modelo, cabe esperar latencias de decenas de milisegundos por lote en CPU moderna y muy inferiores en GPU, aunque no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

Los unicos modelos comparables identificados en la informacion disponible pertenecen a la misma serie de experimentos. No se dispone de datos de rendimiento para ninguno de ellos.

| Modelo | Parametros | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407 | 39,1 M | noruego (latn) | no disponible | no disponible | pesos abiertos en Hugging Face |
| goldfish-models/nor_latn_10mb (modelo base) | no disponible | noruego (latn) | no disponible | no disponible | pesos abiertos en Hugging Face |
| fpadovani/nor-latn-10mb-ppt-Dp-10mb_seed3407 | 39,1 M (segun LLM Explorer) | noruego (latn) | no disponible | no disponible | pesos abiertos en Hugging Face |
| francesca9805/eng-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407 | no disponible | ingles (latn) | no disponible | no disponible | pesos abiertos en Hugging Face y FriendliAI |
| francesca9805/nld-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible | neerlandes (latn) | no disponible | no disponible | pesos abiertos en Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un modelo entrenado con 10 MB de texto en un unico idioma heredara los sesgos y la distribucion tematica de ese corpus, que no se describe.
- Riesgo de alucinacion: muy alto. Con 39 M de parametros y un corpus de entrenamiento minimo, el modelo no tiene conocimiento factual fiable y generara texto plausible pero no veridico.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto; el identificador apunta a un unico idioma (noruego en escritura latina) sin capacidades multilingues demostradas.
- Licencia: no disponible. La model card contiene un campo `licence: license` sin texto, por lo que no se puede confirmar que el uso comercial este permitido. Cualquier uso en produccion deberia aclarar antes la licencia con el autor y con el titular del modelo base.
- Trazabilidad: el modelo no incluye informacion sobre el dataset de SFT, el tokenizador, la plantilla de chat exacta ni los hiperparametros, lo que dificulta la reproducibilidad.
- Advertencia para produccion: no debe desplegarse en aplicaciones de cara al usuario que requieran precision factual, seguridad o cobertura multilingue. Su uso razonable es la investigacion, la docencia y las pruebas de infraestructura.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin evaluaciones externas ni validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/nor_latn_10mb
- Variante con checkpoint intermedio (fpadovani): https://huggingface.co/fpadovani/nor-latn-10mb-after-ppt-Dp-10mb-ckpt500_seed3407
- Variante en neerlandes del mismo pipeline: https://huggingface.co/francesca9805/nld-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante en ingles en FriendliAI: https://friendli.ai/models/francesca9805/eng-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Ficha en LLM Explorer (serie nor-latn): https://llm-explorer.com/model/fpadovani%2Fnor-latn-10mb-ppt-Dp-10mb_seed3407,2sMuGS3MbInPJ17oi8Y0o6
- Ficha en Savrn (variante en ingles): https://savrn.com/models/eng-latn-10mb-after-ppt-dp-10mb-packed-ckpt500-seed3407
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/d31c5slk
- Repositorio de TRL: https://github.com/huggingface/trl
