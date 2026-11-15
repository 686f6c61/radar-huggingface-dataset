# goodmai/gemma-4-26B-A4B-it-qat-4bit

## Resumen

Gemma 4 26B-A4B-it-qat-4bit es una cuantizacion de 4 bits del modelo multimodal Gemma 4 en su variante instruct, publicada por el usuario goodmai sobre el checkpoint original de mlx-community. El modelo resuelve tareas de generacion de texto e imagen-a-texto (pipeline `image-text-to-text`) y esta empaquetado especificamente para el ecosistema MLX de Apple Silicon, lo que permite ejecutarlo de forma nativa en Macs con chips M-series sin depender de CUDA ni de Python en el caso de la aplicacion Basalt.

El checkpoint declara 25.805.936.206 parametros reales en safetensors (aproximadamente 25,8 mil millones), lo que encaja con la nomenclatura "26B" del nombre. El sufijo "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con unos 4 mil millones de parametros activos por token, aunque la model card no detalla la configuracion de expertos. El sufijo "qat" indica quantisation-aware training, es decir, el modelo fue entrenado teniendo en cuenta la cuantizacion a 4 bits para reducir la perdida de calidad respecto a una cuantizacion post-entrenamiento convencional.

La relevancia de esta ficha es acotada: se trata de un derivado de un modelo mayor (Gemma 4) republicado por un tercero, con cero descargas y cero likes en el momento de la consulta, sin model card propia mas alla de las instrucciones de uso con MLX y sin licencia declarada en los metadatos. Es util como referencia de despliegue local en Apple Silicon, pero no debe confundirse con el modelo oficial de Google DeepMind.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); la model card no detalla si es MoE, aunque el sufijo "A4B" lo sugiere |
| Parametros totales | 25.805.936.206 (segun safetensors) |
| Parametros activos | no disponible (el nombre indica "A4B", aproximadamente 4B activos, sin confirmacion en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (QAT, quantisation-aware training) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna mas alla de la etiqueta `gemma4` y el pipeline `image-text-to-text`, que confirma capacidad multimodal de entrada de imagen y salida de texto. El nombre del checkpoint indica una variante instruct ("it") y una configuracion de mezcla de expertos con aproximadamente 4 mil millones de parametros activos ("A4B"), pero no se especifica el numero de expertos, la estrategia de enrutamiento ni la dimension oculta.

El entrenamiento declarado es QAT (quantisation-aware training) a 4 bits, lo que implica que el modelo fue ajustado durante el entrenamiento para tolerar la cuantizacion a 4 bits y preservar la calidad en ese regimen. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con formato instruct.
- Comprension de imagenes y generacion de descripciones o respuestas sobre ellas (pipeline `image-text-to-text`).
- Ejecucion nativa en Apple Silicon mediante la libreria MLX (`mlx-vlm`).
- Integracion con la aplicacion Basalt (macOS 27 o superior, Apple Silicon, sin Python) mediante `basalt serve --model ... --rest`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion automatica de imagenes en local: el modelo puede recibir una ruta de imagen y un prompt como "Describe this image." mediante `mlx_vlm.generate`, adecuado para catalogar fotos o generar texto alternativo en un Mac sin GPU dedicada.
- Prototipado de asistentes multimodales en Apple Silicon: al estar empaquetado en MLX, permite iterar sobre un asistente conversacional con vision en un MacBook o Mac Studio sin configurar CUDA ni contenedores.
- Inferencia de escritorio integrada en aplicaciones macOS: la aplicacion Basalt expone el modelo via `basalt serve --rest`, lo que facilita incrustarlo en herramientas nativas de macOS con una API REST local.
- Evaluacion de cuantizacion QAT a 4 bits: util para comparar la calidad de un checkpoint QAT frente a cuantizaciones post-entrenamiento del mismo modelo base en tareas de vision-lenguaje.
- Procesamiento por lotes de imagenes con descripcion textual: el script `mlx_vlm.generate` admite ejecucion repetida sobre un directorio de imagenes para generar metadatos o resumenes.
- Experimentacion academica con modelos MoE multimodales en hardware de consumo: el tamano de repo de 15,6 GB y el formato MLX permiten cargar el modelo en equipos Apple Silicon con memoria unificada suficiente, sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 15,6 GB en formato 4 bits; se recomienda al menos 16 GB de memoria unificada y, para margen de contexto y cache KV, 24-32 GB o mas.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada suficiente; no se documenta soporte CUDA en la model card.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada; no hay datos sobre GPUs NVIDIA consumer.
- Opciones de despliegue: `mlx-vlm` (Python) y Basalt (macOS 27+, Apple Silicon, CLI y app). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / ecosistema |
|---|---|---|---|---|
| goodmai/gemma-4-26B-A4B-it-qat-4bit | 25,8B (aprox. 4B activos, segun nombre) | no disponible | no disponible | safetensors MLX |
| mlx-community/gemma-4-26B-A4B-it-qat-4bit | no disponible | no disponible | no disponible | safetensors MLX (checkpoint de origen) |
| Gemma 4 26B-A4B-it (modelo base oficial) | no disponible en la informacion | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia no esta declarada en los metadatos ni en la model card; no se puede confirmar el uso comercial sin consultar la licencia del modelo base original de Google.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Al ser una cuantizacion a 4 bits, es esperable cierta degradacion de calidad respecto al modelo en precision completa, aunque el entrenamiento QAT mitiga parte de esa perdida.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del checkpoint.
- El modelo esta empaquetado exclusivamente para MLX; no es directamente utilizable en entornos CUDA o CPU convencionales sin conversion.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia; se trata de una publicacion sin validacion comunitaria.
- La model card es practicamente una copia de las instrucciones del checkpoint de origen de mlx-community, sin documentacion tecnica propia.
- No se documentan limitaciones de longitud de contexto porque el dato no esta disponible.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/gemma-4-26B-A4B-it-qat-4bit
- Checkpoint de origen: https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-qat-4bit
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo Basalt (chat): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2Fgemma-4-26B-A4B-it-qat-4bit&role=chat
- Demo Basalt (ingles): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2Fgemma-4-26B-A4B-it-qat-4bit&role=chat&lang=en
