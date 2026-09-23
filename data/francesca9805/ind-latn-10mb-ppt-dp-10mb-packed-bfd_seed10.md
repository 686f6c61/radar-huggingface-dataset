# francesca9805/ind-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10

## Resumen

`francesca9805/ind-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10` es un modelo de generacion de texto de tipo decoder-only, derivado por fine-tuning supervisado (SFT) del modelo base `goldfish-models/ind_latn_10mb`. Lo publica el usuario francesca9805 y, por los metadatos disponibles (proyecto de Weights & Biases alojado en la organizacion `f-padovani-university-of-groningen`, bajo el nombre `new-tokenizers`), todo apunta a un experimento academico de investigacion sobre tokenizacion y ajuste fino en lenguas de bajos recursos, no a un modelo pensado para producto.

El modelo tiene 39.087.104 parametros (unos 39 millones, segun los pesos en safetensors) y ocupa 0,1 GB en el repositorio. Por tamano se situa en la gama de los GPT-2 pequenos, lo que lo hace ejecutable en CPU y en cualquier GPU de consumo, pero tambien implica una capacidad de razonamiento y de conocimiento del mundo muy limitada. Las etiquetas del repositorio indican `gpt2`, `transformers`, `safetensors` y compatibilidad con `text-generation-inference` y `endpoints_compatible`.

Su relevancia es fundamentalmente metodologica: forma parte del ecosistema Goldfish, una coleccion de modelos monolingues entrenados con corpus muy pequenos (del orden de 10 MB por idioma) creada para estudiar el comportamiento de los modelos en idiomas con pocos datos. El sufijo `ind_latn` del modelo base sugiere indonesio en alfabeto latino, aunque la model card no confirma el idioma. El repositorio no tiene descargas ni valoraciones y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun la etiqueta `gpt2` del repositorio; no se detalla la configuracion exacta) |
| Parametros totales | 39.087.104 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (al ser safetensors, admite conversion a FP16, INT8 y 4 bits con herramientas estandar, pero no hay variantes publicadas) |
| Idiomas soportados | no disponible (el identificador del modelo base, `ind_latn`, sugiere indonesio en escritura latina, sin confirmacion en la informacion proporcionada) |
| Licencia | no disponible (la model card incluye el campo `licence: license` como marcador de posicion, sin licencia efectiva) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo unico verificable es que se trata de un modelo de la familia GPT-2 (etiqueta `gpt2` del repositorio), es decir, un transformer decoder-only con atencion causal, fine-tuneado sobre `goldfish-models/ind_latn_10mb`. No se publican el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni la longitud de contexto, aunque el recuento de parametros (39 millones) situa la configuracion en el rango de los GPT-2 pequenos.

El entrenamiento se realizo con SFT mediante TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifican el dataset de ajuste, el numero de tokens vistos, la composicion de los datos, ni si hubo fases adicionales de RLHF o DPO; la model card solo indica SFT. La referencia al proyecto `new-tokenizers` en Weights & Biases y el sufijo del nombre (`ppt`, `Dp-10mb-packed-bfd_seed10`) apuntan a un barrido experimental con tokenizadores o empaquetado de datos alternativos, con semilla 10, pero no hay documentacion publica que lo confirme.

## Capacidades

- Generacion de texto autoregresiva basica, condicionada por un mensaje de usuario en formato conversacional (el ejemplo de la model card pasa una lista de mensajes con `role` y `content` al pipeline).
- No hay evidencia de capacidades de razonamiento multi-paso, matematicas o codigo mas alla de lo que puede ofrecer un modelo de 39 millones de parametros entrenado con datos limitados.
- Soporte de tool calling o function calling: no disponible; no se menciona en la model card ni en las etiquetas.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible; el modelo base esta orientado a un unico idioma de bajos recursos.
- Capacidades especiales (modo thinking, vision, audio): ninguna documentada.
- El nombre del modelo base (`ind_latn_10mb`) indica que el corpus de partida es de aproximadamente 10 MB, lo que limita severamente el conocimiento factual y la fluidez esperables.

## Casos de uso

- Investigacion sobre tokenizacion en lenguas de bajos recursos: el modelo sirve como punto de comparacion dentro de un barrido experimental (proyecto `new-tokenizers`) para medir como afectan distintas decisiones de tokenizacion o empaquetado de datos al ajuste fino con corpus minimos.
- Reproducibilidad de experimentos academicos: al estar publicados los pesos y la configuracion de librerias (TRL, Transformers, PyTorch), permite replicar el entrenamiento con SFT sobre el mismo modelo base y contrastar resultados.
- Analisis de degradacion por sobreajuste: con 39 millones de parametros y un corpus de 10 MB, es un caso de estudio util para medir cuanta informacion retiene un modelo tan pequeno antes de empezar a memorizar el conjunto de entrenamiento.
- Pruebas de infraestructura y pipelines de inferencia: su tamano minimo (0,1 GB) lo convierte en un banco de pruebas barato para validar despliegues con TGI, endpoints compatibles o el pipeline de Transformers antes de pasar a modelos grandes.
- Generacion de texto de relleno en prototipos: para demos de interfaz o pruebas de integracion donde solo se necesita que el sistema devuelva texto y no la calidad del mismo.
- Evaluacion comparativa de modelos monolingues pequenos: sirve como referencia en estudios que comparan arquitecturas o estrategias de entrenamiento en el rango de decenas de millones de parametros.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, resumen de documentos largos, traduccion ni ninguna tarea que requiera conocimiento factual fiable, contexto largo o razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 160 MB en FP32, 80 MB en FP16/BF16, 40 MB en INT8 y en torno a 20-25 MB en cuantizacion de 4 bits (calculado a partir de los 39,09 millones de parametros; no hay cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente; tambien funciona en CPU sin problemas. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) y en hardware integrado.
- Opciones de despliegue: pipeline de Transformers, servidor con `text-generation-inference` (etiqueta `text-generation-inference` presente) y endpoints compatibles (etiqueta `endpoints_compatible`). Para llama.cpp u Ollama haria falta una conversion a GGUF que no esta publicada.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por el tamano, en GPU la generacion seria del orden de cientos de tokens por segundo, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/ind-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10` | 39,09 M | no disponible | no disponible | HuggingFace, 0 descargas | Fine-tuning SFT de un Goldfish de 10 MB |
| `goldfish-models/ind_latn_10mb` | no disponible | no disponible | no disponible | HuggingFace | Modelo base; mismo autor, familia Goldfish de corpus minimos |
| Otros modelos Goldfish (por idioma) | no disponible | no disponible | no disponible | HuggingFace | Misma receta de 10 MB por idioma; comparables en tamano y limitaciones |
| `distilgpt2` | 82 M | 1024 | Apache 2.0 / MIT segun distribucion | HuggingFace | Alternativa pequena en ingles con licencia clara, el doble de parametros |

Las cifras de contexto y licencia de los modelos Goldfish no estan disponibles en la informacion proporcionada; se recomienda consultar cada model card antes de cualquier uso.

## Limitaciones y advertencias

- Tamano muy reducido: 39 millones de parametros entrenados a partir de un corpus de aproximadamente 10 MB implican conocimiento factual casi nulo y alta probabilidad de generar texto incoherente o repetitivo.
- Riesgo elevado de alucinacion: sin datos de evaluacion ni de alineacion, no hay garantia de que las respuestas sean correctas o siquiera plausibles.
- Sesgos: no documentados, pero un corpus de 10 MB hereda los sesgos de la fuente original, que no se especifica.
- Limitaciones de idioma: la model card no declara idiomas soportados; el identificador `ind_latn` sugiere indonesio en escritura latina, por lo que el rendimiento fuera de ese ambito sera previsiblemente muy pobre.
- Limitaciones de contexto: la longitud de contexto no esta publicada; aunque el modelo base use ventanas cortas (tipicas de la familia GPT-2), no hay confirmacion.
- Licencia: la model card contiene un marcador de posicion (`licence: license`) en lugar de una licencia real. No hay autorizacion explicita de uso comercial ni condiciones de redistribucion, lo que supone un riesgo legal para cualquier despliegue en produccion.
- Ausencia de mantenimiento: cero descargas y cero valoraciones, creado y actualizado en septiembre de 2026 (fechas del repositorio), sin historial de uso ni soporte.
- Naturaleza experimental: el nombre del modelo indica un barrido concreto (empaquetado de datos, tokenizador y semilla), por lo que no debe tratarse como un artefacto estable ni como una version de referencia.
- La busqueda web no ha devuelto ninguna fuente relevante sobre este modelo: los resultados obtenidos corresponden a contenido sin relacion (sitios de una aerolinea), por lo que no hay documentacion externa que amplie la informacion de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ind-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/ind_latn_10mb
- Proyecto Goldfish (coleccion de modelos): https://huggingface.co/goldfish-models
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/3ah2ngud
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
