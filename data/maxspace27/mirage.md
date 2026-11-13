# Maxspace27/mirage

## Resumen

Mirage es un modelo de vision-lenguaje publicado por Maxspace27 (con pesos y motor asociados al ecosistema Cactus-Compute) orientado a la comprension de imagenes y a la extraccion estructurada de informacion a partir de ellas. Se distribuye bajo licencia Apache 2.0 y se ejecuta mediante la libreria `cactus-compute`, que descarga y cachea el motor y los pesos en el primer uso. El repositorio ocupa 0,2 GB e incluye los ficheros `mirage.cact`, `mirage.safetensors` y la configuracion del modelo.

El modelo cubre un abanico amplio de tareas visuales bajo una unica etiqueta de pipeline `image-text-to-text`: descripcion de escenas, deteccion de objetos (incluida zero-shot), segmentacion, clasificacion de imagenes (tambien zero-shot), respuesta a preguntas visuales y respuesta a preguntas sobre documentos. Declara soporte para siete idiomas: ingles, aleman, frances, espanol, italiano, neerlandes y polaco.

La relevancia actual de Mirage reside en su enfoque hacia la inferencia ligera y la extraccion estructurada (descripciones, OCR, relaciones espaciales y decisiones), empaquetada con un runtime propio en lugar de depender exclusivamente de frameworks convencionales como transformers o vLLM. No obstante, la informacion publica disponible es muy limitada: no se detallan parametros, contexto ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, fr, es, it, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`mirage.safetensors`) y formato propietario del runtime (`mirage.cact`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo (tipo de transformer, componentes de vision, estrategia de fusion multimodal, etc.) en la documentacion disponible. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La unica informacion tecnica disponible hace referencia al empaquetado: el modelo se distribuye junto a un motor de inferencia propio (`cactus-compute`) que gestiona la descarga y el cacheo de pesos y binarios. El repositorio incluye un fichero `mirage.cact` (formato del runtime) ademas de los pesos en `safetensors`, lo que sugiere una optimizacion especifica para el motor Cactus. No se dispone de mas detalles sobre innovaciones tecnicas.

## Capacidades

- Descripcion de imagenes y generacion de texto a partir de contenido visual.
- Deteccion de objetos, incluida deteccion zero-shot.
- Segmentacion de imagenes.
- Clasificacion de imagenes, incluida clasificacion zero-shot.
- Respuesta a preguntas visuales (visual question answering).
- Respuesta a preguntas sobre documentos (document question answering), con soporte implicito de OCR segun la imagen de portada de la model card.
- Extraccion estructurada de informacion: descripciones de escena, relaciones espaciales y decisiones.
- Soporte multilingue en siete idiomas europeos (en, de, fr, es, it, nl, pl).
- No se indica soporte de tool calling, function calling ni razonamiento multi-paso basado en agentes.

## Casos de uso

- Descripcion automatica de imagenes en catalogos de producto: el modelo puede generar descripciones textuales de fotografias para enriquecer fichas de e-commerce, usando la API `describe` del runtime Cactus.
- Moderacion y clasificacion de contenido visual: la clasificacion de imagenes y la clasificacion zero-shot permiten etiquetar imagenes en categorias definidas sin reentrenamiento.
- Extraccion de datos de documentos escaneados: la capacidad de document question answering y OCR permite recuperar campos concretos (importes, fechas, nombres) de facturas o formularios.
- Deteccion de objetos en imagenes de vigilancia o inventario: la deteccion zero-shot facilita localizar categorias de objetos no vistas durante el entrenamiento.
- Segmentacion para edicion o analisis: la segmentacion de imagenes sirve como paso previo en pipelines de recorte, aislamiento de objetos o analisis de escenas.
- Asistencia a personas con discapacidad visual: la descripcion de escenas y las relaciones espaciales permiten generar narraciones del entorno en varios idiomas europeos.
- Analisis de imagenes en aplicaciones multilingues: el soporte de espanol, frances, aleman, italiano, neerlandes y polaco permite desplegar la misma solucion en distintos mercados europeos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se conocen parametros ni cuantizaciones).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo esta pensado para el runtime `cactus-compute` (instalable con `pip install -U cactus-compute`). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Runtime | Disponibilidad |
|---|---|---|---|---|---|
| Mirage (Maxspace27) | no disponible | no disponible | Apache 2.0 | cactus-compute | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de vision-lenguaje de la misma categoria.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos del modelo ni sobre la composicion del dataset de entrenamiento.
- Riesgo de alucinacion inherente a los modelos de vision-lenguaje: las descripciones y respuestas pueden contener informacion no presente en la imagen.
- Se desconoce la longitud de contexto soportada, lo que impide evaluar su comportamiento en documentos largos o conversaciones multi-turno extensas.
- El soporte de idiomas se limita a siete lenguas europeas; no se indica cobertura de otras.
- La licencia Apache 2.0 permite uso comercial, pero al no conocerse los datos de entrenamiento no puede descartarse la presencia de contenido con restricciones.
- Dependencia del runtime `cactus-compute`: no se documenta compatibilidad con frameworks de inferencia estandar, lo que puede limitar la integracion en infraestructuras existentes.
- El repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que no existe validacion comunitaria del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Maxspace27/mirage
- Blog y playground del modelo: https://cactuscompute.com/blog/mirage
- Documentacion de la API Python: https://cactuscompute.com/blog/needle-python-docs
- Binarios del runtime y plataformas soportadas: https://huggingface.co/Cactus-Compute/cactus
- Codigo fuente: https://github.com/cactus-compute/cactus
