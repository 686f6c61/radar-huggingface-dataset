# francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407

## Resumen

El modelo `francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407` es un ajuste fino de tipo SFT sobre el checkpoint `francesca9805/ppt-wc-uniform-newlex-zho-before-100mb-packed-bfdiso_seed3407`, ambos publicados por el usuario de HuggingFace `francesca9805`. Por las etiquetas del repositorio (`gpt2`, `transformers`, `safetensors`) se trata de un transformer decoder-only de la familia GPT-2, con 124.770.816 parametros totales confirmados por los pesos en safetensors, es decir, un modelo denso de escala "small". El entrenamiento se ha realizado con la libreria TRL (version 0.23.0) en su flujo de SFT, y el repositorio declara compatibilidad con `text-generation-inference` y con endpoints.

El nombre del identificador apunta a un experimento centrado en tokenizacion y en el tratamiento de datos: el prefijo `zho` es el codigo ISO 639-3 del chino, `100mb` sugiere un corpus de unos 100 MB, `packed` indica empaquetado de secuencias y el sufijo `seed3407` fija la semilla. El proyecto de Weights & Biases asociado se llama `new-tokenizers`, lo que refuerza la hipotesis de que se trata de una prueba comparativa de vocabularios o esquemas de muestreo (`wc-uniform`, `newlex`) sobre un mismo corpus. Conviene subir la cautela: son inferencias a partir del nombre, no datos confirmados en la model card.

La relevancia practica de esta ficha es acotada. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, no publica resultados de benchmarks, no declara licencia efectiva (la model card contiene el marcador de posicion `licence: license`) ni idiomas soportados, y su tamano de repo (1,2 GB) es desproporcionado para un modelo de 124,8 M de parametros, lo que sugiere pesos almacenados en fp32 junto con artefactos de entrenamiento. Es, por tanto, un artefacto de investigacion reproducible mas que un modelo listo para produccion, aunque su huella de memoria lo hace ejecutable en cualquier GPU de consumo e incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun etiqueta `gpt2` del repositorio) |
| Parametros totales | 124.770.816 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la familia GPT-2 suele usar 1024 tokens, sin confirmar en este repositorio) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; al ser GPT-2 es convertible a GGUF, ONNX e INT8/INT4 con herramientas estandar |
| Idiomas soportados | No disponible. El prefijo `zho` del identificador sugiere chino (ISO 639-3), sin confirmacion en la model card |
| Licencia | No disponible. La model card incluye el marcador de posicion `licence: license`, sin texto legal efectivo |
| Formato de pesos | safetensors (`library_name: transformers`) |
| Modelo base | francesca9805/ppt-wc-uniform-newlex-zho-before-100mb-packed-bfdiso_seed3407 |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Fecha de publicacion | 2026-10-02 (creacion y ultima actualizacion) |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `gpt2` y el uso de `transformers` con pesos en safetensors sitúan el modelo en la familia GPT-2: un transformer decoder-only con atencion causal completa, normalizacion previa a cada subcapa y sin sesgo de atencion en las variantes clasicas. Con 124.770.816 parametros totales, el modelo queda muy cerca del GPT-2 small canonico (124 M), lo que implica un coste de inferencia y de memoria bajo, pero tambien una capacidad de razonamiento y de conocimiento factual limitada por escala. No se dispone de informacion sobre el numero de capas, dimension oculta, numero de cabezas ni tamano de vocabulario, por lo que no es posible confirmar si la diferencia de parametros respecto al GPT-2 original proviene de un vocabulario distinto.

El entrenamiento declarado es un ajuste supervisado (SFT) ejecutado con TRL 0.23.0, sobre las versiones Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card enlaza una ejecucion de Weights & Biases en el proyecto `new-tokenizers` (run `4iykamjc`), que sugiere que el interes experimental esta en el tokenizador y en la preparacion del corpus mas que en el ajuste en si. No se documentan numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se detalla la receta de SFT (plantilla de chat, enmascarado de perdida, numero de epocas), aunque el ejemplo de la model card usa `pipeline("text-generation")` con mensajes en formato de rol `user`.

## Capacidades

- Generacion de texto autoregresiva: es la unica tarea declarada en el pipeline (`text-generation`).
- Seguimiento de instrucciones conversacionales basicas: el ejemplo de uso pasa una lista de mensajes con `role: user`, lo que indica que el SFT se hizo sobre un formato de chat.
- Capacidad multilingue: no disponible. El identificador apunta a chino, pero no hay confirmacion ni evaluacion publicada.
- Tool calling / function calling: no disponible; no se documenta soporte de plantillas de herramientas.
- Uso como agente o razonamiento multi-paso: no disponible; no hay evidencia de entrenamiento especifico para ello y la escala de 124,8 M lo hace poco probable de forma fiable.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Vision, audio o multimodalidad: no disponible; el repositorio declara unicamente texto.
- Razonamiento matematico o generacion de codigo especializados: no disponible; sin benchmarks ni datos de entrenamiento que lo respalden.

## Casos de uso

- Reproduccion de experimentos de tokenizacion: el caso mas realista dado el contexto del proyecto (`new-tokenizers`, `wc-uniform`, `newlex`). El modelo sirve para comparar como afecta un vocabulario nuevo al comportamiento generativo de un GPT-2 pequeno entrenado sobre unos 100 MB de corpus.
- Generacion de texto corto en chino (si se confirma el idioma): redaccion de titulares, resumenes muy breves o completado de frases con la ventana de contexto de un GPT-2, siempre que se valide la calidad con evaluacion propia.
- Ajuste fino posterior como banco de pruebas: al ser un checkpoint intermedio (`before-ckpt500`) de una linea experimental, es util como punto de partida barato para estudiar tecnicas de SFT, empaquetado de secuencias o curriculos de datos sin coste de GPU relevante.
- Docencia y formacion en LLM: su tamano permite ejecutarlo en un portatil con CPU, lo que facilita explicar el ciclo completo de tokenizacion, preentrenamiento y SFT con un artefacto real.
- Prototipado de pipelines de inferencia: sirve para validar integraciones con `text-generation-inference`, vLLM o llama.cpp antes de escalar a modelos mayores, ya que el mismo codigo de cliente funciona.
- Generacion de datos sinteticos a pequena escala: puede producir textos de dominio acotado para preetiquetado o aumento de datos, con revision humana obligatoria por el riesgo de alucinacion.
- Pruebas de estres de infraestructura: util para medir latencia, throughput y consumo de memoria de un servicio de inferencia antes de desplegar modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de busqueda web proporcionados no guardan relacion con el modelo (corresponden a la pelicula *X-Men: Days of Future Past*), por lo que no aportan datos utilizables.

## Requisitos de hardware

- VRAM estimada para inferencia, derivada del numero de parametros (124,77 M), sin contar cache KV ni overhead del runtime:
  - fp32: aproximadamente 500 MB.
  - fp16 / bf16: aproximadamente 250 MB.
  - int8: aproximadamente 125 MB.
  - int4: aproximadamente 65-70 MB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente en la practica, incluidas NVIDIA GTX 1650, RTX 3050, RTX 4090, A100 o H100. No requiere hardware de centro de datos.
- GPU de consumo: si, cabe con enorme margen en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable; un modelo de esta escala genera texto a una velocidad utilizable en procesadores de escritorio.
- Opciones de despliegue: `transformers` con PyTorch (el ejemplo oficial usa `pipeline`), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y conversion a GGUF para llama.cpp u Ollama. El soporte no esta verificado en el repositorio para cada uno de estos runtimes.
- Latencia y throughput: no disponibles como medicion publicada. No se han publicado cifras de tokens por segundo ni de latencia; cualquier estimacion seria especulativa.
- Almacenamiento: el repositorio ocupa 1,2 GB, muy por encima de lo que exigirian los pesos en fp16 (unos 250 MB), lo que probablemente incluye estados de optimizador o checkpoints adicionales.

## Comparativa con modelos similares

La comparativa se limita a caracteristicas publicas y verificables de la misma categoria (transformers decoder-only densos de menos de 200 M de parametros). No hay datos de rendimiento del modelo evaluado, por lo que la columna de benchmarks queda vacia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407 | 124,77 M | No disponible | No disponible (marcador de posicion) | HuggingFace, 0 descargas | No disponible |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | Licencia MIT modificada | Ampliamente disponible, tambien en GGUF | Si, extensamente documentado |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | HuggingFace | Si, publicado por los autores |
| Pythia-160M (EleutherAI) | 160 M | 2048 tokens | Apache 2.0 | HuggingFace, con checkpoints intermedios | Si, suite de evaluacion publicada |

Diferencias relevantes: frente a GPT-2 small, el modelo aqui descrito parte de un vocabulario y un corpus no documentados, lo que impide asumir un comportamiento equivalente; frente a DistilGPT-2 y Pythia-160M, carece de licencia efectiva y de evaluacion, dos factores que limitan su adopcion tanto en investigacion comparada como en productos.

## Limitaciones y advertencias

- Ausencia de licencia efectiva: la model card contiene `licence: license` como marcador de posicion. Sin un texto legal claro no hay autorizacion explicita de uso comercial ni de redistribucion; hay que tratar el modelo como no licenciado hasta contactar con el autor.
- Sin datos de evaluacion: no existen benchmarks publicados, por lo que no se puede afirmar calidad, ausencia de regresiones ni comportamiento esperado en ninguna tarea.
- Riesgo alto de alucinacion: con 124,77 M de parametros, la capacidad de retener conocimiento factual y de mantener coherencia en textos largos es limitada por escala, independientemente del ajuste SFT.
- Sesgos desconocidos: no se documenta la composicion del corpus de entrenamiento (los 100 MB sugeridos por el nombre), por lo que no se puede auditar que sesgos de genero, etnia, religion o ideologia contiene.
- Idioma no confirmado: si el modelo esta efectivamente especializado en chino y se usa en castellano, es previsible un rendimiento muy degradado.
- Contexto limitado: si se confirma la ventana de 1024 tokens tipica de GPT-2, no es apto para conversaciones largas, analisis de documentos extensos ni recuperacion aumentada con muchos fragmentos.
- Sin soporte verificado de tool calling ni de agentes: no se debe integrar en flujos que dependan de llamadas a funciones o de razonamiento multi-paso sin una validacion exhaustiva previa.
- Origen experimental: `before-ckpt500` indica un checkpoint intermedio de una linea de investigacion; es probable que exista una version posterior con mejor comportamiento.
- Repositorio sin traccion: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad y de issues que documenten fallos conocidos.
- Caveat de produccion: la etiqueta `endpoints_compatible` solo indica compatibilidad tecnica con la API de inferencia, no garantia de calidad, disponibilidad ni soporte.
- Caveat de fechas: la fecha de creacion (2026-10-02) es posterior a la fecha de referencia habitual de los modelos citados en la comparativa; conviene verificar la vigencia de las versiones de libreria declaradas (TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-zho-before-100mb-packed-bfdiso_seed3407
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/4iykamjc
- Repositorio de TRL: https://github.com/huggingface/trl
- Resultados de busqueda web aportados: no relevantes (corresponden a la pelicula *X-Men: Days of Future Past* y no guardan relacion con el modelo). No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo.
