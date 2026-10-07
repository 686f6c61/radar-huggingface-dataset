# RunningHubAI/rh-add-micro-details-concept-lora

## Resumen

rh-add-micro-details-concept-lora es un adaptador LoRA de edición de imagen publicado en Hugging Face por RunningHubAI, la cuenta de la plataforma RunningHub. El adaptador se ha entrenado sobre el modelo base identificado en la model card como `krea2` y su función declarada es añadir microdetalle (texturas finas, poros, grano, definición de superficies) a una imagen de entrada dentro de un flujo de image-to-image. Se distribuye como un único fichero `AddMicroDetails_Krea2_v1.safetensors` de 218 MiB, con palabra de activación `ultra-detailed` y ajustes recomendados de 25-40 pasos y CFG 5-7.

El modelo no es un modelo generativo autónomo: es un peso de ajuste que requiere cargarse sobre el modelo base `krea2` en ComfyUI, en la nube de RunningHub o en cualquier entorno compatible con adaptadores LoRA de difusión. El repositorio ocupa 0,2 GB, no tiene descargas ni likes registrados en el momento de la consulta y no declara licencia explícita, idiomas soportados ni resultados de evaluación. Los metadatos de Hugging Face lo etiquetan con el pipeline `image-text-to-image` y los tags `comfyui`, `lora` y `region:us`.

Su relevancia práctica es acotada pero clara: cubre una tarea muy concreta, el realzado de detalle fino, dentro de pipelines de edición de imagen ya montados sobre Krea 2. Al ser un LoRA de 218 MiB, el coste de almacenamiento y de VRAM adicional es mínimo comparado con el del modelo base, lo que facilita probarlo y compararlo con otros adaptadores de detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (fichero de pesos de 218 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors con precision no declarada |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y que se debe seguir la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors (`AddMicroDetails_Krea2_v1.safetensors`, 218 MiB) |

Otros datos declarados por el autor:

| Parametro | Valor |
|---|---|
| Modelo base | krea2 |
| Tipo de modelo | LoRA (edicion de imagen) |
| Palabra de activacion | `ultra-detailed` |
| Pasos recomendados | 25-40 |
| CFG recomendado | 5-7 |
| Strength | variable, sin valor fijo recomendado |
| Plataformas declaradas | ComfyUI / RunningHub / Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-10-07 |
| Ultima actualizacion | 2026-10-07 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador mas alla de su condicion de LoRA y de su modelo base, `krea2`. No se detalla el rango de la descomposicion de bajo rango, ni las capas objetivo del ajuste (atención, proyecciones de imagen, bloques de upsampling), ni si se ha entrenado sobre el UNet, sobre el transformer de difusion o sobre ambos. Tampoco se especifica la arquitectura del modelo base, que no se documenta en la model card mas alla de su nombre.

Respecto al entrenamiento, la model card unicamente enlaza a la pagina de entrenamiento de RunningHub y senala que el modelo esta afinado a partir de `krea2`. No se indica el numero de imagenes o pares de entrenamiento, la composicion del dataset, la resolucion de entrenamiento, el tipo de objetivo (por ejemplo, si es un LoRA conceptual de edicion o de estilo), ni si hubo etapas de refinamiento tipo RLHF o DPO, algo por otra parte poco habitual en adaptadores de difusion. La unica innovacion tecnica documentada es funcional: la incorporacion de microdetalle mediante la palabra de activacion `ultra-detailed`, controlable a traves del parametro de fuerza del LoRA.

En ausencia de detalle tecnico adicional, cualquier afirmacion sobre atencion lineal, decodificacion especulativa o tecnicas de muestreo eficiente seria especulativa y no se incluye.

## Capacidades

- Edicion de imagen a partir de una imagen de entrada (pipeline `image-text-to-image`), con el objetivo declarado de anadir microdetalle y textura fina.
- Activacion mediante la palabra clave `ultra-detailed`, segun la model card.
- Control de intensidad del efecto a traves del parametro de fuerza (strength), aunque el autor no fija un valor recomendado y advierte de que resulta dificil determinar cual queda mejor.
- Integracion en flujos de trabajo de ComfyUI mediante carga de un LoRA estandar en safetensors.
- Ejecucion en la plataforma en la nube de RunningHub, que es la via soportada oficialmente para probarlo sin infraestructura propia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision analitica, audio ni modo de pensamiento: son capacidades no aplicables a un adaptador de difusion de imagen.
- No se declaran capacidades multilingues ni idiomas soportados; el comportamiento linguistico depende del codificador de texto del modelo base.

## Casos de uso

- Realzado de detalle en retratos y fotografia de producto: aplicar el LoRA con fuerza moderada sobre una imagen ya generada o editada permite recuperar textura de piel, poros y definicion de tejidos sin regenerar la imagen desde cero.
- Pipeline de retoque por etapas en ComfyUI: encadenar un primer paso de generacion con el modelo base y un segundo paso de image-to-image con este LoRA a 25-40 pasos y CFG 5-7 para separar composicion y acabado.
- Preparacion de imagenes para impresion o formatos de alta resolucion: el incremento de microdetalle ayuda a que el resultado no se vea plastico o excesivamente suavizado al ampliar.
- Generacion de material grafico para e-commerce: recuperar detalle en texturas de tela, cuero, metal o madera en fichas de producto generadas o retocadas de forma automatizada.
- Ilustracion conceptual y arte digital: aumentar la densidad de detalle en entornos, arquitectura y superficies complejas cuando el modelo base produce resultados demasiado limpios.
- Procesado por lotes en produccion: al ser un adaptador de 218 MiB, puede precargarse junto al modelo base y aplicarse de forma condicional solo a las imagenes que lo requieran, sin duplicar el coste de memoria del modelo principal.
- Comparacion controlada de adaptadores de detalle: sirve como referencia para medir, con los mismos ajustes de pasos, CFG y fuerza, el efecto de un LoRA de microdetalle frente a alternativas sobre el mismo modelo base.
- Despliegue como servicio en la nube de RunningHub: usar la API de la plataforma para invocar el flujo sin gestionar GPU propia, util en prototipos y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, SSIM, comparativas humanas ni evaluaciones de detalle), y la busqueda web realizada no ha devuelto resultados relacionados con el modelo, sino contenido no pertinente sobre mapeo de codigos del Sistema Armonizado. Los unicos parametros de rendimiento documentados son de inferencia, no de calidad: 25-40 pasos y CFG 5-7.

## Requisitos de hardware

- El requisito dominante de VRAM lo determina el modelo base `krea2`, cuyas especificaciones no se declaran en la informacion disponible.
- El adaptador en si anade un coste marginal: 218 MiB de pesos, que en precision de 16 bits suponen del orden de 0,2 GB adicionales de VRAM, ademas de las activaciones asociadas a su aplicacion.
- No hay datos oficiales de VRAM, GPU recomendadas ni compatibilidad con GPUs de consumo. Cualquier cifra concreta seria una estimacion no verificada y no se incluye.
- Despliegue soportado: ComfyUI (local, cargando el safetensors como LoRA), RunningHub en la nube y carga directa desde Hugging Face. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a un adaptador de difusion de imagen.
- No se publican datos de latencia ni de throughput. El tiempo de inferencia dependera del modelo base, de la resolucion, del numero de pasos (25-40 recomendados) y del hardware empleado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores de microdetalle comparables, ni datos del modelo base `krea2`, ni metricas que permitan establecer una comparacion fundamentada con alternativas de la misma categoria. La busqueda web realizada no aporto ningun resultado relevante sobre el modelo ni sobre adaptadores equivalentes.

## Limitaciones y advertencias

- No se declara licencia. La model card indica que el copyright permanece con el autor y que debe seguirse la licencia del proyecto original o del modelo base, por lo que el uso comercial queda sin determinar y requiere consulta previa con el autor o con RunningHub.
- Al ser un LoRA dependiente del modelo base `krea2`, su uso esta sujeto tambien a la licencia de dicho modelo base, no documentada aqui.
- Riesgo de sobreprocesado o artefactos: aplicar el LoRA con una fuerza alta o con valores de CFG fuera del rango 5-7 puede introducir ruido, texturas artificiales o incoherencias. El propio autor senala que la fuerza "varia" y que resulta dificil determinar el mejor valor.
- No hay documentacion sobre sesgos. Al depender de los datos de entrenamiento del modelo base y del dataset del LoRA (no declarado), pueden heredarse sesgos de representacion de personas, culturas y estilos.
- Riesgo de alucinacion visual: como todo modelo de difusion en edicion, puede inventar detalle inexistente en la imagen original, lo que es problematico en contextos forenses, medicos o documentales donde la fidelidad al original es critica.
- Sin versionado ni historial de cambios publicado: solo existe una revision, creada y actualizada el mismo dia (2026-10-07), sin changelog.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y de reportes de fallos.
- La model card esta mayoritariamente orientada a promocionar la plataforma RunningHub, con enlaces de seguimiento y referencias a servicios de pago, y aporta muy poca informacion tecnica reutilizable.
- No se documentan idiomas soportados, resolucion de entrenamiento, capas objetivo del LoRA ni compatibilidad con otras variantes del modelo base distintas de `krea2`.
- La informacion de creacion del repositorio presenta una fecha futura (2026-10-07) respecto a patrones habituales; se reproduce tal cual figura en los metadatos, sin verificacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-add-micro-details-concept-lora
- Proyecto original del modelo: https://www.runninghub.ai/model/public/2099380956506357761
- Pagina del autor: https://www.runninghub.ai/user-center/2007154923476885506
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Paper: no disponible
- Repositorio de codigo: no disponible
- Demo adicional: no disponible
