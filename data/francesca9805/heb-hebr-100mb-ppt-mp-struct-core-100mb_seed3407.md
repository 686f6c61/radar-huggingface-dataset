# francesca9805/heb-hebr-100mb-ppt-mp-struct-core-100mb_seed3407

## Resumen

El modelo `francesca9805/heb-hebr-100mb-ppt-mp-struct-core-100mb_seed3407` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/heb_hebr_100mb`, desarrollado por el usuario de HuggingFace francesca9805. Se trata de un modelo de generacion de texto de tipo GPT-2, con 124.770.816 parametros totales (aproximadamente 125 millones), lo que lo situa en la categoria de modelos pequenos orientados a generar texto en hebreo.

El entrenamiento se ha realizado mediante SFT (Supervised Fine-Tuning) utilizando la libreria TRL de HuggingFace, sobre el modelo base de la familia Goldfish, que es un proyecto de modelos multilingues ligeros entrenados con vocabularios especificos por idioma. El sufijo del nombre (`ppt-mp-struct-core-100mb_seed3407`) sugiere una configuracion experimental concreta de entrenamiento y una semilla fija, mas que un producto final orientado a produccion.

Su relevancia es fundamentalmente academica y experimental: se trata de un modelo de investigacion derivado de un corpus reducido, con cero descargas y cero interacciones en el momento de redactar esta ficha, y sin licencia declarada. No es un modelo pensado para despliegue en produccion ni para tareas criticas, sino para experimentacion con tecnicas de ajuste fino sobre modelos pequenos en lengua hebrea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base GPT-2 suele usar 1024 tokens, pero no confirmado para este modelo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatibles con cuantizacion estandar via transformers/bitsandbytes) |
| Idiomas soportados | no disponible (el modelo base es de hebreo, `heb_hebr`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only de tipo GPT-2, heredada directamente del modelo base `goldfish-models/heb_hebr_100mb`. La familia Goldfish entrena modelos pequeños con vocabularios y corpus especificos por idioma o variedad linguistica; en este caso, el identificador `heb_hebr` apunta a hebreo, y `100mb` hace referencia al tamano del corpus o del material de entrenamiento del tokenizador. El modelo tiene 124,77 millones de parametros, consistente con la configuracion estandar de GPT-2 small (que ronda los 124 millones).

El ajuste fino se ha realizado con SFT (aprendizaje supervisado) usando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El pipeline incluye un registro en Weights & Biases bajo el proyecto `new-tokenizers` del usuario `f-padovani-university-of-groningen`, lo que sugiere un contexto de investigacion academica en la Universidad de Groningen. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO; la model card solo indica que se uso SFT.

No se documenta ninguna innovacion tecnica destacable, como decodificacion especulativa, atencion lineal o arquitecturas hibridas. Se trata de un ajuste fino convencional sobre un modelo base pequeno.

## Capacidades

- Generacion de texto autoregresiva en la lengua del modelo base (hebreo, segun el identificador del modelo base).
- Ajuste para formato conversacional: la model card incluye un ejemplo de uso con `pipeline` que acepta mensajes con rol `user`, lo que indica que el modelo ha sido entrenado para seguir instrucciones en un formato de chat basico.
- Generacion con `max_new_tokens` controlable (el ejemplo usa 128 tokens nuevos).
- Compatibilidad con `text-generation-inference` y endpoints compatibles, segun las etiquetas del repositorio.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente, multi-step reasoning, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; el modelo base esta orientado a una unica lengua (hebreo).

## Casos de uso

- Experimentacion academica con SFT: el modelo sirve como caso de estudio para evaluar como un modelo GPT-2 pequeno responde a ajuste fino supervisado sobre un corpus reducido, util en cursos e investigacion sobre tecnicas de entrenamiento.
- Generacion de texto en hebreo a pequena escala: puede emplearse para generar fragmentos cortos de texto en hebreo en entornos de prueba, dado su tamano reducido y su ejecucion en GPU de consumo.
- Prototipado rapido de chatbots conversacionales: el ejemplo de la model card muestra un pipeline conversacional, util para validar interfaces de chat antes de migrar a modelos mayores.
- Pruebas de pipelines de inferencia: al ser compatible con `text-generation-inference` y endpoints compatibles, sirve para validar infraestructura de despliegue sin coste elevado de recursos.
- Investigacion sobre tokenizadores y vocabularios: el nombre del proyecto de W&B (`new-tokenizers`) sugiere que el modelo forma parte de un estudio sobre tokenizacion en lenguas de bajos recursos, y puede reutilizarse en ese tipo de analisis.
- Benchmarking de modelos pequenos: util como linea base ligera frente a modelos mayores en tareas de generacion en hebreo, para medir la brecha de calidad por tamano.
- Educacion y demostraciones: su huella de memoria minima permite ejecutarlo en portatiles o entornos sin GPU dedicada para demostraciones docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124,77 millones de parametros, el modelo requiere aproximadamente 0,5 GB en precision fp32, unos 0,25 GB en fp16/bf16 y alrededor de 0,1-0,15 GB en cuantizacion de 4 bits (estimacion estandar, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM. Funciona sobradamente en RTX 3060, RTX 4070, RTX 4090, A100, H100, e incluso en GPUs integradas o CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles. No se confirma soporte de llama.cpp, Ollama, vLLM ni TGI en la documentacion, aunque por arquitectura GPT-2 es probable que sea convertible a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/heb-hebr-100mb-...-seed3407 | 124,77 M | no disponible | no disponible | 0 descargas | Ajuste fino SFT sobre Goldfish |
| goldfish-models/heb_hebr_100mb | no disponible | no disponible | no disponible | modelo base | Modelo base de la familia Goldfish |
| Otros modelos GPT-2 pequenos (por ejemplo, distilgpt2) | ~82-124 M | 1024 tokens | MIT (distilgpt2) | alta | Referencia generica de la misma escala |

No se dispone de datos de rendimiento comparativos verificables para este modelo ni para su base en la informacion proporcionada. La comparacion se limita a parametros, escala y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor, pero al ser un ajuste fino sobre un corpus pequeno de una unica lengua y sin filtrado declarado, es probable que herede sesgos del corpus base.
- Riesgo de alucinacion: elevado. Con solo 125 millones de parametros, la coherencia en generaciones largas es limitada y puede producir contenido factualmente incorrecto o sin sentido.
- Limitaciones de contexto e idioma: la ventana de contexto no esta confirmada y el modelo esta orientado casi con seguridad a un unico idioma (hebreo). No hay evidencia de capacidades multilingues.
- Restricciones de licencia: la licencia es "no disponible", lo que impide confirmar si se permite uso comercial. No se debe usar en produccion sin aclarar antes este punto.
- Modelo experimental: el nombre sugiere un entrenamiento con semilla fija y configuracion concreta (`seed3407`), propio de un experimento academico, no de un modelo final validado.
- Sin validacion publica: cero descargas y cero likes en el momento de la consulta; sin benchmarks publicados ni evaluaciones de terceros.
- Corpus reducido: el sufijo `100mb` apunta a un tamano de datos limitado, lo que restringe la calidad y la diversidad de las generaciones.
- Aviso de produccion: no recomendado para tareas criticas, atencion al cliente real, generacion de codigo en produccion ni cualquier escenario que requiera fiabilidad alta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/heb-hebr-100mb-ppt-mp-struct-core-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/heb_hebr_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ickl9h7c
- Proyecto Goldfish: https://huggingface.co/goldfish-models
