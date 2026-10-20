# eole-nlp/Qwen3.8-27B-BF16-eole

## Resumen

`eole-nlp/Qwen3.8-27B-BF16-eole` es un checkpoint del modelo `Qwen/Qwen3.8-27B` ya convertido al formato del runtime Eole y empaquetado en BF16. No se trata de un modelo nuevo ni de un reentrenamiento: el autor (eole-nlp) parte de una revisión concreta y fijada del repositorio upstream y publica los pesos con la configuración y los nombres de tensores que espera Eole. El resultado es un artefacto de distribución pensado para cargarse directamente con la biblioteca Eole 0.6.4 y sus dependencias opcionales, sin pasar por un proceso de conversión local.

El checkpoint contiene 27.409.172.720 parámetros (27,4 mil millones) almacenados en BF16, con un total de 54,8 GB repartidos en ocho shards y licencia Apache 2.0 según los metadatos del repositorio. La model card indica que los pesos conservan los valores convertidos localmente y que el empaquetado no recuantiza ni normaliza; el comportamiento de normalización en FP32 de Eole se mantiene sin cambios. La conversión incluyó comprobaciones de completitud de tensores y de igualdad de valores transformados, y el paquete pasó pruebas de humo de inferencia offline con verificación de digests SHA256.

Su relevancia práctica es acotada pero clara: elimina el paso de conversión para quienes ya trabajan con Eole y facilita despliegues reproducibles mediante la descarga de un commit fijado del Hub. Ahora bien, el repositorio no publica resultados de benchmarks, no declara idiomas soportados y no documenta la arquitectura interna ni la longitud de contexto, por lo que cualquier evaluación de calidad debe hacerse por cuenta del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no detalla la arquitectura; el checkpoint usa configuración y nombres de tensores propios de Eole, no de Transformers) |
| Parametros totales | 27.409.172.720 (27,4 mil millones) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 para los pesos en coma flotante; no se publican versiones GGUF, AWQ, GPTQ ni INT8/INT4 en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (según metadatos del repositorio) |
| Formato de pesos | Safetensors en BF16, 8 shards, 54,8 GB de repositorio |
| Biblioteca de carga | Eole 0.6.4 con dependencias opcionales de la arquitectura |
| Modelo base | Qwen/Qwen3.8-27B |
| Revision upstream fijada | 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0 |
| Revision de codigo Eole | 0c9b3f7ea253b1b977ef47a01ef2a8c6b130f22b |
| Pipeline | text-generation |
| Etiquetas | eole, safetensors, converted, text-generation, conversational |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-20 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base: la model card se limita a indicar que es un checkpoint Eole preconvertido de `Qwen/Qwen3.8-27B` y advierte de que su configuración y nombres de tensores no corresponden a un checkpoint de Transformers. No se detallan el tipo de transformer, el número de capas, las dimensiones ocultas, el mecanismo de atención ni si emplea mezcla de expertos. Tampoco se especifica la longitud de contexto nativa. Cualquier dato de arquitectura más allá de los 27,4 mil millones de parámetros y el almacenamiento en BF16 requeriría consultar el repositorio upstream, que no forma parte de la información proporcionada.

En el plano del entrenamiento, este artefacto no aporta información sobre datos, número de tokens, composición del corpus ni fases de alineación como RLHF o DPO, porque no es un modelo entrenado por eole-nlp sino una conversión. Lo que sí documenta el autor es el proceso de empaquetado: conversión desde la revisión upstream fijada, ocho shards de salida, verificación de completitud de tensores y de igualdad de valores transformados, conservación de los valores convertidos sin recuantización ni normalización, y mantenimiento del comportamiento de normalización en FP32 propio de Eole. La validación incluyó pruebas de humo de inferencia offline tanto del paquete local portátil como de una descarga limpia desde un Hub privado, con coincidencia de todos los digests SHA256 publicados en el manifiesto.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation` y la etiqueta `conversational` sugiere uso en diálogo, aunque no se documentan formatos de prompt ni plantillas de chat en la información disponible.
- Conversacion multi-turno: no se especifica la ventana de contexto, por lo que no puede confirmarse la profundidad de historial soportada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se mencionan en la model card.
- Carga y ejecución en runtime Eole: capacidad confirmada por el autor mediante pruebas de humo de inferencia offline.
- Reproducibilidad de despliegue: soportada mediante descarga de un commit fijado del Hub con `huggingface_hub.snapshot_download` y verificación de digests SHA256.

## Casos de uso

- Inferencia autoalojada con Eole: cargar el repositorio directamente como `model_path` con `compute_dtype: bf16` en Eole 0.6.4 y evitar el paso de conversión desde el checkpoint upstream. Es adecuado porque el paquete ya incluye tokenizador y configuración de runtime, y los nombres de tensores coinciden con lo que espera la biblioteca.
- Despliegues reproducibles en producción: fijar un commit concreto del Hub mediante `snapshot_download`, pasar el directorio devuelto como `model_path` y validar los SHA256 contra `model-manifest.json`. El autor documenta este flujo y lo respalda con pruebas de descarga limpia.
- Asistente conversacional self-hosted: usar el pipeline `text-generation` con la etiqueta `conversational` para diálogo en una infraestructura propia, siempre que se definan manualmente las plantillas de prompt según las recetas de Eole. Requiere verificar antes el contexto real del modelo base, no documentado aquí.
- banco de pruebas para recetas de Eole: emplear el checkpoint como referencia estable al desarrollar o depurar recetas de prompt y configuraciones de serving en `eole-nlp/eole/recipes`, dado que los pesos están congelados a una revisión upstream concreta.
- Generación por lotes en pipelines de datos: procesar grandes volúmenes de texto con un modelo de 27,4B en BF16 cuando se dispone de GPUs de 80 GB, aceptando el coste de memoria a cambio de evitar artefactos cuantizados no validados.
- Comparación de formatos de checkpoint: contrastar el comportamiento en inferencia de este paquete Eole frente al checkpoint Transformers original, manteniendo constantes los pesos de origen, para aislar diferencias atribuibles al runtime y al empaquetado.
- Base para experimentación interna: partir de un checkpoint BF16 ya empaquetado para pruebas de evaluación propias, teniendo en cuenta que el autor no publica métricas de calidad y que la herramienta de fine-tuning no está documentada en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las comprobaciones realizadas son validación funcional (pruebas de humo de inferencia y verificación de digests) y no una evaluación de benchmarks o de calidad, y que el artefacto está destinado a inferencia, no a respaldar afirmaciones de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos suman aproximadamente 54,8 GB (27.409.172.720 parámetros × 2 bytes). Sumando caché KV y activaciones, el requisito práctico se sitúa por encima de los 55-60 GB, con variación según longitud de contexto y tamaño de lote. Es una estimación aritmética a partir del tamaño publicado, no un dato medido por el autor.
- GPU recomendadas: una A100 80 GB o una H100 80 GB para ejecución en una sola tarjeta. No se documenta soporte de paralelismo tensorial en Eole para este checkpoint.
- Cabe en GPU de consumo: no en BF16. Una RTX 4090 con 24 GB no puede alojar los pesos completos, y el repositorio no publica cuantizaciones GGUF, AWQ o GPTQ que permitan reducir la huella.
- Opciones de despliegue: Eole 0.6.4 con las dependencias opcionales de la arquitectura, tal como indica el autor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; de hecho, la model card advierte de que la configuración y los nombres de tensores no son los de un checkpoint de Transformers.
- Almacenamiento: 54,8 GB de repositorio, distribuidos en ocho shards.
- Latencia y throughput: no disponible. El autor no publica cifras de rendimiento y la validación se limita a pruebas de humo sin métricas de velocidad.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. El único punto de referencia directo es el checkpoint upstream del que deriva este paquete:

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|---|
| eole-nlp/Qwen3.8-27B-BF16-eole | 27,4B | No disponible | Safetensors BF16, 8 shards, 54,8 GB | Eole 0.6.4 | Apache 2.0 (según repositorio) | No disponibles |
| Qwen/Qwen3.8-27B (upstream) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No confirmada en la informacion disponible | No disponibles |

La búsqueda web realizada no devolvió información técnica sobre ninguno de los dos repositorios ni sobre alternativas de la misma categoría: los resultados corresponden a entidades homónimas sin relación (servicios bibliotecarios, asociaciones, mobiliario y el proyecto de infraestructura ferroviaria RER E de Île-de-France).

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni de calidad conversacional, por lo que el rendimiento real es desconocido hasta que el usuario lo evalúe.
- Sin datos de sesgo ni de alucinación: el repositorio no documenta evaluaciones de sesgo, tasas de alucinación ni comportamientos problemáticos.
- Idiomas no declarados: no puede asumirse soporte multilingüe sin verificación empírica.
- Contexto desconocido: la ausencia de longitud de contexto documentada impide dimensionar la caché KV y planificar despliegues multi-turno o con documentos largos.
- Dependencia estricta de Eole: el checkpoint no es cargable con Transformers, vLLM, llama.cpp, Ollama ni TGI, según advierte el propio autor. Toda la cadena de herramientas debe ser Eole 0.6.4 con dependencias opcionales de la arquitectura.
- Huella de memoria elevada: 54,8 GB en BF16 excluyen el despliegue en GPU de consumo y obligan a hardware de 80 GB o a soluciones multi-GPU no documentadas.
- Sin cuantizaciones publicadas: no existen versiones GGUF, AWQ, GPTQ ni INT8/INT4 en este repositorio, de modo que reducir memoria exige un proceso de cuantización externo no validado por el autor.
- Licencia: el repositorio se declara Apache 2.0, lo que en principio permite uso comercial, pero la licencia y los términos del modelo base `Qwen/Qwen3.8-27B` no constan en la información proporcionada y deben verificarse en el repositorio upstream antes de un uso en producción.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día (2026-10-20), sin validación independiente por parte de la comunidad.
- Validación limitada: las pruebas del autor son funcionales (humo de inferencia y digests), no evalúan calidad, sesgos, robustez ni seguridad.
- Manipulación de ficheros: al estar empaquetado con rutas `${MODEL_PATH}`, mover el checkpoint requiere respetar la estructura incluida; el autor recomienda descargar un commit fijado para garantizar reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/eole-nlp/Qwen3.8-27B-BF16-eole
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Recetas de Eole: https://github.com/eole-nlp/eole/tree/main/recipes
- Repositorio de Eole: https://github.com/eole-nlp/eole
- Manifiesto de tensores y digests: `model-manifest.json` dentro del repositorio
- Resultados de validación: `validation.json` dentro del repositorio
- Documentación upstream incluida: `UPSTREAM_README.md` dentro del repositorio
- Nota sobre la búsqueda web: no se han encontrado enlaces técnicos relevantes; los resultados obtenidos corresponden a entidades homónimas sin relación con el modelo (Éole de la Médiathèque Valentin Haüy, EOLE Association, EOLE France, el proyecto RER E de Île-de-France y la entrada de Wikipedia sobre Éole).
