# mradermacher/prose-rewriter-1.7b-v2-GGUF

## Resumen

`mradermacher/prose-rewriter-1.7b-v2-GGUF` es la version cuantizada en formato GGUF del modelo `chartreuse-verte/prose-rewriter-1.7b-v2`, un modelo de lenguaje especializado en reescritura de prosa, transferencia de estilo y escritura creativa. El repositorio lo publica mradermacher, un autor conocido por generar cuantizaciones estaticas de modelos de terceros para su uso con llama.cpp y derivados. No se trata, por tanto, de un modelo entrenado desde cero, sino de una conversion del modelo base a distintos niveles de precision (de Q2_K a f16) junto con la documentacion de los ficheros disponibles.

El modelo base esta etiquetado con la familia `qwen3`, lo que situa su arquitectura en la linea Qwen3 de Alibaba, aunque la model card del repositorio no aporta detalles sobre la arquitectura interna, la longitud de contexto, el dataset de entrenamiento ni el proceso de ajuste. El dato real de parametros extraido de los tensores safetensors es de 2.031.739.904 parametros (aproximadamente 2,03 mil millones), una cifra superior a la que sugiere el sufijo "1.7b" del nombre, probablemente por el redondeo comercial del modelo base o por la inclusion de embeddings y cabezas adicionales.

Su relevancia practica es acotada pero clara: se trata de un modelo pequeno, orientado a una tarea concreta (reescritura y "deslop", es decir, limpieza de texto con marcas de generacion automatica), que puede ejecutarse en hardware de consumo gracias a cuantizaciones de entre 1,0 GB y 4,2 GB. La licencia AGPL-3.0 y el soporte exclusivo del ingles son las dos restricciones que mas condicionan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el tag `qwen3` apunta a la familia Qwen3) |
| Parametros totales | 2.031.739.904 (segun los tensores safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (los ficheros se distribuyen como .gguf; el modelo base esta en safetensors) |
| Libreria declarada | transformers (el repositorio es de cuantizaciones GGUF) |
| Tamano del repositorio | 18,6 GB (suma de todas las cuantizaciones) |
| Modelo base | chartreuse-verte/prose-rewriter-1.7b-v2 |
| Fecha de publicacion | 2026-09-19 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se dispone de informacion publicada en este repositorio sobre la arquitectura del modelo base mas alla del tag `qwen3`, que sugiere una arquitectura transformer de tipo decoder-only con atencion completa, grupo de tokens especiales y tokenizador de la familia Qwen. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste supervisado, RLHF o DPO. El autor de la cuantizacion tampoco incluye notas tecnicas sobre la conversion.

Las unicas innovaciones observables en la informacion disponible son de tipo practico y corresponden al proceso de cuantizacion: la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion directa desde pesos HuggingFace con cuantizacion por tensor de salida. Se ofrecen tanto cuantizaciones estaticas (este repositorio) como cuantizaciones ponderadas con imatrix en un repositorio hermano (`prose-rewriter-1.7b-v2-i1-GGUF`), que suelen ofrecer mejor relacion calidad/tamano.

## Capacidades

- Generacion y reescritura de texto en ingles: el caso de uso central es reescribir prosa existente manteniendo el significado y alterando el estilo.
- Transferencia de estilo: adaptar el registro, el tono o la voz narrativa de un texto.
- Escritura creativa: generacion de narrativa, ficcion y texto literario de forma asistida.
- "Deslop": limpieza de texto con marcas tipicas de generacion automatica, segun el tag declarado por el autor.
- Conversacion: el repositorio esta marcado con el tag `conversational`, por lo que admite formato de chat multi-turno.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Uso como agente o razonamiento multi-paso: no disponible (no se documenta soporte).
- Capacidades multilingues: limitadas al ingles; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Edicion y pulido de textos editoriales: dado un borrador, el modelo puede reescribirlo manteniendo el contenido y mejorando la fluidez, algo viable en local con la cuantizacion Q4_K_M de 1,4 GB.
- Normalizacion de estilo en publicaciones: aplicar una voz editorial homogenea a articulos escritos por varios autores mediante instrucciones de estilo.
- Limpieza de contenido generado por IA ("deslop"): detectar y reescribir fragmentos con muletillas, estructuras repetitivas o giros tipicos de modelos, antes de publicar.
- Asistencia a guionistas y novelistas: reescritura de escenas o dialogos con un tono alternativo, aprovechando la orientacion a creative writing.
- Prototipado de demos de reescritura en el navegador o en local: al pesar entre 1,0 y 2,3 GB, se puede empaquetar con llama.cpp u Ollama en una aplicacion de escritorio sin GPU dedicada.
- Preprocesado de corpus en ingles: reescritura masiva de textos para aumentar la diversidad estilistica de un dataset de entrenamiento o evaluacion.
- Filtrado y mejora de resenas o comentarios: reescritura de texto de usuario para hacerlo mas claro y neutral antes de publicarlo en un portal.
- Educacion y ensenanza de escritura: mostrar al alumno una version reescrita de su texto para comparar registros y estructuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relacionados con este modelo. Tampoco se documentan evaluaciones de perplexity por tipo de cuantizacion, mas alla de un grafico generico de terceros enlazado por el autor que no aporta cifras especificas de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (incluyendo margen para cache KV con contexto moderado, calculada a partir del tamano de cada fichero):
  - Q2_K (1,0 GB): en torno a 1,5-2 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L (1,1-1,2 GB): en torno a 1,5-2,5 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M (1,3-1,4 GB): en torno a 2-3 GB.
  - Q5_K_S / Q5_K_M (1,5-1,6 GB): en torno a 2,5-3,5 GB.
  - Q6_K (1,8 GB): en torno a 3-4 GB.
  - Q8_0 (2,3 GB): en torno a 3,5-4,5 GB.
  - f16 (4,2 GB): en torno a 5-6 GB.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0. Ejemplos: GTX 1650 / RTX 3050 de 4 GB (hasta Q4_K_M con holgura), RTX 3060 / 4060 de 8 GB (cualquier cuantizacion), RTX 4090 de 24 GB (f16 sin problema).
- Ejecucion en CPU: viable en todas las cuantizaciones, especialmente Q4_K_S y Q4_K_M, que el autor marca como "fast, recommended".
- GPU de datacenter: A100, H100 o L40S estan sobredimensionadas para este tamano; solo tendrian sentido para servir muchas replicas concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, Jan, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo HuggingFace. vLLM con soporte GGUF es experimental y no se garantiza.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables verificables ni datos de rendimiento del modelo base, y la busqueda web no devolvio resultados relacionados. Sin cifras de benchmarks ni de contexto, cualquier comparacion con alternativas de la misma categoria (modelos de 1-3 mil millones de parametros orientados a reescritura o a generacion creativa) seria especulativa y no se puede respaldar con datos.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si el modelo se ofrece como servicio a traves de una red, la AGPL obliga a poner a disposicion de los usuarios el codigo fuente completo de la aplicacion que lo integra. Esto la hace poco adecuada para productos propietarios cerrados.
- Idioma unico: solo se declara ingles. No hay garantia de comportamiento correcto en castellano ni en otros idiomas, ni se documenta evaluacion multilingue.
- Sesgos conocidos: no se documentan, pero al ser un modelo derivado de Qwen3 y ajustado para estilo, puede heredar sesgos del corpus de entrenamiento y del proceso de ajuste, especialmente en representaciones de genero, cultura o registro.
- Riesgo de alucinacion: inherente a los modelos de 2 mil millones de parametros. En tareas de reescritura el riesgo se manifiesta como cambios de significado, omision de matices o invencion de detalles no presentes en el texto original. Conviene validar la salida contra el original.
- Sin datos de contexto ni de entrenamiento: no se puede planificar el uso con documentos largos ni auditar la procedencia de los datos.
- Sin benchmarks: la calidad real del modelo en tareas de reescritura no esta respaldada por ninguna metrica publicada. Las unicas valoraciones son subjetivas ("fast, recommended", "very good quality") en la tabla de cuantizaciones.
- Discrepancia de nomenclatura: el nombre indica "1.7b" pero los tensores suman 2,03 mil millones de parametros. Conviene verificar el modelo base antes de integrarlo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S reducen notablemente la calidad; para uso real se recomienda Q4_K_M o superior.
- Modelo especializado: su utilidad fuera de tareas de reescritura, estilo y escritura creativa no esta documentada y probablemente sea inferior a la de un modelo generalista del mismo tamano.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/prose-rewriter-1.7b-v2-GGUF
- Modelo base: https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v2
- Cuantizaciones ponderadas con imatrix: https://huggingface.co/mradermacher/prose-rewriter-1.7b-v2-i1-GGUF
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#prose-rewriter-1.7b-v2-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
