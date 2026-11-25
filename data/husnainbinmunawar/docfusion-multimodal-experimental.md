# husnainbinmunawar/docfusion-multimodal-experimental

## Resumen

DocFusion Multimodal Structured Extraction es un modelo experimental de extraccion de informacion documental publicado por el usuario husnainbinmunawar en Hugging Face. Combina caracteristicas geometricas normalizadas, estadisticas derivadas de OCR y celdas PDF, y estadisticas de recortes de imagen de la pagina fuente para alimentar tres cabezas de prediccion: clasificacion de layout/entidad en 11 clases, puntuacion de orden de lectura y prediccion de relaciones por pares. El modelo se entrena a partir de un shard real de DocLayNet v1.2.

El modelo es de tipo "docfusion_multimodal_extractor" y se distribuye con pesos en safetensors bajo PyTorch. El recuento de parametros reportado en el repositorio es de 41.392, un tamano muy reducido que lo situa en la categoria de modelo compacto orientado a tareas especificas de analisis de layout documental, no a generacion de texto general.

La relevancia de esta publicacion es acotada: se trata de un artefacto de investigacion experimental, sin descargas ni interacciones en el momento de la consulta, y el propio autor advierte que los resultados son evidencia de investigacion acotada y que no debe confundirse con un motor OCR, un enlazador semantico de entidades ni un parser de documentos listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | docfusion_multimodal_extractor (fusion multimodal con tres cabezas: layout/entidad, orden de lectura y relaciones por pares); no se detalla la topologia interna |
| Parametros totales | 41.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cdla-permissive-1.0 |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

La model card describe un modelo de fusion multimodal compacto que integra tres fuentes de senal por elemento documental: geometria normalizada, estadisticas de OCR y celdas PDF, y estadisticas de recortes de imagen de la pagina fuente. Sobre esa representacion fusionada se aplican tres cabezas: una de clasificacion en 11 clases de layout/entidad, una de puntuacion de orden de lectura y una de prediccion de relaciones por pares.

El entrenamiento se realizo a partir de un shard real de DocLayNet v1.2 (dataset de DS4SD). No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion lineal. La release contiene unicamente caracteristicas numericas derivadas y pesos del modelo; no se republican imagenes fuente, PDFs ni texto OCR.

## Capacidades

- Clasificacion de layout y entidades documentales en 11 clases.
- Puntuacion de orden de lectura de elementos dentro de una pagina.
- Prediccion de relaciones por pares entre elementos documentales.
- Extraccion de caracteristicas geometricas normalizadas.
- Procesamiento de estadisticas derivadas de OCR y de celdas PDF.
- Uso de estadisticas de recortes de imagen de la pagina fuente como senal multimodal.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision generativa, audio): no disponible. La componente visual se limita a estadisticas de recortes, no a comprension visual generativa.

## Casos de uso

- Analisis de layout en pipelines de digitalizacion: el modelo puede clasificar elementos de una pagina en 11 categorias de layout/entidad, lo que permite segmentar documentos escaneados antes de etapas posteriores de procesamiento.
- Reconstruccion del orden de lectura: la cabeza de puntuacion de orden de lectura permite ordenar los elementos detectados en un documento para alimentar motores de extraccion de texto o de resumen.
- Modelado de relaciones entre elementos: la cabeza de prediccion de relaciones por pares sirve para construir grafos de dependencia entre bloques documentales (por ejemplo, asociar titulos con secciones o tablas con sus leyendas).
- Investigacion en extraccion de informacion documental: al ser un modelo experimental y compacto, es util como linea base reproducible para experimentar con fusion de caracteristicas geometricas, OCR e imagen.
- Prototipado de sistemas de comprension documental: su tamano reducido (41.392 parametros) facilita iteraciones rapidas en entornos de investigacion con recursos limitados.
- Evaluacion comparativa sobre DocLayNet: al derivarse de un shard de DocLayNet v1.2, puede emplearse en experimentos controlados sobre ese corpus para medir el efecto de distintas representaciones de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 41.392 parametros, el peso en precision completa es del orden de decenas o centenares de kilobytes, por lo que la huella de memoria es trivial.
- GPU recomendadas: no disponible. Dado el tamano, la inferencia puede ejecutarse en CPU o en cualquier GPU consumer.
- Cabe en GPU consumer: si, con margen amplio, aunque no se especifican modelos concretos.
- Opciones de despliegue: no disponible. La libreria declarada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como experimental y advierte que no es un motor OCR, un enlazador semantico de entidades ni un parser de documentos listo para produccion.
- Resultados acotados: la evidencia de rendimiento es limitada y no se acompanan benchmarks publicos.
- Sin datos de sesgo: no se documentan sesgos conocidos ni evaluaciones de equidad.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de clasificacion y puntuacion, el riesgo se manifiesta como predicciones erroneas de layout, orden o relaciones.
- Cobertura limitada: entrenado sobre un shard de DocLayNet v1.2, lo que restringe la generalizacion a otros dominios documentales.
- Idiomas: no se declaran idiomas soportados.
- Licencia: CDLA-Permissive-1.0, permisiva; conviene revisar los terminos exactos para uso comercial y la atribucion requerida sobre DocLayNet.
- Datos no redistribuidos: la release no incluye imagenes, PDFs ni texto OCR, lo que limita la reproducibilidad completa del entrenamiento.
- Adopcion nula: sin descargas ni likes en el momento de la consulta, no hay evidencia de uso en comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/husnainbinmunawar/docfusion-multimodal-experimental
- DocLayNet (repositorio): https://github.com/DS4SD/DocLayNet
- Licencia DocLayNet (CDLA-Permissive-1.0): https://github.com/DS4SD/DocLayNet/blob/main/LICENSE
