# rty813/Unlimited-OCR-bf16

## Resumen

Unlimited-OCR-bf16 es una conversión a precisión completa (bf16) del modelo baidu/Unlimited-OCR, publicada por el usuario rty813 en HuggingFace. Se trata de un port del checkpoint original a formato PyTorch (`pytorch_model.bin`) pensado para usuarios que quieren ejecutar el modelo con vLLM, TGI, Xinference o transformers sin recurrir a la cuantización GGUF que circula para el modelo base. La arquitectura es idéntica a la del original, de modo que funciona como sustituto directo mediante `AutoModelForCausalLM.from_pretrained("rty813/Unlimited-OCR-bf16")`.

El modelo base, baidu/Unlimited-OCR, es un modelo de visión-lenguaje (vision-language) desarrollado por Baidu y orientado a OCR, con la etiqueta de pipeline `image-text-to-text` en su model card. La model card del original lo presenta bajo el lema "Welcome the Era of One-shot Long-horizon Parsing" y hace referencia al paper arXiv 2606.23050, además de un repositorio GitHub propio. Se distribuye con licencia MIT en su versión original, mientras que este port figura con licencia apache-2.0 en los metadatos de HuggingFace.

La relevancia de esta ficha concreta es acotada: el repositorio acumula 0 descargas y 0 "likes", tiene un tamaño de 0,0 GB y fue creado y actualizado el mismo día (13 de octubre de 2026), por lo que se trata de una publicación reciente y prácticamente sin uso registrado. La información pública disponible es muy limitada en cuanto a parámetros, contexto y datos de entrenamiento, que no se detallan ni en la model card del port ni en los fragmentos disponibles del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (vision-language) con codigo personalizado (`custom_code`); identica al modelo base baidu/Unlimited-OCR |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (precisión completa) en este port; el modelo base dispone tambien de una cuantizacion GGUF |
| Idiomas soportados | no disponible en este repo; el modelo base declara `multilingual` sin detallar idiomas |
| Licencia | apache-2.0 en este port (el modelo base figura como MIT) |
| Formato de pesos | `pytorch_model.bin` en bf16; conversion a safetensors en proceso segun el autor |

## Arquitectura y entrenamiento

La model card de este port indica explicitamente que la arquitectura es "identical to the original", es decir, la misma que baidu/Unlimited-OCR. El modelo base se etiqueta como `vision-language` y `ocr`, con `custom_code` en sus tags, lo que implica que requiere código propio del repositorio para cargarse correctamente. La etiqueta de pipeline del port es `text-generation`, mientras que la del modelo base es `image-text-to-text`, lo que es coherente con una arquitectura que recibe imágenes y produce texto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo base. Tampoco se detalla ninguna innovacion tecnica concreta en los fragmentos de model card disponibles, salvo el enfoque de "one-shot long-horizon parsing" mencionado como lema. Este port en concreto no introduce cambios de arquitectura ni reentrenamiento: es unicamente una conversion de formato y precision (bf16) de los pesos originales.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes, segun la etiqueta `ocr` y la tarea `image-text-to-text` del modelo base.
- Generacion de texto a partir de entradas de imagen y texto, dado el pipeline `image-text-to-text` del original.
- Procesamiento multilingue, segun la declaracion `language: multilingual` del modelo base (sin lista concreta de idiomas).
- Capacidad de parsing de documentos o contenido extenso en un solo paso ("one-shot long-horizon parsing"), segun el lema de la model card original.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, audio, vision mas alla de OCR): no disponible.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede extraer texto de imagenes de documentos, facturas o formularios, aprovechando su naturaleza de modelo vision-lenguaje orientado a OCR.
- Extraccion de texto en entornos multilingues: gracias a la declaracion multilingue del modelo base, puede emplearse para procesar documentos en varios idiomas sin cambiar de modelo.
- Automatizacion de pipelines de ingesta documental: al cargarse directamente en vLLM (`vllm serve rty813/Unlimited-OCR-bf16`) o Xinference, puede integrarse como servicio de inferencia detras de una cola de procesamiento de documentos.
- Procesamiento de documentos largos en un solo paso: el enfoque de "one-shot long-horizon parsing" sugiere su uso para transcribir documentos extensos sin fragmentarlos previamente.
- Sustitucion del modelo base en despliegues existentes: al ser un sustituto directo (`drop-in`) de baidu/Unlimited-OCR, permite migrar despliegues de transformers o vLLM sin cambios de codigo.
- Despliegue en infraestructura que evita cuantizaciones: para equipos que necesitan maxima precision y no quieren usar el GGUF, este port ofrece los pesos en bf16 para vLLM, TGI o Xinference.
- Investigacion y evaluacion comparativa: util para reproducir resultados del modelo base frente a su version cuantizada, aislando el efecto de la precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que no se especifica el numero de parametros. Como referencia general, un modelo en bf16 requiere aproximadamente 2 bytes por parametro para los pesos, mas el consumo de la cache KV y el codificador visual.
- GPU recomendadas: no disponible (depende del numero de parametros, que no se indica).
- Compatibilidad con GPU de consumo: no confirmada; no puede determinarse sin conocer el tamano del modelo.
- Opciones de despliegue confirmadas por el autor: vLLM (`vllm serve rty813/Unlimited-OCR-bf16`), Xinference (buscando "Unlimited-OCR"), TGI y transformers.
- Latencia y throughput estimados: no disponible.
- Nota: el repo figura con un tamano de 0,0 GB en HuggingFace, lo que probablemente indica que los pesos no estaban subidos o no se habian contabilizado en el momento de la consulta; conviene verificar los ficheros reales del repositorio antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rty813/Unlimited-OCR-bf16 | no disponible | no disponible | bf16 (`pytorch_model.bin`) | apache-2.0 | HuggingFace, 0 descargas |
| baidu/Unlimited-OCR (modelo base) | no disponible | no disponible | original (formato no detallado) + GGUF | MIT | HuggingFace (baidu) |
| Otras alternativas OCR de vision-lenguaje | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de informacion sobre parametros, contexto o datos de entrenamiento, lo que dificulta estimar coste, latencia y calidad.
- Riesgo de alucinacion en tareas de OCR: no evaluado ni documentado en la informacion disponible.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto o de idioma: no disponible; el modelo base solo declara `multilingual` de forma generica.
- Discrepancia de licencia: este port figura como apache-2.0 en HuggingFace, mientras que la model card del modelo base declara licencia MIT. Conviene verificar los terminos aplicables antes de un uso comercial.
- El modelo requiere `custom_code` (tags del repositorio), por lo que no basta con cargarlo como un transformer estandar sin el codigo asociado.
- La publicacion es muy reciente y sin adopcion registrada (0 descargas, 0 likes), por lo que no hay validacion de la comunidad.
- El tamano del repositorio figura como 0,0 GB; es posible que los pesos no esten completamente subidos o que la conversion a safetensors aun este en proceso, lo que afecta a la reproducibilidad.
- No hay garantia de equivalencia numerica exacta con el modelo base mas alla de lo afirmado por el autor del port.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rty813/Unlimited-OCR-bf16
- Modelo base en HuggingFace: https://huggingface.co/baidu/Unlimited-OCR
- Repositorio GitHub del modelo base: https://github.com/baidu/Unlimited-OCR
- Paper (arXiv 2606.23050): https://arxiv.org/abs/2606.23050
- Badge de Trendshift: https://trendshift.io/repositories/62053
- Twitter de Baidu: https://x.com/Baidu_Inc
