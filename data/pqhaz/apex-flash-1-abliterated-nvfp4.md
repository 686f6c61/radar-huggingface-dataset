# pqhaz/apex-flash-1-abliterated-NVFP4

## Resumen

apex-flash-1-abliterated-NVFP4 es una cuantizacion weight-only en formato NVFP4 del modelo cantina-security/apex-flash-1-abliterated, publicada por el usuario pqhaz. El modelo base es, segun la model card del autor, un MoE de 321B parametros con arquitectura GLM-5.3-Flash, en su variante abliterated (con los comportamientos de rechazo eliminados mediante tecnicas de abliteration). El pipeline declarado es image-text-to-text, de modo que acepta entradas de imagen y texto. Los safetensors del repositorio, sin embargo, declaran 165.496.249.182 parametros (~165,5B), una discrepancia que conviene verificar antes de dimensionar infraestructura.

El proposito de esta publicacion es reducir el coste de despliegue manteniendo intactos los componentes sensibles a la calidad. El repositorio ocupa 194,7 GB, frente a los ~643 GB del BF16 original o los ~328 GB de la version FP8 del mismo autor. La cuantizacion se aplica unicamente a los expertos MoE enrutados (gate, up, down); atencion, KDA, expertos compartidos, MLPs densos, routers, MTP y el modulo de vision permanecen en BF16 sin modificar.

Su relevancia es acotada y muy especifica: no hay benchmarks publicados, el repositorio acumula 0 descargas y 0 likes, y su interes principal es doble. Por un lado, sirve como material de investigacion en seguridad autorizada sobre modelos sin alineamiento de rechazo. Por otro, documenta un layout de cuantizacion NVFP4 (modelopt, W4A16) reutilizable por otras publicaciones del mismo ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con componentes de atencion, KDA, expertos compartidos, MTP y vision; arquitectura GLM-5.3-Flash segun la model card, tag glm5_next |
| Parametros totales | 165.496.249.182 (~165,5B) segun safetensors del repo; la model card declara 321B para el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 weight-only (W4A16) sobre expertos MoE enrutados; resto de componentes en BF16. Existe version FP8 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MIT, heredada del modelo base (copyright (c) 2026 Z.AI Co., Ltd) |
| Formato de pesos | safetensors (layout modelopt, quant_algo: NVFP4); valores E2M1 empaquetados dos por byte (U8) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre los datos de entrenamiento del modelo base: numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo unico documentado es que la variante base ha sido sometida a abliteration, un procedimiento que modifica los pesos o las activaciones para suprimir la direccion de rechazo, sin que el autor haya publicado una evaluacion posterior de ese proceso.

En cuanto a esta cuantizacion, el layout replica el de dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4: solo se cuantizan los expertos MoE enrutados (`mlp.experts.*.{gate,up,down}_proj`), con valores E2M1 empaquetados dos por byte, `weight_scale` en FP8 E4M3 por cada 16 elementos de entrada y `weight_scale_2` FP32 por tensor (`amax / (6 * 448)`). Es una cuantizacion estrictamente weight-only: no hay `input_scale` y `input_activations` es `null`, por lo que requiere una ruta W4A16 (Marlin o b12x W4A16) y no kernels W4A4 nativos. El proceso usa redondeo al mas cercano, sin calibracion, con un error relativo de aproximadamente el 9% en los tensores de expertos; los tensores no cuantizados son identicos bit a bit a los del modelo original. Los componentes MTP presentes permiten tecnicamente decodificacion especulativa, aunque el autor no documenta su uso en esta version.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline declarado confirman uso en dialogos multi-turno.
- Entrada multimodal image-text-to-text: el modulo de vision se conserva en BF16 sin cuantizar, por lo que la calidad de la torre visual es identica a la del modelo base.
- Razonamiento y generacion general: heredados del modelo base GLM-5.3-Flash; no cuantificados ni medidos en esta publicacion.
- Arquitectura MoE con enrutamiento de expertos: el modelo activa solo un subconjunto de expertos por token, pero el numero de parametros activos no esta disponible.
- Comportamiento sin rechazo: la abliteration elimina los mecanismos de negativa del modelo base, lo que es precisamente el objeto de estudio de esta variante.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Red teaming y evaluacion de alineamiento: el modelo permite estudiar como se comporta un MoE de gran escala cuando se le retiran las capas de rechazo, y usar esas respuestas para entrenar o validar clasificadores de seguridad y filtros de contenido, siempre en el marco de investigacion autorizada.
- Auditoria de cuantizacion NVFP4: comparar las salidas de esta version con las del FP8 y el BF16 del mismo modelo base permite medir el impacto real del error relativo del ~9% en los expertos sobre tareas concretas de generacion y de vision.
- Despliegue on-premise con presupuesto de VRAM ajustado: los 194,7 GB del repo permiten servir el modelo en 3x H100 80 GB o 2x H200 141 GB, algo inviable con los ~643 GB del BF16, y sin degradar atencion, vision ni routers.
- Analisis de documentos con componente visual: al mantenerse la torre de vision en BF16, el modelo sigue sirviendo para extraccion de informacion de diagramas, capturas de pantalla o formularios escaneados en pipelines image-text-to-text.
- Investigacion sobre sesgos y comportamientos de rechazo: la comparacion directa entre la variante abliterated y el modelo alineado original permite aislar que comportamientos dependen del alineamiento y cuales emergen del preentrenamiento.
- Validacion de stacks de inferencia W4A16: sirve como banco de pruebas para verificar que los kernels Marlin o b12x W4A16 de vLLM reproducen correctamente el layout modelopt antes de aplicarlo a otros modelos MoE.
- Base para experimentos de eficiencia en MoE: estudiar el equilibrio entre precision de expertos y calidad final en arquitecturas con enrutamiento disperso, dado que el resto del modelo permanece intacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la variante abliterated no ha sido evaluada por separado y que esta cuantizacion tampoco ha sido objeto de benchmarks. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas de perplexidad comparativas frente al BF16 o al FP8.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del repositorio (194,7 GB), no datos publicados por el autor.

- VRAM para pesos: aproximadamente 195 GB en NVFP4. Hay que anadir la cache KV y las activaciones, por lo que el presupuesto realista de VRAM se situa por encima de los 210-240 GB segun la longitud de contexto.
- GPU recomendadas: 3x H100 80 GB (240 GB) o 2x H200 141 GB (282 GB). Para margen comodo, 4x H100 80 GB. Se recomienda Hopper o Blackwell por el soporte de kernels NVFP4 y W4A16.
- Comparativa con otras precisiones: el BF16 original (~643 GB) exige 8x H100 80 GB al limite o 8x H200 141 GB; la version FP8 (~328 GB) cabe en 5x H100 80 GB o 3x H200 141 GB.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones habituales de 2x o 4x 24 GB. Harian falta al menos nueve GPU de 24 GB solo para los pesos, una configuracion poco practica y no soportada por los kernels de referencia.
- Opciones de despliegue: vLLM con ruta W4A16 MoE (Marlin o b12x W4A16) y soporte modelopt NVFP4; TensorRT-LLM con modelopt. No hay GGUF en este repositorio, por lo que llama.cpp, Ollama y LM Studio no son opciones directas. No deben usarse kernels W4A4 nativos, ya que el modelo no incluye `input_scale`.
- Latencia y throughput: no disponibles. Al ser una cuantizacion weight-only con activaciones en BF16, la ganancia esperada esta en el ahorro de memoria y de ancho de banda de pesos, no en aceleracion de calculo por tensor cores de baja precision.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pqhaz/apex-flash-1-abliterated-NVFP4 | 165,5B (safetensors) / 321B declarado | NVFP4 W4A16 | 194,7 GB | no disponible | MIT | 0 descargas, 0 likes |
| pqhaz/apex-flash-1-abliterated-FP8 | no disponible | FP8 | ~328 GB | no disponible | MIT heredada | publicado en HuggingFace |
| cantina-security/apex-flash-1-abliterated (base) | 321B declarado | BF16 | ~643 GB | no disponible | MIT | modelo base |
| dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4 | no disponible | NVFP4 W4A16 | no disponible | no disponible | no disponible | publicado en HuggingFace |

No se dispone de datos de rendimiento para ninguna de las variantes, por lo que la comparativa se limita a formato, tamano y disponibilidad.

## Limitaciones y advertencias

- Comportamiento sin alineamiento de rechazo: la abliteration degrada deliberadamente los mecanismos de seguridad del modelo base. El propio autor restringe su uso a investigacion en seguridad autorizada y desaconseja el despliegue en produccion orientado al publico.
- Ausencia total de evaluacion: ni la variante abliterated ni esta cuantizacion han sido evaluadas. No hay datos de calidad, coherencia ni regresiones frente al modelo original.
- Error de cuantizacion no medido: el error relativo del ~9% en los tensores de expertos es tipico de NVFP4, pero su efecto acumulado sobre tareas largas o de razonamiento no esta cuantificado. La cuantizacion es round-to-nearest sin calibracion.
- Discrepancia en el recuento de parametros: los safetensors indican 165,5B y la model card declara 321B para el base. Hay que resolver esta diferencia antes de planificar capacidad o costes.
- Requisitos de runtime estrictos: solo funciona con rutas W4A16 especificas. No hay GGUF ni soporte en llama.cpp u Ollama, y el uso de kernels W4A4 produce resultados incorrectos por la ausencia de `input_scale`.
- Licencia y tension juridica: el repositorio declara MIT heredada del modelo base, con copyright de Z.AI Co., Ltd, mientras que la model card menciona uso restringido a investigacion de seguridad autorizada. Conviene revisar el fichero LICENSE completo antes de cualquier uso comercial.
- Contexto e idiomas no declarados: no se puede garantizar soporte multilingue ni una ventana de contexto concreta sin consultar la documentacion del modelo base.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes de funcionamiento.
- Riesgo de alucinacion: heredado del modelo base y no medido en esta version.
- Falta de afiliacion: el autor declara no estar afiliado ni a Cantina Security ni a Z.AI, por lo que no hay soporte oficial ni garantias de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pqhaz/apex-flash-1-abliterated-NVFP4
- Modelo base: https://huggingface.co/cantina-security/apex-flash-1-abliterated
- Version FP8 del mismo autor: https://huggingface.co/pqhaz/apex-flash-1-abliterated-FP8
- Referencia de formato NVFP4: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
- Papers, blogs y demos: no disponibles en la informacion proporcionada.
