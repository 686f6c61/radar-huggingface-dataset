# deepquillapp/spacy-en-core-web-sm-rs

## Resumen

`deepquillapp/spacy-en-core-web-sm-rs` es una reexportacion del modelo linguistico `en_core_web_sm` 3.8.0 de spaCy (desarrollado originalmente por Explosion AI bajo licencia MIT), empaquetado por el usuario `deepquillapp` para su uso en un port a Rust. No se trata de un modelo de lenguaje generativo, sino de un pipeline clasico de procesamiento del lenguaje natural (PLN) para ingles que incluye tokenizador, tok2vec, etiquetador POS, parser de dependencias, attribute ruler y lematizador.

El paquete contiene los pesos originales sin modificar, exportados como `weights.safetensors` en precision f32 junto con un `tables.json` que recoge las tablas auxiliares del pipeline. El objetivo declarado es alimentar el crate `deepquill-syntax` del proyecto DeepQuill, de modo que el modelo esta pensado para inferencia en Rust mas que para su uso con la libreria spaCy original.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0.0 GB y no publica model card tecnica detallada mas alla de la nota de exportacion. Se desconoce el pipeline declarado en Hugging Face y no hay informacion sobre benchmarks ni sobre el proceso de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de PLN de spaCy (tokenizador, tok2vec, tagger, parser de dependencias, attribute ruler, lematizador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados en f32) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (f32) y tables.json |

## Arquitectura y entrenamiento

El modelo subyacente es `en_core_web_sm` 3.8.0 de spaCy, un pipeline estadistico clasico de PLN. Segun la model card, incluye tokenizador, tok2vec, tagger, dependency parser, attribute ruler y lemmatizer. La exportacion se realizo con spaCy 3.8.13 mediante el script `tools/spacy-port/export.py` y, segun el autor, no se modifico ningun peso.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste fino o RLHF, ya que la model card no los detalla. Tampoco se documenta ninguna innovacion tecnica adicional mas alla de la conversion de formato a safetensors y la extraccion de tablas a JSON para su consumo desde Rust.

## Capacidades

- Tokenizacion de texto en ingles.
- Etiquetado morfosintactico (POS tagging).
- Analisis de dependencias sintacticas.
- Lematizacion.
- Aplicacion de reglas de atributos (attribute ruler) sobre los tokens.
- Representaciones vectoriales contextuales mediante tok2vec.
- No es un modelo generativo: no produce texto libre, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Preprocesado linguistico en pipelines de PLN en Rust: el paquete esta pensado para el crate `deepquill-syntax`, de modo que se usaria para tokenizar, etiquetar y parsear texto en ingles dentro de una aplicacion Rust sin depender de spaCy en Python.
- Extraccion de dependencias sintacticas para analisis de sentimiento o extraccion de relaciones: el parser de dependencias permite obtener sujetos, objetos y modificadores para alimentar reglas o clasificadores posteriores.
- Normalizacion y lematizacion de corpus en ingles: util para indexacion, busqueda o deduplicacion de terminos en motores de busqueda o sistemas de recuperacion.
- Etiquetado POS para construccion de datasets de entrenamiento: sirve como anotador automatico inicial en proyectos de anotacion linguistica.
- Analisis de texto en herramientas de escritorio o embebidas: al ser un modelo pequeno y exportado a safetensors, puede integrarse en aplicaciones locales sin infraestructura de servidor.
- Preprocesado para pipelines de extraccion de informacion: combinado con reglas o modelos posteriores, permite segmentar y anotar documentos en ingles antes de tareas de NER o clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo pequeno de PLN y estar exportado en f32, se espera que quepa en CPU y en GPUs consumer, pero no se aportan cifras concretas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: el paquete esta orientado al crate `deepquill-syntax` en Rust; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| deepquillapp/spacy-en-core-web-sm-rs | Pipeline PLN spaCy exportado | en | MIT | safetensors, JSON | Hugging Face (0 descargas) |
| en_core_web_sm (Explosion AI) | Pipeline PLN spaCy original | en | MIT | binario spaCy | Paquete oficial de spaCy |
| en_core_web_md (Explosion AI) | Pipeline PLN spaCy con vectores | en | MIT | binario spaCy | Paquete oficial de spaCy |
| en_core_web_lg (Explosion AI) | Pipeline PLN spaCy con vectores grandes | en | MIT | binario spaCy | Paquete oficial de spaCy |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo: no debe evaluarse como un LLM ni usarse para generacion de texto, codigo o razonamiento.
- Solo soporta ingles; no cubre otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo estadistico entrenado sobre corpus en ingles puede heredar sesgos de dichos datos.
- Riesgo de alucinacion no aplica en el sentido de los LLM, pero el etiquetado y el parseo pueden producir errores en texto ruidoso o dominios especializados.
- La licencia MIT permite uso comercial, pero se recomienda verificar los terminos del modelo original `en_core_web_sm` de Explosion AI.
- El repositorio tiene 0 descargas y 0 likes, y no publica benchmarks ni documentacion de uso detallada; la madurez y el soporte del paquete son limitados.
- La integracion esta disenada para el crate `deepquill-syntax`; su uso fuera de ese contexto no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/deepquillapp/spacy-en-core-web-sm-rs
- Modelo original spaCy `en_core_web_sm`: no disponible en la informacion proporcionada
- Repositorio de spaCy: no disponible en la informacion proporcionada
- Script de exportacion `tools/spacy-port/export.py`: no disponible en la informacion proporcionada
