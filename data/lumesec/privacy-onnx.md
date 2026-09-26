# lumesec/privacy-onnx

## Resumen

LumeSec privacy-onnx es una exportación a formato ONNX del modelo de detección de información personal identificable (PII) `fastino/gliner2-privacy-filter-PII-multi`. No se trata de un modelo nuevo ni de pesos reentrenados: LumeSec ha convertido a ONNX Runtime los pesos originales de Fastino manteniendo el comportamiento idéntico al modelo PyTorch. El modelo detecta entidades PII mediante un esquema de etiquetas declarativo (zero-shot NER), pensado para tareas de redacción automática de documentos.

El modelo es un encoder basado en mDeBERTa-v3 al que se añade una cabeza de extracción de spans y conteo (arquitectura GLiNER2). Soporta siete idiomas (inglés, alemán, francés, español, italiano, portugués y neerlandés), lo que lo hace útil para pipelines de redacción multilingües. La exportación almacena los pesos en fp16 con un `Cast` a fp32 que ONNX Runtime pliega en tiempo de carga, reduciendo a la mitad el tamaño de descarga sin alterar los resultados.

La relevancia actual de esta ficha radica en que facilita el despliegue en producción de un detector PII sin dependencias de PyTorch, con licencia Apache-2.0 y un tamaño de repositorio de 0.6 GB. Las descargas y los "likes" registrados son cero en el momento de la consulta, por lo que se trata de una publicación reciente y poco difundida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mDeBERTa-v3 con cabeza de extraccion de spans y conteo (GLiNER2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 en disco con Cast a fp32 en carga (FP32 efectivo en computo) |
| Idiomas soportados | en, de, fr, es, it, pt, nl |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.onnx, extractor.onnx, tokenizer.json) |

## Arquitectura y entrenamiento

La arquitectura consta de dos grafos ONNX. El primero, `encoder.onnx`, es el encoder mDeBERTa-v3 que recibe `input_ids` y `attention_mask` y devuelve `last_hidden_state`. El segundo, `extractor.onnx`, implementa la cabeza de span y conteo propia de GLiNER2, con el esquema de campos rellenado hasta 64 posiciones; recibe `text_emb`, `schema_emb_padded`, `schema_mask` y `spans_idx`, y produce `count_logits` y `span_scores`. El modelo subyacente es `fastino/gliner2-privacy-filter-PII-multi`, fijado en la revision `36126f6`.

No se han proporcionado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO para el modelo base. Lo unico documentado por el autor de la exportacion es el proceso tecnico: conversión desde los scripts de `gliner2-rs` (revision `1bcf40e`), reproducible mediante `tools/models/gliner2/export.sh` en el repositorio de SecureGrid. Los pesos se guardan en fp16 y ONNX Runtime inserta un `Cast` a fp32 que se pliega en la carga, de modo que el computo se realiza en fp32 y los resultados se verificaron span a span contra el modelo de PyTorch.

## Capacidades

- Deteccion de entidades PII mediante esquema de etiquetas declarativo (zero-shot NER): el usuario define los campos y el modelo extrae los spans correspondientes.
- Redaccion de informacion personal en documentos, integrable en una aplicacion local (SecureGrid).
- Salida de conteo y de puntuacion por span (`count_logits` y `span_scores`), lo que permite umbralizar detecciones.
- Soporte multilingue en siete idiomas europeos: ingles, aleman, frances, espanol, italiano, portugues y neerlandes.
- Esquema de campos ampliable hasta 64 etiquetas simultaneas (padding interno del extractor).
- Inferencia sin dependencia de PyTorch, orientada a despliegue ligero con ONNX Runtime.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico: el modelo es un extractor de entidades, no un generador de texto.

## Casos de uso

- Redaccion automatica de documentos legales: el modelo detecta nombres, direcciones, identificadores y otros campos PII antes de compartir un contrato o expediente, permitiendo anonimizar el texto sin salir del entorno local.
- Cumplimiento de RGPD en pipelines internos: integrado en un proceso ETL, marca y enmascara datos personales en los registros antes de que lleguen a almacenes analiticos.
- Saneado de historiales sanitarios: con el esquema de campos configurable, se pueden definir etiquetas especificas (numero de historia, diagnostico, profesional) y redactar la informacion antes de usarla en investigacion.
- Procesamiento multilingue en atencion al cliente: al cubrir es, en, de, fr, it, pt y nl, permite redactar transcripciones de chat y correo en varias lenguas con un unico modelo.
- Preprocesado para anonimizacion previa a LLM: se coloca el detector delante de un modelo generativo para eliminar PII del prompt, reduciendo el riesgo de filtracion de datos a servicios externos.
- Despliegue en aplicaciones de escritorio o edge: al exportarse a ONNX con 0.6 GB de repositorio, cabe en equipos sin GPU dedicada y permite redaccion off-line sin conexion a internet.
- Auditoria de conjuntos de datos: deteccion por lotes de PII en corpus de entrenamiento antes de publicarlos o redistribuirlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 0.6 GB y los pesos se cargan en fp16 con computo en fp32, por lo que se espera un consumo de inferencia moderado propio de un encoder medio, sin cifra confirmada por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del repositorio es plausible que quepa en GPU de consumo, pero no hay dato oficial.
- Despliegue: ONNX Runtime es la via documentada. Otros motores (vLLM, llama.cpp, Ollama, TGI) no estan soportados por tratarse de un modelo de extraccion ONNX, no de un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al ser un modelo multilingue entrenado sobre datos no especificados, el rendimiento puede variar entre idiomas.
- Riesgo de falsos negativos y falsos positivos en la deteccion de PII: el autor no publica metricas de precision o recall, por lo que se recomienda validar con un conjunto propio antes de usarlo en produccion.
- No se especifica la longitud de contexto soportada, lo que limita la planificacion de documentos largos sin fragmentacion previa.
- El esquema de campos esta limitado a 64 etiquetas simultaneas por el padding interno del extractor.
- Licencia Apache-2.0: permite uso comercial, pero el credito del modelo corresponde a Fastino, no a LumeSec, que solo realiza la conversion de formato.
- El modelo no genera texto ni razona: es exclusivamente un extractor de entidades; no debe esperarse comportamiento conversacional.
- Publicacion muy reciente y sin adopcion registrada (0 descargas, 0 likes), por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lumesec/privacy-onnx
- Modelo base: https://huggingface.co/fastino/gliner2-privacy-filter-PII-multi
- Scripts de exportacion (gliner2-rs): https://github.com/codesoda/gliner2-rs
- Aplicacion SecureGrid: https://securegrid.dev
