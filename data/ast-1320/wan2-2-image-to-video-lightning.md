# AST-1320/WAN2.2-IMAGE-TO-VIDEO-LIGHTNING

## Resumen

WAN2.2-IMAGE-TO-VIDEO-LIGHTNING es un modelo de difusion para la generacion de video a partir de una imagen (image-to-video) publicado en Hugging Face por el usuario AST-1320. El repositorio emplea la libreria `diffusers` y esta asociado a la clase `WanImageToVideoPipeline`, lo que lo situa en la familia de modelos Wan para sintesis de video. El checkpoint contiene 14.288.901.184 parametros (aproximadamente 14,3 mil millones) almacenados en formato safetensors, con un tamano de repositorio de 68,9 GB, lo que sugiere pesos en precision alta (fp32 o bf16 con multiples variantes).

El modelo se presenta como una variante "Lightning" del modelo Wan 2.2 de image-to-video, una denominacion que en la practica suele indicar una destilacion orientada a reducir el numero de pasos de inferencia necesarios para generar video. Sin embargo, la model card publicada es la plantilla automatica de diffusers y no aporta informacion sobre el proceso de entrenamiento, los datos utilizados, la licencia ni los resultados de evaluacion. El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto reciente y practicamente sin validacion por parte de la comunidad.

Por su relevancia practica, el modelo es interesante para quienes experimentan con pipelines de generacion de video en diffusers, pero debe tratarse con cautela: la falta de documentacion y de licencia explicita impide recomendarlo para produccion o uso comercial sin una verificacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video (image-to-video), integrado en `WanImageToVideoPipeline` de diffusers; detalles internos no disponibles |
| Parametros totales | 14.288.901.184 (aprox. 14,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la ventana temporal de video no se especifica) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se documentan variantes GGUF, fp8 ni int8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna del modelo. Por el identificador y la clase de pipeline (`WanImageToVideoPipeline`) se deduce que se trata de un modelo de difusion condicionado por imagen para generar secuencias de video, perteneciente a la familia Wan. El numero de parametros (14,3 mil millones) es coherente con un modelo de difusion de gran tamano, pero no se especifica si emplea un transformer de difusion (DiT), un UNet o una arquitectura hibrida, ni cual es la resolucion nativa, la longitud de video soportada o el framerate.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens o frames de entrenamiento, la composicion del dataset, si hubo destilacion por pasos (de ahi el sufijo "Lightning"), ni si se aplicaron tecnicas de refinamiento como RLHF o DPO. El autor no ha publicado hiperparametros, regimen de precision ni infraestructura de computo. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video) mediante el pipeline `WanImageToVideoPipeline` de diffusers.
- Integracion nativa con la libreria diffusers, lo que permite cargar el modelo con `DiffusionPipeline.from_pretrained` y ejecutarlo sobre GPUs compatibles con PyTorch.
- Presunta orientacion a inferencia rapida por el sufijo "Lightning", aunque no se documenta el numero de pasos de muestreo ni el scheduler recomendado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.
- Capacidades multilingues: no disponibles (no es un modelo de lenguaje).
- No se documentan modos especiales como thinking mode, vision adicional o control por texto mas alla del prompt de condicionamiento estandar.

## Casos de uso

- Prototipado de animacion a partir de imagenes fijas: el modelo puede tomar una fotografia o ilustracion y generar una secuencia de video breve, util para equipos que evaluan la viabilidad de pipelines de image-to-video en diffusers antes de invertir en modelos con licencia comercial.
- Investigacion en difusion para video: sirve como punto de partida para experimentos de destilacion o reduccion de pasos, dado el sufijo "Lightning" y la disponibilidad de pesos safetensors.
- Generacion de clips para redes sociales: a partir de una imagen de producto o retrato se pueden producir animaciones cortas para pruebas de concepto, siempre que se verifique la licencia antes de publicar.
- Pruebas de integracion en pipelines de diffusers: util para validar que la version de diffusers, el scheduler y la GPU del entorno son compatibles con un modelo de 14,3 mil millones de parametros.
- Benchmarking interno de hardware: el tamano del checkpoint (68,9 GB) permite medir throughput y consumo de VRAM en distintas configuraciones de GPU antes de adoptar modelos mayores.
- Educacion y demostraciones: apropiado para talleres sobre generacion de video con modelos de difusion, dado que se carga con la API estandar de diffusers.
- No se recomienda su uso en produccion ni en aplicaciones comerciales sin una revision legal previa, al no existir licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 14,3 mil millones de parametros, los pesos en bf16 ocupan aproximadamente 28,6 GB; en fp32, unos 57,2 GB. A ello hay que sumar la memoria de activaciones y del VAE, por lo que se estima un minimo de 32-40 GB de VRAM en bf16 para inferencia sin offloading.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para ejecucion comoda en bf16. En GPUs de 24 GB (RTX 4090, RTX 3090) seria necesario recurrir a `enable_model_cpu_offload`, `enable_sequential_cpu_offload` o cuantizacion, con la consiguiente penalizacion de latencia.
- Cabe en GPU de consumo: solo con offloading o cuantizacion; no de forma nativa en 24 GB en bf16.
- Opciones de despliegue: diffusers (pipeline nativo), con posibilidad de usar `torch.compile` y schedulers de pocos pasos si el autor los documenta. No se dispone de variantes GGUF para llama.cpp ni de integracion confirmada con vLLM o TGI (estas ultimas orientadas a LLMs, no a difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| WAN2.2-IMAGE-TO-VIDEO-LIGHTNING (este) | 14,3 mil millones | no disponible | no disponible | Hugging Face, diffusers |
| Wan 2.2 image-to-video (modelo base de referencia) | no disponible en la informacion | no disponible | no disponible | Hugging Face |
| Otros modelos image-to-video de la familia Wan | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar parametros, contexto, rendimiento ni licencia con alternativas concretas; la comparativa queda limitada a la existencia del modelo base Wan 2.2 del que parece derivar.

## Limitaciones y advertencias

- La model card es la plantilla automatica de diffusers y no contiene informacion sustantiva: no hay descripcion, datos de entrenamiento, evaluacion ni instrucciones de uso.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier despliegue.
- No se documentan sesgos conocidos, pero al ser un modelo de difusion entrenado con datos no publicados, es probable que herede sesgos de representacion del dataset original.
- Riesgo de alucinacion visual: como todo modelo generativo de video, puede producir artefactos, deformaciones temporales e incoherencias entre frames.
- No se especifican la resolucion, la duracion ni el framerate soportados, por lo que el usuario debe experimentar para determinar los limites practicos.
- El repositorio tiene cero descargas y cero likes, sin validacion de la comunidad; la calidad del checkpoint no esta contrastada.
- El tamano de 68,9 GB y los 14,3 mil millones de parametros implican requisitos de hardware elevados y tiempos de carga considerables.
- No hay garantia de compatibilidad con versiones concretas de diffusers, PyTorch o CUDA; se recomienda fijar versiones y probar en un entorno aislado.

## Enlaces

- Hugging Face: https://huggingface.co/AST-1320/WAN2.2-IMAGE-TO-VIDEO-LIGHTNING
- Referencia citada en la model card (calculo de impacto ambiental): https://mlco2.github.io/impact#compute
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
- Documentacion de diffusers: https://huggingface.co/docs/diffusers
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales especificos de este modelo.
