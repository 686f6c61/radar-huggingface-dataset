# jarrelscy/GLM-5.3-Vision-NVFP4-ARVQ-v2-hybrid

## Resumen

GLM-5.3-Vision-NVFP4-ARVQ-v2-hybrid es un checkpoint experimental publicado por el usuario jarrelscy en HuggingFace. Se trata de una variante cuantizada y modificada del modelo multimodal GLM-5.3-Vision, en la que se han sustituido las 75 capas MoE del modelo original mediante una campana secuencial de cuantizacion. La propuesta tecnica combina dos esquemas de compresion distintos: NVFP4 para los "expertos calientes" (hot experts) y ARVQ v3 para los "expertos frios" (cold experts), con una asignacion de expertos guiada por puntuacion ARVQ (REAP).

El modelo tiene 186.827.108.584 parametros totales (~186,8 mil millones) y un repositorio de 311,1 GB, lo que refleja que conserva en precision original componentes como el backbone, el modulo BF16 MTP (multi-token prediction) y los componentes de vision. No se trata por tanto de una cuantizacion homogenea, sino de una mezcla: solo las capas MoE han sido recuantizadas, mientras que el resto de pesos mantiene la version previamente publicada.

Es relevante ahora como ejemplo de investigacion en cuantizacion selectiva por experto dentro de arquitecturas MoE multimodales, un area activa para reducir costes de despliegue de modelos de gran tamano. No obstante, el propio autor advierte de que la paridad nativa SM120 y la calidad a nivel de modelo completo "permanecen sin verificar", y que no se han publicado resultados de benchmarks. Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), multimodal (vision) |
| Parametros totales | 186.827.108.584 (~186,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la campana de cuantizacion usa contexto 1024, no la ventana del modelo) |
| Tipos de cuantizacion | NVFP4 (hot experts), ARVQ v3 (cold experts), libros por experto restringidos a FP4 y escalas por bloque restringidas a FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de inferencia | vllm |
| Tamano del repositorio | 311,1 GB |
| Estado | experimental |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de Mixture of Experts, heredada de GLM-5.3-Vision, e incluye componentes de vision y un modulo BF16 MTP (multi-token prediction). El checkpoint sustituye las 75 capas MoE del modelo original ("75/75 MoE layers replaced by the full-corpus sequential PV campaign"), mientras que el backbone, los componentes de vision, la asignacion de expertos y los hot experts permanecen sin cambios respecto a la version publicada anteriormente. Cada capa se reemplaza mediante dos ficheros de tensores y sus informes, en un unico commit.

El proceso de cuantizacion entrena libros (books) por experto restringidos a FP4 y escalas por bloque restringidas a FP8 con Adam. Los datos de calibracion son 18.001.846 tokens de texto con contexto 1024, con conjuntos fijos de validacion y auditoria de desarrollo de 16.384 tokens cada uno. El lote efectivo es de 262.144 tokens, acumulado en cuatro pasadas de 65.536. Las capas 4 a 26 usan 69 actualizaciones con tasas de aprendizaje .048/.032 hasta la actualizacion 45 y despues .012/.008; a partir de la capa 27 se aplican criterios de parada temprana (tres comprobaciones de validacion mas de un 0,1 % peores que el mejor resultado disparan una reduccion de LR; 15 actualizaciones sin mejora permiten detener). Cada 20 actualizaciones se reasigna el indice de gradiente de salida y cada cinco se conserva el mejor checkpoint de validacion. La publicacion queda condicionada a la no regresion en auditoria y a la reproducibilidad en exportacion.

Como innovacion destacable, la reasignacion de expertos se basa en puntuacion ARVQ (REAP) para decidir la asignacion de presupuesto de cuantizacion entre expertos. El autor indica que la aritmetica "fria" emula planos de activacion FP4 y fronteras FP16, pero que la paridad nativa SM120 y la calidad a nivel de modelo completo no han sido verificadas.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base GLM-5.3-Vision, aunque su calidad no ha sido validada tras la cuantizacion.
- Vision: el checkpoint conserva los componentes de vision del modelo original, por lo que se espera soporte de entrada multimodal.
- Multi-token prediction: incluye el modulo BF16 MTP sin cambios.
- Razonamiento multi-paso y agentes: presumiblemente heredado del modelo base, aunque no documentado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking mode, audio): no disponible.
- No se documentan capacidades adicionales especificas de este checkpoint mas alla de la recuantizacion de las capas MoE.

## Casos de uso

- Investigacion en cuantizacion de MoE: el checkpoint sirve para estudiar el impacto de mezclar NVFP4 y ARVQ v3 por experto sobre la calidad final, comparando contra el modelo original sin cuantizar.
- Validacion de pipelines de exportacion y despliegue en vLLM: util para probar la carga de pesos cuantizados heterogeneos y la reasignacion de indices de expertos en entornos de servido.
- Experimentacion con hardware SM120: pensado para evaluar la paridad nativa en arquitecturas SM120 (por ejemplo, generaciones recientes de GPU con soporte FP4 nativo), aunque el autor advierte de que no esta verificada.
- Estudio de estrategias REAP de asignacion de presupuesto: permite analizar como la puntuacion ARVQ distribuye bits entre expertos calientes y frios dentro de una misma capa.
- Reproduccion de protocolos de calibracion con corpus secuencial: la campana usa 18 M de tokens de texto y un esquema de actualizaciones por capa, replicable en otros modelos MoE.
- Benchmarking interno de calidad frente al modelo base: util para medir regresiones introducidas por la cuantizacion antes de decidir si un checkpoint cuantizado es apto para tareas de vision-lenguaje.
- Pruebas de integracion en pipelines multimodales con contexto corto: dado que la calibracion se hizo a contexto 1024, sirve para escenarios de inferencia con secuencias cortas y validacion de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio de pesos ocupa 311,1 GB. Es necesario un despliegue multi-GPU; no cabe en una sola GPU de 80 GB.
- Configuracion minima orientativa: a partir de 4x H100 80 GB (320 GB) solo para pesos, lo que deja un margen muy ajustado para cache KV y activaciones; en la practica se recomienda 8x H100 80 GB o 8x A100 80 GB con paralelismo tensorial.
- GPU recomendadas: H100, H200, A100 80 GB. El uso de FP4 nativo apunta a GPUs con soporte SM120; en otras arquitecturas puede requerir emulacion, con la consiguiente perdida de rendimiento.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) por tamano de pesos.
- Opciones de despliegue: vLLM es la libreria declarada por el autor. No se documenta soporte para llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Vision-NVFP4-ARVQ-v2-hybrid | 186,8 B | no disponible | NVFP4 + ARVQ v3 (mixta) | no disponible | HuggingFace (jarrelscy) |
| GLM-5.3-Vision (modelo base) | no disponible | no disponible | original del autor | no disponible | no disponible |
| Otros MoE multimodales de ~180 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal y advierte de que la paridad nativa SM120 y la calidad a nivel de modelo completo permanecen sin verificar.
- Sin benchmarks: no hay metricas publicadas que respalden el rendimiento tras la cuantizacion.
- Riesgo de regresion de calidad: solo las capas MoE han sido recuantizadas; la mezcla NVFP4/ARVQ puede degradar la coherencia en tareas de razonamiento y generacion larga.
- Conjunto de auditoria no ciego: el autor indica que el conjunto de auditoria es "historical development data, not an untouched final test", por lo que sus resultados no equivalen a una validacion independiente.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no documentado especificamente para este checkpoint.
- Limitaciones de contexto o idioma: no disponible; la calibracion se realizo a contexto 1024, lo que no garantiza buen comportamiento en ventanas largas.
- Restricciones de licencia: la licencia no esta declarada, lo que impide confirmar si se permite uso comercial.
- Requisitos de despliegue exigentes: 311,1 GB de pesos implican infraestructura multi-GPU, lo que limita su uso a entornos con recursos dedicados.
- Sin fecha de actualizacion posterior: el repositorio fue creado y actualizado el 20 de septiembre de 2026, sin actividad posterior registrada (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- HuggingFace: https://huggingface.co/jarrelscy/GLM-5.3-Vision-NVFP4-ARVQ-v2-hybrid
- Paper, blog, repositorio o demo adicionales: no disponible
- Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces obtenidos correspondian a contenidos no pertinentes (fachadas de un fabricante de fibrocemento) y se han descartado.
