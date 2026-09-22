# nwtgck/Qwen3.8-27B-GGUF

## Resumen

nwtgck/Qwen3.8-27B-GGUF es un repositorio de pesos cuantizados en formato GGUF generado a partir del modelo Qwen/Qwen3.8-27B, publicado por el usuario nwtgck el 22 de septiembre de 2026. Se trata de una conversión automática, tal y como indica la propia model card, realizada con la herramienta https://github.com/ggml-org/convert, y no de un entrenamiento o ajuste propio del autor del repositorio.

El modelo base cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones, según los datos de safetensors declarados), se distribuye bajo licencia Apache 2.0 y su pipeline es image-text-to-text, lo que implica entrada multimodal de imagen y texto con salida de texto. Los tags del repositorio incluyen gguf, quantized, conversational y endpoints_compatible.

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio tiene 0 descargas y 0 likes, su model card contiene únicamente un apartado "TODOs - add info" y no publica especificaciones de arquitectura, contexto, idiomas, cuantizaciones concretas ni resultados de benchmarks. La búsqueda web asociada no devolvió ninguna fuente relevante sobre el modelo (únicamente páginas de ayuda de Google Maps), por lo que esta ficha refleja exclusivamente los metadatos verificables del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica) |
| Parametros totales | 26.895.998.464 (~26,9 B), dato declarado en safetensors |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en detalle; el repositorio se etiqueta como `quantized` y esta en formato GGUF. El tamano del repositorio es de 120,7 GB |
| Idiomas soportados | no disponible (el campo de idiomas no esta informado) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio); el modelo base Qwen/Qwen3.8-27B se referencia con 26.895.998.464 parametros en safetensors |
| ID del repositorio | nwtgck/Qwen3.8-27B-GGUF |
| Autor | nwtgck |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline | image-text-to-text |
| Tags | gguf, quantized, image-text-to-text, base_model:Qwen/Qwen3.8-27B, endpoints_compatible, region:us, conversational |
| Fecha de creacion | 2026-09-22T13:23:14.000Z |
| Ultima actualizacion | 2026-09-22T13:23:14.000Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo en la documentacion proporcionada. La model card no describe si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un diseno hibrido, ni detalla el numero de capas, la dimension oculta, el mecanismo de atencion o el tipo de tokenizador. El unico dato estructural verificable es el recuento de parametros (26.895.998.464) y el pipeline declarado (image-text-to-text), que implica la existencia de algun componente de codificacion visual ademas del decodificador de texto.

Tampoco hay informacion sobre el entrenamiento: se desconoce el numero de tokens utilizados, la composicion del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, y cualquier innovacion tecnica asociada. El repositorio no contiene ningun entrenamiento propio: es una conversion automatica del modelo base Qwen/Qwen3.8-27B mediante la herramienta ggml-org/convert, cuyo proceso de cuantizacion no se detalla (no se especifica si se emplearon tecnicas como imatrix, calibracion con datasets de referencia o cuantizacion selectiva por capas). El unico procedimiento de uso documentado en la model card es la ejecucion mediante `llama serve -hf ggml-org/Qwen3.8-27B-GGUF`.

## Capacidades

Advertencia: la model card no documenta capacidades funcionales. Las siguientes afirmaciones se derivan exclusivamente de los tags y el pipeline declarados, no de evaluaciones publicadas.

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational`, lo que indica un formato de interaccion de dialogo multi-turno.
- Entrada multimodal de imagen y texto: el pipeline declarado es `image-text-to-text`, por lo que el modelo acepta imagenes junto a texto y produce texto como salida.
- Compatibilidad con endpoints de inferencia: el tag `endpoints_compatible` indica que el artefacto esta pensado para su uso en infraestructura de endpoints gestionados.
- Despliegue local en formato GGUF: los pesos estan cuantizados para ejecucion en CPU/GPU con la familia de herramientas llama.cpp y llama.app.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta informado.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional multimodal en puesto de trabajo local: dado que los pesos estan en GGUF y el modelo acepta imagen y texto, puede desplegarse con llama.cpp o llama.app en una estacion de trabajo con GPU de gama alta, permitiendo conversaciones con capturas de pantalla o fotografias sin enviar datos a servicios externos.
- Procesamiento de documentos escaneados en entornos con requisitos de privacidad: al ser un modelo de pesos abiertos con licencia Apache 2.0 y entrada de imagen, puede integrarse en flujos internos de extraccion de informacion de facturas, formularios o informes escaneados, manteniendo los datos dentro de la organizacion.
- Soporte tecnico asistido por capturas: un flujo en el que el usuario adjunta una captura de pantalla de un error y el modelo genera una respuesta textual, aprovechando la entrada image-text-to-text y el formato conversacional para el mantenimiento de contexto multi-turno.
- Prototipado rapido antes de migrar a infraestructura gestionada: el tag `endpoints_compatible` sugiere que el mismo modelo puede servir tanto en local (GGUF) como en un endpoint de inferencia, lo que permite validar un producto con pesos cuantizados y despues escalar.
- Generacion de descripciones de imagenes para accesibilidad: el pipeline image-text-to-text permite producir texto alternativo o descripciones para catalogos de imagenes, con la advertencia de que la calidad no esta documentada y requiere validacion manual.
- Evaluacion comparativa de cuantizaciones: el repositorio, con 120,7 GB de artefactos, resulta util para investigar la degradacion de calidad entre distintos niveles de cuantizacion GGUF frente al modelo base en safetensors, siempre que se disponga de un conjunto de evaluacion propio.
- Despliegue offline en entornos aislados (air-gapped): al distribuirse como ficheros GGUF y con licencia Apache 2.0, puede instalarse en redes sin acceso a internet para tareas de asistencia conversacional sobre imagenes y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MMMU u otras), el apartado de documentacion aparece como pendiente ("TODOs - add info") y la busqueda web realizada no devolvio ninguna fuente tecnica sobre el modelo. Tampoco se dispone de comparaciones entre las distintas cuantizaciones y el modelo base.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del recuento de parametros declarado (26,9 B) aplicando el coste teorico por peso de cada nivel de cuantizacion. No estan confirmadas por el autor ni por documentacion del repositorio.

| Nivel de cuantizacion | Peso aproximado de los pesos | VRAM estimada con cache KV y overhead |
|---|---|---|
| FP16 | ~54 GB | 60 GB o mas |
| Q8_0 | ~29 GB | 34-38 GB |
| Q6_K | ~22 GB | 27-30 GB |
| Q5_K_M | ~19 GB | 24-27 GB |
| Q4_K_M | ~16-17 GB | 20-24 GB |
| Q3_K_M | ~13 GB | 17-20 GB |
| Q2_K | ~10 GB | 14-16 GB |

- GPU recomendadas: para FP16, A100 80 GB, H100 80 GB o dos GPU de 48 GB; para Q8_0 y Q6_K, A100 40 GB, L40S 48 GB o dos GPU consumer de 24 GB; para Q4_K_M y Q5_K_M, una RTX 4090 o RTX 3090 de 24 GB es suficiente en la mayoria de configuraciones.
- Viabilidad en GPU consumer: si, en cuantizaciones Q4_K_M o inferiores con GPU de 24 GB (RTX 3090, 3090 Ti, 4090, 5090) o mediante reparto de capas entre CPU y GPU con menos VRAM. En tarjetas de 12-16 GB solo caben cuantizaciones muy agresivas (Q2_K, Q3_K_M) con degradacion notable esperada.
- Nota sobre el componente visual: al tratarse de un modelo image-text-to-text, hay que sumar la memoria del codificador de imagenes, que no se puede estimar a partir de los datos disponibles.
- Opciones de despliegue: llama.cpp y llama.app (mencionados en la propia model card mediante `llama serve -hf ggml-org/Qwen3.8-27B-GGUF`), ademas de otros runners compatibles con GGUF como Ollama, LM Studio o llama-cpp-python. El soporte de GGUF en vLLM o TGI no esta confirmado en la informacion proporcionada.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion para ningun hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| nwtgck/Qwen3.8-27B-GGUF (este repositorio) | 26,9 B (base) | no disponible | GGUF | apache-2.0 | 0 descargas, 0 likes | no disponible |
| ggml-org/Qwen3.8-27B-GGUF | no disponible | no disponible | GGUF | no disponible | referenciado en la model card | no disponible |
| Qwen/Qwen3.8-27B (modelo base) | 26.895.998.464 | no disponible | safetensors | apache-2.0 (segun el tag de este repositorio) | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de terceros (mismo tamano o misma tarea multimodal) que permita una comparacion rigurosa de parametros, contexto, rendimiento o licencia. La busqueda web realizada no aporto ninguna fuente sobre modelos comparables.

## Limitaciones y advertencias

- Ausencia total de validacion por la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, sin issues ni discusiones publicas que permitan contrastar su comportamiento real.
- Conversion automatica sin verificacion publicada: la model card indica que el modelo se convierte automaticamente con ggml-org/convert. No se documenta ningun control de calidad ni comparacion con el modelo base, por lo que puede existir degradacion respecto a los pesos originales.
- Documentacion incompleta: la model card contiene unicamente un apartado "TODOs - add info", sin descripcion, sin ejemplos, sin prompt template y sin instrucciones de uso mas alla del comando de llama.app.
- Longitud de contexto desconocida: al no informarse la ventana de contexto, no es posible dimensionar el consumo de cache KV ni garantizar el comportamiento en conversaciones largas o documentos extensos.
- Idiomas no declarados: se desconoce el soporte real de castellano u otras lenguas, lo que impide garantizar calidad en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos, y agravado aqui por la falta de benchmarks, evaluaciones de fidelidad y conjuntos de prueba publicados.
- Cuantizaciones agresivas: el uso de Q2_K o Q3_K_M para ajustar el modelo a GPU de gama media-baja degrada la calidad, especialmente en tareas que requieren precision (matematicas, extraccion literal de texto en imagenes).
- Capacidad multimodal no evaluada: la lectura de imagenes se deduce del pipeline declarado, pero no hay ejemplos ni metricas que la respalden; cualquier caso de uso con documentos escaneados requiere validacion manual previa.
- Sesgos no documentados: no se publica informacion sobre la composicion del dataset de entrenamiento ni sobre analisis de sesgo.
- Licencia: el repositorio se declara Apache 2.0, lo que en principio permite uso comercial. No obstante, no se aportan en la informacion disponible los terminos del modelo base Qwen/Qwen3.8-27B ni detalles sobre los datos de entrenamiento, por lo que conviene verificar ambas cosas antes de un despliegue comercial.
- Fechas y nomenclatura: el repositorio esta fechado en septiembre de 2026 y la model card mezcla referencias a `nwtgck/Qwen3.8-27B-GGUF` y `ggml-org/Qwen3.8-27B-GGUF`, lo que puede generar confusion sobre cual es el artefacto efectivamente publicado por cada autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nwtgck/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GGUF referenciado en la model card: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Herramienta de conversion citada: https://github.com/ggml-org/convert
- Runner mencionado en la model card: https://llama.app
- Papers, blogs o demos adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente paginas de ayuda de Google Maps, sin relacion con el contenido de esta ficha).
