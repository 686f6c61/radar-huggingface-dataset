# mamelles/LFM2.5-1.2B-Wolof-CPT

## Resumen

LFM2.5-1.2B-Wolof-CPT es un artefacto de modelo publicado en HuggingFace por el usuario `mamelles`, consistente en una continuación de preentrenamiento (continual pretraining, CPT) del modelo base `LiquidAI/LFM2.5-1.2B-Base` sobre un corpus limpiado de wolof. El modelo tiene 1.176.206.080 parámetros (aproximadamente 1,18 mil millones), se almacena en formato safetensors, ocupa 2,4 GB en el repositorio y se distribuye mediante la librería `transformers` para la tarea de generación de texto con etiqueta conversacional. Su autor lo describe como un artefacto privado de producción, en estado experimental y no publicado oficialmente.

El problema que aborda es la adaptación lingüística al wolof mediante CPT, un paso previo habitual antes de un ajuste por instrucciones específico del idioma. La model card es deliberadamente restrictiva en sus afirmaciones: indica que el artefacto superó las puertas automáticas registradas en `training_manifest.json` y que no se formula ninguna afirmación de calidad no registrada; las métricas se remiten a un `metrics.json` que no forma parte de la información disponible.

Su relevancia actual es acotada y de nicho. No se publican resultados de benchmarks, no se declara licencia, no se enumeran idiomas soportados y el repositorio registra 0 descargas y 0 interacciones, por lo que debe tratarse como material de experimentación para investigación privada sobre adaptación al wolof, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura; el nombre de familia remite a LFM2.5 de Liquid AI, sin confirmación en la informacion proporcionada) |
| Parametros totales | 1.176.206.080 (dato real de safetensors) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni FP8 en la informacion proporcionada) |
| Idiomas soportados | no disponible (el artefacto esta orientado a la adaptacion al wolof, sin listado oficial de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | LiquidAI/LFM2.5-1.2B-Base |
| Etapa de entrenamiento | CPT (continual pretraining) |
| Familia de tokenizer | `65k-ext` |
| Tamano del repositorio | 2,4 GB |
| Tarea (pipeline) | text-generation |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo. La model card unicamente identifica el modelo base (`LiquidAI/LFM2.5-1.2B-Base`), la etapa de entrenamiento (CPT) y la familia de tokenizer (`65k-ext`). No se detallan el numero de capas, el tipo de bloques, el mecanismo de atencion, la composicion del dataset, el numero de tokens de entrenamiento ni el uso de tecnicas como RLHF o DPO. Cualquier afirmacion sobre si se trata de un transformer denso, un hibrido convolucion-atencion o un MoE seria especulacion, por lo que se marca como no disponible.

Los unicos detalles tecnicos declarados son metodologicos. El CPT utiliza el protocolo de corpus limpiado de wolof; los datos de instrucciones estan reponderados y excluyen el split de test del Hub de origen. El autor advierte de un riesgo de contaminacion: aunque se excluyo el split de test, es posible que existieran ejemplos similares a benchmarks en el preentrenamiento upstream. Ademas, senala que la BPB (bits per byte) especifica de la familia de tokenizer no debe compararse como perplejidad entre las familias de 65k y 128k. No se incluyen las filas crudas del corpus privado en el repositorio.

## Capacidades

- Generacion de texto: el modelo esta etiquetado con el pipeline `text-generation` y la etiqueta `conversational`, por lo que su uso previsto es la generacion de texto en formato conversacional.
- Adaptacion al wolof: es el objetivo declarado del CPT, aunque el autor indica que la ortografia del wolof no ha sido validada de forma exhaustiva.
- Code-switching: se menciona como area no validada, no como capacidad confirmada.
- Soporte de tool calling o function calling: no disponible (no documentado en la model card).
- Soporte de agentes o razonamiento multietapa: no disponible (no documentado y explicitamente no validado).
- Capacidades multilingues: no disponible (no se publica listado de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible (no se declara ninguna).
- Razonamiento, matematicas y codigo: no disponible; el autor indica que el razonamiento no ha sido validado de forma exhaustiva.
- Seguridad alineada: no disponible; la model card indica que la seguridad no ha sido validada de forma exhaustiva.

## Casos de uso

- Investigacion en adaptacion linguistica: el modelo sirve como punto de partida para estudiar como un CPT sobre corpus de wolof afecta al comportamiento del modelo base `LiquidAI/LFM2.5-1.2B-Base`, comparando ambas versiones sobre el mismo conjunto de evaluacion interno.
- Comparacion de tokenizers mediante BPB: dado que el autor indica que la familia de tokenizer es `65k-ext`, el artefacto es util para medir BPB dentro de esa familia y no para extrapolar perplejidad a la familia de 128k.
- Base para un ajuste por instrucciones (SFT) en wolof: al ser un artefacto de CPT y no de instruction tuning, el uso natural es continuar el entrenamiento con datos de instrucciones en wolof antes de cualquier despliegue conversacional.
- Anotacion asistida y preetiquetado de corpus: el modelo puede generar borradores de texto en wolof para que anotadores humanos los revisen, con la advertencia de que se requiere revision por hablantes nativos.
- Evaluacion de code-switching wolof-frances: el autor senala esta area como no validada, por lo que un caso de uso razonable es disenar un protocolo de evaluacion controlado sobre ese fenomeno antes de dar por buena cualquier capacidad.
- Auditoria de contaminacion de benchmarks: el propio autor advierte de la posible existencia de ejemplos tipo benchmark en el preentrenamiento upstream, lo que convierte el artefacto en un caso de estudio para metodologias de deteccion de contaminacion.
- Reproduccion de puertas de calidad automatizadas: al remitirse a `training_manifest.json` y `metrics.json`, el modelo es util para reproducir y auditar los umbrales automaticos de un pipeline de CPT, no para medir calidad final.
- Experimentos academicos de bajo coste computacional: con 1,18 mil millones de parametros y 2,4 GB de pesos, permite iterar en una sola GPU de consumo sobre hipotesis de adaptacion linguistica antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que solo se incluyen salidas medidas en `metrics.json` y que la ausencia de una metrica significa que no fue medida, sin que pueda inferirse. Ese archivo `metrics.json` no forma parte de la informacion proporcionada, por lo que no se dispone de valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion. Tampoco se dispone de valores de BPB pese a la advertencia metodologica sobre la familia de tokenizer.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,4 GB solo para los pesos (1,18 mil millones de parametros), mas la memoria del cache KV, cuyo tamano depende de una longitud de contexto que no se ha publicado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,2 GB para los pesos, sin contar cache KV ni overhead del runtime.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,7 GB para los pesos; estas cifras son calculos aritmeticos a partir del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia poder ejecutar los pesos en fp16 con contexto corto; una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 ofrecen margen suficiente. Para servir varias peticiones concurrentes o contextos largos son preferibles A100 o H100.
- Compatibilidad con GPU de consumo: si, es probable que quepa en la mayoria de GPU de consumo modernas en fp16 y con holgura en cuantizaciones de 8 y 4 bits, siempre que el runtime lo permita y el contexto sea corto.
- Opciones de despliegue: al publicarse unicamente pesos safetensors para `transformers`, las vias directas son `transformers` (con `generate`), TGI o vLLM. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama requeririan una conversion propia a partir de los safetensors.
- Latencia y throughput estimados: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo analizado, por lo que la comparacion se limita a caracteristicas estructurales y de disponibilidad. Los datos de las alternativas proceden de conocimiento publico general y no han sido verificados en la informacion proporcionada; se marcan como tal.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| mamelles/LFM2.5-1.2B-Wolof-CPT | 1,18 B | no disponible | no disponible | safetensors, 0 descargas | no disponible |
| LiquidAI/LFM2.5-1.2B-Base | mismo orden (modelo base) | no disponible | no disponible en esta ficha | publico en HuggingFace | no disponible |
| Alternativas de ~1-2 B de otras familias (por ejemplo Llama 3.2 1B, Qwen2.5 1.5B, Gemma 2 2B) | ~1-2 B (dato publico general, no verificado) | no disponible en esta ficha | licencias propias de cada familia | ampliamente disponibles | no disponible |

En la informacion proporcionada no se han identificado otros modelos comparables especificamente adaptados al wolof mediante CPT, por lo que no es posible establecer una comparativa de rendimiento con alternativas de la misma tarea.

## Limitaciones y advertencias

- Caracter experimental declarado: el autor califica el artefacto como experimental y como artefacto privado de produccion, no como una release publica.
- Sin licencia publicada: al no declararse licencia, no puede asumirse permiso para uso comercial ni para redistribucion; cualquier uso en produccion debe tratarse como no autorizado hasta que el autor lo aclare.
- Sin benchmarks: no hay metricas publicadas y la model card advierte que la ausencia de una metrica no permite inferir nada sobre ella.
- Ortografia del wolof no validada: se requiere revision por hablantes nativos antes de ampliar su uso.
- Code-switching no validado: el comportamiento en mezcla de idiomas (por ejemplo wolof y frances) no ha sido caracterizado.
- Factualidad y razonamiento no validados: riesgo de alucinacion no cuantificado y sin evaluacion publicada.
- Comportamiento en contexto largo no validado: se desconoce la longitud de contexto soportada y su degradacion.
- Seguridad no validada: no hay evaluacion de seguridad ni de alineacion.
- Riesgo de contaminacion: el autor advierte de que pueden haber existido ejemplos similares a benchmarks en el preentrenamiento upstream, aunque se excluyo el split de test del Hub de origen.
- Advertencia metodologica sobre metricas: la BPB de la familia de tokenizer `65k-ext` no debe compararse como perplejidad con la familia de 128k.
- Sesgos: no disponibles; no se ha publicado ningun analisis de sesgos.
- Trazabilidad limitada: repositorio con 0 descargas y 0 interacciones, un unico autor y sin revision por pares; las afirmaciones de calidad se remiten a archivos (`training_manifest.json`, `metrics.json`) que no forman parte de la informacion disponible.
- Idiomas soportados sin declarar: no es posible saber que otros idiomas conserva el modelo tras el CPT ni en que grado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mamelles/LFM2.5-1.2B-Wolof-CPT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Resultados de busqueda web: no se ha encontrado informacion tecnica relevante sobre este modelo; los resultados devueltos corresponden a sitios comerciales de productos de madera (styleholz.com, perfiles en redes sociales y directorios de empresas), sin relacion con el modelo.
