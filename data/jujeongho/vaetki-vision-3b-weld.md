# jujeongho/VAETKI-Vision-3B-Weld

## Resumen

VAETKI-Vision-3B-Weld es un modelo vision-lenguaje (VLM) de aproximadamente 3.000 millones de parametros (4.947.938.304 parametros reales en los pesos safetensors) publicado por el usuario jujeongho en HuggingFace. Está especializado en el dominio de la soldadura industrial: inspeccion visual, deteccion de defectos y grounding de regiones en imagenes de cordones de soldadura. El pipeline declarado es `image-text-to-text` y la arquitectura interna se identifica como `vaetki_vl`, con codigo personalizado (`custom_code`) que requiere `trust_remote_code=True` para cargarse en transformers.

El modelo se distribuye bajo una licencia propia denominada `vaetki-vision-3b-weld` (etiquetada como `license:other`), con acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo. El repositorio ocupa 9.9 GB, lo que sugiere pesos en precision alta (bf16/fp16) y posiblemente un vision encoder adicional. Fue creado el 27 de octubre de 2026 y actualizado el mismo dia.

Su relevancia radica en el nicho: los VLM genericos rara vez alcanzan precision suficiente en tareas de inspeccion industrial especializada, y un modelo afinado sobre un dataset de instrucciones de soldadura (`jujeongho/Weld-Instruct`) puede ofrecer mejor grounding y deteccion de defectos que alternativas generalistas del mismo tamano. La informacion publica disponible es muy limitada, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `vaetki_vl` (vision-lenguaje, codigo personalizado; detalles internos no disponibles) |
| Parametros totales | 4.947.938.304 (~3B, segun nomenclatura del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | `vaetki-vision-3b-weld` (license:other, acceso restringido/gated) |
| Formato de pesos | safetensors (con `custom_code` en transformers) |

## Arquitectura y entrenamiento

La model card disponible no detalla la arquitectura interna mas alla del identificador `vaetki_vl`. Por la naturaleza del pipeline (`image-text-to-text`), el grounding y la deteccion de defectos, se trata de un VLM compuesto por un vision encoder y un decoder de lenguaje, pero no se especifican el encoder visual utilizado, el modelo base de lenguaje, la longitud de contexto ni el mecanismo de fusion multimodal. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El unico dato de entrenamiento disponible es la referencia al dataset `jujeongho/Weld-Instruct`, un conjunto de instrucciones orientado a tareas de soldadura (inspeccion, descripcion y localizacion de defectos). No se publican detalles sobre el proceso de afinado, el regimen de congelacion de capas ni hiperparametros. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto condicionada por imagen (`image-text-to-text`): descripcion de imagenes de soldadura y respuesta conversacional sobre ellas.
- Grounding visual: localizacion de regiones de interes en la imagen (por ejemplo, cordones o zonas con defectos), segun los tags del modelo.
- Deteccion de defectos de soldadura: identificacion de imperfecciones en imagenes de cordones.
- Conversacion multi-turno: el tag `conversational` sugiere soporte de dialogos sobre la imagen.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Inspeccion visual automatizada en linea de produccion: el modelo puede recibir imagenes de cordones de soldadura y devolver descripciones y localizaciones de posibles defectos, integrándose en un pipeline de control de calidad tras la estacion de soldadura.
- Precribado de imagenes radiograficas o fotograficas de soldadura: uso como primer filtro para priorizar la revision humana de las piezas sospechosas, reduciendo el volumen de inspeccion manual.
- Asistente conversacional para inspectores: un inspector puede subir una imagen y preguntar en lenguaje natural por zonas concretas, apoyandose en el tag `conversational` del modelo.
- Generacion de informes de inspeccion: a partir de la imagen y una plantilla de preguntas, el modelo produce descripciones textuales que un sistema posterior estructura en un informe.
- Etiquetado asistido de datasets de soldadura: el modelo puede proponer descripciones y bounding boxes para acelerar la anotacion de nuevos conjuntos de imagenes del dominio.
- Formacion y documentacion tecnica: generacion de explicaciones sobre defectos visibles en imagenes de ejemplo para materiales de entrenamiento de soldadores.
- Integracion en aplicaciones de vision industrial con `transformers`: al requerir `custom_code`, se puede desplegar con la libreria `transformers` y `trust_remote_code=True` en un servicio interno de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~4.95B parametros en bf16/fp16, los pesos ocupan aproximadamente 9.9 GB; sumando el vision encoder y el overhead de activaciones, se estiman entre 12 y 16 GB de VRAM para inferencia en precision nativa. Con cuantizacion a 8 bits (si se generara) rondaria 6-8 GB; a 4 bits, 4-5 GB. No se publican pesos cuantizados.
- GPU recomendadas: A100 40GB, H100, L40S o RTX A6000 para despliegue en produccion con margen; RTX 4090 (24 GB) suficiente para inferencia en bf16.
- GPU de consumo: cabe en RTX 4090, RTX 4080 (16 GB, justo) y RTX 3090 (24 GB). En GPUs de 12 GB requeriria cuantizacion, no disponible oficialmente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el codigo personalizado). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama; al ser un VLM con codigo custom, la compatibilidad con esos motores no esta garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VAETKI-Vision-3B-Weld | ~4.95B | no disponible | Soldadura / inspeccion industrial | `vaetki-vision-3b-weld` (other, gated) | HuggingFace, acceso restringido |
| Qwen2.5-VL-3B | ~3B | 32K (segun documentacion publica del modelo base) | Vision-lenguaje general | Apache 2.0 (segun publicacion de Qwen) | HuggingFace, abierto |
| SmolVLM2-2.2B | ~2.2B | no verificado en esta ficha | Vision-lenguaje general | Apache 2.0 (segun publicacion de HuggingFace) | HuggingFace, abierto |
| InternVL2.5-4B | ~4B | no verificado en esta ficha | Vision-lenguaje general | MIT (segun publicacion de OpenGVLab) | HuggingFace, abierto |

Nota: los datos de los modelos comparables provienen de sus publicaciones respectivas y no se han verificado contra la informacion proporcionada en esta busqueda; se incluyen solo como referencia de categoria. No hay benchmarks del modelo VAETKI que permitan comparar rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo de nicho entrenado sobre un dataset especifico de soldadura, puede generalizar mal fuera de ese dominio.
- Riesgo de alucinacion: no cuantificado; en tareas de deteccion de defectos, una descripcion erronea puede tener consecuencias de seguridad industrial, por lo que se recomienda validacion humana.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni longitud de contexto; no se puede asumir soporte multilingue ni ventanas largas.
- Licencia: licencia propia `vaetki-vision-3b-weld` con `license:other`; es necesario revisar los terminos antes de cualquier uso comercial. El acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace.
- Produccion: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del modelo; auditar el codigo antes de desplegarlo en entornos sensibles.
- Madurez: 4 descargas y 0 likes en el momento de la consulta; sin benchmarks publicados ni documentacion extendida, el soporte de la comunidad es practicamente inexistente.
- Compatibilidad: sin pesos GGUF ni cuantizaciones oficiales, y sin confirmacion de soporte en vLLM/TGI/Ollama.

## Enlaces

- HuggingFace: https://huggingface.co/jujeongho/VAETKI-Vision-3B-Weld
- Dataset de instrucciones: https://huggingface.co/datasets/jujeongho/Weld-Instruct
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
