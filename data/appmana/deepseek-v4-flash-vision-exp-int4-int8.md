# appmana/deepseek-v4-flash-vision-exp-int4-int8

## Resumen

`appmana/deepseek-v4-flash-vision-exp-int4-int8` es una conversion cuantizada del checkpoint multimodal `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp`, publicada por el usuario appmana y orientada a despliegue en inferencia. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es un artefacto de pesos convertidos exclusivamente a partir del checkpoint base con licencia MIT (commit `6821d6ad3681a4b137b066b76094fa82ebd0a380`), sin datos de entrenamiento privados ni checkpoints cerrados.

El modelo conserva la topologia del original: 168.910.980.286 parametros totales (unos 168,9 mil millones), 43 capas de decoder, arquitectura MoE etiquetada como `deepseek_v4`, tres etapas DSpark nativas y parametros de enrutamiento especificos para imagen. La cuantizacion es mixta: INT4 simetrico con grupos de 32 y escalas MSE en los expertos, INT8 canal a canal en los lineales densos y W8A8 con grupos de 32 en la torre de vision, manteniendo en BF16 el tensor WO_A asociado a inverse-RoPE.

Su relevancia ahora es doble. Por un lado, reduce el coste de memoria de un modelo multimodal de casi 169.000 millones de parametros, lo que acerca su despliegue a clusters moderados. Por otro, debe considerarse un candidato a despliegue, no un modelo validado: el autor indica explicitamente que la validacion de cluster a modelo completo esta en curso y que no se reclama ningun resultado de calidad o capacidad hasta que finalice. Ademas, requiere el runtime vLLM modificado de AppMana; la version generica de vLLM es insuficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE `deepseek_v4` con torre de vision; 43 capas de decoder; tres etapas DSpark nativas |
| Parametros totales | 168.910.980.286 (~168,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos: INT4 simetrico group32 con escalas MSE. Lineales densos: INT8 canal a canal (AllSpark), con WO_A de inverse-RoPE preservado en BF16. Vision: W8A8 group-32 IMMA |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (shards con un maximo de 4 GiB de datos tensoriales) |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-Vision-Exp |
| Revision del modelo base | 6821d6ad3681a4b137b066b76094fa82ebd0a380 |
| Pipeline | image-text-to-text |
| Biblioteca declarada | vllm |
| Tamano del repositorio | 186,6 GB |
| Particion inicial en pipeline paralelo | PP11: `4,4,4,4,4,4,4,4,5,5,1` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-14 |

## Arquitectura y entrenamiento

El checkpoint es una conversion de precision, no un reentrenamiento. Mantiene intacta la estructura del modelo base: un decoder transformer de tipo mezcla de expertos con 43 capas, tres etapas DSpark nativas y parametros de enrutamiento especificos para las entradas de imagen. La torre de vision se conserva como componente diferenciado y se cuantiza de forma independiente al cuerpo de lenguaje.

La estrategia de cuantizacion es granular y heterogenea. Los expertos usan INT4 simetrico con tamano de grupo 32 y escalas calculadas por error cuadratico medio. Los lineales densos emplean INT8 canal a canal bajo el esquema AllSpark, con una excepcion deliberada: el tensor WO_A asociado a inverse-RoPE se mantiene en BF16, presumiblemente para preservar precision en el mecanismo posicional. La torre de vision aplica W8A8 con grupos de 32 sobre instrucciones IMMA: las proyecciones y la atencion QK/PV se ejecutan en tensor cores enteros, mientras que escalas en coma flotante, softmax, normalizacion, no linealidades y residuales permanecen en punto flotante.

En el plano de despliegue, los shards respetan la propiedad de cada etapa de pipeline y no superan los 4 GiB de datos tensoriales. La particion PP11 inicial reparte las capas como `4,4,4,4,4,4,4,4,5,5,1`, con la torre de vision en el rank 0 y DSpark en el rank final. El servicio usa siete tokens especulativos probabilisticos y conserva la configuracion de draft del modelo original. Existe ademas una rama `bf16-vision-reference` con pesos de lenguaje y draft identicos pero torre de vision en BF16, pensada para comparaciones controladas de precision. No se documenta en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Procesamiento de imagen y texto de forma conjunta, con salida de texto (pipeline `image-text-to-text`).
- Decodificacion especulativa con siete tokens probabilisticos por paso de servicio, segun la configuracion de draft heredada del modelo fuente.
- Enrutamiento de expertos con parametros especificos para imagen, lo que sugiere tratamiento diferenciado de tokens visuales dentro del MoE.
- Inferencia con precision mixta INT4/INT8 acelerada por tensor cores enteros en la torre de vision.
- Ejecucion en pipeline paralelo de 11 etapas, lo que habilita servir el modelo repartido entre varios nodos o GPUs.
- Capacidades de generacion de texto, razonamiento, codigo o matematicas: no disponibles de forma explicita en la informacion proporcionada, aunque se heredan del modelo base no verificadas en esta conversion.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Comprension de documentos escaneados: el modelo acepta imagen y texto, por lo que puede emplearse para extraer campos estructurados de facturas, contratos o formularios combinando OCR implicito con razonamiento sobre el layout. La cuantizacion INT8 de la torre de vision reduce el coste por pagina frente al checkpoint BF16.
- Atencion al cliente multimodal: permite que el usuario adjunte capturas de pantalla, fotos de producto o recibos y reciba una respuesta textual, manteniendo el historial de conversacion en el cuerpo de lenguaje de 43 capas.
- Moderacion de contenido visual a escala: clasificacion y descripcion automatica de imagenes en colas de revision, aprovechando el enrutamiento especifico de imagen del MoE para separar el procesamiento visual del textual.
- Generacion de descripciones y metadatos para catalogos de producto: alt text, etiquetado y normalizacion de fichas a partir de fotografias, con el modelo desplegado sobre vLLM y particionado en pipeline.
- RAG multimodal: indexacion de documentos con figuras y tablas donde las consultas combinan texto e imagen, usando las 43 capas de decoder para sintetizar la respuesta final.
- Inspeccion visual asistida en entornos industriales: preanalisis de imagenes de linea de produccion con el modelo como primer filtro antes de revision humana. Debe tratarse como escenario candidato, dado que la validacion de calidad a modelo completo sigue en curso.
- Evaluacion comparativa de cuantizacion: la rama `bf16-vision-reference` permite medir la perdida de precision de la torre de vision cuantizada frente a BF16 manteniendo constante el resto de pesos, lo que resulta util para equipos que calibran esquemas W8A8.
- Despliegue experimental en clusters de investigacion: la particion PP11 y los shards de 4 GiB facilitan pruebas de pipeline paralelo sobre infraestructura multinodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que no se reclama ningun resultado de calidad o capacidad hasta que concluya la validacion del modelo completo en cluster.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 186,6 GB, por lo que se necesita al menos esa capacidad de almacenamiento y una memoria agregada del mismo orden para cargar los pesos repartidos. Con la particion PP11 (`4,4,4,4,4,4,4,4,5,5,1`), cada etapa concentra entre 4 y 5 capas, mas la torre de vision en el rank 0 y DSpark en el rank final.
- GPUs recomendadas: no especificadas por el autor. La particion en 11 etapas y el uso de tensor cores enteros (IMMA en vision) apuntan a GPUs de centro de datos con soporte de INT8/INT4, como la familia H100 o A100. No hay confirmacion oficial.
- Compatibilidad con GPU de consumo: no disponible. Con aproximadamente 169.000 millones de parametros y 186,6 GB de pesos, no cabe en una unica GPU de consumo; harian falta varias y aun asi el requisito de runtime especifico lo hace poco viable en ese escenario.
- Opciones de despliegue: exclusivamente el fork de vLLM de AppMana. El propio autor advierte que el vLLM generico es insuficiente para cargar este checkpoint. No se documenta soporte para llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponibles. El unico dato operativo es el uso de siete tokens especulativos probabilisticos por paso de servicio, con la configuracion de draft del modelo fuente.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| appmana/deepseek-v4-flash-vision-exp-int4-int8 | 168,9 B | Mixta INT4/INT8, WO_A en BF16 | no disponible | MIT | HuggingFace, requiere vLLM de AppMana |
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp | no disponible en la ficha | BF16 (presumible) | no disponible | MIT | HuggingFace |
| Rama `bf16-vision-reference` del mismo repo | 168,9 B | BF16 en torre de vision, resto identico | no disponible | MIT | HuggingFace, misma rama del repositorio |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- Estado de validacion: es un candidato a despliegue. El autor declara que la validacion de cluster a modelo completo esta en curso y que no se reclama ningun resultado de calidad o capacidad hasta que finalice. No debe usarse en produccion como si estuviera validado.
- Dependencia de runtime: requiere el fork de vLLM de AppMana. El vLLM generico no es suficiente, lo que limita la portabilidad y ata el despliegue a un runtime concreto.
- Riesgo de degradacion por cuantizacion: la torre de vision se sirve en W8A8 y los expertos en INT4 agrupado, lo que puede introducir perdida de precision respecto al checkpoint BF16. No se han publicado mediciones de esa perdida; la rama `bf16-vision-reference` existe precisamente para cuantificarla.
- Alucinacion: no hay datos especificos para esta conversion. Al ser un modelo multimodal, el riesgo de describir contenido inexistente en una imagen no puede descartarse y no ha sido evaluado en la informacion disponible.
- Idiomas: no disponibles. No se puede confirmar cobertura multilingue ni calidad por idioma.
- Longitud de contexto: no disponible, lo que impide garantizar el comportamiento en conversaciones o documentos largos.
- Sesgos: no disponibles. No se han publicado evaluaciones de sesgo para esta conversion.
- Restricciones de licencia: la licencia es MIT, heredada del modelo base, lo que en principio permite uso comercial. Sin embargo, conviene verificar las condiciones del runtime vLLM modificado de AppMana, que no se detallan en la informacion proporcionada.
- Soporte de tool calling, agentes y otras capacidades del modelo base: no confirmados en esta conversion.
- Metricas de adopcion minimas: cero descargas y cero likes en el momento de la consulta, con una fecha de actualizacion muy proxima a la de creacion, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/appmana/deepseek-v4-flash-vision-exp-int4-int8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Revision del modelo base utilizada en la conversion: `6821d6ad3681a4b137b066b76094fa82ebd0a380`
- Rama de referencia con torre de vision en BF16: `bf16-vision-reference`, dentro del repositorio de appmana
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
