# NarsAI/mirage

## Resumen

Mirage es un modelo de vision-lenguaje orientado a la comprension de imagenes y la extraccion estructurada de informacion, publicado por NarsAI bajo licencia Apache 2.0. El modelo se distribuye a traves de la libreria `cactus-compute` y esta disenado para tareas como la descripcion de escenas, la deteccion de objetos (incluida la zero-shot), la segmentacion de imagenes, la clasificacion visual, la respuesta a preguntas visuales (VQA) y la respuesta a preguntas sobre documentos (document QA). Su pipeline declarado en Hugging Face es `image-text-to-text`.

El repositorio tiene un tamano de 0,2 GB e incluye los ficheros `mirage.cact`, `mirage.safetensors` y la configuracion del modelo, lo que sugiere un modelo compacto pensado para despliegue en entornos con recursos limitados y ejecucion mediante el runtime propio de Cactus Compute. Soporta siete idiomas: ingles, aleman, frances, espanol, italiano, neerlandes y polaco.

La relevancia actual de Mirage radica en su enfoque hacia la extraccion estructurada y la integracion en pipelines de agentes, con una API Python minimalista (`cactus.Mirage().describe("photo.png")`) que descarga y cachea el motor y los pesos en el primer uso. No se dispone de informacion publica sobre arquitectura interna, numero de parametros ni datos de entrenamiento en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, fr, es, it, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y `.cact` (formato propio del runtime Cactus) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo (tipo de transformer, mecanismos de atencion, uso de componentes MoE o hibridos) en la model card ni en los metadatos disponibles. El pipeline declarado es `image-text-to-text`, lo que indica un modelo multimodal que recibe imagenes y texto y genera texto, pero no se detalla el codificador visual ni el decodificador de lenguaje empleados.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. La unica innovacion tecnica documentada es la integracion con el runtime `cactus-compute`, que gestiona la descarga, el cacheo y la ejecucion del modelo en distintas plataformas, con binarios de runtime publicados en el repositorio `Cactus-Compute/cactus`.

## Capacidades

- Generacion de descripciones de imagenes y escenas (image captioning).
- Deteccion de objetos, incluida la deteccion zero-shot de categorias no vistas durante el entrenamiento.
- Segmentacion de imagenes.
- Clasificacion de imagenes, tanto estandar como zero-shot.
- Respuesta a preguntas visuales (visual question answering) sobre el contenido de una imagen.
- Respuesta a preguntas sobre documentos (document question answering), orientada a la extraccion de informacion estructurada.
- Capacidades multilingues en siete idiomas europeos: ingles, aleman, frances, espanol, italiano, neerlandes y polaco.
- Integracion con el runtime Cactus Compute para despliegue multiplataforma.
- No se ha documentado soporte explicito de tool calling, function calling ni modos de razonamiento multi-paso.

## Casos de uso

- Extraccion estructurada de datos de documentos: el modelo puede procesar facturas, albaranes o formularios escaneados y devolver campos estructurados, aprovechando su capacidad de document question answering para automatizar la digitalizacion de archivos en entornos administrativos.
- Moderacion y analisis de contenido visual: la clasificacion de imagenes y la deteccion zero-shot permiten filtrar o etiquetar imagenes en plataformas de contenido sin necesidad de reentrenar el modelo para cada nueva categoria.
- Accesibilidad: generacion automatica de descripciones de imagenes para lectores de pantalla, usando la capacidad de image captioning en varios idiomas europeos para cubrir usuarios de distintas regiones.
- Automatizacion de inventario y logistica: deteccion y segmentacion de objetos en fotografias de almacen o lineas de produccion para contar, localizar y clasificar productos.
- Asistentes de analisis de documentos para atencion al cliente: responder preguntas sobre capturas de pantalla, recibos o contratos enviados por usuarios, combinando VQA y document QA en conversaciones multi-turno.
- Enriquecimiento de catalogos de comercio electronico: generacion de descripciones y etiquetas de producto a partir de imagenes, con soporte multilingue para mercados de Europa occidental y central.
- Analisis de imagenes medicas o tecnicas de baja criticidad: clasificacion y descripcion preliminar de imagenes para triaje, siempre con supervision humana dado el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (0,2 GB) sugiere un modelo compacto que probablemente quepa en GPUs de consumo, pero no se confirma en la documentacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada, aunque el tamano del repositorio y el enfoque del runtime Cactus apuntan a despliegue en hardware modesto.
- Opciones de despliegue: runtime propietario `cactus-compute` (instalable via `pip install -U cactus-compute`), con binarios de runtime publicados en `Cactus-Compute/cactus`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones internas suficientes para establecer una comparativa rigurosa con alternativas de la misma categoria. A continuacion se indican posibles comparables por categoria de tarea, sin datos de rendimiento verificables:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NarsAI/mirage | no disponible | no disponible | Apache 2.0 | Hugging Face + runtime Cactus |
| Alternativas de VLM compactos (p. ej. Qwen2-VL-2B, SmolVLM) | 2B aprox. | variable | variable | Hugging Face, vLLM, llama.cpp |
| Alternativas de document QA (p. ej. Donut, LayoutLMv3) | variable | variable | variable | Hugging Face |

Los datos de los modelos comparables no se han verificado en la informacion proporcionada y se incluyen solo como referencia de categoria; no deben interpretarse como una comparacion de rendimiento.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos conocidos del modelo; al ser un modelo visual, es probable que herede sesgos de sus datos de entrenamiento, pero no se documenta.
- Riesgo de alucinacion en tareas de descripcion y document QA: las salidas deben validarse en entornos de produccion, especialmente en extraccion de datos criticos.
- Longitud de contexto no documentada, lo que impide evaluar su idoneidad para documentos extensos o conversaciones multi-turno largas.
- Cobertura idiomatica limitada a siete idiomas europeos; no se garantiza rendimiento en otras lenguas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende del runtime `cactus-compute` para su ejecucion, cuyas condiciones de uso y soporte no se detallan en la informacion disponible.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion comunitaria y de casos de uso documentados por terceros.
- No se documenta soporte para tool calling ni para pipelines de agentes, pese a que la model card menciona "decisions" en la imagen de portada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NarsAI/mirage
- Repositorio original referenciado en la model card: https://huggingface.co/Cactus-Compute/mirage
- Blog y playground del modelo: https://cactuscompute.com/blog/mirage
- Documentacion de la API Python: https://cactuscompute.com/blog/needle-python-docs
- Binarios de runtime y plataformas soportadas: https://huggingface.co/Cactus-Compute/cactus
- Codigo fuente: https://github.com/cactus-compute/cactus
