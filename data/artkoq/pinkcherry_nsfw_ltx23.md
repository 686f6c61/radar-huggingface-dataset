# Artkoq/PinkCherry_NSFW_LTX23

## Resumen

PinkCherry_NSFW_LTX23 es un checkpoint de generacion de video ajustado (fine-tuned) a partir del modelo base LTX 2.3 de Lightricks, publicado por el usuario Artkoq en Hugging Face. El modelo esta orientado a la generacion de video texto-a-video (T2V) e imagen-a-video (I2V), con un ajuste especifico para contenido para adultos (etiquetas nfaa y nsfw), y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 572,6 GB y contiene 21.005.004.544 parametros segun los pesos en safetensors, lo que lo situa en la categoria de los modelos de video de aproximadamente 22B, coherente con la nomenclatura "22b" del modelo base LTX 2.3.

El modelo se ofrece en multiples formatos de cuantizacion (GGUF, fp8_scaled, bf16 e int8), lo que facilita su despliegue en distintos entornos de hardware. La model card menciona tambien la disponibilidad de una LoRA destilada y de un codificador de texto Gemma-3-12B sin censura, aunque los enlaces proporcionados en la documentacion apuntan ambos al mismo fichero de LoRA, lo que constituye una inconsistencia en la informacion publicada.

La relevancia de este modelo radica en su especializacion: frente a los modelos de video generalistas, ofrece un ajuste fino para contenido explicito, un nicho con demanda pero escasa cobertura en el ecosistema open source. No obstante, la ausencia de benchmarks, de documentacion detallada sobre el dataset de entrenamiento y de datos sobre idiomas limita seriamente su evaluacion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generacion de video basado en LTX 2.3; la model card no detalla la arquitectura interna) |
| Parametros totales | 21.005.004.544 (aproximadamente 21B; la nomenclatura del modelo base indica 22B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, fp8_scaled, bf16, int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, fp8_scaled, int8 |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un checkpoint ajustado a partir de LTX 2.3 base de Lightricks y que soporta tanto generacion texto-a-video (T2V) como imagen-a-video (I2V). La model card no detalla la arquitectura interna (tipo de transformer de difusion, mecanismo de atencion, compresion latente del video, etc.), por lo que este dato debe considerarse no disponible. El tamano de 21.005.004.544 parametros en safetensors es consistente con un modelo de aproximadamente 22B, en linea con la denominacion "22b" del modelo base.

En cuanto al entrenamiento, la model card menciona un ajuste fino sobre el modelo base y la existencia de una LoRA destilada (distilled LoRA) asociada a LTX 2.3, ademas de un codificador de texto Gemma-3-12B sin censura. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias mas alla de las heredadas del modelo base. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de video a partir de texto (T2V): produce clips de video a partir de descripciones textuales, con ajuste fino orientado a contenido para adultos.
- Generacion de video a partir de imagen (I2V): anima una imagen de entrada para producir una secuencia de video.
- Ajuste especifico para contenido NSFW: el modelo esta entrenado o ajustado para generar contenido explicito, segun indican sus etiquetas y la model card.
- Multiples formatos de despliegue: al ofrecerse en GGUF, fp8_scaled, bf16 e int8, puede ejecutarse en distintos stacks de inferencia.
- Integracion con flujos de trabajo de ComfyUI: la model card menciona una carpeta de workflows con prompts negativos de video y audio actualizados en la version 1.8.
- Codificador de texto Gemma-3-12B: la model card menciona un codificador de texto sin censura, aunque el enlace proporcionado es incorrecto (apunta a la LoRA destilada).
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, matematicas y codigo: no disponible; no se documentan capacidades de este tipo, ya que se trata de un modelo de generacion de video.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de video para adultos en estudios de contenido: el modelo permite producir clips T2V e I2V con ajuste fino para contenido explicito, lo que reduce la necesidad de rodaje y facilita la iteracion creativa en produccion de contenido para plataformas especializadas.
- Animacion de imagenes fijas (I2V): util para dar movimiento a fotografias o ilustraciones, por ejemplo en proyectos de arte digital o prototipado de escenas, aprovechando la modalidad imagen-a-video del checkpoint.
- Prototipado rapido de escenas en preproduccion audiovisual: los equipos pueden generar borradores de video a partir de guiones textuales para validar encuadres y ritmo antes de rodar, aunque el ajuste NSFW limita su uso a producciones de ese genero.
- Investigacion sobre sesgos y seguridad en modelos generativos: el modelo sirve como objeto de estudio para analizar como el ajuste fino sobre contenido explicito afecta a la generacion y que mecanismos de filtrado o moderacion son necesarios en produccion.
- Despliegue local con cuantizacion: gracias a las versiones GGUF e int8, puede ejecutarse en estaciones de trabajo con GPUs de gama alta para experimentacion offline, sin depender de APIs externas.
- Integracion en pipelines de ComfyUI: la disponibilidad de workflows con prompts negativos de video y audio permite incorporar el modelo a cadenas de generacion automatizadas dentro de ComfyUI para produccion de contenido por lotes.
- Generacion de video de referencia para artistas: creadores pueden usar el modelo para explorar variaciones visuales rapidas y servir de referencia en procesos creativos, siempre dentro del marco legal y etico aplicable al contenido para adultos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de aproximadamente 21B parametros en bf16 requiere del orden de 42 GB solo para los pesos, a lo que hay que sumar el coste de activaciones y del decodificador de video, por lo que la inferencia completa en bf16 no cabe en GPUs de consumo. Las versiones GGUF e int8 reducen sustancialmente este requisito, aunque no se especifican cifras exactas.
- GPU recomendadas: no disponible. Por tamano, se situaria en el rango de GPUs de datacenter como A100 80 GB o H100 para bf16, y en GPUs de consumo de gama alta (RTX 4090 con 24 GB) solo con cuantizaciones agresivas y posiblemente con offloading.
- Compatibilidad con GPU de consumo: no confirmada. Las versiones GGUF e int8 hacen plausible su ejecucion en GPUs de consumo de gama alta, pero no hay datos publicados de VRAM real ni de velocidad.
- Opciones de despliegue: la presencia de formatos GGUF sugiere compatibilidad con llama.cpp y derivados (Ollama, LM Studio), si bien para modelos de video el stack habitual es ComfyUI con nodos especificos. La model card menciona workflows de ComfyUI. No se confirma soporte de vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| PinkCherry_NSFW_LTX23 | ~21B | no disponible | T2V, I2V | Apache 2.0 | Ajuste fino NSFW sobre LTX 2.3 |
| LTX 2.3 base (Lightricks) | ~22B | no disponible | T2V, I2V | no disponible en la informacion | Modelo base generalista del que deriva |
| Otros modelos de video open source | no disponible | no disponible | T2V, I2V | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, contexto o benchmarks con alternativas de la misma categoria. La comparativa se limita a la relacion de derivacion con el modelo base LTX 2.3.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como nfaa y nsfw, por lo que no es apto para todos los publicos y su uso debe restringirse a contextos legales y con verificacion de edad.
- Ausencia de benchmarks: no hay datos publicados de calidad, fidelidad temporal ni coherencia de los videos generados, lo que impide evaluar su rendimiento de forma objetiva.
- Documentacion incompleta: la model card no detalla arquitectura, dataset de entrenamiento, idiomas ni requisitos de hardware; ademas, los enlaces al codificador de texto Gemma-3-12B y a la LoRA destilada apuntan al mismo fichero, lo que constituye un error documental.
- Riesgo de contenido no deseado: como todo modelo generativo de video, puede producir artefactos, incoherencias temporales o contenido no solicitado; el ajuste NSFW aumenta el riesgo de generar material sensible si no se aplican filtros.
- Sesgos: no se documentan sesgos conocidos, pero al no haber informacion sobre el dataset de entrenamiento no es posible evaluar sesgos de genero, raza o cultura.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a legislacion especifica sobre material para adultos en la jurisdiccion del usuario; se recomienda revision legal.
- Repositorio de gran tamano: 572,6 GB dificultan la descarga y el almacenamiento, y exigen infraestructura con suficiente ancho de banda y espacio en disco.
- Idiomas: no se especifican idiomas soportados; los prompts en castellano pueden no funcionar de forma optima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Artkoq/PinkCherry_NSFW_LTX23
- Modelo base LTX 2.3 de Lightricks: https://huggingface.co/Lightricks/LTX-2.3
- LoRA destilada de LTX 2.3: https://huggingface.co/Lightricks/LTX-2.3/blob/main/ltx-2.3-22b-distilled-lora-384-1.1.safetensors
- Codificador de texto Gemma-3-12B sin censura: no disponible (el enlace de la model card apunta erroneamente a la LoRA destilada)
