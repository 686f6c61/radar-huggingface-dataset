# fpadovani/ppt-wc-uniform-newlex-77-eng-100mb_seed99

## Resumen

`fpadovani/ppt-wc-uniform-newlex-77-eng-100mb_seed99` es un modelo de generacion de texto de 86.508.288 parametros (aproximadamente 86,5 millones) publicado por el usuario fpadovani, vinculado en la model card a un proyecto de Weights & Biases de la Universidad de Groningen (`f-padovani-university-of-groningen/white_cotterell`). Se trata de un ajuste fino (fine-tuning) mediante SFT del modelo base `goldfish-models/eng_latn_100mb`, un modelo monolingue de la familia Goldfish orientada a investigacion linguistica en muchas lenguas.

El modelo se ha entrenado con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.11.0, y se distribuye en formato safetensors dentro de un repositorio de 1,4 GB. Su relevancia es fundamentalmente experimental: forma parte de una serie de variantes (el identificador incluye `seed99`, lo que sugiere un barrido de semillas) y no presenta todavia traccion en la comunidad, con 0 descargas y 0 likes en el momento de la consulta.

No se dispone de informacion sobre licencia, idiomas soportados, longitud de contexto ni composicion del dataset de ajuste. Esto limita seriamente su uso en produccion y lo situa como un artefacto de investigacion reproducible mas que como un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (segun el tag `gpt2`; no confirmado en la model card) |
| Parametros totales | 86.508.288 (aprox. 86,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible oficialmente; el sufijo `eng` del identificador y el modelo base `goldfish-models/eng_latn_100mb` apuntan a ingles, sin confirmacion en la model card |
| Licencia | no disponible (la model card incluye el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors (libreria `transformers`); repo de 1,4 GB |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna. Los metadatos tecnicos incluyen el tag `gpt2` y la libreria declarada es `transformers`, lo que es compatible con un transformer decoder-only autorregresivo de la familia GPT-2. El modelo base, `goldfish-models/eng_latn_100mb`, pertenece a la coleccion Goldfish de modelos monolingues; el sufijo `100mb` del identificador sugiere un corpus de preentrenamiento de 100 MB, aunque este punto no se confirma en la informacion disponible.

El entrenamiento consistio en un ajuste fino supervisado (SFT) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card incluye el enlace a una ejecucion de Weights & Biases (`vbuvgpxh`) bajo el proyecto `white_cotterell`, pero no especifica el numero de tokens de entrenamiento, la composicion del dataset de instrucciones, ni si se aplicaron etapas posteriores de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, MoE o arquitecturas hibridas).

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad declarada explicitamente (pipeline `text-generation`).
- Ajuste a formato conversacional: el ejemplo de la model card usa `pipeline` con una lista de mensajes con rol `user`, lo que indica que el SFT se realizo sobre un formato de chat/instrucciones, aunque no se documenta ninguna plantilla oficial.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; se presume monolingue en ingles por el modelo base.
- Capacidades especiales (modo pensamiento, vision, audio): no disponibles.
- Compatibilidad de despliegue: los tags `text-generation-inference` y `endpoints_compatible` indican que el repositorio esta preparado para servirse con TGI y con los Inference Endpoints de Hugging Face.

## Casos de uso

- Experimentacion academica en linguistica computacional: el modelo puede emplearse como punto de comparacion en estudios sobre ajuste por instrucciones en regimenes de datos reducidos, dado su tamano de 86,5 M de parametros y su vinculacion a un proyecto universitario.
- Reproducibilidad de barridos de semillas: el identificador `seed99` sugiere que forma parte de una serie de ejecuciones con distintas semillas; usarlo como una de las semillas en un analisis de varianza de resultados es un caso natural.
- Pruebas de infraestructura de despliegue: por su tamano reducido, sirve para validar pipelines con TGI, los Inference Endpoints de Hugging Face o `transformers.pipeline` en CUDA antes de pasar a modelos mayores.
- Generacion de texto en entornos con recursos muy limitados: al ocupar menos de 200 MB en fp16, puede ejecutarse en CPU o en GPUs integradas para prototipos de autocompletado o generacion de texto corto.
- Docencia y talleres: ilustrar el flujo completo de un ajuste SFT con TRL sobre un modelo base pequeno, incluyendo la exportacion a safetensors y el despliegue con la libreria `transformers`.
- Investigacion sobre olvido catastrofico: al partir de un modelo monolingue preentrenado con poco volumen de datos, es un candidato util para medir como el SFT degrada las capacidades originales del checkpoint base.
- Base para experimentos de cuantizacion: aunque el repositorio no incluye pesos cuantizados, puede convertirse a GGUF o a 8/4 bits para estudiar el impacto de la cuantizacion en modelos de menos de 100 M de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 346 MB en fp32, 173 MB en fp16/bf16, 87 MB en int8 y 43 MB en 4 bits. A esto hay que sumar la memoria de activaciones y la cache KV, cuyo coste depende de la longitud de contexto, que no esta documentada.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; por ejemplo, GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100. Las GPUs de gama alta quedan enormemente sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU (la inferencia en fp32 en CPU es viable con este tamano).
- Opciones de despliegue: `transformers.pipeline` (documentado en la model card), Text Generation Inference (etiqueta `text-generation-inference`), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones de tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `fpadovani/ppt-wc-uniform-newlex-77-eng-100mb_seed99` | 86,5 M | no disponible | no disponible | Hugging Face, safetensors |
| `goldfish-models/eng_latn_100mb` (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face |
| `distilgpt2` | 82 M | 1024 tokens | Apache-2.0 | Hugging Face, safetensors y multiples formatos |
| `gpt2` (GPT-2 small) | 124 M | 1024 tokens | MIT | Hugging Face, safetensors y multiples formatos |

Los datos de contexto y licencia de `distilgpt2` y `gpt2` corresponden a sus especificaciones publicas habituales y se incluyen solo como referencia de categoria; no se dispone de resultados comparativos de rendimiento entre estos modelos y el modelo descrito.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks, ni evaluaciones cualitativas, ni comparaciones con el modelo base, por lo que no puede afirmarse nada sobre su calidad de generacion.
- Licencia no especificada: la model card contiene el texto `licence: license`, un marcador de posicion. Sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Riesgo alto de alucinacion: los modelos de 86 M de parametros ajustados con SFT sobre corpus pequenos tienen una capacidad limitada de conocimiento factual y una tendencia elevada a generar contenido plausible pero incorrecto. No debe usarse como fuente de informacion.
- Sesgos: no documentados por el autor; los modelos entrenados sobre corpus pequenos en ingles tienden a reproducir los sesgos del corpus de origen, pero no se ha publicado ningun analisis al respecto.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el modelo parece ser monolingue en ingles; el rendimiento en castellano u otras lenguas es, como minimo, dudoso.
- Datos de entrenamiento desconocidos: se desconoce la composicion, el tamano y la procedencia del dataset de SFT, lo que impide auditar posibles problemas de derechos de autor o de contaminacion de datos.
- Traccion nula: 0 descargas y 0 likes, sin issues ni discusiones publicas; no hay evidencia de que el checkpoint haya sido validado por terceros.
- Fechas de creacion y actualizacion anomalas (2026): conviene verificar la procedencia del repositorio antes de integrarlo en cualquier flujo automatizado.
- Uso previsto: por su naturaleza, encaja como artefacto de investigacion reproducible, no como componente de un sistema en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-77-eng-100mb_seed99
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/vbuvgpxh
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper o blog del modelo: no disponible
- Demo o Space asociado: no disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (articulos en aleman sobre el control de tiempo de pantalla en Windows 10 y 11), por lo que no se han incluido.
